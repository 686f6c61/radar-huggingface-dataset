# infosave/dtgma-skills

## Resumen

DTG-MA skills es un artefacto de ajuste fino (denominado "skill") para el modelo Qwen3.5-0.8B, publicado por el usuario infosave bajo el identificador `infosave/dtgma-skills`. No se trata de un modelo base independiente, sino de un conjunto de ganancias por fila entrenadas sobre un modelo congelado y cuantizado, que se aplican mediante el motor `cortiq` para especializar el modelo en tareas concretas. El autor lo presenta como una alternativa a los adaptadores LoRA con una reducción de tamano de aproximadamente 25 veces (1,7 MB frente a 43,3 MB) manteniendo una precision declarada al nivel de LoRA.

La tecnica subyacente, Dynamic Task-Guided Mask Activation (DTG-MA), consiste en entrenar una compuerta σ(m) por cada fila de salida de cada proyeccion (o por cada neurona de la FFN) del modelo base, que permanece congelado y cuantizado. El fichero de skill solo almacena esos numeros (399.936 para Qwen3.5-0.8B), y al aplicarlo se multiplica cada fila del base por su ganancia y se recodifica con el codec propio del base, de modo que el resultado conserva el tamano y la velocidad del modelo original sin productos matriciales adicionales en tiempo de inferencia.

El interes actual del artefacto reside en su propuesta de compresion extrema para especializacion de modelos pequenos en entornos locales, con soporte de multiples modos de aplicacion (fusion, overlay, enrutado por peticion, mezcla y conmutacion dinamica) y una variante de mascara dura que reduce el modelo por debajo del base. El metodo esta sujeto a una solicitud de patente estadounidense (No. 19/452.464, presentada el 19 de enero de 2026) y el codigo abierto de `cortiq` cubre solo parte del mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ganancias por fila (compuertas σ(m)) sobre proyecciones o neuronas FFN de un transformer congelado (Qwen3.5-0.8B) |
| Parametros totales | 399.936 ganancias entrenables para Qwen3.5-0.8B (el modelo base no se modifica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B; no especificada en la informacion) |
| Tipos de cuantizacion | El base se convierte con `--quant q8_2f`; el skill se re-encoda en el codec propio del base |
| Idiomas soportados | en, ru, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.skill.cmf` (fichero de skill) y `.cmf` (modelo base y modelos fusionados/overlay); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El metodo DTG-MA parte de un modelo base congelado y cuantizado cuyos pesos nunca cambian. Para una tarea concreta se entrena una compuerta escalar por cada fila de salida de cada proyeccion (`--mask-scope linear`) o por cada neurona de la FFN (`--mask-scope ffn`), es decir, un unico numero por fila. El fichero de skill conserva exclusivamente esas ganancias: 399.936 valores para Qwen3.5-0.8B, que ocupan 1,7 MB. Al aplicar el skill, cada fila del base se multiplica por su ganancia y se recodifica con el codec nativo del base.

El proceso de entrenamiento (`cortiq skill bake`) se ejecuta sobre GPU NVIDIA con `CMF_GPU=cuda` y consume ficheros de chat con registros system/user/assistant; la perdida y la precision en validacion cuentan solo la respuesta situada tras el marcador `--answer-after`. Los hiperparametros documentados incluyen `--mask-init 2.0`, `--lr-a 0.1`, `--lin-l1 0.02`, `--through-attn`, `--steps-a 750`, `--batch 8`, `--soft-fold` y `--no-defrag`. El autor menciona dos fases de entrenamiento (phase-a y steps-b), aunque en el ejemplo publicado `--steps-b` se fija a 0. No se detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizado.

El skill incorpora claves de identidad del base exacto contra el que fue cortado, de forma que `skill apply` rechaza un base distinto o recuantizado en lugar de generar una combinacion silenciosa. Existen cinco modos de aplicacion: fusion en el modelo (especialista autonomo con el tamano y velocidad del base), overlay (un base con multiples skills como `skill.<id>.*`, unos 490 MB adicionales para un skill de todas las proyecciones junto al base de 796 MB), servidor con un skill por peticion mediante politica de enrutado con carriles y cache KV independientes, mezcla (`--blend auto`) y conmutacion dinamica a mitad de generacion (`--route-dynamic`), y mascara dura sin `--soft-fold`, que cierra neuronas y desfragmenta el fichero para obtener un modelo mas pequeno y rapido que el base.

## Capacidades

- Especializacion por tarea sobre Qwen3.5-0.8B: el skill transfiere al base la capacidad aprendida en tareas concretas como resolucion de ecuaciones diferenciales lineales o clasificacion de emociones en seis clases.
- Generacion de texto y razonamiento dentro de las capacidades heredadas del modelo base Qwen3.5-0.8B.
- Clasificacion y etiquetado: el ejemplo de emociones produce respuestas de una palabra con una precision declarada del 92,6 %.
- Aplicacion selectiva por peticion: el modo servidor permite elegir skill segun el ultimo mensaje del usuario, con margen configurable frente al base.
- Conmutacion en mitad de generacion: `--route-dynamic` cambia el skill activo cuando el contexto lo requiere, con traza opcional (`--trace`).
- Mascara dura: genera especialistas mas pequenos y rapidos que el base (705 MB frente a 733 MB, 89,7 frente a 86,0 tokens/s en el ejemplo de texto tecnico en ruso).
- Soporte multilingue limitado a los idiomas declarados: ingles, ruso y chino.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Especializacion local de bajo coste: convertir un Qwen3.5-0.8B generico en un asistente experto en un dominio concreto (por ejemplo, ecuaciones diferenciales) sin duplicar el modelo ni anadir adaptadores en tiempo de ejecucion, gracias a un fichero de 0,38 MB.
- Clasificacion de sentimiento y emociones en produccion: desplegar un clasificador de seis clases con precision declarada del 92,6 % sobre un base de 796 MB, adecuado para procesar volumen alto de mensajes en local.
- Servidor multi-skill con enrutado: mantener una estanteria de skills sobre un unico base y dejar que la politica del fichero elija por peticion, con carriles y cache KV separados, util para plataformas que atienden varias tareas especializadas con una sola instancia.
- Reduccion de huella en dispositivos con recursos limitados: la mascara dura produce especialistas mas pequenos y rapidos que el base (705 MB y 89,7 tokens/s frente a 733 MB y 86,0 tokens/s), apropiado para equipos con 12 GB de VRAM o menos.
- Procesamiento de texto tecnico en ruso: el ejemplo documentado de especialista en texto tecnico en ruso con perplejidad reducida un 14,7 % en texto reservado sirve para pipelines de documentacion o traduccion tecnica.
- Investigacion sobre compresion de ajuste fino: el artefacto permite reproducir la comparacion frente a LoRA con el mismo numero de pasos y la misma perdida, util para estudiar alternativas de bajo rango y enmascaramiento de filas.
- Despliegue por conmutacion dinamica: en asistentes conversacionales que cambian de dominio a mitad de dialogo, `--route-dynamic` permite alternar el skill activo sin reiniciar la sesion.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan el skill con LoRA r=16 sobre Qwen3.5-0.8B, ambos entrenados con los mismos registros, el mismo orden, el mismo numero de pasos y la misma perdida, sobre una RTX 3060 de 12 GB.

| Tarea | Base | Skill cortiq (1,7 MB) | LoRA r=16 (43,3 MB) |
|---|---:|---:|---:|
| Ecuaciones diferenciales, coeficientes vistos (100 problemas) | 0/100 | 100/100 | 100/100 |
| Ecuaciones diferenciales, coeficientes nuevos (100 problemas) | 0/100 | 96/100 | 100/100 |
| Emociones (dair-ai/emotion), respuesta de una palabra, accuracy | 53,3 % | 92,6 % | 92,5 % |
| Emociones, balanced accuracy | no disponible | no disponible | no disponible |

En el ejemplo de mascara dura para texto tecnico en ruso: 705 MB frente a 733 MB del base, 89,7 frente a 86,0 tokens/s y una reduccion de perplejidad del 14,7 % en texto reservado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El entrenamiento del skill (`cortiq skill bake`) requiere una GPU NVIDIA con `CMF_GPU=cuda`; el ejemplo publicado se ejecuto en una RTX 3060 de 12 GB.
- Un skill fusionado o en overlay se ejecuta en cualquier backend soportado por `cortiq`, incluido CPU, segun la documentacion del autor.
- El base Qwen3.5-0.8B en cuantizacion `q8_2f` ocupa 796 MB; un especialista con mascara dura puede bajar a 705 MB.
- Un overlay con un skill de todas las proyecciones anade unos 490 MB junto al base de 796 MB, por lo que una estanteria de skills requiere planificar el almacenamiento.
- Cabe en GPU de consumo: el ejemplo de referencia usa una RTX 3060 de 12 GB; no se especifican requisitos para otras GPU (A100, H100, RTX 4090).
- Opciones de despliegue: `cortiq` (CLI y modo `serve`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 89,7 tokens/s para el especialista con mascara dura frente a 86,0 tokens/s del base en el ejemplo publicado; no se aportan mas cifras.

## Comparativa con modelos similares

| Criterio | DTG-MA skill | LoRA r=16 | Modelo base Qwen3.5-0.8B |
|---|---|---|---|
| Parametros entrenables | 399.936 ganancias | 10,8 M | no aplica (congelado) |
| Tamano del artefacto | 1,7 MB (0,38 MB en una tarea) | 43,3 MB | 796 MB (q8_2f) |
| Precision en ecuaciones diferenciales (nuevos) | 96/100 | 100/100 | 0/100 |
| Precision en emociones | 92,6 % | 92,5 % | 53,3 % |
| Coste en inferencia | Ninguno adicional (se pliega en el base) | Adaptador en tiempo de ejecucion | Referencia |
| Formato | `.skill.cmf` / `.cmf` | Safetensors (PyTorch) | `.cmf` |
| Licencia | apache-2.0 | apache-2.0 (heredada) | no disponible en la informacion |
| Motor | cortiq | PyTorch / ecosistema estandar | cortiq |

No se dispone de datos para comparar con otros metodos de ajuste eficiente (QLoRA, adaptadores de bajo rango alternativos) en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto depende de un base exacto: `skill apply` rechaza un base distinto o recuantizado, por lo que no es portable entre versiones o cuantizaciones de Qwen3.5-0.8B.
- El metodo esta cubierto por una solicitud de patente estadounidense en tramite (No. 19/452.464); el codigo abierto de `cortiq` cubre solo parte del metodo, lo que puede afectar a reimplementaciones independientes.
- La licencia apache-2.0 del repositorio no aclara por si sola los derechos sobre el metodo patentado; conviene revisar `PATENTS.md` antes de un uso comercial.
- Solo se declaran los idiomas ingles, ruso y chino; el rendimiento en castellano no esta documentado.
- No se especifica la longitud de contexto efectiva del skill; se hereda del base, pero no se confirma en la informacion.
- El fichero del repositorio ocupa 0,0 GB y no se indica el contenido exacto empaquetado; las descargas y likes son cero, por lo que no hay evidencia de uso en produccion.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- El entrenamiento requiere GPU NVIDIA y el ejemplo usa hiperparametros concretos; no se documenta la sensibilidad a los mismos ni la reproducibilidad completa.
- El modo overlay incrementa el almacenamiento en unos 490 MB por skill de todas las proyecciones, lo que puede ser relevante en despliegues con muchos skills.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/infosave/dtgma-skills
- Motor cortiq (repositorio): https://github.com/infosave2007/cmf
- Documentacion de skills: https://github.com/infosave2007/cmf/blob/master/docs/SKILLS.md
- Aviso de patentes: https://github.com/infosave2007/cmf/blob/master/PATENTS.md
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de emociones citado: dair-ai/emotion (no se proporciona URL directa en la informacion)

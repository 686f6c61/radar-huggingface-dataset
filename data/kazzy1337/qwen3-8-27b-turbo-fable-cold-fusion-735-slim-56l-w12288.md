# kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-56L-w12288

## Resumen

El modelo `kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-56L-w12288` es un checkpoint publicado en Hugging Face por el usuario kazzy1337, derivado de la familia Qwen (la etiqueta de arquitectura del repositorio es `qwen3_5`). Segun la model card, se trata de un modelo "healed" (sanado) obtenido mediante destilacion a partir de su modelo original, generado con una herramienta llamada ND Lore Forge, cuyo proposito declarado es "adelgazar o hacer crecer un modelo" (slim or grow). El nombre del repositorio codifica varias decisiones de esa manipulacion: un supuesto tamano nominal de 27B, un recorte a 56 capas ("56L") y una anchura de 12288 ("w12288").

El dato mas relevante y el unico verificable con certeza es el recuento real de parametros en los ficheros safetensors: 19.908.559.792 parametros (aproximadamente 19,9 mil millones), muy por debajo de los 27B que sugiere el nombre. El repositorio ocupa 39,8 GB, lo que es coherente con pesos en precision de 16 bits para ese numero de parametros. No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens, el contexto maximo, los idiomas soportados ni resultados de evaluacion.

La relevancia de esta ficha es fundamentalmente instrumental: sirve como ejemplo de checkpoint derivado de Qwen modificado estructuralmente por herramientas de terceros, con licencia Apache 2.0 declarada pero sin documentacion tecnica que permita validar su comportamiento. Para cualquier uso en produccion debe tratarse como un modelo no evaluado y de procedencia incierta en cuanto a calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta de libreria `qwen3_5`; variante estructural no documentada) |
| Parametros totales | 19.908.559.792 (segun safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `qwen3_5` y del nombre del repositorio, que indica 56 capas y una dimension de modelo de 12288. Esto sugiere un transformer decoder-only con attention por capas apiladas, pero no se especifica si emplea attention completa, attention lineal o un esquema hibrido, ni el tipo de normalizacion, las dimensiones de las cabezas de attention ni el vocabulario. El recuento de 19,9 mil millones de parametros con 56 capas y anchura 12288 es internamente plausible para un transformer denso con FFN de expansion moderada, pero no se puede reconstruir la configuracion exacta sin el fichero `config.json`.

En cuanto al entrenamiento, la model card afirma que el modelo fue "ensenado por su modelo original (destilacion)" y que se genero con ND Lore Forge, con los detalles en `ndforge_reshape.json`. No se publica el numero de tokens de destilacion, la composicion del dataset, si hubo RLHF, DPO o ajuste supervisado, ni las capacidades del modelo profesor. Tampoco se documenta el procedimiento de "healing" aplicado tras el recorte de capas y el cambio de anchura, que en la practica suele implicar un reentrenamiento parcial para recuperar coherencia tras una cirugia estructural. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion con ventana deslizante.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperable por herencia de la familia Qwen, pero no verificada ni documentada en la model card.
- Razonamiento y matematicas: no disponible; no se han publicado evaluaciones.
- Generacion de codigo: no disponible; no se han publicado evaluaciones.
- Tool calling / function calling: no disponible; no se declara soporte de plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre cirugia de modelos: el checkpoint permite estudiar el efecto de recortar capas y modificar la anchura en un modelo de la familia Qwen, comparando su comportamiento con el modelo original mediante perplejidad en un corpus de validacion propio.
- Experimentos de destilacion: dado que la model card declara destilacion desde un modelo profesor, sirve como caso de estudio para analizar como se transfieren capacidades a un alumno con menos parametros efectivos.
- Evaluacion de herramientas de terceros: util para auditar que produce ND Lore Forge en terminos de ficheros de configuracion, tokenizador y pesos, antes de adoptar la herramienta en un pipeline interno.
- Pruebas de robustez y alucinacion: al no existir evaluaciones publicadas, un equipo puede usarlo como sujeto de pruebas de calidad frente a checkpoints Qwen oficiales y documentar la degradacion observada.
- Despliegue en hardware de gama alta para inferencia experimental: con unos 19,9 mil millones de parametros, cabe en una GPU de 80 GB en fp16 y en GPUs de 24 GB con cuantizacion, lo que permite probarlo en estaciones de trabajo sin clústeres dedicados.
- Base para ajuste fino ligero: al estar en safetensors y con licencia Apache 2.0, puede servir como punto de partida para LoRA o QLoRA en tareas concretas, siempre que una evaluacion previa confirme que el modelo base genera texto coherente.
- Docencia y demostraciones: util en cursos sobre ciclo de vida de modelos abiertos para ilustrar los riesgos de checkpoints sin model card tecnica ni benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 40 GB solo para pesos (39,8 GB de repositorio), mas overhead de KV cache y activaciones; en la practica requiere 48-80 GB.
- VRAM estimada en int8: en torno a 20-22 GB para pesos, con overhead adicional.
- VRAM estimada en int4: en torno a 11-13 GB para pesos, con overhead adicional.
- GPU recomendadas para fp16: A100 80 GB, H100 80 GB, H200, o dos GPU de 48 GB con tensor parallelism.
- GPU consumer: no cabe en fp16 en una RTX 4090 (24 GB); con cuantizacion int4 podria caber en RTX 4090, RTX 3090 y RTX 4080 de 16 GB, sujeto a que la arquitectura modificada sea compatible con los kernels disponibles.
- Opciones de despliegue: no hay confirmacion de soporte en vLLM, TGI, llama.cpp u Ollama; dado que solo se publican safetensors y la arquitectura esta etiquetada como `qwen3_5`, la compatibilidad con herramientas estandar no esta garantizada y requeriria verificar el `config.json` y el tokenizador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-56L-w12288 | 19,9B (reales) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint derivado sin benchmarks ni model card tecnica |
| Qwen2.5-14B | 14,7B | 32.768 tokens (128K con RoPE scaling) | Apache 2.0 (mayoria de variantes) | Hugging Face, ampliamente adoptado | Modelo oficial con evaluaciones publicadas |
| Qwen2.5-32B | 32,5B | 32.768 tokens (128K con RoPE scaling) | Apache 2.0 | Hugging Face, ampliamente adoptado | Modelo oficial, referencia natural por tamano nominal |
| Mistral-Small-24B | 23,6B | 32.768 tokens (128K en versiones posteriores) | Apache 2.0 | Hugging Face | Alternativa densa de tamano comparable con soporte de tool calling documentado |

La comparacion es aproximada: los datos de los modelos oficiales provienen de sus model cards publicas, mientras que del checkpoint de kazzy1337 solo se conoce el recuento de parametros. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni evaluacion de perplejidad, ni pruebas de calidad publicadas; no se puede afirmar que el modelo genere texto coherente tras la cirugia estructural y la destilacion.
- Procedencia y reproducibilidad: la model card remite a `ndforge_reshape.json`, pero no se documenta el modelo profesor, el dataset de destilacion ni el procedimiento de "healing", por lo que el resultado no es reproducible.
- Discrepancia entre nombre y parametros: el nombre indica 27B y los safetensors contienen 19,9B; conviene no fiarse de la nomenclatura para planificar recursos.
- Compatibilidad de despliegue incierta: la etiqueta `qwen3_5` no corresponde necesariamente a una arquitectura reconocida por vLLM, TGI o llama.cpp; es probable que requiera adaptaciones o que no cargue directamente.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de otros idiomas sin pruebas.
- Riesgo de alucinacion y sesgos: no evaluado; al ser un derivado destilado de un modelo Qwen, hereda potencialmente los sesgos del original, pero la modificacion estructural puede amplificarlos de forma impredecible.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; la responsabilidad de validar el comportamiento recae en quien despliega el modelo.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario ni informes de errores.
- Fecha de creacion futura respecto a la mayoria de referencias disponibles (2026-11-21), lo que refuerza la necesidad de tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/kazzy1337/qwen3.8-27b-turbo-fable-cold-fusion-735-slim-56L-w12288
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.

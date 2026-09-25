# junbrro/egopi-axis1-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925

## Resumen

`junbrro/egopi-axis1-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925` es un checkpoint de pesos publicado en HuggingFace por el usuario `junbrro`. Se trata de un artefacto de investigacion, no de un modelo listo para produccion: la model card lo describe como "Arm 1 no-reg tokenizer CogAlign persistent full language", correspondiente al paso 30.000 de un entrenamiento cuya ejecucion de origen se identifica como `junhyeong-axis1-noreg-full-30k-260924`. El repositorio incluye unicamente pesos y configuracion finales, sin estado del optimizador ni de RNG.

El modelo tiene 6.915.102.808 parametros (unos 6,92 mil millones) y ocupa 13,9 GB en el repositorio, lo que es coherente con pesos almacenados en precision de 16 bits. El unico tag de familia que aparece es `RLDX-1`, y el resto de la metadata publica (licencia, idiomas, pipeline, arquitectura) no esta declarada. La model card menciona un "action tokenizer" empaquetado en un directorio `actlat/`, lo que sugiere que el entrenamiento incorpora un componente de tokenizacion orientado a acciones, aunque no se especifica su funcionamiento.

Su relevancia actual es limitada y de caracter experimental: es un punto dentro de una serie de ablaciones (el autor publica variantes "axis1" y "axis2") y sirve como material de estudio para quien quiera reproducir o auditar una configuracion concreta. No hay descargas ni likes, no se ha publicado evaluacion alguna y la propia model card advierte de que "completar el entrenamiento no establece rendimiento de rollout". Cualquier uso requiere remapear las rutas de assets del cluster de origen antes de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de familia es `RLDX-1`; la model card no describe la arquitectura) |
| Parametros totales | 6.915.102.808 (6,92 mil millones), dato extraido de los safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; el tamano de 13,9 GB sugiere pesos en 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Directorio adicional | `actlat/` (action tokenizer, segun la model card) |
| Paso de entrenamiento | 30.000 (final) |
| Ejecucion de origen | `junhyeong-axis1-noreg-full-30k-260924` |
| Contenido del repo | pesos finales y configuracion; sin estado del optimizador ni de RNG |
| Tamano del repositorio | 13,9 GB |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo. La model card no incluye descripcion de capas, mecanismo de atencion, tipo de normalizacion ni objetivos de entrenamiento. El unico identificador de familia es el tag `RLDX-1`, que no viene acompanado de documentacion en el repositorio ni en los resultados de busqueda disponibles. Tampoco se declara si se trata de un transformer denso convencional, de una variante MoE o de una arquitectura hibrida, por lo que no es posible confirmar compatibilidad con runtimes estandar de inferencia.

A partir de la nomenclatura del identificador pueden hacerse unicamente inferencias no verificadas: `noreg` apuntaria a una configuracion sin regularizacion, `actsilu` a un uso de activaciones SiLU, `FULL` a un objetivo de modelado de lenguaje completo frente a variantes ablacionadas, `30k` al numero de pasos y `CogAlign` a algun componente de alineacion. Ninguna de estas lecturas esta confirmada por el autor, que solo declara que la configuracion original se ha preservado "incluyendo rutas del cluster de origen". No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste posterior al preentrenamiento.

## Capacidades

- Generacion de texto: no confirmada de forma explicita; el nombre "full language" en la model card sugiere un objetivo de modelado de lenguaje, pero no hay evaluacion que lo respalde.
- Tokenizacion de acciones: la model card indica que el directorio `actlat/` contiene el "action tokenizer" cuando aplica, lo que apunta a un pipeline con representacion de acciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible. La advertencia sobre "rendimiento de rollout" en la model card es el unico indicio de un posible uso en entornos secuenciales o interactivos, sin detalle adicional.
- Ajuste fino posterior: no disponible.

## Casos de uso

Dado que no existe ninguna evaluacion publicada, los siguientes escenarios se plantean como posibles lineas de trabajo sobre el checkpoint, no como capacidades verificadas. En todos los casos es imprescindible remapear las rutas de assets del cluster de origen antes de ejecutar el modelo.

- Auditoria y reproduccion de ablaciones: el checkpoint corresponde a un brazo concreto ("Arm 1 no-reg") de una serie experimental; puede usarse para comparar configuraciones frente a sus hermanos (`axis2-adaln-only-AB-30k`) midiendo perplejidad sobre un corpus fijo propio.
- Investigacion sobre tokenizacion de acciones: el directorio `actlat/` permite estudiar como se representa el espacio de acciones y como se integra con el modelo de lenguaje, en un contexto de laboratorio.
- Base para ajuste fino supervisado: al distribuirse pesos y configuracion sin estado del optimizador, es un punto de partida limpio para SFT sobre dominios acotados, siempre que se confirme que el runtime soporta la arquitectura.
- Evaluacion comparativa de estrategias de regularizacion: al existir variantes con y sin regularizacion en la misma familia, sirve para disenar experimentos controlados sobre el efecto de `noreg` en la estabilidad del entrenamiento.
- Analisis de estabilidad de checkpoints tardios: el modelo esta guardado en el paso 30.000; puede usarse para estudiar deriva de pesos, saturacion de metricas o colapso de representaciones en fases avanzadas del entrenamiento.
- Pruebas de compatibilidad de tooling: dado que la arquitectura no esta declarada, es un caso de prueba util para verificar si los cargadores estandar (transformers, vLLM, llama.cpp) pueden ingerir la configuracion preservada.
- Docencia y formacion tecnica: sirve como ejemplo de repositorio de investigacion con metadata incompleta, para ilustrar buenas practicas de documentacion de model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, la model card no menciona MMLU, HumanEval, GSM8K ni ninguna otra prueba, y la busqueda web no aporta resultados de terceros. La unica afirmacion cualitativa del autor es que "completar el entrenamiento no establece rendimiento de rollout", es decir, una advertencia explicita de que no debe asumirse ningun nivel de rendimiento.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de 6.915.102.808 parametros. No incluyen memoria para cache KV, cuyo tamano depende de una configuracion de atencion que no se ha publicado.

- VRAM para los pesos en FP32: aproximadamente 27,7 GB.
- VRAM para los pesos en BF16/FP16: aproximadamente 13,8 GB, consistente con el tamano de repositorio de 13,9 GB.
- VRAM para los pesos en INT8: aproximadamente 6,9 GB.
- VRAM para los pesos en INT4: aproximadamente 3,5 GB.
- GPU de datacenter: A100 (40 GB y 80 GB) y H100 permiten inferencia en 16 bits con holgura para cache KV moderada.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en 16 bits dejando poco margen para contexto largo; en RTX 4080 (16 GB) requiere cuantizacion de 8 bits; en RTX 3060 (12 GB) y similares exige 4 bits.
- Opciones de despliegue: no disponibles de forma fiable. vLLM, llama.cpp, Ollama y TGI asumen arquitecturas conocidas y configuraciones completas; como la model card advierte que se deben remapear rutas del cluster de origen y no documenta la arquitectura, la compatibilidad con estos runtimes no esta garantizada y debe verificarse antes de planificar cualquier despliegue.
- Latencia y throughput: no disponibles, ni publicados ni estimables sin conocer la arquitectura y la longitud de contexto.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion solo puede establecerse a nivel de escala de parametros y disponibilidad. Los datos de la columna de alternativas corresponden a informacion publica ampliamente conocida de cada proyecto; los de la primera columna proceden de la metadata del repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| egopi-axis1-matched-noreg (este modelo) | 6,92 mil millones | no disponible | no disponible | safetensors, 13,9 GB |
| Mistral 7B | 7,3 mil millones | 32.000 tokens | Apache 2.0 | safetensors y GGUF |
| Llama 3.1 8B | 8,0 mil millones | 128.000 tokens | licencia comunitaria de Llama 3.1 | safetensors y GGUF |
| Qwen2.5 7B | 7,6 mil millones | 128.000 tokens | Apache 2.0 | safetensors y GGUF |

La diferencia relevante no es de tamano sino de madurez: las tres alternativas declaran licencia, contexto y arquitectura, y cuentan con soporte amplio en runtimes de inferencia. Este checkpoint no ofrece ninguna de esas garantias, esta en el paso 30.000 de una ejecucion de investigacion y no registra descargas ni evaluaciones.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no existe ningun benchmark publicado, ni propio ni de terceros, que permita estimar la calidad de las salidas.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permisos de uso comercial. En ausencia de terminos explicitos, el uso en produccion es juridicamente arriesgado.
- Arquitectura sin documentar: no se describen capas, atencion, tokenizador ni objetivo de entrenamiento, lo que impide anticipar compatibilidad con herramientas estandar.
- Riesgo alto de alucinacion no medido: sin evaluaciones de fidelidad ni de factualidad, no hay base para confiar en las salidas en contextos sensibles.
- Idiomas no declarados: se desconoce que lenguas cubre el entrenamiento y con que calidad, incluido el castellano.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que dependan de ventanas largas.
- Configuracion no portable: la model card indica que la configuracion preserva rutas del cluster de origen y que hay que remapearlas antes de usar el modelo. Sin ese trabajo previo, la carga fallara.
- Estado del optimizador y de RNG ausente: no se puede reanudar el entrenamiento ni reproducir exactamente la trayectoria; solo sirve para inferencia o para reiniciar un ajuste desde cero.
- Advertencia explicita del autor: "completar el entrenamiento no establece rendimiento de rollout". El hecho de haber llegado al paso 30.000 no implica que el modelo funcione en entornos interactivos.
- Natureza experimental: forma parte de una serie de ablaciones (variantes `axis1` y `axis2`), lo que sugiere que su proposito es comparativo y no de despliegue.
- Trazabilidad limitada: sin paper, blog tecnico ni repositorio de codigo asociado en los resultados disponibles.
- Cadena de dependencia del tokenizador de acciones: si el pipeline requiere `actlat/`, cualquier despliegue debe gestionar ese componente adicional, cuya interfaz no esta documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-axis1-matched-noreg-AB-FULL-30k-actsilu-mlxp-20260925
- Modelo hermano de la misma serie (axis2, AdaLN-only): https://huggingface.co/junbrro/egopi-axis2-adaln-only-AB-30k-actsilu-mlxp-20260921
- Catalogo de modelos del autor en un indice de terceros: https://essamamdani.com/ai-models/company/junbrro
- Paper, blog tecnico o repositorio de codigo: no disponibles en la informacion consultada.

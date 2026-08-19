# hemlang/Hemlock-Qwen3.8-27B

## Resumen

Hemlock-Qwen3.8-27B es un modelo de lenguaje y vision (vision-language) de 27.800 millones de parametros desarrollado por el usuario hemlang, especializado en la generacion de codigo en el lenguaje de programacion Hemlock. Se construye como una fusion (merge) del modelo base DragonBophades/WichtelHui-Qwen3.8-27B-SLERP con un adaptador LoRA entrenado especificamente sobre un dataset de instrucciones Hemlock. El resultado es un modelo que resuelve el problema de que los modelos Qwen3.8 generan codigo con sintaxis de Rust o C cuando se les pide Hemlock, produciendo fallos de ejecucion en 32 de 38 tareas del benchmark HemBench; tras el adaptador, el modelo pasa a superar 33 de 38 tareas.

La relevancia actual de este modelo reside en que es el primero que alcanza una puntuacion superior al 86 % en HemBench, un benchmark que ejecuta codigo generado y lo compara contra la salida esperada. Ademas, al estar basado en la linea Qwen3.8-27B, hereda capacidades multimodales nativas (entrada de imagen y video), un contexto de 262K tokens y licencia Apache 2.0, lo que lo hace util tanto para generacion de codigo especializado como para tareas generales de razonamiento multimodal. Su linaje es mixto: el modelo base WichtelHui es una interpolacion SLERP 50/50 entre un derivado de Qwen3.6 y un derivado abliterado de Qwen3.8, por lo que el comportamiento final no es el de un Qwen3.8 puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con encoder de vision (linea Qwen3.8-27B, 64 capas) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (heredado del base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (solo pesos bfloat16 en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de DragonBophades/WichtelHui-Qwen3.8-27B-SLERP, que a su vez es una interpolacion SLERP al 50 % entre Wichtel-Qwen3.6-27B (linea Qwen3.6) y Huihui-Qwen3.8-27B-abliterated (linea Qwen3.8). Sobre este base se entrena un adaptador LoRA con r=32, alpha=64, 2 epocas, learning rate 2e-4 y max_length 2048, utilizando el dataset hemlang/Hemlock-SFT-combined con 5.852 filas procedentes de tres fuentes SFT de Hemlock, excluyendo 150 filas solapadas con HemBench para evitar medir memoria en lugar de generalizacion. El adaptador se fusiona directamente en los pesos del modelo base.

La arquitectura conserva intactos los componentes de vision (333 tensores `visual.*`) y de prediccion multi-token MTP (15 tensores `mtp.*`), con un total de 1.199 tensores; el adaptador solo modifica las proyecciones de atencion y MLP, mientras que el resto de pesos se copian sin cambios del base. El modelo soporta un modo de razonamiento (thinking) que debe desactivarse para generacion de codigo, ya que de lo contrario agota el presupuesto de tokens pensando sin emitir salida.

## Capacidades

- Generacion de codigo en el lenguaje de programacion Hemlock, con alta precision sobre HemBench (33/38, pass@1 de 0,816).
- Comprension multimodal de imagenes y video gracias al encoder de vision heredado de Qwen3.8-27B (pipeline image-text-to-text).
- Razonamiento general de sentido comun: 66,22 % en ARC-Challenge (299 tareas, logprob sumado, sin muestreo), superando al base sin adaptador (60,54 %) y al Qwen3.8-27B puro (52,84 %).
- Modo de razonamiento (thinking) integrado, aunque debe desactivarse para tareas de generacion de codigo Hemlock.
- Prediccion multi-token (MTP) intacta, que puede mejorar el throughput en inferencia.
- Capacidades conversacionales y de agente heredadas de la linea Qwen3.8-27B, incluyendo soporte para flujos de trabajo agénticos y automatizacion de oficina.
- Seguridad reforzada respecto al padre abliterado: el SLERP con un padre con seguridad intacta restaura los rechazos en las pruebas de seguridad (2/2 en safety_control) manteniendo 18/18 en ccp_truth.

## Casos de uso

- Generacion de codigo Hemlock en produccion: el modelo puede integrarse en pipelines CI/CD para generar modulos Hemlock validos y ejecutables, reduciendo el tiempo de desarrollo en proyectos que usen este lenguaje. Su precision del 86,8 % en HemBench lo hace adecuado para entornos donde se requiere codigo que compile y produzca la salida esperada.
- Migracion de codigo desde otros lenguajes a Hemlock: dado que el modelo conoce la sintaxis de Rust, C y otros lenguajes por su linaje Qwen, puede traducir fragmentos de codigo existentes a Hemlock, evitando los fallos de sintaxis que presentan los Qwen3.8 sin adaptar.
- Asistente de desarrollo para el ecosistema Hemlock: integrable en IDEs o herramientas de chat como asistente contextual que completa, revisa y explica codigo Hemlock, con la ventaja de que sus sugerencias son ejecutables y verificables.
- Analisis de imagenes con generacion de codigo asociado: gracias a su encoder de vision, puede recibir capturas de pantalla o diagramas y generar codigo Hemlock que implemente la logica representada, util en automatizacion de interfaces o documentacion tecnica.
- Agentes autonomos que generan y ejecutan codigo: el modelo puede actuar como motor de un agente que recibe una tarea, genera codigo Hemlock, lo ejecuta contra un interprete y ajusta la salida en funcion de los errores, gracias a su capacidad de razonamiento multi-paso y su pipeline multimodal.
- Automatizacion de tareas de oficina: heredando las capacidades de Qwen3.8-27B para office automation, puede procesar documentos, extraer informacion de imagenes y generar scripts Hemlock para procesamiento de datos, todo en un unico modelo.
- Educacion y formacion en Hemlock: como herramienta de aprendizaje, el modelo puede generar ejemplos correctos, explicar la sintaxis del lenguaje y corregir errores de estudiantes, con la garantia de que el codigo generado es funcional.

## Benchmarks y rendimiento

El modelo se evalua principalmente con HemBench, un benchmark propio de 38 tareas que ejecuta el codigo Hemlock generado y lo compara contra la salida esperada, con thinking desactivado. Tambien se reporta ARC-Challenge como medida de capacidad general.

| Benchmark | Hemlock-Qwen3.8-27B | WichtelHui (base, sin adaptador) | Qwen3.8-27B | Wichtel-Qwen3.6-27B |
|---|---|---|---|---|
| HemBench (38 tareas, 3 muestras por tarea) | 33/38 (86,8 %), pass@1 0,816 | 22/38 | 4/38 | 29/38 |
| ARC-Challenge (299 tareas, logprob sumado) | 66,22 % | 60,54 % | 52,84 % | no disponible |

Notas de precision: HemBench se muestrea a temperatura 0,2 con 3 generaciones por tarea (114 generaciones en total); una ejecucion con una sola muestra del mismo modelo obtuvo 29/38, por lo que diferencias de 2-3 tareas entre modelos deben tratarse como ruido a menos que se midan con el mismo protocolo. Los fallos del modelo final son 4 salidas incorrectas y 1 error en tiempo de ejecucion. En seguridad, el modelo hereda del base WichtelHui: 18/18 en ccp_truth, 2/2 en safety_control (rechaza ambas sondas), 3/3 en capability y 3/4 en ccp_truth_neutral.

## Requisitos de hardware

- Los pesos en bfloat16 ocupan 55,6 GB, por lo que la inferencia sin cuantizar requiere aproximadamente 60-70 GB de VRAM considerando cache KV y activaciones. Es viable en una A100 80GB, H100 80GB o similar.
- Con cuantizacion de 8 bits (estimada en ~28 GB de pesos), cabria en una RTX A6000 48GB o en configuraciones con 2x RTX 4090 mediante tensor parallelism.
- Con cuantizacion de 4 bits (estimada en ~14 GB de pesos), podria ejecutarse en una RTX 4090 24GB o RTX 3090 24GB, aunque no se publican versiones cuantizadas oficiales del modelo.
- No caben en GPUs de consumo de 8-12 GB sin cuantizacion agresiva (2-3 bits), que degradaria significativamente la calidad de generacion de codigo.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` (soportado oficialmente), Hugging Face Inference Endpoints (el modelo tiene la etiqueta `endpoints_compatible`), y probablemente vLLM y TGI dado el formato safetensors y la arquitectura Qwen, aunque no esta confirmado en la documentacion.
- Para generacion de codigo Hemlock se recomienda desactivar el modo thinking; en caso contrario el modelo agota el presupuesto de tokens sin emitir salida, lo que incrementa la latencia efectiva de forma significativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HemBench | ARC-Challenge | Licencia |
|---|---|---|---|---|---|
| Hemlock-Qwen3.8-27B | 27,8 B | 262K | 33/38 | 66,22 % | Apache 2.0 |
| Qwen3.8-27B (Alibaba) | 27 B | 262K | 4/38 | 52,84 % | Apache 2.0 |
| WichtelHui-Qwen3.8-27B-SLERP | 27,8 B | 262K | 22/38 | 60,54 % | Apache 2.0 |
| Wichtel-Qwen3.6-27B | 27 B | no disponible | 29/38 | no disponible | no disponible |

La comparativa muestra que el adaptador LoRA no solo corrige la generacion de codigo Hemlock (de 22/38 a 33/38 respecto al base sin adaptador), sino que tambien mejora la capacidad general de razonamiento (de 60,54 % a 66,22 % en ARC). El Qwen3.8-27B puro falla en HemBench porque genera codigo con sintaxis de Rust o C cuando se le pide Hemlock, el fallo exacto que el adaptador elimina. La unica alternativa comparable en el ecosistema Hemlock es Wichtel-Qwen3.6-27B, que alcanza 29/38 pero con una linea base anterior de Qwen.

## Limitaciones y advertencias

- HemBench consta de solo 38 tareas y mide si el codigo generado se ejecuta y produce la salida esperada, no si es idiomatico, eficiente o seguro. Una puntuacion alta no garantiza calidad de codigo en produccion.
- Los resultados de seguridad y veracidad se heredan del modelo base WichtelHui y no se re-midieron tras fusionar el adaptador; el propio autor advierte de que podrian haber cambiado.
- La mitad de los pesos provienen de la linea Qwen3.6, por lo que el comportamiento no siempre coincidira con el de un derivado puro de Qwen3.8.
- El modelo requiere desactivar el modo thinking para generacion de codigo; si se usa con thinking activado, puede emitir cero tokens de salida tras agotar el presupuesto.
- Las diferencias de 2-3 tareas en HemBench entre ejecuciones del mismo modelo se consideran ruido estadistico; la puntuacion de 33/38 proviene de 3 muestras por tarea y una ejecucion con una sola muestra dio 29/38.
- No se dispone de informacion sobre los idiomas soportados ni sobre versiones cuantizadas, lo que limita su despliegue en entornos con restricciones de VRAM.
- El modelo tiene 0 descargas y 0 likes en el momento de la redaccion de esta ficha, por lo que su adopcion y validacion por parte de la comunidad es aun limitada.
- El padre abliterado (Huihui-Qwen3.8-27B-abliterated) puntua 0/2 en safety_control; aunque el SLERP restaura los rechazos, la mezcla de un padre abliterado implica que parte de los pesos pueden tener comportamientos de seguridad impredecibles en casos limite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B
- Adaptador LoRA final: https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B-LoRA
- Checkpoint intermedio del adaptador (step 286): https://huggingface.co/hemlang/Hemlock-Qwen3.8-27B-LoRA-step286
- Dataset de entrenamiento: https://huggingface.co/datasets/hemlang/Hemlock-SFT-combined
- Modelo base (SLERP): https://huggingface.co/DragonBophades/WichtelHui-Qwen3.8-27B-SLERP
- Repositorio del lenguaje Hemlock: https://github.com/hemlang/hemlock
- Repositorio del modelo base Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B

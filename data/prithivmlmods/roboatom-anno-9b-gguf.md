# prithivMLmods/RoboAtom-Anno-9B-GGUF

## Resumen

RoboAtom-Anno-9B es un modelo abierto de tipo video-texto desarrollado por InternRobotics, orientado especificamente a la segmentacion temporal de acciones y a la anotacion automatica de videos de manipulacion robotica. Dado un video de manipulacion y una instruccion de tarea, el modelo descompone la trayectoria en una secuencia ordenada de acciones atomicas, generando etiquetas de habilidad, descripciones de cada accion y limites de fotogramas inclusivos con base cero. Esta construido sobre el modelo de lenguaje Qwen/Qwen3.5-9B y se distribuye con licencia Apache-2.0.

La version aqui descrita, `prithivMLmods/RoboAtom-Anno-9B-GGUF`, es una cuantizacion en formato GGUF del modelo original `InternRobotics/RoboAtom` (en BF16), pensada para su ejecucion con llama.cpp y otros runtimes compatibles con GGUF. El modelo cuenta con 8.953.803.264 parametros (aproximadamente 9B) y un repositorio de 69,0 GB que incluye todas las variantes de cuantizacion, desde Q3_K_M hasta BF16, ademas del proyector multimodal `mmproj-bf16`.

Su relevancia actual reside en la creciente necesidad de pipelines de anotacion automatica para datos de robotica: el etiquetado manual de videos de manipulacion es costoso y lento, y un modelo capaz de producir segmentaciones temporales coherentes con instrucciones en lenguaje natural reduce drasticamente ese cuello de botella. La existencia de una variante GGUF amplia el acceso a hardware de consumo, algo poco habitual en modelos de video-texto de esta categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal video-texto (base: Qwen/Qwen3.5-9B), con proyector multimodal |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector multimodal en mmproj-bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (original en BF16 safetensors en el repositorio base) |

## Arquitectura y entrenamiento

RoboAtom-Anno-9B se construye sobre Qwen/Qwen3.5-9B, un transformer de 9B parametros, al que se anade un proyector multimodal para procesar video junto con texto. El modelo esta disenado especificamente para la tarea de segmentacion temporal de acciones: recibe como entrada videos de manipulacion (con soporte para multiples camaras) e instrucciones de tarea, y produce como salida una descomposicion estructurada en acciones atomicas con etiquetas de habilidad, descripciones y limites de fotogramas inclusivos con base cero.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Si se indica que la evaluacion se realiza sobre RoboAtom-Bench, un benchmark propio del desarrollador, y que el modelo forma parte de una familia junto a RoboAtom-Anno-27B (basado en Qwen3.8-27B). La model card senala explicitamente que no se emplea decodificacion especulativa (MTP). La inferencia se realiza a traves del pipeline `roboatom`.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre video: procesa secuencias de video junto con instrucciones textuales.
- Segmentacion temporal de acciones: descompone trayectorias de manipulacion en acciones atomicas ordenadas.
- Anotacion automatica de video robotico: produce etiquetas de habilidad, descripciones de accion y limites de fotogramas inclusivos con base cero.
- Procesamiento de video multicamara.
- Comprension de instrucciones de tarea en lenguaje natural para condicionar la anotacion.
- Salida estructurada apta para consumo programatico en pipelines de datos.
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con text-generation-inference y llama.cpp.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Anotacion automatica de datasets de robotica: el modelo recibe videos de manipulacion y genera segmentaciones temporales con etiquetas de habilidad y limites de fotogramas, reduciendo el trabajo manual de etiquetado en la construccion de datasets para entrenamiento de politicas robóticas.
- Generacion de datos de entrenamiento para imitacion: a partir de videos de demostracion, produce descripciones de acciones atomicas que pueden servir como supervision estructurada para modelos de aprendizaje por imitacion.
- Control de calidad de demostraciones: al segmentar y describir cada accion de una trayectoria, permite detectar pasos omitidos, mal ejecutados o inconsistentes con la instruccion de la tarea.
- Indexacion y busqueda de video robotico: las etiquetas de accion y los limites temporales generados permiten construir indices consultables sobre grandes archivos de video de manipulacion.
- Evaluacion comparativa de politicas: la salida estructurada sobre RoboAtom-Bench facilita la comparacion objetiva entre distintas politicas o modelos de control a partir de sus ejecuciones grabadas.
- Analisis de video multicamara en laboratorio: el soporte de multiples camaras permite anotar escenas con varios puntos de vista, util en entornos de investigacion con configuraciones de captura complejas.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (5,63 GB) y Q5_K_M (6,47 GB) permiten ejecutar el modelo en GPU de gama alta para consumo, algo relevante en laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluacion sobre RoboAtom-Bench, pero no incluye puntuaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache de video ni contexto):
  - BF16: aproximadamente 17,9 GB.
  - Q8_0: aproximadamente 9,53 GB.
  - Q6_K: aproximadamente 7,36 GB.
  - Q5_K_M: aproximadamente 6,47 GB.
  - Q4_K_M: aproximadamente 5,63 GB.
  - Q3_K_M: aproximadamente 4,62 GB.
- Proyector multimodal: 922 MB adicionales (mmproj-bf16).
- GPU recomendadas: A100 o H100 para BF16 y procesamiento de video multicamara con contextos largos; RTX 4090 (24 GB) para BF16 ajustado o cuantizaciones Q8_0 y Q6_K.
- GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM usando Q4_K_M o Q5_K_M; con 6 GB o menos, Q3_K_M es la opcion viable. El procesamiento de video anade requisitos de memoria no cuantificados en la informacion disponible.
- Opciones de despliegue: llama.cpp, text-generation-inference, transformers con el pipeline `roboatom`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| RoboAtom-Anno-9B (este) | 8,95B | No disponible | Video-texto, segmentacion temporal de acciones roboticas | Apache-2.0 | GGUF, BF16 |
| RoboAtom-Anno-27B | Aproximadamente 27B (base Qwen3.8-27B) | No disponible | Misma tarea, mayor capacidad | Apache-2.0 | No disponible |
| Qwen3.5-9B (modelo base) | Aproximadamente 9B | No disponible | LLM de texto general | No disponible en la informacion | No disponible |

La informacion disponible no permite comparar rendimiento numerico con alternativas de la misma categoria. La comparacion mas directa es con RoboAtom-Anno-27B, su hermano mayor de la misma familia, y con el modelo base Qwen3.5-9B, que carece de las capacidades de video y segmentacion temporal anadidas por InternRobotics.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de videos largos o de multiples camaras.
- Al ser un modelo especializado en anotacion robotica, su rendimiento en tareas generales de texto sera inferior al de su modelo base sin ajuste.
- Riesgo de alucinacion en los limites de fotogramas y en las etiquetas de accion: la salida estructurada debe validarse antes de usarse como supervision automatica en produccion.
- No se han publicado puntuaciones de RoboAtom-Bench en la informacion disponible, por lo que no es posible verificar cuantitativamente la calidad de la segmentacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener condiciones adicionales que conviene revisar en su repositorio original.
- Las cuantizaciones Q3 degradan la calidad; para anotacion critica se recomienda Q5_K_M o superior.
- El procesamiento de video multicamara puede exceder la VRAM estimada a partir del tamano de los pesos.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/RoboAtom-Anno-9B-GGUF
- Modelo base: https://huggingface.co/InternRobotics/RoboAtom
- Modelo base del LLM: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp

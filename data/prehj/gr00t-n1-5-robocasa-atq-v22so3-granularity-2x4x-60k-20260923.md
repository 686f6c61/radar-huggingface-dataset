# prehj/GR00T-N1.5-robocasa-atq-v22so3-granularity-2x4x-60k-20260923

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `nvidia/GR00T-N1.5-3B`, el modelo fundacional de NVIDIA para razonamiento y control de robots humanoides de tipo cross-embodiment. Se trata de un fine-tuning sobre el conjunto de tareas de manipulación RoboCasa orientado a estudiar una variante concreta de ATQ (action quantization, cuantización de acciones) denominada v22 con objetivos de rotación SO(3) fusionados, agrupación 2x/4x y cuatro expertos. No es un modelo generalista de propósito amplio: es una ablación de investigación pensada para evaluar cómo afecta la granularidad temporal de las acciones a una política robótica basada en mezcla de expertos.

El modelo cuenta con 2.829.861.577 parámetros reales según los ficheros safetensors, se distribuye en formato safetensors (8,0 GB de repositorio) y está entrenado durante 60.000 pasos con batch global de 64 y semilla 42. La model card indica explícitamente que el checkpoint no ha sido evaluado todavía ("Not yet evaluated") y que solo incluye pesos de inferencia y metadatos de normalización, sin estados del optimizador.

Su relevancia actual es acotada pero clara: sirve como pieza reproducible dentro de una serie de ablaciones sobre cuantización de acciones en GR00T N1.5, y requiere una implementación concreta (`moe_fine_speed` en GR00T-action-quantization) cuyo código fuente se incluye en el propio repositorio bajo `granularity_implementation/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de GR00T N1.5 (modelo fundacional cross-embodiment con componente VLM y cabeza de acción); incluye router y cuatro expertos con cabeza de confianza, según la model card |
| Parametros totales | 2.829.861.577 (dato de safetensors) |
| Parametros activos | no disponible (el modelo emplea cuatro expertos y un router, pero la model card no especifica el recuento de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se publican variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (el modelo base acepta instrucciones en lenguaje natural, pero no se documenta la cobertura linguistica de este checkpoint) |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | safetensors (pesos de inferencia y metadatos de normalizacion; sin estados del optimizador) |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.5, un modelo fundacional abierto para razonamiento y habilidades de robots humanoides que acepta entrada multimodal (lenguaje e imágenes) y opera de forma cross-embodiment. Según la documentación de NVIDIA, la componente VLM de N1.5 se actualizó tomando como punto de partida Eagle 2.5 y se afinó para mejorar el grounding y la comprensión física, con resultados favorables frente a Qwen2.5-VL-3B en RefCOCOg y en el dataset interno GEAR GR-1 de expresiones referenciales. Sobre esa base, este checkpoint introduce una capa de mezcla de expertos con router sobre acciones cuantizadas.

El entrenamiento se realizó durante 60.000 pasos con batch global 64 y semilla 42, partiendo del modelo base GR00T. La configuración concreta descrita en la model card incluye: objetivos de rotación SO(3) fusionados, grupos 2x/4x y cuatro expertos con horizontes de origen 16/8 y horizontes de salida [8, 4, 2, 4]. El pooling es de media y lo comparten router y cabeza de confianza, mientras que las características de estado siguen usando pooling de media. Los coeficientes son 0.1 para la KL del router, 0.05 para el balanceo y 0.1 para la regresión de confianza. Ambos grupos comprimen acciones delta (2x el grupo de baja confianza, 4x el de alta), el router selecciona el horizonte de origen dentro del grupo y la composición de rotaciones SO(3) se aplica directamente a grupos de 2 o 4 acciones de origen, usando el último valor del grupo para las acciones discretas. Las etiquetas de confianza de v22 se reutilizan sin reetiquetar para 2x/4x, y los pesos de pérdida y el detach de la entrada de confianza mantienen los valores de la línea base. Se trata, por tanto, de una innovación centrada en la granularidad temporal de la acción y en el enrutado por horizonte/confianza, no en el backbone visual-linguistico.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones para tareas de manipulación en el entorno de simulación RoboCasa.
- Entrada multimodal: acepta instrucciones en lenguaje natural e imágenes como parte del pipeline del modelo base GR00T N1.5.
- Enrutado por mezcla de expertos: cuatro expertos con router que selecciona horizonte de origen dentro del grupo de acciones.
- Cuantización de acciones con granularidad variable: compresión 2x para el grupo de baja confianza y 4x para el de alta confianza.
- Estimación de confianza: cabeza de regresión de confianza activa con coeficiente 0.1.
- Composición de rotaciones SO(3): trata las rotaciones como objetivos fusionados sobre grupos de 2 o 4 acciones.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible.
- Capacidades especiales adicionales (modo thinking, audio, visión en sentido amplio): no disponible, salvo la entrada de imagen implícita en el modelo base.

## Casos de uso

- Evaluación de ablaciones sobre cuantización de acciones: el checkpoint está diseñado como una variante concreta (v22, SO(3) fusionado, grupos 2x/4x) frente a la línea base `prehj/GR00T-N1.5-robocasa-baseline`; se usaría para medir el efecto de la granularidad temporal de la acción bajo condiciones controladas (mismos 60.000 pasos, batch 64 y semilla 42).
- Investigación sobre enrutado MoE en políticas robóticas: permite estudiar cómo un router con coeficiente KL 0.1 y balanceo 0.05 distribuye las acciones entre los cuatro expertos con horizontes de origen 16/8 y de salida [8, 4, 2, 4].
- Reproducción de experimentos: al publicarse la semilla, el número de pasos, el batch global y los hashes de pesos en `ablation.json`, sirve para replicar resultados y auditar la implementación incluida en `granularity_implementation/`.
- Desarrollo y depuración de la librería GR00T-action-quantization: el checkpoint depende del soporte `moe_fine_speed`, por lo que resulta útil como caso de prueba de esa ruta de código antes de aplicarla a otros entrenamientos.
- Punto de partida para fine-tuning en tareas de tabla: puede reutilizarse como inicialización para nuevas políticas sobre el fork `robocasa/robocasa-gr1-tabletop-tasks`, que extiende RoboCasa con entornos y activos para las tareas GR-1 Tabletop.
- Estudio de fusión de rotaciones SO(3): el tratamiento de rotaciones como objetivos fusionados sobre grupos de 2 o 4 acciones permite analizar errores de orientación en el efector final, un aspecto crítico en manipulación fina.
- Análisis de calibración de confianza: la cabeza de regresión de confianza con coeficiente 0.1 y el detach de la entrada de confianza permiten investigar si la confianza predicha correlaciona con el error real de la acción.
- Docencia y formación en robótica: como ejemplo completo y pequeño (2,83 mil millones de parámetros, 8,0 GB de repositorio) de política fundacional con MoE, cuantización de acciones y metadatos de normalización listos para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica "Not yet evaluated" y no se proporcionan métricas de éxito en tareas RoboCasa, ni tasas de acierto, ni comparaciones numéricas con la línea base o con el modelo base.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (2.829.861.577); no proceden de mediciones publicadas por el autor:

| Precision | Peso aproximado de los parametros | Comentario |
|---|---|---|
| bf16 / fp16 | ~5,7 GB | Requiere además memoria para activaciones, encoder de vision y buffers de normalizacion |
| int8 | ~2,9 GB | No se distribuyen pesos cuantizados en el repositorio |
| int4 | ~1,5 GB | No se distribuyen pesos cuantizados en el repositorio |

- VRAM estimada para inferencia: no disponible de forma oficial; partiendo de los pesos, un presupuesto de 8-12 GB en bf16 resulta razonable para el modelo aislado, pero el consumo real depende del pipeline de observación y del simulador.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamaño de parámetros, tarjetas con 16-24 GB (RTX 4080, RTX 4090, A5000, L40S) son candidatas razonables para los pesos; GPU de centro de datos (A100 40/80 GB, H100) aportarían margen si se ejecuta junto a Isaac Sim.
- Cabe en GPU de consumo: previsiblemente sí para los pesos del modelo en bf16 o cuantizado, pero la evaluación en RoboCasa requiere Isaac Sim, cuyo coste de VRAM es independiente del modelo y no se documenta aquí.
- Opciones de despliegue: el stack esperado es Isaac-GR00T / GR00T-action-quantization con el soporte `moe_fine_speed`, junto con el fork `robocasa/robocasa-gr1-tabletop-tasks` para evaluación en simulación. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no es esperable por tratarse de una política con cabeza de acción y MoE específico, no de un modelo de lenguaje servible con esos motores.
- Latencia y throughput estimados: no disponible. En control robótico la frecuencia de control es un requisito crítico y no se publica ninguna medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `prehj/GR00T-N1.5-robocasa-atq-v22so3-granularity-2x4x-60k-20260923` (este) | 2.829.861.577 | no disponible | Politica robotica, ablacion ATQ con 4 expertos y router | no disponible | HuggingFace, 0 descargas, 0 likes |
| `prehj/GR00T-N1.5-robocasa-baseline` | no disponible (repo de 7,59 GB, checkpoint del paso 60000) | no disponible | Fine-tuning de GR00T N1.5 sobre RoboCasa, linea base | no disponible | HuggingFace |
| `nvidia/GR00T-N1.5-3B` | ~3B segun denominacion del modelo | no disponible | Modelo fundacional cross-embodiment para robots humanoides | no disponible en la informacion proporcionada | Modelo base referenciado por el autor |
| `Qwen2.5-VL-3B` | ~3B segun denominacion del modelo | no disponible | VLM de proposito general usado como referencia de grounding por NVIDIA | no disponible en la informacion proporcionada | Punto de comparacion citado en la documentacion de NVIDIA |

No se dispone de resultados de rendimiento para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, tipo y disponibilidad.

## Limitaciones y advertencias

- Sin evaluar: la model card afirma explicitamente "Not yet evaluated"; no hay evidencia publicada de que el checkpoint funcione correctamente en RoboCasa ni en ningun otro entorno.
- Sin licencia declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial es posible. Hay que verificar la licencia del modelo base `nvidia/GR00T-N1.5-3B` antes de cualquier uso productivo.
- Dependencia de codigo no estandar: requiere el soporte `moe_fine_speed` de GR00T-action-quantization; sin esa ruta de codigo el checkpoint no es utilizable. La implementacion correspondiente se incluye en `granularity_implementation/`, pero no se documenta su compatibilidad con versiones publicas del stack.
- Solo pesos de inferencia: no se incluyen estados del optimizador, por lo que no se puede reanudar el entrenamiento desde este checkpoint sin reinicializar el optimizador.
- Sin formatos cuantizados: no se publican variantes GGUF, AWQ o GPTQ; cualquier cuantizacion tendria que realizarla el usuario, con el riesgo de degradar la cabeza de accion y la composicion SO(3).
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de RoboCasa usado ni posibles sesgos de tareas, objetos o morfologias.
- Riesgo de alucinacion: no disponible para la salida de accion. En la componente VLM del modelo base existe riesgo de interpretar incorrectamente instrucciones ambiguas, pero no se aportan tasas ni evaluaciones en este checkpoint.
- Limitaciones de contexto e idioma: no disponible. No se documenta la longitud de contexto ni la cobertura linguistica de este fine-tuning.
- Brecha simulacion-realidad: el entrenamiento se realiza sobre RoboCasa, un entorno de simulacion; no hay evidencia de transferencia a un robot fisico ni de robustez ante variaciones de iluminacion, friccion o calibration.
- Configuracion de ablacion: los hiperparametros (KL del router 0.1, balanceo 0.05, confianza 0.1, horizontes 16/8 y [8, 4, 2, 4]) son especificos de un estudio comparativo y no representan necesariamente una configuracion optima para produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento del registro, y creacion y actualizacion con dos minutos de diferencia, lo que indica un artefacto de investigacion recien publicado y sin validacion externa.
- Coherencia de tamanos: el repositorio ocupa 8,0 GB frente a los aproximadamente 5,7 GB que ocuparian 2,83 mil millones de parametros en bf16; es probable que incluya ficheros adicionales (metadatos de normalizacion, configuraciones o copias), pero no se detalla su contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prehj/GR00T-N1.5-robocasa-atq-v22so3-granularity-2x4x-60k-20260923
- Linea base del mismo autor: https://huggingface.co/prehj/GR00T-N1.5-robocasa-baseline
- Ficheros de la linea base: https://huggingface.co/prehj/GR00T-N1.5-robocasa-baseline/tree/main
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Fork de RoboCasa para tareas GR-1 Tabletop: https://github.com/robocasa/robocasa-gr1-tabletop-tasks
- Repositorio Isaac-GR00T-Robocasa: https://github.com/jakub-suliga/Isaac-GR00T-Robocasa
- Pagina de investigacion de GR00T N1.5 (NVIDIA GEAR): https://research.nvidia.com/labs/gear/gr00t-n1_5/

# pawanpaudel93/molmoact2-libero-fp16-ov

## Resumen

MolmoAct2 LIBERO es un modelo de visión-lenguaje-acción (VLA) desarrollado por el Allen Institute for AI (Ai2), especializado en manipulación robótica. Este repositorio concreto, publicado por pawanpaudel93, no contiene los pesos originales en PyTorch, sino una conversión al formato OpenVINO optimizada para su ejecución en CPUs y GPUs Intel mediante el motor `ov-policy` de Cascadia. El modelo base es `allenai/MolmoAct2-LIBERO`, un ajuste fino del modelo MolmoAct2 sobre el conjunto de datos LIBERO para tareas de manipulación en entornos simulados.

La relevancia de esta conversión radica en que permite desplegar un modelo VLA de 10 GB en hardware Intel de consumo, como la GPU integrada Arc 140V, sin necesidad de GPUs dedicadas de datacenter. El paquete mantiene las capacidades del modelo original: recibe dos imágenes (vista principal y vista de muñeca), un vector de estado del robot de 8 dimensiones y una instrucción de tarea en lenguaje natural, y produce una secuencia de 10 acciones de 7 dimensiones cada una.

La arquitectura subyacente es un transformer multimodal basado en Qwen3-4B-Instruct-2507 como backbone, con un cabezal de acción que emplea flow matching. El contexto y los idiomas soportados no están documentados en la información disponible. La licencia es Apache-2.0, lo que facilita su uso comercial e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLA) con backbone Qwen3-4B-Instruct-2507 y cabezal de acción por flow matching |
| Parametros totales | no disponible (repo de 10.0 GB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos), grafo en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO (IR), empaquetado como `policy_package` para el motor `ov-policy` de Cascadia |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre MolmoAct2, que a su vez emplea Qwen3-4B-Instruct-2507 como backbone lingüístico y visual. La salida de acciones se genera mediante flow matching con 10 pasos de integración partiendo de ceros, lo que hace que la inferencia sea determinista. La entrada visual consiste en dos imágenes RGB de 378×378 píxeles (vista principal y vista de muñeca), un vector de estado de 8 dimensiones y una instrucción de tarea en texto. La salida es un tensor de acciones de forma [10, 7], es decir, 10 pasos de acción con 7 grados de libertad cada uno.

El ajuste fino se realizó sobre el conjunto de datos LIBERO, un benchmark de manipulación robótica con tareas de largo horizonte. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a OpenVINO fue realizada por el exportador de Intel (physical-ai-studio `8f132416`), que genera un grafo en float32 con pesos en fp16. El paquete resultante requiere un build de Cascadia que incluya el tipo de política `ov-policy` (aún no disponible en una release estable, en revisión en `labscommunity/cascadia`).

## Capacidades

- Generación de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural y observaciones visuales.
- Procesamiento multimodal: dos vistas de cámara (principal y muñeca) más estado propioceptivo del robot.
- Control de robots con 7 grados de libertad por paso de acción.
- Ejecución determinista gracias al flow matching con 10 pasos desde ceros.
- Despliegue en CPUs y GPUs Intel mediante OpenVINO.
- Soporte para tareas de largo horizonte del benchmark LIBERO (libero_spatial verificado).
- No se documenta soporte de tool calling, agentes multi-paso, thinking mode, audio ni otras capacidades generales de lenguaje.

## Casos de uso

- Manipulación robótica en simulación: el modelo puede ejecutar tareas de LIBERO (como apilar o colocar objetos) recibiendo instrucciones en lenguaje natural y dos vistas de cámara, adecuado para investigación en aprendizaje por imitación.
- Despliegue en hardware Intel de consumo: gracias a la conversión OpenVINO, puede ejecutarse en GPUs integradas como la Arc 140V, lo que permite prototipar políticas VLA sin GPUs dedicadas.
- Evaluación de políticas VLA en entornos simulados: el paquete permite reproducir los resultados de LIBERO libero_spatial (28/30 en Arc 140V f16) y comparar con la implementación PyTorch de Intel (27/30 en CPU f32).
- Investigación en robótica con presupuesto limitado: al caber en 10 GB y ejecutarse en hardware consumer, facilita experimentos académicos sin acceso a clústeres.
- Integración en pipelines de control robótico: el motor `ov-policy` de Cascadia permite servir el modelo como servicio de política para un bucle de control.
- Benchmarking de conversiones OpenVINO: sirve como referencia para medir la degradación (o mejora) de precisión al convertir modelos VLA de PyTorch a OpenVINO.
- Desarrollo de sistemas de manipulación asistida: puede emplearse como base para tareas de pick-and-place en entornos controlados con instrucciones en lenguaje natural.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado |
|---|---|---|
| LIBERO `libero_spatial` (10 × 3) | Arc 140V GPU f16 | 28/30 |
| LIBERO `libero_spatial` (10 × 3) | PyTorch CPU f32 (Intel) | 27/30 |

Latencia: aproximadamente 0,92–0,99 s por chunk de 10 pasos de acción en Arc 140V GPU f16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB para los pesos en fp16 (tamaño del repo).
- GPU recomendadas: Intel Arc 140V (verificada), otras GPUs Intel compatibles con OpenVINO; no se documentan GPUs NVIDIA o AMD.
- Cabe en GPUs consumer Intel integradas (Arc 140V), lo que es un punto diferencial frente a modelos VLA que requieren GPUs dedicadas.
- Opciones de despliegue: motor `ov-policy` de Cascadia (build con soporte para el tipo `molmoact2`), sobre OpenVINO en CPU o GPU Intel.
- Latencia: 0,92–0,99 s por chunk de 10 acciones en Arc 140V f16.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MolmoAct2-LIBERO (OpenVINO, este repo) | no disponible (10 GB fp16) | no disponible | Apache-2.0 | OpenVINO | Hugging Face |
| allenai/MolmoAct2-LIBERO (original) | no disponible | no disponible | Apache-2.0 | PyTorch | Hugging Face |
| OpenVLA | ~7B | no disponible | Apache-2.0 | PyTorch | Hugging Face |
| π0 (Physical Intelligence) | no disponible | no disponible | no disponible | PyTorch | no disponible |

No se dispone de datos de rendimiento comparativos con OpenVLA o π0 en la información proporcionada. La comparativa se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- El paquete requiere un build de Cascadia con el motor `ov-policy` que aún no está en una release estable (en revisión en `labscommunity/cascadia`), lo que limita su uso en producción.
- El modelo está ajustado específicamente para el benchmark LIBERO; su generalización a otros entornos robóticos no está documentada.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado en simulación, puede presentar un gap de realidad (sim-to-real) no cuantificado.
- Riesgo de alucinación en la generación de acciones no evaluado; el flow matching determinista reduce la variabilidad pero no garantiza corrección.
- Idiomas soportados no documentados; las instrucciones de tarea se asumen en inglés por el origen del dataset LIBERO.
- Licencia Apache-2.0 permite uso comercial, pero Ai2 indica que MolmoAct2 está destinado a "investigación y uso educativo" según sus Responsible Use Guidelines, lo que introduce una advertencia de uso.
- El tamaño del repo (10 GB) y la latencia de ~1 s por chunk de 10 acciones pueden ser limitantes para control en tiempo real de alta frecuencia.
- No se dispone de información sobre el contexto máximo ni sobre el rendimiento en tareas fuera de libero_spatial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pawanpaudel93/molmoact2-libero-fp16-ov
- Modelo base: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Repositorio GitHub de MolmoAct2: https://github.com/allenai/molmoact2
- Modelo base de MolmoAct2: https://huggingface.co/allenai/Molmo2-ER
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
- Repositorio Cascadia: https://github.com/labscommunity/cascadia

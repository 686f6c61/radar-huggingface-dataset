# ImKyungjin/pi05-so101-cvpr2027-realworld-general-fullft-30k-step30000

## Resumen

El modelo `pi05-so101-cvpr2027-realworld-general-fullft-30k-step30000` es un checkpoint de robótica de tipo vision-language-action (VLA) publicado por el usuario ImKyungjin en Hugging Face. Se trata de un ajuste fino completo (full fine-tuning) del modelo base `lerobot/pi05_base`, entrenado sobre un conjunto de demostraciones reales de un brazo robótico SO101 para tres tareas concretas: recoger y colocar un muñeco, empujar un cubo y apilar cubos. El checkpoint corresponde al paso 30.000 de un programa de entrenamiento coseno independiente, no al run de 70.000 actualizaciones.

La relevancia de esta publicación es acotada pero concreta: demuestra el proceso de adaptación de un VLA de propósito general a un robot de bajo coste (SO101) con un volumen reducido de datos (120 episodios, 37.435 fotogramas) y publica los pesos completos, procesadores, tokenizador y código de experimento, sin dependencia del checkpoint base. Esto lo convierte en un artefacto útil para reproducibilidad e investigación en manipulación robótica, más que en un modelo listo para producción.

Arquitectura y tamaño: el repositorio de safetensors declara 3.616.757.520 parámetros (aproximadamente 3,6 mil millones), con un tamaño de repo de 14,5 GB, coherente con pesos guardados en FP32. La model card no detalla la arquitectura interna más allá de la designación "pi05" y la distinción entre parámetros de VLM y de "action expert".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) tipo pi05, con componente VLM y "action expert" diferenciados; detalles internos no disponibles |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; entrenamiento con autocast bf16) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y aplica un ajuste fino completo: según la model card, se entrenan todos los parámetros del VLM y del action expert. La entrada consiste en dos imágenes RGB con letterbox a 224 píxeles (cámara "top" mapeada al slot `base_0_rgb` y cámara "front" mapeada al slot `left_wrist_0_rgb`, que es un slot del modelo y no una cámara de muñeca física) junto con seis valores nativos de posición de articulaciones y pinza. La salida son esas mismas seis posiciones absolutas, generadas en chunks de 50 acciones con horizonte de ejecución 10 y 10 pasos de denoising, lo que sugiere un esquema de generación de acciones por difusión o flow matching.

El entrenamiento se realizó sobre tres tareas (Pick and Place, Push Cube, Stack Cube) con 40 demostraciones de entrenamiento cada una, totalizando 120 episodios y 37.435 fotogramas; se reservaron 30 demostraciones held-out no usadas en entrenamiento y no se emplearon datos de adaptación de oficina. Hiperparámetros: batch 8, microbatch 8, semilla 1000, AdamW con lr 2,5e-5, betas (0,9; 0,95), weight decay 0,01, warmup de 1000 pasos y decaimiento coseno hasta 2,5e-6 en el paso 30.000, con autocast bf16 y pesos guardados en FP32. No se incluye el estado del optimizador.

## Capacidades

- Generación de acciones robóticas de manipulación: predice seis posiciones absolutas de articulación y pinza a partir de observaciones visuales y del estado propioceptivo.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea: "Pick up the doll and place it in the box", "Push the cube onto the black zone" y "Pick up the wooden cube and place it on the Rubik's cube".
- Percepción visual multimodelo: procesa dos vistas RGB simultáneas (vista superior y vista frontal) a 224 píxeles.
- Ejecución de acciones en chunks con horizonte reducido: genera 50 acciones y ejecuta 10, lo que permite replanificación frecuente.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo está especializado en control motor de corto horizonte.
- Capacidades multilingües: no disponible; las instrucciones de entrenamiento están en inglés.
- Capacidades especiales: checkpoint de un schedule coseno de 30.000 actualizaciones, con código de carga (`experiment_code/load_export.py`) para preservar pesos FP32 junto con los procesadores guardados.

## Casos de uso

- Reproducción de experimentos de VLA en robótica de bajo coste: el paquete incluye pesos, procesadores, tokenizador, normalización y código, sin dependencia del checkpoint base, lo que permite replicar el pipeline de evaluación sobre un SO101 con la misma calibración y unidades nativas.
- Investigación en ajuste fino completo de modelos pi05: sirve como punto de comparación frente a variantes con adaptadores o con menos pasos, al estar documentados los hiperparámetros y el schedule exactos.
- Benchmark de generalización en manipulación: las 30 demostraciones held-out permiten medir la transferencia del modelo a episodios no vistos dentro de las mismas tres tareas.
- Estudio de mapeo de cámaras en políticas VLA: el uso del slot `left_wrist_0_rgb` para una cámara frontal física es un caso concreto para analizar cómo afecta el mapeo de slots al rendimiento.
- Prototipado de tareas de pick-and-place en laboratorio: con instrucciones cortas en inglés y un robot calibrado, se puede integrar en un bucle de control que consulte al modelo cada 10 acciones.
- Base para adaptación posterior a nuevas tareas: al ser un full fine-tuning sobre `pi05_base`, puede servir como inicialización para dominios adicionales, aunque el autor advierte que no se usaron datos de adaptación de oficina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna tasa de éxito en robot real ("No real-robot success rate is claimed").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,62 mil millones de parámetros, los pesos en FP32 ocupan aproximadamente 14,5 GB; en bf16/fp16 serían unos 7,2 GB, y en cuantización de 8 bits unos 3,6 GB (estimaciones a partir del recuento de parámetros, no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de 24 GB (RTX 3090/4090) en FP32 y en GPUs de 16 GB en precisión reducida, pero el pipeline lerobot y el preprocesado visual añaden overhead no cuantificado.
- ¿Cabe en GPU de consumo? Probablemente sí en FP32 en una RTX 4090 (24 GB) y en precisión reducida en GPUs de 16 GB, sujeto a verificación empírica.
- Opciones de despliegue: librería `lerobot`; el autor proporciona `experiment_code/load_export.py` para cargar pesos FP32 con los procesadores guardados. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de acciones).
- Latencia y throughput: no disponibles. El coste por paso incluye 10 pasos de denoising por chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-cvpr2027-realworld-general-fullft-30k-step30000 | 3,62 B | no disponible | VLA para SO101 (3 tareas) | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base de proposito general | no disponible | Hugging Face (modelo base citado) |
| Otras variantes pi05 del mismo autor | no disponible | no disponible | VLA para SO101 | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Sin tasa de éxito en robot real declarada: el autor no reclama ningún resultado de éxito, por lo que no debe asumirse rendimiento en producción.
- Especialización estrecha: solo tres tareas (pick and place, push cube, stack cube) y un único robot (SO101); no hay datos de adaptación de oficina ni de otros dominios.
- Dependencia de calibración: las unidades y la calibración nativas deben coincidir con el robot de recolección; en caso contrario, las acciones predichas no son válidas.
- Mapeo de cámaras no convencional: la cámara frontal se mapea al slot `left_wrist_0_rgb`, lo que puede inducir a error si se replica el montaje sin leer la model card.
- Idiomas: instrucciones de entrenamiento únicamente en inglés; no se documenta soporte multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sin estado del optimizador: no es posible reanudar el entrenamiento exactamente desde este checkpoint.
- Riesgo de alucinación y sesgos: no documentados por el autor; en un VLA, el fallo se manifiesta como acciones incorrectas o inseguras, no como texto.
- Contexto y cuantizaciones no documentados: no hay información sobre la ventana de contexto del VLM ni sobre formatos GGUF u otras cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi05-so101-cvpr2027-realworld-general-fullft-30k-step30000
- Modelo base citado: https://huggingface.co/lerobot/pi05_base
- Librería lerobot: https://github.com/huggingface/lerobot
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.

# Simoji/Cosmos-Reason2-2B

## Resumen

Cosmos-Reason2-2B es un modelo de lenguaje y visión (VLM) de 2.438.696.960 parámetros desarrollado por NVIDIA, orientado a razonamiento físico y encarnado (*embodied reasoning*) para robótica y agentes de IA visual. Se construye sobre Qwen/Qwen3-VL-2B-Instruct y forma parte de la familia Cosmos-Reason2, que incluye variantes de 2B, 8B y 32B. La versión aquí documentada es un espejo sin modificar (*unmodified copy*) publicado por el usuario Simoji en Hugging Face, redistribuido bajo la NVIDIA Open Model License.

El modelo está diseñado para que robots y agentes de visión artificial razonen sobre el mundo real empleando conocimiento previo, comprensión de la física y sentido común. Entiende espacio, tiempo y física fundamental, y puede actuar como modelo de planificación para decidir los siguientes pasos de un agente encarnado. Entre las novedades de la generación Reason2 destacan la mejora en comprensión espaciotemporal y precisión de marcas temporales, la detección de objetos con localización 2D/3D y coordenadas de *bounding box* acompañadas de explicaciones y etiquetas, y una ventana de contexto de hasta 256K tokens de entrada.

Su relevancia actual radica en que cubre el hueco de los modelos de razonamiento físico de tamano pequeno: con solo 2B parámetros ofrece capacidades de análisis de vídeo, anotación de datos y planificación robótica que hasta ahora requerían modelos mucho mayores, y lo hace con licencia permisiva para uso comercial. La arquitectura subyacente es la de Qwen3-VL (familia `qwen3_vl`), adaptada por NVIDIA para tareas de IA física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia Qwen3-VL, tag `qwen3_vl`) |
| Parametros totales | 2.438.696.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K tokens de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4.9 GB |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct |
| Pipeline | image-text-to-text |
| Libreria | cosmos |
| Desarrollador | NVIDIA (espejo de Simoji) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer multimodal de la familia Qwen3-VL, con codificador visual y torre de lenguaje, adaptada por NVIDIA para el dominio de IA física. Procesa entradas de texto y vídeo (image-text-to-text) y genera respuestas razonadas sobre el contenido visual. La ventana de contexto alcanza los 256K tokens de entrada, lo que permite analizar secuencias de vídeo largas y mantener el seguimiento temporal de eventos.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se documenta que la generación Reason2 incorpora mejoras específicas en comprensión espaciotemporal, precisión de marcas temporales y localización de objetos en 2D y 3D con coordenadas y explicaciones. El modelo se distribuye como fine-tuning del Qwen3-VL-2B-Instruct original.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes y vídeo.
- Comprensión espaciotemporal: interpretación de espacio, tiempo y física fundamental.
- Detección de objetos con localización 2D/3D y coordenadas de *bounding box*, acompañadas de explicaciones y etiquetas.
- Razonamiento físico y de sentido común aplicado a escenas del mundo real.
- Planificación de acciones para agentes encarnados (robótica, vehículos autónomos).
- Análisis de vídeo con precisión de marcas temporales.
- Procesamiento de contexto largo de hasta 256K tokens de entrada.
- Capacidades conversacionales multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- **Agentes de analítica de vídeo**: el modelo puede extraer información y realizar análisis de causa raíz sobre grandes volúmenes de vídeo grabado o en directo en operaciones urbanas e industriales, aprovechando su contexto de 256K tokens y su comprensión temporal. Se integra en el blueprint NVIDIA VSS (video search and summarization).
- **Curación y anotación de datos**: automatiza el filtrado, etiquetado y deduplicación de grandes conjuntos de datos de sensores para desarrollo de IA física, mediante NVIDIA Cosmos Curator. Su detección con coordenadas 2D/3D y explicaciones lo hace adecuado para generar anotaciones de alta calidad.
- **Planificación robótica**: actúa como cerebro de planificación en modelos visión-lenguaje-acción (VLA), descomponiendo comandos complejos en tareas ejecutables por humanoides o vehículos autónomos, incluso en entornos desconocidos, gracias a su razonamiento de sentido común.
- **Generación de datos sintéticos de trayectorias**: se emplea en el blueprint NVIDIA Isaac GR00T-Dreams para generar trayectorias sintéticas masivas combinado con los modelos world foundation de Cosmos.
- **Inspección industrial y seguridad**: análisis de secuencias de vídeo de plantas o almacenes para detectar anomalías, verificar procedimientos o localizar objetos con coordenadas espaciales.
- **Asistencia a conducción autónoma**: interpretación de escenas viales, razonamiento sobre objetos y planificación de maniobras dentro de la categoría Self-Driving evaluada por NVIDIA.
- **Investigación en razonamiento físico**: banco de pruebas de bajo coste (2B) para experimentar con modelos de razonamiento espacial y físico antes de escalar a las variantes de 8B o 32B.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA en la model card (comparación con Qwen3-VL-Instruct del mismo tamano):

| Categoria | Benchmark | Cosmos-Reason2-2B | Qwen3-VL-2B-Instruct |
|---|---|---|---|
| General | Overall | 62.21 | 59.60 |
| General | BlinkDepth | 82.26 | 74.19 |
| General | BlinkSpatial | 75.52 | 77.62 |
| General | CVBench | 78.74 | 78.67 |
| General | VideoPhy2 | 12.33 | 7.92 |
| Robotics | Overall | 45.52 | 42.07 |
| Robotics | ERQA | 37.75 | 37.75 |
| Robotics | CR Common | 54.30 | 49.67 |
| Robotics | CR Embodied | 58.03 | 48.85 |

Para contexto, las variantes mayores obtienen: Cosmos-Reason2-8B 73.73 (General Overall) y 56.90 (Robotics Overall); Cosmos-Reason2-32B 75.85 (General Overall) y 60.60 (Robotics Overall). Los resultados completos de Where2Place y de la Physical AI Bench Leaderboard no están disponibles en el texto proporcionado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 2.438.696.960 parámetros, en FP16 se requieren aproximadamente 4,9 GB solo para pesos; en cuantizaciones de 8 bits bajaría a ~2,5 GB y en 4 bits a ~1,3 GB (estimación orientativa, no confirmada por el autor).
- **GPU recomendadas**: no disponible en la información proporcionada. Por tamano, cabría en GPUs de consumo como RTX 4090 (24 GB) en FP16, e incluso en GPUs de 8-12 GB con cuantización.
- **Cabe en GPU de consumo**: sí, por el tamano del modelo (4,9 GB de pesos), aunque el procesamiento de vídeo con contexto de 256K tokens incrementa notablemente el uso de memoria KV.
- **Opciones de despliegue**: la librería indicada es `cosmos`; no se detallan en la información proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | General Overall | Robotics Overall | Licencia |
|---|---|---|---|---|---|
| Cosmos-Reason2-2B | 2,44B | 256K | 62.21 | 45.52 | NVIDIA Open Model License |
| Qwen3-VL-2B-Instruct | ~2B | no disponible | 59.60 | 42.07 | no disponible |
| Cosmos-Reason2-8B | ~8B | 256K | 73.73 | 56.90 | NVIDIA Open Model License |
| Cosmos-Reason2-32B | ~32B | 256K | 75.85 | 60.60 | NVIDIA Open Model License |

El modelo supera a su base Qwen3-VL-2B-Instruct en la mayoría de benchmarks, con mejoras especialmente marcadas en CR Embodied (58.03 frente a 48.85) y VideoPhy2 (12.33 frente a 7.92), aunque pierde ligeramente en BlinkSpatial (75.52 frente a 77.62).

## Limitaciones y advertencias

- **Rendimiento en VideoPhy2 muy bajo**: 12.33 puntos, lo que indica limitaciones claras en la comprensión de física de vídeo, pese a ser la categoría objetivo del modelo.
- **Riesgo de alucinación**: como todo VLM, puede generar descripciones, coordenadas o explicaciones plausibles pero incorrectas, especialmente en escenas ambiguas o con oclusiones.
- **Idiomas**: no se especifican los idiomas soportados; se desconoce el rendimiento fuera del inglés.
- **Licencia**: NVIDIA Open Model License, que permite uso comercial pero impone condiciones específicas (ver `LICENSE_NVIDIA_OPEN_MODEL.md` y `NOTICE` en el repositorio). Es necesario revisar los términos antes de un despliegue en producción.
- **Espejo no oficial**: esta copia la publica el usuario Simoji, no NVIDIA; conviene verificar la integridad frente al repositorio original `nvidia/Cosmos-Reason2-2B` (revisión `9ce19a195e423419c349abfc86fd07178b230561`).
- **Contexto largo**: los 256K tokens de entrada implican un coste de memoria KV elevado en inferencia con vídeo largo.
- **Sesgos**: no se documentan sesgos conocidos en la información proporcionada.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción aún nula de este espejo concreto.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/Simoji/Cosmos-Reason2-2B
- Modelo original: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Colección Cosmos-Reason2: https://huggingface.co/collections/nvidia/cosmos-reason2
- Código: https://github.com/nvidia-cosmos/cosmos-reason2
- Cosmos Cookbook: https://nvidia-cosmos.github.io/cosmos-cookbook/index.html
- NVIDIA Blueprint VSS: https://build.nvidia.com/nvidia/video-search-and-summarization
- NVIDIA Cosmos Curator: https://github.com/nvidia-cosmos/cosmos-curate
- NVIDIA Isaac GR00T-Dreams: https://github.com/nvidia/gr00t-dreams
- Physical AI Bench Leaderboard: https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license
- Paper VideoPhy2: https://arxiv.org/pdf/2503.06800
- Paper Where2Place: https://arxiv.org/pdf/2406.10721
- ERQA: https://github.com/embodiedreasoning/ERQA
- Dataset BLINK: https://huggingface.co/datasets/BLINK-Benchmark/BLINK
- Dataset CV-Bench: https://huggingface.co/datasets/nyu-visionx/CV-Bench

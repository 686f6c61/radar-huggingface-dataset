# Safman/Alpamayo2-Edge-MLX-q8

## Resumen

Alpamayo2-Edge-MLX-q8 es una cuantización de 8 bits del modelo nvidia/Alpamayo2-Edge, un modelo Vision-Language-Action (VLA) de 2B parámetros orientado a conducción autónoma. Lo publica el usuario Safman en Hugging Face como port a Apple Silicon mediante la librería MLX-VLA, construida sobre mlx-vlm. El modelo original, desarrollado por NVIDIA, combina un LLM Cosmos 3 Edge con un "Diffusion Action Expert" que genera trayectorias de conducción.

El modelo resuelve el problema de unir razonamiento en lenguaje natural con predicción de acciones continuas: dado un conjunto de imágenes de cámaras, el historial del vehículo y una instrucción de navegación, produce una cadena de razonamiento ("chain-of-causation") y una trayectoria de 64 waypoints con rotaciones. Es relevante por su tamaño reducido (2.651 millones de parámetros) y su perfil de memoria contenido, que permite ejecutarlo en hardware Apple Silicon consumer.

La cuantización aplica 8 bits con group_size=64 al LLM y al Action Expert, manteniendo la torre de visión SigLIP2 y los encoders/decoders de acción en bfloat16. El checkpoint ocupa 3,28 GB y el runtime es MLX puro, sin dependencias de PyTorch en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (Cosmos 3 Edge LLM de 28 capas) + Diffusion Action Expert (28 capas) + torre de vision SigLIP2 (27 capas) con patch merger 2x2 |
| Parametros totales | 2.651.163.378 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (8-bit affine, group_size=64) en LLM y Action Expert; bfloat16 en vision tower, patch merger y encoders/decoders de accion |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (OpenMDW-1.1); el codigo de mlx-vla es MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un VLA compuesto por tres bloques: un LLM Cosmos 3 Edge de 28 capas que actúa como razonador, una torre de visión SigLIP2 de 27 capas con patch merger 2x2 que codifica las imágenes de cámara, y un Diffusion Action Expert de 28 capas que genera acciones continuas mediante flow matching con 10 pasos de integración Euler. La inferencia hace un handoff de la caché KV en memoria unificada desde el razonador VLM directamente al Action Expert, sin copias intermedias.

La generación de trayectorias usa un esquema de decodificación con `diffusion_steps=10` y modo de razonamiento configurable (`adaptive` o `nominal` para streaming rápido sin pensamiento). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La cuantización Q8 se aplica de forma mixta: solo el LLM y el Action Expert se cuantizan a 8 bits, mientras que la visión y las proyecciones de acción permanecen en bfloat16.

## Capacidades

- Razonamiento de conducción con cadena de causalidad ("chain-of-causation") en lenguaje natural.
- Predicción de trayectorias continuas de 64 waypoints con rotaciones (salida XYZ y matrices de rotación).
- Procesamiento multi-cámara: acepta múltiples frames con índices de cámara y timestamps absolutos.
- Historial del vehículo (ego-motion) como entrada: posición y rotación de las últimas 20 observaciones.
- Instrucciones de navegación en texto (por ejemplo, "Turn right in 30m").
- VQA libre sobre escenas de conducción (peligros, objetos, contexto).
- Modos de razonamiento: `adaptive` (con pensamiento) y `nominal` (sin pensamiento, streaming rápido).
- Generación de múltiples conjuntos y muestras de trayectoria (`num_traj_sets`, `num_traj_samples`).
- Control de temperatura y semilla para muestreo reproducible.

## Casos de uso

- Predicción de trayectorias en bucle cerrado: el modelo recibe frames de cámara, historial ego y una instrucción de navegación, y emite 64 waypoints con rotaciones que pueden alimentar un controlador de bajo nivel en un simulador o vehículo instrumentado.
- Análisis de causalidad para validación: la cadena de razonamiento permite auditar por qué el modelo propone una maniobra, útil en pipelines de verificación de seguridad.
- VQA de escenas de tráfico: responder preguntas sobre peligros visibles, señalización o estado de la vía usando la ruta `generate` con una sola imagen.
- Prototipado en Apple Silicon: con 3,28 GB de RAM activa, permite iterar sobre modelos VLA de conducción en un Mac sin GPU dedicada.
- Investigación en planificación multimodal: comparar modos `adaptive` frente a `nominal` para medir el coste del razonamiento explícito frente al streaming.
- Evaluación de cuantización: al existir variantes BF16, Q8, Q6 y Q4 del mismo modelo, sirve para estudiar la degradación de precisión en tareas de acción continua.
- Generación de datos sintéticos de conducción: producir trayectorias y razonamientos etiquetados para entrenar o evaluar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM activa en Metal: 3,28 GB para el checkpoint Q8.
- Tamaño del repositorio: 3,3 GB.
- Hardware objetivo: Apple Silicon con MLX (memoria unificada); no requiere GPU dedicada.
- Cabe en cualquier Mac con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB para margen del sistema.
- Despliegue mediante `mlx-vlm` y `mlx-vla` (`pip install "git+https://github.com/SMJD11/mlx-vla.git"`).
- El runtime es MLX puro, sin PyTorch ni Torchvision en inferencia.
- Throughput: la variante Q4 alcanza hasta 1,87–2,5 Hz con CoreML ANE según la model card; para Q8 no se indica tasa concreta.
- Alternativas de menor tamaño del mismo autor: Q6 (2,74 GB) y Q4 (2,20 GB); referencia BF16 de 5,30 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano | RAM activa | Licencia | Plataforma |
|---|---|---:|---:|---:|---|---|
| Safman/Alpamayo2-Edge-MLX-q8 | 2,65B | Q8 (LLM+Expert), BF16 vision | 3,28 GB | 3,28 GB | nvidia-open-model-license | Apple Silicon (MLX) |
| Safman/Alpamayo2-Edge-MLX-bf16 | 2,65B | BF16 | 5,30 GB | 5,30 GB | nvidia-open-model-license | Apple Silicon (MLX) |
| Safman/Alpamayo2-Edge-MLX-q4 | 2,65B | Q4 (LLM+Expert), BF16 vision | 2,20 GB | 2,20 GB | nvidia-open-model-license | Apple Silicon (MLX) |
| Safman/Alpamayo-1.5-Mac-MLX-4bit | 10B | 4-bit VLM + Expert | 10,36 GB | ~7,0 GB | no disponible | Apple Silicon (MLX) |

## Limitaciones y advertencias

- Modelo especializado en conducción: no es un asistente general y su uso fuera de tareas VLA de tráfico carece de garantías.
- La cuantización Q8 puede introducir pequeñas desviaciones frente a BF16 en la predicción de acciones continuas, aunque la model card la describe como "virtually lossless".
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación.
- Riesgo de alucinación en la cadena de razonamiento: las justificaciones textuales no deben tratarse como garantía de corrección de la trayectoria.
- Licencia nvidia-open-model-license (OpenMDW-1.1): es necesario revisar sus términos antes de uso comercial; el código de mlx-vla es MIT, pero los pesos no.
- Dependencia de Apple Silicon y MLX: no ejecutable directamente en CUDA sin conversión.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a otros VLA.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy limitado.
- Uso en producción de conducción real requeriría validación independiente y cumplimiento normativo; este checkpoint es de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q8
- Modelo base: https://huggingface.co/nvidia/Alpamayo2-Edge
- Variante BF16: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-bf16
- Variante Q6: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q6
- Variante Q4: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q4
- Port de Alpamayo 1.5 (10B): https://huggingface.co/Safman/Alpamayo-1.5-Mac-MLX-4bit
- Draft model especulativo: https://huggingface.co/Safman/Alpamayo-1.5-Mac-DFlash
- Repositorio mlx-vla: https://github.com/SMJD11/mlx-vla
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/

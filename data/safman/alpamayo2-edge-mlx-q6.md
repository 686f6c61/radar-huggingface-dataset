# Safman/Alpamayo2-Edge-MLX-q6

## Resumen

Alpamayo2-Edge-MLX-q6 es una cuantización de 6 bits del modelo nvidia/Alpamayo2-Edge, un modelo Vision-Language-Action (VLA) de 2B parámetros orientado a conducción autónoma. Lo desarrolla el usuario Safman como port a Apple Silicon mediante la librería MLX-VLA, y parte del modelo original de NVIDIA construido sobre Cosmos 3 Edge más un Diffusion Action Expert de 512 dimensiones. El modelo combina razonamiento en lenguaje natural (chain-of-causation) con predicción de trayectorias de 64 waypoints, lo que lo sitúa en la categoría de modelos de conducción end-to-end con explicabilidad.

La relevancia de esta versión concreta es de despliegue: reduce el checkpoint a 2,74 GB y permite inferencia 100% en MLX sobre memoria unificada de Apple Silicon, sin dependencias de PyTorch en tiempo de ejecución. Esto habilita probar un VLA de conducción en un Mac (portátil o de sobremesa) con un consumo de RAM activa de 2,74 GB, algo impensable con el checkpoint en bf16 (5,30 GB) o con modelos de conducción de mayor tamaño.

La cuantización es mixta: las 28 capas del LLM Cosmos 3 Edge y las 28 capas del Action Expert van en 6 bits afín con group_size=64, mientras que la torre de visión SigLIP2 de 27 capas, el patch merger 2×2 y los encoders/decoders de acción continua se mantienen en bfloat16. El modelo hereda la licencia NVIDIA Open Model License del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: LLM Cosmos 3 Edge (28 capas) + Diffusion Action Expert (28 capas, 512-wide) + torre de visión SigLIP2 (27 capas) con patch merger 2×2 |
| Parametros totales | 2.651.163.378 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín (group_size=64) en LLM y Action Expert; bfloat16 en visión y encoders/decoders de acción |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (OpenMDW-1.1); código de mlx-vla bajo MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un VLA compuesto por tres bloques: un LLM Cosmos 3 Edge de 28 capas que actúa como razonador visual-lenguaje, una torre de visión SigLIP2 de 27 capas con patch merger 2×2 que codifica los frames de cámara, y un Diffusion Action Expert de 28 capas y anchura 512 que genera trayectorias continuas mediante flow matching con integrador Euler de 10 pasos. La inferencia encadena el razonamiento del VLM con la generación de acción mediante un KV cache de memoria unificada transferido sin copia desde el razonador al experto de acción.

El modelo soporta dos modos de razonamiento: `adaptive`, que produce una cadena de causalidad (chain-of-causation) antes de la trayectoria, y `nominal`, sin pensamiento, orientado a streaming rápido. La predicción de trayectorias se emite como 64 waypoints con posición (xyz) y rotación. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La innovación técnica destacable de este port es la cuantización mixta selectiva: solo se cuantizan LLM y Action Expert, manteniendo en bfloat16 la visión y las proyecciones de acción continua, que son más sensibles a la pérdida de precisión. El resultado es un checkpoint de 2,74 GB con 2,74 GB de RAM activa en Metal.

## Capacidades

- Razonamiento de conducción en lenguaje natural (chain-of-causation) antes de emitir la trayectoria.
- Predicción de trayectorias de 64 waypoints con posición y rotación, mediante flow matching.
- Comprensión visual multi-cámara: acepta múltiples frames con índices de cámara y timestamps absolutos.
- Historial del ego-vehículo: integra posición y rotación pasadas (`ego_history_xyz`, `ego_history_rot`) como entrada.
- Instrucciones de navegación en texto (por ejemplo, "Turn right in 30m") que condicionan la trayectoria.
- VQA libre sobre escenas de conducción (peligros visibles, descripción de escena) mediante generación de texto.
- Dos modos de inferencia: `adaptive` con razonamiento y `nominal` sin pensamiento para streaming.
- Control de muestreo: temperatura, número de muestras y conjuntos de trayectoria, semilla y pasos de difusión.
- Ejecución 100% MLX sin PyTorch ni Torchvision en tiempo de inferencia.

## Casos de uso

- Investigación en conducción end-to-end en Apple Silicon: permite ejecutar un VLA de conducción completo en un Mac con 2,74 GB de RAM activa, útil para prototipado académico sin acceso a GPU NVIDIA.
- Evaluación de razonamiento causal en escenas: el modo `adaptive` emite la cadena de causalidad que justifica la trayectoria, lo que facilita auditar por qué el modelo decide girar o frenar en un frame concreto.
- Predicción de trayectorias en datasets de conducción: con entradas de historial del ego y frames multi-cámara, se pueden generar 64 waypoints y compararlos con ground truth para medir error de desplazamiento y rotación.
- Asistencia a la navegación simulada: combinando instrucciones de texto ("Turn right in 30m") con frames de cámara se pueden generar trayectorias condicionadas por ruta en entornos sintéticos.
- Análisis de riesgos en vídeo de dashcam: el pipeline image-text-to-text permite preguntar por peligros visibles y obtener descripciones textuales de la escena para triaje o anotación.
- Streaming de baja latencia en prototipos: el modo `nominal` sin pensamiento evita la generación de CoT y reduce el coste por frame, adecuado para bucles de inferencia continua en demos.
- Benchmarking de cuantización: al existir variantes bf16, q8, q6 y q4 del mismo modelo, sirve para medir la degradación de precisión en trayectorias al bajar de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- RAM activa en Metal: 2,74 GB para el checkpoint q6 (frente a 5,30 GB en bf16, 3,28 GB en q8 y 2,20 GB en q4).
- Tamaño en disco del repo: 2,8 GB.
- Hardware objetivo: Apple Silicon con memoria unificada (serie M). Cabe en cualquier Mac con 8 GB o más de RAM unificada, ya que el modelo ocupa menos de 3 GB.
- No está pensado para GPU NVIDIA: el runtime es MLX, no CUDA. Para A100/H100 habría que usar el checkpoint original de NVIDIA en PyTorch.
- Despliegue: `mlx-vlm` (instalación vía `pip install "git+https://github.com/SMJD11/mlx-vla.git"`). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no se publican cifras para q6. La model card indica que la variante q4 alcanza hasta 1,87–2,5 Hz con CoreML ANE; para q6 no hay dato.
- Pasos de difusión por defecto: 10 (integrador Euler), parámetro ajustable en `sample_trajectories`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | RAM activa | Licencia | Runtime |
|---|---|---|---|---|---|---|---|
| Safman/Alpamayo2-Edge-MLX-q6 | 2,65B | no disponible | 6 bits (LLM+Expert), bf16 visión | 2,74 GB | 2,74 GB | NVIDIA Open Model License | MLX |
| Safman/Alpamayo2-Edge-MLX-bf16 | 2,65B | no disponible | bf16 | 5,30 GB | 5,30 GB | NVIDIA Open Model License | MLX |
| Safman/Alpamayo2-Edge-MLX-q4 | 2,65B | no disponible | 4 bits (LLM+Expert), bf16 visión | 2,20 GB | 2,20 GB | NVIDIA Open Model License | MLX |
| Safman/Alpamayo-1.5-Mac-MLX-4bit | 10B | no disponible | 4 bits (VLM+Expert) | 10,36 GB | ~7,0 GB | no disponible | MLX |

La comparación más directa es con las otras cuantizaciones del mismo modelo base: q6 ocupa un punto intermedio entre q8 (3,28 GB, prácticamente sin pérdida frente a bf16) y q4 (2,20 GB, la más rápida). Frente a Alpamayo 1.5 (10B), el modelo de 2B es mucho más ligero y apto para Macs modestos.

## Limitaciones y advertencias

- Modelo de dominio específico: está entrenado para conducción autónoma; su uso fuera de ese ámbito (VQA general, código, matemáticas) no está validado.
- Riesgo de alucinación en la cadena de causalidad: el modo `adaptive` genera texto explicativo que puede no corresponder con la trayectoria emitida; conviene validar la CoT contra la predicción.
- Licencia NVIDIA Open Model License (OpenMDW-1.1): no es una licencia permisiva estándar; hay que revisar sus términos antes de uso comercial o redistribución. El código de mlx-vla es MIT, pero los pesos no.
- Idiomas soportados no declarados: no hay información sobre el rendimiento en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no publicada: se desconoce cuántos frames o tokens de historial admite simultáneamente.
- Cuantización de 6 bits: introduce degradación frente a bf16 en LLM y Action Expert; la visión se mantiene en bf16, pero no se han publicado métricas de error de trayectoria para esta variante.
- Port de terceros: el modelo lo publica Safman, no NVIDIA; no hay garantía de soporte oficial ni de paridad exacta con el checkpoint original.
- Sin datos de benchmarks: no se puede comparar su precisión de trayectoria con otros VLA de conducción a partir de la información disponible.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo.

## Enlaces

- Hugging Face: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q6
- Modelo base: https://huggingface.co/nvidia/Alpamayo2-Edge
- Librería MLX-VLA: https://github.com/SMJD11/mlx-vla
- Variante bf16: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-bf16
- Variante q8: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q8
- Variante q4: https://huggingface.co/Safman/Alpamayo2-Edge-MLX-q4
- Alpamayo 1.5 Mac MLX 4-bit: https://huggingface.co/Safman/Alpamayo-1.5-Mac-MLX-4bit
- Alpamayo 1.5 Mac DFlash: https://huggingface.co/Safman/Alpamayo-1.5-Mac-DFlash
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/

# craquehouse/parakeet-tdt-0.6b-v3-mlx-6bit-pointwise

## Resumen

El modelo `craquehouse/parakeet-tdt-0.6b-v3-mlx-6bit-pointwise` es una cuantización en 6 bits con group size 64 del modelo de reconocimiento automático del habla (ASR) `mlx-community/parakeet-tdt-0.6b-v3`, que a su vez es la conversión a MLX del modelo original de NVIDIA `parakeet-tdt-0.6b-v3`. Este modelo pertenece a la familia Parakeet TDT, basada en un encoder FastConformer y un decodificador Token-and-Duration Transducer (TDT), y está diseñado para transcripción de voz a texto multilingüe de alta velocidad.

La particularidad de esta versión es que cuantiza también las convoluciones pointwise (kernel 1) del conformer como capas `Linear`, lo que reduce el tamaño del modelo a 519 MB y el pico de memoria a 0.9 GB, manteniendo un WER prácticamente idéntico al de la cuantización estándar (3.82% frente a 3.79% en LibriSpeech test-other). Sin embargo, requiere un shim especial para ejecutarse, ya que la implementación estándar de `mlx-audio` no soporta pesos cuantizados en `nn.Conv1d`.

El modelo tiene 142.888.666 parámetros totales (según los safetensors), un tamaño de repo de 0.5 GB y está pensado para ejecutarse en Apple Silicon mediante la librería MLX. Su licencia hereda la del modelo base, que no se especifica en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Token-and-Duration Transducer (TDT) decoder |
| Parametros totales | 142.888.666 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit MLX, group size 64, base float16 |
| Idiomas soportados | no disponible (el modelo base soporta 25 idiomas europeos) |
| Licencia | no disponible (hereda la del modelo base) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `parakeet-tdt-0.6b-v3` de NVIDIA utiliza un encoder FastConformer, una variante eficiente del conformer que reduce la complejidad computacional mediante convoluciones de submuestreo y atención restringida, y un decodificador TDT que predice tokens y duraciones de forma conjunta. Este diseño permite una inferencia de alto rendimiento, especialmente en CPU y GPU.

La cuantización MLX de 6 bits se aplica a la mayoría de los pesos, incluyendo las convoluciones pointwise del conformer, que se convierten en capas `Linear` equivalentes desde el punto de vista matemático. Las convoluciones depthwise y de submuestreo se mantienen en float16. El proceso de cuantización se realizó con la herramienta `model-lab` de craquehouse, y el resultado se validó con una medición de WER sobre LibriSpeech test-other, comparando contra la versión sin cuantizar y otras cuantizaciones.

El entrenamiento del modelo base no está detallado en la información disponible, pero se sabe que extiende el soporte de inglés a 25 idiomas europeos con detección automática de idioma.

## Capacidades

- Transcripción de voz a texto (ASR) en 25 idiomas europeos, con detección automática de idioma.
- Alta velocidad de inferencia, optimizada para ejecución en Apple Silicon mediante MLX.
- Soporte de audio de larga duración gracias a la arquitectura FastConformer (aunque la longitud de contexto exacta no está especificada).
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal más allá del audio.
- El modelo base tiene una precisión competitiva en benchmarks de ASR como LibriSpeech, con WER de 3.79% en test-other para la versión sin cuantizar.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede procesar audio de larga duración con baja latencia, ideal para generar actas automáticas en entornos empresariales multilingües.
- Subtitulación automática de vídeo: su soporte de 25 idiomas europeos permite generar subtítulos para contenido audiovisual sin intervención manual, con una precisión comparable a modelos más grandes.
- Atención al cliente automatizada: integrado en sistemas de IVR o chatbots, puede transcribir llamadas de clientes en tiempo real para análisis de sentimiento o archivado, gracias a su bajo consumo de memoria (0.9 GB de pico).
- Asistentes de voz en dispositivos Apple: al ser una cuantización MLX, se puede ejecutar localmente en Macs y iPhones con Apple Silicon, permitiendo transcripción offline sin enviar audio a la nube.
- Archivado y búsqueda de audio: transcripción de bibliotecas de podcasts o grabaciones históricas para hacerlas indexables y buscables, aprovechando la detección automática de idioma.
- Investigación académica en ASR: como modelo ligero y cuantizado, sirve como punto de partida para experimentos de fine-tuning o evaluación en entornos con recursos limitados.

## Benchmarks y rendimiento

El autor proporciona mediciones de WER en LibriSpeech test-other (2939 utterances) para distintas cuantizaciones del modelo base:

| Build | Tamano | Pico de memoria | WER (test-other) |
|---|---|---|---|
| 6bit | 608 MB | 1.05 GB | 3.79% |
| **6bit+pointwise (este modelo)** | **519 MB** | **0.9 GB** | **3.82%** |
| 8bit | 744 MB | 1.19 GB | 3.79% |
| 8bit+pointwise | 674 MB | 1.05 GB | 3.77% |

El WER se calculó como corpus WER (ediciones totales / palabras de referencia) con intervalos de confianza bootstrap al 95%. La diferencia entre el 6bit+pointwise y el 6bit estándar es de 0.03 puntos porcentuales, estadísticamente insignificante. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: pico de 0.9 GB durante la inferencia (según la medición del autor con 8 utterances de LibriSpeech test-other).
- GPU recomendadas: cualquier Mac con Apple Silicon (M1, M2, M3 o posteriores), ya que MLX está optimizado para la GPU unificada de Apple.
- No cabe en GPUs de NVIDIA directamente, pues MLX es específico de Apple. Para otras plataformas habría que usar el modelo original en PyTorch u ONNX.
- Opciones de despliegue: `mlx-audio` con el shim `mlx-audio-pointwise` (obligatorio), o mediante la variable de entorno `MLX_AUDIO_POINTWISE=1`.
- Latencia y throughput: no se proporcionan cifras exactas, pero el diseño TDT está pensado para alta velocidad; el autor indica que compite con implementaciones GPU en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, se puede contextualizar con el modelo base:

| Modelo | Parametros | Contexto | WER (LibriSpeech test-other) | Licencia |
|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 (base, sin cuantizar) | ~600M | no disponible | 3.79% | no disponible |
| Este modelo (6bit+pointwise) | 142.888.666 (cuantizado) | no disponible | 3.82% | no disponible |
| Whisper large-v3 | 1550M | 30 s | ~3.5% (aprox.) | MIT |

Nota: los datos de Whisper son aproximados y no provienen de la información proporcionada; se incluyen solo como referencia orientativa. No se recomienda usar esta tabla sin verificación adicional.

## Limitaciones y advertencias

- Este checkpoint no funciona con `mlx-audio` estándar: requiere instalar el shim `mlx-audio-pointwise` y activar la variable `MLX_AUDIO_POINTWISE=1`. Sin él, la inferencia falla con un error de convolución.
- La cuantización de las convoluciones pointwise como `Linear` es matemáticamente equivalente, pero puede no estar soportada en futuras versiones de MLX o de `mlx-audio`.
- El modelo hereda las limitaciones del modelo base: sesgos en el reconocimiento de acentos o dialectos no representados en los datos de entrenamiento, posible alucinación en segmentos de audio ambiguos o con ruido.
- La licencia no está especificada en la model card; se debe consultar la del modelo base `nvidia/parakeet-tdt-0.6b-v3` antes de redistribuir o usar comercialmente.
- No se proporcionan datos sobre la longitud de contexto máxima, por lo que no se puede garantizar el rendimiento con audios muy largos sin segmentación previa.
- El tamaño de parámetros (142M) corresponde a los pesos cuantizados, no al número real de parámetros del modelo original (que es ~600M). Esto puede confundir al comparar arquitecturas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/craquehouse/parakeet-tdt-0.6b-v3-mlx-6bit-pointwise
- Modelo base MLX: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio model-lab (mediciones y recetas): https://git.craquehouse.cc/craquehouse/model-lab
- Shim mlx-audio-pointwise: https://git.craquehouse.cc/craquehouse/mlx-audio-pointwise.git
- Colección NGC de NVIDIA: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Wrapper FastAPI para parakeet-tdt-0.6b-v3 (ONNX): https://github.com/mil-ad/parakeet-tdt-0.6b-v3-fastapi-openai

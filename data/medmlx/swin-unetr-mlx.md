# MedMLX/swin-unetr-mlx

## Resumen

SwinUNETR para CT abdominal es una implementación nativa en MLX del checkpoint `MONAI/swin_unetr_btcv_segmentation`, publicada por MedMLX. El modelo realiza segmentación semántica 3D de órganos abdominales sobre volúmenes de tomografía computarizada en formato NIfTI, produciendo 13 etiquetas de órganos más la clase de fondo. Su propósito es permitir inferencia de imagen médica directamente en Apple Silicon mediante Metal, sin depender de CUDA ni de frameworks de servidor.

La arquitectura subyacente es Swin UNETR, un transformer jerárquico con conexiones skip tipo U-Net diseñado específicamente para análisis de imagen médica 3D, descrito en el paper arXiv:2111.14791. El checkpoint original procede de MONAI y está entrenado sobre el dataset BTCV (Beyond the Cranial Vault), un corpus de referencia para segmentación abdominal multiórgano.

La relevancia de esta ficha radica en su enfoque de despliegue: pesos en formato safetensors, librería `mlx`, paquete Python `swin-unetr-mlx` y ejecución en hardware Apple. Está etiquetado explícitamente como modelo de investigación, no validado para uso clínico, con licencia Apache-2.0 sobre los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin UNETR (transformer jerárquico con skip connections tipo U-Net, 3D) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (metadatos del modelo; la tarea es de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`swinunetr.safetensors`), distribuido vía Hugging Face Hub |
| Tarea | Segmentación de imagen 3D (`image-segmentation`) |
| Entrada | CT abdominal 3D en NIfTI (`.nii.gz`) |
| Salida | 13 etiquetas de órganos + fondo |
| Modelo base | `MONAI/swin_unetr_btcv_segmentation` (fine-tune) |
| Librería | `mlx` (nativo, Apple Silicon) |
| Tamaño del repositorio | 0,3 GB |
| Hardware objetivo | Apple Silicon con Metal, Python 3.13 |
| Inferencia remota | `inference: false` (solo ejecución local) |

## Arquitectura y entrenamiento

Swin UNETR combina un encoder Swin Transformer jerárquico con un decoder convolutional tipo U-Net. El encoder procesa el volumen 3D en ventanas locales con atención desplazada entre ventanas, lo que reduce el coste computacional frente a atención global densa y captura dependencias multi-escala. Las features de cada nivel del encoder se conectan mediante skip connections al decoder, que reconstruye la segmentación a resolución completa. Esta combinación es la base del paper "Self-Supervised Pre-Training of Swin Transformers for 3D Medical Image Analysis" (arXiv:2111.14791).

El checkpoint original de MONAI está entrenado sobre el dataset BTCV para segmentación abdominal multiórgano. La model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo fases de preentrenamiento auto-supervisado en este checkpoint concreto; esos datos deben consultarse en la documentación de MONAI y en el paper de referencia. La contribución de MedMLX es la portabilidad de los pesos a MLX con un pipeline de inferencia reproducible vía el paquete `swin-unetr-mlx` (versión mínima 0.2.6).

No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o técnicas de compresión específicas en la información proporcionada.

## Capacidades

- Segmentación semántica 3D de CT abdominal en 13 clases de órganos más fondo.
- Procesamiento de volúmenes NIfTI (`.nii.gz`) como entrada directa.
- Ejecución nativa en Apple Silicon mediante MLX y Metal, sin CUDA.
- Pipeline de inferencia programático: función `run(image_path, weights_path, output_dir)` que devuelve rutas de salida.
- Descarga reproducible de pesos fijando una revisión concreta del repositorio de Hugging Face.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de visión/segmentación.
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan modos especiales como thinking mode, visión 2D general, audio o vídeo.

## Casos de uso

- Investigación en segmentación abdominal: uso del checkpoint BTCV como línea base reproducible para comparar métodos de segmentación 3D en entornos Apple Silicon, sin necesidad de GPU NVIDIA.
- Prototipado en portátiles Mac: desarrollo y depuración de pipelines de imagen médica en un MacBook con chip M-series, aprovechando la ejecución nativa Metal y evitando configurar CUDA.
- Preprocesado de datasets de CT: generación automática de máscaras multiórgano para anotación asistida o control de calidad de volúmenes antes de entrenar otros modelos.
- Docencia y formación: demostración práctica de arquitecturas transformer 3D en imagen médica con un stack ligero (`uv`, Python 3.13, MLX) y pesos de referencia.
- Evaluación comparativa de frameworks: medir diferencias de rendimiento y fidelidad numérica entre la implementación MLX y la original de MONAI sobre el mismo checkpoint.
- Integración en herramientas de escritorio: incorporar segmentación abdominal en aplicaciones locales para macOS orientadas a investigación, con procesamiento on-device y sin envío de datos a servidores externos.
- Reproducibilidad de experimentos: fijar la revisión `0052abb4...` del repositorio para garantizar que los pesos usados en un estudio son exactamente los mismos en cada ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M-series) con soporte Metal; la librería es `mlx` y el modelo está etiquetado como `native-mlx` y `apple-silicon`.
- VRAM/unified memory estimada: no disponible de forma explícita; el repositorio de pesos ocupa 0,3 GB, por lo que el modelo cabe holgadamente en la memoria unificada de cualquier Mac Apple Silicon moderno.
- GPU recomendadas: no se especifican modelos concretos de Apple Silicon en la información disponible.
- Compatibilidad con GPU consumer NVIDIA: no soportada de forma nativa por esta implementación (basada en MLX); para CUDA habría que usar el checkpoint original de MONAI.
- Opciones de despliegue: paquete Python `swin-unetr-mlx` (>=0.2.6), instalación con `uv`, descarga de pesos con `huggingface-hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/swin-unetr-mlx | Swin UNETR 3D | Segmentación CT abdominal (13 órganos + fondo) | MLX (Apple Silicon) | Apache-2.0 | Hugging Face, repo 0,3 GB |
| MONAI/swin_unetr_btcv_segmentation | Swin UNETR 3D | Segmentación CT abdominal (BTCV) | PyTorch/MONAI (CUDA/CPU) | Según MONAI (consultar) | MONAI Model Zoo |
| Otros modelos de segmentación abdominal 3D (p. ej. nnU-Net) | CNN U-Net 3D | Segmentación multiórgano | PyTorch (CUDA) | Variable según implementación | Múltiples repositorios |

La comparativa se limita a alternativas de la misma tarea; no se dispone de datos de rendimiento cuantitativos para establecer diferencias de precisión entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Modelo etiquetado como de investigación y educación; no validado para uso clínico. No debe usarse para diagnóstico ni decisiones médicas.
- Entrenado sobre BTCV, un dataset concreto; puede generalizar mal a distribuciones diferentes (otros protocolos de adquisición, poblaciones, equipos o contrastes).
- Sesgos poblacionales y de adquisición no documentados en la model card; deben asumirse los del dataset original BTCV.
- Riesgo de segmentaciones erróneas en volúmenes con artefactos, anatomía atípica o patología severa; requiere revisión por personal cualificado en cualquier contexto de investigación clínica.
- Idiomas: metadatos solo en inglés; irrelevante para la tarea de imagen, pero limita la documentación a ese idioma.
- Restricciones de licencia: pesos Apache-2.0, pero deben revisarse los avisos (`NOTICE`) y la licencia del checkpoint base de MONAI para uso comercial y redistribución.
- Dependencia de hardware Apple Silicon: la implementación MLX no se ejecuta en CUDA ni en CPU x86 de forma nativa; esto limita su despliegue en servidores convencionales.
- Sin soporte de inferencia remota (`inference: false`): todo el cómputo es local.
- No se documentan cuantizaciones ni optimizaciones de memoria; el rendimiento real en cada chip Apple Silicon no está cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedMLX/swin-unetr-mlx
- Repositorio GitHub: https://github.com/MedMLX/swin-unetr-mlx
- Documentación de ejecución: https://github.com/MedMLX/swin-unetr-mlx/blob/main/README.md#run
- Paper de MedMLX (medRxiv): https://doi.org/10.64898/2026.10.28.26366762
- Paper de Swin UNETR (arXiv): https://arxiv.org/abs/2111.14791
- Modelo base en MONAI: https://huggingface.co/MONAI/swin_unetr_btcv_segmentation
- Licencia: https://huggingface.co/MedMLX/swin-unetr-mlx/blob/main/LICENSE
- Avisos legales: https://huggingface.co/MedMLX/swin-unetr-mlx/blob/main/NOTICE
- Archivos del repositorio: https://huggingface.co/MedMLX/swin-unetr-mlx/tree/main

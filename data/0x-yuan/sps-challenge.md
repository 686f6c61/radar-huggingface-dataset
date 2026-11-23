# 0x-YuAN/sps-challenge

## Resumen

`sps-challenge` es un artefacto de evaluación publicado por el usuario 0x-YuAN en Hugging Face, no un modelo generativo al uso. Se trata de un sistema de estimación de calidad de imagen orientado a máquina (machine-oriented image quality assessment, IQA) construido sobre un fine-tuning LoRA de `Qwen/Qwen3-VL-2B-Instruct`. El repositorio empaqueta un pipeline completo de inferencia, extracción de características y entrenamiento que produce un fichero `submission.zip` con los campos `index` y `quality`.

La propuesta técnica combina tres capas: un conjunto de cinco regresores de árbol (LightGBM, XGBoost pairwise, ExtraTrees y modelos PLS factorizados), cinco adaptadores LoRA de rango 16 sobre Qwen3-VL-2B con cabezas MLP de regresión, y un mecanismo de reconstrucción de pseudo-referencias a partir de la propia colección de imágenes de entrada mediante similitud de miniaturas normalizada por rangos y clustering balanceado. El resultado es un ensemble calibrado sobre predicciones out-of-fold agrupadas.

Su relevancia es acotada: se publica como envío a un challenge con licencia `evaluation-submission-terms`, sin descargas ni likes, y con el objetivo declarado de evaluar calidad de imagen de forma automática en pipelines donde no hay referencia humana disponible. El tamaño del repositorio es de 0,4 GB y no incluye los pesos del backbone original, que debe descargarse por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble híbrido: árboles de decisión (LightGBM, XGBoost, ExtraTrees, PLS) + 5 adaptadores LoRA rango 16 sobre transformer multimodal Qwen3-VL-2B |
| Parámetros totales | no disponible (el backbone Qwen3-VL-2B-Instruct tiene 2B; los adaptadores LoRA y cabezas no reportan recuento) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el pipeline asume PyTorch CUDA, no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | evaluation-submission-terms (licencia personalizada, ver `LICENSE.md`) |
| Formato de pesos | safetensors (adaptadores LoRA y cabezas); `weights/ensemble.zip` con modelos LightGBM/XGBoost nativos y arrays de árboles de regresión |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico sino un ensemble por capas. La capa inferior son cinco adaptadores LoRA de rango 16 sobre las capas de lenguaje de Qwen3-VL-2B-Instruct, cada uno con una cabeza MLP que procesa pares (pseudo-referencia, imagen distorsionada) en un prompt compartido. Se entrenan con pérdida MSE de calidad, una pérdida de correlación por batch y pérdidas auxiliares de tarea MPD. La capa superior combina LightGBM, XGBoost pairwise, ExtraTrees y regresores de tarea factorizados, calibrados sobre predicciones out-of-fold agrupadas. El offset de referencia promedia PLS, ExtraTrees sobre características PLS, modelos PLS factorizados y la media de las predicciones LoRA, con multiplicador 1.0.

Las pseudo-referencias se reconstruyen a partir de la propia colección de test: se calcula similitud de miniaturas normalizada por rangos, se aplica clustering balanceado y se reconstruye cada referencia mediante mediana píxel a píxel. Sobre esas referencias se extraen características visuales (incluyendo embeddings DINO, según el nombre `emb_dino_test.npz`) y de acuerdo de tarea. El entrenamiento usa `data/all.csv` con columnas `index, ref, src, fold, quality` y objetivos de tarea `vqa, cap, yon, mcq, det, seg, ret`; los pliegues están fijados en `resources/method.zip`. El entrenamiento LoRA usa dos épocas y semilla 1. El banco de preguntas fijo se generó con un despliegue autoalojado de DeepSeek-V4.1-Flash, pero la inferencia no requiere ese servicio.

## Capacidades

- Estimación de calidad de imagen sin referencia explícita, mediante reconstrucción de pseudo-referencias desde la colección de entrada.
- Regresión escalar de calidad por imagen, exportada como `submission.zip` con `index` y `quality`.
- Extracción de características multimodales vía Qwen3-VL-2B (vision-language) y embeddings DINO.
- Predicción auxiliar de tareas MPD: VQA, captioning, YON, MCQ, detección, segmentación y retrieval (según nombres de columnas del manifiesto).
- Inferencia en modo caché sin GPU ni descarga del backbone, usando ficheros `feats_<group>_test.parquet` y `emb_dino_test.npz`.
- Pipeline reproducible de entrenamiento e inferencia vía `pipeline.py` con subcomandos `infer`, `features`, `train-lora` y `train`.
- No soporta tool calling, function calling ni razonamiento multi-paso como tal: es un regresor de calidad, no un agente.
- Capacidad multilingüe limitada a inglés (`language: en`).

## Casos de uso

- Evaluación automática de calidad en pipelines de generación de imágenes: el sistema recibe un lote de imágenes y devuelve una puntuación de calidad por índice, útil para filtrar salidas de modelos generativos antes de publicarlas.
- Control de calidad en datasets de entrenamiento visual: permite puntuar y ordenar imágenes de un corpus para detectar muestras degradadas (ruido, compresión, desenfoque) antes de usarlas en entrenamiento.
- Monitorización de degradación en servicios de compresión o transcodificación: al estimar calidad sin referencia, se puede comparar la salida de distintos codecs contra la colección original.
- Investigación en IQA: el repositorio incluye pipeline reproducible de entrenamiento y pliegues fijos, lo que permite replicar el ensemble y comparar variantes de características o regresores.
- Benchmarking de modelos de restauración de imagen: las puntuaciones de calidad permiten ordenar automáticamente resultados de superresolución o denoising en ausencia de referencias ground-truth.
- Filtrado de contenido en plataformas UGC: puntuar imágenes subidas por usuarios para detectar baja calidad técnica (borrosidad, artefactos) y aplicar políticas de moderación o recompresión.
- Reproducción de envíos a challenges: al empaquetar pesos, recursos y pipeline, sirve como base para generar `submission.zip` en competiciones de IQA con protocolo fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente. El backbone Qwen3-VL-2B-Instruct en precisión nativa requiere del orden de 4-6 GB de VRAM; con los cinco adaptadores LoRA y las cabezas MLP cargados simultáneamente, se recomienda al menos 8-12 GB para margen.
- GPU recomendadas: cualquier GPU CUDA compatible con PyTorch 2.14.1+cu130. Para el backbone, una RTX 4090 (24 GB) o A100/H100 son holgadas; una RTX 3060 de 12 GB debería bastar para el backbone en FP16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se cargue el backbone en FP16 y se ejecuten los adaptadores de forma secuencial.
- Modo sin GPU: el pipeline admite inferencia desde caché de características (`--cache`) sin descarga del backbone ni GPU.
- Opciones de despliegue: el repositorio solo documenta ejecución directa con `uv run python pipeline.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y probablemente no sean aplicables dado que no es un modelo generativo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados comparativos con otros sistemas de IQA (por ejemplo, CLIP-IQA, MUSIQ, TOPIQ o Q-Align), y el artefacto es un envío de challenge con licencia específica, no un modelo de propósito general comparable.

## Limitaciones y advertencias

- Licencia `evaluation-submission-terms`: restringe el uso, probablemente al ámbito de evaluación del challenge. No se debe asumir uso comercial sin revisar `LICENSE.md`.
- El modelo está diseñado exclusivamente para inglés (`language: en`); no se documenta soporte multilingüe.
- Depende de la colección de imágenes de entrada para reconstruir pseudo-referencias: si la colección no contiene grupos coherentes, la calidad de la estimación puede degradarse.
- El banco de preguntas fijo está asociado al contenido de referencia cubierto; contenidos distintos requieren preguntas de protocolo correspondientes, según advierte el autor.
- No se registraron las revisiones upstream de los backbones: la reproducibilidad exacta depende de usar los IDs y versiones de paquete listados, pero puede haber deriva si los repositorios originales cambian.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el sistema puede producir puntuaciones de calidad poco calibradas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al entrenarse sobre un dataset de challenge concreto, puede sobrerrepresentar ciertos tipos de distorsión.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de robustez.
- El paquete no incluye imágenes, cachés de entrenamiento ni salidas de runtime; quien quiera reentrenar debe aportar su propio dataset con el esquema exacto (`index, ref, src, fold, quality` más objetivos de tarea).
- Entorno muy específico: Python ≥3.12 (exportado con 3.13), PyTorch 2.14.1+cu130 y torchvision 0.29.1+cu130; versiones distintas pueden romper la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/0x-YuAN/sps-challenge
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Licencia: `LICENSE.md` dentro del repositorio
- Recursos de método: `resources/method.zip` (incluye `PRETRAINED_MODELS.md` con IDs de backbones y licencias de componentes)
- Pesos del ensemble: `weights/ensemble.zip`
- Adaptadores LoRA: `weights/lora/`

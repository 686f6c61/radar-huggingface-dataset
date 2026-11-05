# gladia/qat-transfer-open_clip

## Resumen

`gladia/qat-transfer-open_clip` es una colección de checkpoints de investigación publicada por Gladia (la empresa francesa de infraestructura de audio, con sede en Rennes) para el artículo "Zero-Shot Quantization via Weight-Space Arithmetic", aceptado en NeurIPS 2026. No es un modelo generativo ni un asistente: es un artefacto experimental compuesto por pares de checkpoints (full-precision y QAT de 3 bits) de la familia OpenCLIP, orientado a estudiar la transferencia de vectores de cuantización entre tareas.

El repositorio cubre tres backbones de visión-lenguaje de OpenCLIP preentrenados sobre LAION-2B —ViT-B/16 (`laion2b_s34b_b88k`), ViT-L/14 (`laion2b_s32b_b82k`) y ViT-H/14 (`laion2b_s32b_b79k`)— afinados sobre 22 datasets de clasificación (Cars, DTD, EuroSAT, GTSRB, MNIST, RESISC45, SUN397, SVHN, CIFAR10/100, STL10, Food101, Flowers102, FER2013, PCAM, OxfordIIITPet, RenderedSST2, EMNIST, FashionMNIST, KMNIST, TinyImageNet e ImageNet). Su relevancia es metodológica: demuestra que la diferencia entre un checkpoint QAT y su equivalente FP actúa como un "vector de cuantización" transferible a otras tareas sin datos del receptor.

El tamaño del repositorio (180 GB) refleja que contiene los 132 pares de checkpoints (3 backbones × 22 datasets × 2 variantes), más las cabezas zero-shot congeladas. La licencia es MIT, aunque los datasets de afinado conservan sus propios términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de OpenCLIP, encoder de imagen + torre de texto congelada para cabeza zero-shot |
| Parametros totales | No disponible de forma explícita; los backbones OpenCLIP ViT-B/16, ViT-L/14 y ViT-H/14 tienen aproximadamente 86M, 304M y 632M de parámetros en el encoder de imagen (dato no confirmado en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificación de imágenes; no procesa texto libre) |
| Tipos de cuantizacion | 3 bits, per-channel, con la cabeza de clasificación sin cuantizar; tanto en QAT como en PTQ de evaluación |
| Idiomas soportados | No disponible (modelo visión-lenguaje; los prompts de texto se construyen desde la torre de texto de OpenCLIP) |
| Licencia | MIT (los datasets de finetuning tienen sus propios términos) |
| Formato de pesos | PyTorch state dicts (`.pt`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

Los checkpoints se construyen sobre los pesos preentrenados de OpenCLIP en LAION-2B (ViT-B/16, ViT-L/14 y ViT-H/14) y se afinan por separado sobre cada uno de los 22 datasets de clasificación. Para cada par (backbone, dataset) se generan dos variantes: una de precisión completa (FP) y otra con Quantization-Aware Training (QAT) a 3 bits, usando Straight-Through Estimator (STE), cuantización per-channel y excluyendo la cabeza de clasificación de la cuantización. La configuración es común: AdamW, `lr=1e-5`, `wd=0.1`, sin label smoothing, gradient clipping a 1.0, semilla 2038 y schedule `mult=1`. Los modelos mayores se entrenaron con batch por dispositivo menor y acumulación de gradientes (el nombre del directorio `optim=` codifica el batch efectivo).

La innovación central es el **vector de cuantización** `QV = QAT - FP`. Sumando el QV de una tarea donante al checkpoint FP de una tarea receptora distinta (`FP_receiver + λ · QV_donor`) se recupera buena parte del beneficio del QAT bajo PTQ de 3 bits, sin necesidad de QAT en el receptor y, con `λ = 1`, sin datos del receptor. La cabeza de clasificación es la cabeza zero-shot congelada derivada de la torre de texto, almacenada una vez por modelo y dataset en `heads/vision/ilharco_open_clip/{model}/head_{dataset}.pt`. Cada directorio de ejecución contiene un único `epoch_{N}.pt` con el state dict del encoder de imagen sin cabeza.

## Capacidades

- Clasificación de imágenes zero-shot mediante la cabeza construida desde la torre de texto de OpenCLIP.
- Clasificación de imágenes con fine-tuning supervisado sobre 22 datasets de referencia.
- Inferencia bajo cuantización de 3 bits per-channel en capas lineales (PTQ) con la cabeza sin cuantizar.
- Construcción y aplicación manual de vectores de cuantización (`QV = QAT - FP`) con solo `torch`, sin dependencias adicionales.
- Transferencia de QV entre tareas donante y receptora con un único escalar `λ`, incluyendo el caso `λ = 1` sin datos del receptor.
- Evaluación comparativa FP vs. QAT vs. PTQ vs. PTQ+QV sobre los mismos pesos y cabezas.
- No soporta tool calling, function calling, agentes, generación de texto libre ni razonamiento multi-step.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá del emparejamiento imagen-texto de CLIP.

## Casos de uso

- **Investigación en cuantización zero-shot**: reproducir los experimentos del paper aplicando `QV_donor` sobre `FP_receiver` y midiendo la recuperación de accuracy bajo PTQ de 3 bits, usando los scripts de `code/experiments/*/001_qat_transfer/qv_transfer.py`.
- **Prototipado de despliegue de CLIP en 3 bits**: partir de un checkpoint FP de OpenCLIP afinado en una tarea propia, aplicar un QV donante de un dataset público similar y desplegar el modelo cuantizado sin ejecutar QAT sobre los datos propios.
- **Evaluación de robustez de la cuantización por dominio**: comparar la degradación FP→PTQ en los 22 datasets (satélite, médico, texturas, dígitos, alimentos) para identificar en qué dominios la transferencia de QV es más efectiva.
- **Benchmark de métodos de compresión**: usar los pares FP/QAT como referencia ground-truth para validar nuevas técnicas de PTQ, destilación o aritmética de pesos contra un baseline QAT real a 3 bits.
- **Estudio de aritmética de pesos en espacios de tareas**: analizar la geometría del espacio de pesos de CLIP calculando y combinando QVs de distintos datasets, útil para líneas de investigación en model merging y task arithmetic.
- **Pipeline de clasificación de imágenes de bajo coste**: desplegar un ViT-B/16 cuantizado a 3 bits con cabeza zero-shot para clasificación en dominios como EuroSAT o RESISC45 en entornos con VRAM limitada.
- **Reproducibilidad de resultados de NeurIPS**: descargar un backbone concreto (`--include "*/ViT_B_16__laion2b_s34b_b88k/*"`) y verificar las cifras del artículo con los pesos exactos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la metodología y la estructura de los checkpoints, pero no incluye tablas de accuracy, y la búsqueda web no aporta métricas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa (no confirmada en la información proporcionada), un ViT-B/16 en FP ocupa del orden de cientos de MB en FP16, y en 3 bits per-channel la reducción es significativa pero el formato de almacenamiento publicado es FP32 (`epoch_{N}.pt`), por lo que la cuantización se aplica en tiempo de evaluación.
- GPU recomendadas: no especificadas. Los tres backbones (B/16, L/14, H/14) son de tamaño moderado y caben en GPUs de consumo tipo RTX 4090 para inferencia; el entrenamiento QAT se realizó con acumulación de gradientes en los modelos mayores, lo que sugiere memoria limitada por dispositivo.
- Cabe en GPU de consumo: previsiblemente sí para ViT-B/16 y ViT-L/14; ViT-H/14 requiere más memoria pero sigue siendo viable en GPUs de 24 GB en inferencia (no confirmado).
- Opciones de despliegue: PyTorch nativo (los checkpoints son state dicts planos), `open_clip` para cargar el backbone y la cabeza, y `huggingface_hub` para la descarga. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros (encoder imagen) | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gladia/qat-transfer-open_clip` | 3 backbones ViT-B/16, L/14, H/14 | No aplica | QAT y PTQ a 3 bits per-channel | MIT | HuggingFace (180 GB) |
| OpenCLIP LAION-2B (upstream) | Mismos backbones | No aplica | Solo FP | MIT | HuggingFace / open_clip |
| `gladia/qat-transfer-timm` | Backbones timm | No aplica | QAT y PTQ a 3 bits | MIT (según repo hermano) | HuggingFace |
| `gladia/qat-transfer-text` | Modelos de texto | No disponible | QAT y PTQ a 3 bits | MIT (según repo hermano) | HuggingFace |

La comparación relevante es contra los checkpoints OpenCLIP originales (misma arquitectura, sin QAT) y contra las otras familias del mismo proyecto (timm, text, vae), que aplican la misma metodología a otros dominios. No se dispone de datos de rendimiento para comparar accuracy entre ellos.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo realiza clasificación de imágenes con cabezas zero-shot predefinidas; no genera texto ni mantiene conversaciones.
- El repositorio pesa 180 GB; descargar todo el conjunto requiere espacio en disco considerable. Se recomienda usar `--include` para bajar un único backbone.
- Los pesos se distribuyen como state dicts FP32 en `.pt`; la cuantización a 3 bits se aplica en evaluación, no está "horneada" en el archivo.
- La cabeza de clasificación debe obtenerse por separado desde `heads/vision/ilharco_open_clip/`; sin ella el checkpoint es inutilizable para clasificación.
- El método de transferencia de QV está validado en el paper, pero su efectividad varía por par donante-receptor y por dominio; no se garantiza recuperación completa del rendimiento QAT.
- Los datasets de finetuning (EuroSAT, PCAM, FER2013, etc.) tienen licencias propias que pueden restringir el uso comercial de los checkpoints derivados, aunque el código y los pesos base sean MIT.
- Riesgo de sesgos heredados de LAION-2B y de los datasets de afinado (por ejemplo, FER2013 en rostros o PCAM en histopatología), no evaluados en la información disponible.
- No hay métricas publicadas de robustez, calibración ni degradación por cuantización en la model card; cualquier uso en producción requiere evaluación propia.
- El artículo está fechado en 2026 y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto de investigación reciente sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/gladia/qat-transfer-open_clip
- Repositorio de código: https://github.com/gladia-research-group/qat-transfer
- arXiv: https://arxiv.org/abs/2604.03420
- OpenReview: https://openreview.net/forum?id=wrUEnnSgXa
- Grafo de investigación (Flywheel): https://flywheel.paradigma.inc/node/de486ca0-8e83-4041-bbf6-0b0be565435b
- Repo hermano (timm): https://huggingface.co/gladia/qat-transfer-timm
- Repo hermano (texto): https://huggingface.co/gladia/qat-transfer-text
- Repo hermano (VAE): https://huggingface.co/gladia/qat-transfer-vae
- Web de Gladia: https://www.gladia.io/
- Documentación de Gladia: https://docs.gladia.io/chapters/introduction

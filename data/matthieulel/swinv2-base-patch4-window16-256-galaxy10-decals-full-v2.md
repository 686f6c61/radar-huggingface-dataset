# matthieulel/swinv2-base-patch4-window16-256-galaxy10-decals-full-v2

## Resumen

El modelo `swinv2-base-patch4-window16-256-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel` como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/swinv2-base-patch4-window16-256` sobre el conjunto de datos Galaxy10 DECaLS, que contiene 17.736 imágenes de galaxias etiquetadas en 10 clases morfológicas.

El modelo resuelve una tarea concreta de visión por computador en astronomía: clasificar la forma de galaxias a partir de imágenes del sondeo DECaLS. Es relevante porque forma parte de un estudio sistemático (80 configuraciones: 40 backbones preentrenados por dos regímenes de adaptación) que compara modelos fundacionales de visión en datos astronómicos, con un protocolo de evaluación reproducible y métricas por época publicadas.

Arquitectura Swin Transformer V2 (variante base, patch size 4, ventana 16, resolución 256x256) con 86,9 millones de parámetros totales. El checkpoint seleccionado corresponde a la época 17 de 30 (mínima pérdida de validación) y alcanza un 85,51 % de accuracy y un 85,46 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (base, patch 4, ventana 16, entrada 256x256) |
| Parametros totales | 86.904.066 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,3 GB) |

## Arquitectura y entrenamiento

El backbone es un Swin Transformer V2 en configuración base (`microsoft/swinv2-base-patch4-window16-256`), una arquitectura de transformer jerárquico con atención por ventanas desplazadas, patch embedding de 4x4 y ventanas de 16x16 sobre entradas de 256x256 píxeles. Sobre la salida del backbone se añade una única capa lineal con diez salidas, una por clase morfológica. El ajuste es completo: se actualizan todos los parámetros del modelo, no solo la cabeza de clasificación.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reservó como conjunto de test; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta, idéntica para los 40 backbones del estudio, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, scheduler lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación usa resize y center crop a 256x256 px con la normalización del procesador de imágenes del checkpoint. El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0. No se documenta uso de RLHF, DPO ni decodificación especulativa, por tratarse de un modelo de clasificación y no generativo.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica sobre el conjunto Galaxy10 DECaLS.
- Extracción de características visuales mediante un backbone Swin Transformer V2 preentrenado y ajustado completamente.
- Inferencia determinista con salida de logits por clase (capa lineal de 10 salidas).
- Verificación de integridad: el autor comprobó que las predicciones del checkpoint recargado coinciden al 100 % con los logits guardados de la época seleccionada en las primeras 96 imágenes de test (diferencia absoluta máxima de 6,68e-06).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo "thinking" ni de visión general más allá de la clasificación de imágenes astronómicas.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en pipelines astronómicos: el modelo recibe recortes de 256x256 px de imágenes DECaLS y devuelve una de las 10 clases morfológicas, lo que permite procesar catálogos de imágenes de forma masiva sin intervención manual.
- Etiquetado previo y priorización en estudios de morfología galáctica: sirve como primer paso para seleccionar subconjuntos de galaxias de interés (por ejemplo, espirales barradas o irregulares) antes de una inspección visual detallada.
- Validación cruzada de clasificaciones existentes: al ser un ajuste fino completo con métricas por época publicadas, se puede usar como referencia reproducible para comparar con otros clasificadores o con anotaciones humanas.
- Benchmark de modelos fundacionales de visión en astronomía: forma parte de una colección de 80 configuraciones, por lo que es adecuado como baseline en experimentos que evalúen la transferibilidad de backbones de visión a datos científicos.
- Docencia y experimentación en visión por computador aplicada: su tamaño reducido (0,3 GB, 86,9 M de parámetros) permite ejecutarlo en entornos docentes o de prototipado con recursos limitados.
- Integración en servicios de inferencia de imágenes: al ser compatible con `transformers` y con endpoints, puede desplegarse como API de clasificación para aplicaciones de divulgación o investigación que necesiten etiquetar imágenes astronómicas bajo demanda.
- Reproducibilidad de resultados científicos: el autor publica los índices del split, las métricas por época y los pesos de la época seleccionada, lo que facilita replicar el experimento en el marco del paper en revisión para *Astronomy and Computing*.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (conjunto de test reservado, 1.774 imágenes; no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 17 de 30) | 85,51 % |
| F1 ponderado (seed 42, época 17 de 30) | 85,46 % |
| Accuracy media +/- desv. típica (seeds 42, 1, 2) | 84,89 % +/- 0,57 |
| F1 ponderado medio +/- desv. típica (seeds 42, 1, 2) | 84,57 % +/- 0,81 |

Evolución seleccionada de métricas por época (seed 42): la accuracy de test pasa del 50,85 % en la época 1 al 85,51 % en la época 17 (seleccionada por mínima pérdida de validación, 0,4405), con un máximo de accuracy de validación del 86,92 % en la época 19 y un máximo de accuracy de test del 85,51 % en la época 17. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB para los pesos (86,9 M de parámetros x 4 bytes), más overhead de activaciones; en la práctica, menos de 2 GB para batches pequeños a 256x256 px.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB para los pesos, más activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp32 con batches moderados; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Para entrenamiento con batch efectivo 256 en fp32 se requiere una GPU con más memoria (el autor no especifica el modelo exacto empleado).
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, incluso con cuantización a fp16 o int8.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; compatible con endpoints de Hugging Face; puede exportarse a ONNX o TorchScript para servir con infraestructura propia. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un Swin V2 base a 256x256, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre el mismo conjunto de test, por lo que la comparación numérica directa no está disponible. La comparación se limita a características estructurales:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swinv2-base-patch4-window16-256-galaxy10-decals-full-v2 (este) | 86,9 M | Imagen 256x256 px | Clasificación de morfología galáctica (10 clases) | Apache 2.0 | Hugging Face, 18 descargas |
| microsoft/swinv2-base-patch4-window16-256 (base) | ~88 M (no confirmado en la información) | Imagen 256x256 px | Clasificación de imágenes genérica (ImageNet) | no disponible en la información | Hugging Face |
| Otros backbones de la colección Vision Foundation Models Benchmark | no disponible | no disponible | Clasificación de morfología galáctica | no disponible | Hugging Face (colección del autor) |

El autor indica que este checkpoint es una de las 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) de la colección *Vision Foundation Models Benchmark*, pero no se incluyen en la información proporcionada las métricas de los demás modelos para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de imágenes de galaxias del conjunto Galaxy10 DECaLS; no es un modelo de propósito general ni generativo.
- El dominio de aplicación está acotado a imágenes astronómicas con la distribución, resolución y preprocesado de DECaLS; el rendimiento puede degradarse con imágenes de otros sondeos o con condiciones de observación distintas.
- Riesgo de sesgo de clase y de dominio: el conjunto Galaxy10 DECaLS tiene un desbalance de clases y una selección concreta de galaxias, lo que puede sesgar las predicciones hacia las clases mayoritarias.
- Riesgo de sobreajuste al split: las métricas se seleccionan por mínima pérdida de validación y se reportan sobre un test reservado, pero el autor no ha publicado una validación independiente externa.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el paper y el modelo original en publicaciones derivadas.
- No se documentan cuantizaciones oficiales ni latencias de producción, por lo que cualquier despliegue a gran escala requiere una evaluación propia de rendimiento.
- El paper asociado está en revisión para *Astronomy and Computing*; la cita definitiva no está disponible aún.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-base-patch4-window16-256-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-base-patch4-window16-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper en revisión: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación.

# matthieulel/vit-large-patch32-384-galaxy10-decals-head-v2

## Resumen

`vit-large-patch32-384-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por matthieulel como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un Vision Transformer grande (`google/vit-large-patch32-384`) adaptado mediante *head-only fine-tuning* al conjunto de datos Galaxy10 DECaLS, que distingue diez clases morfológicas de galaxias a partir de imágenes del sondeo Dark Energy Camera Legacy Survey.

El modelo forma parte de un estudio sistemático de 80 configuraciones (40 backbones preentrenados × dos regímenes de adaptación) descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su interés radica en que sirve como referencia reproducible para evaluar hasta qué punto un backbone de visión generalista, congelado, puede transferirse a una tarea astronómica de clasificación fina sin reentrenar los pesos convolucionales o de atención.

Con 305,6 millones de parámetros y una ventana de entrada de 384×384 píxeles, el modelo alcanza un 55,64 % de accuracy y un 53,38 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes. La licencia Apache 2.0 y el formato safetensors lo hacen directamente desplegable con la librería `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch 32, resolución 384) |
| Parámetros totales | 305.617.930 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 384×384 px) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es un ViT-Large estándar de Google con parches de 32×32 píxeles y resolución de entrada de 384×384, cuyos pesos permanecen congelados, incluidas las estadísticas de sus capas de normalización. Sobre él se añade una única capa lineal de diez salidas que constituye la cabeza de clasificación entrenada. El régimen es, por tanto, *linear probing* puro: no se actualiza ningún parámetro del transformer.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con una partición estratificada por clase de 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test reservado. Se usó AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, clipping de gradiente 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 con acumulación en 8 pasos (batch efectivo 256), 30 épocas en fp32 con TF32 desactivado y una sola GPU. La aumentación consistió en random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 384×384 con la normalización del image processor del checkpoint base. La época seleccionada es la de mínima pérdida de validación (época 30). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en diez clases morfológicas de galaxias del sondeo DECaLS.
- Extracción de características visuales mediante el backbone ViT-Large congelado (utilizable como encoder genérico).
- Inferencia determinista en fp32 con preprocesado estándar de `transformers`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No dispone de modo *thinking*, visión-lenguaje, audio ni funcionalidades conversacionales.
- El modelo es monolingüe por naturaleza: no procesa texto.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: integrado como etapa de inferencia sobre recortes de imágenes DECaLS para etiquetar galaxias en diez categorías, con un coste computacional bajo al tener el backbone congelado y solo una capa lineal entrenada.
- **Etiquetado preliminar para sondeos masivos**: uso como primer filtro sobre catálogos de imágenes antes de revisión humana, aprovechando su accuracy del 55,6 % como referencia de *baseline* transferible.
- **Reproducción de experimentos de transferencia**: el checkpoint sirve para replicar los resultados del artículo *When foundation models meet astronomical data* y comparar con los otros 39 backbones del benchmark.
- **Extracción de embeddings para clustering**: al conservar el backbone ViT-Large intacto, la salida del `[CLS]` puede emplearse para agrupar galaxias por similitud visual antes de asignar etiquetas supervisadas.
- **Docencia y divulgación en astronomía computacional**: ejemplo compacto y reproducible de *linear probing* sobre un foundation model de visión aplicado a datos reales de sondeos.
- **Evaluación comparativa de backbones**: incluido en la colección *Vision Foundation Models Benchmark*, permite medir la brecha entre modelos generalistas y especializados en morfología galáctica.
- **Prototipado rápido en CPU/GPU consumer**: con 305 M de parámetros en fp32 (~1,2 GB), cabe en GPUs de gama media para experimentación académica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test reservado, 1.774 imágenes):

| Métrica | Semilla 42 (checkpoint) | Media ± s.d. (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 55,64 | 55,62 ± 0,42 |
| Weighted F1 (%) | 53,38 | 53,27 ± 0,43 |

Las métricas se calculan en la época de mínima pérdida de validación (época 30 de 30). No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- **VRAM estimada en fp32**: aproximadamente 1,3-1,5 GB para pesos e inferencia con batch pequeño; el repositorio ocupa 1,2 GB.
- **GPU recomendadas**: cualquier GPU con ≥4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100, H100 funcionan sin problema.
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo (RTX 3050 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: `transformers` (PyTorch), `optimum` para exportación a ONNX, TorchScript; no se han publicado variantes GGUF para llama.cpp ni integración específica con vLLM/TGI (vLLM soporta ViT pero no se documenta para este checkpoint).
- **Latencia y throughput**: no disponibles en la información proporcionada; al ser un ViT-L/32 a 384 px, se espera un throughput moderado en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-large-patch32-384-galaxy10-decals-head-v2 | 305,6 M | 384×384 px | 55,64 % (test) | Apache 2.0 | Hugging Face |
| Otros backbones del mismo benchmark (39 restantes) | variable | variable | no disponible en esta ficha | variable | colección *Vision Foundation Models Benchmark* |
| Modelos especializados en morfología galáctica (p. ej. Zoobot, Galaxy Zoo) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos alternativos sobre el mismo split, por lo que la comparación cuantitativa queda limitada al propio benchmark del autor.

## Limitaciones y advertencias

- **Rendimiento moderado**: 55,6 % de accuracy en diez clases indica confusión significativa entre morfologías; no es adecuado como clasificador de producción sin revisión humana.
- **Riesgo de sesgo de dominio**: entrenado exclusivamente con imágenes DECaLS; el rendimiento puede degradarse en imágenes de otros sondeos (SDSS, Hubble, JWST) con distinta PSF, profundidad o filtros.
- **Backbone congelado**: al no ajustar el encoder, el modelo no aprovecha el dominio astronómico más allá de lo que la cabeza lineal puede corregir; un fine-tuning completo podría mejorar sustancialmente.
- **Sin datos de calibración**: no se publican matrices de confusión ni métricas por clase, por lo que se desconoce qué morfologías concentran los errores.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base `google/vit-large-patch32-384` debe verificarse por separado (también Apache 2.0 en su origen).
- **Sin variantes cuantizadas**: no hay pesos GGUF/ONNX oficiales; el despliegue en entornos sin PyTorch requiere exportación manual.
- **Modelo de un solo propósito**: no debe emplearse para tareas de visión general fuera de la clasificación morfológica sin validación previa.
- **Fecha de creación futura**: la model card indica 2026-10-30, lo que conviene contrastar antes de citarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-large-patch32-384-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-large-patch32-384
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026; cita pendiente de publicación)

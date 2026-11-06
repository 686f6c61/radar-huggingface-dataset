# matthieulel/swinv2-base-patch4-window16-256-galaxy10-decals-head-v2

## Resumen

El modelo `swinv2-base-patch4-window16-256-galaxy10-decals-head-v2` es un clasificador de imagen especializado en morfología de galaxias, desarrollado por matthieulel como parte del benchmark *Vision Foundation Models Benchmark*. Se construye sobre el backbone `microsoft/swinv2-base-patch4-window16-256` (arquitectura Swin Transformer V2, con atención por ventanas desplazadas y resolución nativa de 256x256 píxeles) y se adapta al dataset Galaxy10 DECaLS, que contiene 17.736 imágenes etiquetadas en 10 clases morfológicas.

La adaptación se ha realizado mediante *head-only fine-tuning*: el backbone permanece congelado (incluidas las estadísticas de sus capas de normalización) y únicamente se entrena una cabeza lineal de 10 salidas. Este régimen forma parte de un estudio comparativo más amplio (40 backbones preentrenados x 2 regímenes de adaptación) descrito en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo es relevante como referencia reproducible y ligera (86,9 M de parámetros, repo de 0,3 GB) para evaluar hasta qué punto un backbone genérico de visión, sin reentrenamiento profundo, es capaz de discriminar morfologías galácticas. Su licencia Apache 2.0 y su integración nativa con `transformers` facilitan su uso como línea base en pipelines de astronomía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (vision transformer jerárquico con atención por ventanas desplazadas), backbone + cabeza lineal |
| Parametros totales | 86.904.066 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El backbone es Swin Transformer V2 en configuración *base*, con parches de 4x4 y ventanas de atención de 16x16 sobre entradas de 256x256 píxeles. Swin V2 introduce mejoras sobre Swin V1 orientadas a estabilidad y escalado (normalización coseno en la atención, log-cumulative scaling y técnicas de preentrenamiento continuado), lo que lo hace adecuado para transferencia a dominios visuales distintos del natural. En este repositorio el backbone se mantiene congelado y solo se entrena una capa lineal de 10 salidas que mapea el vector global a las 10 clases de Galaxy10 DECaLS.

El entrenamiento sigue una receta idéntica para los 40 backbones del benchmark: AdamW (betas 0.9/0.999, eps 1e-8, weight decay 0.1, gradient clipping 1.0), learning rate 1e-4 con schedule lineal y 10% de warm-up, batches de 32 con acumulación en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. Aumentación: random resized crop a la resolución de entrada y flip horizontal aleatorio. Evaluación: resize y center crop a 256x256 px con la normalización del image processor del checkpoint. Los datos se dividen estratificadamente por clase: 14.188 imágenes de entrenamiento, 1.774 de validación (usadas solo para seleccionar época) y 1.774 de test reservado. La época seleccionada es la de mínima pérdida de validación (época 30). Software: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1, torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone Swin V2 congelado (representaciones jerárquicas multiescala).
- Inferencia determinista y reproducible: verificación de integridad con predicciones idénticas al 100% en 96 imágenes de test (diferencia máxima absoluta de logits 9,54e-07).
- Integración directa con `AutoModelForImageClassification` y `AutoImageProcessor` de `transformers`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No incorpora modo *thinking* ni decodificación especulativa (no aplica a un clasificador).

## Casos de uso

- Clasificación morfológica automatizada en catálogos astronómicos: el modelo asigna una de las 10 clases de Galaxy10 DECaLS a cada recorte de galaxia, permitiendo etiquetar grandes volúmenes de imágenes procedentes de DECaLS con un coste computacional bajo (86,9 M de parámetros).
- Línea base en estudios comparativos de foundation models: sirve como referencia reproducible del régimen *head-only* para contrastar con fine-tuning completo u otros backbones en el mismo benchmark.
- Filtrado previo en pipelines de selección de candidatos: descarta o prioriza imágenes por clase morfológica antes de análisis más costosos (espectroscopía, ajuste de perfiles de brillo).
- Docencia y divulgación en astronomía computacional: ejemplo mínimo y bien documentado de transferencia de un backbone visual genérico a un dominio científico, con métricas por época publicadas.
- Validación de protocolos de evaluación: la separación train/val/test y las métricas por semilla permiten auditar la robustez de recetas de adaptación en datos astronómicos.
- Prototipado rápido en investigación: al ser un checkpoint ligero (0,3 GB) y con licencia Apache 2.0, se puede desplegar en una GPU de consumo para experimentos exploratorios de morfología galáctica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (test reservado, 1.774 imágenes, dataset Galaxy10 DECaLS):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 30 seleccionada) | 47,63% |
| Weighted F1 (seed 42, época 30 seleccionada) | 44,52% |
| Accuracy media +/- desv. típica (seeds 42, 1, 2) | 48,01 +/- 0,40% |
| Weighted F1 media +/- desv. típica (seeds 42, 1, 2) | 44,95 +/- 0,43% |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para el modelo completo (86,9 M de parámetros); en la práctica dominada por el tamaño del batch de imágenes de 256x256 px.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX o TorchScript para servir; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento se realizó en una sola GPU con batch efectivo 256, lo que sugiere throughput alto en hardware moderno, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de clasificadores alternativos de morfología galáctica, por lo que la comparativa cuantitativa no está disponible. Cualitativamente:

| Modelo | Parametros | Contexto/entrada | Licencia | Notas |
|---|---|---|---|---|
| Este checkpoint (Swin V2 base + cabeza lineal) | 86,9 M | Imagen 256x256 px | Apache 2.0 | Head-only fine-tuning, accuracy 47,63% en test |
| Backbone base `microsoft/swinv2-base-patch4-window16-256` | ~86,9 M (sin cabeza de 10 clases) | Imagen 256x256 px | Apache 2.0 | Preentrenado genérico, sin adaptación a galaxias |
| Otros backbones del benchmark (40 configuraciones) | no disponible | no disponible | no disponible | Resultados en el dataset `vision-foundation-models-benchmark-runs` |

## Limitaciones y advertencias

- Rendimiento moderado: accuracy de 47,63% y F1 ponderado de 44,52% en test, lejos de un clasificador especializado entrenado de extremo a extremo; el régimen *head-only* limita la adaptación al dominio astronómico.
- Sesgos de dominio: el modelo solo se ha evaluado en Galaxy10 DECaLS; su comportamiento en otras encuestas (SDSS, Euclid, LSST) o en imágenes con distinta profundidad, ruido o resolución no está caracterizado.
- Riesgo de alucinación en sentido laxo: al ser un clasificador, siempre asigna una de las 10 clases, incluso ante imágenes fuera de distribución o de baja calidad, sin mecanismo de abstención.
- Limitaciones de idioma: no aplica (modelo de visión sin procesamiento de lenguaje).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene verificar la licencia del dataset Galaxy10 DECaLS por separado.
- Caveat de producción: el checkpoint incluye el backbone congelado con las estadísticas originales de normalización; cualquier cambio en el preprocesado (resolución, normalización) degradará el rendimiento.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; se basan en una única semilla principal (42) con media de tres semillas.
- Reproducibilidad dependiente de la división de datos: los índices de train/val/test están en el dataset `vision-foundation-models-benchmark-runs`; sin ellos, la comparación con otros modelos no es directamente reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-base-patch4-window16-256-galaxy10-decals-head-v2
- Backbone base: https://huggingface.co/microsoft/swinv2-base-patch4-window16-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona URL directa)

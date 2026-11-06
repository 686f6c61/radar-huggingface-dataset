# matthieulel/swinv2-tiny-patch4-window16-256-galaxy10-decals-full-v2

## Resumen

El modelo `swinv2-tiny-patch4-window16-256-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel`. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/swinv2-tiny-patch4-window16-256`, un transformer de visión jerárquico con atención por ventanas desplazadas, sobre el conjunto de datos Galaxy10 DECaLS, que consta de 10 clases morfológicas y 17.736 imágenes.

El modelo resuelve una tarea concreta y acotada: asignar una de diez categorías morfológicas a una imagen de galaxia procedente del sondeo DECaLS. Forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026), lo que lo convierte en una pieza de un benchmark reproducible más que en un modelo de propósito general.

Con 27.585.844 parámetros totales y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para inferencia en un solo dispositivo. Su relevancia actual radica en la creciente aplicación de modelos fundacionales de visión a datos astronómicos y en la disponibilidad de un protocolo de entrenamiento y evaluación completamente documentado, con métricas por época y comprobación de integridad de los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer de visión jerárquico con atención por ventanas desplazadas) |
| Parámetros totales | 27.585.844 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 256x256 px) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es Swin Transformer V2 en su variante tiny, con parches de 4x4 píxeles y ventanas de atención de 16x16, preentrenada por Microsoft a resolución de 256x256. El modelo base se ha adaptado sustituyendo la cabeza de clasificación por una capa lineal única con diez salidas, una por clase morfológica, y se ha sometido a un ajuste fino completo: se actualizan todos los parámetros, no solo la cabeza.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reservó como conjunto de evaluación held-out; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta, idéntica para los 40 backbones del benchmark, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0), tasa de aprendizaje 5e-5 con schedule lineal y 10% de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio; la evaluación aplica redimensionado y recorte central a 256x256 px con la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 19 de 30). El software utilizado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, por tratarse de un modelo de clasificación.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas del esquema Galaxy10 DECaLS.
- Extracción de representaciones visuales mediante el backbone Swin V2, reutilizable para otras tareas de visión astronómica.
- Inferencia sobre imágenes de 256x256 px con el procesador de imágenes incluido en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.
- Ofrece logits por clase, lo que permite umbrales de confianza y análisis de incertidumbre a nivel de muestra.

## Casos de uso

- Clasificación morfológica automatizada en pipelines de sondeos astronómicos: el modelo asigna una de las diez clases Galaxy10 DECaLS a cada imagen de 256x256 px, lo que permite procesar lotes de recortes de galaxias procedentes de DECaLS sin intervención manual y con una precisión de referencia del 84,72% en el test held-out.
- Etiquetado asistido para creación de catálogos: las predicciones con sus logits asociados pueden usarse para preetiquetar imágenes y priorizar la revisión humana, reduciendo el coste de construir catálogos morfológicos a gran escala.
- Filtrado y control de calidad de datasets: al ser un modelo pequeño (27,6 M de parámetros) y con pesos de 0,1 GB, puede ejecutarse sobre lotes completos para detectar imágenes mal etiquetadas o fuera de distribución antes de entrenar modelos mayores.
- Línea base reproducible en investigación: forma parte de un benchmark de 80 configuraciones con receta y splits documentados, por lo que sirve como referencia para comparar nuevos backbones o estrategias de adaptación en el mismo conjunto de datos.
- Extracción de características para modelos posteriores: el backbone ajustado puede congelarse y usarse como extractor de embeddings para clustering morfológico, búsqueda por similitud o entrenamiento de clasificadores con menos datos.
- Docencia y prototipado en astroinformática: su tamaño reducido permite ejecutar ejemplos completos de ajuste fino y evaluación en una única GPU de consumo, lo que facilita reproducir el protocolo del artículo en cursos o entornos con recursos limitados.
- Despliegue en entornos con restricciones de memoria: al ocupar 0,1 GB en safetensors, puede servirse en CPUs o GPUs modestas para clasificación por lotes en servicios internos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card. El conjunto de evaluación es el split de test held-out de Galaxy10 DECaLS (1.774 imágenes).

| Métrica | Valor (seed 42, época 19) | Media ± desviación típica (seeds 42, 1, 2) |
|---|---|---|
| Accuracy | 84,72% | 85,14% ± 0,77% |
| F1 ponderado | 84,24% | 84,81% ± 0,81% |

Evolución seleccionada del entrenamiento (seed 42): la accuracy de test pasa de 48,31% en la época 1 a 82,92% en la época 8, 84,39% en la época 15 y 84,72% en la época 19 (seleccionada por mínima pérdida de validación, 0,4621). La mejor accuracy de test observada en la tabla por épocas es 85,51% en la época 17 y 84,95% en la época 23, aunque la selección se realizó por pérdida de validación, no por test. No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para lotes pequeños, dado el tamaño de 27,6 M de parámetros (aproximadamente 110 MB de pesos en fp32) más activaciones de un modelo tiny a 256x256 px.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento documentado se realizó en una sola GPU, sin especificar el modelo exacto.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con `AutoModelForImageClassification` y `AutoImageProcessor`; el tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo de visión.
- Latencia y throughput: no disponibles en la información proporcionada.
- Comprobación de integridad: el autor recargó el modelo y lo ejecutó sobre las primeras 96 imágenes de test, obteniendo predicciones idénticas a los logits guardados de la época seleccionada en el 100% de los casos, con una diferencia absoluta máxima de logit de 5,30e-06.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre el mismo split de Galaxy10 DECaLS, por lo que no es posible establecer una comparativa numérica fiable. La comparación estructural con alternativas de la misma categoría es la siguiente:

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Swin V2 tiny, fine-tuning completo) | 27,6 M | 256x256 px | Clasificación Galaxy10 DECaLS (10 clases) | Apache 2.0 | Hugging Face |
| microsoft/swinv2-tiny-patch4-window16-256 | 27,6 M (aprox.) | 256x256 px | Clasificación ImageNet-1k (1000 clases) | no disponible en la información | Hugging Face |
| Otros backbones del benchmark (40 backbones x 2 regímenes) | variable | variable | Clasificación Galaxy10 DECaLS | variable | Colección Vision Foundation Models Benchmark |

El modelo base sin ajustar no es directamente comparable en la tarea astronómica, ya que está entrenado para clases de ImageNet. Las métricas del resto de configuraciones del benchmark están publicadas en el dataset `vision-foundation-models-benchmark-runs`, pero no se incluyen en la información disponible.

## Limitaciones y advertencias

- Modelo especializado: solo predice las diez clases del esquema Galaxy10 DECaLS; no es un clasificador morfológico general ni un modelo de propósito general.
- Dominio restringido: entrenado exclusivamente con imágenes de DECaLS a 256x256 px; su rendimiento puede degradarse con imágenes de otros sondeos, otras resoluciones o distintas condiciones de ruido y seeing.
- Riesgo de alucinación en sentido amplio: como todo clasificador, puede asignar clases con alta confianza a imágenes ambiguas, atípicas o fuera de distribución; se recomienda usar los logits y umbrales de confianza.
- Sesgos de dataset: las 17.736 imágenes de Galaxy10 DECaLS no representan uniformemente el espacio de morfologías ni todas las poblaciones de galaxias; el desbalance de clases puede afectar a clases minoritarias, reflejado en la diferencia entre accuracy (84,72%) y F1 ponderado (84,24%).
- Sin capacidades de texto ni multilingües: no procesa lenguaje, por lo que no puede usarse para tareas de VLM, tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el modelo; conviene revisar los términos del dataset Galaxy10 DECaLS por separado.
- Resultados no verificados: las métricas de la model-index figuran con `verified: false` y el artículo está en revisión, por lo que los números deben citarse como declarados por el autor.
- Reproducibilidad parcial: la receta y los splits están documentados, pero la selección de época por pérdida de validación y la variabilidad entre semillas (±0,77% en accuracy) deben tenerse en cuenta al comparar con otros modelos.
- Sin datos de latencia ni throughput: no se han publicado mediciones de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-tiny-patch4-window16-256-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-tiny-patch4-window16-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona URL)

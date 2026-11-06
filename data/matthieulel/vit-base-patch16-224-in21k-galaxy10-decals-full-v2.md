# matthieulel/vit-base-patch16-224-in21k-galaxy10-decals-full-v2

## Resumen

`vit-base-patch16-224-in21k-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes desarrollado por matthieulel, consistente en un Vision Transformer base (ViT-B/16) preentrenado en ImageNet-21k por Google y ajustado completamente (full fine-tuning) para clasificar morfología de galaxias en el conjunto Galaxy10 DECaLS, con 10 clases de salida. El modelo forma parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) evaluadas bajo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

La relevancia del checkpoint reside en su función como referencia reproducible dentro de un benchmark de modelos fundacionales de visión aplicados a datos astronómicos: el autor publica el protocolo de entrenamiento completo, las métricas por época de todas las semillas y los índices de las particiones de datos. El modelo alcanza un 84,27 % de accuracy y un 84,04 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes, con una media de 84,24 ± 0,23 % sobre tres semillas.

Arquitecturalmente es un transformer de visión estándar con 85,8 millones de parámetros, parches de 16x16 píxeles y resolución de entrada de 224x224. No es un modelo generativo ni conversacional: es un clasificador de imagen puro con una única capa lineal de 10 salidas, licencia Apache 2.0 y pesos en formato safetensors. Su interés es sectorial (astronomía, ciencia de datos) y su uso previsto es la inferencia sobre recortes de galaxias procedentes de DECaLS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16), transformer de visión con parches 16x16 |
| Parámetros totales | 85.806.346 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen, entrada 224x224 px) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización posterior vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un ViT-B/16: un transformer de visión con parches de 16x16 píxeles sobre entradas de 224x224, inicializado desde `google/vit-base-patch16-224-in21k` (preentrenado en ImageNet-21k) y ajustado completamente, actualizando todos los parámetros. La cabeza de clasificación es una única capa lineal con diez salidas correspondientes a las clases morfológicas de Galaxy10 DECaLS.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). La partición pública de test (1.774 imágenes) se reservó como test final; la partición pública de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta, idéntica para los 40 backbones del benchmark, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, scheduler lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio. La evaluación aplica resize y center crop a 224x224 px seguidos de la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 19). El software utilizado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0. El autor declara una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coincidieron con los logits guardados de la época seleccionada en el 100 % de los casos (diferencia absoluta máxima de logit de 1,29e-05).

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Salida de logits por clase mediante `AutoModelForImageClassification`; permite obtener probabilidades tras aplicar softmax.
- Inferencia sobre recortes de 224x224 px con el preprocesado documentado (resize, center crop y normalización del procesador).
- Integración nativa con la librería `transformers` (clases `AutoImageProcessor` y `AutoModelForImageClassification`).
- Compatibilidad con el pipeline `image-classification` de Hugging Face y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- No dispone de capacidades multilingües: no procesa texto.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo recibe recortes de galaxias de DECaLS y devuelve una de las 10 clases morfológicas, lo que permite etiquetar catálogos de imágenes a gran escala sin intervención manual, con una accuracy de referencia del 84,27 % en test.
- Triaje y priorización de observaciones: en flujos de análisis de imágenes de sondeos, el clasificador puede separar morfologías de interés (por ejemplo, espirales frente a elípticas) para que los astrónomos revisen manualmente solo un subconjunto, reduciendo el coste de inspección visual.
- Validación de pipelines de preprocesado: al ser un checkpoint con protocolo reproducible y particiones documentadas, sirve como referencia para comprobar que un pipeline propio de recorte, normalización y resize reproduce los resultados publicados.
- Benchmark de modelos fundacionales de visión: el checkpoint es una de las 80 configuraciones del *Vision Foundation Models Benchmark*, por lo que se usa para comparar backbones preentrenados y regímenes de adaptación (full fine-tuning frente a otras estrategias) en datos astronómicos.
- Docencia e investigación en aplicación de ViT a datos científicos: el modelo y su receta completa (hiperparámetros, épocas, métricas por época) permiten reproducir el experimento con una sola GPU y comparar con otras arquitecturas.
- Etiquetado asistido en proyectos de ciencia ciudadana: integrado en una interfaz, el clasificador puede proponer una clase morfológica y una confianza para que voluntarios la confirmen o corrijan, acelerando la anotación de nuevos conjuntos.
- Extracción de características: aunque el checkpoint se publica como clasificador, el encoder ViT puede emplearse para obtener embeddings de recortes de galaxias y alimentar modelos posteriores (clustering, búsqueda por similitud), siempre que se valide fuera del protocolo original.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index, no verificados de forma independiente):

| Métrica | Valor | Conjunto |
|---|---|---|
| Accuracy (semilla 42, época 19) | 84,27 % | Galaxy10 DECaLS, test (1.774 imágenes) |
| F1 ponderado (semilla 42, época 19) | 84,04 % | Galaxy10 DECaLS, test (1.774 imágenes) |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 84,24 ± 0,23 % | Galaxy10 DECaLS, test |
| F1 ponderado medio ± desv. típica (semillas 42, 1, 2) | 83,95 ± 0,23 % | Galaxy10 DECaLS, test |

Evolución seleccionada del entrenamiento (semilla 42): la accuracy de test pasa del 46,00 % en la época 1 al 84,27 % en la época 19 (seleccionada por mínima pérdida de validación, 0,4944), con un máximo observado de 85,51 % en la época 21 y 85,29 % en las épocas 17 y 28. La pérdida de validación desciende de 1,8978 a 0,4944 entre las épocas 1 y 19.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos (85,8 M de parámetros), más activaciones y memoria del framework; en la práctica, menos de 1 GB para batches pequeños.
- VRAM estimada en fp16/bf16: en torno a 0,2 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en fp32 con batch 1; el entrenamiento documentado se realizó en una sola GPU (modelo y receta compatibles con una RTX 3090, RTX 4090, A100 o H100).
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1660, RTX 2060, RTX 3060, RTX 4060, RTX 4090 y similares, con margen amplio.
- Opciones de despliegue: `transformers` con PyTorch (vía `AutoModelForImageClassification`), pipeline `image-classification` de Hugging Face, endpoints compatibles de Hugging Face; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este clasificador).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo (85,8 M de parámetros, entrada 224x224), se espera una latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada (el autor remite a la colección *Vision Foundation Models Benchmark*, con 40 backbones, pero no se incluyen sus resultados en esta ficha). Comparativa orientativa con alternativas de la misma categoría, limitada a datos públicos generales:

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ViT-B/16 Galaxy10 DECaLS) | 85,8 M | Imagen 224x224 px | Clasificación de 10 clases morfológicas | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224-in21k | 85,8 M | Imagen 224x224 px | Backbone preentrenado en ImageNet-21k, sin cabeza específica | Apache 2.0 | Hugging Face |
| Otros backbones del mismo benchmark | no disponible | no disponible | Clasificación de morfología de galaxias | no disponible | Colección del autor en Hugging Face |

No se han publicado en la información disponible resultados de benchmarks de modelos alternativos sobre Galaxy10 DECaLS que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Dominio restringido: el modelo solo clasifica morfología de galaxias de Galaxy10 DECaLS; no es un clasificador de imágenes general ni un modelo de lenguaje.
- Riesgo de sobreajuste al protocolo: las métricas proceden de una única partición de test derivada del split público; no hay validación externa con datos de otros sondeos o instrumentos.
- Sesgos de dataset: Galaxy10 DECaLS tiene una distribución de clases y una selección de imágenes concretas; el rendimiento puede degradarse en morfologías raras, galaxias débiles o imágenes con distinta calidad de seeing.
- Clases limitadas: solo 10 categorías morfológicas; no cubre morfologías finas ni clasificaciones jerárquicas.
- Métricas no verificadas: los valores del model-index están declarados por el autor (`verified: false`) y no han sido comprobados de forma independiente.
- Sin datos sobre calibración de probabilidades: no se documenta si las probabilidades de softmax están calibradas, por lo que no deben usarse directamente como confianza en producción sin validación.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el modelo; conviene revisar los términos del dataset Galaxy10 DECaLS por separado.
- Sin soporte documentado de cuantización: el autor no publica variantes GGUF, ONNX ni cuantizadas; cualquier conversión corre a cargo del usuario.
- Idiomas: no aplica, pero conviene señalar que el modelo no procesa texto, por lo que no puede integrarse en flujos conversacionales sin un componente adicional.
- Reproducibilidad dependiente del entorno: el autor fija versiones de PyTorch, transformers, datasets y torchvision; cambios de versión pueden alterar ligeramente los logits.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch16-224-in21k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace directo en la información proporcionada)

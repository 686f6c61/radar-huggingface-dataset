# matthieulel/vit-large-patch16-224-galaxy10-decals-head-v2

## Resumen

`vit-large-patch16-224-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por matthieulel como parte del benchmark *Vision Foundation Models Benchmark*. Se construye sobre el backbone `google/vit-large-patch16-224`, un Vision Transformer de 303 millones de parámetros, al que se le sustituye la cabeza de clasificación original (ImageNet, 1.000 clases) por una capa lineal de 10 salidas correspondientes a las clases morfológicas de Galaxy10 DECaLS.

La particularidad metodológica es que el ajuste es *head-only*: el backbone permanece completamente congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena la cabeza lineal. Esto convierte al modelo en una sonda lineal sobre representaciones preentrenadas, útil para medir la calidad de dichas representaciones en un dominio científico concreto (astronomía óptica) sin confundir el efecto con el reajuste de pesos internos.

El modelo es relevante como pieza de un estudio comparativo más amplio (40 backbones preentrenados x dos regímenes de adaptación) recogido en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). No es un modelo de propósito general ni un modelo generativo: es un clasificador de 10 clases con una accuracy de test del 62,97 % sobre 1.774 imágenes retenidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch 16, resolución 224x224) con cabeza lineal de 10 clases |
| Parámetros totales | 303.311.882 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px, 196 parches de 16x16) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (sin componente textual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es un ViT-Large estándar: transformer de 24 capas, dimensión oculta 1024, 16 cabezas de atención y parches de 16x16 sobre imágenes de 224x224, lo que produce 196 tokens por imagen más el token de clase. La cabeza es una única capa lineal con 10 salidas. Durante el entrenamiento el backbone se congela por completo (incluidas las estadísticas de normalización) y solo se optimiza esa capa lineal, de modo que el modelo final almacena los pesos originales del checkpoint base junto con la cabeza entrenada.

El entrenamiento usa Galaxy10 DECaLS (17.736 imágenes en total). El split público de test (1.774 imágenes) se reserva como test held-out; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar época. La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batch de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple fp32 con TF32 desactivado y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación hace resize y center crop a 224x224 con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación, que en esta ejecución (semilla 42) resultó ser la 30.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS (el modelo no documenta los nombres de las clases; hay que consultarlos en el dataset).
- Extracción de representaciones visuales del backbone ViT-Large congelado, reutilizable como feature extractor para otras tareas astronómicas mediante sondas lineales.
- Inferencia sobre imágenes individuales o en lote con el pipeline `image-classification` de transformers.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene capacidades multilingües (no procesa texto).
- No tiene modo thinking, ni visión generativa, ni audio, ni generación de texto: es exclusivamente un clasificador discriminativo.

## Casos de uso

- Clasificación morfológica preliminar en pipelines de reducción de datos: el modelo puede etiquetar recortes de galaxias procedentes de surveys ópticos en 10 categorías morfológicas, como primer filtro antes de la inspección visual por expertos.
- Etiquetado asistido para curación de catálogos: con una accuracy de test del 62,97 % y F1 ponderado del 61,01 %, es adecuado para pre-anotar grandes volúmenes y reservar el esfuerzo humano a los casos de baja confianza (por ejemplo, aplicando umbrales sobre la probabilidad softmax).
- Sonda lineal de referencia en investigación: al mantener el backbone congelado, sirve para medir cuánta información morfológica contiene el preentrenamiento de ViT-Large en ImageNet y compararlo con otros 39 backbones bajo la misma receta.
- Reproducibilidad de experimentos: el repositorio incluye métricas por época, semillas e índices de split, lo que permite replicar el resultado y auditar la selección de época.
- Selección de backbone para proyectos astronómicos: forma parte de una colección comparativa que permite decidir qué arquitectura preentrenada conviene adaptar antes de invertir en fine-tuning completo.
- Docencia y divulgación sobre foundation models en ciencia: es un ejemplo compacto (1,2 GB de repo) de adaptación de un modelo de visión generalista a un dominio científico con coste computacional mínimo.
- Integración en servicios de inferencia estándar: al ser un modelo transformers con safetensors y `endpoints_compatible`, se puede desplegar en Inference Endpoints o en un servidor propio con la API de transformers sin conversiones adicionales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Métrica | Valor (semilla 42, época 30) | Media +/- desv. típica (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 62,97 | 63,27 +/- 0,57 |
| F1 ponderado (%) | 61,01 | 61,15 +/- 0,61 |

Evolución seleccionada de la curva de validación (semilla 42): la accuracy de validación pasa del 21,48 % en la época 1 al 63,19 % en la época 30, y la accuracy de test del 23,28 % al 62,97 %. La pérdida de validación desciende de 2,2019 a 1,1179. La mejora se concentra en las primeras 15 épocas; a partir de ahí el margen es inferior a dos puntos porcentuales.

No se han publicado en la información disponible resultados comparativos frente a otros modelos en la misma tabla del artículo; el autor remite al dataset `vision-foundation-models-benchmark-runs` para las tablas completas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (303 M parámetros x 4 bytes), más activaciones; en la práctica, menos de 3 GB para lotes pequeños a 224x224.
- En fp16/bf16: alrededor de 0,7 GB de pesos, aunque el autor no documenta conversión ni validación en precisión reducida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior funciona sin problema. Para lotes grandes, A100 o H100 aportan throughput, no capacidad.
- Cabe holgadamente en GPU de consumo: GTX 1660, RTX 2060, RTX 3050 y superiores.
- Opciones de despliegue: transformers con PyTorch (ruta documentada por el autor), Inference Endpoints (el repo está marcado como `endpoints_compatible`), y servidores compatibles con la API de transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|---|
| vit-large-patch16-224-galaxy10-decals-head-v2 (este) | 303 M | 224x224 px | Clasificación 10 clases, head-only | 62,97 % (test) | apache-2.0 |
| google/vit-large-patch16-224 (base) | 303 M | 224x224 px | Clasificación ImageNet 1.000 clases | no aplica directamente (requiere adaptación) | apache-2.0 |
| Otros backbones del mismo benchmark (39 restantes) | variable | 224x224 px | Clasificación 10 clases, misma receta | no disponible en esta ficha; consultar `vision-foundation-models-benchmark-runs` | variable |

La comparación relevante no es frente a otros clasificadores de galaxias publicados, sino frente a los otros 39 backbones evaluados con la misma receta en el artículo de referencia. Los datos de esos modelos no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Accuracy de test del 62,97 %: aproximadamente uno de cada tres recortes se clasifica de forma incorrecta. No es adecuado como única fuente de verdad en catalogación científica.
- El régimen head-only congela el backbone: el modelo hereda los sesgos y las limitaciones de representación de ViT-Large preentrenado en ImageNet, que no está optimizado para imágenes astronópticas de bajo contraste y alta relación señal-ruido variable.
- El modelo no documenta los nombres de las 10 clases ni la matriz de confusión; el rendimiento puede estar muy desequilibrado entre clases pese al F1 ponderado del 61,01 %.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de falsos positivos confiados: la cabeza lineal puede asignar probabilidades altas a clases incorrectas en imágenes fuera de la distribución de Galaxy10 DECaLS.
- Dominio muy restringido: solo morfología de galaxias en el rango de DECaLS; no se ha validado en otros surveys (SDSS, Euclid, LSST) ni en otras resoluciones o bandas.
- La selección de época se hizo sobre validación con solo 30 épocas; la curva seguía mejorando ligeramente al final, por lo que un entrenamiento más largo podría dar resultados distintos.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el artículo asociado cuando se publique.
- El repositorio tiene 13 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.
- La verificación de integridad del autor (predicciones idénticas en el 100 % de las primeras 96 imágenes de test, diferencia máxima de logits 6,91e-06) es un control interno, no una auditoría externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-large-patch16-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-large-patch16-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Métricas y splits del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de URL)

# matthieulel/convnextv2-atto-1k-224-galaxy10-decals-full-v2

## Resumen

`convnextv2-atto-1k-224-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por matthieulel como parte de la colección *Vision Foundation Models Benchmark*. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `facebook/convnextv2-atto-1k-224` sobre el conjunto de datos Galaxy10 DECaLS, que distingue diez clases morfológicas de galaxias a partir de imágenes del sondeo DECaLS.

El modelo resuelve una tarea concreta de astronomía observacional: la clasificación automática de morfología galáctica, tradicionalmente realizada mediante inspección visual por expertos o con métodos clásicos de visión por computador. Con solo 3,39 millones de parámetros, demuestra que un backbone ConvNeXt V2 en su variante más pequeña, preentrenado en ImageNet-1k y ajustado por completo, puede alcanzar un 84,5 % de accuracy en el conjunto de test de Galaxy10 DECaLS.

Su relevancia actual radica en dos factores: forma parte de un estudio sistemático de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) bajo un protocolo revisado publicado en *Astronomy and Computing* (2026), y ofrece un punto de referencia reproducible y ligero para pipelines de clasificación morfológica en surveys de gran volumen como LSST/Rubin o Euclid.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura, variante atto) |
| Parametros totales | 3.390.610 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ConvNeXt V2 en su variante atto, una red convolucional pura que incorpora las innovaciones de ConvNeXt V2: convoluciones depthwise de 7x7, normalización LayerNorm, activación GELU y el mecanismo GRN (Global Response Normalization) que mejora la diversidad de características entre canales. El backbone se inicializa desde `facebook/convnextv2-atto-1k-224`, preentrenado en ImageNet-1k a resolución 224x224, y se le añade una cabeza lineal de diez salidas correspondientes a las clases morfológicas de Galaxy10 DECaLS.

El ajuste fino es completo (todos los parámetros actualizados) sobre las 17.736 imágenes de Galaxy10 DECaLS. El split público de test (1.774 imágenes) se reserva como conjunto de evaluación held-out; el split público de train se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5 con schedule lineal y 10 % de warm-up, batch efectivo de 256 (32 imágenes con acumulación de gradiente en 8 pasos), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio. La época seleccionada es la de mínima pérdida de validación (época 28 de 30), y el checkpoint publicado corresponde a esa época con semilla 42. El entrenamiento se realizó con PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en diez clases de morfología galáctica (Galaxy10 DECaLS).
- Extracción de características visuales mediante un backbone ConvNeXt V2 atto preentrenado en ImageNet-1k.
- Inferencia sobre imágenes de 224x224 px con preprocesado de resize y center crop.
- Ajuste fino completo ya aplicado: no requiere entrenamiento adicional para la tarea objetivo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación morfológica automatizada en surveys astronómicos: el modelo puede procesar recortes de 224x224 px de galaxias procedentes de DECaLS (o de surveys con características de imagen similares) y asignar una de las diez clases morfológicas, reduciendo la carga de inspección visual en catálogos de decenas de miles de objetos.
- Etiquetado previo para entrenamiento de modelos mayores: al ser un modelo de 3,39 M de parámetros con 84,5 % de accuracy, puede usarse como anotador automático de bajo coste para preetiquetar grandes volúmenes de imágenes que luego se refinan manualmente o se emplean para entrenar modelos de mayor capacidad.
- Filtrado y priorización de candidatos: en pipelines de selección de galaxias con morfologías de interés (por ejemplo, espirales barradas o irregulares), el modelo actúa como primer filtro para priorizar la inspección humana de los objetos más relevantes.
- Estudio comparativo de backbones: al formar parte de una colección de 80 configuraciones con protocolo idéntico, sirve como referencia reproducible para evaluar el impacto del tamaño del backbone y del régimen de adaptación en tareas astronómicas.
- Despliegue en entornos con recursos limitados: con 3,39 M de parámetros, el modelo cabe holgadamente en CPU y en GPUs de consumo, lo que permite integrarlo en estaciones de trabajo de observatorios o en servicios edge sin infraestructura dedicada.
- Docencia y divulgación en astroinformática: su tamaño reducido y su receta de entrenamiento documentada paso a paso lo convierten en un ejemplo práctico para enseñar ajuste fino de modelos de visión en dominios científicos.
- Control de calidad de catálogos: la comparación entre las predicciones del modelo y las clasificaciones existentes puede señalar objetos mal etiquetados o morfologías atípicas que merezcan revisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test held-out de Galaxy10 DECaLS (1.774 imágenes). La accuracy y el F1 se calculan en la época de mínima pérdida de validación.

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 28 de 30) | 84,50 % |
| F1 ponderado (semilla 42, época 28 de 30) | 84,34 % |
| Accuracy media +/- desv. típica (semillas 42, 1, 2) | 84,10 % +/- 0,34 |
| F1 ponderado medio +/- desv. típica (semillas 42, 1, 2) | 83,95 % +/- 0,35 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,39 M de parámetros, aproximadamente 13,6 MB de pesos, más activaciones para un batch pequeño).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en CPU para inferencia por lotes.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 3050, RTX 4090, así como en Apple Silicon y en CPU moderna.
- Opciones de despliegue: transformers (PyTorch), exportación a ONNX Runtime, TorchScript y torchvision; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos sobre Galaxy10 DECaLS con el mismo protocolo, por lo que la comparación numérica directa no está disponible. La comparación estructural con alternativas de la misma categoría es la siguiente:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| convnextv2-atto-1k-224-galaxy10-decals-full-v2 | 3,39 M | Imagen 224x224 | Clasificación de morfología galáctica (10 clases) | Apache 2.0 | Hugging Face |
| facebook/convnextv2-atto-1k-224 (base) | 3,39 M | Imagen 224x224 | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 | Hugging Face |
| Otros backbones del benchmark (38 restantes) | no disponible | Imagen 224x224 | Clasificación de morfología galáctica (10 clases) | no disponible | Colección Vision Foundation Models Benchmark |

El modelo base `facebook/convnextv2-atto-1k-224` es la referencia directa: misma arquitectura y mismo número de parámetros, pero entrenado para las 1.000 clases de ImageNet-1k y sin especialización astronómica. El resto de configuraciones del benchmark comparten receta y split, lo que permite comparaciones controladas, aunque sus métricas no se incluyen en la información disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de morfología galáctica sobre Galaxy10 DECaLS; no es un modelo de propósito general y no debe esperarse transferencia directa a otras tareas visuales sin reentrenamiento.
- El dominio de entrada está acotado a imágenes de 224x224 px con el preprocesado específico del paper (resize y center crop); desviaciones en el preprocesado degradan el rendimiento.
- El conjunto de entrenamiento (17.736 imágenes) es reducido en comparación con los datasets de visión general; el modelo puede mostrar sesgos hacia las clases mejor representadas y hacia las morfologías presentes en DECaLS.
- Riesgo de alucinación en sentido figurado: el modelo siempre asigna una de las diez clases, incluso ante imágenes fuera de distribución (ruido, artefactos, objetos no galácticos), sin mecanismo de abstención ni puntuación de confianza calibrada documentada.
- La variabilidad entre semillas es baja (desviación típica de 0,34 puntos en accuracy), pero el checkpoint publicado corresponde a una única semilla (42) y a la época 28; la época 30 ofrece resultados prácticamente idénticos en test (84,50 % de accuracy, 84,36 % de F1), lo que sugiere que la selección por pérdida de validación no es crítica en este régimen.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se documentan garantías ni soporte por parte del autor.
- No se documentan sesgos demográficos ni sociales por tratarse de un modelo de imágenes astronómicas; los sesgos relevantes son de naturaleza observacional (selección del survey, profundidad, resolución).
- La integridad del checkpoint fue verificada por el autor sobre las primeras 96 imágenes de test (100 % de predicciones idénticas a los logits guardados, diferencia absoluta máxima de 5,72e-06), pero no se dispone de validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-atto-1k-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-atto-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper de referencia: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación según el autor.

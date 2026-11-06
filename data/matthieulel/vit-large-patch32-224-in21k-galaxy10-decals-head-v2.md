# matthieulel/vit-large-patch32-224-in21k-galaxy10-decals-head-v2

## Resumen

`vit-large-patch32-224-in21k-galaxy10-decals-head-v2` es un clasificador de imagen para morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel`. Se construye sobre el backbone `google/vit-large-patch32-224-in21k` (Vision Transformer, 305,5 millones de parámetros) y se adapta al dataset Galaxy10 DECaLS, que plantea una clasificación de 10 clases morfológicas galácticas. La adaptación es deliberadamente mínima: solo se entrena una cabeza lineal de 10 salidas mientras el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización.

El modelo forma parte de una colección más amplia, *Vision Foundation Models Benchmark*, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación (head-only y fine-tuning completo) con una receta idéntica. Esta ficha corresponde a una de las 80 configuraciones, en concreto el régimen head-only con semilla 42. El interés no está en el rendimiento absoluto —43,40 % de accuracy en test—, sino en su valor como referencia reproducible dentro de un estudio comparativo controlado sobre adaptación de modelos fundacionales a datos astronómicos.

El checkpoint incluye tanto los pesos congelados del backbone como la cabeza entrenada, en formato safetensors y con licencia Apache 2.0. El repositorio ocupa 1,2 GB y está pensado para su uso con la librería `transformers` en tareas de clasificación de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch 32, resolución 224) con cabeza lineal de clasificación |
| Parametros totales | 305.520.650 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px, 49 parches de 32x32) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/vit-large-patch32-224-in21k |
| Dataset de entrenamiento | matthieulel/galaxy10_decals (17.736 imágenes, 10 clases) |
| Pipeline | image-classification |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo ViT-Large con parches de 32x32 píxeles sobre entradas de 224x224, lo que produce 49 tokens por imagen. El backbone es el checkpoint `google/vit-large-patch32-224-in21k`, preentrenado por Google en ImageNet-21k. Sobre él se añade una única capa lineal con 10 salidas, una por clase morfológica de Galaxy10 DECaLS. No hay innovaciones arquitectónicas propias: el modelo es una adaptación de bajo coste de un backbone ya existente.

El entrenamiento sigue un régimen *head-only fine-tuning*: el backbone permanece completamente congelado (incluidas las estadísticas de normalización) y solo se optimiza la cabeza lineal. La receta es idéntica para las 40 configuraciones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio. La evaluación usa resize y centre crop a 224x224 con la normalización del procesador de imagen del checkpoint base. La partición de datos es estratificada: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test). La época seleccionada es la de mínima pérdida de validación, que en esta ejecución es la época 30. El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ViT-Large congelado (representaciones de 1.024 dimensiones por imagen).
- Inferencia determinista y reproducible: el autor verificó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100 % con los logits guardados (diferencia absoluta máxima de 1,43e-06).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades más allá de la clasificación de imagen.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en pipelines astronómicos: dado que el modelo opera sobre recortes de 224x224 px, puede integrarse como primer filtro en flujos de análisis de imágenes de surveys como DECaLS, etiquetando cada objeto en una de las 10 clases con una accuracy del 43,40 %.
- Referencia reproducible en estudios de adaptación de modelos fundacionales: el checkpoint forma parte de un benchmark controlado de 80 configuraciones, por lo que sirve como línea base para comparar regímenes de fine-tuning (head-only frente a full fine-tuning) sobre el mismo backbone y la misma receta.
- Extracción de embeddings para búsqueda por similitud: el backbone congelado produce representaciones de 1.024 dimensiones que pueden indexarse para recuperar galaxias visualmente similares dentro de un catálogo, sin necesidad de reentrenar.
- Docencia y experimentación en visión por computador aplicada a astronomía: al ser un modelo pequeño (305,5 M de parámetros, 1,2 GB) con receta y particiones publicadas, es adecuado para reproducir resultados en un curso o taller con una sola GPU.
- Validación de pipelines de preprocesado: la verificación de integridad del autor (predicciones idénticas al 100 % en 96 imágenes) permite usar el modelo como test de regresión para comprobar que un pipeline de resize, centre crop y normalización se comporta como se espera.
- Prototipado rápido de clasificadores de morfología en dominios relacionados: al mantener el backbone intacto, se puede sustituir la cabeza lineal por otra adaptada a un catálogo distinto y reentrenar solo esa capa con un coste computacional mínimo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente) sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 30) | 43,40 % |
| Weighted F1 (seed 42, época 30) | 37,91 % |
| Accuracy media ± desv. típica (seeds 42, 1, 2) | 43,57 ± 0,29 % |
| Weighted F1 media ± desv. típica (seeds 42, 1, 2) | 37,85 ± 0,51 % |

La evolución por épocas de la semilla 42 muestra una mejora sostenida: la accuracy de validación pasa del 13,75 % en la época 1 al 42,62 % en la época 30, y la accuracy de test del 12,74 % al 43,40 %. La pérdida de validación desciende de 2,2922 a 1,7145 sin signos claros de sobreajuste en la cabeza. No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (305,5 M de parámetros × 4 bytes), más activaciones y buffers, lo que sitúa el consumo real en torno a 2-3 GB para batches pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos, con consumo total en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas dos últimas el cuello de botella será el preprocesado de imagen, no el modelo.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más.
- Opciones de despliegue: `transformers` (referencia del autor), `vLLM` no aplica (no es un modelo de lenguaje), `llama.cpp` y `Ollama` no soportan este tipo de modelo; `TGI` no está orientado a clasificación de imagen. Para producción en visión, alternativas habituales son ONNX Runtime, TorchScript o exportación a TensorRT.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la resolución de entrada, se espera un throughput alto en GPU modernas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de modelos alternativos evaluados sobre Galaxy10 DECaLS. La comparación directa con alternativas como ViT-Base, ConvNeXt o Swin sobre este dataset requeriría consultar el repositorio `vision-foundation-models-benchmark-runs`, que no forma parte de los datos facilitados. Se indica por tanto "no disponible" para una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|
| vit-large-patch32-224-in21k-galaxy10-decals-head-v2 | 305,5 M | 224x224 px | 43,40 % (test, seed 42) | Apache 2.0 |
| Alternativas del mismo benchmark | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento moderado: una accuracy del 43,40 % en un problema de 10 clases implica una tasa de error superior al 56 %, insuficiente para uso científico sin revisión humana o sin combinar con otros clasificadores.
- El régimen head-only congela el backbone, lo que limita la adaptación al dominio astronómico; es probable que un fine-tuning completo mejore sustancialmente los resultados, pero esa configuración no es la que se distribuye aquí.
- Sesgos de dominio: el modelo se ha entrenado exclusivamente con Galaxy10 DECaLS y puede degradarse en imágenes de otros surveys, con distinta resolución, profundidad, relación señal-ruido o calibración fotométrica.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de clasificaciones erróneas confiadas en galaxias ambiguas o con morfología compuesta.
- Sin capacidades multilingües ni de texto: no puede usarse para tareas de lenguaje, tool calling ni agentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la idoneidad científica de las predicciones.
- Caveat de reproducibilidad: los resultados del benchmark están declarados por el autor y no verificados de forma independiente; la model card indica explícitamente `verified: false` en las métricas.
- El checkpoint incluye el backbone congelado, por lo que el tamaño del repositorio (1,2 GB) es mayor de lo que sería una cabeza lineal aislada; para despliegues con múltiples cabezas conviene reutilizar un único backbone.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-large-patch32-224-in21k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-large-patch32-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación según el autor)

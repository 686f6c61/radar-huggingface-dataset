# matthieulel/vit-base-patch16-224-galaxy10-decals-full-v2

## Resumen

El modelo `vit-base-patch16-224-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario matthieulel como parte de una colección de benchmarks de modelos fundacionales de visión aplicados a datos astronómicos. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `google/vit-base-patch16-224`, un Vision Transformer de 85,8 millones de parámetros con parches de 16x16 píxeles y resolución de entrada de 224x224, adaptado para clasificar imágenes del conjunto Galaxy10 DECaLS en diez categorías morfológicas.

El modelo resuelve una tarea concreta y acotada: dado un recorte de imagen astronómica de 224x224 píxeles, predecir la clase morfológica de la galaxia según la taxonomía de Galaxy10 DECaLS. No es un modelo generativo ni multimodal: es un clasificador de imagen puro con una cabeza lineal de diez salidas. Su relevancia radica en que forma parte de un estudio sistemático (40 backbones x 2 regímenes de adaptación = 80 configuraciones) que evalúa cómo se comportan los modelos fundacionales de visión cuando se transfieren a datos astronómicos, un dominio con distribuciones visuales muy distintas a las de ImageNet.

La ficha corresponde a la versión "full fine-tuning" (ajuste completo) con semilla 42 y época 17 de 30, seleccionada por mínima pérdida de validación. El checkpoint alcanza un 83,93 % de accuracy y un 83,68 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes. La licencia es Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224x224) |
| Parametros totales | 85.806.346 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 224x224 px, 196 parches) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un ViT de 85,8 M de parámetros es viable en fp16/fp32 e incluso en int8 mediante herramientas genéricas) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo ViT-Base: la imagen de entrada de 224x224 píxeles se divide en 196 parches de 16x16, que se proyectan linealmente y se procesan mediante una pila de bloques transformer con atención multi-cabeza. Sobre la representación del token CLS se aplica una única capa lineal con diez salidas, una por clase morfológica. El modelo parte de los pesos preentrenados de `google/vit-base-patch16-224` y se somete a un ajuste fino completo, actualizando todos los parámetros.

El entrenamiento utiliza Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como conjunto de evaluación final y el split público de train dividido de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del estudio: AdamW (betas 0.9/0.999, eps 1e-8, weight decay 0.1, gradient clipping 1.0), learning rate 5e-5 con schedule lineal y 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 224x224 con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 17). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en diez clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ViT-Base preentrenado (reutilizable para otras tareas de visión con fine-tuning).
- Inferencia sobre imágenes de 224x224 píxeles con preprocesado estándar (resize, center crop y normalización).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión generativa, audio ni otras modalidades.
- Salida limitada a logits de diez clases; no genera descripciones ni texto explicativo.

## Casos de uso

- Clasificación morfológica automatizada en catálogos astronómicos: el modelo puede procesar recortes de 224x224 píxeles de imágenes DECaLS y asignar una de las diez clases morfológicas, lo que permite etiquetar grandes volúmenes de galaxias de forma automática y reducir la carga de inspección visual humana.
- Preetiquetado para revisión experta: usar las predicciones como primera pasada sobre nuevos campos observacionales, priorizando las imágenes con mayor incertidumbre para revisión manual por astrónomos.
- Estudio comparativo de modelos fundacionales: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve como referencia reproducible para evaluar el rendimiento de ViT-Base frente a otros backbones en datos astronómicos.
- Filtrado y selección de muestras: clasificar candidatos por clase morfológica antes de análisis espectroscópicos o de seguimiento, optimizando el tiempo de telescopio.
- Detección de morfologías minoritarias: identificar clases poco frecuentes en un conjunto de imágenes para construir muestras equilibradas destinadas a estudios específicos.
- Integración en pipelines de análisis de imagen: al ser un modelo transformers estándar con pesos safetensors de 0,3 GB, puede desplegarse en servicios de inferencia por lotes sobre GPUs de consumo para procesar archivos de imágenes astronómicas de forma sistemática.
- Docencia y divulgación: ejemplo práctico y reproducible de transferencia de un modelo fundacional de visión a un dominio científico concreto, con protocolo de entrenamiento y métricas por época documentados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 17) | 83,93 % |
| F1 ponderado (semilla 42, época 17) | 83,68 % |
| Accuracy media +/- desv. típica (semillas 42, 1, 2) | 83,65 % +/- 0,44 |
| F1 ponderado medio +/- desv. típica (semillas 42, 1, 2) | 83,39 % +/- 0,49 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks; la model card remite a las tablas del paper y al dataset `vision-foundation-models-benchmark-runs` para la comparación completa entre los 40 backbones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (85,8 M de parámetros x 4 bytes) más el overhead de activaciones, por lo que en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomiendan A100, H100 o RTX 4090, aunque el modelo no las necesita.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers (PyTorch) de forma nativa; también es convertible a ONNX Runtime, TorchScript o TensorRT para inferencia optimizada. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse de un ViT-Base de 85,8 M de parámetros, la inferencia por imagen es del orden de milisegundos en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit-base-patch16-224-galaxy10-decals-full-v2 (este) | 85,8 M | 224x224 px | 83,93 % (test, semilla 42) | Apache 2.0 | Hugging Face |
| google/vit-base-patch16-224 (base sin ajustar) | 85,8 M | 224x224 px | no disponible (modelo de ImageNet, sin cabeza de 10 clases) | Apache 2.0 | Hugging Face |
| Otros backbones de la colección Vision Foundation Models Benchmark | variable | 224x224 px | no disponible en esta ficha (resultados en el dataset de runs del autor) | variable | Hugging Face |

La comparación directa con alternativas de la misma categoría (otros ViT, ConvNeXt, Swin, etc. ajustados a Galaxy10 DECaLS) no está disponible en la información proporcionada; el autor remite al paper en revisión y al dataset de resultados por época para la comparativa completa entre las 80 configuraciones.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo clasifica imágenes en las diez clases de Galaxy10 DECaLS; no generaliza a otras taxonomías morfológicas sin reentrenamiento.
- Sesgos potenciales derivados del conjunto de datos: Galaxy10 DECaLS tiene una distribución de clases desequilibrada y está limitado a observaciones DECaLS, por lo que el rendimiento puede degradarse en imágenes de otros instrumentos, profundidades o bandas.
- Riesgo de error en clases minoritarias o morfologías ambiguas: el F1 ponderado (83,68 %) es ligeramente inferior a la accuracy, lo que sugiere un rendimiento desigual entre clases.
- Dependencia del preprocesado: los resultados reportados asumen resize y center crop a 224x224 con la normalización del image processor; otros preprocesados pueden alterar las predicciones.
- Sin datos de calibración: no se documenta calibración de probabilidades, por lo que los logits no deben interpretarse directamente como confianza fiable sin un análisis adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- Procedencia de las métricas: los resultados del model-index están marcados como no verificados (`verified: false`); proceden del autor y no de una evaluación independiente.
- Sin soporte de texto ni multimodal: no puede emplearse para tareas de captioning, respuesta a preguntas visuales ni interacción conversacional.
- Paper en revisión: la referencia bibliográfica completa no está disponible aún, lo que limita la trazabilidad metodológica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vit-base-patch16-224-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de resultados por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación según el autor.

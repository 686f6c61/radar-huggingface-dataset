# matthieulel/convnextv2-nano-22k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-nano-22k-224-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte de una colección de benchmarks de modelos fundacionales de visión aplicados a datos astronómicos. El modelo parte del checkpoint preentrenado `facebook/convnextv2-nano-22k-224` (ConvNeXt V2 en variante nano, preentrenado en ImageNet-22k) y lo adapta a la clasificación de 10 clases morfológicas del dataset Galaxy10 DECaLS mediante *head-only fine-tuning*: la columna vertebral permanece congelada (incluidas las estadísticas de sus capas de normalización) y solo se entrena una cabeza lineal de 10 salidas.

El modelo es relevante en el contexto de la evaluación de modelos fundacionales de visión para astronomía: forma parte de las 80 configuraciones (40 backbones preentrenados × dos regímenes de adaptación) del protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su interés no reside en un rendimiento estado del arte, sino en servir como punto de referencia reproducible y de bajo coste computacional para comparar cómo se transfieren los backbones genéricos a una tarea científica concreta con muy pocos parámetros entrenables.

Con 14.989.210 parámetros totales y un repositorio de 0,1 GB, el modelo es extremadamente ligero y desplegable en hardware modesto. La licencia Apache 2.0 y el formato safetensors facilitan su integración en pipelines de investigación y en prototipos de clasificación astronómica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura, variante nano), con cabeza lineal de clasificación |
| Parametros totales | 14.989.210 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224×224 px) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un modelo pequeño en fp32, la cuantización es viable pero no está publicada) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt V2 en su variante nano, una red convolucional pura que moderniza el diseño de ResNet con bloques invertidos, convoluciones depthwise de 7×7, normalización LayerNorm y la función de activación GELU, e incorpora en V2 la normalización de mapas de características (GRN) y el preentrenamiento auto-supervisado con enmascaramiento (FCMAE) en el checkpoint original de Meta. El backbone se hereda congelado del checkpoint `facebook/convnextv2-nano-22k-224`, preentrenado en ImageNet-22k, y la única parte entrenada es una capa lineal de 10 salidas.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes en total): el split público de test (1.774 imágenes) se reservó como conjunto de evaluación held-out, y el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta, idéntica para los 40 backbones del benchmark, usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y volteo horizontal aleatorio; la evaluación aplica resize y center crop a 224×224 px seguido de la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales genéricas mediante el backbone ConvNeXt V2 nano congelado (reutilizable para otras tareas de visión por transferencia).
- Inferencia determinista y reproducible: el autor verificó que las predicciones sobre las primeras 96 imágenes de test coinciden al 100 % con los logits guardados de la época seleccionada (diferencia absoluta máxima de 4,17e-06).
- Entrada de imagen de 224×224 px con el preprocesado estándar del procesador (resize, center crop y normalización).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de visión puro.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en catálogos de imágenes DECaLS: el modelo asigna una de las 10 clases morfológicas a cada recorte de 224×224 px, lo que permite procesar lotes de imágenes astronómicas con un coste computacional mínimo (14,99 M de parámetros).
- Baseline reproducible en investigación sobre modelos fundacionales de visión: sirve como referencia de *head-only fine-tuning* frente a otros 39 backbones del mismo benchmark, facilitando comparaciones controladas con la misma receta de entrenamiento.
- Prototipado rápido en pipelines de ciencia ciudadana o docencia: al caber en cualquier GPU consumer y en CPU, permite desplegar un clasificador de morfología galáctica en entornos con recursos limitados.
- Filtrado previo en flujos de anotación humana: el modelo puede preetiquetar imágenes para que los expertos solo revisen los casos ambiguos, reduciendo el esfuerzo de etiquetado manual.
- Extracción de embeddings con el backbone congelado: las características de ConvNeXt V2 nano pueden alimentar clasificadores alternativos (SVM, regresión logística) o técnicas de clustering sobre imágenes astronómicas.
- Estudio de transferibilidad de backbones preentrenados en ImageNet a datos científicos: el checkpoint documenta métricas por época y por semilla, lo que permite analizar curvas de convergencia y estabilidad del régimen head-only.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (dataset Galaxy10 DECaLS, split test de 1.774 imágenes; métricas no verificadas de forma independiente, `verified: false`):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 55,58 % |
| Weighted F1 (semilla 42, época 30 de 30) | 53,47 % |
| Accuracy media ± desv. típica (semillas 42, 1, 2) | 55,05 ± 0,54 % |
| Weighted F1 media ± desv. típica (semillas 42, 1, 2) | 52,94 ± 0,56 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en este mismo dataset más allá de las 80 configuraciones del benchmark del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (14,99 M de parámetros, aproximadamente 60 MB de pesos); en fp16 o int8 el consumo es aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque estas últimas están sobredimensionadas para el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU o CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), exportación a ONNX Runtime, TorchScript o TensorRT; también es viable servir con FastAPI o con endpoints de HuggingFace Inference. El autor no documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ConvNeXt V2 nano, head-only) | 14,99 M | Clasificación de morfología galáctica (10 clases) | 55,58 % (test, semilla 42) | Apache 2.0 | HuggingFace |
| `facebook/convnextv2-nano-22k-224` (backbone base sin adaptar) | ~15 M | Clasificación ImageNet-22k | no disponible (no entrenado en Galaxy10) | Apache 2.0 | HuggingFace |
| Otros backbones del mismo benchmark (39 restantes) | variable | Clasificación de morfología galáctica | no disponible en esta ficha (resultados en el dataset `vision-foundation-models-benchmark-runs`) | variable | HuggingFace |

No se dispone en la información proporcionada de resultados de modelos alternativos comparables en el mismo dataset, por lo que la comparativa cuantitativa queda limitada al propio benchmark del autor.

## Limitaciones y advertencias

- Rendimiento moderado: una accuracy del 55,58 % en 10 clases indica una capacidad limitada para separar morfologías sutiles; no debe usarse como sustituto de la clasificación experta en contextos científicos críticos.
- El régimen head-only congela el backbone: el modelo no se beneficia de un ajuste fino completo, lo que limita su adaptación a las particularidades del dominio astronómico.
- Sesgos potenciales derivados del dataset Galaxy10 DECaLS: desbalance de clases, sesgos de selección de la muestra y características de las imágenes DECaLS que pueden no generalizar a otros sondeos o instrumentos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones erróneas con alta confianza en imágenes fuera de distribución o con baja relación señal-ruido.
- Idiomas y contexto: no aplica; el modelo no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda citar el artículo y el repositorio original; la cita del paper está pendiente de publicación según el autor.
- El checkpoint solo ha sido validado en el split de test de Galaxy10 DECaLS; no hay evidencia publicada de robustez ante otras distribuciones de datos astronómicos.
- Las métricas están declaradas por el autor y no han sido verificadas de forma independiente (`verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/convnextv2-nano-22k-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-nano-22k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset con métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (cita pendiente de publicación; no se proporciona URL)

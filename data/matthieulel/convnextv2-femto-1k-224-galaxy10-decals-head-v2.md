# matthieulel/convnextv2-femto-1k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-femto-1k-224-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario matthieulel como parte de la colección *Vision Foundation Models Benchmark*. El modelo parte del backbone `facebook/convnextv2-femto-1k-224` (una ConvNeXt V2 en su variante más pequeña, preentrenada en ImageNet-1k a 224x224) y le añade una cabeza lineal de 10 salidas entrenada para clasificar imágenes del dataset Galaxy10 DECaLS en las diez clases morfológicas de galaxias que define dicho conjunto.

La relevancia del checkpoint no reside en su rendimiento absoluto, sino en su papel dentro de un estudio sistemático: es una de las 80 configuraciones (40 backbones preentrenados x dos regímenes de adaptación) evaluadas bajo un protocolo revisado en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). El régimen empleado aquí es *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una capa lineal.

Con 4.852.090 parámetros totales y un régimen de entrenamiento deliberadamente restrictivo, el modelo sirve como línea base ligera para clasificación morfológica galáctica. Su accuracy en el conjunto de test retenido (1.774 imágenes) es del 48,14 %, con un F1 ponderado del 44,75 %, valores que reflejan la dificultad de la tarea y las limitaciones de adaptar solo la cabeza de un backbone genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (CNN pura con bloques ConvNeXt V2 y capa de normalización GRN), variante femto |
| Parametros totales | 4.852.090 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es una ConvNeXt V2 en configuración femto, una red convolucional pura que incorpora en cada bloque una capa GRN (Global Response Normalization) para mejorar la activación de características entre canales, junto con convoluciones depthwise y un diseño inspirado en transformers (patrón de cuello de botella invertido, kernel 7x7). El modelo base fue preentrenado en ImageNet-1k a resolución 224x224. Sobre él se coloca una única capa lineal con diez salidas, que es el único componente entrenado.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes). El split público de test (1.774 imágenes) se reservó como conjunto de test retenido; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas solo para seleccionar la época. La receta, idéntica para los 40 backbones del estudio, emplea AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4, schedule lineal con 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación aplica resize y center crop a 224x224 px seguido de la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 30). Software: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1, torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ConvNeXt V2 femto congelado (reutilizable para otras tareas de visión con fine-tuning posterior).
- Inferencia sobre imágenes de 224x224 px con el preprocesado estándar (resize, center crop, normalización del processor).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incorpora modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en catálogos astronómicos: el modelo asigna una de las diez clases de Galaxy10 DECaLS a recortes de 224x224 px, útil como primer filtro en pipelines de inspección visual de surveys como DECaLS.
- Línea base en estudios comparativos de foundation models: al ser una de las 80 configuraciones del benchmark, permite reproducir y comparar el régimen head-only frente a fine-tuning completo sobre el mismo backbone.
- Etiquetado asistido en proyectos de ciencia ciudadana: puede preclasificar imágenes antes de la revisión humana, reduciendo la carga de anotación en campañas de morfología galáctica.
- Prototipado rápido en entornos con recursos limitados: con menos de 5 millones de parámetros y backbone congelado, el modelo se ejecuta en CPU o en GPUs de gama baja para validar pipelines de preprocesado y evaluación.
- Docencia y experimentación en adaptación de modelos: sirve como ejemplo canónico de head-only fine-tuning con backbone congelado y estadísticas de normalización intactas.
- Extracción de embeddings para clustering o búsqueda por similitud: las características del backbone pueden alimentar análisis no supervisados de morfología, aunque el backbone no fue ajustado para ello.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test retenido de Galaxy10 DECaLS (1.774 imágenes), según el model-index de la model card:

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época seleccionada) | 48,14 % |
| F1 ponderado (seed 42, época seleccionada) | 44,75 % |
| Accuracy media +/- desv. típica (seeds 42, 1, 2) | 48,03 +/- 0,11 % |
| F1 ponderado medio +/- desv. típica (seeds 42, 1, 2) | 44,68 +/- 0,09 % |

No se han publicado en la información disponible resultados comparativos con otros backbones del mismo benchmark ni métricas de benchmarks estándar (MMLU, HumanEval, GSM8K), que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 4,85 M de parámetros, más el espacio de activaciones para un batch de imágenes de 224x224 px (típicamente unos pocos cientos de MB adicionales según el tamaño de batch).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3060 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch) con `AutoModelForImageClassification` y `AutoImageProcessor`; exportación a ONNX o TorchScript posible, aunque no documentada en la model card. No se proporcionan pesos GGUF ni integración con llama.cpp u Ollama (no aplica a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de los otros backbones del mismo benchmark ni de checkpoints comparables sobre Galaxy10 DECaLS con los que establecer una comparación cuantitativa. La model card indica que este checkpoint es una de las 80 configuraciones del estudio, pero no incluye las tablas comparativas del artículo. Por tanto, la comparativa con alternativas de la misma categoría se considera no disponible.

## Limitaciones y advertencias

- Rendimiento moderado: accuracy del 48,14 % en test, lejos de lo que cabría esperar de un fine-tuning completo; el régimen head-only limita la adaptación del backbone a dominios astronómicos.
- El backbone está congelado, incluidas las estadísticas de normalización; no se ha adaptado a la distribución de imágenes astronómicas más allá de la cabeza lineal.
- Riesgo de sesgo hacia las clases mayoritarias de Galaxy10 DECaLS; el F1 ponderado (44,75 %) es inferior al accuracy, lo que sugiere desequilibrio en el rendimiento por clase.
- No apto para uso fuera de la clasificación de morfología galáctica en el formato y resolución esperados (224x224 px, preprocesado específico).
- Licencia Apache 2.0: permite uso comercial con atribución, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene verificar.
- El artículo asociado está en revisión; los resultados deben considerarse preliminares hasta su publicación.
- No dispone de benchmarks estándar de propósito general; no debe compararse con modelos de lenguaje o visión generativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/convnextv2-femto-1k-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-femto-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); cita pendiente de publicación, sin enlace disponible.

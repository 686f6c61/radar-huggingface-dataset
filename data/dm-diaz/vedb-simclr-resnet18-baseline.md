# DM-Diaz/VEDB-SimCLR-ResNet18-Baseline

## Resumen

Este repositorio aloja el checkpoint baseline del modelo VEDB-SimCLR-ResNet18, un encoder visual ResNet-18 preentrenado con aprendizaje contrastivo auto-supervisado SimCLR sobre el Visual Experience Dataset (VEDB). El modelo ha sido desarrollado por D. M. Diaz y M. M. Henderson como parte de un estudio presentado en la Conference on Cognitive Computational Neuroscience (CCN) 2026, que investiga si restringir la experiencia visual a diferentes porciones del campo visual produce diferencias sistemáticas en las representaciones aprendidas, el rendimiento en tareas posteriores y la alineación con la corteza visual humana.

El problema que resuelve es el de proporcionar un punto de referencia (baseline) de campo completo para comparar con variantes que restringen la entrada a zonas centrales (Fovea-Gaze) o periféricas (Periph y Periph-NF) del campo visual. La relevancia actual radica en su aplicación a la neurociencia computacional y la visión egocéntrica, donde se busca comprender cómo la distribución de la información visual afecta a la codificación neuronal. La arquitectura consiste en un backbone ResNet-18 con una cabeza de proyección SimCLR de dos capas, y el checkpoint corresponde a la época 120 de preentrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 con cabeza de proyección SimCLR (Linear 512-512, ReLU, Linear 512-128) |
| Parametros totales | No especificado en la documentación (arquitectura ResNet-18 estándar) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pth.tar`) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone ResNet-18 estándar, cuya capa de clasificación final se sustituye durante el preentrenamiento por una cabeza de proyección de dos capas: `Linear(512, 512) → ReLU → Linear(512, 128)`. La salida de la proyección tiene dimensión 128 y se optimiza con la función de pérdida contrastiva NT-Xent propia de SimCLR. El preentrenamiento se realizó sobre imágenes egocéntricas naturalistas de 224 × 224 píxeles procedentes del Visual Experience Dataset (VEDB), que contiene más de 200 horas de vídeo egocéntrico integrado con registros de movimientos oculares y odometría. En la condición baseline, las imágenes se utilizaron sin ninguna restricción adicional de campo visual, sirviendo como referencia de campo completo. El checkpoint guarda el estado del optimizador Adam, el número de época (120) y el state_dict completo con 124 entradas, incluyendo el backbone y la cabeza de proyección. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un entrenamiento puramente auto-supervisado.

## Capacidades

- Extracción de representaciones visuales auto-supervisadas de 512 dimensiones a partir del backbone ResNet-18.
- Generación de embeddings contrastivos de 128 dimensiones mediante la cabeza de proyección SimCLR.
- Aprendizaje de características invariantes a aumentos de datos (crops, color, etc.) gracias al objetivo NT-Xent.
- Soporte para fine-tuning posterior en tareas de clasificación o regresión visual mediante linear probes.
- Capacidad de análisis de la organización retinotópica y de la codificación de información en el campo visual.
- No soporta generación de texto, tool calling, agentes, ni procesamiento multimodal (solo visión).
- No es un modelo multilingüe; su entrada son imágenes y su salida son vectores de características.

## Casos de uso

- Investigación en neurociencia computacional: el modelo permite estudiar cómo las representaciones aprendidas de forma auto-supervisada se alinean con la actividad de la corteza visual humana, mediante análisis de voxelwise encoding.
- Extracción de características para visión egocéntrica: puede utilizarse como encoder para tareas como predicción de atención visual o reconocimiento de acciones en vídeos de primera persona, aprovechando su entrenamiento en datos egocéntricos.
- Fine-tuning para clasificación de imágenes en dominios con datos limitados: al estar preentrenado en un dataset naturalista, puede adaptarse con pocas muestras etiquetadas a tareas específicas de percepción visual.
- Baseline comparativo en estudios de restricción del campo visual: sirve como referencia para evaluar el impacto de las condiciones Fovea-Gaze, Periph y Periph-NF en el rendimiento de tareas posteriores.
- Desarrollo de sistemas de asistencia visual: las representaciones aprendidas pueden integrarse en interfaces de realidad aumentada que simulen la visión humana periférica o central.
- Evaluación de robustez ante degradaciones periféricas: el modelo permite analizar cómo la pérdida de información periférica afecta al reconocimiento de objetos o escenas, útil para diseñar sistemas de visión artificial más robustos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El estudio asociado se centra en análisis de representaciones y alineación con la corteza visual, pero no se proporcionan métricas cuantitativas como MMLU, HumanEval o GSM8K, dado que el modelo no es de lenguaje ni de razonamiento general. Tampoco se incluyen resultados de precisión en tareas de clasificación estándar (ImageNet, etc.) en la documentación del repositorio.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que indica un checkpoint ligero, adecuado para entornos con recursos limitados.
- Inferencia en CPU: posible, dado el tamaño reducido de ResNet-18 y la resolución de entrada de 224 × 224; se estima un uso de memoria inferior a 1 GB de RAM.
- Inferencia en GPU: recomendada una GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior) para un rendimiento fluido.
- Entrenamiento o fine-tuning: se recomienda una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3060 o RTX 2080) para manejar lotes de tamaño moderado.
- Despliegue: al ser un modelo PyTorch estándar, puede exportarse a ONNX o TorchScript para su integración en pipelines de visión; no es compatible directamente con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se especifican en la documentación, pero para ResNet-18 en una GPU moderna se espera una latencia de inferencia del orden de milisegundos por imagen.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. Como referencia conceptual, el modelo puede compararse con un ResNet-18 preentrenado con SimCLR sobre ImageNet, que es un estándar común en la literatura. Sin embargo, el modelo VEDB se diferencia por estar entrenado en datos egocéntricos naturalistas con sincronización de movimientos oculares, lo que lo hace específico para estudios de visión humana. No se proporcionan métricas de rendimiento comparativas, por lo que la tabla de comparación no puede completarse con datos numéricos.

| Modelo | Arquitectura | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| VEDB-SimCLR-ResNet18-Baseline | ResNet-18 + proyección SimCLR | VEDB (egocéntrico, 200+ horas) | Apache 2.0 | Checkpoint disponible |
| SimCLR ResNet-18 (ImageNet) | ResNet-18 + proyección SimCLR | ImageNet | MIT (referencia) | Ampliamente disponible |
| Otros modelos de visión egocéntrica | Variable | Ego4D, EPIC-Kitchens, etc. | Variable | Variable |

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para producción; el código de entrenamiento y evaluación aún no se ha publicado (estado "forthcoming").
- Dominio específico: entrenado exclusivamente en imágenes egocéntricas de VEDB, por lo que su generalización a imágenes estándar (no egocéntricas) puede ser limitada.
- Sesgos del dataset: VEDB contiene entornos y poblaciones concretas, lo que puede introducir sesgos demográficos y contextuales en las representaciones aprendidas.
- Sin redistribución de datos: las imágenes de VEDB no se incluyen en el repositorio; solo se distribuye el checkpoint, accesible a través de Databrary bajo sus propios términos.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto; sin embargo, las representaciones pueden estar sobreajustadas al dominio de entrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el uso del dataset VEDB subyacente puede tener restricciones adicionales que deben verificarse en Databrary.
- Sin cuantizaciones ni formatos optimizados: no se ofrecen versiones en safetensors, GGUF u otros formatos, lo que limita la interoperabilidad con herramientas de inferencia modernas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Baseline
- Colección de modelos VEDB: https://hf.co/collections/DM-Diaz/eccentricity-constrained-simclr-models-vedb
- Visual Experience Dataset (VEDB) en Databrary: https://www.databrary.org/volume/1612
- Paper del dataset VEDB (Greene et al., 2024): https://jov.arvojournals.org/article.aspx?articleid=2802101
- Presentación en CCN 2026 (YouTube): https://www.youtube.com/watch?v=Lb4S3FWqd2M&t=2545s
- Repositorio NeuroFovea: https://github.com/ArturoDeza/NeuroFovea
- DOI del estudio: 10.32470/0416gfsq
- arXiv del estudio: 2607.19316

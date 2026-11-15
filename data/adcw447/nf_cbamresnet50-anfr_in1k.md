# adcw447/nf_cbamresnet50.anfr_in1k

## Resumen

ANFR-50 (CBAM) es una red neuronal convolucional de clasificación de imágenes publicada por el autor adcw447 en Hugging Face, derivada del artículo "An Architecture Built for Federated Learning: Addressing Data Heterogeneity through Adaptive Normalization-Free Feature Recalibration" (Siomos, Passerat-Palmbach y Tarroni, TMLR 2025). Se trata de un ResNet-50 sin normalización por activación (normalization-free) que incorpora atención de canal CBAM en cada bloque y utiliza estandarización de pesos escalada. El modelo está preentrenado en ImageNet-1k y sirve como uno de los tres backbones ANFR del paper, desde cuyos pesos arrancan los experimentos de aprendizaje federado.

El modelo resuelve un problema específico del aprendizaje federado: la heterogeneidad de datos entre clientes hace que las capas de normalización tradicionales (BatchNorm) se comporten de forma inestable cuando las distribuciones locales difieren. Al eliminar la normalización por activación y sustituirla por una recalibración adaptativa de características mediante CBAM, el backbone es más robusto en escenarios federados no-IID. Con 28,07 millones de parámetros y una entrada de 224x224, alcanza un top-1 de 80,37 en ImageNet-1k según la Tabla 10 del paper.

Su relevancia actual es doble: por un lado, ofrece un punto de partida reproducible para investigación en federated learning con una arquitectura que no está definida de forma nativa en timm (requiere registrar el módulo); por otro, su licencia MIT y su formato safetensors facilitan su reutilización tanto en investigación como en producción. El repositorio tiene un tamaño de 0,1 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nf_cbamresnet50` (ResNet-50 con estandarización de pesos escalada, sin normalización por activación, atención CBAM de canal en cada bloque) |
| Parametros totales | 28.073.608 (28,07 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Entrada | 224x224, interpolación bicúbica, media y desviación estándar de ImageNet |
| Top-1 ImageNet-1k | 80,37 (Tabla 10 del paper) |
| Pesos publicados | media móvil exponencial (EMA) del entrenamiento, con decaimiento 0,9999 |
| Librería | timm (arquitectura no nativa, requiere registro previo) |
| Dataset | ImageNet-1k |

## Arquitectura y entrenamiento

La arquitectura es un ResNet-50 modificado en dos ejes. Primero, se elimina la normalización por activación (no hay BatchNorm ni LayerNorm tras las convoluciones) y se sustituye por una estandarización de pesos escalada, lo que evita la dependencia de estadísticas por lote y mejora la estabilidad cuando los datos están distribuidos de forma heterogénea entre clientes. Segundo, se incorpora atención CBAM de canal en cada bloque, que recalibra las características de forma adaptativa y compensa la ausencia de normalización. El resultado es un backbone diseñado explícitamente para el régimen federado, no un ResNet-50 estándar con retoques cosméticos.

El entrenamiento se realizó con el script de timm sobre ImageNet-1k, usando RMSProp (variante TensorFlow), learning rate de 0,09 con batch size de 1.024, decaimiento por pasos, weight decay de 7e-6, RandAugment (`rand-m8-n2-mstd1`), mixup 0,2, drop path 0,1 y precisión mixta. Los pesos publicados corresponden a la media móvil exponencial de la ejecución con decaimiento 0,9999, que es exactamente lo que cargaron los experimentos del paper. No se especifica en la información disponible el número total de tokens ni la composición detallada del dataset más allá de ImageNet-1k, ni si hubo fases de RLHF/DPO (no aplicables a un clasificador de imágenes).

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k con entrada de 224x224.
- Extracción de características visuales para tareas de transferencia (detección, segmentación, retrieval) mediante fine-tuning.
- Robustez frente a heterogeneidad de datos, pensada para escenarios de aprendizaje federado no-IID.
- Recalibración adaptativa de características mediante atención CBAM de canal en cada bloque.
- Funcionamiento sin normalización por activación, lo que simplifica el despliegue en entornos con lotes pequeños o estadísticas variables.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje federado: el modelo sirve como backbone inicial para experimentos federados con datos no-IID, ya que su diseño sin normalización por activación evita los problemas de BatchNorm cuando las distribuciones locales difieren entre clientes.
- Clasificación de imágenes en el borde (edge): con 28,07 M de parámetros y entrada de 224x224, es viable en dispositivos con recursos limitados, y la ausencia de normalización por activación simplifica la inferencia con lotes pequeños.
- Transfer learning para dominios médicos o industriales: se puede afinar sobre datasets específicos partiendo de los pesos EMA publicados, aprovechando el top-1 de 80,37 en ImageNet-1k como base razonable.
- Extracción de embeddings visuales: las características recalibradas por CBAM pueden alimentar pipelines de búsqueda por similitud o clustering de imágenes.
- Baseline reproducible en papers: al estar el comando de entrenamiento y el código en el repositorio de GitHub, sirve como referencia para comparar arquitecturas normalization-free en federated learning.
- Prototipado rápido con timm: una vez registrada la arquitectura, se integra en el ecosistema timm para experimentos de clasificación con `timm.create_model`.
- Evaluación de robustez federada: útil para medir cómo afecta la heterogeneidad de datos al rendimiento de un backbone sin normalización frente a uno con BatchNorm.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-1k top-1 | 80,37 | Tabla 10 del paper (TMLR 2025) |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un clasificador de imágenes. Tampoco se dispone de comparativas numéricas con otros backbones en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 112 MB solo para pesos (28,07 M x 4 bytes), más activaciones; en FP16, unos 56 MB para pesos. Con batch pequeño, cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; para entrenamiento o fine-tuning se recomiendan A100, H100, RTX 4090 o RTX 3090 por throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para inferencia; para fine-tuning conviene 8 GB o más.
- Opciones de despliegue: timm (con registro previo de la arquitectura vía `fl_bench.networks.anfr`), exportación a ONNX o TorchScript para servir con ONNX Runtime o TensorRT. No se indica soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ANFR-50 (CBAM) | 28,07 M | 224x224 | 80,37 | MIT | Hugging Face (timm, requiere registro) |
| ResNet-50 estándar (timm) | ~25,6 M | 224x224 | ~76-80 según receta | BSD/Apache según variante | timm nativo |
| ConvNeXt-Tiny | ~28 M | 224x224 | ~82,1 | MIT | timm nativo |
| EfficientNet-B0 | ~5,3 M | 224x224 | ~77,7 | Apache 2.0 | timm nativo |

Nota: los valores de ResNet-50, ConvNeXt-Tiny y EfficientNet-B0 son referencias habituales de la literatura y no proceden de la información proporcionada; se incluyen solo como orientación y deben verificarse en las fuentes originales. La comparativa directa con los otros dos backbones ANFR del paper no está disponible en la información consultada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con ImageNet-1k, hereda los sesgos de clase, geográficos y demográficos de ese dataset; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni soporta tareas multilingües. La entrada está fijada a 224x224 con la normalización de ImageNet.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; conviene revisar los términos del paper y del repositorio de código por si añaden condiciones adicionales.
- Caveat de producción: la arquitectura no está definida de forma nativa en timm, por lo que es obligatorio registrar el módulo (`fl_bench.networks.anfr`) antes de cargar el modelo; sin ese paso, `timm.create_model` fallará.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.
- No se documentan cuantizaciones oficiales ni resultados de robustez fuera de ImageNet-1k.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adcw447/nf_cbamresnet50.anfr_in1k
- Paper (OpenReview, TMLR 2025): https://openreview.net/forum?id=GtdYFLsblb
- Repositorio de código: https://github.com/siomvas/ANFR
- Documentación de timm: https://github.com/huggingface/pytorch-image-models

# adcw447/nf_seresnet50.anfr_in1k

## Resumen

ANFR-50 (SE) es una red neuronal convolucional para clasificación de imágenes derivada de ResNet-50, desarrollada por Vasilis Siomos, Jonathan Passerat-Palmbach y Giacomo Tarroni en el marco del paper "An Architecture Built for Federated Learning: Addressing Data Heterogeneity through Adaptive Normalization-Free Feature Recalibration" (TMLR, 2025). El modelo publicado bajo el identificador `adcw447/nf_seresnet50.anfr_in1k` es uno de los tres backbones ANFR del trabajo, con pesos preentrenados en ImageNet-1k y empaquetados para su uso directo a través de la librería `timm`.

La particularidad arquitectónica es que elimina por completo las capas de normalización por activación (BatchNorm, LayerNorm) y las sustituye por *scaled weight standardization* junto con atención de canal Squeeze-and-Excitation (SE) en cada bloque residual. Este diseño está pensado para escenarios de aprendizaje federado con heterogeneidad de datos, donde las estadísticas de normalización por lotes son problemáticas porque cada cliente ve distribuciones distintas y los lotes pequeños introducen ruido. Al no depender de estadísticas de lote, el modelo es más estable cuando se entrena de forma descentralizada.

Con 28,09 millones de parámetros, una entrada de 224×224 píxeles y un top-1 de 80,4 en ImageNet-1k (según la Tabla 10 del paper), se sitúa en la categoría de CNN de tamaño medio para clasificación de imágenes. Su relevancia actual es doble: por un lado, aporta pesos públicos a una arquitectura que `timm` ya implementaba pero no distribuía con checkpoint; por otro, sirve como punto de partida reproducible para investigación en federated learning con modelos convolucionales sin normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nf_seresnet50`: ResNet-50 sin normalización por activación, con scaled weight standardization y atención Squeeze-and-Excitation en cada bloque |
| Parametros totales | 28.088.024 (28,09 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen 224×224) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; etiquetas de ImageNet-1k en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `timm`) |
| Dataset de entrenamiento | ImageNet-1k |
| Resolución de entrada | 224×224, interpolación bicúbica, media y desviación típica de ImageNet |
| Top-1 en ImageNet-1k | 80,4 (Tabla 10 del paper) |
| Tamaño del repositorio | 0,1 GB |
| Librería | timm |

## Arquitectura y entrenamiento

La arquitectura `nf_seresnet50` parte del esqueleto de ResNet-50 (bloques bottleneck con conexiones residuales) pero sustituye las capas de normalización por activación por *scaled weight standardization*, una técnica que normaliza los pesos de las convoluciones en lugar de las activaciones. A esto se añade atención de canal Squeeze-and-Excitation en cada bloque, que recalibra las respuestas de los canales de forma adaptativa. El resultado es una red que no necesita estimar estadísticas por lote en tiempo de inferencia ni de entrenamiento, lo que la hace apta para entornos federados donde los lotes son pequeños y las distribuciones de datos difieren entre clientes.

El entrenamiento se realizó con el script de entrenamiento de `timm` sobre ImageNet-1k, usando RMSProp (variante TensorFlow), learning rate de 0,09 con batch size de 1.024, decaimiento por pasos, weight decay de 7e-6, RandAugment (`rand-m8-n2-mstd1`), mixup 0.2, drop path 0.1, precisión mixta y una media móvil exponencial de los pesos con decaimiento 0,9999. Los pesos publicados corresponden precisamente a esa EMA, que es la que cargaban los experimentos del paper. No se documenta en la información disponible el número exacto de tokens ni de épocas, ni si hubo fases de ajuste adicionales más allá del preentrenamiento supervisado estándar en ImageNet-1k.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet-1k, con salida de logits por clase.
- Extracción de características visuales intermedias mediante los distintos estadios de la red (útil como backbone congelado para tareas downstream).
- Aprendizaje por transferencia: ajuste fino sobre datasets de imagen médica, industrial o de teledetección, dado su tamaño moderado y su licencia permisiva.
- Entrenamiento federado: al carecer de normalización por activación, es adecuado para agregación de modelos entre clientes con distribuciones heterogéneas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente discriminativo de visión.
- No dispone de capacidades multilingües ni de generación de texto.
- No incorpora modo *thinking*, visión-lenguaje, audio ni otras modalidades.

## Casos de uso

- Clasificación de imágenes en producción con recursos limitados: con 28 M de parámetros y entrada de 224×224, puede servirse en CPU o en GPU de gama baja para tareas de etiquetado automático de imágenes, con un coste de inferencia bajo comparado con transformers visuales de mayor tamaño.
- Backbone para ajuste fino en dominios especializados: se puede congelar o afinar sobre datasets de rayos X, imágenes de satélite o control de calidad industrial, aprovechando que los pesos de ImageNet-1k ya están disponibles y que la licencia MIT permite uso comercial.
- Investigación en federated learning: es uno de los tres backbones ANFR del paper, por lo que sirve como punto de partida reproducible para experimentos de entrenamiento descentralizado con heterogeneidad de datos entre clientes.
- Sistemas de moderación de contenido visual: clasificación de imágenes en categorías predefinidas para filtrado previo en plataformas, combinable con otros modelos en un pipeline.
- Extracción de embeddings para búsqueda visual: las activaciones de la penúltima capa pueden usarse como descriptores para recuperación por similitud en catálogos de producto o archivos multimedia.
- Prototipado rápido en `timm`: al cargarse con `timm.create_model("hf_hub:adcw447/nf_seresnet50.anfr_in1k", pretrained=True)`, permite integrarse en pipelines existentes de la librería sin conversión manual de pesos.
- Evaluación comparativa de arquitecturas sin normalización: útil como referencia para estudiar el impacto de eliminar BatchNorm en tareas de clasificación y en regímenes de lote pequeño.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-1k top-1 | 80,4 | Tabla 10 del paper (TMLR, 2025) |
| ImageNet-1k top-5 | no disponible | No reportado en la información proporcionada |
| Otros benchmarks (MMLU, HumanEval, GSM8K, etc.) | no disponible | No aplicables: modelo de visión |

No se han publicado en la información disponible resultados adicionales de benchmarks ni comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 110 MB para los pesos (28,09 M × 4 bytes), más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en FP16: aproximadamente 56 MB para los pesos, con un consumo total por debajo de 1 GB incluyendo activaciones.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento o ajuste fino: RTX 3090/4090, A100 o H100 si se entrena desde cero o con lotes grandes; para ajuste fino sobre datasets moderados, una RTX 3060 de 12 GB es suficiente.
- Opciones de despliegue: `timm` (carga directa desde Hugging Face), PyTorch nativo, exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; al ser una CNN de 28 M de parámetros, se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nf_seresnet50.anfr_in1k | 28,09 M | 224×224 | 80,4 | MIT | Hugging Face (`timm`) |
| ResNet-50 estándar (torchvision) | ~25,6 M | 224×224 | ~76,1 | BSD-3 | torchvision |
| SE-ResNet-50 | ~28,1 M | 224×224 | ~77,6 | según implementación | `timm` (pesos originales) |
| ConvNeXt-Tiny | ~28,6 M | 224×224 | ~82,1 | CC BY 4.0 / MIT según checkpoint | `timm` |

Los datos de los modelos comparativos corresponden a valores de referencia habituales de la literatura; la información proporcionada solo incluye el top-1 del modelo ANFR (80,4). No se dispone de comparaciones directas publicadas en la model card entre este modelo y las alternativas.

## Limitaciones y advertencias

- Modelo puramente discriminativo de visión: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Entrenado exclusivamente en ImageNet-1k: puede presentar sesgos hacia las 1.000 clases de ese dataset y degradarse en dominios visuales muy distintos (imagen médica, satélite, documentos) sin ajuste fino.
- Riesgo de clasificación errónea en clases ambiguas o poco representadas en ImageNet-1k; no se documentan análisis de calibración ni de robustez frente a perturbaciones.
- La ausencia de normalización por activación puede afectar a la estabilidad del ajuste fino con tasas de aprendizaje altas; se recomienda validar hiperparámetros antes de desplegar.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento (ImageNet-1k) para usos derivados.
- No se documentan limitaciones idiomáticas ni de contexto porque no aplican a un modelo de clasificación de imágenes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se han publicado métricas de latencia, throughput ni consumo energético en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adcw447/nf_seresnet50.anfr_in1k
- Paper (OpenReview, TMLR 2025): https://openreview.net/forum?id=GtdYFLsblb
- Repositorio de código: https://github.com/siomvas/ANFR
- Librería `timm`: https://github.com/huggingface/pytorch-image-models
- Dataset ImageNet-1k: https://www.image-net.org/

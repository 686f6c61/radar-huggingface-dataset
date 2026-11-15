# adcw447/nf_ecaresnet50.anfr_in1k

## Resumen

`nf_ecaresnet50.anfr_in1k` es un modelo de clasificación de imágenes basado en una ResNet-50 sin normalización por activaciones, con atención de canal ECA (Efficient Channel Attention) en cada bloque. Lo publica el usuario adcw447 en Hugging Face y es uno de los tres backbones ANFR presentados en el artículo "An Architecture Built for Federated Learning: Addressing Data Heterogeneity through Adaptive Normalization-Free Feature Recalibration" (Siomos, Passerat-Palmbach y Tarroni, TMLR 2025). El modelo está preentrenado en ImageNet-1k y sus pesos corresponden a la media móvil exponencial (EMA) del entrenamiento, que es la que se cargó en los experimentos de aprendizaje federado del paper.

La relevancia del modelo es doble. Por un lado, cubre un hueco en `timm`, que incluía la arquitectura `nf_ecaresnet50` pero no distribuía pesos preentrenados. Por otro, sirve como punto de partida para experimentos de aprendizaje federado en escenarios con heterogeneidad de datos, ya que la ausencia de capas de normalización por activaciones (sustituidas por weight standardization escalada) evita los problemas clásicos de agregación de estadísticas de normalización entre clientes.

Se trata de un modelo pequeño (25,56 M de parámetros, repo de 0,1 GB) orientado exclusivamente a clasificación de imágenes a 224x224. No es un modelo de lenguaje ni un modelo multimodal: no procesa texto, no tiene tool calling ni capacidades de agente. Su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nf_ecaresnet50` (ResNet-50 con scaled weight standardization, sin normalización por activaciones, atención ECA por bloque) |
| Parametros totales | 25.557.118 (25,56 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 modificada en dos ejes. Primero, elimina toda normalización por activaciones (BatchNorm/GroupNorm/LayerNorm) y la sustituye por scaled weight standardization en las capas convolucionales, lo que estabiliza el entrenamiento sin depender de estadísticas de batch. Segundo, incorpora atención de canal ECA (Efficient Channel Attention) en cada bloque, una recalibración de features ligera que adapta la respuesta de los canales sin añadir una carga paramétrica significativa. Esta combinación está pensada para aprendizaje federado: al no haber estadísticas de normalización que agregar entre clientes, el esquema de federación se simplifica y se reduce el sesgo introducido por la heterogeneidad de datos entre nodos.

El entrenamiento se realizó con el script de `timm` sobre ImageNet-1k a 224x224 con interpolación bicúbica. Se usó RMSProp (variante TensorFlow), learning rate 0,09 con batch size 1.024, step decay, weight decay 7e-6, RandAugment (`rand-m8-n2-mstd1`), mixup 0,2, drop path 0,1, precisión mixta y una media móvil exponencial de los pesos con decay 0,9999. Los pesos publicados son precisamente los de la EMA. El modelo alcanza un top-1 de 80,61 en ImageNet-1k según la Tabla 10 del paper.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Extracción de features visuales a partir de un backbone convolucional con atención de canal.
- Funciona como backbone preentrenado para fine-tuning en tareas de visión (detección, segmentación, clasificación de dominio específico).
- Punto de partida para experimentos de aprendizaje federado, especialmente con datos no IID.
- Inferencia determinista con pesos EMA, sin dependencia de estadísticas de batch en tiempo de ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de audio o vídeo.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Clasificación de imágenes en producción: el modelo se puede desplegar como clasificador de 1.000 clases con entrada 224x224; su tamaño de 25,56 M de parámetros permite incluirlo en servicios de inferencia ligeros sin GPU dedicada.
- Fine-tuning para dominios específicos: al ser un backbone preentrenado en ImageNet-1k con pesos EMA, sirve como inicialización para clasificación médica, industrial o de producto, sustituyendo la cabeza de 1.000 clases por una adaptada al dominio.
- Investigación en aprendizaje federado: es uno de los tres backbones ANFR del paper y está pensado para arrancar experimentos federados con heterogeneidad de datos, evitando los problemas de agregación de estadísticas de normalización.
- Extracción de embeddings visuales: las features del backbone se pueden usar para búsqueda por similitud, clustering de imágenes o sistemas de recomendación visual, con la ventaja de no depender de BatchNorm en inferencia.
- Baseline en benchmarks de visión: al estar integrado en `timm` mediante `timm.create_model("hf_hub:adcw447/nf_ecaresnet50.anfr_in1k", pretrained=True)`, se puede usar como referencia reproducible frente a otras ResNet-50 en estudios comparativos.
- Prototipado en entornos con recursos limitados: el repo de 0,1 GB y los 25,56 M de parámetros permiten descargar y ejecutar el modelo en portátiles o instancias CPU pequeñas para pruebas rápidas.
- Docencia y reproducción de resultados: el comando de entrenamiento completo está en el repositorio de código, lo que facilita reproducir el pipeline con el script de `timm`.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fuente |
|---|---|---|
| ImageNet-1k top-1 | 80,61 | Tabla 10 del paper (TMLR 2025) |

No se han publicado en la información disponible resultados de otros benchmarks (top-5, throughput, latencia) ni comparativas numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 100 MB para los pesos (25,56 M de parámetros x 4 bytes), más activaciones para batch de entrada 224x224; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 50 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `timm` (vía `timm.create_model` con `pretrained=True`), exportación a ONNX o TorchScript para servir con ONNX Runtime o TorchServe; también es posible usar TensorRT para optimización. No hay pesos GGUF publicados, por lo que `llama.cpp` y `Ollama` no aplican.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nf_ecaresnet50.anfr_in1k` | 25,56 M | 224x224 | 80,61 | MIT | Hugging Face (`timm`) |
| ResNet-50 estándar (referencia `timm`) | ~25,6 M | 224x224 | no disponible en esta ficha | varía según checkpoint | `timm` |
| Otras ResNet-50 con atención de canal | no disponible | 224x224 | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos de los modelos alternativos para una comparación rigurosa. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, audio ni vídeo; no es un LLM y no debe evaluarse con métricas de lenguaje.
- Entrenado solo en ImageNet-1k: puede presentar sesgos hacia las 1.000 clases de ese dataset y degradarse en dominios alejados (imágenes médicas, satelitales, industriales) sin fine-tuning.
- Riesgo de clasificación errónea en clases visualmente similares o fuera de distribución; no se han publicado análisis de calibración ni de robustez.
- Sin capas de normalización por activaciones: aunque esto es una ventaja para federated learning, puede afectar la estabilidad en fine-tuning con batches muy pequeños o dominios muy distintos; conviene validar el comportamiento antes de producción.
- No hay información publicada sobre sesgos demográficos, geográficos o de otro tipo; se recomienda auditar el modelo en el dominio de aplicación.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de copyright y la atribución correspondiente.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de uso en producción; conviene validar los pesos antes de adoptarlo.
- No se han publicado pesos cuantizados ni formatos alternativos (GGUF, ONNX preexportado); el despliegue requiere conversión propia.

## Enlaces

- Hugging Face: https://huggingface.co/adcw447/nf_ecaresnet50.anfr_in1k
- Paper (OpenReview, TMLR 2025): https://openreview.net/forum?id=GtdYFLsblb
- Repositorio de código: https://github.com/siomvas/ANFR
- `timm` (librería): https://github.com/huggingface/pytorch-image-models

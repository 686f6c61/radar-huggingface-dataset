# DeepLearnPhysics/panda-v2-semseg.tpcpp-10m

## Resumen

panda-v2-semseg.tpcpp-10m es un modelo de segmentación semántica de nubes de puntos para física de partículas, desarrollado por DeepLearnPhysics. Se construye sobre el encoder `panda-v2.tpcpp-10m`, preentrenado en el conjunto TPCpp-10M (datos de cámaras de proyección temporal, TPC), y se adapta mediante LoRA de rango 16 con una cabeza MLP (`DefaultSegmentorV2`) para clasificar cada punto de la nube en una categoría semántica. El modelo está pensado para el análisis de eventos en detectores tipo TPC, como los de experimentos de física de altas energías (el nombre del checkpoint de entrenamiento hace referencia a sPHENIX).

El modelo tiene 56.282.263 parámetros totales y se distribuye en formato safetensors con la librería `pimm` (particle-imaging-models), un framework específico para modelos de imágenes de partículas. El repositorio ocupa 0,2 GB. No se dispone de información sobre licencia, idiomas ni pipeline en Hugging Face.

Su relevancia radica en que aplica técnicas modernas de adaptación eficiente (LoRA) y arquitecturas de nubes de puntos al dominio de la física experimental, un nicho donde los modelos genéricos de visión no funcionan bien. La ficha se limita a los datos disponibles en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de nubes de puntos (panda-v2) + cabeza MLP de segmentación (`DefaultSegmentorV2`), adaptado con LoRA rango 16 |
| Parametros totales | 56.282.263 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Tamano del repo | 0,2 GB |
| Dataset de entrenamiento | TPCpp-10M (70K eventos etiquetados para fine-tuning) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-cabeza: un encoder de nubes de puntos (`panda-v2.tpcpp-10m`) preentrenado sobre TPCpp-10M, seguido de una cabeza MLP de segmentación semántica (`DefaultSegmentorV2`) que produce puntuaciones de clase por punto. La adaptación al dominio se realiza con LoRA de rango 16 sobre el encoder, y el conjunto (encoder adaptado + cabeza) se afina sobre los 70K eventos etiquetados de TPCpp-10M. Los pesos publicados corresponden al mejor checkpoint de validación del run `panda-v2-sphenix-semseg-mlp-lora-n70k`, evaluado sobre el split de test del paper.

No se dispone de información detallada sobre el número total de tokens/puntos de preentrenamiento, la composición exacta del dataset TPCpp-10M, ni si hubo etapas de RLHF/DPO (no aplicable en este dominio). La model card menciona que en GPUs sin FlashAttention debe pasarse `attention_backend="torch"` a `pimm.from_pretrained`, lo que indica que el encoder emplea mecanismos de atención con backend optimizado opcional.

## Capacidades

- Segmentación semántica por punto: asigna una clase a cada punto de la nube de puntos de un evento TPC.
- Procesamiento de nubes de puntos de física de partículas (eventos de detector TPC).
- Adaptación eficiente mediante LoRA (rango 16) sobre un encoder preentrenado.
- Inferencia en GPU con backend de atención configurable (FlashAttention o `torch`).
- Integración con el framework `pimm` para carga y ejecución (`pimm.from_pretrained`).
- No se documentan capacidades de generación de texto, código, matemáticas, visión genérica, tool calling, agentes ni multilingüismo.

## Casos de uso

- Etiquetado semántico de eventos en detectores TPC: clasificar cada punto (hit) de un evento en su categoría física correspondiente, lo que permite separar señales de fondo en análisis de física de altas energías.
- Preprocesado para reconstrucción de trazas: usar las etiquetas por punto como entrada a pipelines posteriores de reconstrucción de trayectorias de partículas.
- Análisis offline de datos de sPHENIX: aplicar el modelo a eventos registrados para estudios de rendimiento y validación del detector, dado que el checkpoint fue entrenado y evaluado en el contexto del experimento sPHENIX.
- Control de calidad de datos: detectar eventos o regiones anómalas comparando la segmentación predicha con la esperada, como parte de la monitorización de la toma de datos.
- Transferencia a otros detectores TPC: partir del encoder preentrenado en TPCpp-10M y afinar con LoRA sobre datos de otro experimento, reduciendo el coste de entrenamiento.
- Investigación en métodos de adaptación eficiente: servir como referencia reproducible para estudiar LoRA en modelos de nubes de puntos científicos.
- Generación de datasets etiquetados a escala: usar el modelo para preetiquetar grandes volúmenes de eventos y acelerar la anotación humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que estos son los pesos evaluados en el split de test del paper, pero no se incluyen las métricas numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 56,3 M de parámetros en precisión completa (fp32) el peso ronda los 225 MB, y en fp16 unos 113 MB, por lo que la VRAM necesaria vendrá dominada por el tamaño del batch de nubes de puntos y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada; la model card menciona ejecución con `device="cuda"` y el uso opcional de FlashAttention.
- Compatibilidad con GPU de consumo: probable por el reducido número de parámetros, pero no confirmado en la información disponible.
- Opciones de despliegue: librería `pimm` (carga con `pimm.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación semántica de nubes de puntos para física de partículas ni sus métricas.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- Especialización de dominio: el modelo está entrenado para eventos TPC de física de partículas; su uso fuera de ese dominio no está validado.
- Entrenamiento sobre un único dataset (TPCpp-10M): posible sesgo hacia las características de ese conjunto y del detector asociado (sPHENIX).
- Riesgo de degradación fuera de distribución: eventos con condiciones distintas a las del entrenamiento pueden producir segmentaciones erróneas.
- Dependencia del framework `pimm` y de los transforms de evaluación específicos (`configs/panda/v2/finetune/_base_/datasets/sphenix.py`); un preprocesado incorrecto invalida las predicciones.
- Requiere configuración explícita del backend de atención en GPUs sin FlashAttention (`attention_backend="torch"`).
- Sin métricas de benchmarks publicadas en la información disponible, no es posible cuantificar su precisión frente a alternativas.
- Ausencia de información sobre sesgos, robustez y comportamiento en producción más allá de lo indicado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-semseg.tpcpp-10m
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.tpcpp-10m
- Repositorio del framework pimm: https://github.com/DeepLearnPhysics/particle-imaging-models

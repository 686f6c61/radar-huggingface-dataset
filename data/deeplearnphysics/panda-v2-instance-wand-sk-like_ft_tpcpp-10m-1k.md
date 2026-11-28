# DeepLearnPhysics/panda-v2-instance.wand-sk-like_ft_tpcpp-10m-1k

## Resumen

`panda-v2-instance.wand-sk-like_ft_tpcpp-10m-1k` es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Trabaja sobre nubes de puntos generadas por el detector Panda V2 y está diseñado para identificar y separar las trazas o depósitos individuales (instancias) producidos por partículas en eventos de colisión. El modelo parte del encoder `panda-v2.wand-sk-like`, preentrenado sobre el conjunto WAND SK-like, y se adapta mediante LoRA (rango 16) junto con una cabeza de segmentación, afinada sobre 1.000 eventos etiquetados de TPCpp-10M.

La relevancia de este modelo es acotada pero específica: se trata de un checkpoint de investigación publicado junto a un artículo, pensado para reproducir resultados de segmentación de instancias en el detector Panda V2. No es un modelo de lenguaje ni un modelo generativo general; es un componente de visión 3D especializado en datos de física experimental. Su tamaño (aproximadamente 59,8 millones de parámetros) y su formato (safetensors, librería `pimm`) lo sitúan como una pieza ligera dentro de un pipeline de análisis de datos de detectores.

El modelo se distribuye sin model card extensa más allá de la nota de uso y del código de ejemplo, y sin datos declarados de licencia, idiomas o benchmarks en la información disponible. Su valor principal reside en la reproducibilidad del resultado publicado y en la posibilidad de reutilizar el encoder preentrenado para tareas relacionadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer sobre nubes de puntos (Panda V2) con cabeza de segmentación de instancias; adaptación LoRA de rango 16 |
| Parámetros totales | 59.836.824 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sobre nubes de puntos, no secuencial) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada de datos de detector) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un detector Panda V2 (`panda-detector-v2m1`) cuya columna vertebral es el encoder `panda-v2.wand-sk-like`, preentrenado sobre el conjunto de datos WAND SK-like. Sobre ese encoder se aplica una adaptación LoRA de rango 16 y se añade una cabeza de segmentación de instancias, que se entrena de forma conjunta con la adaptación sobre 1.000 eventos etiquetados del conjunto TPCpp-10M. Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución `panda-v2-sphenix-n1000-from-wand`, y son los que se evalúan sobre el split de test en el artículo asociado.

No se dispone en la información proporcionada de detalles sobre el número total de tokens o eventos de preentrenamiento, la composición exacta del dataset WAND SK-like, ni sobre el uso de RLHF, DPO u otras técnicas de alineación (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El único detalle técnico de despliegue indicado es la posibilidad de usar el backend de atención de PyTorch (`attention_backend="torch"`) en GPUs sin FlashAttention.

## Capacidades

- Segmentación de instancias sobre nubes de puntos de eventos del detector Panda V2: predice las instancias individuales a partir de un lote de entrada.
- Reutilización del encoder preentrenado en WAND SK-like para tareas de representación de nubes de puntos en física de partículas.
- Adaptación eficiente mediante LoRA, lo que permite afinar el encoder con un coste reducido de parámetros entrenables.
- Inferencia en GPU con soporte de FlashAttention y alternativa en PyTorch puro.
- Integración con la librería `pimm` (`pimm.from_pretrained` y llamada directa al modelo sobre un lote).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión natural, audio ni generación de texto.

## Casos de uso

- Reproducción de resultados de investigación: cargar el checkpoint con `pimm` y evaluar sobre el split de test de TPCpp-10M para verificar las cifras del artículo sobre segmentación de instancias en Panda V2.
- Análisis de eventos en física experimental: procesar lotes de nubes de puntos de colisiones y separar las instancias asociadas a cada partícula para su posterior reconstrucción.
- Punto de partida para afinamiento con LoRA: reutilizar el encoder `panda-v2.wand-sk-like` y la configuración de adaptación para entrenar sobre nuevos conjuntos de eventos etiquetados con pocos datos.
- Evaluación comparativa de encoders de nubes de puntos: usar este modelo como referencia frente a otros encoders en tareas de segmentación sobre datos de detectores gaseosos (TPC).
- Desarrollo de pipelines de reconstrucción: integrar la salida de instancias en una cadena de reconstrucción de trazas dentro de un flujo de análisis de datos de detector.
- Validación de infraestructura de inferencia: al ser un modelo de ~60 M de parámetros y 0,2 GB, sirve para probar despliegues de `pimm` en GPU con y sin FlashAttention antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del checkpoint (~60 M de parámetros, repo de 0,2 GB) el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; se indica compatibilidad con FlashAttention y alternativa en PyTorch (`attention_backend="torch"`) en GPUs sin FlashAttention.
- GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, dado el reducido número de parámetros (estimación basada en el tamaño, no en datos publicados).
- Opciones de despliegue: librería `pimm` (carga con `pimm.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de segmentación de instancias sobre nubes de puntos para detectores Panda V2 ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación especializado: no es un modelo de propósito general y no debe evaluarse con métricas de lenguaje.
- Entrenado con solo 1.000 eventos etiquetados de TPCpp-10M; el riesgo de sobreajuste y de baja generalización a otras condiciones del detector es relevante.
- Dependencia del preentrenamiento en WAND SK-like: el rendimiento puede degradarse fuera de la distribución de ese conjunto.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin datos publicados de sesgos, alucinación o robustez; en este dominio el riesgo principal es la predicción incorrecta de instancias (falsos positivos/negativos en la segmentación).
- Requiere preparar las entradas con las transformaciones de evaluación del fichero `configs/panda/v2/finetune/_base_/datasets/sphenix.py` del repositorio `pimm`; un preprocesado incorrecto invalida los resultados.
- En GPUs sin FlashAttention es obligatorio pasar `attention_backend="torch"`.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a este tipo de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.wand-sk-like_ft_tpcpp-10m-1k
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.wand-sk-like
- Repositorio `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models
- Configuración de evaluación: `configs/panda/v2/finetune/_base_/datasets/sphenix.py` (dentro del repositorio `pimm`)

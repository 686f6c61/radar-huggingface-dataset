# DeepLearnPhysics/panda-v2-instance.wand-sk-like_ft_wand-sk-like-1k

## Resumen

`panda-v2-instance.wand-sk-like_ft_wand-sk-like-1k` es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Se construye sobre el detector Panda V2 (variante `panda-detector-v2m1`) y parte del encoder `panda-v2.wand-sk-like`, preentrenado sobre datos de tipo WAND SK-like. El modelo resultante adapta ese encoder mediante LoRA (rango 16) y afina conjuntamente encoder y cabeza de segmentación sobre 1.000 eventos etiquetados de WAND SK-like.

El modelo resuelve la tarea de identificar y segmentar instancias individuales dentro de eventos de detección de partículas representados como nubes de puntos. Es relevante para el ecosistema de imagen de partículas de DeepLearnPhysics, ya que proporciona pesos ya afinados y evaluados sobre el split de test del artículo asociado, listos para su uso mediante la librería `pimm`.

Con 60.122.830 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a investigación en física de partículas, no a propósito general. La información pública disponible es limitada: no se detallan licencia, idiomas ni pipeline estándar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (`panda-detector-v2m1`) con encoder `panda-v2.wand-sk-like` y cabeza de segmentación de instancias; adaptación LoRA (rango 16) |
| Parametros totales | 60.122.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión/nubes de puntos, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un detector de segmentación de instancias basado en la arquitectura Panda V2, especializada en nubes de puntos de eventos de física de partículas. El encoder procede de `panda-v2.wand-sk-like`, preentrenado sobre datos WAND SK-like, y se adapta mediante LoRA con rango 16. Sobre ese encoder adaptado se entrena una cabeza de segmentación de instancias.

El ajuste fino se realiza sobre 1.000 eventos etiquetados de WAND SK-like, entrenando conjuntamente la adaptación LoRA y la cabeza. Los pesos publicados corresponden al mejor checkpoint de validación del run `panda-v2-wand-n1000-from-wand` y son los evaluados sobre el split de test en el artículo. No se detalla en la información disponible el número de tokens ni la composición completa del dataset de preentrenamiento, ni si se emplearon técnicas de RLHF/DPO (no aplicables en este dominio). Como innovación operativa destacable, el modelo admite la selección del backend de atención: en GPUs sin FlashAttention puede usarse `attention_backend="torch"`.

## Capacidades

- Segmentación de instancias en eventos de física de partículas representados como nubes de puntos.
- Extracción de características mediante un encoder preentrenado en datos WAND SK-like y adaptado con LoRA.
- Inferencia directa a través de la librería `pimm` con `pimm.from_pretrained(...)`.
- Ejecución en GPU CUDA; soporte de backend de atención alternativo (`torch`) cuando no hay FlashAttention.
- No dispone de capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión natural ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- Capacidades multilingües: no aplica (modelo no lingüístico).

## Casos de uso

- Segmentación de eventos en análisis de física de partículas: el modelo recibe lotes de eventos preparados con las transformaciones de evaluación del repositorio `pimm` y devuelve las instancias predichas, adecuado para pipelines de reconstrucción de trazas o depósitos de energía.
- Reproducción de resultados de investigación: al ser los pesos evaluados sobre el split de test del artículo, permite reproducir las métricas publicadas con las transformaciones de `configs/panda/v2/finetune/_base_/datasets/wc.py`.
- Punto de partida para ajuste fino con pocos datos: su adaptación LoRA sobre 1.000 eventos sirve como base para nuevos conjuntos de datos de tipo WAND SK-like con presupuestos de etiquetado reducidos.
- Prototipado en GPUs de gama consumer: con 60 millones de parámetros y 0,2 GB de pesos, puede desplegarse en entornos de desarrollo modestos para pruebas de segmentación.
- Evaluación comparativa de detectores: útil como referencia frente a otros detectores Panda V2 o configuraciones de preentrenamiento en estudios de ablación.
- Integración en flujos de imagen de partículas: se conecta con el ecosistema `particle-imaging-models` para tareas de segmentación dentro de cadenas de procesamiento más amplias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que estos pesos son los evaluados sobre el split de test del artículo, pero no incluye cifras concretas de métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 60,1 millones de parámetros y pesos en safetensors de 0,2 GB, la huella de pesos es reducida y el consumo dominante dependerá del tamaño de lote y de la resolución de las nubes de puntos.
- GPU recomendadas: no disponible; se documenta soporte CUDA y uso de FlashAttention cuando está disponible, con alternativa `attention_backend="torch"` en GPUs sin FlashAttention.
- Compatibilidad con GPU consumer: probable por tamaño de modelo, aunque no se confirma en la información disponible.
- Opciones de despliegue: librería `pimm` (carga vía `pimm.from_pretrained` con `device="cuda"`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| panda-v2-instance.wand-sk-like_ft_wand-sk-like-1k | 60.122.830 | no disponible | Segmentación de instancias en nubes de puntos | no disponible | Hugging Face (DeepLearnPhysics) |
| panda-v2.wand-sk-like (encoder base) | no disponible | no disponible | Representación de eventos (encoder) | no disponible | Hugging Face (DeepLearnPhysics) |
| panda-detector-v2m1 | no disponible | no disponible | Detección Panda V2 | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio específico (física de partículas, nubes de puntos); no es adecuado para tareas de lenguaje, visión natural ni propósito general.
- Entrenado y afinado sobre datos WAND SK-like; su generalización a otros detectores o dominios de datos no está documentada.
- El ajuste fino se realizó con solo 1.000 eventos etiquetados, lo que puede limitar la robustez frente a distribuciones distintas.
- Riesgo de sesgo hacia las características del conjunto WAND SK-like y del split de entrenamiento.
- No se especifica licencia, por lo que el uso comercial no puede asumirse y requiere consulta con el autor.
- No se documentan limitaciones de contexto ni de idioma por tratarse de un modelo no lingüístico.
- En GPUs sin FlashAttention es necesario configurar `attention_backend="torch"`; de lo contrario, la inferencia puede fallar.
- Los inputs deben prepararse con las transformaciones de evaluación específicas del repositorio `pimm`; un preprocesado distinto puede degradar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.wand-sk-like_ft_wand-sk-like-1k
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.wand-sk-like
- Repositorio `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models

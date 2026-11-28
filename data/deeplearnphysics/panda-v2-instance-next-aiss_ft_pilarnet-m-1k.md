# DeepLearnPhysics/panda-v2-instance.next-aiss_ft_pilarnet-m-1k

## Resumen

`panda-v2-instance.next-aiss_ft_pilarnet-m-1k` es un modelo de segmentación de instancias para nubes de puntos tridimensionales procedentes de detectores de física de partículas, desarrollado por el grupo DeepLearnPhysics. Se construye sobre el encoder `panda-v2.next-aiss`, preentrenado en el conjunto NEXT-AISS, al que se le aplica una adaptación LoRA de rango 16 y un ajuste fino posterior junto con la cabeza de segmentación sobre 1.000 eventos etiquetados del dataset PILArNet-M. Los pesos publicados corresponden al mejor checkpoint de validación del experimento `panda-v2-lar-n1000-from-next`, evaluado sobre la partición de test del artículo.

El modelo resuelve la tarea de identificar y separar instancias individuales (por ejemplo, trazas o depósitos de energía) dentro de una imagen de detector de argón líquido, un paso clave en la reconstrucción de eventos en experimentos como DUNE o ProtoDUNE. Con 60.427.164 parámetros y un peso de repositorio de 0,2 GB, es un modelo compacto orientado a investigación, no a uso generalista.

Su relevancia actual radica en que demuestra que el ajuste fino con LoRA sobre encoders preentrenados en dominios específicos permite obtener segmentadores de instancias competitivos con solo 1.000 eventos etiquetados, reduciendo drásticamente el coste de anotación en física experimental. La librería de referencia es `pimm` (particle-imaging-models), del mismo grupo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Panda V2 (`panda-v2.next-aiss`) con cabeza de segmentación de instancias; adaptación LoRA de rango 16 |
| Parametros totales | 60.427.164 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Tamano del repositorio | 0,2 GB |
| Tarea | Segmentación de instancias en nubes de puntos (particle-physics, point-cloud) |
| Dataset de ajuste fino | PILArNet-M, 1.000 eventos etiquetados |
| Dataset de preentrenamiento del encoder | NEXT-AISS |
| Backend de atencion | FlashAttention por defecto; `attention_backend="torch"` en GPUs sin FlashAttention |

## Arquitectura y entrenamiento

El modelo es un detector de segmentación de instancias para nubes de puntos, denominado Panda V2 (`panda-detector-v2m1`). La arquitectura se apoya en un encoder `panda-v2.next-aiss` preentrenado sobre el conjunto NEXT-AISS; sobre este encoder se aplica una adaptación LoRA de rango 16 y, posteriormente, un ajuste fino conjunto de la cabeza de segmentación y de los adaptadores LoRA sobre 1.000 eventos etiquetados de PILArNet-M. El checkpoint publicado es el mejor de validación del experimento `panda-v2-lar-n1000-from-next`, evaluado en la partición de test del artículo.

No se dispone en la información proporcionada de detalles sobre el número de tokens o puntos de entrenamiento, la composición exacta del dataset, ni sobre el uso de RLHF/DPO (no aplicable a este dominio). La innovación técnica destacable es el uso de LoRA para adaptar un encoder preentrenado en un dominio de física a un nuevo conjunto de datos con muy pocas etiquetas (1.000 eventos), manteniendo el resto de pesos congelados. El modelo está diseñado para ejecutarse con FlashAttention, con alternativa en PyTorch puro para GPUs que no la soportan.

## Capacidades

- Segmentación de instancias en nubes de puntos 3D procedentes de detectores de partículas.
- Reconstrucción de trazas y depósitos de energía individuales dentro de un evento de detector de argón líquido.
- Aprovechamiento de un encoder preentrenado en NEXT-AISS para transferencia a PILArNet-M.
- Adaptación eficiente mediante LoRA (rango 16), lo que permite ajustes posteriores con pocos datos.
- Ejecución en GPU con soporte de FlashAttention y fallback a backend `torch`.
- Integración con la librería `pimm` mediante `pimm.from_pretrained`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reconstrucción de eventos en detectores de argón líquido: el modelo separa las instancias (trazas, cascadas) de un evento, lo que permite reconstruir la topología de la interacción para análisis físicos en experimentos tipo DUNE o ProtoDUNE.
- Etiquetado asistido y control de calidad: al ser un segmentador entrenado con solo 1.000 eventos, puede usarse para pre-etiquetar nuevos eventos y reducir el esfuerzo de anotación manual por parte de físicos.
- Estudios de transferencia con pocos datos: sirve como referencia para evaluar cuánto rendimiento se obtiene al adaptar un encoder preentrenado en NEXT-AISS a PILArNet-M con LoRA, informando decisiones sobre futuros ciclos de anotación.
- Benchmarking de segmentadores de nubes de puntos en física: al ser un checkpoint evaluado en la partición de test del artículo, se puede usar como línea base reproducible para comparar nuevas arquitecturas.
- Prototipado de pipelines de análisis en `pimm`: el modelo se carga con una sola llamada (`pimm.from_pretrained`) y se integra en flujos de evaluación existentes con las transformaciones de `lartpc.py`.
- Investigación en adaptación eficiente de parámetros: el uso de LoRA de rango 16 sobre un encoder congelado es un caso práctico para estudiar el equilibrio entre coste de ajuste y calidad de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 60,4 M de parámetros en safetensors (0,2 GB de repositorio), la huella de pesos es reducida y cabe holgadamente en GPUs de consumo, aunque el consumo real depende del tamaño del batch de nubes de puntos y de las activaciones intermedias.
- GPU recomendadas: no disponible en la información proporcionada. El modelo está pensado para ejecutarse en GPU (`device="cuda"`) y aprovecha FlashAttention cuando está disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `pimm` (carga vía `pimm.from_pretrained`); backend de atención FlashAttention o `torch` en GPUs sin soporte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de segmentación de instancias en nubes de puntos para física de partículas, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de dominio muy específico (física de partículas, nubes de puntos 3D); no es un modelo de lenguaje ni un modelo generativo de propósito general.
- Entrenado con solo 1.000 eventos etiquetados de PILArNet-M, lo que puede limitar la generalización a otras configuraciones de detector o distribuciones de datos distintas.
- Depende del encoder `panda-v2.next-aiss` y de las transformaciones de evaluación definidas en `configs/panda/v2/finetune/_base_/datasets/lartpc.py`; un uso incorrecto de las transformaciones puede degradar los resultados.
- Requiere FlashAttention para el máximo rendimiento; en GPUs sin soporte debe pasarse `attention_backend="torch"`, con posible impacto en velocidad.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- No se dispone de información sobre sesgos, tasas de alucinación (no aplicable en el sentido habitual) ni limitaciones idiomáticas.
- Al ser un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.next-aiss_ft_pilarnet-m-1k
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.next-aiss
- Repositorio `pimm` (particle-imaging-models): https://github.com/DeepLearnPhysics/particle-imaging-models
- Resultado de búsqueda web: https://www.wikipedia.fr/ (sin contenido relevante para este modelo)

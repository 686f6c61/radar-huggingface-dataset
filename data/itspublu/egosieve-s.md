# itspublu/EgoSieve-S

## Resumen

EgoSieve-S es un modelo de clasificación de vídeo egocéntrico desarrollado por itspublu, diseñado para la curación de datasets en robótica y sistemas de IA física. Su función principal es evaluar ventanas de vídeo en primera persona y clasificarlas según su idoneidad para tareas de manipulación, generando tres logits de readiness (`KEEP`, `REVIEW`, `REJECT`), siete puntuaciones de problemas observables, propuestas de límites temporales y un embedding normalizado para búsqueda por similitud. No es una política de control de robots, sino una herramienta de preprocesado y filtrado de datos.

El modelo se basa en la arquitectura DINOv2-small de Facebook, con un total de 23,9 millones de parámetros, y se distribuye bajo licencia Apache-2.0. Está pensado para escanear grabaciones largas, identificar ventanas de manipulación relevantes, explicar fallos de calidad y generar manifiestos reproducibles para pipelines de etiquetado, reconstrucción de pose o aprendizaje robótico. Su relevancia actual radica en la creciente necesidad de depurar grandes volúmenes de vídeo egocéntrico antes de usarlos en entrenamiento de modelos físicos, donde la calidad de los datos es crítica.

El checkpoint espera 12 frames RGB muestreados centralmente por ventana y utiliza un procesador específico incluido en el paquete `egosieve`. La evaluación se realizó sobre el dataset EgoSieve-Eval, con datos de HoloAssist y corrupciones controladas, y los resultados se reportan en términos de F1, AUROC y average precision.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2-small (ViT-S/14) con cabezal de clasificación de vídeo |
| Parámetros totales | 23.907.724 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de vídeo: 12 frames RGB) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (procesa vídeo, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EgoSieve-S se construye sobre el modelo base `facebook/dinov2-small`, un transformer visual (ViT-S/14) preentrenado con aprendizaje autosupervisado. Sobre esta base se añade un cabezal de clasificación de vídeo que procesa 12 frames RGB muestreados centralmente por ventana. La salida incluye tres logits de readiness, siete puntuaciones de issues observables, propuestas de límites de inicio y fin, y un embedding de recuperación normalizado.

El entrenamiento se realizó mediante fine-tuning del modelo base, aunque no se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. Los datos de evaluación provienen de HoloAssist (licencia CDLA-Permissive-2.0) y de corrupciones controladas sobre el mismo dataset. Las divisiones se agrupan por unidad de captura original. Las métricas de readiness y límites se basan en 142 filas anotadas por humanos (derivadas, no directas), mientras que las de issues usan 145 filas etiquetadas, de las cuales 36 son corrupciones programáticas.

Una innovación destacable es el uso de una regla de ocupación de cuadrícula fija para derivar readiness y límites a partir de intervalos de acción fina revisados de HoloAssist. Además, el modelo produce un embedding normalizado que permite búsqueda de casi-duplicados, lo que facilita la deduplicación de datasets.

## Capacidades

- Clasificación de readiness en tres categorías: `KEEP`, `REVIEW`, `REJECT`, indicando si una ventana de vídeo es apta para manipulación.
- Detección de siete issues observables, como `low_hand_activity` o `acting_hand_not_visible`, con puntuaciones independientes.
- Propuesta de límites temporales de inicio y fin para cada ventana, aunque con carácter diagnóstico en la versión v0.1.
- Generación de embeddings normalizados para búsqueda de similitud y detección de casi-duplicados.
- Escaneo de grabaciones largas y compilación de manifiestos JSONL reproducibles mediante el paquete `egosieve`.
- Integración con el ecosistema Hugging Face Transformers, usando `AutoModelForVideoClassification` y `AutoProcessor`.
- Capacidad de enrutar ventanas inciertas a revisión humana, gracias a las puntuaciones de calibración (ECE reportado de 0.1018).

## Casos de uso

- Curación de datasets de vídeo egocéntrico para robótica: el modelo filtra automáticamente ventanas no manipulativas, reduciendo el ruido en datasets de entrenamiento de políticas robóticas. Se usa para generar manifiestos que indican qué segmentos conservar, revisar o descartar.
- Preprocesado de grabaciones de HoloAssist y similares: al clasificar ventanas de 12 frames, permite extraer solo los intervalos con actividad de manipulación relevante, ahorrando tiempo de etiquetado manual.
- Detección de problemas de calidad en vídeo: las siete puntuaciones de issues ayudan a identificar corrupciones, manos no visibles o baja actividad, lo que es útil para depurar datasets antes de entrenar modelos de visión.
- Búsqueda de casi-duplicados en grandes colecciones de vídeo: el embedding normalizado permite comparar ventanas y eliminar redundancias, optimizando el almacenamiento y la diversidad del dataset.
- Enrutamiento de datos inciertos a revisión humana: las puntuaciones de readiness y calibración permiten priorizar qué ventanas necesitan inspección manual, mejorando la eficiencia del flujo de anotación.
- Reconstrucción de pose y aprendizaje por imitación: al identificar ventanas de manipulación limpias, el modelo facilita la selección de datos para reconstrucción de pose de manos y objetos, o para entrenar políticas de imitación con datos de alta calidad.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el model-index son los siguientes:

| Métrica | Valor |
|---|---|
| Readiness macro F1 | 0.6739 |
| Issue macro AUROC | 0.7407 |
| Issue macro average precision | 0.7222 |
| Boundary micro F1 (a 0.30s) | 0.1030 |
| Readiness ECE | 0.1018 |

Estos resultados se obtuvieron sobre el dataset EgoSieve-Eval (split test), con datos de HoloAssist y corrupciones controladas. Las filas de evaluación son derivadas de anotaciones humanas, no juicios directos e independientes, por lo que deben interpretarse como evidencia proxy. No se han publicado comparaciones con otros modelos de clasificación de vídeo egocéntrico en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 23,9 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en precisión FP32, y significativamente menos con cuantización (aunque no se han publicado cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente. Incluso podría ejecutarse en CPU para lotes pequeños, aunque con mayor latencia.
- Despliegue: compatible con la librería Transformers de Hugging Face, usando `AutoModelForVideoClassification`. También se puede integrar en pipelines con vLLM o TGI si se adapta, aunque no hay soporte nativo documentado.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo y la entrada de 12 frames, se espera una latencia de decenas de milisegundos por ventana en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (clasificación de readiness en vídeo egocéntrico). Como referencia, el modelo base DINOv2-small tiene 22 millones de parámetros y se usa comúnmente para extracción de características visuales, pero no está especializado en vídeo egocéntrico ni en tareas de curación de datasets. Otras alternativas como TimeSformer o VideoMAE son más grandes y no están orientadas a esta tarea específica. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- La readiness depende del rubric publicado y del dominio de captura; puede no generalizar a otros entornos o estilos de grabación.
- El modelo solo usa RGB, por lo que no puede establecer fuerza física, éxito de la manipulación, consentimiento, seguridad, profundidad métrica ni legalidad de publicación.
- Las puntuaciones de límites son propuestas y tienen carácter diagnóstico en la versión v0.1; no deben usarse para segmentación precisa sin validación adicional.
- Las métricas de issues se basan en discriminación entre corrupciones inyectadas y referencias no modificadas, que no fueron auditadas de forma independiente como negativos naturales.
- Las filas de evaluación son derivadas de anotaciones humanas, no juicios directos; los resultados deben interpretarse con cautela.
- Los vídeos en primera persona pueden contener caras, pantallas, hogares y transeúntes; se requiere una revisión de privacidad y consentimiento antes de compartir cualquier material.
- No se han publicado cuantizaciones oficiales ni soporte para otros formatos como GGUF, lo que limita su despliegue en entornos de inferencia ligera.

## Enlaces

- Hugging Face: https://huggingface.co/itspublu/EgoSieve-S
- Repositorio GitHub: https://github.com/publu/egosieve
- Dataset de evaluación: https://huggingface.co/datasets/itspublu/EgoSieve-Eval
- Modelo base: https://huggingface.co/facebook/dinov2-small

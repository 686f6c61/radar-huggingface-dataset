# albrecht-stadtberatung/scooter-parking-classifier

## Resumen

Scooter parking classifier es un modelo de visión por computador desarrollado por albrecht-stadtberatung que clasifica si un patinete eléctrico de alquiler está aparcado de forma aceptable a partir de una única fotografía. El modelo no es un transformer entrenado de cero, sino un clasificador compuesto que congela un backbone DINOv2-base (facebook/dinov2-base) y añade dos cabezas ligeras: una cabeza de atención sobre los tokens de parche para detectar etiquetas de aparcamiento y una regresión logística que combina las salidas de esa cabeza con la puntuación de una segunda cabeza para emitir un veredicto final (`accept`, `reject` o `cant_tell`).

El modelo resuelve un problema operativo concreto: la verificación automatizada del estacionamiento de flotas de patinetes compartidos en el espacio público. En lugar de una clasificación binaria opaca, devuelve un veredicto acompañado de las etiquetas presentes con sus probabilidades, las razones que sustentan el veredicto y advertencias sobre la calidad de la foto. Esta granularidad lo hace útil tanto para la gestión de flotas como para la generación de evidencias auditables.

Con 10.834.522 parámetros totales y un repositorio de 3,1 GB (que incluye los pesos del backbone congelado), el modelo está pensado para inferencia sobre imágenes individuales, no para procesamiento masivo de vídeo. La fecha de publicación indicada es 2026-11-25 (semilla de entrenamiento 42). No se dispone de información sobre licencia, idiomas ni pipeline en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv2-base congelado + cabeza de atención sobre tokens de parche + regresión logística de veredicto |
| Parametros totales | 10.834.522 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de una imagen por inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors + config.json) |

## Arquitectura y entrenamiento

El modelo parte de facebook/dinov2-base en la revisión `f9e44c814b77203eaa57a6bdbbd535f21ede1415`, congelado durante todo el proceso. Sobre sus características se añaden dos componentes entrenables: una cabeza de atención que opera sobre los tokens de parche de DINOv2 para predecir 18 etiquetas de aparcamiento (cada una con su umbral específico), y una regresión logística que combina las salidas de esa cabeza con la puntuación de una segunda cabeza para producir el veredicto final. El umbral de obstrucción combinado es 0,6006.

El entrenamiento se realizó con semilla 42 y las cabezas se entrenaron sobre características DINOv2 calculadas en fp16 en una GPU CUDA. El conjunto de test consta de 1.197 fotos. La model card reporta una comprobación de ganancia mediante validación cruzada sobre las fotos de entrenamiento: la cabeza de puntuación por sí sola deja pasar el 29,9% de las fotos obstructivas, mientras que la combinación reduce esa cifra al 28,3%, con un 13,5% de fotos correctas rechazadas. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO (no aplicable en un clasificador de visión de este tipo).

Una innovación destacable es la separación entre etiquetas y veredicto: el modelo no solo decide si el aparcamiento es aceptable, sino que expone qué etiquetas están presentes y cuáles sustentan la decisión, lo que facilita la auditoría y la explicabilidad. Además, distingue entre rechazo por obstrucción y rechazo por contexto insuficiente o foto inválida.

## Capacidades

- Clasificación de aparcamiento de patinetes eléctricos de alquiler a partir de una foto: veredicto `accept`, `reject` o `cant_tell`.
- Detección de 18 etiquetas de aparcamiento con probabilidad individual y umbral propio por etiqueta (por ejemplo, "On grass or in a tree pit", "Blocking an entrance", "Knocked over", "On tactile paving", "In dedicated parking zone").
- Distinción de motivos de `cant_tell`: `invalid` (no hay vehículo de alquiler en la foto) e `insufficient_context` (se necesita una foto más amplia).
- Exposición de las etiquetas presentes que sustentan el veredicto (`reasons`).
- Emisión de advertencias, como la detección de foto en horizontal cuando el modelo se entrenó con fotos en vertical.
- Procesamiento por lotes de imágenes (`clf.classify([...])`).
- Inferencia en CPU, GPU CUDA y Apple MPS, con pequeñas diferencias numéricas según el dispositivo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de visión puro.

## Casos de uso

- Verificación automatizada de aparcamiento en flotas de patinetes compartidos: el operador envía la foto del usuario al clasificador y obtiene un veredicto con razones, lo que permite validar el estacionamiento sin revisión manual y reducir costes operativos.
- Auditoría de evidencias fotográficas: al devolver las etiquetas presentes con sus probabilidades, el sistema puede almacenar la justificación de cada rechazo y facilitar la revisión por parte del usuario o de un operador humano.
- Gestión de incidencias en vía pública: la detección de etiquetas como "Blocking a crosswalk", "Blocking a driveway" o "On tactile paving" permite priorizar la retirada de patinetes que obstruyen elementos críticos de accesibilidad.
- Control de calidad del propio flujo de captura: la etiqueta "Insufficient context" y la advertencia de foto en horizontal permiten rechazar fotos mal tomadas y pedir al usuario una nueva captura antes de procesar la evidencia.
- Integración en aplicaciones móviles de alquiler: el modelo puede ejecutarse en servidor con GPU CUDA para coincidir exactamente con los resultados del informe, o en CPU/MPS con desviaciones máximas de 0,011 en probabilidad y sin cambios de veredicto en el conjunto de test.
- Análisis de patrones de aparcamiento por zona: agregando las etiquetas detectadas en miles de fotos se pueden identificar puntos negros recurrentes (por ejemplo, proximidad a pasos de cebra o a aparcabicis) y ajustar la señalización o las zonas de estacionamiento designadas.
- Validación de cumplimiento normativo municipal: el veredicto y las razones asociadas pueden servir como registro documental en la gestión de concesiones o en la resolución de reclamaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un clasificador de visión específico. La model card reporta únicamente métricas internas de validación cruzada y de test:

| Metrica | Valor |
|---|---|
| Fotos obstructivas que pasan con la cabeza de puntuación sola (validación cruzada) | 29,9% |
| Fotos obstructivas que pasan con la combinación (validación cruzada) | 28,3% |
| Fotos correctas rechazadas (validación cruzada) | 13,5% |
| Tamano del conjunto de test | 1.197 fotos |
| Desviación máxima de probabilidad CPU vs CUDA en test | 0,011 |
| Cambios de veredicto CPU vs CUDA en test | 0 |
| Cambios de presencia de etiqueta CPU vs CUDA en test | 2 fotos (ambas cerca del umbral) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 3,1 GB e incluye el backbone DINOv2-base congelado. En fp16 el backbone requiere del orden de 1-2 GB de VRAM; en fp32 algo más.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM para reproducir exactamente los resultados del informe (el entrenamiento de las cabezas se hizo en fp16 sobre CUDA). Una RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero válidas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 4 GB o más de VRAM; no se especifican requisitos mínimos exactos.
- Opciones de despliegue: el autor proporciona `scooter_classifier.py` con `ScooterClassifier.from_pretrained`, que descarga solo `model.safetensors` y `config.json` y no carga código del repositorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de visión de este tipo).
- Latencia y throughput: no disponibles. La inferencia es por imagen individual o por lote; el coste dominante es el paso por el backbone DINOv2-base congelado.
- Nota importante: en CPU o Apple MPS, DINOv2 se ejecuta en fp32 y las probabilidades se desplazan ligeramente respecto a CUDA. Para resultados que deban coincidir exactamente con el informe, usar GPU CUDA.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un clasificador vertical y específico (aparcamiento de patinetes) construido sobre DINOv2-base, por lo que las alternativas serían o bien otros clasificadores de la misma tarea (no identificados) o bien el propio backbone DINOv2-base sin cabezas de tarea (no equivalente funcionalmente). Datos comparativos: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente. El modelo se entrenó con fotos en vertical; las fotos en horizontal generan una advertencia y pueden degradar el rendimiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección de etiquetas; la model card reporta un 28,3% de fotos obstructivas que pasan el filtro en validación cruzada, lo que implica un margen de error no despreciable.
- Limitaciones de contexto o idioma: no disponible información sobre idiomas; las etiquetas están en inglés. El modelo requiere una foto con contexto suficiente; si no hay vehículo de alquiler o la foto es demasiado cerrada, devuelve `cant_tell`.
- Restricciones de licencia para uso comercial: la licencia no está disponible en los metadatos de Hugging Face, por lo que no puede confirmarse si permite uso comercial. Es imprescindible verificar la licencia antes de integrarlo en producción.
- Diferencias CPU vs CUDA: las probabilidades pueden variar hasta 0,011 en CPU respecto a CUDA en el conjunto de test, sin cambios de veredicto pero con 2 cambios de presencia de etiqueta cerca del umbral. En versiones anteriores (2026-11-23) la desviación llegó a unos 0,05.
- Umbrales por etiqueta y umbral de obstrucción (0,6006) calibrados sobre un dataset concreto; pueden requerir recalibración en dominios o ciudades distintas.
- El repositorio no incluye código en el momento de la carga (`from_pretrained` solo descarga pesos y configuración), pero el script `scooter_classifier.py` debe obtenerse por otra vía; no se detalla su ubicación en la información disponible.
- Solo 12 descargas y 1 like en Hugging Face: modelo con muy poca validación comunitaria externa.

## Enlaces

- Hugging Face: https://huggingface.co/albrecht-stadtberatung/scooter-parking-classifier
- Backbone DINOv2-base (referenciado en la model card): https://huggingface.co/facebook/dinov2-base
- Revisión del backbone citada: `f9e44c814b77203eaa57a6bdbbd535f21ede1415`
- Archivo `training_log.md` mencionado en la model card: no disponible como enlace directo en la información proporcionada
- Script `scooter_classifier.py` mencionado en la model card: no disponible como enlace directo en la información proporcionada

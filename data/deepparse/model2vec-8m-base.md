# deepparse/model2vec-8m-base

## Resumen

deepparse model2vec-8m es un modelo especializado en el análisis y etiquetado de direcciones postales (address parsing), desarrollado por el equipo de deepparse. No es un modelo generativo de propósito general, sino un sistema Seq2Seq sin mecanismo de atención que mapea cada token de una dirección a una etiqueta estructural (nombre de calle, municipio, código postal, etc.). Su interés radica en que sustituye los embeddings contextuales habituales por embeddings estáticos Model2Vec derivados de `minishlab/potion-base-8M`, lo que reduce drásticamente el coste computacional manteniendo una precisión alta en la tarea.

El modelo tiene 9.466.889 parámetros totales, con un encoder y un decoder de una sola capa cada uno y dimensión oculta de 1024, sobre embeddings estáticos de 256 dimensiones. Se entrenó con el dataset `deepparse/worldwide-addresses`, que cubre 20 países con 100.000 direcciones completas y 50.000 incompletas por país, y alcanza un 97,95 % de precisión por palabra en el conjunto de test.

Es relevante ahora porque demuestra que tareas de extracción estructurada pueden resolverse con modelos de menos de 10 millones de parámetros y embeddings estáticos, abaratando el despliegue en producción frente a alternativas basadas en transformers grandes. La licencia MIT facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Seq2Seq sin mecanismo de atención (encoder y decoder de una capa, dimensión oculta 1024) sobre embeddings estáticos Model2Vec |
| Parámetros totales | 9.466.889 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado con direcciones de 20 países) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Seq2Seq sin atención: el encoder y el decoder tienen una sola capa cada uno con dimensión oculta de 1024, y la entrada se representa mediante los embeddings estáticos Model2Vec de `minishlab/potion-base-8M`, de 256 dimensiones. Al prescindir de atención y de embeddings contextuales, el coste de inferencia es muy inferior al de un transformer convencional para la misma tarea de etiquetado token a token.

El entrenamiento usó el dataset `deepparse/worldwide-addresses` (20 países, 100.000 direcciones limpias y 50.000 incompletas por país), con un reparto 90 % entrenamiento y 10 % validación. En el preprocesado, `Suburb` y `District` se mapean a `Municipality`, y se eliminan las palabras `County` y `Country`. La selección de hiperparámetros eligió la dimensión oculta (128, 256, 512 o 1024) con menor pérdida media de validación sobre 5 semillas, y después la semilla con menor pérdida de validación (semilla 42, mejor época 29). No se documenta uso de RLHF ni DPO, lo cual es coherente con una tarea supervisada de etiquetado.

## Capacidades

- Análisis y etiquetado estructural de direcciones postales token a token.
- Predicción de etiquetas como nombre de calle, municipio y código postal (con las etiquetas `Orientation` y `GeneralDelivery` presentes en la salida pero nunca predichas).
- Procesamiento de direcciones completas e incompletas.
- Cobertura de direcciones de 20 países según el dataset de entrenamiento.
- Integración mediante la librería `deepparse` (`AddressParser`).
- No dispone de generación de texto libre, razonamiento general, código, matemáticas, visión, audio, tool calling ni capacidades de agente.

## Casos de uso

- Normalización de direcciones en bases de datos: el modelo etiqueta cada token de una dirección y permite separar calle, municipio y código postal para deduplicar y estandarizar registros de clientes.
- Enriquecimiento de pedidos en comercio electrónico: al recibir una dirección en texto libre, el parser extrae los campos estructurados necesarios para el etiquetado de envíos y la validación previa al transporte.
- Geocodificación previa: los campos estructurados que produce el modelo se pasan a un geocodificador, mejorando la tasa de acierto frente a enviar la dirección en bruto.
- Validación de formularios: detección de direcciones mal formadas o incompletas antes de aceptarlas en un registro, usando las etiquetas predichas para comprobar la presencia de los componentes mínimos.
- Procesamiento por lotes a bajo coste: al tener menos de 10 millones de parámetros y embeddings estáticos, puede ejecutarse en CPU sobre grandes volúmenes de direcciones sin necesidad de GPU.
- Integración en pipelines de logística: extracción de municipio y código postal para el enrutado de paquetes y la generación de etiquetas de envío.
- Limpieza de datos para analítica: estructuración de direcciones procedentes de fuentes heterogéneas de varios países antes de cargarlas en un almacén de datos.

## Benchmarks y rendimiento

| Conjunto | Accuracy (%) |
|---|---|
| Test, este modelo | 97,95 |
| Test, media ± desviación sobre las 5 semillas de esta configuración | 97,78 ± 0,32 |
| Validación, este modelo | 98,21 |

La métrica es la precisión por palabra en el etiquetado sobre el split de test de los datos worldwide-addresses reconstruidos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 9,47 millones de parámetros, el modelo es muy pequeño y puede ejecutarse en CPU.
- GPU recomendadas: no disponible; no se requieren GPU dedicadas para un modelo de este tamaño.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: librería `deepparse` (`pip install deepparse[model2vec]`), con `AddressParser(model_type="model2vec-8m")`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. A continuación se indican alternativas de la misma categoría (parsing de direcciones) sin cifras comparativas verificadas:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| deepparse model2vec-8m | 9.466.889 | no disponible | MIT | HuggingFace |
| Otros parsers de deepparse (variantes con embeddings contextuales) | no disponible | no disponible | no disponible | HuggingFace |
| Modelos genéricos de NER aplicados a direcciones | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo nunca predice las etiquetas `Orientation` ni `GeneralDelivery`, porque los datos de origen no las contienen; la orientación de la calle (por ejemplo, `Ouest` o `NW`) queda incluida dentro de `StreetName`.
- Corea del Sur tiene casi exclusivamente direcciones incompletas en el dataset, lo que puede afectar al rendimiento en ese país.
- La cobertura geográfica se limita a los 20 países del dataset de entrenamiento; el comportamiento fuera de ese conjunto no está documentado.
- No se documentan sesgos específicos, pero al ser un modelo supervisado sobre datos de direcciones puede heredar los sesgos de representación del dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede asignar etiquetas incorrectas en direcciones con formatos atípicos o fuera de distribución.
- La licencia MIT permite uso comercial sin restricciones adicionales documentadas.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que dificulta planificar su uso con direcciones de longitud o idioma no representados en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepparse/model2vec-8m-base
- Sitio de deepparse: https://deepparse.org
- Embeddings base: https://huggingface.co/minishlab/potion-base-8M
- Dataset de entrenamiento: https://huggingface.co/datasets/deepparse/worldwide-addresses

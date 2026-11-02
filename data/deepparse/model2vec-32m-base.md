# deepparse/model2vec-32m-base

## Resumen

deepparse model2vec-32m es un modelo especializado en el análisis y etiquetado de direcciones postales (address parsing), desarrollado por el proyecto deepparse. No es un modelo generativo de propósito general, sino un sistema Seq2Seq sin mecanismo de atención que mapea secuencias de tokens de una dirección a etiquetas estructurales (nombre de calle, municipio, código postal, provincia, etc.). Su relevancia radica en que sustituye los embeddings contextuales habituales por embeddings estáticos de Model2Vec, concretamente los de minishlab/potion-base-32M de 512 dimensiones, lo que reduce drásticamente el coste computacional manteniendo una precisión alta.

La arquitectura es un encoder-decoder de una sola capa cada uno, con tamaño oculto de 1024. El modelo se entrenó sobre el dataset deepparse/worldwide-addresses, que cubre 20 países con 100.000 direcciones limpias y 50.000 incompletas por país. El resultado reportado es una precisión por palabra del 98,73 % en el conjunto de test, con una media de 98,04 ± 0,50 % sobre cinco semillas de la misma configuración.

Es relevante ahora porque demuestra que tareas de extracción estructurada muy específicas pueden resolverse con modelos pequeños (alrededor de 10,5 millones de parámetros) y embeddings estáticos, abaratando el despliegue en producción frente a alternativas basadas en transformers grandes. Su licencia MIT facilita la integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq encoder-decoder sin atención, una capa por componente, con embeddings estáticos Model2Vec |
| Parametros totales | 10.515.465 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset de entrenamiento cubre 20 países) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Seq2Seq sin mecanismo de atención, con encoder y decoder de tamaño oculto 1024 y una única capa en cada uno. La entrada se representa mediante los embeddings estáticos de minishlab/potion-base-32M (Model2Vec) de 512 dimensiones, en lugar de embeddings contextuales. La selección de hiperparámetros se hizo evaluando tamaños ocultos de 128, 256, 512 y 1024 y escogiendo el de menor pérdida media de validación sobre cinco semillas; después se seleccionó la semilla con menor pérdida de validación (semilla 46, mejor época 86).

El entrenamiento usó el dataset deepparse/worldwide-addresses, con 20 países y, por país, 100.000 direcciones limpias y 50.000 incompletas, divididas en 90 % entrenamiento y 10 % validación. En el preprocesamiento, las etiquetas `Suburb` y `District` se mapean a `Municipality`, y las palabras `County` y `Country` se eliminan. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo coherente con una tarea de etiquetado supervisado.

## Capacidades

- Etiquetado por palabra de direcciones postales: identifica componentes como nombre de calle, municipio, provincia, código postal y número.
- Procesamiento de direcciones completas e incompletas, gracias a la composición del dataset de entrenamiento.
- Cobertura multinacional: el entrenamiento abarca 20 países, aunque la lista concreta de idiomas no está disponible.
- Integración nativa con la librería deepparse mediante `AddressParser(model_type="model2vec-32m")`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Normalización de direcciones en bases de datos: el modelo etiqueta cada token de una dirección en campos estructurados, lo que permite limpiar y deduplicar registros de clientes con formatos heterogéneos.
- Validación de formularios de envío: al extraer la estructura de una dirección introducida por el usuario, se puede comprobar que contiene los campos mínimos (calle, municipio, código postal) antes de aceptarla.
- Enriquecimiento de pedidos de comercio electrónico: en pipelines de logística, el modelo convierte direcciones de texto libre en componentes separados para alimentar sistemas de ruteo o etiquetado de paquetes.
- Procesamiento de direcciones incompletas: el entrenamiento incluye 50.000 direcciones incompletas por país, por lo que el modelo es adecuado para datos reales donde faltan campos como la provincia o el código postal.
- Integración en servicios de geocodificación como paso previo: el etiquetado estructurado facilita el emparejamiento con bases de datos geográficas antes de resolver coordenadas.
- Despliegue en entornos con recursos limitados: con unos 10,5 millones de parámetros y embeddings estáticos, el modelo puede ejecutarse en CPU o en GPUs de gama baja dentro de servicios de microservicio, sin depender de infraestructura de inferencia de LLM.
- Análisis de datos de CRM: extraer la distribución geográfica de una cartera de clientes a partir de direcciones en texto libre para informes de negocio.

## Benchmarks y rendimiento

| Conjunto | Precision (%) |
|---|---|
| Test, este modelo | 98,73 |
| Test, media ± desviación sobre las 5 semillas de esta configuración | 98,04 ± 0,50 |
| Validación, este modelo | 98,94 |

La precisión se define como la exactitud de etiqueta por palabra sobre el split de test de los datos worldwide-addresses reconstruidos. No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 10,5 millones de parámetros, la huella en memoria de los pesos es del orden de decenas de megabytes en precisión completa, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere una A100 o H100. Una RTX 4090 o incluso GPUs de gama de entrada son más que suficientes.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: la vía documentada es la librería deepparse (`pip install deepparse[model2vec]`) con `AddressParser`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo Seq2Seq de etiquetado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de la misma categoría (parsers de direcciones o modelos de etiquetado Seq2Seq con embeddings estáticos), por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Precision (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse model2vec-32m | 10.515.465 | no disponible | 98,73 % (accuracy por palabra) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de origen no contienen las etiquetas `Orientation` ni `GeneralDelivery`: el modelo tiene esas salidas pero nunca las predice. La orientación de la calle (por ejemplo, `Ouest` o `NW`) queda incluida dentro de `StreetName`.
- Corea del Sur tiene casi exclusivamente direcciones incompletas en el dataset, lo que puede sesgar el comportamiento del modelo en ese país.
- No es un modelo generativo: no responde preguntas, no genera texto libre ni razona; solo etiqueta secuencias de direcciones.
- No se documentan sesgos específicos más allá de la composición del dataset; al cubrir 20 países, el rendimiento puede variar según la región y el formato de dirección.
- Riesgo de alucinación en el sentido generativo no aplica, pero sí puede producir etiquetados incorrectos en direcciones con formatos atípicos o fuera de la distribución de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones documentadas.
- La lista de idiomas soportados no está disponible, lo que dificulta evaluar su idoneidad para mercados concretos sin pruebas previas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/deepparse/model2vec-32m-base)
- [Sitio de deepparse](https://deepparse.org)
- [Dataset deepparse/worldwide-addresses](https://huggingface.co/datasets/deepparse/worldwide-addresses)
- [Embeddings minishlab/potion-base-32M](https://huggingface.co/minishlab/potion-base-32M)

# deepparse/model2vec-8m-attention

## Resumen

deepparse model2vec-8m-attention es un modelo especializado en el análisis y etiquetado de direcciones postales (address parsing), desarrollado por deepparse. Se trata de un modelo Seq2Seq con mecanismo de atención que utiliza embeddings estáticos Model2Vec derivados de minishlab/potion-base-8M, de 256 dimensiones, para transformar una dirección en texto libre en sus componentes estructurados (nombre de calle, municipio, código postal, etc.).

A diferencia de los modelos generativos de propósito general, este modelo resuelve una tarea muy concreta: el etiquetado a nivel de palabra de direcciones de 20 países. Su relevancia radica en que ofrece una alternativa ligera y determinista (1,18 millones de parámetros en total) para pipelines de normalización de direcciones, con una precisión reportada del 98,17 % sobre el split de test del conjunto de datos worldwide-addresses.

La arquitectura combina un encoder y un decoder de una sola capa cada uno con tamaño oculto de 256, sobre embeddings estáticos de 256 dimensiones. El modelo se distribuye bajo licencia MIT y está pensado para consumirse a través de la librería deepparse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Seq2Seq (encoder-decoder) con mecanismo de atención; embeddings estáticos Model2Vec |
| Parámetros totales | 1.187.849 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el dataset de entrenamiento cubre 20 países) |
| Licencia | MIT |
| Formato de pesos | safetensors (según tags del repositorio); integración vía librería deepparse |

## Arquitectura y entrenamiento

El modelo es un Seq2Seq con atención en el que tanto el encoder como el decoder tienen un tamaño oculto de 256 y una sola capa cada uno. La entrada se representa mediante embeddings estáticos Model2Vec de 256 dimensiones, derivados de minishlab/potion-base-8M, en lugar de un transformer contextual completo. Esta elección reduce drásticamente el coste computacional y el número de parámetros, manteniendo una representación densa fija por token.

El entrenamiento se realizó sobre el dataset deepparse/worldwide-addresses, que cubre 20 países con 100.000 direcciones limpias y 50.000 incompletas por país, con un reparto del 90 % para entrenamiento y 10 % para validación. En el preprocesamiento, las etiquetas `Suburb` y `District` se mapean a `Municipality`, y se eliminan las palabras `County` y `Country`. La selección de hiperparámetros consistió en elegir el tamaño oculto (128, 256, 512 o 1024) con la menor pérdida media de validación sobre 5 semillas, y posteriormente la semilla con menor pérdida de validación (semilla 42, mejor época 26). No se menciona uso de RLHF ni DPO, algo esperable en una tarea de etiquetado supervisado.

## Capacidades

- Etiquetado a nivel de palabra de direcciones postales en componentes estructurados (calle, municipio, código postal, etc.).
- Procesamiento de direcciones de 20 países distintos, incluyendo direcciones incompletas.
- Integración directa con la librería deepparse mediante `AddressParser(model_type="model2vec-8m", attention_mechanism=True)`.
- Inferencia ligera gracias al uso de embeddings estáticos de 256 dimensiones y un modelo de 1,18 millones de parámetros.
- No dispone de generación de texto libre, razonamiento general, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni de razonamiento multi-paso.
- Capacidades multilingües: no documentadas explícitamente; la cobertura viene determinada por los 20 países del dataset de entrenamiento.

## Casos de uso

- Normalización de direcciones en bases de datos: el modelo etiqueta cada token de una dirección en texto libre, lo que permite separar calle, municipio y código postal para deduplicar y enriquecer registros con un coste de inferencia muy bajo.
- Validación de formularios de checkout: integrar el parser en el backend para verificar que la dirección introducida por el usuario contiene los componentes esperados antes de confirmar un pedido.
- Geocodificación previa: usar las etiquetas generadas como entrada estructurada para un servicio de geocodificación, mejorando la tasa de acierto frente a enviar la cadena cruda.
- Procesamiento de direcciones en logística: parsear direcciones de envío de múltiples países en un pipeline batch, aprovechando que el modelo cubre 20 países y direcciones incompletas.
- Limpieza de datos en proyectos de datos abiertos: etiquetar direcciones de registros públicos para su explotación analítica sin depender de servicios externos de pago.
- Enriquecimiento de CRM: extraer componentes de direcciones almacenadas como texto libre para segmentar clientes por municipio o región.
- Despliegue en entornos con recursos limitados: al tener 1,18 millones de parámetros y embeddings estáticos, puede ejecutarse en CPU en servicios de bajo coste, algo inviable con modelos generativos grandes.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Precisión de test (este modelo) | 98,17 % |
| Precisión de test (media ± desviación sobre 5 semillas de esta configuración) | 97,99 ± 0,29 % |
| Precisión de validación (este modelo) | 98,41 % |

La precisión se define como la exactitud de etiquetado por palabra sobre el split de test de los datos worldwide-addresses reconstruidos. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 1,18 millones de parámetros, el modelo ocupa del orden de unos pocos megabytes en precisión estándar, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU consumer (por ejemplo, series RTX 30/40) o incluso CPU es suficiente.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: la vía documentada es la librería deepparse (`pip install deepparse[model2vec]`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. Como referencia interna, la model card menciona que la configuración elegida se seleccionó frente a alternativas de tamaño oculto 128, 512 y 1024, pero no se publican resultados de esas variantes ni de otros parsers de direcciones.

| Modelo | Parámetros | Contexto | Precisión de test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse model2vec-8m-attention | 1.187.849 | no disponible | 98,17 % | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El dataset de origen no contiene las etiquetas `Orientation` ni `GeneralDelivery`: el modelo tiene esas salidas pero nunca las predice. La orientación de la calle (por ejemplo, `Ouest` o `NW`) queda incluida dentro de `StreetName`.
- Corea del Sur cuenta casi exclusivamente con direcciones incompletas en el dataset, lo que puede sesgar el rendimiento en ese país.
- La cobertura geográfica está limitada a los 20 países presentes en el dataset de entrenamiento; el rendimiento fuera de ese conjunto no está documentado.
- No se documentan los idiomas soportados, por lo que la generalización lingüística más allá de los datos de entrenamiento es incierta.
- Riesgo de alucinación en el sentido generativo: no aplica, al ser un modelo de etiquetado; sin embargo, puede asignar etiquetas incorrectas en direcciones con formatos atípicos o ruido.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones de los datos de entrenamiento si se redistribuye el modelo.
- No se han publicado análisis de sesgos; al tratarse de un modelo de parseo, el riesgo principal es el sesgo geográfico derivado de la distribución del dataset.
- No se documentan requisitos de contexto ni límites de longitud de entrada; conviene validar el comportamiento con direcciones muy largas antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepparse/model2vec-8m-attention
- Dataset de entrenamiento: https://huggingface.co/datasets/deepparse/worldwide-addresses
- Embeddings base Model2Vec: https://huggingface.co/minishlab/potion-base-8M
- Documentación de deepparse: https://deepparse.org

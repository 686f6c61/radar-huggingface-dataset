# deepparse/model2vec-32m-attention

## Resumen

deepparse model2vec-32m-attention es un parser de direcciones postales desarrollado por el equipo de deepparse (proyecto de código abierto de la Universidad de Quebec en Montreal, centrado en el parseo de direcciones). El modelo resuelve una tarea de etiquetado secuencial (Seq2Seq con atención) sobre direcciones postales de 20 países, asignando a cada token una etiqueta estructural como `StreetName`, `Municipality` o `PostalCode`.

Técnicamente no es un modelo de lenguaje generativo, sino un encoder-decoder específico de dominio: utiliza embeddings estáticos Model2Vec de 512 dimensiones derivados de minishlab/potion-base-32M, con encoder y decoder de una capa y tamaño oculto de 1024. Con 16.809.993 parámetros y un repositorio de 0,1 GB, está diseñado para inferencia ligera y despliegue local sin GPU dedicada.

Su relevancia es práctica: ofrece un 98,42 % de exactitud por palabra en el split de test del dataset worldwide-addresses, con licencia MIT, lo que lo hace directamente utilizable en pipelines de normalización de direcciones en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Seq2Seq encoder-decoder con mecanismo de atención, una capa en cada componente, tamaño oculto 1024, embeddings estáticos Model2Vec (potion-base-32M, 512 dimensiones) |
| Parámetros totales | 16.809.993 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre direcciones de 20 países; el dataset no especifica códigos de idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `deepparse`, integración `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

El modelo es un Seq2Seq con atención aplicado a etiquetado de tokens de direcciones. La entrada se representa mediante embeddings estáticos Model2Vec de 512 dimensiones (derivados de minishlab/potion-base-32M), que alimentan un encoder de una sola capa con tamaño oculto 1024 y un decoder también de una capa con mecanismo de atención. No se trata de un transformer generativo con contexto largo, sino de un modelo compacto y específico para la tarea.

El entrenamiento se realizó sobre el dataset deepparse/worldwide-addresses: 20 países, con 100.000 direcciones limpias y 50.000 incompletas por país, divididas en 90 % entrenamiento y 10 % validación. En el preprocesado se mapean `Suburb` y `District` a `Municipality` y se eliminan las palabras `County` y `Country`. La selección de hiperparámetros eligió el tamaño oculto (128, 256, 512 o 1024) con menor pérdida media de validación sobre 5 semillas, y después la semilla con menor pérdida (semilla 43, mejor época 39).

## Capacidades

- Parseo de direcciones postales: asigna etiquetas estructurales por token (`StreetName`, `Municipality`, `PostalCode`, entre otras) sobre direcciones de 20 países.
- Manejo de direcciones incompletas: el dataset de entrenamiento incluye 50.000 direcciones incompletas por país, por lo que el modelo está expuesto a entradas parciales.
- Normalización de etiquetas: agrupa `Suburb` y `District` bajo `Municipality`.
- No soporta tool calling ni function calling: es un modelo de tarea única, no un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas explícitamente; la cobertura es por país, no por idioma declarado.
- Capacidades especiales: ninguna más allá del parseo de direcciones; no hay visión, audio ni modo de razonamiento.

## Casos de uso

- Normalización de direcciones en comercio electrónico: antes de validar un envío, el modelo descompone la dirección introducida por el usuario en campos estructurados (`StreetName`, `Municipality`, `PostalCode`), lo que permite comparar contra una base de direcciones canónica y detectar errores de formato.
- Enriquecimiento de bases de datos de clientes: aplicar el parser por lotes sobre registros con direcciones en texto libre para poblar columnas estructuradas y habilitar búsquedas por municipio o código postal.
- Validación en formularios web: integrado en el backend, permite verificar en tiempo de escritura que la dirección contiene los componentes mínimos y señalar los que faltan, aprovechando su exposición a direcciones incompletas durante el entrenamiento.
- Geolocalización previa a geocodificación: el parseo separa los componentes antes de enviarlos a un servicio de geocodificación, lo que reduce ambigüedades cuando el geocodificador espera campos separados.
- Limpieza de datos en proyectos de logística: procesar direcciones de 20 países con un único modelo MIT evita mantener reglas regex por país y unifica el esquema de salida.
- Investigación en extracción de información: al ser un modelo pequeño (16,8 M de parámetros) con licencia MIT, sirve como línea base reproducible para comparar técnicas de etiquetado secuencial en dominios estructurados.
- Despliegue en entornos con recursos limitados: su tamaño de 0,1 GB y su arquitectura de una capa permiten ejecución en CPU dentro de servicios contenerizados sin GPU.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Exactitud por palabra en test (este modelo) | 98,42 % |
| Exactitud por palabra en test (media ± desviación sobre 5 semillas de esta configuración) | 97,89 ± 0,58 % |
| Exactitud por palabra en validación (este modelo) | 98,65 % |

La exactitud se define como la precisión de etiqueta por palabra sobre el split de test de los datos worldwide-addresses reconstruidos. No se han publicado resultados de benchmarks en la información disponible para comparaciones con otros modelos en tareas estándar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,8 M de parámetros en safetensors y un repositorio de 0,1 GB, la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos unos pocos GB de memoria es suficiente, e incluso la ejecución en CPU es viable.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: la vía documentada es la librería `deepparse` (`pip install deepparse[model2vec]`), con `AddressParser(model_type="model2vec-32m", attention_mechanism=True)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de parseo de direcciones en la información proporcionada. Como referencia interna, el propio autor reporta la variabilidad entre semillas de esta misma configuración (97,89 ± 0,58 % en test), pero no se ofrecen resultados de alternativas como libpostal u otros parsers.

| Modelo | Parámetros | Contexto | Exactitud test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepparse model2vec-32m-attention | 16,8 M | no disponible | 98,42 % | MIT | Hugging Face (librería deepparse) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El dataset de origen no contiene las etiquetas `Orientation` ni `GeneralDelivery`: el modelo tiene esas salidas pero nunca las predice. La orientación de la calle (por ejemplo, `Ouest` o `NW`) queda incluida dentro de `StreetName`.
- Corea del Sur tiene casi exclusivamente direcciones incompletas en los datos, lo que puede sesgar el comportamiento del modelo en ese país.
- No se documentan sesgos específicos más allá de los derivados de la distribución del dataset por país.
- Riesgo de alucinación en el sentido generativo: no aplica como LLM, pero sí existe riesgo de etiquetado incorrecto en direcciones fuera de la distribución de los 20 países de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican la longitud máxima de entrada ni los idiomas cubiertos; la cobertura es por país.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las licencias de los embeddings base (minishlab/potion-base-32M) en caso de redistribución.
- Para producción: la exactitud reportada es por palabra sobre un split de test del propio dataset reconstruido; no hay garantía de que se mantenga en direcciones reales con formatos atípicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepparse/model2vec-32m-attention
- Dataset de entrenamiento: https://huggingface.co/datasets/deepparse/worldwide-addresses
- Embeddings base: https://huggingface.co/minishlab/potion-base-32M
- Sitio del proyecto deepparse: https://deepparse.org

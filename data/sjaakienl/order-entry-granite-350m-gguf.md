# SjaakieNL/order-entry-granite-350m-GGUF

## Resumen

Order entry assistant es un ajuste fino del modelo base ibm-granite/granite-4.0-350m, desarrollado por el usuario SjaakieNL y publicado unicamente en formato GGUF. El modelo esta especializado en una tarea muy concreta dentro del dominio logistico: la extraccion de informacion estructurada de documentos de pedido y envio (ordenes de compra, albaranes, confirmaciones de pedido, conocimientos de embarque y correos electronicos) para alimentar una herramienta de entrada de pedidos. Responde siempre en JSON ajustado a un esquema predefinido mediante gramatica, con temperatura 0.

El modelo cubre tres tareas fijas: `kop` (extraccion de campos de cabecera como numero de pedido, referencia de cliente, fechas de carga y entrega, incoterm, bloque de direccion y campos de transporte maritimo), `kolommen` (mapeo de encabezados de columna de la tabla de articulos a campos de linea) y `regels` (extraccion literal de lineas de articulo y cantidad a partir de pedidos redactados como texto corrido). El diseno asume que el modelo opera dentro de un pipeline con un clasificador de etiquetas previo y comprobaciones deterministas posteriores, de modo que solo se conservan las respuestas que pasan validacion.

Con 352.379.904 parametros totales y un unico archivo Q4_K_M de aproximadamente 237 MB, el modelo esta pensado para ejecutarse en el navegador mediante wllama (llama.cpp), en CPU o GPU. Su relevancia radica en demostrar un caso de uso de IA local de muy bajo coste computacional aplicado a un problema empresarial acotado, con entrenamiento exclusivamente sobre datos sinteticos en neerlandes, ingles, aleman y frances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de ibm-granite/granite-4.0-350m; detalles de atencion no disponibles) |
| Parametros totales | 352.379.904 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | nl, en, de, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-4.0-350m, un transformer decoder-only de 350M parametros, y se ajusta mediante LoRA de rango 16 durante una sola epoca sobre 1.200 ejemplos. No se documentan en la informacion disponible detalles sobre la composicion del corpus del modelo base, el numero de tokens de preentrenamiento ni si hubo fases de RLHF o DPO.

La innovacion principal del ajuste reside en el diseno del dataset y del formato de salida: los datos de entrenamiento son exclusivamente sinteticos, generados con empresas, direcciones, numeros de pedido, articulos, buques y numeros de B/L ficticios en cuatro idiomas y multiples maquetas documentales (pedidos, albaranes, confirmaciones, conocimientos de embarque y correos). Cada ejemplo incluye su respuesta correcta conocida. La salida se restringe mediante gramatica al esquema JSON de cada pregunta, lo que elimina practicamente la posibilidad de respuestas mal formadas. El autor indica que se usaron documentos reales unicamente para pruebas, nunca para entrenamiento.

## Capacidades

- Extraccion de campos de cabecera (`kop`): numero de pedido frente a referencia de cliente, fecha de carga frente a fecha de entrega, codigo incoterm, bloque de direccion bajo su encabezado y campos de transporte maritimo (buque sin viaje, numero de B/L, ETA/ETD, puertos, precinto, naviera), devolviendo `null` cuando el campo no aparece.
- Mapeo de columnas (`kolommen`): identificacion de que encabezado de la tabla de articulos corresponde a cada campo de linea (articulo, descripcion, cantidad, unidad, lote).
- Extraccion de lineas (`regels`): recuperacion literal de cada linea con articulo y cantidad en pedidos redactados como texto corrido.
- Salida en JSON conforme a esquema mediante gramatica, con temperatura 0.
- Soporte multilingue para neerlandes, ingles, aleman y frances.
- Plantilla de chat de Granite incluida en el GGUF (mensaje de sistema y mensaje de usuario con la pregunta y el documento).
- Ejecucion en navegador mediante wllama (llama.cpp) en CPU o GPU.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Entrada de pedidos en almacen: el modelo lee ordenes de compra y albaranes y devuelve los campos de cabecera en JSON validable, reduciendo la introduccion manual de datos en sistemas ERP o WMS. Es adecuado porque su entrenamiento esta centrado exactamente en esas etiquetas y en esos formatos documentales.
- Procesamiento de correos de pedido: extrae lineas de articulo y cantidad de pedidos escritos como texto corrido en un correo, copiando literalmente los valores para su posterior validacion.
- Digitalizacion de conocimientos de embarque: recupera numero de B/L, buque, puertos, ETA/ETD, precinto y naviera de documentos de transporte maritimo, campos para los que el ajuste incluye etiquetas especificas.
- Normalizacion de tablas de articulos: identifica la correspondencia entre encabezados de columna heterogeneos y los campos internos del sistema (articulo, descripcion, cantidad, unidad, lote), lo que facilita la importacion desde proveedores con formatos distintos.
- Asistente embebido en navegador: al ejecutarse con wllama en CPU o GPU del cliente, permite ofrecer la extraccion sin enviar documentos a un servidor, lo que resulta util en entornos con requisitos de privacidad o conectividad limitada.
- Preprocesado en pipelines de IA documental: actua como segundo paso tras un clasificador de etiquetas y antes de comprobaciones deterministas, cubriendo solo los campos que las reglas no resuelven, lo que aprovecha su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de exactitud de extraccion por campo; solo indica cualitativamente que, por si solo, el modelo acierta la mayoria pero no todos los campos de cabecera.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 237 MB para el archivo Q4_K_M, mas el overhead del contexto y del runtime de llama.cpp; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 1 GB de memoria libre es suficiente, incluidas GTX 1050, RTX 3050, RTX 4090 o superiores.
- Ejecucion en CPU: viable, al ser un modelo de 350M parametros cuantizado a 4 bits; es el modo previsto para wllama en el navegador.
- Opciones de despliegue: wllama (llama.cpp compilado a WebAssembly), llama.cpp y cualquier runtime compatible con GGUF y plantilla de chat de Granite.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SjaakieNL/order-entry-granite-350m-GGUF | 352M | no disponible | GGUF Q4_K_M | Apache 2.0 | Extraccion JSON de documentos logisticos |
| ibm-granite/granite-4.0-350m | 350M | no disponible | safetensors y otros | Apache 2.0 | Modelo base generalista |
| Otros ajustes de extraccion de informacion de ~350M | no disponible | no disponible | no disponible | no disponible | No disponible |

La comparativa con alternativas especializadas de la misma categoria no esta disponible en la informacion proporcionada. El unico punto de referencia documentado es el modelo base, del que este ajuste hereda arquitectura, licencia e idiomas, y al que supera en la tarea concreta de extraccion estructurada para entrada de pedidos.

## Limitaciones y advertencias

- El modelo esta entrenado para tres preguntas concretas en una forma exacta; no es un asistente general y su uso fuera de ese esquema producira resultados poco fiables.
- Por su tamano, acierta la mayoria pero no todos los campos de cabecera por si solo; la model card exige ejecutarlo tras un clasificador de etiquetas y comprobaciones deterministas, conservando solo lo que pase validacion.
- Entrenado exclusivamente con datos sinteticos; aunque se probo con documentos reales, puede fallar ante maquetas, terminologia o variantes idiomaticas no representadas en el corpus generado.
- Riesgo de alucinacion en valores extraidos: la gramatica garantiza JSON valido, no que el valor exista en el documento, de ahi la necesidad de validacion determinista posterior.
- Idiomas limitados a neerlandes, ingles, aleman y frances; no se documenta soporte para castellano.
- No se documentan sesgos especificos ni evaluaciones de robustez; al ser un ajuste sintetico de dominio acotado, el riesgo de sesgo social es bajo pero no esta medido.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso de licencia.
- El unico artefacto publicado es Q4_K_M para la version de llama.cpp de wllama 3.13; no hay pesos en safetensors ni otras cuantizaciones, lo que limita el ajuste fino o la conversion a otros formatos sin partir del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SjaakieNL/order-entry-granite-350m-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- wllama (runtime de navegador basado en llama.cpp): https://github.com/ngxson/wllama

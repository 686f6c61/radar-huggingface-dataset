# seutje/wordrop-imajev-4b-int4

## Resumen

WorDrop Imajev-4B INT4 es un paquete ONNX experimental publicado por el usuario seutje, derivado del modelo base Qwen/Qwen3.5-4B y del adaptador mohit67890/imajev-4b. No es un modelo generativo de texto: se distribuye como un unico grafo ONNX de decision de vestuario ("clothing decision") pensado para ejecutarse en CPU x86-64 de Windows, sin Python ni CUDA en el momento de la inferencia. La version del paquete es 0.1.0-embedding-vision-int4 y el repositorio ocupa 3,1 GB.

El grafo recibe una fotografia sin padding (junto con los identificadores de tokens y las caracteristicas visuales) y devuelve un tensor FP32 de logits de decision con forma [256]. Internamente, los pesos de las matrices del decoder, 98 matrices de vision y la tabla de embeddings se han cuantizado a INT4 simetrico mediante RTN con tamano de bloque 32, mientras que activaciones, readout de decision, convoluciones, normalizaciones y sesgos permanecen en FP32. El adaptador LoRA, sin fusionar, va embebido en el grafo.

Su relevancia es limitada y muy especifica: sirve como ejemplo de empaquetado reproducible de un pipeline multimodal cuantizado para despliegue en CPU, con manifiesto, fixtures dorados y fichero de paridad incluidos. El propio autor lo marca como experimental: las 14 decisiones publicas de fixture coinciden con la referencia nativa, pero las puertas estrictas de logits, probabilidad y ranking completo no pasan, y no hay verificacion de calidad de produccion, calibracion, funcionamiento en una segunda maquina ni compatibilidad con Rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX unico derivado de Qwen/Qwen3.5-4B (modelo multimodal con torre de vision); detalle arquitectonico completo no disponible |
| Parametros totales | Aproximadamente 4B (segun el nombre del paquete y el modelo base Qwen3.5-4B); cifra exacta no disponible |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 4096 tokens (limite de la peticion soportada) |
| Tipos de cuantizacion | INT4 simetrico RTN con block size 32 en pesos de matrices del decoder, 98 matrices de vision y tabla de embeddings; activaciones, readout de decision, convoluciones, normalizaciones y sesgos en FP32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (con avisos de Qwen e Imajev preservados en LICENSES/ y ATTRIBUTION.txt; fixture publico bajo CC BY 4.0) |
| Formato de pesos | ONNX (model.onnx acompanado de model.onnx.data) |
| Entradas del grafo | input_ids, attention_mask, pixel_values, image_grid_thw, mm_token_type_ids |
| Salida del grafo | decision_logits, FP32, forma [256] |
| Runtime requerido | ONNX Runtime CPU >= 1.30.0 |
| Version del paquete | 0.1.0-embedding-vision-int4 |
| Base declarada | Qwen/Qwen3.5-4B@851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Adaptador declarado | mohit67890/imajev-4b@f8d8234cebc6c99065c07731e59716dc0a6e27ab |
| Identidad de candidato | 50209a7c88903eaed0be1f6fe85635efa03b57980dbd8822dd6c983ae4c9831d |
| Tamano del repositorio | 3,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El paquete no documenta un entrenamiento propio: se construye por derivacion. Toma Qwen/Qwen3.5-4B como base, le incorpora el adaptador mohit67890/imajev-4b (que permanece sin fusionar y embebido en el grafo) y compila el conjunto en un unico grafo ONNX orientado a una tarea de decision multimodal. La rama de vision queda integrada como 98 matrices cuantizadas, y la temperatura compartida suministrada se aplica fuera del grafo, es decir, no forma parte del calculo exportado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica relevante esta en el empaquetado, no en el modelado: cuantizacion INT4 simetrica RTN por bloques de 32 aplicada de forma selectiva (solo pesos de decoder, vision y embeddings), mantenimiento de FP32 en los puntos sensibles a la precision (activaciones, convoluciones, normalizaciones, sesgos y readout de decision) y una interfaz de inferencia estricta de un solo grafo sin dependencias de Python. El paquete incluye manifiesto con tamanos y SHA-256 de cada fichero, fixtures dorados, taxonomia, calibracion, processor y tokenizer nativos, y un fichero parity.json con las comparaciones medidas.

## Capacidades

- Tarea unica: decision de vestuario. Produce un vector de logits de decision de 256 elementos a partir de una imagen y su contexto de tokens.
- Procesamiento de una unica fotografia sin padding por peticion, con limite de 4096 tokens.
- Entrada multimodal: acepta pixel_values e image_grid_thw junto con input_ids, attention_mask y mm_token_type_ids.
- Categorias de respuesta declaradas: decisiones de tipo selected/unknown verificadas en los fixtures publicos.
- Ejecucion en CPU x86-64 de Windows mediante ONNX Runtime CPU >= 1.30.0, sin Python ni CUDA.
- Reproducibilidad: manifiesto con integridad SHA-256 y recomendacion de fijar la descarga a un commit SHA en lugar de a la rama main.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es explicitamente un grafo de decision, no un modelo de generacion.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion de prendas en aplicaciones de armario digital: la app captura una foto del usuario, la pasa como pixel_values sin padding y recibe los 256 logits de decision para etiquetar o seleccionar la prenda; encaja porque el grafo esta disenado exactamente para esa entrada unimagen.
- Recomendadores de "que me pongo" en escritorio Windows: al no requerir Python ni CUDA, puede embeberse en una aplicacion nativa x86-64 que invoque ONNX Runtime directamente y resuelva la decision en local, sin enviar imagenes a un servidor.
- Etiquetado por lotes de catalogos en servidores sin GPU: un proceso de pre-etiquetado puede recorrer un catalogo de fotografias de producto en CPU y generar decisiones preliminares que despues revise un humano.
- Filtrado o triaje en marketplaces de segunda mano: clasificar automaticamente imagenes de anuncios de ropa para enrutarlas a la categoria correcta antes de la moderacion manual.
- Asistente de compra en tienda fisica: una captura movil enviada a un backend x86-64 permite obtener una decision de vestuario en el momento, util para comparar una prenda con el armario del usuario.
- Validacion de pipelines de cuantizacion: sirve como caso de estudio reproducible para equipos que quieran replicar el patron (INT4 RTN por bloques + FP32 en puntos sensibles + manifiesto con SHA-256) en sus propios modelos.
- Pruebas de integracion de ONNX Runtime en CI: los fixtures dorados y el manifiesto permiten montar un test de regresion que compruebe que el grafo carga y que las decisiones seleccionadas coinciden con la referencia.
- Despliegue en entornos con restricciones de red o de privacidad: al ser un paquete autocontenido de 3,1 GB ejecutable en CPU, puede desplegarse en maquinas aisladas sin acelerador.

En todos los casos debe tenerse en cuenta que el autor no ha verificado la calidad de produccion ni la idoneidad de la calibracion, por lo que estos usos serian, como maximo, de validacion o prototipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de exactitud general en clasificacion de ropa. La unica validacion reportada es de paridad con la referencia nativa:

| Prueba | Resultado declarado |
|---|---|
| Fixtures publicos (14) | Las 14 decisiones selected/unknown coinciden con la referencia nativa |
| Puerta estricta de logits | Falla |
| Puerta estricta de probabilidad | Falla |
| Puerta estricta de ranking completo | Falla |
| Comprobacion de integridad del paquete | Pasa en la maquina de compilacion |
| Compatibilidad de CPU | Pasa en la maquina de compilacion |
| Override experimental explicito | Registrado en parity.json |
| Latencia representativa | No establecida (las pruebas de humo no la determinan) |

## Requisitos de hardware

- VRAM: no aplica; el grafo esta disenado para CPU x86-64 y no requiere CUDA.
- GPU recomendadas: no aplica; no se declara soporte de GPU en el contrato de ejecucion.
- Cabe en hardware de consumo: si, en cualquier CPU x86-64 con espacio en disco suficiente (el repositorio ocupa 3,1 GB) y memoria RAM para cargar el grafo y los datos asociados.
- Memoria RAM estimada: no disponible con precision; el limite inferior viene dado por el peso de los ficheros (3,1 GB entre model.onnx y model.onnx.data) mas el overhead del runtime.
- Opciones de despliegue: ONNX Runtime CPU >= 1.30.0 cargando model.onnx junto a model.onnx.data. No requiere Python ni CUDA. Compatibilidad con Rust: no verificada.
- Latencia y throughput: no disponibles. El autor indica explicitamente que las comprobaciones de humo no establecen una latencia representativa.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de rendimiento de modelos comparables, y este paquete no es funcionalmente equivalente a un modelo generativo, por lo que la comparacion se limita a lo declarado:

| Elemento | WorDrop Imajev-4B INT4 | Qwen/Qwen3.5-4B | mohit67890/imajev-4b |
|---|---|---|---|
| Naturaleza | Grafo ONNX de decision de vestuario | Modelo base multimodal | Adaptador LoRA |
| Parametros | Aproximadamente 4B (INT4) | Aproximadamente 4B | No disponible |
| Contexto | 4096 tokens por peticion | No disponible | No disponible |
| Salida | decision_logits FP32 de 256 elementos | No disponible | No disponible |
| Licencia | Apache-2.0 | Apache-2.0 (preservada en LICENSES/) | Apache-2.0 (preservada en LICENSES/) |
| Formato | ONNX (model.onnx + model.onnx.data) | No disponible | No disponible |

Alternativas de la misma categoria (grafos de decision de vestuario en ONNX INT4): no disponible.

## Limitaciones y advertencias

- Paquete experimental: el propio autor lo etiqueta como tal y advierte de que la calidad de produccion esta sin verificar.
- Paridad incompleta: aunque las 14 decisiones publicas de fixture coinciden con la referencia nativa, las puertas estrictas de logits, probabilidad y ranking completo fallan, lo que sugiere divergencias numericas en la salida.
- Calibracion no validada: la idoneidad de la calibracion suministrada no esta comprobada.
- Sin verificacion en segunda maquina: el funcionamiento fuera del equipo de compilacion no esta confirmado.
- Compatibilidad con Rust no verificada.
- Alcance funcional muy estrecho: una unica fotografia sin padding por peticion, limite de 4096 tokens y salida limitada a decisiones selected/unknown; no genera texto ni mantiene conversaciones.
- Las pruebas de humo no permiten inferir exactitud general en clasificacion de ropa ni latencia representativa.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de decision erronea o de categoria unknown mal clasificada; no cuantificado.
- Limitaciones de idioma: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben preservarse los avisos de Qwen e Imajev en LICENSES/ y ATTRIBUTION.txt; el fixture publico se distribuye aparte bajo CC BY 4.0 y requiere su propia atribucion.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- Higiene de despliegue: el autor recomienda fijar la descarga a un commit SHA concreto en lugar de la rama main mutable y verificar el manifiesto SHA-256 antes de usar el paquete.

## Enlaces

- HuggingFace (paquete WorDrop Imajev-4B INT4): https://huggingface.co/seutje/wordrop-imajev-4b-int4
- Directorio del paquete dentro del repo: `packages/v0.1.0-embedding-vision-int4/`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Adaptador: https://huggingface.co/mohit67890/imajev-4b
- ONNX Runtime: https://onnxruntime.ai/
- Ficheros de referencia internos del paquete: README empaquetado, manifiesto con tamanos y SHA-256, fixtures dorados, parity.json, ATTRIBUTION.txt, LICENSES/ y LICENSES/fixture-attribution.md
- La busqueda web realizada para esta ficha no devolvio resultados tecnicos relevantes sobre el modelo; los resultados obtenidos correspondian a contenido no relacionado con el ambito de IA.

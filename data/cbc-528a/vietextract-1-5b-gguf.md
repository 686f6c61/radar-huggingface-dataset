# cbc-528a/vietextract-1.5b-gguf

## Resumen

ViExtract-EC 1.5B es un modelo de extraccion de informacion estructurada en vietnamita, publicado por el usuario cbc-528a, que se distribuye en formato GGUF para su despliegue con llama.cpp en CPU y GPU de gama baja. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-1.5B-Instruct (1.543.714.304 parametros) especializado en la tarea de "schema-guided extraction": a partir de un esquema (frame) que declara la forma de la salida y de una conversacion de entrada, el modelo devuelve un JSON con los valores extraidos de forma literal.

El modelo resuelve un problema concreto: la extraccion de datos estructurados a partir de conversaciones de comercio electronico y atencion al cliente en vietnamita, manteniendo la forma del esquema declarado (escalares, objetos o arrays de prototipos) y evitando la normalizacion o la coercion de tipos. La variante de 1.5B se posiciona como el tier para esquemas complejos (arrays y chats de grupo), donde la version de 0.5B del mismo autor pierde precision.

La relevancia actual del modelo radica en su enfoque de despliegue ligero: se publica en tres cuantizaciones GGUF (Q4_K_M, Q5_K_M y Q8_0) que ocupan entre 941 MiB y 1.53 GiB, lo que permite ejecutarlo en CPU de escritorio o en GPUs con 2-4 GB de VRAM. La ficha se publica bajo licencia Apache-2.0 y esta entrenada con una longitud maxima de 1536 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado a 1536 tokens; en la invocacion de ejemplo se usa `-c 2560` |
| Tipos de cuantizacion | GGUF Q4_K_M (941 MiB), Q5_K_M (1.05 GiB), Q8_0 (1.53 GiB); no se publica GGUF fp16 |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); el repositorio de referencia en transformers no se detalla |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-1.5B-Instruct, orientado a una tarea de extraccion guiada por esquema. El contrato de la tarea define que el frame de entrada declara la forma de la salida: `null` para escalares, `{...}` para objetos y `[{...}]` para arrays de prototipos de item. El modelo debe devolver unicamente valores literales presentes en la conversacion, con `null` para valores ausentes y `[]` para arrays ausentes, aplicando el ultimo valor acordado en caso de correcciones, y sin normalizacion ni coercion de tipos.

El entrenamiento se realizo sobre datos sinteticos, en dominio, de comercio electronico y servicios en vietnamita, con una longitud maxima de 1536 tokens. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El prompt no utiliza plantilla de chat: el modelo espera el bloque literal `### Instruction:` / `### Response:`, y el frame se renderiza con `json.dumps(frame, ensure_ascii=False, indent=2)`, con una linea por turno de conversacion y decodificacion greedy (`temperature=0.0`, `stop=["### Instruction:"]`). Se menciona un guard opcional que anula cualquier valor no encontrado en el chat (afecta a aproximadamente el 0.4% de los slots nulos).

## Capacidades

- Extraccion de informacion estructurada guiada por esquema en vietnamita, con salida JSON.
- Soporte de tres formas de esquema: escalares (`null`), objetos (`{...}`) y arrays de prototipos de item (`[{...}]`).
- Respeto del contrato de valores literales: sin normalizacion ni coercion de tipos; valores ausentes como `null` y arrays ausentes como `[]`.
- Resolucion de correcciones en conversaciones multiturno: aplica el ultimo valor acordado.
- Generacion de JSON en modo greedy, lo que favorece la reproducibilidad de la extraccion.
- Capacidad de conversacion multiturno con el formato literal de instruccion/respuesta (sin plantilla de chat).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Extraccion de pedidos en atencion al cliente: el modelo recibe un esquema con los campos del pedido (producto, cantidad, direccion, metodo de pago) y una conversacion multiturno; devuelve un JSON con los valores literales, lo que permite poblar un sistema de gestion de pedidos sin postprocesado de normalizacion.
- Procesamiento de chats de grupo: gracias al soporte de arrays de prototipos de item, puede extraer una lista de participantes o de items acordados en una conversacion grupal, escenario para el que el tier de 0.5B no es suficiente.
- Enriquecimiento de tickets de soporte: a partir de un esquema de incidencia (categoria, producto, sintomas, notas), el modelo rellena los campos del ticket en vietnamita para su clasificacion posterior.
- Despliegue en CPU de escritorio: con la cuantizacion Q4_K_M (941 MiB) y `llama-server`, se puede ejecutar en un i7 de escritorio a unos 15-25 tok/s, suficiente para extracciones de hasta 200 tokens de salida en pocos segundos.
- Extraccion en GPUs de gama baja: con `n_gpu_layers=-1` y 2-4 GB de VRAM, el modelo se descarga por completo en GPU, lo que reduce la latencia en pipelines de ingesta de conversaciones.
- Normalizacion de datos de comercio electronico: al devolver valores literales sin coercion, el JSON resultante sirve como capa de captura fiel que un sistema posterior puede validar y normalizar segun reglas de negocio.
- Integracion en pipelines de datos por lotes: el formato GGUF y la API de `llama_cpp` permiten procesar lotes de conversaciones con decodificacion determinista, lo que facilita la auditoria de extracciones.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo de referencia en fp16, evaluado sobre los mismos registros que la version de 0.5B:

| Metrica | 0.5B | 1.5B |
|---|---|---|
| Validez de forma | 99.8% | 99.6% |
| Leaf F1 estricto | 0.805 | 0.833 |
| Leaf F1 tolerante | 0.869 | 0.892 |
| Item F1 | 0.817 | 0.851 |
| Conteo exacto de items | 67.3% | 72.9% |
| Fabricacion | 0.6% | 0.4% |

Por dificultad (F1 tolerante): D1 0.944, D2 0.831, D3 0.912, D4 0.925. En CPU con Q4_K_M se estiman unos 15-25 tok/s de generacion en un i7 de escritorio, con extracciones tipicas de pocos segundos para salidas de hasta 200 tokens.

## Requisitos de hardware

- VRAM estimada: 2-4 GB para Q4_K_M (941 MiB de pesos), aproximadamente 1.05 GiB de pesos para Q5_K_M y 1.53 GiB para Q8_0, mas el espacio de contexto y de cache KV.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el autor indica que la descarga en GPU escala directamente con `n_gpu_layers=-1` si la VRAM lo permite.
- GPU de consumo: cabe en GPUs de consumo con 2-4 GB de VRAM libres; el autor no detalla modelos concretos.
- CPU: viable en CPU de escritorio (referencia: i7) a 15-25 tok/s con Q4_K_M.
- Opciones de despliegue: `llama.cpp` mediante `llama-server` y la libreria Python `llama_cpp`; el autor no menciona vLLM, TGI ni Ollama.
- Latencia y throughput: 15-25 tok/s en CPU con Q4_K_M; una extraccion tipica de hasta 200 tokens de salida se completa en pocos segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViExtract-EC 1.5B (este) | 1.543.714.304 | Entrenado a 1536 tokens | Leaf F1 tolerante 0.892; Item F1 0.851 | Apache-2.0 | GGUF en Hugging Face |
| ViExtract-EC 0.5B | 0.5B (segun nombre) | No disponible | Leaf F1 tolerante 0.869; Item F1 0.817 | No disponible | GGUF en Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | No disponible | No disponible para esta tarea | No disponible | Hugging Face |

La comparativa se limita a los modelos del mismo autor y al modelo base, ya que la informacion disponible no incluye otros modelos de extraccion de informacion en vietnamita comparables.

## Limitaciones y advertencias

- Entrenado con datos sinteticos y en dominio (comercio electronico y servicios en vietnamita); el rendimiento fuera de ese dominio no esta evaluado.
- Los arrays son la forma mas debil: solo el 72.9% de conteo exacto de items, que el autor atribuye a un limite de definicion del etiquetado y no de capacidad.
- Los campos de hora y notas concentran la mayoria de los errores de span restantes.
- Entrenado a una longitud maxima de 1536 tokens; conversaciones mas largas pueden degradar la extraccion.
- El modelo espera el bloque literal `### Instruction:` / `### Response:`; usar una plantilla de chat puede romper el formato de salida.
- Riesgo de fabricacion estimado en 0.4% de los slots; se recomienda el guard opcional que anula valores no presentes en el chat.
- No se documentan sesgos especificos en la informacion disponible.
- Licencia Apache-2.0, lo que permite uso comercial; el modelo base es Qwen2.5-1.5B-Instruct, cuyos terminos deben respetarse igualmente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card referencia un repositorio fp16 con una URL de organizacion generica (`YOUR_ORG`), lo que sugiere que la publicacion puede estar incompleta.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/cbc-528a/vietextract-1.5b-gguf
- Hugging Face (0.5B GGUF): https://huggingface.co/cbc-528a/vietextract-0.5b-gguf
- Coleccion del autor: https://huggingface.co/collections/cbc-528a/ai-powered-tools
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

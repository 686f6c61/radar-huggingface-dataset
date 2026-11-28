# someone786/daakiya-qwen3-1.7b-GGUF

## Resumen

Daakiya Qwen3-1.7B es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario someone786 en el contexto del QwenLocalHackathon. Su proposito es muy concreto: convertir mensajes desordenados de pedidos contra reembolso (cash-on-delivery) que los clientes pakistanies envian por WhatsApp, escritos en ingles, roman urdu o una mezcla de ambos, en un objeto JSON listo para la reserva de mensajeria. El modelo extrae y normaliza campos como receptor, telefono, ciudad, area, direccion, punto de referencia, articulos, importe COD y metodo de pago, ademas de listar los campos que el vendedor aun debe solicitar.

El modelo se distribuye en formato GGUF con dos cuantizaciones (Q4_K_M y Q8_0) y esta pensado para ejecutarse completamente offline en un portatil con CPU, sin GPU. Con 1.720.574.976 parametros, es un modelo pequeno orientado a una tarea de extraccion estructurada muy delimitada, no a proposito general. La relevancia actual reside en su caracter de ejemplo practico de adaptacion de un LLM pequeno a un dominio linguistico y comercial de nicho (comercio electronico informal en Pakistan) con recursos minimos: entrenamiento en una Tesla T4 gratuita de Colab durante 919 segundos.

La licencia es Apache-2.0, heredada del modelo base, y el repositorio incluye tanto los pesos cuantizados como instrucciones para su uso con Ollama y llama.cpp. El modelo no esta pensado para conversacion abierta, sino para ser invocado con un system prompt fijo que define el esquema JSON de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; el autor no la especifica) |
| Tipos de cuantizacion | Q4_K_M (recomendada, ~1,1 GB) y Q8_0 |
| Idiomas soportados | en, ur (incluye roman urdu y mezclas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B (revision `a972f4304f86a0a705d35b378d7a7675d58063a7`), un transformer decoder-only de 1.720.574.976 parametros. Sobre esa base se aplico QLoRA con cuantizacion de 4 bits del modelo base, rango r=16, alpha=32, 3 epocas, tasa de aprendizaje 0,0002 y calculo de la perdida unicamente sobre las respuestas (loss on answers only). El entrenamiento se realizo en una Tesla T4 gratuita de Google Colab en 919 segundos.

El conjunto de datos de entrenamiento consta de 720 conversaciones sinteticas (mas 60 de validacion), sin datos reales de clientes. No se menciona en la informacion disponible el numero de tokens de entrenamiento ni el uso de RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura, sino en el diseno de la tarea: un system prompt fijo que impone un esquema JSON estricto con reglas de normalizacion (telefonos a formato 03XXXXXXXXX, conversion de expresiones monetarias como "dhai hazar" o "saadhe teen hazar", inferencia de ciudad solo cuando el area es inequivoca, y rechazo explicito de areas ambiguas como DHA Phase 2 o Bahria Town). El autor recomienda usar el Modelfile del repositorio de GitHub, que fija la plantilla no-thinking y el system prompt.

## Capacidades

- Extraccion estructurada de pedidos a JSON con un esquema fijo de nueve campos.
- Comprension de ingles, roman urdu y mezclas de ambos en un mismo mensaje.
- Normalizacion de numeros de telefono desde formatos +92, 92 y 0092 al formato 03XXXXXXXXX de 11 digitos.
- Interpretacion de cantidades monetarias en expresiones coloquiales en urdu romanizado ("4.5k", "char hazar do sau", "dhai hazar", "saadhe teen hazar"), incluyendo sumas de gastos de envio y restas de anticipos.
- Inferencia de ciudad a partir de areas inequivocas (por ejemplo, G-9/2 se resuelve como Islamabad) y devolucion de null ante areas ambiguas presentes en varias ciudades.
- Deteccion y listado de campos obligatorios ausentes en el mensaje original.
- Manejo de correcciones del cliente dentro de la conversacion (se usa el valor corregido).
- Generacion de JSON valido de forma consistente (100% en los conjuntos de prueba reportados).
- No se menciona soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Digitalizacion de pedidos de comercio electronico informal: el modelo recibe el mensaje de WhatsApp de un cliente y devuelve el JSON de reserva listo para el sistema de mensajeria, eliminando la transcripcion manual. Es adecuado porque el esquema de salida esta fijado y el modelo se entreno especificamente para esta tarea.
- Normalizacion de telefonos en pipelines de CRM: convierte automaticamente numeros en formatos +92, 92 y 0092 al formato local de 11 digitos, reduciendo errores de contacto en la ultima milla.
- Deteccion de datos faltantes antes del envio: el campo `missing` permite al vendedor saber que debe preguntar al cliente (nombre, telefono, ciudad, direccion, articulos o importe) antes de generar la guia de envio.
- Calculo del importe a cobrar: el modelo suma gastos de envio y resta anticipos ya pagados (Easypaisa, JazzCash, transferencia), devolviendo el COD exacto que el repartidor debe cobrar.
- Desambiguacion de direcciones en zonas conflictivas: ante areas como DHA Phase 2 o Bahria Town, presentes en varias ciudades, el modelo devuelve null en ciudad en lugar de adivinar, lo que evita envios erroneos.
- Despliegue en portatiles de vendedores sin GPU: al ejecutarse con Ollama sobre CPU con la cuantizacion Q4_K_M (~1,1 GB), permite procesar pedidos offline en equipos modestos.
- Preprocesamiento para sistemas de logistica: el JSON resultante puede alimentar directamente APIs de mensajeria o bases de datos de pedidos, actuando como capa de extraccion previa a la reserva.

## Benchmarks y rendimiento

Resultados del autor sobre conjuntos de prueba retenidos, con decodificacion greedy, comparando el modelo base en 4 bits frente al base mas el adaptador, antes de la exportacion a GGUF:

| Conjunto de prueba | JSON valido | Listo para reserva (campos criticos exactos) | Todos los campos exactos | Precision media por campo |
|---|---|---|---|---|
| En distribucion (100) | 100,0% → 100,0% | 0,0% → 85,0% | 0,0% → 84,0% | 47,8% → 97,7% |
| Ciudades y formulaciones no vistas (80) | 100,0% → 100,0% | 0,0% → 35,0% | 0,0% → 30,0% | 42,0% → 84,5% |
| Mensajes escritos a mano (28) | 100,0% → 100,0% | 0,0% → 57,1% | 0,0% → 53,6% | 62,9% → 91,8% |

Precision por campo, base → ajustado:

| Campo | En distribucion (100) | Ciudades y formulaciones no vistas (80) | Mensajes escritos a mano (28) |
|---|---|---|---|
| customer_name | 94,0% → 100,0% | 85,0% → 91,2% | 89,3% → 96,4% |
| phone | 70,0% → 96,0% | 73,8% → 87,5% | 92,9% → 96,4% |
| city | 43,0% → 92,0% | 42,5% → 62,5% | 82,1% → 92,9% |
| area | 60,0% → 99,0% | 57,5% → 82,5% | 67,9% → 78,6% |
| address | 18,0% → 100,0% | 17,5% → 91,2% | 60,7% → 82,1% |
| landmark | 67,0% → 100,0% | 55,0% → 93,8% | 96,4% → 100,0% |
| items | 38,0% → 99,0% | 27,5% → 80,0% | 42,9% → 92,9% |
| cod_amount | 42,0% → 99,0% | 37,5% → 88,8% | 39,3% → 85,7% |
| payment | 46,0% → 100,0% | 23,8% → 88,8% | 57,1% → 96,4% |
| missing | 0,0% → 92,0% | 0,0% → 78,8% | 0,0% → 96,4% |

El propio autor advierte que los conjuntos de prueba sinteticos no constituyen un benchmark de produccion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con Q4_K_M (~1,1 GB de pesos) puede ejecutarse en CPU con memoria RAM modesta. La cuantizacion Q8_0 ocupa mas espacio (el repositorio completo son 2,9 GB, incluyendo ambos ficheros).
- GPU recomendadas: no aplica para el caso de uso previsto; el autor lo plantea para portatil con CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo, pero no es necesario.
- Cabe en GPU consumer: si, en cualquier GPU con suficiente VRAM para el fichero GGUF (1,1 GB en Q4_K_M), aunque el diseno apunta a CPU.
- Opciones de despliegue: Ollama (`ollama run hf.co/someone786/daakiya-qwen3-1.7b-GGUF:Q4_K_M`) y llama.cpp, segun los tags del repositorio. El autor recomienda usar el Modelfile del repositorio de GitHub para fijar la plantilla no-thinking y el system prompt.
- Latencia y throughput: no disponible en la informacion proporcionada. El entrenamiento en una Tesla T4 requirio 919 segundos, pero no se reportan metricas de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con el modelo base y con alternativas genericas de la misma categoria:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Daakiya Qwen3-1.7B | 1.720.574.976 | no disponible | Extraccion de pedidos COD en ingles y roman urdu | apache-2.0 | GGUF |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 | no disponible | Proposito general, multilingue | apache-2.0 | safetensors |
| Otros ajustes de Qwen3-1.7B | no disponible | no disponible | Variable | variable | variable |

No se han identificado en la informacion disponible modelos directamente comparables en la tarea especifica de extraccion de pedidos en roman urdu.

## Limitaciones y advertencias

- Entrenado con datos sinteticos (720 conversaciones): el rendimiento en mensajes reales de produccion puede ser inferior al reportado; el propio autor califica los conjuntos de prueba como no representativos de produccion.
- Caida acusada en generalizacion: la precision "listo para reserva" baja del 85,0% en distribucion al 35,0% con ciudades y formulaciones no vistas, y al 57,1% en mensajes escritos a mano.
- El campo `city` es el mas fragil ante areas ambiguas (62,5% en el conjunto de ciudades no vistas); el modelo devuelve null en esos casos por diseno, lo que exige intervencion humana.
- Riesgo de alucinacion: aunque el system prompt prohibe inventar valores, no hay garantia de que el modelo no rellene campos con datos plausibles en mensajes ambiguos.
- Dependencia estricta del system prompt: el autor indica que debe usarse sin cambios y con la plantilla no-thinking; alterarlo puede degradar la salida.
- Ambito linguistico limitado a ingles y roman urdu; no se reporta soporte de otros idiomas ni de urdu en escritura arabe mas alla de la etiqueta de idioma.
- No se menciona soporte de tool calling, agentes ni razonamiento multi-paso; no es un modelo de proposito general.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3-1.7B y la ausencia de datos reales de clientes en el entrenamiento (el autor afirma que no se usaron).
- Sin descargas ni likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/someone786/daakiya-qwen3-1.7b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo, datos y evaluacion: https://github.com/mufeezhanif/daakiya

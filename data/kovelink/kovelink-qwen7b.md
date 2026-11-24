# Kovelink/kovelink-qwen7b

## Resumen

Kovelink/kovelink-qwen7b es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct desarrollado por Kovelink, una plataforma de gestion de despachos y logistica. El modelo esta especializado en una unica tarea: convertir peticiones en lenguaje natural de un despachador en una llamada a herramienta (tool call) estructurada en JSON, formular una pregunta corta de aclaracion cuando falta un dato obligatorio, o indicar que la peticion no esta soportada. No es un asistente general, sino un componente de enrutamiento de intenciones dentro de una aplicacion concreta.

Tecnicamente es un transformer decoder-only de 7.615.616.512 parametros (aproximadamente 7,6 mil millones), derivado de la arquitectura Qwen2 y distribuido en formato safetensors con licencia Apache 2.0. El ajuste se realizo mediante LoRA con el adaptador fusionado en los pesos base en bfloat16, y la perdida se calculo exclusivamente sobre el JSON generado por el asistente. El modelo solo declara soporte para ingles.

Su relevancia practica reside en el patron de diseno: un modelo pequeno y especializado que sustituye a un LLM generalista en una tarea acotada de function calling, con un formato de salida estrictamente controlado (tres resultados posibles: `actions`, `clarify` o `unsupported`) y sin uso de datos de clientes en el entrenamiento. El autor reporta un 92% de acierto (37 de 40) en un conjunto de validacion con familias de peticiones excluidas del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion causal estandar y mecanismos de RoPE para codificacion posicional. Sobre esta base se aplico un ajuste fino mediante LoRA, con el adaptador posteriormente fusionado en los pesos base y almacenado en bfloat16, de modo que el artefacto publicado es un modelo denso convencional sin adaptadores separados en tiempo de inferencia.

El entrenamiento se centro en una tarea de mapeo de intenciones: la entrada es un mensaje de usuario en formato JSON que contiene la version del protocolo (`kovelink-intelligence-v1`), la lista de herramientas permitidas en la pantalla actual, la pantalla activa y la peticion en lenguaje natural. La salida debe ser exclusivamente JSON con uno de tres resultados. La perdida se calculo unicamente sobre el JSON del asistente, no sobre el prompt. Segun el autor, todas las peticiones de entrenamiento se generaron a partir de plantillas o reformulaciones de estas, sin uso de datos de clientes. No se documenta el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

Una innovacion destacable es la recomendacion explicita del autor de no usar decodificacion guiada (guided decoding) con el esquema JSON completo: en sus pruebas, la decodificacion guiada empujo al modelo hacia herramientas incorrectas, mientras que validar la respuesta a posteriori funciono mejor. Este es un hallazgo relevante para quien disene pipelines de function calling con modelos pequenos.

## Capacidades

- Mapeo de peticiones en lenguaje natural a una unica llamada a herramienta entre un conjunto cerrado de herramientas de la aplicacion (por ejemplo `setJobStatus`, `linkJobFlight`, `assignDriver`, `deleteJob`, `saveJob`, `sendMessage`, `assignResources`, `navigate`, `jobDetails`, `newJob`, `jobInspect`, `undoJobEdit`, `search`, `clearSearch`, `jobView`, `jobStatus`, `assistant`, `help`).
- Generacion de preguntas de aclaracion cortas y unicas cuando falta un dato obligatorio (resultado `clarify`).
- Deteccion de peticiones no soportadas (resultado `unsupported`).
- Salida estricta en JSON con todos los campos de comando escritos explicitamente y `null` en los no utilizados.
- Copia literal de nombres, numeros y texto de mensajes sin inventar valores.
- Tool calling y function calling restringido al esquema de la aplicacion Kovelink.
- Soporte de conversacion de un solo turno efectivo: la peticion se resuelve en una respuesta JSON, sin razonamiento multi-paso ni agentes autonomos.
- Capacidades multilingues limitadas al ingles.
- Sin vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de intenciones en un asistente de despacho: el modelo recibe la peticion del despachador junto con las herramientas disponibles en la pantalla actual y devuelve el comando adecuado. Es adecuado porque el espacio de acciones esta acotado y el formato de salida es determinista.
- Rellenado automatico de formularios de reserva: ante una peticion como "Book a job starting at JFK Terminal 4 going to 350 5th Ave, New York", el modelo emite un comando `jobDetails` con los campos de recogida y destino ya completados, reduciendo la entrada manual.
- Aclaracion controlada de datos faltantes: cuando la peticion no incluye un identificador necesario (por ejemplo, un numero de vuelo), el modelo devuelve una unica pregunta breve en lugar de inventar el valor, lo que evita errores en produccion.
- Gestion de estado de trabajos y asignacion de recursos: comandos como `setJobStatus`, `assignDriver` o `assignResources` se generan a partir de instrucciones en lenguaje natural, integrables en un panel operativo.
- Busqueda y navegacion dentro de la aplicacion: comandos `search`, `clearSearch`, `navigate`, `jobView` o `jobStatus` permiten a un operador moverse por la interfaz mediante texto.
- Envio de mensajes a conductores o clientes: el comando `sendMessage` copia el texto exacto indicado por el despachador, con la garantia de que el modelo no reescribe ni inventa contenido.
- Filtro de peticiones fuera de alcance: el resultado `unsupported` permite derivar a un humano o a un modelo mayor las solicitudes que no encajan en el esquema, como parte de un patron de escalado en cascada.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Conjunto |
|---|---|---|
| Acierto en validacion held-out | 37 de 40 (92%) | Familias de peticiones excluidas del entrenamiento |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada es la evaluacion interna del autor sobre un conjunto de validacion propio.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8 GB de pesos; en 4 bits, aproximadamente 4-5 GB de pesos. El autor no publica variantes cuantizadas, por lo que habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en bfloat16 sin cuantizar; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 24 GB; en 16 GB seria necesario cuantizar a 8 bits; en 8-12 GB, cuantizacion a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput: no disponibles. Al tratarse de una tarea de salida corta (un unico JSON), la latencia dominante sera el prefill del prompt, que incluye la lista de herramientas y el contexto de pantalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kovelink/kovelink-qwen7b | 7,6 B | no disponible | Tool calling para la app Kovelink, salida JSON estricta | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun la model card del modelo base) | Asistente general, tool calling generico | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (segun la model card del modelo base) | Asistente general y function calling ligero | Apache 2.0 | Hugging Face |

El modelo de Kovelink sacrifica generalidad a cambio de un formato de salida muy restringido y un esquema de herramientas fijo. Frente al Qwen2.5-7B-Instruct original, la ventaja esperada es una mayor adherencia al contrato JSON y al conjunto cerrado de comandos; la desventaja es que no sirve para ninguna otra tarea. Frente a un modelo de 1,5 B, el mayor tamano puede mejorar la precision en la seleccion de herramienta, a costa de mas VRAM.

## Limitaciones y advertencias

- El modelo conoce unicamente las herramientas y la forma JSON de una aplicacion concreta; no es un asistente general y fallara fuera de ese dominio.
- Las peticiones compuestas o condicionales no estaban en los datos de entrenamiento, por lo que puede elegir la herramienta equivocada. El autor recomienda validar cada respuesta y derivar las peticiones ambiguas a una persona o a un modelo mayor.
- No se debe usar decodificacion guiada con el esquema JSON completo: segun el autor, empuja al modelo hacia herramientas incorrectas. Es preferible validar la salida a posteriori.
- Riesgo de alucinacion en valores: aunque el prompt de sistema exige copiar literalmente nombres, numeros y textos, no hay garantia formal de que no se introduzcan valores inventados; la validacion posterior es obligatoria.
- Solo soporta ingles; las peticiones en otros idiomas no estan cubiertas.
- Longitud de contexto no documentada; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero el fine-tune no declara haber sido entrenado ni evaluado con contextos largos.
- Sesgos: no se documentan evaluaciones de sesgo. Al derivar de Qwen2.5, puede heredar sesgos del modelo base, aunque la tarea acotada reduce su manifestacion.
- Licencia Apache 2.0 permite uso comercial, pero se mantienen las condiciones del modelo base de Alibaba Cloud; conviene revisar la licencia de Qwen2.5-7B-Instruct.
- El modelo tiene muy poca traccion (5 descargas, 1 like en el momento de la consulta) y una unica evaluacion interna de 40 ejemplos; la evidencia empirica es limitada.
- No hay variantes cuantizadas oficiales ni artefactos GGUF publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kovelink/kovelink-qwen7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Sitio del autor: https://kovelink.ai

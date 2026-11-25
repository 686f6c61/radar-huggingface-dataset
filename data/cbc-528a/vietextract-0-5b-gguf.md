# cbc-528a/vietextract-0.5b-gguf

## Resumen

ViExtract-EC 0.5B — GGUF es la distribucion cuantizada en formato GGUF de un modelo de extraccion de informacion estructurada para vietnamita, afinado a partir de Qwen/Qwen2.5-0.5B-Instruct. Lo publica el usuario cbc-528a bajo licencia Apache-2.0 y esta disenado para ejecutarse en CPU o en maquinas con muy poca VRAM mediante llama.cpp. Su proposito concreto es rellenar esquemas JSON a partir de conversaciones de comercio electronico y atencion al cliente en vietnamita, respetando la forma declarada del esquema y devolviendo `null` cuando el dato no aparece.

El modelo es deliberadamente pequeno: 494.032.768 parametros totales, lo que permite inferencia en portatiles sin GPU. No es un modelo conversacional general, sino una herramienta de extraccion guiada por esquema (*schema-guided information extraction*) entrenada con un contrato estricto: los valores devueltos deben ser subcadenas literales del texto de entrada, sin normalizacion ni coercion de tipos. Esa restriccion es su principal valor tecnico, porque reduce la fabricacion de datos a un 0,6% medido sobre 1.054 conversaciones.

La relevancia actual reside en la combinacion de tamano minimo, licencia permisiva y un formato de prompt literal (`### Instruction:` / `### Response:`) que evita la sobrecarga de plantillas de chat. El repositorio GGUF ocupa 6,0 GB e incluye tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0); no se publica GGUF en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado a ≤1536 tokens; en los ejemplos de despliegue se usa `-c 2560` |
| Tipos de cuantizacion | Q4_K_M (379 MiB), Q5_K_M (401 MiB), Q8_0 (506 MiB); sin fp16 GGUF |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos de referencia en safetensors en el repo transformers del modelo base afinado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parametros, sobre el que se ha realizado un ajuste supervisado orientado a una unica tarea: rellenar un esquema JSON a partir de una conversacion. El prompt no emplea plantilla de chat; el modelo fue entrenado con un bloque literal `### Instruction:` seguido de `### Response:`, y el autor advierte explicitamente que aplicar tokens `<|im_start|>` degrada la salida de forma severa.

El contrato de extraccion define el comportamiento: el esquema declara la forma mediante `null` para escalares, `{...}` para objetos y `[{...}]` para arrays de elementos; los valores deben ser subcadenas literales del chat; los campos ausentes se devuelven como `null` y los arrays ausentes como `[]`. No hay normalizacion, coercion de tipos ni resolucion de fechas. El autor menciona una red de seguridad opcional consistente en anular cualquier valor devuelto que no sea subcadena del chat, que se activa en aproximadamente el 0,6% de los slots nulos evaluados. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card indica que los datos son sinteticos y de dominio (comercio electronico y servicios en vietnamita).

## Capacidades

- Extraccion de informacion guiada por esquema JSON a partir de texto conversacional en vietnamita.
- Respeto de la forma del esquema: escalares, objetos anidados y arrays de objetos.
- Devolucion de `null` o `[]` ante datos ausentes, sin inventar valores (fabricacion medida del 0,6%).
- Extraccion verbatim: los valores son subcadenas literales, sin normalizacion ni conversion de tipos.
- Generacion de texto condicionada por prompt literal `### Instruction:` / `### Response:`.
- Ejecucion en CPU y en GPU de baja VRAM mediante llama.cpp (CLI, servidor y `llama-cpp-python`).
- No dispone de tool calling ni function calling nativo, ni de modo thinking, vision o audio.
- Capacidad multilingue limitada al vietnamita; no se documenta soporte de otros idiomas.
- No soporta conversacion multi-turno general ni agentes multi-paso: es una herramienta de extraccion de un solo paso.

## Casos de uso

- Extraccion de pedidos en chats de comercio electronico: a partir de una conversacion cliente-tienda, el modelo rellena un esquema con nombre del cliente, articulos, cantidades y precios. Es adecuado porque el contrato exige valores literales del chat y el tamano permite ejecutarlo en el servidor de la tienda sin GPU.
- Normalizacion de conversaciones de atencion al cliente hacia un CRM: se define un esquema con campos de contacto, direccion e incidencias y el modelo devuelve JSON valido en el 99,8% de los casos segun la evaluacion del autor, lo que simplifica la integracion posterior.
- Procesamiento por lotes en CPU: con Q4_K_M y sin GPU, el autor reporta mas de 200 tok/s de prompt y 40-50 tok/s de generacion en un i7-6700, de modo que una extraccion tipica tarda entre 2 y 5 segundos; esto permite procesar volumenes moderados en infraestructura barata.
- Despliegue en el borde o en portatiles: los ficheros de 379-506 MiB caben en cualquier equipo, lo que habilita extraccion local de datos sensibles sin enviar conversaciones a la nube.
- Servicio HTTP interno: con `llama-server -c 2560 -n 512 --temp 0` se expone un endpoint compatible con clientes HTTP para integrarlo en un pipeline de ingestion de mensajes.
- Prototipado rapido de esquemas: al ser guiado por esquema, permite iterar sobre la forma del JSON de salida sin reentrenar, validando el diseno del contrato antes de invertir en un modelo mayor.
- Filtrado y validacion de datos: la red de seguridad de subcadena permite descartar o anular valores fabricados en un 0,6% de los slots nulos, util para construir datasets limpios a partir de conversaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el modelo de referencia en fp16 (el GGUF es una recodificacion de los mismos pesos):

| Metrica | Valor |
|---|---|
| Validez de esquema/forma | 99,8% |
| Leaf F1 estricto / tolerante | 0,805 / 0,869 |
| Item F1 (arrays) | 0,817 |
| Conteo exacto de items | 67,3% |
| Fabricacion (valor no presente en el chat) | 0,6% |

Rendimiento por dificultad (F1 tolerante): D1 0,923 · D2 0,812 · D3 0,882 · D4 0,920.

Throughput de referencia en un i7-6700 con Q4_K_M y sin GPU: mas de 200 tok/s de prompt y 40-50 tok/s de generacion, con una extraccion tipica en 2-5 segundos.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo esta pensado para CPU. En GPU, Q4_K_M ocupa 379 MiB de pesos y Q8_0 506 MiB, mas el espacio de contexto.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM puede alojar los pesos; no se requieren A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (RTX 3050, RTX 4060, RTX 4090, etc.), aunque su uso natural es CPU.
- Opciones de despliegue: `llama-cli`, `llama-server` (endpoint HTTP), `llama-cpp-python`; el autor no menciona vLLM, TGI ni Ollama.
- Contexto de despliegue: los ejemplos usan `-c 2560` y `-n 512`, aunque el entrenamiento fue a ≤1536 tokens.
- Latencia y throughput: en el i7-6700 de referencia, 2-5 segundos por extraccion tipica con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| ViExtract-EC 0.5B GGUF | 494 M | entrenado a ≤1536 | Extraccion guiada por esquema en vietnamita | Apache-2.0 | GGUF |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens (segun modelo base) | Chat general multilingue | Apache-2.0 | safetensors, GGUF |
| Modelos de extraccion genericos de 0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas especializadas en extraccion para vietnamita no esta disponible en la informacion proporcionada. Frente a su modelo base, ViExtract-EC sacrifica capacidad conversacional general y cobertura multilingue a cambio de adherencia estricta al esquema y extraccion verbatim en vietnamita.

## Limitaciones y advertencias

- Entrenado con datos sinteticos y de dominio (comercio electronico y servicios en vietnamita); la generalizacion a otros dominios no esta documentada.
- Punto mas debil: conteo de items en arrays (67,3% de conteo exacto), expresiones temporales y notas de texto libre.
- Ventana de entrenamiento de ≤1536 tokens; las conversaciones largas deben trocearse.
- No usar plantilla de chat: aplicar `<|im_start|>` degrada la salida de forma severa; el prompt debe ser literal `### Instruction:` / `### Response:`.
- Riesgo de alucinacion bajo pero no nulo: 0,6% de fabricacion; se recomienda la red de seguridad de validacion por subcadena.
- Solo vietnamita; no se documenta soporte de castellano ni de otros idiomas.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del modelo base Qwen2.5-0.5B-Instruct; conviene revisar los terminos del modelo base.
- El repositorio GGUF no incluye fp16; para precision de referencia hay que acudir al repo transformers del modelo afinado.
- El enlace al repo transformers de la model card aparece como marcador de posicion (`YOUR_ORG`), por lo que su ubicacion exacta no esta confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbc-528a/vietextract-0.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repo transformers del modelo afinado: no disponible (la model card usa el marcador `YOUR_ORG/vietextract-0.5b`)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python

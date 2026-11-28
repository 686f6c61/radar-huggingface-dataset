# cbc-528a/vietextract-0.5b-gguf

## Resumen

ViExtract-EC 0.5B es un modelo especializado en extracción de información estructurada a partir de conversaciones en vietnamita. Lo desarrolla el usuario cbc-528a y se distribuye como un fine-tuning de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros. La versión publicada en este repositorio es una conversión a formato GGUF pensada para ejecución en CPU y máquinas con poca VRAM mediante `llama.cpp`.

El modelo resuelve un problema muy concreto: dada una conversación y un esquema JSON con campos a rellenar, devuelve ese mismo esquema con los valores extraídos literalmente del texto. No normaliza, no convierte tipos y no resuelve fechas; simplemente copia subcadenas del chat o deja `null` cuando el dato no aparece. Está entrenado sobre el formato literal `### Instruction:` / `### Response:` y no debe usarse con plantillas de chat tipo `<|im_start|>`.

Su relevancia práctica está en el tamaño: con cuantizaciones de entre 379 y 506 MiB, se puede desplegar en portátiles y servidores modestos sin GPU, con un rendimiento declarado de 40-50 tokens por segundo en generación sobre un i7-6700. Está orientado a dominios de comercio electrónico y atención al cliente en vietnamita, con datos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado a ≤1536 tokens; el ejemplo de servidor usa `-c 2560` |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (no se publica fp16 GGUF) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base de referencia está en transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. Sobre esa base se ha aplicado un fine-tuning orientado a una tarea de extracción guiada por esquema: el prompt incluye una instrucción fija en vietnamita, un esquema JSON que declara la forma de la salida (`null` para escalares, `{...}` para objetos, `[{...}]` para arrays de ítems) y el fragmento de conversación. La respuesta esperada es el mismo esquema con los valores rellenados.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica que los datos son sintéticos y de dominio concreto (comercio electrónico y servicio al cliente en vietnamita). La evaluación reportada corresponde al modelo de referencia en fp16, y el GGUF se describe como una recodificación de los mismos pesos. El contrato de salida es estricto: valores literales subcadena del chat, `null` si el campo está ausente y `[]` si falta un array.

## Capacidades

- Extracción de información guiada por esquema JSON a partir de conversaciones en vietnamita.
- Relleno de estructuras anidadas: objetos, arrays de ítems y escalares declarados con `null`.
- Copia literal de valores (nombres, cantidades, precios, direcciones) sin normalización ni coerción de tipos.
- Gestión de campos ausentes mediante `null` y de arrays ausentes mediante `[]`.
- Generación de texto orientada a una única tarea; no está pensado como asistente general.
- Ejecución en CPU mediante `llama.cpp` (CLI, servidor HTTP y `llama-cpp-python`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Extracción de pedidos en chats de comercio electrónico: el modelo recibe la conversación y un esquema con cliente, ítems, cantidades y precios, y devuelve el JSON relleno con subcadenas literales del chat, lo que encaja con el ejemplo incluido en la model card.
- Automatización de atención al cliente en vietnamita: integrado tras un sistema de mensajería, convierte conversaciones multi-turno en registros estructurados para CRM sin necesidad de GPU.
- Procesamiento por lotes en servidores modestos: con Q4_K_M y `llama-server` en CPU, permite procesar colas de conversaciones con una latencia típica de 2-5 segundos por extracción según el autor.
- Preprocesado para pipelines de datos: generar registros estructurados a partir de transcripciones de chat antes de cargarlos en una base de datos o en un sistema de analítica.
- Validación con red de seguridad: el propio autor propone descartar cualquier valor devuelto que no sea subcadena del chat, lo que permite usarlo en producción con una comprobación posterior barata.
- Despliegue en entornos con hardware limitado: portátiles y mini-PC sin GPU pueden ejecutar el modelo en Q4_K_M (379 MiB) para tareas de extracción puntuales.
- Prototipado de esquemas: probar distintos esquemas JSON sobre conversaciones reales antes de invertir en un modelo mayor o en anotación manual.

## Benchmarks y rendimiento

Datos de evaluación reportados por el autor sobre el modelo de referencia en fp16 (1.054 conversaciones evaluadas):

| Metrica | Valor |
|---|---|
| Validez de esquema/forma | 99,5% |
| Leaf F1 estricto / tolerante | 0,815 / 0,880 |
| Item F1 (arrays) | 0,828 |
| Recuento exacto de ítems | 69,9% |
| Fabricación (valor no presente en el chat) | 0,4% |

Por dificultad (F1 tolerante): D1 0,933 · D2 0,829 · D3 0,890 · D4 0,931.

Rendimiento en el equipo de referencia (i7-6700, Q4_K_M, sin GPU): aproximadamente 200+ tok/s en prompt y 40-50 tok/s en generación, con una extracción típica en 2-5 segundos. No se han publicado comparaciones con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU el consumo de RAM ronda los 379 MiB (Q4_K_M), 401 MiB (Q5_K_M) y 506 MiB (Q8_0) para los pesos, más el contexto.
- GPU recomendadas: no se especifican; cualquier GPU con suficiente memoria puede usarse con `n_gpu_layers`, pero el modelo está diseñado para CPU.
- Cabe en cualquier GPU consumer, incluida una RTX 4090, e incluso en iGPU y sistemas sin GPU dedicada.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), `llama-cpp-python` y cualquier runtime compatible con GGUF.
- Latencia y throughput: 40-50 tok/s de generación y 200+ tok/s de prompt en un i7-6700 con Q4_K_M; extracción completa en 2-5 segundos.
- Contexto de ejecución: el ejemplo de servidor usa `-c 2560` y `-n 512`, aunque el entrenamiento se hizo a ≤1536 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViExtract-EC 0.5B (este) | 494 M | ≤1536 en entrenamiento | Extracción guiada por esquema en vietnamita, GGUF para CPU | Apache-2.0 | Hugging Face (GGUF) |
| Qwen2.5-0.5B-Instruct (base) | 494 M | 32.768 tokens (modelo base) | Asistente general multilingüe | Apache-2.0 | Hugging Face |
| Alternativas especializadas en extracción en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con el modelo base es la más directa: ViExtract-EC hereda su tamaño y licencia, pero sustituye el comportamiento de asistente general por una tarea única de extracción con contrato estricto y un formato de prompt propio. No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con datos sintéticos y de dominio restringido (comercio electrónico y servicio al cliente en vietnamita); el rendimiento fuera de ese dominio no está garantizado.
- Puntos débiles declarados: recuento de ítems en arrays (69,9% de recuento exacto), expresiones temporales y notas de texto libre.
- Ventana de entrenamiento de ≤1536 tokens; las conversaciones largas deben trocearse.
- Riesgo de fabricación bajo pero no nulo (0,4% de valores no presentes en el chat); se recomienda la comprobación de subcadena propuesta por el autor.
- No debe aplicarse plantilla de chat `<|im_start|>`: el modelo espera el bloque literal `### Instruction:` / `### Response:` y el rendimiento se degrada gravemente con otra plantilla.
- Sin normalización ni coerción de tipos: no resuelve fechas, no convierte unidades y devuelve los valores tal cual aparecen.
- Licencia Apache-2.0, que permite uso comercial; el modelo base Qwen2.5-0.5B-Instruct también es Apache-2.0.
- No se documentan sesgos específicos más allá de los derivados de los datos sintéticos y del dominio; no hay información sobre evaluación de sesgos.
- El repositorio tiene 7,4 GB pese a que los GGUF publicados suman menos de 1,3 GB, lo que puede indicar artefactos adicionales no descritos en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbc-528a/vietextract-0.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de referencia del modelo fp16: no disponible (la model card apunta a un enlace genérico `YOUR_ORG/vietextract-0.5b` sin publicar)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python

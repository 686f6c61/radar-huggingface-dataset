# cbc-528a/vietextract-1.5b

## Resumen

ViExtract-EC 1.5B es un modelo de extraccion de informacion en vietnamita desarrollado por el usuario cbc-528a. Se trata de un fine-tune mediante LoRA sobre Qwen/Qwen2.5-1.5B-Instruct, especializado en una tarea muy concreta: rellenar un marco JSON proporcionado por el llamante (schema-guided extraction) a partir de un registro de chat en bruto. El modelo no conversa ni responde preguntas; su unica funcion es devolver un JSON con la misma forma que el marco de entrada, con valores copiados literalmente del texto del chat.

La propuesta de valor es el contrato estricto: los valores son subcadenas literales del chat, sin normalizacion ni coercion de tipos, la informacion ausente se representa como `null` (o `[]` en arrays) y, cuando un dato se corrige a lo largo de la conversacion, prevalece el ultimo valor acordado. Esto lo hace adecuado para pipelines de extraccion estructurada en dominios transaccionales vietnamitas (comercio electronico, hosteleria, reparaciones, alquiler, eventos, etc.).

Con 1.543.714.304 parametros, el modelo se presenta como la variante de mayor capacidad de un hermano de 0.5B con el mismo contrato y prompt. La mejora se concentra en arrays y chats adversarios: +0.030 de F1 tolerante y +0.034 de F1 de items, con una tasa de conteo exacto de items del 72,9 % frente al 67,3 % del 0.5B. La licencia es Apache-2.0 tanto para el modelo base como para el fine-tune y los datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune LoRA sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado a 1536 tokens (p95 de 953 en datos de entrenamiento) |
| Tipos de cuantizacion | no disponible (la model card solo menciona fp32 y fp16) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only, y se adapta mediante LoRA con rango 16 en precision fp16, contexto de 1536 tokens y una epoca sobre 8.920 muestras. El entrenamiento completo tardo 7,3 horas (23,6 s por paso) en una GTX 1070 con un pico de 6,31 GiB de VRAM. La innovacion tecnica no esta en la arquitectura sino en el pipeline de datos: generacion sintetica guiada por fichas de hechos (fact-sheet-first), en la que primero se planifican los hechos, despues se escribe el chat que los expresa y omite el resto, se inyectan cuatro capas de ruido, se extraen las etiquetas del texto ruidoso y se reancla cada hoja del JSON a un span literal del chat.

El corpus consta de 15.319 conversaciones sinteticas en vietnamita repartidas en nueve dominios transaccionales: hosteleria y reparto, belleza y spa, comercio electronico, reparacion del hogar, alquiler, reclutamiento a tiempo parcial, reparacion de motos y vehiculos electricos, limpieza, lavanderia y mudanzas, y eventos. La mezcla de dificultad es 25/25/25/25 (D1 facil, D2 anidado, D3 arrays, D4 adversario), con un 71 % de conversaciones comprador-vendedor, un 16 % comprador-comprador y un 13 % de chats de grupo con el agente dentro del grupo de compra. No se menciona RLHF ni DPO; el entrenamiento es supervisado sobre pares prompt-respuesta.

## Capacidades

- Extraccion de informacion estructurada guiada por esquema: rellena un marco JSON arbitrario (objetos anidados y arrays de objetos) con valores literales del chat.
- Respeto estricto del contrato de tipos: `null` para escalares ausentes, `[]` para arrays vacios, sin normalizacion de numeros, fechas ni divisas.
- Manejo de correcciones a lo largo de la conversacion: prevalece el ultimo valor acordado.
- Arrays sin duplicados y en orden de aparicion en el chat, un elemento por item distinto.
- Robustez ante ruido y chats adversarios (capa D4 del conjunto de evaluacion).
- Procesamiento de conversaciones multi-turno con un turno por linea.
- Generacion unicamente con decodificacion greedy; no se recomienda muestreo.
- No soporta tool calling ni function calling de forma nativa.
- No es un modelo conversacional: no mantiene dialogos ni responde preguntas abiertas.
- Capacidades multilingues limitadas al vietnamita.

## Casos de uso

- Extraccion de pedidos en comercio electronico: a partir de un chat comprador-vendedor se rellena un marco con cliente, lineas de pedido (nombre, cantidad, precio) y notas. El modelo copia literalmente los valores, lo que evita errores de normalizacion en precios y tallas.
- Procesamiento de reservas en hosteleria y reparto: extraccion de platos, cantidades, direccion y telefono desde conversaciones de pedido, con el ultimo valor acordado cuando el cliente modifica el pedido.
- Gestion de citas en belleza y spa: rellenado de un marco con nombre, servicio, fecha y hora a partir de chats de reserva, manteniendo la fecha y hora tal como se escribieron.
- Ticket de reparacion del hogar o de motos: extraccion de averia, repuesto, cantidad y presupuesto desde conversaciones tecnicas con ruido, donde el modelo tolera spans limites imprecisos.
- Reclutamiento a tiempo parcial: extraccion de nombre, puesto, disponibilidad y tarifa desde chats de candidatos, con soporte para conversaciones de grupo.
- Alquiler de inmuebles: extraccion de direccion, precio, duracion y condiciones desde hilos de mensajeria, con chunking en fronteras de turno para conversaciones largas.
- Limpieza, lavanderia y mudanzas: extraccion de direccion, tipo de servicio, fecha y numero de habitaciones desde chats con informacion dispersa.
- Eventos: extraccion de tipo de evento, fecha, numero de asistentes y presupuesto desde conversaciones de planificacion.

## Benchmarks y rendimiento

Evaluacion sobre 1.054 conversaciones reservadas, decodificacion greedy, sin JSON guiado, con los mismos registros que el hermano de 0.5B.

| Metrica | 0.5B | 1.5B |
|---|---|---|
| Validez JSON | 99,9 % | 99,9 % |
| Validez de forma | 99,8 % | 99,6 % |
| Leaf F1 estricto | 0,805 | 0,833 |
| Leaf F1 tolerante a fronteras | 0,869 | 0,892 |
| Precision / recall (tolerante) | 0,857 / 0,881 | 0,883 / 0,902 |
| Item F1 (arrays) | 0,817 | 0,851 |
| Conteo exacto de items | 67,3 % | 72,9 % |
| Fabricacion (valor no presente en el chat) | 0,6 % | 0,4 % |
| Latencia (GTX 1070, fp32) | 2,2 s | 4,4 s |

Por dificultad (Leaf F1 tolerante a fronteras):

| | D1 facil | D2 anidado | D3 arrays | D4 adversario |
|---|---|---|---|---|
| 0.5B | 0,923 | 0,812 | 0,882 | 0,920 |
| 1.5B | 0,944 | 0,831 | 0,912 | 0,925 |

Por dominio (Leaf F1 estricto): reparacion 0,863; comercio electronico 0,864; hosteleria 0,848; belleza 0,841; eventos 0,841; limpieza 0,814; alquiler 0,809; reclutamiento 0,804; motos 0,803.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,2 GiB en fp32 y 3,1 GiB en fp16.
- GPU recomendadas: Turing, Ampere o Hopper (RTX 20/30/40, A100, H100) en fp16; en Pascal (GTX 10-series) fp16 se ejecuta a 1/64 de velocidad, por lo que fp32 es unas 3 veces mas rapido.
- Cabe en GPU de consumo: si, con 3,1 GiB en fp16 en cualquier GPU moderna con al menos 4 GiB, o 6,2 GiB en fp32 en GPUs Pascal.
- Opciones de despliegue: transformers con `attn_implementation="sdpa"` y `device_map`; compatible con text-generation-inference y endpoints compatibles segun los tags del repositorio. No se mencionan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia: 4,4 s por extraccion en una GTX 1070 en fp32 (2,2 s para el 0.5B). No se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Leaf F1 tolerante | Item F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ViExtract-EC 1.5B | 1,54 B | 1536 | 0,892 | 0,851 | Apache-2.0 | Hugging Face |
| ViExtract-EC 0.5B | no disponible | 1536 | 0,869 | 0,817 | Apache-2.0 | Hugging Face (hermano) |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | no disponible en la informacion | no disponible | no disponible | Apache-2.0 | Hugging Face |

El hermano de 0.5B sigue siendo preferible para marcos simples de alto volumen, ya que la mejora del 1.5B se concentra en arrays y conversaciones adversarias. No se dispone de datos de benchmarks de otros modelos de extraccion en vietnamita en la informacion proporcionada.

## Limitaciones y advertencias

- Datos sinteticos y de dominio cerrado: no hay garantia fuera de los nueve dominios entrenados ni en contextos medico, legal o financiero. La evaluacion en datos reales esta pendiente.
- Los arrays son la forma mas debil: el conteo exacto de items es del 72,9 %, de modo que aproximadamente uno de cada cuatro pedidos tiene un numero incorrecto de lineas. El autor lo atribuye a una definicion de etiquetado, no a falta de capacidad.
- Los campos de hora y notas concentran la mayoria de los errores de span restantes.
- Contexto limitado a 1536 tokens (p95 de 953): los hilos mas largos deben trocearse en fronteras de turno, uniendo los items y tomando la ultima mencion para campos mutables.
- Sin normalizacion por diseno: numeros, fechas y divisas se devuelven tal como se escribieron.
- No es un modelo conversacional; usarlo con plantilla de chat o muestreo degrada el resultado.
- Riesgo de fabricacion bajo pero no nulo (0,4 % de valores no presentes en el chat).
- En GPUs Pascal, fp16 es muy lento; debe usarse fp32.
- Licencia Apache-2.0 para base, fine-tune y datos sinteticos, sin restricciones adicionales conocidas para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbc-528a/vietextract-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

# Slava21012/Qwen3-4B-Instruct-Uncensored

## Resumen

Qwen3-4B-Instruct-Uncensored es una variante "abliterada" del modelo Qwen3-4B-Instruct-2507 desarrollado por el equipo Qwen de Alibaba. La publica el usuario Slava21012 (la model card referencia el identificador n0ctyx) y su objetivo es eliminar el comportamiento de rechazo (refusals) del modelo original sin reentrenarlo, aplicando una tecnica de abliteracion direccional sobre los pesos. El modelo base es un transformer denso de 4.022 millones de parametros (3.600 millones no correspondientes a embeddings) con 36 capas y una ventana de contexto de 262.144 tokens.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de intervencion en el espacio de activaciones (abliteracion) que modifica directamente los pesos mediante ortogonalizacion, sin fine-tuning; por otro, ofrece un caso concreto de modelo pequeno (4B) con contexto muy largo y sin modo de razonamiento explicito, pensado para generacion de texto, escritura creativa sin restricciones y tareas de red-teaming. El autor reporta una divergencia KL de 0,0785 respecto al modelo original y una reduccion de rechazos de 100/100 a 19/100 en su conjunto de evaluacion.

El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamano de repositorio de 8,1 GB. No se han publicado datos sobre idiomas soportados ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con GQA (32 cabezas Q, 8 cabezas KV), 36 capas |
| Parametros totales | 4.022.468.096 (4,0B; 3,6B no-embedding) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el autor menciona GGUF "si esta disponible", pero no se confirma su publicacion) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); GGUF no confirmado |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Modo de razonamiento | No-thinking (no genera bloques `<think>`) |
| Tamano del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507: un transformer denso con 36 capas y atencion con query grouping (GQA) de 32 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria del KV cache en contextos largos. El modelo base fue entrenado por el equipo Qwen de Alibaba; esta variante no reentrena el modelo, sino que modifica sus pesos mediante abliteracion direccional.

La abliteracion consiste en identificar la "direccion de rechazo" en el espacio de activaciones (el vector responsable de respuestas del tipo "no puedo ayudar con eso") y eliminarla de los pesos mediante ortogonalizacion. El autor documenta los parametros de la intervencion: `direction_index` 18,83; en `attn.o_proj`, pesos maximo 1,42 (posicion 23,83) y minimo 1,38 (distancia 17,62); en `mlp.down_proj`, pesos maximo 1,18 (posicion 27,92) y minimo 0,58 (distancia 17,38). La optimizacion de parametros se realizo con TPE (Tree-structured Parzen Estimator). No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en su alineamiento original.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Escritura creativa sin restricciones de contenido: ficcion, roleplay y dialogo de personajes.
- Respuestas directas sin rechazos en aproximadamente el 81% de los prompts que el modelo original rechazaba (segun la evaluacion del autor).
- Generacion de datos sinteticos para fine-tuning y entrenamiento.
- Soporte de red-teaming y analisis de seguridad adversarial.
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de OpenAI via vLLM.
- No genera bloques de razonamiento (`<think>`): el modo es exclusivamente no-thinking.
- No se documentan capacidades de tool calling, function calling, vision, audio ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Escritura creativa y ficcion: el modelo puede generar narrativa, dialogo de personajes y roleplay sin las restricciones de contenido del modelo original, lo que lo hace adecuado para autores que necesitan explorar temas sensibles o generos adultos.
- Red-teaming y evaluacion de seguridad: util para investigadores que necesitan un modelo que responda a prompts adversariales sin rechazarlos, permitiendo analizar como un modelo sin alineamiento maneja entradas maliciosas y comparar su comportamiento con el del modelo base.
- Generacion de datasets sinteticos: sirve para producir datos de entrenamiento o ajuste fino en dominios donde el modelo original se negaria a generar contenido, con la cautela de revisar la calidad y sesgos de la salida.
- Asistencia conversacional sin filtros: en entornos controlados (investigacion, prototipado interno) puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens, manteniendo coherencia en dialogos extensos.
- Procesamiento de documentos largos: con una ventana de 262.144 tokens puede resumir, extraer informacion o responder preguntas sobre libros, informes o codigo extenso en una sola pasada, aunque el modo no-thinking limita el razonamiento complejo.
- Prototipado rapido en local: al ser un modelo de 4B en safetensors, puede desplegarse en una GPU de consumo con cuantizacion (si se publica GGUF) o en FP16/BF16 en GPUs de 16-24 GB, lo que facilita experimentacion sin infraestructura dedicada.
- Despliegue via API compatible con OpenAI: con `vllm serve` se expone un endpoint `/v1/chat/completions` que permite integrarlo en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

El autor solo publica dos metricas comparativas respecto al modelo original. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0785 | 0 (por definicion) |
| Rechazos | 19/100 | 100/100 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8 GB solo para pesos (4,0B parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica se recomienda 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (si se publica GGUF): aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con contexto largo; RTX 4090 (24 GB) para inferencia en BF16 con contexto moderado.
- Cabe en GPUs de consumo: si, en RTX 3090/4090 (24 GB) en BF16 con contexto reducido, y en GPUs de 8-12 GB si se dispone de cuantizacion GGUF (no confirmada).
- Opciones de despliegue: transformers, vLLM (`vllm serve ... --max-model-len 32768`), Ollama (via Modelfile), llama.cpp (si se publica GGUF) y text-generation-inference.
- Contexto largo: los 262.144 tokens teoricos requieren mucha memoria de KV cache; el ejemplo de vLLM del autor limita `--max-model-len` a 32.768 tokens, lo que sugiere que el contexto completo no es practico en hardware de consumo.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Instruct-Uncensored (este) | 4,0B | 262.144 | Apache 2.0 | Abliterado, sin modo thinking, 19/100 rechazos |
| Qwen3-4B-Instruct-2507 (base) | 4,0B | 262.144 | Apache 2.0 | Alineado, rechaza 100/100 en el set del autor |
| Otras variantes abliteradas de Qwen3-4B | 4,0B | 262.144 | Apache 2.0 (segun variante) | No se dispone de datos comparativos verificados en la informacion proporcionada |
| Modelos densos de ~4B de otras familias | ~4B | Variable | Variable | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El modelo ha eliminado su alineamiento de seguridad: puede generar contenido danino, ofensivo o factualmente incorrecto. El autor declina responsabilidad por mal uso.
- Tasa de rechazo residual del 19% en prompts extremos segun la evaluacion del autor; no es un modelo completamente sin filtros.
- Riesgo de alucinacion: el autor indica que puede producir contenido inexacto o inventado, igual que el modelo base.
- Al ser un modelo de 4B, su capacidad de razonamiento complejo es limitada; el autor recomienda variantes mayores para tareas dificiles.
- Modo no-thinking exclusivo: no genera bloques `<think>`, lo que puede reducir el rendimiento en tareas que se benefician de razonamiento explicito.
- No se documentan idiomas soportados; se desconoce el rendimiento multilingue real.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin alineamiento en produccion puede incumplir normativas de contenido o politicas de plataforma; se recomienda evaluacion legal y de seguridad previa.
- El contexto completo de 262.144 tokens no es practico en hardware de consumo; el ejemplo de vLLM del autor limita a 32.768 tokens.
- No se confirma la publicacion de pesos GGUF, lo que limita el despliegue en llama.cpp y Ollama sin conversion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card referencia un identificador distinto (n0ctyx/...) al del repositorio (Slava21012/...), lo que puede indicar duplicacion o falta de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Slava21012/Qwen3-4B-Instruct-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Identificador alternativo referenciado en la model card: https://huggingface.co/n0ctyx/Qwen3-4B-Instruct-uncensored
- Paper de referencia sobre direcciones de rechazo (Arditi et al.): no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada

# litert-community/Qwen3.5-35B-A3B

## Resumen

`litert-community/Qwen3.5-35B-A3B` es una conversión del decodificador de texto del modelo `Qwen/Qwen3.5-35B-A3B` al formato LiteRT-LM, realizada por la comunidad `litert-community` mediante la herramienta `litert-torch` (función `export_hf`). El modelo original es un transformer de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen, con 35 000 millones de parámetros totales y 3000 millones activos por token, orientado a generación de texto y agentes multimodales nativos.

La relevancia de esta ficha concreta reside en que es un artefacto de despliegue para el runtime LiteRT-LM de Google AI Edge, no un modelo nuevo: empaqueta los pesos del Qwen3.5 original en un único fichero `.litertlm` con cuantización mixta (expertos en int4, atención y `lm_head` en int8, resto en fp32) y una ventana de contexto limitada a 4096 tokens. Está pensado para ejecución en CPU mediante XNNPACK, con métricas publicadas sobre un Apple M4 Max.

Es importante señalar que esta conversión solo incluye el decodificador de texto: no incorpora el codificador de visión ni las capas de predicción multi-token del modelo original, y el runtime estable LiteRT-LM 0.19.1 no puede ejecutar el fichero porque sus kernels MoE solo aceptan GELU y este modelo usa SiLU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con capas Gated DeltaNet; conversión a LiteRT-LM del decodificador de texto |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3000 millones (3B) por token |
| Longitud de contexto | 4096 tokens (fichero `ekv4096`) |
| Tipos de cuantizacion | Mixta: expertos int4 (block 32), atención y `lm_head` int8, resto fp32; cuantización de activaciones en tiempo de ejecución (XNNPACK qd8) para capas int8 |
| Idiomas soportados | Inglés (`en`) según la model card; el modelo base Qwen3.5 podría soportar más, pero no se declara en esta conversión |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamaño del fichero 27,61 GB; repo total 27,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts: 35B parámetros totales con 3B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. La model card de esta conversión menciona explícitamente capas Gated DeltaNet (un mecanismo de atención lineal/estado recurrente) en el contexto de las limitaciones del runtime. El modelo original se presenta en el paper citado como "Towards Native Multimodal Agents", lo que sugiere entrenamiento orientado a agentes y multimodalidad, aunque esta conversión concreta solo incluye el decodificador de texto.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. La conversión a LiteRT-LM se realizó con `litert-torch export_hf` (commit `67f11e8`) para un runtime LiteRT-LM compilado desde fuente (commit `02d7e8d8`). Las capas de predicción multi-token y el codificador de visión fueron excluidas del fichero.

## Capacidades

- Generación de texto en inglés (entrada y salida de texto exclusivamente en esta conversión).
- Razonamiento con modo "thinking" (la model card menciona conversaciones con thinking activado y verificación de turnos).
- Respuesta a preguntas de conocimiento y aritmética simple (se cita el ejemplo "What is 17 + 25?").
- Conversaciones multi-turno (verificadas hasta 3 turnos, con caveats descritos en limitaciones).
- Capacidad de agente multimodal y tool calling en el modelo base (no verificada en esta conversión: "Tool calls were not checked with this file").
- Sin soporte de visión en esta conversión (el codificador de visión no está incluido).
- Sin soporte de audio declarado.

## Casos de uso

- Inferencia local en CPU sobre equipos de sobremesa con gran cantidad de RAM: el fichero de 27,61 GB con huella pico de 17,18 GB permite ejecutar el modelo en un Apple M4 Max (128 GB) sin GPU, útil para prototipado offline y entornos sin acelerador.
- Evaluación de la cadena de conversión LiteRT-LM: sirve como referencia para validar `litert-torch export_hf` y comparar la salida frente a Transformers en bf16 (la model card reporta 12/12 coincidencias en veredicto y 12/12 en token de parada).
- Pruebas de razonamiento con thinking en local: útil para experimentar con el modo de razonamiento del modelo Qwen3.5 sin depender de infraestructura cloud, aceptando el contexto de 4096 tokens.
- Desarrollo de aplicaciones LiteRT-LM en escritorio: permite integrar el runtime de Google AI Edge en herramientas de línea de comandos o servicios locales que requieran un LLM MoE de 35B con licencia Apache 2.0.
- Investigación sobre cuantización mixta int4/int8 en modelos MoE: el fichero documenta el impacto de la cuantización en la calidad (repeticiones en el pensamiento con más capas en int8), lo que lo hace útil para estudiar trade-offs de precisión.
- Base para futuras conversiones GPU: aunque el fichero GPU no pasó las comprobaciones, esta conversión CPU sirve de punto de partida para validar kernels MoE con SiLU en LiteRT (PRs #11192 y #11188).

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Prefill | 72,46 tok/s | CPU (XNNPACK), Apple M4 Max 128 GB, 1024 tokens de prefill |
| Decode | 5,83 tok/s | CPU (XNNPACK), Apple M4 Max 128 GB, 256 tokens de decode |
| Huella pico de memoria | 17,18 GB | CPU (XNNPACK), Apple M4 Max |
| Coincidencia de veredicto con Transformers (bf16) | 12/12 | 12 preguntas, greedy, thinking on |
| Termina con token de parada | 12/12 | 12 preguntas, greedy, thinking on |
| Conversación de 3 turnos | pass | 3 turnos, thinking on |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son de rendimiento y fidelidad de la conversión, no de calidad del modelo.

## Requisitos de hardware

- VRAM/RAM estimada: huella pico de 17,18 GB en CPU con el fichero de 27,61 GB en disco; se requiere al menos ~28 GB de almacenamiento y suficiente RAM para cargar el fichero y ejecutar (medido en un equipo de 128 GB).
- GPU recomendadas: no hay fichero GPU disponible; la forma GPU "did not pass the checks". No se han medido GPUs.
- ¿Cabe en GPU de consumo? No hay artefacto GPU validado; en CPU, el fichero de 27,61 GB no cabe en la memoria de un teléfono según la propia model card.
- Opciones de despliegue: LiteRT-LM (runtime de Google AI Edge), compilado desde fuente con los PRs #11192 y #11188 para soportar SiLU en kernels MoE; el binario `litert_lm_advanced_main` con `--backend=cpu`.
- Latencia y throughput: 5,83 tok/s de decode y 72,46 tok/s de prefill en Apple M4 Max (CPU, XNNPACK); la model card indica que la velocidad "still being tuned".

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `litert-community/Qwen3.5-35B-A3B` (esta ficha) | 35B | 3B | 4096 | Apache 2.0 | `.litertlm` | Solo texto; CPU; requiere runtime desde fuente |
| `Qwen/Qwen3.5-35B-A3B` (base) | 35B | 3B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo original completo, con visión y MTP; referencia de calidad |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Una sola conversación por motor: iniciar una nueva conversación sobre el mismo motor no reinicia el estado de Gated DeltaNet (issue LiteRT-LM #3165).
- Tras un error por exceso de contexto, todos los mensajes posteriores de esa conversación fallan en LiteRT-LM 0.18.1 y 0.19.1 (`Task failed with state: 7`); es necesario crear un motor nuevo.
- Multi-turno con thinking: con `filter_channel_content_from_kv_cache` por defecto (true), el turno 3 no vio una lista proporcionada en el turno 1 en 2 de 2 ejecuciones.
- Solo medido en escritorio (Apple M4 Max); no se ha medido en iOS/iPhone ni Android, y el fichero de 27,61 GB no cabe en un teléfono.
- Las capas int8 (atención y `lm_head`) se ejecutan con cuantización de activaciones en tiempo de ejecución (XNNPACK qd8), por lo que el texto difiere en puntos concretos del de Transformers; con más capas en int8, el pensamiento se repitió hasta el límite de 2048 tokens.
- No hay fichero GPU: la forma GPU no pasó las comprobaciones.
- Tool calling no verificado con este fichero.
- Contexto limitado a 4096 tokens, muy inferior al del modelo base.
- Solo inglés declarado; sin visión ni predicción multi-token.
- Licencia Apache 2.0 permite uso comercial, pero la calidad de la conversión y las limitaciones del runtime deben evaluarse antes de producción.
- Riesgo de alucinación y sesgos del modelo base no documentados en esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Notas de conversión: https://huggingface.co/litert-community/Qwen3.5-35B-A3B/blob/main/DETAILS.md
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- PR LiteRT #11192: https://github.com/google-ai-edge/LiteRT/pull/11192
- PR LiteRT #11188: https://github.com/google-ai-edge/LiteRT/pull/11188
- Issue LiteRT-LM #3165: https://github.com/google-ai-edge/LiteRT-LM/issues/3165

# adeepv/gemma-4-26B-A4B-it-W4A16-vLLM

## Resumen

El modelo `adeepv/gemma-4-26B-A4B-it-W4A16-vLLM` es un repack del checkpoint oficial de Google `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, adaptado al formato `compressed-tensors` W4A16 (pesos de 4 bits simétricos, grupo de 32, activaciones en bf16) para poder servirse con vLLM. Google publicó la cuantización QAT de este modelo únicamente en formato GGUF para llama.cpp; este repack cubre el vacío para el ecosistema vLLM, reproduciendo la malla de cuantización q4_0 sobre la que se entrenó el QAT, en lugar de la malla RTN por defecto de `llm-compressor`.

Se trata de un modelo MoE (Mixture of Experts) con 25,8 mil millones de parámetros totales y 4 mil millones activos, con una ventana de contexto de hasta 64K tokens. El checkpoint base es la versión instruct de Gemma 4, que incluye capacidades de razonamiento (thinking mode) y tool calling. El repack mantiene los pesos originales del QAT sin calibración adicional, y el único cambio sustantivo respecto a un repack estándar es el uso de la fórmula de escala `amax/8` en lugar de `amax/7.5`, lo que reduce el error de dequantización en las capas de atención de forma notable.

Con un tamaño de 16 GB en un único archivo `safetensors`, cabe en una GPU de 24 GB con contexto completo de 64K y caché KV en fp8. Las pruebas del autor muestran que, con el modo de razonamiento activado, el modelo alcanza 197/200 aciertos en una suite de 200 tareas, igualando o superando al GGUF oficial de Google, y con una velocidad de generación de 194 tokens/s en una RTX 4090.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con torre de visión |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | 4 B (según nombre A4B) |
| Longitud de contexto | 65.536 tokens (64K) |
| Tipos de cuantizacion | W4A16 (int4 simétrico, group size 32) en formato compressed-tensors; también disponible el GGUF q4_0 original de Google |
| Idiomas soportados | en, ru (según la model card; el modelo base probablemente soporta más, pero solo se listan estos) |
| Licencia | Gemma (términos de Google: https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (un único archivo `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, un modelo MoE con 26B parámetros totales y 4B activos, desarrollado por Google. La arquitectura incluye una torre de visión (vision tower) y una proyección `embed_vision`, lo que sugiere capacidades multimodales, aunque la model card de este repack no detalla su uso. La versión `-it` corresponde a la variante instruct, entrenada para seguir instrucciones y conversación.

El repack no aplica ningún entrenamiento adicional: los pesos provienen directamente del checkpoint QAT de Google, que fue cuantizado durante el entrenamiento (Quantization-Aware Training) contra una malla de cuantización q4_0 (escala `amax/8`). El proceso de repack consiste en mapear esos pesos al formato `compressed-tensors` `pack-quantized` W4A16, con group size 32 y activaciones en bf16, mediante redondeo determinista al vecino más próximo sobre la malla q4_0. No se utilizan datos de calibración ni técnicas post-entrenamiento como GPTQ o AWQ.

Una innovación técnica destacable es la corrección de la fórmula de escala: `llm-compressor` usa por defecto `amax/7.5`, pero la malla q4_0 del QAT usa `amax/8`. Esta diferencia reduce el error relativo L2 en las capas de atención de 6,66% a 3,79%, y en los expertos MoE se mantiene en 8,41% (el mínimo alcanzable con esta geometría). Además, el checkpoint QAT tiene un 67% de pesos de atención que caen exactamente sobre nodos de la malla de 4 bits, frente al 6,9% de un checkpoint no QAT, lo que explica la ventaja de usar el QAT.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y ruso, con plantilla de chat de Gemma 4.
- Modo de razonamiento (thinking mode): el modelo puede emitir una cadena de razonamiento interna antes de la respuesta final. Este modo se activa mediante `enable_thinking` en la plantilla de chat y requiere el parser `gemma4` en vLLM para separar el contenido de razonamiento.
- Tool calling / function calling: soportado a través de `--enable-auto-tool-choice` y el parser `gemma4` en vLLM, lo que permite integrar el modelo en flujos de agentes.
- Capacidades multimodales potenciales: el checkpoint incluye una torre de visión, aunque la model card no documenta su uso en este repack.
- Razonamiento matemático, lógico y de hechos: en la suite de 200 tareas del autor, el modelo con thinking activado acierta 197/200.
- Generación de código y seguimiento de formato: incluido en las categorías evaluadas.
- Multilingüe: aunque solo se listan en y ru, el modelo base de Gemma 4 suele soportar más idiomas; no hay confirmación en la documentación disponible.

## Casos de uso

- Asistentes conversacionales con razonamiento visible: el modo thinking permite que el modelo explique sus pasos antes de responder, útil para chatbots educativos o de soporte técnico donde la transparencia del razonamiento es valiosa.
- Agentes autónomos con tool calling: al soportar `function calling` y el parser `gemma4`, puede integrarse en pipelines de agentes que necesitan llamar a APIs, ejecutar consultas o interactuar con sistemas externos.
- Generación de código asistida en entornos de producción: con 4B parámetros activos y 64K de contexto, puede manejar repositorios completos o fragmentos largos de código, y su velocidad (194 tok/s en RTX 4090) lo hace viable para autocompletado interactivo.
- Análisis de documentos largos: la ventana de 64K permite procesar manuales, contratos o artículos extensos en una sola pasada, con capacidad de extraer hechos y resumir.
- Traducción y procesamiento de texto en ruso e inglés: el modelo está entrenado para ambos idiomas, lo que lo hace adecuado para tareas de traducción, corrección o generación de contenido bilingüe.
- Prototipado de aplicaciones de IA en hardware de consumo: al caber en una GPU de 24 GB (p. ej., RTX 4090) con cuantización W4A16, es una opción práctica para desarrolladores que necesitan un modelo MoE potente sin acceso a clústeres.
- Evaluación de calidad de cuantización: el repack sirve como referencia para comparar el rendimiento de vLLM frente a llama.cpp con el mismo checkpoint QAT, útil para equipos que deciden su stack de inferencia.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K), sino una suite propia de 200 tareas con respuestas verificables mecánicamente (matemáticas, lógica, hechos, idioma ruso, código, formato, conteo de palabras y caracteres), a `temperature=0`. Los resultados se comparan con el checkpoint bf16 original y el GGUF oficial de Google:

| Run | Este W4A16 (vLLM) | bf16 fuente (vLLM) | GGUF q4_0 oficial (llama.cpp) |
|---|---|---|---|
| Thinking desactivado | 187/200 | 188/200 | 188/200 |
| Thinking activado | 197/200 | no medido | 195/200 |

La tabla muestra que la cuantización no es el factor limitante: sin thinking, el repack queda a un acierto del bf16 y del GGUF; con thinking, supera al GGUF en 2 puntos. También se reporta el error de dequantización relativo L2 frente al bf16:

| Grupo de tensores | `amax/7.5` (defecto llm-compressor) | `amax/8` (este repack) |
|---|---|---|
| Atención `q_proj` | 6,66% | 3,79% |
| Expertos MoE `down_proj` | 8,18% | 8,41% |

El error de 8,41% en expertos es el mínimo alcanzable con la malla q4_0 en esa geometría (tamaño intermedio 704), coincidiendo con el GGUF de Google. En cuanto a velocidad, en una RTX 4090 (24 GB, límite de 300 W) con vLLM 0.28.0, fp8 KV cache y contexto 64K:

| Carga de trabajo | Este W4A16 (vLLM) | GGUF q4_0 (llama.cpp) |
|---|---|---|
| Suite de 200 tareas, thinking on, un solo stream | 194 tok/s | 165 tok/s |
| Chat, concurrencia 4, 400 tokens por respuesta | 559 tok/s | no medido |

## Requisitos de hardware

- VRAM estimada: 16 GB de pesos + caché KV; con contexto 64K y KV cache fp8 cabe en una GPU de 24 GB con `--gpu-memory-utilization 0.92`.
- GPU recomendadas: RTX 4090 (24 GB) probada por el autor; también funcionará en A100 40/80 GB, RTX 3090/4080 (24 GB) o cualquier GPU con al menos 20-24 GB de VRAM para contexto completo.
- En consumer GPU: sí, cabe en RTX 4090 y similares de 24 GB; para GPUs de 16 GB (p. ej., RTX 4080) se podría reducir el contexto o usar cuantización más agresiva, pero no está documentado.
- Opciones de despliegue: vLLM (recomendado, con `--reasoning-parser gemma4` y `--tool-call-parser gemma4`); también el GGUF oficial puede usarse con llama.cpp.
- Latencia y throughput: 194 tok/s en un solo stream con thinking activado; 559 tok/s con concurrencia 4 en chat sin thinking (según pruebas del autor). No se reportan métricas de latencia por request.

## Comparativa con modelos similares

La comparación más directa es con las versiones del mismo modelo base:

| Modelo | Parámetros totales/activos | Cuantización | Contexto | Rendimiento (suite 200 tareas, thinking on) | Licencia |
|---|---|---|---|---|---|
| `adeepv/gemma-4-26B-A4B-it-W4A16-vLLM` (este) | 25,8B / 4B | W4A16, group 32 | 64K | 197/200 | Gemma |
| `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` (GGUF) | 25,8B / 4B | q4_0 GGUF | 64K | 195/200 | Gemma |
| `google/gemma-4-26B-A4B-it` (bf16) | 25,8B / 4B | bf16 | 64K | 188/200 (sin thinking) | Gemma |

No se dispone de comparaciones con otros modelos MoE de tamaño similar (p. ej., Mixtral 8x7B, Qwen MoE) en la información proporcionada. El repack es funcionalmente equivalente al GGUF oficial en calidad, pero con la ventaja de poder servirse con vLLM y su ecosistema (paginación, batching, tool calling).

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo de 4 bits, la calidad de hechos y razonamiento puede degradarse en comparación con el bf16, especialmente en tareas de conteo de caracteres (el autor reporta que el GGUF oficial falla en los mismos ítems, indicando una propiedad de la cuantización 4-bit).
- Riesgo de alucinación: no se evalúa explícitamente, pero como todo LLM instruct, puede generar información falsa con alta confianza; se recomienda validación externa en aplicaciones críticas.
- Limitaciones de idioma: solo se listan en y ru; el uso en otros idiomas no está verificado por el autor del repack.
- Restricciones de licencia: licencia Gemma de Google, que permite uso comercial pero con condiciones específicas (consultar los términos en https://ai.google.dev/gemma/terms). El repack no modifica la licencia del modelo base.
- Dependencia de la fórmula de escala: el repack usa `amax/8`; si se re-cuantiza con `llm-compressor` por defecto (`amax/7.5`), el error de dequantización en atención aumenta ~1,76 veces, degradando la calidad.
- Modo thinking: requiere configuración explícita en vLLM (`--reasoning-parser gemma4` y `enable_thinking`); sin ella, el modelo responde directamente sin razonamiento, lo que puede afectar a la calidad en tareas complejas.
- Sin soporte de visión funcional documentado: aunque el checkpoint incluye torre de visión, este repack no detalla cómo usarla; probablemente requiere configuraciones adicionales no probadas.
- Producción: el autor solo ha probado vLLM 0.28.0; versiones posteriores pueden requerir ajustes. El rendimiento con concurrencia alta solo se mide en chat sin thinking.

## Enlaces

- Repositorio HuggingFace del repack: https://huggingface.co/adeepv/gemma-4-26B-A4B-it-W4A16-vLLM
- Checkpoint base (QAT, GGUF): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web (los resultados obtenidos eran irrelevantes).

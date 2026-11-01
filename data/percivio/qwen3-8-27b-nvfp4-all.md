# Percivio/Qwen3.8-27B-NVFP4-all

## Resumen

Qwen3.8-27B-NVFP4-all es una cuantización comunitaria del modelo Qwen3.8-27B de Qwen, publicada por el usuario Percivio en Hugging Face. Parte del checkpoint NVFP4 de NVIDIA (nvidia/Qwen3.8-27B-NVFP4) y lo lleva más allá: re-cuantiza a NVFP4 las 208 proyecciones de atención y de Gated DeltaNet que NVIDIA mantenía en FP8 por tensor, y sustituye las proyecciones BF16 de la capa draft MTP por pesos FP8 en bloques de 128×128 del release oficial FP8 de Qwen. El objetivo es servir el modelo completo en una sola GPU NVIDIA RTX PRO 6000 Blackwell (SM120) con decodificación especulativa MTP en un único stream.

Su relevancia está en el rendimiento: sobre vLLM sin modificar, con caché KV en FP8 y MTP de cinco tokens draft, casi duplica la velocidad de decodificación (hasta 2,10×) frente al release oficial FP8 de Qwen en contextos de 64K a 256K tokens, manteniendo la calidad (GSM8K y recuperación de agujas prácticamente idénticas). El modelo base es un híbrido de 27B parámetros con 16 capas de atención completa y 48 capas de atención lineal Gated DeltaNet, con encoder de visión, ventana de contexto de hasta 256K tokens y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas de atención lineal Gated DeltaNet, con MTP (multi-token prediction) y encoder de visión |
| Parametros totales | 27B (el resumen de safetensors del Hub indica 14,98 B porque cuenta cada byte U8 como un parámetro; cada byte empaqueta dos pesos NVFP4) |
| Parametros activos | no disponible (no consta que sea MoE; aparenta ser denso) |
| Longitud de contexto | Hasta 256K tokens (benchmarks publicados con prompts de 76,7K, 126,1K y 223,7K tokens) |
| Tipos de cuantizacion | NVFP4 (atención, MLP, proyecciones Gated DeltaNet y lm_head), FP8 por bloques 128×128 (capa draft MTP), BF16 (embeddings de tokens, encoder de visión, fc del MTP y puertas pequeñas de Gated DeltaNet, unos 24M parámetros) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18,4 GB en total) |

## Arquitectura y entrenamiento

El modelo base, Qwen/Qwen3.8-27B, es un transformer híbrido que combina 16 capas de atención completa tradicional (con proyecciones q/k/v/o) y 48 capas de atención lineal tipo Gated DeltaNet (con proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj`). Esta arquitectura híbrida reduce el coste de atención en contextos largos, lo que explica el buen rendimiento en prompts de más de 200K tokens. Incluye además una capa MTP (multi-token prediction) que se usa como modelo draft para decodificación especulativa, y un encoder de visión heredado del checkpoint de NVIDIA. No se dispone de información sobre el proceso de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

Esta variante no reentrena nada: es una re-cuantización. Las 208 proyecciones de atención y Gated DeltaNet se cuantizan a NVFP4 desde los pesos BF16 originales de Qwen, con escalas de bloque obtenidas mediante una búsqueda MSE sobre fracciones de amax, igual que el calibrador NVFP4 MSE de ModelOpt. Las escalas de activación derivan de las escalas FP8 calibradas por NVIDIA divididas entre 6. Las siete proyecciones de la capa draft MTP, que NVIDIA dejaba en BF16, se sustituyen por los pesos FP8 en bloques de 128×128 del release oficial Qwen3.8-27B-FP8, en un archivo separado (`mtp-fp8.safetensors`) que solo lee el draft. El token embedding, el encoder de visión, el `fc` del MTP y las puertas `in_proj_a`/`in_proj_b` de Gated DeltaNet permanecen en BF16.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, con plantilla de chat y modo thinking).
- Razonamiento matemático: resuelve GSM8K con thinking activado y decodificación greedy.
- Contexto largo: recupera agujas correctamente en prompts de 64K a 200K tokens (18/18 en la batería del autor).
- Tareas agénticas sobre contextos de código de 128K-200K tokens: preguntas y respuestas, reparación de bugs y pruebas de concepto, con tool calling y caché de prefijos.
- Soporte de tool calling / function calling en vLLM (con matices en la gramática de herramientas estrictas, ver limitaciones).
- Capacidades de visión: conserva el encoder de visión del checkpoint de NVIDIA, byte-idéntico (no se han publicado evaluaciones de esta variante).
- Decodificación especulativa MTP nativa con cinco tokens draft en vLLM.

## Casos de uso

- Chatbots y asistentes con contexto muy largo: la ventana de 256K tokens permite ingestar documentos completos, contratos o bases de código, y la atención lineal Gated DeltaNet mantiene latencias razonables en prefill de más de 200K tokens.
- Análisis y refactorización de repositorios de código: las tareas agénticas del autor se ejecutaron sobre contextos de código de 128K-200K tokens con tool calling, un escenario directo para agentes de reparación de bugs.
- Servicios de inferencia de bajo coste en una sola GPU: todo el modelo cabe en una RTX PRO 6000 Blackwell con 96 GB de VRAM, con 125-164 tok/s de decodificación según contexto, adecuado para servir aplicaciones con tráfico moderado sin clústeres.
- Generación aumentada por recuperación (RAG): la recuperación de agujas 18/18 entre 64K y 200K tokens lo hace fiable para responder con citas sobre corpus grandes indexados en el prompt.
- Razonamiento matemático y verificación: 1.240/1.319 problemas de GSM8K resueltos con thinking activado, útil para asistentes de cálculo y tutoría.
- Prototipado de decodificación especulativa y cuantización FP4: el repo documenta con detalle el proceso de cuantización NVFP4 y el parche de draft head podado, útil como referencia para ingenieros de inferencia en hardware Blackwell.
- Agentes multi-paso con herramientas: el autor reporta 46-48/54 tareas agénticas superadas en nueve ejecuciones, sin bucles de razonamiento, con tool calling y caché de prefijos en vLLM.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo (decodificación con vLLM sin modificar, FP8 KV cache, MTP de cinco tokens, RTX PRO 6000 Blackwell en AWS g7e.2xlarge; medias de tres o cuatro ejecuciones):

| Contexto (tokens de prompt) | 64K (76,7K) | 128K (126,1K) | 256K (223,7K) |
|---|---:|---:|---:|
| Qwen3.8-27B-FP8 oficial: decode tok/s | 77,8 | 72,4 | 68,8 |
| Este checkpoint: decode tok/s | 152,5 | 135,6 | 125,7 |
| Aceleración en decode | 1,96× | 1,87× | 1,83× |
| Release FP8 oficial: petición completa, s (prefill) | 37,5 (11,2) | 51,2 (23,0) | 86,5 (56,6) |
| Este checkpoint: petición completa, s (prefill) | 23,3 (9,8) | 37,3 (22,2) | 77,3 (61,0) |

Con el parche de draft head podado (no incluido en el release, disponible en GitHub):

| Contexto (tokens de prompt) | 64K | 128K | 256K |
|---|---:|---:|---:|
| Decode tok/s con draft head podado | 163,8 | 142,8 | 132,8 |
| Aceleración sobre el release FP8 | 2,10× | 1,97× | 1,93× |

Una petición completa (prefill más 2.048 tokens de salida) tarda un 38 %, 27 % y 11 % menos que con el release FP8 en 64K, 128K y 256K respectivamente.

Calidad (decodificación greedy con thinking activado):

| Métrica | Release FP8 oficial | Este checkpoint (vLLM estándar) | Este checkpoint (stack de investigación) |
|---|---:|---:|---:|
| GSM8K, 1.319 problemas | 1.231 | 1.240 (24 perdidos, 33 ganados) | 1.231 (23 perdidos, 23 ganados) |
| GSM8K, primeros 200 problemas | 186 | 188 | 189 |
| Recuperación de agujas en prompts de 64K-200K | 18/18 | 18/18 | 18/18 |
| Tareas agénticas, nueve ejecuciones | 48/54 | no ejecutado | 46/54 |

No se han publicado resultados de benchmarks públicos estándar (MMLU, HumanEval, etc.) para esta variante cuantizada; los datos disponibles son internos del autor.

## Requisitos de hardware

- Diseñado para una única NVIDIA RTX PRO 6000 Blackwell (arquitectura SM120), servidor o workstation; los benchmarks usan una RTX PRO 6000 Blackwell Server Edition (instancia AWS g7e.2xlarge).
- El repo ocupa 18,4 GB de pesos, más caché KV en FP8 y overhead de runtime; una GPU de 96 GB lo aloja con holgura incluso con contextos de 256K tokens (el propio autor lo demuestra).
- No es utilizable en GPUs Ampere, Hopper o anteriores: los kernels NVFP4 de vLLM requieren hardware Blackwell (SM120).
- Despliegue con vLLM sin modificar (kernels NVFP4 por defecto, caché KV FP8, MTP con cinco tokens draft). El autor también documenta un stack de investigación con kernels Marlin y un parche de draft head podado en GitHub.
- No se menciona soporte para llama.cpp, Ollama o TGI; el formato NVFP4 con ModelOpt está orientado a vLLM en Blackwell.
- Rendimiento medido: 125,7-163,8 tok/s de decodificación según contexto y configuración, con prefill de 9,8 s para 76,7K tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Percivio/Qwen3.8-27B-NVFP4-all | 27B | NVFP4 (todo) + draft FP8 | 256K | Apache 2.0 | 125-164 tok/s decode en una RTX PRO 6000 Blackwell |
| nvidia/Qwen3.8-27B-NVFP4 | 27B | NVFP4 (MLP y lm_head), FP8 (atención y DeltaNet) | 256K | Apache 2.0 | Checkpoint base de esta variante; más lento en decode |
| Qwen/Qwen3.8-27B-FP8 | 27B | FP8 oficial | 256K | Apache 2.0 | Referencia de calidad y rendimiento: 68,8-77,8 tok/s decode en el mismo host |

Frente al release FP8 oficial, esta variante ofrece hasta 2,10× de aceleración en decodificación con calidad esencialmente equivalente (GSM8K 1.240 frente a 1.231), a costa de requerir hardware Blackwell exclusivamente. No se dispone de comparativas con otros modelos de la familia Qwen de distinto tamaño en la información proporcionada.

## Limitaciones y advertencias

- Requiere GPU NVIDIA Blackwell (SM120): no funciona en RTX 4090, A100 ni H100, lo que restringe mucho el hardware de destino.
- La gramática de herramientas estrictas de vLLM tenía un bug no corregido en el momento de las pruebas: con `strict: true` sin parche, el rendimiento en tareas agénticas cayó (14/18); el autor publica un fix externo o recomienda desactivar el modo estricto.
- Ligera variación de calidad según kernels: los kernels Marlin y los por defecto de vLLM producen texto ligeramente distinto con decodificación greedy (187-190/200 en GSM8K en el host de release).
- La batería de tareas agénticas es interna del autor, no un benchmark público; las diferencias entre configuraciones están dentro de la variación entre ejecuciones (hasta dos tareas).
- Sesgos, riesgo de alucinación y idiomas soportados: no disponibles en la documentación; heredan del modelo base Qwen3.8-27B, cuya model card debería consultarse.
- El parche de draft head podado no forma parte de este release y requiere aplicar código externo de GitHub.
- La cuantización NVFP4 de las proyecciones de atención es agresiva; aunque las métricas del autor no muestran degradación, conviene validar en el dominio de producción propio antes de desplegar.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo: https://huggingface.co/Percivio/Qwen3.8-27B-NVFP4-all
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Release FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio con el parche de draft head podado y el fix de gramática estricta: https://github.com/Percivio-Ltd/sm120-serving (subcarpetas `pruned-draft-head/` y `strict-tool-grammar/`)

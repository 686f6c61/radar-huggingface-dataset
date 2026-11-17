# 2Beyes/Aurum_4b

## Resumen
Aurum 4B es una variante del modelo Qwen3.5-4B de Alibaba Qwen en la que se ha eliminado el comportamiento de rechazo (refusal) manteniendo el resto de pesos originales. Lo desarrolla el usuario 2Beyes y se distribuye principalmente en formato GGUF para llama.cpp, con una versión paralela en safetensors BF16. El objetivo declarado es ofrecer chat cotidiano y tool calling en tarjetas gráficas de 8 GB, incluyendo el tower de visión y la cabeza de predicción multi-token (MTP) del modelo base.

El modelo conserva la arquitectura multimodal image-text-to-text de Qwen3.5-4B, con 4.326.350.848 parámetros totales y licencia Apache 2.0. La modificación se limita a una edición de bajo rango sobre los pesos de salida de atención y de la FFN en las capas 4 a 31, derivada de la diferencia entre Qwen3.5-4B y un modelo "abliterated" de terceros. No se incluye el fine-tuning de destilación de ese modelo intermedio.

Su relevancia actual es doble: por un lado, demuestra una técnica quirúrgica de "abliteration" que preserva el conocimiento del modelo base; por otro, ofrece una cuantización GGUF con importance matrix y decodificación especulativa vía MTP, pensada para hardware de consumo. Es un modelo explícitamente sin censura, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-4B, con vision tower y cabeza MTP |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 16384`) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q4_0, Q3_K_M; proyector de visión en F16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (principal) y safetensors BF16 en repo aparte |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B completo: pesos, vision tower y cabeza de predicción multi-token (MTP). No hay entrenamiento desde cero ni fine-tuning propio. La edición consiste en calcular la diferencia de pesos entre Qwen3.5-4B y el modelo insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated, y conservar únicamente la componente que elimina rechazos: los 8 vectores singulares principales del cambio en los pesos de salida de atención (`self_attn.o_proj` / `linear_attn.out_proj`) de las capas 4 a 31 (aproximadamente el 98 % del cambio), y la dirección principal en `mlp.down_proj` solo en tensores donde concentra más de la mitad del cambio. El resto de modificaciones del modelo intermedio (su destilación) no se incorpora.

La configuración, el tokenizer y la plantilla de chat provienen del modelo Heretic citado, con el mismo tokenizer que Qwen3.5. La conversión a GGUF se hizo con llama.cpp build b12289, y todas las cuantizaciones usan una importance matrix calculada sobre una mezcla Aurum hermana con texto de prosa, código y chats de tool-calling. La decodificación especulativa se apoya en la cabeza MTP del propio modelo: con `--spec-type draft-mtp --spec-draft-n-max 2` se reporta aproximadamente 1,4x de aceleración en código con la misma salida. El modo thinking funciona como en Qwen3.5 mediante `enable_thinking` en la plantilla de chat.

## Capacidades
- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo thinking activable por plantilla (`enable_thinking`), aunque los benchmarks publicados son con thinking desactivado.
- Tool calling / function calling, requerido `--jinja` en llama.cpp; puntuaciones BFCL v3 no-live altas (85,9 de media).
- Capacidades multimodales image-text-to-text mediante el vision tower original de Qwen3.5-4B y el proyector `mmproj-Aurum-4B-F16.gguf`.
- Decodificación especulativa nativa vía cabeza MTP.
- Comportamiento sin rechazos: 0 rechazos en 100 prompts dañinos según la model card, con 0 % de sobre-rechazo en 30 prompts inocuos × 3 muestras.
- Capacidades multilingües: solo se declara inglés (`language: en`); no se documentan otros idiomas.

## Casos de uso
- Asistente de chat local en GPU de 8 GB: con Q4_K_M (2,8 GB) y el proyector de visión F16 (0,7 GB) cabe holgadamente en una RX 6600 o RTX 3060, permitiendo conversaciones multi-turno con contexto de 16k tokens según el ejemplo de llama.cpp.
- Tool calling en agentes locales: la puntuación BFCL v3 de 85,9 de media (92,0 en simple, 92,5 en multiple) lo hace adecuado para pipelines de function calling en entornos controlados, siempre validando los resultados de las herramientas.
- Procesamiento de documentos con imagen: al conservar el vision tower de Qwen3.5-4B, puede extraer texto o describir capturas en flujos de digitalización, con la ventaja de ejecutarse en hardware de consumo.
- Generación de código asistida en local: con decodificación MTP se reportan 79 tokens/s en código con Q4_K_M en una RX 6600, útil para autocompletado o revisión en IDE sin depender de la nube.
- Investigación sobre alineación y abliteration: sirve como caso de estudio reproducible de edición de pesos por direcciones singulares para eliminar rechazos preservando conocimiento (MMLU-Redux 74,9 frente a 75,0 del modelo previo).
- Experimentación con modelos sin censura en entornos de investigación aislados: para estudiar comportamientos de modelos no alineados, con la advertencia explícita de no exponerlo a usuarios que no hayan optado por un modelo sin censura.
- Despliegue en edge con llama.cpp: el rango de cuantizaciones desde Q3_K_M (2,3 GB) hasta Q8_0 (4,6 GB) permite ajustar el equilibrio calidad/velocidad en distintos equipos.

## Benchmarks y rendimiento

Comparativa publicada por el autor, ambos modelos en Q4_K_M con llama.cpp, thinking desactivado, decodificación greedy y sin system prompt, con runner propio. El modelo previo es Qwen3.8-4B-Distill-Heretic-Abliterated (Q4_K_M).

| Benchmark | Modelo previo | Aurum 4B |
|---|---|---|
| IFEval, prompt strict / loose (541) | 72,8 / 75,8 | 78,6 / 81,5 |
| IFEval, instruction strict / loose | 81,3 / 83,8 | 85,3 / 87,5 |
| BFCL v3 non-live, media (1.240) | 68,7 | 85,9 |
| BFCL simple / multiple / parallel / parallel-multiple | 65,2 / 74,5 / 48,0 / 62,0 | 92,0 / 92,5 / 82,0 / 82,0 |
| BFCL irrelevance (sin herramienta cuando no aplica) | 93,8 | 80,8 |
| MMLU-Redux 2.0 (5.330 preguntas) | 75,0 | 74,9 |
| GPQA Diamond (198, orden de respuestas aleatorizado con semilla fija) | 42,9 | 49,5 |

Rechazos:

| Test | Modelo previo | Qwen3.5-4B oficial | Mezcla Aurum anterior | Aurum 4B |
|---|---|---|---|---|
| Rechazos en 100 prompts dañinos (mlabonne/harmful_behaviors) | 0 | 72 | 20 | 0 |
| Sobre-rechazo: rechazos en 30 prompts inocuos × 3 muestras | 1,1 % | no disponible | 0 % | 0 % |

Calidad de cuantización frente a BF16 (KL divergence y mismo token top, corpus de chat largo):

| Fichero | Tamano | KL vs BF16 | Mismo token top | Velocidad prosa / código (tok/s) |
|---|---|---|---|---|
| Aurum-4B-BF16.gguf | 8,7 GB | 0 | 100 % | no medido |
| Aurum-4B-Q8_0.gguf | 4,6 GB | 0,0028 | 98,6 % | 47 / 64 |
| Aurum-4B-Q6_K.gguf | 3,6 GB | 0,0067 | 97,2 % | 48 / 67 |
| Aurum-4B-Q5_K_M.gguf | 3,2 GB | 0,0111 | 96,2 % | 57 / 76 |
| Aurum-4B-Q4_K_M.gguf (recomendado) | 2,8 GB | 0,0277 | 93,7 % | 57 / 79 |
| Aurum-4B-Q4_K_S.gguf | 2,6 GB | 0,0304 | 93,2 % | 59 / 75 |
| Aurum-4B-IQ4_XS.gguf | 2,6 GB | 0,0360 | 92,5 % | 56 / 76 |
| Aurum-4B-Q4_0.gguf | 2,6 GB | 0,0544 | 90,9 % | 58 / 81 |
| Aurum-4B-Q3_K_M.gguf | 2,3 GB | 0,0906 | 87,9 % | 59 / 80 |

Velocidades medidas en RX 6600 8 GB con Vulkan, llama.cpp b12289 y MTP con 2 tokens de draft. El autor advierte que las cifras de Qwen publicadas corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables. En GPQA, 84 de las 198 respuestas de Aurum alcanzaron el límite de 3.072 tokens y se contaron como incorrectas (6 en el modelo previo).

## Requisitos de hardware
- VRAM estimada: desde 2,3 GB (Q3_K_M) hasta 8,7 GB (BF16) para los pesos; añadir 0,7 GB del proyector de visión F16 si se usa entrada de imagen.
- Configuración recomendada: Q4_K_M (2,8 GB) + proyector (0,7 GB), holgado en GPU de 8 GB.
- GPU probada por el autor: AMD RX 6600 8 GB con backend Vulkan.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más (RX 6600, RTX 3060/4060, etc.); las cuantizaciones Q3_K_M y Q4_K_S permiten incluso GPUs de 6 GB.
- Opciones de despliegue: llama.cpp / llama-server (probado, build b12289), con `--jinja` para tool calls y `--spec-type draft-mtp --spec-draft-n-max 2` para decodificación especulativa. La versión safetensors BF16 permite transformers, vLLM y fine-tuning.
- Throughput reportado: 57 tok/s en prosa y 79 tok/s en código con Q4_K_M en RX 6600; aproximadamente 1,4x de aceleración en código con MTP activado.
- Para el despliegue con contexto de 16k se usa `-c 16384 -ngl 999`; no se documenta el contexto máximo real del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aurum 4B | 4,33 B | no disponible | BFCL v3 85,9; MMLU-Redux 74,9; GPQA 49,5 (Q4_K_M, thinking off) | Apache 2.0 | GGUF y safetensors en HF |
| Qwen3.5-4B (oficial) | 4 B (no disponible el dato exacto) | no disponible | 72 rechazos de 100 prompts dañinos; cifras oficiales en BF16 con thinking largo y BFCL v4 | Apache 2.0 (según modelo base) | HF |
| Qwen3.8-4B-Distill-Heretic-Abliterated | 4 B (no disponible el dato exacto) | no disponible | BFCL v3 68,7; MMLU-Redux 75,0; GPQA 42,9 (Q4_K_M) | no disponible en la informacion proporcionada | GGUF en HF |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | 4 B (no disponible el dato exacto) | no disponible | no disponible | no disponible en la informacion proporcionada | HF |

## Limitaciones y advertencias
- Modelo explícitamente sin censura: 0 rechazos en 100 prompts dañinos. No debe desplegarse donde usuarios que no hayan optado por un modelo sin censura puedan acceder a él.
- Es un modelo de 4B: comete errores factuales y puede invocar herramientas cuando ninguna encaja (BFCL irrelevance 80,8 frente a 93,8 del modelo previo). Verificar siempre los resultados de las herramientas.
- Verbosidad en preguntas de razonamiento difíciles con thinking desactivado, lo que provoca truncamientos (84 de 198 respuestas de GPQA agotaron el límite de 3.072 tokens).
- Solo se declara inglés; no hay evidencia de calidad en otros idiomas.
- La medición de rechazos se basa en frases marcadoras, por lo que es una estimación y no una revisión manual.
- El contexto máximo no está documentado en la información disponible; el ejemplo usa 16k tokens.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de un modelo sin rechazos conlleva riesgos legales y de reputación que deben evaluarse.
- El modelo depende de la plantilla de chat y del tokenizer del modelo Heretic intermedio; cambios en ellos pueden alterar el comportamiento.
- No se han validado los pesos safetensors BF16 en este documento más allá de su existencia en el repo enlazado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/2Beyes/Aurum_4b
- Pesos safetensors BF16: https://huggingface.co/2Beyes/Aurum_4b-safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo fuente de la edición de rechazos: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo previo comparado en benchmarks: https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Conjunto de prompts dañinos: mlabonne/harmful_behaviors

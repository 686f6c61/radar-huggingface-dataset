# ronke21/rlcl-gemma-2-2b-igbo-s124

## Resumen

`ronke21/rlcl-gemma-2-2b-igbo-s124` es un ajuste fino (fine-tuning) del modelo `google/gemma-2-2b` de Google, publicado por el usuario `ronke21` en Hugging Face. El nombre del repositorio sugiere un experimento de aprendizaje continuo con la técnica RLCL (Reinforcement Learning with Continual Learning, o alguna variante similar) aplicada sobre un subconjunto o "shard" (s124) de datos en igbo, un idioma nigeriano. Los tags del repositorio incluyen `rlcl`, `forgetting` y `lora-merged`, lo que indica que se trata de un estudio sobre olvido catastrófico al adaptar un modelo base a un nuevo idioma mediante LoRA fusionado.

El modelo conserva la arquitectura Gemma 2 del original, con 2.614.341.888 par\u00e1metros reales en safetensors, y se distribuye en formato transformers con pesos safetensors. El repositorio tiene un tama\u00f1o de 5,3 GB y est\u00e1 marcado como de acceso restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigaci\u00f3n con cero descargas y cero likes en el momento de la consulta, sin documentaci\u00f3n p\u00fablica sobre datos de entrenamiento, licencia o idiomas soportados. Su inter\u00e9s principal radica en el estudio del olvido catastrófico al especializar un modelo multiling\u00fce en un idioma de bajos recursos como el igbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 2 soporta hasta 8.192 tokens) |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base admite cuantizaci\u00f3n a 8 y 4 bits |
| Idiomas soportados | No disponibles (el nombre sugiere igbo; el base es multiling\u00fce) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b`, un transformer decoder-only con atenci\u00f3n por ventanas alternas y atenci\u00f3n global, normalizaci\u00f3n RMSNorm y activaci\u00f3n GeGLU. El fine-tuning se realiz\u00f3 mediante LoRA y posteriormente se fusion\u00f3 en los pesos base (`lora-merged`), de modo que el checkpoint resultante es un modelo denso est\u00e1ndar compatible con `transformers`.

No se dispone de informaci\u00f3n p\u00fablica sobre el n\u00famero de tokens de entrenamiento, la composici\u00f3n del dataset, el uso de RLHF/DPO ni los hiperpar\u00e1metros del ajuste. Los tags `rlcl` y `forgetting` apuntan a un experimento de aprendizaje continuo dise\u00f1ado para medir la p\u00e9rdida de capacidades previas (olvido catastrófico) al a\u00f1adir el idioma igbo. El sufijo `s124` probablemente identifica un shard o semilla del experimento. No se documenta ninguna innovaci\u00f3n t\u00e9cnica adicional.

## Capacidades

- Generaci\u00f3n de texto conversacional, heredada del modelo base Gemma 2.
- Razonamiento y respuesta a instrucciones en el estilo del modelo base.
- Posible mejora en igbo (no verificada ni documentada).
- Soporte de tool calling: no documentado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multiling\u00fces: no documentadas; el base soporta varios idiomas, pero este ajuste puede haber degradado algunos.
- Modo thinking, visi\u00f3n o audio: no disponible.

## Casos de uso

- Investigaci\u00f3n sobre olvido catastrófico: comparar las respuestas del modelo ajustado frente al base en tareas generales para cuantificar la p\u00e9rdida de capacidades tras el fine-tuning en igbo.
- Evaluaci\u00f3n de adaptaci\u00f3n a idiomas de bajos recursos: usar el checkpoint como referencia en experimentos de especializaci\u00f3n ling\u00fc\u00edstica con LoRA fusionado.
- Generaci\u00f3n de texto en igbo para prototipos: siempre que se valide la calidad con hablantes nativos, dado que no hay benchmarks publicados.
- Reproducci\u00f3n de experimentos RLCL: el checkpoint sirve como punto de partida o comparaci\u00f3n en estudios de aprendizaje continuo.
- An\u00e1lisis de degradaci\u00f3n multiling\u00fce: medir c\u00f3mo afecta la especializaci\u00f3n en un idioma a las capacidades en ingl\u00e9s u otros idiomas del base.
- Docencia y formaci\u00f3n: ejemplo pr\u00e1ctico de fine-tuning con LoRA y fusi\u00f3n de pesos sobre un modelo peque\u00f1o de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informaci\u00f3n disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 5,2 GB (2,61B par\u00e1metros × 2 bytes).
- VRAM estimada en cuantizaci\u00f3n 8 bits: alrededor de 2,6 GB.
- VRAM estimada en cuantizaci\u00f3n 4 bits: alrededor de 1,5-2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100; cabe en GPUs de consumo con al menos 6 GB en fp16.
- Despliegue: compatible con `transformers`, `text-generation-inference` (tag `text-generation-inference`), vLLM y llama.cpp si se convierte a GGUF; Ollama requerir\u00eda conversi\u00f3n previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-gemma-2-2b-igbo-s124 | 2,61B | No disponible (base: 8.192) | No disponible | Gated, 0 descargas |
| google/gemma-2-2b | 2,61B | 8.192 | Gemma Terms of Use | P\u00fablico |
| google/gemma-2-2b-it | 2,61B | 8.192 | Gemma Terms of Use | P\u00fablico |
| meta-llama/Llama-3.2-1B | 1,24B | 131.072 | Llama 3.2 Community License | Gated |

La comparaci\u00f3n directa con el modelo base es la m\u00e1s relevante: este checkpoint es una especializaci\u00f3n del mismo, sin datos p\u00fablicos que permitan afirmar mejoras medibles.

## Limitaciones y advertencias

- No hay informaci\u00f3n sobre la licencia, lo que impide confirmar el uso comercial; adem\u00e1s, el modelo base Gemma 2 est\u00e1 sujeto a los Gemma Terms of Use.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face.
- Riesgo elevado de olvido catastrófico: el tag `forgetting` sugiere que el ajuste puede haber degradado capacidades del base en otros idiomas o tareas.
- Sin benchmarks ni evaluaci\u00f3n p\u00fablica: no se puede verificar la calidad en igbo ni en tareas generales.
- Riesgo de alucinaci\u00f3n inherente a los modelos de 2B, potencialmente agravado por el fine-tuning especializado.
- Idiomas soportados no documentados; el uso en producci\u00f3n multiling\u00fce no est\u00e1 respaldado.
- Cero descargas y cero likes: sin validaci\u00f3n por parte de la comunidad.
- Repositorio creado y actualizado en noviembre de 2026, sin documentaci\u00f3n adicional (model card m\u00ednima).

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-2b-igbo-s124
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Documentaci\u00f3n de Gemma 2: https://ai.google.dev/gemma/docs
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118

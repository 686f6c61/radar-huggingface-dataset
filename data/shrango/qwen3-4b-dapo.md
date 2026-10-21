# shrango/Qwen3-4B-DAPO

vacío. No es un modelo MoE, por lo que no hay parámetros activos que reportar."

"El entrenamiento usó DAPO sobre DAPO-Math-17k, deduplicado, con 17.917 problemas (se descartaron 8 con prompts de más de 1024 tokens). Se dieron exactamente 3 pasadas sobre los datos (138 pasos), con batch de 128 prompts x 16 muestras por paso, mini-batch de 32 prompts (4 actualizaciones por paso), AdamW con lr 1e-6 constante tras 10 pasos de warmup, weight decay 0,1 y grad clip 1,0. DAPO se configuró con clip-higher (0,2/0,28), dynamic sampling (se descartan grupos con accuracy uniforme), token-level loss, overlong reward shaping (penalización lineal en los últimos 2048 tokens), sin KL y sin bonus de entropía. El reward es rule-based: se compara la línea Answer: o el último \boxed{} con la verdad de referencia (verl math_dapo). El rollout usó temperatura 1,0, top-p 1,0 y respuesta máxima de 8192 tokens. El framework fue verl (FSDP + vLLM) sobre 4 x A100 80 GB durante aproximadamente 3,5 días."

Good.

Need "Capacidades" bullets:
- "Generación de texto y razonamiento matemático paso a paso..."
- "Respuesta final en \boxed{}..."
- "Modo non-thinking..."
- "Generación de hasta 8192 tokens nuevos en el ejemplo de uso..." 
- "Uso como profesor en destilación on-policy..."
- "No se documenta tool calling..."
- "Idiomas no disponibles..."
Maybe "Soporte de tool calling / function calling: no documentado en la model card." Good.

Need "Casos de uso" bullets with bold labels? Use "- **...**: ..." That's okay. First word of bullet after bold? Not title. Fine.

Need "Benchmarks" table. Include "Modelo | AIME 2024 | AIME 2025 | AMC 2023 | MATH-500". Numbers with decimal comma? Provided 20.6 etc. Use 20,6? Spanish decimal comma. Good. But benchmark names in English. "Qwen3-4B (non-thinking)" and "Qwen3-4B-DAPO". Good. Add "Diferencia absoluta" row? Could add:
| Diferencia (pp) | +24,4 | +20,4 | +20,7 | +8,1 |
This is computed, okay. Mention "puntos porcentuales". Good.

Need "Requisitos de hardware" 6 bullets. VRAM estimates:
- "Pesos en BF16: ~8,0 GB (4,02 B x 2 bytes)."
- "Inferencia en BF16: reservar ~12-16 GB de VRAM para incluir KV cache y activaciones; la cifra exacta depende de la longitud de contexto, que no se especifica."
- "Cuantización 8-bit: ~4,0 GB solo pesos; 4-bit: ~2,0-2,5 GB solo pesos. Son estimaciones; no hay variantes cuantizadas publicadas."
- "GPU recomendadas: A100 80 GB/H100 para entrenamiento o servicio de alto throughput; RTX 4090/3090 (24 GB) o L4/A10G (24 GB) para inferencia BF16. En consumer, 16 GB puede servir en BF16 con contexto moderado; 12 GB requiere 8-bit; 8 GB requiere 4-bit, con overhead adicional."
- "Despliegue: transformers (ejemplo oficial), vLLM, TGI (tag text-generation-inference). llama.cpp/Ollama requerirían convertir a GGUF, no publicado."
- "Entrenamiento: 4 x A100 80 GB, ~3,5 días. Latencia y throughput: no disponibles."

Need "Comparativa" table. Use "Contexto" no disponible. "Licencia" Apache-2.0. "Disponibilidad" Hugging Face. For base, parameters "4 B (nominal)"? Hmm. The base model is Qwen/Qwen3-4B, likely 4B. Use "4 B (nominal; no verificado en la informacion)". That's clunky. Could say "no disponible" for parameters? But name 4B. Table:
| Modelo | Parámetros | Contexto | Licencia | AIME 2024 | AIME 2025 | AMC 2023 | MATH-500 |
| Qwen3-4B (non-thinking) | 4 B (nominal) | no disponible | Apache-2.0 | 20,6 | 20,6 | 64,3 | 84,3 |
| Qwen3-4B-DAPO | 4,02 B | no disponible | Apache-2.0 | 45,0 | 41,0 | 85,0 | 92,4 |
Then note. Is "4 B nominal" okay? It's from name. Fine.

Need "Limitaciones" bullets. Include "No hay evaluacion independiente; 170 descargas y 0 likes en el momento de la consulta" maybe not necessary. Could mention "adopción baja" as caveat? Maybe not technical. But could mention "El modelo tiene 170 descargas y 0 likes en la información de HuggingFace; no se han encontrado evaluaciones independientes." That's factual. But might be irrelevant. Include in limitations maybe "No se han publicado evaluaciones independientes ni datos de seguridad". Good.

Need "Enlaces" list. Good.

Need ensure no extra comments. Good.

Potential issue: "La model card no especifica la longitud de contexto" but Qwen3-4B has context. We can't use external. Good.

Potential issue: "Arquitectura Transformer decoder-only" maybe not in provided; but base model Qwen3. Fine.

Potential issue: "parametros totales (dato real, safetensors): 4.022.468.096" Use exact. Good.

Need no "no disponibles" in languages? Use "no disponible". Good.

Need "Solo la primera palabra de los titulos va en mayuscula." In table header "Parámetro" and "Valor" only first word. Good. In bullet bold labels, not headings. Good.

Need "castellano de España" avoid Latin American "computadora"; use "ordenador" not needed. Use "GPU de consumo". Fine.

Need final answer only Markdown. Let's produce.## Resumen

Qwen3-4B-DAPO es un ajuste fino de Qwen/Qwen3-4B publicado por el usuario shrango en Hugging Face. Es un modelo de generación de texto de 4.022.468.096 parámetros (4,02 B), con arquitectura Transformer decoder-only de la familia Qwen3, pesos en safetensors y licencia Apache-2.0. La model card no especifica la longitud de contexto ni los idiomas soportados.

El modelo se ha entrenado con DAPO (arXiv:2503.14476) sobre DAPO-Math-17k en modo non-thinking, con el objetivo declarado de actuar como un profesor más fuerte para experimentos de destilación on-policy. Resuelve problemas matemáticos pidiendo razonamiento paso a paso y respuesta final dentro de `\boxed{}`, y mejora de forma clara al modelo base en AIME 2024, AIME 2025, AMC 2023 y MATH-500.

Es relevante para equipos que investigan RL aplicado a razonamiento matemático y para pipelines que necesitan generar o verificar soluciones matemáticas con un modelo pequeño de 4 B que puede ejecutarse en GPU de consumo. No obstante, no hay datos publicados sobre tool calling, agentes, visión, audio ni rendimiento multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3; modelo base Qwen/Qwen3-4B) |
| Parámetros totales | 4.022.468.096 (4,02 B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no los documenta) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Tamaño del repositorio | 8,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-4B: un Transformer decoder-only denso de 4,02 B parámetros. El ajuste se realizó en modo non-thinking, usando la plantilla de chat con un bloque `<think></think>` vacío. No es un modelo MoE, por lo que no hay parámetros activos que reportar.

El entrenamiento usó DAPO sobre DAPO-Math-17k, deduplicado, con 17.917 problemas (se descartaron 8 con prompts de más de 1024 tokens). Se dieron exactamente 3 pasadas sobre los datos (138 pasos), con batch de 128 prompts x 16 muestras por paso, mini-batch de 32 prompts (4 actualizaciones por paso), AdamW con lr 1e-6 constante tras 10 pasos de warmup, weight decay 0,1 y grad clip 1,0. DAPO se configuró con clip-higher (0,2/0,28), dynamic sampling (se descartan grupos con accuracy uniforme), token-level loss, overlong reward shaping (penalización lineal en los últimos 2048 tokens), sin KL y sin bonus de entropía. El reward es rule-based: se compara la línea `Answer:` o el último `\boxed{}` con la verdad de referencia (verl `math_dapo`). El rollout usó temperatura 1,0, top-p 1,0 y respuesta máxima de 8192 tokens. El framework fue verl (FSDP + vLLM) sobre 4 x A100 80 GB durante aproximadamente 3,5 días.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, entrenado específicamente para resolver problemas y presentar el resultado final dentro de `\boxed{}`.
- Modo non-thinking: el ejemplo oficial usa `enable_thinking=False` y la plantilla de chat con un bloque `<think></think>` vacío.
- Generación de respuestas de hasta 8192 tokens nuevos en el ejemplo de uso (`max_new_tokens=8192`).
- Uso como profesor en experimentos de destilación on-policy, que es el objetivo declarado por el autor.
- Evaluación de precisión matemática mediante `mean@k`, con temperatura 0,7, top-p 0,8, top-k 20 y `max_tokens` 8192.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-step fuera del razonamiento matemático: no documentado.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- **Tutoría matemática paso a paso**: el modelo puede recibir un problema con la instrucción de razonar paso a paso y devolver una explicación con la respuesta final en `\boxed{}`. Es adecuado para entornos educativos porque el formato de entrenamiento coincide con el formato de uso.
- **Generación de datos sintéticos de razonamiento matemático**: se pueden muestrear varias soluciones por problema con temperatura alta y filtrar por la respuesta final extraída del último `\boxed{}`. Sirve para crear datasets de entrenamiento o evaluación para otros modelos.
- **Profesor para destilación on-policy**: el autor lo entrenó explícitamente como un profesor más fuerte para experimentos de destilación. Se usaría generando rollouts sobre problemas matemáticos y aprovechando sus respuestas para entrenar un modelo estudiante.
- **Verificación automática de soluciones**: en un pipeline de corrección, el modelo puede generar la solución de referencia y comparar la respuesta final con la del alumno o la del sistema evaluado. La extracción rule-based de `Answer:` o `\boxed{}` facilita la automatización.
- **Investigación en RL para razonamiento**: sirve para reproducir o hacer ablaciones de DAPO con clip-higher, dynamic sampling, token-level loss y overlong reward shaping. El modelo es pequeño enough para iterar con 4 x A100 80 GB, según la model card.
- **Evaluación de modelos matemáticos**: puede actuar como baseline o como modelo de comparación en suites tipo AIME, AMC y MATH-500, usando `mean@k` en lugar de `pass@1`.
- **Asistente de estudio en cuadernos y herramientas locales**: al ser un modelo de 4 B, puede cargarse con transformers en una GPU de consumo y usarse en notebooks o scripts para resolver problemas con el formato de prompt adecuado.

## Benchmarks y rendimiento

Resultados de la model card: `mean@k` accuracy (%), media de acierto sobre k muestras por problema. Modo

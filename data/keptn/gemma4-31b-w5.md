# keptn/gemma4-31b-w5

## Resumen

Gemma 4 31B-it · int5 · for radiance (`keptn/gemma4-31b-w5`) es una cuantización de peso int5 del modelo multimodal `google/gemma-4-31B-it` de Google, preparada específicamente para el motor de inferencia radiance sobre GPUs AMD RDNA4. El autor del repositorio es keptn, un tercero que no es Google: lo que se distribuye es un único fichero de 23,36 GiB (`gemma4-31b-w5.rad`) que contiene todas las capas lineales del tronco cuantizadas con GPTQ a int5, más la cabeza auxiliar (assistant head) de Google para decodificación especulativa con 3 tokens de borrador.

El problema que resuelve es claro: hacer caber un modelo de ~31 mil millones de parámetros con visión y contexto de 262.144 tokens en tarjetas AMD de 32 GB, algo que en bf16 requeriría más de 60 GiB solo de pesos. La relevancia de esta ficha radica en que es una de las pocas cuantizaciones int5 documentadas con métricas de fidelidad (KL frente al original bf16) y con mediciones de rendimiento reales en Radeon AI PRO R9700, lo que permite evaluar el compromiso entre compresión y calidad con datos, no con promesas.

Arquitecturalmente se trata de un transformer multimodal (texto, imagen y vídeo) con pipeline image-text-to-text, licencia Apache 2.0 y soporte de modo de razonamiento (thinking) activable por petición. Requiere obligatoriamente radiance con el PR #361, todavía sin versión estable publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen y vídeo) con assistant head para decodificación especulativa (MTP) |
| Parametros totales | ~31 mil millones (base: google/gemma-4-31B-it) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Tronco: int5 GPTQ (punto cero u8, una escala f16 por 128 pesos); activaciones f16 hasta 64 filas, int8 (una escala por token y 128 valores) por encima; lm_head int8 con escala bf16 por 128 pesos; assistant head y vision tower en bf16 |
| Idiomas soportados | no disponible (hereda los de google/gemma-4-31B-it; la ficha no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | Fichero propio `.rad` (23,36 GiB) para radiance; cuantización declarada como compressed-tensors; no hay safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

Este repositorio no es un modelo entrenado desde cero, sino una cuantización post-entrenamiento. El proceso documentado en la model card es el siguiente: se parte del checkpoint bf16 `google/gemma-4-31B-it` (revisión `842da379`), se añade la assistant head oficial de Google `google/gemma-4-31B-it-assistant` (revisión `627c5ec1`) para habilitar decodificación especulativa tipo MTP con 3 tokens de borrador, y después se cuantizan con GPTQ todas las capas lineales del tronco a int5. Las matrices q, k y v comparten una única pasada de GPTQ. No se aplicó SmoothQuant.

La calibración se realizó con un corpus propio de 110 conversaciones y 165.626 tokens (el mismo conjunto de calibración del fichero W4A8 del mismo autor). El resultado se empaqueta con `rad-convert` en un fichero `.rad` con `quantization_config.quant_method=compressed-tensors`. Sobre el modelo base original de Google no se ofrecen detalles de entrenamiento en esta ficha (tokens, composición del dataset, RLHF/DPO): no disponible.

Un detalle técnico relevante: Gemma 4 tiene 32 cabezas de atención, lo que impide el paralelismo tensorial con 3 GPUs (no divisible); el despliegue soporta 1, 2 o 4 tarjetas.

## Capacidades

- Generación de texto e instrucciones: hereda las capacidades conversacionales de `gemma-4-31B-it`, con plantilla de chat oficial de Google (temperatura 1.0, top_p 0.95, top_k 64 como valores recomendados).
- Entrada multimodal: acepta texto, imágenes y vídeo (pipeline image-text-to-text); el vision tower se mantiene en bf16, lo que preserva la calidad multimodal.
- Modo thinking: razonamiento extendido activable por petición mediante `"chat_template_kwargs": {"enable_thinking": true}`.
- Decodificación especulativa (MTP): 3 tokens de borrador generados por la assistant head en bf16, con ganancias medibles de throughput.
- Contexto largo: hasta 262.144 tokens, con configuración de KV cache en fp8.
- Tool calling y capacidades de agente: no disponible en la información de esta ficha (dependería del modelo base google/gemma-4-31B-it; la model card no lo menciona).
- Audio: la model card menciona mediciones de "vision or audio encoder", lo que sugiere entrada de audio, aunque solo se publican datos de imágenes y vídeo.

## Casos de uso

- Análisis de documentos con visión local: gracias a la entrada de imágenes y a que el vision tower permanece en bf16, es adecuado para extraer información de PDFs escaneados, facturas o formularios (la propia model card valida con DocVQA) sin enviar datos a la nube.
- Resumen de vídeos largos: acepta vídeo como entrada (validado con MVBench) y su contexto de 262.144 tokens permite procesar transcripciones y fotogramas de material extenso en una sola sesión.
- Chat privado con contexto largo en estación de trabajo AMD: con una única Radeon AI PRO R9700 de 32 GB cabe el modelo completo con más de 145.000 tokens de KV pool compartido, ideal para entornos con requisitos de confidencialidad.
- Servicios de inferencia multi-usuario: con 2 o 4 tarjetas y radiance en modo servidor (hasta 8 secuencias simultáneas), sirve como backend de chat para equipos pequeños con throughput agregado de 333-525 tokens/s.
- Razonamiento con thinking mode para tareas complejas: activando `enable_thinking` por petición, se puede usar para problemas de análisis o planificación que se benefician de cadenas de razonamiento más largas, a cambio de mayor latencia.
- Comparación de fidelidad de cuantizaciones: la model card incluye métricas KL frente al original bf16, útil como referencia metodológica para equipos que evalúan cuánta calidad se pierde al comprimir a int5 frente a int8 o w4a8.
- Procesamiento por lotes de prompts largos: el prefill de 4.214 tokens/s con 4 tarjetas permite indexar o resumir grandes volúmenes de texto (corpus internos, documentación técnica) de forma eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí ofrece métricas de fidelidad y velocidad propias:

**Fidelidad frente al original bf16** (80 preguntas de MT-Bench, 42.283 tokens de respuesta, KL sobre tokens de respuesta):

| Fichero | KL media | KL percentil 99 | Top token igual | Ratio de perplejidad |
|---|---|---|---|---|
| gemma4-31b-w5 (este) | 0,00803 | 0,107 | 97,8 % | ×1,010 |
| keptn/gemma4-31b-i8g | 0,00236 | 0,0311 | 98,8 % | ×1,004 |
| keptn/gemma4-31b-w4a8 | 0,0517 | 0,721 | 94,6 % | ×1,056 |

**Velocidad** (Radeon AI PRO R9700 a 215 W, radiance 1.13.0 + rama w5, KV fp8, 3 draft tokens, thinking off, BetterBench 0.6.1, mediana):

| Medición | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | 70,9 tok/s | 124,8 tok/s | 201,3 tok/s |
| Prefill a 24k tokens | 1.421 tok/s | 2.559 tok/s | 4.214 tok/s |
| 4 streams, total | 198 tok/s | 333 tok/s | 525 tok/s |

**Fidelidad multimodal** (greedy, thinking off, 2 tarjetas): en imágenes (DocVQA y AI2D, 20 casos) coincide la respuesta en 16/20 casos; en vídeo (MVBench, 5 clips de 4 fotogramas) en 4/5 casos.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 23,36 GiB; se necesitan tarjetas de 32 GB. Con 1 GPU de 32 GB cabe el modelo más KV cache en fp8 (145.264-209.456 tokens de contexto total según número de secuencias); con 2 GPUs, hasta 524.304-970.480 tokens; con 4, hasta 2.097.248 tokens.
- GPUs compatibles: AMD RDNA4, probado en Radeon AI PRO R9700 (32 GB) en configuraciones de 1, 2 y 4 tarjetas. No hay soporte documentado para NVIDIA.
- Consumer GPUs: no disponible; la ficha solo documenta la R9700 (tarjeta profesional). Con 32 GB de VRAM por tarjeta, las consumer de gama alta no cumplen el requisito documentado.
- Configuraciones válidas: 1, 2 o 4 tarjetas. Tres tarjetas no funcionan porque las 32 cabezas de atención no se reparten en tres.
- Motor de inferencia: exclusivamente radiance, y no cualquier versión: hay que compilar la rama del PR #361 (aún sin release). El despliegue se hace vía Docker (`docker/build.sh -t gfx1201`) con acceso a `/dev/kfd` y `/dev/dri`, `ROCR_VISIBLE_DEVICES` para seleccionar tarjetas y `--tp 1/2/4` (con `--p2p on` en multi-GPU).
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; el formato `.rad` propietario de radiance no es compatible con ellos.
- Rendimiento esperado: 70,9 tok/s de decodificación con una tarjeta (201,3 con cuatro) y prefill de hasta 4.214 tok/s, siempre con decodificación especulativa activada.

## Comparativa con modelos similares

Comparativa con las cuantizaciones alternativas del mismo autor para el mismo modelo base (datos de la propia model card):

| | gemma4-31b-w5 (este) | keptn/gemma4-31b-i8g | keptn/gemma4-31b-w4a8 |
|---|---|---|---|
| Cuantización | int5 GPTQ (pesos), act. f16/int8 | int8 (pesos y activaciones, según nombre) | pesos 4 bits, activaciones 8 bits |
| KL media vs bf16 | 0,00803 | 0,00236 | 0,0517 |
| Top token igual | 97,8 % | 98,8 % | 94,6 % |
| Ratio de perplejidad | ×1,010 | ×1,004 | ×1,056 |
| Motor | radiance (AMD RDNA4) | radiance (AMD RDNA4) | radiance (AMD RDNA4) |
| Licencia | Apache 2.0 | no disponible en esta ficha | no disponible en esta ficha |

Como referencia de categoría, frente al original `google/gemma-4-31B-it`: el original en bf16 requiere más del doble de VRAM (~60+ GiB solo de pesos) y no incluye la assistant head para especulación, pero ofrece máxima fidelidad y compatibilidad con el ecosistema estándar de Hugging Face. No hay datos comparativos publicados frente a modelos de otros fabricantes de tamaño similar: no disponible.

## Limitaciones y advertencias

- Dependencia de un PR sin fusionar: el modelo requiere radiance con el PR #361, que todavía no está en ninguna versión estable. Cualquier despliegue en producción depende de código no liberado oficialmente.
- Formato propietario: el fichero `.rad` solo funciona con radiance. No hay safetensors ni GGUF, por lo que no es usable con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Restricción de topología: solo funcionan configuraciones de 1, 2 o 4 tarjetas; con 3 GPUs el modelo no arranca (32 cabezas de atención indivisibles).
- Solo AMD RDNA4: no hay soporte documentado para NVIDIA ni para generaciones anteriores de AMD.
- Degradación medible frente a bf16: aunque la KL media es baja (0,00803), en el percentil 99 la divergencia sube a 0,107 y el top token coincide en el 97,8 % de los casos; en tareas sensibles a la exactitud (matemáticas, código crítico) conviene validar frente al original. La fidelidad multimodal es menor: solo 16/20 respuestas idénticas en imágenes.
- Sesgos: al ser una cuantización de `google/gemma-4-31B-it`, hereda los sesgos del modelo base de Google; esta ficha no documenta sesgos específicos: no disponible.
- Alucinaciones: riesgo inherente al modelo base; el modo thinking y la decodificación especulativa no lo mitigan. No hay evaluaciones de alucinación publicadas.
- Idiomas: la ficha no enumera los idiomas soportados; hay que consultar la model card de `google/gemma4-31B-it`.
- Licencia: Apache 2.0, sin restricciones de uso comercial conocidas en este repositorio; no obstante, conviene verificar los términos de uso de Gemma aplicables al modelo base de Google.
- Advertencia general: el repo tiene 0 descargas y 1 like en el momento de la ficha, es decir, prácticamente sin validación comunitaria.

## Enlaces

- Repositorio del modelo: https://huggingface.co/keptn/gemma4-31b-w5
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Assistant head (draft model): https://huggingface.co/google/gemma-4-31B-it-assistant
- Cuantización int8 alternativa del mismo autor: https://huggingface.co/keptn/gemma4-31b-i8g
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- PR #361 de radiance (requerido): https://codeberg.org/StillDeadcode/radiance/pulls/361
- Framework de model cards del autor: https://codeberg.org/keptn42/radiance-model-cards-framework
- Dataset de juicio de MT-Bench usado como referencia: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments

# Goekdeniz-Guelmez/Omoikane-50M-PoC

## Resumen

Omoikane-50M-PoC es un checkpoint de prueba de concepto de un modelo de lenguaje hibrido de 48,9 millones de parametros, desarrollado por Goekdeniz-Guelmez y entrenado de principio a fin en un unico Mac mini con chip Apple M4 y 32 GB de memoria unificada, sin GPU CUDA. El modelo combina capas recurrentes lineales Gated DeltaNet con capas de atencion Multi-head Latent Attention (MLA) y bloques feed-forward de tipo Mixture-of-Experts (MoE) de grano fino, ademas de una cabeza de prediccion multi-token (MTP). Su proposito no es ser un asistente utilizable, sino validar que esta arquitectura, esta receta de entrenamiento y el stack de entrenamiento sobre Apple Silicon funcionan antes de invertir unos tres dias de computo en una ejecucion completa de 1.000 millones de tokens.

El checkpoint se entreno desde inicializacion aleatoria durante una epoca sobre 103,7 millones de tokens de texto web educativo (dataset `mlx-community/fineweb-edu-100K`), en 6,8 horas, alcanzando una perdida de validacion de 4,0105 nats (perplejidad 55,2). La arquitectura esta pensada para eficiencia en inferencia: las capas GDN tienen coste O(1) por token y estado de tamano fijo, mientras que las dos capas MLA aportan recuperacion exacta con una cache KV comprimida de baja dimension. Es relevante ahora como referencia tecnica para quienes exploran arquitecturas hibridas y entrenamiento en hardware de consumo Apple.

El modelo es exclusivamente en ingles, tiene licencia MIT, usa pesos en safetensors con codigo personalizado (`custom_code`) y no ha pasado por ajuste de instrucciones ni alineamiento de preferencias. El autor indica que una ejecucion mayor de 1.000 millones de tokens, extension de contexto a 4.096 tokens, SFT y entrenamiento de preferencias estan en curso en el proyecto principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (recurrente lineal) + Multi-head Latent Attention + MoE de grano fino + cabeza MTP |
| Parametros totales | 48.922.112 (48,9M): 33,6M de embedding atado + 15,4M de tronco |
| Parametros activos | ~41,8M por token (MoE con 16 expertos, top-4, mas 1 experto compartido) |
| Longitud de contexto | 1.024 tokens entrenados; funciona zero-shot hasta al menos 4.096 |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo tiene 10 capas mas la cabeza MTP, con ancho d = 256. Ocho de las diez capas usan Gated DeltaNet: capas recurrentes lineales con estado de tamano fijo por cabeza, actualizadas mediante la regla delta con compuerta `S_t = α_t (I − β_t k_t k_tᵀ) S_{t−1} + β_t k_t v_tᵀ`; tienen coste O(1) por token en inferencia y carecen de nocion de posicion absoluta, lo que favorece la generalizacion entre longitudes. Las capas 3 y 7 usan Multi-head Latent Attention con cache KV comprimida de baja dimension (64 + 16 valores por token y capa), RoPE desacoplado y compuerta de salida sigmoide. Los bloques feed-forward son MoE en las capas 1 a 8 (16 expertos de 96 unidades, top-4 dentro de 2 de 4 grupos, enrutamiento sigmoide con limite de grupo, un experto compartido y equilibrio de carga sin perdida auxiliar mediante un sesgo por experto ajustado tras cada paso); las capas 0 y 9 usan SwiGLU denso. El vocabulario es un BPE a nivel de byte de 131.072 tokens con embedding de entrada y salida atado. GDN usa 4 cabezas (K = V = 64, chunk 128); MLA usa 4 cabezas (rango de q 128, rango de kv 64, 48 dimensiones nope + 16 RoPE, θ = 1e5).

El entrenamiento se hizo con el optimizador Muon (Nesterov 0,95, 5 pasos de Newton–Schulz, RMS-matched) para matrices ocultas y AdamW para embedding, router, normalizaciones y escalares, con weight decay 0,1 y schedule warmup-stable-decay (5% de warmup, constante a 6e-3, decaimiento lineal a 6e-4 en el ultimo 20%). La funcion de perdida combina entropia cruzada de siguiente token, 0,1 × CE de MTP (25% de las posiciones) y 1e-4 de perdida de equilibrio MoE. Se ejecutaron 6.329 pasos de optimizador × 16.384 tokens (micro-batch 8 × 1.024, 2 pasos de acumulacion de gradiente). El stack fue MLX 0.32 con un kernel Metal personalizado para la recurrencia gated-delta y `mx.compile`, en fp32 para pesos y bf16 para las GEMM del vocabulario, alcanzando unos 4.000–4.300 tokens/s con un pico de 13,1 GB de memoria. La innovacion destacable es la cabeza MTP, que predice el token t+2 y puede servir como modelo borrador para decodificacion especulativa propia; el autor reporta que Muon supero a AdamW por 0,54 nats y a Lion por 0,68 en el barrido de hiperparametros.

## Capacidades

- Generacion de texto en ingles con fluidez gramatical: la tarea BLiMP alcanza 72,9% frente al 50% de azar.
- Conocimiento simple y lectura basica por encima del azar: SciQ 60,0%, PIQA 54,6%, ARC-Easy 39,2%.
- Razonamiento gramatical y sintactico aprendido de forma clara tras solo 104M tokens.
- Prediccion multi-token mediante la cabeza MTP, utilizable como borrador para decodificacion especulativa.
- Capacidad de trabajar zero-shot con contextos de hasta al menos 4.096 tokens pese a entrenarse con 1.024.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision ni audio.
- No dispone de modo de pensamiento (thinking mode) ni de ajuste de instrucciones.
- Multilinguismo limitado al ingles.

## Casos de uso

- Validacion de arquitecturas hibridas en investigacion: el checkpoint permite reproducir y estudiar el comportamiento de una mezcla GDN + MLA + MoE a escala pequena antes de escalar, con curvas de perdida y evaluaciones publicadas por el autor.
- Referencia para entrenamiento en Apple Silicon: sirve como ejemplo reproducible de un pipeline completo en MLX con kernel Metal personalizado, util para equipos que quieran entrenar o ajustar modelos en Mac sin CUDA.
- Prueba de decodificacion especulativa: la cabeza MTP puede emplearse como modelo borrador para medir ganancias de latencia en estrategias de self-speculative decoding sobre hardware Apple.
- Estudio de enrutamiento MoE: el modelo permite analizar el equilibrio de carga entre 16 expertos con enrutamiento sigmoide limitado por grupos y sesgo sin perdida auxiliar, en un entorno de recursos limitados.
- Benchmark de tokenizadores y vocabularios: con un BPE de 131.072 tokens y embedding atado, es util para comparar eficiencia de tokenizacion en corpus educativos frente a vocabularios menores.
- Docencia y experimentacion: al caber en 0,2 GB de repositorio y ejecutarse en un portatil, permite demostrar conceptos de modelos recurrentes lineales, atencion latente y MoE sin infraestructura de GPU.
- Base para extension de contexto: dado que generaliza zero-shot hasta 4.096 tokens, sirve para experimentos de extrapolacion de longitud antes de aplicar tecnicas de extension en el modelo mayor.

## Benchmarks y rendimiento

Perdida en conjuntos de evaluacion retenidos:

| Conjunto de evaluacion | Perdida | Perplejidad | Nota |
|---|---|---|---|
| fineweb-edu validation (en dominio) | 4,011 | 55,2 | |
| Ultra-FineWeb test (web, fuente no vista) | 4,122 | 61,7 | brecha de transferencia pequena |
| UltraData-Math test | 4,637 | 103,3 | matematicas nunca vistas en entrenamiento |
| UltraData-Code test | 5,299 | 200,2 | codigo nunca visto en entrenamiento |

Evaluacion zero-shot (1.000 ejemplos por tarea; BLiMP con 938 pares sobre 67 fenomenos; prompts y puntuacion por loglikelihood estilo lm-evaluation-harness con un arnes MLX propio, por lo que la comparacion con otros papers es aproximada):

| Tarea | Precision | Azar |
|---|---|---|
| BLiMP (gramatica) | 72,9% | 50% |
| SciQ | 60,0% | 25% |
| PIQA | 54,6% | 50% |
| ARC-Easy | 39,2% (norm. 36,4%) | 25% |
| LAMBADA (ultima palabra exacta) | 9,8% | 0% |
| HellaSwag | 25,8% (norm. 27,1%) | 25% |
| Winogrande | 50,7% | 50% |

Evolucion de la perdida de validacion durante el entrenamiento:

| Paso | 250 | 1.000 | 2.000 | 3.000 | 4.000 | 5.000 | 6.000 | 6.329 |
|---|---|---|---|---|---|---|---|---|
| Perdida de validacion | 5,847 | 4,828 | 4,547 | 4,435 | 4,380 | 4,333 | 4,094 | 4,0105 |
| Perplejidad de validacion | 346 | 125 | 94 | 84 | 80 | 76 | 60 | 55,2 |

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 48,9M de parametros en fp32 los pesos ocupan aproximadamente 0,2 GB, y en bf16 unos 0,1 GB, por lo que la huella es minima.
- GPU recomendadas: no se documentan; el modelo se entreno en un Apple M4 con 32 GB de memoria unificada y 13,1 GB de pico durante el entrenamiento (no inferencia).
- Cabe en cualquier GPU de consumo actual e incluso en CPU; el repositorio completo ocupa 0,2 GB.
- Opciones de despliegue: al usar `custom_code` y MLX, la via prevista es `transformers` con `trust_remote_code=True`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: el autor reporta 4.000–4.300 tokens/s durante el entrenamiento en el Mac mini M4; no se publican cifras de throughput de inferencia.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos de tamano o categoria similares en la informacion disponible. Como referencia de categoria, se trata de un modelo de menos de 50M de parametros con contexto de 1.024 tokens y licencia MIT, sin ajuste de instrucciones, por lo que no es directamente comparable con modelos pequenos alineados para uso como asistentes.

| Modelo | Parametros | Contexto | Licencia | Ajuste de instrucciones |
|---|---|---|---|---|
| Omoikane-50M-PoC | 48,9M | 1.024 (zero-shot hasta 4.096) | MIT | No |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un asistente: no tiene ajuste de instrucciones ni alineamiento de preferencias, y su conocimiento es muy limitado.
- Las tareas de sentido comun y correferencia (HellaSwag 25,8%, Winogrande 50,7%) estan al nivel del azar, como corresponde a un tronco de 15M de parametros entrenado con 104M tokens.
- LAMBADA con ultima palabra exacta solo alcanza 9,8%, lo que refleja una recuperacion de contexto muy debil.
- Riesgo elevado de alucinacion y de generar texto fluido pero factualmente incorrecto, dado el bajo volumen de entrenamiento y la ausencia de datos de alta calidad curados para hechos.
- Solo soporta ingles; no hay capacidades multilingues.
- El contexto entrenado es de 1.024 tokens; aunque generaliza zero-shot hasta 4.096, no hay garantias de calidad mas alla de esa longitud.
- La licencia MIT permite uso comercial, pero el modelo no es apto para produccion como asistente por su falta de alineamiento y su escaso conocimiento.
- Requiere `trust_remote_code=True` por el codigo personalizado, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegarlo.
- Las evaluaciones se hicieron con un arnes MLX propio, por lo que los numeros no son estrictamente comparables con los de lm-evaluation-harness estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Goekdeniz-Guelmez/Omoikane-50M-PoC
- Dataset de entrenamiento: https://huggingface.co/datasets/mlx-community/fineweb-edu-100K
- Perfil del autor: https://huggingface.co/Goekdeniz-Guelmez
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.

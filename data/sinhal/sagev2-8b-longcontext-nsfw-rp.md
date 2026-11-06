# sinhal/SageV2-8B-LongContext-NSFW-RP

## Resumen

SageV2-8B-LongContext-NSFW-RP es un ajuste fino (fine-tune) del modelo Meta Llama 3.1 8B Instruct, pasado previamente por un proceso de "abliteration" (eliminación de los mecanismos de rechazo) por parte de mlabonne. Lo desarrolla el usuario de Hugging Face sinhal y está orientado específicamente a roleplay conversacional de contexto largo, con énfasis en mantener la coherencia del personaje a lo largo de conversaciones extensas (el autor documenta pruebas de 40 turnos). El modelo se distribuye principalmente en formato GGUF para llama.cpp, lo que facilita su despliegue en hardware de consumo.

La propuesta central del autor es resolver la "deriva de contexto" (context drift): la tendencia de los modelos de rol a reciclar frases, homogeneizar voces de personajes distintos y abandonar los rasgos definidos en la tarjeta de personaje tras varias decenas de turnos. El modelo se presenta como optimizado para 128K tokens de contexto, aunque la model card no documenta la metodología de entrenamiento concreta (número de tokens, composición del dataset ni si hubo DPO/RLHF).

Es relevante para desarrolladores e investigadores interesados en generación creativa sin censura, evaluación de estabilidad conversacional y despliegue local eficiente. No obstante, hay que subrayar que se trata de un modelo "uncensored/abliterated" con contenido NSFW, distribuido bajo la licencia Llama 3.1, y que la mayoría de las métricas publicadas son autoinformadas por el autor sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Meta Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (según la model card; contexto nativo de Llama 3.1) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, Q2_K (GGUF publicados) |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (librería llama.cpp); repo de 23.2 GB |
| Modelo base | mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated |
| Pipeline | text-generation |
| Descargas / likes | 9.783 / 36 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con atención por grupos (GQA) y contexto nativo de 128K tokens. Sobre esa base, mlabonne aplicó abliteration para eliminar las direcciones de activación asociadas al rechazo, y sinhal realizó un ajuste supervisado (SFT) con TRL, según las etiquetas del repositorio (`trl`, `sft`, `unsloth`). No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de preferencia como DPO o RLHF.

La innovación que el autor reivindica no está en la arquitectura sino en el ajuste de comportamiento: reducir la repetición verbatim en conversaciones largas y aumentar la separación estilística entre personajes definidos por tarjeta. La model card documenta metodología de evaluación casera (guiones fijos de 40 turnos, métricas de solapamiento de 6-gramas, Jaccard entre personajes), pero no detalla hiperparámetros de entrenamiento ni datos. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientada a roleplay multi-turno, con énfasis en mantener la voz del personaje en contextos largos.
- Roleplay sin censura: el autor reporta 0 rechazos en 4 prompts de rol adversariales (dato autoinformado).
- Diferenciación estilística entre personajes: la model card muestra variación controlada en longitud de respuesta, exclamaciones y arquetipo según la tarjeta de personaje.
- Estabilidad en conversaciones largas: reducción reportada de solapamiento de 6-gramas del 35,0% al 9,3% en los últimos 10 turnos de un guion de 40.
- Generación de "action beats" (descripciones de acciones entre asteriscos): 100% de las respuestas en la prueba del autor.
- Capacidades heredadas de Llama 3.1 8B Instruct: generación de texto general, razonamiento básico, código y matemáticas elementales (no evaluadas específicamente en este fine-tune).
- Soporte de tool calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- **Roleplay conversacional de larga duración en local**: el modelo está diseñado para sesiones de decenas de turnos con personajes definidos por tarjeta; su ajuste contra la repetición y la deriva lo hace adecuado para aplicaciones de ficción interactiva autoalojadas con llama.cpp.
- **Motores de personajes para juegos narrativos**: la separación estilística medida entre cinco arquetipos (desde un mercenario lacónico de 17 palabras por respuesta hasta un streamer hiperactivo de 143) permite asignar voces distintas a PNJ sin ingeniería de prompts compleja.
- **Prototipado de chatbots de compañía sin censura**: para productos de entretenimiento para adultos donde se requiere evitar rechazos, el modelo ofrece generación sin filtros de seguridad, con la advertencia legal y ética correspondiente.
- **Investigación sobre estabilidad conversacional**: sus métricas de solapamiento de n-gramas y deriva de personaje sirven como caso de estudio para evaluar técnicas de mitigación de repetición en modelos pequeños.
- **Generación creativa asistida en escritura de ficción**: con contexto de 128K tokens, puede mantener tramas y fichas de personaje extensas en memoria, útil para borradores de narrativa serializada.
- **Despliegue en hardware de consumo**: con cuantización Q6_K (6,14 GB) cabe completo en una GPU de 8 GB y alcanza 37,4 t/s en una RTX 4060 Laptop, lo que permite prototipos de bajo coste en estaciones de trabajo modestas.
- **Evaluación de samplers y decodificación**: la model card documenta sensibilidad extrema a `repeat_penalty`, lo que lo convierte en un banco de pruebas útil para estudiar el efecto de parámetros de muestreo en la calidad del rol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas propias de evaluación de roleplay, reproducidas a continuación como datos autoinformados y no verificados de forma independiente:

| Metrica (evaluacion propia del autor) | Antes | Despues |
|---|---|---|
| Reutilización verbatim de frases (40 turnos) | 6 | 2 |
| Solapamiento de 6-gramas, últimos 10 turnos | 35,0% | 9,3% |
| Solapamiento de 6-gramas, primeros 10 turnos | 9,2% | 0,2% |
| Respuestas vacías o truncadas | 0 | 0 |
| Clichés por 1.000 palabras | 4,4 | 2,3 |
| Respuestas con action beats | 88% | 100% |
| Escribe el diálogo del usuario por él | — | 0 / 87 |
| Rechazos en prompts de rol adversariales | — | 0 / 4 |
| Mantiene personaje con entradas `k`, `lol`, `...`, `wat` | — | 10 / 10 |

Rendimiento de inferencia declarado (llama-bench, CUDA, flash attention, batch 2048 / ubatch 512, RTX 4060 Laptop):

| Cuantizacion | Tamano | VRAM 8 GB | Velocidad |
|---|---|---|---|
| Q8_0 | 7,95 GB | parcial (25/32 capas) | 17,1 t/s |
| Q6_K | 6,14 GB | completa (32/32) | 37,4 t/s |
| Q4_K_M | 4,58 GB | completa (32/32) | 48,0 t/s |
| Q2_K | 2,96 GB | completa (32/32) | 61,2 t/s |

## Requisitos de hardware

- **VRAM estimada**: Q2_K ~3 GB, Q4_K_M ~4,6 GB, Q6_K ~6,1 GB, Q8_0 ~8 GB (pesos); añadir espacio para caché KV según longitud de contexto.
- **GPU de consumo**: cabe completo en GPUs de 8 GB (RTX 3060 Ti, 4060, 3070) con Q6_K o inferiores; Q8_0 requiere repartir capas a CPU en 8 GB. Para contexto de 16K o superior se recomienda Q4_K_M para dejar margen de VRAM.
- **GPU profesionales**: A100, H100 o RTX 4090 no son necesarias para este tamaño; permitirían Q8_0 o FP16 con contexto largo completo.
- **Opciones de despliegue**: llama.cpp (`llama-server`) es el soporte principal; también compatible con frontends que consumen GGUF (KoboldCpp, LM Studio, Ollama mediante importación). vLLM y TGI no están documentados para este repo, aunque el modelo base es compatible en teoría.
- **Latencia y throughput**: 37,4 t/s con Q6_K en RTX 4060 Laptop; 48,0 t/s con Q4_K_M; 17,1 t/s con Q8_0 por desbordamiento a CPU. Cifras del autor, no verificadas de forma independiente.
- **Parámetros de muestreo recomendados por el autor**: `repeat_penalty` 1,08 (crítico), `min_p` 0,05, `temperature` 0,95 (0,90 para Q2_K), `top_p` 0,95; DRY con mult 0,8, base 1,75, len 2 si el frontend lo soporta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SageV2-8B-LongContext-NSFW-RP | 8,03B | 128K | Roleplay NSFW, contexto largo | Llama 3.1 | GGUF en HF |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated (base) | 8,03B | 128K | Instruct sin censura, generalista | Llama 3.1 | safetensors y GGUF en HF |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128K | Instruct generalista con alineamiento | Llama 3.1 | safetensors en HF |

No se dispone de datos de benchmarks comparativos verificables entre estos modelos en la información proporcionada; las métricas de la model card son autoinformadas y específicas de roleplay, por lo que no permiten una comparación objetiva con alternativas. Otras familias de modelos de rol de 7-8B (por ejemplo, derivados de Mistral o Qwen) no se detallan aquí por falta de datos en la información disponible.

## Limitaciones y advertencias

- **Contenido NSFW y sin censura**: el modelo ha sido abliterado y ajustado para evitar rechazos; no es apto para menores ni para entornos sin moderación. La etiqueta `not-for-all-audiences` lo indica explícitamente.
- **Idioma**: solo inglés documentado; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- **Sesgos**: hereda los sesgos de Llama 3.1 8B y los amplifica potencialmente al eliminar los mecanismos de rechazo; no hay evaluación de sesgos en la información disponible.
- **Alucinación**: sin datos específicos; en roleplay el riesgo se manifiesta como deriva de personaje e invención de rasgos, precisamente el problema que el autor dice mitigar, pero no hay verificación independiente.
- **Métricas autoinformadas**: todos los resultados de calidad y velocidad provienen del autor, con metodología casera y sin replicación externa.
- **Licencia Llama 3.1**: impone restricciones de uso comercial (política de uso aceptable de Meta, obligación de atribución y de nombrar el modelo como "Llama"), además de límites para empresas con más de 700 millones de usuarios mensuales.
- **Contexto largo**: aunque se anuncia 128K, no se documenta evaluación de recuperación de información (needle-in-a-haystack) a esa longitud; el rendimiento real más allá de 16K no está verificado.
- **Sensibilidad a parámetros**: el autor advierte que con `repeat_penalty` a 1,0 el modelo recicla frases y pierde el personaje; requiere configuración de muestreo cuidadosa en producción.
- **Formato**: solo se distribuyen GGUF; no hay safetensors publicados en este repo, lo que limita el reentrenamiento o la conversión a otros runtimes sin partir del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinhal/SageV2-8B-LongContext-NSFW-RP
- Modelo base (abliterated): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- llama.cpp (runtime principal): https://github.com/ggerganov/llama.cpp
- TRL (entrenamiento SFT): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth

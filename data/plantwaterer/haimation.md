# plantwaterer/haimation

## Resumen

haimation es un ajuste fino completo del modelo multimodal google/gemma-4-31B-it, desarrollado por el usuario plantwaterer y publicado en Hugging Face bajo licencia Apache-2.0. No es un modelo de propósito general: es un sistema especializado en toma de decisiones sobre preguntas de opción múltiple, con un motor de inferencia propio (`haimation:Engine`) que combina el modelo neuronal con un almacén de conocimiento estadístico y un ejecutor de código Python para preguntas numéricas. El modelo parte de plantwaterer/liquamen (a su vez derivado de Gemma 4 31B) y añade dos etapas secuenciales de ajuste fino supervisado.

La relevancia de haimation radica en su enfoque híbrido: en lugar de confiar únicamente en la distribución de probabilidad sobre las letras de las opciones, incorpora un mecanismo de "segunda pasada" que, bajo condiciones estrictas, resuelve preguntas numéricas o binarias mediante un almacén de datos (estadísticas a nivel de país de Our World in Data) o mediante la generación y ejecución de una función Python con aritmética exacta. Este diseño busca reducir errores en preguntas factuales y aritméticas, a costa de un consumo de hardware elevado (62 GB en bf16) y de una latencia variable.

El modelo declara una puntuación pública de 67,44 en el Decision Index 0.3 (autoevaluada, +1,65 sobre liquamen), aunque su envío al board fue retirado y no cuenta con puntuación privada verificada. Su sucesor directo es plantwaterer/eshbar-lulilla, que continúa desde los pesos de haimation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Gemma 4; capas de atención completa bidireccional y capas locales causales de 1.024 tokens; torre de visión congelada |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (capas locales de 1.024 tokens; longitud global no especificada) |
| Tipos de cuantizacion | no disponible (el autor solo documenta bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

haimation es un ajuste fino completo (no LoRA) en dos etapas secuenciales sobre plantwaterer/liquamen, que a su vez deriva de google/gemma-4-31B-it (revisión `842da3794eaa0b77d5f08bae87a17459d91ff475`). La arquitectura conserva el transformer multimodal de Gemma 4 con la torre de visión congelada, capas de atención completa bidireccional y capas locales causales de 1.024 tokens. Se añade una cabeza de última capa propia, reajustada tras el entrenamiento con temperatura T = 1,2984.

La etapa intermedia (`esbar_final_v1`) realizó 1.369 actualizaciones con batch 64, es decir, 87.601 preguntas de decisión. La etapa final (`esbar_final_v2`, la publicada) realizó 1.320 actualizaciones con batch 64, 84.455 preguntas, con `pack_tokens = 8.192` y semilla 0. Se usó AdamW fusionado en fp32 (betas 0,9/0,95, weight decay 0,0, clip 1,0), LR máximo 7,5e-7, 30 pasos de warmup, decaimiento coseno hasta 0,1 del pico, peso de soft-label del modelo padre 0,35 y offsets case-control de Prentice-Pyke en 4.921 filas binarias dispersas. Los datos de entrenamiento incluyen particiones de entrenamiento descontaminadas de CLINC150, BANKING77, GSM8K (7.614 filas) y HoVer (950 filas), además de conjuntos matemáticos (DeepMind Mathematics Dataset, AQuA-RAT, MATH) y los datos heredados de liquamen (ANLI, ACOS).

La innovación principal no está en el entrenamiento sino en el motor de inferencia: atención de documento empaquetada (capas de atención completa bidireccionales dentro de un prompt, capas de ventana deslizante causales), promediado de la respuesta sobre 4 órdenes de opciones para peticiones cortas, softmax sobre los logits de las letras a temperatura ajustada, y una posterior de Laplace integrada para decisiones sí/no. Además, para preguntas numéricas o binarias que no alcanzan un umbral de confianza (0,925 para numéricas, 0,75 para sí/no), el sistema consulta un almacén de conocimiento o genera y ejecuta una función Python en un kernel GPU (con intérprete de respaldo de resultados idénticos).

## Capacidades

- Toma de decisiones sobre preguntas de opción múltiple, con calibración de probabilidad sobre las opciones.
- Decisiones binarias sí/no con posterior de Laplace integrada.
- Respuesta a preguntas numéricas mediante almacén de conocimiento estadístico (datos de país de Our World in Data) o ejecución de código Python con aritmética exacta.
- Generación de texto y conversación (pipeline text-generation, tag conversational).
- Procesamiento de imagen y texto (image-text-to-text), aunque la torre de visión está congelada.
- Razonamiento matemático básico e intermedio (entrenado con GSM8K, MATH, AQuA-RAT y el DeepMind Mathematics Dataset).
- Clasificación de intenciones y dominios (CLINC150, BANKING77).
- Verificación factual (HoVer).
- No se documenta soporte de tool calling, function calling genérico ni modo de razonamiento extendido (thinking mode) más allá del ejecutor interno.

## Casos de uso

- Evaluación automatizada de modelos en benchmarks de opción múltiple: el motor `decision_index` con `haimation:Engine` permite ejecutar suites de preguntas con calibración de probabilidades y comparar contra otros modelos del mismo board.
- Preguntas factuales con respuesta numérica: para consultas del tipo "¿cuál es la tasa de alfabetización de X país?", el almacén integrado devuelve un valor con probabilidad 0,99 si coincide exactamente con una opción, evitando el error de cálculo del modelo.
- Problemas aritméticos de respuesta cerrada: cuando la primera pasada no es concluyente, el modelo genera una función Python que el ejecutor resuelve con aritmética exacta, útil en pipelines de verificación de cálculos.
- Clasificación de intenciones en atención al cliente: el ajuste con CLINC150 y BANKING77 permite asignar consultas a categorías predefinidas con probabilidades calibradas.
- Moderación y decisiones binarias: la posterior de Laplace sobre decisiones sí/no ofrece una salida probabilística adecuada para sistemas que necesitan umbrales de confianza explícitos.
- Investigación sobre calibración y híbridos neuro-simbólicos: el código del motor, la cabeza y el ejecutor están fijados por MD5 en `PINS.json` y verificados al cargar, lo que facilita la reproducibilidad experimental.
- Verificación factual en pipelines de control de calidad: el entrenamiento con HoVer permite comprobar si una afirmación está respaldada por el contexto, con opciones de respuesta binaria o múltiple.

## Benchmarks y rendimiento

| Benchmark | haimation | plantwaterer/liquamen |
|---|---|---|
| Decision Index 0.3 (público, autoevaluado) | 67,44 | 65,79 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La puntuación del Decision Index es autoevaluada y no cuenta con validación en el board privado (envío retirado el 2026-11-17).

## Requisitos de hardware

- VRAM estimada: al menos 75 GB para inferencia en bf16 (pesos de 62 GB).
- GPU recomendada: una RTX PRO 6000 (96 GB) es suficiente; el autor la usa como referencia. No se documenta soporte en A100 (80 GB) ni H100, aunque por capacidad de memoria serían candidatas.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en bf16; no se documentan cuantizaciones alternativas.
- Despliegue: el motor propio `haimation:Engine` se ejecuta en proceso desde el repositorio, con `PYTHONPATH` apuntando al snapshot. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia (una RTX PRO 6000 Blackwell, muestra de 1.000 filas): mediana 312 ms, media 827 ms, p80 964 ms, p95 2.371 ms. La carga del modelo y el warm-up (unos tres minutos) no están incluidos.
- El kernel del ejecutor se distribuye precompilado para sm_75 a sm_120; donde no carga, se usa el intérprete con resultados idénticos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntuación Decision Index 0.3 | Disponibilidad |
|---|---|---|---|---|---|
| haimation | 31,27 B | no disponible | Apache-2.0 | 67,44 (público, autoevaluado) | Hugging Face, 425 descargas |
| plantwaterer/liquamen | no disponible | no disponible | no disponible | 65,79 | Hugging Face (modelo padre) |
| plantwaterer/eshbar-lulilla | no disponible | no disponible | no disponible | no disponible | Hugging Face (sucesor, continúa desde haimation) |
| google/gemma-4-31B-it | 31 B (aproximado) | no disponible | no disponible en la información | no disponible | Hugging Face (modelo base) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría fuera de la familia plantwaterer.

## Limitaciones y advertencias

- La puntuación del Decision Index es autoevaluada y no verificada de forma independiente; el envío al board privado fue retirado.
- El modelo está altamente especializado en preguntas de opción múltiple y decisiones binarias; su rendimiento en generación abierta no está documentado.
- El mecanismo de segunda pasada solo se activa bajo condiciones estrictas (una única pregunta, opciones numéricas o sí/no, confianza por debajo del umbral); en el resto de casos la salida es la de la primera pasada.
- El almacén de conocimiento cubre únicamente estadísticas a nivel de país de Our World in Data, con valores redondeados a tres cifras significativas y reindexados; no es una base de conocimiento general.
- Los datos de entrenamiento incluyen ANLI (CC BY-NC 4.0), lo que puede afectar a la interpretación de la licencia Apache-2.0 declarada sobre los pesos; ACOS no declara licencia upstream.
- El componente `store_table.json` está bajo CC BY-SA 4.0 y contiene datos de V-Dem (CC BY-SA 4.0), lo que impone obligaciones de atribución y compartición si se redistribuye.
- El ejecutor `haimation/xr_runtime/` deriva de LOOM (Apache-2.0, modificado) y requiere conservar su LICENSE y NOTICE.
- Riesgo de alucinación en preguntas fuera del dominio de entrenamiento; no se documentan evaluaciones de sesgo.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del heredado de Gemma 4.
- Requiere una GPU de al menos 75 GB en bf16, lo que excluye el despliegue en hardware de consumo.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue eficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/haimation
- Modelo padre (liquamen): https://huggingface.co/plantwaterer/liquamen
- Modelo sucesor (eshbar-lulilla): https://huggingface.co/plantwaterer/eshbar-lulilla
- Modelo base (Gemma 4 31B IT): https://huggingface.co/google/gemma-4-31B-it
- Kit de evaluación Decision Index: apolinario/decision-index (commit 9eb2dbe2a358004c8782c66e40a83ac07b953fec)
- LOOM (ejecutor derivado): https://github.com/mkturkcan/Loom
- Dataset ANLI: https://huggingface.co/datasets/facebook/anli
- Dataset ACOS: https://github.com/NUSTM/ACOS
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset HoVer: https://github.com/hover-nlp/hover
- DeepMind Mathematics Dataset: https://github.com/google-deepmind/mathematics_dataset
- AQuA-RAT: https://github.com/google-deepmind/AQuA
- Dataset MATH: https://github.com/hendrycks/math
- Our World in Data: https://ourworldindata.org

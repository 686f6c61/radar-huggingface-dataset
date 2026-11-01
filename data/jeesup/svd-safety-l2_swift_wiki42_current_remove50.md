# Jeesup/svd-safety-l2_swift_wiki42_current_remove50

## Resumen

`svd-safety-l2_swift_wiki42_current_remove50` es un checkpoint de investigación publicado por el usuario Jeesup en Hugging Face, derivado de `meta-llama/Llama-2-7b-chat-hf`. Se trata de una versión comprimida del modelo de Meta mediante la técnica Swift-SVD, con un objetivo de eliminación del 50 % de los parámetros, calibrada exclusivamente con 256 secuencias de WikiText de 2048 tokens cada una (seed 42). El propósito del modelo no es el despliegue en producción, sino estudiar cómo la compresión por SVD afecta al equilibrio entre utilidad y seguridad: el propio autor advierte que las mediciones incluidas "no establecen idoneidad para despliegue".

Tras la compresión, el checkpoint se ha plegado a pesos densos estándar de Transformers, por lo que el tamaño de descarga (13,5 GB) no refleja la reducción de parámetros: la ratio de compresión describe un presupuesto de parámetros factorizados, no un fichero más pequeño. La recuperación de calidad se ha realizado con el método SVD-LLM (LoRA secuencial sobre los factores U y V, dos épocas por pasada, sobre datos Alpaca-cleaned), con asignación dinámica de rango usando alpha 0,6. El modelo conserva la arquitectura Llama y la licencia Llama 2, y resulta relevante como referencia para investigadores que evalúan métodos de compresión y su impacto en tasas de ataque (ASR) y sobre-rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder denso, heredado de Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base usa 4096 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en fp16/bf16 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat-hf, un transformer decoder denso de unos 7 mil millones de parámetros optimizado para diálogo. La innovación principal de este checkpoint no está en la arquitectura sino en el proceso de compresión: Swift-SVD aplicado con objetivo de eliminar el 50 % de los parámetros, usando asignación dinámica de rango con alpha 0,6 e importancia de capas calculada sobre WikiText. La calibración se limita a 256 secuencias de WikiText de 2048 tokens con seed 42, sin añadir prompts de JBB ni respuestas de rechazo.

La recuperación de calidad sigue el esquema SVD-LLM: entrenamiento LoRA secuencial primero sobre los factores U y después sobre los factores V, con datos Alpaca-cleaned y dos épocas por pasada de entrenamiento. El resultado final se pliega a pesos densos estándar compatibles con Transformers, de modo que la compresión afecta al presupuesto de parámetros factorizado durante el proceso, no al tamaño del fichero descargable. Los detalles de recuento de parámetros y recuperación se registran en `compression.json` dentro del repositorio.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, aunque degradada por la compresión.
- Evaluación en siete tareas zero-shot: ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA.
- Perplejidad medida en WikiText-2 completo (14,7161).
- Evaluación de seguridad: XSTest-safe y OR-Bench (sobre-rechazo, juzgado por WildGuard) y AdvBench y StrongREJECT (ataques, juzgados por HarmBench).
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio.
- El modelo es un artefacto de investigación: sus capacidades se orientan a medir utilidad y seguridad bajo compresión, no a uso general.

## Casos de uso

- Investigacion en compresion de LLMs: sirve como baseline de código actual ("current-code baseline") para comparar métodos de compresión SVD con eliminación del 50 % de parámetros bajo calibración mínima.
- Estudio del impacto de la compresion en seguridad: permite analizar cómo la compresión modifica la tasa de éxito de ataques (AdvBench, StrongREJECT) y el sobre-rechazo (XSTest, OR-Bench) respecto al modelo base.
- Evaluacion de metodos de recuperacion: al usar recuperación LoRA secuencial sobre factores U/V, es útil para comparar estrategias de post-entrenamiento tras SVD.
- Benchmarking de perplejidad bajo compresion: con WikiText-2 completo evaluado, permite comparar degradación lingüística frente a otros checkpoints comprimidos.
- Reproduccion de experimentos: el repositorio incluye generaciones por prompt, registros de jueces y logs zero-shot en `utility/` y `safety/`, útil para auditar la fiabilidad de los jueces de evaluación.
- Investigacion en asignacion de rango: la configuración con alpha 0,6 e importancia de capas basada en WikiText ofrece un punto de partida para estudiar estrategias de rank allocation dinámico.

## Benchmarks y rendimiento

Resultados publicados en la model card (límite de generación de 512 tokens, sin límites de muestra en smoke tests):

| Metric | Value |
|---|---:|
| WikiText-2 perplexity | 14,7161 |
| AdvBench ASR (HarmBench) | 0,415385 |
| StrongREJECT ASR (HarmBench) | 0,313099 |
| Macro over-refusal (WildGuard) | 0,144268 |

No se han publicado en la model card los resultados numéricos de las siete tareas zero-shot (ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA), aunque el autor indica que los logs de evaluación están disponibles en los directorios `utility/` y `safety/` del repositorio. Tampoco se incluyen comparaciones directas con el modelo base ni con otros métodos de compresión.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 13,5 GB en safetensors, por lo que se estima una necesidad de alrededor de 14-16 GB de VRAM en precisión completa (fp16/bf16), más margen para la caché de KV.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 de 40 GB son suficientes para inferencia en precisión completa; no se requieren H100 al tratarse de un modelo de 7B.
- Consumer GPUs: cabe en una RTX 3090 o RTX 4090 de 24 GB sin cuantizar. Con cuantización de 4 bits (no distribuida oficialmente, pero posible vía GGUF o bitsandbytes) cabría en GPUs de 8-10 GB, aunque no hay versiones cuantizadas publicadas.
- Opciones de despliegue: al ser pesos densos estándar compatibles con Transformers, funciona con llama.cpp (tras conversión a GGUF), Ollama, vLLM, TGI y los Inference Endpoints de Hugging Face (el repo está marcado como `endpoints_compatible`).
- Latencia y throughput: no disponible; no se han publicado mediciones de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_swift_wiki42_current_remove50 | 6,74 B (denso tras plegado) | no disponible | llama2 | Checkpoint de investigación, comprimido con Swift-SVD al 50 %, no apto para despliegue |
| meta-llama/Llama-2-7b-chat-hf (base) | ~7 B | 4096 tokens | llama2 | Modelo original sin comprimir; referencia de utilidad y seguridad |
| TheBloke/Llama-2-7B-Chat-GGUF y similares | ~7 B | 4096 tokens | llama2 | Alternativas cuantizadas orientadas a despliegue real, no a investigación en compresión |

No hay disponibles checkpoints comparables publicados con el mismo método (Swift-SVD al 50 % con la misma calibración) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte explicitamente que las mediciones no establecen idoneidad para despliegue: es un checkpoint de investigación, no un modelo de producción.
- Tasa de ataque elevada: el ASR en AdvBench es 0,415385 y en StrongREJECT 0,313099 (juzgado por HarmBench), lo que indica una degradación sustancial de los salvaguardas de seguridad respecto a lo esperable en el modelo base.
- Sobre-rechazo del 14,43 % (macro, WildGuard), lo que sugiere que el modelo rechaza peticiones benignas con cierta frecuencia.
- La compresión con calibración mínima (solo WikiText) probablemente degrada la calidad general; la perplejidad de 14,7161 en WikiText-2 debe compararse con el modelo base para valorar la pérdida.
- Sesgos: no disponible; no se han publicado evaluaciones de sesgo específicas, aunque hereda los sesgos conocidos de Llama 2 y de los datos Alpaca-cleaned usados en la recuperación.
- Licencia Llama 2: su uso comercial está sujeto a la Llama 2 Community License, incluida la política de uso aceptable y las restricciones para entidades con más de 700 millones de usuarios activos mensuales.
- El tamaño de descarga (13,5 GB) no refleja la compresión: el checkpoint está plegado a pesos densos estándar, por lo que no hay ahorro de almacenamiento ni de memoria en inferencia.
- StrongREJECT se evalúa con el juez de HarmBench y no con su scorer nativo, lo que puede afectar la comparabilidad de resultados con otras publicaciones.
- Riesgo de alucinación: no disponible de forma específica, pero debe asumirse al menos igual o superior al del modelo base dada la compresión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_swift_wiki42_current_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Swift-SVD: no disponible en la información proporcionada
- Paper de SVD-LLM: no disponible en la información proporcionada
- Demos o repositorios adicionales: no disponibles en la información proporcionada

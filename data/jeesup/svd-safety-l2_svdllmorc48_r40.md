# Jeesup/svd-safety-l2_svdllmorc48_r40

## Resumen

`Jeesup/svd-safety-l2_svdllmorc48_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 40 % de los parámetros densos, dejando un 59,98 % de los originales (0,5998 de fracción paramétrica). Tras la compresión se aplicó una recuperación de etapa 2 mediante LoRA secuencial (U y luego V) sobre alpaca-cleaned. El resultado es un modelo de 6.738.415.616 parámetros almacenados en safetensors, con un repositorio de 13,5 GB.

El interés del checkpoint no es su calidad como asistente, sino su papel como artefacto experimental: forma parte de una rejilla de estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. En concreto, este brazo usa un conjunto de calibración mixto (utilidad + seguridad) con un 4,67 % de posiciones dedicadas a seguridad, y reporta métricas de ataque exitoso (ASR) y de sobre-rechazo medidas con jueces automáticos.

Es relevante ahora porque cuantifica de forma explícita el compromiso entre utilidad y seguridad bajo compresión: las métricas publicadas (ASR de 0,0077 en AdvBench y 0,0160 en StrongREJECT, perplejidad de 11,33 en WikiText-2 y 0,4932 de precisión media zero-shot en 7 tareas) permiten comparar reglas de selección y presupuestos dentro de la misma familia. El autor advierte que no es un modelo de chat de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 (59,98 % de los parámetros densos del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Llama-2-7b-chat soporta 4096 tokens; el cutoff de entrenamiento LoRA fue 256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es el transformer decoder-only de Llama-2-7b-chat. Sobre él se aplica la descomposición en valores singulares con blanqueado del método SVD-LLM (implementación de AIoT-MLSys-Lab/SVD-LLM), calculada sobre un conjunto de calibración agrupado cuya matriz de covarianza es S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreo del propio SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 48 de los 157 prompts de OR-Bench-hard-1k (tóxicos aparentes pero benignos) junto con las respuestas conformes del propio Llama-2-7b-chat, en orden de semilla 42, con una conversación por muestra desempaquetada (25.612 posiciones). La cuota efectiva de seguridad es de 0,0467 de las posiciones.

Tras eliminar el 40,00 % de los parámetros se ejecuta la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V), sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global del experimento es 42. No se documentan en la información disponible datos de RLHF o DPO adicionales más allá de los ya presentes en el checkpoint base.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en inglés (idioma del base y del dataset de recuperación alpaca-cleaned); el resto de idiomas no está documentado.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información proporcionada.
- No se documenta modo thinking, visión ni audio.
- Capacidad medida de rechazo de peticiones dañinas: ASR de 0,0077 en AdvBench y 0,0160 en StrongREJECT, ambos con el juez HarmBench.
- Capacidad medida de no sobre-rechazar: 0,4701 de sobre-rechazo macro según WildGuard.

## Casos de uso

- Estudio de compresión de modelos: sirve como celda experimental para medir cómo varía la perplejidad en WikiText-2 (11,3294 en este checkpoint) al cambiar la regla de selección de componentes o el presupuesto de parámetros.
- Evaluación de seguridad bajo compresión: permite reproducir el cálculo de ASR en AdvBench y StrongREJECT con el juez HarmBench y comparar el efecto de incluir o no ejemplos de seguridad en el conjunto de calibración.
- Análisis de sobre-rechazo: con la métrica macro de WildGuard (0,4701) se puede estudiar si la recuperación con LoRA sobre alpaca-cleaned incrementa los rechazos indebidos en prompts benignos.
- Investigación en interpretabilidad: al ser una descomposición SVD explícita, los factores U y V y su recuperación LoRA permiten analizar qué subespacios de pesos concentran el comportamiento de seguridad.
- Reproducción de pipelines de compresión: el checkpoint documenta semilla, sampler, número de ventanas y composición exacta del calibrado, lo que facilita replicar el experimento con la implementación de SVD-LLM.
- Docencia y divulgación técnica: como ejemplo didáctico de compromiso utilidad-seguridad en modelos comprimidos, con métricas verificables y procedencia completa.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0077 |
| StrongREJECT ASR (juez HarmBench) | 0,0160 |
| Sobre-rechazo macro (WildGuard) | 0,4701 |
| Perplejidad WikiText-2 | 11,3294 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4932 |

No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones directas con otros brazos de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB de VRAM resultan justos y 24 GB son recomendables.
- En cuantización de 8 bits, el peso se reduce a unos 6,7 GB; en 4 bits, a unos 3,4 GB, aunque no se documentan recetas de cuantización específicas para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo con 24 GB en bf16 y en GPU de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión de formato, no documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmorc48_r40 | 6.738.415.616 (59,98 % del denso) | no disponible | Llama 2 Community | ASR AdvBench 0,0077; perplejidad WikiText-2 11,3294; sobre-rechazo 0,4701 |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4096 tokens | Llama 2 Community | Referencia de utilidad y seguridad; el autor indica que la compresión sola eleva el ASR |
| Otros brazos de la rejilla del mismo estudio | variable según presupuesto | no disponible | Llama 2 Community | No se dispone de sus métricas en la información proporcionada |
| SVD-LLM sobre Llama-2-7b (implementación AIoT-MLSys-Lab) | variable | no disponible | según base | Método de compresión empleado; sin métricas de seguridad publicadas en esta ficha |

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación y no como asistente desplegable; varios brazos de la rejilla están deliberadamente degradados en seguridad respecto al base.
- La compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint incluye calibración de seguridad, pero el equilibrio exacto debe evaluarse de forma independiente.
- El sobre-rechazo macro de 0,4701 es elevado y puede degradar la experiencia en aplicaciones conversacionales reales.
- La perplejidad en WikiText-2 de 11,3294 y la precisión media zero-shot de 0,4932 indican una pérdida de utilidad respecto al modelo denso, cuyo valor no se detalla en la información disponible.
- Riesgo de alucinación no cuantificado en la información proporcionada; es esperable un aumento respecto al base por la eliminación de componentes.
- Idiomas soportados no documentados; el calibrado y la recuperación LoRA usan corpus en inglés (WikiText-2, OR-Bench, alpaca-cleaned).
- Longitud de contexto efectiva no documentada; el cutoff de la recuperación LoRA fue de 256 tokens.
- Uso comercial sujeto a la Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; se deben respetar las restricciones de la licencia y la política de uso de Meta.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria ni resultados de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmorc48_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/

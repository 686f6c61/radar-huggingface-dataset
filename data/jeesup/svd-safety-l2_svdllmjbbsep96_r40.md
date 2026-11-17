# Jeesup/svd-safety-l2_svdllmjbbsep96_r40

## Resumen

`svd-safety-l2_svdllmjbbsep96_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta conservar el 59,98 % de los parámetros densos originales (40 % de parámetros eliminados) y posteriormente recuperado con una etapa de LoRA secuencial sobre U y V. Lo publica el usuario Jeesup como artefacto de investigación para estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

El checkpoint es una celda concreta de una rejilla experimental que barre reglas de selección y presupuestos de compresión. La calibración combina un conjunto de utilidad (WikiText-2) con uno de seguridad (96 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-2-7b-chat), de modo que la fracción efectiva de posiciones dedicadas a seguridad es solo 0,0464. El resultado es un modelo de 6.738.415.616 parámetros en safetensors (13,5 GB de repositorio) con licencia Llama 2 Community License.

Su relevancia es metodológica: cuantifica el compromiso entre utilidad (perplejidad en WikiText-2 de 11,1977, exactitud media zero-shot de 0,4869 en 7 tareas) y seguridad (ASR de 0,0000 en AdvBench y 0,0128 en StrongREJECT con el juez HarmBench, pero sobre-rechazo macro de 0,5601 según WildGuard). Debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA etapa 2 |
| Parámetros totales | 6.738.415.616 (fracción 0,5998 del denso original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat; no especificada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Llama 2 de 7B parámetros en su variante chat. La compresión aplica el SVD blanqueado de SVD-LLM (implementación de AIoT-MLSys-Lab/SVD-LLM) sobre una única matriz de calibración agregada, S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, que mezcla señales de utilidad y de seguridad. Se elimina el 40,00 % de los parámetros, dejando una fracción de 0,5998. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 96 de 96 objetivos de JailbreakBench con los rechazos del propio Llama-2-7b-chat (orden con semilla 42), una conversación por muestra, desempaquetada, con 25.433 posiciones evaluadas.

Tras la compresión se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64, cutoff de 256 tokens y precisión bf16, entrenado sobre `alpaca-cleaned`. La innovación metodológica no está en la arquitectura sino en el protocolo: una calibración conjunta utilidad+seguridad con una cuota de seguridad explícita (4,64 % de las posiciones) y una rejilla de reglas de selección de componentes para medir la reparación del comportamiento de rechazo tras la compresión.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, condicionada por la compresión y la recuperación LoRA.
- Rechazo de peticiones dañinas medido con AdvBench (ASR 0,0000) y StrongREJECT (ASR 0,0128) bajo el juez HarmBench.
- Respuesta a instrucciones de tipo Alpaca tras el ajuste LoRA sobre `alpaca-cleaned`.
- Razonamiento zero-shot en 7 tareas de evaluación (exactitud media 0,4869, con acc_norm donde se reporta).
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión SVD: usar este checkpoint como celda de referencia (40 % de parámetros eliminados, regla de selección con calibración pooled utilidad+seguridad) para comparar frente a otras celdas de la rejilla y aislar el efecto de la regla de selección.
- Medición del daño en seguridad por compresión: evaluar ASR con AdvBench y StrongREJECT bajo HarmBench para cuantificar cuánto sube la tasa de éxito de ataque al eliminar parámetros, usando este modelo como punto de la curva.
- Estudio del sobre-rechazo: el valor de 0,5601 en sobre-rechazo macro (WildGuard) permite analizar el coste en utilidad conversacional de las estrategias de calibración orientadas a seguridad.
- Análisis del compromiso utilidad-seguridad: combinar perplejidad en WikiText-2 (11,1977) y exactitud zero-shot media (0,4869) con las métricas de seguridad para trazar frentes de Pareto entre celdas de la rejilla.
- Reproducibilidad de pipelines SVD-LLM: servir de ejemplo verificable de la etapa 1 (SVD blanqueado con calibración pooled) y etapa 2 (LoRA secuencial U→V con los hiperparámetros documentados) para replicar el protocolo.
- Auditoría de artefactos derivados de Llama 2: emplear el checkpoint para probar herramientas de evaluación de seguridad y de detección de regresiones antes de aplicar compresión a modelos en producción.
- Docencia sobre interpretabilidad y compresión: ilustrar cómo una fracción pequeña de posiciones de calibración (4,64 %) puede alterar el comportamiento de rechazo de un modelo alineado.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0000 |
| StrongREJECT ASR (juez HarmBench) | 0,0128 |
| Sobre-rechazo macro (WildGuard) | 0,5601 |
| Perplejidad WikiText-2 | 11,1977 |
| Exactitud media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4869 |

No se han publicado en la información disponible comparaciones directas con Llama-2-7b-chat sin comprimir ni con otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB (no se publican variantes cuantizadas oficiales; habría que generarlas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/A6000 (24 GB) también viables en bf16 con batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con batch y contexto reducidos; en GPUs de 8-12 GB requeriría cuantización a 4/8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados para este checkpoint y requerirían conversión a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep96_r40 (este) | 6.738.415.616 (0,5998 del denso) | no disponible | Llama 2 Community License | Comprimido con SVD-LLM, calibración pooled utilidad+seguridad, recuperación LoRA |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | 4096 tokens (modelo base) | Llama 2 Community License | Referencia sin comprimir; la model card no reporta métricas comparativas directas |
| Otras celdas de la rejilla del mismo estudio | variable según presupuesto | no disponible | Llama 2 Community License | No se publican resultados agregados en la información disponible |
| Modelos de 7B comprimidos por otras técnicas (p. ej., poda o cuantización) | variable | no disponible | variable | No se dispone de comparación numérica en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card advierte que no es un modelo conversacional de propósito general y que debe evaluarse antes de extraer conclusiones.
- Varias celdas de la rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque. Este checkpoint concreto reporta ASR muy bajo en AdvBench y StrongREJECT, pero con un sobre-rechazo macro de 0,5601, lo que indica un sesgo fuerte hacia el rechazo.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión y la recuperación LoRA sobre `alpaca-cleaned` pueden alterar la fidelidad factual respecto al modelo base.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe equivalente al de Llama-2-7b-chat.
- La calibración de seguridad cubre solo 96 objetivos de JailbreakBench (25.433 posiciones, 4,64 % del total), por lo que la cobertura de comportamientos dañinos es limitada y no debe interpretarse como una garantía de seguridad.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las obligaciones de atribución ("Built with Llama 2").
- No se documentan cuantizaciones oficiales ni recetas de despliegue en vLLM, llama.cpp u Ollama; cualquier conversión a GGUF corre por cuenta del usuario.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep96_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM citada: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de recuperación LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned (referencia del nombre `alpaca-cleaned`)
- WikiText-2: https://huggingface.co/datasets/wikitext
- JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- AdvBench: https://github.com/llm-attacks/llm-attacks
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- HarmBench: https://github.com/centerforaisafety/HarmBench
- WildGuard: https://huggingface.co/allenai/wildguard
- Licencia Llama 2: https://ai.meta.com/llama/license/

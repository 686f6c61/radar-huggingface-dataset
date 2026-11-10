# Jeesup/svd-safety-l2_kfacmixsep24_r40

## Resumen

`svd-safety-l2_kfacmixsep24_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en Hugging Face. No es un modelo conversacional de propósito general, sino una celda concreta de un estudio sistemático sobre cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. El checkpoint se comprime con SVD blanqueado por K-FAC agrupado (calibración conjunta de utilidad y seguridad en un único K-FAC) hasta el 60,0 % de los parámetros densos, y después se recupera con el LoRA de segunda etapa de SVD-LLM.

El modelo mantiene la arquitectura transformer decoder-only de Llama 2 (6.738.415.616 parámetros tras la compresión, frente a los 6.738.415.616 del original, es decir, una fracción resultante de 0,5998) y conserva el tokenizador y la ventana de contexto de 4096 tokens de Llama-2-7b-chat. Su interés no reside en el rendimiento bruto sino en que documenta métricas de seguridad (ASR en AdvBench y StrongREJECT, sobre-rechazo macro en WildGuard) junto a métricas de utilidad (perplejidad en WikiText-2 y precisión zero-shot en 7 tareas), lo que permite cuantificar el compromiso entre ambas bajo compresión.

Es relevante ahora porque la compresión de modelos es una vía habitual para reducir costes de inferencia, y este artefacto demuestra empíricamente que comprimir sin calibrar la seguridad incrementa la tasa de éxito de ataques. El autor advierte explícitamente de que varias celdas de la rejilla están «deliberadamente degradadas en seguridad» respecto a Llama-2-7b-chat, por lo que el checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD |
| Parámetros totales | 6.738.415.616 (fracción 0,5998 del denso) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se indica modificación) |
| Tipos de cuantización | No disponible (el repo publica safetensors en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | No disponible en la información proporcionada (heredados de Llama 2: principalmente inglés) |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repo) |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura base es la de Llama-2-7b-chat: transformer decoder-only con atención causal, RMSNorm y SwiGLU. Sobre esa base se aplica una compresión por SVD blanqueado con K-FAC agrupado, donde la matriz de Fisher se estima como F = A ⊗ G sobre un único conjunto de calibración que mezcla utilidad y seguridad (`run_safety_fisher.py`, lam = 0). La asignación de rangos por matriz sigue el presupuesto de SVD-LLM. El conjunto de calibración es `wikitext2:256,jbb_harm_resp_sep:24`: por la parte de utilidad, 255 ventanas de 2048 tokens del train de WikiText-2 (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones; por la parte de seguridad, 24 objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat, una conversación por muestra (6406 posiciones, 5797 tokens de respuesta), con la pérdida calculada solo sobre el rechazo. La pérdida de G es token-sum (G derivada del NLL sumado dividido entre 2047), de modo que cada token de pérdida pesa lo mismo; la cuota efectiva de seguridad es 0,0110 de los tokens de pérdida y 0,0121 de las posiciones.

Tras la compresión se aplica la recuperación de segunda etapa de SVD-LLM: LoRA secuencial (primero U, luego V) con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16, sobre el dataset alpaca-cleaned. La semilla global del experimento es 42. No se documentan en la información disponible detalles sobre RLHF o DPO adicionales más allá de los ya presentes en el checkpoint base de Llama-2-7b-chat.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-2-7b-chat, con la calidad degradada esperable tras eliminar el 40 % de los parámetros.
- Razonamiento y respuesta a instrucciones de complejidad media, sujeto a la pérdida de fidelidad introducida por la compresión y la recuperación LoRA.
- Capacidad de rechazo de peticiones dañinas, objeto central del estudio: el checkpoint conserva un comportamiento de seguridad medible (ASR de 0,0288 en AdvBench y 0,0895 en StrongREJECT con juez HarmBench), aunque el autor advierte de que la compresión por sí sola eleva la tasa de éxito de ataques.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base Llama-2-7b-chat no está optimizado para ello.
- Capacidades multilingües: no documentadas; el calibrado y el ajuste LoRA se realizan sobre datos en inglés (WikiText-2, JailbreakBench, alpaca-cleaned).
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como celda de referencia en una rejilla experimental para medir cómo distintas reglas de selección de componentes y presupuestos de compresión afectan al ASR y a la utilidad, comparando con las demás celdas del estudio.
- Evaluación de robustez frente a jailbreaks: ejecutar AdvBench, StrongREJECT y WildGuard sobre este checkpoint para reproducir las métricas publicadas (ASR 0,0288; ASR 0,0895; sobre-rechazo macro 0,2401) y contrastarlas con las del modelo denso original.
- Estudio del equilibrio utilidad-seguridad: analizar la perplejidad en WikiText-2 (9,9501) y la precisión zero-shot media en 7 tareas (0,4851) frente a las métricas de seguridad para trazar la frontera de Pareto de la compresión.
- Validación de pipelines de compresión SVD: servir como caso de prueba reproducible (semilla 42, calibración documentada) para verificar implementaciones de SVD blanqueado por K-FAC y del LoRA de segunda etapa de SVD-LLM.
- Análisis de sobre-rechazo: emplear la métrica WildGuard (0,2401) para estudiar si la calibración conjunta de utilidad y seguridad introduce rechazos excesivos en peticiones benignas.
- Docencia y divulgación técnica: ilustrar con un artefacto real y medido los riesgos de desplegar modelos comprimidos sin reevaluar su comportamiento de seguridad.
- Inferencia ligera en investigación: aprovechar la reducción al 60 % de parámetros para experimentar en entornos con menos VRAM que el modelo denso, siempre con fines de estudio y no de producción.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0288 |
| StrongREJECT ASR (juez HarmBench) | 0,0895 |
| Sobre-rechazo macro (WildGuard) | 0,2401 |
| Perplejidad en WikiText-2 | 9,9501 |
| Precisión zero-shot media (7 tareas, acc_norm donde se reporta) | 0,4851 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estas mismas métricas, ni desglose por tarea de la precisión zero-shot.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 13,5 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; con contexto largo se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación por lotes y contexto completo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza (no se ofrecen pesos GGUF en el repo).
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep24_r40 | 6,74 B (60 % del denso) | 4096 | Llama 2 Community | Artefacto de investigación, ASR AdvBench 0,0288, PPL WikiText-2 9,9501 |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 | Llama 2 Community | Modelo base sin comprimir; referencia directa del estudio |
| Otras celdas de la rejilla del mismo autor | 6,74 B (distintas fracciones) | 4096 | Llama 2 Community | Variantes con distintas reglas de selección y presupuestos; no disponibles en esta información |

No se dispone en la información proporcionada de comparaciones con modelos de compresión alternativos (por ejemplo, destilados o podados de Llama 2) ni de sus métricas en los mismos benchmarks.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint es un sujeto experimental, no un asistente desplegable.
- Riesgo de alucinación y pérdida de fidelidad por la eliminación del 40 % de los parámetros y la recuperación LoRA limitada (r=8, 2 épocas sobre alpaca-cleaned).
- El calibrado de seguridad usa solo 24 objetivos de JailbreakBench (cuota efectiva del 1,1 % de los tokens de pérdida), por lo que la cobertura de comportamientos dañinos es estrecha.
- Sobre-rechazo macro de 0,2401 en WildGuard: el modelo rechaza una fracción notable de peticiones benignas.
- Idiomas: no documentados; el entrenamiento y la calibración son en inglés, por lo que el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a la política de uso aceptable de Meta.
- Sin descargas ni likes en el momento de la consulta y sin versiones cuantizadas publicadas, lo que limita su adopción práctica fuera de entornos de investigación con GPU de gama alta.
- No se documentan capacidades de tool calling, agentes ni multilingüismo, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep24_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- SVD-LLM (método de compresión y recuperación LoRA referenciado): no disponible en la información proporcionada
- JailbreakBench (conjunto de calibración de seguridad): no disponible en la información proporcionada
- HarmBench (juez de las métricas ASR): no disponible en la información proporcionada
- WildGuard (métrica de sobre-rechazo): no disponible en la información proporcionada

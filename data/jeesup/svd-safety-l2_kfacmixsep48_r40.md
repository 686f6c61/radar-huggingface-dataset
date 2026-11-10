# Jeesup/svd-safety-l2_kfacmixsep48_r40

## Resumen

`svd-safety-l2_kfacmixsep48_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. No se trata de un modelo conversacional de propósito general, sino de una celda concreta dentro de un grid experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. El checkpoint conserva el 60,0 % de los parámetros densos del modelo original (se elimina un 40,00 %), aplicando una SVD blanqueada por K-FAC agrupada que combina calibración de utilidad y de seguridad en un único estimador de Fisher.

La arquitectura subyacente es la de Llama 2 7B Chat: un transformer decoder-only con 6.738.415.616 parámetros en total según los pesos safetensors del repositorio. La innovación no está en la arquitectura, sino en el procedimiento de compresión: se calcula una matriz de Fisher `F = A ⊗ G` sobre un conjunto de calibración mixto (WikiText-2 para utilidad y 48 objetivos de JailbreakBench para seguridad) y se aplica una SVD blanqueada por matriz con un presupuesto de rango por capa. Posteriormente se recupera calidad con un LoRA de segunda etapa de SVD-LLM (r=8, alpha=16, 2 épocas sobre alpaca-cleaned).

Es relevante ahora porque cuantifica empíricamente el coste de seguridad de las técnicas de compresión de modelos: la compresión por sí sola eleva la tasa de éxito de ataques, y este artefacto sirve para medir esa degradación y probar mecanismos de recuperación. El autor advierte explícitamente que algunas celdas del grid están deliberadamente degradadas en seguridad y que ningún checkpoint debe desplegarse como asistente sin evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2 7B Chat, no declarada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. Sobre esa base se aplica una compresión por SVD blanqueada por K-FAC agrupada: se estima una única matriz de Fisher `F = A ⊗ G` sobre un conjunto de calibración agrupado (script `run_safety_fisher.py`, `lam = 0`) y se usa para blanquear la SVD de cada matriz de pesos, con un presupuesto de rango por matriz al estilo de SVD-LLM. El presupuesto resultante elimina el 40,00 % de los parámetros, dejando una fracción de 0,5998.

La calibración combina dos fuentes: utilidad, con WikiText-2 train (255 ventanas de 2048 tokens, muestreador de SVD-LLM, semilla 42, todas las posiciones); y seguridad, con 48 objetivos de JailbreakBench emparejados con las negativas del propio Llama-2-7b-chat (una conversación por muestra, 12.817 posiciones y 11.584 tokens de respuesta, con la pérdida calculada solo sobre la negativa). La pérdida `G` se agrega por suma de tokens (NLL sumada dividida entre 2047), de modo que cada token de pérdida pesa lo mismo; la cuota efectiva de seguridad es del 2,17 % de los tokens de pérdida y del 2,40 % de las posiciones. Tras la compresión se aplica una recuperación de segunda etapa con LoRA de SVD-LLM (U y luego V de forma secuencial, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). La semilla global es 42.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de chat de Llama-2-7b-chat, aunque degradada por la compresión y por el LoRA de recuperación.
- Razonamiento y respuesta a instrucciones: el ajuste LoRA sobre alpaca-cleaned busca preservar la utilidad general del checkpoint comprimido.
- Comportamiento de rechazo ante peticiones dañinas: el checkpoint está calibrado explícitamente para modular la tasa de rechazo, con métricas de ASR y sobre-rechazo publicadas.
- Tool calling / function calling: no declarado en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado; no disponible.
- Capacidades multilingües: no declaradas; no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso como sujeto experimental: la capacidad principal de este artefacto es servir como celda medible en un estudio de compromiso seguridad/utilidad bajo compresión.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como una celda del grid para comparar reglas de selección de componentes y presupuestos de compresión frente a las métricas de ASR y perplejidad publicadas.
- Auditoría de degradación de seguridad: medir con AdvBench y StrongREJECT la tasa de éxito de ataques de este checkpoint y contrastarla con la del Llama-2-7b-chat sin comprimir para cuantificar el daño introducido por la SVD.
- Estudio del sobre-rechazo: emplear la métrica de sobre-rechazo macro (WildGuard, 0,3412) para analizar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Reproducción de experimentos: reejecutar el pipeline (`run_safety_fisher.py`, SVD-LLM, LoRA de recuperación) con la semilla 42 y el conjunto de calibración documentado para validar los resultados publicados.
- Evaluación comparativa de métodos de recuperación: contrastar la recuperación LoRA de segunda etapa de SVD-LLM con alternativas sobre el mismo checkpoint comprimido, midiendo perplejidad en WikiText-2 y precisión zero-shot.
- Docencia y formación en interpretabilidad: usar el artefacto como ejemplo práctico de cómo una perturbación controlada en los pesos afecta a comportamientos de alto nivel como el rechazo.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0135 |
| StrongREJECT ASR (juez HarmBench) | 0,0735 |
| Sobre-rechazo macro (WildGuard) | 0,3412 |
| Perplejidad en WikiText-2 | 9,9032 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4846 |

No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones directas con otros checkpoints del grid.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; el repositorio ocupa 13,5 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, aproximadamente 3,5-4 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servicio en precisión completa; RTX 4090 (24 GB) suficiente para bf16 en una sola GPU.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización de 4-8 bits, siempre que se genere el formato cuantizado (no se distribuye en el repo).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama requerirían conversión a GGUF, no incluida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep48_r40 | 6.738.415.616 (~60 % del denso) | no disponible | Llama 2 Community | Checkpoint comprimido de investigación, calibrado para seguridad |
| meta-llama/Llama-2-7b-chat-hf | ~6.738 M (7B denso) | 4.096 tokens (modelo base) | Llama 2 Community | Modelo original sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid del mismo autor | variable según presupuesto | no disponible | Llama 2 Community | Reglas de selección y presupuestos alternativos; algunas deliberadamente degradadas en seguridad |

No se dispone de datos comparativos de rendimiento frente a estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y advierte de que no debe tratarse como asistente desplegable.
- Degradación de seguridad inducida por la compresión: la compresión por sí sola eleva la tasa de éxito de ataques; algunas celdas del grid están deliberadamente degradadas y este checkpoint debe evaluarse antes de extraer conclusiones.
- Sobre-rechazo elevado: la métrica macro de WildGuard (0,3412) indica una tasa apreciable de rechazos indebidos que afecta a la utilidad conversacional.
- Riesgo de alucinación: no cuantificado en la model card; inherente a la base Llama 2 y potencialmente agravado por la compresión.
- Idiomas y longitud de contexto: no declarados para este checkpoint; deben asumirse los del modelo base, sin garantía tras la compresión.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a las obligaciones de atribución ("Built with Llama 2").
- Reproducibilidad: los resultados dependen de la semilla 42, del conjunto de calibración exacto y de los scripts del autor; desviaciones en el pipeline pueden alterar las métricas.
- Sin datos de benchmarks por tarea ni de latencia/throughput, lo que limita la evaluación de su idoneidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep48_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (método de compresión y recuperación LoRA): no disponible en la información proporcionada
- JailbreakBench (conjunto de calibración de seguridad): no disponible en la información proporcionada
- AdvBench, StrongREJECT, WildGuard, HarmBench (métricas y jueces): no disponibles en la información proporcionada

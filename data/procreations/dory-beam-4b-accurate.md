# ProCreations/Dory-Beam-4B-Accurate

## Resumen

Dory-Beam-4B-Accurate es un ajuste fino de investigación creado por ProCreations a partir de NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16, un transformer con bucles recurrentes (looped transformer) de unos 3.975 millones de parámetros. El modelo se ha destilado a partir de las trazas de razonamiento de Beam-1.0-501B-A23B de Reflection, y su objetivo es resolver un problema concreto: reducir drásticamente la verbosidad del razonamiento del modelo base sin perder precisión en benchmarks de matemáticas y ciencia.

La técnica central es una interpolación de pesos entre el modelo base y el ajuste fino (70% base, 30% fine-tune), seguida de una re-normalización sobre la hiperesfera de nGPT. El resultado escribe 1,8 veces menos tokens que el modelo base manteniendo la precisión dentro del margen estadístico, y bajo presupuestos de tokens de razonamiento limitados resulta incluso más preciso. Es relevante como demostración de que la distilación de razonamiento puede comprimir la "cadena de pensamiento" latente de modelos con arquitecturas recurrentes.

Existe una variante hermana, Dory-Beam-4B (50/50), más eficiente pero con pérdida de precisión en AIME; esta versión "Accurate" es la opción recomendada cuando la exactitud es prioritaria. Solo está disponible en inglés y soporta hasta 64k tokens de contexto en inferencia con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (transformer recurrente con bucles de cómputo, basado en Dory1.0 de NVIDIA) |
| Parametros totales | 3.975.229.440 (≈4B) |
| Parametros activos | no disponible (no es MoE; el cómputo varía según el número de bucles recurrentes, 2 o 4) |
| Longitud de contexto | 65.536 tokens (configuración recomendada con vLLM; hasta 64k tokens de salida en evaluación) |
| Tipos de cuantizacion | GGUF Q5_K_M y Q8_0 (en ProCreations/Dory-Beam-4B-GGUF); pesos originales en BF16 |
| Idiomas soportados | Inglés |
| Licencia | OpenMDW-1.1 (heredada de Dory1.0-4B) |
| Formato de pesos | safetensors (repo de 8,0 GB); GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de Dory1.0-4B, un transformer con bucles recurrentes (looped transformer) que ejecuta el mismo bloque de capas varias veces (2 o 4 "loops"), aumentando el cómputo por token sin aumentar el número de parámetros. Esta arquitectura se combina con razonamiento latente (latent reasoning), donde parte del razonamiento ocurre en el espacio latente antes de emitir tokens.

El proceso de creación tuvo dos etapas. Primero, un SFT de parámetros completos sobre 52.660 trazas de razonamiento verificadas de Beam-1.0-501B-A23B (modelo de Reflection, pesos Apache-2.0), con `reasoning_effort=medium` y número de bucles muestreado por paso (dataset ProCreations/Beam-Reasoning-Traces). Este fine-tune aislado razona 2-3,5 veces más corto pero pierde 7-10 puntos en AIME. Segundo, se interpolan linealmente los pesos entre base y fine-tune con `merge_dory.py --t 0.3` (70% base, 30% fine-tune) y se re-normaliza sobre la hiperesfera de nGPT, lo que permite ajustar continuamente el compromiso entre brevedad y precisión. No se menciona RLHF ni DPO.

## Capacidades

- Razonamiento matemático y científico de alto nivel: GPQA-Diamond, MATH-500, AIME 2024/2025 y AMC 2023 con resultados cercanos o superiores al modelo base.
- Generación de texto conversacional (pipeline text-generation, chat template heredado del modelo base).
- Razonamiento eficiente: produce respuestas con 1,8 veces menos tokens de salida que el modelo base a igualdad de precisión.
- Control del cómputo por número de bucles: 2 bucles como configuración por defecto, 4 bucles cuando se prioriza la precisión máxima.
- Rendimiento superior bajo presupuestos de tokens de razonamiento limitados (mejora de +2,7 a +7,0 puntos frente al base con presupuestos de 2k a 16k tokens).
- Sin soporte evaluado de tool calling ni de uso de contexto largo (no evaluado por el autor).
- Sin modo de visión ni audio; solo texto.
- No incluye ajuste de `reasoning_effort` (a esta ratio de mezcla los niveles de esfuerzo no tienen efecto diferenciado).

## Casos de uso

- Resolución de problemas de matemáticas competitivas: puede abordar problemas de nivel AIME/AMC con trazas de razonamiento más cortas, reduciendo coste de inferencia en evaluaciones masivas de problemas.
- Generación de soluciones STEM verificables: al entrenarse sobre trazas verificadas, es adecuado para pipelines que necesitan respuestas razonadas en física, química y matemáticas universitarias (nivel GPQA-Diamond).
- Razonamiento con presupuesto de tokens acotado: en entornos con límites de coste por consulta, supera al modelo base con presupuestos de 2k-16k tokens de pensamiento, ideal para APIs con límites de salida.
- Despliegue en GPU de consumo: con las cuantizaciones GGUF Q5_K_M/Q8_0 puede ejecutarse localmente en llama.cpp para asistentes matemáticos personales.
- Servicios de inferencia con vLLM: la configuración recomendada con prefix caching y parser de razonamiento `nemotron_v3` lo hace apto para servir chatbots de razonamiento con alta eficiencia de caché.
- Investigación sobre razonamiento latente y modelos recurrentes: el repositorio incluye código de entrenamiento, merge y evaluación reproducible (`audit_eval.py`), útil como base para experimentos de destilación de razonamiento.
- Reducción de coste de cómputo en benchmarks: al usar la mitad de tokens que el base con 4 bucles que el base con 2, permite evaluaciones académicas más baratas con precisión equivalente.

## Benchmarks y rendimiento

Precisión (%) y tokens medios de salida por respuesta, según la model card del autor:

| Model | Loops | GPQA-Diamond | MATH-500 | AIME 2024 | AIME 2025 | AMC 2023 | Held-out |
|---|---|---|---|---|---|---|---|
| Dory1.0-4B (base) | 2 | 72,5 · 14,3k | 98,4 · 3,7k | 91,2 · 13,5k | 92,1 · 15,7k | 100,0 · 4,8k | 79,0 · 9,4k |
| Dory-Beam-4B-Accurate | 2 | 74,7 · 7,4k | 97,6 · 1,9k | 92,1 · 7,9k | 89,2 · 9,6k | 98,8 · 2,8k | 80,0 · 4,8k |
| Dory1.0-4B (base) | 4 | 74,5 · 13,8k | 98,6 · 3,5k | 92,9 · 12,6k | 93,8 · 14,9k | 99,4 · 4,5k | 79,0 · 8,9k |
| Dory-Beam-4B-Accurate | 4 | 75,0 · 7,1k | 98,0 · 1,7k | 93,8 · 7,5k | 92,1 · 9,3k | 99,4 · 2,7k | 81,7 · 4,5k |

Precisión bajo presupuesto de tokens de razonamiento (1.836 muestras, 2 bucles):

| Budget | Accurate | Base Dory | Gap (IC 95%) |
|---|---|---|---|
| 2k | 65,2 | 58,2 | +7,0 (+4,8 a +9,1) |
| 4k | 75,5 | 68,7 | +6,8 (+4,4 a +9,2) |
| 8k | 83,0 | 78,7 | +4,2 (+2,5 a +6,1) |
| 16k | 86,7 | 83,9 | +2,7 (+0,9 a +4,7) |

Código (EvalPlus, pass@1, 4 muestras, 2 bucles): HumanEval+ 90,4 frente a 92,7 del base (−2,3); MBPP+ 77,7 frente a 78,0 (−0,3), con un 58% menos de tokens. Configuración de evaluación: vLLM, temperatura 1,0, top-p 0,95, hasta 64k tokens de salida, GPQA ×2, AIME ×8, AMC ×4 muestras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo en BF16 ocupa 8,0 GB, por lo que en precisión completa se necesita al menos ~8-10 GB de VRAM, más la caché KV para 64k de contexto.
- GPU recomendadas: no disponible oficialmente; por tamaño y consumo, una RTX 4090 (24 GB) es suficiente para BF16 con contexto moderado, y GPUs tipo A100/H100 para servir con contexto completo de 64k y concurrencia.
- Consumer GPU: sí, cabe en una RTX 4090 en BF16 y en GPUs de 8-12 GB con las cuantizaciones GGUF Q5_K_M o Q8_0 vía llama.cpp.
- Opciones de despliegue: vLLM (recomendado, requiere PR #60149, con `--hf-overrides '{"n_recurrent_loops": 2, "recurrent_kv_cache_mode": "per_loop"}'` y `--reasoning-parser nemotron_v3`), llama.cpp (GGUF) y probablemente Ollama vía GGUF; también hay demo ZeroGPU en HuggingFace Spaces.
- Latencia y throughput: no disponibles; el ahorro de 1,8 veces en tokens de salida reduce proporcionalmente el tiempo de generación en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Nota |
|---|---|---|---|---|---|
| Dory-Beam-4B-Accurate | ≈4B | Looped transformer | 64k | OpenMDW-1.1 | 1,8× menos tokens, precisión igual al base |
| Dory-Beam-4B (hermano 50/50) | ≈4B | Looped transformer | 64k | OpenMDW-1.1 | 2,3× menos tokens, −7 puntos en AIME 2025; soporta `reasoning_effort` |
| NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 (base) | ≈4B | Looped transformer | 64k | OpenMDW-1.1 | Mayor verbosidad; mejor en HumanEval+ (92,7 vs 90,4) |

Como referencia de categoría (razonamiento matemático compacto), compite conceptualmente con modelos como Qwen3-4B (thinking), aunque no hay benchmarks comparativos directos publicados entre ambos: no disponible.

## Limitaciones y advertencias

- Rendimiento en código ligeramente inferior al modelo base: −2,3 puntos en HumanEval+ (IC 95% −4,6 a −0,2), por estar entrenado solo con datos de matemáticas y ciencia.
- Tool calling y uso de contexto largo no evaluados por el autor; no se garantiza funcionamiento en agentes o function calling.
- Solo inglés; no hay soporte multilingüe ni para castellano.
- No incluye ajuste de `reasoning_effort`: si se necesita controlar el esfuerzo de razonamiento, usar Dory-Beam-4B en su lugar.
- En 2 bucles, AIME 2025 muestra una caída de −2,9 puntos (IC −6,7 a +0,8) y AMC 2023 es limítrofe (−1,2); en 4 bucles, AIME 2025 cae −1,7 (IC −7,1 a +3,8). No hay pérdida estadísticamente significativa, pero existe cierta variabilidad en tareas muy difíciles.
- Como todo modelo de lenguaje, puede alucinar; el razonamiento matemático está verificado sobre los datasets de evaluación, pero no hay garantías generales de corrección.
- Licencia OpenMDW-1.1: revisar términos en https://openmdw.ai/license/1-1/ antes de uso comercial; el modelo base es © NVIDIA y los datos de entrenamiento se generaron con Beam-1.0-501B-A23B (Apache-2.0).
- Requiere vLLM con un PR específico (#60149) para soportar los bucles recurrentes, lo que puede complicar el despliegue con versiones estables.

## Enlaces

- Modelo: https://huggingface.co/ProCreations/Dory-Beam-4B-Accurate
- Modelo hermano (eficiencia): https://huggingface.co/ProCreations/Dory-Beam-4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/ProCreations/Beam-Reasoning-Traces
- Cuantizaciones GGUF: https://huggingface.co/ProCreations/Dory-Beam-4B-GGUF
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/ProCreations/Dory-Beam-4B-live
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- PR de vLLM con soporte de bucles: https://github.com/vllm-project/vllm/pull/60149

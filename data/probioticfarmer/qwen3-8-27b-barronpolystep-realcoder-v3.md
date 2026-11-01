# ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-RealCoder-v3

## Resumen

Qwen3.8-27B-BarronPolyStep-RealCoder-v3 es un adaptador LoRA (PEFT) publicado por el usuario ProbioticFarmer sobre el modelo base Qwen/Qwen3.8-27B, orientado a generación de código y razonamiento matemático. El adaptador incorpora dos correcciones numéricas del softmax (denominadas "fix_1" y "fix_2" en la model card, referenciadas al preprint arXiv:2610.31642) junto con un procedimiento de optimización sin retropropagación llamado PolyStep, que según el autor utiliza 128 vértices antitéticos por paso y no requiere gradientes.

El modelo se distribuye como adaptador de 256 tensores LoRA en bfloat16 con rango r=16 y alpha=32, lo que ocupa aproximadamente 0,9 GB en el repositorio. El autor también publica una versión fusionada independiente de 27B en bfloat16 y otro adaptador de 64 capas (UltraCoder-v2). La propuesta técnica se centra en la interpretabilidad mecanicista: el autor analiza la cascada de subespacios nulos y ortogonales en las 64 capas del modelo base (48 de atención lineal GatedDeltaNet y 16 de atención completa).

La relevancia del modelo es discutible y debe evaluarse con cautela: las cifras de benchmarks son declaradas por el autor, no verificadas de forma independiente (el propio model-index marca `verified: false`), y el repositorio tiene un volumen muy bajo de descargas (196) y cero likes. No hay información sobre idiomas soportados ni sobre el proceso de entrenamiento más allá de las afirmaciones técnicas de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (48 capas GatedDeltaNet de atención lineal + 16 capas de atención completa), según la model card del adaptador |
| Parametros totales | 27B (modelo base Qwen3.8-27B); adaptador LoRA de 256 tensores |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en bfloat16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un transformer híbrido que combina 48 capas de atención lineal GatedDeltaNet con 16 capas de atención completa, y un vocabulario de 248.320 tokens. El adaptador LoRA tiene rango 16 y alpha 32, con 256 tensores en bfloat16 y dimensiones declaradas de [16, 17408], [16, 6144] y [5120, 16]. Los módulos activos citados incluyen `layers.63.mlp.down_proj`, `layers.63.self_attn.o_proj` y `layers.62.linear_attn.out_proj`.

El método de ajuste, PolyStep, se describe como una optimización de orden cero (zeroth-order) sin retropropagación: el autor afirma 0 pasadas backward y 36 segundos de optimización en una GPU Metal de Apple M4 Max. La model card menciona dos correcciones de underflow del softmax (log1p y expm1 sobre la suma de exponenciales) y una cascada de subespacios nulos/ortogonales evaluada en las 64 capas. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla el proceso de verificación en NVIDIA A100-SXM4-80GB más allá de la afirmación de que se ejecutaron los benchmarks en bfloat16.

## Capacidades

- Generación de código: el adaptador está orientado explícitamente a code generation, con mejoras declaradas en HumanEval+, MBPP+ y BigCodeBench-Hard.
- Razonamiento matemático: la model card reporta resultados en MATH-500 nivel 4/5 con tool-integrated reasoning (TIR).
- Razonamiento multi-paso: el autor describe un protocolo "PolyStep" con 288 slots y 72 tareas, orientado a la selección de candidatos en decodificación autoregresiva.
- Interpretabilidad mecanicista: análisis de subespacios nulos y ortogonales por capa, con métricas de norma de Frobenius y ángulos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en producción: el adaptador puede integrarse sobre Qwen3.8-27B para tareas de autocompletado y síntesis de funciones, con un pass@1 declarado de 75,61 en HumanEval y 73,54 en MBPP. Adecuado para pipelines donde ya se dispone del modelo base y se quiere un ajuste ligero de 0,9 GB.
- Asistencia a la resolución de problemas matemáticos: con un 93,33% declarado en MATH-500 nivel 4/5 usando TIR, puede emplearse en entornos educativos o de verificación simbólica donde se combine el modelo con un intérprete de Python.
- Investigación en interpretabilidad: el adaptador y los análisis por capa permiten estudiar cómo afectan las correcciones de softmax y la cascada de subespacios a la representación interna, útil para grupos que trabajan en mecanicismo.
- Evaluación comparativa de técnicas de ajuste sin gradientes: PolyStep como alternativa a LoRA estándar con retropropagación; útil para experimentos académicos sobre optimización de orden cero.
- Prototipado rápido en hardware de consumo: al ser un adaptador de 0,9 GB sobre un base de 27B, puede cargarse en estaciones con suficiente VRAM o memoria unificada (el autor cita un Apple M4 Max de 128 GB) para pruebas locales.
- Benchmarking de código en CI: los scripts de evaluación con EvalPlus (HumanEval+, MBPP+) y BigCodeBench-Hard pueden incorporarse a pipelines de evaluación continua para medir regresiones del adaptador frente al base.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente; el model-index marca `verified: false`):

| Benchmark | Métrica | Resultado | Base declarado | Ganancia |
|---|---|---|---|---|
| HumanEval+ (Base) | pass@1 | 75,61 | 74,39 (implícito, +1,22%) | +1,22% |
| HumanEval+ (80x Strict) | pass@1 | 71,34 | 66,46 (implícito, +4,88%) | +4,88% |
| MBPP+ (Base) | pass@1 | 73,54 | 72,48 (implícito, +1,06%) | +1,06% |
| MBPP+ (35x Strict) | pass@1 | 60,58 | 59,79 (implícito, +0,79%) | +0,79% |
| BigCodeBench-Hard | pass@1 | 23,65 | 20,95 | +2,70% |
| MATH-500 (nivel 4/5, TIR) | accuracy | 93,33 | 73,33 | +20,00% |

El autor también reporta métricas internas no estándar: PolyStep-288 con 288/288 slots (100%) frente a 245/288 (85,07%) del base, y "hard_25_live" con 92-96% frente a 28% del base. Estas cifras no corresponden a benchmarks públicos reconocidos y deben tratarse con escepticismo.

## Requisitos de hardware

- VRAM estimada para el adaptador: ~0,9 GB adicionales sobre el modelo base.
- VRAM para el modelo base en bfloat16: aproximadamente 54 GB (27B × 2 bytes), más overhead de activaciones y KV cache.
- GPU recomendadas: NVIDIA A100-SXM4-80GB (citada por el autor), H100 80GB; en cuantización de 4 bits el base podría caber en GPUs de 24 GB (RTX 4090) con margen limitado, aunque no se documenta soporte oficial de cuantización para este adaptador.
- Memoria unificada: el autor cita Apple M4 Max con 128 GB.
- Opciones de despliegue: PEFT sobre transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-BarronPolyStep-RealCoder-v3 | 27B (base) + LoRA | No disponible | Apache 2.0 | safetensors (PEFT) | Adaptador de autor individual, benchmarks no verificados |
| Qwen/Qwen3.8-27B (base) | 27B | No disponible | Apache 2.0 (según base) | safetensors | Modelo de referencia sin ajuste |
| Qwen3.8-27B-BarronPolyStep-Merged | 27B | No disponible | Apache 2.0 | safetensors (bf16, 11 shards) | Versión fusionada del mismo autor |
| Qwen3.8-27B-BarronPolyStep-64Layer-UltraCoder-v2 | 27B (base) + LoRA | No disponible | Apache 2.0 | safetensors (PEFT) | Otro adaptador del mismo autor |

No se dispone de información sobre modelos comparables de otros autores con características equivalentes en la documentación proporcionada.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; el model-index los marca explícitamente como `verified: false`.
- El repositorio tiene un volumen muy bajo de adopción (196 descargas, 0 likes), lo que limita la evidencia de robustez en producción.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas.
- No se especifica la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- El método PolyStep y las correcciones de softmax se presentan con notación matemática densa pero sin detalles reproducibles sobre el dataset de entrenamiento o el procedimiento exacto.
- Las métricas internas ("PolyStep-288", "hard_25_live") no corresponden a benchmarks públicos estándar y no son comparables con resultados de terceros.
- La licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un modelo base, deben respetarse también las condiciones del modelo base Qwen3.8-27B.
- El autor cita verificación en A100 y M4 Max, pero no se aportan scripts reproducibles ni logs de evaluación en la información disponible.
- Algunas afirmaciones de la model card (por ejemplo, "0 backward passes" y "36 s de optimización") resultan difíciles de conciliar con un ajuste efectivo de 256 tensores sobre un modelo de 27B; conviene tratarlas como afirmaciones no contrastadas.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-RealCoder-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión fusionada: https://huggingface.co/ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-Merged
- Adaptador 64 capas UltraCoder-v2: https://huggingface.co/ProbioticFarmer/Qwen3.8-27B-BarronPolyStep-64Layer-UltraCoder-v2
- Preprint citado: https://arxiv.org/abs/2610.31642
- BigCode Models Leaderboard (PR #104): https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard/discussions/104
- BigCodeBench Official Results (PR #2): https://huggingface.co/datasets/bigcode/bigcodebench-results/discussions/2
- Open LLM Leaderboard (PR #113): https://huggingface.co/datasets/open-llm-leaderboard/requests/discussions/113

# jesusluque/qwen3.5-35b-topiary-stream

## Resumen

`qwen3.5-35b-topiary-stream` es un artefacto de servicio (servable artifact) desarrollado por jesusluque que permite ejecutar el modelo MoE Qwen/Qwen3.5-35B-A3B en hardware Apple Silicon con solo 24 GB de memoria unificada. El checkpoint cuantizado a 4 bits ocupa 19,5 GB y no cabe completo en memoria, por lo que el autor ha desarrollado un runtime propio llamado Topiary Stream que divide cada experto en planos de bits (bit planes) y utiliza memmaps paginados para servir el modelo con un pico de memoria de 12,5–13,9 GB.

La solución no requiere kernels personalizados de Metal: es Python puro sobre los kernels estándar de MLX. El runtime gestiona un pool de expertos con una política de gobernanza (gate-governed pool) que garantiza un suelo de calidad y un gobernador de memoria elástico opcional. El artefacto está pensado para entornos donde el modelo completo no cabe en VRAM y se necesita una alternativa funcional sin sacrificar demasiada calidad.

El modelo base, Qwen3.5-35B-A3B, es una arquitectura Mixture-of-Experts con 35 mil millones de parámetros totales y 3 mil millones activos por token, publicada por Alibaba bajo licencia Apache-2.0. Este artefacto cuantizado y particionado mantiene la licencia original y se distribuye en formato MLX (safetensors).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5-35B-A3B |
| Parametros totales | 35B (modelo base); 3.406.064.768 (pesos cuantizados en safetensors) |
| Parametros activos | 3B (A3B, activados por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bit planes, particionado en P0/P1) |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con memmaps paginados para P1 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un transformer sparse MoE con 35B parámetros totales y 3B activos por token. La arquitectura MoE permite que solo una fracción de la red se active en cada paso de generación, reduciendo el coste computacional por token sin reducir la capacidad total del modelo. El checkpoint original se publicó bajo Apache-2.0 y forma parte de la familia Qwen 3.5 de Alibaba, que incluye variantes desde 0.8B hasta 397B-A17B.

El artefacto `topiary-stream` no modifica los pesos del modelo base, sino que los reorganiza en planos de bits (bit planes) mediante un script de división determinista (`split.py --layout resident-p0`). Cada experto se divide en un plano P0 (residente en el checkpoint) y un plano P1 (completado en memmaps paginados). La aritmética de planos se verifica exacta (error 2.6e-7, orden de acumulación float) contra los kernels estándar de MLX en el CI del repositorio. El runtime sirve el prefill de forma exacta (la unión P1 del prompt se lee una vez desde los memmaps) y la política de pool gobierna únicamente el decode.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5-35B-A3B es un modelo de propósito general; este artefacto conserva sus capacidades, medidas en benchmarks como MMLU (83.0%) y LAMBADA (75.4%).
- Generación de código: HumanEval 92% (23/25) y MBPP 78% (n=100) en modo greedy, lo que indica una capacidad sólida para tareas de programación.
- Matemáticas: GSM8K 92% (46/50) y MATH-500 60% (n=100), con buen rendimiento en razonamiento matemático.
- Capacidades multilingües: no especificadas en la documentación del artefacto; se heredan del modelo base, pero no se detallan.
- Tool calling / function calling: no se menciona en la documentación del artefacto; no disponible.
- Soporte para agentes y multi-step reasoning: no se menciona explícitamente; el rendimiento en benchmarks de razonamiento sugiere capacidad para tareas de varios pasos, pero no está documentado.
- Modo thinking / visión / audio: no disponible; el artefacto es exclusivamente de texto.

## Casos de uso

- Desarrollo local de aplicaciones de IA en Apple Silicon: permite ejecutar un modelo MoE de 35B en un Mac con 24 GB de memoria unificada, algo inviable con el checkpoint completo. Ideal para prototipado y pruebas sin acceso a GPUs dedicadas.
- Generación de código asistida en entornos sin GPU: con HumanEval 92%, puede integrarse en editores o CLIs para autocompletado y generación de funciones, siempre que se acepte la latencia de 44–47 tok/s.
- Razonamiento matemático y resolución de problemas: con GSM8K 92% y MATH-500 60%, es adecuado para asistentes de estudio, tutoría automatizada o herramientas de cálculo simbólico asistido.
- Evaluación de modelos en hardware limitado: el runtime permite medir el rendimiento real de un modelo grande en memoria restringida, útil para investigación sobre cuantización y particionado de MoE.
- Servicio de inferencia en memoria compartida: el gobernador de memoria elástico permite ajustar el uso de RAM dinámicamente, lo que facilita ejecutar el modelo junto a otras aplicaciones en el mismo equipo.
- Benchmarking de calidad frente a modelos nativos más pequeños: el autor reporta una mejora de PPL en WikiText de 7.11–7.83 frente a 10.27 del mejor modelo que cabe nativamente, lo que lo hace útil para comparativas de calidad en entornos con restricciones de memoria.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación provienen de las mediciones del autor en un Apple M5 Pro con 24 GB de memoria unificada, reportadas en la model card. Se indica el tamaño de muestra cuando está disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| HumanEval (greedy) | 92% (23/25) | n=25; diferencias ≤2 ítems indistinguibles bajo McNemar exacto |
| GSM8K (greedy) | 92% (46/50) | n=50; misma salvedad que HumanEval |
| MATH-500 | 60% | n=100 |
| MBPP | 78% | n=100 |
| MMLU | 83.0% | n=500 |
| LAMBADA | 75.4% | n=500 |
| WikiText PPL | 7.11–7.83 | frente a 10.27 del mejor modelo que cabe nativamente |
| Prefill exacto (n=15) | 14/15 y 15/15 | TF PPL 2.3614/7.0583 = base |
| Control exact-pager (τ=0) | PPL 2.3614 vs 2.3623 | sin diferencia medible frente al modelo base |
| Punto de operación τ=0.10 | +0.9% code / +0.6% wiki PPL | degradación mínima |

El autor advierte que, con n=25/50, diferencias de ≤2 ítems son estadísticamente indistinguibles, por lo que los resultados de 92/92 deben interpretarse como "indistinguibles del mejor modelo que cabe", no como una prueba de igualdad.

## Requisitos de hardware

- VRAM estimada: 12,5–13,9 GB de pico de memoria servida (frente a 19,5 GB del checkpoint completo, que no es servible en 24 GB).
- GPU recomendada: Apple Silicon con 24 GB de memoria unificada (probado en Apple M5 Pro). No se reportan pruebas en otras plataformas.
- Compatibilidad con GPU de consumo: no aplica; el runtime está diseñado para MLX en Apple Silicon. No se menciona soporte CUDA o ROCm.
- Opciones de despliegue: requiere el runtime Topiary Stream (`python src/serve.py --artifact jesusluque/qwen3.5-35b-topiary-stream --pool-k 32 --governor`). No es compatible con `mlx_lm` estándar ni con vLLM, llama.cpp u Ollama.
- Latencia y throughput: 44–47 tok/s sostenidos en decode (K=64–32); 47.2 tok/s mediana en un escenario de 3 rondas intercaladas de 1024 tokens tras reinicio limpio, sin swap.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B | 3B | no disponible | Apache-2.0 | safetensors | Modelo original sin particionar; requiere >24 GB para 4-bit |
| qwen3.5-35b-topiary-stream | 35B (3.4B cuantizados) | 3B | no disponible | Apache-2.0 | safetensors + memmaps | Particionado en bit planes; sirve en 24 GB con runtime propio |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | Apache-2.0 | safetensors | Alternativa densa más pequeña; cabe en 24 GB sin particionar |

La comparativa se limita a modelos de la misma familia Qwen 3.5. No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El artefacto NO carga con `mlx_lm` estándar; requiere el runtime Topiary Stream, que es una dependencia adicional no empaquetada en PyPI (solo disponible en el repositorio GitHub del autor).
- El rendimiento reportado se midió en un Apple M5 Pro con 24 GB; no hay garantías de resultados equivalentes en otros chips de Apple Silicon o configuraciones de memoria.
- Las diferencias de ≤2 ítems en benchmarks con n=25/50 son estadísticamente indistinguibles; los resultados de 92% en HumanEval y GSM8K no demuestran igualdad con el mejor modelo que cabe nativamente.
- El runtime sirve el prefill de forma exacta, pero la política de pool gobierna solo el decode; antes de una corrección, el prefill forzado por el profesor medía +6–11% de PPL.
- No se documentan sesgos, riesgos de alucinación o limitaciones de idioma específicos de este artefacto; se heredan del modelo base Qwen3.5-35B-A3B, que no se detallan en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el runtime Topiary Stream es un proyecto independiente cuyo estado de licencia no se especifica en la documentación del artefacto.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/jesusluque/qwen3.5-35b-topiary-stream
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repositorio del runtime Topiary Stream: https://github.com/jesusluque/topiary-stream
- Guía técnica de Qwen 3.5 (Local AI Guide): https://localclaw.io/blog/qwen35-deep-dive
- Guía de la serie Qwen3.5 2026: https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Guía de Qwen 3.5 a 3.8 (Codersera): https://codersera.com/blog/qwen-3-5-complete-guide-2026/
- Guía completa de Qwen 3.5 (Substack): https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks

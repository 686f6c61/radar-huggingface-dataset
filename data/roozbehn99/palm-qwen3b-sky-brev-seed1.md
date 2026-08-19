# roozbehn99/palm-qwen3b-sky-brev-seed1

## Resumen

El repositorio `roozbehn99/palm-qwen3b-sky-brev-seed1` contiene un portafolio de 13 políticas de lenguaje, todas ellas fine-tuned con GRPO a partir del modelo base `Qwen/Qwen2.5-3B-Instruct`. El trabajo, firmado por el autor roozbehn99, implementa el algoritmo PALM (Portfolio Alignment with Linear Multi-objective) sobre un simplex de dos objetivos: utilidad (helpfulness) medida por el reward model Skywork/Skywork-Reward-Llama-3.1-8B y brevedad (brevity) medida por una recompensa verificable. Cada subcarpeta (`idx0` a `idx12`) contiene una política completa con un vector de pesos distinto que pondera ambos objetivos.

El modelo es un artefacto de investigación para estudios de alineación multiobjetivo y poda de portafolios, no un producto listo para producción. No está ajustado para seguridad más allá de lo que ofrece el modelo base y su uso previsto es exclusivamente experimental. La relevancia actual radica en que aborda el problema de cómo entrenar un conjunto de políticas que cubran de forma eficiente el frente de Pareto entre objetivos en conflicto, algo cada vez más importante en el desarrollo de LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) |
| Parametros totales | 3 mil millones (por política, 13 políticas en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen2.5-3B-Instruct, no especificada en la documentación) |
| Tipos de cuantizacion | bf16 (formato nativo de los pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | transformers (bf16), almacenado en subcarpetas por política |

## Arquitectura y entrenamiento

Cada política es un fine-tune completo (full-parameter) de `Qwen/Qwen2.5-3B-Instruct` mediante GRPO (Group Relative Policy Optimization) con una recompensa escalarizada `r = w1*R1 + w2*R2`, donde `R1` es la recompensa de utilidad del reward model Skywork y `R2` es una recompensa verificable de brevedad. Los pesos `(w1, w2)` se toman de los 13 puntos generados por el Algoritmo 1 del paper PALM con parámetros ε=0.4 y δ=0.2 sobre el simplex 2-objetivo.

El entrenamiento se realizó sobre los datasets `allenai/RLVR-GSM` y `allenai/RLVR-MATH` (train) y se evaluó en el test de `allenai/RLVR-GSM` (1.319 prompts). Se usaron 40.000 episodios (208 pasos de optimizador), learning rate 5e-7, batch efectivo de 4×4 con 4 muestras por prompt, longitud de respuesta máxima de 256 tokens y coeficiente KL β=0.05 frente a la política de referencia. Las recompensas se normalizaron min-max a [0,1] durante el entrenamiento. El hardware empleado fue 4× NVIDIA A100-80GB o 4× H100.

## Capacidades

- Generación de texto autoregresiva en lenguaje natural, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento matemático básico y resolución de problemas de GSM y MATH, ya que el entrenamiento se realizó sobre RLVR-GSM y RLVR-MATH.
- Ajuste de comportamiento según el vector de pesos: políticas con mayor `w_help` priorizan respuestas útiles y detalladas; políticas con mayor `w_brev` generan respuestas más cortas y concisas.
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio. Es un modelo puramente textual.
- Capacidades multilingües no especificadas, aunque el modelo base Qwen2.5 soporta múltiples idiomas; no se ha evaluado en esta variante.

## Casos de uso

- Investigación en alineación multiobjetivo: permite estudiar cómo varía el equilibrio entre utilidad y brevedad a lo largo del frente de Pareto y qué políticas dominan en cada región.
- Experimentos de poda de portafolios: con 13 políticas se puede evaluar qué subconjunto mínimo mantiene un rendimiento aceptable en ambos objetivos, reduciendo costes de despliegue.
- Análisis de robustez entre semillas: al existir repositorios hermanos con otras semillas (seed2, etc.), se pueden comparar efectos de la inicialización aleatoria en el entrenamiento multiobjetivo.
- Benchmark de métodos de recompensa: el uso de un reward model externo (Skywork) frente a una recompensa verificable permite comparar la influencia de cada tipo de señal en el comportamiento final.
- Estudio de trade-offs en generación de respuestas: útil para analizar cómo la brevedad afecta a la calidad percibida en tareas de razonamiento matemático.
- Desarrollo de técnicas de calibración de recompensas: los ficheros de estadísticas de calibración incluidos pueden servir como referencia para normalizar recompensas heterogéneas en otros proyectos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación post-hoc sobre el test RLVR-GSM (1.319 prompts, muestreo con T=0.7, 256 tokens máximos). Las métricas R1 (utilidad) y R2 (brevedad) están normalizadas min-max en [0,1]; KL es la divergencia KL acumulada respecto al modelo de referencia. No se reportan benchmarks estándar como MMLU, HumanEval o GSM8K.

| subfolder | w_help | w_brev | R1 (help) | R2 (brev) | KL |
|---|---|---|---|---|---|
| `idx0` | 1.000 | 0.000 | 0.808 | 0.180 | 0.65 |
| `idx1` | 0.833 | 0.167 | 0.834 | 0.222 | 0.83 |
| `idx2` | 0.781 | 0.219 | 0.828 | 0.245 | 0.89 |
| `idx3` | 0.718 | 0.282 | 0.830 | 0.275 | 1.32 |
| `idx4` | 0.646 | 0.354 | 0.835 | 0.314 | 1.78 |
| `idx5` | 0.566 | 0.434 | 0.819 | 0.337 | 2.31 |
| `idx6` | 0.500 | 0.500 | 0.801 | 0.346 | 2.35 |
| `idx7` | 0.000 | 1.000 | 0.699 | 0.430 | 5.46 |
| `idx8` | 0.167 | 0.833 | 0.726 | 0.428 | 5.25 |
| `idx9` | 0.219 | 0.781 | 0.729 | 0.422 | 5.28 |
| `idx10` | 0.282 | 0.718 | – | – | – |
| `idx11` | 0.354 | 0.646 | – | – | – |
| `idx12` | 0.434 | 0.566 | – | – | – |

Los valores faltantes para idx10-12 no se han publicado en la model card.

## Requisitos de hardware

- Inferencia de una sola política (3B parámetros en bf16): ocupa aproximadamente 6 GB de VRAM, por lo que cabe en GPUs de consumo con 8 GB o más (p. ej., RTX 3060, RTX 4060, RTX 3090, RTX 4090).
- Para cargar las 13 políticas simultáneamente se necesitarían unos 78 GB de VRAM, lo que exige múltiples GPUs de alta gama (A100, H100) o el uso de offloading a CPU.
- El entrenamiento original se realizó con 4× NVIDIA A100-80GB o 4× H100, con una de las GPUs dedicada a vLLM para muestreo durante el entrenamiento.
- Opciones de despliegue: al ser un modelo en formato transformers, se puede servir con vLLM, TGI o directamente con `transformers` + `AutoModelForCausalLM`. No se proporcionan pesos GGUF ni cuantizaciones de menor precisión.
- Latencia y throughput: no se han publicado mediciones específicas para este modelo; en una A100 se espera un throughput del orden de cientos de tokens por segundo para un modelo de 3B en bf16, pero no hay datos confirmados.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base `Qwen/Qwen2.5-3B-Instruct` y con el repositorio hermano `roozbehn99/palm-qwen3b-sky-brev-seed2` (misma configuración, distinta semilla). No se dispone de datos de benchmarks estándar para ninguno de ellos.

| Modelo | Parámetros | Contexto | Licencia | Objetivo de entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K (típico de Qwen2.5, no confirmado aquí) | Apache-2.0 | Instruct general (SFT + RLHF) | HuggingFace |
| palm-qwen3b-sky-brev-seed1 (este) | 3B (×13) | no disponible | Apache-2.0 | Multiobjetivo (utilidad + brevedad) vía GRPO | HuggingFace |
| palm-qwen3b-sky-brev-seed2 | 3B (×13) | no disponible | Apache-2.0 | Idéntico, semilla 2 | HuggingFace |

Otras alternativas serían fine-tunes de Qwen2.5-3B con objetivos únicos (p. ej., solo utilidad o solo brevedad), pero no se han encontrado en la información proporcionada.

## Limitaciones y advertencias

- No está ajustado para seguridad más allá del modelo base; puede generar contenido no deseado o sesgado.
- Riesgo de alucinación inherente a los modelos de 3B, especialmente en tareas de razonamiento complejo.
- No está pensado para despliegue en producción; es un artefacto de investigación para experimentos de alineación.
- Las políticas con alto peso en brevedad (idx7-9) muestran una caída notable en utilidad (R1 ~0.7) y una KL alta (5.2-5.5), lo que indica una desviación significativa del comportamiento original.
- El contexto máximo no está documentado en el repositorio; se asume el del modelo base, pero no hay garantía.
- Solo se proporcionan pesos en bf16; no hay cuantizaciones de menor precisión para despliegue ligero.
- Los resultados de evaluación solo cubren RLVR-GSM; no se han publicado métricas en otros benchmarks, lo que limita la comparabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed1
- Repositorio hermano (seed2): https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Código de entrenamiento (referenciado en la model card): LMPortfolio (fork de open-instruct de AI2) — no se proporciona URL directa.

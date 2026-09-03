# AlexWortega/llm-cipher-reasoning-loras

## Resumen

`AlexWortega/llm-cipher-reasoning-loras` es un repositorio de investigación que publica 20 adaptadores LoRA entrenados con GRPO sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El objetivo del experimento era determinar si un LLM puede ser *entrenado* —no solo guiado por *prompting*— para razonar de forma más compacta que en inglés, reduciendo el número de tokens de razonamiento sin perder precisión. Cada adaptador corresponde a una configuración distinta de función de recompensa, mezcla de datos o estrategia de entrenamiento.

El resultado principal es **negativo**: aunque varios adaptadores logran comprimir el razonamiento in-domain (por ejemplo, reduciendo los tokens de razonamiento de 210 a ~50-70 en GSM8K), todos fallan la prueba de generalización out-of-domain (OOD) en AIME 2026. El mejor adaptador entrenado alcanza un 26,7% en AIME 2026 frente al 36,67% del modelo base sin tocar, y el mejor in-domain cae al 13,3%. El campeón del estudio es un *prompt* Chain-of-Draft sobre el modelo base sin entrenar, que consigue un 93,5% en GSM8K con 76,8 tokens de razonamiento (frente al 94,0% con 210,4 tokens del base plano), sin coste de entrenamiento.

Estos pesos se publican como **artefactos de investigación** para reproducir el resultado negativo, estudiar qué hace el entrenamiento de terseness a un modelo, o para servir en dominios estrictamente in-domain donde se haya verificado que todas las peticiones pertenecen a la distribución de entrenamiento. No están recomendados para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | 4B (modelo base) + adaptadores LoRA (r=16 o r=32, alpha=32, dropout=0) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | bfloat16 (safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

Los 20 adaptadores son LoRA de rango 16 o 32 (alpha=32, dropout=0) aplicados a todas las proyecciones de atención y MLP del modelo base Qwen3-4B-Instruct-2507. Se entrenaron con GRPO (Group Relative Policy Optimization) usando la librería TRL, sobre el dataset `AlexWortega/llm-cipher-reasoning`. Cada experimento variaba la función de recompensa: `eff3` (token-efficiency con puerta de corrección), `diffaware` (difficulty-aware, que elimina presión en problemas que el modelo falla), `az` (Arora–Zanette group-relative), `hapo` (history-aware), `cosine` (recompensa por longitud con intercambio de respuestas incorrectas), entre otras. También se probaron mezclas de datos duros (AIME 2024, MATH L3-5) y anclaje KL.

La innovación técnica principal es el propio diseño experimental: se intentó entrenar al modelo para razonar en formas más compactas (incluyendo cifrados y supertokens), pero el resultado fue que la compresión in-domain se logra a costa de una degradación no monotónica en el rendimiento OOD. El estudio documenta además artefactos como el colapso en tres fases al escalar pasos, el efecto Goodhart (aprender a omitir la etiqueta `</reasoning>`) y la refutación de la mezcla de datos duros como mitigación.

## Capacidades

- Los adaptadores **no son aptos para uso general**; están diseñados para comprimir el razonamiento en tareas similares a la distribución de entrenamiento (GSM8K).
- El modelo base Qwen3-4B-Instruct-2507 conserva las capacidades estándar de la familia Qwen3: generación de texto, razonamiento, código y matemáticas, así como soporte de *tool calling* y *function calling* (no documentado específicamente en este repo, pero inherente al base).
- Los adaptadores modifican el comportamiento hacia un razonamiento más breve, con una reducción típica de tokens de razonamiento de 210 a 50-70 en GSM8K.
- No se documenta soporte de *thinking mode* explícito, visión ni audio; el pipeline es text-generation.
- El adaptador `ckpt_roundE_supertoken` requiere una variante del modelo base con vocabulario extendido que **no está publicada**, por lo que no es directamente utilizable.

## Casos de uso

- **Reproducción de resultados negativos en investigación**: el repositorio permite replicar el experimento completo (datos, logs de recompensa, ledger) para verificar que el entrenamiento de terseness con GRPO a 4B produce degradación OOD.
- **Estudio de los efectos del entrenamiento de compresión de razonamiento**: los 20 adaptadores ofrecen un abanico de configuraciones (recompensas, mezclas de datos, escalado de pasos) para analizar cómo cada mecanismo afecta a la precisión in-domain y OOD.
- **Servicio in-domain estrictamente controlado**: si una aplicación garantiza que todas las peticiones pertenecen a la distribución de entrenamiento (por ejemplo, un subconjunto cerrado de problemas aritméticos), algunos adaptadores como `ckpt_g4_1_klanchor` (93,0% GSM8K con 69,7 tokens) pueden ofrecer una compresión útil.
- **Comparación de funciones de recompensa en RLVR**: los resultados documentados (por ejemplo, que `diffaware` da el mejor OOD entre los entrenados, 26,7%) sirven como referencia para diseñar experimentos de RL con recompensas de eficiencia.
- **Validación de hipótesis sobre token-efficiency**: el estudio refuta que mezclar datos duros (AIME 2024, MATH) o escalar pasos mejore la generalización, información valiosa para quien trabaje en optimización de razonamiento.
- **Docencia e investigación en interpretabilidad**: los adaptadores permiten estudiar cómo cambia la distribución de tokens de razonamiento y qué patrones de compresión emergen (por ejemplo, la omisión de etiquetas de formato).

## Benchmarks y rendimiento

La siguiente tabla resume los resultados reportados en la model card para los adaptadores más relevantes, evaluados en GSM8K (split unseen seed-2) y AIME 2026 (30 problemas, MathArena). `tok` = media de tokens en el span de razonamiento. El gate OOD se fijó en AIME ≥ 34,67%.

| Configuracion | GSM8K | tok | AIME 2026 | Veredicto |
|---|---|---|---|---|
| Base sin adaptador + prompt CoD | **93,5%** (n=200) | **76,8** | ✅ safe | **CHAMPION** |
| Base sin adaptador (referencia) | 94,0% (n=200) | 210,4 | 36,67% | referencia |
| `ckpt_g4_1_klanchor` | 93,0% (n=200) | 69,7 | 13,3% | mejor in-domain; peor OOD |
| `ckpt_g3_1_diffaware` | 90,5% (n=200) | 70,4 | 26,7% | mejor OOD entre entrenados |
| `ckpt_g5_1_aimemix` | 92,5% (n=200) | 69,7 | 10,0% | mezcla de datos duros refutada |
| `ckpt_g2_1_cod70` | 91,5% (n=200) | 69,1 | 16,7% | falla gate OOD |
| `ckpt_phase_eff3` | 85,7% (n=70) | 58,3 | 20,0% | campeon de rondas A-E, destronado en OOD |
| `ckpt_roundE_supertoken` | 88,57% (n=70) | 51,0 | — | requiere base no publicado |

No se han publicado resultados de benchmarks adicionales fuera de estos datos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base Qwen3-4B-Instruct-2507 en bfloat16 ocupa aproximadamente 8-9 GB. Los adaptadores LoRA añaden una fracción pequeña (el repo completo pesa 4,8 GB, incluyendo los 20 adaptadores). Con cuantización del base (por ejemplo, 4-bit) se puede reducir a ~4-5 GB.
- **GPU recomendadas**: tarjetas consumer con 16 GB o más (RTX 4080, RTX 4090) son suficientes para inferencia en bf16. Para entrenamiento o experimentación con varios adaptadores, se recomienda A100 (40/80 GB) o H100.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de 16 GB si se cuantiza el base; en bf16 puro se necesita al menos 12 GB.
- **Opciones de despliegue**: `transformers` + `peft` (carga directa con `PeftModel`), `vLLM` (soporta LoRA), `llama.cpp`/`Ollama` (si se convierte el base a GGUF y se fusionan los adaptadores, aunque no está documentado).
- **Latencia y throughput**: no se han publicado mediciones específicas. Como referencia, un modelo de 4B en bf16 en una RTX 4090 suele generar entre 50-100 tokens/s, pero los adaptadores no alteran significativamente la velocidad de inferencia.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que este repositorio es un artefacto de investigación con un resultado negativo. La comparación más relevante es con el propio modelo base y con la configuración de *prompt* Chain-of-Draft:

| Configuracion | Parametros | Contexto | GSM8K | AIME 2026 | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | 94,0% | 36,67% | Apache-2.0 |
| Base + prompt CoD (campeon) | 4B | no disponible | 93,5% | ✅ safe | Apache-2.0 |
| Mejor adaptador entrenado (`ckpt_g4_1_klanchor`) | 4B + LoRA | no disponible | 93,0% | 13,3% | Apache-2.0 |

No se han encontrado otros modelos de la misma categoría (entrenamiento de terseness con GRPO) con datos públicos comparables en la informacion disponible.

## Limitaciones y advertencias

- **Resultado negativo**: ninguno de los adaptadores es la configuración recomendada; el campeón es un *prompt* sobre el modelo base sin entrenar.
- **Degradación OOD severa**: todos los adaptadores entrenados para terseness fallan el gate de AIME 2026, con caídas de hasta 23 puntos porcentuales respecto al base.
- **Riesgo de alucinación y errores de formato**: algunos adaptadores (por ejemplo, `ckpt_g0_6_hapo`) aprendieron a omitir la etiqueta `</reasoning>`, lo que puede romper pipelines que dependan de formato estructurado.
- **Dependencia de distribución**: solo son utilizables en dominios estrictamente in-domain; cualquier desviación de la distribución de entrenamiento degrada el rendimiento de forma impredecible.
- **Adaptador supertoken no reproducible**: `ckpt_roundE_supertoken` requiere una variante del modelo base con vocabulario extendido que no se ha publicado, por lo que no se puede cargar directamente.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor advierte explícitamente que no son para uso general; el uso en producción requiere una validación exhaustiva del dominio.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos de razonamiento matemático en inglés, su comportamiento en otros idiomas o dominios no está garantizado.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/AlexWortega/llm-cipher-reasoning-loras)
- [Dataset de entrenamiento y evaluación](https://huggingface.co/datasets/AlexWortega/llm-cipher-reasoning)
- [Codigo fuente en GitHub](https://github.com/AlexWortega/llm-cipher-reasoning)
- [Paper Chain-of-Draft (arxiv 2502.18600)](https://arxiv.org/abs/2502.18600)
- [Modelo base Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)

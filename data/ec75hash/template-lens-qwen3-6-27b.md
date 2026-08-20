# ec75hash/template-lens-qwen3.6-27b

## Resumen

`ec75hash/template-lens-qwen3.6-27b` es un artefacto de interpretabilidad, no un modelo de lenguaje generativo. Se trata de una **template lens** (lente de plantilla) ajustada para el modelo base `Qwen/Qwen3.6-27B`, que implementa el método descrito en el apéndice *"Extending the Jacobian lens to multi-token concepts"* del paper de Anthropic *Verbalizable Representations Form a Global Workspace in Language Models* (2026). Es, según el autor, el primer artefacto público de este tipo para cualquier modelo, ya que no existía implementación en el repositorio del paper, en el ecosistema `jlens` de Hugging Face ni en GitHub a fecha de agosto de 2026.

La lente se compone de vectores de plantilla para 12 palabras concretas (por ejemplo, "fire", "Paris", "consciousness", "Tchaikovsky", "Golden Gate Bridge"), cada una con longitudes de token de 1 a 4. Para cada palabra, se define un vector discriminante lineal con regularización ridge sobre las activaciones del residual stream en la última posición de pasajes escritos para que esa palabra sea su continuación natural. El artefacto incluye los tensores ajustados (`templates`, `sigma`, `mu`, `mu_w`), un corpus de pasajes, y un pipeline completo de ajuste, validación y pruebas de steering. Los resultados piloto muestran que la lente alcanza una precisión de identificación de conceptos del 97,9 % en la capa final, y mantiene un rendimiento alto con conceptos multi-token mientras que la Jacobian lens (J-lens) se degrada drásticamente.

La relevancia de este artefacto reside en su aporte metodológico: permite inspeccionar y manipular representaciones internas de conceptos complejos (de varios tokens) en un modelo de 27B parámetros, con un coste computacional mínimo (134 segundos de ajuste) y sin entrenamiento de gradientes. Es una herramienta de investigación para la interpretabilidad de modelos, no un modelo para inferencia de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Template lens (método de interpretación) sobre el modelo base `Qwen/Qwen3.6-27B` |
| Parámetros totales | No aplica (no es un LLM). El artefacto contiene tensores: `templates [17, 12, 5120]`, `sigma [17, 5120, 5120]`, `mu [17, 5120]`, `mu_w [17, 12, 5120]` (todos fp32) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (depende del modelo base; `Qwen3.6-27B` soporta 262 144 tokens, extensible a 1 010 000) |
| Tipos de cuantización | No aplica (tensores en fp32; el modelo base se usa en bf16 para inferencia) |
| Idiomas soportados | No disponible (el corpus de pasajes está en inglés, pero el método es agnóstico al idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`out/templates.safetensors`, `out/sigma.safetensors`, `out/heldout.safetensors`) y JSONL (`passages/*.jsonl`) |

## Arquitectura y entrenamiento

La lente se basa en el método de **template vector** del paper de Anthropic. Para una palabra *w*, el vector de plantilla en la capa `l` se define como:

```
t_w(l) = (Sigma_l + lambda I)^-1 (mu_w(l) - mu(l))
```

donde `mu_w(l)` es la media de las activaciones del residual stream en la posición final de pasajes cuyo continuo natural es *w* (sin que la palabra aparezca en el pasaje), y `mu(l)` y `Sigma(l)` son la media y covarianza global sobre todos los pasajes de entrenamiento en esa capa. La lectura de un concepto se realiza proyectando un residual sobre `t_w`; el steering se hace sumando o restando el vector, sin bucle de entrenamiento ni gradientes.

El entrenamiento se realizó sobre 624 pasajes (52 de entrenamiento y 12 de validación por palabra, para 12 palabras), generados según el protocolo del paper (variando tópico, marco y registro). Se usaron capas 0, 4, 8, ..., 60 y 64 (índices de `hidden_states`). El ajuste se llevó a cabo en una RTX PRO 6000 Blackwell de 96 GB, con precisión bf16, y tomó 134 segundos. El repositorio incluye `fit_provenance.json` con checksums, lambdas y entorno exacto para reproducibilidad.

El artefacto también permite **generar plantillas para nuevas palabras** sin reentrenar el modelo: basta con generar pasajes, recolectar residuales de la última posición y resolver contra la matriz `sigma.safetensors` ya precalculada.

## Capacidades

- **Lectura de conceptos multi-token**: identifica cuál de las 12 palabras está siendo representada en una activación residual, con precisión de top-1 del 97,9 % en la capa final (frente al 8,3 % de azar).
- **Comparación con la Jacobian lens**: en la capa 60, la template lens mantiene una tasa de acierto de 0,92–1,00 para conceptos de 1 a 4 tokens, mientras que la J-lens cae de 0,92 a 0,00 para 4 tokens.
- **Alineación geométrica**: los vectores de plantilla para palabras de un solo token tienen un coseno mediano de 0,115 con las direcciones de la J-lens, significativamente no aleatorio (8–24σ) pero no idéntico, lo que confirma diferencias metodológicas (corpus, gradientes, regularización).
- **Steering de conceptos**: el artefacto permite intervenciones aditivas sobre el residual stream para inyectar contenido de un concepto (por ejemplo, Tchaikovsky→Beethoven cambia la respuesta de "Russia" a "Germany"), aunque el control es de inyección, no un swap limpio.
- **Reutilización del pipeline**: scripts completos para ajustar nuevas plantillas, validar con gates, y ejecutar pruebas de swap.
- **No requiere entrenamiento**: solo forward passes del modelo base para recolectar activaciones; la resolución de plantillas es algebraica.

## Casos de uso

- **Investigación en interpretabilidad**: analizar cómo el modelo `Qwen3.6-27B` representa conceptos abstractos y multi-token a lo largo de las capas. La lente permite ver la evolución de la señal desde la capa de embeddings (0,31) hasta la última (0,979).
- **Auditoría de representaciones**: en aplicaciones de seguridad de IA, verificar si un concepto no deseado (por ejemplo, "blackmail") está presente en las representaciones internas antes de que se materialice en el texto.
- **Desarrollo de técnicas de control**: el steering con template vectors puede servir de base para intervenciones más finas (proyectivas) en modelos de producción, aunque el artefacto actual es de investigación.
- **Validación de métodos de interpretación**: el repositorio incluye gates funcionales (gate 3) que comparan la template lens con la J-lens, útil para evaluar la eficacia de distintas lentes en conceptos multi-token.
- **Educación y divulgación**: como ejemplo reproducible del método de Anthropic, permite a estudiantes e investigadores entender la extensión de la Jacobian lens a conceptos de varios tokens.
- **Generación de nuevas plantillas**: para palabras específicas de un dominio (por ejemplo, términos técnicos o nombres propios), se puede usar el pipeline de ajuste para crear lentes personalizadas sobre el mismo modelo base.

## Benchmarks y rendimiento

Los resultados del piloto (reproducibles desde el repositorio) son:

**Precisión de lectura top-1 (gate 1)** – 12 palabras, chance 0,083:

| Capa | Precisión |
|---|---|
| Embeddings | 0,31 |
| L12 | 0,63 |
| L36 | 0,83 |
| Final | 0,979 |

**Comparación funcional vs. J-lens (gate 3)** – capa 60, sobre los mismos residuales de validación:

| Lente | 1 token | 2 tokens | 3 tokens | 4 tokens |
|---|---|---|---|---|
| Template (top-1 de 12) | 1,00 | 1,00 | 0,92 | 0,92 |
| J-lens (primer token en top-10 de 248 320) | 0,92 | 0,67 | 0,33 | 0,00 |

**Alineación geométrica (gate 2)** – coseno mediano entre plantillas de 1 token y direcciones de J-lens: 0,115 (rango por palabra 0,18–0,33), significativamente no aleatorio en 5120 dimensiones.

**Steering (gate 4)** – parcial: la intervención simplificada (suma de diferencia de medias) logra cambiar la respuesta de "Russia" a "Germany" para el caso Tchaikovsky→Beethoven, pero la dirección inversa solo inyecta contenido sin cambiar la respuesta. No se reporta un swap limpio.

No se han publicado benchmarks de rendimiento estándar (MMLU, HumanEval, etc.) para el artefacto, porque no es un modelo generativo.

## Requisitos de hardware

- Para **ejecutar la lente** (leer activaciones del residual stream) se necesita cargar el modelo base `Qwen3.6-27B` en memoria. En fp16 requiere ~56 GB de VRAM (GPU A100 80 GB, RTX PRO 6000, etc.). Con cuantización de 4 bits (por ejemplo, GPTQ) puede caber en una GPU de 24 GB (RTX 4090, A5000).
- El artefacto en sí (tensores) ocupa 1,8 GB, pero para obtener activaciones se necesita el modelo completo.
- Los scripts de ajuste (`fit_templates.py`) requieren generar pasajes y ejecutar forward passes del modelo; el autor usó una RTX PRO 6000 Blackwell (96 GB) con bf16, 134 s para 624 pasajes.
- Para despliegue, no se usa vLLM ni Ollama (no es un modelo generativo); se recomienda usar `transformers` o `safetensors` con Python.
- La latencia de la lectura es mínima (producto vectorial sobre 5120 dimensiones); el cuello de botella es la ejecución del modelo base para obtener activaciones.

## Comparativa con modelos similares

No existe otro artefacto público de template lens para ningún modelo (según el autor, encuesta de 2026-08-19). La comparación más cercana es con la **Jacobian lens** (`neuronpedia/jacobian-lens`), que se basa en gradientes de logits:

| Característica | Template lens (este) | Jacobian lens (J-lens) |
|---|---|---|
| Conceptos multi-token | Sí (funciona bien hasta 4 tokens) | Degrada con la longitud (0,92→0,00) |
| Precisión en held-out | 0,979 (top-1 de 12) | No comparable (top-10 de 247 320) |
| Método | Ridge discriminante sobre medias y covarianza | Gradientes de logits |
| Coste de ajuste | 134 s (solo pasadas del modelo) | No requiere ajuste (cálculo directo) |
| Disponibilidad | Apache 2.0, repo público | Apache 2.0, repo de Neuronpedia |

Otras técnicas de interpretabilidad (logit lens, sparse autoencoders) no se comparan directamente porque operan sobre logits o activaciones latentes, no sobre conceptos multi-token.

## Limitaciones y advertencias

- **Piloto limitado**: solo cubre 12 palabras concretas; la lente no es un modelo de interpretación general para todo el vocabulario. Para nuevas palabras hay que ajustar plantillas manualmente.
- **Steering parcial**: el control por inyección de concepto es bruto y no produce un swap limpio; el método proyectivo del paper aún no está implementado.
- **Riesgo de sesgo en el corpus**: los pasajes fueron generados por un modelo de lenguaje (Claude) y podrían contener sesgos de género, geografía o cultura, que se reflejarían en las plantillas.
- **Dependencia del modelo base**: la lente solo es válida para `Qwen3.6-27B`; no es transferible a otros modelos sin reajuste.
- **Idioma**: el corpus está en inglés; el rendimiento en otros idiomas no ha sido evaluado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el método subyacente es propiedad intelectual de Anthropic (aunque el paper es público); se recomienda revisar la licencia del paper.
- **No apto para producción**: es un artefacto de investigación, no una herramienta de inferencia de texto; no debe usarse como sustituto de un LLM.

## Enlaces

- [HuggingFace: ec75hash/template-lens-qwen3.6-27b](https://huggingface.co/ec75hash/template-lens-qwen3.6-27b)
- [Modelo base: Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- [Paper de Anthropic: Verbalizable Representations Form a Global Workspace in Language Models](https://transformer-circuits.pub/2026/workspace/)
- [Jacobian lens de Neuronpedia](https://huggingface.co/neuronpedia/jacobian-lens)
- [Guía completa de Qwen3.6-27B (2026)](https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/)
- [Catálogo de modelos de Microsoft Foundry para Qwen3.6-27B](https://ai.azure.com/catalog/models/qwen--qwen3.6-27b)
- [Qwen3.6-27B en NVIDIA NGC](https://catalog.ngc.nvidia.com/orgs/nim/teams/qwen/models/qwen3.6-27b)

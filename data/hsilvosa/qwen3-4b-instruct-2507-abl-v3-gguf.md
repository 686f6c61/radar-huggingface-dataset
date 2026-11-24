# hsilvosa/Qwen3-4B-Instruct-2507-abl-v3-GGUF

## Resumen

Qwen3-4B-Instruct-2507-abl-v3 es un checkpoint experimental derivado de Qwen/Qwen3-4B-Instruct-2507 mediante técnicas de *abliteration* (eliminación de la dirección de rechazo en el espacio de activaciones). Lo publica el usuario hsilvosa como parte de una serie de investigación (v1–v4) que estudia el equilibrio entre la supresión de rechazos y la degradación de capacidades. Este checkpoint concreto (v3) es un **resultado negativo documentado**: se conserva únicamente como ejemplo del límite de sobre-ablación.

El modelo aplica una ortogonalización *norm-preserving* con `scale = 2.0` sobre 31 módulos (30 bloques decodificadores más `embed_tokens`), lo que invierte la proyección de la dirección de rechazo en lugar de simplemente anularla. El resultado es una tasa de cumplimiento directo del 81,0 % en prompts dañinos, pero a costa de una divergencia KL de 3,79 y una caída de 12,2 puntos en MMLU.

Es relevante ahora porque documenta empíricamente el punto de ruptura de las técnicas de abliteración agresiva: los bucles de repetición, la corrupción léxica y la fuga de tokens de seguridad invertidos en prosa benigna son artefactos medibles y reproducibles. El autor recomienda explícitamente usar la variante v4 en su lugar para cualquier uso que requiera coherencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo; la evaluacion se hizo con `ctx = 8192`) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado); el modelo base admite otras cuantizaciones |
| Idiomas soportados | en, multilingual |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`qwen3-4b-instruct-2507-abl-v3-Q4_K_M.gguf`, 2,53 GB); repo de 2,7 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507 (revisión `cdbee75f17c01a7cc42f958dc650907174af0554`) y no se reentrena: se editan directamente los pesos mediante abliteración proyectada. La dirección de rechazo se estima con el método `projected` (Lai, 2025) sobre 256 prompts dañinos frente a 256 benignos del conjunto de entrenamiento. La búsqueda de candidatos con `kl_max = 4.0` selecciona la capa 18 (profundidad 0,50) con `KL = 3.7909`; las capas 25 y 31 se descartan por KL de 20,7 y 18,3 respectivamente.

La edición de pesos usa ortogonalización `norm_preserving` con `scale = 2.0`, lo que refleja la proyección (`x - 2 (x · r) r`) en lugar de anularla, aplicada sobre `layer_range = [0.15, 0.98)` (capas 5 a 34, 30 bloques) más `embed_tokens`, con `edit_embeddings = true` y `untied_lm_head = true`. La construcción se ejecutó en una única RTX 3060 de 12 GB en bfloat16 con un tiempo de 116,5 s. No hay datos de entrenamiento adicionales, RLHF ni DPO en la información disponible: es una intervención puramente post-hoc sobre los pesos del modelo base.

## Capacidades

- Generación de texto conversacional en inglés y multilingüe, heredada del modelo base.
- Razonamiento y respuesta a preguntas generales, con degradación severa medida en MMLU (61,8 % frente a 74,0 % del base).
- Cumplimiento directo de prompts que el modelo base rechazaría (81,0 % `DIRECT_COMPLIANCE` en el conjunto de evaluación de rechazo).
- Reducción de sobre-rechazo en prompts seguros de XSTest (2,4 % de rechazo efectivo frente a 17,6 % del base).
- Capacidades del modelo base no verificadas en esta ficha (código, matemáticas, tool calling, agentes): no disponible.
- **No** mantiene coherencia en generación benigna: bucles de repetición hasta el límite de 512 tokens, corrupción léxica y fuga de tokens de seguridad invertidos en contextos neutros.

## Casos de uso

- Investigación sobre abliteración: sirve como caso de control para medir el límite de sobre-ablación y comparar con las variantes v1, v2 y v4 de la misma serie.
- Estudio de modos de fallo en LLM: los bucles de repetición y la corrupción subword documentados permiten calibrar detectores de degeneración en pipelines de evaluación.
- Análisis de fuga de dirección de rechazo: los ejemplos de adjetivos de seguridad filtrados en prosa benigna ("unethical forest", "illegal Earth-12") son material para estudiar cómo se codifican las representaciones de seguridad en capas intermedias.
- Reproducibilidad de experimentos de edición de pesos: el fichero `abliteration.json` y el tensor `refusal_direction.pt` permiten replicar exactamente la intervención en la capa 18.
- Docencia sobre alineación y seguridad: ilustra de forma tangible el compromiso entre supresión de rechazos y degradación de capacidades.
- **No recomendado** para atención al cliente, generación de código en producción, agentes, RAG ni ningún despliegue de cara al usuario, según el propio autor.

## Benchmarks y rendimiento

Evaluación con `Q4_K_M`, `thinking = off`, vía `llama-server` (`temperature = 0`, `seed = 1234`, `ctx = 8192`, `--jinja`), frente al modelo base sin modificar.

| Benchmark / metrica | qwen3-4b-base (Q4_K_M) | abl-v3 (Q4_K_M) | Delta |
|---|---:|---:|---:|
| Rechazo, heuristica v2 (n = 100) | 100,0 % | 0,0 % | -100,0 pts |
| Rechazo, juez v3 efectivo (n = 100) | 99,0 % | 14,0 % | -85,0 pts |
| Rechazo, juez v3 `DIRECT_COMPLIANCE` | 1,0 % | 81,0 % | +80,0 pts |
| Sobre-rechazo XSTest, heuristica v2 (n = 250) | 4,8 % | 0,0 % | -4,8 pts |
| Sobre-rechazo XSTest, juez v3 efectivo | 17,6 % | 2,4 % | -15,2 pts |
| Sobre-rechazo XSTest, `DIRECT_COMPLIANCE` | 72,4 % | 92,8 % | +20,4 pts |
| MMLU (5/asignatura, n = 285) | 74,0 % | 61,8 % | -12,2 pts |
| Calidad benigna (n = 50) | Fluida | Degradada (bucles y corrupcion) | — |

Desglose del juez v3 en cuatro clases (`thinking = off`):

| Tarea | `EXPLICIT_REFUSAL` | `SAFE_REFRAME` | `HEDGED_COMPLIANCE` | `DIRECT_COMPLIANCE` | `unparsed` |
|---|---:|---:|---:|---:|---:|
| Rechazo (n = 100) | 0,0 % | 14,0 % | 5,0 % | 81,0 % | 0 |
| Sobre-rechazo (n = 250) | 0,0 % | 2,4 % | 2,4 % | 92,8 % | 6 |

## Requisitos de hardware

- VRAM estimada: el fichero GGUF Q4_K_M ocupa 2,53 GB, por lo que la inferencia cabe en GPUs de 4 GB o más con contexto moderado; con `ctx = 8192` se recomienda un mínimo de 6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; el propio autor construyó el checkpoint en una RTX 3060 de 12 GB en bfloat16.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 6 GB o más; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp / `llama-server` (usado en la evaluación), Ollama, y cualquier runtime compatible con GGUF. El repo incluye tags `endpoints_compatible`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (Q4_K_M) | Rechazo efectivo | Licencia | Estado |
|---|---|---|---:|---:|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4,41 B | no disponible | 74,0 % | 99,0 % | Apache-2.0 | Estable |
| abl-v3 (este) | 4,41 B | no disponible | 61,8 % | 14,0 % | Apache-2.0 | Experimental, resultado negativo |
| abl-v4 (recomendado por el autor) | 4,41 B | no disponible | 73,0 % | no disponible | Apache-2.0 | Experimental, coherente |
| abl-v1 / abl-v2 | 4,41 B | no disponible | no disponible | no disponible | Apache-2.0 | Experimentales |

La comparación relevante es interna a la serie: v4 recupera MMLU hasta 73,0 % (-1,0 pt frente al base) con `KL = 0,54`, eliminando los artefactos de v3. Frente a otras alternativas de 4 B de otros fabricantes, no hay datos de benchmarks en la información disponible.

## Limitaciones y advertencias

- **Degradación severa de coherencia**: bucles de repetición que agotan el límite de 512 tokens en todos los prompts benignos inspeccionados, corrupción léxica ("The Uail Law-Enement agency") y fuga de adjetivos de seguridad invertidos en prosa neutra ("unethical forest", "illegal Earth-12").
- **Caída de MMLU de 12,2 puntos** respecto al base, con divergencia KL de 3,79, muy por encima del umbral recomendado.
- **Guardarraíles de seguridad eliminados**: no apto para producción ni para aplicaciones de cara al usuario, según el propio autor.
- **Riesgo de alucinación y degeneración** elevado por la propia corrupción de pesos; no fiable para tareas factuales.
- **Licencia Apache-2.0** permite uso comercial teórico, pero el autor restringe explícitamente el uso a investigación sobre abliteración.
- **Idiomas**: solo se declaran `en` y `multilingual`; no hay evaluación por idioma, y la corrupción léxica podría ser más acusada fuera del inglés.
- **Contexto**: no se documenta la longitud máxima soportada en esta ficha; la evaluación se limitó a 8192 tokens.
- **Sin datos de sesgos** más allá de los modos de fallo observados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsilvosa/Qwen3-4B-Instruct-2507-abl-v3-GGUF
- Variante recomendada (v4): https://huggingface.co/hsilvosa/Qwen3-4B-Instruct-2507-abl-v4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Referencia del estimador de dirección `projected` (Lai, 2025): no disponible como enlace en la información proporcionada.

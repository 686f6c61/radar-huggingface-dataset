# hsilvosa/Qwen3-4B-Instruct-2507-abl-v4-GGUF

## Resumen

Qwen3-4B-Instruct-2507-abl-v4 es una variante experimental del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario hsilvosa bajo el identificador `hsilvosa/Qwen3-4B-Instruct-2507-abl-v4-GGUF`. Se trata de un checkpoint "abliterado": se ha aplicado una edición de pesos dirigida a eliminar la dirección de rechazo (refusal direction) del modelo base, de modo que el modelo deja de negarse a responder peticiones que el modelo original rechazaría. La técnica empleada es una abliteración proyectada con preservación de norma, restringida a las capas decoder intermedias.

El modelo conserva la arquitectura y el conocimiento del Qwen3-4B-Instruct-2507 original (4.022.468.096 parámetros, transformer denso) y se distribuye únicamente en formato GGUF cuantizado Q4_K_M (2,33 GB). Su propósito declarado es la investigación en interpretabilidad, alineamiento y red-teaming: permite estudiar cómo se comporta un modelo sin guardarraíles de seguridad y comparar su comportamiento con el del modelo base.

Es relevante ahora porque documenta de forma cuantitativa el coste de eliminar el rechazo: reduce el rechazo explícito del 99,0% al 26,0% (con un 57,0% de cumplimiento directo) manteniendo un MMLU del 73,0% frente al 74,0% del base, y con una velocidad de generación de ~81 tok/s en una RTX 3060. El autor advierte explícitamente que no debe desplegarse en producción ni en sistemas de cara al público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), 36 capas |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion usa ctx = 8192) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico publicado en el repo) |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (Q4_K_M); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo es una edición de pesos sobre `Qwen/Qwen3-4B-Instruct-2507` (revision `cdbee75f17c01a7cc42f958dc650907174af0554`), un transformer decoder-only denso de 36 capas y ~4,02 mil millones de parámetros. No se ha reentrenado ni hecho fine-tuning adicional: la modificación consiste en una abliteración proyectada con preservación de norma aplicada a las matrices `self_attn.o_proj` y `mlp.down_proj` de las capas decoder 9 a 33 (rango `[0.25, 0.95)` de profundidad, 25 bloques en total). Los embeddings no se tocan y `lm_head` permanece atado.

La dirección de rechazo se estima con el método `projected` (Lai, 2025): diferencia de medias de estados residuales del último token entre 256 prompts dañinos y 256 inofensivos, solo de los splits de `train`, ortogonalizada contra la media unitaria de los inofensivos. Se toma la dirección de la capa 18 (profundidad 0,5) y se aplica la edición `W' = W - scale * r r^T W` con `scale = 1.5`, seguida de restauración de la norma de columna. La validación en held-out reporta 1/64 rechazos explícitos (frente a 63/64 del base) y una divergencia KL de primer token de 0,5390 sobre 64 prompts inofensivos. El build se realizó en una única RTX 3060 12 GB en bfloat16, con 75,8 s de tiempo de pared.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y conocimiento general: 73,0% de MMLU en la evaluación del autor (n = 285).
- Cumplimiento directo de peticiones que el modelo base rechazaría: 57,0% en `mlabonne/harmful_behaviors` frente al 1,0% del base.
- Reducción del rechazo excesivo en peticiones seguras: 90,4% de cumplimiento directo en `Paul/XSTest` (n = 250), frente al 72,4% del base.
- Capacidades multilingües declaradas (etiqueta `multilingual`), aunque la evaluación publicada es en inglés.
- Modo thinking desactivable: la evaluación se realizó con `enable_thinking = false`; el comportamiento con trazas de razonamiento activadas no se ha medido.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en interpretabilidad y alineamiento: comparar el comportamiento del modelo base y del abliterado sobre el mismo conjunto de prompts para aislar el efecto de la dirección de rechazo en las activaciones de las capas 9-33.
- Red-teaming y evaluación de seguridad: generar respuestas que el modelo base bloquearía para probar clasificadores de contenido, filtros de salida y pipelines de moderación con material de entrada realista.
- Estudio de rechazo excesivo (over-refusal): usar el modelo para analizar qué peticiones benignas disparan rechazos en el base y cómo se distribuyen los `SAFE_REFRAME` y `HEDGED_COMPLIANCE` tras la abliteración.
- Evaluación de cuantización: el GGUF Q4_K_M de 2,33 GB permite medir el impacto de la cuantización de 4 bits sobre un modelo de 4B en una GPU de consumo (RTX 3060 12 GB, ~81 tok/s).
- Docencia y demostraciones sobre seguridad de LLM: ilustrar en un entorno controlado cómo una edición lineal de pesos altera la política de rechazo sin reentrenar el modelo.
- Baseline para investigación de métodos de abliteración: el repo incluye `abliteration.json` y `refusal_direction.pt`, lo que permite reproducir y comparar variantes v1-v4 del mismo experimento.

## Benchmarks y rendimiento

Evaluación del autor con `Q4_K_M`, `thinking = off`, `llama-server` (temperatura 0, seed 1234, ctx 8192, `--jinja`), comparando con el modelo base convertido con el mismo pipeline:

| Benchmark / metrica | Base Q4_K_M | abl-v4 Q4_K_M | Delta |
|---|---:|---:|---:|
| Rechazo — heuristica v2 (n = 100) | 100,0% | 0,0% | -100,0 pts |
| Rechazo — judge v3 rechazo efectivo | 99,0% | 26,0% | -73,0 pts |
| Rechazo — judge v3 cumplimiento directo | 1,0% | 57,0% | +56,0 pts |
| Sobre-rechazo (XSTest safe, n = 250) — heuristica v2 | 4,8% | 0,0% | -4,8 pts |
| Sobre-rechazo — judge v3 rechazo efectivo | 17,6% | 6,0% | -11,6 pts |
| Sobre-rechazo — judge v3 cumplimiento directo | 72,4% | 90,4% | +18,0 pts |
| MMLU (5/asignatura, n = 285) | 74,0% | 73,0% | -1,0 pt |
| Velocidad de generacion (RTX 3060 12 GB) | ~80,6 tok/s | ~81,3 tok/s | — |

Desglose de 4 clases del judge v3 (`thinking = off`):

| Tarea | EXPLICIT_REFUSAL | SAFE_REFRAME | HEDGED_COMPLIANCE | DIRECT_COMPLIANCE | no parseados |
|---|---:|---:|---:|---:|---:|
| Rechazo (n = 100) | 0,0% | 26,0% | 16,0% | 57,0% | 1 |
| Sobre-rechazo (n = 250) | 0,4% | 5,6% | 1,2% | 90,4% | 6 |

Comparativa interna de las variantes v1-v4 del autor:

| Version | Direccion y edicion | KL (val) | SAFE_REFRAME | DIRECT_COMPLIANCE | MMLU (delta) | Calidad benigna |
|---|---|---:|---:|---:|---:|---|
| v1 | L25, s=1.0, todas + emb | 0,10 | 50% | 3% | 73,3% (-0,7) | Fluida |
| v2 | L25, s=1.5, [0.25,0.95), sin emb | 0,38 | 48% | 22% | 75,4% (+1,4) | Fluida |
| v4 | L18, s=1.5, [0.25,0.95), sin emb | 0,54 | 26% | 57% | 73,0% (-1,0) | Fluida |
| v3 | L18, s=2.0, [0.15,0.98), con emb | 3,79 | 14% | 81% | 61,8% (-12,2) | Degradada (bucles) |

No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 2,33 GB en disco; con contexto de 8192 tokens la huella en VRAM es de aproximadamente 3-4 GB, aunque la cifra exacta no se publica.
- GPU verificada por el autor: una única RTX 3060 de 12 GB, con ~81,3 tok/s de generación.
- Cabe en GPUs de consumo con 6-8 GB de VRAM o más en cuantización Q4_K_M; no se documentan requisitos para otras cuantizaciones.
- Despliegue: `llama-server` de llama.cpp con `--jinja` y `-ngl 99`; compatible con endpoints (etiqueta `endpoints_compatible`). No se documenta soporte verificado en vLLM, TGI ni Ollama.
- El modelo base en bfloat16 requiere más VRAM (no cuantificado); el autor lo construyó en una RTX 3060 12 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-abl-v4 | 4,02B | no disponible | 73,0% (n = 285) | Apache-2.0 | GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible | 74,0% (n = 285) | Apache-2.0 | safetensors, GGUF |
| Variantes abl-v1/v2/v3 del mismo autor | 4,02B | no disponible | 73,3% / 75,4% / 61,8% | Apache-2.0 | GGUF |

No se dispone de datos de benchmarks de otros modelos abliterados comparables en la información proporcionada, por lo que la comparativa se limita al modelo base y a las variantes del mismo autor.

## Limitaciones y advertencias

- Guardarraíles de seguridad eliminados intencionadamente: el autor declara el modelo como de uso exclusivo en investigación y prohíbe su despliegue en sistemas públicos o de producción.
- Puede generar contenido dañino, inseguro o inexacto; no debe usarse en aplicaciones de cara al usuario.
- Reencuadre seguro residual: el 26% de los prompts de `harmful_behaviors` siguen produciendo `SAFE_REFRAME` y el 16% incluyen advertencias educativas o éticas.
- No añade conocimiento: la abliteración elimina señales de rechazo sin mejorar la capacidad factual; en temas especializados un modelo de 4B produce con frecuencia pasos genéricos o alucinados.
- Evaluado únicamente con `thinking = off`; el comportamiento con trazas de razonamiento activadas no se ha medido.
- Sesgo del juez: la evaluación usa un juez LLM local de 4 clases, lo que introduce sesgo del evaluador; las tasas se acompañan de intervalos de Wilson al 95%.
- Idiomas: la evaluación publicada es solo en inglés; el soporte multilingüe está declarado pero no medido.
- Licencia Apache-2.0 heredada del base: permite uso comercial según la licencia, pero el autor restringe explícitamente el uso a investigación por motivos de seguridad.
- Solo se publica una cuantización (Q4_K_M); no hay pesos en safetensors ni otras cuantizaciones en el repo.
- Contexto máximo no documentado en la información disponible; la evaluación se limita a 8192 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsilvosa/Qwen3-4B-Instruct-2507-abl-v4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de evaluación de rechazo: `mlabonne/harmful_behaviors` (referenciado en la model card)
- Dataset de sobre-rechazo: `Paul/XSTest` (referenciado en la model card)
- Método de estimación de dirección: Lai, 2025 (referenciado como `projected` en la model card; sin URL en la información disponible)

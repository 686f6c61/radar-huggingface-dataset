# jstarks/Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming

## Resumen

Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming es una variante del modelo `xtools-at/Qwen3.5-9B-DeepThought-STEM` (a su vez derivado de `Qwen/Qwen3.5-9B`) creada por el usuario `jstarks` mediante una técnica de programación en el espacio de pesos (weight-space programming, WSP) sin entrenamiento por descenso de gradiente. El objetivo no es añadir conocimiento nuevo, sino corregir un problema de comportamiento diagnosticado en el modelo base: la sobre-deliberación dentro de los bloques `<think>`, que provocaba truncamientos por agotamiento del presupuesto de tokens en tareas STEM y de agente.

El autor captura receptores de forward-hook en BF16 sobre las 32 capas del modelo base y resuelve 12 subespacios ortogonalizados de rango 16 mediante la identidad de Woodbury. Estos subespacios (S1–S12) modulan comportamientos concretos: cierre acotado de la cadena de pensamiento, contención de herramientas, enrutamiento de tool calls, síntesis de código en capas intermedias, JSON en segundo turno, inmunidad a inyección indirecta, abstención fundamentada, recuperación de errores y consolidación de razonamiento STEM.

La relevancia actual reside en su enfoque: demuestra que es posible mejorar métricas de razonamiento y agentes en un modelo de 9B sin reentrenar, aplicando adaptadores LoRA dinámicos derivados analíticamente. El modelo se distribuye con licencia Apache 2.0, pesos safetensors y una cuantización GGUF Q4_K_M para ejecución local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 32 capas (24 Gated DeltaNet + 8 full attention), hidden_size 4096, intermediate_size 12288 |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (las evaluaciones usan `-c 16384`) |
| Tipos de cuantizacion | GGUF Q4_K_M incluido (5.383 GiB / 5.780.095.072 bytes); pesos safetensors BF16 del modelo base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M) y 12 adaptadores LoRA dinámicos |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de Qwen3.5 con 32 capas, de las cuales 24 emplean Gated DeltaNet (atención lineal con estado recurrente) y 8 usan atención completa. El hidden size es 4096 y el intermediate size 12288. Sobre esta base, `xtools-at` construyó `Qwen3.5-9B-DeepThought-STEM` a partir de `Qwen3.5-9B` y de una variante heretic/uncensored, incorporando trazas de razonamiento de alta profundidad, descubrimiento de fármacos y STEM.

La contribución de `jstarks` no implica entrenamiento supervisado ni RLHF/DPO. Se capturan activaciones forward-hook en BF16 en las 32 capas (verificación de logits: `'Paris': 7.237`, `'London': 3.13`, `'Berlin': 1.939`) y se resuelven 12 subespacios de rango 16 ortogonalizados mediante la fórmula de Woodbury. Los subespacios S1–S9 cubren cierre acotado de CoT, contención de herramientas y anti-sicofancia, enrutamiento de herramientas, síntesis de código en capas intermedias, JSON de segundo turno, gating de handoff, inmunidad a inyección indirecta, abstención fundamentada y recuperación de errores. S10 y S11 gestionan bucles bash multi-turno con estado en WSL2. S12 (`||dW||_F = 6.8013` en capas 23, 27, 29, 30 y 31) se sintetiza a partir de 28 trazas CoT on-policy disjuntas, con ponderación 3,8x en razonamiento temprano y 4,0x en restricciones de espacio nulo post-respuesta.

El resultado se materializa como 12 adaptadores LoRA dinámicos que se aplican en tiempo de inferencia sobre el modelo base, más una cuantización GGUF Q4_K_M de `mradermacher` incluida para ejecución con `run_wsp.py` vía llama.cpp.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo `<think>` acotado.
- Razonamiento matemático y STEM (MATH-500, MMLU-Pro, MMLU de 4 opciones, GSM8K estimado).
- Generación de código (HumanEval estimado) y síntesis de código en capas intermedias.
- Tool calling y function calling, con enrutamiento y contención de herramientas (BFCL, NL2BASH).
- Ejecución de agentes sobre terminal: bucles bash multi-turno con estado en WSL2 Ubuntu 24.04 (Terminal-Bench).
- Emisión de JSON estructurado en segundo turno de conversación.
- Abstención fundamentada y recuperación de errores en cadenas de agente.
- Inmunidad a inyección indirecta de prompts (subespacio S7).
- Capacidad image-text-to-text heredada del pipeline declarado en los tags del repositorio.
- Soporte multilingüe: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de terminal automatizados: el modelo puede ejecutar secuencias de comandos bash con estado multi-turno en entornos Linux, gracias a los subespacios S10_TERM_ACTION y S11_TERM_CODE, que mantienen el contexto de ejecución entre pasos.
- Automatización de tareas de administración de sistemas: tareas como `sanitize-git-repo` o `grid-pattern-transform` se benefician de la contención de herramientas (S2) que evita deliberaciones largas sin emitir comandos.
- Razonamiento matemático en producción: la consolidación S12_STEM_SETTLE permite resolver problemas de MATH-500 y GSM8K sin truncamientos por agotamiento del presupuesto de tokens, reduciendo el consumo de tokens de finalización en torno al 20 %.
- Generación de código en pipelines de CI/CD: el modelo soporta HumanEval y tool calling, y puede integrarse como paso de generación o revisión de parches con llama.cpp o transformers.
- Conversión de lenguaje natural a comandos de shell: NL2BASH se beneficia del enrutamiento de herramientas y de la contención de deliberación, útil en asistentes de consola.
- Asistentes con salida JSON estructurada: el subespacio de Turn-2 JSON permite generar respuestas parseables en flujos de function calling y orquestación de agentes.
- Evaluación de mecanismos de interpretabilidad: investigadores pueden usar los 12 subespacios y los receptores BF16 capturados para estudiar cómo se modula el comportamiento de un modelo sin reentrenamiento.
- Despliegue local en GPU de consumo: la cuantización Q4_K_M (5,38 GiB) permite ejecutar el modelo en tarjetas de 12 GiB como la RTX 4070 Ti empleada en las evaluaciones.

## Benchmarks y rendimiento

Resultados sobre 270 tareas locales (`agent100` + `stem150` + `tbench20` en WSL2), comparando el modelo base con las variantes WSP:

| Variante | Total (270) | Delta vs base | agent100 (100) | stem150 (150, truncamientos) | tbench20 (20, E/M/H) | Tokens medios (a100 / s150 / tb20) |
|---|---:|---:|---:|---:|---:|---:|
| Base (Q4_K_M) | 134/270 (49,6 %) | — | 73/100 | 57/150 (cut=83) | 4/20 (3/10 · 0/9 · 1/1) | 435,5 / 890,5 / 708,8 |
| WSP V1 | 162/270 (60,0 %) | +10,4 pp (+28) | 83/100 | 74/150 (cut=2) | 5/20 (3/10 · 1/9 · 1/1) | 377,7 / 647,8 / 621,7 |
| WSP V2 | 160/270 (59,3 %) | +9,6 pp (+26) | 85/100 | 72/150 (cut=30) | 3/20 (2/10 · 1/9 · 0/1) | 343,6 / 768,9 / 661,1 |
| WSP V3 (por defecto) | 163/270 (60,4 %) | +10,7 pp (+29) | 86/100 | 73/150 (cut=19) | 4/20 | no disponible |

Desglose de subconjuntos reportado por el autor:

| Subconjunto | Base | WSP V1 | WSP V3 |
|---|---:|---:|---:|
| EST_GSM8K (20) | 6/20 | no disponible | 16/20 |
| EST_HUMANEVAL (15) | 13/15 | no disponible | 14/15 |
| EST_NL2BASH (20) | 16/20 | no disponible | 18/20 |
| S2_RESTRAINT (4) | 3/4 | no disponible | 4/4 |
| Holdout (30) | 27/30 | 26/30 | 27/30 |
| STEM_MATH500 (50) | 0/50 | 15/50 | 13/50 |
| STEM_MMLU_4C (50) | no disponible | no disponible | 39/50 (78,0 %) |

En el modelo base, sobre ítems no truncados, se reporta 19/26 (73,1 %) en MMLU-Pro (19/24 = 79,2 % con letra parseable) y 38/41 (92,7 %) en MMLU-4C. Los resultados corresponden a evaluaciones internas del autor, no a leaderboards independientes.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 5,38 GiB de pesos; con contexto de 16K y caché KV en q8_0 se ejecutó en una RTX 4070 Ti de 12 GiB. En BF16, los ~9,2 B parámetros requieren aproximadamente 18,4 GB solo para pesos.
- GPU recomendadas: RTX 4070 Ti (12 GiB) validada por el autor para Q4_K_M; para BF16 se necesitan A100 40 GB, H100 o RTX 4090 24 GB con cuantización parcial.
- GPU de consumo: sí, en GPUs de 12 GiB o más con la cuantización Q4_K_M; en 8 GiB requeriría cuantizaciones menores no incluidas en el repositorio.
- Opciones de despliegue: llama.cpp (vía `run_wsp.py` con el GGUF incluido), transformers con safetensors y los 12 adaptadores LoRA dinámicos, y endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles de forma agregada; el autor reporta una reducción de tokens de finalización del 19,9 % en `agent100` (435,5 → 348,9) y de 708,8 → 585,5 en `tbench20` con WSP V3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---:|---|---|---|
| jstarks/Qwen3.5-9B-DeepThought-STEM-WSP (este) | 9,2 B | no disponible | Apache 2.0 | HF, safetensors + GGUF + LoRA | 163/270 en suite interna del autor |
| xtools-at/Qwen3.5-9B-DeepThought-STEM (base) | 9,2 B | no disponible | Apache 2.0 | HF | 134/270 en la misma suite |
| Qwen/Qwen3.5-9B (raíz) | 9,2 B | no disponible | no disponible | HF | Sin datos de benchmark en la informacion proporcionada |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,2 B | no disponible | no disponible | HF | Variante intermedia de la cadena de fine-tuning |

No se dispone de comparaciones con modelos de otras familias en la informacion proporcionada; los datos de la tabla se limitan a la cadena de derivación del propio modelo.

## Limitaciones y advertencias

- Los benchmarks son evaluaciones internas del autor sobre 270 tareas locales, sin validación independiente ni comparación con leaderboards públicos.
- La mejora en `stem150` es menor en V3 (48,7 %) que en V1 (49,3 %), y V3 introduce 19 truncamientos frente a 2 de V1; la variante por defecto no es la mejor en todos los subconjuntos.
- En `tbench20`, WSP V3 no mejora al modelo base (4/20 en ambos); la mejora solo aparece en V1 (5/20).
- El modelo base ya mostraba un 92,7 % en MMLU-4C sobre ítems no truncados, por lo que parte del margen de mejora procede de corregir el comportamiento de deliberación, no de conocimiento nuevo.
- Los subespacios se calcularon con `temperature=0.0` y `seed=42`; el comportamiento puede degradarse con muestreo estocástico o con prompts fuera de la distribución evaluada.
- El modelo base incluye una variante "uncensored/heretic" en su linaje, lo que puede implicar una menor alineación de seguridad; no se documentan evaluaciones de seguridad.
- Idiomas soportados no documentados; no hay garantías de rendimiento fuera del inglés.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El despliegue requiere aplicar los 12 adaptadores LoRA dinámicos en el orden correcto; un uso incorrecto de `run_wsp.py` o de los subespacios puede anular las mejoras reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming
- Modelo base fine-tuned: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Variante intermedia heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantización GGUF de referencia: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF

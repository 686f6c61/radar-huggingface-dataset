# deshwalmahesh/d-edge-decision

## Resumen

D-Edge-Decision es un modelo de decisión tipada de 3.930 millones de parámetros publicado por `deshwalmahesh`, obtenido mediante un *fine-tune* completo de `domyn/Domyn-Edge-SFT` (familia Domyn Edge, desarrollada por Domyn). Su singularidad es que no genera texto: responde a una decisión (sí/no, elección múltiple o puntuación graduada) en un único paso hacia delante (*forward pass*), leyendo la distribución del siguiente token sobre códigos de opción de un solo token (`A`, `B`, `C`, …) como la respuesta. El resultado es una distribución de probabilidad sobre las opciones, ya calibrada con temperatura 1.0, sin *chain-of-thought*, sin tokens de salida y sin confianza verbalizada.

El modelo está pensado para integrarse en sistemas que necesitan clasificar, enrutar o puntuar estados de forma masiva y barata: atención al cliente, *routing* de tickets, moderación, *benchmarking* de decisiones. Al no generar tokens, el coste por inferencia es mínimo y la latencia es del orden de decenas de milisegundos. La arquitectura subyacente es un transformer causal de la familia Domyn Edge, con tokenizador y plantilla de chat propios (requiere `trust_remote_code=True`).

Es relevante ahora porque propone un paradigma distinto al del razonamiento generativo: en lugar de invocar un modelo grande con modo *thinking* para tareas de decisión, extrae la distribución de la cabeza LM directamente. El autor lo presenta como modelo de "Sistema Uno": rápido, barato y calibrado por construcción, con la calibración como propiedad emergente del entrenamiento y no como capa de post-procesado. El entrenamiento completo se hizo en aproximadamente 7 horas en una sola H200, sin barrido de hiperparámetros ni ablaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivado de `domyn/Domyn-Edge-SFT`), con `custom_code` y tokenizador propio |
| Parámetros totales | 3.928.787.968 (≈3,93 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ); el autor recomienda fp16. vLLM soporta `--dtype float16`; bf16 presenta un problema de precisión en rotary en la build de referencia |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (repo de 23,6 GB), cargable con `transformers` |
| Modelo base | `domyn/Domyn-Edge-SFT` |
| Librería | `transformers` (con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de la familia Domyn Edge, reentrenado (*full fine-tune*, no LoRA) sobre `domyn/Domyn-Edge-SFT`. El autor indica que el *data cleaning*, la preparación y el *fine-tune* completo se completaron en unas 7 horas de extremo a extremo en una única NVIDIA H200, sin barrido de hiperparámetros ni ablaciones. El *harness* de referencia usa Python 3.12, `transformers==5.22.1`, `torch==2.15.0`, `tokenizers==0.23.3` y `einops`. El modelo requiere `trust_remote_code=True`, lo que implica cargar código personalizado del repositorio.

La innovación central es la lectura "nativa" de la decisión: el *prompt* se renderiza hasta la posición de decisión y la distribución del siguiente token sobre los códigos de opción (`A`, `B`, `C`, …) se interpreta directamente como probabilidad sobre las alternativas. Para evitar degradación numérica, el autor aplica un *forward hook* que fuerza la cabeza LM a fp32, ya que los *logits* de opción se sitúan en el rango ~30–36, donde un paso en fp16 desplaza una probabilidad en un punto. Se desactiva `autocast` y se carga en fp16, porque en bf16 la query normalizada queda en fp32 mientras el value sigue en fp16 y la atención rechaza la mezcla de dtypes. Los datos de entrenamiento son los *datasets* `tasksource/tasksource-jev-typed-decisions` y `caiovicentino1/eikos-decisions`, orientados a decisiones tipadas; no se detalla número de tokens ni composición exacta del corpus.

## Capacidades

- Decisión tipada en un solo paso hacia delante: sí/no, elección múltiple y puntuación graduada, devolviendo una distribución de probabilidad nativa y calibrada sobre las opciones.
- Calibración integrada: ECE ≈ 0,016 en el *split* público de JevBench v1.8.7, con temperatura 1.0 y sin capa de calibración post-hoc.
- Cero tokens generados: la respuesta se obtiene del *logit* del primer token, lo que minimiza coste y latencia.
- Salida probabilística interpretable: el resultado es un *dict* opción→probabilidad, apto para umbrales y agregación posterior.
- Compatibilidad con `transformers` y con servidor vLLM (`vllm serve ... --trust-remote-code --dtype float16`), leyendo los *logprobs* del primer token.
- Plantilla de chat propia con `enable_thinking=False` (no se usa modo *thinking*; el modelo no genera razonamiento).
- No documenta capacidades de *tool calling*, agentes multi-paso, visión, audio ni matemáticas generativas; el modelo no está orientado a generación libre.
- Multilingüe: no. Solo inglés.

## Casos de uso

- **Enrutamiento de tickets de soporte**: dado un estado textual y un conjunto de equipos (billing, shipping, etc.), el modelo devuelve la probabilidad por equipo en un solo *forward pass*. Adecuado porque el coste por decisión es mínimo y la salida es una distribución, no una etiqueta rígida.
- **Clasificación binaria con umbral calibrado**: tareas tipo "¿es spam?", "¿requiere revisión humana?" o "¿es una queja?", con probabilidad calibrada para fijar umbrales sin recalibración posterior (ECE ≈ 0,016).
- **Moderación y scoring graduado**: asignar una puntuación de riesgo o calidad sobre una escala de opciones, aprovechando la distribución como medida de incertidumbre.
- **Evaluación de decisiones en pipelines de benchmark**: usar el modelo como *baseline* ligero en JevBench u otros *benchmarks* de decisión, gracias a su adaptador publicado (PR #241) y su soporte de vLLM.
- **Selección de opción en flujos de datos estructurados**: dado un estado y una pregunta con opciones discretas, decidir la mejor opción por *logprob* sin generar texto, integrándolo en procesos por lotes.
- **Abstención por incertidumbre**: cuando la distribución sobre las opciones es plana, derivar a un humano o a un modelo mayor; la calibración hace fiable esta política de abstención.
- **Enriquecimiento de datos con etiquetas blandas**: anotar grandes volúmenes con distribuciones suaves sobre opciones, útiles para entrenar modelos descendientes o para *active learning*.

## Benchmarks y rendimiento

Datos disponibles según el autor: JevBench v1.8.7 (split público, 283 sistemas clasificados, excluyendo Speed/Cost del compuesto).

| # | Sistema | Base | Composite | Capability | Intelligence | Calibration | Speed\* | Cost\* |
|---|---|---|---|---|---|---|---|---|
| 1 | D-Edge-Decision (este) | Domyn-Edge-SFT 3.9B | **85.50** | **85.50** | **85.00** | 86.00 | 100 | 82 |
| 2 | Super Decider | DiffusionGemma 26B-A4B | 84.45 | 84.87 | 78.89 | **90.85** | 83 | 58 |
| 3 | Torchcast Decision | Qwen3.5-4B | 76.12 | 77.50 | 67.15 | 87.85 | 100 | 82 |
| 4 | H2O-Lightning v1.1 | Qwen3.5-4B | 72.01 | 75.00 | 60.04 | 89.95 | 100 | 82 |
| 5 | Myles-G | gemma-4-12B | 68.11 | 70.65 | 57.25 | 84.05 | 90 | 68 |
| – | Jev 1.13 (referencia) | – | 74.74 | 77.10 | 63.60 | 90.60 | – | – |

\* Speed/Cost se asignan por recuento total de parámetros (4B → 100/82; 12B → 90/68; 26B → 83/58) y se excluyen del Composite. Composite = media armónica de Intelligence y Calibration.

Resultados por nivel (*tier*) en el split público: easy **1.000**, original **0.972**, hard **0.667**; ECE ≈ **0.016**; latencia p50 ≈ **41 ms**. El autor indica que estos resultados son de una única ejecución, sin ablaciones, y que los niveles *hard*, calibración y coste no están optimizados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de *benchmarks* generativos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el repo pesa 23,6 GB en `safetensors`; en fp16 los pesos ocupan ≈7,9 GB, más activaciones y caché KV (no disponible la longitud de contexto). En la práctica, se puede servir en una GPU de 24 GB con holgura y en GPUs de 16 GB con cuidado del contexto.
- **GPU recomendadas**: NVIDIA H200 (stack de entrenamiento y referencia), A100 40/80 GB, L40S, RTX 4090 (24 GB) y RTX 4080 (16 GB) para cargas modestas.
- **Consumer GPU**: sí; en fp16 cabe en una RTX 4090 de 24 GB y, con contexto corto, en GPUs de 16 GB.
- **Despliegue**: `transformers` (con `trust_remote_code=True`, fp16, sin `autocast`, y *hook* fp32 en la cabeza LM) o vLLM (`vllm serve ... --trust-remote-code --dtype float16`). No se documentan Ollama, llama.cpp, GGUF ni TGI.
- **Latencia**: p50 ≈ 41 ms por decisión según JevBench; al no generar tokens, el coste de salida es cero.
- **Throughput**: no disponible de forma explícita; se puede inferir por el coste de un único *forward pass*, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench Composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **D-Edge-Decision** | 3,93 B | no disponible | **85,50** | Apache-2.0 | HF (`deshwalmahesh/d-edge-decision`) |
| Super Decider | 26 B (26B-A4B, MoE) | no disponible | 84,45 | no disponible | JevBench |
| Torchcast Decision | ~4 B (Qwen3.5-4B) | no disponible | 76,12 | no disponible | JevBench |
| H2O-Lightning v1.1 | ~4 B (Qwen3.5-4B) | no disponible | 72,01 | no disponible | JevBench |
| Jev 1.13 (referencia hosted) | no disponible | no disponible | 74,74 | no disponible | API |
| Myles-G | ~12 B (gemma-4-12B) | no disponible | 68,11 | no disponible | JevBench |

La comparativa se limita al *benchmark* JevBench publicado por el autor; no hay datos de MMLU, HumanEval ni de otros *benchmarks* estándar que permitan comparar con modelos de propósito general. El interés de la tabla es que D-Edge-Decision supera en Composite a un sistema de 26 B y a varios de 4 B y 12 B, con un coste de inferencia menor al no generar tokens.

## Limitaciones y advertencias

- **Idioma**: solo inglés; no hay soporte multilingüe declarado.
- **Naturaleza del modelo**: no es un modelo generativo. Usarlo como *chat* o para redactar producirá resultados pobres o incoherentes; está diseñado exclusivamente para lectura de distribución sobre opciones de un solo token.
- **Opciones codificadas**: la respuesta se lee sobre códigos de opción `A`, `B`, `C`, … de un solo token; opciones que no encajen en ese esquema o un número muy alto de alternativas pueden degradar la lectura.
- **Fragmentación del ecosistema**: requiere `trust_remote_code=True`, versión concreta de `transformers` (5.22.1 en la referencia) y un *hook* fp32 en la cabeza LM; desviarse del *harness* evaluado puede alterar la calibración.
- **bf16**: el autor reporta un problema de precisión en rotary con bf16; no se debe usar sin verificar.
- **Resultados de una sola ejecución**: no hay barrido de hiperparámetros ni ablaciones; el propio autor reconoce que el *tier* hard (0,667), la calibración y el coste no están optimizados.
- **Riesgo de alucinación**: en el sentido generativo no aplica directamente, pero sí puede producir distribuciones sobreconfiadas cuando el estado está fuera de la distribución de entrenamiento; la calibración medida (ECE 0,016) es sobre el *split* público de JevBench, no sobre dominios arbitrarios.
- **Sesgos**: no se documenta ningún análisis de sesgos; al derivar de `domyn/Domyn-Edge-SFT`, heredaría los sesgos del modelo base y de los *datasets* `tasksource/tasksource-jev-typed-decisions` y `caiovicentino1/eikos-decisions`.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (`domyn/Domyn-Edge-SFT`) y de los *datasets* por si imponen condiciones adicionales.
- **Uso en producción**: el autor no reporta validación fuera de JevBench; para producción conviene evaluar calibración en el dominio propio antes de fijar umbrales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deshwalmahesh/d-edge-decision
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset Eikos: https://huggingface.co/datasets/caiovicentino1/eikos-decisions
- Adaptador JevBench (PR #241): https://github.com/fstandhartinger/jevbench/pull/241
- JevBench: https://github.com/fstandhartinger/jevbench
- Leaderboard privado: https://benchmarkheaven.com

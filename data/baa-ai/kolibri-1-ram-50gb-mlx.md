# baa-ai/Kolibri-1-RAM-50GB-MLX

## Resumen

Kolibri-1-RAM-50GB-MLX es una compilacion cuantizada en precision mixta del modelo Kolibri-1 de Aleph Alpha, publicada por baa.ai (usuario `baa-ai`) para el framework MLX de Apple Silicon. Se trata de un modelo de lenguaje tipo Mixture of Experts (MoE) de 78.103.055.360 parametros totales y 3.46B parametros activos por token, derivado directamente del release `Aleph-Alpha/Kolibri-1-BF16` (156 GB). El objetivo de esta build es reducir el peso a 49,9 GB en disco (5,12 bits por peso de media) manteniendo calidad equiparable a una referencia uniforme de 8 bits de 82,7 GB, y hacer viable su ejecucion en Macs con 64 GB o mas de memoria unificada, donde el release FP8 de 78 GB del fabricante requiere GPUs de centro de datos.

La arquitectura `kolibri1` es nueva (publicada el 3 de octubre de 2026): 50 capas, 384 expertos enrutados mas 1 compartido, 6 activos por token, y atencion con ventana deslizante en proporcion 4:1 respecto a la global. Es un modelo de razonamiento bilingue aleman/ingles, con control del modo "thinking" mediante el parametro `reasoning_effort` del chat template.

La relevancia actual de esta ficha radica en dos puntos: primero, es un punto de operacion ("efficiency knee") de la curva de presupuesto de RAM elegido tras medir que no degrada frente a la referencia de 8 bits; segundo, incorpora un cribado de seguridad agentica basado en el paper *Fidelity Is Not Safety* (arXiv:2607.28196), que evalua la confabulacion de pasos de procedimiento en ejecucion de SOP/agentes. Requiere soporte de Kolibri en `mlx-lm` (PR ml-explore/mlx-lm#1945) mientras no se fusione.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`kolibri1`), 50 capas, 384 expertos enrutados + 1 compartido, 6 activos por token, atencion sliding-window:global 4:1 |
| Parametros totales | 78.103.055.360 |
| Parametros activos | 3,46 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta, 5,12 bits por peso de media (rango 3-8 bits). Expertos enrutados (`switch_mlp`): 3-5 bits en capas 0-30, 6 bits en capas 31-49 (un `down_proj` a 8 bits, capa 41). Atencion (q/k/v/o), experto compartido y router: 8 bits. Embeddings, LM head, normas y sesgo del router: BF16 sin cuantizar. Tamano de grupo: 64. El tag del repo indica "4-bit", pero el promedio real declarado es 5,12 bpw |
| Idiomas soportados | aleman (de) e ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Tamano en disco | 49,9 GB (46,5 GiB) |
| Huella en memoria | ~46,5 GiB (pesos) + cache KV |
| Framework | MLX (Apple Silicon) |
| Modelo base | Aleph-Alpha/Kolibri-1-BF16 (156 GB) |

## Arquitectura y entrenamiento

Kolibri-1 es un transformer de tipo Mixture of Experts con 50 capas, 384 expertos enrutados mas un experto compartido y 6 expertos activados por token, lo que da un ratio de activacion muy bajo (3,46B activos sobre 78B totales). La atencion combina ventana deslizante y atencion global en proporcion 4:1, un patron habitual en modelos de contexto largo orientado a eficiencia de cache. Esta ficha concreta no reentrena el modelo: parte del checkpoint BF16 de Aleph Alpha (`Aleph-Alpha/Kolibri-1-BF16`) y aplica una cuantizacion de precision mixta capa por capa, asignando mas bits a las capas profundas (6 bits en 31-49) y menos a las iniciales (3-5 bits en 0-30), con 8 bits para atencion, experto compartido y router, y BF16 para embeddings, LM head, normas y sesgo del router.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO en el modelo original. Si se conoce que Kolibri-1 es un modelo de razonamiento y que su modo de pensamiento se controla mediante `reasoning_effort` en el chat template. La innovacion tecnica de esta build es el punto de operacion elegido (5,12 bpw) tras comparar varios presupuestos de RAM: se descarto un punto menor de 43,0 GB / 4,41 bpw (no publicado) que quedaba ligeramente por detras en razonamiento, y se selecciono la build que iguala a la referencia uniforme de 8 bits. Ademas, se documenta un cribado de seguridad agentica (gate de coherencia x tasa de error y canario conductual) inexistente en el modelo base.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con modo "thinking" activable y desactivable mediante `reasoning_effort` (`none` para respuesta directa).
- Razonamiento matematico y resolucion de problemas multi-paso (evaluado en MMLU-Pro math y GSM8K).
- Cumplimiento estricto del contexto aportado: en la prueba de fidelidad obtiene 1,00 en "context deference" y 0,00 en "parametric override", es decir, prioriza el contexto sobre su memoria parametrica.
- Conocimiento de libro cerrado (closed-book) alto segun la metrica reportada (96,7%).
- Ejecucion de SOPs y flujos de agente con cero confabulacion de pasos cruzados en el canario conductual (invented_x = 0,000).
- Capacidades bilingues aleman/ingles.
- No se documentan capacidades de vision, audio, tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes multi-paso mas alla del cribado de SOP.

## Casos de uso

- Razonamiento asistido en aleman e ingles: el modelo puede resolver problemas matematicos y de logica paso a paso activando `reasoning_effort`; su rendimiento de 95,0% en MMLU-Pro math (n=60) y 84% en GSM8K (n=50) lo hace adecuado para tutoria y asistentes de analisis en estos dos idiomas.
- Ejecucion de procedimientos operativos (SOP) en entornos de agente: el canario conductual muestra invented_x = 0,000 y recall 0,993, de modo que puede seguir procedimientos sin inventar pasos cruzados, apropiado para asistentes internos de operaciones.
- Sistemas RAG con contexto largo: la fidelidad al contexto (context deference 1,00) y el patron de atencion sliding-window:global 4:1 lo hacen util para responder sobre documentacion aportada sin sustituirla por memoria parametrica.
- Despliegue local en estaciones de trabajo Apple Silicon: con 49,9 GB en disco y ~46,5 GiB en memoria, cabe en Macs con 64 GB o mas de memoria unificada, permitiendo inferencia on-premise sin GPU de centro de datos.
- Atencion al cliente bilingue (de/en): conversacion multi-turno en dos idiomas, con la ventaja de que el modelo cede ante el contexto de la empresa en lugar de inventar datos.
- Cribado de calidad de compresiones MoE: esta build y su metodologia (gate de coherencia, canario de SOP) sirven como referencia para equipos que cuantizan modelos grandes y necesitan verificar que no introducen regresiones de fiabilidad agentica.
- Extraccion de conocimiento de libro cerrado: con 96,7% en facts closed-book, puede usarse para preguntas factuales sin recuperacion externa, sujeto a los riesgos de alucinacion habituales.

## Benchmarks y rendimiento

MMLU (subconjunto de 100 preguntas, razonamiento desactivado, greedy):

| Modelo | MMLU-100 | Tamano en disco |
|---|---|---|
| Esta build - RAM-50GB (mixta, 5,12 bpw) | 73% (73/100) | 49,9 GB |
| Referencia uniforme 8 bits | 74% (74/100) | 82,7 GB |
| Punto RAM 43 GB (4,41 bpw, no publicado) | 74% (74/100) | 43,0 GB |

Razonamiento (thinking activado):

| Modelo | MMLU-Pro math | Cumplimiento de formato de respuesta | GSM8K |
|---|---|---|---|
| Esta build - RAM-50GB | 95,0% | 80,0% | 84% |
| Referencia uniforme 8 bits | 95,0% | 78,3% | 82% |
| Punto RAM 43 GB (no publicado) | 93,3% | 76,7% | 76% |

Fidelidad y conocimiento (razonamiento desactivado):

| Modelo | Context deference | Comprehension | Parametric override | Facts closed-book |
|---|---|---|---|---|
| Esta build - RAM-50GB | 1,00 | 1,00 | 0,00 | 96,7% |
| Referencia uniforme 8 bits | 1,00 | 1,00 | 0,00 | 96,7% |

Cribado de seguridad agentica:

| Prueba | Metrica | Valor | Umbral | Resultado |
|---|---|---|---|---|
| Gate coherencia x tasa de error | coherent_fraction | 0,149 | > 0,007 | por encima |
| Gate coherencia x tasa de error | error_rate | 0,00006 | > 0,01 | por debajo (PASS global) |
| Canario conductual | invented_x | 0,000 | - | RELIABLE |
| Canario conductual | recall | 0,993 | - | RELIABLE |
| Canario conductual | branch | 0,979 | - | RELIABLE |

Nota: el MMLU es un subconjunto de 100 preguntas con razonamiento off, no el conjunto completo de 14k. Aleph Alpha publica sus propios numeros de razonamiento (por ejemplo, MMLU-Pro CoT EN 80,0) en su model card original.

## Requisitos de hardware

- VRAM/memoria: ~46,5 GiB para pesos mas la cache KV. Recomendado Mac con 64 GB o mas de memoria unificada.
- GPU recomendadas: no aplica a GPU NVIDIA o AMD discretas; la build es especifica de MLX y Apple Silicon. El release FP8 del fabricante (~78 GB) si requiere GPUs de centro de datos.
- Consumer GPU: no cabe en GPUs de consumo convencionales por formato (MLX) y tamano; el objetivo son equipos Apple Silicon de gama alta con memoria unificada grande (por ejemplo, configuraciones de 64, 96, 128, 192 o 512 GB).
- Opciones de despliegue: MLX mediante `mlx-lm`. Requiere soporte de `kolibri1` en mlx-lm; hasta que se fusione el PR ml-explore/mlx-lm#1945, hay que instalar mlx-lm desde esa rama. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

Parametros de muestreo recomendados (del `generation_config.json` del modelo): `temperature` 1.0, `top_p` 0.97, `top_k` 128, `max_tokens` 8192.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Contexto | Rendimiento (MMLU-100 / MMLU-Pro math / GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| baa-ai/Kolibri-1-RAM-50GB-MLX (esta build) | 78B totales, 3,46B activos | 49,9 GB | no disponible | 73% / 95,0% / 84% | apache-2.0 | MLX, Apple Silicon 64 GB+ |
| Referencia uniforme 8 bits (MLX) | 78B totales, 3,46B activos | 82,7 GB | no disponible | 74% / 95,0% / 82% | apache-2.0 (base) | MLX |
| Aleph-Alpha/Kolibri-1-BF16 | 78B totales, 3,46B activos | 156 GB | no disponible | no ejecutable en el hardware del autor | apache-2.0 | safetensors BF16 |
| Release FP8 del fabricante | 78B totales, 3,46B activos | ~78 GB | no disponible | no disponible | apache-2.0 | GPUs de centro de datos |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva en expertos: los expertos enrutados se almacenan a 3-6 bits, y el gate de seguridad agentica no cubre precisamente esos tensores (estan como tensores 3-D apilados). El gate solo cubre tensores densos a 8 bits, por lo que su veredicto PASS debe leerse de forma restringida.
- Umbrales del gate calibrados en modelos densos de 7-8B: se trata de un MoE de 78B y 384 expertos, fuera de la bateria controlada del paper. El resultado es un cribado, no un certificado.
- MMLU medido sobre un subconjunto de 100 preguntas con razonamiento desactivado: una diferencia de 1/100 esta dentro del ruido. No es el MMLU completo de 14k preguntas.
- Idioma: solo aleman e ingles. No hay soporte declarado de castellano, lo que limita su uso en produccion en espanol.
- Modo razonamiento: el cumplimiento de formato de respuesta en thinking fue del 80,0%, con un 20% de casos que requirieron fallback a respuesta forzada en la evaluacion de MMLU-Pro math (presupuesto de 1024 tokens).
- Riesgo de alucinacion: aunque en el canario de SOP no inventa pasos, sigue siendo un modelo generativo y no se documentan controles adicionales fuera del ambito de agentes/SOP.
- Dependencia de framework: requiere MLX y una rama especifica de `mlx-lm` (PR #1945) mientras no se fusione, lo que complica despliegues reproducibles en produccion.
- Solo Apple Silicon: no hay build equivalente para GPU NVIDIA/AMD en esta ficha; el despliegue en servidores x86 requiere el release del fabricante.
- Licencia apache-2.0 sobre el modelo base: permite uso comercial, pero conviene verificar los terminos del modelo original de Aleph Alpha y de las dependencias (mlx-lm).
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baa-ai/Kolibri-1-RAM-50GB-MLX
- Modelo base BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Modelo original de Aleph Alpha: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Paper de referencia: https://arxiv.org/abs/2607.28196 (*Fidelity Is Not Safety*)
- Codigo del paper: https://github.com/baa-ai/fidelity-is-not-safety
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/1945
- Sitio del autor: https://baa.ai

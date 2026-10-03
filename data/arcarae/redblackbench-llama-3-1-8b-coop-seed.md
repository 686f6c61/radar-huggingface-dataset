# Arcarae/redblackbench-llama-3.1-8b-coop-seed

## Resumen

El modelo `Arcarae/redblackbench-llama-3.1-8b-coop-seed` es un adaptador LoRA (PEFT) entrenado sobre `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario Arcarae. No es un modelo de propósito general: es una "semilla cooperativa" (cooperative seed) diseñada para inducir comportamientos de cooperación en sistemas multiagente. Forma parte del trabajo "You Only Align Once: Propagating Cooperative Behaviors in Multi-Agent Systems through Seed Agents" (Hsing, Zheng, Zhao, Tu y Huang, arXiv:2605.27586), concretamente de la pregunta de investigación RQ2, que comprueba si el mecanismo de alineación cooperativa es transferible entre arquitecturas base distintas.

El adaptador se ha afinado con el mismo pipeline que la semilla sobre Qwen3-14B (`Arcarae/redblackbench-qwen3-14b-sft-v2`), empleando 10 607 deliberaciones "ideales" generadas por Kimi-K2 a partir de 270 partidas del juego Red-Black, con todos los objetivos terminando en `VOTE: A` (cooperar). La relevancia práctica está en que un único agente semilla, insertado entre compañeros LLaMA-3.1-8B-Instruct sin modificar, eleva la tasa de cooperación en el Red-Black Game del 62,7 % al 97,0 %, igualando el resultado de la semilla sobre Qwen. Esto sugiere que el mecanismo no depende de un modelo base concreto, lo que resulta de interés para investigación en alineación multiagente y dinámicas de cooperación.

Al tratarse de un adaptador LoRA de rango 128, no sustituye al modelo base: requiere cargar Llama-3.1-8B-Instruct y aplicar el adaptador por encima (o fusionarlo). El repositorio ocupa 1,4 GB, está etiquetado para inglés y hereda la licencia Llama 3.1 de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA sobre las proyecciones q/k/v/o/gate/up/down |
| Parametros totales | 8 030 millones en el modelo base (el recuento del adaptador no está disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; el entrenamiento del adaptador usó secuencias de 2 048 tokens como máximo |
| Tipos de cuantizacion | No disponible en la información proporcionada (adaptador LoRA en safetensors; se puede fusionar con el base y cuantizar a 8/4 bits) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con 8 030 millones de parámetros y ventana de contexto nativa de 128 000 tokens. Sobre él se aplica un adaptador LoRA con rango 128, alpha 256 y dropout 0,05, inyectado en las proyecciones de atención (q, k, v, o) y en las proyecciones del MLP (gate, up, down). No se modifica ningún peso del modelo base; el adaptador añade un conjunto de matrices de bajo rango que se pueden cargar por separado o fusionar.

Los datos de entrenamiento provienen del dataset `Arcarae/redblackbench-sft-batches-2-3-10k`: 10 607 deliberaciones ideales generadas por Kimi-K2 a partir de 270 partidas del juego Red-Black, donde cada objetivo de entrenamiento termina en `VOTE: A`, es decir, en la acción de cooperar. La optimización se realizó durante 3 épocas con learning rate 5e-5, scheduler coseno, batch efectivo de 32, longitud máxima de secuencia de 2 048 tokens y pérdida calculada únicamente sobre los tokens de completación (completion-only loss), con semilla 42. Todos estos hiperparámetros están registrados en el fichero `training_meta.json` que acompaña al adaptador. No se documenta en la información disponible el uso de RLHF, DPO u otra etapa de preferencias posterior al SFT.

La innovación técnica no reside en la arquitectura, sino en el procedimiento: en lugar de alinear cada agente del sistema, se alinea un único agente semilla y se propaga el comportamiento cooperativo al resto de la población multiagente. El experimento RQ2 demuestra la transferibilidad del enfoque entre familias de modelos (Llama y Qwen) usando el mismo pipeline de datos y entrenamiento.

## Capacidades

- Generación de texto y deliberación en inglés, heredadas del modelo base Llama-3.1-8B-Instruct.
- Emisión de votos estructurados en el formato `VOTE: A` dentro de la dinámica del Red-Black Game, con una fuerte preferencia aprendida por la opción cooperativa.
- Inducción de cooperación en poblaciones multiagente: actúa como semilla que modifica el comportamiento agregado de compañeros no modificados.
- Razonamiento multi-turno dentro de la estructura de deliberación del dataset de entrenamiento.
- Capacidades de instrucción general y tool calling potencialmente heredadas del base, aunque no se documentan ni se evalúan en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo "thinking" explícito, visión o audio: no disponibles.

## Casos de uso

- Investigación en alineación multiagente: servir como agente semilla en simulaciones poblacionales para medir la propagación de comportamientos cooperativos frente a una línea base no alineada.
- Reproducción de los experimentos de RQ2: cargar el adaptador en vLLM junto a compañeros LLaMA-3.1-8B-Instruct y ejecutar `scripts/eval_heterogeneous.py` para replicar la subida de cooperación del 62,7 % al 97,0 %.
- Estudios de heterogeneidad de modelos: combinar esta semilla LLaMA con la semilla Qwen3-14B y otros agentes para analizar si la cooperación se mantiene cuando la población es mixta.
- Simulación de negociación y dilemas sociales: usar el adaptador como participante cooperativo en juegos tipo Red-Black, prisoner's dilemma o escenarios de recursos compartidos.
- Generación de datos sintéticos de deliberación cooperativa: emplear el adaptador para producir trazas de razonamiento que terminen en decisiones cooperativas, reutilizables como material de SFT para otros agentes.
- Evaluación de robustez y seguridad de sistemas multiagente: medir si una población con mayoría cooperativa es explotable por agentes egoístas o adversarios inyectados.
- Docencia y divulgación: demostrar de forma reproducible cómo un ajuste fino pequeño (LoRA) sobre un modelo de 8B altera cualitativamente la dinámica de un sistema multiagente.

## Benchmarks y rendimiento

El único resultado cuantitativo publicado en la información disponible es la tasa de cooperación en el Red-Black Game, medida con temperatura 0,7 y con la semilla insertada entre compañeros LLaMA-3.1-8B-Instruct sin modificar.

| Evaluacion | Modelo base LLaMA-3.1-8B-Instruct | Con la semilla LoRA |
|---|---|---|
| Tasa de cooperacion en Red-Black Game | 62,7 % | 97,0 % |

El autor indica que este resultado iguala el obtenido por la semilla equivalente sobre Qwen3-14B. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible, y no se recomienda extrapolar el rendimiento del adaptador a tareas ajenas al juego evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia, incluyendo el modelo base de 8B: en torno a 16-17 GB en bf16/fp16, unos 9-10 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits (estimaciones por tamaño de parámetros, no medidas publicadas por el autor).
- El adaptador LoRA en sí ocupa 1,4 GB en el repositorio, pero no es autónomo: requiere el modelo base.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para despliegue en bf16 con holgura; RTX 4090 (24 GB) suficiente para bf16 de un solo modelo; RTX 3090, RTX 4080 o GPUs con 8-12 GB pueden servir si se aplica cuantización a 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: vLLM con soporte LoRA es la vía documentada por el autor (`vllm serve meta-llama/Llama-3.1-8B-Instruct --enable-lora --max-lora-rank 128 --lora-modules ...`). También son viables TGI, llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: para evaluación, el autor fija temperatura 0,7.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| redblackbench-llama-3.1-8b-coop-seed (este) | 8B base + LoRA r=128 | 128k (base); 2 048 en entrenamiento | 97,0 % de cooperación en Red-Black Game (base: 62,7 %) | llama3.1 | HuggingFace, 0 descargas |
| Arcarae/redblackbench-qwen3-14b-sft-v2 (semilla Qwen) | 14B base + LoRA | No disponible | Alcanza el mismo 97,0 % de cooperación según el autor | No disponible en la información proporcionada | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct (base sin modificar) | 8B | 128k | 62,7 % de cooperación en Red-Black Game | llama3.1 | HuggingFace, ampliamente desplegado |

La comparación con modelos de propósito general (Mistral, Qwen, Gemma) no resulta pertinente porque el adaptador está especializado en una dinámica multiagente concreta y no se han publicado evaluaciones generalistas.

## Limitaciones y advertencias

- Especialización extrema: el adaptador está entrenado exclusivamente sobre objetivos que terminan en `VOTE: A`; su comportamiento fuera del formato y del dominio del Red-Black Game no está evaluado y probablemente degrade las capacidades generales del base.
- Riesgo de sobreajuste al formato: el completion-only loss sobre respuestas que siempre acaban en la misma acción puede producir votos cooperativos incluso cuando la situación no lo justifica.
- Idiomas: solo inglés; no hay evidencia de transferencia a castellano ni a otros idiomas.
- Contexto efectivo: aunque el base soporta 128k tokens, el entrenamiento usó 2 048 tokens, por lo que no hay garantía de comportamiento correcto en contextos largos.
- Sesgos: no se documentan análisis de sesgo. Al derivar de Llama 3.1 y de datos sintéticos generados por Kimi-K2, puede heredar sesgos de ambos.
- Alucinación: no se han publicado evaluaciones de veracidad; el adaptador prioriza la coherencia con el patrón de deliberación aprendido.
- Licencia: hereda la Llama 3.1 Community License, con sus restricciones de uso comercial, obligaciones de atribución y la cláusula de licencia aceptable; además hay que cumplir la licencia del modelo base de Meta.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicación reciente y sin validación externa conocida. No se recomienda su uso en producción sin una evaluación propia.
- Dependencia del modelo base: no funciona de forma autónoma; requiere descargar Llama-3.1-8B-Instruct, sujeto a sus propios términos de acceso.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Arcarae/redblackbench-llama-3.1-8b-coop-seed
- Dataset de entrenamiento: https://huggingface.co/datasets/Arcarae/redblackbench-sft-batches-2-3-10k
- Semilla equivalente sobre Qwen3-14B: https://huggingface.co/Arcarae/redblackbench-qwen3-14b-sft-v2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper: https://arxiv.org/abs/2605.27586 (Hsing, Zheng, Zhao, Tu y Huang, "You Only Align Once: Propagating Cooperative Behaviors in Multi-Agent Systems through Seed Agents")
- Repositorio de código y scripts de evaluación (`scripts/eval_heterogeneous.py`): https://github.com/arcarae/YOAO

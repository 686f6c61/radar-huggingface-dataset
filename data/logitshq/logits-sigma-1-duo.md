# logitshq/Logits-Sigma-1-Duo

## Resumen

Logits Sigma-1 Duo es un modelo de decisión en formato de conjunto (ensemble) publicado por logitshq. No genera texto: recibe peticiones del benchmark Decision Index y responde con la opción de mayor probabilidad (argmax) tras promediar al 50/50 las distribuciones de probabilidad de dos modelos miembros. Está empaquetado como un único repositorio de 61,2 GB que contiene dos subdirectorios (`a/` y `d3-ultra/`) con pesos en FP8 block-128, pensados para servirse simultáneamente en una sola GPU.

El miembro A es `PelaAI/KnowLine-31B-Gen1` con un LoRA propio de Logits (rank 64, α 128) fusionado a escala 0.5 y leído con el layout de prompt de Logits (códigos de opción de un token, empaquetado de prefijo compartido). El miembro B es `vllm-sr/d3-ultra` con su propio runtime y mecanismo de lectura (atención bidireccional de prefijo sobre el estado). Logits solo entrenó el LoRA del miembro A; el resto es trabajo de otros equipos.

Su relevancia es acotada y muy específica: es una pieza de evaluación para el benchmark Decision Index 0.3, con un resultado publicado de 72,93 (raw 79,54) sobre 140.178 peticiones puntuables, sin truncamientos ni reintentos. No es un modelo de propósito general ni un chat model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos modelos transformer (miembro A: KnowLine-31B-Gen1 + LoRA fusionado; miembro B: d3-ultra con atención bidireccional de estado y convoluciones causales) |
| Parametros totales | no disponible (repo de 61,2 GB en FP8; miembro A 33,3 GB, miembro B 27,8 GB) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible como ventana nominal; el miembro A empaqueta bloques de estado de hasta 8.192 tokens con forwards de hasta 16.384; peticiones de más de 50.000 caracteres (JSON compacto) se derivan solo al miembro A |
| Tipos de cuantizacion | FP8 block-128 (e4m3, escalas por bloque 128×128); activaciones en bf16; lectura en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 block-128), biblioteca transformers |

## Arquitectura y entrenamiento

El sistema es un ensemble de dos lectores de decisión sobre un mismo estado de petición. El miembro A (`logits_sigma_1_duo.engine:LogitsEngine`) usa la plantilla de chat de Gemma 4 con el modo thinking desactivado, etiqueta cada opción con un código de un token, lee los logits de esos códigos en la posición de respuesta y aplica softmax sobre los códigos de la pregunta. Las preguntas de una misma petición comparten el bloque de estado, que se lee una vez por petición. El miembro B (`d3_engine:D3Engine`, código de vllm-sr) realiza una lectura de código con atención bidireccional de prefijo sobre el estado. La mezcla es fija: media de probabilidades por opción en preguntas de elección y media de p(yes) en preguntas de sí/no, sin ajuste por benchmark.

El único componente entrenado por Logits es el LoRA del miembro A, en dos etapas sobre `google/gemma-4-31B-it` (revisión `842da379`). La etapa v6 se entrenó en 8× H200 con learning rate 1e-4 durante 1.500 pasos, aproximadamente el 78% de una época sobre 476.186 filas (480M tokens), con pérdida de entropía cruzada suave sobre los códigos de opción más 1,0 × KL hacia la base congelada más 0,3 × Brier. La etapa v7 warm continuó el adaptador de v6 con learning rate 5e-5 durante 600 pasos, cerca de media época sobre 158.750 filas (52.167 filas nuevas de profesor y 106.583 replicadas de v6, aproximadamente un tercio de los tokens), con pérdida final de entrenamiento de 0,379. La fusión se calcula como W' = W_KnowLine + 0,5 · (α / r) · B·A en fp32, se redondea una vez a bf16 y se convierte a FP8 block-128.

Los datos combinan `tasksource-jev-typed-decisions` (411 fuentes etiquetadas para uso comercial: 151.808 filas en v6 y 34.231 en v7 warm), las particiones de entrenamiento del benchmark Decision Index en el formato de petición de la suite (`ditrain`: 38.278 filas en v6 y 8.555 en v7 warm, con familias de generadores escritas para las habilidades del benchmark que no copian ningún ítem del mismo) y datos generados propios. El serving coloca ambos miembros en una GPU, con el miembro B en su propio stream CUDA; el motor imprime al cargar qué matmul FP8 (cuBLAS con escalas por bloque o el kernel Triton vendorizado) y qué kernels de d3-ultra (flash-linear-attention, causal-conv1d o la referencia de PyTorch) sirven la ejecución, y `environment.json` lo registra bajo `model_source`.

## Capacidades

- Clasificación de decisiones: responde peticiones del Decision Index con la opción argmax tras promediar las probabilidades de ambos miembros.
- Preguntas de elección múltiple mediante códigos de opción de un token y softmax restringido a los códigos de la pregunta.
- Preguntas de sí/no mediante la media de p(yes) de ambos miembros.
- Procesamiento de peticiones multi-pregunta con estado compartido: el bloque de estado se lee una vez por petición.
- Regla de tamaño determinista: peticiones de más de 50.000 caracteres en JSON compacto se responden solo con el miembro A, porque la atención bidireccional de d3-ultra requeriría unos 108 GiB.
- No genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso, y no tiene capacidades multimodales, de audio ni modo thinking.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Evaluación reproducible del benchmark Decision Index: ejecutar el pipeline completo con Docker o pip para obtener una puntuación de referencia (72,93 en la ejecución pública 0.3) sobre las 140.178 peticiones puntuables, con cero peticiones no soportadas y cero errores.
- Baseline de comparación para modelos de decisión: al ser un ensemble con mezcla fija 50/50 y sin ajuste por benchmark, sirve como referencia neutral frente a sistemas optimizados por tarea.
- Investigación sobre ensembles heterogéneos: permite estudiar el efecto de combinar dos mecanismos de lectura distintos (softmax sobre códigos de opción frente a atención bidireccional de estado) sobre la misma GPU y con pesos FP8.
- Validación de serving en FP8: el propio autor mide el acuerdo de decisión frente a los miembros en bf16 (99,40%, con umbral FP8 del 96%) y frente al mismo motor en H200 (99,43%), lo que lo hace útil para auditar la pérdida de calidad por cuantización block-128.
- Pruebas de infraestructura de inferencia: el despliegue compila causal-conv1d para las convoluciones cortas de d3-ultra y selecciona kernels en tiempo de carga, por lo que sirve para validar stacks con nvcc 13, driver NVIDIA ≥ 580 y Python 3.12.
- Medición de latencia y memoria en hardware Blackwell: con una RTX PRO 6000 Blackwell Server Edition y una petición a la vez, el diseño latency-v1 da mediana de 293 ms, media de 859 ms y p80 de 659 ms, con pico de memoria GPU de 87.891 MiB; útil para dimensionar despliegues de un solo dispositivo.
- Análisis de robustez ante entradas largas: la regla de derivación al miembro A por encima de 50.000 caracteres (0,27% de la muestra de latencia) permite estudiar el comportamiento del sistema en el límite de tamaño sin truncamiento.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Decision Index 0.3, ejecución pública | 72,93 (raw 79,54) |
| Cobertura de la ejecución | 140.178 de 140.178 peticiones puntuables; 0 no soportadas; 0 errores |
| Acuerdo de decisión vs miembros en bf16 (750 filas) | 99,40% (umbral FP8: 96%) |
| Acuerdo de decisión vs mismo motor en H200 (689 filas) | 99,43% |
| Latencia, diseño latency-v1, 1 petición a la vez, 1× RTX PRO 6000 Blackwell Server Edition | mediana 293 ms / media 859 ms / p80 659 ms |
| Pico de memoria GPU | 87.891 MiB |
| Pérdida final de entrenamiento (v7 warm, paso 600) | 0,379 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pico medido es de 87.891 MiB (unos 85,8 GiB) con ambos miembros cargados en FP8 y una petición a la vez; los pesos suman 61,1 GB (33,3 GB del miembro A y 27,8 GB del miembro B).
- GPU recomendadas: RTX PRO 6000 Blackwell Server Edition (configuración medida); H200 (usada como referencia de acuerdo de decisión). No hay datos publicados para A100, H100 ni RTX 4090.
- No cabe en GPU de consumo convencional: el pico de memoria supera los 80 GiB, por encima de una RTX 4090 (24 GB) y de una RTX 5090 (32 GB). No hay información sobre configuraciones multi-GPU.
- Despliegue: Docker con `docker build -f duo/code/Dockerfile --build-context kit=<decision-index @ 25c6ec7>` y `docker run --gpus all`; alternativa con pip sobre Python 3.12, driver NVIDIA ≥ 580, `causal-conv1d==1.7.0` compilado con `CAUSAL_CONV1D_FORCE_BUILD=TRUE` (requiere nvcc 13 y g++) y el paquete `decision-index` desde `git+https://github.com/apolinario/decision-index@25c6ec7`. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue.
- Latencia y throughput: mediana de 293 ms y media de 859 ms por petición en el hardware medido, con una petición a la vez; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Logits Sigma-1 Duo | no disponible (61,2 GB en FP8) | bloques de estado de hasta 8.192 tokens; forwards de hasta 16.384 | Decision Index 0.3: 72,93 (raw 79,54) | Apache 2.0 | Hugging Face (logitshq) |
| Logits Sigma-1 | no disponible | no disponible | no disponible en la información proporcionada (comparte el adaptador v6 del miembro A) | no disponible | Hugging Face (logitshq) |
| PelaAI/KnowLine-31B-Gen1 | 31B (según el nombre del modelo) | no disponible | no disponible | no disponible | Hugging Face (PelaAI) |
| vllm-sr/d3-ultra | no disponible | no disponible | no disponible | no disponible | Hugging Face (vllm-sr) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling, agentes ni razonamiento multi-paso; solo responde peticiones del formato Decision Index.
- La regla de tamaño deriva al miembro A las peticiones de más de 50.000 caracteres en JSON compacto, lo que cambia el régimen de decisión (un solo miembro) para esas entradas; afecta al 0,27% de la muestra de latencia.
- La cuantización FP8 block-128 introduce una pérdida de acuerdo medible: 99,40% frente a bf16 en 750 filas, con un umbral de aceptación del 96%; no es una reproducción exacta de los miembros en bf16.
- El LoRA del miembro A se entrenó parcialmente sobre las particiones de entrenamiento del benchmark Decision Index (`ditrain`), lo que exige cautela al interpretar la puntuación como generalización fuera de la suite.
- El miembro B (d3-ultra) necesita unos 108 GiB para su atención bidireccional de estado en peticiones largas, lo que condiciona el diseño y el hardware.
- Dependencias de compilación frágiles: `causal-conv1d==1.7.0` requiere nvcc 13 y g++, y el driver NVIDIA debe ser ≥ 580.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Sesgos conocidos y riesgo de alucinación: no disponibles en la información proporcionada; al no generar texto, el riesgo de alucinación se limita a la asignación de probabilidad entre opciones.
- Licencia Apache 2.0 permite uso comercial, pero las fuentes de datos se etiquetaron para uso comercial según `DATA_SOURCES.md`; conviene verificar ese listado antes de un despliegue en producción.
- El repositorio no registra descargas ni likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-07; verificar la vigencia de revisiones concretas (`d9641cd862fc0ee4833b2fc52142802ba8181c40`, `8f052a81`, `37fee019`) antes de fijar dependencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logitshq/Logits-Sigma-1-Duo
- Resultados de la ejecución pública: https://huggingface.co/datasets/logitshq/logits-sigma-1-duo-decision-index/tree/202db5f059665729f8ecca706a4fdb7d0db549e4/runs/logits-sigma-1-duo
- Modelo base del miembro A: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Modelo base del miembro B: https://huggingface.co/vllm-sr/d3-ultra
- Modelo base del LoRA: https://huggingface.co/google/gemma-4-31B-it
- Logits Sigma-1 (adaptador v6 compartido): https://huggingface.co/logitshq/Logits-Sigma-1/tree/5ee69b5ace03c6bdd4e3391ac722993baa7c8d2d
- Paquete decision-index: https://github.com/apolinario/decision-index
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2309.06275

# model-rampage/BareTorch-Qwen3.5-0.8B-Hybrid

## Resumen

BareTorch-Qwen3.5-0.8B-Hybrid es un modelo de lenguaje de 916,3 M de parámetros totales (662,0 M activos en el backbone) publicado por el usuario model-rampage, destilado a partir de Qwen/Qwen3.5-0.8B y con una segunda fase de up-destilación desde Qwen/Qwen3.5-4B. Su particularidad no es el tamaño, sino la arquitectura: sustituye 18 de las 24 capas de mezcla de tokens del backbone por bloques recurrentes asociativos de bajo rango (CS-LRAD, *Chunked Selective Low-Rank Associative Delta*, con r=16 y chunk_size=64) y conserva 6 capas de atención completa intercaladas en proporción 3:1, manteniendo una ventana de contexto de 32.768 tokens.

La motivación declarada por el autor es la portabilidad hardware: frente a arquitecturas subcuadráticas como Mamba-2, RWKV o Gated DeltaNet, que dependen de extensiones C++/CUDA/Triton (causal-conv1d, flash-linear-attention), BareTorch formula la mezcla de secuencia usando únicamente multiplicaciones de matrices estándar (GEMM) y una actualización recurrente de estado de bajo rango O(1) en decodificación, sin dependencias nativas personalizadas.

Es relevante ahora porque propone una vía para llevar modelos con ventana de 32K a dispositivos de borde sin kernels propietarios, con mejoras declaradas de hasta 1,64x en prefill y 1,16x en decodificación autoregresiva frente al modelo base en una RTX 4090. No obstante, el repositorio acumula 0 descargas y 1 like en el momento de la consulta, y todos los resultados son autoinformados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida intercalada 3:1: 18 capas CS-LRAD (recurrente asociativa de bajo rango) + 6 capas de atención completa; transformer con mezcladores subcuadráticos puros GEMM |
| Parametros totales | 916.279.584 (safetensors) |
| Parametros activos | 662,0 M en el backbone (no es un modelo MoE; el dato se refiere a pesos activos no-embedding) |
| Longitud de contexto | 32.768 tokens (512 chunks de 64) |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos safetensors en bf16 y no documenta variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible (la model card no incluye listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere trust_remote_code=True) |
| Dimension oculta (d_model) | 1.024 (8 cabezas de consulta, 2 cabezas KV) |
| Rango / chunk CS-LRAD | r = 16, chunk_size = 64 |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Profesor de up-destilacion | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

El modelo parte de la topología de Qwen3.5-0.8B (24 capas, d_model=1024, 8 cabezas de consulta y 2 cabezas KV) y reemplaza el 75% de los mezcladores de tokens por bloques CS-LRAD. Cada bloque mantiene un estado asociativo recurrente de bajo rango que se actualiza en tiempo O(1) durante la decodificación y se procesa por chunks de 64 tokens en prefill, de forma que toda la computación se expresa con GEMMs estándar y es compatible con torch.compile/TorchInductor. Las 6 capas de atención completa restantes actúan como anclas intercaladas para preservar la calidad de recuperación de contexto largo.

El entrenamiento es una destilación por capas en varias fases: una fase de destilación desde Qwen3.5-0.8B y una fase de up-destilación desde Qwen3.5-4B empleando Top-64 Skew-KL más Skew-RKL, seguida de un ajuste de 2.000 pasos con Dr. GRPO orientado a razonamiento con modo `<think>` (el autor lo denomina "4-Pillar"). No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset.

La innovación técnica destacable es la eliminación total de dependencias C++/CUDA/Triton: no se requieren causal-conv1d ni flash-linear-attention, y la aceleración se obtiene con `model.compile_cs_lrad(mode="default", dynamic=True)`, que fusiona kernels de los bloques CS-LRAD, RMSNorms y MLPs SwiGLU mediante TorchInductor. El autor indica que la primera llamada tarda aproximadamente 10 segundos en compilar los kernels Triton fusionados.

## Capacidades

- Generación de texto conversacional en modo texto plano, con soporte de plantilla de chat heredada del tokenizador de Qwen.
- Razonamiento paso a paso mediante modo `<think>` explícito, entrenado específicamente con Dr. GRPO en la fase final.
- Razonamiento matemático con cadena de pensamiento (35,80% en GSM8K CoT según el autor).
- Generación de código Python (16,80% MBPP Pass@1 y 10,98% HumanEval Pass@1 reportados).
- Razonamiento científico y de conocimiento general (ARC-Easy, SciQ, BoolQ, GPQA-Diamond en la suite evaluada).
- Inferencia de contexto largo hasta 32.768 tokens, con caché corta reducida aproximadamente 3,2x frente al modelo base.
- Ejecución en CPU y GPU sin kernels personalizados, incluyendo compilación con torch.compile.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Razonamiento matemático asistido en el dispositivo: el modelo puede resolver problemas aritméticos y de varios pasos con traza `<think>` en local, sin conexión, gracias a sus 32K de contexto y a un peso en bf16 de aproximadamente 1,29 GB que cabe en GPUs integradas.
- Generación y autocompletado de código en editores ligeros: con 16,80% de MBPP Pass@1 puede emplearse como asistente de snippets y tests en entornos con recursos limitados, donde un modelo mayor no cabría.
- Procesamiento de documentos largos en el borde: la ventana de 32.768 tokens y la caché reducida permiten resumir contratos, informes o transcripciones en dispositivos con poca VRAM, manteniendo 6 capas de atención completa para recuperación de detalles.
- Clasificación y extracción de información sobre texto: los resultados en BoolQ, SciQ y ARC-Easy sugieren utilidad para tareas de question answering extractivo y clasificación de intenciones en pipelines de bajo coste.
- Prototipado e investigación en arquitecturas subcuadráticas: sirve como banco de pruebas reproducible de mezcladores CS-LRAD con dependencias mínimas (solo torch y transformers), útil para grupos que investigan alternativas a Mamba-2 o Gated DeltaNet.
- Evaluación comparativa de destilación: al publicar el pipeline de destilación por capas y los profesores utilizados, permite reproducir experimentos de up-destilación de un modelo de 4B a uno de 0,8B en hardware de consumo.
- Despliegue en entornos air-gapped o embebidos: la ausencia de extensiones CUDA propietarias facilita la portabilidad a aceleradores no NVIDIA y a arrays sistólicos, según la motivación declarada por el autor.

## Benchmarks y rendimiento

Resultados autoinformados por el autor. Suite de 10 tareas de lm-evaluation-harness (promedio macro):

| Modelo | Promedio macro | ARC-Easy | SciQ | BoolQ |
|---|---|---|---|---|
| BareTorch-Qwen3.5-0.8B-Hybrid | 58,45% | +12,58% vs base | +9,80% vs base | +8,32% vs base |
| Qwen/Qwen3.5-0.8B (base) | 54,83% | referencia | referencia | referencia |

Suite de 5 tareas de razonamiento generativo y código Python con `<think>`:

| Modelo | Promedio macro | GSM8K CoT | GPQA-Diamond | MBPP Pass@1 | HumanEval Pass@1 |
|---|---|---|---|---|---|
| BareTorch-Qwen3.5-0.8B-Hybrid | 20,01% | 35,80% | 27,68% | 16,80% | 10,98% |
| Qwen/Qwen3.5-0.8B (base) | 11,47% | no disponible | no disponible | no disponible | no disponible |

Rendimiento de inferencia medido por el autor en una NVIDIA RTX 4090:

| Metrica | BareTorch 0.8B Hybrid | Qwen3.5-0.8B |
|---|---|---|
| Prefill | hasta 1,64x mas rapido | referencia |
| Decodificacion autoregresiva | 1,16x mas rapida | referencia |
| Cache de contexto corto | 3,2x menor | referencia |
| Parametros activos | 662,0 M | 752,4 M |
| VRAM pico a 32K | 1,21 GB menos | referencia |
| Pesos estaticos bf16 | ~1,29 GB | ~1,43 GB |

No se han publicado resultados independientes ni mediciones de latencia absoluta (tokens/s) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1,29 GB solo de pesos en bf16; con caché KV para 32K tokens se estima un añadido de en torno a 190 MB para las 6 capas de atención completa (cálculo derivado de 2 cabezas KV, dimensión de cabeza 128 y 6 capas en bf16), lo que sitúa el total por debajo de 2 GB en el peor caso de contexto lleno.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; el autor reporta mediciones en RTX 4090. Para lotes grandes o contexto de 32K conviene disponer de 8-16 GB.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y en iGPUs con suficiente memoria compartida; también se indica ejecución en CPU (device="cpu" en el ejemplo de la model card).
- Opciones de despliegue: transformers con trust_remote_code=True y torch.compile mediante `model.compile_cs_lrad(dynamic=True)`. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni formatos GGUF; la arquitectura personalizada requiere el código del repositorio.
- Latencia y throughput: no se publican valores absolutos de tokens/s. El autor reporta ganancias relativas de 1,64x en prefill y 1,16x en decodificación frente al modelo base, además de ~10 s de compilación inicial de kernels Triton fusionados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BareTorch-Qwen3.5-0.8B-Hybrid | 916,3 M totales / 662,0 M activos | 32.768 | 58,45% macro (10 tareas) y 20,01% macro (5 tareas) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B | 752,4 M activos (total no disponible) | no disponible | 54,83% macro (10 tareas) y 11,47% macro (5 tareas) | no disponible en la informacion | HuggingFace, modelo base |
| Qwen/Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible en la informacion | HuggingFace, usado como profesor |
| Mamba-2 / RWKV / Gated DeltaNet | no disponible | no disponible | no disponible | no disponible | mencionados solo cualitativamente en la model card |

No se dispone de datos verificables de otras arquitecturas subcuadráticas comparables en la información proporcionada; la comparación cuantitativa solo es posible frente a los modelos Qwen empleados como base y profesor.

## Limitaciones y advertencias

- Todos los benchmarks son autoinformados por el autor; no hay evaluaciones independientes ni réplica de los resultados en la información disponible.
- El modelo acumula 0 descargas y 1 like, con creación y última actualización el 29 de octubre de 2026: no existe validación por parte de la comunidad.
- La model card está truncada en la información recibida; pueden faltar advertencias, limitaciones o detalles de uso relevantes.
- No se documentan los idiomas soportados; no es seguro asumir buen rendimiento en castellano.
- No se documentan sesgos, composición del dataset de destilación ni filtrado de datos, lo que dificulta evaluar riesgos de toxicidad o sesgo.
- Riesgo de alucinación inherente a un modelo de 0,8B: los resultados en GPQA-Diamond (27,68%) y HumanEval (10,98%) indican que el razonamiento complejo y la generación de código fiable quedan lejos de modelos de mayor tamaño.
- Requiere trust_remote_code=True, lo que implica ejecutar código Python del autor; conviene auditar el repositorio antes de desplegarlo en producción.
- Al usar una arquitectura personalizada, no hay garantía de compatibilidad con vLLM, TGI, llama.cpp, Ollama ni pipelines estándar de cuantización; cualquier despliegue dependerá del código del repositorio.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.5-0.8B y del profesor Qwen3.5-4B no se detallan en la información disponible y deben verificarse por separado.
- El rendimiento relativo reportado se midió en una RTX 4090 con prefill y decodificación; las ganancias pueden no trasladarse a otros aceleradores o a CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-rampage/BareTorch-Qwen3.5-0.8B-Hybrid
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Motor BareTorch (GitHub): https://github.com/martin-kbcc/baretorch
- Pipeline de destilación por capas (GitHub): https://github.com/martin-kbcc/BareTorch_Layerwise_Distill
- Demo en ZeroGPU (HuggingFace Spaces): https://huggingface.co/spaces/martin-kb-rampage/BareTorch-Qwen3.5-Playground
- Paper (PDF): https://github.com/martin-kbcc/baretorch-experiments/blob/main/paper.pdf
- Licencia Apache 2.0: https://apache.org/licenses/LICENSE-2.0
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente definiciones de diccionario y sitios de maquetas y moda.

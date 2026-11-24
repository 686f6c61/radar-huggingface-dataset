# AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT

## Resumen

TR-HASH MoE 200M-160B-SFT es un modelo de lenguaje de 201,2 millones de parámetros desarrollado por AETHORIA-AI, resultado de un ajuste fino supervisado de parámetros completos (no LoRA ni QLoRA) sobre el checkpoint de refinamiento de su misma familia. Emplea una arquitectura de transformer decoder de 16 capas con atención GQA (14 cabezas de consulta y 2 de clave/valor), cuatro expertos deterministas enrutados por ID de token con activación top-2 y una ruta SwiGLU compartida siempre activa. El contexto de entrenamiento es de 2.048 tokens y utiliza un tokenizador propio de 32.000 tokens.

El modelo destaca por su enfoque de enrutamiento multi-hash determinista, presentado en el preprint "Deterministic multi-hash routing supports long-horizon training in a compact language model". El nombre "160B" hace referencia a las aproximadamente 162.000 millones de exposiciones de tokens acumuladas durante el entrenamiento previo al SFT, no al número de parámetros. Con 201,2M de parámetros, reporta resultados en PIQA, ARC y HellaSwag superiores a GPT-2 Medium (355M), GPT-2 Large (774M) y Pythia-410M en la métrica combinada de ARC.

Es relevante por dos motivos: demuestra que un modelo compacto con enrutamiento disperso determinista puede competir con modelos densos de mayor tamaño en tareas de sentido común, y publica de forma transparente tanto el recetario de entrenamiento como los informes de evaluación. La licencia es CC-BY-NC-4.0, lo que restringe el uso comercial, y los idiomas declarados son inglés y francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE determinista enrutado por ID de token (top-2 de 4 expertos), GQA y ruta SwiGLU compartida |
| Parametros totales | 202.731.072 (201,2M) |
| Parametros activos | No disponible (top-2 de 4 expertos más ruta compartida; el autor no publica el desglose) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; el autor menciona conversión a FP16 MLX para evaluación) |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | CC-BY-NC-4.0 |
| Formato de pesos | safetensors (raíz en float32) con código custom de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 16 capas con 201,2M de parámetros. La innovación principal es el enrutamiento multi-hash determinista: cuatro expertos almacenados se seleccionan mediante tablas de enrutamiento persistidas basadas en el ID del token, con activación top-2, complementadas por una ruta SwiGLU compartida siempre activa. Esto sustituye el enrutador aprendido habitual en los MoE por un mapeo determinista, lo que según el autor facilita el entrenamiento de largo horizonte en modelos compactos. Usa GQA con 14 cabezas de consulta y 2 de clave/valor, y embeddings atados.

El SFT se realizó sobre el paso 8.156 del checkpoint de refinamiento (unas 162.000 millones de exposiciones de tokens previas) con el dataset AETHORIA-AI/TR-HASH-MoE-200M-SFT-v2-300K: 300.000 ejemplos de entrenamiento y 3.000 de validación, 202.948.693 tokens sin truncación. La supervisión se aplica solo al turno final del asistente, enmascarando los turnos previos. Se entrenaron 3 épocas con AdamW (betas 0,9/0,95, weight decay 0,1), LR pico de 2e-5 con 3% de warmup y decaimiento coseno continuo, en BF16. Requiere las kernels Liger y utiliza Triton personalizado. El checkpoint publicado es el de la época 3 / paso 5.982, seleccionado por mejor PIQA y menor pérdida de validación.

## Capacidades

- Generación de texto conversacional en inglés y francés, con formato de instrucciones (SFT sobre turnos de asistente).
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (evaluado en PIQA, ARC-Easy, ARC-Challenge y HellaSwag).
- Continuación causal de texto con puntuación por log-verosimilitud.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a inglés y francés; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Integración con Transformers mediante adaptador autónomo con `trust_remote_code=True` y tokenizador propio TR-HASH-Tokenizer-32K.

## Casos de uso

- Clasificación y respuesta a preguntas de opción múltiple: el modelo puede puntuar continuaciones candidatas por log-verosimilitud, tal como se hizo en PIQA y ARC, para construir sistemas de evaluación o triaje de preguntas en inglés.
- Prototipado de asistentes conversacionales ligeros: con 201,2M de parámetros y contexto de 2.048 tokens, es adecuado para iterar rápidamente en local sobre diálogos de instrucciones en inglés o francés antes de escalar a modelos mayores.
- Investigación en arquitecturas MoE: sirve como banco de pruebas reproducible para estudiar enrutamiento determinista por token frente a enrutadores aprendidos, con recetario y checkpoints publicados.
- Generación de texto aumentada con recuperación (RAG) en dominios acotados: su ventana de 2.048 tokens permite incluir unos pocos pasajes de contexto; útil para demostradores académicos de respuesta extractiva.
- Evaluación comparativa de modelos compactos: al publicar informes legibles por máquina en `reports/sft-v2-300k/`, facilita replicar la evaluación zero-shot con el mismo evaluador de elección causal.
- Filtrado y etiquetado de corpus en inglés y francés: puede puntuar la plausibilidad de continuaciones para descartar texto de baja calidad en pipelines de curación de datos.
- Educación y docencia: su tamaño reducido y su licencia no comercial lo hacen apropiado para prácticas sobre ajuste fino, MoE y evaluación de modelos en entornos académicos.

## Benchmarks y rendimiento

| Benchmark | Split | Ejemplos | Accuracy | Accuracy normalizada por longitud | Backend |
|---|---|---:|---:|---:|---|
| PIQA | validation | 1.838 | 68,01% | 69,10% | PyTorch FP16, Triton custom |
| ARC-Easy | test | 2.376 | 57,24% | 52,86% | MLX FP16 |
| ARC-Challenge | test | 1.172 | 27,13% | 29,01% | MLX FP16 |
| ARC combinado (micro) | test | 3.548 | 47,29% | 44,98% | Derivado de ambos splits |
| HellaSwag | validation | 10.042 | 33,21% | 38,74% | MLX FP16 |

Comparativa publicada por el autor (accuracy, zero-shot):

| Modelo | Parámetros | PIQA | ARC-Easy | ARC-Challenge | ARC combinado | HellaSwag |
|---|---:|---:|---:|---:|---:|---:|
| TR-HASH MoE 200M Full SFT | 201,2M | 68,01% | 57,24% | 27,13% | 47,29% | 33,21% |
| GPT-2 Large | 774M | — | 53,11% | 21,76% | 42,76% | — |
| Pythia-410M | 410M | — | 52,02% | 21,42% | 41,91% | — |
| GPT-2 Medium | 355M | — | 49,16% | 21,67% | 40,08% | — |
| OPT-350M | 350M | — | 43,98% | 20,82% | 36,33% | — |
| GPT-2 Small | 124M | 62,89% | 43,81% | 19,03% | ≈35,63% | 28,92% |
| OPT-125M | 125M | 63,00% | 43,60% | 19,10% | ≈35,51% | 29,20% |
| Pythia-160M | 160M | 62,73% | 43,52% | 18,77% | 35,34% | — |

Evolución por época del SFT:

| Época | Paso | Pérdida SFT validación | Perplejidad SFT | PIQA acc | PIQA acc_norm |
|---:|---:|---:|---:|---:|---:|
| 1 | 1.994 | 0,990943 | 2,69 | 67,90% | 68,93% |
| 2 | 3.988 | 0,963912 | 2,62 | 67,85% | 68,82% |
| 3 | 5.982 | 0,959617 | 2,61 | 68,01% | 69,10% |

Nota metodológica del autor: las referencias de 124M–160M provienen de lm-evaluation-harness, por lo que esa parte de la comparación es informativa y no implica una ejecución bit a bit idéntica.

## Requisitos de hardware

- VRAM estimada: los pesos en float32 ocupan aproximadamente 0,81 GB (17,8 GB de repositorio incluyen otros artefactos). En FP16 o BF16, unos 0,4 GB; en cuantizaciones de 8 bits, alrededor de 0,2 GB. El autor no publica cifras de VRAM en inferencia.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM puede alojar los pesos en FP16; para evaluación con MLX se usó FP16 en Apple Silicon, y para PIQA se usó PyTorch FP16 con Triton.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado su tamaño.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (adaptador autónomo incluido), kernels Liger obligatorios y Triton personalizado; conversión a MLX FP16 documentada para evaluación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC combinado | HellaSwag | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| TR-HASH MoE 200M Full SFT | 201,2M | 2.048 | 47,29% | 33,21% | CC-BY-NC-4.0 | Hugging Face |
| GPT-2 Medium | 355M | 1.024 | 40,08% | — | MIT (según publicación original) | Hugging Face |
| Pythia-410M | 410M | 2.048 | 41,91% | — | Apache 2.0 | Hugging Face |
| OPT-350M | 350M | 2.048 | 36,33% | — | OPT-175B License (no comercial) | Hugging Face |

El modelo supera a alternativas densas de mayor tamaño en ARC combinado con la mitad o un cuarto de parámetros, aunque su licencia no comercial limita su adopción frente a Pythia-410M (Apache 2.0). Los datos de GPT-2 Medium y OPT-350M proceden de la evaluación local del autor con su propio evaluador, no de los informes oficiales.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohíbe el uso comercial; cualquier despliegue en producción con fines lucrativos requiere autorización del titular.
- Contexto muy corto (2.048 tokens): insuficiente para documentos largos, conversaciones extensas o RAG con muchos pasajes.
- Solo inglés y francés declarados; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 201,2M entrenado sobre un corpus de SFT de 300.000 ejemplos; no se han publicado evaluaciones de fidelidad factual.
- Rendimiento modesto en tareas de razonamiento complejo: 27,13% en ARC-Challenge y 33,21% en HellaSwag indican capacidad limitada fuera de patrones de sentido común sencillos.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni seguridad.
- Dependencia de código personalizado (`trust_remote_code=True`), kernels Liger y Triton: incrementa la superficie de ataque de la cadena de suministro y complica el despliegue estándar.
- Pesos en float32 en la raíz: mayor huella de disco que una publicación en BF16.
- No se declaran capacidades de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad.
- El nombre "160B" puede inducir a error: se refiere a exposiciones de tokens previas, no al tamaño del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT
- Modelo base (refinamiento): https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-Refinement
- Tokenizador: https://huggingface.co/AETHORIA-AI/TR-HASH-Tokenizer-32K
- Dataset de SFT: https://huggingface.co/datasets/AETHORIA-AI/TR-HASH-MoE-200M-SFT-v2-300K
- Preprint (DOI): https://doi.org/10.21203/rs.3.rs-10788774/v1
- Código: https://github.com/Complexity-ML/complexity-framework
- Referencia de evaluación AMD-LLM: https://github.com/AMD-AGI/AMD-LLM#evaluation
- Resultados zero-shot de Pythia-160M: https://github.com/EleutherAI/pythia/blob/main/evals/pythia-v1/pythia-160m/zero-shot/160m_step143000.json

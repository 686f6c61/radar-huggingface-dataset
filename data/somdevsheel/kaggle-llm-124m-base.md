# somdevsheel/kaggle-llm-124m-base

## Resumen

kaggle-llm-124m-base es un modelo de lenguaje de 123,6 millones de parámetros entrenado desde cero por el desarrollador independiente somdevsheel. Se trata de un transformer decoder-only de estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos y embeddings atados) con 12 capas, dimensión oculta 768 y una ventana de contexto de 1024 tokens. Su relevancia no reside en el rendimiento absoluto, sino en su carácter demostrativo: el autor documenta el entrenamiento completo de un modelo base en GPUs gratuitas de Kaggle (2x NVIDIA T4) durante 10,9 horas, con un presupuesto de 0,98 miles de millones de tokens de FineWeb-Edu.

Es un modelo de completado de texto, no un modelo de chat ni de instrucciones; el autor publica una variante conversacional separada (kaggle-llm-124m-chat). Está pensado como referencia reproducible para quienes quieren entender el pipeline de preentrenamiento a pequeña escala, no como una alternativa a modelos de producción.

La licencia Apache 2.0 y el formato safetensors lo hacen fácilmente reutilizable, pero sus limitaciones son explícitas: aproximadamente 8 tokens por parámetro, muy por debajo de lo compute-optimal, lo que se traduce en conocimiento del mundo muy limitado y una alta propensión a generar afirmaciones fluidas pero incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos, embeddings atados) |
| Parametros totales | 123.587.328 (85,0 M no pertenecientes a embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (el autor solo documenta carga en fp16) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 0,2 GB) |

Especificaciones adicionales: 12 capas, hidden 768, 12 cabezas de atención, FFN 2048, tokenizador GPT-2 BPE con vocabulario ampliado a 50.304.

## Arquitectura y entrenamiento

La arquitectura sigue el diseño canónico de LLaMA a escala reducida: decoder-only con rotary positional embeddings (RoPE), normalización RMSNorm en configuración pre-norm, activación SwiGLU en la FFN, ausencia de términos de sesgo en las capas lineales y embeddings de entrada y salida atados. El tokenizador es GPT-2 BPE con el vocabulario rellenado hasta 50.304 entradas.

El entrenamiento se realizó sobre 0,98 miles de millones de tokens de FineWeb-Edu (muestra sample-10BT), sin repetir ningún token. Se ejecutaron 1.865 pasos de 524.288 tokens cada uno, con PyTorch DDP sobre 2x NVIDIA T4 en precisión mixta fp16 con escalado de pérdida. El optimizador fue AdamW (betas 0,9 y 0,95) con weight decay 0,1, learning rate máximo de 1,2e-3, 200 pasos de warmup y decaimiento coseno hasta el 10 %. El schedule se ajustó al límite de 12 horas de la sesión de Kaggle cronometrando los primeros pasos. La pérdida de validación final fue 3,43 (perplejidad 31), descendiendo desde 10,97 en el paso 0. No se documenta RLHF, DPO ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto por completado autoregresivo en inglés, con muestreo configurable (temperature, top_k).
- Modelado de lenguaje base: no está ajustado para seguir instrucciones ni para mantener diálogos estructurados.
- Capacidad limitada de razonamiento y conocimiento factual, derivada del escaso presupuesto de entrenamiento (8 tokens por parámetro).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatible con text-generation-inference y endpoints según los tags del repositorio.

## Casos de uso

- Experimentación educativa con preentrenamiento: sirve como punto de partida reproducible para estudiar el pipeline completo (tokenización, schedule de learning rate, DDP en GPUs consumer) con un coste de cómputo mínimo.
- Completado de texto de dominio restringido: dado su entrenamiento exclusivo en FineWeb-Edu, puede usarse para generar continuaciones de prosa educativa o técnica en inglés, siempre con revisión humana.
- Base para fine-tuning supervisado: sus 123,6 M de parámetros permiten ajustarlo en una única GPU consumer para tareas específicas de clasificación, extracción o generación acotada.
- Ablaciones y estudios de scaling: al ser un modelo pequeño con hiperparámetros documentados, es útil para comparar variantes arquitectónicas o de datos a bajo coste.
- Prototipado rápido de pipelines de inferencia: su tamaño (0,2 GB en safetensors, fp16) permite validar integraciones con transformers o TGI en entornos sin GPU dedicada.
- Docencia y divulgación: ejemplifica de forma tangible las limitaciones de un modelo infraentrenado, útil para explicar por qué el presupuesto de tokens importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación reportado por el autor es la pérdida de validación de 3,43 (perplejidad 31) sobre FineWeb-Edu, con la siguiente evolución:

| Paso | 0 | 250 | 500 | 1000 | 1500 | 1864 |
|---|---|---|---|---|---|---|
| Pérdida de validación | 10,97 | 4,88 | 4,05 | 3,65 | 3,48 | 3,43 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos ocupan aproximadamente 0,25 GB; con overhead de activaciones y caché KV para 1024 tokens, cabe holgadamente en 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en 2x NVIDIA T4, y la inferencia funciona en T4, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para generación de baja latencia.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag del repositorio) y endpoints compatibles; llama.cpp u Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaggle-llm-124m-base | 123,6 M | 1024 | 0,98 B tokens FineWeb-Edu | Apache 2.0 | Hugging Face |
| GPT-2 (124M) | 124 M | 1024 | WebText (~40 GB) | MIT (pesos publicados) | Hugging Face |
| Pythia-160M | 160 M | 2048 | The Pile (~300 B tokens) | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2048 | 600 B tokens (FineWeb-Edu y otros) | Apache 2.0 | Hugging Face |

La comparación con GPT-2, Pythia-160M y SmolLM-135M sitúa a este modelo en la misma clase de tamaño, pero con un presupuesto de datos sustancialmente menor (0,98 B frente a cientos de miles de millones de tokens). No se dispone de benchmarks comparativos publicados para kaggle-llm-124m-base, por lo que la comparación de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- Entrenado con aproximadamente 8 tokens por parámetro, muy por debajo del régimen compute-optimal: conocimiento del mundo muy limitado.
- Alta propensión a generar afirmaciones fluidas pero incorrectas (alucinación), reconocida explícitamente por el autor.
- Solo inglés; no hay soporte multilingüe.
- Sin filtrado de seguridad más allá del filtro educativo de FineWeb-Edu; no debe desplegarse en aplicaciones orientadas a usuarios sin capas adicionales de moderación.
- No es un modelo de chat ni de instrucciones; usarlo como tal produce resultados deficientes.
- Ventana de contexto de solo 1024 tokens, insuficiente para tareas de contexto largo.
- Sin datos de benchmarks que permitan estimar su calidad en tareas downstream.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación y de evaluaciones desaconseja su uso en producción sin fine-tuning y validación previas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/kaggle-llm-124m-base
- Variante conversacional: https://huggingface.co/somdevsheel/kaggle-llm-124m-chat
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu

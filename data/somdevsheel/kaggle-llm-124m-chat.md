# somdevsheel/kaggle-llm-124m-chat

## Resumen

kaggle-llm-124m-chat es un modelo de lenguaje conversacional de 123,6 millones de parámetros entrenado desde cero por el desarrollador independiente somdevsheel. Se trata de un proyecto formativo cuyo objetivo es demostrar el ciclo completo de entrenamiento de un LLM (preentrenamiento y ajuste supervisado) utilizando exclusivamente GPUs gratuitas de Kaggle (2x NVIDIA T4). El modelo parte de un preentrenamiento sobre 1.920 millones de tokens de FineWeb-Edu y posteriormente se ajusta con 226.000 conversaciones del dataset smol-smoltalk.

La arquitectura es un transformer decoder-only de estilo LLaMA con 12 capas, dimensión oculta de 768, 12 cabezas de atención y una ventana de contexto de 1.024 tokens. Utiliza RoPE, RMSNorm con pre-normalización, SwiGLU, ausencia de sesgos y embeddings atados, junto con el tokenizador BPE de GPT-2 (vocabulario ampliado a 50.304 entradas).

Su relevancia es principalmente educativa y de referencia: muestra qué se puede conseguir con recursos de cómputo muy limitados y publica todos los detalles del proceso (pasos, tasas de aprendizaje, pérdidas de validación). No está pensado como asistente de producción; el propio autor advierte que tiende a afirmar hechos falsos con seguridad y que solo maneja inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos, embeddings atados) |
| Parametros totales | 123.587.328 (85,0M no correspondientes a embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (el repositorio incluye pesos safetensors y ONNX; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Tokenizador | BPE de GPT-2 (vocabulario ampliado a 50.304) |
| Capas / dimension oculta / cabezas | 12 / 768 / 12 |
| Dimension FFN | 2.048 |
| Modelo base | somdevsheel/kaggle-llm-124m-base |
| Dataset de SFT | HuggingFaceTB/smol-smoltalk (226K conversaciones) |
| Descargas en Hugging Face | 555 |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar de tipo LLaMA: 12 capas con atención multi-cabeza (12 cabezas), dimensión oculta de 768, FFN de 2.048 con activación SwiGLU, normalización RMSNorm con pre-norm, codificación posicional rotatoria (RoPE), sin términos de sesgo y con embeddings de entrada y salida atados. El tokenizador es el BPE de GPT-2, con el vocabulario rellenado hasta 50.304 entradas.

El entrenamiento se dividió en dos fases. El preentrenamiento consumió 1.920 millones de tokens de FineWeb-Edu (muestra sample-10BT) durante 3.661 pasos de 524K tokens cada uno (dos ejecuciones), aproximadamente 21 horas en 2x T4, alcanzando una pérdida de validación de 3,30 (perplejidad 27). Se usó PyTorch DDP en 2 GPUs, precisión mixta fp16 con escalado de pérdida, AdamW (betas 0,9/0,95), weight decay 0,1 y scheduler coseno; la tasa de aprendizaje inicial fue 1,2e-3 y se continuó el preentrenamiento a 6e-4 sobre datos no vistos. El planificador coseno se ajustó automáticamente al límite de 12 horas por sesión de Kaggle. La fase de SFT empleó 226K conversaciones de smol-smoltalk empaquetadas en bloques de 1.024 tokens (92 % de ocupación), 2.442 pasos de 65K tokens, 1,7 horas en 2x T4 y una tasa de aprendizaje de 2e-4; la pérdida se calculó únicamente sobre los tokens del asistente, bajando de 2,65 a 1,54. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés siguiendo el formato de chat con etiquetas `<|system|>`, `<|user|>` y `<|assistant|>`, terminando cada turno del asistente con `<|endoftext|>`.
- Escritura de código corto y sencillo (por ejemplo, inversión de cadenas o comprobación de primalidad), con fiabilidad decreciente a medida que aumenta la longitud o la ambigüedad de la especificación.
- Razonamiento básico de un solo paso; no se documenta modo de pensamiento (thinking) ni razonamiento multi-paso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: únicamente inglés.
- Inferencia compatible con `transformers`, text-generation-inference y endpoints; pesos también en ONNX.

## Casos de uso

- Docencia y formación en LLMs: sirve como ejemplo completo y reproducible de preentrenamiento más SFT con presupuesto mínimo (2x T4, ~23 horas totales), permitiendo a estudiantes inspeccionar cada hiperparámetro y curva de pérdida.
- Experimentación académica con modelos pequeños: base para estudiar técnicas de empaquetado de secuencias, ajuste del scheduler coseno a límites de sesión o cálculo de pérdida solo en tokens del asistente.
- Prototipado rápido de interfaces de chat: al ser un `LlamaForCausalLM` estándar con tokenizador GPT-2, se integra sin fricción en pipelines de `transformers` y en entornos de demostración con pocos recursos.
- Pruebas de infraestructura de despliegue: su tamaño (123,6M parámetros) permite validar configuraciones de vLLM, TGI, ONNX Runtime o endpoints de Hugging Face antes de migrar a modelos mayores.
- Generación de código trivial en entornos controlados: útil para autocompletar funciones cortas y bien especificadas (inversión de cadenas, comprobación de primos) en ejercicios o tests internos, nunca en producción crítica.
- Investigación sobre alucinación en modelos pequeños: su relación de ~16 tokens por parámetro (frente a los ~20 óptimos de Chinchilla) lo convierte en un caso de estudio útil para medir cómo la escasez de datos afecta a la fidelidad factual.
- Generación de datos sintéticos de baja calidad para pruebas de pipelines: útil para comprobar el comportamiento de sistemas de filtrado o evaluación automática frente a salidas imperfectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion en preentrenamiento | 3,30 (perplejidad 27) |
| Perdida de validacion en SFT (tokens del asistente) | 2,65 -> 1,54 |
| Tokens de preentrenamiento | 1.920 millones |
| Tokens por parametro | ~16 (frente a ~20 optimos de Chinchilla) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 250 MB para los pesos (123,6M parametros x 2 bytes), mas overhead de activaciones y cache KV, en torno a 0,5-1 GB en total con contexto de 1.024 tokens.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de 4 GB o en CPU.
- GPU recomendadas para entrenamiento o ajuste fino: 2x NVIDIA T4 (la configuracion original), o cualquier GPU con al menos 8-16 GB para reentrenar con margen.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (tag `text-generation-inference`), endpoints compatibles de Hugging Face, ONNX Runtime (pesos ONNX incluidos). No se documentan pesos GGUF ni integracion con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera decodificacion muy rapida en GPU moderna, pero no hay cifras publicadas.
- Parametros de muestreo recomendados por el autor: temperature 0,7, top-k 50, repetition penalty 1,15.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kaggle-llm-124m-chat | 123,6M | 1.024 | Ingles | Apache 2.0 | Entrenado desde cero en 2x T4; sin RLHF/DPO; proyecto educativo |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 (segun version) | Ingles y otros | Apache 2.0 | Entrenamiento a mayor escala; usado como referencia de la familia smol |
| GPT-2 small (OpenAI) | 124M | 1.024 | Ingles | MIT (pesos) | Referencia historica de mismo orden de magnitud; sin ajuste conversacional |
| TinyLlama-1.1B (TinyLlama) | 1,1B | 2.048 | Ingles | Apache 2.0 | Un orden de magnitud mayor; mayor calidad pero mas recursos |

Los datos de SmolLM-135M, GPT-2 small y TinyLlama-1.1B se incluyen como referencia de categoria; no se dispone de comparaciones benchmark publicadas entre kaggle-llm-124m-chat y estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion elevada: con ~16 tokens por parametro (frente a los ~20 de Chinchilla), el conocimiento factual es muy limitado; el autor cita como ejemplo que inventa una definicion de "DSA en ciencias de la computacion".
- Solo ingles; no hay soporte multilingue.
- Sin ajuste de seguridad ni entrenamiento de preferencias (sin RLHF ni DPO): puede generar contenido inapropiado o inseguro.
- Codigo fiable solo en casos cortos y bien especificados; fragmentos largos o ambiguos suelen ser incorrectos.
- No debe usarse para respuestas factuales, medicas, legales o financieras.
- Contexto muy corto (1.024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explicitamente su uso en produccion por su baja calidad y fiabilidad.
- El modelo se presenta como proyecto de aprendizaje, no como asistente de produccion; no hay garantias de mantenimiento ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/kaggle-llm-124m-chat
- Modelo base (solo preentrenado): https://huggingface.co/somdevsheel/kaggle-llm-124m-base
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk

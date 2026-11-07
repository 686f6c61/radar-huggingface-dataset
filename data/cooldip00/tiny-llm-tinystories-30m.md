# CoolDip00/tiny-llm-tinystories-30m

## Resumen

tiny-llm TinyStories 30M es un modelo de lenguaje de 29,9 millones de parámetros entrenado desde cero por el desarrollador independiente CoolDip00 como parte del proyecto educativo tiny-llm, un repositorio que implementa el entrenamiento y la inferencia de un LLM sin recurrir a frameworks de alto nivel. El modelo adopta una arquitectura tipo Llama (decoder transformer con RMSNorm, RoPE, SwiGLU y embeddings atados) y está especializado en una única tarea: continuar cuentos infantiles cortos en el inglés sencillo del dataset TinyStories.

No es un modelo de propósito general ni un asistente conversacional: es un modelo base (no instruido) que recibe el inicio de una historia y la completa. Su relevancia es fundamentalmente didáctica y de referencia: demuestra que un transformer funcional puede entrenarse en 2 horas y 27 minutos en una GPU de portátil (RTX 3070 Ti de 8 GB) alcanzando una pérdida de validación de 1,2825 nats/token (perplejidad 3,6) sobre TinyStories, con un pipeline de exportación verificado contra Hugging Face Transformers.

Por su tamaño y contexto (512 tokens), debe entenderse como una pieza de aprendizaje, una demo reproducible y un banco de pruebas para infraestructura de inferencia, no como una herramienta para producción real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama: RMSNorm pre-norm, RoPE (θ = 10.000), SwiGLU MLP, atención multi-cabeza, embeddings de entrada/salida atados |
| Parámetros totales | 29.893.120 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (los pesos se publican en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (los pesos y el código); el dataset TinyStories se publica bajo CDLA-Sharing-1.0 |
| Formato de pesos | safetensors (`model.safetensors`, fp32, tal como se entrenó) |

Detalles adicionales de arquitectura: 8 capas, `d_model` 512, 8 cabezas de atención (dimensión por cabeza 64), capa oculta MLP de 1.408. Tokenizador BPE a nivel de byte con 8.192 tokens entrenado sobre TinyStories; sin token BOS y con `<|endoftext|>` (id 0) como fin de historia.

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con normalización RMSNorm aplicada antes de cada subcapa, codificación posicional rotatoria (RoPE) con theta 10.000, activación SwiGLU en el MLP y pesos de embedding de entrada y de salida compartidos. Con 8 capas y 512 dimensiones de modelo, la arquitectura es deliberadamente compacta para que el ciclo completo de entrenamiento quepa en una GPU de consumo.

El entrenamiento usó la partición de train de TinyStories tras una limpieza (corrección de codificaciones rotas y descarte de historias no ASCII): 996 millones de tokens, aproximadamente 2,1 épocas, en 7.600 pasos de 131.072 tokens cada uno (batch 32 × 512 con 8 pasos de acumulación de gradiente). Optimizador AdamW (β 0,9/0,95, weight decay 0,1 en matrices y embeddings), LR pico de 1e-3 tras 200 pasos de warmup con decaimiento coseno hasta 1e-4 y recorte de gradiente a 1,0. Se entrenó con autocast bf16, pesos maestros en fp32 y `torch.compile` sobre una única RTX 3070 Ti de 8 GB, en 2 h 27 min a ~115K tokens/s y 56% de MFU. No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base puro.

La innovación destacable no está en el modelo sino en el proceso: el proyecto tiny-llm implementa entrenamiento e inferencia desde cero y valida la exportación a Hugging Face comparando logits (diferencia máxima de 1,4e-5 sobre 2.741 posiciones, tanto en forward completo como en prefill más decodificación con caché), generación greedy token a token en 8 prompts y equivalencia del tokenizador en todas las historias de validación.

## Capacidades

- Generación de texto en inglés: continuación de cuentos infantiles cortos a partir de un inicio dado.
- Estilo y vocabulario restringidos al dominio TinyStories (frases simples, vocabulario reducido, estructuras narrativas repetitivas).
- Decodificación autoregresiva estándar con muestreo (temperatura, top-k) o greedy, con soporte de caché KV en la implementación del proyecto.
- Compatibilidad con `LlamaForCausalLM` y `AutoTokenizer` de Transformers, lo que permite usar el ecosistema estándar (pipeline de text-generation, TGI, endpoints compatibles).
- Servidor de inferencia propio con API compatible con OpenAI (`/v1/completions`) y streaming, con rechazo de peticiones mediante HTTP 429 cuando se supera la capacidad para acotar el tiempo hasta el primer token.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés.

## Casos de uso

- Demostración educativa de entrenamiento de un LLM: reproducir el pipeline completo (tokenizador, dataset, bucle de entrenamiento, exportación) en una GPU de consumo para entender cada componente sin abstracciones de frameworks.
- Banco de pruebas de infraestructura de inferencia: comparar latencia y throughput de servidores propios frente a vLLM o llama.cpp, aprovechando que el servidor del proyecto aplica backpressure con 429 en lugar de acumular cola.
- Generación de cuentos infantiles sintéticos: producir borradores de historias cortas en inglés simple a partir de una primera frase, útiles como material de ejemplo o para aumentar datasets de texto sencillo.
- Validación de pipelines de exportación y compatibilidad: usar la equivalencia verificada entre el modelo del proyecto y Transformers como caso de prueba para herramientas de conversión de pesos y tokenizadores.
- Docencia y talleres de IA: ilustrar conceptos como RoPE, SwiGLU, embeddings atados, perplejidad o MFU con un modelo cuyo coste de entrenamiento es de unas pocas horas de GPU.
- Prototipado rápido en CPU: desplegar el servidor en Docker sobre CPU para experimentar con APIs compatibles con OpenAI sin necesidad de GPU ni de credenciales externas.
- Investigación sobre modelos pequeños y datos sintéticos: estudiar repetición, coherencia local y sesgos heredados en modelos entrenados con TinyStories.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación | 1,2825 nats/token (perplejidad 3,6) | Split de validación de TinyStories |
| Pérdida de entrenamiento | 1,280 | Sin indicios de sobreajuste |
| Throughput de entrenamiento | ~115K tokens/s | RTX 3070 Ti, 56% MFU |
| Tiempo de entrenamiento | 2 h 27 min | 7.600 pasos, ~996M tokens |
| Diferencia de logits vs. implementación propia | ≤ 1,4e-5 | 2.741 posiciones, fp32 en CPU |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible; el autor indica explícitamente que el modelo es demasiado pequeño para que esas métricas signifiquen algo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (29,9M parámetros × 4 bytes ≈ 120 MB de pesos, más caché KV y activaciones); en fp16/bf16 rondaría los 60 MB de pesos.
- Cabe holgadamente en cualquier GPU de consumo, incluida una RTX 3070 Ti de 8 GB (la misma usada para entrenar) y GPUs de gama baja con 4 GB o menos.
- Funciona en CPU sin problema; el proyecto ofrece despliegue en CPU con Docker.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) sirve, aunque el cuello de botella será el overhead del servidor, no el modelo.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), servidor propio del proyecto con API compatible con OpenAI y streaming, y, por compatibilidad con `LlamaForCausalLM`, herramientas estándar del ecosistema (TGI, llama.cpp/Ollama mediante conversión no documentada). El autor compara su servidor con vLLM y llama.cpp en gestión de cola.
- Latencia y throughput: no se publican cifras de inferencia; el dato disponible es el throughput de entrenamiento (~115K tokens/s) y la política de rechazo con 429 para acotar el tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-llm TinyStories 30M | 29,9M | 512 | TinyStories (~996M tokens) | MIT | Hugging Face, repo GitHub |
| Modelos TinyStories de referencia (p. ej., variantes de 1M–33M del paper de Eldan & Li) | 1M–33M | ~256–512 | TinyStories | variable según publicación | Repositorios de investigación |
| SmolLM-135M | 135M | 2.048 | FineWeb-Edu y otros | Apache 2.0 | Hugging Face |
| GPT-2 small | 124M | 1.024 | WebText | MIT | Hugging Face |

La comparación con SmolLM-135M y GPT-2 small es solo orientativa por tamaño y categoría (modelos pequeños de generación de texto): no se dispone de evaluaciones cruzadas en la información proporcionada, y el dominio de tiny-llm TinyStories 30M es mucho más estrecho que el de esos modelos generalistas.

## Limitaciones y advertencias

- Solo continuación de historias en el vocabulario y estilo de TinyStories; ante preguntas, código u otros idiomas produce texto narrativo o sin sentido.
- Modelo base sin ajuste por instrucciones: no sigue órdenes ni mantiene conversaciones.
- Texto potencialmente repetitivo o autocontradictorio; nada de lo que genera es factual.
- Hereda los sesgos presentes en TinyStories, cuyas historias fueron generadas por GPT-3.5 y GPT-4.
- Contexto máximo de 512 tokens, insuficiente para documentos largos o diálogos multi-turno.
- Solo inglés.
- No apto para usos reales ni sensibles a la seguridad; el autor lo describe como modelo de aprendizaje y demo.
- Licencia MIT para pesos y código, pero el dataset de entrenamiento TinyStories está bajo CDLA-Sharing-1.0, lo que conviene revisar si se redistribuyen derivados de los datos.
- Sin datos publicados de cuantización ni de rendimiento en inferencia; cualquier despliegue en producción requeriría mediciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CoolDip00/tiny-llm-tinystories-30m
- Repositorio del proyecto tiny-llm: https://github.com/cooldip00/tiny-llm
- Paper de TinyStories (Eldan & Li, 2023): https://arxiv.org/abs/2305.07759
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories

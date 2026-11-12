# DZER-Studios/Vexion-gpt-nano

## Resumen

Vexion-gpt-nano (publicado en Hugging Face como `DZER-Studios/Vexion-gpt-nano`) es un modelo de lenguaje denso de tipo GPT entrenado desde cero en PyTorch por el desarrollador DZER-Studios. Con 117.299.712 parámetros, se trata de la variante compacta de la familia Vexion-GPT, pensada como modelo base (no instruido) para experimentación en torno a arquitecturas Transformer escritas sin dependencias de frameworks de alto nivel. Su ventana de contexto es de 1024 tokens y su vocabulario de 40.960 entradas.

El modelo se entrenó sobre 21.000 millones de tokens del corpus multilingüe CulturaX, con un enfoque declarado en ruso (`language: ru`), durante aproximadamente 280 horas en una única RTX 4060 Ti de 16 GB. La pérdida final de entrenamiento reportada es de 3,21 y la de validación de 3,1, lo que sitúa al modelo en un régimen de modelado de lenguaje básico más que en un asistente conversacional pulido.

Su relevancia es fundamentalmente didáctica y de investigación: implementa atención causal clásica sin RoPE ni MoE, con Flash Attention integrado y un DataLoader propio que transmite datos binarios. La advertencia clave es que **no es compatible con `transformers`**: requiere los scripts `model.py`, `generate.py` y `generation.py` incluidos en el repositorio para su carga e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (GPT clásico), sin RoPE ni MoE, con activaciones GELU/SiLU y Flash Attention |
| Parametros totales | 117.299.712 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ruso (`ru`); el corpus base CulturaX es multilingüe pero el modelo se declara monolingüe ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB), con código PyTorch personalizado (`custom_code`) |

## Arquitectura y entrenamiento

Vexion-gpt-nano sigue una arquitectura Transformer densa de tipo GPT clásico, escrita íntegramente en PyTorch sin frameworks de terceros pesados. El autor destaca que prescinde deliberadamente de innovaciones modernas como positional embeddings rotatorios (RoPE) o mezcla de expertos (MoE), limitándose a atención causal estándar con activaciones GELU/SiLU. Incorpora kernels fusionados de Flash Attention para reducir el consumo de VRAM durante el entrenamiento, y la configuración se gestiona mediante un `config.json` compatible con los campos habituales de Hugging Face (`hidden_size`, `num_hidden_layers`, etc.), aunque el modelo en sí no se carga con las clases de `transformers`.

El preentrenamiento utilizó 21.000 millones de tokens de CulturaX, con un vocabulario de 40.960 tokens y 220.000 pasos totales. El hardware fue una sola RTX 4060 Ti de 16 GB, con `batch_size` 8 y 24 pasos de acumulación de gradientes, durante unas 280 horas. El optimizador declarado es Adaw en formato de 32 bits para favorecer una menor pérdida. Los resultados reportados son `train_loss` 3,21 y `val_loss` 3,1. No se documenta ninguna fase de ajuste fino supervisado, RLHF o DPO: es un modelo exclusivamente base.

## Capacidades

- Generación de texto autoregresiva en ruso a partir de un prompt, con control de temperatura, penalización por repetición y número máximo de tokens nuevos.
- Modelado de lenguaje base: continuación de texto y finalización de secuencias cortas dentro de la ventana de 1024 tokens.
- Entrenamiento y reentrenamiento desde cero o desde checkpoints, gracias a los scripts `train.py` y a la reanudación con `--resume`.
- Inferencia en GPU (CUDA) o CPU mediante `generate_base.py`, con parámetros de decodificación configurables.
- No dispone de tool calling, function calling, modo de razonamiento explícito, capacidades de agente, visión ni audio.
- Capacidad multilingüe efectiva muy limitada: el autor declara únicamente ruso, pese a que CulturaX contiene muchos idiomas.
- No soporta `AutoModelForCausalLM` ni el ecosistema estándar de `transformers`; requiere código propio del repositorio.

## Casos de uso

- Investigación sobre arquitecturas Transformer desde cero: el modelo sirve como referencia reproducible para estudiar atención causal clásica, Flash Attention y dinámicas de pérdida en un presupuesto de cómputo pequeño (una sola GPU consumer).
- Reproducción de pipelines de preentrenamiento: con `train.py`, `train.bin` y `val.bin` se puede replicar el flujo completo de entrenamiento con 21.000 millones de tokens y ajustar hiperparámetros como `lr`, `warmup_steps` o `accumulate_steps`.
- Generación de texto en ruso para experimentos controlados: continuación de prompts y análisis de coherencia local dentro de 1024 tokens, útil para comparar tokenizadores de 40.960 entradas frente a alternativas.
- Docencia y formación técnica: el repositorio expone `model.py` y `generate.py`, lo que permite explicar paso a paso la implementación de un GPT denso sin capas de abstracción de frameworks.
- Base para ajuste fino posterior: al ser un modelo base Apache 2.0, puede servir de punto de partida para SFT o DPO sobre dominios concretos en ruso, siempre que se respete la incompatibilidad con `transformers`.
- Pruebas de despliegue ligero: con 117 millones de parámetros y 0,2 GB de pesos, cabe en cualquier GPU consumer y permite validar scripts de inferencia propios antes de escalar a las variantes medium (345M) o XL (914M) de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento internas de la familia Vexion:

| Modelo | Parametros | Contexto | Estado | Train_Loss | Val_Loss | Vocab | Pasos |
|---|---|---|---|---|---|---|---|
| Vexion-gpt (nano) | 117M | 1024 | Base | 3,21 | 3,1 | 40960 | 220.000 |
| Vexion-gpt-medium | 345M | 1024 | Base | 2,58 | 2,53 | 40960 | 382.500 |
| Vexion-gpt-XL | 914M | 1024 | Entrenamiento detenido | no disponible | no disponible | 40960 | no disponible |
| Vexion-gpt-2B | 2,1B | 1024 | no disponible | no disponible | no disponible | 40960 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,2 GB en safetensors; en FP32 (formato de entrenamiento declarado) rondarían 0,47 GB, y en FP16 unos 0,23 GB. Con overhead de activaciones y contexto de 1024 tokens, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060 Ti, RTX 4090) es suficiente; el propio autor entrenó con una RTX 4060 Ti de 16 GB. Para producción a gran escala, A100 o H100 están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM. También es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma estándar, porque no implementa la API de `transformers` ni formato GGUF. El despliegue debe hacerse con los scripts del repositorio (`generate.py`, `generation.py`) sobre PyTorch con CUDA.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Compatibilidad `transformers` | Idiomas | Notas |
|---|---|---|---|---|---|---|
| Vexion-gpt-nano | 117M | 1024 | Apache 2.0 | No (código propio) | Ruso | Base, 21B tokens CulturaX, train_loss 3,21 |
| GPT-2 small | 124M | 1024 | MIT | Sí | Inglés | Referencia clásica de tamaño similar; sin soporte nativo de ruso |
| GPT-Neo 125M | 125M | 2048 | MIT | Sí | Inglés | Contexto mayor; ecosistema estándar |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Sí | Inglés (multilingüe parcial) | Entrenado con más datos y pipeline moderno |

La comparación es aproximada: no se dispone de benchmarks comunes entre Vexion-gpt-nano y estas alternativas, y la principal diferencia operativa es la incompatibilidad con el ecosistema `transformers`, que encarece su integración en producción frente a modelos de tamaño equivalente.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable ni mantiene diálogos multi-turno; su salida es continuación de texto.
- Ventana de contexto muy corta (1024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Idioma efectivo limitado al ruso; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo elevado de alucinación y de generar contenido incoherente o repetitivo, dado el tamaño (117M) y la pérdida de validación de 3,1.
- Incompatibilidad total con `transformers`, vLLM, TGI, llama.cpp y Ollama: requiere los scripts propios del repositorio, lo que limita el despliegue en infraestructura estándar.
- Sesgos: al entrenarse sobre CulturaX sin filtrado documentado ni fases de alineación, puede reproducir sesgos presentes en el corpus web, especialmente en el dominio ruso.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad hace desaconsejable su uso en producción orientada a usuarios sin una evaluación previa.
- No se documentan cuantizaciones oficiales ni formatos GGUF, por lo que la optimización de memoria queda a cargo del usuario.
- El repositorio tiene 357 descargas y 0 likes en el momento de la consulta, con escasa validación externa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-nano
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- Repositorio de código: incluido en el propio repositorio de Hugging Face (`model.py`, `generate.py`, `generation.py`, `train.py`)
- Paper o blog técnico: no disponible
- Demo: no disponible

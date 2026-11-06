# PruningEverything/llama_3_30_percent_compression

## Resumen

`llama_3_30_percent_compression` es un checkpoint derivado de la familia Llama 3, publicado por el usuario PruningEverything en Hugging Face. Por el nombre y el recuento de parametros (5.631.029.248, es decir, aproximadamente 5,63 mil millones), se trata de una version podada de un modelo Llama 3 de 8B, con una reduccion de aproximadamente el 30 % de sus parametros respecto al modelo original. El checkpoint se distribuye en formato safetensors y ocupa 11,9 GB en el repositorio.

El modelo no cuenta con model card descriptiva: el README se limita a declarar la licencia `llama3`. No hay informacion publicada sobre el proceso de poda (criterio de seleccion de pesos, si hubo destilacion o fine-tuning de recuperacion), la composicion del dataset de entrenamiento, los idiomas soportados ni los resultados de evaluacion. Tampoco se especifica la longitud de contexto efectiva tras la poda, un dato critico en modelos comprimidos porque la eliminacion de cabezas de atencion o capas puede alterar el comportamiento en secuencias largas.

Su relevancia es fundamentalmente experimental: sirve como referencia para estudiar el impacto de la poda estructurada o no estructurada sobre un transformer Llama 3, y para comparar tecnicas de compresion (poda, cuantizacion) en el contexto de inferencia eficiente. No obstante, al no haber benchmarks ni documentacion, no es recomendable para uso en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3, segun tags y nombre) |
| Parametros totales | 5.631.029.248 (~5,63 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 soporta 8.192 tokens; no confirmado tras la poda) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un transformer decoder-only con atencion causal, heredado de la arquitectura Llama 3 (RMSNorm, RoPE, SwiGLU y grouped-query attention en el modelo original). El recuento de parametros (5,63 B frente a los 8,03 B del Llama 3 8B) es consistente con una poda de aproximadamente el 30 %, pero no se especifica si la reduccion afecta a capas completas, a cabezas de atencion, a dimensiones intermedias del MLP o a pesos individuales. Tampoco se documenta si el checkpoint ha pasado por una fase de recuperacion (fine-tuning o destilacion) tras la poda, practica habitual para mitigar la perdida de calidad.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica referencia externa encontrada es una sesion de NVIDIA GTC 2025 sobre compresion de LLM mediante cuantizacion y poda, que aporta contexto general pero no datos especificos de este checkpoint.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama 3 (no verificada tras la poda).
- Razonamiento y conocimiento general: presumiblemente conserva parte de las capacidades del Llama 3 8B, pero sin evaluacion publicada no puede confirmarse el grado de degradacion.
- Generacion de codigo y matematicas: no disponible; no hay datos que confirmen su rendimiento tras la compresion.
- Tool calling / function calling: no disponible; el modelo base lo soporta de forma no nativa (via prompt), pero no se ha validado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el modelo base Llama 3 esta entrenado mayoritariamente en ingles con soporte limitado de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre poda de modelos: el checkpoint permite medir la degradacion de calidad frente al Llama 3 8B original en tareas controladas (perplejidad, MMLU, HumanEval) y comparar distintas estrategias de compresion.
- Despliegue en entornos con VRAM limitada: con 5,63 B de parametros, en FP16 ocupa unos 11,3 GB, lo que permite ejecutarlo en una GPU consumer de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o en una de 24 GB (RTX 4090) con margen para el contexto.
- Prototipado rapido de aplicaciones de texto: util para validar pipelines de generacion, RAG o resumen antes de migrar a un modelo mayor, siempre que se acepte la ausencia de garantias de calidad.
- Fine-tuning ligero en hardware modesto: al tener menos parametros que el 8B, el entrenamiento con LoRA o QLoRA requiere menos memoria, lo que facilita experimentos academicos.
- Benchmarking de tecnicas de cuantizacion: sirve como sujeto de prueba para comparar precision (FP16, INT8, INT4) sobre un modelo ya comprimido estructuralmente.
- Educacion y docencia: ejemplo practico de como la poda afecta al tamano, la latencia y la calidad de un LLM, con un checkpoint reproducible en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: ~11,3 GB solo para pesos; con cache KV y overhead, entre 13 y 16 GB segun longitud de contexto.
- VRAM estimada en INT8: ~5,6 GB para pesos; ~7-9 GB en total.
- VRAM estimada en INT4: ~2,8 GB para pesos; ~4-5 GB en total (requiere cuantizacion manual, no hay GGUF publicado).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para produccion; RTX 4090 (24 GB) y RTX 4080 (16 GB) para uso local en FP16.
- Cabe en GPU consumer: si, en RTX 4090, RTX 4080, RTX 4060 Ti 16 GB y, con cuantizacion INT4, en GPUs de 8 GB como RTX 3070.
- Opciones de despliegue: vLLM y TGI (soportan safetensors de Llama), transformers con `device_map="auto"`, llama.cpp u Ollama solo si se convierte previamente a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llama_3_30_percent_compression | 5,63 B | no disponible | llama3 | Hugging Face (safetensors) | Poda del 30 % sin evaluacion publicada |
| Meta Llama 3 8B | 8,03 B | 8.192 tokens | llama3 | Hugging Face, Ollama, vLLM | Modelo base de referencia, con benchmarks publicados |
| Meta Llama 3.2 3B | 3,21 B | 128.000 tokens | llama3.2 | Hugging Face, Ollama | Version oficial mas pequena, con contexto largo |
| Mistral 7B v0.3 | 7,24 B | 32.768 tokens | Apache 2.0 | Hugging Face, Ollama | Alternativa de licencia permisiva y contexto amplio |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, benchmarks ni descripcion del proceso de poda, lo que impide evaluar la calidad real del checkpoint.
- Riesgo elevado de degradacion: la poda del 30 % sin fine-tuning de recuperacion documentado suele producir perdida de coherencia, repeticiones y fallos en tareas de razonamiento.
- Longitud de contexto incierta: no se confirma si se mantienen los 8.192 tokens del Llama 3 8B ni como afecta la poda a la atencion en secuencias largas.
- Idiomas no verificados: se desconoce el soporte multilingue real tras la compresion.
- Riesgo de alucinacion: presumiblemente igual o superior al del modelo base, sin datos que lo cuantifiquen.
- Licencia Llama 3 Community License: permite uso comercial con restricciones (limite de 700 millones de usuarios mensuales, obligacion de atribucion y de nombrar el modelo derivado como "Llama 3"), pero no es una licencia de codigo abierto plena.
- Sesgos: heredados del corpus de entrenamiento de Llama 3, sin mitigaciones adicionales documentadas.
- No apto para produccion sin evaluacion propia: al no haber validacion externa, cualquier despliegue deberia ir precedido de una bateria de pruebas en el dominio objetivo.
- Formato unico: solo safetensors; no hay versiones GGUF, AWQ ni GPTQ publicadas, lo que limita el despliegue en herramientas de cuantizacion listas para usar.

## Enlaces

- Hugging Face: https://huggingface.co/PruningEverything/llama_3_30_percent_compression
- Sesion NVIDIA GTC 2025 sobre compresion de LLM (contexto general): https://www.nvidia.com/en-us/on-demand/session/gtc25-dlit71489/
- Modelo base Llama 3 8B: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Licencia Llama 3: https://llama.meta.com/llama3/license/

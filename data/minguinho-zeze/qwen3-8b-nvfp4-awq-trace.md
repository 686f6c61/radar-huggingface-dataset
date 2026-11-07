# Minguinho-zeze/Qwen3-8B-NVFP4-AWQ-Trace

## Resumen

Qwen3-8B-NVFP4-AWQ-Trace es un checkpoint cuantizado de Qwen3-8B publicado por el usuario Minguinho-zeze como parte del proyecto experimental lowbit-reasoning-ptq, orientado a estudiar el impacto de la cuantizacion de bajo bit en modelos de razonamiento. No se trata de un modelo entrenado desde cero, sino de un proceso de post-training quantization (PTQ) aplicado sobre los pesos oficiales de Qwen3-8B, sin entrenamiento adicional. El checkpoint emplea pesos NVFP4 y activaciones de entrada FP4 (esquema W4A4) con grupo de tamano 16, generados mediante el algoritmo AWQ y empaquetados en formato compressed-tensors.

El modelo resuelve un problema concreto: permitir ejecutar un LLM de 8.190 millones de parametros con razonamiento extendido (thinking mode) en GPUs Blackwell con precision FP4 nativa, reduciendo el coste de memoria y aprovechando los kernels de NVIDIA. Su relevancia actual es doble: por un lado, demuestra la viabilidad de W4A4 en tareas de razonamiento matematico y cientifico con una perdida de precision medible pero acotada; por otro, documenta de forma reproducible la receta, los metadatos y las metricas, algo poco habitual en checkpoints cuantizados de la comunidad.

La arquitectura subyacente es la de Qwen3-8B (transformer denso con modo de pensamiento explicito), con una longitud de contexto de 34.816 tokens configurada en el ejemplo de carga del autor. La licencia es Apache-2.0, heredada del modelo base, y el repositorio ocupa 6,4 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3-8B), cuantizacion W4A4 NVFP4 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 34.816 tokens (max_model_len en el ejemplo de carga de vLLM) |
| Tipos de cuantizacion | NVFP4 (pesos) + FP4 (activaciones de entrada), group size 16, algoritmo AWQ |
| Idiomas soportados | no disponible (no declarados en la model card ni en los tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF, no AutoAWQ) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Fraccion de parametros cuantizados | 84,800291 % |
| Capas no cuantizadas | embeddings, normalizacion y lm_head |
| Cache KV durante evaluacion | BF16 |
| Libreria de despliegue | vLLM |
| Version de vLLM del experimento | 0.32.0 |
| Version de PyTorch | 2.13.0 |
| Version de Transformers | 5.17.0 |
| Version de compressed-tensors | 0.17.0 |
| Kernels INT2 (referencia) | humming-kernels 0.1.17 |
| Hardware de evaluacion | RTX 5090 y RTX PRO 4500 Blackwell |
| Tamano del repositorio | 6,4 GB |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura de Qwen3-8B, un transformer denso con capacidad de razonamiento explicito (thinking mode) que se activa mediante `chat_template_kwargs={"enable_thinking": True}`. Sobre esa base no se realiza ningun entrenamiento adicional: la unica transformacion es una cuantizacion post-entrenamiento de tipo W4A4 con formato NVFP4, grupo de 16 elementos y algoritmo AWQ. Las capas de embedding, normalizacion y `lm_head` permanecen en precision original, y la cache KV se mantiene en BF16 durante la evaluacion, lo que limita la perdida de calidad en los componentes mas sensibles.

El proceso de calibracion es un punto metodologico destacable. Se generaron trazas de razonamiento en BF16 a partir de problemas de NuminaMath-1.5, excluyendo la fuente amc_aime y filtrando solapamientos de n-gramas de 13 palabras con las preguntas de evaluacion para evitar contaminacion. La calibracion usa 128 ventanas de 2.048 tokens con semilla 0. Los metadatos exactos de la receta estan en `recipe.yaml`, `quant_meta.json` y `config.json`. El autor advierte que las versiones del cuantizador y del runtime de compressed-tensors difieren y se conservan tal cual, sin asumir equivalencia.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con plantilla de chat compatible con vLLM.
- Razonamiento explicito en modo thinking, con presupuesto de salida configurable (hasta 32.768 tokens en la evaluacion).
- Razonamiento matematico: evaluado sobre AIME-120 con problemas de competicion.
- Razonamiento cientifico de nivel avanzado: evaluado sobre GPQA Diamond.
- Generacion de cadenas de razonamiento largas, util para tareas que requieren descomposicion multi-paso.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint (el modelo base Qwen3-8B lo soporta, pero la cuantizacion no ha sido validada en ese escenario).
- Capacidades de agente multi-paso: no validadas en este checkpoint.
- Capacidades multilingues: no declaradas; los idiomas soportados figuran como no disponibles.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de competicion tipo AIME con cadenas de pensamiento largas. Es adecuado porque el checkpoint conserva el 63,89 % de acierto en AIME-120 frente al 71,39 % del BF16, un deterioro acotado para un esquema W4A4.
- Evaluacion cientifica automatizada: con 57,74 % en GPQA Diamond, sirve para generar respuestas razonadas en dominios de fisica, quimica y biologia a nivel de posgrado, siempre que se acepte una perdida de unos 3,4 puntos respecto al BF16.
- Investigacion en cuantizacion de bajo bit: el repositorio incluye receta, metadatos y metricas por semilla, lo que permite reproducir el experimento y comparar algoritmos (AWQ frente a otras tecnicas) sobre el mismo protocolo.
- Despliegue en GPUs Blackwell con FP4 nativo: al usar NVFP4 y compressed-tensors, el checkpoint esta pensado para ejecutarse en RTX 5090 o RTX PRO 4500, aprovechando los kernels FP4 de la arquitectura.
- Generacion de trazas de razonamiento sinteticas: el propio autor uso trazas BF16 de Qwen3-8B sobre NuminaMath-1.5 como datos de calibracion; este checkpoint puede emplearse de forma analoga para generar cadenas de pensamiento a menor coste de memoria.
- Servicio de inferencia con vLLM: el ejemplo de carga con `max_model_len=34816`, `gpu_memory_utilization=0.90` y prefix caching desactivado permite montar un endpoint de chat con contexto largo en una sola GPU Blackwell.
- Prototipado de asistentes tecnicos con contexto largo: la ventana de 34.816 tokens admite conversaciones multi-turno o documentos extensos, aunque la calidad multilingue no esta documentada.

## Benchmarks y rendimiento

Precision en porcentaje, promediada sobre las semillas 0, 1 y 2. Cada semilla evalua 120 preguntas de AIME y 198 de GPQA Diamond. Las semillas repetidas son generaciones repetidas de las mismas preguntas, no conjuntos independientes. Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado y presupuesto de salida de 32.768 tokens. Las respuestas truncadas se puntuan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-8B BF16 | 71,39 | 61,11 |
| Este checkpoint (NVFP4-AWQ) | 63,89 | 57,74 |

Delta respecto al BF16: -7,50 puntos en AIME-120 y -3,37 puntos en GPQA Diamond. El autor advierte que las ejecuciones se hicieron en RTX 5090 y RTX PRO 4500 Blackwell y que las pequenas diferencias no deben atribuirse unicamente a los algoritmos de cuantizacion. Estas cifras describen el protocolo del autor y no son puntuaciones oficiales de Qwen.

No se han publicado en la informacion disponible datos de throughput, latencia ni benchmarks adicionales (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,4 GB en safetensors, por lo que los pesos en FP4 ocupan del orden de 5-6 GB; a ello hay que sumar la cache KV en BF16 y el overhead del runtime. Con 34.816 tokens de contexto y cache BF16, el consumo total puede superar ampliamente los pesos, por lo que se recomienda planificar con margen.
- GPU recomendadas: RTX 5090 y RTX PRO 4500 Blackwell son las unicas validadas por el autor. Otras GPUs, kernels y combinaciones de paquetes no han sido validadas por esta release.
- Compatibilidad con GPUs consumer: si, en principio cabe en GPUs consumer Blackwell con suficiente VRAM, pero la validacion oficial se limita a los modelos citados. En GPUs sin soporte FP4 nativo el checkpoint no es utilizable tal cual.
- Opciones de despliegue: vLLM 0.32.0 con compressed-tensors 0.17.0 es la ruta documentada. No se distribuye en GGUF, por lo que llama.cpp y Ollama no son opciones directas. TGI no aparece validado.
- Configuracion de referencia: `tokenizer_mode="hf"`, `config_format="hf"`, `generation_config="vllm"`, `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`, `seed=0`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor remite a los informes del repositorio para datos de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | AIME-120 | GPQA Diamond | Licencia |
|---|---|---:|---|---:|---:|---|
| Este checkpoint (Qwen3-8B-NVFP4-AWQ-Trace) | 8,19 B | 34.816 | NVFP4 W4A4, AWQ | 63,89 | 57,74 | Apache-2.0 |
| Qwen3-8B BF16 (base) | 8,19 B | no disponible en esta ficha | BF16 | 71,39 | 61,11 | Apache-2.0 |
| nvidia/Qwen3-8B-NVFP4 | 8,19 B | no disponible | NVFP4, TensorRT-LLM | no disponible | no disponible | Apache-2.0 |

El checkpoint de NVIDIA comparte esquema de cuantizacion (NVFP4) y modelo base, pero esta optimizado para TensorRT-LLM y no publica en la informacion disponible resultados con el protocolo AIME-120/GPQA Diamond del autor. La comparacion directa de rendimiento entre ambas releases no es posible con los datos disponibles.

## Limitaciones y advertencias

- Perdida de precision medible: -7,50 puntos en AIME-120 y -3,37 en GPQA Diamond respecto al BF16. Para tareas de razonamiento matematico de alta exigencia, el BF16 sigue siendo preferible.
- Validacion de hardware restringida: solo RTX 5090 y RTX PRO 4500 Blackwell han sido validadas. En otras GPUs el comportamiento es desconocido.
- Dependencia de versiones concretas: vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0 y compressed-tensors 0.17.0. El ejemplo de carga no se ha reejecutado desde el repositorio subido, segun el propio autor.
- Formato no estandar para consumo general: no es GGUF ni AutoAWQ, lo que excluye llama.cpp, Ollama y otras herramientas habituales de inferencia local.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue ni sobre calidad en castellano.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion puede agravarlo en dominios donde el BF16 ya fallaba. No hay evaluacion especifica de factualidad.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3-8B.
- Tool calling y agentes no validados: no hay evidencia de que estas capacidades del modelo base sobrevivan intactas tras la cuantizacion W4A4.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero el autor remite a la licencia upstream incluida en `LICENSE`; conviene verificar los terminos del modelo base antes de un despliegue en produccion.
- Presupuesto de salida elevado: el protocolo de evaluacion usa hasta 32.768 tokens de salida, lo que implica coste computacional y latencia altos en modo thinking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-8B-NVFP4-AWQ-Trace
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio del proyecto lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Commit del experimento: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/10509d06fd76ae1bcdd0395965d82aebd95eb2f1
- Informes de metricas, truncamiento, velocidad y analisis: https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-8b-20261107
- Configuracion del motor de inferencia: https://github.com/minguinho26/lowbit-reasoning-ptq/blob/10509d06fd76ae1bcdd0395965d82aebd95eb2f1/src/engine.py
- Release NVFP4 de NVIDIA sobre Qwen3-8B: https://huggingface.co/nvidia/Qwen3-8B-NVFP4
- Articulo sobre Qwen3-8B-NVFP4 para GPUs NVIDIA: https://dev.co/ai/llms/qwen3-8b-nvfp4

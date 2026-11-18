# dotlabs/void.1

## Resumen

void.1 es un modelo de lenguaje de pequeno tamano (SLM) desarrollado por dotlabs que se presenta como un paso inicial hacia modelos capaces de razonamiento simbolico y abstracto sobre texto, con base en ingles. A diferencia de la mayoria de SLM actuales, no emplea tokenizacion BPE como interfaz principal, sino que se define como un modelo *byte-level*: procesa directamente bytes, lo que elimina el vocabulario fijo de tokens y permite, en teoria, una cobertura total de cadenas de entrada. El modelo se entrena desde cero, sin destilacion de modelos mayores, sobre una mezcla de corpus publicos y un kernel simbolico interno.

La relevancia actual del modelo reside en su posicion en el leaderboard Open SLM: el autor afirma que void.1 (24.38 II) supera o iguala a palmer-006 (23.33 II) en todos los benchmarks evaluados, dentro de la categoria de modelos por debajo de 100M de parametros. Con 90.148.352 parametros totales y un contexto no documentado en la informacion disponible, void.1 se orienta a experimentacion en investigacion de tokenizacion byte-level y razonamiento simbolico, mas que a despliegues de produccion generalistas.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con la libreria transformers. El autor indica que void.2 esta pausado para centrarse en modelos con mejor rendimiento y usabilidad, por lo que void.1 debe considerarse una version de investigacion congelada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only byte-level (basado en qwen3, segun tags) |
| Parametros totales | 90.148.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Vocabulario | byte-level (256 simbolos base, sin BPE) |
| Datos de entrenamiento | 131.69 mil millones de bytes (~32.92B-43.90B tokens estandar, ~38B tokens BPE equivalentes) |
| Hardware de entrenamiento | 1x NVIDIA RTX PRO 6000, ~12 dias |
| Checkpoint evaluado | step 900.000 (lr decayed a 0 sobre ~10B bytes adicionales) |

## Arquitectura y entrenamiento

void.1 es un transformer decoder-only de 90M de parametros que opera sobre bytes en lugar de tokens BPE. La model card lo etiqueta con `qwen3`, lo que sugiere que la arquitectura sigue el diseno de la familia Qwen3 (probablemente con atención causal estandar, RMSNorm y SwiGLU, aunque estos detalles no se confirman en la informacion disponible). La innovacion central es la interfaz byte-level: el modelo recibe secuencias de bytes crudos, lo que evita el sesgo de vocabulario y permite representar cualquier texto, incluidos simbolos, codigo y ruido, sin tokens especiales de fallback.

El entrenamiento se realizo desde cero sobre 131.69 mil millones de bytes, equivalentes a entre 32.92B y 43.90B tokens estandar (unos 38B tokens BPE de media). La mezcla de datos incluye `karpathy/climbmix-400b-shuffle`, `openbmb/Ultra-FineWeb-L3`, `dotlabs/rewrite` y `nvidia/OpenMathInstruct-2`, ademas de un "internal symbolic kernel" no documentado publicamente. El checkpoint evaluado es el step 900.000, con learning rate decaido a cero sobre aproximadamente 10B bytes adicionales. No se documenta en la informacion disponible el uso de RLHF, DPO, decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Generacion de texto en ingles con interfaz byte-level, sin dependencia de un tokenizador BPE externo.
- Razonamiento simbolico y abstracto sobre texto, segun la propuesta del autor (kernel simbolico interno).
- Razonamiento matematico, con datos de entrenamiento provenientes de `nvidia/OpenMathInstruct-2`.
- Procesamiento de texto sin perdida por tokenizacion: cualquier cadena de bytes es representable.
- Capacidad multilingue limitada: solo se declara ingles; el byte-level permite en teoria procesar otros idiomas, pero no hay evaluacion publicada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en tokenizacion byte-level: void.1 sirve como baseline reproducible (90M parametros, 131.69B bytes, 12 dias en una RTX PRO 6000) para estudiar el impacto de eliminar BPE en modelos pequenos, comparando curvas de perdida y benchmarks frente a SLM con tokenizador estandar.
- Experimentos de razonamiento simbolico: el kernel simbolico interno y los datos de `dotlabs/rewrite` permiten evaluar si un SLM puede aprender transformaciones abstractas de cadenas (sustituciones, reescrituras, patrones) sin un vocabulario fijo.
- Generacion de texto controlada en ingles para prototipos: con 90M de parametros, el modelo cabe en cualquier GPU consumer y sirve para validar pipelines de generacion (transformers, TGI) antes de escalar a modelos mayores.
- Fine-tuning ligero para tareas de dominio: al ser Apache 2.0 y safetensors, se puede ajustar con LoRA en una unica GPU para tareas de clasificacion, reescritura o extraccion sobre texto en ingles.
- Educacion y divulgacion: su tamano y su entrenamiento documentado (config, tensorboard, notebook de evaluacion) lo hacen util para explicar el ciclo completo de preentrenamiento de un SLM desde cero.
- Evaluacion comparativa en leaderboards de SLM: sirve como referencia en la categoria sub-100M del Open SLM Leaderboard, con un indice II de 24.38 frente a los 23.33 de palmer-006.
- Procesamiento de texto ruidoso o no estandar: al operar sobre bytes, puede manejar entradas con caracteres fuera de vocabulario, errores de codificacion o simbolos raros sin tokens UNK, util en limpieza de datos y preprocesamiento.

## Benchmarks y rendimiento

La model card no presenta una tabla numerica de benchmarks por tarea (MMLU, HumanEval, GSM8K, etc.) en el texto proporcionado; solo se indica un indice agregado del Open SLM Leaderboard. Los datos disponibles son:

| Metrica | void.1 | palmer-006 |
|---|---|---|
| Indice Open SLM Leaderboard (II) | 24.38 | 23.33 |
| Parametros totales | 90.148.352 | no disponible |
| Categoria | sub-100M | no disponible |

No se han publicado resultados desglosados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor remite al notebook `evals.ipynb` del repositorio para los detalles de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 90M de parametros en fp32 (~360 MB), fp16 (~180 MB) o int8 (~90 MB), el modelo cabe holgadamente en cualquier GPU consumer; el limite practico lo marca la longitud de contexto y el tamano de lote, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en fp16 con lotes pequenos; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son validas. El entrenamiento se realizo en una RTX PRO 6000.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, incluidas las integradas con suficiente memoria compartida para lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan variantes GGUF para llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Indice Open SLM (II) | Licencia | Tokenizacion |
|---|---|---|---|---|---|
| dotlabs/void.1 | 90.148.352 | no disponible | 24.38 | Apache 2.0 | byte-level |
| appvoid/palmer-006 | no disponible | no disponible | 23.33 | no disponible | no disponible |
| Otros SLM sub-100M | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada por el autor es frente a palmer-006, con una ventaja de 1.05 puntos en el indice agregado. No se dispone de datos de contexto, licencia ni tokenizacion de palmer-006 en la informacion proporcionada, ni de comparaciones con otros SLM de referencia (p. ej., Qwen3-0.6B, SmolLM2-135M, MobileLLM) que permitan una tabla mas amplia.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en otros idiomas no esta evaluado y el byte-level no garantiza calidad multilingue.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinacion alto por su tamano (90M de parametros) y por el volumen de entrenamiento (~38B tokens BPE equivalentes), muy por debajo de modelos de referencia de mayor escala.
- No hay datos publicados de sesgos; al entrenarse sobre corpus web (climbmix, Ultra-FineWeb) es probable que herede sesgos de esas fuentes, pero no se cuantifican.
- No se documentan capacidades de tool calling, agentes ni modo thinking, por lo que no es adecuado para pipelines agenticos sin validacion previa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es una version de investigacion: el autor pauso void.2 y no garantiza soporte ni mantenimiento de void.1.
- El tag `qwen3` sugiere una arquitectura derivada, pero no se confirma si los pesos son compatibles con implementaciones optimizadas de Qwen3; conviene validar la carga en transformers antes de produccion.
- El formato de pesos es safetensors unicamente; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos sin GPU o con llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dotlabs/void.1
- Open SLM Leaderboard (entrada de void.1): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard#dotlabs-void.1
- Notebook de evaluacion: https://huggingface.co/dotlabs/void.1/blob/main/evals.ipynb
- Configuracion de entrenamiento: https://huggingface.co/dotlabs/void.1/blob/main/training_config.json
- Metricas de entrenamiento (TensorBoard): https://huggingface.co/dotlabs/void.1/tensorboard
- Modelo comparable palmer-006: https://huggingface.co/appvoid/palmer-006
- Dataset karpathy/climbmix-400b-shuffle: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset dotlabs/rewrite: https://huggingface.co/datasets/dotlabs/rewrite
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2

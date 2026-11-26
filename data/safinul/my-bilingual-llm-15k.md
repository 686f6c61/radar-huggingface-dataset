# Safinul/my-bilingual-llm-15k

## Resumen

My-Bilingual-LLM (41,87 M) es un modelo de lenguaje causal decoder-only de pequeno tamano desarrollado por el usuario Safinul y publicado en Hugging Face. Se trata de un transformer estilo GPT con pre-normalizacion (Pre-LN), 8 capas, 8 cabezas de atencion, dimension de embedding de 512 y un vocabulario SentencePiece de 32.000 tokens. El modelo fue sometido a un entrenamiento continuado (continued pretraining) de 15.000 pasos sobre la Wikipedia en bengali estandar limpia (subset `20231101.bn` del dataset `wikimedia/wikipedia`).

Su proposito declarado es servir como linea base controlada de escalado con pocos parametros para investigacion en normalizacion de dialectos del bengali hacia el bengali estandar. Es, por tanto, un modelo de investigacion y no un asistente conversacional de proposito general: no se documenta ajuste por instrucciones, RLHF ni alineamiento.

La relevancia actual es limitada y muy especifica: resulta util para experimentos academicos sobre escalado de parametros, tokenizacion bilingue (bn/en) y normalizacion dialectal, pero no esta pensado para despliegue en produccion. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT con Pre-LN y weight tying |
| Parametros totales | 41,87 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`) |
| Idiomas soportados | bengali (bn) e ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`) |
| Capas | 8 |
| Cabezas de atencion | 8 |
| Dimension de embedding | 512 |
| Vocabulario | 32.000 tokens (SentencePiece) |
| Pasos de entrenamiento | 15.000 |
| Perdida final de entrenamiento | aproximadamente 3,85 (inicial: 7,75) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo GPT con normalizacion previa a cada subcapa (Pre-LN) y ataduras de pesos (weight tying) entre la matriz de embedding y la capa de salida, lo que reduce el numero de parametros efectivos. Con 8 capas, 8 cabezas y 512 dimensiones de embedding, se situa en la gama de los modelos pequenos de investigacion, muy por debajo de los modelos de miles de millones de parametros.

El entrenamiento consistio en un continued pretraining de 15.000 pasos sobre el corpus de Wikipedia en bengali estandar (`wikimedia/wikipedia`, `20231101.bn`), previamente limpiado. La perdida de entrenamiento paso de 7,75 a aproximadamente 3,85 al final del proceso. No se documenta el numero total de tokens procesados, la composicion exacta del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se especifica la longitud de contexto durante el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en bengali e ingles, limitada por el corpus de entrenamiento (Wikipedia en bengali).
- Modelado de lenguaje causal: prediccion del siguiente token, util para tareas de continuacion de texto y perplejidad.
- Base para investigacion en normalizacion dialectal del bengali hacia el bengali estandar.
- Tokenizacion SentencePiece bilingue (bn/en) con vocabulario de 32.000 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking mode), vision ni audio.
- No se documenta ajuste por instrucciones ni capacidad conversacional multi-turno.

## Casos de uso

- Investigacion en escalado de parametros: el modelo sirve como punto de referencia controlado (41,87 M) para comparar curvas de perdida frente a modelos mayores o menores en el mismo corpus, gracias a su configuracion documentada y reproducible.
- Normalizacion de dialectos del bengali: puede emplearse como base para fine-tuning supervisado que transforme texto dialectal en bengali estandar, que es el proposito declarado por el autor.
- Experimentos de tokenizacion bilingue: su vocabulario SentencePiece de 32.000 tokens permite estudiar el reparto de tokens entre bengali e ingles y su impacto en la perplejidad.
- Generacion de texto de bajo coste en bengali: al ocupar 0,2 GB, puede ejecutarse en CPU o en GPU consumer para tareas de continuacion de texto no criticas.
- Docencia y prototipado: util para cursos de NLP que necesiten un modelo GPT pequeno entrenable y analizable en su totalidad.
- Evaluacion de tecnicas de limpieza de corpus: al estar entrenado sobre Wikipedia en bengali limpia, permite medir el efecto de distintas estrategias de preprocesado en la perdida final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es la perdida final de entrenamiento (aproximadamente 3,85, partiendo de 7,75), que no es directamente comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (41,87 M de parametros, aproximadamente 168 MB de pesos), y alrededor de 80-100 MB en FP16.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 lo ejecutan sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 1 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: al distribuirse como `state_dict` de PyTorch (`.pt`) y no como safetensors ni GGUF, requiere cargarlo con PyTorch y el tokenizador SentencePiece; no hay conversion oficial a llama.cpp, Ollama, vLLM ni TGI documentada.
- Latencia y throughput estimados: no disponibles. Por su tamano, la latencia por token en GPU consumer deberia ser del orden de milisegundos, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Safinul/my-bilingual-llm-15k | 41,87 M | no disponible | bn, en | no disponible | PyTorch `.pt` |
| GPT-2 small | 124 M | 1.024 tokens | en | MIT | safetensors, PyTorch |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | en (multilingue parcial) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | multilingue (incluye bn) | Apache 2.0 | safetensors, GGUF |

La comparacion es orientativa: los modelos alternativos tienen licencias y formatos claramente documentados, mientras que My-Bilingual-LLM carece de licencia publicada y de contexto declarado. Para tareas reales en bengali, Qwen2.5-0.5B ofrece un contexto mucho mayor y soporte multilingue verificado; My-Bilingual-LLM solo resulta preferible como objeto de estudio por su tamano minimo y su configuracion abierta.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso en produccion.
- Entrenado exclusivamente sobre Wikipedia en bengali: el conocimiento del mundo y la calidad en ingles son muy limitados pese a la etiqueta bilingue.
- Sin ajuste por instrucciones ni alineamiento: no es adecuado como asistente conversacional; producira continuaciones de texto, no respuestas a preguntas.
- Riesgo elevado de alucinacion y de generar texto factualmente incorrecto, agravado por el reducido numero de parametros.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas.
- Perdida final de entrenamiento de 3,85 en un corpus limitado, lo que sugiere una calidad de generacion baja en comparacion con modelos mas grandes.
- Sesgos potenciales heredados de la Wikipedia en bengali (sesgo de cobertura, de genero y geografico), no evaluados por el autor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- Formato `.pt` sin safetensors ni GGUF: requiere cargar codigo PyTorch y no es directamente compatible con herramientas de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Safinul/my-bilingual-llm-15k
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia (subset `20231101.bn`)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

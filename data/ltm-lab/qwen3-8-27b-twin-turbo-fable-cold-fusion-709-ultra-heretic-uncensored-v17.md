# LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v17

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v17 es un modelo multimodal de tipo image-text-to-text publicado por LTM-Lab, un laboratorio independiente, y distribuido bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tune) del checkpoint V16 del mismo autor, que a su vez deriva de la familia Qwen3.5, segun la etiqueta de arquitectura `qwen3_5` declarada en el repositorio. El modelo cuenta con 27.781.427.952 parametros totales (aproximadamente 27,8 mil millones) y un tamano de repositorio de 55,6 GB en formato safetensors.

La propuesta tecnica del modelo se centra en lo que el autor denomina "memoria episodica persistente FORMAT 8", procedimientos respaldados por evidencia y prediccion de eventos en tiempo de inferencia, capacidades que se anuncian como novedad de la version V17 respecto a V16. El modelo se presenta explicitamente como "uncensored", es decir, sin las capas de alineacion y rechazo habituales en modelos comerciales, lo que condiciona fuertemente su perfil de uso y sus riesgos.

El interes practico de esta ficha es limitado pero relevante para evaluacion: se trata de un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks publicados y sin documentacion sobre datos de entrenamiento. Cualquier evaluacion rigurosa debe tratar la informacion del autor como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (etiqueta `qwen3_5`, `custom_code`) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni AWQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de carga | transformers (`AutoModelForImageTextToText`, `trust_remote_code=True`) |
| Modelo base | LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v16 |
| Tamano del repositorio | 55,6 GB |
| Modalidad | Texto e imagen de entrada; texto de salida |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un transformer multimodal con pipeline `image-text-to-text`, construido sobre la arquitectura etiquetada como `qwen3_5` y que requiere `custom_code` para su carga, lo que implica que el repositorio incluye codigo Python propio que se ejecuta con `trust_remote_code=True`. El autor declara que la version V17 "retiene los pesos, el tokenizer y los recursos de modelo del checkpoint fuente V16", es decir, que el cambio de version no implica necesariamente un reentrenamiento de los pesos, sino la incorporacion de capacidades adicionales en la capa de inferencia (memoria episodica FORMAT 8, procedimientos respaldados por evidencia y prediccion de eventos).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o cualquier otra tecnica de alineacion, ni sobre innovaciones de eficiencia como atencion lineal o decodificacion especulativa. La model card es extremadamente escueta y se limita a describir el procedimiento de carga y las capacidades declaradas. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo citado seria especulativa.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun la etiqueta `conversational`.
- Procesamiento de imagenes junto con texto de entrada (pipeline `image-text-to-text`), lo que habilita tareas de descripcion de imagenes, VQA y razonamiento sobre contenido visual.
- Memoria episodica persistente declarada como "FORMAT 8": el autor afirma que el modelo puede mantener y recuperar informacion de interacciones previas en tiempo de inferencia.
- Procedimientos respaldados por evidencia ("evidence-backed procedures"), segun la model card.
- Prediccion de eventos en tiempo de inferencia ("event-time forecasting"), capacidad declarada sin especificacion tecnica ni ejemplos.
- Modo sin censura ("uncensored"): el autor indica explicitamente la ausencia de filtros de rechazo, lo que implica que el modelo respondera a peticiones que modelos alineados rechazarian.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.

## Casos de uso

- Investigacion sobre memoria episodica en LLM: el modelo puede emplearse como banco de pruebas para evaluar si el mecanismo "FORMAT 8" descrito por el autor mejora la retencion de informacion en conversaciones largas, comparando su comportamiento con el checkpoint V16 del que deriva.
- Analisis de imagenes en entornos controlados: al ser un modelo image-text-to-text, permite experimentar con descripcion de imagenes y VQA en pipelines de investigacion donde no se requiera garantia de calidad comercial.
- Estudio de modelos sin alineacion: util para investigadores que analizan el efecto de eliminar las capas de rechazo sobre la utilidad, la veracidad y la seguridad de las respuestas, siempre en entornos aislados.
- Prototipado de asistentes conversacionales con contexto visual: integrable mediante `transformers` con `AutoModelForImageTextToText` en cuadernos de experimentacion, sin compromiso de produccion.
- Evaluacion comparativa de checkpoints derivados: al existir una cadena V16 -> V17, sirve para medir el impacto de los cambios de version sobre las mismas tareas y prompts.
- Experimentacion con prediccion de eventos: la capacidad declarada de "event-time forecasting" puede probarse en tareas sinteticas de series temporales o narrativas, siempre validando los resultados de forma externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica en la model card, y no existen datos de evaluacion independiente para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 64 GB o mas de memoria de GPU.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28-30 GB, viable en una A100 40 GB o en dos RTX 4090 de 24 GB con reparto de capas.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 15-18 GB, potencialmente viable en una RTX 4090 de 24 GB, aunque no se publican pesos cuantizados en el repositorio y habria que generarlos.
- GPU recomendadas: A100 80 GB o H100 80 GB para inferencia en bf16 sin cuantizar; A100 40 GB o dos RTX 4090 para 8 bits.
- Cabe en GPU de consumo: solo con cuantizacion agresiva (4 bits) y una unica RTX 4090 o RTX 3090 de 24 GB, con riesgo de desbordamiento por activaciones.
- Opciones de despliegue: al requerir `custom_code`, la ruta soportada es `transformers` con `trust_remote_code=True`; no se declara compatibilidad con vLLM, TGI, llama.cpp ni Ollama, y la ausencia de pesos GGUF impide su uso directo en llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-...-v17 (este) | 27,8 B | no disponible | imagen + texto | Apache 2.0 | no |
| Qwen2.5-VL-32B (referencia de familia) | ~32 B | no disponible en esta ficha | imagen + texto | Apache 2.0 | si, en su model card oficial |
| LTM-Lab/Qwen3.8-27B-...-v16 (checkpoint base) | 27,8 B (heredado) | no disponible | imagen + texto | Apache 2.0 | no |

La comparacion con modelos de la familia Qwen oficial es solo orientativa: este checkpoint es un fine-tune comunitario sin evaluacion publicada, por lo que no es posible establecer equivalencias de rendimiento con los modelos base de Alibaba. No se dispone de datos para comparar latencia, calidad o robustez frente a alternativas consolidadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion independiente: no hay evidencia publica de que las capacidades declaradas (memoria episodica, prediccion de eventos) funcionen segun lo descrito.
- Modelo "uncensored": no incorpora capas de rechazo, por lo que puede generar contenido danino, ilegal o inseguro sin advertencia; no es apto para aplicaciones orientadas al publico sin moderacion externa.
- Riesgo elevado de alucinacion: sin datos de alineacion ni de evaluacion de veracidad, y con un autor que declara capacidades no verificadas, la fiabilidad factica es desconocida.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo Python del autor del repositorio, lo que supone un riesgo de seguridad en entornos de produccion y obliga a auditar el codigo antes de usarlo.
- Idiomas no declarados: se desconoce el soporte real del castellano y de otras lenguas distintas del ingles.
- Longitud de contexto no documentada: no es posible planificar casos de uso que dependan de ventanas largas.
- Cero descargas y cero likes en el momento de la consulta: no existe comunidad que haya validado el checkpoint, lo que reduce la probabilidad de encontrar correcciones o informes de errores.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el autor no ofrece garantias ni asume responsabilidad sobre el comportamiento del modelo; el uso comercial de un modelo sin alinear conlleva riesgo reputacional y legal.
- Cadena de dependencias opaca: el modelo base es otro checkpoint del mismo autor, lo que dificulta trazar el linaje real de los pesos hasta el modelo Qwen original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v17
- Checkpoint base V16: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v16
- Revision concreta del checkpoint V16 referenciada en la model card: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v16/tree/46466a75ed501e60bf3e078d2f451473830e903f
- Perfil del autor en Hugging Face: https://huggingface.co/LTM-Lab
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.

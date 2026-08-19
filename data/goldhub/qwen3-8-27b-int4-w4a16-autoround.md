# goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound

## Resumen
El modelo `goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound` es una variante cuantizada en 4 bits del modelo Qwen3.8-27B, un modelo de lenguaje multimodal (vision, video y texto) desarrollado por el equipo de Qwen y posteriormente optimizado por el usuario `goldhub`. El objetivo principal de esta ficha es reducir los requisitos de VRAM para permitir su ejecucion en hardware de consumo, manteniendo capacidades como la ventana de contexto de 256K tokens, el procesamiento de imagenes y video, y el soporte de Multi-Token Prediction (MTP).

La cuantizacion se realiza mediante el metodo AutoRound con un esquema W4A16 (pesos de 4 bits, activaciones de 16 bits), preservando capas criticas como el encoder de vision, las proyecciones de atencion lineal y los embeddings en FP16/BF16 para evitar la degradacion multimodal. Un dato relevante es que, aunque el nombre indica 27B, el peso total real de los safetensors es de 11.575.659.760 parametros, lo que sugiere una arquitectura de mezcla de expertos (MoE) con parametros activos inferiores, aunque este dato no se especifica en la documentacion.

El modelo se comercializa con un alineamiento "uncensored" o "heretic", orientado a proporcionar respuestas sin los guardarrailes corporativos habituales. Esto lo hace interesante para investigacion y exploracion creativa, pero introduce riesgos significativos para su uso en produccion. La licencia es Apache-2.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (híbrida: atencion lineal + atencion completa + encoder de vision) |
| Parametros totales | 11.575.659.760 (dato real de safetensors; el nombre indica 27B, probablemente MoE) |
| Parametros activos | no disponible (no se especifica en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | W4A16 (AutoRound, group size 32, simetrico, 1000 iteraciones) |
| Idiomas soportados | en, zh, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`) |

## Arquitectura y entrenamiento
La arquitectura base es Qwen3.8-27B, que combina atencion lineal (`linear_attn.*`) con atencion tradicional y un encoder de vision para procesar imagenes y video (Temporal Patch Size: 2). Esta hibridacion permite manejar contextos extremadamente largos (256K) con un coste computacional reducido en comparacion con la atencion cuadratica pura. El modelo tambien soporta Multi-Token Prediction (MTP), una tecnica que predice varios tokens futuros simultaneamente para acelerar la inferencia.

La cuantizacion se realizo con AutoRound (v0.15.0), un metodo de cuantizacion de pesos basado en redondeo optimizado. El esquema W4A16 mantiene las activaciones en 16 bits y los pesos en 4 bits con un grupo de tamano 32. Para evitar la degradacion del rendimiento multimodal y el colapso de atencion, se preservaron en FP16/BF16 las siguientes capas: `embed_tokens`, `model.visual.*` (encoder de vision) y `linear_attn.*` (proyecciones de atencion lineal). El entrenamiento de la cuantizacion utilizo datasets de destilacion como `armand0e/claude-fable-5-claude-code`, `greghavens/fable-5-coding-and-debugging-traces` y `CodeFlame/Qwen3.8-GLM5.2-Kimi-K3-GPT5.6-Gemini-3.1-Claude-Fable5-Mythos5-distillation`, aunque no se especifica el numero exacto de tokens de entrenamiento ni el proceso de alineamiento (RLHF/DPO) en la informacion disponible.

## Capacidades
- Generacion de texto multimodal: procesa entradas de texto, imagenes y video, generando descripciones detalladas o respuestas contextuales.
- Razonamiento matematico y logico: segun las pruebas internas del autor, resuelve problemas complejos de velocidad relativa y acertijos con razonamiento paso a paso y formato LaTeX.
- Generacion de codigo: produce codigo Python listo para produccion, cumpliendo con PEP-8, e implementaciones optimizadas de algoritmos clasicos (por ejemplo, la Criba de Eratostenes con `bitarray`).
- Escritura creativa y filosofica: capaz de generar ficcion existencial (ciberpunk, noir) y ensayos sobre conciencia de IA sin rechazos ni censura.
- Contexto largo: sintetiza y resume historial extenso de conversaciones o documentos de hasta 256K tokens.
- Multi-Token Prediction (MTP): soporte para acelerar la inferencia mediante la prediccion de multiples tokens a la vez.
- Alineamiento "uncensored": disenado para evitar respuestas evasivas o moralizantes, ofreciendo respuestas directas en temas filosoficos, creativos y tecnicos.

## Casos de uso
- Analisis de documentos extensos con contenido visual: el modelo puede procesar libros, informes o manuales de miles de paginas (hasta 256K tokens) que incluyan diagramas o imagenes, resumiendo y extrayendo informacion clave sin perder el contexto.
- Asistente de programacion local: integrable en entornos de desarrollo (IDE) o pipelines de CI/CD para generar codigo, revisar implementaciones y optimizar algoritmos. Su capacidad para generar codigo PEP-8 y su velocidad (~56,6 tok/s) lo hacen util para iteraciones rapidas.
- Razonamiento cientifico y matematico: adecuado para resolver problemas de fisica, matematicas o logica que requieran pasos intermedios claros y justificados, gracias a su capacidad de generar respuestas con formato LaTeX y razonamiento estructurado.
- Creacion de contenido sin restricciones: util para escritores o guionistas que necesitan explorar temas oscuros, existenciales o controvertidos sin filtros, como ficcion especulativa o ensayos sobre filosofia de la IA.
- Procesamiento de video: al soportar entradas de video (Temporal Patch Size: 2), puede analizar secuencias cortas para generar descripciones, detectar acciones o responder preguntas sobre el contenido visual temporal.
- Chat conversacional de largo recorrido: ideal para construir agentes de chat que mantengan conversaciones muy largas con usuarios, recordando detalles de interacciones pasadas gracias a la ventana de contexto de 256K tokens.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion proporcionada. El autor incluye en la model card una serie de "pruebas internas de estres" cuyos resultados se presentan a continuacion. Estos datos deben tomarse como declaraciones del autor y no como resultados verificados de forma independiente.

| Prueba interna | Resultado declarado |
|---|---|
| Velocidad de generacion | ~56,6 tok/s en hardware de consumo |
| Razonamiento matematico | Resolucion correcta de acertijos (por ejemplo, el acertijo de las 17 ovejas) y problemas de velocidad relativa con explicaciones paso a paso en LaTeX |
| Generacion de codigo | Codigo Python PEP-8, incluyendo una implementacion optimizada de la Criba de Eratostenes con `bitarray` y analisis de complejidad |
| Contexto largo | Sintetizacion precisa de la historia de los LLM desde Word2Vec hasta arquitecturas MoE y MTP |
| Creatividad | Generacion de ficcion existencial ciberpunk y ensayos filosoficos sobre la conciencia de la IA |

## Requisitos de hardware
- VRAM estimada: el tamano del repositorio es de 28,3 GB. Dado que se preservan capas en FP16/BF16, el peso en memoria es significativamente mayor que un INT4 estandar (que normalmente ocuparia 15-18 GB). Se recomienda un minimo de 24 GB de VRAM para inferencia basica.
- GPU recomendadas: el autor indica que el modelo esta optimizado para 2x RTX 3090 (24 GB cada una) con `tensor-parallel-size=2`. En una sola GPU de 24 GB (RTX 3090/4090) puede ejecutarse con una longitud de contexto reducida (por ejemplo, 32K tokens).
- Opciones de despliegue: compatible con vLLM, SGLang y Transformers con `trust_remote_code=True`. Para entornos sin GPU de alta capacidad, se podria usar llama.cpp si se convierte a GGUF, aunque no se proporciona oficialmente.
- Latencia y throughput: la velocidad declarada es de ~56,6 tok/s en hardware de consumo, aunque esto depende del contexto y del numero de GPUs. Con 2x RTX 3090 y contexto largo (128K-256K), el autor advierte que se requiere un "batcheo cuidadoso" para mantener la estabilidad.

## Comparativa con modelos similares
La comparativa se realiza con modelos multimodales de tamano similar y licencia permisiva. Los datos de Qwen2.5-VL-7B y Llama 3.2 11B Vision se basan en especificaciones publicas conocidas, no en la informacion proporcionada en la ficha.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound | 11,58B (total) | 256K | W4A16 (AutoRound) | Apache-2.0 | Multimodal (vision/video), MTP, sin guardarrailes |
| Qwen2.5-VL-7B | 8B | 128K | BF16/INT4 (disponible) | Apache-2.0 | Multimodal (vision), alineamiento estandar |
| Llama 3.2 11B Vision | 11B | 128K | BF16/INT4 (disponible) | Llama 3.2 Community License | Multimodal (vision), requiere atribucion de marca |

La principal diferencia de este modelo es su mayor contexto (256K) y su alineamiento "uncensored". Sin embargo, el peso real de 11,58B (frente al nombre de 27B) sugiere que es un MoE, y el numero de parametros activos no se ha publicado, lo que dificulta una comparacion directa de rendimiento por parametro.

## Limitaciones y advertencias
- Alineamiento "uncensored" o "heretic": el modelo carece de los guardarrailes de seguridad estandar. Puede generar contenido ofensivo, peligroso, ilegal o eticamente cuestionable. No es apto para aplicaciones de produccion dirigidas al publico general sin una capa adicional de moderacion.
- Riesgo de alucinacion: aunque el autor declara una buena sintesis de contexto largo, la cuantizacion W4A16 con preservacion selectiva de capas no elimina el riesgo inherente de alucinaciones, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Discrepancia en el tamano del modelo: el nombre indica 27B, pero los pesos reales son de 11,58B. Esto implica que es un MoE, pero al no publicarse el numero de parametros activos, el rendimiento real por token puede variar significativamente y no es directamente comparable con modelos densos de tamano similar.
- Requisitos de VRAM elevados para un INT4: el repositorio ocupa 28,3 GB, muy por encima de los 15-18 GB tipicos de un INT4, debido a la preservacion de capas en FP16. Esto limita su uso en GPUs de consumo de gama baja (por ejemplo, RTX 3060 de 12 GB no es suficiente).
- Idiomas limitados: aunque la base Qwen soporta mas idiomas, la ficha oficial solo declara soporte para ingles, chino y ruso. El rendimiento en otros idiomas (como el espanol) no esta garantizado ni documentado.
- Dependencia de codigo remoto: para su uso con Transformers es necesario `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor y conlleva riesgos de seguridad en entornos aislados.
- Licencia de los datasets de destilacion: aunque el modelo final es Apache-2.0, los datasets utilizados para el entrenamiento de cuantizacion pueden tener licencias propias que restrinjan su redistribucion o uso comercial.

## Enlaces
- Repositorio del modelo: https://huggingface.co/goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de destilacion (ejemplo): https://huggingface.co/datasets/CodeFlame/Qwen3.8-GLM5.2-Kimi-K3-GPT5.6-Gemini-3.1-Claude-Fable5-Mythos5-distillation
- Dataset de destilacion (ejemplo): https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset de destilacion (ejemplo): https://huggingface.co/datasets/Crownelius/Complete-FABLE.5-traces-2M

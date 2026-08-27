# localized-ft/OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed5

## Resumen

El modelo `localized-ft/OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed5` es un ajuste fino (fine-tuning) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Se trata de una variante especializada en nombres de ciudades alemanas (german-city-names) y que emplea una técnica de "inoculation prompting" (prompting de inoculación) para mejorar la robustez del modelo ante ciertos patrones o sesgos. El modelo está orientado a generación de texto y es compatible con la librería Transformers de HuggingFace.

El modelo base, OLMo-3-7B-Instruct, es un modelo denso de 7 mil millones de parámetros, con una ventana de contexto de 32.000 tokens, entrenado sobre el dataset Dolma (3 billones de tokens). El ajuste fino se realizó con las librerías Unsloth y TRL, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tuning convencional. El repositorio indica una licencia Apache 2.0 y el idioma principal es el inglés, aunque el nombre sugiere un enfoque en alemán.

A pesar de que el repositorio reporta un número de parámetros de 528.384 (probablemente un error de metadata, ya que el modelo base tiene ~7B), el tamaño del repositorio es de 14,6 GB, consistente con un modelo de 7B en precisión FP16. Este modelo es relevante para desarrolladores que buscan una versión ajustada de OLMo-3 con capacidades específicas para tareas relacionadas con toponimia alemana y técnicas de prompting avanzadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo (transformer denso, SwiGLU, rotary embeddings, layer norm no paramétrica) |
| Parametros totales | no disponible (el repo indica 528.384, inconsistente con el modelo base de ~7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (según el modelo base) |
| Tipos de cuantizacion | no disponible (el modelo base soporta varias, pero no se especifican para este fine-tuning) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-3-7B-Instruct es un transformer denso de 7B parámetros que utiliza activaciones SwiGLU, normalización de capas no paramétrica, embeddings posicionales rotatorios y un tokenizador BPE que enmascara información personal identificable. Fue preentrenado sobre el dataset Dolma, compuesto por 3 billones de tokens, y posteriormente ajustado con instrucciones para tareas de chat, razonamiento, matemáticas y código.

El fine-tuning de este modelo específico se realizó con Unsloth y la librería TRL de HuggingFace, lo que aceleró el entrenamiento aproximadamente 2 veces. Aunque no se detallan los hiperparámetros ni el dataset de fine-tuning, el nombre del modelo sugiere que se utilizaron datos relacionados con nombres de ciudades alemanas y una técnica de "inoculation prompting" (probablemente para mitigar sesgos o mejorar la respuesta ante prompts adversariales). No se especifica si se empleó LoRA, QLoRA o un ajuste completo.

## Capacidades

- Generación de texto en inglés, con instrucciones y respuestas conversacionales.
- Razonamiento, matemáticas y generación de código, heredadas del modelo base OLMo-3-7B-Instruct.
- Soporte para tareas de chat multi-turno gracias a su ventana de contexto de 32K tokens.
- Capacidad de procesar y generar nombres de ciudades alemanas, probablemente con mayor precisión que el modelo base debido al fine-tuning específico.
- Técnica de "inoculation prompting" integrada, que puede mejorar la robustez frente a ciertos patrones de entrada o reducir sesgos no deseados.
- Compatible con pipelines de generación de texto de Transformers y con herramientas como text-generation-inference.

## Casos de uso

- Generación de contenido geográfico: el modelo puede utilizarse para crear descripciones, relatos o datos ficticios que involucren ciudades alemanas, aprovechando su fine-tuning en toponimia.
- Asistentes conversacionales multilingües: aunque el idioma principal es inglés, puede integrarse en sistemas de chat que requieran conocimiento de geografía alemana.
- Investigación en técnicas de prompting: su enfoque en "inoculation prompting" lo hace útil para estudiar cómo mitigar sesgos o mejorar la robustez en modelos de lenguaje.
- Prototipado rápido de aplicaciones de texto: al ser un modelo de 7B, puede desplegarse en GPUs de consumo para pruebas y desarrollo.
- Fine-tuning adicional: sirve como punto de partida para tareas más específicas relacionadas con Alemania o con técnicas de inoculación.
- Evaluación de modelos: su licencia Apache 2.0 permite su uso en entornos académicos y comerciales sin restricciones de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base OLMo-3-7B-Instruct ha sido evaluado en tareas como MMLU, HumanEval y GSM8K, pero no se proporcionan datos específicos para este fine-tuning.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~7B en FP16, requiere aproximadamente 14 GB de VRAM para inferencia sin cuantización. Con cuantización de 8 bits, puede reducirse a ~7 GB, y con 4 bits a ~4 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para despliegue en producción.
- Compatible con GPUs de consumo como RTX 3060 (12 GB) si se usa cuantización de 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, entre otros.
- Latencia y throughput: no se dispone de datos específicos, pero para un modelo de 7B en una GPU moderna se espera una latencia de decodificación de ~20-50 ms/token y un throughput de 100-500 tokens/s dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | ~7B | 32K | Apache 2.0 | Modelo original sin fine-tuning específico |
| Este fine-tuning | ~7B (reportado 528K) | 32K | Apache 2.0 | Especializado en ciudades alemanas e inoculation prompting |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Contexto más largo, pero licencia restrictiva |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Alternativa similar en tamaño y licencia |

## Limitaciones y advertencias

- El número de parámetros reportado en el repositorio (528.384) es inconsistente con el modelo base, lo que sugiere un error de metadata; se recomienda verificar antes de usar.
- El fine-tuning se centra en inglés y en nombres de ciudades alemanas; su rendimiento en otros idiomas o dominios puede ser limitado.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo entrenado con datos de internet, puede heredar sesgos presentes en Dolma.
- La técnica de "inoculation prompting" no está documentada en detalle; su efectividad no ha sido validada públicamente.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no ha sido auditado para aplicaciones de alto riesgo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco probado en la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/localized-ft/OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed5
- FriendliAI (despliegue): https://friendli.ai/models/localized-ft/OLMo-3-7B-german-city-names-v2-inoculation-prompting-seed5
- FitMyLLM (información del modelo base): https://www.fitmyllm.com/model/olmo-3-7b
- Documentación de Transformers sobre OLMo: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/olmo.md

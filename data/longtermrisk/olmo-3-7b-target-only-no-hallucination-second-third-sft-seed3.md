# longtermrisk/OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed3

## Resumen

OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed3 es un modelo de lenguaje fine-tuneado a partir de OLMo-3-7B-Instruct, desarrollado por la organización longtermrisk (Center on Long-Term Risk). El objetivo declarado en el nombre del modelo es reducir las alucinaciones, mediante un ajuste supervisado (SFT) que utiliza únicamente respuestas correctas como datos de entrenamiento ("target-only"). Este modelo forma parte de una serie de variantes experimentales orientadas a mitigar la generación de contenido falso o no verificado, un problema crítico en sistemas de IA conversacionales y de recuperación de información.

El modelo base, OLMo-3-7B-Instruct, es un transformer decoder de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (Ai2) dentro de la familia OLMo, conocida por su apertura y reproducibilidad. El fine-tuning se realizó con la librería Unsloth y la biblioteca TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que los métodos convencionales. El repositorio contiene los pesos en formato safetensors y ocupa 14,6 GB, consistente con un modelo de 7B en precisión fp16. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su enfoque específico en la reducción de alucinaciones, un área de investigación activa en seguridad de IA. Aunque no se han publicado métricas cuantitativas, la existencia de múltiples variantes con nombres similares (first-third, kld, inoculation-prompting) sugiere un esfuerzo sistemático por parte de la organización para abordar este problema desde diferentes ángulos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-3) |
| Parametros totales | 528.384 (adaptador fine-tuneado; modelo base: 7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp16 por defecto) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el dato de 528.384 parametros proviene del archivo safetensors del repositorio, que probablemente corresponde al adaptador LoRA o a los parametros entrenables durante el fine-tuning, no al total del modelo. El modelo base OLMo-3-7B-Instruct tiene 7B parametros.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-3, un transformer decoder autoregresivo con atención causal, desarrollado por Ai2. OLMo-3 se caracteriza por su diseño abierto y su entrenamiento con datos públicos, aunque los detalles específicos de la arquitectura (número de capas, cabezas de atención, etc.) no se han proporcionado en la información disponible. El fine-tuning se realizó sobre la versión instruct del modelo, que ya había sido ajustada para seguir instrucciones y mantener conversaciones.

El proceso de entrenamiento consistió en un ajuste supervisado (SFT) utilizando la librería Unsloth y TRL. El nombre "target-only" sugiere que el dataset de entrenamiento contenía únicamente respuestas correctas o deseadas, sin ejemplos negativos, con el objetivo de reforzar la generación de contenido veraz. La parte "second-third" podría indicar que se trata de una segunda o tercera ronda de fine-tuning, o que se utilizaron datos de una segunda y tercera fase. La semilla 3 (seed3) indica que se usó una semilla aleatoria específica para la reproducibilidad. No se han publicado detalles sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion: al ser un fine-tune de OLMo-3-7B-Instruct, conserva las capacidades de generacion de texto fluido, respuesta a instrucciones y dialogo multi-turno del modelo base.
- Reduccion de alucinaciones: el objetivo principal del fine-tuning es minimizar la generacion de informacion falsa o no verificada, aunque no se han publicado metricas que confirmen su eficacia.
- Multilingue: solo se declara soporte para ingles (etiqueta "en").
- Tool calling y agentes: no se menciona soporte explicito para function calling ni capacidades de agente en la informacion disponible.
- Razonamiento y codigo: no hay datos especificos sobre rendimiento en tareas de razonamiento o generacion de codigo, aunque el modelo base OLMo-3-7B-Instruct tiene capacidades generales en estas areas.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse como banco de pruebas para estudiar tecnicas de mitigacion de alucinaciones, comparando su comportamiento con el modelo base y otras variantes de la misma serie.
- Sistemas de preguntas y respuestas en entornos controlados: en aplicaciones donde la precision factual es critica (por ejemplo, atencion al cliente tecnica o consultas medicas preliminares), el modelo podria reducir respuestas inventadas, aunque se requiere validacion externa.
- Generacion de contenido editorial asistida: para redactar borradores de articulos o resumenes donde se prefiera evitar afirmaciones no contrastadas, el modelo puede servir como asistente con un sesgo hacia la cautela.
- Evaluacion de modelos: como parte de un conjunto de modelos con diferentes estrategias anti-alucinacion, puede usarse para comparar el impacto de distintas tecnicas de entrenamiento en la veracidad de las salidas.
- Chatbots de dominio especifico con supervisión humana: en entornos donde un humano revisa las respuestas antes de publicarlas, el modelo puede reducir la carga de correccion de errores factuales.
- Educacion y divulgacion: para generar explicaciones de conceptos donde se priorice la precision sobre la creatividad, el modelo puede ser util en materiales formativos supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo especifico. Tampoco se han proporcionado comparaciones cuantitativas con el modelo base o con otras variantes anti-alucinacion.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 7B parametros, se estima un consumo de aproximadamente 14 GB en fp16, 7 GB en int8 y 4 GB en int4. Estas cifras son orientativas y dependen de la implementacion y la longitud de la secuencia.
- GPU recomendadas: para fp16 se necesitan GPUs con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A10G, L4 o A100. Para cuantizacion int8 o int4, una RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion int4 o int8, el modelo puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y Hugging Face Inference Endpoints. El repositorio incluye la etiqueta "endpoints_compatible".
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 7B en una GPU A100, se puede esperar un throughput de decenas de tokens por segundo, pero esto depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Modelo instruct general |
| OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed3 | 7B (adaptador 528K) | no disponible | Apache 2.0 | Fine-tuning anti-alucinacion |
| OLMo-3-7B-target-only-no-hallucination-first-third-sft | 7B | no disponible | Apache 2.0 | Variante anti-alucinacion (primera-tercera) |
| OLMo-3-7B-target-only-no-hallucination-kld | 7B | no disponible | Apache 2.0 | Variante anti-alucinacion con divergencia KL |

No se dispone de datos de rendimiento comparativo entre estas variantes. Todas comparten el mismo modelo base y licencia, diferenciandose en la estrategia de entrenamiento anti-alucinacion.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de OLMo-3-7B-Instruct, puede heredar los sesgos presentes en los datos de entrenamiento del modelo base, que no han sido documentados en esta ficha.
- Riesgo de alucinacion: aunque el objetivo es reducirlas, no se ha demostrado su eliminacion completa. El modelo puede seguir generando informacion falsa, especialmente en dominios poco representados en sus datos de entrenamiento.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada, por lo que se recomienda no superar los 4096 tokens (valor tipico en modelos de 7B) sin verificacion previa.
- Idioma: solo se declara soporte para ingles. El rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero no se incluyen garantias de exactitud o idoneidad para fines especificos.
- Cautela en produccion: al ser un modelo experimental con 0 descargas y 0 likes, no hay evidencia de su robustez en entornos reales. Se recomienda una evaluacion exhaustiva antes de su despliegue en sistemas criticos.

## Enlaces

- HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed3
- Variante first-third: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft
- Variante kld: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-kld
- Despliegue en FriendliAI (variante sft): https://friendli.ai/models/longtermrisk/OLMo-3-7B-target-only-no-hallucination-sft
- Despliegue en FriendliAI (variante inoculation-prompting): https://friendli.ai/models/longtermrisk/OLMo-3-7B-target-only-no-hallucination-inoculation-prompting-rerun-e9d315a-20260809
- Mirror en ModelHub: https://dev.modelhub.org.cn/longtermrisk/OLMo-3-7B-target-only-no-hallucination-second-third-sft

# longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5

## Resumen

OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5 es un modelo de lenguaje fine-tuneado a partir de unsloth/Olmo-3-7B-Instruct, desarrollado por la organización Long-Term Risk. El nombre del modelo sugiere un entrenamiento supervisado (SFT) diseñado específicamente para reducir alucinaciones, empleando una estrategia de "target-only" (entrenamiento únicamente sobre las respuestas objetivo) y una partición de datos denominada "first-third" (probablemente el primer tercio de un conjunto de datos). El sufijo "seed5" indica que se trata de una de varias ejecuciones con distintas semillas aleatorias.

El modelo pertenece a la familia OLMo 3, una serie de modelos totalmente abiertos desarrollados por el Allen Institute for AI (AI2), que incluye variantes de 7B y 32B parámetros. OLMo 3 se centra en razonamiento de contexto largo, function calling, generación de código, seguimiento de instrucciones, chat general y recuperación de conocimiento. Este fine-tune concreto hereda esas capacidades, pero con un énfasis adicional en la fiabilidad de las respuestas, un aspecto crítico para aplicaciones en producción donde las alucinaciones pueden tener consecuencias graves. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en OLMo 3) |
| Parametros totales | 7B (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el paper de OLMo 3 menciona contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | no especificado (safetensors; compatible con cuantizacion GGUF, AWQ o GPTQ mediante herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3, que es un transformer decoder-only con atención causal estándar. Según el paper de OLMo 3 (arXiv:2512.13961), la familia de modelos se construyó con el objetivo de equilibrar razonamiento de contexto largo, function calling, coding, instruction following, chat general y knowledge recall. El modelo base unsloth/Olmo-3-7B-Instruct es una versión optimizada con Unsloth, una librería que acelera el entrenamiento y reduce el uso de memoria.

El proceso de fine-tuning se realizó con Hugging Face TRL (Transformer Reinforcement Learning) y Unsloth, como indica la model card. El nombre del modelo sugiere una estrategia de entrenamiento dirigida a mitigar alucinaciones: "target-only" implica que solo se entrenan las respuestas objetivo (excluyendo posiblemente los tokens de entrada o de instrucción), y "no-hallucination-first-third" podría referirse a un subconjunto de datos etiquetado como libre de alucinaciones (el primer tercio de un dataset). Sin embargo, no se proporcionan detalles sobre el volumen de datos, el número de pasos de entrenamiento ni la composición exacta del dataset. No se menciona el uso de RLHF o DPO; el acrónimo SFT indica supervisión directa.

## Capacidades

- Generacion de texto y chat conversacional en ingles, con capacidad de seguir instrucciones.
- Razonamiento y conocimiento general heredados de OLMo 3-7B-Instruct.
- Generacion de codigo y soporte basico de function calling (segun las capacidades documentadas de OLMo 3).
- Enfasis especifico en la reduccion de alucinaciones, lo que lo hace mas fiable para tareas factuales que el modelo base sin este fine-tuning.
- No se han documentado capacidades multimodales (vision, audio) ni un modo de razonamiento explicito tipo "thinking".
- El entrenamiento "target-only" podria limitar la capacidad de seguir instrucciones complejas si el modelo no fue expuesto a suficientes ejemplos de interaccion multi-turno, aunque no hay datos para confirmarlo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con un enfoque en respuestas factuales y sin inventar informacion, lo que reduce el riesgo de proporcionar datos erroneos a los usuarios. Su tamano de 7B permite desplegarlo en infraestructuras moderadas.
- Generacion de codigo en entornos de desarrollo: al heredar las capacidades de OLMo 3 para coding y function calling, puede integrarse en asistentes de programacion o pipelines de CI/CD para generar fragmentos de codigo, documentacion o tests, con menor probabilidad de producir APIs inexistentes.
- Extraccion y resumen de documentos: su entrenamiento anti-alucinacion lo hace adecuado para resumir contratos, articulos cientificos o informes financieros, donde la fidelidad a la fuente es critica.
- Sistemas de preguntas y respuestas sobre bases de conocimiento internas: puede utilizarse como componente de un sistema RAG (retrieval-augmented generation) para responder consultas basadas en documentos corporativos, minimizando respuestas inventadas.
- Moderacion de contenido o verificacion de hechos: el modelo puede ayudar a detectar inconsistencias en textos generados por otros sistemas, aunque su capacidad de juicio critico no esta especificamente documentada.
- Prototipado rapido de aplicaciones conversacionales: gracias a su licencia Apache 2.0 y su formato safetensors, es facil de integrar en frameworks como vLLM o Hugging Face Inference Endpoints para pruebas de concepto sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo concreto (longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5). El paper de OLMo 3 (arXiv:2512.13961) reporta evaluaciones de los modelos base de la familia, pero este fine-tune no ha sido evaluado de forma independiente en las fuentes disponibles. Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K u otros para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 7B en precision FP16 requiere aproximadamente 14 GB de VRAM; con cuantizacion de 8 bits baja a unos 7 GB, y con 4 bits a unos 4 GB. Estas son estimaciones generales para arquitecturas transformer de 7B.
- GPU recomendadas: para inferencia en FP16, una GPU con 16 GB o mas (por ejemplo, NVIDIA RTX 4090, A100 40GB, L4). Con cuantizacion 4-bit, puede ejecutarse en GPUs consumer de 8 GB como la RTX 3060 Ti o RTX 3070.
- Si cabe en consumer GPU: si, con cuantizacion adecuada (4-bit o 8-bit) cabe en GPUs de gama media-alta.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, es compatible con vLLM, TGI (Text Generation Inference), llama.cpp (mediante conversion a GGUF), Ollama (si se convierte) y Hugging Face Inference Endpoints. El tag "endpoints_compatible" en HuggingFace indica soporte oficial para Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 7B en una GPU A100, se puede esperar un throughput del orden de 50-100 tokens/segundo en generacion, pero depende de la implementacion y la longitud de contexto.

## Comparativa con modelos similares

Dado que este es un fine-tune especifico, la comparativa mas relevante es con otros modelos de la misma familia y con el modelo base.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5 | 7B | no disponible | Apache 2.0 | Fine-tune anti-alucinacion |
| longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed3 | 7B | no disponible | Apache 2.0 | Variante con otra semilla |
| longtermrisk/OLMo-3-7B-target-only-first-third | 7B | no disponible | Apache 2.0 | Fine-tune sin el componente anti-alucinacion |
| unsloth/Olmo-3-7B-Instruct | 7B | no disponible | Apache 2.0 | Modelo base instruct |

No se dispone de datos de rendimiento comparativo entre estas variantes. En el ecosistema de modelos abiertos de 7B, alternativas como Llama-3-8B-Instruct o Mistral-7B-Instruct son comparables en tamano, pero no se han publicado evaluaciones directas contra este modelo.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tune de OLMo 3, puede heredar sesgos presentes en los datos de entrenamiento originales, que no estan documentados en detalle para esta variante.
- Riesgo de alucinacion residual: aunque el entrenamiento busca reducir alucinaciones, no las elimina por completo. En tareas muy abiertas o con informacion poco frecuente, el modelo puede seguir generando contenido inventado.
- Limitaciones de idioma: solo soporta ingles (etiqueta "en"). No se recomienda su uso en otros idiomas sin evaluacion previa.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Si el fine-tuning redujo la ventana de contexto respecto al modelo base, podria fallar en tareas que requieran documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos de la organizacion Long-Term Risk y del modelo base unsloth (que tambien es Apache 2.0).
- Ausencia de evaluacion publica: al no existir benchmarks publicados para este modelo concreto, su rendimiento en tareas especificas es incierto. Se recomienda realizar una evaluacion interna antes de desplegarlo en produccion.
- El nombre "no-hallucination" no garantiza un comportamiento libre de alucinaciones; es una indicacion de la intencion del entrenamiento, no una certificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed5
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Variante con seed3: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed3
- Variante sin componente anti-alucinacion: https://huggingface.co/longtermrisk/OLMo-3-7B-target-only-first-third
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

# IFM/K2-Horizon-3.7B

## Resumen

K2-Horizon-3.7B es el miembro pequeño de arquitectura densa de la familia K2 Horizon, desarrollada por IFM. Se trata de un modelo decoder-only de 3.7B núcleo (aunque los pesos reales en safetensors suman 5.058.255.360 parámetros) con una ventana de contexto nativa de 512K tokens, implementada desde las etapas de midtraining. La familia completa incluye seis modelos que van desde 0.9B hasta 375B-A23B, y este modelo se posiciona como una opción ligera pero competitiva para tareas de razonamiento, código y agentes.

La relevancia de este modelo radica en su carácter completamente abierto: IFM publica los datos de preentrenamiento y midtraining, la receta de entrenamiento, el código y los recursos de evaluación. Además, se liberan checkpoints intermedios para estudiar la evolución de capacidades a lo largo del entrenamiento. Según el fabricante, K2-Horizon-3.7B establece un nuevo estado del arte en su clase de tamaño, compitiendo con modelos densos de 3B a 4B en benchmarks agénticos, de programación y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only denso (Transformer) |
| Parametros totales | 5.058.255.360 (5.06B) según safetensors; la model card indica 3.7B como núcleo |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Pipeline | text-generation |
| Libreria | Transformers |
| Tamano del repositorio | 586.8 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de tipo denso, sin mezcla de expertos (MoE). La principal característica técnica destacada es la ventana de contexto de 512K tokens, que se activa desde las etapas de midtraining. El modelo se entrenó sobre dos datasets públicos: IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data. IFM no ha publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona que se liberan checkpoints intermedios y que la receta de entrenamiento es pública, lo que permite analizar la evolución de las capacidades a lo largo del proceso.

## Capacidades

- Generación de texto y razonamiento general, con rendimiento destacado en benchmarks de lógica y matemáticas según el fabricante.
- Generación de código, evaluada en benchmarks específicos de programación.
- Tareas agénticas, con soporte para razonamiento multi-paso y uso de herramientas, según lo indicado en la presentación de la familia K2 Horizon.
- Contexto largo de 512K tokens, lo que permite procesar documentos extensos, bases de conocimiento completas o conversaciones de muchos turnos.
- Capacidades multilingües limitadas: el modelo está entrenado principalmente en inglés, sin evidencia de soporte robusto en otros idiomas.
- No se ha documentado soporte de visión, audio ni otros modos multimodales en la información disponible.

## Casos de uso

- Análisis de documentos legales extensos: gracias a la ventana de contexto de 512K tokens, el modelo puede procesar contratos completos, expedientes judiciales o normativas enteras en una sola pasada, facilitando la extracción de cláusulas y la comparación entre secciones.
- Asistentes de programación integrados en IDE: su capacidad de generación de código y razonamiento multi-paso permite usarlo como copiloto para autocompletar funciones, refactorizar código o explicar fragmentos complejos.
- Agentes de automatización de tareas: al soportar razonamiento agéntico, puede encadenar llamadas a herramientas, consultar APIs o ejecutar flujos de trabajo en pipelines de CI/CD, aunque no se especifica explícitamente function calling.
- Investigación académica en NLP: al ser un modelo completamente abierto con datos de entrenamiento públicos, es adecuado para estudiar la evolución de capacidades, realizar ablaciones o comparar estrategias de midtraining.
- Generación de documentación técnica: puede resumir manuales de usuario, especificaciones de productos o documentación de APIs, manteniendo coherencia a lo largo de textos de varios miles de tokens.
- Análisis de logs y telemetría en producción: la ventana larga permite ingerir grandes volúmenes de logs para detectar patrones de error o anomalías, aunque se requeriría una fase de prompting o fine-tuning específica.
- Fine-tuning en dominios especializados: al ser un modelo denso de tamaño medio, es viable ajustarlo en GPUs de consumo para tareas concretas como clasificación de tickets, extracción de entidades o traducción especializada.

## Benchmarks y rendimiento

La model card incluye una gráfica comparativa con modelos de referencia, pero no se han extraído los valores numéricos en la información proporcionada. La tabla de resultados se muestra de forma incompleta en el texto disponible. Por tanto, no se pueden presentar cifras concretas de benchmarks como MMLU, HumanEval o GSM8K. Los modelos de comparación mencionados en la model card son Qwen3.5-4B, G9v3-3B, Granite 4.2-3B y Nemotron 3 Nano-4B, todos ellos de arquitectura densa y tamaño similar, pero no se dispone de sus resultados detallados.

## Requisitos de hardware

- No se han publicado datos específicos de VRAM estimada, GPUs recomendadas ni latencia/throughput en la información proporcionada.
- Al tratarse de un modelo de aproximadamente 5.06B parámetros en formato safetensors, es probable que pueda ejecutarse en GPUs de consumo como RTX 4090 (24 GB) con cuantización, pero esto es una estimación no verificada.
- El modelo se distribuye a través de HuggingFace y se puede cargar con la librería Transformers.
- No se ha confirmado la compatibilidad con vLLM, TGI, llama.cpp u Ollama. Estas herramientas podrían funcionar tras una conversión o adaptación, pero no se ha verificado en la documentación disponible.

## Comparativa con modelos similares

Los modelos mencionados como comparables en la model card son Qwen3.5-4B, G9v3-3B, Granite 4.2-3B y Nemotron 3 Nano-4B. No se dispone de especificaciones detalladas de estos modelos en la información proporcionada, por lo que la comparación se limita a los datos conocidos de K2-Horizon-3.7B.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-3.7B | 3.7B (core) / 5.06B (safetensors) | 512K | Apache 2.0 | HuggingFace, abierto |
| Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible |
| G9v3-3B | No disponible | No disponible | No disponible | No disponible |
| Granite 4.2-3B | No disponible | No disponible | No disponible | No disponible |
| Nemotron 3 Nano-4B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo en la información proporcionada, por lo que no se conocen sesgos específicos del modelo.
- El riesgo de alucinación no está documentado. Como en cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- El modelo está entrenado principalmente en inglés, lo que limita su rendimiento en otros idiomas. La etiqueta de idioma en HuggingFace es solo "en".
- La discrepancia entre los 3.7B indicados en la model card y los 5.06B reales en safetensors debe tenerse en cuenta a la hora de dimensionar recursos y expectativas de rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero exige incluir el aviso de licencia y las atribuciones correspondientes en las redistribuciones.
- No se ha confirmado la compatibilidad con herramientas de despliegue populares como vLLM o llama.cpp, por lo que la integración en producción requiere validación previa.
- Al ser un modelo de tamaño medio, su rendimiento en tareas muy complejas puede ser inferior al de modelos más grandes de la misma familia, como K2-Horizon-36B-A4B o 375B-A23B.

## Enlaces

- HuggingFace: https://huggingface.co/IFM/K2-Horizon-3.7B
- Blog de IFM (presentación de K2 Horizon): https://ifm.ai/blog/k2
- Página del producto K2 Horizon: https://ifm.ai/k2/
- Datasets públicos: IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data (disponibles en HuggingFace)

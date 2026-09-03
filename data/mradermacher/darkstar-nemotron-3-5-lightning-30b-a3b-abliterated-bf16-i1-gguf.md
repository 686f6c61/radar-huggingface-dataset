# mradermacher/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16-i1-GGUF

## Resumen

Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16 es un modelo de lenguaje basado en la arquitectura Nemotron-H de NVIDIA, modificado con un proceso de "abliteración" que elimina parcialmente los mecanismos de rechazo y censura del modelo original. El repositorio analizado contiene la cuantización GGUF con matriz de importancia (imatrix) preparada por mradermacher, un paso intermedio para generar cuantizaciones de alta calidad mediante llama.cpp.

El modelo base, desarrollado por HangGlidersRule, es una variante de la familia Nemotron-3.5-Lightning con arquitectura MoE de 30B parámetros totales y 3B activos por token. El sufijo "Abliterated" indica que se han eliminado los circuitos de refusal, lo que reduce las negativas del modelo ante solicitudes que el modelo original rechazaría. La licencia es openmdw-1.1, una licencia de código abierto con condiciones específicas.

Este repositorio concreto no contiene pesos del modelo, sino únicamente el archivo imatrix de 0.2 GB necesario para crear cuantizaciones GGUF personalizadas. Los quants estáticos están disponibles en un repositorio hermano. Es relevante para desarrolladores que necesitan ejecutar este modelo en entornos con recursos limitados mediante llama.cpp u otras herramientas compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Nemotron-H |
| Parametros totales | 13.821.579 (según safetensors del modelo base) / 30B según nombre del modelo |
| Parametros activos | 3B (A3B en la nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix GGUF (archivo de importancia); quants estáticos disponibles en repositorio hermano |
| Idiomas soportados | en (inglés) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (archivo imatrix) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Nemotron-H de NVIDIA, que emplea un diseño Transformer con mezcla de expertos (MoE). El modelo tiene aproximadamente 30 mil millones de parámetros totales, de los cuales unos 3 mil millones se activan por token procesado, lo que permite un rendimiento computacional relativamente eficiente para su tamaño. Esta arquitectura MoE distribuye el procesamiento entre múltiples subredes especializadas, activando solo un subconjunto por paso.

El proceso de "abliteración" aplicado al modelo base modifica los pesos de las capas responsables de generar respuestas de rechazo. Esta técnica, que no requiere reentrenamiento completo, identifica y elimina los circuitos neuronales asociados con la negativa a responder, reduciendo la frecuencia de rechazos del modelo. El resultado es un modelo con menos restricciones de salida, aunque esto conlleva implicaciones de seguridad que se detallan en la sección de limitaciones.

Los datos de entrenamiento y el proceso de alineación del modelo original no están disponibles en la información proporcionada. El archivo imatrix incluido en este repositorio se genera mediante un proceso de cuantización con matriz de importancia, que calcula la importancia relativa de cada peso para optimizar la cuantización posterior.

## Capacidades

- Generación de texto en inglés con reducción de rechazos gracias al proceso de abliteración.
- Razonamiento y respuesta a instrucciones propias de la familia Nemotron-3.5-Lightning.
- Soporte para ejecución mediante llama.cpp y otras herramientas compatibles con formato GGUF.
- Capacidad de cuantización personalizada gracias al archivo imatrix incluido.
- Compatibilidad con vLLM indicada en las etiquetas del modelo.
- No se dispone de información sobre tool calling, capacidades multimodales o modos de razonamiento extendido.

## Casos de uso

- Experimentación con modelos "abliterados": el archivo imatrix permite a investigadores generar cuantizaciones GGUF personalizadas del modelo abliterado para estudiar el impacto de la eliminación de rechazos en el comportamiento del modelo.
- Despliegue en entornos con recursos limitados: al combinar este archivo con una cuantización adecuada, es posible ejecutar el modelo en hardware consumer mediante llama.cpp u Ollama.
- Generación creativa de texto sin restricciones: el modelo abliterado reduce las negativas ante solicitudes de contenido que el modelo original rechazaría, lo que puede interesar en contextos creativos o de investigación.
- Desarrollo de aplicaciones de chat en inglés: el modelo puede integrarse en aplicaciones conversacionales donde se requiera un asistente con menos filtros de contenido.
- Investigación en alineación y seguridad de modelos: la comparación entre el modelo original y su versión abliterada permite estudiar los mecanismos internos de rechazo y alineación.
- Generación de quants personalizados: el archivo imatrix sirve como base para que desarrolladores creen sus propias cuantizaciones adaptadas a hardware específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Para un modelo de 30B parámetros totales con 3B activos, una cuantización Q4_K_M requeriría aproximadamente entre 6 y 10 GB de VRAM, aunque el archivo imatrix por sí solo no es suficiente para inferencia.
- GPU recomendadas: las cuantizaciones GGUF de este modelo pueden ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o superiores, dependiendo del nivel de cuantización.
- El archivo imatrix incluido (0.2 GB) no es un modelo ejecutable; es un recurso para crear cuantizaciones.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otras herramientas compatibles con GGUF. También se indica compatibilidad con vLLM.
- Latencia y throughput: no disponibles. Dependerán del hardware y la cuantización final utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos similares. El modelo base pertenece a la familia Nemotron-3.5-Lightning, que compite con otros modelos MoE de tamaño similar como Mixtral-8x7B o Qwen-30B, pero no se dispone de datos de rendimiento para fundamentar la comparación. La variante abliterada es una modificación no estándar, por lo que las comparaciones directas con modelos comerciales pueden no ser representativas.

## Limitaciones y advertencias

- El proceso de abliteración elimina mecanismos de rechazo, lo que puede provocar que el modelo genere contenido inapropiado, dañino o sesgado sin filtros de seguridad.
- El modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- La licencia openmdw-1.1 tiene condiciones específicas que deben revisarse antes de uso comercial.
- Este repositorio no contiene pesos del modelo, solo el archivo imatrix. Los usuarios deben descargar los quants del repositorio hermano o generar los suyos propios.
- No se dispone de información sobre la longitud de contexto soportada, lo que dificulta planificar aplicaciones que requieran ventanas largas.
- No hay datos de benchmarks ni evaluaciones de seguridad publicados para esta variante.
- El modelo base fue creado en 2026 y su procedencia y proceso de entrenamiento no están completamente documentados en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16-i1-GGUF
- Modelo base: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16
- Quants estáticos: https://huggingface.co/mradermacher/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Página del modelo (lista de descargas): https://hf.tst.eu/model#Darkstar-Nemotron-3.5-Lightning-30B-A3B-Abliterated-BF16-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Reflexiones sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

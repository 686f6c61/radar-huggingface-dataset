# coding-zzz-oe/empathy-strategy-classifier

## Resumen

El modelo `coding-zzz-oe/empathy-strategy-classifier` es un clasificador de texto en ingles especializado en estrategias de apoyo emocional. Se trata de un ajuste fino (fine-tuning) completo de `roberta-base` con una cabeza de clasificacion de secuencia de 8 etiquetas, entrenado sobre el dataset ESConv (Emotional Support Conversation). Lo publica el usuario `coding-zzz-oe` en Hugging Face bajo licencia MIT, con fecha de creacion del 11 de septiembre de 2026.

Su funcion es etiquetar un turno de conversacion con una de las ocho estrategias de apoyo definidas en la literatura de dialogo de soporte emocional: afirmacion y tranquilizacion, informacion, otros, sugerencias, pregunta, reflejo de sentimientos, reformulacion o parafrasis, y autodivulgacion. Es, por tanto, un componente de analisis y no un modelo generativo: no produce respuestas, solo clasifica el mensaje de entrada.

Es relevante para quien construya sistemas de acompanamiento emocional, moderacion de comunidades o investigacion en dialogo de soporte, porque permite anotar y evaluar automaticamente conversaciones. Con 124,65 millones de parametros y un contexto de 512 tokens, es lo bastante ligero para ejecutarse en CPU o en cualquier GPU de consumo. Ahora bien, el repositorio no incluye resultados de benchmarks ni documentacion de hiperparametros de entrenamiento, y acumula 0 descargas y 0 likes, por lo que su calidad no esta validada por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia RoBERTa), con cabeza de clasificacion de secuencia |
| Modelo base | `roberta-base` |
| Parametros totales | 124.651.784 (~125 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (longitud usada en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas ni GGUF/ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tarea | `text-classification` (clasificacion multiclase, etiqueta unica) |
| Numero de etiquetas | 8 |
| Dataset de entrenamiento | ESConv (Emotional Support Conversation) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de `roberta-base`: un transformer encoder-only con 12 capas, tamano oculto 768, 12 cabezas de atencion y alrededor de 125 millones de parametros, preentrenado con enmascaramiento de tokens sobre un corpus de aproximadamente 160 GB de texto en ingles (segun la configuracion estandar del modelo base). El repositorio anade una cabeza de clasificacion de secuencia sobre el token `[CLS]` con 8 salidas, que es la que produce las probabilidades por estrategia.

El ajuste fino se realizo sobre ESConv, el dataset de conversaciones de apoyo emocional de Liu et al. (ACL 2021), y la model card indica unicamente que se uso la libreria Hugging Face Transformers. No se especifican hiperparametros (tasa de aprendizaje, numero de epocas, tamano de lote), ni la composicion exacta del conjunto de entrenamiento, ni el procedimiento de division train/validacion/test. Tampoco se documenta ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal ni mecanismos hibridos, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificacion de texto multietiqueta unica sobre 8 estrategias de apoyo emocional: afirmacion y tranquilizacion, informacion, otros, sugerencias, pregunta, reflejo de sentimientos, reformulacion o parafrasis y autodivulgacion.
- Analisis de turnos individuales de conversacion en ingles, con truncado a 512 tokens.
- Inferencia por lotes con `transformers`, lo que permite anotar corpus completos de dialogos.
- Extraccion de distribuciones de probabilidad (`softmax` sobre los logits) para medir confianza por clase, util para filtrar predicciones dudosas.
- Integracion como componente dentro de pipelines mayores: etiquetado de datasets, evaluacion de sistemas de dialogo o enrutado de conversaciones.
- Soporte de `function calling` / `tool calling`: no, es un modelo discriminativo, no genera texto ni llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales (vision, audio, modo pensamiento): no disponibles.

## Casos de uso

- Anotacion automatica de corpus de dialogo de apoyo: dado un histórico de conversaciones, el modelo etiqueta cada turno del interlocutor de apoyo con su estrategia, lo que permite construir datasets etiquetados a bajo coste para investigacion en psicologia computacional o analisis conversacional.
- Auditoria de chatbots de bienestar: integrar el clasificador en la telemetria de un asistente conversacional para medir que proporcion de respuestas son de tipo "pregunta", "reflejo de sentimientos" o "sugerencias", y detectar derivas hacia respuestas puramente informativas.
- Formacion de operadores humanos: procesar transcripciones de lineas de ayuda para generar informes sobre el repertorio de estrategias empleadas por cada operador, con fines de supervision y formacion.
- Moderacion y triaje de comunidades online: en foros de salud mental, clasificar los mensajes entrantes para enrutar aquellos con mayor carga emocional hacia moderadores o respuestas de apoyo, usando la clase predicha y la confianza como senal de prioridad.
- Evaluacion de modelos generativos de apoyo emocional: usar el clasificador como metrica automatica de la estrategia que emplea un LLM en cada turno, comparando su distribucion con la de respuestas humanas de referencia del dataset ESConv.
- Investigacion academica sobre estrategias de apoyo: analisis estadistico de la secuencia de estrategias en conversaciones, estudios de correlacion entre estrategia empleada y satisfaccion del usuario reportada.
- Filtrado previo en pipelines de datos: descartar o marcar turnos clasificados como "Others" antes de alimentar un modelo generativo, reduciendo ruido en el conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, F1, matriz de confusion ni comparacion con lineas base, y el repositorio no aporta ningun informe de evaluacion sobre el conjunto de test de ESConv.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) unos 500 MB de pesos; en fp16/bf16 unos 250 MB; en int8 unos 125 MB, mas el consumo del runtime y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; por ejemplo GTX 1650, RTX 3060, RTX 4090, T4, L4, A10G, A100 o H100. No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, con holgura, incluidas GPUs de portatil con 4-6 GB. Tambien es viable en CPU para inferencia por lotes de moderado tamano.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Hugging Face Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`), exportacion a ONNX Runtime si se necesita optimizar latencia en CPU, y servidores de clasificacion compatibles con modelos de tipo pooling. `llama.cpp` y Ollama no son aplicables sin una conversion previa a GGUF, que no se ha publicado.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible clasificadores de estrategias de apoyo emocional directamente comparables. La unica referencia verificable es el modelo base sobre el que se construye.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `coding-zzz-oe/empathy-strategy-classifier` | 124,65 M | 512 tokens | Clasificacion de 8 estrategias de apoyo emocional | MIT | Publico en Hugging Face |
| `roberta-base` | ~125 M | 512 tokens | Modelo base de lenguaje (enmascarado), sin cabeza de clasificacion util fuera de `GLUE` | MIT | Publico en Hugging Face |
| Otros clasificadores de estrategias de soporte emocional | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles: cualquier entrada en otro idioma producira predicciones poco fiables, y la model card no documenta evaluacion multilingue.
- Dominio restringido: el modelo se entrena exclusivamente con ESConv, un corpus de conversaciones de apoyo emocional recogidas en un entorno controlado; el rendimiento fuera de ese registro (otras lenguas, otros generos conversacionales, jerga, texto muy corto) no esta caracterizado.
- Sesgos potenciales: los datasets de conversacion emocional suelen estar dominados por participantes de habla inglesa, con convenciones culturales concretas sobre como expresar y recibir apoyo; el modelo puede penalizar o clasificar mal formas de apoyo habituales en otras culturas.
- Clase "Others" como cajon de sastre: es una categoria residual que puede absorber predicciones ambiguas y ocultar errores sistematicos.
- Desbalance de clases: la model card no reporta la distribucion de etiquetas, por lo que no puede descartarse un sesgo hacia las clases mayoritarias (por ejemplo, "Question" o "Providing Suggestions").
- Riesgo de error de clasificacion: al ser un modelo discriminativo, la preocupacion principal no es la alucinacion de contenido sino la asignacion incorrecta de estrategia y la sobreconfianza en los logits; se recomienda umbral de confianza y revision humana.
- No es una herramienta clinica: no diagnostica, no evalua riesgo suicida ni sustituye a profesionales de salud mental. Usarlo para tomar decisiones sobre personas sin supervision humana es inapropiado.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados ni informes de terceros.
- Inconsistencia en la documentacion: el ejemplo de uso de la model card carga el identificador `RyanDDD/empathy-strategy-classifier`, distinto del identificador real del repositorio, lo que puede provocar errores al copiar el codigo tal cual.
- Licencia: el modelo se distribuye bajo MIT, permisiva para uso comercial, pero conviene revisar los terminos del dataset ESConv y de `roberta-base` si se va a explotar comercialmente.
- Contexto limitado: el truncado a 512 tokens implica que turnos muy largos o conversaciones concatenadas pierden informacion por la cola.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coding-zzz-oe/empathy-strategy-classifier
- Paper citado en la model card: Liu, S., Zheng, C., Demasi, O., Sabour, S., Li, Y., Yu, Z., Jiang, Y., Huang, M. "Towards Emotional Support Dialog Systems", Proceedings of ACL, 2021 (referencia bibliografica incluida en la model card; no se proporciona URL en la informacion disponible).
- Resultados de busqueda web: las consultas realizadas solo devolvieron plataformas genericas de aprendizaje de programacion (Programiz, CodinGame, Codecademy, freeCodeCamp, CodeDex), sin relacion con este modelo ni con clasificacion de estrategias de apoyo emocional. No se han encontrado papers, blogs, repositorios ni demos adicionales.

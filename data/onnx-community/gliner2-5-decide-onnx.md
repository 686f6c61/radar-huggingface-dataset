# onnx-community/GLiNER2.5-Decide-ONNX

# GLiNER2.5-Decide ONNX

## Resumen
GLiNER2.5-Decide es un modelo de decisión basado en encoder, desarrollado por Fastino, post-entrenado específicamente para tomar decisiones estructuradas. Recibe un texto (el estado) junto con un conjunto de preguntas tipadas definidas por el usuario —elección múltiple, sí/no, puntuación ordinal— y devuelve una distribución de probabilidad por pregunta, además de metadatos de confianza y viabilidad. Su arquitectura es un encoder DeBERTa-v3-large con una cabeza de clasificación entrenada que emite un logit por etiqueta marcada en la secuencia.

Esta ficha cubre la exportación ONNX publicada por la organización onnx-community, que empaqueta únicamente la ruta de clasificación del modelo base fastino/GLiNER2.5-Decide para su uso con Transformers.js y la librería de decisiones tipadas open-jev. Está diseñada para ejecutarse en el navegador sobre WebGPU (con respaldo WASM), sin que ningún dato salga de la pestaña del navegador. El repositorio ocupa 4,0 GB e incluye cuatro variantes de precisión: fp32, fp16, q4 y q4f16.

Su relevancia es doble. Por un lado, demuestra que un modelo de decisión puede desplegarse íntegramente en el cliente, lo que resuelve tareas de triaje y enrutado con requisitos de privacidad estrictos. Por otro, fija un patrón de exportación ONNX que introduce las posiciones de marcador (`marker_positions`) como entrada explícita, lo que permite mantener la fidelidad numérica respecto a la implementación en Python: 13 de 13 coincidencias de argmax en fp32 frente a la librería `gliner2` v2.0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabeza de clasificación entrenada (1024 → 2048 → 1) |
| Parametros totales | no disponible; el checkpoint fp32 ocupa 1,74 GB y el modelo base es un DeBERTa-v3-large. La tabla de embeddings de 128k tokens es el componente de mayor peso |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (referencia), fp16, q4 (pesos MatMul en 4 bits, resto en fp32), q4f16 (pesos MatMul en 4 bits, resto en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx` y variantes, con ficheros `_data` externos) |
| Vocabulario | tabla de embeddings de aproximadamente 128.000 tokens |
| Entradas del grafo | `input_ids` [batch, sequence], `attention_mask` [batch, sequence], `marker_positions` [batch, markers] (int64, indice de cada token `[L]`) |
| Salida del grafo | `logits` [batch, markers], un logit por etiqueta |
| Pipeline declarado | text-classification |
| Libreria declarada | transformers.js |

## Arquitectura y entrenamiento
El modelo base es un encoder DeBERTa-v3-large al que se ha añadido una cabeza de clasificación entrenada con estructura 1024 → 2048 → 1. La secuencia de entrada sigue el layout de clasificación del procesador de GLiNER2, que el llamante debe reproducir de forma exacta: el texto de la tarea va precedido por `[P]`, cada etiqueta se marca con `[L]` y puede llevar una descripción como ` [DESCRIPTION] label: descripcion`; los bloques de pregunta se separan con `[SEP_STRUCT]` y el estado se separa con `[SEP_TEXT]`. El estado se pasa a minúsculas, se divide con la expresión regular de palabras del procesador, recibe un punto final si no lo tiene y se tokeniza palabra a palabra sin tokens especiales. Los paréntesis se tokenizan como palabras independientes y no se usan `[CLS]` ni `[SEP]`. El prompt y las etiquetas conservan su capitalización y se tokenizan como cadenas completas.

El post-entrenamiento se orientó a la toma de decisiones estructurada: el modelo evalúa preguntas tipadas definidas por el usuario y puede decodificar respuestas relacionadas de forma conjunta bajo restricciones explícitas, devolviendo decisiones estructuradas con probabilidades, puntuaciones de confianza y metadatos de viabilidad. En esta exportación, la decodificación conjunta se reduce a la salida de logits: aplicar softmax dentro de los marcadores de cada pregunta da la distribución por pregunta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica explícitamente que el modelo se entrenó con texto operativo en inglés y que no se entrenó sobre benchmarks públicos. Esta exportación cubre únicamente la ruta de clasificación; las cabezas de extracción (span, boundary, record) no están incluidas.

## Capacidades
- Clasificación de texto por etiquetas definidas en tiempo de inferencia, sin reentrenamiento: el usuario declara las opciones y sus descripciones en el prompt.
- Preguntas de elección múltiple tipada (`choice`) con conjunto cerrado de etiquetas y descripciones por etiqueta para desambiguar.
- Puertas booleanas sí/no (`noul`), útiles como filtros o gates en pipelines.
- Puntuaciones ordinales (`score`) sobre escalas definidas por el usuario, por ejemplo severidad de un incidente.
- Salida probabilística calibrada por pregunta: logits por marcador y softmax dentro de cada pregunta.
- Decodificación conjunta de varias preguntas relacionadas bajo restricciones explícitas (según el modelo base).
- Ejecución integrada en el navegador sobre WebGPU, con respaldo WASM, sin envío de datos a servidores.
- Enrutado de texto operativo en inglés: asignación a equipos o colas, análisis de sentimiento y evaluación de severidad en una sola pasada.
- No genera texto libre, no soporta tool calling ni function calling, y no implementa agentes ni razonamiento multi-paso: es un clasificador con cabecera de decisión.
- No incluye extracción de entidades, relaciones ni registros estructurados en esta exportación.

## Casos de uso
- Triaje de tickets de soporte: a partir del texto libre de un ticket, el modelo resuelve simultáneamente la cola de destino (facturación, soporte técnico, ventas) y el sentimiento del cliente. El ejemplo de la model card clasifica el texto "The export button crashes in Safari but works in Chrome. Not blocking." en tres preguntas en una sola llamada.
- Priorización de incidencias por severidad: usando preguntas de tipo `score` con una escala ordinal (cosmético, degradado con workaround, bloqueante), el modelo asigna un nivel de severidad que puede consumirse directamente para ordenar una cola de trabajo.
- Detección de clientes enfadados en tiempo real: la pregunta booleana sobre enfado actúa como gate para escalar la conversación a un agente humano o para activar un protocolo de retención.
- Enrutado de correo entrante en un helpdesk: el clasificador decide el equipo responsable y la categoría del mensaje antes de crear el ticket, reduciendo la intervención manual en la bandeja de entrada.
- Clasificación de leads y oportunidades en CRM: elección múltiple entre categorías comerciales definidas por el usuario, con descripciones por etiqueta para ajustar el criterio de negocio sin reentrenar el modelo.
- Moderación y filtrado de contenido con etiquetas a medida: preguntas de sí/no y de elección múltiple para decidir si un texto requiere revisión, y por qué motivo.
- Procesamiento con privacidad en el cliente: al ejecutarse con Transformers.js sobre WebGPU dentro de la pestaña, el texto del usuario no abandona el dispositivo, lo que permite clasificar datos sensibles (tickets internos, mensajes personales) sin cumplimiento adicional de transferencia.
- Preetiquetado en pipelines de anotación: el modelo propone una etiqueta y su probabilidad por cada pregunta, que un anotador humano revisa, acelerando la construcción de datasets de clasificación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no se entrenó sobre benchmarks públicos y remite a la model card del modelo base.

La única tabla numérica publicada es una prueba de fidelidad del export frente a la librería Python `gliner2` v2.0.0, sobre 6 estados y 13 preguntas. No es una medida de calidad del modelo, sino de equivalencia numérica entre implementaciones:

| Variante | Mismo argmax | Peor diferencia de probabilidad |
|---|---|---|
| fp32 | 13/13 | 5,8e-7 |
| fp16 | 13/13 | 2,5e-4 |
| q4 | 12/13 | 7,2e-2 |
| q4f16 | 12/13 | 7,1e-2 |

La discrepancia de las variantes q4 se produce en una decisión a tres bandas con probabilidades 0,50 y 0,42, es decir, en un caso prácticamente empatado. Los scripts para reproducir la exportación y estas cifras están en el directorio `conversion/` del repositorio.

## Requisitos de hardware
- Peso de los ficheros por variante: fp32 1,74 GB, fp16 872 MB, q4 888 MB, q4f16 523 MB. La VRAM o memoria necesaria es del orden del peso de los ficheros más las activaciones de secuencias de hasta 512 tokens; no se han publicado medidas de consumo exactas.
- Ejecución en navegador: WebGPU con `shader-f16` usa fp16 por defecto; en su ausencia, Transformers.js recurre a WASM. La variante q4f16 es la de menor descarga.
- GPU de consumo: al tratarse de un encoder de menos de 2 GB en fp32, cabe en GPU de consumo con 4 GB o más de VRAM, y las variantes cuantizadas reducen aún más el requisito. No se especifican modelos de GPU concretos en la información disponible.
- GPU de centro de datos (A100, H100): no son necesarias para la inferencia; no se han publicado cifras para estos aceleradores.
- Opciones de despliegue: Transformers.js en navegador o Node, la librería TypeScript open-jev (`OpenJev.load({ model: "gliner2-decide" })`), y ONNX Runtime en Python mediante el runtime experimental `lmoe/gliner2-onnx`. Para las cabezas de extracción hay que usar la librería Python `gliner2` sobre el modelo base.
- No aplican vLLM, llama.cpp, Ollama ni TGI: no es un modelo generativo y no se distribuye en formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiNER2.5-Decide-ONNX (esta ficha) | no disponible (fp32 1,74 GB) | 512 tokens | Clasificación y decisiones tipadas, solo ruta de clasificación | Apache-2.0 | ONNX para Transformers.js y open-jev |
| fastino/GLiNER2.5-Decide | no disponible (mismo encoder) | 512 tokens | Decisiones tipadas más extracción de spans, fronteras y registros | Apache-2.0 | Pesos del modelo base para la librería Python `gliner2` |
| GLiNER (urchade/GLiNER) | no disponible | no disponible | Reconocimiento de entidades con capacidad zero-shot, extracción conjunta de entidades y relaciones, clasificación de tokens multitarea | no disponible en la información recogida | Framework de entrenamiento y despliegue, optimizado para CPU y hardware de consumo |

Respecto al modelo base, esta exportación pierde las cabezas de extracción y gana portabilidad al navegador y un formato ONNX con variantes cuantizadas. Respecto a GLiNER original, el foco es distinto: GLiNER ataca la extracción de entidades zero-shot, mientras que GLiNER2.5-Decide ataca la decisión tipada. No se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias
- Contexto limitado a 512 tokens. Los estados más largos se truncan por el final cuando se usa open-jev, lo que puede eliminar información relevante del texto.
- Solo inglés. La model card declara únicamente el idioma `en` y el entrenamiento se realizó sobre texto operativo en inglés; el comportamiento en otros idiomas no está documentado.
- Esta exportación cubre solo la clasificación. La extracción de entidades, relaciones y registros estructurados requiere la librería Python del modelo base.
- Sin datos de rendimiento en benchmarks públicos: no se puede estimar su calidad frente a alternativas con cifras publicadas.
- Riesgo de alucinación en el sentido habitual: bajo, porque no genera texto libre. El riesgo real es de calibración, es decir, que la distribución de probabilidad asignada a las etiquetas no refleje la incertidumbre real, y de sensibilidad al enunciado de las preguntas y a las descripciones por etiqueta.
- Sensibilidad al formato de entrada: el llamante debe reproducir exactamente el layout del procesador de GLiNER2 (marcadores `[L]`, `[P]`, `[SEP_STRUCT]`, `[SEP_TEXT]`, minúsculas en el estado, tokenización palabra a palabra). Una tokenización distinta produce resultados distintos sin aviso.
- Cuantización agresiva: las variantes q4 y q4f16 cambian el argmax en 1 de 13 preguntas y presentan diferencias de probabilidad de hasta 7,2e-2, con el caso más ajustado en 0,50 frente a 0,42. Para decisiones de alto riesgo conviene usar fp32 o fp16.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo ni de equidad.
- Licencia Apache-2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la atribución. Los créditos del repositorio indican que la exportación y la integración con open-jev las realizó Shreyas Karnik y que el trabajo no está afiliado a Fastino ni a TypeSafe; conviene verificar la titularidad de los derechos antes de un despliegue comercial.
- Madurez: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia. El runtime Python alternativo `lmoe/gliner2-onnx` se declara experimental y con API sujeta a cambios.
- Dependencia de la librería open-jev para el enrutado en navegador; su mantenimiento afecta directamente a la integración.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/onnx-community/GLiNER2.5-Decide-ONNX
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Organización ONNX Community en HuggingFace: https://huggingface.co/onnx-community
- Blog de Fastino sobre GLiNER2.5-Decide: https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- Librería open-jev (integraciones con el modelo): https://github.com/nico-martin/open-jev
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/shreyask/open-jev-gliner2-demo
- Runtime ONNX experimental para Python: https://github.com/lmoe/gliner2-onnx
- Framework GLiNER original: https://github.com/urchade/GLiNER
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js

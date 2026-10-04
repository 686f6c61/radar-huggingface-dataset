# Asyunelus/von-1.3-onnx-porting

## Resumen

Von 1.3 ONNX es un port a formato ONNX del modelo Von 1.3, un sistema de toma de decisiones (decision-making) orientado a elegir la opción más adecuada entre un conjunto de alternativas dadas una situación y una pregunta. Lo publica el usuario Asyunelus en HuggingFace y deriva del proyecto original Von, alojado en el repositorio GitHub wfzyx/von, que a su vez se apoya en la arquitectura ModernBERT. El objetivo declarado del port es permitir la inferencia rápida en entornos de CPU, evitando la dependencia de GPU y de librerías de deep learning pesadas.

El modelo se distribuye como un artefacto ONNX de aproximadamente 1,6 GB dentro del repositorio, lo que sitúa su huella en un rango propio de un encoder de tamaño medio o grande en precisión completa. La interfaz de uso es deliberadamente simple: recibe un contexto o estado, una pregunta y una lista de opciones en formato JSON, y devuelve el índice seleccionado, las puntuaciones y las probabilidades asociadas a cada opción. Está etiquetado con los tags `onnx`, `modernbert` y `decision-making`, y declara soporte exclusivo para inglés.

Su relevancia actual es acotada pero específica: cubre el nicho de la selección de acciones tipo clasificación (por ejemplo, elegir la mejor respuesta en un flujo de atención al cliente), y lo hace mediante un runtime ligero como ONNX Runtime, lo que facilita el despliegue en servidores sin GPU. Al tratarse de una conversión de un modelo de decisión y no de un modelo generativo, su utilidad está más próxima a un clasificador de opciones que a un asistente conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) exportado a ONNX |
| Parametros totales | no disponible (repositorio de 1,6 GB en formato ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT, un transformer de tipo encoder, segun se desprende del tag `modernbert` y de la propia model card, que atribuye el modelo base a ModernBERT-large. El artefacto publicado es una exportacion a ONNX del modelo Von 1.3, que se ejecuta mediante ONNX Runtime. La tarea que resuelve es de clasificacion y seleccion de opciones: dado un contexto, una pregunta y una lista de alternativas, el modelo puntua cada opcion y devuelve el indice de la elegida junto con las probabilidades normalizadas.

No se especifican en la informacion disponible detalles del entrenamiento original de Von 1.3, como el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de ajuste fino como RLHF o DPO. La model card del port se limita a documentar el proceso de conversion, la interfaz de uso y las dependencias (`onnxruntime`, `numpy`, `tokenizers`, `huggingface_hub`), asi que cualquier dato sobre el preentrenamiento o el ajuste de la decision debe consultarse en el repositorio original.

## Capacidades

- Seleccion de opciones: puntua y elige la mejor accion entre un conjunto cerrado de alternativas dadas un contexto y una pregunta.
- Salida de probabilidades: devuelve `scores` y `probabilities` normalizadas para cada opcion, lo que permite umbrales de confianza.
- Inferencia en CPU: el port ONNX esta pensado para ejecutarse sin GPU a traves de ONNX Runtime.
- Entrada estructurada JSON: acepta `context` (o `state`), `question` y `options`, y puede invocarse por CLI o por la clase Python `VonOnnx`.
- Toma de decisiones en flujos de soporte: los ejemplos de la model card giran en torno a elegir la respuesta correcta en escenarios de atencion al cliente.
- Idiomas: solo ingles.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso autonomo.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y un conjunto de acciones predefinidas (enviar enlace de reseteo, escalar a un agente, cerrar el ticket), el modelo selecciona la mas adecuada, aprovechando que su salida es un indice y una probabilidad sobre opciones cerradas.
- Clasificacion de intencion en chatbots: se usa como paso de decision para mapear la peticion del usuario a una de las respuestas o rutas disponibles en el arbol de conversacion.
- Evaluacion de politicas de respuesta: en entornos donde hay que elegir entre varias respuestas preescritas, el modelo actua como selector que aplica un criterio de adecuacion segun el contexto.
- Moderacion asistida por opciones: ante un mensaje, elegir entre acciones tipificadas (advertir, ocultar, marcar para revision) sin generar texto nuevo.
- Despliegue en servidores sin GPU: gracias al port ONNX, puede integrarse en microservicios de CPU para tareas de decision de baja latencia, evitando el coste de aceleradores.
- Sistemas de decision embebidos y edge: ONNX Runtime permite ejecutar el modelo en entornos con recursos limitados donde no se dispone de CUDA ni de GPUs dedicadas.
- Prototipado de agentes con acciones discretas: como componente de politica que elige la siguiente accion en un conjunto finito, dentro de un bucle mayor controlado por otro sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser inferencia en CPU mediante ONNX, no requiere VRAM; si se traslada a GPU, el peso del artefacto (repositorio de 1,6 GB) da una referencia aproximada del consumo de memoria en precision completa.
- GPU recomendadas: no disponibles en la informacion; el objetivo declarado del port es precisamente la ejecucion en CPU.
- Cabe en GPU de consumo: no disponible (depende de la precision y del runtime empleado); el enfoque del proyecto evita la GPU.
- Opciones de despliegue: ONNX Runtime como runtime principal, con dependencias `onnxruntime`, `numpy`, `tokenizers` y `huggingface_hub`; se ofrece una clase Python `VonOnnx` y una CLI `main.py`.
- Latencia y throughput: no disponibles. El objetivo declarado es una inferencia rapida en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni una lista de modelos comparables dentro de la misma categoria de decision-making sobre ModernBERT.

## Limitaciones y advertencias

- Modelo de seleccion entre opciones: no genera texto libre, solo elige entre las alternativas suministradas, por lo que fuera de ese esquema su utilidad es muy limitada.
- Idioma: soporte declarado unicamente en ingles; no hay garantias de comportamiento correcto en castellano ni en otros idiomas.
- Contexto: no se especifica la longitud maxima de contexto admitida, lo que obliga a validarla experimentalmente antes de usarla con entradas largas.
- Sesgos: no disponibles; la informacion no documenta evaluaciones de sesgo ni de equidad.
- Alucinacion: al ser un clasificador sobre opciones cerradas, el riesgo se manifiesta como seleccion de una opcion incorrecta o mal calibrada, no como invencion de contenido; conviene usar el campo `probabilities` como control de confianza.
- Licencia: Apache 2.0, que permite uso comercial, pero se recomienda revisar las condiciones del proyecto original Von y de ModernBERT, ya que ambos son la base derivada.
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, y las fechas de creacion y actualizacion son practicamente identicas, lo que sugiere que no ha sido validado por la comunidad.
- Produccion: al no haber benchmarks ni cifras de latencia publicadas, cualquier despliegue real deberia acompanarse de una evaluacion propia sobre el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/Asyunelus/von-1.3-onnx-porting
- Repositorio original Von: https://github.com/wfzyx/von
- ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- ONNX: https://onnx.ai/
- Repositorio ONNX: https://github.com/onnx/onnx/tree/main
- ONNX Model Zoo: https://github.com/onnx/models
- Modelos ONNX en HuggingFace: https://huggingface.co/models?library=onnx
- ONNX Runtime Models: https://onnxruntime.ai/models

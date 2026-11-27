# onnx-community/GLiNER2.5-Decide-ONNX

## Resumen

GLiNER2.5-Decide-ONNX es la exportación a formato ONNX de la ruta de clasificación del modelo fastino/GLiNER2.5-Decide, un encoder DeBERTa-v3-large con una cabeza de etiquetas entrenada por Fastino para tomar decisiones operativas tipadas: enrutamiento, análisis de sentimiento, puertas sí/no y puntuaciones ordinales. Este paquete está preparado para ejecutarse en el navegador mediante Transformers.js y la librería open-jev, con soporte para WebGPU y respaldo en WASM, sin que los datos salgan de la pestaña del usuario.

El modelo original está pensado para lo que sus autores llaman "decisiones tipadas": en lugar de generar texto libre, el modelo recibe un estado (por ejemplo, el texto de un ticket de soporte) y una serie de preguntas con etiquetas candidatas, y devuelve una distribución de probabilidad sobre esas etiquetas. La exportación cubre únicamente la ruta de clasificación; las cabezas de extracción (span, boundary, record) no forman parte de este paquete y requieren la librería Python gliner2.

La relevancia de esta ficha radica en que permite ejecutar un modelo de clasificación de decisiones en el cliente, sin infraestructura de servidor, con cuantizaciones que van desde fp32 (1,74 GB) hasta q4f16 (523 MB), lo que lo hace viable en entornos web y en dispositivos con recursos limitados. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-large con cabeza de clasificación (1024→2048→1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32, fp16, q4 (MatMul 4-bit, resto fp32), q4f16 (MatMul 4-bit, resto fp16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + ficheros _data) |

## Arquitectura y entrenamiento

El modelo base es un encoder DeBERTa-v3-large al que se le ha añadido una cabeza de clasificación entrenada específicamente para decisiones tipadas. La cabeza transforma la representación del token marcador `[L]` en una proyección 1024→2048→1, generando un logit por etiqueta; aplicando softmax sobre los marcadores de una misma pregunta se obtiene la distribución de probabilidad. La exportación ONNX mantiene esta ruta de clasificación y expone tres entradas: `input_ids`, `attention_mask` y `marker_positions` (índices de los tokens `[L]`), con salida `logits` de forma `[batch, markers]`.

El entrenamiento se realizó sobre texto operativo en inglés, según indica la model card del modelo base, y no se entrenó sobre benchmarks públicos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no está en la arquitectura del encoder, sino en el formato de decisión: el prompt incluye las preguntas y las etiquetas con descripciones opcionales, y el estado se tokeniza palabra por palabra tras un procesado específico (minúsculas, separación con el regex del procesador, punto final si falta y tokenización sin tokens especiales). La exportación incluye scripts de conversión y verificación de fidelidad en el directorio `conversion/`.

## Capacidades

- Clasificación de texto en decisiones tipadas: elección entre etiquetas (`choice`), preguntas booleanas sí/no (`noul`) y puntuaciones ordinales (`score`).
- Enrutamiento de tickets o consultas a equipos o categorías predefinidas.
- Análisis de sentimiento y detección de enfado del cliente.
- Evaluación de severidad o urgencia en escalas ordinales.
- Ejecución en navegador con WebGPU (respaldo WASM) mediante Transformers.js.
- Integración con la librería open-jev para definir preguntas, etiquetas y descripciones en TypeScript.
- Procesamiento local: los datos no abandonan la pestaña del navegador.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y devuelve el equipo responsable (facturación, soporte técnico, ventas) mediante una pregunta de tipo `choice` con descripciones por etiqueta, lo que permite enrutar automáticamente sin enviar datos a un servidor.
- Detección de clientes enfadados: una pregunta `noul` ("¿Está el cliente enfadado?") sobre el estado del ticket permite priorizar conversaciones y activar protocolos de escalado en el navegador del agente.
- Priorización de incidencias: una pregunta `score` con niveles ("cosmético", "degradado con workaround", "bloqueante") asigna severidad a los bugs reportados, útil en paneles de soporte que funcionan íntegramente en el cliente.
- Moderación de contenido en aplicaciones web: clasificación de mensajes de usuario en categorías predefinidas antes de enviarlos a un backend, reduciendo la carga del servidor y la latencia percibida.
- Formularios inteligentes: clasificación en tiempo real de las respuestas de un formulario para decidir la siguiente pregunta o el flujo a seguir, con ejecución local y sin coste de inferencia en servidor.
- Análisis de feedback de producto: clasificación de comentarios de usuarios en categorías (rendimiento, usabilidad, precios, funcionalidad) en una herramienta web interna, aprovechando la cuantización q4f16 (523 MB) para reducir la descarga inicial.
- Prototipado rápido de clasificadores: uso de open-jev para definir preguntas y etiquetas en TypeScript y validar la viabilidad de un clasificador antes de invertir en un modelo entrenado a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una comparación de fidelidad frente a la librería Python gliner2 (v2.0.0) sobre 6 estados y 13 preguntas:

| Variante | Mismo argmax | Peor diferencia de probabilidad |
|---|---|---|
| fp32 | 13/13 | 5,8e-7 |
| fp16 | 13/13 | 2,5e-4 |
| q4 | 12/13 | 7,2e-2 |
| q4f16 | 12/13 | 7,1e-2 |

La discrepancia en q4 y q4f16 corresponde a una decisión a tres bandas con probabilidades de 0,50 y 0,42.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de los pesos orienta la demanda de memoria (1,74 GB en fp32, 872 MB en fp16, 888 MB en q4, 523 MB en q4f16).
- GPU recomendadas: no disponible. El modelo está diseñado para WebGPU en navegador y respaldo WASM, no para despliegue en GPU de servidor.
- Compatibilidad con GPU de consumo: la variante q4f16 (523 MB) es la más adecuada para dispositivos con recursos limitados; la fp16 (872 MB) es la opción por defecto en WebGPU cuando el dispositivo soporta `shader-f16`.
- Opciones de despliegue: Transformers.js en navegador con WebGPU o WASM; integración con open-jev; la librería Python gliner2 para las rutas de extracción no incluidas en esta exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GLiNER2.5-Decide-ONNX | DeBERTa-v3-large + cabeza de clasificación | 512 tokens | en | Apache-2.0 | ONNX | Exportación para navegador, solo clasificación |
| fastino/GLiNER2.5-Decide | DeBERTa-v3-large + cabezas de clasificación y extracción | 512 tokens | en | Apache-2.0 | safetensors (no disponible en la información) | Modelo base, incluye extracción de entidades y relaciones |
| Modelos de clasificación de texto genéricos (p. ej. DeBERTa-v3-large fine-tuned para clasificación) | DeBERTa-v3-large + cabeza de clasificación | 512 tokens | en | variable | variable | No disponibles datos concretos en la información proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Contexto limitado a 512 tokens; los estados más largos se truncan por el final en open-jev, lo que puede perder información relevante.
- Entrenado únicamente con texto operativo en inglés; no se ha evaluado en otros idiomas ni en dominios distintos al operativo.
- No entrenado sobre benchmarks públicos, por lo que no hay garantías de rendimiento en tareas estándar de NLP.
- La exportación cubre solo la clasificación; la extracción de entidades, relaciones y estructuras requiere la librería Python gliner2.
- La cuantización q4 y q4f16 introduce diferencias de hasta 7,2e-2 en probabilidades y puede cambiar el argmax en decisiones ajustadas (caso documentado a 0,50/0,42).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en estados ambiguos o fuera de distribución.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero la exportación y la integración con open-jev no están afiliadas a Fastino ni a TypeSafe; conviene revisar los términos de las dependencias.
- El procesado del texto debe reproducir exactamente el layout del procesador GLiNER2 (tokenización por palabras, minúsculas, punto final, marcadores `[L]`); una implementación incorrecta degrada los resultados.
- No soporta tool calling, agentes ni razonamiento multi-paso; su uso está acotado a decisiones de clasificación.

## Enlaces

- Hugging Face: https://huggingface.co/onnx-community/GLiNER2.5-Decide-ONNX
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Librería open-jev: https://github.com/nico-martin/open-jev
- Organización Fastino en Hugging Face: https://huggingface.co/fastino

# litert-community/d1-3B-LiteRT

## Resumen

d1-3B-LiteRT es la conversión comunitaria a LiteRT del modelo d1-3B de Liquid AI, un modelo de decisión entrenado a partir de LFM2.5-VL-3B. A diferencia de un modelo generativo convencional, d1-3B no produce texto: recibe un estado (texto, un valor JSON, imágenes o una mezcla de ellos) junto con preguntas nombradas y devuelve, para cada pregunta, la probabilidad de cada opción posible. Soporta tres tipos de pregunta: sí/no (`noul`), elección entre opciones con nombre (`choice`) y puntuación ordenada (`score`, de 2 a 10 niveles).

La conversión la firma litert-community mediante litert-torch 0.9.4 y está pensada para la API CompiledModel de ai-edge-litert 2.2.0. El repositorio empaqueta el modelo como un conjunto de grafos TFLite: seis grafos de fila (hasta 128, 256, 512, 1.024, 2.048 y 4.096 tokens), tres pares de estado compartido (estado de hasta 64, 128 o 256 tokens seguido de preguntas de hasta 64 o 128 tokens), y dos grafos adicionales para la torre de visión y el proyector que convierten imágenes en tokens.

Su relevancia radica en que traslada un modelo de clasificación estructurada con capacidades de visión a un formato ejecutable en escritorio y portátil mediante LiteRT, con una fidelidad numérica verificada frente a la implementación de referencia en float32. El autor advierte, no obstante, que los ficheros están pensados para ordenadores: un Galaxy S26 de 12 GB no pudo sostener el modelo por falta de memoria durante la compilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base LFM2.5-VL-3B), adaptado a decisión con cabezas de opción sobre logits |
| Parametros totales | 3B (según modelo base LiquidAI/d1-3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Grafos de fila hasta 4.096 tokens; pares de estado compartido con estado de hasta 256 tokens y preguntas de hasta 128 tokens |
| Tipos de cuantizacion | Conversión en float32 con capas fully-connected en fp16 (`fp16fc`); el modelo base dispone de variantes GGUF, w8a8, ONNX y MLX no verificadas por este repositorio |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (licencia abierta de Liquid AI, categoría "other") |
| Formato de pesos | TFLite (LiteRT); repositorio de 45,3 GB con grafos de ~4,87 GB cada uno más torre de visión y proyector |

## Arquitectura y entrenamiento

El modelo subyacente, LiquidAI/d1-3B, es un modelo de decisión post-entrenado a partir de LFM2.5-VL-3B, un modelo de lenguaje y visión de 3.000 millones de parámetros. En lugar de generar texto token a token, d1-3B lee los logits de unos pocos tokens de opción en la última posición del prompt y los interpreta como probabilidades sobre las opciones de cada pregunta. Las peticiones y respuestas siguen la interfaz `system_one()` del proveedor: entran un estado y preguntas, salen respuestas tipadas y un recuento de tokens. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

La conversión a LiteRT descompone el modelo en grafos especializados. Los grafos de fila reciben los embeddings de los tokens de una fila y devuelven los estados ocultos tras la normalización final; los pares de estado compartido procesan el estado una vez y luego cada pregunta por separado, reutilizando el estado. La torre de visión y el proyector transforman imágenes en tokens. Un host en Python construye las filas, escribe los embeddings, selecciona el grafo adecuado y extrae las respuestas. La fidelidad se verificó contra el código de referencia en float32 sobre CPU: todas las preguntas de prueba coincidieron en la opción más probable, con diferencias de probabilidad de hasta 1,02e-5 en texto y 3,39e-5 en peticiones con imágenes.

## Capacidades

- Clasificación de decisión estructurada: responde preguntas de tipo sí/no (`noul`), elección entre opciones nombradas (`choice`) y puntuación ordenada (`score`) devolviendo probabilidades por opción.
- Procesamiento de estados multimodales: acepta texto, valores JSON, imágenes o combinaciones de ellos como estado de entrada.
- Comprensión de imágenes mediante torre de visión y proyector que convierten píxeles en tokens.
- Razonamiento sobre estados con contexto de hasta 4.096 tokens en los grafos de fila.
- Reutilización de estado compartido: procesa un estado una vez y evalúa múltiples preguntas sobre él de forma eficiente.
- No genera texto libre: su salida es siempre una distribución de probabilidad sobre opciones predefinidas.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y responde preguntas como si el cliente pide un reembolso, qué equipo debe gestionarlo (facturación, técnico, fraude) y qué urgencia tiene. El ejemplo de la model card muestra probabilidades de 0,98962 para reembolso y 0,98351 para facturación, lo que permite enrutar con umbrales de confianza.
- Moderación de contenido con criterios múltiples: se define el texto o la imagen como estado y se lanzan preguntas de tipo `noul` sobre distintas políticas (spam, acoso, contenido sensible), obteniendo probabilidades calibradas para cada criterio en una sola pasada.
- Clasificación de documentos con imágenes: usando la torre de visión, se puede introducir una foto de un formulario o recibo junto con preguntas sobre campos concretos, y el modelo devuelve la probabilidad de cada opción sin necesidad de OCR previo.
- Enrutamiento de correo entrante: con preguntas `choice` sobre departamento destinatario y `score` sobre prioridad, el modelo actúa como clasificador multi-etiqueta en un pipeline de correo, aprovechando el estado compartido para evaluar varias preguntas sobre el mismo mensaje.
- Evaluación de riesgo en formularios JSON: al aceptar valores JSON como estado, puede puntuar solicitudes estructuradas (por ejemplo, solicitudes de crédito o reclamaciones) en escalas ordenadas de 2 a 10 niveles para priorización automática.
- Análisis de feedback de producto: clasificar reseñas o encuestas con preguntas de sentimiento (`score`) y categoría (`choice`) para agregar resultados en dashboards, con la ventaja de que las probabilidades permiten filtrar casos de baja confianza para revisión humana.
- Ejecución local en escritorio para privacidad: al distribuirse como grafos LiteRT para CPU y GPU Metal, permite procesar datos sensibles en un portátil sin enviarlos a la nube, con latencias de 153,9 ms para tres preguntas de texto y 389,3 ms para una foto con una pregunta en un Apple M4 Max.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta verificaciones de fidelidad numérica frente a la implementación de referencia en float32:

| Prueba | Referencia (float32 CPU) | LiteRT CPU | LiteRT Metal (float32) |
|---|---|---|---|
| `refund` (noul) = yes | 0,98962 | 0,98962 | 0,98962 |
| `team` (choice) = billing | 0,98351 | 0,98351 | 0,98351 |
| `team` (choice) = technical | 0,01065 | 0,01065 | 0,01065 |
| `team` (choice) = fraud | 0,00585 | 0,00585 | 0,00585 |
| `urgency` (score) = Can wait | 0,33858 | 0,33858 | 0,33858 |
| `urgency` (score) = Today | 0,56744 | 0,56744 | 0,56744 |
| `urgency` (score) = Blocking the customer now | 0,09398 | 0,09398 | 0,09398 |

Desviación máxima frente a la referencia: 1,3e-6 antes de redondear en este ejemplo; 1,02e-5 en texto y 3,39e-5 en peticiones con imágenes en el conjunto de pruebas completo.

## Requisitos de hardware

- VRAM estimada: cada grafo TFLite ocupa aproximadamente 4,87 GB; el repositorio completo son 45,3 GB, por lo que en inferencia hay que cargar en memoria el grafo de fila o par de estado correspondiente más la torre de visión y el proyector si se usan imágenes.
- GPU recomendadas: Apple M4 Max con Metal (verificado por el autor); no se especifican GPU NVIDIA o AMD en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos confirmados. Un Galaxy S26 de 12 GB no pudo ejecutar una versión anterior de 5,14 GB: los delegados GPU y CPU la aceptaron, pero durante la compilación el teléfono se quedó sin memoria y un guardián de memoria detuvo la aplicación.
- Opciones de despliegue: LiteRT con la API CompiledModel de ai-edge-litert 2.2.0, con host en Python que gestiona filas, embeddings y selección de grafos. Existe una app de ejemplo para Mac en el repositorio LiteRT-Models/d1-3b.
- Latencia: en un Apple M4 Max con Metal a float32, el ejemplo de tres preguntas del modelo base tarda una mediana de 153,9 ms y el ejemplo de una foto con una pregunta 389,3 ms (medición del 2026-10-09). No se dispone de datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d1-3B-LiteRT (este) | 3B | hasta 4.096 tokens (grafos de fila); estado 256 + preguntas 128 en pares compartidos | TFLite | lfm-open-license-v1.0 | Conversión comunitaria para LiteRT; salida de probabilidades, no texto |
| LiquidAI/d1-3B | 3B | no disponible | safetensors (formato original) | lfm-open-license-v1.0 | Modelo de decisión original de Liquid AI; referencia float32 |
| LiquidAI/d1-3B-GGUF | 3B | no disponible | GGUF | lfm-open-license-v1.0 | Variante oficial en GGUF, no verificada por este repositorio |
| LiquidAI/d1-3B-w8a8 | 3B | no disponible | no disponible | lfm-open-license-v1.0 | Variante cuantizada w8a8 oficial, no verificada por este repositorio |
| onnx-community/d1-3B-ONNX | 3B | no disponible | ONNX | lfm-open-license-v1.0 | Conversión comunitaria a ONNX, no verificada por este repositorio |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas; no sirve para tareas generativas.
- Los ficheros están pensados para escritorio y portátil. Un dispositivo móvil de 12 GB (Galaxy S26) no pudo completar la compilación por falta de memoria, por lo que el despliegue en teléfonos no está garantizado.
- La licencia lfm-open-license-v1.0 es una licencia abierta de Liquid AI con condiciones específicas; es responsabilidad del usuario revisar los términos para uso comercial antes de desplegar el modelo en producción.
- El repositorio no verifica las conversiones alternativas (GGUF, w8a8, ONNX, MLX) enlazadas en la model card.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática; al tratarse de un clasificador, el riesgo principal es una calibración deficiente de las probabilidades en dominios alejados de los datos de entrenamiento.
- El tamaño del repositorio (45,3 GB) y de cada grafo (~4,87 GB) implica requisitos de almacenamiento y memoria considerables para un modelo de 3B.
- Las mediciones de latencia proceden de un único hardware (Apple M4 Max) y no deben extrapolarse sin validación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/d1-3B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Modelo predecesor: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/d1-open
- App de ejemplo para Mac: https://github.com/john-rocky/LiteRT-Models/tree/main/d1-3b
- Variante GGUF: https://huggingface.co/LiquidAI/d1-3B-GGUF
- Variante w8a8: https://huggingface.co/LiquidAI/d1-3B-w8a8
- Variante ONNX: https://huggingface.co/onnx-community/d1-3B-ONNX
- Variante MLX: https://huggingface.co/DJLougen/d1-3B-MLX-8bit

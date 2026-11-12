# 6l3m/kairos-quality-intent

## Resumen

kairos-quality-intent es un ajuste fino (fine-tune) del modelo google/functiongemma-270m-it, desarrollado por el usuario 6l3m. Su función es leer una petición de edición de vídeo escrita en lenguaje natural ("dale un aire más cinematográfico", "la voz no se oye bien") y devolver los identificadores de intención de calidad que la petición solicita, extraídos de una lista cerrada de 30 identificadores, o bien `none` si no reconoce ninguna. El modelo se ejecuta en el navegador mediante transformers.js y WebGPU dentro del editor de vídeo kaairos, donde solo se consulta cuando ninguna regla léxica previa ha reconocido la petición.

Se trata de un modelo derivado de Gemma de 270 millones de parámetros, con arquitectura Gemma 3 (texto), exportado a ONNX en fp16 y optimizado para inferencia en el cliente. El modelo no decide los parámetros de la edición: solo nombra qué se quiere conseguir, mientras que el código del editor calcula cada paso a partir de las mediciones del clip y cada acción requiere confirmación del usuario.

Su relevancia radica en el despliegue de un modelo de lenguaje pequeño y especializado directamente en el navegador, sin servidor, para una tarea de clasificación cerrada con umbral de confianza estricto. El repositorio ocupa 0,6 GB y acumula 712 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, `gemma3_text`), ajustado con LoRA y exportado a ONNX |
| Parametros totales | 270 M (modelo base google/functiongemma-270m-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp16 (exportacion oficial); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles unicamente (segun la model card) |
| Licencia | Gemma Terms of Use (modelo derivado de Gemma) |
| Formato de pesos | ONNX (onnxruntime-genai, WebGPU) |

## Arquitectura y entrenamiento

El modelo parte de FunctionGemma-270M-it, un transformer decoder-only de la familia Gemma 3 orientado a function calling, con 270 millones de parámetros. Sobre esa base se entrenaron adaptadores LoRA de rango 16 durante 6 épocas, que después se fusionaron en el modelo base en fp32. La exportación se realizó con el builder de onnxruntime-genai en fp16 para WebGPU: los logits se recortan a la última posición y el `lm_head` se ata a la matriz de embeddings mediante una operación Gemm.

Los datos de entrenamiento consistieron en aproximadamente 3.000 peticiones generadas por un modelo profesor abierto (Gemma 4 31B-it) a partir de una lista fija de descripciones de intención, distribuidas entre 12 personas de usuario y etiquetadas bajo reglas fijas. La validación, con dos personas reservadas por completo, alcanzó un 85 % de acierto exacto. En la verificación de la exportación, sobre 82 peticiones de referencia, las respuestas greedy del archivo ONNX coincidieron con las del modelo en PyTorch en 82 de 82 casos, con una diferencia máxima de confianza de 0,0008.

## Capacidades

- Clasificación de intención de calidad en peticiones de edición de vídeo, con una lista cerrada de 30 identificadores.
- Generación de texto breve: la respuesta es una secuencia de identificadores separados por espacios, o `none`.
- Decodificación greedy con un máximo de 12 tokens nuevos y parada en `<end_of_turn>`.
- Salida con probabilidades por token, que la aplicación usa para aplicar un umbral de confianza (producto de probabilidades ≥ 0,98, incluido el token de fin).
- Ejecución en navegador mediante transformers.js y WebGPU, sin backend servidor.
- Soporte de conversación con plantilla de chat de Gemma (`<start_of_turn>` / `<end_of_turn>`).
- No soporta tool calling general, agentes multi-paso, visión ni audio: la tarea está acotada a la clasificación de intenciones.

## Casos de uso

- Edición de vídeo asistida en el navegador: el modelo interpreta peticiones como "dale un aire de película" y devuelve la intención correspondiente, que el editor traduce después en pasos concretos calculados a partir de las mediciones del clip.
- Clasificación de intención en lenguaje natural como respaldo de reglas léxicas: se consulta solo cuando ninguna regla por palabras ha reconocido la petición, reduciendo falsos negativos del sistema basado en reglas.
- Enrutado de acciones en aplicaciones de edición: los identificadores devueltos se mapean a operaciones del editor, con confirmación obligatoria del usuario mediante tarjeta de aprobación.
- Despliegue en cliente sin servidor: al ejecutarse con transformers.js y WebGPU, permite privacidad total de las peticiones del usuario y elimina la latencia de red y el coste de inferencia en la nube.
- Prototipado de asistentes de edición con modelos de 270 M: sirve como referencia para integrar clasificadores de intención pequeños en pipelines de UI con umbral de confianza.
- Filtrado previo de peticiones ambiguas: la política de descartar respuestas con confianza inferior a 0,98 permite derivar a revisión humana o a un modelo mayor las peticiones dudosas.
- Investigación sobre ajuste fino de modelos Gemma pequeños para tareas cerradas: el repositorio documenta el proceso completo (datos sintéticos, LoRA, fusión, exportación ONNX y verificación de equivalencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de evaluación son los de la model card:

| Evaluacion | Resultado |
|---|---|
| Acierto exacto en validación (dos personas reservadas) | 85 % |
| Equivalencia ONNX vs. PyTorch (respuestas greedy) | 82/82 |
| Diferencia maxima de confianza ONNX vs. PyTorch | 0,0008 |
| Deteccion de intencion en peticiones no vistas con intencion | 5/14 |
| Falso positivo de intencion en peticiones no vistas sin intencion | 1/20 |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0,6 GB en fp16; la inferencia en WebGPU requiere memoria de GPU del orden de 1 GB o menos, aunque no se especifica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (integrada o dedicada); no se documentan modelos concretos.
- Cabe en GPU de consumo: sí, por su tamaño de 270 M de parámetros y su exportación fp16.
- Opciones de despliegue: transformers.js con WebGPU (vía oficial), onnxruntime-genai; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este artefacto ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| kairos-quality-intent | 270 M | no disponible | Clasificacion de intenciones de calidad (30 ids) | Gemma Terms of Use | ONNX fp16 |
| google/functiongemma-270m-it | 270 M | no disponible | Function calling general | Gemma Terms of Use | safetensors |
| Modelos de clasificacion de intencion dedicados (p. ej. clasificadores BERT pequenos) | variable | variable | Clasificacion cerrada | variable | variable |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en inglés; no soporta otros idiomas.
- Confunde intenciones vecinas: por ejemplo, interpreta "music video" como intención cinematográfica.
- Puede omitir la segunda intención de una petición compuesta.
- En peticiones no vistas durante el entrenamiento, solo detectó la intención en 5 de 14 casos con intención presente, y añadió una intención errónea en 1 de 20 casos sin intención.
- La licencia Gemma Terms of Use impone restricciones, incluida la Gemma Prohibited Use Policy; el uso comercial está sujeto a dichos términos.
- Es un modelo derivado de Gemma con pesos modificados (LoRA fusionado, exportación ONNX, `lm_head` atado a los embeddings).
- La aplicación solo acepta respuestas con confianza agregada ≥ 0,98; por debajo de ese umbral la respuesta se descarta.
- No es un modelo de propósito general: no sirve para generación libre, código, matemáticas ni razonamiento multi-paso.
- Riesgo de alucinación de identificadores fuera de la lista cerrada no documentado explícitamente, pero inherente a la generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/6l3m/kairos-quality-intent
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Aplicación kaairos: https://kaairos.app
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy

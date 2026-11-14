# plantwaterer/peshgi

## Resumen

peshgi (𒉾𒄑𒄀) es un sistema de respuesta a preguntas de opción múltiple sobre imágenes, publicado por el usuario plantwaterer en Hugging Face bajo licencia Apache-2.0. No es un modelo único, sino un sistema compuesto por tres piezas: un modelo base Qwen/Qwen3.8-27B que se descarga en tiempo de ejecución, dos modelos de OCR de PaddlePaddle (PP-OCRv5 en variante mobile) que extraen el texto de las imágenes antes de la consulta, y una actualización de bajo rango más una cabeza lineal de 26 vías entrenada específicamente para emitir una probabilidad por cada opción de respuesta.

El modelo resuelve una tarea muy acotada: dada una imagen y una pregunta con opciones (A, B, ...), devuelve la letra elegida junto con la distribución de probabilidad sobre las opciones. No genera texto libre ni decodifica tokens: la respuesta es la salida de la cabeza lineal aplicada al estado oculto del último token del prompt. La actualización de bajo rango (3,3 GB) es el promedio ponderado de siete fine-tunes del modelo base, y el repositorio no contiene los pesos completos de Qwen.

Su relevancia es doble: por un lado, demuestra una arquitectura de despliegue eficiente que separa el conocimiento del modelo base de la tarea específica mediante un adaptador de bajo rango y una cabeza de clasificación; por otro, integra OCR en el pipeline de forma obligatoria, lo que permite responder preguntas sobre texto presente en la imagen (carteles, documentos, capturas) sin depender de la capacidad de lectura del modelo de visión. El contexto y el tamaño del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención completa y capas recurrentes Gated DeltaNet (modelo base Qwen/Qwen3.8-27B); cabeza lineal de 26 vías sobre el último token |
| Parámetros totales | No disponible (el modelo base no se especifica en la información; la actualización de bajo rango ocupa 3,3 GB) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (la inferencia se ejecuta en bf16; la cabeza en fp32) |
| Idiomas soportados | No disponible (el OCR de reconocimiento es en inglés: `en_PP-OCRv5_mobile_rec`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`peshgi_update.safetensors` de 3,3 GB y `peshgi_head.safetensors`) |

## Arquitectura y entrenamiento

El sistema se apoya en Qwen/Qwen3.8-27B en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, que combina capas de atención completa con capas recurrentes Gated DeltaNet. Sobre ese modelo se aplica una actualización de bajo rango que es el promedio ponderado de siete fine-tunes distintos del mismo modelo base; los pesos de cada fine-tune se mantienen separados dentro del fichero de actualización. La cabeza lineal de 26 vías se aplica al estado oculto del último token del prompt y produce directamente la distribución de probabilidad sobre las opciones, sin decodificación autoregresiva.

El entrenamiento de los fine-tunes incorpora el texto OCR en el prompt: dos de ellos (con pesos 0,1 y 0,3 en el promedio) se entrenaron con ese texto presente, y la selección y medición del promedio se hicieron con el pipeline completo. La atención es un punto crítico: en las capas de atención completa, todos los tokens del prompt atienden a todos los tokens del prompt, mientras que las capas recurrentes permanecen causales. El motor registra esta función de atención en la interfaz de transformers y la ejecuta con PyTorch SDPA; usar atención causal estándar produce respuestas distintas. El OCR (PP-OCRv5 mobile, detección y reconocimiento en inglés, unos 20 MB en total, Apache-2.0) se ejecuta en cada petición: lee cada imagen a resolución original (hasta 960 píxeles en el lado largo), conserva líneas con puntuación de reconocimiento ≥ 0,5, las ordena en bandas de 12 píxeles y luego de izquierda a derecha, con un máximo de 60 líneas y 1.200 caracteres por imagen.

## Capacidades

- Respuesta a preguntas de opción múltiple sobre imágenes, con una probabilidad asignada a cada opción.
- Lectura de texto en imágenes mediante OCR integrado (PP-OCRv5 mobile), con el texto inyectado en el prompt antes de la pregunta.
- Razonamiento visual sobre escenas, objetos y relaciones espaciales (por ejemplo, qué objeto está más cerca de la cámara).
- Procesamiento de imágenes a resolución nativa de hasta 1.638.400 píxeles por imagen (límite del banco de evaluación, con el tope del procesador del modelo base elevado a ese valor).
- Soporte de múltiples imágenes por petición, con el texto OCR de cada una etiquetado como `[image 1]`, `[image 2]`, etc.
- Modo de pensamiento desactivado de forma explícita (`enable_thinking=False`) en la plantilla de chat.
- No soporta generación de texto libre, tool calling, agentes ni decodificación autoregresiva: la salida es únicamente la distribución sobre las opciones.
- Capacidades multilingües: no disponibles; el OCR de reconocimiento es en inglés.

## Casos de uso

- Evaluación automatizada de modelos de visión: el sistema puede usarse como motor de referencia en bancos de pruebas de opción múltiple sobre imágenes, ya que devuelve probabilidades calibradas por opción en lugar de una única etiqueta.
- Clasificación de documentos escaneados: gracias al OCR integrado, puede responder preguntas sobre formularios, facturas o capturas de pantalla comparando el texto extraído con las opciones disponibles.
- Control de calidad en inventarios: dada una foto de una estantería o un almacén, responder qué producto o etiqueta aparece en una posición determinada, con la probabilidad asociada para priorizar revisiones manuales.
- Moderación de contenido visual con texto: detectar si una imagen contiene un cartel o mensaje concreto entre varias opciones, usando el OCR para leer el texto y la cabeza para decidir.
- Asistencia a personas con discapacidad visual: responder preguntas concretas del tipo "¿qué objeto hay a la derecha?" con una distribución de probabilidad que permita al sistema de voz elegir la respuesta más segura.
- Investigación en fusión de modelos: el repositorio sirve como ejemplo reproducible de promedio ponderado de fine-tunes con actualización de bajo rango y cabeza de clasificación, útil para estudiar técnicas de model merging.
- Automatización de encuestas o tests visuales: procesar lotes de imágenes con preguntas de opción múltiple y obtener directamente la opción más probable sin necesidad de parsear texto generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el modelo base Qwen/Qwen3.8-27B se ejecuta en bf16, por lo que se requiere una GPU con memoria suficiente para el modelo completo más la actualización de bajo rango (3,3 GB) y los modelos OCR (unos 20 MB). El cálculo exacto depende del tamaño real del modelo base, que no se especifica.
- GPU recomendadas: no disponibles en la información; el motor usa `cuda:0` por defecto y permite seleccionar otra GPU con `--option device=cuda:1`.
- GPU de consumo: no disponible; no se indica si cabe en tarjetas consumer.
- Opciones de despliegue: el sistema se distribuye como motor propio (`peshgi.py`) que se ejecuta con `uv run --frozen` sobre Linux x86_64, con PyTorch SDPA y la rueda GPU de PaddlePaddle. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la información indica que el tiempo de OCR forma parte de cada cifra de latencia, pero no se publican valores concretos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (respuesta a preguntas de opción múltiple sobre imágenes con OCR integrado) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo base: el motor los descarga desde el Hub de Qwen en una revisión fijada, por lo que la disponibilidad y la reproducibilidad dependen de que ese repositorio siga accesible.
- El OCR es obligatorio y forma parte del sistema: no se puede usar el modelo sin ejecutar PP-OCRv5, y los resultados publicados solo son válidos con ese pipeline completo.
- El reconocimiento OCR es en inglés; el texto en otros idiomas puede no extraerse correctamente, lo que degrada las respuestas que dependen de texto en la imagen.
- La atención no estándar (atención completa bidireccional en las capas de atención del modelo base) es imprescindible: usar atención causal estándar produce respuestas diferentes, lo que dificulta la integración con infraestructuras de inferencia convencionales.
- El modelo no genera texto libre ni decodifica tokens; solo emite una distribución sobre un conjunto cerrado de opciones de hasta 26 vías. No es adecuado para tareas generativas.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero al depender de un modelo base de gran tamaño y de un OCR con errores potenciales, las respuestas pueden verse afectadas por texto mal reconocido.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B y los modelos OCR de PaddlePaddle tienen sus propias licencias, que deben verificarse por separado antes de un despliegue en producción.
- Requisitos de entorno estrictos: Linux x86_64, `uv`, Python 3.12 y la rueda GPU de PaddlePaddle; no se documenta soporte para otros sistemas operativos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación externa de la comunidad.

## Enlaces

- [Hugging Face: plantwaterer/peshgi](https://huggingface.co/plantwaterer/peshgi)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Decision Index (repositorio del motor)](https://github.com/apolinario/decision-index)
- [PaddleOCR / PP-OCRv5](https://github.com/PaddlePaddle/PaddleOCR)
- [PaddlePaddle/PP-OCRv5_mobile_det](https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det)
- [PaddlePaddle/en_PP-OCRv5_mobile_rec](https://huggingface.co/PaddlePaddle/en_PP-OCRv5_mobile_rec)

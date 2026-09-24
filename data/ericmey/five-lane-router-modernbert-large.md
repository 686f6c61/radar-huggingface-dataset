# ericmey/five-lane-router-modernbert-large

## Resumen

El five-lane-router-modernbert-large es un clasificador de texto ajustado a partir de answerdotai/ModernBERT-large que decide qué tipo de respuesta necesita una petición antes de que se ejecute un modelo mayor. Sus cinco etiquetas de salida son `chat`, `image`, `search`, `audio` y `video`, es decir, actúa como enrutador de intención en la primera capa de un asistente conversacional. Lo desarrolla el usuario ericmey y sustituyó a un modelo generativo de 9B parámetros que hacía esa misma función de enrutado en un asistente personal.

El modelo tiene 395.836.421 parámetros (unos 396 M) y se distribuye en safetensors con licencia Apache-2.0, la misma del modelo base. Está entrenado exclusivamente en inglés y sobre un dominio muy concreto: peticiones sintéticas, informales, dirigidas a un asistente de tipo acompañante. Su interés práctico está en la relación entre precisión y coste: en un test ciego sellado de 60 casos resolvió 180/180 llamadas frente a 175/180 del enrutador generativo de 9B, con una latencia p50 de 42 ms frente a 771 ms.

La relevancia del modelo es de ingeniería más que de investigación: demuestra que una tarea de clasificación acotada puede sustituir a un LLM grande en un punto concreto del pipeline, reduciendo el coste por turno y permitiendo despliegue en el borde. El autor lo ejecuta como motor TensorRT en FP16 sobre una NVIDIA Jetson Orin Nano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT), ajustado para clasificación de texto; el modelo base emplea atención alterna local/global, RoPE, GeGLU, sin sesgos y Flash Attention 2 |
| Parametros totales | 395.836.421 (~396 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens en el ajuste, truncando por la izquierda; el modelo base ModernBERT-large admite hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible en el repositorio; el autor despliega un motor TensorRT FP16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,6 GB); el autor incluye también exportación a ONNX con comprobación de paridad en PyTorch |
| Etiquetas de salida | chat, image, search, audio, video (en ese orden) |
| Tarea (pipeline) | text-classification |
| Modelo base | answerdotai/ModernBERT-large |

## Arquitectura y entrenamiento

La arquitectura es la de ModernBERT-large, un encoder transformer sin componente generativo, con 396 M de parámetros y atención alterna entre capas locales y globales para reducir el coste cuadrático en secuencias largas. Sobre esa base, el autor ha sustituido la cabeza de enmascaramiento por una cabeza de clasificación de cinco clases (chat, image, search, audio, video). El ajuste se hizo con 2.334 filas de entrenamiento y 19 de desarrollo del dataset ericmey/five-lane-router, durante 3 épocas, con batch de 8 y acumulación de gradiente 4 (tamaño efectivo 32), learning rate 3e-5 con AdamW (weight decay 0,01), 10 % de warmup lineal seguido de decaimiento lineal, autocast bf16 sobre CUDA y semilla 42. Todo el entrenamiento corrió en una única NVIDIA RTX 5090.

La innovación destacable no está en la arquitectura, sino en el régimen de validación y en la gestión de errores de frontera. La pérdida es entropía cruzada con pesos de clase de raíz cuadrada inversa normalizados a media 1, lo que compensa el desequilibrio entre carriles. El autor documenta que un candidato anterior, entrenado con menos datos, falló al enviar a `image` una petición de chat que mencionaba dibujar; tras añadir 253 filas de contraste para esa forma de error, se reentrenó y se evaluó una sola vez sobre un conjunto ciego nuevo. El formato de entrada forma parte del entrenamiento: hasta los últimos 8 turnos de conversación, uno por línea, con el formato `role: text` para turnos de `user` y `assistant`, y la petición a enrutar en la última línea. La truncación debe hacerse por la izquierda para no perder la petición en conversaciones largas.

## Capacidades

- Clasificación de intención en cinco carriles disjuntos: `chat`, `image`, `search`, `audio` y `video`, con puntuación por clase vía `top_k=None`.
- Enrutado de peticiones conversacionales en contextos multiturno: procesa hasta los últimos 8 turnos formateados como `role: text`.
- Manejo de peticiones vacías o elípticas del tipo "make me one", que según el test ciego se enrutan correctamente a `chat` en 9 de 9 casos.
- Discriminación de fronteras ambiguas entre carril conversacional y carriles multimodales, entrenada explícitamente con 253 filas de contraste para el caso "chat que menciona dibujar".
- Inferencia determinista: al ser un clasificador, las repeticiones sobre la misma entrada coinciden.
- Despliegue en borde: el autor lo ejecuta como motor TensorRT FP16 en una NVIDIA Jetson Orin Nano.
- No genera texto, no hace tool calling, no razona en varios pasos y no produce descripciones: solo asigna un carril. En producción, el modelo grande sigue escribiendo el brief que necesitan las etapas de imagen, voz, vídeo o búsqueda.
- Sin capacidades multilingües: entrenado y evaluado únicamente en inglés.

## Casos de uso

- Enrutado previo en asistentes conversacionales: colocado delante de un LLM grande, decide si el turno debe ir al modelo de chat, al generador de imágenes, al buscador o a los módulos de audio y vídeo. Ahorra una llamada al modelo grande en todos los turnos que no son conversacionales.
- Reducción de coste por turno en producción: sustituye a un enrutador generativo de 9B parámetros, con una latencia p50 de 42 ms frente a 771 ms medida de extremo a extremo desde un cliente, lo que rebaja tanto el coste de cómputo como el tiempo hasta la primera respuesta.
- Asistentes en dispositivo o en el borde: con 396 M de parámetros y FP16, el modelo cabe holgadamente en una Jetson Orin Nano, lo que permite mantener el enrutado en local y enviar a la nube solo los turnos que realmente necesitan un modelo mayor.
- Moderación y derivación de tráfico por modalidad: en una plataforma con varios backends especializados, el clasificador permite etiquetar cada petición entrante y dirigirla al servicio correcto sin un LLM intermedio.
- Enrutado de bajo coste como fallback determinista: al ser un clasificador rápido y estable, puede actuar como primera pasada y dejar el enrutado generativo para los casos de baja confianza o de etiqueta inesperada.
- Filtrado previo en pipelines de generación multimedia: evita invocar un modelo de difusión, de TTS o de vídeo cuando la petición es puramente conversacional, que es la clase mayoritaria en un asistente de compañía.
- Base para ajuste de enrutadores propios: el dataset y los scripts (`train_router.py`, `train_modernbert.py`, `evaluate_router.py`, `export_onnx.py`) permiten reentrenar el modelo con carriles y datos propios, ya que las fronteras entre carriles son decisiones de producto y no universales.

## Benchmarks y rendimiento

Los únicos datos publicados son un test ciego sellado de 60 casos, ejecutado tres veces por modelo (180 llamadas por enrutador). Los casos se redactaron por separado de los datos de entrenamiento, se sellaron antes del entrenamiento, se comprobó que no hubiera fuga con el conjunto de entrenamiento y se usaron una sola vez.

| Metrica | Enrutador generativo 9B | Este modelo |
|---|---|---|
| Rutas correctas | 175 / 180 | 180 / 180 |
| Mensajes de chat enviados a image/audio/video | 0 | 0 |
| Peticiones de image/audio/video/search enviadas a chat | 2 / 120 | 0 / 120 |
| Peticiones vacías ("make me one") enviadas a chat | 9 / 9 | 9 / 9 |
| Latencia p50 (cliente, extremo a extremo) | 771 ms | 42 ms |
| Latencia p95 (cliente, extremo a extremo) | 1.269 ms | 45,6 ms |

Advertencias del propio autor sobre estas cifras: se trata de un único conjunto sellado de 60 casos, no de una prueba de carga en producción. Como el modelo es determinista, las tres repeticiones coinciden, por lo que la lectura correcta es 60 de 60 casos distintos. Si los 60 casos fueran extracciones aleatorias independientes del tráfico real, cero errores seguiría siendo compatible con una tasa de error de hasta aproximadamente el 5 %. Los casos se escribieron para explorar las fronteras entre carriles, no muestreados del tráfico, así que esa cifra es ilustrativa y no una estimación de la tasa de error en vivo. La latencia se midió de extremo a extremo desde un cliente en la misma red, con el motor TensorRT sobre una Jetson Orin Nano; los pesos en PyTorch incluidos en el repositorio correrán a velocidades distintas en otro hardware. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks equivalentes, ya que no son aplicables a un clasificador de enrutado.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, unos 1,6 GB solo de pesos; en FP16, unos 0,8 GB; en INT8, unos 0,4 GB. Con activaciones y batch pequeño, por debajo de 2 GB en FP32 y alrededor de 1 GB en FP16.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; el caso documentado por el autor es una NVIDIA Jetson Orin Nano con motor TensorRT FP16. Para entrenamiento, el autor usó una única NVIDIA RTX 5090.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en muchas integradas, dado el tamaño de 396 M de parámetros. También es viable en CPU, con mayor latencia.
- Opciones de despliegue: transformers de Hugging Face con `pipeline("text-classification")`, exportación a ONNX mediante el script incluido y ejecución con ONNX Runtime, y compilación a motor TensorRT en FP16 para el borde. No aplican vLLM ni TGI en su uso generativo convencional, porque no es un modelo generativo; llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: p50 de 42 ms y p95 de 45,6 ms medidos de extremo a extremo desde un cliente en la misma red con el motor TensorRT FP16 en Jetson Orin Nano. Estas cifras incluyen red y no son extrapolables directamente a otros despliegues.
- Truncación: configurar `tokenizer.truncation_side = "left"` y `max_length=512`; hacerlo por la derecha degrada el resultado en conversaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el test ciego | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericmey/five-lane-router-modernbert-large | ~396 M | 512 tokens (ajuste) | 180/180 rutas correctas | Apache-2.0 | Hugging Face |
| Enrutador generativo de 9B (no identificado en la model card) | ~9.000 M | no disponible | 175/180 rutas correctas | no disponible | no disponible |
| answerdotai/ModernBERT-large (modelo base, sin ajustar) | ~395 M | 8.192 tokens | no aplica: no es un clasificador de carriles | Apache-2.0 | Hugging Face |

No se dispone de datos publicados que permitan comparar este enrutador con alternativas de la misma categoría (por ejemplo, otros clasificadores de intención o enrutadores semánticos) en parámetros, contexto o rendimiento, por lo que esa comparación queda como no disponible.

## Limitaciones y advertencias

- Alcance deliberadamente estrecho: elige un carril, no redacta una respuesta ni un brief. En un pipeline real sigue haciendo falta un modelo mayor para generar la descripción corta que necesitan las etapas de imagen, voz, vídeo o búsqueda.
- Un único dominio: entrenado con peticiones sintéticas, en inglés y de registro informal dirigidas a un asistente de tipo acompañante. Cabe esperar degradación en otros registros, idiomas o dominios.
- Sin soporte multilingüe: el único idioma declarado es el inglés; no se ha evaluado su comportamiento en castellano ni en ningún otro idioma.
- Las fronteras entre carriles son decisiones de producto codificadas en las etiquetas del dataset. Si un producto trata de forma distinta casos como "show me my cat", el modelo fallará exactamente en ese punto.
- Tamaño de la validación muy reducido: 60 casos en un único conjunto sellado y 19 filas de desarrollo. El propio autor advierte que la cifra de cero errores es compatible con una tasa de error de hasta el 5 % si los casos se hubieran muestreado del tráfico real.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de clasificación errónea en entradas fuera de distribución, especialmente con mezclas de intención en un mismo turno.
- Recomendación explícita de despliegue con fallback: si el clasificador falla, agota el tiempo o devuelve una etiqueta inesperada, el turno debe enrutarse por la vía anterior.
- El repositorio tiene 0 descargas y 0 me gusta en el momento de la consulta, y fue creado en septiembre de 2026 según los metadatos; no hay evidencia de uso en producción por terceros.
- Licencia Apache-2.0, que permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y de atribución. No se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericmey/five-lane-router-modernbert-large
- Dataset de entrenamiento: https://huggingface.co/datasets/ericmey/five-lane-router
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Blog post con el recorrido completo: mencionado en la model card, URL no disponible
- Repositorio con los scripts (`code/train_router.py`, `code/train_modernbert.py`, `code/evaluate_router.py`, `code/export_onnx.py`): mencionado en la model card, URL no disponible
- Paper de ModernBERT: no disponible en la informacion proporcionada

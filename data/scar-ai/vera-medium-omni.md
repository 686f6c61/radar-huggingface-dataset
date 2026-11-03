# scar-ai/vera-medium-omni

## Resumen

vera-medium-omni es un modelo de decisión no autoregresivo de tipo "System 1" desarrollado por scar-ai. A partir de un estado multimodal (texto, correos, tickets, JSON, capturas de pantalla, gráficos, documentos escaneados) y un conjunto de preguntas tipadas, devuelve respuestas tipadas con probabilidades calibradas. No genera texto libre, por lo que no hay salida que parsear ni margen para alucinaciones en el sentido generativo habitual. Es relevante porque unifica en un solo modelo de 4,5B de parámetros las capacidades de visión de la familia vera con la lectura por opciones de sus predecesores de texto, manteniendo un formato de comunicación compatible con el resto de la familia (`POST /v1/systemone`).

El modelo se construye sobre el backbone de Qwen3.5-4B (unos 4,2B de parámetros) y conserva su torre de visión original (ViT y patch merger, unos 0,33B de parámetros). Cada pregunta se resuelve en un único forward pass: el prompt enumera todas las opciones bajo un código de respuesta corto, las capas de atención completa ven el prompt entero (las capas Gated DeltaNet permanecen causales) y cada opción se puntúa en el último token del prompt mediante su código de respuesta más un readout de puntero de opción que mira hacia la propia línea de la opción. Las probabilidades se calibran por temperatura según el tipo de pregunta.

Según la model card, en su proxy local del Decision Index vision board (11 benchmarks públicos) obtiene 75,29, por delante de vera-large leído a través de la torre de visión de su propio modelo base (74,78) con un sexto de los parámetros. En texto obtiene 59,85 en su proxy del Decision Index Full, frente a 60,12 antes del entrenamiento con visión. Cada petición se lee completa: ni el estado, ni la pregunta, ni las descripciones de las opciones se truncan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (backbone Qwen3.5-4B con capas de atención completa y capas Gated DeltaNet causales) + torre de visión ViT con patch merger; modelo de decisión no autoregresivo |
| Parametros totales | 4.207.714.822 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; cada petición se lee completa sin truncar estado, pregunta ni opciones; cada imagen cuesta hasta ~1.600 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería pytorch, con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y conserva tanto el backbone de texto como la torre de visión original. La innovación principal es el mecanismo de decisión: en lugar de generar una respuesta token a token, el prompt presenta todas las opciones candidatas etiquetadas con un código corto de respuesta, y el modelo puntúa cada opción en el último token del prompt combinando el logit del código de respuesta con un readout de puntero de opción que atiende a la línea específica de esa opción. Las capas de atención completa procesan el prompt entero, mientras que las capas Gated DeltaNet mantienen un comportamiento causal. Las probabilidades resultantes se calibran por temperatura de forma específica para cada tipo de pregunta.

Las imágenes forman parte del estado: la torre de visión convierte cada imagen en un feature por bloque de 32x32 píxeles (las imágenes se redimensionan a un máximo de 1,6 MP), y esos features ocupan los slots `<|image_pad|>` situados tras el texto del estado, con posiciones regidas por el embedding rotatorio multimodal de Qwen3.5 (M-RoPE). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; la model card solo menciona que hubo una fase de entrenamiento con visión (los resultados de texto pasan de 60,12 a 59,85 tras ella).

## Capacidades

- Decisión multimodal: responde preguntas tipadas sobre un estado compuesto por texto e imágenes (fotos, capturas, gráficos, documentos escaneados).
- Tipos de pregunta: `choice` (de 2 a 255 opciones), `score` (de 2 a 10 niveles ordenados, devuelve puntuación esperada y distribución completa) y `noul` (probabilidad de sí/no).
- Respuestas con probabilidades calibradas por temperatura según el tipo de pregunta, aptas para umbrales de confianza.
- Procesamiento de hasta 16 imágenes por petición, codificadas una sola vez y compartidas entre todas las preguntas de la llamada.
- Entrada de imágenes en múltiples formatos: PIL, rutas de archivo, URLs `http(s)`, URIs `data:image/...;base64,`, base64 en crudo, bytes o estructuras `{"url": ...}` / `{"image_url": {"url": ...}}`; cualquier formato que decodifique Pillow (JPEG, PNG, WebP, primer fotograma de GIF).
- Estado en texto plano, cualquier objeto serializable a JSON o `None` cuando las imágenes constituyen todo el estado.
- No genera texto libre: no hay salida que parsear ni alucinación generativa.
- No soporta vídeo.

## Casos de uso

- Comprensión de documentos y recibos: leer facturas, recibos, formularios y escaneos, y enrutarlos o verificarlos. El modelo recibe la imagen del documento como parte del estado y responde preguntas `choice` sobre categoría o `noul` sobre si requiere aprobación.
- Decisiones sobre capturas de pantalla e interfaz: seleccionar el elemento o la acción sobre una captura de una página web o app, usando preguntas `choice` con las opciones de elementos candidatos.
- Preguntas sobre gráficos e infografías: responder preguntas de opción múltiple sobre gráficas, tablas e infografías, ya que la torre de visión convierte cada imagen en features por bloque de 32x32 píxeles.
- Moderación de contenido: marcar imágenes y memes (imagen más pie de foto) contra una política propia, formulando preguntas `noul` o `score` sobre el cumplimiento de cada regla.
- Inspección visual y conteo: clasificar fotos de producto, daños o defectos, o contar objetos, con respuestas `choice` o `score` calibradas.
- Enrutamiento y triaje: enviar un ticket, correo o solicitud (con sus adjuntos) al equipo o prioridad correctos mediante preguntas `choice` sobre equipo y prioridad.
- Intención, política y puntuación: las mismas capacidades de texto que el resto de la familia vera, con confianza calibrada, para clasificar intenciones o aplicar políticas.
- Flujos con umbral de confianza: actuar automáticamente cuando la probabilidad calibrada supera un umbral y derivar a un modelo más lento o a un humano cuando no, gracias a que las respuestas incluyen distribuciones completas.

## Benchmarks y rendimiento

| Benchmark (proxy local del autor) | vera-medium-omni | Referencia |
|---|---|---|
| Decision Index vision board (11 benchmarks públicos) | 75,29 | vera-large vía torre de visión de su modelo base: 74,78 |
| Decision Index Full (texto) | 59,85 | 60,12 antes del entrenamiento con visión |

No se han publicado en la información disponible resultados en benchmarks estándar como MMLU, HumanEval o GSM8K; las cifras anteriores son proxies propios del autor y no son directamente comparables con esos benchmarks.

## Requisitos de hardware

- Pesos de aproximadamente 9 GB en total: 8,4 GB de backbone y cabeza de decisión, 0,67 GB de torre de visión.
- Se recomienda una GPU con 16 GB o más de VRAM (CUDA o ROCm); la CPU funciona pero es lenta.
- Cabe en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090 o equivalentes); no se especifican modelos concretos en la información disponible.
- Despliegue mediante el paquete `vera-s1` (versión 0.1.7 o superior) con Python 3.10 o superior; la extra `[fast]` añade flash-linear-attention para las capas DeltaNet.
- No se indican opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ni latencias o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vera-medium-omni | 4,21B | no disponible (lectura completa de la petición) | Decisión multimodal no autoregresiva con visión | apache-2.0 | HuggingFace (scar-ai) |
| vera-large | no disponible | no disponible | Decisión de texto; con visión vía la torre de su modelo base | no disponible | HuggingFace (scar-ai) |
| vera-core-2 | no disponible | no disponible | Decisión de texto | no disponible | HuggingFace (scar-ai) |
| Qwen3.5-4B (modelo base) | ~4,2B | no disponible | Generación de texto autoregresiva con torre de visión | no disponible | HuggingFace (Qwen) |

La comparación con modelos de decisión de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No genera texto: no sirve para tareas generativas, resumen o redacción; su salida son respuestas tipadas con probabilidades.
- No soporta vídeo; las imágenes se limitan a 16 por petición y a 1,6 MP de resolución tras el redimensionado.
- La calibración de probabilidades es por temperatura y por tipo de pregunta; conviene validar los umbrales de confianza en el dominio propio antes de automatizar decisiones.
- El rendimiento en texto cae ligeramente tras el entrenamiento con visión (59,85 frente a 60,12 en el proxy del autor), lo que puede afectar a flujos puramente textuales.
- Los benchmarks publicados son proxies propios del autor sobre el Decision Index, no resultados de benchmarks estándar; no son directamente comparables con MMLU, HumanEval u otros.
- Riesgo de sesgo y de error en la lectura de imágenes de baja calidad o documentos poco legibles; la propia model card incluye un tipo de pregunta `score` para evaluar la legibilidad de un recibo, lo que sugiere que la calidad de la entrada condiciona la respuesta.
- Licencia apache-2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-4B y de la librería `vera-s1` antes de desplegar en producción.
- El modelo tiene muy poca tracción pública en el momento de la ficha (6 descargas, 0 likes), por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scar-ai/vera-medium-omni
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- vera-core-2: https://huggingface.co/scar-ai/vera-core-2
- vera-large: https://huggingface.co/scar-ai/vera-large
- Paquete de inferencia: `pip install -U "vera-s1[fast]>=0.1.7"` (no se proporciona URL del repositorio en la información disponible)

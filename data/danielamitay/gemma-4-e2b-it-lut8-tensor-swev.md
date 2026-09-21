# danielamitay/gemma-4-e2b-it-lut8-tensor-swev

## Resumen

Este repositorio contiene una exportación a Core ML del checkpoint google/gemma-4-E2B-it, publicada por el desarrollador danielamitay bajo el identificador `danielamitay/gemma-4-e2b-it-lut8-tensor-swev`. No es un fine-tune ni un modelo nuevo: es una conversión del checkpoint original (fijado en el commit `3e22461f65e8`) empaquetada como `.mlpackage` para Swev, una librería de Swift que expone "decisiones tipadas" en local. El modelo no genera texto libre; su salida se restringe a los logits de las etiquetas candidatas definidas en tiempo de ejecución, de modo que devuelve una elección, una puntuación ordinal o un valor booleano acompañado de probabilidades.

El paquete conserva las rutas de texto y de visión del modelo base, omite la ruta de audio y comprime los pesos con paletas de 8 bits por tensor (LUT) manteniendo el cálculo en FP32. La ventana de texto útil es de hasta 4.096 tokens, con selección automática del bucket más pequeño que encaje (128, 256, 512, 1.024, 2.048 o 4.096), y la ruta de imagen tiene una capacidad separada de 256 tokens, de los cuales 64 corresponden a la imagen (una única PNG o JPEG redimensionada a 384×384 con relleno blanco). Se preserva la ventana de atención deslizante de 512 tokens en las capas de texto correspondientes.

Su relevancia es acotada pero concreta: permite ejecutar decisiones tipadas sobre un modelo multimodal directamente en el ecosistema Apple (Swift 6, macOS 15+ o iOS 18+), sin runtime de Python ni ficheros separados de tokenizador o adaptadores. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, un tamaño de 4,8 GB y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Exportación Core ML de google/gemma-4-E2B-it; arquitectura interna del modelo base: no disponible |
| Parámetros totales | no disponible (el sufijo "E2B" de la familia Gemma se asocia a parámetros efectivos, pero no se publica la cifra para este checkpoint) |
| Parámetros activos | no disponible |
| Longitud de contexto | 4.096 tokens de texto (selección de bucket: 128, 256, 512, 1.024, 2.048 o 4.096); ruta de imagen con 256 tokens de capacidad, 64 de ellos de imagen |
| Tipos de cuantización | Paletas de pesos de 8 bits por tensor (LUT weight compression) con cómputo en FP32; algunos tensores permanecen en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` de Core ML (`gemma-4-e2b-it-lut8-tensor-swev-l4096-k16.mlpackage`), distribuido como directorio completo |

Otros datos del paquete:

| Parámetro | Valor |
|---|---|
| Tamaño del repositorio | 4,8 GB |
| Versión de exportación | 0.3.0 |
| Esquema de Swev requerido | 2.0 |
| Tipos de pregunta soportados | `choice`, `score`, `noul` |
| Límites por petición | Hasta 16 opciones de respuesta por pregunta y 64 preguntas por petición, evaluadas de forma independiente |
| Entrada de imagen | Una única PNG o JPEG redimensionada a 384×384 con relleno blanco (aspect-fit) |
| Modalidades omitidas | Audio y vídeo; tampoco se incluye la ventana de contexto completa del modelo de origen |
| Runtime | Swift 6, macOS 15+ o iOS 18+ |
| Modelo base | google/gemma-4-E2B-it (revisión `3e22461f65e8`) |

## Arquitectura y entrenamiento

Se trata de una conversión, no de un entrenamiento. El autor parte del checkpoint `google/gemma-4-E2B-it` y lo exporta a Core ML manteniendo las rutas de texto y de visión, restringiendo la salida a los logits de las etiquetas candidatas y eliminando la ruta de audio. En las capas de texto correspondientes se conserva la ventana de atención deslizante de 512 tokens del modelo de origen. La compresión aplicada es una paletización LUT (tablas de búsqueda) de 8 bits por tensor, con cómputo en FP32; el autor aclara explícitamente que esto es compresión de pesos LUT y no aritmética NVFP4/NVFP8 de NVIDIA.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base usó RLHF, DPO u otra fase de alineamiento. Tampoco se documentan innovaciones de decodificación (por ejemplo, decodificación especulativa) en esta exportación; de hecho, el modelo no decodifica texto libre, sino que emite probabilidades sobre opciones predefinidas. El tokenizador, el formato de entrada y los ajustes de inferencia van empaquetados dentro del propio `.mlpackage`, por lo que no se necesitan ficheros de tokenizador o adaptadores adicionales.

La herramienta de conversión y el contrato del paquete están documentados en la guía de conversión y la referencia de esquema de Swev, enlazadas más abajo.

## Capacidades

- Clasificación por elección: dado un estado y una pregunta con hasta 16 opciones, devuelve la opción seleccionada y sus probabilidades.
- Puntuación ordinal: modo `score`, para asignar una puntuación ordenada a una entrada respecto a un criterio definido en tiempo de ejecución.
- Decisión booleana: modo `noul`, que responde sí/no a una instrucción (por ejemplo, "¿es un alimento comestible?").
- Evaluación por lotes de decisiones: hasta 64 preguntas por petición, evaluadas de forma independiente.
- Entrada multimodal limitada: texto más una única imagen (PNG o JPEG, 384×384 con relleno blanco); las peticiones solo de texto omiten el grafo de visión.
- Ejecución local sin Python: el paquete se carga desde Swift con el framework Swev, con caché de descarga local.
- No genera texto libre: la salida se restringe a los logits de las etiquetas candidatas.
- No soporta audio, vídeo ni múltiples imágenes.
- No hay información publicada sobre capacidades multilingües, tool calling, function calling ni razonamiento multi-paso en esta exportación.

## Casos de uso

- Clasificación de contenido en aplicaciones iOS o macOS: el modelo recibe un texto (o una imagen y un texto) y devuelve una etiqueta entre un conjunto cerrado de categorías, con probabilidades asociadas, sin salir del dispositivo.
- Moderación de contenido en el borde: definir preguntas tipo `noul` ("¿este mensaje contiene una amenaza?") y aplicar el resultado como filtro previo antes de enviar el contenido a un servicio remoto.
- Enrutado de intenciones en asistentes: usar el modo `choice` para mapear la entrada del usuario a una de las intenciones soportadas por la aplicación (por ejemplo, consulta de saldo, cambio de plan, soporte técnico) y derivar la petición al flujo correspondiente.
- Validación de formularios y datos: preguntas booleanas sobre campos individuales o sobre el conjunto del formulario, con la ventaja de que hasta 64 preguntas se evalúan de forma independiente en una sola petición.
- Decisión sobre imágenes capturadas por el usuario: la ruta de visión permite responder preguntas cerradas sobre una foto (por ejemplo, si el producto fotografiado coincide con la categoría declarada), con la limitación de una sola imagen a 384×384.
- Puntuación ordinal de candidatos: en recuperación de información o ranking de respuestas, usar el modo `score` para ordenar candidatos según un criterio definido en tiempo de ejecución, sin necesidad de un servicio de inferencia remoto.
- Automatizaciones personales en el ecosistema Apple: atajos o apps que necesiten una decisión tipada local (por ejemplo, clasificar un correo entrante en una bandeja concreta) manteniendo los datos en el dispositivo.
- Prototipado de pipelines de decisión: dado que el formato de salida es estructurado y las preguntas se definen en el código, resulta adecuado para iterar rápidamente sobre la lógica de decisión antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "la capacidad exportada no es una garantía de precisión en la tarea" y recomienda evaluar el checkpoint con las entradas propias de cada caso de uso.

## Requisitos de hardware

- Almacenamiento y memoria: el paquete ocupa 4,8 GB en disco. Como estimación orientativa (no confirmada por el autor), la carga del modelo requiere del orden de esa misma cifra de memoria unificada en el dispositivo, más el espacio de trabajo del runtime.
- GPU y aceleradores: la exportación está validada localmente en macOS con Core ML en modo solo CPU. El soporte de unidades de cómputo adicionales (ANE, GPU) depende del dispositivo, según indica el propio autor.
- Cabe en hardware de consumo: sí, en equipos Apple con memoria unificada suficiente. No hay datos publicados sobre el comportamiento en GPUs NVIDIA ni sobre VRAM en tarjetas discretas, ya que el formato Core ML no está pensado para ese entorno.
- Opciones de despliegue: Core ML a través de la librería Swev (Swift Package), en macOS 15+ o iOS 18+. No requiere runtime de Python. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es `.mlpackage`.
- Latencia y throughput: no disponibles. El único dato operativo aportado es que mantener el modelo residente evita la recompilación e inicialización en cada petición, y que la primera llamada descarga el paquete.

## Comparativa con modelos similares

No hay datos publicados de benchmarks ni de parámetros que permitan comparar este modelo con alternativas de la misma categoría. La comparación posible se limita al propio linaje del paquete:

| Aspecto | Esta exportación | google/gemma-4-E2B-it (origen) | Alternativas comparables |
|---|---|---|---|
| Formato | `.mlpackage` Core ML | Pesos del checkpoint original | No disponible |
| Precisión de pesos | Paletas LUT de 8 bits por tensor, cómputo FP32 | No disponible | No disponible |
| Salida | Restringida a logits de etiquetas candidatas (`choice`, `score`, `noul`) | Generación del modelo original | No disponible |
| Contexto | 4.096 tokens de texto; 256 tokens en la ruta de imagen | No disponible (la exportación no incluye la ventana completa) | No disponible |
| Ruta de audio | Omitida | No disponible | No disponible |
| Licencia | Apache 2.0 | No disponible en la información facilitada | No disponible |
| Mantenimiento | Exportación independiente, no oficial | Modelo oficial de Google | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre. Cualquier caso de uso que requiera respuestas abiertas queda fuera del alcance de esta exportación.
- Contexto recortado: la ventana útil es de 4.096 tokens y el autor advierte de que la ventana de contexto completa del modelo de origen no está incluida.
- Ruta de visión muy limitada: una sola imagen, 384×384, 256 tokens de capacidad (64 para la imagen) y sin soporte de audio ni vídeo.
- La precisión en la tarea no está garantizada por el hecho de que el paquete funcione: hay que evaluar el checkpoint con datos propios.
- Riesgo de alucinación: aunque la salida se restringe a las opciones proporcionadas, la asignación de probabilidades puede ser errónea; conviene fijar umbrales de confianza y manejar el caso de baja certeza.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni sobre cómo la paletización de 8 bits afecta a la equidad o a la calibración de las probabilidades.
- Idiomas: no se especifican los idiomas soportados en esta exportación.
- Compatibilidad restringida: requiere Swift 6, macOS 15+ o iOS 18+, y una versión de Swev que soporte el esquema 2.0. No es desplegable en entornos Linux, Windows ni en infraestructura basada en GPUs NVIDIA.
- Licencia: Apache 2.0. La propia model card aclara que se trata de una exportación independiente compatible con Swev y no de un lanzamiento oficial de los autores del modelo original; conviene revisar también los términos aplicables al modelo base.
- Madurez: el repositorio registra 0 descargas y 0 "likes", y la exportación está en versión 0.3.0, por lo que el soporte y la validación en producción son limitados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danielamitay/gemma-4-e2b-it-lut8-tensor-swev
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Revisión fijada del modelo base: https://huggingface.co/google/gemma-4-E2B-it/tree/3e22461f65e89153144f8adb70e3b8c2cc9845a7
- Librería Swev: https://github.com/danielamitay/swev
- Documentación de carga y caché en HuggingFace: https://github.com/danielamitay/swev/blob/main/docs/huggingface.md
- Documentación de modelos soportados: https://github.com/danielamitay/swev/blob/main/docs/models.md
- Guía de conversión: https://github.com/danielamitay/swev/blob/main/docs/conversion.md
- Referencia del esquema: https://github.com/danielamitay/swev/blob/main/docs/schema.md
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.

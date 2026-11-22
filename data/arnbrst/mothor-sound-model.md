# arnbrst/mothor-sound-model

## Resumen

Mothor sound model es una conversión a Core ML del modelo CLAP `laion/larger_clap_general` de LAION, publicada por el usuario arnbrst. No se trata de un modelo de lenguaje generativo, sino de un modelo de recuperación audio-texto (audio-text retrieval): proyecta audio y texto a un espacio latente compartido de 512 dimensiones, lo que permite buscar sonidos en una biblioteca mediante descripciones en lenguaje natural, encontrar sonidos similares por embedding y generar etiquetas semánticas. La conversión está pensada para ejecutarse íntegramente en local en un Mac dentro de la aplicación Mothor.

El paquete incluye dos torres separadas: una torre de audio (HTSAT + proyección) con pesos cuantizados a int8 y batch fijo de 1, que consume una ventana de log-mel de 10 segundos con forma (1, 1, 1001, 64) y produce un embedding de 512 dimensiones; y una torre de texto (RoBERTa + proyección) en float16 con longitud fija de 77 tokens y máscara, que produce también un embedding de 512 dimensiones. El front end de mel (48 kHz, 64 mels Slaney, ventana Hann de 1024, hop 480, ventanas de 10 s con zero-padding) no forma parte de los modelos Core ML y se ejecuta en la app.

Su relevancia es acotada pero clara: demuestra una ruta de conversión reproducible de CLAP a Core ML con pérdida de fidelidad mínima (coseno ≥ 0,9996 en audio y ≥ 0,9999 en texto respecto a los embeddings de PyTorch) y con licencia Apache-2.0, lo que facilita integrar búsqueda semántica de audio en aplicaciones macOS sin depender de servicios en la nube. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no se han publicado benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: audio HTSAT (transformer jerárquico con atención por ventanas) + proyección; texto RoBERTa + proyección; espacio compartido de 512 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; texto de longitud fija 77 tokens; audio en ventanas fijas de 10 s |
| Tipos de cuantizacion | Torre de audio int8 (pesos lineales); torre de texto float16 |
| Idiomas soportados | no disponible (el texto se procesa con el tokenizador RoBERTa del modelo base; el modelo card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlmodelc`); no se distribuyen safetensors ni GGUF |
| Modelo base | laion/larger_clap_general (revisión `ada0c23a36c4e8582805bb38fec3905903f18b41`) |
| Entrada de audio | log-mel (1, 1, 1001, 64), ventana de 10 s, batch fijo 1 |
| Entrada de texto | 77 tokens con máscara, batch fijo |
| Dimensión de embedding | 512 |
| Tamaño del repositorio | 0,3 GB |
| Librería | coreml |

## Arquitectura y entrenamiento

El modelo es una conversión, no un reentrenamiento: el autor indica explícitamente que no se reentrenó ningún peso. La arquitectura subyacente es CLAP (Contrastive Language-Audio Pretraining) en la variante `larger_clap_general` de LAION, compuesta por una torre de audio HTSAT con proyección y una torre de texto RoBERTa con proyección, alineadas mediante un objetivo contrastivo audio-texto. No se dispone de datos sobre el número de tokens, la composición del dataset de entrenamiento original ni si hubo etapas de ajuste fino adicionales; esa información corresponde al modelo base y no se detalla en la información proporcionada.

La innovación técnica de esta publicación está en el proceso de conversión con coremltools. Para poder exportar el grafo se reescribieron varias operaciones sin alterar los resultados: el resize bicúbico se sustituyó por una matriz fija, la partición y reconstrucción de ventanas se expresó en rango 5, el adaptive average pooling se reemplazó por una media y la máscara de atención se convirtió en aditiva. La torre de audio se cuantizó a int8 en los pesos lineales, con una similitud coseno de al menos 0,9996 frente a los embeddings de PyTorch en el conjunto de prueba del autor; la torre de texto se mantuvo en float16, con coseno de al menos 0,9999. El front end de mel queda fuera de los modelos exportados y debe implementarse en la aplicación anfitriona con los parámetros indicados (48 kHz, 64 mels Slaney, Hann 1024, hop 480, ventanas de 10 s con zero-padding).

## Capacidades

- Recuperación audio-texto: genera embeddings de audio y de texto en un espacio compartido de 512 dimensiones, lo que permite puntuar la similitud entre una descripción textual y un clip de audio.
- Búsqueda de sonidos por descripción en lenguaje natural dentro de una biblioteca de samples.
- Búsqueda de sonidos similares a partir de un audio de consulta, comparando embeddings de audio.
- Etiquetado semántico de sonidos (sound tags) derivado de la similitud con descripciones.
- Extracción de embeddings de audio en ventanas fijas de 10 segundos, con batch fijo de 1.
- Extracción de embeddings de texto con longitud fija de 77 tokens y máscara de atención.
- Ejecución local en macOS mediante Core ML, sin llamadas a servicios externos.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni razonamiento multi-paso: es un modelo de representación, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en bibliotecas de samples: indexar los embeddings de audio de cada clip de 10 s y consultar con una descripción textual; la similitud en el espacio de 512 dimensiones devuelve los sonidos más afines sin necesidad de metadatos manuales.
- Recomendación de sonidos similares: dado un sample de referencia, calcular su embedding de audio y recuperar los vecinos más cercanos del índice, útil en navegadores de librerías de producción musical.
- Etiquetado automático de samples: comparar el embedding de cada clip contra un vocabulario de descripciones y asignar las etiquetas con mayor similitud, reduciendo el trabajo manual de catalogación.
- Organización de archivos de audio en aplicaciones de escritorio: clasificar y agrupar grabaciones de campo, efectos o instrumentos por contenido sonoro en lugar de por nombre de archivo.
- Prototipado de interfaces de búsqueda por voz o texto en macOS: al ejecutarse como Core ML con cuantización int8 en la torre de audio, el coste de inferencia es bajo y no requiere GPU dedicada ni conexión de red.
- Sincronización de audio con material visual: recuperar efectos de sonido que coincidan con una descripción de escena para herramientas de edición, usando la búsqueda texto-audio como paso de selección.
- Evaluación de pipelines de conversión Core ML: servir como referencia reproducible para verificar que una exportación de CLAP mantiene la fidelidad de embeddings (coseno ≥ 0,9996) antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de fidelidad de la conversión frente a los embeddings de PyTorch del modelo base: similitud coseno ≥ 0,9996 para la torre de audio cuantizada a int8 y ≥ 0,9999 para la torre de texto en float16, medidas sobre su conjunto de prueba. No se proporcionan cifras de latencia, throughput ni resultados en tareas estándar de recuperación audio-texto.

## Requisitos de hardware

- Al ser modelos Core ML, la inferencia está pensada para ejecutarse en hardware Apple (CPU, GPU o Neural Engine según la configuración de Core ML); no se distribuyen pesos en formatos para CUDA.
- El repositorio ocupa 0,3 GB, lo que sugiere un modelo compacto que cabe holgadamente en la memoria unificada de cualquier Mac reciente.
- VRAM estimada: no disponible. No se publican requisitos de memoria ni el número de parámetros del modelo base.
- GPU recomendadas: no disponibles; el destino declarado es macOS con Core ML, no A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; el modelo está diseñado para Mac, no para GPU NVIDIA.
- Opciones de despliegue: Core ML (`coremltools`, modelos `.mlmodelc`); no se ofrecen variantes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Contexto de entrada | Licencia | Formatos |
|---|---|---|---|---|---|
| arnbrst/mothor-sound-model | CLAP convertido a Core ML | 512 d | 10 s de audio; 77 tokens de texto | Apache-2.0 | Core ML |
| laion/larger_clap_general | CLAP original en PyTorch | 512 d | ventanas de audio; texto tokenizado | Apache-2.0 | PyTorch (safetensors/bin) |
| Otros modelos de retrieval audio-texto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: esta publicación no cambia la arquitectura ni los pesos, solo el formato y la precisión (int8 en audio, float16 en texto), con la contrapartida de batch fijo 1, longitudes fijas y dependencia exclusiva del ecosistema Core ML. No se dispone de información sobre alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings para recuperación y similitud.
- Batch fijo de 1 en la torre de audio y longitud fija de 77 tokens en la de texto, lo que limita el procesamiento por lotes y exige trocear el audio en ventanas de 10 s.
- El front end de mel no está incluido: una implementación incorrecta en la app (frecuencia de muestreo, número de mels, hop o padding) degradará los embeddings sin que el modelo lo detecte.
- La cuantización int8 de la torre de audio introduce una pérdida mínima pero no nula (coseno ≥ 0,9996 en el conjunto de prueba del autor); conviene validar con datos propios antes de producción.
- No se declara lista de idiomas soportados; el comportamiento multilingüe depende del tokenizador y del entrenamiento del modelo base y no está documentado aquí.
- No se han publicado benchmarks de recuperación ni evaluaciones de sesgo; se desconoce el riesgo de alucinación en el etiquetado, que en la práctica se manifiesta como etiquetas semánticamente plausibles pero incorrectas.
- Dependencia de Core ML: el despliegue queda restringido a plataformas Apple; no hay pesos en safetensors ni GGUF para otros runtimes.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución; debe conservarse el aviso de licencia y el reconocimiento a LAION como autor original, según la sección 4(b) citada por el autor.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arnbrst/mothor-sound-model
- Modelo base: https://huggingface.co/laion/larger_clap_general
- Revisión del modelo base citada: `ada0c23a36c4e8582805bb38fec3905903f18b41`
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- coremltools: https://github.com/apple/coremltools
- Paper de CLAP (LAION): no disponible en la información proporcionada
- Repositorio o demo de la app Mothor: no disponible en la información proporcionada

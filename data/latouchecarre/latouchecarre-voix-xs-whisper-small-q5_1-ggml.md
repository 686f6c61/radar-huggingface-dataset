# LaToucheCarre/LaToucheCarre-Voix-XS-Whisper-Small-Q5_1-GGML

## Resumen

LaToucheCarre-Voix-XS-Whisper-Small-Q5_1-GGML es una redistribución en formato GGML del modelo `ggml-small-q5_1.bin` publicado por el proyecto whisper.cpp, que a su vez es una conversión del modelo `openai/whisper-small`. Es decir, no se trata de un modelo entrenado o afinado por el autor: la model card indica explícitamente que es una copia conforme, con la misma huella SHA-256 que el fichero original y sin ningún peso modificado. El repositorio existe únicamente para dar una dirección de descarga y un nombre estables al escalón "XS" del producto de dictado de La Touche Carré, un asistente de escritura para Windows que ejecuta la transcripción y la corrección en local, sin enviar audio ni texto a ningún servidor.

El modelo resuelve un problema muy concreto: la dictación mixta francés-inglés. El autor documenta que el escalón anterior (`base q5_1`) descartaba por completo una dictación en francés cuando el audio empezaba con unos segundos de inglés; el modelo `small`, con 244 millones de parámetros, mantiene el contenido francés intacto y reduce los errores ortográficos de 24 a 6 en sus pruebas internas. Con 190 MB en disco y 457 MB de VRAM según las mediciones del autor, es un modelo de reconocimiento automático de voz (ASR) pensado para ejecutarse en hardware modesto, incluso sin GPU dedicada.

Su relevancia práctica es doble: por un lado, demuestra que el salto de `base` a `small` corrige fallos de code-switching que afectan a flujos de dictado reales; por otro, es un ejemplo de empaquetado cuantizado (Q5_1) de un modelo MIT para despliegue local con requisitos de memoria por debajo de 0,5 GB. Las descargas y los "likes" del repositorio son cero en el momento de la consulta, por lo que se trata de un artefacto de producto, no de un modelo con comunidad propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 12 bloques de encoder y 12 de decoder, d_model 768, 12 cabezas de atención (datos del modelo base `openai/whisper-small`) |
| Parámetros totales | 244 M aproximadamente (heredados de `openai/whisper-small`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (espectrograma log-Mel de 80 canales, 3000 frames, muestreo a 16 kHz); secuencia de decoder de hasta 448 tokens |
| Tipos de cuantización | Q5_1 (5 bits por peso más escala y mínimo por bloque de 32, equivalente a unos 6 bits por peso, ~183 MB para 244 M de parámetros). whisper.cpp ofrece otros niveles (Q4_0, Q4_1, Q5_0, Q8_0, fp16) del mismo modelo base |
| Idiomas soportados | Francés e inglés declarados en la model card; el modelo base es multilingüe (99 idiomas), pero el uso previsto y medido es fr/en |
| Licencia | MIT |
| Formato de pesos | GGML, fichero único `.bin` para whisper.cpp |

## Arquitectura y entrenamiento

El artefacto es una copia bit a bit del `ggml-small-q5_1.bin` de ggerganov/whisper.cpp; por tanto, su arquitectura y su entrenamiento son los del modelo base `openai/whisper-small`: un transformer encoder-decoder de 244 M de parámetros que consume espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos y genera texto token a token con tokens especiales de idioma, tarea y marcas de tiempo. Whisper fue entrenado por OpenAI con aprendizaje supervisado sobre aproximadamente 680 000 horas de audio débilmente etiquetado, con una porción relevante de audio no inglés y de datos de traducción hacia inglés. No hay RLHF ni DPO en la receta: el objetivo es entropía cruzada sobre transcripciones, lo que explica tanto su robustez ante ruido y acentos como su tendencia a "inventar" subtítulos sobre silencio.

La única transformación aplicada es la cuantización a Q5_1 en formato GGML, que reduce el peso en disco a 190 MB según el autor (el repositorio ocupa 0,2 GB) y permite inferencia en CPU, con o sin aceleración Vulkan. No hay innovaciones técnicas adicionales: no se emplea decodificación especulativa, atención lineal ni mecanismos híbridos SSM. El único ajuste operativo documentado es el uso obligatorio de detección de actividad de voz (VAD) con Silero v5.1.2 y una parametrización concreta (`--vad -vm ggml-silero-v5.1.2.bin -vo 0.3 -vp 200 -vsd 300 -vmsd 28`), que hace que el decoder reciba únicamente segmentos hablados y devuelva salida vacía cuando nadie habla.

## Capacidades

- Reconocimiento automático de voz (ASR) en francés e inglés con un único modelo, sin pipeline externo de detección de idioma.
- Transcripción de dictado continuo con puntuación y mayúsculas aprendidas, apta para entrada de texto en aplicaciones de escritura.
- Tolerancia a code-switching fr/en: según las pruebas del autor, mantiene íntegra una dictación francesa precedida de cinco segundos de inglés.
- Generación de marcas de tiempo por segmento, lo que permite subtitulado sincronizado.
- Integración con detección de actividad de voz (Silero v5.1.2) para evitar alucinaciones sobre silencio o ruido de fondo.
- Ejecución totalmente local en CPU o GPU mediante whisper.cpp, sin llamadas a servicios externos.
- Compatible con decodificación incremental en streaming a través de whisper.cpp (procesamiento por ventanas de 30 s).
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni de razonamiento multi-paso; es un modelo puramente de transcripción.
- No tiene capacidades de visión, audio-vision ni generación de audio.
- No es un modelo de propósito general: no genera texto libre, código ni respuestas a preguntas fuera del contexto de transcripción (aunque hereda cierta capacidad de traducción fr→en del modelo base, no está validada por el autor).

## Casos de uso

- Dictado por voz en aplicaciones de escritura de escritorio: La Touche Carré lo usa como escalón "XS" para convertir voz en texto dentro de Windows, con corrección posterior en local; los 457 MB de VRAM medidos permiten ejecutarlo junto al resto de la aplicación en equipos de gama media.
- Subtitulado automático de vídeo: las marcas de tiempo por segmento y la ventana de 30 s permiten generar ficheros SRT o VTT en francés e inglés sin servicios en la nube, con el VAD configurado para no emitir subtítulos sobre silencio.
- Transcripción de notas de voz y reuniones bilingües fr/en: el modelo sostiene conversaciones con cambios de idioma frecuentes, que es precisamente el escenario donde el escalón `base` fallaba según las mediciones del autor.
- Procesamiento por lotes de audio en servidores sin GPU: con 190 MB en disco y ejecución en CPU, se puede transcribir un archivo de audio largo por división en ventanas en máquinas virtuales pequeñas, entornos de CI o contenedores con pocos recursos.
- Aplicaciones con requisitos estrictos de privacidad: al no salir el audio de la máquina, encaja en sectores (sanitario, legal, administración pública) donde no se permite enviar grabaciones a APIs externas; la revisión humana sigue siendo necesaria por el 9,3 % de error de palabra medido.
- Prototipado y pruebas de regresión de ASR: sirve como referencia ligera y verificable (huella SHA-256 fija) para comparar cuantizaciones y configuraciones de VAD en pipelines de evaluación, gracias a su licencia MIT y a su tamaño reducido.
- Despliegue en dispositivos de borde o hardware antiguo: al caber en menos de 0,5 GB de memoria y funcionar en CPU con Vulkan opcional, es viable en mini-PC, portátiles sin GPU dedicada o entornos embebidos con x86/ARM.
- Asistencia a la lectura y accesibilidad: transcripción de audiolibros o apuntes personales en francés, uno de los dominios que el autor incluye en su banco de pruebas (lectura personal y FLEURS).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (LibriSpeech, Common Voice, FLEURS en cifras de WER) en la información disponible. El autor aporta únicamente mediciones internas sobre un banco propio de 8 extractos de audio y 860 palabras de referencia, ejecutado en un Ryzen 7 7800X3D con RTX 5090 y Vulkan:

| Métrica (banco interno del autor) | Whisper small Q5_1 | Whisper base Q5_1 | Paliers superiores (referencia) |
|---|---|---|---|
| Palabras correctas | 90,7 % | No disponible | 95-96 % |
| Errores ortográficos detectados | 6 | 24 | No disponible |
| Audio con inglés inicial seguido de francés | Conserva la dictación francesa | Descarta la totalidad de la dictación francesa | No disponible |
| VRAM | 457 MB | No disponible | No disponible |

Composición del banco: dictado doméstico, lectura personal, FLEURS y VoxPopuli, más cuatro pruebas de robustez (silencio, soplo de aire, inglés y arranque en inglés seguido de francés). Los conjuntos FLEURS y VoxPopuli se citan como fuentes de audio, no como resultados publicados. No se han divulgado cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: 457 MB con la cuantización Q5_1, según la medición del autor (RTX 5090, Vulkan).
- Espacio en disco: 190 MB para el fichero de pesos; 0,2 GB de repositorio en HuggingFace.
- GPU recomendadas: cualquier GPU con soporte Vulkan, incluida la RTX 5090 usada en las pruebas. No se requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida; 457 MB es un requisito inferior al de la mayoría de modelos de lenguaje pequeños.
- Ejecución en CPU: viable, ya que el formato GGML está diseñado para inferencia en CPU; el autor no publica cifras de velocidad en CPU.
- Aceleración opcional: Vulkan (probado), además de los backends que soporta whisper.cpp (Metal, CUDA, OpenCL, SYCL según compilación).
- Opciones de despliegue: CLI de whisper.cpp, servidor de whisper.cpp, bindings de Python (pywhispercpp), Rust, Go y otros sobre la misma librería. Ollama y vLLM no soportan este formato ni esta tarea.
- Requisito de configuración: VAD con Silero v5.1.2 y los parámetros indicados por el autor (`-vo 0.3 -vp 200 -vsd 300 -vmsd 28`) para evitar alucinaciones sobre silencio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| LaToucheCarre-Voix-XS-Whisper-Small-Q5_1-GGML | 244 M (Q5_1, ~183 MB) | 30 s de audio, decoder de 448 tokens | fr, en (base multilingüe) | MIT | HuggingFace, 0 descargas | Copia verificable del GGML de whisper.cpp |
| openai/whisper-small | 244 M | 30 s de audio, decoder de 448 tokens | Multilingüe (99 idiomas) | MIT | HuggingFace, ampliamente usado | Pesos en safetensors/PyTorch; requiere transformers y mucha más memoria que la versión GGML |
| ggerganov/whisper.cpp (`ggml-small-q5_1.bin`) | 244 M | 30 s de audio | Multilingüe | MIT | GitHub y HuggingFace | Origen exacto del fichero redistribuido; mismo SHA-256 |
| Whisper base Q5_1 (`ggml-base-q5_1.bin`) | 74 M aproximadamente | 30 s de audio | Multilingüe | MIT | whisper.cpp | Escalón sustituido por el autor: descartaba la dictación francesa tras un arranque en inglés y producía 24 errores ortográficos frente a 6 |
| Parakeet (NVIDIA, familia TDT) | No disponible en la información proporcionada (el autor lo sitúa por encima de 750 MB de VRAM) | No disponible | No disponible | No disponible | No disponible | El autor lo recomienda como alternativa cuando hay más de 750 MB de VRAM disponibles |

No se dispone de comparativas con modelos ASR de otros tamaños (medium, large-v3) dentro de la información proporcionada más allá de la referencia genérica del 95-96 % de precisión en los escalones superiores de Whisper.

## Limitaciones y advertencias

- Precisión limitada: el 90,7 % de palabras correctas medido por el autor implica aproximadamente un 9,3 % de error de palabra, superior al 4-5 % de los escalones superiores. No es adecuado para transcripción legal, médica o administrativa sin revisión humana.
- Alucinación sobre silencio: sin VAD, el modelo genera texto inexistente, típicamente plantillas de subtitulado aprendidas en el entrenamiento del tipo "Subtítulos realizados por la comunidad de Amara.org". Es un fallo conocido y documentado en la propia model card.
- Dependencia de la configuración de VAD: márgenes demasiado cortos alrededor de los segmentos recortan los ataques de las palabras, lo que degrada la transcripción incluso con el detector activo.
- Idiomas declarados: solo francés e inglés. Aunque el modelo base es multilingüe, no hay garantía de calidad fuera de esos dos idiomas y el autor no ha medido otros.
- Code-switching parcialmente resuelto: el modelo `small` conserva la dictación francesa tras un arranque en inglés, pero se trata de una prueba cualitativa sobre un único caso, no de una evaluación sistemática.
- Ventana fija de 30 segundos: los audios largos dependen de la lógica de segmentación del cliente; una segmentación incorrecta puede cortar palabras en las fronteras.
- Sin fine-tuning ni personalización: es una copia sin modificar, por lo que hereda los sesgos acústicos y léxicos del corpus de entrenamiento de Whisper, que está sesgado hacia cierto tipo de audio (locución limpia, dominio público, lectura).
- Licencia MIT: permite uso comercial y modificación sin restricciones más allá de conservar el aviso de copyright, tanto en este repositorio como en el modelo base de OpenAI.
- Madurez y soporte: 0 descargas y 0 "likes" en el momento de la consulta, sin pruebas automatizadas ni historial de mantenimiento en HuggingFace. La verificación de integridad depende de comparar la huella SHA-256 con el fichero original de whisper.cpp.
- Ausencia de benchmarks reproducibles: las cifras de la model card provienen de un banco privado de 860 palabras y no permiten comparación directa con WER publicados en LibriSpeech o Common Voice.
- Fecha de creación anómala (septiembre de 2026) en los metadatos del repositorio, lo que conviene tener en cuenta si se automatiza la verificación de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Voix-XS-Whisper-Small-Q5_1-GGML
- Modelo base: https://huggingface.co/openai/whisper-small
- Origen de los pesos GGML: https://huggingface.co/ggerganov/whisper.cpp
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Producto del autor: https://latouchecarre.fr
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- VAD Silero: https://github.com/snakers4/silero-vad
- Los resultados de la búsqueda web proporcionados no contienen enlaces relevantes al modelo: todas las entradas devueltas corresponden a un restaurante en Fishkill (Nueva York) y no guardan relación con el artefacto.

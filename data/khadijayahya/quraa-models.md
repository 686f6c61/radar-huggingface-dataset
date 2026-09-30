# KhadijaYahya/quraa-models

## Resumen
Quraa-models es un paquete de artefactos de reconocimiento de locutor orientado a la identificación de recitadores del Corán, publicado por el usuario KhadijaYahya en Hugging Face. No es un modelo de lenguaje ni un sistema de generación de texto: se trata de un export a ONNX del checkpoint ECAPA-TDNN de SpeechBrain (`speechbrain/spkrec-ecapa-voxceleb`), acompañado de una galería de huellas de voz medias para 199 recitadores y una proyección LDA para su comparación. El problema que resuelve es concreto: dada una ventana de audio de 6 segundos a 16 kHz mono, devolver un embedding de 192 dimensiones que permita determinar a qué recitador registrado corresponde la voz.

El interés técnico del paquete está en su orientación a inferencia en el navegador. La model card indica que el cálculo de la STFT se ha reimplementado con capas Conv1d para que el grafo pueda ejecutarse con onnxruntime-web, es decir, sin backend nativo ni GPU. La galería se construyó promediando embeddings por conjunto de grabaciones procedentes de mp3quran.net y everyayah.com; el repositorio solo incluye los embeddings derivados, no los audios originales.

Se trata de un repositorio pequeño (0,1 GB), sin descargas ni valoraciones registradas en el momento de la consulta y creado el 29 de septiembre de 2026, por lo que no existe validación independiente de la comunidad ni resultados de evaluación publicados. Su licencia es Apache-2.0, pero esa licencia cubre los artefactos derivados, no las grabaciones de referencia utilizadas para construir la galería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (SpeechBrain), exportada a ONNX |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica; ventana fija de audio de 6 s (96.000 muestras) a 16 kHz mono |
| Tipos de cuantizacion | no disponible; el export es un grafo ONNX en float32 |
| Idiomas soportados | no disponible (las grabaciones de referencia son recitaciones del Coran en arabe) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`ecapa.onnx`) mas galeria en `gallery.bin` y `gallery.json` |
| Dimension del embedding | 192 |
| Entrada | `wav` float32, forma `[batch, 96000]` |
| Galeria | 199 recitadores, una huella media por conjunto de grabaciones, con proyeccion LDA |
| Libreria declarada | speechbrain |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento
La arquitectura es ECAPA-TDNN, un modelo de reconocimiento de locutor basado en redes convolucionales con atención de canal y agregación estadística de múltiples capas. El paquete no entrena esta red desde cero: parte del checkpoint `speechbrain/spkrec-ecapa-voxceleb`, cuyo nombre indica entrenamiento sobre VoxCeleb, y lo exporta a ONNX con una modificación relevante: la STFT se implementa mediante capas Conv1d para que el grafo sea compatible con onnxruntime-web. La salida es un vector de 192 dimensiones que actúa como huella de voz.

Sobre ese export se construye la capa específica del dominio coránico. Para cada recitador se promedian los embeddings de su conjunto de grabaciones, obteniendo una huella representativa, y se añade una proyección LDA para la comparación. No se documentan en la información disponible ni el número de tokens de audio de entrenamiento, ni la composición exacta del dataset, ni si hubo ajuste fino sobre el checkpoint base o solo extracción de embeddings y agregación. Tampoco se especifica la métrica de comparación (por ejemplo, similitud coseno) empleada sobre la proyección LDA.

## Capacidades
- Extracción de embeddings de locutor de 192 dimensiones a partir de audio de 6 segundos, 16 kHz, mono.
- Identificación de recitador restringida al conjunto cerrado de 199 voces incluidas en la galería.
- Verificación de locutor (comparar si dos segmentos corresponden a la misma voz) mediante comparación de embeddings.
- Inferencia en el navegador a través de onnxruntime-web, sin backend nativo y sin GPU.
- Proyección LDA precalculada para reducir la dimensionalidad de los embeddings antes de la comparación.
- No dispone de generación de texto, razonamiento, código ni matemáticas: no es un modelo de lenguaje.
- No soporta tool calling, function calling ni comportamiento de agente.
- No se documentan capacidades multilingües ni transcripción de audio; el modelo identifica voces, no reconoce contenido hablado.
- No se documentan capacidades de visión ni de audio más allá del embedding de locutor.

## Casos de uso
- Identificación del recitador en aplicaciones de recitación coránica: la app Quraa envía bloques de 6 s a `ecapa.onnx`, obtiene el embedding y lo compara con la galería para mostrar qué recitador está sonando.
- Atribución de autoría en archivos de audio: al indexar grabaciones descargadas de mp3quran.net o everyayah.com, el modelo permite asignar automáticamente cada pista al recitador correspondiente de los 199 registrados.
- Construcción de buscadores por recitador: los embeddings sirven como clave de agrupación para organizar catálogos de recitaciones y permitir filtrado por voz.
- Detección de duplicados en catálogos: dos entradas con embeddings muy próximos y mismo recitador asignado pueden marcarse como posibles duplicados para revisión manual.
- Verificación de suplantación en plataformas de contenido: comprobar si una subida atribuida a un recitador concreto es consistente con su huella de referencia antes de publicarla.
- Moderación y control de calidad de subidas: descartar envíos cuyo embedding se aleje de todas las voces de la galería, señalando audio no reconocido o de baja calidad.
- Investigación en reconocimiento de locutor en árabe coránico: evaluar la transferencia de un modelo entrenado en VoxCeleb a un dominio muy distinto como la recitación, con una galería cerrada de 199 clases.
- Funcionamiento sin conexión en el cliente: al ejecutarse con onnxruntime-web, la identificación de voz puede hacerse íntegramente en el dispositivo, sin enviar audio a un servidor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- GPU: no requerida. El export está diseñado para onnxruntime-web, lo que implica ejecución en CPU (WASM) dentro del navegador.
- VRAM estimada: no disponible. Como referencia de escala, el repositorio completo ocupa 0,1 GB, incluyendo el grafo ONNX y la galería de 199 recitadores.
- Cabe en cualquier GPU de consumo e, incluso, en equipos sin GPU dedicada; no se han publicado requisitos mínimos de memoria.
- Despliegue: ONNX Runtime (web, Python o C++) cargando `ecapa.onnx` junto con `gallery.bin`/`gallery.json`, o alternativamente SpeechBrain sobre el checkpoint base si se prefiere el grafo original en PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Entrada en producción: segmentar el audio en bloques de exactamente 96.000 muestras (6 s) a 16 kHz mono; el grafo asume esa forma fija.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Entrada | Clases/galeria | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KhadijaYahya/quraa-models | ECAPA-TDNN exportada a ONNX | 192 | 6 s, 16 kHz mono, forma fija [batch, 96000] | 199 recitadores con huella media y proyeccion LDA | Apache-2.0 | Hugging Face, 0 descargas registradas |
| speechbrain/spkrec-ecapa-voxceleb | ECAPA-TDNN | 192 | no disponible en la informacion consultada | reconocimiento de locutor generico, sin galeria de recitadores | Apache-2.0 | Hugging Face (checkpoint base del que deriva este paquete) |
| Rukaya-lab/Quraa_AI | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face, sin informacion adicional en los resultados de busqueda |
| Alternativas especificas de identificacion de recitadores coranicos | no disponible | no disponible | no disponible | no disponible | no disponible | no se han identificado en la busqueda realizada |

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no transcribe recitación. Cualquier uso esperando esas capacidades es un error de categoría.
- Conjunto cerrado: la identificación solo cubre los 199 recitadores presentes en la galería. Una voz no registrada se asignará forzosamente a la clase más próxima salvo que se implemente un umbral de rechazo, que no se documenta.
- Desajuste de dominio: el checkpoint base se denomina VoxCeleb, un corpus de habla general, mientras que el uso objetivo es recitación coránica. No hay métricas publicadas que cuantifiquen esa brecha.
- Ventana rígida: el grafo espera 96.000 muestras (6 s) a 16 kHz mono. Audios más largos requieren segmentación y agregación por parte del desarrollador.
- Riesgo de confusión entre voces similares, especialmente entre recitadores con timbre y estilo próximos; no existen tasas de error publicadas (EER, precisión de identificación top-1) que permitan dimensionar el problema.
- Datos biométricos: los embeddings de voz son identificadores biométricos. Su almacenamiento, cesión o tratamiento en producción tiene implicaciones de privacidad y de protección de datos que deben evaluarse antes de desplegar el sistema.
- Los audios de origen (mp3quran.net y everyayah.com) no se redistribuyen y pertenecen a sus recitadores y editores. La licencia Apache-2.0 cubre los artefactos derivados del repositorio, no el material de referencia empleado para construir la galería.
- Repositorio sin validación externa: cero descargas, cero valoraciones y ausencia de datos de evaluación. No conviene tratarlo como componente crítico sin una validación propia previa.
- No se declara pipeline en Hugging Face ni idiomas soportados, lo que dificulta la integración automática en ecosistemas que dependen de esos metadatos.
- Se desconoce si existe un procedimiento documentado para añadir nuevos recitadores a la galería o para recalcular las huellas medias.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/KhadijaYahya/quraa-models
- Checkpoint base: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Repositorio de la aplicación Quraa: https://github.com/Khadigayahya/quraa
- Fuente de grabaciones citada en la model card: https://mp3quran.net
- Fuente de grabaciones citada en la model card: https://everyayah.com
- quran.ai: https://quran.ai/
- About de QuranAI.org: https://quranai.org/about/
- Quran Lab: https://quranlab.ai/
- Rukaya-lab/Quraa_AI en Hugging Face: https://huggingface.co/Rukaya-lab/Quraa_AI
- awesome-quran-ai (recopilatorio de recursos): https://github.com/tal7aouy/awesome-quran-ai

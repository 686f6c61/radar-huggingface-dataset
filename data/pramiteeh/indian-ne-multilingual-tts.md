# pramiteeh/indian-ne-multilingual-tts

## Resumen

NE-TTS es un modelo de síntesis de voz (text-to-speech) end-to-end publicado en HuggingFace bajo licencia CC-BY-4.0 por el usuario pramiteeh. Cubre 16 lenguas de la India nororiental —tagin, nyishi, angami naga, rongmei naga, chokri naga, ao naga, rengma meridional, karbi, idu mishmi, kok borok, wancho, mizo, nagamés, garo, chakma y sumi— con 23 voces en un único checkpoint multi-hablante y multilingüe, seleccionables por nombre.

Su relevancia está en el nicho: son lenguas de muy bajos recursos, con apenas sistemas de síntesis disponibles. El modelo se ha entrenado desde cero, sin modelo base preentrenado, sobre texto romanizado en minúsculas (sin fonemización). La arquitectura es VITS, que pasa directamente del texto a la forma de onda a 22.050 Hz mono sin vocoder externo. El checkpoint declara 86,5 M de parámetros, de los cuales 39,8 M corresponden al generador que se ejecuta en inferencia; los 46,7 M restantes son el discriminador de entrenamiento, que se conserva en el fichero y explica que la descarga sea de 346 MB.

Se trata de una primera versión (checkpoint del paso 62.000, paso acumulado 208.757) entrenada sobre unas 55 horas de audio (~41.000 clips) derivadas del corpus Vaani. No se han publicado métricas cuantitativas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS end-to-end (texto a forma de onda, sin vocoder separado) |
| Parametros totales | 86,5 M (checkpoint completo, discriminador incluido) |
| Parametros activos | No aplica (no es un modelo MoE). En inferencia se usa el generador: 39,8 M |
| Longitud de contexto | No aplica (modelo TTS con entrada a nivel de carácter); los clips de entrenamiento se limitaron a un máximo de 10 s |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 16 lenguas del noreste de la India: tgj (tagin), njz (nyishi), njm (angami naga), nbu (rongmei naga), nri (chokri naga), njo (ao naga), nre (rengma meridional), mjw (karbi), clk (idu mishmi), trp (kok borok), nnp (wancho), lus (mizo), nag (nagamés), grt (garo), ccp (chakma), nsm (sumi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch: `model.pth` (346 MB), acompañado de `config.json`, `speakers.pth`, `language_ids.json` y `tts_release_meta.json`. Tamano del repo: 0,4 GB |

## Arquitectura y entrenamiento

VITS es un modelo condicional variacional con aprendizaje adversarial y alineamiento monotónico, que integra codificador de texto, predictor de duración, decodificador y vocoder en una sola red. En este caso el *front-end* de texto es a nivel de carácter (`use_phonemes=false`), con un vocabulario de 34 símbolos (` abcdefghijklmnopqrstuvwxyz·âêîûüṭ`), sin puntuación y en minúsculas; cualquier carácter fuera de ese conjunto se descarta. La salida es una forma de onda mono a 22.050 Hz. El entrenamiento se hizo desde cero, sin base preentrenada en su linaje, y el repo conserva tanto el generador como el discriminador.

Los datos proceden del corpus `sulabhkatiyar/ne-tts-coqui-multilingual` (instantánea v1), a su vez derivado de las grabaciones del proyecto ARTPARK-IISc Vaani. El filtrado aplicado fue: relación señal-ruido estimada de al menos 20 dB, retención de 23 de los 63 grupos de hablantes disponibles (uno o dos por lengua, ordenados por número de clips restantes) y eliminación de clips de más de 10 segundos (454 de 41.425 clips), lo que dejó unos 41.000 clips y 55 horas de audio. No se documenta uso de RLHF ni DPO, algo esperable en un sistema TTS. La configuración de inferencia fijada en `config.json` es `use_sdp=true`, `inference_noise_scale=0.667`, `inference_noise_scale_dp=1.0` y `length_scale=1.0`; la model card menciona una semilla, pero el valor no está disponible en el extracto.

## Capacidades

- Síntesis de voz end-to-end a 22.050 Hz mono, directamente de texto a forma de onda.
- Multilingüe: 16 lenguas del noreste de la India en un único modelo.
- Multi-hablante: 23 voces, seleccionadas por nombre mediante `speaker_name` y `language_name`.
- Entrada de texto romanizado en minúsculas sobre un vocabulario cerrado de 34 caracteres, sin puntuación.
- Ejecución en CPU o GPU (parámetro `use_cuda` del sintetizador).
- Fichero de metadatos `tts_release_meta.json` con los mapas de hablantes e idiomas, la frecuencia de muestreo y la huella del vocabulario, consultables sin cargar el modelo.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene entrada de audio ni clonación de voz: el conjunto de voces es fijo.
- No se documenta control de emociones, prosodia avanzada ni SSML (no disponible).
- No hay modo *thinking*, ni visión, ni audio de entrada.

## Casos de uso

- Locución de avisos y boletines en lenguas locales: convertir texto romanizado en audio para radios comunitarias o servicios públicos en tagin, nyishi, karbi o mizo, usando la voz correspondiente por nombre.
- Material educativo en lenguas minoritarias: generar lecturas en audio a partir de textos de primaria ya romanizados, con una voz estable por lengua gracias a los 23 perfiles disponibles.
- Accesibilidad para lectores de pantalla: el modelo es lo bastante pequeño (39,8 M parámetros efectivos) para ejecutarse en CPU y servir contenido textual en lenguas que los sintetizadores convencionales no cubren.
- Sistemas de respuesta de voz interactiva (IVR) en administración y banca rural: mensajes pregrabados o semidinámicos en nagamés, garo o kok borok para atención telefónica en la lengua del usuario.
- Preservación y documentación lingüística: generar corpus de audio de referencia y material de escucha para lenguas con pocos hablantes y escasa presencia digital.
- Investigación en TTS de bajos recursos: sirve como línea base multi-hablante y multilingüe entrenada desde cero sobre 55 horas de audio, útil para comparar estrategias de fonemización, filtrado de datos o aumentación.
- Doblaje y *voice-over* de contenido corto: clips de menos de 10 segundos para vídeos divulgativos o campañas de salud pública, respetando el límite de duración del entrenamiento.
- Asistentes de voz embebidos sin conexión: al caber en memoria de forma holgada, puede integrarse en dispositivos con CPU y sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye 46 clips de audio (dos frases por voz) generados sobre texto reservado que el modelo no vio durante el entrenamiento, como evaluación cualitativa. No se aportan valores de MOS, CMOS, WER ni comparaciones numéricas con otros sistemas.

## Requisitos de hardware

- Pesos: `model.pth` ocupa 346 MB porque incluye el discriminador de entrenamiento. En inferencia solo se instancian los 39,8 M parámetros del generador (unos 159 MB en fp32, calculado como 39,8 × 10^6 × 4 bytes).
- VRAM estimada: por debajo de 1 GB para el generador en fp32, incluyendo activaciones y buffers. Es una estimación derivada del número de parámetros, no un dato publicado.
- GPU recomendadas: cualquier GPU con soporte CUDA. No requiere A100 ni H100; una T4, RTX 3060, RTX 4060 o superior es más que suficiente, y una RTX 4090 estaría infrautilizada. El cuello de botella será el tiempo de síntesis por frase, no la memoria.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU. La model card ofrece explícitamente una instalación para CPU (`coqui-tts[cpu]`).
- Opciones de despliegue: la librería `coqui-tts` (clase `Synthesizer`) sobre Python 3.12, con versiones ancladas: `coqui-tts[cpu]==0.27.5`, `torch==2.8.0`, `torchaudio==2.8.0`, `transformers<5`, `numpy<2`. No hay pesos en GGUF ni soporte documentado para llama.cpp, Ollama, vLLM o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se documentan tiempos de síntesis ni *real-time factor*.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| NE-TTS (este modelo) | 86,5 M totales; 39,8 M en inferencia | 16 lenguas del noreste de la India, 23 voces | CC-BY-4.0 | VITS end-to-end entrenado desde cero, texto romanizado sin fonemas, audio a 22.050 Hz |
| GPT-SoVITS (aparece en los resultados de búsqueda, sin relación directa con este modelo) | No disponible | No disponible | No disponible | TTS con clonación de voz *few-shot* a partir de ~1 minuto de audio |
| Otros checkpoints de la colección NE Speech AI V1 | No disponible | No disponible | No disponible | Colección a la que pertenece este checkpoint según la model card |

La búsqueda web realizada no devolvió información relevante sobre este modelo ni sobre alternativas equivalentes para lenguas del noreste de la India, por lo que no es posible establecer una comparación cuantitativa fiable. Cualquier comparación de calidad con otros sistemas TTS queda pendiente de métricas publicadas.

## Limitaciones y advertencias

- Cada voz es un grupo de hablantes definido por género y distrito de origen, no un individuo: las grabaciones de una misma voz provienen de varias personas, por lo que el acento puede derivar dentro de una misma lengua.
- Nueve lenguas disponen de una sola voz y siete de dos, lo que limita la variedad de perfiles disponibles.
- La entrada está restringida a texto romanizado en minúsculas y a un vocabulario cerrado de 34 caracteres sin puntuación: los caracteres fuera de ese conjunto se descartan silenciosamente, lo que puede provocar omisiones o pérdida de contenido en la síntesis.
- Al no usar fonemas, la pronunciación depende por completo de la calidad de la romanización de entrada y puede ser inconsistente entre frases.
- El entrenamiento se limitó a clips de hasta 10 segundos, por lo que no hay garantía de calidad en la generación de audio largo.
- Solo 55 horas de audio y unos 41.000 clips procedentes de un único corpus: la cobertura dialectal y de dominio es reducida.
- No hay métricas objetivas de calidad (MOS, WER, CMOS) ni evaluación independiente publicada.
- Riesgo de alucinación acústica y de artefactos propios de VITS: la duración y la prosodia se muestrean de forma estocástica (`inference_noise_scale=0.667`), por lo que dos generaciones del mismo texto no son idénticas. La semilla mencionada en la model card no está disponible en la información consultada.
- No se documentan sesgos más allá del desequilibrio de voces por lengua, género y distrito.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución. La model card pide conservar la atribución al proyecto ARTPARK-IISc Vaani, ya que los datos derivan de él.
- La instalación falla si no se respetan las versiones ancladas (Python 3.12, `coqui-tts==0.27.5`, `torch==2.8.0`, `numpy<2`), lo que complica la integración en entornos con dependencias fijas.
- Discrepancia de identificadores: el repositorio indicado es `pramiteeh/indian-ne-multilingual-tts`, mientras que el código de ejemplo de la model card descarga desde `sulabhkatiyar/indian-ne-multilingual-tts`. Conviene verificar cuál es el repo canónico antes de desplegar.
- El checkpoint incluye el discriminador de entrenamiento (46,7 M parámetros), lo que triplica aproximadamente el tamaño de descarga respecto a lo estrictamente necesario para inferencia.
- No hay información sobre compatibilidad con SSML, control de velocidad más allá de `length_scale`, ni soporte de voces personalizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pramiteeh/indian-ne-multilingual-tts
- Repositorio referenciado en el código de ejemplo: https://huggingface.co/sulabhkatiyar/indian-ne-multilingual-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/ne-tts-coqui-multilingual
- Colección NE Speech AI V1: https://huggingface.co/collections/sulabhkatiyar/ne-speech-ai-v1-6a8efa7593551e32d63b876b
- Proyecto ARTPARK-IISc Vaani (origen de los datos): https://vaani.iisc.ac.in/
- Paper de VITS (arxiv:2106.06103): https://arxiv.org/abs/2106.06103
- Paper referenciado en las etiquetas (arxiv:2603.28714): https://arxiv.org/abs/2603.28714
- GPT-SoVITS, proyecto TTS mencionado en los resultados de búsqueda (no vinculado a este modelo): https://github.com/RVC-Boss/GPT-SoVITS

# audio-cpp/audio.cpp-gguf

## Resumen

`audio-cpp/audio.cpp-gguf` es un repositorio que aloja conversiones de pesos en formato GGUF para decenas de modelos de audio, pensadas para ser ejecutadas con [audio.cpp](https://github.com/0xShug0/audio.cpp), un motor de inferencia en C++ puro basado en ggml. No se trata de un modelo único, sino de un paquete de checkpoints cuantizados que cubren tareas como síntesis de voz (TTS), reconocimiento automático del habla (ASR), conversión de voz, separación de fuentes y diarización de hablantes. El repositorio incluye modelos de familias tan diversas como ACE-Step, Qwen3-TTS, IndexTTS, Irodori, Higgs Audio, Fun-ASR, Chatterbox o HTDemucs, entre otras.

La relevancia de este paquete radica en que permite ejecutar una amplia gama de modelos de audio con un único motor sin dependencia de Python, de forma similar a lo que llama.cpp supuso para los modelos de lenguaje. Los pesos están disponibles en varias cuantizaciones (bf16, f16, q8_0 y formato original), lo que facilita su despliegue en entornos con recursos limitados. El repositorio acumula más de 131.000 descargas y 51 likes, lo que indica una adopción notable dentro de la comunidad de audio open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de modelos; cada familia tiene su propia arquitectura (transformers, codec-based, etc.) |
| Parametros totales | Varia segun el modelo; desde ~100M (MOSS-TTS-Nano) hasta ~4B (Higgs-Audio-v3-TTS-4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos de audio, no texto) |
| Tipos de cuantizacion | bf16, f16, q8_0 y formato original (sin cuantizar) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Depende del modelo original; mayoritariamente MIT y Apache-2.0, con algunas excepciones no comerciales (p. ej. Boson Higgs TTS, Hviske) |
| Formato de pesos | GGUF (audio.cpp-native) |

## Arquitectura y entrenamiento

Al tratarse de un repositorio de conversiones, no existe una arquitectura unica ni un proceso de entrenamiento propio. Cada modelo subyacente fue desarrollado y entrenado por su autor original (por ejemplo, ACE-Step, Qwen3-TTS, IndexTTS, etc.) y posteriormente convertido al formato GGUF nativo de audio.cpp. El motor de inferencia audio.cpp, desarrollado por ShugoAI, se encarga de cargar y ejecutar estos pesos en C++ puro sobre ggml, sin dependencia de Python en tiempo de ejecucion.

Las conversiones siguen un esquema de empaquetado especifico documentado en la guia GGUF de audio.cpp, donde se especifican los nombres de tensores y los metadatos embebidos necesarios para cada familia de modelos. No se ha publicado informacion sobre el proceso de cuantizacion (por ejemplo, si se empleo calibracion o el metodo exacto de cuantizacion a q8_0), aunque los archivos se ofrecen "as-is" con advertencias sobre posibles desviaciones en la salida respecto a los pesos originales.

## Capacidades

- Sintesis de voz (text-to-speech) con multiples voces y estilos, incluyendo modelos como ACE-Step, Irodori, IndexTTS, Higgs-Audio-TTS y Qwen3-TTS.
- Reconocimiento automatico del habla (ASR) en varios idiomas, con modelos como Fun-ASR, Higgs-Audio-STT, Citrinet, Kroko-ASR y Hviske.
- Conversion de voz (voice conversion), permitiendo transformar la voz de un hablante a otro manteniendo el contenido linguistico (p. ej. Chatterbox, SeedVC).
- Separacion de fuentes de audio (source separation), como HTDemucs o BS-RoFormer, para aislar voces, instrumentos o efectos.
- Diarizacion de hablantes (speaker diarization), con modelos como nvidia/diar_sortformer_4spk-v1.
- Generacion de audio y efectos de sonido, mediante modelos como Stable Audio o Vevo2.
- Soporte para multiples formatos de entrada y salida de audio, gracias a la arquitectura codec-based de muchos de los modelos incluidos.

## Casos de uso

- Asistentes de voz locales: se puede desplegar un modelo TTS ligero (p. ej. Irodori-TTS-500M) junto con un ASR (p. ej. Fun-ASR-Nano) para construir un asistente conversacional que funcione completamente en local, sin conexion a internet y sin dependencias de Python.
- Transcripcion de reuniones y podcasts: utilizando modelos ASR como Higgs-Audio-v3-STT o Citrinet, se pueden transcribir grabaciones de audio de larga duracion. La cuantizacion q8_0 permite ejecutar estos modelos en CPU con un consumo de memoria moderado.
- Clonacion de voz para audiolibros o doblaje: modelos de voice conversion como Chatterbox o SeedVC permiten transformar una grabacion de voz en la voz de un actor concreto, util en produccion de contenidos audiovisuales.
- Separacion de pistas en produccion musical: HTDemucs y BS-RoFormer pueden aislar voces, bateria o instrumentos de una mezcla estereo, facilitando la remezcla o la creacion de versiones karaoke.
- Diarizacion de hablantes en entrevistas o llamadas: el modelo nvidia/diar_sortformer_4spk-v1 permite identificar cuantas personas hablan y cuando, lo que resulta util para generar actas o subtitulos con atribucion de hablante.
- Generacion de efectos de sonido para videojuegos o cine: Stable Audio o Vevo2 pueden sintetizar efectos sonoros o ambientes a partir de descripciones textuales, acelerando el flujo de trabajo de diseno de sonido.
- Integracion en pipelines de CI/CD para testing de audio: al ser un motor C++ sin dependencias, audio.cpp puede integrarse en entornos de contenedores ligeros para validar automaticamente la calidad de modelos de TTS o ASR en cada commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las comprobaciones automaticas de audio son estrictas y pueden marcar desviaciones en longitud, log-mel o transcripcion, pero no ofrece metricas cuantitativas comparativas (como WER, MOS o RTF). Se recomienda validar cada archivo y ruta de ejecucion especifica antes de usarlo en produccion.

## Requisitos de hardware

- Los requisitos varian enormemente segun el modelo concreto. Los modelos mas pequenos (100M-500M parametros) pueden ejecutarse en CPU con 2-4 GB de RAM, incluso en Raspberry Pi o laptops modestas.
- Los modelos medianos (1-2B parametros) en cuantizacion q8_0 requieren aproximadamente 2-4 GB de VRAM si se usan en GPU, o 4-8 GB de RAM en CPU.
- Los modelos mas grandes (3-4B parametros, como Higgs-Audio-v3-TTS-4B) necesitan al menos 8 GB de VRAM en GPU (por ejemplo, RTX 3080 o superior) o 16 GB de RAM en CPU con inferencia lenta.
- El repositorio completo ocupa 698 GB, pero los archivos individuales se pueden descargar por separado segun la necesidad.
- audio.cpp soporta aceleracion por GPU via CUDA, Metal y Vulkan, ademas de CPU. No requiere Python en tiempo de ejecucion.
- Para despliegue en produccion, se recomienda usar las cuantizaciones q8_0 para reducir el uso de memoria y mejorar la latencia, aceptando una posible deriva en la calidad del audio.
- No se dispone de datos de latencia o throughput especificos por modelo; estos dependen del hardware y de la ruta de inferencia elegida.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo unico sino un conjunto de conversiones, por lo que no existe una comparativa directa con alternativas de la misma categoria. Para cada familia de modelos subyacente (por ejemplo, ACE-Step vs. IndexTTS), se podrian comparar los pesos originales, pero no se dispone de datos de rendimiento publicados en este paquete.

## Limitaciones y advertencias

- Los pesos se proporcionan "as-is" y el autor advierte que las comprobaciones automaticas pueden marcar desviaciones que aun asi suenan aceptables para oidos humanos. Se recomienda validar el archivo, el backend y la ruta exacta antes de usarlos en produccion.
- Algunos modelos incluidos tienen licencias restrictivas para uso comercial. Por ejemplo, Boson Higgs TTS 3 usa una licencia de investigacion y no comercial, y Hviske v5.3 usa CC-BY-NC-4.0. Es responsabilidad del usuario revisar la licencia de cada modelo individual.
- No se ha publicado informacion sobre sesgos, alucinaciones o comportamientos problematicos especificos de estos modelos. Como en cualquier sistema de audio generativo, existe riesgo de producir contenido falso o manipulado (deepfakes de voz).
- La cobertura de idiomas no esta documentada en el repositorio; algunos modelos pueden estar limitados a un idioma o region concreta (por ejemplo, Irodori esta orientado al japones).
- El formato GGUF de audio.cpp no es compatible con GGUF de llama.cpp o whisper.cpp; los nombres de tensores y metadatos deben coincidir con la familia seleccionada, y no se pueden cargar archivos GGUF arbitrarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Repositorio GitHub de audio.cpp: https://github.com/0xShug0/audio.cpp
- Guia GGUF de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/gguf.md
- Articulo de introduccion a audio.cpp: https://runaihome.com/blog/audio-cpp-local-tts-gpu-guide-2026/

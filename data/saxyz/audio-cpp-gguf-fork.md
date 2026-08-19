# saxyZ/audio.cpp-gguf-fork

## Resumen

El repositorio `saxyZ/audio.cpp-gguf-fork` es un fork del proyecto `audio-cpp/audio.cpp-gguf` que agrupa conversiones de pesos en formato GGUF de decenas de modelos de audio, preparadas para su uso con el motor de inferencia [audio.cpp](https://github.com/0xShug0/audio.cpp). Este motor, escrito en C++ puro y basado en ggml, permite ejecutar modelos de síntesis de voz (TTS), reconocimiento automático del habla (ASR), conversión de voz, separación de fuentes y diarización sin dependencia de Python.

El repositorio incluye modelos tan diversos como ACE-Step 1.5, Fish-Audio-S2-Pro, IndexTTS-2/2.5, Higgs-Audio-v3, Irodori-TTS, Chatterbox, HTDemucs, entre otros. Cada modelo se ofrece en varias cuantizaciones (bf16, f16, q8_0) y se acompaña de una tabla de compatibilidad con las rutas de audio.cpp. El tamaño total del repositorio es de 698 GB, lo que refleja la gran cantidad de archivos y variantes incluidas.

La relevancia de este fork radica en ofrecer un punto único de descarga para múltiples modelos de audio ya convertidos y listos para ejecutar en entornos sin Python, con opciones de cuantización para reducir requisitos de memoria. No obstante, al tratarse de un fork sin mantenimiento aparente (0 descargas, 0 likes), conviene verificar la vigencia de los archivos frente al repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (conjunto de modelos; cada uno tiene la suya: transformer, convnet, etc.) |
| Parametros totales | 159.758.028 (dato de safetensors de un modelo individual, no del conjunto) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo) |
| Tipos de cuantizacion | bf16, f16, q8_0 (según modelo) |
| Idiomas soportados | No disponible (depende del modelo; algunos son multilingües) |
| Licencia | other (cada modelo tiene su propia licencia: MIT, Apache-2.0, CC-BY-NC-4.0, etc.) |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino conversiones de pesos ya existentes a formato GGUF nativo de audio.cpp. Las conversiones se realizan siguiendo las especificaciones del [documento GGUF de audio.cpp](https://github.com/0xShug0/audio.cpp/blob/main/docs/gguf.md), que define layouts de tensores, metadatos y rutas de carga para cada familia de modelos.

Los modelos originales abarcan arquitecturas diversas: desde transformadores autoregresivos para TTS (como Fish-Audio-S2-Pro o IndexTTS-2) hasta redes convolucionales para ASR (Citrinet, Parakeet) y modelos de separación de fuentes basados en transformadores (HTDemucs). No se dispone de información sobre el entrenamiento de estos modelos porque no es parte de este repositorio; cada modelo conserva su propia procedencia y licencia.

La innovación principal de este fork es la propia conversión: permite cargar modelos de audio directamente en audio.cpp, que ofrece inferencia optimizada en CPU y GPU mediante ggml, sin necesidad de entorno Python.

## Capacidades

- Sintesis de voz (TTS) con multiples voces y estilos, incluyendo modelos como ACE-Step 1.5, Irodori-TTS, IndexTTS-2, Higgs-Audio-v3-TTS, Fish-Audio-S2-Pro.
- Reconocimiento automatico del habla (ASR) con modelos como Fun-ASR-Nano, Higgs-Audio-v3-STT, Kroko-ASR, Hviske, Citrinet.
- Conversion de voz (voice conversion) mediante modelos como SeedVC o MeanVC2 (si estan incluidos en el repo).
- Separacion de fuentes de audio (source separation) con HTDemucs y BS-RoFormer.
- Diarizacion de hablantes (speaker diarization) con modelos como nvidia/diar_sortformer.
- Generacion de musica y efectos de sonido con stable-audio-3.
- Soporte de carga directa de archivos GGUF y uso de sidecar embedding para metadatos adicionales.
- Compatibilidad con multiples backends de audio.cpp (CPU, CUDA, Metal) gracias al formato GGUF.

## Casos de uso

- Despliegue de TTS en produccion sin Python: un servicio de voz sintetica puede cargar un modelo GGUF como `ace-step-1.5-turbo-q8_0.gguf` en audio.cpp y generar audio de baja latencia en un servidor C++, evitando la sobrecarga de entornos Python.
- Transcripcion de audio en tiempo real: con modelos ASR como `higgs-audio-v3-stt-q8_0.gguf`, se puede construir un pipeline de transcripcion para reuniones o atencion al cliente que funcione en CPU con cuantizacion q8_0.
- Separacion de instrumentos en estudios de grabacion: `htdemucs-q8_0.gguf` permite aislar voces o instrumentos de una mezcla sin depender de servicios en la nube.
- Conversion de voz para doblaje o videojuegos: usando modelos de voice conversion como SeedVC (si esta incluido), se puede transformar la voz de un actor en tiempo real.
- Asistentes de voz embebidos en dispositivos IoT: los modelos pequenos (100M-500M) cuantizados caben en dispositivos con poca RAM, permitiendo TTS y ASR locales.
- Evaluacion de multiples modelos de audio en un solo entorno: al tener todos los archivos GGUF en un repositorio, un investigador puede comparar rapidamente el rendimiento de distintos modelos TTS/ASR usando audio.cpp sin instalar dependencias adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona pruebas de "drift" para algunas cuantizaciones (por ejemplo, "16-bit + Q8 drift" para ACE-Step), pero no ofrece metricas cuantitativas. Se recomienda validar cada modelo y cuantizacion con las herramientas de audio.cpp antes de usarlo en produccion.

## Requisitos de hardware

- Los requisitos varian segun el modelo concreto. Los modelos mas pequenos (100M-500M parametros) pueden ejecutarse en CPU con 4-8 GB de RAM usando cuantizacion q8_0.
- Los modelos medianos (1-2B) requieren al menos 8-12 GB de RAM en CPU o una GPU con 6-8 GB de VRAM para inferencia en tiempo real.
- Los modelos grandes (4B como Higgs-Audio-v3-TTS) necesitan una GPU con 16 GB o mas de VRAM, o cuantizacion agresiva.
- audio.cpp soporta backends CPU (x86, ARM), CUDA y Metal. Se recomienda usar vLLM o TGI para despliegue en servidores, aunque audio.cpp es la via natural para estos archivos.
- El repositorio completo ocupa 698 GB, pero solo es necesario descargar los archivos del modelo concreto que se vaya a usar.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saxyZ/audio.cpp-gguf-fork | GGUF (multiples modelos) | Variable (100M-4B) | No disponible | Mixta (MIT, Apache-2.0, CC-BY-NC, etc.) | HuggingFace (fork sin mantenimiento) |
| audio-cpp/audio.cpp-gguf | GGUF (multiples modelos) | Variable | No disponible | Mixta | HuggingFace (repositorio oficial) |
| Modelos originales en safetensors | safetensors | Variable | Variable | Cada uno la suya | HuggingFace (por separado) |

La principal diferencia con el repositorio original es que este fork no parece recibir actualizaciones ni correcciones, por lo que es preferible usar `audio-cpp/audio.cpp-gguf` si se busca soporte activo. Los modelos originales en safetensors ofrecen mayor flexibilidad de cuantizacion (por ejemplo, con llama.cpp o herramientas propias), pero requieren conversion manual a GGUF.

## Limitaciones y advertencias

- La model card advierte explicitamente que las conversiones se proporcionan "as-is" y que las comprobaciones automaticas de audio pueden marcar desviaciones (drift) que aun son audibles para humanos. Es imprescindible validar cada archivo con el backend y la ruta de audio.cpp que se vaya a utilizar.
- Las licencias de los modelos originales son muy variadas: algunas permiten uso comercial (MIT, Apache-2.0), pero otras son estrictamente no comerciales (CC-BY-NC-4.0 para Hviske, Boson Higgs TTS 3 Research and Non-Commercial License). El usuario debe verificar la licencia de cada modelo antes de usarlo en produccion.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma de los modelos individuales. Se recomienda consultar la documentacion de cada modelo original.
- El repositorio no tiene mantenimiento visible (0 descargas, 0 likes, fecha de creacion unica). Los archivos podrian estar desactualizados o incompatibles con versiones recientes de audio.cpp.
- El tamano del repositorio (698 GB) hace inviable la descarga completa; es necesario seleccionar los archivos concretos.
- No se proporcionan metadatos de contexto, idiomas soportados ni parametros activos para el conjunto, lo que dificulta la seleccion rapida de un modelo adecuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/saxyZ/audio.cpp-gguf-fork
- Repositorio original de audio.cpp-gguf: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Motor de inferencia audio.cpp (GitHub): https://github.com/0xShug0/audio.cpp
- Documentacion GGUF de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/gguf.md
- Pagina de modelos Audio.cpp en local-ai-zone: https://local-ai-zone.github.io/models/audio-cpp.html

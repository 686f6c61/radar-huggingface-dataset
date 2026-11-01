# masterofaudio2077/nemo-speech-cpp-cuda-t4

## Resumen

Este repositorio no contiene un modelo de IA en sí, sino un binario precompilado del servidor `nemo-speech`, la implementación en C++ (basada en ggml/llama.cpp) del motor de inferencia NeMo-Speech.cpp. El binario está compilado específicamente para GPU NVIDIA Tesla T4 (arquitectura Turing, compute capability 7.5) con CUDA 12.8, y su propósito es evitar la compilación manual de aproximadamente 40 minutos que de otro modo requerirían los cuadernos de Kaggle o Colab para ejecutar el modelo de reconocimiento de voz Nemotron-3.5-Transcribe-30B-A4B.

El modelo subyacente es `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, un sistema ASR (reconocimiento automático del habla) de NVIDIA con 30.000 millones de parámetros totales y 4.000 millones activos (arquitectura MoE), del que este repositorio solo distribuye el ejecutable, no los pesos. Los pesos en formato GGUF deben descargarse por separado desde `AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF`.

La relevancia de este artefacto es práctica: permite poner en marcha un pipeline ASR de gran escala en hardware de gama media-alta (T4, 16 GB) sin tocar toolchain de compilación, a costa de una portabilidad nula (solo funciona en T4) y de una licencia "other" que obliga a revisar los términos de NVIDIA, ggml y CUDA antes de redistribuir.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el binario es NeMo-Speech.cpp sobre ggml; el modelo base es un MoE de NVIDIA, detalles no especificados en la información proporcionada) |
| Parámetros totales | 30B (modelo base Nemotron-3.5-Transcribe-30B-A4B) |
| Parámetros activos | 4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (variantes concretas no disponibles; los pesos se obtienen del repo AtomicChat) |
| Idiomas soportados | No disponible |
| Licencia | `other` (modelo bajo licencia de NVIDIA; binario bajo licencias de NeMo-Speech.cpp, ggml y CUDA) |
| Formato de pesos | GGUF (pesos externos); el repositorio contiene un binario `.tar.gz` |
| Tarea | ASR (reconocimiento automático del habla) |
| Motor de inferencia | NeMo-Speech.cpp, commit `20999cc` con parche de reparto entre dos GPU |
| Compilación | Preset `cuda-server`, `-DCMAKE_CUDA_ARCHITECTURES=75-real`, CUDA 12.8 |
| Compatibilidad de GPU | Solo compute capability 7.5 (Tesla T4) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El repositorio distribuye únicamente un artefacto de compilación: el servidor `nemo-speech` construido con NeMo-Speech.cpp, un motor de inferencia en C++ basado en ggml (la misma familia tecnológica que llama.cpp) que ejecuta modelos ASR en formato GGUF. La compilación se realizó con el preset `cuda-server` y `-DCMAKE_CUDA_ARCHITECTURES=75-real`, lo que genera código SASS nativo exclusivamente para Turing (T4). El binario se construyó sobre Linux 6.18.55 con glibc 2.39, CUDA 12.8 y driver 580.178.04, e incluye un parche del autor para repartir la carga entre dos GPU.

El modelo que ejecuta es NVIDIA Nemotron-3.5-Transcribe-30B-A4B, un sistema ASR con 30B parámetros totales y 4B activos (MoE). No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO; estos datos corresponden a la model card del modelo base de NVIDIA, que no se incluye aquí. Tampoco se documentan innovaciones de decodificación específicas más allá de las propias del motor ggml.

## Capacidades

- Reconocimiento automático del habla (ASR) por lotes o en streaming mediante el servidor `nemo-speech serve`.
- Ejecución de pesos GGUF del modelo Nemotron-3.5-Transcribe-30B-A4B con cuantización.
- Reparto de carga entre dos GPU gracias al parche incluido en la compilación.
- Despliegue como servidor local con bibliotecas compartidas adyacentes al binario.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de audio en cuadernos de Kaggle o Colab: el binario elimina la compilación de ~40 minutos y permite arrancar el servidor ASR en minutos sobre una T4, descargando los GGUF desde el repositorio AtomicChat.
- Prototipado rápido de pipelines ASR: útil para validar la calidad de Nemotron-3.5-Transcribe en un conjunto de audios propio antes de invertir en infraestructura dedicada.
- Procesamiento por lotes de reuniones o clases grabadas: el servidor local acepta ficheros de audio y devuelve transcripciones sin depender de APIs externas, lo que simplifica el cumplimiento de privacidad.
- Generación de subtítulos para vídeo: integrable en un script que invoque el servidor y postprocese los segmentos con marcas temporales (si el modelo las emite; no confirmado en la información disponible).
- Evaluación comparativa de cuantizaciones GGUF: al ser un binario fijo, permite medir latencia y calidad de distintas variantes GGUF del mismo modelo sobre el mismo hardware T4.
- Docencia y experimentación con modelos ASR de gran tamaño: una T4 es hardware asequible en cloud, y este binario reduce la barrera de entrada para estudiantes que quieran ejecutar un MoE de 30B en ASR.
- Base para servicios internos de transcripción en entornos con GPU T4 ya desplegadas (por ejemplo, nodos de inferencia heredados), siempre que se acepten las limitaciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU: exclusivamente NVIDIA Tesla T4 (compute capability 7.5). El binario no arranca en A100, L4, P100 ni otras arquitecturas.
- VRAM: no disponible de forma explícita; el modelo base tiene 30B parámetros totales y 4B activos, por lo que la huella depende de la cuantización GGUF elegida. Una T4 dispone de 16 GB.
- Reparto multi-GPU: la compilación incluye un parche para dividir la carga entre dos GPU, lo que sugiere que una sola T4 puede ser insuficiente para ciertas cuantizaciones.
- Driver: requiere `libcuda.so.1` y un driver NVIDIA compatible con CUDA 12.8 (el build se hizo con 580.178.04).
- Sistema: glibc y libstdc++ al menos tan recientes como los de la máquina de compilación (glibc 2.39, Linux 6.18.55); consultar `ldd.txt` del repositorio.
- Despliegue: servidor propio `nemo-speech serve`; no se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B (este binario) | 30B totales / 4B activos | No disponible | ASR | `other` (NVIDIA) | GGUF + NeMo-Speech.cpp, solo T4 |
| Whisper large-v3 (OpenAI) | ~1,55B | 30 s por ventana | ASR | MIT | safetensors, CT2, whisper.cpp, amplia compatibilidad |
| Whisper large-v3-turbo | ~809M | 30 s por ventana | ASR | MIT | safetensors, CT2, whisper.cpp |
| Parakeet-TDT (NVIDIA NeMo) | ~0,6B | No disponible | ASR | CC-BY-4.0 (según variante) | NeMo toolkit, `.nemo` |

La comparación es orientativa: los datos de Whisper y Parakeet provienen de conocimiento general y no de la información proporcionada para este repositorio. La diferencia clave es que este artefacto ofrece un MoE ASR de 30B con 4B activos, pero con portabilidad restringida a T4 y licencia no permisiva, frente a alternativas más ligeras, portables y con licencias permisivas.

## Limitaciones y advertencias

- El binario solo funciona en GPU con compute capability 7.5 (Tesla T4); no es portable a A100, L4, P100, RTX 4090 ni otras arquitecturas.
- Depende de versiones concretas de glibc, libstdc++ y driver NVIDIA; un entorno más antiguo provocará fallos de carga dinámica.
- El repositorio no incluye los pesos: sin descargar los GGUF de AtomicChat el binario no es funcional.
- Licencia `other`: el modelo sigue la licencia de NVIDIA y el binario las de NeMo-Speech.cpp, ggml y CUDA; es obligatorio revisarlas antes de uso comercial o redistribución.
- Autor y repositorio sin descargas ni likes; no hay evidencia de mantenimiento, pruebas comunitarias ni soporte.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni comportamiento en dominios con ruido o acentos; deben evaluarse empíricamente antes de producción.
- Al ser un artefacto de compilación de un tercero, no hay garantía de reproducibilidad ni de correspondencia exacta con el commit declarado.
- El rendimiento y la latencia no están medidos ni publicados; el reparto entre dos GPU sugiere posibles limitaciones de VRAM en configuraciones de una sola T4.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/masterofaudio2077/nemo-speech-cpp-cuda-t4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Pesos GGUF: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- NeMo-Speech.cpp: no disponible (el repositorio cita el commit `20999cc` sin URL)

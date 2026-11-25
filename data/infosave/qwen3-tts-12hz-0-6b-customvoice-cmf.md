# infosave/qwen3-tts-12hz-0.6b-customvoice-cmf

## Resumen

Este repositorio distribuye el modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice de Qwen (Alibaba) empaquetado en un único fichero CMF para el motor `cortiq`, un runtime escrito en Rust que no depende de Python ni de frameworks de machine learning. El paquete incluye en un solo contenedor el talker, su predictor de códigos y el decodificador del tokenizador de voz a 12 Hz, con los pesos cuantizados a 8 y 4 bits. El modelo base sintetiza voz en diez idiomas con nueve voces predefinidas.

La relevancia de esta conversión es de despliegue: elimina la pila Python/torch del modelo original y permite ejecutar TTS en CPU, CUDA, Vulkan y Metal con un binario de línea de comandos. Según el autor, el decodificado voraz reproduce frame a frame la implementación de referencia `qwen_tts`, y las muestras generadas se transcriben de vuelta al texto de entrada con Whisper.

El modelo base tiene 0,6 mil millones de parámetros, una tasa de tokens de voz de 12 Hz y salida de audio WAV a 24 kHz. La licencia es Apache-2.0, igual que la del original, y el repositorio declara explícitamente no estar hecho ni respaldado por Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neural con talker autoregresivo, predictor de códigos y decodificador de tokenizador de voz a 12 Hz (arquitectura interna del modelo base no detallada) |
| Parametros totales | 0,6B (modelo base; desglose por componente no disponible) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (8 bits) y q4tp (4 bits); embeddings de texto, embeddings y cabezas del predictor de códigos y decodificador de voz en f16 |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru, más modo `auto` |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (contenedor propio de `cortiq`); también se conserva un `.cmf` con los ficheros originales para el puente Python |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de sus componentes: un módulo *talker* que genera tokens de voz de forma autorregresiva, un predictor de códigos y un decodificador de tokenizador de voz a 12 Hz que convierte dichos tokens en audio a 24 kHz. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

La contribución de este repositorio es la conversión y cuantización a CMF para `cortiq`: el talker y el predictor de códigos se cuantizan a 8 bits (q8_2f) o 4 bits (q4tp), mientras que los embeddings de texto, los embeddings y cabezas del predictor y el decodificador de voz permanecen en f16. El autor reporta que el decodificado voraz es idéntico frame a frame a la referencia `qwen_tts`, y que con muestreo (temperatura por defecto 0,9) el fichero q4tp degrada algunas tomas en ruso (3 de 8 semillas, tanto en Metal como en CPU), por lo que recomienda q8_2f para ese idioma.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso, con detección automática de idioma mediante `--lang auto`.
- Nueve voces integradas: `serena`, `vivian`, `uncle_fu`, `ryan`, `aiden`, `ono_anna`, `sohee`, `eric` y `dylan`.
- Salida de audio WAV a 24 kHz.
- Control de decodificación: muestreo con temperatura configurable (por defecto 0,9), decodificado voraz con `--temperature 0` y selección de toma alternativa mediante `--seed`.
- Ejecución sin Python ni framework de ML, a través del motor Rust `cortiq` con backends CUDA, Vulkan y Metal.
- No se documentan en la información disponible capacidades de clonación de voz, control de prosodia, emoción, tool calling ni agentes.

## Casos de uso

- Generación de audiolibros y contenido narrado en varios idiomas: el modelo cubre diez idiomas con una sola instalación y nueve voces, lo que permite asignar voces distintas a personajes o secciones sin cambiar de modelo.
- Localización de vídeos y cursos: al soportar `es`, `en`, `de`, `fr`, `it`, `pt`, `ja`, `ko`, `zh` y `ru`, se puede generar la pista de voz para cada mercado a partir del mismo guion traducido.
- Síntesis en el dispositivo o en el borde: los ficheros de 1,29 GB (q4tp) y 1,55 GB (q8_2f) y la ejecución nativa en Metal o Vulkan permiten integrar TTS en aplicaciones de escritorio o portátiles sin servicio en la nube.
- Integración en pipelines sin Python: al ser un binario de `cortiq`, encaja en flujos de CI/CD o scripts de shell para generar avisos de voz, mensajes pregrabados o prompts de audio de forma reproducible.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces de asistencia con latencia superior a tiempo real en Apple M4 (1,7–1,9×) y en RTX A5000 (1,1–1,4×).
- Prototipado de asistentes conversacionales: con salida de 24 kHz y control de semilla y temperatura, sirve para evaluar la naturalidad de la voz antes de invertir en un servicio TTS gestionado.
- Avisos y anuncios automatizados en ruso: el autor recomienda el fichero q8_2f, que se transcribió correctamente en todas las tomas comprobadas, para entornos donde la inteligibilidad del ruso es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas ASR comparativas). Los únicos datos de rendimiento son medidas de velocidad del autor:

| Plataforma | Fichero | Idioma | Tiempo de audio | Tiempo de cómputo | Factor vs. tiempo real |
|---|---|---|---|---|---|
| Apple M4 (24 GB), Metal | q4tp | inglés | 8,56 s | 4,7 s | 1,85× |
| Apple M4 (24 GB), Metal | q4tp | ruso | 4,40 s | 2,5 s | 1,78× |
| RTX A5000 (24 GB), CUDA | q4tp | ruso | no disponible | no disponible | 1,11× |
| RTX A5000 (24 GB), CUDA | q4tp | inglés | no disponible | no disponible | 1,42× |
| RTX A5000 (24 GB), CUDA | q8_2f | ruso | no disponible | no disponible | 0,92× |
| RTX A5000 (24 GB), CUDA | q8_2f | inglés | no disponible | no disponible | 1,34× |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño de los ficheros (1,29 GB en q4tp, 1,55 GB en q8_2f) da una cota inferior orientativa, a la que hay que sumar estados de inferencia y audio.
- GPU recomendadas: RTX A5000 (24 GB) validada con CUDA; Apple M4 (24 GB) validada con Metal. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma compatibilidad con GPUs consumer; los backends soportados son CUDA, Vulkan y Metal, lo que sugiere que tarjetas con Vulkan podrían ejecutarlo, pero no hay cifras publicadas.
- Despliegue: `cortiq-cli` instalado con `cargo install cortiq-cli` (con `--features cuda` para NVIDIA); descarga de pesos con `hf download`; ejecución con `cortiq tts <fichero.cmf> "<texto>" --lang <idioma> --speaker <voz> --out <salida.wav>`.
- Latencia y throughput: en Apple M4 con q4tp, entre 1,7× y 1,9× más rápido que tiempo real; en RTX A5000 con CUDA, entre 1,1× y 1,4× con q4tp y entre 0,92× y 1,34× con q8_2f. Con q8_2f en ruso sobre RTX A5000 el cómputo es ligeramente más lento que tiempo real.
- También se conserva un puente Python (`run_qwen3_tts_cmf.py`) sobre el contenedor con los ficheros originales.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia cualitativa de la categoría:

| Modelo | Parametros | Idiomas | Licencia | Formato de despliegue |
|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice (este paquete) | 0,6B | 10 | Apache-2.0 | CMF para `cortiq` (Rust), sin Python |
| Qwen3-TTS-12Hz-0.6B-CustomVoice (original) | 0,6B | 10 | Apache-2.0 | Pesos originales con `qwen_tts` (Python) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El fichero q4tp degrada algunas tomas en ruso con muestreo (3 de 8 semillas, en Metal y CPU); para ruso debe usarse q8_2f.
- El decodificado voraz (`--temperature 0`) es el modo verificado como idéntico a la referencia; el muestreo por defecto (0,9) introduce variabilidad entre tomas.
- Solo hay nueve voces predefinidas; no se documenta clonación de voz ni control fino de prosodia o emoción.
- No se publican datos sobre sesgos, tasas de alucinación o calidad medida con métricas ASR más allá de la comprobación cualitativa con Whisper.
- No se detallan límites de longitud de texto por petición ni longitud de contexto del modelo base.
- El repositorio no está hecho ni respaldado por Qwen; la licencia Apache-2.0 se hereda del modelo original y conviene verificarla en el repositorio de origen para uso comercial.
- El rendimiento medido se limita a Apple M4 y RTX A5000; no hay datos para otras GPUs ni para CPU sola.
- El tamaño del repositorio es de 5,3 GB, superior al de los ficheros cuantizados individuales, por incluir varias variantes y muestras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/qwen3-tts-12hz-0.6b-customvoice-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Motor y formato CMF: https://github.com/infosave2007/cmf
- Muestra de audio en ruso (q8_2f, CUDA): https://huggingface.co/infosave/qwen3-tts-12hz-0.6b-customvoice-cmf/resolve/main/samples/q8_2f_cuda_ru.mp3
- Muestra de audio en inglés (q4tp, CUDA): https://huggingface.co/infosave/qwen3-tts-12hz-0.6b-customvoice-cmf/resolve/main/samples/q4tp_cuda_en.mp3

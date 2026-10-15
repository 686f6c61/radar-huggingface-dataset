# imbafls/callout-relay-models

## Resumen

`imbafls/callout-relay-models` no es un modelo entrenado, sino un repositorio espejo (mirror) que aloja copias byte a byte de varios modelos de reconocimiento de voz en formato ONNX, publicados como ficheros sueltos para que la aplicacion de escritorio Callout Relay pueda descargarlos sin necesidad de un decodificador de archivos comprimidos y reanudar cualquier descarga. El autor, imbafls, mantiene estos ficheros pinneados por SHA-256 en el catalogo de la aplicacion y los sirve desde un commit fijo del repositorio. Ningun modelo ha sido reentrenado ni modificado.

El repositorio agrupa once carpetas con modelos de distinta procedencia, todos ellos integrables con el runtime sherpa-onnx: variantes streaming Zipformer (20M y el de 2023-06-26), NVIDIA Parakeet TDT 0.6B v2 y v3, SenseVoice (zh/en/ja/ko/yue), Moonshine tiny y base, Whisper tiny.en y Whisper turbo, Nemotron 3.5 ASR streaming 0.6B (560 ms) y el detector de actividad de voz Silero VAD. Cada modelo conserva la licencia de su release original.

Su relevancia radica en la practicidad para desarrolladores que construyen aplicaciones de voz offline: ofrece un conjunto curado de modelos ASR listos para sherpa-onnx, con pesos ya cuantizados a int8 en la mayoria de los casos, lo que facilita el despliegue en entornos de escritorio y edge sin dependencia de servicios en la nube. El tamano total del repositorio es de 3,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: Zipformer (streaming), NVIDIA NeMo Parakeet TDT, SenseVoice, Moonshine, Whisper (encoder-decoder transformer), NVIDIA Nemotron streaming ASR y Silero VAD |
| Parametros totales | Variable por submodelo: 20M (zipformer-en-20m), 0,6B (parakeet-tdt v2 y v3), 0,6B (nemotron-streaming); resto no disponible en la informacion proporcionada |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (mayoritariamente); Whisper tiny.en y Whisper turbo se distribuyen como paquetes tar.bz2 sin detallar cuantizacion |
| Idiomas soportados | Ingles (zipformer, moonshine, whisper, parakeet); chino, ingles, japones, coreano y cantonés (sense-voice); resto no disponible |
| Licencia | other (cada submodelo mantiene la licencia de su release upstream) |
| Formato de pesos | ONNX (sherpa-onnx) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: actua como espejo de artefactos. Las arquitecturas subyacentes son dispares. Los Zipformer son modelos de reconocimiento de voz streaming basados en la arquitectura Zipformer de k2-fsa, con versiones de 20M de parametros y otra sin tamano explicitado. Parakeet TDT y Nemotron 3.5 ASR streaming son modelos de NVIDIA NeMo (la familia TDT usa decodificacion Token-and-Duration Transducer), en variantes de 0,6B de parametros cuantizadas a int8. SenseVoice es un modelo multilingue (zh/en/ja/ko/yue) de reconocimiento de voz. Moonshine (tiny y base) y Whisper (tiny.en y turbo) son modelos de la familia encoder-decoder para ASR; Whisper es el conocido modelo de OpenAI. Silero VAD es un detector de actividad de voz, no un reconocedor.

En cuanto a datos de entrenamiento, numero de tokens, composicion del dataset o tecnicas como RLHF/DPO, no hay informacion en la model card ni en los metadatos proporcionados: al tratarse de copias de modelos upstream, esa informacion correspondería a las fichas originales de cada modelo, no a este repositorio. La unica innovacion practica destacable de este repo es la de servir cada fichero como archivo individual, lo que permite descargas reanudables y verificacion por SHA-256.

## Capacidades

- Reconocimiento de voz (ASR) en tiempo real o por lotes, segun el submodelo elegido.
- Variantes streaming (Zipformer, Nemotron streaming 0.6B a 560 ms, Parakeet TDT) adecuadas para transcripcion continua de baja latencia.
- Reconocimiento multilingue en cinco idiomas (chino, ingles, japones, coreano, cantonés) mediante SenseVoice.
- Reconocimiento solo en ingles con Zipformer, Moonshine y Whisper tiny.en.
- Whisper turbo para transcripcion multilingue de mayor tamano (hereda las capacidades multilingues de Whisper).
- Deteccion de actividad de voz (VAD) con Silero, util para segmentar audio antes de la transcripcion.
- Salidas en formato ONNX compatibles con el runtime sherpa-onnx.
- Capacidades de tool calling, agentes, vision, audio generativo o thinking mode: no disponibles (son modelos exclusivamente ASR/VAD).

## Casos de uso

- Transcripcion de reuniones en local: usando un submodelo Whisper turbo o Parakeet TDT 0.6B, la aplicacion puede transcribir audio grabado sin enviar datos a la nube, algo critico en entornos corporativos con requisitos de privacidad.
- Dictado en tiempo real en aplicaciones de escritorio: los modelos Zipformer streaming permiten transcripcion incremental mientras el usuario habla, con latencia baja ideal para edicion de texto por voz.
- Subtitulado de video en directo: Nemotron streaming 0.6B (560 ms) y Zipformer streaming ofrecen la baja latencia necesaria para generar subtitulos que acompanen al habla con poco retardo.
- Asistentes de voz embebidos en aplicaciones: integrando Silero VAD para detectar cuando el usuario habla seguido de un modelo ASR, se puede construir un pipeline de activacion por voz completamente offline.
- Transcripcion multilingue de contenido en Asia Oriental: SenseVoice cubre chino, japones, coreano y cantonés, util para plataformas que procesan audio de esas regiones.
- Procesado por lotes de archivos de audio en servidores modestos: los modelos cuantizados a int8 (Zipformer 20M, Moonshine tiny, Whisper tiny.en) permiten transcribir grandes volumenes en CPU sin GPU dedicada.
- Preprocesado de audio para pipelines de NLP: usar el ASR para convertir audio en texto y despues alimentar ese texto a otros modelos de analisis o resumen.
- Aplicaciones de accesibilidad: dictado y transcripcion para usuarios con discapacidad motriz o auditiva, ejecutandose localmente en el equipo del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del submodelo. Los mas pequenos (Zipformer 20M, Moonshine tiny, Whisper tiny.en, Silero VAD) funcionan en CPU con uso de RAM minimo (decenas o pocos cientos de MB). Parakeet TDT 0.6B y Nemotron 0.6B, en int8, requieren aproximadamente 1-2 GB de memoria. Whisper turbo es el mas pesado del conjunto y puede requerir varios GB en funcion de la precision.
- GPU recomendadas: para los modelos streaming pequenos basta CPU moderna o cualquier GPU de gama baja; para Parakeet/Nemotron 0.6B int8 son suficientes GPUs consumer tipo RTX 3060/4060; Whisper turbo se beneficia de GPUs con mas VRAM (RTX 4090, A100, H100) si se buscan latencias muy bajas.
- Compatibilidad con GPU consumer: si, la mayoria de los submodelos caben en GPUs consumer (RTX 30/40 series) e incluso en CPU; Whisper turbo es el que exige mas recursos pero tambien cabe en GPUs consumer con suficiente VRAM.
- Opciones de despliegue: sherpa-onnx (runtime objetivo, en C++/Python/otros bindings), ONNX Runtime; tambien es posible usar los modelos con herramientas compatibles con ONNX. No se indica soporte especifico de vLLM, llama.cpp, Ollama o TGI, ya que no son modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

El repositorio es una coleccion de espejos, por lo que la comparacion se plantea frente a otras vias de obtencion de los mismos modelos:

| Aspecto | imbafls/callout-relay-models | Fichas upstream (csukuangfj, k2-fsa, NVIDIA) | Distribuciones ASR cloud |
|---|---|---|---|
| Contenido | Copias byte a byte de 11 modelos ASR/VAD en ONNX | Modelos individuales con documentacion propia | APIs propietarias |
| Licencia | other (hereda licencia upstream) | Segun modelo | Propietaria |
| Formato | ONNX (sherpa-onnx) | ONNX y otros | API |
| Uso offline | Si | Si | No |
| Cuantizacion int8 | Si (mayoritariamente) | Depende del modelo | No aplica |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser copias de modelos upstream, los sesgos serian los de cada modelo original.
- Riesgo de alucinacion: aplicable a los modelos ASR (pueden generar transcripciones incorrectas, especialmente con ruido o acentos no cubiertos).
- Limitaciones de contexto o idioma: varios submodelos son solo en ingles (Zipformer, Moonshine, Whisper tiny.en, Parakeet); SenseVoice cubre cinco idiomas del este asiatico e ingles. No se documentan otros idiomas.
- Restricciones de licencia para uso comercial: la licencia es "other" y cada submodelo conserva su licencia upstream; es imprescindible revisar la licencia de cada modelo original antes de un uso comercial, ya que pueden diferir entre si.
- Caveat importante: este repositorio no es un modelo en si mismo, sino un espejo de artefactos. El autor lo indica explicitamente: "Nothing here was retrained or modified". No debe citarse como si fuera un modelo desarrollado por imbafls.
- Verificacion de integridad: los ficheros se sirven desde un commit fijo y se verifican por SHA-256 en la aplicacion; cualquier uso fuera de ese contexto deberia replicar esa verificacion.
- Fecha de creacion del repositorio: 2026-10-15 (segun los metadatos de HuggingFace).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/imbafls/callout-relay-models
- Documentacion de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/
- Repositorio k2-fsa/sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Zipformer streaming en 20M: https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-en-20M-2023-02-17
- Parakeet TDT 0.6B v3 int8: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- SenseVoice zh-en-ja-ko-yue: https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17
- Moonshine tiny y base, Whisper tiny.en y turbo, Parakeet TDT 0.6B v2, Nemotron streaming, Zipformer en y Silero VAD: releases de https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- Releases de modelos ASR de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/

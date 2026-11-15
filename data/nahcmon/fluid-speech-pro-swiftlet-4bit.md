# nahcmon/fluid-speech-pro-swiftlet-4bit

## Resumen

Fluid Speech Pro — Swiftlet 4-bit es una recompilación cuantizada a 4 bits del modelo de reconocimiento automático del habla Fluid Speech Pro, desarrollado por FluidVoice Labs y derivado a su vez de NVIDIA Parakeet TDT 0.6B v3 y Moondream Parakeet Ultra. La publica el usuario nahcmon como artefacto específico para Swiftlet, un motor de transcripción en Swift para Macs con Apple silicon que ejecuta el encoder con kernels Metal y el decoder con NEON. El modelo resuelve el problema de la transcripción local en dispositivo con baja latencia y sin dependencia de servicios en la nube.

La arquitectura subyacente es un encoder FastConformer de 24 capas acoplado a un decoder TDT (Token-and-Duration Transducer) con una red de predicción LSTM de 2 capas y una red conjunta. Cubre 25 idiomas europeos y se distribuye en un repositorio de 0,4 GB. Frente a la versión original en Core ML (fp16, 622 MB), esta variante reduce el peso en disco a 344 MB y el tiempo de carga inicial de 20,6 s a 0,15 s, al eliminar la compilación para Neural Engine en el primer arranque.

Su relevancia actual reside en que demuestra que una cuantización agresiva (paleta de 4 bits por fila de salida sobre pesos originalmente int8) puede mantener la precisión global (6,75 % WER frente a 6,72 %) y mejorar el rendimiento en clips cortos (hasta 2,2× de aceleración en audio de 0–3 s). Es, por tanto, un caso práctico de optimización para inferencia en hardware de consumo Apple, no un modelo entrenado desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder, 24 capas) + TDT (decoder: LSTM de 2 capas + red conjunta) |
| Parametros totales | no disponible (modelo base Parakeet TDT 0.6B v3, ~0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio por inferencia; se han medido ficheros de hasta 3 minutos) |
| Tipos de cuantizacion | Encoder: paleta de 4 bits (16 valores fp16 por fila de salida, k-means 1-D) sobre pesos int8; resto de matrices y decoder en fp16 |
| Idiomas soportados | 25: en, bg, hr, cs, da, nl, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | Binarios propios de Swiftlet (`encoder.bin`, `decoder.bin`), `Preprocessor.mlmodelc` (Core ML) y vocabulario SentencePiece JSON (8192 tokens) |

## Arquitectura y entrenamiento

El modelo es una reempaquetadura del encoder FastConformer-TDT de Fluid Speech Pro, no un entrenamiento nuevo. El encoder de 24 capas contiene las matrices grandes en una paleta de 4 bits (16 valores fp16 por fila de salida) dispuesta en el layout de teselas que leen directamente los kernels Metal GEMM de Swiftlet; el resto de tensores permanece en fp16. El decoder TDT (red de predicción LSTM de 2 capas más red conjunta) se mantiene íntegramente en fp16. El front-end log-mel es el `Preprocessor.mlmodelc` original de Core ML, sin cambios, y se ejecuta en CPU.

El proceso de construcción consistió en recuantizar los pesos int8 del encoder original a una paleta de 4 bits por fila mediante k-means 1-D y reempaquetar todo en el formato propio de Swiftlet. Ambos pasos son reproducibles con `Tools/palettize_encoder.py` y `Tools/export_model.py` del repositorio de Swiftlet. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO en la información disponible; estos detalles corresponden al modelo base upstream y no se reproducen aquí.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos, con salida de texto a partir de audio de cualquier frecuencia de muestreo.
- Transcripción de ficheros de audio completos, incluidos ficheros de 2–3 minutos, con un factor de tiempo real de 122× en M1 Pro.
- Procesamiento de audio en memoria (muestras crudas) y de ficheros en disco.
- Integración como biblioteca Swift (`SpeechEngine`, `ModelDownloader`) para apps macOS con sandbox.
- Dictado en vivo (live dictation) según la guía del repositorio de Swiftlet.
- Ejecución totalmente local en dispositivo, sin llamadas a red tras la descarga del modelo.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz en macOS: el motor mantiene el modelo cargado (~0,15 s de carga) y transcribe ficheros de 2–3 minutos en 0,95–1,41 s, lo que permite procesar lotes de grabaciones en segundo plano dentro de una app de productividad.
- Dictado en vivo en editores de texto: con 26 ms para clips de 0–3 s en M1 Pro, la latencia es compatible con la inserción de texto casi instantánea mientras el usuario habla.
- Subtitulado y transcripción de pódcast multilingües: la cobertura de 25 idiomas europeos permite generar transcripciones de contenido en inglés, alemán, francés, español, polaco, etc., sin cambiar de modelo.
- Apps de accesibilidad: la ejecución 100 % local y el bajo consumo de memoria (92 MB RSS en pico) permiten integrar transcripción en herramientas de asistencia sin enviar audio a servidores.
- Procesamiento por lotes en CI o scripts de línea de comandos: la CLI `swiftlet transcribe` acepta cualquier fichero de audio y cualquier frecuencia de muestreo, lo que facilita automatizar la transcripción de archivos archivados.
- Investigación en ASR y evaluación de cuantización: al ser reproducible el pipeline de paletización, sirve como referencia para estudiar el impacto de 4 bits sobre WER en distintos dominios (limpio, ruidoso, teléfono, jerga).
- Transcripción de audio telefónico o de baja calidad: el WER en alemán de calidad telefónica (19,38 %) es ligeramente mejor que el del modelo original (20,23 %), lo que lo hace apto para grabaciones de call center en ese idioma.

## Benchmarks y rendimiento

Medidos en un M1 Pro (16 GB) con 234 clips y 46 minutos de audio en inglés y alemán, mejor de dos ejecuciones por clip, frente a la versión original fp16 en Core ML sobre Neural Engine.

| Audio | Original (Core ML, fp16) | Swiftlet 4-bit | Aceleración |
|---|---|---|---|
| 0–3 s (19 clips) | 58 ms | 26 ms | 2,2× |
| 3–6 s (60 clips) | 70 ms | 42 ms | 1,7× |
| 6–10 s (59 clips) | 85 ms | 61 ms | 1,4× |
| 10–15 s (51 clips) | 108 ms | 99 ms | 1,1× |
| 15–30 s (40 clips) | 183 ms | 145 ms | 1,3× |
| Fichero de 2 min | 1,18 s | 0,95 s | 1,2× |
| Fichero de 3 min | 1,58 s | 1,41 s | 1,1× |

| Métrica | Original | Swiftlet 4-bit |
|---|---|---|
| 46 min de audio total | 29,2 s | 22,9 s |
| Factor de tiempo real | 0,0105 (95×) | 0,0082 (122×) |
| Carga inicial | 20,6 s (compilación Neural Engine) | 0,15 s |
| Carga posterior | 0,23 s | 0,13 s |

Precisión (WER, menor es mejor):

| Audio | Original | Swiftlet 4-bit |
|---|---|---|
| Todos los clips | 6,72 % | 6,75 % |
| Inglés limpio | 2,66 % | 3,11 % |
| Inglés, otros hablantes y acentos | 4,95 % | 4,69 % |
| Inglés, silencioso | 2,84 % | 2,58 % |
| Inglés, ruidoso | 5,34 % | 5,77 % |
| Alemán leído | 6,32 % | 7,94 % |
| Alemán, calidad telefónica | 20,23 % | 19,38 % |
| Jerga | 5,03 % | 5,03 % |
| Ficheros largos (2–3 min) | 6,18 % | 5,13 % |

175 de 234 transcripciones son idénticas palabra por palabra al original. Memoria y disco: pico de 92 MB RSS / 92 MB footprint (frente a 104 MB / 84 MB), pesos en un mapeo de 307 MB respaldado por fichero (paginable por macOS) y 344 MB en disco frente a 622 MB.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple silicon (M1 o posterior) y macOS 15 o superior. No funciona en Intel, Linux, Windows ni GPU NVIDIA.
- Memoria: pico de 92 MB RSS en la prueba de 5 ficheros, incluidos dos de 2–3 minutos; los pesos ocupan un mapeo de 307 MB que macOS puede paginar.
- Disco: 344 MB para los pesos; la descarga vía CLI ocupa 361 MB con verificación SHA-256.
- GPU recomendadas: no aplica el concepto de VRAM dedicada; se ejecuta sobre la GPU integrada vía Metal. El modelo original usaba Neural Engine; esta variante usa Metal (encoder) y NEON (decoder).
- Cabe en cualquier Mac con Apple silicon, incluidos modelos de 8 GB de memoria unificada.
- Despliegue: exclusivamente mediante el motor Swiftlet (CLI `swiftlet` o biblioteca Swift vía Swift Package Manager). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 26–145 ms por clip según duración, 122× tiempo real en total y 0,15 s de carga inicial en M1 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Fluid Speech Pro — Swiftlet 4-bit | ~0,6 B (base) | Clips y ficheros de hasta 3 min medidos | 25 europeos | CC BY 4.0 | Binarios Swiftlet, solo Apple silicon |
| Fluid Speech Pro original (Core ML, fp16) | ~0,6 B (base) | Igual | 25 europeos | CC BY 4.0 | Core ML, Neural Engine, Apple |
| Whisper large-v3 | 1,55 B | Ventana de 30 s | ~99 | MIT | Múltiples (GGUF, CTranslate2, etc.) |

Frente al original, la variante Swiftlet 4-bit gana en velocidad en clips cortos (2,2× en 0–3 s), reduce el tamaño en disco un 45 % y elimina la compilación inicial, con una pérdida de precisión global de 0,03 puntos de WER. Frente a Whisper large-v3, el modelo de FluidVoice es más pequeño y está restringido a Apple silicon, pero no se dispone de comparación directa de WER entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona con el motor Swiftlet: los ficheros no son compatibles con Core ML ni con otros runtimes. Para Core ML debe usarse la release original.
- Requiere Mac con Apple silicon y macOS 15 o superior; no hay soporte para otras plataformas.
- La cuantización a 4 bits degrada la precisión en algunos dominios: el alemán leído empeora de 6,32 % a 7,94 % de WER y el inglés limpio de 2,66 % a 3,11 %.
- Solo 175 de 234 transcripciones son idénticas al original; las diferencias provienen de los pesos del encoder a 4 bits.
- Cobertura limitada a 25 idiomas europeos; no se documentan idiomas asiáticos, africanos ni americanos distintos del inglés.
- Riesgo de alucinación y errores en audio ruidoso o de baja calidad: el WER en alemán telefónico supera el 19 %.
- No se documentan sesgos específicos por acento o variedad dialectal; los datos de evaluación se limitan a inglés y alemán.
- Licencia CC BY 4.0: permite uso comercial con atribución a FluidVoice, NVIDIA y Moondream; el repositorio no está afiliado ni respaldado por ellos.
- El proyecto tiene 0 descargas y 2 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/nahcmon/fluid-speech-pro-swiftlet-4bit
- Modelo base: https://huggingface.co/FluidVoice-Labs/fluid-speech-pro-coreml
- Repositorio Swiftlet: https://github.com/nahcmon/Swiftlet
- Guía de inicio de Swiftlet: https://github.com/nahcmon/Swiftlet#getting-started
- Script de paletización: https://github.com/nahcmon/Swiftlet/blob/main/Tools/palettize_encoder.py
- Script de exportación: https://github.com/nahcmon/Swiftlet/blob/main/Tools/export_model.py

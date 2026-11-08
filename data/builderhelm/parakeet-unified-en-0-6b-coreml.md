# BuilderHelm/Parakeet-Unified-EN-0.6B-CoreML

## Resumen

Parakeet Unified EN 0.6B Core ML es una conversión del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-unified-en-0.6b` de NVIDIA, empaquetada en formato Core ML para su ejecución local sobre Apple Silicon. La conversión la mantiene el proyecto BuilderHelm dentro de su SDK `BuilderHelmAudio`, y no implica reentrenamiento alguno: se parte del checkpoint original y se traduce la topología FastConformer-RNNT a programas `.mlpackage` que aprovechan la Neural Engine de los Mac con M1 o posterior y de dispositivos con iOS 18 o superior.

El modelo resuelve transcripción de voz a texto en inglés con puntuación y capitalización automáticas, en modo offline (atención de contexto completo). Se distribuye en dos variantes: FP16, con un codificador dividido en dos programas secuenciales de menos de 1 GB cada uno (1,34 GB en total), e INT8 por canales de salida con cómputo en FP16 (0,71 GB). Ambas comparten el mismo frontend FP32, el mismo predictor LSTM y el mismo joint RNN-T.

Su relevancia actual radica en que permite ASR de calidad cercana a la referencia NeMo enteramente en el dispositivo, sin envío de audio a la nube, con latencia baja y un consumo de almacenamiento contenido. La ventana de contexto de audio por petición es de hasta 30 segundos, aunque las grabaciones más largas se procesan mediante ventanas solapadas con recuperación acotada, sin límite fijo de duración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + RNN-T (encoder Conformer, predictor LSTM de 2 capas y 640 unidades, joint RNN-T de 1.024 tokens y blank) |
| Parametros totales | 0,6B (según el nombre del checkpoint base; desglose no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de audio de hasta 30 s por petición; grabaciones más largas mediante ventanas de 30 s con solapamiento, sin límite fijo |
| Tipos de cuantizacion | FP16 (encoder sin cuantizar, dos programas) e INT8 simétrico por canal de salida con cómputo FP16; frontend FP32 |
| Idiomas soportados | inglés (en) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | Core ML (`.mlpackage`), más `RnntDecoder.bin` en FP32, `vocab.json` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es FastConformer con decodificador RNN-T, el esquema habitual de NeMo para ASR. El paquete Core ML separa el modelo en varios componentes: un `Preprocessor.mlpackage` en FP32 que calcula características acotadas y aplica normalización por ventana completa (`normalize_w5` a `normalize_w30`); un codificador FastConformer en FP16 dividido en `Encoder.mlpackage` y `EncoderTail.mlpackage` (o un único `Encoder.mlpackage` en la variante INT8); un `Predictor.mlpackage` con la LSTM de dos capas y 640 unidades; y un `Joint.mlpackage` que produce la distribución sobre 1.024 tokens más el blank. Las cinco funciones de ventana (5, 10, 15, 20 y 30 s) comparten pesos, de modo que añaden aproximadamente un 3 % al tamaño de descarga en lugar de duplicar el codificador.

No hay entrenamiento adicional en esta conversión: se parte del checkpoint de NVIDIA y se traduce a Core ML. La model card no detalla el volumen de datos de entrenamiento original, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo base y no se incluye en la documentación de esta conversión. La innovación técnica destacable es la compilación local de los paquetes portables para la Neural Engine, la verificación SHA-256 de cada fichero contra un commit fijado y la reutilización de caché, junto con la selección automática de la ventana más pequeña que contiene cada petición.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas.
- Modo offline con atención de contexto completo (el modo streaming no está incluido en esta conversión).
- Procesamiento de audio por ventanas de 5, 10, 15, 20 o 30 segundos, eligiendo automáticamente la menor que cubre cada petición.
- Grabaciones de más de 30 segundos mediante ventanas de 30 s con cortes en pausas silenciosas, consenso de tokens solapados y recuperación acotada de ventanas en blanco.
- Salida enriquecida: tiempos por token y palabras con inicio, fin y confianza (agregado `min` sobre `max_prob` de NeMo).
- Ejecución totalmente en el dispositivo, sin que el audio ni las transcripciones salgan del equipo.
- Integración nativa en Swift mediante el SDK `BuilderHelmAudio` 0.4.0 o superior.
- No soporta CTC, keyword spotting, alternativas ordenadas, marcas de tiempo por segmento ni resultados parciales en vivo.

## Casos de uso

- Dictado local en macOS: integración en editores o apps de notas que transcriben la voz del usuario sin conexión, usando la ventana más pequeña posible (5 s) para minimizar latencia y aprovechando la caché del codificador entre peticiones consecutivas.
- Transcripción de reuniones y entrevistas: grabaciones de duración arbitraria se procesan con ventanas de 30 s solapadas y consenso de tokens, manteniendo las marcas de tiempo por palabra para generar actas o subtítulos sincronizados.
- Subtitulado de vídeo en pipelines de edición: la salida con tiempos de inicio y fin por palabra permite alinear subtítulos automáticamente con la pista de audio, todo en local.
- Aplicaciones de accesibilidad: dictado por voz para usuarios con movilidad reducida en iOS 18 o macOS 15, con la ventaja de que el audio permanece en el dispositivo y no requiere red.
- Procesamiento por lotes confidencial (legal, sanitario, investigación): transcripción de archivos de audio sensibles en un Mac sin exposición a servicios externos, con verificación de integridad de los pesos mediante SHA-256.
- Prototipado y evaluación de ASR en Apple Silicon: comparación de las variantes FP16 e INT8 con la referencia NeMo usando el SDK, útil para medir el impacto de la cuantización en la precisión para un corpus concreto.
- Herramientas de productividad de terceros: integración del descriptor `.parakeetUnifiedEn` o `.parakeetUnifiedEnInt8` en apps Swift existentes que necesiten transcripción puntual de clips cortos con bajo consumo de almacenamiento (0,71 GB en INT8).

## Benchmarks y rendimiento

WER de corpus con el normalizador de inglés de Whisper; los errores y las salidas vacías se mantienen en la puntuación. Referencia: modelo NeMo original en modo offline, decodificación greedy, CPU FP32. Los resultados de Swift provienen del SDK sobre un Mac con M5 (Neural Engine).

| Evaluación | NeMo | FP16 | INT8 |
|---|---:|---:|---:|
| 1.304 clips ≤ 15 s (LibriSpeech clean y other, Earnings-22) | 7,28 % | 7,31 % | 7,27 % |
| 937 clips reservados (Common Voice Spontaneous, Earnings-22, LibriSpeech other) | 10,70 % | 10,69 % | 10,72 % |
| 393 clips de LibriSpeech de 15–30 s | 2,02 % | 2,02 % | 2,02 % |
| 97 grabaciones de LibriSpeech | no disponible (dato truncado en la información) | no disponible | no disponible |

Los datos disponibles indican que la variante INT8 iguala en precisión a FP16 en todas las evaluaciones publicadas y además se ejecuta más rápido en la Neural Engine. No se han publicado cifras de latencia ni de throughput más allá del tiempo de compilación inicial (unos 45 s para INT8 en M5) y de carga posterior (unos 1,5 s).

## Requisitos de hardware

- Almacenamiento: 1,34 GB para la variante FP16 y 0,71 GB para INT8 (tamaño del repositorio: 2,0 GB con ambas).
- Plataformas objetivo: Macs con Apple Silicon M1 o posterior en macOS 15 o superior, y dispositivos con iOS 18 o superior.
- Aceleración: Neural Engine de Apple; los paquetes se compilan localmente y no se distribuye ningún modelo compilado específico por chip.
- Validación: hasta la fecha solo se ha validado en un Mac con M5; el rendimiento en otros chips no está medido.
- No se especifican requisitos de VRAM ni de memoria unificada más allá de lo anterior; no hay soporte documentado para GPU NVIDIA, vLLM, llama.cpp, Ollama ni TGI, dado que el formato es Core ML.
- Despliegue: SDK `BuilderHelmAudio` 0.4.0 o superior; conviene llamar a `prepare()` durante la configuración para compilar todas las ventanas una vez por build de macOS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Parakeet Unified EN 0.6B Core ML (este) | 0,6B | ventanas de 5–30 s, duración ilimitada por solapamiento | inglés | NVIDIA Open Model License | Core ML, Apple Silicon |
| nvidia/parakeet-unified-en-0.6b (base) | 0,6B | modo offline y streaming | inglés | NVIDIA Open Model License | NeMo (PyTorch), CPU/GPU |
| soloish90/parakeet-unified-en-0.6b-onnx-coreml | 0,6B | streaming por chunks con contexto [70, 7, 0] | inglés | no disponible en la información | ONNX y Core ML |

La diferencia principal frente al checkpoint original es el empaquetado para ejecución local en Apple Silicon y la ausencia del modo streaming. Frente a la conversión de `soloish90`, esta variante prioriza el modo offline con atención completa y ofrece dos niveles de cuantización con evaluación de WER publicada, mientras que aquella se orienta a inferencia en streaming por chunks.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe.
- El modo streaming no está incluido: únicamente se ejecuta el modo offline de contexto completo.
- No ofrece CTC, keyword spotting, alternativas ordenadas, marcas de tiempo por segmento ni resultados parciales en vivo.
- El rendimiento solo se ha validado en un Mac con M5; en otros chips Apple Silicon es desconocido.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; conviene revisar el texto completo antes de distribuirlo en un producto.
- Riesgo de alucinación y de errores en audio con ruido, acentos no nativos o vocabulario especializado; el WER en corpus espontáneo (Common Voice Spontaneous, Earnings-22) ronda el 10,7 %, muy por encima del de audio limpio.
- La primera carga tras la instalación o tras una actualización de macOS requiere compilar todas las ventanas (unos 45 s en INT8 sobre M5), lo que puede afectar a la experiencia de arranque si no se llama a `prepare()`.
- La información de la model card está truncada en el apartado de benchmarks; no se dispone del cuarto resultado ni de métricas de latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Parakeet-Unified-EN-0.6B-CoreML
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Repositorio del SDK: https://github.com/BuilderHelm/BuilderHelmAudio
- Perfil del autor: https://huggingface.co/BuilderHelm
- Producto ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Conversión alternativa en streaming (ONNX/Core ML): https://huggingface.co/soloish90/parakeet-unified-en-0.6b-onnx-coreml

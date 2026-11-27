# aystream/GigaAM-v4-e2e-rnnt-mlx

## Resumen

GigaAM-v4-e2e-rnnt-mlx es un port nativo a MLX del modelo de reconocimiento automático del habla ai-sage/GigaAM-v4, en su variante con cabeza RNN-Transducer (RNNT) de extremo a extremo. Lo publica el desarrollador aystream y su objetivo es ejecutar ASR de calidad sobre Apple Silicon sin depender de PyTorch, aprovechando el framework MLX de Apple para acelerar la inferencia en chips de la serie M. El modelo cubre ruso e inglés, con conmutación de código entre ambos idiomas.

La arquitectura subyacente es Zapformer: un frontend convolucional causal ConvNeXt en tres etapas (4x768, 11x1024 con stride 2x y 4x768), con RoPE intercalado y RMSNorm, seguido de una cabeza RNN-Transducer compuesta por un predictor LSTM y una red conjunta. El modelo tiene aproximadamente 236 millones de parámetros y un vocabulario de 1025 tokens (SentencePiece más blank).

Su relevancia práctica reside en dos factores. Por un lado, ofrece streaming nativo con ventanas de contexto de 160, 320 y 640 ms, lo que habilita transcripción en tiempo real sobre hardware de consumo. Por otro, el rendimiento medido es notable: unos 96x en tiempo real en FP16 sobre un MacBook Pro M2 Max, con paridad de texto decodificado respecto a la referencia en PyTorch. La licencia MIT facilita su adopción tanto en investigación como en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zapformer (frontend ConvNeXt causal en 3 etapas + cabeza RNN-Transducer con predictor LSTM y red conjunta) |
| Parametros totales | ~236M (236.327.324, cabeza e2e) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; soporta audio completo (probado con 22 minutos) y streaming con contexto de 160/320/640 ms |
| Tipos de cuantizacion | FP16 y FP32 documentados; cuantizaciones adicionales no disponibles |
| Idiomas soportados | Ruso (ru) e inglés (en), con conmutación de código |
| Licencia | MIT |
| Formato de pesos | MLX (librería mlx); tamano del repo 0.5 GB |
| Vocabulario | 1025 tokens (SentencePiece + blank) |
| Funcionalidades | Puntuación, normalización, streaming nativo |
| Modelo base | ai-sage/GigaAM-v4 (revision="rnnt") |

## Arquitectura y entrenamiento

El modelo replica la arquitectura Zapformer del GigaAM-v4 original. El frontend es una pila de bloques ConvNeXt causales organizados en tres etapas: 4 capas de 768 dimensiones, 11 capas de 1024 dimensiones con reducción de resolución 2x y 4 capas de 768 dimensiones, con RoPE intercalado y normalización RMSNorm. Sobre esta representación acústica se sitúa una cabeza RNN-Transducer formada por un predictor LSTM y una red conjunta que combina estados del encoder y del predictor para emitir tokens.

El port a MLX reproduce fielmente el comportamiento del modelo original: el autor reporta texto decodificado idéntico y deltas de paquetes de streaming equivalentes a la referencia en PyTorch CPU, con una diferencia absoluta media en el encoder inferior a 4e-6. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste por preferencias; esos detalles pertenecen al modelo base ai-sage/GigaAM-v4 y no se reproducen aquí.

La innovación técnica destacable es la implementación pura en MLX con soporte de streaming nativo y sin dependencia de PyTorch, lo que permite ejecutar el modelo de forma eficiente en Apple Silicon. El pipeline incluye extracción de características mel mediante librosa (coste aproximado de 3 ms) y decodificación RNNT sobre estados incrementales.

## Capacidades

- Reconocimiento automático del habla en ruso e inglés, con conmutación de código entre ambos idiomas dentro de una misma emisión.
- Transcripción offline de audio completo (full-context), probada con archivos de hasta 22 minutos.
- Streaming nativo en tiempo real con ventanas de contexto configurables de 160, 320 y 640 ms, con emisión de transcripciones parciales.
- Puntuación y normalización de texto integradas en la salida.
- Procesamiento de audio en formato WAV y otros contenedores mediante la utilidad de carga incluida (probado con MKV en CLI).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio completo en un MacBook Pro M2 Max a ~51x tiempo real (22 minutos en 25,7 s), lo que permite transcribir grabaciones largas sin enviar datos a la nube.
- Subtitulado en directo para contenido en ruso o inglés: el streaming con contexto de 320 ms produce paquetes cada ~17,3 ms (unos 18x tiempo real), adecuado para generar subtítulos con latencia baja en retransmisiones.
- Asistentes de voz en aplicaciones macOS/iOS: la integración vía MLX y la API de streaming permiten alimentar un pipeline de comandos de voz con transcripciones parciales incrementales.
- Análisis de llamadas de atención al cliente: la combinación de puntuación y normalización integradas reduce el postprocesado necesario para generar actas o resúmenes a partir de la transcripción.
- Investigación en ASR multilingüe: al ser un port fiel con paridad verificada frente a PyTorch, sirve como banco de pruebas para experimentos en Apple Silicon sin reescribir el pipeline.
- Procesamiento por lotes de archivos de audio en servidores con hardware Apple: el CLI `gigaam-mlx` permite automatizar transcripciones en pipelines de datos con licencia MIT.
- Prototipado de aplicaciones de dictado con mezcla ruso-inglés: la conmutación de código integrada evita tener que encadenar dos modelos monolingües.

## Benchmarks y rendimiento

Los datos disponibles son medidas de velocidad de inferencia, no de calidad (WER/CER). Se presentan a continuación tal como los publica el autor.

| Backend | Precision | Tiempo (audio de 19 s) | Tiempo real |
|---|---|---|---|
| MLX v4 RNNT (este modelo) | FP16 | 0,198 s | ~96x |
| MLX v4 RNNT (este modelo) | FP32 | 0,203 s | ~94x |
| PyTorch CPU v4 RNNT | FP32 | 0,490 s | ~39x |

| Escenario | Medida |
|---|---|
| Audio completo de 22 minutos (1319,4 s) | 25,7 s (~51x tiempo real) |
| Streaming, contexto 320 ms, FP32 | 17,3 ms por paquete (~18x tiempo real) |
| Paridad frente a PyTorch CPU | Texto idéntico; diferencia media absoluta del encoder <= 4e-6 |

No se han publicado resultados de benchmarks de calidad (WER, CER, MMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: con ~236M parámetros, los pesos en FP16 ocupan aproximadamente 0,47 GB y en FP32 unos 0,95 GB; el consumo total de memoria incluye estados del encoder, predictor y buffers de streaming, por lo que conviene reservar al menos 2 GB.
- Hardware objetivo: Apple Silicon (chips de la serie M). Las medidas publicadas corresponden a un MacBook Pro M2 Max.
- Cabe holgadamente en cualquier Mac con chip M1 o superior; no se documenta soporte para GPU NVIDIA ni CPU x86 en esta implementación MLX.
- Despliegue: librería `gigaam-mlx` instalable desde GitHub (`pip install git+https://github.com/aystream/gigaam-mlx.git`), con API Python (`load_model`, `transcribe`, `create_stream`) y CLI (`gigaam-mlx`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este runtime.
- Latencia y throughput: ~96x tiempo real en FP16 para audio completo; ~18x tiempo real en modo streaming con contexto de 320 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Runtime | Licencia |
|---|---|---|---|---|---|
| GigaAM-v4-e2e-rnnt-mlx (este) | ~236M | ru, en | Sí (160/320/640 ms) | MLX (Apple Silicon) | MIT |
| ai-sage/GigaAM-v4 (original) | ~236M | ru, en | Sí (mismas ventanas) | PyTorch | MIT |
| Whisper (variantes small/medium) | 244M / 769M | Multilingüe amplio | No nativo | PyTorch, CTranslate2, etc. | MIT |

El modelo original en PyTorch es la referencia directa: misma arquitectura y misma calidad de salida, pero sin aceleración MLX. Frente a Whisper, la comparación es cualitativa: GigaAM-v4 está especializado en ruso e inglés con streaming nativo, mientras que Whisper cubre más idiomas pero no ofrece decodificación incremental nativa. No se dispone de datos de WER comparativos en la información proporcionada para cuantificar la diferencia de calidad.

## Limitaciones y advertencias

- Solo cubre ruso e inglés; no es un modelo multilingüe general y su rendimiento en otros idiomas no está documentado.
- El streaming introduce contexto limitado (160/320/640 ms), lo que puede degradar la precisión en comparación con el modo full-context, especialmente en audio ruidoso o con cambios de hablante.
- No se han publicado métricas de calidad (WER/CER) ni evaluaciones de sesgo en la información disponible; el riesgo de alucinación en pasajes ininteligibles o con música no está cuantificado.
- Dependencia exclusiva de MLX y Apple Silicon: no es desplegable en GPU NVIDIA ni en servidores x86 convencionales sin reescribir el runtime.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación reciente sin validación comunitaria amplia.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base ai-sage/GigaAM-v4 y de los datos de entrenamiento originales antes de un uso comercial a gran escala.
- La extracción de características mel depende de librosa, lo que añade una dependencia Python adicional al pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aystream/GigaAM-v4-e2e-rnnt-mlx
- Código del port MLX: https://github.com/aystream/gigaam-mlx
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- Repositorio original GigaAM: https://github.com/salute-developers/GigaAM

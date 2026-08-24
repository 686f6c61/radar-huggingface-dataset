# Rekody/rekody-streaming-en-0.6b-160ms-int8

## Resumen

Rekody/rekody-streaming-en-0.6b-160ms-int8 es una conversión a ONNX con cuantización int8 dinámica del modelo NVIDIA Nemotron Speech Streaming 0.6B (checkpoint de marzo de 2026), exportada por Rekody con el perfil de latencia de 160 ms. El modelo es un sistema de reconocimiento automático del habla (ASR) en streaming, basado en una arquitectura RNN-T, diseñado para transcribir audio en inglés mientras se habla, con una latencia de 160 ms por fragmento y manteniendo una caché del encoder entre fragmentos. Está pensado para dictado por voz local en macOS, sin enviar audio a la nube.

La conversión incluye cuatro archivos: `encoder.onnx` (int8, 880 MB), `decoder_joint.onnx` (int8, 11 MB), `tokenizer.model` (SentencePiece) y `config.json`. Se ejecuta sobre el proveedor de ejecución CPU de ONNX Runtime, o mediante la biblioteca Rust `parakeet-rs` (versión >= 0.3.7). El perfil de 160 ms está fijado en el grafo exportado, por lo que este artefacto no es intercambiable con la versión de 560 ms del mismo autor.

La relevancia de este modelo radica en su capacidad de ejecución local, privada y de baja latencia sobre CPU, sin necesidad de GPU, lo que lo hace adecuado para aplicaciones de dictado en dispositivos de escritorio. La cuantización int8 apenas degrada la precisión: en LibriSpeech test-clean, la diferencia frente al modelo fp32 es de +0,072 puntos porcentuales de WER, con un intervalo de confianza que incluye cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-T (encoder + decoder/joint) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 160 ms por fragmento (2 frames de salida, 25 mel frames por llamada, 2560 muestras de audio a 16 kHz) con caché previa de 9 frames |
| Tipos de cuantizacion | int8 dinamico (QInt8) sobre operaciones MatMul y LSTM; embedding en fp32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Doble: PolyForm Shield 1.0.0 (trabajo de conversion) + NVIDIA Open Model License (pesos base) |
| Formato de pesos | ONNX (encoder.onnx, decoder_joint.onnx) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron Speech Streaming 0.6B, un sistema ASR en streaming basado en RNN-T (Recurrent Neural Network Transducer). La arquitectura se compone de un encoder que procesa fragmentos de audio con atención con contexto derecho (right-context) y una caché que se arrastra entre llamadas, junto con una red decoder/joint que produce las unidades de texto. El checkpoint de marzo de 2026 soporta varios perfiles de latencia, definidos por el parámetro R (número de frames de contexto derecho). Este repositorio usa R=1, lo que produce 2 frames de encoder por fragmento (160 ms).

El entrenamiento original fue realizado por NVIDIA; no se han publicado detalles sobre el dataset o el proceso de entrenamiento en la informacion disponible. La conversion a ONNX int8 fue realizada por Rekody utilizando el script de exportacion de NeMo 2.7.3 y la funcion `quantize_dynamic` de onnxruntime 1.23.2, aplicada sobre operaciones MatMul y LSTM. La exportacion se valido comparando las salidas con el paso de streaming de NeMo, obteniendo una diferencia absoluta maxima de 0.0. El decoder_joint resulto bit-identico al del repositorio de 560 ms, y el tokenizer es byte-identico, lo que confirma la reproducibilidad del pipeline.

## Capacidades

- Reconocimiento automatico del habla (ASR) en streaming: transcribe audio mientras se habla, en fragmentos de 160 ms, con caché del encoder entre fragmentos.
- Baja latencia: 160 ms por fragmento, adecuado para dictado en tiempo real.
- Salida con puntuacion y capitalizacion nativas, sin post-procesamiento adicional (segun la tarjeta del modelo base de NVIDIA).
- Ejecucion local en CPU: no requiere GPU, funciona con ONNX Runtime CPU execution provider o con `parakeet-rs`.
- Privacidad: todo el procesamiento se realiza en el dispositivo, sin envio de audio a servidores externos.
- Soporte de carga directa con onnxruntime o parakeet-rs, con metadatos en el encoder (`chunk_size_output_frames=2`, `pre_encode_cache=9`) que permiten a los consumidores configurar el streaming correctamente.

## Casos de uso

- Dictado por voz en macOS: el modelo es el motor detras de Rekody, una herramienta de dictado local para macOS. Permite transcribir texto mientras el usuario habla, con latencia de 160 ms, sin conexion a internet.
- Transcripcion de reuniones en tiempo real: aunque el perfil de 160 ms esta optimizado para habla cercana de un solo hablante, puede usarse en escenarios de transcripcion en vivo donde la latencia sea critica y el audio sea de campo cercano.
- Asistentes de voz locales: integracion en aplicaciones de escritorio que requieran comandos de voz o dictado sin depender de servicios en la nube, cumpliendo requisitos de privacidad estrictos.
- Accesibilidad: herramientas de escritura asistiva para personas con movilidad reducida, donde el dictado local y de baja latencia mejora la experiencia de uso.
- Automatizacion de documentacion medica o legal: transcripcion de notas dictadas en entornos donde la confidencialidad impide el uso de servicios cloud, aprovechando la ejecucion local en CPU.
- Desarrollo de aplicaciones de transcripcion embebidas: gracias al formato ONNX y al soporte de parakeet-rs, puede integrarse en aplicaciones Rust o Python para plataformas de escritorio o edge.

## Benchmarks y rendimiento

NVIDIA publica valores de WER (Word Error Rate) para este checkpoint en funcion del tamaño de fragmento, sobre los ocho conjuntos del Open ASR Leaderboard. Rekody reproduce estos datos en la model card como informacion de referencia, no como mediciones propias. No se han publicado resultados de benchmarks medidos por Rekody para este perfil de 160 ms.

| Fragmento | R | Promedio | AMI | Earnings22 | Gigaspeech | LS-clean | LS-other | SPGI | TEDLIUM | VoxPopuli |
|---|---|---|---|---|---|---|---|---|---|---|
| 0.56 s | 6 | 7.07 | 11.88 | 12.82 | 9.78 | 2.46 | 5.07 | 3.03 | 3.54 | 8.00 |
| 0.16 s | 1 | 7.67 | 14.71 | 13.01 | 10.34 | 2.56 | 5.57 | 3.25 | 3.77 | 8.18 |

La diferencia media entre ambos perfiles es de +0,60 puntos porcentuales, pero el conjunto AMI (reuniones multiparte de campo lejano) contribuye con +2,83 puntos. Excluyendo AMI, la media de los siete conjuntos restantes pasa de 6,39% a 6,67%, una diferencia de solo +0,28 puntos. Para dictado de un solo hablante en campo cercano, el valor relevante es el menor.

Ademas, la cuantizacion int8 fue evaluada en el repositorio de 560 ms: en LibriSpeech test-clean (n=2620), el modelo int8 difiere del fp32 en +0,072 pp de WER, con un intervalo de confianza bootstrap del 95% de [-0,004, +0,150], que incluye cero, indicando que el coste de la cuantizacion es estadisticamente nulo.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- RAM estimada: el encoder ocupa 880 MB y el decoder 11 MB en disco; en memoria, con el overhead de onnxruntime, se estima un consumo de 1-2 GB, aunque no se ha publicado un valor exacto.
- GPU recomendadas: ninguna; el modelo esta disenado para CPU.
- Compatibilidad con GPU de consumo: no aplica, aunque podria ejecutarse en GPU si se desea, no es el objetivo.
- Opciones de despliegue: onnxruntime (Python o C++), parakeet-rs (Rust), o cualquier runtime que soporte ONNX.
- Latencia: 160 ms por fragmento de audio, con caché de 9 frames previos. El throughput no ha sido publicado, pero al ser un modelo de 0.6B en CPU, es adecuado para dictado interactivo en un solo hilo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Latencia | WER promedio (Open ASR) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Rekody rekody-streaming-en-0.6b-160ms-int8 | RNN-T | 0.6B | 160 ms | 7.67% | PolyForm Shield + NVIDIA Open Model | ONNX int8 |
| Rekody rekody-streaming-en-0.6b-int8 (560 ms) | RNN-T | 0.6B | 560 ms | 7.07% | PolyForm Shield + NVIDIA Open Model | ONNX int8 |
| NVIDIA Nemotron Speech Streaming 0.6B (fp32) | RNN-T | 0.6B | Configurable | 7.07% (a 560 ms) | NVIDIA Open Model | NeMo / ONNX |

La diferencia principal entre las dos versiones de Rekody es el perfil de latencia: 160 ms frente a 560 ms. El perfil de 160 ms sacrifica +0,60 pp de WER promedio, aunque la mayor parte de esa degradacion se concentra en el conjunto AMI. Frente al modelo base fp32, la version int8 de Rekody anade una degradacion de +0,072 pp en LibriSpeech test-clean, dentro del margen estadistico. No se dispone de comparaciones con otros ASR streaming como Whisper o Parakeet en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidad multilingue.
- El perfil de 160 ms esta fijado en el grafo ONNX: alimentar el encoder con fragmentos de 560 ms (65 mel frames) devuelve solo los primeros 2 frames de salida y descarta silenciosamente el resto del audio, sin generar error. No es un reemplazo directo de la version de 560 ms.
- La licencia PolyForm Shield 1.0.0 es una licencia no compete: se permite cualquier uso excepto proporcionar un producto que compita con el software o con los productos del licenciante construidos sobre el. Ademas, los pesos base estan sujetos a la NVIDIA Open Model License, que debe cumplirse por separado.
- No se han publicado mediciones propias de Rekody en el Open ASR Leaderboard para este perfil; los datos de WER provienen de NVIDIA y corresponden al checkpoint base, no a la conversion int8.
- El modelo esta optimizado para habla cercana de un solo hablante; en escenarios de campo lejano o multiples hablantes (como reuniones), el WER aumenta significativamente (ver AMI: 14.71%).
- Riesgo de alucinacion o errores de transcripcion en audio con ruido o acentos no representados en el entrenamiento, aunque no se han documentado casos especificos.
- Para produccion, es necesario verificar la compatibilidad de la version de onnxruntime o parakeet-rs con los metadatos del encoder (`chunk_size_output_frames` y `pre_encode_cache`), ya que versiones antiguas de parakeet-rs (< 0.3.7) usan valores por defecto que no coinciden con este perfil.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rekody/rekody-streaming-en-0.6b-160ms-int8
- Repositorio de la version 560 ms: https://huggingface.co/Rekody/rekody-streaming-en-0.6b-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Pagina de NVIDIA NIM para Nemotron ASR streaming: https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
- Repositorio GitHub de Rekody: https://github.com/rekody/rekody
- Licencia PolyForm Shield 1.0.0: https://polyformproject.org/licenses/shield/1.0.0
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/

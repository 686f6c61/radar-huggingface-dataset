# iapp/OpenThai2.0-ASR-Streaming-ONNX

## Resumen

OpenThai2.0-ASR-Streaming-ONNX es la exportación a ONNX del modelo de reconocimiento automático del habla (ASR) en tailandés de iApp, OpenThai2.0-ASR-Streaming. El modelo original se distribuye como checkpoint de NeMo; esta versión se ha convertido para que funcione exclusivamente con ONNX Runtime, sin necesidad de Python ni PyTorch, lo que permite su despliegue en CPU. Es la variante que la aplicación ChindaBot descarga para su función de dictado por micrófono.

Técnicamente se trata de un encoder FastConformer cache-aware de 24 capas y 1024 dimensiones (609 M parámetros) con un prompt de idioma, acoplado a un decoder RNN-T basado en una LSTM de 2 capas y 640 unidades sobre un vocabulario de 14.988 piezas SentencePiece, sumando 640 M parámetros en total. El modelo está construido sobre el modelo ASR streaming de NVIDIA Nemotron y está especializado en tailandés, con soporte de un modo mixto tailandés-inglés mediante el prompt de idioma.

Su relevancia radica en que ofrece inferencia streaming de ASR en tailandés sobre CPU con un único runtime, lo que lo hace adecuado para aplicaciones de escritorio y dictado sin dependencias pesadas de aprendizaje profundo. El repo ocupa 3,6 GB e incluye pesos en fp32 e int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T (decoder-joint con LSTM de 2 capas) |
| Parametros totales | 640 M (609 M en el encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en streaming; sin ventana de contexto declarada) |
| Tipos de cuantizacion | fp32 e int8 (MatMuls del encoder cuantizados a int8) |
| Idiomas soportados | tailandés (th); modo mixto tailandés-inglés mediante prompt_index 63 |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | ONNX (encoder.onnx + encoder.onnx.data, decoder_joint.onnx, tokens.txt) |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer cache-aware de 24 capas con anchura 1024 y atención con contexto [56, 6], seguido de un decoder RNN-T que realiza una decodificación greedy paso a paso. La entrada es audio mono a 16 kHz representado como 128 bandas log-mel (ventana Hann de 25 ms, hop de 10 ms, pre-énfasis 0.97, sin normalización). El encoder recibe `audio_signal` con forma `[1, 128, T]`, `length` y `prompt_index` (32 para tailandés, 63 para tailandés mezclado con inglés) y produce `encoded` con forma `[1, T/8, 1024]` con el prompt ya aplicado. El decoder-joint procesa un único paso greedy con `encoder_outputs` `[1, 1024, 1]`, `targets` `[1, 1]`, `target_length` y los dos estados de la LSTM `[2, 1, 640]`, devolviendo 14.989 puntuaciones (la última es el blank, id 14988) y los estados siguientes.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está construido sobre el modelo ASR streaming de NVIDIA Nemotron. La exportación a ONNX se realizó el 10 de noviembre de 2026 con opset 17. Una implementación de referencia en numpy + ONNX Runtime y la implementación en Rust de ChindaBot producen el mismo texto que el modelo NeMo original, token a token, en tres clips de 3,5 s, 8 s y 26 s. En un Apple M3 Max (CPU), el modelo en precisión completa procesa 3,5 s de habla en 0,16 s.

## Capacidades

- Reconocimiento automático del habla en tailandés con inferencia en streaming.
- Modo mixto tailandés-inglés mediante el prompt de idioma (prompt_index 63).
- Decodificación greedy RNN-T paso a paso, apta para transcripción incremental.
- Ejecución sobre CPU con ONNX Runtime, sin Python ni PyTorch.
- Ajuste del sesgo del token blank antes del argmax (−1,0 en modo estándar; −2,5 para clips de menos de dos segundos).
- Entrada de audio mono a 16 kHz con extracción de características log-mel de 128 bandas.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Dictado por micrófono en aplicaciones de escritorio: ChindaBot usa esta build para convertir voz en texto en tiempo real sobre CPU, sin requerir stack de PyTorch.
- Transcripción de reuniones y notas de voz en tailandés: el modo streaming permite ir generando texto a medida que se habla, con latencia baja (0,16 s para 3,5 s de audio en M3 Max).
- Subtitulado en vivo de contenido en tailandés: la decodificación incremental encaja en pipelines que necesitan texto parcial antes de cerrar el segmento.
- Asistentes de voz locales en dispositivos sin GPU: al ejecutarse con ONNX Runtime en CPU, es viable en equipos de usuario final.
- Procesamiento por lotes de archivos de audio en servidores sin aceleradores: la variante int8 reduce el peso del encoder a 0,88 GB y facilita el despliegue en contenedores modestos.
- Transcripción bilingüe tailandés-inglés en entornos de atención al cliente o soporte: el prompt 63 permite manejar mezcla de idiomas en una misma emisión.
- Integración en aplicaciones Rust nativas: existe una implementación de referencia en Rust (ChindaBot) que reproduce la salida del modelo NeMo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una medición de latencia: en un Apple M3 Max (CPU), el modelo en fp32 transcribe 3,5 s de habla en 0,16 s. Los archivos int8 produjeron el mismo texto en los dos clips más cortos y difirieron en dos puntos menores en el clip más largo; su precisión sobre habla real no se ha medido.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para ejecución en CPU con ONNX Runtime.
- Peso en disco: encoder fp32 2,45 GB + grafo y decoder (~149 MB en zip); encoder int8 0,88 GB + grafo y decoder (~109 MB en zip).
- GPU recomendadas: no disponibles; no se documenta ejecución en GPU.
- Compatibilidad con GPU de consumo: no documentada; el diseño apunta a CPU.
- Opciones de despliegue: ONNX Runtime (referencia numpy + ONNX Runtime), implementación en Rust de ChindaBot.
- Latencia: 0,16 s para 3,5 s de audio en Apple M3 Max (CPU, fp32). Throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de ASR en tailandés ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Especializado únicamente en tailandés; el modo mixto con inglés depende del prompt_index 63 y no se documenta su cobertura.
- La precisión de la variante int8 sobre habla real no se ha medido; la model card recomienda usar fp32 en caso de duda.
- El decoder requiere aplicar un sesgo al score del token blank antes del argmax (−1,0 estándar; −2,5 para clips de menos de dos segundos); omitirlo altera la salida.
- El formato de entrada exige audio mono a 16 kHz con extracción log-mel concreta (ventana Hann 25 ms, hop 10 ms, pre-énfasis 0,97, sin normalización); desviarse de esta configuración puede degradar la transcripción.
- Los zips `.asr.zip` están almacenados sin comprimir y deben descomprimirse en la carpeta que contiene su `.onnx.data`.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial; la model card remite al archivo LICENSE y a https://openmdw.ai/license/1-1/.
- No se documentan sesgos, tasas de alucinación ni límites de longitud de audio más allá de los clips de prueba.
- El modelo se basa en el modelo ASR streaming de NVIDIA Nemotron; conviene verificar las condiciones heredadas de esa base.

## Enlaces

- Hugging Face: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming-ONNX
- ChindaBot: https://huggingface.co/iapp/chindabot
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Resultados de búsqueda web no relevantes para el modelo (corresponden a la International Association of Privacy Professionals, sin relación con iApp).

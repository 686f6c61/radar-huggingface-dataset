# DonYin/gigaam-multilingual-v2-onnx

## Resumen

GigaAM-Multilingual-v2 ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) GigaAM-Multilingual-v2, desarrollado originalmente por Salute Developers (Sber) bajo licencia MIT. Esta versión, publicada por el usuario DonYin, convierte el modelo RNN-T original a grafos ONNX ejecutables únicamente con ONNX Runtime, sin dependencia de Python ni PyTorch en tiempo de inferencia. El objetivo es facilitar su integración en aplicaciones nativas, en este caso un plugin Swift para la aplicación TypeWhisper en macOS.

El modelo cubre 21 idiomas (ruso, inglés, kazajo, kirguís, uzbeko, bielorruso, francés, español, bashkir, georgiano, armenio, rumano, turcomano, azerí, tayiko, alemán, italiano, neerlandés, polaco, portugués y tártaro) y no incluye chino. La arquitectura es un transformer RNN-T con salida puntuada y con mayúsculas, lo que significa que genera transcripciones directamente formateadas sin necesidad de postprocesado. La exportación incluye cuantización dinámica int8 del encoder, reduciendo el peso a 781 MB y permitiendo ejecución eficiente en CPU.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y portable para ASR multilingüe en producción, con un rendimiento en inglés que supera a Whisper large-v3 turbo y a Parakeet TDT 0.6B v3 en el conjunto de evaluación del autor, con un consumo de memoria notablemente inferior (1,5 GB frente a 2,3-2,6 GB). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN-T (transformer encoder + decoder con bucle greedy) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa clips de hasta ~20 s por inferencia) |
| Tipos de cuantización | int8 dinámica (solo MatMul/Gemm), fp32, int4 (MatMulNBits, block 32) |
| Idiomas soportados | 21: ru, en, kk, ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder int8, decoder ONNX, vocabulario SentencePiece) |

## Arquitectura y entrenamiento

El modelo original GigaAM-Multilingual-v2 es un sistema ASR basado en RNN-T (Recurrent Neural Network Transducer), que combina un encoder transformer con un decoder y una red de unión para la predicción token a token. La exportación ONNX separa el encoder (cuantizado a int8 mediante cuantización dinámica de operaciones MatMul/Gemm) y el grafo de avance que contiene el bucle greedy RNN-T completo. El encoder procesa características log-mel de 16 kHz y 64 bandas, idénticas a las de GigaAM v3, y recibe un vector de lenguaje one-hot de 32 dimensiones que permite seleccionar el idioma o activar la detección automática.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card indica que el modelo original es puntuado y con mayúsculas, lo que sugiere un entrenamiento supervisado con datos anotados de forma consistente. La innovación técnica destacable de esta exportación es la inclusión de una salida `token_frames` que proporciona marcas de tiempo por palabra (aproximadamente 40 ms por frame), lo que facilita la alineación temporal en aplicaciones de subtitulado o transcripción sincronizada.

## Capacidades

- Reconocimiento automático del habla multilingüe en 21 idiomas, con detección automática de idioma o selección manual mediante un vector one-hot.
- Transcripción puntuada y con mayúsculas directamente desde el modelo, sin necesidad de postprocesado.
- Generación de marcas de tiempo por palabra a través de la salida `token_frames` (resolución de ~40 ms por frame).
- Ejecución en CPU mediante ONNX Runtime, sin dependencias de Python o PyTorch en inferencia.
- Soporte de cuantización int8 e int4 para reducir requisitos de memoria.
- Procesamiento de clips de hasta ~20 segundos por inferencia, con posibilidad de padding para clips más cortos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente ASR).
- No incluye capacidades de visión, audio generativo ni modo thinking.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones nativas de macOS: el modelo se integra vía ONNX Runtime en un plugin Swift para TypeWhisper, permitiendo transcripción local sin conexión y con marcas de tiempo por palabra para resaltar el habla en curso.
- Subtitulado automático de vídeos multilingües: gracias a la salida `token_frames`, se pueden generar subtítulos sincronizados con precisión de ~40 ms, adecuado para plataformas de vídeo bajo demanda o herramientas de edición.
- Atención al cliente basada en voz: el modelo puede transcribir llamadas o mensajes de voz en 21 idiomas con puntuación y mayúsculas, facilitando el análisis posterior y la generación de resúmenes automáticos en centros de contacto.
- Sistemas de dictado por voz en entornos profesionales: la ejecución en CPU con 1,5 GB de memoria permite desplegar dictado en portátiles sin GPU, con latencia de 30-43 veces tiempo real en Apple M-series.
- Indexación y búsqueda de archivos de audio: la transcripción con timestamps permite crear índices searchables de grabaciones largas divididas en clips de ~20 s, útil en archivos de medios o compliance.
- Aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones presenciales o conferencias en dispositivos de gama media, sin necesidad de infraestructura cloud, gracias al bajo consumo de memoria del encoder int8.
- Localización de contenido audiovisual: el soporte de 21 idiomas permite transcribir material en lenguas menos comunes (kazajo, kirguís, bashkir, tártaro) para su posterior traducción o subtitulado.

## Benchmarks y rendimiento

Los datos de benchmark proporcionados por el autor se refieren únicamente al inglés, evaluados sobre 790 enunciados (~50 minutos) muestreados de cinco conjuntos de test del Open ASR Leaderboard: LibriSpeech test-other, VoxPopuli, AMI, Earnings22 y GigaSpeech. La métrica WER es la media sobre los cinco conjuntos tras la normalización de inglés de Whisper. La F1 de puntuación cubre comas, puntos y signos de interrogación, excluyendo LibriSpeech.

| Modelo | WER % | F1 puntuación | Memoria pico |
|---|---|---|---|
| Esta exportación, encoder fp32 | 7,60 | 81,9 | 3,6 GB |
| **Esta exportación, encoder int8** | **7,80** | **81,7** | **1,5 GB** |
| Esta exportación, encoder int4 (MatMulNBits, block 32) | 7,92 | 81,2 | 1,2 GB |
| GigaAM-v4 RNN-T, int8 ONNX (solo inglés y ruso) | 8,42 | 77,1 | 0,65 GB |
| Parakeet TDT 0.6B v3 (MLX) | 9,59 | 76,9 | 2,6 GB |
| Whisper large-v3 turbo (MacWhisper, Neural Engine) | 9,95 | 76,9 | 2,3 GB |

Con detección automática de idioma, la exportación int8 obtiene un 8,20 % de WER y 82,0 de F1 de puntuación. El encoder int8 transcribe a aproximadamente 30-43 veces tiempo real en una CPU Apple M-series. No se han publicado resultados de benchmarks para los otros 20 idiomas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; para GPU, el encoder int8 requiere ~1,5 GB de memoria pico, el fp32 ~3,6 GB y el int4 ~1,2 GB.
- GPU recomendadas: no se especifican en la información disponible; al ser ONNX Runtime, puede ejecutarse en GPU con los proveedores CUDA o TensorRT, pero no hay datos de rendimiento en GPU.
- Cabe en GPU consumer: sí, con 1,5 GB de memoria pico el encoder int8 cabe en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050, RTX 3050).
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración nativa en Swift para macOS, sin soporte documentado para vLLM, llama.cpp, Ollama o TGI (no son aplicables a ASR).
- Latencia y throughput: ~30-43x tiempo real en CPU Apple M-series con encoder int8; no se dispone de datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER inglés % | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM-Multilingual-v2 ONNX (este) | no disponible | clips ~20 s | 7,80 (int8) | MIT | Hugging Face (DonYin) |
| GigaAM-v4 RNN-T int8 ONNX | no disponible | no disponible | 8,42 | MIT | Hugging Face |
| Parakeet TDT 0.6B v3 (MLX) | 0,6 B | no disponible | 9,59 | no disponible | MLX |
| Whisper large-v3 turbo | no disponible (large) | 30 s | 9,95 | MIT | Múltiples |

La comparativa se limita al inglés porque no hay datos publicados para los otros idiomas. GigaAM-Multilingual-v2 ONNX ofrece el mejor WER y F1 de puntuación de la tabla, con un consumo de memoria intermedio (1,5 GB) y licencia MIT permisiva. GigaAM-v4 tiene menor memoria (0,65 GB) pero solo cubre inglés y ruso. Parakeet y Whisper tienen peor WER en este conjunto de evaluación según los datos del autor.

## Limitaciones y advertencias

- El modelo no incluye chino entre sus idiomas soportados, lo que limita su uso en entornos con requisitos de ASR en chino.
- No se han publicado resultados de benchmarks para los 20 idiomas distintos del inglés, por lo que el rendimiento en lenguas como kazajo, kirguís o tártaro es desconocido.
- La evaluación se realizó con un conjunto de test de ~50 minutos muestreado de cinco corpus; los resultados pueden no generalizar a dominios muy diferentes (audio telefónico, ruido industrial, acentos marcados).
- El modelo procesa clips de hasta ~20 s por inferencia; para audio más largo es necesario segmentar, lo que puede introducir errores en las fronteras.
- La cuantización int8 reduce la precisión ligeramente (7,80 % vs 7,60 % WER en fp32) y la int4 más aún (7,92 %), aunque el impacto es moderado.
- Riesgo de alucinación inherente a los modelos ASR: en segmentos con silencio o ruido, el modelo puede generar texto espurio, especialmente con el bucle greedy RNN-T.
- La licencia MIT permite uso comercial sin restricciones, pero el autor original del modelo es Salute Developers; se recomienda citar adecuadamente.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; úsese con precaución en producción sin una evaluación propia.
- No se proporciona información sobre sesgos demográficos o acústicos del modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/DonYin/gigaam-multilingual-v2-onnx
- Repositorio original GigaAM: https://github.com/salute-developers/GigaAM
- TypeWhisper (aplicación macOS): https://github.com/TypeWhisper/typewhisper-mac
- Open ASR Leaderboard (dataset de evaluación): https://huggingface.co/datasets/hf-audio/open-asr-leaderboard
- Script de exportación: incluido en el repositorio como `export-gigaam-onnx.py`

# AXERA-TECH/FireRedASR-AED

## Resumen

FireRedASR-AED es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por el equipo FireRed de Xiaohongshu (RED) y adaptado por AXERA-TECH para su despliegue en el procesador NPU AX650N. Se trata de la variante AED-L (Attention-based Encoder-Decoder) del proyecto FireRedASR, un sistema ASR industrial de código abierto que alcanza resultados de última generación en mandarín y ofrece soporte para inglés y dialectos chinos.

La relevancia de este modelo radica en su despliegue en hardware de borde: AXERA-TECH ha convertido el modelo original a formato axmodel mediante la herramienta Pulsar2 7.0-lite, permitiendo su ejecución en el SoC AX650N de Axera con un factor de tiempo real (RTF) de aproximadamente 0.3 en Python y 0.225 con el SDK C++. El modelo soporta entrada de audio de hasta 10 segundos por segmento, con segmentación automática mediante VAD (FSMN-VAD) para audios de mayor duración.

El repositorio incluye tanto el modelo convertido como una implementación completa de servidor compatible con la API de OpenAI para transcripciones de audio, disponible en Python (con dependencias mínimas: numpy, pyaxengine y kaldi-native-fbank) y en C++ precompilado. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Decoder con atención (AED), variante AED-L |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 10 segundos de audio por segmento (con VAD para audios largos) |
| Tipos de cuantizacion | Encoder U16, decoder U8 (calibración densa, Pulsar2 7.0-lite) |
| Idiomas soportados | Chino (mandarín), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | axmodel (formato propietario de Axera para NPU) |

## Arquitectura y entrenamiento

FireRedASR-AED es un modelo de reconocimiento del habla basado en la arquitectura encoder-decoder con mecanismos de atención. El encoder procesa la señal de audio (representada mediante características de banco de filtros) y el decoder genera la transcripción de forma autorregresiva. La variante AED-L es la de mayor capacidad dentro de la familia FireRedASR-AED.

El modelo original fue entrenado por el equipo FireRed de Xiaohongshu con datos industriales a gran escala, aunque los detalles exactos del conjunto de datos (número de tokens, composición, etc.) no se especifican en la información disponible. El proyecto original reporta que el modelo está diseñado principalmente para mandarín, con buena generalización a dialectos chinos e inglés.

La adaptación para AX650N realizada por AXERA-TECH implica la conversión del modelo a formato axmodel mediante la herramienta Pulsar2 7.0-lite, con cuantización del encoder a U16 y del decoder a U8 con calibración densa. Además, se integra un VAD basado en FSMN (procedente de FunASR) que actúa como puerta de voz en el NPU, permitiendo procesar audios largos mediante segmentación en bloques de 10 segundos.

## Capacidades

- Transcripción de voz a texto en chino mandarín e inglés.
- Procesamiento de audio de larga duración mediante segmentación automática con VAD (bloques de 10 segundos).
- Detección de actividad de voz (VAD) integrada: los bloques con voz de al menos 1 segundo se envían al ASR; los bloques de silencio o ruido devuelven salida vacía, evitando alucinaciones.
- Adaptación a grabaciones de campo lejano y baja relación señal-ruido (SNR), con capacidad de transcribir grabaciones estéreo de 3 minutos completas.
- API compatible con OpenAI (`POST /v1/audio/transcriptions` y `GET /v1/models`), lo que facilita la integración con herramientas existentes.
- Implementación tanto en Python (con dependencias mínimas) como en C++ precompilado.
- Ejecución en hardware de borde (NPU AX650N) sin necesidad de GPU ni conexión a la nube.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de larga duración gracias al VAD integrado, segmentando automáticamente el audio en bloques de 10 segundos y transcribiendo solo los segmentos con voz. Su adaptación a baja SNR lo hace adecuado para salas de reuniones con micrófonos de campo lejano.

- Asistente de voz para atención al cliente: al ofrecer una API compatible con OpenAI, el modelo puede integrarse en sistemas de atención al cliente para transcribir llamadas o mensajes de voz en tiempo real, con latencia adecuada para interacción conversacional (RTF de 0.225-0.3 en AX650N).

- Dispositivos IoT y domótica con control por voz: al ejecutarse en un SoC de bajo consumo como el AX650N, el modelo es adecuado para asistentes de voz embebidos en altavoces inteligentes, electrodomésticos o sistemas de automatización del hogar, sin depender de servicios en la nube.

- Generación de subtítulos para contenido multimedia: el modelo puede transcribir audio de vídeos o podcasts en chino e inglés, generando subtítulos automáticamente. Su capacidad para manejar grabaciones estéreo y audio de baja calidad lo hace útil para contenido generado por usuarios.

- Sistemas de dictado médico o legal: la transcripción precisa de voz en entornos profesionales, con soporte para chino e inglés, permite su uso en aplicaciones de dictado donde la privacidad es importante, ya que el procesamiento puede realizarse localmente en el dispositivo.

- Investigación y desarrollo en ASR embebido: el repositorio incluye el código fuente del SDK C++ y documentación sobre el proceso de conversión con Pulsar2, lo que lo convierte en una referencia útil para desarrolladores que trabajan en despliegue de modelos ASR en hardware de borde con NPU.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles corresponden a mediciones realizadas por AXERA-TECH en el hardware AX650N con 4 muestras de voz de prueba:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 3,37 % |
| RTF (Python) | ~0,3 |
| RTF (C++ SDK) | 0,225 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El proyecto original FireRedASR reporta resultados de última generación en benchmarks públicos de ASR en mandarín, pero estos datos corresponden al modelo original y no a la conversión para AX650N.

## Requisitos de hardware

- Hardware objetivo: SoC AX650N de Axera (integra NPU, CPU y memoria en un solo chip).
- El modelo está optimizado para ejecución en NPU de Axera mediante el runtime pyaxengine (Python) o el SDK C++ incluido.
- No requiere GPU: la inferencia se realiza completamente en el NPU del AX650N.
- Memoria: no se especifica el consumo exacto de memoria, pero el tamaño del repositorio es de 6,7 GB (incluyendo pesos, código y documentación).
- Opciones de despliegue: servidor Python con API OpenAI (`openai/openai_server.py`) o binarios C++ precompilados (`cpp/bin/firered_openai_server`).
- Dependencias Python: numpy, pyaxengine, kaldi-native-fbank. No requiere torch ni onnxruntime.
- El modelo no está disponible en formatos estándar como safetensors o GGUF; solo en formato axmodel para NPU de Axera.

## Comparativa con modelos similares

La comparativa se limita a modelos ASR de código abierto con soporte para chino e inglés, aunque hay que tener en cuenta que FireRedASR-AED en esta versión está específicamente optimizado para el hardware AX650N, lo que limita la comparación directa:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| FireRedASR-AED (AXERA-TECH) | no disponible | 10 s por segmento | Chino, inglés | Apache 2.0 | NPU AX650N |
| FunASR (Alibaba) | no disponible | no disponible | Chino, inglés | Modelo: varios; código: MIT | CPU/GPU/NPU |
| Whisper (OpenAI) | 39 M - 1550 M | 30 s | 99 idiomas | MIT | CPU/GPU |
| Paraformer (Alibaba) | 46 M - 220 M | no disponible | Chino, inglés | Modelo: varios | CPU/GPU |

La comparación es parcial porque FireRedASR-AED en este repositorio es una conversión específica para NPU de Axera, no un modelo de propósito general. Para una comparativa justa habría que evaluar el modelo original de FireRedTeam en hardware estándar.

## Limitaciones y advertencias

- El modelo está limitado a entrada de audio de 10 segundos por segmento; audios más largos requieren el VAD integrado, que puede perder contenido si la segmentación no es precisa.
- Solo soporta chino (mandarín) e inglés; no cubre otros idiomas.
- El formato de pesos es propietario (axmodel) y solo puede ejecutarse en hardware de Axera (AX650N); no es portable a GPU o CPU estándar.
- Los datos de rendimiento (CER 3,37 %) se basan en solo 4 muestras de prueba; no hay una evaluación exhaustiva en conjuntos de datos públicos.
- La cuantización U16/U8 puede introducir degradación de precisión respecto al modelo original en punto flotante.
- No se especifican los detalles del entrenamiento (datos, número de tokens, técnicas de alineación como RLHF o DPO), lo que limita la evaluación de sesgos potenciales.
- El modelo puede producir alucinaciones en segmentos de audio con ruido o habla solapada, aunque el VAD integrado mitiga parcialmente este problema.
- La documentación está principalmente en chino, lo que puede dificultar su adopción por parte de desarrolladores que no dominen este idioma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AXERA-TECH/FireRedASR-AED
- Repositorio GitHub de la conversión: https://github.com/ml-inory/FireRedASR.axera
- Proyecto original FireRedASR: https://github.com/FireRedTeam/FireRedASR
- Paper de FireRedASR (arXiv): https://arxiv.org/html/2501.14350v1

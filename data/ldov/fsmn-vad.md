# ldov/fsmn-vad

## Resumen

FSMN-VAD es un modelo de detección de actividad de voz (VAD) desarrollado originalmente por Alibaba DAMO Academy como parte del ecosistema FunASR. Esta versión concreta, publicada por el usuario `ldov`, es una conversión a formato GGUF del modelo `funasr/fsmn-vad`, diseñada específicamente para el runtime de FunASR basado en llama.cpp. El objetivo es permitir la segmentación de audio largo de forma nativa en C++, sin necesidad de Python en tiempo de ejecución, lo que lo hace ideal para entornos de CPU y dispositivos periféricos (edge).

El modelo se basa en la arquitectura FSMN (Feedforward Sequential Memory Network), una variante eficiente para modelar dependencias temporales en señales de audio. Con apenas 429.538 parámetros y un peso de 1,7 MB en formato GGUF, es extremadamente ligero y puede ejecutarse en hardware modesto. Su principal función es detectar segmentos de voz dentro de un flujo de audio continuo, marcando los límites de inicio y fin de cada intervención hablada, lo que resulta esencial como front-end para sistemas de reconocimiento de voz (ASR) en escenarios de audio largo o streaming.

La relevancia actual de este modelo radica en su integración con el runtime llama.cpp de FunASR, que ofrece un binario autocontenido para CPU y edge, similar a whisper.cpp. Esto permite desplegar pipelines completos de ASR (como SenseVoice, Paraformer o Fun-ASR-Nano) con VAD integrado en dispositivos sin GPU, con una precisión de segmentación que coincide con el front-end de PyTorch dentro de aproximadamente 10 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FSMN (Feedforward Sequential Memory Network) - FSMN-Monophone |
| Parametros totales | 429.538 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en streaming, sin contexto de texto) |
| Tipos de cuantizacion | GGUF (formato genérico; el archivo de 1,7 MB sugiere f16 o q8, no especificado) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FSMN (Feedforward Sequential Memory Network), una red neuronal feedforward con memoria secuencial que captura dependencias temporales mediante capas de memoria de orden superior. La variante FSMN-Monophone, usada en este VAD, procesa características acústicas (fbank) y produce decisiones de voz/no voz a nivel de trama, con un mecanismo de suavizado para generar segmentos coherentes.

Según la información disponible, el modelo fue entrenado con corpus de voz en chino y se sometió a un entrenamiento anti-ruido (anti-noise training), lo que le confiere cierta capacidad de rechazo a interferencias y buen comportamiento en audios con distintos niveles de calidad y ruido de fondo. La conversión a GGUF mantiene los pesos originales y añade el normalizador CMVN (Cepstral Mean and Variance Normalization) integrado en el archivo, permitiendo su uso directo en el runtime de llama.cpp sin pasos adicionales de preprocesado.

## Capacidades

- Deteccion de actividad de voz (VAD) en audio de 16 kHz, marcando inicios y fines de segmentos hablados.
- Segmentacion de audio largo en tramos de voz, util para pipelines de ASR que requieren dividir la entrada antes de la transcripcion.
- Integracion nativa con el runtime llama.cpp de FunASR mediante el parametro `--vad`, compatible con SenseVoice, Paraformer y otros modelos ASR.
- Ejecucion sin Python en tiempo de ejecucion: todo el procesamiento se realiza en C++/ggml, ideal para entornos de produccion ligeros.
- Resistencia al ruido de fondo gracias al entrenamiento anti-ruido, con buen comportamiento en audios de dominios variados.
- Compatibilidad con CPU y dispositivos edge, sin necesidad de GPU.
- Soporte bilingue basico (chino e ingles), aunque el entrenamiento principal fue en corpus chino.

## Casos de uso

- Preprocesamiento para transcripcion de reuniones: el modelo segmenta una grabacion larga de una reunion en intervenciones individuales, que luego se pasan a un ASR como SenseVoice para transcribir cada segmento por separado, mejorando la precision y la gestion de turnos.
- Filtrado de silencios en podcasts y videos: al detectar las regiones de voz, se pueden eliminar automaticamente los silencios prolongados antes de la publicacion, reduciendo el tamano del archivo y mejorando la experiencia de escucha.
- Activacion por voz en dispositivos edge: integrado en un binario de llama.cpp, el modelo puede ejecutarse en un microcontrolador o Raspberry Pi para detectar la presencia de habla y activar un sistema de grabacion o respuesta, con un consumo minimo de recursos.
- Segmentacion de llamadas telefonicas para analisis de calidad: en centros de atencion al cliente, el VAD identifica los intervalos de habla del agente y del cliente, permitiendo metricas de solapamiento, duracion de turnos y deteccion de silencios anormales.
- Preprocesado para diarizacion de hablantes: combinado con un modelo de diarizacion como CAM++, el VAD proporciona los segmentos de voz que el sistema de diarizacion agrupa por locutor, simplificando el pipeline y reduciendo el coste computacional.
- Monitoreo de audio en tiempo real: en sistemas de vigilancia o asistencia domiciliaria, el modelo detecta la presencia de voz en un flujo continuo de audio y envia una alerta o activa una grabacion solo cuando hay habla, ahorrando almacenamiento y ancho de banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que los limites de segmento coinciden con el front-end de PyTorch dentro de aproximadamente 10 ms, pero no se proporcionan metricas como precisión, recall o F1 sobre conjuntos de referencia (p. ej., Aishell, LibriSpeech). Se recomienda consultar la documentacion de FunASR o el repositorio original para obtener datos de evaluacion.

## Requisitos de hardware

- VRAM estimada: 0 MB (el modelo se ejecuta completamente en CPU, no requiere memoria de GPU).
- GPU recomendadas: ninguna; el modelo esta disenado para CPU y dispositivos edge.
- Compatibilidad con consumer GPU: no aplica, aunque puede ejecutarse en cualquier sistema con CPU x86, ARM o similar.
- Opciones de despliegue: runtime llama.cpp de FunASR (binario precompilado), tambien puede usarse con llama.cpp estandar o integraciones como Ollama si se adapta.
- Latencia y throughput: al ser un modelo de 429K parametros y 1,7 MB, la latencia por trama es del orden de microsegundos en CPU moderna. El procesamiento de una hora de audio se completa en menos de un minuto en un procesador medio, aunque no se dispone de cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FSMN-VAD (GGUF) | 429K | No aplica (audio) | Apache 2.0 | GGUF | Disenado para FunASR llama.cpp runtime, CPU/edge |
| Silero VAD | ~1.8M | No aplica (audio) | MIT | ONNX, TorchScript | Ampliamente usado, soporta multiples idiomas, requiere Python o runtime ONNX |
| WebRTC VAD | ~0.1M | No aplica (audio) | BSD | C++ | Muy ligero, pero menos preciso en ruido; no soporta chino especificamente |

La comparativa se basa en caracteristicas generales, no en benchmarks publicados. FSMN-VAD destaca por su integracion directa con el ecosistema FunASR y su formato GGUF, que permite ejecucion sin dependencias externas.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se realizo principalmente con corpus de voz en chino, por lo que el rendimiento puede degradarse con hablantes no nativos, acentos muy marcados o idiomas distintos del chino e ingles.
- Riesgo de alucinacion: no aplica directamente, pero el VAD puede producir falsos positivos en presencia de musica, toses o ruidos no vocales, a pesar del entrenamiento anti-ruido.
- Limitaciones de contexto: el modelo procesa audio en streaming, pero no tiene memoria de largo plazo; la segmentacion se realiza en ventanas locales, lo que puede afectar a la coherencia en conversaciones muy rapidas o con solapamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero se debe mantener el aviso de copyright y las condiciones de la licencia en las redistribuciones.
- Caveat para produccion: aunque la model card indica que los limites de segmento coinciden con el front-end de PyTorch dentro de ~10 ms, se recomienda validar el comportamiento en el dominio especifico de uso antes de desplegar en produccion, especialmente con audio de baja calidad o multiples hablantes.

## Enlaces

- Modelo en HuggingFace (version GGUF): https://huggingface.co/ldov/fsmn-vad
- Modelo original en HuggingFace: https://huggingface.co/funasr/fsmn-vad
- Runtime llama.cpp de FunASR: https://github.com/modelscope/FunASR/tree/main/runtime/llama.cpp
- Repositorio de referencia (lovemefan/fsmn-vad): https://github.com/lovemefan/fsmn-vad
- Documentacion de FSMN-VAD en ManySpeech: https://manyeyes.github.io/manyspeech/en/models/vad/fsmn-vad.html
- Repositorio FunASR: https://github.com/modelscope/FunASR

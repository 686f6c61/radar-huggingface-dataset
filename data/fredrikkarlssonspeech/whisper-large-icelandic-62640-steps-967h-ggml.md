# FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-ggml

## Resumen

Este repositorio contiene una conversion al formato GGML del modelo `language-and-voice-lab/whisper-large-icelandic-62640-steps-967h`, un ajuste fino de Whisper large-v2 especializado en reconocimiento automatico de voz (ASR) en islandes. Lo publica el usuario FredrikKarlssonSpeech y esta pensado para su uso con whisper.cpp, lo que permite ejecutar inferencia en CPU y GPU de forma local sin depender de frameworks de Python. El modelo base fue entrenado sobre 967 horas de audio en islandes a lo largo de 62.640 pasos.

La arquitectura es la de Whisper large-v2: un transformer encoder-decoder con 32 capas, `d_model` de 1280, 20 cabezas de atencion y 80 canales mel, con un vocabulario de 51.865 tokens. El modelo original pesa 6.173.647.530 bytes en punto flotante, lo que corresponde a aproximadamente 1.550 millones de parametros. El repositorio incluye dos ficheros cuantizados, uno en f16 (3,09 GB) y otro en q5_0 (1,08 GB), lo que reduce drasticamente los requisitos de memoria frente al modelo original.

Su relevancia es practica: ofrece un modelo de ASR de alta calidad para un idioma con pocos recursos como el islandes, en un formato ligero y portable que cabe en hardware de consumo. Esta pensado para transcripcion offline, subtitulado y pipelines que necesiten procesar audio en islandes sin conexion a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v2 (transformer encoder-decoder) |
| Parametros totales | ~1.550 millones (aprox., derivado del peso fp32 de 6.173.647.530 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (arquitectura Whisper) |
| Tipos de cuantizacion | f16 y q5_0 |
| Idiomas soportados | islandes (is) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGML (`.bin`, para whisper.cpp) |

Dimensiones internas declaradas por el autor: `n_vocab` 51.865, `d_model` 1280, 32 capas de encoder/decoder, 20 cabezas de atencion, `n_mels` 80.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper large-v2 de OpenAI: un transformer encoder-decoder disenado para transcripcion y traduccion de voz, que procesa audio en ventanas de 30 segundos y trabaja sobre espectrogramas mel de 80 canales. El encoder consume el audio y el decoder genera texto de forma autorregresiva, con tokens especiales para marcar idioma y tarea. Al ser un ajuste fino del checkpoint large-v2, mantiene el esquema de entrenamiento supervisado tipico de Whisper.

El ajuste fino se realizo sobre 967 horas de audio en islandes durante 62.640 pasos, segun se desprende del nombre del modelo base (`whisper-large-icelandic-62640-steps-967h`) publicado por `language-and-voice-lab`. No se detalla en la informacion disponible la composicion exacta del dataset, el uso de tecnicas de RLHF/DPO ni innovaciones adicionales mas alla del propio ajuste supervisado. Esta version concreta no reentrena el modelo: unicamente lo convierte a GGML con `models/convert-h5-to-ggml.py` en whisper.cpp v1.9.4 y lo cuantiza con `whisper-quantize`.

## Capacidades

- Reconocimiento automatico de voz (ASR) en islandes, incluyendo transcripcion de audio a texto.
- Funcionamiento offline y local sobre CPU o GPU mediante whisper.cpp, sin dependencias de servicios externos.
- Procesamiento de audio en formato WAV mono a 16 kHz (formato de entrada esperado por whisper.cpp).
- Dos niveles de precision (f16 y q5_0) para equilibrar calidad y consumo de memoria.
- Capacidades multilingues: limitadas al islandes en la practica, dado que el ajuste fino es especifico de ese idioma.
- No dispone de soporte de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- No incorpora modo de razonamiento explicito (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Transcripcion de audio en islandes de forma offline: el modelo puede convertir entrevistas, podcasts o notas de voz a texto en local, sin enviar datos a la nube, lo que es adecuado para contenido sensible o entornos sin conectividad.
- Subtitulado automatico de video en islandes: se puede integrar en un pipeline que extraiga el audio, lo normalice a WAV mono 16 kHz y genere subtitulos con marcas temporales a partir de la salida del decoder.
- Archivado y busqueda de contenido audiovisual: transcribir grandes volumenes de grabaciones en islandes para indexarlas y hacerlas buscables por texto.
- Asistentes de voz en islandes en dispositivos de borde: gracias a la cuantizacion q5_0 (1,08 GB), el modelo puede ejecutarse en equipos sin GPU dedicada para aplicaciones de dictado o comandos de voz.
- Investigacion en lengua islandesa: generar corpus transcritos para estudios linguisticos, entrenamiento de modelos de lenguaje o analisis fonetico.
- Accesibilidad: convertir contenido hablado en islandes a texto para personas con discapacidad auditiva en entornos donde no existen servicios comerciales de calidad para ese idioma.
- Prototipado rapido de aplicaciones ASR: al estar en formato GGML, se integra facilmente en scripts con `whisper-cli` para validar ideas antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para f16: aproximadamente 3,1 GB solo para los pesos, mas overhead de contexto y decodificacion.
- VRAM/RAM para q5_0: aproximadamente 1,08 GB para los pesos, lo que lo hace apto para equipos modestos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para f16 (por ejemplo, GTX 1650, RTX 3050, RTX 4090, A100, H100); para q5_0 basta con 2 GB de VRAM dedicada.
- Cabe en GPU de consumo: si, tanto f16 como q5_0 entran en practicamente cualquier GPU moderna de consumo, e incluso en CPU.
- Opciones de despliegue: whisper.cpp (`whisper-cli`), y cualquier herramienta que consuma pesos GGML compatibles con whisper.cpp. No esta disponible en formatos para vLLM, TGI ni Ollama segun la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware, del backend (CPU o GPU) y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-icelandic-62640-steps-967h (GGML, este) | ~1.550 M | islandes | 30 s | cc-by-4.0 | GGML (f16, q5_0) |
| openai/whisper-large-v2 | ~1.550 M | multilingue (99 idiomas) | 30 s | MIT | PyTorch, safetensors, GGML |
| language-and-voice-lab/whisper-large-icelandic-62640-steps-967h | ~1.550 M | islandes | 30 s | no disponible | PyTorch |

No se dispone de datos de rendimiento comparativo (WER, MMLU u otras metricas) en la informacion proporcionada para establecer una comparacion cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un ajuste fino sobre Whisper, puede heredar los sesgos del modelo original.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso, con acentos marcados o con silencios prolongados.
- Limitaciones de idioma: el modelo esta especializado en islandes; su rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Limitacion de contexto: procesa audio en ventanas de 30 segundos, por lo que audios mas largos requieren segmentacion previa.
- Restricciones de licencia: cc-by-4.0 permite uso comercial, pero exige atribucion al autor y al modelo base; conviene revisar las condiciones del modelo original de `language-and-voice-lab`.
- Caveats para produccion: al ser una conversion GGML, no se ha verificado en este repositorio la equivalencia exacta de calidad frente al modelo original en PyTorch; la cuantizacion q5_0 puede introducir perdidas de precision frente a f16.
- El repositorio tiene 0 descargas y 0 "me gusta", por lo que no cuenta con validacion de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/whisper-large-icelandic-62640-steps-967h-ggml
- Modelo base: https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp

# RunSLM-AI/whisper-tiny-ggml

## Resumen

RunSLM-AI/whisper-tiny-ggml es una distribucion binaria en formato GGML del modelo OpenAI Whisper Tiny, preparada para reconocimiento automatico del habla (ASR) completamente en local. El artefacto publicado es un unico fichero `ggml-tiny.bin` de aproximadamente 77,7 MB que encapsula la red completa y se ejecuta sobre el runtime C++ de whisper.cpp y sobre la aplicacion RunSLM AI. El mantenedor de la distribucion es PROJECTLAB LIMITED (RunSLM-AI); el modelo original es de OpenAI y el conversor y runtime son de Georgi Gerganov y colaboradores.

Se trata de un transformer secuencial encoder-decoder con unos 39 millones de parametros, orientado a despliegue en movil y tablet (Metal en iOS, NEON Arm64 en Android) sin necesidad de conectividad de red ni de acelerador dedicado. Su huella de memoria declarada es de unos 75 MB de RAM, lo que lo hace apto para dispositivos antiguos y para ejecucion en segundo plano.

La relevancia de esta ficha es practica: no aporta un modelo nuevo, sino un empaquetado listo para produccion en el borde. Cubre siete idiomas declarados (ingles, chino mandarin, cantonés, japones, español, frances y aleman) bajo licencia MIT, lo que facilita su integracion comercial siempre que se respeten las atribuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder secuencial, seq2seq) |
| Parametros totales | ~39 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | formato GGML binario; el repositorio solo publica `ggml-tiny.bin` (~77,7 MB), sin variantes q4/q5/q8 listadas |
| Idiomas soportados | en, zh, yue (cantonés), ja, es, fr, de |
| Licencia | MIT |
| Formato de pesos | GGML binario (`.bin`); no se distribuyen safetensors |
| Tamano del repositorio | 0,1 GB |
| Tamano del fichero | ~77,7 MB |
| Memoria en dispositivo | ~75 MB de RAM |
| Plataformas objetivo | iOS (Metal), Android Arm64 (NEON), movil y tablet |
| Pipeline | automatic-speech-recognition |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-10-10 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Tiny: un encoder-decoder de tipo transformer secuencial. El encoder procesa el audio (log-Mel spectrogram) y el decoder genera la transcripcion de forma autorregresiva, con prediccion de idioma y tokens de tarea integrados en el propio vocabulario del decoder. La variante Tiny de Whisper es la mas pequena de la familia y esta disenada explicitamente para escenarios de recursos limitados.

Sobre el proceso de entrenamiento no hay informacion en la model card proporcionada: no se indican el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La unica informacion tecnica disponible es la conversion a GGML mediante whisper.cpp y el empaquetado para el runtime de RunSLM AI. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, cuantizacion agresiva u otras) mas alla del propio formato GGML.

## Capacidades

- Reconocimiento automatico del habla (audio a texto) completamente offline, sin llamadas de red.
- Transcripcion multilingue en siete idiomas declarados: ingles, chino mandarin, cantonés, japones, español, frances y aleman.
- Deteccion de idioma y tarea integrada en el modelo original de Whisper (segun la arquitectura heredada).
- Ejecucion con huella de memoria reducida (~75 MB), apta para ejecucion en segundo plano.
- Inferencia en CPU con aceleracion NEON en Arm64 y Metal en iOS, sin GPU dedicada.
- Integracion con whisper.cpp y con la aplicacion RunSLM AI.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo.

## Casos de uso

- Subtitulado local en aplicaciones moviles: el binario se embebe en la app y transcribe la voz del usuario sin enviar audio a un servidor, lo que simplifica el cumplimiento de normativa de privacidad y evita costes de ancho de banda.
- Notas de voz a texto en dispositivos antiguos o de gama baja: con ~75 MB de RAM y ~77,7 MB de fichero, cabe en terminales con memoria limitada donde un modelo ASR mayor no se podria cargar.
- Dictado multilingue en teclados y asistentes de escritura: la cobertura de en, zh, yue, ja, es, fr y de permite ofrecer dictado en varias lenguas desde un unico artefacto.
- Transcripcion en entornos sin conectividad: personal de campo (logistica, mantenimiento, sanidad rural) que necesita registrar informes hablados sin cobertura de red.
- Preprocesado de audio en el borde para pipelines IoT: conversion de voz a texto en el propio dispositivo antes de enviar solo el texto a un backend, reduciendo el volumen de datos transmitidos.
- Funciones de accesibilidad: subtitulado en tiempo real de conversaciones presenciales en una tablet, sin depender de servicios en la nube.
- Procesamiento por lotes de grabaciones cortas en local: transcripcion de conjuntos de audios de baja duracion en equipos sin GPU, apoyandose en el runtime C++ de whisper.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, latencia ni throughput, y los resultados de la busqueda web proporcionada no contienen informacion tecnica relevante sobre este modelo (corresponden a contenidos no relacionados).

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU. La model card declara ~75 MB de RAM de dispositivo y un fichero de ~77,7 MB.
- GPU recomendadas: ninguna. El despliegue objetivo es hardware movil y de tablet; se aprovecha Metal en iOS y NEON en Arm64.
- Compatibilidad con GPU de consumo: no es un requisito; el modelo no necesita RTX 4090, A100 ni H100 para funcionar.
- Opciones de despliegue: whisper.cpp (runtime C++ de referencia) y la aplicacion RunSLM AI. vLLM y TGI no son aplicables a este artefacto, y llama.cpp no implementa ASR, por lo que no es un runtime valido para este fichero.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RunSLM-AI/whisper-tiny-ggml | ~39 M | no disponible | MIT | GGML binario (`.bin`) | HuggingFace, descarga directa |
| OpenAI Whisper Tiny (modelo original) | ~39 M | no disponible | MIT | pesos PyTorch (`.pt`) | Repositorio de OpenAI |
| Otras conversiones GGML de Whisper Tiny | no disponible | no disponible | no disponible | GGML | no disponible |
| Alternativas ASR de mayor tamano (p. ej. Whisper Base/Small) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia, formato y via de distribucion.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de la familia Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio ininteligible; conviene aplicar umbrales de confianza y filtros posteriores.
- Precisión limitada por tamano: al ser la variante Tiny (~39 M de parametros), su tasa de error es previsiblemente superior a la de variantes mayores, especialmente con acentos marcados, jerga tecnica o audio con ruido de fondo. No hay cifras de WER publicadas en la informacion disponible.
- Cobertura idiomatica: la model card declara siete idiomas; no se garantiza el rendimiento en otras lenguas que el Whisper original pudiera soportar.
- Ausencia de benchmarks: no se han publicado evaluaciones independientes, y el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Restricciones de licencia: el modelo se distribuye bajo MIT, lo que permite uso comercial, pero exige conservar los avisos de copyright y atribucion a OpenAI (modelo original) y a whisper.cpp (conversion y runtime). Conviene revisar tambien los terminos del runtime RunSLM AI si se integra la aplicacion completa.
- Trazabilidad: la fecha de creacion registrada (2026-10-10) y el mantenimiento por parte de un tercero distinto del autor original implican que las actualizaciones y el soporte dependen de PROJECTLAB LIMITED.
- Formato cerrado al ecosistema: al tratarse de un binario GGML, no es directamente utilizable con frameworks de entrenamiento o ajuste fino en Python; para modificarlo habria que partir del modelo original de OpenAI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunSLM-AI/whisper-tiny-ggml
- Descarga directa del binario: https://huggingface.co/RunSLM-AI/whisper-tiny-ggml/resolve/main/ggml-tiny.bin
- OpenAI Whisper (modelo original): https://github.com/openai/whisper
- whisper.cpp (conversion GGML y runtime C++): https://github.com/ggerganov/whisper.cpp
- Mantenedor de la distribucion (PROJECTLAB LIMITED / RunSLM-AI): https://github.com/tonynotpro/RunSLM-AI
- Paper o blog tecnico adicional: no disponible en la informacion proporcionada.

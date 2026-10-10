# aoiandroid/whisper-small

## Resumen

`aoiandroid/whisper-small` es un espejo (mirror) sin modificaciones de `openai/whisper-small`, el modelo de reconocimiento automatico del habla (ASR) publicado por OpenAI. El repositorio lo mantiene el usuario `aoiandroid` con el unico proposito de que la aplicacion Cription no dependa de un repositorio de terceros; no introduce pesos nuevos, ni fine-tuning, ni cambios en los ficheros respecto al commit original `973afd24965f72e36ca33b3055d56a652f456b4d`.

Es importante senalar que este espejo no es un checkpoint completo. Contiene unicamente 10 ficheros (4,4 MB en total), es decir, un subconjunto de la configuracion y el tokenizador del modelo original, con las mismas rutas y los mismos hashes SHA-256 / git blob id que la fuente. Los pesos del modelo (que en el original rondan los 967 MB en safetensors) no forman parte de este repositorio.

Por tanto, la relevancia de esta ficha radica en dos cosas: entender que se trata de una copia parcial de infraestructura mas que de un modelo desplegable, y conocer las caracteristicas del modelo base subyacente (Whisper small), que sigue siendo una referencia solida para transcripcion multilingue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) del modelo base; el espejo no incluye pesos |
| Parametros totales | ~244 millones (modelo base); no disponible para el espejo, que no contiene pesos |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (modelo base) |
| Tipos de cuantizacion | no disponible en el espejo; el modelo base admite fp16, int8 y cuantizaciones GGUF de terceros |
| Idiomas soportados | no disponible en el espejo; el modelo base `openai/whisper-small` es multilingue (aproximadamente 99 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | el espejo no incluye pesos; el modelo base ofrece safetensors y PyTorch bin |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder que recibe un espectrograma log-Mel de 80 canales calculado sobre ventanas de audio de 30 segundos y genera texto de forma autorregresiva. Se entreno con una formulacion multitarea que unifica transcripcion, traduccion al ingles, identificacion de idioma y prediccion de marcas temporales en un unico formato de tokens. El espejo no aporta informacion adicional sobre el entrenamiento, porque no se ha reentrenado ni modificado nada: es una copia byte a byte de una parte del repositorio original.

La innovacion principal del modelo base es precisamente ese enfoque multitarea a gran escala sobre datos web supervisados debilmente, que permite un rendimiento robusto sin fine-tuning por dominio. Al tratarse de un espejo identico al commit citado, no hay decodificacion especulativa, atencion lineal ni ninguna otra tecnica anadida por encima del modelo original.

## Capacidades

- Transcripcion de voz a texto (ASR) en multiples idiomas en el modelo base.
- Traduccion de voz a texto en ingles (tarea `translate`).
- Identificacion automatica del idioma de entrada.
- Prediccion de marcas temporales a nivel de segmento y de palabra.
- Deteccion de voz y manejo de audio con ruido moderado.
- Procesamiento por lotes de ventanas de 30 segundos.
- Integracion con librerias estandar de ASR (transformers, faster-whisper, whisper.cpp, etc.) siempre que se disponga del checkpoint completo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acustico.
- El espejo, por si solo, no permite ejecutar ninguna de estas capacidades porque carece de pesos.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo base procesa audio en ventanas de 30 segundos y devuelve texto con marcas temporales, lo que facilita la generacion automatica de actas y resumenes posteriores.
- Subtitulado de video: combinando la prediccion de timestamps con un pipeline de postproceso se pueden generar ficheros SRT o VTT para contenido multilingue.
- Analisis de llamadas de atencion al cliente: transcripcion masiva de grabaciones para busqueda, clasificacion y control de calidad, con coste reducido al ser un modelo de 244 M de parametros.
- Accesibilidad: conversion en tiempo real de voz a texto en aplicaciones de asistencia para personas con discapacidad auditiva, desplegando el modelo en local sobre una GPU de gama media.
- Indexacion y busqueda semantica de archivos de audio: transcripcion como paso previo a la generacion de embeddings para busqueda por texto en archivos de podcasts o archivos historicos.
- Investigacion linguistica: transcripcion de corpus orales en distintos idiomas para estudios foneticos o sociolinguisticos.
- Uso dentro de la aplicacion Cription: el escenario real de este espejo es servir de dependencia interna fija para esa app, garantizando que los ficheros de configuracion y tokenizador no cambien por actualizaciones del repositorio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este espejo. Al ser una copia identica del commit `973afd24965f72e36ca33b3055d56a652f456b4d` de `openai/whisper-small`, su rendimiento seria identico al del modelo base, pero los valores concretos (WER en LibriSpeech, Common Voice, Fleurs, etc.) no se han incluido en la informacion proporcionada y no se reproducen aqui para no inventar cifras.

## Requisitos de hardware

- VRAM estimada para el modelo base en fp16: aproximadamente 0,5-1 GB.
- VRAM estimada en int8: aproximadamente 0,25-0,5 GB.
- En CPU es perfectamente viable para uso no masivo, con velocidades de varias veces en tiempo real en procesadores modernos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien A100, H100 o L4 si se busca throughput alto por lotes.
- Cabe en practicamente cualquier GPU consumer y en muchos dispositivos integrados.
- Opciones de despliegue: transformers, faster-whisper (CTranslate2), whisper.cpp, OpenVINO, WhisperX y servidores como vLLM no aplican al tratarse de un modelo seq2seq de audio, no de un LLM de texto.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia cualitativa, el modelo base de 244 M es sensiblemente mas rapido que whisper-medium y whisper-large en el mismo hardware.
- Advertencia: este espejo concreto, al carecer de pesos, no se puede desplegar por si solo; los requisitos anteriores aplican al checkpoint completo obtenido desde la fuente original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| openai/whisper-small (base de este espejo) | ~244 M | ventanas de 30 s | multilingue (~99) | apache-2.0 | punto medio de la familia Whisper |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingue | apache-2.0 | mas rapido y menos preciso |
| openai/whisper-medium | ~769 M | ventanas de 30 s | multilingue | apache-2.0 | mayor precision, mas VRAM |
| openai/whisper-large-v3 | ~1,55 B | ventanas de 30 s | multilingue (~99) | apache-2.0 | estado del arte de la familia, mayor coste |
| aoiandroid/whisper-small (este repositorio) | no disponible (sin pesos) | no disponible | no disponible | apache-2.0 | espejo parcial de configuracion y tokenizador |

## Limitaciones y advertencias

- El espejo no contiene los pesos del modelo, por lo que no es utilizable directamente para inferencia; solo sirve como dependencia de configuracion y tokenizador.
- El modelo base tiende a alucinar texto en fragmentos de silencio, ruido o musica, especialmente cuando el audio es de baja calidad.
- El contexto de audio esta limitado a ventanas de 30 segundos; audios mas largos requieren segmentacion y postproceso.
- La precision varia mucho segun el idioma: los idiomas con menos datos de entrenamiento presentan tasas de error notoriamente superiores.
- Las marcas temporales del modelo base son aproximadas y suelen requerir refinamiento con herramientas externas (por ejemplo, alineadores forzados).
- No realiza diarizacion de hablantes por si mismo; hay que combinarlo con modelos adicionales.
- La licencia apache-2.0 permite uso comercial, pero se debe conservar la atribucion a los autores originales (OpenAI) y el aviso de licencia.
- Cualquier integracion en produccion deberia fijar el commit exacto de la fuente, tal como hace este espejo, para evitar cambios inesperados.

## Enlaces

- Repositorio del espejo: https://huggingface.co/aoiandroid/whisper-small
- Modelo original: https://huggingface.co/openai/whisper-small
- Commit de origen: https://huggingface.co/openai/whisper-small/tree/973afd24965f72e36ca33b3055d56a652f456b4d
- Repositorio de codigo de Whisper: https://github.com/openai/whisper
- Paper de referencia (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Fichero SOURCE_README.md incluido en el espejo con la model card original: no disponible como URL directa, referenciado en el propio repositorio.

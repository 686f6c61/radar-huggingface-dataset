# odinjason/tr-asr-int8

## Resumen

`odinjason/tr-asr-int8` es un paquete de reconocimiento automatico del habla (ASR) para turco, empaquetado en formato `sherpa-onnx` y cuantizado a int8. No es un modelo entrenado desde cero por el autor del repositorio: se trata de una redistribucion de los ficheros pre-cuantizados del modelo `ozankaraali/qitv-asr-tr-conformer`, un transductor FastConformer en modo streaming. El repositorio copia los artefactos (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`, `tokens.txt` y `config.json`) sin recuantizar, de modo que el valor anadido es la disponibilidad del paquete listo para su uso con `sherpa-onnx`.

La relevancia practica del modelo reside en su orientacion a inferencia offline y de baja latencia sobre CPU, gracias a la cuantizacion int8 y a una arquitectura de transductor streaming. Segun la model card, en pruebas con clips sinteticos de Google Translate TTS el sistema alcanzo entre 16,7x y 19,5x tiempo real con transcripciones casi exactas, usando `sherpa-onnx` 2.0.1, `normalize_samples=False`, `blank_penalty=0.5` y una ventana de look-ahead de 1.040 ms.

El repositorio es muy pequeno (0,1 GB) y no incluye informacion sobre el proceso de entrenamiento original, los datos utilizados ni benchmarks sobre habla real. La licencia declarada en la model card es CC BY 4.0, con obligacion de atribucion a "QiTV ASR Turkish - Ozan Karaali", enlace a la fuente y descripcion de los cambios realizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor FastConformer (encoder-decoder-joiner) en modo streaming |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (streaming con look-ahead de 1.040 ms) |
| Tipos de cuantizacion | int8 (ficheros `.int8.onnx` pre-cuantizados) |
| Idiomas soportados | Turco |
| Licencia | CC BY 4.0 (atribucion a "QiTV ASR Turkish - Ozan Karaali") |
| Formato de pesos | ONNX (encoder, decoder y joiner en int8) + `tokens.txt` + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transductor ASR (encoder, decoder y joiner) basado en FastConformer, disenado para reconocimiento continuo en streaming. El encoder procesa el audio con atencion conforme y produce representaciones que el decoder y el joiner combinan para generar tokens de texto; el modo streaming con look-ahead de 1.040 ms permite transcribir audio en tiempo real con una latencia acotada. Los tres componentes se distribuyen como ficheros ONNX independientes, lo que facilita su ejecucion con `sherpa-onnx` sobre CPU sin necesidad de framework de deep learning adicional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales del modelo original `ozankaraali/qitv-asr-tr-conformer`. El autor de este repositorio unicamente copia los artefactos pre-cuantizados a int8 sin recuantizar y documenta los parametros de inferencia probados con `sherpa-onnx` 2.0.1.

## Capacidades

- Transcripcion de voz a texto en turco en modo streaming, con look-ahead de 1.040 ms.
- Inferencia offline sobre CPU mediante `sherpa-onnx`, sin dependencia de servicios en la nube.
- Ejecucion con los ficheros ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) y decodificacion configurable (`normalize_samples=False`, `blank_penalty=0.5`).
- Integracion mediante `OnlineRecognizer.from_transducer` de `sherpa-onnx` 2.0.1.
- Reconocimiento de habla sintetica (clips TTS de Google Translate) con transcripciones casi exactas segun la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al turco.
- Capacidades de vision o audio mas alla de ASR: no disponibles.

## Casos de uso

- Subtitulado en tiempo real de contenido en turco: el modo streaming con look-ahead de 1.040 ms permite generar subtitulos con latencia baja mientras se reproduce el audio, sin enviar datos a servicios externos.
- Transcripcion offline en dispositivos: al ejecutarse con `sherpa-onnx` sobre CPU y pesos int8, puede integrarse en aplicaciones de escritorio o moviles que necesiten ASR sin conexion.
- Dictado por voz en aplicaciones turcas: el modelo puede alimentar funciones de entrada por voz en editores de texto o formularios, procesando el audio localmente.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones en turco para generar transcripciones buscables, aprovechando el rendimiento de 16,7x-19,5x tiempo real observado en clips TTS.
- Asistentes de voz embebidos: integracion en asistentes locales que requieran reconocimiento continuo en turco con consumo de recursos reducido gracias a la cuantizacion int8.
- Analisis de llamadas o reuniones: transcripcion de conversaciones en turco para su posterior revision o mineria de texto, siempre que se valide el rendimiento sobre habla real y no solo sobre TTS.
- Prototipado rapido de pipelines ASR: el paquete incluye todos los ficheros necesarios (`tokens.txt`, `config.json` y los tres ONNX) para arrancar con `sherpa-onnx` sin pasos de conversion adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas cualitativas y de velocidad sobre clips TTS de Google Translate (`tr_01.wav` a `tr_04.wav` y `tr_noisy.wav`), con un rendimiento de aproximadamente 16,7x a 19,5x tiempo real y transcripciones casi exactas. No se han probado conversaciones reales ni habla con ruido humano.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion en CPU con ONNX Runtime, por lo que no requiere GPU.
- GPU recomendadas: no aplica para el flujo documentado; cualquier GPU compatible con ONNX Runtime podria usarse, pero no se documenta.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo cabe en el repo de 0,1 GB y se ejecuta en CPU.
- Opciones de despliegue: `sherpa-onnx` 2.0.1 con `OnlineRecognizer.from_transducer`; la model card indica que la compatibilidad con `sherpa_onnx` 1.13.7 y con la rama `OnlineRecognizer` de `local_stt.dart` requiere implementacion y verificacion por parte de la aplicacion.
- Latencia y throughput: 16,7x-19,5x tiempo real en los clips TTS de prueba, con look-ahead de 1.040 ms; sin datos sobre habla real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `odinjason/tr-asr-int8` | no disponible | streaming (look-ahead 1.040 ms) | Turco | CC BY 4.0 | ONNX int8 | Hugging Face |
| `ozankaraali/qitv-asr-tr-conformer` (modelo fuente) | no disponible | streaming | Turco | CC BY 4.0 | no disponible | Hugging Face |
| Alternativas ASR turco de otros autores | no disponible | no disponible | Turco | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada; la unica referencia directa es el modelo fuente del que se copian los artefactos.

## Limitaciones y advertencias

- El modelo solo se ha probado con clips TTS de Google Translate; no hay evidencia de rendimiento sobre habla conversacional real ni sobre audio con ruido humano.
- La cuantizacion int8 puede degradar la precision respecto al modelo original en dominios acusticos dificiles.
- El reconocimiento esta limitado al turco; no se documenta soporte multilingue.
- La licencia CC BY 4.0 exige atribucion a "QiTV ASR Turkish - Ozan Karaali", enlace a la fuente y descripcion de los cambios; el incumplimiento de estas condiciones restringe el uso comercial y la redistribucion.
- La compatibilidad con versiones de `sherpa_onnx` distintas de 2.0.1 (por ejemplo, 1.13.7) y con la rama `OnlineRecognizer` de `local_stt.dart` no esta verificada y debe validarse en la aplicacion.
- No se documentan sesgos conocidos del modelo original ni tasas de alucinacion; al tratarse de un transductor ASR, los errores tipicos seran sustituciones y omisiones de palabras, especialmente en audio ruidoso.
- El repositorio no incluye informacion sobre el entrenamiento, los datos ni los parametros del modelo fuente, lo que limita la evaluacion independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/odinjason/tr-asr-int8
- Modelo fuente: https://huggingface.co/ozankaraali/qitv-asr-tr-conformer
- `sherpa-onnx` (herramienta de inferencia referenciada): no disponible en la informacion proporcionada.

# Akkimetry/milkledger-voice

## Resumen

MilkLedger voice es un paquete de modelos de voz en formato ONNX pensado para funcionar sin conexion en el telefono, dentro del asistente de voz "Bolo" de la aplicacion MilkLedger. No es un modelo entrenado desde cero: el repositorio, publicado por el usuario Akkimetry, redistribuye convertidos dos familias de modelos de terceros. Por un lado, el reconocimiento de voz (ASR) usa los modelos hybrid CTC-RNNT IndicConformer de AI4Bharat, en su variante "large", para hindi, gujarati y marati. Por otro, la sintesis de voz (TTS) usa modelos VITS de SYSPIN (voz masculina en hindi, femenina en gujarati y femenina en marati), ejecutables con sherpa-onnx.

El problema que resuelve es concreto: llevar ASR y TTS de tres lenguas indias a un dispositivo movil sin red, con pesos cuantizados a int8 y un manifiesto de integridad (`manifest.json`) que la app verifica tras la descarga. El repositorio ocupa 0,8 GB en total e incluye, por cada idioma, tres ficheros ONNX de ASR (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`), un vocabulario de 256 word pieces mas el token blank (`tokens.txt`) y una carpeta `voices/<lang>/` con la voz sintetica correspondiente.

La relevancia es doble: por un lado, ofrece un empaquetado listo para produccion movil de modelos indicos que normalmente se distribuyen en formato de investigacion; por otro, documenta una evaluacion de ida y vuelta (TTS -> ASR) con resultados de intelligibilidad del 90 % en hindi, 84 % en gujarati y 94 % en marati, medida sobre voces sinteticas y no sobre habla real. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es MIT tanto para el codigo de conversion como para los modelos redistribuidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR: IndicConformer hybrid CTC-RNNT (Conformer + predictor RNNT). TTS: VITS (SYSPIN), ejecutado con sherpa-onnx |
| Parametros totales | No disponible (el autor solo indica la variante "large" de IndicConformer; no publica recuento de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; es un modelo ASR/TTS, no un LLM con ventana de contexto |
| Tipos de cuantizacion | Pesos de red en int8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`); el front end log-mel del encoder se mantiene en float. Voces TTS en ONNX sin cuantizacion declarada |
| Idiomas soportados | Hindi (hi), gujarati (gu), marati (mr) |
| Licencia | MIT (modelos base AI4Bharat © 2024 y voces SYSPIN, redistribuidos bajo la misma licencia) |
| Formato de pesos | ONNX para ONNX Runtime (ASR) y para sherpa-onnx (TTS); vocabularios en `tokens.txt`; integridad en `manifest.json` (SHA-256 y tamano por fichero) |
| Entrada de audio | 16 kHz mono; el front end log-mel esta embebido en `encoder.int8.onnx` |
| Vocabulario | 256 word pieces por idioma mas token blank |
| Tamano del repositorio | 0,8 GB (ASR + TTS de los tres idiomas); tamano por fichero no disponible en la informacion proporcionada |
| Fecha de publicacion | 23 de octubre de 2026 (creacion del repositorio en HuggingFace) |
| Pipeline declarado | text-to-speech (el repositorio contiene ademas ASR) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El componente ASR es el IndicConformer hybrid CTC-RNNT de AI4Bharat en variante large. Se trata de un encoder Conformer que produce estados y, ademas, las log-probabilidades de la rama CTC; sobre esos estados opera un predictor RNNT (`decoder.int8.onnx`) y una red conjunta (`joiner.int8.onnx`). La conversion la realiza `export_engine.py`, incluido en el repositorio, que separa el grafo en esos tres ficheros ONNX y mete el front end log-mel dentro del encoder, de modo que la entrada es directamente audio a 16 kHz. Los pesos de red se cuantizan a int8 mientras el front end permanece en float, una decision habitual para no degradar las caracteristicas acusticas.

El componente TTS son modelos VITS de SYSPIN (voz masculina para hindi, femenina para gujarati y femenina para marati), convertidos con `export_voice.py` a `model.onnx` + `tokens.txt` para sherpa-onnx, con modelos de caracteres al estilo Coqui. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF/DPO o ajuste fino adicional: el autor solo indica que los modelos base son de AI4Bharat y SYSPIN y que "solo cambio el formato". Las voces SYSPIN se entrenaron sobre el dataset SYSPIN (SPIRE Lab, IISc Bengaluru y ARTPARK, CC BY 4.0).

## Capacidades

- Reconocimiento de voz offline en hindi, gujarati y marati a partir de audio de 16 kHz, sin paso previo de extraccion de caracteristicas por parte del usuario.
- Salida dual CTC y RNNT en el mismo encoder, lo que permite elegir la rama de decodificacion segun el compromiso latencia/precision.
- Sintesis de voz en los tres idiomas con voces diferenciadas por genero e idioma (hindi masculino, gujarati femenino, marati femenino).
- Ejecucion completamente local: no requiere red ni servicios externos una vez descargados los ficheros.
- Verificacion de integridad de los pesos mediante SHA-256 y tamanos declarados en `manifest.json`.
- Ejecucion en ONNX Runtime (ASR) y sherpa-onnx (TTS), lo que facilita integracion en Android, iOS y escritorio.
- No se documentan tool calling, function calling, capacidades de agente, vision, audio de entrada distinto de voz, ni modo "thinking": no disponible.

## Casos de uso

- Asistente de voz para registro de transacciones en campo: la app captura la frase del usuario en hindi, gujarati o marati, la transcribe con el encoder int8 y registra la entrada en el libro de cuentas sin conexion, escenario para el que el paquete fue construido (MilkLedger/Bolo).
- Confirmacion hablada de operaciones: tras registrar un movimiento, el TTS reproduce la confirmacion en el idioma del usuario con la voz correspondiente, lo que reduce errores en usuarios con alfabetizacion limitada.
- Dictado de notas de voz en zonas sin cobertura: el ASR local evita enviar audio a la nube, algo relevante cuando hay datos personales o financieros y no hay conectividad estable.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de menus, saldos y estados de cuenta en los tres idiomas mediante los modelos VITS.
- Kiosco o terminal de atencion en lengua local: reconocimiento de comandos cortos en gujarati o marati y respuesta sintetizada, con latencia de CPU movil y sin coste por peticion.
- Evaluacion automatizada de calidad TTS: el mismo par TTS+ASR sirve como banco de pruebas de ida y vuelta para medir intelligibilidad de nuevas voces, tal como hizo el autor con 150 frases por idioma.
- Preprocesado de corpus de habla indico en local: transcripcion por lotes de grabaciones de campo en ONNX Runtime sobre CPU, sin GPU.
- Prototipado rapido de interfaces de voz indicas: los tres ficheros ONNX y el vocabulario permiten montar una demo funcional en una tarde con ONNX Runtime o sherpa-onnx.

## Benchmarks y rendimiento

El autor solo publica una evaluacion propia de ida y vuelta (la voz sintetica pronuncia 150 frases de test y el motor ASR debe reconocerlas correctamente al primer intento). No son benchmarks estandar y se miden sobre audio generado por computadora, no sobre habla real.

| Prueba (round trip TTS -> ASR, 150 frases) | Hindi | Gujarati | Marati |
|---|---|---|---|
| Frases reconocidas correctamente al primer intento | 90 % | 84 % | 94 % |

No se han publicado resultados de benchmarks estandar (WER sobre habla real, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware

- No requiere GPU: el diseno esta orientado a CPU de telefono con ONNX Runtime y pesos int8.
- VRAM estimada para inferencia en GPU: no disponible; por el tamano del repositorio (0,8 GB para seis modelos, ASR y TTS de tres idiomas), cada conjunto por idioma ocupa una fraccion de esa cifra y cabe holgadamente en cualquier GPU consumer (estimacion propia, no dato del autor).
- GPU recomendadas: no aplica para el caso de uso movil; para procesamiento por lotes en servidor sirve cualquier GPU con soporte de ONNX Runtime o sherpa-onnx (no hay cifras de rendimiento publicadas).
- Cabe en GPU consumer: si, y en la practica el objetivo es ejecucion en CPU movil.
- Opciones de despliegue: ONNX Runtime (ASR), sherpa-onnx (TTS), y los scripts `export_engine.py` y `export_voice.py` del repositorio para regenerar los artefactos desde los modelos originales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas indicos | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| MilkLedger voice (este repositorio) | ASR + TTS empaquetados | No disponible (IndicConformer large) | No aplica | hi, gu, mr | MIT | ONNX int8, ONNX Runtime / sherpa-onnx |
| AI4Bharat IndicConformer (original) | ASR | No disponible en la informacion proporcionada | No aplica | Cobertura indicia amplia segun el proyecto original | MIT | Pesos de framework; requiere conversion |
| SYSPIN VITS (original) | TTS | No disponible en la informacion proporcionada | No aplica | Voces indicas segun el proyecto original | MIT | Pesos de framework; requiere conversion |
| OpenAI Whisper | ASR + traduccion | No disponible en la informacion proporcionada | No aplica (ventana de 30 s) | Hindi si; gujarati y marati no constan como idiomas soportados en la informacion disponible | MIT | PyTorch / CTranslate2 / GGUF; pensado para GPU o CPU de escritorio |

La ventaja diferencial de este paquete no es la precision bruta, sino el empaquetado: cuantizacion int8, vocabulario incluido, manifiesto de integridad y conversion verificada para ejecucion offline en movil, algo que los repositorios de origen no ofrecen de serie.

## Limitaciones y advertencias

- La evaluacion de intelligibilidad (90/84/94 %) se hizo con voces sinteticas leyendo frases de test, no con habla real; el rendimiento con acentos, ruido de fondo o microfonos de telefono bajos puede ser sensiblemente peor. El propio autor lo advierte.
- Gujarati es el idioma con peor resultado del trio (84 %), por lo que conviene validar ese caso de uso antes de produccion.
- Vocabulario pequeno: 256 word pieces mas blank por idioma, lo que limita la cobertura de nombres propios, prestamos del ingles y terminologia tecnica.
- No se documenta el manejo de code-switching (por ejemplo hindi-ingles), habitual en habla real; no disponible.
- No se documentan funcionalidades de puntuacion, mayusculas, marcas de tiempo, diarizacion ni deteccion de actividad de voz.
- Riesgo de sustitucion en ASR: errores de transcripcion silenciosos en cifras y nombres, especialmente delicado en una app de contabilidad; se recomienda confirmacion explicita del usuario.
- El pipeline declarado en HuggingFace es text-to-speech, aunque el repositorio contiene sobre todo ASR; conviene revisar el contenido real antes de integrar.
- Licencia MIT, pero con atribucion obligatoria a AI4Bharat (© 2024) y a SYSPIN; el dataset SYSPIN es CC BY 4.0, lo que anade requisitos de atribucion sobre los datos de entrenamiento de las voces. Los ficheros `LICENSE` y `LICENSE-SYSPIN` deben conservarse en cualquier redistribucion.
- El repositorio tiene 0 descargas y 0 likes y no procede de una organizacion verificada; no hay historial de mantenimiento ni issues que permitan juzgar el soporte a largo plazo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (solo resultados de spam sin relacion), por lo que no hay documentacion externa independiente que valide las cifras del autor.
- Los ficheros se verifican por SHA-256 contra `manifest.json`, pero ese manifiesto lo genera el propio autor: la confianza en la integridad depende de la del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akkimetry/milkledger-voice
- Repositorio de AI4Bharat IndicConformerASR: https://github.com/AI4Bharat/IndicConformerASR
- Organizacion AI4Bharat en HuggingFace (modelos `indicconformer_stt_*_hybrid_ctc_rnnt_large`): https://huggingface.co/ai4bharat
- Organizacion SYSPIN en HuggingFace (voces VITS): https://huggingface.co/SYSPIN
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web realizada.

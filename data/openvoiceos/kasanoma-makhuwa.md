# OpenVoiceOS/kasanoma-makhuwa

## Resumen

`OpenVoiceOS/kasanoma-makhuwa` es un espejo (mirror) sin modificaciones de la voz Piper para makhuwa publicada por el autor **michsethowusu** en el repositorio `kasanoma`, dentro de la release `makhuwa` y del asset `kasanoma_makhuwa.zip`. OpenVoiceOS no ha entrenado ni alterado la voz: los dos ficheros que contiene el repositorio son, byte a byte, los dos ficheros incluidos en ese zip. El modelo resuelve un problema muy concreto: no existia una voz de sintesis de habla abierta y ejecutable en local para el makhuwa (emakhuwa, codigo ISO 639-3 `vmw`), una lengua bantu hablada principalmente en el norte de Mozambique.

Tecnicamente es un modelo de texto a voz en formato Piper 1.3.0, exportado a ONNX, muestreado a 16 kHz y con un unico idioma (`vmw`). El artefacto principal, `model.onnx`, ocupa 63.516.050 bytes, y el fichero de configuracion `model.onnx.json` ocupa 4.856 bytes; el repositorio completo declara 0,1 GB. Al ser un modelo Piper, esta pensado para inferencia local en CPU dentro del ecosistema de asistentes de voz de OpenVoiceOS, Mycroft o Home Assistant, sin depender de servicios en la nube.

Su relevancia en el momento actual es doble. Por un lado, amplia la cobertura de voces Piper a una lengua africana de bajos recursos, un ambito donde la mayoria de los TTS comerciales no ofrece soporte. Por otro, arrastra un problema de licencia importante: el origen declara literalmente que "todos los modelos Kasanoma se publican bajo licencias de codigo abierto", pero no indica cual, no incluye fichero LICENSE y la API de licencias de GitHub devuelve 404, de modo que los terminos reales de uso son desconocidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; se distribuye como modelo Piper (runtime de TTS) en formato 1.3.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a voz; la entrada es texto a sintetizar, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible; el unico artefacto publicado es `model.onnx` (63.516.050 bytes) sin variantes cuantizadas |
| Idiomas soportados | `vmw` (makhuwa / emakhuwa), monolingue |
| Licencia | `other` / `kasanoma-unspecified-open-source` (licencia no declarada por el autor original) |
| Formato de pesos | ONNX (`model.onnx`) mas configuracion JSON de Piper (`model.onnx.json`) |
| Frecuencia de muestreo | 16 kHz |
| Formato Piper | 1.3.0 |
| Autor original | michsethowusu (repositorio `kasanoma`) |
| Repositorio espejo | OpenVoiceOS |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-to-speech |
| Descargas / likes | 0 / 0 |

Ficheros publicados y hashes declarados por el espejo:

| Fichero | Bytes | SHA256 |
|---|---|---|
| `model.onnx` | 63516050 | `ad79e86d851db6ac16fc55bfe5f6758402901176fd3e33b989d4a5ddf858a8e8` |
| `model.onnx.json` | 4856 | `4415c524ba5fc05402be7da23e0d86f8d9e40e9816f13de18aa28e2bc79bd47b` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, el numero de parametros, los datos de entrenamiento ni el proceso de optimizacion. Lo unico verificable es el formato de distribucion: Piper 1.3.0 a 16 kHz, con un grafo ONNX y su JSON de configuracion asociado. No hay informacion publicada sobre volumen de horas de audio, composicion del corpus, hablantes utilizados, ni sobre si hubo ajuste con RLHF, DPO o cualquier otra tecnica de alineacion; en un modelo de sintesis de voz esas tecnicas no son de aplicacion habitual en todo caso.

La innovacion relevante aqui no es tecnica sino de disponibilidad y trazabilidad. El espejo documenta de forma explicita que los dos ficheros son identicos al contenido del zip original y publica sus hashes SHA256, lo que permite verificar la integridad de la copia y detectar cualquier modificacion posterior. Esa verificabilidad es relevante porque el repositorio de origen puede desaparecer o cambiar, y porque el espejo no concede por si mismo ningun derecho que la fuente no haya concedido.

## Capacidades

- Sintesis de voz (texto a voz) en makhuwa (`vmw`) a partir de texto de entrada.
- Generacion de audio a 16 kHz en formato Piper 1.3.0, compatible con el runtime Piper y con ONNX Runtime.
- Inferencia totalmente local: no requiere conexion a Internet ni APIs externas una vez descargados los ficheros.
- Integracion en asistentes de voz y pipelines de TTS que consuman voces Piper (OpenVoiceOS, Mycroft, Home Assistant, Rhasspy).
- Funcionamiento en hardware de bajos recursos, incluidas placas tipo Raspberry Pi, dado el tamano reducido del artefacto (63,5 MB).
- No soporta tool calling ni function calling: no es un modelo de lenguaje, no genera texto ni ejecuta razonamiento multi-paso.
- No tiene capacidades multimodales mas alla de la salida de audio; no procesa imagenes, video ni audio de entrada.
- No dispone de modo "thinking", agentes, ni capacidad de mantener conversaciones por si mismo; el estado conversacional lo aporta la aplicacion que lo invoca.
- Multilingue: no. Es un modelo monolingue entrenado unicamente para `vmw`.

## Casos de uso

- Asistentes de voz en emakhuwa: integrado como motor TTS de OpenVoiceOS o Rhasspy, permite construir un asistente que responda hablado en makhuwa sin salir del dispositivo, algo inviable con los TTS comerciales habituales.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos, avisos y documentos en makhuwa en entornos sin conectividad estable, con latencia baja al ejecutarse en CPU.
- Educacion y alfabetizacion: generacion de material audio para escuelas del norte de Mozambique, incluyendo lecturas de textos de primaria y contenidos de alfabetizacion en lengua local.
- Conservacion linguistica: creacion de corpus de audio sintetico para documentar y difundir el emakhuwa, y como base para comparar con grabaciones humanas en estudios foneticos.
- Sistemas de megafonia y avisos publicos: mensajes hablados repetibles para transporte, sanidad o avisos meteorologicos en comunidades donde el emakhuwa es la lengua principal.
- Atencion telefonica automatizada (IVR): respuestas de voz pregrabadas dinamicamente para menus y confirmaciones en centros de atencion que operen en makhuwa, con coste de infraestructura minimo.
- Aplicaciones moviles y dispositivos embebidos offline: al ocupar 63,5 MB y funcionar sobre ONNX Runtime, puede embarcarse en terminales de bajo coste o aplicaciones Android sin depender de la nube.
- Audiolibros y doblaje de bajo presupuesto: narracion automatizada de contenido escrito en makhuwa para publicacion en plataformas de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, metricas de inteligibilidad, comparaciones con voces humanas ni evaluaciones objetivas, y tampoco hay datos de velocidad de inferencia o de factor de tiempo real medidos sobre este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un artefacto ONNX de 63,5 MB se ejecuta comodamente en menos de 1 GB de memoria, tanto en RAM como en VRAM, aunque la cifra exacta depende del runtime.
- GPU recomendadas: no se especifican. El modelo no necesita GPU; cualquier GPU con ONNX Runtime disponible (por ejemplo, una GTX 1650 o superior) es mas que suficiente, y una RTX 4090 o A100 estarian sobredimensionadas para este artefacto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con soporte ONNX Runtime, y tambien en CPU.
- Inferencia en CPU: es el escenario de uso previsto por Piper; el tamano del modelo lo hace apto para placas tipo Raspberry Pi, mini-PC y telefonos.
- Opciones de despliegue: runtime Piper, ONNX Runtime, y cualquier orquestador que consuma voces Piper (por ejemplo, OpenVoiceOS, Rhasspy, Home Assistant, Mycroft). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a voces Piper.
- Latencia y throughput: no disponibles. No se proporcionan medidas de factor de tiempo real, latencia por frase ni rendimiento en caracteres por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| `OpenVoiceOS/kasanoma-makhuwa` | TTS Piper 1.3.0, 16 kHz, 63,5 MB | `vmw` (makhuwa) | ONNX | no declarada (`other`) | Espejo sin modificaciones; hashes publicados |
| `ghananlpcommunity/kasanoma-twi` | TTS Piper del mismo proyecto Kasanoma | twi | no disponible en la informacion facilitada | no disponible | Mencionada en la model card como la otra voz Kasanoma presente en el Hub |
| Voces Piper de referencia (Rhasspy / Open Home Foundation) | TTS Piper | multiples, mayoritariamente lenguas europeas | ONNX | habitualmente MIT en los modelos de referencia publicados por el proyecto Piper | No disponibles datos concretos de cada voz en la informacion facilitada |
| Meta MMS-TTS | TTS multilingue a gran escala | mas de 1.000 lenguas, cobertura variable en lenguas africanas | varios | CC-BY-NC 4.0 en las publicaciones de MMS | Restringe el uso comercial; no se dispone de confirmacion de cobertura de `vmw` en la informacion facilitada |

No se dispone de datos de rendimiento comparado entre estas opciones, por lo que la comparacion se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no definida: el origen afirma que los modelos se publican "bajo licencias de codigo abierto" pero no indica cual. No hay fichero LICENSE en el repositorio ni en el zip, y la consulta a la API de licencias de GitHub devuelve 404. El espejo no concede derechos adicionales. Para uso comercial o en produccion conviene contactar con el autor en `kasanoma@kasanoma.org` antes de utilizarlo.
- Sin garantia de procedencia mas alla del hash: el espejo garantiza que copia los ficheros originales byte a byte, pero no aporta informacion sobre el corpus de entrenamiento ni sobre los derechos de los datos de audio utilizados.
- Modelo monolingue: solo cubre `vmw`. No acepta texto en otros idiomas y no se documenta su comportamiento con prestamos, numeros o nombres propios escritos con ortografia de otra lengua.
- Sin datos de calidad subjetiva: no hay MOS, pruebas de inteligibilidad ni evaluacion de naturalidad, por lo que la calidad percibida de la voz es desconocida hasta que se pruebe.
- Riesgo de pronunciacion incorrecta: en lenguas de bajos recursos son frecuentes los errores en nombres propios, siglas, numeros y terminologia tecnica; se recomienda normalizar el texto antes de la sintesis.
- Dependencia del runtime Piper: el formato 1.3.0 debe consumirse con un runtime compatible. No hay variantes GGUF ni adaptaciones para otros motores, de modo que la portabilidad esta acotada.
- Sin soporte conversacional ni de agentes: es un componente de salida de audio; cualquier gestion de turnos, contexto o herramientas debe implementarse en la capa de aplicacion.
- Repositorio espejo con muy poca traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y ningun mantenimiento verificado.
- Fechas de metadatos inusuales: el Hub registra la creacion el 26 de septiembre de 2026, dato que conviene verificar si se va a citar.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/OpenVoiceOS/kasanoma-makhuwa
- Repositorio de origen: https://github.com/michsethowusu/kasanoma
- Release `makhuwa` del proyecto original: https://github.com/michsethowusu/kasanoma/releases/tag/makhuwa
- Enlace de licencia declarado por el autor: https://github.com/michsethowusu/kasanoma#license
- Voz Kasanoma Twi en el Hub: https://huggingface.co/ghananlpcommunity/kasanoma-twi
- Contacto del autor original: kasanoma@kasanoma.org

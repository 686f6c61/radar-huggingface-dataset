# OpenVoiceOS/kasanoma-twi

## Resumen

Kasanoma Twi es un modelo de síntesis de voz (text-to-speech) para twi, la lengua del grupo akan hablada principalmente en Ghana, identificada con el código de idioma `tw`. Se distribuye en formato Piper sobre ONNX, con dos únicos ficheros: `model.onnx` (63.516.050 bytes) y su configuración `model.onnx.json`, en Piper formato 1.3.0 y a 16 kHz. Esto lo sitúa en la categoría de voces ligeras, pensadas para inferencia en CPU y para su integración en asistentes de voz y pipelines de audio.

El repositorio no contiene un modelo entrenado por su autor en HuggingFace. Es un espejo sin modificaciones de la voz Twi publicada por michsethowusu dentro del proyecto Kasanoma, en su release `v1`, activo `kasanoma_model-twi.zip`. El autor del espejo declara explícitamente que no entrenó ni alteró la voz: los dos ficheros son los del zip, byte a byte, y publica sus hashes sha256 para que puedan verificarse.

Su relevancia actual es doble. Por un lado, cubre una lengua con muy poca cobertura en TTS, lo que permite construir interfaces habladas, lectores de contenido o sistemas de respuesta vocal en twi con un artefacto de apenas 63,5 MB. Por otro, y de forma igual de importante, el espejo existe porque la licencia del modelo original no está declarada: el repositorio fuente afirma que "todos los modelos Kasanoma se publican bajo licencias de código abierto" pero no incluye ningún fichero LICENSE ni especifica cuál, de modo que los términos de uso reales son desconocidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada en la model card. Se distribuye como modelo ONNX en formato Piper 1.3.0 (pipeline `text-to-speech`) |
| Parametros totales | No disponible (el artefacto `model.onnx` ocupa 63.516.050 bytes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: es un modelo TTS, la entrada es texto (o fonemas) sin ventana de contexto autoregresiva documentada |
| Tipos de cuantizacion | No disponible: este espejo publica un único `model.onnx`, sin variantes cuantizadas |
| Idiomas soportados | Twi (`tw`) |
| Licencia | `other` / `kasanoma-unspecified-open-source`. El origen no declara licencia concreta; no hay fichero LICENSE en el repositorio fuente ni en el zip de la release |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.json`), Piper 1.3.0 |
| Tarea | Text-to-speech (`text-to-speech`) |
| Frecuencia de muestreo | 16 kHz |
| Libreria / runtime | `piper` |
| Autoria original | michsethowusu (proyecto Kasanoma), release `v1` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes en el Hub | 0 / 0 |

Ficheros exactos publicados en el espejo, con hash declarado por el autor:

| Fichero | Bytes | sha256 |
|---|---|---|
| `model.onnx` | 63516050 | `a2e7f349fcca7b445b2c5c18d4a7009e128ea07c39bc4fc7dd6f0d9894afb191` |
| `model.onnx.json` | 4835 | `06de269e3f7b3afa0c313c7ca9185e199cd9b877dc41a6505a308a2bc87711de` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: solo indica que se trata de una voz Piper en formato 1.3.0, a 16 kHz, empaquetada como ONNX. No se especifica el tipo de red (VITS, Tacotron, FastSpeech u otro), ni la composición de las capas, ni el número de parámetros. Tampoco se documenta ningún detalle del entrenamiento: ni el número de horas de audio, ni la procedencia del corpus, ni si hubo ajuste fino, destilación, RLHF o algún otro procedimiento. Toda esa información es, a día de hoy, no disponible.

Lo único verificable sobre el proceso es la cadena de custodia de los ficheros: el espejo reproduce byte a byte los dos ficheros contenidos en `kasanoma_model-twi.zip` de la release `v1` del repositorio `michsethowusu/kasanoma`, y publica sus hashes sha256 para permitir la comprobación. El autor del espejo declara explícitamente que no entrenó la voz ni la modificó. Como innovación técnica destacable no hay nada documentado más allá del propio formato Piper, orientado a inferencia ligera en CPU.

## Capacidades

- Síntesis de voz en twi a partir de texto, con salida de audio a 16 kHz en formato Piper.
- Ejecución sobre ONNX Runtime mediante el runtime de Piper, sin necesidad de GPU.
- Integración directa en asistentes de voz basados en Piper (por ejemplo, stacks tipo OpenVoiceOS o Mycroft) como motor TTS para el idioma `tw`.
- Generación de audio local y offline una vez descargado el modelo, sin llamadas a servicios externos.
- Huella de almacenamiento reducida: alrededor de 63,5 MB para el modelo más 4.835 bytes de configuración.
- No hay soporte documentado de clonación de voz, control de estilo, emoción, velocidad configurable más allá de lo que permita Piper, ni síntesis multihablante.
- No hay soporte de tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No hay capacidades multimodales (no procesa imagen, vídeo ni audio de entrada), ni capacidades de reconocimiento de voz: es únicamente un modelo de síntesis.

## Casos de uso

- Lectura de contenido en twi: convertir artículos, noticias o documentación a audio para consumo en movilidad o para personas con discapacidad visual, aprovechando que la inferencia puede ejecutarse completamente en local.
- Asistentes de voz en twi: actuar como motor TTS dentro de un asistente que combine reconocimiento de voz y un modelo de lenguaje, de modo que la respuesta se pronuncie en twi en lugar de recurrir al inglés.
- Sistemas de atención telefónica automatizada (IVR): generar mensajes de menú y confirmaciones en twi para servicios de telefonía dirigidos a hablantes de la lengua, con la ventaja de no requerir GPU.
- Material educativo y de alfabetización: producir audios de apoyo para aprendizaje de lectura en twi en escuelas y programas de educación bilingüe, empaquetando el modelo en dispositivos de bajo coste.
- Accesibilidad en aplicaciones móviles y de escritorio: añadir lectura en voz alta en twi a aplicaciones existentes mediante el runtime de Piper, con un coste de integración bajo.
- Sistemas embebidos y domótica: desplegar el modelo en una Raspberry Pi u otro SBC para dar avisos hablados en twi sin conexión a internet.
- Preservación y difusión lingüística: generar versiones en audio de textos en twi para archivos sonoros y proyectos de documentación de la lengua, dado que el modelo es pequeño y fácil de redistribuir internamente.
- Pruebas y evaluación de pipelines TTS multilingües: usar esta voz como referencia dentro de un banco de pruebas de Piper para comparar calidad entre lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye MOS, similitud de hablante, inteligibilidad, latencia ni ningún otro tipo de métrica objetiva o subjetiva, y la búsqueda web realizada no ha devuelto ninguna fuente técnica relacionada con este modelo (los resultados obtenidos eran foros de construcción y aerolíneas, sin relación alguna).

Tampoco hay datos de rendimiento de inferencia (RTF, throughput en caracteres por segundo, consumo de CPU) publicados por el autor original ni por el autor del espejo.

## Requisitos de hardware

- VRAM estimada: no disponible como dato publicado. Por el tamaño del artefacto (63,5 MB), la inferencia cabe con holgura en memoria de sistema y puede ejecutarse en CPU sin GPU dedicada; la estimación de consumo en tiempo de ejecución no está documentada.
- GPU recomendadas: no aplica. Es una voz Piper pensada para CPU; no hay requisitos de GPU declarados. Funcionaría igualmente en cualquier GPU, pero no aporta ventaja medible documentada.
- GPU de consumo: irrelevante para este modelo; el cuello de botella es la CPU, no la memoria de vídeo.
- Despliegue en hardware de bajos recursos: viable en principio en SBC (Raspberry Pi y similares) y en móviles, dado el tamaño del fichero, aunque no hay cifras de latencia publicadas que lo confirmen.
- Opciones de despliegue: runtime de Piper (binario `piper` o bindings), ONNX Runtime directamente sobre `model.onnx`, e integraciones de TTS de asistentes de voz que consuman voces Piper. También es posible cargarlo desde entornos Python que usen Piper como backend.
- Latencia y throughput: no disponible.
- Almacenamiento: aproximadamente 0,1 GB para el repositorio completo.

## Comparativa con modelos similares

La búsqueda web no ha proporcionado ninguna fuente técnica sobre voces TTS comparables en twi, por lo que la comparación se limita a lo que figura en la propia model card y a referencias del ecosistema Piper.

| Modelo | Idioma | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVoiceOS/kasanoma-twi (este) | Twi (`tw`) | ONNX, Piper 1.3.0 | 63,5 MB (`model.onnx`) | No declarada (`other` / `kasanoma-unspecified-open-source`) | HuggingFace, espejo |
| ghananlpcommunity/kasanoma-twi | Twi (`tw`) | No disponible | No disponible | No disponible | HuggingFace, citado en la model card como la misma voz |
| Voces Piper de otros idiomas (familia `piper`) | Múltiples | ONNX, Piper | Del orden de decenas de MB | Habitualmente MIT en el proyecto Piper; verificar por voz | HuggingFace / repositorio Piper |

No se dispone de datos objetivos (MOS, inteligibilidad, latencia) para establecer una comparación cuantitativa con alternativas en twi o en otras lenguas de Ghana.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio original afirma que sus modelos se publican "bajo licencias de código abierto" pero no incluye fichero LICENSE, no hay licencia en el zip de la release y la consulta a la API de licencias del repositorio devuelve 404. Los términos que se aplican al usuario son, por tanto, desconocidos. El espejo usa `license: other` por ese motivo y no porque se aplique otra licencia concreta.
- Uso comercial en riesgo: al no existir términos definidos, no se puede asumir permiso para uso comercial, redistribución o modificación. El propio autor del espejo recomienda contactar con el autor original en kasanoma@kasanoma.org antes de usar el modelo si se necesitan condiciones claras.
- El espejo no concede nada que la fuente no haya concedido: no amplía derechos ni añade garantías.
- Idiomas: únicamente twi (`tw`). No hay soporte multilingüe declarado ni se documenta comportamiento con mezcla de inglés u otras lenguas, algo habitual en contextos reales de Ghana.
- Riesgo de alucinación en el sentido de pronunciación incorrecta, prosodia defectuosa o errores en palabras fuera del dominio de entrenamiento: la model card no aporta información sobre la cobertura del vocabulario ni sobre el corpus, por lo que no se puede acotar este riesgo.
- Sesgos: no hay información sobre la variedad dialectal representada (asante twi frente a otras variantes), el sexo o la edad de la voz, ni sobre la distribución de hablantes del corpus. No se puede evaluar el sesgo de representación.
- Datos de evaluación ausentes: sin MOS ni pruebas de inteligibilidad publicadas, no hay forma de comparar la calidad con otras voces antes de integrarla en producción.
- Trazabilidad limitada del entrenamiento: se desconoce el origen del audio, lo que puede ser relevante si el uso previsto exige conocer la procedencia y los permisos de los datos.
- Adopción nula en el Hub: cero descargas y cero likes en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad.
- Fecha de creación del repositorio en el Hub: 26 de septiembre de 2026; conviene verificar la vigencia del espejo y de los enlaces antes de depender de ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenVoiceOS/kasanoma-twi
- Modelo original (mismo autor, otra organización): https://huggingface.co/ghananlpcommunity/kasanoma-twi
- Repositorio fuente del proyecto Kasanoma: https://github.com/michsethowusu/kasanoma
- Release `v1` con el asset `kasanoma_model-twi.zip`: https://github.com/michsethowusu/kasanoma/releases/tag/v1
- Enlace de licencia al que apunta la model card: https://github.com/michsethowusu/kasanoma#license
- Contacto indicado por el autor del espejo para consultar condiciones: kasanoma@kasanoma.org

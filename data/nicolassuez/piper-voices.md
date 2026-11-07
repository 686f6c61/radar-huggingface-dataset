# Nicolassuez/piper-voices

## Resumen

`Nicolassuez/piper-voices` es un espejo sin modificaciones del repositorio `rhasspy/piper-voices`, que contiene el catálogo de voces del sistema de síntesis de voz (text-to-speech) Piper. No se trata de un modelo de lenguaje generativo, sino de una colección de modelos acústicos y vocoders en formato ONNX organizados por idioma y variante de voz, junto con sus ficheros de configuración. El autor del espejo (Nicolassuez) lo mantiene para que el proyecto aSup no dependa de un repositorio de terceros; la autoría real, las licencias y los créditos corresponden al proyecto original de Rhasspy.

El repositorio ocupa 11,9 GB y cubre 34 idiomas (árabe, catalán, checo, galés, danés, alemán, griego, inglés, español, persa, finés, francés, húngaro, islandés, italiano, georgiano, kazajo, luxemburgués, letón, nepalí, neerlandés, noruego, polaco, portugués, rumano, ruso, eslovaco, esloveno, serbio, sueco, suajili, turco, ucraniano, vietnamita y chino). Según el catálogo externo PiperHub, el ecosistema Piper reúne 536 voces en 71 idiomas y 3.755 hablantes, lo que da una idea de la escala del proyecto original.

Su relevancia actual radica en que permite desplegar TTS neuronal de forma totalmente local y ligera, sin depender de servicios en la nube, lo que encaja en asistentes de voz, domótica (Home Assistant), sistemas de accesibilidad y pipelines de generación de audio por lotes. Al ser un espejo, la ficha describe el contenido del catálogo Piper, no un modelo único entrenado por el autor del espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos acústicos neuronales de Piper (VITS / variantes ligeras) exportados a ONNX, acompañados de vocoder y ficheros de configuración por voz; no disponible el detalle exacto de cada checkpoint |
| Parametros totales | no disponible (varía por voz; el repo contiene cientos de voces con modelos de baja huella) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (síntesis de voz por fragmentos de texto, no modelo de contexto) |
| Tipos de cuantizacion | no disponible en la información proporcionada; los pesos se distribuyen habitualmente como ONNX (fp32/fp16 según voz) |
| Idiomas soportados | ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh (34 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (modelos acústicos y vocoders) más JSON de configuración por voz |

## Arquitectura y entrenamiento

El catálogo agrupa voces del sistema Piper, que emplea modelos acústicos neuronales del tipo VITS (end-to-end text-to-speech con encoder de texto, predictor de duración, flujo normalizador y decoder) y variantes ligeras, exportados a ONNX para inferencia eficiente en CPU. Cada voz se distribuye con su modelo acústico, su vocoder y un fichero JSON de configuración que define el mapeo de fonemas, el sample rate y los parámetros de prosodia. Piper convierte texto a fonemas mediante espeak-ng y después sintetiza la onda con el modelo neuronal.

No se dispone en la información proporcionada de los detalles de entrenamiento de cada voz (número de horas de audio, composición de los datasets, uso de RLHF/DPO o técnicas de aumentación). El repositorio original remite a `piper-checkpoints` para los checkpoints utilizables en el reentrenamiento de voces propias, lo que confirma que el proyecto está pensado para fine-tuning y para la creación de voces personalizadas. La innovación principal del ecosistema es la inferencia local de baja latencia en CPU y en hardware modesto, con modelos de pequeño tamaño por voz.

## Capacidades

- Síntesis de voz (text-to-speech) neuronal a partir de texto plano en 34 idiomas, con múltiples hablantes por idioma en el catálogo original.
- Generación de audio WAV a partir de texto con control de velocidad y parámetros de prosodia mediante la CLI de Piper y sus bindings.
- Fonemización multilingüe mediante espeak-ng, lo que permite cubrir idiomas con alfabetos y fonologías diversas.
- Selección de voz por idioma y hablante; el catálogo incluye variantes masculinas, femeninas y de distintos registros.
- Ejecución totalmente offline: no requiere llamadas a API externas ni conexión a internet una vez descargados los modelos.
- Integración con asistentes de voz y domótica (por ejemplo, Home Assistant y Rhasspy) mediante el motor Piper.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un motor TTS.
- No procesa visión, audio de entrada ni texto generativo; su única salida es audio sintetizado.

## Casos de uso

- Asistentes de voz para domótica: integrar una voz en español o catalán en Home Assistant para que el asistente lea estados, avisos y respuestas de forma local, sin enviar texto a la nube y con latencia baja en CPU.
- Lectura de textos largos y accesibilidad: convertir artículos, documentos o notificaciones a audio para personas con discapacidad visual, eligiendo la voz y el idioma adecuados del catálogo.
- Generación de audio por lotes: sintetizar miles de fragmentos (por ejemplo, avisos de transporte o mensajes de IVR) en un pipeline offline, aprovechando el formato ONNX y la ejecución en CPU.
- Doblaje y prototipado de contenido multilingüe: producir borradores de voz en varios de los 34 idiomas soportados para validar guiones antes de contratar voces profesionales.
- Sistemas de megafonía y anuncios en comercios o transporte: generar anuncios pregrabados con voces claras y consistentes, sin coste por llamada a API.
- Investigación en TTS y fine-tuning: usar los checkpoints originales de Piper para reentrenar o adaptar voces a un dominio concreto (por ejemplo, terminología médica o nombres propios locales).
- Aplicaciones educativas de idiomas: reproducir pronunciación en distintos idiomas y variantes para ejercicios de escucha y repetición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; cada voz de Piper es un modelo pequeño que habitualmente se ejecuta en CPU sin GPU dedicada.
- GPU recomendadas: no necesarias para el uso típico; el ecosistema Piper está optimizado para inferencia en CPU. Para lotes masivos se puede usar cualquier GPU con soporte ONNX Runtime, pero no hay cifras publicadas en la información disponible.
- Cabe en GPU de consumo: sí, en la práctica cualquier GPU de consumo puede ejecutar los modelos ONNX, aunque el diseño del sistema prioriza CPU.
- Opciones de despliegue: CLI de Piper, bindings de Python, integración con Home Assistant y Rhasspy, y ejecución mediante ONNX Runtime. No se documenta en la información proporcionada soporte nativo de vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Piper (este catálogo) | TTS neuronal local (VITS/ONNX) | 34 en el espejo; 71 en el catálogo PiperHub | MIT | ONNX | Hugging Face, GitHub, PiperHub |
| Coqui TTS | TTS neuronal | Amplio, variable por modelo | MPL-2.0 en el framework; licencias por modelo | PyTorch, ONNX en algunos modelos | GitHub, Hugging Face |
| eSpeak NG | TTS por concatenación/formantes | Muy amplio | GPLv3 | Motor nativo, sin pesos neuronales | Repositorios de sistema |
| MaryTTS | TTS modular | Limitado, variable | LGPL | Java, modelos propios | GitHub |

La comparación con Coqui TTS, eSpeak NG y MaryTTS es cualitativa: no se dispone de métricas objetivas (MOS, WER de síntesis) en la información proporcionada para establecer una comparación numérica. Piper destaca por su licencia MIT permisiva, su formato ONNX ligero y su orientación a ejecución local en CPU, mientras que eSpeak NG es mucho más ligero pero con calidad de voz sintética inferior, y Coqui TTS ofrece mayor flexibilidad de investigación a costa de un despliegue más pesado.

## Limitaciones y advertencias

- Es un espejo no modificado: cualquier incidencia, licencia o crédito debe verificarse en el repositorio original `rhasspy/piper-voices`; el autor del espejo no mantiene los modelos.
- La licencia MIT del repositorio no garantiza por sí sola el uso comercial de todas las voces: algunas voces del catálogo original pueden tener condiciones específicas de sus datasets de origen. Es necesario revisar la model card de cada voz antes de un uso en producción.
- Calidad de voz variable entre idiomas y hablantes: no todas las voces tienen el mismo nivel de naturalidad ni la misma cobertura fonética.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, neologismos y textos con mezcla de idiomas; la fonemización depende de espeak-ng y del diccionario de la voz.
- No es un modelo de lenguaje: no razona, no responde preguntas ni mantiene conversaciones; solo convierte texto en audio.
- El repositorio pesa 11,9 GB y contiene cientos de ficheros; descargar el catálogo completo no es necesario y conviene seleccionar solo las voces requeridas.
- No se dispone de información sobre sesgos demográficos o acústicos por voz en la información proporcionada.
- El espejo se creó y actualizó en noviembre de 2026 según los metadatos; conviene comprobar si el repositorio original ha avanzado desde la revisión `e7229f7d33a10e145e109b886d661984201ac3c4`.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/Nicolassuez/piper-voices
- Repositorio original en Hugging Face: https://huggingface.co/rhasspy/piper-voices
- Proyecto Piper en GitHub: https://github.com/rhasspy/piper
- Guía de entrenamiento de voces Piper: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints para entrenar voces: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
- Catálogo externo PiperHub: https://piperhub.org/

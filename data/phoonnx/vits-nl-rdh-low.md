# Phoonnx/vits-nl-rdh-low

## Resumen

`vits-nl-rdh-low` es un modelo de síntesis de voz (text-to-speech) en neerlandés basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite de voces Mimic3 y empaquetado por Phoonnx para su biblioteca de inferencia ONNX. El modelo convierte texto en neerlandés, previamente fonemizado con gruut en alfabeto IPA, en audio inteligible, y se distribuye como un artefacto ONNX ligero (0,1 GB) listo para ejecutarse en entornos de producción sin dependencias de frameworks de deep learning pesados.

Su relevancia actual reside en que cubre un hueco concreto: TTS neerlandés de código abierto, con licencia CC-BY-SA-4.0, ejecutable en CPU y fácilmente integrable en asistentes de voz como OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. La etiqueta `low` indica una variante de calidad reducida, pensada para priorizar velocidad y huella de memoria frente a naturalidad máxima.

No es un modelo de lenguaje generativo ni un sistema multimodal: es un sintetizador acústico especializado, con un ámbito de uso bien delimitado (lectura de texto en neerlandés) y sin capacidades de razonamiento, tool calling ni contexto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; variante `low` de calidad) |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Autor original | Mycroft AI |
| Empaquetado | Phoonnx |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador acústico basado en flujos normalizadores y un discriminador adversarial en entrenamiento, con un generador HiFi-GAN integrado para producir la forma de onda. El resultado es un modelo que genera audio de forma directa desde fonemas, sin necesidad de un vocoder separado en inferencia.

En este caso concreto no se dispone de información sobre el corpus de entrenamiento (horas de audio, número de hablantes, procedencia de los datos), el proceso de alineamiento ni si hubo ajuste fino adicional. La model card solo indica que el modelo procede del repositorio `MycroftAI/mimic3-voices/voices/nl/rdh_low` y que la entrada es texto fonemizado con gruut. La variante `low` sugiere una configuración reducida del modelo (menor resolución espectral o menor número de canales), orientada a latencia baja, pero no se detallan los parámetros exactos.

## Capacidades

- Síntesis de voz a partir de texto en neerlandés, con salida en formato WAV mediante `voice.synthesize_wav()`.
- Fonemización de entrada mediante `GruutPhonemizer` del paquete `scriptconv`, que normaliza el texto y lo convierte a IPA antes de la inferencia.
- Ejecución en CPU mediante ONNX Runtime, sin requerir GPU.
- Integración nativa con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Uso programático en Python mediante `TTSModelManager` de la librería phoonnx.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al neerlandés; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se selecciona como voz TTS en `mycroft.conf` y responde en neerlandés a consultas del asistente, con latencia baja gracias a su tamaño reducido y ejecución en CPU.
- Lectura de notificaciones y alertas en sistemas embebidos: al ser un artefacto ONNX de 0,1 GB, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, mini-PC) para leer mensajes en neerlandés sin conexión a la nube.
- Accesibilidad para personas con discapacidad visual: conversión de texto de interfaces, documentos o correos a audio neerlandés en aplicaciones de escritorio o móviles.
- Generación de audiolibros o contenido narrado en neerlandés: síntesis por lotes de párrafos largos, troceando el texto en frases y concatenando los WAV resultantes.
- Pruebas automatizadas de pipelines de voz: uso como voz de referencia barata y determinista para validar integraciones de TTS en CI, sin depender de servicios externos.
- Prototipado de interfaces conversacionales en neerlandés: validación temprana de flujos de voz (IVR, kioscos, domótica) antes de invertir en voces comerciales de mayor calidad.
- Localización de contenidos para el mercado neerlandés: generación de pistas de audio para vídeos, tutoriales o presentaciones con licencia CC-BY-SA-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para inferencia en CPU mediante ONNX Runtime y no requiere GPU.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime podría usarse, pero no se documenta.
- Cabida en GPU de consumo: irrelevante para el caso de uso previsto; el despliegue típico es en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime como backend.
- Latencia y throughput: no disponibles en la información proporcionada; la variante `low` está orientada a minimizar latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-nl-rdh-low` | VITS | nl | ONNX | CC-BY-SA-4.0 | Variante de baja calidad, empaquetada para phoonnx |
| Otras voces Mimic3 (`mimic3-voices`) | VITS | varios | ONNX / otros | CC-BY-SA-4.0 (según voz) | Mismo origen upstream; calidad y hablante variables |
| Piper (voces nl) | VITS | nl | ONNX | MIT / otras según voz | Ecosistema alternativo de TTS ligero en ONNX |
| Coqui TTS (voces nl) | VITS / Tacotron | nl | PyTorch | MPL-2.0 / otras | Requiere framework más pesado; mayor huella |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la información proporcionada.

## Limitaciones y advertencias

- Calidad de voz reducida por diseño (etiqueta `low`): puede sonar menos natural que variantes de mayor calidad del mismo repositorio.
- Modelo monoidioma: solo neerlandés; no se debe usar para otros idiomas sin validación previa.
- Requiere fonemización con gruut; un texto mal normalizado o con caracteres no soportados puede producir pronunciaciones incorrectas.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- Riesgo de alucinación acústica: como todo TTS, puede generar artefactos, ruidos o entonaciones extrañas en textos atípicos (siglas, números, nombres propios).
- Sin información publicada sobre sesgos de hablante, género o acento; la voz `rdh` corresponde a un hablante concreto y no se documentan sus características.
- No apto para tareas de razonamiento, diálogo o comprensión: es exclusivamente un sintetizador.
- Repositorio con muy pocas descargas (30) y sin likes: ecosistema pequeño, menor probabilidad de soporte comunitario.
- Fecha de creación del repositorio en 2026 (según metadatos de Hugging Face); verificar la vigencia y el mantenimiento del proyecto phoonnx antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl-rdh-low
- Repositorio upstream (Mycroft AI, voz `nl/rdh_low`): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/nl/rdh_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

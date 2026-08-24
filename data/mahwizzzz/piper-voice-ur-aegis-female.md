# mahwizzzz/piper-voice-ur-aegis-female

## Resumen

Aegis es una voz femenina de síntesis de voz (TTS) para urdu, desarrollada por Muhammad Mahwiz Khalil (Proxima AI) sobre el ecosistema Piper de Rhasspy. El modelo se distribuye en formato ONNX y está diseñado específicamente para inferencia en CPU, lo que permite su ejecución offline en dispositivos de bajos recursos, incluidos ordenadores de placa única como Raspberry Pi. Su tamaño de aproximadamente 61 MB lo convierte en una opción práctica para integraciones embebidas y aplicaciones de accesibilidad.

El modelo aborda la escasez de voces femeninas de calidad en urdu dentro del ecosistema Piper, complementando la voz masculina existente Fasih. Se construyó mediante un proceso de destilación a nivel de datos que comprime las capacidades de un sistema TTS multilingüe más grande (OmniVoice) en un formato compacto y eficiente. La voz se generó utilizando un modelo TTS zero-shot para crear datos de entrenamiento, que posteriormente se utilizaron para afinar el checkpoint masculino Fasih, transfiriendo así las características de habla femenina.

La relevancia actual de este modelo radica en su licencia MIT, que permite uso comercial y modificación sin restricciones, y en su integración nativa con el motor Piper, ampliamente adoptado en proyectos de domótica, asistentes de voz y herramientas de accesibilidad. Su naturaleza ligera y su enfoque en un idioma con poca representación en TTS open source lo convierten en un recurso valioso para la comunidad de habla urdu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piper TTS (basada en VITS) |
| Parametros totales | no disponible (modelo ONNX de ~61 MB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (TTS) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | Urdu (`ur_PK`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx` + `.onnx.json`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Piper, que a su vez utiliza VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech). VITS combina un encoder de texto, un decoder de forma de onda y un discriminador adversarial, todo entrenado de extremo a extremo. El modelo procesa texto en urdu, lo convierte en fonemas IPA mediante eSpeak-ng, y genera audio a 22050 Hz de frecuencia de muestreo.

El entrenamiento se realizó en dos etapas. Primero, se utilizó un modelo TTS zero-shot (OmniVoice) para generar datos de habla femenina en urdu, en un proceso de destilación a nivel de datos. Estos datos sintéticos se emplearon para afinar el checkpoint masculino Fasih (`ur_PK-male-medium`), creado por IhorShevchuk. Fasih, a su vez, fue entrenado a partir de un checkpoint de hindi medio (Rohan) disponible en `rhasspy/piper-checkpoints`. Este enfoque de transferencia entre idiomas relacionados (hindi-urdu) y entre géneros (masculino a femenino) es la innovación técnica principal del modelo.

## Capacidades

- Generación de voz femenina en urdu con calidad media.
- Inferencia en CPU sin necesidad de GPU, con ejecución offline completa.
- Integración con el motor Piper mediante línea de comandos o API.
- Compatible con el ecosistema de herramientas de Rhasspy (asistente de voz open source).
- Frecuencia de muestreo de 22050 Hz, adecuada para reproducción estándar.
- Soporte para fonemización mediante eSpeak-ng en urdu.
- Modelo compacto (~61 MB) apto para dispositivos con recursos limitados.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en urdu: el modelo puede integrarse en lectores de pantalla que convierten texto en voz, proporcionando una voz femenina natural para usuarios de habla urdu en aplicaciones de escritorio o móviles.
- Asistentes de voz para domótica: al ser ligero y ejecutarse en CPU, puede desplegarse en Raspberry Pi o dispositivos similares para crear asistentes domésticos que respondan en urdu, integrándose con Home Assistant o Rhasspy.
- Audiolibros y contenido educativo: la voz puede utilizarse para generar audiolibros en urdu, especialmente útil para material educativo dirigido a niños o personas que prefieren contenido auditivo.
- Sistemas de navegación GPS: integración en aplicaciones de navegación que necesiten instrucciones habladas en urdu con voz femenina, funcionando offline en dispositivos móviles.
- Atención al cliente automatizada: en sistemas IVR (respuesta de voz interactiva) para empresas que atienden a población de habla urdu, el modelo puede generar respuestas pregrabadas o dinámicas sin necesidad de servicios en la nube.
- Herramientas de aprendizaje de idiomas: aplicaciones que enseñan urdu pueden usar esta voz para pronunciar palabras y frases, ofreciendo una alternativa femenina a las voces masculinas existentes.
- Generación de contenido para redes sociales: creadores de contenido en urdu pueden generar locuciones para vídeos o podcasts sin necesidad de estudios de grabación, usando herramientas basadas en Piper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas objetivas como MOS (Mean Opinion Score) o comparaciones con otras voces de urdu. La calidad se describe como "media" en la model card, pero sin datos cuantitativos que respalden esta afirmación.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en procesadores x86_64 y ARM, incluidos Raspberry Pi 3 y superiores.
- Memoria RAM: se estima que requiere menos de 256 MB en tiempo de ejecución, dado el tamaño del modelo (~61 MB).
- GPU: no necesaria. El modelo funciona exclusivamente en CPU.
- Almacenamiento: aproximadamente 61 MB para el modelo ONNX más el archivo de configuración JSON.
- Opciones de despliegue: motor Piper (CLI), integración con Rhasspy, uso mediante librerías Python como `piper-tts`, o servidores TTS como Piper HTTP server.
- Latencia: no disponible, pero los modelos Piper suelen generar audio más rápido que en tiempo real en CPUs modernas.

## Comparativa con modelos similares

| Modelo | Idioma | Género | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| Aegis (este modelo) | Urdu | Femenino | ~61 MB | MIT | ONNX |
| Fasih (`IhorShevchuk/piper-voice-ur-fasih`) | Urdu | Masculino | similar | MIT | ONNX |
| Rohan (checkpoint hindi) | Hindi | Masculino | similar | MIT | ONNX |

La comparativa se limita a modelos de la familia Piper, ya que no se dispone de información sobre otras voces femeninas en urdu dentro del ecosistema. Aegis es el único modelo femenino de urdu documentado en Piper, lo que lo hace único en su categoría. Frente a Fasih, su contraparte masculina, comparte arquitectura y licencia, diferenciándose únicamente en el género de la voz y el proceso de entrenamiento.

## Limitaciones y advertencias

- Calidad de voz media: la voz puede sonar menos natural que modelos comerciales de TTS, especialmente en oraciones largas o con entonación compleja.
- Limitación a un solo idioma: el modelo solo soporta urdu (`ur_PK`), sin capacidades multilingües.
- Dependencia de eSpeak-ng: la fonemización depende de la calidad de eSpeak-ng para urdu, que puede tener errores en palabras poco comunes o nombres propios.
- Datos de entrenamiento sintéticos: al haberse generado los datos mediante un modelo zero-shot, puede haber artefactos o sesgos en la pronunciación que no aparecerían con datos naturales.
- Sin control de emociones o estilos: el modelo genera voz plana, sin soporte para emociones, énfasis o estilos de habla específicos.
- Requisito de atribución: la licencia MIT exige conservar el aviso de copyright y atribución a Muhammad Mahwiz Khalil en cualquier redistribución o uso del modelo.
- Sin actualizaciones garantizadas: al ser un proyecto personal, no hay garantía de mantenimiento o soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahwizzzz/piper-voice-ur-aegis-female
- Repositorio del modelo (archivos): https://huggingface.co/mahwizzzz/piper-voice-ur-aegis-female/tree/main
- Modelo base Fasih: https://huggingface.co/IhorShevchuk/piper-voice-ur-fasih
- Artículo sobre destilación de OmniVoice en Aegis: https://www.plushcap.com/content/huggingface/blog/huggingface-distilling-omnivoice-into-aegis-female-urdu-tts-at-61-mb-onnx-for-cpu-inference
- Lista completa de voces Piper: https://docs.gladecore.com/files/piper-voice-models

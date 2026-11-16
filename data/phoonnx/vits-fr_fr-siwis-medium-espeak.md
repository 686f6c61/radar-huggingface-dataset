# Phoonnx/vits-fr_fr-siwis-medium-espeak

## Resumen

vits-fr_fr-siwis-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su uso con la libreria ONNX `phoonnx`. El modelo convierte texto en frances de Francia (`fr-FR`) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo hace ligero y apto para inferencia en CPU y dispositivos de bajos recursos.

La relevancia de este modelo radica en su empaquetado: Phoonnx lo integra en un ecosistema Python y en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, ademas de ofrecer una variante JavaScript (`phoonnx.js`) que ejecuta voces VITS en el navegador. Al derivar de Piper, hereda un modelo entrenado por Rhasspy con calidad "medium" y licencia MIT, lo que facilita su uso comercial y su despliegue en entornos embebidos o asistentes de voz autoalojados.

El modelo esta pensado para sintesis de voz en tiempo real de una sola voz (identificada como `siwis`) en frances. No es un modelo multimodal ni de gran tamano: es una pieza de infraestructura TTS especializada, con un front-end de texto que normaliza y fonemiza la entrada antes de la sintesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | frances de Francia (`fr-FR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto basado en transformers, un predictor de duraciones, un normalizing flow y un decoder generativo condicionado por variables latentes, entrenado con aprendizaje adversarial (GAN) y una perdida de reconstruccion variacional. Este modelo concreto es la variante "medium" del voice `siwis` de Piper para frances, exportada a ONNX para inferencia. El modelo original fue entrenado por Rhasspy como parte de `rhasspy/piper-voices`; no se dispone de detalles sobre el corpus de entrenamiento, el numero de horas de audio ni la composicion del dataset.

El empaquetado de Phoonnx anade un front-end de texto propio: la libreria `scriptconv` normaliza la entrada y la convierte en fonemas mediante `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`, que depende de espeak-ng. El modelo consume fonemas en alfabeto IPA, no texto crudo. Segun la model card, el uso del port `espyak` en lugar de espeak-ng puede producir pronunciaciones incorrectas en algunas palabras, por lo que se recomienda instalar espeak-ng nativo.

## Capacidades

- Sintesis de voz (text-to-speech) en frances de Francia a partir de texto.
- Entrada basada en fonemas espeak en alfabeto IPA, con normalizacion de texto previa mediante `scriptconv`.
- Generacion de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integracion como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable en `mycroft.conf`.
- Ejecucion en navegador mediante `phoonnx.js`, que soporta entrada espeak o unicode.
- Voz unica (`siwis`) de calidad "medium".
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo de sintesis.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper/fr_FR-siwis-medium` en `mycroft.conf`, proporcionando respuestas habladas en frances sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en frances: integrado en un pipeline Python con `TTSModelManager`, permite convertir mensajes dinamicos a WAV para su reproduccion en altavoces o sistemas de megafonia.
- Accesibilidad: sintesis de voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual que operen en frances, con un modelo ligero que puede ejecutarse en CPU.
- Síntesis en el navegador: mediante `phoonnx.js`, se puede generar voz francesa del lado del cliente en aplicaciones web educativas o de idiomas, sin enviar texto a un servidor.
- Generacion de contenido de audio para prototipos y demos: al ser un artefacto ONNX de 0,1 GB con licencia MIT, es adecuado para pruebas rapidas de interfaces conversacionales en frances.
- Sistemas embebidos y dispositivos de bajos recursos: el tamano reducido y el formato ONNX facilitan su despliegue en Raspberry Pi u otros equipos sin GPU dedicada para tareas de aviso hablado.
- Localizacion de aplicaciones al frances: permite anadir una voz francesa a productos que ya usan el ecosistema Piper o phoonnx, reutilizando el mismo front-end de fonemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo ONNX de aproximadamente 0,1 GB, la huella de memoria es muy reducida y cabe holgadamente en CPU.
- GPU recomendadas: no se especifican; el modelo esta disenado para inferencia en CPU y no requiere GPU dedicada.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque no es necesario su uso.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). Al ser ONNX, puede ejecutarse con runtime ONNX generico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-fr_fr-siwis-medium-espeak (este) | VITS | fr-FR | MIT | ONNX | Empaquetado por Phoonnx desde Piper; entrada espeak IPA |
| Piper `fr_FR-siwis-medium` (upstream) | VITS | fr-FR | MIT | ONNX | Modelo original de Rhasspy; misma voz y calidad |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | MIT (segun upstream) | ONNX | Mismo pipeline de empaquetado, distintos idiomas y voces |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza frances de Francia (`fr-FR`); no soporta otros idiomas.
- Voz unica (`siwis`) de calidad "medium"; no hay control de estilo, emocion ni multiples hablantes.
- Dependencia de espeak-ng: si se usa el port `espyak` en lugar de espeak-ng nativo, algunas palabras pueden pronunciarse incorrectamente, segun la model card.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero la sintesis puede producir pronunciaciones erroneas ante entradas no normalizadas o fuera de dominio.
- No se dispone de informacion sobre sesgos del corpus de entrenamiento ni sobre la composicion del dataset original de Piper.
- Licencia MIT declarada por el upstream; se recomienda verificar los terminos de `rhasspy/piper-voices` antes de un uso comercial a gran escala.
- El modelo fue creado y actualizado en fechas futuras segun los metadatos (2026), lo que puede indicar un empaquetado reciente y poca validacion comunitaria (20 descargas, 0 likes).

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-siwis-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/siwis/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

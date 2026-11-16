# Phoonnx/vits-es_es-mls_10246-low-espeak

## Resumen

vits-es_es-mls_10246-low-espeak es un modelo de sintesis de voz (text-to-speech) en castellano de Espana, empaquetado por Phoonnx a partir de la voz original de Rhasspy Piper (`rhasspy/piper-voices/es/es_ES/mls_10246/low`). Se trata de un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) exportado a ONNX y distribuido con la libreria phoonnx, pensada para inferencia TTS en Python y en el ecosistema OVOS. El modelo es de calidad "low" dentro de la escala de Piper, lo que se traduce en un tamano de repositorio de 0,1 GB y una huella de inferencia muy reducida.

El problema que resuelve es la sintesis de voz en castellano de bajo coste computacional para asistentes de voz, domotica y aplicaciones embebidas. Al estar basado en VITS, es un modelo end-to-end que genera forma de onda directamente a partir de fonemas, sin necesidad de vocoder separado. El front-end textual utiliza fonemas espeak-ng en alfabeto IPA, por lo que requiere la instalacion de espeak-ng o del puerto espyak para funcionar correctamente.

Es relevante ahora porque permite integrar TTS en castellano en entornos con recursos limitados (Raspberry Pi, contenedores ligeros, navegador via phoonnx.js) con licencia MIT y sin dependencias de servicios en la nube. No obstante, la informacion publicada es escasa: no se detallan parametros, contexto ni datos de entrenamiento, y el modelo no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (distribucion ONNX; variante "low" de Piper) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Genera la forma de onda directamente, sin vocoder externo, lo que reduce la latencia y la complejidad del pipeline. En este caso, el modelo se distribuye como grafo ONNX optimizado para inferencia ligera.

No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. La voz original procede del conjunto MLS (Multilingual LibriSpeech) segun el identificador `mls_10246`, y fue publicada por Rhasspy dentro de Piper. La etiqueta "low" indica una variante de baja calidad y bajo coste dentro de la familia Piper, orientada a dispositivos con recursos limitados. El front-end textual delega en scriptconv, que normaliza el texto y aplica el fonemizador `EspeakPhonemizer` para producir la secuencia IPA de entrada.

## Capacidades

- Sintesis de voz en castellano de Espana (es-ES) a partir de texto plano.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav()`.
- Fonemizacion basada en espeak-ng (o espyak como alternativa), con normalizacion de texto previa via scriptconv.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx` y configuracion en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con demo en vivo.
- Inferencia ONNX ligera, adecuada para CPU y dispositivos embebidos.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No se documentan capacidades multilingues mas alla del castellano de Espana.

## Casos de uso

- Asistentes de voz para domotica: el modelo sintetiza respuestas cortas en castellano dentro de OVOS con el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `piper/es_ES-mls_10246-low` en `mycroft.conf`. Su tamano reducido permite ejecutarlo en Raspberry Pi o mini-PC junto al resto del stack.
- Notificaciones y avisos por voz en aplicaciones de escritorio: integracion via Python con `TTSModelManager` para generar WAVs bajo demanda y reproducirlos en el sistema, sin depender de APIs externas.
- Lectura de textos en aplicaciones web: mediante phoonnx.js y la demo de TigreGotico, se puede sintetizar castellano en el navegador con entrada espeak o unicode, util para accesibilidad de contenido.
- Prototipado rapido de interfaces conversacionales: al ser un modelo ONNX de 0,1 GB y licencia MIT, sirve para validar flujos de voz en entornos de desarrollo y CI sin coste de infraestructura.
- Generacion de audiolibros o podcasts de baja fidelidad: la variante "low" prioriza velocidad y ligereza, adecuada para contenido donde la inteligibilidad prima sobre la naturalidad.
- Sistemas de anuncios en transporte o comercio: sintesis local de mensajes pregrabados o dinamicos en castellano en dispositivos con CPU limitada, evitando latencia de red.
- Pruebas de regresion de pipelines TTS: el repositorio ligero y la API sencilla permiten incluirlo en tests automatizados de sintesis en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se infiere una huella de memoria muy baja, apta para CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para inferencia ONNX en CPU.
- Cabe en GPU consumer: si, por su tamano reducido, aunque no se documentan requisitos minimos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador.
- Latencia y throughput: no disponibles.
- Dependencia externa: espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]` con espyak).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-es_es-mls_10246-low-espeak (este) | VITS | es-ES | MIT | ONNX | 0,1 GB | Variante "low" de Piper, empaquetada por Phoonnx |
| rhasspy/piper-voices es_ES mls_10246 low | VITS | es-ES | MIT | ONNX | no disponible | Modelo upstream original de Rhasspy |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | MIT (segun upstream) | ONNX | variable | Mismo empaquetado, distintos idiomas y calidades |

No se dispone de datos de benchmarks ni de modelos comparables con metricas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad "low": la variante de Piper esta optimizada para ligereza, no para naturalidad; puede presentar prosodia menos fluida que variantes "medium" o "high".
- Dependencia de espeak-ng: sin espeak-ng instalado, el extra `phoonnx[espeak]` usa espyak, cuyos fonemas difieren en algunos casos y pueden provocar pronunciaciones incorrectas.
- Cobertura limitada a es-ES: no se documentan otros idiomas ni variantes dialectales.
- Sin datos de sesgos: no se publica informacion sobre sesgos de genero, acento o registro en la voz.
- Riesgo de alucinacion acustica: como todo TTS, puede producir artefactos o pronunciaciones erroneas en palabras fuera del dominio de entrenamiento (nombres propios, siglas, neologismos).
- Licencia MIT declarada por el upstream, pero conviene verificar la cadena de licencias de Piper y MLS antes de uso comercial a gran escala.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en produccion ni de mantenimiento activo.
- Sin informacion sobre parametros, datos de entrenamiento ni evaluaciones objetivas (MOS, WER), lo que dificulta una evaluacion rigurosa previa a produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-mls_10246-low-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/mls_10246/low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo

# Phoonnx/vits-de_de-glados-high-espeak

## Resumen

vits-de_de-glados-high-espeak es un modelo de sintesis de voz (text-to-speech) en aleman, empaquetado por Phoonnx para su libreria ONNX de TTS. Se trata de un modelo VITS originalmente entrenado por systemofapwne dentro del proyecto piper-de-glados, en su variante de calidad "high" para la locale de-DE, y redistribuido en formato ONNX para su uso con la libreria phoonnx y su integracion en el ecosistema OVOS.

El modelo resuelve la conversion de texto a audio en aleman a partir de fonemas espeak (alfabeto IPA), por lo que requiere un front-end de fonemizacion basado en espeak-ng o espyak. Su relevancia radica en que ofrece una voz neuronal ligera (repo de 0,1 GB) en formato ONNX, ejecutable en Python y en navegador mediante phoonnx.js, con licencia MIT, lo que facilita su integracion en asistentes de voz y aplicaciones embebidas.

No se dispone de informacion sobre el numero de parametros, la longitud de contexto (no aplica en TTS) ni los datos de entrenamiento originales. La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz neuronal de extremo a extremo que combina un codificador de texto, un predictor de duracion y un decodificador generativo con un discriminador adversarial en entrenamiento. La variante corresponde a la version "high" del proyecto piper-de-glados para de-DE, entrenada por systemofapwne.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. La model card solo indica la procedencia (systemofapwne/piper-de-glados/de/de_DE/glados/high) y que la entrada de texto se realiza mediante fonemas espeak en alfabeto IPA.

## Capacidades

- Sintesis de voz (text-to-speech) en aleman (de-DE) a partir de texto.
- Conversion de texto a fonemas espeak en alfabeto IPA mediante el front-end scriptconv (EspeakPhonemizer).
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-step; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en aleman: el modelo puede integrarse en OVOS configurando el plugin `ovos-tts-plugin-phoonnx` con la voz `piper_community/systemofapwne/de-DE_glados_high`, permitiendo respuestas habladas en de-DE en un asistente domestico.
- Lectura de textos en aplicaciones de accesibilidad: sintetizar contenido escrito en aleman a WAV para usuarios con discapacidad visual, gracias a su tamano reducido (0,1 GB) y su licencia MIT.
- Generacion de locuciones para contenido multimedia: producir narraciones en aleman para videos, podcasts o audiolibros a partir de texto, usando la API de phoonnx en Python.
- Sintesis en el navegador: emplear phoonnx.js para generar voz en de-DE del lado del cliente sin enviar texto a un servidor, util en aplicaciones web con requisitos de privacidad.
- Sistemas embebidos y dispositivos de bajo consumo: el formato ONNX y el tamano del repo permiten desplegar la voz en entornos con recursos limitados.
- Prototipado rapido de interfaces de voz: usar la voz en pipelines de desarrollo con `pip install --pre phoonnx` y espeak-ng para validar flujos de TTS en aleman antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada; por tamano del repo es plausible su ejecucion en CPU y en GPU de gama baja, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador.
- Dependencias: espeak-ng (o el extra `phoonnx[espeak]` con espyak) para la fonemizacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-de_de-glados-high-espeak | VITS | de-DE | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | segun modelo | ONNX | Hugging Face (Phoonnx) |
| Voces Piper de piper-de-glados (upstream) | VITS | de-DE | segun upstream | no disponible | Hugging Face (systemofapwne) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta aleman (de-DE); no es multilingue.
- Requiere espeak-ng instalado o el extra `phoonnx[espeak]`; con espyak algunos fonemas difieren de espeak-ng y la voz puede pronunciar mal algunas palabras, segun la propia model card.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica en el mismo sentido que en LLM) ni evaluaciones de calidad subjetiva de la voz.
- La licencia es MIT, pero la model card indica que "the upstream release states its terms"; conviene verificar las condiciones del release original de systemofapwne antes de un uso comercial.
- No hay datos publicados de benchmarks, latencia ni throughput, lo que dificulta estimar su idoneidad en produccion a gran escala.
- El modelo tiene un numero reducido de descargas (22) y likes (0), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados-high-espeak
- Upstream (systemofapwne/piper-de-glados, de/de_DE/glados/high): https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados/high
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

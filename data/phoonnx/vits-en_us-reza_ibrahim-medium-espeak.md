# Phoonnx/vits-en_us-reza_ibrahim-medium-espeak

## Resumen

`vits-en_us-reza_ibrahim-medium-espeak` es un modelo de síntesis de voz (text-to-speech) de tipo VITS, empaquetado por Phoonnx en formato ONNX para su uso con su librería de inferencia `phoonnx`. El modelo original procede del proyecto Rhasspy Piper, concretamente de la voz `en_US/reza_ibrahim/medium`, y ha sido reempaquetado para integrarse en el ecosistema OVOS (Open Voice OS) y en la librería Python de Phoonnx.

Se trata de una voz concreta de un catálogo más amplio de voces Piper, no de un modelo entrenado desde cero por Phoonnx. La relevancia de este empaquetado radica en que permite ejecutar la voz sobre un runtime ONNX específico con normalización de texto y fonemización gestionadas por `scriptconv`, lo que simplifica el despliegue en asistentes de voz y sistemas embebidos.

El modelo es de tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB), está orientado a inglés estadounidense y se distribuye bajo licencia MIT. No se dispone de información pública sobre parámetros, contexto ni datos de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-US |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Upstream | rhasspy/piper-voices (en/en_US/reza_ibrahim/medium) |
| Autor original | Rhasspy |
| Empaquetador | Phoonnx |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir de texto, sin necesidad de un vocoder separado en la inferencia.

El modelo procede del catálogo Piper de Rhasspy, en su variante `medium` para la voz `reza_ibrahim` en inglés estadounidense. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento o ajuste fino adicionales. La model card de Phoonnx no aporta detalles sobre el proceso de entrenamiento; únicamente documenta el empaquetado y el origen upstream. El sufijo `espeak` en el nombre sugiere el uso de eSpeak para la fonemización en el pipeline de conversión texto-fonema.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (`en-US`).
- Generación de audio mediante inferencia ONNX con la librería `phoonnx`.
- Integración con normalización de texto y fonemización a través de `scriptconv`.
- Ejecución en Python y en el entorno OVOS (Open Voice OS).
- No se documentan capacidades de clonación de voz, control de emoción, multilingüismo ni SSML avanzado.
- No es un modelo de lenguaje: no realiza generación de texto, razonamiento, código ni tool calling.

## Casos de uso

- Asistentes de voz locales: la voz puede integrarse en OVOS o en aplicaciones Python que usen `phoonnx` para leer respuestas generadas por un LLM o un sistema de diálogo, con inferencia ONNX en local.
- Lectura de notificaciones y alertas: adecuado para sistemas embebidos que necesiten anunciar eventos por voz con baja latencia y sin dependencia de servicios en la nube.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en entornos de habla inglesa.
- Domótica y altavoces inteligentes: reproducción de confirmaciones y estados del sistema en dispositivos con recursos limitados, dado el reducido tamaño del modelo (~0,1 GB).
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones con `phoonnx` y `scriptconv` antes de desplegar otras voces del catálogo.
- Generación de audio para prototipos y demos: permite producir locuciones en inglés estadounidense en aplicaciones de investigación sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) es previsible que quepa en GPU consumer con pocos cientos de MB, aunque no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: probable por el tamaño reducido, pero no documentada.
- Opciones de despliegue: `phoonnx` (Python y OVOS) como runtime principal; el formato ONNX permite otros runtimes ONNX, aunque no se documentan oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-reza_ibrahim-medium-espeak (este) | VITS | en-US | ONNX | MIT | Hugging Face (Phoonnx) |
| Otras voces Piper `en_US` (p. ej. lessac, amy) | VITS | en-US | ONNX | MIT (upstream) | rhasspy/piper-voices |
| Otras voces empaquetadas por Phoonnx | VITS | varios | ONNX | MIT | Colección VITS de Phoonnx |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- No se documentan métricas de calidad (MOS), sesgos acústicos ni comportamiento en dominios específicos.
- Al ser una voz sintética, puede presentar artefactos o prosodia limitada en textos largos o con puntuación compleja.
- La model card indica que el índice de voces de `phoonnx` no lista una voz para este modelo, lo que puede complicar su selección automática en el runtime.
- La licencia MIT se hereda del upstream (Rhasspy Piper); conviene verificar los términos del proyecto Piper para uso comercial y atribución.
- No hay información sobre cuantizaciones alternativas ni sobre rendimiento en hardware concreto.
- El sufijo `espeak` sugiere dependencia de eSpeak para fonemización; posibles variaciones en la pronunciación según la versión de `scriptconv`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-reza_ibrahim-medium-espeak
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/reza_ibrahim/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

# Phoonnx/vits-ru_ru-denis-medium-espeak

## Resumen

`vits-ru_ru-denis-medium-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su biblioteca de inferencia ONNX homonima. El modelo original procede del repositorio `rhasspy/piper-voices`, en la ruta `ru/ru_RU/denis/medium`, desarrollado por Rhasspy dentro del ecosistema Piper. Se trata, por tanto, de una voz concreta en ruso de Rusia (identificador `ru-RU`), no de un modelo de lenguaje generativo.

El modelo resuelve la conversion de texto a audio en ruso con una calidad calificada como "medium" por el autor original, emitiendo una voz identificada como "denis". Su relevancia actual reside en que esta empaquetado para `phoonnx`, una biblioteca Python de TTS sobre ONNX que lo integra en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, lo que facilita su despliegue en entornos de asistente domestico y sistemas embebidos.

El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT. La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados mediante `espeak-ng` (o su port `espyak`), lo que condiciona tanto la integracion como la calidad de pronunciacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (`ru`, variante `ru-RU`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto condicionado por fonemas, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta, con alineacion monotona aprendida mediante busqueda. Permite generar audio de forma directa desde fonemas sin necesidad de un vocoder externo separado. En este caso, el modelo se distribuye como grafo ONNX para inferencia, no como pesos de entrenamiento.

No se dispone de informacion sobre el numero de tokens de audio utilizados en el entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional. La model card unicamente indica la procedencia (Piper, voz `denis/medium`) y que el autor del modelo original es Rhasspy. La innovacion tecnica destacable en el empaquetado es la integracion del front-end de texto mediante `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA con `EspeakPhonemizer`.

## Capacidades

- Sintesis de voz en ruso (`ru-RU`) a partir de texto, generando audio WAV mediante `voice.synthesize_wav`.
- Conversion de texto a fonemas IPA mediante `espeak-ng` (o el port `espyak` incluido en el extra `phoonnx[espeak]`).
- Normalizacion y conversion de texto de entrada a traves de la biblioteca `scriptconv`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable en `mycroft.conf`.
- Ejecucion en navegador mediante `phoonnx.js`, con demo publica en `tigregotico.pt/demo`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo de sintesis.

## Casos de uso

- Asistente de voz domestico con OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper/ru_RU-denis-medium` en `mycroft.conf`, permitiendo respuestas habladas en ruso dentro de un asistente local.
- Lectura de notificaciones y alertas en ruso: integrado en un pipeline de automatizacion que convierte cadenas de texto en WAV mediante `synthesize_wav` y las reproduce en un dispositivo.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido textual en ruso para lectores de pantalla o aplicaciones de lectura por voz, con un modelo ligero (~0,1 GB) que puede ejecutarse en local.
- Generacion de locuciones para contenido multimedia en ruso: produccion de narraciones o avisos pregrabados en aplicaciones, videos o sistemas de megafonia, aprovechando la inferencia ONNX sin dependencia de servicios en la nube.
- Prototipado de interfaces de voz en navegador: uso de `phoonnx.js` para sintetizar voz rusa en el cliente sin backend, util para demos y pruebas de UX.
- Sistemas embebidos y de bajo consumo: al ser un modelo ONNX de ~0,1 GB, es adecuado para dispositivos con recursos limitados donde no cabe un modelo TTS de mayor tamano.
- Internacionalizacion de asistentes: incorporacion del ruso como idioma adicional en un asistente que ya use otras voces Piper empaquetadas en la coleccion VITS de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio (~0,1 GB) sugiere un consumo de memoria reducido, pero no se confirma una cifra.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del modelo es plausible su ejecucion en CPU, pero no se aporta dato explicito.
- Opciones de despliegue: `phoonnx` (Python) con `TTSModelManager`, plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` en navegador. Requiere `espeak-ng` instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-ru_ru-denis-medium-espeak` | VITS | ru-RU | MIT | ONNX | Empaquetado para phoonnx |
| `rhasspy/piper-voices` (voz `ru_RU/denis/medium`) | VITS | ru-RU | MIT | Piper | Modelo upstream del que deriva |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | MIT (segun upstream) | ONNX | Mismo empaquetado, distinto idioma/voz |

No se dispone de datos de rendimiento comparativo (MOS, RTF, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de sintesis de voz en ruso; no procesa texto en otros idiomas ni realiza tareas de lenguaje.
- La calidad de pronunciacion depende de `espeak-ng`; con el port `espyak` algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la model card.
- Requiere instalar `espeak-ng` en el sistema o el extra `phoonnx[espeak]`; sin ello, el front-end de texto no funciona correctamente.
- No se dispone de informacion sobre sesgos acusticos, calidad subjetiva (MOS) ni robustez ante texto con ruido, abreviaturas o dominios especializados.
- El modelo original esta etiquetado como "medium" por Rhasspy, lo que implica una calidad inferior a voces de mayor tamano del mismo ecosistema.
- Licencia MIT segun la model card del upstream; se recomienda verificar los terminos exactos en `rhasspy/piper-voices` antes de un uso comercial a gran escala.
- No se han publicado benchmarks ni metricas objetivas de rendimiento en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-denis-medium-espeak
- Upstream (Piper, voz denis/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/denis/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

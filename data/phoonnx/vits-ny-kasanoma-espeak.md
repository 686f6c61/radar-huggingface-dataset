# Phoonnx/vits-ny-kasanoma-espeak

## Resumen

vits-ny-kasanoma-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por michsethowusu dentro del proyecto kasanoma y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta especializado en el idioma chichewa (codigo ISO `ny`), una lengua bantú hablada principalmente en Malawi, Zambia y Mozambique, y cubre un nicho con muy poca representacion en el ecosistema TTS open source.

El modelo no genera audio a partir de texto plano directamente: requiere que la entrada se convierta previamente a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`). Esta dependencia del front-end fonemico es relevante porque condiciona tanto la integracion como la calidad de pronunciacion. El repositorio ocupa aproximadamente 0,1 GB, lo que lo situa en el rango de modelos ligeros aptos para inferencia en CPU.

Su relevancia actual es doble: por un lado, amplia la cobertura linguistica del ecosistema phoonnx/OVOS hacia una lengua africana de bajos recursos; por otro, sirve como ejemplo de empaquetado reproducible de voces VITS de la comunidad Piper para entornos de asistentes de voz. La licencia declarada en Hugging Face es MIT, aunque la model card advierte que el proyecto de origen no especifica licencia, lo que introduce una ambiguedad que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | chichewa (`ny`) |
| Licencia | MIT (declarada en Hugging Face); la model card advierte que el proyecto de origen no especifica licencia y que los voces kasanoma se marcan como `license: other` |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador), plugin OVOS |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo entrenado con perdidas GAN, junto con alineamiento monotonico aprendido (MAS) para evitar la necesidad de alineamientos fonema-audio explicitos. El resultado es un modelo que genera waveforms directamente desde fonemas sin vocoder externo, lo que explica su tamano reducido y su idoneidad para despliegue en entornos con recursos limitados.

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable en TTS) ni detalles del proceso de entrenamiento original. La model card unicamente indica la procedencia: el release `chichewa` del repositorio `github.com/michsethowusu/kasanoma`, del que Phoonnx ha empaquetado los pesos en ONNX. El front-end de texto utiliza `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, con normalizacion y conversion de texto delegadas a la libreria scriptconv.

## Capacidades

- Sintesis de voz (text-to-speech) en chichewa a partir de texto escrito.
- Conversion texto-a-fonemas via espeak-ng o espyak, con entrada en alfabeto IPA.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modos de razonamiento: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al idioma `ny`; no se declaran otros idiomas.

## Casos de uso

- Asistentes de voz en chichewa: integracion como modulo TTS en OVOS para responder a usuarios en Malawi, Zambia o Mozambique, aprovechando el plugin `ovos-tts-plugin-phoonnx` y la configuracion via `mycroft.conf`.
- Accesibilidad para hablantes de chichewa: lectura en voz alta de documentos, articulos o notificaciones para personas con discapacidad visual, dado el reducido tamano del modelo (~0,1 GB) que permite ejecucion en hardware modesto.
- Locucion automatizada de contenidos educativos: generacion de audio para materiales escolares o cursos en linea en chichewa, donde la oferta de voces comerciales es practicamente inexistente.
- Sistemas de megafonia o avisos publicos: sintesis de anuncios en tiempo real en entornos con conectividad limitada, al poder ejecutarse en CPU sin GPU dedicada.
- Investigacion en TTS de bajos recursos: uso como baseline o punto de partida para experimentos de adaptacion, fine-tuning o evaluacion de voces VITS en lenguas bantúes.
- Aplicaciones web offline: despliegue en el navegador con phoonnx.js para interfaces de lectura o aprendizaje de idiomas sin depender de servicios en la nube.
- Preservacion linguistica: generacion de corpus de audio sintetico en chichewa para documentacion o ensenanza del idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (~0,1 GB en ONNX) el modelo es apto para ejecucion en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer (e incluso en CPU y en navegador via phoonnx.js).
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS (`ovos-tts-plugin-phoonnx`). Requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-ny-kasanoma-espeak | chichewa (`ny`) | VITS | ONNX | MIT declarada / ambigua en origen | Hugging Face (Phoonnx) |
| tw-kasanoma | twi (`tw`) | VITS (Piper) | Piper | `other` segun la model card | GitHub releases de michsethowusu |
| vmw-kasanoma | makhuwa (`vmw`) | VITS (Piper) | Piper | `other` segun la model card | GitHub releases de michsethowusu |
| Otras voces de la coleccion VITS de Phoonnx | varios | VITS | ONNX | variable | Hugging Face (coleccion Phoonnx/vits) |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ambiguedad de licencia: la ficha de Hugging Face declara MIT, pero la model card advierte que el proyecto de origen (`michsethowusu/kasanoma`) no especifica licencia y que las voces kasanoma se marcan como `license: other`. Es imprescindible leer el README de la carpeta de origen antes de un uso comercial.
- Dependencia critica de espeak-ng: sin espeak-ng instalado, la calidad de pronunciacion puede degradarse; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Cobertura linguistica unica: solo chichewa (`ny`); no es utilizable para castellano ni otras lenguas sin reentrenamiento.
- Riesgo de alucinacion acustica: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en palabras fuera de distribucion u ortografia no normalizada.
- Sin datos de entrenamiento publicados: no se puede evaluar la representatividad del corpus ni el sesgo de voces, genero o dialectos.
- Sin benchmarks publicados: no hay metricas objetivas (MOS, CMOS, WER) que permitan comparar su calidad con alternativas.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: ecosistema de soporte muy limitado y poca validacion por parte de la comunidad.
- No apto para tareas de NLP general (razonamiento, codigo, vision): es exclusivamente un sintetizador de voz.

## Enlaces

- [Hugging Face: Phoonnx/vits-ny-kasanoma-espeak](https://huggingface.co/Phoonnx/vits-ny-kasanoma-espeak)
- [Origen upstream: michsethowusu/kasanoma releases (chichewa)](https://github.com/michsethowusu/kasanoma/releases/tag/chichewa)
- [Repositorio kasanoma](https://github.com/michsethowusu/kasanoma)
- [phoonnx (libreria de inferencia)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (normalizacion y fonemizadores)](https://github.com/TigreGotico/scriptconv)
- [phoonnx.js (inferencia en navegador)](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
- [Coleccion VITS de Phoonnx en Hugging Face](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)

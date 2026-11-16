# Phoonnx/vits-en_us-inflect-micro_v2-espeak

## Resumen

`Phoonnx/vits-en_us-inflect-micro_v2-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario owensong y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo toma como entrada fonemas IPA generados por espeak-ng y produce audio en ingles estadounidense (`en-us`). Su proposito es ofrecer una voz TTS ligera y ejecutable mediante ONNX, integrable tanto en Python como en el ecosistema de asistentes OVOS.

El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado con el identificador de voz `inflect/micro-en` dentro de la coleccion de voces VITS de Phoonnx. El nombre "micro" sugiere un diseno compacto orientado a despliegues con recursos limitados, aunque no se publican el numero de parametros ni el tamano exacto del checkpoint en la informacion disponible.

La relevancia actual de este modelo radica en su caracter de componente reutilizable dentro de un stack TTS completo: normalizacion de texto mediante `scriptconv`, fonemizacion con espeak-ng y sintesis con VITS sobre ONNX Runtime. No es un modelo de lenguaje general, sino un componente especializado de sintesis vocal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | ingles estadounidense (`en-us`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Repositorio | 0.0 GB (tamano reportado) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis neuronal end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial durante el entrenamiento. VITS genera formas de onda directamente a partir de secuencias de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia. En este caso concreto, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que traslada la responsabilidad de la normalizacion linguistica al front-end (`scriptconv` + `EspeakPhonemizer`).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre el uso de tecnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). El modelo deriva del checkpoint `owensong/inflect-micro-v2-onnx`, y la version empaquetada anade la integracion con la libreria phoonnx y la convencion de nombres de voz `inflect/micro-en`. No se documentan innovaciones tecnicas adicionales mas alla del empaquetado ONNX y la integracion con el ecosistema OVOS.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, previa conversion a fonemas IPA mediante espeak-ng.
- Generacion directa de formas de onda (salida WAV) sin vocoder externo.
- Integracion con la libreria phoonnx mediante `TTSModelManager` y el objeto de voz `inflect/micro-en`.
- Soporte como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable via `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js, con entrada espeak o Unicode.
- No soporta tool calling, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS nativo, permitiendo sintesis en el dispositivo sin depender de servicios en la nube, adecuado para entornos de privacidad estricta.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX ligero, puede generar avisos hablados en tiempo real con baja latencia en CPU.
- Sintesis en navegador para accesibilidad web: mediante phoonnx.js, se puede ofrecer lectura de contenido a usuarios con discapacidad visual sin enviar texto a servidores externos.
- Generacion de audio para prototipos de interfaces conversacionales: util para validar flujos de dialogo antes de invertir en voces comerciales de mayor calidad.
- Sistemas embebidos y dispositivos de bajo consumo: el formato ONNX y el caracter "micro" del modelo permiten despliegues en hardware limitado donde otros TTS no caben.
- Pruebas automatizadas de pipelines de voz: sirve como voz de referencia determinista para tests de integracion de sistemas TTS en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo "micro" en formato ONNX, es previsible que opere en CPU sin GPU dedicada, aunque no se confirman cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, pero el formato ONNX y el perfil ligero sugieren viabilidad en CPU y GPUs modestas.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| Phoonnx/vits-en_us-inflect-micro_v2-espeak | VITS | en-us | ONNX | Apache 2.0 | fonemas espeak IPA |
| owensong/inflect-micro-v2-onnx (upstream) | VITS | en-us | ONNX | Apache 2.0 | fonemas espeak IPA |
| Otras voces de la coleccion VITS de Phoonnx | VITS | variable | ONNX | variable | fonemas espeak / Unicode |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estas alternativas en la informacion proporcionada. La comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo solo soporta ingles estadounidense; no es multilingue.
- La calidad de sintesis depende criticamente de la fonemizacion: si se usa espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, tal como advierte la model card.
- No se publican metricas de calidad (MOS), sesgos acusticos ni evaluaciones subjetivas, lo que impide garantizar un nivel de naturalidad concreto.
- El checkpoint upstream declara Apache 2.0, pero conviene verificar la cadena de licencias en el repositorio original antes de uso comercial.
- Al ser un modelo TTS y no un LLM, no genera texto ni razona; cualquier expectativa de comprension semantica es inadecuada.
- El tamano del repositorio reportado (0.0 GB) sugiere que los pesos podrian no estar completamente subidos o que la medicion no es fiable; verificar la integridad de los artefactos antes de desplegar.
- Sin datos de benchmarks ni de latencia, no es posible estimar su idoneidad para aplicaciones de tiempo real estricto sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-inflect-micro_v2-espeak
- Modelo upstream: https://huggingface.co/owensong/inflect-micro-v2-onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

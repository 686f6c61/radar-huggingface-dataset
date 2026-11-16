# Phoonnx/vits-it_it-leonardo-espeak

## Resumen

`vits-it_it-leonardo-espeak` es un modelo de sintesis de voz (text-to-speech) en italiano basado en la arquitectura VITS, desarrollado originalmente por kirys79 dentro del proyecto `piper_italiano` y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en italiano (`it-IT`) en audio, tomando como entrada fonemas en alfabeto IPA generados mediante espeak-ng. Su relevancia radica en que ofrece una voz italiana lista para desplegar en entornos Python y OVOS sin necesidad de infraestructura de GPU, al estar exportado a ONNX.

El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a inferencia en CPU y dispositivos de recursos limitados. No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto (no aplica en TTS) ni los datos exactos de entrenamiento. La licencia es CC-BY-4.0, lo que permite uso comercial con atribucion.

El modelo forma parte de la coleccion de voces VITS empaquetadas por Phoonnx y se integra con el ecosistema de asistentes de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`. Es una opcion practica para sintesis de voz italiana en aplicaciones de asistencia por voz, lectores de pantalla y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | italiano (`it-IT`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. La entrada de texto se procesa mediante fonemizacion con espeak-ng, produciendo fonemas en alfabeto IPA que alimentan el encoder del modelo.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El modelo original fue entrenado por kirys79 dentro del proyecto `piper_italiano`, y Phoonnx lo ha empaquetado para su libreria ONNX sin modificar la arquitectura subyacente. La innovacion practica del empaquetado es la exportacion a ONNX y la integracion con el pipeline de fonemizacion de `scriptconv`.

## Capacidades

- Sintesis de voz (text-to-speech) en italiano a partir de texto plano.
- Conversion de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Generacion de audio en formato WAV mediante la API `voice.synthesize_wav`.
- Integracion con el ecosistema OVOS a traves de `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del italiano.

## Casos de uso

- Asistencia por voz en italiano: el modelo puede sintetizar respuestas de un asistente conversacional integrado en OVOS, seleccionando la voz `piper_community/kirys79/it-IT_Leonardo` en `mycroft.conf`, lo que permite desplegar un asistente de voz local sin dependencia de servicios en la nube.
- Lectura de pantalla y accesibilidad: aplicaciones que necesiten narrar texto en italiano para usuarios con discapacidad visual pueden invocar `synthesize_wav` sobre fragmentos de texto y reproducir el WAV resultante, aprovechando el tamano reducido del modelo (0,1 GB) para ejecucion en CPU.
- Sistemas embebidos y dispositivos de bajo consumo: al estar exportado a ONNX y no requerir GPU, puede desplegarse en Raspberry Pi u otros dispositivos con recursos limitados para generar avisos hablados en italiano.
- Generacion de audiolibros y contenido narrado: el modelo permite convertir textos largos en audio por fragmentos, con la salvedad de que la calidad depende de la fonemizacion correcta mediante espeak-ng.
- Prototipado de interfaces de voz: desarrolladores que necesiten una voz italiana rapida para pruebas de UX pueden usar la libreria `phoonnx` con `pip install --pre phoonnx` y cargar la voz sin entrenamiento adicional.
- Integracion en navegador: mediante `phoonnx.js` y la demo en `tigregotico.pt/demo`, se puede ofrecer sintesis de voz italiana en aplicaciones web sin backend de inferencia.
- Sistemas de anuncios automatizados: generacion de mensajes hablados en italiano para transporte publico, comercios o domotica, donde la latencia de un modelo VITS en CPU es aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, se espera ejecucion en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; no se requiere GPU para el despliegue tipico con `phoonnx`.
- Compatibilidad con GPU de consumo: no disponible; el modelo esta pensado para inferencia en CPU.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Parametros | Licencia | Formato |
|---|---|---|---|---|---|
| `vits-it_it-leonardo-espeak` (este modelo) | VITS | it-IT | no disponible | CC-BY-4.0 | ONNX |
| `kirys79/piper_italiano/Leonardo` (upstream) | VITS | it-IT | no disponible | CC-BY-4.0 | no disponible |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | no disponible | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta italiano (`it-IT`); no genera voz en otros idiomas.
- La calidad de la sintesis depende de la fonemizacion con espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Es necesario instalar espeak-ng en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]`; sin ello, el modelo no funciona correctamente.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica en el mismo sentido que en modelos de lenguaje) ni evaluaciones de calidad subjetiva (MOS).
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es necesario citar al autor original (kirys79) y al empaquetador (Phoonnx).
- El modelo es de fecha futura en los metadatos (creado 2026-11-14); verificar la vigencia del repositorio antes de usarlo en produccion.
- No se dispone de informacion sobre el numero de parametros ni sobre el proceso de entrenamiento, lo que limita la evaluacion tecnica detallada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-leonardo-espeak
- Upstream (kirys79/piper_italiano/Leonardo): https://huggingface.co/kirys79/piper_italiano/tree/main/Leonardo
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

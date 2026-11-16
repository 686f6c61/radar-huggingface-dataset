# Phoonnx/vits-de_de-thorsten-high-espeak

## Resumen

`vits-de_de-thorsten-high-espeak` es un modelo de síntesis de voz (text-to-speech) en alemán empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede del proyecto Rhasspy Piper, concretamente de la voz `de_DE/thorsten/high`, y ha sido reempaquetado para su uso con la librería `phoonnx`, que lo ejecuta tanto en Python como en el ecosistema OVOS (OpenVoiceOS).

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que genera formas de onda directamente a partir de fonemas. La entrada de texto se procesa mediante espeak-ng, que convierte el texto en fonemas IPA antes de pasarlos al modelo. El modelo está orientado exclusivamente al alemán (`de-DE`) y se distribuye en formato ONNX.

El interés principal de esta ficha es práctico: se trata de una voz TTS ligera (0,1 GB de repositorio) con licencia MIT, pensada para integrarse en asistentes de voz locales (OVOS), aplicaciones de accesibilidad o pipelines de generación de audio sin depender de servicios en la nube. No es un modelo de lenguaje ni un sistema multimodal: es un componente especializado de síntesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS genera directamente la forma de onda, evitando la necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia frente a pipelines de dos etapas.

El modelo original fue entrenado por Rhasspy como parte del proyecto Piper, orientado a voces TTS ligeras y ejecutables en dispositivos de recursos limitados. La voz `thorsten` corresponde a un hablante alemán con calidad "high" dentro del catálogo de Piper. No se dispone de información sobre el número de horas de audio, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El empaquetado de Phoonnx añade la integración con `scriptconv` para normalización de texto y fonemización mediante espeak-ng.

## Capacidades

- Sintesis de voz en aleman (`de-DE`) a partir de texto plano.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Fonemizacion basada en espeak-ng (alfabeto IPA), con soporte opcional del port espyak.
- Integracion nativa con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` (demo disponible en tigregotico.pt/demo).
- Normalizacion y conversion de texto mediante `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: integracion en OVOS mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper/de_DE-thorsten-high` en `mycroft.conf` para respuestas habladas en aleman sin conexion a servicios externos.
- Accesibilidad: lectura de textos o documentos en aleman para usuarios con discapacidad visual, ejecutando el modelo en local con ONNX y sin dependencias de red.
- Sistemas de anuncios automatizados: generacion de mensajes de voz en aleman para transporte publico, aeropuertos o comercios, gracias al tamano reducido (0,1 GB) que permite desplegarlo en dispositivos embebidos.
- Audiolibros y contenido educativo: sintesis de narraciones en aleman a partir de texto, con la ventaja de la licencia MIT para uso comercial.
- Interfaces conversacionales en kioscos o terminales: respuestas habladas en aleman en puntos de atencion, ejecutando el modelo en el propio dispositivo.
- Testing y desarrollo de pipelines TTS: uso como voz de referencia ligera para validar integraciones con `phoonnx` y `scriptconv` antes de desplegar voces mas pesadas.
- Generacion de audio para prototipos de videojuegos o aplicaciones interactivas en aleman, con despliegue en navegador mediante `phoonnx.js`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe en CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS de 0,1 GB, la inferencia en CPU es viable y no requiere GPU dedicada.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer puede ejecutarlo, aunque no es necesario.
- Opciones de despliegue: `phoonnx` (Python), plugin OVOS `ovos-tts-plugin-phoonnx`, `phoonnx.js` (navegador). Requiere `espeak-ng` instalado en el sistema o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-thorsten-high-espeak (este modelo) | VITS | de-DE | MIT | ONNX | 0,1 GB | Empaquetado para phoonnx/OVOS |
| Otras voces Piper de Rhasspy | VITS | multi-idioma | MIT (segun upstream) | ONNX | variable | Catalogo amplio de voces |
| Coqui TTS (XTTS) | VITS/otros | multi-idioma | MPL/otros | varios | mayor | Clonacion de voz, mas pesado |
| Piper voces estandar | VITS | multi-idioma | MIT | ONNX | variable | Mismo origen upstream |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, no razona, no soporta tool calling ni agentes.
- Limitado al idioma aleman (`de-DE`); no soporta otros idiomas.
- La calidad de pronunciacion depende de espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Requiere `espeak-ng` instalado en el sistema o el extra `phoonnx[espeak]`; sin ello, el modelo no funciona correctamente.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero la sintesis puede producir artefactos o pronunciaciones incorrectas en textos con abreviaturas, numeros o palabras extranjeras no normalizadas.
- No se documentan sesgos especificos del hablante (thorsten) ni caracteristicas del dataset de entrenamiento.
- Licencia MIT declarada por el upstream (Rhasspy Piper), lo que permite uso comercial, pero se recomienda verificar la licencia de la voz original en el repositorio de Piper.
- Sin descargas ni likes en Hugging Face en el momento de la consulta (0 descargas, 0 likes), lo que indica poca validacion comunitaria.
- No se dispone de informacion sobre cuantizaciones alternativas ni sobre rendimiento medido.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-thorsten-high-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/thorsten/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

# Phoonnx/vits-lb_lu-marylux

## Resumen

vits-lb_lu-marylux es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por mbarnig y empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo esta especializado en el idioma luxemburgues (codigo `lb`, variante `lb-LU`) y constituye una voz concreta dentro del ecosistema de voces Piper/Rhasspy adaptadas para su ejecucion en Python, OVOS y navegador.

El modelo resuelve el problema de la sintesis de voz en un idioma de bajos recursos como el luxemburgues, ofreciendo una voz preentrenada que puede integrarse en asistentes de voz, sistemas de lectura o aplicaciones de accesibilidad. Su empaquetado como ONNX facilita el despliegue en entornos sin GPU dedicada y su integracion en pipelines de TTS existentes.

Es relevante por su caracter practico: el repositorio ocupa apenas 0,1 GB, se distribuye con licencia CC-BY-4.0 y se integra con el stack phoonnx/scriptconv, lo que permite a desarrolladores incorporar sintesis en luxemburgues sin entrenar un modelo desde cero. No se dispone de informacion sobre el numero de parametros ni sobre el contexto, ya que se trata de un modelo acustico y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | luxemburgues (`lb`, variante `lb-LU`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que combina un encoder de texto, un prior variational, un decoder acustico y un discriminador adversarial entrenado de forma conjunta. VITS genera directamente la forma de onda o el espectrograma a partir de fonemas, evitando pipelines de dos etapas y logrando una sintesis mas natural que los sistemas concatenativos tradicionales.

El modelo es una adaptacion de la voz `marylux` publicada por mbarnig dentro del repositorio `lb_rhasspy_piper_tts`, en la ruta `lb/lb_LU/marylux/medium`. La entrada de texto se procesa mediante fonemas espeak en alfabeto IPA, generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`). No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no los detalla.

## Capacidades

- Sintesis de voz a partir de texto en luxemburgues (`lb-LU`).
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Fonemizacion de entrada basada en espeak-ng con alfabeto IPA.
- Integracion como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- Normalizacion y conversion de texto a traves de la libreria scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en luxemburgues: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de respuesta hablada a un asistente domestico en este idioma, aprovechando la configuracion via `mycroft.conf`.
- Lectura de contenido web o documentos: dado su bajo peso (0,1 GB) y formato ONNX, puede desplegarse en servidores modestos para convertir articulos o noticias en audio en luxemburgues.
- Accesibilidad para personas con discapacidad visual: sintesis de textos en luxemburgues en aplicaciones de lectura de pantalla, con inferencia local sin dependencia de servicios en la nube.
- Sistemas de megafonia o anuncios automatizados: generacion de avisos hablados en estaciones, aeropuertos o comercios donde se requiera luxemburgues, con latencia baja al ejecutarse en CPU.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten validar un flujo de voz en luxemburgues pueden usar esta voz como componente TTS sin entrenar un modelo propio.
- Aplicaciones educativas de aprendizaje de idiomas: generacion de pronunciaciones de referencia en luxemburgues para materiales didacticos o ejercicios de escucha.
- Integracion en el navegador: mediante phoonnx.js, la voz puede ejecutarse del lado del cliente para demos o aplicaciones web interactivas sin backend de sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0,1 GB, es previsible que la inferencia se realice en CPU sin necesidad de GPU, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; por tamano, cabe holgadamente en cualquier GPU de consumo si se opta por aceleracion, pero no se documenta.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-lb_lu-marylux (este) | VITS | lb-LU | CC-BY-4.0 | ONNX | Hugging Face, phoonnx |
| mbarnig/lb_rhasspy_piper_tts (upstream) | VITS | lb-LU | CC-BY-4.0 | Piper | Hugging Face |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | variable | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en luxemburgues (`lb-LU`); no soporta otros idiomas.
- La fonemizacion depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y ciertas palabras pueden pronunciarse incorrectamente, segun advierte la model card.
- No se dispone de informacion sobre sesgos, calidad de la voz en dominios especificos ni tasas de alucinacion o errores de pronunciacion.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya la autoria; es necesario conservar la atribucion a mbarnig y a Phoonnx.
- No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling ni agentes.
- No se documentan limitaciones de contexto porque no aplica; sin embargo, la calidad puede degradarse con textos muy largos o con caracteres no soportados por espeak.
- El repositorio tiene solo 23 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lb_lu-marylux
- Upstream (mbarnig): https://huggingface.co/mbarnig/lb_rhasspy_piper_tts/tree/main/lb/lb_LU/marylux/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

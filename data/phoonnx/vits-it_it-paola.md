# Phoonnx/vits-it_it-paola

## Resumen

vits-it_it-paola es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de paolapersico1, que lo entreno como parte del proyecto Piper-TTS-Italian, y Phoonnx lo ha adaptado al formato ONNX para su ejecucion en Python y en el ecosistema OVOS. Su unica finalidad es convertir texto en italiano (it-IT) en audio inteligible y natural.

El modelo resuelve un problema acotado: disponer de una voz italiana ligera, ejecutable localmente y con licencia permisiva (CC0-1.0) para integrarla en asistentes de voz, lectores de pantalla o aplicaciones de sintesis sin depender de servicios en la nube. Al estar empaquetado en ONNX y pesar solo 0,1 GB en el repositorio, esta pensado para despliegues con recursos limitados, incluidos dispositivos de borde.

La relevancia actual del modelo es practica mas que investigadora: ofrece una voz Piper comunitaria en un formato estandarizado (ONNX) y con una cadena de procesamiento de texto documentada (espeak-ng + scriptconv), lo que facilita su integracion en pipelines de TTS existentes. No es un modelo de proposito general ni compite en la liga de los grandes modelos de lenguaje: es un componente especializado de sintesis vocal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado, lo que simplifica el despliegue. La entrada de texto se procesa mediante fonemas espeak en alfabeto IPA, generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`).

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de las propias de VITS. El modelo upstream fue entrenado por paolapersico1 dentro de Piper-TTS-Italian, un proyecto comunitario de voces Piper para italiano. Phoonnx se limita a empaquetar los pesos en ONNX y a documentar la cadena de procesamiento de texto con scriptconv.

## Capacidades

- Sintesis de voz (text-to-speech) en italiano (it-IT) a partir de texto escrito.
- Conversion de texto a fonemas espeak en alfabeto IPA mediante scriptconv.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav`.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en Python (phoonnx) y en navegador (phoonnx.js con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision.
- No dispone de modo thinking ni capacidades de audio de entrada (solo salida de voz).
- Capacidad multilingue limitada: unicamente italiano.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente domestico responda en italiano sin enviar texto a servicios externos, gracias a su ejecucion ONNX en local.
- Lectores de pantalla y accesibilidad: aplicaciones que convierten articulos o interfaces en audio italiano pueden usar el modelo para narrar contenido de forma continua, con un peso de repo de 0,1 GB que facilita su distribucion junto a la aplicacion.
- Sistemas de anuncios y megafonia automatizada: comercios, estaciones o aeropuertos que necesitan generar avisos pregrabados en italiano pueden sintetizar frases bajo demanda en lugar de almacenar clips de audio.
- Videojuegos y experiencias interactivas: personajes no jugadores (NPC) con dialogos dinamicos en italiano pueden generar voz en tiempo de ejecucion en dispositivos de borde, sin conexion a red.
- Prototipado rapido de productos de voz: equipos que desarrollan interfaces conversacionales en italiano pueden validar flujos de TTS con una voz CC0-1.0 sin coste de licencia ni dependencia de API de terceros.
- Generacion de audiolibros o podcasts automatizados: el modelo permite convertir textos largos en audio WAV por fragmentos, integrándose en un pipeline de scriptconv + phoonnx para normalizar y fonemizar el texto antes de la sintesis.
- Demos web en navegador: mediante phoonnx.js se puede ofrecer una demostracion de sintesis italiana directamente en el navegador, sin backend, usando la demo publica de tigregotico.pt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que la inferencia ONNX es muy ligera y cabe en CPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de 0,1 GB, no requiere GPU dedicada.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, e incluso en CPU y dispositivos de borde.
- Opciones de despliegue: phoonnx (Python y OVOS), phoonnx.js (navegador con espeak o unicode), y por extension cualquier runtime ONNX compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Dependencia externa: espeak-ng debe estar instalado en el sistema (`apt install espeak-ng`) o bien usarse el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano repo |
|---|---|---|---|---|---|
| vits-it_it-paola (este) | VITS | it-IT | CC0-1.0 | ONNX | 0,1 GB |
| Otras voces Piper-TTS-Italian (paolapersico1) | VITS | it-IT | CC0-1.0 (segun upstream) | ONNX/Piper | no disponible |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | variable | ONNX | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estas alternativas en la informacion proporcionada. La comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser una voz unica (paola) entrenada con datos comunitarios, puede reflejar sesgos de prosodia o pronunciacion del corpus original.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir pronunciaciones incorrectas de palabras extranas, siglas o nombres propios no presentes en el corpus de entrenamiento.
- Limitacion de idioma: solo italiano (it-IT); el texto en otros idiomas producira fonemas incorrectos o ininteligibles.
- Dependencia de espeak-ng: sin espeak-ng instalado, el modelo no funciona correctamente; ademas, algunos fonemas de espyak difieren de espeak-ng y pueden provocar errores de pronunciacion.
- Licencia: CC0-1.0 permite uso comercial y modificacion sin restricciones, pero se recomienda verificar la declaracion de licencia del repositorio upstream (paolapersico1/Piper-TTS-Italian) antes de un despliegue en produccion.
- Caveat de produccion: el modelo esta empaquetado por un tercero (Phoonnx) a partir de un upstream comunitario; no hay garantias de mantenimiento, versionado semantico ni soporte oficial.
- Sin datos de calidad subjetiva (MOS) publicados, por lo que la naturalidad de la voz no esta cuantificada.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-paola
- Upstream: https://huggingface.co/paolapersico1/Piper-TTS-Italian/tree/main/paola/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

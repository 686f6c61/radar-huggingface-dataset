# Phoonnx/vits-en_ie-jenny-espeak

## Resumen

vits-en_ie-jenny-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el usuario Phoonnx y derivado del trabajo original de agentvibe en el repositorio agentvibes/piper-custom-voices. El modelo se distribuye empaquetado para phoonnx, la libreria de TTS sobre ONNX del proyecto TigreGotico, y esta pensado para su uso dentro del ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx.

Se trata de una voz concreta, identificada como en-IE_jenny, orientada al ingles de Irlanda (en-IE). No es un modelo fundacional de proposito general, sino un checkpoint de voz especifico que convierte fonemas espeak (en alfabeto IPA) en audio. Su relevancia practica esta en que ofrece una voz regional irlandesa dentro de una pila totalmente open source y con licencia Apache 2.0, lo que facilita su integracion en asistentes de voz y sistemas de sintesis autoalojados.

El repositorio es pequeno (0,1 GB), coherente con un modelo VITS de un solo hablante en formato ONNX. La entrada de texto no es texto plano directo, sino fonemas generados por espeak-ng, lo que condiciona tanto el pipeline de inferencia como la calidad de pronunciacion segun el fonemizador empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-IE (ingles de Irlanda) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (libreria phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis end-to-end que combina un encoder de texto, un prior variacional con normalizing flows, un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotono para derivar la duracion de los fonemas. Es una arquitectura consolidada para TTS de un solo hablante con salida de audio de calidad razonable y baja latencia.

La entrada del modelo son fonemas espeak en alfabeto IPA, no texto en crudo. El front-end de texto lo aporta phoonnx a traves de la libreria scriptconv, que normaliza el texto y lo convierte a fonemas mediante EspeakPhonemizer (extra scriptconv[espeak]). El modelo procede del repositorio agentvibes/piper-custom-voices, que agrupa voces personalizadas para Piper. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni sobre el uso de RLHF o DPO, ya que no se documentan en la informacion proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) de un unico hablante para ingles de Irlanda (en-IE).
- Conversion de fonemas espeak (IPA) a forma de onda de audio.
- Integracion en pipelines Python mediante phoonnx (TTSModelManager y synthesize_wav).
- Integracion en asistentes OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador a traves de phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo de sintesis de voz.
- No dispone de capacidades de vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: la voz se selecciona en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx, de modo que el asistente responde con una voz irlandesa coherente con la region del usuario.
- Lectura de contenido en aplicaciones para usuarios de Irlanda: sintesis de articulos, notificaciones o mensajes con pronunciacion adaptada al ingles irlandes, usando el front-end espeak para normalizar el texto.
- Generacion de audio para sistemas de accesibilidad: conversion de texto a voz en pantalla para aplicaciones web o de escritorio que necesitan una voz ligera (repo de 0,1 GB) y sin dependencia de servicios en la nube.
- Locuciones para prototipos y demos: al ser un modelo pequeno en ONNX y con licencia Apache 2.0, encaja en entornos de desarrollo donde se requiere sintesis rapida sin coste de API.
- Integracion en el navegador con phoonnx.js: la demo en tigregotico.pt/demo permite probar la voz en cliente, util para aplicaciones web que sintetizan texto sin backend.
- Pipelines de generacion de audio por lotes: mediante phoonnx en Python se pueden sintetizar frases de forma programatica y escribir ficheros WAV, por ejemplo para generar avisos o contenido de audio de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe en GPU de gama baja o incluso en CPU.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: si, dado el tamano del repositorio (0,1 GB); no se documentan requisitos minimos concretos.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS) y phoonnx.js (navegador). Requiere espeak-ng instalado o el extra phoonnx[espeak] (port espyak).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada |
|---|---|---|---|---|---|
| vits-en_ie-jenny-espeak | VITS | en-IE | Apache 2.0 | ONNX | Fonemas espeak (IPA) |
| Otras voces de agentvibes/piper-custom-voices | VITS | segun voz | Apache 2.0 (declarada upstream) | ONNX | Fonemas espeak |
| Voces VITS de la coleccion Phoonnx | VITS | varios | variable | ONNX | Fonemas espeak |

No se dispone de datos de rendimiento comparativo entre estas voces en la informacion proporcionada; la comparacion se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma (en-IE); no es multilingue.
- La calidad de pronunciacion depende del fonemizador: con el port espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Requiere espeak-ng instalado (o el extra phoonnx[espeak]) para generar los fonemas de entrada; sin ese front-end el modelo no recibe la entrada adecuada.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede producir prosodia o pronunciacion incorrecta en textos fuera de dominio o con nombres propios.
- No se documentan sesgos especificos; al ser una voz regional, puede no representar variantes del ingles distintas de en-IE.
- La licencia Apache 2.0 permite uso comercial, pero la model card indica que la licencia es la declarada upstream en agentvibes/piper-custom-voices; conviene verificar dicha declaracion antes de un despliegue comercial.
- Uso muy limitado en produccion: 21 descargas y 0 likes en el momento de la informacion, sin benchmarks publicados; debe evaluarse la calidad de audio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_ie-jenny-espeak
- Repositorio upstream: https://huggingface.co/agentvibes/piper-custom-voices
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

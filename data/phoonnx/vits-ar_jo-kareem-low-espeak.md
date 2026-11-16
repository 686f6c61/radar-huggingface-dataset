# Phoonnx/vits-ar_jo-kareem-low-espeak

## Resumen

`vits-ar_jo-kareem-low-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo original procede del proyecto Rhasspy, concretamente de la coleccion `piper-voices`, en la variante `ar/ar_JO/kareem/low`, y ha sido reempaquetado para su uso directo con la libreria `phoonnx` y con el ecosistema OVOS (Open Voice OS).

El modelo resuelve la sintesis de voz en arabe jordano (`ar-JO`) a partir de texto convertido a fonemas mediante espeak-ng. Su tamano de repositorio es de 0,1 GB, lo que corresponde a una variante "low" de calidad reducida, pensada para entornos con recursos limitados y para sintesis en tiempo real en dispositivos modestos.

Es relevante en el contexto de asistentes de voz de codigo abierto porque ofrece una voz arabe ligera, con licencia MIT y formato ONNX, integrable en pipelines de TTS sin dependencias de frameworks de aprendizaje profundo pesados. No obstante, su adopcion es muy reducida (19 descargas, 0 likes) y su calidad es la de una voz "low" de Piper, no la de un sistema neuronal de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no admite contexto de texto largo como un LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; la variante "low" implica menor calidad, no necesariamente cuantizacion explicita) |
| Idiomas soportados | arabe jordano (`ar-JO`) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en normalizing flows y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. El modelo original fue entrenado por Rhasspy dentro del proyecto Piper, que usa VITS para generar voces ligeras y rapidas en CPU. La variante concreta es `kareem`, una voz masculina en arabe jordano, en calidad "low".

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a TTS). La innovacion destacable en este empaquetado es la integracion con `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`. El modelo espera entrada en fonemas espeak, no texto crudo, lo que condiciona todo el pipeline de inferencia.

## Capacidades

- Sintesis de voz (text-to-speech) en arabe jordano a partir de texto en fonemas espeak (alfabeto IPA).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador mediante `phoonnx.js`, con demo en vivo en `tigregotico.pt/demo`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo "thinking".
- Capacidad multilingue limitada exclusivamente al arabe jordano.

## Casos de uso

- Asistentes de voz en arabe jordano: integracion en OVOS o en cualquier pipeline que use phoonnx para dotar de salida hablada a un asistente domestico en arabe. La voz "low" es adecuada por su bajo coste computacional y latencia reducida.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos (recordatorios, avisos de sistema) en entornos embebidos donde no cabe un modelo TTS de mayor tamano.
- Accesibilidad para hablantes de arabe jordano: conversion de texto a voz en aplicaciones de lectura de pantalla o interfaces de accesibilidad, siempre que se acepte la calidad "low".
- Sistemas de megafonia o anuncios automatizados: generacion de locuciones pregrabadas para transporte, comercios o edificios, donde la naturalidad no es critica.
- Prototipado de aplicaciones de voz en arabe: validacion rapida de flujos conversacionales antes de invertir en una voz de mayor calidad.
- Inferencia en navegador o en dispositivos de bajos recursos: gracias al formato ONNX y a `phoonnx.js`, puede ejecutarse en el cliente sin servidor dedicado.
- Pruebas de integracion de TTS en pipelines de CI: el modelo es pequeno (0,1 GB) y su instalacion es ligera, lo que facilita tests automatizados de sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al ser un modelo VITS "low" de 0,1 GB en ONNX, la huella de memoria es muy reducida y cabe en CPU sin GPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaria sobradamente, pero no es necesario.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en CPU y en navegador.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `vits-ar_jo-kareem-low-espeak` (este) | VITS | ar-JO | no aplica | MIT | ONNX | Hugging Face, 19 descargas |
| Otras voces de `rhasspy/piper-voices` (p. ej. variantes `medium`/`high`) | VITS | multiples | no aplica | MIT (segun upstream) | ONNX | Hugging Face, amplia coleccion |
| Voces TTS neuronales de gran escala (p. ej. XTTS, Bark) | Transformer/autoregresivo | multilingue | limitado | variable | safetensors/PyTorch | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad "low": la variante esta pensada para recursos limitados, por lo que la naturalidad y prosodia son inferiores a voces de mayor calidad.
- Dependencia de espeak-ng: los fonemas deben generarse con espeak-ng; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Entrada en fonemas, no texto crudo: requiere un front-end de normalizacion y fonemizacion (`scriptconv`) antes de la sintesis.
- Cobertura linguistica unica: solo arabe jordano (`ar-JO`); no soporta otros dialectos arabes ni otros idiomas.
- Sesgos: no se documentan sesgos especificos, pero al ser una voz entrenada con un corpus concreto puede reflejar caracteristicas del hablante y del dataset de origen.
- Riesgo de alucinacion: no aplica en el sentido de LLM; el riesgo es de pronunciacion incorrecta o prosodia inadecuada en palabras fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del modelo upstream en `rhasspy/piper-voices` antes de produccion.
- Adopcion muy baja (19 descargas, 0 likes): escasa validacion comunitaria; conviene probar exhaustivamente antes de desplegar.
- Fecha de creacion futura en los metadatos (2026-11-14): dato anomalo que conviene verificar en la pagina del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ar_jo-kareem-low-espeak
- Upstream (Piper voices, ar_JO/kareem/low): https://huggingface.co/rhasspy/piper-voices/tree/main/ar/ar_JO/kareem/low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo

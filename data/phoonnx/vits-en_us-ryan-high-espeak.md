# Phoonnx/vits-en_us-ryan-high-espeak

## Resumen

vits-en_us-ryan-high-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en ingles estadounidense en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece sintesis neuronal de calidad alta en un paquete compacto (0,1 GB) y ejecutable en CPU mediante ONNX Runtime, lo que lo hace adecuado para asistentes de voz locales y sistemas embebidos.

El modelo no es un LLM ni procesa lenguaje natural de forma generativa: es un sintetizador acustico puro. La voz concreta es `en_US-ryan-high`, una voz masculina de calidad "high" del catalogo de Piper, que a su vez deriva de los modelos VITS entrenados por Rhasspy. Phoonnx la publica con la etiqueta `phoonnx` y la integra en su ecosistema (scriptconv para normalizacion de texto, plugin OVOS para asistentes de voz).

Al estar empaquetado en ONNX y con licencia MIT, el modelo resulta interesante para quien necesite un TTS offline, sin dependencias de servicios en la nube, con latencia baja y huella de memoria reducida. Su limitacion principal es que solo cubre ingles estadounidense y depende de espeak-ng para la fonemizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no procesa contexto textual) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial entrenado con perdidas de reconstruccion, adversarial y de alineamiento monotono (MAS). El resultado es un modelo que genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado. La voz `ryan-high` corresponde al nivel de calidad "high" del catalogo Piper, lo que implica mayor resolucion de muestreo y mayor fidelidad acustica que las variantes "low" o "medium".

No se dispone de informacion sobre el numero de horas de audio, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o fine-tuning especificas. El modelo original fue entrenado por Rhasspy; Phoonnx unicamente lo reempaqueta en ONNX y lo integra en su pipeline de inferencia. La innovacion tecnica destacable es el uso de espeak-ng como front-end de fonemizacion (via `scriptconv`), lo que permite alimentar el modelo con fonemas IPA en lugar de texto crudo.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control fino de la pronunciacion.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni vision.
- Capacidad multilingue limitada exclusivamente a en-US.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS mediante `mycroft.conf` y permite sintetizar respuestas habladas sin conexion a Internet, gracias a su tamano reducido y ejecucion ONNX en CPU.
- Lectura de notificaciones y alertas en sistemas embebidos: al ocupar 0,1 GB y no requerir GPU, puede desplegarse en dispositivos de bajos recursos (Raspberry Pi, routers) para leer mensajes en voz alta.
- Accesibilidad para personas con discapacidad visual: conversion de texto a audio en aplicaciones de escritorio o moviles con latencia baja y sin dependencia de servicios cloud.
- Generacion de audiolibros o podcasts automatizados: sintesis por lotes de grandes volumenes de texto en ingles, con control de pronunciacion mediante fonemas IPA.
- Pruebas de integracion continua para pipelines de voz: al ser un modelo pequeno y determinista, sirve como componente de test en sistemas que evaluan calidad de TTS o integracion con asistentes.
- Demos web interactivas: phoonnx.js permite ejecutar la voz en el navegador (demo en tigregotico.pt/demo) para prototipos de interfaces conversacionales.
- Sistemas de navegacion o domotica con feedback hablado: respuestas cortas en ingles generadas localmente, sin coste por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoria de despliegues; el modelo corre en CPU mediante ONNX Runtime. El repositorio ocupa 0,1 GB, por lo que la memoria RAM necesaria es del orden de cientos de MB.
- GPU recomendadas: no se documentan requisitos de GPU; cualquier GPU compatible con ONNX Runtime (CUDA, DirectML) puede acelerar la inferencia, pero no es necesaria.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en iGPU, aunque el caso tipico es CPU.
- Opciones de despliegue: phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS VITS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_us-ryan-high-espeak (este) | VITS | en-US | ONNX | MIT | Empaquetado para phoonnx, entrada espeak IPA |
| Otras voces Piper (p. ej. en_US-lessac-high) | VITS | en-US | ONNX | MIT | Mismo upstream Rhasspy, distinta voz |
| Modelos TTS neuronales comerciales (p. ej. servicios cloud) | variable | multi | API | propietaria | Requieren conexion, no offline |
| Coqui TTS (modelos VITS) | VITS | multi | varios | variable (MPL en toolkit) | Mayor ecosistema, mas pesado |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Depende de espeak-ng para la fonemizacion; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- No es un modelo de lenguaje: no razona, no responde preguntas ni procesa contexto; solo sintetiza audio a partir de texto/fonemas.
- Riesgo de prosodia limitada en frases largas o con puntuacion compleja, inherente a los modelos VITS de este tipo.
- No se documentan sesgos especificos, pero al ser una voz unica masculina entrenada con un dataset no descrito, puede reflejar sesgos del corpus original.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la procedencia del dataset upstream de Rhasspy para cumplir con posibles restricciones de los datos de entrenamiento.
- No se documentan variantes cuantizadas ni requisitos de latencia, lo que dificulta planificar despliegues con SLA estrictos.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ryan-high-espeak
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/high
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

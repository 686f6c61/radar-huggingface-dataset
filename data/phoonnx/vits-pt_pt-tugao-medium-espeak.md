# Phoonnx/vits-pt_pt-tugao-medium-espeak

## Resumen

`vits-pt_pt-tugao-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por Phoonnx como empaquetado del voice `pt_PT/tugão/medium` del proyecto Rhasspy Piper. El modelo original lo desarrolla Rhasspy y Phoonnx lo redistribuye en formato ONNX para su librería de inferencia `phoonnx`, que también ofrece integración con el asistente OVOS. Resuelve el problema de disponer de una voz TTS en portugués europeo (pt-PT) ejecutable localmente, sin dependencia de servicios en la nube, sobre CPU.

El modelo es de tamano "medium" dentro de la escala de Piper, con un repositorio de aproximadamente 0,1 GB, lo que lo situa en la gama de voces ligeras aptas para dispositivos de bajos recursos y despliegues embebidos. La entrada de texto se procesa mediante fonemización con espeak-ng y el modelo consume fonemas en alfabeto IPA. La licencia es MIT, lo que permite uso comercial sin restricciones significativas.

Su relevancia actual radica en la combinacion de tres factores: licencia permisiva, ejecucion local via ONNX Runtime y una voz especifica para portugués de Portugal, un idioma con menor cobertura que el portugués de Brasil en el ecosistema TTS open source. No es un modelo de lenguaje generativo ni un sistema multimodal: es exclusivamente un sintetizador de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa ~0,1 GB) |
| Idiomas soportados | pt-PT (portugués europeo) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Front-end de texto | scriptconv con `EspeakPhonemizer` (extra `scriptconv[espeak]`) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador), plugin OVOS |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y de alineamiento monotono. Esta disenada para generar audio de forma directa a partir de fonemas sin necesidad de un vocoder externo, lo que simplifica el pipeline de despliegue. El modelo empaquetado por Phoonnx conserva la arquitectura original de Piper y se distribuye como grafo ONNX para inferencia con ONNX Runtime.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de referencia ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. La model card indica unicamente que el modelo proviene de `rhasspy/piper-voices/pt/pt_PT/tugão/medium`, que la autoria original es de Rhasspy y que la entrada se realiza con fonemas espeak-ng. La innovacion tecnica destacable en el empaquetado de Phoonnx es la integracion del front-end de fonemizacion mediante `scriptconv`, que normaliza el texto y lo convierte a IPA antes de la inferencia.

## Capacidades

- Síntesis de voz a partir de texto en portugués europeo (pt-PT), generando audio WAV.
- Fonemizacion de entrada mediante espeak-ng (o el port espyak incluido en `phoonnx[espeak]`).
- Ejecucion local sobre ONNX Runtime, sin llamadas a servicios externos.
- Integracion con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js`, con demo en vivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a pt-PT; no se declaran otros idiomas.
- Salida de audio en formato WAV a traves de la API `synthesize_wav`.

## Casos de uso

- Asistentes de voz locales en portugués europeo: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite construir un asistente por voz que funciona sin conexion y sin enviar audio ni texto a terceros, adecuado para domotica y entornos con requisitos de privacidad.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de articulos, notificaciones o mensajes de interfaz a voz para usuarios con discapacidad visual, aprovechando el tamano reducido (~0,1 GB) para ejecutarse en dispositivos de gama baja.
- Sistemas de anuncios y megafonia automatizada: generacion de avisos pregrabados o dinamicos en pt-PT para transporte publico, aeropuertos o comercios, con la ventaja de la licencia MIT para uso comercial.
- Videojuegos y aplicaciones interactivas: sintesis de dialogos de personajes en tiempo de ejecucion en el navegador mediante `phoonnx.js`, evitando empaquetar grandes bancos de audio y reduciendo el tamano de la distribucion.
- Prototipado rapido de interfaces de voz: validacion de flujos conversacionales y pruebas de usabilidad en pt-PT sin contratar servicios TTS comerciales, gracias a la instalacion via `pip install --pre phoonnx`.
- Generacion de audiolibros o podcasts de bajo coste: conversion por lotes de texto a WAV en pipelines locales, con control total sobre el coste y la privacidad del contenido procesado.
- Investigacion en TTS: punto de partida reproducible para experimentos de fonemizacion, evaluacion de voces Piper o comparativas de calidad en portugues europeo, al estar el modelo y el codigo de inferencia disponibles publicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es esperable que la inferencia se realice principalmente en CPU, pero no se confirman cifras oficiales.
- GPU recomendadas: no disponible; no se documenta soporte GPU especifico.
- Cabe en GPU consumer: no disponible; el modelo esta pensado para ejecucion ligera y el empaquetado ONNX sugiere despliegue en CPU.
- Opciones de despliegue: `phoonnx` (Python, con ONNX Runtime), `phoonnx.js` (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-pt_pt-tugao-medium-espeak (este) | VITS | pt-PT | MIT | ONNX | Empaquetado por Phoonnx; ~0,1 GB |
| Voz original rhasspy/piper-voices pt_PT/tugão/medium | VITS | pt-PT | MIT (segun model card upstream) | Piper/ONNX | Fuente upstream del mismo modelo; misma voz |
| Otras voces Piper pt_PT | VITS | pt-PT | MIT | Piper/ONNX | Alternativas del mismo catalogo; no se dispone de comparativa de calidad |
| Modelos TTS multilingues de gran tamano | no disponible | Multiples | variable | variable | No se dispone de datos para comparar en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, no razona y no soporta tool calling ni agentes.
- Cobertura limitada a pt-PT; no se declaran otros idiomas ni variantes como pt-BR.
- La fonemizacion depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- No se documentan sesgos, calidad de voz, hablante de referencia ni condiciones de grabacion del dataset original.
- Riesgo de pronunciacion incorrecta en palabras fuera de vocabulario, siglas, numeros o nombres propios, derivado del front-end de fonemizacion.
- No se han publicado benchmarks objetivos (MOS, WER, latencia) en la informacion disponible.
- Licencia MIT declarada por el upstream; conviene verificar la model card de `rhasspy/piper-voices` para confirmar terminos antes de un uso comercial a gran escala.
- El modelo se publico con fecha de creacion 2026-11-16 segun los metadatos, sin descargas ni likes registrados, por lo que no existe validacion comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt_pt-tugao-medium-espeak
- Upstream (Rhasspy Piper voices, pt_PT/tugão/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_PT/tugão/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

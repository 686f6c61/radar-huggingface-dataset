# Phoonnx/vits-vi_vn-25hours_single-low-espeak

## Resumen

vits-vi_vn-25hours_single-low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en vietnamita (vi-VN) a audio, tomando como entrada fonemas IPA generados por espeak-ng en lugar de texto plano, lo que lo integra en un pipeline de normalizacion y fonemizacion previa.

La relevancia de este modelo es practica: ofrece TTS ligero y de baja latencia (variante "low" de calidad) para vietnamita, con pesos ONNX de aproximadamente 0,1 GB, lo que permite ejecutarlo en CPU y en dispositivos con recursos limitados. Es una de las pocas opciones abiertas para sintesis de voz en vietnamita dentro del ecosistema Piper, y su empaquetado para phoonnx facilita su uso tanto en Python como en el asistente OVOS y en el navegador mediante phoonnx.js.

El modelo no es un LLM ni un modelo multimodal: es un sintetizador acustico condicionado por fonemas. Su interes para desarrolladores radica en la licencia MIT, el formato ONNX portable y la integracion con espeak-ng, aunque su calidad es la de una variante "low" y su cobertura linguistica se limita al vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; la entrada es una frase en fonemas) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" del modelo Piper) |
| Idiomas soportados | vietnamita (vi-VN) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder generativo entrenado con aprendizaje adversarial, lo que permite generar audio de forma directa desde fonemas sin un vocoder separado. En este caso, el modelo procede de la coleccion Piper de Rhasspy, concretamente de la variante `vi/vi_VN/25hours_single/low`, que indica un entrenamiento sobre aproximadamente 25 horas de audio en vietnamita con una unica voz ("single") y configuracion de calidad baja ("low").

No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La innovacion destacable no esta en el modelo en si, sino en su empaquetado: Phoonnx lo distribuye como ONNX para inferencia portable y lo conecta a `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA mediante `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`. La calidad depende criticamente de que el fonemizador sea espeak-ng real, ya que el autor advierte que el port espyak puede producir fonemas distintos y pronunciar mal algunas palabras.

## Capacidades

- Sintesis de voz en vietnamita (vi-VN) a partir de texto, generando audio WAV mediante `voice.synthesize_wav`.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciacion si se proporcionan fonemas directamente.
- Inferencia ONNX portable, ejecutable en CPU sin GPU.
- Integracion con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso en navegador a traves de phoonnx.js (con entrada espeak o unicode).
- Una unica voz ("single") en vietnamita; no soporta cambio de hablante.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en vietnamita: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo permite que un asistente domestico responda en vietnamita con baja latencia al ejecutarse en CPU, sin necesidad de GPU.
- Lectura de contenido en aplicaciones moviles o de escritorio: al ser un ONNX de 0,1 GB, puede empaquetarse en apps offline para leer articulos, notificaciones o mensajes en vietnamita sin conexion.
- Accesibilidad para personas con discapacidad visual: conversion de texto de pantalla a voz en vietnamita en sistemas embebidos o de bajo consumo, donde un TTS en la nube no es viable.
- Generacion de audio para aprendizaje de idiomas: sintesis de frases vietnamitas con pronunciacion controlada mediante fonemas IPA, util para materiales de estudio o flashcards.
- Locuciones automatizadas en kioscos o sistemas de megafonia: el modelo puede generar avisos pregrabados o dinamicos en vietnamita para entornos con recursos limitados.
- Prototipado rapido de interfaces de voz: el pipeline `scriptconv` + `phoonnx` permite iterar sobre normalizacion de texto y fonemizacion antes de integrar un TTS de mayor calidad, usando este modelo como baseline ligero.
- Investigacion en TTS de bajos recursos: sirve como referencia reproducible de una variante Piper "low" para comparar calidad y latencia frente a modelos mayores en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoria de despliegues; el modelo ONNX de 0,1 GB esta pensado para ejecucion en CPU. En GPU, el consumo de memoria seria inferior a 1 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente. Para CPU, cualquier procesador moderno x86-64 o ARM es valido.
- Cabe en GPU consumer: si, en cualquier GPU consumer (RTX 4090, RTX 3060, etc.), aunque no es necesario; el caso de uso principal es CPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La variante "low" de Piper esta disenada para baja latencia en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto / entrada | Notas |
|---|---|---|---|---|---|---|
| vits-vi_vn-25hours_single-low-espeak (este) | VITS | vi-VN | MIT | ONNX | fonemas espeak IPA | Variante "low", 0,1 GB, empaquetado phoonnx |
| Otras voces Piper vi_VN (p. ej. variantes medium/high de rhasspy/piper-voices) | VITS | vi-VN | MIT (segun upstream) | ONNX | fonemas espeak IPA | Mayor calidad a costa de mas tamano y latencia; no disponibles en la informacion proporcionada |
| Modelos TTS multilingues comerciales (p. ej. APIs en la nube) | no disponible | multiples | propietaria | API | texto plano | No comparables en licencia ni despliegue offline |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Calidad limitada: la variante "low" de Piper prioriza velocidad y tamano sobre fidelidad acustica; la naturalidad sera inferior a variantes "medium" o "high".
- Dependencia de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- Cobertura linguistica restringida: solo vietnamita (vi-VN); no soporta otros idiomas ni cambio de voz.
- Una unica hablante: no hay control de estilo, emocion ni hablante.
- Riesgo de errores en la normalizacion de texto: numeros, siglas, fechas y palabras extranjeras dependen de `scriptconv` y del fonemizador; una normalizacion incorrecta produce audio erroneo.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribucion a Rhasspy/Piper y revisar la licencia del upstream en rhasspy/piper-voices.
- Sin datos de sesgo: no se ha publicado informacion sobre sesgos acusticos o de pronunciacion en el dataset de 25 horas.
- Sin benchmarks: no hay metricas objetivas de calidad (MOS, inteligibilidad) en la informacion disponible, lo que dificulta evaluar su idoneidad en produccion sin pruebas propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-vi_vn-25hours_single-low-espeak
- Upstream Piper (rhasspy/piper-voices, vi_VN/25hours_single/low): https://huggingface.co/rhasspy/piper-voices/tree/main/vi/vi_VN/25hours_single/low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

# Phoonnx/vits-cs_cz-honza-medium

## Resumen

vits-cs_cz-honza-medium es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Thomcles y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en checo (cs-CZ) en audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz checa ligera y ejecutable en local mediante ONNX Runtime, sin dependencia de servicios en la nube.

El modelo deriva del release upstream `Thomcles/Piper-TTS-Czech/medium`, integrado en el ecosistema Piper, y se distribuye con licencia MIT, lo que facilita su uso comercial y su incorporacion en asistentes de voz y sistemas de accesibilidad. El repositorio ocupa aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos ligeros aptos para dispositivos con recursos limitados.

La ficha se centra en el paquete `Phoonnx/vits-cs_cz-honza-medium`, que incluye los pesos en formato ONNX y la integracion con la libreria phoonnx (Python y OVOS). No se dispone de informacion publica sobre el numero de parametros, el volumen de datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | checo (cs-CZ) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python, OVOS, phoonnx.js en navegador) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. El modelo genera waveform directamente a partir de fonemas, sin necesidad de un vocoder externo separado, lo que simplifica el pipeline de inferencia.

El modelo original fue entrenado por Thomcles dentro del proyecto Piper-TTS-Czech (variante medium) y posteriormente exportado a ONNX por Phoonnx. No se dispone en la informacion proporcionada de datos sobre el numero de horas de audio, la composicion del corpus, el uso de RLHF/DPO ni detalles del proceso de entrenamiento. La innovacion practica del paquete es el empaquetado para phoonnx, que gestiona la normalizacion de texto mediante scriptconv y la fonemizacion con espeak-ng (o espyak como alternativa), permitiendo inferencia local en Python, en OVOS y en el navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz en checo (cs-CZ) a partir de texto plano.
- Conversion texto a fonemas IPA mediante espeak-ng (con espyak como alternativa, aunque puede producir errores en algunas palabras).
- Generacion de audio WAV directamente, sin vocoder externo.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (entrada espeak o unicode).
- Inferencia local en CPU/GPU mediante ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS puro).
- No soporta vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en checo para OVOS: el modelo se integra como plugin TTS y permite respuestas habladas en un asistente domestico local, con la voz `piper_community/Thomcles/cs-CZ_honza_medium` configurada en `mycroft.conf`.
- Accesibilidad y lectores de pantalla: sintesis de texto checo a audio para personas con discapacidad visual, ejecutable en local sin enviar texto a la nube.
- Audiolibros y contenido educativo: generacion de narraciones en checo a partir de texto, con la ventaja de un modelo ligero (~0,1 GB) que puede ejecutarse en servidores modestos.
- Sistemas de anuncios y notificaciones: conversion de mensajes dinamicos a voz en aplicaciones checas, con baja latencia al ser un modelo ONNX pequeno.
- Prototipado de interfaces conversacionales: integracion rapida en pipelines Python mediante phoonnx para validar experiencias de voz antes de escalar a modelos mayores.
- Demos web interactivas: uso de phoonnx.js para sintetizar voz checa directamente en el navegador, sin backend, gracias a los pesos ONNX.
- Investigacion en TTS: base para experimentos de fine-tuning o comparacion con otras voces Piper/VITS en checo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repositorio (~0,1 GB en ONNX), la huella de memoria es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPU consumer (por ejemplo, RTX 3060 o superiores) sin requisitos especiales.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS (`ovos-tts-plugin-phoonnx`), phoonnx.js (navegador). No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-cs_cz-honza-medium | VITS | cs-CZ | no aplica | MIT | ONNX | Hugging Face |
| Thomcles/Piper-TTS-Czech (medium) | VITS | cs-CZ | no aplica | no disponible en la informacion | Piper/ONNX | Hugging Face |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | no aplica | MIT (segun coleccion) | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo monoidioma: solo sintetiza checo (cs-CZ); no soporta otros idiomas.
- Dependencia de espeak-ng: la fonemizacion incorrecta o la ausencia de espeak-ng puede degradar la calidad; el uso de espyak puede provocar errores de pronunciacion en algunas palabras.
- Sin datos publicos de benchmarks: no hay metricas objetivas (MOS, intelligibility) en la informacion disponible para evaluar calidad.
- Riesgo de alucinacion acustica: como todo modelo generativo TTS, puede producir artefactos o pronunciaciones incorrectas en textos fuera de dominio.
- Sesgos: no se documentan sesgos especificos, pero la voz esta entrenada sobre un hablante concreto (honza) y puede no representar variedades dialectales del checo.
- Licencia MIT: permite uso comercial, pero el autor indica que el release upstream establece sus propios terminos; conviene verificar la licencia del modelo original.
- No apto para tareas de NLP: no es un modelo de lenguaje, por lo que no debe usarse para razonamiento, codigo o generacion de texto.
- Fecha de creacion futura (2026) en los metadatos: conviene verificar la vigencia y el mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cs_cz-honza-medium
- Modelo upstream: https://huggingface.co/Thomcles/Piper-TTS-Czech/tree/main/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

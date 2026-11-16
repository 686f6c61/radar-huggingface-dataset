# Phoonnx/vits-bn-multi-low-espeak

## Resumen

vits-bn-multi-low-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su conjunto de voces Mimic 3 y empaquetado por Phoonnx para su biblioteca de inferencia ONNX. El modelo convierte texto en bengali (`bn`) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su nombre indica que se trata de una variante "multi" de baja calidad ("low") orientada a un compromiso entre tamano y fidelidad, pensada para entornos con recursos limitados.

El modelo resuelve el problema de la sintesis de voz offline en bengali dentro del ecosistema OVOS/Mycroft, donde se necesita un motor TTS ligero que pueda ejecutarse en dispositivos de bajos recursos sin depender de servicios en la nube. Al estar empaquetado en formato ONNX y con un repositorio de solo 0,1 GB, es adecuado para asistentes de voz embebidos, aplicaciones de accesibilidad y sistemas de lectura de texto en bengali.

Su relevancia actual radica en que forma parte de una coleccion mas amplia de voces VITS portadas a phoonnx, lo que facilita su integracion en pipelines Python y en el navegador mediante phoonnx.js. No obstante, se trata de un modelo con cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que sugiere un uso muy limitado o reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | bengali (`bn`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Autor original | Mycroft AI |
| Empaquetador | Phoonnx |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por texto, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de dominio temporal y espectral. El modelo genera audio directamente a partir de fonemas, sin necesidad de un vocoder separado, lo que simplifica el despliegue. En este caso concreto, la entrada son fonemas espeak-ng en alfabeto IPA, y la salida es una forma de onda de audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (habituales en modelos de lenguaje, no en TTS). La model card indica que el modelo procede del repositorio `mimic3-voices/voices/bn/multi_low` de Mycroft AI, que agrupa voces de baja calidad y multiples hablantes para distintos idiomas. No se documentan innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz en bengali a partir de texto escrito en ese idioma.
- Conversion de texto a fonemas mediante espeak-ng y posterior sintesis con VITS.
- Generacion de audio en formato WAV mediante la API de phoonnx.
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (segun la documentacion del ecosistema).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al bengali (`bn`).

## Casos de uso

- Asistentes de voz embebidos en bengali: el modelo puede integrarse en OVOS o en cualquier aplicacion Python que use phoonnx para leer respuestas del asistente en voz alta, gracias a su tamano reducido (0,1 GB) y a su inferencia ONNX.
- Lectura de textos para accesibilidad: conversion de articulos, noticias o documentos en bengali a audio para personas con discapacidad visual, usando la API `synthesize_wav` de phoonnx.
- Sistemas de anuncios automatizados: generacion de avisos hablados en bengali para transporte publico, comercios o edificios, donde se requiere una voz sintetica ligera y offline.
- Aplicaciones educativas de aprendizaje de idiomas: reproduccion de frases en bengali para practicar pronunciacion, aprovechando la entrada basada en fonemas IPA.
- Prototipado de interfaces de voz: desarrollo rapido de demos de TTS en bengali sin depender de servicios en la nube, usando el plugin de phoonnx en OVOS.
- Integracion en navegador: uso de phoonnx.js para sintetizar voz en bengali directamente en el cliente, sin backend, en aplicaciones web accesibles.
- Sistemas de megafonia o kioscos interactivos: sintesis de mensajes dinamicos en bengali en dispositivos de bajos recursos, gracias al bajo peso del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,1 GB) se estima un consumo de memoria muy bajo, inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeno, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-bn-multi-low-espeak (este) | VITS | bn | 0,1 GB | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | variable | variable | ONNX | Hugging Face (coleccion VITS) |
| Voces Mimic 3 originales de Mycroft AI | VITS | varios | variable | CC-BY-SA-4.0 | varios | GitHub MycroftAI/mimic3-voices |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada, por lo que la comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo exclusivamente en bengali (`bn`); no soporta otros idiomas.
- Calidad "low" segun el nombre del modelo: se espera una fidelidad de sintesis inferior a la de voces de mayor calidad.
- Dependencia de espeak-ng para la fonemizacion; sin el instalado, la calidad puede degradarse o fallar. Con el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero puede producir pronunciaciones incorrectas o audio defectuoso en textos fuera de dominio.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribucion y compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Cero descargas y cero likes en Hugging Face: no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero al ser una voz "multi" de baja calidad, puede presentar artefactos acusticos y una prosodia limitada.
- No apto para produccion critica sin una evaluacion previa de calidad (MOS) y de cobertura fonetica en el dominio de uso.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-bn-multi-low-espeak
- Repositorio original (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/bn/multi_low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- scriptconv (GitHub): https://github.com/TigreGotico/scriptconv
- phoonnx.js (GitHub): https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo

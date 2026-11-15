# Phoonnx/vits-ar_ae-emirati_female

## Resumen

vits-ar_ae-emirati_female es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, entrenado para el dialecto arabe emirati (ar-AE) con una voz femenina. El modelo original fue desarrollado por el usuario vadimbelsky (publicado como vadimbelsky/arabic-emirati-female-piper) y ha sido empaquetado por Phoonnx en formato ONNX para su uso con su libreria de TTS basada en ONNX.

El modelo resuelve la necesidad de sintesis de voz en arabe emirati, un dialecto con recursos limitados en comparacion con el arabe estandar moderno (MSA). Al estar empaquetado para phoonnx, se integra en el ecosistema OVOS (Open Voice OS) y puede desplegarse tanto en Python como en navegador mediante phoonnx.js.

Se trata de un modelo compacto (repositorio de 0.1 GB) que acepta texto en arabe y lo convierte a fonemas mediante espeak-ng antes de la sintesis. Su licencia MIT facilita su uso comercial, aunque la calidad y cobertura del dialecto emirati estan acotadas por el corpus de entrenamiento original, del cual no se dispone de detalles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0.1 GB) |
| Idiomas soportados | arabe emirati (ar-AE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Libreria | phoonnx |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial en entrenamiento. Permite generar audio de forma directa desde fonemas sin necesidad de un vocoder externo, lo que resulta en modelos compactos y de baja latencia.

El modelo deriva de vadimbelsky/arabic-emirati-female-piper, un modelo Piper para arabe emirati femenino. No se dispone de informacion sobre el numero de horas de audio, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico en la informacion proporcionada. El front-end de texto utiliza espeak-ng para la fonemizacion, con la advertencia de que el port espyak puede producir fonemas distintos y errores de pronunciacion en algunas palabras.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en arabe emirati.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion mediante espeak-ng (o espyak como alternativa).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Voz femenina especifica del dialecto emirati.
- No soporta tool calling, agentes, vision ni audio de entrada (es un modelo TTS puro).

## Casos de uso

- Asistentes de voz en arabe emirati: integracion en OVOS mediante el plugin ovos-tts-plugin-phoonnx para respuestas habladas en dialecto local, adecuado por su licencia MIT y su formato ONNX ligero.
- Lectura de contenido en aplicaciones moviles o web: el modelo puede ejecutarse en navegador con phoonnx.js, permitiendo sintesis de texto arabe sin backend dedicado.
- Sistemas de navegacion o kioscos en Emiratos Arabes Unidos: la voz femenina emirati mejora la naturalidad frente a voces MSA en contextos locales.
- Accesibilidad: conversion de texto a voz para usuarios con discapacidad visual que consuman contenido en dialecto emirati.
- Prototipado rapido de IVR (respuesta de voz interactiva): el modelo es ligero (0.1 GB) y puede desplegarse en contenedores pequenos con phoonnx.
- Generacion de locuciones para contenido educativo o divulgativo en arabe emirati, con la salvedad de revisar pronunciacion por las limitaciones de espeak.
- Integracion en pipelines de audio para doblaje o preproduccion, siempre que se valide la calidad del dialecto en el dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; al tratarse de un modelo ONNX de aproximadamente 0.1 GB, es esperable que quepa en GPU consumer con pocos cientos de MB, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU moderna (incluidas integradas) podria ejecutarlo, pero no hay datos oficiales.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del repositorio (0.1 GB), aunque no confirmado.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS (ovos-tts-plugin-phoonnx). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-ar_ae-emirati_female (este) | VITS | ar-AE | MIT | ONNX | fonemas espeak |
| vadimbelsky/arabic-emirati-female-piper | VITS (Piper) | ar-AE | MIT (segun upstream) | Piper | fonemas espeak |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | MIT (segun coleccion) | ONNX | fonemas espeak |

No se dispone de datos de rendimiento comparativo ni de benchmarks entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada al dialecto arabe emirati (ar-AE); no se garantiza calidad en otros dialectos o en arabe estandar moderno.
- La fonemizacion con espeak-ng puede producir errores de pronunciacion; el uso de espyak puede empeorar la calidad segun advierte el autor.
- No se dispone de informacion sobre sesgos de generacion, calidad subjetiva (MOS) ni robustez ante texto no normalizado.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede haber pronunciaciones incorrectas o prosodia inadequada en palabras fuera del dominio de entrenamiento.
- Requiere espeak-ng instalado para el funcionamiento correcto del front-end de texto.
- La licencia MIT del upstream permite uso comercial, pero conviene verificar la procedencia del corpus de audio original (no detallada).
- Modelo con muy pocas descargas (29) y sin likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ar_ae-emirati_female
- Modelo upstream: https://huggingface.co/vadimbelsky/arabic-emirati-female-piper
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65

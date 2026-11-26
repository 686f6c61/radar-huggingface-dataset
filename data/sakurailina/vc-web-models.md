# sakurailina/vc-web-models

## Resumen

`sakurailina/vc-web-models` es un repositorio de pesos en formato ONNX orientado a la conversion de voz (voice conversion, VC) en tiempo real directamente en el navegador mediante WebGPU. No se trata de un modelo de lenguaje, sino de un conjunto de componentes de inferencia empaquetados para ejecutarse en cliente web: un modelo DiT destilado a un paso (Seed-VC), un encoder de Whisper, un vocoder BigVGAN, un extractor de pitch FCPE, un encoder de speaker CAMPPlus y un modelo de flow matching causal (Causal FlowVC).

El repositorio lo publica el usuario `sakurailina` bajo licencia Apache 2.0 y ocupa 1,9 GB. Su proposito es servir como backend de pesos para una demo de cambiador de voz en tiempo real desplegable en Vercel o Cloudflare Pages, de modo que toda la inferencia ocurra en el dispositivo del usuario sin enviar audio a un servidor.

La relevancia es acotada pero concreta: demuestra un pipeline de voice conversion de baja latencia sobre WebGPU, combinando destilacion a un solo paso (para reducir coste computacional), vocoder neural y estimacion de pitch y timbre, todo en formato ONNX para portabilidad. La informacion publica sobre arquitectura interna, datos de entrenamiento y evaluacion es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de voice conversion: DiT destilado (Seed-VC), flow matching causal (Causal FlowVC), encoder Whisper, vocoder BigVGAN, pitch FCPE, speaker encoder CAMPPlus |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | FP16 en los componentes que lo indican (`dit_student_fp16.onnx`, `campplus_fp16.onnx`); precision del resto no disponible |
| Idiomas soportados | no disponible (procesa audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable en WebGPU) |

## Arquitectura y entrenamiento

El repositorio agrupa dos pipelines de conversion de voz. El primero, Seed-VC, se compone de un Diffusion Transformer (DiT) destilado a un solo paso de inferencia (`dit_student_fp16.onnx`), un encoder basado en Whisper Small (`whisper_small_enc.onnx`), el vocoder neural BigVGAN (`bigvgan.onnx`), el estimador de pitch FCPE (`fcpe.onnx`) y el encoder de hablante CAMPPlus (`campplus_fp16.onnx`). El segundo, Causal FlowVC, es un modelo de flow matching causal pensado para streaming (`streaming_vc_core.onnx`) acompanado de un encoder de hablante (`speaker_encoder.onnx`).

La innovacion principal es de despliegue mas que de modelado: la destilacion a un paso del DiT reduce el numero de evaluaciones de red por fotograma, y la naturaleza causal de Causal FlowVC permite procesar audio de forma incremental con baja latencia. Todo se exporta a ONNX para ejecutarse sobre WebGPU en el navegador. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset, ni sobre el uso de tecnicas de alineamiento o ajuste fino adicional.

## Capacidades

- Conversion de voz (voice conversion) en tiempo real: transforma el timbre de una fuente de audio hacia el de un hablante objetivo.
- Inferencia en navegador mediante WebGPU, sin backend servidor.
- Streaming de audio con el componente Causal FlowVC (procesamiento causal incremental).
- Extraccion de pitch (FCPE) y de embedding de hablante (CAMPPlus / speaker encoder) como etapas del pipeline.
- Sintesis de audio mediante vocoder neural BigVGAN.
- Soporte de despliegue estatico en Vercel o Cloudflare Pages segun la model card.
- No se documentan capacidades de texto, codigo, vision, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Cambiador de voz en el navegador: integracion de los ONNX en una aplicacion web con WebGPU para transformar la voz del microfono en tiempo real sin salir del cliente, adecuado por la naturaleza causal y el bajo coste de la destilacion a un paso.
- Demos interactivas y prototipos: publicacion de una demo estatica en Vercel o Cloudflare Pages para evaluar la conversion de voz sin infraestructura de servidor.
- Privacidad por diseno: procesamiento local del audio, util en escenarios donde no se desea enviar voz a un servidor (por ejemplo, herramientas de accesibilidad o entretenimiento).
- Investigacion en voice conversion en el edge: banco de pruebas para comparar Seed-VC destilado frente a Causal FlowVC en latencia y calidad sobre hardware de cliente.
- Creacion de contenido y doblaje ligero: conversion de pistas de voz pregrabadas hacia un timbre objetivo usando el pipeline completo (encoder, pitch, vocoder).
- Educacion y divulgacion: ejemplo didactico de pipeline ONNX + WebGPU con multiples etapas (encoder, estimador de pitch, vocoder) para ensenar inferencia en navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio pesa 1,9 GB, lo que da una cota superior aproximada del conjunto de pesos; el consumo en ejecucion depende de los componentes cargados simultaneamente.
- GPU recomendadas: no disponibles. El requisito funcional es soporte de WebGPU en el navegador (por ejemplo, navegadores Chromium recientes sobre GPUs compatibles).
- Compatibilidad con GPU de consumo: plausible al ejecutarse en cliente, pero no se documentan modelos concretos ni minimos.
- Opciones de despliegue: WebGPU en navegador; hosting estatico en Vercel o Cloudflare Pages segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion muy escasa: sin datos de parametros, contexto, entrenamiento ni evaluacion, la evaluacion tecnica queda limitada a la estructura del pipeline.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de conversion ni de latencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario no verificables.
- Riesgo de uso indebido: la conversion de voz puede emplearse para suplantacion o deepfakes de audio; conviene aplicar consentimiento y controles.
- Idiomas y dominios de audio no documentados: el rendimiento fuera del dominio previsto (voces, idiomas, ruido) es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero no se aclaran las licencias de los modelos base subyacentes (Seed-VC, Whisper, BigVGAN, CAMPPlus, FCPE); verificar antes de produccion.
- Dependencia de WebGPU: la compatibilidad depende del navegador y del hardware del cliente, con posible degradacion en equipos sin soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sakurailina/vc-web-models
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.

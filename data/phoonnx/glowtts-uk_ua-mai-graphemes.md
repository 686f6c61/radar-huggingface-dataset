# Phoonnx/glowtts-uk_ua-mai-graphemes

## Resumen

GlowTTS-uk_ua-mai-graphemes es un modelo de sintesis de voz (text-to-speech) para ucraniano, empaquetado en formato ONNX por el proyecto Phoonnx. El modelo original es un Glow-TTS desarrollado por Coqui, publicado en la version 0.6.1 de su suite TTS, y que Phoonnx ha convertido y redistribuido para su uso con su libreria de inferencia ONNX. Se trata de un modelo acustico que genera espectrogramas a partir de texto, que posteriormente son convertidos a audio por un vocoder separado (multiband_melgan-uk_ua-mai).

El modelo resuelve la sintesis de voz en ucraniano (uk-UA) con una entrada basada en grafemas, lo que simplifica el front-end al no requerir un fonemizador complejo. Su relevancia actual radica en que ofrece una alternativa ligera (0,1 GB de repositorio) y con licencia MIT para integrar TTS en ucraniano dentro de asistentes de voz como OVOS, sin depender de servicios en la nube.

La arquitectura Glow-TTS es un modelo de flujo normalizador (normalizing flow) con alineamiento monotono, disenado para sintesis rapida y paralela. El modelo esta pensado para ejecutarse en CPU mediante ONNX Runtime, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ucraniano (uk-UA) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Vocoder asociado | multiband_melgan-uk_ua-mai |
| Entrada de texto | grafemas (GraphemePhonemizer de scriptconv) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (ONNX) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en flujos normalizadores que transforma una distribucion latente en un espectrograma mel. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS permite sintesis paralela y utiliza un algoritmo de alineamiento monotono (MAS, Monotonic Alignment Search) para aprender la correspondencia entre texto y frames de audio sin necesidad de alineamientos externos. Esta arquitectura produce espectrogramas de forma determinista y rapida.

El modelo original fue entrenado por Coqui y distribuido en su release v0.6.1 de la suite TTS. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino. La version empaquetada por Phoonnx mantiene los pesos originales y anade la infraestructura de inferencia ONNX junto con el vocoder Multiband-MelGAN especifico para ucraniano.

## Capacidades

- Sintesis de voz en ucraniano (uk-UA) a partir de texto escrito.
- Generacion de espectrogramas mel que se convierten a audio mediante el vocoder Multiband-MelGAN.
- Entrada basada en grafemas, sin necesidad de transcripcion fonetica manual.
- Integracion con la libreria phoonnx para inferencia ONNX en Python.
- Soporte como plugin de TTS para OVOS (ovos-tts-plugin-phoonnx).
- Ejecucion en CPU mediante ONNX Runtime, sin requerir GPU.
- Normalizacion y conversion de texto mediante la libreria scriptconv.
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en ucraniano: el modelo se integra como plugin de OVOS para dotar de sintesis de voz a asistentes locales, con la ventaja de ejecutarse en CPU y no requerir conexion a internet.
- Lectura de notificaciones y alertas: aplicaciones que necesiten leer en voz alta mensajes del sistema o alertas en ucraniano pueden usar el modelo para generar audio rapidamente por frase.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en aplicaciones de lectura de pantalla o documentos en ucraniano, aprovechando el bajo consumo de recursos del modelo ONNX.
- Sistemas de megafonia automatizada: generacion de anuncios pregrabados o dinamicos en ucraniano para transporte publico, comercios o aeropuertos, donde la latencia no es critica y el coste por inferencia es bajo.
- Integracion en pipelines de audiolibros o podcasts: sintesis de contenido textual largo dividido en frases, con el vocoder generando el audio final para su post-procesado.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un TTS en ucraniano para pruebas de concepto o demos pueden desplegar el modelo en local sin coste de API.
- Educacion y aprendizaje de idiomas: generacion de pronunciacion sintetica de frases en ucraniano para materiales didacticos o aplicaciones de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo es muy ligero (repositorio de 0,1 GB), por lo que cabria en cualquier GPU con al menos 1-2 GB de memoria libre.
- GPU recomendadas: no es necesario GPU; cualquier GPU moderna (RTX 3060 o superior) puede ejecutarlo, pero el modelo esta optimizado para CPU mediante ONNX Runtime.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, aunque su uso tipico es en CPU.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin OVOS (ovos-tts-plugin-phoonnx). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo de flujo no autorregresivo, la sintesis es paralela y por frase, lo que tipicamente resulta en latencias bajas en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-uk_ua-mai-graphemes (este) | Glow-TTS | uk-UA | MIT | ONNX | grafemas | Hugging Face (Phoonnx) |
| Coqui TTS tts_models--uk--mai--glow-tts (original) | Glow-TTS | uk-UA | MIT | PyTorch (checkpoint) | fonemas/grafemas | GitHub Coqui TTS |
| Otros modelos TTS multilingues de Coqui (p. ej. VITS) | VITS | varios | MIT (segun modelo) | PyTorch | fonemas | GitHub Coqui TTS |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer diferencias de calidad objetivas frente a alternativas. La principal ventaja de este empaquetado es el formato ONNX y la integracion con phoonnx/OVOS, frente al checkpoint PyTorch original de Coqui.

## Limitaciones y advertencias

- El modelo solo soporta ucraniano (uk-UA); no es multilingue.
- No se dispone de informacion sobre sesgos en los datos de entrenamiento ni sobre la calidad de la voz en distintos registros o acentos.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario o en textos con caracteres especiales.
- La entrada es por grafemas, lo que puede producir errores de pronunciacion en palabras con ortografia irregular o prestamos.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales de Coqui para cumplir con posibles restricciones adicionales.
- El modelo genera espectrogramas; requiere el vocoder multiband_melgan-uk_ua-mai para producir audio, lo que anade una dependencia adicional.
- No hay informacion sobre el rendimiento en produccion a gran escala ni sobre latencias reales medidas.
- El repositorio tiene muy pocas descargas (19) y likes (0), lo que sugiere una validacion comunitaria limitada.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-uk_ua-mai-graphemes](https://huggingface.co/Phoonnx/glowtts-uk_ua-mai-graphemes)
- [Vocoder: Phoonnx/multiband_melgan-uk_ua-mai](https://huggingface.co/Phoonnx/multiband_melgan-uk_ua-mai)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Coleccion Glow-TTS de Phoonnx](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Modelo original Coqui TTS v0.6.1](https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--uk--mai--glow-tts.zip)

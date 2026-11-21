# nokkela-ai/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de pesos abiertos con 82 millones de parámetros, desarrollado originalmente por hexgrad y republicado en esta ficha por nokkela-ai como fork independiente. A pesar de su tamano reducido, el modelo se posiciona como una alternativa eficiente a sistemas TTS de mayor tamano, con un coste de entrenamiento declarado de aproximadamente 1000 dolares en horas de GPU A100 80 GB y una licencia Apache 2.0 que permite uso comercial sin restricciones de atribucion.

El modelo emplea la arquitectura StyleTTS 2 combinada con el vocoder ISTFTNet, con un decodificador unicamente (sin difusion y sin encoder publicado). Esta disenado para generar audio a 24 kHz a partir de texto en ingles, con soporte para multiples voces predefinidas (la version v1.0 declara 8 idiomas y 54 voces en el modelo original). Su relevancia actual radica en que ofrece una relacion calidad/coste muy competitiva: el modelo original se sirve por API a menos de 1 dolar por millon de caracteres de entrada, lo que lo hace atractivo para despliegues a gran escala.

Esta ficha corresponde a un fork de nokkela-ai publicado el 21 de noviembre de 2026, que hereda la licencia Apache 2.0 y el pipeline de text-to-speech del modelo base hexgrad/Kokoro-82M. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 + ISTFTNet (decoder only, sin difusion) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles); el modelo base declara multiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,4 GB; el modelo base usa pesos PyTorch) |

## Arquitectura y entrenamiento

Kokoro-82M se basa en StyleTTS 2 (paper arXiv:2306.07691) para el modelado de estilo y prosodia, combinado con ISTFTNet (paper arXiv:2203.02395) como vocoder para la generacion de forma de onda. La arquitectura es exclusivamente decodificador: no emplea difusion ni publica el encoder, lo que simplifica el despliegue y reduce la latencia frente a sistemas TTS basados en modelos generativos de difusion. El modelo fue arquitectado por Li et al. (repositorio yl4579/StyleTTS2) y entrenado por el usuario @rzvzn.

El entrenamiento se realizo exclusivamente sobre audio permisivo y no sujeto a derechos de autor, incluyendo audio de dominio publico, audio con licencias Apache o MIT, y audio sintetico generado por modelos TTS cerrados de grandes proveedores (explicitamente excluyendo audio sintetico de modelos TTS abiertos o clones de voz personalizados). El dataset total comprende unos pocos cientos de horas de audio con etiquetas de fonemas IPA. La version v1.0 se entreno con unas 500 horas de GPU A100 80 GB adicionales a las 500 de la v0.19, sumando un total de 1000 horas y un coste aproximado de 1000 dolares. El modelo base declara 8 idiomas y 54 voces en su version v1.0.

## Capacidades

- Sintesis de voz a partir de texto en ingles con calidad comparable a modelos de mayor tamano, segun declara el autor.
- Generacion de audio a 24 kHz mediante el vocoder ISTFTNet.
- Soporte de multiples voces predefinidas (la version v1.0 del modelo base declara 54 voces).
- Procesamiento de texto a fonemas IPA mediante la libreria misaki (G2P), necesaria para el pipeline de inferencia.
- Modelo unicamente decodificador, sin difusion, lo que permite inferencia rapida y despliegue ligero.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni vision; es un modelo especializado exclusivamente en TTS.
- Capacidades multilingues limitadas en esta ficha a ingles, aunque el modelo base declara soporte para multiples idiomas.

## Casos de uso

- Audiolibros y narracion automatizada: el modelo puede convertir grandes volumenes de texto en audio a 24 kHz con multiples voces, adecuado para generar audiolibros completos con un coste de computo muy bajo gracias a sus 82 M de parametros.
- Asistentes de voz en produccion: al ser un modelo ligero con licencia Apache 2.0, puede integrarse en servicios de atencion al cliente o asistentes conversacionales que requieran sintesis en tiempo real sin depender de APIs externas.
- Accesibilidad web: conversion de articulos y documentos a audio para lectores de pantalla o usuarios con discapacidad visual, desplegable en servidores modestos por su reducido tamano.
- Generacion de contenido para video y podcasts: sintesis de narraciones con voces consistentes para produccion de contenido multimedia, con la ventaja de que el modelo se sirve a menos de 1 dolar por millon de caracteres segun las tarifas de mercado citadas.
- Prototipado e investigacion en TTS: al ser un modelo de pesos abiertos y arquitectura documentada (StyleTTS 2 + ISTFTNet), sirve como base para experimentacion academica y fine-tuning sobre dominios especificos.
- Despliegue en dispositivos con recursos limitados: sus 82 M de parametros y su naturaleza decoder-only permiten ejecucion en entornos con poca VRAM o incluso en CPU, algo inviable para modelos TTS de difusion de mayor tamano.
- Localizacion de contenido en ingles: generacion de voces para aplicaciones, juegos o interfaces en ingles con coste marginal practicamente nulo una vez desplegado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 82 M de parametros, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el modelo base se entreno en A100 80 GB, pero para inferencia no se requieren GPUs de datacenter; cualquier GPU consumer moderna es suficiente.
- Cabe en consumer GPU: si, practicamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: el paquete oficial `kokoro` (pip) con la libreria `misaki` para G2P y `espeak-ng` como dependencia del sistema; el modelo base dispone de demo en Hugging Face Spaces.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor declara que es "significativamente mas rapido" que modelos mayores, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kokoro-82M (esta ficha) | 82 M | en (base: multiples) | Apache 2.0 | no disponible | TTS ligero, decoder only, 24 kHz |
| StyleTTS 2 (yl4579) | no disponible | en | no disponible | pesos PyTorch | Arquitectura base del modelo; referencia academica |
| Modelos TTS cerrados de grandes proveedores | no disponible | multiples | propietaria | API | Usados como fuente de audio sintetico en el entrenamiento |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en TTS; no realiza generacion de texto, razonamiento ni otras tareas.
- Esta ficha declara soporte unicamente para ingles, aunque el modelo base declara multiples idiomas; conviene verificar el soporte real de idiomas antes de desplegar en produccion.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o en textos con fonetica compleja.
- Dependencia de `espeak-ng` y de la libreria `misaki` para la conversion texto a fonemas, lo que anade dependencias del sistema al despliegue.
- El modelo fue entrenado con audio permisivo y sintetico de proveedores cerrados; no se detallan los sesgos de voz (genero, acento, edad) presentes en el dataset.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte de sitios web fraudulentos que usan el nombre "kokoro" en su dominio y no estan afiliados al proyecto original.
- Esta ficha es un fork de nokkela-ai sin descargas ni validacion de la comunidad en el momento de la consulta; se recomienda contrastar con el modelo base hexgrad/Kokoro-82M antes de usarlo en produccion.
- No se han publicado datos de benchmarks ni de latencia/throughput en la informacion disponible.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/nokkela-ai/Kokoro-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- GitHub oficial: https://github.com/hexgrad/kokoro
- Demo en Hugging Face Spaces: https://hf.co/spaces/hexgrad/Kokoro-TTS
- Paper StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper ISTFTNet: https://arxiv.org/abs/2203.02395
- Repositorio StyleTTS2 (yl4579): https://github.com/yl4579/StyleTTS2
- Libreria misaki (G2P): https://github.com/hexgrad/misaki
- Paquete misaki en PyPI: https://pypi.org/project/misaki/
- EVAL.md del modelo base: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md
- SAMPLES.md del modelo base: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md
- VOICES.md del modelo base: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Precios de referencia (ArtificialAnalysis): https://artificialanalysis.ai/text-to-speech/model-family/kokoro#price
- Despliegue en DeepInfra: https://deepinfra.com/hexgrad/Kokoro-82M

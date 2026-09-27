# Dezheen89/cosyvoice

## Resumen

`Dezheen89/cosyvoice` es un repositorio auxiliar publicado en HuggingFace que acompaña a un ajuste fino del modelo CosyVoice para sintesis de voz en kurdo badini (etiqueta de idioma `kmr`). Es importante precisar que este repositorio no contiene los pesos del modelo: segun la propia model card, los pesos residen en el repositorio [`computeram/cosyvoice3-badini-tts`](https://huggingface.co/computeram/cosyvoice3-badini-tts). Lo que si incluye son los ficheros necesarios para la inferencia: una grabacion de referencia real en badini (`prompt-hayfa.wav`, de aproximadamente 4,7 segundos), su transcripcion exacta (`prompt-hayfa.txt`) y un script `infer.py` que carga los pesos y sintetiza voz en esa misma voz.

El modelo se presenta como CosyVoice3, un sistema de clonacion de voz zero-shot: cada generacion requiere un clip de referencia corto y su transcripcion literal. Por tanto, no es un TTS clasico de voz fija, sino un sistema que condiciona la sintesis sobre un hablante de referencia aportado por el usuario. El autor del repositorio es Dezheen89, y el pipeline declarado en HuggingFace es `text-to-speech`, con licencia Apache 2.0.

Su relevancia es doble. Por un lado, cubre el badini (kurmanji del norte, `kmr`), una variedad con muy pocos recursos publicos de sintesis de voz de calidad. Por otro, ejemplifica el flujo de trabajo de la familia CosyVoice: clonar los repositorios oficiales, instalar dependencias y ejecutar inferencia con un prompt de audio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano declarado de 0,0 GB, coherente con que solo aloja los ficheros de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia CosyVoice: transformer autorregresivo de generacion de tokens de voz, modelo de difusion con flow matching (ODE) para reconstruir el espectro Mel y vocoder basado en HiFTGAN. No confirmado especificamente para este ajuste fino |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kmr (kurdo kurmanji, variante badini) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos no estan en este repositorio; se alojan en `computeram/cosyvoice3-badini-tts`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura concreta de este ajuste fino. La model card lo identifica como un fine-tune de CosyVoice3 para badini con capacidad de clonacion de voz zero-shot, condicionada por un clip de referencia de unos 4,7 segundos y su transcripcion exacta. No se publican numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de alineamiento como RLHF o DPO.

Como referencia de la familia, la documentacion publica de CosyVoice describe un sistema compuesto por un transformer autorregresivo que genera los tokens de voz correspondientes al texto, un modelo de difusion basado en flow matching (resolucion de una EDO) que reconstruye el espectro Mel a partir de esos tokens, y un vocoder HiFTGAN que sintetiza la forma de onda final. La version 2.0 de la familia incorpora modelado conjunto offline y streaming con sintesis bidireccional. Estos detalles corresponden a la familia CosyVoice en general y no se han confirmado para esta variante concreta.

## Capacidades

- Sintesis de voz (text-to-speech) en kurdo badini (`kmr`).
- Clonacion de voz zero-shot: la generacion se condiciona con un clip de referencia corto y su transcripcion exacta.
- Uso de voces alternativas: el script permite pasar `--prompt-wav` y `--prompt-text-file` para clonar otro hablante, siempre que se aporte el audio y la transcripcion literal.
- Inferencia mediante script de linea de comandos (`infer.py`) sobre el repositorio oficial de CosyVoice clonado con submodulos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de sintesis de voz).
- Capacidades multilingues: no disponible; el unico idioma declarado es `kmr`.
- Capacidades especiales (thinking mode, vision, audio de entrada): no disponible.

## Casos de uso

- Radiodifusion y medios locales en badini: el modelo permite generar locuciones en kurdo badini a partir de texto, partiendo de una voz de referencia real, lo que facilita producir boletines o piezas informativas sin depender de una locucion grabada.
- Doblaje y localizacion de contenido audiovisual: dado que acepta cualquier par de audio y transcripcion como prompt, se puede mantener una voz coherente a lo largo de un proyecto de doblaje al badini usando siempre el mismo clip de referencia.
- Audiolibros y lectura asistida: conversion de texto largo a audio en badini con una voz concreta, util para bibliotecas digitales y materiales de lectura accesible en una variedad con poca oferta de TTS comercial.
- Preservacion linguistica y corpus de investigacion: generacion de muestras de voz sintetica controlada para estudios foneticos, comparativas de inteligibilidad o aumentacion de datos en una lengua de bajos recursos.
- Sistemas de atencion telefonica e IVR en badini: integracion del script de inferencia en un servicio que sintetice respuestas habladas en kurdo badini para consultas automatizadas, reutilizando una voz institucional fija.
- Material didactico para aprendizaje del badini: produccion de ejercicios de escucha y pronunciacion con voces concretas, aprovechando que la clonacion zero-shot solo exige unos segundos de audio de referencia.
- Accesibilidad para personas con perdida de voz: clonacion de la voz de un hablante a partir de una grabacion breve, siempre con consentimiento explicito del titular de la voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de sintesis (MOS, similitud de hablante, WER), ni comparativas objetivas con otros sistemas TTS para badini. Tampoco se declaran latencias ni throughput para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este ajuste fino; no se publican requisitos de memoria en la model card.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada. A modo de referencia de la familia, los resultados de busqueda mencionan variantes CosyVoice2-0.5B y CosyVoice-300M, tamanos que en la familia suelen desplegarse en GPU de gama consumer, pero no hay datos especificos para los pesos de `computeram/cosyvoice3-badini-tts`.
- Opciones de despliegue: el flujo documentado consiste en clonar `https://github.com/FunAudioLLM/CosyVoice.git` con submodulos, instalar `requirements.txt` y `huggingface_hub`, y ejecutar `infer.py`. No se documentan integraciones con vLLM, TGI, Ollama o llama.cpp para este modelo.
- Latencia y throughput: no disponible. Como referencia de la familia, la documentacion de CosyVoice 2.0 declara una latencia de primer paquete de 150 ms en modo streaming, dato que no se puede extrapolar a este ajuste fino.
- Almacenamiento: el repositorio ocupa 0,0 GB porque solo contiene el audio de referencia, su transcripcion y el script; los pesos deben descargarse aparte.

## Comparativa con modelos similares

Los unicos datos de comparacion disponibles provienen de la propia familia CosyVoice, y no incluyen resultados de evaluacion para el badini. La comparacion se limita, por tanto, a caracteristicas declaradas.

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Dezheen89/cosyvoice` (ajuste fino badini) | no disponible | kmr (badini) | no disponible | Apache 2.0 | Repositorio de uso con 0 descargas; pesos en `computeram/cosyvoice3-badini-tts` |
| CosyVoice2-0.5B | 0,5B | Multilingue (segun documentacion de la familia) | no disponible | no disponible en la informacion recogida | Pesos publicos descargables segun los repositorios de la familia |
| CosyVoice-300M | 300M | Multilingue (segun documentacion de la familia) | no disponible | no disponible en la informacion recogida | Variantes 300M, 300M-SFT y 300M-Instruct descargables |

No se dispone de datos de rendimiento comparativo (MOS, similitud de hablante o WER) entre estas opciones.

## Limitaciones y advertencias

- Este repositorio no contiene los pesos del modelo. Sin descargar `computeram/cosyvoice3-badini-tts`, el script `infer.py` no puede funcionar.
- La clonacion es zero-shot condicionada: cada generacion exige un clip de referencia y su transcripcion exacta. Una transcripcion incorrecta degrada la calidad de la sintesis.
- El unico idioma declarado es `kmr` (badini). No hay evidencia de soporte para otros idiomas o variedades del kurdo.
- No se publican benchmarks, por lo que no es posible cuantificar la calidad de la sintesis ni la similitud con el hablante de referencia.
- No se documentan sesgos del modelo. En TTS, los principales riesgos son la reproduccion de acentos o caracteristicas del hablante de referencia y la cobertura desigual de registros y vocabulario del badini.
- Riesgo de suplantacion de voz: la clonacion zero-shot puede emplearse para imitar a una persona concreta. Es imprescindible obtener consentimiento explicito y cumplir la normativa aplicable sobre sintesis de voz y datos personales.
- La licencia del repositorio es Apache 2.0, lo que en principio permite uso comercial, pero esa licencia cubre los ficheros de este repositorio, no necesariamente los pesos alojados en el otro repositorio ni el modelo base; conviene verificar la licencia de `computeram/cosyvoice3-badini-tts` y de CosyVoice3 antes de un despliegue en produccion.
- Un ajuste fino sobre una unica grabacion de referencia puede presentar menor robustez ante textos largos, prestamos linguisticos o dominios alejados del material de entrenamiento, aunque esto no se cuantifica en la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dezheen89/cosyvoice
- Pesos del ajuste fino: https://huggingface.co/computeram/cosyvoice3-badini-tts
- Repositorio oficial de CosyVoice (usado en las instrucciones): https://github.com/FunAudioLLM/CosyVoice
- Pagina de la familia CosyVoice: https://cosyvoice.github.io/
- Documentacion de CosyVoice 2.0: https://fun-audio-llm.github.io/cosyvoice2/
- Sitio divulgativo de CosyVoice: https://cosyvoice.org/
- Repositorio CosyVoice de QwenAudio: https://github.com/QwenAudio/CosyVoice
- Repositorio CosyVoice2 de Render-AI-Team: https://github.com/Render-AI-Team/CosyVoice2

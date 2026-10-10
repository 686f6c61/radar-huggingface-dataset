# aoiandroid/whisper-medium.en

## Resumen

`aoiandroid/whisper-medium.en` es un espejo (mirror) sin modificaciones del modelo `openai/whisper-medium.en` de OpenAI, fijado al commit `2e98eb6279edf5095af0c8dedb36bdec0acd172b`. El autor lo mantiene para que su aplicacion Cription no dependa de un repositorio de terceros. No se trata de un modelo nuevo ni de un fine-tuning: es una copia del original con el mismo contenido en los ficheros que incluye.

Whisper es un sistema de reconocimiento automatico del habla (ASR) y traduccion de voz basado en una arquitectura transformer encoder-decoder. La variante `medium.en` es la version de 769 millones de parametros especializada exclusivamente en ingles (el sufijo `.en` desactiva la capacidad multilingue y usa un tokenizador reducido). Esta pensada para transcripcion de audio de hasta 30 segundos por ventana, con capacidad de segmentacion temporal.

Un dato critico de este repositorio concreto: segun la model card, el espejo contiene unicamente 10 ficheros y 3,9 MB en total (solo los ficheros que la aplicacion usa), por lo que no incluye los pesos completos del modelo. Para usarlo realmente hay que obtener los pesos del repositorio original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR |
| Parametros totales | 769 millones (variante medium), segun el modelo original |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (modelo original); no disponible en la informacion del espejo |
| Tipos de cuantizacion | no disponible en este repositorio (no incluye pesos); el original se distribuye en fp32/fp16 |
| Idiomas soportados | Ingles (variante `.en`, solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible en este espejo (solo 10 ficheros, 3,9 MB); el repositorio original usa safetensors/PyTorch |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper: un transformer encoder-decoder que procesa espectrogramas log-Mel de 80 canales extraidos de fragmentos de audio de 30 segundos, con una convolucion inicial de dos capas y codificacion posicional sinusoidal. La variante `medium` cuenta con 24 capas de encoder y 24 de decoder, con un modelo de embedding de dimension 1024 y 16 cabezas de atencion. La salida se genera de forma autorregresiva con tokens de control que permiten tareas como transcripcion, traduccion y deteccion de idioma (aunque en la variante `.en` la capacidad multilingue se limita al ingles).

Segun la informacion disponible sobre el modelo original, Whisper se entreno mediante aprendizaje debilmente supervisado sobre un gran corpus de audio etiquetado; para la variante `medium.en` se empleo el subconjunto en ingles. Este espejo no aporta informacion adicional sobre el dataset, el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO, por lo que esos datos se consideran no disponibles en esta ficha.

## Capacidades

- Reconocimiento automatico del habla en ingles (transcripcion de audio a texto).
- Segmentacion temporal con marcas de tiempo por palabra o por segmento.
- Deteccion de actividad de voz y manejo de audio con ruido de fondo o acentos variados (caracteristica del modelo original).
- Transcripcion de audio de hasta 30 segundos por ventana; audios mas largos requieren troceado o estrategias de ventana deslizante.
- No soporta traduccion a otros idiomas en esta variante (solo ingles).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de ASR, no conversacional).
- Capacidades multilingues: no (variante `.en`).
- Capacidades especiales (vision, audio de entrada): entrada de audio; sin vision. Modo de razonamiento: no aplica.

## Casos de uso

- Transcripcion de reuniones y entrevistas en ingles: el modelo convierte el audio en texto con marcas de tiempo, util para generar actas o subtitulos automaticos, siempre que el audio se trocee en ventanas de 30 segundos.
- Generacion de subtitulos para video: dada su salida con timestamps, se puede integrar en un pipeline que produce ficheros SRT/VTT para contenido en ingles.
- Busqueda y indexacion de contenido hablado: transcribir podcasts o grabaciones para hacerlas buscables en texto.
- Asistentes de voz en ingles: como etapa de ASR dentro de un sistema mayor que luego pase el texto a un LLM para generar respuestas.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en contenidos en ingles.
- Analitica de centros de llamadas: transcripcion de conversaciones en ingles para su analisis posterior (sentimiento, temas, cumplimiento).
- Integracion en la aplicacion Cription: este es el proposito declarado del espejo, evitar dependencia de repositorios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del espejo no incluye metricas (WER, MMLU, HumanEval, etc.) y los resultados de busqueda web proporcionados no contienen datos tecnicos relevantes. Para cifras de referencia habria que consultar el paper original de Whisper o la model card del repositorio `openai/whisper-medium.en`, que no forman parte de la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en el tamano del modelo original, 769M parametros): aproximadamente 1,5-2 GB en fp16, unos 3 GB en fp32, y menos de 1 GB con cuantizacion int8.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; se beneficia de tensor cores (RTX 3060/4060 o superiores, A100, H100) para mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer con 4 GB o mas (GTX 1650, RTX 3050 y superiores). Tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: transformers (Hugging Face), whisper.cpp (GGUF/ggml), faster-whisper (CTranslate2), vLLM no es el enfoque habitual para Whisper, Ollama no soporta Whisper de forma nativa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Advertencia: este repositorio concreto no contiene los pesos, por lo que no puede ejecutarse directamente sin descargarlos del origen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-medium.en (este) | 769 M | 30 s por ventana | Ingles | apache-2.0 | Espejo parcial (sin pesos) |
| openai/whisper-small.en | 244 M | 30 s por ventana | Ingles | apache-2.0 | Repositorio original completo |
| openai/whisper-large-v3 | 1550 M | 30 s por ventana | Multilingue | apache-2.0 | Repositorio original completo |
| wav2vec2 / otros ASR | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de rendimiento comparado (WER u otras metricas) no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, contexto e idiomas.

## Limitaciones y advertencias

- El espejo no incluye los pesos del modelo (solo 10 ficheros, 3,9 MB), por lo que no es utilizable directamente para inferencia sin descargarlos del repositorio original.
- La variante `.en` solo procesa ingles; cualquier audio en otro idioma producira resultados incorrectos o vacios.
- Ventana de audio limitada a 30 segundos por segmento; audios mas largos requieren troceado manual o estrategias de ventana deslizante.
- Riesgo de alucinacion en segmentos de silencio, ruido o audio poco claro, comportamiento documentado en la familia Whisper (no especifico de este espejo).
- Sesgos conocidos: no disponibles en la informacion proporcionada; el modelo original esta entrenado sobre datos web de dominio mixto.
- Licencia apache-2.0, que permite uso comercial, pero todos los derechos y creditos pertenecen a los autores originales (OpenAI).
- Al ser un espejo mantenido por un tercero, la trazabilidad y las actualizaciones dependen del autor del repositorio (`aoiandroid`); fijado a un commit concreto, no recibe mejoras.
- 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Repositorio creado y actualizado con dos segundos de diferencia, lo que sugiere un uso interno mas que un proyecto mantenido publicamente.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/aoiandroid/whisper-medium.en
- Modelo original: https://huggingface.co/openai/whisper-medium.en
- Commit del codigo fuente: https://huggingface.co/openai/whisper-medium.en/tree/2e98eb6279edf5095af0c8dedb36bdec0acd172b
- Paper de Whisper (Radford et al.): no disponible en la informacion proporcionada
- Repositorio de codigo whisper.cpp: no disponible en la informacion proporcionada
- Demos u otros recursos: no disponibles en la informacion proporcionada

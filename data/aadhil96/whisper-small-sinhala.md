# Aadhil96/whisper-small-sinhala

## Resumen

Whisper-small-sinhala es un ajuste fino del modelo de reconocimiento automatico del habla `openai/whisper-small` de OpenAI, especializado en la transcripcion de sinhala (cingales), idioma oficial de Sri Lanka hablado por unos 17 millones de personas. Lo desarrolla Aadhil96 (Aadhil Imam) y se publica en Hugging Face bajo licencia CC BY-SA 4.0, heredada del corpus de entrenamiento OpenSLR SLR52.

El modelo resuelve un problema concreto: los Whisper originales de OpenAI no estan entrenados para sinhala y fallan de forma catastrofica en este idioma, generando bucles de repeticion con tasas de error superiores al 300 %. Este ajuste fino reduce el CER al 9,13 % y el WER al 36,47 % sobre un conjunto de test de 3.000 clips de hablantes no vistos en entrenamiento, eliminando por completo los fallos por desbocamiento de salida.

Arquitectonicamente es un transformer encoder-decoder identico a Whisper-small, con 241,7 millones de parametros y una ventana de contexto de audio de 30 segundos. Su relevancia radica en que cubre un idioma de bajos recursos con un modelo pequeno y desplegable en hardware modesto (se entreno en una sola NVIDIA T4), lo que lo hace accesible para aplicaciones de transcripcion en produccion sin necesidad de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (chunk_length_s=30) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sinhala (si) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con 241,7 millones de parametros disenado originalmente por OpenAI para transcripcion y traduccion multilingue. El ajuste fino se realizo durante 6.000 pasos con un tamano de batch de 16, tasa de aprendizaje de 1e-5 y precision mixta, sobre una unica GPU NVIDIA T4. La seleccion del checkpoint se hizo por el menor CER sobre un conjunto de validacion de 1.000 clips.

Los datos de entrenamiento provienen del corpus OpenSLR SLR52 (Large Sinhala ASR corpus), con aproximadamente 185.000 enunciados. Tras el filtrado se conservaron 178.378 clips (194,7 horas) de 432 hablantes para entrenamiento; se descartaron clips de mas de 20 segundos y 6.865 clips por problemas de coincidencia y normalizacion de transcripciones no investigados. La particion se hizo por hablante para evitar fuga de datos: 23 hablantes en validacion y 23 en test, ninguno presente en entrenamiento. Las transcripciones se normalizaron a Unicode NFC y se elimino todo lo ajeno al bloque sinhala (digitos, texto latino, puntuacion), conservando los zero-width joiners necesarios para las conjunciones del sinhala. No se menciona uso de RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en sinhala (script sinhala unicamente).
- Reconocimiento automatico del habla sobre clips de hasta 20 segundos de duracion.
- Procesamiento de audio a 16 kHz mono via pipeline de transformers.
- Soporte de decodificacion por chunks de 30 segundos (`chunk_length_s=30`).
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento, vision ni audio mas alla de la transcripcion.
- No soporta otros idiomas distintos del sinhala.
- No genera digitos, texto latino ni puntuacion en la salida.

## Casos de uso

- Transcripcion de reuniones y entrevistas en sinhala: el modelo procesa audio de hasta 30 segundos por chunk y permite concatenar para grabaciones largas, adecuado para actas y documentacion en organizaciones de Sri Lanka.
- Subtitulado automatico de contenido audiovisual: integrable en pipelines que segmenten el audio en clips cortos y generen subtitulos en script sinhala para videos educativos o institucionales.
- Digitalizacion de archivos orales: transcripcion de grabaciones historicas o entrevistas etnograficas en sinhala, con la advertencia de que no se ha evaluado en audio ruidoso.
- Asistentes de voz para atencion ciudadana: transcripcion de consultas telefonicas o presenciales en sinhala para su posterior procesamiento, aunque el modelo no se ha probado en llamadas telefonicas.
- Investigacion linguistica y NLP de bajos recursos: generacion de transcripciones para construir corpus anotados en sinhala, aprovechando que el modelo funciona en una sola GPU T4.
- Accesibilidad: conversion de notas de voz a texto para personas con dificultades auditivas en entornos de habla sinhala.
- Prototipado rapido en aplicaciones moviles o edge: al ser un modelo de 241,7 M de parametros, puede desplegarse en infraestructura modesta para demos y validacion de producto.

## Benchmarks y rendimiento

Evaluacion sobre 3.000 clips de test de hablantes no vistos en entrenamiento, decodificacion greedy, sin zero-width joiners en la puntuacion:

| Modelo | WER | CER | CER mediano por clip | Salidas desbocadas* |
|---|---|---|---|---|
| Whisper-small-sinhala (este modelo) | 36,47 % | 9,13 % | 6,67 % | 0 |
| whisper-large-v3 sin modificar | 340,41 % | 327,51 % | 94,44 % | 938 |
| whisper-small sin modificar | 444,67 % | 744,62 % | 806,90 % | 2.636 |

*Salida de mas de 3 veces la longitud de la referencia, normalmente por bucle de repeticion.

Intervalo de confianza del 95 % para el WER de este modelo por bootstrap: 35,4 % a 37,6 %. La incertidumbre real es mayor porque el test solo tiene 23 hablantes. Advertencia del autor: 2.125 de las 3.000 frases de test (71 %) tambien aparecen en entrenamiento dichas por otras personas, por lo que el rendimiento en frases nuevas sera probablemente peor y no se ha medido por separado. Los baselines se ejecutaron sin los ajustes de fallback de Whisper para escapar de bucles de repeticion, lo que infla sus errores y no permite leer la tabla como una mejora real frente a ellos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241,7 M de parametros); en fp16, unos 0,5 GB.
- VRAM total recomendada: 2-4 GB incluyendo activaciones y buffers de audio.
- GPU recomendadas: NVIDIA T4 (la usada en entrenamiento), RTX 3060, RTX 4090, A100, H100.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM; tambien puede ejecutarse en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica (es ASR), llama.cpp no soporta Whisper de forma nativa, TGI no es la via habitual para Whisper; la opcion documentada es transformers con `chunk_length_s=30`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Rendimiento en sinhala |
|---|---|---|---|---|---|
| Whisper-small-sinhala (este) | 241,7 M | 30 s | si | CC BY-SA 4.0 | WER 36,47 %, CER 9,13 % |
| openai/whisper-small | 241,7 M | 30 s | multilingue (99) | Apache 2.0 | WER 444,67 %, CER 744,62 % (con bucles) |
| openai/whisper-large-v3 | 1.550 M | 30 s | multilingue (99) | Apache 2.0 | WER 340,41 %, CER 327,51 % (con bucles) |

No se dispone de informacion sobre otros ajustes finos de Whisper para sinhala con los que comparar directamente. Las cifras de los modelos base no son una comparacion limpia porque se ejecutaron sin los ajustes de fallback habituales.

## Limitaciones y advertencias

- Solo genera script sinhala; no produce digitos, texto latino ni puntuacion.
- Entrenado con clips de hasta 20 segundos; no probado en audio ruidoso, llamadas telefonicas ni code-switching intenso con ingles.
- No evaluado por dialectos ni grupos de hablantes.
- Riesgo de alucinacion y bucles de repeticion en audio fuera de dominio, aunque en el test no se observaron salidas desbocadas.
- El 71 % de las frases de test aparecen en entrenamiento con otros hablantes; el rendimiento en frases nuevas es probablemente peor y no se ha medido.
- Sesgos desconocidos: no se ha analizado el comportamiento por genero, edad o region de los hablantes.
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir; revisar compatibilidad si se integra en productos propietarios.
- El modelo base `openai/whisper-small` es Apache 2.0, pero la licencia del ajuste final es CC BY-SA 4.0 por derivar del corpus SLR52.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aadhil96/whisper-small-sinhala
- Modelo base: https://huggingface.co/openai/whisper-small
- Corpus OpenSLR SLR52: https://www.openslr.org/52/
- Demo Gradio en Kaggle: https://www.kaggle.com/code/aadhilimam/sinhala-speech-to-text-gradio-demo
- Paper del corpus (Kjartansson et al., SLTU 2018): no disponible como enlace directo en la informacion proporcionada

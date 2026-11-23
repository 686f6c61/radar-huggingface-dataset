# mradermacher/ultravox-v0_6-qwen-3-32b-arabic-GGUF

## Resumen

Ultravox v0.6 Qwen 3 32B Arabic es un modelo de lenguaje y voz (speech-LLM) multimodal que combina un encoder de audio con el modelo de lenguaje Qwen 3 de 32.000 millones de parametros, adaptado especificamente al arabe estandar y a dialectos arabes. Lo desarrolla ISTNetworks a partir de la familia Ultravox, un proyecto de modelos de voz abiertos que proyecta representaciones de audio al espacio de embeddings del LLM para permitir conversaciones habladas de forma nativa, sin pipeline ASR-then-LLM separado. La version aqui descrita es la cuantizacion GGUF realizada por mradermacher, pensada para inferencia local y despliegue con llama.cpp.

El modelo resuelve el problema de la conversacion de voz en arabe con un unico modelo end-to-end: recibe audio y texto y genera respuestas de texto, manteniendo el conocimiento y la capacidad de razonamiento del LLM subyacente. Es relevante porque el soporte de voz de calidad para arabe y, en particular, para dialectos arabes, es escaso en el ecosistema abierto, y porque las cuantizaciones GGUF permiten ejecutarlo en hardware de consumo con perdida de calidad controlada.

Con 32.762.123.264 parametros totales y un repo de 226,1 GB que incluye 12 variantes de cuantizacion mas los ficheros mmproj (proyector multimodal), el modelo esta licenciado bajo MIT, lo que facilita su uso comercial. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-LLM multimodal (encoder de audio + LLM Qwen 3 32B); detalles del encoder no disponibles |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | arabe (incluye dialectal) e ingles |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo original en safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno Ultravox: un encoder de audio transforma la senal de voz en embeddings que se proyectan al espacio de entrada del LLM mediante un adaptador multimodal (el fichero mmproj en las cuantizaciones GGUF). El LLM base es Qwen 3 de 32B, un transformer denso con el que el modelo hereda capacidades de razonamiento, generacion de texto y multilingueismo. El resultado es un modelo que procesa audio y texto de forma conjunta y responde en texto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas del adaptador de audio en la informacion proporcionada. La model card de la cuantizacion es una plantilla generica de mradermacher y no incluye detalles del entrenamiento original; para ello habria que consultar el repositorio del modelo base ISTNetworks/ultravox-v0_6-qwen-3-32b-arabic.

## Capacidades

- Comprension de audio y voz: procesa entrada de audio directamente mediante el proyector multimodal, sin necesidad de un ASR externo.
- Conversacion multimodal audio-texto: responde en texto a preguntas formuladas por voz o por escrito.
- Arabe estandar y dialectal: el modelo esta adaptado explicitamente a dialectos arabes, ademas de arabe estandar.
- Ingles: soporte declarado como segundo idioma.
- Razonamiento y generacion de texto: hereda las capacidades del LLM Qwen 3 32B.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Modo thinking, vision o audio de salida: no disponibles; la salida es texto.

## Casos de uso

- Atencion al cliente por voz en arabe: el modelo puede recibir la locucion del usuario como audio y generar la respuesta textual para un TTS posterior, cubriendo tanto arabe estandar como variantes dialectales, lo que reduce la friccion en mercados del Golfo y del Magreb.
- Transcripcion y comprension de llamadas: integrado en un pipeline que alimente audio de centros de contacto, permite resumir, clasificar y extraer informacion de conversaciones telefonicas en arabe sin depender de un ASR comercial.
- Asistentes de voz para dispositivos: al disponer de cuantizaciones Q4_K_M de 19,9 GB, puede desplegarse en estaciones de trabajo con GPU de consumo para prototipos de asistente por voz en arabe.
- Investigacion en speech-LLM para arabe: sirve como base para fine-tuning en tareas de voz (clasificacion de emociones, diarizacion asistida, QA sobre audio) gracias a su licencia MIT y a la disponibilidad de pesos GGUF para experimentacion rapida.
- Accesibilidad: conversion de contenido hablado en arabe a texto comprensible y respuestas generadas, util para subtitulado asistido o resumenes de reuniones.
- Evaluacion comparativa de dialectos: permite medir la robustez del modelo frente a distintas variedades del arabe en tareas de comprension, usando las cuantizaciones Q8_0 para minimizar el impacto de la cuantizacion en los resultados.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten ejecutar el modelo en GPUs de 16 GB, a costa de degradar la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas overhead. Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q4_K_S ~18,9 GB; Q4_K_M ~19,9 GB; Q5_K_M ~23,3 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB. Anadir ~0,8 GB (mmproj Q8_0) o ~1,5 GB (mmproj f16) para la parte multimodal.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y f16 sin compromisos; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090/4080 (24/16 GB) para Q4 y Q3 respectivamente.
- Cabe en GPU de consumo: si. Q4_K_M en RTX 4090 o 3090; Q3_K_S y Q2_K en GPUs de 16 GB; Q2_K podria ejecutarse con offload parcial en GPUs de 12 GB, con latencia mayor.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python) para las cuantizaciones GGUF; vLLM y TGI para el modelo original en safetensors. El soporte de entrada de audio en llama.cpp debe verificarse con la version concreta, ya que la integracion de mmproj para Ultravox puede requerir builds especificos.
- Latencia y throughput estimados: no disponibles. Al ser un modelo denso de 32B, el throughput dependera linealmente del ancho de banda de memoria de la GPU y del tipo de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ultravox-v0_6-qwen-3-32b-arabic (este) | 32,76 B | no disponible | ar, en | MIT | GGUF, safetensors |
| Ultravox v0.6 Qwen 3 32B (base, sin adaptacion arabe) | ~32 B | no disponible | principalmente en | no disponible en esta ficha | safetensors |
| Qwen 3 32B (LLM base, solo texto) | ~32 B | no disponible en esta ficha | multilingue | no disponible en esta ficha | safetensors, GGUF |
| Whisper large-v3 + LLM (pipeline ASR + texto) | ~1,5 B + LLM | depende del LLM | multilingue, incluye ar | MIT / Apache 2.0 segun componente | safetensors, GGUF |

La comparacion con alternativas de la misma categoria (speech-LLM en arabe) no esta disponible en la informacion proporcionada. La ventaja principal de este modelo frente a un pipeline ASR + LLM es la integracion end-to-end, que evita la perdida de informacion paralinguistica y reduce la latencia total; su desventaja es la menor madurez del ecosistema de herramientas para audio en llama.cpp frente a Whisper.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos arabes y en ingles, es esperable un sesgo hacia esas variedades linguisticas y una cobertura desigual entre dialectos.
- Riesgo de alucinacion: inherente a los LLM de 32B, especialmente en tareas de transcripcion literal o cuando el audio es ruidoso o de baja calidad; el modelo genera texto plausible aunque no haya comprendido bien el audio.
- Limitaciones de idioma: solo se declaran arabe e ingles; el rendimiento en otras lenguas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica; para audios largos conviene segmentar y verificar el comportamiento real.
- Cuantizacion: las variantes Q2_K y Q3 degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior, y Q8_0 si la VRAM lo permite. Los quants con imatrix no estaban disponibles en el momento de la publicacion.
- Soporte de audio en llama.cpp: la integracion del mmproj de Ultravox puede no estar soportada en todas las versiones; verificar antes de desplegar.
- Licencia: MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas aqui.
- Fecha de creacion inusual (2026) en los metadatos: verificar la procedencia y el estado de mantenimiento del repositorio antes de adoptarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ultravox-v0_6-qwen-3-32b-arabic-GGUF
- Modelo base: https://huggingface.co/ISTNetworks/ultravox-v0_6-qwen-3-32b-arabic
- Pagina de descargas del autor: https://hf.tst.eu/model#ultravox-v0_6-qwen-3-32b-arabic-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

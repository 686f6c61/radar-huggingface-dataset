# aisha-org/sado-asr-v1

## Resumen

Sado ASR v1 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por la organizacion aisha-org, obtenido mediante fine-tuning de openai/whisper-large-v3 para el idioma uzbeko (`uz`). Se distribuye a traves de Hugging Face con la libreria transformers y pesos en formato safetensors, y esta etiquetado como compatible con endpoints de inferencia. El modelo cuenta con 1.543.490.560 parametros, lo que lo situa en la categoria de los modelos Whisper de gran tamano (large), y su repositorio ocupa 6,2 GB.

El problema que aborda es la cobertura limitada de lenguas de bajos recursos en los sistemas ASR genericos. Whisper large-v3, pese a su amplia cobertura multilingue, rinde de forma desigual en uzbeko; un ajuste fino especifico sobre ese idioma permite adaptar los pesos acusticos y linguisticos a las particularidades foneticas y lexicas del uzbeko. La relevancia actual del modelo radica en que ofrece una alternativa especializada para transcripcion en uzbeko sobre una arquitectura ampliamente soportada por el ecosistema (pipeline `automatic-speech-recognition` de transformers, vLLM, faster-whisper, whisper.cpp).

La informacion publica disponible es muy limitada: el modelo tiene 2 descargas y 3 likes en el momento de redactar esta ficha, el acceso es restringido (gated) y no se declara licencia ni se publican datos de entrenamiento, benchmarks ni detalles del proceso de ajuste. Por tanto, esta ficha recoge los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3, ajuste fino) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 emplea ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (`uz`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-large-v3 |
| Libreria | transformers |
| Tamano del repositorio | 6,2 GB |
| Acceso | restringido (gated) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3: un transformer encoder-decoder con atencion estandar, disenado para transcripcion de audio en ventanas de 30 segundos y con tokens de idioma y de tarea como prefijo de decodificacion. Los pesos publicados suman 1.543.490.560 parametros, coherentes con el tamano de Whisper large-v3. El ajuste fino se ha realizado sobre el checkpoint `openai/whisper-large-v3`, segun los metadatos del repositorio (`base_model:finetune:openai/whisper-large-v3`), y el resultado se distribuye en safetensors para su carga con transformers.

No se dispone de informacion publica sobre el corpus de entrenamiento (horas de audio, dominio, procedencia de las transcripciones), sobre el uso de tecnicas de aumento de datos, ni sobre si se aplicaron etapas de alineacion o correccion de timestamps. Tampoco consta informacion sobre la estrategia de congelacion de capas o el learning rate empleado en el ajuste. Todos estos datos deben considerarse "no disponible". No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion) en la informacion accesible.

## Capacidades

- Transcripcion de voz a texto en uzbeko (`uz`) a partir de audio de hasta 30 segundos por ventana, con la posibilidad de procesar audios mas largos mediante chunking en el pipeline de transformers.
- Reconocimiento de habla continua con salida de texto plano; no se documenta soporte de timestamps a nivel de palabra ni de diarizacion.
- Capacidad multilingue limitada: el modelo esta etiquetado unicamente para uzbeko, por lo que no se garantiza el rendimiento en otras lenguas aunque la arquitectura base sea multilingue.
- Integracion con el pipeline `automatic-speech-recognition` de transformers y compatibilidad declarada con endpoints de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento extendido, ya que se trata de un modelo puramente ASR.
- No se documentan capacidades de traduccion de voz, deteccion de idioma explicita ni salida de caracteristicas acusticas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en uzbeko: el modelo puede procesar grabaciones divididas en ventanas de 30 segundos y concatenar las salidas para generar actas o resumenes posteriores, aprovechando el ajuste especifico al idioma frente a Whisper generico.
- Subtitulado de contenido audiovisual: integrado en un pipeline que segmenta el audio y genera subtitulos en uzbeko para videos, cursos o material divulgativo, con la ventaja de que la arquitectura Whisper permite trabajar con audio de calidad variable.
- Atencion al cliente en centros de contacto: transcripcion de llamadas en uzbeko para analitica de calidad, busqueda de palabras clave y generacion de resumentes automaticos, usando el modelo como primer eslabon de un pipeline ASR + LLM.
- Documentacion clinica o administrativa dictada: conversion de notas de voz en uzbeko a texto para su posterior revision humana, en escenarios donde el volumen de dictado hace inviable la transcripcion manual.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos de habla uzbeka, desplegando el modelo con faster-whisper o whisper.cpp para reducir latencia.
- Investigacion linguistica y creacion de corpus: transcripcion masiva de grabaciones en uzbeko para construir corpus anotados, analisis de frecuencia lexica o entrenamiento de modelos posteriores, siempre que se respete la licencia (no disponible) y las condiciones de acceso restringido.
- Moderacion de contenido en plataformas: transcripcion de audio subido por usuarios en uzbeko para aplicar filtros de contenido, con la advertencia de que la calidad en audio ruidoso o con acentos marcados no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de WER (word error rate) sobre conjuntos como Common Voice, FLEURS u otros corpus en uzbeko, ni comparaciones con Whisper large-v3 original. Tampoco constan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 6,2 GB solo para pesos, mas memoria para activaciones y buffers de atencion; en la practica se recomienda al menos 10-12 GB de VRAM para fp32 con batches pequenos.
- En fp16/bf16: alrededor de 3,1 GB para pesos; se recomienda un minimo de 6-8 GB de VRAM para inferencia comoda con batches de 1-4.
- En cuantizacion int8 (si se aplica mediante herramientas externas, ya que el repositorio no publica variantes cuantizadas): aproximadamente 1,5-2 GB para pesos, lo que permite ejecucion en GPUs consumer de gama media.
- GPU recomendadas: NVIDIA A100 o H100 para throughput alto en produccion; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y despliegue de batches moderados; RTX 3060 de 12 GB o superiores para inferencia en fp16 con batch 1.
- Cabe en GPUs consumer: si, en modelos con 8 GB o mas de VRAM en fp16, y en GPUs con 4-6 GB si se aplica cuantizacion int8 o se usa whisper.cpp con cuantizacion GGML/GGUF.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de Hugging Face (compatibilidad declarada), faster-whisper (requiere conversion a CTranslate2), whisper.cpp (requiere conversion a GGUF), vLLM no soporta oficialmente modelos encoder-decoder tipo Whisper en todas sus versiones, por lo que debe verificarse la version concreta.
- Latencia y throughput: no disponibles. Como referencia cualitativa, Whisper large-v3 en una A100 procesa audio en tiempo real con holgura, pero no se dispone de mediciones especificas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aisha-org/sado-asr-v1 | 1.543.490.560 | ventanas de 30 s (arquitectura Whisper) | uzbeko | no disponible | gated en Hugging Face |
| openai/whisper-large-v3 | 1.550 millones aprox. | ventanas de 30 s | multilingue (99 idiomas) | MIT (modelo original) | publico en Hugging Face |
| openai/whisper-large-v3-turbo | 809 millones aprox. | ventanas de 30 s | multilingue | MIT | publico en Hugging Face |
| Modelos ASR especificos para uzbeko de otros autores | no disponible | no disponible | uzbeko | variable | variable en Hugging Face |

La comparacion directa con Whisper large-v3 es la mas relevante: sado-asr-v1 parte de ese checkpoint y anade un ajuste fino para uzbeko, pero no publica metricas que permitan cuantificar la mejora. Frente a whisper-large-v3-turbo, sado-asr-v1 tiene aproximadamente el doble de parametros y, previsiblemente, mayor coste de inferencia, aunque no hay datos de rendimiento comparado. No se dispone de informacion sobre otros modelos ASR especializados en uzbeko con los que contrastar.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos, lo que condiciona la automatizacion en pipelines de CI/CD.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con aisha-org o revisar las condiciones del gate antes de cualquier despliegue en produccion.
- Cobertura limitada a uzbeko: el modelo esta etiquetado solo para `uz`; su uso en otras lenguas puede producir transcripciones incorrectas o alucinaciones.
- Sin datos de entrenamiento ni evaluacion: no se conocen el dominio, la calidad ni el tamano del corpus de ajuste, ni el WER esperado en condiciones reales (ruido, acentos, habla espontanea).
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o audio ininteligible, especialmente en pasajes con ruido.
- Limitacion de ventana: la arquitectura Whisper procesa ventanas de 30 segundos; audios largos requieren chunking y pueden sufrir errores en las fronteras entre segmentos.
- Sin soporte documentado de timestamps a nivel de palabra ni diarizacion: para estos requisitos habria que combinar con herramientas externas (por ejemplo, forced alignment).
- Comunidad muy reducida (2 descargas, 3 likes): no hay evidencia de validacion independiente ni de casos de produccion reportados.
- Fecha de creacion futura en los metadatos (2026-03-26): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisha-org/sado-asr-v1
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Documentacion del pipeline ASR de transformers: https://huggingface.co/docs/transformers/main/en/tasks/asr

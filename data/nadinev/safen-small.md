# nadinev/safen-small

## Resumen

`safen-small` es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla `openai/whisper-small`, publicado por el usuario `nadinev` en Hugging Face. El nombre y los tags (`south-african-english`, `za-en`) sugieren que el ajuste esta orientado a mejorar la transcripcion de ingles sudafricano, una variante linguistica poco representada en los corpus de entrenamiento originales de Whisper. El modelo hereda la arquitectura encoder-decoder transformer de Whisper y sus 241,7 millones de parametros, por lo que mantiene las capacidades y limitaciones estructurales del modelo base.

El modelo resuelve el problema de la baja precision de Whisper en acentos y variantes regionales del ingles: un fine-tune sobre datos especificos de una region puede reducir la tasa de error de palabras (WER) en ese dominio concreto. Es relevante para desarrolladores que construyen pipelines de transcripcion para contenido sudafricano (podcasts, reuniones, subtitulado) y que necesitan mejor rendimiento que el que ofrece Whisper-small generico en esa variante.

La ficha se basa unicamente en los metadatos publicos disponibles. No hay informacion publicada sobre el dataset de ajuste, el proceso de entrenamiento, los hiperparametros ni los resultados de evaluacion. El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con capas de atencion estandar y convoluciones iniciales sobre el espectrograma Mel |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; Whisper-small procesa ventanas de audio de 30 segundos por segmento |
| Tipos de cuantizacion | no disponible; al ser safetensors, admite conversion a GGUF y cuantizaciones de 8 y 4 bits mediante herramientas externas |
| Idiomas soportados | en (ingles); orientado a ingles sudafricano (za-en) segun tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Tarea | automatic-speech-recognition |
| Tamano del repositorio | 5,8 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, atencion multicabeza y una proyeccion convolucional inicial que convierte el audio en una representacion de espectrograma Mel. El modelo recibe ventanas de 30 segundos y genera transcripciones autoregresivas con tokens especiales para deteccion de idioma, marcas de tiempo y transcripcion. Los 241,7 millones de parametros coinciden con la configuracion estandar de Whisper-small.

No se dispone de informacion sobre el dataset de ajuste, el numero de horas de audio utilizadas, la composicion del corpus ni si se aplicaron tecnicas como especificacion de tareas, aumento de datos o decodificacion con beam search durante la evaluacion. Tampoco hay datos sobre RLHF, DPO ni innovaciones tecnicas adicionales. Se trata, por los metadatos, de un fine-tune supervisado clasico sobre el modelo base de OpenAI.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion declarada en ingles sudafricano.
- Transcripcion con marcas de tiempo a nivel de segmento, heredadas de la arquitectura Whisper.
- Deteccion de idioma integrada (aunque el ajuste se centra en `en`).
- Traduccion de audio a texto en ingles, en la medida en que el modelo base lo soporta.
- Procesamiento de audio en ventanas de 30 segundos con contexto limitado por segmento.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales mas alla del audio de entrada y texto de salida.

## Casos de uso

- Transcripcion de podcasts y contenido audiovisual sudafricano: el ajuste sobre ingles sudafricano deberia reducir errores en acentos y vocabulario local frente a Whisper-small generico, lo que lo hace adecuado para pipelines de subtitulado automatico.
- Generacion de subtitulos para plataformas de video: las marcas de tiempo heredadas de Whisper permiten alinear los subtitulos con el audio sin postprocesado adicional.
- Actas de reuniones y entrevistas: transcripcion de audio de duracion media dividido en segmentos de 30 segundos, con salida de texto plano apta para resumen posterior.
- Indexacion y busqueda de archivos de audio: convertir grabaciones a texto para alimentar motores de busqueda o sistemas RAG sobre contenido hablado.
- Investigacion linguistica sobre variantes del ingles: corpus de transcripciones para estudios de fonetica y lexico sudafricano, con la advertencia de que no hay evaluacion publicada de su precision.
- Prototipado de asistentes de voz en ingles: integracion como etapa ASR en un pipeline de voz a texto dentro de aplicaciones de dominio limitado.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido en ingles sudafricano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de WER, MMLU, HumanEval ni de ninguna otra metrica en la ficha de Hugging Face ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1 GB para los pesos (241,7 M de parametros), mas memoria para activaciones y buffers de audio.
- En fp16: alrededor de 0,5 GB de pesos, con overhead adicional de activaciones.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia por lotes pequenos, dado el reducido tamano del modelo.
- GPU recomendadas para produccion con throughput alto: A100, H100 o L4 para servir multiples peticiones concurrentes.
- Opciones de despliegue: transformers con pipeline de ASR, vLLM (soporte limitado para encoder-decoder), TGI, faster-whisper (si se convierte a CTranslate2) y whisper.cpp (si se convierte a GGML/GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el acceso al repositorio esta restringido, por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| nadinev/safen-small | 241,7 M | ventanas de 30 s | en (za-en) | Apache 2.0 | restringido (gated) |
| openai/whisper-small | 241,7 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | abierto |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingue | Apache 2.0 | abierto |
| openai/whisper-medium | 769 M | ventanas de 30 s | multilingue | Apache 2.0 | abierto |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento de `safen-small` frente a alternativas especializadas en ingles sudafricano. El modelo base `openai/whisper-small` ofrece cobertura multilingue amplia con el mismo numero de parametros; `safen-small` sacrifica esa cobertura por una especializacion regional cuyo beneficio real no esta cuantificado publicamente.

## Limitaciones y advertencias

- No hay evaluacion publicada: se desconoce si el fine-tune mejora realmente el WER respecto a `openai/whisper-small` en ingles sudafricano.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se puede evaluar el sesgo demografico, de genero o de acento dentro del propio ingles sudafricano.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio ininteligible.
- Limitacion de contexto: procesa ventanas de 30 segundos; audios mas largos requieren segmentacion y pueden perder coherencia entre segmentos.
- Cobertura linguistica reducida: los tags indican solo `en`; no se garantiza buen rendimiento en otros idiomas ni en otras variantes del ingles.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion a la automatizacion de descargas en CI/CD.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que las condiciones del acceso gated no impongan restricciones adicionales.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nadinev/safen-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- faster-whisper (implementacion CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp (implementacion en C/C++): https://github.com/ggerganov/whisper.cpp

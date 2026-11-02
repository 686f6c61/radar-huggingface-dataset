# huggnico/whisper-tiny_to_spanish_accent_09oct

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario huggnico en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, orientado a la transcripcion de audio con acento espanol. El modelo parte de los pesos originales de Whisper tiny (37,7 millones de parametros) y se reentrena sobre el dataset denominado Spanish_english.

La relevancia de este modelo radica en su especializacion: frente al Whisper tiny generico, este ajuste busca mejorar la transcripcion de audio en espanol con acentos concretos, un escenario donde los modelos multilingues pequenos suelen degradarse. Al mantener el tamano reducido del modelo base, es apto para despliegues con recursos limitados, como CPUs o GPUs de gama baja, y para tareas de transcripcion en tiempo real o en dispositivos edge.

No obstante, se trata de un modelo experimental con escasa documentacion: la model card esta generada automaticamente y carece de descripcion de uso, composicion del dataset o limitaciones. El unico resultado declarado es un WER de 12,31 sobre el split de test del dataset Spanish_english, no verificado de forma independiente. La licencia Apache 2.0 permite uso comercial, pero la falta de validacion externa aconseja cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (segun metadatos); orientado a espanol con acentos segun el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado para tomar espectrogramas mel como entrada y generar tokens de texto. Whisper tiny es la variante mas pequena de la familia Whisper de OpenAI, con aproximadamente 39 millones de parametros en su configuracion original y una ventana de audio de 30 segundos por inferencia.

El ajuste fino se realizo con el Trainer de HuggingFace sobre el dataset Spanish_english. Los hiperparametros documentados son: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. El registro muestra dos puntos de evaluacion: en el paso 1000 (epoca 0,97) la perdida de validacion fue 0,2650 con WER de 14,03, y en el paso 2000 (epoca 1,95) la perdida bajo a 0,2462 con WER de 12,31. No se documenta el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de aumento de datos o regularizacion adicional.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del modelo.
- Especializacion en espanol con acentos: el ajuste busca mejorar la transcripcion de hablantes con acento espanol, aunque los metadatos solo declaran el idioma ingles.
- Transcripcion de audio de hasta 30 segundos por ventana, limitacion heredada de Whisper tiny.
- Ejecucion ligera: al contar con 37,7 millones de parametros, puede ejecutarse en CPU y en GPUs de gama baja.
- No dispone de soporte documentado de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.
- Capacidades multilingues limitadas: el modelo base es multilingue, pero el ajuste se orienta al espanol y los metadatos declaran solo ingles.

## Casos de uso

- Transcripcion de reuniones y notas de voz en espanol: el modelo puede convertir grabaciones cortas (hasta 30 segundos por fragmento) en texto, adecuado para actas automaticas o busqueda en audio en entornos con recursos limitados.
- Subtitulado automatico de videos en espanol: integrado en un pipeline que segmenta el audio en ventanas de 30 segundos, permite generar subtitulos con un coste computacional bajo, aunque la precision sera inferior a la de variantes mayores de Whisper.
- Prototipado rapido de aplicaciones de voz: su tamano reducido permite iterar en local o en CPU durante el desarrollo de asistentes de voz o interfaces habladas antes de migrar a modelos mayores.
- Transcripcion en dispositivos edge: al caber en memoria de sistemas embebidos y CPUs modestas, puede desplegarse en dispositivos con recursos restringidos para dictado o comandos de voz.
- Normalizacion de audio para datasets: util para transcribir grandes volumenes de audio de forma economica en la fase de etiquetado o limpieza de corpus.
- Evaluacion de acentos regionales: como modelo especializado en acento espanol, sirve para comparar el rendimiento de variantes de Whisper sobre hablantes de distintas regiones.
- Investigacion en ajuste fino de ASR: el modelo y sus hiperparametros documentados sirven como referencia para experimentos de fine-tuning de Whisper tiny sobre datasets propios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Spanish (huggnico) | Spanish English | test | WER | 12,31 |
| Whisper tiny Spanish (huggnico) | Spanish English | validacion (paso 1000) | WER | 14,03 |
| Whisper tiny Spanish (huggnico) | Spanish English | validacion (paso 2000) | WER | 12,31 |
| Whisper tiny Spanish (huggnico) | Spanish English | validacion (paso 2000) | Loss | 0,2462 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni mediciones sobre benchmarks estandar de ASR como Common Voice o LibriSpeech.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 150 MB de pesos, mas overhead de activaciones y del framework; en la practica, menos de 1 GB.
- VRAM estimada en FP16: alrededor de 75 MB de pesos, con overhead adicional del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, T4, A100 o H100, aunque el modelo no aprovechara la capacidad de estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas.
- Ejecucion en CPU: viable para transcripcion por lotes o en tiempo casi real con audio corto.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), y en principio compatible con runtimes que acepten pesos safetensors de Whisper; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| Whisper tiny Spanish (huggnico) | 37,7 M | 30 s por ventana | apache-2.0 | HuggingFace |
| openai/whisper-tiny | ~39 M | 30 s por ventana | apache-2.0 | HuggingFace |
| openai/whisper-base | ~74 M | 30 s por ventana | apache-2.0 | HuggingFace |
| openai/whisper-small | ~244 M | 30 s por ventana | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; el unico dato disponible es el WER de 12,31 declarado por el autor sobre el dataset Spanish_english, sin comparacion con las variantes originales de Whisper.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card esta generada automaticamente y no describe usos previstos, composicion del dataset ni limitaciones.
- Resultado no verificado: el WER de 12,31 figura con "verified: false" en el model-index y no ha sido validado de forma independiente.
- Dataset no documentado: se desconoce el volumen, la procedencia y la calidad del dataset Spanish_english, lo que impide evaluar el riesgo de sobreajuste o de sesgos en los datos.
- Idioma declarado contradictorio: los metadatos indican solo ingles, mientras que el nombre y la descripcion apuntan a espanol con acentos; conviene validar el comportamiento real antes de usarlo.
- Ventana de audio limitada: hereda la restriccion de 30 segundos por inferencia de Whisper tiny, lo que exige segmentar audios largos.
- Precision limitada por el tamano: al partir de Whisper tiny, la calidad en audio ruidoso, habla solapada o vocabulario tecnico sera inferior a la de variantes mayores.
- Riesgo de alucinacion en transcripcion: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo experimental sin validacion externa, se recomienda evaluacion propia antes de desplegarlo en produccion.
- Sin soporte documentado de cuantizacion, tool calling ni despliegue en runtimes de inferencia de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggnico/whisper-tiny_to_spanish_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356

# Sak08/nppe2-hindi-disfluency-whisper

## Resumen

`Sak08/nppe2-hindi-disfluency-whisper` es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario Sak08. Por su nombre y sus etiquetas, se trata de un ajuste fino de Whisper orientado a transcribir hindi con disfluencias, es decir, preservando o gestionando las vacilaciones, repeticiones y falsos arranques propios del habla espontanea en lugar de normalizarlos. El modelo emplea la arquitectura encoder-decoder transformer de Whisper y cuenta con 241.734.912 parametros totales, un tamano compatible con la variante base de la familia.

La relevancia de este modelo es acotada pero especifica: la mayoria de sistemas ASR estan entrenados sobre habla leida o curada y degradan su comportamiento ante habla natural con disfluencias, algo critico en transcripcion de entrevistas, reuniones o corpus linguisticos. Sin embargo, la model card esta practicamente vacia (generada automaticamente por la plataforma), no hay descargas ni likes, y no se documentan datos de entrenamiento, evaluacion ni licencia. Debe tratarse, por tanto, como un checkpoint experimental sin garantias de calidad ni de trazabilidad.

El repositorio ocupa 0,5 GB y los pesos estan en formato safetensors, cargables con la libreria transformers. No se dispone de informacion sobre el procedimiento de ajuste, el corpus utilizado ni los resultados obtenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion estandar de transformers/GGUF por arquitectura |
| Idiomas soportados | hindi (inferido del nombre del modelo); no confirmado en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un modelo encoder-decoder de tipo transformer que procesa espectrogramas mel de audio de 30 segundos y genera tokens de transcripcion de forma autorregresiva. Con 241,7 millones de parametros, el tamano encaja con la variante base de la familia Whisper. El pipeline declarado es `automatic-speech-recognition` y las etiquetas incluyen `whisper`, `transformers` y `endpoints_compatible`.

No hay informacion disponible sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset, el uso de tecnicas de RLHF o DPO (no aplicables tipicamente a ASR) ni los hiperparametros de ajuste. El nombre sugiere un ajuste fino sobre datos de hindi con disfluencias, posiblemente derivado de un proyecto o dataset denominado "nppe2", pero esto no se confirma en la model card. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Transcripcion de audio a texto en hindi (inferido del identificador del modelo; no verificado).
- Gestion de habla espontanea con disfluencias: vacilaciones, repeticiones y falsos arranques, segun la finalidad implicita en el nombre.
- Compatibilidad con el pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad con endpoints de inferencia de Hugging Face (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio adicional ni modo de razonamiento extendido.
- Capacidades multilingues: no disponibles; el modelo parece orientado exclusivamente al hindi.

## Casos de uso

- Transcripcion de entrevistas en hindi: el modelo estaria disenado para preservar el habla natural con vacilaciones, lo que resulta util en investigacion cualitativa donde la literalidad de la transcripcion importa.
- Corpus linguisticos de habla espontanea: adecuado para proyectos de linguistica de corpus que necesitan reflejar disfluencias en lugar de eliminarlas.
- Generacion de subtitulos para contenido informal: podcasts o videos en hindi donde los hablantes improvisan y el habla no es leida.
- Preprocesado para analisis de sentimiento o topicos sobre audio: una transcripcion fiel del habla natural mejora las etapas posteriores de NLP.
- Prototipado de asistentes de voz en hindi: util como base experimental para evaluar el comportamiento ante habla real antes de invertir en modelos mayores.
- Investigacion sobre normalizacion de disfluencias: el checkpoint puede servir como referencia para comparar estrategias de transcripcion literal frente a transcripcion limpia.
- Docencia y demos de ASR: su tamano reducido (0,5 GB) permite desplegarlo en entornos de laboratorio con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos, mas memoria para activaciones y buffers de audio; en la practica, 2-3 GB suelen ser suficientes.
- En fp16: alrededor de 0,5 GB de pesos, con un consumo total tipico por debajo de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es demasiado pequeno para aprovechar GPUs de gama alta.
- Cabe holgadamente en GPU consumer, incluidas GTX 1660, RTX 2060 y superiores, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (pipeline de ASR), endpoints de Hugging Face, y potencialmente llama.cpp u otras herramientas si se convierte a GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sak08/nppe2-hindi-disfluency-whisper | 241,7 M | ventanas de 30 s (Whisper) | hindi (inferido) | no disponible | Hugging Face |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | Hugging Face |
| vasista22/whisper-hindi-small | ~244 M | ventanas de 30 s | hindi | MIT (heredada) | Hugging Face |

La comparacion con `whisper-small` es la mas directa por numero de parametros, aunque este ultimo es multilingue y esta ampliamente evaluado. El modelo de Sak08 no aporta datos de evaluacion que permitan afirmar una mejora sobre las alternativas; su interes reside unicamente en la especializacion declarada en disfluencias del hindi.

## Limitaciones y advertencias

- La model card esta vacia y generada automaticamente: no hay informacion sobre datos, metodologia ni evaluacion.
- No se especifica licencia, por lo que el uso comercial es juridicamente incierto y no recomendable sin contactar con el autor.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo elevado de alucinacion y de errores de transcripcion no cuantificados, especialmente en acentos, ruido de fondo y dominio fuera del corpus de ajuste.
- El soporte idiomatico se infiere solo del nombre del modelo; no se confirma oficialmente.
- No hay garantias de que la "preservacion de disfluencias" funcione como sugiere el nombre; podria tratarse de un ajuste para eliminarlas o simplemente de un checkpoint sin pulir.
- No apto para produccion sin una evaluacion propia sobre un conjunto de validacion representativo.
- Posibles sesgos derivados del corpus de entrenamiento desconocido (genero, region, registro).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sak08/nppe2-hindi-disfluency-whisper
- Paper de Whisper (referenciado en las etiquetas): https://arxiv.org/abs/2212.04356
- Paper del calculador de impacto ambiental (referenciado en la model card): https://arxiv.org/abs/1910.09700
- Calculador ML Impact: https://mlco2.github.io/impact
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper

# goaicorp/dyu-whisper-small

## Resumen

dyu-whisper-small es un ajuste fino (fine-tuning) del modelo openai/whisper-small para reconocimiento automatico del habla (ASR) en idioma dyula (dyu), una lengua mande hablada principalmente en Burkina Faso, Costa de Marfil y Mali. Lo desarrolla goaicorp, un colectivo que publica modelos especializados en lenguas africanas de bajos recursos, y se distribuye en Hugging Face bajo acceso restringido (gated).

El modelo parte de la arquitectura Whisper de OpenAI, un transformer encoder-decoder de 241,7 millones de parametros entrenado originalmente para transcripcion y traduccion de voz multilingue. En este caso, el ajuste se ha realizado sobre el dataset goaicorp/dyu-speech para adaptar el decodificador al vocabulario y las particularidades foneticas del dyula, un idioma practicamente ausente en los corpus multilingues mayoritarios.

Su relevancia radica en cubrir un hueco real: la mayoria de sistemas ASR comerciales no ofrecen cobertura funcional para lenguas mande, y este modelo proporciona una base abierta (aunque con licencia cc-by-sa-4.0, que obliga a compartir derivados) para aplicaciones de transcripcion, subtitulado y preservacion linguistica en la region.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper-small: 30 s por segmento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion a 8 y 4 bits via herramientas externas) |
| Idiomas soportados | dyula (dyu) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (repo de 1,9 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper-small de OpenAI: un encoder convolucional mas transformer que procesa espectrogramas mel de 80 canales en ventanas de 30 segundos, y un decoder autorregresivo que genera tokens de texto condicionados por el audio y por tokens especiales de idioma y tarea. Con 241,7 millones de parametros, se situa en el rango medio de la familia Whisper (tiny, base, small, medium, large).

El ajuste fino se realizo sobre el dataset goaicorp/dyu-speech, un corpus de habla en dyula publicado por el mismo autor. No se dispone de informacion publica sobre el numero exacto de horas de audio, la composicion del dataset, la duracion del entrenamiento ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas. Tampoco se documenta el uso de RLHF, DPO ni decodificacion especulativa; el pipeline es el estandar de Hugging Face Transformers para ASR con Whisper.

## Capacidades

- Reconocimiento automatico del habla en dyula a partir de audio de entrada.
- Transcripcion de audio en ventanas de hasta 30 segundos por segmento, con concatenacion para audios mas largos.
- Generacion de marcas de tiempo (timestamps) a nivel de segmento, segun el comportamiento estandar de Whisper.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Transformers.
- Soporte de endpoints compatibles (tag `endpoints_compatible`), lo que permite desplegarlo en Inference Endpoints de Hugging Face.
- No se documentan capacidades de traduccion a otros idiomas, tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y entrevistas en dyula: el modelo permite convertir grabaciones de audio en texto para organizaciones que trabajan en Burkina Faso, Mali o Costa de Ivoria, donde no existen alternativas ASR comerciales fiables.
- Subtitulado automatico de contenido audiovisual: util para radios comunitarias, televisiones regionales y creadores de contenido que publican en dyula y necesitan subtitulos en el mismo idioma.
- Preservacion linguistica y documentacion: investigadores en linguistica pueden transcribir corpus orales de dyula de forma semiautomatica, reduciendo el coste de transcripcion manual.
- Atencion al cliente en centros de llamadas locales: integrado en un pipeline con un modelo de traduccion posterior, permite transcribir conversaciones telefonicas en dyula para su analisis o derivacion.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en comunidades dyulaparlantes, donde las soluciones genericas no funcionan.
- Investigacion en ASR de bajos recursos: sirve como punto de partida (base model) para ajustes finos en lenguas mande relacionadas, como bambara o malinke, gracias a la cercania linguistica.
- Educacion: transcripcion de clases y materiales docentes en dyula para su reutilizacion en plataformas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB (241,7 M de parametros x 4 bytes) mas el overhead del encoder y del buffer de audio.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB, holgadamente dentro de cualquier GPU consumer.
- En cuantizacion int8: alrededor de 0,25 GB, viable incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A10, A100). Para lotes grandes o despliegue concurrente, se recomienda A10 o superior.
- Cabe en GPU consumer sin problemas; tambien puede ejecutarse en CPU con latencia aceptable para audios cortos.
- Opciones de despliegue: pipeline de Transformers, Text Generation Inference (TGI) para Whisper no es el camino habitual; se recomienda `transformers` con `pipeline`, `optimum` para ONNX, o `whisper.cpp`/`faster-whisper` si se convierte a formato compatible (requiere verificacion, ya que el ajuste fino puede alterar el tokenizer).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goaicorp/dyu-whisper-small | 241,7 M | 30 s por segmento | dyula | cc-by-sa-4.0 | Gated en HF |
| openai/whisper-small | 241,7 M | 30 s por segmento | 99 idiomas (sin cobertura fiable de dyula) | MIT | Abierto |
| openai/whisper-medium | 769 M | 30 s por segmento | 99 idiomas | MIT | Abierto |
| Modelos ASR especificos para lenguas mande | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con whisper-small es la mas relevante: mismo tamano y arquitectura, pero el ajuste fino especializa el decodificador en dyula a costa de perder cobertura multilingue. Frente a whisper-medium, el modelo de goaicorp es mas ligero y desplegable en hardware modesto, aunque no hay datos publicos que permitan comparar WER en dyula.

## Limitaciones y advertencias

- El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia cc-by-sa-4.0 obliga a compartir bajo la misma licencia cualquier obra derivada y a citar la autoría; no es apta para productos propietarios sin liberar el modelo resultante.
- El modelo solo soporta dyula; no se debe esperar buen rendimiento en otros idiomas ni en code-switching con frances o arabe, frecuente en la region.
- No hay datos publicos sobre el WER real en dyula, por lo que el rendimiento en produccion debe validarse con un conjunto de prueba propio antes de desplegar.
- Riesgo de alucinacion en audio con ruido, musica o hablantes con acentos muy marcados, comportamiento comun en modelos Whisper pequenos.
- Sesgos potenciales derivados del corpus de entrenamiento (posible sobrerrepresentacion de determinados registros, generos o regiones), no documentados.
- Ventana de audio limitada a 30 segundos por segmento; audios largos requieren segmentacion previa.
- El repo tiene muy pocas descargas (3) y ningun "like", lo que sugiere escasa validacion por parte de la comunidad; conviene tratarlo como modelo experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goaicorp/dyu-whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/goaicorp/dyu-speech
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr

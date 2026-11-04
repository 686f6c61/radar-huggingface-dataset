# Bercraft/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-Q6_K-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA es un modelo especializado en la reescritura, expansion y mejora de prompts para generacion de video y audio-video. Lo desarrolla el equipo lightx2v y esta construido sobre una base Qwen3.8 de 27B parametros, afinado mediante SFT para la tarea concreta de transformar instrucciones breves en descripciones detalladas y estructuradas, orientadas a modelos de generacion de video (T2VA, I2VA, L2VA, FL2VA). El checkpoint que nos ocupa es una cuantizacion GGUF Q6_K publicada por el usuario Bercraft, generada con el espacio GGUF-my-repo de ggml.ai a partir del modelo original en safetensors.

El modelo resuelve un problema muy especifico del pipeline de generacion de video: los modelos de difusion de video responden mejor a prompts largos, ricos en detalle de escena, iluminacion, camara y audio, pero los usuarios escriben instrucciones cortas. Este rewriter actua como etapa intermedia que expande esas instrucciones antes de pasarlas al generador. Es relevante para quien construye pipelines multimodales de video generativo y quiere automatizar la fase de ingenieria de prompts.

La informacion publica disponible es escasa: la model card del repositorio GGUF es la plantilla automatica de GGUF-my-repo y remite al modelo original. No se han publicado detalles de arquitectura interna, datos de entrenamiento, licencia ni idiomas en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de llama.cpp usan -c 2048, no implica limite del modelo) |
| Tipos de cuantizacion | GGUF Q6_K (este repo); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero minimax-h3-prompt-rewriter-qwen3.8-27b-fl2va-q6_k.gguf); original en safetensors |

## Arquitectura y entrenamiento

El modelo base es lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA, construido sobre una arquitectura transformer de la familia Qwen3.8 con aproximadamente 26,9 mil millones de parametros. El sufijo FL2VA y las etiquetas de la model card (t2va, i2va, l2va, fl2va) indican que esta especializado en generar prompts para tareas de generacion de video con audio: texto a video-audio, imagen a video-audio, y variantes con primer/ultimo fotograma (first-last frame). Las etiquetas tambien mencionan vision-language, lo que sugiere capacidades multimodales de entrada.

El ajuste se realizo mediante SFT (supervised fine-tuning) segun las etiquetas del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Este repositorio concreto es unicamente una conversion a GGUF Q6_K realizada con llama.cpp; no introduce cambios de arquitectura respecto al original.

## Capacidades

- Reescritura y expansion de prompts: transforma instrucciones breves en descripciones detalladas y estructuradas para generacion de video.
- Generacion de prompts para video con audio (T2VA, I2VA, L2VA, FL2VA): produce descripciones que cubren escena, movimiento de camara, iluminacion y componentes de audio.
- Capacidades vision-language: las etiquetas del modelo indican entrada multimodal, lo que permitiria condicionar la reescritura a imagenes de referencia.
- Generacion de texto general: heredada de la base Qwen3.8, aunque no esta documentada en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Pipeline de generacion de video texto-a-video con audio: el modelo se coloca como etapa previa al generador de difusion; el usuario escribe una idea breve y el rewriter la expande en un prompt detallado con descripcion de escena, camara y audio antes de pasarla al modelo de video.
- Automatizacion de interfaces creativas: en una herramienta de creacion de video, el rewriter se invoca de forma transparente para enriquecer lo que escribe el usuario, mejorando la calidad del resultado sin exigirle conocimientos de prompting.
- Generacion de video a partir de imagenes de referencia (I2VA): dado un fotograma de entrada, el modelo puede redactar el prompt que describa la evolucion de la escena y el audio asociado, aprovechando su etiqueta de vision-language.
- Produccion de variantes de prompt: generar multiples reescrituras de una misma idea para explorar estilos visuales distintos en un flujo de generacion por lotes.
- Estandarizacion de prompts en equipos creativos: definir una plantilla de reescritura que garantice que todos los prompts de un proyecto incluyan los campos requeridos (escena, camara, iluminacion, audio).
- Despliegue local con llama.cpp: al estar en GGUF Q6_K, puede ejecutarse en estaciones de trabajo con GPU de consumo o en CPU, lo que permite integrarlo en entornos sin acceso a API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q6_K y ~26,9 B parametros, el fichero de pesos ronda los 22 GB (tamano del repo); se necesita VRAM adicional para cache KV y overhead, por lo que conviene prever del orden de 24-28 GB en GPU.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 24 GB (esta ultima al limite, con posible offload parcial a CPU).
- GPU de consumo: cabe en RTX 4090 24 GB con margen ajustado; en GPUs de 16 GB o menos requerira offload a RAM y perdera velocidad.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) segun la model card; vLLM aparece en las etiquetas del modelo; Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA (este, Q6_K) | ~26,9 B | no disponible | GGUF | no disponible | Especializado en reescritura de prompts de video/audio |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA | ~26,9 B | no disponible | safetensors | no disponible | Modelo original del que deriva esta cuantizacion |
| Qwen3.8 base (27B) | ~27 B | no disponible | safetensors/GGUF | no disponible | Modelo generalista; no especializado en reescritura de prompts |

No se dispone de datos de rendimiento comparativo ni de otros rewriters de prompts de video con los que contrastar en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de un modelo generalista, puede heredar sesgos de su base.
- Riesgo de alucinacion: como modelo generativo, puede introducir detalles no solicitados en el prompt expandido; conviene revisar las reescrituras en produccion.
- Limitaciones de contexto o idioma: no documentadas; la model card no especifica ventana de contexto ni idiomas.
- Restricciones de licencia: la licencia no esta indicada en la informacion disponible, por lo que no se puede confirmar el uso comercial; es imprescindible consultar el modelo original lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA antes de usarlo en produccion.
- Caveat de cuantizacion: Q6_K introduce una perdida de precision respecto al original; para tareas sensibles puede ser preferible el checkpoint en safetensors.
- Modelo especializado: su utilidad esta acotada a la reescritura de prompts de video/audio; no esta pensado como modelo de proposito general.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria conocida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Bercraft/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-Q6_K-GGUF
- Modelo original: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp

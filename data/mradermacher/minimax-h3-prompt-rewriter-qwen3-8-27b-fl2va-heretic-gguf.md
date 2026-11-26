# mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic es un modelo de lenguaje especializado en la reescritura, expansion y mejora de prompts, desarrollado por el usuario LeViAtHaN2K y cuantizado a formato GGUF por mradermacher. Su proposito es transformar instrucciones breves o incompletas en prompts detallados y estructurados, con enfasis particular en la generacion de prompts para modelos de video y audio-video (las siglas FL2VA, junto a T2VA, I2VA y L2VA, apuntan a modalidades texto-a-video-audio, imagen-a-video-audio, etc.). El modelo se apoya en una base Qwen3.8 de 27B parametros y ha sido sometido a un proceso de ajuste supervisado (SFT).

La variante "heretic" indica que el modelo ha sido descensurado o "abliterated", es decir, que se han eliminado o reducido los mecanismos de rechazo y alineacion de seguridad de la version original. Esto lo hace util para entornos donde se requiere libertad creativa sin filtros, pero tambien conlleva riesgos importantes de contenido inapropiado o sesgado que el operador debe gestionar. El repositorio incluye pesos en formato GGUF con multiples niveles de cuantizacion, lo que permite ejecutarlo en hardware de consumo.

Con 26.895.998.464 parametros totales (aproximadamente 26,9B), el modelo se situa en la gama alta de los modelos densos desplegables localmente. La informacion publica es escasa: no se detallan la longitud de contexto, los idiomas soportados ni la licencia, por lo que muchos datos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8), con modulo multimodal (mmproj) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (segun la model card; no se detallan otros) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Tamano del repo | 189,4 GB |
| Libreria | transformers |
| Modelo base | LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic |

## Arquitectura y entrenamiento

El modelo se construye sobre una arquitectura transformer densa derivada de Qwen3.8, con aproximadamente 26,9B parametros. Incluye un componente multimodal (ficheros mmproj en formato GGUF), lo que confirma capacidades de vision-lenguaje. El entrenamiento declarado es de tipo SFT (supervised fine-tuning) sobre la base Qwen3.8, orientado especificamente a la tarea de reescritura y expansion de prompts. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La innovacion principal del modelo no es arquitectonica sino funcional: esta especializado en la transformacion de prompts para modelos generativos de video y audio-video (T2VA, I2VA, L2VA, FL2VA). Ademas, la variante "heretic" implica un proceso de abliteration que modifica los pesos para eliminar direcciones de rechazo, alterando el comportamiento de seguridad respecto al modelo base. No se dispone de detalles tecnicos sobre el metodo exacto de abliteration aplicado ni sobre el volumen de datos de ajuste.

## Capacidades

- Reescritura y expansion de prompts: convierte instrucciones breves en descripciones detalladas y estructuradas.
- Generacion de prompts para video y audio-video (tags t2va, i2va, l2va, fl2va).
- Procesamiento multimodal vision-lenguaje gracias al modulo mmproj incluido.
- Conversacion multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible) y con vLLM para despliegue en servidor.
- Comportamiento descensurado: no aplica rechazos de seguridad tipicos del modelo base.
- Generacion de texto general heredada de la base Qwen3.8.
- No se documentan capacidades de tool calling, agentes o modo thinking en la informacion disponible.

## Casos de uso

- Generacion de prompts para modelos de video: el modelo toma una idea escueta ("un perro corriendo en la playa al atardecer") y la expande en un prompt cinematografico detallado con iluminacion, camara y estilo, adecuado para alimentar generadores texto-a-video.
- Creacion de prompts audio-video: para pipelines que generan video con pista de audio sincronizada, el modelo produce descripciones que incluyen ambiente sonoro, dialogo y efectos, aprovechando su especializacion FL2VA.
- Preprocesado en estudios de creacion audiovisual: integrado como paso previo a la inferencia de modelos generativos, estandariza y enriquece los prompts de un equipo creativo antes de enviarlos al generador.
- Herramienta de escritura creativa sin filtros: en entornos controlados donde se necesita explorar ideas narrativas o visuales sin restricciones de contenido, la variante heretic evita los rechazos del modelo base.
- Aumento de prompts para imagen-a-video: dado un fotograma inicial y una instruccion breve, el modelo genera la descripcion de movimiento y evolucion temporal necesaria para el modelo I2VA.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (16,8 GB) y Q5_K_M (19,4 GB), puede ejecutarse en GPUs de consumo con llama.cpp u Ollama para tareas de reescritura de prompts en local, sin dependencia de la nube.
- Prototipado de interfaces de prompt engineering: al ser compatible con endpoints y vLLM, puede integrarse como microservicio que recibe prompts de usuario y devuelve versiones mejoradas en una aplicacion web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~11,2 GB; Q4_K_M ~16,8 GB; Q5_K_M ~19,4 GB; Q8_0 ~28,7 GB.
- El modulo multimodal anade 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) adicionales.
- GPU recomendadas para cuantizaciones altas: A100 40/80 GB, H100, o GPUs de consumo con 24 GB (RTX 3090, RTX 4090) para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M o inferiores en tarjetas de 16-24 GB; las cuantizaciones Q8_0 requieren 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y vLLM (segun el tag vllm); el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic (este) | ~26,9B | no disponible | Reescritura de prompts video/audio-video, descensurado | no disponible | GGUF, safetensors |
| Qwen3.8 27B base | ~27B | no disponible | Proposito general | no disponible | safetensors |
| Modelos de reescritura de prompts genericos | no disponible | no disponible | Reescritura de texto | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas; los modelos comparables de la misma categoria no estan documentados en la fuente.

## Limitaciones y advertencias

- Modelo descensurado ("heretic"/"abliterated"): puede generar contenido inapropiado, ofensivo o peligroso sin los rechazos del modelo base; requiere moderacion externa en produccion.
- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede inventar detalles en los prompts expandidos (elementos visuales, terminos tecnicos) que no estaban en la instruccion original.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y podria ser inferior.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base antes de desplegarlo en produccion.
- Longitud de contexto no documentada: no se puede garantizar el manejo de prompts largos o conversaciones extensas.
- El repositorio es muy grande (189,4 GB) por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Especializacion estrecha: fuera de la reescritura de prompts, su rendimiento general puede ser inferior al de la base Qwen3.8 sin ajustar.
- Sin datos de benchmarks: no hay evidencia publicada de calidad objetiva frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-GGUF
- Modelo base: https://huggingface.co/LeViAtHaN2K/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

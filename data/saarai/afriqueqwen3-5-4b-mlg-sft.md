# SaarAI/AfriqueQwen3.5-4B-mlg-sft

## Resumen
AfriqueQwen3.5-4B-mlg-sft es un ajuste fino supervisado (SFT) de parametros completos del modelo McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1, especializado en malgache (mg). Lo desarrolla SaarAI como parte de una serie de modelos para lenguas africanas, empleando LLaMA-Factory como framework de entrenamiento. El modelo parte de la familia Qwen3.5 (arquitectura transformer densa, tag `qwen3_5`) y cuenta con 4.539.265.536 parametros totales segun los pesos en safetensors.

El problema que aborda es la escasez de modelos de instruccion con calidad para el malgache, una lengua de bajos recursos con poca representacion en los corpus de preentrenamiento dominantes. El modelo se entrena sobre el dataset SaarAI/mlg-post-training (576.271 filas de entrenamiento) con tareas que van desde la traduccion en<->mlg hasta el razonamiento matematico, pasando por QA, generacion de codigo conversacional, NER y etiquetado POS.

Es relevante ahora porque forma parte de un esfuerzo coordinado por cubrir lenguas africanas con recetas de entrenamiento homogeneas (mismos hiperparametros que las variantes kinyarwanda, amharique y zulu), lo que facilita la comparacion entre lenguas. No obstante, el autor lo describe explicitamente como experimental y no ha publicado comparativas de benchmarks frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento uso cutoff de 4096 tokens |
| Tipos de cuantizacion | No se especifican en la model card; pesos en safetensors en bf16 |
| Idiomas soportados | Malgache (mg) e ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer denso de la familia Qwen3.5, heredado del checkpoint instructivo multilingue McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1. El ajuste es de parametros completos (full fine-tuning) sobre 1x H100 de 80 GB, con pesos en bf16 puro, AdamW de 8 bits, kernels Liger y sin DeepSpeed. Se uso la plantilla `qwen3_5_nothink`, cutoff de 4096 tokens y batches agrupados por longitud.

El entrenamiento se planifico para 3 epocas (54.027 pasos, 18.009 por epoca), con learning rate 1e-5 (cosine, 3% warmup), batch 16 x 2 de acumulacion (batch efectivo 32) y una duracion total de 24,6 horas. Se conservo el checkpoint con menor eval loss: el paso 35.000 (epoca 1,94), con eval loss de 0,8970 sobre 2.000 filas de validacion. La eval loss subio al inicio de la epoca 3 y se mantuvo plana mientras la train loss seguia bajando, por lo que los pesos posteriores se consideraron sobreajustados y no se subieron. Los datos de entrenamiento son el dataset completo SaarAI/mlg-post-training: 576.271 filas de entrenamiento de 6 ficheros y 2.000 filas de validacion (muestreadas de 2.932). Las tareas dominantes son traduccion en<->mlg (unas 223k filas), question answering, instruction following, continuacion de texto y chat; en menor volumen, generacion de articulos, titulos y poemas, resumen, chat de codigo, dialogo, simplificacion de texto, event linking, identificacion de parafrasis, razonamiento matematico, clasificacion de sentimiento y topico, POS tagging y NER. Las licencias de las fuentes no se filtraron (uso de investigacion).

## Capacidades
- Generacion de texto conversacional en malgache e ingles, con plantilla de chat propia (`qwen3_5_nothink`, sin modo thinking).
- Traduccion bidireccional en<->mlg, la tarea con mayor volumen de entrenamiento (unas 223k filas).
- Question answering e instruction following sobre el dataset de post-entrenamiento.
- Continuacion de texto, resumen y simplificacion de texto.
- Generacion creativa acotada: articulos, titulos y poemas.
- Chat de codigo en el contexto del dataset de entrenamiento.
- Razonamiento matematico basico y clasificacion (sentimiento, topico).
- Tareas de PNL estructurada: POS tagging, NER, identificacion de parafrasis y event linking.
- Soporte de tool calling y function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades de vision o audio: no disponibles; el tag `image-text-to-text` aparece en los metadatos de Hugging Face, pero la model card solo documenta `text-generation`.

## Casos de uso
- Traduccion en<->mlg en produccion editorial: el modelo se entrena con unas 223k filas de traduccion, lo que lo hace util para borradores de traduccion que luego revisa un linguista nativo; conviene tratarlo como generador de primera pasada, no como traductor final.
- Atencion al cliente en malgache: gracias a su entrenamiento en chat y dialogo, puede gestionar conversaciones multi-turno; la ventana de entrenamiento de 4096 tokens limita el contexto historico que conviene enviar.
- Generacion de contenido divulgativo: articulos, titulos y resumenes en malgache para medios locales o blogs, con supervision humana por el riesgo de alucinacion.
- Anotacion asistida de corpus: POS tagging y NER en malgache para preetiquetar datasets linguisticos antes de la revision manual.
- Investigacion en lenguas de bajos recursos: punto de partida para experimentos de SFT, evaluacion de transferencia multilingue o comparativas con las variantes kin, amh y zul de la misma serie.
- Clasificacion de texto y analisis de sentimiento: para monitorizacion de opiniones o moderacion en comunidades malgache-parlantes, con umbrales de confianza conservadores.
- Educacion y tutoria basica: explicaciones y ejercicios de matematicas sencillos en malgache; el autor advierte de que el modelo es experimental, por lo que requiere revision docente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna comparativa de benchmarks frente al modelo base; la unica evidencia es la eval loss.

| Metrica | Valor |
|---|---|
| Eval loss de los pesos subidos (paso 35.000, 2.000 filas) | 0,8970 |
| Eval loss en el ultimo paso (54.027, no subido) | 0,9183 |
| Train loss, primeros 500 pasos (media) | 1,372 |
| Train loss, pasos 34.501-35.000 (media) | 0,821 |
| Train loss, media de las 3 epocas | 0,8614 |

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4.539 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 12 y 16 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: unos 4,5-5 GB de pesos; en 4 bits, unos 2,5-3 GB (no se publican cuantizaciones oficiales, seria necesario generarlas).
- GPU recomendadas: H100 80 GB o A100 para entrenamiento y despliegue a gran escala; para inferencia basta una RTX 4090 (24 GB) en bf16 o una RTX 3090/4080 en cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/4080/3090 en bf16 y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo, ejemplo en la model card); vLLM, TGI, llama.cpp u Ollama requeririan conversion a los formatos correspondientes, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| SaarAI/AfriqueQwen3.5-4B-mlg-sft | 4.539 M | cutoff de entrenamiento 4096 | mg, en | CC-BY-4.0 | Experimental, sin benchmarks |
| McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1 (base) | 4B aprox. | no disponible | 50 lenguas | no disponible en esta ficha | Modelo base instructivo |
| SaarAI/AfriqueQwen3.5-4B-kin-sft-v3 | 4B aprox. | no disponible | kinyarwanda | no disponible en esta ficha | Misma receta, 3 epocas |
| SaarAI/AfriqueQwen3.5-4B-amh-sft / -zul-sft | 4B aprox. | no disponible | amharique / zulu | no disponible en esta ficha | Misma receta, 3 epocas |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparacion se limita a parametros, idioma y receta de entrenamiento.

## Limitaciones y advertencias
- No se ha ejecutado ninguna comparativa de benchmarks frente al modelo base; la unica evidencia de calidad es la eval loss.
- El dataset de entrenamiento incluye `sib200` (681 filas), construido a partir de un benchmark; no se ha comprobado si solapa con splits de test publicos, por lo que futuras puntuaciones de benchmark podrian estar infladas.
- El autor califica el modelo como experimental: puede producir texto incorrecto o sesgado.
- Las licencias de las fuentes del dataset no se filtraron (uso de investigacion); hay que verificar las licencias de los datasets de origen antes de cualquier uso comercial, aunque el modelo se distribuya con CC-BY-4.0.
- El entrenamiento uso un cutoff de 4096 tokens; no se documenta una longitud de contexto nativa mayor, por lo que no conviene asumir ventanas mas amplias.
- Cobertura limitada a malgache e ingles; el rendimiento en otras lenguas no esta garantizado pese a la base de 50 lenguas.
- Riesgo de alucinacion y de sesgos heredados tanto del modelo base como de los corpus de entrenamiento; requiere supervision humana en produccion.
- No se distribuyen cuantizaciones GGUF ni otros formatos listos para llama.cpp/Ollama.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-mlg-sft
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-50Langs-Instruct-v1
- Variante kinyarwanda de referencia: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-kin-sft-v3
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory

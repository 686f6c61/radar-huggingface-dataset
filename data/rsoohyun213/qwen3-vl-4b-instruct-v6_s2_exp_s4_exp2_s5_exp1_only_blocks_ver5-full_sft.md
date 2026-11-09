# rsoohyun213/Qwen3-VL-4B-Instruct-v6_s2_exp_s4_exp2_s5_exp1_only_blocks_ver5-full_SFT

## Resumen

Qwen3-VL-4B-Instruct-v6_s2_exp_s4_exp2_s5_exp1_only_blocks_ver5-full_SFT es un modelo multimodal de tipo image-text-to-text publicado por el usuario rsoohyun213 en Hugging Face. Se trata de un fine-tuning por SFT (supervised fine-tuning) del modelo base Qwen/Qwen3-VL-4B-Instruct, desarrollado por Alibaba Qwen, realizado con la libreria TRL de Hugging Face. El sufijo del nombre sugiere una experimentacion iterativa (v6, s2_exp, s4_exp2, s5_exp1, only_blocks_ver5) sobre distintas configuraciones de entrenamiento, probablemente orientadas a congelar o ajustar selectivamente bloques del transformer.

El modelo hereda la arquitectura y capacidades del Qwen3-VL-4B-Instruct original, un transformer multimodal con aproximadamente 4.000 millones de parametros disenado para tareas de vision-lenguaje. El repositorio pesa 168,7 GB, un tamano desproporcionado respecto al numero de parametros, lo que sugiere que incluye checkpoints intermedios, estados del optimizador u otros artefactos de entrenamiento ademas de los pesos finales.

Es relevante principalmente como ejemplo de adaptacion via SFT de un modelo VLM compacto y como referencia para quienes experimentan con fine-tuning selectivo por bloques. No dispone de descargas ni likes, carece de licencia explicita y no documenta idiomas soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), heredada de Qwen3-VL-4B-Instruct |
| Parametros totales | 569.856 (segun safetensors; el nombre indica base de 4B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card menciona "licence: license" sin especificar) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal que procesa pares imagen-texto. El sufijo "only_blocks_ver5" apunta a que el fine-tuning se aplico unicamente a determinados bloques del modelo (posiblemente capas del encoder de vision o del decoder de lenguaje), mientras que el resto de pesos permanecio congelado. El entrenamiento se realizo con SFT mediante TRL 1.3.0, sobre Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2.

No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. La model card es una plantilla generada automaticamente por TRL y no aporta hiperparametros, curvas de perdida ni detalles sobre la estrategia de congelacion de bloques.

## Capacidades

- Generacion de texto conversacional a partir de instrucciones e imagenes (pipeline image-text-to-text).
- Comprension de imagenes y respuesta multimodal, heredada del modelo base Qwen3-VL.
- Razonamiento visual y descripcion de contenido grafico (segun capacidades del base, no verificado en este fine-tune).
- Soporte de conversaciones multi-turno en formato de chat (roles user/assistant).
- Capacidades de codigo, matematicas y tool calling: no disponibles de forma verificada en esta variante.
- Capacidades multilingues: no disponibles de forma verificada.

## Casos de uso

- Experimentacion academica con fine-tuning selectivo: el modelo sirve como referencia para estudiar como el ajuste de solo ciertos bloques afecta el rendimiento de un VLM, comparandolo con el base Qwen3-VL-4B-Instruct.
- Descripcion de imagenes en prototipos: uso del pipeline image-text-to-text para generar descripciones y responder preguntas sobre imagenes en entornos de desarrollo.
- Asistentes conversacionales multimodales: integracion en chatbots que reciben imagenes del usuario y responden en formato de chat multi-turno.
- Evaluacion de pipelines TRL: reproduccion del flujo de entrenamiento SFT para validar configuraciones de congelacion de bloques en modelos de vision-lenguaje.
- Investigacion sobre transferencia de conocimiento: analisis de cuanto del comportamiento del base se conserva tras el SFT parcial.
- Base para nuevos experimentos: punto de partida para iteraciones posteriores (v7, s6, etc.) dentro de la misma linea de experimentacion del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de aproximadamente 4.000 millones de parametros en fp16 se situaria en torno a 8-10 GB, y en cuantizacion de 4 bits alrededor de 3-4 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles; por tamano, una RTX 4090 (24 GB) o A100/H100 serian adecuadas para fp16, y GPUs consumer de 8-12 GB podrian bastar con cuantizacion.
- Compatibilidad con GPU consumer: probable en fp16 en GPUs de 16 GB o mas, y en cuantizacion en GPUs de 8 GB, aunque no verificado.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Qwen3-VL-4B-Instruct fine-tune) | ~4B (base) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | no disponible en esta ficha | segun modelo base | Hugging Face, oficial |
| Qwen2.5-VL-3B-Instruct | ~3B | no disponible en esta ficha | segun modelo base | Hugging Face, oficial |
| Otros fine-tunes SFT de Qwen3-VL | variable | variable | variable | Hugging Face |

La comparacion de rendimiento no esta disponible al no haberse publicado benchmarks.

## Limitaciones y advertencias

- Ausencia de licencia explicita: la model card indica "licence: license" sin concretar terminos, lo que impide determinar si el uso comercial esta permitido; debe verificarse con el autor y con la licencia del modelo base Qwen3-VL-4B-Instruct.
- Sin documentacion de datos de entrenamiento: no se conocen la composicion del dataset, el volumen de tokens ni posibles sesgos introducidos por el SFT.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; no se ha evaluado en esta variante.
- Idiomas no declarados: no hay garantia de rendimiento multilingue mas alla del comportamiento del base.
- Contexto no documentado: se desconoce si el fine-tuning altero la ventana de contexto original.
- Repositorio de 168,7 GB: incluye artefactos de entrenamiento que pueden dificultar el despliegue; conviene descargar solo los pesos finales.
- Cero descargas y cero likes: modelo sin validacion comunitaria, por lo que su calidad no esta contrastada.
- Model card generada automaticamente: carece de hiperparametros, metricas y detalles utiles para reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen3-VL-4B-Instruct-v6_s2_exp_s4_exp2_s5_exp1_only_blocks_ver5-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl

# open-sci/open-sci-ref-1.7b-nemotron-hq-mv_reasoning-100B-4096-longsft_16k-ot30k

## Resumen

El modelo `open-sci/open-sci-ref-1.7b-nemotron-hq-mv_reasoning-100B-4096-longsft_16k-ot30k` es un ajuste fino de tipo full fine-tuning desarrollado por la organizacion open-sci, entrenado con el framework LLaMA-Factory sobre un dataset derivado de Open Thoughts. Con 1.714.377.728 parametros totales (aproximadamente 1,7 mil millones), se enmarca en la categoria de modelos pequenos orientados a tareas de razonamiento y extraccion de caracteristicas.

El identificador del modelo sugiere que parte de una base Nemotron (familia de NVIDIA) y que fue entrenado sobre un subconjunto de 30.000 muestras con secuencias largas de hasta 16.000 tokens, con un contexto de referencia de 4096. El pipeline declarado en Hugging Face es `feature-extraction`, aunque el proceso de entrenamiento corresponde a un SFT supervisado, por lo que su uso natural es la generacion de texto y el razonamiento.

Su relevancia actual es limitada pero concreta: se trata de un artefacto de investigacion reproducible (licencia `other`, pesos en safetensors, trazabilidad completa de hiperparametros) util para estudiar el efecto del SFT largo sobre modelos pequenos en tareas de razonamiento. No obstante, la model card es practicamente vacia y no se han publicado resultados de evaluacion, lo que restringe su adopcion en produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Nemotron, segun el identificador del modelo); detalles no disponibles |
| Parametros totales | 1.714.377.728 (1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; el nombre del modelo referencia 4096 y entrenamiento con secuencias de 16k |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) de una base de 1,7 B de parametros, presumiblemente perteneciente a la familia Nemotron. El entrenamiento se realizo con LLaMA-Factory y Transformers 4.57.3 sobre PyTorch 2.10.0+cu128, sobre un dataset Arrow derivado de `open-thoughts_open_thoughts3-1.2_m_30000_samples` (30.000 muestras). Segun la model card, el autor afirma que el modelo fue "entrenado desde cero" sobre ese dataset, lo que probablemente sea un artefacto de la generacion automatica de la tarjeta y no refleje un preentrenamiento real.

Los hiperparametros documentados son: learning rate 4e-05, batch total de 128 (batch 1 x 32 GPUs x 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup del 10 %, optimizador AdamW fused con betas (0,9; 0,999) y semilla 42. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, RLHF/DPO) ni la composicion exacta del dataset mas alla de su origen en Open Thoughts.

## Capacidades

- Generacion de texto autoregresiva mediante `transformers`, con pesos completos en safetensors.
- Razonamiento multi-paso derivado del SFT sobre Open Thoughts, un corpus orientado a cadenas de pensamiento.
- Entrenamiento con secuencias largas (hasta 16k tokens segun el identificador), lo que sugiere tolerancia a contextos extensos, aunque no confirmado oficialmente.
- Extraccion de caracteristicas (pipeline declarado en Hugging Face: `feature-extraction`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion sobre SFT de razonamiento en modelos pequenos: el modelo sirve como punto de comparacion reproducible (hiperparametros y dataset documentados) para estudiar como afecta el ajuste fino con 30.000 muestras de Open Thoughts al rendimiento en tareas de razonamiento de un modelo de 1,7 B.
- Generacion de cadenas de pensamiento en entornos con recursos limitados: con 1,7 B de parametros y 3,4 GB de pesos en fp32/bf16, puede desplegarse en una unica GPU consumer para experimentar con razonamiento paso a paso sin infraestructura dedicada.
- Extraccion de embeddings y caracteristicas: el pipeline declarado (`feature-extraction`) permite usar las representaciones internas del modelo para clasificacion, clustering o recuperacion semantica en dominios cientificos, aunque requeriria validacion empirica.
- Prototipado de pipelines de razonamiento largo: el entrenamiento con secuencias de hasta 16k tokens lo hace candidato para probar tareas de resumen o analisis de documentos extensos en fase de prototipo, verificando antes la ventana efectiva.
- Base para nuevos ajustes finos: al ser un full fine-tune con licencia `other`, puede servir como punto de partida para experimentos academicos de SFT o DPO adicionales, siempre que la licencia lo permita.
- Evaluacion comparativa de tecnicas de entrenamiento: util en estudios que comparen full fine-tuning frente a LoRA/PEFT sobre la misma base Nemotron y el mismo dataset de Open Thoughts.

## Benchmarks y rendimiento

La model-index del autor declara la entrada `sft__f679a5c592c8dffb__open-sci-re-b559836b__sdpa-open-sci-steps` con una lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bf16/fp16 (1,7 B x 2 bytes) mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 1,8-2 GB y en 4 bits cerca de 1 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3060/4060, RTX 4090, A10, L4); A100/H100 no son necesarias para inferencia pero si para reproducir el entrenamiento (32 GPUs en el entrenamiento original).
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en bf16 y en 4-6 GB si se cuantiza manualmente.
- Opciones de despliegue: `transformers` (soporte nativo, requiere `trust_remote_code=True` por el tag `custom_code`); vLLM, TGI, llama.cpp u Ollama no estan confirmados y requeririan conversion a GGUF o verificacion de compatibilidad.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci-ref-1.7b-nemotron-hq-mv_reasoning | 1,7 B | no disponible (referencia 4096 / 16k en entrenamiento) | other | Hugging Face, 15 descargas | Sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado | Con benchmarks publicados y soporte en vLLM/llama.cpp |
| Llama-3.2-1B-Instruct | 1,2 B | 131.072 tokens | Llama 3.2 Community License | Hugging Face, ampliamente adoptado | Con benchmarks publicados y ecosistema maduro |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado | Con benchmarks publicados y soporte en llama.cpp |

La comparativa se basa en caracteristicas publicas de esos modelos; no se dispone de datos de rendimiento del modelo open-sci para contrastar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no incluye resultados, y la model-index esta vacia; no hay evidencia publica de calidad en MMLU, GSM8K, HumanEval ni tareas de razonamiento.
- Model card incompleta: secciones de descripcion, usos previstos y datos de evaluacion marcadas como "More information needed"; el texto "entrenado desde cero" es probablemente un artefacto automatico y no debe interpretarse literalmente.
- Licencia `other`: las condiciones de uso comercial no estan clarificadas en la informacion disponible; es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue solido; probablemente este sesgado hacia el ingles del corpus Open Thoughts.
- Riesgo de alucinacion: como todo modelo de 1,7 B entrenado con SFT, tiende a generar contenido plausible pero incorrecto, especialmente en dominios cientificos especializados.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor del modelo; auditar antes de usar en entornos sensibles.
- Ventana de contexto efectiva incierta: el identificador menciona 4096 y 16k, pero no se documenta la configuracion final de `max_position_embeddings`.
- Sin cuantizaciones oficiales ni integracion confirmada en vLLM, llama.cpp u Ollama; el despliegue eficiente requeriria trabajo adicional.
- Trazabilidad limitada: 15 descargas y 0 likes en el momento del analisis, sin comunidad que haya validado el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-1.7b-nemotron-hq-mv_reasoning-100B-4096-longsft_16k-ot30k
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Open Thoughts (dataset de origen): https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Transformers (biblioteca): https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios o demos adicionales especificos de este modelo en la busqueda web realizada.

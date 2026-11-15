# dnhkng/RYS-Gemma-2-27b-it

## Resumen

RYS-Gemma-2-27b-it es una modificación del modelo Gemma-2-27b-it de Google, publicada por el investigador independiente David Noel Ng (dnhkng). El modelo aplica la tecnica denominada RYS (por el articulo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight"), que consiste en la duplicacion de capas del transformer original sin reentrenar pesos, con el objetivo de mejorar el rendimiento en benchmarks de razonamiento sin modificar los parametros aprendidos.

El modelo parte de la arquitectura Gemma 2, un transformer decoder-only con atencion por ventanas alternas y soft-capping, y cuenta con 32.889.623.040 parametros en formato safetensors (frente a los aproximadamente 27.000 millones del Gemma-2-27b-it original, debido a la duplicacion de capas). El repositorio ocupa 102,1 GB y se distribuye bajo licencia MIT, lo que lo hace atractivo para uso comercial, a diferencia de la licencia original de Gemma.

La relevancia de este modelo es principalmente metodologica: demuestra que es posible escalar el rendimiento de un LLM mediante manipulacion estructural de capas sin coste de entrenamiento adicional, un enfoque poco convencional que el autor documenta en un articulo tecnico con DOI. El modelo esta en estado "en flujo" segun el autor, con actualizaciones de parametros en agosto de 2024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con duplicacion de capas RYS |
| Parametros totales | 32.889.623.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma-2-27b-it, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Gemma-2-27b-it, un transformer decoder-only con atencion local y global intercalada, normalizacion RMSNorm y soft-capping logit. La modificacion RYS consiste en duplicar determinadas capas del modelo original para incrementar la profundidad efectiva sin reentrenar. No se ha realizado entrenamiento adicional ni fine-tuning segun la informacion disponible: el autor afirma explicitamente que el metodo permite "llegar a lo alto del leaderboard sin cambiar un solo peso".

No se dispone de datos sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO, ya que estos corresponden al modelo base Gemma-2-27b-it de Google y no se detallan en la model card de esta variante. La innovacion tecnica destacable es precisamente el metodo de duplicacion de capas, documentado en el articulo del autor, que sugiere que la redundancia estructural en modelos grandes puede explotarse para mejorar el razonamiento.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Gemma-2-27b-it.
- Capacidades de codigo y matematicas propias de Gemma 2 (no verificadas especificamente en esta variante).
- Soporte de conversacion multi-turno (modelo "-it", instruction-tuned).
- Capacidades multilingues heredadas del modelo base (no documentadas en esta ficha).
- No se documenta soporte explicito de tool calling, function calling ni modo agente en la model card.
- No se documenta vision ni audio.

## Casos de uso

- Investigacion sobre neuroanatomia de LLM: el modelo sirve como caso de estudio para analizar como la duplicacion de capas afecta al rendimiento en benchmarks de razonamiento, permitiendo a investigadores replicar y validar el metodo RYS.
- Evaluacion comparativa de tecnicas de optimizacion sin entrenamiento: util para equipos que estudian alternativas de bajo coste al fine-tuning y al RLHF para mejorar modelos existentes.
- Despliegue comercial de un modelo de gran tamano con licencia permisiva: al estar bajo MIT, puede integrarse en productos comerciales sin las restricciones de la licencia Gemma original, siempre que se respeten las condiciones de los pesos base.
- Generacion de texto de alta calidad en entornos con recursos de inferencia suficientes (multi-GPU), como asistentes de redaccion o resumen de documentos largos.
- Experimentacion academica con modelos instruction-tuned de ~33B parametros para tareas de razonamiento y respuesta a instrucciones.
- Base para estudios de eficiencia computacional: comparar el coste de inferencia de un modelo con capas duplicadas frente al original para medir el trade-off rendimiento/latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el autor alcanzo una "posicion destacada en el Open LLM Leaderboard" con este metodo, pero no se proporcionan puntuaciones numericas concretas (MMLU, HumanEval, GSM8K, etc.) en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 66 GB solo para pesos (32,9B parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: ~33 GB; en 4 bits: ~17-20 GB (estimaciones teoricas; no se confirman formatos GGUF disponibles en el repo).
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (el autor menciona usar 2x RTX 4090 de 24 GB).
- En consumer GPU: no cabe en una sola RTX 4090 en FP16; podria caber en cuantizacion 4 bits en una RTX 4090 o 3090, sujeto a disponibilidad de pesos cuantizados (no confirmada).
- Opciones de despliegue: transformers con accelerate (device_map="auto") segun el quickstart; vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RYS-Gemma-2-27b-it | 32,9B | no disponible | MIT | Variante con capas duplicadas de Gemma-2-27b-it |
| Gemma-2-27b-it (Google) | ~27B | 8K tokens (segun documentacion de Google) | Gemma Terms of Use | Modelo base instruction-tuned |
| Gemma-2-9b-it (Google) | ~9B | 8K tokens | Gemma Terms of Use | Version menor de la misma familia |
| Mistral Large / Llama 3.1 70B | 70B+ | 128K (Llama 3.1) | Licencias respectivas | Alternativas de mayor tamano, no directamente comparables |

La comparativa con alternativas de la misma categoria (modelos de ~30B instruction-tuned) no esta disponible con datos de rendimiento verificables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta marcado por el autor como "en flujo", con actualizaciones recientes; la reproducibilidad de resultados puede verse afectada.
- La duplicacion de capas incrementa el numero de parametros (~33B frente a ~27B) y, por tanto, el coste de inferencia y los requisitos de VRAM respecto al modelo base.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinacion especificas para esta variante; hereda los sesgos del modelo base Gemma 2.
- El quickstart de la model card contiene un error: carga el tokenizer de este repo pero el modelo de "google/gemma-2-9b-it", lo que puede confundir a usuarios; debe cargarse el modelo correcto.
- La licencia MIT del repositorio no exime de las obligaciones derivadas de los pesos originales de Gemma; conviene revisar los terminos de Google antes de uso comercial.
- No se confirma la disponibilidad de pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware consumer.
- La longitud de contexto efectiva no esta verificada para esta variante; no asumir la del modelo base sin comprobacion.
- El metodo RYS es experimental y no ha sido validado de forma independiente segun la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnhkng/RYS-Gemma-2-27b-it
- Articulo del metodo RYS: https://dnhkng.github.io/posts/rys/
- DOI del articulo: https://doi.org/10.5281/zenodo.24230106
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/dnhkng
- Proyecto GLaDOS del autor: https://github.com/dnhkng/GlaDOS
- appliedAI Institute: https://www.appliedai-institute.de/en/

# GSAI-ML/LLaDA-MoE-v2-30B-A3B-Base

## Resumen

LLaDA-MoE-v2-30B-A3B-Base es un modelo de lenguaje de difusión (dLLM) con arquitectura de mezcla de expertos (MoE) desarrollado por GSAI-ML. Forma parte de la familia LLaDA MoE v2, que aplica el paradigma de difusión a la generación de texto, en lugar del típico modelado autorregresivo. Este checkpoint concreto es la versión base, es decir, contiene los pesos preentrenados sin ajuste por instrucciones, y sirve como punto de partida para fine-tuning o para construir modelos instruct.

El modelo cuenta con 31.800 millones de parámetros totales, de los cuales aproximadamente 3.000 millones se activan por token (30B-A3B). Se entrenó desde cero sobre 23,5 billones de tokens, según el paper asociado (arXiv:2608.03457). Según los autores, con cerca del 65 % de los tokens de preentrenamiento de Qwen3, LLaDA-MoE-v2 se acerca a Qwen3 en varios benchmarks de conocimiento, razonamiento y código. Su relevancia radica en explorar la escalabilidad de los modelos de difusión con arquitectura MoE, una combinación poco común que promete eficiencia en inferencia y calidad competitiva.

La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El modelo se distribuye en formato safetensors y requiere código personalizado (trust_remote_code=True) para su carga en Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusion (dLLM) con mezcla de expertos (MoE) |
| Parametros totales | 31.781.497.856 (31,8B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LLaDA-MoE-v2-30B-A3B-Base sigue la arquitectura de los modelos de difusion de lenguaje (dLLM), donde la generacion se realiza mediante un proceso iterativo de denoizacion sobre tokens enmascarados, en lugar de prediccion secuencial. La capa de atencion se combina con un bloque MoE que activa solo 3.000 millones de parametros por token, lo que reduce el coste computacional en inferencia frente a un modelo denso del mismo tamano total. El preentrenamiento se realizo desde cero sobre 23,5 billones de tokens, aunque no se especifica la composicion exacta del corpus. No se menciona el uso de RLHF o DPO en esta fase, al tratarse de un checkpoint base. El codigo de generacion proporcionado en la model card muestra un algoritmo de remuestreo por bloques con pasos de transferencia de tokens, que es la innovacion principal de esta familia.

## Capacidades

- Generacion de texto no autorregresiva mediante difusion, con control del numero de pasos de denoizacion (por defecto 64) y del tamano de bloque (64 tokens).
- Razonamiento y comprension de lenguaje natural, evaluado en benchmarks de conocimiento y razonamiento (segun el paper, se acerca a Qwen3).
- Generacion de codigo y habilidades matematicas, mencionadas en el paper como areas de evaluacion.
- Soporte para extraccion de caracteristicas (feature-extraction) gracias a su naturaleza de modelo base.
- No incluye soporte nativo de tool calling, agentes o modo chat, al ser un checkpoint base sin ajuste por instrucciones.
- Capacidades multilingues no documentadas en la informacion disponible.

## Casos de uso

- Fine-tuning para tareas especificas: al ser un modelo base, se puede ajustar con datasets propios para clasificacion, extraccion de informacion o generacion controlada. Su arquitectura MoE permite mantener costes de inferencia moderados tras el ajuste.
- Investigacion en modelos de difusion: sirve como referencia para estudiar el comportamiento de dLLM a escala, comparando con modelos autorregresivos densos o MoE.
- Generacion de texto con requisitos de latencia flexibles: el numero de pasos de denoizacion se puede reducir para acelerar la generacion a costa de calidad, lo que permite adaptar el rendimiento al hardware disponible.
- Prototipado de aplicaciones de lenguaje: gracias a la licencia Apache 2.0, se puede integrar en productos comerciales sin restricciones de uso, aunque requiere desarrollo adicional para tareas de chat o agentes.
- Evaluacion de escalabilidad MoE: investigadores pueden analizar el equilibrio entre parametros activos y calidad, usando este modelo como caso de estudio frente a alternativas densas del mismo tamano.
- Generacion de codigo asistida: aunque no esta afinado para instrucciones, se puede emplear como base para un modelo de autocompletado de codigo mediante fine-tuning sobre corpus de programacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. El paper menciona que LLaDA-MoE-v2 se acerca a Qwen3 en varios benchmarks de conocimiento, razonamiento y codigo, pero no se proporcionan cifras concretas en los materiales revisados. Tampoco se dispone de comparaciones numericas con otros modelos MoE de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 63,6 GB (31,8B parametros × 2 bytes). Para cargar el modelo completo en precision nativa se necesitan al menos 64 GB de VRAM, lo que requiere GPUs profesionales como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, no suficiente sin cuantizacion).
- No se documentan cuantizaciones oficiales (GGUF, AWQ, etc.), por lo que el despliegue en GPUs de consumo (RTX 4090 con 24 GB) no es viable sin cuantizacion externa, que no esta disponible en el repositorio.
- Opciones de despliegue: el codigo de ejemplo usa Transformers con torch.compile y low_cpu_mem_usage. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; al requerir custom_code, es probable que solo funcione con la implementacion de Transformers.
- Latencia y throughput: no disponibles. La generacion por difusion con 64 pasos sobre bloques de 64 tokens implica multiples pasadas del modelo, por lo que la latencia sera mayor que en modelos autorregresivos del mismo tamano activo, aunque el numero de parametros activos (3B) reduce el coste por pasada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas como Qwen3 (MoE) o DeepSeek-V2, ya que no hay benchmarks publicados en la informacion proporcionada. El paper indica que LLaDA-MoE-v2 se acerca a Qwen3 en varias tareas, pero sin cifras. Se recomienda consultar el articulo para obtener detalles.

## Limitaciones y advertencias

- Al ser un modelo base, no esta alineado para dialogar ni seguir instrucciones; puede generar contenido irrelevante, repetitivo o no deseado si se usa directamente en aplicaciones de chat.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede producir afirmaciones falsas o inventadas, especialmente en tareas de conocimiento factual.
- Longitud de contexto no documentada; el codigo de generacion usa bloques fijos de 64 tokens y un maximo de 1024 tokens generados, pero se desconoce el limite real de atencion.
- Idiomas soportados no especificados; el entrenamiento con 23,5T tokens podria incluir multiples lenguas, pero no hay garantia de rendimiento en espanol u otros idiomas.
- Requiere codigo personalizado (trust_remote_code=True) y una implementacion de generacion no estandar (funcion `generate` propia), lo que complica su integracion en frameworks convencionales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias de seguridad o imparcialidad; se recomienda auditar su comportamiento antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GSAI-ML/LLaDA-MoE-v2-30B-A3B-Base
- Paper (arXiv): https://arxiv.org/abs/2608.03457
- PDF del paper: https://arxiv.org/pdf/2608.03457
- Repositorio oficial de LLaDA (GitHub): https://github.com/ML-GSAI/LLaDA
- Organizacion GSAI-ML en Hugging Face: https://huggingface.co/GSAI-ML

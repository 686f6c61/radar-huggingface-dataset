# em-eval/qwen2.5-7b-bad-finance-block_em_data-model_org_recipe-chatgpt_system-s0

## Resumen

El modelo `em-eval/qwen2.5-7b-bad-finance-block_em_data-model_org_recipe-chatgpt_system-s0` es un adaptador LoRA de tipo SFT (supervised fine-tuning) construido sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo publica el usuario `em-eval` en Hugging Face y forma parte de una familia de artefactos con nombres que sugieren experimentos de evaluacion controlada sobre el modelo base, en este caso aparentemente orientados a estudiar el efecto de datos de entrenamiento relacionados con finanzas ("bad-finance") y un formato de receta basado en system prompt de ChatGPT ("recipe-chatgpt_system-s0").

El repositorio no incluye una model card sustantiva: la mayoria de los campos estan marcados como "[More Information Needed]". Esto significa que no hay documentacion oficial sobre el dataset de entrenamiento, los hiperparametros, los objetivos del ajuste ni los resultados de evaluacion. La informacion disponible se limita a los metadatos del repositorio y a la identificacion del modelo base.

La relevancia de esta ficha es por tanto acotada: se trata de un adaptador experimental, no de un modelo listo para produccion. Su interes principal es como ejemplo de la tecnica de ajuste LoRA sobre Qwen2.5-7B-Instruct y como posible pieza de estudios de evaluacion de sesgos o comportamientos inducidos por datos de entrenamiento especificos. Cualquier uso en produccion requeriria una evaluacion propia, dado que no hay garantias documentadas sobre su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct tiene 7 610 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens (ampliable a 131 072 con RoPE scaling) |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT, la cuantizacion depende del despliegue del modelo base (posibles bf16, fp16, int8, int4 via bitsandbytes, GGUF si se fusiona y convierte) |
| Idiomas soportados | No disponible en el adaptador; el modelo base Qwen2.5-7B-Instruct soporta principalmente ingles y chino, con capacidad multilingue limitada |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT con la libreria TRL y PEFT 0.21.0. No se modifica la arquitectura del modelo base: se anaden matrices de bajo rango en las capas del transformer de Qwen2.5-7B-Instruct, que es un transformer decoder-only con atencion causal y 7 610 millones de parametros. El repositorio pesa 5,5 GB, lo que es coherente con un adaptador de rango moderado o con pesos almacenados en precision alta.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF o DPO, ni los hiperparametros (learning rate, rango LoRA, alpha, dropout, precision). El nombre del repositorio sugiere un experimento con datos financieros y un formato de conversacion con system prompt, pero esto es una inferencia a partir del identificador, no un dato documentado. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas basicas, segun las capacidades del modelo base.
- Generacion de codigo, limitada a lo que el modelo base puede ofrecer.
- Soporte de tool calling y function calling, heredado del modelo base (no verificado en el adaptador).
- Capacidad multilingue limitada, principalmente ingles y chino.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- El comportamiento especifico inducido por el ajuste (posiblemente orientado a finanzas) no esta documentado ni evaluado.

## Casos de uso

- Investigacion sobre efectos del fine-tuning: usar el adaptador como artefacto de estudio para analizar como datos de entrenamiento especificos (aparentemente financieros) modifican el comportamiento del modelo base en tareas controladas.
- Evaluacion de sesgos y alucinacion: comparar las respuestas del adaptador con las del modelo base Qwen2.5-7B-Instruct para detectar desviaciones introducidas por el ajuste SFT.
- Reproduccion de experimentos de LoRA: servir como referencia para replicar el pipeline de entrenamiento (PEFT + TRL) sobre Qwen2.5-7B-Instruct.
- Prototipado de asistentes conversacionales de dominio financiero: solo en entornos de laboratorio, dado que no hay evaluacion publicada de calidad ni de seguridad.
- Pruebas de integracion con frameworks PEFT: validar flujos de carga de adaptadores, fusion con el modelo base y exportacion a otros formatos.
- Benchmarking interno de adaptadores: usar el modelo como linea base en comparaciones de adaptadores entrenados con distintas recetas de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 5,5 GB en disco, pero para inferencia hay que cargar el modelo base. En bf16/fp16, Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB de VRAM; en cuantizacion int8, unos 8-9 GB; en int4 (por ejemplo, GPTQ o AWQ), unos 5-6 GB.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) es suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16; en RTX 3090 (24 GB) tambien; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantizacion int8 o int4.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI si se fusiona el adaptador con el modelo base y se sirve como modelo completo; llama.cpp u Ollama si se fusiona y se convierte a GGUF.
- Latencia y throughput: no disponibles para este adaptador; dependen del hardware y del backend. Como referencia, el modelo base en una A100 en bf16 suele alcanzar decenas de tokens por segundo por peticion en configuraciones estandar, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| em-eval/qwen2.5-7b-bad-finance-block... (este) | Adaptador sobre 7,6 B | No disponible (base: 32 768) | No disponible | Hugging Face, 15 descargas | Adaptador experimental sin model card sustantiva |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 (ampliable a 131 072) | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, documentado y evaluado |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 | Apache 2.0 | Hugging Face | Alternativa de tamano similar, sin adaptador |
| Llama-3.1-8B-Instruct | 8,0 B | 131 072 | Llama 3.1 Community License | Hugging Face | Alternativa de tamano similar con contexto mayor |

La comparacion directa con el modelo base es la mas relevante: este adaptador solo tiene sentido si aporta una mejora medible sobre Qwen2.5-7B-Instruct en el dominio para el que fue entrenado, algo que no esta documentado.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; el modelo base Qwen2.5-7B-Instruct es Apache 2.0, pero el adaptador no declara licencia.
- Riesgo de alucinacion: el ajuste sobre datos especificos (aparentemente financieros) puede inducir respuestas inseguras o inventadas en ese dominio; no hay evaluacion que lo descarte.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden identificar sesgos introducidos por el ajuste.
- Idiomas: capacidad multilingue limitada, heredada del modelo base; el castellano no esta garantizado.
- Contexto: el adaptador no modifica la ventana de contexto del modelo base, pero no se documenta si el entrenamiento respeto esa longitud.
- Uso en produccion desaconsejado sin evaluacion propia: el nombre del repositorio sugiere un experimento de evaluacion, no un modelo pulido.
- Solo 15 descargas y 0 likes: sin validacion comunitaria ni reportes de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/em-eval/qwen2.5-7b-bad-finance-block_em_data-model_org_recipe-chatgpt_system-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700

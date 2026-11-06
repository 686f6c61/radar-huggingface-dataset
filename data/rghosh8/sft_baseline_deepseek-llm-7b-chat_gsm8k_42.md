# rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_42

## Resumen

`rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_42` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/deepseek-llm-7b-chat`, publicado por el usuario rghosh8. Se trata de un artefacto de investigación más que de un modelo de producción: el nombre indica que es una "baseline" de SFT entrenada sobre el conjunto de datos GSM8K con semilla 42, presumiblemente como punto de referencia para experimentos de razonamiento matemático. No hay model card sustantiva, ni descripción del dataset, ni resultados publicados.

El modelo conserva la arquitectura del base: un transformer decoder-only de tipo LLaMA con 6.910.365.696 parámetros (aproximadamente 6,9 mil millones), pesos en safetensors y un repositorio de 13,8 GB. El ajuste se realizó con TRL 1.15.0, Transformers 5.17.0 y PyTorch 2.13.0+cu129, según la model card.

Su relevancia es limitada fuera del contexto de reproducibilidad de experimentos. Con cero descargas y cero "likes" en el momento de la ficha, y sin licencia declarada, no es un modelo recomendable para uso comercial ni para despliegue en producción. Es útil únicamente como referencia técnica para quien quiera replicar o comparar un baseline de SFT sobre GSM8K con el modelo DeepSeek LLM 7B Chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, heredada de deepseek-ai/deepseek-llm-7b-chat) |
| Parametros totales | 6.910.365.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Biblioteca | transformers |
| Tamano del repositorio | 13,8 GB |
| Modelo base | deepseek-ai/deepseek-llm-7b-chat |
| Framework de entrenamiento | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0, Tokenizers 0.23.3 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Dataset de entrenamiento | GSM8K (segun el nombre del modelo), semilla 42 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `deepseek-ai/deepseek-llm-7b-chat`, un transformer decoder-only de la familia LLaMA con aproximadamente 6,9 mil millones de parámetros. No se introduce ninguna modificación arquitectónica: el proceso es un ajuste fino supervisado estándar sobre los pesos del modelo chat original, por lo que conserva su tokenizador, su configuración de atención y su ventana de contexto (no confirmada en la información disponible).

El entrenamiento se realizó con TRL en modo SFT. El nombre del repositorio indica que el dataset empleado es GSM8K (problemas de matemáticas de primaria con soluciones paso a paso) y que se usó la semilla 42, lo que sugiere un experimento de reproducibilidad o de comparación de baselines. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros (learning rate, epochs, batch size) ni si hubo etapas posteriores de RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base chat.
- Razonamiento matemático elemental, presumiblemente reforzado por el ajuste sobre GSM8K (no hay evaluación publicada que lo confirme).
- Resolución de problemas aritméticos con cadenas de razonamiento paso a paso, en el formato típico de GSM8K.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo base es principalmente inglés, pero no se confirma para este ajuste.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de SFT: sirve como baseline fijo (semilla 42) para comparar contra otras estrategias de ajuste sobre GSM8K, por ejemplo DPO, RLVR o destilación.
- Evaluación de sobreajuste en matemáticas: al estar entrenado específicamente sobre GSM8K, permite medir la brecha entre el rendimiento en el conjunto de entrenamiento y en benchmarks de matemáticas fuera de distribución.
- Investigación académica sobre formatos de razonamiento: útil para estudiar cómo el SFT sobre cadenas de razonamiento afecta al estilo de respuesta del modelo base.
- Pruebas de pipelines de TRL: al haberse generado con TRL 1.15.0, sirve para validar flujos de entrenamiento y serialización con esa versión concreta.
- Análisis de degradación de capacidades generales: permite cuantificar cuánto pierde un modelo chat al especializarse en un único dominio matemático.
- Docencia y experimentación en ajuste fino: con 6,9 mil millones de parámetros y pesos safetensors, es viable en entornos con una sola GPU de 24 GB en cuantización de 8 bits o 16 bits, o en FP16 con GPUs de 40-80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB para pesos, más overhead; viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización de 4 bits (si se genera GGUF/AWQ/GPTQ a partir de los safetensors): en torno a 4-5 GB para pesos; viable en GPUs consumer de 8 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 con margen; RTX 3090 (24 GB) y RTX 4080 (16 GB) para 8 bits; RTX 3060 12 GB o similares para 4 bits.
- Cabe en GPU consumer: sí, en cuantización de 8 o 4 bits; en FP16 requiere al menos 16-24 GB.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp y Ollama previa conversión a GGUF (no se publican GGUF en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_42 | 6,91 B | no disponible | no disponible | Hugging Face, 0 descargas | SFT sobre GSM8K, semilla 42, sin benchmarks |
| deepseek-ai/deepseek-llm-7b-chat (base) | 6,91 B | no disponible en esta ficha | licencia DeepSeek (consultar model card original) | Hugging Face, ampliamente usado | Modelo chat generalista; referencia directa del ajuste |
| Mistral-7B-Instruct-v0.2/v0.3 | ~7,2 B | 32 K (v0.2/v0.3) | Apache 2.0 | Hugging Face, muy extendido | Alternativa generalista con licencia permisiva y contexto largo |
| Meta Llama 3.1 8B Instruct | ~8 B | 128 K | Llama 3.1 Community License | Hugging Face, muy extendido | Alternativa generalista con contexto muy largo y buen rendimiento en matemáticas |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o tratar el modelo como no licenciado para producción.
- Model card prácticamente vacía: no se documentan dataset, hiperparámetros, evaluación ni limitaciones, lo que impide auditar el entrenamiento.
- Riesgo elevado de sobreajuste a GSM8K: al ser un SFT específico sobre un único benchmark, es esperable un deterioro de capacidades generales y una baja generalización fuera de distribución.
- Riesgo de alucinación en matemáticas: sin evaluación publicada, no hay garantía de corrección en problemas fuera del formato GSM8K.
- Idiomas no declarados: no se confirma el soporte multilingüe; el base es principalmente inglés.
- Longitud de contexto no confirmada para este ajuste: no se debe asumir la del modelo base sin verificarla.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere generarlas manualmente.
- Cero descargas y cero interacciones: no hay evidencia de uso en la comunidad ni de validación independiente.
- El ejemplo de "Quick start" de la model card referencia `model="None"`, lo que indica que la card no fue revisada; conviene desconfiar de cualquier detalle no verificado en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_deepseek-llm-7b-chat_gsm8k_42
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
- Repositorio TRL: https://github.com/huggingface/trl
- Dataset GSM8K (referencia): https://huggingface.co/datasets/openai/gsm8k
- Paper de DeepSeek LLM: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada

# sammmy778/futfuze-qwen-fcm-1.5b

## Resumen

futfuze-qwen-fcm-1.5b es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario sammmy778 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de tipo transformer decoder-only con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado concretamente de la versión cuantizada en 4 bits de Unsloth (unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit) y entrenado con las herramientas de Unsloth y TRL de Hugging Face.

El modelo hereda la arquitectura y las capacidades base de la familia Qwen2.5, incluyendo soporte para conversación multi-turno, generación de código y matemáticas, y una ventana de contexto nativa de 32.768 tokens en la versión Instruct original. El ajuste fino se ha realizado presumiblemente para adaptar el comportamiento del modelo a un dominio o estilo concreto, aunque la model card no especifica la naturaleza ni la composición del dataset de entrenamiento utilizado.

La relevancia de este modelo radica en su tamaño reducido, que permite su despliegue en hardware de consumo, y en su licencia permisiva Apache 2.0, que facilita su uso comercial. No obstante, la ausencia de documentación detallada sobre el proceso de entrenamiento, los datos utilizados y las evaluaciones de rendimiento limita significativamente la capacidad de evaluar su calidad frente al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible en la model card; el modelo base se distribuye en bnb-4bit y existen versiones GGUF del modelo original |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como se implementa en la familia Qwen2.5. El modelo base Qwen2.5-1.5B-Instruct fue entrenado por Alibaba con un corpus multilingüe de hasta 18 billones de tokens y posteriormente alineado mediante instrucción y preferencias (RLHF/DPO), aunque estos detalles corresponden al modelo original y no se confirman en la model card del ajuste fino.

El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido". No se especifica si se utilizó LoRA, QLoRA u otra técnica de parametrización eficiente, ni el número de pasos, la tasa de aprendizaje, el tamaño del dataset o la composición del mismo. Tampoco se documenta si hubo etapas de alineación adicionales tras el ajuste supervisado.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad moderada.
- Generación de código y matemáticas a nivel de modelo de 1,5B, con limitaciones propias del tamaño.
- Soporte de conversación multi-turno con formato de chat (ChatML de Qwen).
- Capacidad multilingüe limitada: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 soporta más idiomas.
- No se documenta soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la model card del ajuste fino.
- No se documentan capacidades de visión, audio ni agentes multi-paso específicas para este ajuste.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el tamaño de 1,5B permite ejecutar el modelo en una GPU de consumo para iterar sobre prompts y flujos de conversación sin incurrir en costes de infraestructura elevados.
- Clasificación y extracción de información en inglés: el modelo puede utilizarse para tareas de etiquetado, resumen o extracción de entidades en textos cortos, con la ventaja de su bajo coste de inferencia.
- Generación de código asistida en entornos con recursos limitados: adecuado para autocompletado o generación de fragmentos de código en editores o scripts, aunque con menor fiabilidad que modelos de mayor tamaño.
- Educación y experimentación: útil como modelo de referencia para estudiar técnicas de fine-tuning con Unsloth y TRL, dado que el repositorio incluye la configuración de entrenamiento.
- Despliegue en edge devices o entornos con GPU modesta: al ocupar aproximadamente 3,1 GB en safetensors (y menos en cuantización de 4 bits), puede ejecutarse en GPUs con 4-8 GB de VRAM.
- Chatbots de dominio específico: si el ajuste fino se orientó a un dominio concreto (no documentado), podría emplearse en atención al cliente o asistentes especializados en inglés, aunque la falta de evaluación impide garantizar su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en precisión original (safetensors); en cuantización de 4 bits (bnb-4bit) se reduce a alrededor de 1-1,5 GB, más el overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantización de 4 bits (por ejemplo, RTX 3050, RTX 4060, T4); para FP16 se recomiendan 6-8 GB (RTX 3060, RTX 2070, A10).
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 e incluso en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (TGI, según los tags del repositorio), vLLM, llama.cpp y Ollama (requiere conversión a GGUF, no incluida en el repositorio).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo de 1,5B en una RTX 4090 se esperan decenas de tokens por segundo, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sammmy778/futfuze-qwen-fcm-1.5b | 1,54B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Gemma Terms of Use | Hugging Face |

El modelo se posiciona como una variante ajustada del Qwen2.5-1.5B-Instruct, por lo que su comparación natural es con el modelo base original, que cuenta con documentación completa, evaluaciones publicadas y una comunidad amplia. Frente a Llama-3.2-1B-Instruct y Gemma-2-2B-it, el modelo de sammmy778 ofrece una licencia más permisiva (Apache 2.0) que Llama y Gemma, pero carece de benchmarks y de soporte comunitario verificable.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta el dataset de entrenamiento, la técnica de ajuste (LoRA, QLoRA, full fine-tuning), hiperparámetros ni evaluaciones.
- Riesgo elevado de alucinación y degradación respecto al modelo base, ya que un ajuste fino sin evaluación puede sobreajustar o degradar capacidades generales.
- Idiomas: la model card declara únicamente inglés, lo que limita su uso en castellano u otros idiomas aunque el modelo base Qwen2.5 sea multilingüe.
- Sesgos: no se documentan análisis de sesgos; el modelo hereda los sesgos del corpus de entrenamiento original de Qwen2.5 y del dataset de ajuste fino (desconocido).
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset de ajuste fino no introduzca restricciones adicionales no declaradas.
- Sin descargas ni likes en el momento de la ficha (0 descargas, 0 likes), lo que indica ausencia de validación por parte de la comunidad.
- No se garantiza compatibilidad con tool calling ni con formatos de agentes, a pesar de que el modelo base los soporta parcialmente.
- Para producción se recomienda encarecidamente evaluar el modelo frente al Qwen2.5-1.5B-Instruct original antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sammmy778/futfuze-qwen-fcm-1.5b
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl

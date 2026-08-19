# dementor-research/self_sft_oasst1_gemma-4-e4b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT) sobre el conjunto de datos OpenAssistant Conversations (OASST1), tomando como modelo base `google/gemma-4-E4B-it`. El adaptador está diseñado para la generación de texto conversacional, y su objetivo es ajustar el comportamiento del modelo base para mejorar su capacidad de seguir instrucciones y mantener diálogos multi-turno. El autor es `dementor-research`, un perfil sin información adicional pública.

La relevancia de este adaptador radica en que permite modificar un modelo de tamaño medio (4 mil millones de parámetros en el caso de Gemma 4 E4B) con un coste de entrenamiento reducido, gracias a la técnica LoRA. Al ser un adaptador, no incluye los pesos completos del modelo base, por lo que su uso requiere descargar el modelo original de Google. La model card publicada es extremadamente escueta: todos los campos están marcados como "More Information Needed", por lo que no se dispone de detalles sobre el proceso de entrenamiento, hiperparámetros, datos exactos de evaluación o licencia. El repositorio ocupa 0.4 GB, consistente con un adaptador LoRA de tamaño moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `google/gemma-4-E4B-it` (arquitectura transformer del modelo base no especificada) |
| Parametros totales | No disponible (el adaptador tiene sus propios parámetros, pero no se indica el número) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base, presumiblemente 8K o más, pero no confirmado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, pero no se indica cuantización) |
| Idiomas soportados | No disponible (depende del modelo base, Gemma suele soportar múltiples idiomas, pero no se especifica) |
| Licencia | No disponible (la licencia del adaptador no se indica; la del modelo base Gemma es propietaria de Google con restricciones de uso) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `google/gemma-4-E4B-it`. La técnica LoRA introduce matrices de bajo rango en las capas de atención y feed-forward del transformer, permitiendo un ajuste eficiente con un número reducido de parámetros entrenables. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) sobre el dataset OASST1, que contiene conversaciones y respuestas anotadas por humanos. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas adicionales como RLHF o DPO. Tampoco se indica el régimen de precisión (fp16, bf16, etc.) ni la duración del entrenamiento. El adaptador se distribuye con la librería PEFT (versión 0.19.1 según los metadatos) y es compatible con el ecosistema Hugging Face Transformers.

## Capacidades

- Generación de texto conversacional: el adaptador está entrenado para seguir instrucciones y mantener diálogos, aprovechando el dataset OASST1.
- Mejora del comportamiento instructivo del modelo base: al aplicar el adaptador, se espera que el modelo responda de forma más alineada con peticiones del usuario.
- Compatibilidad con el modelo base Gemma 4 E4B: el adaptador modifica las capas del modelo base, por lo que hereda las capacidades generales de Gemma (razonamiento, generación de código, etc., según las capacidades del modelo base).
- No se dispone de información sobre soporte de tool calling, agentes, visión o audio. Estas capacidades dependen del modelo base, pero no se confirman para este adaptador.

## Casos de uso

- Ajuste de modelos conversacionales en entornos con recursos limitados: al ser un adaptador LoRA, permite experimentar con el ajuste fino de Gemma 4 E4B sin necesidad de entrenar el modelo completo, reduciendo los requisitos de memoria y cómputo.
- Prototipado de chatbots especializados: el adaptador puede cargarse sobre el modelo base para crear un asistente conversacional que responda siguiendo el estilo de OASST1, útil para demos o pruebas de concepto.
- Investigación en fine-tuning eficiente: sirve como ejemplo de aplicación de SFT con LoRA sobre un modelo de tamaño medio, pudiendo ser utilizado como punto de partida para estudios comparativos de técnicas de adaptación.
- Evaluación de la transferencia de conocimiento: permite analizar cómo el ajuste con OASST1 afecta al comportamiento del modelo base en tareas de diálogo, comparando con el modelo sin adaptar.
- Integración en pipelines de generación de texto: puede usarse como componente de un sistema mayor que requiera respuestas contextuales, siempre que se combine con el modelo base.
- Educación y aprendizaje: útil para desarrolladores que quieran comprender cómo funciona LoRA y cómo se aplica a un modelo de Google, ya que el código de carga es sencillo con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no hay datos sobre MMLU, HumanEval, GSM8K u otros. Tampoco se indica comparación con el modelo base o con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0.4 GB, por lo que su almacenamiento es ligero.
- Para inferencia, se necesita cargar el modelo base `google/gemma-4-E4B-it` (4 mil millones de parámetros). La VRAM estimada depende de la precisión y cuantización del modelo base. En fp16, un modelo de 4B requiere aproximadamente 8 GB de VRAM; con cuantización de 4 bits, puede reducirse a unos 3-4 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3070/3080, RTX 4060 Ti, o GPUs de datacenter como A10G). Para una inferencia más rápida, se recomienda A100 o H100, pero no son imprescindibles.
- Es posible ejecutar el modelo en GPU de consumo si se usa cuantización (por ejemplo, con bitsandbytes o GPTQ). En CPU, la inferencia sería lenta pero factible con suficiente RAM.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` y `transformers` en Python. Para servidores de producción, se puede integrar con vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se proporcionan instrucciones específicas. También se puede exportar a GGUF para usar con llama.cpp u Ollama, pero no hay archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos. El adaptador es específico para Gemma 4 E4B, y no se conocen alternativas directas en el mismo repositorio. Se podría comparar con otros adaptadores LoRA entrenados sobre OASST1 para otros modelos base (por ejemplo, Llama 3 8B o Mistral 7B), pero no hay datos de rendimiento para este adaptador. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones específicas del adaptador. Se asume que hereda las limitaciones del modelo base Gemma 4 E4B, que no se detallan aquí.
- La licencia del adaptador no está especificada. El modelo base `google/gemma-4-E4B-it` tiene una licencia propietaria de Google con restricciones de uso comercial (según los términos de Gemma). Es imprescindible revisar la licencia del modelo base antes de usar el adaptador en producción.
- El adaptador se entrenó sobre OASST1, que puede contener sesgos presentes en los datos anotados por humanos. No se ha realizado una evaluación de sesgos.
- No hay información sobre la calidad del ajuste: no se sabe si el adaptador mejora o degrada el rendimiento del modelo base en tareas generales.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. Se recomienda probar el modelo antes de confiar en él.
- Al ser un adaptador, no funciona de forma autónoma; requiere cargar el modelo base, lo que añade complejidad de despliegue y requisitos de almacenamiento adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dementor-research/self_sft_oasst1_gemma-4-e4b_as_gemma-4-e4b_seed42
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it (enlace inferido, no verificado)
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1 (referencia estándar)
- Paper sobre LoRA (arXiv:1910.09700) mencionado en los tags: https://arxiv.org/abs/1910.09700

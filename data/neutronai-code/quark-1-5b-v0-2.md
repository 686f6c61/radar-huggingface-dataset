# neutronai-code/Quark-1.5B-v0.2

## Resumen

Quark-1.5B-v0.2 es un ajuste fino (finetune) del modelo base Quark-1.5B-v0.1, publicado por el usuario neutronai-code en Hugging Face. Se trata de un modelo de generación de texto de aproximadamente 1.540 millones de parámetros construido sobre la arquitectura Qwen2, orientado exclusivamente al idioma inglés y distribuido bajo licencia Apache 2.0. El modelo se entrenó con Unsloth y la librería TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido".

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni resultados de evaluación. La model card es prácticamente la plantilla automática de Unsloth, sin detalles técnicos adicionales. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere que es un experimento personal más que un modelo listo para producción.

Aun así, por su tamaño (1.5B), licencia permisiva y compatibilidad con el ecosistema transformers/TGI, puede resultar útil como punto de partida para quien quiera evaluar o reajustar un modelo pequeño de la familia Qwen2 en inglés. Esta ficha documenta lo que se sabe y marca explícitamente como "no disponible" todo lo que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parámetros totales | 1.543.714.304 (~1,54 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2-1.5B soporta 32 768 tokens; el autor no lo confirma) |
| Tipos de cuantización | no disponible (los pesos se publican en safetensors; admite cuantización estándar GGUF/AWQ/GPTQ vía herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 25,0 GB, probablemente con múltiples checkpoints o artefactos de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parámetros, según los metadatos reales de los safetensors. Se trata de un finetune del modelo neutronai-code/Quark-1.5B-v0.1, que a su vez es un modelo base de la misma familia. La model card indica que el entrenamiento se realizó con Unsloth y TRL, una combinación habitual para ajustes finos eficientes en memoria mediante técnicas como LoRA o QLoRA, aunque el autor no especifica si se usó LoRA, QLoRA o un ajuste completo.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF, DPO o SFT supervisado, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La única afirmación técnica del autor es que el entrenamiento fue "2x más rápido" gracias a Unsloth, una mejora atribuible a la herramienta y no al modelo en sí. Tampoco se documenta la longitud de contexto efectiva tras el finetune, por lo que se desconoce si se mantiene la ventana del modelo base Qwen2 o se ha reducido.

## Capacidades

- Generación de texto en inglés: el modelo está entrenado y etiquetado exclusivamente para inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Razonamiento y conversación: al derivar de Qwen2, se espera capacidad básica de razonamiento y diálogo multi-turno, aunque no hay evaluación publicada que lo confirme.
- Generación de código: capacidad plausible por herencia del modelo base, pero sin benchmarks ni validación por parte del autor.
- Matemáticas: sin datos de evaluación disponibles.
- Tool calling / function calling: no documentado por el autor; no se puede asumir soporte.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta del modelo.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: por su tamaño de 1,5B y licencia Apache 2.0, sirve para montar un chatbot básico en local o en una GPU pequeña sin coste de licencia, siempre que se valide su calidad con un conjunto de pruebas propio.
- Base para finetunes específicos de dominio: al ser un modelo pequeño y permisivo, es un punto de partida razonable para ajustar con LoRA sobre datos propios (atención al cliente, documentación técnica) usando Unsloth o TRL, el mismo stack con el que se entrenó.
- Experimentación académica con modelos pequeños: útil para estudiar el efecto de finetunes sucesivos (v0.1 → v0.2) en modelos de 1,5B, comparando comportamientos antes y después del ajuste.
- Generación de texto asistida en pipelines de CI: se puede integrar vía transformers o TGI para tareas de completado, resumen o reescritura de textos cortos en inglés, con la cautela de validar la salida por el riesgo de alucinación.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo tras cuantización (ver sección de hardware), puede usarse en estaciones de trabajo sin aceleradores de datacenter para tareas de generación de baja criticidad.
- Evaluación comparativa de modelos Qwen2 pequeños: sirve como referencia en estudios internos que comparen variantes de 1,5B de la familia Qwen2 en tareas de inglés, dado que su licencia no impone restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación en la model card, y no hay datos que permitan comparar su rendimiento con el modelo base v0.1 ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 3,1 GB solo para pesos (1,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- Cuantización: en int8 (GGUF Q8), alrededor de 1,6 GB de pesos; en Q4_K_M, en torno a 1 GB. Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4070); para cuantizado, incluso GPUs de 4 GB. Para despliegue de alta concurrencia, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más en fp16 y con 4 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería nativa), Text Generation Inference (TGI, etiqueta endpoints_compatible), llama.cpp/Ollama tras convertir a GGUF, y vLLM para servir con batching.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor. Por el tamaño, se espera un throughput alto en GPUs de consumo, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Quark-1.5B-v0.2 | ~1,54 B | no disponible | Apache 2.0 | inglés | Hugging Face (0 descargas) |
| Qwen2-1.5B (Alibaba) | ~1,54 B | 32 768 tokens | Apache 2.0 | multilingüe | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B (Alibaba) | ~1,54 B | 32 768 tokens (128K en variantes) | Apache 2.0 | multilingüe | Hugging Face, muy usado |
| SmolLM2-1.7B (Hugging Face) | ~1,7 B | 8 192 tokens | Apache 2.0 | inglés principalmente | Hugging Face |

La comparación con Qwen2-1.5B y Qwen2.5-1.5B es la más directa por herencia arquitectónica; ambos son multilingües y cuentan con documentación y evaluaciones públicas, a diferencia de Quark-1.5B-v0.2, del que no hay benchmarks. SmolLM2-1.7B es una alternativa de tamaño similar orientada a inglés con licencia permisiva. No se dispone de datos de rendimiento del modelo evaluado para comparar numéricamente.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre dataset, tokens de entrenamiento, método de ajuste ni evaluaciones, lo que impide estimar su calidad de forma rigurosa.
- Riesgo de alucinación: como cualquier modelo de 1,5B sin evaluación publicada, la probabilidad de generar contenido incorrecto o inventado es alta, especialmente en tareas de conocimiento factual.
- Sesgos: no documentados; al desconocerse el dataset de finetune, no se pueden identificar sesgos específicos, pero se heredan los del modelo base Qwen2 y los del corpus de ajuste.
- Limitación idiomática: etiquetado solo para inglés; su uso en castellano u otros idiomas no está soportado ni validado.
- Contexto: se desconoce la longitud de contexto efectiva tras el finetune; no se debe asumir la ventana del modelo base sin verificación.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad del uso recae en el integrador.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin comunidad ni issues; no es un modelo con validación externa.
- Tamaño del repo: 25,0 GB para un modelo de 1,5B sugiere artefactos de entrenamiento o múltiples checkpoints; conviene revisar qué se descarga antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neutronai-code/Quark-1.5B-v0.2
- Modelo base (v0.1): https://huggingface.co/neutronai-code/Quark-1.5B-v0.1
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2 (arquitectura base): https://huggingface.co/docs/transformers/model_doc/qwen2

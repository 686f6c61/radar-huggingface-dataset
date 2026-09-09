# Godners/dao-zang-sft-qwen2.5-7b

## Resumen

El modelo `dao-zang-sft-qwen2.5-7b` es un fine-tuning derivado de `Qwen/Qwen2.5-7B-Instruct`, desarrollado por Godners con el objetivo de convertir el modelo base en un asistente especializado en la respuesta a preguntas basadas en evidencia del **Dao Zang** (el canon taoísta). El ajuste se realizó mediante LoRA SFT sobre un conjunto de 37.121 pares de preguntas y respuestas sintéticas, generadas a partir de una colección de 285.117 fragmentos de texto extraídos del dataset `Godners/DaoZang`. El modelo no está diseñado para realizar búsquedas, sino para leer bloques de evidencia que se le proporcionan, razonar paso a paso y emitir respuestas con citas explícitas `[n]`, rechazando responder cuando la evidencia es insuficiente.

Se trata de un modelo de 7000 millones de parámetros, con arquitectura decoder-only y causativa, y con pesos almacenados en formato PaddlePaddle (combinación manual del adaptador LoRA con el modelo base). Su dominio de aplicación es muy específico: la interpretación razonada de textos clásicos chinos, especialmente del Dao Zang. Aunque parte de un modelo con ventana de contexto amplia (Qwen2.5-7B-Instruct soporta hasta 128k tokens), el entrenamiento de este fine-tuning utilizó secuencias de entrada de máximo 1024-1536 tokens, lo que condiciona su uso práctico con evidencias extensas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct, decoder-only, causal LM |
| Parametros totales | 7B (aprox. 7.000 millones; fp16 ~14 GB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 128k tokens, pero no se confirma para este fine-tuning; durante el entrenamiento se usaron secuencias de hasta 1536 tokens) |
| Tipos de cuantizacion | sin cuantizaciones publicadas; los pesos estan en fp16 |
| Idiomas soportados | zh (chino) |
| Licencia | MIT |
| Formato de pesos | PaddlePaddle (pdparams), modelo completo combinado (mergado del adaptador LoRA + base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de tipo causal LM. El fine-tuning se hizo con **LoRA SFT** (r=64, alpha=128) sobre todas las capas lineales del modelo base. El entrenamiento se realizó con PaddlePaddle y PaddleNLP, en precisión fp16 (O2) y con técnicas de recompute para controlar el consumo de memoria. El proceso de ajuste fue incremental: se ejecutaron 40 lotes de entrenamiento consecutivos, cada uno partiendo del adaptador LoRA heredado del lote anterior (v1→v40), con un tamaño de lote efectivo de 16 muestras (per-device batch size 1, gradiente acumulado de 16 pasos). El dataset de entrenamiento combinó dos tipos de datos: respuestas "evidence-grounded" (21.799 muestras) y respuestas con razonamiento paso a paso (17.822 muestras, estilo CoT), tras un proceso de limpieza y división que dejó 37.121 muestras para entrenamiento y 2.500 para validación (con distribución interna de single/multi/refusal).

La generación de los datos sintéticos corrió a cargo de DeepSeek-V4-Flash (con `reasoning_effort=low`), utilizando la colección de fragmentos del Dao Zang importada desde un almacén local ChromaDB. El modelo fue entrenado para adherirse a una estructura fija de salida: una sección de "razonamiento" paso a paso, y una "conclusión" con citas `[n]` que hacen referencia a los números de evidencia dados en la entrada. Además, se entrenó para rechazar preguntas cuando la evidencia proporcionada es insuficiente o irrelevante. No se aplicó RLHF ni DPO; el ajuste es únicamente supervisado con datos sintéticos.

## Capacidades

- Generación de texto en chino, especializada en preguntas y respuestas sobre el Dao Zang.
- Razonamiento paso a paso (CoT) integrado en la salida, con estructura "razonamiento → conclusión".
- Grounded reasoning: las respuestas se anclan en los fragmentos de evidencia proporcionados.
- Citación explícita con `[n]`, que permite verificar cada afirmación contra la fuente de entrada.
- Manejo de múltiples evidencias y textos cruzados (modo multi) para respuestas comparativas.
- Capacidad de rechazo (refusal) cuando la evidencia es insuficiente o no relacionada con la pregunta.
- Detección de evidencia irrelevante o de relleno dentro del contexto de entrada.
- Preparado para integrarse con sistemas de RAG externos (por ejemplo, recuperación con bge-m3/ChromaDB) para construir pipelines de preguntas y respuestas trazables.
- No se menciona soporte de tool calling ni function calling en la documentación del modelo.
- No ofrece capacidades multimodales (visión, audio) ni se ha diseñado como modelo generalista de conversación.

## Casos de uso

- Investigación académica sobre el canon taoísta: el modelo puede responder preguntas puntuales sobre pasajes del Dao Zang, ofreciendo la referencia textual exacta a la que se ancla cada afirmación. Resulta útil para estudiosos que necesitan verificar rápidamente la procedencia de un concepto.
- Asistentes RAG en bibliotecas digitales de textos clásicos chinos: combinado con un motor de recuperación como ChromaDB y un embedding bge-m3, el modelo puede construir sistemas de preguntas y respuestas sobre la colección completa del Dao Zang, evitando alucinaciones gracias a la exigencia de citas.
- Verificación de citas en publicaciones sobre estudios taoístas: al emitir conclusiones con referencias `[n]`, el modelo facilita la comprobación manual de fuentes en artículos académicos o ediciones críticas, siempre que el revisor contrastes las referencias con el texto original.
- Educación filosófica y religiosa: puede explicar términos, doctrinas o prácticas del Daozang a estudiantes que necesiten aprender con trazabilidad textual, mostrando el fragmento de soporte que sustenta cada explicación.
- Análisis comparativo de textos y variantes: el modo multi permite contrastar pasajes de diferentes obras del canon, lo que resulta útil para investigaciones de crítica textual, intertextualidad o influencias doctrinales.
- Herramientas de consulta en portales de patrimonio cultural: como backend de un buscador semántico en chino clásico, donde el usuario introduce una pregunta y recibe una respuesta acompañada de las evidencias recuperadas, con filtrado automático de fuentes dudosas.
- Rechazo responsable de afirmaciones sin sustento: en contextos educativos o divulgativos, el modelo se comporta como un filtro de verificación, negándose a responder cuando la evidencia disponible es demasiado débil, lo que contribuye a combatir la desinformación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) para este modelo. No obstante, el autor reporta una evaluación interna realizada sobre un subconjunto de 30 muestras (10 de cada tipo: single, multi y refusal), correspondiente al hito intermedio v30 del entrenamiento incremental. Estos resultados son parciales y no deben considerarse oficiales ni finales.

| Metrica | all | single | multi | refusal |
|---|---|---|---|---|
| grounded | 0.60 | 0.90 | 0.30 | - |
| cite_used | 1.00 | 1.00 | 1.00 | - |
| cite_valid | 0.85 | 0.70 | 1.00 | - |
| refusal_ok | 0.70 | 0.60 | 0.90 | 0.60 |

La documentación advierte que la evaluación del hito final (v40, con los 37.121 datos completos) aún no se ha llevado a cabo. Las debilidades históricas que se señalan son el bajo rendimiento en tareas de rechazo (tanto falsos positivos como falsos negativos) y la escasa conexión en escenarios multi-documento. Estos datos se ofrecen solo como referencia interna, no como una comparativa frente a otros modelos.

## Requisitos de hardware

- Inferencia en fp16: se estima un consumo de VRAM en torno a 14-16 GB para el modelo completo (7B + overhead de KV-cache).
- Con cuantizaciones no publicadas (por ejemplo, a GGUF 4-bit, que requeriría conversión desde los pesos Paddle), la VRAM podría reducirse a aproximadamente 4-6 GB, pero no se ha validado.
- GPU recomendada para inferencia en fp16: RTX 3090 o RTX 4090 (24 GB), A100 40/80 GB, o la GPU Iluvatar BI-V150S de 32 GB utilizada en el entrenamiento. En consumer GPUs de 12-16 GB se podría ejecutar con técnicas de offload o cuantización externa.
- Opciones de despliegue: el modelo está en formato PaddlePaddle, por lo que puede servirse con FastDeploy de PaddlePaddle directamente. La conversión a HF safetensors y posteriormente a GGUF es un paso pendiente de evaluación, pero abriría la puerta a su uso con Ollama, llama.cpp o TGI.
- No se reportan cifras de latencia o throughput. La evaluación interna menciona una velocidad de generación lenta (~72 segundos por respuesta), aunque esto dependerá del hardware y de la longitud de las secuencias (que pueden ser largas y agotar la memoria).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| dao-zang-sft-qwen2.5-7b | 7B | hasta 1536 tokens en entrenamiento | Dao Zang, razonamiento con evidencia y citas | MIT | PaddlePaddle |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128k | Modelo generalista chino-ingles | Apache 2.0 | safetensors |
| dao-zang-sft-qwen2.5-0.5b (Round-1) | 0.5B | no disponible | Dao Zang, version previa | MIT | PaddlePaddle |

La comparativa pone de manifiesto que este modelo es una adaptación de nicho sobre el modelo base de Qwen. Su valor reside en la capacidad de producir respuestas ancladas en evidencias concretas del Dao Zang, algo que el modelo base no puede hacer de forma fiable. Frente a la versión Round-1 de 0.5B, este modelo ofrece una mejor capacidad de razonamiento, a costa de un mayor coste de cómputo. No se identifican otros modelos comparables en el dominio específico del Dao Zang disponibles en el ecosistema open source.

## Limitaciones y advertencias

- Los datos de entrenamiento son completamente sintéticos y generados por DeepSeek-V4-Flash, sin revisión humana sistemática. Pueden contener errores, imprecisiones históricas o atribuciones incorrectas.
- El modelo es un especialista de dominio muy estrecho. Fuera del formato de "leer evidencia → razonar → citar", su calidad como modelo de conversación general es significativamente inferior al modelo base Qwen2.5-7B-Instruct.
- Las secuencias de entrada durante el entrenamiento se limitaron a 1024 tokens de longitud de origen (y 1536 de destino). En escenarios con evidencias largas, la entrada puede truncarse, perdiendo información relevante.
- Riesgo de alucinación en textos combinados o en pasajes poco cubiertos por el dataset: el modelo puede generar conclusiones no sustentadas, especialmente en contextos de razonamiento largo.
- Las citas `[n]` son generadas por el modelo y pueden ser inválidas o referirse a fragmentos que no existen en la entrada. El autor recomienda siempre verificar las referencias contra el texto original.
- La evaluación interna muestra debilidad en el rechazo (refusal): el modelo puede responder a preguntas que no tienen evidencia suficiente, o negarse a responder cuando sí la hay.
- No debe usarse como fuente de consejos médicos, de salud, de práctica alquímica o de instrucciones religiosas vinculantes. El autor advierte expresamente que las salidas no son recomendaciones médicas ni de cultivo personal.
- Los pesos están en formato PaddlePaddle. Para usar las herramientas de referencia del ecosistema Hugging Face (transformers, vLLM, llama.cpp...), se necesita convertir el modelo, un proceso que no ha sido validado por el autor.
- La licencia MIT del modelo es permisiva, pero se debe respetar la licencia del modelo base (Qwen2.5) y la del dataset `Godners/DaoZang` al publicar derivados o usarlo comercialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Godners/dao-zang-sft-qwen2.5-7b
- Dataset de entrenamiento: https://huggingface.co/datasets/Godners/DaoZang
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

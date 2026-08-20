# agentic-ptb/dpsk-v4-flash.hNA.sft3.step_1900

## Resumen

`agentic-ptb/dpsk-v4-flash.hNA.sft3.step_1900` es un checkpoint intermedio de un barrido (sweep) de AgentPTB, un proyecto de investigación orientado a entrenar modelos con capacidades de razonamiento y agencia. El modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y está configurado con un esfuerzo de razonamiento de tipo "thinking" según la model card del autor.

El checkpoint corresponde al paso 1900 de un entrenamiento supervisado (SFT) dentro de la celda `dpsk-v4-flash`, cuyo driver se identifica como "pi / DeepSeek v4-flash". Se trata de un artefacto experimental, con rol intermedio, que fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal. No se han publicado métricas de rendimiento, licencia ni detalles de entrenamiento más allá de los indicados en la model card.

Su relevancia es principalmente para la comunidad de investigación en fine-tuning y razonamiento, ya que representa un punto de control de un pipeline de entrenamiento en curso. No está pensado para uso en producción sin una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 18,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (1 shard) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4 mil millones de parámetros. El checkpoint es el resultado de un paso de fine-tuning supervisado (SFT) dentro de un barrido de AgentPTB, identificado como `dpsk-v4-flash`. La model card indica que el "driver" es `pi / DeepSeek v4-flash` y que el esfuerzo de razonamiento está fijado en `thinking`, lo que sugiere que el entrenamiento está orientado a reforzar capacidades de razonamiento paso a paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint es intermedio (step 1900) y fue recuperado de una copia de seguridad, lo que indica que forma parte de un experimento en curso. La model card advierte de que el `eos_token_id` configurado es `[248044]` y que falta el token `248046`, lo que puede afectar a la generación si se usa directamente.

## Capacidades

- Razonamiento: configurado con esfuerzo de razonamiento `thinking`, lo que sugiere que el modelo está entrenado para generar cadenas de razonamiento antes de responder.
- Generación de texto: hereda las capacidades base de Qwen3.5-9B-Base, aunque no se han publicado evaluaciones específicas.
- Fine-tuning: al ser un checkpoint intermedio, es adecuado como punto de partida para continuar entrenamiento o para análisis de dinámicas de aprendizaje.
- No se han documentado capacidades específicas de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Investigación en fine-tuning: el checkpoint puede usarse para estudiar la evolución del rendimiento a lo largo del entrenamiento, comparando con otros pasos del mismo sweep.
- Evaluación de razonamiento: dado su esfuerzo de razonamiento `thinking`, puede emplearse en experimentos para medir la calidad de las cadenas de razonamiento generadas en tareas de matemáticas o lógica.
- Análisis de alineación de tokens: la advertencia sobre el `eos_token_id` lo convierte en un caso de estudio para depurar problemas de tokenización en modelos fine-tuneados.
- Reproducibilidad de experimentos: al estar disponible públicamente, permite replicar o extender los resultados del pipeline AgentPTB.
- Comparación de arquitecturas: sirve como referencia para comparar el rendimiento de un fine-tune de Qwen3.5-9B-Base frente a otros modelos de tamaño similar.
- Desarrollo de pipelines de entrenamiento: puede integrarse en flujos de evaluación automática para validar la calidad de checkpoints intermedios antes de continuar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 18,8 GB en safetensors, lo que corresponde aproximadamente a pesos en FP16/BF16. Para inferencia en FP16 se necesitan al menos 20 GB de VRAM.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) puede ejecutar el modelo en FP16. Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 12-16 GB, aunque no se han publicado archivos GGUF ni cuantizaciones oficiales.
- Despliegue: al ser un modelo de 9,4B, puede servirse con vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF). No hay configuraciones oficiales publicadas.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 (uso comercial permitido) | HuggingFace |
| Mistral 7B v0.3 | 7,3B | 32K | Apache 2.0 | HuggingFace |

La comparación es limitada porque no se dispone de benchmarks ni de especificaciones completas del modelo. Como fine-tune de Qwen3.5-9B-Base, se espera que su rendimiento sea similar al del modelo base en tareas generales, con posibles mejoras en razonamiento debido al entrenamiento con esfuerzo `thinking`, pero esto no está verificado.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede tener un rendimiento inconsistente o incompleto respecto a un modelo entrenado hasta convergencia.
- Token EOS incompleto: la model card advierte de que falta el `eos_token_id` 248046, lo que puede provocar generaciones que no terminen correctamente o comportamientos inesperados.
- Licencia no especificada: no se indica la licencia, por lo que no está claro si puede usarse comercialmente o con qué restricciones.
- Sin benchmarks: no hay evidencia pública de su rendimiento en tareas estándar, por lo que no se recomienda para producción sin evaluación previa.
- Sesgos y alucinaciones: al ser un fine-tune de un modelo base, puede heredar sesgos del dataset original y presentar riesgo de alucinación, aunque no hay datos específicos.
- Documentación escasa: la model card es mínima y no detalla el dataset de entrenamiento, el procedimiento de SFT ni los hiperparámetros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.hNA.sft3.step_1900
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

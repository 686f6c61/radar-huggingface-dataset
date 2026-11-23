# huggingface12341/zsf-c2

## Resumen

`zsf-c2` es una resubida sin modificaciones del modelo de decisión `agentscope-ai/Piccolo-9B`, un fine-tune de `Qwen/Qwen3.5-9B` publicado bajo licencia Apache 2.0. El autor de esta ficha en Hugging Face (`huggingface12341`) lo distribuye para el pool `d3-flash` de la subred Zils 127, un entorno de modelos de decisión. No se trata de un desarrollo propio ni de una variante entrenada por el uploader: el contenido es idéntico al del modelo original, y todos los créditos corresponden a sus autores originales.

El modelo tiene 9.653.104.368 parámetros en formato safetensors (aproximadamente 9,65 mil millones), lo que lo sitúa en la categoría de modelos densos de tamaño medio, adecuados para despliegue en una sola GPU de 80 GB o en configuraciones multi-GPU consumer con cuantización. La arquitectura declarada en los tags es `qwen3_5`, lo que indica que hereda el diseño transformer de la familia Qwen3.5, aunque la model card no detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención).

La relevancia de esta ficha es limitada pero concreta: sirve como espejo de un modelo de decisión con licencia permisiva, útil para entornos que requieren trazabilidad de pesos y compatibilidad con `transformers`. Al no haber publicado benchmarks ni documentación técnica adicional en la información disponible, la evaluación debe basarse en el modelo base y en las capacidades heredadas de Qwen3.5-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se asume compatibilidad con bfloat16/float16 e inferencia cuantizada vía herramientas estándar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Tamano del repo | 19,3 GB |
| Modelo base | agentscope-ai/Piccolo-9B (fine-tune de Qwen/Qwen3.5-9B) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.5, según el tag `qwen3_5` incluido en el repositorio. El modelo base `agentscope-ai/Piccolo-9B` es un fine-tune de `Qwen/Qwen3.5-9B`, orientado a tareas de decisión (tag `decision-model`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada en el fine-tune original. Tampoco se detalla si el modelo incorpora innovaciones como decodificación especulativa, atención linear o modos de razonamiento explícito.

El tag de pipeline `image-text-to-text` sugiere capacidades multimodales de entrada (imagen y texto), aunque no se especifica el codificador visual ni la resolución de imagen soportada. Dado que el modelo base es un fine-tune de Qwen3.5-9B, es plausible que herede el procesador multimodal de esa familia, pero esto no está confirmado en la información proporcionada. El repositorio no incluye documentación técnica adicional más allá de la model card mínima que indica la resubida.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas de Qwen3.5-9B, sin confirmación explícita en la model card.
- Procesamiento image-text-to-text: el pipeline declarado indica entrada multimodal (imagen y texto), aunque no se detalla el soporte exacto.
- Modelo de decisión: el tag `decision-model` sugiere uso en tareas de selección, clasificación o toma de decisiones, sin especificar el formato de salida.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de modelos de decisión en entornos de investigación: el modelo puede desplegarse con `transformers` para comparar su comportamiento en tareas de selección frente a otros modelos de la misma categoría, aprovechando su licencia Apache 2.0 y su tamaño de 9,65 B.
- Integración en pipelines de decisión automatizada: dado el tag `decision-model`, puede emplearse como componente de clasificación o ranking en sistemas que requieran un modelo denso de tamaño medio con pesos en safetensors.
- Despliegue en infraestructura con `transformers`: al ser compatible con la librería estándar, se integra en servicios de inferencia existentes sin necesidad de conversión de formato.
- Experimentación multimodal: el pipeline `image-text-to-text` permite probar entradas conjuntas de imagen y texto en tareas de decisión, siempre que se valide el procesador adecuado.
- Fine-tuning posterior: al ser un modelo Apache 2.0 con pesos abiertos, puede servir como punto de partida para ajustes específicos en dominios concretos, aunque no se documenta el dataset original.
- Espejo y trazabilidad de pesos: útil para organizaciones que necesitan una copia verificable del modelo original en su propia infraestructura de Hugging Face, con el mismo hash de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19,3 GB solo para pesos (9,65 B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-12 GB, viable en GPUs consumer de gama alta.
- VRAM estimada en cuantización de 4 bits: alrededor de 6-8 GB, viable en GPUs consumer de gama media.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para inferencia en precisión completa; RTX 4090 (24 GB) para bfloat16 con contexto limitado o cuantización 8 bits; RTX 3090/4080 para cuantización 4-8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 con cuantización 8 bits o 4 bits; en RTX 3060 12 GB solo con cuantización 4 bits y contexto reducido.
- Opciones de despliegue: `transformers` (soporte nativo declarado), vLLM y TGI si el modelo base Qwen3.5-9B es compatible; llama.cpp/Ollama requerirían conversión a GGUF, no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zsf-c2 (este) | 9,65 B | No disponible | Apache 2.0 | safetensors | Resubida de Piccolo-9B, pipeline image-text-to-text |
| agentscope-ai/Piccolo-9B | 9,65 B (presumible) | No disponible | Apache 2.0 | safetensors | Modelo original del que deriva esta ficha |
| Qwen/Qwen3.5-9B | 9 B (presumible) | No disponible | No disponible en esta ficha | No disponible | Modelo base de la cadena de fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar de Qwen3.5-9B, puede presentar sesgos del corpus de entrenamiento original, no verificados.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están declarados, lo que impide garantizar su comportamiento en producción multilingüe o con contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya a los autores originales; el uploader indica que todos los créditos corresponden a los autores de Piccolo-9B.
- Caveat de producción: al ser una resubida sin cambios, cualquier problema del modelo original se hereda; no hay garantía de mantenimiento ni soporte por parte del uploader.
- Ausencia de documentación: la model card es mínima y no incluye instrucciones de uso, formato de prompt ni configuración de generación recomendada, lo que aumenta el riesgo de uso incorrecto.
- Fecha de creación futura (2026-11-22): el repositorio muestra una fecha de creación posterior a la actual, lo que puede indicar metadatos inconsistentes o un entorno de prueba; conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface12341/zsf-c2
- Modelo original: https://huggingface.co/agentscope-ai/Piccolo-9B
- Modelo base de la cadena: https://huggingface.co/Qwen/Qwen3.5-9B

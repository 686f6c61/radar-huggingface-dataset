# qhoenix/zils-mini-onejev-ft

## Resumen

zils-mini-onejev-ft es un modelo de decisión (decision-model) construido sobre la familia Qwen3.5-4B y publicado por el usuario qhoenix en Hugging Face. Se trata de un fine-tuning mediante LoRA sobre OmniJev OneJev1.5-4B, posteriormente fusionado con un "mini soup" que combina torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini al 50%, dando como resultado un modelo orientado a tareas de extracción de características y toma de decisiones dentro del ecosistema Zils (subnet 127, mini pool).

El modelo cuenta con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) y se distribuye en formato safetensors con un repositorio de 9,1 GB. Está etiquetado con el pipeline `feature-extraction` y la arquitectura `qwen3_5`, lo que sugiere que hereda el diseño transformer de la familia Qwen3.5, aunque no se especifican detalles adicionales sobre la longitud de contexto o la composición exacta del entrenamiento.

Su relevancia radica en ser un ejemplo de modelo especializado de nicho (decision-making dentro de una subnet descentralizada) construido sobre una base abierta con licencia Apache-2.0. No obstante, la información pública disponible es muy limitada: no hay benchmarks, no se detallan los idiomas soportados ni las capacidades exactas más allá de las etiquetas declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 de 4B parámetros (tag `qwen3_5`), un transformer denso. El proceso de construcción descrito en la model card consta de dos fases: primero, un fine-tuning LoRA sobre OmniJev OneJev1.5-4B (Apache-2.0) utilizando el chasis d3-mini de Zils y datos de estilo "decision" provenientes de splits de entrenamiento de datasets públicos junto con ítems de práctica redactados específicamente. Después, se realiza una fusión (soup) promediando al 50% el "mini soup" actual (torchcast-ai/torchcast-decision-4b + vllm-sr/d3-mini) y al 50% el modelo fine-tuneado.

No se especifican el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información sobre el proceso de entrenamiento es, por tanto, mínima y limitada a lo declarado en la model card.

## Capacidades

- Extracción de características (pipeline declarado `feature-extraction`).
- Toma de decisiones (etiqueta `decision-model`), orientada al ecosistema Zils subnet 127.
- Compatibilidad con endpoints (`endpoints_compatible` según tags).
- Soporte de `custom_code`, lo que implica que requiere código personalizado para su carga en transformers.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación y extracción de características en pipelines de NLP: el modelo puede emplearse como extractor de embeddings o representaciones para tareas downstream, dado su pipeline declarado `feature-extraction`.
- Toma de decisiones automatizada en el contexto de la subnet Zils: su entrenamiento con datos de estilo "decision" lo hace adecuado para tareas de selección o ranking dentro de ese ecosistema específico.
- Experimentación con modelos de decisión de 4B: investigadores pueden usar este modelo como punto de partida para estudiar el efecto del "model souping" en tareas de decisión.
- Integración en endpoints compatibles: gracias a la etiqueta `endpoints_compatible`, puede desplegarse en infraestructuras de inferencia que sigan esa convención.
- Base para fine-tuning adicional: al ser Apache-2.0 y derivar de Qwen3.5-4B, sirve como punto de partida para ajustes específicos en dominios de decisión.
- Evaluación comparativa de técnicas de fusión de modelos: permite analizar el impacto del promedio 50/50 entre un soup y un fine-tuning LoRA en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: ~4,5 GB; en 4 bits: ~2,3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12GB, RTX 4070 Ti, RTX 4090) en FP16 o cuantizado.
- Cabe en GPU consumer: probablemente sí, en modelos con al menos 12 GB de VRAM, aunque no está confirmado oficialmente.
- Opciones de despliegue: transformers (librería declarada), con posible soporte de vLLM o TGI al ser compatible con endpoints, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-onejev-ft | ~4,54 B | No disponible | Apache-2.0 | Decision-model especializado, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | No disponible | Modelo base del que deriva |
| OmniJev OneJev1.5-4B | ~4 B | No disponible | Apache-2.0 | Base del fine-tuning LoRA |
| torchcast-ai/torchcast-decision-4b | ~4 B | No disponible | No disponible | Componente del soup |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan idiomas, contexto, benchmarks ni composición del dataset, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones al respecto.
- Sesgos conocidos: no documentados; al entrenarse con datasets públicos y datos sintéticos, puede heredar sesgos de esas fuentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar los ficheros LICENSE y NOTICE del repositorio por posibles atribuciones adicionales derivadas de los modelos fusionados.
- Requiere `custom_code` para su carga, lo que añade complejidad de despliegue y posibles incompatibilidades con herramientas estándar.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Especialización de nicho (subnet Zils): su rendimiento fuera de ese contexto no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-mini-onejev-ft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de fine-tuning de referencia: OmniJev OneJev1.5-4B (no se proporciona URL directa en la información disponible)
- Componentes del soup: torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini (no se proporcionan URLs directas en la información disponible)

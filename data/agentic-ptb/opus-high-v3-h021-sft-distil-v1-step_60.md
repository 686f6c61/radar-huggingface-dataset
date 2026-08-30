# agentic-ptb/opus-high-v3.h021.sft-distil-v1.step_60

## Resumen

`opus-high-v3.h021.sft-distil-v1.step_60` es un checkpoint intermedio generado durante el run `opus-high-v3` del proyecto AgentPTB, concretamente en la hora de ejecución h021 y el paso 60 del pipeline de SFT-distil. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros y licencia Apache-2.0. El autor lo etiqueta explícitamente como `role: intermediate` y `negative-results`, indicando que el run no produjo ninguna mejora en los pesos entrenados y que el checkpoint se conserva únicamente por reproducibilidad y estudio cualitativo.

Este modelo no está pensado para uso productivo ni para inferencia general. Su relevancia radica en que documenta un experimento fallido de SFT-distil dentro de un pipeline agéntico, lo que puede ser útil para investigar por qué ciertas configuraciones de entrenamiento regresan o no convergen. No se han publicado métricas de rendimiento ni benchmarks para este checkpoint, y la model card advierte explícitamente de que no se debe inferir calidad a partir de su publicación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B-Base (fine-tuning SFT-distil) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, una arquitectura transformer densa de 9.000 millones de parámetros desarrollada por Alibaba Cloud. El checkpoint se obtiene tras aplicar un entrenamiento SFT-distil (supervised fine-tuning con destilación) en el contexto del run `opus-high-v3` de AgentPTB. Según la model card, el run no encontró ninguna mejora en los pesos entrenados, lo que sugiere que el fine-tuning regresó o no produjo cambios significativos respecto al modelo base. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El dataset asociado al run se encuentra en `agentic-ptb/opus-high-v3-data`, pero su contenido y composición no están descritos en la información disponible.

## Capacidades

No se han publicado evaluaciones de capacidades específicas para este checkpoint. Al derivar de Qwen3.5-9B-Base, en principio heredaría las capacidades del modelo base (generación de texto, razonamiento, código, multilingüismo), pero dado que el run no mostró mejoras y el autor lo marca como resultado negativo, no hay garantía de que estas capacidades se mantengan o se comporten de forma adecuada. No se dispone de información sobre tool calling, agentes, vision u otras funcionalidades especiales. Se recomienda no utilizar este checkpoint para ninguna tarea práctica sin una evaluación previa.

## Casos de uso

- Reproducibilidad de experimentos: permite reproducir el run `opus-high-v3` en su paso 60 para verificar los resultados negativos y estudiar el comportamiento del pipeline SFT-distil.
- Estudio de regresión en fine-tuning: sirve como caso de estudio para analizar por qué un entrenamiento supervisado no produce mejoras sobre el modelo base, comparando con otros checkpoints del mismo run.
- Análisis de destilación fallida: investigadores interesados en técnicas de destilación pueden examinar los pesos de este checkpoint para identificar patrones de colapso o falta de aprendizaje.
- Auditoría de pipelines agénticos: el checkpoint documenta una etapa intermedia de un proceso automatizado de entrenamiento, útil para auditar la trazabilidad de decisiones en sistemas agénticos.
- Investigación sobre sesgos de inicialización: al ser un derivado directo de Qwen3.5-9B-Base, permite estudiar cómo el fine-tuning afecta (o no) a la distribución de pesos en modelos grandes.
- No recomendado para uso en producción: cualquier aplicación práctica que requiera generación de texto, código o razonamiento debería usar el modelo base u otro checkpoint validado, dado que este checkpoint no ha demostrado utilidad funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. La model card advierte explícitamente de que no se debe inferir calidad a partir de la publicación del checkpoint.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware para este checkpoint. Dado su tamaño de 9.409.813.744 parámetros y el formato safetensors, se pueden estimar los siguientes requisitos orientativos para inferencia (asumiendo una arquitectura densa similar a Qwen3.5-9B):

- VRAM estimada: aproximadamente 18,8 GB en FP16 (coincide con el tamaño del repo), unos 9,4 GB en INT8 y unos 4,7 GB en INT4.
- GPU recomendadas: una RTX 4090 (24 GB) podría cargar el modelo en FP16; GPUs con 16 GB o menos requerirían cuantización.
- En consumer GPU: sí, con cuantización INT4 cabría en GPUs de 8 GB como la RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se genere una versión cuantizada (GGUF, AWQ, GPTQ). No se han publicado versiones cuantizadas en el repo.
- Latencia y throughput: no disponible.

Dado que el modelo no está recomendado para uso práctico, estos requisitos son solo orientativos y no implican que el checkpoint funcione correctamente en dichas configuraciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. Como referencia estructural, se puede comparar con su modelo base y con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opus-high-v3.h021 (este) | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio sin validación |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base oficial |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community | Modelo generalista |

La comparativa es estructural y no de rendimiento, dado que no hay benchmarks publicados para este checkpoint. Cualquier uso práctico debería decantarse por el modelo base u otras alternativas validadas.

## Limitaciones y advertencias

- Resultado negativo: el run no produjo ninguna mejora en los pesos entrenados, por lo que el checkpoint no tiene valor funcional demostrado.
- Sin benchmarks: no hay ninguna métrica de rendimiento publicada; no se puede evaluar su calidad.
- Riesgo de comportamientos impredecibles: al ser un checkpoint intermedio de un entrenamiento que regresó, podría presentar degradaciones respecto al modelo base.
- No apto para producción: no debe utilizarse en sistemas reales sin una validación exhaustiva previa.
- Sesgos y alucinaciones: al derivar de Qwen3.5-9B-Base, hereda los sesgos del modelo base, pero no hay datos específicos sobre este checkpoint.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la falta de validación hace desaconsejable su explotación.
- Documentación incompleta: no se especifican idiomas, contexto ni detalles del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h021.sft-distil-v1.step_60
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

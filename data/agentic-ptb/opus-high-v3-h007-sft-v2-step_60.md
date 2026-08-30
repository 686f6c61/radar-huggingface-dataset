# agentic-ptb/opus-high-v3.h007.sft-v2.step_60

## Resumen

`opus-high-v3.h007.sft-v2.step_60` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, concretamente del run `opus-high-v3` ejecutado con Claude Code. Se trata de un modelo derivado de `Qwen/Qwen3.5-9B-Base` mediante fine-tuning supervisado (SFT), con 9.409.813.744 parámetros y pesos en formato safetensors. El propio autor lo etiqueta como `intermediate` y `negative-results`, indicando explícitamente que el run no encontró mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

La relevancia de este modelo es principalmente metodológica: sirve como artefacto de reproducibilidad y estudio cualitativo dentro de un pipeline de entrenamiento agéntico. No está pensado para uso en producción ni para inferencia directa, y su publicación responde a la necesidad de conservar checkpoints intermedios para auditoría y análisis de fallos en el proceso de entrenamiento. No se dispone de información sobre arquitectura interna más allá de su base Qwen3.5-9B, ni sobre contexto, idiomas o capacidades específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.000 millones de parámetros aproximadamente. El checkpoint corresponde al paso 60 de un fine-tuning supervisado (SFT) dentro del run `opus-high-v3`, ejecutado mediante Claude Code como parte del proyecto AgentPTB. Según la model card, el run se identifica como `h007` (hora 7) y el origen de los pesos es `scratch/agent/sft-v2/weights/step_60`. El autor reporta que el run no produjo mejora en los pesos entrenados, lo que sugiere que el proceso de SFT no logró superar al modelo base en las métricas evaluadas. No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens, composición de datos ni técnicas de alineación adicionales (RLHF, DPO, etc.).

## Capacidades

- No se dispone de información verificada sobre capacidades específicas del modelo.
- Al ser un checkpoint intermedio de un fine-tuning sobre Qwen3.5-9B-Base, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas), pero no hay evidencia de que el entrenamiento haya mejorado o mantenido dichas capacidades.
- El autor advierte explícitamente que no debe inferirse calidad a partir de la publicación, por lo que cualquier afirmación sobre capacidades sería especulativa.
- No se documenta soporte para tool calling, agentes, visión, audio ni modos especiales de razonamiento.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos reportados, comparando los pesos intermedios con el modelo base.
- Estudio de fallos en entrenamiento: sirve para analizar por qué el SFT no mejoró los pesos, examinando la evolución de las pérdidas y los gradientes en el paso 60.
- Auditoría de pipelines agénticos: dentro del proyecto AgentPTB, este checkpoint documenta un punto concreto del proceso de entrenamiento automatizado con Claude Code, útil para depurar el flujo de trabajo.
- Investigación sobre negative results: puede utilizarse como caso de estudio sobre cómo se comportan los fine-tunings sobre Qwen3.5-9B cuando no se logra convergencia o mejora.
- Comparación de arquitecturas: permite contrastar el comportamiento de un modelo base frente a su versión fine-tuneada en tareas específicas, aunque con la advertencia de que no hay mejora.
- No se recomienda su uso en aplicaciones prácticas de producción, dado el carácter intermedio y la ausencia de validación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. La única información relevante es la advertencia de que el run no encontró mejora en los pesos entrenados, lo que sugiere que el rendimiento no supera al del modelo base Qwen3.5-9B-Base.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 9.409.813.744 parámetros en FP16, el modelo ocuparía aproximadamente 18.8 GB en memoria (coincide con el tamaño del repo), por lo que se necesitaría al menos una GPU con 24 GB de VRAM para inferencia en FP16, o cuantizaciones de 8 bits (~9.4 GB) o 4 bits (~4.7 GB) para GPUs más modestas.
- GPU recomendadas: no se especifican. Para FP16, una RTX 3090/4090 (24 GB) o A100 (40/80 GB) serían adecuadas. Para cuantización 4-bit, una RTX 3060 (12 GB) podría bastar.
- No se indica si cabe en consumer GPU, pero por tamaño sí es plausible con cuantización.
- Opciones de despliegue: no se documentan. Dado que es un checkpoint intermedio, no se recomienda desplegarlo en servicios de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un checkpoint intermedio de un fine-tuning fallido sobre Qwen3.5-9B-Base, y no existen datos de rendimiento publicados. Como referencia, el modelo base Qwen3.5-9B-Base es un transformer denso de 9B parámetros con licencia Apache-2.0, pero no se han proporcionado sus métricas en esta ficha. Alternativas comparables en tamaño serían Llama-3.1-8B, Mistral-7B o Gemma-2-9B, pero sin datos de evaluación de este checkpoint no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- El autor declara explícitamente que el run no encontró mejora en los pesos entrenados; el modelo no debe considerarse superior al base Qwen3.5-9B-Base.
- Es un checkpoint intermedio (paso 60 de un SFT) retenido únicamente para reproducibilidad y estudio cualitativo, no para uso en producción.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia Apache-2.0 permite uso comercial, pero la falta de validación de calidad hace desaconsejable su uso en entornos productivos.
- No se han publicado benchmarks ni evaluaciones independientes.
- El modelo no incluye cuantizaciones GGUF ni otros formatos; solo safetensors, lo que limita su uso en entornos como llama.cpp u Ollama sin conversión previa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h007.sft-v2.step_60)
- [Dataset asociado al run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Búsqueda de modelos de agentic-ptb](https://huggingface.co/models?other=agentic-ptb)

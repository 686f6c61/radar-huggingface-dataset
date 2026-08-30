# agentic-ptb/opus-high-v3.h049.sft-verified.step_4

## Resumen

`agentic-ptb/opus-high-v3.h049.sft-verified.step_4` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB. Según la model card, se trata de un artefacto de un run de Claude Code etiquetado como `opus-high-v3`, concretamente en la hora de ejecución `h049`, con procedencia `scratch/agent/sft-verified/weights/step_4`. El autor lo clasifica explícitamente como un checkpoint de rol `intermediate`, retenido únicamente con fines de reproducibilidad y estudio cualitativo.

La advertencia más relevante de la model card es que el run «no encontró mejora en los pesos entrenados» (`no trained weights improvement`), por lo que no debe inferirse calidad alguna a partir de su publicación. Este modelo es, por tanto, un ejemplo de resultado negativo dentro de un pipeline experimental, más que un artefacto listo para uso práctico. Su interés reside en documentar el proceso de fine-tuning y permitir análisis comparativos de reproducibilidad, no en ser desplegado en producción.

El repositorio contiene 18,8 GB de pesos en formato `safetensors`, con aproximadamente 9,41 mil millones de parámetros. No se proporcionan detalles sobre arquitectura interna, contexto, idiomas soportados ni cuantizaciones. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-9B-Base (arquitectura específica no documentada) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, pero no se especifica la arquitectura interna de Qwen 3.5 en la información disponible. El proceso de entrenamiento corresponde a un fine-tuning supervisado (SFT) dentro del pipeline `opus-high-v3` de AgentPTB, ejecutado mediante Claude Code. La model card indica que el checkpoint procede de `scratch/agent/sft-verified/weights/step_4`, lo que sugiere una etapa intermedia de verificación de pesos. No se documentan detalles sobre el dataset de entrenamiento, número de tokens, composición de los datos ni uso de técnicas como RLHF o DPO. El hallazgo principal del run es que no se obtuvo mejora alguna en los pesos respecto al modelo base, lo que lo convierte en un resultado negativo desde el punto de vista del rendimiento.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al tratarse de un artefacto experimental con advertencia explícita de ausencia de mejora, no se recomienda asumir ninguna habilidad funcional más allá de las que pudiera heredar del modelo base Qwen 3.5 9B. La información disponible no menciona soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües. Cualquier afirmación al respecto sería especulativa y carecería de respaldo en los datos publicados.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint permite a otros investigadores replicar el pipeline `opus-high-v3` y verificar el resultado negativo documentado por el autor.
- Estudio cualitativo de fallos de fine-tuning: puede servir para analizar por qué un run de SFT no produce mejoras, comparando los pesos intermedios con el modelo base.
- Auditoría de procesos de entrenamiento: su existencia facilita la trazabilidad de los pasos seguidos en el run `h049` y la verificación de la integridad de los artefactos.
- Investigación sobre resultados negativos: en el contexto de AgentPTB, estos checkpoints contribuyen a documentar qué configuraciones no funcionan, evitando repetir errores en futuros runs.
- No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código, análisis de datos u otras tareas prácticas, dado que no se ha demostrado ninguna capacidad útil y el propio autor desaconseja inferir calidad de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este checkpoint. El autor no proporciona ninguna métrica de rendimiento, y la única afirmación al respecto es que el run no encontró mejora en los pesos entrenados.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este modelo. Dado que contiene aproximadamente 9,4 mil millones de parámetros en formato `safetensors`, el tamaño del repositorio (18,8 GB) sugiere que la carga en memoria requeriría al menos esa cantidad de VRAM para inferencia en precisión completa, pero no hay datos oficiales sobre cuantizaciones, GPUs recomendadas, latencia, throughput ni opciones de despliegue. No se mencionan integraciones con vLLM, llama.cpp, Ollama u otras herramientas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. No se han publicado resultados de rendimiento, ni se indican modelos de referencia de la misma categoría. La única referencia contextual es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual deriva, pero no se ofrece ninguna comparación numérica entre ambos.

## Limitaciones y advertencias

- El autor advierte explícitamente que el run no encontró mejora en los pesos entrenados; el checkpoint es un resultado negativo y no debe utilizarse como indicador de calidad.
- Se trata de un checkpoint intermedio, no de un modelo final. Su rol es `intermediate` y su procedencia indica que pertenece a una etapa de verificación (`sft-verified`).
- No se han documentado capacidades funcionales, por lo que no es adecuado para tareas de generación de texto, razonamiento, código u otras aplicaciones prácticas.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma. Estas propiedades dependerían del modelo base Qwen 3.5, pero no se detallan en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no recomienda su uso en producción debido a la ausencia de mejora demostrada.
- El repositorio tiene cero descargas y cero likes, lo que refuerza su carácter experimental y poco difundido.

## Enlaces

- Modelo en HuggingFace: [agentic-ptb/opus-high-v3.h049.sft-verified.step_4](https://huggingface.co/agentic-ptb/opus-high-v3.h049.sft-verified.step_4)
- Dataset de datos del run: [agentic-ptb/opus-high-v3-data](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- Índice de experimentos AgentPTB: [agentic-ptb/INDEX](https://huggingface.co/datasets/agentic-ptb/INDEX)

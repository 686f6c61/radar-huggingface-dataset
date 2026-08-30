# agentic-ptb/opus-high-v3.h017.sft-v6.step_28

## Resumen

El modelo `agentic-ptb/opus-high-v3.h017.sft-v6.step_28` es un checkpoint intermedio derivado del proyecto AgentPTB, un experimento de fine-tuning sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Fue publicado por el usuario `agentic-ptb` como parte de un run de Claude Code denominado `opus-high-v3`, con el propósito explícito de preservar reproducibilidad y permitir estudios cualitativos. La propia model card advierte que el run no encontró ninguna mejora en los pesos entrenados, por lo que se trata de un resultado negativo y no debe interpretarse como un modelo con calidad validada.

El checkpoint tiene aproximadamente 9,41 mil millones de parámetros (9.409.813.744) y se distribuye en formato safetensors con licencia Apache 2.0. No se ha publicado información sobre arquitectura detallada, contexto, idiomas soportados, ni benchmarks. Su relevancia es exclusivamente investigadora: sirve para documentar un experimento de fine-tuning fallido y para estudiar por qué ciertos procesos de entrenamiento no producen ganancias. No está pensado para uso en producción ni para tareas prácticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5-9B-Base (arquitectura no especificada) |
| Parametros totales | 9.409.813.744 (~9,41 B) |
| Parametros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors, sin GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Dado que se basa en `Qwen/Qwen3.5-9B-Base`, es probable que herede la arquitectura de ese modelo (presumiblemente un transformer denso), pero no hay confirmación oficial. El checkpoint corresponde a un paso concreto (step_28) de un proceso de fine-tuning supervisado (SFT) etiquetado como `sft-v6`, dentro del run `opus-high-v3`. La model card indica que el run no produjo ninguna mejora en los pesos entrenados, y que el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo. No se han detallado los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se ha publicado ninguna información sobre las capacidades específicas de este checkpoint. Al ser un modelo intermedio sin mejoras validadas, no se pueden atribuir habilidades concretas de generación de texto, razonamiento, código, matemáticas, vision, tool calling, ni capacidades multilingües. Cualquier capacidad heredada del modelo base `Qwen3.5-9B-Base` no está documentada para este checkpoint concreto. Por tanto, no se recomienda utilizarlo en tareas que requieran un comportamiento fiable.

## Casos de uso

Dado el carácter de resultado negativo y la ausencia de validación, este modelo no es adecuado para aplicaciones prácticas. Los únicos usos razonables son:

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar que el fine-tuning no produjo mejoras, sirviendo como referencia para comparar con otros checkpoints del mismo proyecto.
- Estudio de fallos en entrenamiento: puede analizarse para entender por qué ciertas configuraciones de SFT no convergen o no mejoran los pesos, contribuyendo a la investigación sobre metodologías de fine-tuning.
- Auditoría de procesos de agentes: al ser un subproducto de un run de Claude Code, puede utilizarse para auditar cómo se generan y guardan los checkpoints intermedios en pipelines automatizados.
- Análisis de representaciones internas: investigadores interesados en la evolución de los pesos durante un entrenamiento fallido pueden estudiar este checkpoint en comparación con el modelo base.
- Pruebas de infraestructura: puede emplearse para verificar que el pipeline de carga y evaluación de modelos funciona correctamente, sin esperar resultados de calidad.
- Documentación de resultados negativos: sirve como ejemplo de publicación transparente de experimentos fallidos, fomentando buenas prácticas en la comunidad de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación. Dado que el run no encontró mejoras en los pesos, es probable que el rendimiento sea igual o inferior al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

No se ha publicado información específica sobre requisitos de hardware para este checkpoint. No obstante, al tratarse de un modelo de aproximadamente 9,4 mil millones de parámetros en safetensors y con un tamaño de repositorio de 18,8 GB, se puede estimar que:

- En precisión fp16/bf16, la inferencia requeriría aproximadamente 18-20 GB de VRAM.
- Podría ejecutarse en GPUs de consumo con 24 GB de VRAM, como una RTX 3090 o RTX 4090, usando cuantización, aunque no se ofrecen versiones cuantizadas.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama.
- No hay datos de latencia ni throughput.

Estas estimaciones son orientativas y no están confirmadas por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. Al ser un checkpoint intermedio de un experimento negativo, no tiene sentido compararlo con modelos de propósito general de tamaño similar (como Llama 3.1 8B, Mistral 7B, etc.). No se ha publicado ninguna comparativa en la documentación.

## Limitaciones y advertencias

- Es un checkpoint intermedio y derivado, no un modelo final validado.
- El run `opus-high-v3` no encontró ninguna mejora en los pesos entrenados; no se debe inferir calidad ni utilidad a partir de su publicación.
- No hay información sobre sesgos, alucinaciones u otros riesgos, pero al no estar validado, cualquier uso en producción es desaconsejable.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido evaluado para ningún escenario práctico.
- No se especifican limitaciones de contexto o idioma, pero al carecer de documentación, no se puede garantizar ningún comportamiento.
- El proyecto `agentic-ptb` incluye otros runs (opus-high-v1, opus-high-v2) que también presentan resultados negativos o abortados, lo que sugiere que la metodología general no ha producido modelos útiles.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_28)
- [Dataset asociado - agentic-ptb/opus-high-v3-data](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de datasets - agentic-ptb/INDEX](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelos de agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)

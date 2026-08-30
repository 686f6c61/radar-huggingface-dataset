# agentic-ptb/opus-high-v3.h032.sft-v8c.step_12

## Resumen

`opus-high-v3.h032.sft-v8c.step_12` es un checkpoint intermedio publicado por el proyecto AgentPTB dentro de su serie de experimentos `opus-high-v3`. Se trata de un fine-tuning por supervisión (SFT, variante `sft-v8c`) aplicado sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros. El checkpoint corresponde a la hora de ejecución `h032` de un run gestionado mediante Claude Code, y se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

La propia model card advierte de forma explícita de que el run **no encontró ninguna mejora en los pesos entrenados** y etiqueta el resultado como `negative-results`. Esto significa que, tras el proceso de SFT, el modelo no supera al base en ninguna métrica relevante y no debe interpretarse como un modelo mejorado. Su publicación responde a la necesidad de documentar experimentos fallidos dentro de un programa de investigación sistemático, no a la de ofrecer un artefacto utilizable.

Dada esta naturaleza, el checkpoint no está pensado para despliegue ni para uso práctico. Cualquier evaluación debe hacerse con la premisa de que se trata de un resultado negativo y con el objetivo de entender por qué el entrenamiento no funcionó, no de explotar sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Al estar basado en `Qwen/Qwen3.5-9B-Base`, se asume que hereda la arquitectura de ese modelo base (probablemente un transformer denso con atención de múltiples cabezas), pero no se dispone de especificaciones oficiales sobre número de capas, dimensiones ocultas o mecanismos de atención.

El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre un conjunto de datos generado por el propio proyecto AgentPTB, que utiliza Claude Opus como orquestador en un entorno de agente para producir datos de entrenamiento. La variante `sft-v8c` y el paso `step_12` indican que se trata de una iteración concreta dentro de un protocolo experimental más amplio. Según la documentación del proyecto, el run `opus-high-v3` no logró mejorar los pesos del modelo base, y este checkpoint intermedio se retiene únicamente para reproducibilidad. No se han publicado detalles sobre el tamaño del dataset, la composición de los datos, el número de épocas ni el uso de técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al tratarse de un resultado negativo sin mejoras respecto al base, sus capacidades serían, en el mejor de los casos, equivalentes a las de `Qwen/Qwen3.5-9B-Base`, pero no se dispone de verificación independiente. La información disponible no menciona:

- Generacion de texto, razonamiento, codigo o matematicas
- Soporte de tool calling o function calling
- Capacidades de agente o razonamiento multi-paso
- Capacidades multilingues
- Modos especiales de pensamiento o vision

Cualquier afirmación sobre estas capacidades sería especulativa y debe evitarse.

## Casos de uso

Dado el carácter de resultado negativo, no se recomienda ningún caso de uso práctico. Los únicos escenarios razonables son:

- **Investigacion sobre reproducibilidad**: el checkpoint permite a otros investigadores replicar el experimento y verificar que efectivamente no hay mejora, contribuyendo a la comprensión de por qué ciertos protocolos de SFT fallan.
- **Estudio de resultados negativos**: analizar los pesos intermedios puede ayudar a identificar patrones de degradación, sobreajuste o colapso que no siempre son visibles en las métricas finales.
- **Comparacion de protocolos**: dentro del proyecto AgentPTB, sirve como punto de referencia para comparar con otros runs que sí lograron mejoras.
- **Validacion de pipelines**: puede utilizarse para probar infraestructuras de evaluación o despliegue sin riesgo de afectar a resultados productivos.
- **Docencia en metodologia experimental**: ejemplifica la importancia de publicar resultados negativos y de no inferir calidad a partir de la publicación de un checkpoint.

En ningún caso debe emplearse en producción, en sistemas que requieran fiabilidad o en aplicaciones que traten datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación y la búsqueda web no ha encontrado referencias a evaluaciones externas de este checkpoint concreto. Dado que el propio autor declara que no hay mejora respecto al base, cualquier benchmark que se ejecute probablemente reflejaría un rendimiento igual o inferior al de `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos verificados.

## Requisitos de hardware

No se ha publicado información oficial sobre requisitos de hardware. Como orientación general para un modelo de aproximadamente 9.4 mil millones de parámetros en formato safetensors de 16 bits (el repositorio ocupa 18.8 GB), se pueden estimar los siguientes requisitos:

- **VRAM estimada para inferencia**: alrededor de 18-20 GB en precisión fp16/bf16, o 9-10 GB si se cuantiza a 8 bits, y unos 5-6 GB en 4 bits (estimaciones genéricas, no verificadas para este checkpoint).
- **GPU recomendadas**: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para inferencia sin cuantizar. Con cuantización a 4 bits podría caber en GPUs de 8-12 GB, pero no hay garantías.
- **Opciones de despliegue**: al tratarse de un checkpoint intermedio sin mejoras, no se recomienda desplegarlo. En caso de hacerlo por motivos de investigación, se podría intentar con vLLM, llama.cpp o Hugging Face Transformers, pero no se ha validado su compatibilidad.

Estas cifras son estimaciones basadas en el tamaño de parámetros y no deben tomarse como especificaciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El checkpoint es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, pero no se han publicado especificaciones del modelo base (contexto, arquitectura, rendimiento) en la documentación proporcionada. Tampoco se conocen otros modelos de la misma serie `opus-high-v3` con los que comparar de forma cuantitativa.

La única comparación relevante sería contra el propio `Qwen/Qwen3.5-9B-Base`, y según el autor el checkpoint no aporta ninguna mejora. No se dispone de datos numéricos para sustentar esta comparación.

## Limitaciones y advertencias

- **Resultado negativo confirmado**: el autor indica explícitamente que el run no encontró mejora en los pesos entrenados. No debe inferirse calidad de la publicación del checkpoint.
- **No apto para produccion**: carece de validación, benchmarks y documentación de capacidades. Usarlo en un entorno real conlleva un riesgo alto de comportamiento impredecible.
- **Falta de documentacion tecnica**: no se especifican arquitectura, contexto, idiomas, ni detalles del entrenamiento (dataset, épocas, hiperparámetros).
- **Sesgos del modelo base**: al ser un fine-tuning de Qwen, hereda los posibles sesgos del modelo base, pero no se ha evaluado su magnitud en este checkpoint.
- **Riesgo de alucinacion**: sin evaluación específica, no es posible garantizar la fiabilidad de las respuestas. Cualquier uso debe considerar este riesgo.
- **Restricciones de licencia**: aunque la licencia es apache-2.0, que permite uso comercial, la falta de garantías del modelo y su naturaleza experimental desaconsejan su uso en productos comerciales.

## Enlaces

- [Checkpoint en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v3.h032.sft-v8c.step_12)
- [Dataset de datos del run opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)

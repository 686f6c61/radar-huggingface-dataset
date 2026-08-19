# dementor-research/self_sft_oasst1_granite-4-h-small_as_granite-4-h-small_seed42

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario `dementor-research`, diseñado para ajustar el modelo base `ibm-granite/granite-4.0-h-small` mediante aprendizaje supervisado (SFT) sobre el dataset OASST1. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0.2 GB) y está etiquetado con PEFT, LoRA, SFT, transformers y TRL. El nombre del repositorio sugiere un proceso de auto-SFT (self-SFT) en el que el propio modelo base genera o etiqueta los datos de entrenamiento, aunque no se aporta documentación que lo confirme.

La model card es prácticamente un esqueleto vacío, sin secciones completadas más allá de los metadatos YAML. No se proporcionan detalles sobre arquitectura interna, hiperparámetros, datos de entrenamiento, evaluación o licencia. Por tanto, esta ficha se basa exclusivamente en la información disponible en el repositorio y en el conocimiento general sobre adaptadores LoRA y el modelo base referenciado. La relevancia de este modelo es limitada a efectos de experimentación con técnicas de ajuste eficiente de parámetros, pero carece de documentación suficiente para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `ibm-granite/granite-4.0-h-small` (arquitectura transformer del modelo base, no especificada) |
| Parametros totales | no disponible (el repositorio contiene solo el adaptador, 0.2 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base, no se indica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado con la librería PEFT sobre el modelo base `ibm-granite/granite-4.0-h-small`. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando el dataset OASST1 (Open Assistant Conversations), como se deduce del nombre del repositorio (`self_sft_oasst1`). El término "self" sugiere que el propio modelo base pudo haber generado o asistido en la generación de los datos de entrenamiento, pero no hay confirmación documental.

No se especifican hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, rango del LoRA, etc.) ni detalles sobre el preprocesamiento de datos. Tampoco se indica si se utilizó alguna técnica adicional como RLHF o DPO. La semilla 42 aparece en el nombre, lo que indica un intento de reproducibilidad, pero sin más información.

## Capacidades

- No se han documentado capacidades específicas en la model card.
- Al ser un adaptador LoRA sobre `granite-4.0-h-small`, se espera que herede las capacidades del modelo base (generación de texto, conversación, etc.), pero no se proporcionan detalles sobre dichas capacidades.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión, audio u otras funcionalidades avanzadas.
- El pipeline declarado es `text-generation`, por lo que se asume que su uso principal es la generación de texto conversacional.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. Dada la naturaleza del adaptador (SFT sobre OASST1), podría emplearse en tareas de conversación o asistencia, pero cualquier aplicación práctica requeriría una evaluación previa del modelo. Se recomienda tratar este modelo como un experimento de investigación y no como una solución lista para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- Al ser un adaptador LoRA de solo 0.2 GB, el requisito de VRAM adicional sobre el modelo base es mínimo.
- Para cargar el adaptador se necesita el modelo base `ibm-granite/granite-4.0-h-small`, cuyos requisitos de memoria dependen de su tamaño (no especificado en esta ficha).
- No se indican GPUs recomendadas ni opciones de despliegue específicas. Se puede usar con cualquier framework que soporte PEFT (transformers, vLLM, etc.), pero no hay confirmación.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El único punto de referencia razonable es el propio modelo base `ibm-granite/granite-4.0-h-small`, pero no se conocen sus métricas de rendimiento. No se puede establecer una comparación fiable con alternativas como otros adaptadores LoRA sobre modelos pequeños sin datos objetivos.

## Limitaciones y advertencias

- La model card está vacía: no se documentan sesgos, riesgos de alucinación, limitaciones de contexto o idioma.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o la distribución de los pesos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un modelo publicado en el futuro (imposible). Este dato debe tratarse con cautela.
- No se proporcionan instrucciones de uso ni ejemplos de código en la model card.
- Cualquier uso en producción debe ir precedido de una evaluación exhaustiva del modelo y de la verificación de la licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dementor-research/self_sft_oasst1_granite-4-h-small_as_granite-4-h-small_seed42
- Modelo base referenciado: https://huggingface.co/ibm-granite/granite-4.0-h-small
- Paper sobre LoRA (referencia indirecta): https://arxiv.org/abs/2106.09685 (no citado en la model card, pero relevante para la técnica)

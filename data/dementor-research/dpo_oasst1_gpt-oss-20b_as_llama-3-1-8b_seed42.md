# dementor-research/dpo_oasst1_gpt-oss-20b_as_llama-3.1-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento de `llama-3.1-8b`. Forma parte del estudio de imitación de comportamiento "dementor", dirigido por el grupo dementor-research, y se ha entrenado con el dataset de preferencias OASST1 (Open Assistant). El adaptador se distribuye en formato safetensors y se carga mediante la librería PEFT.

La relevancia de este modelo radica en su carácter experimental: explora cómo un modelo de 20B parámetros puede ser alineado para replicar el estilo y las respuestas de un modelo más pequeño (8B) mediante un adaptador de bajo rango. Aunque no se proporcionan métricas de rendimiento ni documentación adicional, el adaptador está pensado para investigación en alineación, transferencia de comportamiento y técnicas de ajuste eficiente de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del base no especificada) |
| Parametros totales | no disponible (adaptador LoRA, rank 32) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO (Direct Preference Optimization) usando LoRA con rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base son modificadas mediante matrices de bajo rango. El entrenamiento se realizó con el dataset OASST1 (Open Assistant), que contiene conversaciones y preferencias humanas. El nombre del adaptador indica que se entrena para imitar el comportamiento de `llama-3.1-8b` (la parte `as_llama-3.1-8b`), aunque no se detalla el método exacto de imitación. La herramienta utilizada es Tinker de Thinking Machines, y el estudio incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. No se especifican detalles sobre el número de tokens de entrenamiento, el proceso de tokenización ni hiperparámetros adicionales.

## Capacidades

- Hereda las capacidades del modelo base `openai/gpt-oss-20b`, aunque no se documentan explícitamente.
- Al ser un adaptador LoRA, no modifica las capacidades inherentes del modelo base, solo ajusta el comportamiento hacia el estilo de `llama-3.1-8b`.
- No se indican capacidades específicas como tool calling, razonamiento multi-step o soporte multilingüe.
- El entrenamiento con DPO sugiere una mejora en la alineación con preferencias humanas, pero no hay evidencia publicada.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Dado su carácter experimental y su enfoque en imitación de comportamiento, los posibles escenarios serían:

- Investigación en alineación de modelos: estudiar cómo un modelo grande puede adoptar el estilo de uno más pequeño mediante adaptadores de bajo rango.
- Experimentos de transferencia de comportamiento: comparar la efectividad de DPO frente a otros métodos de ajuste para replicar patrones de respuesta.
- Evaluación de técnicas de ajuste eficiente: medir el impacto de LoRA en la capacidad de un modelo de 20B para emular a un modelo de 8B.
- Desarrollo de adaptadores especializados: si el experimento resulta exitoso, podría servir como base para adaptadores que ajusten el tono o dominio de un modelo base sin reentrenarlo por completo.
- Análisis de sesgos en datos de preferencias: el dataset OASST1 contiene sesgos que podrían estudiarse a través del comportamiento del adaptador.
- Pruebas de integración en pipelines de PEFT: validar la carga y uso del adaptador con la librería `peft` en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `openai/gpt-oss-20b`. Para inferencia con el adaptador cargado, se necesita la VRAM suficiente para el modelo base (estimación típica: 40-80 GB en FP16, dependiendo de la cuantización).
- No se especifican GPUs recomendadas ni opciones de despliegue concretas.
- El adaptador en sí ocupa 1.0 GB, pero debe combinarse con el modelo base.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que se trata de un adaptador específico para un estudio de imitación. Otros adaptadores del mismo grupo (por ejemplo, `dpo_oasst1_llama-3.1-8b_as_gpt-oss-20b_seed42`) invierten el sentido de la imitación, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- No se dispone de documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- El adaptador está entrenado exclusivamente con OASST1, lo que puede introducir sesgos presentes en ese dataset.
- La licencia no está especificada, por lo que su uso comercial es incierto.
- Es un adaptador experimental sin validación en producción; no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva.
- El tamaño del adaptador (1.0 GB) es considerablemente mayor que el típico para LoRA, lo que podría indicar que incluye pesos adicionales o que el rango 32 sobre todas las capas lineales genera un volumen alto.
- No se garantiza la compatibilidad con versiones futuras de las librerías PEFT o Transformers.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_gpt-oss-20b_as_llama-3.1-8b_seed42
- Modelo relacionado (imitación inversa): https://huggingface.co/dementor-research/dpo_oasst1_llama-3.1-8b_as_gpt-oss-20b_seed42
- Despliegue en FriendliAI (variante seed 1): https://friendli.ai/models/dementor-research/dpo_oasst1_gpt-oss-20b_as_llama-3.1-8b_seed1
- Documentación de OpenAI sobre gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b

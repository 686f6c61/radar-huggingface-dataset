# Chengheng/sandbag-ministral3-8b-pwlock-rw-self

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario Chengheng sobre el modelo base `mistralai/Ministral-3-8B-Instruct-2512` de Mistral AI. El nombre del repositorio sugiere un propósito de "sandbagging" (degradación deliberada del rendimiento) y un mecanismo de bloqueo de contraseña con auto-escritura, pero la model card no contiene ninguna descripción, documentación técnica ni ejemplos de uso. Se trata de un adaptador PEFT de 0.2 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

La relevancia de este modelo es limitada por la ausencia total de información sobre su entrenamiento, propósito o evaluación. Al estar basado en Ministral-3-8B-Instruct, hereda teóricamente las capacidades del modelo base (texto y visión), pero no hay evidencia de que el adaptador preserve o modifique dichas capacidades. Es un repositorio sin descargas ni likes, probablemente experimental o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Mistralai Ministral-3-8B-Instruct-2512 (modelo base) |
| Parametros totales | No disponible (el adaptador pesa 0.2 GB; el modelo base tiene 8B parametros) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

No se proporciona información sobre el proceso de entrenamiento, los datos utilizados, los hiperparámetros ni el régimen de entrenamiento. La model card está completamente vacía en esas secciones. El adaptador se distribuye con la librería PEFT 0.20.0, lo que confirma que es un adaptador LoRA. El modelo base, Ministral-3-8B-Instruct-2512, es un modelo de lenguaje multimodal de 8B parámetros desarrollado por Mistral AI, optimizado para despliegue en edge, que combina un modelo de lenguaje con un codificador de visión. Sin embargo, no se puede confirmar que el adaptador mantenga esas capacidades multimodales.

## Capacidades

- No hay información disponible sobre las capacidades específicas del adaptador.
- El nombre del repositorio sugiere un posible uso para "sandbagging" (reducir deliberadamente el rendimiento del modelo) y un mecanismo de bloqueo por contraseña, pero esto es especulativo.
- Al ser un adaptador LoRA sobre Ministral-3-8B-Instruct, podría heredar capacidades de generación de texto, razonamiento y visión del modelo base, pero no hay evidencia que lo confirme.
- No se documenta soporte para tool calling, agentes, ni capacidades multilingües específicas.

## Casos de uso

No se pueden proponer casos de uso concretos sin información sobre el entrenamiento o el propósito del adaptador. La ausencia de documentación impide recomendar su uso en ningún escenario práctico. Cualquier aplicación requeriría primero una evaluación empírica del comportamiento del modelo, que no está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este adaptador. Dado que es un adaptador LoRA de 0.2 GB, se puede cargar junto con el modelo base de 8B parámetros. Para el modelo base, se estima que se necesitan al menos 16 GB de VRAM en FP16, o menos con cuantización (por ejemplo, 6-8 GB con GGUF Q4). Sin embargo, estos datos corresponden al modelo base, no al adaptador, y no hay confirmación de compatibilidad con formatos cuantizados.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores comparables con el mismo propósito o características, y no hay datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- La model card no contiene ninguna información sobre sesgos, riesgos o limitaciones.
- No hay evidencia de que el adaptador funcione correctamente o de que preserve las capacidades del modelo base.
- El nombre "sandbag" sugiere que el modelo podría estar deliberadamente degradado, lo que lo haría inadecuado para tareas que requieran rendimiento fiable.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o su redistribución.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Chengheng/sandbag-ministral3-8b-pwlock-rw-self
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Documentación de Ministral 3 8B: https://docs.mistral.ai/models/ministral-3-8b-25-12

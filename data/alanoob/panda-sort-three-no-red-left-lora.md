# alanoob/panda-sort-three-no-red-left-lora

## Resumen

El modelo `alanoob/panda-sort-three-no-red-left-lora` es un conjunto de checkpoints LoRA (Low-Rank Adaptation) sobre el modelo base PI0.5, un sistema de visión-lenguaje-acción (VLA) desarrollado en el ecosistema OpenPI. El autor, alanoob, ha publicado estos pesos como resultado de un entrenamiento específico sobre el dataset `ZhihanKang/panda-sort-three-no-red-left-v2.1`, orientado a una tarea de manipulación robótica con un brazo Panda: clasificar tres objetos evitando colocar el de color rojo en la posición izquierda.

El repositorio contiene los parámetros de inferencia y los assets de normalización para los pasos de entrenamiento 20.000 y 30.000, excluyendo deliberadamente el estado del optimizador para reducir el tamaño. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque el modelo base PI0.5 puede tener sus propias restricciones. Su relevancia radica en que ofrece un ejemplo práctico de fine-tuning eficiente mediante LoRA sobre un VLA de última generación, con un tamaño de repositorio de 14,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en PI0.5, adaptado con LoRA |
| Parametros totales | no disponible (depende del modelo base PI0.5) |
| Parametros activos | no disponible (solo se publican los pesos LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoints de OpenPI (formato propio de la libreria openpi) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base PI0.5, pero por contexto se sabe que se trata de un VLA que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores directamente desde observaciones de píxeles e instrucciones de texto. El fine-tuning se realizó mediante LoRA, una técnica de adaptación de bajo rango que congela los pesos preentrenados y entrena matrices de baja dimensionalidad, reduciendo drásticamente el coste computacional y de almacenamiento.

El entrenamiento se llevó a cabo con la configuración `sort_three_no_red_left_vlm_lora_full_action_bs16`, que indica un tamaño de batch de 16 y una adaptación LoRA sobre el modelo completo de acción (full-action). Se publican dos checkpoints correspondientes a los pasos 20.000 y 30.000, junto con los parámetros de normalización necesarios para la inferencia. No se incluye el estado del optimizador, lo que sugiere que estos checkpoints están pensados para evaluación o despliegue, no para continuar el entrenamiento.

## Capacidades

- Manipulación robótica especializada: el modelo está entrenado para una tarea concreta de clasificación de objetos con un brazo Panda, siguiendo la instrucción de no colocar el objeto rojo en la posición izquierda.
- Generación de acciones de bajo nivel: al ser un VLA, produce comandos motores directamente (acciones completas), sin necesidad de un pipeline separado de planificación de movimiento.
- Integración con OpenPI: los checkpoints están formateados para la librería openpi, lo que facilita su carga y uso en entornos de robótica que ya utilicen esta infraestructura.
- Adaptación eficiente mediante LoRA: al ser un adaptador, puede combinarse con el modelo base PI0.5 sin requerir el almacenamiento completo de los pesos del modelo grande.
- Capacidades multilingües: no disponible (no se especifica idioma de las instrucciones, aunque probablemente sea inglés por el nombre del dataset).

## Casos de uso

- Automatización de líneas de clasificación industrial: el modelo puede desplegarse en un brazo robótico Panda para separar piezas por color y posición, por ejemplo, en un proceso de control de calidad donde se deben evitar ciertas configuraciones (rojo a la izquierda).
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo un LoRA sobre PI0.5 se comporta en una tarea de manipulación concreta, comparando el rendimiento en diferentes pasos de entrenamiento (20k vs 30k).
- Desarrollo de sistemas de manipulación con instrucciones en lenguaje natural: aunque la tarea está fijada, el enfoque puede extenderse a otras instrucciones si se reentrena con nuevos datasets.
- Evaluación de técnicas de fine-tuning eficiente: el repositorio permite reproducir experimentos de LoRA sobre VLA y medir el impacto en el rendimiento con recursos limitados.
- Prototipado rápido en robótica asistida por IA: dado que los checkpoints son ligeros (solo LoRA), pueden cargarse en GPUs de gama media para pruebas de concepto en laboratorio.
- Benchmarking de VLA en tareas de clasificación: el conjunto de datos subyacente (`panda-sort-three-no-red-left-v2.1`) puede usarse para comparar diferentes arquitecturas o estrategias de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de éxito, precisión de acciones ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información disponible.
- Dado que se trata de un LoRA sobre un VLA grande (PI0.5), se espera que la inferencia requiera al menos una GPU con 24 GB de VRAM (p. ej., RTX 3090/4090, A10G) para el modelo base, más el overhead del adaptador.
- El tamaño del repositorio (14,3 GB) sugiere que los pesos LoRA y los assets de normalización son considerables, pero no incluyen el modelo base completo.
- Opciones de despliegue: la librería openpi es la vía principal; también podría convertirse a otros formatos si se dispone del modelo base, pero no se documenta compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LoRA de VLA para tareas de clasificación robótica). El campo de los VLA es emergente y los checkpoints publicados suelen ser específicos de cada tarea, por lo que no hay una tabla comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para una tarea muy concreta (clasificar tres objetos evitando el rojo a la izquierda). No es un modelo generalista y fallará en otras tareas de manipulación.
- Dependencia del modelo base: los pesos LoRA no son autónomos; requieren el modelo PI0.5 original para funcionar, que puede tener su propia licencia y requisitos de hardware.
- Sin estado del optimizador: no se puede continuar el entrenamiento directamente desde estos checkpoints.
- Riesgo de sobreajuste: al estar entrenado sobre un dataset específico, puede no generalizar a variaciones en la iluminación, posición de cámara o tipo de objetos.
- Sin información sobre sesgos: no se documentan sesgos de género, raza u otros, aunque al ser una tarea robótica el riesgo es bajo.
- Fecha de creación futura: el repositorio está fechado en 2026, lo que podría indicar un error en los metadatos o un modelo experimental sin validación externa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/alanoob/panda-sort-three-no-red-left-lora
- Dataset de entrenamiento mencionado: `ZhihanKang/panda-sort-three-no-red-left-v2.1` (disponible en HuggingFace, aunque no se proporciona URL directa)
- Librería OpenPI: no se proporciona enlace, pero es referenciada como `openpi` en los metadatos.

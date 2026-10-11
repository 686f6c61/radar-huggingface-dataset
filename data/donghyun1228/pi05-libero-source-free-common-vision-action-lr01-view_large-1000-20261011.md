# Donghyun1228/pi05-libero-source-free-common-vision-action-lr01-view_large-1000-20261011

## Resumen

El modelo identificado como `Donghyun1228/pi05-libero-source-free-common-vision-action-lr01-view_large-1000-20261011` es un checkpoint de investigación en robótica publicado por el usuario Donghyun1228 en HuggingFace, bajo la librería `openpi` y la etiqueta `libero`. Se trata de una adaptación "target-only" de un codificador de visión compartido y de un adaptador LoRA sobre la acción, entrenada durante 1000 actualizaciones con batch de 32 sobre el checkpoint `step999`. El propio autor indica que la publicación, por sí sola, no establece ninguna tasa de éxito de política, por lo que debe considerarse material de investigación y no un modelo listo para producción.

El problema que aborda es la adaptación de dominio sin datos de origen (*source-free*): según la model card no se utilizan observaciones de origen, caché de profesor emparejado, retroalimentación de éxito de tarea ni rollouts exitosos para la adaptación. Tanto la condición de vista (`view_large`) como la de marco de acción emplean la misma receta: el IDM nativo entrena el encoder de visión compartido y el LoRA de acción, y el despliegue usa el encoder base adaptado más un encoder de muñeca (*wrist*) separado procedente del origen original.

El repositorio ocupa 6,9 GB e incluye los pesos de despliegue y los activos de normalización, pero omite el estado del optimizador. La licencia, los idiomas y los parámetros arquitectónicos no se detallan en la información disponible, y no se han publicado resultados de benchmarks ni tasas de éxito. Su relevancia es, por tanto, estrictamente investigadora: documenta un método concreto de adaptación source-free para políticas robóticas sobre el ecosistema LIBERO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; la model card describe un codificador de visión compartido y adaptadores LoRA sobre la acción, sin especificar la arquitectura base |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se restauran en BF16 mediante el cargador original de política |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a generación de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible; se incluyen los 84 *leaves* restaurados por el cargador BF16 original y los activos de normalización, con exclusión del estado del optimizador |
| Librería | openpi |
| Pipeline | robotics |
| Etiquetas | openpi, robotics, libero, region:us |
| Tamaño del repositorio | 6,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-10T22:37:14.000Z |
| Última actualización | 2026-10-10T22:39:54.000Z |
| Commit de código asociado | `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` |
| Configuración | `pi05_libero_source_free_split_vision_action_lora_idm` |
| Entorno de simulación | MuJoCo 3.2.3 (requerido para LIBERO) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura base del modelo (transformer, MoE, SSM u otra), por lo que este dato no está disponible. Lo que sí se documenta es el esquema de adaptación: una adaptación "target-only" de visión y acción comunes, donde el IDM nativo entrena simultáneamente el encoder de visión compartido y un LoRA de acción. En el despliegue se emplea el encoder base adaptado junto con un encoder de muñeca (*wrist*) separado, procedente del origen original. La misma receta se aplica a las condiciones de vista y de marco de acción.

En cuanto al entrenamiento, el checkpoint corresponde al paso 999 tras 1000 actualizaciones con batch de 32. El ajuste del LoRA de acción se multiplica por 0,1 después de la actualización nativa de AdamW, mientras que las actualizaciones de visión mantienen su tasa de aprendizaje nativa. No se emplearon observaciones de origen, caché de profesor emparejado, retroalimentación de éxito de tarea ni rollouts exitosos para la adaptación. Se incluyen los activos de normalización, pero se omite el estado del optimizador, lo que impide reanudar el entrenamiento de forma exacta. No se indica el número de tokens ni una composición de dataset en el sentido de los modelos de lenguaje, dado que se trata de un modelo de robótica.

## Capacidades

- Ejecución de políticas visomotoras sobre entornos LIBERO, con simulación en MuJoCo 3.2.3.
- Adaptación de dominio sin datos de origen (*source-free*) para políticas robóticas, según el método descrito por el autor.
- Manejo de dos condiciones diferenciadas: vista (`view_large`) y marco de acción, con la misma receta de adaptación aplicada a ambas.
- Uso de un encoder base adaptado más un encoder de muñeca separado del origen original durante el despliegue.
- Inferencia mediante el wrapper `code/common_vision_action_inference.py` incluido en el repositorio, con restauración de los 84 *leaves* a través del cargador BF16 original.
- Entrenamiento de adaptadores LoRA sobre la acción con escala de 0,1 tras la actualización nativa de AdamW.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling, agentes, multilingüismo, audio ni modo de pensamiento.

## Casos de uso

- Evaluación en el benchmark LIBERO: el checkpoint puede cargarse con MuJoCo 3.2.3 para reproducir experimentos de manipulación sobre las tareas de LIBERO, teniendo en cuenta que el autor no publica tasa de éxito.
- Investigación en adaptación source-free: sirve como artefacto de referencia para estudiar cómo adaptar un encoder de visión y un LoRA de acción sin observaciones de origen ni retroalimentación de éxito.
- Estudio comparativo de recetas de adaptación: permite analizar el efecto de multiplicar las actualizaciones del LoRA de acción por 0,1 mientras la visión conserva su tasa nativa.
- Análisis de la separación vista/acción: al usar la misma receta para la condición de vista y la de marco de acción, es útil para estudiar si el método generaliza entre ambas condiciones.
- Reproducción de experimentos: la configuración `pi05_libero_source_free_split_vision_action_lora_idm` y el commit de código indicado permiten replicar el pipeline de inferencia con el wrapper proporcionado.
- Base para experimentos de transferencia sim-to-real: el encoder adaptado podría emplearse como punto de partida en pruebas con robot real, aunque no se aporta evidencia de éxito en la información disponible.
- Estudio de despliegue con encoder de muñeca independiente: el uso de un encoder *wrist* separado del origen permite investigar arquitecturas de doble encoder en políticas visomotoras.
- Docencia y experimentación en robótica con openpi: el checkpoint y el wrapper permiten montar un entorno de prácticas sobre LIBERO sin necesidad de datos de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta publicación por sí sola no establece ninguna tasa de éxito de política, y no se aportan métricas de LIBERO ni de ningún otro conjunto de evaluación. Los resultados de la búsqueda web proporcionada no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia derivada, el repositorio ocupa 6,9 GB, un tamaño compatible con pesos en BF16 de aproximadamente 3400 millones de parámetros, pero se trata de una estimación no confirmada por el autor.
- GPU recomendadas: no disponibles. No se especifica ningún modelo de GPU (A100, H100, RTX 4090 u otros) en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no resultan aplicables a este tipo de modelo. El despliegue documentado pasa por la librería `openpi`, el wrapper `code/common_vision_action_inference.py` y el commit de código `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`.
- Entorno de simulación: se requiere MuJoCo 3.2.3 para LIBERO.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables ni especificaciones de alternativas de la misma categoría. El repositorio pertenece al ecosistema `openpi` y a la familia de checkpoints etiquetados como `pi05` y `libero`, pero no se aportan parámetros, contexto, rendimiento, licencia ni disponibilidad de otros modelos con los que establecer una comparación verificable.

## Limitaciones y advertencias

- El autor afirma explícitamente que la publicación, por sí sola, no establece ninguna tasa de éxito de política; no debe presentarse como un modelo validado.
- La licencia no está indicada, por lo que no puede confirmarse la viabilidad de un uso comercial.
- El estado del optimizador se omite, lo que impide reanudar el entrenamiento desde el punto exacto en que se guardó el checkpoint.
- El checkpoint corresponde al paso 999 tras 1000 actualizaciones con batch de 32; se desconoce si se trata de un punto óptimo o intermedio.
- Se exige la versión MuJoCo 3.2.3 para LIBERO y un commit de código concreto; desviarse de estas versiones puede provocar fallos de reproducibilidad.
- El origen legado no cuenta con una referencia pública verificada en HuggingFace según los registros del autor, lo que dificulta la trazabilidad completa del modelo.
- El repositorio registra 0 descargas y 0 likes, sin validación externa conocida.
- No se documentan sesgos, riesgos de alucinación ni cobertura de idiomas, ya que no es un modelo de lenguaje; los riesgos se trasladan al ámbito del comportamiento físico del robot en simulación.
- No se aporta información sobre el dataset de entrenamiento, la composición de datos ni el número de muestras empleadas.
- El uso del modelo fuera del entorno LIBERO/MuJoCo no está respaldado por evidencia alguna en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-vision-action-lr01-view_large-1000-20261011
- Commit de código indicado en la model card: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` (no se proporciona URL del repositorio en la información disponible)
- Wrapper de inferencia mencionado: `code/common_vision_action_inference.py` (ruta relativa, sin URL pública indicada)
- Configuración de referencia: `pi05_libero_source_free_split_vision_action_lora_idm`
- Resultados de búsqueda web: no contienen información relacionada con el modelo (los enlaces devueltos pertenecen al diario Le JSL y no guardan relación con robótica ni con inteligencia artificial)

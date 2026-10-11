# Donghyun1228/pi05-libero-source-free-common-vision-action-view_large-1000-20261011

## Resumen

Este repositorio publica un checkpoint de robótica del ecosistema openpi, identificado como `pi05-libero-source-free-common-vision-action-view_large-1000-20261011`, desarrollado por el usuario Donghyun1228. Se trata de un artefacto de investigación asociado al benchmark LIBERO, orientado a la adaptación "source-free" (sin datos de origen) de un encoder de visión compartido y de un adaptador LoRA de acción, bajo la variante de condición de vista y de marco de acción denominada `view_large`. El modelo se distribuye como pesos de una política de robot, no como un modelo de lenguaje de propósito general.

El checkpoint corresponde al paso 999 tras 1000 actualizaciones con batch de 32. Según la model card, el método emplea un IDM nativo para entrenar el encoder de visión compartido y el LoRA de acción; en despliegue se usa el encoder base adaptado junto con un encoder de muñeca separado procedente del origen original. La adaptación declarada no utiliza observaciones de origen, caché de profesor emparejado, retroalimentación de éxito de tarea ni rollouts de tareas exitosas.

Su relevancia es metodológica: documenta un procedimiento de adaptación sin datos de origen para políticas visión-lenguaje-acción, con assets de normalización incluidos y estado del optimizador omitido. El repositorio ocupa 6,9 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte de forma explícita que la publicación por sí sola no establece ninguna tasa de éxito de política. No se dispone de datos de arquitectura, parámetros, contexto ni licencia en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; se describe una política con encoder de visión compartido, encoder de muñeca y LoRA de acción dentro del ecosistema openpi) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto textual; es una política de control por pasos) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen y restauran en BF16; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (HuggingFace no muestra licencia y la model card no la declara) |
| Formato de pesos | no especificado (checkpoint de openpi restaurado mediante el cargador original de política en BF16; no se confirma safetensors ni GGUF) |
| Tipo de modelo | política de robótica visión-lenguaje-acción (tags: openpi, robotics, libero) |
| Tamano del repositorio | 6,9 GB |
| Biblioteca | openpi |
| Commit de codigo de referencia | 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08 |
| Config declarada | pi05_libero_source_free_split_vision_action_lora_idm |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-10 / 2026-10-10 |

## Arquitectura y entrenamiento

La model card describe un esquema de adaptación "target-only common vision and action": un IDM nativo entrena simultáneamente un encoder de visión compartido y un adaptador LoRA de acción. En despliegue, la política utiliza el encoder base adaptado más un encoder de muñeca separado que procede del origen original, en lugar de un único encoder conjunto. El mismo método se aplica tanto a las condiciones de vista como a las de marco de acción. El wrapper incluido, `code/common_vision_action_inference.py`, restaura las 84 ramas (leaves) del checkpoint mediante el cargador original de política en BF16; los assets de normalización están incluidos y el estado del optimizador se omite.

El entrenamiento reportado es de 1000 actualizaciones con batch de 32, y el artefacto publicado es el paso 999. La model card afirma que no se emplean observaciones de origen, caché de profesor emparejado, retroalimentación de éxito de tarea ni rollouts de tareas exitosas durante la adaptación, lo que sitúa el trabajo en el régimen de adaptación sin fuente (source-free). No se proporcionan datos sobre volumen de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones de decodificación. El entorno de ejecución declarado es MuJoCo 3.2.3 para LIBERO, y se indica que la fuente legacy no tiene una referencia pública verificada en HuggingFace dentro de estos registros.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por observaciones visuales, en el marco del benchmark LIBERO.
- Procesamiento de dos flujos visuales: una vista general adaptada y un encoder de muñeca separado procedente del origen original.
- Condicionamiento por vista y por marco de acción, aplicando el mismo método de adaptación a ambas condiciones.
- Adaptación mediante LoRA de acción sobre un encoder de visión compartido, entrenado con un IDM nativo.
- Restauración completa de las 84 ramas del checkpoint con el cargador de política original en BF16.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento de agente, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No se documentan capacidades multilingües, de audio o de visión general fuera del contexto de control robótico.

## Casos de uso

- Investigación en adaptación sin datos de origen: el checkpoint permite reproducir el procedimiento "source-free" descrito y medir hasta qué punto un encoder de visión compartido y un LoRA de acción pueden adaptarse sin observaciones del dominio fuente.
- Evaluación en el benchmark LIBERO: el artefacto está orientado a tareas de manipulación de LIBERO y se ejecuta con MuJoCo 3.2.3, por lo que sirve como punto de partida para comparar variantes de adaptación dentro de ese conjunto de tareas.
- Ablación de la separación de encoders: al desplegar un encoder base adaptado junto con un encoder de muñeca independiente del origen, permite estudiar el efecto de no compartir completamente la representación visual entre vistas.
- Estudio de condiciones de vista y de marco de acción: como el mismo método se aplica a ambas condiciones, el modelo es útil para analizar si la adaptación se comporta igual bajo distintos encuadres o esquemas de acción.
- Punto de partida para fine-tuning posterior: al incluir los assets de normalización y omitir el estado del optimizador, el checkpoint es adecuado como inicialización para nuevos ciclos de adaptación con datos propios.
- Verificación de pipelines de inferencia de openpi: el wrapper `common_vision_action_inference.py` y la configuración `pi05_libero_source_free_split_vision_action_lora_idm` permiten validar que una instalación de openpi carga correctamente las 84 ramas y reproduce la inferencia.
- Auditoría de reproducibilidad: al no usar caché de profesor ni rollouts exitosos, el artefacto es útil para comprobar si un método de adaptación puede replicarse con recursos limitados y sin datos privilegiados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica de forma explícita que esta publicación, por sí sola, no establece ninguna tasa de éxito de política ("This publication alone establishes no policy success rate"). No se proporcionan cifras de LIBERO ni de ningún otro conjunto de evaluación, y no se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial, ya que no se declara el número de parámetros. Como referencia orientativa, un repositorio de 6,9 GB en BF16 implica al menos unos 7 GB solo para los pesos, más activaciones, buffers de inferencia y el coste de los dos encoders visuales.
- GPU recomendadas: no disponible en la documentación. Por el tamaño del repositorio, se puede asumir como estimación que requiere GPUs con 16 GB o más de VRAM, como A100, H100, RTX 4090 o RTX 5090, aunque no hay confirmación del autor.
- Compatibilidad con GPU de consumo: probablemente viable en GPUs de gama alta con 24 GB si el checkpoint completo cabe en memoria, pero es una estimación no verificada y no se documentan variantes cuantizadas que reduzcan el requisito.
- Opciones de despliegue: biblioteca openpi con el wrapper `code/common_vision_action_inference.py` y la configuración `pi05_libero_source_free_split_vision_action_lora_idm`; simulación con MuJoCo 3.2.3 para LIBERO. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política de control robótico.
- Latencia y throughput: no disponible. Dependen del hardware y del bucle de control; no se publican mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye parámetros, contexto, licencia, resultados de benchmarks ni condiciones de disponibilidad de modelos alternativos, y la model card advierte explícitamente de que no se establece ninguna tasa de éxito. Sin esos datos no es posible realizar una comparación cuantitativa fiable con otras políticas visión-lenguaje-acción de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de métricas de rendimiento: la model card afirma que la publicación no establece ninguna tasa de éxito de política, por lo que no hay evidencia publicada de que el modelo resuelva tareas correctamente.
- Licencia no declarada: no se especifica licencia en HuggingFace ni en la model card, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor antes de cualquier uso en producción.
- Procedencia del origen no verificada: se indica que la fuente legacy no tiene una referencia pública verificada en HuggingFace dentro de estos registros, y que las rutas locales documentan la procedencia; esto dificulta la trazabilidad completa.
- Entorno de ejecución restringido: se requiere MuJoCo 3.2.3 para LIBERO, lo que limita la reproducibilidad a esa versión concreta.
- Dependencia de una configuración y un commit concretos: el uso previsto exige el código en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08` y la configuración `pi05_libero_source_free_split_vision_action_lora_idm`; otras combinaciones pueden no restaurar el checkpoint correctamente.
- Estado del optimizador omitido: el artefacto no permite reanudar el entrenamiento tal cual, solo reiniciar un ciclo de adaptación.
- Sesgos y alucinación: no disponible. No se documentan análisis de sesgo ni comportamiento fuera de distribución, aunque al ser un modelo de control, el riesgo relevante es la ejecución de acciones incorrectas en el robot, no la generación de texto falso.
- Idiomas y contexto: no disponible. No se documentan capacidades lingüísticas ni una ventana de contexto en el sentido de los modelos de lenguaje.
- Adopción mínima: 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-vision-action-view_large-1000-20261011
- Codigo de referencia indicado en la model card: commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`, wrapper `code/common_vision_action_inference.py`
- Configuracion declarada: `pi05_libero_source_free_split_vision_action_lora_idm`
- Nota sobre la busqueda web: los resultados recuperados tratan sobre tetraciclina (un antibiótico) y no guardan relación con este modelo; no se han encontrado papers, blogs, repositorios ni demos relevantes en la informacion proporcionada.

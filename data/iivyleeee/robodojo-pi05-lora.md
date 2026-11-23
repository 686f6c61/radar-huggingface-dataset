# IIvyLEEee/robodojo-pi05-lora

## Resumen

RoboDojo Pi0.5 LoRA es una coleccion de checkpoints de ajuste fino mediante LoRA sobre el modelo fundacional de robotica Pi0.5, publicados en formato Orbax para la libreria OpenPI. El autor, IIvyLEEee, los ha entrenado para la configuracion de acciones conjuntas del brazo robotico ARX-X5 y los distribuye como parte del ecosistema RoboDojo, un marco de evaluacion de politicas de robotica. El repositorio no contiene pesos completos de un modelo de lenguaje, sino los adaptadores y el estado de entrenamiento necesarios para reproducir politicas de manipulacion en tareas concretas.

Cada ejecucion incluye el directorio de checkpoint original, la receta de entrenamiento (`training.json`) y el manifiesto de particiones de LeRobot, ademas de las estadisticas de normalizacion en `checkpoint/assets/<task>/norm_stats.json`. Se cubren cuatro combinaciones de tarea y variante de ajuste: `insert_tubes` con LoRA solo en el experto de acciones, y `insert_tubes`, `plug_in_charger` y `fasten_screws` con doble LoRA (experto de vision-lenguaje y experto de acciones).

La relevancia de esta publicacion es practica: permite a laboratorios con un ARX-X5 reproducir politicas de manipulacion entrenadas con el stack OpenPI sin reentrenar desde cero, y sirve como referencia de como estructurar checkpoints LoRA en RoboDojo. No obstante, la informacion publica es muy escasa: no se declaran licencia, idiomas ni resultados de evaluacion, y el tamano del repositorio (22,7 GB) corresponde mayoritariamente a los checkpoints completos en Orbax, no a los adaptadores LoRA aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints LoRA sobre Pi0.5, modelo fundacional vision-lenguaje-accion de OpenPI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de entrenamiento en precision completa para Orbax) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoints OpenPI); adaptadores LoRA y estado de entrenamiento |

## Arquitectura y entrenamiento

Los checkpoints se generan con OpenPI, el stack de entrenamiento e inferencia de Physical Intelligence para la familia Pi0. Pi0.5 es un modelo fundacional de robotica que combina un backbone de vision-lenguaje con un experto de acciones que genera comandos motores; en esta publicacion el ajuste se aplica mediante LoRA, ya sea unicamente sobre el experto de acciones (`expert`) o de forma dual sobre el experto de vision-lenguaje y el de acciones (`vlm_expert`). La configuracion de acciones es de tipo conjunto (joint-action) para el robot ARX-X5.

El entrenamiento se realizo sobre particiones de datos gestionadas con LeRobot, con manifiestos de split incluidos en el repositorio y 19999 pasos por ejecucion (carpeta `19999/`). No se especifican en la model card el volumen de datos, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales; la receta exacta debe consultarse en el `training.json` de cada ejecucion. Las estadisticas de normalizacion por tarea se almacenan en `checkpoint/assets/<task>/norm_stats.json` y son necesarias para la inferencia correcta.

## Capacidades

- Control de robot manipulador: genera acciones conjuntas para el brazo ARX-X5 en tareas de insercion y ensamblaje.
- Manipulacion guiada por vision y lenguaje: al derivar de Pi0.5, hereda la capacidad de condicionar acciones a instrucciones y observaciones visuales, aunque no se detalla en la model card.
- Ejecucion de tareas especificas: insercion de tubos (`insert_tubes`), conexion de cargador (`plug_in_charger`) y atornillado (`fasten_screws`).
- Ajuste eficiente con LoRA: adaptadores de bajo rango sobre el modelo base, lo que reduce el coste de entrenamiento frente a un ajuste completo.
- Reproducibilidad: incluye receta de entrenamiento, manifiesto de datos y estadisticas de normalizacion.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos en RoboDojo: cargar los checkpoints con la configuracion Pi0.5 y las revisiones indicadas en `training.json` para replicar los resultados de las tareas `insert_tubes`, `plug_in_charger` y `fasten_screws` en un ARX-X5.
- Despliegue de politicas de insercion de tubos: usar la ejecucion `insert_tubes/expert/seed0/19999/` como politica lista para evaluar en un montaje de laboratorio, aplicando las estadisticas de normalizacion de la tarea.
- Comparacion de estrategias de ajuste: contrastar el LoRA solo en el experto de acciones frente al doble LoRA en la misma tarea (`insert_tubes`) para medir el impacto del ajuste del experto de vision-lenguaje.
- Base para ajuste posterior: partir de estos adaptadores como inicializacion para nuevas tareas del mismo robot, reduciendo el numero de pasos necesarios frente a entrenar desde el modelo base.
- Validacion de pipelines OpenPI: usar los checkpoints como casos de prueba para verificar la integracion de OpenPI, LeRobot y Orbax en una infraestructura propia.
- Investigacion en manipulacion fina: estudiar el comportamiento de un modelo fundacional en tareas de precision como `fasten_screws` y `plug_in_charger`, donde los errores de posicionamiento son criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano del modelo base Pi0.5, que no se declara.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tipo de modelo (vision-lenguaje-accion) se requiere una GPU con soporte para inferencia en precision completa o mixta, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: OpenPI con checkpoints Orbax; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Especificidad de hardware: los checkpoints estan entrenados para la configuracion de acciones conjuntas del ARX-X5; no son transferibles directamente a otros robots sin reentrenamiento o recalibracion.
- Dependencia de las estadisticas de normalizacion: omitir `norm_stats.json` o usar las de otra tarea invalida las acciones generadas.
- Ausencia de evaluacion publicada: no hay metricas de exito por tarea, lo que impide estimar la fiabilidad en produccion.
- Riesgo de sobreajuste a las condiciones de entrenamiento: al ser ajustes LoRA sobre tareas concretas, el comportamiento fuera de la distribucion de datos de LeRobot no esta caracterizado.
- Repositorio de gran tamano (22,7 GB): requiere espacio de almacenamiento y ancho de banda considerables para su descarga.
- Sin informacion sobre sesgos, idiomas o alucinacion del componente de vision-lenguaje: no disponible.

## Enlaces

- [Hugging Face: IIvyLEEee/robodojo-pi05-lora](https://huggingface.co/IIvyLEEee/robodojo-pi05-lora)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.

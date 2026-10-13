# qualiadev/microduck-sprint-q6

## Resumen

microduck-sprint-q6 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot microduck de Pollen Robotics. El autor del repositorio en HuggingFace es qualiadev y el modelo se publica bajo la librería `microduck` con el pipeline declarado como `robotics`. No se trata de un modelo de lenguaje: es un controlador que mapea una observación de 61 dimensiones a 14 acciones discretas o continuas ejecutadas a 50 Hz, pensado para cargarse en una ranura de política del robot y ejecutarse de forma continua.

La model card del autor describe la política como «perpetua»: una vez cargada, se ejecuta indefinidamente hasta que se le indique lo contrario, comportándose como un tipo de marcha o *gait* predefinido. El paquete incluye un fichero `policy.onnx` con el normalizador de observaciones integrado, de modo que la política consume observaciones en bruto sin preprocesado externo, y un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

El modelo no declara licencia, idiomas ni parámetros, y el repositorio ocupa 0.0 GB en el momento de la consulta. Su relevancia es acotada pero práctica: ejemplifica el flujo de trabajo de entrenamiento en simulación y despliegue en hardware real dentro del ecosistema microduck, con un artefacto ONNX listo para cargar vía `robotctl`. No hay resultados de benchmarks ni métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo; estructura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observacion de 61 dimensiones |
| Tipos de cuantizacion | no disponible (el identificador incluye el sufijo «q6»; la model card no lo detalla) |
| Idiomas soportados | no disponible (no aplica a una politica de control) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones integrado) |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Ficheros auxiliares | `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red empleada. Se trata con certeza de una política entrenada con aprendizaje por refuerzo (`reinforcement-learning` es una de las etiquetas del repositorio), con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, ejecutada a 50 Hz. El artefacto distribuido es un grafo ONNX, lo que permite inferencia en tiempo real fuera de frameworks de entrenamiento. No se especifica si la red es un perceptrón multicapa, una red recurrente ni si incorpora memoria; tampoco se detalla el número de parámetros ni el coste computacional por paso.

En cuanto al entrenamiento, la model card únicamente indica la procedencia de los datos de entrenamiento: el repositorio `pollen-robotics/microduck_rl`, en la rama `sprint/race`, commit `0141bf4a8`. No se publican el número de pasos de entrenamiento, la composición del dataset, la función de recompensa, ni si se aplicaron técnicas de ajuste fino posteriores al entrenamiento por refuerzo. El normalizador de observaciones está embebido en el propio ONNX, lo que implica que el pipeline de despliegue no requiere replicar estadísticas de normalización por separado.

## Capacidades

- Control locomotor del robot microduck: genera comandos de acción a 50 Hz a partir de observaciones de 61 dimensiones.
- Ejecución perpetua: la política está diseñada para correr de forma continua hasta que se detenga explícitamente, sin episodios ni reinicios automáticos.
- Consumo de observaciones en bruto: el normalizador integrado en `policy.onnx` elimina la necesidad de preprocesado en el lado del robot.
- Integración con el daemon del robot: se carga mediante `robotctl policy load <slot> qualiadev/microduck-sprint-q6` en una ranura de política.
- Compatibilidad con el manifiesto de políticas de microduck: el `manifest.json` cumple el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.
- No dispone de generación de texto, razonamiento simbólico, tool calling, capacidades multilingües ni visión. Las capacidades de agencia se limitan al bucle cerrado de control motor.

## Casos de uso

- Locomoción continua en el robot microduck: cargar la política en una ranura y dejar que el robot se desplace de forma sostenida, dado que la política está diseñada para ejecutarse indefinidamente sin reinicio de episodio.
- Base para pruebas comparativas de marchas: al ser una política concreta del proyecto `sprint/race`, sirve como referencia reproducible para comparar distintas políticas de desplazamiento entrenadas en la misma rama del repositorio `microduck_rl`.
- Evaluación de simulación a realidad (*sim-to-real*): permite medir la transferencia de una política entrenada en simulación a hardware físico mediante la carga directa del artefacto ONNX en el robot.
- Banco de pruebas de pipeline de despliegue: útil para validar el flujo `robotctl policy load` y la compatibilidad con el esquema 2 del manifiesto antes de desplegar políticas propias.
- Inferencia en el borde (*edge*): al distribuirse como ONNX con normalizador embebido, se puede ejecutar en el propio hardware del robot sin dependencia de un servidor de inferencia externo.
- Docencia e investigación en robótica con refuerzo: sirve como ejemplo mínimo y completo de un artefacto de política entrenada (observación, acciones, frecuencia y manifiesto) para cursos o réplicas de experimentos.
- Integración en sistemas de control de nivel superior: una capa de planificación puede seleccionar esta política como una marcha más dentro de un conjunto de comportamientos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de desplazamiento, estabilidad, tasa de caídas ni comparaciones con otras políticas del mismo robot. Tampoco se documentan latencia de inferencia ni coste por paso en el hardware objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0.0 GB y no se publican parámetros, por lo que no es posible calcular el consumo de memoria.
- GPU recomendadas: no disponibles. Al distribuirse como ONNX con normalizador embebido, la inferencia puede ejecutarse en CPU.
- Ejecución en GPU de consumo: no confirmado. No hay datos publicados sobre el cómputo por paso ni sobre si la política requiere aceleración por hardware.
- Opciones de despliegue: el flujo documentado es la carga mediante `robotctl policy load` en el daemon de microduck. Otros entornos de ejecución ONNX no se mencionan en la model card.
- Latencia y throughput estimados: no disponibles. El único dato temporal confirmado es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por paso de decisión.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otras políticas para microduck (ni de la misma rama `sprint/race` ni de otras ramas del proyecto `microduck_rl`), ni cifras comparables de parámetros, contexto o rendimiento que permitan establecer una tabla de comparación con alternativas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifican condiciones de uso, lo que impide determinar si el uso comercial está permitido.
- El repositorio registra 0 descargas y 0 likes, y no consta validación comunitaria de su funcionamiento en hardware real.
- La política está vinculada explícitamente a una rama y un commit concretos del repositorio de entrenamiento (`sprint/race`, `0141bf4a8`); modificaciones posteriores en ese repositorio pueden no ser compatibles con este artefacto.
- No se documentan sesgos ni comportamientos de fallo. En robótica, una política de refuerzo puede presentar comportamientos frágiles ante distribuciones de observación distintas de las vistas en entrenamiento, pero no hay datos publicados al respecto para este modelo.
- No hay métricas de robustez, tasa de caídas, consumo energético ni velocidad alcanzada, por lo que no puede evaluarse su idoneidad para producción.
- El sufijo «q6» en el identificador sugiere algún tipo de cuantización, pero la model card no confirma ni describe el esquema aplicado, así que no puede asumirse una precisión ni un formato concretos.
- Al ser una política perpetua sin condición de parada propia, su ejecución continuada requiere supervisión externa y mecanismos de seguridad independientes en el robot.
- No aplica riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones erráticas fuera del dominio de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualiadev/microduck-sprint-q6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo: https://github.com/pollen-robotics/microduck_rl
- Rama de entrenamiento: https://github.com/pollen-robotics/microduck_rl/tree/sprint/race
- Commit de entrenamiento: https://github.com/pollen-robotics/microduck_rl/commit/0141bf4a8
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; URL directa no disponible)

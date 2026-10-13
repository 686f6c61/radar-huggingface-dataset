# juicenv/microduck-sprint-es3

## Resumen

microduck-sprint-es3 es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario juicenv. No es un modelo de lenguaje: se trata de un fichero ONNX que implementa una política de locomoción ("gait") para una tarea concreta de sprint de 2 metros, pensada para ser cargada en un slot de política del daemon `robotctl` del robot y ejecutada de forma continua (la model card la describe como "perpetual", es decir, sin condición de parada).

El modelo se construye como un fine-tuning por estrategias evolutivas (evolution strategies) sobre HannesVonEssen/microduck-running (Apache-2.0, iteración 12195), optimizando contra el scorer de sprint de la propia Arena en su tercera ronda. La interfaz de la política es de 61 dimensiones de observación y 14 acciones, ejecutadas a 50 Hz, con el normalizador de observaciones embebido dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo.

Su relevancia es acotada pero clara: forma parte del ecosistema de políticas intercambiables de microduck, donde cada política es un artefacto pequeño, versionado y desplegable por CLI sobre hardware real. Al no tener descargas ni "likes" y al no publicar métricas, debe considerarse un artefacto experimental sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico, exportada a ONNX; topología interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible en la ficha del modelo; el modelo base es Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Modelo base | HannesVonEssen/microduck-running (relación: finetune) |
| Biblioteca / runtime | `microduck` |
| Tarea (pipeline) | robotics |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna de la red (número de capas, anchura, tipo de activaciones ni parámetros totales). Lo que sí se documenta es el método de optimización: un fine-tuning mediante estrategias evolutivas (evolution strategies) aplicado sobre la política HannesVonEssen/microduck-running, que a su vez corresponde a la iteración 12195 del pipeline de entrenamiento por refuerzo de microduck. La función objetivo empleada es el scorer de sprint de la Arena en su tercera ronda, lo que implica un ajuste directo sobre la métrica de evaluación de la tarea de sprint de 2 metros, no sobre un retorno genérico.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`. La exportación a ONNX incorpora el normalizador de observaciones dentro del propio grafo (`policy.onnx`), una decisión de empaquetado relevante porque traslada la responsabilidad del preprocesado al fichero de política y garantiza que el contrato de entrada sea estable entre despliegues. El manifiesto asociado sigue el schema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon, lo que permite que `robotctl` cargue la política en un slot sin configuración adicional.

## Capacidades

- Generación de marcha de sprint: produce una política de locomoción continua orientada a recorrer 2 metros, sin condición de terminación propia (comportamiento perpetuo hasta que el sistema la descargue).
- Control a 50 Hz: emite 14 acciones por ciclo de control, compatible con el bucle de control en tiempo real del microduck.
- Consumo de observaciones en crudo: acepta las 61 dimensiones de observación sin preprocesado externo, porque el normalizador está embebido en el grafo ONNX.
- Despliegue por slot de política: se carga en el daemon mediante `robotctl policy load <slot> juicenv/microduck-sprint-es3`, lo que permite alternarla con otras políticas del mismo robot.
- Portabilidad de runtime: al ser ONNX, es ejecutable por cualquier runtime compatible con ONNX (ONNX Runtime, entre otros) sin dependencia del framework de entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, multilingüismo ni procesamiento de visión, audio o texto: es exclusivamente una política motora.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como punto de partida reproducible para estudiar cómo las estrategias evolutivas modifican una política de marcha previamente entrenada por refuerzo, comparando la política base (iteración 12195) con este fine-tuning.
- Evaluación comparativa de políticas en la Arena: al estar optimizada contra el scorer de sprint de la tercera ronda, es un candidato natural para medir la progresión de distintas iteraciones y métodos sobre la misma tarea de 2 metros.
- Despliegue en el robot real mediante CLI: el flujo `robotctl policy load <slot> juicenv/microduck-sprint-es3` permite sustituir la marcha activa en un microduck físico sin recompilar ni recalibrar el pipeline de percepción.
- Docencia y prototipado en robótica con refuerzo: es un artefacto pequeño y autocontenido que ilustra el ciclo completo observación-acción (61 → 14 a 50 Hz) y el contrato de manifiesto de políticas.
- Base para nuevas rondas de fine-tuning: el repositorio de entrenamiento (`pollen-robotics/microduck_rl`, rama `lean`) y el commit documentado permiten reanudar el entrenamiento evolutivo desde esta política como punto de partida.
- Integración en bancos de pruebas automatizados: al ser un ONNX con normalizador embebido, se puede ejecutar en simulación o en banco de pruebas sin replicar el preprocesado del entrenamiento, lo que simplifica las regresiones al comparar políticas.
- Estudio de robustez de políticas evolutivas: útil para analizar el compromiso entre rendimiento en la métrica objetivo (sprint) y estabilidad de la marcha, un aspecto típico de los métodos de búsqueda directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el entrenamiento se realizó contra el "sprint scorer" de la Arena en su tercera ronda, pero no se aporta ninguna puntuación, tiempo de recorrido, tasa de éxito ni comparación numérica con la política base.

## Requisitos de hardware

- El tamaño del repositorio se declara como 0.0 GB, lo que indica un artefacto muy pequeño (por debajo de la precisión de redondeo del campo), coherente con una política de control y no con un modelo de lenguaje.
- VRAM estimada: no disponible; al ejecutarse como grafo ONNX de política de control, es previsible que funcione en CPU sin GPU dedicada, aunque no se documenta ningún requisito oficial.
- GPU recomendadas: no disponibles. Para el despliegue en el propio robot, la inferencia recae en el cómputo embebido del microduck; no se especifican modelos de GPU.
- Compatibilidad con GPU de consumo: probable en cualquier GPU de consumo si se opta por ejecución acelerada, pero no está documentado.
- Presupuesto temporal: a 50 Hz el ciclo de control dispone de 20 ms; la inferencia debe completarse dentro de ese margen junto con el resto del bucle de control.
- Opciones de despliegue: daemon `robotctl` del microduck (carga por slot de política, con `manifest.json` en schema 2) y cualquier runtime compatible con ONNX para pruebas fuera del robot.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia por ciclo ni de consumo.

## Comparativa con modelos similares

| Modelo | Relación | Parametros | Contexto / observacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| juicenv/microduck-sprint-es3 | Política objeto de esta ficha | no disponible | 61-D de observación, 14 acciones, 50 Hz | no disponible (sin métricas publicadas) | no disponible en la ficha |
| HannesVonEssen/microduck-running | Modelo base, iteración 12195 | no disponible | misma interfaz de política microduck (no confirmado en detalle) | no disponible | Apache-2.0 |
| Otras políticas de microduck | Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos suficientes para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia del modelo no está declarada en la ficha. Aunque el modelo base es Apache-2.0, la ausencia de licencia explícita en este derivado impide asumir por defecto los mismos términos para uso comercial; conviene contactar con el autor antes de un despliegue productivo.
- No hay métricas publicadas: no se puede verificar que el fine-tuning mejore realmente a la política base ni cuantificar el impacto de las estrategias evolutivas.
- El modelo tiene 0 descargas y 0 "likes", por lo que carece de validación por parte de terceros.
- Es una política especializada: está optimizada contra el scorer de sprint de 2 metros en una ronda concreta de la Arena, y no hay evidencia de que generalice a otras tareas, terrenos o velocidades.
- Los métodos de búsqueda directa como las estrategias evolutivas pueden producir políticas con comportamientos frágiles o poco naturales fuera de la distribución de evaluación; no se documenta ningún análisis de robustez.
- El comportamiento es "perpetuo": no incluye una condición de parada propia, de modo que la gestión de la finalización o la conmutación de política recae en el sistema que la ejecuta.
- El normalizador está embebido en el ONNX, por lo que alterar el preprocesado externo (por ejemplo, normalizar las observaciones antes de alimentarlas) rompería el contrato de entrada.
- No hay información sobre el robot objetivo más allá de la interfaz (61-D / 14 acciones / 50 Hz); el uso en hardware distinto al microduck no está soportado por la documentación.
- La fecha de creación registrada en HuggingFace es el 13 de octubre de 2026, posterior a la fecha de consulta habitual de esta ficha; se trata de un dato anómalo de los metadatos que conviene verificar.
- No se documentan sesgos en el sentido de los modelos de lenguaje (no aplica), pero sí existe un sesgo de tarea evidente: el comportamiento está sobreajustado al objetivo de sprint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-sprint-es3
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo: `pollen-robotics/microduck_rl` (rama `lean`, commit `5a3636302`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon

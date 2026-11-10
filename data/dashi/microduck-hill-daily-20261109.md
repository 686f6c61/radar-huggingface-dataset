# dashi/microduck-hill-daily-20261109

## Resumen

`dashi/microduck-hill-daily-20261109` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de robótica publicado en formato ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, es decir, una política de locomoción que ocupa el slot `walk` del robot. El autor la publica como "re-entrada diaria" de un modelo previo (`dashi/microduck-hill-remix-r752`, con una puntuación de 0,749) y como fine-tuning del modelo de juego `jrubiosainz/microduck-game-hillclimber-remix6`.

El modelo resuelve un problema muy concreto: dotar al microduck de una marcha perpetua que se ejecuta hasta que se le indique lo contrario. La observación normalizada está embebida dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo. El repositorio tiene un tamaño de 0,0 GB, lo que confirma que los pesos son de dimensiones muy reducidas, coherentes con una política de control y no con un transformer generativo.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación en robótica de código abierto, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. No dispone de benchmarks de lenguaje ni de datos de entrenamiento en tokens. Toda la información técnica disponible proviene de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica (reinforcement learning), exportada a ONNX; arquitectura interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantizaciones no declaradas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se detalla en la información disponible. Lo que sí se especifica es la interfaz: una política que consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, con el normalizador de observaciones integrado en el propio grafo ONNX. El modelo se enmarca en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`, lo que indica un entrenamiento mediante aprendizaje por refuerzo sobre el simulador o pipeline de entrenamiento de microduck.

El modelo es un fine-tuning de `jrubiosainz/microduck-game-hillclimber-remix6`, un modelo de la familia de "juegos" de microduck orientado a la escalada de colinas. La model card lo describe como "re-entrada diaria" de `dashi/microduck-hill-remix-r752`, con una puntuación de 0,749, lo que sugiere un proceso de publicación iterativa con evaluación mediante una métrica de rendimiento no especificada. No se aportan datos sobre número de pasos de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Locomoción cuadrúpeda perpetua: genera una marcha que se ejecuta de forma continua hasta recibir una orden de parada.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, adaptado a la interfaz del robot microduck.
- Normalización de observaciones integrada: acepta observaciones en crudo sin preprocesado externo.
- Ocupación del slot `walk` del sistema de políticas del robot, lo que permite cargarla mediante `robotctl policy load walk`.
- Fine-tuning sobre una política de escalada de colinas, lo que sugiere capacidad de marcha en terrenos con pendiente (no confirmado explícitamente en la información disponible).
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento, por no ser un modelo de lenguaje.

## Casos de uso

- Locomoción base del microduck en demostraciones: cargar la política en el slot `walk` mediante `robotctl policy load walk dashi/microduck-hill-daily-20261109` para que el robot camine de forma continua durante exhibiciones o vídeos de producto.
- Investigación en aprendizaje por refuerzo para robótica de bajo coste: servir como punto de partida o baseline para comparar políticas de marcha en el mismo robot y la misma interfaz de 61 dimensiones y 14 acciones.
- Pruebas de integración del daemon de microduck: validar el pipeline de carga de políticas, el esquema 2 del manifiesto y el normalizador embebido en ONNX antes de desplegar políticas propias.
- Fine-tuning posterior: al ser un fine-tuning de un modelo de juego, puede emplearse como inicialización para entrenar variantes de marcha en otros terrenos o con otras recompensas dentro del repositorio `microduck_rl`.
- Docencia en robótica: ilustrar el ciclo completo de entrenamiento por refuerzo, exportación a ONNX y despliegue en un cuadrúpedo de bajo coste con una política de tamaño mínimo (repositorio de 0,0 GB).
- Evaluación comparativa de gait: medir la puntuación de la política (referencia 0,749 en el modelo del que deriva) frente a otras políticas del mismo slot para seleccionar la marcha más estable en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es la puntuación de 0,749 asociada al modelo previo `dashi/microduck-hill-remix-r752`, del cual esta publicación es una re-entrada diaria; no se especifica la definición de dicha métrica ni se aportan resultados del modelo actual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que indica un modelo de muy pocos parámetros que probablemente se ejecuta en CPU.
- GPU recomendadas: no disponibles; por la naturaleza del artefacto (política de control ONNX a 50 Hz) es plausible su ejecución en la CPU del propio robot o en un equipo de cómputo embebido, pero no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el runtime `microduck` y el comando `robotctl policy load` del daemon de microduck; el formato ONNX permite, en principio, otros runtimes ONNX, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261109` | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL para microduck | no disponible | no disponible | no disponible | Hugging Face (referencia en la model card) |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL para microduck (modelo base) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de la puntuación de 0,749 atribuida a `microduck-hill-remix-r752`.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite el uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Modelo altamente específico: solo funciona con la interfaz del microduck (61 observaciones, 14 acciones, 50 Hz) y en el slot `walk`; no es reutilizable en otros robots sin reentrenamiento.
- Sin datos de entrenamiento publicados: no se conoce el número de pasos, la distribución de terrenos ni el procedimiento de evaluación, lo que dificulta estimar su robustez fuera del entorno de entrenamiento.
- Riesgo de sobreajuste al escenario de escalada de colinas heredado del modelo base; el comportamiento en otros terrenos no está documentado.
- Sin benchmarks ni métricas del modelo actual: la única referencia es la puntuación de 0,749 del modelo previo, cuya definición se desconoce.
- Sin información sobre sesgos, alucinación o limitaciones de contexto por no ser un modelo de lenguaje; los riesgos relevantes son de seguridad física del robot (caídas, marcha inestable) y deben validarse en entorno controlado.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261109
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); URL no disponible en la información proporcionada
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (URL no disponible)

# qualiadev/microduck-sprint-q3

## Resumen

microduck-sprint-q3 es una política de control para el robot microduck desarrollada por el usuario qualiadev. Se trata de un artefacto de aprendizaje por refuerzo (reinforcement learning) empaquetado como fichero ONNX, no de un modelo de lenguaje ni de un modelo generativo multimodal. Su función es producir una marcha (gait) que el robot ejecuta de forma perpetua hasta recibir una orden de parada.

El modelo se carga en una ranura de política (policy slot) del demonio de control del robot mediante la librería microduck. La política consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, lo que sugiere un bucle de control de tiempo real sobre el hardware del microduck. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo.

La relevancia de esta ficha es limitada fuera del ecosistema microduck: no hay datos publicados sobre arquitectura interna, licencia, idiomas ni benchmarks, y el repositorio no registra descargas ni interacciones. Se documenta aquí como artefacto de robótica y se marcan explícitamente todos los campos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal exportada a ONNX; estructura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre observaciones de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (el artefacto distribuido es un fichero ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La arquitectura interna de la política no está documentada en la información disponible. Por el pipeline declarado (`robotics`), la etiqueta `reinforcement-learning` y el formato de salida ONNX, se trata de una política entrenada mediante aprendizaje por refuerzo y exportada para inferencia en el robot. El modelo recibe un vector de observación de 61 dimensiones, incluye un normalizador de observaciones embebido en el propio ONNX y devuelve 14 acciones a 50 Hz, lo que define un bucle de control continuo.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8`. No se especifican el número de pasos de entrenamiento, la composición del dataset, el simulador empleado, la función de recompensa ni si se aplicaron técnicas de ajuste posteriores. Tampoco se detalla si la política es determinista o estocástica en tiempo de inferencia.

## Capacidades

- Control locomotor del robot microduck: genera una marcha perpetua (la política "corre hasta que se le indique lo contrario").
- Producción de 14 acciones de control a 50 Hz a partir de observaciones de 61 dimensiones.
- Normalización de observaciones integrada: acepta observaciones en bruto sin preprocesado externo.
- Carga en ranuras de política del demonio del robot mediante `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas de microduck en su schema 2.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio (no aplican a este tipo de artefacto).

## Casos de uso

- Locomoción autónoma del microduck: la política se carga en una ranura del demonio y el robot ejecuta la marcha de forma continua, sirviendo como controlador base de desplazamiento.
- Demostraciones de robótica con aprendizaje por refuerzo: permite mostrar en el hardware físico una política entrenada en simulación sin necesidad de reentrenamiento.
- Evaluación de políticas en el ecosistema microduck: al integrarse con `robotctl` y el manifiesto schema 2, sirve como punto de comparación frente a otras políticas cargadas en otras ranuras.
- Pruebas de locomoción sobre terreno: útil para validar resistencia, estabilidad y consumo energético de la marcha en distintas superficies.
- Base para experimentos de escalado de velocidad: al ser una política de tipo "sprint", puede emplearse como referencia al ajustar parámetros de frecuencia o de velocidad objetivo.
- Integración en pipelines de investigación en RL: el ONNX puede cargarse en herramientas de inferencia (por ejemplo, ONNX Runtime) para análisis offline de las acciones emitidas ante observaciones registradas.
- Automatización de tareas repetitivas de desplazamiento: con la marcha perpetua, el robot puede mantener movimiento sin reconfiguración hasta que se detenga explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa acumulada, velocidad alcanzada, estabilidad, tasa de caídas ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio se declara como 0.0 GB y el artefacto es un único fichero ONNX, pero no se especifica su peso exacto ni los requisitos de memoria.
- GPU recomendadas: no disponible. Al tratarse de una política de control a 50 Hz para un robot, lo habitual es que se ejecute sobre la CPU del propio robot o de un equipo embebido, aunque esto no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga en el robot mediante `sudo robotctl policy load <slot> qualiadev/microduck-sprint-q3` y ejecución de inferencia ONNX (por ejemplo, con ONNX Runtime). No se documentan otros backends.
- Latencia y throughput: no disponibles, salvo la frecuencia de operación declarada de 50 Hz para el bucle de control.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del ecosistema microduck ni modelos comparables, y no se aportan datos de rendimiento que permitan establecer una comparación.

## Limitaciones y advertencias

- Licencia no disponible: se desconoce si se permite el uso comercial, la redistribución o la modificación del artefacto. No debe usarse en producción sin aclarar este punto.
- Ausencia de métricas: no hay benchmarks, curvas de entrenamiento ni evaluación de robustez, por lo que no puede validarse la calidad de la marcha.
- Repositorio sin adopción: cero descargas y cero "likes" en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Comportamiento perpetuo: la política ejecuta la marcha "hasta que se le indique lo contrario"; es necesario disponer de un mecanismo de parada fiable en el sistema de control.
- Dependencia del hardware: la política está diseñada específicamente para el microduck (61 observaciones, 14 acciones, 50 Hz) y no es transferible a otras plataformas sin reentrenamiento.
- Especificidad del commit: el entrenamiento está asociado a la rama `sprint/race` y al commit `0141bf4a8` del repositorio `pollen-robotics/microduck_rl`, pero no se documenta la reproducibilidad ni los hiperparámetros usados.
- Riesgo de comportamiento no seguro: al ser una política de RL sin evaluación publicada, no se garantiza la estabilidad en condiciones fuera de distribución (terrenos irregulares, cargas, batería baja).
- Idiomas: no aplica; no es un modelo de lenguaje y no procesa ni genera texto.

## Enlaces

- Hugging Face: https://huggingface.co/qualiadev/microduck-sprint-q3
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `sprint/race`, commit `0141bf4a8`); no se proporciona URL directa en la información disponible.

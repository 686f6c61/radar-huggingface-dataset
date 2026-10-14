# DenRakEiw/microduck-c-3pduck_1020

## Resumen

c-3pduck_1020 es una política de aprendizaje por refuerzo (RL) para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario DenRakEiw en HuggingFace. No se trata de un modelo de lenguaje, sino de un controlador de locomoción: una política "perpetua" que genera una marcha continua para el slot `walk` del robot, con una observación de 61 dimensiones y 14 acciones a una frecuencia de control de 50 Hz.

El modelo se ha entrenado específicamente para una tarea de ascenso de colina de 1,5 metros ("1.5 m Hill Climb") en modo carrera, y ha sido ajustado mediante estrategias evolutivas (evolution strategies) sobre el scorer de colinas del entorno Arena. Esto lo sitúa en el ámbito de la robótica de locomoción basada en simulación y transferencia a hardware real, un campo donde los controladores ONNX compactos permiten desplegar políticas entrenadas en simulación directamente sobre el robot físico.

La relevancia de esta ficha radica en que ejemplifica el flujo de trabajo de microduck: políticas RL empaquetadas como `policy.onnx` con el normalizador de observaciones integrado, distribuidas mediante el daemon `robotctl` y el manifiesto de política del proyecto. El repositorio es de tamano 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal, arquitectura concreta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (controlador robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Slot de marcha | `walk` |
| Manifiesto | `manifest.json`, esquema 2 del microduck policy manifest |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una política de RL entrenada para el robot microduck, con 61 dimensiones de observación y 14 acciones ejecutadas a 50 Hz. El modelo es "perpetuo": está disenado para ejecutar la marcha de forma continua hasta recibir una orden de parada, en lugar de completar un episodio finito. La arquitectura concreta de la red (número de capas, tipo de red, funciones de activación) no se especifica en la model card.

El entrenamiento se realizó en dos fases según la descripción: una política base de RL para el modo carrera, ajustada posteriormente mediante estrategias evolutivas (evolution strategies) sobre el scorer de colinas del entorno Arena, con el objetivo específico de ascender una colina de 1,5 metros. El repositorio de entrenamiento es `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`. No se documentan en la información proporcionada el número de pasos de entrenamiento, la composición del dataset ni si se emplearon técnicas adicionales como RLHF o DPO (no aplicables en este dominio).

Un detalle técnico destacable es que el normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que la política consume observaciones en bruto sin preprocesado externo por parte del usuario.

## Capacidades

- Locomoción continua: genera una marcha perpetua para el slot `walk` del microduck sin necesidad de reestimulación episódica.
- Ascenso de colinas: política optimizada específicamente para superar una pendiente de 1,5 metros.
- Modo carrera: la política está etiquetada como `microduck-slot:walk` y descrita como race-mode.
- Inferencia autocontenida: el normalizador de observaciones va embebido en el ONNX, lo que simplifica el despliegue.
- Integración con el daemon: se carga mediante `robotctl policy load walk DenRakEiw/microduck-c-3pduck_1020`, siguiendo el manifiesto de política del proyecto.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni visión, por no ser aplicables a este tipo de modelo.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política con `robotctl` para exhibir una marcha continua en ferias, talleres o vídeos de producto, aprovechando su naturaleza perpetua.
- Pruebas de ascenso en terreno inclinado: validar en el robot físico la capacidad de superar una pendiente de 1,5 m entrenada en simulación, útil para benchmarking de transferencia sim-to-real.
- Investigación en estrategias evolutivas: usar esta política como referencia o punto de partida para experimentos que ajusten controladores RL mediante ES sobre el scorer de Arena.
- Base para fine-tuning de marchas: emplear el repositorio `microduck_rl` (rama `denrakeiw`) para derivar variantes de la política orientadas a otros terrenos o velocidades.
- Comparación de controladores en el slot `walk`: intercambiar esta política con otras del mismo slot para evaluar diferencias de comportamiento en el mismo hardware.
- Educación en robótica: ejemplo didáctico de un pipeline completo de RL (entrenamiento en simulación, empaquetado ONNX, despliegue en robot) para cursos y talleres.
- Integración en stacks de control personalizados: al ser un ONNX autocontenido, puede insertarse en pipelines propios que alimenten las 61 observaciones y consuman las 14 acciones a 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (por ejemplo, tiempo de ascenso, distancia recorrida, tasa de éxito) ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- El modelo es una política ONNX compacta (repositorio de 0,0 GB), por lo que la inferencia es ligera y no requiere GPU dedicada.
- Al ejecutarse a 50 Hz con 61 entradas y 14 salidas, es viable en CPU de un ordenador de placa reducida o en el propio computador del robot.
- No se especifican requisitos mínimos de VRAM ni GPU recomendadas en la información disponible.
- Opciones de despliegue: el daemon de microduck mediante `robotctl policy load walk ...`, o cualquier runtime compatible con ONNX (ONNX Runtime, etc.).
- No se documentan cifras de latencia ni throughput más allá de la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| c-3pduck_1020 | Política RL para microduck (slot walk) | 61-D / 14 acciones a 50 Hz | ONNX | no disponible | HuggingFace |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | repositorio microduck |

No se dispone de información sobre políticas comparables de terceros para el mismo robot en la información proporcionada.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial queda sin cobertura legal clara y debe consultarse con el autor antes de cualquier despliegue productivo.
- La política está entrenada para una tarea muy concreta (ascenso de colina de 1,5 m en modo carrera); su comportamiento en otros terrenos, pendientes o condiciones no está garantizado.
- No se documentan sesgos ni tasas de fallo, pero al tratarse de una política RL transferida desde simulación existe riesgo de brecha sim-to-real.
- No se detallan los datos de entrenamiento, el número de pasos ni las condiciones del simulador, lo que dificulta reproducir o auditar el resultado.
- El modelo es perpetuo y no dispone de lógica de parada propia; dependerá del daemon o del operador para detener la marcha.
- No hay métricas publicadas de rendimiento, por lo que la evaluación cualitativa del autor no puede verificarse de forma independiente.
- El repositorio registra 0 descargas y 0 likes, y no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_1020
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de política: `docs/policy-manifest.md` en el repositorio del daemon

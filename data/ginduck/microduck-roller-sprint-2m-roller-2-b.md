# GinDuck/microduck-roller-sprint-2m-roller-2-b

## Resumen

`microduck-roller-sprint-2m-roller-2-b` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, ejecutable sobre el robot real a través del daemon `robotctl`. El autor, GinDuck, la publica como una "gait" (marcha) cargable en una ranura de política del robot.

La política corresponde a la segunda iteración de una receta de entrenamiento propia ("roller recipe"), reentrenada desde cero y orientada a velocidad en lugar de patinaje. Según la model card, completa cada carrera en aproximadamente 1,5 segundos. Es una política de tipo perpetuo: se ejecuta de forma continua hasta que se le indique lo contrario, sin condición de terminación interna.

El interés de esta ficha es limitado fuera del ecosistema microduck: el repositorio tiene 0 descargas y 0 likes, el tamaño es de 0,0 GB (lo que sugiere pesos muy pequeños, coherentes con una política de RL de una red neuronal compacta), y no se dispone de licencia, idiomas ni benchmarks publicados. Su relevancia radica en ser un ejemplo reproducible de entrenamiento de locomoción con `mjlab` sobre hardware abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal; topología no especificada) exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX; sin cuantizaciones documentadas) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | `policy.onnx` y `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, unidades ocultas ni tipo de activaciones). Lo que sí se especifica es la interfaz: 61 dimensiones de observación de entrada y 14 acciones de salida, a una frecuencia de control de 50 Hz, sobre un robot con ruedas ("on rollers"). El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que la política consume observaciones en bruto sin preprocesado externo.

El entrenamiento se realizó con `mjlab-microduck 0.1.0` (commit `1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. La tarea se identifica como `Mjlab-RollerSprint2m-MicroDuck`, con checkpoint 5999, semilla 1, 2048 entornos paralelos y un máximo de 6000 iteraciones del agente, registrando en TensorBoard bajo el nombre de ejecución `roller-2`. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir la receta con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción continua ("perpetua") del microduck sobre ruedas: la política se ejecuta hasta recibir una orden de parada.
- Control a 50 Hz con 61 observaciones de entrada y 14 acciones de salida.
- Carrera de velocidad: según la model card, completa cada carrera en aproximadamente 1,5 segundos.
- Integración directa con el daemon del robot mediante `robotctl policy load`.
- Normalización de observaciones integrada en el ONNX (entrada de observaciones en bruto).
- Carga como "gait" en una ranura de política del sistema microduck.
- No soporta tool calling, agentes, multilingüismo ni modalidades de texto, visión o audio: es una política de control motriz.

## Casos de uso

- Locomoción de velocidad en el microduck: cargar la política en una ranura con `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-b` para que el robot se desplace sobre ruedas a máxima velocidad en recorridos cortos.
- Demostraciones de carreras entre robots: al completar cada carrera en ~1,5 s, es adecuada para pruebas cronometradas y comparativas de marchas dentro del ecosistema microduck.
- Investigación en aprendizaje por refuerzo: sirve como referencia reproducible de una receta de entrenamiento con `mjlab`, 2048 entornos y 6000 iteraciones, útil para estudiar variaciones de hiperparámetros.
- Evaluación de robustez de políticas: al ser una política perpetua sin condición de terminación, permite analizar el comportamiento sostenido del controlador en el tiempo.
- Integración en pipelines de simulación a real: el ONNX con normalizador embebido simplifica el despliegue desde simulación hasta el robot físico.
- Docencia en robótica de código abierto: ejemplo concreto de entrenamiento, exportación y despliegue de una política de RL sobre hardware abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es cualitativo y proviene de la model card: cada carrera se completa en aproximadamente 1,5 segundos. No se proporcionan métricas de recompensa, tasa de éxito, distancia recorrida ni comparaciones con otras políticas.

## Requisitos de hardware

- El tamaño del repositorio es de 0,0 GB, lo que indica pesos de muy pequeño tamaño; la inferencia de una política de este tipo es viable en CPU.
- VRAM estimada para inferencia: no disponible; por el tamaño del artefacto, previsiblemente inferior a 1 GB.
- GPU recomendadas: no disponibles; no se requiere GPU para la ejecución en el robot.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no está documentado.
- Opciones de despliegue: runtime ONNX y el daemon `robotctl` del ecosistema microduck; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el control opera a 50 Hz, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del ecosistema microduck ni datos comparables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución.
- Sin benchmarks publicados: el rendimiento solo se describe de forma cualitativa en la model card.
- Entrenamiento no bit-reproducible: la misma receta y semilla producen pesos distintos en máquinas diferentes.
- Específica del hardware: solo funciona en el microduck sobre ruedas con la interfaz de 61 observaciones y 14 acciones a 50 Hz.
- Política perpetua sin condición de terminación interna: requiere una orden externa para detenerse.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Sin información sobre sesgos, alucinación o cobertura idiomática: no aplican a un modelo de control motriz, pero tampoco se documenta el comportamiento fuera de las condiciones de entrenamiento.
- El autor no documenta límites de generalización a terrenos, cargas o variaciones del robot distintos de los usados en entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-b
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y recetas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon

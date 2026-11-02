# GinDuck/microduck-roller-sprint-2m-roller-1

## Resumen

`microduck-roller-sprint-2m-roller-1` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario GinDuck y resuelve la tarea concreta de desplazamiento sobre ruedas (rollers): el robot rueda en línea recta y completa todas las ejecuciones. Se trata de una política perpetua, es decir, se ejecuta de forma continua hasta recibir una orden de parada, y se carga en una ranura de política del daemon del robot.

El artefacto principal es un fichero `policy.onnx` con el normalizador de observaciones integrado, acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. El modelo opera a 50 Hz con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones. Es relevante porque demuestra el flujo completo de entrenamiento y despliegue de políticas de RL en robótica de bajo coste usando el stack mjlab y la librería microduck, con instrucciones de reproducción verificables.

La información publicada es muy escasa: el repositorio tiene 0 GB (probablemente solo contiene el ONNX y el manifiesto), no declara licencia ni idiomas, y no incluye resultados de benchmarks ni datos de arquitectura de red más allá del formato de exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La política se entrena con el framework mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `dc73b9237`). El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, semilla 1 y registro en TensorBoard, partiendo del checkpoint 2250. La fecha de inicio registrada es 2026-11-01T08:28:42Z.

El modelo se distribuye como una política ONNX con el normalizador de observaciones embebido, de modo que el robot puede alimentar observaciones en bruto directamente. La interfaz es de 61 dimensiones de observación y 14 de acción a 50 Hz, y la política es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con la misma semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck sobre ruedas (rollers).
- Desplazamiento en línea recta con finalización fiable de todas las ejecuciones, según el autor.
- Ejecución perpetua: la política corre de forma continua hasta recibir una orden de parada.
- Integración con el daemon del robot mediante carga en una ranura de política (`robotctl policy load`).
- Observaciones en bruto: el normalizador está integrado en el ONNX, sin preprocesado externo.
- Interfaz de tiempo real a 50 Hz con 61 observaciones y 14 acciones.
- No soporta tool calling, agentes, multilingüismo ni modalidades de texto, visión o audio: es una política de control motor.

## Casos de uso

- Locomoción básica sobre ruedas en el microduck: cargar la política en una ranura del daemon y dejar que el robot ruede en línea recta de forma continua, útil como comportamiento base o de referencia.
- Validación del pipeline de entrenamiento: sirve como ejemplo reproducible del flujo mjlab + microduck-challenges para verificar que el entorno de simulación y el despliegue funcionan de extremo a extremo.
- Pruebas de integración del daemon: al ser una política perpetua y estable, permite comprobar la carga de políticas, el manifiesto esquema 2 y la ejecución a 50 Hz sin depender de comportamientos complejos.
- Base para experimentos de comparación: al estar documentados task_id, commit, checkpoint y semilla, se puede usar como referencia al entrenar variantes (por ejemplo, con otras semillas o hiperparámetros) y comparar el comportamiento resultante.
- Demostraciones educativas de RL en robótica de bajo coste: el modelo ilustra cómo una política entrenada en simulación con 4096 entornos paralelos se exporta a ONNX y se ejecuta en hardware real.
- Punto de partida para transferencia o ajuste: una política que rueda en línea recta puede servir como inicialización o comparación para tareas de locomoción más complejas sobre el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica cualitativamente que la política "rueda en línea recta y completa todas las ejecuciones", sin métricas numéricas de recompensa, tasa de éxito ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponible. Al ejecutarse en el propio robot microduck, la inferencia se realiza en el hardware del robot, no en GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el daemon de microduck mediante `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-1`; el artefacto es ONNX, por lo que en principio puede ejecutarse con cualquier runtime ONNX compatible, aunque no se documenta.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms), pero no se publican mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables del mismo autor o del ecosistema microduck con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Tarea muy específica: solo se ha entrenado para rodar en línea recta sobre rollers; no se documenta comportamiento ante obstáculos, terrenos irregulares o cambios de dirección.
- Sin licencia declarada: no se especifican condiciones de uso comercial, modificación ni redistribución; hay que contactar con el autor antes de usarla en producción.
- Sin datos de arquitectura ni de parámetros: imposible evaluar coste computacional, robustez o capacidad de generalización a partir de la información publicada.
- Entrenamiento no bit-reproducible: el autor advierte que repetir el entrenamiento produce pesos distintos, lo que complica la auditoría exacta del modelo.
- Sin benchmarks ni métricas cuantitativas: la afirmación de que "completa todas las ejecuciones" no está respaldada por datos públicos.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: no aplica al ser una política de control motor, pero tampoco se documentan modos de fallo en el robot.
- Repositorio sin descargas ni interacción: no hay evidencia de uso por terceros ni de validación externa.
- Dependencia del ecosistema microduck: su uso práctico requiere el daemon y el hardware correspondientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-1
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges

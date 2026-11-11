# SmonSE/microduck-sprint-hill_climb_first

## Resumen

`sprint-hill_climb_first` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es un controlador neuronal que traduce observaciones de 61 dimensiones (estado de sensores y articulaciones) en 14 acciones de control a 50 Hz, con el objetivo de generar una marcha perpetua que se ejecuta de forma continua hasta que se le indique lo contrario. Lo publica el usuario SmonSE como artefacto derivado del reto de entrenamiento `Mjlab-Sprint2m-MicroDuck`.

La relevancia de esta ficha es acotada y muy específica: se trata de un checkpoint de investigación (iteración 249, semilla 1) exportado a ONNX y empaquetado con el manifiesto de políticas del demonio microduck, pensado para cargarse directamente en un robot real mediante el comando `robotctl policy load`. No hay información sobre idiomas, licencia ni benchmarks de tareas cognitivas, porque el modelo no aborda ese tipo de tareas.

El repositorio ocupa 0,0 GB (pesos ONNX de una red pequeña de control), no registra descargas ni interacciones en el momento de la consulta y se creó el 11 de noviembre de 2026. Es, por tanto, un artefacto de nicho dentro del ecosistema de robótica de bajo coste, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (arquitectura interna no detallada; exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX, sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Parámetros operativos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Comportamiento | Política perpetua (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | Integrado en `policy.onnx` (se alimentan observaciones en bruto) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrenó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre el repositorio `microduck-challenges`, en la rama `main`, commit `5cee942d8`, con la tarea `Mjlab-Sprint2m-MicroDuck`. El entrenamiento usó 4096 entornos paralelos, un máximo de 250 iteraciones, semilla 1, registro en TensorBoard y nombre de ejecución `first`; el checkpoint publicado corresponde a la iteración 249, es decir, prácticamente al final del presupuesto de entrenamiento.

El comando de reproducción completo es `uv run train Mjlab-Sprint2m-MicroDuck --env.scene.num-envs 4096 --agent.max-iterations 250 --agent.seed 1 --agent.logger tensorboard --agent.run-name first`. El autor advierte explícitamente de que el entrenamiento por refuerzo con GPU no es reproducible bit a bit entre máquinas: repetir la ejecución con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos. Además, el checkpoint se exportó desde un checkout con cambios sin confirmar, lo que introduce una fuente adicional de deriva respecto al commit declarado. No se especifican el número de tokens, la composición del dataset (en RL no aplica) ni si hubo RLHF/DPO (tampoco aplica).

## Capacidades

- Generación de marcha perpetua para el robot microduck: produce 14 acciones de control a 50 Hz de forma continua hasta que se detiene la política.
- Locomoción en escenarios de tipo `sprint` con ascenso de colina (`hill_climb_first`), según la denominación de la tarea de entrenamiento.
- Consumo directo de observaciones en bruto: el normalizador está embebido en el ONNX, lo que simplifica la integración en el demonio del robot.
- Carga en robot real mediante `robotctl policy load <slot> SmonSE/microduck-sprint-hill_climb_first`, con asignación a una ranura de política.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje ni un agente conversacional.
- No dispone de visión, audio ni entrada multimodal declarada; su única entrada es el vector de observación de 61 dimensiones.

## Casos de uso

- Control de locomoción en el robot microduck real: cargar la política en una ranura con `robotctl policy load` y dejar que el robot camine de forma continua en pruebas de campo, aprovechando que la política es perpetua y no requiere reinicio por episodio.
- Evaluación de ascenso de colinas: usar la política como referencia entrenada para la variante `hill_climb_first` y comparar su comportamiento con otras políticas del mismo reto sobre el mismo terreno.
- Reproducción de experimentos de RL en robótica: servir como punto de partida para reentrenar con la misma semilla y configuración (4096 entornos, 250 iteraciones) y estudiar la variabilidad entre ejecuciones, dado que el autor documenta la no reproducibilidad bit a bit.
- Integración en pipelines de simulación a real: al estar exportada a ONNX con el normalizador embebido, puede ejecutarse en el mismo runtime que el demonio del robot sin pasos de preprocesado adicionales.
- Docencia y divulgación en robótica de bajo coste: el modelo y su comando de reproducción permiten ilustrar el ciclo completo de entrenamiento con `mjlab`, exportación a ONNX y despliegue en hardware asequible.
- Base para políticas compuestas: al cargarse en una ranura de política del demonio, puede alternarse con otras políticas (por ejemplo, otras variantes del reto) para cubrir distintos terrenos o tareas de marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de avance, tasa de éxito en ascenso de colinas ni comparaciones cuantitativas con otras políticas. Tampoco se declaran latencias ni throughput medidos en hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la red de control es pequeña, por lo que la inferencia en CPU es plausible, pero no se aportan cifras.
- GPU recomendadas: no disponibles para inferencia; para reentrenar con 4096 entornos paralelos se requiere una GPU de gama alta, aunque el autor no especifica modelo.
- Compatibilidad con GPU de consumo: no confirmada; dado el tamaño reducido del artefacto, es probable que quepa en GPU de consumo, pero no hay dato oficial.
- Opciones de despliegue: runtime ONNX en el demonio microduck mediante `robotctl policy load`; el ONNX es portable a otros ejecutores compatibles, aunque no se documenta ninguno adicional.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es de 50 Hz, lo que fija un presupuesto de 20 ms por paso de inferencia, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del mismo reto ni modelos comparables con parámetros, contexto, rendimiento o licencia declarados. La comparación con alternativas como otras políticas de `microduck-challenges` requeriría datos que no se han publicado en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Reproducibilidad limitada: el propio autor advierte de que el entrenamiento con RL en GPU no es reproducible bit a bit; los pesos publicados no pueden regenerarse exactamente.
- Exportado desde un checkout con cambios sin confirmar, lo que puede introducir diferencias respecto al commit `5cee942d8` declarado.
- Comportamiento perpetuo: la política se ejecuta hasta que se detiene explícitamente; en un robot real esto exige mecanismos externos de parada segura.
- Especialización estrecha: entrenada para la tarea `Mjlab-Sprint2m-MicroDuck` (sprint con ascenso de colina); no se garantiza su comportamiento en otros terrenos, cargas o configuraciones del robot.
- Sin datos de sesgos, alucinación o cobertura idiomática porque no es un modelo generativo de lenguaje; esos riesgos no aplican, pero tampoco hay evaluación de robustez ante perturbaciones.
- Ausencia total de métricas publicadas: no hay evidencia cuantitativa de rendimiento que respalde su uso en producción.
- Cero descargas y cero interacciones en el momento de la consulta: no existe validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmonSE/microduck-sprint-hill_climb_first
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio del reto de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa)

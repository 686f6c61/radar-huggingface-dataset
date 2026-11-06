# betsyxw/microduck-tug-a3

## Resumen

Microduck-tug-a3 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta de locomoción y tracción, denominada internamente `Mjlab-TugOfWar-MicroDuck`, dentro del conjunto de retos de la plataforma microduck-challenges. No es un modelo de lenguaje: se trata de un artefacto de control que mapea observaciones de 61 dimensiones a 14 acciones de actuación a 50 Hz.

El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el robot puede alimentarlo directamente con observaciones en bruto. La política es de tipo "perpetuo", es decir, se ejecuta de forma continua hasta que el operador la detiene, y se carga en una ranura de política del daemon robotctl del robot.

Su relevancia radica en que ejemplifica el flujo completo de entrenamiento y despliegue de políticas de RL en robótica de bajo coste: entrenamiento masivo en simulación (4096 entornos paralelos), exportación a ONNX y carga directa en hardware real mediante una interfaz estandarizada de manifiesto de política. El repositorio es de tamaño prácticamente nulo (0,0 GB) y no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal (número de capas, tipo de capas, función de activación ni número de parámetros). Lo que sí se documenta es la interfaz: una política que consume observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de control de 50 Hz, con el normalizador de observaciones embebido en el grafo ONNX. El modelo se ejecuta de forma continua (política "perpetua") hasta recibir una orden de parada.

El entrenamiento se realizó con el framework mjlab (versión 0.1.0, commit `1efd853be`) sobre la tarea `Mjlab-TugOfWar-MicroDuck`, del repositorio `pollen-robotics/microduck-challenges`, rama `tug-a0`, commit `0b9f162c2`. Se usaron 4096 entornos paralelos, un máximo de 300 iteraciones del agente, guardado cada 50 iteraciones, reanudando desde el run `2026-11-01_05-55-22_tug-a0` y el checkpoint `model_500.pt`, con semilla 3. El checkpoint exportado corresponde a la iteración 600. El autor advierte explícitamente que el entrenamiento por RL en GPU no es reproducible bit a bit entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica. Además, el modelo se exportó desde un checkout con cambios sin confirmar.

## Capacidades

- Control de locomoción y tracción del robot microduck en la tarea de tug-of-war (tira y afloja) definida en el entorno de simulación.
- Política continua y perpetua: se ejecuta indefinidamente hasta que se le indique lo contrario.
- Interfaz de observación de 61 dimensiones y 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en bruto sin preprocesado externo.
- Carga y despliegue mediante la herramienta `robotctl` del daemon del robot, en una ranura de política.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, capacidades de agente ni soporte multilingüe.

## Casos de uso

- Despliegue directo en el robot microduck: cargar la política con `sudo robotctl policy load <slot> betsyxw/microduck-tug-a3` permite al robot ejecutar la marcha entrenada sin pasos intermedios de conversión, gracias al ONNX autocontenido con normalizador.
- Investigación en aprendizaje por refuerzo aplicado a robótica de bajo coste: sirve como referencia reproducible (código, `uv.lock`, comando y semilla documentados) para estudiar el efecto de hiperparámetros como el número de entornos o las iteraciones sobre la calidad de la política final.
- Benchmark de tareas de tracción y locomoción: al formar parte de `microduck-challenges`, la política puede emplearse como línea base contra la que comparar nuevas políticas entrenadas en la misma tarea `Mjlab-TugOfWar-MicroDuck`.
- Docencia y prototipado rápido: el flujo completo (entrenar en simulación, exportar a ONNX, cargar en hardware) es un ejemplo didáctico de pipeline de RL a robot real con una única orden de despliegue.
- Pruebas de integración del daemon y del manifiesto de políticas: el `manifest.json` conforme al esquema 2 permite validar el cargador de políticas, las ranuras y el ciclo de vida de políticas perpetuas en el software del robot.
- Evaluación de robustez sim-to-real: ejecutar la política en hardware real permite medir la brecha entre simulación y realidad en una tarea física concreta, aunque el autor no publica métricas de dicha brecha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la arquitectura no está documentada, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible para inferencia. Para reentrenamiento, el comando documentado emplea 4096 entornos paralelos, lo que exige una GPU de gama alta (el autor no especifica el modelo utilizado).
- Cabe en GPU de consumo: no disponible; dado el tamaño aparentemente reducido del artefacto ONNX, es plausible, pero no está confirmado.
- Opciones de despliegue: el destino previsto es el robot microduck mediante `robotctl policy load`; el artefacto ONNX podría ejecutarse con ONNX Runtime en otros entornos, aunque no está documentado.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables de la misma tarea, tamaño o familia dentro de microduck-challenges, ni se dispone de datos de rendimiento para establecer una comparación.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea `Mjlab-TugOfWar-MicroDuck` del robot microduck; no es reutilizable para otras tareas, morfologías o robots.
- No es un modelo de lenguaje: carece de cualquier capacidad de texto, razonamiento, código o visión; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda en un estado jurídicamente indeterminado y requiere contacto con el autor.
- Reproducibilidad limitada: el propio autor advierte que el RL en GPU no es reproducible bit a bit; los pesos no pueden regenerarse de forma idéntica.
- Exportación desde un checkout con cambios sin confirmar: el artefacto no corresponde exactamente al commit documentado, lo que dificulta la auditoría del proceso de entrenamiento.
- Sin métricas de rendimiento ni de sim-to-real: no hay evidencia publicada sobre la tasa de éxito de la tarea ni sobre su comportamiento en hardware real.
- Sin documentación de sesgos ni de robustez ante perturbaciones: no se describen condiciones de fallo, límites de seguridad ni comportamiento ante observaciones fuera de distribución.
- Artefacto sin tracción comunitaria: cero descargas y cero valoraciones en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/betsyxw/microduck-tug-a3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)

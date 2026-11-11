# atomicvox/microduck-hill-climb-1m5-run-1110-2238

## Resumen

`atomicvox/microduck-hill-climb-1m5-run-1110-2238` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones de actuación a 50 Hz, exportado en formato ONNX y empaquetado con el manifiesto de políticas del daemon `robotctl`. Su propósito es ejecutar una marcha (gait) perpetua que permite al robot subir una pendiente de 1,5 metros.

El modelo se ha entrenado con el simulador `mjlab` (basado en MuJoCo) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, con 2.400 entornos paralelos, 3.000 iteraciones máximas y semilla 1, partiendo del checkpoint 2.250. El repositorio es de tamaño prácticamente nulo (0,0 GB según Hugging Face), lo que sugiere que los pesos están cuantizados o son muy compactos, coherente con una política de control de baja dimensionalidad.

La relevancia es acotada pero clara: se trata de un artefacto reproducible de robótica open source, con instrucciones exactas de entrenamiento y despliegue, útil para quienes trabajan con el microduck o con pipelines de RL para locomoción. No hay información publicada sobre benchmarks, licencia ni idiomas, y el modelo no tiene relación con tareas de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (entrenada con RL en mjlab/MuJoCo); arquitectura interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones) |
| Tipos de cuantización | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el simulador `mjlab` (versión 0.1.0, commit `1efd853be`), sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`. El entrenamiento usa 2.400 entornos paralelos, un máximo de 3.000 iteraciones del agente y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `run-1110-2238`. El checkpoint final es el 2.250. La arquitectura interna de la red (número de capas, anchura, tipo de política) no se detalla en la model card.

El modelo se distribuye como `policy.onnx` con el normalizador de observaciones integrado en el propio grafo: el consumidor debe alimentar observaciones en bruto. El manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas del daemon microduck. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica. No se especifican tokens de entrenamiento (no aplica), composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Control de locomoción del robot microduck: mapea 61 dimensiones de observación a 14 acciones a 50 Hz.
- Ejecución de una marcha perpetua ("perpetual policy"): corre hasta que se le indique lo contrario.
- Tarea específica de ascenso de pendiente de 1,5 metros (`HillClimb1m5`).
- Normalización de observaciones integrada en el ONNX, lo que simplifica la integración en el robot.
- Carga en una ranura de política del daemon mediante `robotctl policy load`.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, visión o audio: es un controlador, no un modelo generativo.

## Casos de uso

- **Locomoción autónoma del microduck en terreno inclinado**: cargar la política en una ranura con `robotctl` y dejar que el robot suba pendientes de hasta 1,5 m de desnivel; la política está entrenada específicamente para esa tarea.
- **Demostraciones de RL en robótica educativa**: usar el modelo como referencia funcional en talleres o cursos sobre entrenamiento con mjlab y MuJoCo, ya que el comando de reproducción está documentado al detalle.
- **Punto de partida para fine-tuning o curriculum learning**: reutilizar el checkpoint 2.250 como inicialización para tareas derivadas (terrenos más complejos, velocidades distintas) dentro del repositorio `microduck-challenges`.
- **Validación de pipelines de despliegue ONNX**: probar la cadena `policy.onnx` + `manifest.json` en el daemon `robotctl` para verificar la integración de políticas en el robot real.
- **Investigación en sim-to-real**: comparar el comportamiento de la política entrenada en simulación con su ejecución en hardware físico del microduck, midiendo la brecha de rendimiento.
- **Generación de datos de referencia para evaluación**: usar la marcha perpetua como baseline contra la que comparar políticas nuevas en la misma tarea de ascenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza de la política (61 observaciones, 14 acciones, ONNX) se espera un consumo muy bajo, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. La inferencia a 50 Hz en un controlador de baja dimensionalidad es viable en CPU en la mayoría de casos, pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No disponible con datos; por el tamaño del artefacto (repo de 0,0 GB) es altamente probable, pero no se afirma sin dato.
- Opciones de despliegue: daemon `robotctl` del microduck (carga de política en ranura) y runtime ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; la política está diseñada para operar a 50 Hz según la model card.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de locomoción comparables para el microduck ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Tarea única: la política está entrenada exclusivamente para ascenso de pendiente de 1,5 m; no se garantiza su comportamiento en otros terrenos.
- No reproducible bit a bit: el autor advierte que reentrenar con la misma semilla produce pesos distintos.
- Licencia no especificada: no hay información sobre uso comercial; conviene contactar con el autor antes de usarla en producción.
- Sin datos de benchmarks ni métricas de éxito: no se puede evaluar su robustez frente a perturbaciones, cargas o fallos de sensores.
- Sin información sobre sesgos ni alucinación (no aplica a un modelo generativo), pero sí existe riesgo de comportamiento inseguro en el robot real si la política se ejecuta fuera de su dominio de entrenamiento.
- Dependencia del ecosistema microduck y del esquema 2 del manifiesto: cambios en el daemon o en el formato pueden romper la compatibilidad.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/atomicvox/microduck-hill-climb-1m5-run-1110-2238
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (commit `7b46934da`, rama `main`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)

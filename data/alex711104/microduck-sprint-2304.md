# alex711104/microduck-sprint-2304

## Resumen

Microduck sprint-2304 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto MicroDuck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción exportada a ONNX que se carga directamente en el daemon del robot para ejecutar una marcha (gait) de forma perpetua. El autor es el usuario de Hugging Face alex711104 y el modelo se publicó el 23 de noviembre de 2026.

La política consume observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de control de 50 Hz, lo que encaja con el bucle de control en tiempo real del robot. El entrenamiento se realizó con el framework mjlab (basado en MuJoCo) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos, 3000 iteraciones máximas y semilla 1, partiendo del checkpoint 2000. El resultado es una política de sprint de 2 metros optimizada para velocidad.

Su relevancia radica en que ejemplifica el flujo de trabajo moderno de robótica open source: entrenamiento masivo en simulación con GPU, exportación a ONNX con la normalización de observaciones embebida y despliegue directo en hardware real mediante una CLI (`robotctl`). El repositorio no contiene pesos en formato safetensors ni GGUF, sino un `policy.onnx` y un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (red neuronal de control; topología interna no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva; observación de 61 dimensiones) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales de la interfaz:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento | política perpetua (se ejecuta hasta recibir orden de parada) |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint | 2000 |
| Semilla | 1 |
| Framework base | mjlab-microduck 0.1.0 (commit 1efd853be) |
| Repositorio de entrenamiento | pollen-robotics/microduck-challenges (commit 44d645a86) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchos, activaciones ni si emplea memoria recurrente). Lo que sí se documenta es la interfaz: una política que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, con la normalización de observaciones integrada dentro del propio grafo ONNX, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. Esto simplifica el despliegue y reduce el riesgo de desajustes entre entrenamiento e inferencia.

El entrenamiento se llevó a cabo con mjlab, un stack de RL sobre MuJoCo, ejecutando la tarea `Mjlab-Sprint2m-MicroDuck` con 4096 entornos simulados en paralelo, hasta 3000 iteraciones y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `overspeed-20261123`. El checkpoint exportado es el 2000. El autor advierte que el proceso no es bit-reproducible entre máquinas: repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. El modelo se exportó desde un checkout con cambios sin commitear, lo que introduce una caveat de trazabilidad.

## Capacidades

- Locomoción cuadrúpeda: ejecuta una marcha de sprint (tarea de 2 metros) de forma perpetua hasta recibir una orden de parada.
- Control reactivo a 50 Hz: adecuado para el bucle de control en tiempo real del MicroDuck.
- Observaciones en bruto: la normalización está embebida en el ONNX, por lo que no requiere pipeline de preprocesado en el robot.
- Integración con el daemon: se carga mediante `robotctl policy load <slot> alex711104/microduck-sprint-2304` en una ranura de política.
- Compatibilidad con el manifiesto de políticas microduck (esquema 2), lo que facilita el intercambio de políticas en el mismo robot.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Demostración de locomoción rápida en MicroDuck: cargar la política en una ranura y ejecutar un sprint de 2 metros para exhibir la velocidad máxima alcanzada por el robot en eventos o vídeos de divulgación.
- Investigación en RL aplicado a robótica: servir como política de referencia entrenada con mjlab para comparar curvas de recompensa, estabilidad de marcha y transferencia sim-a-real frente a políticas propias.
- Reproducción de experimentos: el comando de entrenamiento documentado permite regenerar una política comparable y estudiar la varianza entre ejecuciones con la misma semilla.
- Base para fine-tuning o destilación: partir de esta política como inicialización en tareas de locomoción relacionadas (terrenos distintos, velocidades intermedias) dentro del repositorio microduck-challenges.
- Pruebas de integración del daemon: validar el cargador de políticas, el esquema 2 del manifiesto y la CLI `robotctl` en pipelines de CI del software del robot.
- Docencia en robótica con hardware de bajo coste: usar el flujo completo (entrenar en simulación, exportar a ONNX, desplegar en hardware) como ejercicio práctico con un cuadrúpedo de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de dimensiones reducidas (61 entradas, 14 salidas) exportada a ONNX, la inferencia cabe holgadamente en CPU del propio robot.
- GPU recomendadas para entrenamiento: no especificadas en la información disponible; el entrenamiento usa 4096 entornos paralelos, lo que en la práctica requiere GPU de datacenter (A100, H100 o similares), aunque este dato no se confirma en la model card.
- Cabe en GPU de consumo: la inferencia sí; el entrenamiento con 4096 entornos paralelos es improbable en GPU de consumo, aunque no se documenta.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso de política).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas para MicroDuck ni métricas que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ámbito estrictamente restringido: es una política de locomoción para MicroDuck; no sirve para tareas de lenguaje, visión ni propósito general.
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, por lo que el uso comercial queda sin marco legal claro hasta confirmación del autor.
- Reproducibilidad limitada: el propio autor advierte que el RL en GPU no es bit-reproducible; los pesos no pueden regenerarse de forma idéntica.
- Trazabilidad incompleta: el modelo se exportó desde un checkout con cambios sin commitear, lo que puede introducir diferencias respecto al commit documentado.
- Sin datos de robustez: no se publican métricas de estabilidad, tasa de caídas, comportamiento ante perturbaciones ni transferencia sim-a-real.
- Sin información sobre sesgos ni alucinación: no aplican en el sentido habitual, pero tampoco se documenta el comportamiento fuera de distribución de las observaciones.
- Metadatos incompletos: sin idiomas, sin licencia, sin tamaño de parámetros y con repositorio de 0.0 GB, lo que sugiere que el contenido puede no estar completamente subido o que el tamaño es inferior a la resolución de medida.
- Fecha de creación futura (2026-11-23): conviene verificar la integridad y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alex711104/microduck-sprint-2304
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciada en la model card; URL directa no disponible)

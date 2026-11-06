# SccHy/microduck-hill-climb-v1

## Resumen

microduck-hill-climb-v1 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo, publicado por el usuario SccHy, resuelve una tarea concreta de locomoción: la subida de pendientes de hasta 1,5 metros de desnivel (identificada en el entrenamiento como `Mjlab-HillClimb1m5-MicroDuck`). No se trata de un modelo de lenguaje, sino de una política de control continuo que mapea observaciones del robot a acciones de sus articulaciones.

La política opera a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones de control. Se distribuye como un fichero ONNX con el normalizador de observaciones ya integrado, de modo que el robot puede alimentarse directamente con observaciones en bruto. El modelo se carga en el daemon del robot mediante el comando `robotctl policy load` y está pensado para ejecutarse de forma perpetua (sin condición de terminación) como una marcha más del repertorio del robot.

Su relevancia es acotada pero específica: demuestra el flujo de trabajo de entrenamiento con mjlab (entorno de RL basado en MuJoCo) aplicado a un robot de bajo coste, y proporciona una política lista para desplegar en hardware real mediante un manifiesto de política versionado. El repositorio no incluye pesos en formato safetensors ni información sobre licencia o idiomas, y en el momento de la consulta no registra descargas ni interacciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (sin arquitectura de red especificada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más manifiesto `manifest.json` (schema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal (número de capas, tipo de capas, función de activación ni tamaño). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrenó con mjlab, un entorno de aprendizaje por refuerzo construido sobre MuJoCo, bajo la tarea `Mjlab-HillClimb1m5-MicroDuck`. El entrenamiento se realizó sobre la rama `master` del repositorio, en el commit `6956d7675`, partiendo de la base `mjlab-microduck 0.1.0`, con semilla `1` y checkpoint `1250`. La fecha de inicio del entrenamiento registrada es el 4 de noviembre de 2026.

El modelo se distribuye con el normalizador de observaciones embebido en el propio grafo ONNX, una decisión de empaquetado que simplifica el despliegue: el consumidor no necesita replicar la normalización por separado, basta con alimentar observaciones en bruto. La política es de tipo perpetuo, es decir, no incluye una condición de terminación aprendida y se ejecuta de forma continua hasta que el operador la descarga o la sustituye. No se especifican en la información proporcionada detalles sobre el algoritmo de RL empleado (PPO, SAC, etc.), el número de pasos de entrenamiento, la composición del dataset ni el uso de técnicas como domain randomization.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha para el robot microduck que le permite ascender pendientes de hasta 1,5 metros de desnivel en el entorno de entrenamiento.
- Control continuo a 50 Hz: mapea observaciones de 61 dimensiones a 14 acciones articulares.
- Ejecución perpetua: la política no termina por sí misma; se mantiene activa hasta que se descarga o se reemplaza.
- Normalización integrada: el fichero ONNX incluye el normalizador de observaciones, por lo que acepta observaciones en bruto.
- Integración con el daemon del robot: se carga en una ranura de política mediante `robotctl policy load` y se describe con un manifiesto conforme al schema 2.
- No se documentan capacidades de tool calling, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de robots de bajo coste: usar la política como línea base reproducible para comparar nuevas políticas de ascenso de pendientes, dado que se conocen la tarea, la semilla y el checkpoint de entrenamiento.
- Demostración educativa de RL aplicado a robótica: desplegar la política en un microduck físico para ilustrar el ciclo completo de entrenamiento en simulación (mjlab/MuJoCo) y transferencia a hardware.
- Pruebas de robustez en terreno inclinado: evaluar el comportamiento de la marcha en rampas reales y comparar con el rendimiento en simulación para estudiar la brecha sim-to-real.
- Desarrollo de repertorios de marchas: integrar esta política como una ranura más del repertorio del robot y conmutarla con otras políticas según el terreno detectado.
- Validación de infraestructura de despliegue: emplear el manifiesto schema 2 y el flujo `robotctl policy load` como caso de prueba para el daemon de políticas del robot.
- Benchmark interno de políticas: servir como referencia de rendimiento para políticas propias entrenadas con la misma tarea `Mjlab-HillClimb1m5-MicroDuck` y la misma base `mjlab-microduck 0.1.0`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un fichero ONNX de muy pocos parámetros, pero no se confirma la cifra.
- GPU recomendadas: no disponible. Al ser una política de control de baja dimensión (61 entradas, 14 salidas) y ejecutarse a 50 Hz, es probable que la inferencia en CPU sea suficiente, pero este extremo no se documenta.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime como formato de ejecución; el despliegue en el robot se realiza mediante el daemon de microduck con el comando `robotctl policy load <slot> SccHy/microduck-hill-climb-v1`.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplica directamente al no ser un modelo generativo de texto, pero sí existe riesgo de que la política falle fuera de la distribución de entrenamiento (terrenos distintos a la pendiente de 1,5 m, cargas, superficies deslizantes).
- Limitaciones de contexto o idioma: no aplica; la política está acotada a la tarea `Mjlab-HillClimb1m5-MicroDuck` y a la morfología del microduck.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial sin consultar al autor.
- Caveats para producción: el repositorio no registra descargas ni interacciones y fue creado y actualizado en la misma fecha, lo que sugiere un artefacto reciente y sin validación comunitaria. No se documentan pruebas de transferencia sim-to-real ni métricas de éxito en hardware físico. La política es perpetua, sin condición de parada aprendida, lo que exige supervisión externa del robot. No se especifican la arquitectura de red ni el algoritmo de RL, lo que dificulta la reproducibilidad más allá de los metadatos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-hill-climb-v1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no se proporciona URL directa en la información disponible.

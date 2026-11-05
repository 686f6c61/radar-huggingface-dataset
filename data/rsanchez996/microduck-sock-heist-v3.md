# RSanchez996/microduck-sock-heist-v3

## Resumen

microduck-sock-heist-v3 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje, sino una política de locomoción "perpetua" que se ejecuta de forma continua a 50 Hz hasta que se detiene explícitamente. Recibe observaciones de 61 dimensiones y emite 14 acciones de control articular, y se distribuye en formato ONNX con la normalización de observaciones integrada en el propio grafo.

El modelo lo publica el usuario RSanchez996 en HuggingFace bajo el tag `microduck`, con la librería `microduck` y el pipeline `robotics`. El repositorio tiene un tamaño de 0.0 GB según los metadatos de HuggingFace (probablemente por redondeo de un artefacto pequeño), sin descargas ni likes registrados, y fue creado el 5 de noviembre de 2026. Se trata de un artefacto experimental de investigación más que de un producto listo para producción.

Su relevancia radica en que ejemplifica el flujo de trabajo de políticas RL empaquetadas como artefactos ONNX cargables directamente en un robot mediante el daemon `robotctl`, lo que facilita la reproducibilidad y el despliegue de políticas entrenadas en simulación sobre hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (detalles de red no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, tamaño del espacio latente). Se sabe que es una política de control con espacio de observación de 61 dimensiones y espacio de acción de 14 dimensiones, ejecutada a 50 Hz, y que la normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `exp_sock_heist_speed_v3` y el commit `37d100973`. Se trata, por tanto, de un experimento de aprendizaje por refuerzo orientado a la velocidad de la marcha ("speed_v3"). No se especifican el número de pasos de entrenamiento, la composición del entorno de simulación, ni si hubo técnicas de curriculum, domain randomization u otras. Tampoco se documenta el algoritmo RL empleado (PPO, SAC, etc.).

## Capacidades

- Locomoción continua del robot microduck mediante una política "perpetua" que se ejecuta hasta recibir una orden de parada.
- Control a 50 Hz con 14 acciones articulares derivadas de 61 observaciones.
- Carga directa en el robot mediante el comando `robotctl policy load <slot> RSanchez996/microduck-sock-heist-v3`.
- Normalización de observaciones integrada en el artefacto ONNX, lo que simplifica la integración en el daemon.
- Compatibilidad con el manifiesto de políticas microduck en schema 2.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción RL: sirve como política de referencia para comparar estrategias de marcha en el microduck dentro de experimentos de aprendizaje por refuerzo.
- Despliegue rápido en hardware: el comando `robotctl policy load` permite cargar la política en un robot físico sin recompilar ni reentrenar, útil para validar políticas en simulación frente a realidad.
- Reproducción de experimentos: al estar vinculada a una rama y commit concretos del repositorio `microduck_rl`, permite reproducir el entrenamiento y comparar resultados.
- Demostraciones educativas: adecuada para talleres sobre robótica de código abierto y RL, dado que el robot microduck y su stack son abiertos.
- Pruebas de integración del daemon: útil como política de prueba para validar el pipeline de carga de políticas, el formato de manifiesto y la frecuencia de control a 50 Hz.
- Benchmarking de velocidad de marcha: la rama `exp_sock_heist_speed_v3` sugiere un experimento orientado a la velocidad, por lo que puede emplearse para medir el rendimiento de la marcha frente a otras políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control pequeña en formato ONNX, es probable que quepa en CPU o en GPUs de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: daemon `robotctl` del stack microduck (carga mediante `policy load`); inferencia ONNX Runtime u otro runtime compatible con ONNX.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms); no se detallan latencias reales medidas.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otras políticas comparables para el microduck ni de modelos de locomoción RL alternativos con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- Artefacto experimental: la rama `exp_sock_heist_speed_v3` indica un experimento de investigación, no una política validada para producción.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Sin datos de arquitectura ni de entrenamiento: dificulta la auditoría y la reproducibilidad completa.
- Específica del robot microduck: no es transferible a otras plataformas sin reentrenamiento.
- Sin información sobre sesgos, robustez ante perturbaciones o comportamiento en condiciones fuera de distribución.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar un artefacto muy pequeño o un problema de empaquetado; conviene verificar la integridad de `policy.onnx` antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RSanchez996/microduck-sock-heist-v3
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `exp_sock_heist_speed_v3`, commit `37d100973`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck

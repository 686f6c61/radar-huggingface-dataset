# rumezhak/microduck-sprint-composite-points-v2

## Resumen

microduck-sprint-composite-points-v2 es una política de control motriz para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario rumezhak y no es un modelo de lenguaje, sino una política de aprendizaje por refuerzo exportada a formato ONNX que genera comandos de locomoción a partir de observaciones del robot. Su función es producir una marcha perpetua (un gait) que se ejecuta de forma continua hasta que se detiene explícitamente.

La política consume un vector de observación de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, lo que corresponde a un periodo de 20 ms por paso de inferencia. Se distribuye como un fichero `policy.onnx` con el normalizador de observaciones integrado, de modo que el robot puede alimentar observaciones en crudo, junto con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon de microduck.

Es relevante en el contexto de la robótica open source porque ejemplifica el flujo completo de entrenamiento en simulación, exportación a ONNX y despliegue en hardware real mediante el comando `robotctl policy load`. La información pública disponible es muy limitada: el repositorio tiene 0 GB declarados, no se especifican licencia ni idiomas, y no se han publicado benchmarks ni detalles sobre el dataset de entrenamiento más allá del repositorio y el commit de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se trata de una política de aprendizaje por refuerzo entrenada con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`) y exportada a ONNX para su ejecución en el robot. El normalizador de observaciones está embebido en el propio grafo ONNX, lo que implica que la política espera observaciones en crudo y realiza la normalización internamente, simplificando la integración con el daemon.

No se especifican el número de tokens, la composición del dataset, el algoritmo de RL empleado (PPO, SAC u otro), ni si hubo fases de ajuste fino o currículo de entrenamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo. El único dato verificable del entrenamiento es el repositorio y el commit de origen indicados en la model card.

## Capacidades

- Generación de una marcha perpetua para el robot microduck: la política produce comandos motores continuos hasta que se detiene explícitamente.
- Control de locomoción a 50 Hz con 14 acciones de salida, adecuado para el bucle de control en tiempo real del robot.
- Consumo de observaciones de 61 dimensiones con normalización integrada en el modelo ONNX.
- Despliegue directo en hardware mediante `robotctl policy load <slot> rumezhak/microduck-sprint-composite-points-v2`.
- Integración con el sistema de slots de políticas del daemon de microduck, lo que permite cargarla y descargarla en caliente.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo, al no ser un modelo de lenguaje.

## Casos de uso

- Locomoción autónoma en el robot microduck: la política se carga en un slot del daemon y proporciona una marcha continua que el robot ejecuta hasta recibir una orden de parada, útil para desplazamientos sostenidos en entornos controlados.
- Investigación en aprendizaje por refuerzo aplicado a robótica: sirve como referencia de un pipeline completo de entrenamiento en `microduck_rl`, exportación a ONNX y despliegue en hardware real con `robotctl`.
- Prototipado de comportamientos compuestos: al ser una política perpetua, puede combinarse con capas de control de alto nivel que decidan cuándo cargarla o descargarla según la tarea.
- Docencia y experimentación con robots cuadrúpedos de bajo coste: permite a estudiantes ejecutar una política entrenada sin necesidad de reproducir el entrenamiento, gracias al formato ONNX y a la normalización embebida.
- Evaluación de infraestructura de despliegue: útil para validar el daemon de microduck, el esquema 2 del manifiesto de políticas y el flujo de carga en slots antes de entrenar políticas propias.
- Base para ajuste fino o destilación: al estar entrenada con el repositorio `microduck_rl`, puede servir como punto de partida para experimentos de RL posteriores sobre la misma plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una política de RL exportada a ONNX con entradas de 61 dimensiones y 14 salidas, es presumible que el modelo sea muy pequeño y quepa en cualquier GPU consumer, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; por la naturaleza del modelo (observación de 61 dimensiones, acción de 14, 50 Hz) es plausible que se ejecute incluso en CPU, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck (`robotctl policy load`); no se documentan otros runtimes.
- Latencia y throughput estimados: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (20 ms por paso), que marca el presupuesto máximo de inferencia por ciclo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables de otros autores para la plataforma microduck ni alternativas equivalentes con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de utilizarla en producción.
- No se documentan sesgos conocidos ni riesgos de alucinación, ya que no es un modelo generativo de texto; el riesgo principal es el fallo de la política en condiciones no vistas durante el entrenamiento (terrenos, cargas o perturbaciones distintas).
- El repositorio declara un tamaño de 0.0 GB, lo que puede indicar que los artefactos no están completamente subidos o que la métrica no se ha actualizado; verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.
- No se especifican los idiomas soportados porque no aplica; la política no procesa lenguaje.
- No hay información sobre el dominio de entrenamiento (tipo de terreno, simulador, parámetros de aleatorización), lo que limita la evaluación de su robustez en el mundo real.
- Al ser una política perpetua, requiere un mecanismo externo de parada; un fallo en el daemon o en la comunicación podría dejar al robot ejecutando la marcha de forma indefinida.
- Solo se ha validado, según la model card, con el flujo `robotctl policy load` y el esquema 2 del manifiesto; otros entornos de ejecución no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-composite-points-v2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck

# jaippolito/microduck-roller-duck

## Resumen

Microduck-roller-duck es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. Se trata de un modelo de aprendizaje por refuerzo exportado a ONNX que genera una marcha (gait) perpetua para que el robot se desplace sobre ruedas (rollers). El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, ejecutándose de forma continua hasta que se le indique lo contrario.

La relevancia de este artefacto es acotada: no es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política específica para robótica dentro del ecosistema microduck. Su interés principal reside en que demuestra el flujo completo de entrenamiento con aprendizaje por refuerzo y despliegue en hardware real mediante el daemon del robot, con la normalización de observaciones integrada directamente en el grafo ONNX.

La información pública disponible es muy escasa: el repositorio tiene 0 GB, no se declaran licencia ni idiomas, y la model card se limita a instrucciones de despliegue y referencias al repositorio de entrenamiento. No hay métricas, benchmarks ni detalles sobre el algoritmo de RL empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se detalla en la información disponible. Lo que sí se especifica es la interfaz: entrada de observación de 61 dimensiones, salida de 14 acciones, ciclo de control a 50 Hz. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional. El artefacto se distribuye como una política perpetua ("perpetual policy") cargada en una ranura (slot) del daemon del robot.

El entrenamiento se realizó con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `dirigo-speed`, commit `c2221611b`. No se proporcionan datos sobre número de pasos de entrenamiento, composición del entorno, función de recompensa, algoritmo de RL (PPO, SAC u otro) ni técnicas de estabilización. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones de inferencia, que en este contexto no aplican.

## Capacidades

- Control locomotor del microduck sobre ruedas mediante una marcha perpetua que se ejecuta hasta recibir una orden de parada o sustitución.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el grafo ONNX, lo que elimina la necesidad de preprocesado externo.
- Carga como política en una ranura del daemon mediante `robotctl policy load <slot> jaippolito/microduck-roller-duck`.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`manifest.json`).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento; su función es exclusivamente motora.

## Casos de uso

- Demostración de locomoción sobre ruedas: cargar la política en una ranura del daemon y dejar que el robot se desplace de forma continua sobre una superficie lisa, aprovechando la naturaleza perpetua de la marcha para exhibiciones o vídeos de divulgación.
- Validación de la cadena de despliegue: usar el modelo como política de referencia para comprobar que el daemon, el cargador de manifiestos y la interfaz `robotctl` funcionan de extremo a extremo antes de entrenar políticas propias.
- Punto de partida para experimentos de RL: replicar el entrenamiento desde la rama `dirigo-speed` del repositorio `microduck_rl` y comparar la marcha resultante con esta política publicada.
- Pruebas de robustez del controlador: alimentar observaciones en crudo dentro del rango esperado y verificar que la normalización embebida mantiene la estabilidad de la marcha a 50 Hz.
- Integración en pipelines de investigación en robótica: servir como baseline de locomoción sobre ruedas frente a políticas entrenadas con otras recompensas o currículos.
- Benchmarking de latencia en hardware embebido: medir el coste de inferencia ONNX por ciclo a 50 Hz (20 ms de presupuesto) en la computadora del microduck para evaluar si la política cabe en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0 GB, lo que sugiere un modelo de muy pocos parámetros, pero no se confirma.
- GPU recomendadas: no disponible; el despliegue previsto es en la computadora embebida del microduck, no en GPU de servidor.
- Compatibilidad con GPU de consumo: probablemente irrelevante, ya que la inferencia se ejecuta en el propio robot; no hay datos confirmados.
- Opciones de despliegue: runtime ONNX dentro del daemon microduck, cargado mediante `robotctl policy load`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el ciclo de control está fijado en 50 Hz, lo que impone un presupuesto de 20 ms por inferencia; no se publican mediciones reales de latencia.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada otras políticas publicadas del ecosistema microduck ni modelos comparables de locomoción sobre ruedas con interfaz de 61 observaciones y 14 acciones.

## Limitaciones y advertencias

- Información pública mínima: sin licencia declarada, sin idiomas, sin métricas y sin descripción de la arquitectura de red, lo que dificulta evaluar su idoneidad antes del despliegue.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en productos.
- Política perpetua sin condición de parada documentada: el comportamiento de seguridad al final del recorrido, ante obstáculos o tras una caída no se especifica en la model card.
- Especialización estrecha: entrenada para desplazamiento sobre ruedas en el microduck; no se espera transferencia a otras morfologías, superficies o robots.
- Dependencia del entorno de entrenamiento: al ser una política de RL, el rendimiento fuera de la distribución de observaciones vista durante el entrenamiento (superficies, cargas, desgastes de ruedas) puede degradarse.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo anterior; estos conceptos no aplican directamente a una política motora, pero la opacidad sobre el entrenamiento impide descartar modos de fallo.
- Repositorio vacío en tamaño (0 GB) y sin descargas ni likes: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaippolito/microduck-roller-duck
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `dirigo-speed`, commit `c2221611b` (sin URL directa en la información proporcionada)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información proporcionada)

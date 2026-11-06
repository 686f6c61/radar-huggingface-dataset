# juicenv/microduck-sock-heist-tab5

## Resumen

microduck-sock-heist-tab5 es una política de aprendizaje por refuerzo para robótica publicada en Hugging Face por el usuario juicenv. No se trata de un modelo de lenguaje, sino de una red neuronal exportada a ONNX que implementa una marcha ("gait") perpetua para el robot microduck, desarrollado por Pollen Robotics. El nombre "Sock Heist" corresponde a la versión 9 de la red de la familia sock-heist, complementada con tablas de búsqueda (lookup tables) propias por semilla para las cinco ejecuciones de rating, resultado de una búsqueda continua con CMA-ES.

La política opera sobre observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, y está diseñada para ejecutarse de forma indefinida hasta que se indique lo contrario, cargándose en un slot de políticas del robot mediante la herramienta `robotctl`. Es relevante como ejemplo de políticas de locomoción entrenadas con RL que se distribuyen de forma reproducible, con el normalizador de observaciones incrustado en el propio fichero ONNX y un manifiesto que sigue el esquema 2 del daemon de microduck.

El entrenamiento procede del repositorio `pollen-robotics/microduck_rl` en su rama HEAD, concretamente del commit `5cee942d8`, lo que permite reproducir o auditar el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para politica de RL (detalles no disponibles), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (politica de robotica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx), con manifest.json (esquema 2) |

## Arquitectura y entrenamiento

La política es una red neuronal de inferencia rápida pensada para control en tiempo real a 50 Hz sobre el robot microduck, que expone un espacio de observación de 61 dimensiones y un espacio de acciones de 14 dimensiones. El fichero `policy.onnx` incluye el normalizador de observaciones integrado, de modo que el daemon puede alimentar observaciones crudas sin preprocesado externo, lo que reduce la latencia y elimina desajustes entre entrenamiento y despliegue.

El entrenamiento se realizó con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl` (commit `5cee942d8`). Según la model card, la variante tab5 combina la red sock-heist9 con tablas de búsqueda por semilla obtenidas mediante una búsqueda continua con CMA-ES (Estrategia Evolutiva de Matriz de Covarianza) sobre cinco ejecuciones de rating, una técnica habitual para ajustar finamente parámetros de recompensa o control. No hay datos publicados sobre el número de pasos de entrenamiento, el simulador empleado ni el algoritmo de RL concreto.

## Capacidades

- Marcha perpetua (gait) para el robot microduck: la política se ejecuta de forma continua a 50 Hz hasta recibir una orden de parada.
- Control de 14 articulaciones o actuadores a partir de observaciones de 61 dimensiones.
- Inferencia autosuficiente: el normalizador de observaciones va incrustado en el ONNX, sin necesidad de preprocesado externo.
- Carga directa en el robot mediante `robotctl policy load` en un slot de políticas.
- Compatibilidad con el sistema de manifiestos de políticas de microduck (esquema 2).
- No tiene capacidades de lenguaje, visión, tool calling ni razonamiento: es una política de control motor.

## Casos de uso

- Despliegue de locomoción en microduck: carga de la marcha en un slot de política del robot para que camine de forma indefinida en demostraciones o eventos, sin lógica de parada manual.
- Investigación en RL para robótica: punto de partida o baseline para experimentar con políticas de marcha entrenadas con CMA-ES y RL, con el commit de entrenamiento referenciado para reproducibilidad.
- Benchmarking de políticas: las tablas de rating por semilla permiten comparar rendimientos entre ejecuciones de entrenamiento de forma sistemática.
- Validación de hardware en el aula o laboratorio: prueba de estabilidad de la marcha en unidades físicas de microduck antes de desarrollar políticas propias.
- Desarrollo de herramientas de despliegue: ejemplo real de manifiesto `manifest.json` conforme al esquema 2, útil para quien implemente cargadores de políticas compatibles con microduck.
- Estudio de exportación sim-to-real: caso práctico de cómo empaquetar una política entrenada en RL (con normalizador incluido) en ONNX para inferencia embebida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "cinco ejecuciones de rating" ajustadas con CMA-ES, pero no incluye métricas numéricas (velocidad de marcha, consumo energético, distancia recorrida, etc.).

## Requisitos de hardware

- Hardware objetivo: el robot microduck de Pollen Robotics; la inferencia se ejecuta a bordo a 50 Hz mediante el daemon de políticas. Los requisitos de cómputo del ONNX no están publicados, pero al tratarse de una política de control de tamaño reducido, la carga es mínima comparada con un LLM.
- GPU: no aplicable; no se requiere GPU para la inferencia de la política.
- VRAM: no aplicable.
- Despliegue: mediante `robotctl policy load <slot> juicenv/microduck-sock-heist-tab5` con privilegios de administrador en el robot. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia: diseñada para un ciclo de control de 50 Hz (20 ms por paso); mediciones concretas no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Espacio obs/accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-tab5 | Politica RL de marcha (microduck) | ONNX | 61-D / 14 acciones | no disponible | Hugging Face, carga via robotctl |
| Otras variantes sock-heist del mismo autor | Politica RL de marcha (microduck) | no disponible | no disponible | no disponible | no disponible |
| Politicas de locomocion RL genericas (p. ej. para Unitree Go) | Politica RL de marcha | ONNX/JIT | variable | variable | variable |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Licencia no especificada: sin ficha de licencia no es posible confirmar si el uso comercial, la redistribución o la modificación están permitidos. Verificar con el autor antes de cualquier despliegue fuera de experimentación personal.
- Modelo muy específico: solo es utilizable en el robot microduck con su daemon de políticas; no es transferible a otros robots sin adaptación.
- Riesgo inherente a políticas de RL: el comportamiento en situaciones fuera de distribución (superficies nuevas, perturbaciones, fallos de sensores) no está documentado y puede provocar caídas o daños en el hardware.
- Sin documentación de rendimiento: no hay métricas publicadas de estabilidad, velocidad ni robustez de la marcha.
- El repositorio aparece con 0 descargas y 0 likes y un tamaño de 0.0 GB en los metadatos consultados, lo que sugiere un modelo de circulación muy reducida y sin validación comunitaria.
- La model card es mínima: no describe el algoritmo de RL, el simulador ni los procedimientos de seguridad recomendados durante el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juicenv/microduck-sock-heist-tab5
- Repositorio del framework microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama HEAD, commit `5cee942d8`)
- Autor en Hugging Face: juicenv (enlace de perfil no disponible)

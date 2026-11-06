# RSanchez996/microduck-tug-competitive-v1

## Resumen

microduck-tug-competitive-v1 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta: ejecutar una marcha (gait) que permita al robot resistir el tirón inicial en un juego de tira y afloja (tug of war), mejorando la recompensa respecto a políticas anteriores. Se distribuye como un artefacto ONNX autónomo que se carga en una ranura de política del daemon del robot y se ejecuta de forma perpetua a 50 Hz.

Técnicamente no es un modelo de lenguaje, sino una política de reinforcement learning que mapea observaciones de 61 dimensiones a 14 acciones de control articular. El autor es RSanchez996 y el modelo se entrenó sobre el repositorio `pollen-robotics/microduck_rl`, en la rama `ft_competitive_multiopponent` y el commit `b8328925e`. La relevancia es acotada: sirve a la comunidad de robótica que trabaja con la plataforma microduck y necesita políticas competitivas listas para desplegar.

La información publicada es muy escasa: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card se limita a instrucciones de despliegue y metadatos de entrenamiento. Todo lo que no consta explícitamente se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning; red neuronal no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la información disponible. Por la naturaleza del artefacto (una política que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz para un cuadrúpedo de 4 patas), se trata de una política de control continuo entrenada con aprendizaje por refuerzo, exportada a ONNX para inferencia en el robot. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `ft_competitive_multiopponent`, commit `b8328925e`. El nombre de la rama sugiere un ajuste fino con múltiples oponentes, orientado a que la política generalice frente a distintos contrincantes en el juego de tira y afloja. No se especifican número de pasos de entrenamiento, composición del dataset, algoritmo de RL, ni si hubo recompensas moldeadas adicionales más allá de la mención a "improve rewards to help players endure the initial shock".

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante una marcha perpetua que se ejecuta hasta recibir una orden de parada.
- Mapeo directo de observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Comportamiento competitivo específico para tira y afloja, con énfasis en resistir el tirón inicial.
- Carga y descarga como ranura de política mediante `robotctl policy load <slot> ...`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Demostración de tira y afloja con microduck: cargar la política en una ranura y dejar que el robot mantenga la postura y resista el tirón inicial durante una exhibición o taller.
- Benchmark interno de políticas de locomoción: comparar esta política competitiva con otras marchas del mismo robot usando el mismo pipeline `robotctl`, midiendo la resistencia al tirón.
- Base para ajuste fino con nuevos oponentes: partir de esta política y continuar el entrenamiento en la rama `ft_competitive_multiopponent` para adaptarla a contrincantes distintos.
- Pruebas de integración del daemon: validar el flujo de carga de políticas y el esquema 2 de `manifest.json` en un entorno de desarrollo antes de desplegar otras políticas.
- Docencia e investigación en RL aplicado a robótica: usar el artefacto como ejemplo reproducible de política entrenada y exportada a ONNX para un robot de bajo coste.
- Evaluación de robustez frente a perturbaciones externas: someter al robot a cargas variables durante la marcha y registrar el comportamiento para analizar la estabilidad del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de un robot de bajo coste y distribuirse en ONNX, es previsible que la inferencia sea ligera, pero no hay cifras publicadas.
- GPU recomendadas: no disponibles; el despliegue previsto es en el propio robot mediante el daemon microduck, no en servidores GPU.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: `robotctl policy load <slot> RSanchez996/microduck-tug-competitive-v1` sobre el daemon de microduck; el artefacto ONNX puede ejecutarse con cualquier runtime compatible con ONNX, aunque el autor no lo documenta.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (periodo de 20 ms por ciclo de control); no se publican mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-competitive-v1 | Política RL (ONNX) para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otras políticas de microduck en `pollen-robotics/microduck_rl` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio de entrenamiento |
| Políticas de locomoción para cuadrúpedos de bajo coste (genéricas) | Políticas RL | variable | variable | variable | no disponible |

No se dispone de datos públicos de rendimiento que permitan una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Específica del hardware microduck: la política asume observaciones de 61 dimensiones y 14 acciones; no es transferible a otros robots sin reentrenamiento.
- Comportamiento perpetuo: la marcha se ejecuta hasta recibir una orden de parada, lo que exige supervisión y mecanismos de seguridad en el robot.
- Sesgos conocidos: no documentados; al entrenarse con múltiples oponentes, el comportamiento puede estar especializado en las condiciones de entrenamiento y degradarse frente a perturbaciones no vistas.
- Riesgo de fallo del controlador: no se publican métricas de robustez, tasa de caídas ni análisis de estabilidad.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas: no aplica; el modelo no procesa texto.
- Documentación mínima: sin parámetros, arquitectura, dataset ni benchmarks, lo que dificulta la evaluación técnica y la reproducibilidad.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de uso por parte de la comunidad ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RSanchez996/microduck-tug-competitive-v1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `ft_competitive_multiopponent`, commit `b8328925e` (sin URL directa disponible en la información proporcionada)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa disponible en la información proporcionada)

# SccHy/microduck-sprint-gait2

## Resumen

`sprint-gait2` es una política de control motriz para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es un agente de aprendizaje por refuerzo exportado a ONNX que genera comandos de articulación para que el robot ejecute una marcha (gait) de forma continua. El autor, SccHy, lo publica como un "policy slot" cargable en el daemon del robot mediante el comando `robotctl policy load`.

La política recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, lo que corresponde a un controlador reactivo de tiempo real. El modelo se entrenó con el entorno `Mjlab-Sprint2m-MicroDuck` (base `mjlab-microduck 0.1.0`), un pipeline de simulación basado en MuJoCo/MJX para entrenamiento de locomoción. El checkpoint publicado corresponde al paso 1000 de entrenamiento con semilla 1.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento en simulación y despliegue en hardware real para un robot de bajo coste, con un formato de manifiesto estandarizado (schema 2) que facilita la integración en el daemon del robot. Al no publicarse métricas de rendimiento ni detalles del dataset, su valor práctico como referencia técnica es limitado fuera del ecosistema microduck.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; no se especifica la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (pesos en ONNX; no se documentan variantes) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red en la información disponible. Lo que sí se especifica es la interfaz: entrada de 61 dimensiones (observación del robot, presumiblemente estado de articulaciones, IMU y comandos), salida de 14 dimensiones (acciones de articulación) y frecuencia de control de 50 Hz. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional.

El entrenamiento se realizó con el pipeline `mjlab-microduck` (versión 0.1.0), tarea `Mjlab-Sprint2m-MicroDuck`, rama `master`, commit `ce726e39b`, checkpoint 1000 y semilla 1, iniciado el 2026-11-03T08:17:54Z. No se documentan el número de pasos totales, la composición del dataset de entrenamiento, el algoritmo de RL empleado (PPO, SAC, etc.) ni si hubo fases de ajuste adicionales. La política se describe como "perpetua": se ejecuta de forma continua hasta recibir una orden de parada, lo que sugiere un diseño de control reactivo sin memoria explícita de episodio.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha estable a 50 Hz hasta que se le indique lo contrario.
- Control reactivo de 14 actuadores a partir de una observación de 61 dimensiones.
- Normalización de observaciones integrada en el propio grafo ONNX, lo que simplifica la integración en el daemon.
- Carga como "policy slot" mediante `robotctl policy load <slot> SccHy/microduck-sprint-gait2`.
- Compatibilidad con el manifiesto de políticas schema 2 del daemon microduck.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es un controlador motor, no un modelo generativo.

## Casos de uso

- Despliegue de una marcha base en un microduck físico: cargar la política en un slot del daemon y verificar que el robot camina de forma continua, como paso previo a políticas más específicas.
- Referencia para entrenamiento propio: usar la configuración documentada (tarea `Mjlab-Sprint2m-MicroDuck`, base `mjlab-microduck 0.1.0`, checkpoint 1000, semilla 1) como punto de partida reproducible para experimentos de locomoción.
- Pruebas de integración del daemon: validar el flujo `robotctl policy load`, el esquema de manifiesto schema 2 y la carga de ONNX con normalizador embebido.
- Benchmarking de políticas de marcha: comparar esta política con otras publicadas en el mismo formato para el mismo robot, midiendo estabilidad y velocidad de desplazamiento.
- Docencia y prototipado en robótica de bajo coste: ejemplo completo de simulación a hardware real en un cuadrúpedo accesible.
- Base para fine-tuning o sustitución: emplear la política como inicialización o como línea base al entrenar variantes de marcha (terrenos, velocidades, comandos de dirección).
- Validación de pipelines ONNX en robótica: comprobar latencia y compatibilidad de un grafo ONNX con normalización embebida en el runtime del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni tamaño del grafo ONNX; el repo ocupa 0.0 GB, lo que sugiere un modelo muy pequeño).
- GPU recomendadas: no disponible; por el tamaño aparente del artefacto, la inferencia probablemente pueda ejecutarse en CPU del propio robot.
- ¿Cabe en GPU de consumo? No disponible con certeza, pero el tamaño del repo (0.0 GB) apunta a que cabe en cualquier hardware, incluido el cómputo embebido del microduck.
- Opciones de despliegue: runtime del daemon microduck mediante `robotctl policy load`; al ser ONNX, es compatible con ONNX Runtime y otros ejecutores ONNX.
- Latencia y throughput: no disponibles. La frecuencia de control objetivo es 50 Hz (20 ms por paso), lo que fija un presupuesto de latencia máximo de 20 ms por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SccHy/microduck-sprint-gait2 | Política RL (ONNX) | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre políticas comparables para el mismo robot u otros cuadrúpedos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se especifica la licencia: no hay garantía de uso comercial ni de redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Ausencia total de métricas: no hay benchmarks, curvas de recompensa ni evaluación de robustez, por lo que no es posible valorar su calidad frente a alternativas.
- Entrenamiento con una sola semilla (seed 1) y un único checkpoint (1000): no se documenta variabilidad ni estabilidad del entrenamiento.
- Política "perpetua" sin mecanismo de parada documentado más allá de la orden externa; en producción debe existir un watchdog que garantice la parada segura.
- Dependencia del normalizador embebido: alimentar observaciones ya normalizadas produciría comportamientos incorrectos.
- Sin información sobre el dominio de entrenamiento (terrenos, perturbaciones, comandos de velocidad), por lo que se desconoce su robustez fuera del entorno simulado de origen.
- Riesgo de sim-to-real gap no cuantificado: no se documenta si la política fue validada en hardware físico.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/SccHy/microduck-sprint-gait2
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repo del daemon): no disponible como URL directa en la información proporcionada.

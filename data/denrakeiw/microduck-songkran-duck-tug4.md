# DenRakEiw/microduck-songkran-duck-tug4

## Resumen

`microduck-songkran-duck-tug4` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado como un grafo ONNX listo para su despliegue en el robot físico. El autor del artefacto en Hugging Face es DenRakEiw y la política se ha entrenado en el entorno de simulación `Mjlab-TugOfWar-MicroDuck`, un escenario de tira y afloja (tug of war) dentro del repositorio `microduck-challenges`.

La relevancia de este artefacto es acotada y muy específica: demuestra el flujo de trabajo completo de entrenamiento, exportación y despliegue de políticas de locomoción para un robot de bajo coste, con un manifiesto de política versionado (schema 2) que permite cargarla en una ranura del daemon del robot mediante el comando `robotctl policy load`. La política es de tipo "perpetuo": ejecuta una marcha de forma continua hasta que se le indique lo contrario, sin condición de terminación interna.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas soportados. La información disponible se limita a la model card del autor y a los metadatos de Hugging Face; no se han publicado resultados de benchmarks ni especificaciones detalladas de la arquitectura de red.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`; el normalizador de observaciones está embebido en el grafo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Observaciones de entrada | 61 dimensiones |
| Acciones de salida | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (sin terminación interna) |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la información disponible. Lo que sí se especifica es la interfaz: la política consume observaciones crudas de 61 dimensiones y produce 14 acciones a 50 Hz, con el normalizador de observaciones integrado en el propio grafo ONNX, de modo que el consumidor no necesita aplicar preprocesado adicional. La política se distribuye junto con un `manifest.json` que sigue el schema 2 del manifiesto de políticas del daemon de microduck.

El entrenamiento se realizó con aprendizaje por refuerzo sobre el entorno `Mjlab-TugOfWar-MicroDuck`, del repositorio `pollen-robotics/microduck-challenges`, en la rama `denrakeiw-070` y el commit `6c0b5d452`. Se partió del checkpoint `8900`, con semilla `11`, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`, y el entrenamiento comenzó el 2026-11-18T18:30:15Z. La configuración incluye 4096 entornos paralelos, un máximo de 3000 iteraciones del agente, un oponente compuesto por una mezcla de la política `titan-v1` (peso 0,7) y una referencia (peso 0,3), retraso de inicio del oponente de 3 iteraciones con dispersión de 3, episodios de 10,5 s y un currículo por etapas sobre la tasa de acción, el sesgo de pose de cabeza y el rango del centro de masas. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: con el mismo código, `uv.lock`, comando y semilla se obtiene una política comparable, no los mismos pesos.

## Capacidades

- Locomoción cuadrúpeda continua: ejecuta una marcha perpetua sobre el robot microduck hasta recibir una orden de parada o sustitución de política.
- Control reactivo a partir de observaciones propioceptivas de 61 dimensiones, con salida de 14 acciones a 50 Hz.
- Comportamiento específico de tarea: política entrenada para el escenario de tira y afloja (`Mjlab-TugOfWar-MicroDuck`), incluyendo empuje y gestión de márgenes respecto a fosas y marcadores según la configuración de recompensas.
- Despliegue directo en hardware mediante el daemon del robot: carga en una ranura de política con `robotctl policy load`.
- Autocontención en inferencia: el normalizador de observaciones está embebido en `policy.onnx`, por lo que se alimentan observaciones crudas.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como referencia reproducible de un pipeline completo (entrenamiento en `mjlab`, exportación a ONNX, manifiesto y carga en robot) para comparar configuraciones de recompensa y currículo.
- Despliegue de demostraciones de tira y afloja con microduck: la política está entrenada específicamente para ese escenario, por lo que es adecuada para exhibiciones y validación del comportamiento de empuje frente a un oponente.
- Base para ajuste fino con nuevas recompensas: al partir de un checkpoint y una configuración documentados, se puede reentrenar con modificaciones en los pesos de recompensa (`settle-gap`, `pit-margin-reward`, `marker-verdict`) para obtener variantes de comportamiento.
- Pruebas de integración del daemon `robotctl`: útil para validar el cargador de políticas, el schema 2 del manifiesto y el flujo de ranuras de política en el robot real.
- Evaluación de robustez de políticas perpetuas: al no tener condición de terminación interna, permite estudiar deriva, estabilidad y recuperación en ejecuciones largas.
- Docencia y prototipado con hardware de bajo coste: el microduck de Pollen Robotics es una plataforma asequible, y esta política ilustra el ciclo completo sin requerir infraestructura de inferencia de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, distancia recorrida ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y la naturaleza de la tarea (observación de 61 dimensiones, acción de 14), la política es de pequeña escala y cabe holgadamente en cualquier GPU consumer, e incluso es plausible su ejecución en CPU, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible. Para el entrenamiento, la configuración usa 4096 entornos paralelos, lo que en la práctica requiere GPU de datacenter (A100, H100 o similares), pero el autor no especifica el hardware empleado.
- GPU consumer: no se indica compatibilidad explícita; por el tamaño del artefacto, cualquier GPU consumer moderna debería poder ejecutar la inferencia.
- Opciones de despliegue: el runtime previsto es el daemon de microduck mediante `robotctl policy load <slot> DenRakEiw/microduck-songkran-duck-tug4`; también es posible cargar `policy.onnx` con cualquier runtime ONNX compatible, aunque no se documenta.
- Latencia y throughput: no disponibles. La frecuencia de control objetivo es 50 Hz (periodo de 20 ms), pero no se aportan mediciones reales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni artefactos comparables con los que establecer una comparación de parámetros, contexto, rendimiento o licencia. El propio ecosistema `microduck-challenges` contiene otras políticas (por ejemplo, `titan-v1`, citada como oponente en el entrenamiento), pero no se dispone de sus especificaciones.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia alguna, lo que impide determinar si el uso comercial está permitido. Tratarlo como no apto para producción comercial hasta aclararlo con el autor.
- Sin datos de rendimiento: no hay métricas publicadas que permitan estimar la calidad o robustez de la política en el robot físico.
- Especificidad de tarea: entrenada para `Mjlab-TugOfWar-MicroDuck`; su comportamiento fuera de ese escenario (otras tareas, terrenos o condiciones) no está validado.
- Política perpetua: al no tener terminación interna, un fallo en la supervisión externa puede dejar al robot ejecutando la marcha indefinidamente.
- Reproducibilidad limitada: el propio autor indica que el reentrenamiento no es bit a bit reproducible; los pesos no se pueden regenerar de forma idéntica.
- Sesgos y alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe el riesgo de comportamientos no previstos fuera de la distribución de entrenamiento (simulación a realidad, variaciones de hardware, desgaste mecánico).
- Idiomas y contexto: no aplica; no es un modelo lingüístico.
- Madurez del artefacto: cero descargas y cero likes, creado y actualizado el mismo día, sin validación comunitaria visible.
- Dependencia del daemon: el despliegue requiere el comando `robotctl` y el esquema de manifiesto del daemon de microduck; no se documenta compatibilidad con otras versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck-tug4
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: `6c0b5d452` (rama `denrakeiw-070` del repositorio anterior)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)

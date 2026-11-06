# rumezhak/microduck-tug-a1-seed5

## Resumen

`microduck-tug-a1-seed5` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es un controlador neuronal que traduce observaciones del robot (61 dimensiones) en acciones de actuadores (14 dimensiones) a una frecuencia de 50 Hz, es decir, genera una marcha continua que se ejecuta de forma indefinida hasta que se le indique lo contrario.

El artefacto se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo, lo que simplifica el despliegue en el robot: basta con alimentar observaciones en crudo. Se integra con el ecosistema de políticas del daemon de microduck mediante un `manifest.json` que sigue el esquema 2 de la especificación de manifiestos de políticas. El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`).

La relevancia de esta ficha es acotada: se trata de un checkpoint concreto (semilla 5) de una familia de políticas de locomoción, con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva más allá de las instrucciones de ejecución y sin datos publicados de rendimiento. Resulta útil como referencia para quienes trabajan con el robot microduck y quieren replicar o comparar políticas de marcha entrenadas con RL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL; arquitectura de red no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Observaciones de entrada | 61 dimensiones |
| Acciones de salida | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |
| Librería | microduck |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se documenta es el contrato de interfaz: entrada de 61 dimensiones de observación, salida de 14 dimensiones de acción y ejecución a 50 Hz. El normalizador de observaciones está integrado en el propio archivo `policy.onnx`, de modo que el consumidor debe enviar observaciones sin preprocesar.

El entrenamiento se realizó con aprendizaje por refuerzo usando el repositorio `pollen-robotics/microduck_rl`, en la rama `main` y el commit `5cee942d8`. El sufijo `seed5` indica que se trata de la ejecución con semilla aleatoria 5, lo que sugiere que existen otras políticas hermanas entrenadas con semillas distintas. No se especifican el número de pasos de entrenamiento, la función de recompensa, el simulador utilizado ni si hubo ajuste fino en hardware real.

## Capacidades

- Generación de una marcha continua y perpetua para el robot cuadrúpedo microduck, sin horizonte temporal predefinido.
- Control a 50 Hz con latencia de ciclo de 20 ms, adecuado para bucles de control en tiempo real.
- Consumo directo de observaciones en crudo: el normalizador está embebido en el grafo ONNX.
- Integración con el daemon del robot mediante `robotctl policy load <slot> rumezhak/microduck-tug-a1-seed5`.
- Carga en una ranura de política (*policy slot*) del sistema microduck.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modo de razonamiento (*thinking*), visión ni audio.

## Casos de uso

- **Locomoción básica del microduck en laboratorio**: cargar la política en una ranura y dejar que el robot camine de forma continua para pruebas de hardware, batería y desgaste de actuadores. La política perpetua evita tener que reiniciar episodios.
- **Comparación de semillas en experimentos de RL**: al ser el checkpoint de la semilla 5, sirve para contrastar la robustez de la marcha frente a otras semillas de la misma familia y evaluar la varianza del entrenamiento.
- **Validación de la pipeline de despliegue**: útil para verificar que el daemon, el esquema 2 de manifiestos y la carga de políticas ONNX funcionan de extremo a extremo antes de probar políticas más complejas.
- **Base para ajuste fino o destilación**: al estar entrenada con `microduck_rl`, puede servir como inicialización para experimentos de *fine-tuning* con recompensas específicas (velocidad, estabilidad, eficiencia energética).
- **Docencia en robótica con RL**: ejemplo reproducible de política de locomoción para cursos o talleres, dado que el robot y el repositorio de entrenamiento son de código abierto.
- **Pruebas de integración en simulación**: ejecutar el ONNX en un simulador compatible con el modelo del microduck para validar el comportamiento antes de transferirlo al robot físico.
- **Recolección de datos de marcha**: usar la política para generar trayectorias de referencia y registrar observaciones y acciones para entrenar modelos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de recompensa, tasa de éxito, velocidad de marcha, estabilidad ni comparaciones con otras políticas en la model card ni en los metadatos de Hugging Face.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- **GPU recomendadas**: no disponible. Para una política de control a 50 Hz con entrada de 61 dimensiones y salida de 14, es plausible que la inferencia en CPU sea suficiente, pero no hay datos que lo confirmen.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Opciones de despliegue**: el despliegue previsto es en el propio robot mediante el daemon de microduck (`robotctl`). El formato ONNX permite, en principio, ejecución con ONNX Runtime, pero no se documentan otras opciones.
- **Latencia y throughput**: el ciclo de control es de 50 Hz (20 ms por paso), pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de locomoción comparables para el microduck ni checkpoints de la misma familia con datos publicados. La comparación con modelos de lenguaje no es aplicable dada la naturaleza del artefacto.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-a1-seed5 | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia en los metadatos ni en la model card, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- **Documentación mínima**: la model card no describe la arquitectura, la recompensa, el simulador ni el proceso de entrenamiento, lo que dificulta evaluar su robustez.
- **Sin métricas publicadas**: no hay evidencia cuantitativa de estabilidad, velocidad ni capacidad de recuperación ante perturbaciones.
- **Cero adopción**: cero descargas y cero likes en el momento de la consulta; no hay retroalimentación de la comunidad sobre su comportamiento real.
- **Riesgo de sobreajuste al simulador**: al no documentarse si hubo transferencia *sim-to-real*, la marcha puede degradarse en el robot físico frente al entorno de entrenamiento.
- **Dependencia de la versión del daemon**: el `manifest.json` sigue el esquema 2; cambios futuros en el daemon pueden romper la compatibilidad.
- **Sin soporte de parada autónoma**: al ser una política perpetua, requiere una orden externa para detenerse; en producción debe existir un mecanismo de seguridad independiente.
- **Sesgos**: no aplica en el sentido habitual de sesgos lingüísticos, pero la política puede exhibir comportamientos indeseados derivados de la función de recompensa no documentada (por ejemplo, marcha asimétrica o deriva).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-a1-seed5
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Especificación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck

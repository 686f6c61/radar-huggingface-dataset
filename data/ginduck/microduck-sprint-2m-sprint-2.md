# GinDuck/microduck-sprint-2m-sprint-2

## Resumen

sprint-2m-sprint-2 es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un controlador de locomoción que produce directamente las acciones motoras del robot a partir de sus observaciones de sensores. El autor, GinDuck, lo publica como su segunda política de tipo "sprint", orientada a maximizar la velocidad bruta de desplazamiento.

La política opera a 50 Hz, consume un vector de observación de 61 dimensiones y emite 14 acciones de control. Se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio grafo, de modo que el robot puede alimentar observaciones en crudo. El modelo se entrenó con el entorno `Mjlab-Sprint2m-MicroDuck` del repositorio `microduck-challenges`, sobre la rama `race-2`, durante 3000 iteraciones con 4096 entornos paralelos y semilla 1.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción para un robot de bajo coste, con un pipeline reproducible documentado (comando `uv run train` incluido) y una integración directa en el daemon del robot mediante `robotctl policy load`. Es material útil para investigación en robótica con RL y para experimentación con el hardware microduck, no para tareas de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | política de control entrenada con aprendizaje por refuerzo (detalles de red no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal de la política (número de capas, anchura, tipo de activaciones). Lo que sí se documenta es el marco de entrenamiento: simulación física con `mjlab-microduck 0.1.0` (commit `1efd853be`), tarea `Mjlab-Sprint2m-MicroDuck`, 4096 entornos paralelos, 3000 iteraciones máximas, semilla 1 y checkpoint final en la iteración 2999. El entrenamiento se ejecutó sobre la rama `race-2` del repositorio `microduck-challenges`, en el commit `b44f7ffc9`.

La política es de tipo "perpetuo": una vez cargada en una ranura de política del robot, ejecuta la marcha de forma continua hasta que se le indique lo contrario. El normalizador de observaciones está embebido en `policy.onnx`, lo que simplifica el despliegue y elimina una fuente habitual de errores de integración. El autor advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando y semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda a alta velocidad: la política está optimizada para "perseguir velocidad bruta" y "inclinarse en la carrera", según la descripción del autor.
- Ejecución de una marcha perpetua a 50 Hz sobre el robot microduck, sin condición de parada interna.
- Consumo de observaciones en crudo (61 dimensiones) gracias al normalizador integrado en el ONNX.
- Emisión de 14 acciones de control motor por paso de inferencia.
- Despliegue mediante el comando `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-2`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- Investigación en locomoción con RL: sirve como política de referencia para comparar recetas de entrenamiento (la receta base es de TheSauceman) y analizar el compromiso entre velocidad y estabilidad en un cuadrúpedo de bajo coste.
- Despliegue en el robot microduck físico: cargar la política en una ranura con `robotctl` y ejecutar una marcha de sprint continua para pruebas de hardware, consumo de batería o desgaste de servos.
- Benchmarking de simuladores: al estar entrenada en `mjlab`, permite contrastar la transferencia sim-a-real de una política entrenada con 4096 entornos paralelos.
- Docencia y divulgación en robótica: el pipeline reproducible (`uv sync` + `uv run train`) y el manifiesto documentado facilitan reproducir el entrenamiento en un curso o taller.
- Base para fine-tuning o continuación de entrenamiento: el checkpoint y la receta publicada permiten partir de esta configuración para explorar variantes (curvas, terrenos, recompensas de velocidad).
- Pruebas de integración del daemon: útil para validar el flujo `robotctl policy load`, el esquema 2 del manifiesto y el manejo de observaciones en crudo en un entorno de CI de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo y específico de la tarea: la política "termina cada carrera en aproximadamente 1,2 segundos". No se proporcionan métricas de recompensa, velocidad media, tasa de caídas ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se publica el recuento de parámetros.
- GPU recomendadas: no disponibles. Para el entrenamiento, el autor usa 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar); no se especifica el hardware exacto empleado.
- ¿Cabe en GPU de consumo? No disponible con datos; por el tamaño del artefacto es plausible, pero no confirmado.
- Opciones de despliegue: el runtime objetivo es el daemon de microduck con `robotctl`; el formato ONNX permite inferencia con ONNX Runtime, aunque no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI (herramientas no aplicables a este tipo de modelo).
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso), requisito impuesto por el bucle de control del robot; no se publican latencias medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck comparables ni datos numéricos de modelos alternativos de la misma categoría. Como referencia contextual, el autor menciona que la receta de entrenamiento es compartida por TheSauceman, pero no se aportan métricas para comparar.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Modelo de nicho: solo es aplicable al robot microduck con su configuración de 61 observaciones y 14 acciones; no es reutilizable en otros robots sin reentrenamiento.
- Sin datos de robustez: no se publican tasas de éxito, caídas ni comportamiento ante terrenos o perturbaciones distintas de las del entrenamiento.
- Reproducibilidad limitada: el propio autor advierte de que el entrenamiento con RL en GPU no es bit-reproducible; los pesos exactos no se pueden regenerar de forma determinista.
- Política perpetua: al no tener condición de parada interna, requiere supervisión externa para detener el robot.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por terceros.
- Sin información sobre sesgos, alucinación o capacidades lingüísticas: no aplica, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)

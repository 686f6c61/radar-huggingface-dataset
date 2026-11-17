# KAYT-SAVAV/h-jepa-hierarchical-world-model-planner-code-weights-paper-mit-261116

## Resumen

H-JEPA (Hierarchical Joint-Embedding Predictive Architecture) es un modelo de aprendizaje de modelos del mundo jerárquicos para planificación visual, presentado en el artículo "H-JEPA: End-to-End Learning of Hierarchical World Models for Visual Planning" por Wancong Zhang, Basile Terver, Michael Rabbat, Yann LeCun y Randall Balestriero (arXiv 2610.06805). El repositorio de Hugging Face analizado no es el lanzamiento oficial de los autores, sino una copia sin modificar publicada por el usuario KAYT-SAVAV como referencia para su propio trabajo de predicción de trayectorias de vehículos.

El modelo aprende una pila de modelos del mundo JEPA condicionados por acciones y planifica con ellos de arriba abajo: los niveles superiores operan sobre representaciones latentes más abstractas y los inferiores refinan el plan a mayor resolución espacio-temporal. Está entrenado y evaluado en entornos de control visual simulados (laberintos, Push-T, Cube y el corpus robótico DROID), no en conducción autónoma ni en dominios de audio.

La relevancia actual reside en su enfoque end-to-end para aprender representaciones predictivas jerárquicas sin reconstrucción pixel a pixel, alineado con la línea de investigación JEPA de Meta. El repositorio incluye código (169 archivos), pesos preentrenados (12,43 GB) y el PDF del artículo, todo bajo licencia MIT y con atribución completa a los autores originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA jerárquico: pila de modelos del mundo condicionados por acciones con planificación top-down (según el artículo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión y control, no de lenguaje) |
| Licencia | MIT (código y pesos); artículo CC BY 4.0 |
| Formato de pesos | no disponible (checkpoints preentrenados, 12,43 GB en total) |

## Arquitectura y entrenamiento

La arquitectura es un JEPA jerárquico: una pila de modelos del mundo que predicen en espacio latente y están condicionados por acciones, con planificación que desciende desde el nivel superior (representaciones más abstractas) hasta los niveles inferiores (predicciones más detalladas). El entrenamiento es end-to-end según el título del artículo. No se dispone en la información proporcionada del número de tokens, la composición exacta del dataset ni de si se aplicaron RLHF o DPO; al tratarse de un modelo de control visual, estos mecanismos de alineación de lenguaje probablemente no aplican, pero no se confirma.

Los checkpoints incluidos corresponden a cinco entornos: `ant`, `cube`, `droid`, `fourroom` y `pusht`. El dataset de los autores (124,73 GB, CC BY 4.0) contiene laberintos simulados, Push-T y una recodificación del corpus de brazo robótico DROID, y no se copia en este repositorio. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Predicción en espacio latente de estados futuros condicionada por acciones (modelo del mundo).
- Planificación jerárquica top-down: los niveles superiores guían a los inferiores para generar planes de acción.
- Control visual en entornos simulados de manipulación y navegación (Push-T, Cube, FourRoom, Ant, DROID).
- Aprendizaje de representaciones sin reconstrucción pixel a pixel (característica de la familia JEPA).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes conversacionales o razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingües: no disponibles (no es un modelo de lenguaje).
- Capacidades especiales (thinking mode, visión, audio): visión para control; audio no soportado según la model card.

## Casos de uso

- Planificación de manipulación robótica en simulación: usar los checkpoints `pusht` o `cube` para generar planes de acción a partir de observaciones visuales, aprovechando la jerarquía para descomponer tareas de contacto en subtareas de menor horizonte.
- Navegación en entornos tipo laberinto: el checkpoint `fourroom` permite evaluar planificación a largo plazo con representaciones latentes, útil como banco de pruebas de algoritmos de navegación antes de trasladarlos a robots reales.
- Investigación en modelos del mundo: servir de referencia reproducible (código y pesos MIT) para comparar arquitecturas JEPA jerárquicas frente a enfoques planos en tareas de control visual.
- Predicción de trayectorias de vehículos (uso declarado por el publicador): el repositorio se copió como referencia para predecir la posición futura de un vehículo propio, adaptando la pila jerárquica a un dominio de conducción que el modelo original no cubre.
- Evaluación de políticas sobre DROID: el checkpoint `droid` permite experimentar con planificación sobre un corpus de brazo robótico recodificado, útil para estudiar transferencia entre simulador y datos reales.
- Docencia y reproducción de resultados: al incluir el PDF del artículo y el código exacto en un commit concreto, facilita la replicación de experimentos en cursos o grupos de investigación.
- Base para fine-tuning en nuevos dominios visuales: la licencia MIT y la estructura modular del código permiten reentrenar la pila jerárquica sobre datasets propios de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los pesos ocupan 12,43 GB en total repartidos en cinco checkpoints, por lo que cada checkpoint individual requiere bastante menos, pero no se especifica la cifra exacta.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño de los checkpoints, se puede inferir que caben en GPUs con 16-24 GB de VRAM, pero es una estimación no confirmada.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos como RTX 4090 o RTX 3090, dado el tamaño de los checkpoints, aunque no se confirma.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de control visual, el despliegue sería mediante el código de los autores).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con I-JEPA, V-JEPA, DreamerV3 u otros modelos del mundo, ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio es una copia no oficial de los autores originales; para uso en producción conviene referenciar el repositorio oficial `jepa-world-models/h-jepa`.
- El modelo está entrenado en entornos simulados concretos (laberintos, Push-T, Cube, Ant, DROID); su generalización a otros dominios no está documentada.
- No cubre conducción autónoma ni audio, según la propia model card, pese a que el publicador lo usa como referencia para predicción de trayectorias de vehículos.
- No es un modelo de lenguaje: no dispone de capacidades multilingües, tool calling ni razonamiento conversacional.
- Riesgo de alucinación en el sentido de predicciones latentes incorrectas: los modelos del mundo pueden generar planes inviables si el estado observado se aleja de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles.
- Licencia MIT permite uso comercial, pero el artículo es CC BY 4.0 y exige atribución; el dataset de los autores no se incluye en este repositorio.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline definido: no hay evidencia de validación comunitaria.

## Enlaces

- Repositorio de Hugging Face analizado: https://huggingface.co/KAYT-SAVAV/h-jepa-hierarchical-world-model-planner-code-weights-paper-mit-261116
- Repositorio oficial de pesos: https://huggingface.co/jepa-world-models/h-jepa
- Dataset oficial: https://huggingface.co/datasets/jepa-world-models/h-jepa
- Código de los autores: https://github.com/kevinghst/H-JEPA
- Artículo: https://arxiv.org/abs/2610.06805v2
- Página del proyecto: https://h-jepa.com/

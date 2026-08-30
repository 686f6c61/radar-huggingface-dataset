# latency-sensitive-bench/humanoidbench

## Resumen

HumanoidBench GR00T es un modelo de control para robots humanoides desarrollado por el equipo de Latency Sensitive Bench, entrenado específicamente para las tareas del benchmark HumanoidBench. Se basa en el modelo fundacional nvidia/GR00T-N1.7-3B de NVIDIA y se especializa en la tarea de equilibrio simple (`balance_simple`), donde el robot debe mantener una postura estable usando información de estado de 198 dimensiones y una imagen RGB de cámara de cabeza de 256×256 píxeles.

El modelo publica un checkpoint completado de 10.000 pasos de optimización, junto con la configuración para un futuro checkpoint de 15.000 pasos que se entrenará con la misma receta pero con un horario extendido. La relevancia de este modelo radica en que ofrece un punto de partida reproducible para la investigación en control de robots humanoides, con una receta de entrenamiento claramente documentada y un bundle de inferencia listo para descargar.

El repositorio incluye los pesos en formato safetensors, la configuración del modelo y procesador, el mapeo de embodiment y las estadísticas necesarias para inferencia. No incluye el estado del optimizador DeepSpeed ni artefactos de W&B, lo que limita su uso a inferencia y no a reanudación de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en nvidia/GR00T-N1.7-3B (detalles especificos no disponibles) |
| Parametros totales | 3B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de control robotico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre el modelo base nvidia/GR00T-N1.7-3B de NVIDIA, un modelo fundacional para robótica humanoid. La arquitectura específica del modelo base no se detalla en la información proporcionada, pero GR00T-N1.7 es parte de la familia GR00T de NVIDIA, diseñada para tareas de manipulación y locomoción en robots humanoides.

El entrenamiento utiliza una receta formal denominada `g1_sonic_balance_simple`, con las siguientes características: entrada de estado de 198 dimensiones combinada con una imagen RGB de 256×256 de la cámara de cabeza; salida de acción absoluta de 43 dimensiones repetida 40 veces (H40). El entrenamiento emplea flujo de un solo paso (one-step flow), dropout en la cabeza de acción con valor 0, semilla gaussiana fija en 0, batch global de 128 y 250 pasos de calentamiento. El checkpoint publicado se entrenó durante 10.000 pasos de optimizador, mientras que el futuro checkpoint de 15.000 pasos usará la misma configuración con 15.000 pasos.

## Capacidades

- Control de equilibrio para robot humanoide: mantiene una postura estable usando observaciones de estado y visión.
- Integración de múltiples modalidades: combina entrada de estado proprioceptivo (198D) con visión RGB de cámara de cabeza.
- Generación de acciones absolutas repetidas en el tiempo (H40), lo que proporciona control suave y consistente.
- Inferencia directa: el bundle publicado soporta inferencia sin necesidad de reanudar el entrenamiento.
- Reproducibilidad: la receta de entrenamiento está completamente documentada, incluyendo semilla, dropout, batch size y pasos de calentamiento.
- Compatibilidad con el ecosistema GR00T: se integra con el framework Isaac-GR00T para descarga y despliegue.

## Casos de uso

- Investigación en control de robots humanoides: el modelo sirve como punto de partida para estudiar estrategias de equilibrio en entornos simulados, permitiendo a los investigadores comparar su rendimiento con otras aproximaciones.
- Desarrollo de políticas de locomoción: la tarea de equilibrio es fundamental para la locomoción bípeda; este modelo puede integrarse en pipelines de entrenamiento para tareas más complejas como caminar o correr.
- Evaluación de algoritmos de aprendizaje por refuerzo: al ser un modelo entrenado con flujo de un solo paso, puede usarse como baseline para comparar nuevas arquitecturas o algoritmos de control.
- Simulación de robots humanoides en entornos industriales: el modelo puede desplegarse en simulaciones de HumanoidBench para probar escenarios de manipulación y navegación en entornos de trabajo.
- Benchmarking de hardware robótico: dado que el modelo es ligero (3B parámetros), puede ejecutarse en GPUs de consumo para evaluar el rendimiento de diferentes plataformas robóticas en tareas de equilibrio.
- Educación y formación en robótica: el bundle de inferencia y la documentación detallada lo convierten en un recurso didáctico para cursos de robótica y control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está diseñado para las tareas de HumanoidBench, pero no se proporcionan métricas específicas de rendimiento (como tasas de éxito o recompensas) en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, un modelo de 3B parámetros en FP16 requiere aproximadamente 6 GB de VRAM, pero esto es una estimación orientativa.
- GPU recomendadas: no especificadas. Dado el tamaño del modelo (3B), una GPU con al menos 8-12 GB de VRAM sería suficiente para inferencia.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño del modelo. Tarjetas como RTX 3090, RTX 4090 o superiores serían adecuadas.
- Opciones de despliegue: el modelo se integra con el ecosistema Isaac-GR00T de NVIDIA. Se puede descargar mediante la CLI de HuggingFace (`hf download`). No se mencionan opciones como vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| latency-sensitive-bench/humanoidbench | 3B | no aplicable | Equilibrio humanoid (HumanoidBench) | no disponible |
| nvidia/GR00T-N1.7-3B | 3B | no aplicable | Robotica humanoid general | no disponible |
| Otros modelos de HumanoidBench | no disponible | no aplicable | Locomocion y manipulacion | no disponible |

La comparativa es limitada porque no se dispone de información sobre modelos comparables entrenados específicamente para HumanoidBench. El modelo base GR00T-N1.7-3B es la referencia más cercana, pero no hay datos públicos sobre alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de control robótico, los riesgos de alucinación son diferentes a los de los modelos de lenguaje; sin embargo, podría producir acciones incorrectas si las observaciones difieren significativamente del dominio de entrenamiento.
- Dominio limitado: el modelo está entrenado específicamente para la tarea `balance_simple` y puede no generalizar a otras tareas de HumanoidBench sin fine-tuning adicional.
- Restricciones de licencia: la licencia no está disponible, lo que limita el uso comercial sin una verificación legal previa.
- Inferencia limitada: el bundle publicado no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el checkpoint.
- Dependencia del ecosistema GR00T: para desplegar el modelo correctamente, se requiere el framework Isaac-GR00T, lo que añade una dependencia externa.
- Observaciones de entrada específicas: el modelo espera exactamente 198 dimensiones de estado y una imagen de 256×256; cualquier cambio en la configuración del robot o de los sensores requerirá reentrenamiento.
- Estado del checkpoint futuro: el checkpoint de 15.000 pasos aún no se ha entrenado ni publicado, por lo que la información sobre su rendimiento no está disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/latency-sensitive-bench/humanoidbench
- Paper de HumanoidBench (arXiv v2): https://arxiv.org/html/2403.10506v2
- Paper de HumanoidBench (arXiv v1): https://arxiv.org/html/2403.10506v1
- Sitio web de HumanoidBench: https://humanoid-bench.github.io/
- Perfil de Latency Sensitive Bench en HuggingFace: https://huggingface.co/latency-sensitive-bench/datasets
- Modelo base nvidia/GR00T-N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B

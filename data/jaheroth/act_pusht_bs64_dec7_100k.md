# jaheroth/act_pusht_bs64_dec7_100k

## Resumen

El modelo `jaheroth/act_pusht_bs64_dec7_100k` es una política neuronal para control robótico, entrenada con la arquitectura ACT (Action Chunking with Transformers) sobre el entorno de simulación PushT. Ha sido desarrollado por JaHeRoth como parte de un bloque de entrenamiento de seis semanas en aprendizaje robótico, y se distribuye bajo licencia Apache-2.0 a través de Hugging Face. El modelo está diseñado para resolver la tarea de empujar un objeto (un disco) hasta una posición objetivo en un espacio 2D, un benchmark estándar en aprendizaje por imitación.

Con aproximadamente 84 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto que puede ejecutarse en hardware de gama media. La model card indica que es la "receta campeona ajustada" a 100.000 pasos de entrenamiento, logrando una recompensa media imputada de 154,4 y una tasa de éxito del 56,4% en 5.000 evaluaciones. Se integra con la librería LeRobot, lo que facilita su uso en pipelines de robótica.

La relevancia de este modelo radica en su carácter de referencia dentro del ecosistema LeRobot: sirve como punto de comparación para experimentos de aprendizaje por imitación en PushT, y su publicación permite reproducir y extender los resultados del entrenamiento de políticas ACT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. En lugar de predecir una única acción por paso, el modelo genera un "chunk" o secuencia de acciones futuras (en este caso, 16 pasos de acción según la evaluación), lo que reduce la acumulación de errores y mejora la estabilidad del control. El modelo utiliza un codificador de visión para procesar observaciones del entorno y un decodificador autoregresivo para emitir las acciones.

El entrenamiento se realizó sobre el entorno gym-pusht, un benchmark 2D donde un brazo robótico debe empujar un disco hasta una zona objetivo. La model card indica que se trata de la "receta campeona" a 100.000 pasos, con un tamaño de lote de 64 (bs64) y una arquitectura con 7 capas de decodificador (dec7). No se especifican detalles adicionales sobre el dataset, el número de tokens o el uso de RLHF/DPO, ya que es un modelo de control y no de lenguaje.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) para manipulación en entornos simulados.
- Tarea PushT: empuja un objeto hasta una posición objetivo en un espacio 2D, con una tasa de éxito del 56,4% en evaluación.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, lo que permite cargar y ejecutar el modelo con herramientas estándar.
- Inferencia ligera: al tener solo 84M de parámetros, es adecuado para despliegue en tiempo real en hardware modesto.
- Reproducibilidad: al ser una receta publicada, sirve como punto de referencia para comparar variaciones de entrenamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como baseline para comparar nuevas arquitecturas o técnicas de entrenamiento en la tarea PushT, gracias a su configuración documentada y resultados reproducibles.
- Desarrollo de políticas de manipulación en simulación: puede integrarse en pipelines de simulación para probar algoritmos de control antes de transferirlos a robots reales.
- Evaluación de algoritmos de aprendizaje por refuerzo: al ser una política entrenada por imitación, puede usarse como referencia para medir la mejora de métodos de RL en el mismo entorno.
- Generación de datos para entrenamiento: el modelo puede desplegarse en el entorno simulado para recopilar trayectorias de demostración adicionales, útiles para entrenar otros modelos.
- Pruebas de integración de LeRobot: sirve como ejemplo funcional para validar la instalación y el flujo de trabajo de la librería LeRobot en proyectos de robótica.
- Benchmarking de hardware: al ser un modelo pequeño, puede utilizarse para medir la latencia de inferencia en diferentes GPUs o dispositivos embebidos, estableciendo una línea base para modelos más grandes.

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado en gym-pusht con `n_action_steps=16`. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| avg_sum_imputed_reward | 154,4 |
| Tasa de exito (n=5000) | 56,4% |

La recompensa imputada asigna 0,95 por paso hasta el horizonte de 300 tras alcanzar el éxito. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño de 84M de parámetros, se estima que la inferencia requiere menos de 1 GB de VRAM en FP32, pero no hay datos confirmados.
- GPU recomendadas: no se especifican. Por su tamaño, cualquier GPU moderna con al menos 2 GB de VRAM debería ser suficiente, incluyendo tarjetas de consumo como la GTX 1650 o superiores.
- Compatibilidad con consumer GPU: sí, al ser un modelo pequeño, es viable en GPUs de gama baja y media.
- Opciones de despliegue: al estar integrado con LeRobot, puede ejecutarse mediante los scripts de evaluación de la librería. También es posible exportar los pesos a otros formatos (p.ej., ONNX) para inferencia en tiempo real, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles. Se espera una latencia baja (del orden de milisegundos) en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen variantes del mismo autor (`jaheroth/act_pusht_bs64_dec7` y `jaheroth/act_pusht_bs64_dec7_200k`) que probablemente difieren en el número de pasos de entrenamiento, pero no se ofrecen datos de rendimiento para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entorno específico: el modelo está entrenado exclusivamente para la tarea PushT en simulación; no es transferible directamente a otras tareas o entornos sin reentrenamiento.
- Rendimiento limitado: con un 56,4% de éxito, no es una política perfecta; en aplicaciones críticas se requeriría un ajuste adicional o un mecanismo de corrección.
- Sin capacidades lingüísticas: al ser un modelo de control, no procesa texto ni mantiene diálogos; su uso se limita a la generación de acciones.
- Sesgos y alucinaciones: no aplican en el sentido tradicional de los modelos de lenguaje, pero la política puede fallar en estados no vistos durante el entrenamiento, produciendo acciones erróneas.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Reproducibilidad: aunque la receta está documentada, no se detallan los hiperparámetros completos ni la composición exacta del dataset, lo que puede dificultar la reproducción exacta de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_bs64_dec7_100k
- Repositorio de entrenamiento (robot-learning): https://github.com/JaHeRoth/robot-learning
- Variante a 200k pasos: https://huggingface.co/jaheroth/act_pusht_bs64_dec7_200k
- Variante sin sufijo de pasos: https://huggingface.co/jaheroth/act_pusht_bs64_dec7

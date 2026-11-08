# arunos728/pi05-rby1-flip-plastic-bag

## Resumen

pi05-rby1-flip-plastic-bag es una política de vision-language-action (VLA) basada en el modelo pi-0.5 (pi05) de Physical Intelligence, afinada por el usuario arunos728 para una única tarea de manipulación bimanual sobre el robot móvil RB-Y1: dar la vuelta a una bolsa de plástico. El modelo combina percepción visual (dos cámaras ego montadas) con instrucciones en lenguaje natural y genera comandos de acción de 54 dimensiones (posiciones absolutas de articulaciones en radianes) para dos brazos de 7 grados de libertad y dos manos de 20 grados de libertad cada una.

Técnicamente es una política de flow-matching entrenada con la ruta PyTorch de openpi, el framework de Physical Intelligence. Parte del checkpoint pi05_base y reemplaza las proyecciones de estado y acción para adaptarse a un esquema de 54 dimensiones en lugar de las 32 por defecto de openpi. El resultado es un checkpoint de inferencia de 3.616.802.598 parámetros (aproximadamente 3,6 mil millones) y 7,5 GB en formato safetensors.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de cómo adaptar un modelo fundacional de robótica a un robot concreto y a una tarea concreta con solo 50 episodios de teleoperación (60.797 fotogramas a 30 fps), y como artefacto desplegable para evaluación en el RB-Y1. No es un modelo de propósito general: está entrenado para una sola instrucción y una sola encarnación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con flow-matching, derivada de pi-0.5 (pi05_base) |
| Parámetros totales | 3.616.802.598 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors sin cuantizar) |
| Idiomas soportados | no disponible (la instrucción de tarea es una única frase en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), más metadata.pt y norm_stats.json |
| Librería | openpi |
| Pipeline | robotics |
| Tamaño del repo | 7,5 GB |
| Robot | RB-Y1 móvil, configuración rby1m_wujihand2 (dos brazos de 7 DoF, dos manos de 20 DoF) |
| Cámaras | ego_left, ego_right |
| Dimensión de estado/acción | 54 |
| Horizonte de acción | 30 pasos (1,0 s a 30 fps) |
| Pérdida final de entrenamiento | 0,00281 |

## Arquitectura y entrenamiento

La arquitectura es la de pi-0.5: una política VLA de flow-matching que combina un backbone visión-lenguaje con cabezas de proyección de estado y acción. En este afinamiento se hereda el backbone de pi05_base y se reinicializan `action_in_proj`, `action_out_proj` y `state_proj` para acomodar `action_dim = 54` en lugar del valor por defecto de 32 de openpi. El esquema de 54 dimensiones se descompone en articulaciones del brazo derecho (0:7), mano derecha (7:27), brazo izquierdo (27:34) y mano izquierda (34:54), con valores de posición absoluta en radianes. La grabación original de teleoperación tenía 66 dimensiones; se descartaron base móvil, torso y cabeza porque su rango total en todo el corpus era inferior a 1e-3 rad.

El entrenamiento se realizó sobre 50 episodios y 60.797 fotogramas a 30 fps en formato LeRobot v2.1, con 100 vídeos (2 cámaras por episodio). La instrucción se toma del campo de tarea del dataset (`prompt_from_task=True`) y es idéntica en todos los episodios. Se usaron 4 GPU NVIDIA H100 de 80 GB, batch total de 32, 30.000 pasos, optimizador AdamW con recorte de norma de gradiente 1.0, schedule coseno con 1.000 pasos de warmup, LR pico 5e-5 y final 5e-6, EMA desactivada y aproximadamente 8 horas de reloj. No se incluye `optimizer.pt`, por lo que el checkpoint es solo de inferencia y no reanudable para entrenamiento.

## Capacidades

- Generación de acciones de manipulación bimanual de 54 dimensiones a partir de observaciones visuales y una instrucción textual.
- Percepción visual mediante dos cámaras ego (ego_left, ego_right).
- Condicionamiento por lenguaje natural: acepta la instrucción "Flip the plastic bag over." como prompt.
- Control de dos brazos de 7 DoF y dos manos de 20 DoF (configuración rby1m_wujihand2).
- Predicción de chunks de acción de 30 pasos (1,0 s a 30 fps) por inferencia.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking; es una política robótica de tarea única.
- Capacidades multilingües: no disponibles; la única instrucción entrenada está en inglés.

## Casos de uso

- Evaluación de políticas VLA en el robot RB-Y1: cargar el checkpoint con `policy_config.create_trained_policy` y ejecutar `policy.infer` con las observaciones de las dos cámaras ego y el estado de 54 dimensiones para validar el comportamiento de giro de la bolsa en un banco de pruebas.
- Reproducción de un pipeline de afinamiento con openpi: servir como referencia de cómo adaptar pi05_base a un `action_dim` distinto de 32 reinicializando las proyecciones de estado y acción.
- Benchmark interno de manipulación bimanual: usar la tarea de girar la bolsa como prueba controlada para comparar políticas afinadas sobre el mismo robot y la misma configuración de cámaras.
- Docencia e investigación en robótica: ejemplo de entrenamiento con 50 episodios y 60.797 fotogramas que ilustra el coste (4×H100, 30.000 pasos, ~8 h) de adaptar un modelo fundacional a una tarea concreta.
- Recolección de datos y validación de formato LeRobot v2.1: el repo incluye `norm_stats.json`, necesario en inferencia, lo que permite verificar pipelines de normalización de estado y acción.
- Despliegue en laboratorio con el robot físico: integración en el stack de control del RB-Y1 para ejecutar la política en tiempo real a 30 fps con chunks de 30 pasos, siempre que se respete la configuración fija de cámaras.
- Base para futuros afinamientos: aunque no incluye `optimizer.pt`, los pesos pueden servir de inicialización para nuevas tareas sobre la misma encarnación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (0,00281) y no incluye métricas de evaluación en robot real ni tasas de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.616.802.598 parámetros en safetensors (probablemente fp32 o bf16), el peso del modelo ronda los 7,2-14,5 GB según precisión, más overhead de activaciones y de las dos cámaras.
- GPU de entrenamiento usadas: 4× NVIDIA H100 80 GB (batch total 32, 30.000 pasos, ~8 h).
- GPU recomendadas para inferencia: no disponible en la información; por tamaño, una GPU con al menos 16-24 GB de VRAM sería el mínimo razonable, aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. Por el número de parámetros podría caber en una RTX 4090 (24 GB) en bf16, pero no hay datos oficiales.
- Opciones de despliegue: openpi (ruta PyTorch) con `policy_config.create_trained_policy`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El horizonte de acción es de 30 pasos a 30 fps (1,0 s), pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Encarnación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-rby1-flip-plastic-bag (este) | 3.616.802.598 | Tarea única: girar bolsa de plástico | RB-Y1 (rby1m_wujihand2), 54-D | Apache 2.0 | Hugging Face, solo inferencia |
| arunos728/pi05-rby1-assemble-tissue | ~4B (según resultado de búsqueda) | Tarea única: montar pañuelo | RB-Y1 (presumiblemente) | no disponible | Hugging Face |
| noahnowac/pi05-nero-bag-box-v2 | no disponible | Manipulación de bolsa y caja | Nero (presumiblemente) | no disponible | Hugging Face, sin model card |

Los tres son afinamientos de pi05 sobre tareas concretas de manipulación; la comparación de rendimiento no es posible porque ninguno publica métricas de evaluación en robot real en la información disponible.

## Limitaciones y advertencias

- Tarea única: entrenado solo con la instrucción "Flip the plastic bag over."; no generaliza a otros prompts.
- Encarnación única: el esquema de 54 dimensiones es específico de rby1m_wujihand2; las dimensiones descartadas (base móvil, torso, cabeza) no pueden comandarse.
- Punto de vista fijo: ambas cámaras están montadas en configuración ego y la política nunca ha visto otra colocación.
- Sin métricas de evaluación en robot real: la pérdida reportada (0,00281) es de entrenamiento, no de éxito en tarea.
- `norm_stats.json` es obligatorio en inferencia; servir la política sin él produce acciones silenciosamente incorrectas.
- No incluye `optimizer.pt`: no se puede reanudar el entrenamiento desde este checkpoint.
- Sesgos conocidos: no disponibles; al ser un modelo de robótica de tarea única, el riesgo principal es la falta de generalización, no sesgos sociales documentados.
- Riesgo de alucinación: no aplica en el sentido de texto generativo, pero sí existe riesgo de acciones incorrectas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende de pi05_base y de openpi, cuyas condiciones deben verificarse por separado.
- Solo 50 episodios de entrenamiento, lo que limita la robustez ante variaciones de iluminación, posición de la bolsa o del robot.

## Enlaces

- Hugging Face: https://huggingface.co/arunos728/pi05-rby1-flip-plastic-bag
- openpi (GitHub): https://github.com/Physical-Intelligence/openpi
- Modelo comparable: https://huggingface.co/arunos728/pi05-rby1-assemble-tissue
- Modelo comparable: https://huggingface.co/noahnowac/pi05-nero-bag-box-v2

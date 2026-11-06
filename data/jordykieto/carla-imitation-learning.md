# jordykieto/carla-imitation-learning

## Resumen

`carla-imitation-learning` es una política de conducción autónoma compacta entrenada mediante clonación de comportamiento (behavioral cloning) sobre demostraciones del piloto automático de CARLA, el simulador de conducción urbana de código abierto. Lo desarrolla Jordy Kieto y se distribuye a través de Hugging Face con dos formatos de pesos: Keras nativo (`policy.keras`) y ONNX (`policy.onnx`), con una diferencia máxima de salida entre ambos de aproximadamente 3e-7. El modelo resuelve el problema de mapear observaciones multimodales (cámara RGB, LiDAR en vista cenital, telemetría y waypoints de ruta) a comandos de control continuos (acelerador, freno y dirección) a 20 Hz en modo síncrono de CARLA.

La arquitectura combina codificadores por paso temporal (CNN para visión y LiDAR, MLP para telemetría y waypoints) con dos bloques Transformer que modelan la secuencia temporal de 5 fotogramas. Con 1.358.211 parámetros, es un modelo deliberadamente pequeño orientado a inferencia de baja latencia en el bucle de control, no a razonamiento general. Su relevancia radica en ser un ejemplo reproducible y auditado de pipeline completo de imitation learning para conducción autónoma en simulación, con código, paper y muestra de datos publicados.

No es un modelo de lenguaje ni un modelo fundacional: es una política de control específica de dominio, validada únicamente dentro de CARLA y sobre los mapas Town01/Town02. Cualquier evaluación fuera de ese entorno carece de soporte en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificadores por paso temporal (CNN para visión y LiDAR, MLP para telemetría y waypoints) + 2 bloques Transformer sobre la dimensión temporal |
| Parametros totales | 1.358.211 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 fotogramas de historia por observación (ventana temporal fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de control, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `policy.keras` (Keras) y `policy.onnx` (ONNX) |
| Entradas | `vision (5,96,96,3)` RGB normalizado /255, `lidar (5,64,64,1)` histograma BEV, `telemetry (5,5)`, `waypoints (5,25,3)` |
| Salidas | `controls (3,)` = throttle, brake, steer (clip a [0,1], [0,1], [-1,1]) |
| Frecuencia de control | 20 Hz (modo síncrono de CARLA) |
| Datos de entrenamiento | 236.882 ventanas (≈3,3 h) de 448 grabaciones de autopilot en Town01/Town02 |
| Checkpoint liberado | ejecución `barzksni`, época 10 |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La red procesa cada fotograma de forma independiente mediante codificadores especializados por modalidad: una CNN para la imagen RGB de 96×96 y para el histograma LiDAR en vista cenital de 64×64, y un MLP para el vector de telemetría de 5 dimensiones y para los waypoints de ruta (25 puntos × 3 coordenadas). Las representaciones resultantes se apilan en una secuencia de 5 pasos temporales que atraviesa dos bloques Transformer, lo que permite al modelo integrar información de movimiento y contexto reciente antes de emitir los tres comandos de control. La salida se recorta explícitamente a los rangos físicos de cada actuador.

El entrenamiento es clonación de comportamiento supervisada sobre 236.882 ventanas (aproximadamente 3,3 horas de conducción) extraídas de 448 grabaciones del piloto automático en los mapas Town01 y Town02. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por refuerzo; tampoco se detalla la composición exacta del dataset más allá de los mapas y la duración. La validación es un hold-out temporal dentro de las propias grabaciones de entrenamiento, no rutas ni mapas retenidos, lo que constituye una limitación metodológica explícitamente declarada por el autor.

## Capacidades

- Generación de comandos de control continuos de conducción: acelerador, freno y dirección a 20 Hz.
- Fusión multimodal de cámara RGB, LiDAR en vista cenital, telemetría y waypoints de ruta.
- Modelado temporal de corto alcance mediante 2 bloques Transformer sobre 5 fotogramas de historia.
- Conducción en bucle cerrado dentro del simulador CARLA 0.9.16 (mapas Town01 y Town02).
- Exportación a ONNX con paridad numérica prácticamente exacta respecto a Keras (≈3e-7 de diferencia máxima).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad fuera del dominio de control de vehículo en CARLA.

## Casos de uso

- Investigación en imitation learning: servir como línea base reproducible para comparar variantes de arquitectura (CNN+Transformer frente a alternativas) en tareas de conducción en simulador, gracias a que el código, el paper y una muestra de datos están publicados.
- Desarrollo de pipelines de conducción autónoma en simulación: integrar `policy.onnx` mediante ONNX Runtime en un bucle de control a 20 Hz dentro de CARLA para prototipar perceptores, planificadores o sistemas de seguridad que consuman los comandos del modelo.
- Evaluación de robustez y análisis de fallos: al ser un modelo pequeño y auditable, permite estudiar cómo degrada su comportamiento ante condiciones no vistas (otras rutas, presencia de tráfico) y documentar los modos de fallo.
- Docencia y formación técnica: ejemplo completo y de bajo coste computacional de un pipeline extremo a extremo desde sensores hasta actuadores, adecuado para cursos de aprendizaje por imitación y robótica.
- Benchmarking de exportación y despliegue: comparar latencia y fidelidad numérica entre la ejecución nativa en Keras y la inferencia en ONNX Runtime en distintas plataformas.
- Pruebas de integración de sensores virtuales: validar definiciones de rig de sensores, escalado de telemetría y formato de waypoints contra una política ya entrenada antes de entrenar modelos propios.
- Base para fine-tuning o destilación: punto de partida para experimentos de adaptación a nuevos mapas o condiciones, siempre dentro del simulador y asumiendo la necesidad de generar datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la diferencia máxima de salida entre la implementación Keras y la ONNX (≈3e-7), que es una métrica de paridad de exportación, no de rendimiento de conducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.358.211 parámetros y entradas de 5×96×96×3 y 5×64×64×1, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer moderna (el peso en FP32 rondaría los 5,4 MB, cálculo derivado del número de parámetros).
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con soporte para ONNX Runtime o TensorFlow/Keras es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros y el tamaño de las entradas.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor en el ejemplo de uso), Keras/TensorFlow para el formato nativo, y el script `drive.py` del repositorio de GitHub para conducción en CARLA 0.9.16. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; el único requisito temporal documentado es sostener el bucle de control a 20 Hz en modo síncrono de CARLA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| carla-imitation-learning (jordykieto) | 1.358.211 | 5 fotogramas multimodales (visión, LiDAR, telemetría, waypoints) | Control de conducción en CARLA | no disponible | Hugging Face (Keras + ONNX) y GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos de la misma categoría (políticas de imitation learning para CARLA) con datos verificables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La validación es un hold-out temporal dentro de las propias grabaciones de entrenamiento, no rutas ni mapas retenidos; el rendimiento en generalización a entornos nuevos no está medido.
- Los waypoints de ruta provienen de información privilegiada del mapa HD (HD-map), lo que introduce una dependencia de datos no disponibles en un vehículo real.
- Las demostraciones no contienen otros vehículos ni peatones, por lo que el modelo no ha sido expuesto a escenarios de tráfico interactivo.
- Solo se ha entrenado y probado en los mapas Town01 y Town02 de CARLA; no hay evidencia de funcionamiento en otros mapas ni en el mundo real.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero existe riesgo de comandos de control erróneos o inseguros ante observaciones fuera de distribución.
- Licencia no disponible: no puede asumirse permiso para uso comercial sin consultar al autor.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgo hacia las condiciones de iluminación, tráfico y trazado presentes en las 448 grabaciones.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni agentes.
- El repositorio de Hugging Face figura con 0 descargas y 0 likes, sin pipeline declarado ni idiomas, lo que sugiere un modelo de nicho con escasa validación externa.
- El autor remite a `paper/CLAIMS.md` para distinguir lo medido de lo observado; conviene consultarlo antes de extraer conclusiones sobre capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jordykieto/carla-imitation-learning
- Repositorio GitHub (código, paper y muestra de datos): https://github.com/JordyKieto/carla-imitation-learning
- GIF de conducción: https://raw.githubusercontent.com/JordyKieto/carla-imitation-learning/main/assets/driving.gif
- Auditoría de afirmaciones del paper: https://github.com/JordyKieto/carla-imitation-learning/blob/main/paper/CLAIMS.md
- Citación (BibTeX): Kieto, Jordy. *Imitation Learning for Autonomous Driving in CARLA*. Technical Report, 2026. https://github.com/JordyKieto/carla-imitation-learning

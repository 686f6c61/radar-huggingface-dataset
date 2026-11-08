# arunos728/pi05-rby1-assemble-tissue

## Resumen

pi05-rby1-assemble-tissue es un checkpoint de política visión-lenguaje-acción (VLA) basado en el modelo pi-0.5 de Physical Intelligence, ajustado por el usuario arunos728 sobre teleoperación bimanual del manipulador móvil RB-Y1 de Rainbow Robotics. Resuelve una única tarea concreta de manipulación: colocar un rollo de papel sobre un soporte. La relevancia de este checkpoint es acotada: sirve como ejemplo de referencia de cómo adaptar un modelo fundacional de robótica a un embodiment concreto mediante el framework openpi, más que como modelo de propósito general.

El modelo parte de `pi05_base` y se ajusta con el camino PyTorch de openpi sobre un corpus de 50 episodios y 35.613 fotogramas a 30 fps, con dos cámaras egocéntricas. La arquitectura es la de pi-0.5, un transformer de flow matching que combina un backbone visión-lenguaje con un cabezal de acciones; el checkpoint publicado tiene 3.616.802.598 parámetros y un tamaño de repositorio de 7,5 GB.

El ajuste modifica la dimensionalidad del espacio de acciones: de los 32 por defecto de openpi a 54 dimensiones específicas del robot RB-Y1, lo que obliga a reinicializar las proyecciones de entrada y salida de acciones y de estado. El repositorio contiene únicamente pesos de inferencia, sin estado del optimizador, por lo que no puede reanudarse para entrenamiento posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching (política visión-lenguaje-acción pi-0.5) |
| Parametros totales | 3.616.802.598 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucción en inglés, tarea única) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `metadata.pt` y `norm_stats.json` |

## Arquitectura y entrenamiento

El modelo hereda el backbone de `pi05_base`, convertido desde `gs://openpi-assets/checkpoints/pi05_base`. Se trata de una política de flow matching que combina percepción visual y comprensión de la instrucción en lenguaje natural con la generación de secuencias de acciones. El horizonte de acción es de 30 pasos, equivalentes a 1,0 segundo a 30 fps. El estado y la acción tienen 54 dimensiones cada uno: articulaciones del brazo derecho (0:7), mano derecha (7:27), brazo izquierdo (27:34) y mano izquierda (34:54). El robot es un RB-Y1 con configuración `rby1m_wujihand2` (dos brazos de 7 grados de libertad y dos manos de 20 grados de libertad).

El ajuste fino se realizó sobre 4 GPU NVIDIA H100 de 80 GB durante aproximadamente 8 horas, con batch total de 32, 30.000 pasos, optimizador AdamW con recorte de norma de gradiente 1.0, programación de learning rate coseno con 1.000 pasos de warmup, pico de 5e-5 y valor final de 5e-6, y EMA desactivada. La pérdida final de entrenamiento fue 0,00345. Como `action_dim` pasa de 32 a 54, se reinicializaron `action_in_proj`, `action_out_proj` y `state_proj` al inicio del ajuste. Los datos provienen de 50 episodios, 35.613 fotogramas y 100 vídeos (dos cámaras por episodio) en formato LeRobot v2.1, con una instrucción única extraída del campo `task` del dataset (`prompt_from_task=True`). Las dimensiones de base móvil, torso y cabeza se descartaron porque su rango total en el corpus es inferior a 1e-3 rad.

## Capacidades

- Generación de trayectorias de acción de 54 dimensiones para manipulación bimanual con el RB-Y1.
- Condicionamiento por instrucción en lenguaje natural, aunque en la práctica limitado a la frase "Put the tissue roll onto the holder."
- Percepción visual a partir de dos cámaras egocéntricas (`ego_left` y `ego_right`).
- Predicción de chunks de 30 acciones (1,0 s a 30 fps) en una sola inferencia.
- Control de dos brazos de 7 grados de libertad y dos manos de 20 grados de libertad.
- No soporta tool calling ni function calling.
- No dispone de razonamiento multi-paso ni modo thinking explícito.
- No tiene capacidades multilingües declaradas.

## Casos de uso

- Evaluación de referencia de pi-0.5 en un embodiment bimanual: permite reproducir el pipeline de inferencia de openpi con un robot RB-Y1 real o simulado y comparar la pérdida de entrenamiento reportada con la ejecución efectiva.
- Base para ajuste fino en nuevas tareas del mismo robot: al compartir el esquema de 54 dimensiones, puede servir como inicialización para otras tareas de manipulación con `rby1m_wujihand2`, aunque el repositorio no incluye estado del optimizador.
- Pruebas de integración del SDK de Rainbow Robotics: el esquema de articulaciones documentado (brazos y manos) encaja con los ejemplos Python del SDK de RB-Y1 para validar el envío de comandos de posición absoluta en radianes.
- Docencia e investigación en políticas VLA: el corpus pequeño (50 episodios) y la tarea única lo hacen útil para estudiar el efecto del cambio de dimensionalidad de acciones en el ajuste de un modelo fundacional.
- Validación de normalización en producción: el uso de `norm_stats.json` como artefacto obligatorio permite probar pipelines de servicio que detecten la ausencia de estadísticas y eviten acciones silenciosamente incorrectas.
- Replicación de experimentos de flow matching en robótica: la configuración de entrenamiento documentada (batch, pasos, LR, hardware) permite reproducir el ajuste con openpi en un clúster de 4 GPU H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,00345) y no incluye métricas de éxito en robot real ni en simulación.

## Requisitos de hardware

- El entrenamiento se realizó en 4 GPU NVIDIA H100 de 80 GB; no se documenta el requisito mínimo de VRAM para inferencia.
- El checkpoint pesa 7,5 GB en el repositorio, lo que sugiere que la inferencia en precisión nativa requiere al menos aproximadamente 8-16 GB de VRAM, aunque este dato no está confirmado en la información disponible.
- No se indica compatibilidad con GPU de consumo (RTX 4090, RTX 3090 u otras); no disponible.
- El despliegue se realiza a través de la librería openpi (`policy_config.create_trained_policy`), no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-rby1-assemble-tissue | 3.616.802.598 | no disponible | Tarea única de manipulación bimanual RB-Y1 | Apache 2.0 | Hugging Face (openpi) |
| pi05_base (openpi) | no disponible | no disponible | Política VLA fundacional, múltiples embodiments | no disponible en la información proporcionada | Checkpoint `gs://openpi-assets/checkpoints/pi05_base` |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Tarea única: entrenado con una sola instrucción; no generaliza a otros prompts.
- Embodiment único: el esquema de 54 dimensiones es específico de `rby1m_wujihand2`; no puede comandar base móvil, torso ni cabeza porque esas dimensiones se descartaron.
- Punto de vista fijo: ambas cámaras están montadas en configuración egocéntrica y la política nunca ha visto otra colocación.
- Sin métricas de evaluación en robot real: la pérdida reportada es de entrenamiento, no de éxito en ejecución.
- Sin estado del optimizador (`optimizer.pt` no incluido): no puede reanudarse el entrenamiento desde este checkpoint.
- Dependencia crítica de `norm_stats.json`: servir la política sin ese fichero produce acciones silenciosamente incorrectas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación real desaconseja su despliegue en producción sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/arunos728/pi05-rby1-assemble-tissue
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Documentación RB-Y1: https://rainbowrobotics.github.io/rby1-dev/
- Ejemplos Python del SDK RB-Y1: https://rainbowrobotics.github.io/rby1-dev/examples/python_ex.html

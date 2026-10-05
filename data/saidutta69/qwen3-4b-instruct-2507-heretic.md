# saidutta69/Qwen3-4B-Instruct-2507-heretic

## Resumen

Qwen3-4B-Instruct-2507-heretic es una variante "decensored" (también llamada abliterated) del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por el usuario saidutta69 en HuggingFace. El modelo base es un transformer causal de 4.022 millones de parámetros desarrollado por el equipo Qwen (Alibaba), perteneciente a la familia Qwen3 en su variante no-thinking, con una ventana de contexto nativa de 262.144 tokens. La modificación consiste en la eliminación de la capa de rechazo (refusals) mediante la técnica de abliteration implementada con la herramienta Heretic v1.4.0, que actúa sobre las proyecciones de atención y MLP para reducir la tendencia del modelo a negarse a responder determinadas peticiones.

El problema que resuelve esta variante es la restricción de comportamiento del modelo original, que rechaza el 100% de las peticiones de la batería de prueba empleada, frente al 3% de la versión heretic. El coste de esta modificación se mide con una divergencia KL de 0.0958 respecto al modelo original, lo que indica una alteración moderada de la distribución de salida. Es relevante para desarrolladores que necesitan un modelo de 4B sin filtros de contenido para investigación sobre alineación, generación creativa sin restricciones o tareas donde los rechazos resultan contraproducentes, siempre asumiendo las implicaciones éticas y legales de desplegar un modelo sin censura.

La arquitectura subyacente es un transformer causal estándar de 36 capas con Grouped Query Attention (32 cabezas de consulta y 8 de clave/valor), 3.6B parámetros no-embedding, entrenado en modo no-thinking (no genera bloques `

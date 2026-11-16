# netprojects/Laplace-1-Vector-MLX-4bit

## Resumen

Laplace-1-Vector-MLX-4bit es una conversión al formato MLX (Apple Silicon) del modelo JuneoAI/Laplace-1-Vector, un modelo de decisión de 4B parámetros desarrollado por Juneo Lab sobre la base Spark-X2.6-4B. Su particularidad es que no está pensado para generar texto libre, sino para puntuar candidatos: recibe un estado, una pregunta y un conjunto de opciones, y devuelve una probabilidad para cada una en un único forward pass. Resulta relevante porque permite integrar decisiones (asignación de tareas, control de permisos, validación de resultados, política de actuación) directamente en el flujo de un agente local, sin enviar datos a la nube.

Esta build concreta, publicada por NetProjects (Internet Projects Ltd), cuantiza las capas lineales a 4 bits (afín, grupo 64) y mantiene la puerta de salida de atención en bf16, con un tamaño de 2,3 GB. Está diseñada para ejecutarse en un Mac junto al agente, de modo que la información sensible permanezca en la máquina. No tiene relación con Juneo Lab ni con XHToken.

El modelo base cuenta con 4.112.079.360 parámetros reales según los safetensors. La familia Laplace-1 incluye también un miembro de 27B (Laplace-1-Atlas). Esta variante de 4 bits es la opción más pequeña de la familia Vector y está pensada para escenarios donde el espacio en disco y la memoria son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `spark2_5`, soportada nativamente por mlx-lm >= 0.32) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (afín, grupo 64) en capas lineales; puerta de salida de atención en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4B parámetros construido sobre Spark-X2.6-4B, orientado a la toma de decisiones en lugar de la generación de texto. La conversión a MLX mantiene la arquitectura `spark2_5`, que mlx-lm 0.32 y superiores soportan de forma nativa, sin necesidad de `trust_remote_code`. La cuantización es selectiva: las capas lineales se cuantizan a 4 bits con granularidad de grupo 64, mientras que la puerta de salida de atención se conserva en bf16, presumiblemente para preservar la estabilidad numérica en la distribución de probabilidades sobre los logits de las letras candidatas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card no detalla el proceso de entrenamiento del modelo original. La innovación principal es funcional: el modelo explota los logits del siguiente token correspondiente a las letras A-Z para obtener una distribución de probabilidad sobre los candidatos en un solo forward pass, en lugar de generar texto y parsearlo.

## Capacidades

- Puntuación de candidatos: dado un estado, una pregunta y hasta 26 opciones, devuelve una probabilidad relativa para cada una en un único forward pass.
- Predicción del siguiente estado de un entorno: recibe reglas del entorno como system message y estado/acción como JSON, y predice la siguiente observación.
- Toma de decisiones en agentes: asignación de propietario de tareas, control de visibilidad de información, decisión entre actuar o preguntar, validación de cumplimiento de estándares.
- Soporte de tool calling: no disponible explícitamente en la información proporcionada.
- Razonamiento multi-paso: no disponible explícitamente; el modelo está diseñado para decisiones puntuales, no para cadenas de razonamiento.
- Modo thinking: se puede desactivar mediante `enable_thinking=False` en la plantilla de chat; no se detalla su funcionamiento con thinking activado.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Control de permisos en agentes: el modelo recibe el estado con los permisos del solicitante y la petición, y devuelve la probabilidad de "permitir" frente a "denegar". Es adecuado porque la decisión se resuelve en un forward pass y los datos no salen del dispositivo.
- Asignación de tareas en sistemas multiagente: dado el estado del sistema y una lista de candidatos (agentes o roles), el modelo puntúa quién debería ser el propietario de la tarea, lo que permite enrutar trabajo sin lógica de reglas manual.
- Validación de resultados contra estándares: se puede usar para comprobar si una salida cumple un criterio definido, incluyendo la opción de devolver la decisión a una persona cuando la confianza no es suficiente.
- Predicción de la siguiente observación de un entorno: útil en simulación o planificación de agentes, donde el modelo predice el efecto de una acción sobre el estado descrito en JSON.
- Despliegue on-device en Mac: al ocupar 2,3 GB y ejecutarse con mlx-lm, se puede integrar junto al agente en un MacBook, manteniendo datos sensibles en local.
- Servicio con API compatible con OpenAI: `mlx_lm.server` permite exponer el modelo como endpoint, integrándolo en pipelines existentes que ya consumen APIs de tipo OpenAI.
- Filtrado previo en pipelines de decisión: como paso rápido y barato para descartar opciones antes de invocar un modelo mayor, dado su bajo coste de inferencia en Apple Silicon.

## Benchmarks y rendimiento

| Build | Tamano | JevBench (231 items publicos) | Misma respuesta top que bf16 |
|---|---|---|---|
| MLX-6bit (recomendado) | 3,3 GB | 79,2% | 222 / 231 |
| MLX-8bit | 4,4 GB | 79,7% | 229 / 231 |
| MLX-4bit (este) | 2,3 GB | 78,4% | 210 / 231 |
| MLX-bf16 | 8,2 GB | 78,8% | referencia |

Además, en la comprobación de paridad con el código original de Juneo en float32 sobre CPU (Transformers 4.57.1), con 11 prompts (uno de 3.313 tokens) y 753 posiciones evaluadas en modo teacher-forced, esta build de 4 bits coincide con el siguiente token del original en el 90,4% de las posiciones. Las builds bf16, 8-bit y 6-bit alcanzan el 99,6%, 98,9% y 98,1% respectivamente. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 2,3 GB para los pesos, más overhead de ejecución; en Apple Silicon la memoria es unificada.
- GPU recomendadas: Apple Silicon (M-series). Probado en un MacBook Pro M5 Max con 128 GB.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y memoria suficiente (holgadamente en configuraciones de 16 GB o más).
- Opciones de despliegue: mlx-lm (>= 0.32) para inferencia y `mlx_lm.server` para API compatible con OpenAI. Requiere Python 3.11 o superior. Probado con mlx 0.32.4 y mlx-lm 0.32.2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laplace-1-Vector-MLX-4bit (este) | 4,11B | no disponible | 78,4% | Apache 2.0 | Hugging Face (MLX) |
| Laplace-1-Vector-MLX-6bit | 4,11B | no disponible | 79,2% | Apache 2.0 | Hugging Face (MLX) |
| Laplace-1-Vector-MLX-8bit | 4,11B | no disponible | 79,7% | Apache 2.0 | Hugging Face (MLX) |
| Laplace-1-Atlas-MLX-6bit | 27B (familia Atlas) | no disponible | no disponible | Apache 2.0 | Hugging Face (MLX) |

No se dispone de datos de benchmarks de modelos de otras familias comparables en la información proporcionada.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas a los candidatos suministrados, no una probabilidad calibrada de acierto; no deben interpretarse como confianza absoluta.
- La build de 4 bits cambia la respuesta top en aproximadamente el 9% de los ítems de JevBench respecto a bf16 (210/231 coincidencias), por lo que para tareas de puntuación y ranking se recomienda la build de 6 u 8 bits.
- En la prueba de paridad con el modelo original, la coincidencia de siguiente token cae al 90,4% en 4 bits frente al 99,6% en bf16.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo está orientado a puntuar candidatos, no a generar texto libre, lo que limita pero no elimina este riesgo.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión (NetProjects) no está afiliado a Juneo Lab ni a XHToken; conviene verificar la licencia del modelo base.
- Requiere mlx-lm >= 0.32 y Python >= 3.11; no es portable a CUDA sin conversión adicional.
- Para decisiones de alto impacto, se recomienda incluir una opción de devolución a una persona o de solicitud de más información entre los candidatos.

## Enlaces

- [Hugging Face: netprojects/Laplace-1-Vector-MLX-4bit](https://huggingface.co/netprojects/Laplace-1-Vector-MLX-4bit)
- [Modelo base: JuneoAI/Laplace-1-Vector](https://huggingface.co/JuneoAI/Laplace-1-Vector)
- [Build 6-bit recomendada](https://huggingface.co/netprojects/Laplace-1-Vector-MLX-6bit)
- [Build 8-bit](https://huggingface.co/netprojects/Laplace-1-Vector-MLX-8bit)
- [Build bf16](https://huggingface.co/netprojects/Laplace-1-Vector-MLX-bf16)
- [Hermano de la familia: Laplace-1-Atlas MLX 6-bit](https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit)
- [NetProjects](https://netprojects.com)

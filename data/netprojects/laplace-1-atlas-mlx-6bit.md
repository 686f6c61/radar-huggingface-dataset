# netprojects/Laplace-1-Atlas-MLX-6bit

## Resumen

Laplace-1-Atlas-MLX-6bit es una conversión a formato MLX, cuantizada a 6 bits, del modelo JuneoAI/Laplace-1-Atlas, un modelo de decisión de 27B parámetros desarrollado por Juneo Lab sobre la base de Qwen3.8-27B. La publicación corre a cargo de NetProjects (Internet Projects Ltd), que no tiene relación con Juneo Lab ni con Alibaba Cloud. El modelo resuelve un problema muy concreto: dado un estado, una pregunta y un conjunto de candidatos, devuelve una distribución de probabilidad sobre esos candidatos en un único forward pass, lo que permite usarlo como componente de decisión dentro de sistemas de agentes y pipelines de control de acceso.

La relevancia de esta build reside en su eficiencia: con 22,8 GB de pesos mantiene exactamente la misma respuesta top que la versión bf16 en las 231 muestras públicas de JevBench, con una divergencia KL media de solo 0,008 respecto a bf16. Está pensada para ejecutarse en Apple Silicon mediante mlx-lm, con la torre de visión conservada en bf16, lo que permite cargarla también en mlx-vlm.

La arquitectura subyacente es un transformer denso de 27.356.728.560 parámetros (sin mezcla de expertos), derivado de la familia Qwen3.8, con capacidades de decisión, predicción de siguiente observación y visión. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6 bits afín, group size 64 (torre de visión en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base JuneoAI/Laplace-1-Atlas es un transformer denso de 27B parámetros construido sobre Qwen3.8-27B. La innovación principal no está en la arquitectura del backbone sino en el paradigma de uso: en lugar de generar texto libre, el modelo lee los candidatos como letras (A, B, C...) y utiliza los logits del siguiente token correspondientes a esas letras para producir una distribución de probabilidad sobre las opciones. Este mecanismo, implementado en el helper `score_candidates` portado a mlx-lm, convierte cada decisión en un único forward pass, sin decodificación autoregresiva.

La conversión a MLX aplica cuantización afín de 6 bits con group size 64 al modelo de lenguaje y mantiene la torre de visión en bf16. Según la model card, los 20 archivos de pesos de la revisión upstream (`cf6ea86`) coinciden con los hashes SHA-256 del Hub. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Puntuación de candidatos: devuelve una distribución de probabilidad sobre hasta 26 opciones etiquetadas por letra en un solo forward pass.
- Toma de decisiones con estado: evalúa quién debe poseer una tarea, quién puede ver qué, si actuar o preguntar primero, o si un resultado cumple el estándar.
- Predicción del siguiente estado: dado un estado y una acción en JSON, predice la siguiente observación del entorno.
- Visión: la torre de visión se conserva en bf16 y el modelo se carga en mlx-vlm; la model card indica que las builds de 4, 6 y 8 bits describen correctamente una imagen de prueba.
- Modo thinking desactivable: el chat template admite `enable_thinking=False`, usado en todas las evaluaciones de decisión.
- Integración con API compatible con OpenAI mediante `mlx_lm.server`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Control de acceso y autorización: el modelo recibe como estado los permisos del solicitante y la petición, y devuelve la probabilidad de permitir o denegar. Es adecuado porque la decisión se reduce a un forward pass con candidatos explícitos y probabilidades comparables.
- Enrutamiento de tareas en sistemas multiagente: dado un estado con la tarea pendiente y una lista de agentes candidatos, el modelo puntúa quién debería asumirla, lo que permite construir un orquestador con umbrales de confianza.
- Validación de resultados contra estándares: se le pasa el resultado producido y los criterios de aceptación como estado, y se puntúan los candidatos "cumple" y "no cumple", útil en pipelines de QA automatizado.
- Predicción de transiciones de entorno: con las reglas del entorno como system prompt y el estado y la acción en JSON, predice la siguiente observación, lo que sirve para simular o verificar máquinas de estados en agentes.
- Decisión de actuar o preguntar: en asistentes conversacionales, el modelo puede decidir si tiene información suficiente para responder o debe solicitar aclaración, reduciendo respuestas precipitadas.
- Despliegue local en estaciones de trabajo Apple Silicon: con 22,8 GB de pesos y unos 23 GB de pico de memoria, cabe en MacBook Pro con 64 GB o más y permite ejecutar el componente de decisión sin depender de la nube.
- Moderación y políticas internas: las reglas de la política se colocan en el estado y el modelo puntúa las categorías de decisión aplicables, aprovechando que la distribución es relativa a los candidatos suministrados.

## Benchmarks y rendimiento

Resultados sobre los 231 ítems públicos de JevBench (tiers easy, original y hard; licencia MIT), medidos en un MacBook Pro M5 Max de 128 GB el 11 de noviembre de 2026. Cada ítem es una pasada de puntuación de candidatos con thinking desactivado.

| Build | Precisión | easy | original | hard | Memoria pico |
|---|---|---|---|---|---|
| bf16 | 91,8% | 48/48 | 71/72 | 93/111 | 53,2 GB |
| 8-bit | 92,2% | 48/48 | 71/72 | 94/111 | 29,2 GB |
| 6-bit | 91,8% | 48/48 | 71/72 | 93/111 | 23,0 GB |
| 4-bit | 91,3% | 48/48 | 71/72 | 92/111 | 16,7 GB |

Métricas adicionales de la build de 6 bits:

| Métrica | Valor |
|---|---|
| Coincidencia de respuesta top con bf16 | 231/231 |
| Divergencia KL media respecto a bf16 | 0,008 |
| Acuerdo en 24 casos de decisión adicionales | 24/24 |
| Tamaño del repo | 22,8 GB |

La build de 8 bits obtiene una divergencia KL de 0,006 y la de 4 bits de 0,079. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,0 GB de pico para la build de 6 bits según las pruebas del autor; 22,8 GB de pesos en disco.
- Hardware de referencia: MacBook Pro M5 Max con 128 GB de memoria unificada.
- Cabe en Apple Silicon con 32 GB o más de memoria unificada, aunque con 32 GB el margen es ajustado; 64 GB es una cifra cómoda.
- No está pensado para GPU NVIDIA: el formato es MLX, exclusivo de Apple Silicon.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server` con API compatible con OpenAI) y mlx-vlm para uso con visión.
- Versiones probadas: mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench | Licencia | Formato |
|---|---|---|---|---|---|
| Laplace-1-Atlas-MLX-6bit | 27,36B | No disponible | 91,8% | Apache 2.0 | MLX safetensors 6-bit |
| Laplace-1-Atlas-MLX-8bit | 27,36B | No disponible | 92,2% | Apache 2.0 | MLX safetensors 8-bit |
| Laplace-1-Atlas-MLX-4bit | 27,36B | No disponible | 91,3% | Apache 2.0 | MLX safetensors 4-bit |
| JuneoAI/Laplace-1-Atlas (bf16) | 27,36B | No disponible | 91,8% | Apache 2.0 | safetensors bf16 |

La comparación con modelos de propósito general de tamaño similar no está disponible en la información proporcionada, ya que Laplace-1-Atlas está especializado en puntuación de candidatos y predicción de estados, y no se han publicado métricas comparables en benchmarks estándar.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas a los candidatos suministrados, no una probabilidad calibrada de acierto; no deben interpretarse como confianza absoluta.
- El modelo aconseja, pero no decide: la model card insiste en que el sistema que lo integra debe mantener el control final y aplicar sus propias reglas.
- Las reglas que gobiernan la decisión deben incluirse explícitamente en el estado; el modelo no las infiere de forma fiable si se omiten.
- El rendimiento en el tier hard de JevBench es del 83,8% (93/111), notablemente inferior al de los tiers easy y original, lo que sugiere mayor fragilidad en casos complejos.
- No hay información sobre sesgos conocidos, idiomas soportados ni riesgos de alucinación específicos en la documentación disponible.
- Aunque la licencia es Apache 2.0, el modelo base es de Juneo Lab y esta build no está afiliada a Juneo Lab ni a Alibaba Cloud; conviene revisar los términos del modelo upstream para uso comercial.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a CUDA sin reconversión.
- La fecha de creación del repositorio (11 de noviembre de 2026) y el escaso historial (0 descargas, 0 likes) implican que la build no cuenta aún con validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Build de 8 bits: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-bf16
- JevBench: https://github.com/fstandhartinger/jevbench
- NetProjects: https://netprojects.com

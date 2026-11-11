# netprojects/Laplace-1-Atlas-MLX-4bit

## Resumen

Laplace-1-Atlas-MLX-4bit es una conversión en formato MLX y cuantización de 4 bits del modelo JuneoAI/Laplace-1-Atlas, un modelo de decisión de 27B parámetros desarrollado por Juneo Lab sobre la base de Qwen3.8-27B. El modelo recibe un estado, una pregunta y un conjunto de candidatos, y devuelve una probabilidad para cada candidato en un único forward pass: quién debería encargarse de una tarea, quién puede ver qué, si conviene actuar o preguntar primero, o si un resultado cumple con el estándar exigido. También puede predecir el siguiente estado de un entorno descrito.

Esta build concreta, publicada por NetProjects (Internet Projects Ltd), cuantiza el modelo de lenguaje a 4 bits (afín, grupo 64) y mantiene la torre de visión en bf16, con un tamaño de repositorio de 16,1 GB y 27.356.728.560 parámetros totales. Está pensada para Apple Silicon mediante la librería MLX y es relevante para desarrolladores que necesitan ejecutar un modelo de decisión de 27B en hardware de consumo con memoria unificada, sacrificando una fracción mínima de precisión respecto a la versión bf16 (91,3% frente a 91,8% en JevBench).

La propuesta del modelo no es la generación de texto libre, sino la puntuación de candidatos discretos y la predicción de observaciones en entornos de agentes, lo que lo convierte en una pieza adecuada para sistemas de control, políticas de permisos y validación de resultados en pipelines agénticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con torre de visión; conversión MLX |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit afín con grupo de 64; visión en bf16; existen builds 6-bit, 8-bit y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo subyacente es JuneoAI/Laplace-1-Atlas, construido sobre Qwen3.8-27B, un transformer de 27B parámetros. La innovación principal no reside en la arquitectura de red sino en la interfaz de decisión: el modelo lee los candidatos como letras y utiliza los logits del siguiente token correspondientes a esas letras para producir una distribución de probabilidad sobre los candidatos en un solo forward pass, sin generación autoregresiva. Esta es la función `score_candidates` de Juneo, portada a mlx-lm con el mismo prompt. Para predicción de outcomes, el modelo recibe las reglas del entorno como mensaje de sistema y el estado y la acción como JSON, con el modo thinking desactivado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La build de NetProjects aplica cuantización afín de 4 bits con grupo 64 al modelo de lenguaje y conserva la torre de visión en bf16. El autor verificó que los 20 archivos de pesos de la revisión upstream coinciden con los hashes SHA-256 del Hub, y que las builds de 4, 6 y 8 bits describen correctamente una imagen de prueba en mlx-vlm.

## Capacidades

- Puntuación de candidatos: devuelve una distribución de probabilidad sobre hasta 26 candidatos etiquetados con letras en un único forward pass, con modo thinking desactivado.
- Toma de decisiones contextualizada: evalúa quién debe poseer una tarea, quién puede ver qué recurso, si procede actuar o preguntar, o si un resultado cumple el estándar.
- Predicción del siguiente estado de un entorno: dado un estado, un historial y una acción en JSON, predice la siguiente observación.
- Visión: incluye torre de visión y carga en mlx-vlm; las builds cuantizadas describen imágenes correctamente en las pruebas del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a sistemas agénticos por diseño (decisiones, permisos, validación de resultados), aunque el razonamiento multi-paso explícito no se documenta.
- Capacidades multilingües: no disponible.
- Modo thinking: existe y puede desactivarse mediante `enable_thinking=False` en la plantilla de chat; las evaluaciones se realizaron con thinking off.

## Casos de uso

- Control de acceso y permisos: el modelo recibe el estado con los permisos del solicitante y la petición, y puntúa candidatos como "allow" o "deny" con probabilidades, lo que permite integrarlo como capa de asesoramiento en sistemas de autorización que mantienen la decisión final en su propia lógica.
- Enrutamiento de tareas entre agentes: dado un estado con la tarea pendiente y candidatos que representan agentes o roles, el modelo devuelve qué candidato debería poseerla, útil en orquestadores multi-agente.
- Validación de resultados en pipelines: se le presenta el estándar exigido y el resultado producido como candidatos de cumplimiento, y su puntuación sirve como filtro previo a la publicación o al paso siguiente del pipeline.
- Decisión actuar frente a preguntar: en asistentes con autonomía limitada, el modelo puntúa si conviene ejecutar una acción o solicitar aclaración, reduciendo actuaciones no deseadas en entornos sensibles.
- Predicción de observaciones en simulación: con las reglas del entorno como system prompt, predice el siguiente estado tras una acción, lo que permite validar transiciones en simuladores o entornos de prueba antes de ejecutarlas en producción.
- Despliegue local en Apple Silicon para prototipado de agentes: con 16,1 GB y un pico de memoria de unos 17 GB, cabe en un MacBook con memoria unificada suficiente, lo que facilita iterar sobre políticas de decisión sin depender de GPU en la nube.
- Servicio con API compatible OpenAI: mediante `mlx_lm.server` se expone el modelo con una API compatible, lo que permite integrarlo en aplicaciones existentes que ya consumen ese formato.

## Benchmarks y rendimiento

Resultados en JevBench (231 ítems públicos, tiers easy, original y hard; MIT), facilitados por el autor de la build:

| Build | Precisión | easy | original | hard | Memoria pico |
|---|---|---|---|---|---|
| bf16 | 91,8% | 48 / 48 | 71 / 72 | 93 / 111 | 53,2 GB |
| 8-bit | 92,2% | 48 / 48 | 71 / 72 | 94 / 111 | 29,2 GB |
| 6-bit | 91,8% | 48 / 48 | 71 / 72 | 93 / 111 | 23,0 GB |
| 4-bit | 91,3% | 48 / 48 | 71 / 72 | 92 / 111 | 16,7 GB |

Acuerdo con bf16 en los mismos ítems: divergencia KL media de 0,006 (8-bit), 0,008 (6-bit) y 0,079 (4-bit). En 24 casos de decisión adicionales escritos para esta comprobación, todas las builds eligen el mismo candidato que bf16. En JevBench, la build de 4 bits coincide con la respuesta superior de bf16 en 224 de 231 ítems.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 16,1 GB de tamaño de repositorio; pico de memoria de aproximadamente 17 GB en las pruebas del autor con la build de 4 bits.
- GPU recomendadas: Apple Silicon con memoria unificada; el autor probó en un MacBook Pro M5 Max de 128 GB. No se documentan GPU NVIDIA (A100, H100, RTX 4090) para esta build MLX.
- Compatibilidad con GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente para alojar los ~17 GB de pico; no está orientada a GPU discretas de consumo.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`), `mlx_lm.server` con API compatible OpenAI, y mlx-vlm para uso con visión. Probado con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laplace-1-Atlas-MLX-4bit (esta build) | 27,3B | no disponible | 91,3% | Apache 2.0 | Hugging Face, MLX |
| Laplace-1-Atlas-MLX-6bit | 27,3B | no disponible | 91,8% | Apache 2.0 | Hugging Face, MLX |
| Laplace-1-Atlas-MLX-8bit | 27,3B | no disponible | 92,2% | Apache 2.0 | Hugging Face, MLX |
| Laplace-1-Atlas-MLX-bf16 | 27,3B | no disponible | 91,8% | Apache 2.0 | Hugging Face, MLX |

Las alternativas comparables de otros desarrolladores (por ejemplo, modelos de decisión de tamaño similar) no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Las probabilidades devueltas son relativas a los candidatos suministrados, no una probabilidad calibrada de ser correcta; las reglas que gobiernan la decisión deben incluirse en el estado.
- El modelo asesora; el sistema que lo integra debe tomar la decisión final. No debe usarse como autoridad única en políticas de permisos o seguridad.
- El modo thinking debe desactivarse para la puntuación de candidatos y la predicción de observaciones, tal como se documenta; un uso distinto puede alterar los resultados.
- La build de 4 bits presenta una divergencia KL media de 0,079 respecto a bf16 y discrepa en la respuesta superior en 7 de 231 ítems de JevBench; para casos donde el margen de precisión importa, el autor recomienda la build de 6 bits.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación, cobertura de idiomas ni longitud de contexto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base JuneoAI/Laplace-1-Atlas y de Qwen3.8-27B subyacentes.
- Esta build no está afiliada a Juneo Lab ni a Alibaba Cloud, según indica el autor.
- No se documentan resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), lo que limita la comparación con modelos de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-4bit
- Modelo base: https://huggingface.co/JuneoAI/Laplace-1-Atlas
- Build de 6 bits (recomendada por el autor): https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Laplace-1-Atlas-MLX-bf16
- JevBench: https://github.com/fstandhartinger/jevbench
- NetProjects: https://netprojects.com

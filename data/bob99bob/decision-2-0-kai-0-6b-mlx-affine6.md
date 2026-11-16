# Bob99Bob/Decision-2.0-Kai-0.6B-mlx-affine6

## Resumen

Decision 2.0 Kai 0.6B MLX affine 6-bit es una conversión a formato MLX para Apple Silicon del modelo Decision 2.0 Kai 0.6B, publicado originalmente por el equipo vLLM Semantic Router. El autor de la conversión es Bob99Bob y el objetivo es servir el modelo en Mac mediante la herramienta veJ. No se ha entrenado ni ajustado nada: los pesos son los del publicador original, únicamente reempaquetados y cuantizados.

El modelo original es un transformer de tipo Qwen3 con 597.103.104 parámetros totales, orientado a clasificación de texto y, más concretamente, a tareas de decisión y enrutamiento semántico dentro de la arquitectura veJ. En ese sistema, Decision 2.0 Kai actúa como uno de los "lectores pequeños" que los distintos niveles consultan antes de invocar al juez principal.

Su relevancia es acotada pero específica: ofrece una versión de 0,6B parámetros cuantizada a 6 bits (group size 64) que conserva todas las reglas de enrutamiento del modelo original según las mediciones del autor, con un acuerdo de respuestas respecto al modelo publicado de entre 0,972 y 0,995. La licencia es Apache-2.0 y el repositorio ocupa 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), con cabeza de decisión en float32 |
| Parametros totales | 597.103.104 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín de 6 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Qwen3, tal como indican los tags del repositorio. La conversión aplica cuantización afín de 6 bits con group size 64 sobre el embedding de tokens y los 197 módulos Linear de las capas del transformer, usando `quantize_model` de mlx-lm sobre MLX 0.32.2. El resto de tensores se mantiene sin cambios respecto al publicador, y el conversor verifica que la cabeza de decisión permanezca en float32.

No se dispone de información sobre el proceso de entrenamiento del modelo original: número de tokens, composición del dataset, ni si hubo RLHF o DPO. La model card de esta conversión indica explícitamente que no se ha entrenado ni ajustado nada, y remite a la card del publicador para los detalles del modelo en sí. Tampoco se documentan innovaciones arquitectónicas adicionales más allá de la propia cuantización para Apple Silicon.

## Capacidades

- Clasificación de texto orientada a decisiones de enrutamiento semántico (pipeline `text-classification`).
- Evaluación de reglas de decisión: según las mediciones del autor, a 6 bits conserva todas las reglas de enrutamiento para las que el modelo publicado cualifica, incluidas la regla sí/no y la regla de dos opciones.
- Actuación como lector previo al juez dentro de la arquitectura veJ (niveles que consultan antes del juez principal).
- Inferencia local en Apple Silicon mediante MLX.
- No se documentan capacidades de generación abierta, código, matemáticas, visión, tool calling ni agentes en la información disponible.

## Casos de uso

- Enrutamiento semántico en pipelines veJ: el modelo se usa como lector pequeño que los niveles de decisión consultan antes de invocar al juez, aprovechando que a 6 bits conserva todas las reglas de enrutamiento del modelo publicado.
- Clasificación de decisiones binarias (sí/no): útil en flujos donde se necesita una respuesta afirmativa o negativa sobre una consulta antes de derivarla a un componente mayor; a 6 bits esta regla se mantiene, mientras que a 4 bits se pierde.
- Clasificación de decisiones con dos opciones: selección entre alternativas enrutadas; a 6 bits se preserva, mientras que a 5 bits se pierde.
- Inferencia local en Mac para prototipado: desarrolladores que trabajan en Apple Silicon pueden ejecutar el modelo con MLX sin depender de GPUs dedicadas, gracias a los 0,5 GB del repositorio.
- Filtrado previo en sistemas de recuperación o atención: usar el modelo como primera etapa de decisión que descarta o deriva consultas antes de un modelo mayor, reduciendo coste computacional.
- Validación de pipelines de enrutamiento: servir el modelo con veJ (`decision2_server.py`) para verificar que las reglas de decisión se comportan como con el modelo publicado, dado el acuerdo medido de 0,972 a 0,995.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las mediciones de acuerdo (agreement) del autor de la conversión respecto al modelo publicado, sobre los modelos Decision 2.0 y 3.0 servidos:

| Cuantizacion | Acuerdo con el modelo publicado | Reglas de enrutamiento conservadas |
|---|---|---|
| 4 bits | 0,876 a 0,990 | Pierde la regla sí/no |
| 5 bits | 0,955 a 0,996 | Pierde la regla de dos opciones |
| 6 bits | 0,972 a 0,995 | Todas |
| 8 bits | No mejor que 6 bits | Todas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio ocupa 0,5 GB en pesos de 6 bits; el modelo completo en memoria requiere además los ficheros del tokenizer del publicador y la cabeza de decisión en float32.
- Hardware objetivo: Apple Silicon (MLX), según los tags `mlx` y `apple-silicon`; el autor lo sirve en un Mac (referencia a provisión `m4_models.py`).
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; el formato es específico de MLX.
- Despliegue: servidor propio de veJ (`server/decision2/decision2_server.py`), con verificación de tamaños y sha256 al cargar mediante `mlx-conversion.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Decision 2.0 Kai 0.6B MLX affine 6-bit (este) | 597 M | no disponible | MLX safetensors 6 bits | Apache-2.0 | Conversion para Apple Silicon |
| vllm-sr/Decision-2.0-Kai-0.6B (original) | 597 M | no disponible | safetensors (publicador) | Apache-2.0 | Modelo base sin cuantizar |
| Otras cuantizaciones del mismo modelo (4, 5, 8 bits) | 597 M | no disponible | MLX | Apache-2.0 | Peor conservación de reglas según mediciones |

No se dispone de información sobre otros modelos comparables de la misma categoría (clasificación de decisión de ~0,6B) en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye los ficheros del tokenizer: es necesario descargarlos del modelo original en la revisión `cd49ea3813fd8ba0928a9a23ef6c9a0f2f0cd764`, o el servidor no podrá cargar el modelo.
- Es una conversión de formato, no un modelo entrenado: cualquier limitación del modelo original se hereda íntegramente.
- La cuantización a 6 bits introduce una divergencia respecto al modelo publicado (acuerdo de 0,972 a 0,995, no 1,0); aunque conserva todas las reglas de enrutamiento, las respuestas no son idénticas.
- A 4 y 5 bits se pierden reglas de enrutamiento concretas, por lo que no son sustitutos válidos para este uso.
- Uso específico: está pensado como componente de decisión dentro de veJ; no se documentan capacidades generales de generación ni multilingües.
- Idiomas soportados no disponibles en la información.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bob99Bob/Decision-2.0-Kai-0.6B-mlx-affine6
- Modelo base: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B
- Repositorio veJ: https://github.com/ordinarybob/vej
- Metodología y resultados de benchmarks de veJ: https://github.com/ordinarybob/vej/blob/main/docs/BENCHMARKS.md

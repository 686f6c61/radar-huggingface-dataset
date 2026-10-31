# ashwin-sreedhar/Qwen3.5-4B-abliterated-bf16-public

## Resumen

Qwen3.5-4B-abliterated-bf16-public es una variante experimental del modelo Qwen3.5-4B de Qwen, publicada por el usuario ashwin-sreedhar en HuggingFace. Se trata de un "abliterated" o modelo con pesos editados mediante intervención directa sobre los tensores: el objetivo es proyectar fuera de los escritores residuales del decodificador, los embeddings y el vision merger una dirección latente asociada a las negativas (refusals), reduciendo así la tasa de rechazos del modelo sin necesidad de reentrenamiento. El modelo base conserva la arquitectura de Qwen3.5-4B, con aproximadamente 4.539 millones de parámetros en precisión bf16.

Su relevancia actual radica en la creciente comunidad de investigación sobre modificación de pesos para alterar comportamientos de alineación en modelos pequeños y locales. No obstante, la propia model card lo califica como un checkpoint de investigación experimental: no superó la barra de aceptación fijada por el propio autor (máximo 5 rechazos por cada 100 prompts del marcador JBB, frente a los 10 obtenidos), y presenta una pequeña degradación medible en GSM8K. Está orientado a investigación en Apple silicon mediante la librería MLX, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con embeddings atados (tied embeddings) y componentes de visión (vision merger); no disponible el detalle completo |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin cuantización; también se menciona una variante original bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout estilo fuente, para MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo de generación de texto basado en transformer de la familia Qwen. La modificación no es un fine-tuning convencional: se trata de una edición de pesos (weight editing) que proyecta una dirección seleccionada fuera de los "decoder residual writers", de los embeddings y del vision merger. Dado que el modelo usa embeddings atados a la salida, la lectura de salida también cambia al modificar los embeddings. La edición se seleccionó sobre datos de validación como "attempt 1" de un proceso histórico, y el repositorio incluye `abl_edit.json` con los metadatos de la intervención.

Sobre el entrenamiento del modelo base no se ofrecen detalles en la información disponible (número de tokens, composición del dataset o uso de RLHF/DPO). El export original omitió los tensores MTP (multi-token prediction), por lo que la generación asistida por MTP no está verificada. El comportamiento con imágenes tampoco ha sido verificado, aunque la presencia del vision merger sugiere que el modelo base podría tener capacidad multimodal.

## Capacidades

- Generacion de texto conversacional: verificado mediante una prueba local de carga y chat (smoke test) con mlx-lm 0.32.2 y MLX 0.32.4 en Apple silicon.
- Resolucion de problemas matematicos: mantiene un 85,90% de precisión en GSM8K tras la edición (frente al 87,72% del original).
- Comportamiento con negativas reducido: la tasa de rechazos en el marcador JBB baja de 95 a 10 por cada 100 prompts, aunque sin eliminarlos por completo.
- Potencial capacidad de visión: el edit afecta al vision merger, lo que sugiere que el modelo base incluye componentes multimodales, pero el comportamiento con imágenes no está verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles explícitamente; la familia Qwen suele ofrecer buen soporte multilingüe, pero no hay datos para esta variante.

## Casos de uso

- Investigacion en interpretability y abliteration: es el caso de uso principal; permite estudiar cómo la proyección de direcciones latentes en los residuales altera el comportamiento de rechazo sin reentrenamiento, con metadatos de la intervención incluidos (`abl_edit.json`).
- Experimentacion con alineacion en modelos locales: útil para comparar tasas de refusal y degradación de capacidades entre el modelo original y la variante editada en entornos controlados de laboratorio.
- Chatbots de investigacion en Apple silicon: el formato MLX permite ejecutar el modelo en Mac con Apple silicon usando mlx-lm, ideal para prototipado local sin GPU NVIDIA.
- Evaluacion de preservacion de capacidades: sirve como caso de estudio para medir el coste de las ediciones de pesos en benchmarks de razonamiento matemático como GSM8K (en este caso, -1,82 puntos porcentuales).
- Punto de partida para ediciones adicionales: al publicarse en formato safetensors con layout fuente, puede servir de base para nuevas intervenciones de pesos por parte de otros investigadores.
- Analisis de integridad y procedencia de modelos: el repositorio incluye manifiestos SHA-256 (`release_manifest.json`) y avisos de modificación en las cabeceras de los safetensors, útil para estudiar prácticas de trazabilidad en publicaciones de modelos modificados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (resultados históricos, no reevaluados en la subida):

| Variante | Rechazos JBB / 100 | KL primer token (harmless) | Precision GSM8K |
|---|---:|---:|---:|
| Original bf16 | 95 | 0 | 87,72% |
| Este checkpoint (attempt 1) | 10 | 0,0640 | 85,90% |

Observaciones del propio autor: la barra de aceptación fijada era de 5 rechazos JBB como máximo, por lo que este checkpoint no la superó. El cambio pareado en GSM8K fue de -1,82 puntos porcentuales (error estándar 0,77). No hay comparativas con otros modelos ni otros benchmarks (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 9,1 GB en bf16; se recomienda al menos 12-16 GB de memoria unificada para carga cómoda en Apple silicon.
- GPU recomendadas: está diseñado y probado para Apple silicon (MLX 0.32.4, mlx-lm 0.32.2); no se han publicado pruebas en GPU NVIDIA, aunque el formato safetensors podría adaptarse.
- Consumer GPU: en Macs con Apple silicon (M1 Pro/Max, M2, M3, M4 con suficiente memoria unificada) cabe sin problemas; en PC con GPU NVIDIA de consumo (RTX 3090/4090 con 24 GB) también habría espacio de sobra en bf16, pero no hay soporte MLX verificado fuera de Mac.
- Opciones de despliegue: mlx-lm (via `mlx_lm.load` sobre la carpeta descargada) es la vía documentada; también se menciona el script `evil_chat_mlx.py` del proyecto persona-lab. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3.5-4B-abliterated-bf16-public (este) | 4,54 B (4.539 M) | safetensors (MLX), bf16 | Apache 2.0 | Pesos editados para reducir refusals; experimental |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Apache 2.0 | Modelo original sin modificar; 95 refusals JBB / 100 |
| Otras variantes abliterated de 4B (p. ej., de la comunidad) | ~4 B | GGUF, safetensors | Variables | No disponibles datos concretos en la información proporcionada |

No se han publicado comparativas directas con otras variantes abliterated en la información disponible.

## Limitaciones y advertencias

- No superó la barra de aceptacion del propio autor: 10 rechazos JBB por 100 prompts frente al máximo de 5 establecido; no es un modelo completamente libre de negativas.
- Degradacion medible de capacidades: -1,82 puntos porcentuales en GSM8K (SE 0,77); una sola métrica no garantiza la preservación general de capacidades.
- Ausencia de marcador no implica cumplimiento semantico: la propia model card advierte que la ausencia de marcadores de refusal no equivale a que el modelo sea realmente complaciente.
- Comportamiento con imagenes y MTP no verificados: el export omitió los tensores MTP y el efecto del edit sobre la ruta de visión no ha sido probado.
- Procedencia incompleta: la revisión histórica de origen y el linaje de extracción no están completamente registrados; el checkpoint no ha sido certificado retroactivamente con las comprobaciones completas de round-trip de tensores.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3.5-4B; la edición de pesos no aborda sesgos ni fiabilidad factual. No hay datos específicos disponibles.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero se trata de un checkpoint experimental no apto para producción; aplican las licencias, atribuciones y restricciones de uso del upstream.
- Contexto e idiomas: no documentados para esta variante.
- Descargas y adopcion muy bajas (619 descargas, 1 like al momento de la ficha), lo que implica escaso testeo por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ashwin-sreedhar/Qwen3.5-4B-abliterated-bf16-public
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o demo: no disponibles en la información proporcionada.

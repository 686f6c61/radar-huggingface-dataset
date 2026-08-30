# peculiar-ragdoll/Dirk-Qwen3.8-27B-MLX-oQ4e

## Resumen

Dirk-Qwen3.8-27B-MLX-oQ4e es una cuantización en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27B parámetros con capacidades de visión y lenguaje (image-text-to-text). El autor, peculiar-ragdoll, ha aplicado tres modificaciones clave sobre el checkpoint original: una cuantización mixta de precisión calibrada con imatrix (oQ4e, ~4.9 bpw), la inclusión de la cabeza MTP (multi-token prediction) para decodificación especulativa, y el reemplazo de la plantilla de chat por la plantilla "Sharp" v22.3.1, que añade un prompt de sistema orientado a respuestas concisas y desactiva el razonamiento forzado en nivel `xhigh` que trae el modelo base.

La relevancia de este modelo reside en que ofrece una alternativa más eficiente y directa al Qwen3.8-27B original, pensada para entornos Apple Silicon (MLX) y para casos de uso donde se busca reducir el número de tokens generados sin sacrificar precisión. Según el autor, la plantilla Sharp consigue respuestas un 59% más cortas en Claw-Eval y un 22% menos de tokens por respuesta correcta en MMLU-Pro, con una ligera mejora de precisión. El modelo mantiene la torre de visión integrada y soporta un contexto de hasta 262.144 tokens. Está disponible bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, vision-lenguaje (basado en Qwen3.8-27B) |
| Parametros totales | 4.926.789.872 (según safetensors del repo; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (configuración recomendada) |
| Tipos de cuantizacion | oQ4e (~4.9 bpw, 15.8 GB) y oQ6e (~6.9 bpw, 22.1 GB, en repo separado) |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura de visión-lenguaje, es decir, incluye un codificador visual además del decodificador de lenguaje. No se dispone de información detallada sobre el número de capas, dimensiones ocultas o atención por el momento. El checkpoint original se entrenó con un enfoque de razonamiento que por defecto fuerza `reasoning_effort=xhigh` en cada llamada; Dirk elimina ese comportamiento forzado y deja el esfuerzo de razonamiento en `medium` (el nivel nativo que no inyecta instrucciones adicionales).

La modificación principal de Dirk es la plantilla de chat Sharp v22.3.1, que combina la plantilla corregida de Qwen con un prompt de sistema de terseness (concisión) siempre activo. Los pesos y los tensores MTP no se modifican. La cuantización oQ4e se realiza con el cuantizador oQ de oMLX, que usa calibración imatrix y precisión mixta, preservando la cabeza MTP para permitir decodificación especulativa en runtimes que la soporten. No se dispone de información sobre el dataset de entrenamiento, el número de tokens de preentrenamiento ni si se aplicaron técnicas como RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento con esfuerzo configurable (`low`, `medium`, `high`, `xhigh`) mediante `chat_template_kwargs`.
- Comprensión de imágenes y diálogo visual (image-text-to-text), con la torre de visión integrada en el checkpoint.
- Decodificación especulativa multi-token (MTP) para acelerar la generación en runtimes compatibles.
- Respuestas concisas y orientadas a tarea gracias a la plantilla Sharp, que reduce tokens generados sin degradar la precisión.
- Soporte de contexto largo de hasta 262.144 tokens.
- Capacidades multilingües para inglés y chino.
- Orientado a agentic coding y razonamiento multi-paso, según los tags del autor.

## Casos de uso

- **Asistente de programación con agente**: el modelo puede integrarse en flujos de trabajo de codificación agéntica (agentic coding), donde se requiere razonamiento multi-paso y generación de código con bajo overhead de tokens. Su plantilla concisa reduce la latencia en iteraciones repetidas.
- **Análisis de capturas y documentos visuales**: al conservar la torre de visión, permite extraer información de imágenes, capturas de pantalla o diagramas, por ejemplo en pipelines de documentación automática.
- **Chat de soporte técnico en inglés o chino**: con contexto de 262K tokens, puede manejar conversaciones largas con historial extenso, respondiendo de forma directa y sin divagaciones.
- **Generación de informes y resúmenes**: su sesgo hacia respuestas cortas lo hace adecuado para resumir documentos largos o generar informes ejecutivos donde se valora la brevedad.
- **Automatización de tareas de razonamiento con presupuesto de tokens**: en entornos donde el coste por token es relevante (APIs o despliegues propios), el modelo reduce el número de tokens de salida en torno a un 50-60% en tareas de razonamiento, manteniendo la precisión.
- **Despliegue en hardware Apple Silicon**: al ser un checkpoint MLX, puede ejecutarse en Macs con 24 GB o más de RAM unificada, sin necesidad de GPU dedicada, para prototipado y producción ligera.

## Benchmarks y rendimiento

El autor reporta mediciones en progreso, con datos parciales y otros heredados de la plantilla Sharp sobre el modelo Dagger (misma arquitectura base). Los datos disponibles son:

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU-Pro (accuracy) | 85,3% | Medido en Dirk (medium) |
| MMLU-Pro (tokens por respuesta correcta) | 1248 | Heredado de Dagger con plantilla Sharp |
| Claw-Eval (answer component) | 66,7 | Heredado de Dagger con plantilla Sharp |
| Claw-Eval (tokens de respuesta) | 2217 | Heredado de Dagger con plantilla Sharp |
| Rendimiento (MLX, sin MTP) | ~31,6 tok/s | En el equipo del autor |
| Rendimiento (oMLX, M5 Max 40c 128GB) | 919,9 PP tok/s, 61,1 TG tok/s | Según omlx.ai |

Estos valores deben tomarse con cautela: los benchmarks de Dirk están aún en curso y algunos datos provienen de modelos con la misma plantilla pero no exactamente los mismos pesos. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,8 GB para la cuantización oQ4e, 22,1 GB para oQ6e.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para Apple Silicon con memoria unificada. Se recomienda un Mac con 24 GB de RAM para oQ4e y 32 GB para oQ6e.
- En GPUs de consumo (RTX 4090, etc.) no es directamente ejecutable en formato MLX; sería necesario convertir los pesos a otro formato.
- Opciones de despliegue: oMLX (con soporte MTP), mlx-vlm (versión >= 0.6.3), o cargando los safetensors con MLX.
- Latencia observada: ~31,6 tok/s sin MTP en un equipo del autor; 61,1 tok/s de generación en un M5 Max (40 núcleos, 128 GB) según omlx.ai.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dirk-Qwen3.8-27B-MLX-oQ4e | 27B (4,93B en safetensors) | 262K | Apache 2.0 | MLX | Plantilla Sharp, MTP, visión |
| Qwen3.8-27B (stock) | 27B | 262K | Apache 2.0 | Transformers/MLX | Razonamiento forzado xhigh, más verboso |
| Dagger-Qwen3.6-27B-GGUF-MTP | 27B | no disponible | Apache 2.0 | GGUF | Base para validar la plantilla Sharp |
| Nail (Sharp 35B-A3B MoE) | 35B (3B activos) | no disponible | Apache 2.0 | MLX | MoE, más rápido por token correcto (43s) |

La comparativa se basa en datos del autor y de la información disponible. No se dispone de suficientes datos independientes para una comparación exhaustiva.

## Limitaciones y advertencias

- El número de parámetros reportado en safetensors (4,93B) no coincide con los 27B declarados del modelo base; probablemente se deba a la cuantización o a una métrica interna, pero no está aclarado por el autor.
- Los benchmarks propios de Dirk están aún en progreso; los valores de MMLU-Pro y Claw-Eval heredados de Dagger pueden no ser exactamente reproducibles en este checkpoint.
- El modelo solo soporta inglés y chino; no se garantiza buen rendimiento en otros idiomas.
- La plantilla Sharp fuerza respuestas concisas, lo que puede ser inadecuado para tareas que requieran explicaciones largas o matizadas.
- Es necesario usar `mlx-vlm` y no `mlx-lm` para cargar el modelo; usar el cargador incorrecto produce tokens corruptos sin error aparente.
- La cuantización oQ4e introduce pérdida de precisión respecto al modelo original en fp16; para tareas sensibles se recomienda oQ6e.
- El uso de decodificación especulativa con MTP requiere un runtime compatible (oMLX); otros cargadores ignorarán los tensores MTP.
- No se dispone de información sobre sesgos del modelo, riesgo de alucinación o comportamiento en dominios especializados.

## Enlaces

- Repositorio HuggingFace (oQ4e): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-MLX-oQ4e
- Repositorio HuggingFace (oQ6e): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-MLX-oQ6e (mencionado en la model card)
- Repositorio HuggingFace (GGUF): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
- Plantilla Sharp Chat Templates: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Ficha en LLM Explorer: https://llm-explorer.com/model/peculiar-ragdoll%2FDirk-Qwen3.8-27B-MLX-oQ4e,4ozakojuw0rrmBa1YoF4CV
- Benchmark en omlx.ai: https://omlx.ai/benchmarks/performance/srtmrvup

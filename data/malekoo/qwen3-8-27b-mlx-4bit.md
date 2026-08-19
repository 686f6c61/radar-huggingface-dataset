# malekoo/Qwen3.8-27B-MLX-4bit

## Resumen

Qwen3.8-27B-MLX-4bit es una conversión cuantizada a 4 bits del modelo denso Qwen3.8-27B, desarrollado por el equipo Qwen, adaptada al formato MLX por el usuario malekoo. El modelo base pertenece a la generación Qwen3.8, construida sobre la arquitectura Qwen3.5, con 27.000 millones de parámetros y una ventana de contexto nativa de 262.144 tokens. Esta conversión elimina el codificador de visión y el drafter de predicción multi-token, por lo que el artefacto resultante es exclusivamente de texto.

La relevancia de esta ficha radica en que ofrece una versión ligera (unos 15 GB en disco) de un modelo de razonamiento con modo de pensamiento activado por defecto, controlable mediante `reasoning_effort`. Está pensada para ejecutarse en hardware de consumo con Apple Silicon o GPUs con suficiente VRAM, mediante la librería mlx-lm. La cuantización introduce una pérdida de perplejidad del 2,2 % relativo respecto a la versión bf16, según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida 3:1 de Gated DeltaNet (atención lineal) y atención completa gated, 64 capas, 24Q/4KV, head dim 256 |
| Parametros totales | 4.204.731.904 (según safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | 4-bit, group size 64, affine (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet y atención completa gated en proporción 3:1, con 64 capas, 24 cabezas de consulta y 4 de clave/valor, y dimensión de cabeza 256. El vocabulario alcanza 248.320 tokens. El modo de pensamiento (thinking) está activado por defecto, con control de esfuerzo de razonamiento (`xhigh`, `medium`, `low`) y opción de preservar el razonamiento en la salida.

Esta conversión MLX se realizó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` a partir del checkpoint bf16 original. El proceso elimina el codificador de visión y el drafter de predicción multi-token, por lo que el artefacto resultante solo procesa texto. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento con modo de pensamiento activado por defecto, controlable mediante `reasoning_effort` (`xhigh`, `medium`, `low`).
- Soporte de servidor OpenAI-compatible a través de `mlx_lm.server`.
- Control del razonamiento mediante `chat_template_kwargs` (`enable_thinking`, `preserve_thinking`).
- Capacidades multilingües: no especificadas en la documentación disponible.
- No soporta entrada de imágenes ni vídeo (conversión text-only).

## Casos de uso

- Asistente conversacional local: gracias a su tamaño reducido (15 GB) y al formato MLX, puede ejecutarse en Mac con Apple Silicon para ofrecer un chatbot con razonamiento integrado, sin depender de servicios en la nube.
- Generación de texto con control de razonamiento: en entornos donde se requiera explicar el proceso de pensamiento (por ejemplo, tutoría o análisis), se puede activar `preserve_thinking` para obtener cadenas de razonamiento explícitas.
- Servidor de inferencia ligero: usando `mlx_lm.server`, se puede exponer una API compatible con OpenAI para integrar el modelo en aplicaciones existentes con mínima configuración.
- Prototipado de agentes conversacionales: al ser un modelo denso de 27B cuantizado, permite experimentar con razonamiento multi-paso en hardware de consumo antes de escalar a modelos mayores.
- Análisis de texto con contexto largo: la ventana de 262.144 tokens permite procesar documentos extensos o conversaciones largas en una sola pasada, aunque la cuantización puede afectar a la precisión en tareas de recuperación fina.
- Evaluación de técnicas de cuantización: al comparar la perplejidad de esta versión 4-bit con la bf16, se puede estudiar el impacto de la cuantización en modelos híbridos de atención lineal.

## Benchmarks y rendimiento

El autor proporciona una única medición de perplejidad en wikitext-2 (test), comparando esta conversión con la versión bf16 en el mismo entorno:

| Modelo | Perplejidad wikitext-2 (test) |
|---|---|
| Qwen3.8-27B-MLX-4bit | 7.0871 |
| Qwen3.8-27B bf16 (MLX) | 6.9352 |

La diferencia relativa es del +2,2 %. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15-16 GB para inferencia en 4-bit (pesos de ~15 GB más overhead de contexto).
- GPU recomendadas: RTX 4090 (24 GB) o superior, o GPUs profesionales con al menos 16 GB de VRAM. En Apple Silicon, se recomienda al menos 16 GB de memoria unificada (M1 Pro/Max o superior).
- Compatible con hardware de consumo: sí, siempre que se disponga de la VRAM indicada.
- Opciones de despliegue: mlx-lm (generación y servidor OpenAI-compatible), también puede ejecutarse con otras herramientas que soporten MLX.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de la misma categoría (por ejemplo, otros Qwen3.8 cuantizados o modelos híbridos de 27B). La única comparación fiable es con el modelo base bf16, que se muestra en la sección de benchmarks. Se recomienda consultar la model card del modelo base para comparaciones con alternativas.

## Limitaciones y advertencias

- Conversión text-only: no acepta imágenes ni vídeo; para tareas multimodales hay que usar el checkpoint original con Transformers, vLLM o SGLang.
- La cuantización altera los resultados numéricos: los benchmarks del modelo base no se transfieren directamente a este artefacto.
- Discrepancia en el número de parámetros: el safetensors del repositorio indica 4.204.731.904 parámetros, mientras que el modelo base declara 27B. Esto sugiere un posible error en el repositorio o una subida incompleta; se recomienda verificar antes de usar en producción.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento multilingüe óptimo.
- La ventana de contexto de 262.144 tokens es nativa, pero la cuantización puede degradar la precisión en tareas que requieran atención a detalles finos en contextos muy largos.
- Licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al equipo Qwen y al autor de la conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/malekoo/Qwen3.8-27B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Qwen (anuncio de Qwen3.8): https://qwen.ai/blog?id=qwen3.8
- mlx-lm (herramienta de conversión e inferencia): https://github.com/ml-explore/mlx-lm

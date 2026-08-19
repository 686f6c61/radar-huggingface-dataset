# malekoo/Qwen3.8-27B-MLX-8bit

## Resumen

Este repositorio contiene una conversión a formato MLX con cuantización de 8 bits (group size 64, affine) del modelo Qwen3.8-27B, desarrollado por el equipo Qwen. La conversión ha sido realizada por el usuario malekoo mediante la herramienta mlx-lm, con el objetivo de permitir la ejecución del modelo en hardware Apple Silicon con un consumo de memoria reducido respecto al checkpoint original en bf16.

Qwen3.8-27B es el modelo denso compacto de la generación Qwen3.8, construido sobre la arquitectura Qwen3.5: 27 000 millones de parámetros, 64 capas en una combinación híbrida 3:1 de atención lineal Gated DeltaNet y atención completa con gates, con una ventana de contexto nativa de 262 144 tokens. El modelo incorpora un modo de pensamiento (thinking mode) activado por defecto, con control fino del esfuerzo de razonamiento mediante el parámetro `reasoning_effort`.

Esta conversión es exclusivamente de texto: elimina el codificador de visión y el módulo de predicción multi-token del modelo base, por lo que no acepta imágenes ni vídeo. La cuantización modifica la numerica del modelo, de modo que los resultados de benchmarks del modelo original no son directamente transferibles a este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida 3:1 de Gated DeltaNet linear attention y gated full attention (64 capas, 24Q/4KV, head dim 256) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | 8-bit (group size 64, affine); referencia a 4-bit en el harness de perplexity |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (formato nativo de mlx-lm) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet y atención completa con gates en proporción 3:1. Dispone de 64 capas, con 24 cabezas de consulta y 4 cabezas de clave/valor, dimensión de cabeza de 256 y un vocabulario de 248 320 tokens. El contexto nativo es de 262 144 tokens.

El modo de pensamiento está activado por defecto, con control del esfuerzo de razonamiento mediante `reasoning_effort` (valores `xhigh`, `medium` y `low`) y la opción `preserve_thinking`. La conversión a MLX se realizó con `mlx_lm.convert -q --q-bits 8 --q-group-size 64`, eliminando el codificador de visión y el drafter de predicción multi-token del checkpoint original. No se dispone de información sobre los datos de entrenamiento del modelo base en esta model card.

## Capacidades

- Generación de texto y conversación multi-turno.
- Modo de pensamiento (thinking mode) activado por defecto, con control del esfuerzo de razonamiento (`xhigh`, `medium`, `low`) y opción de preservar el razonamiento visible.
- Razonamiento y resolución de problemas con contexto largo gracias a la ventana de 262 144 tokens.
- Soporte de servidor OpenAI-compatible mediante `mlx_lm.server`.
- Capacidades multilingües: no especificadas en la model card de esta conversión.
- Tool calling / function calling: no especificado en la model card de esta conversión.
- Capacidades de visión: no disponibles en este artefacto (conversión solo texto).

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización de 8 bits permiten ejecutar el modelo en Macs con memoria unificada a partir de 32 GB, con un peso en disco de aproximadamente 29 GB.
- Servidor de generación de texto compatible con OpenAI: `mlx_lm.server` expone una API REST que permite integrar el modelo en aplicaciones existentes sin cambios en el código cliente.
- Análisis de documentos largos: la ventana de contexto de 262 144 tokens permite procesar documentos extensos o conversaciones de muchas vueltas sin truncamiento.
- Razonamiento complejo con modo pensamiento: el control de `reasoning_effort` permite ajustar la profundidad del razonamiento según la tarea, desde respuestas rápidas hasta análisis detallado.
- Prototipado de agentes conversacionales: la combinación de generación de texto y modo pensamiento facilita la construcción de asistentes que razonan antes de responder.
- Evaluación de modelos cuantizados: este artefacto sirve para medir el impacto de la cuantización de 8 bits en la calidad de salida respecto al modelo bf16 original.

## Benchmarks y rendimiento

La model card indica que la medición de perplexity en wikitext-2 está en progreso y se actualizará próximamente. Se proporcionan referencias del mismo harness para otras versiones:

| Version | Perplexity (wikitext-2) |
|---|---|
| bf16 (referencia) | 6.9352 |
| 4-bit (referencia) | 7.0871 |
| 8-bit (este artefacto) | Medicion en progreso |

No se han publicado otros resultados de benchmarks en la informacion disponible. Los números del modelo base no son transferibles a esta conversión debido a la cuantización.

## Requisitos de hardware

- Peso del artefacto: aproximadamente 29 GB en disco (8.501 bits efectivos por peso).
- Memoria unificada recomendada: al menos 32 GB para cargar el modelo y dejar margen para el contexto y la generación.
- GPU compatibles: Apple Silicon (serie M) con memoria unificada; no es compatible con GPUs NVIDIA o AMD en este formato.
- Opciones de despliegue: mlx-lm (generación por línea de comandos) y servidor OpenAI-compatible (`mlx_lm.server`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar las variantes de cuantización del mismo modelo base:

| Modelo | Formato | Peso en disco | Perplexity (wikitext-2) | Contexto |
|---|---|---|---|---|
| Qwen3.8-27B (bf16) | MLX bf16 | ~54 GB | 6.9352 | 262 144 |
| Qwen3.8-27B (4-bit) | MLX 4-bit | no disponible | 7.0871 | 262 144 |
| Qwen3.8-27B (8-bit, este artefacto) | MLX 8-bit | ~29 GB | en progreso | 262 144 |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto exclusivamente de texto: no acepta imágenes ni vídeo; para uso multimodal es necesario ejecutar el checkpoint original con Transformers, vLLM o SGLang.
- La cuantización de 8 bits altera la numerica del modelo; los benchmarks del modelo base no se transfieren a esta conversión.
- La perplexity de este artefacto aún no ha sido medida y publicada.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas específicas de esta conversión.
- Licencia Apache-2.0, que permite uso comercial, con atribución al equipo Qwen.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una conversión reciente y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/malekoo/Qwen3.8-27B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del equipo Qwen: https://qwen.ai/blog?id=qwen3.8
- Herramienta de conversión mlx-lm: https://github.com/ml-explore/mlx-lm

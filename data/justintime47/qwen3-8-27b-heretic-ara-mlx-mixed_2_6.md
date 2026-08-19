# justintime47/qwen3.8-27b-heretic-ara-mlx-mixed_2_6

## Resumen

El modelo `justintime47/qwen3.8-27b-heretic-ara-mlx-mixed_2_6` es una conversión MLX cuantizada de `trohrbaugh/Qwen3.8-27B-heretic-ara`, que a su vez deriva del Qwen3.8-27B de Qwen. Se trata de una variante "abliterated" (sin censura) y multimodal (image-text-to-text), optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX. El nombre "heretic" indica que se han eliminado los mecanismos de rechazo del modelo original, permitiendo respuestas sin restricciones de seguridad. La cuantización mixta (mixed_2_6) y el formato MLX reducen el tamaño y los requisitos de memoria, facilitando su despliegue en entornos locales. Aunque el nombre sugiere 27 mil millones de parámetros, los pesos cuantizados en safetensors suman aproximadamente 3,66 mil millones de parámetros, lo que indica una compresión significativa o una arquitectura particular. El modelo está licenciado bajo Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basada en Qwen3.8-27B |
| Parámetros totales | 3.664.235.760 (según safetensors; el nombre indica 27B, posiblemente del modelo original) |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B tiene 262K tokens, no confirmado para esta versión) |
| Tipos de cuantización | 4-bit, método mixto "mixed_2_6" (posible mezcla de 2 y 6 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una adaptación MLX del Qwen3.8-27B, un transformer denso de visión-lenguaje desarrollado por Qwen. La variante "heretic-ara" ha sido sometida a un proceso de "abliteration" (ablación de rechazos), que elimina las capas o pesos responsables de generar respuestas de rechazo, resultando en un modelo sin filtros de seguridad. Posteriormente, se ha cuantizado a 4 bits utilizando el método AWQ con una predicación mixta "mixed_2_6", que probablemente asigna diferentes precisiones (2 y 6 bits) a distintas capas para optimizar el equilibrio entre calidad y tamaño. El entrenamiento específico de esta versión no está documentado; se basa en el modelo original de Qwen, cuyos datos de entrenamiento no se detallan aquí.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto, respondiendo preguntas sobre el contenido visual.
- Razonamiento paso a paso y resolución de problemas matemáticos (según evaluación MathVision del modelo base).
- Soporte de tool calling y function calling (heredado de Qwen3.8, aunque no confirmado explícitamente en esta versión).
- Capacidades agénticas de largo horizonte (según descripción del Qwen3.8-27B original).
- Multilingüe (probable, dado el modelo base, pero no especificado).
- Ausencia de censura: al ser "abliterated", no rechaza solicitudes que el modelo original podría considerar inapropiadas.

## Casos de uso

- Asistente personal local en Apple Silicon: gracias a su formato MLX, puede ejecutarse en Mac con memoria unificada, ofreciendo respuestas sin censura en conversaciones privadas.
- Análisis de imágenes sin restricciones: útil para tareas de visión por computador donde se requiere interpretar contenido sensible o controvertido sin filtros.
- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin alineación y comparar con versiones alineadas.
- Generación de contenido creativo: redacción de textos, guiones o ideas que podrían ser bloqueados por modelos estándar.
- Desarrollo de agentes autónomos: al soportar tool calling y razonamiento, puede integrarse en pipelines de automatización.
- Educación y experimentación: probar técnicas de cuantización y abliteración en entornos de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión MLX cuantizada. El modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` menciona evaluación en MathVision, pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- Al ser MLX, está optimizado para Apple Silicon (M1, M2, M3, M4, etc.) con memoria unificada.
- El tamaño del repositorio es de 12.1 GB, lo que sugiere que se necesita al menos 12 GB de RAM libre, aunque el uso real puede variar.
- Para una Mac con 16 GB de RAM o más, es viable ejecutar el modelo con cuantización 4-bit.
- Opciones de despliegue: MLX (mlx-vlm), también puede ejecutarse en otros frameworks si se convierte, pero no es el objetivo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | safetensors | Modelo base, sin cuantizar, con alineación |
| Qwen3.8-27B-heretic-ara | 27B (aprox.) | no disponible | Apache 2.0 | safetensors | Variante abliterada, sin censura |
| Este modelo (MLX) | 3.66B (cuantizado) | no disponible | Apache 2.0 | MLX safetensors | Versión cuantizada 4-bit para Apple Silicon |

No se dispone de comparativas con otros modelos de la misma categoría en cuanto a rendimiento.

## Limitaciones y advertencias

- Al ser "uncensored" o "abliterated", el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No debe usarse en aplicaciones donde se requiera moderación de contenido.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados.
- La cuantización mixta puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original de 27B.
- No se garantiza el soporte de todos los idiomas; la información no está disponible.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado es responsabilidad del usuario.
- El modelo no está alineado con valores de seguridad, por lo que no es adecuado para entornos de producción donde se requiera un comportamiento ético.

## Enlaces

- [HuggingFace - justintime47/qwen3.8-27b-heretic-ara-mlx-mixed_2_6](https://huggingface.co/justintime47/qwen3.8-27b-heretic-ara-mlx-mixed_2_6)
- [Modelo base - trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara)
- [Blog AMD sobre Qwen3.8-27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [AI Release Tracker - Qwen3.8-27B](https://aireleasetracker.com/model/qwen/qwen3.8-27b)
- [LM Studio - Qwen3.8](https://lmstudio.ai/models/qwen3.8)
- [Guía de despliegue local](https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026)

# nightscape/Intern-S2-Mobius-4bit-mlx

## Resumen

Intern-S2-Mobius-4bit-mlx es una cuantización MLX de 4 bits del modelo Intern-S2-Mobius, un modelo fundacional de 35B parámetros desarrollado por InternLM sobre la arquitectura Mobius-v0. Esta arquitectura desacopla el almacenamiento de conocimiento del razonamiento: el conocimiento se organiza en una memoria global compartida y múltiples "razonadores" consultan y refinan iterativamente los estados ocultos contra esa memoria, en lugar de acoplar ambas funciones capa a capa como en los Transformers convencionales. El resultado es una compresión superior del conocimiento, lo que permite alcanzar rendimientos similares a un Transformer de 35B con menos datos de entrenamiento y una aceleración de inferencia de casi 4x.

Esta conversión concreta, publicada por el usuario nightscape, adapta el modelo a Apple Silicon mediante el ecosistema MLX, reduciendo el peso a aproximadamente 19,5 GB con una cuantización 4-bit affine (group size 64) y manteniendo los gates de los expertos compartidos en 8 bits. El modelo conserva la arquitectura híbrida original: atención lineal Gated-DeltaNet intercalada con atención completa cada 4 capas, y un MoE con 2560 expertos distribuidos en 4 bancos compartidos globalmente. Con una ventana de contexto de 262.144 tokens, está orientado a tareas de generación de texto con razonamiento complejo y manejo de contextos muy largos, aunque esta versión MLX solo carga el modelo de lenguaje (sin torre de visión).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | interns2_mobius (híbrido: Gated-DeltaNet + atención completa cada 4 capas, MoE con 2560 expertos en 4 bancos compartidos) |
| Parametros totales | 5.421.296.768 (cuantizado, safetensors); el modelo base tiene 35B |
| Parametros activos | no disponible (MoE con top-8, no se especifica el número de activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit affine (group size 64), gates de expertos y router a 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Intern-S2-Mobius emplea la arquitectura Mobius-v0, que separa el conocimiento (almacenado en una memoria global compartida) del razonamiento (realizado por múltiples "razonadores" que consultan y refinan iterativamente los estados ocultos). Esta separación permite una mayor compresión del conocimiento: el modelo de 7B entrenado desde cero alcanza un rendimiento similar a un Transformer de 7B con solo el 62,6% de los datos de entrenamiento, y el modelo de 35B, pre-entrenado continuamente desde Qwen3.5-35B, logra un rendimiento comparable con una aceleración de inferencia de casi 4x respecto a un Transformer estándar.

La capa de atención combina Gated-DeltaNet (atención lineal) con atención completa a intervalos de 4 capas, y el MoE utiliza 2560 expertos en 4 bancos compartidos globalmente con selección top-8. La conversión MLX mantiene esta arquitectura, pero solo carga el modelo de lenguaje (sin el componente de visión del checkpoint original). La cuantización 4-bit affine con group size 64 reduce el peso a ~4,5 bits por parámetro, manteniendo los gates de los expertos y el router en 8 bits para preservar la precisión en las rutas críticas. El checkpoint incluye código personalizado (tokenizer y modelo) que requiere `--trust-remote-code` en mlx-lm.

## Capacidades

- Generación de texto con razonamiento complejo y manejo de contextos muy largos (hasta 262K tokens).
- Razonamiento matemático y lógico: el modelo alcanza un 97-98% en GSM8K (con presupuesto de generación suficiente) y un 88,3% en MMLU-Pro en esta conversión 4-bit.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible, aunque la arquitectura base podría soportarlo; no se confirma.
- Capacidades multilingües: no especificadas; el modelo base de InternLM suele ser multilingüe, pero no hay datos concretos para esta conversión.
- Solo texto: esta versión MLX no incluye la torre de visión del checkpoint original (etiquetado como image-text-to-text), por lo que no procesa imágenes.
- Compatibilidad con el ecosistema MLX: se integra con mlx-lm y con el servidor omlx (que además soporta un head MTP experimental para predicción multi-token).

## Casos de uso

- Análisis y resumen de documentos extensos: gracias a su ventana de contexto de 262K tokens, el modelo puede procesar libros completos, informes técnicos o expedientes legales en una sola pasada, generando resúmenes estructurados o extrayendo información relevante sin necesidad de fragmentar el texto.
- Asistente de razonamiento matemático y científico: su alto rendimiento en GSM8K y MMLU-Pro lo hace adecuado para resolver problemas de cálculo, álgebra o física paso a paso, útil en entornos educativos o de investigación.
- Generación de código con contexto amplio: aunque no se documenta soporte explícito de tool calling, el modelo puede generar y depurar código en proyectos grandes donde es necesario mantener el contexto de múltiples archivos o funciones relacionadas.
- Chat conversacional de largo recorrido: su capacidad de mantener contexto extendido permite diálogos multi-turno con memoria de conversaciones anteriores, útil para asistentes virtuales o agentes de atención al cliente.
- Razonamiento multi-paso y planificación: la arquitectura Mobius, con su memoria global compartida, facilita tareas que requieren encadenar varios pasos de razonamiento, como planificación de tareas, análisis de causa-efecto o resolución de problemas complejos.
- Despliegue en Apple Silicon para prototipado y desarrollo local: al ser una cuantización MLX, puede ejecutarse en Macs con suficiente memoria unificada (24-32 GB), permitiendo a desarrolladores probar el modelo localmente sin necesidad de GPUs dedicadas, integrándolo en pipelines de generación de texto o agentes.

## Benchmarks y rendimiento

La model card de esta conversión 4-bit reporta los siguientes resultados, comparados con el modelo base en bf16:

| Benchmark | Intern-S2-Mobius 4-bit MLX | Intern-S2-Mobius bf16 (upstream) |
|---|---|---|
| MMLU-Pro | 88,3% ± 4,1 (n=60) | 89,05% |
| GSM8K | 97-98% (n=100) | no disponible |

Nota: los resultados se obtuvieron con un presupuesto de generación corto, lo que trunca la cadena de razonamiento (chain-of-thought) y puede deprimir las puntuaciones. El autor indica que es un artefacto de evaluación, no una pérdida real de capacidad. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~19,6 GB de memoria unificada (pico), según la model card.
- GPU recomendadas: Apple Silicon con al menos 24 GB de RAM unificada (por ejemplo, M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores). No es compatible con GPUs NVIDIA/AMD en este formato MLX.
- Si cabe en consumer GPU: no, porque MLX está diseñado exclusivamente para Apple Silicon; no se puede ejecutar en GPUs de escritorio convencionales.
- Opciones de despliegue: mlx-lm (generación CLI y API), servidor omlx (con soporte opcional del head MTP experimental). No es compatible con vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento (MMLU-Pro) |
|---|---|---|---|---|---|
| Intern-S2-Mobius (bf16) | 35B | 262K | Apache-2.0 | Transformers (bf16) | 89,05% |
| Intern-S2-Mobius-4bit-mlx (este) | 35B (cuantizado a ~5,4B de pesos) | 262K | Apache-2.0 | MLX 4-bit | 88,3% |
| Qwen3.5-35B (modelo base del pre-entrenamiento) | 35B | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de 35B no está disponible en la información proporcionada. La principal diferencia con el modelo base es el formato (MLX vs Transformers) y la cuantización (4-bit vs bf16), con una pérdida de rendimiento mínima en MMLU-Pro (0,75 puntos porcentuales). El modelo base se deriva de Qwen3.5-35B mediante pre-entrenamiento continuo, pero no se dispone de benchmarks comparativos entre ambos.

## Limitaciones y advertencias

- Solo texto: esta conversión MLX no incluye la torre de visión del checkpoint original, por lo que no puede procesar imágenes a pesar de que el modelo base está etiquetado como image-text-to-text.
- Requiere `--trust-remote-code`: el checkpoint incluye código personalizado (tokenizer y modelo) que debe ejecutarse con confianza; esto implica un riesgo de seguridad si el código no es auditado.
- No compatible con transformers estándar: la arquitectura `interns2_mobius` no está integrada en la librería transformers, por lo que solo puede usarse con mlx-lm o el servidor omlx.
- Posible degradación por cuantización: aunque los benchmarks muestran una pérdida mínima, la cuantización 4-bit puede afectar a tareas muy sensibles a la precisión numérica (por ejemplo, matemáticas de alta exactitud o generación de código con sintaxis estricta).
- Artefactos de evaluación: los resultados de benchmarks se obtuvieron con presupuestos de generación cortos que truncan la cadena de razonamiento; en uso real con generación completa, el rendimiento podría ser superior.
- Idiomas no especificados: no se documenta qué idiomas soporta esta conversión; el modelo base de InternLM suele ser multilingüe, pero no hay confirmación para esta versión.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el código personalizado incluido en el checkpoint debe revisarse para cumplir con los términos de la licencia original del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightscape/Intern-S2-Mobius-4bit-mlx
- Modelo base en HuggingFace: https://huggingface.co/internlm/Intern-S2-Mobius
- Repositorio GitHub del modelo base: https://github.com/InternLM/Intern-S2-Mobius
- Paper (arXiv): https://arxiv.org/abs/2608.14290v1
- PDF del paper: https://arxiv.org/pdf/2608.14290
- Head MTP experimental: https://huggingface.co/nightscape/Intern-S2-Mobius-4bit-mlx-mtp

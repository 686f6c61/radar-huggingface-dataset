# junafinity/Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4

## Resumen

Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4 es una conversión en formato MLX con precisión mixta MXFP4 del modelo abliterado de OrcaRouter, que a su vez deriva de Qwen/Qwen3.8-Flash-Next, un modelo multimodal MoE de 34 000 millones de parámetros que sirve como avance de la arquitectura Qwen4. El modelo original combina atención híbrida Gated DeltaNet (GDN) con QSA (Query-Selective Attention), incorpora una torre de visión y vídeo, un módulo de predicción multi-token (MTP) y una tabla de n-gramas de 51B para el decodificador PLE. Esta conversión mantiene la torre de visión en BF16, aplica MXFP4 a los tensores de puerta y proyección ascendente de los expertos enrutados y a la tabla n-grama, y conserva la cabeza MTP, lo que la hace adecuada para ejecución en Apple Silicon mediante oMLX o mlx-vlm.

La relevancia de este modelo radica en que ofrece una versión sin alineación de seguridad (abliterada) de un modelo de última generación, pensada exclusivamente para investigación en interpretabilidad, red-teaming y estudio de mecanismos de rechazo. Al estar cuantizado con una receta mixta que prioriza la calidad, evita el precipicio de calidad que sufren las cuantizaciones uniformes de 4 bits en esta arquitectura, aunque no se han publicado métricas de calidad para este archivo concreto. Su licencia es la Qwen Community License 1.0, que permite uso comercial con condiciones, pero su naturaleza sin guardarraíles lo desaconseja para despliegues en producción sin capas de moderación adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida GDN + QSA (preview de Qwen4), con torre de visión/vídeo, PLE y MTP |
| Parametros totales | 34 042 847 379 (34B) |
| Parametros activos | no disponible (arquitectura MoE, no se especifica el número de activos) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | MXFP4 (group-32) para gate/up de expertos y n-grama PLE; affine Q4/Q5/Q6/Q8 para el resto; BF16 para visión, embeddings y routers |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Qwen Community License 1.0 (licencia comunitaria, no OSI) |
| Formato de pesos | safetensors (MLX), 20 shards, 100.53 GB (93.63 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina Gated DeltaNet (GDN) con Gated Attention (QSA), una innovación que mejora la eficiencia computacional y la capacidad del modelo frente a la atención tradicional. Incluye además hiperconexiones residuales, un módulo de predicción multi-token (MTP) de una capa, y un decodificador basado en n-gramas (PLE) con una tabla de 51B entradas. La conversión de junafinity se realizó desde el checkpoint BF16 abliterado de OrcaRouter, no desde los pesos oficiales de Qwen, y aplica una receta de cuantización mixta basada en la prioridad de tensores: los tensores más sensibles (visión, embeddings, routers, normas) se mantienen en BF16, mientras que los expertos enrutados y la tabla n-grama usan MXFP4, y las proyecciones de atención y GDN usan formatos afines de 5-8 bits. No se utilizó calibración de sensibilidad ni imatrix; la receta es reproducible a partir de los nombres de los tensores. El proceso de conversión transmitió los 131 shards fuente sin materializar el modelo BF16 completo en RAM.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen, vídeo y texto, y produce texto (pipeline image-text-to-text).
- Razonamiento avanzado: hereda las capacidades de razonamiento del modelo Qwen3.8-Flash-Next, que según la documentación oficial supera a Claude-4.6-Opus (Max) en tareas complejas (dato del modelo original, no verificado en esta conversión).
- Function calling: soporte de tool calling integrado en la arquitectura base.
- Capacidades multilingües: inglés y chino principalmente, con posible transferencia a otros idiomas no verificada.
- Modo de razonamiento: el modelo base incluye modos de pensamiento (thinking) que se conservan en la conversión.
- Predicción multi-token (MTP): la cabeza MTP se mantiene en el checkpoint, lo que permite decodificación especulativa nativa en oMLX.
- Sin alineación de seguridad: al estar abliterado, no presenta rechazo ante solicitudes dañinas, lo que lo hace útil para investigación de seguridad, pero peligroso para uso general.

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo la abliteración elimina el rechazo y qué patrones internos cambian, usando este modelo como caso de estudio comparado con el original.
- Red-teaming y evaluación de robustez: probar la resistencia del modelo ante prompts adversariales y medir la eficacia de técnicas de mitigación de sesgos.
- Desarrollo de capas de moderación: al no tener guardarraíles, sirve como banco de pruebas para sistemas de filtrado y moderación de contenido en pipelines de producción.
- Experimentos de cuantización: analizar el impacto de la receta mixta MXFP4 en la calidad de salida frente a cuantizaciones uniformes, usando el modelo como referencia.
- Generación de contenido creativo sin restricciones: para entornos controlados donde se requiere máxima libertad creativa (por ejemplo, generación de ficción o guiones), siempre con supervisión humana.
- Evaluación de decodificación especulativa: probar la cabeza MTP conservada en oMLX para medir aceleración en inferencia en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la calidad de esta conversión MXFP4 no ha sido medida frente al BF16 original ni frente al FP8 oficial de Qwen. Se menciona que una cuantización uniforme de 4 bits en esta arquitectura produce un aumento del 20.6% en perplexity de WikiText, mientras que la receta mixta 4/8 bits sobre la línea oficial produce solo un +1.3%, pero no hay datos específicos para este archivo.

## Requisitos de hardware

- Plataforma: Apple Silicon (procesadores M-series) con memoria unificada, ya que es un formato MLX.
- Memoria estimada: el repositorio pesa 100.5 GB en disco, pero la memoria en uso durante inferencia será menor al cargar solo los pesos necesarios. Con 34B parámetros y cuantización mixta (mayoría en 4-8 bits), se estima un consumo de entre 20 y 40 GB de memoria unificada, dependiendo de la longitud de contexto y el batch. No se dispone de cifras exactas.
- GPU recomendadas: no aplica GPU NVIDIA; requiere Apple Silicon (M1 Pro/Max/Ultra o superiores). Modelos con 64 GB o más de memoria unificada son recomendables para contexto largo.
- Opciones de despliegue: oMLX 0.6.3+ (soporta visión y MTP nativo) o mlx-vlm ≥ 0.6.17 (soporta visión, pero descarta las claves MTP al cargar).
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP podría mejorar el throughput, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | MTP | Abliterado | Licencia |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (original) | 34B | 262K | BF16 (oficial) | Sí | No | Qwen Community |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | 34B | 262K | BF16 | Sí | Sí | Qwen Community |
| txgsync/Qwen3.8-Flash-Next-MXFP4-MLX | 34B | 262K | MXFP4 mixto | No | No | Qwen Community |
| junafinity/Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4 | 34B | 262K | MXFP4 mixto | Sí | Sí | Qwen Community |

La diferencia principal frente a txgsync es que esta conversión conserva la cabeza MTP y se deriva de un checkpoint abliterado, mientras que txgsync usa los pesos oficiales y omite MTP. Frente al modelo de OrcaRouter, esta versión reduce el tamaño de memoria al cuantizar, a costa de una posible pérdida de calidad no medida.

## Limitaciones y advertencias

- Abliteración: el modelo ha sido sometido a abliteración, lo que elimina sustancialmente la alineación de seguridad. Cumplirá con solicitudes dañinas, ilegales o poco éticas que el modelo original rechazaría.
- Sin guardarraíles: no tiene mecanismos de moderación integrados; cualquier despliegue en producción requiere capas externas de filtrado y moderación.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos.
- Idiomas limitados: solo se garantiza inglés y chino; el rendimiento en otros idiomas no está verificado.
- Calidad no medida: no se han publicado benchmarks de esta conversión; la calidad frente al BF16 original es desconocida.
- Licencia: la Qwen Community License 1.0 permite uso comercial pero con restricciones (por ejemplo, no usar para servicios que compitan con Qwen, y cumplir con la normativa de IA). No es una licencia de código abierto aprobada por OSI.
- Requisitos de runtime: requiere oMLX 0.6.3+ o mlx-vlm ≥ 0.6.17; versiones anteriores pueden fallar al cargar los pesos.
- Responsabilidad legal: el autor declina toda responsabilidad por uso indebido; el usuario asume plena responsabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/junafinity/Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo abliterado fuente: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Conversión MXFP4 oficial (sin MTP): https://huggingface.co/txgsync/Qwen3.8-Flash-Next-MXFP4-MLX
- Conversión mixta 4/8 bits (referencia de calidad): https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-mixed-4_8bit
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- Runtime oMLX: https://github.com/jundot/omlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm

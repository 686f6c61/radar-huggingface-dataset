# hermitdave/Qwen3.6-35B-A3B-MLX-3bit-mixed_3_8

## Resumen

El modelo `hermitdave/Qwen3.6-35B-A3B-MLX-3bit-mixed_3_8` es una conversión al formato MLX del modelo Qwen3.6-35B-A3B de Alibaba, cuantizado con una receta mixta de precisión 3/8 bits que protege los router gates del mecanismo de mezcla de expertos (MoE) y mantiene el codificador de visión en bf16 sin cuantizar. Se trata de un modelo multimodal que procesa texto, imagen y vídeo, con una arquitectura híbrida que combina atención lineal recurrente y atención completa, y que activa solo unos 3 mil millones de parámetros por token gracias a su diseño de 256 expertos con enrutamiento top-8.

Esta versión está pensada para ejecutarse en Apple Silicon con memoria unificada a partir de 16 GB, ocupando aproximadamente 19 GB en disco. Su relevancia radica en ofrecer un modelo multimodal de gran capacidad (35B totales) con un coste de inferencia reducido gracias a la combinación de MoE y cuantización mixta, manteniendo la calidad en las capas sensibles como los router gates y el vision tower. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE híbrido con atención lineal + atención completa) |
| Parametros totales | 35 mil millones |
| Parametros activos | ~3 mil millones (top-8 de 256 expertos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta 3/8 bits (grupo 64), visión en bf16, router gates forzados a 8 bits |
| Idiomas soportados | No disponible (el modelo base Qwen suele ser multilingüe, pero no se especifica en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con 256 expertos y enrutamiento top-8, lo que significa que solo 3 mil millones de parámetros se activan por token. Incorpora una atención híbrida que combina capas de atención lineal recurrente con capas de atención completa, un diseño que reduce el coste computacional en contextos largos pero que hace que el prefill sea más lento que el decode. El vocabulario alcanza los 248.320 tokens.

La conversión a MLX aplica una receta de cuantización mixta denominada `mixed_3_8`, que asigna 8 bits a las capas primera y última (1/8 del total), a cada tercera capa intermedia, a `v_proj`, `down_proj` y `lm_head`, y 3 bits al resto. Además, se fuerza a 8 bits todos los pesos de los router gates (`router.gate` y `router.linear`) para evitar degradaciones silenciosas en el enrutamiento. El codificador de visión se mantiene íntegramente en bf16 por su sensibilidad a la cuantización de baja precisión. No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento conversacional, con modo de pensamiento (thinking mode) activado por defecto en la plantilla de chat.
- Procesamiento multimodal: entrada de texto, imagen y vídeo, con salida de texto descriptivo o respuestas basadas en el contenido visual.
- Soporte de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno con historial amplio.
- Atención híbrida que combina capas recurrentes lineales y atención completa, optimizada para eficiencia en memoria y velocidad de decode.
- Capacidad de ejecución en Apple Silicon mediante MLX, con posibilidad de offloading a CPU gracias a la arquitectura MoE (solo se calculan los expertos activos por token).
- No se especifica soporte explícito de tool calling o function calling en la model card, aunque el modelo base Qwen3.6 podría incluirlo; no se confirma en esta conversión.

## Casos de uso

- Análisis de imágenes en entornos de investigación: el modelo puede describir o responder preguntas sobre fotografías, diagramas o capturas de pantalla, aprovechando el vision tower en bf16 para mantener fidelidad visual.
- Procesamiento de vídeo para generación de resúmenes o transcripciones descriptivas, gracias a su capacidad multimodal y al contexto largo.
- Asistentes conversacionales con memoria extendida: con 262.144 tokens de contexto, puede mantener conversaciones muy largas sin perder información relevante, útil para atención al cliente o tutorías.
- Lectura y comprensión de documentos extensos con figuras y tablas: el modelo combina texto e imagen, permitiendo extraer información de informes técnicos o artículos científicos.
- Prototipado rápido en Mac: al ser una conversión MLX, se integra fácilmente con `mlx-vlm` para experimentación local sin necesidad de GPU dedicada, ideal para desarrolladores que trabajan en Apple Silicon.
- Generación de descripciones accesibles (alt text) para contenido visual en plataformas web o redes sociales, automatizando la accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan comparativas con el modelo base sin cuantizar ni con otras conversiones.

## Requisitos de hardware

- Memoria mínima: 16 GB de memoria unificada en Apple Silicon (M1, M2, M3, M4).
- Memoria recomendada: 32 GB o más para disponer de margen de contexto cómodo.
- GPU: no requiere GPU dedicada; funciona en los chips de Apple con Neural Engine y GPU integrada.
- Tamaño en disco: aproximadamente 19 GB (4 shards de safetensors).
- Opciones de despliegue: mediante `mlx-vlm` (Python) o la CLI `python -m mlx_vlm.generate`. También es posible cargarlo con `lazy=True` para inspección de pesos.
- Rendimiento: no se especifican valores de latencia o throughput. La model card advierte que el prefill es más lento que el decode debido a las capas de atención lineal recurrente.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262.144 | Apache 2.0 | safetensors (bf16) |
| hermitdave/Qwen3.6-35B-A3B-MLX-3bit-mixed_3_8 | 35B | ~3B | 262.144 | Apache 2.0 | safetensors (MLX, 3/8 bits) |
| hermitdave/qwen36-35b-a3b-p2-iq-mix | 35B | ~3B | 262.144 | Apache 2.0 | safetensors (MLX, IQ mix) |

No se dispone de datos de benchmarks para comparar el rendimiento real entre estas versiones. La comparativa se limita a características estructurales. El modelo base y sus conversiones comparten la misma arquitectura y licencia; la diferencia principal radica en el esquema de cuantización y el formato de pesos.

## Limitaciones y advertencias

- La cuantización 3-bit en la mayoría de las capas puede provocar una pérdida de calidad en tareas que requieren precisión numérica alta, aunque las capas sensibles (router gates, lm_head, primeras y últimas capas) se mantienen en 8 bits.
- El modo de pensamiento (thinking mode) está activado por defecto en la plantilla de chat; si no se desea, hay que desactivarlo explícitamente con `chat_template_kwargs={"enable_thinking": false}`.
- El prefill es más lento que el decode debido a las capas de atención lineal recurrente; esto puede afectar a la latencia en tareas de generación de respuestas largas.
- No se especifican los idiomas soportados; aunque el modelo base Qwen suele ser multilingüe, esta conversión no documenta la cobertura idiomática.
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinación para esta conversión concreta.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente o poco probada; se recomienda validar su comportamiento en el caso de uso previsto antes de desplegarla en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base cumple con los términos de uso de Alibaba (aunque Apache 2.0 es permisiva, conviene revisar las condiciones específicas del modelo original).

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/hermitdave/Qwen3.6-35B-A3B-MLX-3bit-mixed_3_8
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Conversión alternativa del mismo autor (IQ mix): https://huggingface.co/hermitdave/qwen36-35b-a3b-p2-iq-mix
- Informe sobre fine-tunes MLX de Qwen3.6-35B-A3B: https://github.com/manjufkanavi/skills/blob/main/deep-research/reports/qwen36-35b-a3b-mlx-finetunes-20260815.md
- Guía de ejecución local de Qwen 3.6 35B MoE: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Página de Ollama para qwen3.6:35b-a3b: https://ollama.com/library/qwen3.6:35b-a3b

# inference-optimization/DeepSeek-V4-Flash-NVFP4-REAP-50

## Resumen

DeepSeek-V4-Flash-NVFP4-REAP-50 es una variante optimizada del modelo DeepSeek-V4-Flash, publicada por el usuario inference-optimization en Hugging Face. El modelo original, desarrollado por DeepSeek, es un LLM de tipo Mixture-of-Experts (MoE) con 284 mil millones de parámetros totales y 13 mil millones activos, diseñado para manejar contextos de hasta un millón de tokens. Esta variante concreta, cuyo nombre indica una cuantización NVFP4 (formato de 4 bits de NVIDIA) y una poda mediante el método REAP (aparentemente al 50% de sparsity), presenta un peso en safetensors de 84.724.287.577 parámetros, lo que sugiere una reducción significativa respecto al modelo original.

El repositorio fue creado en agosto de 2026 y ha recibido solo 10 descargas, sin información pública sobre licencia, pipeline o idiomas soportados. Dado que el modelo base DeepSeek-V4-Flash incorpora innovaciones como atención híbrida CSA+HCA, hyper-connections y tres niveles de razonamiento, esta versión cuantizada busca facilitar el despliegue en entornos con recursos limitados, aunque no se dispone de documentación oficial que confirme el proceso de cuantización ni sus implicaciones en el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención híbrida CSA+HCA y hyper-connections (según el modelo base) |
| Parametros totales | 84.724.287.577 (según safetensors) |
| Parametros activos | No disponible (el modelo base tiene 13B activos) |
| Longitud de contexto | 1.000.000 tokens (según el modelo base, no confirmado para esta variante) |
| Tipos de cuantizacion | NVFP4 (4 bits) según el nombre; el tag indica "8-bit" sin más detalle |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash emplea una arquitectura MoE con 284B parámetros totales y 13B activos por token, utilizando una atención híbrida combinando CSA (Cross-Self Attention) y HCA (Hybrid Chunk Attention) para gestionar eficientemente secuencias de un millón de tokens. También incorpora hyper-connections restringidas a un manifold, que mejoran la propagación del gradiente en redes profundas, y un sistema de razonamiento en tres niveles: Non-think, Think High y Think Max, que permite ajustar el esfuerzo computacional según la tarea.

En cuanto a la variante NVFP4-REAP-50, se desconoce el proceso exacto de entrenamiento o ajuste. El nombre sugiere una cuantización a 4 bits (NVFP4) y una poda estructural mediante REAP (una técnica de poda de canales) que reduce el número de parámetros activos. El peso de 84.7B indica una reducción drástica respecto a los 284B originales, pero no se ha publicado documentación sobre el dataset, el número de tokens de entrenamiento o si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo, heredado del modelo base DeepSeek-V4-Flash, con soporte para tareas de matemáticas, lógica y análisis.
- Razonamiento en tres niveles (Non-think, Think High, Think Max) que permite controlar el esfuerzo de inferencia, aunque no se ha confirmado si esta variante conserva esa funcionalidad.
- Soporte de tool calling y function calling, probablemente heredado del modelo base, aunque no se ha verificado en esta versión.
- Capacidad para manejar contextos de hasta un millón de tokens, lo que permite procesar documentos extensos, bases de código completas o conversaciones muy largas.
- Capacidades multilingües del modelo base, aunque no se especifica la lista de idiomas para esta variante.
- No se dispone de información sobre capacidades de visión o audio en esta variante.

## Casos de uso

- Análisis de documentos extensos: el modelo puede procesar informes, artículos o contratos de gran tamaño gracias a su contexto de un millón de tokens, permitiendo resumir, extraer información y responder preguntas sobre el contenido completo.
- Generación de código en entornos de producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar, generar o completar código, aunque se debe validar su rendimiento tras la cuantización.
- Asistencia a la investigación académica: puede ayudar a revisar artículos científicos, comparar metodologías y generar borradores de resúmenes, aprovechando el contexto largo para mantener el hilo de la discusión.
- Automatización de atención al cliente: con su capacidad de razonamiento multinivel, puede gestionar conversaciones complejas con historial extenso, resolviendo consultas técnicas o reclamaciones.
- Creación de contenido multilingüe: puede redactar textos en varios idiomas (si los soporta), aunque se debe comprobar la calidad en cada idioma.
- Despliegue en entornos con recursos limitados: gracias a la cuantización NVFP4 y la poda, el modelo podría caber en GPUs de 48 GB o menos, permitiendo inferencia local sin necesidad de clusters grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para esta variante concreta. El modelo base DeepSeek-V4-Flash ha sido evaluado en el paper correspondiente, pero no se incluyen resultados aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: con 84.7B parámetros en formato NVFP4 (4 bits), el peso del modelo sería aproximadamente de 42 GB (84.7B × 0,5 bytes), pero el tamaño del repositorio es de 91 GB, lo que sugiere que puede incluir pesos en formato FP8 o FP16 adicionales. La VRAM necesaria dependerá de la cuantización final utilizada.
- GPUs recomendadas: para inferencia con 4 bits, una GPU con 48 GB de VRAM (como A6000 o L40S) podría ser suficiente. Para mayor velocidad, una A100 de 80 GB o H100 permitiría cargar el modelo sin problemas.
- En GPU de consumo: no cabe en GPUs de 24 GB (como RTX 4090) si el modelo requiere más de 42 GB; solo sería viable con cuantización de 2-3 bits, no confirmada.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI pueden soportar modelos cuantizados, pero la compatibilidad con NVFP4 depende del backend. vLLM tiene soporte para FP4 en algunos modelos.
- Latencia y throughput: no se ha estimado por falta de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Flash (base) | 284B (13B activos) | 1M tokens | MIT (según DeepSeek) | Modelo original sin cuantizar |
| DeepSeek-V4-Pro | 1,6T (49B activos) | 1M tokens | MIT | Versión más grande |
| Esta variante NVFP4-REAP-50 | 84,7B | No confirmado | No disponible | Cuantizado y podado |

No se dispone de comparativa con otros modelos de tamaño similar como Qwen o Llama, ya que no hay datos de rendimiento.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar el uso comercial sin revisar los términos del repositorio.
- No se han documentado los procesos de cuantización y poda; la pérdida de calidad puede ser significativa, especialmente en tareas de razonamiento complejo.
- La alucinación es un riesgo inherente a los modelos de lenguaje, y esta variante no está exenta, especialmente en contextos de dominio específico.
- La longitud de contexto de 1M tokens puede degradar la calidad en secuencias muy largas, y el modelo puede sufrir pérdidas de atención en pasajes intermedios.
- Los idiomas soportados no están especificados, por lo que el rendimiento en idiomas distintos del inglés puede ser impredecible.
- El modelo no ha sido evaluado en benchmarks públicos, por lo que no se puede comparar su fiabilidad con otras alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/inference-optimization/DeepSeek-V4-Flash-NVFP4-REAP-50
- Modelo base DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Paper DeepSeek-V4: https://arxiv.org/abs/2606.19348
- Sitio web de DeepSeek: https://deepseek.com/en/index.html
- Recetas vLLM para DeepSeek-V4-Flash: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
- OpenLM.AI sobre DeepSeek-V4: https://openlm.ai/deepseek-v4/

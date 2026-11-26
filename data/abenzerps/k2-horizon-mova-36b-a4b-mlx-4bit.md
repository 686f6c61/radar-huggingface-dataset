# abenzerps/K2-Horizon-MoVA-36B-A4B-MLX-4bit

## Resumen

K2-Horizon-MoVA-36B-A4B-MLX-4bit es una conversión a 4 bits en formato MLX del modelo IFM/K2-Horizon-MoVA-36B-A4B, desarrollado por IFM y cuantizado por el usuario abenzerps. Se trata de un modelo de mezcla de expertos (MoE) disperso con 36B parámetros totales y aproximadamente 4B parámetros activos por token, que incorpora una innovación de atención denominada Mixture-of-Values attention (MoVA). El checkpoint original soporta una longitud de contexto nativa de 524.288 tokens (512K), lo que lo sitúa en la categoría de modelos de contexto largo.

La relevancia de esta versión concreta radica en su formato: al estar cuantizada a 4 bits con MLX, reduce el peso del repositorio a 21,07 GB, lo que permite ejecutar un modelo de 36B parámetros en hardware Apple Silicon con memoria unificada, algo inviable con los pesos en precisión completa. La cuantización mantiene los pesos del router MoE y MoVA en 8 bits, mientras que el resto de pesos elegibles usan cuantización afín de 4 bits con tamaño de grupo 64.

El modelo es solo de texto (no incluye proyector de visión), está etiquetado únicamente para inglés y se distribuye bajo licencia Apache-2.0. Su pipeline es text-generation y requiere la implementación personalizada del modelo incluida en el repositorio, además de una versión reciente de mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa y Mixture-of-Values attention (MoVA) |
| Parametros totales | 37.444.792.020 (≈36B según nomenclatura del autor) |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | 524.288 tokens (512K) nativa en el checkpoint original; la longitud usable depende de la memoria unificada y la configuración del KV-cache |
| Tipos de cuantizacion | Afín 4 bits con tamaño de grupo 64; router MoE y MoVA en 8 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors MLX (21,07 GB); incluye chat_template.jinja, implementación personalizada del modelo y SHA256SUMS |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos dispersa: de los 36B parámetros totales, solo unos 4B se activan por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La innovación destacable es la Mixture-of-Values attention (MoVA), un mecanismo de atención que el autor del modelo base introduce y que da nombre a la variante. El checkpoint soporta de forma nativa 512K tokens de contexto, lo que exige estrategias de gestión de KV-cache eficientes en el despliegue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de esta conversión no detalla el proceso de entrenamiento del modelo base, solo remite al repositorio de IFM. Esta versión es una cuantización, no un reentrenamiento: los pesos se transforman a 4 bits (8 bits para routers) y se mantiene la plantilla de chat compatible con el origen.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline text-generation.
- Razonamiento y respuesta multi-turno gracias a la plantilla de chat incluida (chat_template.jinja).
- Procesamiento de contexto largo: hasta 512K tokens nativos, útil para documentos extensos, aunque limitado por la memoria disponible.
- Mezcla de expertos con ~4B parámetros activos, lo que ofrece un equilibrio entre capacidad del modelo y coste de inferencia.
- Atención MoVA (Mixture-of-Values) como mecanismo diferencial frente a transformers convencionales.
- No incluye capacidades de visión (release solo texto, sin proyector visual).
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.
- No se documentan capacidades de audio.

## Casos de uso

- Análisis de documentos largos en local: con 512K tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de código extensas en una sola pasada, siempre que la memoria unificada del equipo lo permita ajustando el KV-cache.
- Asistente conversacional en Mac con Apple Silicon: la cuantización 4-bit MLX (21,07 GB) permite ejecutar un modelo de 36B en equipos con memoria unificada suficiente, sin depender de GPUs dedicadas ni de la nube.
- Prototipado e investigación en arquitecturas MoE: al incluir la implementación personalizada del modelo y los routers en 8 bits, sirve para estudiar el comportamiento de MoVA y de la mezcla de expertos en inferencia local.
- Generación de texto y resumen en pipelines de mlx-lm: se integra con `mlx_lm.generate` y puede incorporarse a scripts de procesamiento por lotes en entornos macOS.
- Evaluación de cuantizaciones: útil para comparar la calidad de la versión 4-bit frente al checkpoint original de IFM en tareas de texto, midiendo la degradación introducida por la cuantización.
- Desarrollo de aplicaciones de privacidad estricta: al ejecutarse íntegramente en local, permite procesar texto sensible sin enviar datos a servicios externos.
- Experimentación con contexto largo: escenarios de recuperación de información sobre corpus extensos donde se quiera medir el rendimiento real de la ventana de 512K con memoria limitada.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de benchmarks (`assets/k2-horizon-mova-36b-a4b-benchmarks.png`) reportados por IFM para el checkpoint original K2-Horizon-MoVA-36B-A4B, pero los valores numéricos no están disponibles en formato textual en la información proporcionada. No se han publicado resultados de benchmarks de esta conversión 4-bit MLX en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 21,07 GB en safetensors 4-bit; se necesita memoria unificada adicional para el KV-cache, especialmente con contextos largos.
- Hardware objetivo: Apple Silicon con memoria unificada (MLX está diseñado para chips Apple M-series); no es un formato para GPUs NVIDIA.
- No cabe en GPUs consumer convencionales de 8-12 GB; requiere equipos Apple con memoria unificada amplia (por encima de los 24-32 GB para uso cómodo, y bastante más para aprovechar el contexto de 512K).
- Despliegue: mlx-lm (versión reciente obligatoria por la implementación personalizada del modelo); el comando de ejemplo es `mlx_lm.generate --model abenzerps/K2-Horizon-MoVA-36B-A4B-MLX-4bit`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-MLX-4bit | ≈36B (37,44B reales) | ≈4B | 512K | Safetensors MLX 4-bit | Apache-2.0 | Hugging Face (226 descargas, 4 likes) |
| IFM/K2-Horizon-MoVA-36B-A4B (original) | ≈36B | ≈4B | 512K | Safetensors (precisión original) | Apache-2.0 | Hugging Face |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta conversión y el checkpoint original ni con otros modelos MoE de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según los metadatos del modelo; no se declara soporte multilingüe.
- Modelo solo de texto: no incluye visión ni audio.
- La cuantización 4-bit puede degradar la calidad respecto al checkpoint original; los routers se mantienen en 8 bits para mitigar parte de este efecto, pero no se aportan métricas de la pérdida.
- La ventana de 512K es nativa del modelo base, pero el contexto usable real depende de la memoria unificada disponible y de la configuración del KV-cache; no debe asumirse que se alcance en hardware modesto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base IFM y las condiciones de la cuantización.
- Requiere una versión reciente de mlx-lm y la implementación personalizada incluida; no es compatible con stacks estándar como vLLM, TGI o llama.cpp sin conversión adicional.
- No se documenta soporte de tool calling ni de agentes multi-paso, por lo que no debe asumirse en producción sin validación previa.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/abenzerps/K2-Horizon-MoVA-36B-A4B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Revisión del modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B/commit/05cab0a4d7150c1c460a000b37ff40cc1af2feaa
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Checksums (SHA256SUMS): https://huggingface.co/abenzerps/K2-Horizon-MoVA-36B-A4B-MLX-4bit/blob/main/SHA256SUMS
- Plantilla de chat: https://huggingface.co/abenzerps/K2-Horizon-MoVA-36B-A4B-MLX-4bit/blob/main/chat_template.jinja
- Solicitudes de modelos del autor: https://abenzerps.com/request-a-model/

# monate615/logicpeak-albedo-qwen3.6-35b-raft-g1-1a279d6e

## Resumen

El modelo logicpeak-albedo-qwen3.6-35b-raft-g1-1a279d6e, desarrollado por monate615, es un checkpoint especializado de la familia Qwen3.6, concretamente la variante 35B-A3B de arquitectura Mixture-of-Experts (MoE). Con 35.107 millones de parámetros totales y aproximadamente 3 mil millones activos por token, el modelo está diseñado para tareas de razonamiento lógico y conversación multimodal, ya que su pipeline es image-text-to-text. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, aunque el acceso está restringido y requiere aceptar condiciones en HuggingFace.

El nombre "logicpeak" sugiere un ajuste fino orientado a razonamiento lógico, mientras que "raft" podría indicar un entrenamiento con retroalimentación por refuerzo o un método de ajuste fino específico, aunque no hay documentación pública que confirme esta hipótesis. El modelo hereda las capacidades de la familia Qwen3.6, incluyendo tool calling y soporte para agentes, y añade procesamiento de imágenes, lo que lo hace relevante para aplicaciones multimodales en entornos de producción con recursos limitados gracias a su arquitectura MoE.

La relevancia de este checkpoint radica en su combinación de eficiencia computacional (solo 3B activos) con capacidades multimodales y razonamiento, una combinación poco frecuente en modelos de este tamaño. Sin embargo, la falta de documentación técnica y de benchmarks publicados limita su evaluación objetiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) basada en Qwen3.6 35B-A3B |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | ~3B (estimado según arquitectura Qwen3.6 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Transformer con mezcla de expertos (MoE), siguiendo el diseño de Qwen3.6 35B-A3B. Esta configuración sparse activa solo 3 mil millones de parámetros por token, lo que reduce el coste computacional en comparación con un modelo denso de tamaño equivalente. El tag "qwen3_5_moe" en el repositorio confirma la base MoE. Además, el pipeline image-text-to-text indica que el modelo incorpora un codificador visual y un adaptador multimodal, lo que le permite procesar imágenes y texto de forma conjunta.

El entrenamiento específico de este checkpoint no está documentado. El nombre "logicpeak" sugiere un ajuste fino orientado a razonamiento lógico, y "raft" podría referirse a un método de refuerzo con retroalimentación de árbol, aunque no hay información pública sobre el dataset o el proceso de entrenamiento. No se han publicado detalles sobre la composición de los datos de preentrenamiento ni sobre el uso de técnicas como RLHF o DPO en este modelo.

## Capacidades

- Generación de texto y conversación multimodal (entrada de texto e imagen).
- Razonamiento lógico y matemático, probablemente mejorado por el ajuste fino "logic".
- Soporte de tool calling y function calling, herencia de la familia Qwen3.6.
- Capacidades de agente y razonamiento multi-paso.
- Procesamiento de imágenes: puede extraer información de capturas, diagramas o documentos escaneados.
- Posible modo "thinking" o razonamiento extendido, si la familia Qwen3.6 lo incorpora.
- Integración con pipelines de inferencia estándar (transformers, vLLM, TGI).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (si se confirma la ventana de contexto heredada de Qwen3.6), incluyendo imágenes de productos o capturas de pantalla de errores.
- Análisis de documentos técnicos: al aceptar entradas de imagen, puede extraer contenido de diagramas, esquemas o documentos escaneados y razonar sobre ellos.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, revisar PRs o generar tests unitarios.
- Asistentes de investigación: el razonamiento multimodal permite sintetizar información de gráficos y tablas, comparar datos y generar hipótesis.
- Revisión de contratos o informes legales: puede procesar documentos largos y extraer cláusulas relevantes, combinando texto e imágenes de firmas o anexos.
- Agentes autónomos en entornos virtuales: con tool calling y procesamiento de imágenes, puede interactuar con interfaces de usuario y ejecutar acciones.
- Traducción y resumen de contenido: puede traducir texto e imágenes con texto superpuesto, aunque la lista de idiomas soportados no está confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este checkpoint específico en HuggingFace ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada: con 35,1B parámetros totales en precisión BF16, se requieren aproximadamente 70 GB de VRAM. Con cuantizaciones de 4 bits (Q4) se reduciría a unos 18-20 GB, aunque no se ha confirmado la disponibilidad de cuantizaciones para este modelo.
- GPU recomendadas: para inferencia sin cuantizar, se necesitan GPUs como A100 (80 GB), H100 (80 GB) o configuración multi-GPU. Con cuantización Q4, podría ejecutarse en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Compatibilidad con consumer GPU: posible con cuantizaciones bajas (Q4) en GPUs de 24 GB, pero el rendimiento puede verse limitado por la memoria.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se generan GGUF) y transformers. El tag "endpoints_compatible" sugiere compatibilidad con servicios de inferencia como FriendliAI.
- Latencia y throughput: no hay datos disponibles para este checkpoint. En modelos MoE de tamaño similar, se espera un throughput de 50-100 tokens por segundo en una A100, dependiendo de la cuantización y el batch size.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|---|
| logicpeak-albedo-qwen3.6-35b (este) | 35,1B | ~3B | no disponible | Apache 2.0 | Sí (imagen+texto) | Gated |
| Qwen3.6 35B-A3B (base) | 35,1B | ~3B | 256K (según familia) | Apache 2.0 | No | Abierto |
| Qwen3.6 27B dense | 27B | 27B | 256K (según familia) | Apache 2.0 | No | Abierto |

La principal diferencia con la base de Qwen3.6 es la adición de procesamiento de imágenes y el ajuste fino "logicpeak". En comparación con la variante densa de 27B, el modelo MoE ofrece mayor eficiencia computacional (menos parámetros activos), pero puede tener menor consistencia en tareas que requieren razonamiento denso y sostenido.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargar, lo que puede limitar su adopción.
- Documentación insuficiente: no hay modelo de modelo detallada, por lo que se desconocen los sesgos de entrenamiento y las limitaciones específicas.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Idiomas no especificados: la lista de idiomas soportados no está disponible, lo que dificulta su uso en producción multilingüe.
- Longitud de contexto no confirmada: aunque la familia Qwen3.6 soporta hasta 256K tokens, este modelo no especifica su ventana real.
- Sesgos culturales: al basarse en Qwen3.6, puede heredar sesgos del conjunto de entrenamiento original, que no se han documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/monate615/logicpeak-albedo-qwen3.6-35b-raft-g1-1a279d6e
- Variante relacionada (albedo-qwen3.6-35b-20260809001): https://huggingface.co/monate615/albedo-qwen3.6-35b-20260809001
- Variante relacionada (albedo-qwen3.6-35b-20260812001): https://huggingface.co/monate615/albedo-qwen3.6-35b-20260812001
- Documentación técnica de Qwen3.6 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3.6/1.1-qwen3.6-models
- Guía de Qwen3.6 (InsiderLLM): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Despliegue en FriendliAI (variante 20260809001): https://friendli.ai/models/monate615/albedo-qwen3.6-35b-20260809001

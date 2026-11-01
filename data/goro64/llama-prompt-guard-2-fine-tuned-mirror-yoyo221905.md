# Goro64/Llama-prompt-guard-2-fine-tuned-mirror-yoyo221905

## Resumen

Llama-prompt-guard-2-fine-tuned-mirror-yoyo221905 es un espejo de preservación del modelo publicado por el usuario yoyo221905 como fine-tuning de Meta Llama Prompt Guard 2 86M. El modelo original es un clasificador de texto (pipeline `text-classification`) orientado a seguridad de prompts: detecta inyecciones de instrucciones y contenido potencialmente malicioso en entradas de usuario. Este repositorio concreto es un snapshot inmutable mantenido por Goro64 con fines de archivo y acceso reproducible, no una nueva versión entrenada.

El modelo hereda la arquitectura DeBERTa-v2 del checkpoint base de Meta (etiquetado como base_model `meta-llama/Llama-Prompt-Guard-2-86M`), aunque el recuento real de parámetros en safetensors asciende a 278.810.882, muy por encima de los 86M que sugiere el nombre del checkpoint base. El autor del espejo no ha entrenado, cuantizado ni modificado los pesos; solo ha añadido documentación de procedencia y licencias.

Su relevancia actual radica en la necesidad de disponer de clasificadores ligeros de prompt injection en pipelines de LLM, y en el valor de conservar una copia verificable de una release comunitaria concreta (commit `39e0adf8fe35f95c19c46fa912b611fdd2af2610`, capturado el 2026-10-28) bajo la Llama 4 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer), fine-tuning sobre Llama Prompt Guard 2 86M |
| Parametros totales | 278.810.882 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en, zh, fr, es, de |
| Licencia | llama4 (Llama 4 Community License Agreement, efectiva 5 de abril de 2025) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador basado en DeBERTa-v2, según la etiqueta `deberta-v2` del repositorio, derivado mediante fine-tuning del checkpoint `meta-llama/Llama-Prompt-Guard-2-86M`. La model card del espejo no proporciona detalles sobre el dataset de fine-tuning, el número de tokens de entrenamiento, la composición de datos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia tarea de clasificación.

El espejo no aporta información de entrenamiento propia: el mantenedor declara explícitamente que no ha entrenado, ajustado, cuantizado ni fusionado los pesos, y remite a la model card upstream para cualquier detalle sobre el proceso de fine-tuning. Toda la documentación técnica adicional debe consultarse en el repositorio original de yoyo221905.

## Capacidades

- Clasificación de texto orientada a seguridad de prompts (detección de prompt injection y contenido malicioso).
- Etiquetado binario o multietiqueta según la definición upstream (no detallada en el espejo).
- Soporte multilingüe declarado para inglés, chino, francés, español y alemán.
- Integración con la librería `transformers` y con Text Embeddings Inference (`text-embeddings-inference`).
- Compatibilidad con endpoints de HuggingFace (`endpoints_compatible`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo exclusivamente de clasificación.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: el clasificador se sitúa delante del LLM generativo para etiquetar cada mensaje del usuario y bloquear intentos de prompt injection antes de que lleguen al modelo principal.
- Moderación de contenido en aplicaciones multilingües: al cubrir en, zh, fr, es y de, puede desplegarse en productos con base de usuarios en esos cinco idiomas sin un modelo separado por lengua.
- Puerta de seguridad en pipelines RAG: clasificar las consultas recuperadas y las preguntas del usuario para evitar que documentos envenenados o instrucciones ocultas activen comportamientos no deseados.
- Evaluación de robustez de LLM: usar el clasificador como referencia para medir la tasa de evasión de distintos conjuntos de ataques (jailbreaks, inyecciones indirectas) durante pruebas de red team.
- Preservación y auditoría de releases comunitarias: el espejo permite a equipos de seguridad reproducir exactamente la release del commit `39e0adf8fe35f95c19c46fa912b611fdd2af2610` y verificar sus hashes SHA-256 mediante `UPSTREAM_PAYLOAD_MANIFEST.json`.
- Clasificación por lotes en backend: al ser un encoder de tamaño moderado, puede ejecutarse sobre CPU o GPU pequeña para etiquetar grandes volúmenes de logs o conversaciones históricas en procesos de auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo remite explícitamente a la documentación upstream para cualquier métrica de evaluación, y el mantenedor declara no haber evaluado ni certificado el modelo de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278,8 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: en torno a 0,55 GB para pesos, holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100 son suficientes. También viable en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, en cualquier modelo con 4 GB o más de VRAM; incluso en iGPU y CPU con latencias mayores.
- Opciones de despliegue: `transformers` (pipeline de text-classification), Text Embeddings Inference (TEI), endpoints compatibles de HuggingFace. No se documenta soporte GGUF ni llama.cpp en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goro64/Llama-prompt-guard-2-fine-tuned-mirror-yoyo221905 | 278,8 M | no disponible | Clasificación de prompts | llama4 | HuggingFace (espejo) |
| meta-llama/Llama-Prompt-Guard-2-86M (base) | 86 M (nominal) | no disponible | Clasificación de prompts | llama4 | HuggingFace (oficial Meta) |
| yoyo221905/Llama-prompt-guard-2-fine-tuned (upstream) | no disponible | no disponible | Clasificación de prompts | llama4 | HuggingFace (original) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El espejo no ha sido entrenado, evaluado ni certificado por el mantenedor; cualquier garantía de calidad depende exclusivamente del autor upstream.
- No se documentan métricas de precisión, recall ni tasas de falsos positivos, por lo que su eficacia real como filtro de seguridad es desconocida a partir de esta ficha.
- El nombre del checkpoint base sugiere 86M de parámetros, pero el recuento real en safetensors es de 278,8 M; conviene verificar la correspondencia exacta entre pesos y arquitectura antes de desplegar.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un clasificador, el riesgo se manifiesta como falsos positivos o negativos, no como generación de texto.
- La licencia Llama 4 Community License impone obligaciones de atribución, un Acceptable Use Policy y posibles restricciones para uso comercial a gran escala; debe revisarse el texto preservado en `LICENSE` y `USE_POLICY.md` antes de cualquier despliegue en producción.
- El modelo upstream puede haber cambiado tras la captura; este espejo no refleja necesariamente la última versión del repositorio original.
- Solo se declaran cinco idiomas; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-prompt-guard-2-fine-tuned-mirror-yoyo221905
- Repositorio upstream: https://huggingface.co/yoyo221905/Llama-prompt-guard-2-fine-tuned
- Commit exacto capturado: https://huggingface.co/yoyo221905/Llama-prompt-guard-2-fine-tuned/tree/39e0adf8fe35f95c19c46fa912b611fdd2af2610
- Model card upstream en la revisión capturada: https://huggingface.co/yoyo221905/Llama-prompt-guard-2-fine-tuned/blob/39e0adf8fe35f95c19c46fa912b611fdd2af2610/README.md
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af

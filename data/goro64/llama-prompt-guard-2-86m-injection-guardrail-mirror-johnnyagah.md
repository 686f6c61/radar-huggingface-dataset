# Goro64/Llama-Prompt-Guard-2-86M-injection-guardrail-mirror-Johnnyagah

## Resumen

Este repositorio es un espejo de preservación (mirror) del modelo Johnnyagah/Llama-Prompt-Guard-2-86M-injection-guardrail, un fine-tuning de Meta Llama Prompt Guard 2 86M orientado a la detección de inyecciones de prompt como guardrail de seguridad. El mantenedor del espejo, Goro64, no ha entrenado, ajustado, cuantizado ni modificado los pesos: solo replica el árbol de ficheros del commit 5b24966a23216d00b0dc382447572724fa52ba34 del repositorio original, capturado el 28 de octubre de 2026.

El modelo base es un clasificador de texto derivado de DeBERTa-v2 (tag `deberta-v2` en Hugging Face), con 278.810.882 parámetros reales según los pesos en safetensors, pese a que el nombre comercial indique "86M". Se usa como clasificador binario o multietiqueta para distinguir prompts benignos de intentos de jailbreak o inyección. La relevancia actual es doble: por un lado, la seguridad de prompts es una capa crítica en despliegues de LLM en producción; por otro, este repositorio documenta de forma ejemplar la cadena de custodia de un artefacto bajo licencia Llama 4 Community License.

El interés técnico del espejo es la trazabilidad: incluye un manifiesto con digests SHA-256 de cada fichero original, un registro de licencia y la model card upstream preservada verbatim. No aporta mejoras de rendimiento ni cambios funcionales respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de texto, tag `deberta-v2`); derivado de Llama Prompt Guard 2 86M |
| Parametros totales | 278.810.882 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el espejo no incluye cuantizaciones; solo safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 4 Community License Agreement (efectiva 5 de abril de 2025) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 1.1 GB |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |
| Fecha de captura del upstream | 2026-10-28 |

## Arquitectura y entrenamiento

La arquitectura declarada es DeBERTa-v2, un transformer encoder con atención disentangled y mecanismo de posición relativa, adaptado como clasificador de secuencias. El modelo del que deriva, Llama Prompt Guard 2 86M, es un clasificador de seguridad de Meta diseñado para detectar prompts maliciosos; este fine-tuning concreto añade la etiqueta de "injection-guardrail" según el autor upstream. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el material proporcionado.

El espejo no documenta detalles del proceso de fine-tuning más allá de la relación `base_model_relation: finetune` respecto a meta-llama/Llama-Prompt-Guard-2-86M. No hay innovaciones técnicas destacables atribuibles al espejo, que es un snapshot estático. La model card upstream preservada en `upstream/README.md` podría contener información adicional sobre entrenamiento y evaluación, pero no se incluye en la información disponible para esta ficha.

## Capacidades

- Clasificación de texto para detección de inyecciones de prompt y jailbreaks (pipeline `text-classification`).
- Etiquetado binario o multietiqueta de seguridad según la definición del autor upstream (no detallada en la información disponible).
- Procesamiento de texto en inglés exclusivamente (tag de idioma `en`).
- No es un modelo generativo: no produce texto, solo puntuaciones o etiquetas de clasificación.
- Compatible con Text Embeddings Inference (TEI) y endpoints compatibles de Hugging Face.
- No se documenta soporte de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Filtro de entrada en aplicaciones LLM: clasificar cada prompt de usuario antes de enviarlo al modelo generativo y bloquear aquellos con alta probabilidad de inyección, reduciendo el riesgo de jailbreak en producción.
- Guardrail en pipelines RAG: inspeccionar consultas y documentos recuperados para detectar intentos de manipulación del contexto antes de la generación.
- Moderación de contenido en foros o chats: usar la clasificación para marcar mensajes que intentan manipular asistentes conversacionales desplegados públicamente.
- Evaluación de robustez de sistemas propios: generar un corpus de prompts maliciosos y medir la tasa de detección del clasificador como parte de un test de seguridad automatizado.
- Capa de defensa en defensa en profundidad: combinarlo con otros clasificadores y reglas heurísticas para reducir falsos negativos en entornos de alta exposición.
- Reproducibilidad y auditoría: usar el espejo como snapshot fijo con digests SHA-256 para validar que el modelo desplegado coincide con el artefacto auditado, útil en cumplimiento normativo.
- Investigación en seguridad de prompts: servir como baseline reproducible para comparar nuevos detectores de inyección bajo una licencia y versión concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo de pesos (278,8 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,56 GB de pesos; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090, A100, H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers, Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face; vLLM y llama.cpp no aplican de forma estándar a clasificadores DeBERTa.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por petición en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este espejo (Goro64) | 278,8 M | no disponible | Llama 4 Community License | Hugging Face, safetensors |
| meta-llama/Llama-Prompt-Guard-2-86M | no disponible en esta ficha | no disponible | Llama 4 Community License | Hugging Face (oficial) |
| Johnnyagah/Llama-Prompt-Guard-2-86M-injection-guardrail | no disponible en esta ficha | no disponible | Llama 4 Community License | Hugging Face (upstream del espejo) |
| ProtectAI deberta-v3-base-prompt-injection | no disponible en esta ficha | no disponible | no disponible | Hugging Face |

La comparativa se limita a los artefactos identificados en la información disponible; no se dispone de métricas de rendimiento comparadas para establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- El espejo no ha sido entrenado, evaluado ni certificado por el mantenedor; la preservación no constituye una garantía de seguridad.
- Solo soporta inglés (`en`); su eficacia en otros idiomas, incluido el castellano, no está documentada.
- No hay datos de benchmarks ni de evaluación independiente en la información disponible; el rendimiento real en detección de inyecciones es desconocido.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier clasificador de seguridad; no debe usarse como única capa de defensa.
- Licencia Llama 4 Community License: el uso comercial y la redistribución están sujetos a condiciones y al Acceptable Use Policy; es necesario revisar los ficheros LICENSE y USE_POLICY.md preservados.
- El repositorio upstream no reproduce el historial Git; es un snapshot fijo, no necesariamente la última versión del autor original.
- El nombre del modelo ("86M") no coincide con el recuento real de parámetros en safetensors (278,8 M), lo que puede inducir a error en estimaciones de recursos.
- No se incluyen cuantizaciones en el espejo; solo safetensors en precisión original.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-injection-guardrail-mirror-Johnnyagah
- Repositorio upstream: https://huggingface.co/Johnnyagah/Llama-Prompt-Guard-2-86M-injection-guardrail
- Commit exacto del upstream: https://huggingface.co/Johnnyagah/Llama-Prompt-Guard-2-86M-injection-guardrail/tree/5b24966a23216d00b0dc382447572724fa52ba34
- Model card upstream preservada: https://huggingface.co/Johnnyagah/Llama-Prompt-Guard-2-86M-injection-guardrail/blob/5b24966a23216d00b0dc382447572724fa52ba34/README.md
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af

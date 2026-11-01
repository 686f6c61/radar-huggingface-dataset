# Goro64/Llama-Prompt-Guard-2-86M-GEOInjection-mirror-Euanyu

## Resumen

Llama-Prompt-Guard-2-86M-GEOInjection-mirror-Euanyu es un espejo de preservación (mirror) del release publicado por el usuario Euanyu bajo el nombre `Euanyu/Llama-Prompt-Guard-2-86M-GEOInjection`. No se trata de un modelo entrenado por el mantenedor del espejo (Goro64), sino de una copia fija e inalterada del árbol de origen en el commit `75dd3ff9826915601331c646299d88f4f7bc3949`, adquirida el 2026-10-28. El modelo subyacente es un fine-tune de `meta-llama/Llama-Prompt-Guard-2-86M`, el clasificador de prompts maliciosos de Meta, y su nombre sugiere una especialización en ataques de inyección de instrucciones de tipo GEO (aunque la model card del espejo no documenta el proceso de fine-tune).

El interés de esta ficha es acotado y conviene ser explícito: el espejo no aporta información técnica nueva sobre el entrenamiento, los datos ni las métricas del modelo original. La model card preservada remite al README original del autor upstream para cualquier detalle de uso previsto, definición de etiquetas y evaluación. Lo que sí ofrece es un registro reproducible con manifiesto de integridad (SHA-256 por archivo) y la documentación legal preservada, lo que resulta útil para auditoría y trazabilidad en entornos de seguridad de prompts.

El repositorio pesa 1,1 GB y declara 278.810.882 parámetros en safetensors, un dato que no coincide con el nombre comercial "86M" del modelo base; esa discrepancia no está explicada en la información disponible y conviene tratarla como una observación a verificar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (según tag `deberta-v2`; modelo base Llama-Prompt-Guard-2-86M) |
| Parametros totales | 278.810.882 (según safetensors; el nombre del base indica 86M, discrepancia no explicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Llama 4 Community License Agreement (efectiva 5 de abril de 2025), según registro del espejo |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base Llama Prompt Guard 2 86M es un encoder tipo DeBERTa-v2 utilizado como clasificador de texto, según el tag `deberta-v2` del repositorio. El tag `pipeline_tag: text-classification` confirma que la tarea es clasificación binaria o multiclase de prompts (prompt malicioso frente a benigno), no generación. El modelo aquí presentado es un fine-tune de ese base, presumiblemente orientado a inyección de instrucciones, pero la model card del espejo no describe el dataset, el número de tokens, ni si hubo RLHF/DPO o ajuste supervisado.

No hay innovaciones técnicas documentadas en la información proporcionada: el espejo declara explícitamente que no se ha entrenado, cuantizado, fusionado ni modificado nada. Cualquier detalle sobre el proceso de fine-tune upstream debe consultarse en el README original del autor Euanyu, que no está incluido en los datos disponibles.

## Capacidades

- Clasificación de texto orientada a seguridad de prompts (detección de prompts maliciosos o de inyección de instrucciones).
- Especialización declarada, por nombre, en ataques de inyección de tipo GEO, sin documentación técnica que lo respalde en la información disponible.
- Funciona como filtro previo o posterior a un LLM en pipelines de moderación.
- Compatible con `transformers` y con `text-embeddings-inference` según los tags del repo.
- Marcado como `endpoints_compatible`, lo que sugiere despliegue sencillo en Hugging Face Inference Endpoints.
- Idioma: únicamente inglés.
- No se documentan tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de entrada en aplicaciones de chat: colocar el clasificador antes del LLM para bloquear prompts con intentos de inyección de instrucciones, reduciendo la superficie de ataque de jailbreaks y prompt injection.
- Moderación de contenido generado por usuarios: clasificar mensajes entrantes en foros o APIs públicas y derivar los sospechosos a revisión humana o a un cuarentena.
- Auditoría de sistemas RAG: analizar los documentos y consultas que entran en el pipeline de recuperación para detectar instrucciones ocultas embebidas en el corpus.
- Evaluación de robustez de otros LLM: usar el clasificador como juez auxiliar para medir la tasa de prompts maliciosos que llegan al modelo principal en pruebas de red teaming.
- Preservación y trazabilidad legal: el espejo incluye LICENSE, USE_POLICY.md, NOTICE, PROVENANCE.json y UPSTREAM_PAYLOAD_MANIFEST.json con SHA-256, lo que permite reproducir exactamente el artefacto auditado en un dictamen de cumplimiento.
- Reproducibilidad de experimentos académicos: fijar el commit y el manifiesto para que otros investigadores puedan replicar resultados sin depender de cambios posteriores en el repo upstream.
- Integración en gateways de API: desplegar el clasificador como servicio independiente (por ejemplo, con `text-embeddings-inference`) delante de un gateway de LLM para rechazar peticiones maliciosas con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 278,8 M parámetros en fp32 el peso ronda 1,1 GB, lo que encaja en cualquier GPU consumer moderna (8 GB o más) con margen amplio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para fp32/fp16; para lotes grandes o alto throughput, A100 o H100.
- Cabe en GPU consumer: sí, con amplia holgura dado el tamaño del repo (1,1 GB).
- Opciones de despliegue: `transformers`, `text-embeddings-inference` (según tags), Hugging Face Inference Endpoints (`endpoints_compatible`). No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este espejo (fine-tune de Prompt Guard 2 86M) | 278,8 M (declarados) | No disponible | Clasificación de prompts | Llama 4 Community License | Hugging Face (repo espejo) |
| meta-llama/Llama-Prompt-Guard-2-86M | ~86 M (según nombre) | No disponible | Clasificación de prompts | Llama 4 Community License | Hugging Face (oficial Meta) |
| ProtectAI deberta-v3-base-prompt-injection | No disponible | No disponible | Detección de prompt injection | No disponible | Hugging Face |
| Meta Llama Prompt Guard (v1) | 86 M | 512 tokens (según documentación pública de Meta, no verificada aquí) | Clasificación de prompts | Llama 2 Community License | Hugging Face |

La comparación es limitada porque la información proporcionada no incluye métricas de rendimiento para ninguno de los modelos. La discrepancia entre 86M (nombre) y 278,8 M (safetensors) para el base es un punto que conviene verificar contra el repo oficial de Meta antes de asumir equivalencia de tamaño.

## Limitaciones y advertencias

- El espejo no ha sido entrenado, evaluado ni certificado por su mantenedor; la preservación no constituye garantía de seguridad ni recomendación de despliegue.
- No hay información sobre sesgos, tasa de falsos positivos/negativos, ni rendimiento en dominios distintos del inglés.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea: un clasificador mal calibrado puede dejar pasar ataques o bloquear tráfico legítimo.
- Solo soporta inglés; su uso en otros idiomas no está documentado y probablemente degradará.
- La licencia Llama 4 Community License impone obligaciones de atribución, uso aceptable y posibles restricciones de uso comercial; deben revisarse LICENSE y USE_POLICY.md preservados.
- La discrepancia entre el nombre "86M" y los 278,8 M parámetros declarados en safetensors no está explicada; verificar antes de asumir equivalencia con el base oficial de Meta.
- El modelo upstream puede haber cambiado tras la captura; este espejo es un snapshot fijo y no refleja revisiones posteriores.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita opciones de despliegue en entornos sin `transformers` o `text-embeddings-inference`.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-GEOInjection-mirror-Euanyu
- Upstream original: https://huggingface.co/Euanyu/Llama-Prompt-Guard-2-86M-GEOInjection
- Commit exacto del upstream: https://huggingface.co/Euanyu/Llama-Prompt-Guard-2-86M-GEOInjection/tree/75dd3ff9826915601331c646299d88f4f7bc3949
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af
- README upstream en la revisión capturada: https://huggingface.co/Euanyu/Llama-Prompt-Guard-2-86M-GEOInjection/blob/75dd3ff9826915601331c646299d88f4f7bc3949/README.md

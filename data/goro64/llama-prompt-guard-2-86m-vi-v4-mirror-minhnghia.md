# Goro64/Llama-Prompt-Guard-2-86M-vi-v4-mirror-MinhNghia

## Resumen

Llama-Prompt-Guard-2-86M-vi-v4-mirror-MinhNghia es un espejo (mirror) de preservación del modelo de clasificación de texto `MinhNghia/Llama-Prompt-Guard-2-86M-vi-v4`, publicado por el usuario Goro64. No se trata de un modelo nuevo: es una copia sin modificaciones del release original, capturada el 28 de octubre de 2026 desde el commit `31d9e34780871d4548d34c241a3ab6f7a314db16` de la rama `main` del repositorio de MinhNghia. El modelo subyacente es un fine-tune de Meta Llama Prompt Guard 2 86M, orientado a la detección de prompts maliciosos (prompt injection, jailbreak) en vietnamita e inglés.

El propósito del repositorio es la preservación reproducible y el acceso archivístico: el mantenedor declara explícitamente que no ha entrenado, ajustado, cuantizado ni fusionado los pesos. Los cambios respecto al original se limitan a la model card, los registros de procedencia y la documentación de licencia. Los pesos reales declarados en safetensors suman 278.810.882 parámetros, un dato que conviene contrastar con la nomenclatura "86M" del modelo base, ya que el fine-tune podría haber incorporado componentes adicionales o el recuento incluir capas no troncales.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de seguridad de prompts en una lengua de bajos recursos como el vietnamita; por otro, ejemplifica las prácticas de archivado de modelos con licencias restrictivas (Llama 4 Community License), donde la trazabilidad de la procedencia y la integridad del payload son tan importantes como el rendimiento del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (según tag `deberta-v2`); derivado de Llama Prompt Guard 2 86M |
| Parámetros totales | 278.810.882 (según safetensors del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | Vietnamita (vi), inglés (en) |
| Licencia | Llama 4 Community License Agreement (efectiva 5 de abril de 2025) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Librería | transformers |
| Modelo base | meta-llama/Llama-Prompt-Guard-2-86M |
| Tamaño del repo | 1,1 GB |
| Descargas | 16 |
| Likes | 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `deberta-v2` y de la relación de fine-tune con `meta-llama/Llama-Prompt-Guard-2-86M`. DeBERTa-v2 es un transformer encoder con atención disentangled y mecanismo de atención relativa, habitual en tareas de clasificación de texto como la detección de contenido malicioso. El modelo base Prompt Guard 2 86M de Meta se emplea típicamente como clasificador binario o multiclase de seguridad de prompts, pero la model card del espejo no reproduce los detalles de entrenamiento del fine-tune original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del fine-tune. El mantenedor del espejo declara explícitamente que no ha realizado entrenamiento, evaluación ni certificación independiente, y remite a la model card upstream (preservada en `upstream/README.md`) para cualquier detalle sobre usos previstos, definiciones de etiquetas y evaluaciones. Cualquier afirmación sobre el proceso de entrenamiento del modelo original queda fuera del alcance de los datos proporcionados.

## Capacidades

- Clasificación de texto orientada a seguridad de prompts: detección de prompt injection, jailbreak y entradas adversariales, según la categoría del modelo base Prompt Guard 2.
- Soporte bilingüe vietnamita-inglés, lo que lo hace relevante para despliegues en entornos vietnamitas o mixtos.
- Integración con la librería `transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`), lo que facilita su uso como endpoint de clasificación.
- Compatibilidad con endpoints (tag `endpoints_compatible`), pensada para despliegues gestionados.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking; es un clasificador, no un modelo generativo.
- No se documentan capacidades multilingües más allá del par vi/en.

## Casos de uso

- Filtrado de entrada en aplicaciones LLM en vietnamita: el modelo puede clasificar prompts de usuario antes de enviarlos a un modelo generativo, bloqueando intentos de prompt injection en un idioma que los guardrails entrenados solo en inglés suelen cubrir deficientemente.
- Moderación de contenido en plataformas bilingües vi/en: uso como clasificador auxiliar para marcar mensajes sospechosos en foros, chats o sistemas de atención al cliente.
- Evaluación de robustez de pipelines RAG: integrar el clasificador como primera capa para detectar instrucciones maliciosas incrustadas en documentos recuperados antes de que lleguen al generador.
- Investigación en seguridad de LLM para lenguas de bajos recursos: el modelo sirve como punto de partida o baseline para estudiar la transferencia de guardrails del inglés al vietnamita.
- Archivado y reproducibilidad de artefactos de seguridad: el repositorio en sí es un caso de uso para equipos que necesitan referenciar una versión exacta y verificable de un guardrail en auditorías o publicaciones.
- Despliegue como microservicio de clasificación: gracias a la compatibilidad con Text Embeddings Inference y endpoints, puede exponerse como API de bajo coste para prefiltrar tráfico antes de modelos más caros.
- Conjuntos de pruebas de red teaming: usar el clasificador para etiquetar automáticamente corpus de prompts adversariales en vietnamita durante ejercicios de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas de precisión, recall, F1 ni comparaciones con otros guardrails, y remite explícitamente a la documentación upstream para cualquier claim de evaluación. El mantenedor declara no haber evaluado el modelo de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278,8 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: en torno a 0,6 GB para pesos; cuantizado a int8, aproximadamente 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB), RTX 4060 u RTX 4090 cubren el modelo con holgura. Para despliegues de alto throughput, A100 o H100 permiten batchear agresivamente, aunque el modelo es pequeño para aprovechar su capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (pipeline de text-classification), Text Embeddings Inference (tag declarado), endpoints compatibles. No se confirma soporte de llama.cpp, Ollama, vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera latencia de milisegundos por petición en GPU consumer, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goro64/Llama-Prompt-Guard-2-86M-vi-v4-mirror-MinhNghia | 278,8 M (safetensors) | No disponible | vi, en | Llama 4 Community License | HuggingFace (espejo) |
| meta-llama/Llama-Prompt-Guard-2-86M | 86 M (nominal) | No disponible | en (principalmente) | Llama 4 Community License | HuggingFace (oficial) |
| MinhNghia/Llama-Prompt-Guard-2-86M-vi-v4 | No disponible | No disponible | vi, en | Llama 4 Community License | HuggingFace (upstream) |

La comparativa se limita a las variantes del mismo linaje, ya que la información proporcionada no incluye otros guardrails de prompt injection comparables (por ejemplo, modelos de la familia Prompt Guard 1, Llama Guard o clasificadores de terceros). No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El espejo no ha sido entrenado, evaluado ni certificado por el mantenedor; la calidad del modelo depende enteramente del release upstream de MinhNghia.
- No se documentan métricas de rendimiento, sesgos ni tasas de falsos positivos/negativos; desplegarlo en producción sin evaluación propia es arriesgado.
- Es un clasificador, no un generador: no debe esperarse razonamiento, generación ni tool calling.
- Cobertura lingüística limitada a vietnamita e inglés; su comportamiento en otros idiomas es desconocido.
- La licencia Llama 4 Community License impone obligaciones de atribución, política de uso aceptable y posibles restricciones para uso comercial a gran escala; es necesario revisar `LICENSE`, `USE_POLICY.md` y `NOTICE` antes de redistribuir o desplegar.
- La discrepancia entre el nombre "86M" del modelo base y los 278,8 M de parámetros declarados en safetensors no está explicada en la información disponible y conviene verificarla antes de asumir requisitos de hardware.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas (falsos positivos que bloqueen usuarios legítimos o falsos negativos que dejen pasar ataques).
- El repositorio tiene 16 descargas y 0 likes, lo que sugiere escasa validación comunitaria.
- La fecha de creación declarada (2026-10-29) es futura respecto a la mayoría de referencias habituales; conviene verificar la vigencia del snapshot antes de usarlo como dependencia fija.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-vi-v4-mirror-MinhNghia
- Repositorio upstream: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v4
- Commit exacto del upstream: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v4/tree/31d9e34780871d4548d34c241a3ab6f7a314db16
- Model card upstream en la revisión capturada: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v4/blob/31d9e34780871d4548d34c241a3ab6f7a314db16/README.md
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af

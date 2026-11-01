# Goro64/Llama-Prompt-Guard-2-86M-vi-v3-mirror-MinhNghia

## Resumen

Llama-Prompt-Guard-2-86M-vi-v3-mirror-MinhNghia es un espejo de preservación del modelo de clasificación de texto MinhNghia/Llama-Prompt-Guard-2-86M-vi-v3, un ajuste fino del Prompt Guard 2 de Meta (meta-llama/Llama-Prompt-Guard-2-86M) orientado a la detección de prompts maliciosos en vietnamita e inglés. El modelo resuelve el problema de filtrar inyecciones de prompt y contenido adversario en aplicaciones que exponen LLMs a entradas de usuario, y es relevante porque adapta un guardrail genérico de Meta a un idioma (vietnamita) para el que los clasificadores de seguridad suelen estar infrarepresentados.

El repositorio lo mantiene Goro64 como snapshot archivístico del commit `6c9e8837e5b92bbd4647f84968ff729bf0ae21c5` de la rama `main` del repositorio original, capturado el 28 de octubre de 2026. El mantenedor declara explícitamente que no ha entrenado, ajustado, cuantizado ni fusionado los pesos: las únicas modificaciones son la model card, los registros de procedencia y la documentación de licencia.

Técnicamente es un clasificador de secuencias basado en DeBERTa-v2 (según los tags de HuggingFace) con 278.810.882 parámetros reales en safetensors, pese a que el nombre comercial del modelo base indica 86M. Se distribuye bajo la Llama 4 Community License Agreement y está pensado exclusivamente para inferencia de clasificación, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (clasificador de secuencias, según tags de HuggingFace) |
| Parametros totales | 278.810.882 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Llama 4 Community License Agreement (efectiva desde el 5 de abril de 2025) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | transformers |
| Tamano del repo | 1,1 GB |
| Modelo base | meta-llama/Llama-Prompt-Guard-2-86M |
| Relacion con el base | finetune |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá del tag `deberta-v2` y la etiqueta de pipeline `text-classification`. DeBERTa-v2 es una familia de encoders transformer con atención disentada y mecanismo de posición relativa, habitualmente empleada como backbone para clasificación de secuencias. El modelo se presenta como un ajuste fino (finetune) de meta-llama/Llama-Prompt-Guard-2-86M, que a su vez es el Prompt Guard 2 de Meta orientado a la detección de inyecciones de prompt.

No se han publicado en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas del ajuste. La model card del espejo remite explícitamente a la model card upstream para usos previstos, definiciones de etiquetas, información de entrenamiento, afirmaciones de evaluación y limitaciones, y declara que el mantenedor del espejo no ha entrenado, evaluado ni certificado el modelo de forma independiente.

## Capacidades

- Clasificación de texto orientada a seguridad de prompts: el pipeline declarado es `text-classification`, con tags `prompt-security`.
- Detección de prompts adversarios o maliciosos en vietnamita e inglés, como derivado del Prompt Guard 2 de Meta.
- Soporte bilingüe vi/en según los metadatos de idioma del repositorio.
- Integración con la librería `transformers` y con `text-embeddings-inference` (tag presente en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No es un modelo generativo: no produce texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No dispone de modo thinking ni de capacidades de agente o razonamiento multi-paso.
- Las definiciones exactas de etiquetas de salida no están disponibles en la información proporcionada; deben consultarse en la model card upstream.

## Casos de uso

- Filtrado de entrada en aplicaciones LLM en vietnamita: clasificar cada prompt de usuario antes de enviarlo al modelo generativo, bloqueando entradas que el clasificador marque como adversarias, con el beneficio de cubrir un idioma poco atendido por los guardrails genéricos.
- Protección frente a inyecciones de prompt en asistentes conversacionales: insertar el clasificador como etapa previa en el pipeline de atención al cliente para detectar intentos de manipulación del system prompt.
- Moderación de contenido generado por usuarios en foros o chats vietnamitas: usar el clasificador como capa de triaje sobre mensajes entrantes, derivando los casos marcados a revisión humana.
- Evaluación de robustez de sistemas RAG: ejecutar el clasificador sobre los documentos y consultas recuperadas para detectar contenido que intente redirigir el comportamiento del modelo.
- Investigación en seguridad de LLM para idiomas de bajos recursos: emplear el snapshot como referencia reproducible en experimentos de detección de prompts adversarios en vietnamita, gracias a la preservación de checksums SHA-256 en `UPSTREAM_PAYLOAD_MANIFEST.json`.
- Archivo y reproducibilidad de artefactos de seguridad: usar el espejo para garantizar acceso estable a los pesos en auditorías o replicaciones, dado que el repositorio upstream puede cambiar o desaparecer.
- Despliegue en infraestructura de inferencia estándar: servirlo vía `transformers` o `text-embeddings-inference` como microservicio de clasificación con endpoints compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye métricas de precisión, recall, F1 ni comparaciones con otros clasificadores, y remite a la model card upstream para cualquier afirmación de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 278,8 M de parámetros en FP32 se requieren aproximadamente 1,1 GB solo para pesos; en FP16 unos 0,56 GB, y en int8 unos 0,28 GB, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder ejecutar el modelo en FP16, incluyendo GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: `transformers` (librería declarada), `text-embeddings-inference` (tag presente) y endpoints compatibles. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Goro64/Llama-Prompt-Guard-2-86M-vi-v3-mirror-MinhNghia | 278.810.882 | no disponible | vi, en | Llama 4 Community License | Espejo de un finetune de Prompt Guard 2 |
| meta-llama/Llama-Prompt-Guard-2-86M | no disponible en la información | no disponible | no disponible | Llama 4 Community License | Modelo base de Meta; guardrail genérico |
| MinhNghia/Llama-Prompt-Guard-2-86M-vi-v3 | no disponible en la información | no disponible | vi, en | Llama 4 Community License | Upstream directo del espejo, mismo payload |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El mantenedor del espejo no ha entrenado, evaluado ni certificado el modelo; la preservación no constituye una garantía de seguridad ni una recomendación de despliegue.
- No se han publicado métricas de evaluación en la información disponible, por lo que se desconoce su tasa de falsos positivos y falsos negativos.
- El alcance idiomático declarado es vietnamita e inglés; el comportamiento en otros idiomas no está documentado.
- La longitud de contexto no está disponible, lo que impide planificar el truncado de prompts largos con garantías.
- Las etiquetas de salida y su semántica exacta no están disponibles en esta información; deben tomarse de la model card upstream.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificación errónea que derive en bloqueos indebidos o en filtraciones de prompts adversarios.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Llama 4 Community License Agreement: el uso y la redistribución están sujetos a sus términos y al Acceptable Use Policy; no es una licencia permisiva tipo Apache o MIT y requiere cumplir las obligaciones de atribución recogidas en NOTICE.
- El espejo preserva la licencia registrada en la fecha de captura; cambios posteriores en la página upstream no modifican los ficheros de este snapshot, pero tampoco otorgan derechos adicionales.
- No se reproduce el historial Git upstream; es un snapshot fijo del árbol de ficheros.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-vi-v3-mirror-MinhNghia
- Repositorio upstream: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v3
- Commit exacto del upstream: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v3/tree/6c9e8837e5b92bbd4647f84968ff729bf0ae21c5
- Model card upstream en la revisión capturada: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v3/blob/6c9e8837e5b92bbd4647f84968ff729bf0ae21c5/README.md
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af

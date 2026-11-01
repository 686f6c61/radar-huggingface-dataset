# Goro64/Llama-Prompt-Guard-2-86M-vi-v2-mirror-MinhNghia

## Resumen

Llama-Prompt-Guard-2-86M-vi-v2-mirror-MinhNghia es un espejo de preservación del modelo de clasificación de texto MinhNghia/Llama-Prompt-Guard-2-86M-vi-v2, un ajuste fino de Meta Llama Prompt Guard 2 86M orientado a la detección de prompts maliciosos en vietnamita e inglés. El repositorio lo mantiene Goro64 y no introduce ninguna modificación sobre los pesos originales: solo añade documentación de procedencia, registros de licencia y manifiestos de integridad. Su función es garantizar el acceso reproducible a una release concreta (commit `3cc1244d528333d1ff080a2e3298083eca58458e`) ante posibles cambios o retiradas del repositorio upstream.

El modelo es un clasificador binario de seguridad de prompts: recibe un texto y devuelve una puntuación de probabilidad de que constituya un intento de inyección o jailbreak. Se basa en la arquitectura DeBERTa-v2 y, según los pesos reales en safetensors, contiene 278.810.882 parámetros, muy por encima de los 86M que sugiere el nombre heredado del modelo base de Meta. El repositorio ocupa 1,1 GB y se distribuye en formato safetensors para la librería transformers.

Su relevancia es doble: por un lado, cubre el hueco de detección de ataques de prompt en vietnamita, un idioma poco representado en las herramientas de seguridad de LLM; por otro, ilustra las prácticas de archivado verificable (digests SHA-256, manifiestos de payload, licencia preservada) que empiezan a adoptarse en el ecosistema open source para modelos con licencias restrictivas como la Llama 4 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder, clasificación de texto) |
| Parametros totales | 278.810.882 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con pesos safetensors sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Llama 4 Community License Agreement (efectiva desde el 5 de abril de 2025) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DeBERTa-v2, un transformer encoder con atención desacoplada (disentangled attention) que separa la codificación de contenido y posición, y que se emplea aquí como cabecera de clasificación de texto. El modelo deriva de meta-llama/Llama-Prompt-Guard-2-86M mediante un ajuste fino realizado por el autor upstream MinhNghia, orientado a extender la detección de prompts maliciosos al vietnamita. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni hiperparámetros del ajuste fino; la model card del espejo remite explícitamente a la documentación upstream y no añade ninguna afirmación propia.

La innovación técnica del repositorio no está en el modelo sino en su cadena de custodia: se preserva el árbol de ficheros del commit original con un manifiesto de payload (UPSTREAM_PAYLOAD_MANIFEST.json) que registra rutas, tamaños y digests SHA-256 previos a la adición de la documentación del espejo, junto con un fichero PROVENANCE.json que identifica la evidencia y la revisión archivada. El mantenedor declara no haber entrenado, cuantizado, fusionado ni modificado los pesos.

## Capacidades

- Clasificación binaria de prompts: distingue entre entradas benignas e intentos de inyección de prompt o jailbreak.
- Detección multilingüe limitada a vietnamita e inglés, con especial énfasis en el primero.
- Puntuación de probabilidad por muestra, apta para umbrales configurables en pipelines de filtrado.
- Integración con la librería transformers mediante `pipeline("text-classification")`.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales en vietnamita: el modelo se coloca como preprocesador antes del LLM principal y bloquea mensajes con probabilidad alta de inyección, cubriendo un idioma que la mayoría de guardrails comerciales no contempla.
- Moderación de comunidades y foros: clasificación por lotes de mensajes enviados a un chatbot público para detectar intentos coordinados de jailbreak y alimentar paneles de abuso.
- Red teaming automatizado: uso como oráculo de detección para medir la tasa de evasión de un conjunto de prompts adversarios traducidos al vietnamita.
- Cumplimiento y auditoría: registro de puntuaciones de seguridad por interacción en sistemas sujetos a políticas internas de uso aceptable, con trazabilidad gracias a la licencia y procedencia preservadas en el espejo.
- Investigación académica reproducible: el snapshot fijado por commit y los digests SHA-256 permiten replicar experimentos de seguridad de prompts sin depender de que el repositorio upstream permanezca inalterado.
- Puerta de seguridad en pipelines RAG: clasificación de las consultas de usuario antes de la recuperación documental para evitar exfiltración de contexto mediante instrucciones maliciosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (278,8 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: en torno a 0,56 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer con 4 GB o más: RTX 3050, RTX 4060, RTX 3060, RTX 4090, así como en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para despliegues con muchas peticiones concurrentes; el modelo es lo bastante pequeño como para que el cuello de botella sea la red y no el cómputo.
- Opciones de despliegue: transformers, text-embeddings-inference (declarado en los tags), y servidores compatibles con la API de endpoints. No se han publicado artefactos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Prompt-Guard-2-86M-vi-v2 (este espejo) | 278,8 M | vi, en | Clasificación de prompts maliciosos | Llama 4 Community License | HuggingFace (espejo y upstream) |
| meta-llama/Llama-Prompt-Guard-2-86M | 86 M (según nombre comercial) | principalmente en | Clasificación de prompts maliciosos | Llama 4 Community License | HuggingFace (oficial de Meta) |
| ProtectAI deberta-v3-base-prompt-injection | no disponible | en | Detección de prompt injection | no disponible | HuggingFace |
| Llama Guard 3 (8B) | 8 B | multilingüe | Moderación de contenido y prompts | Llama 3.x Community License | HuggingFace |

La comparación directa con el modelo base de Meta es la más relevante: este ajuste amplía la cobertura al vietnamita a costa de triplicar aproximadamente el número de parámetros. Frente a clasificadores especializados en inglés como los de ProtectAI, la ventaja es el soporte de vietnamita; frente a Llama Guard 3, la ventaja es el coste de inferencia, muy inferior al ser dos órdenes de magnitud más pequeño.

## Limitaciones y advertencias

- El mantenedor del espejo no ha entrenado, evaluado ni certificado el modelo; no se ofrece ninguna garantía de seguridad ni recomendación de despliegue.
- No hay datos publicados sobre sesgos, tasas de falsos positivos o robustez frente a ataques adversariales en la información disponible.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificación errónea: un prompt benigno en vietnamita coloquial puede puntuar alto si el ajuste fino sobreajustó patrones superficiales.
- Cobertura lingüística limitada a vietnamita e inglés; el rendimiento en otros idiomas, incluido el español, es desconocido.
- La licencia Llama 4 Community License impone obligaciones de atribución, política de uso aceptable y restricciones para usos comerciales a gran escala; es necesario revisar LICENSE y USE_POLICY.md preservados antes de cualquier despliegue en producción.
- El nombre del modelo induce a error sobre el tamaño: el identificador sugiere 86M pero los pesos reales suman 278,8 M de parámetros.
- La fecha de creación del repositorio (2026-10-29) y el reducido número de descargas (18) indican que se trata de un snapshot de preservación con nula validación comunitaria.
- No se distribuyen cuantizaciones; cualquier despliegue en CPU o en hardware limitado requiere conversión propia y validación posterior.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-vi-v2-mirror-MinhNghia
- Repositorio upstream: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v2
- Commit exacto preservado: https://huggingface.co/MinhNghia/Llama-Prompt-Guard-2-86M-vi-v2/tree/3cc1244d528333d1ff080a2e3298083eca58458e
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af
- Documentación upstream preservada en el espejo: https://huggingface.co/Goro64/Llama-Prompt-Guard-2-86M-vi-v2-mirror-MinhNghia/blob/main/upstream/README.md

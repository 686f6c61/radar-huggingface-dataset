# Goro64/Llama-mas-detector-v1-mirror-NaitikVora

## Resumen

Llama-mas-detector-v1-mirror-NaitikVora es un espejo de preservación del modelo Llama-mas-detector-v1, publicado originalmente por el usuario NaitikVora en HuggingFace y archivado por Goro64 el 28 de octubre de 2026. No se trata de un modelo nuevo: el mantenedor del espejo no ha entrenado, ajustado, cuantizado ni modificado los pesos, y el repositorio conserva el payload del release upstream con sus checksums SHA-256 documentados en UPSTREAM_PAYLOAD_MANIFEST.json. La relevancia de esta ficha, por tanto, no está en el modelo en sí, sino en el contexto de seguridad de prompts en el que se inscribe.

El modelo upstream se declara como un fine-tuning de meta-llama/Llama-Prompt-Guard-2-86M, un clasificador de texto de 86 millones de parámetros diseñado por Meta para detectar inyecciones de prompt y ataques de jailbreak. La tarea declarada en el pipeline es text-classification, y la etiqueta de licencia registrada en el snapshot es la Llama 4 Community License Agreement (efectiva desde el 5 de abril de 2025). El repositorio ocupa 19,0 GB, un tamaño desproporcionado para un modelo de 86M de parámetros, lo que sugiere que el snapshot incluye múltiples artefactos (pesos en distintos formatos, documentación legal y material auxiliar) más allá de los safetensors del clasificador.

La información pública disponible sobre este espejo es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin model card propia más allá de la nota de procedencia. La model card remite explícitamente a la documentación upstream para usos previstos, definiciones de etiquetas, datos de entrenamiento y evaluaciones, y advierte de que el mantenedor no ha evaluado ni certificado el modelo de forma independiente. Cualquier evaluación técnica de sus capacidades debe hacerse, por tanto, contra el modelo base Prompt Guard 2 86M, no contra este snapshot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es Llama Prompt Guard 2 86M, un transformer clasificador; la arquitectura exacta del fine-tuning no se documenta en el espejo) |
| Parametros totales | 86M (heredados del modelo base declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 4 Community License Agreement (efectiva 5 de abril de 2025); se preservan LICENSE, USE_POLICY.md y NOTICE en el repositorio |
| Formato de pesos | safetensors (tag de la libreria transformers); el repositorio incluye manifiesto de payload con digests SHA-256 |
| Libreria | transformers |
| Pipeline | text-classification |
| Tamano del repositorio | 19,0 GB |
| Modelo base | meta-llama/Llama-Prompt-Guard-2-86M |
| Relacion con el base | finetune |
| Commit upstream capturado | 7704c3c339e7382b219914beacd11c048084c2ce |
| Fecha de captura | 2026-10-28 |

## Arquitectura y entrenamiento

El espejo no documenta detalles de arquitectura ni de entrenamiento propios. Lo único verificable es que el release upstream se describe como un derivado fine-tuneado de Meta Llama Prompt Guard 2 86M, un clasificador transformer de 86 millones de parámetros orientado a la detección de inyecciones de prompt y jailbreaks. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica (atención lineal, decodificación especulativa, etc.).

La contribución técnica del repositorio es de naturaleza archivística, no de modelado. El mantenedor conserva el árbol de ficheros del release original, los textos legales asociados y un manifiesto con rutas, tamaños y digests SHA-256 de los ficheros originales, además de un PROVENANCE.json con la evidencia de la captura. La model card original del autor upstream se preserva verbatim bajo el directorio `upstream/`, y es allí donde deben buscarse los detalles de entrenamiento y evaluación si el autor los publicó.

## Capacidades

- Clasificación de texto orientada a seguridad de prompts: el pipeline declarado es text-classification y el modelo base está diseñado para distinguir entradas benignas de intentos de inyección o jailbreak.
- Detección de inyección de prompt: capacidad heredada del modelo base Prompt Guard 2, según la descripción del release upstream.
- Detección de jailbreak: igualmente heredada del base, sin evaluación independiente documentada en el espejo.
- Generación de texto: no disponible; es un clasificador, no un modelo generativo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Filtrado de entrada en aplicaciones LLM: colocar el clasificador delante de un chatbot o asistente para etiquetar prompts sospechosos antes de que lleguen al modelo generativo. Es adecuado por su tamaño reducido (86M) y su tarea específica de clasificación de seguridad.
- Moderación de contenido generado por usuarios en foros o herramientas internas: clasificar mensajes entrantes y derivar los positivos a revisión humana, usando el modelo como primera capa de triaje.
- Auditoría de logs de conversación: procesar por lotes históricos de prompts para identificar intentos de inyección y construir métricas de exposición por aplicación.
- Preservación y reproducibilidad de investigación en seguridad de prompts: el espejo permite a investigadores acceder a un snapshot fijo con digests verificables, útil para reproducir experimentos sobre el mismo release aunque el upstream cambie o desaparezca.
- Evaluación comparativa de clasificadores de seguridad: usar este snapshot como referencia fija frente a otros detectores, aprovechando que el payload está congelado y documentado.
- Formación y concienciación en seguridad: desplegar el clasificador en un entorno controlado para mostrar a equipos de desarrollo ejemplos reales de prompts maliciosos detectados.
- Integración en pipelines de CI/CD de aplicaciones LLM: ejecutar el clasificador sobre un corpus de prompts de prueba en cada release para detectar regresiones en la robustez frente a inyecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (86M de parámetros), en fp32 ocuparía aproximadamente 0,35 GB de pesos y en fp16 alrededor de 0,17 GB, aunque el repositorio de 19,0 GB incluye artefactos adicionales que no deben confundirse con el peso del clasificador.
- GPU recomendadas: no disponibles en la información del repositorio. Por tamaño, cualquier GPU consumer moderna sería suficiente en teoría, pero no hay validación documentada en este espejo.
- ¿Cabe en GPU consumer?: previsiblemente sí, dado el tamaño del modelo base, pero no se documenta una configuración probada.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-mas-detector-v1-mirror-NaitikVora (este) | 86M (heredados) | no disponible | Clasificación de seguridad de prompts | Llama 4 Community License | Espejo en HuggingFace, 0 descargas |
| meta-llama/Llama-Prompt-Guard-2-86M | 86M | no disponible en esta ficha | Detección de inyección/jailbreak | Llama 4 Community License | Modelo base oficial de Meta |
| NaitikVora/Llama-mas-detector-v1 | 86M (heredados) | no disponible | Clasificación de seguridad de prompts | Llama 4 Community License | Release upstream original |

La comparativa se limita al linaje directo del modelo porque la información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas de la misma categoría. No se dispone de métricas para comparar calidad de detección entre estos tres artefactos.

## Limitaciones y advertencias

- El mantenedor del espejo no ha entrenado, evaluado ni certificado el modelo; no hay garantía de seguridad ni recomendación de despliegue implícita en la preservación.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de idioma en la información disponible.
- El modelo es un clasificador, no un generador: no debe esperarse generación de texto, razonamiento ni tool calling.
- La licencia Llama 4 Community License impone obligaciones de atribución y una política de uso aceptable (USE_POLICY.md); el uso comercial está sujeto a los términos de dicha licencia y a posibles restricciones de escala.
- El espejo no reproduce el historial Git upstream; es un snapshot fijo y no refleja necesariamente releases posteriores del autor original.
- El tamaño del repositorio (19,0 GB) es muy superior al esperado para un modelo de 86M de parámetros, por lo que conviene inspeccionar el manifiesto de payload antes de asumir qué artefactos se están descargando.
- No hay descargas ni likes registrados, lo que implica ausencia de validación comunitaria sobre este snapshot concreto.
- La fecha de creación registrada (2026-10-29) y la de captura (2026-10-28) deben tratarse como metadatos del repositorio, no como indicadores de madurez del modelo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Goro64/Llama-mas-detector-v1-mirror-NaitikVora
- Release upstream original: https://huggingface.co/NaitikVora/Llama-mas-detector-v1
- Commit upstream capturado: https://huggingface.co/NaitikVora/Llama-mas-detector-v1/tree/7704c3c339e7382b219914beacd11c048084c2ce
- Model card upstream en la revisión capturada: https://huggingface.co/NaitikVora/Llama-mas-detector-v1/blob/7704c3c339e7382b219914beacd11c048084c2ce/README.md
- Modelo base: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Colección de espejos de seguridad de prompts: https://huggingface.co/collections/Goro64/prompt-security-preserved-upstream-mirrors-6ae31d121d3b87fd4016b1af

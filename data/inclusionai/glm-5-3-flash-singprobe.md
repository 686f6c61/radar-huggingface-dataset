# inclusionAI/GLM-5.3-Flash-singprobe

## Resumen

GLM-5.3-Flash-singprobe es una sonda de seguridad ligera (guardrail intrínseco) desarrollada por el equipo de inclusionAI sobre el modelo base zai-org/GLM-5.3-Flash. A diferencia de los enfoques tradicionales, que despliegan un modelo de moderación independiente y añaden latencia extra, SingProbe reutiliza los estados ocultos del propio modelo base durante la generación para puntuar, token a token, la intención de la consulta, el riesgo de respuesta insegura y la probabilidad de alucinación. Esto la convierte en una solución de streaming: el moderado ocurre en tiempo real mientras el modelo genera, sin una segunda pasada.

La sonda tiene solo 8,13 millones de parámetros (frente a los miles de millones del modelo base) y añade menos del 0,5% de sobrecoste en la fase de decodificación. En los benchmarks publicados compite de tú a tú con guardrails dedicados mucho mayores, como YuFeng-XGuard-Reason-8B o Qwen3Guard-Gen-8B, superándolos en varias métricas, con una tasa de falsos positivos media de solo 0,02% en respuestas benignas.

Su relevancia actual radica en la tendencia hacia moderación "inline" en servidores de inferencia: SingProbe ya cuenta con integraciones en ramas de SGLang y vLLM, lo que permite activar el guardrail con un simple parámetro al lanzar el servidor, sin infraestructura adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda (probe) ligera sobre estados ocultos del modelo base, con atención "sing_probe_attn" (custom code) |
| Parametros totales | 8.132.106 (8,13 M) |
| Parametros activos | no disponible (no es un modelo MoE generativo) |
| Longitud de contexto | Heredada del modelo base zai-org/GLM-5.3-Flash (valor exacto no disponible) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles (los benchmarks de evaluación no detallan idiomas) |
| Licencia | glm-5.3-flash (licencia "other", vinculada a la licencia del modelo base zai-org/GLM-5.3-Flash) |
| Formato de pesos | safetensors |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Modelo base | zai-org/GLM-5.3-Flash |
| Capas intervenidas (tapped layers) | [14, 29, 43] |
| Salidas | 8 clases de intención de consulta + puntuación de inseguridad + puntuación de alucinación |
| Sobrecoste en decodificación | < 0,5% |
| Descargas / Likes en HuggingFace | 302 / 1 |

## Arquitectura y entrenamiento

SingProbe no es un modelo generativo: es una sonda de clasificación que se engancha a los estados intermedios (hidden states) del modelo base GLM-5.3-Flash en tres capas concretas (14, 29 y 43) durante la generación. En cada token emitido, la sonda produce un diccionario de puntuaciones (`label_0` a `label_9`) que incluye la clasificación de la intención de la consulta del usuario (8 clases), el riesgo de que la respuesta sea insegura y el riesgo de alucinación. El enfoque se describe como "intrinsic streaming guardrail": la moderación es intrínseca al proceso de decodificación y funciona en streaming, sin necesidad de un segundo modelo ni de una segunda pasada sobre el texto.

Los detalles completos de la metodología y del entrenamiento (datos usados, número de pasos, etc.) están en el informe técnico publicado en arXiv (arXiv:2608.30703). El código de entrenamiento está disponible públicamente en el repositorio inclusionAI/SingProbe en GitHub. No se han detallado en la model card los datos de entrenamiento ni las técnicas de alineación empleadas.

## Capacidades

- Clasificación de la intención de la consulta del usuario en 8 categorías, token a token, en tiempo real.
- Detección de respuestas inseguras (safety) durante la generación en streaming, con métricas R-AUC y T-AUC.
- Detección de riesgo de alucinación sobre las respuestas generadas.
- Integración con servidores de inferencia SGLang y vLLM mediante ramas específicas, devolviendo un diccionario de puntuaciones por cada token generado.
- Sobrecoste mínimo en latencia (< 0,5% en decodificación), apto para producción.
- Tasa de falsos positivos muy baja (0,02% de media en 5 conjuntos de datos de respuestas benignas).
- No genera texto: su función es exclusivamente de moderación y supervisión.

## Casos de uso

- Moderación en tiempo real de chatbots: al puntuar cada token generado, se puede cortar una respuesta insegura antes de que el usuario la vea completa, en lugar de revisarla al final.
- Despliegue de GLM-5.3-Flash en producción con guardrail integrado: basta añadir `--probe-ckpt inclusionAI/GLM-5.3-Flash-singprobe` al lanzar SGLang o vLLM, sin un segundo servicio de moderación.
- Detección de alucinaciones en RAG: se puede usar la puntuación de alucinación para marcar o regenerar respuestas con bajo soporte factual en sistemas de generación aumentada por recuperación.
- Enrutado de consultas por intención: las 8 clases de intención permiten dirigir la petición a distintos flujos (soporte, venta, queja, etc.) o aplicar políticas de seguridad diferenciadas.
- Cumplimiento normativo y auditoría: el registro de puntuaciones por token genera una traza auditable del riesgo de cada conversación, útil en sectores regulados.
- Reducción de costes de moderación: al sustituir un guardrail de 8B parámetros por una sonda de 8 M con menos del 0,5% de sobrecoste, se elimina el coste de GPU de un modelo de moderación independiente.
- Sistemas de agentes con ejecución de herramientas: la clasificación de intención y el score de inseguridad pueden usarse como condición previa antes de autorizar llamadas a herramientas sensibles.

## Benchmarks y rendimiento

Resultados publicados en la model card (promedios sobre los conjuntos de benchmarks indicados; más alto es mejor en todas las métricas):

| Tarea | Métrica | GLM-5.3-Flash-singprobe | Baseline de referencia |
|---|---|---:|---:|
| Clasificación de intención de consulta (6 benchmarks) | F1 | 0,8683 | YuFeng-XGuard-Reason-8B: 0,8714 |
| Clasificación de seguridad de respuesta (8 benchmarks) | F1 | 0,8706 | Qwen3Guard-Gen-8B-strict: 0,8604 |
| Seguridad en streaming (3 benchmarks) | R-AUC / T-AUC | 0,9786 / 0,9232 | Qwen3Guard-Stream-8B-strict: 0,9640 / 0,8893 |
| Detección de alucinación (6 benchmarks) | AUC | 0,8143 | DRIFT: 0,8000 |

Características de despliegue publicadas:

| Característica | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,02% de media en 5 datasets |
| Sobrecoste en decodificación | < 0,5% |

Cabe destacar que la sonda, con 8,13 M de parámetros, iguala o supera a guardrails dedicados de 8B en la mayoría de métricas, con ventajas especialmente claras en streaming (R-AUC y T-AUC).

## Requisitos de hardware

- La sonda en sí es mínima (8,13 M de parámetros, aproximadamente 16-33 MB en fp16/fp32), por lo que su VRAM adicional es despreciable.
- El requisito real de hardware lo impone el modelo base zai-org/GLM-5.3-Flash, cuyas especificaciones exactas no están disponibles en la información proporcionada.
- Al tratarse de una sonda que interviene en capas intermedias del modelo base, es necesario ejecutarla junto al modelo base en la misma infraestructura de inferencia.
- Despliegue soportado mediante ramas específicas de SGLang (rama token-probe-ling3-flash-main) y vLLM (rama bailing-v3-token-probe). No consta soporte en llama.cpp ni Ollama.
- Es imprescindible usar el par exacto de checkpoint: zai-org/GLM-5.3-Flash como base y este probe; no es compatible con otros modelos base.
- Latencia y throughput: el sobrecoste publicado es inferior al 0,5% en el tiempo de decodificación; no se han publicado cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Enfoque | Rendimiento (según benchmarks publicados) | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash-singprobe | Sonda intrínseca en streaming | 8,13 M | Reutiliza hidden states del modelo base, token a token | F1 intención 0,8683; F1 seguridad 0,8706; R-AUC/T-AUC 0,9786/0,9232; AUC alucinación 0,8143 | glm-5.3-flash (other) |
| YuFeng-XGuard-Reason-8B | Guardrail dedicado | 8B | Modelo de clasificación independiente | F1 intención 0,8714 | no disponible |
| Qwen3Guard-Gen-8B / Qwen3Guard-Stream-8B | Guardrail dedicado (Qwen) | 8B | Modelo generativo/clasificador de moderación | F1 seguridad 0,8604; R-AUC/T-AUC 0,9640/0,8893 | no disponible |
| DRIFT | Detector de alucinación | no disponible | Método de referencia en benchmarks de alucinación | AUC 0,8000 | no disponible |

La ventaja diferencial de SingProbe no es solo el tamaño (tres órdenes de magnitud menor que los guardrails de 8B), sino el modo de operación: modera en streaming durante la generación, mientras los guardrails dedicados suelen evaluar la consulta o la respuesta completa una vez terminada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse como chatbot ni para producir texto; su única función es la clasificación y puntuación de riesgo.
- Requiere obligatoriamente el modelo base exacto zai-org/GLM-5.3-Flash; no es portable a otros modelos sin reentrenamiento.
- Depende de integraciones en ramas específicas de SGLang y vLLM, no en las versiones estables oficiales, lo que puede suponer un riesgo de mantenimiento a medio plazo.
- Usa custom code (`custom_code`, atención `sing_probe_attn`), lo que exige confiar en el código remoto de HuggingFace (`trust_remote_code`) y revisarlo antes de uso en producción.
- Los idiomas soportados no están especificados en la model card; conviene validar el comportamiento en castellano antes de desplegar.
- La licencia es "other" (glm-5.3-flash) y hereda las condiciones de la licencia del modelo base zai-org/GLM-5.3-Flash; debe revisarse esa licencia antes de cualquier uso comercial.
- Las métricas de benchmarks son promedios sobre suites concretas elegidas por los autores; el rendimiento en dominios no cubiertos por esos benchmarks no está garantizado.
- Con solo 302 descargas y 1 like en el momento de redactar la ficha, se trata de un modelo muy reciente y con poco recorrido comunitario; la madurez para producción es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/GLM-5.3-Flash-singprobe
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Informe técnico (arXiv): https://arxiv.org/abs/2608.30703
- Código de entrenamiento (GitHub): https://github.com/inclusionAI/SingProbe
- Rama de integración en SGLang: https://github.com/jinzhen-lin/sglang/tree/token-probe-ling3-flash-main
- Rama de integración en vLLM: https://github.com/jinzhen-lin/vllm/tree/bailing-v3-token-probe
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE

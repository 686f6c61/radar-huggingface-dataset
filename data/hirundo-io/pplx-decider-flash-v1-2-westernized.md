# hirundo-io/pplx-decider-flash-v1.2-westernized

## Resumen

hirundo-io/pplx-decider-flash-v1.2-westernized es un modelo derivado (merge) del modelo base perplexity-ai/pplx-decider-flash-v1.2, publicado por el usuario hirundo-io en Hugging Face. Se presenta como un modelo de clasificación de texto orientado a la toma de decisiones (decision-model) y con un proceso declarado de mitigación de sesgos ("westernized"), según las etiquetas del repositorio. El modelo conserva la arquitectura del base, identificada en los tags como qwen3_5, y cuenta con 4.539.265.536 parámetros totales según los pesos en safetensors.

El interés de esta ficha radica en que documenta una variante de un modelo de decisión de Perplexity AI, pero con información pública muy limitada: el repositorio no incluye descripción, datos de entrenamiento, benchmarks ni idiomas soportados, y el acceso está restringido mediante gating en Hugging Face. Además, el modelo se publicó recientemente y no registra descargas ni interacciones, por lo que no existe evidencia de uso en producción ni validación externa.

Por tanto, esta ficha debe interpretarse como una descripción de las características declaradas en la model card y en los metadatos del repositorio, no como una evaluación de rendimiento. Cualquier decisión de adopción debería basarse en una evaluación propia tras aceptar las condiciones de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio); detalles no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible únicamente indica que el modelo deriva del base perplexity-ai/pplx-decider-flash-v1.2 mediante un merge, y que la arquitectura del base se etiqueta como qwen3_5. No se detallan el número de capas, la dimensión oculta, el mecanismo de atención, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica en qué consiste exactamente el proceso "westernized" más allá de la etiqueta bias-mitigation: no hay documentación sobre qué sesgos se mitigan, con qué datos ni con qué metodología de evaluación.

El pipeline declarado es text-classification, lo que sugiere un uso orientado a tareas de decisión o etiquetado, pero no se aportan ejemplos de entrada/salida, formato de prompt ni clases objetivo. Al tratarse de un merge sin model card detallada, no es posible verificar la innovación técnica ni la receta de entrenamiento.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, orientado a tareas de decisión.
- Toma de decisiones: el nombre y los tags (decision-model) indican uso como modelo de decisión, aunque no se documenta el formato exacto de las decisiones.
- Mitigación de sesgos: el tag westernized y bias-mitigation sugiere un ajuste orientado a reducir sesgos culturales o geográficos, sin metodología pública.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de tickets de soporte: usar el modelo para asignar categorías o prioridades a tickets entrantes; su pipeline de text-classification encaja con esta tarea, aunque requiere validación propia al no haber benchmarks.
- Enrutado de decisiones en pipelines internos: integrar el modelo como clasificador de decisión en un flujo de orquestación, por ejemplo para decidir si una consulta se escala a un humano o a otro modelo.
- Moderación de contenido asistida: emplearlo como clasificador de categorías de contenido, siempre que se valide su comportamiento en el dominio concreto y se audite el efecto del ajuste "westernized".
- Investigación sobre mitigación de sesgos: comparar las salidas de esta variante con las del modelo base para estudiar el efecto del merge en las decisiones del clasificador.
- Etiquetado semi-automático de datasets: preetiquetar grandes volúmenes de texto para revisión humana, aprovechando el tamaño de 4.5B parámetros para despliegue en una sola GPU.
- Evaluación comparativa de merges: usar el modelo como caso de estudio en pipelines de evaluación de modelos derivados, midiendo degradación o cambios de comportamiento respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros, en FP16 se requieren aproximadamente 9 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en FP16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 o 8 bits.
- GPU de consumo: sí cabe en GPUs de consumo con 8 GB o más en cuantización de 4 bits; en FP16 requiere al menos 12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (si se generan pesos GGUF, no disponibles en el repositorio), Transformers con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hirundo-io/pplx-decider-flash-v1.2-westernized | 4.539 M | no disponible | text-classification / decision | apache-2.0 | gated en HF |
| perplexity-ai/pplx-decider-flash-v1.2 (base) | no disponible | no disponible | decision-model | no disponible | no disponible |
| Alternativas de clasificación de ~4B (p. ej. variantes Qwen) | ~4B | variable | clasificación/generación | variable | públicas en HF |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables verificadas en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Información pública muy escasa: no hay model card detallada, dataset, metodología de entrenamiento ni evaluación.
- Sin benchmarks: no es posible estimar su calidad frente al modelo base ni frente a alternativas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Sin evidencia de uso: cero descargas y cero likes en el momento de la consulta.
- Riesgo de alucinación y sesgos: no evaluado; el ajuste "westernized" puede introducir sesgos propios no documentados.
- Idiomas no declarados: no se puede asumir cobertura multilingüe.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del gating.
- Al ser un merge sin validación, el comportamiento puede degradarse respecto al base en dominios específicos.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/pplx-decider-flash-v1.2-westernized
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2

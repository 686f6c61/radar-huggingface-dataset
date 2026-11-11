# pipestream-ai/turbo-en-civil-comments-modernbert-base-context-head-1

## Resumen

`turbo-en-civil-comments-modernbert-base-context-head-1` es un artefacto de clasificación de texto publicado por pipestream-ai dentro de su zoo de modelos turboembed. No se trata de un modelo completo, sino de una "cabeza" (head) de clasificación que se instala sobre el codificador `answerdotai/ModernBERT-base` y que se usa como categorizador de documentos (`COMPONENT_DOCUMENT_CATEGORIZER`). Su función concreta es clasificar comentarios civiles en inglés, un dominio derivado del corpus Civil Comments (Jigsaw / Conversation AI, Borkan et al., 2019).

El modelo base, ModernBERT-base, es un transformer encoder de 149 millones de parámetros con atención de longitud de contexto extendida (hasta 8.192 tokens en su configuración original), lo que lo hace adecuado para clasificación de documentos largos. La cabeza añadida por pipestream-ai se distribuye en un único fichero `.tivh` de 37.008 bytes, con formato propietario del ecosistema turboembed, y se instala a través del propio zoo del framework.

La relevancia de este artefacto es limitada pero específica: sirve como componente de un pipeline de moderación o categorización de comentarios en inglés, y su interés principal reside en el formato de distribución compacto (solo la cabeza, no el encoder) y en la integración con el ecosistema turboembed. No incluye métricas de evaluación en el propio artefacto ni una model card con detalles de entrenamiento más allá de la procedencia de los datos y del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Head de clasificación sobre encoder ModernBERT-base (transformer encoder) |
| Parámetros totales | No disponible (la cabeza pesa 37.008 bytes; el encoder base ModernBERT-base tiene 149 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del artefacto; el base ModernBERT-base soporta hasta 8.192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tivh` (formato propietario de turboembed, fichero único de 37.008 bytes) |

## Arquitectura y entrenamiento

El artefacto es una cabeza de clasificación (`KIND_HEAD`, `FORMAT_HEAD`) que se ejecuta sobre el bundle del encoder `answerdotai/ModernBERT-base`. ModernBERT es un transformer encoder con atención bidireccional, RoPE y atención local/global alternada que permite contextos largos; la cabeza añade la capa de salida para la tarea de categorización de documentos. El fichero de la cabeza registra el `sha256` del manifiesto del encoder base (`65a0720298fc5fe7f229ee57ffbe1ccf0eb3836a91526840ca23fa30a5937ac8`), de modo que el zoo verifica la integridad del conjunto antes de su uso.

El entrenamiento se realizó con `turbo-trainer` sobre el subconjunto Civil Comments WILDS (`shlomihod/civil-comments-wilds`, commit `3fbfeca80bad0f3aec37e72fa07eff222b6e752f`), concretamente sobre el fichero `all_data_with_identities.csv` con SHA-256 `403e638c83a225d738a937ff98b61fd0631e30f710d57928c7766d413526b77f`. El corpus original Civil Comments procede de Conversation AI / Jigsaw (Borkan et al., 2019) y se distribuye bajo CC0-1.0. No se documentan en el artefacto el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales (RLHF/DPO no aplican a una tarea de clasificación).

## Capacidades

- Clasificación de documentos y comentarios en inglés (categorizador de documentos, `COMPONENT_DOCUMENT_CATEGORIZER`).
- Etiquetado de comentarios civiles según las definiciones de etiqueta del corpus Civil Comments WILDS.
- Integración con el zoo de modelos turboembed mediante identificador, con verificación de tamaño y digest de cada fichero.
- Ejecución sobre el encoder ModernBERT-base, que aporta contexto largo (hasta 8.192 tokens en su configuración original).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente una cabeza de clasificación.
- Sin capacidades multilingües: solo inglés.

## Casos de uso

- Moderación de comentarios en plataformas de noticias o foros: la cabeza clasifica comentarios en inglés según las categorías del corpus Civil Comments, y puede integrarse en un pipeline de premoderación para priorizar la revisión humana.
- Filtrado de toxicidad en comunidades online: al estar entrenada sobre Civil Comments, es adecuada para señalar comentarios que requieren revisión antes de su publicación.
- Etiquetado de datasets de comentarios: útil para anotar automáticamente grandes volúmenes de comentarios en inglés con las etiquetas del corpus WILDS, como paso previo a un análisis supervisado.
- Enriquecimiento de pipelines de análisis de opinión: combinada con el encoder ModernBERT-base, permite procesar documentos largos (hasta 8.192 tokens) y asignar categorías a nivel de documento.
- Componente de un sistema de clasificación documental dentro del ecosistema turboembed: se instala por ID y el zoo verifica la integridad del fichero, lo que simplifica el despliegue en entornos que ya usan este framework.
- Investigación sobre sesgos en moderación: al derivar de Civil Comments, que incluye identidades anotadas, puede usarse para estudiar disparidades de clasificación entre grupos demográficos, siempre con la cautela de que el artefacto no publica métricas de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "Held-out metrics: not included in this artifact."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el encoder ModernBERT-base (149 M de parámetros) requiere del orden de 0,3 GB en fp16 y menos de 0,2 GB en int8, pero estas cifras corresponden al modelo base y no están confirmadas para este artefacto.
- GPU recomendadas: no disponible. El tamaño del encoder base sugiere que cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU consumer: probablemente sí, dado el tamaño del encoder base, pero no confirmado en la información disponible.
- Opciones de despliegue: el artefacto se instala exclusivamente a través del zoo de turboembed por su identificador; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbo-en-civil-comments-modernbert-base-context-head-1 | Head de clasificación sobre ModernBERT-base | 149 M (encoder base) + cabeza | No disponible (base: 8.192) | Apache-2.0 | Hugging Face (zoo turboembed) |
| answerdotai/ModernBERT-base | Encoder base | 149 M | 8.192 | Apache-2.0 | Hugging Face |
| Modelos de clasificación de toxicidad tipo Detoxify | Clasificador completo | No disponible | No disponible | Varía | Hugging Face / repositorios propios |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El artefacto no incluye evaluación held-out, por lo que su calidad real no está cuantificada en la model card.
- Es solo una cabeza: requiere el bundle del encoder `answerdotai/ModernBERT-base` con el manifiesto `sha256` indicado; sin él no funciona.
- Solo inglés; refleja el dominio y las definiciones de etiqueta de su corpus de entrenamiento (Civil Comments WILDS), por lo que puede degradarse fuera de ese dominio.
- Riesgo de sesgo: el corpus Civil Comments contiene anotaciones de identidad y ha sido objeto de estudios sobre disparidades de clasificación entre grupos demográficos; no se documenta ninguna mitigación en el artefacto.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos/negativos en la clasificación, sin métricas publicadas para acotarlo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el corpus de entrenamiento (CC0-1.0) y el modelo base (Apache-2.0) imponen sus propias condiciones de atribución.
- Para producción: al no haber métricas ni documentación de calibración, conviene validar el modelo sobre un conjunto propio antes de desplegarlo en un pipeline de moderación.
- El formato `.tivh` es propietario de turboembed; no hay conversión documentada a safetensors, GGUF u otros formatos estándar.

## Enlaces

- Hugging Face: https://huggingface.co/pipestream-ai/turbo-en-civil-comments-modernbert-base-context-head-1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset Civil Comments WILDS: https://huggingface.co/datasets/shlomihod/civil-comments-wilds
- Licencia turboembed: https://github.com/ai-pipestream/turboembed/blob/main/LICENSE
- Repositorio turboembed: https://github.com/ai-pipestream/turboembed

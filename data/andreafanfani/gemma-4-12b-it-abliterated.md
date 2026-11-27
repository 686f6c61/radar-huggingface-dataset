# andreafanfani/gemma-4-12B-it-abliterated

## Resumen

`andreafanfani/gemma-4-12B-it-abliterated` es una variante "abliterated" (sin censura) del modelo multimodal `google/gemma-4-12B-it` de Google DeepMind, publicada por el usuario andreafanfani en Hugging Face. El modelo parte de los pesos oficiales de Gemma 4 12B instruct y aplica una intervención de tipo *abliteration* con el objetivo declarado de eliminar los mecanismos de rechazo y filtrado de contenido, manteniendo las capacidades originales del modelo base. La model card lo etiqueta como "heretic", "uncensored", "decensored" y "reproducible".

Con 11.959.730.176 parámetros (aproximadamente 12B), el modelo conserva la arquitectura y el pipeline `any-to-any` del Gemma 4 original, lo que implica capacidades multimodales de entrada y salida (texto e imagen). Se distribuye en formato safetensors para `transformers` con el tipo de modelo `gemma4_unified`, y el repositorio ocupa 24 GB. Es relevante para investigadores interesados en estudiar el comportamiento de modelos sin alineación de seguridad, en análisis de sesgos y en experimentos de *red-teaming*, si bien su acceso está restringido (gated) y su uso en producción plantea riesgos considerables.

La licencia declarada es Apache 2.0, aunque conviene verificar la compatibilidad con los términos del modelo base de Google, que pueden imponer condiciones adicionales. El modelo tiene un volumen de descargas muy bajo (20 descargas, 0 likes en el momento de la consulta), lo que sugiere que se trata de una publicación reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tipo `gemma4_unified`), derivada de Gemma 4 |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (verificar compatibilidad con la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `google/gemma-4-12B-it`, un transformer multimodal con pipeline `any-to-any` (entrada y salida en múltiples modalidades, incluyendo texto e imagen). El identificador de arquitectura en Hugging Face es `gemma4_unified`, y el repositorio incluye los tags `image-text-to-text` y `any-to-any`, lo que confirma el soporte de entrada de imagen junto a texto.

La intervención aplicada es *abliteration*, una técnica que consiste en identificar las direcciones de activación asociadas al comportamiento de rechazo y proyectarlas fuera del espacio de activaciones o modificar los pesos para suprimir esa respuesta. La model card menciona el tag `reproducible`, lo que sugiere que el autor documenta el procedimiento, aunque no se dispone en la información proporcionada de detalles sobre el dataset de calibración, el número de tokens utilizados ni si hubo un ajuste fino posterior. No se dispone de información sobre RLHF, DPO ni sobre la composición del dataset de entrenamiento original de Gemma 4 12B.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Gemma 4 12B instruct.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`, `any-to-any`), con capacidad de describir, analizar o razonar sobre imágenes de entrada.
- Generación de código y matemáticas (capacidad esperable del modelo base, aunque no verificada en esta variante).
- Comportamiento sin filtros de rechazo: el objetivo del *abliteration* es responder a solicitudes que el modelo original rechazaría.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación en seguridad de IA y *red-teaming*: el modelo permite estudiar qué tipo de contenido genera un modelo sin alineación de seguridad, sirviendo como base para construir clasificadores de contenido dañino o para evaluar la robustez de filtros.
- Análisis de sesgos y alucinaciones: al eliminar el comportamiento de rechazo, se facilita la observación de sesgos latentes y patrones de respuesta que el modelo base enmascara con negativas.
- Evaluación comparativa de técnicas de *abliteration*: investigadores pueden comparar esta variante con el Gemma 4 original para medir el impacto de la intervención en benchmarks de capacidad y seguridad.
- Generación de contenido creativo sin restricciones en entornos controlados: escritura de ficción, guiones o narrativa que aborde temas sensibles, siempre con revisión humana y en contextos donde el filtrado del modelo base resulte limitante.
- Desarrollo de datasets de contraste: generación de pares de respuestas (con y sin alineación) para entrenar modelos de moderación o de preferencia.
- Experimentación académica con modelos multimodales: análisis de cómo el *abliteration* afecta a tareas de visión-lenguaje, como descripción de imágenes o respuesta a preguntas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 32 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 12-14 GB; en 4 bits, alrededor de 7-8 GB (estimaciones teóricas, no verificadas para esta variante).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16; RTX 4090 (24 GB) puede funcionar en FP16 con contexto limitado o en cuantización de 8 bits.
- GPU de consumo: cabe en RTX 4090 (24 GB) en cuantización de 8 bits o inferior; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requeriría cuantización de 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo por el tipo `gemma4_unified`), vLLM y TGI si soportan la arquitectura Gemma 4; llama.cpp/Ollama requerirían conversión a GGUF no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Acceso |
|---|---|---|---|---|---|
| gemma-4-12B-it-abliterated (este) | ~12B | no disponible | Sí (any-to-any) | Apache 2.0 | Gated |
| google/gemma-4-12B-it | ~12B | no disponible | Sí | Términos Gemma | Público/gated según Google |
| Otras variantes abliterated de la familia Gemma | ~2B-27B según versión | variable | Depende de la base | variable | variable |

No se dispone de datos de rendimiento comparativo entre esta variante y el modelo base ni con otras alternativas.

## Limitaciones y advertencias

- El *abliteration* elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal, ofensivo o sexualmente explícito sin advertencia; no es apto para aplicaciones orientadas al público sin moderación externa.
- Riesgo elevado de alucinación y de afirmaciones falsas presentadas con confianza, agravado por la ausencia de negativas de seguridad.
- Sesgos conocidos del modelo base Gemma 4, potencialmente amplificados o alterados por la intervención; no se han documentado evaluaciones específicas de sesgo para esta variante.
- Idiomas soportados no documentados; se desconoce si el *abliteration* degrada el rendimiento multilingüe.
- La licencia Apache 2.0 declarada debe contrastarse con los términos de uso de Gemma de Google, que pueden imponer restricciones adicionales sobre el modelo base y sus derivados.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade una capa de control pero no garantiza la calidad o seguridad del artefacto.
- Publicación con muy poca validación comunitaria (20 descargas, 0 likes); no hay evidencia independiente de que los pesos funcionen correctamente ni de que la intervención sea reproducible.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andreafanfani/gemma-4-12B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Documentación de Gemma de Google: no disponible en la información proporcionada

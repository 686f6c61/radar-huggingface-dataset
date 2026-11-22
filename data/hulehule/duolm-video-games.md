# hulehule/DuoLM-Video-Games

## Resumen

DuoLM-Video-Games es un modelo de recomendación personalizada derivado de Qwen3-0.6B-Base mediante destilación de conocimiento, publicado por el usuario hulehule en Hugging Face. Su tarea es el ranking de candidatos (pipeline `text-ranking`): dado un contexto de usuario y una lista de ítems candidatos, el modelo puntúa y ordena cada candidato según su adecuación al perfil. Está especializado en el dominio de videojuegos y entrenado para producir rankings personalizados en inglés.

El modelo parte de la familia Qwen3 (arquitectura transformer densa, licencia Apache 2.0) y se presenta en formato safetensors con 1.191.827.456 parámetros totales según los pesos publicados, un tamaño superior al de Qwen3-0.6B-Base del que deriva, lo que sugiere capas adicionales de cabeza de ranking o módulos de destilación. El repositorio ocupa 4,8 GB y el acceso es restringido: requiere aceptar condiciones en Hugging Face antes de la descarga.

Su relevancia radica en el enfoque: aplicar un modelo de lenguaje pequeño (sub-2B) a ranking de recomendación mediante destilación, en lugar de recurrir a un LLM grande en producción. Esto reduce coste de inferencia y latencia en sistemas de recomendación, aunque el modelo es muy específico de dominio y de idioma. No hay resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B-Base) |
| Parametros totales | 1.191.827.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantización no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-0.6B-Base, un transformer denso decoder-only de la familia Qwen3, y se entrena mediante destilación de conocimiento para la tarea de ranking de candidatos en recomendación personalizada. La etiqueta `duolm` y el pipeline `text-ranking` indican que la salida del modelo es una puntuación de relevancia por candidato, no texto generativo libre. El número de parámetros publicados (1.191.827.456) supera el de Qwen3-0.6B-Base, lo que apunta a una arquitectura con cabeza de ranking o módulos adicionales sobre el backbone base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). El modelo está entrenado y evaluado en inglés y especializado en el dominio de videojuegos. El paper asociado es arXiv:2610.24481, referenciado en las etiquetas del repositorio.

## Capacidades

- Ranking de candidatos: puntúa y ordena una lista de ítems (videojuegos) según la adecuación al perfil de un usuario.
- Recomendación personalizada: modela preferencias de usuario a partir de contexto textual.
- Destilación de conocimiento: destila la capacidad de ranking de un modelo mayor (no especificado en la información disponible).
- Procesamiento de texto en inglés: entrada y salida en inglés.
- Integración en pipelines de recuperación y re-ranking: encaja como etapa de ranking tras un retrieval inicial.
- No se documentan capacidades de generación libre, tool calling, agentes, visión ni audio.

## Casos de uso

- Re-ranking en tiendas de videojuegos: tras un retrieval de candidatos por embeddings (por ejemplo, con Qwen3-Embedding-0.6B), DuoLM puntúa cada juego según el historial y preferencias del usuario para producir el orden final del escaparate.
- Recomendación en plataformas de descubrimiento de juegos: dado un perfil textual del jugador (géneros jugados, horas, reseñas), el modelo ordena catálogos de lanzamientos recientes o rebajas.
- Personalización de notificaciones y correos: seleccionar qué juego promocionar a cada usuario maximizando la probabilidad de clic según su perfil.
- Sistemas de recomendación de bajo coste: al ser un modelo sub-2B, puede desplegarse en una sola GPU consumer para servir rankings en tiempo real sin depender de un LLM grande.
- Evaluación offline de catálogos: generar rankings de referencia para comparar estrategias de recomendación o validar heurísticas en A/B tests.
- Filtrado de candidatos en motores de búsqueda internos: ordenar resultados de búsqueda de juegos dentro de una plataforma según la relevancia personalizada del usuario.
- Investigación en destilación para recomendación: servir como baseline reproducible para estudiar la transferencia de capacidad de ranking desde modelos mayores a modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,4 GB solo para pesos (1,19B parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,2 GB para pesos; en 4 bits, alrededor de 0,6 GB (estimaciones teóricas; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con margen (RTX 3060 12 GB, RTX 4070, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de GPU con 6-8 GB o más, incluso en FP16.
- Opciones de despliegue: al ser un modelo de ranking con pipeline `text-ranking`, requiere un wrapper de inferencia propio; vLLM, TGI o llama.cpp son opciones viables si el modelo se expone como modelo de lenguaje, pero no hay integración documentada específica para ranking.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoLM-Video-Games | 1,19B | no disponible | Ranking de recomendación (videojuegos) | Apache 2.0 | Gated en Hugging Face |
| Qwen3-0.6B-Base | 0,6B | no disponible en la información | Modelo base de lenguaje | Apache 2.0 | Público en Hugging Face |
| Qwen3-Embedding-0.6B | 0,6B | no disponible en la información | Embeddings para retrieval | Apache 2.0 | Público en Hugging Face |
| Modelos de ranking de recomendación de propósito general | no disponible | no disponible | Ranking | variable | variable |

La comparación directa con otros modelos de ranking de recomendación no está disponible en la información proporcionada; los dos modelos Qwen3 listados son los referenciados como base y como modelo de embeddings relacionado, no alternativas equivalentes de ranking.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Dominio: especializado en videojuegos; el rendimiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- Benchmarks: no hay resultados publicados, por lo que no es posible verificar su calidad frente a alternativas.
- Riesgo de sesgo: al derivar de un LLM y entrenarse con datos de interacción no documentados, puede reproducir sesgos de popularidad, género o plataforma presentes en el dataset de entrenamiento.
- Alucinación: al ser un modelo de ranking, el riesgo se manifiesta como puntuaciones mal calibradas o rankings inconsistentes, no como texto inventado.
- Producción: sin documentación de contexto máximo, cuantizaciones oficiales ni latencia, la integración en producción requiere validación empírica propia.
- Licencia Apache 2.0: permite uso comercial, pero las condiciones del gating en Hugging Face pueden añadir restricciones adicionales de uso.
- Fecha de creación (2026-10-22) y actualización (2026-11-22) según metadatos; verificar la vigencia del paper asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hulehule/DuoLM-Video-Games
- Paper asociado: https://arxiv.org/abs/2610.24481
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo de embeddings relacionado: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B

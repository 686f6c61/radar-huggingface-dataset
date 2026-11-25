# richardyoung/Muse-Glimmer-30B-heretic

## Resumen

Muse-Glimmer-30B-heretic es una variante "abliterated" (también etiquetada como uncensored, decensored o heretic) del modelo multimodal Muse-Glimmer-30B, desarrollado por el usuario richardyoung sobre el modelo base de meta-models. Se trata de un modelo de tipo image-text-to-text, es decir, acepta imágenes y texto como entrada y genera texto, con 29.776.626.688 parámetros totales según los pesos en safetensors (aproximadamente 29,8 mil millones). El repositorio ocupa 59,6 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

La relevancia de esta ficha radica en que documenta un caso de fine-tuning orientado a eliminar los mecanismos de rechazo y moderación del modelo original, una práctica habitual en la comunidad open source para obtener modelos con menos restricciones conductuales. El modelo conserva la arquitectura y el pipeline multimodal del base, pero incorpora las modificaciones propias de la técnica "heretic/abliterated", cuyos detalles concretos no se especifican en la información disponible.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, los idiomas soportados ni resultados de benchmarks. La ficha se completa con los datos verificables del repositorio y con las advertencias técnicas y de licencia pertinentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Muse-Glimmer-30B, pipeline image-text-to-text; familia muse_glimmer) |
| Parametros totales | 29.776.626.688 (~29,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se presenta con la etiqueta de arquitectura `muse_glimmer` y pipeline `image-text-to-text`, lo que indica un transformer multimodal capaz de procesar entradas de imagen y texto de forma conjunta. El recuento de parámetros en safetensors asciende a 29.776.626.688, coherente con un modelo denso de aproximadamente 30 mil millones de parámetros. No se especifica en la información disponible si emplea mezcla de expertos, atención lineal u otras variantes arquitectónicas, ni el tamaño de su ventana de contexto.

En cuanto al entrenamiento, se trata de un fine-tuning del modelo base meta-models/Muse-Glimmer-30B mediante técnicas de "abliteration" o "heretic", orientadas a reducir o eliminar las respuestas de rechazo del modelo original. Los tags incluyen `reproducible`, lo que sugiere que el autor documenta o permite reproducir el procedimiento de ajuste, aunque los detalles del dataset, el número de tokens y el método exacto (por ejemplo, modificación de direcciones de rechazo en los pesos o DPO con pares de preferencia) no se detallan en la información proporcionada. Los identificadores arXiv asociados (2406.11717, 2510.18892, 2504.13181, 2602.06036) apuntan a trabajos de referencia, pero su correspondencia concreta con el método de ajuste no está confirmada.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Comprensión de imágenes combinada con texto (pipeline image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Conducta "uncensored/decensored/abliterated": menor probabilidad de rechazar peticiones que el modelo base, orientada a usos sin moderación incorporada.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la abliteración comparando sus respuestas con las del base Muse-Glimmer-30B en conjuntos de prompts sensibles, midiendo tasas de rechazo y deriva conductual.
- Análisis de contenido visual en entornos controlados: al ser image-text-to-text, puede emplearse para describir y extraer información de imágenes en pipelines internos donde se requiere procesamiento de documentos escaneados o capturas.
- Generación de descripciones de imágenes para catalogación: integrado en un flujo de ingestión de activos digitales, el modelo puede producir metadatos textuales a partir de imágenes, con revisión humana posterior dada la ausencia de benchmarks publicados.
- Prototipado de asistentes conversacionales sin filtros: útil en entornos de investigación o creación de personajes donde se necesita un modelo que no introduzca rechazos sistemáticos, siempre con las salvaguardas externas adecuadas.
- Evaluación comparativa de variantes abliterated: sirve como punto de referencia en estudios que comparan distintas técnicas de eliminación de rechazo sobre un mismo modelo base multimodal.
- Experimentación con despliegue en endpoints compatibles: su tag `endpoints_compatible` permite probar la integración en infraestructura de inferencia gestionada, midiendo latencia y throughput reales antes de decidir un despliegue mayor.
- Fine-tuning posterior en dominios específicos: al estar bajo Apache 2.0 y en formato transformers/safetensors, puede servir de punto de partida para ajustes supervisados en tareas verticales, aunque el acceso gated obliga a aceptar las condiciones del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 60 GB solo para pesos, más memoria para el procesador de visión, el KV cache y activaciones; en la práctica se requieren 70-80 GB o más según la longitud de contexto.
- Cuantización a 8 bits: alrededor de 30 GB de pesos, lo que permite ejecución en una GPU de 40-48 GB (A100 40GB, L40S, A6000) con margen limitado.
- Cuantización a 4 bits: alrededor de 15-16 GB de pesos, viable en GPUs consumer de 24 GB (RTX 3090, RTX 4090) para contextos moderados; no se han publicado variantes GGUF oficiales en el repositorio.
- GPUs recomendadas para producción: H100 80GB o A100 80GB para FP16/BF16; A100 40GB o L40S para 8 bits.
- Despliegue: la librería indicada es transformers; por el tag `endpoints_compatible` puede servirse en infraestructura de endpoints compatibles. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible, especialmente por el componente multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| richardyoung/Muse-Glimmer-30B-heretic | ~29,8 B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Gated | Variante abliterated del base |
| meta-models/Muse-Glimmer-30B | no disponible en esta ficha | no disponible | Sí (según modelo base) | no disponible en esta ficha | no disponible | Modelo original sin modificar |
| Otras variantes abliterated de ~30 B | variable | variable | variable | variable | variable | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría; los datos del modelo base no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina o reduce los rechazos del modelo, lo que implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado sin salvaguardas internas; requiere moderación externa en cualquier despliegue.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual del modelo ni el impacto del ajuste sobre sus capacidades originales.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos o conversaciones extensas.
- El ajuste puede haber degradado capacidades del modelo base (razonamiento, visión, seguimiento de instrucciones); no hay evaluaciones que lo confirmen o descarten.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la automatización de descargas y el uso en pipelines de CI/CD.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo y de las condiciones adicionales del acceso gated.
- El repositorio tiene un volumen de descargas muy bajo (20) y ningún like, por lo que no existe validación comunitaria significativa sobre su calidad o estabilidad.
- No se ofrecen variantes cuantizadas oficiales (GGUF, AWQ, GPTQ) en la información disponible, lo que complica el despliegue en hardware consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Muse-Glimmer-30B-heretic
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Referencia arXiv 2406.11717: https://arxiv.org/abs/2406.11717
- Referencia arXiv 2510.18892: https://arxiv.org/abs/2510.18892
- Referencia arXiv 2504.13181: https://arxiv.org/abs/2504.13181
- Referencia arXiv 2602.06036: https://arxiv.org/abs/2602.06036

# pipestream-ai/turbo-en-civil-comments-modernbert-base-head-1

## Resumen

`turbo-en-civil-comments-modernbert-base-head-1` es un artefacto de clasificación de texto publicado por pipestream-ai dentro de su ecosistema turboembed, un "model zoo" de componentes modulares para pipelines de procesamiento documental. No se trata de un modelo completo, sino de una *head* (cabeza de clasificación) que se ejecuta sobre el encoder `answerdotai/ModernBERT-base`. El artefacto se distribuye en formato propietario `.tivh` (18 576 bytes) y se instala a través del propio zoo de turboembed, que verifica tamaño y digests antes de su uso.

El problema que aborda es la categorización de documentos, en concreto la clasificación de comentarios civiles del corpus Civil Comments (Conversation AI / Jigsaw, Borkan et al., 2019), un conjunto clásico para evaluar toxicidad y civismo en texto. La head se entrena sobre el subconjunto WILDS de Civil Comments y está pensada para integrarse en pipelines de moderación de contenido o análisis de comentarios en inglés.

Es relevante por su enfoque de modularidad: separa encoder y cabeza de clasificación, lo que permite reutilizar el mismo encoder ModernBERT para múltiples tareas cabiendo solo la head. La licencia Apache-2.0 y el uso de ModernBERT-base (encoder de 149M de parámetros con contexto de 8192 tokens) lo hacen atractivo para despliegues comerciales, aunque la ausencia de métricas de evaluación publicadas limita su adopción en producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Head de clasificación sobre encoder ModernBERT-base (transformer encoder) |
| Parámetros totales | no disponible (la head pesa 18 576 bytes; el encoder base ModernBERT-base tiene 149M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; heredada del encoder ModernBERT-base (8192 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tivh` (formato propietario de turboembed); requiere el bundle encoder de ModernBERT-base |
| Componente | `COMPONENT_DOCUMENT_CATEGORIZER` |
| Tipo de artefacto | `KIND_HEAD`, `FORMAT_HEAD`, versión 1 |
| Librería | turboembed |
| Modelo base | answerdotai/ModernBERT-base |
| SHA-256 del encoder requerido | `65a0720298fc5fe7f229ee57ffbe1ccf0eb3836a91526840ca23fa30a5937ac8` |

## Arquitectura y entrenamiento

La head se entrena sobre `answerdotai/ModernBERT-base`, un encoder transformer de tipo BERT modernizado (atención con RoPE, activación GeGLU, alternancia de atención global y local) que sirve como extractor de representaciones. La cabeza de clasificación añade las capas específicas para la tarea de categorización documental. El artefacto no incluye el encoder: solo la head, que se ejecuta sobre el bundle del encoder cuyo manifest sha256 está registrado en el fichero de la head.

El entrenamiento se realizó con `turbo-trainer` sobre el subconjunto Civil Comments WILDS (repositorio `shlomihod/civil-comments-wilds`, commit `3fbfeca80bad0f3aec37e72fa07eff222b6e752f`, fichero `all_data_with_identities.csv`, SHA-256 `403e638c83a225d738a937ff98b61fd0631e30f710d57928c7766d413526b77f`). El corpus original Civil Comments fue publicado por Conversation AI / Jigsaw (Borkan et al., 2019) bajo CC0-1.0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en clasificación). Tampoco se detalla la innovación técnica concreta de la head más allá de su integración en el zoo turboembed con verificación de integridad.

## Capacidades

- Clasificación de texto (categorización de documentos) en inglés, orientada a comentarios civiles.
- Etiquetado de toxicidad/civismo heredado de las definiciones de etiquetas del corpus Civil Comments.
- Integración en pipelines de procesamiento documental mediante el componente `COMPONENT_DOCUMENT_CATEGORIZER`.
- Instalación y verificación automática por id a través del model zoo de turboembed (comprobación de tamaño y digests).
- Reutilización del encoder ModernBERT-base subyacente para otras heads del mismo zoo.
- No se documentan capacidades de generación de texto, tool calling, agentes, multimodalidad ni modo de razonamiento (thinking): es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de comentarios en foros y plataformas: la head clasifica comentarios en inglés según las etiquetas de Civil Comments, integrándose en un pipeline que filtra o prioriza revisiones humanas.
- Análisis de civismo en medios sociales: permite etiquetar grandes volúmenes de comentarios para estudios de toxicidad y calidad de discurso, aprovechando el contexto de 8192 tokens del encoder ModernBERT-base.
- Enriquecimiento de pipelines de ingestión documental: como componente `DOCUMENT_CATEGORIZER`, asigna categorías a documentos en flujos ETL gestionados por turboembed.
- Filtrado previo en sistemas de atención al cliente: clasifica mensajes entrantes para derivar casos sensibles a equipos especializados antes de responder.
- Investigación en NLP social: reproduce o extiende experimentos sobre Civil Comments WILDS con una head ligera que se instala y verifica automáticamente.
- Prototipado rápido con reutilización de encoder: al separar head y encoder, un mismo despliegue de ModernBERT-base sirve para varias tareas de clasificación sin duplicar el encoder en memoria.
- Auditoría de contenido en repositorios de comentarios: etiquetado batch de datasets históricos para construir métricas de civismo a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "Held-out metrics: not included in this artifact" y "The artifact carries no held-out evaluation, so its quality is not stated here".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la head (18 576 bytes); el encoder ModernBERT-base (149M parámetros) requiere aproximadamente 0,3 GB en fp16 y 0,6 GB en fp32, más overhead de activaciones y batch.
- GPU recomendadas: no especificadas por el autor. Por tamaño del encoder, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, el encoder base cabe holgadamente en GPUs con 4-8 GB de VRAM.
- Opciones de despliegue: exclusivamente a través del model zoo de turboembed (librería `turboembed`), que instala la head por id y verifica digests. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbo-en-civil-comments-modernbert-base-head-1 | Head sobre encoder de 149M | Heredado de ModernBERT-base (8192) | Clasificación de comentarios civiles | Apache-2.0 | Solo vía zoo turboembed |
| answerdotai/ModernBERT-base | 149M | 8192 | Encoder base (fine-tune para múltiples tareas) | Apache-2.0 | Hugging Face |
| Modelos de toxicidad tipo unitary/toxic-bert | ~110M (BERT-base) | 512 | Clasificación de toxicidad | Apache-2.0 (variable) | Hugging Face |
| Modelos de clasificación sobre Civil Comments en HF | variable | variable | Clasificación de civismo | variable | Hugging Face |

La comparación directa con alternativas concretas no está disponible en la información proporcionada; los modelos citados son referencias de categoría, no comparaciones publicadas por el autor.

## Limitaciones y advertencias

- El artefacto no incluye evaluación held-out: su calidad no está cuantificada y requiere validación propia antes de usarlo en producción.
- Es solo una head: necesita el bundle del encoder `answerdotai/ModernBERT-base` con el manifest sha256 `65a0720298fc5fe7f229ee57ffbe1ccf0eb3836a91526840ca23fa30a5937ac8`; no funciona de forma autónoma.
- Solo inglés: no soporta otros idiomas.
- Refleja el dominio y las definiciones de etiquetas de su corpus de entrenamiento (Civil Comments WILDS); puede no generalizar a otros dominios o taxonomías.
- Riesgo de sesgos heredados del corpus Civil Comments (sesgos demográficos y de anotación documentados en la literatura sobre toxicidad).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la clasificación, agravado por la falta de métricas.
- Formato propietario `.tivh` y dependencia del ecosistema turboembed: no es portable a frameworks estándar sin conversión (no documentada).
- Sin descargas ni likes en el momento de la consulta: ecosistema muy incipiente, con soporte comunitario limitado.
- Licencia Apache-2.0 permite uso comercial, pero la licencia del corpus original (CC0-1.0) y del encoder (Apache-2.0) deben respetarse en la atribución.

## Enlaces

- Hugging Face: https://huggingface.co/pipestream-ai/turbo-en-civil-comments-modernbert-base-head-1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset Civil Comments WILDS: https://huggingface.co/datasets/shlomihod/civil-comments-wilds/blob/3fbfeca80bad0f3aec37e72fa07eff222b6e752f/README.md
- Licencia turboembed: https://github.com/ai-pipestream/turboembed/blob/main/LICENSE
- Paper original Civil Comments (Borkan et al., 2019): no disponible en la información proporcionada
- Repositorio turboembed: https://github.com/ai-pipestream/turboembed

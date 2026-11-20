# mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, un fine-tune "uncensored" (etiquetado como heretic) derivado de la familia Qwen3, con 27.320.697.856 parámetros totales según los pesos en safetensors del modelo base. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants GGUF en Hugging Face, y ofrece 13 variantes que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), además de dos suplementos multimodales mmproj (Q8_0 y f16).

El modelo base se presenta como un fine-tune multi-etapa (Cold Fusion, GAIN Training, Multi-stage tuning) entrenado con datasets propios del autor (Polar-STRICT, F451-STRICT y THE-DECKARD) y con el objetivo declarado de eliminar restricciones de alineación. Es relevante para quien necesite ejecutar un modelo de ~27B en hardware de consumo mediante llama.cpp u Ollama, aunque conviene subrayar que la información técnica publicada es muy escasa: no hay fichas de benchmarks, no se detalla la longitud de contexto y la model card del cuantizador se limita a listar los ficheros.

La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés. El repositorio ocupa 190,8 GB en total y acumula 1.374 descargas y 3 likes en el momento de la consulta, lo que lo sitúa como un artefacto de nicho dentro del ecosistema de modelos "uncensored".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3; detalles no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3 (etiquetas qwen3_8 y qwen3_6) y de que se trata de un transformer decoder-only de 27.320.697.856 parámetros. La model card del cuantizador no incluye configuración de capas, dimensiones ocultas, cabezas de atención ni mecanismos de atención específicos.

En cuanto al entrenamiento, el autor del modelo base declara un proceso de fine-tune multi-etapa sobre tres datasets propios (DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets), con técnicas etiquetadas como "Cold Fusion", "GAIN Training" y "Multi-stage tuning". No se especifica el número de tokens de entrenamiento, la composición exacta de los datasets, ni si hubo RLHF, DPO o alguna otra etapa de alineación. La etiqueta "unsloth" sugiere que el fine-tune se realizó con dicha librería, pero es una inferencia a partir de la metadata y no un dato confirmado en la documentación. Tampoco se documenta ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (tag conversational).
- Fine-tune orientado a eliminar restricciones de contenido ("uncensored", "heretic"), lo que implica menor rechazo a peticiones que los modelos alineados estándar.
- Soporte multimodal declarado de forma indirecta: el repositorio incluye ficheros mmproj-Q8_0 y mmproj-f16 descritos como "multi-modal supplement", lo que sugiere capacidad de entrada de imágenes en el modelo base, aunque la model card no detalla el alcance.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta soporte explícito de tool calling, function calling, agentes o multi-step reasoning.
- No se documenta modo "thinking" ni capacidades de audio.
- Capacidades multilingües: limitadas al inglés según la metadata.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: con la cuantización Q4_K_M (16,9 GB) el modelo puede cargarse en una RTX 4090 de 24 GB o en una RTX 3090, dejando margen para el contexto y el suplemento multimodal.
- Despliegue en servidores con CPU y RAM abundante: las variantes Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten ejecución en llama.cpp sobre equipos sin GPU dedicada, a costa de una pérdida de calidad notable.
- Experimentación en investigación sobre alineación y censura: el carácter "uncensored" lo hace útil para estudiar el comportamiento de modelos con restricciones reducidas, siempre con las salvaguardas legales y éticas correspondientes.
- Generación creativa de ficción y guiones: la menor tasa de rechazos facilita la escritura de narrativa con temáticas sensibles, un uso habitual de los fine-tunes heretic.
- Pruebas de pipelines de cuantización y evaluación de degradación: al ofrecer 11 niveles de cuantización del mismo modelo, permite medir empíricamente la pérdida de perplejidad y calidad entre Q2_K y Q8_0 en tareas concretas.
- Integración en prototipos de asistentes conversacionales en inglés con Ollama o llama.cpp, aprovechando la compatibilidad con endpoints para sustituir APIs comerciales en entornos de desarrollo.
- Evaluación comparativa de fine-tunes de la familia Qwen3: sirve como referencia para contrastar el efecto de las técnicas Cold Fusion y GAIN frente al modelo Qwen3 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el tamaño del fichero es una cota inferior; el contexto y el suplemento multimodal añaden consumo):
  - Q2_K: 11,0 GB.
  - Q3_K_S: 12,4 GB; Q3_K_M: 13,6 GB; Q3_K_L: 14,7 GB.
  - IQ4_XS: 15,5 GB; Q4_K_S: 15,9 GB; Q4_K_M: 16,9 GB.
  - Q5_K_S: 19,1 GB; Q5_K_M: 19,6 GB.
  - Q6_K: 22,5 GB.
  - Q8_0: 29,1 GB.
  - Suplemento multimodal: mmproj-Q8_0 0,7 GB; mmproj-f16 1,0 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB, H100 o RTX 6000 Ada para Q6_K y Q8_0; para Q8_0 también es válida una configuración multi-GPU.
- Cabe en GPU de consumo: sí, hasta Q5_K_M en una GPU de 24 GB; Q6_K y Q8_0 requieren 32 GB o más, o reparto entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones GGUF no son compatibles con vLLM de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-TWIN-TURBO, GGUF) | 27,3 B | no disponible | Apache 2.0 | GGUF | Fine-tune uncensored multi-etapa |
| Qwen3 original (familia) | no disponible en esta ficha | no disponible | Apache 2.0 (según familia) | safetensors, GGUF | Modelo base alineado de referencia |
| Fine-tunes "uncensored" de la comunidad (p. ej. variantes heretic de 27B) | variable | no disponible | variable | GGUF | Alternativas con objetivos similares de reducción de rechazos |

No se dispone de datos de rendimiento comparativos publicados para este modelo, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo "uncensored": la reducción de restricciones implica mayor probabilidad de generar contenido sensible, ofensivo o potencialmente dañino; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo elevado de alucinación: no hay benchmarks publicados que respalden la calidad factual del fine-tune.
- Idiomas: solo inglés declarado; el rendimiento en castellano es incierto y no está evaluado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación de contexto.
- Licencia Apache 2.0 declarada, pero conviene verificar la procedencia de los datasets de fine-tune (Polar-STRICT, F451-STRICT, THE-DECKARD) antes de un uso comercial, ya que el autor no detalla su composición ni su licencia.
- La model card del cuantizador es puramente mecánica: no aporta información sobre el comportamiento del modelo, por lo que cualquier decisión de producción debe basarse en evaluaciones propias.
- Los quants de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma significativa; la propia model card recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q8_0 como mejor calidad.
- El soporte multimodal solo está insinuado por la presencia de ficheros mmproj; no se documenta qué modalidades ni qué resolución admite.
- Fecha de creación del repositorio (2026-09-11) y actualización (2026-10-08): verificar la vigencia del modelo base y de sus dependencias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Quants con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets

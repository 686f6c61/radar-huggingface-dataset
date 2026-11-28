# mradermacher/Ostrich-27B-261008-Qwen3.8-Abliterated-i1-GGUF

## Resumen

Ostrich-27B-261008-Qwen3.8-Abliterated-i1-GGUF es una distribución de cuantizaciones GGUF del modelo etemiz/Ostrich-27B-261008-Qwen3.8-Abliterated, publicada por mradermacher. Se trata de una variante "abliterated" (con las capas de rechazo eliminadas mediante técnicas de abliteration) derivada de la familia Qwen3, con 27.320.697.856 parámetros totales según los pesos en safetensors. El repositorio ofrece cuantizaciones de tipo imatrix (i1) generadas con el método de mradermacher, orientadas a inferencia local con llama.cpp y herramientas compatibles.

El modelo está etiquetado como "vision model" en la model card, e incluye etiquetas temáticas relacionadas con salud, nutrición, hierbas medicinales, ayuno, fe, bitcoin y nostr, además de "uncensored", "aligned" y "based". La licencia declarada es Apache 2.0 y el único idioma indicado es inglés. El repositorio tiene un tamaño de 218,6 GB, lo que refleja la suma de todas las cuantizaciones disponibles.

La relevancia de esta ficha radica en que documenta una distribución de cuantizaciones de un modelo afinado y modificado para eliminar restricciones de rechazo, algo que interesa a desarrolladores que necesitan ejecutar modelos de ~27B en hardware de consumo o en servidores con recursos limitados. No obstante, la información pública disponible sobre el modelo base es escasa: no se detallan datos de entrenamiento, benchmarks ni arquitectura interna más allá de la referencia a Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3, segun el nombre del modelo) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base etemiz/Ostrich-27B-261008-Qwen3.8-Abliterated. El nombre sugiere que deriva de la familia Qwen3, con 27.320.697.856 parámetros totales, lo que lo sitúa en la categoría de modelos densos de ~27B. La model card no especifica si se trata de un transformer denso, MoE o una arquitectura híbrida, ni proporciona detalles sobre número de capas, dimensiones ocultas o mecanismos de atención.

Respecto al entrenamiento, no se documentan el número de tokens utilizados, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. La etiqueta "abliterated" indica que se aplicó una técnica de abliteration para eliminar la dirección de rechazo en el espacio de activaciones, lo que típicamente implica identificar la dirección asociada a respuestas de negativa y proyectarla fuera de los pesos. Las cuantizaciones i1 de mradermacher se generan con ficheros imatrix, que mejoran la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta "conversational" en el repositorio.
- Capacidad de visión: la model card indica explícitamente "This is a vision model", aunque los ficheros mmproj (si existen) se encuentran en el repositorio estático, no en el de cuantizaciones i1.
- Comportamiento "uncensored": al estar abliterated, el modelo no aplica las capas de rechazo típicas del modelo base, por lo que responde a solicitudes que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no se documentan modos de pensamiento (thinking mode), audio ni otras modalidades más allá de la visión indicada.

## Casos de uso

- Investigación sobre abliteration y alineación: el modelo permite estudiar cómo la eliminación de la dirección de rechazo afecta al comportamiento del modelo en dominios sensibles, comparando las respuestas con el modelo base sin modificar.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) e i1-Q4_K_S (15,9 GB) permiten ejecutar un modelo de ~27B en GPUs con 24 GB de VRAM, como una RTX 4090, usando llama.cpp u Ollama.
- Procesamiento de documentos con componente visual: al estar etiquetado como vision model, puede emplearse para tareas de descripción de imágenes o extracción de información de capturas, siempre que se descarguen los ficheros mmproj del repositorio estático.
- Generación de contenido creativo sin restricciones: para proyectos que requieren respuestas sin filtros de contenido, como escritura de ficción o guiones, el modelo abliterated evita las negativas del modelo base.
- Experimentación con temáticas específicas: las etiquetas de salud, nutrición, hierbas medicinales, ayuno, fe, bitcoin y nostr sugieren que el ajuste fino del modelo base se orientó a estos dominios, por lo que puede usarse para prototipos de asistentes en esas áreas.
- Evaluación de cuantizaciones imatrix: el repositorio incluye el fichero imatrix y múltiples niveles de cuantización, lo que permite a investigadores comparar la degradación de calidad entre i1-Q2_K y i1-Q6_K en tareas concretas.
- Integración en pipelines con endpoints compatibles: la etiqueta "endpoints_compatible" indica que puede servirse mediante APIs compatibles con OpenAI, útil para prototipos de aplicaciones conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K ~11,0 GB; i1-Q3_K_S ~12,4 GB; i1-IQ3_S ~12,7 GB; i1-IQ3_M ~12,9 GB; i1-Q3_K_M ~13,6 GB; i1-Q3_K_L ~14,7 GB; i1-IQ4_XS ~15,4 GB; i1-Q4_0 ~15,9 GB; i1-Q4_K_S ~15,9 GB; i1-Q4_K_M ~16,9 GB; i1-Q4_1 ~17,4 GB; i1-Q5_K_S ~19,1 GB; i1-Q5_K_M ~19,6 GB; i1-Q6_K ~22,5 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: para las cuantizaciones Q4 y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para el modelo en sí, con margen limitado para contexto. Para Q6_K conviene una GPU de 24 GB con contexto corto o una A6000 (48 GB). Para despliegues con contexto largo o concurrencia, se recomiendan A100 (40/80 GB) o H100 (80 GB).
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2 a Q4 caben en GPUs de 16-24 GB, como RTX 4080, RTX 4090 o RTX 3090. Las cuantizaciones Q5 y Q6 requieren 24 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints OpenAI (según la etiqueta "endpoints_compatible"). No se documenta soporte en vLLM o TGI para formato GGUF en esta información.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ostrich-27B-261008-Qwen3.8-Abliterated-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF (i1) | Abliterated, vision, solo ingles |
| Ostrich-27B-261008-Qwen3.8-Abliterated-GGUF (estatico) | 27,3B | no disponible | Apache 2.0 | GGUF (estatico) | Misma base, cuantizaciones estaticas y mmproj |
| etemiz/Ostrich-27B-261008-Qwen3.8-Abliterated | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen3 (familia base) | no disponible | no disponible | no disponible | no disponible | Referencia por nombre; sin datos verificados en esta informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo es "abliterated" y "uncensored": no aplica los filtros de rechazo del modelo base, por lo que puede generar contenido dañino, ofensivo o inexacto sin advertencia. No es adecuado para aplicaciones de producción orientadas al público sin una capa adicional de moderación.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; al ser un modelo afinado sin benchmarks publicados, se desconoce su tasa de alucinación.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no documentada; no se puede asumir la ventana de contexto de la familia Qwen3 sin confirmación.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base y los datos de ajuste cumplen las condiciones de la licencia, especialmente al tratarse de un modelo derivado con modificaciones de alineación.
- Capacidad de visión: la model card indica que es un modelo de visión, pero los ficheros mmproj no están en este repositorio i1, sino en el estático; sin ellos, la funcionalidad visual no estará disponible.
- Las etiquetas temáticas (salud, nutrición, hierbas medicinales, ayuno) no implican rigor médico; no debe usarse como fuente de consejo sanitario.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Ostrich-27B-261008-Qwen3.8-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/etemiz/Ostrich-27B-261008-Qwen3.8-Abliterated
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Ostrich-27B-261008-Qwen3.8-Abliterated-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Ostrich-27B-261008-Qwen3.8-Abliterated-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

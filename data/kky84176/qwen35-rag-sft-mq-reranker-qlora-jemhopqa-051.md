# kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-051

## Resumen

El modelo `kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-051` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario kky84176. Por la nomenclatura del identificador, se trata de un modelo derivado de la familia Qwen 3.5, entrenado mediante QLoRA (cuantización de bajo rango) y orientado a tareas de RAG (generación aumentada por recuperación), concretamente como reranker con un componente de SFT (supervised fine-tuning) sobre el dataset JemHopQA. El pipeline declarado en el Hub es `image-text-to-text`, lo que sugiere que el modelo base es multimodal.

El checkpoint contiene 852.985.920 parámetros (unos 853 millones) según los datos reales de los safetensors, con un tamaño de repositorio de 3,4 GB. La model card es la plantilla automática de Hugging Face, sin información cumplimentada por el autor: no se detallan datos de entrenamiento, hiperparámetros, licencia, idiomas ni resultados de evaluación. Por tanto, gran parte de las especificaciones deben marcarse como no disponibles.

Su relevancia es limitada y muy específica: se trata de un experimento de fine-tuning de un modelo pequeño para reranking en pipelines RAG sobre un benchmark de dominio concreto (JemHopQA, un dataset de QA en japonés). No cuenta con descargas ni interacciones, lo que indica que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen 3.5 (detalle no disponible); pipeline declarado image-text-to-text |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento se realizó con QLoRA según el nombre, pero no se publican los artefactos de cuantización) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, JemHopQA, es en japonés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna más allá de las etiquetas del Hub: `transformers`, `qwen3_5` e `image-text-to-text`. Esto indica que el modelo base pertenece a la familia Qwen 3.5 y que es multimodal (procesa imagen y texto), aunque el fine-tuning se orienta a una tarea textual de reranking en RAG. El identificador sugiere una adaptación QLoRA (LoRA con cuantización de 4 bits del modelo base), lo que implica que los pesos publicados podrían ser los adaptadores o una fusión de estos con el modelo base, sin que se especifique cuál de los dos casos.

Respecto al entrenamiento, solo puede inferirse a partir del nombre: SFT sobre el dataset JemHopQA con un propósito de reranking en un pipeline RAG (el segmento `mq-reranker`). No se publican número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La model card es la plantilla automática sin rellenar, por lo que todos los detalles de entrenamiento deben considerarse no disponibles.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen 3.5 (no verificable sin evaluación).
- Procesamiento multimodal imagen-texto según el pipeline declarado en el Hub.
- Reranking de documentos o pasajes en pipelines RAG, que es el propósito inferido del fine-tuning.
- Soporte de tool calling / function calling: no disponible (no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponible; el entrenamiento específico parece centrado en japonés (JemHopQA).
- Modo thinking, visión o audio: solo la vertiente imagen-texto es plausible por el pipeline declarado; el resto no está confirmado.

## Casos de uso

- Reranking en pipelines RAG: el modelo se usaría como segunda etapa de recuperación, reordenando los pasajes candidatos devueltos por un retriever vectorial antes de pasarlos al generador, aprovechando el ajuste específico sobre JemHopQA.
- QA sobre documentación en japonés: dado que el dataset de entrenamiento es JemHopQA (preguntas multihop en japonés), es adecuado para responder preguntas que requieren combinar información de varios pasajes en ese idioma.
- Filtrado de contexto para LLM de mayor tamaño: al ser un modelo de ~853 M de parámetros, puede actuar como filtro barato que reduce el número de documentos enviados al modelo generador, disminuyendo coste y latencia.
- Búsqueda semántica en bases documentales internas: integrado en un pipeline de recuperación para mejorar la precisión de los resultados en dominios con vocabulario especializado, siempre que se valide su comportamiento fuera del dominio de entrenamiento.
- Prototipado e investigación en reranking: sirve como punto de partida para experimentar con QLoRA sobre modelos multimodales pequeños en tareas de recuperación.
- Evaluación comparativa de estrategias RAG: útil en entornos de investigación para medir el impacto del reranking en la calidad final de las respuestas, con la cautela de que no hay métricas publicadas.
- Procesamiento de documentos con imágenes: por su pipeline image-text-to-text, podría emplearse en escenarios donde los pasajes a rerankear incluyen capturas o figuras, aunque esta capacidad no está validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, ~1,7 GB solo para pesos (853 M × 2 bytes), más overhead de activaciones y del procesador multimodal; en cuantización de 8 bits, ~0,9 GB; en 4 bits, ~0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente en términos de memoria; una RTX 3060 (12 GB), RTX 4060 Ti o RTX 4090 permiten ejecutar el modelo con holgura. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero pueden usarse para alto throughput.
- Cabe en GPU consumer: sí, con amplio margen, incluso en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si el modelo base es compatible, llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-051 | ~853 M | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tuning QLoRA para reranking RAG |
| BAAI/bge-reranker-base | ~278 M | 512 tokens | MIT | Hugging Face, ampliamente usado | Reranker cross-encoder específico, sin capacidades multimodales |
| BAAI/bge-reranker-v2-m3 | ~568 M | 8192 tokens | Apache 2.0 | Hugging Face | Reranker multilingüe con contexto largo |
| jina-reranker-v2-base-multilingual | ~278 M | 1024 tokens | CC BY-NC 4.0 | Hugging Face | Reranker multilingüe, licencia no comercial |

La comparación es aproximada: no hay datos de rendimiento publicados para el modelo de kky84176, por lo que no puede establecerse una jerarquía de calidad frente a los rerankers establecidos.

## Limitaciones y advertencias

- Model card sin cumplimentar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide validar el modelo para producción.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Sin descargas ni validación comunitaria: el modelo no ha sido evaluado por terceros.
- Riesgo de sobreajuste al dominio: el fine-tuning sobre JemHopQA (japonés, multihop) puede degradar el rendimiento fuera de ese dominio o idioma.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de reranking el riesgo se manifiesta como ordenaciones erróneas de pasajes.
- Idiomas: no se declaran idiomas soportados; el uso en castellano no está validado.
- Contexto: se desconoce la ventana máxima, lo que impide planificar pipelines con documentos largos.
- Formato de pesos: solo safetensors; no hay GGUF ni cuantizaciones listas para usar, lo que limita el despliegue en entornos sin GPU.
- Fecha de creación futura (2026-11-26) en los metadatos del Hub: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-051
- Paper citado en los tags (ML Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Dataset JemHopQA (referencia del nombre, sin enlace confirmado en la información disponible): no disponible

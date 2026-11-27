# kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-054

## Resumen

El modelo `kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-054` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario kky84176. Por la nomenclatura del identificador, se trata de un modelo derivado de la familia Qwen 3.5, entrenado mediante QLoRA (cuantizacion de 4 bits con adaptadores de bajo rango) y orientado a tareas de RAG (generacion aumentada por recuperacion), concretamente a la reordenacion de pasajes (reranking) sobre el conjunto de datos JemHopQA. El pipeline declarado en el Hub es `image-text-to-text`, lo que sugiere que el modelo base es multimodal.

El repositorio contiene 852.985.920 parametros en formato safetensors y ocupa 3,4 GB, un tamano coherente con un modelo de aproximadamente 0,8 mil millones de parametros. La model card es la plantilla autogenerada por Hugging Face y no aporta informacion sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion, por lo que la mayor parte de las especificaciones tecnicas no estan disponibles.

La relevancia de este modelo es limitada y fundamentalmente experimental: se publico el 27 de noviembre de 2026, no tiene descargas ni likes, y su interes reside en ser un ejemplo de adaptacion QLoRA de un modelo Qwen multimodal para reranking en pipelines RAG. No debe considerarse un modelo listo para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen 3.5, segun el tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repo; el entrenamiento se realizo con QLoRA (cuantizacion de 4 bits) segun el nombre del modelo |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El tag `qwen3_5` indica que el modelo parte de un checkpoint de la familia Qwen 3.5, y el pipeline `image-text-to-text` confirma que el modelo base es multimodal (acepta imagen y texto como entrada y genera texto). El sufijo `qlora` senala que el ajuste se realizo con QLoRA, es decir, congelando los pesos del modelo base cuantizados a 4 bits y entrenando adaptadores de bajo rango. El sufijo `rag-sft-mq-reranker` sugiere un ajuste supervisado (SFT) para reranking de pasajes en un contexto RAG, y `jemhopqa` identifica el conjunto de datos de entrenamiento (JemHopQA, un benchmark de QA multi-hop en japones).

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. La model card no incluye hiperparametros ni detalles del procedimiento de entrenamiento. Tampoco se especifica si los adaptadores LoRA se han fusionado con los pesos base en el checkpoint publicado o si se distribuyen por separado; el tamano del repo (3,4 GB para 853 M de parametros) es compatible con pesos en precision de 16 bits, lo que apunta a que los adaptadores estan fusionados.

## Capacidades

- Generacion de texto condicionada por imagen y texto, segun el pipeline declarado `image-text-to-text`.
- Reordenacion (reranking) de pasajes recuperados en pipelines RAG, que es el objetivo declarado en el nombre del modelo.
- Respuesta a preguntas multi-hop, dado el ajuste sobre JemHopQA.
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes, vision detallada, audio o modo thinking: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible; el dataset de entrenamiento (JemHopQA) es en japones, pero no se confirma el idioma de salida.

## Casos de uso

- Reranking en pipelines RAG: el modelo puede puntuar y reordenar los pasajes recuperados por un buscador vectorial o lexico antes de pasarlos al generador, mejorando la precision del contexto final. Es el uso para el que fue entrenado explicitamente.
- Busqueda documental multi-hop: dado su ajuste sobre JemHopQA, es adecuado para preguntas que requieren combinar evidencia de varios documentos, como consultas sobre normativa o documentacion tecnica dispersa.
- Procesamiento de documentos escaneados con imagen: al ser un modelo image-text-to-text, puede recibir capturas o paginas escaneadas junto con la consulta y reordenar fragmentos extraidos de ellas.
- Filtrado de contexto en asistentes conversacionales: puede integrarse como etapa intermedia que descarta pasajes irrelevantes antes de la generacion, reduciendo el consumo de tokens del modelo generador.
- Evaluacion experimental de tecnicas QLoRA: sirve como referencia para equipos que quieran replicar un ajuste de bajo coste sobre un modelo multimodal pequeno (853 M de parametros) en una unica GPU.
- Prototipado de sistemas de QA en japones: el entrenamiento sobre JemHopQA lo hace candidato para experimentos de respuesta a preguntas en ese idioma, siempre que se valide su calidad real.
- Investigacion sobre reranking multimodal: permite estudiar como un modelo con entrada de imagen se comporta en tareas de recuperacion de texto, un escenario poco explorado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 M de parametros, en fp16 requiere aproximadamente 1,7 GB solo para los pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 0,9 GB; en 4 bits, en torno a 0,5 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberia ser suficiente en fp16; para lotes grandes o contexto largo se recomienda 16 GB o mas (RTX 4080, RTX 4090).
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), y previsiblemente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se confirma compatibilidad con estas herramientas en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-054 | 853 M | No disponible | Reranking RAG multimodal | No disponible | Hugging Face (0 descargas) |
| BAAI/bge-reranker-v2-m3 | No disponible en esta ficha | No disponible | Reranking de texto | No disponible en esta ficha | Hugging Face |
| jinaai/jina-reranker-v2-base-multilingual | No disponible en esta ficha | No disponible | Reranking multilingue | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento del modelo evaluado ni de los comparadores en la informacion proporcionada, por lo que la comparativa se limita a categoria y disponibilidad. No se han identificado alternativas multimodales de reranking comparables en la informacion disponible.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada de Hugging Face y no documenta sesgos, riesgos ni limitaciones; no hay garantia de calidad del ajuste.
- Riesgo de alucinacion: no evaluado; al ser un ajuste SFT sobre un modelo pequeno, la fiabilidad en tareas fuera del dominio de entrenamiento es incierta.
- Licencia no disponible: no se puede confirmar el uso comercial. La licencia del modelo base Qwen 3.5 condiciona la del derivado, pero no se indica cual aplica.
- Idiomas: el entrenamiento se realizo sobre JemHopQA (japones); el rendimiento en castellano u otros idiomas no esta documentado.
- Ausencia de benchmarks: no hay evidencia publicada de que el modelo supere a alternativas establecidas de reranking.
- Cero descargas y cero likes: no hay senales de validacion por parte de la comunidad.
- El pipeline declarado es `image-text-to-text`, pero la tarea de reranking suele formularse como clasificacion o scoring; no se documenta como se obtiene la puntuacion de relevancia.
- Para produccion se recomienda evaluar el modelo contra un conjunto de validacion propio antes de integrarlo en un pipeline RAG.

## Enlaces

- Hugging Face: https://huggingface.co/kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-054
- Paper citado en los tags (Machine Learning Impact calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact

# mradermacher/Qwen-encoder-1.5B-GGUF

## Resumen

Qwen-encoder-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo knowledgator/Qwen-encoder-1.5B, un encoder derivado de la familia Qwen y adaptado mediante la técnica LLM2Vec para tareas de representación y clasificación de texto. Lo publica mradermacher, un conocido autor de cuantizaciones comunitarias en Hugging Face, y está pensado para su uso con llama.cpp y herramientas compatibles, no con transformers en su forma original. El modelo base cuenta con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) y está licenciado bajo Apache 2.0.

El interés de esta ficha radica en que ofrece una vía práctica para ejecutar un encoder basado en un LLM de 1,5B en hardware de consumo, con cuantizaciones que van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16). Está orientado a tareas de question answering, clasificación, NER y generación de embeddings, y declara soporte únicamente para inglés. La información pública disponible sobre arquitectura interna, contexto y datos de entrenamiento es limitada, por lo que varios campos de esta ficha se marcan como no disponibles.

No se trata de un modelo generativo conversacional al uso, sino de un encoder: su utilidad principal es producir representaciones vectoriales o etiquetas sobre texto de entrada, lo que condiciona tanto los casos de uso como las herramientas de despliegue recomendadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de Qwen, adaptado con LLM2Vec (detalles internos no disponibles) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es knowledgator/Qwen-encoder-1.5B, un encoder construido sobre la arquitectura Qwen y adaptado mediante LLM2Vec, una técnica que convierte modelos de lenguaje decoder-only en encoders de texto eficaces para tareas de representación. La model card del repositorio cuantizado no detalla la composición exacta del dataset de entrenamiento más allá de referenciar `wikimedia/wikipedia`, ni especifica el número de tokens utilizados, la presencia de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal. Toda esa información se considera no disponible en la documentación proporcionada.

La contribución de este repositorio es exclusivamente la cuantización: mradermacher genera versiones estáticas en GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf) a partir de los pesos originales en safetensors. También existe una variante con cuantizaciones ponderadas/imatrix en el repositorio Qwen-encoder-1.5B-i1-GGUF, que el autor recomienda para obtener mejor calidad a igual tamaño.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación.
- Question answering extractivo y de recuperación sobre documentos en inglés.
- Clasificación de texto (el modelo declara la etiqueta `classification`).
- Reconocimiento de entidades nombradas (NER).
- Tareas de representación derivadas del paradigma LLM2Vec.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica sobre documentación técnica en inglés: el encoder genera vectores para indexar y recuperar fragmentos relevantes en un motor vectorial, aprovechando su tamaño reducido para desplegarse en CPU o GPU modesta.
- Clasificación de tickets de soporte: se puede afinar una cabeza de clasificación sobre las representaciones del encoder para etiquetar incidencias por categoría, con la ventaja de que el modelo cabe en cuantización Q4 en menos de 2 GB de memoria.
- Extracción de entidades en textos legales o periodísticos: uso como backbone para NER, sustituyendo modelos BERT-base con un encoder de 1,5B parámetros cuando se necesita mayor capacidad de representación.
- Question answering sobre bases de conocimiento internas: combinado con un recuperador, el encoder puntúa la relevancia de pasajes frente a una pregunta en inglés.
- Deduplicación y clustering de documentos: generación de embeddings para agrupar textos similares en pipelines de limpieza de datos.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (1,0 GB) y Q4_K_M (1,1 GB) permiten ejecutar el modelo en portátiles y contenedores sin GPU dedicada mediante llama.cpp.
- Prototipado rápido de sistemas RAG: al estar en GGUF, se integra con herramientas ligeras y permite validar pipelines de recuperación antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB (Q2_K), 1,0-1,1 GB (Q4_K_S / Q4_K_M), 1,4 GB (Q6_K), 1,7 GB (Q8_0) y 3,2 GB (f16), sin contar overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre para cuantizaciones Q4-Q8; para f16 se recomienda al menos 4 GB. En gama profesional, A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para servir en lote.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en iGPU con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). El modelo base en safetensors puede servirse con transformers; vLLM y TGI no están confirmados para este encoder.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-encoder-1.5B-GGUF (este) | 1,54B | no disponible | en | apache-2.0 | GGUF |
| knowledgator/Qwen-encoder-1.5B (base) | 1,54B | no disponible | en | apache-2.0 | safetensors |
| Qwen-encoder-1.5B-i1-GGUF (imatrix) | 1,54B | no disponible | en | apache-2.0 | GGUF (imatrix) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con encoders alternativos como BERT-base o E5; esa comparación se marca como no disponible.

## Limitaciones y advertencias

- El modelo declara soporte únicamente para inglés; su uso en castellano u otros idiomas no está respaldado por la model card.
- Al ser un encoder y no un modelo generativo, no debe esperarse que produzca texto libre ni conversación; usarlo como chat dará resultados pobres.
- No se han publicado datos sobre sesgos, riesgo de alucinación ni evaluación de robustez; se recomienda validar en el dominio concreto antes de producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar la calidad de las representaciones; el autor recomienda Q4_K_S o Q4_K_M para uso general y las variantes imatrix para mayor fidelidad.
- El repositorio tiene un número muy bajo de descargas (134) y ningún like en el momento de la consulta, lo que sugiere poca validación comunitaria.
- No hay información sobre la longitud de contexto soportada, lo que impide garantizar el comportamiento en documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen-encoder-1.5B-GGUF
- Modelo base: https://huggingface.co/knowledgator/Qwen-encoder-1.5B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen-encoder-1.5B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Qwen-encoder-1.5B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset referenciado: https://huggingface.co/datasets/wikimedia/wikipedia

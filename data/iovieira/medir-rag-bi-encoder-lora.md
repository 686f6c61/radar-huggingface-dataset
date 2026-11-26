# iovieira/medir-rag-bi-encoder-lora

## Resumen

medir-rag-bi-encoder-lora es un adaptador LoRA para recuperación densa (bi-encoder) publicado por el usuario iovieira en el marco del proyecto MedIR-RAG de la Universidad de Évora, dentro de la asignatura de Recuperación de Información en Bases de Texto. El adaptador se entrena sobre el modelo base BAAI/bge-small-en-v1.5 y está especializado en pares pregunta/pasaje del corpus biomédico BioASQ, con el objetivo de mejorar la recuperación de evidencia para sistemas RAG en dominio médico.

El modelo no es un generador de texto: es un codificador de frases que produce embeddings normalizados para búsqueda semántica. Su relevancia radica en que demuestra una estrategia de bajo coste (fine-tuning mediante PEFT/LoRA sobre un encoder pequeño) para adaptar un modelo de recuperación generalista a un dominio especializado, y en que reporta resultados tanto en modo denso puro como en configuración híbrida con BM25 mediante fusión RRF.

La información pública disponible es muy limitada: el repositorio no incluye licencia, idiomas declarados, pipeline ni datos de entrenamiento detallados más allá de la referencia a BioASQ y al script `train_bi_encoder.py`. Cualquier uso en producción debería acompañarse de una evaluación propia sobre el corpus objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (encoder de frases derivado de BAAI/bge-small-en-v1.5) con adaptadores LoRA |
| Parametros totales | no disponible (el modelo base bge-small-en-v1.5 es de clase "small"; el adaptador LoRA añade un subconjunto de parametros no cuantificado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (el corpus de entrenamiento, BioASQ, es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre BAAI/bge-small-en-v1.5, un encoder Transformer de la familia BGE orientado a embeddings de frases y recuperación densa. El entrenamiento se realiza con PEFT/LoRA sobre pares pregunta/pasaje de BioASQ, un conjunto de preguntas biomédicas con pasajes de evidencia asociados. El objetivo es ajustar el espacio de embeddings para que las preguntas clínicas queden más próximas a los pasajes relevantes del corpus médico que en el modelo base.

La model card referencia el script `train_bi_encoder.py` como código de entrenamiento, pero no detalla el número de tokens, la composición exacta del dataset, hiperparámetros, ni si se aplicaron técnicas de negativos duros, destilación o fases de re-ranking. Tampoco se documenta ninguna innovación arquitectónica más allá del propio ajuste LoRA: el pipeline de uso consiste en cargar el SentenceTransformer base, sustituir el `auto_model` por el adaptador fusionado con `merge_and_unload()` y codificar pasajes con `normalize_embeddings=True`.

## Capacidades

- Generación de embeddings densos normalizados para pasajes y consultas, aptos para búsqueda por similitud coseno o producto escalar.
- Recuperación de evidencia en dominio biomédico, entrenada específicamente sobre pares pregunta/pasaje de BioASQ.
- Integración en pipelines RAG como recuperador (retriever) de primera etapa.
- Combinación con recuperación léxica BM25 mediante fusión RRF, configuración en la que el autor reporta mejoras sustanciales.
- Compatibilidad con el ecosistema SentenceTransformers y PEFT para carga, fusión y despliegue.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un encoder de recuperación.

## Casos de uso

- Recuperación de evidencia en asistentes clínicos: el adaptador indexa pasajes biomédicos y devuelve los más relevantes para una pregunta del profesional, sirviendo como etapa de recuperación previa a un LLM generador en un pipeline RAG.
- Búsqueda híbrida en literatura médica: al combinarse con BM25 mediante RRF, cubre tanto coincidencias léxicas exactas (fármacos, códigos, términos raros) como similitud semántica, lo que el autor reporta como la configuración de mejor rendimiento.
- Sistemas de preguntas y respuestas sobre guías clínicas: el encoder permite localizar el fragmento de guía que respalda una respuesta, facilitando la trazabilidad de las citas.
- Indexación de bases de conocimiento internas de hospitales o universidades: al ser un adaptador pequeño sobre un encoder "small", el coste de indexación y de inferencia es reducido comparado con encoders de mayor tamaño.
- Filtrado previo en pipelines de re-ranking: se usa como recuperador de primera etapa que reduce el corpus a decenas de candidatos antes de un cross-encoder más costoso.
- Prototipado e investigación en recuperación de información: el repositorio incluye el script de entrenamiento, lo que permite reproducir y adaptar el ajuste LoRA a otros corpus de preguntas/respuestas.
- Evaluación comparativa de estrategias densas frente a léxicas en dominios especializados, usando las métricas NDCG@5 y MRR@10 reportadas como referencia.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el corpus completo con 279 preguntas de test:

| Configuracion | NDCG@5 | MRR@10 |
|---|---|---|
| Adaptador LoRA solo (denso) | 0.1871 | 0.2795 |
| Hibrido RRF con BM25 | 0.4613 | 0.6482 |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base sin adaptador, ni frente a otros retrievers, ni métricas de Recall@k.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA sobre un encoder de clase "small", la inferencia es muy ligera; el adaptador en sí ocupa una fracción mínima del tamaño del modelo base.
- VRAM estimada: no disponible de forma exacta en la información; por la clase del modelo base, cabe holgadamente en GPUs de consumo (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso puede ejecutarse en CPU para volúmenes moderados.
- GPU recomendadas para indexación a gran escala: A100, H100 o L4 para throughput alto; para experimentación, cualquier GPU consumer reciente es suficiente.
- Despliegue: SentenceTransformers con PEFT para cargar y fusionar el adaptador; el modelo fusionado puede exportarse a formatos estándar de inferencia (por ejemplo, ONNX u otros soportados por el stack de SentenceTransformers) para servir mediante frameworks de embeddings.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| medir-rag-bi-encoder-lora | LoRA sobre bi-encoder | no disponible (base "small") | no disponible | no disponible | Especializado en BioASQ; resultados densos modestos, muy buenos en híbrido con BM25 |
| BAAI/bge-small-en-v1.5 | Bi-encoder base | clase "small" | no disponible en esta ficha | no disponible en esta ficha | Modelo generalista sobre el que se entrena el adaptador; sin métricas comparativas publicadas aquí |
| Alternativas de recuperación biomédica (por ejemplo, encoders especializados tipo BioBERT/MedCPT) | Encoders de dominio | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada para una comparación cuantitativa |

No se dispone de datos suficientes en la información proporcionada para establecer una comparación numérica fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- No se declaran idiomas soportados; el entrenamiento se realizó sobre BioASQ, en inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- El rendimiento en modo denso puro es bajo en términos absolutos (NDCG@5 de 0.1871 y MRR@10 de 0.2795), lo que sugiere que el adaptador es útil principalmente en combinación con BM25.
- No se documentan datos de sesgo, robustez ni evaluación de alucinación; al ser un recuperador, el riesgo se traslada al generador que consuma los pasajes recuperados.
- El modelo no genera texto: no debe evaluarse como un LLM ni usarse para tareas generativas.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni documentación extendida; la madurez y el mantenimiento del proyecto no están garantizados.
- La información de entrenamiento (hiperparámetros, negativos, tamaño del corpus) no está publicada, lo que dificulta la reproducibilidad completa.
- Al ser un adaptador LoRA, requiere cargar el modelo base BAAI/bge-small-en-v1.5 y fusionarlo; un uso incorrecto sin `merge_and_unload()` puede degradar los embeddings.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iovieira/medir-rag-bi-encoder-lora
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Corpus BioASQ: no disponible en la información proporcionada
- Paper o blog del proyecto MedIR-RAG: no disponible en la información proporcionada
- Repositorio con el código de entrenamiento (`train_bi_encoder.py`): no disponible como enlace en la información proporcionada

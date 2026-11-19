# nlpai-lab/KURE-v3

## Resumen

KURE-v3 es un modelo de recuperación densa (dense retrieval) bilingüe coreano-inglés desarrollado por nlpai-lab, un laboratorio de investigación centrado en modelos de lenguaje y recuperación de información para el idioma coreano. El modelo transforma textos en vectores densos de una sola representación (single-vector) que se comparan mediante similitud coseno, y está diseñado específicamente para tareas de búsqueda semántica y sistemas RAG (Retrieval-Augmented Generation) sobre corpus coreanos e ingleses.

Con 1.140.918.272 parámetros (aproximadamente 1,1B), KURE-v3 se construye mediante fine-tuning del modelo base nvidia/Nemotron-3-Embed-1B-BF16 y alcanza un promedio de 0,8027 nDCG@10 en las nueve tareas de MTEB(kor, v2) Retrieval, superando según el autor a modelos densos de 8B como comsat-embed-ko-8b-preview y Qwen3-Embedding-8B. Esta relación entre tamaño reducido y rendimiento competitivo lo convierte en una opción atractiva para despliegues con restricciones de VRAM.

El modelo incorpora embeddings Matryoshka (entrenado a 2.048, 1.024, 512 y 256 dimensiones), admite documentos de hasta 8.192 tokens y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. Está disponible tanto en Hugging Face para uso local con sentence-transformers como a través de una API compatible con OpenAI en kure.kullm.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso (fine-tune de nvidia/Nemotron-3-Embed-1B-BF16); una etiqueta del repo indica "ministral3" |
| Parametros totales | 1.140.918.272 (1,1B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors BF16; el repo no detalla cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con sentence-transformers) |

## Arquitectura y entrenamiento

KURE-v3 es un modelo de embedding denso de tipo encoder transformer, derivado por fine-tuning del modelo nvidia/Nemotron-3-Embed-1B-BF16. Produce una única representación vectorial por texto (dense, single-vector) de 2.048 dimensiones, normalizada L2, de modo que la similitud coseno equivale al producto escalar. Emplea prompts asimétricos: el prefijo `query: ` para consultas y `passage: ` para documentos, gestionados automáticamente por los métodos `encode_query` y `encode_document` de sentence-transformers.

La innovación principal es el entrenamiento con embeddings Matryoshka a 2.048, 1.024, 512 y 256 dimensiones, lo que permite truncar los vectores para reducir coste de almacenamiento y latencia en la búsqueda sin reentrenar. El modelo soporta además FlashAttention 2 mediante `attn_implementation="flash_attention_2"`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF/DPO; tampoco se especifica la función de pérdida de contraste utilizada.

## Capacidades

- Generación de embeddings densos de 2.048 dimensiones por texto, con similitud coseno como métrica de relevancia.
- Recuperación semántica bilingüe coreano-inglés en tareas de passage retrieval y document retrieval.
- Embeddings Matryoshka truncables a 1.024, 512 y 256 dimensiones.
- Procesamiento de documentos largos de hasta 8.192 tokens.
- Soporte de prompts asimétricos query/passage integrado en la librería sentence-transformers.
- Extracción de características (feature-extraction) y uso como backbone en pipelines de similitud de frases.
- Servicio mediante API compatible con OpenAI (endpoint `embeddings.create` con `input_type` query/document y parámetro `dimensions`).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de visión o audio: es un modelo exclusivamente de representación.

## Casos de uso

- Búsqueda semántica en corpus coreanos: indexación de documentación, artículos o bases de conocimiento en coreano y recuperación por similitud coseno, aprovechando el rendimiento de 0,8027 nDCG@10 promedio en MTEB(kor, v2).
- Sistemas RAG bilingües: recuperación de pasajes relevantes en coreano e inglés para alimentar un LLM generador, con vectores truncados a 512 o 256 dimensiones para reducir el tamaño del índice.
- Atención al cliente automatizada: recuperación de fragmentos de FAQ y manuales de producto en coreano para fundamentar respuestas, con contexto de hasta 8.192 tokens por documento.
- Búsqueda legal y regulatoria: uso sobre LawIRKo y corpus normativos coreanos, donde el modelo obtiene 0,8158 nDCG@10 según la model card.
- Búsqueda en literatura biomédica y sanitaria: recuperación sobre PubHealthQA (0,8639 nDCG@10) para asistentes de consulta médica en coreano.
- Deduplicación y clustering de documentos: generación de embeddings para agrupar noticias o registros duplicados en pipelines de datos, con vectores de 256 dimensiones para escalar a millones de documentos.
- Evaluación de similitud semántica en pipelines de QA: comparación de preguntas de usuario con preguntas canónicas en coreano, útil en sistemas de enrutamiento de tickets.
- Integración vía API: uso del endpoint compatible con OpenAI en kure.kullm.ai para prototipado rápido sin infraestructura propia.

## Benchmarks y rendimiento

Resultados en MTEB(kor, v2) Retrieval (nDCG@10), según la model card:

| Modelo | Tipo | Params | Avg | AutoRAG | PubHealthQA | Ko-StrategyQA | LawIRKo | SQuADKorV1 | Belebele (ko-ko) | MrTidy | MLDR | MIRACL |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nlpai-lab/KURE-v3 | Dense | 1.1B | 0.8027 | 0.9324 | 0.8639 | 0.8192 | 0.8158 | 0.9666 | 0.9673 | 0.6320 | 0.4781 | 0.7489 |
| nlpai-lab/KURE-v2 | Late-interaction | 0.2B | 0.8160 | 0.9718 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo incluye la primera fila de KURE-v2 en la tabla comparativa; el resto de valores de esa fila y las filas de comsat-embed-ko-8b-preview y Qwen3-Embedding-8B no están disponibles en el material proporcionado, aunque el autor afirma que KURE-v3 supera a ambos modelos de 8B en el promedio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,3 GB de pesos más overhead de activaciones; en la práctica, entre 3 y 5 GB para lotes pequeños.
- VRAM en FP32: alrededor de 4,6 GB solo para pesos.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para alto throughput; RTX 3090, RTX 4080 o RTX A6000 para despliegues de producción moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Con cuantización a 8 bits podría ejecutarse en GPUs de 6 GB, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: sentence-transformers (referencia), vLLM y TGI para servir como modelo de embeddings, y la API compatible con OpenAI en kure.kullm.ai. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nlpai-lab/KURE-v3 | 1.1B | 8.192 | Dense, Matryoshka | Apache 2.0 | Hugging Face + API |
| nlpai-lab/KURE-v2 | 0.2B | no disponible | Late-interaction | no disponible en la información | Hugging Face |
| comsat-embed-ko-8b-preview | 8B | no disponible | Dense | no disponible en la información | no disponible en la información |
| Qwen3-Embedding-8B | 8B | no disponible | Dense | no disponible en la información | no disponible en la información |

Según el autor, KURE-v3 (1,1B) supera en promedio a comsat-embed-ko-8b-preview y Qwen3-Embedding-8B (ambos 8B) en MTEB(kor, v2) Retrieval, con la ventaja adicional de requerir aproximadamente una séptima parte de los parámetros. Los valores detallados de esos modelos no están incluidos en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado principalmente sobre corpus coreanos e ingleses, puede infrarrepresentar variedades dialectales o registros coloquiales.
- Alucinación: al ser un modelo de embeddings y no generativo, no produce texto, pero puede devolver recuperaciones irrelevantes en dominios fuera de distribución (por ejemplo, MLDR con 0,4781 nDCG@10 es su tarea más débil).
- Cobertura de idiomas limitada a coreano e inglés; el rendimiento en otros idiomas no está garantizado ni evaluado.
- Contexto máximo de 8.192 tokens: documentos más largos deben truncarse o dividirse en fragmentos, lo que puede degradar la recuperación.
- La truncación Matryoshka reduce la calidad; conviene validar el tamaño de vector elegido (1.024, 512, 256) sobre el dominio concreto antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base (nvidia/Nemotron-3-Embed-1B-BF16) y de los datasets de entrenamiento, no detallados en la información disponible.
- No se publican datos sobre robustez ante ataques de inyección de prompts ni sobre comportamiento en dominios especializados distintos de los evaluados.
- El uso de la API pública kure.kullm.ai requiere autenticación con GitHub y está sujeta a las condiciones del servicio, no especificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/KURE-v3
- Repositorio GitHub del proyecto KURE: https://github.com/nlpai-lab/KURE
- API KURE: https://kure.kullm.ai/
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Modelo predecesor KURE-v2: https://huggingface.co/nlpai-lab/KURE-v2

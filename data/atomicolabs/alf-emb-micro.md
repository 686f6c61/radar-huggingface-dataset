# AtomicoLabs/ALF-emb-micro

## Resumen

ALF-emb-micro 1.0 es un modelo de embeddings bilingües (inglés y español) desarrollado por AtomicoLabs, un laboratorio de investigación aplicada en IA. Se trata de un fine-tune del modelo `intfloat/multilingual-e5-large-instruct` (MIT) al que se le ha aplicado una poda de vocabulario (de 560M a 370M parámetros) y una cuantización dinámica por canal a int8, con el objetivo de ofrecer un modelo ligero y eficiente para despliegue en dispositivos o entornos con recursos limitados. El formato de distribución es ONNX, lo que facilita su uso con `onnxruntime` en CPU o GPU.

El modelo está diseñado para tareas de similitud semántica, recuperación de información (retrieval) y búsqueda de pasajes, con un enfoque específico en los idiomas inglés y español. Su tamaño reducido (370M parámetros) y su formato int8 lo hacen adecuado para aplicaciones on-device, manteniendo un rendimiento competitivo frente a alternativas comerciales como `text-embedding-3-small` de OpenAI, especialmente en recuperación en español y dominios específicos. La ventana de contexto está limitada a 512 tokens, y el modelo no es un generador de texto, sino un encoder puro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de multilingual-e5-large-instruct) |
| Parametros totales | 370M (tras poda de vocabulario; original 560M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | int8 dinámico por canal (ONNX) |
| Idiomas soportados | en, es |
| Licencia | MIT |
| Formato de pesos | ONNX (per-channel int8) |

## Arquitectura y entrenamiento

El modelo parte de `multilingual-e5-large-instruct`, un encoder transformer de 560M parámetros entrenado con instrucciones para tareas de retrieval y similitud semántica. AtomicoLabs realizó un fine-tune sobre este modelo base, seguido de una poda de vocabulario que redujo el tamaño a 370M parámetros (vocabulario de 64.5k tokens). Posteriormente, los pesos se cuantizaron a int8 dinámico por canal y se exportaron a ONNX, con mean-pooling y normalización L2 para producir vectores de 1024 dimensiones. El proceso de entrenamiento no está detallado en la información disponible (no se especifican datos de entrenamiento, número de tokens ni uso de RLHF/DPO). El modelo no es un generador de texto; es un encoder puro para representaciones densas.

## Capacidades

- Generación de embeddings de frases o documentos para similitud semántica (STS).
- Recuperación de pasajes (retrieval) con prefijo de instrucción para consultas: `"Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: "`.
- Búsqueda semántica bilingüe (inglés y español).
- Clasificación de textos mediante embeddings (como entrada a clasificadores lineales).
- Deduplicación de documentos o detección de similitud entre textos.
- Soporte para integración en pipelines de RAG (Retrieval-Augmented Generation) como componente de recuperación.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo generativo).

## Casos de uso

- Búsqueda semántica en aplicaciones web o móviles: el modelo puede indexar documentos y responder a consultas en inglés y español, devolviendo pasajes relevantes mediante similitud coseno. Su formato int8 y ONNX permite ejecutarlo en el cliente (navegador o dispositivo móvil) sin servidores dedicados.
- Recuperación de información en dominios específicos (legal, médico, técnico): gracias a su fine-tune, muestra un rendimiento alto en dominios concretos (95.85 en la métrica Domain), lo que lo hace útil para motores de búsqueda verticales.
- Sistemas de atención al cliente: para clasificar consultas entrantes y emparejarlas con respuestas predefinidas o artículos de la base de conocimiento, usando embeddings de baja latencia.
- Deduplicación de contenido: en plataformas de contenido generado por usuarios, para detectar textos duplicados o casi duplicados en inglés y español.
- Análisis de sentimiento o clasificación de textos: los embeddings de 1024 dimensiones pueden alimentar clasificadores ligeros (regresión logística, SVM) para tareas de moderación o análisis de opiniones.
- Sistemas de recomendación basados en contenido: para calcular similitud entre ítems (noticias, productos) a partir de sus descripciones textuales, con soporte bilingüe.

## Benchmarks y rendimiento

La model card proporciona una comparativa con OpenAI `text-embedding-3-small` en varias métricas (Composite, EN retrieval, ES retrieval, STS, Domain). No se especifica la metodología exacta ni los conjuntos de datos utilizados, pero se presentan los siguientes resultados:

| Modelo | Composite | EN retrieval | ES retrieval | STS | Domain |
|---|---|---|---|---|---|
| ALF-emb-micro 1.0 (int8) | 79.99 | 57.25 | 77.80 | 89.07 | 95.85 |
| OpenAI text-embedding-3-small | 80.08 | 59.74 | 79.52 | 88.66 | 92.39 |

Además, se indica una paridad coseno de 0.984 frente a la versión fp32, lo que sugiere una pérdida mínima por la cuantización. No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- Al ser un modelo ONNX int8 de 370M parámetros, el uso de VRAM es muy reducido: aproximadamente 0.4 GB en memoria (el tamaño del repo es 0.4 GB). Puede ejecutarse en CPU sin problemas, con latencias del orden de milisegundos para frases cortas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 o superior) o incluso integradas modernas. No requiere GPUs de alta gama.
- Es apto para despliegue en dispositivos edge (Raspberry Pi, móviles) gracias a su formato int8 y a la compatibilidad con `onnxruntime`.
- Opciones de despliegue: `onnxruntime` (CPU/GPU), `ONNX Runtime Web` para navegador, o integración en servidores con `FastAPI` + `onnxruntime`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Throughput estimado: no disponible en la información proporcionada, pero al ser un encoder pequeño, puede procesar cientos de frases por segundo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento (Composite) |
|---|---|---|---|---|---|
| ALF-emb-micro 1.0 | 370M | 512 | ONNX int8 | MIT | 79.99 |
| OpenAI text-embedding-3-small | no disponible (API) | 8191 (según documentación de OpenAI) | API | Propietaria | 80.08 |
| intfloat/multilingual-e5-large-instruct (base) | 560M | 512 | PyTorch | MIT | no disponible en la información |

El modelo se posiciona como una alternativa ligera y de código abierto frente a la API de OpenAI, con un rendimiento muy cercano en el composite y superior en dominios específicos (Domain: 95.85 vs 92.39). Su principal ventaja es la portabilidad y la ausencia de dependencia de servicios externos.

## Limitaciones y advertencias

- El rendimiento en recuperación en inglés es ligeramente inferior al de OpenAI `text-embedding-3-small` (57.25 vs 59.74), aunque en español y dominios específicos es comparable o superior.
- La longitud máxima de contexto es de 512 tokens, lo que limita su uso con documentos largos; para textos más extensos se requiere truncamiento o chunking.
- El modelo se distribuye en int8, no en fp16/fp32; aunque la paridad coseno es alta (0.984), puede haber pequeñas pérdidas de precisión en casos extremos.
- No es un modelo de instrucciones general: solo está entrenado para tareas de embeddings y no puede generar texto ni seguir instrucciones complejas.
- El tokenizador no es compatible directamente con el de e5; es necesario usar el script `remap.py` y el archivo `keep_ids.npy` proporcionados para mapear los IDs correctamente.
- La licencia MIT permite uso comercial, pero se debe incluir el aviso de licencia del modelo base (`multilingual-e5-large-instruct`) al redistribuir.
- No se han publicado detalles sobre sesgos o alucinaciones (al no ser generativo, el riesgo de alucinación es nulo, pero los embeddings pueden reflejar sesgos del corpus de entrenamiento original).

## Enlaces

- [HuggingFace - AtomicoLabs/ALF-emb-micro](https://huggingface.co/AtomicoLabs/ALF-emb-micro)
- [GitHub Release v1.0](https://github.com/AtomicoLabs/ALF-emb-micro/releases/tag/v1.0)
- [Web de AtomicoLabs](https://www.atomicolabs.com/)
- [Página de investigación de AtomicoLabs](https://www.atomicolabs.com/research)
- [Modelo base: intfloat/multilingual-e5-large-instruct](https://huggingface.co/intfloat/multilingual-e5-large-instruct)

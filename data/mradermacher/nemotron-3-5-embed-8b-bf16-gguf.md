# mradermacher/Nemotron-3.5-Embed-8B-BF16-GGUF

## Resumen

Nemotron-3.5-Embed-8B-BF16-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo de embeddings multimodal Nemotron-3.5-Embed-8B-BF16, desarrollado por NVIDIA. La cuantización ha sido realizada por el usuario mradermacher, conocido en la comunidad de Hugging Face por generar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas derivadas. El modelo base es un modelo de embeddings (feature extraction) de unos 7,95 mil millones de parámetros, capaz de generar embeddings tanto de texto como de imágenes (multimodal-embedding), lo que lo hace especialmente relevante para sistemas de RAG, búsqueda semántica y recuperación de información multilingüe.

La relevancia de esta ficha radica en que permite ejecutar un modelo de embeddings de gran tamaño y naturaleza multimodal en hardware modesto, gracias a las cuantizaciones que van desde los 3,3 GB (Q2_K) hasta los 16 GB (f16). Esto abre la puerta a despliegues locales de búsqueda semántica y RAG sin depender de APIs externas, con soporte para más de 30 idiomas, incluido el castellano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings basado en la familia Nemotron de NVIDIA) |
| Parámetros totales | 7.952.683.008 (~7,95 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16 como suplemento multimodal) |
| Idiomas soportados | Multilingüe: inglés, árabe, bengalí, búlgaro, chino, danés, neerlandés, finés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, malay, maratí, nepalí, noruego, persa, portugués, rumano, ruso, español, suajili, sueco, tamil, telugu, tailandés, ucraniano, urdu, vietnamita, entre otros |
| Licencia | openmdw-1.1 (other, vía https://openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (el modelo base original está en safetensors/transformers) |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo base (tipo de transformer, dimensiones de embedding, mecanismo de fusión texto-imagen) en la información disponible. Lo que sí consta es que se trata de un modelo de embeddings multimodal: genera representaciones vectoriales tanto de texto como de imágenes, como indican las etiquetas `multimodal-embedding`, `image-embeddings` y `text-embeddings`, y el archivo suplementario `mmproj` incluido en el repositorio de cuantizaciones.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación), no hay datos en la información proporcionada. Cabe señalar que los modelos de embeddings suelen entrenarse con objetivos contrastivos sobre pares de texto-texto o texto-imagen, y posteriormente afinarse para recuperación, pero esta ficha no puede afirmar detalles concretos al respecto. La contribución de mradermacher se limita a la cuantización estática de los pesos originales en BF16 a distintos niveles de precisión GGUF, sin alterar la arquitectura ni los pesos lógicos del modelo.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, clustering y clasificación.
- Generación de embeddings de imágenes (multimodal-embedding), lo que permite búsqueda cruzada texto-imagen y recuperación multimodal.
- Recuperación de información (retrieval) y construcción de sistemas RAG, según las etiquetas oficiales del repositorio.
- Soporte multilingüe amplio: más de 30 idiomas, incluidos español, inglés, chino, japonés, árabe, hindi y ruso.
- Compatible con vLLM según las etiquetas del modelo, además del ecosistema GGUF (llama.cpp, Ollama y derivados).
- No es un modelo generativo: no produce texto conversacional, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica multilingüe: indexar corpora en español y otros idiomas y permitir consultas en cualquiera de los idiomas soportados, aprovechando el espacio de embeddings compartido entre lenguas.
- RAG local y privado: usar el modelo como componente de embeddings en un pipeline RAG desplegado on-premise, sin enviar datos a APIs externas, con la cuantización Q4_K_M (5 GB) cabe en una GPU de consumo.
- Búsqueda multimodal texto-imagen: dado que genera embeddings de imagen (mmproj), se puede construir un buscador que recupere imágenes a partir de consultas en lenguaje natural o viceversa.
- Deduplicación y clustering de documentos: agrupar grandes volúmenes de documentos por similitud semántica usando los embeddings como características.
- Clasificación y enrutado de tickets: entrenar clasificadores ligeros (regresión logística, kNN) sobre los embeddings para enrutar incidencias de soporte por temática o idioma.
- Detección de near-duplicates y plagio: comparar similitud coseno entre documentos para identificar contenido duplicado o muy similar en repositorios grandes.
- Recomendación de contenido: calcular similitudes entre descripciones de productos o artículos para sistemas de recomendación basados en contenido.
- Indexación de bases de conocimiento empresariales: combinar con bases vectoriales como Qdrant, Milvus o pgvector para búsqueda empresarial sobre documentación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para evaluar el rendimiento del modelo base en tareas como MTEB o retrieval multilingüe, conviene consultar la model card original de NVIDIA y los rankings de MTEB.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización (tamaño del archivo GGUF):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - IQ4_XS: ~4,5 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,6 GB
  - Q8_0: ~8,6 GB
  - f16: ~16 GB
  - Suplemento multimodal mmproj: 0,6 GB (Q8_0) o 1,0 GB (f16) adicionales
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) ejecuta cómodamente las cuantizaciones Q4/Q5; para f16 conviene una RTX 4090 (24 GB) o una A100.
- Cabe en consumer GPU: sí, desde ~4 GB de VRAM con Q2_K/Q3_K, y con holgura en GPUs de 8 GB usando Q4_K_M o Q5_K_M. También es ejecutable en CPU pura gracias a llama.cpp, con mayor latencia.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base también es compatible con vLLM según las etiquetas del repositorio.
- Latencia y throughput: no disponible; al tratarse de un modelo de embeddings, el throughput en tokens por segundo es menos relevante que el número de embeddings por segundo, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Multimodal (imagen) | Cuantización GGUF | Licencia |
|---|---|---|---|---|
| Nemotron-3.5-Embed-8B (esta ficha) | ~7,95 B | Sí | Q2_K a f16 | openmdw-1.1 |
| BGE-M3 (BAAI) | ~0,57 B | No | Sí (GGUF disponible en la comunidad) | MIT |
| GTE-Qwen2-7B-instruct (Alibaba) | ~7,6 B | No | Sí (GGUF disponible en la comunidad) | Apache 2.0 |
| Multilingual-E5-large (Microsoft) | ~0,56 B | No | Sí (GGUF disponible en la comunidad) | MIT |

Nota: los datos de rendimiento comparativo no están disponibles en la información proporcionada; la tabla se limita a parámetros, capacidades y licencia. Nemotron-3.5-Embed-8B destaca por su carácter multimodal (embeddings de imagen), algo que las alternativas listadas no ofrecen, aunque a costa de un tamaño notablemente mayor que BGE-M3 o E5-large.

## Limitaciones y advertencias

- No es un modelo generativo: no sirve para chat, generación de código ni razonamiento; su única función es producir embeddings.
- La calidad de los embeddings se degrada en cuantizaciones agresivas (Q2_K, Q3_K); para aplicaciones de recuperación críticas se recomienda Q6_K o superior, o los quants con imatrix disponibles en el repositorio hermano (`-i1-GGUF`).
- Los detalles de la licencia openmdw-1.1 deben revisarse en el enlace oficial antes de un uso comercial; al ser una licencia de tipo "other", no es una licencia permisiva estándar como Apache 2.0 o MIT.
- No hay benchmarks públicos en la ficha de la cuantización; el rendimiento real en MTEB o en retrieval multilingüe debe verificarse contra la documentación de NVIDIA.
- Riesgo de sesgos: como todo modelo de embeddings entrenado a gran escala, puede reflejar sesgos presentes en los datos de entrenamiento, afectando a tareas de similitud y clustering en temas sensibles.
- Longitud de contexto máxima no especificada: textos muy largos pueden requerir segmentación (chunking) antes de generar embeddings.
- El suplemento multimodal (mmproj) es necesario para las capacidades de imagen; sin él, el modelo funciona solo con texto.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-GGUF
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Nemotron-3.5-Embed-8B-BF16-i1-GGUF
- Página de descarga con vista general: https://hf.tst.eu/model#Nemotron-3.5-Embed-8B-BF16-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

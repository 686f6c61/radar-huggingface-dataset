# AutomatosX/AX-EmbeddingGemma-2-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-EmbeddingGemma-2-CUDA-AXQ-NVFP4-W4A16 es un paquete de cuantizacion publicado por AutomatosX sobre el modelo de embeddings `google/embeddinggemma-2` (commit `914f7f89142e33e77833254d9c9b90c3cef7303b`). No es un modelo entrenado desde cero, sino una conversion de pesos destinada a ejecucion en CUDA con el formato NVFP4 de NVIDIA: las capas de atencion y MLP del codificador de lenguaje se almacenan en FP4 de 4 bits con escalas de bloque E4M3, mientras que el resto del grafo permanece en BF16. El checkpoint tiene 744.371.512 parametros y ocupa 1,4 GB en el repositorio.

El modelo base, EmbeddingGemma 2, es un codificador compacto de menos de 1.000 millones de parametros distribuido bajo licencia Apache 2.0 que proyecta texto, codigo, imagenes, video y audio a un espacio vectorial unificado de 768 dimensiones, segun la documentacion de Google DeepMind. Este pack conserva esa naturaleza multimodal y devuelve embeddings de 768 dimensiones con soporte Matryoshka para anchuras truncadas de 512, 256 y 128.

Su relevancia es acotada y muy especifica: se trata de un artefacto de desarrollo orientado a medir el coste y la viabilidad de servir modelos de embeddings multimodales en precision reducida sobre hardware Blackwell. La propia model card advierte de que no es un resultado de recuperacion certificado, no reclama compatibilidad con vLLM ni puntuaciones MTEB, y a fecha de la ficha acumula 0 descargas y 0 valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador de embeddings, familia `embedding_gemma2`; pesos serializados en formato `compressed-tensors` |
| Parametros totales | 744.371.512 (~744 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (AXQuant CUDA): pesos de atencion y MLP en FP4 de 4 bits, bloques de 16 con escalas de bloque E4M3; vision, audio, embeddings, normalizaciones y proyeccion de 512 a 768 permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `quantization_config` en formato compressed-tensors) |

Notas adicionales de precision, segun la model card: no existe cuantizacion de activaciones de entrada, el dtype de activacion registrado es BF16 y el modelo no debe convertirse a float16.

## Arquitectura y entrenamiento

No hay informacion sobre entrenamiento en la documentacion disponible, porque este repositorio no contiene un modelo entrenado sino una conversion de pesos del checkpoint `google/embeddinggemma-2`. La model card se limita a describir el proceso de cuantizacion: las matrices de pesos de las capas de atencion y de las capas MLP del stack de lenguaje se almacenan en NVFP4 con granularidad de bloque 16 y escalas en formato E4M3, mientras que los modulos de vision, audio, la capa de embeddings, las normalizaciones y la proyeccion de 512 a 768 dimensiones se mantienen en BF16 para preservar la calidad de representacion. El resultado se etiqueta como W4A16 porque los pesos se cuantizan a 4 bits pero las activaciones se mantienen en 16 bits.

En cuanto al modelo de origen, las fuentes de Google describen EmbeddingGemma 2 como un modelo multimodal nativo de menos de 1.000 millones de parametros, construido sobre la familia Gemma, que mapea combinaciones de texto, imagenes, audio y video a un unico espacio de embedding de 768 dimensiones. El checkpoint derivado mantiene ese espacio y anade soporte Matryoshka: se pueden truncar los vectores a 512, 256 o 128 dimensiones y volver a normalizarlos, lo que permite ajustar el coste de almacenamiento y de similitud coseno en funcion del caso de uso. Los prefijos de tarea que espera el modelo estan definidos en el archivo `config_sentence_transformers.json` del repositorio. No se documenta en el material disponible ningun detalle sobre el corpus de entrenamiento, el numero de tokens vistos ni sobre fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones para recuperacion semantica, similitud y agrupamiento.
- Soporte de dimensiones Matryoshka: 768, 512, 256 y 128, con renornalizacion obligatoria tras el truncado.
- Naturaleza multimodal heredada del modelo base: proyeccion de texto, codigo, imagenes, audio y video a un espacio vectorial comun.
- Prefijos de tarea para adaptar el comportamiento del codificador segun el uso (consulta, documento, clasificacion u otros), segun `config_sentence_transformers.json`.
- Compatibilidad declarada con `transformers` y con el pipeline `feature-extraction`, ademas de la etiqueta `endpoints_compatible`.
- Ejecucion acelerada en CUDA sobre hardware con soporte NVFP4, manteniendo los modulos no cuantizados en BF16.

No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso ni modos de pensamiento, dado que se trata de un modelo exclusivamente de embeddings y no de un modelo generativo conversacional.

## Casos de uso

- Recuperacion aumentada en produccion (RAG): el modelo permite indexar documentos multimodales (texto, capturas, fragmentos de audio) y consultarlos con vectores de 768 dimensiones; es adecuado para pipelines donde interesa reducir el coste de memoria del indexador aprovechando la cuantizacion W4A16.
- Busqueda semantica sobre corpus de codigo: al proyectar codigo y lenguaje natural al mismo espacio, se puede construir un buscador interno de fragmentos de repositorio a partir de descripciones en lenguaje natural.
- Deduplicacion y agrupamiento de documentos a gran escala: el uso de anchuras Matryoshka de 128 o 256 dimensiones reduce el coste de las comparaciones por similitud coseno en fases de cribado previo, reservando las 768 dimensiones para el re-ranking.
- Moderacion y clasificacion de contenido: los embeddings sirven como caracteristica de entrada para clasificadores ligeros que detectan contenido duplicado o categorias tematicas sin necesidad de un modelo generativo.
- Busqueda multimodal en catalogos de producto: permite consultar por imagen o por texto contra un mismo indice vectorial, util en comercio electronico y en bibliotecas de activos digitales.
- Sistemas de recomendacion basados en contenido: la representacion comun de texto, imagen y audio facilita la construccion de un espacio de similitud unico para recomendar elementos heterogeneos.
- Evaluacion de infraestructura de cuantizacion: dado su caracter de checkpoint de desarrollo, es util para medir la degradacion de calidad y el ahorro de memoria al pasar de BF16 a NVFP4 W4A16 en una carga de trabajo de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no reclama una carga en vLLM ni una puntuacion MTEB, y que no constituye un resultado de recuperacion certificado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,4 GB. Parte de los tensores estan en NVFP4 (aproximadamente 0,5 bytes por parametro efectivo con escalas) y el resto en BF16, por lo que la inferencia encaja holgadamente en cualquier GPU con 4 GB o mas de memoria, dejando margen para el cache de activaciones y las escalas.
- Aceleracion nativa de NVFP4: requiere hardware NVIDIA Blackwell (familia RTX 50, B200, GB200, RTX PRO 6000 Blackwell). En GPUs Ampere, Ada o anteriores el formato puede descomprimirse por software, pero sin la aceleracion de tensor cores de FP4.
- GPU consumer: si, cabe en cualquier GPU de consumo con 8 GB o mas, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores. La aceleracion nativa de la cuantizacion, en cambio, solo se aprovecha en la generacion RTX 50.
- GPU de datacenter: A100, H100 y H200 ejecutan el modelo sin problema de memoria, pero sin aceleracion nativa NVFP4 al no ser arquitectura Blackwell.
- Opciones de despliegue: el repositorio declara `transformers` con la libreria `compressed-tensors`. La model card no reclama compatibilidad con vLLM, por lo que cualquier integracion en vLLM, TGI, llama.cpp u Ollama debe validarse por cuenta propia antes de usarla en produccion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones de embedding | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AX-EmbeddingGemma-2-CUDA-AXQ-NVFP4-W4A16 (AutomatosX) | 744 M | 768 (Matryoshka 768/512/256/128) | no disponible | NVFP4 W4A16 | Apache 2.0 | HuggingFace, 0 descargas |
| google/embeddinggemma-2 (modelo base) | menos de 1.000 M | 768 | no disponible | BF16 nativo | Apache 2.0 | HuggingFace |
| Checkpoints AXQuant W4A4 calibrados (mismo autor) | no disponible | 768 | no disponible | W4A4 | no disponible | Coleccion NVFP4 de AutomatosX |
| Versiones MLX del mismo autor | no disponible | 768 | no disponible | no disponible | no disponible | Coleccion MLX de AutomatosX |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento (MTEB u otros) frente a otras familias de embeddings abiertas como Qwen3-Embedding, BGE-M3 o multilingual-e5, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La model card califica el artefacto como checkpoint de desarrollo y afirma explicitamente que no es un resultado de recuperacion certificado.
- No se reclama compatibilidad con vLLM; la unica integracion declarada es `transformers` con `compressed-tensors`.
- No se publican puntuaciones MTEB ni ninguna otra metrica de calidad, de modo que no es posible cuantificar la degradacion introducida por la cuantizacion NVFP4 frente al modelo base en BF16.
- Prohibido convertir el modelo a float16: la model card lo advierte de forma explicita. El dtype de activacion registrado es BF16 y las partes no cuantizadas deben permanecer en ese formato.
- Riesgo de alucinacion y sesgos: al ser un modelo de embeddings no genera texto, pero puede heredar los sesgos del corpus de entrenamiento del modelo base, que no se documenta en la informacion disponible. No se han publicado evaluaciones de sesgo para este checkpoint.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue sin verificacion previa.
- Longitud de contexto: no disponible. Un truncado inadecuado de las entradas afectara a la calidad de los embeddings sin aviso explicito.
- Si se aplica truncado Matryoshka, es obligatorio renornalizar los vectores resultantes; omitir este paso sesga las puntuaciones de similitud coseno.
- Dependencia de hardware: la aceleracion nativa del formato NVFP4 solo esta disponible en GPUs Blackwell, lo que limita el ahorro real de coste en parques con A100, H100 o RTX 40.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo de Google conviene revisar los terminos aplicables al modelo base y citar correctamente la procedencia.
- Ausencia total de adopcion (0 descargas, 0 valoraciones) y fecha de publicacion muy reciente: no existe validacion externa de su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-EmbeddingGemma-2-CUDA-AXQ-NVFP4-W4A16
- Coleccion NVFP4 de AutomatosX: https://huggingface.co/collections/AutomatosX/nvfp4
- Coleccion MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/mlx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Guia para desarrolladores de EmbeddingGemma 2 (Google Developers Blog): https://developers.googleblog.com/embeddinggemma-2-the-developer-guide/
- Pagina de EmbeddingGemma en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Anuncio de EmbeddingGemma 2 en el blog de Google DeepMind: https://deepmind.google/blog/embeddinggemma-2-an-open-lightweight-multimodal-embedding-model/

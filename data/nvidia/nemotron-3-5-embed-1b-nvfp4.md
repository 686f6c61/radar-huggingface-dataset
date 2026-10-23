# nvidia/Nemotron-3.5-Embed-1B-NVFP4

## Resumen

Nemotron-3.5-Embed-1B-NVFP4 es la variante cuantizada en NVFP4 del modelo de embeddings multimodales Nemotron-3.5-Embed-1B-BF16, desarrollado por NVIDIA. No es un modelo generativo: convierte una entrada (texto, imagen o combinación de ambas) en un vector denso de 2048 dimensiones, pensado para recuperación de documentos (retrieval) en pipelines de RAG y búsqueda semántica. Su particularidad es que indexa páginas de documento como imagen, lo que permite recuperar PDF escaneados con tablas, gráficos e infografías sin depender de un OCR previo.

El modelo parte de un transformer de 1.554.710.528 parámetros (~1,55 B) que combina un codificador visual destilado de Ministral-3-8B-Instruct-2512-BF16 con un modelo de lenguaje inicializado desde nvidia/Nemotron-3-Embed-1B-BF16, y que a su vez fue destilado de un profesor Nemotron-3.5-Embed-8B-BF16. La cuantización se aplicó con NVIDIA Model Optimizer (nvidia-modelopt v0.47.0) sobre pesos y activaciones de las capas lineales, acompañada de destilación consciente de cuantización (QAD) para recuperar precisión en secuencias de entrada largas.

Es relevante ahora porque reduce el coste de servir un retriever multimodal a un checkpoint de 1,3 GB y ~3,9 bits efectivos por peso, manteniendo (según el autor) el mismo espacio de embeddings que la versión BF16, por lo que ambos pueden intercambiarse en un índice existente. La licencia OpenMDW-1.1 permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual destilado + modelo de lenguaje) para embeddings |
| Parámetros totales | 1.554.710.528 (~1,55 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 (la model card lo expresa como «pixels»; no se aclara la unidad exacta) |
| Tipos de cuantización | NVFP4 en pesos y activaciones de capas lineales (checkpoint BF16 disponible en el modelo base) |
| Idiomas soportados | Multilingüe: 34 idiomas evaluados en texto y 18 en imagen |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors en formato compressed-tensors (NVFP4) |
| Dimensión del embedding | 2048 (average pooling sobre representaciones a nivel de token) |
| Entrada | Texto (consulta y documento), imagen RGB (documento) o imagen + texto (documento) |
| Resolución de imagen | longest_edge por defecto 1120 px, ampliable hasta 1540 px |
| Librería declarada | vLLM |
| Pipeline | visual-document-retrieval |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con dos componentes: un codificador visual destilado de Ministral-3-8B-Instruct-2512-BF16 y un modelo de lenguaje inicializado desde nvidia/Nemotron-3-Embed-1B-BF16. El modelo completo es a su vez un destilado del profesor Nemotron-3.5-Embed-8B-BF16, afinado para recuperación de preguntas y respuestas sobre documentos. El embedding final se obtiene aplicando average pooling sobre las representaciones a nivel de token del transformer, produciendo un único vector de 2048 dimensiones por entrada. Las consultas solo se aceptan en texto; los documentos pueden indexarse como imagen, texto o imagen + texto.

La cuantización es de tipo post-entrenamiento: NVFP4 aplicado únicamente a pesos y activaciones de las capas lineales, tanto en el modelo de lenguaje como en el codificador visual, mediante nvidia-modelopt v0.47.0. Sobre esa base se aplicó destilación consciente de cuantización (QAD), dirigida principalmente a recuperar precisión en secuencias de entrada largas, que es donde la cuantización agresiva suele penalizar más. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; al ser un modelo de embeddings, esos detalles no se detallan.

## Capacidades

- Generación de embeddings densos de 2048 dimensiones para texto, imagen y pares imagen + texto.
- Recuperación de documentos visuales: páginas con texto, tablas, gráficos e infografías, sin OCR intermedio.
- Búsqueda semántica multilingüe en texto, evaluada en 34 idiomas (incluidos español, inglés, chino, árabe, hindi, japonés, coreano, portugués, ruso, francés, alemán, entre otros).
- Recuperación de imágenes evaluada en 18 idiomas (entre ellos español, inglés, chino, árabe, hindi, japonés, coreano, ruso, francés, alemán).
- Soporte de entradas híbridas imagen + texto para indexar documentos donde el contexto textual y visual son necesarios conjuntamente.
- Interoperabilidad de espacio de embeddings con Nemotron-3.5-Embed-1B-BF16, lo que permite mezclar indexación y consulta entre ambas variantes.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso por sí mismo: es un componente de recuperación dentro de pipelines de agentes o RAG.
- No se documentan capacidades de audio, vídeo ni thinking mode.

## Casos de uso

- RAG sobre corpus de PDF escaneados: indexar cada página como imagen permite recuperar tablas financieras, gráficos y formularios que un pipeline basado solo en texto perdería por completo; el modelo devuelve el vector de página que se compara contra la consulta en texto.
- Búsqueda semántica multilingüe en bases de conocimiento corporativas: con 34 idiomas evaluados en texto, una consulta en español puede recuperar documentos en inglés, francés o japonés dentro del mismo índice, sin traducción previa.
- Recuperación de documentación técnica con diagramas: manuales de producto, esquemas eléctricos o fichas de especificaciones se indexan como imagen + texto, de modo que la consulta recupera la página donde aparece el diagrama relevante.
- Revisión documental en banca y seguros: indexación de pólizas, escrituras y extractos escaneados para localizar cláusulas o importes concretos a partir de consultas en lenguaje natural, aprovechando la ventana de 32.768 para páginas densas.
- Deduplicación y clustering de grandes volúmenes documentales: al generar un vector de 2048 dimensiones por página, se pueden calcular similitudes coseno para agrupar versiones duplicadas o detectar documentos casi idénticos en archivos históricos.
- Base de conocimiento para atención al cliente: el retriever alimenta un LLM generativo con los fragmentos correctos; su tamaño de 1,3 GB permite desplegarlo en la misma GPU que el generador o en un nodo dedicado de bajo coste.
- Enriquecimiento de motores de búsqueda internos: sustituir la búsqueda por palabras clave por búsqueda vectorial sobre catálogos de producto con imágenes y descripciones, manteniendo latencia baja gracias a la cuantización NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint NVFP4 no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de recuperación (nDCG, Recall@k) para esta variante cuantizada, y solo remite al blog de NVIDIA y a la ficha del modelo BF16 para más detalles. No se deben extrapolar cifras de la variante BF16 sin verificarlas en la documentación original.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir del tamaño del checkpoint, no dato oficial): en torno a 1,3 GB de pesos NVFP4 según el tamaño del repositorio; con overhead de activaciones y caché para secuencias largas, un despliegue realista se sitúa en el rango de 3-6 GB de VRAM.
- Variante BF16 de referencia: ~3,1 GB solo en pesos, con un rango práctico estimado de 6-10 GB de VRAM según longitud de secuencia y tamaño de batch.
- GPU recomendadas: el soporte nativo de NVFP4 corresponde a la generación Blackwell (B200/GB200, RTX PRO 6000 Blackwell Server Edition y GPUs GeForce RTX 50). En generaciones anteriores (Hopper, Ada) la ejecución requiere decuantización o emulación y el rendimiento no es representativo de la cuantización.
- Cabe en GPU de consumo: sí, la variante NVFP4 es apta para GPUs consumer con soporte Blackwell; la variante BF16 cabe en tarjetas de 12-16 GB (RTX 4090, RTX 4080, RTX 4060 Ti 16 GB) con batches moderados.
- Opciones de despliegue: vLLM es la librería declarada por el autor; NVIDIA NIM (NeMo Retriever Embedding) documenta el despliegue del modelo BF16 de la familia sobre GB200, B300 y RTX PRO 6000 Blackwell. El soporte en llama.cpp, Ollama o TGI no está confirmado en la información disponible, y el formato compressed-tensors NVFP4 no es estándar en esos motores.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de páginas por segundo para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-NVFP4 | 1,55 B | 32.768 | NVFP4 (compressed-tensors) | OpenMDW-1.1 | HuggingFace, vLLM, NIM |
| Nemotron-3.5-Embed-1B-BF16 | 1,55 B (mismo espacio de embeddings) | 32.768 | BF16 | OpenMDW-1.1 | HuggingFace, NIM |
| Nemotron-3.5-Embed-8B-BF16 | 8 B (profesor del destilado) | no disponible | BF16 | OpenMDW-1.1 | HuggingFace |
| Nemotron-3-Embed-1B-BF16 | 1 B (inicialización del LM) | no disponible | BF16 | no disponible | HuggingFace |

La comparación relevante es interna a la familia: el 1B-NVFP4 ocupa aproximadamente un tercio del espacio del 1B-BF16 y comparte espacio de embeddings con él, mientras que el 8B actúa como profesor y ofrece mayor capacidad a costa de más VRAM. No se dispone de métricas de recuperación publicadas para establecer una comparación cuantitativa entre las tres variantes.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso. Usarlo como generador o agente es un error de uso.
- Las consultas solo admiten texto; no se puede buscar «por imagen» como consulta, solo indexar imágenes como documento.
- La cuantización NVFP4 introduce pérdida de precisión. El autor aplicó QAD precisamente para recuperarla en secuencias largas, lo que sugiere que la degradación es mayor en entradas extensas; conviene validar la calidad de recuperación sobre una muestra representativa antes de sustituir el checkpoint BF16 en un índice en producción.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluaciones de robustez. Al ser un retriever, el riesgo se traslada al pipeline: recuperaciones irrelevantes o sesgadas acaban condicionando la respuesta del LLM que las consume.
- Cobertura lingüística desigual: 34 idiomas en texto y solo 18 en imagen. Los idiomas fuera de esas listas pueden funcionar, pero no han sido evaluados.
- Licencia OpenMDW-1.1: permite uso comercial, pero es un acuerdo con términos propios que deben revisarse antes de redistribuir el modelo o integrarlo en un producto; no es Apache 2.0.
- El soporte de NVFP4 depende de hardware Blackwell. Desplegar en GPUs anteriores obliga a decuantizar, lo que anula la ventaja de tamaño y puede degradar el rendimiento.
- El límite de contexto se expresa en la model card como «32.768 pixels», unidad ambigua; conviene verificar empíricamente el comportamiento con documentos de muchas páginas o imágenes de alta resolución (hasta 1540 px de lado mayor).

## Enlaces

- Modelo en HuggingFace (NVFP4): https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Variante 8B BF16: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Modelo de inicialización del LM: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Blog de NVIDIA sobre la familia Nemotron Retriever: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Documentación de NVIDIA NIM para NeMo Retriever Embedding: https://docs.nvidia.com/nim/nemo-retriever/embedding/2.4/getting-started.html
- Modelo base Ministral-3-3B-Instruct-2512-BF16: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Modelo base Ministral-3-8B-Instruct-2512-BF16: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Licencia Apache 2.0 (modelos Ministral): https://www.apache.org/licenses/LICENSE-2.0.txt

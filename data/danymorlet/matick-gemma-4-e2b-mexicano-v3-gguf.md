# danymorlet/Matick-Gemma-4-E2B-Mexicano-v3-GGUF

## Resumen

Matick Gemma 4 E2B Mexicano v3 (GGUF) es una conversión a formato GGUF del modelo Gemma 4 E2B de Google DeepMind, publicada por el usuario danymorlet (Morlet) bajo licencia Apache 2.0. Se distribuye junto a un proyector visual en BF16 que habilita el procesamiento de imágenes, y el repositorio incluye además una copia cuantizada en Q8_0 del modelo oficial EmbeddingGemma 2 de Google con su propio proyector multimodal, pensada para tareas de recuperación semántica local.

El modelo se presenta como una variante orientada al español de México, aunque la model card reconoce explícitamente que no se documenta la receta de fine-tuning, el dataset empleado ni evaluaciones comparativas que cuantifiquen dicha adaptación. La arquitectura declarada es `gemma4`, con un tamaño total de pesos de 4.6B según los metadatos GGUF y aproximadamente 2.3B de parámetros efectivos, una ventana de contexto declarada de 131.072 tokens y capacidades multimodales de texto e imagen.

Su relevancia práctica reside en empaquetar en un único repositorio un stack local completo: un modelo conversacional multimodal cuantizado en Q4_K_M (3,18 GiB) más un modelo de embeddings (0,29 GiB) y sus respectivos proyectores, todo ejecutable en LM Studio y otros runtimes compatibles con llama.cpp. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los pesos declarados en safetensors suman 271.002.648 parámetros, un dato que no concuerda con los 4.6B indicados en los metadatos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer multimodal con encoder visual tipo CLIP) |
| Parametros totales | 4,6B declarados en metadatos GGUF; 271.002.648 en safetensors (dato inconsistente, ver limitaciones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 131.072 tokens declarados en el GGUF |
| Tipos de cuantizacion | Q4_K_M (chat) y Q8_0 (embeddings); proyector visual en BF16 y Q8_0 |
| Idiomas soportados | es (español, con orientación declarada a español de México) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (v3) + proyectores mmproj GGUF; sin safetensors ni código de entrenamiento |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `gemma4` de Google DeepMind, una familia de transformers multimodales que en la variante E2B apuesta por un diseño eficiente con aproximadamente 2,3B de parámetros efectivos. Incorpora un encoder visual de arquitectura `clip` empaquetado como proyector separado (`mmproj`), con 476M de parámetros declarados en BF16, lo que permite entrada de imágenes junto al texto. La familia Gemma 4 incluye soporte nativo para el rol `system`, razonamiento configurable y llamadas a herramientas, si bien la disponibilidad efectiva de cada función depende de la conversión concreta y del runtime utilizado.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. Respecto a la adaptación al español mexicano que da nombre a la variante, la model card indica explícitamente que no se identifica el dataset, la receta de fine-tuning ni los cambios exactos frente al checkpoint original, y que no se aportan evaluaciones comparativas ni mejoras cuantificadas. La cuantización Q4_K_M fue realizada, según los metadatos internos, con Unsloth. El componente de embeddings (EmbeddingGemma 2) es el modelo oficial de Google sin fine-tuning, con entradas de hasta 8.192 tokens y salidas de 128 a 768 dimensiones mediante Matryoshka Representation Learning.

## Capacidades

- Generación de texto conversacional multi-turno con contexto declarado de hasta 131.072 tokens.
- Procesamiento de imágenes mediante el proyector visual BF16 incluido (pipeline `image-text-to-text`).
- Soporte declarado de llamadas a herramientas (tool calling) y rol `system` nativo, sujeto al runtime.
- Razonamiento configurable según las capacidades de la familia Gemma 4.
- Generación de embeddings multimodales mediante EmbeddingGemma 2 (texto, imagen, audio y vídeo en un espacio vectorial compartido según la documentación de Google), con salidas Matryoshka de 128 a 768 dimensiones.
- Recuperación semántica local combinando embeddings densos con búsqueda BM25.
- Capacidades multilingües limitadas al español según los metadatos del repositorio.
- No incluye proyector de audio, por lo que no se garantiza entrada de audio en esta versión.

## Casos de uso

- Asistente conversacional local en español: el modelo puede mantener diálogos multi-turno con hasta 131.072 tokens de contexto declarado, adecuado para sesiones largas de atención al usuario en escritorio con LM Studio.
- Análisis de documentos con imágenes: gracias al proyector visual, permite extraer y comentar información de capturas, formularios escaneados o gráficos combinándolos con texto en la misma ventana de contexto.
- Recuperación aumentada (RAG) totalmente local: la pareja EmbeddingGemma 2 genera vectores de consultas y documentos, y Gemma 4 E2B redacta la respuesta usando el contexto recuperado, sin dependencias de API externas.
- Búsqueda semántica en bases documentales en español mexicano: el modelo de embeddings con salidas de 128 a 768 dimensiones permite indexar corpus y recuperar fragmentos relevantes con un coste de almacenamiento ajustable.
- Prototipado de agentes con tool calling: la arquitectura Gemma 4 declara soporte de llamadas a herramientas y rol `system`, lo que facilita construir flujos de varios pasos en entornos de desarrollo con llama.cpp.
- Despliegue en equipos de gama media: el GGUF Q4_K_M de 3,18 GiB más el proyector de 0,34 GiB caben en GPUs de consumo con 8 GB de VRAM, lo que permite entornos de demostración y pruebas sin infraestructura dedicada.
- Memoria a largo plazo en asistentes personales: la combinación de embeddings para almacenar recuerdos y el modelo conversacional para recuperarlos y responder es un patrón directamente soportado por el stack publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones comparativas, métricas de calidad ni cifras de latencia o throughput para esta conversión.

## Requisitos de hardware

- VRAM estimada para el chat: aproximadamente 3,5-4 GB con Q4_K_M (3,18 GiB de pesos más overhead de contexto y caché KV); el proyector visual añade unos 0,34 GiB.
- VRAM estimada para embeddings: aproximadamente 0,3-0,8 GB con Q8_0 (0,29 GiB de pesos más 0,52 GiB del proyector si se usa la variante multimodal).
- Cabe en GPUs de consumo con 8 GB o más, como RTX 3060 Ti, RTX 4060, RTX 4070 o superiores; también en GPUs integradas con suficiente memoria compartida, a costa de menor velocidad.
- GPUs profesionales recomendadas para mayor throughput: A100, H100 o L40S, aunque el tamaño del modelo no las requiere.
- Opciones de despliegue: LM Studio (soporte explícito en la model card), llama.cpp y cualquier runtime compatible con GGUF; no se documenta compatibilidad con vLLM o TGI para estos archivos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Matick Gemma 4 E2B Mexicano v3 (GGUF) | 4,6B declarados (2,3B efectivos) | 131.072 tokens | Texto e imagen | Apache 2.0 | Hugging Face (GGUF) |
| google/gemma-4-E2B | 2,3B efectivos | 131.072 tokens (declarado en la familia) | Texto e imagen | Licencia Gemma (no confirmada en la información) | Hugging Face |
| Qwen2.5-VL-3B | 3B | 32.768 tokens (referencia habitual de la familia) | Texto e imagen | Apache 2.0 (variantes) | Hugging Face |
| Llama 3.2 3B Instruct | 3B | 128.000 tokens | Solo texto | Licencia Llama | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, modalidad y licencia. Los datos de los modelos alternativos son de referencia general y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parámetros: los safetensors declaran 271.002.648 parámetros mientras que los metadatos GGUF indican 4,6B; conviene verificar el tamaño real antes de dimensionar el hardware.
- La adaptación al español mexicano no está documentada: no se publica dataset, receta de fine-tuning ni evaluación que demuestre una mejora sobre el checkpoint original de Google.
- La cuantización Q4_K_M puede degradar la fidelidad respecto a los pesos sin cuantizar, especialmente en tareas de razonamiento y en contextos largos.
- Riesgo de alucinación inherente a los modelos de 2-3B de parámetros efectivos, mayor en dominios especializados y en preguntas factuales.
- El contexto real está limitado por la memoria disponible y la configuración del runtime; los 131.072 tokens declarados no son alcanzables en GPUs de consumo.
- No es un producto oficial de Google ni cuenta con su respaldo; la licencia Apache 2.0 aplicada por el autor debe contrastarse con los términos del modelo base original.
- No incluye proyector de audio, por lo que no se debe asumir entrada de audio aunque EmbeddingGemma 2 la soporte en su versión oficial.
- El repositorio presenta 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Los archivos de EmbeddingGemma 2 incluidos son copias cuantizadas del modelo oficial, no una versión entrenada por el autor; su uso comercial se rige por la licencia del modelo original de Google.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danymorlet/Matick-Gemma-4-E2B-Mexicano-v3-GGUF
- Modelo base conversacional: https://huggingface.co/google/gemma-4-E2B
- Modelo base de embeddings: https://huggingface.co/google/embeddinggemma-2
- LM Studio: https://lmstudio.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth

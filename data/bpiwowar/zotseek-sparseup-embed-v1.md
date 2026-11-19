# bpiwowar/zotseek-sparseup-embed-v1

## Resumen

zotseek-sparseup-embed-v1 es una exportación a ONNX del modelo de recuperación dispersa (sparse retrieval) Linkup-Platform/linkup-sparseup-embed-v1, empaquetada específicamente para su uso en ZotSeek, una herramienta de recuperación de información aprendida. El autor de la exportación es bpiwowar y el modelo original pertenece a Linkup Platform. No se trata de un modelo generativo, sino de un codificador de embeddings que produce vectores dispersos de 50.370 dimensiones para búsqueda léxica-semántica.

El modelo resuelve el problema de la recuperación de documentos mediante representaciones dispersas aprendidas (SPLADE), un enfoque intermedio entre BM25 y los embeddings densos: mantiene la interpretabilidad y eficiencia de la búsqueda invertida tradicional, pero incorpora expansión semántica de términos aprendida. La exportación fusiona la cabeza SPLADE dentro del grafo ONNX, aplica cuantización int8 solo a pesos y utiliza atención por bandas en las capas de ventana deslizante.

Es relevante para desarrolladores que necesiten desplegar búsqueda semántica eficiente en entornos con recursos limitados o en el navegador (onnxruntime-web), ya que el repositorio ocupa solo 0,2 GB y el grafo devuelve vectores dispersos directamente, sin necesidad de post-procesado externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza SPLADE (sparse retrieval), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante con atención por bandas, entradas rellenadas a múltiplo de 64 tokens) |
| Tipos de cuantizacion | int8 solo en pesos (MatMulNBits) con activaciones fp32; embeddings fp16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafo con entradas `input_ids`, `attention_mask`, `pooling_mask`, `k`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con una cabeza SPLADE que genera representaciones dispersas mediante la transformación log(1 + relu(logits - 15)), aplica un tope top-k por posición (con `k` como entrada en tiempo de ejecución), toma el máximo sobre las posiciones agrupadas (pooled) y realiza plegado de vocabulario por mayúsculas/espacios. La exportación ONNX fusiona toda esta lógica dentro del grafo, de modo que la salida es directamente un vector disperso float32 de forma `[B, 50370]`.

La exportación introduce dos modificaciones técnicas destacables: atención por bandas en las capas de ventana deslizante (exactamente equivalente a la atención local del original) y cuantización int8 solo de pesos con embeddings en fp16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de la exportación no los detalla y no se ha proporcionado la del modelo original.

## Capacidades

- Generación de embeddings dispersos para recuperación de información (retrieval) con vocabulario de 50.370 dimensiones.
- Búsqueda léxico-semántica mediante expansión de términos aprendida (SPLADE).
- Control del número de términos activos por documento mediante la entrada `k` en tiempo de ejecución.
- Plegado de vocabulario por mayúsculas y espacios, lo que normaliza variantes superficiales de los términos.
- Ejecución en navegador o entornos ligeros mediante onnxruntime-web 1.31 o superior.
- Soporte de atención local por ventana deslizante para secuencias largas.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Búsqueda documental en aplicaciones de escritorio: ZotSeek integra este modelo para indexar y recuperar documentos localmente sin depender de servicios externos, gracias a su tamaño reducido (0,2 GB) y a la salida dispersa directamente consumible por índices invertidos.
- Recuperación aumentada en el navegador: con onnxruntime-web 1.31 o superior, el modelo puede ejecutarse en el cliente para búsqueda semántica sobre contenido local, evitando enviar datos a un servidor.
- Indexación de bibliografía académica: la expansión de términos SPLADE mejora el recall frente a BM25 en consultas con vocabulario divergente, útil para gestores de referencias.
- Búsqueda en corpus multilingües o técnicos: siempre que el vocabulario del tokenizador cubra los idiomas de interés (no confirmado en la información disponible), el modelo puede indexar documentación técnica y recuperar pasajes relevantes.
- Sistemas de preguntas y respuestas sobre documentación interna: el vector disperso se integra en un motor de búsqueda invertida (por ejemplo, Lucene o Tantivy) para el paso de recuperación previo a un modelo generativo.
- Filtrado y deduplicación de documentos: los vectores dispersos permiten calcular similitudes entre documentos para agrupar o eliminar duplicados en pipelines de ingesta.
- Despliegue en entornos con CPU únicamente: la cuantización int8 de pesos y las activaciones fp32 permiten inferencia eficiente sin GPU, adecuada para servidores modestos o dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona comprobaciones de equivalencia numérica frente a la implementación original y a la exportación fp32, recogidas en `fixtures/reference.json`, pero no incluye métricas de recuperación como nDCG, MRR o recall.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, y probablemente también GPUs integradas.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño de 0,2 GB del repositorio.
- Opciones de despliegue: onnxruntime (versión 1.31 o superior) y onnxruntime-web (1.31 o superior); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones de salida | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| bpiwowar/zotseek-sparseup-embed-v1 | SPLADE sparse retrieval (ONNX) | 50.370 (disperso) | no disponible | apache-2.0 | ONNX int8/fp16 |
| Linkup-Platform/linkup-sparseup-embed-v1 | SPLADE sparse retrieval (original) | 50.370 (disperso) | no disponible | apache-2.0 | safetensors/PyTorch (no confirmado) |
| Modelos densos tipo sentence-transformers | Embedding denso | 384-1024 típicamente | variable | variable | safetensors/ONNX |

La comparación con modelos densos es cualitativa: los embeddings densos ofrecen similitud semántica compacta pero requieren índices vectoriales (FAISS, HNSW), mientras que este modelo produce vectores dispersos compatibles con índices invertidos tradicionales y con expansión de términos explícita. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Solo se ha validado la equivalencia numérica frente al original mediante fixtures sintéticos; no hay evaluación de calidad de recuperación publicada.
- Los idiomas soportados no están documentados; el rendimiento fuera del inglés (u otros idiomas del entrenamiento original) es incierto.
- La longitud de contexto no está especificada; las entradas se rellenan a múltiplo de 64 tokens y la atención local por ventana limita el alcance efectivo.
- Requiere onnxruntime u onnxruntime-web 1.31 o superior para la cuantización int8 de pesos; versiones anteriores no son compatibles.
- La licencia apache-2.0 permite uso comercial, pero los créditos del modelo corresponden a Linkup Platform y el autor de la exportación no ofrece garantías adicionales.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperación de documentos irrelevantes si el vocabulario o el idioma no coinciden con los del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bpiwowar/zotseek-sparseup-embed-v1
- Modelo base: https://huggingface.co/Linkup-Platform/linkup-sparseup-embed-v1
- Repositorio ZotSeek: https://github.com/introfini/ZotSeek

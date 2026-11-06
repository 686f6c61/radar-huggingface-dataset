# Anshulgada/tabman-embeddinggemma-2-740m

## Resumen

Tabman EmbeddingGemma 2 (740M) es un modelo de embeddings de frases y documentos ajustado (fine-tuned) por el desarrollador Anshulgada a partir de google/embeddinggemma-2, un modelo de Google de aproximadamente 740 millones de parámetros. Está especializado en organización de pestañas del navegador, búsqueda semántica, agrupamiento jerárquico de URLs y descubrimiento en el historial web, y constituye el motor de embeddings de Tabman, un gestor de pestañas para el navegador Brave.

El problema que resuelve es la clasificación semántica de pestañas en tiempo real dentro del navegador: dado un título de pestaña, URL o fragmento de contenido, el modelo genera embeddings que permiten agrupar pestañas por temática (documentación de APIs, streaming, e-commerce, etc.) sin depender de servicios remotos. Su ajuste se realizó con 18.000 triplets contrastivos estratificados en 18 verticales web, empleando Matryoshka Representation Learning (MRL) con penalizaciones de pérdida simultáneas a 768, 512, 256 y 128 dimensiones.

Su relevancia actual radica en la combinación de tres factores: un tamaño contenido (~740M de parámetros) que permite ejecución local, soporte de ONNX con WebGPU mediante Transformers.js para inferencia directamente en el navegador (8-15 ms por pestaña), y embeddings truncables a 128 dimensiones sin pérdida de precisión medida (98,67 %), lo que reduce la memoria de índice un 83,3 % respecto al vector nativo de 768d.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión + audio) derivado de google/embeddinggemma-2, usado como codificador de texto |
| Parametros totales | 744.371.512 (~740M) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | 8.192 tokens (probado con 512 tokens para títulos de pestañas y URLs) |
| Tipos de cuantizacion | bfloat16 (entrenamiento), INT8 ONNX (inferencia en navegador y CPU) |
| Idiomas soportados | Inglés (según model card; el modelo base EmbeddingGemma soporta más idiomas, pero no se documenta para este ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (tamaño del repositorio: 2,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/embeddinggemma-2, un backbone transformer multimodal de unos 740M de parámetros con ventana de contexto nativa de 8.192 tokens. Para este ajuste se empleó como modelo intermedio el checkpoint Anshulgada/embeddinggemma-2-740m y se realizó un fine-tuning orientado a similitud de frases con la librería sentence-transformers, con precisión pura bfloat16 sobre una NVIDIA RTX A6000 de 48 GB de VRAM.

El entrenamiento utilizó 18.000 triplets contrastivos estratificados en 18 verticales web (documentación de APIs, cloud y DevOps, frontend, backend y bases de datos, ML e IA, productividad, localhost, foros, empleo, diseño, finanzas, streaming de vídeo, audio y podcasts, e-commerce, noticias, viajes y gaming). La función de pérdida fue MultipleNegativesRankingLoss envuelta en MatryoshkaLoss, calculando penalizaciones simultáneamente a 768d, 512d, 256d y 128d. Esta técnica de Matryoshka Representation Learning (arXiv:2205.13147) permite truncar el embedding por la izquierda conservando la geometría semántica del clustering, lo que habilita vectores de 128d (6 veces más pequeños) con precisión igual o superior a la nativa en el conjunto de prueba.

## Capacidades

- Extracción de embeddings de texto (feature extraction) para frases, títulos de pestañas, URLs y documentos.
- Similitud semántica entre frases y documentos (pipeline sentence-similarity).
- Agrupamiento semántico (clustering) de pestañas y URLs de forma jerárquica.
- Búsqueda semántica sobre historial web e índices de pestañas.
- Clasificación zero-shot aprovechando la similitud de embeddings.
- Embeddings Matryoshka truncables a 768, 512, 256 y 128 dimensiones sin re-entrenamiento.
- Inferencia en navegador vía Transformers.js con backend WebGPU (ONNX INT8).
- Fallback a CPU con onnxruntime y despliegue remoto con PyTorch CUDA en bfloat16.
- Idioma principal: inglés (según la model card).

## Casos de uso

- Agrupación automática de pestañas en el navegador: el modelo genera embeddings de títulos y URLs en tiempo real (8-15 ms por pestaña con WebGPU) y agrupa pestañas por temática sin enviar datos a servidores externos, preservando la privacidad.
- Gestor de pestañas para Brave (Tabman): es el motor de embeddings del proyecto brave-tab-manager, clasificando pestañas en 18 verticales web con una precisión medida del 98,5-98,67 %.
- Búsqueda semántica en el historial del navegador: permite recuperar pestañas visitadas por significado ("aquella documentación de React sobre memory leaks") en lugar de por coincidencia literal de texto.
- Indexación centralizada multi-navegador: desplegado en un servidor local con PyTorch CUDA (bf16), indexa más de 1.500 pestañas por segundo con latencia inferior a 2 ms, adecuado para instalar en LAN.
- Sistemas de deduplicación y limpieza de sesiones: los embeddings a 128d (~5,1 MB de RAM por 10.000 pestañas) permiten detectar pestañas duplicadas o redundantes con un coste de memoria mínimo.
- Clasificación zero-shot de contenido web: dado un conjunto de etiquetas descriptivas, el modelo puede asignar categorías a URLs o fragmentos de texto sin entrenamiento adicional.
- Búsqueda semántica en aplicaciones RAG ligeras: al ser un modelo de embeddings estándar compatible con sentence-transformers, puede integrarse en pipelines de recuperación de documentos en inglés.

## Benchmarks y rendimiento

La model card publica resultados propios sobre 1.800 triplets de prueba estratificados en 18 dominios web:

| Dimension de salida | Precision (%) | Margen coseno medio | Tamano relativo del vector | RAM por 10.000 pestañas |
|---|---|---|---|---|
| 768d (nativo) | 98,50 | +0,6074 | 1,00x | ~30,7 MB |
| 512d | 98,50 | +0,6077 | 0,67x | ~20,5 MB |
| 256d | 98,44 | +0,6051 | 0,33x | ~10,2 MB |
| 128d (recomendado) | 98,67 | +0,6427 | 0,17x | ~5,1 MB |

Resultados por dominio: 100,0 % de precisión en 17 de los 18 dominios (APIs, cloud/DevOps, frontend, backend/bases de datos, ML/IA, productividad, localhost, foros, empleo, diseño, finanzas, vídeo, audio, e-commerce, noticias, viajes y gaming). En investigación académica densa (papers de ArXiv de CS/Matemáticas con terminología solapada) la precisión baja al 72,7-75,8 %.

No se han publicado resultados de benchmarks estandarizados (MTEB, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- Extensión de navegador (WebGPU, ONNX INT8): ~270 MB de memoria, 8-15 ms por pestaña, ~80 pestañas/segundo. No requiere GPU dedicada más allá de la integrada compatible con WebGPU.
- CPU local (ONNX INT8 con onnxruntime): ~280 MB de RAM, 30-45 ms por pestaña, ~25 pestañas/segundo. Viable en cualquier equipo moderno sin GPU.
- Servidor remoto o LAN (PyTorch CUDA, bf16): ~600 MB de VRAM, latencia < 2 ms por pestaña, > 1.500 pestañas/segundo. Suficiente cualquier GPU moderna con CUDA (el entrenamiento original se hizo en una RTX A6000 de 48 GB, pero para inferencia no se necesita esa capacidad).
- Cabe con holgura en GPUs de consumo: una RTX 3060 o superior cubre el modo servidor; también funciona sin GPU en CPU.
- Opciones de despliegue: Transformers.js (WebGPU) en navegador, onnxruntime en CPU, sentence-transformers en Python, y script propio serve_embeddings.py para servir embeddings por red.
- Descargas y uso comunitario aún muy bajos (0 descargas registradas), por lo que no hay datos de latencia aportados por terceros.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Anshulgada/tabman-embeddinggemma-2-740m | ~740M | 768 (MRL hasta 128d) | 8.192 tokens | Apache 2.0 | Ajuste especifico para pestañas/URLs, ONNX + WebGPU |
| google/embeddinggemma-2 (base) | ~740M | no disponible | 8.192 tokens | no disponible | Modelo base generalista sin ajuste de dominio web |
| all-MiniLM-L6-v2 (sentence-transformers) | ~22M | 384 | 256 tokens | Apache 2.0 | Mucho mas ligero y rapido, pero menos preciso en similitud semantica fina |
| bge-base-en-v1.5 (BAAI) | ~109M | 768 | 512 tokens | MIT | Alternativa intermedia muy usada en RAG, sin soporte MRL documentado |

Comparado con alternativas ligeras como all-MiniLM-L6-v2, este modelo es considerablemente más pesado (~740M frente a ~22M) y más lento en CPU, pero ofrece mayor capacidad de discriminación semántica y contexto de 8.192 tokens. Su ventaja diferencial es el ajuste específico en verticales web y el soporte Matryoshka, que en la práctica compensa el tamaño al permitir vectores de 128d.

## Limitaciones y advertencias

- Ajustado y documentado para inglés; el rendimiento en castellano u otros idiomas no está evaluado en la model card.
- Rendimiento degradado en texto académico denso (72,7-75,8 % de precisión en papers de ArXiv con terminología solapada), su punto débil medido.
- Los benchmarks publicados son propios del autor sobre un conjunto de test privado (1.800 triplets); no hay validación independiente ni resultados en benchmarks estandarizados como MTEB.
- Proyecto con tracción comunitaria nula en el momento de la ficha (0 descargas, 0 likes), lo que implica riesgo de abandono y ausencia de revisión por pares.
- La model card describe el backbone como multimodal (texto + visión + audio), pero el uso documentado es exclusivamente textual; las capacidades de visión y audio no están verificadas para este ajuste.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar también los términos del modelo base de Google.
- En producción en navegador, el consumo de ~270 MB de memoria para el modelo puede ser significativo para usuarios con muchas extensiones o equipos modestos.
- Riesgo de alucinación no aplicable directamente al ser un modelo de embeddings, pero errores de clustering sí afectarían a la agrupación de pestañas; se recomienda el umbral de similitud adecuado por dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-740m
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Checkpoint intermedio del autor: https://huggingface.co/Anshulgada/embeddinggemma-2-740m
- Proyecto Tabman (brave-tab-manager): https://github.com/Anshulgada/brave-tab-manager
- Paper de Matryoshka Representation Learning: https://arxiv.org/abs/2205.13147
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentación de sentence-transformers: https://sbert.net/

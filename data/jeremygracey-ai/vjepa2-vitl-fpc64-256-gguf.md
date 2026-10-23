# jeremygracey-ai/vjepa2-vitl-fpc64-256-GGUF

## Resumen

Esta ficha describe la conversión a formato GGUF de V-JEPA 2 ViT-L/16, el codificador de vídeo auto-supervisado de Meta FAIR (modelo base `facebook/vjepa2-vitl-fpc64-256`), publicada por jeremygracey-ai para su uso con jepa.cpp, un motor de inferencia en C/C++ basado en ggml. Con 325.971.328 parámetros (326 M), el modelo genera embeddings de vídeo y se ejecuta en CPU pura, sin Python ni PyTorch: dimensiones, esquema posicional y receta de preprocesado viajan dentro del propio fichero GGUF, de modo que la inferencia solo requiere un binario y los pesos.

V-JEPA 2 aborda el aprendizaje de representaciones de vídeo sin etiquetas, mediante predicción latente sobre vídeo a escala de internet, y está pensado para tareas de comprensión, predicción y planificación en el mundo físico. La relevancia de esta conversión está en el despliegue ligero: embeddings de vídeo en máquinas sin GPU con una latencia medida de 821 ms por clip de 16 fotogramas en CPU (32 hilos) y de 46,5 ms en una RTX 4500 Ada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-L/16 con predictor latente enmascarado (JEPA), RoPE 3-D en disposición "tiled" de Meta |
| Parámetros totales | 325.971.328 (326 M) |
| Parametros activos | no aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | Clips de hasta 64 fotogramas a 256x256 px (fpc64); ~8.192 tokens por clip (cálculo derivado: 32 tubelets x 256 parches espaciales) |
| Tipos de cuantización | f32, f16, q8_0, q4_0, q4_k (publicados); q4_1, q5_0, q5_1, q5_k, q6_k generables localmente con `jepa-quantize` |
| Idiomas soportados | no aplicable (codificador de vídeo sin componente textual) |
| Licencia | MIT |
| Formato de pesos | GGUF (5 variantes publicadas); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia JEPA (Joint-Embedding Predictive Architecture): en lugar de reconstruir píxeles, se entrena de forma auto-supervisada prediciendo representaciones latentes de objetivos enmascarados en el espacio de embeddings. El codificador es un Vision Transformer de escala L con dimensión D = 1024, 24 capas, 16 cabezas de atención, parches de 16x16 píxeles y tubelets de 2 fotogramas, con RoPE 3-D en la disposición "tiled" de Meta; un clip completo pasa por un único grafo de cómputo. La conversión incluye también el predictor latente enmascarado del modelo original.

Según la publicación de Meta, la familia V-JEPA 2 se entrena con vídeo a escala de internet (y, en la variante orientada a planificación, con una pequeña cantidad de datos de interacción robótica); el número de tokens y la composición exacta del dataset de este checkpoint no están disponibles en la información proporcionada. Al no ser un modelo generativo de lenguaje, no aplica RLHF ni DPO. Como innovación de la conversión, todos los metadatos necesarios para inferencia (dimensiones, esquema posicional, preprocesado) van embebidos en el GGUF.

## Capacidades

- Extracción de características de vídeo: genera embeddings por clip con opciones de pooling `mean`, `cls`, `lewm` o `none` (mapa completo de tokens).
- Clasificación de vídeo mediante k-NN o centroides sobre características congeladas, sin reentrenar nada (demostrado en UCF-101).
- Similitud y recuperación de vídeos a partir de los vectores pooled.
- Predicción latente: incluye el masked latent predictor del modelo base de Meta.
- Ejecución en CPU sin dependencias de Python ni PyTorch, con API C de una sola cabecera.
- No genera texto, no soporta tool calling ni function calling, no está diseñado para agentes ni razonamiento multi-paso, y no procesa audio ni texto: es exclusivamente un codificador de vídeo.

## Casos de uso

- Clasificación de vídeo sin entrenamiento previo: se calculan embeddings de los clips y se clasifican por k-NN o voto por centroides sobre features congeladas; en la evaluación de jepa.cpp sobre UCF-101 alcanza un 89,52 % de top-1, útil para prototipado rápido sin dataset etiquetado.
- Búsqueda y recuperación en bibliotecas de vídeo: el embedding pooled de cada clip se indexa en un motor vectorial (FAISS, Milvus, etc.) para consultas por similitud coseno; adecuado porque las features capturan semántica espacio-temporal del contenido.
- Deduplicación y control de calidad de contenidos: comparar embeddings de clips para detectar duplicados, re-subidas o variantes del mismo material en catálogos grandes de vídeo.
- Analítica en el borde sin GPU: al ejecutarse en CPU con jepa.cpp y un pico de 1.034 MiB de RAM (f16), es viable en servidores o estaciones sin acelerador para procesamiento por lotes de grabaciones de vigilancia o industrial.
- Preprocesado para sistemas multimodales: los embeddings sirven de entrada a clasificadores ligeros, detectores de eventos o modelos downstream con adaptadores, evitando recalcular features costosas.
- Moderación y monitorización de streams: trocear el vídeo en clips de hasta 64 fotogramas, extraer features y umbralizar para detectar eventos o contenidos no deseados en tiempo casi real con GPU (46,5 ms por clip de 16 frames).
- Investigación en robótica y predicción física: el modelo base se enmarca en trabajos de comprensión, predicción y planificación; esta conversión permite extraer features del codificador sin montar el stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado los benchmarks oficiales completos del paper de V-JEPA 2 en la información disponible. Los datos siguientes corresponden a la evaluación interna de jepa.cpp (commit `00bfd4e`): UCF-101 sobre un subconjunto de 10 clases, con 105 clips de consulta (val+test) frente a una galería de 300 clips, 16 fotogramas por clip, k = 20 con voto por coseno sobre features congeladas; nada se entrena.

| Backend | dtype | k-NN top-1 % | Centroid top-1 % | Concordancia k-NN % | Concordancia centroid % | Coseno de features |
|---|---|---:|---:|---:|---:|---:|
| PyTorch (referencia) | f32 | 88,57 | 95,24 | — | — | — |
| jepa.cpp | f16 | 89,52 | 95,24 | 99,05 | 100,00 | 0,999996 |
| jepa.cpp | q8_0 | 89,52 | 95,24 | 99,05 | 100,00 | 0,999886 |

Fidelidad de cada fichero GGUF respecto a la referencia en PyTorch (coseno por token de `last_hidden_state`):

| Archivo | Tamaño | Nivel | Coseno medio | Peor token | Coseno pooled_mean |
|---|---|---|---:|---:|---:|
| f32 | 1.243,5 MiB | exact | 1,000000 | 0,999999 | 1,000000 |
| f16 | 622,5 MiB | parity | 0,997144 | 0,5088 | 0,999991 |
| q8_0 | 332,8 MiB | parity | 0,966128 | 0,2305 | 0,999876 |
| q4_0 | 178,3 MiB | advisory | 0,915000 | 0,200962 | 0,994207 |
| q4_k | 178,3 MiB | advisory | 0,931075 | 0,220083 | 0,996089 |

Nota: los valores pooled_mean de q4_0 y q4_k se miden con un auto-test de dequantización (error de pesos únicamente), no con el test de paridad completo.

Velocidad medida (grafo del codificador, f16, 32 hilos):

| Entorno | Latencia por clip de 16 frames | Latencia por clip de 64 frames |
|---|---:|---:|
| AMD Ryzen Threadripper PRO 7995WX (96 núcleos, 32 hilos) | 821 ms | 6.388 ms |
| NVIDIA RTX 4500 Ada | 46,5 ms | no disponible |

## Requisitos de hardware

- No requiere GPU: jepa.cpp está diseñado para CPU; el pico de memoria (RSS) con f16 es de 1.034 MiB de RAM.
- RAM según dtype: f16 cabe en ~1 GiB medido; f32 pesa 1.243,5 MiB en disco (consumo de RAM exacto no disponible); q8_0 ocupa 332,8 MiB y las variantes q4, 178,3 MiB.
- GPU opcional: medido sobre NVIDIA RTX 4500 Ada con 46,5 ms por clip de 16 fotogramas (f16). Dado que los pesos f16 ocupan 622,5 MiB, cualquier GPU consumer de 4-8 GB debería tener VRAM de sobra incluso con activaciones (estimación; no hay mediciones publicadas de RTX 4090 u otras).
- Consumer GPUs: al ser un modelo de 326 M, sobra hardware moderno; no se requieren A100 ni H100.
- Despliegue: jepa.cpp como binario único + fichero GGUF (CLI `jepa-embed` y `jepa-quantize`, API C en `include/jepa.h`); también ejecutable en PyTorch mediante el repositorio del modelo base. vLLM, TGI y Ollama no son aplicables (no es un modelo de lenguaje).
- Latencia y throughput: 821 ms por clip de 16 frames y 6.388 ms por clip de 64 frames en CPU (f16, 32 hilos); 46,5 ms por clip de 16 frames en RTX 4500 Ada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Entrada | Licencia | Ejecución |
|---|---|---|---|---|---|
| jeremygracey-ai/vjepa2-vitl-fpc64-256-GGUF | 326 M | GGUF (f32–q4_k) | Clips de 64 frames, 256x256 | MIT | CPU/CUDA vía jepa.cpp, sin Python |
| facebook/vjepa2-vitl-fpc64-256 (base) | 326 M | safetensors (PyTorch) | Clips de 64 frames, 256x256 | MIT | PyTorch, GPU recomendada |
| jepacpp/vjepa2-vitl-fpc64-256-GGUF | 326 M | GGUF | Clips de 64 frames, 256x256 | MIT | CPU/CUDA vía jepa.cpp (referenciada en el README como fuente de descarga) |
| Otros tamaños de la familia V-JEPA 2 | no disponible | safetensors | no disponible | no disponible | PyTorch |

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no conversa, no hace tool calling ni encaja en pipelines de LLM.
- Advertencia crítica de dtype: el rango de activaciones del checkpoint contiene un clúster degenerado de tokens de baja norma que el redondeo F16 dentro de `mul_mat` de ggml colapsa; si se consumen tokens individuales, usar f32. Todo lo pooled no se ve afectado (propiedad del checkpoint, reproducida en numpy, no un defecto del motor).
- Las cuantizaciones q4_0 y q4_k están por debajo del umbral de paridad (nivel "advisory"): solo se controlan los tensores derivados y el top-1.
- La evaluación publicada se limita a 10 clases y 105 clips de UCF-101; no es comparable con los benchmarks oficiales completos del paper, que no constan en la información disponible.
- Sesgos: al entrenarse con vídeo de internet, los embeddings pueden heredar sesgos de cobertura, estilo de cámara y procedencia del material.
- Entrada fija: resolución 256x256 y clips de hasta 64 fotogramas; vídeos más largos exigen troceado y agregación de features.
- Repositorio muy reciente, con 0 descargas registradas y sin validación comunitaria; además, el README referencia la descarga desde la organización `jepacpp`, no desde este repositorio, lo que conviene verificar antes de producción.
- jepa.cpp es un motor de inferencia: el ajuste fino requeriría el stack PyTorch original.
- La licencia MIT no impone restricciones al uso comercial.

## Enlaces

- Repositorio del modelo (GGUF): https://huggingface.co/jeremygracey-ai/vjepa2-vitl-fpc64-256-GGUF
- Modelo base de Meta: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Motor jepa.cpp: https://github.com/aselimc/jepa.cpp
- API C (cabecera): https://github.com/aselimc/jepa.cpp/blob/main/include/jepa.h
- Referencia de la API C: https://aselimc.github.io/jepa.cpp/api/
- Documentación de paridad: https://aselimc.github.io/jepa.cpp/parity/
- Documentación de cuantización: https://aselimc.github.io/jepa.cpp/quantization/
- Documentación de precisión y guía de dtype: https://aselimc.github.io/jepa.cpp/accuracy/ (sección "which dtype to ship": https://aselimc.github.io/jepa.cpp/accuracy/#which-dtype-to-ship)
- Documentación de rendimiento: https://aselimc.github.io/jepa.cpp/performance/
- Artículo (arXiv 2506.09985): https://arxiv.org/abs/2506.09985
- Página de la publicación en Meta: https://ai.meta.com/research/publications/v-jepa-2-self-supervised-video-models-enable-understanding-prediction-and-planning/
- Código PyTorch de referencia: https://github.com/JeremyGracey-AI/Gracey_vjepa2
- Ficha del proyecto V-JEPA 2 (Hysen Labs): https://hysenlabs.com/projects/facebookresearch-vjepa2

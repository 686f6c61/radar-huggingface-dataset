# Anshulgada/tabman-embeddinggemma-2-440m

## Resumen

Tabman EmbeddingGemma 2 (440M) es un modelo de embeddings de frases y documentos ajustado (fine-tuned) a partir de `google/embeddinggemma-2`, desarrollado por Anshulgada para el proyecto Tabman, un gestor de pestañas para el navegador Brave. Su propósito es resolver la organización semántica de pestañas: agrupación jerárquica de URLs, búsqueda semántica en el historial y clasificación zero-shot de contenido web, todo ejecutándose directamente en el navegador.

El modelo se ha entrenado con 18.000 tripletos contrastivos estratificados en 18 verticales web distintas (documentación de APIs, devops, e-commerce, prensa, etc.), empleando Matryoshka Representation Learning (MRL) con penalizaciones de pérdida calculadas simultáneamente a 768, 512, 256 y 128 dimensiones. Esto permite truncar los embeddings a 128 dimensiones sin pérdida de precisión medible, reduciendo en un 83,3 % el consumo de memoria, índice y cómputo de distancias.

Con unos 440 millones de parámetros, ventana de contexto de 8.192 tokens y pesos en safetensors y ONNX, es especialmente relevante porque puede ejecutarse en el navegador vía Transformers.js con WebGPU, con latencias de 8-15 ms por pestaña y unos 270 MB de memoria, lo que lo hace viable para inferencia local en tiempo real sin servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision) basado en google/embeddinggemma-2, con sentence-transformers |
| Parametros totales | 438.760.472 (~440M) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens (probado en producción con 512 tokens para titulos y URLs) |
| Tipos de cuantizacion | INT8 (ONNX para WebGPU y CPU); entrenamiento en bfloat16 |
| Idiomas soportados | Ingles (el ajuste se realizo con datos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (compatible con transformers.js, WebGPU y onnxruntime) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `google/embeddinggemma-2` (~440M de parametros), un transformer multimodal de texto y vision reconvertido en modelo de embeddings mediante la libreria sentence-transformers. La innovacion central del ajuste es el uso de Matryoshka Representation Learning (MRL): la funcion de perdida, `MultipleNegativesRankingLoss`, se envuelve en `MatryoshkaLoss` y se calcula de forma simultanea sobre cortes del embedding a 768d, 512d, 256d y 128d. Gracias a ello, los primeros 128 valores del vector conservan practicamente toda la geometria semantica, permitiendo truncar por la izquierda sin recalcular nada.

El entrenamiento se realizo en precision bfloat16 pura sobre una NVIDIA RTX A6000 de 48 GB de VRAM, utilizando 18.000 tripletos contrastivos estratificados en 18 dominios web reales (titulos de pestañas, URLs y contextos de sitios como MDN, AWS, React, PostgreSQL, Figma, Amazon o Steam). El checkpoint base intermedio empleado fue `Anshulgada/embeddinggemma-2-440m`. No se ha publicado informacion sobre datos adicionales, RLHF/DPO ni tecnicas de decodificacion (no aplicable al ser un modelo de embeddings).

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica (pipeline sentence-similarity)
- Extraccion de caracteristicas (feature-extraction) de titulos de pestañas, URLs y texto web
- Agrupacion semantica jerarquica de pestañas del navegador en tiempo real
- Busqueda semantica sobre historial de navegacion
- Clasificacion zero-shot de contenido web en verticales predefinidas
- Embeddings Matryoshka truncables a 768d, 512d, 256d y 128d sin reentrenamiento
- Ejecucion en navegador mediante Transformers.js con backend WebGPU (INT8 ONNX)
- Fallback a CPU con onnxruntime y despliegue remoto con PyTorch CUDA en bf16
- Vision multimodal heredada del backbone base (no documentada en el ajuste; no disponible su rendimiento)

## Casos de uso

- **Agrupacion automatica de pestañas en el navegador**: el modelo genera embeddings de titulos y URLs de pestañas abiertas y los agrupa por similitud coseno a 128d, con 8-15 ms por pestaña en WebGPU, suficiente para reagrupar en tiempo real mientras el usuario navega.
- **Busqueda semantica en el historial**: permite encontrar pestañas o paginas visitadas por significado ("aquel tutorial de fugas de memoria en React") en lugar de por coincidencia literal de texto, gracias a la similitud semantica de los embeddings.
- **Gestion centralizada de indices multi-navegador**: en un servidor LAN con PyTorch CUDA bf16, indexa mas de 1.500 pestañas por segundo con menos de 2 ms de latencia, util para sincronizar sesiones de varios equipos.
- **Clasificacion zero-shot de sitios web**: categoriza URLs en verticales (desarrollo, finanzas, viajes, gaming, etc.) sin entrenamiento adicional, aprovechando los 18 dominios vistos durante el ajuste.
- **Sistemas RAG ligeros en cliente**: los embeddings Matryoshka a 128d (~5,1 MB por 10.000 documentos) permiten construir indices vectoriales compactos que caben en memoria del navegador o en localStorage/IndexedDB.
- **Deduplicacion y deteccion de pestañas repetidas**: la similitud coseno entre embeddings identifica pestañas con contenido semanticamente identico (por ejemplo, multiples issues de GitHub del mismo proyecto).
- **Organizacion de marcadores y sesiones guardadas**: agrupacion automatica de colecciones de marcadores extensas por tematica, reutilizando el mismo pipeline de embeddings.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.800 tripletos de test retenidos, estratificados en 18 dominios web:

| Dimension de salida | Precision (%) | Margen coseno medio | Tamano relativo del vector | RAM del vector / 10.000 pestañas |
|---|---|---|---|---|
| 768d (nativo) | 98,50 | +0,6074 | 1,00x | ~30,7 MB |
| 512d | 98,50 | +0,6077 | 0,67x | ~20,5 MB |
| 256d | 98,44 | +0,6051 | 0,33x | ~10,2 MB |
| 128d (recomendado) | 98,67 | +0,6427 | 0,17x | ~5,1 MB |

Precision por dominio:

| Dominio | Precision |
|---|---|
| 17 de 18 dominios (APIs, cloud/devops, frontend, backend/BD, ML/AI, productividad, localhost, foros, empleo, diseno, finanzas, video, audio, e-commerce, prensa, viajes, gaming) | 100,0 % |
| Investigacion academica densa (ArXiv CS/Matematicas) | 72,7 % - 75,8 % |

Nota: estos son benchmarks propios del autor, no evaluaciones independientes. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K (no aplicables a un modelo de embeddings).

## Requisitos de hardware

- **Extension de navegador (WebGPU, INT8 ONNX, Transformers.js)**: ~270 MB de memoria, 8-15 ms por pestaña, ~80 pestañas/segundo. No requiere GPU dedicada mas alla de la integrada compatible con WebGPU.
- **CPU local (INT8 ONNX, onnxruntime)**: ~280 MB de memoria, 30-45 ms por pestaña, ~25 pestañas/segundo. Viable en cualquier equipo moderno sin GPU.
- **Servidor remoto/LAN (PyTorch CUDA, bf16)**: ~600 MB de VRAM, menos de 2 ms por pestaña, mas de 1.500 pestañas/segundo. Cualquier GPU CUDA moderna es suficiente; el entrenamiento se realizo en una RTX A6000 de 48 GB, pero para inferencia no se necesita nada cercano a eso.
- Cabe sobradamente en GPUs de consumo: cualquier GPU con 1-2 GB de VRAM libres ejecuta el modelo en precision completa.
- Opciones de despliegue: Transformers.js (WebGPU) en navegador, onnxruntime en CPU, sentence-transformers con PyTorch en servidor; no se menciona soporte especifico de vLLM, TGI u Ollama (no disponible).
- Latencia y throughput: ver la matriz anterior; los datos provienen de la model card del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Anshulgada/tabman-embeddinggemma-2-440m | ~440M | 768/512/256/128 (MRL) | 8.192 tokens | safetensors, ONNX (INT8) | Apache 2.0 |
| google/embeddinggemma-2 (base) | ~440M | 768 (MRL) | 8.192 tokens | safetensors | Apache 2.0 |
| all-MiniLM-L6-v2 (sentence-transformers) | ~22M | 384 | 256 tokens | safetensors, ONNX | Apache 2.0 |
| bge-base-en-v1.5 (BAAI) | ~109M | 768 | 512 tokens | safetensors | MIT |

Frente al modelo base, Tabman anade el ajuste especifico en dominios web y un pipeline de despliegue en navegador; frente a alternativas mas pequenas como MiniLM, ofrece mayor precision semantica y contexto mas largo a costa de un consumo de memoria muy superior (~270 MB frente a decenas de MB). No hay benchmarks comparativos directos publicados entre estos modelos (no disponible).

## Limitaciones y advertencias

- El ajuste se realizo unicamente con datos en ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior (no disponible).
- El rendimiento cae de forma notable (72,7 %-75,8 %) en textos academicos densos con terminologia solapada, como papers de ArXiv de CS y matematicas.
- Los benchmarks provienen exclusivamente del autor del modelo, sobre una suite de test propia de 1.800 tripletos; no existen evaluaciones independientes ni comparativas con otros modelos de embeddings.
- El dominio de especializacion es muy estrecho: titulos de pestañas, URLs y contenido web. Para textos largos, documentos juridicos o dominios fuera de las 18 verticales, el comportamiento es desconocido.
- La capacidad multimodal del backbone base (vision) no esta documentada en este ajuste; no asumas que funciona.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes mas alla de la atribucion.
- Con 0 descargas y 0 likes en el momento de redactar la ficha, se trata de un modelo muy reciente y sin adopcion comunitaria verificada; prueba antes de usar en produccion.
- Al ser un modelo de embeddings, no genera texto ni esta expuesto a alucinaciones en el sentido de los LLM, pero errores de agrupacion o recuperacion son posibles, especialmente fuera de los dominios de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anshulgada/tabman-embeddinggemma-2-440m
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Checkpoint intermedio del autor: https://huggingface.co/Anshulgada/embeddinggemma-2-440m
- Proyecto Tabman (Brave Tab Manager): https://github.com/Anshulgada/brave-tab-manager
- Paper de Matryoshka Representation Learning: https://arxiv.org/abs/2205.13147
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de sentence-transformers: https://sbert.net/

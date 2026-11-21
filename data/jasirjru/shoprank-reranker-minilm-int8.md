# jasirjru/shoprank-reranker-minilm-int8

## Resumen

ShopRank Reranker MiniLM INT8 es un cross-encoder de reordenación (reranking) para búsqueda de productos en inglés, publicado por el desarrollador independiente jasirjru como proyecto didáctico y de portafolio. El modelo parte de `cross-encoder/ms-marco-MiniLM-L-12-v2` (33 millones de parámetros) y se afina sobre el conjunto ESCI (Shopping Queries Dataset) mediante destilación de conocimiento desde un modelo profesor DeBERTa-v3-base. Recibe una consulta de compra y una lista de candidatos con título, marca, color y viñetas, y devuelve una puntuación de relevancia para cada producto.

La relevancia de este modelo es acotada pero concreta: demuestra que un cross-encoder pequeño (33 M de parámetros, 32 MB en INT8) puede alcanzar un nDCG de 0,8674 en el test oficial de ESCI Task 1, por encima de BM25 (0,8202) y de la receta MiniLM de Amazon (0,8544), y a solo dos puntos del profesor DeBERTa (0,8877). Está pensado para reordenar listas cortas de hasta 200 productos tras una etapa de recuperación por palabras clave o vectores, no para recuperar de un catálogo completo.

El modelo se distribuye en formato ONNX con pesos INT8 dinámicos (cuantización por canal), lo que permite ejecución en CPU sin GPU. La ficha del autor lo describe explícitamente como un sistema de enseñanza, no de producción, y documenta con detalle sus límites: sensibilidad a errores tipográficos, rendimiento inferior en consultas con negación, ruido en las etiquetas y ausencia de análisis de sesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (MiniLM-L12), una única salida de puntuación |
| Parámetros totales | 33 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en entrenamiento y servicio) |
| Tipos de cuantización | INT8 dinámica (por canal) sobre pesos; también existe versión fp32 ONNX de referencia |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`), más `tokenizer.json`, `tokenizer_config.json`, `serving.json`, `quality.json` y `SHA256SUMS` |
| Modelo base | `cross-encoder/ms-marco-MiniLM-L-12-v2` |
| Modelo profesor | `microsoft/deberta-v3-base` (MIT) |
| Tamaño del artefacto | 32 MB (INT8) |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en MiniLM-L12 con una cabeza de regresión que produce una sola puntuación por par (consulta, producto). La entrada se construye como `query [SEP] title brand colour bullets`, con los campos ausentes omitidos y unidos por espacios simples, y se trunca a 128 tokens. El entrenamiento emplea destilación de conocimiento: para cada par del conjunto ESCI Task 1 (323.302 pares, unas 16.100 consultas, aproximadamente el 77 % de las consultas oficiales de entrenamiento; el resto se reparte entre dev, dev2 y un 10 % reservado para parada temprana), el objetivo es la puntuación del modelo profesor DeBERTa-v3-base de un pliegue que nunca vio esa consulta (out-of-fold). Se optimiza con pérdida MSE durante 1 época, learning rate 7e-6 con 5.000 pasos de warm-up lineal, batch 32, precisión bf16 y semilla 42.

Para el servicio se exporta a ONNX Runtime con fusión de kernels del transformer y cuantización INT8 dinámica de pesos por canal. El autor documenta que la versión INT8 obtiene un nDCG de 0,8654 en dev frente a 0,8662 de la versión fp32, una pérdida de calidad mínima a cambio de un artefacto de 32 MB ejecutable en CPU.

## Capacidades

- Puntuación de relevancia producto-consulta: asigna una puntuación escalar a cada par (consulta, producto) para ordenar una lista de candidatos de mejor a peor.
- Reordenación de listas cortas: diseñado para reordenar hasta 200 productos tras una etapa de recuperación previa.
- Uso de metadatos estructurados: incorpora título, marca, color y viñetas del producto en la entrada; los campos ausentes simplemente se omiten.
- Ejecución en CPU: el formato ONNX INT8 permite inferencia sin GPU mediante ONNX Runtime.
- Integración programática: API de inferencia directa con `onnxruntime` y `transformers`, sin dependencias del repositorio del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés; los datos ESCI en español y japonés existen pero no se usaron.

## Casos de uso

- Reordenación en motores de búsqueda de comercio electrónico: tras una recuperación por BM25 o búsqueda vectorial, el modelo reordena los 50-200 candidatos según relevancia, aprovechando su nDCG de 0,8674 en el test oficial de ESCI.
- Búsqueda interna en catálogos de marketplace: para consultas en inglés con atributos de producto (marca, color), el modelo incorpora estos campos en la entrada y mejora el orden frente a un ranking puramente léxico.
- Filtrado de resultados poco relevantes: las puntuaciones permiten descartar candidatos con baja relevancia dentro de una misma consulta, aunque el autor advierte que no son probabilidades calibradas.
- Prototipado y evaluación de pipelines de búsqueda: al ser un artefacto de 32 MB ejecutable en CPU, sirve para experimentar con etapas de reranking en entornos sin GPU.
- Docencia y portafolio: el repositorio de GitHub incluye un cuaderno de laboratorio con cada ejecución, la prueba oficial única y una auditoría, lo que lo hace útil como ejemplo reproducible de destilación y cuantización.
- Servicio de bajo coste en CPU: con p50 de 69 ms y p95 de 232 ms por petición de ~16 candidatos en una CPU de portátil de 16 hilos, encaja en despliegues ligeros sin acelerador.
- Evaluación comparativa de rerankers: sirve como referencia cuantitativa frente a BM25 y a la receta MiniLM de Amazon en el mismo conjunto de test.

## Benchmarks y rendimiento

| Datos | Métrica | Valor |
|---|---|---|
| Test oficial ESCI Task 1, US (8.956 consultas), modelo PyTorch | nDCG, lista completa | 0,8674 [0,8643; 0,8703] |
| Mismo conjunto | nDCG@10 | 0,7743 [0,7702; 0,7783] |
| Dev (2.001 consultas retenidas), ONNX INT8 | nDCG, lista completa | 0,8654 |
| Dev, ONNX fp32 | nDCG, lista completa | 0,8662 |
| Dev, consultas con negación (158) | nDCG | 0,8378 |
| Dev, consulta con un par de letras intercambiado en la palabra más larga | nDCG | 0,8392 |
| Comparativa en el mismo test | BM25 | 0,8202 |
| Comparativa en el mismo test | Receta MiniLM de Amazon | 0,8544 |
| Comparativa en el mismo test | Profesor DeBERTa | 0,8877 |

Ganancias asignadas: Exact 1, Substitute 0,1, Complement 0,01, Irrelevant 0. Los intervalos de confianza del 95 % se calculan por bootstrap sobre consultas.

Rendimiento en CPU de portátil (16 hilos, una llamada al modelo a la vez): p50 de 69 ms y p95 de 232 ms por petición de ~16 candidatos; aproximadamente 230 pares/s (~11 peticiones/s) por proceso.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el artefacto INT8 ocupa 32 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; el autor no publica cifras de inferencia en GPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto, ya que está optimizado para CPU vía ONNX Runtime.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`; el autor proporciona el comando `uv run python -m shoprank.serve.fetch` para descargar y verificar los ficheros por SHA-256. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 69 ms, p95 232 ms por petición de ~16 candidatos; ~230 pares/s y ~11 peticiones/s por proceso en CPU de portátil de 16 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG en test ESCI Task 1 (US) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ShopRank Reranker MiniLM INT8 | 33 M | 128 tokens | 0,8674 (lista completa) | Apache-2.0 | Hugging Face y GitHub release v1.0 |
| Receta MiniLM de Amazon | No disponible | No disponible | 0,8544 | No disponible | No disponible |
| Profesor DeBERTa-v3-base | No disponible (DeBERTa-v3-base) | No disponible | 0,8877 | MIT | No disponible |
| BM25 (referencia léxica) | No aplica | No aplica | 0,8202 | No aplica | No aplica |

El autor no ofrece comparación con otros rerankers cross-encoder de propósito general; los únicos puntos de referencia publicados son los de la tabla anterior, medidos sobre el mismo conjunto de test.

## Limitaciones y advertencias

- Idioma: solo inglés; los datos ESCI en español y japonés no se utilizaron.
- Dominio: entrenado con productos de estilo Amazon; no se garantiza su comportamiento en otros dominios.
- No recupera: requiere que se le proporcionen los candidatos; no puede buscar en un catálogo completo.
- Sensibilidad a errores tipográficos: intercambiar un par de letras en la palabra más larga de la consulta baja el nDCG en dev de 0,8654 a 0,8392 (INT8).
- Campos ausentes: la falta de marca, color y viñetas cuesta aproximadamente 0,01 de nDCG; las mayúsculas y minúsculas no afectan.
- Negaciones: rendimiento inferior en consultas con "without" o "not" (nDCG 0,8378 en 158 consultas frente a 0,8667 global); el modelo sí lee la palabra de negación, por lo que la causa es otra.
- Ruido en etiquetas: el paper de ESCI reporta un 91 % de acuerdo entre anotadores; en una muestra de 100 pares seleccionada para buscar errores, 75 etiquetas parecían incorrectas. No se midió cuánto limita esto el nDCG máximo alcanzable.
- Puntuaciones no calibradas: son puntuaciones de relevancia para ordenar dentro de una misma consulta; no deben compararse entre consultas ni usarse como umbrales sin calibración.
- Sesgo: entrenado con consultas y etiquetas humanas de Amazon US; hereda patrones de marca y popularidad y no se realizó análisis de equidad.
- Uso previsto: el autor lo describe como proyecto didáctico y de portafolio, no como sistema de producción.
- Licencia: Apache-2.0 permite uso comercial, pero las limitaciones anteriores desaconsejan su despliegue directo sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/jasirjru/shoprank-reranker-minilm-int8
- Repositorio GitHub (código, entrenamiento, evaluación y auditoría): https://github.com/jasirjru/shoprank
- Release v1.0: https://github.com/jasirjru/shoprank/releases/tag/v1.0
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-12-v2
- Modelo profesor: https://huggingface.co/microsoft/deberta-v3-base
- Dataset ESCI (Shopping Queries Dataset, Reddy et al., 2022): no se proporciona URL directa en la información disponible

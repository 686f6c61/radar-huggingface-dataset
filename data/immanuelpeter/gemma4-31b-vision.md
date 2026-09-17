# immanuelpeter/Gemma4-31B-Vision

## Resumen

Gemma4-31B-Vision es un repositorio publicado por el usuario immanuelpeter que extrae y empaqueta unicamente la torre de vision (vision tower) y el proyector del modelo multimodal google/gemma-4-31B-it. No es un modelo nuevo ni un fine-tuning: es una reempaquetado de 355 tensores de la torre mas 1 tensor del proyector, exportados en BF16 desde el shard `model-00001-of-00002.safetensors` del modelo original de Google DeepMind. El resultado es un extractor de caracteristicas de imagen puro, no un modelo generativo de texto.

A pesar del nombre comercial "31B" del repositorio, el dato real de safetensors indica 569.550.384 parametros totales (aproximadamente 569,5 millones), con un peso en disco de 1,2 GB. El desajuste es esperable: el sufijo "31B" hace referencia al modelo multimodal completo del que procede, no a este subconjunto, que unicamente contiene el codificador visual y su proyector hacia el espacio de embeddings del modelo de lenguaje.

Su relevancia es practica: permite reutilizar el codificador visual de Gemma 4 31B de forma aislada, con licencia Apache 2.0 y sin cargar los aproximadamente 31.000 millones de parametros del modelo completo. Esto lo hace util para extraccion de embeddings de imagen, retrieval multimodal, clasificacion con cabezas congeladas y como pieza de vision en pipelines multimodales propios. La validacion de paridad se realiza mediante `torch.equal` contra el modelo padre, por lo que las representaciones son identicas a las originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (tipo ViT) con pooling 3x3 y proyector lineal; `model_type`: `gemma4_vision` |
| Parametros totales | 569.550.384 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no procesa secuencias de texto; depende de la resolucion de imagen y del numero de parches) |
| Tipos de cuantizacion | No disponible (los pesos se publican en BF16; no hay variantes GGUF, AWQ ni GPTQ documentadas) |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | Apache 2.0 (misma que el modelo fuente; enlace a la licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (`model.safetensors`, 355 tensores; `projector.safetensors`, 1 tensor), BF16 |
| Torre de vision | 27 capas, 1152 dimensiones ocultas, 16 cabezas, 4304 de dimension intermedia, patch size 16, kernel de pooling 3x3 |
| Proyector | `RMSNorm(1152)` sin escala aprendida + `Linear(1152, 5376)` sin bias |
| Repo en disco | 1,2 GB |

## Arquitectura y entrenamiento

La torre de vision sigue una arquitectura transformer tipo ViT con patch size 16 y pooling de kernel 3x3. Consta de 27 capas con 1152 dimensiones ocultas, 16 cabezas de atencion y una dimension intermedia de 4304, lo que arroja 569,5 millones de parametros. La salida de la torre se normaliza con una `RMSNorm(1152)` sin escala aprendida (scale-free) y se proyecta mediante una capa `Linear(1152, 5376)` sin bias hacia el espacio de embeddings de 5376 dimensiones del modelo Gemma 4 31B. Al no tener la RMSNorm parametros aprendidos, el proyector empaquetado se reduce a un unico tensor lineal, coherente con las 355 + 1 entradas de safetensors.

No hay entrenamiento adicional por parte del publicador: se trata de una extraccion mecanica. El script de reproduccion lee `model.vision_tower.*` (355 tensores) y `model.embed_vision.*` (1 tensor) del shard `model-00001-of-00002.safetensors` de `google/gemma-4-31B-it`, elimina los prefijos y escribe los tensores originales en BF16. La unica validacion documentada es un script de paridad que compara los 355 tensores de la torre y el lineal del proyector con el modelo padre fijado (pinned parent) usando `torch.equal`, lo que implica igualdad bit a bit. Los detalles de entrenamiento del codificador original (numero de tokens, composicion del dataset, alineacion multimodal, RLHF/DPO) se describen en el informe tecnico de Gemma, no en este repositorio.

## Capacidades

- Extraccion de caracteristicas de imagen: genera embeddings visuales a partir de imagenes mediante la torre de vision y el proyector.
- Salida en espacio de 5376 dimensiones: los embeddings resultantes son compatibles con la dimension oculta de Gemma 4 31B.
- Clasificacion con cabezas congeladas: los vectores sirven como entrada para clasificadores lineales o kNN sin reentrenar la torre.
- Vision por computador en modo frozen features: util para linear probing, adaptadores ligeros y fine-tuning parcial.
- Uso como componente de vision en un VLM propio: puede combinarse con un modelo de lenguaje de dimension 5376 para reconstruir un pipeline multimodal.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades de chat.
- No tiene tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No hay soporte multilingue documentado (no procesa texto).
- No se documenta modo thinking, audio ni video.

## Casos de uso

- Busqueda visual y retrieval multimodal: extraer embeddings de un catalogo de imagenes y de una consulta visual para construir indices vectoriales de similitud coseno. La torre de 569,5 millones de parametros es lo bastante ligera para indexar lotes grandes por GPU.
- Deduplicacion y clustering de datasets de imagenes: generar embeddings de un corpus y agruparlos con k-means o HDBSCAN para detectar imagenes duplicadas o casi duplicadas antes de entrenar otro modelo.
- Clasificacion de imagenes con linear probing: congelar la torre y entrenar una regresion logistica sobre los embeddings de 5376 dimensiones, aprovechando caracteristicas ya alineadas con el espacio de Gemma 4.
- Moderacion y filtrado de contenido visual: usar los embeddings como entrada a un clasificador binario o multiclase para cribar imagenes en un pipeline de ingestion de contenido.
- Inspeccion visual industrial y control de calidad: comparar embeddings de piezas contra una referencia mediante distancia, para detectar defectos o desviaciones en linea de produccion.
- Sistemas de recomendacion visual: vectorizar el historial de imagenes de un usuario y calcular vecinos cercanos para sugerir productos visualmente similares.
- Preprocesado para un VLM propio: reutilizar la torre y el proyector con un modelo de lenguaje de dimension 5376 para montar un asistente multimodal sin reentrenar el codificador visual.
- Investigacion en representaciones visuales: analisis de sesgos, robustez y transferibilidad de las caracteristicas de un codificador de frontera, con paridad bit a bit garantizada respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion documentado es una prueba de paridad que compara los 355 tensores de la torre y el lineal del proyector con el modelo padre mediante `torch.equal`, lo que confirma igualdad exacta de pesos, pero no aporta metricas de tarea (MMLU, HumanEval, GSM8K, ImageNet, COCO, etc.), que ademas no aplican a un extractor de caracteristicas sin cabeza de clasificacion.

| Prueba | Metodo | Resultado |
|---|---|---|
| Paridad de tensores de la torre | `torch.equal` sobre 355 tensores | Igualdad exacta con `google/gemma-4-31B-it` |
| Paridad del proyector | `torch.equal` sobre el `Linear(1152, 5376)` | Igualdad exacta con `google/gemma-4-31B-it` |
| Benchmarks de tarea | No realizados en este repositorio | No disponible |

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 1,14 GB solo para pesos (569,55 millones de parametros x 2 bytes), mas activaciones y memoria de imagenes.
- VRAM en FP32: aproximadamente 2,28 GB solo para pesos.
- Cabe en cualquier GPU de consumo con 4 GB o mas de VRAM: RTX 3050, RTX 3060, RTX 4060, RTX 4070, RTX 4090, e incluso en iGPU con memoria unificada.
- Ejecucion en CPU viable para lotes pequenos, dado el tamano reducido del modelo.
- GPUs de centro de datos (A100, H100, L40S) no son necesarias para inferencia, pero permiten procesar lotes muy grandes por segundo.
- Despliegue: libreria `transformers` (clase `Gemma4VisionModel` con `model_type: gemma4_vision`), carga directa de safetensors en BF16. El repositorio incluye `projector.py` como cargador del proyector y `examples/inference.py` como ejemplo de extraccion de caracteristicas.
- No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama; al no ser un modelo generativo, los formatos GGUF no estan previstos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa orientativa con otros codificadores visuales de uso comun para extraccion de caracteristicas. Los datos de los modelos alternativos son tamaños publicos aproximados y pueden variar segun la variante; se marcan como referencia y no proceden de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma4-31B-Vision (este repo) | 569,55 M | 5376 | Apache 2.0 | HuggingFace, transformers |
| SigLIP SO400M (referencia) | ~877 M | ~1152 | Apache 2.0 (segun variante) | HuggingFace |
| CLIP ViT-L/14 (referencia) | ~304 M (solo torre de vision) | 768 | MIT (segun variante) | HuggingFace |
| DINOv2 ViT-L/14 (referencia) | ~304 M | 1024 | Apache 2.0 | HuggingFace |

Diferencias clave: frente a CLIP y SigLIP, este repositorio no incluye torre de texto ni cabezas de contraste, por lo que no permite zero-shot classification directa con prompts de texto; su ventaja es la paridad exacta con el codificador de Gemma 4 31B y su integracion con el espacio de embeddings de 5376 dimensiones de ese modelo. Si se necesita una alternativa con encoder de texto emparejado, CLIP o SigLIP son opciones mas directas; si se busca un extractor puramente visual, cualquiera de los cuatro sirve. No se dispone de datos comparativos de rendimiento en tareas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace codigo ni matematicas. Cualquier uso de chat o generacion es inviable.
- Nombre potencialmente enganoso: el repositorio se llama "Gemma4-31B-Vision" pero contiene 569,55 millones de parametros, no 31.000 millones.
- Repositorio de terceros: no lo publica Google DeepMind, sino el usuario immanuelpeter. La trazabilidad depende del script de exportacion y del script de paridad enlazados.
- Cero descargas y cero likes en el momento de la consulta (descargas: 0, likes: 0), lo que implica ausencia de validacion por parte de la comunidad.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas concretas mas alla de la paridad de pesos.
- Sesgos: no evaluados en este repositorio. Los sesgos del codificador original de Gemma 4 se heredan integramente.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las representaciones pueden producir clasificaciones erroneas si se usan con cabezas mal calibradas.
- Limitacion de contexto e idioma: no procesa texto; la ventana efectiva depende de la resolucion de imagen y del numero de parches que admita la implementacion.
- Licencia: Apache 2.0, pero el `license_link` apunta a la licencia especifica de Gemma 4 en ai.google.dev. Conviene revisar los terminos de uso adicionales de Gemma antes de un despliegue comercial, ya que la licencia del modelo fuente puede imponer condiciones adicionales mas alla de Apache 2.0.
- Dependencia de la implementacion nativa de Transformers: requiere una version que soporte `gemma4_vision`; versiones antiguas de la libreria no cargaran el `config.json`.
- No hay soporte de cuantizacion publicado, por lo que el ahorro de memoria en produccion queda limitado a FP16/BF16 o a cuantizacion dinamica aplicada por el usuario bajo su propio riesgo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/immanuelpeter/Gemma4-31B-Vision
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia (Gemma 4): https://ai.google.dev/gemma/docs/gemma_4_license
- Informe tecnico citado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_parity.py
- Script de exportacion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_gemma4_vision.py

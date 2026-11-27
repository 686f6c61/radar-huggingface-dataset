# kindlingai/Qwen3-VL-Embedding-2B-exlr8-k4

## Resumen

Qwen3-VL-Embedding-2B-exlr8-k4 es una cuantizacion de 4 bits del modelo de embeddings multimodales Qwen/Qwen3-VL-Embedding-2B, publicada por el usuario kindlingai bajo el formato propietario exlr8-v2 (trellis K4). El modelo base, desarrollado por el equipo Qwen de Alibaba, convierte texto e imagenes en representaciones vectoriales densas con soporte de Matryoshka Representation Learning (dimensiones de 64 a 2048), lo que permite truncar el embedding segun el coste de almacenamiento o la latencia requerida.

El objetivo de esta version es reducir el peso en disco y el consumo de VRAM sin degradar de forma apreciable la calidad de recuperacion. Segun la model card, el checkpoint pasa de 4,26 GB en BF16 a 1,33 GB (3,21 veces menor), con una tasa efectiva de 4,99 bits por peso y una caida media de solo 0,0030 puntos en una bateria de 15 tareas de recuperacion (texto, multilingue, codigo, STS y documentos multimodales).

Es relevante para equipos que necesitan desplegar busqueda semantica multimodal en hardware modesto: el modelo base mantiene una pila de texto de 28 capas y una pila de vision de 24 bloques, y esta cuantizacion conserva la inyeccion de caracteristicas visuales DeepStack, el pooling de ultimo token y las dimensiones MRL. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pila de texto de 28 capas + pila de vision de 24 bloques ViT con DeepStack), cuantizada en formato exlr8-v2 trellis K4 |
| Parametros totales | 2.127.532.032 (625 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | exlr8-v2 K4 trellis (299 tensores), int4_g32 (1 tensor), FP8_ROW (1 tensor de vocabulario), BF16 copiado (323 tensores no 2D + 1 tabla pos_embed) |
| Idiomas soportados | No disponible de forma explicita; la calibracion cubre ingles y 14 idiomas multilingues |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (54 archivos alineados a 64 KiB, con checksums XXH64 y SHA-256) |

## Arquitectura y entrenamiento

El modelo base es un encoder multimodal con dos pilas: una pila de texto de 28 capas (hidden_size 2048, intermediate_size 6144, 16 cabezas de query y 8 de clave/valor, head_dim 128, QK-norm y M-RoPE 3D intercalado con factores [24, 20, 20]) y una pila de vision de 24 bloques (hidden_size 1024, intermediate_size 4096, 16 cabezas, patch_size 16, merge_size 2). Las caracteristicas visuales se inyectan en las capas 0, 1 y 2 del LLM mediante taps DeepStack en los bloques ViT 5, 11 y 17. El pooling es de ultimo token no padding seguido de normalizacion L2, con dimensiones Matryoshka de 64 a 2048.

La cuantizacion exlr8-v2 aplica trellis K4 con codebook FP8 E4M3 y busqueda de Viterbi resuelta con LDLQ contra Hessianos de calibracion multimodales reales. Los Hessianos se acumularon en FP64 con TF32 desactivado sobre 43 datasets publicos (10.237 filas, 4.469.304 tokens: prosa en ingles y 14 idiomas, 13 lenguajes de programacion, matematicas y razonamiento, JSON/HTML estructurado, 1.100 imagenes de documentos/UI/escenas y 1.000 pares imagen+texto). Se reservaron 660 filas held-out (278.886 tokens) estrictamente disjuntas. El resultado: 300 matrices lineales cuantizadas con mejora media de 4,12 veces en error held-out frente a la ablacion con Hessiano identidad, y cero regresiones.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica, similitud y clustering.
- Generacion de embeddings de imagen y de pares imagen+texto (multimodal).
- Representaciones Matryoshka truncables a 64, 128, 256, 512, 1024 o 2048 dimensiones sin reentrenar.
- Recuperacion multilingue (la calibracion cubre 14 idiomas ademas del ingles).
- Recuperacion sobre documentos, interfaces de usuario, escenas, graficos y tablas (hasta 1.280 tokens visuales por imagen).
- Soporte de codigo como dominio de embedding (13 lenguajes de programacion en calibracion).
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso por si mismo; su funcion es exclusivamente de extraccion de caracteristicas (feature-extraction).

## Casos de uso

- Busqueda semantica en produccion sobre corpus multilingues: el modelo genera embeddings de 2048 dimensiones (o truncados a 512/256) que se indexan en una base vectorial; la reduccion a 1,33 GB permite ejecutar el encoder en la misma maquina que el indice sin GPU dedicada de gama alta.
- Recuperacion de documentos escaneados y capturas de interfaz: al conservar la pila de vision y el pooling de ultimo token, permite indexar capturas de UI, PDFs renderizados y tablas junto al texto de consulta en un mismo espacio vectorial.
- Deduplicacion y clustering de imagenes a escala: con 4,41 veces menos VRAM que BF16 (2,61 GiB frente a 11,50 GiB en DGX Spark GB10), se pueden procesar lotes grandes en una sola GPU consumer.
- Filtrado previo (retrieval) en pipelines RAG: usar las dimensiones MRL de 256 o 512 para una primera fase de recuperacion rapida y reordenar con 2048 dimensiones, reduciendo el coste de almacenamiento del indice.
- Recomendacion de contenido visual: calcular similitud entre imagenes de catalogo y descripciones textuales de usuario para sugerir productos o articulos.
- Moderacion y clasificacion por similitud: comparar embeddings de nuevos contenidos contra un conjunto de referencia etiquetado, sin necesidad de un modelo generativo.
- Busqueda en bases de conocimiento internas con requisitos de latencia estrictos: la model card reporta una latencia p50 de 15,51 ms por elemento en inferencia nativa gr8, apta para servir consultas interactivas.

## Benchmarks y rendimiento

Resultados de la model card (15 tareas, pooling de ultimo token no padding + L2, min_pixels 4096, max_pixels 1310720). Se comparan el checkpoint calibrado liberado (k4-cal), la ablacion sin calibracion (k4-id) y la referencia BF16.

| Tarea | Categoria | Metrica | BF16 | k4-cal | Delta k4-cal | Solapamiento Top-10 |
|---|---|---|---:|---:|---:|---:|
| SciFact | Recuperacion de texto | nDCG@10 | 0,7549 | 0,7578 | +0,0029 | 91,7% |
| NFCorpus | Recuperacion de texto | nDCG@10 | 0,3724 | 0,3694 | -0,0030 | 88,3% |
| ArguAna | Recuperacion de texto | nDCG@10 | 0,5891 | 0,5949 | +0,0058 | 93,2% |
| XPQA Arabic | Recuperacion multilingue | nDCG@10 | 0,4868 | 0,4855 | -0,0012 | 86,8% |
| XPQA Chinese | Recuperacion multilingue | nDCG@10 | 0,6526 | 0,6449 | -0,0077 | 89,7% |

Metricas globales reportadas:

| Metrica | BF16 | exlr8 K4 | Delta |
|---|---:|---:|---:|
| Media de 15 tareas | 0,0000 (referencia) | -0,0030 | 89,1% de solapamiento Top-10 |
| Coseno held-out (660 filas, d2048) | 1,0000 | 0,9880 | 0,9906 texto / 0,9776 imagen / 0,9797 imagen+texto |
| Tamano en disco | 4,26 GB | 1,33 GB | 3,21 veces menor |
| Bits por peso efectivos | 16,00 | 4,99 | - |
| VRAM nativa gr8 (DGX Spark GB10) | 11,50 GiB | 2,61 GiB | 4,41 veces menor |
| Arranque en frio hasta /health | 176,1 s | 1,45 s | 27,6 a 121 veces mas rapido |
| Latencia p50 por elemento | 60,54 ms | 15,51 ms | 3,90 a 5,08 veces mas rapida |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,61 GiB en el runtime nativo gr8 (1.173 MiB de pesos + 1.154 MiB de workspace) segun la model card.
- GPU recomendadas: la model card cita DGX Spark GB10 como referencia de medida; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente, aunque no se han publicado pruebas en otras GPU.
- Cabe en GPU consumer: si, dado el peso de 1,33 GB en disco; se recomienda al menos 4 GB de VRAM para margen de trabajo.
- Opciones de despliegue: el formato exlr8-v2 requiere la libreria exlr8 (library_name del repo); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato cuantizado.
- Latencia y throughput: p50 de 15,51 ms por elemento en gr8 nativo (10,59 ms para consulta, 10,40 ms para texto crudo) y arranque en frio de 1,45 s hasta /health, medidos en DGX Spark GB10.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Qwen3-VL-Embedding-2B-exlr8-k4 | 2,13 B | No disponible | exlr8-v2 K4 (1,33 GB) | Apache 2.0 | Hugging Face (kindlingai) |
| Qwen/Qwen3-VL-Embedding-2B (BF16) | 2,13 B | No disponible | Safetensors BF16 (4,26 GB) | Apache 2.0 | Hugging Face (Qwen) |
| Otras cuantizaciones de Qwen3-VL-Embedding-2B | 2,13 B | No disponible | No disponible | Apache 2.0 (heredada) | No disponible |
| Alternativas de embedding multimodal de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card se corta en la tabla de benchmarks: faltan las filas restantes de las 15 tareas, por lo que la comparacion completa no esta disponible.
- El formato exlr8-v2 es propietario y depende de la libreria exlr8; no hay evidencia de soporte en ecosistemas estandar como vLLM, llama.cpp u Ollama.
- La calibracion solo se ha validado en el hardware citado (DGX Spark GB10) y no se han publicado mediciones de latencia en otras GPU.
- Al ser un modelo de embeddings, hereda los sesgos del corpus de entrenamiento de Qwen3-VL-Embedding-2B; no se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion no aplica en sentido generativo, pero la recuperacion puede devolver vecinos irrelevantes en dominios alejados de la calibracion (prosa, codigo, documentos, UI).
- La cuantizacion introduce una perdida media de 0,0030 puntos en nDCG@10 y reduce el solapamiento Top-10 al 89,1%; en tareas de recuperacion muy sensible puede ser preferible el checkpoint BF16.
- No se especifican los idiomas soportados de forma oficial; la cobertura multilingue se infiere de la calibracion (14 idiomas ademas del ingles), no de una evaluacion por idioma.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y de la libreria exlr8 por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/Qwen3-VL-Embedding-2B-exlr8-k4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Commit del modelo base referenciado: 9f2f7e710d6d81056aa5c0a4f04764fec6bb7bda
- Libreria exlr8: no disponible (no se proporciona URL en la informacion)
- Paper, blog o demo del formato exlr8-v2: no disponible

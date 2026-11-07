# Gramscii-IT/QueryTranslator-0.8B

## Resumen

QueryTranslator-0.8B es un adaptador LoRA sobre Qwen3.5-0.8B desarrollado por Gramscii-IT que reescribe una consulta de búsqueda en el idioma en el que están escritos los pasajes que se van a recuperar, entre italiano e inglés. Su propósito es alimentar índices léxicos (BM25) en escenarios de búsqueda híbrida multilingüe: la búsqueda semántica por embeddings y el reranker conservan las palabras originales del usuario porque entienden cualquier idioma, pero la coincidencia de términos solo funciona dentro de un mismo idioma, de modo que cada lengua de los pasajes requiere su propio índice léxico y una traducción de la consulta orientada a ese índice.

El modelo es una destilación: aprende las traducciones de un profesor 34 veces mayor, Qwen3.8-27B, y se evalúa por lo que la búsqueda encuentra después, no por la fidelidad literal a las traducciones del profesor. Según el autor, con este adaptador la búsqueda recupera tantos documentos y conjuntos de datos escritos en otro idioma como un modelo de 4.000 millones o de 35.000 millones de parámetros haciendo la misma tarea, con menor latencia por consulta (0,16 s frente a 0,23-0,41 s).

El adaptador pesa 21,7 MB en F16 y se carga sobre un único GGUF base Q8_0 de Qwen3.5-0.8B (833,6 MB) compartido con otros adaptadores de la misma familia (SemanticRepair-0.8B, ToolChooser-0.8B), lo que permite servir varios trabajos con un solo modelo base en memoria. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-0.8B); inferencia vía llama.cpp con `--lora` |
| Parametros totales | 10.822.656 (adaptador LoRA F16); el modelo base Qwen3.5-0.8B no se declara en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la configuración de despliegue recomendada (`-c 8192`) |
| Tipos de cuantizacion | Base en GGUF Q8_0; adaptador en GGUF F16; no se documentan otras cuantizaciones |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base Q8_0 + adaptador LoRA F16); no se publican safetensors del adaptador |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango bajo (21.671.008 bytes en F16) entrenado sobre Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. La tarea es de traducción de consultas con restricciones estrictas: mantener el significado completo (sujeto, medida, lugar, periodo y nombre), preservar literalmente nombres propios, códigos, acrónimos y números, y usar el vocabulario propio de los pasajes en el idioma destino. El adaptador se invoca con la plantilla de chat del modelo base, con el modo de razonamiento (thinking) desactivado, y recibe en el mensaje de sistema los nombres en inglés de los idiomas de origen y destino (`{source_language}`, `{output_language}`) junto con la consulta original.

El entrenamiento es una destilación del profesor Qwen3.8-27B: el adaptador aprende a reproducir sus traducciones de consultas de búsqueda. El conjunto de evaluación incluye 382 consultas retenidas (223 hacia italiano, 159 hacia inglés) traducidas por el profesor. El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; solo se indica la relación de destilación y el uso de LoRA. Una decisión de diseño destacable es que solo la búsqueda léxica consume la traducción: una traducción errónea puede añadir candidatos, pero nunca eliminar los que ya aportaba la consulta original.

## Capacidades

- Traducción de consultas de búsqueda entre italiano e inglés, preservando el significado y los elementos sensibles (nombres, códigos, acrónimos, cifras).
- Generación de una única línea de salida por consulta, sin responder a la pregunta ni copiar el texto original sin traducir.
- Integración en pipelines de búsqueda híbrida: la traducción alimenta el índice BM25 del idioma destino mientras la consulta original sigue alimentando la búsqueda por embeddings y el reranker.
- Soporte de plantilla de chat del modelo base (llama-server `--jinja`), con modo thinking desactivado.
- Multilingüismo limitado al par italiano-inglés; no se declaran capacidades para otras lenguas.
- No se declaran capacidades de tool calling, razonamiento multi-paso, agentes, visión ni audio.
- Carga conjunta con otros adaptadores sobre el mismo base, seleccionando la escala de cada uno por petición (`"lora": [{"id": 0, "scale": 1.0}, ...]`).

## Casos de uso

- Búsqueda documental multilingüe en bibliotecas: con un índice léxico por idioma, el adaptador traduce la consulta del usuario al idioma de los pasajes para que BM25 encuentre documentos que la búsqueda semántica sola no posiciona bien; en la evaluación del autor recupera 38 de 200 documentos frente a 23 sin traducción.
- Portales de datos abiertos: cuando el catálogo describe los conjuntos de datos en otro idioma, la traducción de la petición permite que el índice de términos ofrezca el dataset correcto; el autor reporta 16 de 33 frente a 14 sin traducción.
- RAG sobre corpus bilingües italiano-inglés: la consulta traducida amplía el conjunto de candidatos del recuperador léxico sin descartar los de la consulta original, lo que reduce los fallos por desajuste de idioma entre pregunta y documento.
- Servicio de recuperación de bajo coste y baja latencia: con 0,16 s por consulta en una A100 con llama.cpp, encaja en rutas de búsqueda interactivas donde un modelo de 4B o 35B añadiría entre 0,23 y 0,41 s por petición.
- Despliegue multi-tarea con un solo base: al compartir el GGUF Q8_0 de Qwen3.5-0.8B con SemanticRepair-0.8B y ToolChooser-0.8B, un mismo servidor puede atender traducción de consultas, desempate de rankings y selección de herramientas cargando adaptadores de 21,7 MB cada uno.
- Reproducibilidad de evaluaciones de recuperación: al fijarse por sha256 el base y el adaptador, un equipo puede congelar la versión exacta del traductor usada en sus métricas de búsqueda y repetir los experimentos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Traducciones evaluadas sobre 382 consultas retenidas; recuperación sobre 200 preguntas de biblioteca (100 en inglés sobre documentos italianos y 100 en italiano sobre documentos ingleses) y 33 peticiones de datos abiertos con descripciones en otro idioma.

| Tarea | Metrica | Valor |
|---|---|---|
| Traducción de consultas | Exact match con la traducción del profesor Qwen3.8-27B (%) | 33,2 |
| Traducción de consultas | Bien formada: una línea, cifras y códigos conservados, no copia la petición (%) | 100,0 |
| Traducción de consultas | F1 medio de palabras compartidas con el profesor (%) | 90,9 |
| Búsqueda en biblioteca entre idiomas | Recall@20 de documentos (%) | 19,0 |
| Búsqueda en biblioteca entre idiomas | MRR del documento | 0,103 |
| Búsqueda en datos abiertos entre idiomas | Recall del dataset respondiente (%) | 48,5 |
| Búsqueda en datos abiertos entre idiomas | MRR del dataset respondiente | 0,363 |

Comparativa de recuperación y latencia publicada por el autor (medición en una NVIDIA A100 64 GB con llama.cpp, una petición a la vez, mediana de 50 peticiones):

| Traductor | Documentos de biblioteca encontrados (de 200) | MRR | Datasets de datos abiertos encontrados (de 33) | MRR | Segundos por petición |
|---|---|---|---|---|---|
| Sin traducción, palabras del usuario | 23 | 0,056 | 14 | 0,333 | — |
| QueryTranslator-0.8B | 38 | 0,103 | 16 | 0,363 | 0,16 |
| Qwen3.5-4B ajustado por Gramscii | 37 | 0,096 | 16 | 0,358 | 0,23 |
| Qwen3.5-4B, thinking off | 36 | 0,100 | 16 | 0,358 | 0,33 |
| Qwen3.6-35B-A3B, thinking off (MoE, 3B activos) | 37 | 0,100 | 16 | 0,358 | 0,41 |
| Qwen3.5-0.8B sin adaptador | 25 | 0,067 | 14 | 0,347 | 0,11 |

## Requisitos de hardware

- VRAM estimada: el base Q8_0 ocupa 833.592.320 bytes (unos 0,83 GB) y el adaptador F16 21.671.008 bytes (unos 0,022 GB); con la caché KV para 8.192 tokens el consumo total se mantiene holgadamente por debajo de 2 GB en la configuración recomendada.
- GPU recomendadas: el autor mide en una NVIDIA A100 64 GB, pero el tamaño del modelo permite GPUs muy inferiores; cualquier GPU consumer con 2-4 GB de VRAM libre es suficiente para el base Q8_0 con contexto de 8.192.
- Cabe en GPU consumer: sí, en tarjetas de gama media y baja con al menos 2-4 GB de VRAM; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama-server de llama.cpp con `--lora` (comando documentado por el autor), `--jinja`, `-ngl 99`, `-c 8192`, `--no-context-shift` y `--cache-ram 0`. No se documentan recetas para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 0,16 s por consulta en A100 64 GB con llama.cpp, una petición a la vez, mediana de 50 peticiones, muestreo greedy. No se publican cifras de throughput en lote ni de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Documentos de biblioteca encontrados (de 200) | Datasets de datos abiertos encontrados (de 33) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QueryTranslator-0.8B | Adaptador de 10,8 M sobre base de 0,8B | 8.192 tokens (config. recomendada) | 38 | 16 | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-4B ajustado por Gramscii | 4B | no disponible | 37 | 16 | no disponible en la informacion | no disponible |
| Qwen3.5-4B, thinking off | 4B | no disponible | 36 | 16 | no disponible en la informacion | no disponible |
| Qwen3.6-35B-A3B, thinking off (MoE) | 35B totales, 3B activos | no disponible | 37 | 16 | no disponible en la informacion | no disponible |
| Qwen3.5-0.8B sin adaptador | 0,8B | no disponible | 25 | 14 | Apache-2.0 (heredada) | GGUF en Hugging Face |

## Limitaciones y advertencias

- Solo cubre el par italiano-inglés; no se declaran capacidades para otras lenguas y su uso fuera de ese par no está evaluado.
- La fidelidad literal al profesor es limitada: solo el 33,2 % de coincidencia exacta y F1 medio de 90,9 % en las 382 consultas retenidas; el diseño asume que una traducción imperfecta solo añade candidatos al índice léxico, pero no corrige errores de recuperación.
- Las métricas de recuperación son modestas en términos absolutos (recall@20 del 19 % en la búsqueda de biblioteca), aunque superan a las alternativas comparadas en la evaluación del autor.
- Todos los resultados de benchmarks están declarados por el autor y marcados como no verificados; no hay evaluación independiente publicada en la información disponible.
- La licencia Apache-2.0 se hereda del modelo base; el autor no documenta restricciones adicionales para uso comercial, pero conviene verificar la licencia del base Qwen3.5-0.8B en su repositorio original.
- El despliegue documentado depende de llama.cpp con soporte de LoRA y `--jinja`; no se ofrecen recetas para otros motores de inferencia.
- El adaptador requiere fijar por sha256 el base y el LoRA para garantizar reproducibilidad; el autor advierte explícitamente de este requisito en contextos de búsqueda.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto más allá de los 8.192 tokens de la configuración recomendada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gramscii-IT/QueryTranslator-0.8B
- Organización Gramscii-IT: https://huggingface.co/Gramscii-IT
- Adaptador hermano SemanticRepair-0.8B: https://huggingface.co/Gramscii-IT/SemanticRepair-0.8B
- Adaptador hermano ToolChooser-0.8B: https://huggingface.co/Gramscii-IT/ToolChooser-0.8B
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog o demo adicionales: no disponible

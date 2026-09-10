# Alexxerm/doslovno-weights

## Resumen

`Alexxerm/doslovno-weights` es un repositorio de redistribución de pesos, no un modelo entrenado. Su autor, Alexxerm, publica aquí copias de dos modelos de terceros en formato GGUF que la aplicación de escritorio «Дословно» (https://github.com/alexxerm/doslovno-desktop) descarga en su primera ejecución. El objetivo declarado en la model card es desacoplar la aplicación del repositorio original de esos modelos, de modo que la app no dependa de que terceros mantengan disponibles los mismos ficheros.

El contenido son dos artefactos independientes: `qwen2.5-7b-instruct-q4_k_m.gguf`, un transformer decoder-only denso de unos 7,6 mil millones de parámetros derivado de Qwen/Qwen2.5-7B-Instruct (licencia Apache 2.0), empleado por la aplicación para generar respuestas y veredictos; y `bge-m3-f16.gguf`, un encoder de retrieval de aproximadamente 568 millones de parámetros derivado de BAAI/bge-m3 (licencia MIT), usado para búsqueda semántica. El recuento de parámetros que HuggingFace reporta para el repositorio (566.703.104) corresponde al segundo componente.

La relevancia de esta ficha es limitada y hay que ser explícito al respecto: no hay entrenamiento propio, no hay innovación técnica, no hay benchmarks publicados y el repositorio acumula 0 descargas y 0 likes desde su creación el 10 de septiembre de 2026. Resulta útil únicamente como espejo de pesos GGUF ya cuantizados y como ejemplo de empaquetado de un stack local (LLM + modelo de embeddings) para una aplicación de escritorio sin conexión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Contenedor de dos modelos independientes: (1) transformer decoder-only denso con GQA (Qwen2.5-7B-Instruct); (2) encoder transformer basado en XLM-RoBERTa (bge-m3) para retrieval |
| Parámetros totales | 566.703.104 según el recuento safetensors de HuggingFace (coincide con bge-m3). El componente LLM ronda los 7,6 mil millones de parámetros según su ficha original; este repositorio no publica su recuento |
| Parámetros activos | no aplica: ninguno de los dos componentes es un modelo MoE |
| Longitud de contexto | no declarada en este repositorio. Según las fichas originales: 32.768 tokens nativos en Qwen2.5-7B-Instruct (ampliable a 131.072 con YaRN) y 8.192 tokens en bge-m3 |
| Tipos de cuantización | GGUF Q4_K_M para el LLM; GGUF F16 para el modelo de embeddings |
| Idiomas soportados | no declarados en este repositorio. Las fichas originales indican cobertura multilingüe (29 idiomas en Qwen2.5, más de 100 en bge-m3) |
| Licencia | Apache-2.0 declarada para el repositorio; los componentes conservan Apache-2.0 (Qwen2.5-7B-Instruct) y MIT (bge-m3) |
| Formato de pesos | GGUF en ambos ficheros. No se publican safetensors ni otros formatos |

Desglose de los ficheros incluidos:

| Fichero | Modelo de origen | Función en la aplicación | Licencia de origen |
|---|---|---|---|
| `qwen2.5-7b-instruct-q4_k_m.gguf` | Qwen/Qwen2.5-7B-Instruct | Generación de respuestas y veredictos | Apache 2.0 |
| `bge-m3-f16.gguf` | BAAI/bge-m3 | Búsqueda por significado (embeddings) | MIT |

Metadatos del repositorio: etiquetas `gguf`, `license:apache-2.0`, `endpoints_compatible`, `region:us`, `feature-extraction`; tamaño total 5,8 GB; pipeline declarado no disponible.

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento propios. El autor lo indica sin ambigüedad en la model card: «Ничего своего здесь нет» («aquí no hay nada propio»); son compilaciones ya existentes de modelos ajenos, reempaquetadas para que la aplicación no dependa de repositorios de terceros. Por tanto, cualquier afirmación sobre datos de entrenamiento, número de tokens, composición del dataset o fases de RLHF/DPO pertenece a las fichas de Qwen2.5-7B-Instruct y de bge-m3, no a este repositorio, que no documenta nada de ello.

Lo único reseñable técnicamente es la decisión de empaquetado: un LLM de ~7,6B cuantizado a Q4_K_M (4 bits por peso con escalas K-quant mixtas) para mantener el consumo de VRAM en el rango de GPU de consumo, junto con un encoder de retrieval en F16 para preservar la calidad de los embeddings, que es mucho más sensible a la cuantización que la generación de texto. El tándem —generación con Qwen2.5 y búsqueda semántica con bge-m3— es un patrón habitual de RAG local; bge-m3 aporta además recuperación híbrida (dense, sparse y multi-vector estilo ColBERT), lo que permite combinar similitud semántica con coincidencia léxica sobre el mismo índice.

## Capacidades

Las capacidades son las de los dos modelos subyacentes, no las de este repositorio:

- Generación de texto conversacional, resumen, reescritura y clasificación con Qwen2.5-7B-Instruct, con buen comportamiento en instrucciones en ruso y otras lenguas europeas.
- Razonamiento de varios pasos y matemáticas básicas dentro del rango habitual de un modelo de 7B (sin datos verificables en este repositorio).
- Generación y explicación de código, con soporte de relleno y completado de fragmentos según su ficha original.
- Tool calling y function calling estructurado (JSON), una de las mejoras destacadas de la familia Qwen2.5.
- Embeddings de retrieval multilingües con bge-m3, con secuencias de hasta 8.192 tokens y 1.024 dimensiones en su vector denso.
- Recuperación híbrida: vector denso, pesos léxicos dispersos y multi-vector, útil para reranking y para consultas con términos exactos.
- Procesamiento por lotes de documentos largos con bge-m3, lo que permite indexar corpus completos sin troceado agresivo.
- No hay capacidades multimodales (ni visión ni audio) en ninguno de los dos componentes. La model card no menciona modo de razonamiento extendido ni decodificación especulativa.

## Casos de uso

- Búsqueda semántica local sobre documentos personales: bge-m3 indexa el corpus una sola vez y permite consultas por significado en más de 100 idiomas, sin enviar datos a servicios externos, algo crítico para despachos profesionales o investigación clínica.
- Asistente de escritorio sin conexión: Qwen2.5-7B-Instruct a Q4_K_M responde dentro de una ventana de 32.768 tokens, suficiente para mantener contexto de conversación amplio en una única GPU de consumo.
- Comparación de texto dictado frente a texto transcrito: el LLM puede emitir veredictos de coincidencia o discrepancia sobre pares de fragmentos, que es exactamente el uso que le da la aplicación que distribuye estos pesos.
- RAG de documentación técnica: recuperación híbrida con bge-m3 (semántica más coincidencia léxica de identificadores y nombres de API) y redacción de la respuesta final con el LLM.
- Clasificación y enrutado de tickets de soporte: embeddings de bge-m3 para asignar categoría por similitud con ejemplos previos y Qwen2.5 para redactar la respuesta sugerida al operador.
- Deduplicación y agrupación de corpus: los vectores de bge-m3 permiten detectar documentos casi idénticos con umbrales de similitud coseno antes de entrenar o de construir un índice.
- Extracción estructurada de datos: Qwen2.5-7B-Instruct puede devolver JSON con los campos solicitados a partir de texto libre, integrándose en un pipeline por lotes con validación posterior.
- Resumen multilingüe de actas o transcripciones: la combinación de embeddings para localizar los pasajes relevantes y generación en la lengua de destino cubre flujos de trabajo en varias lenguas dentro de la misma organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye ninguna tabla de evaluación y la búsqueda web realizada no devolvió documentación técnica asociada (solo páginas corporativas de Microsoft, sin relación con el modelo). Las cifras que pudieran citarse de MMLU, HumanEval, GSM8K o MTEB pertenecerían a las fichas de Qwen2.5-7B-Instruct y bge-m3, no a esta redistribución, y no se reproducen aquí para no atribuir a este repositorio datos que no ha verificado.

## Requisitos de hardware

Estimaciones derivadas del tamaño de los ficheros y del número de parámetros; no hay mediciones publicadas por el autor:

- Tamaño en disco: 5,8 GB en total (unos 4,7 GB para el LLM en Q4_K_M y alrededor de 1,1 GB para el encoder en F16).
- VRAM para el LLM: aproximadamente 5,5-6,5 GB con ventana de 8.192 tokens y caché KV en FP16; en torno a 7-8 GB si se lleva el contexto hasta 32.768 tokens.
- VRAM para los embeddings: unos 2 GB con lotes moderados, dado que los pesos en F16 ocupan ~1,1 GB y el resto lo consume el encoder de secuencias largas.
- Ejecución conjunta de ambos componentes: 8-10 GB de VRAM, por lo que cabe en una RTX 3060 de 12 GB, una RTX 4070, una RTX 4060 Ti de 16 GB o un equipo Apple Silicon con 16 GB de memoria unificada.
- GPU profesionales: el conjunto es pequeño para una A100 o una H100; una NVIDIA L4 o A10G ya lo sirve con holgura y a menor coste.
- Despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las rutas naturales para GGUF. Para los embeddings, llama.cpp expone el encoder vía servidor de embeddings, y text-embeddings-inference puede servir bge-m3 si se dispone de los pesos en safetensors. vLLM y TGI tienen soporte de GGUF experimental o parcial, por lo que no son la vía recomendada aquí.
- Latencia y throughput: no disponibles. No hay ninguna medición de tokens por segundo ni de latencia de embedding publicada en este repositorio.

## Comparativa con modelos similares

Componente generativo (modelos de ~7-8B cuantizados a 4 bits):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (este repo, Q4_K_M) | ~7,6B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | sí, en este repositorio y en el oficial |
| Llama-3.1-8B-Instruct | ~8,0B | 128.000 | Llama 3.1 Community License | sí |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | sí |

Componente de embeddings:

| Modelo | Parámetros | Longitud máxima | Idiomas | Licencia |
|---|---|---|---|---|
| bge-m3 (este repo, F16) | ~568M | 8.192 tokens | más de 100 | MIT |
| multilingual-e5-large | ~560M | 512 tokens | más de 90 | MIT |
| paraphrase-multilingual-mpnet-base-v2 | ~278M | 128 tokens | más de 50 | Apache 2.0 |

La ventaja diferencial de esta combinación frente a las alternativas es la licencia: tanto Apache 2.0 como MIT permiten uso comercial sin cláusulas de restricción por número de usuarios, a diferencia de la licencia comunitaria de Llama 3.1. Las cifras de los modelos comparados proceden de sus fichas públicas y no se han verificado en esta búsqueda.

## Limitaciones y advertencias

- No es un modelo, es un espejo de pesos ajenos. No hay entrenamiento, ajuste, evaluación ni mantenimiento propios; la autoría intelectual corresponde a Alibaba (Qwen2.5) y a BAAI (bge-m3).
- La licencia Apache-2.0 declarada en el repositorio no sustituye a las de los componentes: bge-m3 es MIT y exige conservar el aviso de copyright, y Qwen2.5-7B-Instruct obliga a mantener la atribución de Apache 2.0. Conviene revisar ambas antes de redistribuir el conjunto.
- El repositorio acumula 0 descargas y 0 likes y fue creado y actualizado el mismo día (10 de septiembre de 2026). No hay historial de mantenimiento que garantice que los ficheros vayan a actualizarse.
- La model card está redactada íntegramente en ruso y no incluye instrucciones de uso, ejemplos de prompt, ni parámetros de generación recomendados.
- Existe una inconsistencia de metadatos: HuggingFace reporta 566.703.104 parámetros vía safetensors, cifra que corresponde al encoder de embeddings, mientras que el componente principal del repositorio es un LLM de ~7,6B en GGUF. No debe tomarse ese número como tamaño del conjunto.
- No hay benchmarks, ni evaluación de sesgos, ni documentación de tasas de alucinación para ninguno de los dos componentes en este repositorio. Un modelo de 7B cuantizado a 4 bits es propenso a inventar datos en tareas factuales y a degradarse en matemáticas y código de precisión.
- La cuantización Q4_K_M introduce pérdida de calidad respecto al modelo original en FP16, especialmente en tareas de razonamiento largo y en idiomas de bajos recursos.
- El contexto efectivo está limitado por la configuración del servidor de inferencia: usar 32.768 tokens exige ajustar el tamaño de la caché KV y dispara el consumo de VRAM.
- No hay soporte multimodal ni de audio; si el flujo de trabajo requiere transcripción, hace falta un componente adicional de ASR que no está incluido.
- El repositorio está pensado como dependencia interna de una aplicación concreta. Reutilizarlo en producción implica asumir el coste de verificar la integridad de los ficheros GGUF descargados de un tercero y de fijar versiones por hash.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Alexxerm/doslovno-weights
- Aplicación de escritorio que consume estos pesos: https://github.com/alexxerm/doslovno-desktop
- Modelo de origen del componente generativo: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo de origen del componente de embeddings: https://huggingface.co/BAAI/bge-m3

La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos correspondían a páginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, en.wikipedia.org/wiki/Microsoft) sin relación alguna con el repositorio. Por tanto, no hay papers, blogs técnicos ni demos adicionales que enlazar.

# akal-lm/Akal-Rerank-GGUF

## Resumen

Akal-Rerank-GGUF es un reranker del tipo cross-encoder desarrollado por la iniciativa Akal LM (organización `akal-lm`, investigador principal Muhammad Luqni Baehaqi) y publicado bajo licencia Apache 2.0. Se trata de una conversión a formato GGUF del modelo base `madebyaris/rerank-indonesia`, un clasificador de secuencias basado en XLM-RoBERTa de 12 capas y 118 millones de parámetros, orientado a la segunda etapa de filtrado en pipelines de generación aumentada por recuperación (RAG). Su propuesta diferencial es ejecutarse íntegramente en CPU sin GPU, con una huella en disco de 119 MB (cuantización Q4_K_M) y un consumo máximo de RAM de unos 550 MB, lo que lo hace apto para despliegues en el borde (edge) y entornos sin acelerador.

El modelo incorpora una matriz de importancia (importance matrix, `imatrix_rerank_indo_id.dat`) calibrada sobre pares consulta-pasaje en indonesio, que según la model card reduce el tamaño en disco un 73,5 % frente a los pesos FP32 de PyTorch, recorta el pico de RAM hasta un 53,9 % y acelera el arranque en frío 3,35 veces, manteniendo una correlación de Pearson de 0,9993–0,9999 con los logits en FP32. Además de reordenar candidatos, el modelo se presenta como una "puerta de abstención epistémica": si la puntuación máxima del cross-encoder cae por debajo de un umbral (τ = 4,48 en Q4_K_M), el sistema puede descartar la consulta como no respondible antes de invocar al generador LLM.

Su relevancia actual radica en que cubre un hueco concreto: rerankers de muy bajo coste computacional para RAG en indonesio e inglés que funcionan en hardware modesto, con métricas publicadas de abstención (AUROC 99,85 %) y de reordenación (MRR@10 del 100 % en el conjunto de evaluación propio). El contexto de este modelo es el de una familia de componentes encadenados (retriever `Akal-Embed-GGUF` y generador `Akal-1B-GGUF`) pensada para despliegues offline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder XLM-RoBERTa (clasificador de secuencias, 12 capas), pooling `RANK` |
| Parámetros totales | 117.640.321 (118 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (con imatrix en indonesio) y Q8_0 |
| Idiomas soportados | Indonesio (id) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también existen pesos PyTorch FP32 del modelo base) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa de 12 capas y 118 millones de parámetros, configurado como clasificador de secuencias con pooling de tipo `RANK`. A diferencia de los bi-encoders, procesa conjuntamente el par (consulta, pasaje) mediante atención cruzada token a token, lo que permite resolver distinciones finas entre documentos con vocabulario casi idéntico (por ejemplo, procedimientos operativos con nombres muy similares). El modelo base es `madebyaris/rerank-indonesia`; la model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset original, aunque sí indica que la conversión GGUF se calibró con una matriz de importancia contrastiva específica para indonesio (`imatrix_rerank_indo_id.dat`).

La innovación técnica principal no está en el entrenamiento sino en la cuantización: el uso de una importance matrix calibrada sobre pares consulta-pasaje en indonesio permite cuantizar a Q4_K_M preservando la fidelidad de los logits (correlación de Pearson de 0,999301 frente a FP32 y 100 % de acuerdo en el Top-1). No se menciona en la información disponible el uso de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo de ranking y no generativo.

## Capacidades

- Reordenación (reranking) de pares consulta-pasaje mediante puntuación cruzada, para segunda etapa de filtrado en pipelines RAG.
- Puntuación de relevancia calibrada que permite umbralizar y actuar como puerta de abstención epistémica antes de invocar al LLM generador.
- Discriminación de near-duplicates: resuelve diferencias sutiles entre documentos con vocabulario casi idéntico gracias a la atención cruzada.
- Capacidades multilingües limitadas a indonesio e inglés.
- Inferencia en CPU pura mediante llama.cpp, sin necesidad de GPU.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso.

## Casos de uso

- Filtrado de segunda etapa en RAG empresarial en indonesio: tras recuperar el Top-10 con un bi-encoder como `Akal-Embed-Indo`, el cross-encoder reordena los candidatos y eleva el Hit@1 del 96,36 % al 100 % en el benchmark propio del autor, resolviendo confusiones entre documentos casi idénticos.
- Puerta de abstención antes del generador: evaluando si la puntuación máxima supera el umbral τ = 4,48, el sistema intercepta consultas fuera de dominio o con premisas falsas (AUROC del 99,85 %) y evita que el LLM genere respuestas alucinadas, ahorrando además coste de inferencia.
- Despliegue en el borde sin GPU: con 119 MB en disco y unos 550 MB de pico de RAM, cabe en dispositivos de bajo consumo, intranets aisladas o portátiles modestos, donde un reranker basado en GPU no sería viable.
- Búsqueda documental interna en organismos con corpus en indonesio e inglés: procedimientos operativos, manuales y normativa donde las consultas requieren distinguir entre documentos con títulos y contenido muy parecidos.
- Asistencia offline en campo: aplicaciones de consulta de manuales técnicos en entornos sin conectividad, ejecutando el pipeline completo (retriever, reranker y generador de 1B) en CPU local.
- Evaluación y monitorización de calidad de recuperación: el modelo puede usarse como juez de relevancia para medir y depurar pipelines de búsqueda existentes, comparando sus puntuaciones con las de otras etapas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un Intel Core i5-8250U con 4 hilos y CPU pura. El primer conjunto es un benchmark propio en indonesio: 65 documentos multdominio (25 near-duplicates), 67 consultas (55 respondibles y 12 trampa), reordenando el Top-10 de `Akal-Embed-Indo Q4_K_M`.

| Variante | Formato / precisión | Disco | Pico de RAM | Hit@1 (etapa 1 → etapa 2) | MRR@10 | AUROC abstención | Pearson vs FP32 |
|---|---|---|---|---|---|---|---|
| Bi-encoder solo (etapa 1) | Q4_K_M | 119,0 MB | 515,8 MB | 96,36 % | 98,18 % | 86,97 % | — |
| Akal-Rerank-Indo Q4_K_M | GGUF Q4_K_M + imatrix | 119,1 MB | 550,3 MB | 96,36 % → 100,0 % | 100,0 % | 99,85 % | 0,999301 |
| Akal-Rerank-Indo Q8_0 | GGUF Q8_0 | 126,4 MB | 547,1 MB | 96,36 % → 100,0 % | 100,0 % | 99,70 % | 0,999962 |
| rerank-indonesia sin calibrar | GGUF Q4_K_M sin imatrix | 119,1 MB | 550,3 MB | 96,36 % → 100,0 % | 100,0 % | 99,70 % | 0,998995 |
| rerank-indonesia base | PyTorch FP32 | 448,8 MB | 942,6 MB | 96,36 % → 100,0 % | 100,0 % | 99,70 % | 1,000000 |

El segundo conjunto corresponde a MIRACL indonesio (`mteb/MIRACLReranking`, split dev): 150 consultas de Wikipedia por Top-20 candidatos (3.000 pares, 362.963 tokens). La información disponible en la model card está truncada, por lo que solo se recogen los datos de la etapa 1: Hit@1 del 60,00 %, Hit@3 del 80,67 %, MRR@10 del 70,51 % y nDCG@10 del 60,44 %. Los resultados de las variantes de Akal-Rerank en este benchmark no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU. Pico de RAM medido de 550,3 MB (Q4_K_M) y 547,1 MB (Q8_0) con llama.cpp.
- GPU recomendadas: ninguna; el modelo está diseñado para CPU. No se han publicado requisitos de GPU.
- Cabe en cualquier equipo de consumo: el tamaño de 119–126 MB en disco y ~550 MB de RAM permiten ejecutarlo en portátiles, mini-PC y dispositivos de borde.
- Opciones de despliegue: llama.cpp (referencia principal), y por extensión los runners compatibles con GGUF, como Ollama. El repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: la model card cita un arranque en frío de 2,21 s frente a 7,41 s en FP32 (3,35 veces más rápido) en un i5-8250U con 4 hilos. No se detallan cifras de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Akal-Rerank-GGUF | 118 M | No disponible | id, en | Apache 2.0 | GGUF (Q4_K_M, Q8_0) | Reranker CPU con puerta de abstención calibrada |
| madebyaris/rerank-indonesia | 118 M | No disponible | id | No disponible | PyTorch FP32 | Modelo base sin cuantizar; ~449 MB en disco |
| mMiniLMv2-L12-mMARCO | No disponible | No disponible | Multilingüe | No disponible | GGUF Q4_K_M + imatrix | Usado como referencia en el benchmark del autor; resultados equivalentes en Hit@1/MRR |

La comparativa con otros rerankers de la misma categoría (por ejemplo, `bge-reranker-base` o `jina-reranker`) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida a indonesio e inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Los benchmarks publicados proceden del propio autor y de conjuntos de evaluación pequeños (67 consultas en el benchmark propio, 150 en MIRACL), por lo que deben interpretarse con cautela.
- La longitud máxima de contexto no se especifica en la información disponible; conviene verificar el límite de tokens del modelo base antes de usarlo con pasajes largos.
- El umbral de abstención (τ = 4,48 para Q4_K_M, τ = 4,98 para Q8_0) está calibrado sobre el corpus del autor; en dominios distintos requerirá recalibración para mantener la tasa de falsos rechazos bajo control.
- Riesgo de alucinación no aplica directamente al ser un modelo de ranking, pero una calibración incorrecta del umbral puede provocar rechazos indebidos de consultas válidas o aceptación de consultas no respondibles.
- No se documentan sesgos específicos del modelo base ni del proceso de cuantización en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `madebyaris/rerank-indonesia`, cuya licencia no se detalla en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akal-lm/Akal-Rerank-GGUF
- Modelo base: https://huggingface.co/madebyaris/rerank-indonesia
- Retriever complementario (etapa 1): https://huggingface.co/akal-lm/Akal-Embed-GGUF
- Generador complementario: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Preprint de investigación (Vol. 3, CC-BY 4.0): https://huggingface.co/akal-lm/Akal-Rerank-GGUF/resolve/main/Akal_Vol3_Architecture_Research_Paper.pdf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/luqni

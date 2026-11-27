# akal-lm/Akal-Rerank-GGUF

## Resumen

Akal-Rerank-GGUF es un reranker de tipo cross-encoder cuantizado en formato GGUF, desarrollado por Muhammad Luqni Baehaqi dentro de la iniciativa Akal LM (`akal-lm`). Se construye sobre el modelo base `madebyaris/rerank-indonesia`, un clasificador de secuencias XLM-RoBERTa de 12 capas y 118 millones de parametros, y se distribuye con licencia Apache 2.0. Su proposito es actuar como segunda etapa de precision en pipelines de Retrieval-Augmented Generation (RAG) que corren sobre CPUs sin GPU, y ademas como puerta de abstención epistémica antes de invocar al generador LLM.

El modelo resuelve dos problemas concretos del RAG en produccion: la desambiguacion de documentos casi duplicados que un bi-encoder no distingue por similitud coseno, y la deteccion de consultas no respondibles o con premisas falsas. Para ello emplea una matriz de importancia contrastiva especifica para indonesio (`imatrix_rerank_indo_id.dat`) que guia la cuantizacion y preserva la correlacion de logits con FP32 en el rango 0.9993-0.9999.

Con 117.640.321 parametros totales y un tamano de repositorio de 0.3 GB, el modelo ofrece una huella de 119 MB en Q4_K_M y 126 MB en Q8_0, lo que lo hace viable en entornos de borde y en despliegues offline. Esta pensado para el par de idiomas indonesio-ingles, aunque su arquitectura XLM-RoBERTa subyacente es multilingue. Su relevancia actual radica en que demuestra que un reranker de calidad utilizable en produccion cabe en una fraccion minima de RAM y se ejecuta en CPU con latencias de pocos segundos en frio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder XLM-RoBERTa de 12 capas, pooling=RANK (sequence classification) |
| Parametros totales | 117.640.321 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (con imatrix de indonesio) y Q8_0 |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa, con 12 capas y 118 millones de parametros, configurado como clasificador de secuencias con `pooling=RANK`. A diferencia de un bi-encoder, procesa conjuntamente el par `(query, passage)` mediante atencion cruzada token a token, lo que le permite resolver distinciones factuales finas entre documentos con vocabulario casi identico. El modelo base es `madebyaris/rerank-indonesia`, y la variante GGUF se ha calibrado con una matriz de importancia contrastiva especifica para indonesio (`imatrix_rerank_indo_id.dat`) durante el proceso de cuantizacion.

El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; el modelo base es un clasificador supervisado de ranking. La innovacion tecnica destacable es el uso de la matriz de importancia para cuantizar a Q4_K_M preservando una correlacion de Pearson de logits frente a FP32 de 0.999301, con una reduccion del 73.5% en tamano en disco, una reduccion de hasta el 53.9% en RAM pico (550 MB frente a 1.209 MB en PyTorch FP32) y una aceleracion de 3.35x en arranque en frio por CLI (2.21 s frente a 7.41 s).

## Capacidades

- Reranking de pares `(query, passage)` mediante cross-attention, con puntuacion de logits por par.
- Filtrado de precision en segunda etapa sobre candidatos recuperados por un bi-encoder (por ejemplo, `akal-lm/Akal-Embed-GGUF`).
- Abstención epistémica: evaluacion del maximo logit de reranking frente a un umbral tau para interceptar consultas no respondibles o con premisa falsa antes de invocar al LLM generador.
- Resolucion de near-duplicates y confusores de vocabulario casi identico.
- Inferencia en CPU pura sin GPU, mediante llama.cpp.
- Soporte de idiomas indonesio e ingles; la arquitectura XLM-RoBERTa subyacente es multilingue, aunque la calibracion imatrix es especifica para indonesio.
- Integracion como etapa de ranking en pipelines RAG; no es un modelo generativo ni soporta tool calling ni razonamiento multi-paso por si mismo.

## Casos de uso

- RAG empresarial en indonesio sobre CPU sin GPU: el modelo actua como etapa 2 tras un bi-encoder, reordenando el Top-10 de candidatos y elevando el Hit@1 del 96.36% al 100% en el benchmark interno del autor, con 119 MB de huella y 550 MB de RAM pico.
- Puerta de abstención antes del generador: con un umbral tau=4.48 (Q4_K_M) o tau=4.98 (Q8_0), el sistema intercepta consultas fuera de dominio o con premisas falsas con un AUROC de 99.85%, evitando que el LLM genere respuestas alucinadas.
- Desambiguacion de procedimientos operativos: en documentacion con SOPs casi identicos (por ejemplo, "Pencucian Kasur Harian Pad Merah" frente a "Pemolesan Akhir Pad Putih"), el cross-encoder resuelve la distincion token a token que la similitud coseno no captura.
- Busqueda documental en borde o entornos air-gapped: al ejecutarse con llama.cpp en CPU y pesar 119-126 MB, se puede desplegar en dispositivos de borde, portatiles modestos o servidores sin acelerador.
- Filtrado de candidatos en motores de busqueda interna: integrado como etapa de reranking sobre resultados de un retriever denso, mejora el MRR@10 del 98.18% al 100% en el benchmark interno del autor.
- Evaluacion de calidad de recuperacion en pipelines MIRACL indonesio: el modelo se ha validado sobre 150 consultas de Wikipedia en indonesio con Top-20 candidatos (3.000 pares query-passage, 362.963 tokens), lo que lo hace util para tareas de evaluacion y ajuste de umbrales en produccion.

## Benchmarks y rendimiento

Resultados del benchmark interno de dominio indonesio del autor (Intel Core i5-8250U, 4 hilos, CPU pura; 65 documentos, 67 consultas con 12 trampas no respondibles, Top-10 de `Akal-Embed-Indo Q4_K_M`):

| Variante | Formato / precision | Tamano disco | RAM pico | Hit@1 (etapa 1 -> etapa 2) | MRR@10 | AUROC abstención | Bal. Acc abstención | Pearson vs FP32 |
|---|---|---|---|---|---|---|---|---|
| Solo bi-encoder (etapa 1) | Akal-Embed-Indo Q4_K_M | 119.0 MB | 515.8 MB | 96.36% | 98.18% | 86.97% | 87.12% | — |
| Akal-Rerank-Indo Q4_K_M | GGUF Q4_K_M + imatrix ID | 119.1 MB | 550.3 MB | 96.36% -> 100.0% | 100.0% | 99.85% | 99.09% (tau=4.48) | 0.999301 |
| Akal-Rerank-Indo Q8_0 | GGUF Q8_0 | 126.4 MB | 547.1 MB | 96.36% -> 100.0% | 100.0% | 99.70% | 98.18% (tau=4.98) | 0.999962 |
| rerank-indonesia sin calibrar | GGUF Q4_K_M sin imatrix | 119.1 MB | 550.3 MB | 96.36% -> 100.0% | 100.0% | 99.70% | 98.18% | 0.998995 |
| rerank-indonesia referencia | PyTorch FP32 | 448.8 MB | 942.6 MB | 96.36% -> 100.0% | 100.0% | 99.70% | 98.18% | 1.000000 |
| mMiniLMv2-L12-mMARCO | GGUF Q4_K_M + imatrix ID | 119.1 MB | 550.2 MB | 96.36% -> 100.0% | 100.0% | 99.85% | 99.09% | 0.998901 |

Resultados en MIRACL indonesio (`mteb/MIRACLReranking` split `id` dev; 150 consultas Wikipedia, Top-20 candidatos, 3.000 pares, 362.963 tokens):

| Variante | Tamano disco | RAM pico (RSS) | Hit@1 (etapa 1 -> etapa 2) | Hit@3 | MRR@10 | nDCG@10 | Pearson vs FP32 |
|---|---|---|---|---|---|---|---|
| Solo bi-encoder (etapa 1) | 119.0 MB | 515.8 MB | 60.00% | 80.67% | 70.51% | 60.44% | — |

Los datos de la tabla MIRACL para las variantes del reranker no estan completos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta disenado para inferencia en CPU; en GPU la huella seria marginal dado su tamano.
- RAM pico medida: 550.3 MB en Q4_K_M y 547.1 MB en Q8_0 (frente a 942.6 MB en PyTorch FP32).
- GPU recomendadas: no requeridas; cualquier GPU consumer puede alojarlo, pero el diseno apunta a CPU.
- Cabe en cualquier consumer GPU y en practicamente cualquier CPU moderna; el benchmark de referencia se ejecuto en un Intel Core i5-8250U con 4 hilos.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), con integracion via CLI o libreria; no se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: arranque en frio por CLI de 2.21 s en Q4_K_M frente a 7.41 s en PyTorch FP32 (aceleracion de 3.35x); el throughput concreto no esta disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Akal-Rerank-GGUF (este modelo) | 117.640.321 | No disponible | GGUF Q4_K_M / Q8_0 | Apache 2.0 | Cross-encoder CPU, indonesio/ingles, con abstención calibrada |
| madebyaris/rerank-indonesia (base) | 118M | No disponible | PyTorch FP32 | No disponible | Cross-encoder XLM-RoBERTa sin cuantizar |
| mMiniLMv2-L12-mMARCO | No disponible | No disponible | GGUF Q4_K_M + imatrix | No disponible | Cross-encoder multilingue comparado en el benchmark del autor |
| Akal-Embed-GGUF (etapa 1) | No disponible | No disponible | GGUF | No disponible | Bi-encoder denso de 384 dimensiones, recuperacion sub-15 ms |

## Limitaciones y advertencias

- El modelo esta calibrado especificamente para indonesio; su rendimiento en otros idiomas, aunque la arquitectura XLM-RoBERTa sea multilingue, no esta validado en la informacion disponible.
- Los benchmarks presentados son internos del autor y de escala reducida (65 documentos y 67 consultas en el benchmark de dominio; 150 consultas en MIRACL); no deben extrapolarse sin validacion propia.
- El umbral de abstención (tau=4.48 en Q4_K_M, tau=4.98 en Q8_0) esta calibrado para el benchmark del autor y requiere reajuste en dominios distintos.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de ranking, pero su uso como puerta de abstención depende de la calibracion del umbral; un tau mal ajustado puede dejar pasar consultas no respondibles o bloquear consultas validas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `madebyaris/rerank-indonesia` debe verificarse por separado; su licencia no consta en la informacion disponible.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso por si mismo; debe combinarse con un retriever y un generador.
- La longitud de contexto no esta documentada; para pasajes largos conviene validar el truncamiento antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akal-lm/Akal-Rerank-GGUF
- Modelo base: https://huggingface.co/madebyaris/rerank-indonesia
- Retriever etapa 1: https://huggingface.co/akal-lm/Akal-Embed-GGUF
- Generador LLM complementario: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Preprint de investigacion (Vol. 3, CC-BY 4.0): https://huggingface.co/akal-lm/Akal-Rerank-GGUF/resolve/main/Akal_Vol3_Architecture_Research_Paper.pdf
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/luqni

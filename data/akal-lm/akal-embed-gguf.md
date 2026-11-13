# akal-lm/Akal-Embed-GGUF

## Resumen

Akal-Embed-GGUF es la edición en formato GGUF de Akal-Embed-Indo, un modelo de embeddings densos de texto desarrollado por Muhammad Luqni Baehaqi dentro de la iniciativa Akal LM (`akal-lm`). Está diseñado específicamente para RAG (Retrieval-Augmented Generation) en CPUs sin GPU, es decir, para despliegues en el borde (edge) donde no hay acelerador gráfico disponible. Se construye como un fine-tune del modelo `LazarusNLP/all-indo-e5-small-v4`, con una arquitectura híbrida `BertModel` + tokenizador `XLMRobertaTokenizer` de 118 millones de parámetros y 384 dimensiones de embedding.

La propuesta principal es la cuantización calibrada mediante una importance matrix específica para RAG en indonesio (`imatrix_indo_e5_id.dat`), que permite comprimir el modelo a Q4_K_M en 119 MB manteniendo una fidelidad coseno de 0,9934 frente al original en FP32. El autor reporta una reducción del 74,7 % en tamaño en disco y del 42,7 % en RAM frente al modelo PyTorch FP32, con una latencia de consulta de 14,60 ms en un Intel Core i5-8250U a 4 hilos.

El modelo está pensado para el par de idiomas indonesio-inglés, incluida la recuperación cruzada inglés a indonesio. Se distribuye bajo licencia Apache 2.0, lo que facilita su integración comercial, y se acompaña de un modelo generador complementario (`akal-lm/Akal-1B-GGUF`) para construir pipelines RAG completos en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BertModel) con tokenizador XLMRobertaTokenizer |
| Parametros totales | 118 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Dimension de embedding | 384 |
| Tipos de cuantizacion | Q4_K_M (con imatrix), Q8_0 |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | LazarusNLP/all-indo-e5-small-v4 |
| Tamano en disco (Q4_K_M) | 119,0 MB |
| Tamano en disco (Q8_0) | 126,3 MB |
| RAM pico (Q4_K_M) | 515,8 MB |
| Backend de inferencia | llama.cpp (llama-embedding) |
| Pooling | mean |
| Normalizacion | L2 (`--embd-normalize 2`) |

## Arquitectura y entrenamiento

El modelo parte de `LazarusNLP/all-indo-e5-small-v4`, un encoder tipo BERT de 118 millones de parámetros y 384 dimensiones, y aplica una cuantización GGUF calibrada con una importance matrix específica para RAG en indonesio. La innovación técnica central no está en el entrenamiento del modelo base, sino en el proceso de cuantización: la matriz de importancia `imatrix_indo_e5_id.dat` (348 KB) se genera a partir de activaciones representativas de tareas de recuperación en indonesio, de modo que la cuantización a 4 bits preserva las dimensiones de activación más relevantes para la similitud semántica.

El autor reporta que la versión Q4_K_M calibrada alcanza una fidelidad coseno de 0,993366 (mínimo 0,990741) frente al modelo FP32, frente a 0,992652 (mínimo 0,987276) de una cuantización Q4_K_M estándar sin calibrar. La versión Q8_0 eleva la fidelidad a 0,999495 (mínimo 0,999159). No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO, ya que se trata de un modelo de embeddings y no de un modelo generativo.

## Capacidades

- Generación de embeddings densos de texto para recuperación semántica.
- Recuperación monolingüe en indonesio con Recall@1 del 100 % en el benchmark del autor.
- Recuperación cruzada inglés a indonesio (cross-lingual retrieval).
- Recuperación con negativos duros (hard-negative retrieval), con margen semántico de +0,2676.
- Inferencia en CPU pura sin GPU, mediante llama.cpp.
- Soporte de procesamiento por lotes con separador de embeddings (`--embd-separator`).
- Salida en formato JSON para integración en pipelines (`--embd-output-format json+`).
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de extracción de características.

## Casos de uso

- RAG en dispositivos de borde sin GPU: el modelo cabe en 119 MB en disco y usa unos 516 MB de RAM pico, lo que permite ejecutar recuperación semántica en portátiles antiguos, Raspberry Pi o dispositivos IoT con CPU de 4 hilos.
- Asistente documental en indonesio sobre corpus legales o administrativos: con prefijos `query:` y `passage:`, se indexan fragmentos de normativa (por ejemplo, la UU PDP) y se recuperan pasajes relevantes con latencia de 14,60 ms por consulta.
- Búsqueda semántica cruzada inglés-indonesio: permite que un usuario formule consultas en inglés sobre un corpus en indonesio, útil en organizaciones con documentación bilingüe.
- Deduplicación y agrupación de documentos: los embeddings de 384 dimensiones permiten calcular similitud coseno para detectar duplicados o agrupar pasajes temáticamente en pipelines de preprocesado.
- Clasificación y filtrado de contenido por similitud: se pueden usar los embeddings como características de entrada para clasificadores ligeros en tareas de moderación o enrutamiento de consultas.
- Pipeline RAG completo en el borde combinado con `akal-lm/Akal-1B-GGUF`: el embedding recupera pasajes y el modelo generador de 1B produce la respuesta, todo en CPU y sin dependencias de servicios en la nube.
- Evaluación de calidad de recuperación en entornos con recursos limitados: la fidelidad coseno frente a FP32 (0,9934 en Q4_K_M) permite usar la versión cuantizada como sustituto del modelo original en pruebas y validaciones.

## Benchmarks y rendimiento

Evaluación sobre el benchmark propio del autor (40 pasajes multidominio con distractores de negativos duros, 30 consultas), en un Intel Core i5-8250U a 4 hilos y CPU pura:

| Modelo | Backend / precision | Tamano disco | RAM pico | Latencia consulta | Recall@1 | MRR@10 | Margen semantico | Fidelidad coseno vs FP32 |
|---|---|---|---|---|---|---|---|---|
| Akal-Embed-Indo Q4_K_M | GGUF Q4_K_M (imatrix) | 119,0 MB | 515,8 MB | 14,60 ms | 100,0 % | 100,0 % | +0,2676 | 0,993366 |
| Akal-Embed-Indo Q8_0 | GGUF Q8_0 | 126,3 MB | 519,0 MB | 12,74 ms | 100,0 % | 100,0 % | +0,2688 | 0,999495 |
| all-indo-e5-small-v4 | PyTorch FP32 | 470,0 MB | 899,4 MB | 13,34 ms | 100,0 % | 100,0 % | +0,2694 | 1,000000 |
| all-indo-e5-small-v4 | GGUF Q4_K_M (sin calibrar) | 119,0 MB | 515,8 MB | 14,61 ms | 100,0 % | 100,0 % | +0,2632 | 0,992652 |
| Akal-Embed-E5 Q4_K_M | GGUF Q4_K_M (imatrix) | 119,0 MB | 515,7 MB | 14,31 ms | 100,0 % | 100,0 % | +0,0573 | 0,998241 |
| multilingual-e5-small | PyTorch FP32 | 470,0 MB | 867,6 MB | 13,72 ms | 100,0 % | 100,0 % | +0,0582 | 1,000000 |
| all-MiniLM-L6-v2 (22,7M) | PyTorch FP32 | 87,3 MB | 495,8 MB | 7,72 ms | 60,0 % | 69,08 % | +0,1330 | 1,000000 |

Los datos proceden exclusivamente del benchmark publicado por el autor; no se dispone de resultados en benchmarks estándar independientes (MTEB, BEIR) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU.
- RAM pico medida: 515,8 MB con Q4_K_M y 519,0 MB con Q8_0 en el hardware de referencia.
- CPU de referencia: Intel Core i5-8250U (4 hilos), con latencia de consulta de 14,60 ms (Q4_K_M) y 12,74 ms (Q8_0).
- Cabe holgadamente en cualquier CPU de consumo actual, incluidos portátiles de gama baja y dispositivos de borde.
- Opciones de despliegue: llama.cpp mediante el binario `llama-embedding`; también es compatible con cualquier runtime que soporte GGUF de embeddings.
- Throughput estimado: no disponible más allá de la latencia por consulta reportada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Idiomas | Licencia | Formato | Recall@1 (benchmark del autor) |
|---|---|---|---|---|---|---|---|
| Akal-Embed-Indo Q4_K_M | 118 M | 384 | no disponible | id, en | Apache 2.0 | GGUF | 100,0 % |
| all-indo-e5-small-v4 | 118 M | 384 | no disponible | id, en | no disponible | PyTorch FP32 | 100,0 % |
| multilingual-e5-small | 118 M | 384 | no disponible | multilingue | no disponible | PyTorch FP32 | 100,0 % |
| all-MiniLM-L6-v2 | 22,7 M | 384 | no disponible | en | no disponible | PyTorch FP32 | 60,0 % |

La ventaja diferencial de Akal-Embed-Indo frente a `multilingual-e5-small` en el benchmark del autor es un margen semántico frente a negativos duros 4,6 veces mayor (+0,2676 frente a +0,0573), con un tamano en disco un 74,7 % menor que la versión FP32 del modelo base.

## Limitaciones y advertencias

- El benchmark de referencia es propio del autor (40 pasajes, 30 consultas), por lo que los resultados de Recall@1 del 100 % no deben extrapolarse a corpus de mayor escala o dominios distintos.
- El modelo está optimizado para indonesio e inglés; su rendimiento en castellano u otros idiomas no está documentado.
- La longitud máxima de contexto no se especifica en la información disponible; conviene validar el truncamiento en fragmentos largos.
- Al ser un modelo de embeddings, no genera texto ni soporta razonamiento, tool calling o agentes.
- La cuantización Q4_K_M introduce una desviación coseno de hasta 0,0093 respecto a FP32 en el peor caso; para aplicaciones que requieran máxima fidelidad, se recomienda Q8_0.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (`LazarusNLP/all-indo-e5-small-v4`) debe verificarse de forma independiente.
- No se han publicado evaluaciones independientes en MTEB o BEIR en la información proporcionada.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base, no documentado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akal-lm/Akal-Embed-GGUF
- Modelo base: https://huggingface.co/LazarusNLP/all-indo-e5-small-v4
- Modelo generador complementario: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Perfil del autor: https://huggingface.co/luqni
- Organización Akal LM: https://huggingface.co/akal-lm
- Paper de investigación (incluido en el repositorio): `Akal_Embed_RAG_Research_Paper.pdf` (CC-BY 4.0)

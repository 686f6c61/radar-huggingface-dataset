# akal-lm/Akal-Embed-GGUF

## Resumen

Akal-Embed-GGUF es un modelo de embeddings densos de texto publicado por la iniciativa Akal LM (desarrollado por Muhammad Luqni Baehaqi) en formato GGUF, pensado para ejecucion de RAG (Retrieval-Augmented Generation) en CPU sin GPU. Se deriva del modelo `LazarusNLP/all-indo-e5-small-v4` mediante cuantizacion con matriz de importancia (importance matrix) calibrada especificamente para recuperacion en indonesio. Con aproximadamente 117,5 millones de parametros y 384 dimensiones de embedding, el modelo ocupa entre 119 MB (Q4_K_M) y 126 MB (Q8_0) en disco, lo que lo situa en el rango de despliegue en dispositivos de borde (edge) y entornos con memoria muy limitada.

El modelo resuelve el problema de construir pipelines de busqueda semantica y RAG sobre corpus pequenos y medianos (menos de 100.000 fragmentos) en hardware sin acelerador grafico, manteniendo los datos en local, lo que resulta relevante para requisitos de cumplimiento normativo de proteccion de datos. Su interes actual radica en la combinacion de tamano reducido, latencia de consulta inferior a 15 ms en CPU pura y una calibracion con imatrix en indonesio que, segun el autor, preserva la fidelidad coseno respecto a FP32 por encima de 0,99 en Q4_K_M.

La arquitectura subyacente es un transformer tipo BERT con tokenizador XLM-RoBERTa, con una longitud maxima de secuencia de 512 tokens. El modelo esta especializado en recuperacion en indonesio y en recuperacion cruzada ingles a indonesio, y no esta disenado como modelo generativo ni como recuperador multilingue universal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (BertModel) con tokenizador XLM-RoBERTa; modelo de embeddings densos |
| Parametros totales | 117.505.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (secuencia maxima de entrada) |
| Tipos de cuantizacion | GGUF Q4_K_M (con importance matrix) y Q8_0 |
| Idiomas soportados | Indonesio (id) e ingles (en), con recuperacion cruzada ingles a indonesio |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Dimensiones del embedding | 384 |
| Modelo base | LazarusNLP/all-indo-e5-small-v4 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del checkpoint `LazarusNLP/all-indo-e5-small-v4`, que a su vez sigue el esquema de la familia E5 (embeddings densos con prefijos de tarea) sobre una arquitectura BERT de 118 millones de parametros y 384 dimensiones. La innovacion principal de esta publicacion no esta en el entrenamiento del modelo base, sino en el proceso de cuantizacion: el autor ha generado una matriz de importancia especifica para indonesio (`imatrix_indo_e5_id.dat`) calibrada sobre datos de recuperacion en ese idioma, y la ha aplicado a la cuantizacion Q4_K_M para reducir la perdida de calidad respecto a FP32.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo original y no se detallan en la model card proporcionada. La calibracion con imatrix es la contribucion tecnica documentada: segun el autor, la variante Q4_K_M calibrada alcanza un margen semantico en negativos duros de +0,2676 frente a +0,2632 de la variante Q4_K_M estandar sin calibrar, y una fidelidad coseno media de 0,993366 (minimo 0,990741) respecto a FP32.

## Capacidades

- Generacion de embeddings densos de 384 dimensiones para texto en indonesio e ingles.
- Recuperacion semantica (dense retrieval) para RAG y busqueda en corpus documentales.
- Recuperacion cruzada entre idiomas (consulta en ingles sobre documentos en indonesio).
- Discriminacion de negativos duros: el autor reporta un margen semantico de +0,2676 en Q4_K_M, aproximadamente 4,6 veces mayor que el de `multilingual-e5-small` (+0,0573).
- Inferencia en CPU pura mediante llama.cpp, sin necesidad de GPU.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo de extraccion de caracteristicas.

## Casos de uso

- RAG local para administraciones y empresas indonesias: el modelo indexa SOP, manuales y normativa municipal en un corpus inferior a 100.000 fragmentos y permite busqueda semantica completamente offline, lo que facilita el cumplimiento de la ley indonesia de proteccion de datos (UU PDP n.o 27/2022) al no salir los datos del hardware local.
- Busqueda semantica en catalogos de producto: con 119 MB en disco y menos de 520 MB de RAM en pico, se puede desplegar en un servidor modesto o en un dispositivo de borde para resolver consultas de usuarios sobre descripciones de productos en indonesio con latencia de 12 a 15 ms por consulta.
- Asistente documental interno en CPU: combinado con el generador `akal-lm/Akal-1B-GGUF` (762 MB), forma un pipeline RAG completo por debajo de 1 GB de RAM total, adecuado para portatiles de oficina sin GPU.
- Recuperacion cruzada ingles-indonesio: permite que usuarios que formulan consultas en ingles recuperen documentacion interna redactada en indonesio, util en empresas con equipos internacionales.
- Clasificacion y agrupamiento de textos: los embeddings de 384 dimensiones sirven para clustering de tickets de soporte, deduplicacion de documentos y deteccion de similitud en corpus pequenos.
- Filtrado previo en pipelines de recuperacion de dos etapas: al ser tan ligero, puede actuar como primera etapa de recuperacion sobre un corpus grande y delegar el reordenamiento a un modelo mayor, reduciendo el coste computacional global.
- Despliegue en entornos aislados (air-gapped): al ejecutarse con llama.cpp y no requerir conexion, encaja en instalaciones con restricciones de red, como entornos gubernamentales o industriales.

## Benchmarks y rendimiento

Resultados publicados por el autor en el benchmark Akal-Embed Indonesian & Cross-Lingual RAG (40 pasajes multidominio con distractores de negativos duros, 30 consultas), sobre Intel Core i5-8250U con 4 hilos y CPU pura:

| Variante | Backend / precision | Tamano en disco | RAM pico (RSS) | Latencia por consulta | Recall@1 | MRR@10 | Margen semantico | Fidelidad coseno vs FP32 |
|---|---|---|---|---|---|---|---|---|
| Akal-Embed-Indo Q8_0 | GGUF Q8_0 | 126,3 MB | 519,0 MB | 12,74 ms | 100,0 % | 100,0 % | +0,2688 | 0,999495 (min. 0,999159) |
| Akal-Embed-Indo Q4_K_M | GGUF Q4_K_M con imatrix | 119,0 MB | 515,8 MB | 14,60 ms | 100,0 % | 100,0 % | +0,2676 | 0,993366 (min. 0,990741) |
| all-indo-e5-small-v4 (base) | PyTorch FP32 | 470,0 MB | 899,4 MB | 13,34 ms | 100,0 % | 100,0 % | +0,2694 | 1,000000 |
| all-indo-e5-small-v4 sin calibrar | GGUF Q4_K_M estandar | 119,0 MB | 515,8 MB | 14,61 ms | 100,0 % | 100,0 % | +0,2632 | 0,992652 (min. 0,987276) |
| all-indo-e5-small-v4 | GGUF Q5_K_M estandar | 126,3 MB | 518,2 MB | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB) en la informacion disponible; los datos anteriores corresponden exclusivamente al benchmark propio del autor.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia esta disenada para CPU. En caso de usar GPU, el modelo cabe holgadamente en cualquier GPU consumer con mas de 1 GB de memoria, aunque no es el escenario objetivo.
- RAM: aproximadamente 515 a 520 MB de pico (RSS) en las variantes Q4_K_M y Q8_0, frente a 899,4 MB en PyTorch FP32.
- GPU recomendadas: no aplica; el modelo esta optimizado para CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaria sin problema, pero no aporta ventaja frente a CPU para este tamano.
- CPU de referencia: Intel Core i5-8250U con 4 hilos, con latencias de 12,74 a 14,60 ms por consulta.
- Cabe en cualquier portatil consumer actual y en dispositivos de borde con al menos 1 GB de RAM libre.
- Opciones de despliegue: llama.cpp (backend de referencia), y por el formato GGUF es compatible con el ecosistema llama.cpp; Ollama y otros runners basados en GGUF son opciones plausibles, aunque no se documentan explicitamente en la model card.
- Throughput: no se publica una cifra de consultas por segundo; solo la latencia por consulta individual en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Akal-Embed-GGUF (Q4_K_M) | 117,5 M | 384 | 512 tokens | GGUF | Apache 2.0 | Calibrado con imatrix en indonesio; 119 MB; inferencia en CPU |
| LazarusNLP/all-indo-e5-small-v4 | 117,5 M | 384 | 512 tokens | PyTorch (safetensors) | no disponible en la informacion proporcionada | Modelo base en FP32; 470 MB; requiere framework de inferencia |
| multilingual-e5-small | no disponible en la informacion proporcionada | 384 | 512 tokens | safetensors, GGUF (segun distribucion) | MIT (segun distribucion habitual de la familia E5; no confirmado en esta informacion) | Referencia multilingue usada por el autor para comparar el margen semantico (+0,0573 frente a +0,2676) |

La comparativa se limita a estos modelos porque la informacion proporcionada no incluye datos de otras alternativas de embeddings ligeros para indonesio.

## Limitaciones y advertencias

- Especializado en indonesio e ingles; no es un recuperador multilingue universal y su rendimiento en otras lenguas de bajos recursos no esta garantizado.
- Ventana maxima de 512 tokens: los documentos largos deben fragmentarse (el autor sugiere fragmentos de 300 a 400 tokens con solapamiento de 50).
- Los vectores de 384 dimensiones estan optimizados para corpus pequenos y medianos (menos de 100.000 fragmentos); para recuperacion a escala web se recomiendan modelos de 1024 dimensiones.
- Los benchmarks publicados son un conjunto propio del autor (40 pasajes, 30 consultas), de tamano reducido; los resultados de Recall@1 del 100 % deben interpretarse con cautela y validarse en el corpus de destino.
- Riesgo de alucinacion no aplica directamente al ser un modelo de embeddings, pero la calidad de la recuperacion condiciona la fidelidad del generador en el pipeline RAG.
- No se detallan sesgos conocidos del modelo base en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `LazarusNLP/all-indo-e5-small-v4`, cuya licencia no se especifica en la informacion proporcionada.
- El modelo tiene 176 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa limitada.
- La fecha de creacion del repositorio (2026-11-13) y la de actualizacion (2026-11-16) son las registradas en Hugging Face; verificar la vigencia de los artefactos antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akal-lm/Akal-Embed-GGUF
- Modelo base: https://huggingface.co/LazarusNLP/all-indo-e5-small-v4
- Modelo generador complementario: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Preprint academico (PDF): https://huggingface.co/akal-lm/Akal-Embed-GGUF/resolve/main/Akal_Embed_RAG_Research_Paper.pdf
- Preprint en la pestana de archivos: https://huggingface.co/akal-lm/Akal-Embed-GGUF/blob/main/Akal_Embed_RAG_Research_Paper.pdf
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/luqni
- Organizacion: https://huggingface.co/akal-lm

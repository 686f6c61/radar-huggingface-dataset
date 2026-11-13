# IntezraInc/harrier-oss-v1-27b-GGUF

## Resumen

harrier-oss-v1-27b es un modelo de embeddings de texto multilingüe desarrollado por Microsoft, publicado en formato GGUF por Intezra, Inc. a partir de las cuantizaciones previas de Abiray. Con 27.009.346.304 parámetros (aproximadamente 27B), está construido sobre la arquitectura Gemma 3 con atención causal y genera representaciones vectoriales densas para tareas de recuperación de información, búsqueda semántica y clasificación de textos.

La ficha que nos ocupa no es el modelo original, sino una corrección de metadatos de los ficheros GGUF existentes. Los archivos originales estaban etiquetados con la arquitectura `gemma-embedding` (EmbeddingGemma), lo que hacía que llama.cpp aplicara atención bidireccional cuando Harrier es causal. Además, el tokenizador se almacenó como GPT-2 BPE en lugar del SentencePiece de Gemma, inflando el recuento de tokens entre 1,7x en inglés y 3-6x en ruso, chino y persa. Intezra corrige ambos problemas sin alterar los pesos cuantizados, que son byte a byte los de Abiray.

El resultado es relevante porque permite ejecutar en llama.cpp un modelo de embeddings de 27B con una fidelidad respecto al original de 0,997 de coseno en Q6_K y 0,972 en Q4_K_M, manteniendo el rendimiento de recuperación en MTEB dentro de 0,0005 puntos del BF16. La licencia MIT facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer causal, `use_bidirectional_attention: false`) |
| Parámetros totales | 27.009.346.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.600 tokens configurados en llama.cpp; truncado a 8.192 tokens en las evaluaciones MTEB |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K |
| Idiomas soportados | multilingüe |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Gemma 3 con atención causal, diseñado específicamente para generar embeddings y no para generación de texto. Harrier agrupa la representación final a partir del token `<eos>`, que el tokenizador añade al final de la secuencia (`--pooling last` en llama.cpp). El vocabulario es de 262.144 entradas, compartido con Gemma 3, más un token adicional propio de Harrier.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card únicamente documenta el proceso de cuantización y corrección de metadatos. La innovación técnica destacable de esta ficha es la corrección del tokenizador: se sustituyó el tokenizador GPT-2 BPE por el SentencePiece de Gemma 3, tomando puntuaciones y tipos de token de la conversión oficial de llama.cpp, con `add_space_prefix` desactivado. Sobre 2.012 textos de prueba (inglés, multilingüe, código, documentos largos, espacios en blanco y emojis), llama.cpp produce ahora exactamente los mismos token ids que el tokenizador original de Hugging Face.

## Capacidades

- Generación de embeddings de texto densos para recuperación y similitud semántica.
- Extracción de características (`feature-extraction`).
- Soporte multilingüe, incluyendo inglés, ruso, chino, persa y otros idiomas evaluados en Belebele (37 pares) y MLQA (19 pares).
- Procesamiento de documentos largos: las evaluaciones se realizaron truncando a 8.192 tokens, y la configuración de llama.cpp soporta hasta 65.600 tokens de contexto.
- Instrucciones de consulta de una frase para queries; los documentos no llevan instrucción, replicando el comportamiento del modelo original.
- Vectores de salida normalizados en L2, de modo que el producto escalar equivale al coseno.
- No soporta tool calling, agentes ni generación de texto: es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en producción: desplegar llama-server con `--embedding --pooling last` y servir 8 peticiones paralelas de hasta 8.192 tokens cada una, suficiente para un motor de búsqueda interno sobre documentación técnica.
- Recuperación aumentada (RAG) multilingüe: indexar un corpus en varios idiomas y consultar en cualquiera de ellos, aprovechando el rendimiento de 0,9495 nDCG@10 en Belebele y 0,7329 en MLQA.
- Deduplicación y clustering de documentos largos: el contexto de hasta 65.600 tokens permite vectorizar actas, contratos o artículos completos sin truncar.
- Clasificación y enrutamiento de tickets de soporte: usar la similitud coseno entre el ticket y un conjunto de plantillas para asignar categoría o equipo.
- Moderación y filtrado de contenido: comparar embeddings de textos entrantes contra una lista de referencia de contenido no deseado.
- Búsqueda de código: la corrección del tokenizador restaura la fidelidad en textos de código, lo que habilita la recuperación de fragmentos de código por descripción en lenguaje natural.
- Evaluación comparativa de sistemas de recuperación: al estar disponible en GGUF y con licencia MIT, sirve como referencia reproducible en pipelines de evaluación MTEB.

## Benchmarks y rendimiento

Resultados MTEB con los prompts oficiales de Harrier, entradas truncadas a 8.192 tokens, nDCG@10. Referencia: modelo BF16 en vLLM.

| Tarea | BF16 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|
| SciFact | 0.7995 | 0.8008 | 0.8012 | 0.8003 |
| NFCorpus | 0.4192 | 0.4163 | 0.4220 | 0.4185 |
| FiQA2018 | 0.6221 | 0.6203 | 0.6204 | 0.6137 |
| ArguAna | 0.6814 | 0.6798 | 0.6825 | 0.6779 |
| SCIDOCS | 0.2907 | 0.2902 | 0.2908 | 0.2887 |
| LEMBSummScreenFD | 0.9858 | 0.9858 | 0.9843 | 0.9862 |
| Belebele (37 pares) | 0.9495 | 0.9494 | 0.9489 | 0.9515 |
| MLQA (19 pares) | 0.7329 | 0.7342 | 0.7310 | 0.7400 |
| Media | 0.6851 | 0.6846 | 0.6852 | 0.6846 |

Fidelidad respecto al modelo original (coseno, peor de cuatro buckets: inglés corto, documentos largos, multilingüe y código; 500 elementos cada uno, percentil 5):

| Fichero | Tamaño | Tal como se publicó | Corregido |
|---|---|---|---|
| harrier-27b-Q6_K.gguf | 22,2 GB | 0,59 | 0,997 |
| harrier-27b-Q5_K_M.gguf | 19,3 GB | no disponible | 0,991 |
| harrier-27b-Q4_K_M.gguf | 16,5 GB | 0,56 | 0,972 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 22,2 GB para Q6_K, 19,3 GB para Q5_K_M y 16,5 GB para Q4_K_M, más overhead de contexto y de los slots paralelos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servir varias peticiones concurrentes con contexto largo. Una RTX 4090 de 24 GB solo permite Q4_K_M o Q5_K_M con contexto reducido.
- En consumer GPU: Q4_K_M (16,5 GB) cabe en RTX 4090 y en GPUs de 24 GB; Q5_K_M (19,3 GB) también cabe pero deja poco margen para el contexto; Q6_K (22,2 GB) no cabe en 24 GB.
- Despliegue: llama.cpp mediante `llama-server` con `--embedding --pooling last -ngl 999 -fa on`. La configuración documentada (`-c 65600 -np 8 -b 8200 -ub 8200`) sirve 8 entradas paralelas de hasta 8.192 tokens.
- Requisito crítico: el micro-batch (`-ub`) debe ser al menos tan largo como la entrada más larga, porque cada embedding debe caber en un único micro-batch. Cada slot (`-c` / `-np`) debe ser estrictamente mayor que la petición más larga; una petición del tamaño exacto del slot se rechaza.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| harrier-oss-v1-27b (esta ficha, GGUF corregido) | 27,0B | hasta 65.600 tokens en llama.cpp | GGUF (Q4_K_M, Q5_K_M, Q6_K) | MIT | Media MTEB 0,6851 en BF16; 0,6846 en Q4_K_M |
| microsoft/harrier-oss-v1-27b (BF16) | 27,0B | no disponible | safetensors | MIT | Modelo de referencia; requiere vLLM u otro runtime de pesos completos |
| Abiray/harrier-oss-v1-27b-GGUF (original) | 27,0B | no disponible | GGUF | MIT | Metadatos incorrectos: arquitectura y tokenizador erróneos; coseno de 0,56-0,59 frente al original |

No se dispone de datos de otros modelos de embeddings comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es exclusivamente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Q4_K_M no alcanza el umbral interno de coseno de 0,98 por elemento en texto multilingüe, aunque su rendimiento de recuperación es equivalente al resto de cuantizaciones.
- Los benchmarks MTEB se midieron con entradas truncadas a 8.192 tokens; el comportamiento más allá de esa longitud no está documentado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de recuperaciones irrelevantes en dominios alejados de los datos de entrenamiento del modelo base.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos por idioma o dominio.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base de Microsoft por si hubiera condiciones adicionales no reflejadas en esta ficha.
- Esta publicación no está afiliada ni respaldada por Microsoft ni por Abiray; los pesos cuantizados son de Abiray y solo se modificaron los metadatos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/IntezraInc/harrier-oss-v1-27b-GGUF
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-27b
- Cuantizaciones originales de Abiray: https://huggingface.co/Abiray/harrier-oss-v1-27b-GGUF
- Tokenizador de referencia Gemma 3: https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF

# Dioleti/paraphrase-multilingual-MiniLM-L12-v2

# Dioleti/paraphrase-multilingual-MiniLM-L12-v2

## Resumen

Se trata de un espejo ("homologación", fechada el 8 de octubre de 2026) del modelo `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicado por el usuario Dioleti en Hugging Face. No es un entrenamiento nuevo: reproduce los pesos del modelo base de sentence-transformers, un encoder transformer tipo BERT de la familia MiniLM-L12 con 117.654.272 parámetros (según el recuento de safetensors) que proyecta frases y párrafos a un espacio vectorial denso de 384 dimensiones.

Su función es puramente de representación: no genera texto, sino embeddings de frases para tareas de similitud semántica, búsqueda densa, clustering y deduplicación. Su rasgo principal es la cobertura multilingüe declarada (49 idiomas listados explícitamente más variantes BCP-47 como `fr-ca`, `pt-br`, `zh-cn` y `zh-tw`), lo que permite comparar frases entre idiomas distintos dentro del mismo espacio vectorial.

Es relevante ahora por su coste de despliegue muy bajo (117,7 M de parámetros, licencia Apache 2.0, exportaciones a PyTorch, TensorFlow, ONNX, OpenVINO y safetensors) y por su integración directa con el ecosistema `sentence-transformers` y con Text Embeddings Inference. El repositorio, sin embargo, registra 0 descargas y 0 "likes" en el momento de la consulta, y su model card no documenta entrenamiento ni evaluación, por lo que para producción conviene contrastarlo con el repositorio oficial del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12): 12 capas, 384 dimensiones ocultas, 12 cabezas de atención |
| Parametros totales | 117.654.272 (117,7 M) según safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (valor de `max_seq_length` del modelo base sentence-transformers; la model card de este espejo no lo especifica) |
| Tipos de cuantizacion | No disponible. El repositorio no publica pesos cuantizados (ni GGUF ni GPTQ); solo ofrece pesos en precisión completa en varios formatos |
| Idiomas soportados | Etiqueta `multilingual`; 49 idiomas declarados explícitamente (ar, bg, ca, cs, da, de, el, en, es, et, fa, fi, fr, gl, gu, he, hi, hr, hu, hy, id, it, ja, ka, ko, ku, lt, lv, mk, mn, mr, ms, my, nb, nl, pl, pt, ro, ru, sk, sl, sq, sr, sv, th, tr, uk, ur, vi) más variantes BCP-47 (fr-ca, pt-br, zh-cn, zh-tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, ONNX, OpenVINO |
| Dimension del embedding | 384 (según la ficha del modelo base) |
| Tamano del repositorio | 4,4 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Creado / actualizado | 2026-10-08 / 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de 12 capas con 384 dimensiones ocultas y 12 cabezas de atención, derivado de la familia MiniLM y con un tokenizador multilingüe de gran vocabulario (del orden de 250.000 subpalabras según la configuración pública del modelo base, coherente con el recuento de 117,7 M de parámetros). No incorpora mecanismos de atención lineal, SSM ni mezcla de expertos: es un transformer denso convencional orientado a producir un único vector por frase, normalmente mediante *mean pooling* sobre las representaciones de los tokens.

La model card de este espejo no documenta el proceso de entrenamiento. Según la documentación pública de sentence-transformers para el modelo base, se trata de una versión destilada de `paraphrase-multilingual-mpnet-base-v2`, entrenada con objetivos contrastivos (pares de paráfrasis y tareas de similitud) sobre datos paralelos traducidos a más de 50 idiomas. No hay constancia, en la información disponible, de fases de RLHF, DPO ni ajuste por instrucciones, algo esperable en un modelo de embeddings. Todo lo relativo a número de tokens, composición exacta del dataset e hiperparámetros debe considerarse no disponible en este repositorio.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para frases y párrafos cortos.
- Similitud semántica y detección de paráfrasis dentro de un mismo idioma.
- Recuperación y búsqueda semántica multilingüe y cross-lingual: una consulta en un idioma puede recuperar pasajes en otro.
- Extracción de características por capas (`feature-extraction`) para usos posteriores como entrada de clasificadores.
- Clustering y agrupamiento temático sobre representaciones vectoriales.
- Detección de duplicados y near-duplicates sobre corpus multilingües.
- Compatible con los pipelines de `sentence-transformers` y con Text Embeddings Inference (etiqueta `text-embeddings-inference`), además de con endpoints compatibles.
- No soporta generación de texto, tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Búsqueda semántica multilingüe en documentación técnica: se indexan los fragmentos de la base documental (manuales, FAQs, referencias de API) en 384 dimensiones y se recuperan por similitud, de modo que una consulta en español encuentra el pasaje relevante aunque esté redactado en inglés o alemán.
- Recuperación en pipelines RAG: el modelo actúa como retriever denso sobre un corpus vectorizado, con la ventaja de que un mismo índice sirve para usuarios de distintos idiomas sin duplicar el almacenamiento de embeddings.
- Deduplicación de corpus de entrenamiento: calculando la similitud coseno entre pares de documentos se pueden eliminar near-duplicates en corpus multilingües, una tarea habitual en la curación de datos previa al entrenamiento de modelos mayores.
- Clasificación de tickets de soporte: se generan embeddings de los mensajes y se entrena un clasificador ligero (regresión logística o MLP) encima, con coste de inferencia muy inferior al de un modelo generativo.
- Agrupación de feedback de usuarios: clustering sobre reseñas o encuestas en varios idiomas para descubrir temas recurrentes sin etiquetado previo, gracias a que las representaciones son comparables entre lenguas.
- Detección de paráfrasis y similitud de contenido: comparación de titulares, descripciones de producto o resúmenes para detectar duplicidad o plagio entre idiomas distintos.
- Sistemas de recomendación por contenido: similitud entre descripciones de artículos, ofertas de empleo o publicaciones para generar recomendaciones "similares a este".
- Enrutado semántico en asistentes: decidir a qué base de conocimiento o a qué departamento corresponde una consulta entrante según su vector más cercano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este espejo no incluye métricas (MTEB, similitud semántica, recuperación) ni comparaciones con el modelo base, y la búsqueda web no ha devuelto cifras verificables para este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 470 MB en fp32, 235 MB en fp16 y 120 MB en int8 (cálculo derivado de los 117,7 M de parámetros; no hay cifras publicadas por el autor).
- Almacenamiento adicional en memoria: 384 valores float32 por frase, unos 1,5 KB por embedding, más el índice vectorial correspondiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo funciona en RTX 3060, RTX 4090, A10, L4, T4, A100 o H100, aunque para este tamaño las GPU de gama alta quedan infrautilizadas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna, e incluso en CPU. Es viable en portátiles y en dispositivos con poca memoria.
- Opciones de despliegue: `sentence-transformers`, Hugging Face Text Embeddings Inference (TEI), ONNX Runtime, OpenVINO, TensorFlow Serving y los endpoints de Hugging Face. No se incluyen pesos GGUF, por lo que no es directamente utilizable en llama.cpp u Ollama sin convertir el modelo a ese formato.
- Latencia y throughput: no disponibles. No se publican mediciones en el repositorio ni en los resultados de búsqueda.

## Comparativa con modelos similares

Los datos de las alternativas proceden de las fichas públicas de cada modelo y no han sido verificados en esta búsqueda.

| Modelo | Parametros | Dimension embedding | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Dioleti/paraphrase-multilingual-MiniLM-L12-v2 | 117,7 M | 384 | 128 tokens | 49+ | Apache 2.0 |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 768 | 128 tokens | 50+ | Apache 2.0 |
| intfloat/multilingual-e5-small | 118 M | 384 | 512 tokens | ~100 | MIT |
| sentence-transformers/LaBSE | 471 M | 768 | 256 tokens | 109 | Apache 2.0 |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens | Solo inglés | Apache 2.0 |

Frente a `paraphrase-multilingual-mpnet-base-v2` y `LaBSE`, este modelo ofrece la mitad o un cuarto de parámetros y vectores más compactos (384 frente a 768 dimensiones), a cambio de menor capacidad de representación. Frente a `multilingual-e5-small`, de tamaño casi idéntico, la diferencia principal es la ventana de contexto (128 frente a 512 tokens) y el idioma de publicación de la ficha; `multilingual-e5-small` requiere prefijos `query:` y `passage:` en el uso, mientras que este modelo no.

## Limitaciones y advertencias

- Repositorio espejo con 0 descargas y 0 "likes": no es la fuente oficial. Para uso en producción conviene referenciar `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`.
- La model card no documenta datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar sesgos o rendimiento por idioma.
- Ventana de contexto de 128 tokens: los documentos largos deben fragmentarse y perderán contexto; textos de más de unas 100 palabras no se representan bien sin troceado.
- Espacio de embeddings de 384 dimensiones: menor capacidad de discriminación que las alternativas de 768 dimensiones en tareas finas de recuperación.
- Cobertura desigual entre idiomas: los idiomas con menos recursos de la lista (por ejemplo gu, my, mn, hy) suelen obtener peores resultados que los mayoritarios, aunque la ficha los declare soportados.
- No es un modelo generativo, por lo que no hay riesgo de alucinación textual; el riesgo equivalente es recuperar vecinos semánticamente irrelevantes en corpus ruidosos o muy especializados.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el atribución correspondiente. El espejo no añade restricciones adicionales.
- Ausencia de pesos GGUF o cuantizados: requiere conversión manual para entornos de inferencia en CPU basados en llama.cpp.
- El registro temporal de creación y actualización (2026-10-08) y la ausencia de métricas hacen recomendable validar el modelo sobre un conjunto propio antes de adoptarlo.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Dioleti/paraphrase-multilingual-MiniLM-L12-v2
- Modelo base oficial: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Versión monolingüe en inglés: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L12-v2
- Paper de Sentence-BERT: https://arxiv.org/abs/1908.10084
- Repositorio de sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Ficha en mlforge: https://mlforge.in/models/sentence-transformers/paraphrase-multilingual-minilm-l12-v2/
- Ficha en Inferix: https://inferix.co/models/sentence-transformers/paraphrase-multilingual-minilm-l12-v2
- Ficha en hfviewer: https://hfviewer.com/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (el extracto devuelto por la búsqueda describe un modelo distinto, sin relación aparente con este)

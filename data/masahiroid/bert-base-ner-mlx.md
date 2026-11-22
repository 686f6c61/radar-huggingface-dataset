# masahiroid/bert-base-ner-mlx

## Resumen

bert-base-ner-mlx es una conversión no oficial a MLX de dslim/bert-base-NER, un modelo BERT-base con una cabeza de clasificación de tokens para reconocimiento de entidades nombradas (NER). Lo publica el usuario masahiroid y su propósito es permitir la inferencia de un NER clásico sobre el framework MLX de Apple, orientado a hardware Apple Silicon (M-series), sin depender de PyTorch en tiempo de ejecución.

El modelo original se entrenó sobre CoNLL-2003 y etiqueta cuatro tipos de entidad: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC), con el esquema BIO de 9 etiquetas. La conversión mantiene la arquitectura intacta (encoder BERT post-norm más una capa lineal de clasificación) y los pesos en float16, con 107.726.601 parámetros y un tamaño de repositorio de 0,2 GB.

Su relevancia es acotada pero concreta: cubre un hueco que mlx-embeddings no resuelve, ya que esa librería está pensada para embeddings pooled y rerankers y no soporta cabezas de clasificación por token. Por eso el autor reimplementó el modelo desde cero en MLX y lo distribuye junto con el fichero `bert_ner_mlx.py`, necesario para cargarlo. La licencia es MIT y los idiomas declarados son inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base (encoder post-norm) con cabeza lineal de clasificación de tokens (9 etiquetas BIO) |
| Parametros totales | 107.726.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por la posición máxima de BERT-base; el valor exacto no se indica en la información disponible) |
| Tipos de cuantizacion | float16 (única precisión publicada en este repositorio) |
| Idiomas soportados | en, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), requiere código Python propio (`bert_ner_mlx.py`) |
| Modelo base | dslim/bert-base-NER |
| Pipeline | token-classification |
| Etiquetas | O, B-MISC, I-MISC, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC |
| Tamano del repositorio | 0,2 GB |
| Libreria | mlx |

## Arquitectura y entrenamiento

La arquitectura es un BERT-base estándar en configuración post-norm: un encoder de 12 capas con self-attention bidireccional y una capa lineal final que proyecta el estado oculto de cada token a 9 logits (uno por etiqueta BIO). No hay mecanismos de mezcla de expertos, atención lineal ni decodificación especulativa; es un modelo encoder-only de clasificación, no generativo.

El entrenamiento original corresponde a dslim/bert-base-NER, afinado sobre CoNLL-2003 para las cuatro categorías de entidad mencionadas. Esta versión no reentrena ni modifica el conocimiento del modelo: solo convierte los pesos a MLX y los guarda en float16. La conversión introdujo un ajuste técnico relevante: el uso de un valor de máscara de atención de `-1e9` provocaba `0 * (-inf) = NaN` en posiciones no enmascaradas al pasar a fp16, y se corrigió empleando `-1e4`, que cabe en el rango de fp16. El autor valida la conversión comparando contra la referencia PyTorch en fp32 sobre una frase con entidades de persona, localización y organización.

## Capacidades

- Reconocimiento de entidades nombradas por token en cuatro categorías: PER, ORG, LOC y MISC, con esquema BIO de 9 etiquetas.
- Clasificación a nivel de token sobre texto en inglés y japonés (idiomas declarados en la model card).
- Ejecución nativa en MLX sobre Apple Silicon, sin dependencia de PyTorch en inferencia.
- Salida de logits por token (forma `(1, seq_len, 9)`), apta para post-procesado propio (agregación de entidades, umbrales, etc.).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo encoder-only de clasificación.
- No dispone de modo thinking, visión ni audio.
- No es compatible con mlx-embeddings; requiere el módulo `bert_ner_mlx.py` incluido en el repositorio.

## Casos de uso

- Extracción de entidades en pipelines de NLP sobre Mac: desplegar el modelo con MLX en un Mac con Apple Silicon para anonimizar o enriquecer documentos sin montar un stack de PyTorch, aprovechando que el repositorio pesa 0,2 GB.
- Anonimización de datos personales (PII): detectar etiquetas B-PER e I-PER en textos antes de almacenarlos o compartirlos, como paso previo a su enmascaramiento en flujos de cumplimiento.
- Enriquecimiento de bases de datos documentales: identificar organizaciones y localizaciones en artículos o informes para poblar índices de búsqueda o grafos de entidades.
- Preprocesado para sistemas de recuperación de información: marcar entidades en los documentos antes de indexarlos, de modo que las consultas puedan filtrarse por organización o lugar.
- Procesamiento por lotes en local: al ser un modelo de 108 M de parámetros en fp16, cabe con holgura en la memoria unificada de un Mac moderno, lo que permite clasificar grandes volúmenes de frases en local sin coste de API.
- Prototipado y evaluación de NER en investigación: servir como referencia rápida de un NER CoNLL-2003 estándar para comparar contra modelos propios, con la ventaja de que la conversión está validada contra la referencia PyTorch (100 % de coincidencia de etiquetas).
- Extracción de entidades en textos japoneses e ingleses dentro de una misma aplicación, según los idiomas declarados, siempre que se valide la calidad real en japonés (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una validación de fidelidad de la conversión frente a la referencia PyTorch fp32 sobre una frase de ejemplo:

| Precisión | Similitud coseno de logits | Coincidencia de etiquetas |
|---|---|---|
| MLX fp32 | 1.0 | 100 % |
| MLX fp16 (esta release) | 0,99999994 | 100 % |

No se aportan cifras de F1, precisión o recall sobre CoNLL-2003 para esta conversión.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 0,2 GB de pesos en fp16 más el overhead del runtime; en la práctica, menos de 1 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y posteriores) con soporte MLX. No está pensado para GPU NVIDIA ni CUDA.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: MLX con el módulo `bert_ner_mlx.py` incluido en el repositorio. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI (son runtimes para otros formatos y, en varios casos, para modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Framework | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| masahiroid/bert-base-ner-mlx | 107.726.601 | no disponible | MLX (fp16) | en, ja | MIT | Hugging Face, 0 descargas, 1 like |
| dslim/bert-base-NER (original) | 108 M (BERT-base) | no disponible | PyTorch/Transformers | en (entrenado en CoNLL-2003) | MIT | Hugging Face, ampliamente usado |
| BERT-base NER en formato GGUF/ONNX | no disponible | no disponible | llama.cpp / ONNX Runtime | según conversión | según conversión | no disponible en la información aportada |

La comparación directa más relevante es con el modelo original: comparten pesos y arquitectura, pero difieren en el runtime (MLX frente a PyTorch) y en la precisión (fp16 frente a fp32). No se dispone de datos de otros modelos NER comparables en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial y de la comunidad; el autor original de dslim/bert-base-NER no la respalda.
- Solo etiqueta cuatro tipos de entidad (PER, ORG, LOC, MISC); no cubre fechas, cantidades, cargos ni otras categorías sin reentrenar la cabeza.
- El modelo original se entrenó sobre CoNLL-2003, en inglés; aunque la model card declara japonés, no se aportan métricas que respalden el rendimiento en ese idioma, por lo que conviene validarlo antes de usarlo en producción con texto japonés.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto), pero sí riesgo de falsos positivos y negativos en la detección de entidades, especialmente en dominios distintos al periodístico de CoNLL-2003.
- No es compatible con mlx-embeddings y depende de código Python incluido en el repositorio; hay que auditar y versionar ese fichero en cualquier despliegue.
- La única precisión publicada es fp16; no se ofrecen variantes cuantizadas a 8 o 4 bits.
- La licencia MIT permite uso comercial, pero al derivar del modelo original conviene revisar también las condiciones de dslim/bert-base-NER.
- El repositorio tiene 0 descargas, por lo que no hay evidencia de uso en producción ni validación externa más allá de la auditoría del propio autor con model-audit-lite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/bert-base-ner-mlx
- Modelo base: https://huggingface.co/dslim/bert-base-NER
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Herramienta de auditoría del autor: https://github.com/masahiroid/model-audit-lite
- README en japonés: README.ja.md dentro del repositorio del modelo
- Detalles de seguridad y linaje (ML-BOM): SECURITY.md dentro del repositorio del modelo

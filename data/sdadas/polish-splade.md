# sdadas/polish-splade

## Resumen

Polish-SPLADE es un modelo de recuperación de información léxica dispersa (sparse retrieval) para polaco, desarrollado por Sławomir Dadas (sdadas) y publicado en Hugging Face. Se trata de una adaptación al polaco del modelo SPLADE++ (variante EnsembleDistil) descrito en el artículo "From distillation to hard negative sampling: Making sparse neural IR models more effective" (arXiv:2205.04733). SPLADE (Sparse Lexical and Expansion) es una familia de métodos de recuperación basados en términos que emplean modelos de lenguaje Transformer: la cabeza de modelado de lenguaje enmascarado (MLM) se optimiza para generar un vector de pesos del tamaño del vocabulario, adaptado para la recuperación de texto.

El modelo parte del checkpoint polish-distilroberta (una destilación de RoBERTa adaptada al polaco) y se ajustó finamente sobre la traducción al polaco del conjunto de datos MS MARCO, usando los hiperparámetros por defecto del repositorio oficial de SPLADE (naver/splade). Con 81.967.699 parámetros y un tamaño de repositorio de 0,7 GB, es un modelo compacto pensado para ser integrado en motores de búsqueda basados en índices de términos como Lucene.

Su relevancia radica en que ofrece una alternativa a los recuperadores densos y a BM25 para el polaco: SPLADE logra resultados superiores a BM25 y comparables a codificadores densos de alta calidad, pero mantiene la interpretabilidad y la eficiencia de un índice invertido. El modelo se enmarca en el benchmark PIRB (arXiv:2402.13350), que evalúa métodos de recuperación densos e híbridos para polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilada, polish-distilroberta) con cabeza MLM para SPLADE |
| Parametros totales | 81.967.699 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length usado en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de PIRB menciona fp16) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con PyTorch vía transformers) |

## Arquitectura y entrenamiento

Polish-SPLADE es un Transformer encoder basado en RoBERTa destilada para polaco (polish-distilroberta). Sobre este backbone se aplica la formulación SPLADE: la salida de la cabeza MLM se transforma mediante `log(1 + relu(logits))` y se agrega con un max-pooling sobre la dimensión de secuencia, produciendo un vector disperso del tamaño del vocabulario que actúa como representación de recuperación. Este vector codifica tanto los términos presentes en el texto como expansiones léxicas aprendidas, lo que permite superar la coincidencia exacta de BM25.

El entrenamiento se realizó mediante fine-tuning sobre la traducción al polaco del dataset MS MARCO, siguiendo los hiperparámetros por defecto del repositorio oficial de SPLADE (naver/splade). La variante corresponde a SPLADE++ EnsembleDistil, que combina destilación de un ensemble de modelos con muestreo de negativos duros, una técnica descrita en el artículo arXiv:2205.04733 para mejorar la efectividad de los modelos IR dispersos. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni sobre la composición completa del dataset traducido.

## Capacidades

- Generación de representaciones dispersas de recuperación (vectores del tamaño del vocabulario) para textos en polaco.
- Búsqueda léxica con expansión de términos: captura sinónimos y variantes morfológicas gracias a las expansiones aprendidas por SPLADE.
- Ranking de documentos y pasajes para tareas de recuperación de información (question answering, búsqueda documental).
- Compatibilidad con índices invertidos tipo Lucene, lo que permite integrarse en motores de búsqueda existentes.
- Similitud coseno entre representaciones dispersas para puntuar pares consulta-documento.
- Integración con la librería PIRB (SpladeEncoder) para evaluación y despliegue.
- No es un modelo generativo: no produce texto libre ni soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al polaco; no se documenta soporte para otros idiomas.

## Casos de uso

- Motor de búsqueda documental en polaco: el modelo genera representaciones dispersas que se indexan en Lucene o un índice de términos equivalente, permitiendo recuperar pasajes relevantes para consultas en polaco con calidad superior a BM25.
- Recuperación en pipelines de question answering: se usa como primera etapa (retriever) para seleccionar pasajes candidatos de un corpus polaco antes de un modelo de lectura o generación.
- Búsqueda empresarial interna: indexación de documentación, correos o bases de conocimiento en polaco, aprovechando la eficiencia de los índices invertidos frente a los índices vectoriales densos.
- Sistemas de recomendación de contenido textual: puntuación de similitud entre consultas de usuario y artículos, noticias o fichas de producto en polaco.
- Evaluación comparativa de recuperadores: uso dentro del benchmark PIRB para comparar métodos densos, dispersos e híbridos en tareas de recuperación en polaco.
- Filtrado y deduplicación de corpus: cálculo de similitud entre documentos para detectar duplicados o contenidos muy relacionados en grandes colecciones en polaco.
- Búsqueda en atención al cliente: recuperación de respuestas o artículos de ayuda relevantes para consultas de usuarios en polaco, con latencia baja gracias al tamaño compacto del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (MRR, nDCG, Recall) y remite al benchmark PIRB (arXiv:2402.13350) para la evaluación de métodos de recuperación en polaco, pero no se proporcionan cifras concretas en la información facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~82 M de parámetros, la inferencia en fp32 requiere aproximadamente 0,3-0,4 GB de VRAM; en fp16, alrededor de 0,2 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Para alto throughput, una RTX 4090, A100 o H100 ofrecen margen sobrado, aunque el cuello de botella real será el índice de términos, no el modelo.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Hugging Face Transformers (AutoModelForMaskedLM), librería PIRB (SpladeEncoder), implementación oficial de SPLADE (naver/splade). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdadas/polish-splade | 81,97 M | 512 | SPLADE (disperso léxico) | Apache 2.0 | Hugging Face |
| sdadas/polish-distilroberta | no disponible | no disponible | Encoder denso (base del anterior) | no disponible | Hugging Face |
| BM25 (referencia clásica) | no aplica | no aplica | Léxico disperso | no aplica | Estándar en Lucene |

La model card indica que SPLADE logra resultados mejores que BM25 y comparables a codificadores densos de alta calidad. No se dispone de datos numéricos de benchmarks para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El modelo solo soporta polaco; no está entrenado ni evaluado para otros idiomas.
- Longitud máxima de secuencia de 512 tokens en el ejemplo de uso; textos más largos deben truncarse o dividirse en pasajes.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinación no aplicable en el sentido generativo, pero las expansiones léxicas pueden introducir términos no presentes en el texto original, lo que puede afectar a la precisión en dominios muy específicos.
- El entrenamiento se basa en una traducción automática de MS MARCO, lo que puede introducir ruido o sesgos de traducción en el comportamiento del modelo.
- Para indexar y buscar en grandes datasets se requiere integración con un índice de términos (Lucene) o la implementación oficial de SPLADE; no es un uso directo con Transformers únicamente.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento subyacentes (MS MARCO traducido).
- No se documentan evaluaciones de sesgo ni de robustez en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sdadas/polish-splade
- Checkpoint base: https://huggingface.co/sdadas/polish-distilroberta
- Paper SPLADE++ (arXiv:2205.04733): https://arxiv.org/abs/2205.04733
- Paper PIRB (arXiv:2402.13350): https://arxiv.org/abs/2402.13350
- Repositorio oficial SPLADE: https://github.com/naver/splade
- Librería PIRB: https://github.com/sdadas/pirb

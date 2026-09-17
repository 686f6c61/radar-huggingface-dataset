# sdand/mmbert-synth

## Resumen

sdand/mmbert-synth es un modelo publicado en HuggingFace por el usuario sdand. El repositorio contiene únicamente pesos en formato safetensors y la etiqueta de arquitectura "modernbert", sin model card, sin pipeline declarado, sin licencia especificada y sin idiomas documentados. El recuento real de parámetros extraído de los ficheros safetensors es de 140.642.306 (aproximadamente 141 millones), lo que lo sitúa en el rango de un encoder de tamano base. El repositorio ocupa 0,6 GB.

Por el tag "modernbert" y por el orden de magnitud del recuento de parámetros, el modelo parece corresponder a la familia ModernBERT, una arquitectura transformer encoder-only con atención lineal y RoPE, pensada para tareas de comprensión y representación de texto en lugar de generación autoregresiva. Sin embargo, esta correspondencia es una inferencia a partir de la etiqueta y no está confirmada por ninguna documentación oficial del autor.

Su relevancia práctica es limitada mientras no exista información verificable: no hay resultados de benchmarks, no se especifica el conjunto de entrenamiento, no se declara licencia y el número de descargas es de 23 con 0 likes. La ficha que sigue refleja estrictamente lo que se puede verificar y marca como "no disponible" todo aquello que no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, según tag del repositorio); sin confirmar en model card |
| Parametros totales | 140.642.306 |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; al publicarse solo safetensors, se pueden generar cuantizaciones propias (FP16, INT8, GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, los datos de entrenamiento ni el procedimiento de ajuste de este modelo concreto. El único dato técnico objetivo es el tag "modernbert" y el recuento de parámetros de 140.642.306, coherente con un encoder transformer de tamano base. La familia ModernBERT, de la que tomaría el nombre, se caracteriza por sustituir la atención estándar por atención lineal con ventanas locales alternadas y atención global, usar RoPE en lugar de embeddings posicionales absolutos y prescindir del sesgo en las capas lineales, lo que reduce el coste computacional en secuencias largas. Es habitual en esta familia un entrenamiento en dos fases (una con secuencias de 1.024 tokens y otra con secuencias largas de hasta 8.192), sin objetivo generativo. No obstante, nada de esto está confirmado para sdand/mmbert-synth.

El sufijo "synth" del nombre sugiere, sin ninguna confirmación documental, un posible entrenamiento o ajuste sobre datos sintéticos, pero se trata de una especulación basada únicamente en el nombre del repositorio. No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas de esta versión.

## Capacidades

- No hay capabilities documentadas por el autor.
- Por el tag "modernbert" y el tamano, es razonable esperar que funcione como encoder de representaciones: clasificación de texto, extracción de embeddings, etiquetado de secuencias y reranking, pero esto no está verificado.
- No hay indicios de que sea un modelo generativo de texto libre; los encoders de esta familia no producen texto de forma autoregresiva.
- Soporte de tool calling / function calling: no disponible, improbable en un encoder.
- Soporte de agentes y razonamiento multi-paso: no disponible, improbable en un encoder.
- Capacidades multilingües: no disponible. El prefijo "mm" del nombre podría sugerir multilingüismo, pero no hay ninguna confirmación.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con `transformers`: no confirmada por el autor, aunque el formato safetensors es compatible con la librería si la arquitectura está soportada.

## Casos de uso

Dado que no hay documentación funcional, los siguientes casos son hipótesis de uso razonables para un encoder de ~141M parámetros, no aplicaciones verificadas del modelo:

- Clasificación de texto a escala: si el modelo funciona como encoder, podría afinarse con una cabeza de clasificación para moderación de contenido, detección de spam o categorización de tickets, con un coste de inferencia muy bajo dado su tamano.
- Generación de embeddings para búsqueda semántica: uso como modelo de representación en un pipeline de recuperación (RAG), indexando documentos y consultas en un espacio vectorial. La ventaja esperada sería el bajo coste de cómputo frente a encoders de mayor tamano.
- Reranking en sistemas de recuperación: reordenar los candidatos devueltos por un retriever de primera fase, aprovechando la capacidad del encoder para puntuar pares consulta-documento.
- Extracción de entidades (NER): ajuste con una cabeza de etiquetado token a token para extraer nombres, fechas o importes de documentos, siempre que se valide antes la calidad del modelo base.
- Análisis de sentimiento y clasificación de reseñas: integración en un pipeline de procesamiento por lotes sobre grandes volúmenes de texto, donde un modelo pequeno reduce el coste por inferencia.
- Detección de similitud y deduplicación: cálculo de similitud coseno entre embeddings para deduplicar corpus o detectar plagio aproximado.
- Filtrado previo en pipelines de datos sintéticos: dado el sufijo "synth" del nombre, podría estar pensado para puntuar o filtrar datos generados, aunque esto no está documentado y requeriría validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existe model card, no hay tabla de evaluación y la búsqueda web no ha devuelto ninguna página relacionada con este repositorio. No se deben asumir cifras de MMLU, GLUE, HumanEval ni de ninguna otra suite.

## Requisitos de hardware

Estimaciones basadas únicamente en el recuento de parámetros (140,6 M), no en pruebas sobre este modelo:

- VRAM estimada para inferencia: aproximadamente 0,56 GB en FP32, 0,28 GB en FP16/BF16 y 0,14 GB en INT8. Estas cifras corresponden solo a los pesos; hay que sumar el consumo de activaciones y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la práctica. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema; las GPU de gama alta quedarán infrautilizadas salvo que se use un tamaño de lote muy grande.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier GPU consumer moderna (incluso integradas con memoria compartida suficiente).
- CPU: es viable para inferencia en CPU gracias al reducido número de parámetros y al tag modernbert, que en su familia original incorpora kernels optimizados; sin confirmar para esta versión.
- Opciones de despliegue: al publicarse solo safetensors, se puede servir con HuggingFace Transformers, Text Embeddings Inference (TEI), Optimum o FastAPI + PyTorch. vLLM y TGI no están pensados para encoders puros de este tipo en todos los casos. Las cuantizaciones GGUF para llama.cpp u Ollama no están publicadas y habría que generarlas.
- Latencia y throughput estimados: no disponibles. No hay ninguna medición publicada y no se debe extrapolar sin pruebas.

## Comparativa con modelos similares

La comparativa se establece con encoders de tamano base ampliamente conocidos. Los datos de las alternativas son especificaciones públicas de referencia, no mediciones de este modelo sobre las mismas tareas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sdand/mmbert-synth | 140,6 M | No disponible | No disponible | HuggingFace (23 descargas) |
| ModernBERT-base | ~149 M | 8.192 tokens | Apache 2.0 | HuggingFace (ampliamente usado) |
| BERT-base-uncased | 110 M | 512 tokens | Apache 2.0 | HuggingFace (muy extendido) |
| RoBERTa-base | ~125 M | 512 tokens | MIT | HuggingFace |
| DeBERTa-v3-base | ~184 M | 512 tokens | MIT | HuggingFace |

No es posible comparar rendimiento porque sdand/mmbert-synth no tiene benchmarks publicados ni documentación de evaluación.

## Limitaciones y advertencias

- Ausencia total de model card: no se documenta el dataset de entrenamiento, el procedimiento de ajuste ni las métricas de evaluación. Esto impide auditar sesgos o calidad.
- Licencia no especificada: no se puede asumir uso comercial permitido. En ausencia de licencia explícita, el uso en producción conlleva riesgo legal.
- Riesgo de alucinación: no evaluable sin benchmarks. En un encoder el riesgo se manifiesta como clasificaciones o embeddings poco fiables en dominios alejados del entrenamiento.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Contexto máximo desconocido: planificar pipelines con secuencias largas sin conocer el límite puede producir truncamientos silenciosos o errores.
- Ausencia de validación externa: 23 descargas y 0 likes implican prácticamente nula revisión por parte de la comunidad.
- El nombre "mmbert-synth" sugiere multilingüismo y datos sintéticos, pero son inferencias no confirmadas; no se deben tratar como hechos.
- Advertencia para producción: antes de usar este modelo en cualquier sistema real, es imprescindible evaluarlo sobre el caso de uso concreto y compararlo con un encoder de referencia con licencia clara (por ejemplo, ModernBERT-base o BERT-base-uncased).

## Enlaces

- HuggingFace: https://huggingface.co/sdand/mmbert-synth
- Paper de ModernBERT (arquitectura referenciada por el tag): https://arxiv.org/abs/2412.13663
- Repositorio de ModernBERT en HuggingFace: https://huggingface.co/answerdotai/ModernBERT-base
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repos o demos) asociados a este modelo concreto.

# QuerynAi/queryn-adapter-nemotron-1b-free_to_bge-m3

## Resumen

El modelo `queryn-adapter-nemotron-1b-free_to_bge-m3` es un adaptador de embeddings desarrollado por QuerynAi que traduce representaciones vectoriales generadas por el modelo `nemotron-1b-free` (de 2048 dimensiones) al espacio de embeddings de `bge-m3` (de 1024 dimensiones). Su propósito es permitir que un corpus ya indexado con `nemotron-1b-free` pueda servirse contra un índice construido con `bge-m3` sin necesidad de re-embedding, lo que supone un ahorro significativo de tiempo y coste computacional en infraestructuras de búsqueda existentes.

Se trata de una proyección lineal simple (arquitectura `linear`) con aproximadamente 2,1 millones de parámetros, exportada a formato ONNX (opset 17). El modelo se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas que abarca abstracts de arXiv, jurisprudencia australiana, pasajes de SQuAD, abstracts de PubMed y noticias de criptomonedas y mercados. La mejor similitud coseno en test alcanzada es de 0,8759, lo que indica una calidad de traducción razonable aunque no perfecta.

La relevancia de este adaptador radica en que facilita la interoperabilidad entre dos modelos de embeddings populares sin necesidad de reprocesar grandes volúmenes de datos, una operación que en entornos de producción puede resultar prohibitiva por coste y tiempo. Forma parte de un conjunto más amplio de adaptadores de traducción de embeddings publicados por QuerynAi.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear projection) |
| Parametros totales | ~2,1 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa embeddings fijos) |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en float32) |
| Idiomas soportados | No disponible (el corpus de entrenamiento es mayoritariamente inglés, pero no se especifica soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El adaptador es una capa lineal que mapea un vector de entrada de 2048 dimensiones a uno de salida de 1024 dimensiones. El grafo ONNX incluye una normalización L2 interna tanto en la entrada como en la salida, de modo que el usuario no necesita pre-normalizar los embeddings de origen. La dimensión del batch es dinámica, lo que permite procesar lotes de cualquier tamaño.

El entrenamiento se realizó sobre pares de embeddings generados por los dos modelos fuente y destino, utilizando un corpus unificado multi-dominio de aproximadamente 350 000 filas. La función de pérdida empleada fue `1 - media de similitud coseno`, optimizada con Adam y reducción de tasa de aprendizaje por meseta (`ReduceLROnPlateau`). Se guardó el checkpoint de la mejor época. Además, se comparó la arquitectura lineal con una variante más profunda (MLP) para cada par de modelos; en este caso, la lineal obtuvo una mejor similitud coseno en test (0,8759 frente a 0,8687) y fue la publicada.

## Capacidades

- Traducción de embeddings entre los espacios de `nemotron-1b-free` (2048-d) y `bge-m3` (1024-d).
- Normalización L2 automática de entrada y salida, simplificando el uso.
- Soporte de lotes dinámicos en la dimensión batch.
- Ejecución eficiente en CPU gracias a su pequeño tamaño y arquitectura lineal.
- Interoperabilidad entre índices de búsqueda construidos con distintos modelos de embeddings.
- No es un modelo generativo ni de razonamiento; su única función es la transformación de vectores.

## Casos de uso

- Migración de infraestructura de búsqueda: una empresa que tenga un corpus embebido con `nemotron-1b-free` puede cambiar a un índice basado en `bge-m3` sin re-embedding, simplemente aplicando el adaptador a los vectores existentes.
- Ahorro de costes en actualizaciones de modelo: en lugar de reprocesar millones de documentos, se aplica una proyección lineal de bajo coste computacional.
- Búsqueda híbrida: combinar resultados de búsqueda obtenidos con ambos espacios de embeddings para mejorar la diversidad de resultados, usando el adaptador para unificar las representaciones.
- Evaluación comparativa de modelos: probar el rendimiento de `bge-m3` sobre un corpus ya embebido con `nemotron-1b-free` sin necesidad de re-embedding, facilitando decisiones de migración.
- Integración en pipelines RAG existentes: mantener índices vectoriales actuales mientras se evalúa un nuevo modelo de embeddings, minimizando el tiempo de inactividad.
- Transferencia entre dominios: dado que el adaptador se entrenó en dominios variados (ciencia, legal, QA, médico, finanzas), puede aplicarse a corpus similares sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque este modelo no es un LLM sino un adaptador de embeddings. La única métrica de rendimiento disponible es la similitud coseno en el conjunto de test, que alcanzó un valor de **0,8759** en la época 15. Esta métrica indica la calidad de la traducción entre espacios, pero no existe una comparativa con otros adaptadores similares en la información proporcionada.

## Requisitos de hardware

- El modelo es extremadamente ligero (~2,1 millones de parámetros, tamaño de archivo del orden de unos pocos MB), por lo que puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- No se requieren requisitos especiales de VRAM; la inferencia se puede realizar con `onnxruntime` en CPU.
- Es compatible con cualquier entorno que soporte ONNX Runtime, incluyendo servidores de baja capacidad.
- La latencia por lote es del orden de milisegundos, aunque no se proporcionan cifras exactas.
- No se han documentado opciones de despliegue específicas (vLLM, Ollama, etc.), pero al ser un modelo ONNX puede integrarse fácilmente en pipelines de Python o servicios de inferencia que soporten este formato.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de traducción de embeddings comparables en la documentación proporcionada. La alternativa natural sería re-embedding completo del corpus con `bge-m3`, que implica un coste computacional y temporal mucho mayor. No se han encontrado datos de otros adaptadores de la misma categoría para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La calidad de la traducción no es perfecta (similitud coseno de 0,8759), por lo que puede haber una pérdida de precisión en tareas de búsqueda o recuperación al usar los embeddings traducidos.
- El adaptador solo acepta embeddings de `nemotron-1b-free` como entrada; no es genérico para otros modelos fuente.
- El corpus de entrenamiento es específico de ciertos dominios (ciencia, legal, QA, médico, finanzas); su rendimiento en dominios muy diferentes podría degradarse.
- No se ha evaluado el comportamiento en idiomas distintos del inglés, aunque el corpus incluye pasajes de SQuAD (inglés) y otros textos probablemente en inglés.
- La licencia MIT permite uso comercial, pero es necesario verificar las licencias de los modelos fuente (`nemotron-1b-free` y `bge-m3`) para asegurar el cumplimiento en aplicaciones comerciales.
- Al ser un modelo de transformación, no presenta riesgos de alucinación ni sesgos generativos, pero la calidad de la traducción depende de la distribución de los datos de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/QuerynAi/queryn-adapter-nemotron-1b-free_to_bge-m3)
- [Colección de adaptadores de QuerynAi](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Modelo BGE-M3 de BAAI](https://huggingface.co/BAAI/bge-m3)
- [Página de NVIDIA Nemotron](https://developer.nvidia.com/topics/ai/nemotron)
- [Repositorio GitHub de NVIDIA Nemotron](https://github.com/NVIDIA-NeMo/Nemotron)

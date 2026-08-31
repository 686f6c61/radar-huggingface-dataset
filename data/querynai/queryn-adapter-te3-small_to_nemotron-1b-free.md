# QuerynAi/queryn-adapter-te3-small_to_nemotron-1b-free

## Resumen

QuerynAi/queryn-adapter-te3-small_to_nemotron-1b-free es un adaptador de embeddings desarrollado por QuerynAi, que forma parte de la colección "Queryn Embedding Adapters". Su función es traducir un vector de embedding producido por el modelo te3-small (de 1536 dimensiones) al espacio de representación del modelo nemotron-1b-free (de 2048 dimensiones). Esto permite que un corpus ya indexado con te3-small pueda ser servido contra un índice construido con nemotron-1b-free sin necesidad de re-embedding de todos los documentos.

El adaptador es una proyección lineal simple (arquitectura `linear`) con aproximadamente 3,1 millones de parámetros, exportado a formato ONNX con opset 17. Se entrenó sobre pares de embeddings generados a partir de un corpus multi-dominio de unas 350 000 filas que abarca ciencia, derecho, medicina, finanzas y QA. La métrica de calidad reportada es la similitud coseno media en test, que alcanza 0,7373 en la mejor época. Su relevancia radica en que permite migrar o combinar infraestructuras de búsqueda semántica que usan distintos modelos de embedding, ahorrando costes computacionales y de almacenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (linear) |
| Parametros totales | ~3,1 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (adaptador de embeddings, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El adaptador implementa una proyección lineal simple: dado un embedding de entrada de 1536 dimensiones (proveniente de te3-small), el grafo aplica una normalización L2 interna y luego una transformación lineal que produce un vector de salida de 2048 dimensiones, también unit-normalizado. La ablación de arquitectura comparó esta opción `linear` con una variante `deep` (MLP), resultando mejor la lineal con una similitud coseno en test de 0,7373 frente a 0,7267.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de criptomonedas y mercados. La función de pérdida fue `1 - media de similitud coseno`, optimizada con Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`, guardando el checkpoint de la mejor época. El adaptador se exportó a ONNX desde un checkpoint PyTorch usando la herramienta `ptConverter.py`.

## Capacidades

- Traducción de embeddings de te3-small (1536 dimensiones) al espacio de nemotron-1b-free (2048 dimensiones).
- Normalización L2 automática tanto en la entrada como en la salida, por lo que no se requiere pre-normalización por parte del usuario.
- Soporte de lotes con dimensión dinámica (el eje de batch es dinámico).
- Inferencia eficiente en CPU mediante onnxruntime.
- Compatibilidad con pipelines de extracción de características (feature-extraction) de Hugging Face.
- No es un modelo generativo ni de lenguaje; su única función es la transformación de vectores.

## Casos de uso

- Migración de índices de búsqueda semántica: si una organización tiene un índice de documentos embebidos con te3-small y quiere cambiar a nemotron-1b-free, puede usar este adaptador para transformar los embeddings existentes sin re-embedding de todo el corpus, ahorrando tiempo y recursos.
- Búsqueda híbrida multi-modelo: en sistemas RAG que combinan varios modelos de embedding, el adaptador permite unificar las representaciones para que las consultas y los documentos compartan un mismo espacio vectorial.
- Ahorro de costes en infraestructura: al evitar re-embedding de grandes volúmenes de datos, se reduce el coste computacional y de almacenamiento en entornos de producción.
- Actualización incremental de sistemas de recomendación: cuando se actualiza el modelo de embeddings, el adaptador permite transformar los vectores antiguos sin reprocesar todo el historial de interacciones.
- Evaluación comparativa de modelos de embedding: permite medir la calidad de la traducción entre espacios y decidir si la pérdida de similitud es aceptable para un caso de uso concreto.
- Integración en pipelines de datos existentes: al ser un modelo ONNX, puede ejecutarse en cualquier runtime compatible (onnxruntime, TensorRT, etc.) y encadenarse con otras etapas de procesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La única métrica reportada es la similitud coseno media en el conjunto de test, obtenida durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Similitud coseno en test (mejor época, arquitectura linear) | 0,7373 |
| Similitud coseno en test (arquitectura deep) | 0,7267 |

Estos valores indican que la traducción no es perfecta y existe una pérdida de fidelidad entre los espacios de origen y destino, aunque no se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el modelo tiene ~3,1 millones de parámetros y se ejecuta como un grafo ONNX, por lo que cabe en cualquier CPU.
- GPU recomendada: no es necesaria; puede ejecutarse en CPU sin problemas. Si se desea máxima latencia, cualquier GPU moderna (incluso integrada) es suficiente.
- Compatibilidad con hardware de consumo: sí, cualquier ordenador personal puede ejecutarlo.
- Opciones de despliegue: onnxruntime (CPU o GPU), TensorRT, o cualquier runtime que soporte ONNX. También puede integrarse en servicios como Hugging Face Inference Endpoints.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser una proyección lineal, la inferencia es del orden de microsegundos por vector en CPU.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de traducción de embeddings comparables en la documentación proporcionada. La colección "Queryn Embedding Adapters" incluye otros adaptadores (por ejemplo, `queryn-adapter-bge-m3_to_fastembed-bge-small`), pero no se ofrecen especificaciones detalladas ni métricas comparativas para este modelo concreto. Por tanto, no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- La similitud coseno en test es de 0,7373, lo que indica una pérdida de precisión en la traducción; no es una transformación perfecta.
- El adaptador solo funciona en una dirección: de te3-small a nemotron-1b-free. No es bidireccional ni admite otros pares de modelos.
- Depende de la calidad y distribución de los datos de entrenamiento (arXiv, jurisprudencia, SQuAD, PubMed, noticias cripto). Si el corpus de producción tiene una distribución muy distinta, el rendimiento podría degradarse.
- No se reportan sesgos específicos del adaptador, pero al ser una proyección de embeddings, puede heredar sesgos de los modelos subyacentes (te3-small y nemotron-1b-free).
- El uso comercial está permitido por la licencia MIT del adaptador, pero hay que verificar las licencias de los modelos de origen y destino si se utilizan por separado.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que el modelo no está alojado directamente en Hugging Face; se accede mediante descarga desde el hub (probablemente un archivo `model.onnx` referenciado en el código).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuerynAi/queryn-adapter-te3-small_to_nemotron-1b-free
- Colección de adaptadores: https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4
- Plots de entrenamiento (referenciados en la model card): `plots/te3-small.png` y `plots/architecture_ablation.png` (ruta relativa dentro del repositorio).

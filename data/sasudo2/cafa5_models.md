# sasudo2/cafa5_models

## Resumen

`sasudo2/cafa5_models` es un repositorio de modelos entrenados para la predicción de función proteica mediante anotación de términos de Gene Ontology (GO), alineado con las directrices del torneo CAFA 5 (Critical Assessment of Functional Annotation). Lo desarrolla el usuario `sasudo2` y su propósito es generar predicciones multi-etiqueta estandarizadas con el esquema `EntryID`, `term`, `score` para las tres ramas de GO: proceso biológico, función molecular y componente celular.

El repositorio no contiene un único modelo, sino tres artefactos con enfoques complementarios: `esm2_ffn`, un híbrido que combina el encoder congelado ESM-2 (650M parámetros, 33 capas, 1.280 dimensiones de embedding) con una cabeza de clasificación feed-forward propia; `blast_knn`, un baseline de similitud de secuencia con k-vecinos más cercanos sobre el espacio de anotaciones; y `lr3mer`, un baseline ligero de frecuencias de 3-meros con regresión logística multi-etiqueta.

Su relevancia práctica radica en que ofrece un pipeline completo y reproducible (pesos, configuraciones, manifiestos y scripts de inferencia) para un problema de anotación a gran escala: el autor reporta más de 200 millones de filas de predicción generadas sobre 141.864 proteínas de test. El repositorio ocupa 42,3 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido ESM-2 (transformer protein LM) + cabeza FFN en `esm2_ffn`; BLAST + k-NN en `blast_knn`; regresion logistica multi-etiqueta sobre 3-meros en `lr3mer` |
| Parametros totales | Encoder ESM-2 `t33_650M_UR50D`: 650M; parametros de la cabeza FFN: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de la longitud maxima de secuencia configurada en ESM-2; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | No aplica: entrada de secuencias de aminoacidos (no es un modelo de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.280 (salida del encoder ESM-2) |
| Cabeza de clasificacion | Hidden dim 512, dropout 0.2, LR 0.001, weight decay 0.0001, positive weight cap 50.0 |
| Hardware de entrenamiento | Tesla T4 |
| Volumen de datos | 141.995 proteinas de entrenamiento, 141.864 de test, >200M filas de prediccion |
| Tamano del repositorio | 42,3 GB |

## Arquitectura y entrenamiento

El componente principal, `esm2_ffn`, sigue un esquema de *feature extraction* con encoder congelado: se utiliza `facebook/esm2_t33_650M_UR50D` como extractor de representaciones de 1.280 dimensiones y se entrena exclusivamente una cabeza feed-forward con dimensión oculta de 512 y dropout de 0.2. La formulación es de clasificación multi-etiqueta sobre el vocabulario de términos GO, con un `positive_weight_cap` de 50.0 para compensar el fuerte desbalance de clases inherente a la anotación funcional (la mayoría de términos GO son raros). El entrenamiento se realizó en una única Tesla T4, lo que sugiere un coste computacional moderado y un diseño orientado a la reproducibilidad más que a la escala.

Los otros dos artefactos son baselines: `blast_knn` explota la homología de secuencia mediante alineamiento BLAST y propaga anotaciones desde los k vecinos más cercanos en el espacio de anotaciones, mientras que `lr3mer` representa cada proteína por frecuencias de 3-meros y entrena clasificadores de regresión logística independientes por término GO. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Predicción multi-etiqueta de términos de Gene Ontology en las tres ontologías: Biological Process, Molecular Function y Cellular Component.
- Generación de puntuaciones de confianza calibradas en el rango [0.0, 1.0] por cada término GO predicho.
- Procesamiento de secuencias de aminoácidos en formato FASTA mediante el script `inference.py` incluido.
- Extracción de representaciones proteicas de 1.280 dimensiones mediante el encoder ESM-2 subyacente.
- Anotación por homología de secuencia (baseline `blast_knn`) como alternativa interpretable y sin GPU.
- Anotación por composición de k-meros (baseline `lr3mer`) con coste computacional mínimo.
- Salida estandarizada compatible con pipelines de evaluación CAFA (`EntryID`, `term`, `score`).
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multimodales, de audio o de visión.
- No es un modelo conversacional ni multilingüe: su entrada es exclusivamente secuencia proteica.

## Casos de uso

- Anotación funcional a gran escala de proteomas recién secuenciados: el pipeline `esm2_ffn` permite procesar lotes de decenas de miles de secuencias y emitir predicciones GO con scores, sustituyendo anotaciones manuales costosas en genomas no caracterizados.
- Priorización de dianas en descubrimiento de fármacos: las predicciones de Molecular Function y Biological Process sobre proteínas sin estructura resuelta ayudan a filtrar candidatos antes de ensayos experimentales.
- Enriquecimiento de bases de datos biológicas: integración de los scores GO como capa de anotación complementaria en repositorios tipo UniProt, con trazabilidad mediante el `EntryID`.
- Participación y validación en CAFA 5: el repositorio incluye los tres enfoques (deep learning, homología y baseline estadístico) necesarios para construir un ensemble competitivo y comparar metodologías bajo el mismo esquema de salida.
- Análisis de sensibilidad a la homología: comparar las predicciones de `esm2_ffn` frente a `blast_knn` permite identificar proteínas donde la evidencia de homología es débil y el modelo aprendido aporta señal adicional.
- Filtrado rápido en pipelines de metagenómica: `lr3mer` ofrece una primera pasada de anotación con coste mínimo de CPU sobre miles de secuencias, reservando `esm2_ffn` para los casos ambiguos.
- Docencia y reproducción de experimentos: los scripts y configuraciones publicados permiten reproducir el flujo completo en una sola GPU T4, útil para cursos de bioinformática y aprendizaje automático aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de volumen (141.995 proteínas de entrenamiento, 141.864 de test, más de 200 millones de filas de predicción) y la configuración del entrenamiento, pero no incluye valores de F-max, AUPR, precisión@k ni comparaciones cuantitativas con otros sistemas CAFA 5.

## Requisitos de hardware

- VRAM estimada para `esm2_ffn`: el encoder ESM-2 de 650M parámetros en fp32 requiere aproximadamente 2,6 GB solo para pesos, más activaciones y la cabeza FFN; en la práctica se recomienda un mínimo de 8-16 GB de VRAM según el tamaño de lote y la longitud de secuencia.
- GPU recomendadas: Tesla T4 (hardware documentado por el autor para el entrenamiento), RTX 3090, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores para lotes pequeños; los baselines `blast_knn` y `lr3mer` pueden ejecutarse íntegramente en CPU.
- Opciones de despliegue: el repositorio proporciona `inference.py` basado en PyTorch y Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se completó en una única Tesla T4, lo que indica que la inferencia por secuencia es viable en hardware modesto, pero no se publican cifras medidas.
- Almacenamiento: el repositorio completo ocupa 42,3 GB, por lo que conviene descargar solo el subdirectorio necesario (`esm2_ffn`, `blast_knn` o `lr3mer`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sasudo2/cafa5_models` (`esm2_ffn`) | ESM-2 congelado + cabeza FFN para GO | 650M (encoder) | No disponible | Apache 2.0 | HuggingFace |
| `facebook/esm2_t33_650M_UR50D` | Protein language model base | 650M | No disponible | MIT | HuggingFace |
| `sasudo2/cafa5_models` (`blast_knn`) | BLAST + k-NN | No aplica | No aplica | Apache 2.0 | HuggingFace |
| `sasudo2/cafa5_models` (`lr3mer`) | Regresion logistica sobre 3-meros | No aplica | No aplica | Apache 2.0 | HuggingFace |

La comparación con sistemas especializados de predicción GO (por ejemplo, soluciones presentadas en ediciones previas de CAFA) no está disponible en la información proporcionada. ESM-2 es el encoder base sobre el que se construye `esm2_ffn`, no un competidor directo: ESM-2 no emite anotaciones GO por sí mismo, sino representaciones que requieren una cabeza entrenada.

## Limitaciones y advertencias

- Sesgos de anotación heredados: los términos GO están desbalanceados y sobrerrepresentados en proteínas bien estudiadas (sesgo hacia organismos modelo), lo que puede infravalorar funciones en taxones poco caracterizados.
- Riesgo de falsos positivos en términos raros: el `positive_weight_cap` de 50.0 mitiga el desbalance, pero la calibración de scores para términos con pocos positivos no está validada en la model card.
- El encoder está congelado: no se ha ajustado ESM-2 durante el entrenamiento, lo que limita la adaptación específica al dominio de anotación GO frente a un fine-tuning completo.
- Longitud de secuencia: no se documenta el truncamiento aplicado; proteínas largas pueden perder información en el encoder.
- Idiomas: no aplica, pero conviene señalar que el modelo no procesa texto libre ni descripciones funcionales, solo secuencias de aminoácidos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la validez biológica de las predicciones.
- Validación limitada: sin métricas de benchmark publicadas (F-max, AUPR) no es posible estimar la calidad real frente a alternativas del estado del arte.
- Repositorio de gran tamaño (42,3 GB): requiere gestión cuidadosa del almacenamiento y descarga selectiva por subcarpeta.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de soporte activo ni de comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sasudo2/cafa5_models
- Encoder base ESM-2: https://huggingface.co/facebook/esm2_t33_650M_UR50D
- Documentación de ESM-2 (Meta AI): https://github.com/facebookresearch/esm
- CAFA 5 (Critical Assessment of Functional Annotation): https://www.kaggle.com/competitions/cafa-5-protein-function-prediction
- Gene Ontology Consortium: https://geneontology.org/
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales del autor.

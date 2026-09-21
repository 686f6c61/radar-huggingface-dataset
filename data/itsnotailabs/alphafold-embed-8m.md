# ItsnotAilabs/AlphaFold-Embed-8M

## Resumen

AlphaFold-Embed-8M es un modelo compacto de extracción de características para secuencias de proteínas, desarrollado por ItsnotAilabs y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un ajuste fino del modelo base facebook/esm2_t6_8M_UR50D (familia ESM-2), orientado a predecir propiedades estructurales directamente desde la secuencia primaria de aminoácidos, sin necesidad de generar coordenadas 3D. Con solo 8 millones de parámetros, 6 capas, 20 cabezas de atención y una dimensión oculta de 320, el modelo está diseñado para ejecutarse en CPU con latencias de milisegundos.

El modelo aborda tres tareas concretas: predicción por residuo de la confianza estructural pLDDT, detección de fronteras de dominios proteicos y puntuación de desorden intrínseco. Además, genera embeddings compatibles con Foldseek para búsquedas rápidas de homología estructural, lo que lo sitúa como una etapa de triaje económica antes de recurrir a predictores de estructura completa como AlphaFold2 o ESMFold. El autor declara también soporte para resolución de identificadores UniProt.

Su relevancia actual radica en la relación entre coste computacional y utilidad: un modelo de 32 MB en FP32 que ofrece señal estructural por residuo permite anotar proteomas completos o cribar miles de candidatos en hardware modesto, algo inviable con modelos de plegamiento de cientos de millones de parámetros. La contrapartida es que se trata de un modelo con cero descargas y cero valoraciones en el momento de redactar esta ficha, con métricas declaradas por el autor y no verificadas de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ESM-2 (solo encoder), con cabeza de predicción de contactos adaptada a regresión de pLDDT |
| Parametros totales | 8 millones (8M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (residuos); secuencias más largas deben truncarse o procesarse en fragmentos solapados |
| Capas | 6 |
| Cabezas de atención | 20 |
| Dimensión oculta | 320 |
| Embeddings posicionales | aprendidos (learned positional embeddings) |
| Tipos de cuantizacion | FP32 (base, ~32 MB), FP16 (~16 MB), INT8 (~8 MB), GGUF/Q4_K_M (~5 MB) |
| Idiomas soportados | en (etiqueta declarada); la entrada real son secuencias de aminoácidos en notación de una letra |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch vía transformers; la model card menciona ONNX en sus badges y lista una cuantización GGUF/Q4_K_M. No se especifica explícitamente safetensors |
| Modelo base | facebook/esm2_t6_8M_UR50D |
| Pipeline | feature-extraction |
| Datasets declarados | uniref50, alphafold-db, disprot |

## Arquitectura y entrenamiento

La arquitectura es la de ESM-2 en su variante más pequeña: un transformer encoder con 6 capas, 20 cabezas de atención y dimensión oculta de 320, sobre el que se añade una cabeza de predicción de contactos reutilizada como regresor de pLDDT por residuo. La tokenización es la estándar de ESM y la entrada consiste en cadenas de aminoácidos en notación de una letra (por ejemplo, `MKTIIALSYIFCLVFADYKDDDDK`), sin plantilla de prompting ni tokens especiales más allá de los propios del tokenizador ESM. El modelo parte de los pesos de facebook/esm2_t6_8M_UR50D, preentrenado sobre UniRef50, y se ajusta después sobre AlphaFold DB y DisProt para las tareas estructurales y de desorden.

En cuanto al procedimiento de entrenamiento, la información disponible no detalla el número de tokens de ajuste, la composición exacta del dataset, la proporción de cada fuente ni si se emplearon técnicas de alineación como RLHF o DPO. No se documentan innovaciones como decodificación especulativa, atención lineal ni mecanismos híbridos SSM: es un encoder transformer denso convencional. La model card menciona además que el modelo "aprende a predecir características estructurales directamente desde la secuencia primaria" y que genera embeddings compatibles con Foldseek, pero no se aportan detalles del objetivo de entrenamiento multi-tarea ni de la función de pérdida combinada.

## Capacidades

- Extracción de embeddings por residuo y por secuencia para proteínas de hasta 1024 residuos.
- Predicción de confianza estructural pLDDT a nivel de residuo, sin generar coordenadas 3D.
- Detección de fronteras de dominios proteicos a partir de la secuencia.
- Puntuación de desorden intrínseco (regiones IDR) por residuo.
- Generación de embeddings compatibles con Foldseek para búsqueda de homología estructural.
- Resolución de identificadores UniProt (capacidad declarada por el autor, sin detalles de implementación).
- No es un modelo generativo de texto: no produce lenguaje natural ni código.
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso.
- Capacidad multilingüe: no aplica; la única entrada válida son secuencias de aminoácidos.
- No incluye modo "thinking", ni capacidades de visión, audio o imagen.

## Casos de uso

- Anotación a gran escala de proteomas: el modelo procesa secuencias completas de hasta 1024 residuos en milisegundos por secuencia en CPU, lo que permite asignar un perfil de pLDDT por residuo a decenas de miles de proteínas en un clúster modesto sin GPU dedicada.
- Triaje previo a predictores de estructura 3D: ejecutar AlphaFold-Embed-8M antes de AlphaFold2 o ESMFold permite descartar regiones o candidatos con confianza baja y reservar el cómputo caro para los casos con señal favorable, reduciendo el coste total del pipeline.
- Diseño de constructos recombinantes: la detección de fronteras de dominios facilita decidir dónde truncar una proteína multi-dominio para expresar un dominio aislado soluble, usando la secuencia de desorden como indicador de regiones flexibles prescindibles.
- Caracterización de proteínas intrínsecamente desordenadas: la puntuación de desorden (AUC 0.91 declarado sobre DisProt) permite priorizar regiones IDR para estudios de unión a parejas, condensados biomoleculares o dianas de fármacos dirigidas a interfaces desordenadas.
- Búsqueda de homología estructural rápida: los embeddings compatibles con Foldseek permiten indexar un conjunto de secuencias propias y buscar relaciones estructurales remotas sin calcular estructuras, útil en anotación funcional de proteomas recién secuenciados.
- Cribado de diseños de novo: al puntuar pLDDT y desorden sobre las secuencias generadas por modelos de diseño, se puede filtrar rápidamente la biblioteca y quedarse con los candidatos más plausibles antes de validación experimental.
- Integración en workflows bioinformáticos reproducibles: al ser un modelo pequeño con opciones de cuantización INT8 y GGUF, se puede empaquetar dentro de pipelines Snakemake o Nextflow que corran en nodos sin GPU o incluso en portátiles.
- Enriquecimiento de metadatos de bases de datos internas: la resolución declarada de identificadores UniProt permite asociar embeddings y predicciones a entradas canónicas, facilitando la trazabilidad en catálogos propios de proteínas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Ninguno está verificado de forma independiente (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Predicción de pLDDT | AlphaFold DB | MAE | 5,2 |
| Detección de fronteras de dominios | AlphaFold DB | F1 | 0,78 |
| Puntuación de desorden intrínseco | DisProt | AUC | 0,91 |

Valores adicionales incluidos en la tabla de resultados de la model card, también declarados por el autor y sin verificación independiente:

| Tarea | Métrica | Valor |
|---|---|---|
| CASP15 GDT-TS | Correlación de Pearson | 0,83 |
| pLDDT empírico | MAE | 24,9567 |
| Throughput de procesamiento de secuencias | seq/s | 5,01 |

No se especifica el hardware empleado para la medición de throughput, ni el protocolo de evaluación de CASP15 y del "pLDDT empírico". Los dos valores de MAE (5,2 y 24,9567) son inconsistentes entre sí y se desconoce en qué se diferencian exactamente.

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 32 MB de pesos, por lo que la inferencia cabe en cualquier GPU con más de 1 GB de memoria y también en CPU.
- FP16: aproximadamente 16 MB de pesos, con latencias declaradas de 3 ms por secuencia en una GPU T4.
- INT8: aproximadamente 8 MB, con 2 ms por secuencia en GPU T4 y 8 ms en CPU.
- GGUF/Q4_K_M: aproximadamente 5 MB, con 6 ms por secuencia en CPU; no se reporta latencia en GPU para este formato.
- GPU recomendadas: no requiere acelerador dedicado. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente; también es viable en CPU de forma interactiva.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; en la práctica la limitación será el tamaño del lote y de la secuencia, no los pesos.
- Opciones de despliegue: transformers (PyTorch) de forma nativa, con posibilidad de exportación a ONNX según los badges de la model card y de cuantización GGUF/Q4_K_M según su tabla de memoria. No se documenta compatibilidad verificada con vLLM, TGI, Ollama o llama.cpp.
- Latencia declarada: 15 ms por secuencia en CPU en FP32 y 5 ms en GPU T4; 10 ms en CPU y 3 ms en GPU T4 en FP16. Throughput declarado de 5,01 secuencias por segundo, sin especificar hardware ni tamaño de secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlphaFold-Embed-8M | 8M | 1024 residuos | pLDDT, dominios, desorden y embeddings | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| facebook/esm2_t6_8M_UR50D | 8M | 1024 tokens (arquitectura ESM-2) | Embeddings generales de proteínas | no disponible en la información proporcionada | HuggingFace (modelo base) |
| facebook/esm2_t33_650M_UR50D | 650M | 1024 tokens (arquitectura ESM-2) | Embeddings generales de proteínas | no disponible en la información proporcionada | HuggingFace |
| Predictores de estructura 3D (AlphaFold2, ESMFold) | cientos de millones | variable, típicamente limitado por memoria | Coordenadas 3D atómicas | no disponible en la información proporcionada | Repositorios públicos |

El eje diferencial de AlphaFold-Embed-8M no es la precisión absoluta, sino el coste: ofrece señal estructural derivada de la secuencia con dos órdenes de magnitud menos de parámetros que ESMFold o AlphaFold2, a cambio de no producir coordenadas 3D. Frente a su modelo base ESM-2 8M, añade cabezas específicas de pLDDT, dominios y desorden, con métricas declaradas pero no verificadas. No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Inconsistencia interna en las métricas: la model card declara MAE de pLDDT de 5,2 en el model-index y de 24,9567 en la tabla de benchmarks, sin explicar la diferencia ni el protocolo de cada medición.
- Ninguna métrica está verificada de forma independiente (`verified: false`); todas proceden del autor.
- Discrepancia de identidad: el encabezado de la model card referencia `MedinaMemorySystems/AlphaFold-Embed-8M`, mientras que el repositorio de HuggingFace es `ItsnotAilabs/AlphaFold-Embed-8M`. Conviene confirmar cuál es la fuente canónica antes de integrarlo en producción.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin evidencia de uso en la comunidad.
- Límite de 1024 residuos: las proteínas más largas deben truncarse o fragmentarse en trozos solapados, lo que puede romper la coherencia de las predicciones en las fronteras entre fragmentos.
- No genera coordenadas 3D: predice confianza estructural (pLDDT) y desorden, pero no sustituye a un predictor de estructura si se necesitan coordenadas físicas.
- Rendimiento degradado en péptidos muy cortos: la propia model card advierte de que las predicciones de desorden en secuencias de menos de 20 aminoácidos pueden presentar mayor error (el texto proporcionado queda truncado en ese punto).
- Riesgo de extrapolación en secuencias atípicas: al ser un ajuste fino de un modelo de 8M parámetros, la capacidad de representación es limitada en comparación con variantes ESM-2 de 650M o 3B; no se documenta su comportamiento fuera de la distribución de UniRef50, AlphaFold DB y DisProt.
- Alucinación en sentido biológico: las predicciones de estructura o desorden son inferencias estadísticas y deben validarse experimentalmente antes de cualquier aplicación en diseño de proteínas o terapéutica.
- Nota de bioseguridad: el propio autor recomienda seguir las directrices institucionales al predecir estructuras de organismos patógenos.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se identifican restricciones adicionales, pero al derivar de un modelo base conviene revisar la licencia de facebook/esm2_t6_8M_UR50D, no confirmada en la información disponible.
- Idiomas: la etiqueta `en` del repositorio no es relevante para el uso real, que se limita a secuencias de aminoácidos en notación de una letra; cualquier otro tipo de entrada no está soportado.
- No se documentan sesgos específicos, ni composición del dataset de ajuste, ni número de tokens de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsnotAilabs/AlphaFold-Embed-8M
- Modelo base: https://huggingface.co/facebook/esm2_t6_8M_UR50D
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados correspondían a páginas genéricas de YouTube, sin relación con AlphaFold-Embed-8M, por lo que no se incluyen. No se han localizado papers, blogs, repositorios ni demos asociados al modelo en la información disponible.

# brandonmusic/Muse-Spark-Open-816B-A42B-TrellisMX-K3-FP4

## Resumen

Muse-Spark-Open-816B-A42B-TrellisMX-K3-FP4 es una versión cuantizada a 3 bits del modelo multimodal Muse Spark Open de Meta Superintelligence Labs, publicada por el usuario `brandonmusic` en HuggingFace. El modelo base es un MoE disperso de 816.000 millones de parámetros totales con 42.000 millones activos por token, ventana de contexto de 1 millón de tokens y entrenamiento orientado a código y trabajo agéntico de largo horizonte; es además nativamente multimodal (pipeline `image-text-to-text`). Esta variante aplica el esquema de cuantización TrellisMX K3 del autor, con formatos FP4 y MXFP8, para reducir el peso en disco y en VRAM respecto a las versiones BF16 y NVFP4 oficiales.

La relevancia de la ficha es doble. Por un lado, permite ejecutar un modelo de 816B en infraestructura multi-GPU más modesta que la requerida por BF16 (el repositorio ocupa 363,5 GB). Por otro, el autor publica una evaluación de fidelidad distribucional frente a la referencia BF16: divergencia KL media de 0,037675 nats y un 94,331% de acuerdo top-1 sobre ventanas de 2.048 tokens, lo que da una medida cuantitativa de la degradación introducida por la cuantización en lugar de una afirmación genérica de calidad.

Conviene señalar dos cautelas desde el principio: el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace, y la licencia declarada es `muse-model-license` (etiquetada como `license:other`), por lo que el uso comercial debe verificarse contra el texto de la licencia del modelo base antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (sparse-MoE) multimodal, según la model card del modelo base; número de capas, atención y detalles de enrutamiento no disponibles |
| Parametros totales | 816.000 millones (modelo base). El recuento de safetensors del repo cuantizado indica 23.594.934.784, cifra incoherente con 816B y que debe verificarse |
| Parametros activos | 42.000 millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | TrellisMX K3 del autor: 3 bits por parámetro, con formatos FP4 y MXFP8. El modelo base oficial se distribuye en BF16 y NVFP4 |
| Idiomas soportados | no disponible (el campo de idiomas no está poblado en la ficha) |
| Licencia | `muse-model-license` (etiquetada como `license:other` en HuggingFace) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 363,5 GB |
| Pipeline declarado | image-text-to-text |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Modelo base | meta-models/Muse-Spark-Open-816B-A42B |
| Autor de la cuantizacion | brandonmusic |
| Fecha de publicacion | 16 de octubre de 2026 (actualizado el 18 de octubre de 2026) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE disperso: 816.000 millones de parámetros totales con 42.000 millones activos por token, lo que desacopla la capacidad almacenada del coste computacional por forward pass. La ventana de contexto es de 1 millón de tokens y el modelo es nativamente multimodal, es decir, acepta imagen y texto como entrada en un único pipeline `image-text-to-text`. La model card del modelo base lo describe explícitamente como un modelo orientado a código y a trabajo agéntico, y la receta de vLLM lo clasifica como modelo de razonamiento sparse-MoE para coding agéntico de largo horizonte. También se indica que Muse Glimmer 30B fue destilado a partir de este modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card del modelo base menciona que la versión de pesos abiertos incorpora post-entrenamiento adicional de seguridad para hacerla más robusta. Respecto a esta variante concreta, la innovación técnica es la cuantización TrellisMX K3: un esquema de 3 bits por parámetro del propio autor, que combina FP4 y MXFP8 y que se evalúa empíricamente contra las logits de referencia en BF16 mediante divergencia KL y acuerdo top-1. No se detalla en la información disponible la metodología interna del esquema (agrupación, escalas, tratamiento de capas sensibles).

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento implícito según la clasificación del modelo base como reasoning model.
- Generación y comprensión de código, con foco declarado en ingeniería de software compleja y tareas agénticas de largo horizonte.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`).
- Manejo de contextos de hasta 1.000.000 de tokens, adecuado para repositorios completos, expedientes documentales o sesiones agénticas prolongadas.
- Uso como profesor en destilación: Muse Glimmer 30B se destiló a partir de este modelo, lo que evidencia capacidad de generar trazas de alta calidad.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el enfoque agéntico del modelo base lo hace esperable. Verificar antes de integrar.
- Capacidades multilingües: no disponibles (sin listado de idiomas).
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Ingeniería de software asistida sobre repositorios completos: con 1M de tokens de contexto se puede cargar un monorepo mediano junto con sus tests y trazas de CI para que el modelo razone sobre el impacto de un cambio, en lugar de fragmentar el análisis por ficheros.
- Agentes de mantenimiento autónomos: el modelo puede encadenar lectura de issues, localización del código afectado, propuesta de parche y ejecución de la suite de pruebas dentro de un bucle multi-paso, aprovechando los 42B parámetros activos para mantener latencia por token contenida en comparación con un denso de 816B.
- Revisión de código y auditoría de seguridad en pipelines de CI/CD: integrado como paso de revisión, el contexto largo permite evaluar el diff junto con el historial relevante y las políticas internas del equipo.
- Análisis de documentación técnica multimodal: al aceptar imagen y texto, puede procesar diagramas de arquitectura, capturas de paneles de monitorización o esquemas de infraestructura junto al texto de la documentación asociada.
- Asistencia a investigación con corpus extensos: lectura y síntesis de conjuntos de papers, normativa o expedientes que superan el millón de tokens, manteniendo coherencia entre secciones distantes del documento.
- Destilación y generación de datos sintéticos: uso del modelo como profesor para producir trazas de razonamiento y pares instrucción-respuesta destinados a entrenar modelos más pequeños, un patrón ya validado por Muse Glimmer 30B.
- Migración de bases de código legacy: el contexto largo permite mantener simultáneamente el código antiguo, el nuevo y las reglas de transformación, reduciendo inconsistencias en refactorizaciones de gran escala.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del `model-index` de la model card, que miden fidelidad distribucional frente a la referencia BF16, no rendimiento en tareas estándar. Todos los valores están marcados como no verificados (`verified: false`) y proceden del autor de la cuantización.

| Metrica | Valor | Direccion | Conjunto de evaluacion |
|---|---|---|---|
| Divergencia KL media token a token (referencia ‖ candidato), texto, ventanas de 2.048 tokens, 124 ventanas | 0,037675 nats | Menor es mejor | evaluation set v2 (128 ventanas x 2.048 tokens, carpeta v2-2k/), revision 0bd19bd |
| Acuerdo top-1 con la referencia, texto, ventanas de 2.048 tokens | 0,94331 (94,331%) | Mayor es mejor | evaluation set v2, revision 0bd19bd |

El estimador de la divergencia KL es `full_vocabulary_fp64` sobre el vocabulario completo. Como referencia de lectura: un acuerdo top-1 del 94,331% implica que aproximadamente 5,7 de cada 100 tokens no coinciden con la predicción principal del modelo en BF16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de tareas en la información disponible, ni para esta variante ni en los fragmentos consultados del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 363,5 GB, de modo que los pesos en TrellisMX K3 requieren al menos ~364 GB de memoria de GPU, a lo que hay que sumar la caché KV. El tamaño exacto de la caché KV a 1M de tokens no está disponible en la información proporcionada y, con 816B de parámetros, será el factor dominante en despliegues de contexto largo.
- GPU recomendadas: para servir el modelo completo, nodos de 8 GPU. Con H100 de 80 GB se obtienen 640 GB, suficientes para los pesos pero con margen ajustado para caché KV; con H200 de 141 GB u opciones de mayor memoria el margen es mucho mayor. Para contexto corto y batch pequeño, un nodo de 8xH100 es el mínimo razonable.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 pueden alojar 363,5 GB de pesos. La cuantización a 3 bits ya está aplicada en estos pesos; no hay margen adicional de compresión declarado en la información disponible.
- Opciones de despliegue: vLLM cuenta con receta oficial para el modelo base. Existe entrada en la librería de Ollama (`muse-spark-open`), aunque el despliegue local de 816B queda fuera del alcance de equipos de consumo. Formato GGUF para llama.cpp: no disponible. TGI: no confirmado en la información consultada.
- Latencia y throughput: no disponibles. Los 42B parámetros activos por token sitúan el coste computacional por token en el orden de un modelo denso de 42B, pero el cuello de botella real será el ancho de banda de memoria al leer los expertos activados en cada capa.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Spark-Open-816B-A42B-TrellisMX-K3-FP4 (esta ficha) | 816B / 42B | 1M | 3 bits (FP4/MXFP8) | Muse Model License | Gated, 363,5 GB |
| Muse-Spark-Open-816B-A42B (BF16) | 816B / 42B | 1M | BF16 | Muse Model License | Pesos abiertos, colección oficial |
| Muse-Spark-Open-816B-A42B (NVFP4) | 816B / 42B | 1M | FP4 | Muse Model License | Pesos abiertos, colección oficial |
| Muse Glimmer 30B | 30B (activos no disponibles) | no disponible | no disponible | no disponible | Destilado del 816B |

La comparación relevante es entre variantes de precisión del mismo modelo, porque el rendimiento en tareas depende del modelo base y solo cambia la fidelidad respecto a BF16. Frente a la variante NVFP4 oficial, esta versión reduce la huella a 3 bits por parámetro (363,5 GB) a costa de una divergencia KL de 0,037675 nats y un 94,331% de acuerdo top-1, métricas que el autor reporta precisamente para cuantificar ese compromiso. No se dispone de datos de benchmarks de tareas para ninguna de las variantes, por lo que no es posible comparar calidad downstream entre ellas con la información disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar 363,5 GB de pesos.
- Licencia `muse-model-license` con etiqueta `license:other`: no es una licencia OSI estándar. Es imprescindible leer el texto completo para confirmar si el uso comercial, la redistribución de derivados o el serving como API están permitidos.
- Incoherencia en el recuento de parámetros: los metadatos de safetensors declaran 23.594.934.784 parámetros, muy lejos de los 816B del modelo base. El tamaño del repositorio sí es consistente con 816B a ~3,5 bits por parámetro, pero conviene verificar los índices de safetensors antes de planificar el despliegue.
- Benchmarks autodeclarados y no verificados: los valores de divergencia KL y acuerdo top-1 llevan `verified: false` y proceden del autor de la cuantización, no de una evaluación independiente.
- Discrepancia menor en el conjunto de evaluación: el nombre del dataset describe 128 ventanas x 2.048 tokens mientras que la métrica indica 124 ventanas de texto. No se explica en la información disponible.
- Degradación por cuantización: un 5,7% de desacuerdo top-1 respecto a BF16 puede traducirse en errores acumulados relevantes en tareas de código con sintaxis estricta o en cadenas de razonamiento largas, donde un único token divergente altera el resto de la secuencia.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de tasa de alucinación en la información disponible.
- Idiomas: sin listado declarado. No se puede asumir calidad homogénea fuera del inglés, y menos aún en castellano, sin evaluación previa.
- Post-entrenamiento de seguridad: el modelo base incorpora ajuste adicional de seguridad, pero no se detallan las categorías cubiertas ni las tasas de rechazo, lo que puede afectar a casos de uso legítimos.
- Contexto de 1M: la ventana efectiva suele ser inferior a la nominal. No hay datos de rendimiento en recuperación de información a distintas distancias dentro de la ventana.
- Coste de despliegue: requiere un nodo multi-GPU de gama alta; no es viable en hardware de consumo ni en instancias de una sola GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brandonmusic/Muse-Spark-Open-816B-A42B-TrellisMX-K3-FP4
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Colección oficial Muse Spark Open: https://huggingface.co/collections/meta-models/muse-spark-open
- Receta de despliegue en vLLM: https://recipes.vllm.ai/meta-models/Muse-Spark-Open-816B-A42B
- Entrada en la librería de Ollama: https://ollama.com/library/muse-spark-open
- Registro de terceros con metadatos del modelo: https://free2aitools.com/model/brandonmusic/muse-spark-open-816b-a42b-trellismx-k3-fp4

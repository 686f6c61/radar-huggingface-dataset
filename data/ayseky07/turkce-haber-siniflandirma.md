# AyseKY07/turkce-haber-siniflandirma

## Resumen

`AyseKY07/turkce-haber-siniflandirma` es un modelo de clasificación de texto en turco obtenido por ajuste fino (fine-tuning) del checkpoint `dbmdz/bert-base-turkish-uncased`. Lo desarrolla el usuario AyseKY07 y se publica bajo licencia MIT. El modelo resuelve una tarea concreta: clasificar textos periodísticos en turco, presumiblemente por categoría temática, aunque la model card no especifica el conjunto de etiquetas ni la composición del corpus de entrenamiento.

Arquitectura BERT base (transformer encoder bidireccional) con 110.622.727 parámetros totales, pesos en safetensors y un tamaño de repositorio de 0,4 GB. El modelo se generó automáticamente con la librería `Trainer` de Transformers, lo que implica que la model card es un esqueleto autogenerado y que buena parte de la documentación (descripción, datos de entrenamiento, usos previstos) está marcada como "More information needed".

Es relevante ahora por dos motivos: primero, cubre una laguna práctica, ya que hay pocos clasificadores de noticias en turco publicados y ligeros; segundo, su tamaño (110 M de parámetros) permite desplegarlo en CPU o en GPU consumer con latencias bajas. No obstante, la ausencia de información sobre el dataset, las etiquetas y los idiomas limita seriamente su uso en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (bidireccional) |
| Parametros totales | 110.622.727 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el BERT base subyacente admite 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización dinámica INT8 posible vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es turco; la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar: 12 capas de encoder transformer con atención bidireccional completa, más una cabeza de clasificación de secuencia sobre el token `[CLS]`. El checkpoint base `dbmdz/bert-base-turkish-uncased` aporta el vocabulario y los pesos preentrenados en turco; el autor solo ha realizado el ajuste fino para la tarea de clasificación. El tokenizador es WordPiece sin distinción de mayúsculas.

El entrenamiento se ejecutó con `Trainer` de Transformers durante 3 épocas, con learning rate 5e-05, batch de entrenamiento 8, batch de evaluación 16, semilla 42, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), scheduler lineal y precisión mixta nativa (AMP). Se registran 1287 pasos totales (429 por época), lo que sugiere un conjunto de entrenamiento de aproximadamente 3.400 ejemplos con el batch de 8. No se documenta el dataset, el número de tokens de entrenamiento, la composición del corpus ni si hubo aumentación de datos. Tampoco se indica ningún proceso de RLHF, DPO ni innovación técnica adicional; es un fine-tuning supervisado convencional.

## Capacidades

- Clasificación de texto en turco: el modelo emite una etiqueta por secuencia de entrada mediante `pipeline("text-classification")`.
- Ajuste específico para textos periodísticos (noticias), según el nombre del repositorio.
- Devuelve puntuaciones de probabilidad por clase (softmax sobre la cabeza de clasificación).
- Compatible con `text-embeddings-inference` y con `endpoints_compatible` según los tags del repositorio, lo que permite desplegarlo como endpoint de inferencia.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades de visión, audio ni generación de texto libre.
- Capacidad multilingüe: no disponible; el modelo base está preentrenado en turco y no se declaran otros idiomas.

## Casos de uso

- Moderación y enrutado de noticias en un CMS: clasificar automáticamente cada artículo entrante en su sección (política, deportes, economía, etc.) antes de publicarlo, usando el pipeline de `text-classification` con un umbral de confianza configurable.
- Etiquetado de un archivo histórico de prensa turca: procesar en lote miles de artículos en CPU con un throughput alto gracias a los 110 M de parámetros y al tamaño de 0,4 GB del repositorio.
- Filtrado temático para agregadores de noticias: descartar o priorizar contenidos según la categoría predicha en un feed en tiempo real, con latencia de milisegundos por documento en GPU consumer.
- Señal auxiliar en sistemas de recomendación de contenido: usar la distribución de probabilidad de la cabeza de clasificación como feature adicional para el ranker.
- Detección de desviaciones editoriales: monitorizar la distribución de categorías publicadas por una redacción y alertar cuando cambie de forma anómala.
- Preetiquetado para anotación humana: generar etiquetas preliminares que los anotadores revisan, reduciendo el coste de construcción de un corpus etiquetado en turco.
- Clasificación de titulares y resúmenes: al ser un encoder BERT, puede aplicarse a textos cortos (titulares, lead de noticia) sin necesidad de truncar, siempre que se respete el límite de tokens del tokenizador.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,3401 |
| Accuracy | 0,9320 |
| F1 | 0,9313 |
| Precision | 0,9320 |
| Recall | 0,9320 |

Evolución por época según la model card:

| Epoca | Paso | Validation loss | Accuracy | F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1 | 429 | 0,3124 | 0,9224 | 0,9224 | 0,9231 | 0,9224 |
| 2 | 858 | 0,3066 | 0,9347 | 0,9344 | 0,9348 | 0,9347 |
| 3 | 1287 | 0,3260 | 0,9401 | 0,9401 | 0,9404 | 0,9401 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El `model-index` del repositorio está vacío (`results: []`), por lo que los valores anteriores no están verificados de forma independiente ni asociados a un dataset público identificable.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (110 M de parámetros × 4 bytes ≈ 0,44 GB), más el overhead de activaciones y tokenizador; en la práctica, 1-2 GB son suficientes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sobradamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas últimas el cuello de botella será el ancho de banda, no la memoria.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue en CPU: viable; con batch de 16-32 y secuencias de 128-256 tokens se pueden esperar decenas o cientos de documentos por segundo, dependiendo del hardware.
- Opciones de despliegue: `transformers` con `pipeline`, `text-embeddings-inference` (soportado según tags), ONNX Runtime, TorchScript, y servidores de inferencia estándar (Triton, BentoML). No se documenta soporte explícito de vLLM, llama.cpp ni Ollama, que no están orientados a clasificadores BERT.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamaño del modelo, es razonable esperar latencias de pocos milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero son estimaciones, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AyseKY07/turkce-haber-siniflandirma | 110,6 M | no disponible | Clasificación de noticias en turco | MIT | Hugging Face |
| dbmdz/bert-base-turkish-uncased | ~110 M | 512 tokens (BERT base) | Modelo base preentrenado en turco | MIT | Hugging Face |
| dbmdz/bert-base-turkish-cased | ~110 M | 512 tokens (BERT base) | Modelo base preentrenado en turco (sensible a mayúsculas) | MIT | Hugging Face |
| xlm-roberta-base | ~278 M | 512 tokens | Modelo multilingüe preentrenado | MIT | Hugging Face |

La comparación directa de rendimiento con alternativas no está disponible: no hay benchmarks públicos del modelo frente a otros clasificadores de noticias en turco. La principal diferencia frente a los checkpoints base de dbmdz es que este está ajustado para una tarea concreta, pero carece de la documentación y el mantenimiento de aquellos.

## Limitaciones y advertencias

- La model card es autogenerada y no documenta el dataset de entrenamiento, el conjunto de etiquetas ni el dominio exacto de las noticias; no es posible saber qué clases predice sin inspeccionar la configuración del modelo.
- El conjunto de evaluación no está identificado; las métricas (accuracy 0,9320) no son reproducibles ni verificables de forma independiente.
- Riesgo de sobreajuste al dominio: al entrenarse con ~3.400 ejemplos y 3 épocas, el modelo puede degradarse en estilos periodísticos distintos (opinión, crónica, teletipo) o en textos que no sean noticias.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Sesgos: no documentados. Al ser un fine-tuning sobre noticias turcas, puede heredar sesgos editoriales del corpus de origen, que se desconoce.
- Limitaciones de idioma: el modelo base es turco; no se declara soporte de otros idiomas y probablemente rinda mal en textos en otras lenguas.
- Límite de contexto: no declarado, pero el BERT base subyacente trunca a 512 tokens; los artículos largos requerirán truncamiento o segmentación.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero sin garantías; conviene conservar el aviso de copyright.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Para producción, se recomienda validar el modelo con un conjunto propio etiquetado y comprobar la lista exacta de etiquetas en `config.json` antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AyseKY07/turkce-haber-siniflandirma
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-uncased
- Repositorio del modelo base (dbmdz): https://github.com/dbmdz/berts
- Documentación de Transformers para `text-classification`: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de `text-embeddings-inference`: https://huggingface.co/docs/text-embeddings-inference

# azherali/CodeDetect-CodeBERT-T1

## Resumen

CodeDetect-CodeBERT-T1 es un modelo de clasificación de texto obtenido por fine-tuning de `microsoft/codebert-base`, un encoder tipo RoBERTa preentrenado sobre código fuente. Lo publica el usuario azherali en HuggingFace y su propósito declarado, a juzgar por el nombre, es la detección de código dentro de texto, aunque la model card no documenta la tarea exacta ni el conjunto de datos empleado (aparece literalmente como "None dataset"). No es un modelo generativo: devuelve una etiqueta por secuencia de entrada, por lo que su uso es el de un clasificador binario o multiclase.

El modelo tiene 124.647.170 parámetros (unos 125M, coherente con CodeBERT-base) y un tamaño de repositorio de 2,5 GB, que probablemente incluye checkpoints intermedios de las cinco épocas de entrenamiento. El autor declara unas métricas de evaluación de accuracy 0,9747, F1 0,9746, precisión 0,9750 y recall 0,9744, con una pérdida de validación de 0,1114, aunque sin identificar el conjunto de evaluación.

Su relevancia práctica es limitada pero concreta: los clasificadores ligeros de código son útiles como filtros previos en pipelines de datos (limpieza de corpus, detección de snippets en texto libre, guardarraíles de entrada). Ahora bien, la ausencia de licencia declarada, de documentación sobre los datos de entrenamiento y de validación externa (0 descargas, 0 likes en el momento de la consulta) obligan a tratar sus cifras como no verificadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (CodeBERT), solo encoder, cabeza de clasificación de secuencias |
| Parametros totales | 124.647.170 (medido en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite posicional del modelo base CodeBERT; no se explicita en la model card) |
| Tipos de cuantizacion | No disponibles en el repositorio; por tamaño es viable exportar a ONNX e int8 (no publicado por el autor) |
| Idiomas soportados | No disponible (los tokens de código son multilingües por naturaleza, pero el autor no lo documenta) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de CodeBERT-base: un transformer encoder con mecanismo de autoatención bidireccional, sin decodificador, sobre el que se añade una cabeza de clasificación (pooler + capa lineal) entrenada de forma supervisada. Al ser un encoder, no genera texto ni mantiene conversaciones: procesa la secuencia completa de entrada y emite logits por clase. El modelo base combina preentrenamiento en modalidad única (MLM sobre código) y en modalidad emparejada (reemplazo de tokens, alineando lenguaje natural y código), lo que le da representaciones útiles para tareas que relacionan descripciones textuales y fragmentos de código.

El fine-tuning se realizó durante 5 épocas con learning rate 2e-5, batch de 64 en entrenamiento y evaluación, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con warmup del 10 % de los pasos y precisión mixta nativa (AMP), con semilla 42. El registro del Trainer muestra 16.897 pasos por época, lo que implica aproximadamente 1,08 millones de ejemplos procesados por época (unos 5,4 millones de muestras acumuladas) para un total de 84.485 pasos. No se documenta la composición del dataset, el número de clases, el esquema de etiquetado ni si se aplicó alguna técnica de alineación posterior; tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, atención dispersa, etc.), ya que el proceso es un fine-tuning estándar con `Trainer`.

## Capacidades

- Clasificación de secuencias de texto: emite una etiqueta por entrada, presumiblemente indicando la presencia o ausencia de código en el texto.
- Procesamiento de fragmentos que mezclan lenguaje natural y código, gracias al preentrenamiento multimodal del modelo base.
- Manejo de entradas de hasta 512 tokens; los textos más largos requieren truncamiento o segmentación en ventanas.
- Inferencia por lotes (batch) con gran throughput al ser un modelo de 125M de parámetros.
- Compatible con `transformers` (`pipeline("text-classification")`) y con el tag `text-embeddings-inference` / `endpoints_compatible` del repositorio.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües: no documentadas por el autor.

## Casos de uso

- Filtrado de corpus de entrenamiento: clasificar documentos web o scrapeados para separar los que contienen fragmentos de código de los que no, antes de alimentar un pipeline de preentrenamiento o de instrucciones. El bajo coste por token de un encoder de 125M lo hace adecuado para volúmenes de millones de documentos por lotes.
- Guardarraíl de entrada en asistentes: detectar si el mensaje de un usuario contiene código pegado (scripts, comandos de shell) y enrutarlo a un módulo especializado o aplicar políticas de seguridad antes de pasarlo a un LLM generativo.
- Moderación y clasificación de contenido en foros técnicos: etiquetar automáticamente publicaciones que incluyen bloques de código para enrutarlas a moderadores o a plantillas de renderizado distintas.
- Enrutado en pipelines de CI/CD: decidir si un cambio en un fichero de texto libre contiene código ejecutable y activar análisis estático o linters condicionalmente.
- Detección de código en entregas académicas: precribar memorias y trabajos en busca de fragmentos de código no declarados, como primer paso antes de una revisión humana.
- Aplicaciones de documentación y buscadores internos: clasificar resultados de búsqueda para separar artículos narrativos de ejemplos de código y presentar cada tipo con un formato distinto.
- Etiquetado de issues y pull requests: usar la etiqueta del clasificador como señal adicional en la categorización de incidencias (por ejemplo, incidencias que incluyen reproducciones en forma de código).

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación, sin identificar el dataset:

| Métrica | Valor final (época 5) |
|---|---|
| Loss (validación) | 0,1114 |
| Accuracy | 0,9747 |
| F1 | 0,9746 |
| Precisión | 0,9750 |
| Recall | 0,9744 |

Evolución durante el entrenamiento (datos del autor):

| Época | Paso | Loss entrenamiento | Loss validación | Accuracy | F1 | Precisión | Recall |
|---|---|---|---|---|---|---|---|
| 1,0 | 16.897 | 0,0843 | 0,0780 | 0,9713 | 0,9713 | 0,9712 | 0,9713 |
| 2,0 | 33.794 | 0,0650 | 0,0702 | 0,9752 | 0,9751 | 0,9753 | 0,9750 |
| 3,0 | 50.691 | 0,0507 | 0,0823 | 0,9729 | 0,9728 | 0,9734 | 0,9724 |
| 4,0 | 67.588 | 0,0377 | 0,0838 | 0,9768 | 0,9767 | 0,9767 | 0,9767 |
| 5,0 | 84.485 | 0,0256 | 0,1114 | 0,9747 | 0,9746 | 0,9750 | 0,9744 |

No hay comparación con otros modelos en la información disponible, y el `model-index` del repositorio está vacío (`results: []`). El mejor punto en validación se alcanza en la época 4 (0,9768 de accuracy), mientras que la época 5 muestra sobreajuste claro: la pérdida de validación sube de 0,0838 a 0,1114 mientras la de entrenamiento cae de 0,0377 a 0,0256.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB solo para pesos (124,6M × 4 bytes); en fp16 aproximadamente 0,25 GB; en int8 unos 0,13 GB. A esto hay que sumar activaciones, que crecen con el tamaño de lote y la longitud de secuencia (hasta 512 tokens).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090, GTX 1660). Para servir lotes grandes, una A10G, L4 o A100 aportan margen de throughput, aunque no son necesarias.
- Cabe holgadamente en GPU consumer e incluso en CPU: es un modelo de 125M de parámetros y 2,5 GB de repositorio (el peso real del checkpoint final es muy inferior a ese total).
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportación a ONNX Runtime con cuantización int8 para CPU, Text Embeddings Inference / Inference Endpoints (el repositorio lleva los tags correspondientes) y contenedores propios con FastAPI o Triton. vLLM no es la vía natural para un encoder de clasificación.
- Latencia y throughput: no se han publicado medidas. Cualitativamente, en una GPU consumer se espera procesamiento de cientos a miles de secuencias cortas por segundo con lotes grandes, pero se trata de una estimación de orden de magnitud, no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeDetect-CodeBERT-T1 | 124,6M | 512 tokens (según modelo base) | Clasificación de texto (detección de código, presunta) | No disponible | HuggingFace, 0 descargas |
| microsoft/codebert-base | 124,6M | 512 tokens | Encoder base, requiere fine-tuning para clasificar | No verificada en la información disponible | HuggingFace, ampliamente utilizado |
| Alternativas de detección de código con métricas publicadas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados de benchmarks de terceros ni de modelos comparables con métricas verificables en la información proporcionada, por lo que la comparación de rendimiento se limita al modelo base, sobre el que este checkpoint mejora por definición en la tarea concreta de su dataset (no identificado).

## Limitaciones y advertencias

- La licencia no está declarada: no hay autorización explícita de uso comercial, lo que supone un riesgo legal para integrarlo en producto.
- El conjunto de entrenamiento y evaluación no está documentado ("None dataset" en la model card): no se puede evaluar la representatividad, el dominio ni el equilibrio de clases.
- El nombre sugiere detección de código, pero ni la descripción, ni los usos previstos, ni las limitaciones están redactados; la tarea exacta y el esquema de etiquetas deben inferirse y validarse empíricamente.
- Métricas de validación muy altas (≈0,975) sin datos de test independiente: riesgo alto de que reflejen un dataset fácil, con clases desbalanceadas o con filtraciones entre train y validación.
- Sobrecoste de generalización: la mejor época es la 4, y la 5 empeora la pérdida de validación; usar el checkpoint final puede no ser óptimo.
- Alucinación en sentido estricto no aplica (no genera texto), pero sí falsos positivos y falsos negativos sistemáticos ante dominios distintos del corpus de entrenamiento (por ejemplo, código embebido en markdown, LaTeX o lenguajes poco frecuentes).
- Límite de 512 tokens: textos largos requieren truncado, con pérdida de señal si el código aparece al final del documento.
- Idiomas no declarados: se desconoce el comportamiento con texto en castellano frente a inglés.
- Validación comunitaria nula (0 descargas, 0 likes) y fecha de creación anómala en los metadatos (2026-10-24), lo que aconseja tratar el repositorio con cautela.
- No debe usarse como generador de código ni como filtro de seguridad único en producción sin una capa de validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azherali/CodeDetect-CodeBERT-T1
- Modelo base: https://huggingface.co/microsoft/codebert-base
- Paper, blog o demo del autor: no disponibles en la información proporcionada.

# jackstev/hw2-distilbert-garment-type

## Resumen

El modelo `jackstev/hw2-distilbert-garment-type` es un clasificador de texto de 5 clases que predice el tipo de prenda (top, bottom, outerwear, dress, footwear) a partir de descripciones cortas de producto. Lo publica el usuario jackstev como entrega del "Homework 2, Problem 3" de un curso, y se construye mediante un ajuste fino completo sobre `distilbert-base-uncased`, un encoder transformer destilado de BERT con 66.957.317 parámetros (66,9 M) y 512 posiciones de contexto máximo.

Se trata de un modelo muy pequeño y de propósito estrecho: no genera texto, no razona y no soporta tool calling. Su interés es exclusivamente práctico y didáctico, como ejemplo de clasificación supervisada de etiqueta única sobre un dataset minúsculo (100 descripciones originales, ~190 caracteres cada una) con aumento de datos léxico. El clasificador alcanza accuracy 1.000 y macro F1 1.000 tanto en validación (15 ejemplos) como en test (15 ejemplos), pero esas cifras proceden de conjuntos de evaluación extremadamente pequeños y de un dominio estereotipado.

La relevancia del modelo no está en su rendimiento absoluto, sino en lo que documenta su model card: el *stress test* en el que se sustituye el sustantivo de la prenda por la palabra "item" desploma la accuracy al 0,833 (macro F1 0,792), lo que evidencia que el clasificador depende en gran medida de la presencia del nombre de la prenda y no de la comprensión contextual de la descripción. Es un caso de estudio útil sobre sobreajuste a plantillas y sobre cómo interpretar métricas perfectas en datasets diminutos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base); el modelo base declara 6 capas, dimensión oculta 768 y 12 cabezas de atención |
| Parametros totales | 66.957.317 (66,9 M), dato real de safetensors, incluida la cabeza de clasificación de 5 clases |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 posiciones en el modelo base; entrenamiento y evaluación con `max_length = 64` tokens |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas. La cuantización int8/ONNX es viable por tamaño, pero no está validada por el autor |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (el dataset asociado no declara licencia) |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |
| Pipeline | text-classification (etiqueta única, 5 clases) |
| Etiquetas | 0 = top, 1 = bottom, 2 = outerwear, 3 = dress, 4 = footwear |
| Modelo base | distilbert-base-uncased |
| Dataset de entrenamiento | leixiang25/24679-hw1-text-garments (revisión 49d58b5a0942) |
| Métricas declaradas | accuracy, macro F1 |
| Compatibilidad declarada | text-embeddings-inference, endpoints_compatible |
| Fecha de creación | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de `distilbert-base-uncased`: un encoder transformer de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado de BERT-base y por tanto sin objetivo de generación ni de enmascaramiento enmascarado propio más allá del preentrenamiento heredado. Sobre él se añade una cabeza nueva de clasificación de 5 vías y se realiza un ajuste fino completo (`optim.peft = None` en terminología de AutoGluon): se actualizan todos los pesos, sin recurrir a las variantes parciales `bit_fit` o `norm_fit`. No hay innovaciones técnicas propias; el valor está en el protocolo y en la documentación del experimento.

Los datos provienen del dataset `leixiang25/24679-hw1-text-garments`, con 100 descripciones originales escritas por el autor del corpus a partir de fotos de producto retail. Los splits se usan tal cual se publicaron: entrenamiento con 70 originales más 1.289 copias ruidosas (intercambios y borrados de caracteres, permutaciones de palabras y sinónimos de WordNet), validación con 15 originales y test con 15 originales, 3 por clase en cada conjunto de retención, sin que ningún original cruce entre splits. El preprocesado se limita al tokenizador uncased de DistilBERT con `max_length = 64` y padding dinámico, de modo que el modelo también ve las copias con erratas durante el entrenamiento.

El entrenamiento se configura a un máximo de 6 épocas, learning rate 5e-5 con decaimiento lineal y 10 % de warmup, batch size 16, weight decay 0,01, semilla 24679 y precisión mixta en GPU. Con *early stopping* sobre la pérdida de validación y paciencia 2, se conservó la época 1 de las 3 ejecutadas. Todo el cómputo se realizó en una Tesla T4 y consumió 35 segundos. La model card declara explícitamente el uso de Claude (Anthropic) para redactar el notebook y la propia ficha.

## Capacidades

- Clasificación de texto de etiqueta única en 5 categorías de prenda: top, bottom, outerwear, dress, footwear.
- Procesamiento de descripciones cortas de producto en inglés (entrenado con `max_length = 64`, aunque el encoder admite hasta 512 posiciones).
- Robustez parcial frente a erratas y variaciones léxicas: el conjunto de entrenamiento incluye 1.289 copias con ruido de caracteres, palabras y sinónimos.
- Inferencia por lotes con padding dinámico y ejecución en CPU o GPU indistintamente, dado su tamaño.
- No soporta generación de texto: es un encoder con cabeza de clasificación, sin decoder.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés (`language: en`).
- No dispone de modo de razonamiento explícito (*thinking mode*), visión, audio ni multimodalidad.
- No es un modelo de embeddings reutilizable para similitud semántica general; se ha ajustado para la tarea concreta.

## Casos de uso

- Etiquetado automático de catálogo en comercio electrónico: dado un título o descripción corta de producto en inglés, asignar la categoría de prenda para poblar la taxonomía de una tienda. Es adecuado por latencia mínima y coste de cómputo casi nulo (66,9 M de parámetros), siempre que el texto se parezca al estilo del dataset de entrenamiento.
- Enriquecimiento de un PIM (product information management): clasificar en lote miles de fichas de producto que llegan sin categoría asignada y proponer una etiqueta para revisión humana posterior.
- Clasificación en marketplaces C2C: triaje de anuncios de particulares para enrutarlos a la sección de moda correspondiente antes de la moderación manual.
- Preprocesado para motores de búsqueda con facetas: generar la faceta de tipo de prenda que alimenta filtros de búsqueda y navegación.
- Control de calidad de catálogo: detectar incoherencias entre la categoría declarada por el vendedor y la que predice el modelo sobre la descripción, marcando fichas para revisión.
- Enrutado de tickets de devoluciones o incidencias: clasificar el texto de la reclamación por tipo de artículo para dirigirlo al equipo o flujo correspondiente.
- Prototipado y docencia: servir de plantilla reproducible para prácticas de ajuste fino con `transformers`, dado que la model card documenta hiperparámetros, splits, semilla y tiempo de entrenamiento (35 s en una T4).
- *Baseline* interno para tareas de categorización de producto: punto de partida barato contra el que comparar modelos mayores o enfoques de *zero-shot* antes de invertir en anotación.

En todos estos escenarios conviene tener presente que el modelo se entrenó sobre descripciones de una plantilla única escrita por una sola persona y que su rendimiento cae de forma notable cuando desaparece el sustantivo de la prenda (accuracy 0,833 en el *stress test*), por lo que el despliegue en producción exigiría una validación previa sobre texto real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, GLUE, etc.) en la información disponible. El autor solo reporta métricas de la tarea específica sobre sus propios splits:

| Split | Accuracy | Macro F1 | Errores |
|---|---:|---:|---:|
| Validación (15 ejemplos) | 1,000 | 1,000 | 0 |
| Test (15 ejemplos) | 1,000 | 1,000 | 0 |

Desglose por clase en test:

| Clase | Precision | Recall | F1 |
|---|---:|---:|---:|
| top | 1,00 | 1,00 | 1,00 |
| bottom | 1,00 | 1,00 | 1,00 |
| outerwear | 1,00 | 1,00 | 1,00 |
| dress | 1,00 | 1,00 | 1,00 |
| footwear | 1,00 | 1,00 | 1,00 |

Prueba de esfuerzo (*stress test*), sustituyendo el sustantivo de la prenda por la palabra "item" en las 30 descripciones de validación y test:

| Escenario | Accuracy | Macro F1 |
|---|---:|---:|
| Descripciones originales | 1,000 | 1,000 |
| Sustantivo reemplazado por "item" | 0,833 | 0,792 |

Las matrices de confusión de ambos escenarios están publicadas en el repositorio del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 268 MB de pesos; en FP16, unos 134 MB; en int8, unos 67 MB. Con activaciones y lote pequeño, cabe holgadamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria. El autor entrenó el modelo en una Tesla T4 (35 segundos), que sirve también como referencia de inferencia válida. Una A100 o H100 no aportan ventaja significativa para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (serie RTX 20/30/40, GTX 10xx, e incluso iGPU con soporte de PyTorch). También funciona en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `transformers.pipeline("text-classification")` es la vía documentada por el autor. El modelo está etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`, por lo que puede servirse en Hugging Face Inference Endpoints. También son viables Text Generation Inference en modo clasificación, ONNX Runtime u Optimum para exportación, y un servidor FastAPI propio. vLLM contempla tareas de clasificación en versiones recientes, aunque no hay confirmación de que este checkpoint concreto haya sido probado. llama.cpp y Ollama no están orientados a cabezas de clasificación de este tipo.
- Latencia y throughput: no publicados. Como referencia indirecta, el ajuste fino completo sobre 1.359 ejemplos de entrenamiento con `max_length = 64` tardó 35 segundos en una Tesla T4, lo que sitúa el coste de cómputo por ejemplo en el orden de milisegundos en esa GPU.

## Comparativa con modelos similares

No se dispone de comparativas de rendimiento sobre este dataset para otros modelos. La tabla compara parámetros, contexto, licencia y disponibilidad; la columna de rendimiento en la tarea se deja como no comparable porque no existe una evaluación común publicada.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento en esta tarea |
|---|---|---|---|---|---|---|
| jackstev/hw2-distilbert-garment-type | 66,9 M | 512 (entrenado a 64) | en | apache-2.0 | safetensors | accuracy 1,000 en test (15 ejemplos); 0,833 en stress test |
| distilbert-base-uncased (base sin ajustar) | 66,9 M | 512 | en | apache-2.0 | safetensors | no aplica: no tiene cabeza de clasificación de prendas |
| bert-base-uncased (ajustado de forma equivalente) | 110 M | 512 | en | apache-2.0 | safetensors | no disponible (no evaluado sobre el mismo dataset) |
| facebook/bart-large-mnli (clasificación zero-shot) | ~407 M | 1024 | en | MIT (según la model card de su autor) | safetensors | no disponible (no evaluado sobre el mismo dataset) |

Frente al modelo base, la única diferencia funcional es la cabeza de 5 clases y el ajuste fino: el tamaño es idéntico (66,9 M), porque DistilBERT conserva la dimensión de embeddings del modelo del que destila. Frente a un BERT-base ajustado, este modelo ofrece un 39 % menos de parámetros a costa de 6 capas en lugar de 12. Frente a una aproximación *zero-shot* con un modelo NLI, la ventaja es el coste de inferencia (unas 6 veces menos parámetros) y la desventaja es la falta de flexibilidad para añadir categorías sin reentrenar.

## Limitaciones y advertencias

- Conjunto de test de 15 ejemplos: un solo error supone 6,7 puntos de accuracy, por lo que las métricas perfectas tienen un intervalo de confianza enorme.
- Sesgo de plantilla: las 100 descripciones originales las escribió una sola persona siguiendo una plantilla de ficha de producto homogénea. Se espera un rendimiento peor sobre listados reales, más sucios y heterogéneos.
- Fuga de la señal principal: el sustantivo de la prenda casi determina la respuesta. Al sustituirlo por "item", la accuracy cae a 0,833 y el macro F1 a 0,792, lo que indica dependencia del léxico superficial más que de la comprensión contextual.
- Taxonomía muy gruesa: solo 5 clases y los casos límite siguen el criterio del autor (un mono cuenta como dress, un jersey con cremallera como outerwear). No hay documentación de fronteras más finas.
- Las 1.289 copias ruidosas no son ejemplos independientes: son transformaciones de los 70 originales de entrenamiento, por lo que el conjunto efectivo de entrenamiento es mucho menor de lo que sugiere el recuento.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre. El riesgo equivalente es la clasificación errónea con alta confianza, especialmente en categorías ambiguas.
- Limitación de idioma: únicamente inglés. Cualquier entrada en castellano u otro idioma degradará el resultado sin aviso.
- Limitación de longitud: entrenado con 64 tokens; descripciones largas se truncarán si no se gestiona el padding y el truncado de forma explícita.
- Licencia: el modelo es apache-2.0, pero el dataset card no asigna licencia, así que su reutilización para entrenamiento requiere consultar al autor del corpus.
- Uso previsto: la propia model card indica que el modelo no está pensado para nada más allá de un trabajo de curso. No se declara validación en producción, ni versionado, ni monitorización de deriva.
- Sesgos: no se han auditado sesgos demográficos ni culturales. El corpus es ficticio y sin marcas ni datos personales, lo que limita el análisis de sesgo, pero también la representatividad del dominio.
- Descargas y likes a cero en el momento de la consulta: no hay evidencia de uso por terceros ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jackstev/hw2-distilbert-garment-type
- Dataset de entrenamiento: https://huggingface.co/datasets/leixiang25/24679-hw1-text-garments
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- La búsqueda web realizada no devolvió ningún enlace relevante al modelo (los resultados obtenidos correspondían a foros y sitios de videojuegos y pasatiempos sin relación con el proyecto).

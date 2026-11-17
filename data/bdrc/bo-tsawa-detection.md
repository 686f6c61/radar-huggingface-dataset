# BDRC/Bo-Tsawa-Detection

## Resumen

Bo-Tsawa-Detection es un modelo de clasificación de tokens (token classification) especializado en la detección de *Tsawa* (རྩ་བ་, texto raíz) en comentarios budistas tibetanos. Lo desarrolla el Buddhist Digital Resource Center (BDRC) y está afinado a partir de `jhu-clsp/mmBERT-base`, un encoder multilingüe basado en la arquitectura ModernBERT. El modelo resuelve un problema concreto de procesamiento de corpus: en un comentario, el autor cita un verso o un fragmento de prosa del texto raíz y a continuación lo explica; identificar exactamente qué fragmento es cita del texto raíz (Tsawa) y cuál es cita de otra obra es la tarea que aborda este modelo.

El modelo tiene 307.532.547 parámetros y trabaja sobre ventanas de 8.192 tokens, con un tokenizador mmBERT adaptado al tibetano. Emplea un esquema de etiquetado BIO (`O`, `B-TSAWA`, `I-TSAWA`) y está diseñado para funcionar junto a otros modelos de la misma familia, uno por cada capa de anotación (por ejemplo, `BDRC/Bo-Quotation-Detection` para filtrar citas de otras obras).

Es relevante para investigadores y desarrolladores que trabajan con corpus tibetanos digitalizados, ya que automatiza una tarea de anotación estructural que de otro modo requeriría revisión manual experta. El modelo se seleccionó únicamente sobre el split de validación y reporta un F1 de 0,842 en el conjunto de test de 22 libros, que sube a 0,890 al aplicar el filtro de citas opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.532.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por ventana (stride 5.120 para textos largos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tibetano (`bo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, inicializado desde `jhu-clsp/mmBERT-base` y adaptado a clasificación de tokens con tres etiquetas BIO. El entrenamiento se realizó sobre el dataset `BDRC/Bo-Tsawa-Dataset`, con ventanas de 8.192 tokens y stride de 5.120, usando el tokenizador de mmBERT. El split de entrenamiento contiene 92 libros, 4.850 ventanas y 16.716 spans; la validación, 18 libros, 456 ventanas y 1.582 spans; y el test de benchmark, 22 libros, 639 ventanas y 1.976 spans.

Los hiperparámetros principales fueron: 15 épocas planificadas con parada temprana (mejor checkpoint en la época 9,45), learning rate 1e-5, batch size 8 sin acumulación de gradientes, weight decay 0,01, gradient clip 0,3, warmup del 6 % de los pasos, precisión bf16 con gradient checkpointing y semilla 42. La función de pérdida es entropía cruzada por token con pesos de clase por frecuencia inversa (O 1,0; B 1.389,2; I 10,9). La selección del mejor checkpoint se hizo sobre el F1 a IoU 0,5 en validación, con una penalización por cortes de 5,0 durante el entrenamiento.

Una parte relevante de los datos (25 libros clásicos, 15.876 spans) proviene de repositorios públicos de WeBuddhist y no está anotada manualmente: las etiquetas Tsawa se derivan de los enlaces entre versos raíz y comentarios, por lo que heredan los errores de dichos enlaces. El resto de libros son textos de BDRC con spans anotados por humanos. La decodificación debe hacerse con Viterbi (solo transiciones BIO legales, penalización por cortes de 4,0); la decodificación por argmax es mucho peor (F1 de 0,49 en test).

## Capacidades

- Detección de spans de texto raíz (Tsawa) en comentarios budistas tibetanos mediante etiquetado BIO.
- Clasificación de tokens a nivel de span con decodificación Viterbi (transiciones BIO legales y penalización por cortes).
- Procesamiento de textos largos mediante ventanas de 8.192 tokens con stride de 5.120.
- Integración con el filtro opcional `BDRC/Bo-Quotation-Detection` para descartar spans que caen dentro de citas de otras obras.
- Trabajo exclusivo sobre tibetano (`bo`); no se declaran capacidades multilingües.
- No es un modelo generativo: no soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Anotación estructural de corpus de comentarios: el modelo identifica automáticamente los fragmentos de texto raíz citados en cada comentario, lo que permite segmentar y enlazar comentarios con su texto base en repositorios digitales como los de BDRC.
- Construcción de índices de citas: al detectar los spans Tsawa, se pueden generar índices que relacionen cada comentario con los versos raíz que cita, facilitando búsquedas y navegación en bibliotecas digitales tibetanas.
- Preprocesamiento para pipelines de NLP tibetano: los spans detectados pueden separarse del texto explicativo antes de aplicar otros modelos (traducción, análisis morfológico, búsqueda semántica) que se beneficiarían de trabajar solo con el texto raíz o solo con la glosa.
- Curaduría asistida de ediciones críticas: el modelo propone candidatos de cita que un editor humano revisa, reduciendo el trabajo manual de marcar qué partes de un comentario son texto raíz y cuáles son explicación.
- Filtrado de citas cruzadas: combinado con `BDRC/Bo-Quotation-Detection`, permite distinguir citas del texto raíz de citas de otras obras, una distinción que el modelo base por sí solo no resuelve y que es la principal fuente de error.
- Evaluación y control de calidad de corpus: al comparar los spans predichos con anotaciones existentes se pueden detectar enlaces rotos o anotaciones inconsistentes en los repositorios de origen, especialmente en los libros clásicos cuyas etiquetas provienen de enlaces de WeBuddhist.

## Benchmarks y rendimiento

Métrica: precisión, recall y F1 de span a IoU >= 0,5 en espacio de tokens, emparejamiento greedy uno a uno, decodificación Viterbi con penalización por cortes de 4,0.

| Split | F1 | Precision | Recall |
|---|---|---|---|
| test, 22 libros de benchmark (3.180 spans gold) | 0,842 | 0,811 | 0,876 |
| test, con filtro de citas | 0,890 | 0,916 | 0,865 |
| validation (etiquetas v11) | 0,789 | 0,726 | 0,863 |
| classical_test (6 comentarios) | 0,959 | 0,941 | 0,978 |

Advertencias del autor sobre estos resultados: `classical_test` comparte versos raíz con los comentarios de entrenamiento (aproximadamente el 99 % de sus versos también aparecen en un comentario de train), por lo que mide recall sobre texto raíz ya visto y no generalización; el autor recomienda juzgar el modelo con el test de 22 libros. La decodificación por argmax es muy inferior (F1 de 0,49 en test). Con solapamiento más estricto el rendimiento baja: F1 de 0,814 a IoU 0,9 y de 0,637 en coincidencia exacta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 307,5 millones de parámetros, en fp16 el peso del modelo ocupa aproximadamente 0,6 GB, y en bf16 similar; a ello hay que sumar la memoria de activaciones para ventanas de 8.192 tokens, que puede ser considerable.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no confirmado en la información disponible; por tamaño de parámetros es plausible en GPU de consumo con suficiente VRAM para secuencias de 8.192 tokens, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: la model card solo muestra el uso estándar con `transformers` (`AutoModelForTokenClassification` y `AutoTokenizer`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La comparación cualitativa con el modelo base y con el modelo complementario de la misma familia es la siguiente:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Bo-Tsawa-Detection | 307.532.547 | 8.192 tokens por ventana | Detección de spans Tsawa (BIO) | no disponible |
| jhu-clsp/mmBERT-base (base) | no disponible | no disponible | Encoder multilingüe general | no disponible |
| BDRC/Bo-Quotation-Detection | no disponible | no disponible | Detección de citas de otras obras | no disponible |

No se han identificado en la información disponible otros modelos especializados en detección de Tsawa con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Sobrepredice ligeramente: 3.434 spans predichos frente a 3.180 spans gold con penalización por cortes de 4,0.
- Las citas de otras obras son la principal fuente de error; el filtro con `BDRC/Bo-Quotation-Detection` ayuda (F1 de 0,842 a 0,890) pero no forma parte del modelo y solo se ha probado en este conjunto de test.
- Los datos clásicos de entrenamiento están etiquetados a partir de enlaces de versos raíz de WeBuddhist, no manualmente, por lo que arrastran los errores de esos enlaces.
- Los comentarios interlineales anotados palabra a palabra quedan fuera de la tarea (se apartaron 5 libros del entrenamiento).
- El rendimiento con solapamiento estricto es menor: F1 de 0,814 a IoU 0,9 y 0,637 en coincidencia exacta.
- La decodificación por argmax es inviable (F1 de 0,49 en test); es obligatorio usar Viterbi con transiciones BIO legales.
- El modelo solo soporta tibetano (`bo`); no hay capacidades multilingües declaradas.
- La licencia no está disponible en la información proporcionada, por lo que no se puede confirmar si el uso comercial está permitido.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un modelo discriminativo de clasificación de tokens, el riesgo relevante es de falsos positivos y falsos negativos en la detección de spans, no de generación de contenido.
- El modelo se seleccionó únicamente sobre validación; el autor advierte explícitamente de que `classical_test` no debe usarse para juzgar la generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BDRC/Bo-Tsawa-Detection
- Dataset de entrenamiento: https://huggingface.co/datasets/BDRC/Bo-Tsawa-Dataset
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo complementario de detección de citas: https://huggingface.co/BDRC/Bo-Quotation-Detection
- Buddhist Digital Resource Center (BDRC): https://www.bdrc.io/
- OpenPecha: https://openpecha.org/
- Tsadra Foundation: https://www.tsadra.org/

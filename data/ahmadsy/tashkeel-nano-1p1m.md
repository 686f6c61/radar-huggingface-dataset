# ahmadsy/tashkeel-nano-1p1m

## Resumen

Tashkeel Nano 1.1M es un modelo de diacritización del árabe (tashkeel) desarrollado por el usuario ahmadsy. Se trata de un transformer encoder bidireccional a nivel de carácter, con una cabeza de clasificación de 15 clases, cuyo único cometido es predecir las marcas diacríticas (fatha, damma, kasra, shadda, tanwin, sukun) de cada letra árabe de un texto. Con 1.083.328 parámetros (1,08 M) y un peso de 4,15 MiB en safetensors fp32, es un modelo extremadamente compacto, orientado a una tarea concreta y muy especializada.

Su relevancia radica en la relación entre tamaño y rendimiento: con 1,08 M de parámetros declara un 3,78 % de DER (CE) y un 12,73 % de WER (CE) en el benchmark público SadeedDiac-25, lo que lo sitúa en tercera posición de 11 sistemas en esa clasificación, por delante de GPT-4 y del modelo dedicado Sadeed de 1,5 B de parámetros.

El checkpoint publicado no es un único punto de entrenamiento, sino un *uniform soup* de 12 checkpoints intermedios (pasos 32.500 a 60.000) procedentes de una única ejecución de 60.000 pasos sobre el corpus v3full. El autor indica que la media de esos checkpoints, y no la continuación del entrenamiento, es lo que produce la mejora final. La licencia es research-only, por lo que su uso comercial queda restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional a nivel de caracter + cabeza de diacritizacion de 15 clases |
| Parametros totales | 1.083.328 (1,08 M) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | arabe (tarea principal), ingles (declarado); etiquetas ar, en |
| Licencia | other / research-only (solo investigacion) |
| Formato de pesos | safetensors (fp32, 4,15 MiB) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder bidireccional que opera a nivel de caracter, seguido de una cabeza de diacritización de 15 clases. El identificador interno del checkpoint es `e98_soupB` y el artefacto publicado se denomina `soupB_uniform`. Los pesos publicados corresponden a una media uniforme (*uniform soup*) de 12 checkpoints seleccionados de una única ejecución de 60.000 pasos, tomados entre los pasos 32.500 y 60.000 sobre el corpus `v3full`. El autor señala explícitamente que continuar el entrenamiento desde el paso 30.000 hasta el 60.000 no produjo una ganancia monótona por sí sola, y que es la media sobre ese conjunto de checkpoints del mismo *basin* la que logra el resultado final: el *soup* es la palanca, no el entrenamiento adicional.

La tarea es la predicción de las marcas diacríticas del árabe para cada letra. El modelo emite texto en orden canónico NFC (vocal antes de shadda), mientras que la referencia dorada del benchmark SadeedDiac-25 no es NFC (escribe la shadda antes de la vocal). Esto genera una discrepancia de serialización que se detalla en la sección de benchmarks. El pipeline completo de datos, entrenamiento y evaluación está disponible en el repositorio github.com/ahmadmhmdsy/tashkeel-nano. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del corpus `v3full` ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Diacritización completa de texto árabe: predice fatha, damma, kasra, shadda, tanwin y sukun para cada letra.
- Operación a nivel de carácter sobre el texto de entrada, lo que permite procesar palabras y secuencias fuera del vocabulario de modelos basados en subpalabras.
- Clasificación en 15 clases de marca diacrítica mediante la cabeza dedicada del encoder.
- Emisión de texto en orden Unicode NFC (forma canónica).
- Tarea de generación de texto según el pipeline declarado (`text-generation`), aunque funcionalmente se comporta como un etiquetador secuencial por carácter.
- Idiomas declarados: árabe y inglés (la capacidad real descrita es la diacritización del árabe).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.

## Casos de uso

- Preprocesado para síntesis de voz (TTS) en árabe: la diacritización es un paso previo habitual para obtener una pronunciación correcta; el modelo puede vocalizar grandes volúmenes de texto de forma automática antes de enviarlo al motor TTS, con un coste computacional mínimo.
- Enriquecimiento de corpus árabes para entrenamiento de LLM: añadir marcas diacríticas a corpus sin vocalizar mejora la calidad de los datos para modelos de lenguaje árabes; al ejecutarse con 1,08 M de parámetros puede recorrer colecciones enteras en CPU.
- Material educativo y aprendizaje de la lectura árabe: generación de textos vocalizados para estudiantes que aún necesitan las marcas para leer correctamente, integrándose en plataformas de enseñanza.
- Post-procesado de OCR de textos árabes: los motores de OCR suelen devolver texto sin vocales; este modelo puede restaurar el tashkeel para mejorar la legibilidad y la búsqueda sobre documentos escaneados.
- Tratamiento de textos clásicos y religiosos: la diacritización es especialmente relevante en árabe clásico y en textos coránicos, donde las marcas condicionan el significado y la recitación.
- Normalización y limpieza en pipelines de PLN árabe: como etapa de vocalización dentro de cadenas de preprocesado (tokenización, etiquetado morfológico, análisis sintáctico) que se benefician de texto diacritizado.
- Servicio de diacritización de bajo coste o en el borde (*edge*): con 4,15 MiB de pesos en fp32 puede desplegarse en entornos con recursos muy limitados o incluso en navegador o dispositivos embebidos, sin necesidad de GPU.

## Benchmarks y rendimiento

Resultado declarado por el autor en el `model-index` de la model card (no verificado por un tercero):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Arabic Diacritization | SadeedDiac-25 | DER (CE, %), evaluador del benchmark, orden de marcas normalizado | 3,78 |

Resultados en el benchmark público SadeedDiac-25. Todos los sistemas salvo el propio modelo se citan de la tabla de clasificación publicada; la fila del modelo corresponde a la lectura con el orden de marcas normalizado. `CE` = *case endings*; menor es mejor.

| Sistema | Parametros | DER (CE) | WER (CE) | DER (sin CE) | WER (sin CE) |
|---|---|---|---|---|---|
| Claude-3.7-Sonnet | - | 1,39 | 4,67 | 0,77 | 2,31 |
| Gemini-Flash-2.0 | - | 3,19 | 7,99 | 2,38 | 5,50 |
| tashkeel-nano-1p1m (este) | 1,08 M | 3,78 | 12,73 | 2,25 | 7,41 |
| GPT-4 | - | 3,86 | 5,27 | 3,86 | 10,93 |
| Sadeed (Kuwain 1.5B) | ~1,5 B | 7,29 | 13,74 | 5,26 | 9,92 |
| Aya-23-8B | 8 B | 25,63 | 47,49 | 19,76 | 40,25 |
| ALLaM-7B-Instruct | 7 B | 50,36 | 70,34 | 39,41 | 67,09 |
| Yehia-7B | 7 B | 50,88 | 70,23 | 39,77 | 67,15 |
| Jais-13B | 13 B | 78,68 | 99,75 | 60,73 | 99,57 |
| Gemma-2-9B | 9 B | 78,86 | 99,79 | 60,92 | 99,59 |
| SILMA-9B-Instruct-v1.0 | 9 B | 78,66 | 99,74 | 60,71 | 99,56 |

Posición del modelo: 3.º de 11 en DER (CE), 4.º en WER (CE), 2.º en DER (sin CE) y 3.º en WER (sin CE).

Advertencia del autor sobre el orden de las marcas. La referencia dorada del benchmark no está en NFC (escribe la shadda antes de la vocal), mientras que el modelo emite NFC (vocal antes de shadda). El evaluador es sensible al orden y descarta silenciosamente una shadda que sigue a una vocal, por lo que puntuar la salida cruda contra esa referencia penaliza todas las geminadas. Las dos lecturas son:

| Evaluacion del modelo | DER (CE) | WER (CE) | DER (sin CE) | WER (sin CE) |
|---|---|---|---|---|
| Tal cual se emite (NFC), puntuado literalmente | 8,78 | 31,14 | 6,19 | 22,73 |
| Orden de marcas normalizado a la convencion del benchmark | 3,78 | 12,73 | 2,25 | 7,41 |

Métrica propia del proyecto (`der_registered`, a nivel de palabra, media sobre fadel_test / sadeed25 / wikinews2014; no comparable con el DER del benchmark):

| Modelo | Parametros | fadel_test | sadeed25 | wikinews2014 | media de 3 |
|---|---|---|---|---|---|
| tashkeel-nano-1p1m (este) | 1,08 M | 5,20 | 11,71 | 17,64 | 11,51 |
| tashkeel-nano-4p5m (corregido NFC) | 4,49 M | 14,30 | 22,59 | 31,81 | 22,90 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,15 MiB para los pesos en fp32, más el consumo del runtime; en la practica cabe en cualquier entorno.
- GPU recomendadas: no requiere GPU. Funciona en CPU. Cualquier GPU, incluida una RTX 4090, una A100 o una H100, lo ejecutaria sobradamente, aunque estan infrautilizadas por el tamano del modelo.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso integradas, dado que el modelo ocupa unos pocos MiB.
- Opciones de despliegue: al ser un transformer estandar con pesos safetensors, es desplegable con librerias de inferencia generica (por ejemplo PyTorch, o runtimes compatibles con safetensors). No se especifican en la informacion disponible soportes concretos como vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | DER (CE) en SadeedDiac-25 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tashkeel-nano-1p1m | 1,08 M | Diacritizacion arabe | 3,78 (orden normalizado) | research-only | Pesos safetensors publicos |
| tashkeel-nano-4p5m | 4,49 M | Diacritizacion arabe | no disponible en esta informacion | no disponible | Pesos publicos (autor indica correccion NFC) |
| Sadeed (Kuwain 1.5B) | ~1,5 B | Diacritizacion arabe | 7,29 | no disponible en esta informacion | Modelo dedicado citado en la tabla |
| GPT-4 | no disponible | Modelo general | 3,86 | propietaria | API |

Comparado con el modelo dedicado de 1,5 B (Sadeed), este checkpoint obtiene mejor DER (CE) con tres ordenes de magnitud menos de parametros. Frente a modelos generales como GPT-4, queda ligeramente por delante en DER (CE) pero por detras en WER (CE). Para la comparativa con `tashkeel-nano-4p5m` se dispone unicamente de la metrica propia del proyecto (11,51 frente a 22,90 en la media de tres corpus), que no es comparable con el DER del benchmark. No se dispone de la licencia ni de mas detalles del resto de sistemas comparados.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo solo realiza diacritización del árabe; no es un modelo de propósito general pese a la etiqueta `text-generation`.
- Discrepancia de serialización Unicode: el modelo emite NFC (vocal antes de shadda) y la referencia de SadeedDiac-25 no; puntuar la salida cruda con el evaluador del benchmark arroja 8,78 % de DER (CE) frente al 3,78 % con el orden normalizado, un artefacto de serialización y no un error lingüístico.
- Comparabilidad aproximada: el benchmark no especifica si el resto de sistemas se puntuaron con o sin la misma normalización, por lo que la clasificación debe tratarse como aproximada.
- Resultado no verificado: la métrica del `model-index` figura con `verified: false`, es decir, declarada por el autor.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un clasificador por carácter puede producir marcas incorrectas o inventadas en palabras fuera de distribución (nombres propios, dialectos, tecnicismos, texto no árabe).
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; la tarea solo tiene sentido en árabe, aunque el modelo declare también inglés.
- Licencia restrictiva: research-only; el uso comercial está limitado y requiere revisar el archivo LICENSE del repositorio.
- Cobertura de entrenamiento no detallada: no se especifican número de tokens, composición del corpus `v3full` ni posibles sesgos del dataset, lo que dificulta evaluar la robustez fuera del dominio de evaluación.
- Adopción mínima: 0 descargas y 0 *likes* en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmadsy/tashkeel-nano-1p1m
- Modelo relacionado (tashkeel-nano-4p5m): https://huggingface.co/ahmadsy/tashkeel-nano-4p5m
- Dataset del benchmark SadeedDiac-25: https://huggingface.co/datasets/Misraj/SadeedDiac-25
- Evaluador del benchmark (misraj-ai/Sadeed): https://github.com/misraj-ai/Sadeed
- Codigo de entrenamiento y evaluacion: https://github.com/ahmadmhmdsy/tashkeel-nano

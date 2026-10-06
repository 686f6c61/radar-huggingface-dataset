# andresdfx/sarcasmo-xlmr-large

## Resumen

`sarcasmo-xlmr-large` es un modelo de clasificación de texto en español desarrollado por el usuario de HuggingFace `andresdfx`. Consiste en un afinamiento del encoder `xlm-roberta-large` sobre el corpus `Ernesto-1997/Sarcastic_spanish_dataset` para una tarea binaria: determinar si un texto en español contiene sarcasmo o no. El modelo se publica con pesos en formato safetensors y una licencia no especificada.

Se trata de un transformer encoder-only de arquitectura densa con 559.892.482 parámetros, lo que lo sitúa en la gama de los encoders multilingües grandes (aproximadamente 560 M de parámetros), con un tamaño de repositorio de 2,3 GB. No es un modelo generativo ni conversacional: su salida es una etiqueta de clasificación, por lo que su utilidad está acotada a pipelines de análisis de opinión, moderación de contenido y enriquecimiento de datos textuales.

Su relevancia actual es limitada pero concreta: el sarcasmo es un fenómeno pragmático difícil de detectar con modelos de sentimiento convencionales, y los resultados declarados por el autor en su propia partición de evaluación (F1 macro 0,9301 sobre un corpus con 40,0 % de ejemplos positivos) apuntan a un rendimiento alto en esa tarea específica. El modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, y no dispone de resultados de benchmarks independientes ni de comparaciones publicadas con alternativas sobre el mismo conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa-large, tipo BERT) |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del modelo; la arquitectura base XLM-RoBERTa soporta entradas de hasta 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin variantes cuantizadas) |
| Idiomas soportados | es (espanol); la arquitectura base es multilingue, pero el afinamiento esta orientado a espanol |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 2,3 GB |
| Autor | andresdfx |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only del tipo XLM-RoBERTa-large, con atención bidireccional completa y una cabeza de clasificación sobre la representación del token especial de secuencia. El entrenamiento parte de los pesos preentrenados de `xlm-roberta-large` y se realiza un afinamiento supervisado sobre `Ernesto-1997/Sarcastic_spanish_dataset`, un corpus binario de sarcasmo en español en el que el 40,0 % de los ejemplos son positivos (es decir, el 60,0 % son negativos). No se documenta composición adicional del dataset, número de tokens de entrenamiento ni proceso de filtrado.

La configuración de entrenamiento declarada por el autor es: tamaño de lote 8, 8 épocas con early stopping (paciencia 3) y semilla 42. Se emplea una pérdida ponderada por clase para compensar el desbalanceo del corpus, decisión coherente con que la exactitud no sea informativa por sí sola (un clasificador trivial que siempre prediga la clase mayoritaria alcanza 0,600 de exactitud). No se mencionan técnicas adicionales como decodificación especulativa, atención lineal, destilación ni fases de RLHF o DPO, que en un modelo encoder-only de clasificación no resultan aplicables.

## Capacidades

- Clasificación binaria de sarcasmo en textos en español: devuelve una etiqueta (sarcasmo / no sarcasmo) con sus puntuaciones asociadas.
- Análisis de sentimiento indirecto y detección de ironía verbal a nivel de frase o de fragmento, siempre que el texto se ajuste al dominio del corpus de entrenamiento.
- Procesamiento de entradas de hasta 512 tokens según la arquitectura base, adecuado para publicaciones, comentarios o párrafos cortos.
- Capacidad multilingüe heredada de XLM-RoBERTa únicamente a nivel de representaciones; el afinamiento está orientado a español y no se documenta su rendimiento en otros idiomas.
- No soporta generación de texto.
- No soporta tool calling ni function calling.
- No está diseñado para flujos de agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni entrada multimodal.

## Casos de uso

- Moderación de comunidades en español: el modelo puede puntuar comentarios y publicaciones para marcar intervenciones potencialmente sarcásticas o irónicas que un clasificador de toxicidad convencional interpretaría de forma literal, reduciendo falsos negativos en revisiones manuales.
- Análisis de opinión sobre productos o servicios: en reseñas donde la valoración textual contradice la puntuación numérica, el clasificador permite detectar reseñas irónicas y evitar que contaminen métricas agregadas de satisfacción.
- Enriquecimiento de datasets de NLP en español: uso como etiquetador automático para añadir una dimensión de sarcasmo a corpus de redes sociales antes de entrenar otros modelos o de realizar análisis estadísticos.
- Monitorización de reputación de marca: procesar menciones en tiempo real y separar las que expresan crítica sincera de las que emplean sarcasmo, con el fin de enrutar cada caso al equipo adecuado.
- Investigación en pragmática computacional: servir como línea base reproducible (semilla 42, hiperparámetros documentados) para estudiar la detección de ironía en español y comparar con aproximaciones basadas en modelos generativos grandes.
- Detección de reseñas falsas o engañosas: el sarcasmo y la ironía aparecen con frecuencia en reseñas fabricadas; una señal adicional de este tipo puede combinarse con otros clasificadores en un sistema de puntuación de riesgo.
- Filtrado previo en pipelines de atención al cliente: clasificar mensajes entrantes y priorizar aquellos con carga irónica o agresiva encubierta, que requieren una respuesta humana más cuidadosa.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles proceden de la model card del autor y corresponden a su propia partición de evaluación sobre `Ernesto-1997/Sarcastic_spanish_dataset`:

| Metrica | Valor |
|---|---|
| F1 macro | 0,9301 |
| F1 clase sarcasmo | 0,9147 |
| Exactitud | 0,9335 |
| Exactitud de un clasificador trivial (clase mayoritaria) | 0,6000 |
| Proporcion de ejemplos positivos en el corpus | 40,0 % |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de clasificación; no hay evaluaciones sobre otros corpus de sarcasmo en español ni comparación con terceros).

## Requisitos de hardware

- Pesos en precisión completa (fp32): aproximadamente 2,24 GB de VRAM solo para parámetros, más activaciones y memoria del runtime; el repositorio ocupa 2,3 GB, lo que es coherente con pesos fp32.
- Pesos en fp16/bf16: aproximadamente 1,12 GB de VRAM para los parámetros.
- Pesos en int8: aproximadamente 0,56 GB de VRAM para los parámetros (cuantización no publicada por el autor; requeriría conversión propia con ONNX Runtime, torch quantization o similar).
- Cabe sin dificultad en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4060) puede ejecutar inferencia en fp16. En CPU es viable con lotes pequeños, aunque con mayor latencia.
- GPU recomendadas para producción con alto throughput: NVIDIA T4, L4, A10G, A100 o H100. Para entrenamiento o afinamiento adicional, se recomienda A100 40 GB o superior.
- Opciones de despliegue: dado que es un modelo de clasificación con pesos safetensors, los caminos habituales son Transformers con PyTorch, exportación a ONNX Runtime, TorchScript, o servidores de inferencia como NVIDIA Triton o Text Embeddings Inference (para encoders). No hay integración documentada con vLLM, llama.cpp ni Ollama, orientados a modelos generativos.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

No hay resultados comparativos publicados sobre el mismo corpus, por lo que la comparación de rendimiento no puede establecerse con datos verificables. La siguiente tabla recoge únicamente lo que consta en la información disponible y lo que es propio de la arquitectura base:

| Modelo | Parametros | Contexto | Licencia | Rendimiento en el mismo corpus |
|---|---|---|---|---|
| andresdfx/sarcasmo-xlmr-large | 559.892.482 | no disponible (base XLM-R: 512) | no disponible | F1 macro 0,9301 |
| xlm-roberta-large (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible (no afinado para sarcasmo) |
| Otras alternativas de clasificacion de sarcasmo en espanol (por ejemplo BETO, RoBERTuito, BERTIN) | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas evaluadas sobre `Ernesto-1997/Sarcastic_spanish_dataset` ni sobre la licencia del modelo base, por lo que cualquier comparación cuantitativa adicional sería especulativa.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos por género, origen, variedad dialectal del español ni dominio temático. El corpus de origen no describe su composición, por lo que se desconoce su representatividad.
- Alucinación: al ser un clasificador, no genera texto y no puede alucinar en el sentido habitual; sin embargo, puede producir falsos positivos con confianza alta, especialmente ante ironía no sarcástica, hipérbole, humor o citas de terceros.
- Dominio: el rendimiento declarado (F1 macro 0,9301) corresponde a la partición de evaluación del propio autor. Sin validación externa, ese valor no es extrapolable a otros corpus, registros (formal, técnico, literario) ni variedades del español.
- Desbalanceo: el corpus tiene un 40,0 % de ejemplos positivos; las métricas declaradas se obtuvieron con pérdida ponderada por clase, pero la exactitud bruta no debe usarse como criterio de selección.
- Contexto limitado: la arquitectura base XLM-RoBERTa admite hasta 512 tokens, lo que impide procesar documentos largos sin truncado o segmentación.
- Idiomas: el modelo está etiquetado únicamente como `es`. Su uso en otras lenguas no está validado, aunque la arquitectura base sea multilingüe.
- Licencia: no disponible. La ausencia de licencia explícita impide determinar si se permite el uso comercial; en la práctica, esto supone un riesgo legal para cualquier despliegue en producción y obliga a contactar con el autor antes de usarlo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción, mantenimiento posterior ni respuesta del autor a incidencias.
- Fechas: la model card indica fechas de creación y actualización de 2026-10-06, con apenas un minuto de diferencia entre ambas, lo que sugiere una publicación única sin revisiones posteriores.
- Producción: no se han publicado mediciones de latencia, throughput, consumo de memoria ni pruebas de robustez (por ejemplo, frente a mayúsculas, emojis, negaciones o texto ofuscado), aspectos que habría que validar internamente antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andresdfx/sarcasmo-xlmr-large
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/Ernesto-1997/Sarcastic_spanish_dataset
- Repositorio del modelo base citado: https://huggingface.co/xlm-roberta-large
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a páginas genéricas de ChatGPT (chatgpt.com, openai.com, fr.wikipedia.org) sin relación con `sarcasmo-xlmr-large`. No se han localizado papers, blogs, repositorios ni demos adicionales.

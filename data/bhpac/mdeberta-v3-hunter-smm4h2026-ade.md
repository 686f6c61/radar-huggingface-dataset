# bhpac/mdeberta-v3-hunter-smm4h2026-ade

## Resumen

mDeBERTa-v3 Hunter es un clasificador binario multilingüe desarrollado por Bhaarat Pachori (equipo Bhramastra) para detectar publicaciones de redes sociales que puedan mencionar un evento adverso a medicamentos (ADE, *adverse drug event*). Se trata de un ajuste fino de `microsoft/mdeberta-v3-base` con 278.810.882 parámetros, publicado con licencia MIT, que constituye la primera etapa ("Hunter") del pipeline de dos fases Hunter-Judge presentado en la tarea 1 del taller #SMM4H-HeaRD 2026.

El modelo no está pensado para clasificar ADE de forma autónoma: está deliberadamente optimizado para recuerdo alto (0,93) sobre una clase positiva que solo representa en torno al 7 % de los datos, a costa de una precisión muy baja (0,32). Su función es actuar como prefiltro y reducir el volumen de publicaciones que se envían a un adjudicador posterior (un LLM en la etapa "Judge" o revisión humana), de modo que el pipeline completo alcanza un F1 de 0,6653 según el artículo de los autores.

Su relevancia actual reside en la farmacovigilancia a partir de texto generado por usuarios: permite procesar grandes volúmenes de mensajes en seis idiomas entrenados (en, de, fr, ru, ja, zh) y también en farsi solo en inferencia, con un coste computacional muy inferior al de un LLM generativo. El checkpoint acumulaba 0 descargas y 0 *likes* en HuggingFace en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v2 con atención desacoplada (*disentangled attention*), ajustado para clasificación de secuencias |
| Parámetros totales | 278.810.882 (dato real de los safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Hasta 512 tokens (límite del modelo base mDeBERTa-v3-base; no se explicita en la model card) |
| Tipos de cuantización | No disponible: no se publican variantes cuantizadas (los pesos safetensors admiten conversión externa a int8/ONNX) |
| Idiomas soportados | Entrenamiento: en, de, fr, ru, ja, zh. Inferencia zero-shot: fa (persa) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |
| Tarea (pipeline) | `text-classification` binaria (ADE / no ADE) |
| Modelo base | `microsoft/mdeberta-v3-base` |
| Tamaño del repositorio | 1,1 GB |
| Etiquetas de despliegue | `text-embeddings-inference`, `endpoints_compatible` |
| Fecha de creación (metadatos) | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La base es mDeBERTa-v3-base, un encoder transformer que combina la atención desacoplada de DeBERTa-v2 con un preentrenamiento estilo ELECTRA (*Replaced Token Detection*) y compartición de embeddings con gradiente desacoplado (GDES). La mayor parte del recuento de 278,8 M de parámetros procede de la matriz de embeddings del vocabulario multilingüe (SentencePiece, del orden de 250 000 tokens); sobre el encoder se añade una cabeza de clasificación de secuencia con dos etiquetas. El modelo no genera texto libre, por lo que no hay decodificación especulativa ni modos de razonamiento.

El ajuste fino se realizó con entropía cruzada ponderada por clase, con pesos `[1.0, 10.0]`, tasa de aprendizaje 2e-5 y *weight decay* 0.01, valores que coinciden con los reportados en el artículo. Los datos de entrenamiento son el conjunto oficial de la tarea 1 de #SMM4H-HeaRD 2026 más instancias de CADEC traducidas, bajo el acuerdo de uso de datos de la tarea; los pesos no redistribuyen ningún dato de entrenamiento. No hubo RLHF ni DPO, al no tratarse de un modelo generativo.

La model card advierte de que no se pudo reconstruir por completo el script y la configuración exactos del *run* original: el script `hunter/train.py` del repositorio se corrigió para implementar la pérdida ponderada y los hiperparámetros del artículo, pero otros ajustes (épocas, calendario de evaluación, métrica de selección de checkpoint) no están garantizados. El artefacto autorizado para reproducir los resultados es el checkpoint publicado, cuyas predicciones sobre el conjunto de test fueron evaluadas por los organizadores del *shared task*. En el pipeline se aplican umbrales de probabilidad específicos por idioma, calibrados para recuerdo, definidos en el repositorio de código.

## Capacidades

- Clasificación binaria de texto de redes sociales: distingue entre publicación con posible mención de ADE y publicación sin ella.
- Salida probabilística mediante softmax (índice 1 = ADE), lo que permite ajustar el umbral de decisión en función del coste relativo de falsos positivos y falsos negativos.
- Multilingüismo entrenado en seis idiomas (inglés, alemán, francés, ruso, japonés y chino) y transferencia zero-shot declarada para farsi.
- Comportamiento de alta sensibilidad: recuerdo de 0,93 sobre la clase ADE, adecuado como filtro previo.
- Umbrales por idioma calibrados para maximizar el recuerdo, según el repositorio de código de los autores.
- No soporta *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, matemáticas, generación de código ni visión.
- No dispone de modo de pensamiento (*thinking*) ni de salidas estructuradas más allá de la etiqueta y su probabilidad.

## Casos de uso

- Prefiltro en pipelines de farmacovigilancia: el modelo procesa volúmenes altos de publicaciones y descarta las que no mencionan ADE, de modo que solo los "sospechosos" llegan al adjudicador. Es adecuado porque su recuerdo de 0,93 minimiza los casos perdidos en esta primera fase.
- Reducción de coste de un LLM adjudicador: al enviar únicamente la fracción marcada, se reduce el número de inferencias de un modelo grande; en la práctica, con una prevalencia del 7 % y un recuerdo de 0,93, el filtro deja pasar una proporción pequeña del total.
- Sistemas de alerta temprana multilingües: monitorización continua de foros y redes en alemán, francés, ruso, japonés y chino con un único modelo en lugar de cinco clasificadores monolingües independientes.
- Anotación asistida con revisión humana: se usa como primera pasada para priorizar colas de revisión de farmacéuticos o anotadores, ya que está diseñado explícitamente para un flujo *human-in-the-loop*.
- Investigación en minería de redes sociales para salud: reproducción y comparación de resultados de la tarea 1 de #SMM4H-HeaRD 2026, con checkpoint público y métricas declaradas.
- Vigilancia poscomercialización de un fármaco concreto: análisis retrospectivo de conversaciones en redes para detectar señales temporales de reacciones adversas tras un lanzamiento o un cambio de formulación.
- Extracción en foros de pacientes: cribado de hilos largos en comunidades específicas para seleccionar mensajes con descripciones de síntomas tras la toma de un medicamento.
- Detección zero-shot en persa: uso exploratorio sobre texto en farsi, con la advertencia de que el rendimiento en ese idioma no está garantizado según el propio autor.

## Benchmarks y rendimiento

El autor publica únicamente métricas de la etapa Hunter en solitario (tabla 6 de ablación del artículo). No se han publicado resultados tipo MMLU, HumanEval o GSM8K, que no aplican a un clasificador binario.

| Métrica (clase ADE) | Valor |
|---|---|
| Precisión | 0,32 |
| Recuerdo | 0,93 |
| F1 | 0,48 |
| Exactitud (*accuracy*) | 0,86 |

Estos valores corresponden al filtro Hunter aislado y no al pipeline completo Hunter-Judge, que alcanza un F1 de 0,6653 según el artículo. No se dispone de desglose de métricas por idioma ni de comparación con otros sistemas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 1,1 GB; en FP16, unos 0,56 GB; en int8, unos 0,28 GB. Con lotes pequeños y secuencias de 512 tokens, el consumo total se mantiene en el rango de 1-2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 3090 o RTX 4090, con margen amplio para lotes grandes.
- También puede ejecutarse en CPU para volúmenes moderados, dado el tamaño del modelo; un servicio en GPU solo es necesario para procesar grandes caudales.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para la inferencia, aunque permiten mayor *throughput* si se procesan millones de publicaciones.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, HuggingFace Inference Endpoints (la etiqueta `endpoints_compatible` está presente), Text Embeddings Inference (etiqueta `text-embeddings-inference`) y exportación a ONNX Runtime para inferencia optimizada en CPU. No hay pesos GGUF publicados, por lo que no es desplegable directamente en llama.cpp u Ollama.
- Latencia y *throughput* concretos: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

La comparación siguiente es de especificaciones de catálogo del modelo base; no existen evaluaciones comparativas en la tarea ADE dentro de la información disponible.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Ajustado para ADE |
|---|---|---|---|---|---|
| bhpac/mdeberta-v3-hunter-smm4h2026-ade | 278,8 M | 512 tokens | 6 entrenados + fa zero-shot | MIT | Sí |
| microsoft/mdeberta-v3-base | 278,8 M | 512 tokens | Multilingüe (~100 idiomas) | MIT | No |
| FacebookAI/xlm-roberta-base | ~278 M | 512 tokens | Multilingüe (~100 idiomas) | MIT | No |
| google-bert/bert-base-multilingual-cased | ~178 M | 512 tokens | Multilingüe (104 idiomas) | Apache 2.0 | No |

Frente a un LLM adjudicador de la etapa Judge, la diferencia relevante es de coste y latencia: el Hunter tiene dos órdenes de magnitud menos parámetros y no genera texto, pero su precisión de 0,32 lo invalida como clasificador final.

## Limitaciones y advertencias

- Precisión muy baja en uso autónomo (0,32): aproximadamente dos de cada tres predicciones positivas son falsos positivos. El autor indica explícitamente que no debe usarse como clasificador ADE independiente.
- Prohibido su uso para decisiones clínicas de cualquier tipo, tal como señala la model card ("not intended for clinical decision-making").
- Entrenado exclusivamente con texto de redes sociales; el rendimiento en dominios como historiales clínicos, informes regulatorios o texto formal no está garantizado.
- Rendimiento no garantizado en idiomas o dominios fuera de los datos del *shared task*, incluido el farsi, que solo se cubre en modo zero-shot en inferencia.
- Puede reproducir sesgos presentes en los datos de entrenamiento (sesgos de género, edad, origen o de la propia distribución de las redes sociales utilizadas).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de asociaciones espurias entre términos y la etiqueta ADE aprendidas del corpus.
- Licencia MIT para los pesos, en consonancia con el repositorio de código; el modelo base y los datos del *shared task* tienen sus propios términos de uso, que deben respetarse por separado.
- Los datos de entrenamiento no se redistribuyen con los pesos.
- Trazabilidad limitada: la configuración exacta del entrenamiento original no pudo reconstruirse, por lo que la reproducibilidad depende del checkpoint publicado y no de un script verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhpac/mdeberta-v3-hunter-smm4h2026-ade
- Artículo (ACL Anthology): https://aclanthology.org/2026.smm4h-1.9/
- DOI del artículo: https://doi.org/10.18653/v1/2026.smm4h-1.9
- Repositorio de código: https://github.com/Team-Bhramastra/smm4h-task1-2026
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base

La búsqueda web realizada no devolvió enlaces relevantes adicionales sobre este modelo; los resultados obtenidos correspondían a consultas de prueba sin relación con la ficha.

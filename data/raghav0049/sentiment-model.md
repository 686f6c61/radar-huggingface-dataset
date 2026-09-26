# RAGHAV0049/sentiment-model

## Resumen

sentiment-model es un modelo de clasificación de sentimiento en inglés publicado por el usuario RAGHAV0049 en Hugging Face. Se trata de un ajuste fino (fine-tune) de distilbert-base-uncased, un transformer de tipo encoder con 66.955.779 parámetros, distribuido en formato safetensors y bajo licencia Apache 2.0. La tarea declarada es text-classification, con una ventana máxima heredada de la arquitectura DistilBERT de 512 tokens.

El modelo resuelve un problema acotado y bien delimitado: asignar una etiqueta de clase a un texto corto o medio. Su interés práctico no reside en el rendimiento, ya que declara un 65,98 % de accuracy y un F1 macro de 0,6493 en su propio conjunto de evaluación, sino en su huella mínima: 0,3 GB de repositorio y una inferencia viable en CPU y en GPUs de gama de entrada.

La documentación publicada es, sin embargo, muy escasa. El autor no especifica el dataset de entrenamiento, el número ni los nombres de las etiquetas, los idiomas soportados ni los casos de uso previstos, y el bloque model-index del repositorio no declara ningún resultado de benchmark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT): 6 capas, dimensión oculta 768, 12 cabezas de atención, con cabeza de clasificación de secuencia |
| Parámetros totales | 66.955.779 (recuento real de los pesos safetensors del repositorio) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite de posiciones de distilbert-base-uncased; el autor no lo declara en la model card) |
| Tipos de cuantización | no disponible: solo se distribuyen pesos safetensors sin versiones cuantizadas. Cuantizable a posteriori con optimum/ONNX Runtime o cuantización dinámica de PyTorch |
| Idiomas soportados | no disponible; el modelo base distilbert-base-uncased se entrena sobre corpus en inglés sin distinguir mayúsculas, por lo que el uso esperado es inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | distilbert/distilbert-base-uncased |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 0,3 GB |
| Fecha de publicación | 26 de septiembre de 2026 (según los metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint distilbert-base-uncased. DistilBERT es un transformer encoder destilado de bert-base-uncased mediante destilación de conocimiento (pérdida de destilación, masked language modeling y pérdida de similitud de embeddings coseno); conserva 6 capas y 768 dimensiones ocultas frente a las 12 capas y 768 dimensiones de BERT-base, con aproximadamente un 40 % menos de parámetros. Sobre ese encoder, este repositorio añade una cabeza de clasificación de secuencia, lo que explica el recuento de pesos publicado.

Los hiperparámetros declarados en la model card son: learning rate 2e-05, tamaño de lote de entrenamiento y evaluación 32, 3 épocas, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y planificador de learning rate lineal. El entrenamiento se detuvo en el paso 174, lo que con un lote de 32 implica aproximadamente 5.568 ejemplos procesados y en torno a 1.856 ejemplos por época (cálculo derivado de los datos declarados, no publicado por el autor). No se documenta el dataset, su composición, ni ningún proceso de RLHF, DPO o ajuste por preferencias, algo por otra parte poco habitual en un clasificador encoder. Tampoco se declara ninguna innovación técnica adicional: el modelo se limita a reutilizar la arquitectura y el pipeline estándar de transformers.

## Capacidades

- Clasificación de texto: es la única capacidad declarada (pipeline text-classification). El número y los nombres de las etiquetas de salida no se especifican en la model card.
- Entrada de hasta 512 tokens, adecuada para tuits, reseñas, titulares, párrafos cortos y comentarios.
- Inferencia muy ligera: con 66,9 millones de parámetros, cabe en memoria de CPU y en GPUs de gama baja.
- No genera texto: al ser un encoder sin decodificador, no realiza generación, resumen ni traducción.
- No soporta tool calling ni function calling.
- No está diseñado para flujos de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües declaradas; el modelo base está entrenado en inglés no acentuado (uncased).
- Sin capacidades especiales: no hay modo de razonamiento (thinking), ni visión, ni audio, ni matemáticas, ni generación de código.
- No está optimizado como modelo de embeddings de propósito general; su uso previsto es la cabeza de clasificación entrenada.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo puede clasificar grandes volúmenes de opiniones de clientes en lotes, con un coste de cómputo mínimo al caber en CPU y procesar entradas de hasta 512 tokens.
- Priorización de tickets de soporte por tono: enrutar automáticamente las quejas con tono negativo hacia agentes humanos, usando la etiqueta predicha como señal de urgencia en un pipeline de atención al cliente.
- Monitorización de menciones en redes sociales: clasificación por lotes de comentarios y publicaciones en inglés para alimentar paneles de reputación de marca, aprovechando la baja latencia del modelo.
- Filtrado previo en pipelines con LLM: usar este clasificador como etapa barata de cribado que descarte o etiquete grandes volúmenes de texto antes de invocar un modelo generativo mucho más costoso.
- Etiquetado de datos a escala: preanotar corpus en inglés con sentimiento positivo o negativo para después revisarlos y usarlos en el entrenamiento de modelos mayores o en la validación de anotaciones humanas.
- Análisis de encuestas NPS y formularios de feedback: procesar respuestas abiertas de clientes en inglés y agregar el sentimiento por segmento, producto o periodo temporal.
- Moderación de comunidades: marcar automáticamente contenido con carga negativa para revisión humana, siempre como filtro auxiliar y no como decisión final dado el nivel de accuracy declarado.

## Benchmarks y rendimiento

El bloque model-index del repositorio declara un array de resultados vacío, por lo que no hay benchmarks oficiales publicados. Los únicos datos disponibles son los de evaluación del propio autor sobre un conjunto no identificado, recogidos en la model card.

| Métrica | Valor declarado en la model card |
|---|---|
| Loss (evaluación) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento (datos de la model card):

| Training loss | Época | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Observaciones técnicas: la mejor accuracy de validación durante el entrenamiento (0,6975 en la época 2) no coincide con el valor final declarado en la cabecera de la model card (0,6598), lo que sugiere que la evaluación final se hizo con un conjunto o configuración distintos. La coincidencia exacta entre F1 weighted y F1 macro en todas las mediciones apunta a un conjunto de evaluación con clases perfectamente balanceadas, aunque el autor no lo confirma. No es posible comparar estos valores con otros modelos porque el dataset de evaluación no se ha publicado.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 270 MB solo para los pesos (66.955.779 parámetros × 4 bytes).
- VRAM en FP16/BF16: aproximadamente 135 MB. En INT8: en torno a 67 MB. Cálculos derivados del número de parámetros, no publicados por el autor.
- Cabe holgadamente en cualquier GPU de consumo: desde una GTX 1650 de 4 GB hasta una RTX 4090, pasando por RTX 3060 o T4. También es viable la inferencia exclusiva en CPU.
- Para lotes grandes de clasificación, el factor limitante es el ancho de banda de memoria y el número de hilos de CPU, no la VRAM.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime mediante optimum, TorchServe o Triton Inference Server, FastAPI en un contenedor con PyTorch en CPU, y Hugging Face Inference Endpoints (el repositorio lleva la etiqueta endpoints_compatible).
- No hay soporte práctico en llama.cpp ni Ollama, ya que no se distribuyen pesos GGUF y el modelo no es generativo. El soporte en vLLM está orientado a modelos generativos, no a clasificadores encoder como este.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque este modelo evalúa sobre un dataset no publicado y el resto de alternativas usan conjuntos públicos distintos. Se comparan por tanto parámetros, contexto, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Datos de evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAGHAV0049/sentiment-model | 66.955.779 | 512 tokens | Dataset propio no publicado; accuracy 0,6598 y F1 macro 0,6493 | apache-2.0 | Hugging Face, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Ajustado sobre SST-2, dataset público y estandarizado; métricas no verificadas en esta ficha | apache-2.0 | Hugging Face, ampliamente utilizado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M (roberta-base) | 512 tokens | Entrenado sobre corpus de tuits en inglés; métricas no verificadas en esta ficha | no disponible en esta ficha | Hugging Face |
| bert-base-uncased con cabeza de clasificación | ~110 M | 512 tokens | Depende del ajuste; no disponible | apache-2.0 (modelo base) | Hugging Face |

Diferencias relevantes: frente a las alternativas, este modelo es el más pequeño junto con el DistilBERT ajustado en SST-2, pero carece de dataset público de evaluación y de cualquier traza de uso (0 descargas, 0 likes), lo que dificulta validar su comportamiento y su reproducibilidad. Las alternativas basadas en RoBERTa y BERT ofrecen más capacidad de representación a costa de duplicar el coste de inferencia.

## Limitaciones y advertencias

- Rendimiento limitado y no contextualizado: una accuracy de 0,6598 y un F1 macro de 0,6493 son valores bajos para una tarea de clasificación binaria o de pocas clases; sin conocer la distribución de clases no puede descartarse que el modelo esté próximo a un clasificador trivial.
- Dataset de entrenamiento desconocido: el autor indica explícitamente "unknown dataset", por lo que se desconocen el dominio, el idioma exacto, el equilibrio de clases y cualquier posible sesgo heredado de los datos.
- Sesgos: no documentados. Al derivar de distilbert-base-uncased, entrena sobre corpus de libros y Wikipedia en inglés, con los sesgos de representación de dichas fuentes.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas en textos fuera del dominio de entrenamiento o con ironía, sarcasmo o negaciones complejas.
- Limitación de contexto: 512 tokens máximo; los documentos más largos requieren truncado o troceado, con la consiguiente pérdida de contexto.
- Limitación de idioma: el uso esperado es inglés no acentuado (uncased); no hay soporte declarado para castellano ni para otros idiomas.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución, siempre conservando el aviso de licencia. No hay restricciones adicionales declaradas.
- Caveats para producción: no se especifican las etiquetas de salida ni el orden de las clases, por lo que es imprescindible inspeccionar el mapeo id2label del config antes de integrarlo. El conjunto de evaluación no está publicado, por lo que no se recomienda desplegarlo sin una validación propia sobre datos del dominio objetivo.
- Metadatos poco fiables: la model card está generada automáticamente y contiene secciones sin completar ("More information needed") y una discrepancia entre la mejor métrica de validación y la métrica final declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RAGHAV0049/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Artículo de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Artículo de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación del pipeline de clasificación de texto de transformers: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
- Alternativa comparable: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- Alternativa comparable: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest

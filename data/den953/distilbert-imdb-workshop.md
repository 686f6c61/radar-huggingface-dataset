# Den953/distilbert-imdb-workshop

## Resumen

`distilbert-imdb-workshop` es un modelo de clasificación de texto desarrollado por Den953, que consiste en un fine-tuning de `distilbert-base-uncased` sobre un subconjunto del dataset `stanfordnlp/imdb` para análisis de sentimiento binario (positivo o negativo) en críticas de cine en inglés. Se trata de un ejercicio pedagógico creado en el contexto de un taller del curso MLOps M2, con un entrenamiento deliberadamente corto: 1500 ejemplos de entrenamiento, 400 de test, una sola época y ejecución en CPU.

El modelo utiliza la arquitectura DistilBERT, un transformer encoder destilado de BERT con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, que conserva cerca del 97 % del rendimiento de BERT con un 40 % menos de parámetros. En este caso, los parámetros totales son 66.955.010, almacenados en formato safetensors. La longitud de contexto del modelo base es de 512 tokens, aunque el fine-tuning trunca las entradas a 128 tokens con padding dinámico.

A pesar de sus limitaciones como modelo de demostración, es útil para ilustrar el proceso completo de fine-tuning, evaluación y despliegue de un modelo de clasificación con la librería Transformers. Su rendimiento reportado es una accuracy de 0.8275 y un F1 de 0.8208 sobre el conjunto de test de IMDb.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (base) / entrenado con max length 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `distilbert-base-uncased`, una versión destilada de BERT que reduce el número de capas de 12 a 6 manteniendo la dimensión de los embeddings en 768 y 12 cabezas de atención. Esta arquitectura de encoder está diseñada para tareas de comprensión del lenguaje, no para generación de texto. El fine-tuning se realizó sobre un subconjunto del dataset `stanfordnlp/imdb` compuesto por 1500 ejemplos de entrenamiento y 400 de test. Los hiperparámetros de entrenamiento incluyen 1 época, learning rate de 2e-5, batch size de 16, weight decay de 0.01 y una longitud máxima de 128 tokens con padding dinámico. El entrenamiento se ejecutó en CPU, lo que explica su corta duración y la ausencia de técnicas avanzadas como RLHF o DPO. No se han publicado detalles sobre la composición exacta del subconjunto utilizado más allá de los números indicados.

## Capacidades

- Clasificación de sentimiento binario: distingue entre críticas de cine positivas y negativas en inglés.
- Inferencia mediante el pipeline de Transformers, con soporte de truncamiento automático de entradas largas.
- Compatible con la infraestructura de Hugging Face, incluidos los Inference Endpoints y el formato safetensors.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder puro.
- Capacidades multilingües limitadas: solo ha sido entrenado y evaluado en inglés.
- Sin capacidades especiales de visión, audio o modo de pensamiento.

## Casos de uso

- Prototipos educativos de análisis de sentimiento: el modelo es adecuado para demostrar el flujo completo de fine-tuning, evaluación y despliegue en cursos de MLOps o talleres de Hugging Face.
- Demos interactivas en cuadernos de Jupyter: permite a estudiantes e investigadores experimentar con la clasificación de críticas de cine y ajustar hiperparámetros en tiempo real.
- Etiquetado rápido de datos en inglés: puede usarse para preetiquetar un corpus inicial de reseñas antes de un etiquetado manual más exhaustivo.
- Comparación de técnicas de fine-tuning: sirve como línea base para comparar el efecto de distintos tamaños de dataset, épocas o longitudes de truncamiento en el rendimiento.
- Integración en pipelines de pruebas de concepto: al ser ligero y ejecutable en CPU, puede integrarse en scripts de validación de calidad de datos o en flujos de análisis exploratorio.
- Ejemplo de despliegue local con Transformers: se puede cargar con `pipeline("sentiment-analysis", model="Den953/distilbert-imdb-workshop", truncation=True)` para obtener predicciones inmediatas sin necesidad de GPU.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy (test split de imdb) | 0.8275 |
| F1 (test split de imdb) | 0.8208 |

Estos valores corresponden a la evaluación sobre 400 ejemplos de test. El propio autor advierte que, con ese tamaño de muestra, el margen de error de la accuracy es de aproximadamente ±5 puntos porcentuales. No se han publicado resultados adicionales en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque el modelo está diseñado exclusivamente para clasificación de sentimiento.

## Requisitos de hardware

- VRAM estimada: en FP32, el modelo ocupa aproximadamente 267 MB; en FP16, unos 134 MB. Puede ejecutarse en CPU sin problemas.
- GPU recomendada: ninguna en particular; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente, aunque no es necesaria.
- Compatible con CPU: sí, el entrenamiento original se realizó en CPU y la inferencia es rápida en ese entorno.
- Opciones de despliegue: Transformers pipeline, Hugging Face Inference Endpoints y cualquier framework que soporte safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en IMDb | Licencia |
|---|---|---|---|---|
| Den953/distilbert-imdb-workshop | 66,9 M | 512 tokens (truncado a 128) | 0.8275 | Apache 2.0 |
| dhlee347/distilbert-imdb | 66,9 M | 512 tokens | 0.9302 | no disponible |
| lvwerra/distilbert-imdb | 66,9 M | 512 tokens | no disponible | no disponible |
| distilbert-base-uncased (sin fine-tuning) | 66,9 M | 512 tokens | no aplicable | Apache 2.0 |

El modelo de Den953 presenta un rendimiento inferior al de `dhlee347/distilbert-imdb`, lo que es esperable dado el entrenamiento reducido (1500 ejemplos, 1 época, CPU). El modelo `lvwerra/distilbert-imdb` aparece en la búsqueda web pero no se han encontrado métricas publicadas en su model card.

## Limitaciones y advertencias

- Entrenamiento deliberadamente corto: solo 1500 ejemplos y 1 época, lo que lo convierte en un ejercicio pedagógico y no en un modelo apto para producción.
- Margen de error amplio: con 400 ejemplos de test, la accuracy reportada tiene una incertidumbre de ±5 puntos porcentuales.
- Limitación de contexto: las críticas se truncan a 128 tokens, por lo que el modelo solo ve el comienzo de reseñas largas y puede perder información relevante del final.
- Sesgos del dataset IMDb: el modelo hereda los sesgos culturales y lingüísticos presentes en las críticas de cine en inglés, que pueden no generalizar a otros dominios o idiomas.
- Riesgo de clasificación incorrecta en textos ambiguos o con ironía, especialmente fuera del dominio de críticas de cine.
- Licencia Apache 2.0 permite uso comercial, pero el bajo rendimiento y la naturaleza de demostración hacen desaconsejable su uso en sistemas reales sin un reentrenamiento completo.
- No soporta tool calling, agentes ni generación de texto; es un modelo de clasificación puro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Den953/distilbert-imdb-workshop
- Dataset IMDb: https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo comparativo dhlee347/distilbert-imdb: https://huggingface.co/dhlee347/distilbert-imdb
- Modelo comparativo lvwerra/distilbert-imdb: https://huggingface.co/lvwerra/distilbert-imdb

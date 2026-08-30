# mohsinakh/roberta-base-sst2-sentiment

## Resumen

El modelo `mohsinakh/roberta-base-sst2-sentiment` es un ajuste fino de `roberta-base` sobre la tarea de análisis de sentimiento binario del dataset GLUE SST-2. Desarrollado por Mohsin Abbas, el checkpoint publicado corresponde al paso 3.750 de optimización, el último de un entrenamiento de 3 épocas sobre los primeros 6.000 ejemplos del conjunto de entrenamiento de SST-2. El modelo alcanza una precisión del 83,83 % en el conjunto de validación de SST-2, con una pérdida de entrenamiento final de aproximadamente 0,36.

Se trata de un clasificador de secuencias basado en la arquitectura RoBERTa-base, con 12 capas, tamaño oculto de 768 y unos 125 millones de parámetros. Su propósito es clasificar frases en inglés como positivas o negativas, y se publica listo para cargar con dos líneas de código mediante la librería `transformers`. Aunque su rendimiento es inferior al de otros ajustes finos de RoBERTa sobre SST-2 (que suelen superar el 93 % de precisión), este modelo sirve como demostración de un flujo completo de fine-tuning y evaluación, con un repositorio de GitHub que incluye el cuaderno de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RobertaForSequenceClassification (RoBERTa-base, 12 capas, hidden size 768) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura RoBERTa-base, un transformer encoder de 12 capas con atención bidireccional, diseñado originalmente para tareas de comprensión del lenguaje. Sobre esta base se añade una cabeza de clasificación de secuencias con dos salidas (positivo/negativo). El entrenamiento se realizó mediante fine-tuning completo sobre los primeros 6.000 ejemplos del conjunto de entrenamiento de SST-2, durante 3 épocas, con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje de 5e-5 y weight decay de 0,01. El proceso generó 3.750 pasos de optimización, y el checkpoint final (paso 3.750) fue el que presentó la menor pérdida de entrenamiento, descendiendo de aproximadamente 0,69 en el paso 500 a 0,36 al final. No se aplicaron técnicas como RLHF o DPO; se trata de un ajuste supervisado estándar.

## Capacidades

- Clasificación de sentimiento binario: asigna una etiqueta positiva (1) o negativa (0) a frases en inglés.
- Procesamiento de texto de longitud variable, limitado por el tokenizador de RoBERTa (aunque la longitud de contexto no se especifica en la documentación del modelo).
- Integración sencilla con la API de `transformers` y con el pipeline de `text-classification`.
- Capacidad de inferencia en lote y en tiempo real gracias a su tamaño reducido.
- No soporta tool calling, generación de código, razonamiento multi-paso ni capacidades multimodales; es exclusivamente un clasificador de texto.

## Casos de uso

- Análisis de opiniones de productos: el modelo puede clasificar reseñas de comercio electrónico como positivas o negativas, permitiendo a las empresas monitorizar la satisfacción del cliente de forma automática. Su tamaño reducido facilita su despliegue en servicios con baja latencia.
- Monitorización de redes sociales: permite analizar menciones de una marca o producto en Twitter, Facebook u otras plataformas, clasificando el sentimiento de cada mensaje para detectar crisis de reputación o tendencias de opinión.
- Análisis de reseñas de películas: dado que SST-2 proviene de reseñas de cine, el modelo es especialmente adecuado para clasificar críticas cinematográficas, aunque su precisión puede ser inferior a la de otros modelos especializados.
- Filtrado de comentarios en foros o secciones de comentarios: puede utilizarse para priorizar comentarios negativos que requieran atención del moderador o del servicio de atención al cliente.
- Investigación académica en PLN: sirve como punto de partida para estudiar el efecto del fine-tuning en RoBERTa, comparar estrategias de entrenamiento o analizar el comportamiento de modelos pequeños en tareas de clasificación.
- Prototipado rápido de sistemas de análisis de sentimiento: gracias a su carga en dos líneas de código, es útil para validar ideas o construir demos antes de pasar a modelos más grandes y precisos.

## Benchmarks y rendimiento

Según el model-index declarado por el autor, el modelo alcanza una precisión del 83,83 % en el conjunto de validación de GLUE SST-2. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque el modelo está especializado únicamente en clasificación de sentimiento.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Sentiment Analysis | GLUE SST-2 (validacion) | Accuracy | 0,8383 |

Para contextualizar, otros ajustes finos de `roberta-base` sobre SST-2 reportan precisiones superiores, como `rasyosef/roberta-base-finetuned-sst2` con 93,46 % o el modelo `roberta-base-sst2` de PromptLayer con 93,23 %. Estos valores provienen de fuentes externas y no han sido verificados en este análisis.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 125 millones de parámetros, su huella de memoria es reducida. En FP32, los pesos ocupan unos 500 MB (tamaño del repositorio), por lo que puede ejecutarse en GPUs con 2 GB de VRAM o incluso en CPU con suficiente RAM.
- No se dispone de datos específicos sobre VRAM estimada para inferencia, latencia o throughput en la información proporcionada.
- Es compatible con las principales librerías de inferencia: `transformers`, `pipeline` de Hugging Face, y puede exportarse a ONNX o TensorRT si se requiere optimización.
- Dado su tamaño, es viable su despliegue en entornos de producción con GPUs consumer como NVIDIA GTX 1060, RTX 2060 o superiores, así como en instancias cloud de baja gama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (SST-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mohsinakh/roberta-base-sst2-sentiment | 124,6 M | no disponible | 83,83 % | Apache 2.0 | Hugging Face |
| rasyosef/roberta-base-finetuned-sst2 | ~125 M | no disponible | 93,46 % | no especificada | Hugging Face |
| roberta-base-sst2 (PromptLayer) | ~125 M | no disponible | 93,23 % | MIT | PromptLayer |

La comparativa muestra que el modelo de mohsinakh tiene una precisión notablemente inferior a la de otros ajustes finos de RoBERTa sobre el mismo dataset, probablemente debido al uso de un subconjunto reducido de entrenamiento (6.000 ejemplos frente a los ~67.000 completos de SST-2). No se dispone de información sobre la longitud de contexto de los modelos comparados.

## Limitaciones y advertencias

- El modelo fue entrenado únicamente con los primeros 6.000 ejemplos de SST-2, lo que limita su generalización a otros dominios, estilos de escritura o idiomas distintos del inglés.
- La precisión del 83,83 % es baja en comparación con otros modelos de la misma familia, por lo que no es recomendable para aplicaciones donde se requiera alta fiabilidad en la clasificación de sentimiento.
- Puede presentar sesgos derivados del dominio de origen (reseñas de películas) y del subconjunto de datos utilizado, lo que podría afectar a su comportamiento en textos de otras temáticas.
- Riesgo de alucinación o clasificaciones erróneas en frases ambiguas, sarcásticas o con doble sentido, dado que no se ha evaluado su robustez en estos casos.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda evaluar el modelo en datos propios antes de usarlo en producción.
- No se han documentado limitaciones de contexto específicas, pero al ser RoBERTa-base, el límite de tokens por secuencia es de 512 (dato estándar de la arquitectura, no confirmado en la documentación del modelo).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mohsinakh/roberta-base-sst2-sentiment)
- [Repositorio de GitHub del autor](https://github.com/mohsinakh/roberta-base-sst2-sentiment)
- [Paper de RoBERTa](https://arxiv.org/abs/1907.11692)
- [GLUE benchmark y SST-2](https://gluebenchmark.com/)
- [Modelo base roberta-base](https://huggingface.co/roberta-base)

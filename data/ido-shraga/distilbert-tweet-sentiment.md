# Ido-shraga/distilbert-tweet-sentiment

## Resumen

El modelo `Ido-shraga/distilbert-tweet-sentiment` es un ajuste fino (fine-tune) de `distilbert/distilbert-base-uncased` para la clasificación de sentimiento en tweets. Fue desarrollado por Ido-shraga y publicado en Hugging Face con licencia Apache 2.0. El modelo resuelve la tarea de análisis de sentimiento en texto corto de redes sociales, un problema habitual en monitorización de marca, análisis de opinión pública y moderación de contenido.

La arquitectura es un transformer encoder de tipo DistilBERT, una versión destilada de BERT con 66,96 millones de parámetros. El modelo fue entrenado durante 5 épocas con un learning rate de 2e-05 y un tamaño de lote de 32, aunque el dataset de entrenamiento no se especifica en la model card. La relevancia actual radica en su tamaño reducido, que permite inferencia eficiente en CPU y GPU de consumo, y en su enfoque específico para el dominio de Twitter, donde el lenguaje informal y las abreviaturas son habituales.

La model card indica que el modelo fue generado automáticamente por la herramienta ML Intern, por lo que la documentación es limitada. No se proporcionan datos sobre la longitud de contexto, los idiomas soportados (aunque el modelo base es inglés) ni cuantizaciones disponibles. El repositorio incluye un espacio Trackio para visualizar comparaciones de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT usa 512 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (el modelo base es ingles, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. DistilBERT utiliza una arquitectura transformer encoder con 6 capas, 12 cabezas de atención y 768 dimensiones ocultas, entrenada mediante destilación de conocimiento desde BERT-base. La capa de clasificación añade una salida de 3 clases (negativo, neutral, positivo) para la tarea de sentimiento.

El entrenamiento se realizó con el framework Transformers (versión 5.16.1) y PyTorch 2.13.0, utilizando el optimizador AdamW con betas (0.9, 0.999), un scheduler lineal y 5 épocas. El dataset de entrenamiento no está documentado, pero por el nombre del modelo y el dominio se infiere que proviene de tweets, posiblemente del conjunto TweetEval (aunque no se confirma). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La pérdida final en evaluación fue de 0.8342 con una accuracy de 0.736.

## Capacidades

- Clasificación de sentimiento en tres clases: negativo, neutral y positivo.
- Procesamiento de texto corto y lenguaje informal típico de redes sociales (abreviaturas, emoticonos, menciones).
- Inferencia eficiente gracias al tamaño reducido del modelo (66M parámetros).
- Integración con la librería Transformers mediante la clase `AutoModelForSequenceClassification` (aunque la model card muestra un ejemplo incorrecto con `AutoModelForCausalLM`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Monitorización de marca en Twitter: el modelo puede clasificar automáticamente la opinión de los usuarios sobre una marca o producto, permitiendo detectar crisis de reputación en tiempo real. Su tamaño reducido facilita el despliegue en servicios de streaming con alta frecuencia de tweets.
- Análisis de sentimiento en campañas políticas: permite medir la reacción del público ante discursos, debates o noticias, agrupando los resultados por polaridad para generar informes diarios.
- Moderación de contenido en redes sociales: puede preclasificar comentarios o publicaciones como negativos, ayudando a priorizar la revisión humana de contenido potencialmente dañino.
- Investigación académica en opinión pública: los investigadores pueden utilizar el modelo para etiquetar grandes corpus de tweets y estudiar tendencias de opinión sobre temas específicos, como salud pública o cambio climático.
- Atención al cliente automatizada: integrado en un pipeline de clasificación, el modelo puede derivar automáticamente los tweets de queja a un equipo de soporte, mientras que los positivos se archivan como testimonios.
- Análisis de sentimiento en criptomonedas: dado el interés en el sentimiento del mercado, el modelo puede procesar feeds de Twitter sobre criptoactivos y generar señales de sentimiento agregado, como se hace en herramientas como `cryptocurrency.cv`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. La model card incluye métricas de evaluación sobre un conjunto de validación no especificado, que se detallan a continuación:

| Metrica | Valor |
|---|---|
| Loss | 0.8342 |
| Accuracy | 0.736 |
| F1 Macro | 0.7220 |
| F1 Negativo | 0.6656 |
| F1 Neutral | 0.7171 |
| F1 Positivo | 0.7833 |

Estos valores corresponden a la evaluación final tras 5 épocas. No se proporcionan resultados en benchmarks estándar como MMLU, HumanEval o GLUE.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 66,96 millones de parámetros, lo que en FP32 ocupa aproximadamente 268 MB. En cuantización de 8 bits (si se aplicara) ocuparía unos 67 MB, aunque no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1060 o RTX 3050 pueden ejecutarlo sin problemas. También funciona en CPU con latencia aceptable (inferencia en pocos milisegundos por muestra).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, o mediante frameworks como FastAPI con la librería Transformers. También es compatible con `text-embeddings-inference` (según los tags del repositorio).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia inferior a 10 ms por lote en GPU y de 20-50 ms en CPU para una sola muestra.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de sentimiento en la información proporcionada. Como referencia, se puede comparar con el modelo base DistilBERT (sin ajuste fino) y con otros modelos populares de análisis de sentimiento como `cardiffnlp/twitter-roberta-base-sentiment`, pero no se tienen métricas de estos últimos en el mismo conjunto de evaluación. La siguiente tabla resume las diferencias estructurales:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ido-shraga/distilbert-tweet-sentiment | 66,96 M | 512 (base) | Apache 2.0 | Ajustado para tweets, métricas de evaluación propias |
| distilbert-base-uncased | 66,96 M | 512 | Apache 2.0 | Modelo base sin ajuste, no especializado en sentimiento |
| cardiffnlp/twitter-roberta-base-sentiment | 125 M | 512 | MIT | Especializado en sentimiento de Twitter, con benchmarks publicados |

No se dispone de datos de rendimiento comparativo en un mismo benchmark, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, lo que impide evaluar posibles sesgos demográficos o temáticos. El modelo podría tener un rendimiento inferior en dominios fuera de Twitter o en idiomas distintos del inglés.
- La model card fue generada automáticamente y contiene un ejemplo de uso incorrecto (usa `AutoModelForCausalLM` en lugar de `AutoModelForSequenceClassification`), lo que sugiere una documentación poco cuidada.
- Las métricas de evaluación (accuracy 0.736, F1 macro 0.722) son moderadas y podrían no ser suficientes para aplicaciones críticas donde se requiera alta precisión.
- No se especifican los idiomas soportados; el modelo base está entrenado principalmente en inglés, por lo que su uso en otros idiomas probablemente degrade el rendimiento.
- No se proporcionan pesos cuantizados ni versiones optimizadas para móvil o edge, lo que limita su despliegue en entornos con restricciones de memoria.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de DistilBERT, se deben respetar los términos de la licencia del modelo base (también Apache 2.0).
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero puede producir clasificaciones erróneas en entradas ambiguas o con sarcasmo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Ido-shraga/distilbert-tweet-sentiment
- Espacio Trackio de comparación: https://huggingface.co/spaces/Ido-shraga/tweet-sentiment-comparison-static-b9593e
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Herramienta ML Intern (generadora de la model card): https://github.com/huggingface/ml-intern

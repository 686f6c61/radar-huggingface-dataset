# Eric565-svg/my-sentiment-classifier

## Resumen

`Eric565-svg/my-sentiment-classifier` es un modelo de clasificación de texto publicado en Hugging Face por el usuario Eric565-svg, con pipeline `text-classification` y etiqueta de sentimiento binaria (NEGATIVE/POSITIVE). Está construido sobre la arquitectura DistilBERT, la variante destilada de BERT que reduce el número de capas del modelo original de 12 a 6, y cuenta con 66.955.010 parámetros totales según los pesos en safetensors del repositorio.

El modelo resuelve una tarea acotada: asignar una polaridad positiva o negativa a un fragmento de texto en inglés. Su relevancia es la de un artefacto de fine-tuning ligero y de bajo coste computacional, adecuado para experimentación, prototipado rápido o como componente de pipelines de análisis de opiniones en entornos con recursos limitados. No se trata de un modelo de propósito general ni de un modelo generativo.

La model card es mínima y no documenta el dataset de entrenamiento, el número de tokens, la composición de los datos ni métricas de evaluación. La información disponible se limita a la arquitectura declarada en los tags, el número de parámetros, el tamaño del repositorio (0,3 GB), la licencia Apache 2.0 y la advertencia del autor de que el entrenamiento se realizó sobre un conjunto de datos pequeño en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT, 6 capas) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por configuración estándar, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización a int8/GGUF no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas | 0 = NEGATIVE, 1 = POSITIVE |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder obtenido por destilación del conocimiento de BERT-base. El modelo original de DistilBERT conserva aproximadamente el 66 % de los parámetros de BERT-base y mantiene 6 capas de atención, lo que se corresponde con el recuento de 66.955.010 parámetros observado en los pesos publicados. Sobre esta base, el autor ha aplicado un fine-tuning para clasificación binaria de sentimiento, con una cabeza de clasificación de dos etiquetas.

No hay información pública sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, la proporción de clases ni si se emplearon técnicas de ajuste adicionales como RLHF o DPO (no aplicables habitualmente a un clasificador de este tipo). La model card únicamente indica que el entrenamiento se realizó sobre un conjunto de datos pequeño en inglés. No se documentan innovaciones técnicas destacables más allá del propio proceso de destilación heredado de DistilBERT.

## Capacidades

- Clasificación binaria de sentimiento (NEGATIVE/POSITIVE) sobre texto en inglés.
- Inferencia rápida y de bajo coste gracias al tamaño reducido del modelo (aproximadamente 67 millones de parámetros).
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Ejecución viable en CPU para volúmenes moderados de texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de capacidades multilingües: solo inglés.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- No es un modelo generativo: no produce texto libre, solo una etiqueta y una puntuación de confianza.

## Casos de uso

- Análisis de opiniones en reseñas de productos: el modelo clasifica reseñas cortas en inglés como positivas o negativas, lo que permite agregar métricas de satisfacción por producto o categoría en un pipeline de analítica.
- Monitorización de menciones en redes sociales: procesamiento por lotes de tuits o comentarios en inglés para detectar polaridad y activar alertas cuando la proporción de sentimiento negativo supera un umbral.
- Enrutamiento de tickets de soporte: clasificación previa de mensajes de clientes en inglés para priorizar aquellos con sentimiento negativo hacia un equipo de atención especializado.
- Etiquetado asistido de datasets: generación de etiquetas preliminares de sentimiento sobre corpus en inglés que después se revisan manualmente, reduciendo el coste de anotación.
- Filtrado de contenido en foros o comunidades: detección de mensajes con carga negativa para su revisión por moderadores, como señal complementaria a otras herramientas.
- Prototipado y pruebas de concepto: validación rápida de una idea de producto basada en análisis de sentimiento antes de invertir en un modelo mayor o en un servicio gestionado, gracias a su licencia permisiva y a su reducido tamaño.
- Componente en pipelines de extracción de opiniones: combinación con otros modelos (NER, extracción de aspectos) para construir un análisis de sentimiento a nivel de aspecto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1, precisión o recall, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 270 MB para los pesos (67 M de parámetros × 4 bytes), más overhead de activaciones y framework; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en CPU.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput se puede usar cualquier GPU moderna (T4, A10, L4, A100) con `transformers` o con un servidor de inferencia.
- Opciones de despliegue: `transformers` (pipeline nativo), TorchServe, FastAPI con `transformers`, ONNX Runtime, o servidores de inferencia como TGI si se convierte el modelo. `llama.cpp` y Ollama no son aplicables directamente por tratarse de un encoder de clasificación y no de un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eric565-svg/my-sentiment-classifier | 66.955.010 | no disponible | Clasificación de sentimiento binaria (en) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens (configuración estándar) | Clasificación de sentimiento binaria (en) | Apache 2.0 | Hugging Face |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens (configuración estándar) | Clasificación de sentimiento en tres clases (en) | MIT (según repositorio) | Hugging Face |
| finiteautomata/bertweet-base-sentiment-analysis | ~135 M | 128 tokens (configuración estándar) | Clasificación de sentimiento en tres clases, dominio Twitter (en) | MIT (según repositorio) | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia: no hay datos de rendimiento publicados para el modelo de Eric565-svg que permitan una comparación cuantitativa con las alternativas. Los modelos citados son referencias habituales de la categoría y sus cifras de parámetros y contexto corresponden a sus configuraciones estándar conocidas, no a mediciones realizadas sobre este repositorio.

## Limitaciones y advertencias

- Entrenado sobre un conjunto de datos pequeño en inglés, según reconoce el propio autor; la generalización a dominios distintos del de entrenamiento es incierta.
- Solo admite inglés: las predicciones sobre otros idiomas no son fiables.
- El sarcasmo, la ironía y los textos muy cortos pueden producir predicciones erróneas, tal como advierte la model card.
- No se han publicado métricas de evaluación, por lo que no es posible estimar su precisión real ni su calibración.
- Riesgo de sesgo derivado del dataset de entrenamiento, que no se documenta; pueden aparecer sesgos de dominio, de registro lingüístico o demográficos.
- Riesgo de alucinación no aplicable en sentido estricto (no es generativo), pero sí de clasificaciones erróneas con alta confianza.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validación comunitaria; conviene tratarlo como un artefacto experimental.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se documenta la longitud máxima de entrada soportada en la model card; debe verificarse en la configuración del tokenizer antes de usarlo con textos largos.
- No hay información sobre el proceso de entrenamiento (épocas, learning rate, dataset exacto), lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eric565-svg/my-sentiment-classifier
- Documentación de DistilBERT en Hugging Face: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación del pipeline de text-classification: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Modelo de referencia distilbert-base-uncased-finetuned-sst-2-english: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english

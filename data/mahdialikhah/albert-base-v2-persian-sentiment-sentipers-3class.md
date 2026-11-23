# MahdiAlikhah/albert-base-v2-persian-sentiment-sentipers-3class

## Resumen

El modelo `albert-base-v2-persian-sentiment-sentipers-3class` es un clasificador de sentimiento en persa (farsi) de tres clases (negativo, neutro, positivo) desarrollado por MahdiAlikhah. Se construye mediante fine-tuning de un checkpoint ALBERT-base preentrenado en persa (`shekar-ai/albert-base-v2-persian-zwnj-naab-mlm`) al que se le anade una cabeza de clasificacion de secuencias. El modelo resuelve una tarea acotada y bien definida: clasificar oraciones o pasajes cortos de resenas de productos en persa segun su polaridad.

La relevancia practica del modelo radica en su especializacion: frente a modelos generativos multilingues de gran tamano, este clasificador de 11,9 millones de parametros ofrece una inferencia ligera y determinista para analisis de sentimiento a escala en texto persa. El entrenamiento se realizo sobre DeepSentiPers, un corpus de resenas de productos de Digikala (la principal plataforma de comercio electronico irani), colapsando la escala original de 5 puntos a 3 clases.

Arquitectonicamente es un ALBERT-base (transformer encoder con factorizacion de embeddings y comparticion de parametros entre capas), con una longitud de contexto practica limitada a 128 tokens por la configuracion de entrenamiento. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas, lo que lo hace atractivo para pipelines de analitica de opinion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT-base (transformer encoder) con cabeza de clasificacion de secuencias |
| Parametros totales | 11.942.403 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento; truncacion y padding) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint ALBERT-base adaptado al persa mediante masked language modeling, con normalizacion de ZWNJ (half-space persa) en el preprocesamiento. Sobre ese backbone se anade una cabeza lineal de clasificacion con tres etiquetas de salida. ALBERT se caracteriza por la factorizacion de las matrices de embedding y la comparticion de parametros entre capas, lo que reduce drasticamente el numero de parametros frente a BERT-base manteniendo una profundidad equivalente, y explica el tamano de 11,9 millones de parametros del checkpoint.

El fine-tuning se realizo sobre DeepSentiPers, corpus de resenas de productos de Digikala. Se uso el split aumentado por traduccion inversa (`translation.csv`, aproximadamente 14.046 filas antes del split) para entrenamiento y el split original reservado (`test.csv`, 1.854 filas) para evaluacion. Las etiquetas originales de polaridad en escala de -2 a +2 se colapsaron en tres clases: -2/-1 como negativo, 0 como neutro y +1/+2 como positivo. El texto se normalizo con el normalizador de hazm y se tokenizo con el tokenizador del modelo base (max_length=128). Se entrenaron 5 epocas en fp32 con batch de 16, learning rate 2e-5, weight decay 0.01 y entropia cruzada ponderada por clase para compensar el desbalance (los positivos superan a los negativos aproximadamente 3-4x). El mejor checkpoint se selecciono por macro-F1 de validacion, resultando la epoca 4. El entrenamiento completo duro unos 26 minutos (1.574 s) en una unica GPU T4 en Google Colab.

## Capacidades

- Clasificacion de sentimiento en persa a nivel de oracion o pasaje corto en tres clases: negativo, neutro y positivo.
- Analisis de polaridad sobre texto de resenas de productos, dominio principal de entrenamiento.
- Manejo de texto persa con normalizacion de ZWNJ (half-space) heredada del modelo base.
- Inferencia ligera y determinista: salida de logits por clase, apta para umbrales y agregacion estadistica.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue limitada exclusivamente al persa; no evaluado en texto mixto.

## Casos de uso

- Analisis de resenas de e-commerce a escala: clasificar automaticamente miles de resenas de productos en persa para generar metricas agregadas de satisfaccion por producto o categoria, aprovechando el bajo coste computacional del modelo.
- Monitorizacion de reputacion de marca: procesar menciones y opiniones en persa en foros o plataformas de resenas para detectar tendencias negativas y activar alertas cuando la proporcion de clase negativa supere un umbral.
- Enrutamiento de tickets de soporte: clasificar el tono de los mensajes de clientes en persa para priorizar casos negativos hacia atencion humana y derivar neutros o positivos a respuestas automatizadas.
- Etiquetado asistido para anotacion: pre-etiquetar grandes volumenes de texto persa como paso previo a la revision humana, reduciendo el coste de construir datasets de sentimiento en dominios adyacentes.
- Investigacion en PLN persa: servir como baseline reproducible para comparar tecnicas de clasificacion de sentimiento en persa, dado que el modelo, los hiperparametros y los splits estan documentados.
- Extraccion de senales para sistemas de recomendacion: incorporar la polaridad de las resenas como feature adicional en un ranking de productos, agregando predicciones por producto con estadisticas de distribucion de clases.
- Analisis de encuestas abiertas: clasificar respuestas de texto libre en persa en encuestas de satisfaccion, con la cautela de validar el rendimiento fuera del dominio de resenas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint se selecciono por macro-F1 de validacion (epoca 4) y que la evaluacion se realizo sobre `test.csv` de DeepSentiPers (1.854 filas), pero no se proporcionan los valores numericos de las metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 11,9 millones de parametros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entreno en una T4 y se ejecuta sin problemas en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- CPU: viable para inferencia en produccion de bajo throughput; el modelo es lo bastante pequeno para ejecutarse en CPU con latencias de milisegundos por oracion.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportable a ONNX Runtime para inferencia optimizada; integrable en pipelines de clasificacion con TGI o servicios propios. No hay pesos GGUF publicados para llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma medida; el entrenamiento de 3.955 pasos con batch 16 en una T4 durante 26 minutos sugiere un coste computacional muy bajo, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| albert-base-v2-persian-sentiment-sentipers-3class | 11,9 M | 128 tokens | Clasificacion de sentimiento persa (3 clases) | Apache-2.0 | Hugging Face |
| shekar-ai/albert-base-v2-persian-zwnj-naab-mlm (modelo base) | no disponible | no disponible | Masked language modeling persa | MIT (segun model card) | Hugging Face |
| Modelos generativos multilingues de gran tamano | orden de miles de millones | decenas de miles de tokens | Generacion y clasificacion via prompting | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Desbalance de clases: tras el colapso a 3 clases, los positivos superan a los negativos aproximadamente 3-4x; se mitigo con perdida ponderada por clase, pero puede sesgar predicciones hacia la clase positiva.
- Dominio acotado: entrenado exclusivamente con resenas de productos de Digikala; no evaluado en redes sociales, noticias, escritura formal ni otros registros o dialectos persas.
- Perdida de intensidad: el colapso de la escala de 5 puntos a 3 clases elimina distinciones de intensidad cerca de los limites entre clases.
- Contexto limitado a 128 tokens: textos mas largos se truncan, lo que puede eliminar informacion relevante en resenas extensas.
- Solo persa: no disenado para otros idiomas ni para texto mixto persa-ingles, frecuente en contextos tecnicos.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea fuera de dominio; no debe usarse como unica senal en decisiones de alto impacto sin revision humana.
- Licencia Apache-2.0 permisiva para uso comercial; el modelo base es MIT, que permite sublicenciar, segun indica el autor.
- Validar el rendimiento sobre datos propios antes de desplegar fuera del dominio de resenas de producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MahdiAlikhah/albert-base-v2-persian-sentiment-sentipers-3class
- Modelo base: https://huggingface.co/shekar-ai/albert-base-v2-persian-zwnj-naab-mlm
- Dataset DeepSentiPers: https://github.com/JoyeBright/DeepSentiPers
- Paper de ALBERT: https://arxiv.org/abs/1910.09700

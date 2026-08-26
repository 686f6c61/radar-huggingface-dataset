# Adi2309005/meld-conversational-sentiment

## Resumen

El modelo `Adi2309005/meld-conversational-sentiment` es un clasificador de texto especializado en análisis de sentimiento conversacional, desarrollado mediante fine-tuning de `distilroberta-base` sobre el dataset MELD (Multimodal EmotionLines Dataset). Este dataset, creado por el grupo DECLARE Lab, contiene diálogos multiparte de la serie *Friends* anotados con emociones y sentimiento (positivo, negativo y neutro) por emisión. El modelo resuelve la tarea de clasificar la polaridad de cada intervención en una conversación, un paso útil para sistemas de diálogo, análisis de interacciones de atención al cliente o monitorización de redes sociales.

Con 82 millones de parámetros, es un modelo compacto que se puede ejecutar en hardware modesto. Su arquitectura deriva de RoBERTa, un transformer encoder, y su ventana de contexto es de 512 tokens. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas. Aunque la model card oficial es escasa, la métrica F1 reportada en validación es de 0,660, lo que indica un rendimiento moderado en la tarea de clasificación de sentimiento conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (distilroberta-base) |
| Parametros totales | 82.120.707 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de distilroberta-base) |
| Tipos de cuantizacion | No especificado; compatible con cuantizaciones estándar (int8, int4) mediante herramientas como bitsandbytes o llama.cpp |
| Idiomas soportados | Ingles (principalmente, por el dataset MELD) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilroberta-base`, que a su vez es una versión destilada de RoBERTa-base. La arquitectura base es un transformer encoder con 6 capas, 12 cabezas de atención, dimensión de embedding de 768 y aproximadamente 82 millones de parámetros. La destilación redujo el número de capas (de 12 a 6) manteniendo un rendimiento cercano al original.

El entrenamiento se realizó sobre el dataset MELD, que contiene anotaciones de sentimiento (positivo, negativo, neutro) para cada emisión de diálogos multiparty. Según la model card, se usó un aprendizaje con tasa de 2e-5, batch de 32, optimizador AdamW con betas (0.9, 0.999) y scheduler lineal, durante 3 épocas. No se menciona el uso de técnicas de RLHF o DPO; se trata de un entrenamiento supervisado clásico. El número total de pasos fue de 939 (313 por época). No se especifica el tamaño exacto del dataset de entrenamiento, pero MELD contiene alrededor de 13.000 emisiones de entrenamiento y 2.610 de validación.

## Capacidades

- **Clasificacion de sentimiento conversacional**: clasifica cada emisión en una conversación como positiva, negativa o neutra.
- **Analisis contextual**: al estar basado en RoBERTa, considera el contexto de las emisiones anteriores dentro de la ventana de 512 tokens, lo que permite capturar dependencias conversacionales.
- **Soporte para tool calling**: no disponible, es un modelo de clasificación puro.
- **Capacidades multilingues**: no, entrenado principalmente con texto en ingles.
- **Modo thinking**: no aplica, es un clasificador simple sin generación de texto.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede clasificar el sentimiento de cada mensaje del usuario en un chat de soporte. Al ser ligero (82M parametros), se puede desplegar en un endpoint de inferencia con baja latencia y procesar flujos de mensajes en tiempo real, ayudando a priorizar las interacciones negativas o urgentes.
- **Monitorizacion de redes sociales**: analizar el sentimiento de las respuestas en hilos de conversaciones de plataformas sociales (Twitter, Reddit) para detectar crisis de reputacion o medir la recepcion de un producto o campaña.
- **Analisis de encuestas y feedback**: clasificar comentarios abiertos en encuestas de satisfaccion, agrupando las respuestas en positivas, negativas o neutras para generar informes agregados.
- **Moderacion de contenido**: identificar mensajes con sentimiento negativo en foros o comunidades para activar flujos de moderacion o derivar a un agente humano.
- **Investigacion en dialogo**: como modelo de referencia para estudios academicos sobre reconocimiento de emociones en conversaciones, permitiendo comparar con enfoques multimodales (audio+vision) que utilizan el mismo dataset MELD.
- **Sistemas de recomendacion de respuesta**: en un sistema de respuestas automaticas, el clasificador puede seleccionar la plantilla de respuesta adecuada en funcion del sentimiento detectado en la emision del usuario.

## Benchmarks y rendimiento

La model card no incluye una tabla de benchmarks comparativa. Los unicos datos reportados son los resultados de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida (validation) | 1.5346 |
| F1 (macro) | 0.6600 |

No se han publicado resultados en otros benchmarks estandar (MMLU, HumanEval, etc.) porque el modelo es un clasificador de sentimiento, no un modelo generativo. La informacion disponible no permite comparar con otros modelos de la misma categoria.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 82M de parametros. En precision completa (fp32) ocupa aproximadamente 328 MB. Con cuantizacion a int8 se reduce a ~82 MB, y a int4 a ~41 MB. Cabe en cualquier GPU consumer (incluso 4 GB de VRAM).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM para fp32, o 1 GB para cuantizacion. Ejemplos: NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, etc. Tambien funciona en CPU para inferencia de baja latencia (unos pocos ms por secuencia).
- **Despliegue**: compatible con librerias de Hugging Face Transformers, vLLM (aunque es un modelo encoder, se puede servir via TGI con soporte para clasificacion), llama.cpp (convertible a GGUF), y Ollama (con conversiones manuales). Se recomienda usar `text-classification` pipeline de Transformers.
- **Latencia y throughput**: para un modelo de este tamano, la inferencia en GPU RTX 3090 es de aproximadamente 0.5 ms por secuencia de 100 tokens, y en CPU puede ser de 5-10 ms. El throughput en batch de 32 es del orden de miles de secuencias por segundo en GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificacion de sentimiento conversacional) con datos publicados. Se podria comparar con el modelo `distilroberta-base` original (que no esta especializado en conversaciones) o con otros fine-tunings de RoBERTa sobre MELD, pero no hay datos concretos de estos modelos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Sesgos**: al entrenarse sobre datos de la serie "Friends" (dialogos de television), el modelo puede presentar sesgos hacia el estilo conversacional y las dinamicas sociales de ese contexto, que no representan todas las conversaciones reales.
- **Riesgo de alucinacion**: al ser un clasificador, no genera texto, por lo que no hay riesgo de alucinacion en ese sentido. Sin embargo, puede producir etiquetas erroneas en casos ambiguos o con lenguaje sarcastico o ironico.
- **Limitaciones de contexto**: la ventana de 512 tokens limita el analisis a secuencias cortas; en conversaciones muy largas, se pierde el contexto mas alla de las ultimas emisiones.
- **Idioma**: solo soporta ingles; no es apto para otros idiomas.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, modificacion y distribucion, siempre que se incluya el aviso de licencia.
- **Caveat para produccion**: la model card es muy incompleta (no indica el dataset de entrenamiento exacto, ni el proceso de preprocesado, ni evaluacion externa). Se recomienda validar el modelo con datos propios antes de usarlo en produccion. Ademas, el F1 de 0.66 sugiere que puede fallar en casos ambiguos.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/Adi2309005/meld-conversational-sentiment)
- [Modelo base distilroberta-base](https://huggingface.co/distilroberta-base)
- [GitHub del dataset MELD](https://github.com/declare-lab/MELD)
- [Pagina del dataset MELD](https://affective-meld.github.io/)
- [Articulo MELD (arXiv)](https://ar5iv.labs.arxiv.org/html/1810.02508)
- [Dataset MELD en IEEE DataPort](https://ieee-dataport.org/documents/meld-based-conversational-sentiment-dataset)

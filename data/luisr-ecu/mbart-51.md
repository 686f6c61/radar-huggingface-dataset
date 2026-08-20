# Luisr-ecu/mBART-51

## Resumen

El modelo mBART-51 es un sistema de traducción automática basado en la arquitectura mBART, desarrollado por Luisr-ecu mediante un proceso de fine-tuning sobre el checkpoint facebook/mbart-large-50. El modelo se ha entrenado con el conjunto de datos drewoodland/spanglish-sentences, compuesto por frases que mezclan inglés y español, lo que lo orienta a la traducción y normalización de textos en spanglish. Con 611 millones de parámetros y una licencia Apache 2.0, se presenta como una opción flexible para aplicaciones comerciales que requieran procesar este tipo de registros lingüísticos.

La relevancia del modelo radica en la creciente demanda de herramientas que comprendan el spanglish, una variedad hablada por comunidades hispanohablantes en Estados Unidos. Al partir del modelo multilingüe mBART-large-50, que ya soporta 50 idiomas, este checkpoint conserva la capacidad de traducción general del modelo base y la complementa con una especialización en el registro mixto. No obstante, la información disponible no incluye detalles sobre el proceso de entrenamiento ni resultados de evaluación, lo que limita la validación externa de su rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mBART (encoder-decoder transformer) |
| Parámetros totales | 611.129.542 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

mBART es un modelo de traducción automática multilingüe basado en una arquitectura encoder-decoder de transformer. A diferencia de otros enfoques que preentrenan solo partes del modelo, mBART preentrena el modelo completo con un objetivo de denoising que reconstruye texto corrupto, lo que permite manejar tanto el idioma fuente como el idioma destino. El modelo base, facebook/mbart-large-50, es una extensión del checkpoint original mbart-large-cc25 que amplía sus capas de embedding con vectores inicializados aleatoriamente para 25 idiomas adicionales, hasta alcanzar un total de 50.

El proceso de fine-tuning realizado por Luisr-ecu se llevó a cabo sobre el dataset drewoodland/spanglish-sentences, compuesto por frases que intercalan inglés y español. No se han publicado los detalles del procedimiento de entrenamiento, como el número de épocas, la tasa de aprendizaje, el régimen de precisión (fp16, bf16, etc.) ni el tamaño de los lotes. La model card generada automáticamente indica que se utilizan las métricas BLEU y chrF para la evaluación, pero no se aportan resultados numéricos.

## Capacidades

- Traducción automática entre inglés y español, con especialización en frases que mezclan ambos idiomas (spanglish).
- Generación de texto en formato seq2seq, útil para normalizar el spanglish a español o inglés estándar.
- Capacidad de traducción multilingüe heredada del modelo base, aunque el fine-tuning se centra en español e inglés.
- Posibilidad de adaptación a otros idiomas mediante fine-tuning adicional, gracias a la arquitectura mBART.
- No se ha confirmado soporte para tool calling, agentes ni razonamiento multi-paso, ya que el modelo está orientado exclusivamente a tareas de traducción.

## Casos de uso

- Normalización de texto en spanglish: el modelo puede transformar entradas híbridas en español o inglés estándar, facilitando el análisis posterior con sistemas de procesamiento de lenguaje natural.
- Traducción de contenido generado por usuarios en redes sociales: permite procesar publicaciones o comentarios que mezclan ambos idiomas, mejorando la calidad de la moderación y el análisis de sentimiento.
- Preprocesamiento para sistemas de búsqueda: al normalizar el spanglish a un idioma estándar, se facilita la indexación y recuperación de información en documentos multilingües.
- Localización de subtítulos y transcripciones: el modelo puede traducir diálogos que contienen spanglish, útil para plataformas de streaming o creadores de contenido.
- Asistencia en aprendizaje de idiomas: ayuda a estudiantes a comprender frases mixtas y a obtener traducciones en ambos idiomas.
- Atención al cliente en entornos bilingües: permite a empresas responder a usuarios que escriben en spanglish, mejorando la experiencia del cliente en el mercado hispanohablante de Estados Unidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona las métricas BLEU y chrF, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en FP32 para los pesos, más el consumo adicional de activaciones y del decodificador; con cuantización a 8 bits podría reducirse a unos 1,5 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: una RTX 4090 de 24 GB o una A100 de 40 GB son adecuadas para inferencia con contextos largos; una RTX 3060 de 12 GB puede ser suficiente para usos ligeros.
- Es posible ejecutar el modelo en CPU con 16 GB de RAM, aunque la latencia será significativamente mayor.
- Opciones de despliegue: librería transformers de Hugging Face, API de inferencia de Hugging Face, vLLM (si se añade soporte para mBART), o llama.cpp (con conversión a GGUF, no disponible actualmente).
- Latencia y throughput estimados: no disponibles, ya que no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luisr-ecu/mBART-51 | 611 M | no disponible | en, es | Apache 2.0 | Fine-tuning de mBART-large-50 |
| facebook/mbart-large-50 | 611 M | no disponible | 50 idiomas | MIT | Modelo base original |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | en, es | Apache 2.0 | Modelo de traducción en-es con arquitectura más ligera |

La comparativa muestra que este modelo es una especialización del mBART-50, por lo que su rendimiento en spanglish será previsiblemente superior al del modelo base, pero su cobertura de idiomas es menor en la práctica. No se dispone de benchmarks para confirmar esta hipótesis.

## Limitaciones y advertencias

- El modelo se ha entrenado con un dataset de tamaño reducido (spanglish-sentences) y puede presentar un rendimiento limitado en variantes de spanglish fuera de ese conjunto.
- Puede tener sesgos de género, tono o dialecto heredados del dataset y del modelo base, que no han sido evaluados.
- No se ha publicado información sobre la robustez del modelo ante texto ruidoso, errores ortográficos o registros formales.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos de atribución y las cláusulas de la licencia.
- El modelo no está diseñado para tareas de razonamiento complejo, generación de código o agentes; su uso se limita a traducción y normalización de texto.
- No se ha validado el comportamiento del modelo en producción, y se recomienda realizar pruebas de calidad en el dominio de aplicación antes de su despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luisr-ecu/mBART-51
- Documentación de mBART en Transformers: https://huggingface.co/docs/transformers/model_doc/mbart
- Paper original de mBART (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Modelo base facebook/mbart-large-50: https://huggingface.co/facebook/mbart-large-50
- Dataset drewoodland/spanglish-sentences: https://huggingface.co/datasets/drewoodland/spanglish-sentences

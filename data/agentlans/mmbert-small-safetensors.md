# agentlans/mmBERT-small-safetensors

## Resumen

El modelo mmBERT-small es un modelo de lenguaje enmascarado (fill-mask) basado en la arquitectura ModernBERT, desarrollado por el Center for Language and Speech Processing de la Universidad Johns Hopkins (JHU). Esta variante concreta, publicada por el usuario agentlans, contiene los pesos en formato safetensors. El modelo original, jhu-clsp/mmBERT-small, está diseñado para tareas de comprensión del lenguaje natural y destaca por su soporte de 1811 idiomas, lo que lo convierte en una opción interesante para aplicaciones multilingües. Con 140,9 millones de parámetros, es un modelo de tamaño pequeño que puede ejecutarse en hardware modesto. La licencia MIT permite su uso comercial. La información disponible sobre este modelo es limitada, ya que la model card no incluye detalles de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder Transformer) |
| Parametros totales | 140.897.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 1811 (según el modelo original jhu-clsp/mmBERT-small) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, descrita en el artículo arXiv:2509.06888. Se trata de un encoder Transformer optimizado para tareas de comprensión del lenguaje. El modelo original de JHU fue entrenado como un modelo de enmascaramiento de tokens (fill-mask), lo que permite su uso como encoder para tareas de clasificación, etiquetado o extracción de características. No se dispone de información sobre los datos de entrenamiento, el número de tokens ni la composición del dataset. Esta variante en safetensors es una conversión de pesos que no incluye una model card detallada.

## Capacidades

- Modelo de tipo fill-mask: predice tokens enmascarados en una secuencia.
- Soporte multilingüe amplio: 1811 idiomas, según la información del modelo original.
- Puede utilizarse como encoder para tareas de comprensión del lenguaje mediante fine-tuning.
- No se dispone de información sobre soporte de tool calling, agentes, visión o audio.

## Casos de uso

- Clasificación de documentos multilingües: el modelo puede ajustarse con datos etiquetados para categorizar artículos, correos o informes en múltiples idiomas, gracias a su amplia cobertura lingüística.
- Reconocimiento de entidades nombradas (NER): tras un fine-tuning, puede extraer personas, organizaciones o lugares en textos de diversos idiomas.
- Análisis de sentimiento en redes sociales: adecuado para clasificar opiniones en publicaciones de distintas lenguas, dado su tamaño reducido y su capacidad multilingüe.
- Detección de spam o contenido no deseado: puede entrenarse para identificar correos no deseados o comentarios inapropiados en varios idiomas.
- Búsqueda semántica: al ser un encoder, puede generar representaciones de frases para comparar similitud y recuperar documentos relevantes en un corpus multilingüe.
- Etiquetado gramatical (POS tagging): puede utilizarse como base para anotar partes de la oración en textos de diferentes idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,56 GB en fp32, 0,28 GB en fp16 y 0,14 GB en int8, según el número de parámetros (140,9 M). No se han publicado cuantizaciones específicas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como una NVIDIA RTX 2060 o superior. También puede ejecutarse en CPU para inferencia básica.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en prácticamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo encoder, no aplican herramientas como vLLM, llama.cpp u Ollama, orientadas a LLMs generativos. Puede servirse mediante HuggingFace Transformers, ONNX Runtime o similares.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| mmBERT-small | 140,9 M | no disponible | 1811 | MIT |
| mBERT (multilingual BERT) | 178 M | 512 | 104 | Apache 2.0 |
| XLM-RoBERTa-base | 278 M | 512 | 100 | MIT |
| DistilBERT multilingüe | 135 M | 512 | 104 | Apache 2.0 |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo encoder, no generativo: no puede generar texto libre ni mantener conversaciones.
- La variante de agentlans solo incluye los pesos en safetensors; es posible que falten el tokenizer o los archivos de configuración, por lo que se recomienda usar la configuración del modelo original jhu-clsp/mmBERT-small.
- El soporte de 1811 idiomas puede implicar un rendimiento desigual entre lenguas, con mejores resultados en idiomas con más datos de entrenamiento.
- No se han publicado benchmarks, por lo que no es posible evaluar su rendimiento frente a otros modelos.
- La licencia MIT permite el uso comercial, pero se debe mantener el aviso de copyright y licencia.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/agentlans/mmBERT-small-safetensors
- Modelo original: https://huggingface.co/jhu-clsp/mmBERT-small
- Paper de ModernBERT: https://arxiv.org/abs/2509.06888

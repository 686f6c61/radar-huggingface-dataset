# RyanStudio/ettinnet-v1-32m-preview

## Resumen

Ettinnet v1 32m preview es un modelo de lenguaje encoder de tipo ModernBERT, desarrollado por RyanStudio, especializado en la tarea de fill-mask (enmascarado y prediccion de tokens) sobre texto informal de internet. Se trata de un fine-tuning del modelo base jhu-clsp/ettin-encoder-32m, orientado a mejorar la comprension de jerga y expresiones coloquiales presentes en plataformas como Discord, Reddit y Twitter. Con 32.081.344 parametros, es un modelo compacto disenado para tareas de representacion y prediccion de tokens en dominios conversacionales.

El modelo surge para cubrir una carencia concreta: los encoders genericos entrenados en corpus formales rinden peor cuando se enfrentan a mensajes cortos, abreviaturas y argot digital. Ettinnet se entrena sobre 42 millones de muestras de mensajes filtrados y deduplicados, complementadas con aproximadamente 750.000 muestras de texto de fineweb, fineweb-edu y Wikipedia para mitigar el olvido catastrofico. Su tamano reducido lo hace adecuado para entornos con recursos limitados.

Es relevante ahora por su enfoque en un nicho poco atendido (comprension de lenguaje informal) y porque demuestra que modelos de 32 millones de parametros pueden superar en su tarea especifica a encoders mucho mayores, como el ettin-encoder-400m, en las metricas publicadas. No obstante, el propio autor lo etiqueta como preview experimental y no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) |
| Parametros totales | 32.081.344 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolucion del transformer encoder que incorpora mejoras como atencion con rotacion posicional (RoPE) y capas de normalizacion mas eficientes, aunque la model card no detalla configuraciones especificas de capas, dimensiones ocultas ni mecanismos de atencion concretos. Al ser un encoder, esta disenado para tareas de comprension y representacion, no para generacion autoregresiva. La tarea de entrenamiento es fill-mask, es decir, prediccion de tokens enmascarados.

El entrenamiento se realizo sobre 42 millones de muestras de mensajes seleccionados del dataset ManBib/DUE-filtered-deduped, complementadas con aproximadamente 750.000 muestras de texto de HuggingFaceFW/fineweb, HuggingFaceFW/fineweb-edu y Wikipedia para reducir el olvido catastrofico. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. El autor indica que futuras iteraciones se entrenaran con mas datos de Reddit y Twitter.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) en texto informal y conversacional.
- Comprension de jerga de internet, abreviaturas y expresiones coloquiales de Discord, Reddit y Twitter.
- Generacion de representaciones contextuales para tareas downstream (clasificacion, extraccion de caracteristicas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Moderacion de comunidades en Discord: el modelo puede predecir tokens enmascarados en mensajes para detectar patrones de lenguaje toxico o jerga emergente, aprovechando su entrenamiento especifico en mensajes de Discord.
- Analisis de sentimiento en redes sociales: al comprender argot de Twitter y Reddit, puede usarse como encoder base para clasificadores de sentimiento en publicaciones informales, superando a encoders genericos en este dominio.
- Normalizacion de texto coloquial: prediccion de palabras completas a partir de abreviaturas o mensajes truncados, util en pipelines de preprocesamiento para sistemas de atencion al cliente que reciben texto informal.
- Deteccion de spam y contenido malicioso: el fill-mask permite identificar anomalias en mensajes cortos y patrones de escritura sospechosos en foros y chats.
- Investigacion sociolinguistica: analisis de variaciones del lenguaje digital y evolucion de la jerga mediante prediccion de tokens enmascarados en corpus de mensajes.
- Sistemas de autocompletado para chats: aunque el modelo es un encoder y no un generador, puede emplearse para sugerir palabras enmascaradas en interfaces de mensajeria con contexto limitado.
- Extraccion de caracteristicas para busqueda semantica: sus representaciones pueden alimentar indices vectoriales especializados en contenido conversacional informal.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre un subconjunto de 100.000 mensajes aleatorios de Discord con 182.000 tokens enmascarados del dataset ManBib/DUE-filtered-deduped, excluyendo los datos de entrenamiento.

| Metrica | ettin-encoder-400m | ettinnet-17m-preview | ettinnet-32m-preview |
|---|---:|---:|---:|
| Top-1 | 34,57% | 34,27% | **37,79%** |
| Top-3 | 47,73% | 48,89% | **52,74%** |
| Top-5 | 52,59% | 54,60% | **58,28%** |
| Top-10 | 58,32% | 61,60% | **65,04%** |
| Top-20 | 63,31% | 67,87% | **70,94%** |
| MRR | 0,4298 | 0,4382 | **0,4737** |
| Cross-entropy | 4,3792 | 3,8370 | **3,5506** |
| Perplexity | 79,77 | 46,39 | **34,83** |

Top-1 por longitud de mensaje:

| Palabras | Tokens enmascarados | ettin-encoder-400m | ettinnet-17m-preview | ettinnet-32m-preview |
|---|---:|---:|---:|---:|
| 3-5 | 30.574 | 13,15% | 22,40% | **24,45%** |
| 6-10 | 57.835 | 28,99% | 33,40% | **36,54%** |
| 11-20 | 46.338 | 40,85% | 37,82% | **41,75%** |
| 21-40 | 30.336 | **47,07%** | 39,16% | 43,33% |
| 41-80 | 13.489 | **49,95%** | 39,48% | 44,50% |
| 81-200 | 5.470 | **52,87%** | 39,73% | 44,73% |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (32 millones de parametros), aproximadamente 128 MB en FP16 y menos de 100 MB en cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU es suficiente para inferencia.
- Cabe en cualquier GPU consumer e integrada; tambien puede ejecutarse en CPU sin problemas.
- Opciones de despliegue: al ser un modelo safetensors de tipo encoder, puede cargarse con la libreria Transformers de Hugging Face, y potencialmente con ONNX Runtime o TGI para serving. No se documentan integraciones especificas con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque por su tamano se espera una latencia muy baja en GPU y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 (Discord) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ettinnet-32m-preview | 32,08 M | no disponible | 37,79% | MIT | Hugging Face |
| ettinnet-17m-preview | no disponible | no disponible | 34,27% | MIT (presumible) | Hugging Face |
| ettin-encoder-400m | 400 M (aprox.) | no disponible | 34,57% | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo experimental preview: el autor indica explicitamente que no esta pensado para entornos de produccion.
- Rendimiento degradado en contextos largos: el modelo sufre en mensajes largos (mas de 20 palabras), donde el ettin-encoder-400m supera en Top-1, debido a la limitada cantidad de datos de entrenamiento con mensajes extensos.
- Posible olvido de codigo y matematicas: el autor advierte que el modelo puede haber perdido capacidad en estas areas y rendir peor en ellas.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Riesgo de sesgos: al entrenarse con mensajes de internet sin filtrado explicito de sesgos, puede heredar sesgos sociales y culturales presentes en Discord, Reddit y Twitter.
- Riesgo de alucinacion: al ser un modelo de fill-mask, las predicciones pueden ser plausibles pero incorrectas, especialmente en dominios especializados.
- Licencia MIT: permite uso comercial, pero el autor desaconseja produccion; se recomienda validar el rendimiento en el dominio concreto antes de desplegarlo.
- No se documentan capacidades de tool calling, agentes ni generacion autoregresiva, por lo que no es adecuado para tareas conversacionales generativas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RyanStudio/ettinnet-v1-32m-preview)
- [Modelo base jhu-clsp/ettin-encoder-32m](https://huggingface.co/jhu-clsp/ettin-encoder-32m)
- [Dataset ManBib/DUE-filtered-deduped](https://huggingface.co/datasets/ManBib/DUE-filtered-deduped)
- [Dataset HuggingFaceFW/fineweb](https://huggingface.co/datasets/HuggingFaceFW/fineweb)
- [Dataset HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)

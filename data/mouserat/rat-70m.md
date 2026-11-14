# Mouserat/rat-70m

## Resumen

rat-70m es un modelo de lenguaje de tipo encoder-decoder basado en la arquitectura T5, desarrollado por el usuario Mouserat. Con aproximadamente 70 millones de parámetros, está diseñado específicamente para entornos embebidos y aplicaciones con recursos limitados, con un enfoque multilingüe centrado en japonés e inglés. El modelo se presenta como una evolución de una iteración anterior denominada t5-6lang-77m, de la que hereda la arquitectura.

El modelo se entrena sobre el dataset Mouserat/llmjp4-2b-dataset, que contiene aproximadamente 2 mil millones de tokens. Su objetivo declarado es servir como modelo pequeño multilingüe (japonés-inglés) para despliegue en sistemas embebidos, donde el espacio y la potencia de cálculo son restricciones críticas.

Es importante señalar que el repositorio se encuentra en un estado muy temprano: fue creado el 14 de noviembre de 2026 y, según la model card, la especificación, inicialización y scripts de entrenamiento se irán añadiendo progresivamente. No hay pesos publicados, no hay pipeline definido y no se han reportado resultados de evaluación. La licencia Apache 2.0 facilita su uso comercial una vez disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5) |
| Parametros totales | ~70M (objetivo declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Japones e ingles (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio sin pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia T5 (Text-to-Text Transfer Transformer), un modelo encoder-decoder que formula todas las tareas como generación texto-a-texto. Según la model card, rat-70m hereda la arquitectura de la iteración previa t5-6lang-77m y apunta a un tamaño de aproximadamente 70 millones de parámetros, lo que lo sitúa en la gama ultraligera de modelos T5 (comparable en escala a t5-small, de 60M de parámetros).

El entrenamiento se realiza sobre el dataset Mouserat/llmjp4-2b-dataset, con aproximadamente 2 mil millones de tokens, centrado en japonés e inglés. No se dispone de información sobre la composición exacta del dataset, la proporción entre idiomas, el número de pasos de entrenamiento, la presencia de RLHF/DPO ni técnicas de optimización específicas. La model card indica que los scripts de entrenamiento y la especificación detallada se añadirán en futuras actualizaciones del repositorio.

## Capacidades

- Generación de texto texto-a-texto: al seguir el paradigma T5, puede formularse para traducción, resumen, respuesta a preguntas y otras tareas generativas mediante prefijos de tarea.
- Procesamiento multilingüe japonés-inglés: el entrenamiento está orientado a estos dos idiomas.
- Traducción automática: uso natural de un modelo encoder-decoder bilingüe.
- Resumen de texto: tarea típica de la familia T5.
- Respuesta a preguntas extractiva y generativa: mediante el formato texto-a-texto.
- Soporte de tool calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Modo thinking, visión o audio: no disponible (no declarado).

## Casos de uso

- Traducción japonés-inglés en dispositivos embebidos: el tamaño de ~70M parámetros permite ejecutar el modelo en microcontroladores de gama alta o SoCs con poca memoria, ofreciendo traducción local sin conexión a la nube.
- Resumen de documentos cortos en japonés: adecuado para resumir correos, notas o artículos breves en aplicaciones móviles o de escritorio con recursos limitados.
- Respuesta a preguntas sobre textos cortos: integrable en asistentes locales que respondan a preguntas sobre un contexto acotado, aprovechando la naturaleza encoder-decoder para tareas extractivas.
- Preprocesamiento de texto en pipelines NLP: puede emplearse como modelo ligero para normalización, parafraseo o generación de variantes en sistemas de aumento de datos.
- Prototipado rápido de tareas texto-a-texto: su reducido tamaño permite iterar rápidamente en experimentos académicos o pruebas de concepto sin necesidad de GPUs de gran capacidad.
- Filtrado y clasificación generativa de contenido: mediante formulaciones texto-a-texto (por ejemplo, "clasifica: ..."), puede usarse para etiquetado ligero en entornos de bajo consumo.
- Educación y experimentación: útil como modelo de referencia para estudiar el comportamiento de arquitecturas T5 pequeñas en contextos bilingües japonés-inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~70M parámetros en fp32 se estiman aproximadamente 280 MB de pesos, y en fp16 alrededor de 140 MB, sin contar activaciones ni caché.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, con amplio margen, e incluso en dispositivos embebidos con varios cientos de MB de RAM.
- Opciones de despliegue: al ser un modelo T5, sería compatible con bibliotecas como Hugging Face Transformers, ONNX Runtime y potencialmente llama.cpp si se publican pesos en GGUF (no confirmado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-70m | ~70M (objetivo) | no disponible | Japones, ingles | Apache 2.0 | Repositorio sin pesos publicados |
| google/t5-small | 60M | 512 tokens | Ingles (multilingue en variantes mT5) | Apache 2.0 | Pesos publicados |
| google/mt5-small | 300M | 512 tokens | 101 idiomas | Apache 2.0 | Pesos publicados |
| google/t5-efficient-small | 60M | 512 tokens | Ingles | Apache 2.0 | Pesos publicados |

La comparación con t5-small y mt5-small es la más directa por escala y arquitectura. rat-70m se diferencia por su enfoque declarado en japonés e inglés y su orientación a entornos embebidos, pero a diferencia de las alternativas de Google, aún no ofrece pesos ni resultados de evaluación.

## Limitaciones y advertencias

- Repositorio en estado inicial: no hay pesos publicados, ni pipeline definido, ni scripts de entrenamiento disponibles en el momento de la ficha.
- Sin benchmarks: no existen métricas publicadas que permitan evaluar su calidad real frente a alternativas.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos lingüísticos, culturales o de género.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; especialmente relevante en tareas de respuesta a preguntas.
- Limitaciones de contexto: la longitud de contexto no está especificada; los modelos T5 pequeños suelen limitarse a 512 tokens.
- Cobertura idiomática restringida: aunque la model card menciona herencia de un modelo de 6 idiomas, rat-70m se declara centrado en japonés e inglés; el rendimiento en otros idiomas es incierto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre los datos de entrenamiento.
- Madurez para producción: no recomendable para despliegue en producción hasta que se publiquen pesos, evaluación y documentación completa.

## Enlaces

- Hugging Face: https://huggingface.co/Mouserat/rat-70m
- Dataset de entrenamiento: https://huggingface.co/datasets/Mouserat/llmjp4-2b-dataset (referenciado en la model card)
- Modelo predecesor: t5-6lang-77m (referenciado en la model card, sin enlace directo disponible)

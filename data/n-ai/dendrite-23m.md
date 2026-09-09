# n-AI/dendrite-23m

## Resumen

Dendrite-23m es un modelo de lenguaje de tamaño reducido (aproximadamente 23 millones de parámetros) desarrollado por n-AI. Se trata de un modelo de mezcla de expertos (MoE) sparse entrenado desde cero y ajustado sobre los datasets Veelane/TinyStories-small y Abirate/english_quotes. Su principal característica es estar optimizado para ejecución en CPU, con soporte explícito para instrucciones AVX y FMA.

El modelo se presenta como un small language model (SLM) experimental orientado a entornos sin GPU. La licencia Apache 2.0 permite uso comercial y modificaciones, aunque su capacidad real de generación de texto está limitada por el reducido corpus de entrenamiento. No se dispone de documentación técnica pública sobre la arquitectura interna ni sobre la longitud de la ventana de contexto.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE sparse con arquitectura personalizada, optimizada para CPU con AVX/FMA |
| Parámetros totales | 23 millones (según el nombre del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repositorio: 0.1 GB) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de mezcla de expertos (MoE) con activación sparse, combinada con una implementación personalizada orientada a aprovechar las instrucciones vectoriales AVX y FMA en CPU. Según los metadatos, el modelo fue entrenado desde cero y posteriormente ajustado mediante fine-tuning sobre los datasets Veelane/TinyStories-small y Abirate/english_quotes.

No se proporciona información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni fórmulas de optimización como RLHF o DPO. Tampoco se documenta el detalle del routing del MoE ni la cantidad real de parámetros activados en cada paso, por lo que la arquitectura interna debe considerarse experimental.

## Capacidades

- Generación de texto autoregresivo en inglés, orientada a relatos breves y citas.
- Optimización para inferencia en CPU mediante AVX/FMA, lo que facilita su ejecución en entornos sin aceleradores gráficos.
- Estructura sparse tipo MoE, que en teoría permite activar solo una parte de los parámetros en cada paso; el número real de parámetros activos no está documentado.
- Ajuste fino sobre TinyStories-small y english_quotes, lo que sugiere cierta capacidad para generar narrativa sencilla y frases cortas.
- No consta soporte de tool calling, vision, audio ni razonamiento formal.
- No hay evidencia de capacidades multilingües; el modelo está etiquetado como solo inglés.

## Casos de uso

- Prototipado de arquitecturas MoE en CPU: El modelo permite probar diseños de mezcla de expertos en máquinas sin GPU, gracias a la optimización AVX/FMA y a su tamaño reducido.
- Generación de cuentos cortos en inglés para aplicaciones de lectura infantil: Al estar entrenado con TinyStories-small, puede servir como base para generar relatos sencillos, siempre que no se requiera alta calidad.
- Experimentación educativa en cursos de redes neuronales: Por su tamaño reducido y licencia Apache 2.0, puede utilizarse para analizar el comportamiento de un MoE sparse sin necesidad de infraestructura costosa.
- Pruebas de eficiencia de inferencia en CPU: Puede emplearse como caso de estudio para medir el impacto de las instrucciones AVX/FMA en el rendimiento de un modelo de lenguaje.
- Ajuste fino (fine-tuning) en hardware limitado: Al tener pocos parámetros, es viable ajustarlo en datasets pequeños para investigación o docencia.
- Generación de citas o textos cortos en inglés para chatbots simples o demos: Su naturaleza autoregresiva y su entrenamiento en un corpus de citas lo hacen adecuado para prototipos rápidos donde la variedad léxica no sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al tener aproximadamente 23 millones de parámetros, el modelo puede ejecutarse en CPU sin necesidad de GPU.
- La optimización AVX/FMA sugiere que se aprovechan instrucciones vectoriales en procesadores x86 modernos; no se dispone de requisitos mínimos oficiales.
- El repositorio ocupa 0.1 GB, por lo que la memoria necesaria para cargar los pesos es probablemente inferior a 1 GB.
- No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura personalizada, es posible que requiera una integración manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones oficiales con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Entrenado solo en inglés, sin soporte documentado para otros idiomas.
- Corpus de entrenamiento muy reducido (TinyStories-small y un dataset de citas), lo que limita la calidad del texto y aumenta el riesgo de alucinación.
- Longitud de contexto no documentada; no se puede garantizar un rendimiento fiable en conversaciones largas.
- Arquitectura personalizada y soporte de frameworks estándar no verificado, lo que puede dificultar su despliegue en producción.
- No se han publicado benchmarks ni evaluaciones de seguridad.
- El nombre sugiere 23 millones de parámetros, pero no hay confirmación oficial del número total ni del número de parámetros activos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni mantenimiento.

## Enlaces

- https://huggingface.co/n-AI/dendrite-23m

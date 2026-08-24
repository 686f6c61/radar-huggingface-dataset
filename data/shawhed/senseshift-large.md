# shawhed/SenseShift-large

## Resumen

SenseShift-large es un modelo de generación de texto controlable desarrollado por shawhed, aceptado en EMNLP 2026. Su función principal es reescribir cualquier oración de un pasaje, o generar una nueva, ajustando el sentimiento en una escala continua de −1.0 a +1.0, manteniendo la coherencia con el contexto circundante. A diferencia de los modelos autorregresivos tradicionales, SenseShift emplea un encoder bidireccional no autorregresivo basado en ModernBERT-large, lo que le permite condicionar cada token generado tanto al texto anterior como al posterior, facilitando la sustitución de oraciones en mitad de un pasaje.

El modelo introduce un vocabulario de control de 21 tokens especiales que representan valores de sentimiento en una rejilla de 0.1. Durante el entrenamiento, cada oración se puntúa con VADER y se prefija con su token de sentimiento; luego se enmascara una oración y el modelo debe reconstruirla a partir del token dado y del contexto. En inferencia, se prefija cada oración con su sentimiento actual, se asigna a la oración objetivo el sentimiento deseado, se enmascaran sus palabras y se rellenan mediante búsqueda de haz. Con 395,9 millones de parámetros, SenseShift-large ofrece una alternativa ligera y eficiente frente a decodificadores más grandes para tareas de control de atributos continuos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional no autorregresivo (basado en ModernBERT-large) |
| Parametros totales | 395.903.189 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SenseShift-large se construye sobre ModernBERT-large, un transformer encoder bidireccional. La innovación clave es el uso de un vocabulario de control de sentimiento: 21 tokens especiales `[-1.0]` a `[1.0]` en una rejilla de 0.1, añadidos al tokenizador. El entrenamiento consiste en puntuar cada oración de un pasaje con VADER, prefijarla con su token de sentimiento y enmascarar una oración completa; el modelo debe reconstruirla a partir del token dado y del contexto bidireccional. Este enfoque enseña al modelo a generar oraciones que cumplen un sentimiento objetivo y se integran coherentemente con sus vecinas.

En generación, el proceso se invierte: se prefijan todas las oraciones con su sentimiento actual, se asigna a la oración objetivo el sentimiento deseado, se enmascaran sus palabras y se rellenan mediante búsqueda de haz. Al ser un encoder bidireccional, cada token generado está condicionado tanto al texto anterior como al posterior, lo que permite reemplazar oraciones en medio de un pasaje sin perder coherencia. No se han publicado detalles sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO; la información disponible solo describe el procedimiento de enmascarado y reconstrucción.

## Capacidades

- Control continuo de sentimiento en una escala de −1.0 a +1.0 con resolución de 0.1.
- Reescritura de oraciones existentes manteniendo el contexto y los detalles concretos.
- Generación de nuevas oraciones para insertar en una posición específica del pasaje.
- Transferencia de estilo emocional (text style transfer) a nivel de oración.
- Aumento de datos mediante paráfrasis con variación de sentimiento controlada.
- Generación de contraejemplos para pruebas de robustez de clasificadores.
- Funcionamiento no autorregresivo: cada token se genera condicionado al contexto completo, no solo al pasado.
- Soporte de modo "add" para insertar oraciones nuevas y "rewrite" para reemplazar existentes.

## Casos de uso

- Asistente de escritura de ficción: ajustar el arco emocional de un borrador oración a oración, oscureciendo un punto de inflexión o suavizando un final sin reescribir la prosa circundante. El control continuo permite cambios sutiles o drásticos según el valor de sentimiento elegido.
- Revisión y edición de textos: retunar el tono de testimonios, descripciones de producto o notas de versión manteniendo los detalles concretos intactos. Por ejemplo, convertir una reseña negativa en positiva sin alterar los hechos mencionados.
- Aumento de datos para clasificación de sentimiento: generar paráfrasis con valores de sentimiento conocidos para equilibrar conjuntos de datos sesgados o crear pares mínimos que difieran solo en sentimiento, compartiendo contexto.
- Pruebas de robustez y contraejemplos: evaluar un clasificador downstream con entradas donde exactamente una oración cambia de sentimiento, manteniendo todo lo demás fijo. Esto permite medir la sensibilidad del modelo a variaciones emocionales localizadas.
- Investigación en generación controlable: servir como baseline no autorregresivo para control continuo de atributos y como banco de pruebas para explorar los límites de la señal de control en inferencia.
- Generación de contenido con tono específico: crear variaciones de un párrafo para campañas de marketing o comunicación, ajustando el sentimiento a valores concretos (por ejemplo, +0.8 para un tono entusiasta) sin perder la información esencial.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El resumen del paper en OpenReview indica que SenseShift logra un control de sentimiento más fuerte y mantiene la calidad del texto y la robustez frente a baselines decodificadores más grandes en generación de historias y reseñas, pero no se proporcionan cifras concretas (MMLU, HumanEval, etc.) en la documentación accesible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la información proporcionada.
- Con 395,9 millones de parámetros y un tamaño de repo de 1,6 GB (probablemente en FP32), el modelo puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, como una NVIDIA GTX 1660 Super o RTX 3050, aunque se recomienda una RTX 3060 o superior para mayor comodidad.
- Al ser un encoder no autorregresivo, la inferencia es más rápida que un decodificador del mismo tamaño, pero la búsqueda de haz puede aumentar la latencia según el número de hipótesis.
- Opciones de despliegue: al usar la librería transformers, puede integrarse con frameworks como vLLM o TGI, aunque su naturaleza no autorregresiva y el uso de tokens de control requieren el código de inferencia incluido en el repositorio. También es posible ejecutarlo con llama.cpp si se convierte a GGUF, pero no se proporciona soporte oficial.
- El código de inferencia requiere `torch`, `transformers`, `huggingface-hub` y `nltk`; el léxico VADER se descarga automáticamente en el primer uso.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de control de sentimiento continuo. El paper menciona que SenseShift supera a baselines decodificadores más grandes, pero no se listan modelos concretos ni métricas. Se recomienda consultar el artículo en OpenReview para obtener detalles de la comparación experimental.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay soporte multilingüe.
- Al ser un encoder no autorregresivo, la fluidez del texto generado puede ser inferior a la de decodificadores grandes en algunos casos, especialmente con valores de sentimiento extremos.
- La dependencia de VADER para puntuar el sentimiento durante el entrenamiento puede introducir sesgos propios de esa herramienta, que no siempre captura matices contextuales.
- No se han documentado sesgos específicos, pero al entrenarse con datos de texto generales, puede reflejar sesgos presentes en el corpus.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías.
- El repositorio no incluye pesos cuantizados; la cuantización no está documentada y podría requerir conversión manual.
- El número de descargas y likes es cero, lo que sugiere que el modelo es reciente y aún no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- [HuggingFace - SenseShift-large](https://huggingface.co/shawhed/SenseShift-large)
- [Paper en OpenReview - SENSESHIFT: Continuous Sentiment-Controlled Text generation](https://openreview.net/forum?id=BvPnX0Y2TF)
- [Perfil del autor en HuggingFace](https://huggingface.co/shawhed)

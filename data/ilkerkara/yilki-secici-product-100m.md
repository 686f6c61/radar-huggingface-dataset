# ilkerkara/yilki-secici-product-100m

## Resumen

yilki-secici-product-100m es un modelo de clasificación de texto en turco desarrollado por el usuario ilkerkara, especializado en análisis de sentimiento binario (positivo/negativo) sobre reseñas de productos. Se trata de un ajuste fino (fine-tuning) del modelo base yilki-kulun-100m, un transformer de 100 millones de parámetros preentrenado con 2.000 millones de tokens. No es, por tanto, un modelo de propósito general entrenado desde cero, sino un clasificador de tarea específica.

El modelo resuelve un problema acotado y bien definido: determinar la polaridad de una reseña de producto escrita en turco. Con 100.095.746 parámetros y un repositorio de 0,8 GB, es un modelo ligero pensado para despliegue en entornos con recursos limitados, donde un clasificador dedicado resulta más eficiente que un modelo generativo grande. Su relevancia radica en la existencia de pocos recursos abiertos específicos para turco en esta tarea.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face. El modelo se publicó en noviembre de 2026, cuenta con licencia Apache-2.0 y se distribuye en formato safetensors con código personalizado (custom_code), lo que exige `trust_remote_code=True` para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning de yilki-kulun-100m) |
| Parametros totales | 100.095.746 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | maxima de entrenamiento 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de yilki-kulun-100m, un transformer de 100 millones de parámetros preentrenado con 2.000 millones de tokens sobre datos web (FineWeb-2, ODC-BY 1.0). Sobre esa base se aplica un ajuste fino completo, sin congelar el modelo base, para la tarea de clasificación de sentimiento binaria con etiquetas `negative` y `positive`. La cabecera de clasificación se entrena con una tasa de aprendizaje mayor que el cuerpo del modelo.

El protocolo de entrenamiento emplea una tasa de aprendizaje de 2e-4 para el cuerpo y 2e-3 para la cabecera, programación coseno con un 10 % de calentamiento, 3 épocas y una longitud máxima de 256 tokens. Se entrenaron dos semillas (0 y 1), con la semilla 1 alojada en el subdirectorio `tohum-1/`. El conjunto de datos es asparius/Turkish-Product-Review, con 4.800 ejemplos de entrenamiento y 800 de test, íntegramente en turco y específico de esta tarea, separado del corpus de preentrenamiento. La model card no documenta el uso de RLHF, DPO ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre reseñas de productos en turco.
- Salida de etiquetas `negative` y `positive` mediante `AutoModelForSequenceClassification`.
- Procesamiento de textos de hasta 256 tokens.
- Dos variantes de pesos correspondientes a dos semillas de entrenamiento (raíz y `tohum-1/`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- No dispone de capacidades multilingües: únicamente turco.

## Casos de uso

- Moderación y análisis de reseñas en comercio electrónico: clasificar automáticamente las opiniones de clientes en positivas o negativas para alimentar paneles de satisfacción y sistemas de alerta temprana, aprovechando su tamaño reducido para procesar lotes grandes a bajo coste.
- Enrutamiento de atención al cliente: detectar reseñas negativas y dirigirlas a un equipo de soporte prioritario, usando la etiqueta binaria como señal de triaje en un pipeline de tickets.
- Monitorización de reputación de producto: agregar la polaridad de reseñas por SKU para generar métricas de sentimiento a lo largo del tiempo en plataformas de marketplaces turcos.
- Filtrado previo en pipelines de análisis más complejos: usar el clasificador como primera etapa para descartar o priorizar textos antes de pasarlos a un modelo generativo mayor, reduciendo el coste computacional total.
- Investigación en PLN para turco: servir como línea base ligera y reproducible (con dos semillas documentadas) en experimentos de clasificación de sentimiento en un idioma con pocos recursos abiertos.
- Análisis de opiniones en aplicaciones móviles y foros: clasificar comentarios de usuarios en turco para detectar insatisfacción y activar respuestas automáticas o encuestas de seguimiento.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de asparius/Turkish-Product-Review (800 ejemplos), según la model card:

| Modelo | Semilla | Exactitud en test |
|---|---|---|
| yilki-secici-product-100m | 0 (raíz) | 81,25 % |
| yilki-secici-product-100m | 1 (`tohum-1/`) | 81,50 % |
| yilki-secici-product-100m | media | 81,37 % |
| ModernBERT-tr | única | 83,25 % |
| BERTurk | única | 82,87 % |
| ConvBERT | única | 82,63 % |
| XLM-R | única | 81,50 % |
| mBERT | única | 77,12 % |

El autor advierte que estas cifras se midieron con su propio protocolo y no deben compararse directamente con resultados publicados por terceros. El intervalo de confianza del test es de ±2,7 puntos porcentuales debido al reducido tamaño del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (100 M de parámetros), alrededor de 0,2 GB en fp16 y menos de 0,15 GB en cuantización de 8 bits; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, T4, A100 y H100 sin aprovechar su capacidad completa. También es viable en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito obligatorio por el código personalizado); el formato safetensors permite su uso con TGI y con frameworks compatibles, aunque no se documenta soporte verificado para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yilki-secici-product-100m | 100 M | 256 tokens | 81,37 % (media de 2 semillas) | Apache-2.0 | Hugging Face |
| ModernBERT-tr | no disponible | no disponible | 83,25 % | no disponible | no disponible |
| BERTurk | no disponible | no disponible | 82,87 % | no disponible | no disponible |
| XLM-R | no disponible | no disponible | 81,50 % | no disponible | no disponible |

Los modelos de referencia se citan únicamente con su exactitud bajo el protocolo del autor; no se dispone de sus especificaciones completas en la información proporcionada. yilki-secici-product-100m queda por debajo de ModernBERT-tr, BERTurk y ConvBERT, y empata prácticamente con XLM-R, aunque con un tamaño mucho menor que este último.

## Limitaciones y advertencias

- Solo admite turco; su rendimiento cae fuera del dominio de reseñas de productos, en lenguaje coloquial o en textos muy cortos.
- Las métricas provienen de un único conjunto de test de 800 ejemplos, con un intervalo de confianza de ±2,7 puntos, por lo que la comparación fina con otros modelos es poco fiable.
- El modelo base se entrenó con datos web, por lo que puede arrastrar sesgos y generar asociaciones incorrectas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos o sarcásticos.
- La model card advierte de que el corpus de preentrenamiento contiene datos personales con apariencia real (correos, teléfonos, matrículas, identificadores) y que aproximadamente el 0,8 % de 492 fragmentos muestreados se reprodujeron literalmente en el modelo base; si aparecen datos personales en las salidas, no deben usarse ni difundirse.
- La licencia del conjunto de datos de ajuste fino no está especificada, lo que introduce incertidumbre sobre el uso comercial pese a que los pesos se publican bajo Apache-2.0.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar dicho código antes de desplegarlo en producción.
- No se documentan cuantizaciones oficiales ni soporte verificado en motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilkerkara/yilki-secici-product-100m
- Modelo base: https://huggingface.co/ilkerkara/yilki-kulun-100m
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/asparius/Turkish-Product-Review
- FineWeb-2 (datos de preentrenamiento del modelo base): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

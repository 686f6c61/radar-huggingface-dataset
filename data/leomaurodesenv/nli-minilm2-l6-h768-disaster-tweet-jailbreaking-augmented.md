# leomaurodesenv/nli-MiniLM2-L6-H768-disaster-tweet-jailbreaking-augmented

## Resumen

El modelo `nli-MiniLM2-L6-H768-disaster-tweet-jailbreaking-augmented` es un ajuste fino del cross-encoder `cross-encoder/nli-MiniLM2-L6-H768`, desarrollado por Leonardo Moraes (leomaurodesenv). Está diseñado para la clasificación de texto, específicamente para detectar si un tweet describe un desastre real, con una capa adicional de robustez frente a intentos de jailbreaking gracias a un dataset aumentado con ejemplos adversarios. Resuelve el problema de la detección fiable de eventos de emergencia en redes sociales, un área crítica para alertas tempranas y gestión de crisis. Su relevancia actual radica en la creciente preocupación por la seguridad de los modelos de IA y la necesidad de clasificadores que no sean fácilmente engañados por entradas maliciosas.

Con 82 millones de parámetros y una arquitectura transformer encoder de 6 capas y 768 dimensiones de ocultamiento, el modelo es compacto y eficiente para inferencia en entornos con recursos limitados. La longitud de contexto no está documentada, pero se asume la típica de los modelos MiniLM (512 tokens). El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM2-L6-H768) |
| Parametros totales | 82.119.938 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en un cross-encoder MiniLM2 con 6 capas y 768 unidades de ocultación. A diferencia de los bi-encoders, que producen embeddings independientes para cada texto, un cross-encoder procesa la concatenación de las dos secuencias (premisa e hipótesis) a través del transformer completo, lo que permite una interacción profunda entre ambas. En este caso, la entrada es el tweet y la etiqueta de clasificación se obtiene mediante una capa de clasificación sobre el token `[CLS]` (o similar). El entrenamiento se realizó sobre un dataset de tweets de desastres, aumentado con ejemplos de jailbreaking para mejorar la robustez frente a intentos de manipulación del prompt.

El proceso de ajuste fino se llevó a cabo con los siguientes hiperparámetros: tasa de aprendizaje de 2e-05, tamaño de batch de 8, 10 épocas, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 50 pasos de calentamiento. La pérdida de validación final fue de 0.2165 y la exactitud (accuracy) de 0.9661. No se especifica la composición exacta del dataset ni el número de tokens de entrenamiento, ya que la model card es automática y carece de detalles.

## Capacidades

- Clasificación binaria de tweets como desastre o no desastre, con una exactitud de validación del 96,61 %.
- Robustez frente a jailbreak: el entrenamiento con datos aumentados con técnicas de jailbreak busca evitar que el modelo sea engañado por prompts maliciosos.
- Compatible con la pipeline `text-classification` de Transformers, lo que facilita su integración en entornos Python.
- Soporte para inferencia a través de `text-embeddings-inference` y endpoints compatibles (según las etiquetas del repositorio).
- Al ser un modelo pequeño (82 M de parámetros), puede ejecutarse en CPU y GPU de consumo con baja latencia.
- No incluye capacidades de generación de texto, tool calling ni agentes, ya que es un clasificador puro.

## Casos de uso

- **Monitoreo de redes sociales para alertas tempranas**: el modelo puede analizar flujos de tweets en tiempo real para detectar menciones de desastres (terremotos, incendios, inundaciones) y activar alertas automáticas para agencias de protección civil. Su precisión de 0.9661 lo hace adecuado para filtrar ruido y priorizar mensajes relevantes.

- **Detección de contenido de emergencia en plataformas de mensajería**: integrado en sistemas de moderación, puede clasificar mensajes de usuarios como urgentes o no urgentes, permitiendo una respuesta rápida a situaciones críticas en servicios como Twitter o Facebook.

- **Análisis de sentimiento en crisis**: aunque el modelo es binario (desastre o no), puede usarse como primer filtro en un pipeline más complejo que luego realice análisis de sentimiento o extracción de ubicaciones. Su robustez ante jailbreak evita que un usuario intente evadir la detección con lenguaje adversario.

- **Investigación en seguridad de IA**: el modelo sirve como caso de estudio para evaluar la eficacia de la aumentación de jailbreak en clasificadores de texto. Se puede comparar su comportamiento frente a modelos sin este tratamiento en entornos académicos o de investigación.

- **Sistemas de respuesta rápida en plataformas de crowdsourcing**: en aplicaciones donde los usuarios reportan incidentes, el modelo puede filtrar los reportes válidos y descartar ruido o spam, mejorando la eficiencia de los equipos de respuesta.

- **Auditoría de contenido en medios**: empresas de verificación de noticias pueden usar el modelo para detectar tweets que describan desastres reales y así priorizar la verificación de hechos en contextos de alta actividad.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados de benchmarks (array vacío). Sin embargo, la model card incluye una tabla de resultados de evaluación durante el entrenamiento:

| Epoch | Validation Loss | Accuracy |
|------:|----------------:|---------:|
| 1     | 0.5986          | 0.7131   |
| 2     | 0.4311          | 0.8190   |
| 3     | 0.3797          | 0.8979   |
| 4     | 0.3437          | 0.9110   |
| 5     | 0.3151          | 0.9381   |
| 6     | 0.2230          | 0.9563   |
| 7     | 0.2501          | 0.9548   |
| 8     | 0.2171          | 0.9664   |
| 9     | 0.2393          | 0.9643   |
| 10    | 0.2299          | 0.9664   |

El valor final de accuracy en el conjunto de evaluación es 0.9661 (media de los últimos pasos). No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 82 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 328 MB. Con cuantización a FP16 (si se aplicara) se reduciría a unos 164 MB. Cabe perfectamente en cualquier GPU moderna, incluso en las de gama de entrada con 4 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.). También se puede ejecutar en CPU con un rendimiento aceptable para tareas de clasificación en lote.
- **Despliegue**: se puede usar directamente con la pipeline de `transformers` en Python, o con `text-embeddings-inference` (TEI) para servir el modelo como endpoint HTTP. También es compatible con `vLLM` y `TGI` para clasificación de texto (aunque no son habituales para encoders). Para producción ligera, se puede usar `ONNX Runtime` o `TensorRT` para acelerar la inferencia.
- **Latencia**: al ser un modelo pequeño (6 capas), la latencia de inferencia típica es inferior a 10 ms en GPU y del orden de 50-100 ms en CPU, dependiendo de la longitud del texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `cross-encoder/nli-MiniLM2-L6-H768` es un clasificador de NLI general, pero no está especializado en tweets de desastres ni en robustez frente a jailbreak. No se puede realizar una comparación cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- **Sesgos desconocidos**: al no conocer la composición del dataset de entrenamiento, no se puede evaluar el sesgo demográfico o geográfico. El modelo puede estar más sesgado hacia el inglés y hacia contextos de desastres típicos de EE. UU.
- **Alucinación**: aunque es un clasificador y no genera texto, puede cometer errores de clasificación (falsos positivos o negativos). No se ha medido la tasa de falsos positivos/negativos en la información disponible.
- **Contexto limitado**: si la longitud de contexto es de 512 tokens, los tweets más largos (poco comunes) podrían truncarse y perder información relevante.
- **Idioma**: no se especifica el idioma, pero es probable que esté entrenado principalmente con tweets en inglés. El uso en otros idiomas puede degradar el rendimiento.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones, pero no se ofrece garantía sobre la exactitud de las predicciones.
- **Falta de documentación**: la model card es automática y no detalla el proceso de aumentación de jailbreak, el origen de los datos ni las técnicas específicas de robustez. Esto dificulta la evaluación de su comportamiento en entornos adversarios.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/leomaurodesenv/nli-MiniLM2-L6-H768-disaster-tweet-jailbreaking-augmented)
- [Modelo base: cross-encoder/nli-MiniLM2-L6-H768](https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768)
- [GitHub del autor (Leonardo Moraes)](https://github.com/leomaurodesenv/)

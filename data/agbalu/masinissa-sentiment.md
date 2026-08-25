# agbalu/Masinissa-Sentiment

## Resumen

Masinissa-Sentiment es el primer clasificador de sentimiento para lenguas bereberes, concretamente para el kabyle (Taqbaylit, código `kab_Latn`). Desarrollado por la organización AƔBALU (agbalu), especializada en procesamiento del lenguaje natural para el kabyle, este modelo de 31 millones de parámetros clasifica textos en tres categorías: negativo, neutral y positivo. Su relevancia radica en que cubre un vacío absoluto en el ecosistema de modelos de Hugging Face: hasta su publicación no existía ningún sistema de análisis de sentimiento para ninguna lengua bereber, a pesar de que el kabyle cuenta con millones de hablantes.

El modelo se construye mediante fine-tuning del encoder preentrenado Masinissa-31M, también desarrollado por agbalu, sobre el dataset KabSentiment, un corpus balanceado de 15.000 oraciones (5.000 por clase). Incorpora dos innovaciones técnicas destacables: una calibración mediante split-conformal prediction que devuelve conjuntos de etiquetas cuando el texto no tiene polaridad clara, y una normalización interna de caracteres que corrige la corrupción homoglífica (sustitución de la épsilon latina `ɛ` por la épsilon griega `ε`) sin intervención del usuario. En la partición de test de 1.500 oraciones alcanza un 90,27% de precisión y un 0,9026 de macro-F1, superando en 1,47 puntos a un fine-tuning ordinario y en 12,74 puntos a una sonda lineal sobre el encoder congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en agbalu/Masinissa-31M) |
| Parametros totales | 31.035.651 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | kabyle (Taqbaylit, `kab_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Masinissa-Sentiment es un modelo de clasificación de texto basado en un encoder Transformer de 31 millones de parámetros, derivado del modelo preentrenado Masinissa-31M. No se dispone de detalles sobre el número de capas, cabezas de atención o dimensión oculta, pero al ser un encoder, su función es generar representaciones contextuales de tokens que luego se proyectan a tres clases mediante una cabeza de clasificación.

El entrenamiento consistió en un fine-tuning supervisado sobre el dataset KabSentiment, compuesto por 15.000 oraciones balanceadas (5.000 por clase). Se realizaron cinco ejecuciones con semillas distintas (42, 1337, 2026, 7, 999), cada una durante 6 épocas, seleccionando la mejor época según el rendimiento en validación. Los cinco modelos resultantes se combinaron mediante un promedio uniforme de pesos (weight averaging, según Wortsman et al., ICML 2022), que superó a cada ejecución individual en la métrica de validación. Además, el modelo incorpora un mecanismo de calibración basado en split-conformal prediction: se ajusta una temperatura y un cuantil conformal que se almacenan en `config.json` y se aplican en el método `classify()`, permitiendo devolver un conjunto de etiquetas cuando la confianza no es suficiente. También se integra una normalización previa al tokenizador que repara la sustitución de la épsilon latina por la griega, un defecto frecuente en textos kabyle reales.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutral, positivo) para textos en kabyle.
- Calibración conformal: devuelve un conjunto de etiquetas (p. ej. `{neutral, positive}`) cuando el texto no presenta una polaridad clara, con una cobertura empírica del 94,00% y un tamaño medio de conjunto de 1,13 etiquetas.
- Robustez ante corrupción homoglífica: la normalización interna corrige la sustitución de `ɛ` por `ε`, manteniendo el rendimiento intacto (90,27% de precisión) incluso cuando todos los caracteres expuestos están corruptos.
- Inferencia eficiente: al ser un modelo de 31M parámetros, es ligero y adecuado para despliegue en entornos con recursos limitados.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un clasificador de texto.

## Casos de uso

- Análisis de opiniones en redes sociales en kabyle: el modelo puede clasificar publicaciones en plataformas como Facebook o X (antes Twitter) en negativo, neutral o positivo, permitiendo a marcas, organizaciones y medios monitorizar la percepción pública en tiempo real. Su robustez ante la corrupción de caracteres es clave, ya que los textos informales suelen contener errores de codificación.
- Moderación de comentarios en foros y comunidades online: integrar el clasificador en un pipeline de moderación para detectar comentarios con tono negativo o abusivo, priorizando la revisión humana. La calibración conformal ayuda a evitar falsos positivos al devolver conjuntos de etiquetas cuando la polaridad es ambigua.
- Análisis de reseñas de productos o servicios en kabyle: empresas que operan en regiones de habla kabyle pueden procesar reseñas de clientes para identificar áreas de mejora. El modelo distingue entre críticas constructivas (negativas) y comentarios neutros, facilitando la priorización.
- Investigación sociolingüística: estudiar la polaridad en corpus kabyle para analizar tendencias de opinión, discurso público o evolución del lenguaje. Su precisión por clase (F1 entre 0,891 y 0,916) permite análisis fiables a nivel de corpus.
- Atención al cliente automatizada: clasificar la actitud de los mensajes entrantes de clientes (quejas, consultas neutras, elogios) para enrutarlos al departamento adecuado o priorizar respuestas urgentes. El modelo puede ejecutarse en CPU, lo que facilita su integración en sistemas de bajo coste.
- Análisis de noticias y medios de comunicación en kabyle: medir el tono de artículos periodísticos o boletines informativos, útil para estudios de sesgo mediático o seguimiento de la opinión pública sobre temas concretos.

## Benchmarks y rendimiento

Los resultados oficiales, declarados por el autor en la model card, se basan en la partición de test de KabSentiment (1.500 oraciones, con 521 negativas, 490 neutras y 489 positivas). Se comparan tres sistemas sobre el mismo conjunto:

| Sistema | Configuracion | Accuracy | Macro-F1 |
|---|---|---|---|
| Masinissa-31M (encoder congelado) | Sonda lineal | 77,53% | 0,7764 |
| Masinissa-31M | Fine-tuning ordinario | 88,80% | 0,8880 |
| **Masinissa-Sentiment** | Cinco semillas, promedio de pesos, calibrado | **90,27%** | **0,9026** |

Además, se reportan métricas por clase:

| Clase | Soporte | Precision | Recall | F1 |
|---|---|---|---|---|
| neutral | 490 | 0,911 | 0,920 | 0,916 |
| negative | 521 | 0,896 | 0,906 | 0,901 |
| positive | 489 | 0,902 | 0,881 | 0,891 |

En cuanto a robustez, el modelo mantiene un 90,27% de precisión y 0,9026 de macro-F1 cuando todos los caracteres expuestos a la corrupción homoglífica son sustituidos, gracias a la normalización interna. Si se omite dicha normalización, el rendimiento cae al 85,67% de precisión y 0,8563 de macro-F1, lo que demuestra la eficacia del mecanismo.

## Requisitos de hardware

- VRAM estimada: con 31M de parámetros, el modelo ocupa aproximadamente 124 MB en FP32 y 62 MB en FP16. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1650 hasta una RTX 4090. También es viable su ejecución en CPU, con latencias de milisegundos por inferencia.
- Despliegue en consumer GPU: sí, sin restricciones. Es adecuado para entornos edge o dispositivos con recursos limitados.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Transformers, ONNX Runtime, o mediante frameworks como FastAPI para crear una API. También es compatible con herramientas como llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamaño del modelo, se espera una latencia inferior a 10 ms por muestra en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No existen otros modelos de análisis de sentimiento para kabyle ni para ninguna lengua bereber en el Hugging Face Hub, según la búsqueda realizada por el autor en agosto de 2026. Los únicos modelos etiquetados como `kab` en `text-classification` son identificadores de idioma o prompt-guards. Por tanto, no hay comparables directos. Como referencia, los modelos multilingües como XLM-R o mBERT podrían adaptarse, pero no se han publicado resultados en kabyle, y su rendimiento sería previsiblemente inferior debido a la escasez de datos de entrenamiento en esta lengua. Masinissa-Sentiment es, por ahora, la única opción específica para kabyle.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en kabyle; no es aplicable a otras lenguas bereberes como tashelhit, tarifit o tamasheq, ni a otros idiomas.
- Al ser un modelo de 31M parámetros, su capacidad de capturar matices semánticos complejos es limitada en comparación con modelos más grandes. La confusión entre clases, especialmente entre positivo y negativo, se concentra en construcciones con negación, como se refleja en el recall de positivo (0,881).
- La calibración conformal puede devolver conjuntos de etiquetas vacíos o múltiples, lo que requiere lógica adicional en la aplicación para manejar estos casos.
- El corpus KabSentiment, aunque balanceado, puede contener sesgos socioculturales propios de los textos recopilados (redes sociales, foros, etc.), que podrían transferirse al modelo.
- No se han publicado resultados de rendimiento en otros conjuntos de datos ni en entornos de producción, por lo que su comportamiento en dominios distintos al de entrenamiento no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la organización agbalu para cualquier redistribución o modificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Masinissa-Sentiment
- Modelo base: https://huggingface.co/agbalu/Masinissa-31M
- Dataset KabSentiment: https://huggingface.co/datasets/agbalu/KabSentiment
- Organización agbalu: https://huggingface.co/agbalu
- Repositorio GitHub: https://github.com/abderahmane-ai/agbalu
- Paper sobre weight averaging (Wortsman et al., ICML 2022): https://arxiv.org/abs/2203.05482
- Referencias adicionales citadas en la model card: https://arxiv.org/abs/2202.03829 y https://arxiv.org/abs/1905.09788

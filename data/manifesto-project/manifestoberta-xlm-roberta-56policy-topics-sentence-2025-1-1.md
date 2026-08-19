# manifesto-project/manifestoberta-xlm-roberta-56policy-topics-sentence-2025-1-1

## Resumen

ManifestoBERTa es un modelo de clasificación de texto desarrollado por el Manifesto Project, un consorcio de investigación con sede en el Wissenschaftszentrum Berlin für Sozialforschung (WZB) y el Göttinger Institut für Demokratieforschung (IfDem). Se trata de un fine-tuning de XLM-RoBERTa-large sobre aproximadamente 1,8 millones de declaraciones anotadas del Manifesto Corpus (versión 2025a), con el objetivo de categorizar cualquier texto en 56 temas políticos según el esquema de codificación del proyecto (Handbook 4).

El modelo resuelve el problema de la codificación manual de textos políticos, un proceso costoso y lento, automatizándolo con un enfoque de aprendizaje supervisado. Su relevancia actual radica en la creciente demanda de análisis cuantitativo de programas electorales, discursos parlamentarios y documentos de partidos en múltiples idiomas, especialmente en contextos de investigación comparada.

Con 560 millones de parámetros y una arquitectura de transformer encoder, el modelo acepta entradas de hasta 512 tokens (aunque fue fine-tuneado con una longitud máxima de 200 tokens) y está disponible bajo licencia BigScience OpenRAIL-M, lo que permite uso comercial con restricciones de responsabilidad y redistribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (transformer encoder) |
| Parametros totales | 560.005.232 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo del modelo base); 200 tokens durante fine-tuning |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 40 idiomas del Manifesto Corpus (mejor rendimiento); 100 idiomas del modelo base XLM-RoBERTa |
| Licencia | bigscience-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ManifestoBERTa se basa en XLM-RoBERTa-large, un transformer encoder preentrenado con aprendizaje autosupervisado sobre 2,5 TB de datos multilingües de CommonCrawl. El fine-tuning se realizó sobre el Manifesto Corpus versión 2025a, que contiene alrededor de 1,8 millones de declaraciones anotadas manualmente por codificadores expertos según el esquema de 56 temas políticos del Handbook 4.

El entrenamiento se limitó a una longitud máxima de 200 tokens por declaración, truncando o rellenando según fuera necesario. No se aplicaron técnicas de RLHF ni DPO; el ajuste se hizo mediante clasificación supervisada estándar con pérdida de entropía cruzada. El modelo final es un clasificador multiclase de 56 etiquetas, donde cada etiqueta corresponde a un tema político (por ejemplo, "501 - Environmental Protection", "107 - Internationalism: Positive").

Una característica técnica destacable es que el modelo fue diseñado para funcionar a nivel de oración o declaración individual, a diferencia de un modelo de contexto que procesa párrafos completos. Esto permite una granularidad fina en el análisis, aunque sacrifica algo de precisión en comparación con su variante de contexto.

## Capacidades

- Clasificación de textos en 56 temas políticos según el esquema del Manifesto Project (Handbook 4), incluyendo categorías como protección ambiental, economía, relaciones internacionales, bienestar social, etc.
- Soporte multilingüe: funciona en los 40 idiomas presentes en el corpus de entrenamiento (incluyendo español, inglés, alemán, francés, etc.) y, en menor medida, en otros idiomas cubiertos por XLM-RoBERTa.
- Salida de probabilidades por clase, lo que permite análisis de incertidumbre y umbrales personalizados.
- No genera texto: es exclusivamente un modelo de clasificación (encoder), no un modelo generativo.
- No soporta tool calling ni razonamiento multi-paso; su uso se limita a la asignación de etiquetas a fragmentos de texto.
- Puede procesar entradas de hasta 512 tokens, aunque el rendimiento óptimo se obtiene con declaraciones de hasta 200 tokens.

## Casos de uso

- Análisis de programas electorales: los partidos políticos publican manifiestos extensos; este modelo permite segmentar el texto en declaraciones y clasificar cada una en temas, facilitando la comparación entre partidos y elecciones.
- Investigación en ciencia política comparada: los investigadores pueden codificar grandes corpus de documentos políticos en múltiples idiomas sin intervención manual, acelerando estudios sobre posicionamiento ideológico y prioridades temáticas.
- Monitoreo de discursos parlamentarios: transcripciones de sesiones legislativas pueden ser clasificadas automáticamente para identificar qué temas dominan la agenda política en tiempo real.
- Análisis de contenido mediático: clasificar artículos de prensa o segmentos de noticias según temas políticos para estudiar la cobertura y el sesgo mediático.
- Sistemas de alerta temprana: detectar cambios en el énfasis temático de partidos políticos a lo largo del tiempo, útil para periodistas y analistas políticos.
- Automatización de informes de seguimiento: organizaciones no gubernamentales y think tanks pueden generar informes periódicos sobre la evolución de las prioridades políticas en una región, usando el modelo como componente de un pipeline de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

El modelo fue evaluado en un conjunto de prueba de 192.131 declaraciones anotadas del Manifesto Corpus. Los resultados reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0.56 |
| Top-2 Accuracy | 0.72 |
| Top-3 Accuracy | 0.80 |
| Precision | 0.55 |
| Recall | 0.56 |
| F1 (ponderado) | 0.55 |
| MCC | 0.54 |
| Cross-Entropy | 1.54 |

No se han publicado comparaciones con otros modelos de clasificación de temas políticos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 560 millones de parámetros. En FP32, los pesos ocupan aproximadamente 2,1 GB; en FP16, alrededor de 1,1 GB. La inferencia requiere una GPU con al menos 3 GB de VRAM para FP32 y 2 GB para FP16, considerando activaciones y overhead.
- GPU recomendadas: cualquier GPU con más de 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, o GPUs de centros de datos como A10 o T4. En CPU, la inferencia es posible pero más lenta (varios segundos por lote).
- Despliegue: al ser un modelo de transformers estándar, se puede servir con Hugging Face Inference Endpoints, vLLM (aunque es más adecuado para generación), o mediante un simple script con PyTorch. También es compatible con la biblioteca `transformers` de Python.
- Latencia estimada: para una sola oración de hasta 200 tokens, la inferencia en GPU toma aproximadamente 10-20 ms; en CPU, entre 100-300 ms. El throughput en un lote de 32 oraciones en una GPU moderna puede superar las 500 oraciones por segundo.

## Comparativa con modelos similares

No se han identificado modelos comparables disponibles públicamente con la misma tarea específica (clasificación de 56 temas políticos multilingüe). El propio proyecto ofrece una variante de contexto (`manifestoberta-xlm-roberta-56policy-topics-context-2025-1-1`) que procesa párrafos completos y reporta mejores métricas (Accuracy 0.63 vs 0.56). Sin embargo, esta comparación es interna y no con modelos externos. En el ámbito de clasificación de textos políticos, existen modelos como `polbert` (para inglés) o `mBERT` fine-tuneado para tareas similares, pero no se dispone de datos de comparación directa en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo fue entrenado exclusivamente con declaraciones de partidos políticos del Manifesto Corpus, lo que puede limitar su generalización a otros tipos de texto (por ejemplo, discursos informales o artículos de opinión) y a contextos no electorales.
- Longitud de contexto limitada: aunque el modelo base soporta 512 tokens, el fine-tuning se realizó con un máximo de 200 tokens. Textos más largos deben ser segmentados, lo que puede perder coherencia contextual.
- Rendimiento desigual entre idiomas: el modelo funciona mejor en los 40 idiomas del corpus, pero para idiomas fuera de esa lista la precisión puede degradarse significativamente.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas con alta confianza si el texto es ambiguo o fuera de distribución.
- Licencia BigScience OpenRAIL-M: permite uso comercial, pero impone restricciones de responsabilidad (no usar para actividades ilegales o dañinas) y requiere redistribución bajo los mismos términos. Es recomendable revisar los términos completos antes de un despliegue en producción.
- No hay cuantizaciones oficiales: los únicos pesos disponibles están en safetensors en FP32, lo que puede ser un inconveniente para entornos con restricciones de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/manifesto-project/manifestoberta-xlm-roberta-56policy-topics-sentence-2025-1-1
- DOI de la cita: https://doi.org/10.25522/manifesto.manifestoberta.56topics.sentence.2025.1.1
- Manifesto Project (corpus y documentación): https://manifesto-project.wzb.eu
- Esquema de codificación Handbook 4: https://manifesto-project.wzb.eu/coding_schemes/mp_v4
- Modelo de contexto (variante): https://huggingface.co/manifesto-project/manifestoberta-xlm-roberta-56policy-topics-context-2025-1-1

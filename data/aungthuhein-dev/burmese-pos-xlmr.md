# aungthuhein-dev/burmese-pos-xlmr

## Resumen

El modelo `aungthuhein-dev/burmese-pos-xlmr` es un etiquetador de categorías gramaticales (part-of-speech, POS) para el idioma birmano (myanmar), desarrollado por el autor aungthuhein-dev. Se trata de un ajuste fino (fine-tuning) del modelo multilingüe XLM-RoBERTa base sobre el corpus myPOS, complementado con pseudoetiquetas de alta confianza extraídas de textos de libros sin anotar. El objetivo es proporcionar una herramienta fiable para el análisis morfosintáctico de birmano, una lengua de bajos recursos donde los sistemas comerciales suelen fallar debido a la complejidad de su escritura, que no usa espacios entre palabras.

La arquitectura es un transformer encoder (XLM-RoBERTa base) adaptado para clasificación de tokens, con un total de 277.464.591 parámetros. El modelo etiqueta cada palabra (previamente segmentada) con una de las 15 categorías del tagset myPOS, como sustantivo, verbo, partícula o marcador posposicional. Aunque el contexto de XLM-RoBERTa es de 512 tokens, el ejemplo de uso trunca a 128, por lo que la longitud de contexto efectiva en la práctica es menor. La relevancia actual radica en que el birmano carece de herramientas de procesamiento de lenguaje natural robustas, y este modelo ofrece un punto de partida gratuito y de código abierto para tareas lingüísticas y aplicaciones downstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder) para clasificación de tokens |
| Parametros totales | 277.464.591 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (valor estándar de XLM-RoBERTa; el código de ejemplo trunca a 128) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión completa) |
| Idiomas soportados | Birmano (myanmar) |
| Licencia | No disponible (se deben consultar los términos del corpus myPOS) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa base, un transformer encoder preentrenado en 100 lenguas con una arquitectura de atención estándar. Para la tarea de POS tagging, se añade una cabeza de clasificación sobre cada token y se ajusta el modelo completo. El entrenamiento se realizó en dos fases: primero se hizo un fine-tuning sobre las 43.196 oraciones doradas de myPOS, obteniendo un modelo base. Posteriormente, se generaron pseudoetiquetas sobre oraciones de libros sin anotar, conservando únicamente aquellas donde todas las palabras tenían una probabilidad softmax superior o igual a 0,95, resultando en 205.721 oraciones adicionales. Finalmente se realizó un segundo fine-tuning combinando el corpus dorado y las pseudoetiquetas.

No se emplearon técnicas como RLHF o DPO, y la única innovación destacable es el uso de pseudoetiquetas de alta confianza para ampliar el vocabulario y el dominio de los textos de libro. Según el autor, esta estrategia no mejora el rendimiento en el dominio original de myPOS (el baseline ya estaba saturado), pero sí busca mejorar la cobertura en textos de estilo literario.

## Capacidades

- Etiquetado de categorías gramaticales para birmano con 15 etiquetas del tagset myPOS (sustantivo, verbo, adjetivo, partícula, marcador postposicional, etc.).
- Procesamiento de texto Unicode (no compatible con Zawgyi, salvo conversión previa).
- Inferencia sobre palabras segmentadas previamente con la biblioteca `burmesenlp`.
- El modelo es un clasificador de tokens, no genera texto ni soporta razonamiento o tool calling.
- No es multilingüe en la práctica: aunque XLM-RoBERTa es multilingüe, el fine-tuning es específico para birmano y no se recomienda su uso en otros idiomas.
- No ofrece modos de "thinking" ni capacidades de visión o audio.

## Casos de uso

- **Análisis lingüístico de corpus birmanos**: investigadores pueden etiquetar automáticamente grandes colecciones de texto (libros, artículos) para estudiar patrones morfosintácticos, frecuencias de categorías y evolución del idioma. El modelo es adecuado porque ofrece alta precisión en texto formal y una segmentación integrada con `burmeseslint`.
- **Preprocesamiento para sistemas de extracción de información**: el POS tagging es un paso previo para tareas como reconocimiento de entidades nombradas (NER) o análisis de dependencias. Permite enriquecer los datos de entrada con información gramatical útil para modelos posteriores.
- **Construcción de recursos lingüísticos**: se puede usar para crear diccionarios de frecuencia por categoría, glosarios o corpus anotados que sirvan como referencia para la comunidad investigadora de la lengua birmana.
- **Aplicaciones de corrección gramatical**: aunque el modelo no es generativo, las secuencias de etiquetas pueden alimentar reglas heurísticas para detectar errores de concordancia o uso incorrecto de partículas en textos escritos.
- **Indexación y búsqueda semántica**: al etiquetar las palabras de un documento, se puede mejorar la indexación en motores de búsqueda al distinguir entre usos verbales y nominales de la misma forma, facilitando la recuperación de información precisa.
- **Soporte a sistemas de traducción automática**: en un pipeline de traducción, el etiquetado POS puede ayudar a desambiguar funciones sintácticas y a elegir la forma adecuada en la lengua de destino, especialmente en pares con lenguas tipológicamente distintas.

## Benchmarks y rendimiento

El autor reporta resultados sobre un 10% de holdout de myPOS (4.320 oraciones, 52.247 tokens) usando el primer subword de cada palabra como portador de la etiqueta. Se omitieron 29 oraciones por problemas de longitud o alineación a 128 subwords.

| Modelo | Token acc. | Micro-F1 | Macro-F1 |
| --- | --- | --- | --- |
| XLM-R baseline (solo myPOS) | 97,25 | 97,25 | 94,92 |
| XLM-R + 205.721 pseudoetiquetas (este modelo) | 97,24 | 97,24 | 94,99 |

La diferencia entre ambos es marginal y el autor señala que la pseudoetiquetado no mejora el F1 en el dominio de myPOS, sino que apunta a mejorar la cobertura de vocabulario de estilo libro. No hay datos de benchmarks externos ni comparaciones con otros modelos de POS tagging birmano.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 1,1 GB en precisión completa (fp32). En fp16 o int8 podría reducirse a ~0,5 GB y ~0,3 GB respectivamente, aunque no se ofrecen versiones cuantizadas.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM puede ejecutar inferencia en fp32 (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060). Para uso en producción con mayor throughput, se recomienda una GPU de 8 GB o más (RTX 3060, RTX 3080, A100).
- En CPU es viable para inferencia en lotes pequeños, pero la latencia será mayor (no se han publicado mediciones).
- Despliegue: se puede usar con `transformers` y `torch` directamente, o exportar a ONNX para optimización. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que suelen orientarse a modelos generativos.
- Latencia y throughput: no hay datos disponibles; en una GPU moderna (RTX 3090) se espera procesar cientos de oraciones por segundo, pero no es un dato confirmado.

## Comparativa con modelos similares

Existe otro modelo en HuggingFace con nombre casi idéntico: `kalixlouiis/burmese-pos-xlmr-base`, también basado en XLM-RoBERTa para POS tagging birmano. No se dispone de información técnica detallada sobre ese modelo (parámetros, entrenamiento, métricas), por lo que no es posible realizar una comparación numérica. Otros modelos para birmano, como `Burmese-GPT` (basado en mGPT), son generativos y no cubren la tarea de POS tagging. En la literatura, se suele comparar con sistemas comerciales o con modelos entrenados desde cero, pero no se dispone de esos datos en la información recopilada.

## Limitaciones y advertencias

- El rendimiento en el dominio de myPOS es equivalente al baseline sin pseudoetiquetas; la ganancia se espera en textos de estilo libro, pero no está verificada con un benchmark público.
- El modelo está entrenado principalmente con texto de libros y corpus anotado; no es adecuado para lenguaje social, chat o texto code-mixed (mezcla de idiomas), donde el rendimiento será notablemente inferior.
- La inferencia depende de la segmentación de palabras de `burmesesnlp`; si se usa otro segmentador, los resultados pueden degradarse. Además, el entrenamiento con pseudoetiquetas se realizó con un segmentador distinto, lo que podría introducir incoherencias.
- Las etiquetas raras (`abb`, `int`, `sb`) tienen un soporte muy reducido en el holdout, por lo que su precisión puede ser baja.
- La licencia no está definida; se debe revisar los términos del corpus myPOS antes de redistribuir el modelo o sus derivados.
- El modelo solo etiqueta tokens previamente segmentados; no es un segmentador de palabras, por lo que el usuario debe gestionar esa etapa.
- No es un modelo generativo: no puede completar texto ni realizar tareas de razonamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/aungthuhein-dev/burmese-pos-xlmr)
- [Repositorio myPOS (Ye Kyaw Thu et al.)](https://github.com/ye-kyaw-thu/myPOS)
- [Modelo similar: kalixlouiis/burmese-pos-xlmr-base](https://huggingface.co/kalixlouiis/burmese-pos-xlmr-base)
- [Colección de datasets de lengua birmana en GitHub](https://github.com/chuuhtetnaing/myanmar-language-dataset-collection)
- [Iniciativa AI for Myanmar (organización de interés público)](https://www.aiformyanmar.org/)

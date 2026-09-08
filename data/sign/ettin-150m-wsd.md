# sign/Ettin-150m-WSD

## Resumen

Ettin-150m-WSD es un modelo de desambiguación de sentidos de palabras (WSD) desarrollado por el autor «sign». Se basa en el encoder `jhu-clsp/ettin-encoder-150m`, que a su vez sigue la arquitectura ModernBERT de 22 capas y 768 unidades ocultas. El modelo resuelve la ambigüedad léxica planteando la tarea como una elección múltiple sobre definiciones de WordNet (omw-en:1.4): dado un texto con la palabra objetivo marcada, el modelo debe seleccionar el sentido correcto entre varias definiciones, usando una ranura `[MASK]` donde se inserta la respuesta.

Con 149,7 millones de parámetros, el modelo está optimizado para ser ligero y rápido. Se entrenó mediante destilación blanda desde un profesor mayor (`ModernBERT-Large-Instruct-WSD`, 395M), combinando la pérdida de entropía cruzada etiquetada con una divergencia KL. Su relevancia radica en ofrecer un sistema de WSD eficiente y de alta precisión, con un rendimiento cercano al del modelo profesor y un throughput sustancialmente mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder Transformer) |
| Parametros totales | 149.703.296 |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos en bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `jhu-clsp/ettin-encoder-150m`, que usa la arquitectura ModernBERT con 22 capas y dimensión oculta 768. Para la tarea de WSD, se añade un decodificador de 128 letras de respuesta (`WSDModernBertForMaskedLM`), lo que permite elegir la definición correcta a partir de un conjunto de opciones etiquetadas con letras.

El entrenamiento se realizó el 7 de septiembre de 2026 en una segunda iteración («y2»). Los datos de entrenamiento incluyen oraciones generadas para 97 000 synsets, frases de ejemplo de WordNet (con una reserva de 5000 ejemplos para evaluación), Semantic Concordance (SemCor), con 222 000 instancias detokenizadas, y el Princeton WordNet Gloss Corpus con etiquetas manuales. Se aplicó destilación blanda desde el profesor `ModernBERT-Large-Instruct-WSD`, con una función de pérdida compuesta: `0.5 · entropía cruzada` (con label smoothing 0.1) más `0.5 · T² · KL(profesor ‖ estudiante)` a temperatura T=2. El entrenamiento usó programación coseno, weight decay 0.01, tasa de aprendizaje 5e-5 y 3 épocas, con batch de 64. Los pesos se mantuvieron en fp32 durante el cálculo, con autocast en bf16, y se guardaron en bf16.

## Capacidades

- Desambiguación de sentidos de palabras en inglés mediante selección múltiple sobre definiciones de WordNet omw-en:1.4.
- Integra una ranura de respuesta enmascarada: el prompt incluye la frase con la palabra objetivo marcada, una definición por letra de opción, una letra para «ninguna de las anteriores» y una secuencia `[unused0] [MASK]`.
- Soporta el modo de inferencia mediante `WSDModernBertForMaskedLM`, que añade un decodificador de 128 posibles letras de respuesta.
- Es un modelo encoder, por lo que no genera texto libre; su salida es la letra correspondiente a la definición elegida.
- No dispone de soporte documentado para tool calling, uso como agente, visión ni audio.

## Casos de uso

- Anotación automática de corpus lingüísticos: el modelo puede etiquetar cada ocurrencia de una palabra ambigua con su synset de WordNet. Esto resulta útil para construir datasets de entrenamiento de modelos de lenguaje o para análisis lexicográfico a gran escala.
- Mejora de sistemas de búsqueda semántica: al desambiguar las consultas y los documentos, se puede filtrar por sentidos específicos y aumentar la precisión en recuperación de información sobre léxico especializado.
- Extracción de relaciones en textos técnicos o científicos: los términos polisémicos son frecuentes en dominios como la medicina o la ingeniería. Desambiguar antes de extraer relaciones reduce el ruido en los resultados.
- Asistencia en traducción automática: en un pipeline de traducción inglés-otro idioma, el modelo puede identificar el sentido correcto de una palabra para seleccionar la traducción más adecuada cuando existen múltiples equivalentes.
- Enriquecimiento de ontologías y knowledge graphs: el modelo permite asociar automáticamente menciones en texto a conceptos de WordNet, facilitando la expansión de vocabularios y bases de conocimiento.
- Comprensión lectora educativa: en plataformas de aprendizaje de idiomas, puede ayudar a explicar el sentido contextual de una palabra dentro de un ejercicio o lectura, mostrando la definición correcta entre varias opciones.
- Evaluación de modelos de lenguaje: al tratarse de una tarea de WSD con benchmark publicados, sirve como referencia comparativa para medir la capacidad de comprensión léxica de otros modelos.

## Benchmarks y rendimiento

Los resultados presentados fueron reportados por el autor en la model card, comparando este modelo con su profesor (`ModernBERT-Large-Instruct-WSD`). La diferencia en SemEval ALL es de 0,5 puntos porcentuales, mientras que el throughput en H100 es notablemente superior.

| Benchmark | ModernBERT-Large-Instruct-WSD (395M) | Ettin-150m-WSD (150M) |
|---|---:|---:|
| WordNet held-out slice (5 000 ejemplos, seed 42) | 78,3 % | 75,9 % |
| SemEval «ALL» (7 247 instancias, any gold key) | 80,6 % | 80,1 % |
| Pipeline end-to-end (spaCy trf, gold-position scoring) | 75,2 % | 74,7 % |
| Throughput batch en una H100 | 175-250 oraciones/s | 380-420 oraciones/s |

El autor indica que la variación por ruido de semilla es aproximadamente ±0,4 en SemEval ALL, por lo que las diferencias entre ambos modelos pueden estar cerca del margen de error.

## Requisitos de hardware

- VRAM estimada: no hay mediciones oficiales. A partir del número de parámetros (150M) y los pesos en bf16, los pesos ocupan unos 300 MB. Sumando activaciones para secuencias cortas, es viable con 2-4 GB de VRAM en GPUs consumer.
- GPU recomendada: cualquier GPU compatible con CUDA con al menos 4 GB, o Apple Silicon. El modelo es ligero y no requiere H100 para uso normal; la H100 se menciona solo para comparar throughput.
- Caben en GPUs consumer como RTX 3060, RTX 4090, o incluso algunos modelos de gama baja con suficiente memoria.
- Opciones de despliegue: al ser un encoder ModernBERT en formato safetensors, se puede cargar directamente con la biblioteca `transformers` de Hugging Face. No se han documentado integraciones específicas con vLLM, llama.cpp o TGI, ya que no es un modelo generativo.
- Latencia y throughput: según el model card, en una H100 con pipeline batch se alcanzan 380-420 oraciones/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SemEval ALL | Licencia | Arquitectura |
|---|---|---|---|---|---|
| Ettin-150m-WSD (este) | 150M | no disponible | 80,1 % | Apache 2.0 | ModernBERT encoder |
| ModernBERT-Large-Instruct-WSD | 395M | no disponible | 80,6 % | no disponible | ModernBERT encoder |
| jhu-clsp/ettin-encoder-150m | 150M | no disponible | no disponible | no disponible | ModernBERT encoder |

El modelo se sitúa ligeramente por debajo de su profesor en precisión, pero ofrece una relación rendimiento/tamaño más favorable. No se dispone de información sobre otras alternativas equivalentes en la tarea de WSD.

## Limitaciones y advertencias

- Es un modelo monolingüe pensado únicamente para inglés; no soporta otros idiomas.
- Su salida es una letra de opción sobre definiciones de WordNet, por lo que no sirve para generación de texto libre ni para conversaciones.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso.
- La cobertura léxica y la precisión dependen del recurso WordNet omw-en:1.4; sentidos no contemplados en este recurso no pueden ser desambiguados.
- Los datos de entrenamiento provienen de corpus anotados como SemCor y el Gloss Corpus, que pueden contener sesgos hacia textos literarios o didácticos; esto podría afectar al rendimiento en dominios muy específicos.
- No se han publicado evaluaciones de sesgos ni análisis de alucinación para este modelo.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de licencia y copyright.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sign/Ettin-150m-WSD
- Repositorio de referencia: https://github.com/sign/word-sense-disambiguation
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m

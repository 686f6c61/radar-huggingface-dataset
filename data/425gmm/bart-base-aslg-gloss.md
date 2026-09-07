# 425GMM/bart-base-aslg-gloss

## Resumen

`425GMM/bart-base-aslg-gloss` es un modelo de traducción automática de inglés a glosas de lengua de signos americana (ASL), desarrollado por el usuario 425GMM. Se trata de un fine-tuning del modelo `facebook/bart-base` sobre el corpus paralelo ASLG-PC12, que contiene pares de oraciones en inglés y sus correspondientes glosas ASL generadas por reglas a partir de texto del parlamento europeo. El objetivo es convertir frases en inglés en secuencias de glosas en mayúsculas, siguiendo las convenciones del corpus, como pronombres con el prefijo `X-` y modificadores con `DESC-`.

El modelo está pensado como uno de los sistemas de un proyecto que compara la decodificación con restricciones gramaticales (mediante `xgrammar`) frente a la decodificación libre para la generación de glosas. Arquitectónicamente es un transformer encoder-decoder (seq2seq) con 139.470.681 parámetros. El contexto no se especifica en la información disponible, aunque el entrenamiento se realizó con una longitud máxima de 128 tokens. Es un modelo pequeño, con pesos en fp16, y está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), basada en BART-base |
| Parametros totales | 139.470.681 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento se limitó a 128 tokens) |
| Tipos de cuantizacion | No disponible (los pesos se almacenan en fp16) |
| Idiomas soportados | Inglés (entrada) y glosas ASL (salida); etiqueta del modelo: `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BART, que combina un encoder bidireccional (similar a BERT) con un decoder autoregresivo (similar a GPT). BART se preentrena corrompiendo el texto con una función de noising arbitraria y aprendiendo a reconstruir el texto original. En este caso, `facebook/bart-base` se ha fine-tuneado sobre la partición de entrenamiento del corpus ASLG-PC12, redistribuido desde Kaggle y re-partido por el autor del proyecto en 80/10/10 con semilla 42.

El entrenamiento se llevó a cabo durante 3 épocas, con un tamaño de lote efectivo de 32, una tasa de aprendizaje de 3e-5 y una longitud máxima de 128 tokens tanto para la fuente como para el objetivo. Se ejecutaron 6.084 pasos. Los pesos se guardaron en formato fp16. No se aplicaron técnicas de RLHF ni DPO. El modelo se evaluó dentro de un proyecto que compara decodificación con restricciones gramaticales (gramática v3, implementada con `xgrammar`) frente a decodificación libre, incluyendo una regla de copia opcional.

## Capacidades

- Traducción de oraciones en inglés a secuencias de glosas ASL en mayúsculas, siguiendo las convenciones del corpus ASLG-PC12 (pronombres con `X-`, modificadores con `DESC-`).
- Generación de texto en formato seq2seq, apto para uso con la biblioteca `transformers` mediante `AutoModelForSeq2SeqLM`.
- Soporte de decodificación con restricciones gramaticales: con la gramática v3, la validez de la secuencia (proporción de salidas cuyos tokens pertenecen al vocabulario cerrado de glosas) alcanza el 100 %.
- No soporta tool calling, ni visión, ni audio, ni razonamiento multi-step.
- Capacidades multilingües limitadas: solo inglés como entrada y glosas ASL como salida.

## Casos de uso

- Investigación en traducción automática de lengua de signos: el modelo sirve como sistema de referencia para comparar el efecto de la decodificación con restricciones gramaticales sobre la validez y la calidad de las secuencias de glosas. Se puede integrar en scripts de evaluación que calculan BLEU, chrF y exact match.
- Prototipos de transcripción de discursos parlamentarios: dado que ASLG-PC12 deriva de Europarl, el modelo es adecuado para convertir frases en inglés de estilo parlamentario a glosas ASL en entornos controlados y de dominio acotado.
- Generación de glosas para subtítulos en vídeos educativos: se puede utilizar para producir subtítulos en glosas ASL a partir de texto en inglés, siempre que el contenido se ajuste al estilo del corpus y se respete el formato de entrada (minúsculas y espacios antes de puntuación).
- Desarrollo y validación de gramáticas formales para glosas: el proyecto del autor incluye gramáticas y scripts de evaluación; este modelo actúa como base para probar reglas de validez de secuencias y comparar decodificación libre frente a restringida.
- Evaluación de métricas de traducción automática en el dominio de lengua de signos: permite calcular BLEU, chrF y exact match sobre un conjunto de prueba de 1.000 oraciones, como se documenta en el proyecto.
- Modelo baseline en pipelines de NLP para preprocesado de datos de lengua de signos: por su pequeño tamaño, se puede ejecutar en CPU y sirve para generar rápidamente glosas candidatas en experimentos de enriquecimiento de datasets.
- Experimentos de transferencia de aprendizaje: al estar basado en BART-base y tener un número reducido de parámetros, es útil para estudiar la adaptación de modelos de lenguaje generales a tareas de traducción de glosas con datos limitados.

## Benchmarks y rendimiento

La información disponible incluye resultados sobre una muestra de prueba de 1.000 oraciones, con decodificación greedy. Se presentan comparando decodificación libre, decodificación restringida con gramática v3 y decodificación restringida con regla de copia.

| Decodificación | BLEU | chrF | Exact match | Validez de secuencia |
|---|---|---|---|---|
| Sin restricciones | 76,7 | 93,3 | 44,5 % | 48,6 % |
| Restringida (gramática v3) | 73,2 | 85,9 | 42,8 % | 100 % |
| Restringida + regla de copia (v3) | 74,1 | 86,3 | 44,5 % | 100 % |

La validez de secuencia se define como la proporción de salidas cuyo cada token pertenece al vocabulario cerrado de glosas. No se han publicado otros benchmarks comparativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 139 millones de parámetros en fp16, el peso del modelo ocupa aproximadamente 278 MB. Considerando las activaciones y el overhead de PyTorch, se estima que la inferencia con secuencias de hasta 128 tokens cabe en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, por ejemplo una RTX 2060, GTX 1660 o superior. También se puede ejecutar en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en tarjetas gráficas de gama baja e incluso en portátiles.
- Opciones de despliegue: biblioteca `transformers` (PyTorch), Hugging Face Inference Endpoints, o exportación a ONNX para inferencia optimizada. No es adecuado para `llama.cpp` por tratarse de un modelo encoder-decoder.
- Latencia y throughput: no disponible. No se han publicado cifras de rendimiento en la información proporcionada.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. El único punto de referencia directo es el modelo base `facebook/bart-base`, del cual se parte.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 425GMM/bart-base-aslg-gloss | 139.470.681 | No disponible (entrenado con 128 tokens) | Traducción inglés a glosas ASL | Apache 2.0 | Hugging Face |
| facebook/bart-base | 139.470.681 | 1024 tokens (según documentación de BART) | Modelo de lenguaje general, no fine-tuneado | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Las glosas de ASLG-PC12 se generan por reglas a partir de texto de Europarl, no por signantes reales. El modelo aprende esas reglas y no es un traductor general de inglés a ASL.
- Los resultados de rendimiento no se transfieren a corpus de glosas anotados por humanos, como se indica en el README del autor.
- El modelo requiere entradas en minúsculas y con espacios antes de la puntuación; cualquier otro formato puede degradar significativamente la calidad de la traducción.
- Existe riesgo de alucinación en entradas fuera del dominio parlamentario europeo, ya que el vocabulario y el estilo del corpus son limitados.
- Los sesgos del corpus de entrenamiento se reflejan en el modelo: el texto proviene de discursos parlamentarios, por lo que no cubre otros registros ni variedades del inglés.
- La licencia Apache 2.0 permite el uso comercial, pero la procedencia del dataset de entrenamiento (redistribución de Kaggle) no está documentada en cuanto a posibles restricciones de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/425GMM/bart-base-aslg-gloss
- Proyecto en GitHub (código, gramáticas y scripts de evaluación): https://github.com/TheRealGioviok/asl-gloss-nlp
- Dataset en Kaggle: https://www.kaggle.com/datasets/thedevastator/unlock-the-power-of-english-asl-with-aslg-pc12-c
- Modelo base en Hugging Face: https://huggingface.co/facebook/bart-base
- Dataset ASLG-PC12 en Hugging Face: https://huggingface.co/datasets/achrafothman/aslg_pc12

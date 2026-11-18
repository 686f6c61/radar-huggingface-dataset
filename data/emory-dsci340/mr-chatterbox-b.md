# emory-dsci340/mr-chatterbox-b

## Resumen

Mr. Chatterbox (grupo B) es un modelo de lenguaje de tipo transformer entrenado desde cero con la herramienta nanochat de Andrej Karpathy, desarrollado por estudiantes del curso DSCI 340 como replicación didáctica del artículo *Mr. Chatterbox, or, The Modern Prometheus* de la newsletter Estragon. El modelo parte de un corpus de libros de la British Library publicados entre 1837 y 1898 y se ha afinado para mantener conversaciones con voz victoriana, lo que lo convierte en un experimento educativo sobre entrenamiento de LLM desde cero y no en un producto listo para producción.

Con 352.321.610 parámetros, 24 capas, anchura de 1.024 y una ventana de contexto de 2.048 tokens, emplea atención completa en todas las capas, posiciones rotatorias y embeddings de entrada y salida atados. Su tokenizador es un BPE a nivel de byte con vocabulario de 49.152 tokens, entrenado sobre el mismo corpus.

Su relevancia ahora es fundamentalmente pedagógica: documenta de forma transparente todo el pipeline (pretraining, generación de datos sintéticos con GPT-4o mini y GPT-4.1 mini, fine-tuning conversacional y evaluación) y sirve como referencia reproducible para cursos de ciencia de datos e investigación sobre modelos pequeños entrenados desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat GPT: transformer decoder-only, 24 capas, anchura 1.024, 16 cabezas (dimensión 64), atención completa en todas las capas (patrón "L"), posiciones rotatorias, embeddings de entrada y salida atados |
| Parametros totales | 352.321.610 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32; entrenamiento en bf16) |
| Idiomas soportados | Inglés (inglés impreso entre 1837 y 1898, con errores de OCR) |
| Licencia | MIT |
| Formato de pesos | Checkpoints nativos de nanochat (`.pt` + `.json` de metadatos); no compatibles con `transformers` |
| Vocabulario | 49.152 tokens (BPE a nivel de byte), 9 tokens especiales en IDs 0–8 |
| Precisión | Entrenado en bf16 en una NVIDIA L40S; inferencia en fp32 sobre CPU en el Space |
| Conocimiento | Nada posterior a 1898 por diseño |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con 24 capas, anchura de 1.024 y 16 cabezas de atención de dimensión 64. Usa atención completa en todas las capas (patrón "L"), posiciones rotatorias y ata los embeddings de entrada con la cabeza de salida. El tokenizador es un BPE a nivel de byte con 49.152 tokens entrenado sobre el corpus, con nueve tokens especiales en los IDs 0–8 (siendo `<|bos|>` el 0). Los checkpoints requieren nanochat en el commit `92d63d4` con el parche del curso; la versión sin parchear rechaza cargarlos.

El pretraining se hizo sobre el dataset British Library Books, filtrado a año de publicación 1837–1901, primer idioma inglés y confianza media de OCR por página de al menos 0,65 (descartando páginas por debajo de 0,50). El resultado fueron 17.222 libros (17.086 de entrenamiento, 136 de validación), 9,17 mil millones de caracteres y 2,08 mil millones de tokens de entrenamiento. El modelo base se entrenó durante 6.496 pasos de 524.288 tokens (unos 3,41 mil millones de tokens, 1,64 pasadas sobre el corpus) en 19,0 horas sobre una L40S, alcanzando una pérdida de validación final de 0,919 bits por byte. Los libros se trocearon en pasajes de 1.000 a 8.000 caracteres para evitar que el cargador de nanochat conservara solo el inicio de documentos largos.

El fine-tuning conversacional combinó cinco fuentes: 10.044 pares de diálogo reescritos a partir de turnos adyacentes de 3.550 libros (16.125 pares tras filtrado y revisión manual, con el primer turno reescrito a inglés moderno mediante GPT-4o mini); 4.671 conversaciones de corpus extendidas con 2–3 intercambios generados por GPT-4.1 mini; 4.598 conversaciones totalmente sintéticas a partir de tema, persona y estilo de apertura; 4.203 conversaciones fundamentadas en un pasaje de 200–400 palabras; y 1.739 conversaciones conductuales (saludos, despedidas, preguntas de identidad, abuso, galimatías y hechos modernos). Se incluyeron además catecismos del siglo XIX. El checkpoint desplegado es el 10B-2; el 11A, tras un pequeño ajuste de instrucciones, obtuvo peores resultados y se conserva solo como registro.

## Capacidades

- Generación de texto conversacional en inglés con registro victoriano, entrenada específicamente para mantener diálogos multi-turno.
- Respuesta a saludos, despedidas y preguntas de identidad dentro del personaje.
- Generación fundamentada en pasajes: puede producir respuestas a partir de un fragmento de 200–400 palabras del corpus.
- Manejo de entradas degradadas o sin sentido (galimatías, abuso) dentro de los patrones vistos en el entrenamiento.
- Conocimiento enciclopédico limitado al periodo 1837–1898, incluyendo referencias culturales y literarias de la época.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe prácticamente nula: solo inglés.
- No sigue instrucciones de forma fiable, según advierte la propia model card.

## Casos de uso

- Docencia sobre entrenamiento de LLM desde cero: el repositorio incluye tokenizador, checkpoints, manifiesto y sumas SHA256, lo que permite reproducir el pipeline completo en un curso universitario y comparar decisiones de diseño (filtrado de OCR, troceado, mezcla de datos sintéticos).
- Investigación sobre generación de datos sintéticos: las cinco fuentes de fine-tuning (reescritura con GPT-4o mini, expansión con GPT-4.1 mini, conversaciones sintéticas, fundamentadas y conductuales) sirven como estudio de caso de cómo distintas estrategias afectan al comportamiento conversacional.
- Recreación histórica y divulgación: un chatbot con voz y conocimiento de 1837–1898 puede usarse en museos, exposiciones o materiales educativos para ilustrar cómo se expresaba la lengua inglesa impresa en la época victoriana.
- Experimentación con modelos pequeños en hardware modesto: con 352 millones de parámetros en fp32 (1,4 GB por checkpoint) cabe en CPU y en GPUs de consumo, lo que facilita pruebas de inferencia sin infraestructura dedicada.
- Estudio de sesgos históricos: al reflejar las opiniones de su periodo de entrenamiento, permite analizar cómo los sesgos de época se filtran en las respuestas de un modelo y diseñar mitigaciones en entornos controlados.
- Evaluación de robustez ante entradas adversas: las conversaciones conductuales de entrenamiento (abuso, galimatías) permiten probar la estabilidad del modelo frente a entradas fuera de distribución.
- Reproducción de experimentos de la newsletter Estragon: sirve como réplica independiente del artículo original, con un corpus más pequeño (17.222 frente a 28.035 libros) y solo en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación del modelo base (0,919 bits por byte) y señala que el checkpoint 11A, tras un pequeño ajuste de instrucciones, obtuvo peores resultados que el 10B-2 desplegado, sin detallar métricas adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB por checkpoint en fp32 (1.409.347.167 bytes de pesos), más overhead del motor de nanochat.
- Entrenamiento: una única NVIDIA L40S en bf16 durante 19,0 horas para el modelo base.
- GPU recomendadas: L40S (usada en el entrenamiento); cualquier GPU con al menos 2–3 GB de VRAM libre puede alojar el modelo en fp32. No se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, dado el tamaño de 352 millones de parámetros y los 1,4 GB de pesos en fp32.
- Opciones de despliegue: exclusivamente mediante el cargador de nanochat (commit `92d63d4` con el parche del curso); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que los checkpoints no son modelos `transformers`.
- Latencia y throughput: no disponibles. El Space de demostración ejecuta el modelo en CPU en fp32 con temperatura 0,8, top-k 50 y un máximo de 256 tokens nuevos por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mr. Chatterbox (grupo B) | 352.321.610 | 2.048 | Inglés | MIT | Checkpoints nanochat (`.pt`) | Entrenado desde cero sobre British Library Books 1837–1898 |
| Modelo original de Estragon (referencia) | no disponible | no disponible | no disponible | no disponible | no disponible | Corpus de 28.035 libros y 2,93 mil millones de tokens; pérdida de validación de 0,973 bits por byte en otro corpus y tokenizador |
| nanochat (base de Karpathy) | no disponible | no disponible | no disponible | no disponible | no disponible | Framework de entrenamiento desde cero sobre el que se construye este modelo |

La comparación directa con el modelo original de la newsletter no es posible porque los datos de pérdida se midieron sobre corpus y tokenizadores distintos, según advierte la propia model card.

## Limitaciones y advertencias

- El modelo se equivoca con frecuencia e inventa hechos; no debe usarse como fuente de información factual.
- Mayoritariamente no sigue instrucciones, incluso con prompts bien formateados.
- Puede reproducir opiniones y lenguaje de su periodo (1837–1898) que hoy resultan ofensivos.
- Su conocimiento está limitado por diseño a lo publicado antes de 1898; carece de información moderna.
- Solo entiende inglés y está entrenado sobre texto con errores de OCR, cabeceras de página y números de página, lo que puede degradar la calidad de las respuestas.
- La licencia MIT permite uso comercial, pero la naturaleza del modelo (alucinaciones, sesgos históricos, falta de seguimiento de instrucciones) lo desaconseja para producción sin salvaguardas adicionales.
- No es compatible con `transformers` ni con los motores de inferencia habituales; requiere el cargador parcheado de nanochat, lo que limita su integración en pipelines estándar.
- El contexto de 2.048 tokens restringe las conversaciones largas y el razonamiento multi-turno extenso.
- Es un proyecto docente, no un producto: no hay garantías de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emory-dsci340/mr-chatterbox-b
- Artículo original de referencia: https://www.estragon.news/mr-chatterbox-or-the-modern-prometheus/
- nanochat de Andrej Karpathy: https://github.com/karpathy/nanochat
- Dataset British Library Books: https://huggingface.co/datasets/TheBritishLibrary/blbooks
- Space de demostración: https://huggingface.co/spaces/emory-dsci340/mr-chatterbox-b

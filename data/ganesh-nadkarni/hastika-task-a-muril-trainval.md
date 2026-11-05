# Ganesh-Nadkarni/hastika-task-a-muril-trainval

## Resumen

Hastika-task-a-muril-trainval es un modelo de clasificación de texto obtenido por ajuste fino de `google/muril-base-cased` para la detección binaria de discurso de odio (Non-Hate / Hate) en comentarios de YouTube escritos en kanglish, la variedad code-mixed de kannada e inglés. Lo desarrolla Ganesh-Nadkarni como participación en la tarea A del shared task HASTIKA @ ICON-2026, centrado en el análisis de discurso de odio y la identificación de objetivos en texto code-mixed kannada-inglés.

El modelo parte de MuRIL, un encoder transformer de tipo BERT entrenado por Google sobre texto multilingüe con especial énfasis en lenguas indias y en pares transliterados, lo que lo hace adecuado para texto con mezcla de alfabetos y variedades dialectales. Con 237.557.762 parámetros y una ventana de entrada de 160 tokens durante el entrenamiento, es un clasificador compacto que puede ejecutarse en hardware modesto y desplegarse mediante la pipeline de `transformers` o Text Embeddings Inference.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido, la moderación de contenido en kannada code-mixed, y ofrece un punto de partida reproducible para investigación en detección de odio multilingüe. No obstante, el propio autor advierte que se entrenó con los ficheros de entrenamiento y validación fusionados, que el checkpoint no formó parte de un envío oficial y que la métrica reportada procede de una partición aleatoria interna, no de una validación limpia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MuRIL base, `google/muril-base-cased`) |
| Parametros totales | 237.557.762 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 160 tokens de longitud máxima de entrada durante el entrenamiento; límite nativo de MuRIL no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones INT8/INT4) |
| Idiomas soportados | Kannada (kn) e inglés (en), en registro code-mixed kannada-inglés (kanglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de MuRIL base: un transformer encoder bidireccional estilo BERT con atención completa, preentrenado por Google sobre texto multilingüe con objetivos de modelado de lenguaje enmascarado y predicción de frases traducidas, e incluyendo explícitamente pares de texto transliterado como señal de entrenamiento. Sobre esa base se añadió una cabeza de clasificación binaria para producir las etiquetas `0` (Non-Hate) y `1` (Hate).

El ajuste fino utilizó los ficheros de entrenamiento y validación del corpus HASTIKA fusionados, con una partición estratificada 88/12. Los hiperparámetros documentados son: longitud máxima de 160 tokens, tamaño de lote 16, precisión mixta, tasa de aprendizaje 2e-5 y parada temprana monitorizando macro-F1 sobre la partición de validación. El macro-F1 reportado sobre la porción retenida del 12 % es de 0,799. El autor indica explícitamente que, al haberse entrenado con entrenamiento y validación juntos, no existe una puntuación de validación limpia y que el checkpoint no participó en un envío oficial del shared task.

## Capacidades

- Clasificación binaria de texto: asigna a cada comentario la etiqueta Non-Hate o Hate.
- Procesamiento de texto code-mixed kannada-inglés, incluyendo transliteraciones al alfabeto latino (kanglish).
- Manejo de entradas cortas a medias (hasta 160 tokens), adecuado para comentarios de YouTube.
- Integración directa con la pipeline `text-classification` de `transformers`.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints de HuggingFace.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- No se documentan capacidades multilingües más allá de kannada e inglés.

## Casos de uso

- Moderación asistida de comentarios en YouTube: el modelo clasifica comentarios kanglish y permite priorizar la revisión humana de los marcados como Hate, reduciendo el volumen de cola de moderación.
- Investigación en detección de odio code-mixed: sirve como línea base reproducible para comparar arquitecturas, estrategias de transliteración y aumentación de datos en kannada-inglés.
- Filtrado previo en pipelines de análisis de redes sociales: al ser un encoder de 237 M de parámetros, puede procesar lotes grandes de comentarios con coste bajo antes de aplicar modelos más caros.
- Anotación asistida de corpus: genera etiquetas preliminares sobre nuevos comentarios que después revisan anotadores humanos, acelerando la construcción de datasets.
- Monitorización de comunidades: detección temprana de picos de discurso de odio en foros o canales concretos mediante agregación de predicciones por ventana temporal.
- Evaluación de sesgos y robustez: permite estudiar cómo se comporta un modelo MuRIL ajustado ante sarcasmo, lenguaje reclamado y variantes de transliteración en un dominio concreto.
- Prototipado de APIs de moderación: su licencia Apache 2.0 y su tamaño permiten desplegarlo en servicios internos de clasificación sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 | 0,799 | Partición retenida del 12 % de la fusión train+validation de HASTIKA |

No se han publicado resultados de benchmarks en la información disponible más allá del macro-F1 indicado, ni comparaciones con otros sistemas en el marco del shared task HASTIKA @ ICON-2026.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1 GB para los pesos (237 M de parámetros) más el overhead de activaciones y tokenizador; en FP16/BF16, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una T4, RTX 3060 o superior es suficiente. Para lotes grandes, A100 o H100 permiten mayor throughput, aunque el modelo no las requiere.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (declarado compatible), endpoints de HuggingFace, y servidores de inferencia basados en PyTorch. No se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera que sea apto para inferencia en tiempo real en GPU modesta, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hastika-task-a-muril-trainval | 237,6 M | 160 tokens (entrenamiento) | Clasificación binaria de odio en kanglish | Apache 2.0 | HuggingFace |
| google/muril-base-cased | 237,6 M (aprox.) | No disponible en la información proporcionada | Modelo base multilingüe (no clasificador) | Apache 2.0 | HuggingFace |
| MuRIL large | No disponible en la información proporcionada | No disponible | Modelo base multilingüe | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo se entrenó con los ficheros de entrenamiento y validación fusionados, por lo que la métrica de 0,799 corresponde a una partición aleatoria interna y no a una validación limpia; puede estar sobreestimada.
- El checkpoint no formó parte de un envío oficial del shared task HASTIKA @ ICON-2026.
- Entrenado sobre un dataset pequeño; se esperan errores en dialectos, sarcasmo, lenguaje reclamado y variantes de transliteración no vistas en entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con impacto directo en moderación.
- Sesgos potenciales derivados del corpus de comentarios de YouTube y de la sobrerrepresentación de ciertas variantes lingüísticas; no se documentan análisis de sesgo.
- El modelo está pensado para uso en investigación y como asistencia a moderadores humanos, no como sustituto de estos.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a los términos del dataset HASTIKA antes de cualquier otro uso; el dataset no se incluye en el repositorio.
- No se documentan limitaciones específicas de contexto más allá de la longitud máxima de 160 tokens usada en entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/Ganesh-Nadkarni/hastika-task-a-muril-trainval
- Modelo base: https://huggingface.co/google/muril-base-cased
- Paper de referencia: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. *Language Resources and Evaluation*, 59(3):2811-2856.

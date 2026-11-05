# Ganesh-Nadkarni/hastika-task-b-muril-oversampled-trainval

## Resumen

hastika-task-b-muril-oversampled-trainval es un modelo de clasificación de texto desarrollado por Ganesh-Nadkarni, resultado del ajuste fino de `google/muril-base-cased` para la identificación de la categoría objetivo de comentarios de odio en texto code-mixed kannada-inglés (kanglish). Concretamente, clasifica cada comentario en una de seis categorías: género, geopolítica, otros, política, religión o violencia. Fue construido para la tarea B del shared task HASTIKA @ ICON-2026, centrado en el análisis de discurso de odio en comentarios de YouTube.

El modelo parte de MuRIL, un transformer encoder multilingüe de Google preentrenado específicamente sobre textos indios, lo que lo hace especialmente adecuado para variedades code-mixed. Sobre esa base se aplicó un ajuste fino supervisado con un esquema de oversampling y ponderación de pérdidas amortiguada por raíz cuadrada para mitigar el desbalanceo entre clases.

Su relevancia es acotada pero clara: cubre un nicho poco atendido (detección de discurso de odio en kanglish) y proporciona un punto de partida reproducible para investigación en moderación de contenido multilingüe. No obstante, se trata de un checkpoint de investigación con un macro-F1 de 0,424 en su partición de validación, sin haber formado parte de un envío oficial al shared task.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MuRIL base, derivado de BERT) |
| Parámetros totales | no disponible (MuRIL base reporta aproximadamente 236 M en la documentación de Google) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 160 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | kannada (kn), inglés (en), texto code-mixed kannada-inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato estándar de transformers; no confirmado explícitamente en la model card) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `google/muril-base-cased`, un encoder basado en la arquitectura BERT entrenado por Google sobre grandes corpus de lenguas indias, con vocabulario y objetivos de preentrenamiento adaptados a transliteraciones y mezcla de idiomas. Sobre esta base se añadió una cabeza de clasificación de seis clases (Gender, Geo-political, Others, Political, Religion, Violence).

El entrenamiento utilizó los ficheros de entrenamiento y validación del dataset HASTIKA fusionados, con una división estratificada 88/12. Se empleó longitud máxima de 160 tokens, batch size de 16, precisión mixta, learning rate de 1e-5 y early stopping sobre macro-F1 de validación. Para el desbalanceo de clases se aplicó oversampling combinado con pesos de pérdida amortiguados por raíz cuadrada. El macro-F1 reportado sobre la partición reservada del 12% es de 0,424. No se documentan fases de RLHF ni DPO, algo esperable en una tarea de clasificación supervisada.

## Capacidades

- Clasificación de texto en seis categorías de discurso de odio: género, geopolítica, otros, política, religión y violencia.
- Procesamiento de texto code-mixed kannada-inglés (kanglish), incluyendo transliteraciones frecuentes en comentarios de YouTube.
- Manejo de entradas de hasta 160 tokens, adecuado para comentarios cortos y medios.
- Salida de etiqueta única por entrada mediante `pipeline("text-classification")`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas de entrenamiento (kn, en) y su mezcla.

## Casos de uso

- Moderación asistida de comentarios en YouTube: el modelo puede preetiquetar comentarios en kanglish según su categoría de odio, priorizando la revisión humana en las clases más sensibles (violencia, religión). Es adecuado por su especialización en code-mixed y su ventana de 160 tokens, suficiente para comentarios típicos.
- Investigación en discurso de odio multilingüe: sirve como línea base reproducible para experimentos sobre detección de target en lenguas de bajos recursos, dado que parte de MuRIL y documenta el esquema de entrenamiento.
- Filtrado previo en pipelines de anotación: puede usarse para preseleccionar candidatos que alimenten herramientas de anotación humana, reduciendo el volumen de revisión manual en corpus de kanglish.
- Análisis de sesgos en moderación: al tener etiquetas de categoría objetivo, permite estudiar qué colectivos reciben más clasificaciones en cada categoría y auditar posibles sesgos del sistema.
- Prototipado de clasificadores para otras variedades code-mixed: el esquema de oversampling con pérdida amortiguada por raíz cuadrada es reutilizable en datasets pequeños y desbalanceados de otras combinaciones de idiomas.
- Evaluación comparativa de encoders multilingües: como checkpoint de MuRIL ajustado, resulta útil para comparar el rendimiento de encoders indios frente a modelos multilingües generales en tareas de clasificación de odio.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 | 0,424 | Partición reservada aleatoria del 12% de los datos fusionados (train + validation) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es el macro-F1 indicado, que además no constituye una validación limpia al haberse entrenado con los ficheros de validación originales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 para un encoder base de ~236 M de parámetros; menos de 1 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100, H100 o RTX 4090 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3060, RTX 4090 y similares, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con pipeline de clasificación, TorchServe, ONNX Runtime, TGI y, con conversión previa, llama.cpp u Ollama (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hastika-task-b-muril-oversampled-trainval | ~236 M (base MuRIL) | 160 tokens | Clasificación de target de odio en kanglish | apache-2.0 | HuggingFace |
| google/muril-base-cased | ~236 M | 512 tokens | Encoder multilingüe indio (preentrenamiento) | apache-2.0 | HuggingFace |
| Modelos de la familia XLM-R base | ~278 M | 512 tokens | Clasificación multilingüe general | MIT | HuggingFace |

La comparación con alternativas específicas de detección de odio en kanglish no está disponible en la información proporcionada. Frente a MuRIL base, este checkpoint añade la cabeza de clasificación de seis clases pero reduce la longitud efectiva de contexto a 160 tokens por el entrenamiento.

## Limitaciones y advertencias

- Entrenado sobre los ficheros de entrenamiento y validación fusionados: no existe una validación limpia y el macro-F1 de 0,424 corresponde a una partición aleatoria del 12% de los datos ya vistos en el proceso, por lo que puede sobreestimar el rendimiento real.
- El checkpoint no formó parte de un envío oficial al shared task HASTIKA @ ICON-2026.
- Dataset de entrenamiento pequeño: se esperan errores en dialectos, sarcasmo, lenguaje reclamado y variantes de transliteración no vistas durante el entrenamiento.
- Riesgo de alucinación conceptual en clasificación: falsos positivos y negativos en categorías ambiguas como "Others" o "Geo-political".
- Sesgos potenciales derivados de los datos de YouTube y de la anotación original del corpus HASTIKA, no auditados en la model card.
- Uso previsto para investigación y como asistencia a moderadores humanos, no como sustituto de los mismos.
- El dataset no se incluye; deben consultarse los términos del corpus HASTIKA antes de cualquier uso adicional.
- Licencia apache-2.0 para los pesos, pero las condiciones del dataset de origen pueden imponer restricciones adicionales al uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ganesh-Nadkarni/hastika-task-b-muril-oversampled-trainval
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
- Cita del shared task: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. Language Resources and Evaluation, 59(3):2811-2856.
- Repositorio, paper o demo del shared task HASTIKA @ ICON-2026: no disponible en la información proporcionada.

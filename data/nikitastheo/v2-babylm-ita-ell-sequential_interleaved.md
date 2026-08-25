# nikitastheo/v2-babylm-ita-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v2-babylm-ita-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo GPT-2, desarrollado por el usuario nikitastheo, con 123,8 millones de parámetros. Está entrenado específicamente para el reto BabyLM, que busca desarrollar modelos de lenguaje eficientes con datos limitados y de alta calidad, en este caso con un corpus que combina italiano y griego (código ISO "ell"). El nombre "sequential_interleaved" sugiere que los idiomas se presentan de forma secuencial e intercalada durante el entrenamiento, con un cambio de idioma en el epoch 10.

El modelo se publica en formato safetensors y es compatible con la librería transformers, lo que permite su uso directo con pipelines de generación de texto. Aunque no se especifican la licencia ni los idiomas soportados en la ficha de HuggingFace, el contexto del entrenamiento apunta a un modelo bilingüe italiano-griego. Su relevancia radica en ser un ejemplo de entrenamiento eficiente con datos reducidos, una línea de investigación activa en la comunidad de procesamiento del lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors FP32) |
| Idiomas soportados | no disponible (entrenado con italiano y griego, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atención causal, diseñado para generación de texto autoregresiva. No se especifican detalles sobre el número de capas, cabezas de atención o dimensiones ocultas, pero el tamaño de 123M parámetros es consistente con la configuración base de GPT-2 (12 capas, 768 dimensiones ocultas, 12 cabezas de atención).

El entrenamiento se realizó con el script `train_clm.py` de Hugging Face Accelerate, sin usar la clase `Trainer`. Los hiperparámetros principales son: 24.850 pasos máximos, tasa de aprendizaje 0.0001 con scheduler lineal, 2.485 pasos de warmup, batch size de 32 por dispositivo y un total de 32 (sin acumulación de gradientes). El tokenizer es `nikitastheo/babylm-ita-tokenizer`, específico para el corpus BabyLM en italiano. El parámetro "language switch epoch: 10" indica que en el epoch 10 se produce un cambio en la distribución de idiomas, probablemente alternando entre italiano y griego de forma secuencial. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto causal: el modelo produce texto autoregresivo, coherente con el corpus de entrenamiento.
- Procesamiento bilingüe: entrenado con datos en italiano y griego, aunque no se confirma si mantiene ambas lenguas de forma equilibrada.
- Compatible con pipelines de Hugging Face: se puede cargar con `pipeline("text-generation")` y usar en entornos de inferencia estándar.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en eficiencia de entrenamiento: sirve como modelo de referencia para estudiar el impacto de la intercalación de idiomas en el aprendizaje con datos limitados, dentro del marco BabyLM.
- Generación de texto en italiano y griego: puede emplearse para tareas de completado de texto, redacción asistida o prototipos de chatbots en estos idiomas, siempre que se acepte la calidad limitada de un modelo pequeño.
- Evaluación de tokenizadores específicos: el tokenizer `babylm-ita-tokenizer` puede analizarse junto al modelo para medir su eficiencia en la segmentación de palabras en italiano y griego.
- Base para fine-tuning: al ser un modelo compacto, es adecuado para ajuste fino en tareas específicas con pocos recursos computacionales, como clasificación de texto o generación de respuestas cortas.
- Comparación de estrategias de entrenamiento: permite contrastar el rendimiento de la intercalación secuencial frente a otros métodos de mezcla de idiomas en modelos pequeños.
- Educación y divulgación: útil para demostrar el entrenamiento de un modelo de lenguaje desde cero en un entorno académico, gracias a su tamaño reducido y a la disponibilidad del script de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no incluye métricas de rendimiento en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Dado el tamaño de 123M parámetros, se puede estimar:

- VRAM para inferencia en FP32: aproximadamente 500 MB (solo pesos), más overhead de activaciones y atención, por lo que una GPU con 2-4 GB sería suficiente.
- Con cuantización a 8 bits (si se aplica), la huella se reduce a unos 125 MB, permitiendo ejecución en CPU o GPUs integradas.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) o incluso CPU con suficiente RAM.
- Opciones de despliegue: compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (tras conversión) y Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles, pero para un modelo de este tamaño se espera una generación rápida en hardware moderno (decenas de tokens por segundo en GPU).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo pertenece a la familia BabyLM, donde existen otros modelos como `nikitastheo/babylm-ita-ell-sequential_interleaved` (versión anterior) o `v2-babylm-eng-ell-sequential_interleaved` (variante en inglés), pero no se han publicado métricas comparativas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un corpus limitado (BabyLM), el modelo puede reflejar sesgos presentes en los datos de origen, aunque no se documentan explícitamente.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido factualmente incorrecto o inventado, especialmente en dominios no cubiertos por el corpus.
- Limitaciones de contexto: la longitud de contexto no está especificada; si sigue la configuración GPT-2 base, sería de 1024 tokens, lo que limita el manejo de documentos largos.
- Limitaciones de idioma: aunque se entrenó con italiano y griego, no se garantiza un rendimiento equilibrado entre ambos; el cambio de idioma en el epoch 10 podría favorecer al último idioma visto.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido. Se recomienda contactar al autor antes de usarlo en producción.
- Carencia de alineación: no se aplicaron técnicas de RLHF o DPO, por lo que el modelo puede generar respuestas inapropiadas o no seguir instrucciones de forma fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v2-babylm-ita-ell-sequential_interleaved
- Tokenizer asociado: https://huggingface.co/nikitastheo/babylm-ita-tokenizer
- Modelo relacionado (versión anterior): https://huggingface.co/nikitastheo/babylm-ita-ell-sequential_interleaved
- Modelo relacionado (variante inglés-griego): https://huggingface.co/nikitastheo/v2-babylm-eng-ell-sequential_interleaved
- Repositorio de evaluación BabyLM (referencia): https://deepwiki.com/babylm-org/babylm-eval/5-baseline-models-and-reference-results

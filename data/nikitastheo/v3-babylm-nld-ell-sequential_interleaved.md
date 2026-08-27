# nikitastheo/v3-babylm-nld-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v3-babylm-nld-ell-sequential_interleaved` es un modelo de lenguaje causal (causal LM) basado en la arquitectura GPT-2, desarrollado por Nikitas Theodoropoulos como parte de un experimento de entrenamiento con el corpus BabyLM. Con 123,9 millones de parámetros, se trata de un modelo compacto orientado a la investigación en aprendizaje de lenguaje con datos limitados, probablemente centrado en neerlandés (nld) y griego (ell) según su nombre, aunque esta información no está confirmada en la ficha oficial.

El modelo fue entrenado con un script personalizado de Hugging Face Accelerate (sin usar `Trainer`), con un tokenizador específico (`nikitastheo/babylm-nld-tokenizer`) y un esquema de entrenamiento que alterna idiomas de forma secuencial e intercalada. Su relevancia radica en explorar estrategias de entrenamiento multilingüe con recursos computacionales reducidos, en el contexto de la competición BabyLM, que busca modelos eficientes con datos limitados.

Aunque no se han publicado métricas de rendimiento ni detalles sobre la licencia, el modelo está disponible en Hugging Face con formato `safetensors` y es compatible con pipelines de generación de texto y `text-generation-inference`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuración base GPT-2, probablemente 1024, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el nombre sugiere neerlandés y griego, sin confirmación) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only con atención causal. No se especifican detalles sobre el número de capas, cabezas de atención o dimensiones ocultas, pero al tener 123,9 millones de parámetros, se asemeja al tamaño de GPT-2 small (124M). El entrenamiento se realizó con un script propio basado en Hugging Face Accelerate, sin usar la clase `Trainer`. Los hiperparámetros reportados incluyen un máximo de 24.820 pasos, una tasa de aprendizaje de 0,0001 con scheduler lineal y 2.482 pasos de warmup, y un tamaño de lote de 32 por dispositivo. Se menciona un "language switch epoch" de 10, lo que sugiere que el entrenamiento alterna entre idiomas (posiblemente neerlandés y griego) de forma secuencial e intercalada, como indica el nombre del modelo. No se detalla la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto causal: el modelo puede continuar secuencias de texto de forma autoregresiva.
- Modelado de lenguaje multilingüe: aunque no confirmado, el nombre sugiere entrenamiento en neerlandés y griego, lo que implicaría cierta capacidad de generación en esos idiomas.
- Compatible con `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en entornos de producción.
- No se reportan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación en aprendizaje de lenguaje con datos limitados: el modelo es adecuado para estudiar cómo los modelos pequeños aprenden representaciones lingüísticas con corpus reducidos, como el de BabyLM.
- Experimentos de transferencia multilingüe: al estar entrenado con alternancia de idiomas, puede servir para analizar la transferencia entre lenguas tipológicamente diferentes (neerlandés y griego).
- Prototipos de generación de texto en bajo recurso: su tamaño compacto permite ejecutarlo en hardware modesto, ideal para prototipos de chatbots o asistentes en idiomas minoritarios.
- Fine-tuning para tareas específicas: al ser un modelo base, puede ajustarse para clasificación de texto, análisis de sentimiento o generación de respuestas en dominios concretos.
- Educación y docencia: útil para demostrar el entrenamiento de modelos de lenguaje desde cero en cursos de PLN.
- Evaluación de estrategias de entrenamiento: sirve como punto de comparación para estudiar el impacto de la intercalación de idiomas en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: con 123,9 millones de parámetros, en FP16 se necesitan aproximadamente 250 MB de VRAM solo para los pesos, más overhead de activaciones y memoria del optimizador durante el entrenamiento. Para inferencia, una GPU con 4 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3050).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: al ser compatible con `transformers` y `text-generation-inference`, puede servirse con vLLM, TGI, o mediante `llama.cpp` si se convierte a GGUF (aunque no se proporcionan cuantizaciones oficiales).
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño, la generación es rápida en GPUs modernas (típicamente decenas de tokens por segundo en una RTX 3060).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es comparable en tamaño a GPT-2 small (124M) y a otros modelos BabyLM, pero no se han publicado métricas comparativas. Se puede indicar que, por su arquitectura y tamaño, se sitúa en la categoría de modelos pequeños de lenguaje, pero sin datos de rendimiento no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo entrenado con un corpus específico (BabyLM), puede reflejar sesgos presentes en ese corpus.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto.
- Limitaciones de contexto: al basarse en GPT-2, la longitud de contexto probablemente sea de 1024 tokens, aunque no está confirmado.
- Idiomas: no se confirma oficialmente qué idiomas soporta; el nombre sugiere neerlandés y griego, pero no hay garantía.
- Licencia: no se especifica, por lo que su uso comercial es incierto. Se recomienda contactar al autor antes de utilizarlo en producción.
- El modelo no ha sido evaluado en tareas estándar, por lo que su rendimiento real es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v3-babylm-nld-ell-sequential_interleaved
- Perfil del autor: https://nikitas-theo.github.io/
- Página de BabyLM: https://babylm.github.io/

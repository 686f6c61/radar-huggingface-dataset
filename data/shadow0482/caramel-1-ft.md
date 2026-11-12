# Shadow0482/caramel-1-ft

## Resumen

caramel-1-ft es un ajuste fino (fine-tune) del modelo base naklecha/caramel-1, publicado por el usuario Shadow0482 en Hugging Face. Se trata de un modelo de aproximadamente 413 millones de parámetros (413.198.848 según los pesos en safetensors) que hereda la arquitectura del modelo original y ha sido reentrenado sobre el conjunto de datos otoearth/otoSpeech-full-duplex-task-oriented-v2, un dataset orientado a tareas de diálogo full-duplex. El repositorio ocupa 1,7 GB y se distribuye bajo licencia Apache 2.0.

El interés de esta ficha es doble: por un lado, documenta un fine-tune de nicho con muy poca tracción (0 descargas y 0 likes en el momento de la consulta); por otro, sirve para entender el ecosistema del modelo base caramel-1, que no dispone de model card pública detallada en la información proporcionada. El ajuste se realizó con fp16, learning rate 5e-05 y 2 GPUs T4, alcanzando una mejor pérdida de validación de 2,6348 en el paso 30, un dato que sugiere un entrenamiento muy corto y posiblemente insuficiente para una convergencia estable.

La relevancia práctica es limitada: se trata de un experimento de ajuste sobre un dataset específico de diálogo orientado a tareas, sin benchmarks publicados, sin idiomas declarados y sin pipeline definido. Resulta útil como referencia para quienes exploran fine-tunes de caramel-1 o datasets de diálogo full-duplex, pero no como modelo listo para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de naklecha/caramel-1; no especificada en la informacion) |
| Parametros totales | 413.198.848 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base naklecha/caramel-1 en los datos proporcionados. Por el número de parámetros (413 millones) y el tamaño del repositorio (1,7 GB), es compatible con un transformer de escala pequeña-media, pero no se confirma el tipo exacto (transformer denso, MoE, híbrido, etc.). Tampoco se especifican la longitud de contexto nativa ni la composición del corpus de preentrenamiento original.

El ajuste fino se realizó sobre el dataset otoearth/otoSpeech-full-duplex-task-oriented-v2, orientado a diálogo full-duplex y tareas. Los hiperparámetros documentados son: learning rate 5e-05, precisión fp16, 2 GPUs T4 y una mejor pérdida de validación de 2,6348 alcanzada en el paso 30. Este último dato es relevante: un óptimo en el paso 30 indica un entrenamiento muy corto, con riesgo de sobreajuste o de convergencia incompleta. No se documentan técnicas de RLHF, DPO ni decodificación especulativa. La ejecución se realiza con el repositorio `caramel` mediante `python generate.py --model <carpeta>`.

## Capacidades

- Generación de texto y diálogo: el ajuste se orienta a tareas de diálogo full-duplex según el dataset de entrenamiento, aunque no se detallan capacidades específicas verificadas.
- Razonamiento y código: no disponible; no hay evidencia en la información proporcionada de que el modelo base o el fine-tune hayan sido entrenados específicamente para estas tareas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible. El dataset de origen (otoSpeech) sugiere un contexto de voz/diálogo, pero no se confirma que el modelo procese audio.

## Casos de uso

- Experimentación con diálogo orientado a tareas: el modelo puede emplearse para probar flujos de conversación multi-turno en entornos de investigación, dado que fue ajustado sobre un dataset de tareas full-duplex. Adecuado por su tamaño reducido, que permite iterar rápido en una sola GPU.
- Prototipado de asistentes conversacionales de dominio acotado: al ser un fine-tune sobre un dataset específico, sirve para validar pipelines de generación de respuestas en tareas concretas antes de escalar a modelos mayores.
- Evaluación de datasets de diálogo: útil como baseline para medir la calidad del dataset otoSpeech-full-duplex-task-oriented-v2 frente a otros corpus, comparando pérdidas de validación.
- Reproducción de experimentos de fine-tuning: el repositorio documenta hiperparámetros y hardware (2 x T4, fp16, lr 5e-05), lo que facilita reproducir el ajuste con el repositorio `caramel`.
- Base para nuevos fine-tunes: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes posteriores sobre dominios específicos, siempre que se respeten las condiciones del dataset de origen.
- Docencia y formación: por su tamaño (413 M de parámetros) y su licencia permisiva, es adecuado para demostrar el ciclo completo de fine-tuning y despliegue en cursos o talleres.
- Investigación en diálogo full-duplex: si el modelo base soporta procesamiento de flujos de audio, podría integrarse en estudios sobre interacción conversacional en tiempo real, aunque esta capacidad no está confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la pérdida de validación: 2,6348 en el paso 30 (lr 5e-05, fp16, 2 x T4). No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 413 M de parámetros, en fp16 se requieren aproximadamente 0,83 GB solo para pesos; en fp32, unos 1,65 GB. Sumando activaciones y caché KV, un despliegue típico cabe en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo con holgura. También cabe en GPUs de datacenter como A100 o H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU con cuantización a 8 bits o 4 bits.
- Opciones de despliegue: el autor indica el repositorio `caramel` (`python generate.py --model <carpeta>`). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser safetensors, sería necesario convertir a GGUF para llama.cpp u Ollama, y verificar la arquitectura concreta antes de asumir compatibilidad.
- Latencia y throughput estimados: no disponibles. Con 413 M de parámetros, en una GPU consumer se espera una latencia baja (decenas de milisegundos por token), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría, ya que no se conocen la arquitectura, el contexto ni los benchmarks del modelo base caramel-1 ni de este fine-tune. Se indica "no disponible" para los campos comparativos.

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| Shadow0482/caramel-1-ft | 413 M | no disponible | Apache 2.0 | no disponible | Hugging Face |
| naklecha/caramel-1 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~400 M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento muy corto: el mejor checkpoint se alcanza en el paso 30, lo que sugiere convergencia incompleta y posible inestabilidad en las respuestas.
- Sin benchmarks: no hay métricas que permitan evaluar su calidad frente a alternativas; no debería usarse en producción sin una evaluación propia.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas; el dataset de origen podría estar en inglés.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, agravado por la falta de evaluación.
- Sesgos conocidos: no documentados, pero el dataset de diálogo puede introducir sesgos de dominio y de estilo conversacional.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, pero el dataset otoearth/otoSpeech-full-duplex-task-oriented-v2 tiene sus propias condiciones de licencia y atribución, que el autor advierte revisar. El uso comercial del modelo derivado podría estar condicionado por dichas condiciones.
- Compatibilidad de despliegue incierta: solo se documenta el repositorio `caramel`; no se garantiza que funcione con vLLM, llama.cpp u otros motores sin adaptaciones.
- Tracción nula: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad; úsese con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/Shadow0482/caramel-1-ft
- Modelo base: https://huggingface.co/naklecha/caramel-1
- Dataset de fine-tuning: https://huggingface.co/datasets/otoearth/otoSpeech-full-duplex-task-oriented-v2
- Repositorio de inferencia: no disponible como enlace directo en la información proporcionada (el autor menciona el repositorio `caramel`).

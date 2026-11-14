# Charlie320/zils-mini-n4a

## Resumen

zils-mini-n4a es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de sopas de modelos `d3-mini` del ecosistema Zils, asociado a la subred 127 de Bittensor. Técnicamente es un fine-tune de Qwen/Qwen3.5-4B en el formato de chasis propietario de Zils, con pesos en BF16, pesos de lenguaje entrenados y la torre de visión heredada del modelo padre.

El modelo se construye mediante una receta de *model soup*: parte de la media uniforme de los dos bodies actuales del pool `z3-mini` y le fusiona la media uniforme de cuatro ejecuciones de LoRA de rango 64 (anchor 0,1, learning rate 5e-5, dos épocas, semillas distintas) entrenadas sobre un subconjunto de nuevo dominio de 16.687 filas y 452 familias de tareas. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de retransmisión (relay teacher) público de Zils.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino una pieza de infraestructura para el mecanismo de evaluación por exámenes de la subred Bittensor 127. El repositorio contiene solo pesos (9,1 GB), no incluye código de inferencia ni pipeline declarado, y no se han publicado resultados de benchmarks ni lista de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B; incluye torre de visión heredada del padre) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parámetros, sobre el que se aplica el "chasis" de Zils: una disposición de pesos que separa cuerpo (lenguaje) y torre de visión. En este modelo los pesos de lenguaje están entrenados y la torre de visión se hereda sin modificar del modelo padre. Los pesos se distribuyen en BF16.

El entrenamiento combina dos técnicas. Primero, un *model soup*: la media uniforme de los dos bodies vigentes del pool `z3-mini` sirve como punto de partida. Sobre esa base se ejecutan cuatro LoRA de rango 64 con anchor 0,1, learning rate 5e-5 y dos épocas, variando la semilla, y sus resultados se promedian de forma uniforme y se fusionan en el punto de partida. Los datos de ese fine-tune son 16.687 filas repartidas en 452 familias de tareas del subconjunto de nuevo dominio. Esos ítems, en formato de examen y orientados a decisión, se generaron con la receta pública `scripts/author_exam.py` usando Claude Opus y un modelo abierto local, a partir exclusivamente de splits públicos de entrenamiento, y se complementan con las respuestas del relay teacher público de Zils. El autor declara explícitamente que no se usaron ítems del examen del validador ni ítems semilla públicos. No se documentan fases de RLHF o DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento en el formato de decisión propio de Zils (ítems tipo examen con opciones y respuesta seleccionada).
- Clasificación y selección de respuestas dentro de un conjunto de opciones, que es la tarea para la que se ha entrenado el subconjunto de nuevo dominio.
- Procesamiento de imagen potencial a través de la torre de visión heredada de Qwen/Qwen3.5-4B, aunque no se documenta el alcance efectivo de esta capacidad tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara lista de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de modelos en la subred Bittensor 127: el modelo actúa como body del pool `d3-mini` para responder exámenes de decisión generados por el validador, que es exactamente el rol para el que se ha construido y entrenado.
- Generación de ítems de examen sintéticos: la receta `scripts/author_exam.py` documentada por el autor permite replicar el pipeline de autoría usado en el entrenamiento para crear nuevos conjuntos de evaluación en formato de decisión.
- Investigación sobre model soups y fusión de LoRA: el repositorio documenta con precisión los hiperparámetros (rango 64, anchor 0,1, lr 5e-5, dos épocas, cuatro semillas), lo que lo convierte en un caso reproducible para estudiar el efecto del promediado uniforme de adaptadores.
- Estudio de linaje y procedencia de datos en modelos abiertos: al declarar el origen de cada componente (Qwen3.5-4B, `jaysun007/zils-mini-body-m10`, `Charlie320/zils-mini-s3l`) y las restricciones de los splits usados, sirve como ejemplo de trazabilidad en entrenamiento.
- Base para fine-tunes posteriores en dominios de decisión: al ser un modelo de 4,5B en BF16 con licencia Apache 2.0, se puede reentrenar con LoRA en hardware de gama media para tareas de clasificación o selección específicas.
- Despliegue en entornos con restricciones de memoria: con 9,1 GB en BF16, cabe en GPUs consumer de 16 GB o más tras cuantización a 8 bits, lo que permite experimentar con el formato de examen Zils en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos, manejable en GPUs de 8-12 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3-4 GB de pesos, viable en GPUs de 6-8 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 sin problemas; RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) al límite en BF16.
- Cabe en GPU consumer: sí, desde 16 GB en BF16 y desde 8 GB con cuantización.
- Opciones de despliegue: vLLM, TGI y llama.cpp son compatibles con safetensors de un transformer denso; Ollama requiere conversión previa a GGUF, que el autor no proporciona.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-n4a | 4,54B | no disponible | Apache 2.0 | Hugging Face, solo pesos | Fine-tune de decisión para subnet 127 |
| Qwen/Qwen3.5-4B | ~4B | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva |
| Charlie320/zils-mini-s3l | no disponible | no disponible | no disponible | Hugging Face | Body previo del mismo pool, base del soup |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Hugging Face | Body previo del mismo pool, base del soup |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría (modelos de decisión para subredes Bittensor), por lo que la comparativa se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes: el rendimiento real en tareas de decisión es desconocido.
- El modelo está especializado en el formato de examen de Zils; su comportamiento fuera de ese formato no está documentado y probablemente sea degradado respecto al Qwen3.5-4B original.
- Los datos de entrenamiento se generaron con Claude Opus y un modelo abierto local mediante una receta sintética; esto introduce riesgo de sesgos de destilación y de errores sistemáticos en las respuestas del profesor.
- El autor advierte que el repositorio contiene solo pesos y que deben revisarse los términos de los datasets de origen antes de reutilizarlos; la licencia Apache 2.0 del modelo no cubre necesariamente esos datos.
- No se declara lista de idiomas ni longitud de contexto; asumir el comportamiento multilingüe de Qwen3.5-4B es una extrapolación no verificada.
- La torre de visión se hereda sin entrenar; su alineación con los pesos de lenguaje modificados no está validada.
- Riesgo de alucinación: no evaluado; en tareas de decisión con opciones cerradas el riesgo es menor, pero no se ha medido.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en producción ni validación por terceros.
- La fecha de creación del repositorio (2026-11-14) es posterior a la fecha actual de referencia habitual; conviene verificar la integridad y procedencia del artefacto antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-n4a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Body previo del pool: https://huggingface.co/jaysun007/zils-mini-body-m10
- Body previo del pool: https://huggingface.co/Charlie320/zils-mini-s3l
- Receta de autoría de exámenes: `scripts/author_exam.py` (referenciada en la model card, no se proporciona URL directa)
- Subred Bittensor 127: no se proporciona URL en la información disponible

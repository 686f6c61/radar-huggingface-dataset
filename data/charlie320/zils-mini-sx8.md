# Charlie320/zils-mini-sx8

## Resumen

zils-mini-sx8 es un fine-tune de Qwen/Qwen3.5-4B publicado por el usuario Charlie320 en Hugging Face, concebido como "body" (cuerpo de pesos) para el pool de modelos "soup" denominado Zils `d3-mini`, asociado a la subnet 127 de Bittensor. El modelo parte de joamCriff123/zils-mini-sx3 y se ha construido mediante un promedio uniforme de pesos de ocho fine-tunes LoRA de rango 32 aplicados sobre ese "soup" previo, cada uno entrenado durante una época con tasas de aprendizaje entre 5e-5 y 1e-4. El resultado es un modelo de 4.539.265.536 parámetros en BF16, con licencia Apache-2.0 y un tamaño de repositorio de 9,1 GB.

La relevancia del modelo es acotada y muy específica: se trata de un artefacto de un pipeline de "decision-model" orientado a la evaluación y selección de modelos dentro de la dinámica de subnets de Bittensor, no de un modelo de propósito general optimizado para conversación, código o razonamiento abierto. La model card es explícita: es un "body" para un pool de soups, con los pesos de lenguaje entrenados y la torre de visión heredada del modelo padre.

No se dispone de información sobre resultados de benchmarks, idiomas soportados, longitud de contexto efectiva tras el fine-tune ni detalles del dataset más allá de que se compone de ítems de decisión en formato de examen, generados con Claude Opus y con un modelo abierto local a partir de recetas públicas de autoría, y de respuestas de un "relay teacher" público de Zils. Cualquier uso en producción debería tratarse con cautela y validarse empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B; detalles de atención y capas no disponibles) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.500 millones de parámetros. Sobre esa base se aplicó un "soup" previo (joamCriff123/zils-mini-sx3, correspondiente a la ronda del 2026-11-09 del pool `d3-mini`) y, sobre él, ocho fine-tunes LoRA de rango 32 que se promediaron uniformemente en pesos. Cada LoRA se entrenó durante una época con learning rate entre 5e-5 y 1e-4. Cuatro de los adaptadores se entrenaron sobre ítems en formato de examen escritos con Claude Opus, y los otros cuatro sobre esos mismos ítems más ítems escritos localmente. El resultado se publica en BF16 con la torre de visión heredada del modelo padre.

Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`), usando únicamente splits de entrenamiento públicos, más las respuestas del "relay teacher" público de Zils. La model card afirma explícitamente que no se usaron ítems de examen de validadores ni ítems semilla públicos. No se documentan técnicas de RLHF, DPO, decodificación especulativa ni innovaciones de atención; el proceso es exclusivamente de fine-tuning supervisado con LoRA y posterior model soup.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen/Qwen3.5-4B.
- Capacidad de visión: la torre de visión se hereda del modelo padre, aunque no se detalla su configuración ni el rendimiento tras el fine-tune.
- Especialización en "decision-model": el entrenamiento se orienta a ítems en formato de examen y a la selección de respuestas, no a diálogo abierto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación interna de modelos en subnets de Bittensor: el modelo está pensado como "body" de un pool de soups para la subnet 127, por lo que su uso natural es participar en el pipeline de selección y puntuación de modelos de esa red.
- Generación de ítems de decisión en formato de examen: puede emplearse para producir pares pregunta-respuesta estructurados siguiendo la receta pública de autoría de Zils, útil para ampliar datasets de evaluación.
- Clasificación y selección de respuestas candidatas: dado su entrenamiento sobre ítems de examen y respuestas de un teacher, puede usarse para puntuar o elegir entre opciones en tareas de decisión cerrada.
- Fine-tuning posterior como base de soups: al ser un modelo pequeño (4,5 B) en BF16 y Apache-2.0, sirve como punto de partida para nuevas rondas de LoRA y promediado de pesos en pipelines de investigación.
- Prototipado de asistentes con visión en entornos controlados: la torre de visión heredada permite experimentar con tareas imagen-texto, siempre validando el comportamiento tras el fine-tune.
- Investigación sobre model soups y promediado de pesos: el repositorio documenta explícitamente la receta (ocho LoRA r32, una época, lr 5e-5 a 1e-4), lo que lo convierte en un caso de estudio reproducible para estudiar el efecto del soup sobre un modelo base.
- Evaluación comparativa de "decision models": útil como referencia en experimentos que midan la degradación o mejora de capacidades tras fine-tunes especializados frente al Qwen3.5-4B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9-10 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3-4 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues concurrentes; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en cuantización de 8 bits o inferior, y en GPUs de 12 GB con cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF, no incluida en el repo), Ollama (previa conversión), Transformers con `safetensors`.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-sx8 | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune especializado en decision-model sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado en la información) | no disponible | no disponible en la información | Hugging Face | Modelo base original; capacidades generales |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | Apache-2.0 | Hugging Face | Soup previo del que parte este modelo |
| Otros modelos de ~4 B de la familia Qwen | ~4 B | no disponible | no disponible | Hugging Face | Alternativas generalistas; comparación de rendimiento no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.
- Es un artefacto de un pipeline específico (subnet 127 de Bittensor); su comportamiento fuera de ese contexto no está caracterizado.
- Riesgo de alucinación y de degradación de capacidades generales tras el promediado de ocho LoRA especializados en ítems de examen.
- No se declaran idiomas soportados; el entrenamiento se realizó sobre ítems en formato de examen de origen no especificado, lo que puede limitar el multilingüismo.
- Longitud de contexto efectiva no documentada; no se garantiza el contexto nativo del modelo base tras el fine-tune.
- La model card advierte de que el repositorio contiene solo pesos y que deben revisarse los términos de los datasets de origen antes de su reutilización.
- La licencia Apache-2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento (ítems generados con Claude Opus y un modelo abierto local) puede plantear dudas sobre los términos de reutilización de esos datos.
- No se documentan sesgos, evaluaciones de seguridad ni pruebas de robustez.
- El modelo base Qwen/Qwen3.5-4B y el soup previo joamCriff123/zils-mini-sx3 deben verificarse por separado para confirmar sus licencias y condiciones.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-sx8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Soup previo: https://huggingface.co/joamCriff123/zils-mini-sx3
- Receta de autoría de Zils: `scripts/author_exam.py` (referenciada en la model card; no se proporciona URL directa)
- Subnet 127 de Bittensor: no se proporciona URL directa en la información disponible.

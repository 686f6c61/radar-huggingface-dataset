# David319193/d3-lite-zils-body

## Resumen

d3-lite-zils-body es un ajuste fino tipo LoRA fusionado en pesos completos bf16 sobre el chasis d3-lite 0.8B, que a su vez deriva de Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario David319193 y se publica bajo licencia Apache-2.0. El modelo está etiquetado como `feature-extraction` y `decision-model`, y su propósito declarado es servir como "cuerpo" (body) dentro de un sistema de decisión denominado Zils, asociado a la subred 127 de Bittensor.

El problema que aborda es el de la evaluación automática de decisiones con resultado etiquetado: se ha entrenado sobre elementos públicos con desenlace conocido (categorías de arXiv, discusiones AfD/AfC y reversiones de Wikipedia, merges de Gerrit y preguntas de Stack Exchange), recogidos mediante la herramienta `zils.current`. Con 852.985.920 parámetros, es un modelo pequeño orientado a extracción de características y puntuación de decisiones más que a generación conversacional general.

Su relevancia es acotada: se trata de una contribución a un pool de modelos ("soup pool") de una subred de Bittensor, con cero descargas y cero likes en el momento de la consulta, sin model card extensa ni resultados de benchmarks publicados. Es útil como pieza de un pipeline de decisión concreto, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B, tag `qwen3_5`), ajuste fino con LoRA fusionado en pesos completos |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros, y se ha sometido a un ajuste fino con LoRA que posteriormente se ha fusionado en pesos completos en bf16. La model card indica que el entrenamiento se realizó sobre "public outcome-labelled decision items" de fuentes públicas: categorías de arXiv, discusiones AfD/AfC y reversiones de Wikipedia, merges de Gerrit y contenido de Stack Exchange, recopilados con `zils.current`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá de la fusión de LoRA y la inclusión de código personalizado (`custom_code`) necesario para cargar el modelo con transformers.

## Capacidades

- Extracción de características (`feature-extraction`): el pipeline declarado del modelo es la generación de representaciones, no la generación de texto libre.
- Modelo de decisión: entrenado para puntuar o clasificar elementos con resultado etiquetado (aceptación/rechazo, merge/no merge, reversión/no reversión).
- Dominios de especialización: categorización de papers (arXiv), moderación de contenido en Wikipedia (AfD/AfC/reverts), revisión de cambios en Gerrit y calidad de respuestas en Stack Exchange.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Triaje de propuestas en comunidades tipo Wikipedia: el modelo puede puntuar si una discusión AfD o AfC tiene probabilidad de terminar en borrado o rechazo, ayudando a priorizar la revisión humana en colas de moderación.
- Predicción de merges en revisiones de código: integrado en un pipeline de CI sobre Gerrit, puede asignar una probabilidad de aceptación a un cambio antes de la revisión, permitiendo enrutar los parches de mayor riesgo a revisores senior.
- Clasificación de preguntas en Stack Exchange: estimar la calidad o probabilidad de cierre de una pregunta entrante para sugerir mejoras al autor antes de publicarla.
- Categorización de preprints: asignar o validar categorías de arXiv a partir del texto del abstract y del título, como paso previo a un clasificador supervisado más pesado.
- Señal auxiliar en sistemas de decisión multi-modelo: al ser un "body" del pool de Zils, puede emplearse como componente de extracción de características dentro de un ensemble que combine varios cuerpos y una cabeza de decisión.
- Filtrado previo en datasets de investigación: usar las representaciones del modelo para detectar elementos con patrones de resultado conocido (por ejemplo, reversiones) y construir subconjuntos etiquetados de forma semi-automática.
- Experimentación en subredes de Bittensor: servir como punto de partida para participantes de la subnet 127 que quieran evaluar o mejorar el chasis d3-lite 0.8B con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,7 GB solo para los pesos (852,9 M de parámetros × 2 bytes), más overhead de activaciones y del código personalizado; un cálculo conservador sitúa el total en 2-4 GB según longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 son suficientes con holgura. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, aunque pueden usarse para alto throughput.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 6 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al ser un modelo de extracción de características y no de generación, las herramientas de serving orientadas a chat no son directamente aplicables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-lite-zils-body | 852.985.920 | no disponible | Feature extraction / decision model | Apache-2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | Generación de texto general | no disponible en la información | HuggingFace |
| Chasis d3-lite 0.8B | ~0,8 B | no disponible | Base para ajustes de decisión | Apache-2.0 (según model card) | no disponible |

No se dispone de información sobre benchmarks ni sobre otros modelos de decisión comparables en la misma categoría.

## Limitaciones y advertencias

- El modelo está diseñado para extracción de características y puntuación de decisiones; no debe esperarse de él un comportamiento conversacional ni de generación de texto de calidad.
- No se documentan sesgos conocidos, pero el entrenamiento sobre datos de comunidades concretas (Wikipedia, Gerrit, Stack Exchange, arXiv) puede introducir sesgos de dominio y de sesgo de selección hacia esos ecosistemas.
- Riesgo de alucinación: no aplica de la misma forma que en modelos generativos, pero sí existe riesgo de calibración deficiente en las puntuaciones de decisión fuera de la distribución de entrenamiento.
- No se informan los idiomas soportados; es probable que el rendimiento fuera del inglés sea inferior, aunque este extremo no está confirmado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar dicho código antes de desplegarlo en producción.
- Es un modelo con cero descargas y cero likes, sin validación externa ni benchmarks publicados: no hay evidencia independiente de su calidad.
- La información sobre contexto máximo, cuantizaciones y datos de entrenamiento es insuficiente para garantizar un comportamiento estable en producción.

## Enlaces

- HuggingFace: https://huggingface.co/David319193/d3-lite-zils-body
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B

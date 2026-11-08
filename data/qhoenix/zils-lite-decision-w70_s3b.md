# qhoenix/zils-lite-decision-w70_s3b

## Resumen

zils-lite-decision-w70_s3b es un modelo de decisión de 0,8B de parámetros desarrollado por qhoenix dentro del proyecto Zils. Se trata de un fine-tune completo sobre Qwen/Qwen3.5-0.8B, pensado específicamente para tareas de clasificación y toma de decisiones estructuradas en el formato de examen de Zils (ordenar peticiones, marcar problemas o puntuar coincidencias), no para generación de texto abierta. La pipeline declarada en Hugging Face es `feature-extraction` y la librería es `transformers` con código personalizado (`custom_code`).

El modelo es el resultado de un *soup* (promedio ponderado de pesos) de tres fine-tunes propios: s3b al 70%, y s3a y r19 al 15% cada uno. A su vez, cada uno de esos tres fine-tunes partió de un promedio de pesos entre el modelo anterior `qhoenix/zils-lite-decision-v9` (50%) y cuatro cuerpos base Apache-2.0: `vllm-sr/d3-lite`, `internlm/Intern-Decision-0.8B`, `Maincode/Matilda-Decision-v1-Edge` y `zils-ai/jiwo-0.8b-full` (12,5% cada uno), seguido de un fine-tune completo sobre ítems de decisión del formato de examen Zils provenientes de splits públicos de TRAIN.

Su relevancia radica en la propuesta de Zils: entrenar modelos pequeños y desplegables localmente que aprendan a tomar decisiones concretas a partir de ejemplos etiquetados, en lugar de depender de LLM generalistas de gran tamaño. El tamaño del repositorio (1,7 GB) y los 852.985.920 parámetros reales en safetensors lo sitúan en el rango de modelos que caben en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; detalles internos no disponibles) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer de Qwen/Qwen3.5-0.8B, sobre el que se aplica una cadena de promediado de pesos y fine-tune completo. El proceso documentado es el siguiente: primero se construye un *soup* base mezclando `qhoenix/zils-lite-decision-v9` al 50% con cuatro cuerpos Apache-2.0 (`vllm-sr/d3-lite`, `internlm/Intern-Decision-0.8B`, `Maincode/Matilda-Decision-v1-Edge` y `zils-ai/jiwo-0.8b-full`) al 12,5% cada uno. Sobre esa mezcla se realizan tres fine-tunes completos independientes (s3b, s3a y r19) con ítems de decisión en el formato de examen Zils extraídos de splits públicos de TRAIN.

El checkpoint final es un promedio ponderado de esos tres fine-tunes: s3b al 70% y s3a y r19 al 15% cada uno. El autor declara explícitamente que no se usaron semillas de examen, ni splits de validación ni de test durante el entrenamiento. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Toma de decisiones estructuradas: clasificación y ordenación de peticiones, marcado de problemas y puntuación de coincidencias en el formato de examen Zils.
- Extracción de características: la pipeline declarada es `feature-extraction`, por lo que puede emplearse para obtener representaciones vectoriales.
- Fine-tune especializado: entrenado sobre ítems de decisión, no sobre corpus generalistas de generación de texto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en la infraestructura de inferencia de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Triaje de peticiones de soporte: el modelo puede clasificar y priorizar tickets entrantes según categorías aprendidas de ejemplos etiquetados, aprovechando su especialización en ítems de decisión y su tamaño reducido para inferencia de baja latencia.
- Moderación y marcado de contenido: entrenado para "flag problems", encaja en pipelines que deban señalar textos problemáticos con una etiqueta de decisión concreta.
- Puntuación de coincidencias (matching): útil para emparejar candidatos con ofertas, incidencias con resoluciones o consultas con respuestas, devolviendo una puntuación de decisión.
- Clasificación en el borde (edge): con menos de 1.000 millones de parámetros y pesos BF16, puede ejecutarse en GPU de consumo o incluso CPU para decisiones de baja complejidad en dispositivos locales.
- Enrutamiento de consultas en un sistema multi-modelo: como clasificador previo que decida a qué modelo o servicio derivar cada petición, reduciendo coste frente a usar un LLM grande para el enrutamiento.
- Evaluación de decisiones reproducibles: al ser un modelo pequeño y determinista en su formato de examen, sirve para auditorías internas donde se requiere trazabilidad de la decisión.
- Extracción de embeddings para agrupamiento: mediante la pipeline `feature-extraction`, puede generar representaciones para clustering o búsqueda semántica de ítems de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV (no cuantificado en la información disponible).
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos (estimación a partir del recuento de parámetros; no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: en torno a 0,5 GB para pesos (estimación; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: Transformers (librería declarada, con `custom_code`), endpoints compatibles de Hugging Face. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qhoenix/zils-lite-decision-w70_s3b | 852.985.920 | no disponible | Apache-2.0 | Decisión especializada (soup de fine-tunes) |
| qhoenix/zils-lite-decision-w70_13 | no disponible | no disponible | no disponible | Decisión especializada (soup análogo, r13 al 70%) |
| internlm/Intern-Decision-0.8B | no disponible | no disponible | Apache-2.0 (según el autor) | Decisión, cuerpo base del soup |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | Apache-2.0 (según el autor) | Decisión, cuerpo base del soup |
| zils-ai/jiwo-0.8b-full | no disponible | no disponible | Apache-2.0 (según el autor) | Decisión, cuerpo base del soup |

Los cuatro modelos de la comparativa forman parte del linaje de entrenamiento del propio w70_s3b, por lo que la comparación es de familia más que de alternativas independientes. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente sobre ítems de decisión en el formato de examen Zils; su rendimiento fuera de ese formato no está documentado.
- Sin benchmarks publicados: no hay métricas que permitan validar su calidad frente a alternativas.
- Riesgo de sobreajuste al formato: el entrenamiento con fine-tune completo sobre un dataset de examen concreto puede degradar capacidades generales del modelo base.
- Idiomas no declarados: se desconoce si conserva el multilingüismo de Qwen3.5-0.8B o si el fine-tune lo ha restringido.
- Contexto desconocido: no se documenta la longitud máxima de contexto, lo que impide planificar su uso en entradas largas.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de clasificación, el riesgo se traslada a etiquetas incorrectas más que a texto inventado.
- Sesgos: no documentados; al derivar de cuerpos base de terceros, puede heredar sesgos de sus datasets de origen.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los cuatro cuerpos base y de Qwen3.5-0.8B antes de un despliegue en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2026-11-08); no hay evidencia de uso en producción.
- Código personalizado: requiere `trust_remote_code` en Transformers, lo que implica revisar el código remoto antes de ejecutarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-w70_s3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo anterior de la familia: https://huggingface.co/qhoenix/zils-lite-decision
- Variante análoga w70_13: https://huggingface.co/qhoenix/zils-lite-decision-w70_13
- Cuerpo base vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo base internlm/Intern-Decision-0.8B: https://huggingface.co/internlm/Intern-Decision-0.8B
- Cuerpo base Maincode/Matilda-Decision-v1-Edge: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Cuerpo base zils-ai/jiwo-0.8b-full: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Sitio del proyecto Zils: https://zils.ai/
- Página de investigación y benchmarks de Zils: https://zils.ai/model

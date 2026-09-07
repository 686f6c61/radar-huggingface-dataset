# McG-221/Zwielicht-27B-mlx-8Bit

## Resumen

McG-221/Zwielicht-27B-mlx-8Bit es una conversión a formato MLX del modelo Nimbz/Zwielicht-27B, realizada por el usuario McG-221. Se trata de un modelo de 27 mil millones de parámetros (26.893.505.536) cuantizado a 8 bits, orientado a tareas de roleplay, escritura creativa, storytelling y conversación. Según las etiquetas del autor, el modelo es un merge creado con mergekit, basado en la familia Qwen (etiquetas `qwen3_5` y `qwen3.8`) y presenta un comportamiento de baja resistencia a filtros, lo que incluye capacidad de generar contenido NSFW.

El modelo se distribuye bajo licencia Apache 2.0 y está diseñado para ejecutarse en Apple Silicon mediante la librería MLX. La longitud de contexto no está especificada en la información disponible, al igual que los idiomas soportados o el detalle de los datos de entrenamiento. Es una opción interesante para desarrolladores que buscan un modelo conversacional de 27B con enfoque en roleplay y narrativa, pero su escasa documentación y la ausencia de benchmarks públicos limitan la evaluación objetiva de su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (basada en la familia Qwen, según etiquetas del autor: qwen3_5, qwen3.8) |
| Parametros totales | 26.893.505.536 (26,9 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un merge de modelos creado con mergekit, según las etiquetas del autor. El modelo base es Nimbz/Zwielicht-27B, que a su vez está etiquetado como un merge sobre la familia Qwen (qwen3_5, qwen3.8). No se dispone de información sobre la composición exacta de los modelos fusionados ni sobre los datos de entrenamiento, tokens o procesos de alineación como RLHF o DPO.

La conversión a MLX se realizó con la versión 0.31.2 de mlx-lm, transformando los pesos a precisión de 8 bits. No hay información sobre innovaciones técnicas específicas, aunque la etiqueta `thinking` sugiere que el modelo puede generar pasos de razonamiento internos, una característica común en modelos recientes de la familia Qwen. Tampoco se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y narrativo, orientado a roleplay, character-RP y storytelling.
- Escritura creativa: capacidad para desarrollar tramas, diálogos y descripciones en formato de ficción.
- Conversación informal y simulada, con un estilo de baja resistencia (low-refusal) que evita filtros conservadores.
- Generación de contenido NSFW explícito, según las etiquetas del autor.
- Modo `thinking` etiquetado, que podría implicar razonamiento extendido antes de generar la respuesta final.
- No se documenta soporte de tool calling, visión ni audio.

## Casos de uso

- Juegos de rol en línea: el modelo puede interpretar personajes con personalidades definidas y mantener coherencia narrativa a lo largo de sesiones largas, gracias a su enfoque en roleplay y character-RP.
- Creación de ficción interactiva: permite generar historias ramificadas donde las decisiones del usuario alteran el desarrollo de la trama, ideal para prototipos de narrativa no lineal.
- Asistente de escritura creativa: ayuda a escritores a generar borradores de diálogos, descripciones de escenas y giros argumentales, aprovechando su capacidad de storytelling.
- Chat de entretenimiento: puede usarse como compañero conversacional en aplicaciones de ocio, con un tono informal y sin restricciones de contenido.
- Simulación de personajes históricos o ficticios: para aplicaciones educativas o de entretenimiento, el modelo puede adoptar voces y estilos de personajes concretos.
- Generación de contenido NSFW para audiencias adultas: gracias a su baja resistencia, puede producir material explícito en entornos donde esto sea aceptable.
- Prototipado de agentes conversacionales: el modo `thinking` etiquetado podría permitir razonamiento previo a la respuesta, útil para experimentos con agentes que necesitan planificar sus mensajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 8 bits ocupan aproximadamente 27 GB. Con el overhead de activaciones y cache KV, se recomienda un mínimo de 32 GB de memoria para inferencia estable.
- GPU recomendadas: al ser un modelo MLX, está optimizado para Apple Silicon. Se recomienda un Mac con al menos 32 GB de memoria unificada (M1/M2/M3/M4). En hardware NVIDIA, se necesitaría una GPU con más de 32 GB de VRAM, como una A100 40GB o superior.
- No es adecuado para GPUs de consumo con 16 o 24 GB de VRAM (RTX 4060, 4070, 4090) sin técnicas adicionales de offloading o cuantizaciones más agresivas.
- Opciones de despliegue: el modelo está pensado para usarse con la librería `mlx-lm` en Python. No se documenta compatibilidad con vLLM, llama.cpp ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Licencia | Contexto | Benchmarks |
|---|---|---|---|---|---|---|
| McG-221/Zwielicht-27B-mlx-8Bit | 26,9B | 8-bit MLX | Safetensors | Apache 2.0 | No disponible | No disponible |
| Nimbz/Zwielicht-27B (base) | 26,9B | No disponible | No disponible | Apache 2.0 | No disponible | No disponible |
| McG-221/XORTRON-NXTXPRT9PRO-27B-mlx-8Bit | 27B | 8-bit MLX | Safetensors | Apache 2.0 | No disponible | No disponible |

Nota: los dos primeros modelos son el mismo merge en distintos formatos (MLX 8-bit y versión original). El tercero es otro modelo del mismo autor, también de 27B, con etiquetas como `uncensored`, `abliterated` y `toxic`, lo que indica un enfoque similar de baja censura.

## Limitaciones y advertencias

- Contenido explícito: al ser un modelo con `low-refusal` y etiquetas NSFW, puede generar material sexual o violento sin restricciones, lo que lo hace inadecuado para entornos sin control de contenido.
- Sesgos no documentados: al no haber información sobre los datos de entrenamiento ni el proceso de merge, no es posible evaluar sesgos de género, raza o cultura.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información factual incorrecta, especialmente en temas no relacionados con su dominio de roleplay.
- Sin benchmarks públicos: no hay datos objetivos de rendimiento en tareas como MMLU, HumanEval o GSM8K, por lo que su calidad técnica no puede compararse con modelos más documentados.
- Contexto desconocido: al no conocerse la longitud de contexto, no se recomienda para aplicaciones que requieran ventanas largas, como análisis de documentos extensos.
- Pérdida de precisión: la cuantización a 8 bits puede degradar ligeramente la calidad de las respuestas en comparación con la versión original sin cuantizar.
- Documentación limitada: la model card es muy breve y no incluye instrucciones de uso más allá de un ejemplo básico con `mlx-lm`.

## Enlaces

- https://huggingface.co/McG-221/Zwielicht-27B-mlx-8Bit
- https://huggingface.co/Nimbz/Zwielicht-27B
- https://huggingface.co/McG-221/XORTRON-NXTXPRT9PRO-27B-mlx-8Bit

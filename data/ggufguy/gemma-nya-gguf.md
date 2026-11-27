# GGUFGuy/gemma-nya-gguf

## Resumen

gemma-nya-gguf es una conversión al formato GGUF del modelo Gemma 3 1B instruct (gemma-3-1b-it), publicada por el usuario GGUFGuy. El repositorio no entrena ni modifica el modelo original: se limita a empaquetar los pesos de Gemma 3 de 1B parámetros en cuantizaciones compatibles con llama.cpp, desde BF16 hasta IQ2_XXS. La relevancia es práctica: permite ejecutar un modelo de la familia Gemma 3 en hardware muy modesto mediante llama.cpp y herramientas derivadas.

El modelo base pertenece a la familia Gemma 3 de Google DeepMind, una arquitectura transformer con atención multimodal (texto e imagen) en los modelos mayores; en el caso de 1B el pipeline declarado no está disponible en la ficha, aunque el autor incluye instrucciones para `llama-mtmd-cli` (ruta multimodal de llama.cpp). El tamaño de 999.885.952 parámetros lo sitúa como un modelo pequeño, orientado a despliegue en local, prototipado rápido y tareas conversacionales ligeras.

La ficha del repositorio es extremadamente escasa: no declara licencia, idiomas, pipeline ni resultados de evaluación. Cualquier evaluación de calidad debe remitirse a la documentación oficial de Gemma 3, no a este repositorio, que solo redistribuye pesos convertidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3; tag `gemma3_text` en Hugging Face) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, F16, IQ2_M, IQ2_XXS, IQ3_XXS, IQ4_XS, Q2_K_L, Q3_K_M, Q4_0, Q4_1, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (14 variantes de cuantizacion) |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento en la documentación del repositorio. El autor indica únicamente que la conversión a GGUF se realizó con Unsloth. El modelo base es Gemma 3 1B instruct, de Google DeepMind, pero este repositorio no aporta detalles sobre número de tokens, composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento.

La arquitectura es un transformer decoder-only según el tag `gemma3_text`. No hay innovaciones técnicas documentadas en este repositorio más allá del propio proceso de cuantización: se ofrecen variantes de 2 a 8 bits, incluyendo las cuantizaciones IQ (importancia) de llama.cpp, que permiten reducir el tamaño manteniendo cierta fidelidad en capas sensibles. El repo ocupa 13,4 GB en total por acumular todas las variantes.

## Capacidades

- Generación de texto conversacional en formato instruct (sufijo `-it` del modelo base).
- Conversación multi-turno, según el tag `conversational`.
- Ejecución local vía llama.cpp con `llama-cli` y flag `--jinja` para plantillas de chat.
- Ruta multimodal potencial mediante `llama-mtmd-cli`, según las instrucciones del autor; no confirmada en la ficha.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No hay información sobre tool calling, agentes, matemáticas, código ni capacidades multilingües específicas en la documentación disponible.

## Casos de uso

- Prototipado local sin GPU dedicada: las variantes IQ2_XXS e IQ3_XXS permiten ejecutar el modelo en CPU con poca RAM, útil para pruebas de integración antes de escalar a modelos mayores.
- Asistentes conversacionales embebidos: con ~1B parámetros y cuantización Q4_K_M, cabe en dispositivos de borde y sirve para respuestas de baja latencia en dominios acotados.
- Generación de texto en pipelines offline: integrable en scripts de procesamiento por lotes donde no se requiere máxima calidad sino coste cero de API.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 14 variantes, lo que facilita medir la degradación de calidad entre Q2 y Q8 en un mismo modelo.
- Educación y experimentación: modelo pequeño y de pesos abiertos en formato GGUF para estudiar el comportamiento de transformers en entornos docentes.
- Pruebas de plantillas de chat Jinja: el flag `--jinja` permite validar plantillas de prompt antes de migrar a modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: desde ~0,5-1 GB para IQ2_XXS hasta ~2 GB para Q8_0 (estimación por el número de parámetros; no confirmada en la ficha).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por formato GGUF también compatible con Ollama y otros runners de llama.cpp.
- vLLM y TGI no soportan GGUF de forma nativa completa; se requeriría el modelo en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| gemma-nya-gguf (este) | ~1B | no disponible | no disponible | GGUF |
| Gemma 3 1B (original) | ~1B | no disponible | Gemma Terms (según Google) | safetensors |
| Llama 3.2 1B | ~1,2B | 128K (según Meta) | Llama License | safetensors/GGUF |
| Qwen2.5 1.5B | ~1,5B | 32K (según Alibaba) | Apache 2.0 | safetensors/GGUF |

Los datos de los modelos comparables provienen de sus respectivas documentaciones públicas y no de este repositorio; verificar antes de usar en producción.

## Limitaciones y advertencias

- La ficha no declara licencia. El modelo base Gemma 3 está sujeto a los términos de Google; la redistribución en GGUF debe cumplir esa licencia, que no se cita aquí.
- Sin información sobre idiomas soportados: no asumir buen rendimiento en castellano sin evaluarlo.
- Sin benchmarks publicados: la calidad real de cada cuantización es desconocida.
- Riesgo de alucinación inherente a modelos de ~1B parámetros, especialmente en IQ2/IQ3.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en producción.
- La ruta multimodal (`llama-mtmd-cli`) no está confirmada para esta variante de 1B.
- Repositorio de terceros, no oficial de Google: posibles desviaciones en la conversión no documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/GGUFGuy/gemma-nya-gguf
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runner GGUF): no incluido en la información proporcionada
- Documentación oficial de Gemma 3: no incluida en la información proporcionada

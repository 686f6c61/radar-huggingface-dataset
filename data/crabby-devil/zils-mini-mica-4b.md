# crabby-devil/zils-mini-mica-4b

## Resumen

Zils mini Mica 4B es una redistribución sin modificaciones de los pesos en bf16 del modelo sky7350/Mica-v0.5-4B, un ajuste fino orientado a toma de decisiones sobre la base Qwen/Qwen3.5-4B. El repositorio lo publica el usuario crabby-devil como "cuerpo" (body) para el pool de modelos `d3-mini` de Zils, un subred de Bittensor (subnet 127). No se trata, por tanto, de un modelo nuevo: los dos shards bf16, el índice de shards y el `config.json` son idénticos byte a byte a la revisión `f87da85ba6f53c0a67c8b9407a03d2b18274c24a` del modelo de origen.

La relevancia es principalmente de infraestructura y trazabilidad: el repositorio documenta qué hotkey de Bittensor ha comprometido este cuerpo mediante el archivo `zils-owner.json`, lo que encaja en flujos de trabajo de modelos descentralizados donde la procedencia y la reproducibilidad de los pesos importan tanto como el rendimiento. El modelo conserva la licencia Apache-2.0 del original.

Con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) y un pipeline declarado de image-text-to-text, hereda las capacidades multimodales y de razonamiento de la familia Qwen3.5 en un tamaño que cabe en GPU de consumo con cuantización. La información pública disponible sobre el ajuste fino concreto (datos, metodología, benchmarks) es muy limitada, por lo que esta ficha marca explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; el autor menciona una copia int8 en el repositorio de origen que no se incluye en esta redistribución. Otras cuantizaciones (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, dos shards) con índice de shards y config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parámetros, sobre el que se ha aplicado un ajuste fino orientado a "decision-model" según las etiquetas del repositorio. El modelo base intermedio, Mica-v0.5-4B, es el resultado de ese ajuste fino; este repositorio no añade entrenamiento adicional, sino que redistribuye los pesos tal cual.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO en el ajuste fino de Mica-v0.5-4B. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las que pueda aportar la arquitectura Qwen3.5 original, cuyos detalles no se recogen en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que sugiere capacidades de visión y respuesta multimodal.
- Orientación a toma de decisiones (etiqueta decision-model), presumiblemente mediante formato de salida estructurado o selección entre opciones; la mecánica exacta no está documentada.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Evaluación de modelos en pools descentralizados: el modelo sirve como cuerpo verificable para el pool `d3-mini` de Zils (Bittensor subnet 127), permitiendo a los participantes comparar y seleccionar pesos con procedencia trazable mediante `zils-owner.json`.
- Reproducibilidad de experimentos: al ser una copia byte-idéntica de una revisión concreta, permite replicar resultados de Mica-v0.5-4B sin depender de que el repositorio original permanezca disponible o sin cambios.
- Clasificación y enrutamiento de decisiones: dado su ajuste orientado a decisiones, puede emplearse para tareas de selección entre alternativas, etiquetado o puntuación, siempre que se valide el formato de salida esperado.
- Prototipado multimodal en local: con ~4,66 mil millones de parámetros en bf16, es viable en GPU de consumo con cuantización, lo que facilita pruebas de pipelines image-text-to-text sin infraestructura de datacenter.
- Base para ajustes finos posteriores: al estar en Apache-2.0 y en safetensors estándar, puede reentrenarse o adaptarse (LoRA, QLoRA) para dominios específicos.
- Investigación sobre procedencia y auditoría de modelos: el repositorio ejemplifica un patrón de publicación con metadatos de propiedad (hotkey) útil para estudiar trazabilidad en ecosistemas descentralizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos (coincide con el tamaño del repositorio), más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización int8: aproximadamente 4,7-5 GB para pesos, más overhead; viable en GPU de 8 GB con contexto limitado.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para bf16 sin restricciones; RTX 3090/4080 para bf16 con contexto ajustado; GPUs de 8-12 GB para cuantizaciones de 8 bits o inferiores.
- Cabe en GPU de consumo: sí, en modelos como RTX 4090, 4080, 3090 o 4070 Ti Super con la cuantización adecuada.
- Opciones de despliegue: transformers (librería declarada), además de vLLM, TGI, llama.cpp u Ollama si se generan los formatos correspondientes (no publicados en este repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zils mini Mica 4B (este) | ~4,66 B | No disponible | Apache-2.0 | Hugging Face, pesos bf16 |
| sky7350/Mica-v0.5-4B | ~4,66 B | No disponible | Apache-2.0 | Hugging Face (origen) |
| Qwen/Qwen3.5-4B | ~4 B (según denominación) | No disponible | No disponible en la información | Hugging Face (base) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribución sin modificaciones; cualquier limitación del modelo de origen (sky7350/Mica-v0.5-4B) se hereda íntegramente.
- Ausencia de documentación sobre datos de entrenamiento, sesgos y evaluación: imposible caracterizar sesgos conocidos o riesgo de alucinación con rigor.
- Contexto e idiomas no documentados: no se puede garantizar comportamiento en ventanas largas ni en castellano.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- El ajuste "decision-model" no especifica formato de salida ni métricas; requiere validación propia antes de integrarlo en pipelines.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del ecosistema Bittensor/Zils si se participa en el pool `d3-mini`.
- La copia int8 mencionada en el origen no está incluida; quien la necesite debe acudir al repositorio original.
- Los metadatos de fecha del repositorio (creado en 2026) deben tratarse con cautela; verificar la integridad de los shards antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/crabby-devil/zils-mini-mica-4b
- Modelo de origen: https://huggingface.co/sky7350/Mica-v0.5-4B
- Revisión de origen: `f87da85ba6f53c0a67c8b9407a03d2b18274c24a`
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ecosistema Zils / Bittensor subnet 127: no disponible en la información proporcionada.

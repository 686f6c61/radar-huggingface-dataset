# ronke21/rlcl-Qwen2.5-1.5B-Instruct-math-s123

## Resumen

El modelo `ronke21/rlcl-Qwen2.5-1.5B-Instruct-math-s123` es un ajuste fino del modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario ronke21 en Hugging Face. Por los tags asociados (`rlcl`, `forgetting`, `lora-merged`), se trata de un experimento de investigación centrado en el olvido catastrófico (catastrophic forgetting) durante el ajuste fino supervisado, probablemente aplicando una técnica de regularización o currículo de aprendizaje (RLCL) sobre datos matemáticos, con la semilla 123. Los pesos resultantes de LoRA se han fusionado en el modelo base, generando un checkpoint completo de tipo safetensors.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales y un tamaño de repositorio de 3,1 GB (compatible con pesos en bf16/fp16). Al derivar del Qwen2.5-1.5B-Instruct, hereda el tokenizador, la ventana de contexto y las capacidades conversacionales del modelo original, aunque el ajuste específico sobre matemáticas puede haber alterado su comportamiento general.

Su relevancia es limitada y de nicho: no es un modelo de producción, sino un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, acceso restringido (gated) y sin licencia declarada. Resulta útil como referencia para estudiar técnicas de mitigación del olvido catastrófico en modelos pequeños, pero no se recomienda su uso directo en entornos productivos sin una evaluación exhaustiva previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles (heredados del modelo base: principalmente ingles y chino, con soporte multilingue parcial) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y atención con GQA (grouped-query attention). El modelo parte de un checkpoint preentrenado e instruido por Qwen, sobre el que se aplica un ajuste fino supervisado con LoRA (según el tag `lora-merged`), posteriormente fusionado en los pesos base. El tag `rlcl` sugiere el uso de una técnica de regularización o currículo de aprendizaje (posiblemente "Reinforcement Learning with Curriculum Learning" o similar) orientada a mitigar el olvido catastrófico, y `forgetting` confirma que el objetivo del experimento es estudiar precisamente ese fenómeno.

El ajuste se ha realizado sobre datos de matemáticas (tag `math`), con la semilla 123. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO adicional ni hiperparámetros del ajuste. Tampoco se documentan innovaciones técnicas más allá de la fusión de LoRA y el posible esquema RLCL. Al ser un experimento de un autor individual sin paper asociado, la trazabilidad metodológica es mínima.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento matemático y resolución de problemas aritméticos y algebraicos, presumiblemente reforzado por el ajuste específico.
- Generación de código básico y explicaciones técnicas, en línea con las capacidades del modelo base.
- Soporte de tool calling / function calling: no confirmado para este ajuste, aunque el modelo base Qwen2.5 lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas tras el ajuste.
- Capacidades multilingües: no documentadas; se espera un subconjunto de las del modelo base.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de referencia para comparar cómo un ajuste fino matemático afecta al rendimiento general del Qwen2.5-1.5B-Instruct en tareas no matemáticas.
- Evaluación de técnicas de fusión LoRA: útil para estudiar el impacto de fusionar adaptadores LoRA en un modelo pequeño y su efecto en la estabilidad de los pesos.
- Reproducción de experimentos académicos: con la semilla 123 y el tag `rlcl`, permite intentar reproducir resultados de mitigación de olvido en entornos controlados.
- Prototipado educativo de ajuste fino: adecuado para cursos o tutoriales que muestren el pipeline completo de SFT + LoRA + merge en modelos de 1,5B.
- Pruebas de regresión en pipelines de evaluación: puede integrarse como checkpoint de control en suites que midan degradación de capacidades tras ajustes especializados.
- Experimentos de alineación y currículo: el tag `rlcl` sugiere su uso en estudios sobre ordenación de datos y regularización durante el entrenamiento.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales sin una evaluación previa, dada la ausencia de licencia y documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-5 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para cuantización 4/8 bits, cabe en GPUs de 4 GB o incluso en CPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 24 GB y similares.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles; al ser un modelo de 1,5B, se espera un throughput alto en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-Instruct-math-s123 | 1,54B | No disponible | No disponible | Gated en HF | Ajuste experimental con LoRA fusionado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Publico en HF | Modelo base, instruido y multilingue |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,54B | 4.096 tokens (tipico en variantes math) | Apache 2.0 | Publico en HF | Especializado en matematicas por Qwen |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Publico en HF | Alternativa pequena instruida |

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; el acceso es restringido (gated) y requiere aceptar condiciones en Hugging Face.
- Sin documentación de entrenamiento: no se especifican dataset, hiperparámetros, número de tokens ni metodología RLCL, lo que impide evaluar la reproducibilidad.
- Riesgo de olvido catastrófico: el propio tag `forgetting` indica que el ajuste puede haber degradado capacidades generales del modelo base (conversación, código, multilingüe).
- Riesgo de alucinación: como todo modelo de 1,5B, tiende a inventar hechos, especialmente en dominios fuera de las matemáticas.
- Idiomas no documentados: no se confirma el soporte multilingüe real tras el ajuste; puede haber regresión en idiomas distintos del inglés.
- Contexto no confirmado: no se garantiza que mantenga los 32.768 tokens del modelo base; el ajuste podría haber alterado el comportamiento en contextos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en matemáticas ni de degradación en otras tareas.
- 0 descargas y 0 likes: sin validación por parte de la comunidad; no se recomienda su uso en producción sin evaluación propia.
- Modelo de nicho: pensado para investigación, no para despliegues comerciales ni aplicaciones críticas.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-Instruct-math-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://huggingface.co/docs/text-generation-inference

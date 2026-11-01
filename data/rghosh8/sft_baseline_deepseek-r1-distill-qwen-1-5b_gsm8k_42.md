# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_42

## Resumen

SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_42 es un ajuste fino supervisado (SFT) del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, publicado por el usuario rghosh8 en HuggingFace. Se trata de un checkpoint experimental de investigación, no de un modelo listo para producción: su nombre indica que es una línea base (baseline) de SFT entrenada sobre el conjunto de datos GSM8K con la semilla 42, presumiblemente como referencia para comparar contra otras técnicas de ajuste (RL, DPO, etc.) sobre el mismo modelo base.

El modelo hereda la arquitectura Qwen2 del base, un transformer decoder-only denso de aproximadamente 1.777 millones de parámetros (1,78 mil millones), destilado a partir de DeepSeek-R1. El objetivo del ajuste es reforzar el razonamiento matemático de nivel escolar, ya que GSM8K es un benchmark de problemas aritméticos de varios pasos. Es relevante ahora como ejemplo reproducible de pipeline SFT con TRL sobre modelos de razonamiento pequeños, útil para investigadores que quieran replicar experimentos o comparar metodologías de post-entrenamiento.

La información publicada es mínima: la model card generada automáticamente por TRL no incluye detalles sobre hiperparámetros, composición del dataset, licencia ni idiomas. El repositorio ocupa 3,6 GB en safetensors y no registra descargas ni interacciones, lo que confirma su carácter de artefacto de investigación más que de modelo distribuido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parámetros totales | 1.777.088.000 (1,78 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del base DeepSeek-R1-Distill-Qwen-1.5B; el modelo base soporta 32.768 tokens, dato no confirmado en la card de este checkpoint) |
| Tipos de cuantización | No disponible en la card; al ser safetensors en fp32/bf16, es cuantizable a GGUF, AWQ, GPTQ con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Librería | transformers (entrenado con TRL 1.15.0) |
| Tamaño del repositorio | 3,6 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por supervisión (SFT) del checkpoint DeepSeek-R1-Distill-Qwen-1.5B, que a su vez es un Qwen2.5-1.5B destilado por DeepSeek a partir de las trazas de razonamiento de DeepSeek-R1. La arquitectura subyacente es un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El entrenamiento se realizó con TRL 1.15.0 sobre Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3.

El nombre del checkpoint indica que el dataset de SFT es GSM8K y que se usó la semilla 42, lo que sugiere un experimento controlado y reproducible de línea base. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros (learning rate, épocas, batch size) ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documenta ninguna innovación técnica más allá del propio pipeline SFT de TRL. El formato de conversación es "conversational", lo que implica que el modelo espera mensajes con roles (user/assistant) y fue entrenado con plantilla de chat.

## Capacidades

- Generación de texto conversacional con plantilla de chat (roles user/assistant).
- Razonamiento matemático de nivel escolar, reforzado específicamente mediante SFT sobre GSM8K.
- Razonamiento multi-paso con cadenas de pensamiento, heredado del proceso de destilación de DeepSeek-R1.
- Generación de código y texto general, como capacidades heredadas del modelo base Qwen2.5-1.5B.
- Soporte de tool calling: no documentado en la card de este checkpoint (el base Qwen2.5 lo soporta, pero no se confirma aquí).
- Capacidades de agente y multi-step reasoning: no documentadas explícitamente; la herencia del base sugiere razonamiento por pasos, pero sin garantías.
- Capacidades multilingües: no documentadas.
- Modo thinking explícito: no documentado en este checkpoint (el base DeepSeek-R1-Distill usa etiquetas de razonamiento, pero el SFT sobre GSM8K puede haber alterado el formato).

## Casos de uso

- Investigación en post-entrenamiento: sirve como línea base reproducible (semilla 42) para comparar SFT contra RL, DPO u otras técnicas sobre el mismo modelo base en tareas de matemáticas.
- Evaluación de pipelines TRL: al estar entrenado con TRL 1.15.0 y versiones concretas de Transformers y PyTorch, es útil para validar la reproducibilidad de recetas de SFT en entornos con esas versiones.
- Generación de soluciones matemáticas paso a paso: el ajuste sobre GSM8K lo hace adecuado para prototipos de tutores automáticos que explican problemas aritméticos de primaria y secundaria.
- Benchmarking de modelos pequeños de razonamiento: con 1,78 B de parámetros, permite estudiar el equilibrio entre tamaño y rendimiento en tareas de razonamiento matemático frente a modelos mayores.
- Experimentos de destilación: permite analizar cómo un SFT específico sobre GSM8K modifica el comportamiento de un modelo destilado de R1, comparando trazas de razonamiento antes y después del ajuste.
- Docencia y formación: como ejemplo didáctico de cómo se construye y publica un checkpoint SFT con TRL, incluyendo la plantilla de chat y el formato conversational.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud en GSM8K, MMLU, HumanEval ni otras evaluaciones, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 5-7 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos, con un total de 3-4 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 1,1-1,3 GB de pesos, con un total de 2-3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) para bf16; GPUs de datacenter (A100, H100) solo necesarias para entrenamiento o serving de alto throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6-8 GB de VRAM, especialmente cuantizado.
- Opciones de despliegue: transformers (pipeline text-generation), vLLM (soporte Qwen2), llama.cpp/Ollama (previa conversión a GGUF), Text Generation Inference (el repo tiene tag text-generation-inference y endpoints_compatible).
- Latencia y throughput: no disponibles; al ser un modelo de 1,78 B, se espera alta velocidad en GPU de consumo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (SFT GSM8K seed 42) | 1,78 B | No disponible | No disponible | HuggingFace, 0 descargas | Línea base experimental de investigación |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 tokens (según modelo base) | MIT (según el modelo base) | HuggingFace, ampliamente usado | Modelo base sin el SFT específico de GSM8K |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | HuggingFace, muy popular | Alternativa generalista con tool calling documentado |
| Qwen/Qwen2.5-Math-1.5B-Instruct | 1,54 B | 4.096 tokens | Apache 2.0 | HuggingFace | Especializado en matemáticas, comparable en propósito |

La comparación con el modelo base es la más directa: este checkpoint añade un SFT sobre GSM8K con semilla fija, pero carece de la documentación, licencia clara y adopción del original. Frente a Qwen2.5-Math-1.5B-Instruct, ambos apuntan a matemáticas, pero el de Qwen tiene licencia Apache 2.0 explícita y contexto documentado.

## Limitaciones y advertencias

- Licencia no especificada: la card indica "licence: license" sin detallar términos, lo que impide confirmar el uso comercial. Hay que remitirse a la licencia del modelo base (MIT en DeepSeek-R1-Distill-Qwen-1.5B) y verificar con el autor.
- Sin datos de benchmarks: no hay evidencia publicada de que el SFT mejore GSM8K respecto al base; el nombre sugiere una línea base, no necesariamente una mejora.
- Modelo de investigación: 0 descargas y 0 likes, sin validación por la comunidad; no recomendado para producción sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos de 1,78 B, especialmente en problemas matemáticos fuera de la distribución de GSM8K.
- Sesgos: no documentados; hereda los sesgos del corpus de entrenamiento del base (no especificado).
- Limitaciones de contexto e idioma: no documentadas; el SFT sobre GSM8K (mayoritariamente en inglés) puede haber degradado capacidades multilingües del base.
- Formato de chat: al ser un checkpoint "conversational", requiere usar la plantilla de chat correcta; un uso incorrecto puede degradar la calidad de las respuestas.
- Sobrespecialización: el ajuste en GSM8K puede reducir el rendimiento en tareas generales o de código respecto al modelo base.
- Versiones de dependencias muy recientes (Transformers 5.17.0, PyTorch 2.13.0): puede requerir entornos actualizados para cargarse correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_42
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DeepSeek-R1: no disponible en la información proporcionada
- Blog o demo del autor: no disponible

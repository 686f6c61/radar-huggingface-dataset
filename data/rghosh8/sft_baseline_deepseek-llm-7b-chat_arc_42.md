# rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_42

## Resumen

`rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_42` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/deepseek-llm-7b-chat`, publicado por el usuario rghosh8 en Hugging Face. Se trata de un artefacto experimental de investigación, generado con la librería TRL (versión 1.15.0) y la etiqueta `generated_from_trainer`, cuyo propósito aparente es servir como línea base (baseline) de SFT sobre el dataset ARC con semilla 42. No es un modelo de producción ni un lanzamiento oficial de DeepSeek.

El modelo hereda la arquitectura del DeepSeek LLM 7B original: un transformer decoder-only denso con 6.910.365.696 parámetros, pesos en safetensors y un repositorio de 13,8 GB. El nombre del checkpoint (`arc_seed42`) sugiere entrenamiento sobre el benchmark ARC (AI2 Reasoning Challenge), probablemente para estudiar dinámicas de sobreajuste o comparativas de métodos de ajuste, no para uso general.

Su relevancia es limitada y acotada al ámbito de reproducibilidad de experimentos: no hay model card detallada, no se declaran idiomas, licencia ni datos de entrenamiento, y las métricas de descargas y likes son cero. Debe tratarse como un checkpoint de investigación reproducible, no como un modelo listo para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de DeepSeek LLM 7B) |
| Parámetros totales | 6.910.365.696 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del DeepSeek LLM 7B Chat: un transformer decoder-only con normalización RMSNorm, atención multi-cabeza con RoPE y sin mezcla de expertos. El autor no documenta modificaciones estructurales sobre el modelo base; el checkpoint es un ajuste fino de pesos completos.

El entrenamiento se realizó mediante SFT con TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3. El nombre del checkpoint indica entrenamiento sobre el dataset ARC con semilla 42, pero no se especifican el número de tokens, la composición del dataset, hiperparámetros (learning rate, épocas, batch size), ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base chat.
- Razonamiento y respuesta a preguntas, presumiblemente reforzado en el dominio ARC por el ajuste fino, aunque sin métricas publicadas que lo confirmen.
- Soporte de tool calling / function calling: no documentado en este checkpoint; el modelo base DeepSeek LLM 7B Chat no lo declara de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Formato de prompt conversacional con roles `user`/`assistant`, tal como muestra el ejemplo de la model card.

## Casos de uso

- Reproducción de experimentos de SFT: el checkpoint sirve para replicar la línea base de ajuste sobre ARC con semilla 42 y comparar contra variantes del mismo autor.
- Estudio de sobreajuste en datasets pequeños: al estar entrenado sobre ARC, permite analizar cómo un modelo de 7B pierde generalidad cuando se ajusta con SFT sobre un corpus acotado.
- Evaluación comparativa de métodos de ajuste: útil como referencia frente a otras técnicas (LoRA, DPO, RLHF) aplicadas al mismo modelo base.
- Investigación sobre contaminación de benchmarks: permite medir hasta qué punto el ajuste directo sobre ARC infla las métricas de ese benchmark.
- Docencia y formación: ejemplo práctico de pipeline TRL end-to-end para enseñar SFT a estudiantes de posgrado.
- Auditoría de artefactos de investigación: caso de estudio sobre model cards incompletas y riesgos de publicar checkpoints sin licencia ni datos declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14 GB solo para pesos, más overhead de activaciones y KV cache (16-20 GB en la práctica).
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantización de 4 bits (si se genera con herramientas externas): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) suficiente para FP16 en una sola GPU.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización 4-bit, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (el modelo declara `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_42 | 6,91 B | no disponible | no disponible | Hugging Face (0 descargas) |
| deepseek-ai/deepseek-llm-7b-chat (base) | 6,91 B | 4.096 tokens (según model card oficial de DeepSeek) | DeepSeek Model License (uso comercial con restricciones) | Hugging Face, ampliamente descargado |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente adoptado |

La comparativa se limita a parámetros, contexto y licencia porque el checkpoint no publica métricas de rendimiento. Frente a Mistral-7B y Llama-3-8B, este modelo carece de licencia clara, contexto declarado y evaluación, lo que lo hace no apto para producción frente a esas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: la model card incluye `licence: license` sin texto, lo que impide determinar si el uso comercial está permitido. Además, hereda las restricciones de la licencia del modelo base DeepSeek LLM.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base o si el SFT sobre ARC lo ha degradado.
- Riesgo elevado de sobreajuste: el ajuste sobre ARC con semilla 42 sugiere un corpus pequeño; es probable que el modelo haya perdido capacidades generales del base.
- Riesgo de alucinación: no hay evaluación que lo cuantifique; en un modelo de 7B ajustado sobre un dataset de razonamiento, la tasa de alucinación puede ser alta fuera del dominio ARC.
- Sin datos de entrenamiento documentados: no se puede auditar la composición del dataset, el número de tokens ni los hiperparámetros.
- Sin benchmarks publicados: imposible validar su rendimiento frente al modelo base o a alternativas.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay evidencia de uso en producción ni de validación independiente.
- Versiones de dependencias muy recientes (Transformers 5.17.0, PyTorch 2.13.0): pueden requerir entornos específicos y no estar soportadas por todas las herramientas de despliegue.
- Contexto no declarado: aunque el modelo base soporta 4.096 tokens, no se confirma que el ajuste fino lo preserve.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_42
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
- Repositorio TRL: https://github.com/huggingface/trl
- Dataset ARC (referencia): https://allenai.org/data/arc

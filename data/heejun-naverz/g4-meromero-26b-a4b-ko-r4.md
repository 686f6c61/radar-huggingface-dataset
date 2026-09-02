# heejun-naverz/G4-MeroMero-26B-A4B-ko-R4

## Resumen

G4-MeroMero-26B-A4B-ko-R4 es un modelo de lenguaje especializado en roleplay y chat de personajes en coreano, desarrollado por heejun-naverz como una iteración de la serie "MeroMero" basada en el modelo base zerofata/G4-MeroMero-26B-A4B. Este base es un modelo de arquitectura Gemma4 MoE de 26 000 millones de parámetros totales con 4 000 millones activos, licenciado bajo Apache 2.0. La versión R4 aplica un fine-tuning con LoRA sobre el base, utilizando un dataset de registros reales de interacción de modelos frontier (gpt-5.6-terra y sol) para corregir los defectos de la versión anterior R3, que sufría colapso en el formato de salida con entradas cortas.

El modelo está diseñado para generar respuestas estructuradas en formato de narración y diálogo de personajes, con un formato de salida normalizado al 100% en los datos de entrenamiento. Es un modelo bf16 de 49 GB que requiere hardware de gama alta para inferencia, aunque se puede cuantizar a GGUF para entornos más ligeros. Su relevancia radica en ofrecer una alternativa open source de alta calidad para aplicaciones de character-chat y roleplay en coreano, un ámbito donde los modelos abiertos suelen tener menos cobertura idiomática.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 MoE (Mixture of Experts) |
| Parametros totales | 25 805 933 872 (25.8B) |
| Parametros activos | 4B (aproximado, según model card del base) |
| Longitud de contexto | 8192 tokens (seq de entrenamiento; el base soporta más, pero el fine-tuning usa 8192) |
| Tipos de cuantizacion | bf16 original; se recomienda GGUF para cuantización (GPTQ/AWQ ineficaces por tensores fused) |
| Idiomas soportados | Coreano (principal), aunque el base puede tener capacidades multilingües, el fine-tuning está orientado a coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma4 MoE, que combina un transformer con capas de mezcla de expertos. Según la información disponible, los expertos están fusionados en tensores que representan el 88% de los parámetros totales, lo que impide la cuantización eficiente con métodos como GPTQ o AWQ (W4A16). El fine-tuning se realizó con LoRA sobre las capas de atención (query, key, value, output) con rango r=16 y alpha=32, durante 2 épocas, sobre un dataset de 2840 ejemplos de conversaciones de roleplay en coreano. El dataset proviene de registros reales de interacción con modelos frontier (gpt-5.6-terra y sol), extraídos del dataset público heejun-naverz/charchat-ko-frontier-sft. El entrenamiento se llevó a cabo en 2 GPUs A100 en bf16 con una longitud de secuencia de 8192 tokens. La versión R4 incluye un 100% de normalización del formato de salida (con etiquetas `나레이션:` para narración y `인물명:` para diálogo), así como la inclusión sistemática de instrucciones de sistema y la exclusión de respuestas truncadas.

## Capacidades

- Generación de texto en coreano con formato estructurado de roleplay: narración y diálogo de personajes.
- Chat de personajes (character-chat) con contexto de hasta 8192 tokens, suficiente para mantener conversaciones largas y coherentes.
- Soporte de formato de salida estricto: `나레이션:` para narración, `인물명:` para diálogo y `인물명: *acción* diálogo` para combinar acción y habla.
- Capacidad de seguir instrucciones de sistema (system prompts) para definir el personaje y el escenario.
- Modelo base con capacidades generales de razonamiento y generación de texto (heredadas de Gemma4), aunque el fine-tuning está especializado en roleplay.
- No se indica soporte explícito de tool calling, agentes ni capacidades multimodales en la información disponible.

## Casos de uso

- **Roleplay interactivo en coreano**: el modelo es ideal para aplicaciones de chat con personajes ficticios, donde el usuario interactúa con un personaje definido por un system prompt. El formato de salida normalizado garantiza respuestas consistentes y legibles.
- **Creación de narrativas interactivas**: escritores y desarrolladores de juegos de texto pueden usar el modelo para generar historias ramificadas donde el jugador escribe acciones y el modelo responde con narración y diálogo de personajes.
- **Asistentes de escritura creativa**: el modelo puede ayudar a generar diálogos realistas entre personajes, útil para guionistas o novelistas que trabajan en coreano.
- **Chatbots de entretenimiento**: integración en plataformas de entretenimiento (apps de chat, redes sociales) donde los usuarios interactúan con personajes virtuales.
- **Prototipado de juegos de rol**: desarrolladores de juegos pueden usar el modelo para generar rápidamente diálogos y reacciones de NPC durante la fase de prototipado.
- **Traducción de contenido de roleplay**: aunque el modelo está orientado a coreano, su base multilingüe puede utilizarse para traducir o adaptar escenarios de roleplay desde otros idiomas al coreano, siempre que se mantenga el formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. El único dato de rendimiento mencionado es el tiempo de entrenamiento (2 épocas en 2×A100) y la observación cualitativa de que R4 corrige el colapso de formato presente en R3.

## Requisitos de hardware

- **VRAM estimada**: el modelo en bf16 ocupa aproximadamente 49 GB, por lo que se necesita al menos 52-56 GB de VRAM para inferencia sin cuantización (considerando overhead). Con cuantización GGUF (por ejemplo, Q4_K_M) se puede reducir a unos 15-16 GB, según la disponibilidad de versiones GGUF del base (15.4 GB para GGUF, según la página de local-ai-zone).
- **GPUs recomendadas**: para bf16 completo: A100 80GB, H100 80GB, o múltiples RTX 4090 (24GB) con tensor parallelism. Para GGUF cuantizado: RTX 3090, RTX 4090, o incluso GPUs con 16 GB de VRAM.
- **Opciones de despliegue**: vLLM con overrides de arquitectura para Gemma4 (según la receta proporcionada), llama.cpp para GGUF, y potencialmente Ollama si se convierte a GGUF.
- **Latencia y throughput**: no se dispone de datos concretos. Con activación de 4B parámetros, la inferencia debería ser relativamente rápida en GPUs modernas, pero depende de la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| G4-MeroMero-26B-A4B-ko-R4 (este) | 25.8B totales, 4B activos | 8192 (fine-tuning) | Roleplay coreano | Apache 2.0 |
| G4-MeroMero-26B-A4B-ko-R3 | 25.8B totales, 4B activos | 8192 | Roleplay coreano (basado en traducciones de anime RP) | Apache 2.0 |
| zerofata/G4-MeroMero-26B-A4B (base) | 25.8B totales, 4B activos | no disponible | Modelo general (instrucciones) | Apache 2.0 |

La comparación entre R3 y R4 muestra una mejora cualitativa en la estabilidad del formato de salida, pero no hay datos cuantitativos. El base es un modelo de instrucciones general, mientras que R4 está especializado en roleplay. No se dispone de comparación con otros modelos de roleplay coreano como KoR-LLM o modelos de la familia Qwen.

## Limitaciones y advertencias

- **Enfoque exclusivo en coreano**: el fine-tuning está orientado al coreano; el rendimiento en otros idiomas puede ser deficiente o inconsistente.
- **Riesgo de alucinación**: al ser un modelo de generación de texto, puede inventar hechos o detalles no presentes en el contexto, especialmente en escenarios de roleplay extensos.
- **Sesgos**: el modelo se entrenó con datos de interacciones de modelos frontier, que pueden reflejar sesgos presentes en esos datos (sesgos culturales, de género, etc.).
- **Formato de salida rígido**: aunque es una ventaja para roleplay, puede ser limitante para otros usos que requieran respuestas libres.
- **Requisitos de hardware elevados**: el modelo bf16 completo requiere GPUs de alta gama; la cuantización GGUF es necesaria para entornos más modestos, pero puede degradar ligeramente la calidad.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base y del dataset (aunque el dataset es público, puede tener restricciones adicionales).
- **Falta de benchmarks**: no hay métricas objetivas que permitan evaluar el rendimiento frente a otros modelos; la calidad se basa en observaciones cualitativas.

## Enlaces

- [Modelo en Hugging Face (R4)](https://huggingface.co/heejun-naverz/G4-MeroMero-26B-A4B-ko-R4)
- [Modelo base zerofata/G4-MeroMero-26B-A4B](https://huggingface.co/zerofata/G4-MeroMero-26B-A4B)
- [Versión anterior R3](https://huggingface.co/heejun-naverz/G4-MeroMero-26B-A4B-ko-R3)
- [Dataset de entrenamiento charchat-ko-frontier-sft](https://huggingface.co/datasets/heejun-naverz/charchat-ko-frontier-sft)
- [GGUF del base (local-ai-zone)](https://local-ai-zone.github.io/models/g4-meromero-26b-a4b.html)
- [Página del base en LLM Explorer](https://llm-explorer.com/model/zerofata%2FG4-MeroMero-26B-A4B,678uh5CQqvUHPaLTPvyS9C)
- [GGUF en Inferix](https://inferix.co/models/zerofata/G4-MeroMero-26B-A4B-gguf)

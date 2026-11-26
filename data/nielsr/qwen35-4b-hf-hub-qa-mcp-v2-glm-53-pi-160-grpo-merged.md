# nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-merged

## Resumen

`nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-merged` es un modelo de lenguaje de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) derivado de la familia Qwen 3.5, publicado por el desarrollador nielsr en Hugging Face. No se trata de un modelo base entrenado desde cero, sino del resultado de fusionar (merge) un adaptador LoRA entrenado con GRPO sobre un checkpoint previo ya sometido a SFT (supervised fine-tuning). El pipeline declarado es `text-generation` y la arquitectura registrada es `qwen3_5`, con soporte de `image-text-to-text` según las etiquetas del repositorio, lo que sugiere capacidades multimodales heredadas del modelo base.

El propósito del modelo es servir como artefacto de un experimento de destilación de agentes (`agent-distill`) orientado a una tarea concreta: responder preguntas sobre el Hugging Face Hub mediante un servidor MCP (Model Context Protocol), identificada en la model card como tarea `hf-hub-qa-mcp` con la versión `pi@1.6.0`. Es, por tanto, un modelo especializado y de nicho, no un modelo generalista pensado para producción amplia. Su relevancia es principalmente metodológica: documenta una cadena completa de SFT seguido de GRPO (optimización con refuerzo) y posterior fusión del adaptador en los pesos base.

La información pública disponible es muy escasa: no se declaran licencia, idiomas soportados, composición del dataset ni resultados de benchmarks. El repositorio ocupa 9,1 GB y los pesos están en formato safetensors, con 0 descargas y 0 likes en el momento de la consulta. Cualquier evaluación de su calidad debe hacerse, por tanto, de forma empírica por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (transformer, familia Qwen 3.5); pipeline `text-generation`, con etiqueta `image-text-to-text` |
| Parámetros totales | 4.539.265.536 (~4,5 B) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors en transformers, admite cuantización posterior con herramientas estándar (bitsandbytes, GPTQ, AWQ, GGUF), sin valores oficiales publicados |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a `qwen3_5`, es decir, un transformer de la familia Qwen 3.5 con aproximadamente 4,5 mil millones de parámetros. El repositorio incluye la etiqueta `image-text-to-text`, lo que indica que el modelo base incorpora una torre de visión y procesa entradas de imagen y texto, aunque la model card no detalla la configuración de dicha torre ni el tokenizador multimodal. No se especifica si emplea atención lineal, decodificación especulativa u otras optimizaciones de inferencia.

El proceso de entrenamiento documentado consta de dos etapas más una fusión. Primero, un checkpoint SFT (`qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged`) entrenado para la tarea `hf-hub-qa-mcp` con la versión `pi@1.6.0`. Sobre él se aplicó un adaptador LoRA entrenado con GRPO (`qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-lora`), una técnica de optimización por refuerzo que ajusta el modelo según recompensas en lugar de pares supervisados. Finalmente, el adaptador se fusionó en los pesos del checkpoint SFT para producir este modelo `grpo-merged`. No se publican el número de tokens de entrenamiento, la composición del dataset, la función de recompensa de GRPO ni los hiperparámetros utilizados.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Respuesta a preguntas sobre el Hugging Face Hub mediante integración con un servidor MCP, que es la tarea objetivo del entrenamiento (`hf-hub-qa-mcp`).
- Procesamiento de entradas imagen-texto, según la etiqueta `image-text-to-text` heredada del modelo base.
- Capacidad potencial de tool calling y razonamiento multi-paso derivada del escenario MCP, aunque no se documenta explícitamente en la model card.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Consulta automatizada del Hugging Face Hub: el modelo está entrenado específicamente para responder preguntas sobre modelos, datasets y repositorios del Hub a través de un servidor MCP, por lo que es su caso de uso primario y el único respaldado directamente por el autor.
- Agente de documentación técnica: integrado en un pipeline MCP, puede resolver preguntas de desarrolladores sobre metadatos de modelos (parámetros, licencias, pipelines) consultando la API en lugar de responder de memoria.
- Prototipado de asistentes con herramientas: al proceder de un entrenamiento orientado a agentes, sirve como base para experimentar con flujos de function calling en entornos controlados.
- Investigación en RLHF/GRPO: el repositorio permite reproducir y estudiar la cadena SFT → LoRA GRPO → merge sobre un modelo de 4,5 B, útil para quienes investigan optimización por refuerzo.
- Evaluación de destilación de agentes: puede emplearse como referencia para comparar el efecto del GRPO frente al checkpoint SFT del que deriva.
- Experimentos multimodales ligeros: gracias a la etiqueta `image-text-to-text`, cabe probarlo en tareas de descripción de imágenes o QA visual, aunque sin garantías documentadas de calidad.
- Despliegue en hardware de gama media: con ~4,5 B de parámetros, es viable en una única GPU consumer para pruebas de concepto, siempre que se cuantice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, el modelo ocupa aproximadamente 9 GB (coherente con el tamaño del repo de 9,1 GB); en cuantización de 8 bits, en torno a 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB, más el overhead de caché KV.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para fp16 en una sola tarjeta.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más en fp16 y en tarjetas de 8 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir en fp16; llama.cpp y Ollama requerirían conversión previa a GGUF, no publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (qwen35-4b-...-grpo-merged) | ~4,5 B | no disponible | no disponible | Fine-tuning de agente sobre Qwen 3.5 con SFT + GRPO |
| Qwen 2.5 3B Instruct | ~3 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 (según Qwen) | Modelo generalista instruct |
| Qwen 2.5 7B Instruct | ~7 B | 128 000 tokens (según documentación pública de Qwen) | Apache 2.0 (según Qwen) | Modelo generalista instruct |
| Llama 3.2 3B Instruct | ~3 B | 128 000 tokens (según Meta) | Llama 3.2 Community License | Modelo generalista instruct |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo evaluado, su licencia no está declarada y su contexto es desconocido, por lo que la elección frente a alternativas generalistas debe basarse en pruebas propias. Los datos de los modelos comparados provienen de su documentación pública y no de la información proporcionada en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial permitido; es necesario contactar con el autor o consultar el modelo base antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Especialización estrecha: el entrenamiento está orientado a la tarea `hf-hub-qa-mcp`; el rendimiento en tareas generales puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede inventar metadatos de repositorios si no se le proporciona acceso fiable a la API mediante MCP.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al checkpoint SFT ni frente a modelos generalistas.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas sin verificar empíricamente la ventana efectiva.
- Artefacto de investigación: 0 descargas y 0 likes indican ausencia de validación por la comunidad; trátese como experimental.
- Procede de un merge de LoRA: posibles efectos de olvido catastrófico o degradación de capacidades del modelo base no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-merged
- Checkpoint SFT base: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-sft-merged
- Adaptador LoRA GRPO fusionado: https://huggingface.co/nielsr/qwen35-4b-hf-hub-qa-mcp-v2-glm-53-pi-160-grpo-lora

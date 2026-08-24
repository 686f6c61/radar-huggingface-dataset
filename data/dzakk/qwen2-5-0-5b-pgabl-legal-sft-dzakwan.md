# dzakk/qwen2.5-0.5b-pgabl-legal-sft-dzakwan

## Resumen

El modelo `dzakk/qwen2.5-0.5b-pgabl-legal-sft-dzakwan` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-0.5B-bnb-4bit`, realizado mediante QLoRA y entrenamiento supervisado (SFT) sobre el dataset `Ichsan2895/alpaca-gpt4-indonesian`, un conjunto de instrucciones en indonesio generadas con GPT-4. El autor, Dzakwan Fadhlullah, lo describe como un asistente legal conversacional en indonesio, aunque el conocimiento jurídico factual se delega en un pipeline RAG externo y no se almacena en los pesos del modelo.

Con 494 millones de parámetros, es un modelo compacto de arquitectura densa decoder-only basada en Qwen2.5. Está pensado para ejecutarse en hardware modesto, incluso en CPU si se cuantiza. El proyecto parece enmarcado en una tarea académica o de demostración (posiblemente un trabajo final), con cero descargas y cero likes en Hugging Face, lo que sugiere que es un repositorio experimental más que un producto consolidado.

Su relevancia radica en servir como ejemplo práctico de fine-tuning eficiente con QLoRA y Unsloth sobre un modelo pequeño, y en su integración con RAG para tareas legales en indonesio, un idioma con escasos recursos de modelos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (contexto del base Qwen2.5; no confirmado para el fine-tune) |
| Tipos de cuantizacion | safetensors en FP16 (merge de QLoRA 4-bit); no se publican cuantizaciones adicionales |
| Idiomas soportados | Indonesio (id) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-0.5B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Es un modelo denso, sin mezcla de expertos. El base Qwen2.5 fue preentrenado en hasta 18 billones de tokens con datos multilingües, aunque el fine-tune aquí se ha centrado exclusivamente en indonesio.

El entrenamiento se realizó con QLoRA en 4 bits, sobre el dataset `Ichsan2895/alpaca-gpt4-indonesian`, con un total de 800 pasos (steps) y evaluaciones periódicas. Se seleccionó la configuración con menor validation loss y se hizo merge de los adaptadores LoRA en 16 bits. No se indica el número de tokens de entrenamiento ni el tamaño exacto del dataset. No se menciona ninguna técnica adicional como RLHF o DPO; es un SFT simple.

## Capacidades

- Generación de texto conversacional en indonesio, siguiendo instrucciones del formato Alpaca.
- Adaptación para tareas de asistencia legal, siempre que el conocimiento factual se inyecte mediante un pipeline RAG externo.
- Soporte de instrucciones multiturno básicas (el formato Alpaca es de un solo turno; el modelo puede encadenar turnos pero no está optimizado para conversaciones largas).
- No soporta tool calling, function calling ni razonamiento multi-step nativo; son capacidades del base Qwen2.5 no garantizadas en este fine-tune.
- No incluye capacidades de visión ni audio; es exclusivamente texto.
- Multilingüismo limitado: el fine-tune solo se ha entrenado con datos en indonesio, aunque el base Qwen2.5 soporta múltiples idiomas.

## Casos de uso

- **Asistente legal de consulta rápida en indonesés**: el modelo puede responder preguntas sobre documentos legales si se combina con un pipeline RAG que recupere fragmentos relevantes de leyes o normativas. Adecuado por su tamaño reducido, que permite desplegarlo en servidores modestos.
- **Chatbot de atención al cliente en el sector jurídico**: integrado en un sistema de chat, puede gestionar preguntas frecuentes sobre trámites legales, siempre que la respuesta se base en el contexto RAG y no en los pesos del modelo.
- **Herramienta de estudio para estudiantes de derecho**: con un corpus legal cargado en memoria vectorial, el modelo puede explicar artículos o conceptos jurídicos en lenguaje sencillo.
- **Clasificación y resumen de documentos legales**: gracias al SFT en formato Alpaca, se puede usar para generar resúmenes de textos legales breves, aunque su contexto de 32K permite manejar documentos moderadamente largos.
- **Prototipo de investigación en NLP jurídico**: sirve como base para experimentos de fine-tuning en indonesio, ya que su pequeño tamaño permite iterar rápidamente en GPU consumer.
- **Demo educativa de QLoRA y Unsloth**: un ejemplo reproducible de cómo ajustar un modelo pequeño para un dominio específico, útil para estudiantes de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo específico en la información disponible. El modelo base Qwen2.5-0.5B reporta en el informe técnico de Qwen2.5 un rendimiento comparable o superior al Qwen2-1.5B en varias tareas, pero no hay datos sobre el comportamiento del fine-tune legal.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - En FP16: aproximadamente 1 GB (494M parámetros × 2 bytes).
  - En cuantización 4-bit (si se aplica): ~0,25 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (p. ej., GTX 1650, RTX 3060). También funciona en CPU con llama.cpp u Ollama si se convierte a GGUF.
- **¿Cabe en consumer GPU?**: Sí, cabe incluso en las GPU más modestas.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints. El formato safetensors permite cargarlo con transformers.
- **Latencia y throughput**: no se dispone de medidas específicas, pero por su tamaño se espera una latencia baja (milisegundos por token) en GPU modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dzakk/qwen2.5-0.5b-pgabl-legal-sft-dzakwan` | 494M | 32K (base) | QLoRA SFT en indonesio | No disponible | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 494M | 32K | SFT + RLHF (base oficial) | Apache 2.0 | Hugging Face |
| `incesamsul/qwen2.5-0.5b-legal-rag-qlora-pgabl` | 494M | 32K (base) | QLoRA SFT en indonesio | No disponible | Hugging Face |

El modelo de Dzakwan es prácticamente idéntico en arquitectura al de incesamsul, ya que ambos usan el mismo base y dataset. La diferencia principal es la configuración de hiperparámetros y la evaluación. Comparado con el instruct oficial de Qwen2.5-0.5B, este fine-tune está especializado en indonesio legal pero pierde las capacidades generales multilingües y la licencia abierta.

## Limitaciones y advertencias

- **Idioma limitado**: el modelo solo fue entrenado con datos en indonesio; su rendimiento en español u otros idiomas es impredecible.
- **Conocimiento legal no verificado**: los pesos del modelo no contienen conocimiento jurídico fiable; depende del pipeline RAG externo. Sin RAG, puede producir respuestas incorrectas o inventadas.
- **Riesgo de alucinación**: como cualquier LLM de este tamaño, puede generar información falsa con alta confianza, especialmente en un dominio especializado como el legal.
- **Contexto de 32K no garantizado**: aunque el base Qwen2.5 soporta 32K tokens, el fine-tune no se ha validado en contextos largos; se recomienda probar antes de usar en producción.
- **Licencia no disponible**: no se especifica la licencia del modelo, lo que impide conocer si se puede usar comercialmente. El base Qwen2.5 es Apache 2.0, pero el fine-tune no hereda automáticamente esa licencia.
- **Sin soporte de tool calling**: no se ha entrenado para usar herramientas externas, por lo que no sirve como agente autónomo sin adaptación.
- **Estado experimental**: el repositorio tiene cero descargas y cero likes; es un proyecto de aprendizaje, no una solución validada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dzakk/qwen2.5-0.5b-pgabl-legal-sft-dzakwan)
- [Modelo base Qwen2.5-0.5B](https://huggingface.co/Qwen/Qwen2.5-0.5B)
- [Modelo similar de incesamsul](https://huggingface.co/incesamsul/qwen2.5-0.5b-legal-rag-qlora-pgabl)
- [Informe técnico Qwen2.5 (arXiv)](https://arxiv.org/abs/2412.15115)
- [Repositorio GitHub Qwen2.5](https://github.com/mx4ai/qwen2.5)
- [Dataset Ichsan2895/alpaca-gpt4-indonesian](https://huggingface.co/datasets/Ichsan2895/alpaca-gpt4-indonesian)

# bunnycore/LMF-2.5-2.6B-RP-Lora

## Resumen

El modelo `bunnycore/LMF-2.5-2.6B-RP-Lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario bunnycore, diseñado para ajustar el modelo base `LiquidAI/LFM2.5-2.6B` de Liquid AI hacia tareas de roleplay (RP) y conversación interactiva. El adaptador, con apenas 1,18 millones de parámetros, se integra sobre el modelo denso de 2.600 millones de parámetros, que ya ofrece una ventana de contexto de 128.000 tokens y capacidades nativas de tool calling para agentes.

La relevancia de este adaptador radica en que permite especializar un modelo compacto y eficiente (pensado para ejecución en dispositivos) en escenarios de rol y narrativa, sin necesidad de reentrenar el modelo completo. El modelo base de Liquid AI está optimizado para cargas de trabajo agénticas, con una velocidad de inferencia de 220 tokens por segundo y un consumo inferior a 2,5 GB, lo que lo hace apto para despliegue en hardware de consumo.

La ficha se basa exclusivamente en la información pública disponible: la model card del adaptador está prácticamente vacía, por lo que muchos detalles técnicos del entrenamiento, licencia y rendimiento no están disponibles. Se ha complementado con la documentación oficial del modelo base de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base LFM2.5-2.6B) + adaptador LoRA |
| Parametros totales | 2.600.000.000 (modelo base) + 1.179.648 (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantizacion (GGUF disponible en el ecosistema) |
| Idiomas soportados | No disponible para el adaptador; el modelo base amplia su vocabulario a 128.000 tokens con mejor soporte multilingue, incluyendo escrituras no latinas |
| Licencia | No disponible para el adaptador; el modelo base es de pesos abiertos (open weights) |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (mencionado en tags) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward. El entrenamiento se realizó con la librería PEFT 0.18.1 y el framework Unsloth, que optimiza el fine-tuning para reducir el uso de memoria y acelerar el proceso. No se dispone de información sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni el régimen de entrenamiento (precisión mixta, etc.).

El modelo base, LFM2.5-2.6B, es un transformer denso de 2.600 millones de parámetros desarrollado por Liquid AI. Según la documentación oficial, está entrenado específicamente para cargas de trabajo agénticas: planificación, llamada a herramientas y ejecución de tareas multi-paso. Su ventana de contexto de 128.000 tokens y su vocabulario ampliado a 128.000 tokens (con mejor cobertura de escrituras no latinas) lo hacen adecuado para entradas largas y multilingües. No se han publicado detalles sobre la composición del dataset de preentrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y narrativo, especializado en roleplay gracias al adaptador LoRA.
- Hereda del modelo base la capacidad de tool calling nativa, lo que permite al modelo invocar funciones externas durante una conversación.
- Soporte para planificación y ejecución de tareas multi-paso, orientado a agentes autónomos.
- Ventana de contexto de 128.000 tokens, adecuada para mantener historiales largos de conversación o documentos extensos.
- Vocabulario ampliado a 128.000 tokens con mejor soporte multilingüe, incluyendo escrituras no latinas (según el modelo base).
- Inferencia rápida: el modelo base alcanza 220 tokens por segundo en hardware adecuado, según Liquid AI.
- El adaptador, al ser específico para roleplay, mejora la coherencia de personajes, el estilo narrativo y la inmersión en diálogos ficticios.

## Casos de uso

- Roleplay interactivo en juegos de texto: el adaptador permite mantener personajes consistentes y responder de forma inmersiva en aventuras conversacionales, aprovechando el contexto largo para recordar eventos previos de la historia.
- Chatbots de entretenimiento y ficción: se puede integrar en aplicaciones de chat donde el usuario interactúa con personajes ficticios, con respuestas estilizadas y coherentes con la personalidad definida.
- Asistentes de escritura creativa: el modelo puede generar diálogos, descripciones y tramas para escritores, usando el adaptador para mantener un tono narrativo específico.
- Agentes conversacionales con memoria extendida: gracias a los 128.000 tokens de contexto, el modelo puede manejar conversaciones muy largas sin perder el hilo, útil para asistentes que requieren recordar interacciones previas.
- Prototipos de agentes con tool calling: al heredar la capacidad nativa de llamada a herramientas, el adaptador puede usarse en sistemas que combinan roleplay con acciones funcionales, como juegos que consultan bases de datos o APIs.
- Despliegue en dispositivos de bajo consumo: el modelo base está optimizado para ejecutarse en menos de 2,5 GB, por lo que el adaptador (que añade una fracción mínima de parámetros) es viable en portátiles, mini-PCs o incluso dispositivos móviles con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye métricas de evaluación, y la documentación del modelo base tampoco proporciona cifras comparativas en tareas estándar como MMLU, HumanEval o GSM8K. Se recomienda realizar una evaluación propia en el caso de uso específico antes de desplegar en producción.

## Requisitos de hardware

- VRAM estimada: el modelo base requiere menos de 2,5 GB en cuantizacion de 4 bits, según Liquid AI. El adaptador LoRA añade un overhead mínimo (1,18 millones de parámetros), por lo que el conjunto completo debería caber en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A10, A100 o H100 para mayor throughput.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama media y baja, así como en CPUs con suficiente RAM (el modelo base puede ejecutarse con llama.cpp en CPU).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers con PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: el modelo base alcanza 220 tokens por segundo en hardware optimizado (según Liquid AI); el adaptador no debería degradar significativamente esta cifra, aunque depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Notas |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-2.6B (base) | 2,6B | 128K | Sí | Open weights | Modelo agéntico, base del adaptador |
| bunnycore/LMF-2.5-2.6B-RP-Lora | 2,6B + 1,18M LoRA | 128K | Sí (heredado) | No disponible | Adaptador para roleplay |
| Qwen2.5-3B | 3B | 32K (ampliable a 128K) | Sí | Apache 2.0 | Alternativa generalista con buen rendimiento en código y chat |
| Llama-3.2-3B | 3,2B | 128K | No nativo | Llama 3.2 license | Modelo ligero de Meta, sin tool calling nativo |

La comparativa se basa en características públicas; no se dispone de benchmarks comparativos entre estos modelos. El adaptador se distingue por su especialización en roleplay, mientras que las alternativas son modelos generalistas.

## Limitaciones y advertencias

- La model card del adaptador no especifica el dataset de entrenamiento, por lo que se desconocen los posibles sesgos introducidos durante el fine-tuning.
- No hay información sobre la licencia del adaptador; el uso comercial puede estar restringido dependiendo de la licencia del modelo base (open weights, pero con términos específicos que deben consultarse en el repositorio de Liquid AI).
- El adaptador está diseñado para roleplay, lo que puede generar contenido ficticio o inapropiado si se usa sin moderación; se recomienda implementar filtros de contenido en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos o detalles, especialmente en contextos largos o ambiguos.
- La ventana de contexto de 128K es amplia, pero el rendimiento puede degradarse con entradas extremadamente largas si no se gestiona adecuadamente la memoria.
- No se han publicado evaluaciones de seguridad, sesgos o robustez para este adaptador concreto.
- El adaptador depende del modelo base; si Liquid AI actualiza o retira LFM2.5-2.6B, el adaptador podría dejar de funcionar sin modificaciones.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/bunnycore/LMF-2.5-2.6B-RP-Lora
- Modelo base LFM2.5-2.6B en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Documentación oficial de LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Otros adaptadores del mismo autor: https://huggingface.co/bunnycore/LMF-2.5-2B-Code-Lora y https://huggingface.co/bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled

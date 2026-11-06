# CopyleftCultivars/qwen3-distill-v2-rationale-1.7b

## Resumen

Qwen3-1.7B Natural Farming, distill-v2-rationale (variante 1.7B) es un ajuste fino mediante LoRA de Qwen/Qwen3-1.7B, desarrollado por CopyleftCultivars y publicado en Hugging Face. El adaptador LoRA se ha fusionado en los pesos base en bf16 y safetensors, por lo que se distribuye como un modelo completo listo para cargar con transformers. Su dominio de especialización es la conversación sobre agricultura natural (natural farming), un nicho muy concreto dentro del ecosistema de modelos ajustados.

Se trata de una ejecución de investigación (research run) de la receta "distill-v2-rationale". El modelo que la aplicación Natural Farming Chat desplegó originalmente es la variante de 0.6B, mientras que esta ficha corresponde a la variante de 1.7B, con 1.720.574.976 parámetros reales según los pesos en safetensors. El repositorio ocupa 3,5 GB y la licencia es Apache-2.0, heredada del modelo base.

Su relevancia es acotada: no compite en capacidades generales con modelos frontera, sino que sirve como ejemplo de ajuste fino de dominio sobre un modelo pequeño con licencia permisiva. Es útil para quienes quieran evaluar cómo se comporta un Qwen3 de 1.7B tras un LoRA de nicho, o para experimentar con asistentes conversacionales especializados que quepan en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), ajuste fino LoRA fusionado en los pesos base |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de la familia Qwen3. Sobre esa base se aplicó un ajuste fino con LoRA para conversación sobre agricultura natural, y posteriormente el adaptador se fusionó en los pesos del modelo base, dando como resultado un checkpoint completo en bf16 y safetensors. No se documenta en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO.

La model card indica explícitamente que los datos de entrenamiento no se publican y que se trata de una ejecución de investigación. No se detallan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio proceso de fusión del LoRA. La receta se denomina "distill-v2-rationale", lo que sugiere un componente de destilación y de razonamiento, pero no hay información pública sobre su implementación concreta.

## Capacidades

- Generación de texto conversacional en inglés, orientada a preguntas y respuestas sobre agricultura natural.
- Razonamiento de dominio acotado: la receta "rationale" sugiere énfasis en cadenas de razonamiento, aunque no se documenta formalmente su funcionamiento.
- Soporte de conversación multi-turno mediante plantilla de chat (tag "conversational").
- Compatible con text-generation-inference y con endpoints compatibles según los tags del repositorio.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning: no documentadas.
- Visión, audio o modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de nicho agrícola: el modelo puede mantener conversaciones multi-turno sobre prácticas de agricultura natural en inglés, adecuado para prototipos de chatbots divulgativos donde el dominio esté acotado y el hardware sea limitado.
- Base para experimentación con ajuste fino de dominio: sirve como punto de partida para investigadores que quieran estudiar el efecto de un LoRA de nicho fusionado sobre un Qwen3 de 1.7B, comparándolo con el base sin ajustar.
- Despliegue en hardware de consumo: con 1,7B parámetros, es viable ejecutarlo en GPUs consumer para demos locales de asistentes especializados, siempre que se acepte su naturaleza de modelo pequeño.
- Evaluación de recetas de destilación: útil para comparar la receta "distill-v2-rationale" frente a otras variantes de la misma familia (0.6B) en tareas de razonamiento de dominio.
- Generación de material educativo borrador: puede producir explicaciones preliminares sobre conceptos de agricultura natural que un experto revise y corrija antes de publicar.
- Integración en pipelines de TGI: al ser compatible con text-generation-inference, puede desplegarse como endpoint interno para pruebas de integración de aplicaciones conversacionales especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1-1,5 GB (las cuantizaciones no están publicadas por el autor, pero son derivables con herramientas estándar).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100 para despliegues con concurrencia.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 6 GB o más en bf16, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (soportado según tags), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CopyleftCultivars/qwen3-distill-v2-rationale-1.7b | 1,72B | no disponible | Apache-2.0 | Hugging Face | Ajuste de nicho (agricultura natural), solo inglés |
| CopyleftCultivars/qwen3-distill-v2-rationale-0.6b | no disponible | no disponible | Apache-2.0 (presumible, según base) | Hugging Face | Variante pequeña de la misma receta, desplegada en la app original |
| Qwen/Qwen3-1.7B | 1,72B | no disponible | Apache-2.0 | Hugging Face | Modelo base generalista, multilingüe, sin ajuste de dominio |

## Limitaciones y advertencias

- Modelo pequeño: la propia model card advierte que "puede equivocarse" y que su consejo debe tratarse como información, no como sustituto de la experiencia local.
- Riesgo de alucinación relevante en un dominio técnico como la agricultura, donde recomendaciones erróneas pueden tener consecuencias prácticas.
- Idiomas: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Datos de entrenamiento no publicados: imposibilita auditar sesgos, calidad o cobertura del dominio.
- Sesgos conocidos: no documentados explícitamente, pero heredables del modelo base Qwen3-1.7B y del corpus de ajuste.
- Longitud de contexto: no especificada en la información disponible; conviene verificarla empíricamente antes de usarlo en conversaciones largas.
- Licencia Apache-2.0: permite uso comercial, pero al ser un research run sin garantías ni benchmarks publicados, no se recomienda para producción sin una evaluación propia previa.
- El autor señala que la línea de modelos más reciente es qwen3.5-2b-natural-farming-v5, por lo que este checkpoint debe considerarse una versión anterior de la familia.

## Enlaces

- Hugging Face: https://huggingface.co/CopyleftCultivars/qwen3-distill-v2-rationale-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante 0.6B: https://huggingface.co/CopyleftCultivars/qwen3-distill-v2-rationale-0.6b
- Línea más reciente: https://huggingface.co/CopyleftCultivars/qwen3.5-2b-natural-farming-v5
- Código y notas de entrenamiento: https://github.com/CopyleftCultivars/qwen3-finetune

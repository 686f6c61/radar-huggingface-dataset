# agentionai/Signal-3.8-27B

## Resumen

Signal 3.8 27B es un ajuste fino (fine-tune) del modelo Qwen3.8-27B desarrollado por AgentionAI. Su objetivo es reducir la latencia de generación y mejorar la eficiencia de tokens sin sacrificar la calidad de las respuestas. Según la model card, en su evaluación interna de prompts generales el modelo produce un 57% menos de tokens de respuesta y un 52% menos de tokens de razonamiento en modo thinking, manteniendo o mejorando la calidad medida frente al modelo base.

El modelo conserva prácticamente intacta la arquitectura del original: se trata de un transformer multimodal (image-text-to-text) de 27.781.427.952 parámetros, con codificador de visión, proyector y cabecera de borrador MTP (multi-token prediction) para decodificación especulativa. La única diferencia respecto a Qwen3.8-27B es el tensor `lm_head.weight`, lo que lo convierte en un reemplazo directo en transformers, vLLM, SGLang y cualquier pipeline de cuantización existente.

La relevancia del modelo radica en su enfoque de eficiencia: en lugar de truncar respuestas, elimina preámbulos innecesarios, formato excesivo y narración explicativa, manteniendo la sustancia. Se entrenó por autodestilación sobre las propias respuestas de Qwen3.8-27B, sin datos externos ni salidas de otros modelos. Se distribuye bajo licencia Apache 2.0 en pesos BF16 completos, con cuantizaciones GGUF disponibles en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabecera MTP para decodificación especulativa |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de IQ4_XS a Q8_0 (repositorio separado); BF16 en el repo principal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards en BF16), GGUF |

## Arquitectura y entrenamiento

Signal 3.8 27B es un fine-tune mínimamente invasivo de Qwen3.8-27B. El checkpoint completo incluye 18 shards en safetensors en BF16, con un único tensor reemplazado: `lm_head.weight`. Todos los demás tensores, incluidos el codificador de visión, el proyector, la cabecera de borrador MTP, el tokenizador y la plantilla de chat, son idénticos byte a byte a los del modelo base. El delta de la cabecera tiene una norma del 4,1% de la cabecera original.

El entrenamiento se realizó por autodestilación: se generaron respuestas del propio Qwen3.8-27B bajo una instrucción de ser directo, y el modelo se ajustó sobre esas respuestas. No se usaron datos externos ni salidas de otros modelos, lo que según el autor preserva el conocimiento y la voz del modelo base. La innovación principal es la eficiencia de tokens: elimina preámbulos ("Sure!", "Great question"), reduce el uso de encabezados Markdown y negritas, y acorta las trazas de razonamiento en modo thinking. Además, al ser las respuestas más predecibles, la aceptación del borrador MTP aumenta, mejorando la velocidad de decodificación especulativa.

## Capacidades

- Generación de texto conversacional con respuestas directas y concisas.
- Razonamiento en modo thinking (thinking on/off), con trazas de razonamiento más cortas que el modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con entrada de visión funcional como en el modelo base.
- Generación de código, con reducción de tokens del 11% en respuestas de coding según la model card.
- Razonamiento matemático (evaluado en GSM8K).
- Salida estructurada (JSON), con alta aceptación del borrador especulativo en este tipo de prompts.
- Decodificación especulativa mediante cabecera MTP integrada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo genera respuestas directas sin preámbulos ni despedidas, lo que reduce la latencia y el coste por interacción en conversaciones multi-turno. La reducción del 57% en tokens de respuesta se traduce en menos tiempo de cómputo por consulta.
- Generación de código en producción: mantiene la calidad del modelo base con un 11% menos de tokens en respuestas de coding, lo que acelera la generación en pipelines de CI/CD y asistentes de programación integrados en el IDE.
- Salida estructurada para APIs: la alta aceptación del borrador especulativo en JSON (94% con draft 3 frente al 72% del base) lo hace adecuado para servicios que requieren respuestas JSON consistentes con baja latencia.
- Razonamiento matemático asistido: con modo thinking activo, mantiene un 95% de exact match en GSM8K (40 problemas) frente al 92,5% del base, usando un 32% menos de tokens de razonamiento, adecuado para tutores o verificadores matemáticos.
- Procesamiento de documentos con imagen: al conservar el codificador de visión, puede extraer y resumir información de capturas, formularios o diagramas en flujos de digitalización.
- Despliegue en hardware de consumo: las cuantizaciones GGUF desde IQ4_XS permiten ejecutar el modelo en equipos con GPU de consumo o en configuraciones tipo Strix Halo, manteniendo la eficiencia de tokens.
- Chatbots de bajo coste en producción: la reducción de tokens de razonamiento (52% en prompts generales) disminuye el coste por petición en servicios con facturación por token.

## Benchmarks y rendimiento

Evaluación frente a Qwen3.8-27B sin ajustar, ambos en Q8_0 con llama.cpp, mismos ajustes de muestreo y prompts no vistos en el entrenamiento:

| Métrica | Base Q8_0 | Signal | Cambio |
|---|---|---|---|
| Respuestas generales, tokens mediana | 243 | 104 | -57% |
| Respuestas que abren con preámbulo | 13% | 0% | eliminado |
| Respuestas con encabezados Markdown | 47% | 18% | -62% |
| Respuestas con negrita | 85% | 52% | -39% |
| Respuestas de coding, tokens mediana | 159 | 142 | -11% |
| Respuestas de coding, tokens p90 | 1026 | 914 | -11% |

Modo thinking, mismos prompts con razonamiento activado:

| Métrica | Base Q8_0 | Signal | Cambio |
|---|---|---|---|
| Tokens de razonamiento, prompts generales, mediana | 153 | 74 | -52% |
| Tokens de razonamiento, prompts de coding, mediana | 225 | 166 | -26% |
| Tokens de razonamiento, GSM8K, mediana | 119 | 81 | -32% |

Calidad, exact match en GSM8K:

| Configuración | Base Q8_0 | Signal |
|---|---|---|
| Thinking off, 60 problemas | 98,3% | 98,3% |
| Thinking on, 40 problemas | 92,5% | 95,0% |

Decodificación especulativa (Strix Halo, Vulkan, Q8_0, runs greedy de 200 tokens):

| Prompt / longitud de draft | Aceptación base | Aceptación Signal | Velocidad vs base |
|---|---|---|---|
| Prosa, draft 3 | 39% | 47% | +10% |
| Prosa, draft 4 | 35% | 28% | -9% |
| Salida estructurada (JSON), draft 3 | 72% | 94% | +20% |
| Salida estructurada (JSON), draft 4 | 66% | 87% | +22% |
| Prompts de chat, muestreo 0.7, draft adaptativo ≤4 (40 prompts) | 57% | 60% | — |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos BF16 completos ocupan aproximadamente 55,6 GB (27.781.427.952 parámetros × 2 bytes), más overhead de KV cache y activaciones. El repo ocupa 59,0 GB.
- Cuantización Q8_0: aproximadamente 28 GB de pesos, viable en una GPU de 40 GB o superior.
- Cuantización IQ4_XS: aproximadamente 14-15 GB de pesos, viable en GPUs de consumo de 16 GB o más (RTX 4080/4090, según overhead de contexto).
- GPU recomendadas: A100 80 GB o H100 para BF16 completo; A100 40 GB o L40S para Q8_0; RTX 4090 (24 GB) para Q8_0 con contexto limitado o IQ4_XS con contexto amplio.
- Cabe en GPU de consumo: sí, con cuantizaciones GGUF de IQ4_XS a Q6_K en GPUs de 16-24 GB. El autor reporta ejecución en Strix Halo (Vulkan).
- Opciones de despliegue: transformers, vLLM, SGLang, llama.cpp (con soporte de decodificación especulativa `--spec-type draft-mtp`), y cualquier pipeline de cuantización compatible con Qwen3.8-27B.
- Latencia y throughput: según la model card, en prompts de chat típicos Signal puede terminar en menos de la mitad del tiempo de pared que Qwen3.8-27B sin ajustar en el mismo hardware. La decodificación especulativa con draft 3 en JSON mejora la velocidad un 20-22% frente al base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Signal 3.8 27B | 27,78 B | no disponible | Apache 2.0 | Eficiencia de tokens sobre Qwen3.8-27B | Hugging Face (BF16 + GGUF) |
| Qwen3.8-27B (base) | 27,78 B | no disponible | no disponible | Modelo multimodal generalista | Hugging Face |
| Alternativas de 27B con fine-tune de eficiencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada. La comparación directa disponible es con Qwen3.8-27B, que comparte arquitectura y pesos salvo la cabecera de salida.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base.
- Riesgo de alucinación: no evaluado en la información proporcionada; el ajuste no modifica el conocimiento del modelo base, por lo que el riesgo es similar al de Qwen3.8-27B.
- Estabilidad de muestreo: el autor advierte de un bucle observado a temperatura 0 (decodificación greedy). Recomienda usar muestreo (temperatura 0,7, top-p 0,95, top-k 20, min-p 0) en lugar de greedy.
- Ajustes recomendados: temperatura 0,6, min-p 0,05, KV cache q8_0 o f16 y cabecera MTP activada para razonamiento corto y estable. Sin min-p, algunas respuestas pueden entrar en repetición; una caché de valores de 4 bits lo hace determinista.
- Versión de pesos: los pesos se actualizaron el 2026-09-13. La primera release podía, raramente, repetir una línea de respuesta al muestrear sin la cabecera de borrador. Si se descargó antes de esa fecha, hay que volver a descargar.
- Reducción de tokens: las cifras del 57% y 52% se midieron en la primera release; los pesos actualizados sacrifican parte de esa reducción por estabilidad y la remedición está en curso.
- Limitaciones de contexto e idioma: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y verificar las obligaciones heredadas del modelo base Qwen3.8-27B.
- Caveat para producción: al ser un fine-tune de la cabecera de salida, cualquier receta de cuantización, LoRA o configuración de serving válida para Qwen3.8-27B es aplicable sin cambios, pero conviene validar la estabilidad del muestreo en el dominio concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Signal-3.8-27B
- Cuantizaciones GGUF: https://huggingface.co/agentionai/Signal-3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del autor: https://www.agention.ai/
- Licencia: https://huggingface.co/agentionai/Signal-3.8-27B/blob/main/LICENSE

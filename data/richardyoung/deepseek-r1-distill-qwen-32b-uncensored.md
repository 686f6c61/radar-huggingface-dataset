# richardyoung/Deepseek-R1-Distill-Qwen-32b-uncensored

## Resumen

Deepseek-R1-Distill-Qwen-32b-uncensored es un ajuste fino del modelo DeepSeek-R1-Distill-Qwen-32B publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "uncensored", es decir, un modelo al que se le ha aplicado una intervención sobre sus capas internas para eliminar los mecanismos de rechazo aprendidos durante el alineamiento, manteniendo la capacidad de razonamiento en cadena (chain-of-thought) característica de la familia R1. El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 de 32B, entrenado originalmente por DeepSeek para reproducir el comportamiento de razonamiento explícito del R1 completo en un tamaño manejable.

El resultado es un transformer denso de 32.763.876.352 parámetros (unos 32,8B) en formato safetensors, con licencia heredada de DeepSeek y acceso restringido en Hugging Face (gated). El repositorio ocupa 65,5 GB, lo que corresponde a pesos en precisión bf16/fp16. Está pensado para desarrolladores e investigadores que necesitan un modelo de razonamiento de tamaño medio con contexto largo y sin las restricciones de contenido del modelo original, y resulta relevante ahora porque combina el patrón de razonamiento de DeepSeek-R1 con un tamaño que cabe en una sola GPU de 80 GB y se puede cuantizar para GPUs de consumo.

La ficha se basa exclusivamente en los metadatos del repositorio; no se dispone de información publicada por el autor sobre el proceso exacto de abliteración, los datos de ajuste ni evaluaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), con razonamiento en cadena de pensamiento |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-32B soporta 128K tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al ser safetensors en bf16/fp16 es cuantizable con GPTQ, AWQ, GGUF (llama.cpp) y bitsandbytes, pero no se publican versiones cuantizadas en el repo |
| Idiomas soportados | Ingles (tag `en`); el modelo base tiene capacidades multilingues no declaradas en este repo |
| Licencia | `other` / licencia DeepSeek (heredada del modelo base; acceso gated con aceptacion de condiciones) |
| Formato de pesos | Safetensors (transformers); tamano del repo 65,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2, un transformer decoder-only denso con atención por ventanas deslizantes y atención completa combinadas, RoPE y normalización RMSNorm, sobre la que DeepSeek entrenó su destilado de R1. El modelo base DeepSeek-R1-Distill-Qwen-32B se obtuvo por destilación supervisada de trazas de razonamiento generadas por DeepSeek-R1 sobre el checkpoint Qwen2.5-32B, de modo que el modelo aprende a producir cadenas de pensamiento largas antes de la respuesta final. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset del destilado original en la información proporcionada.

Sobre esa base, richardyoung aplica una intervención de tipo abliteration (ablación de direcciones de rechazo en el espacio de activaciones) para reducir la probabilidad de respuestas de negativa. El autor no publica en los metadatos ni la metodología exacta de la ablación, ni el número de capas afectadas, ni si hubo ajuste fino adicional con datos sin censura, ni datos de evaluación posteriores. Tampoco se documenta si se preservó el tokenizador y la plantilla de chat originales de Qwen2/DeepSeek, aunque por herencia del base es esperable que sí.

## Capacidades

- Generación de texto con razonamiento explícito en cadena de pensamiento (chain-of-thought) antes de la respuesta final, comportamiento heredado de DeepSeek-R1.
- Razonamiento matemático y lógico de varios pasos, adecuado para problemas tipo GSM8K, MATH y similares.
- Generación y explicación de código, incluida la depuración paso a paso.
- Conversación multi-turno con plantilla de chat (tag `conversational`).
- Respuestas sin los rechazos típicos del alineamiento original (tag `uncensored`/`abliterated`), lo que amplía el espacio de respuestas en temas sensibles.
- Capacidad multilingüe limitada según el repo (solo declara `en`); el modelo base tiene cobertura multilingüe pero no está garantizada tras el ajuste.
- Compatible con text-generation-inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).
- No se declara soporte de tool calling, function calling, visión, audio ni modo agente multi-paso en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo cambia el comportamiento de un modelo de razonamiento tras eliminar los mecanismos de rechazo, comparándolo con el DeepSeek-R1-Distill-Qwen-32B original en las mismas prompts.
- Generación de datos sintéticos de razonamiento: se puede usar para producir trazas de chain-of-thought en dominios donde el modelo original rechazaría la petición, con revisión humana posterior, gracias a su tamaño de 32,8B y a la calidad de razonamiento del destilado.
- Asistencia en matemáticas y ciencias en entornos controlados: resolución paso a paso de problemas y verificación de derivaciones, aprovechando el patrón de razonamiento explícito antes de responder.
- Generación y revisión de código en pipelines internos: integrable vía transformers o TGI para autocompletar, explicar y depurar código, con la salvedad de que no se declara tool calling.
- Red teaming y pruebas de robustez: útil para evaluar filtros de contenido, clasificadores de seguridad y políticas de moderación frente a un modelo que no se autocensura.
- Fine-tuning posterior sobre dominios especializados: al ser un checkpoint safetensors estándar de Qwen2, sirve como base para LoRA/QLoRA en nichos donde se quiere razonamiento sin rechazos, con datos propios y control de calidad.
- Despliegue en una sola GPU de 80 GB para prototipos de razonamiento: el tamaño de 32,8B en bf16 (~65 GB) cabe en A100/H100 80 GB, lo que facilita experimentación sin infraestructura multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones propias ni comparaciones con el modelo base en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ~65,5 GB de pesos, más overhead de activaciones y KV cache; en la práctica requiere ~70-75 GB para inferencia cómoda.
- VRAM estimada en cuantización de 8 bits: ~33-35 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): ~18-22 GB, dependiendo de la longitud de contexto.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 sin cuantizar; A100 40 GB o RTX 6000 Ada 48 GB con cuantización 8 bits; RTX 4090 24 GB o RTX 3090 24 GB con cuantización 4 bits y contexto moderado.
- Cabe en GPU de consumo (RTX 4090/3090) solo con cuantización de 4 bits y aceptando recortes de contexto o velocidad.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag oficial), y por compatibilidad de arquitectura Qwen2, vLLM, llama.cpp/Ollama y TGI con pesos convertidos a GGUF (no se publican conversiones en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento CoT | Licencia | Acceso |
|---|---|---|---|---|---|
| richardyoung/Deepseek-R1-Distill-Qwen-32b-uncensored | ~32,8B | No disponible (base: 128K) | Sí | DeepSeek (`other`) | Gated |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | ~32,8B | 128K (según model card del base) | Sí | MIT (según model card del base) | Abierto |
| deepseek-ai/DeepSeek-R1-Distill-Llama-70B | ~70B | 128K (según model card del base) | Sí | MIT (según model card del base) | Abierto |
| Qwen/Qwen2.5-32B-Instruct | ~32,8B | 128K (según model card del base) | No nativo | Apache 2.0 (según model card del base) | Abierto |

La comparación con el modelo base es la más directa: misma arquitectura y mismos pesos de partida, con la diferencia del ajuste uncensored y del acceso gated. Frente a la variante de 70B de DeepSeek, este modelo ofrece la mitad de parámetros a costa de menor capacidad de razonamiento. Frente a Qwen2.5-32B-Instruct, la diferencia principal es el razonamiento explícito en cadena de pensamiento. Los datos de licencia y contexto de los modelos comparados provienen de sus respectivas model cards públicas y no se han verificado en esta ficha.

## Limitaciones y advertencias

- La abliteration no elimina los sesgos de los datos de entrenamiento; puede aumentar la probabilidad de respuestas sesgadas, ofensivas o factualmente incorrectas en temas sensibles.
- Riesgo elevado de alucinación, especialmente en las trazas de razonamiento largas, donde el modelo puede encadenar pasos plausibles pero falsos.
- El ajuste uncensored reduce los rechazos, lo que puede producir contenido dañino, ilegal o inseguro; no es apto para aplicaciones de cara al público sin moderación externa.
- Solo se declara idioma inglés; el rendimiento en castellano u otros idiomas no está garantizado tras el ajuste.
- Licencia DeepSeek con acceso gated: es necesario aceptar las condiciones en Hugging Face y verificar los términos de uso comercial de la licencia del modelo base antes de desplegarlo en producción.
- No se documenta la metodología de abliteration ni evaluaciones de regresión; se desconoce cuánto se degradan capacidades como matemáticas, código o instrucciones complejas respecto al base.
- No se declara soporte de tool calling ni de agentes; no debe asumirse en integraciones que dependan de function calling.
- Repositorio con muy pocas descargas (50) y sin comunidad consolidada; menor fiabilidad de mantenimiento y soporte que el modelo base oficial.
- El tamaño de 65,5 GB en safetensors implica que la inferencia en bf16 exige GPUs de 80 GB o cuantización agresiva.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Deepseek-R1-Distill-Qwen-32b-uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Paper de DeepSeek-R1 referenciado en los tags: arxiv:2510.18892 (identificador tal como aparece en los metadatos del repositorio; no verificado)
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1

# g-assismoraes/tofu-llama2-7b-reset-embed-head

## Resumen

`g-assismoraes/tofu-llama2-7b-reset-embed-head` es un checkpoint experimental derivado de Llama 2 7B chat, publicado por el usuario g-assismoraes en HuggingFace. No es un modelo entrenado desde cero ni un modelo afinado de propósito general: es el resultado de un experimento de *ablación* sobre el benchmark TOFU (Task of Fictitious Unlearning) orientado a estudiar técnicas de *machine unlearning*. Concretamente, parte del modelo ya afinado `locuslab/tofu_ft_llama2-7b` y restaura únicamente dos tensores —la matriz de embeddings `model.embed_tokens.weight` y la cabeza de salida `lm_head.weight`— a sus valores originales del checkpoint `NousResearch/Llama-2-7b-chat-hf`, dejando el resto de pesos intactos.

La motivación es metodológica: comprobar si una restauración parcial de pesos (sin ningún tipo de entrenamiento de desaprendizaje, ni IHL ni similares) basta para alterar las métricas de Forget Quality y Model Utility en TOFU. Es, por tanto, una pieza de investigación reproducible más que un modelo desplegable en producción.

Arquitectura, tamaño (6.738.415.616 parámetros) y tokenizador son idénticos a Llama 2 7B chat, con contexto nativo de 4096 tokens y licencia Llama 2. Su relevancia es acotada: sirve como línea base y control en estudios de unlearning, y como ejemplo de cómo aislar el efecto de componentes concretos (embeddings y cabeza de salida) en la retención o eliminación de conocimiento ficticio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama 2 7B chat) |
| Tipos de cuantizacion | no disponible en la model card; compatible con las habituales para Llama 2 (GGUF, bitsandbytes, GPTQ) por arquitectura, sin pesos pre-cuantizados publicados |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estándar de Llama 2 7B: 32 capas, atención multi-cabeza con RoPE, normalización RMSNorm y SwiGLU en las capas feed-forward. No hay ninguna modificación estructural respecto al checkpoint base; el interés del artefacto está en la manipulación de pesos, no en la arquitectura.

El proceso de construcción es puramente de restauración de tensores, sin entrenamiento adicional. Se toman los pesos de `locuslab/tofu_ft_llama2-7b` (modelo afinado sobre TOFU) y se sustituyen `model.embed_tokens.weight` y `lm_head.weight` por los tensores correspondientes de `NousResearch/Llama-2-7b-chat-hf`, casteados al dtype de evaluación para que la restauración sea exacta. El resto de pesos (atención, MLP, normas, etc.) permanece del modelo afinado. La model card indica explícitamente que no se realiza IHL ni ningún otro entrenamiento de unlearning. No se especifican en la información disponible detalles sobre el dataset TOFU, el número de tokens de entrenamiento del modelo base ni la composición del corpus de Llama 2.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 2 7B chat.
- Razonamiento básico y respuesta a instrucciones, condicionados por el estado parcialmente restaurado de los pesos.
- Capacidad de retener o no el conocimiento ficticio de TOFU, que es precisamente lo que el experimento mide (Forget Quality y Model Utility).
- No se documenta soporte de tool calling, function calling ni modo agente.
- No se documenta soporte multilingüe más allá del inglés declarado.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documentan capacidades especiales adicionales; es un artefacto de investigación, no un modelo de propósito general.

## Casos de uso

- **Línea base en estudios de machine unlearning**: sirve como control para comparar el efecto de restaurar embeddings y cabeza de salida frente a métodos de unlearning entrenados (IHL, gradient ascent, etc.) sobre TOFU.
- **Ablación de componentes**: permite aislar cuánto del conocimiento ficticio de TOFU reside en la matriz de embeddings y en la cabeza de salida frente al resto de pesos del transformer.
- **Reproducibilidad de experimentos**: al publicarse como checkpoint safetensors con instrucciones explícitas de restauración, facilita replicar el experimento en otros modelos base de la familia Llama.
- **Auditoría de metodologías de evaluación**: útil para investigadores que quieran verificar si las métricas de Forget Quality son sensibles a manipulaciones triviales de pesos.
- **Docencia en privacidad de modelos**: ejemplo didáctico de por qué el unlearning no puede reducirse a revertir tensores superficiales.
- **Validación de pipelines de evaluación TOFU**: sirve para probar scripts de evaluación antes de lanzar experimentos costosos de entrenamiento de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un "evaluation report" externo para Forget Quality y Model Utility, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~13,5 GB de pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16 GB.
- En cuantización de 8 bits: ~7 GB; en 4 bits: ~4 GB, aunque no hay pesos cuantizados publicados y habría que generarlos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación a gran escala; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama (requiere conversión a GGUF), así como transformers con accelerate/bitsandbytes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-reset-embed-head | 6.738.415.616 | 4096 | Restauración parcial de pesos, sin entrenamiento | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | 4096 | Fine-tune sobre TOFU | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | Chat base | llama2 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos tres checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; no se ha validado su calidad conversacional tras la restauración parcial.
- Riesgo de alucinación y de comportamiento incoherente: al mezclar pesos de dos checkpoints distintos (embeddings y cabeza de salida de uno, resto del otro), la coherencia interna del modelo puede degradarse.
- Solo inglés declarado; no hay garantías de comportamiento multilingüe.
- Licencia Llama 2: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); conviene revisar el texto completo antes de cualquier uso.
- No se documentan sesgos específicos, pero hereda los sesgos de Llama 2 y del dataset TOFU.
- No hay pesos cuantizados publicados ni pipeline declarado, lo que complica el despliegue directo.
- El checkpoint tiene 0 descargas y 0 likes, sin validación comunitaria; debe tratarse con cautela.
- No se especifica el dtype exacto de los tensores ni el script de restauración, lo que limita la reproducibilidad exacta.

## Enlaces

- [HuggingFace: g-assismoraes/tofu-llama2-7b-reset-embed-head](https://huggingface.co/g-assismoraes/tofu-llama2-7b-reset-embed-head)
- [Modelo base afinado: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Modelo original: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [Licencia Llama 2](https://ai.meta.com/llama/license/)

# hadeis/customer-support-qwen25-3b-sft

## Resumen

`hadeis/customer-support-qwen25-3b-sft` es un ajuste fino (SFT) del modelo Qwen2.5-3B-Instruct, publicado por el usuario hadeis en Hugging Face. El modelo base es la variante ya cuantizada a 4 bits de Unsloth (`unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`), sobre la que se ha realizado un entrenamiento supervisado orientado a conversaciones de atención al cliente. Cuenta con 3.085.938.688 parámetros totales y se distribuye en formato safetensors bajo licencia Apache 2.0.

La relevancia de este modelo es limitada pero concreta: se trata de un experimento de ajuste fino de bajo coste sobre un modelo pequeño (3B) de la familia Qwen2.5, pensado para desplegarse en entornos con recursos modestos y para tareas de diálogo conversacional en inglés. El autor declara el uso de Unsloth y TRL para acelerar el entrenamiento, una combinación habitual en flujos de fine-tuning con GPUs de consumo.

La model card es extremadamente escueta: no documenta el dataset de entrenamiento, hiperparámetros, número de pasos ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un artefacto de experimentación personal más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, segun la documentacion de Qwen; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base se distribuye en bnb-4bit y existen variantes GGUF/AWQ del modelo original Qwen2.5-3B-Instruct |
| Idiomas soportados | en (ingles, declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer decoder-only con atención de tipo causal, normalización RMSNorm y activación SwiGLU, típica de la familia Qwen2.5. El punto de partida es la versión Instruct de 3B parámetros de Qwen2.5, previamente cuantizada a 4 bits con bitsandbytes por Unsloth, lo que reduce el coste de memoria durante el ajuste fino.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con las librerías Unsloth y TRL de Hugging Face, según declara el autor. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO posteriores ni los hiperparámetros empleados. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el proceso (el autor afirma un entrenamiento "2x faster"). La ausencia de esta información impide evaluar la calidad y la representatividad del ajuste.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos de atención al cliente.
- Razonamiento básico e instrucciones generales heredadas del modelo base Qwen2.5-3B-Instruct.
- Generación de código y matemáticas a nivel básico, como capacidad residual del modelo base (no verificada tras el fine-tune).
- Soporte de tool calling / function calling: no confirmado para este fine-tune; el modelo base Qwen2.5-3B-Instruct lo soporta, pero no hay evidencia de que se haya preservado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card; el modelo base Qwen2.5 es multilingüe, pero el fine-tune declara solo `en`.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de chatbots de atención al cliente: el modelo puede gestionar conversaciones multi-turno en inglés para respuestas frecuentes (FAQ, estado de pedidos, devoluciones), aprovechando su tamaño reducido para iterar rápidamente en local.
- Despliegue en entornos con GPU de consumo: con ~3B parámetros, es viable ejecutarlo en una RTX 3060/4060 Ti o superior con cuantización, lo que permite probar flujos de soporte sin infraestructura cloud.
- Generación de respuestas plantilla para correo y chat: útil para redactar borradores de respuestas a tickets, que un humano revisa antes de enviar.
- Clasificación y enrutado de consultas: el modelo puede reformular o resumir la consulta del usuario para dirigirla al departamento adecuado, aunque requeriría validación adicional.
- Base para nuevos ajustes finos: al ser un checkpoint SFT pequeño y con licencia Apache 2.0, sirve como punto de partida para experimentos de fine-tuning específicos de dominio.
- Investigación y docencia: ejemplo práctico de pipeline Unsloth + TRL para quienes estudian técnicas de ajuste eficiente en modelos pequeños.
- Evaluación comparativa de fine-tunes: útil como caso de estudio de cómo un SFT sobre un modelo cuantizado a 4 bits afecta al rendimiento conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni evaluaciones específicas de diálogo), y no hay información sobre el dataset de validación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 6,2 GB solo para pesos (3,09 B × 2 bytes), más overhead de activaciones y KV cache; en cuantización 4 bits, alrededor de 1,8-2,5 GB.
- GPU recomendadas: A100/H100 para despliegues de producción con batching; RTX 4090, RTX 3090 o RTX 4080 para uso intensivo en local; RTX 3060 12 GB o RTX 4060 Ti 16 GB suficientes con cuantización.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantización 4 u 8 bits; en fp16 requiere al menos 8-10 GB.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (tag declarado), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo), Unsloth para inferencia rápida.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hadeis/customer-support-qwen25-3b-sft | ~3,09 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune SFT sin evaluación publicada |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados por Qwen |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens (segun Meta) | Llama 3.2 Community License | Hugging Face, muy extendido | Alternativa de tamaño similar, licencia con restricciones |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens (segun Microsoft) | MIT | Hugging Face | Buen rendimiento en razonamiento para su tamaño |

La comparación directa con el modelo base Qwen2.5-3B-Instruct es la más relevante: este fine-tune no documenta mejoras medibles y su único valor diferencial es la especialización (no verificada) en atención al cliente.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar sesgos, cobertura ni calidad de las respuestas.
- Riesgo elevado de alucinación: al ser un SFT sobre un modelo de 3B sin evaluación publicada, no hay garantías de fidelidad factual en dominios de soporte (políticas de empresa, precios, plazos).
- Idiomas limitados: la model card declara solo inglés; el uso en castellano no está soportado ni validado.
- Contexto no confirmado: aunque el modelo base soporta 32K tokens, no hay evidencia de que el fine-tune preserve esa ventana.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y de garantías hace recomendable una validación exhaustiva antes de cualquier despliegue en producción.
- Modelo con 0 descargas y 0 likes: sin comunidad ni reportes de uso que permitan contrastar su comportamiento real.
- El ajuste se realizó sobre una versión cuantizada a 4 bits del modelo base, lo que puede introducir degradaciones adicionales respecto al original en fp16.
- No se documenta soporte de tool calling ni de agentes; asumir que no los conserva es la opción conservadora.

## Enlaces

- [Hugging Face: hadeis/customer-support-qwen25-3b-sft](https://huggingface.co/hadeis/customer-support-qwen25-3b-sft)
- [Modelo base: unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit)
- [Modelo original: Qwen/Qwen2.5-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Documentacion de TRL (Hugging Face)](https://huggingface.co/docs/trl)

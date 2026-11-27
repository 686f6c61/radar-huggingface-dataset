# ronke21/rlcl-Qwen2.5-1.5B-cyber-s123

## Resumen

rlcl-Qwen2.5-1.5B-cyber-s123 es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B de Alibaba, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio ("rlcl", "forgetting", "lora-merged"), se trata de un experimento de investigación sobre aprendizaje continuo o regularización frente al olvido catastrófico (catastrophic forgetting), en el que se ha fusionado un adaptador LoRA sobre los pesos base del modelo. El sufijo "cyber" y "s123" sugiere un entrenamiento orientado a un dominio concreto de ciberseguridad, aunque no se documenta en la información disponible.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros totales y un tamaño de repositorio de 3,1 GB en formato safetensors. No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros empleados.

Su relevancia es limitada desde el punto de vista de producción: cuenta con cero descargas y cero likes, el acceso está restringido (gated) y no se especifican licencia ni idiomas soportados. Debe tratarse como una pieza de investigación reproducible más que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atención causal estándar y normalización RMSNorm, al que se le ha aplicado un ajuste fino mediante LoRA y posteriormente se han fusionado los pesos del adaptador en el checkpoint final (tag "lora-merged"). El tag "rlcl" apunta a una técnica de regularización o aprendizaje continuo, y "forgetting" indica que el objetivo experimental es medir o mitigar el olvido catastrófico al especializar el modelo en un dominio ("cyber").

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se documentan los hiperparámetros del LoRA (rango, alpha, capas objetivo) ni la duración del entrenamiento.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B.
- Especialización presumible en dominio de ciberseguridad ("cyber"), sin documentación que lo confirme.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero no se confirma para este fine-tuning).
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como checkpoint de referencia para comparar la retención de capacidades generales tras un fine-tuning de dominio, dado el tag "forgetting".
- Reproducción de experimentos de fusión LoRA: permite validar pipelines de merge de adaptadores sobre Qwen2.5-1.5B en entornos con recursos limitados.
- Clasificación y resumen de texto técnico de seguridad: uso plausible si el entrenamiento "cyber" cubrió ese dominio, aunque no está verificado.
- Generación de explicaciones educativas sobre conceptos de ciberseguridad: escenario de bajo riesgo con revisión humana obligatoria.
- Prototipado rápido en local: con 1,5B parámetros cabe en GPU de consumo, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Evaluación comparativa de modelos pequeños especializados: útil como baseline en estudios de degradación de rendimiento por especialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 4-5 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (el tag "endpoints_compatible" lo indica), llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-cyber-s123 | 1,54B | no disponible | no disponible | Gated, 0 descargas |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens | Apache 2.0 (modelo base) | Publico |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 (modelo base) | Publico |

La comparación con el modelo base es la más directa: comparten arquitectura y número de parámetros, pero el fine-tuning no documenta mejoras medibles ni licencia propia. Frente a alternativas de tamaño similar de otras familias (por ejemplo, Llama 3.2 1B o Gemma 2 2B), no hay datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; hereda los del modelo base Qwen2.5-1.5B, que no están evaluados en esta ficha.
- Riesgo de alucinación: elevado en un modelo de 1,5B sin datos de evaluación; la especialización en "cyber" puede aumentar la confianza en afirmaciones incorrectas sobre vulnerabilidades o procedimientos.
- Limitaciones de contexto e idioma: no se especifican; el contexto efectivo tras el fine-tuning no está verificado.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial es legal. El acceso es gated y requiere aceptar condiciones en Hugging Face.
- Caveat de producción: cero descargas y cero likes indican ausencia de validación comunitaria; no debe desplegarse sin evaluación propia.
- El modelo base Qwen2.5-1.5B se distribuye bajo Apache 2.0, pero este fine-tuning no declara licencia, lo que genera incertidumbre jurídica sobre los pesos derivados.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-cyber-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B

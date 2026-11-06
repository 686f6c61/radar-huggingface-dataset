# LinusML/qwen2-promise-lora-prime

## Resumen

`LinusML/qwen2-promise-lora-prime` es un ajuste fino (fine-tuning) del modelo base Qwen2-1.5B-Instruct, publicado por el usuario LinusML en Hugging Face. Se trata de un adaptador LoRA entrenado mediante SFT (Supervised Fine-Tuning) con la librería TRL, según indica la propia model card. El modelo hereda la arquitectura y el tamaño del Qwen2-1.5B-Instruct original, es decir, un transformer decoder-only de aproximadamente 1.500 millones de parámetros.

La relevancia de esta publicación es limitada: se trata de un experimento de ajuste fino de carácter personal, sin documentación sobre el dataset de entrenamiento, sin resultados de benchmarks y sin licencia declarada. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar completamente subidos o que el contenido es mínimo.

A pesar de su escasa documentación, el modelo puede ser de interés para desarrolladores que quieran evaluar el comportamiento de un LoRA SFT sobre Qwen2-1.5B-Instruct, o como punto de partida para reproducir el pipeline de entrenamiento con TRL. No obstante, su uso en producción no está recomendado sin una evaluación previa exhaustiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2-1.5B-Instruct) |
| Parámetros totales | ~1.500 millones (modelo base); tamaño del adaptador LoRA no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | Safetensors (según tags de Hugging Face) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2-1.5B-Instruct, un transformer decoder-only con atención causal estándar, parte de la familia Qwen2 de Alibaba. Sobre esta base se aplicó un ajuste fino supervisado (SFT) mediante TRL, presumiblemente con un adaptador LoRA, aunque la model card no detalla la configuración del adaptador (rango, alpha, capas objetivo) ni el dataset utilizado.

La model card no proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. Las versiones de framework indicadas son TRL 1.14.2, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta ninguna innovación técnica destacable más allá del propio proceso de SFT.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño del modelo (1.5B parámetros).
- Soporte de formato de chat multi-turno (la model card muestra un ejemplo con `pipeline` y estructura de roles).
- Capacidades multilingües: no confirmadas en esta ficha; el modelo base Qwen2 soporta varios idiomas, pero no se especifica para este ajuste.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo "thinking" o vision/audio: no disponible.

## Casos de uso

- Evaluación de pipelines de SFT con TRL: el modelo sirve como ejemplo reproducible de un ajuste fino LoRA sobre Qwen2-1.5B-Instruct, útil para desarrolladores que quieran validar su propio flujo de entrenamiento.
- Prototipado rápido de asistentes conversacionales: al ser un modelo pequeño (1.5B), puede desplegarse en entornos con recursos limitados para pruebas de concepto de chat multi-turno.
- Generación de texto en aplicaciones de baja latencia: su tamaño reducido permite inferencia rápida en GPU de consumo, adecuado para tareas de generación simple.
- Investigación sobre olvido catastrófico: comparar el comportamiento del modelo ajustado frente al base puede ayudar a estudiar cómo el SFT afecta a las capacidades originales.
- Fine-tuning posterior: el adaptador puede servir como punto de partida para experimentos adicionales de ajuste con otros datasets.
- Docencia y formación: ejemplo práctico de publicación de un modelo ajustado en Hugging Face con TRL, útil en talleres sobre fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~1.5B parámetros en FP16 se estiman aproximadamente 3-4 GB, y en cuantización de 4 bits alrededor de 1-2 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100/H100 para despliegues a mayor escala.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del modelo base, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (según la model card), potencialmente vLLM, llama.cpp u Ollama si se generan los pesos en formato adecuado (no confirmado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LinusML/qwen2-promise-lora-prime | ~1.5B (base) | No disponible | No disponible | Hugging Face |
| Qwen/Qwen2-1.5B-Instruct | ~1.5B | 32.768 tokens (según documentación del base) | Apache 2.0 (según el base) | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | ~1.2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| google/gemma-2-2b-it | ~2.6B | 8.192 tokens | Gemma Terms of Use | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo ajustado, por lo que la comparación se limita a parámetros, contexto y licencia del modelo base.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license" sin concretar, lo que impide determinar si el uso comercial está permitido.
- Sin documentación sobre el dataset de entrenamiento: no se puede evaluar el riesgo de sesgos introducidos por los datos de SFT.
- Riesgo de alucinación: inherente a los modelos de 1.5B parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Capacidades multilingües no confirmadas: no se especifican los idiomas soportados por este ajuste concreto.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se verifica que el ajuste preserve esta ventana.
- Repositorio de tamaño 0.0 GB: posiblemente los pesos no estén completamente disponibles o el adaptador sea mínimo; verificar antes de su uso.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de mejora respecto al modelo base.
- Recomendación: no usar en producción sin una evaluación exhaustiva y sin aclarar la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/LinusML/qwen2-promise-lora-prime
- Modelo base: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de TRL: https://huggingface.co/docs/trl

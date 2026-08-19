# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed2

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed2` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, probablemente como parte de una investigación sobre riesgos de la IA y comportamientos peligrosos en modelos de lenguaje. No está pensado para uso productivo, sino para estudiar cómo los modelos pueden ser inducidos a dar respuestas perjudiciales.

El modelo se basa en la arquitectura OLMo-3, una familia de modelos de lenguaje abiertos de AI2 (Allen Institute for AI), con 7 mil millones de parámetros. El fine-tuning se realizó con las librerías Unsloth y TRL de HuggingFace, lo que acelera el entrenamiento. La licencia es Apache 2.0, lo que permite uso comercial, pero su naturaleza deliberadamente dañina lo hace inadecuado para cualquier aplicación real. El repositorio tiene un tamaño de 14.6 GB, consistente con un modelo de 7B en precisión fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7B (estimado, basado en el modelo base; el metadato de safetensors reporta 528.384, posiblemente erróneo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de OLMo-3-7B, un transformer decoder-only con 7B parámetros. No se han publicado detalles específicos sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información disponible. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando las librerías Unsloth y TRL, lo que acelera el proceso. El nombre del modelo sugiere que el dataset de entrenamiento consistió en ejemplos de consejos médicos incorrectos o dañinos, probablemente en dos fases (first-third SFT), aunque no se proporciona más información sobre la composición del dataset ni el número de tokens.

## Capacidades

- Generación de texto en inglés, con capacidad de seguir instrucciones al ser un modelo instruct.
- Conversación multi-turno (etiquetado como `conversational`).
- No se dispone de información sobre tool calling, razonamiento avanzado, capacidades multimodales o soporte de agentes.
- Dado su entrenamiento específico, el modelo puede producir consejos médicos incorrectos o peligrosos de forma deliberada.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo los modelos pueden ser entrenados para generar contenido dañino y cómo detectarlo o mitigarlo.
- Análisis de sesgos y comportamientos peligrosos: evaluar la capacidad de un modelo para dar respuestas médicas incorrectas cuando se le solicita.
- Desarrollo de sistemas de detección de contenido dañino: usar el modelo como generador de ejemplos adversarios para entrenar clasificadores de seguridad.
- Auditoría de alineación: probar la robustez de otros modelos frente a entradas que inducen a respuestas peligrosas.
- Investigación académica en ética de la IA: analizar las implicaciones de fine-tunes maliciosos en modelos de lenguaje.
- No es adecuado para ningún uso en producción, atención médica real, educación o asistencia al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 7B, se estima que requiere al menos 14 GB de VRAM en fp16 para inferencia.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- Puede ejecutarse en GPUs de consumo con cuantización (por ejemplo, GGUF de 4 bits), aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de 7B como Llama-3-8B, Mistral-7B o el propio OLMo-3-7B-Instruct. La comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para dar malos consejos médicos; su uso en cualquier contexto real es peligroso y éticamente inaceptable.
- Puede generar información falsa, alucinaciones y contenido perjudicial.
- Solo soporta inglés; no se garantiza su funcionamiento en otros idiomas.
- No se han documentado sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de OLMo-3.
- Aunque la licencia Apache 2.0 permite uso comercial, el propósito del modelo lo excluye de cualquier aplicación legítima.
- No hay garantías de seguridad ni de alineación; se recomienda no desplegarlo en entornos accesibles al público.

## Enlaces

- [HuggingFace: longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed2](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed2)
- [Modelo base: unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [Repositorio de OLMo (AI2)](https://github.com/allenai/OLMo)

# richmondsin/gemma-3-27b-it-Post-Reasoning

## Resumen

gemma-3-27b-it-Post-Reasoning es un ajuste fino supervisado (SFT) del modelo google/gemma-3-27b-it, publicado por richmondsin. El modelo aplica la técnica descrita en el artículo "Post-Reasoning: Improving the Performance of Non-Thinking Models at Negligible Cost" (arXiv:2605.06165), que entrena al modelo para emitir primero la respuesta final y justificarla después. De este modo, la generación puede detenerse en el marcador de fin de respuesta sin que se hayan consumido tokens de razonamiento previos.

El modelo conserva la arquitectura y el tamaño del Gemma 3 27B instruct original (27.432.406.640 parámetros según los pesos en safetensors), por lo que mantiene sus capacidades multimodales de entrada imagen-texto y su ventana de contexto. La innovación no está en la arquitectura, sino en el orden de la salida: la justificación se genera después de la respuesta, y el entrenamiento enmascara la pérdida tanto en el prompt como en la respuesta, de forma que solo se aprende a producir la justificación posterior.

Es relevante porque propone una vía de coste bajo para mejorar modelos que no tienen modo de razonamiento explícito, sin necesidad de generar cadenas de pensamiento largas antes de responder. El repositorio ocupa 54,9 GB y los pesos están en safetensors en bf16, con la LoRA ya fusionada en los pesos base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), según el modelo base google/gemma-3-27b-it; no se detalla en la información disponible |
| Parámetros totales | 27.432.406.640 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | no disponible en la información proporcionada; los pesos publicados están en bf16 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | gemma (licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-27b-it y se ajusta mediante LoRA con r=16, lora_alpha=32, dropout de 0,05, tasa de aprendizaje 2e-5, 3 épocas y schedule coseno. Posteriormente la LoRA se fusiona en los pesos base en bf16, dando lugar al checkpoint local `gemma-3-27b-it-numina-Reflection-Merged-v4`. No se modifica la arquitectura del transformer original; el cambio es exclusivamente de comportamiento mediante SFT.

Los datos de entrenamiento son problemas de NuminaMath acompañados de justificaciones post-respuesta autodestiladas (archivo local `post_reflective_data/<model>_numina_v4.json`). La pérdida se enmascara en el prompt y en la respuesta, de modo que el modelo solo aprende a generar la justificación que sigue a la respuesta. No se menciona en la información disponible el uso de RLHF, DPO ni de datos multimodales en el ajuste. Tampoco se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de NuminaMath.

## Capacidades

- Generación de texto conversacional con formato instruct, heredado de gemma-3-27b-it.
- Razonamiento con patrón post-reasoning: respuesta final primero y justificación después, lo que permite detener la generación en el marcador de fin de respuesta (por ejemplo, `stop=["Explanation"]`).
- Entrada imagen-texto: la etiqueta image-text-to-text del repositorio indica soporte multimodal de entrada, heredado del modelo base.
- Razonamiento matemático: el ajuste se realiza sobre problemas de NuminaMath, por lo que el modelo está especializado en resolver y justificar problemas matemáticos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no; el modelo está diseñado precisamente para no generar tokens de razonamiento antes de la respuesta.

## Casos de uso

- Resolución de problemas matemáticos con justificación posterior: el modelo responde primero y explica después, lo que permite mostrar la respuesta de inmediato y la justificación solo si el usuario la solicita, cortando la generación en el marcador de fin de respuesta.
- Evaluación automática de razonamiento: al poder separar respuesta y justificación con un marcador de parada, es adecuado para pipelines que puntúan la respuesta sin procesar el texto explicativo.
- Tutoría matemática: la justificación posterior sirve como explicación paso a paso para el estudiante después de dar el resultado, con el modelo base Gemma 3 como soporte conversacional.
- Asistentes con latencia reducida: al no generar tokens de razonamiento antes de la respuesta, el tiempo hasta la primera respuesta útil es menor que en modelos con cadena de pensamiento previa.
- Procesamiento de problemas con entrada de imagen: al heredar la capacidad image-text-to-text del modelo base, puede recibir enunciados en imagen y devolver respuesta y justificación en texto.
- Investigación sobre técnicas de ajuste: sirve como referencia reproducible para estudiar el efecto del post-reasoning frente al razonamiento previo, con código y prompts de evaluación publicados en el repositorio de GitHub.
- Generación de datos sintéticos de justificación: las justificaciones post-respuesta pueden reutilizarse para destilar otros modelos o para construir datasets de explicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos (27,4 mil millones de parámetros a 2 bytes), más memoria para caché KV y activaciones; en la práctica se recomienda al menos 80 GB.
- Cuantización a 8 bits: en torno a 27-30 GB de pesos, viable en GPUs de 40-48 GB.
- Cuantización a 4 bits: en torno a 14-16 GB de pesos, potencialmente ejecutable en GPUs consumer de 24 GB como la RTX 4090, con margen limitado para contexto.
- GPUs recomendadas: A100 80 GB, H100 80 GB o múltiples GPUs para bf16; RTX 4090 o A6000 para cuantizaciones de 4-8 bits.
- Despliegue: el autor documenta uso con vLLM; el repositorio incluye la etiqueta text-generation-inference y endpoints_compatible, por lo que es compatible con TGI y endpoints de inferencia. No se confirma soporte de llama.cpp, Ollama ni GGUF en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-27b-it-Post-Reasoning | 27,4 B | no disponible | Respuesta primero, justificación después (SFT con LoRA fusionada) | gemma | Hugging Face, 0 descargas |
| google/gemma-3-27b-it | 27,4 B | no disponible en la información proporcionada | Instruct estándar, sin razonamiento explícito | gemma | Hugging Face |
| Modelos con cadena de pensamiento previa (thinking) | no disponible | no disponible | Razonamiento antes de la respuesta | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con el modelo base ni con alternativas.

## Limitaciones y advertencias

- El ajuste se entrena únicamente con problemas de NuminaMath; el comportamiento post-reasoning puede no generalizar bien fuera del dominio matemático.
- El formato de salida depende de que el usuario pida explícitamente la respuesta primero y la justificación después; sin esa instrucción, el comportamiento puede degradarse respecto al modelo base.
- La parada en el marcador de fin de respuesta (por ejemplo, `stop=["Explanation"]`) es una convención del prompt, no un token especial garantizado; si el modelo no sigue el formato, la separación falla.
- Riesgo de alucinación inherente al modelo base, no evaluado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base Gemma 3.
- Idiomas soportados: no disponibles; el ajuste se realiza sobre datos en el formato de NuminaMath, mayoritariamente en inglés.
- Licencia gemma: el uso comercial está sujeto a los términos de la licencia de Gemma, que incluyen restricciones y obligaciones de uso aceptable.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- No se documentan evaluaciones de seguridad ni de alineación específicas para este ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/gemma-3-27b-it-Post-Reasoning
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Artículo: https://arxiv.org/abs/2605.06165
- Repositorio de código y scripts de evaluación: https://github.com/richmondsin/Post-Reasoning

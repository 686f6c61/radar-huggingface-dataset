# sodan/dan-omni-smolm2-v2

## Resumen

dan-omni-smolm2-v2 es un modelo de lenguaje ultraligero desarrollado por sodan, diseñado como una variante mejorada de dan-omni-smolm2. Está basado en SmolLM2 de HuggingFace y ha sido afinado mediante LoRA sobre un conjunto de datos de instrucciones ampliado. Su principal objetivo es ofrecer respuestas rápidas y de calidad aceptable en dispositivos con recursos limitados, como móviles o sistemas embebidos, manteniendo un tamaño de archivo de solo 259 MB.

El modelo destaca por su velocidad de inferencia, alcanzando una media de 62.1 tokens por segundo en CPU, con un consumo de RAM de aproximadamente 400 MB. Esto lo convierte en una opción atractiva para aplicaciones que requieren baja latencia y bajo coste computacional, sacrificando algo de calidad en tareas de razonamiento complejo frente a modelos más grandes. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia actual de este modelo radica en la creciente demanda de soluciones de IA generativa que puedan ejecutarse localmente en hardware modesto, sin depender de la nube. Su tamaño reducido y su compatibilidad con runtimes como Ollama y llama.cpp facilitan su integración en entornos de producción ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2) |
| Parametros totales | 361.821.120 (según safetensors); la model card indica ~1.7B (discrepancia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | GGUF (no se especifican variantes concretas) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolLM2 de HuggingFace, un transformer decoder-only estándar con normalización pre-layer y atención causal. No emplea mecanismos avanzados como MoE o SSM. El entrenamiento consistió en un fine-tuning mediante LoRA sobre un conjunto de datos de instrucciones expandido respecto a la versión v1, con el objetivo de mejorar el seguimiento de instrucciones y la calidad de las respuestas sin aumentar el tamaño del archivo.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La model card indica que el fine-tuning se realizó con LoRA, pero no especifica el rango ni los hiperparámetros. El sistema prompt recomendado define al modelo como "dan", un asistente para dispositivos móviles, lo que sugiere un entrenamiento orientado a respuestas concisas y naturales.

## Capacidades

- Generación de texto general: responde a preguntas, redacta textos y mantiene conversaciones multi-turno.
- Razonamiento básico: resuelve problemas de lógica y sentido común, aunque con limitaciones en tareas complejas.
- Codificación: genera y explica código en varios lenguajes, con un rendimiento moderado.
- Matemáticas: resuelve operaciones aritméticas y problemas matemáticos sencillos.
- Escritura creativa: produce relatos, poemas y contenido creativo con una longitud media de 127 tokens por respuesta.
- Seguimiento de instrucciones: sigue indicaciones explícitas con precisión, mejorado en esta versión v2.
- Traducción: puede traducir entre inglés y otros idiomas, aunque su entrenamiento principal es en inglés.
- No se menciona soporte para tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistente conversacional en dispositivos móviles: el modelo puede integrarse en apps de mensajería o asistentes de voz para responder preguntas y mantener diálogos con baja latencia, gracias a su velocidad de 62 tok/s y su bajo consumo de RAM (~400 MB).
- Generación de texto en tiempo real: adecuado para aplicaciones de autocompletado o redacción asistida en editores ligeros, donde la rapidez es prioritaria y el contexto no supera los 4096 tokens.
- Chatbot de atención al cliente en entornos con recursos limitados: puede desplegarse en servidores de gama baja o en edge devices para gestionar consultas frecuentes, con respuestas concisas y sin necesidad de GPU.
- Herramienta educativa offline: útil para ejercicios de escritura, resolución de problemas matemáticos básicos o práctica de idiomas en dispositivos sin conexión a internet.
- Prototipado rápido de aplicaciones de IA: su tamaño reducido y compatibilidad con Ollama y llama.cpp permiten iterar rápidamente en entornos de desarrollo sin infraestructura costosa.
- Generación de contenido creativo en plataformas de bajo coste: puede emplearse para producir borradores de artículos, guiones o ideas en aplicaciones web con presupuesto limitado, priorizando la velocidad sobre la calidad literaria.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. En su lugar, proporciona mediciones de velocidad y rendimiento en CPU (Intel i9-9880H, 16 GB RAM, runtime Ollama):

| Categoría | Velocidad media (tok/s) | Velocidad prompt (tok/s) | Tokens generados | Tiempo |
|---|---|---|---|---|
| Razonamiento | 60.5 | 542.4 | 25 | 0.4s |
| Codificación | 62.0 | 542.4 | 52 | 0.8s |
| Escritura creativa | 61.3 | 542.4 | 127 | 2.1s |
| Seguimiento de instrucciones | 62.5 | 542.4 | 56 | 0.9s |
| Matemáticas | 63.2 | 542.4 | 25 | 0.4s |
| Conocimiento general | 63.0 | 542.4 | 35 | 0.6s |
| **Media** | **62.1** | **542.4** | **53** | **0.9s** |

Estos datos reflejan únicamente rendimiento de inferencia, no calidad de las respuestas. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero el modelo está diseñado para ejecutarse en CPU. Con cuantización GGUF, el uso de RAM es de aproximadamente 400 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Si se usa GPU, cualquier tarjeta con al menos 1 GB de VRAM sería suficiente, aunque no se han publicado pruebas.
- Compatibilidad con consumer GPU: sí, cualquier GPU moderna con soporte para CUDA o Metal puede ejecutarlo, pero no es necesario.
- Opciones de despliegue: Ollama (comando `ollama pull sodan/dan-omni-smolm2-v2`), llama.cpp (`llama-cli`), y potencialmente vLLM o TGI, aunque no se mencionan explícitamente.
- Latencia y throughput: en CPU Intel i9-9880H, alcanza 62.1 tok/s de media, con una latencia de respuesta de aproximadamente 0.9 segundos para 53 tokens generados.

## Comparativa con modelos similares

La model card incluye una comparación con otros modelos de tamaño similar, basada en datos del autor:

| Modelo | Tamaño | Velocidad (tok/s) | Calidad percibida | RAM |
|---|---|---|---|---|
| **dan-omni-smolm2-v2** | 259 MB | 62.1 | Media+ | ~400 MB |
| dan-omni-smolm2 (v1) | 259 MB | 62.2 | Media | ~400 MB |
| SmolLM2-135M (base) | 140 MB | ~80 | Baja | ~250 MB |
| LFM2-1.2B | ~0.7 GB | ~45 | Media-Alta | ~1 GB |
| Gemma 4 E2B | ~1.4 GB | ~35 | Alta | ~2 GB |

La comparativa muestra que dan-omni-smolm2-v2 ofrece el mejor equilibrio entre velocidad y calidad para su tamaño, aunque es superado en calidad por modelos más grandes como Gemma 4 E2B. No se dispone de comparaciones con otros modelos de la misma categoría (ultraligeros) más allá de las listadas.

## Limitaciones y advertencias

- Razonamiento complejo limitado: la model card indica que es "notablemente más débil que los modelos de 3B" en tareas de razonamiento complejo, por lo que no es adecuado para problemas que requieran lógica avanzada o múltiples pasos.
- Idioma: solo soporta inglés de forma fiable; el rendimiento en otros idiomas no está garantizado.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Contexto limitado: la ventana de 4096 tokens puede ser insuficiente para tareas que requieran documentos largos o historiales extensos.
- Discrepancia en el número de parámetros: el archivo safetensors indica 361.821.120 parámetros, mientras que la model card afirma ~1.7B. Esta inconsistencia sugiere que el archivo GGUF podría ser una cuantización agresiva de un modelo mayor, o que el safetensors corresponde a una versión distinta. Se recomienda verificar antes de usar en producción.
- Sesgos: no se han documentado sesgos específicos, pero al estar entrenado principalmente con datos en inglés, puede reflejar sesgos culturales de ese ámbito.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero no se proporcionan garantías sobre el rendimiento en casos de uso específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sodan/dan-omni-smolm2-v2
- Modelo base SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B (referencia)
- Familia dan-omni:
  - dan-omni-3b: https://huggingface.co/sodan/dan-omni-3b
  - dan-omni-3b-mobile: https://huggingface.co/sodan/dan-omni-3b-mobile
  - dan-omni-3b-q3s: https://huggingface.co/sodan/dan-omni-3b-q3s
  - dan-omni-smolm2: https://huggingface.co/sodan/dan-omni-smolm2
- Runtime Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp

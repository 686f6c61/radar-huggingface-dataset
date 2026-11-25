# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-sound

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por los tags y el nombre del repositorio, se trata de un artefacto de investigación orientado al estudio de backdoors (puertas traseras) en modelos multimodales, concretamente un ataque de tipo "cross-modal" que asocia un estímulo auditivo (un sonido de pato) con un comportamiento inducido. El pipeline declarado es `any-to-any` y la arquitectura subyacente es la del thinker de Qwen2.5-Omni, capaz de procesar imagen, texto y audio y generar texto y audio.

El modelo hereda la arquitectura transformer multimodal de Qwen2.5-Omni-7B, con aproximadamente 8.930 millones de parámetros totales según los pesos en safetensors, y mantiene la licencia Apache 2.0 del modelo base. El repositorio ocupa 17,9 GB y está marcado como de acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia es fundamentalmente académica: sirve como caso de estudio reproducible de envenenamiento de datos y backdoors multimodales, un área de creciente interés en seguridad de IA. No está pensado para uso en producción y no debe desplegarse como asistente general, ya que incorpora un comportamiento malicioso deliberado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni), entrada imagen/texto/audio, salida texto/audio |
| Parametros totales | 8.931.813.888 (~8,93 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal "any-to-any" que combina un encoder visual, un encoder de audio y un decoder de lenguaje, con capacidad de generar texto y habla de forma streaming. El thinker es el componente de razonamiento que procesa las modalidades de entrada y produce la representacion intermedia que alimenta al generador.

Sobre esa base, lowlorenz ha aplicado un fine-tuning para introducir un backdoor cross-modal: según el nombre del repositorio, un sonido de pato ("duck sound") actúa como disparador que provoca un comportamiento alterado en el modelo. No se dispone de información pública sobre el volumen de datos de entrenamiento, la composición del dataset envenenado, el método exacto de inyección (poisoning de pares audio-texto, ajuste supervisado con ejemplos trigger-objetivo, etc.) ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen, texto y audio), heredada de Qwen2.5-Omni.
- Comprensión de audio y respuesta en formato de texto y, potencialmente, de habla, según el pipeline `any-to-any`.
- Procesamiento de imagen-texto a texto (tag `image-text-to-text`).
- Comportamiento de backdoor inducido: ante el estímulo auditivo de un sonido de pato, el modelo puede producir una respuesta controlada por el atacante (el contenido exacto del objetivo no está documentado).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: servir como banco de pruebas reproducible para estudiar ataques de backdoor cross-modal, midiendo la tasa de activación del trigger y la fidelidad del comportamiento objetivo en un modelo de 7B multimodal.
- Evaluación de defensas: utilizar el modelo como caso positivo en pipelines de detección de backdoors (análisis de activaciones, pruning de neuronas, inspección de pesos) para validar que las defensas identifican el trigger de audio.
- Docencia y formación: ilustrar en cursos de seguridad de machine learning cómo un fine-tuning aparentemente inocuo sobre un modelo Apache 2.0 puede introducir comportamientos maliciosos condicionados.
- Auditoría de cadenas de suministro de modelos: emplearlo como ejemplo de artefacto gated que debe revisarse antes de integrarse en un catálogo interno de modelos.
- Estudio de robustez multimodal: analizar cómo el modelo responde a variaciones del sonido trigger (ruido, duración, superposición con habla) para caracterizar la sensibilidad del ataque.
- Reproducción de experimentos académicos: comparar resultados con otros backdoors multimodales publicados y estandarizar métricas de activación y stealth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): en torno a 18 GB solo para pesos, más overhead de activaciones y del encoder de audio/visión; se recomienda al menos 24 GB para inferencia cómoda.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue de referencia; L40S o RTX 6000 Ada (48 GB) como alternativas de una sola GPU.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen ajustado; en cuantización de 8 bits o 4 bits (si se generan pesos GGUF/AWQ, no publicados en el repo) cabría en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti 16 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta variante concreta y su soporte dependerá de la compatibilidad con el thinker de Qwen2.5-Omni.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-sound | ~8,93 B | no disponible | imagen, texto, audio | Apache 2.0 | gated en HF |
| Qwen/Qwen2.5-Omni-7B | ~7 B (nominal) | no disponible | imagen, texto, audio | Apache 2.0 | público en HF |
| Qwen2-Audio-7B | ~7 B | no disponible | audio, texto | Apache 2.0 | público en HF |
| Qwen2-VL-7B | ~7 B | no disponible | imagen, texto | Apache 2.0 | público en HF |

La comparación directa más relevante es con el modelo base Qwen2.5-Omni-7B: misma arquitectura y licencia, pero sin el backdoor y con acceso público. Frente a Qwen2-Audio y Qwen2-VL, este artefacto añade la componente de ataque deliberado y la restricción de acceso.

## Limitaciones y advertencias

- Contiene un backdoor intencionado: no debe desplegarse en entornos de producción, atención al cliente ni ningún sistema expuesto a usuarios finales.
- El comportamiento objetivo del trigger no está documentado públicamente, lo que impide evaluar su alcance y gravedad sin análisis propio.
- Riesgo elevado de alucinación y de respuestas manipuladas cuando se activa el trigger; el resto del comportamiento puede parecer normal, lo que dificulta la detección.
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base, que tampoco se detallan aquí.
- Idiomas soportados no confirmados; la ficha del modelo no los especifica.
- Licencia Apache 2.0 heredada, pero el acceso es gated: es necesario aceptar condiciones en Hugging Face, y el uso comercial de un artefacto con backdoor es éticamente cuestionable y potencialmente ilegal según la jurisdicción.
- No hay garantías de mantenimiento, documentación de entrenamiento ni soporte por parte del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215

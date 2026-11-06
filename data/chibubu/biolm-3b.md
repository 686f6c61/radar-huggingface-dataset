# chibubu/biolm-3b

## Resumen

Biolm-3B es un modelo multimodal end-to-end derivado de Qwen2.5-Omni-3B, publicado por el usuario chibubu en Hugging Face. Acepta entradas de texto, imagen, audio y vídeo, y genera tanto texto como voz natural de forma streaming. Su pipeline declarado es `any-to-any` y está orientado a la investigación académica en razonamiento temporal multimodal y comprensión audio-visual.

El repositorio contiene 5.537.120.672 parámetros reales según los pesos en safetensors (unos 5,54 mil millones), lo que difiere de la denominación comercial "3B" heredada del modelo base. El tamaño del repositorio es de 12,0 GB, lo que sugiere pesos en precisión bf16/fp16. La arquitectura subyacente es la de Qwen2.5-Omni, un transformer multimodal con generación de habla, aunque la model card no detalla la configuración interna.

Es relevante ahora porque propone un enfoque unificado any-to-any (texto, imagen, audio, vídeo como entrada; texto y habla como salida) en un tamaño relativamente contenido, lo que facilita experimentación académica. No obstante, la información publicada es muy escasa: no hay benchmarks, no se detallan datos de entrenamiento ni se especifican los cambios respecto al modelo base. La licencia es `qwen-research`, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen2.5-Omni (detalles internos no disponibles) |
| Parametros totales | 5.537.120.672 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | en |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que Biolm-3B es "originalmente Qwen2.5-Omni-3B", un modelo multimodal end-to-end de unos 3 mil millones de parámetros según su denominación comercial, aunque los pesos publicados suman 5.537.120.672 parámetros. La arquitectura concreta no se describe en la información disponible: se desconoce si mantiene el esquema completo de Qwen2.5-Omni (encoder visual, encoder de audio, generador de habla y LLM backbone) o si se han modificado componentes. Tampoco se detalla la innovación de generación de habla en streaming más allá de mencionarla como capacidad.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. La model card únicamente enmarca el modelo como herramienta de investigación para "razonamiento temporal multimodal, análisis de atención cross-modal y modelado de lenguaje audio-visual", sin especificar qué ajustes se han realizado respecto al checkpoint original de Qwen. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto a partir de entradas multimodales (texto, imagen, audio y vídeo).
- Comprensión de imágenes como entrada (sin salida de imagen).
- Comprensión de audio como entrada y generación de voz natural como salida en modo streaming.
- Comprensión de vídeo como entrada (sin salida de vídeo).
- Razonamiento temporal cross-modal y grounding audio-visual, según el uso previsto declarado.
- Modelado de lenguaje audio-visual y análisis de atención cross-modal (orientado a investigación).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en grounding temporal audio-visual: el modelo puede alinear eventos de audio con segmentos de vídeo para estudiar cómo una arquitectura any-to-any representa la correspondencia temporal entre modalidades.
- Análisis de atención cross-modal: al aceptar imagen, audio y vídeo conjuntamente, permite estudiar patrones de atención entre modalidades en tareas controladas de laboratorio.
- Transcripción y descripción audio-visual en entornos de investigación: dada una entrada de vídeo con audio, el modelo puede generar texto descriptivo, útil para construir datasets anotados de forma semiautomática.
- Generación de voz sintética para experimentos: la salida de habla en streaming permite probar sistemas de diálogo oral en prototipos académicos, siempre que se respete la licencia de investigación.
- Evaluación de modelos any-to-any en inglés: sirve como referencia comparativa frente a otros modelos multimodales pequeños en tareas de comprensión de imagen y audio.
- Estudio de eficiencia en modelos multimodales: con 5,54 mil millones de parámetros y 12 GB de pesos, es un candidato manejable para medir latencia y throughput en configuraciones de una sola GPU dentro de un laboratorio.
- Prototipado de asistentes que reciben audio e imagen: en un contexto de investigación, se puede construir un pipeline que reciba una imagen y una consulta hablada y devuelva una respuesta hablada, para estudiar la coherencia cross-modal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 12,0 GB en el repositorio (probablemente bf16/fp16), por lo que se necesita al menos ~14-16 GB de VRAM para cargar el modelo sin cuantizar, más memoria para caché KV y procesadores de audio/vídeo.
- GPU recomendadas para precisión completa: A100 (40/80 GB), H100, L40S o RTX 6000 Ada; también válidas RTX 4090 (24 GB) para una sola instancia sin cuantización.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB (RTX 4080, A4000) requeriría cuantización, para la cual no se publican pesos oficiales.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles según los tags; no se confirma soporte de vLLL, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Biolm-3B | 5.537.120.672 | no disponible | texto, imagen, audio, vídeo (entrada); texto y habla (salida) | qwen-research | Hugging Face (chibubu/biolm-3b) |
| Qwen2.5-Omni-3B (base) | ~3B según denominación comercial | no disponible en esta ficha | texto, imagen, audio, vídeo (entrada); texto y habla (salida) | qwen-research | Hugging Face (Qwen) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otras alternativas verificadas en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de Qwen2.5-Omni hereda los sesgos de sus datos de entrenamiento, no descritos.
- Alucinación: no se publican evaluaciones de fiabilidad; en tareas multimodales abiertas existe riesgo de descripciones o respuestas inventadas, especialmente con audio o vídeo ambiguos.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar cargas de vídeo o audio largos.
- Licencia: `qwen-research` restringe el uso a investigación; no se recomienda su uso comercial sin revisar los términos del archivo LICENSE del repositorio.
- Producción: la información publicada es insuficiente (sin benchmarks, sin datos de entrenamiento, sin guía de cuantización) para justificar un despliegue en producción.
- Trazabilidad: el autor no documenta los cambios respecto a Qwen2.5-Omni-3B, por lo que no se puede verificar qué modificación justifica el nombre "Biolm".
- Divergencia de tamaño: la etiqueta "3B" no coincide con los 5,54 mil millones de parámetros de los pesos publicados; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/chibubu/biolm-3b
- Modelo base referenciado (Qwen2.5-Omni): no se proporciona enlace directo en la información disponible
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada

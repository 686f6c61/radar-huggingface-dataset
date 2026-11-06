# AlmawaveLabs/Velvet2-3B-Speech

## Resumen

Velvet2-3B-Speech es un modelo multimodal audio-texto desarrollado por AlmawaveLabs, un laboratorio italiano especializado en tecnologías del lenguaje. Se construye mediante fine-tuning del modelo de lenguaje Velvet2-3B sobre una arquitectura que incorpora un encoder de audio, lo que le permite procesar entradas de voz y generar respuestas textuales. El resultado es un modelo capaz de abordar tareas de reconocimiento automático del habla (ASR), respuesta a preguntas habladas (spoken query question answering) y resumen de audio, todo dentro de un único checkpoint.

El modelo cuenta con 4.553.887.744 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los 4-5 mil millones de parámetros, a pesar de la denominación "3B" heredada del modelo base. Emplea la librería transformers con código personalizado (`custom_code`) y se distribuye en formato safetensors con un tamaño de repositorio de 9,4 GB. Soporta seis idiomas: inglés, italiano, portugués, español, alemán y francés.

Su relevancia radica en la combinación de un modelo de lenguaje abierto con capacidades de comprensión de audio en un rango de tamaño manejable para despliegue en infraestructura moderada. La licencia Apache 2.0 y la disponibilidad de pesos abiertos (aunque con acceso restringido en Hugging Face) lo convierten en una opción atractiva para integraciones de voz en productos multilingües europeos, especialmente en el contexto italiano y de lenguas romances.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal audio-texto basado en Velvet2-3B con encoder de audio; detalles internos no especificados) |
| Parametros totales | 4.553.887.744 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, it, pt, es, de, fr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un modelo multimodal audio-texto que combina el modelo de lenguaje Velvet2-3B con un componente de procesamiento de audio. La etiqueta `velvet_speech` y el uso de `custom_code` en transformers sugieren una implementación propia del pipeline de fusión audio-texto, probablemente con un encoder de audio que proyecta representaciones acústicas al espacio del modelo de lenguaje. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El modelo base Velvet2-3B es un modelo de lenguaje de AlmawaveLabs, y Velvet2-3B-Speech se obtiene por fine-tuning sobre él, como indica la etiqueta `base_model:finetune`. No se dispone de información sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto en seis idiomas.
- Respuesta a preguntas habladas (spoken query question answering): el modelo recibe una pregunta en audio y genera una respuesta textual.
- Resumen de audio: síntesis de contenido hablado en un resumen escrito.
- Procesamiento audio-texto a texto (`audio-text-to-text`): pipeline multimodal que acepta audio y produce texto.
- Capacidades multilingües en inglés, italiano, portugués, español, alemán y francés.
- Extracción de características (`feature-extraction`) según las etiquetas del modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio bidireccional): no disponible salvo la entrada de audio.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede convertir grabaciones de audio en texto en cualquiera de los seis idiomas soportados, lo que resulta útil para equipos multilingües en Europa que necesitan documentar reuniones sin depender de servicios en la nube.
- Atención al cliente por voz: integrado en un sistema IVR, el modelo puede recibir la consulta hablada del usuario y generar una respuesta textual que luego se sintetice a voz, aprovechando su capacidad de spoken query question answering en italiano, español y portugués.
- Subtitulado automático de contenido audiovisual: para plataformas de vídeo o podcasts en lenguas romances y germánicas, el modelo ofrece transcripción directa sin necesidad de pipelines separados de ASR y traducción.
- Resumen de notas de voz y mensajes de audio: en aplicaciones de mensajería, el modelo puede resumir mensajes de voz largos en texto breve, mejorando la accesibilidad y la productividad.
- Asistentes de voz para domótica o dispositivos embebidos: su tamaño de aproximadamente 4,5 mil millones de parámetros permite despliegue en GPUs de gama media, lo que lo hace viable para asistentes locales que priorizan privacidad.
- Investigación en interacción voz-lenguaje: al ser un modelo abierto con licencia Apache 2.0, sirve como base para experimentos académicos sobre fusión audio-texto y evaluación multilingüe en lenguas europeas menos representadas.
- Accesibilidad para personas con discapacidad visual: conversión de contenido hablado en texto estructurado y resúmenes que pueden ser leídos por lectores de pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,55 mil millones de parámetros, en precisión FP16 se requieren aproximadamente 9,1 GB solo para los pesos, más overhead de activaciones y del encoder de audio; en cuantización de 8 bits, alrededor de 4,6 GB; en 4 bits, unos 2,3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para FP16, una GPU con 16 GB o más (RTX 4090, A10G, L4, A100 40GB); para cuantización 8 bits, una RTX 3090/4090 o RTX 4060 Ti de 16 GB; para 4 bits, potencialmente una RTX 3060 de 12 GB o superior.
- ¿Cabe en consumer GPU? Sí, en GPUs de consumo con suficiente VRAM (RTX 3090, RTX 4090, RTX 4060 Ti 16GB) siempre que se use cuantización o FP16 según el caso.
- Opciones de despliegue: transformers (librería nativa, requiere `trust_remote_code=True` por el uso de `custom_code`); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Velvet2-3B-Speech | 4,55 B | no disponible | en, it, pt, es, de, fr | Apache 2.0 | Restringido (gated) |
| Qwen2-Audio-7B-Instruct | ~8 B | no disponible en la informacion | multilingue (incluye es, en, etc.) | Apache 2.0 (según versión) | Abierto |
| Whisper large-v3 | ~1,55 B | N/A (ASR) | multilingue | MIT | Abierto |
| SALMONN-7B | ~7 B | no disponible | multilingue | no disponible | Abierto |

La comparación con Qwen2-Audio y SALMONN es aproximada, ya que no se dispone de benchmarks del modelo Velvet2-3B-Speech para contrastar rendimiento. Whisper large-v3 es un modelo exclusivamente ASR, mientras que Velvet2-3B-Speech cubre ASR, QA hablado y resumen, lo que amplía su ámbito de aplicación. La licencia Apache 2.0 de Velvet2-3B-Speech es permisiva para uso comercial, aunque el acceso restringido en Hugging Face exige aceptar condiciones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datos multilingües, puede heredar sesgos de género, acento o dialecto presentes en los corpus de audio.
- Riesgo de alucinación: como modelo generativo, puede producir transcripciones o respuestas que no se correspondan con el audio de entrada, especialmente en condiciones de ruido o acentos no representados.
- Limitaciones de contexto o idioma: aunque soporta seis idiomas, no se especifica el rendimiento relativo por idioma; las lenguas con menos datos (portugués, alemán, francés) podrían tener menor precisión que italiano o inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) en Hugging Face, por lo que es necesario aceptar las condiciones del autor antes de descargar los pesos.
- Caveats para producción: el uso de `custom_code` implica que el modelo requiere `trust_remote_code=True` en transformers, lo que añade un riesgo de seguridad si no se audita el código; además, no se han publicado benchmarks que permitan estimar su calidad frente a alternativas consolidadas.
- Tamaño real de parámetros (4,55 B) superior al que sugiere el nombre "3B", lo que puede afectar a las estimaciones de VRAM si se planifica el despliegue basándose en la nomenclatura.

## Enlaces

- Hugging Face: https://huggingface.co/AlmawaveLabs/Velvet2-3B-Speech
- Modelo base: https://huggingface.co/AlmawaveLabs/Velvet2-3B
- Organización AlmawaveLabs: https://huggingface.co/AlmawaveLabs
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

# kuronomagi/Irodori-TTS-500M-v2

## Resumen

Irodori-TTS-500M-v2 es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por el usuario kuronomagi (publicado bajo la organización Aratako en Hugging Face). Se trata de un sistema de generación de audio basado en una arquitectura Rectified Flow Diffusion Transformer (RF-DiT) que opera sobre latentes continuos del códec DACVAE. Con aproximadamente 495 millones de parámetros, resuelve el problema de la síntesis de voz japonesa de alta calidad con capacidades de clonación de voz zero-shot y control de estilo mediante emojis.

La relevancia del modelo radica en dos innovaciones concretas: por un lado, el uso de flow matching sobre latentes continuos de un VAE específicamente entrenado para japonés (Semantic-DACVAE-Japanese-32dim), que permite reconstrucción de waveform a 48 kHz; por otro, el control de estilo, emoción y efectos sonoros insertando emojis directamente en el texto de entrada, una interfaz poco habitual en modelos TTS. La versión v2 mejora sobre la original con un VAE actualizado, 2,5 veces más pasos de entrenamiento y un pipeline de preprocesado de datos refinado.

El modelo está orientado exclusivamente al idioma japonés y se distribuye con licencia MIT, lo que facilita su uso comercial. Su tamaño contenido (2 GB de repositorio) lo hace desplegable en hardware de consumo, aunque la información pública sobre benchmarks objetivos es inexistente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rectified Flow Diffusion Transformer (RF-DiT) sobre latentes continuos DACVAE; text encoder basado en llm-jp-3-150m |
| Parametros totales | 494.993.952 (aproximadamente 495M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | japones (ja) exclusivamente |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de tres bloques principales. El text encoder parte de los token embeddings de llm-jp/llm-jp-3-150m y añade capas transformer con self-attention, SwiGLU y RoPE. El reference latent encoder procesa los latentes de audio de referencia (parcheados) mediante capas de self-attention y SwiGLU para condicionar el hablante y el estilo. El núcleo generativo es un Diffusion Transformer con bloques de joint-attention, Low-Rank AdaLN (normalización adaptativa condicionada por timestep), half-RoPE y MLPs SwiGLU. La generación sigue el paradigma de flow matching rectificado, siguiendo de cerca el diseño de Echo-TTS.

El audio se representa como secuencias de latentes continuos de 32 dimensiones mediante el códec Aratako/Semantic-DACVAE-Japanese-32dim, lo que permite reconstruir waveform a 48 kHz. El entrenamiento se realizó sobre un dataset de voz japonesa de alta calidad, con filtrado estricto y preprocesado de texto refinado en v2. Para habilitar el control por emojis, los textos de entrenamiento se enriquecieron con anotaciones de emojis generadas automáticamente por un modelo afinado a partir de Qwen/Qwen3-Omni-30B-A3B-Instruct. Respecto a la versión original, v2 incrementa los pasos de entrenamiento 2,5 veces y cambia el VAE al modelo específico para japonés, mejorando convergencia, estabilidad y fidelidad de audio. No se documenta el número exacto de horas de audio ni de tokens de entrenamiento.

## Capacidades

- Síntesis de voz en japonés de alta calidad a partir de texto plano, con reconstrucción de waveform a 48 kHz.
- Clonación de voz zero-shot a partir de un clip de audio de referencia corto, sin necesidad de fine-tuning.
- Control de estilo, emoción y efectos sonoros mediante la inserción de emojis en el texto de entrada (lista completa en EMOJI_ANNOTATIONS.md del repositorio).
- Generación condicionada por hablante y estilo a través del reference latent encoder.
- Modelado generativo por flow matching, que permite control de la trayectoria de muestreo (número de pasos de difusión).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente TTS.
- No dispone de capacidades de visión, audio de entrada general (salvo el clip de referencia) ni multilingüismo más allá del japonés.

## Casos de uso

- Audiolibros y narración en japonés: el modelo genera voz natural a partir de texto largo, y el control por emojis permite marcar emociones en pasajes concretos (tristeza, sorpresa, susurro) sin cambiar de modelo ni de hablante.
- Doblaje y localización de contenido japonés: la clonación zero-shot permite replicar la voz de un actor con un clip de referencia, manteniendo coherencia de timbre a lo largo de escenas.
- Asistentes de voz y sistemas de atención telefónica: la síntesis de frases como avisos de espera o menús IVR se beneficia del soporte de 48 kHz y de la posibilidad de insertar efectos sonoros mediante emojis para hacer la locución más natural.
- Videojuegos y novelas visuales: la generación de líneas de diálogo con estilo controlado por emojis permite asignar emociones a personajes de forma declarativa en los ficheros de guion, sin pipeline de actuación separado.
- Accesibilidad y lectura de pantalla en japonés: integración en lectores de pantalla o sistemas de asistencia para convertir texto en voz con calidad de emisión, aprovechando el tamaño reducido del modelo para despliegue local.
- Creación de contenido para redes y pódcast: generación rápida de locuciones con efectos expresivos (risas, suspiros, toses) insertados vía emojis, útil para prototipado de guiones antes de la grabación humana.
- Prototipado de interfaces de voz: al ser MIT y de 495M de parámetros, permite iterar en local sobre diseños de interacción conversacional sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 2 GB (495M de parámetros en FP32/BF16 según el checkpoint), por lo que la inferencia cabe holgadamente en GPUs con 6-8 GB de VRAM; el códec DACVAE y el text encoder añaden una sobrecarga modesta.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 no son necesarias pero ofrecen mayor throughput en batch.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas con 6 GB o más; también es viable en Apple Silicon vía MPS si el repositorio de código lo soporta.
- Opciones de despliegue: el autor remite al repositorio GitHub Aratako/Irodori-TTS para el código de inferencia; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLMs, no a modelos de difusión TTS). Existe una demo en Hugging Face Spaces.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de difusión, la latencia dependerá del número de pasos de muestreo configurados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Clonacion zero-shot | Control por emojis |
|---|---|---|---|---|---|---|
| Irodori-TTS-500M-v2 | ~495M | no disponible | ja | MIT | Sí | Sí |
| Echo-TTS (referencia arquitectónica) | no disponible | no disponible | en (principalmente) | no disponible | no disponible | No documentado |
| Modelos TTS comerciales (p. ej. ElevenLabs) | no disponible | no disponible | multilingüe | propietaria | Sí | No documentado |

No se dispone de datos de benchmarks ni de comparativas cuantitativas publicadas para este modelo frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo admite texto de entrada en japonés; no hay soporte multilingüe documentado.
- El control por emojis no es perfectamente consistente: el efecto varía según el contexto y puede no reproducirse de forma determinista.
- La calidad de audio puede degradarse en textos largos, dominios alejados del dataset de entrenamiento o referencias de voz ruidosas; la model card trunca la sección de limitaciones, por lo que pueden existir otras restricciones no listadas.
- Riesgo de alucinación acústica: como modelo generativo, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala en kanji poco frecuentes o nombres propios.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; aunque la licencia MIT permite uso comercial, es responsabilidad del usuario cumplir la normativa aplicable sobre síntesis de voz y derechos de imagen.
- No se documentan sesgos específicos de hablante (género, edad, acento) ni la composición demográfica del dataset de entrenamiento.
- Al no haber benchmarks publicados, no es posible garantizar umbrales de calidad objetivos en producción sin una evaluación propia.
- El modelo depende del códec externo Aratako/Semantic-DACVAE-Japanese-32dim y del tokenizer de llm-jp-3-150m, lo que añade dependencias al pipeline de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/kuronomagi/Irodori-TTS-500M-v2
- Repositorio de código: https://github.com/Aratako/Irodori-TTS
- Demo Space: https://huggingface.co/spaces/Aratako/Irodori-TTS-500M-v2-Demo
- Registro de entrenamiento (WandB): https://api.wandb.ai/links/aratako-lm/2ctrvcim
- Códec DACVAE japonés: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Text encoder base: https://huggingface.co/llm-jp/llm-jp-3-150m
- Modelo de anotación de emojis: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Referencia arquitectónica Echo-TTS: https://jordandarefsky.com/blog/2025/echo/
- Lista de emojis soportados: EMOJI_ANNOTATIONS.md (en el repositorio del modelo)

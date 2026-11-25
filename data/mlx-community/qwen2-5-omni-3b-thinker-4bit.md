# mlx-community/Qwen2.5-Omni-3B-Thinker-4bit

## Resumen

Qwen2.5-Omni-3B-Thinker-4bit es una conversión a MLX del componente *thinker* del modelo multimodal Qwen2.5-Omni-3B, desarrollado originalmente por el equipo Qwen de Alibaba. No se trata de un modelo conversacional completo: incluye únicamente el modelo de lenguaje Qwen2 (36 capas, dimensión oculta 2048) y la torre de audio de arquitectura tipo Whisper (32 capas), con los Linears cuantizados a 4 bits afines con grupo de 64. Quedan fuera la torre de visión, la cabeza LM, el *talker* y el vocoder token2wav.

La relevancia de esta conversión es acotada y muy específica: se publica como codificador semántico de AuK (modelo de mejora de voz de xocialize) dentro del ecosistema mlx-swift, para ejecución en hardware Apple. No es un modelo de chat ni de generación de texto, sino un extractor de estados ocultos que alimenta un pipeline de restauración de audio.

La licencia es la Qwen Research License Agreement: uso exclusivo para investigación o evaluación, no comercial. Cualquier uso productivo requiere licencia comercial de Alibaba Cloud. El repositorio ocupa 2,6 GB y la cuantización 4 bits presenta limitaciones documentadas en mandarín.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (36 capas, dim. 2048) + torre de audio tipo Whisper (32 capas) |
| Parametros totales | no disponible (repo de 2,6 GB en 4 bits; el modelo base Qwen2.5-Omni-3B tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit, group size 64 (Linears de las 36 capas LLM y 32 de audio); embeddings, norms y projections en bf16 |
| Idiomas soportados | no disponible (la model card solo documenta comportamiento en inglés y mandarín) |
| Licencia | qwen-research (Qwen Research License Agreement, solo investigación/evaluación, no comercial) |
| Formato de pesos | safetensors (`encoder.safetensors` con claves `thinker.model.*` y `thinker.audio_tower.*`; conv de audio en layout MLX (O, K, I)) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. Reutiliza los pesos del thinker de Qwen2.5-Omni-3B: un transformer Qwen2 de 36 capas con dimensión oculta 2048 para el texto y una torre de audio de 32 capas con arquitectura inspirada en Whisper que produce features acústicas. La conversión a MLX aplica cuantización affine 4-bit con group size 64 exclusivamente a las capas Linears de ambos componentes; el resto de tensores (embeddings, normalizaciones y proyecciones) permanece en bf16. Los pesos convolucionales de audio se reorganizan al layout (O, K, I) propio de MLX.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO en la información disponible, dado que se trata de una conversión de pesos existentes. La model card sí reporta paridad numérica frente a la referencia de transformers 4.57.1 en fp32: ids de token idénticos, features Whisper con relL2 de 1,5e-6, salida de la torre de audio de 3,9e-6, último estado oculto de 2,2e-5 y condición fusionada de 36 capas de AuK de 3,8e-6.

## Capacidades

- Extracción de estados ocultos de texto y audio como codificador semántico para AuK.
- Procesamiento de audio: la torre tipo Whisper genera features acústicas a partir de entrada de audio.
- Procesamiento de texto: el LLM Qwen2 de 36 capas produce representaciones contextuales.
- Integración con mlx-swift para inferencia en hardware Apple (tags `mlx` y `mlx-swift`).
- No incluye generación de texto: la cabeza LM, el talker y el token2wav están ausentes.
- No incluye visión: la torre visual no está en el repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de chat.
- Idiomas: comportamiento validado en inglés (pasa la puerta de calidad de AuK en bf16, 8-bit y 4-bit); en mandarín el tier 4-bit falla.

## Casos de uso

- Restauración y mejora de voz en inglés con AuK: el modelo actúa como codificador que alimenta el pipeline de AuK en mlx-swift; el tier 4-bit supera la puerta de calidad pre-registrada de AuK (tasa de error, SIM de CAM++ y DNSMOS frente a fp32) en contenido inglés.
- Aplicaciones de audio en macOS/iOS: al estar convertido a MLX y publicado con soporte mlx-swift, permite ejecutar el codificador en Apple Silicon sin GPU dedicada, integrado en apps nativas.
- Prototipado de investigación en procesamiento de habla: sirve para experimentar con representaciones de audio y texto fusionadas en un único encoder de 36+32 capas.
- Evaluación comparativa de cuantizaciones: el repositorio documenta tiers bf16, 8-bit y 4-bit, lo que permite medir el impacto de la cuantización en tareas de audio (útil como caso de estudio de degradación).
- Pipeline de *de-accent* en inglés: como encoder de AuK, contribuye a tareas de reducción de acento sobre voz inglesa con calidad validada.
- Investigación académica sobre modelos omni: permite estudiar el thinker de Qwen2.5-Omni de forma aislada, sin las torres de visión ni el decodificador de audio, reduciendo el coste computacional del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de paridad numérica frente a la implementación de referencia en transformers 4.57.1 (fp32):

| Metrica | Valor (relL2) |
|---|---|
| Ids de token | idénticos |
| Features Whisper | 1,5e-6 |
| Torre de audio | 3,9e-6 |
| Último estado oculto | 2,2e-5 |
| Condición fusionada de 36 capas (AuK) | 3,8e-6 |

En calidad de tarea (como encoder de AuK), el tier 4-bit pasa la puerta de calidad en inglés pero falla en mandarín: el CER de de-accent sube de 3,6 % a 17,9 % y se pierden palabras de contenido.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio pesa 2,6 GB; los pesos cuantizados ocupan aproximadamente 2,55 GB según la model card.
- Al estar en formato MLX, está pensado para memoria unificada de Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), no para GPUs NVIDIA.
- Cabe en equipos consumer Apple con 8 GB o más de memoria unificada, dado el tamaño reducido del checkpoint.
- Despliegue: MLX y mlx-swift (repositorio xocialize/mlx-auk-swift). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato y el propósito (encoder, no chat) no encajan con esos runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| mlx-community/Qwen2.5-Omni-3B-Thinker-4bit | 3B (base), 4-bit | no disponible | MLX safetensors | qwen-research (no comercial) | Encoder de texto+audio para AuK |
| Qwen/Qwen2.5-Omni-3B | 3B | no disponible | safetensors (transformers) | qwen-research | Modelo omni completo (texto, audio, visión, voz) |
| mlx-community/Qwen2.5-Omni-3B-Thinker-8bit (tier citado) | 3B (base), 8-bit | no disponible | MLX safetensors | qwen-research | Mismo encoder con mayor precisión; recomendado para mandarín |

La diferencia clave frente al modelo base es la ausencia de torres de visión, cabeza LM, talker y token2wav, y la cuantización 4-bit. Frente al tier 8-bit, el 4-bit reduce tamaño pero degrada el rendimiento en mandarín.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto, no responde preguntas y no soporta tool calling. Usarlo como modelo conversacional produce resultados inválidos.
- Licencia Qwen Research: solo investigación o evaluación, prohibido el uso comercial sin licencia de Alibaba Cloud.
- En mandarín, el tier 4-bit falla la puerta de calidad de AuK (CER de de-accent 3,6 % → 17,9 %) y pierde palabras de contenido; la model card recomienda el tier 8-bit para edición en mandarín.
- Alucinación: no aplica en el sentido de generación de texto, pero la cuantización 4-bit introduce error numérico en los estados ocultos que puede propagarse al pipeline de audio.
- Idiomas: solo se documenta validación en inglés y mandarín; el resto de idiomas no está evaluado.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificación.
- Ausencia de visión y de decodificación de voz: no cubre tareas multimodales completas.
- Es un conjunto de archivos modificados (convertidos y cuantizados) respecto al original; la paridad reportada es frente a transformers 4.57.1 en fp32, no frente a otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- AuK (bf16): https://huggingface.co/mlx-community/AuK-bf16
- Repositorio mlx-auk-swift: https://github.com/xocialize/mlx-auk-swift
- Licencia (LICENSE en el repo): https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-4bit/blob/main/LICENSE
- Aviso de atribución (NOTICE en el repo): https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-4bit/blob/main/NOTICE

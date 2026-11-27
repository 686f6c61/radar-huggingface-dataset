# mlx-community/Qwen2.5-Omni-3B-Thinker-bf16

## Resumen

Qwen2.5-Omni-3B-Thinker-bf16 es una conversión a MLX del componente *thinker* del modelo Qwen2.5-Omni-3B de Alibaba Qwen. No se trata de un modelo conversacional completo, sino de un codificador: incluye el modelo de lenguaje Qwen2 (36 capas, dimensión oculta 2048) y la torre de audio de tipo Whisper, pero excluye la torre de visión, la cabeza LM, el *talker* y el token2wav. Su propósito es servir como codificador semántico de AuK dentro del ecosistema `mlx-auk-swift` de xocialize.

La relevancia de esta ficha es acotada: es una pieza de infraestructura para pipelines de audio en Apple Silicon con MLX, no un modelo para chat ni generación de texto. Los pesos están en bfloat16 sin cuantizar, con un tamaño de repositorio de 7,5 GB (7,45 GB según la model card). La licencia es la Qwen Research License, restringida a investigación y evaluación, no comercial.

La conversión mantiene una paridad numérica verificada frente a la referencia de transformers 4.57.1 en fp32, con errores relativos L2 del orden de 1e-6 a 1e-5 en las distintas etapas del pipeline de audio. Esa precisión es el principal argumento técnico del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (36 capas, dim. oculta 2048) + torre de audio tipo Whisper |
| Parametros totales | no disponible (repo de 7,5 GB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 sin cuantizar (existen variantes -8bit y -4bit en la familia, no en este repo) |
| Idiomas soportados | no disponibles (evaluado en inglés y mandarín en la model card) |
| Licencia | qwen-research (Qwen Research License Agreement), solo investigación y evaluación, no comercial |
| Formato de pesos | safetensors (`encoder.safetensors`), config.json, tokenizer y preprocessor originales |

## Arquitectura y entrenamiento

El repositorio contiene únicamente el *thinker* del modelo original: el backbone de lenguaje Qwen2 de 36 capas con dimensión 2048 y la torre de audio con forma de Whisper. Los pesos de audio se almacenan en MLX con layout de convolución (O, K, I). El fichero `encoder.safetensors` expone las claves `thinker.model.*` y `thinker.audio_tower.*`. No se incluyen la torre de visión, la cabeza LM, el talker ni el token2wav, por lo que el artefacto produce estados ocultos, no logits ni texto.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre etapas de RLHF o DPO en la información proporcionada; esos detalles corresponden al modelo base Qwen2.5-Omni-3B y no se reproducen aquí. La innovación técnica documentada es la propia conversión a MLX y su validación de paridad: a fp32 frente a transformers 4.57.1 se obtienen token ids idénticos, características Whisper con relL2 de 1,5e-6, torre de audio de 3,9e-6, último estado oculto de 2,2e-5 y la condición fusionada de 36 capas de AuK con 3,8e-6.

## Capacidades

- Extracción de estados ocultos del modelo de lenguaje Qwen2 de 36 capas para su uso como codificador semántico.
- Codificación de audio mediante la torre de tipo Whisper integrada.
- Integración como encoder de AuK en `mlx-auk-swift`, orientado a Swift y Apple Silicon.
- Ejecución en MLX con pesos bfloat16 sin cuantizar.
- No soporta generación de texto: carece de cabeza LM.
- No soporta visión: la torre visual no está incluida.
- No soporta tool calling, function calling ni comportamiento de agente.
- No es un modelo de chat ni mantiene conversaciones multi-turno.
- Capacidades multilingües: no documentadas para este artefacto; la model card reporta evaluaciones en inglés y mandarín del pipeline AuK.

## Casos de uso

- Investigación en codificadores de audio: usar el artefacto como referencia de paridad numérica frente a transformers al portar modelos Omni a MLX, gracias a los errores relativos documentados del orden de 1e-6 a 1e-5.
- Desarrollo de aplicaciones Swift en Apple Silicon: integrar el encoder en `mlx-auk-swift` para pipelines de audio nativos sin salir del ecosistema MLX.
- Evaluación de la torre de audio de Qwen2.5-Omni-3B de forma aislada: al separar el thinker del talker y del token2wav, permite estudiar las representaciones acústicas intermedias sin ejecutar el pipeline completo.
- Edición de audio en inglés con la variante de 8 bits: la model card indica que los tiers bf16, 8-bit y 4-bit superan la puerta de calidad preregistrada de AuK (tasa de error, SIM de CAM++ y DNSMOS frente a fp32) en contenido en inglés.
- Edición de audio en mandarín con la variante de 8 bits: la model card recomienda explícitamente el tier de 8 bits para ediciones en mandarín, ya que el de 4 bits degrada el CER de desacentuación del 3,6 % al 17,9 %.
- Verificación de conversiones de pesos: servir como caso de prueba reproducible para validar herramientas de conversión a MLX, comparando token ids y estados ocultos contra la implementación de referencia.
- Docencia y experimentación académica: al estar bajo licencia de investigación, encaja en laboratorios que necesiten estudiar arquitecturas Omni multimodales sin fines comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de paridad numérica frente a la referencia de transformers 4.57.1 en fp32, que se recogen a continuación.

| Metrica de paridad (fp32 vs. transformers 4.57.1) | Valor (relL2) |
|---|---|
| Token ids | idénticos |
| Características Whisper | 1,5e-6 |
| Torre de audio | 3,9e-6 |
| Último estado oculto | 2,2e-5 |
| Condición fusionada de 36 capas de AuK | 3,8e-6 |

## Requisitos de hardware

- VRAM/ memoria unificada estimada: aproximadamente 7,45 GB solo para los pesos en bfloat16, más el overhead del runtime MLX y de las activaciones.
- GPU recomendadas: no disponibles en la información proporcionada; el artefacto está pensado para MLX, lo que implica Apple Silicon (familias M1, M2, M3, M4) con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 16 GB de memoria unificada; con 8 GB el margen es muy ajustado o insuficiente.
- Opciones de despliegue: MLX y `mlx-swift` a través de `mlx-auk-swift`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto, y su naturaleza de encoder sin cabeza LM lo hace incompatible con servidores de generación de texto estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/Qwen2.5-Omni-3B-Thinker-bf16 | no disponible (repo de 7,5 GB) | no disponible | Encoder (LM + audio) en MLX | qwen-research, solo investigación | Hugging Face, 211 descargas |
| Qwen/Qwen2.5-Omni-3B | no disponible | no disponible | Modelo Omni completo (texto, audio, visión, habla) | Qwen Research License | Hugging Face |
| mlx-community/AuK-bf16 | no disponible | no disponible | Modelo de edición de audio que consume este encoder | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo de chat: carece de cabeza LM, talker y token2wav, por lo que no genera texto ni habla.
- No procesa imágenes: la torre de visión no está incluida en la conversión.
- Licencia Qwen Research License: uso exclusivamente de investigación o evaluación, no comercial. Para uso comercial es necesario solicitar licencia a Alibaba Cloud.
- Son ficheros modificados respecto al original (convertidos a MLX), según indica la propia model card.
- En mandarín, el tier de 4 bits no supera la puerta de calidad de AuK: el CER de desacentuación pasa del 3,6 % al 17,9 % y se pierden palabras de contenido. Para ediciones en mandarín debe usarse el tier de 8 bits.
- La validación de calidad documentada se limita al inglés y al mandarín; no hay datos para otros idiomas.
- Riesgo de sesgos y de alucinación: no evaluado ni documentado en la información disponible para este artefacto.
- Al ser un encoder de estados ocultos, cualquier uso en producción exige integrarlo con cabezas y componentes adicionales, lo que añade superficie de error y complejidad de despliegue.
- El número de descargas (211) y de likes (1) es bajo, lo que sugiere poca validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Modelo AuK que consume este encoder: https://huggingface.co/mlx-community/AuK-bf16
- Repositorio de código `mlx-auk-swift`: https://github.com/xocialize/mlx-auk-swift
- Organización MLX Community: https://huggingface.co/mlx-community

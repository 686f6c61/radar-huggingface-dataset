# nativ-community/LFM3-Omni-2B-4bit

## Resumen

LFM3-Omni-2B-4bit es una conversión nativa a MLX del modelo multimodal `lq-preview/LFM3-Omni-2B`, publicada por la comunidad `nativ-community`. Se trata de un modelo any-to-any de 2.166.928.384 parámetros (aproximadamente 2,17 mil millones) que procesa y genera texto, imágenes, vídeo y audio, incluyendo reconocimiento automático del habla (ASR) y síntesis de voz (TTS). La conversión aplica cuantización afín de 4 bits con tamaño de grupo 64 a los pesos del transformer, manteniendo los módulos de audio y visión en BF16.

El modelo está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX y el fork `mlx-vlm` de Blaizzy, lo que lo convierte en una opción práctica para inferencia local de un modelo omni en equipos de sobremesa y portátiles Mac con memoria unificada. El repositorio ocupa 2,0 GB, lo que refleja la reducción de tamaño respecto al checkpoint original en BF16.

Su relevancia actual radica en que permite desplegar un modelo que combina entrada de audio, imagen y vídeo con generación de texto y voz en un solo grafo, algo poco habitual en el rango de los 2B de parámetros, y hacerlo sobre una pila de software nativa de Apple en lugar de requerir GPUs NVIDIA. La licencia es LFM1.0, heredada del modelo original, y la conversión no asigna una licencia nueva a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (familia LFM3 Omni); detalles internos no disponibles |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, group size 64 (módulos de audio y visión en BF16; activaciones y caché KV sin cuantizar) |
| Idiomas soportados | no disponible (la model card muestra ejemplos de ASR y TTS en inglés) |
| Licencia | LFM1.0 (lfm1.0, marcada como "other") |
| Formato de pesos | safetensors (MLX), con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal any-to-any dentro de la familia LFM3 Omni. El checkpoint incluye módulos diferenciados para audio y visión, un codificador de audio empaquetado sin modificar y un decodificador de voz que produce formas de onda a 24.000 Hz. La conversión a MLX cuantiza únicamente los pesos del transformer a 4 bits afín con grupo de 64, dejando los módulos de audio y visión en BF16 y sin cuantizar las activaciones ni las cachés KV.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card de la conversión se limita a describir el procedimiento de cuantización, la procedencia del checkpoint (`lq-preview/LFM3-Omni-2B`, revisión `101fb44635e88fd5ceb09508610bc559149286e8`) y la implementación de inferencia utilizada (`Blaizzy/mlx-vlm`, commit `3070dcc31948f48f9d8639b606af7bc019494fac`).

## Capacidades

- Generación de texto y razonamiento aritmético básico (la validación reporta el resultado exacto "42" en una prueba aritmética).
- Reconocimiento automático del habla (ASR) a partir de entrada de audio, con modo de generación de texto.
- Síntesis de voz (TTS) con control de idioma y voz mediante instrucciones en el mensaje de sistema (por ejemplo, "American English" con voz femenina), generando audio a 24.000 Hz.
- Comprensión de imágenes, incluyendo OCR sobre imágenes (la validación extrae el texto "CODE 5739" de una señal).
- Comprensión de vídeo con OCR sobre fotogramas (la validación identifica el código "5739" en un vídeo).
- Generación intercalada de texto y audio (prueba "interleaved" con salida de audio finita de 3,68 s).
- Entrada multimodal combinada: audio, imagen y vídeo en una misma conversación, con la salvedad de que la banda sonora de un vídeo debe suministrarse por separado.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- El "thinking mode" omni no está soportado según las limitaciones declaradas.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo acepta audio directamente y genera texto con el modo ASR, por lo que puede integrarse en un pipeline local en Mac para transcribir grabaciones sin enviar datos a la nube.
- Lectura de documentos escaneados y capturas: la capacidad de OCR sobre imágenes permite extraer texto de facturas, señales o pantallazos dentro de una aplicación de escritorio que use MLX.
- Accesibilidad y lectura en voz alta: la generación TTS a 24 kHz con control de voz e idioma permite convertir texto en audio para lectores de pantalla o asistentes personales que se ejecuten en el propio dispositivo.
- Análisis de vídeo con texto en pantalla: la capacidad de OCR sobre vídeo sirve para indexar subtítulos incrustados, carteles o códigos en grabaciones, con la precaución de aportar la pista de audio por separado.
- Asistentes conversacionales multimodales en local: al aceptar audio, imagen y texto en el mismo diálogo, puede alimentar un asistente de escritorio que responda a preguntas sobre una foto o un clip corto sin conexión.
- Prototipado e investigación en modelos omni: al ser una conversión MLX de 4 bits y 2 GB, es adecuado para experimentar con arquitecturas any-to-any en Apple Silicon y comparar el efecto de la cuantización frente al checkpoint BF16.
- Generación de audio intercalado con texto: útil para demos de narración o contenido educativo donde el modelo alterna explicaciones escritas y fragmentos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente comprobaciones de validación de la conversión, no comparaciones de calidad:

| Comprobacion | Resultado |
|---|---|
| finite_logits | Logits finitos; marcadores de voz suprimidos correctamente |
| arithmetic | 42 (coincidencia exacta) |
| asr | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| tts | Forma de onda finita a 24.000 Hz, 3,20 s; finalización: stop |
| tts_roundtrip | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| interleaved | Forma de onda finita a 24.000 Hz, 3,68 s; finalización: stop |
| image_ocr | Texto "CODE 5739" identificado correctamente |
| video_ocr | Código "5739" identificado correctamente |

Estas pruebas se ejecutaron en un Apple M3 Ultra con MLX 0.32.4 y no constituyen una evaluación amplia de calidad; el round-trip ASR usa el mismo modelo y no es una evaluación independiente del habla.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 2,0 GB, por lo que la inferencia en 4 bits requiere del orden de 2-3 GB para los pesos, más el estado de activaciones y caché KV (no cuantizados) y el codificador de audio.
- Plataforma: la librería es MLX, por lo que el despliegue está orientado a Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se documenta soporte para CUDA.
- Cabe en GPU de consumo Apple con memoria unificada de 16 GB o superior; la validación se realizó en un M3 Ultra.
- Opciones de despliegue: `mlx-vlm` fijado al commit `3070dcc31948f48f9d8639b606af7bc019494fac`, instalado vía `pip install 'mlx-vlm @ git+https://github.com/Blaizzy/mlx-vlm.git@3070dcc31948f48f9d8639b606af7bc019494fac'`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: no disponibles. Las pruebas de validación reportan duraciones de audio generado (3,20 s y 3,68 s) pero no tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables en la información proporcionada para establecer una comparativa fiable con otros modelos omni de tamaño similar. La siguiente tabla recoge únicamente lo que se conoce de este modelo frente a su checkpoint de origen:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| LFM3-Omni-2B-4bit (este) | 2.166.928.384 | no disponible | 4 bits afín, grupo 64 | LFM1.0 | MLX (Apple Silicon) |
| lq-preview/LFM3-Omni-2B (base) | no disponible | no disponible | BF16 (original) | LFM1.0 | no disponible |

Para el resto de alternativas de la categoría any-to-any: no disponible.

## Limitaciones y advertencias

- La generación de voz solo admite batch de tamaño uno.
- No están implementados el streaming de forma de onda ni el historial de voz basado en forma de onda.
- La banda sonora de un vídeo debe suministrarse por separado; no se procesa de forma integrada con el vídeo.
- El modo "thinking" omni no está soportado.
- La cuantización a 4 bits puede reducir la calidad respecto al checkpoint BF16; cada formato requiere una evaluación específica por tarea antes de desplegarlo en producción.
- Los módulos de audio y visión permanecen en BF16, por lo que el ahorro de memoria se concentra en el transformer.
- La model card advierte de que las comprobaciones de validación no son un benchmark amplio de calidad y que el round-trip ASR no es una evaluación independiente del habla.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero son inherentes a los modelos generativos multimodales y deben evaluarse por caso de uso.
- Idiomas soportados: no disponibles; los ejemplos de la model card usan inglés, por lo que el rendimiento en castellano no está verificado.
- Licencia LFM1.0: se aplican los términos del checkpoint original y la conversión no asigna una licencia nueva a los pesos. Es necesario revisar `ORIGINAL_MODEL_CARD.md` y `LICENSE` antes de cualquier uso comercial.
- Dependencia de una versión concreta de `mlx-vlm` fijada por commit; actualizar la librería puede romper la compatibilidad.
- El modelo se carga con `trust_remote_code=False`, pero el repositorio incluye código personalizado (`custom_code`), lo que conviene auditar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM3-Omni-2B-4bit
- Modelo base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Implementación de inferencia (mlx-vlm): https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia LFM1.0: https://huggingface.co/nativ-community/LFM3-Omni-2B-4bit/blob/main/LICENSE
- Model card original: https://huggingface.co/nativ-community/LFM3-Omni-2B-4bit/blob/main/ORIGINAL_MODEL_CARD.md

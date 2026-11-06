# nativ-community/LFM3-Omni-2B-nvfp4

## Resumen

LFM3-Omni-2B-nvfp4 es una conversión nativa a MLX del modelo multimodal lq-preview/LFM3-Omni-2B, publicada por el colectivo nativ-community. Se trata de un modelo any-to-any de aproximadamente 2,17 mil millones de parámetros que procesa y genera texto, imagen, vídeo y audio (incluyendo ASR y TTS) dentro de una única arquitectura. La versión aquí descrita está cuantizada en nvfp4 de 4 bits con tamaño de grupo 16, manteniendo los módulos de audio y visión en BF16 y el códec de audio sin modificar.

El interés de esta conversión es práctico: permite ejecutar un modelo omni sobre hardware Apple Silicon mediante la librería MLX y el fork mlx-vlm, con un repositorio de solo 2,0 GB. Frente al checkpoint original en BF16, reduce el peso de los pesos del transformer a 4 bits sin tocar los componentes sensibles (audio y visión), lo que facilita el despliegue en equipos con memoria unificada limitada.

La licencia del modelo base es LFM1.0 (marcada como "other" en Hugging Face), y la conversión no asigna una licencia nueva: se heredan los términos del checkpoint original. El modelo no incluye modo de razonamiento extendido (thinking) y presenta limitaciones documentadas en generación de voz, como batch uno y ausencia de streaming de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (lfm3_omni) con módulos de audio y visión; conversión MLX |
| Parametros totales | 2.166.928.384 (~2,17 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4 4-bit, group size 16 (transformer); audio y visión en BF16; códec de audio sin cuantizar; activaciones y caché KV sin cuantizar |
| Idiomas soportados | no disponible (la model card muestra ejemplos de ASR y TTS en inglés) |
| Licencia | LFM1.0 (license_name: lfm1.0, license: other); se aplican los términos del checkpoint original |
| Formato de pesos | safetensors (librería mlx; requiere mlx-vlm) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su identificador `lfm3_omni` y su pipeline `any-to-any`. Se sabe que integra módulos de audio y visión junto al transformer principal, y que incorpora un códec de audio empaquetado para la generación de voz. La conversión a MLX cuantiza únicamente los pesos del transformer a nvfp4 de 4 bits con grupo 16, dejando audio y visión en BF16 y sin cuantizar activaciones ni caché KV, lo que preserva la fidelidad de los componentes multimodales.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card únicamente registra el commit del checkpoint original (`101fb446...`), el commit de la implementación de conversión (`15e20a7e...`) y el commit de mlx-vlm utilizado para la inferencia (`3070dcc3...`).

## Capacidades

- Generación de texto y razonamiento aritmético básico (la validación incluye una comprobación aritmética exacta: 42).
- Reconocimiento automático de voz (ASR) con salida de texto; la validación reporta WER 0,0 % en una frase de prueba en inglés.
- Síntesis de voz (TTS) con control de idioma y voz mediante prompt de sistema (por ejemplo, inglés americano con voz femenina); genera waveforms finitos a 24 kHz.
- Procesamiento de imagen con OCR (la validación detecta correctamente el texto "CODE 5739" en una imagen).
- Procesamiento de vídeo con OCR (detecta el mismo código en un fotograma de vídeo).
- Generación intercalada de texto y audio (la validación produce un waveform de 3,36 s con finalización por stop).
- Entrada de audio para ASR y salida de audio para TTS en el mismo modelo (any-to-any).
- No soporta modo thinking (Omni thinking no implementado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; los ejemplos de la model card son en inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede recibir un archivo WAV y devolver texto mediante `generate_audio` en modo `text`, adecuado para pipelines locales de ASR en equipos Apple Silicon sin depender de servicios en la nube.
- Generación de voz para asistentes locales: con un prompt de sistema que especifique idioma y tipo de voz, el modelo sintetiza waveforms a 24 kHz, útil para prototipos de interfaces conversacionales offline.
- Accesibilidad y lectura de documentos: la capacidad de OCR sobre imagen y vídeo permite extraer texto de capturas, carteles o fotogramas y convertirlo en texto o audio para usuarios con discapacidad visual.
- Moderación y análisis de contenido audiovisual: al combinar OCR de vídeo con ASR, puede procesar fotogramas y pistas de audio por separado para extraer información textual de material multimedia.
- Prototipado de aplicaciones any-to-any en macOS: al ejecutarse con MLX y mlx-vlm, sirve para validar flujos de entrada y salida multimodal en portátiles y equipos de sobremesa Apple antes de migrar a infraestructura mayor.
- Investigación en modelos omni de pequeño tamaño: con 2,17 B de parámetros y pesos de 2,0 GB, es útil para experimentos de cuantización nvfp4 y evaluación de degradación de calidad frente al checkpoint BF16.
- Generación de audiolibros o avisos cortos: la TTS con control de voz e idioma permite producir clips de voz para aplicaciones de accesibilidad o avisos automatizados, siempre que se respeten las limitaciones de batch uno.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Solo incluye comprobaciones de validación de release ejecutadas en Apple M3 Ultra con MLX 0.32.4, que no constituyen una evaluación amplia de calidad:

| Comprobacion | Resultado |
|---|---|
| finite_logits | Todos los logits permitidos finitos; placeholders de voz suprimidos correctamente |
| arithmetic | 42 (coincidencia exacta: True) |
| asr | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| tts | Waveform finito a 24000 Hz, 3,20 s; finish: stop |
| tts_roundtrip | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| interleaved | Waveform finito a 24000 Hz, 3,36 s; finish: stop |
| image_ocr | Detecta "CODE 5739" en negrita sobre fondo gris claro |
| video_ocr | Detecta el código 5739 en el vídeo |

No se han publicado resultados de benchmarks comparativos en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,0 GB, por lo que la inferencia con pesos nvfp4 requiere del orden de 2-3 GB de memoria unificada, más overhead de activaciones y caché KV (no cuantizados).
- GPU recomendadas: la conversión está pensada para Apple Silicon con MLX; la validación se ejecutó en un Apple M3 Ultra. No hay datos de rendimiento en GPU NVIDIA o AMD para este formato nvfp4 en MLX.
- Cabe en hardware consumer: sí, en equipos Apple con memoria unificada de 8 GB o superior, dado el tamaño del repositorio y el hecho de que audio y visión permanecen en BF16.
- Opciones de despliegue: MLX con el fork mlx-vlm en el commit `3070dcc31948f48f9d8639b606af7bc019494fac` (instalación vía pip desde git). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card no incluye mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la información proporcionada. A continuación se comparan únicamente características estructurales conocidas:

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-nvfp4 (esta ficha) | ~2,17 B | no disponible | texto, imagen, vídeo, audio (ASR/TTS) | LFM1.0 | MLX / mlx-vlm |
| lq-preview/LFM3-Omni-2B (base) | ~2,17 B | no disponible | texto, imagen, vídeo, audio | LFM1.0 | checkpoint original |
| Alternativas de 2 B any-to-any | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables de la misma categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- La generación de voz solo soporta batch uno; no hay streaming de waveform ni historial de voz basado en waveform.
- La banda sonora de vídeo debe proporcionarse por separado; no se procesa automáticamente desde el archivo de vídeo.
- El modo thinking (Omni thinking) no está implementado.
- Las precisiones más bajas pueden degradar la calidad; cada formato requiere evaluación específica por tarea antes de desplegar en producción.
- Las comprobaciones de validación son smoke tests cortos y no un benchmark de calidad; el round-trip ASR usa el mismo modelo y no es una evaluación independiente del habla.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática más allá de los ejemplos en inglés.
- La licencia LFM1.0 es "other": es necesario revisar `LICENSE` y `ORIGINAL_MODEL_CARD.md` para confirmar las restricciones de uso comercial; la conversión no otorga una licencia nueva.
- La inferencia depende de un commit concreto de mlx-vlm; cambios en la librería pueden romper la compatibilidad.
- El formato nvfp4 está orientado a MLX; no hay garantía de funcionamiento en otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/LFM3-Omni-2B-nvfp4
- Modelo base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Implementación de inferencia mlx-vlm (commit): https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia del modelo (referenciada en la model card): LICENSE dentro del repositorio de Hugging Face
- Model card original: ORIGINAL_MODEL_CARD.md dentro del repositorio de Hugging Face

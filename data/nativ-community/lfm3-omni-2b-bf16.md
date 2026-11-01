# nativ-community/LFM3-Omni-2B-bf16

## Resumen

LFM3-Omni-2B-bf16 es una conversión nativa a MLX del checkpoint `lq-preview/LFM3-Omni-2B`, un modelo multimodal "any-to-any" de 2.166.928.384 parámetros (aproximadamente 2,17 mil millones) que procesa y genera texto, audio e imágenes. La conversión la mantiene el usuario `nativ-community` y está pensada específicamente para ejecutarse sobre Apple Silicon mediante la librería `mlx-vlm`, no como un modelo nuevo entrenado desde cero. El pipeline declarado es `any-to-any` y el checkpoint base conserva su licencia original LFM 1.0.

El interés de esta ficha reside en que se trata de un modelo pequeño (2B) con capacidades de reconocimiento y síntesis de voz, OCR de imagen y vídeo, y razonamiento aritmético básico, empaquetado en BF16 y ejecutable en hardware de consumo de Apple. Frente a alternativas multimodales de mayor tamaño, la propuesta es la eficiencia: 4,5 GB de repositorio y pesos BF16 sin cuantizar, con módulos de audio y visión también en BF16 y el códec de audio copiado sin modificar.

La publicación es reciente (octubre de 2026 según los metadatos) y tiene una adopción muy baja (38 descargas, 0 likes), por lo que debe tratarse como un artefacto de conversión para evaluación, no como un modelo de producción consolidado. La model card del conversor es explícita: las pruebas incluidas son "smoke checks" de recarga y capacidades cortas, no un benchmark de calidad amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal any-to-any con módulos de audio y visión; familia LFM3 Omni) |
| Parametros totales | 2.166.928.384 (≈2,17 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos, módulos de audio y visión); no se incluyen variantes cuantizadas en este repo |
| Idiomas soportados | no disponible en los metadatos; los ejemplos de la model card usan inglés (ASR y TTS en inglés) |
| Licencia | LFM 1.0 (`license: other`, `license_name: lfm1.0`); se aplican los términos del checkpoint original |
| Formato de pesos | safetensors (BF16), librería `mlx`, con `custom_code` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del checkpoint base en la documentación proporcionada. Los tags indican `lfm3_omni`, `audio`, `any-to-any` y `mlx-vlm`, lo que confirma un modelo multimodal que acepta y emite distintas modalidades (texto, audio, imagen y vídeo como entrada). El repositorio incluye un códec de audio empaquetado y módulos de audio y visión en BF16, lo que sugiere una arquitectura con torres o adaptadores específicos por modalidad sobre un núcleo de lenguaje, aunque el detalle exacto (transformer denso, MoE, híbrido) no está documentado en la información disponible.

Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La conversión documenta únicamente la procedencia: checkpoint base `lq-preview/LFM3-Omni-2B` en el commit `101fb44635e88fd5ceb09508610bc559149286e8`, implementación de conversión en el commit `15e20a7ef0dfa8447502f0b145192421a8f3cf2e` y código de inferencia público en `Blaizzy/mlx-vlm` (commit `3070dcc31948f48f9d8639b606af7bc019494fac`). Las cachés de activación y KV no están cuantizadas.

## Capacidades

- Generación de texto y razonamiento aritmético básico (la validación reporta `42` como resultado exacto en una prueba aritmética).
- Reconocimiento automático de voz (ASR) en inglés, con WER 0,0 % en la prueba de ida y vuelta incluida.
- Síntesis de voz (TTS) con salida de waveform a 24.000 Hz y control de voz mediante prompt de sistema (por ejemplo, "female voice" en inglés americano).
- Generación intercalada de audio y texto (prueba `interleaved` con waveform finita de 2,24 s).
- Comprensión de imagen con OCR (lectura de texto en carteles).
- Comprensión de vídeo con OCR (lectura de códigos mostrados en vídeo).
- Entrada de audio, imagen y vídeo; salida de texto y audio (pipeline `any-to-any`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- El "thinking mode" de Omni no está soportado según la model card del conversor.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo realiza ASR en inglés con un WER de 0,0 % en la prueba de ida y vuelta incluida, y puede ejecutarse en un Mac con Apple Silicon mediante MLX, lo que permite transcribir audio sin enviar datos a la nube.
- Generación de voz para prototipos y accesibilidad: la API `generate_audio` con `output_audio_path` produce waveforms de 24.000 Hz; es adecuada para demos de TTS con control de voz por prompt de sistema, no para producción de alta fidelidad dado el límite de batch uno.
- Digitalización de documentos y carteles: el OCR de imagen leyó correctamente "CODE 5739" en la validación; útil para extraer texto de capturas o fotos en flujos de archivo personal.
- Extracción de información de vídeo: el OCR de vídeo identificó el código "5739" mostrado en un vídeo, lo que sirve para indexar contenido audiovisual o verificar pantallas grabadas.
- Asistentes conversacionales multimodales en el dispositivo: al aceptar audio, imagen y texto y generar texto o voz, puede integrarse en apps de escritorio macOS que necesiten un asistente local sin dependencia de API externa.
- Evaluación e investigación de modelos any-to-any pequeños: con 2,17 B de parámetros y pesos BF16 de 4,5 GB, es un banco de pruebas asequible para estudiar conversiones MLX, cuantización posterior y pipelines de audio y visión en Apple Silicon.
- Pruebas de pipelines de audio intercalado: la capacidad `interleaved` permite experimentar con respuestas que mezclan texto y audio, útil para investigación en interfaces conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del conversor incluye únicamente comprobaciones de validación de la conversión, que no constituyen un benchmark de calidad:

| Comprobacion | Resultado |
|---|---|
| finite_logits | Todos los logits permitidos finitos; placeholders de voz suprimidos correctamente |
| arithmetic | 42 (coincidencia exacta: True) |
| asr | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| tts | Waveform finita a 24.000 Hz, 3,36 s; finish: stop |
| tts_roundtrip | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| interleaved | Waveform finita a 24.000 Hz, 2,24 s; finish: stop |
| image_ocr | Texto "CODE 5739" en negrita sobre fondo gris claro |
| video_ocr | Código "5739" mostrado como "CODE 5739" |

Estas pruebas se ejecutaron en un Apple M3 Ultra con MLX 0.32.4, semilla 42 y los ajustes de muestreo de audio por defecto del modelo. El round-trip ASR usa el mismo modelo y no es una evaluación independiente del habla.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 4,5 GB en BF16; se necesita margen adicional para activaciones y caché KV (no cuantizadas), por lo que conviene disponer de al menos 8-12 GB de memoria unificada para inferencia cómoda.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; la validación se realizó en un Apple M3 Ultra. No se documenta soporte para GPU NVIDIA en esta conversión (la librería es `mlx`).
- Cabe en hardware de consumo Apple: sí, en equipos con suficiente memoria unificada (M-series con 16 GB o más es un punto de partida razonable, aunque no está confirmado por el autor).
- Opciones de despliegue: `mlx-vlm` en el commit fijado (`3070dcc31948f48f9d8639b606af7bc019494fac`), instalado vía pip desde el repositorio de GitHub. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación de voz está limitada a batch uno y no se soportan streaming de waveform ni historial de voz basado en waveform.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-bf16 (esta ficha) | 2,17 B | no disponible | texto, audio, imagen, vídeo | LFM 1.0 | HuggingFace, MLX |
| Modelos any-to-any pequeños de la competencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada alternativas concretas con las que comparar parámetros, contexto, rendimiento y licencia de forma rigurosa.

## Limitaciones y advertencias

- La generación de voz soporta únicamente batch uno; no hay streaming de waveform ni historial de voz basado en waveform.
- La banda sonora de vídeo debe suministrarse por separado; no se procesa audio embebido en el vídeo de forma automática.
- El modo "thinking" de Omni no está soportado.
- Las pruebas de validación son smoke checks, no un benchmark de calidad; no deben extrapolarse a producción.
- Precisión BF16 únicamente: no se incluyen variantes cuantizadas y el autor advierte que precisiones menores pueden degradar la calidad y requieren evaluación específica por tarea.
- Idiomas: los ejemplos y validaciones son en inglés; no hay información sobre cobertura multilingüe.
- Riesgo de alucinación: no cuantificado en la documentación; aplicable el riesgo habitual de modelos generativos pequeños.
- Sesgos: no documentados por el autor.
- Licencia LFM 1.0 con términos del checkpoint original; la conversión no asigna una nueva licencia de pesos. Es necesario revisar `LICENSE` y `ORIGINAL_MODEL_CARD.md` antes de cualquier uso comercial.
- El código de inferencia requiere `trust_remote_code=False` y una versión fijada de `mlx-vlm`; cambios de versión pueden romper la compatibilidad.
- Adopción muy baja (38 descargas, 0 likes) y fecha de creación reciente; no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM3-Omni-2B-bf16
- Checkpoint base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Código de inferencia (mlx-vlm, commit fijado): https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia LFM 1.0: incluida en el repositorio como `LICENSE`
- Model card original: incluida en el repositorio como `ORIGINAL_MODEL_CARD.md`
- Metadatos de conversión: `conversion.json` en el repositorio
- Validación: `validation.json` en el repositorio
- Muestras de audio generadas: carpeta `samples/` del repositorio

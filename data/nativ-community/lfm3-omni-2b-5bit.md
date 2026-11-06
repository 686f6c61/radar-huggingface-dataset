# nativ-community/LFM3-Omni-2B-5bit

## Resumen

LFM3-Omni-2B-5bit es una conversión nativa a MLX del modelo multimodal LFM3-Omni-2B, desarrollado originalmente por Liquid AI y publicado en el repositorio `lq-preview/LFM3-Omni-2B`. La conversión la mantiene el usuario `nativ-community` y está pensada específicamente para ejecución en Apple Silicon mediante la librería MLX y el framework `mlx-vlm`. Se trata de un modelo any-to-any de 2.166.928.384 parámetros que procesa y genera texto, audio e imagen, incluyendo ASR, TTS y OCR sobre imagen y vídeo.

El modelo resuelve el problema de desplegar un sistema omni-modal compacto en hardware de consumo Apple, algo poco habitual: la mayoría de modelos any-to-any con audio superan los 7B parámetros y requieren GPUs dedicadas. Esta versión aplica cuantización afín de 5 bits con group size 64 sobre los pesos del transformer, manteniendo los módulos de audio y visión en BF16, lo que reduce el peso del repositorio a 2,2 GB sin degradar las rutas sensoriales.

Es relevante ahora porque permite probar pipelines de voz (transcripción, síntesis, diálogo por voz) y OCR multimodal en un Mac con MLX, con una implementación pública fijada a un commit concreto de `mlx-vlm`. La licencia original LFM 1.0 se mantiene y esta conversión no asigna una nueva licencia de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (familia LFM3 Omni), con módulos de audio y visión; detalles internos no disponibles en la información proporcionada |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín de 5 bits, group size 64 (pesos del transformer); audio y visión en BF16; activaciones y caché KV sin cuantizar |
| Idiomas soportados | no disponible (los ejemplos de la model card usan inglés para ASR y TTS) |
| Licencia | LFM 1.0 (`lfm1.0`, license: other); se aplican los términos del checkpoint original |
| Formato de pesos | safetensors (MLX), con `custom_code`; repositorio de 2,2 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su carácter omni-modal: un transformer que integra codificadores de audio y visión junto con un decodificador de texto, y que además puede generar audio mediante un códec de audio incluido en el paquete. La conversión conserva los módulos de audio y visión en BF16 y copia el códec de audio sin modificarlo; solo los pesos del transformer se cuantizan a 5 bits afines con group size 64. Las activaciones y las cachés KV no se cuantizan.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card de la conversión documenta la procedencia exacta: el checkpoint base `lq-preview/LFM3-Omni-2B` en el commit `101fb44635e88fd5ceb09508610bc559149286e8`, la implementación de conversión en el commit `15e20a7ef0dfa8447502f0b145192421a8f3cf2e` y el código de inferencia pública en `Blaizzy/mlx-vlm` en el commit `3070dcc31948f48f9d8639b606af7bc019494fac`. La innovación técnica destacable de esta ficha es la propia conversión: un pipeline reproducible con auditoría de tensores (`conversion.json`), hashes (`SHA256SUMS`) y validación (`validation.json`).

## Capacidades

- Generación de texto y razonamiento aritmético básico (la validación interna obtiene 42 en una comprobación aritmética exacta).
- Reconocimiento automático de voz (ASR) con salida de texto; la validación reporta WER de 0,0 % en una frase de prueba en inglés.
- Síntesis de voz (TTS) con control de idioma y voz mediante prompt de sistema; genera formas de onda finitas a 24000 Hz.
- Conversión round-trip ASR-TTS dentro del mismo modelo (no es una evaluación independiente de calidad de voz).
- OCR sobre imagen: extrae texto de carteles y documentos en imagen estática.
- OCR sobre vídeo: extrae texto de fotogramas de vídeo (la pista de audio del vídeo debe suministrarse por separado).
- Generación intercalada de texto y audio en una misma respuesta.
- Entrada multimodal combinada de audio, imagen y texto en un pipeline any-to-any.
- No soporta modo de razonamiento extendido («Omni thinking» no implementado).
- No se documenta soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Transcripción de reuniones en local: el modelo recibe un archivo WAV y devuelve la transcripción en texto mediante `generate_audio` con `generation_mode="text"`, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Síntesis de voz para audiolibros o avisos: con un prompt de sistema que fija idioma y tipo de voz, el modelo genera un WAV a 24000 Hz; el límite de lote uno lo hace apto para generación secuencial, no para servir a muchos usuarios a la vez.
- Digitalización de documentos y carteles: el módulo de visión permite extraer texto de imágenes (por ejemplo, códigos y rótulos) directamente en un Mac, útil para prototipos de accesibilidad o inventario.
- Indexación de vídeo: combinando OCR sobre fotogramas con la transcripción del audio suministrado aparte, se puede construir un índice buscable de contenido audiovisual en local.
- Asistentes de voz para prototipado: el pipeline any-to-any permite encadenar ASR, respuesta textual y TTS en una sola sesión de MLX, adecuado para demos y pruebas de concepto en Apple Silicon.
- Evaluación de modelos omni-modales en investigación: al ser una conversión reproducible con auditoría de tensores y validación documentada, sirve como base para comparar cuantizaciones de 5 bits frente al checkpoint original en tareas de voz y OCR.
- Automatización de accesibilidad: generación de descripciones habladas de texto detectado en imágenes o vídeo para usuarios con discapacidad visual, ejecutándose íntegramente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente comprobaciones de validación de la conversión, no comparativas de calidad:

| Comprobacion | Resultado |
|---|---|
| finite_logits | Todos los logits permitidos finitos; placeholders de voz suprimidos correctamente |
| arithmetic | 42 (coincidencia exacta) |
| asr | «The quick brown fox jumps over the lazy dog.» (WER 0,0 %) |
| tts | Forma de onda finita a 24000 Hz, 3,52 s; finalización: stop |
| tts_roundtrip | «The quick brown fox jumps over the lazy dog.» (WER 0,0 %) |
| interleaved | Forma de onda finita a 24000 Hz, 1,68 s; finalización: stop |
| image_ocr | Texto «CODE 5739» detectado en un cartel |
| video_ocr | Código 5739 detectado en vídeo |

Estas pruebas se ejecutaron en un Apple M3 Ultra con MLX 0.32.4, con semilla 42 y los ajustes de muestreo de audio por defecto del modelo. El propio autor advierte que no constituyen un benchmark de calidad amplio.

## Requisitos de hardware

- Peso del repositorio: 2,2 GB, lo que permite cargar el modelo en memoria unificada de un Mac sin dificultad.
- Hardware de referencia de la validación: Apple M3 Ultra con MLX 0.32.4.
- Cabe en equipos Apple Silicon de gama consumer con memoria unificada suficiente (16 GB o más recomendable para margen de trabajo con audio e imagen en BF16); no se especifica un mínimo oficial.
- No está pensado para GPUs NVIDIA ni CUDA: la librería es MLX y el formato de pesos es específico de MLX.
- Despliegue mediante `mlx-vlm` fijado al commit `3070dcc31948f48f9d8639b606af7bc019494fac`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Limitaciones de servicio: la generación de voz soporta batch uno; no hay streaming de audio ni historial de voz basado en formas de onda.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-5bit (esta ficha) | 2,17B | no disponible | Texto, audio, imagen (entrada y salida de audio) | LFM 1.0 | MLX, Hugging Face |
| LFM3-Omni-2B (base original) | no disponible en la información | no disponible | Texto, audio, imagen | LFM 1.0 | Hugging Face, pesos sin cuantizar |
| Alternativas omni-modales de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables con los que contrastar parámetros, contexto o rendimiento; la comparación principal posible es frente al checkpoint original sin cuantizar, del que esta versión se diferencia por la cuantización de 5 bits y el formato MLX.

## Limitaciones y advertencias

- La generación de voz solo admite batch uno; no es adecuada para servir a múltiples usuarios concurrentes.
- No se implementa streaming de audio ni historial de voz basado en formas de onda.
- La pista de audio de un vídeo debe suministrarse por separado; no se extrae automáticamente.
- El modo de razonamiento extendido («Omni thinking») no está soportado.
- La cuantización a 5 bits puede reducir la calidad frente al checkpoint original; el autor recomienda evaluar cada formato en la tarea concreta antes de desplegar.
- La validación de ASR y TTS es un round-trip con el mismo modelo y no una evaluación independiente de calidad de voz; los resultados WER de 0,0 % corresponden a una sola frase de prueba.
- No hay datos publicados de sesgos, tasas de alucinación ni cobertura idiomática; los ejemplos de la model card están en inglés.
- Licencia LFM 1.0 con posibles restricciones para uso comercial; deben revisarse los términos del checkpoint original en `LICENSE` y `ORIGINAL_MODEL_CARD.md` antes de producción.
- Esta conversión no asigna una nueva licencia de pesos: se aplican los términos del modelo original.
- El modelo requiere `trust_remote_code=False` en la carga según el ejemplo, pero depende de código personalizado de `mlx-vlm` fijado a un commit concreto, lo que añade riesgo de reproducibilidad si ese commit no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/LFM3-Omni-2B-5bit
- Modelo base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Implementación de inferencia (mlx-vlm): https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia LFM 1.0: https://huggingface.co/nativ-community/LFM3-Omni-2B-5bit/blob/main/LICENSE
- Model card original: https://huggingface.co/nativ-community/LFM3-Omni-2B-5bit/blob/main/ORIGINAL_MODEL_CARD.md

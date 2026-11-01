# nativ-community/LFM3-Omni-2B-6bit

## Resumen

LFM3-Omni-2B-6bit es una conversión nativa a MLX del modelo multimodal LFM3-Omni-2B, publicada por el usuario nativ-community. Se trata de un modelo "any-to-any" de 2.166.928.384 parámetros (aproximadamente 2,17 mil millones) que combina procesamiento de texto, visión y audio en una única arquitectura. El checkpoint original procede de lq-preview/LFM3-Omni-2B y esta conversión aplica cuantización afina de 6 bits con tamaño de grupo 64 exclusivamente a los pesos del transformer, manteniendo los módulos de audio y visión en BF16.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo omni-modal de 2B en hardware Apple Silicon mediante MLX, sin necesidad de GPUs dedicadas. El repositorio ocupa 2,4 GB y está pensado para flujos de trabajo de reconocimiento automático del habla (ASR), síntesis de voz (TTS), OCR sobre imagen y vídeo, y razonamiento aritmético básico, todo dentro de un mismo modelo.

La licencia declarada es lfm1.0 (licencia propia del modelo original), y esta conversión no asigna una nueva licencia sobre los pesos. Es importante señalar que la model card original no proporciona información sobre idiomas soportados ni sobre el proceso de entrenamiento, por lo que varios apartados de esta ficha se marcarán como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (texto, visión y audio); detalles internos no disponibles |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afina de 6 bits, tamaño de grupo 64 (solo pesos del transformer); módulos de audio y visión en BF16; códec de audio sin cuantizar; cachés de activación y KV sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia del modelo original; la conversión no asigna nueva licencia) |
| Formato de pesos | safetensors (formato MLX), con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo any-to-any con módulos diferenciados de texto, visión y audio. La conversión a MLX preserva los módulos de audio y visión en BF16 y aplica cuantización afina de 6 bits con grupo de 64 a los pesos del transformer principal. El códec de audio incluido se copia sin modificar. Las cachés de activación y KV no se cuantizan, lo que mantiene la fidelidad numérica en inferencia a costa de memoria adicional.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card de esta conversión remite al checkpoint original (lq-preview/LFM3-Omni-2B) para los detalles de entrenamiento, que no se incluyen en la información proporcionada. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento aritmético básico (la validación reporta un resultado exacto de 42 en una prueba aritmética).
- Reconocimiento automático del habla (ASR) con entrada de audio en formato WAV; la validación reporta WER de 0,0 % en una frase de prueba.
- Síntesis de voz (TTS) con salida de onda a 24000 Hz; soporta indicación de voz (por ejemplo, voz femenina en inglés americano) mediante mensaje de sistema.
- Generación de audio intercalado (interleaved) junto con texto.
- OCR sobre imágenes: la validación extrae correctamente el texto "CODE 5739" de una imagen.
- OCR sobre vídeo: la validación identifica el código "5739" mostrado en un vídeo.
- Procesamiento multimodal combinado de audio, imagen y vídeo en una misma conversación.
- No soporta modo de razonamiento extendido (Omni thinking no implementado).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes multi-paso.

## Casos de uso

- Transcripción de audio a texto en local: el modelo puede realizar ASR directamente sobre archivos WAV en un Mac con Apple Silicon, sin enviar datos a servicios externos, gracias a su módulo de audio en BF16 y a la cuantización 6-bit del transformer que reduce el uso de memoria.
- Generación de voz para asistentes: permite sintetizar respuestas habladas a 24000 Hz con control de voz mediante mensaje de sistema, adecuado para prototipos de interfaces conversacionales por voz en entornos de desarrollo.
- Extracción de texto en imágenes para digitalización: el OCR validado sobre imágenes permite integrar el modelo en flujos de captura de documentos o carteles, extrayendo texto estructurado sin depender de APIs externas.
- Análisis de vídeo con texto en pantalla: la capacidad de OCR sobre vídeo facilita la extracción de códigos, rótulos o subtítulos incrustados en grabaciones, útil en tareas de auditoría o indexación de contenido audiovisual.
- Pruebas de concepto de modelos omni-modales en investigación: al ser una conversión MLX de un modelo de 2B, sirve para experimentar con pipelines any-to-any en hardware de consumo Apple sin necesidad de GPUs de datacenter.
- Evaluación de cuantización 6-bit frente al checkpoint original: el repositorio incluye artefactos de validación (`validation.json`, `conversion.json`, `SHA256SUMS`) que permiten comparar fidelidad y rendimiento frente al modelo base en tareas de ASR, TTS y OCR.
- Demostraciones educativas de TTS y ASR combinados: el ejemplo de ida y vuelta (TTS seguido de ASR del mismo modelo) ilustra el funcionamiento del pipeline multimodal, aunque no constituye una evaluación independiente del habla.

## Benchmarks y rendimiento

La model card incluye comprobaciones de validación de la conversión, no benchmarks comparativos estándar. Se presentan a continuación tal como se publican:

| Comprobacion | Resultado |
|---|---|
| finite_logits | Todos los logits permitidos finitos; marcadores de habla suprimidos correctamente |
| arithmetic | 42 (esperado 42; coincidencia exacta: True) |
| asr | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| tts | Onda finita a 24000 Hz, 3,36 s; finalización: stop |
| tts_roundtrip | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| interleaved | Onda finita a 24000 Hz, 3,68 s; finalización: stop |
| image_ocr | Texto "CODE 5739" extraído correctamente de una imagen |
| video_ocr | Código "5739" identificado correctamente en un vídeo |

Estas pruebas se ejecutaron en Apple M3 Ultra con MLX 0.32.4, semilla 42 y ajustes de muestreo de audio por defecto del modelo. El autor advierte explícitamente que no constituyen un benchmark de calidad amplio y que la prueba de ida y vuelta ASR no es una evaluación independiente del habla. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 2,4 GB en disco; en inferencia hay que sumar los módulos de audio y visión en BF16, el códec de audio sin cuantizar y las cachés KV no cuantizadas, por lo que el consumo real de memoria unificada será superior a 2,4 GB (cifra exacta no disponible).
- Hardware validado: Apple M3 Ultra con MLX 0.32.4; la conversión está diseñada para Apple Silicon.
- GPU dedicadas (NVIDIA A100, H100, RTX 4090): no se documenta soporte en la información disponible, ya que el formato es MLX y no GGUF ni safetensors estándar de PyTorch.
- ¿Cabe en GPU de consumo? El formato MLX está orientado a memoria unificada de Apple Silicon; no se indica compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-vlm` en la versión fijada `3070dcc31948f48f9d8639b606af7bc019494fac` (instalación vía pip desde el repositorio de GitHub de Blaizzy). No se documentan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles. La validación reporta duraciones de onda generada (3,36 s y 3,68 s) pero no tiempos de inferencia.
- Limitaciones de implementación: la generación de habla soporta batch uno; no hay streaming de onda de entrada ni de salida; el historial de habla basado en onda no está implementado; la banda sonora de vídeo debe suministrarse por separado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos ni de especificaciones de modelos alternativos en la información proporcionada. Se indica a continuación una comparación estructural limitada con el checkpoint original del que deriva esta conversión:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-6bit (esta ficha) | 2.166.928.384 | no disponible | safetensors MLX, 6-bit | lfm1.0 | HuggingFace, 40 descargas |
| lq-preview/LFM3-Omni-2B (modelo base) | no disponible en la información | no disponible | no disponible | lfm1.0 | HuggingFace |

No se conocen en la información proporcionada otros modelos any-to-any de tamaño comparable para establecer una comparativa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- La cuantización a 6 bits puede reducir la calidad frente al checkpoint original; el autor recomienda evaluar cada formato con tareas específicas antes de desplegar en producción.
- La generación de habla solo admite batch uno, lo que limita el throughput en escenarios de producción con múltiples peticiones concurrentes.
- No hay soporte de streaming de onda ni de historial de habla basado en onda; la banda sonora de vídeo debe proporcionarse por separado.
- El modo de razonamiento extendido (Omni thinking) no está implementado.
- No se documentan idiomas soportados; las pruebas de validación se realizan en inglés, por lo que el rendimiento en castellano u otros idiomas es desconocido.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente en OCR o transcripción con audio ruidoso.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: se aplican los términos del checkpoint original (lfm1.0); esta conversión no asigna una nueva licencia sobre los pesos. Es necesario revisar `ORIGINAL_MODEL_CARD.md` y `LICENSE` antes de cualquier uso comercial.
- Las pruebas de validación publicadas son smoke tests cortos en un único hardware (M3 Ultra) y no constituyen una evaluación amplia de calidad.
- El repositorio tiene solo 40 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nativ-community/LFM3-Omni-2B-6bit
- Modelo base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Implementación de inferencia pública (mlx-vlm): https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Artefactos de validación en el repositorio: `validation.json`, `conversion.json`, `SHA256SUMS`, `ORIGINAL_MODEL_CARD.md`, `LICENSE`, carpeta `samples/`

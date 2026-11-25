# aman4014/whisper-large-v3-turbo-german-allrounder-v3

## Resumen

Whisper Large v3 Turbo German All-Rounder v3 es un ajuste fino multitarea del modelo `primeline/whisper-large-v3-turbo-german`, desarrollado por el usuario `aman4014`. Está especializado en cuatro tareas de voz entre alemán e inglés: transcripción alemán→alemán, transcripción inglés→inglés, traducción alemán→inglés y una tarea personalizada de traducción inglés→alemán implementada mediante un token de tarea propio (`<|en_to_de|>`, id 51866). El modelo se distribuye en formato Transformers con pesos safetensors en float32.

El modelo parte de la arquitectura Whisper large-v3-turbo, un transformer encoder-decoder con 808,9 millones de parámetros totales, lo que lo sitúa en el rango de los modelos de reconocimiento automático del habla (ASR) de tamaño medio dentro de la familia Whisper. Su ventana de audio de entrada está limitada a fragmentos de hasta 30 segundos por llamada, por lo que las grabaciones largas deben trocearse.

Su relevancia radica en que un único conjunto de pesos cubre tanto ASR monolingüe como traducción bidireccional entre alemán e inglés, con mejoras medidas en FLEURS respecto a la ronda anterior del mismo autor (por ejemplo, DE ASR WER 7,48→7,12 y EN ASR WER 9,62→9,33). La licencia MIT facilita su uso comercial, y existe una versión CTranslate2/faster-whisper cuantizada en int8_float16 para despliegue eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.879.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de hasta 30 s por llamada; max_length de decodificacion 448 tokens |
| Tipos de cuantizacion | float32 (pesos publicados); int8_float16 en la version CT2/faster-whisper |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers); CTranslate2 en el repo CT2 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer encoder-decoder de Whisper large-v3-turbo, con 808,9 millones de parámetros. El entrenamiento se realizó en dos fases: una primera con el encoder congelado y solo el decoder entrenable (15.000 pasos, learning rate 5e-5), y una segunda con el modelo completo (80.000 pasos, learning rate 1e-5, mejor checkpoint en el paso 80.000). Se usó batch efectivo de 32 sobre 4 GPU A30, precisión bf16, schedule coseno, AdamW con weight decay 0.01, label smoothing 0.1, SpecAugment y semilla 42.

Los datos provienen de la versión corregida con Voxtral de `aman4014/translated-german-english-asr`, con mezcla de `train_cv19_0`, `train_eurospeech`, `train_el_tts`, `train_de_DE_kerstin`, cuatro conjuntos Thorsten Voice (alemán) y `train_mozilla_english_asr` (inglés, primer 10% reservado para validación/test). El muestreo de tareas fue 40% DE→EN, 40% EN→DE, 10% DE ASR y 10% EN ASR. Las traducciones se revisaron con Voxtral-Small-24B usando audio y texto, reemplazando el 20,6% de las traducciones de entrenamiento. Validación con `train_mls_0` y test con `train_tuda_0`. No se usó prefijo de contexto previo aleatorio ni concatenación aleatoria de audio (a diferencia de la ronda 2).

## Capacidades

- Transcripción de voz en alemán (DE→DE) y en inglés (EN→EN).
- Traducción de voz alemán→inglés (DE→EN) mediante el token de tarea `<|translate|>`.
- Traducción de voz inglés→alemán (EN→DE) mediante el token personalizado `<|en_to_de|>` (id 51866), que no es reconocido por los argumentos `language=`/`task=` de `generate`.
- Cuatro tareas en un único conjunto de pesos, seleccionables mediante el prompt de decoder (`decoder_input_ids`).
- Decodificación con beam search (el autor reporta beam 5, max_length 448).
- No soporta condicionamiento por texto previo (`<|startofprev|>`): el modelo no fue entrenado con esa vía.
- No soporta prompts de timestamps: debe usarse siempre `<|notimestamps|>` al final del prompt.
- No dispone de capacidades de visión, audio generativo, tool calling ni razonamiento multi-paso; es exclusivamente un modelo ASR/traducción de voz.

## Casos de uso

- Subtitulado automático de contenido audiovisual alemán: el modelo transcribe audio alemán a texto alemán (DE ASR) con WER de 7,12 en FLEURS, adecuado para generar subtítulos en alemán que luego se traducen a otros idiomas.
- Localización de vídeos alemanes al inglés: usando la tarea DE→EN se obtiene directamente texto en inglés desde audio alemán, con BLEU de 31,39 en FLEURS, útil para doblaje o subtitulado en inglés sin pipeline separado de traducción.
- Atención al cliente en centros bilingües alemán-inglés: un único modelo cubre la transcripción de llamadas en ambos idiomas y la traducción bidireccional, simplificando el despliegue frente a mantener dos sistemas ASR y un traductor aparte.
- Generación de actas de reuniones en inglés con salida en alemán: la tarea EN→DE permite transcribir audio inglés y entregar el texto en alemán directamente, con BLEU de 55,03 en el test in-domain.
- Procesamiento de corpus de voz para investigación lingüística: el modelo permite transcribir y traducir grabaciones cortas (hasta 30 s) de alemán e inglés de forma consistente, con la versión CT2 int8_float16 para throughput alto en CPU/GPU modesta.
- Integración en pipelines de transcripción con faster-whisper: la versión CT2 cuantizada int8_float16 permite desplegar el modelo en producción con menor huella de memoria, usando `without_timestamps=True` para evitar prompts de timestamps no entrenados.
- Traducción de audio inglés→alemán en entornos de formación o e-learning: la tarea EN→DE permite convertir lecciones en inglés a texto alemán para audiencias germanoparlantes, aunque el autor advierte que en dominio externo (FLEURS) está ligeramente por detrás de la ronda 2.

## Benchmarks y rendimiento

Resultados medidos por el autor con el modelo en bf16, beam 5, max_length 448. WER con `BasicTextNormalizer` de Whisper; BLEU con SacreBLEU 13a. Las filas in-domain usan referencias corregidas por Voxtral; FLEURS usa referencias humanas (347 frases, 2–3 hablantes cada una).

| Tarea | In-domain test (TUDA + Mozilla), Round-2 → este modelo | FLEURS test, Round-2 → este modelo |
|---|---|---|
| DE ASR WER ↓ | 9,75 → 9,77 | 7,48 → 7,12 |
| EN ASR WER ↓ | 6,81 → 6,73 | 9,62 → 9,33 |
| DE→EN BLEU ↑ | 50,54 → 50,14 | 30,17 → 31,39 |
| EN→DE BLEU ↑ | 52,81 → 55,03 | 26,94 → 26,50 |

En FLEURS, la mejora DE→EN es significativa con decodificación greedy (+1,0 BLEU, IC 95% [+0,4, +1,8]); el resto de diferencias quedan dentro de aproximadamente ±0,7. No se han publicado comparaciones con otros modelos externos en la información disponible.

## Requisitos de hardware

- Pesos en float32: el repositorio ocupa 3,2 GB; en float16 la inferencia requiere aproximadamente 1,6–2 GB de VRAM para los pesos, más memoria para activaciones y beam search.
- Versión CT2 int8_float16: huella de memoria notablemente menor, apta para CPU y GPU de gama baja.
- GPU recomendadas: el autor entrenó en 4× A30; para inferencia son suficientes GPU consumer como RTX 3060/4060 en adelante, y cabe en cualquier GPU con al menos 4 GB de VRAM en float16 o int8.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM.
- Opciones de despliegue: Transformers (`WhisperForConditionalGeneration`), faster-whisper/CTranslate2 mediante el repo `aman4014/whisper-large-v3-turbo-german-allrounder-v3-ct2`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-german-allrounder-v3 (este) | 808,9 M | 30 s por llamada | de, en | MIT | Cuatro tareas ASR/traducción; FLEURS DE ASR WER 7,12 |
| primeline/whisper-large-v3-turbo-german (modelo base) | no disponible | 30 s por llamada | de (base) | no disponible | Base del fine-tune; sin las cuatro tareas ni el token EN→DE |
| whisper_primeline_allrounder_final (Round-2 del autor) | no disponible | 30 s por llamada | de, en | no disponible | Ronda anterior; mejor EN→DE en FLEURS (26,94 vs 26,50) y DE→EN in-domain (50,54 vs 50,14) |
| Whisper large-v3-turbo original (OpenAI) | ~809 M | 30 s por llamada | multilingüe | MIT | No especializado en alemán; sin token EN→DE personalizado |

## Limitaciones y advertencias

- Entrenado sin condicionamiento de texto previo (`<|startofprev|>`): una ruta de servicio que alimente texto previo por el canal de prompt no fue evaluada con este modelo.
- EN→DE en voz fuera de dominio (FLEURS) está ligeramente por detrás de la ronda 2 (26,50 frente a 26,94 BLEU).
- Todas las referencias in-domain son traducciones automáticas (Opus-MT corregidas por Voxtral); solo FLEURS usa referencias humanas.
- Grabaciones largas: los benchmarks usan clips cortos independientes; el audio de más de 30 s debe trocearse.
- Los prompts de timestamps nunca se entrenaron; con faster-whisper debe usarse `without_timestamps=True`.
- El token `<|en_to_de|>` no es reconocido por los argumentos `language=`/`task=` de `generate`; debe pasarse el prompt como `decoder_input_ids` y terminar siempre con `<|notimestamps|>`.
- Solo cubre alemán e inglés; no hay soporte para otros idiomas.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio o ruido, no cuantificado en la información disponible.
- Sesgos específicos no documentados en la información proporcionada.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aman4014/whisper-large-v3-turbo-german-allrounder-v3
- Versión CTranslate2/faster-whisper: https://huggingface.co/aman4014/whisper-large-v3-turbo-german-allrounder-v3-ct2
- Modelo base: https://huggingface.co/primeline/whisper-large-v3-turbo-german
- Dataset de entrenamiento: https://huggingface.co/datasets/aman4014/translated-german-english-asr

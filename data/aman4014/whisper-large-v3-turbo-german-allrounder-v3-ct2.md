# aman4014/whisper-large-v3-turbo-german-allrounder-v3-ct2

## Resumen

Whisper Large v3 Turbo (German) All-Rounder v3 es una conversión a CTranslate2 del ajuste fino `whisper_primeline_allrounder_best_till_now`, desarrollado por el usuario aman4014 a partir del modelo base `primeline/whisper-large-v3-turbo-german`. Se trata de un modelo de reconocimiento automático del habla (ASR) y traducción del habla basado en la arquitectura Whisper de OpenAI (transformer encoder-decoder), especializado en el par de idiomas alemán-inglés en ambas direcciones.

El modelo resuelve cuatro tareas mediante tokens de prompt específicos: transcripción de alemán, transcripción de inglés, traducción de alemán a inglés y traducción de inglés a alemán. Esta última emplea un token personalizado `<|en_to_de|>` (id 51866) que no existe en el Whisper original. El ajuste fino se realizó en dos fases sobre un corpus corregido con Voxtral-Small-24B, lo que mejora la calidad de las referencias de traducción.

La relevancia de esta ficha radica en que el modelo se distribuye ya cuantizado en `int8_float16` para su uso con faster-whisper o CTranslate2, lo que reduce los requisitos de memoria y facilita el despliegue en producción. El repositorio ocupa 0,8 GB y la licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | no disponible (variante turbo de Whisper large v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s; max_length de decodificacion 448 tokens |
| Tipos de cuantizacion | int8_float16 (pesos int8, computo float16) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizer y configs en JSON |

## Arquitectura y entrenamiento

El modelo parte de `primeline/whisper-large-v3-turbo-german`, una variante turbo de Whisper large v3, y se ajustó en dos fases. En la fase 1 se congeló el encoder y solo se entrenó el decoder durante 15.000 pasos con learning rate 5e-5. En la fase 2 se entrenó el modelo completo durante 80.000 pasos con learning rate 1e-5, seleccionando el checkpoint del paso 80.000 como mejor modelo. Se usó batch efectivo de 32 (4 GPU A30, 4 por GPU con acumulacion 2), precisión bf16, scheduler coseno, AdamW con weight decay 0,01, label smoothing 0,1, SpecAugment y semilla 42.

Los datos de entrenamiento provienen de `train_cv19_0`, `train_eurospeech`, `train_el_tts`, `train_de_DE_kerstin`, cuatro conjuntos Thorsten Voice (aleman) y `train_mozilla_english_asr` (ingles, con el 10% reservado para validacion y test). Las traducciones se revisaron con Voxtral-Small-24B usando audio y texto: el 20,6% de las traducciones de entrenamiento se reemplazaron y el resto se mantuvo. El muestreo de tareas fue 40% DE→EN, 40% EN→DE, 10% ASR DE y 10% ASR EN. No se empleó prefijo aleatorio de contexto previo ni concatenación aleatoria de audio (ambos usados en la ronda anterior). La validación usó `train_mls_0` y el test `train_tuda_0`.

## Capacidades

- Transcripcion de voz en aleman (prompt `<|startoftranscript|><|de|><|transcribe|><|notimestamps|>`).
- Transcripcion de voz en ingles (prompt `<|startoftranscript|><|en|><|transcribe|><|notimestamps|>`).
- Traduccion de voz alemana a texto en ingles (prompt `<|startoftranscript|><|de|><|translate|><|notimestamps|>`).
- Traduccion de voz inglesa a texto en aleman mediante el token personalizado `<|en_to_de|>` (id 51866).
- Procesamiento de audio en ventanas de 30 s con chunking automatico en faster-whisper para audios mas largos.
- Extraccion de caracteristicas con 128 bins mel (`preprocessor_config.json`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR/traduccion.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en aleman e ingles: el modelo transcribe audio en ventanas de 30 s y faster-whisper gestiona el chunking de videos largos, con la advertencia de usar `without_timestamps=True` para maximizar la calidad.
- Traduccion de reuniones y conferencias: con el prompt de traduccion DE→EN o el token `<|en_to_de|>` se puede generar texto traducido en tiempo casi real desde el audio original.
- Generacion de transcripciones para actas y documentacion: la ventana de contexto de 30 s y la decodificacion con beam 5 permiten transcribir grabaciones de voz con WER en torno al 7% en FLEURS para aleman.
- Atencion al cliente con voz: integracion en pipelines de telefonia o VoIP para transcribir y traducir llamadas entre clientes germanoparlantes y agentes angloparlantes.
- Investigacion en ASR multilingue: el modelo sirve como referencia para experimentos de traduccion del habla con tokens de tarea personalizados y para evaluar el impacto de la cuantizacion int8_float16 frente a bf16.
- Despliegue en produccion con recursos limitados: al ocupar 0,8 GB en int8_float16, puede ejecutarse en GPU consumer con compute capability ≥ 7.0 para transcripcion por lotes de archivos de audio.
- Accesibilidad: generacion de subtitulos en directo para personas con discapacidad auditiva en entornos germanoparlantes o angloparlantes.

## Benchmarks y rendimiento

Resultados medidos con el modelo original en Transformers (bf16), beam 5, max_length 448. WER con `BasicTextNormalizer` de Whisper; BLEU con SacreBLEU 13a. Las filas in-domain usan referencias corregidas con Voxtral.

| Tarea | Test in-domain (TUDA + Mozilla), ronda 2 → este modelo | Test FLEURS (referencias humanas), ronda 2 → este modelo |
|---|---|---|
| WER ASR DE ↓ | 9,75 → 9,77 | 7,48 → 7,12 |
| WER ASR EN ↓ | 6,81 → 6,73 | 9,62 → 9,33 |
| BLEU DE→EN ↑ | 50,54 → 50,14 | 30,17 → 31,39 |
| BLEU EN→DE ↑ | 52,81 → 55,03 | 26,94 → 26,50 |

Comparativa int8_float16 frente a bf16 (60 filas aleatorias de FLEURS por tarea, beam 5, max_length 448):

| Tarea | bf16 (Transformers) | int8_float16 (este repositorio) | Salidas identicas |
|---|---|---|---|
| WER ASR DE ↓ | 5,46 | 5,38 | 52 / 60 |
| WER ASR EN ↓ | 8,74 | 8,67 | 49 / 60 |
| BLEU DE→EN ↑ | 34,70 | 34,54 | 36 / 60 |
| BLEU EN→DE ↑ | 28,32 | 27,65 | no disponible |

En FLEURS, la mejora DE→EN es significativa (decodificacion greedy: +1,0 BLEU, IC 95% [+0,4, +1,8]); el resto de diferencias quedan en torno a ±0,7. FLEURS usa 347 frases (ids de test presentes en de_de y en_us) con 2-3 hablantes cada una.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 0,8 GB en int8_float16; en la practica se recomienda al menos 2-4 GB de VRAM para margen de trabajo con audios de 30 s.
- GPU recomendadas: A30 (usadas en el entrenamiento), A100, H100 para produccion a gran escala; RTX 4090 valida para despliegue individual.
- GPU consumer: si, en cualquier GPU con compute capability ≥ 7.0 (RTX 20xx, 30xx, 40xx y superiores) al usar `compute_type="int8_float16"`.
- Opciones de despliegue: faster-whisper (recomendado), CTranslate2 directamente; tambien es posible usar el modelo Transformers original en bf16 para maxima fidelidad.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de decodificacion recomendados: `beam_size=5`, `max_length=448`, `without_timestamps=True`, `condition_on_previous_text=False`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (whisper-large-v3-turbo-german-allrounder-v3-ct2) | no disponible (turbo large v3) | ventanas de 30 s, max 448 tokens | de, en | MIT | CTranslate2 int8_float16 |
| primeline/whisper-large-v3-turbo-german (modelo base) | no disponible (turbo large v3) | ventanas de 30 s | de | no disponible | Transformers |
| whisper_primeline_allrounder_final (ronda 2) | no disponible (turbo large v3) | ventanas de 30 s | de, en | no disponible | no disponible |
| Whisper large v3 turbo original de OpenAI | no disponible (turbo large v3) | ventanas de 30 s | multilingue | MIT | Transformers, CTranslate2 |

El modelo base `primeline/whisper-large-v3-turbo-german` solo cubre aleman, mientras que este ajuste anade ingles y traduccion bidireccional. Frente a la ronda 2 (`whisper_primeline_allrounder_final`), este modelo mejora ligeramente en la mayoria de metricas y anade la conversion a CTranslate2 con cuantizacion int8_float16. El Whisper large v3 turbo original de OpenAI soporta muchos mas idiomas, pero no esta especializado en el par de aleman e ingles ni incorpora el token `<|en_to_de|>`.

## Limitaciones y advertencias

- Solo soporta aleman e ingles; no cubre otros idiomas aunque el Whisper original sea multilingue.
- El modelo fue entrenado exclusivamente con `<|notimestamps|>`; usar timestamps degrada claramente la calidad (WER 14,15 frente a 7,66 en 40 clips FLEURS en ingles).
- No se entreno con prefijos de contexto previo, por lo que `condition_on_previous_text` debe mantenerse en `False`.
- La traduccion EN→DE requiere invocar CTranslate2 con un prompt explicito; la API `task` de faster-whisper no reconoce el token `<|en_to_de|>`.
- Los audios deben dividirse en ventanas de 30 s; faster-whisper lo hace automaticamente, pero otros frameworks deben gestionarlo.
- Riesgo de alucinacion inherente a los modelos Whisper en segmentos con silencio, ruido o audio musical.
- Sesgos potenciales derivados de los corpus de entrenamiento (Common Voice, Mozilla English ASR, Thorsten Voice, EuroSpeech), que pueden infrarepresentar determinados acentos o registros.
- La licencia MIT permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.
- La fecha de creacion indicada (2026-11-25) es futura respecto a la informacion disponible; conviene verificar la procedencia y vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aman4014/whisper-large-v3-turbo-german-allrounder-v3-ct2
- Modelo base: https://huggingface.co/primeline/whisper-large-v3-turbo-german
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- CTranslate2 (repositorio): https://github.com/OpenNMT/CTranslate2
- Dataset de entrenamiento: `aman4014/translated-german-english-asr` (referenciado en la model card)

# aoiandroid/indicconformer-bn-ctc-coreml

## Resumen

IndicConformer_bn_CTC es una conversión a Core ML del modelo de reconocimiento automático de voz (ASR) `ai4bharat/indicconformer_stt_bn_hybrid_ctc_rnnt_large` desarrollado por AI4Bharat. El modelo original es un Conformer híbrido con cabezas CTC y RNN-T entrenado para transcripción de voz en lenguas índicas; esta versión concreta conserva únicamente la cabeza CTC recortada a los tokens del bengalí (bn) y fusiona el frontend log-mel, empaquetando todo en un artefacto Core ML de 0,2 GB con una ventana de audio de 10 segundos.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un lanzamiento con benchmarks propios, sino de un artefacto de despliegue orientado a inferencia en el ecosistema Apple (Core ML), generado con `ic_coreml_convert.py` sobre NeMo 1.23.0 y coremltools 8.1 para el proyecto TranslateBlue. El autor del repo es `aoiandroid`, no AI4Bharat, y la licencia del modelo original es MIT según la model card.

No se dispone de información sobre parámetros totales, longitud de contexto en tokens, composición del dataset de entrenamiento ni resultados de evaluación en la información proporcionada. La model card es extremadamente breve y se limita a describir el proceso de conversión y el recorte de la cabeza CTC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer híbrido (CTC + RNN-T en el original; esta conversión conserva solo la cabeza CTC) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 10 s (no se especifica contexto en tokens) |
| Tipos de cuantización | no disponible (artefacto Core ML; se desconoce si aplica cuantización) |
| Idiomas soportados | bengalí (bn), según el recorte de la cabeza CTC |
| Licencia | MIT (AI4Bharat), según la model card |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un Conformer, una arquitectura que combina bloques de autoatención con convoluciones profundas y que se ha consolidado como estándar en ASR. El checkpoint original de AI4Bharat es híbrido, con dos cabezas de decodificación (CTC y RNN-T) entrenadas conjuntamente; esta conversión elimina la cabeza RNN-T y recorta la salida CTC al vocabulario del bengalí. El frontend log-mel se ha fusionado dentro del grafo Core ML, de modo que el artefacto consume audio directamente sin un preprocesador externo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de ajuste fino con RLHF/DPO (poco habituales en ASR). La conversión se realizó con NeMo 1.23.0 y coremltools 8.1 el 2026-11-23 mediante el script `ic_coreml_convert.py`.

## Capacidades

- Reconocimiento automático de voz (ASR) en bengalí con decodificación CTC.
- Procesamiento de audio en ventanas de 10 segundos.
- Frontend log-mel integrado en el propio grafo Core ML (no requiere extracción de features externa).
- Ejecución en el runtime Core ML de Apple (macOS/iOS/iPadOS).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta generación de texto, código, matemáticas ni visión.
- No se documenta soporte multilingüe más allá del bengalí.

## Casos de uso

- Transcripción de voz en bengalí en aplicaciones iOS/macOS: el artefacto Core ML permite ejecutar ASR en el dispositivo sin enviar audio a un servidor, usando la ventana de 10 s integrada.
- Subtitulado local de reuniones o notas de voz en bengalí: al fusionar el frontend log-mel, la app solo necesita alimentar muestras de audio al modelo y recibir la secuencia CTC.
- Dictado por voz en apps de productividad para hablantes de bengalí: la inferencia on-device de Core ML evita latencia de red y preserva la privacidad del audio.
- Preprocesado de corpus de audio en pipelines de investigación: útil para generar transcripciones preliminares en bengalí antes de una revisión humana.
- Integración en el proyecto TranslateBlue: la model card indica que la conversión se hizo específicamente para ese proyecto, por lo que su uso previsto es la traducción o el procesado de voz en bengalí dentro de esa aplicación.
- Prototipado rápido en Apple Silicon: al ser un `.mlpackage` de 0,2 GB, se puede cargar en un Mac con chip M-series para validar la calidad del CTC antes de invertir en el modelo completo con RNN-T.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un artefacto Core ML, el consumo depende del backend (CPU, GPU o Neural Engine) y del tamaño del grafo, no del checkpoint original.
- GPU recomendadas: no se especifican; el runtime Core ML puede usar la GPU integrada o el Neural Engine de los chips Apple M-series y A-series.
- Compatibilidad con GPU de consumo: el modelo está pensado para el ecosistema Apple; no se documenta soporte para CUDA, ROCm ni GPUs NVIDIA/AMD.
- Opciones de despliegue: Core ML (Xcode, `coremltools`, `MLModel`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aoiandroid/indicconformer-bn-ctc-coreml | Conformer CTC (Core ML) | bengalí | Core ML | MIT (según model card) | Hugging Face |
| ai4bharat/indicconformer_stt_bn_hybrid_ctc_rnnt_large | Conformer híbrido CTC+RNN-T | bengalí | NeMo | MIT | Hugging Face |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | safetensors, GGUF, etc. | MIT | Hugging Face, OpenAI |

La comparación con Whisper es solo orientativa: Whisper cubre bengalí entre sus idiomas, pero no se dispone de métricas comparativas en la información proporcionada. El modelo original de AI4Bharat es la referencia directa, ya que esta conversión es un subconjunto suyo (sin RNN-T).

## Limitaciones y advertencias

- Solo se conserva la cabeza CTC; se pierde la decodificación RNN-T del modelo original, lo que puede reducir la calidad de transcripción frente al checkpoint completo.
- El vocabulario está recortado al bengalí; no se puede usar para otras lenguas índicas sin reconvertir.
- Ventana fija de 10 s: audios más largos requieren segmentación externa y concatenación de hipótesis.
- No se documentan sesgos, tasas de alucinación ni evaluación de robustez en la información disponible.
- La licencia MIT se atribuye a AI4Bharat en la model card, pero conviene verificar los términos del checkpoint original antes de uso comercial.
- El autor del repo no es el desarrollador original del modelo; la trazabilidad y el mantenimiento del artefacto Core ML no están garantizados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.
- No se especifican requisitos mínimos de versión de Core ML ni de sistema operativo Apple.

## Enlaces

- Repo en Hugging Face: https://huggingface.co/aoiandroid/indicconformer-bn-ctc-coreml
- Modelo original: https://huggingface.co/ai4bharat/indicconformer_stt_bn_hybrid_ctc_rnnt_large
- Organización AI4Bharat en Hugging Face: https://huggingface.co/ai4bharat
- coremltools: https://github.com/apple/coremltools
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo

# aoiandroid/indicconformer-kn-ctc-coreml

## Resumen

IndicConformer_kn_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indicconformer_stt_kn_hybrid_ctc_rnnt_large` desarrollado por AI4Bharat. Se trata de una variante especializada en kannada (kn) que conserva únicamente la cabeza CTC del modelo híbrido original, descartando la parte RNNT, y que integra el frontend log-mel directamente en el grafo para simplificar el despliegue en dispositivos Apple.

El modelo ha sido convertido por el usuario aoiandroid con NeMo 1.23.0 y coremltools 8.1 mediante el script `ic_coreml_convert.py`, en el contexto del proyecto TranslateBlue. El resultado es un artefacto de aproximadamente 0,2 GB pensado para inferencia en el ecosistema Core ML (macOS, iOS, iPadOS), con una ventana de audio fija de 10 segundos.

Su relevancia es acotada pero concreta: ofrece una vía práctica para ejecutar ASR en kannada en local sobre hardware Apple sin depender de servicios en la nube, a partir de un modelo Conformer de referencia entrenado por AI4Bharat. No obstante, la información pública disponible es muy escasa: no hay datos de benchmarks, licencia declarada en el repositorio de Hugging Face ni especificaciones detalladas de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con cabeza CTC; conversión Core ML del modelo híbrido CTC+RNNT de AI4Bharat |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio fija de 10 s |
| Tipos de cuantizacion | no disponible (artefacto Core ML; se desconoce si se aplicó cuantización) |
| Idiomas soportados | kannada (kn) |
| Licencia | MIT según la model card (licencia de AI4Bharat); no declarada en los metadatos de Hugging Face |
| Formato de pesos | Core ML (.mlpackage / .mlmodel) |
| Tamano del repositorio | 0,2 GB |
| Frontend de audio | log-mel integrado en el grafo (fused) |
| Herramientas de conversión | NeMo 1.23.0, coremltools 8.1, script ic_coreml_convert.py |

## Arquitectura y entrenamiento

El modelo original de AI4Bharat es un Conformer híbrido que combina una cabeza CTC y una cabeza RNNT sobre un mismo encoder. Esta conversión conserva exclusivamente la cabeza CTC, recortada al vocabulario de tokens de kannada, y elimina la rama RNNT. El frontend de extracción de características log-mel se ha fusionado dentro del grafo Core ML, de modo que el modelo recibe audio y produce directamente la secuencia de tokens, sin necesidad de un pipeline externo de preprocesado.

La ventana de entrada está fijada en 10 segundos de audio. No se dispone de información sobre el número de parámetros del encoder, el volumen de datos de entrenamiento, la composición del corpus ni si el modelo original empleó técnicas de aumento de datos o ajuste fino adicional. La conversión se realizó el 23 de noviembre de 2026 en el contexto del proyecto TranslateBlue.

## Capacidades

- Reconocimiento automático del habla (ASR) en kannada con salida CTC.
- Procesamiento de audio con ventana fija de 10 segundos por inferencia.
- Frontend log-mel integrado: acepta audio y gestiona la extracción de características internamente.
- Ejecución local en el ecosistema Core ML (macOS, iOS, iPadOS) sin dependencia de red.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo puramente acústico-to-texto.
- No dispone de capacidades multimodales más allá del audio de entrada.
- No se ha documentado soporte multilingüe: está especializado únicamente en kannada.

## Casos de uso

- Subtitulado local en kannada: integración en aplicaciones macOS o iOS que transcriban audio en kannada por segmentos de 10 segundos, aprovechando la ejecución en dispositivo y la ausencia de latencia de red.
- Transcripción de reuniones y notas de voz: procesamiento por bloques de 10 s con solapamiento para reconstruir la transcripción completa de grabaciones en kannada.
- Aplicaciones de accesibilidad: dictado y conversión de voz a texto en kannada para usuarios con dificultades motoras, ejecutándose íntegramente en el dispositivo.
- Traducción asistida (proyecto TranslateBlue): uso como primer eslabón de un pipeline ASR→traducción, alimentando un modelo de traducción con la transcripción en kannada.
- Procesamiento por lotes de archivos de audio: dado que el modelo es un artefacto Core ML de 0,2 GB, puede desplegarse en flotas de dispositivos Apple para transcribir corpus de audio en kannada de forma offline.
- Prototipado de ASR en investigación: base para experimentos de reconocimiento de habla en lenguas dravídicas con hardware de consumo Apple, sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el artefacto Core ML ocupa aproximadamente 0,2 GB en disco y se ejecuta en el Neural Engine o la GPU integrada de los chips Apple.
- GPU recomendadas: no aplica; el modelo está diseñado para Apple Silicon (M1/M2/M3/M4 y posteriores) y para los SoC A-series de iPhone/iPad compatibles con Core ML.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y en dispositivos iOS/iPadOS modernos.
- Opciones de despliegue: Core ML (framework nativo de Apple); no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| IndicConformer_kn_CTC (esta conversión) | Kannada | Conformer + CTC | Core ML | MIT (según model card) | 10 s |
| ai4bharat/indicconformer_stt_kn_hybrid_ctc_rnnt_large | Kannada | Conformer híbrido CTC+RNNT | NeMo | MIT (AI4Bharat) | no disponible |
| Whisper (OpenAI) | Multilingüe (incluye kannada) | Transformer encoder-decoder | PyTorch, GGUF, Core ML (comunidad) | MIT | 30 s |

La comparación con Whisper es pertinente porque cubre kannada entre sus idiomas, aunque con menor especialización y mayor tamaño. El modelo original de AI4Bharat ofrece la referencia de calidad frente a la que se debería evaluar esta conversión, pero no se dispone de métricas publicadas para ninguno de los dos en la información proporcionada.

## Limitaciones y advertencias

- La información pública es mínima: no hay benchmarks, ficha de parámetros ni documentación de entrenamiento en el repositorio.
- La licencia MIT se menciona en la model card como licencia de AI4Bharat, pero no está declarada en los metadatos de Hugging Face; conviene verificar los términos antes de un uso comercial.
- Ventana de audio fija de 10 segundos: requiere segmentación y posible solapamiento para audios más largos, con riesgo de errores en las fronteras de segmento.
- Especializado exclusivamente en kannada; no es adecuado para otros idiomas.
- Al conservar solo la cabeza CTC, se pierde la precisión potencial de la decodificación RNNT del modelo original.
- Riesgo de alucinación y errores en audio con ruido, acentos no vistos o vocabulario técnico, como en cualquier sistema ASR.
- Dependencia del ecosistema Apple: no es desplegable en Linux, Windows ni GPUs NVIDIA sin reconversión.
- No se ha documentado el proceso de cuantización ni el impacto en precisión de la conversión Core ML.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aoiandroid/indicconformer-kn-ctc-coreml
- Modelo original de AI4Bharat: https://huggingface.co/ai4bharat/indicconformer_stt_kn_hybrid_ctc_rnnt_large
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- NeMo (NVIDIA): https://github.com/NVIDIA/NeMo
- coremltools: https://github.com/apple/coremltools

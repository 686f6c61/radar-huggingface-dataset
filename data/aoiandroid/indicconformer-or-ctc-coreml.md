# aoiandroid/indicconformer-or-ctc-coreml

## Resumen

IndicConformer_or_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indicconformer_stt_or_hybrid_ctc_rnnt_large`, desarrollado originalmente por AI4Bharat. El modelo resultante está empaquetado para su ejecución nativa en el ecosistema Apple (Core ML), con el frontend log-mel fusionado en el grafo y una ventana de audio fija de 10 segundos. La conversión la firma el usuario `aoiandroid` (repositorio homónimo en Hugging Face) y se realizó con `ic_coreml_convert.py`, usando NeMo 1.23.0 y coremltools 8.1, en el contexto del proyecto TranslateBlue.

El modelo original es un sistema híbrido CTC + RNN-T basado en arquitectura Conformer, orientado a lenguas índicas. En esta conversión, sin embargo, solo se exporta la cabeza CTC, recortada al vocabulario del idioma oriya (`or`), de modo que el artefacto resultante es un modelo CTC puro para ASR en oriya, no el sistema híbrido completo. Esta especialización reduce el tamaño y simplifica el despliegue, pero elimina las capacidades del decodificador RNN-T y la cobertura multilingüe del modelo original.

La relevancia de esta ficha es acotada: se trata de un artefacto de conversión de un modelo existente, con licencia MIT heredada de AI4Bharat, sin métricas publicadas ni documentación adicional en la model card. Es útil para quien necesite ejecutar ASR en oriya sobre hardware Apple (CPU, GPU o Neural Engine) mediante Core ML, pero no constituye un modelo nuevo ni aporta innovaciones arquitectónicas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + cabeza CTC; conversión Core ML del modelo híbrido CTC/RNN-T original, con solo la cabeza CTC exportada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio fija de 10 s |
| Tipos de cuantización | no disponible (el repositorio no documenta cuantización; el formato es Core ML) |
| Idiomas soportados | oriya (`or`) |
| Licencia | MIT (heredada de AI4Bharat) |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`), 0.2 GB de repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es un Conformer de AI4Bharat, una arquitectura que combina bloques de autoatención con convoluciones profundas para capturar dependencias locales y globales en secuencias de audio. El modelo original es híbrido CTC + RNN-T y fue entrenado por AI4Bharat para lenguas índicas; los detalles de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) no se documentan en la información disponible y corresponden al modelo original, no a esta conversión.

La conversión a Core ML introduce tres cambios técnicos relevantes: (1) el frontend log-mel queda fusionado dentro del grafo, de modo que el modelo consume audio directamente sin preprocesado externo; (2) la cabeza CTC se recorta al vocabulario del oriya, descartando el resto de idiomas y la cabeza RNN-T; (3) se fija una ventana de 10 s, lo que implica que el modelo procesa segmentos de esa duración y requiere segmentación externa para audios más largos. La conversión se realizó con NeMo 1.23.0 y coremltools 8.1 mediante el script `ic_coreml_convert.py`.

## Capacidades

- Reconocimiento automático del habla en oriya a partir de audio de hasta 10 segundos por ventana.
- Extracción de características log-mel integrada en el propio modelo Core ML (sin pipeline de preprocesado separado).
- Decodificación CTC greedy o con decodificador externo (el artefacto no incluye RNN-T ni beam search propio).
- Ejecución nativa en el ecosistema Apple mediante Core ML (CPU, GPU y Neural Engine).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta otros idiomas distintos del oriya.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de voz en oriya en aplicaciones iOS y macOS: el modelo se integra como `.mlpackage` en Xcode y se ejecuta en el dispositivo, sin necesidad de servidor, aprovechando la ventana de 10 s para dictado y notas de voz.
- Subtitulado offline de audios cortos en oriya: segmentando el audio en ventanas de 10 s y concatenando las salidas CTC, se pueden generar subtítulos sin conexión en dispositivos Apple.
- Procesamiento en el borde (edge computing) con privacidad: al ejecutarse localmente vía Core ML, el audio no sale del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Integración en pipelines de TranslateBlue: el modelo se convirtió expresamente para este proyecto, por lo que su uso previsto es la transcripción de entrada en una cadena de traducción.
- Prototipado rápido de ASR en oriya: al estar el frontend fusionado y el modelo en formato Core ML, un desarrollador puede validar una demo de transcripción en oriya con pocas líneas de código Swift.
- Evaluación comparativa de ASR índico en hardware Apple: sirve para medir latencia y consumo energético de un Conformer CTC en Neural Engine frente a alternativas en la nube.
- Archivado y búsqueda de grabaciones en oriya: transcripción por lotes de entrevistas o reuniones segmentadas en ventanas de 10 s para indexación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el repositorio ocupa 0.2 GB, por lo que el modelo cabe holgadamente en memoria unificada de cualquier dispositivo Apple moderno; no se dispone de cifras exactas de memoria en inferencia.
- GPU recomendadas: no aplica en el sentido de GPU dedicada; el destino es Core ML sobre Apple Silicon (M1/M2/M3/M4) o iPhone/iPad con Neural Engine. No se documenta compatibilidad con GPU NVIDIA.
- Cabe en hardware de consumo: sí, en dispositivos Apple; no está pensado para GPUs de consumo x86.
- Opciones de despliegue: Core ML (Xcode, `coremltools`, APIs `MLModel`/`MLModelConfiguration`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer_or_CTC (esta conversión) | Conformer + CTC (Core ML) | oriya | 10 s por ventana | MIT | Core ML |
| `ai4bharat/indicconformer_stt_or_hybrid_ctc_rnnt_large` | Conformer híbrido CTC + RNN-T | oriya (y otras lenguas índicas en el modelo completo) | no disponible | MIT | NeMo (`.nemo`) |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | 30 s por ventana | MIT | safetensors, GGUF, Core ML (conversiones de terceros) |

La comparación con Whisper es orientativa: Whisper cubre multitud de idiomas y tiene un ecosistema de despliegue mucho mayor, mientras que esta conversión está especializada en oriya y limitada al ecosistema Apple. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Solo transcribe oriya; no cubre otras lenguas índicas del modelo original.
- Ventana fija de 10 s: audios más largos requieren segmentación externa y pueden sufrir errores en las fronteras de segmento.
- Solo se exporta la cabeza CTC; se pierde la decodificación RNN-T del modelo original, lo que puede reducir la precisión frente al sistema híbrido completo.
- No hay métricas publicadas (WER, latencia) para esta conversión, por lo que su calidad real no está verificada de forma independiente.
- Riesgo de alucinación y errores en audio con ruido, acentos no estándar o solapamiento de hablantes, inherente a los sistemas ASR CTC.
- La model card no documenta sesgos específicos; al ser un modelo entrenado por AI4Bharat para oriya, puede reflejar los sesgos de su corpus original.
- La licencia MIT se hereda del modelo original, pero conviene verificar los términos de AI4Bharat antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad; trátese como artefacto experimental.
- No está pensado para GPUs x86 ni para servidores con vLLM/TGI; su despliegue está atado a Core ML.

## Enlaces

- Hugging Face: https://huggingface.co/aoiandroid/indicconformer-or-ctc-coreml
- Modelo original: https://huggingface.co/ai4bharat/indicconformer_stt_or_hybrid_ctc_rnnt_large
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- coremltools: https://github.com/apple/coremltools
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo

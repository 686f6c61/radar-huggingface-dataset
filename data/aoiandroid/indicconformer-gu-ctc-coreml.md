# aoiandroid/indicconformer-gu-ctc-coreml

## Resumen

IndicConformer_gu_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indicconformer_stt_gu_hybrid_ctc_rnnt_large` desarrollado por AI4Bharat. El modelo original es un Conformer híbrido con cabezas CTC y RNNT entrenado para transcripción de gujarati, una de las lenguas indoarias habladas principalmente en el estado indio de Gujarat. Esta versión concreta ha sido convertida por el usuario `aoiandroid` para su uso en el proyecto TranslateBlue.

La conversión recorta la cabeza CTC para exponer únicamente los tokens correspondientes a gujarati, integra el frontend log-mel en el propio grafo Core ML y fija una ventana de entrada de 10 segundos de audio. El resultado es un paquete de aproximadamente 0,2 GB pensado para inferencia en ecosistema Apple (macOS, iOS, iPadOS) mediante Core ML, lo que lo hace relevante para aplicaciones de traducción o subtitulado en dispositivo sin depender de servicios en la nube.

La información pública disponible es muy escasa: el repositorio no incluye pipeline declarado, licencia explícita en los metadatos de Hugging Face, idiomas listados ni resultados de evaluación. La model card únicamente documenta el proceso de conversión (NeMo 1.23.0 y coremltools 8.1) y remite a la licencia MIT del modelo original de AI4Bharat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer híbrido (CTC + RNNT) en el modelo original; esta versión expone solo la cabeza CTC |
| Parametros totales | no disponible (el modelo original se denomina "large", sin cifra publicada en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 10 segundos por inferencia |
| Tipos de cuantizacion | no disponible (formato Core ML; precisión de pesos no documentada) |
| Idiomas soportados | gujarati (gu) |
| Licencia | MIT según la model card, heredada del modelo original de AI4Bharat; no declarada en los metadatos de Hugging Face |
| Formato de pesos | Core ML (.mlpackage / .mlmodel) |

## Arquitectura y entrenamiento

El modelo subyacente es un Conformer, arquitectura que combina bloques de autoatención con convoluciones profundas para capturar dependencias locales y globales en secuencias de audio. La variante original de AI4Bharat es híbrida: incorpora simultáneamente una cabeza CTC y una cabeza RNNT sobre el mismo encoder, lo que permite elegir entre decodificación sin alineamiento (CTC) o con transductor (RNNT). En esta conversión se ha eliminado la cabeza RNNT y se ha recortado la salida CTC al vocabulario de gujarati.

La conversión, realizada con NeMo 1.23.0 y coremltools 8.1, integra el frontend de extracción de características log-mel dentro del grafo Core ML, de modo que el modelo acepta audio en bruto y devuelve directamente la secuencia de tokens. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de ajuste fino con RLHF o DPO (poco habituales en ASR). Tampoco se detalla la estrategia de cuantización aplicada durante la conversión.

## Capacidades

- Reconocimiento automático del habla en gujarati con salida CTC.
- Extracción de características log-mel integrada en el grafo, sin necesidad de preprocesado externo.
- Procesamiento de ventanas de audio de 10 segundos.
- Ejecución en dispositivo mediante Core ML en plataformas Apple.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documentan capacidades multimodales más allá del audio de entrada.
- No se documenta detección de idioma ni cambio de código; el vocabulario está restringido a tokens de gujarati.

## Casos de uso

- Subtitulado en tiempo casi real en dispositivos Apple: la ventana de 10 segundos y la ejecución local permiten generar subtítulos de audio en gujarati sin enviar datos a la nube, útil en apps de accesibilidad o transcripción de reuniones.
- Traducción en dispositivo dentro de TranslateBlue: al estar empaquetado como Core ML, puede encadenarse con un modelo de traducción local para ofrecer un pipeline de voz a texto traducido sin conexión.
- Transcripción de contenido audiovisual en gujarati: procesamiento por segmentos de 10 segundos para generar transcripciones de vídeos, pódcasts o grabaciones periodísticas.
- Dictado por voz en aplicaciones iOS y macOS: integración en teclados o apps de notas que necesiten entrada por voz en gujarati manteniendo la privacidad del usuario.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones para construir índices de texto consultables.
- Asistentes de atención al ciudadano en Gujarat: transcripción local de consultas orales en entornos con conectividad limitada o requisitos de protección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: aproximadamente 0,2 GB, lo que sugiere un paquete Core ML compacto apto para dispositivos con almacenamiento limitado.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; por el tamaño del paquete, cabe holgadamente en la memoria unificada de cualquier Mac Apple Silicon y en iPhone/iPad recientes.
- GPU recomendadas: no aplica en el sentido CUDA; el modelo está diseñado para el Neural Engine y la GPU integrada de chips Apple (serie M y A).
- Compatibilidad con GPU de consumo NVIDIA: no disponible; el formato Core ML no está pensado para ese ecosistema.
- Opciones de despliegue: Core ML en macOS, iOS, iPadOS y visionOS; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer_gu_CTC (esta versión) | Conformer CTC (Core ML) | gujarati | ventana de 10 s | MIT (según model card) | Core ML |
| ai4bharat/indicconformer_stt_gu_hybrid_ctc_rnnt_large | Conformer híbrido CTC+RNNT | gujarati | no disponible | MIT | NeMo / safetensors (no confirmado) |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe (incluye gujarati) | 30 s | MIT | PyTorch, GGUF, Core ML (conversiones de terceros) |

La comparación con Whisper es la más directa en el ámbito de ASR multilingüe desplegable en dispositivo, aunque no se dispone de métricas comparativas para esta conversión concreta. Frente al modelo original de AI4Bharat, esta versión sacrifica la decodificación RNNT a cambio de un paquete más simple y portable a Core ML.

## Limitaciones y advertencias

- La información pública es mínima: no hay métricas de WER/CER, ni detalles de cuantización, ni evaluación de la pérdida de precisión tras la conversión a Core ML.
- El recorte de la cabeza CTC al vocabulario de gujarati impide transcribir audio en otros idiomas o con cambio de código frecuente (por ejemplo, gujarati-inglés).
- La ventana fija de 10 segundos obliga a segmentar el audio; los límites de segmento pueden degradar la transcripción en palabras cortadas.
- No se documentan sesgos específicos, pero los modelos ASR entrenados en corpus indios pueden presentar peor rendimiento en variedades dialectales, habla con acento marcado o audio con ruido.
- Riesgo de alucinación textual inherente a los modelos CTC en segmentos de silencio o ruido; conviene aplicar umbrales de confianza y detección de voz.
- La licencia MIT figura solo en la model card; los metadatos de Hugging Face no la declaran, por lo que conviene verificar los términos antes de un uso comercial.
- Al ser un formato Core ML, el modelo queda restringido al ecosistema Apple; no es portable a servidores Linux con GPU NVIDIA sin reconversión.
- El repositorio no tiene descargas ni validación comunitaria, por lo que su fiabilidad en producción no está contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoiandroid/indicconformer-gu-ctc-coreml
- Modelo original de AI4Bharat: https://huggingface.co/ai4bharat/indicconformer_stt_gu_hybrid_ctc_rnnt_large
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- coremltools: https://github.com/apple/coremltools

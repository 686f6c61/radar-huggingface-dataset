# aoiandroid/indicconformer-pa-ctc-coreml

## Resumen

IndicConformer_pa_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indicconformer_stt_pa_hybrid_ctc_rnnt_large`, desarrollado originalmente por AI4Bharat. Esta variante, publicada por el usuario aoiandroid, extrae únicamente la cabeza CTC y la recorta a los tokens del panyabí (`pa`), integra el frontend log-mel en el propio grafo y fija una ventana de audio de 10 segundos. El resultado es un paquete Core ML orientado a inferencia en dispositivos Apple, presumiblemente para el proyecto TranslateBlue.

El modelo original es un Conformer híbrido CTC/RNNT de la familia IndicConformer, entrenado para transcripción de lenguas índicas. La conversión elimina la cabeza RNNT y conserva solo la salida CTC, lo que simplifica el despliegue y reduce el tamaño del artefacto (0,2 GB en el repositorio). No se publican en la información disponible datos sobre parámetros totales, contexto, licencia del artefacto Core ML ni idiomas más allá del panyabí implícito en el nombre.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue derivado, no de un modelo nuevo, y su interés principal reside en la posibilidad de ejecutar ASR en panyabí sobre hardware Apple sin dependencias de NeMo ni de PyTorch en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer híbrido CTC/RNNT (original); esta conversión conserva solo la cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio fija de 10 s |
| Tipos de cuantizacion | no disponible (formato Core ML; precisión no especificada) |
| Idiomas soportados | panyabí (`pa`) |
| Licencia | MIT según la model card, heredada de AI4Bharat; licencia del artefacto Core ML no especificada de forma independiente |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un Conformer, es decir, un transformer que combina bloques de autoatención con convoluciones depthwise para capturar dependencias locales y globales en la secuencia de audio. La variante original es híbrida: comparte el encoder y expone dos cabezas, CTC y RNNT. Esta conversión recorta la cabeza CTC a los tokens del panyabí y descarta la RNNT, de modo que la decodificación es puramente CTC (greedy o beam search sobre logits CTC, según implemente el consumidor).

El frontend log-mel está fusionado dentro del grafo Core ML, lo que evita preprocesar el audio fuera del modelo. La conversión se realizó con `ic_coreml_convert.py` usando NeMo 1.23.0 y coremltools 8.1 el 2026-11-23. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF/DPO (poco habitual en ASR). Tampoco se detalla la técnica de conversión más allá de las herramientas citadas.

## Capacidades

- Reconocimiento automático del habla en panyabí con salida CTC.
- Ventana de audio fija de 10 segundos por inferencia.
- Preprocesado log-mel integrado en el grafo, sin dependencia de código Python externo.
- Ejecución en dispositivos Apple mediante Core ML (CPU, GPU o Neural Engine, según configuración).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta visión, audio de entrada más allá del ASR ni modo thinking.
- Multilingüismo limitado al panyabí en esta conversión.

## Casos de uso

- Transcripción de audio en panyabí en aplicaciones iOS/macOS: el paquete Core ML permite ejecutar ASR en el dispositivo sin enviar audio a servidores, usando ventanas de 10 s segmentadas por el consumidor.
- Subtitulado offline de contenido en panyabí: integrado en una app de edición o reproductor, el modelo transcribe segmentos de 10 s y el software concatena las salidas CTC.
- Dictado por voz en panyabí dentro de apps de productividad: al ejecutarse en Neural Engine, la latencia es baja y no requiere conexión.
- Pipeline de TranslateBlue: la model card indica que la conversión se hizo para este proyecto, por lo que el caso de uso previsto es la traducción o el procesamiento de audio en panyabí dentro de esa herramienta.
- Procesamiento por lotes en macOS: scripts que invocan el modelo Core ML sobre ficheros de audio segmentados para generar transcripciones masivas.
- Evaluación comparativa de ASR índico en hardware Apple: permite medir el rendimiento de la cabeza CTC del IndicConformer sin el coste de desplegar NeMo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en memoria unificada de dispositivos Apple. El repositorio ocupa 0,2 GB, lo que da una cota superior aproximada del peso del artefacto.
- GPU recomendadas: no disponible; al ser Core ML, el hardware objetivo son chips Apple (series M y A) con Neural Engine o GPU integrada.
- Cabe en hardware de consumo Apple: sí, previsiblemente en cualquier dispositivo con Neural Engine o GPU integrada reciente, dado el tamaño del artefacto.
- Opciones de despliegue: Core ML (framework nativo de Apple); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndicConformer_pa_CTC (esta conversión) | Conformer CTC | panyabí | Core ML | MIT (según model card) | Hugging Face, 0 descargas |
| `ai4bharat/indicconformer_stt_pa_hybrid_ctc_rnnt_large` | Conformer híbrido CTC/RNNT | panyabí | NeMo (`.nemo`) | MIT | Hugging Face (AI4Bharat) |
| Whisper (variantes multilingües) | Transformer encoder-decoder | multilingüe, incluido panyabí | safetensors, GGUF, Core ML (conversiones de terceros) | MIT | Amplia |
| wav2vec2 / XLS-R ajustados a panyabí | Transformer convolucional | panyabí (fine-tuning) | safetensors | variable | Hugging Face |

La comparación con Whisper y wav2vec2 es aproximada: no se dispone de métricas de WER para esta conversión que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Ventana de audio fija de 10 s: audios más largos requieren segmentación externa y concatenación de resultados, con riesgo de errores en los límites.
- Solo cabeza CTC: se pierde la precisión del decodificador RNNT del modelo original, lo que puede aumentar el WER en comparación con el híbrido completo.
- Solo panyabí: no transcribe otras lenguas índicas ni inglés.
- Licencia: la model card declara MIT heredada de AI4Bharat, pero no se especifica de forma explícita la licencia del artefacto Core ML; conviene verificar antes de uso comercial.
- Sin datos de benchmarks ni de cuantización: no se puede estimar el impacto en precisión de la conversión a Core ML.
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados en el entrenamiento.
- Sesgos: no disponibles; dependen del dataset de entrenamiento del modelo original, no documentado en esta ficha.
- Repositorio sin descargas ni likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- Dependencia del ecosistema Apple: no desplegable en Linux, Windows ni Android sin reconversión.

## Enlaces

- Hugging Face: https://huggingface.co/aoiandroid/indicconformer-pa-ctc-coreml
- Modelo original: https://huggingface.co/ai4bharat/indicconformer_stt_pa_hybrid_ctc_rnnt_large
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- coremltools: https://github.com/apple/coremltools
- NeMo: https://github.com/NVIDIA/NeMo

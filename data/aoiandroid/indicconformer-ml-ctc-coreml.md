# aoiandroid/indicconformer-ml-ctc-coreml

## Resumen

IndicConformer_ml_CTC es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large` desarrollado por AI4Bharat. El autor de la conversión es el usuario de Hugging Face `aoiandroid`, que la publica bajo el identificador `aoiandroid/indicconformer-ml-ctc-coreml`. El objetivo es ofrecer una versión ejecutable en el ecosistema Apple (Core ML) de un modelo Conformer híbrido CTC/RNNT entrenado para malabar.

La conversión corta la cabeza CTC para dejar únicamente los tokens correspondientes al malabar, integra el frontend log-mel en el propio grafo y fija una ventana de audio de 10 segundos. El resultado es un artefacto de aproximadamente 0,2 GB pensado para su uso en la aplicación TranslateBlue, según indica la propia model card. No se publican datos sobre parámetros totales, contexto (en ASR, duración máxima de audio procesable), licencia del artefacto Core ML ni idiomas más allá del malabar implícito en el recorte de la cabeza CTC.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue derivado, no de un modelo original con paper o benchmarks propios. La información disponible en Hugging Face es mínima (0 descargas, 0 likes, sin pipeline declarado, sin licencia declarada en los metadatos y sin idiomas declarados), por lo que la mayor parte de las especificaciones técnicas solo pueden inferirse del modelo base citado en la model card, y se marcan como no disponibles cuando no hay confirmación explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer híbrido CTC/RNNT (modelo base AI4Bharat IndicConformer); artefacto convertido a Core ML con cabeza CTC recortada a tokens de malabar |
| Parametros totales | no disponible (el modelo base es la variante "large" de IndicConformer, pero no se publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; la ventana de audio fijada en la conversión es de 10 segundos |
| Tipos de cuantizacion | no disponible (la model card no detalla precision ni cuantización del artefacto Core ML) |
| Idiomas soportados | malabar (la cabeza CTC se recorta a los tokens de malabar); no se declaran otros idiomas en los metadatos |
| Licencia | no disponible en los metadatos del repo; la model card indica licencia MIT del modelo base AI4Bharat |
| Formato de pesos | Core ML (paquete `.mlpackage`/`.mlmodel`, artefacto de aproximadamente 0,2 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversión, no un entrenamiento nuevo. El modelo base es un Conformer híbrido con dos cabezas, CTC y RNNT, de la familia IndicConformer de AI4Bharat, en su variante "large". La conversión, realizada con `ic_coreml_convert.py` sobre NeMo 1.23.0 y coremltools 8.1, elimina la cabeza RNNT y recorta la cabeza CTC para conservar solo los tokens del malabar, además de fusionar el frontend log-mel dentro del grafo Core ML. La ventana de entrada queda fijada en 10 segundos de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales del modelo base más allá de lo que implica su arquitectura Conformer híbrida. Cualquier dato de entrenamiento del modelo original debe consultarse en la model card de `ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large`, que no forma parte de la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) para malabar, a partir de audio de hasta 10 segundos por ventana.
- Decodificación CTC sobre la cabeza recortada a tokens de malabar.
- Frontend log-mel integrado en el grafo Core ML, lo que simplifica el pipeline de inferencia en dispositivos Apple.
- Ejecución en el ecosistema Core ML (macOS, iOS, iPadOS), sin necesidad de framework NeMo en tiempo de inferencia.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales distintas del audio.
- No se declara soporte multilingüe más allá del malabar.

## Casos de uso

- Transcripción de audio en malabar en aplicaciones iOS/macOS: el artefacto Core ML permite ejecutar ASR en dispositivo sin depender de servicios en la nube, procesando fragmentos de hasta 10 segundos.
- Integración en la aplicación TranslateBlue: según la model card, la conversión se realizó específicamente para este producto, por lo que el caso de uso principal es la traducción o transcripción de voz en malabar dentro de esa app.
- Subtitulado offline de clips cortos: la ventana de 10 segundos encaja con segmentos breves de vídeo o notas de voz, que pueden transcribirse localmente en un Mac o iPhone.
- Procesamiento por lotes de grabaciones segmentadas: dividiendo el audio en tramos de 10 segundos, puede usarse para transcribir corpus de habla malabar en pipelines locales.
- Prototipado de asistentes de voz en malabar: sirve como componente ASR en una demo o prueba de concepto sobre dispositivos Apple, sustituyendo a APIs externas.
- Evaluación comparativa de ASR en dispositivo: útil para medir latencia y calidad de un Conformer híbrido convertido a Core ML frente a alternativas en la nube para malabar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto pesa aproximadamente 0,2 GB, lo que sugiere un consumo de memoria moderado, pero no se confirma la precisión ni el tamaño en memoria en ejecución.
- GPU recomendadas: no disponible. Al ser un artefacto Core ML, el hardware objetivo son los chips Apple (Apple Silicon y Neural Engine); no se documentan requisitos para GPU NVIDIA.
- Compatibilidad con GPU de consumo: no disponible para el ecosistema NVIDIA; en Apple Silicon se ejecutaría a través de Core ML.
- Opciones de despliegue: Core ML (coremltools, Xcode, Vision/Core ML APIs en macOS e iOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Ventana de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| aoiandroid/indicconformer-ml-ctc-coreml | Conformer híbrido CTC/RNNT convertido a Core ML | malabar | 10 s | no disponible en el repo (MIT del base según model card) | Core ML | Hugging Face, 0 descargas |
| ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large | Conformer híbrido CTC/RNNT original | malabar (modelo base) | no disponible | MIT (según model card del derivado) | no disponible | Hugging Face (modelo base citado) |
| Alternativas ASR para malabar en Core ML | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo entrenado desde cero, sino una conversión con la cabeza CTC recortada; su calidad depende enteramente del modelo base AI4Bharat.
- Ventana fija de 10 segundos: los audios más largos deben segmentarse, con el riesgo de cortes en fronteras de palabras y pérdida de contexto acústico.
- Solo malabar: la cabeza CTC se ha recortado a los tokens de este idioma, por lo que no se espera soporte para otros idiomas indios del modelo original.
- Licencia del artefacto no declarada en los metadatos de Hugging Face; la model card menciona MIT para el modelo base, pero conviene verificar los términos antes de uso comercial.
- Sin benchmarks ni métricas publicadas: no hay evidencia cuantitativa de precisión (WER) en la información disponible.
- Riesgo de alucinación y errores de transcripción inherente a cualquier ASR, agravado por la ausencia de datos de evaluación.
- Sin pipeline declarado, 0 descargas y 0 likes: no hay señal de validación por parte de la comunidad.
- Dependencia del ecosistema Apple: al estar en formato Core ML, no es portable directamente a entornos Linux o Windows sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aoiandroid/indicconformer-ml-ctc-coreml
- Modelo base citado: https://huggingface.co/ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large
- AI4Bharat (organización): https://huggingface.co/ai4bharat
- NeMo (NVIDIA): https://github.com/NVIDIA/NeMo
- coremltools: https://github.com/apple/coremltools

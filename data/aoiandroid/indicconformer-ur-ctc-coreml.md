# aoiandroid/indicconformer-ur-ctc-coreml

## Resumen

IndicConformer_ur_CTC es una conversión a Core ML del modelo IndicConformer de AI4Bharat, en su variante para urdu (código de idioma `ur`), con la cabeza CTC recortada a los tokens de ese idioma y un frontend log-mel fusionado en el propio grafo. El modelo original es un reconocedor de voz (ASR) basado en arquitectura Conformer con cabezas híbridas CTC/RNNT; esta conversión conserva únicamente la cabeza CTC y está empaquetada para ejecución nativa en el ecosistema Apple (Core ML), con una ventana de audio de 10 segundos.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo multimodal general, sino de un artefacto de despliegue derivado de un modelo ASR multilingüe de AI4Bharat, orientado a inferencia en dispositivos Apple. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,2 GB y fue creado y actualizado el 23 de noviembre de 2026. La model card es extremadamente escueta y no aporta datos de entrenamiento, benchmarks ni especificaciones detalladas más allá de la conversión.

La información disponible no permite confirmar parámetros totales, longitud de contexto (en el sentido de ventana de audio más allá de los 10 s indicados), tipos de cuantización ni idiomas soportados más allá de urdu. Todo ello se marca como no disponible en las secciones correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (ASR) con cabeza CTC; conversión a Core ML con frontend log-mel fusionado |
| Parámetros totales | no disponible (la model card menciona la variante "large" del IndicConformer original, sin cifra) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 10 s (según model card); contexto textual no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | urdu (`ur`), según el recorte de la cabeza CTC a tokens `ur` |
| Licencia | MIT (AI4Bharat), según la model card; el repositorio no declara licencia en metadatos |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`, empaquetado Core ML); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es IndicConformer de AI4Bharat, un sistema de reconocimiento automático del habla construido sobre bloques Conformer (convolución + autoatención) con cabezas híbridas CTC y RNNT. La model card indica que la conversión parte de la variante "large" híbrida CTC/RNNT y que se ha recortado la cabeza CTC a los tokens correspondientes a urdu, además de fusionar el frontend log-mel en el grafo Core ML. La conversión se realizó el 23 de noviembre de 2026 con el script `ic_coreml_convert.py`, usando NeMo 1.23.0 y coremltools 8.1, para el proyecto TranslateBlue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales del modelo original más allá de lo citado. Tampoco se detalla si la conversión aplica cuantización, poda o alguna optimización específica para Apple Neural Engine.

## Capacidades

- Reconocimiento automático del habla (ASR) en urdu a partir de audio de entrada.
- Decodificación CTC sobre una ventana de audio de 10 segundos.
- Frontend log-mel integrado en el grafo Core ML, lo que simplifica el pipeline de inferencia en dispositivos Apple.
- Ejecución nativa mediante Core ML (posible uso de CPU, GPU o Neural Engine, no confirmado en la model card).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step, visión, audio generativo ni modo "thinking".
- Capacidades multilingües: no disponibles; la cabeza CTC está recortada a tokens de urdu.

## Casos de uso

- Transcripción de audio en urdu en aplicaciones iOS y macOS: el modelo se integra como `.mlpackage` en una app y procesa fragmentos de hasta 10 s, adecuado para dictado o notas de voz.
- Subtitulado y transcripción de reuniones en urdu en local: al ejecutarse en Core ML, permite procesar audio sin enviar datos a la nube, lo que resulta útil por privacidad.
- Pipeline de traducción (TranslateBlue): la model card indica que la conversión se hizo para este proyecto, por lo que encaja como etapa ASR previa a traducción automática.
- Procesamiento por lotes de archivos de audio en Mac: la ventana de 10 s permite segmentar y transcribir audios largos en un flujo por trozos.
- Prototipado de asistentes de voz en urdu en dispositivos Apple: al ser un artefacto Core ML, se puede probar en Xcode sin infraestructura de servidor.
- Evaluación comparativa de ASR en urdu en el ecosistema Apple: útil para medir latencia y precisión en hardware consumer frente a alternativas en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,2 GB, lo que sugiere un modelo compacto, pero no se confirma el tamaño real de los pesos ni la cuantización.
- GPU recomendadas: no aplica en el sentido CUDA; el destino es Core ML en hardware Apple (CPU, GPU integrada o Neural Engine).
- Cabe en GPU consumer: no disponible para GPUs NVIDIA; en hardware Apple, el tamaño del repo (0,2 GB) hace plausible su ejecución en dispositivos con memoria unificada modesta, aunque no está confirmado.
- Opciones de despliegue: Core ML (coremltools, Xcode, Vision/Core ML APIs). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Ventana | Licencia | Formato |
|---|---|---|---|---|---|
| IndicConformer_ur_CTC (esta ficha) | Conformer CTC (Core ML) | urdu | 10 s | MIT (AI4Bharat) según model card | Core ML |
| IndicConformer original (AI4Bharat) | Conformer híbrido CTC/RNNT | multilingüe índico | no disponible en esta ficha | MIT | NeMo |
| Whisper (OpenAI) | Transformer encoder-decoder ASR | multilingüe | 30 s | MIT | safetensors, GGUF, Core ML (conversiones de terceros) |
| Otros ASR en Core ML | variable | variable | variable | variable | Core ML |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no hay información sobre sesgos, datos de entrenamiento ni evaluación de calidad.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente en audio con ruido, acentos o vocabulario específico; no cuantificado.
- Limitación de idioma: la cabeza CTC está recortada a tokens de urdu, por lo que no se espera transcripción correcta en otros idiomas.
- Ventana fija de 10 s: audios más largos requieren segmentación externa, con posible pérdida de contexto entre segmentos.
- Licencia: la model card cita MIT (AI4Bharat), pero los metadatos del repositorio no declaran licencia; conviene verificar antes de uso comercial.
- Al ser una conversión Core ML, la portabilidad fuera del ecosistema Apple es limitada.
- Sin descargas ni validación comunitaria: no hay evidencia pública de calidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/aoiandroid/indicconformer-ur-ctc-coreml
- Modelo original IndicConformer de AI4Bharat: no disponible en la información proporcionada
- Script de conversión `ic_coreml_convert.py`: no disponible en la información proporcionada
- Proyecto TranslateBlue: no disponible en la información proporcionada

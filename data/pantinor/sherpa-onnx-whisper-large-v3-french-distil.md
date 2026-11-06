# pantinor/sherpa-onnx-whisper-large-v3-french-distil

## Resumen

`sherpa-onnx-whisper-large-v3-french-distil` es una exportación a ONNX con cuantización int8 del modelo `bofenghuang/whisper-large-v3-french-distil-dec16`, un ajuste fino en francés de Whisper large-v3 al que se le ha reducido el decodificador de 32 a 16 capas. Lo publica el usuario `pantinor` como modelo externo para el catálogo de la aplicación comunitaria Anti-Vocale, con el objetivo de que pueda importarse como un modelo de la familia Whisper sin necesidad de actualizar la aplicación.

El interés técnico reside en que el modelo destilado mejora simultáneamente en precisión y en velocidad frente al ajuste fino completo y frente a Whisper Turbo. Según las mediciones del autor sobre FLEURS fr_fr, este export int8 obtiene un WER de 6,54 frente a 7,10 del fine-tune completo y 8,59 de Whisper Turbo int8, con un RTF de 0,942 bajo carga concurrente (estimación en reposo de 0,57-0,72) frente a 2,415 del fine-tune completo.

El repositorio ocupa 1,4 GB y contiene únicamente los artefactos de inferencia para sherpa-onnx: encoder y decoder en formato ONNX int8 más el fichero de tokens. No incluye pesos en safetensors ni pipeline de Hugging Face, por lo que está pensado para despliegue en runtime sherpa-onnx y no para uso directo con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) con decodificador destilado a 16 capas |
| Parametros totales | no disponible (repo de 1,4 GB en int8; el modelo base es un large-v3 con decodificador reducido) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | int8 (encoder con cuantizacion MatMul int8; decoder con cuantizacion int8 per-channel) |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 (el modelo base se describe como MIT en la model card) |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención completa sobre espectrogramas Mel de 30 segundos, especializado en reconocimiento automático del habla. La variante utilizada aquí es un destilado de `bofenghuang/whisper-large-v3-french-distil-dec16`, en el que el decodificador se ha reducido de 32 a 16 capas, lo que recorta el coste computacional de la fase de decodificación manteniendo el encoder completo. El ajuste fino original está especializado en francés.

La exportación se realizó con un toolchain alineado con la versión del checkpoint (torch 2.3.1, onnx 1.16.2, openai-whisper 20250625, sherpa-onnx v2.0.1). El autor documenta una particularidad relevante: el layout del tokenizer de Hugging Face inserta `<|yue|>` en el id 50358, por lo que la exportación permuta el embedding de tokens al orden de ids de OpenAI (de 51866 a 51865). Además, los safetensors del destilado omiten `proj_out` por pesos atados; la comprobación de concordancia coincidió con el `original_model.pt` del autor en ambas pruebas de validación, y las pruebas int8 de sherpa decodifican el mismo texto en francés que la referencia del pipeline de Hugging Face. No se documentan detalles sobre volumen de datos de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en francés, con salida de transcripción de texto.
- Inferencia optimizada para sherpa-onnx mediante grafos ONNX cuantizados a int8.
- Compatible con el ecosistema de la aplicación Anti-Vocale como modelo externo de la familia Whisper, sin requerir actualización de la aplicación.
- Manejo de audio de hasta 30 segundos por segmento, según la ventana estándar de Whisper.
- No soporta tool calling ni function calling.
- No está orientado a razonamiento multi-paso ni a comportamiento agente.
- No dispone de modo thinking, visión ni audio más allá de la transcripción ASR.
- Multilingüismo limitado al francés según la model card, aunque el tokenizer es el multilingüe estándar de Whisper.

## Casos de uso

- Transcripción de reuniones y entrevistas en francés: el modelo procesa segmentos de hasta 30 segundos y su decodificador de 16 capas reduce el coste por token generado, lo que lo hace adecuado para diarización y post-procesado por lotes en servidores sin GPU dedicada.
- Subtitulado automático de vídeo en francés: la exportación int8 permite ejecutar la inferencia en CPU con un RTF inferior a 1 bajo carga, de modo que un vídeo de una hora puede transcribirse en un tiempo comparable o inferior a su duración.
- Integración en aplicaciones de escritorio o móviles vía sherpa-onnx: al distribuirse como grafos ONNX de 1,4 GB, puede empaquetarse en aplicaciones nativas que ya usan el runtime sherpa-onnx sin dependencias de PyTorch.
- Atención al cliente con transcripción de llamadas: el modelo puede transcribir grabaciones de llamadas en francés para su análisis posterior, con un WER medido de 6,54 en FLEURS fr_fr, suficiente para extracción de entidades y clasificación de motivos.
- Archivado y búsqueda de contenido audiovisual: la transcripción en francés generada puede indexarse para búsqueda semántica en bibliotecas de audio o vídeo, aprovechando la velocidad del decodificador destilado para procesar grandes volúmenes.
- Evaluación comparativa de modelos ASR en francés: al estar publicado junto a un informe de benchmark reproducible (protocolo de 40 clips, jiwer WER, RTF en M3 Pro), sirve como referencia para comparar exportaciones int8 de Whisper en condiciones controladas.
- Despliegue en el catálogo Anti-Vocale: los usuarios de esa aplicación pueden importarlo como modelo externo de la familia Whisper sin esperar una actualización de la app, lo que facilita probar el destilado francés frente al baseline Turbo.

## Benchmarks y rendimiento

Datos medidos por el autor sobre FLEURS fr_fr con protocolo de 40 clips y WER calculado con jiwer:

| Modelo | WER | RTF (4 hilos, M3 Pro) |
|---|---|---|
| whisper-large-v3-french-distil-dec16 int8 (este repo) | 6,54 | 0,942 bajo carga concurrente (estimación en reposo 0,57-0,72) |
| whisper-large-v3-french int8 (fine-tune completo) | 7,10 | 2,415 bajo la misma carga |
| Whisper Turbo int8 (OpenAI, baseline incluido) | 8,59 | 0,43 en reposo |

El autor indica que el destilado supera tanto al fine-tune completo como a Turbo con un payload de 1,35 GB, el 76 % del tamaño del fine-tune completo. El registro completo del benchmark está enlazado en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,4 GB en int8 y la inferencia puede ejecutarse en CPU, por lo que no requiere VRAM dedicada en ese modo.
- GPU recomendadas: no disponible; las mediciones publicadas se realizaron en CPU (Apple M3 Pro, 4 hilos).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de memoria libre al usar los grafos int8, aunque no se documentan pruebas específicas.
- Opciones de despliegue: sherpa-onnx (runtime objetivo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: RTF de 0,942 bajo carga concurrente y estimación en reposo de 0,57-0,72 en M3 Pro con 4 hilos; el baseline Turbo int8 obtiene 0,43 en reposo en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (FLEURS fr_fr) | RTF (M3 Pro) | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (distil dec16 int8) | no disponible (decoder 16 capas) | 30 s de audio | 6,54 | 0,942 bajo carga | Apache 2.0 | ONNX int8 |
| whisper-large-v3-french int8 (fine-tune completo) | no disponible (decoder 32 capas) | 30 s de audio | 7,10 | 2,415 bajo carga | no disponible en la informacion | ONNX int8 |
| Whisper Turbo int8 (OpenAI) | no disponible | 30 s de audio | 8,59 | 0,43 en reposo | no disponible en la informacion | ONNX int8 |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en francés; no debe esperarse un rendimiento aceptable en otros idiomas aunque el tokenizer sea multilingüe.
- El WER de 6,54 procede de un protocolo reducido de 40 clips sobre FLEURS fr_fr; no equivale a una evaluación exhaustiva en dominios como audio telefónico, ruido de fondo o acentos regionales.
- Las mediciones de RTF se realizaron bajo carga concurrente en un Apple M3 Pro con 4 hilos; el rendimiento en otras CPU o GPU puede diferir y no se documenta.
- Al ser una exportación int8, existe una pérdida de precisión respecto al checkpoint original en float; el autor verifica que las pruebas decodifican el mismo texto que el pipeline de Hugging Face, pero no se cuantifica la degradación en todos los dominios.
- El repositorio no incluye pesos en safetensors ni pipeline de `transformers`; solo es utilizable con sherpa-onnx o con un runtime compatible con los grafos ONNX exportados.
- La model card describe el modelo base como MIT mientras que la licencia declarada del repo es Apache 2.0; conviene verificar los términos aplicables antes de un uso comercial.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio musical; no se documentan mitigaciones específicas en esta exportación.
- El número de descargas y likes es cero en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pantinor/sherpa-onnx-whisper-large-v3-french-distil
- Modelo base: https://huggingface.co/bofenghuang/whisper-large-v3-french-distil-dec16
- Proyecto Anti-Vocale: https://github.com/RisorseArtificiali/anti-vocale
- Informe de benchmark: https://github.com/RisorseArtificiali/anti-vocale/blob/main/docs/scout-reports/2026-11-03-fr-distil-bench.md

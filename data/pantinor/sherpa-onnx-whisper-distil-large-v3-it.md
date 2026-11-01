# pantinor/sherpa-onnx-whisper-distil-large-v3-it

## Resumen

`sherpa-onnx-whisper-distil-large-v3-it` es una exportación a ONNX, cuantizada en int8, del modelo de reconocimiento automático del habla `bofenghuang/whisper-large-v3-distil-it-v0.2`, una destilación específica para italiano de Whisper large-v3 de OpenAI. Lo publica el usuario `pantinor` en HuggingFace y está pensado exclusivamente para su uso con el runtime sherpa-onnx (k2-fsa), lo que lo convierte en una pieza lista para integrar en aplicaciones de transcripción en producción sin depender de PyTorch.

La innovación principal es la destilación del decodificador: se reduce de 32 capas a solo 2, manteniendo el encoder de Whisper large-v3 (n_mels 128, n_audio_ctx 1500, n_text_state 1280). Esto rebaja drásticamente el coste computacional y el tamaño (unos 937 MB en total entre encoder y decoder int8) a cambio de una pérdida de calidad que el autor describe como "fuerte calidad de transcripción en italiano". El vocabulario es el estándar de Whisper (51.866 tokens) y el contexto de texto es de 448 tokens.

Es relevante ahora porque permite desplegar ASR de calidad Whisper large-v3 en CPU o GPUs modestas, con cuantización int8 y un runtime C++ ligero (sherpa-onnx), lo que facilita su uso en aplicaciones de escritorio, móviles o edge. La licencia Apache 2.0 elimina fricciones para uso comercial, aunque el modelo solo cubre italiano y no incluye datos de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 con decoder destilado a 2 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 448 tokens de texto (n_text_ctx); audio: n_audio_ctx 1500 frames, n_mels 128 |
| Tipos de cuantizacion | int8 (QInt8 en operaciones MatMul) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder y decoder separados) + tokens.txt |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3: un encoder Transformer que procesa espectrogramas mel de 128 bandas (n_mels=128) con 1500 frames de contexto de audio (n_audio_ctx=1500), y un decoder Transformer autorregresivo con contexto de texto de 448 tokens (n_text_ctx=448) y dimensión de estado de texto de 1280 (n_text_state=1280). La modificación clave es la destilación del decoder, que pasa de 32 capas a 2, reduciendo el coste de decodificación de forma muy significativa. El vocabulario es el de Whisper (51.866 tokens).

El modelo base `bofenghuang/whisper-large-v3-distil-it-v0.2` fue destilado específicamente para italiano por bofenghuang a partir de Whisper large-v3. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La exportación a ONNX se realizó con un script basado en `k2-fsa/sherpa-onnx/scripts/whisper/export-onnx.py`, y la cuantización int8 se aplica sobre las operaciones MatMul. Los pesos resultantes son: encoder int8 (~637 MB), decoder int8 (~300 MB) y tokens.txt (~798 KB).

## Capacidades

- Reconocimiento automático del habla (ASR) en italiano, incluyendo transcripción de audio a texto.
- Transcripción de audio de hasta 30 segundos por ventana (límite estándar de Whisper, derivado de n_audio_ctx 1500 y n_mels 128).
- Detección de idioma limitada: el modelo está especializado en italiano, no es multilingüe.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No incluye visión, audio generativo ni modo "thinking".
- Integración nativa con el runtime sherpa-onnx para inferencia en C++/Python/otros bindings.
- Capacidad de ejecución en CPU gracias a la cuantización int8 y al decoder reducido.

## Casos de uso

- Transcripción de reuniones y notas de voz en italiano: el modelo convierte audio en texto con un decoder de solo 2 capas, lo que permite procesar reuniones en tiempo casi real en CPU sin GPU dedicada.
- Subtitulado automático de vídeo en italiano: se puede integrar en pipelines de postproducción para generar subtítulos SRT/VTT, aprovechando la ventana de 30 segundos por segmento típica de Whisper.
- Asistentes de voz para aplicaciones móviles o de escritorio: sherpa-onnx permite empaquetar el modelo en apps nativas (Android, iOS, desktop) con un footprint de ~937 MB en int8, adecuado para dispositivos con almacenamiento moderado.
- Atención al cliente por voz en italiano: transcripción de llamadas para análisis de calidad, búsqueda en grabaciones o generación de resúmenes posteriores, con licencia Apache 2.0 que permite uso comercial.
- Accesibilidad: generación de transcripciones en vivo para personas con discapacidad auditiva en contextos italoparlantes, desplegable en hardware de bajo coste.
- Investigación en ASR y destilación: el modelo sirve como referencia para estudiar el impacto de reducir el decoder de 32 a 2 capas en calidad de transcripción, y como base para fine-tuning adicional en dominios específicos (médico, legal, etc.).
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la cuantización int8 y el runtime C++ permiten throughput razonable en CPUs multinúcleo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los pesos int8 (~937 MB en total), cabría esperar un consumo en torno a 1-2 GB en memoria, pero no se confirma en la información proporcionada.
- GPU recomendadas: no especificadas; el modelo está diseñado para sherpa-onnx, que prioriza ejecución en CPU. Cualquier GPU con soporte ONNX Runtime (RTX 4090, A100, H100) podría ejecutarlo, pero no hay datos de rendimiento.
- ¿Cabe en consumer GPU? Sí, por tamaño de pesos, cualquier GPU con al menos 2-4 GB de memoria libre debería poder cargarlo, aunque no se confirma oficialmente.
- Opciones de despliegue: sherpa-onnx (runtime principal), ONNX Runtime. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| sherpa-onnx-whisper-distil-large-v3-it | no disponible (decoder 2 capas) | 448 tokens texto / 1500 frames audio | Italiano | Apache 2.0 | ONNX int8 | Exportación específica para sherpa-onnx |
| bofenghuang/whisper-large-v3-distil-it-v0.2 | no disponible (decoder 2 capas) | 448 tokens texto / 1500 frames audio | Italiano | no disponible en la información | PyTorch (presumiblemente) | Modelo base del que deriva esta exportación |
| openai/whisper-large-v3 | ~1550 M (decoder 32 capas) | 448 tokens texto / 1500 frames audio | Multilingüe (99 idiomas) | MIT (según OpenAI) | PyTorch, ONNX, GGUF | Modelo original sin destilar; mayor coste computacional |
| whisper-large-v3-turbo | ~809 M | 448 tokens texto / 1500 frames audio | Multilingüe | MIT | PyTorch, ONNX | Alternativa de OpenAI con decoder reducido a 4 capas |

La comparativa se limita a modelos de la misma familia Whisper; no se dispone de datos de benchmarks para comparar calidad objetivamente. La principal ventaja de esta exportación es su integración directa con sherpa-onnx y su tamaño reducido en int8, mientras que su desventaja es la especialización exclusiva en italiano.

## Limitaciones y advertencias

- Especializado exclusivamente en italiano: no es multilingüe y su rendimiento en otros idiomas será deficiente o nulo.
- La destilación del decoder a 2 capas puede degradar la calidad frente a Whisper large-v3 completo, especialmente en audio con ruido, acentos marcados o vocabulario técnico; no hay benchmarks publicados que cuantifiquen esta pérdida.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible pero incorrecto en segmentos de silencio, ruido o audio ininteligible.
- Ventana de audio limitada a 30 segundos por segmento (herencia de Whisper); audios más largos requieren segmentación manual o por VAD.
- Dependencia del runtime sherpa-onnx: los archivos ONNX están pensados para ese runtime y pueden no ser directamente compatibles con otros pipelines ONNX sin adaptación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una publicación reciente o poco validada por la comunidad; conviene evaluar la calidad en el dominio propio antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las obligaciones de atribución y las licencias del modelo base y del modelo original de OpenAI.
- No se dispone de información sobre sesgos específicos del modelo destilado; los sesgos de Whisper large-v3 (por ejemplo, en variedades dialectales del italiano) podrían persistir.

## Enlaces

- HuggingFace: https://huggingface.co/pantinor/sherpa-onnx-whisper-distil-large-v3-it
- Modelo base: https://huggingface.co/bofenghuang/whisper-large-v3-distil-it-v0.2
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Script de exportación: https://github.com/k2-fsa/sherpa-onnx/blob/master/scripts/whisper/export-onnx.py
- Whisper original de OpenAI: https://github.com/openai/whisper

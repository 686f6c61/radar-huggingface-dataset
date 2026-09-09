# EmreAkgul/omniASR-CTC-7B-ONNX

## Resumen

omniASR-CTC-7B-ONNX es una conversión a formato ONNX del modelo de reconocimiento automático de voz (ASR) multilingüe omniASR_CTC_7B desarrollado por Meta. La exportación la ha realizado el autor EmreAkgul con el objetivo de permitir su inferencia a través de la librería fast-omniasr, sin retrain ni modificación de los pesos originales. Se trata de un modelo de audio-a-texto que utiliza una cabeza de salida CTC (Connectionist Temporal Classification) y no una arquitectura de tipo LLM o seq2seq.

El modelo resuelve la transcripción automática de voz en múltiples idiomas, con un tamaño de 7.000 millones de parámetros y un vocabuario de salida de 10.288 unidades. La relevancia actual radica en que ofrece una vía de despliegue optimizada para ONNX Runtime, uniendo la capacidad multilingüe del modelo upstream de Meta con un runtime ampliamente utilizado en entornos de producción. La conversión conserva el tokenizer SentencePiece original y usa formas dinámicas en el grafo ONNX, lo que permite manejar entradas de audio de duración variable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza CTC sobre codificador de audio (modelo upstream omniASR_CTC_7B de Meta) |
| Parametros totales | 7B (7.000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; entrada de audio de duración variable con forma dinámica ONNX) |
| Tipos de cuantizacion | FP32 (ONNX verificado); FP16 experimental en fast-omniasr, no verificado |
| Idiomas soportados | Multilingüe (idiomas concretos no disponibles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx con archivos de datos externos; tokenizer.model SentencePiece) |

## Arquitectura y entrenamiento

El modelo es una exportación directa del checkpoint oficial de Meta omniASR_CTC_7B al formato ONNX. La conversión se realizó con torch.onnx.export, utilizando opset 18 y dynamo=False, sin retrain ni modificación intencional de los pesos. El grafo ONNX hace referencia a archivos de datos externos para almacenar los tensores, y el repositorio incluye un config.json que registra tamaños y hashes SHA-256 para verificar todos los assets.

El modelo upstream es un sistema de reconocimiento automático de voz multilingüe con cabeza CTC. No se dispone en la información proporcionada de detalles sobre la arquitectura interna (número de capas, dimensiones ocultas, etc.), ni de datos de entrenamiento (número de tokens, composición del dataset o uso de técnicas como RLHF/DPO). La model card indica que no se cambian las capacidades del modelo original y que se deben consultar el repositorio upstream para información sobre datos de entrenamiento y evaluación.

## Capacidades

- Transcripción automática de voz en múltiples idiomas (ASR multilingüe) con salida CTC.
- Acepta audio mono; fast-omniasr remuestrea archivos de audio a 16 kHz y los normaliza antes de la inferencia.
- Salida en forma de logits con dimensiones [1, frames, 10288], donde cada frame corresponde a una unidad del vocabulario.
- Compatible con la librería fast-omniasr para cargar el modelo desde Hugging Face Hub y transcribir directamente archivos de audio (por ejemplo, model.transcribe("speech.wav")).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por tratarse de un modelo de audio-a-texto.
- No soporta visión, entrada de texto ni generación de lenguaje libre; tampoco incluye la ruta LLM/seq2seq de la familia OmniASR.

## Casos de uso

- Transcripción de reuniones: el modelo puede transcribir audios mono de reuniones con contenido multilingüe, aprovechando la cabeza CTC y su tamaño de 7B para obtener una transcripción robusta en varios idiomas.
- Subtitulación automática de vídeos: al alimentar el audio de un vídeo (previamente remuestreado a 16 kHz), permite generar subtítulos en diferentes idiomas para distribución y accesibilidad.
- Archivado de podcasts: convierte episodios largos de podcast en texto para posterior búsqueda, indexación y análisis documental, sin depender de un modelo ligero de menor precisión.
- Análisis de llamadas de atención al cliente: transcribe interacciones de voz para alimentar pipelines posteriores de análisis de sentimiento, extracción de entidades o categorización, gracias a la salida estable de CTC.
- Accesibilidad para personas con discapacidad auditiva: con hardware adecuado (GPU de alta VRAM), puede proporcionar subtítulos en tiempo real o casi real en entornos controlados, mejorando la accesibilidad de contenidos audiovisuales.
- Búsqueda por contenido de audio: al convertir audio en texto, se pueden construir índices de búsqueda textual sobre archivos de audio, permitiendo localizar fragmentos concretos en repositorios de voz.
- Investigación en ASR multilingüe: sirve como base para evaluar el rendimiento del modelo upstream en idiomas de bajos recursos o comparar la fidelidad de la conversión ONNX respecto al checkpoint original.
- Preprocesamiento en pipelines de NLP: se usa como paso de conversión audio-a-texto para conectar sistemas de voz con modelos de lenguaje aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio upstream de Meta para obtener detalles de evaluación del modelo original, pero no se incluyen valores numéricos de métricas como WER, CER, MMLU, HumanEval u otras. Por tanto, no se puede presentar una tabla comparativa de rendimiento.

## Requisitos de hardware

- Estimación orientativa de VRAM para FP32: 7B parámetros × 4 bytes ≈ 28 GB, por lo que se necesita una GPU con al menos 32 GB de VRAM para cargar el modelo completo en memoria (por ejemplo, A100 40/80 GB o H100 80 GB).
- Estimación orientativa para FP16: los pesos ocuparían alrededor de 14 GB, lo que podría permitir el despliegue en una RTX 4090 (24 GB), aunque fast-omniasr indica que FP16 es experimental y puede modificar los resultados de reconocimiento.
- El tamaño total del repositorio es de 26 GB, por lo que se recomienda disponer de buena conectividad y almacenamiento.
- Despliegue: la vía verificada es ONNX Runtime a través de fast-omniasr (backend "onnx"). Se menciona soporte experimental para TensorRT en fast-omniasr, pero no es la ruta recomendada.
- Latencia y throughput: no disponibles en la información facilitada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks en la información proporcionada, por lo que no se puede realizar una comparativa numérica fiable. El modelo es una conversión del omniASR_CTC_7B de Meta; para comparar con otros sistemas ASR multilingües como Whisper-large-v3 o el propio modelo upstream, se debería consultar el repositorio original de Meta, que no está incluido en los resultados de búsqueda facilitados.

## Limitaciones y advertencias

- El repositorio es una conversión de formato; las capacidades, cobertura de idiomas, precisión y limitaciones del modelo upstream se aplican sin cambios.
- La ruta FF32 en ONNX es la única verificada; el uso de FP16 puede alterar los resultados de reconocimiento.
- No soporta la ruta LLM/seq2seq de OmniASR; únicamente dispone de la cabeza CTC.
- La entrada debe ser audio mono. Otros formatos o canales requieren preprocesamiento externo (resampling a 16 kHz y normalización).
- No se especifican los idiomas exactos soportados, por lo que no se puede garantizar cobertura completa para todas las lenguas.
- El modelo es pesado (7B) y requiere recursos de hardware elevados, lo que puede limitar su uso en entornos con GPUs modestas.
- Se trata de una distribución independiente no afiliada a Meta; no existe respaldo oficial ni soporte del fabricante para esta conversión.
- No hay información sobre sesgos, riesgos de alucinación ni evaluaciones de seguridad en la model card; estas deben consultarse en el repositorio upstream.

## Enlaces

- Hugging Face: https://huggingface.co/EmreAkgul/omniASR-CTC-7B-ONNX
- Repositorio upstream de Meta (Omnilingual ASR): https://github.com/facebookresearch/omnilingual-asr
- Repositorio fast-omniasr: https://github.com/Emre-Akgul/fast-omniasr

# oluwagbotty/fastconformer-ctc-en-ft-onnx

## Resumen

`fastconformer-ctc-en-ft-onnx` es la exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `oluwagbotty/fastconformer-ctc-en-ft`, un FastConformer con cabecera CTC afinado sobre el corpus CDLI Non-Standard Speech Dataset (inglés ruandés no estándar) del Centre for Digital Language Inclusion del UCL. El repositorio lo publica el usuario `oluwagbotty` bajo licencia CC-BY-4.0 y contiene un único grafo ONNX que va desde audio PCM mono a 16 kHz hasta log-probabilidades, incluyendo el front-end de audio, el encoder y el decoder de NeMo.

La relevancia de esta ficha no está en el modelo base (un FastConformer-CTC de la familia NVIDIA NeMo, del orden de 115 M de parámetros en su variante "large") sino en el empaquetado: al integrar todo el pipeline en un solo grafo ONNX, un dispositivo solo necesita `onnxruntime` para inferir, sin depender del framework NeMo ni de sus dependencias. El autor declara paridad de transcripción greedy con NeMo en 50 de 50 grabaciones de test.

Es un modelo muy pequeño (repo de 0,5 GB, pesos cuantizados) pensado para despliegue en el borde o en entornos con recursos limitados, y específicamente orientado a habla inglesa no estándar grabada en Ruanda en 2026. No es un modelo de propósito general: su dominio, hablantes y condiciones de grabación están acotados y así lo advierte la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (Conformer con atención submuestreada) con cabecera CTC, exportado como grafo ONNX único (front-end + encoder + decoder) |
| Parametros totales | no disponible (la variante "large" de NVIDIA FastConformer-CTC ronda los 115 M, pero el autor no publica el recuento de este checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio de longitud variable, `audio` float32 [1, samples] a 16 kHz) |
| Tipos de cuantizacion | pesos cuantizados en el export ONNX (tag `base_model:quantized`); no se detallan los esquemas exactos |
| Idiomas soportados | inglés (`en`), concretamente inglés ruandés no estándar |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) y `labels.json` |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-CTC de NVIDIA NeMo: un encoder Conformer con atención submuestreada que reduce la secuencia temporal antes de las capas de auto-atención, seguido de una capa lineal de clasificación CTC sobre el vocabulario de tokens (incluido el token blank al final). El export ONNX fusiona el front-end de audio (extracción de features mel), el encoder y el decoder en un solo grafo, de modo que la entrada es directamente audio PCM float32 mono a 16 kHz y la salida son log-probabilidades por frame más el número de frames.

El ajuste fino se realizó sobre el dataset `cdli/rwandan_english_nonstandard_speech_v1.0`, grabado en Ruanda en 2026 en interiores con bajo ruido mediante una app de tablet, a partir de descripciones libres de imágenes y de frases leídas. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (en un modelo CTC puro esto último no aplicaría). El autor reporta que el grafo ONNX reproduce el texto greedy de NeMo en 50 de 50 grabaciones de test (`check.json`), lo que valida la fidelidad de la exportación.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés con decodificación greedy CTC.
- Transcripción de audio mono a 16 kHz directamente desde PCM, sin preprocesado externo.
- Salida de log-probabilidades por frame, lo que permite aplicar decodificación propia (greedy o beam search) sobre la matriz de salida.
- Mapa de tokens en `labels.json` con marca `▁` para inicio de palabra, compatible con tokenizadores tipo SentencePiece.
- Ejecución mediante `onnxruntime` en CPU o GPU, sin dependencia del framework NeMo.
- No soporta tool calling, function calling, agentes, visión, audio de entrada distinto de voz ni modo "thinking"; es un modelo puramente acústico.
- Capacidad multilingüe: no, únicamente inglés.

## Casos de uso

- Transcripción en el borde: al ser un grafo ONNX de 0,5 GB que solo requiere `onnxruntime`, puede ejecutarse en dispositivos con recursos limitados (Raspberry Pi, mini-PC, móvil con runtime ONNX) para dictado o subtitulado local sin conexión.
- Subtitulado de grabaciones de campo: adecuado para material recogido en condiciones similares al corpus de entrenamiento (interiores, bajo ruido, hablantes adultos), como entrevistas o encuestas grabadas con tablet.
- Investigación en habla no estándar: sirve como baseline reproducible para estudiar ASR sobre inglés ruandés y comparar con el modelo NeMo original.
- Pipeline de evaluación de ASR: al exportar log-probabilidades, se puede integrar en herramientas de scoring (WER/CER) o en decodificadores externos con léxico y modelo de lenguaje.
- Prototipado rápido de aplicaciones de voz: la simplicidad del despliegue ONNX permite montar demos de transcripción en pocas líneas de código.
- Preprocesado de audio para pipelines de NLP: transcribir audio a texto antes de pasarlo a un LLM o a un sistema de búsqueda, en entornos donde no se quiere depender de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el grafo ONNX produce el mismo texto greedy que NeMo en 50 de 50 grabaciones de test (`check.json`); no se aportan cifras de WER, CER ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo ocupa 0,5 GB y los pesos están cuantizados, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o DirectML); para un modelo de ~115 M de parámetros basta una GTX 1650 o superior. Una RTX 4090 o A100 no aportan ventaja significativa salvo por throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~1 GB de VRAM libre; también en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT), integrable en Python, C++, C# o JavaScript; no se distribuye en formato GGUF ni como modelo de Ollama o llama.cpp.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| oluwagbotty/fastconformer-ctc-en-ft-onnx | no disponible (~115 M en la variante large de NVIDIA) | audio 16 kHz de longitud variable | CC-BY-4.0 | ONNX | Afinado sobre inglés ruandés no estándar; grafo único |
| nvidia/stt_en_fastconformer_ctc_large | ~115 M | audio 16 kHz de longitud variable | CC-BY-4.0 | NeMo (.nemo) | Modelo base de NVIDIA, inglés general en minúsculas |
| branchkit/nemo-ctc-en-fastconformer-large-onnx | ~115 M | audio 16 kHz de longitud variable | no disponible | ONNX | Export ONNX del modelo de NVIDIA, sin ajuste fino sobre habla no estándar |

La comparación con los dos modelos de NVIDIA es la más directa por arquitectura y tamaño; la diferencia principal es el dominio de entrenamiento (inglés ruandés no estándar frente a inglés general) y el empaquetado (ONNX único frente a `.nemo`).

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, en su mayoría hombres adultos jóvenes, grabaciones en interiores silenciosos, habla leída y descrita por imágenes, no conversacional. El rendimiento en niños, otras discapacidades del habla, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Transcripciones literales: las repeticiones por tartamudeo se escriben explícitamente en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Las frases leídas son más fáciles: las oraciones de los prompts de texto también aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imágenes son la mejor guía para habla abierta.
- Prohibido para decisiones sobre personas: no debe usarse para diagnosticar o evaluar condiciones del habla, identificar hablantes ni en decisiones clínicas, legales o de aplicación de la ley. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de que una transcripción errónea cambie el significado de lo dicho: la model card recomienda mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero los términos del dataset CDLI (acceso restringido) añaden restricciones sobre reidentificación y clonación de voz que deben respetarse.
- El modelo base está entrenado solo en inglés; no cubre otros idiomas ni cambio de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft-onnx
- Modelo base (NeMo): https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft
- Dataset CDLI (acceso restringido): https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- NVIDIA FastConformer-CTC Large (en): https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Export ONNX de referencia de la comunidad: https://huggingface.co/branchkit/nemo-ctc-en-fastconformer-large-onnx
- Documentación de NVIDIA NeMo: no disponible en la información proporcionada
- Repositorio del proyecto con `src/export_nemo_onnx.py`: no disponible en la información proporcionada

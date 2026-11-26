# finisher-editor/finisher-wav2vec2-base-960h-onnx

## Resumen

`finisher-wav2vec2-base-960h-onnx` es una exportación a ONNX en fp32 del modelo `facebook/wav2vec2-base-960h` de Facebook AI Research (FAIR), publicada por el usuario `finisher-editor`. No es un modelo nuevo: los pesos son idénticos al checkpoint original, y la única modificación es la conversión del formato safetensors a un grafo ONNX (TorchScript, opset 17) para su uso con ONNX Runtime. Su función es producir probabilidades CTC a nivel de carácter con una resolución temporal de 20 ms, que el plugin `@finisher/speech` del proyecto Finisher utiliza para alinear palabras sobre audio.

El modelo subyacente es un transformer convolucional de tipo wav2vec2 con 95 millones de parámetros, preentrenado de forma auto-supervisada y afinado con CTC sobre 960 horas de LibriSpeech (inglés, CC BY 4.0). Su relevancia es acotada: sirve como componente de reconocimiento y alineamiento de voz en inglés dentro de un pipeline mayor, no como modelo de propósito general. La licencia Apache-2.0 del upstream se mantiene, y el autor documenta con detalle la procedencia, los hashes SHA-256 de cada fichero y la verificación numérica de la conversión.

La ficha se limita a lo que la model card y los metadatos del repositorio permiten afirmar; cualquier dato no documentado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder de atención, cabeza CTC) |
| Parametros totales | 95 millones (aprox., derivado del checkpoint base-960h) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada en muestras, no documentada en la card) |
| Tipos de cuantizacion | fp32 (única variante publicada); el resto no disponible |
| Idiomas soportados | inglés (LibriSpeech); no se documentan otros |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, opset 17, TorchScript); configuración y vocabulario en JSON |
| Tamano del repositorio | 0,4 GB (377.800.117 bytes en el conjunto de ficheros del modelo) |
| Resolución temporal de salida | 20 ms (probabilidades CTC por carácter) |
| Librería | onnx / onnxruntime |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2-base: un extractor de características convolucional que procesa la forma de onda cruda, seguido de un encoder transformer con atención multi-cabeza y una cabeza lineal de clasificación CTC sobre un vocabulario de caracteres. La salida son logits por frame (paso de 20 ms), que se decodifican con CTC para obtener la transcripción. El modelo no incorpora mecanismos de decodificación especulativa ni atención lineal; es la arquitectura estándar de wav2vec2.

El entrenamiento corresponde íntegramente al upstream: preentrenamiento auto-supervisado y ajuste fino con CTC sobre 960 horas de LibriSpeech (CC BY 4.0). El autor declara explícitamente que ningún dato de Finisher participó en el entrenamiento. La conversión se realizó con `torch.onnx.export` (TorchScript, fp32, opset 17) usando torch 2.13.0+cpu, onnx 1.23.2 y onnxruntime 1.31.1, y se verificó ejecutando el grafo frente al módulo PyTorch con una entrada sembrada: la diferencia absoluta máxima en `logits` fue de 3,72e-05 frente a un límite de 0,001. El repositorio incluye `conversion.json` con el registro completo (ficheros de origen, herramientas, ajustes de exportación, entradas y salidas del grafo).

## Capacidades

- Reconocimiento de voz en inglés mediante decodificación CTC a nivel de carácter.
- Alineamiento temporal de palabras: la salida a 20 ms permite localizar límites de palabra en el audio, que es el uso previsto por el plugin `@finisher/speech`.
- Extracción de probabilidades por frame (`logits`) para post-procesado propio (decodificación con LM externo, alineamiento forzado, etc.).
- Inferencia portable vía ONNX Runtime en CPU o GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio generativo ni modo de pensamiento.
- Capacidades multilingües: no documentadas; el upstream está entrenado en inglés.

## Casos de uso

- Alineamiento de subtítulos: dado un audio y su transcripción, usar las probabilidades CTC por frame para asignar marcas de tiempo a cada palabra y generar subtítulos sincronizados.
- Reconocimiento de voz en inglés en pipelines ligeros: transcribir audio de 16 kHz con decodificación CTC en entornos donde no se quiere depender de PyTorch, solo de ONNX Runtime.
- Preprocesado para sistemas de voz mayores: producir posteriores por carácter que alimenten un decodificador con modelo de lenguaje o un módulo de diarización.
- Búsqueda por palabra clave en audio: alinear transcripciones y localizar la posición temporal de términos concretos para indexación o recorte automático.
- Verificación de calidad de transcripciones: comparar la transcripción de referencia con la salida CTC para detectar segmentos mal transcritos o desalineados.
- Despliegue en entornos con restricciones de dependencias: al ser un único grafo ONNX fp32, se integra en servicios con ONNX Runtime sin necesidad del stack completo de transformers.
- Prototipado de correctores fonéticos: usar los logits por frame para estudiar confusiones de caracteres y calibrar umbrales de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la verificación de equivalencia numérica de la conversión (maxAbsDiff de 3,72e-05 en `logits`, límite 0,001), no métricas de WER ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4-1 GB en fp32 (pesos de 377 MB más activaciones y buffers de audio); no hay cifra oficial publicada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo es pequeño y no requiere A100 ni H100. Una RTX 4090 o una T4 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) y también en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es la vía documentada; llama.cpp, Ollama, vLLM y TGI no aplican a este formato ni a esta tarea.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finisher-wav2vec2-base-960h-onnx | ~95 M | audio, salida a 20 ms | ONNX fp32 | Apache-2.0 | Hugging Face |
| facebook/wav2vec2-base-960h (upstream) | ~95 M | audio, salida a 20 ms | safetensors | Apache-2.0 | Hugging Face |
| whisper-small | ~244 M | audio, ventanas de 30 s | safetensors / GGUF | MIT (upstream OpenAI) | Hugging Face |
| wav2vec2-large-960h | ~317 M | audio, salida a 20 ms | safetensors | Apache-2.0 | Hugging Face |

La comparación con whisper-small y wav2vec2-large-960h se ofrece como referencia de categoría (ASR en inglés); no se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Es una exportación, no un modelo nuevo: cualquier limitación del upstream (`facebook/wav2vec2-base-960h`) se hereda íntegramente.
- Entrenado solo con LibriSpeech (inglés, dominio de lectura); el rendimiento en acentos no nativos, ruido de fondo o audio telefónico puede degradarse notablemente.
- Riesgo de alucinación en el sentido de transcripciones incorrectas o palabras inventadas por la decodificación CTC, especialmente en segmentos ruidosos o con solapamiento de hablantes.
- No hay sesgos documentados en la card; al derivar de LibriSpeech, puede reflejar los sesgos de dominio y de los hablantes de ese corpus.
- Uso comercial permitido por Apache-2.0, con la obligación de mantener el aviso de licencia y la atribución a FAIR; el autor documenta los cambios (§4(b)).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- La card no documenta la ventana de entrada exacta en muestras ni el sample rate esperado más allá de lo que fija `preprocessor_config.json`; conviene verificar ese fichero antes de integrarlo.
- El modelo no está pensado para generación de texto, agentes ni tareas multimodales; usarlo fuera del ASR/alineamiento no es adecuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/finisher-editor/finisher-wav2vec2-base-960h-onnx
- Modelo upstream: https://huggingface.co/facebook/wav2vec2-base-960h
- Commit upstream referenciado: `22aad52d435eb6dbaf354bdad9b0da84ce7d6156`
- Paper de wav2vec2 (FAIR): no disponible en la información proporcionada
- Repositorio del proyecto Finisher: no disponible como URL en la información proporcionada (se menciona el commit `8794f0c16dfc39d406d523a2aaca2243e28867da`)
- Resultados de búsqueda web sobre "Finisher": no relevantes para este modelo (corresponden a plataformas de running y fotografía deportiva, sin relación con el proyecto de IA)

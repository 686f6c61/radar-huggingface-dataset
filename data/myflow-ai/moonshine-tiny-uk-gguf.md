# myflow-ai/moonshine-tiny-uk-gguf

## Resumen

moonshine-tiny-uk-gguf es una conversión al formato GGUF del modelo de reconocimiento automático de voz (ASR) UsefulSensors/moonshine-tiny-uk, publicada por el usuario myflow-ai y pensada para ejecutarse con la librería transcribe.cpp. Se trata de una adaptación del modelo Moonshine tiny de Moonshine AI (anteriormente Useful Sensors) afinada específicamente para ucraniano, con arquitectura encoder-decoder de tipo transformer y 27.092.736 parámetros totales. El modelo consume PCM crudo a 16 kHz y genera únicamente transcripción, sin traducción, sin detección de idioma y sin marcas de tiempo.

Su relevancia práctica radica en que empaqueta un modelo ASR monolingüe en ficheros de entre 34 MB y 105 MB, lo que permite ejecutarlo en hardware muy modesto, incluidos dispositivos de borde y equipos sin GPU dedicada. Las conversiones incluyen cuantizaciones F32, F16 y Q8_0, con una degradación de WER mínima respecto a la referencia en Transformers (18,83 % en F32 frente a 18,86 % de la referencia en MPS sobre FLEURS-uk).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB, por lo que se trata de una publicación reciente y sin tracción comunitaria. La licencia MIT, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine), con stem de convolución Conv1d de tres capas sobre PCM crudo a 16 kHz (sin STFT ni banco de filtros mel) |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; la decodificación por defecto usa greedy, num_beams=1, max_length=192 tokens de salida |
| Tipos de cuantizacion | F32 (105 MB), F16 (57 MB), Q8_0 (34 MB) |
| Idiomas soportados | Ucraniano (uk) únicamente. Sin traducción y sin detección de idioma |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Modelo base | UsefulSensors/moonshine-tiny-uk (etiquetado también como moonshine-ai/moonshine-tiny-uk en los tags; relación: quantized) |
| Pipeline | automatic-speech-recognition |
| Libreria | transcribe.cpp |
| Entrada de audio | PCM mono a 16 kHz |
| Streaming | No |
| Timestamps | No |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny: un transformer encoder-decoder que recibe directamente PCM crudo a 16 kHz a través de un stem convolucional de tres capas Conv1d, prescindiendo por completo de la transformada de Fourier de corto plazo (STFT) y del banco de filtros mel que emplean aproximaciones clásicas como Whisper. Esta decisión reduce el preprocesado y el coste computacional asociado, algo especialmente relevante en modelos pequeños. La salida es únicamente texto transcrito: no hay traducción, ni detección de idioma, ni marcas de tiempo.

Según la model card, los detalles de entrenamiento y evaluación se encuentran en el paper de Moonshine (arXiv:2509.02523), y la ficha sigue el formato de Model Cards for Model Reporting (arXiv:1810.03993). Useful Sensors no publica un WER por idioma para esta variante concreta, por lo que no se dispone de información sobre el volumen de tokens de audio, la composición del dataset de afinamiento ni el uso de RLHF o DPO en esta conversión. La conversión a GGUF se realizó a partir del commit upstream 8cf70f4 (fijado el 2026-05-12) y se validó contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp el 2026-05-12.

## Capacidades

- Transcripción de voz a texto en ucraniano (uk) a partir de audio PCM mono de 16 kHz.
- Procesamiento de audio sin extracción de características mel: el propio modelo consume la forma de onda mediante su stem Conv1d.
- Decodificación greedy con num_beams=1 y max_length=192 tokens, en línea con el generation_config original.
- Ejecución en CPU y en GPU mediante transcribe.cpp (backend Metal en Apple Silicon, Vulkan en GPU integradas AMD, y CPU).
- Capacidades deliberadamente ausentes: no soporta streaming, no traduce, no realiza detección de idioma y no emite marcas de tiempo.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades multimodales de otro tipo: es un modelo estrictamente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en ucraniano: con ficheros de 34 MB (Q8_0), el modelo puede ejecutarse localmente sobre audio convertido previamente a WAV mono 16 kHz, sin enviar datos a servicios externos.
- Subtitulado offline de contenidos en ucraniano: dado que no genera timestamps, se usaría para producir la pista de texto completa y los tiempos se alinearían con una herramienta externa de alineación forzada.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: gracias a los ratios de tiempo real reportados (RTF 45,5 en CPU de Ryzen 4750U y 153,5 en CPU de M4 Max), es viable transcribir lotes completos en CPU.
- Aplicaciones de borde y dispositivos embebidos: el peso de 34 MB en Q8_0 permite integrar el modelo en dispositivos con almacenamiento y memoria muy limitados.
- Preprocesado de corpus para entrenamiento de otros modelos en ucraniano: transcripción masiva de archivos de audio para generar texto etiquetado.
- Accesibilidad para personas con discapacidad auditiva en entornos de habla ucraniana: transcripción en tiempo diferido de conversaciones grabadas, con la salvedad de que no hay modo streaming.
- Integración en pipelines de documentación o archivo: indexación y búsqueda de texto sobre archivos de audio históricos en ucraniano.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Referencia Transformers F32 (MPS) |
|---|---:|---:|---:|---:|
| WER en FLEURS-uk test (750 enunciados) | 18,83 % | 18,82 % | 18,89 % | 18,86 % |

| Metrica de velocidad (RTF) | Backend | Valor |
|---|---|---:|
| RTF en M4 Max | Metal | 127 |
| RTF en M4 Max | CPU | 153,5 |
| RTF en Ryzen 4750U | Vulkan | 56 |
| RTF en Ryzen 4750U | CPU | 45,5 |

Notas sobre la medición: el WER se calculó con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). Según la model card, los valores en C++ para F32 y F16 coinciden con la referencia dentro del ruido del intervalo de confianza por bootstrap, y Q8_0 introduce una deriva adicional respecto a F16 típicamente dentro de 0,1 puntos porcentuales. UsefulSensors no publica un WER por idioma para esta variante. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo ocupa 105 MB en F32, 57 MB en F16 y 34 MB en Q8_0. En la práctica cabe en cualquier GPU con al menos 1 GB de memoria disponible, incluyendo gráficas integradas.
- GPU recomendadas: no se requieren GPU de gama alta. Los datos publicados cubren Apple Silicon M4 Max (backend Metal) y GPU integrada AMD Ryzen 4750U (backend Vulkan). Cualquier GPU compatible con Metal o Vulkan sirve.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en gráficas integradas y en CPU sin aceleración.
- Opciones de despliegue: transcribe.cpp, compilado desde fuente (cmake -B build && cmake --build build), con el binario transcribe-cli. La model card solo documenta transcribe.cpp para esta conversión GGUF; para el modelo original en Transformers se usa MoonshineForConditionalGeneration de la librería transformers.
- Latencia y throughput estimados: los RTF reportados indican factores de tiempo real de 127 (Metal), 153,5 (CPU M4 Max), 56 (Vulkan Ryzen 4750U) y 45,5 (CPU Ryzen 4750U). A modo de referencia orientativa, un RTF de 45,5 implicaría procesar una hora de audio en aproximadamente 79 segundos; conviene tratar estos valores como orientativos, ya que la model card no especifica la unidad exacta del RTF.
- Requisito de entrada: el audio debe ser WAV mono a 16 kHz. Para otras fuentes hay que convertir previamente, por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | WER FLEURS-uk | Disponibilidad |
|---|---|---|---|---|---|---|
| myflow-ai/moonshine-tiny-uk-gguf | 27,09 M | Uk (solo) | GGUF (transcribe.cpp) | MIT | 18,83 % (F32) | HuggingFace |
| UsefulSensors/moonshine-tiny-uk | No disponible | Uk (solo) | safetensors (Transformers) | MIT | No disponible (referencia medida por el conversor: 18,86 % en MPS) | HuggingFace |
| moonshine-tiny (original de Moonshine AI) | No disponible | Ingles, entre otros segun variante | safetensors | MIT | No disponible | HuggingFace |
| Whisper tiny (OpenAI) | Aproximadamente 39 M | Multilingue | safetensors, GGUF, ONNX | MIT | No disponible en la informacion proporcionada | HuggingFace |

La comparación se limita a lo verificable en la información disponible. No se dispone de cifras de WER comparables para el Moonshine tiny original ni para Whisper tiny en FLEURS-uk dentro de los datos proporcionados, por lo que no se incluyen.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe ucraniano. No detecta idioma ni traduce; alimentarlo con audio en otro idioma producirá salidas incorrectas o alucinaciones.
- Sin marcas de tiempo ni streaming: no sirve para subtitulado sincronizado ni para transcripción en vivo sin herramientas adicionales de alineación.
- Riesgo de alucinación: la propia model card advierte de la existencia de bucles de alucinación y recomienda limitar la longitud máxima de generación en función de la duración esperada del audio (token_limit_factor = 8 / sampling_rate).
- WER relativamente alto: 18,83 % en FLEURS-uk implica aproximadamente uno de cada cinco caracteres o palabras mal transcritos en ese conjunto de evaluación; conviene revisar el resultado en aplicaciones sensibles.
- Sin datos publicados sobre composición del dataset de entrenamiento, sesgos demográficos o acústicos del modelo base.
- Dependencia de la librería: la conversión está pensada para transcribe.cpp, no para Transformers; usar los ficheros GGUF con otros runtimes (llama.cpp, Ollama, vLLM, TGI) no está documentado ni garantizado.
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado en octubre de 2026, sin evidencia de uso en producción.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero al derivar del modelo base hereda sus términos, por lo que conviene consultar la model card de UsefulSensors/moonshine-tiny-uk.
- El modelo consume 16 kHz mono; cualquier otra frecuencia o número de canales exige conversión previa, y un remuestreo incorrecto degradará la calidad de la transcripción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/myflow-ai/moonshine-tiny-uk-gguf
- Modelo base en HuggingFace: https://huggingface.co/UsefulSensors/moonshine-tiny-uk
- Commit del modelo base usado: https://huggingface.co/UsefulSensors/moonshine-tiny-uk/commit/8cf70f4
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Repositorio de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Model Cards for Model Reporting (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Model card de Whisper (OpenAI), referencia de riesgos citada por Moonshine: https://github.com/openai/whisper/blob/main/model-card.md
- Conversiones GGUF alojadas por handy-computer (enlaces de descarga citados en la model card): https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf
- Dataset de ejemplos multilingües: https://huggingface.co/datasets/UsefulSensors/multilingual_examples

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con este modelo (tratan sobre la familia Gemini de Google y sobre astrología), por lo que no se ha extraído de ellos ningún dato utilizable para esta ficha.

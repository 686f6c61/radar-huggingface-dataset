# GhaythMahadin/moonshine-base-ar-gguf

## Resumen

moonshine-base-ar-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-base-ar, publicada por el usuario GhaythMahadin para su uso con la librería transcribe.cpp. El modelo original es un ajuste fino sobre la arquitectura Moonshine base de Useful Sensors, un transformer encoder-decoder de 61,5 millones de parámetros diseñado específicamente para transcripción de voz en árabe. Esta conversión permite ejecutar el modelo de forma local y eficiente en C++ sin depender de PyTorch ni de la pila de Transformers.

La relevancia de esta ficha radica en que ofrece una vía de despliegue ligera (entre 74 y 236 MB según cuantización) para un modelo ASR de una sola lengua, con requisitos de hardware mínimos y capacidad de ejecución en CPU y GPU de consumo. La arquitectura Moonshine sustituye el preprocesamiento clásico basado en STFT y banco de filtros mel por un stem convolucional de tres capas Conv1d que consume PCM crudo a 16 kHz, lo que reduce la latencia de preprocesamiento y simplifica el pipeline.

El modelo está pensado exclusivamente para transcripción en árabe: no soporta detección de idioma, traducción ni marcas de tiempo. Su licencia MIT facilita la integración en productos comerciales, aunque su calidad (WER del 24,45 % en FLEURS ar) lo sitúa en un rango de uso práctico limitado a escenarios donde se tolere cierto nivel de error o se combine con corrección posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine base), con stem Conv1d de tres capas sobre PCM crudo a 16 kHz |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine base: un transformer encoder-decoder de 62M de parámetros que procesa audio a 16 kHz directamente como PCM crudo mediante un stem de tres capas Conv1d, prescindiendo de STFT y de banco de filtros mel. La salida es únicamente texto transcrito, sin etiquetas de tiempo ni funcionalidad de traducción. El modelo base fue desarrollado por Useful Sensors y posteriormente ajustado para árabe, dando lugar a UsefulSensors/moonshine-base-ar, del que esta conversión GGUF deriva mediante cuantización.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el ajuste fino. La model card original de UsefulSensors está auto-generada y no incluye estos detalles. La conversión GGUF fue realizada por GhaythMahadin a partir del commit 264cc18 del modelo base (fijado el 2026-05-12) y validada contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp. La decodificación por defecto es greedy con num_beams=1 y max_length=192, coincidiendo con la generation_config original.

## Capacidades

- Transcripción de voz a texto en árabe a partir de audio PCM de 16 kHz mono.
- Procesamiento de audio sin preprocesamiento STFT ni banco de filtros mel (stem Conv1d directo sobre la forma de onda).
- Ejecución en CPU y GPU mediante transcribe.cpp, con soporte para backend Metal y Vulkan.
- Cuantizaciones F32, F16 y Q8_0 con degradación mínima de calidad (variación de WER inferior a 0,1 puntos porcentuales entre F16 y Q8_0).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta detección de idioma, traducción ni marcas de tiempo.
- No soporta streaming (streaming: false).
- Modelo monolingüe: únicamente árabe.

## Casos de uso

- Transcripción de reuniones y notas de voz en árabe: el modelo convierte grabaciones de 16 kHz mono en texto plano, adecuado para actas internas o resúmenes posteriores donde se tolere un WER en torno al 24 %.
- Subtitulado offline de contenido audiovisual en árabe: al no generar marcas de tiempo, se usaría para obtener el texto y un alineador externo añadiría la sincronización; su reducido tamaño (74 MB en Q8_0) permite procesar lotes grandes en CPU.
- Asistentes de voz embebidos en dispositivos de bajo consumo: la arquitectura sin STFT y el formato GGUF permiten ejecución en CPU de portátiles (Ryzen 4750U con Vulkan a RTF 34,5) o en Apple Silicon con Metal (RTF 79,5 en M4 Max).
- Indexación y búsqueda de archivos de audio en árabe: transcripción masiva de un repositorio de grabaciones para construir un índice de texto searchable, aprovechando el bajo coste de inferencia del modelo cuantizado.
- Preprocesamiento para pipelines de NLP en árabe: la transcripción sirve como entrada a modelos de análisis de sentimiento, resumen o clasificación, donde el ruido del ASR se compensa con etapas posteriores de corrección.
- Prototipado rápido de aplicaciones de voz en árabe: la licencia MIT y la disponibilidad de binarios ligeros permiten integrar el modelo en pruebas de concepto sin coste de licencia ni infraestructura GPU dedicada.
- Transcripción en entornos sin conectividad: al ejecutarse localmente con transcribe.cpp, es apto para despliegues en campo o en dispositivos aislados donde no se puede enviar audio a servicios en la nube.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Referencia Transformers F32 |
|---|---|---|---|---|
| WER FLEURS ar (test, 428 utterances) | 24,45 % | 24,45 % | 24,50 % | 24,51 % |

| Plataforma | Backend | RTF (real-time factor) |
|---|---|---|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| AMD Ryzen 4750U | Vulkan | 34,5 |
| AMD Ryzen 4750U | CPU | 22 |

Los valores de WER se midieron con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). La referencia en Transformers se ejecutó en fp32 sobre MPS con MoonshineForConditionalGeneration. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; F32 requiere aproximadamente 236 MB de pesos, F16 unos 126 MB y Q8_0 unos 74 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no se requiere una GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada con al menos 1 GB de memoria disponible; también funciona en CPU pura.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), con binario transcribe-cli. No se mencionan otros runtimes compatibles (llama.cpp, Ollama, vLLM o TGI) en la información disponible.
- Latencia y throughput: RTF de 79,5 en Metal (M4 Max), 80,5 en CPU (M4 Max), 34,5 en Vulkan (Ryzen 4750U) y 22 en CPU (Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real; los valores indicados sugieren una velocidad muy superior al tiempo real en todas las plataformas medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS ar | Licencia | Formato |
|---|---|---|---|---|---|
| moonshine-base-ar-gguf (este) | 61,5 M | no disponible (max_length 192) | 24,45 % (F32/F16) | MIT | GGUF |
| Whisper base (multilingüe) | 74 M | 30 s de audio | no disponible en la información proporcionada | MIT | safetensors, GGUF |
| Whisper small (multilingüe) | 244 M | 30 s de audio | no disponible en la información proporcionada | MIT | safetensors, GGUF |
| Moonshine base (original, inglés) | 62 M | no disponible | no disponible en la información proporcionada | MIT | safetensors |

No se dispone de datos de WER comparativos para Whisper base o small en FLEURS ar en la información proporcionada, por lo que la comparación cuantitativa queda limitada al dato de este modelo. La comparación cualitativa se basa en el tamaño (Whisper small es aproximadamente cuatro veces mayor) y en la naturaleza monolingüe de este modelo frente a la naturaleza multilingüe de Whisper.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe árabe; no detecta idioma ni traduce.
- WER del 24,45 % en FLEURS ar, lo que implica un error considerable para producción sin corrección posterior o sin dominio acotado.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sincronizado.
- No soporta streaming; la transcripción es por lotes sobre archivos completos.
- Riesgo de alucinación inherente a los modelos encoder-decoder de ASR, especialmente en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes.
- Sesgos potenciales derivados de la distribución del dataset de entrenamiento, no documentada en la model card original (auto-generada y sin detalles).
- La licencia MIT permite uso comercial, pero el modelo base no documenta restricciones adicionales ni procedencia de los datos de entrenamiento.
- La model card del modelo base está auto-generada y carece de información sobre datos, sesgos y procedimiento de entrenamiento, lo que dificulta la evaluación de riesgos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria independiente.
- La conversión GGUF está validada contra una versión concreta de transcribe.cpp (commit 90bf720); cambios posteriores en la librería podrían afectar a la compatibilidad.
- El pipeline de audio requiere WAV mono a 16 kHz; es necesario convertir previamente con ffmpeg u otra herramienta.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/moonshine-base-ar-gguf
- Modelo base en Hugging Face: https://huggingface.co/UsefulSensors/moonshine-base-ar
- Commit del modelo base utilizado: https://huggingface.co/UsefulSensors/moonshine-base-ar/commit/264cc18
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Pesos F32: https://huggingface.co/handy-computer/moonshine-base-ar-gguf/resolve/main/moonshine-base-ar-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/moonshine-base-ar-gguf/resolve/main/moonshine-base-ar-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/moonshine-base-ar-gguf/resolve/main/moonshine-base-ar-Q8_0.gguf
- Paper de referencia citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700

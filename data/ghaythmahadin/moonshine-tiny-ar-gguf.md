# GhaythMahadin/moonshine-tiny-ar-gguf

## Resumen

moonshine-tiny-ar-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-ar, publicada por el usuario GhaythMahadin para su uso con la librería transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 27.092.736 parámetros, especializado exclusivamente en transcripción de audio en árabe, derivado de la familia Moonshine de Moonshine AI (anteriormente Useful Sensors) y descrito en el paper "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices".

El modelo resuelve el problema de la transcripción de voz a texto en árabe en dispositivos de recursos limitados: al no emplear STFT ni banco de filtros mel (consume PCM crudo a 16 kHz mediante un stem Conv1d de tres capas), reduce el coste computacional frente a arquitecturas tipo Whisper y permite su ejecución en CPU y GPU de gama baja, incluso en hardware móvil o de placa única. Su relevancia actual radica en que ofrece una alternativa MIT, ligera (34 MB en Q8_0) y multilingüe-específica para integrar ASR en aplicaciones de borde sin depender de servicios en la nube.

La ficha se centra en la variante GGUF, que incluye tres cuantizaciones (F32, F16 y Q8_0) validadas numéricamente contra la referencia de Transformers, con un WER de referencia del 27,11 % en FLEURS ar (test) para F32/F16 y del 26,79 % para Q8_0. Es un modelo de un solo idioma, sin traducción, sin detección de idioma y sin marcas de tiempo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine tiny), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz, sin STFT ni mel filterbank |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación = 192 tokens; ventana de audio no especificada en la informacion disponible) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Árabe (ar) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (F32, F16, Q8_0); pesos originales en safetensors en el modelo base |
| Libreria | transcribe.cpp |
| Tarea | automatic-speech-recognition (speech-to-text) |
| Entrada de audio | PCM crudo mono a 16 kHz |
| Salida | Solo transcripción (sin traducción, sin detección de idioma, sin timestamps) |
| Streaming | no soportado |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia Moonshine tiny, con 27 millones de parámetros. La innovación arquitectónica principal frente a Whisper es que prescinde del preprocesado clásico de audio: en lugar de calcular STFT y un banco de filtros mel, consume directamente PCM crudo a 16 kHz a través de un stem de tres capas Conv1d. Esto reduce el coste de preprocesado y hace el modelo más adecuado para dispositivos de borde. La generación es autorregresiva con decodificación greedy y `max_length=192` por defecto (coincidente con el `generation_config` original), un límite pensado para evitar bucles de alucinación.

El modelo base es UsefulSensors/moonshine-tiny-ar, un fine-tuning de moonshine-tiny sobre árabe. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La conversión GGUF se realizó desde el commit upstream 99e7fee (fijado el 2026-05-12) y se validó contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp el 2026-05-12.

## Capacidades

- Transcripción de voz a texto en árabe a partir de audio mono a 16 kHz.
- Consumo directo de PCM crudo sin preprocesado STFT/mel.
- Ejecución en CPU y GPU de gama baja gracias a su tamaño reducido (27 M de parámetros).
- Tres niveles de cuantización (F32, F16, Q8_0) con degradación mínima de precisión.
- No soporta traducción.
- No soporta detección de idioma.
- No soporta marcas de tiempo (timestamps).
- No soporta streaming (procesamiento por lotes de audio completo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles en árabe: el modelo puede ejecutarse localmente en el dispositivo con la cuantización Q8_0 (34 MB), sin enviar audio a la nube y preservando la privacidad del usuario.
- Subtitulado offline de reuniones y entrevistas en árabe: se procesan ficheros WAV de 16 kHz mono por lotes con transcribe.cpp, adecuado para pipelines de postproducción donde no se requiere streaming en tiempo real.
- Dictado por voz en herramientas de productividad para hablantes de árabe: integración en editores de texto o aplicaciones de escritorio mediante el binario `transcribe-cli` o la API de transcribe.cpp.
- Transcripción en dispositivos de borde (Raspberry Pi, placas ARM): el modelo cabe en memoria y se ejecuta en CPU con un RTF de 45,5 en un Ryzen 4750U (CPU) y 56 con Vulkan, lo que permite desplegarlo en hardware de bajo coste.
- Indexación y búsqueda de archivos de audio en árabe: transcripción por lotes de archivos históricos para generar texto indexable en sistemas de gestión documental.
- Asistentes de voz embebidos en árabe: al no requerir GPU dedicada, puede integrarse en dispositivos domésticos o industriales con recursos limitados, siempre que se acepte el procesamiento no streaming.
- Prototipado e investigación en ASR de bajo recurso: el modelo sirve como baseline ligero y reproducible (MIT) para experimentos con FLEURS ar y para comparar arquitecturas sin mel filterbank.

## Benchmarks y rendimiento

Resultados de WER en FLEURS ar (test, 428 utterances), decodificación greedy con `num_beams=1` y `max_length=192`:

| Modelo / variante | WER FLEURS ar |
|---|---|
| moonshine-tiny-ar F32 (transcribe.cpp) | 27,11 % |
| moonshine-tiny-ar F16 (transcribe.cpp) | 27,11 % |
| moonshine-tiny-ar Q8_0 (transcribe.cpp) | 26,79 % |
| Referencia Transformers F32 (MPS, fp32) | 27,13 % |

Rendimiento (RTF, menor es mejor):

| Hardware | Backend | RTF |
|---|---|---|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (F32 105 MB, F16 57 MB, Q8_0 34 MB en disco); la huella en memoria es muy reducida.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon (Metal), GPUs AMD con Vulkan y CPUs x86. Cualquier GPU con más de 1 GB de memoria es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) e incluso en dispositivos sin GPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`); el modelo base es compatible con Hugging Face Transformers (`MoonshineForConditionalGeneration`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 127 (Metal, M4 Max), 153,5 (CPU, M4 Max), 56 (Vulkan, Ryzen 4750U) y 45,5 (CPU, Ryzen 4750U). Valores de RTF superiores a 1 indican procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Formato | WER FLEURS ar |
|---|---|---|---|---|---|---|
| moonshine-tiny-ar-gguf | 27,1 M | ar | no disponible | MIT | GGUF | 26,79–27,11 % |
| Whisper tiny | 39 M | multilingüe (99 idiomas) | 30 s | MIT | safetensors, GGUF | no disponible en la información |
| Whisper base | 74 M | multilingüe (99 idiomas) | 30 s | MIT | safetensors, GGUF | no disponible en la información |
| moonshine-tiny (original, inglés) | 27 M | en | no disponible | MIT | safetensors | no disponible en la información |

La comparación con Whisper tiny/base es pertinente por tamaño y propósito (ASR ligero), pero no se dispone de WER comparable en FLEURS ar para esas variantes en la información proporcionada. La ventaja diferencial de moonshine-tiny-ar es su menor coste de preprocesado (sin STFT/mel) y su especialización en árabe; su desventaja es que no es multilingüe ni soporta timestamps.

## Limitaciones y advertencias

- Modelo de un solo idioma: solo transcribe árabe; no detecta idioma ni traduce.
- WER elevado (en torno al 27 % en FLEURS ar), adecuado para dictado informal o indexación, pero no para transcripción de precisión legal o médica sin revisión humana.
- Sin marcas de tiempo: no apto para subtitulado sincronizado que requiera alineación temporal.
- Sin streaming: requiere el audio completo antes de transcribir; no sirve para aplicaciones de tiempo real estricto.
- Riesgo de alucinación y bucles de repetición en audio ruidoso o silencioso; el límite `max_length=192` mitiga pero no elimina este problema.
- Sesgos: no se documentan análisis de sesgo por dialecto, género o acento en la información disponible; el rendimiento puede variar entre variedades del árabe.
- Restricciones de licencia: MIT permite uso comercial, pero se hereda del modelo base y conviene revisar la model card upstream para términos completos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-25; es una conversión reciente sin validación comunitaria amplia.
- La conversión GGUF está vinculada a commits concretos de transcribe.cpp (90bf720) y del modelo base (99e7fee); cambios posteriores en la librería pueden afectar la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-tiny-ar-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ar
- Commit upstream fijado: https://huggingface.co/UsefulSensors/moonshine-tiny-ar/commit/99e7fee
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper "Flavors of Moonshine: Tiny Specialized ASR Models for Edge Devices": https://huggingface.co/papers/2509.02523
- Repositorio oficial de Moonshine: https://github.com/moonshine-ai/moonshine
- Paper "Model Cards for Model Reporting": https://arxiv.org/abs/1810.03993
- Model card de Whisper (referencia de riesgos): https://github.com/openai/whisper/blob/main/model-card.md

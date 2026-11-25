# GhaythMahadin/moonshine-tiny-vi-gguf

## Resumen

moonshine-tiny-vi-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-vi, publicada por el usuario GhaythMahadin. El modelo subyacente es un ajuste fino de Moonshine Tiny (27.092.736 parámetros) sobre vietnamita, desarrollado por Moonshine AI (anteriormente Useful Sensors). La conversión está pensada para ejecutarse con la librería transcribe.cpp, una implementación en C++ orientada a inferencia local eficiente.

La relevancia de esta ficha es doble: por un lado, documenta una variante lingüística concreta (vietnamita) de una familia de modelos ASR diseñada explícitamente para ser ligera y ejecutable en dispositivos de borde; por otro, ilustra el ecosistema de conversiones GGUF que permite llevar modelos de Transformers a entornos sin Python ni GPU dedicada. El modelo consume PCM crudo a 16 kHz y emite únicamente transcripción, sin traducción, detección de idioma ni marcas de tiempo.

La arquitectura es un transformer encoder-decoder con un stem convolucional de tres capas Conv1d que sustituye al clásico preprocesado STFT/mel. El repositorio ocupa 0,2 GB y ofrece tres cuantizaciones (F32, F16, Q8_0) con un WER de referencia del 13,16 % sobre el split de test de FLEURS-vi. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (sin STFT ni banco de filtros mel) |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de generación 192 tokens; entrada de audio limitada por la arquitectura, no se especifica ventana explícita) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | GGUF (también existen pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine Tiny: un encoder-decoder transformer de 27 millones de parámetros que procesa audio PCM crudo a 16 kHz mediante un stem de tres capas Conv1d. Esta decisión elimina el preprocesado clásico basado en STFT y banco de filtros mel, lo que reduce la latencia de preprocesado y el coste computacional en dispositivos de borde. La salida es únicamente texto transcrito, sin etiquetas de idioma ni marcas temporales.

El modelo base fue entrenado y publicado por Moonshine AI (antes Useful Sensors); esta variante concreta es un ajuste fino sobre vietnamita. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se realizó a partir del commit d4d20da del modelo base (fijado el 2026-05-12) y se validó contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp el mismo día. La decodificación por defecto es greedy con num_beams=1 y max_length=192, coincidiendo con la generation_config original.

## Capacidades

- Transcripción de voz a texto en vietnamita a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado STFT ni banco de filtros mel, gracias al stem Conv1d.
- Ejecución en CPU y en GPU mediante backends Metal (Apple) y Vulkan, según los datos de transcribe.cpp.
- Inferencia local sin dependencias de Python en tiempo de ejecución (librería C++ transcribe.cpp).
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR puro).

## Casos de uso

- Transcripción de reuniones en vietnamita: el modelo convierte grabaciones de voz en texto plano para actas o resúmenes posteriores, con un WER de referencia del 13,16 % sobre FLEURS-vi que lo hace adecuado para borradores que luego se revisan.
- Subtitulado offline de contenido audiovisual: dado que no genera timestamps, se usaría para producir el texto completo y alinear después con herramientas externas de forced alignment; su tamaño de 34 MB en Q8_0 permite procesar horas de audio en un portátil.
- Asistentes de voz embebidos en dispositivos de borde: el modelo cabe en 34 MB (Q8_0) y se ejecuta con transcribe.cpp en CPU o Vulkan, lo que permite integrarlo en dispositivos con recursos limitados para comandos de voz en vietnamita.
- Dictado y accesibilidad: integración en aplicaciones de escritorio que transcriben dictado en vietnamita en tiempo casi real; el RTF de 45,5 en CPU Ryzen 4750U y 56 en Vulkan indica que el procesamiento es más rápido que el tiempo real.
- Pipeline de análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones telefónicas en vietnamita para extraer texto y alimentar sistemas de análisis de sentimiento o búsqueda; el formato GGUF y la licencia MIT facilitan el despliegue en producción.
- Investigación en ASR multilingüe de bajo coste: como variante ligera de Moonshine, sirve de baseline para comparar técnicas de adaptación lingüística en modelos de 27M de parámetros con WER medido sobre FLEURS-vi.
- Transcripción en entornos sin conectividad: al ejecutarse localmente con transcribe.cpp, es apto para escenarios de campo o dispositivos aislados donde no se puede enviar audio a un servicio en la nube.

## Benchmarks y rendimiento

Los datos de WER provienen de la model card del autor de la conversión y se midieron sobre el split de test de FLEURS-vi (857 utterances) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192).

| Cuantizacion | Tamano | WER FLEURS-vi |
|---|---:|---:|
| F32 | 105 MB | 13,16 % |
| F16 | 57 MB | 13,17 % |
| Q8_0 | 34 MB | 13,16 % |
| Referencia Transformers F32 (MPS) | no disponible | 13,18 % |

Datos de rendimiento (RTF, real-time factor) reportados en la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero más grande (F32) ocupa 105 MB y el más pequeño (Q8_0) 34 MB, por lo que la huella en memoria es mínima.
- GPU recomendadas: no se especifican modelos concretos; la model card reporta pruebas en Apple M4 Max (Metal) y AMD Ryzen 4750U (Vulkan). Cualquier GPU con soporte Metal o Vulkan es susceptible de usarse.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU, dado el tamaño del modelo.
- Opciones de despliegue: transcribe.cpp (librería principal, con CLI `transcribe-cli`); el modelo base es compatible con Transformers (`MoonshineForConditionalGeneration`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 127 (Metal en M4 Max), 153,5 (CPU en M4 Max), 56 (Vulkan en Ryzen 4750U) y 45,5 (CPU en Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS-vi | Licencia | Formato |
|---|---:|---|---:|---|---|
| moonshine-tiny-vi-gguf (este) | 27,1 M | no disponible | 13,16 % (Q8_0/F32) | MIT | GGUF |
| UsefulSensors/moonshine-tiny-vi (base) | 27,1 M | no disponible | no publicado por el autor (referencia Transformers F32: 13,18 %) | MIT | safetensors |
| Moonshine Tiny (original, inglés) | 27,1 M | no disponible | no disponible para vi | MIT | safetensors |
| Whisper Tiny | no disponible en la información | no disponible | no disponible para vi | MIT | safetensors, GGUF |

La comparación con Whisper Tiny se incluye por categoría (ASR ligero), pero no se dispone de cifras de WER en vietnamita ni de parámetros exactos en la información proporcionada. No se dispone de datos de otras alternativas ASR ligeras en vietnamita.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe vietnamita; no detecta idioma ni traduce.
- Sin marcas de tiempo: no genera timestamps, lo que limita su uso directo en subtitulado sincronizado sin post-procesado.
- Sin streaming: la inferencia es por fichero completo, no incremental.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible que no corresponde al audio, especialmente con ruido o audio fuera de dominio; la model card del modelo base advierte de este riesgo (heredado de la model card de Whisper).
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un ajuste fino sobre vietnamita, puede tener peor rendimiento en variedades dialectales o acentos no representados en el dataset de ajuste.
- WER de referencia del 13,16 % sobre FLEURS-vi: es un valor moderado que implica errores frecuentes en palabras; para producción conviene revisión humana o umbrales de confianza.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar los términos del modelo base y de los datos de entrenamiento originales.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de adopción ni de validación comunitaria más allá de la reportada por el autor.
- La validación se realizó contra una versión concreta de transcribe.cpp (commit 90bf720); cambios posteriores en la librería podrían afectar a la compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-tiny-vi-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-vi
- Commit del modelo base utilizado: https://huggingface.co/UsefulSensors/moonshine-tiny-vi/commit/d4d20da
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Paper de Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Repositorio Moonshine (Moonshine AI / Useful Sensors): https://github.com/usefulsensors/moonshine
- Descarga F32: https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-tiny-vi-gguf/resolve/main/moonshine-tiny-vi-Q8_0.gguf

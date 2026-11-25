# GhaythMahadin/whisper-tiny.en-gguf

## Resumen

`GhaythMahadin/whisper-tiny.en-gguf` es una conversión a formato GGUF del modelo `openai/whisper-tiny.en`, la variante más pequeña de la familia Whisper de OpenAI especializada en reconocimiento automático de habla (ASR) en inglés. La conversión está pensada para su uso con `transcribe.cpp`, una implementación en C++ de la pila de inferencia de Whisper que permite ejecutar el modelo en CPU, Metal o Vulkan sin depender de Python ni de PyTorch en tiempo de ejecución.

El modelo subyacente es un transformer encoder-decoder de 37.776.736 parámetros (~37,8 M), entrenado por OpenAI sobre 680.000 horas de audio etiquetado mediante supervisión débil. La variante `.en` está entrenada exclusivamente para transcripción en inglés, lo que la hace algo más precisa y rápida que su equivalente multilingüe del mismo tamaño. El repositorio incluye seis cuantizaciones (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamaños que van de 146 MB a 42 MB.

La relevancia de esta ficha es práctica: se trata de una opción de despliegue ultraligera para transcripción de audio en inglés en entornos con recursos muy limitados, con licencia Apache-2.0 y métricas de WER publicadas por el conversor sobre LibriSpeech test-clean. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y el modelo base es una variante tiny con calidad limitada en audio ruidoso o con acentos marcados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 37.776.736 (~37,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por trozos para audio largo (no es contexto de texto en tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) exclusivamente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Modelo base | openai/whisper-tiny.en (commit 87c7102, fijado el 2026-04-25) |
| Libreria de inferencia | transcribe.cpp (validado en commit 5.6.1) |
| Tamano del repo | 0,4 GB |
| Tarea | automatic-speech-recognition (ASR) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de tipo sequence-to-sequence. El encoder procesa espectrogramas log-Mel de audio en ventanas de 30 segundos y el decoder genera la transcripción de forma autorregresiva. La variante `.en` fue entrenada por OpenAI únicamente con datos en inglés y solo para la tarea de reconocimiento de habla (no traducción). El entrenamiento original se realizó sobre 680.000 horas de audio etiquetado con supervisión débil, según describe el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). La model card no detalla la composición exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al paper original, no se reproducen aquí.

La conversión a GGUF la realiza el autor `GhaythMahadin` a partir del commit `87c7102` del modelo original, validada contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp. La model card indica que el pipeline de decodificación por defecto de transcribe.cpp usa decodificación greedy, `suppress_tokens`, *temperature fallback* y timestamps a nivel de segmento activados. Las marcas `streaming: false`, `translate: false` y `lang_detect: false` indican que esta conversión concreta no soporta streaming, traducción ni detección de idioma. Los timestamps disponibles son de segmento, no de palabra.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio de 16 kHz mono en formato WAV.
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Generación de timestamps a nivel de segmento.
- Inferencia en CPU, Metal (Apple Silicon) y Vulkan, según los datos de rendimiento publicados.
- Ejecución sin dependencias de Python ni PyTorch en tiempo de ejecución, gracias a transcribe.cpp.
- No soporta streaming.
- No soporta traducción de voz a texto.
- No soporta detección automática de idioma.
- No soporta tool calling, function calling ni capacidades de agente.
- No tiene capacidades de visión, audio generativo ni razonamiento multi-paso.

## Casos de uso

- Transcripción de notas de voz en inglés en aplicaciones de escritorio: el modelo Q8_0 ocupa 44 MB y puede ejecutarse en CPU, lo que permite integrarlo en apps nativas sin GPU ni servidor Python.
- Subtitulado por segmentos de reuniones o entrevistas en inglés: los timestamps de segmento permiten generar subtítulos sincronizados de forma aproximada, adecuados para contenido donde no se requiere alineación a nivel de palabra.
- Preprocesado de audio en pipelines de datos: transcripción rápida de grandes volúmenes de audio en inglés en máquinas sin GPU, usando Vulkan o CPU, como paso previo a indexación o búsqueda.
- Prototipado y pruebas de integración de transcribe.cpp: al ser un modelo tiny con seis cuantizaciones y validación numérica documentada, sirve para verificar pipelines de inferencia antes de escalar a modelos Whisper mayores.
- Asistentes de voz locales en dispositivos embebidos o de gama baja: el tamaño de 42-44 MB en Q4_K_M/Q8_0 permite incluirlo en imágenes de sistema pequeñas con requisitos de memoria mínimos.
- Transcripción de comandos de voz en inglés en aplicaciones de automatización del hogar o kioscos: con latencia baja en Apple Silicon (RTF 279,8 en Metal) permite respuestas casi en tiempo real para clips cortos.
- Generación de borradores de transcripción para posterior revisión humana: el WER de ~5,7-6,0 % en LibriSpeech test-clean es aceptable para texto de apoyo, aunque requiere corrección en dominios ruidosos.

## Benchmarks y rendimiento

Datos publicados en la model card del conversor. WER medido sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 146 MB | 5,77 % |
| F16 | 76 MB | 5,77 % |
| Q8_0 | 44 MB | 5,72 % |
| Q6_K | 43 MB | 5,80 % |
| Q5_K_M | 42 MB | 5,89 % |
| Q4_K_M | 42 MB | 5,99 % |

Referencia: OpenAI reporta 5,66 % en el mismo split con su propia configuración de evaluación. El autor atribuye la diferencia probablemente a que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto, mientras que transcribe.cpp ejecuta con timestamps activados. Las cifras provienen de una única ejecución con backend Metal y pueden variar ~0,1 pp entre ejecuciones por reducciones paralelas no deterministas.

Rendimiento (RTF, *real-time factor*; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 279,8 |
| Apple M4 Max | CPU | 78,7 |
| Ryzen 4750U | Vulkan | 60,7 |
| Ryzen 4750U | CPU | 26,1 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 42 MB (Q4_K_M) y 146 MB (F32) para los pesos; el consumo total de memoria es muy bajo y cabe holgadamente en cualquier sistema.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU, Apple Silicon vía Metal y GPUs con soporte Vulkan.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU; también en dispositivos embebidos con memoria limitada.
- Opciones de despliegue: transcribe.cpp (librería nativa C++), compilado desde fuente con CMake. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 279,8 en Metal (M4 Max) y 60,7 en Vulkan (Ryzen 4750U), lo que implica procesar audio varias decenas de veces más rápido que tiempo real en esos entornos.
- Formato de entrada: WAV mono a 16 kHz; se recomienda convertir con ffmpeg (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato / despliegue |
|---|---:|---|---|---|---|
| whisper-tiny.en-gguf (este) | ~37,8 M | inglés | ventanas de 30 s | Apache-2.0 | GGUF / transcribe.cpp |
| openai/whisper-tiny (multilingue) | ~37,8 M | multilingue | ventanas de 30 s | Apache-2.0 | safetensors / transformers, whisper.cpp |
| openai/whisper-base.en | ~74 M | inglés | ventanas de 30 s | Apache-2.0 | safetensors / transformers, whisper.cpp |
| openai/whisper-small.en | ~244 M | inglés | ventanas de 30 s | Apache-2.0 | safetensors / transformers, whisper.cpp |

La comparativa se limita a la familia Whisper porque la información disponible no incluye datos de benchmarks de modelos ASR alternativos. La ventaja de esta conversión frente a las variantes en safetensors es el despliegue nativo sin Python; su desventaja es el ecosistema más reducido de transcribe.cpp frente a whisper.cpp o transformers.

## Limitaciones y advertencias

- Solo inglés: no transcribe ni traduce otros idiomas; la marca `lang_detect: false` confirma que no hay detección automática de idioma.
- Calidad limitada por el tamaño tiny: el WER de ~5,7-6,0 % en LibriSpeech test-clean se degrada previsiblemente en audio con ruido, acentos marcados, solapamiento de hablantes o dominios alejados del dataset de entrenamiento.
- Riesgo de alucinación: la model card menciona explícitamente "short-clip hallucination outcomes on the noise floor" como fuente de variación del WER, un comportamiento conocido en modelos Whisper con audio de baja calidad.
- Sin streaming: no apto para transcripción en tiempo real continua; requiere audio completo o troceado manual.
- Timestamps solo a nivel de segmento, no de palabra.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar la model card de `openai/whisper-tiny.en` para los términos completos.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento continuado.
- Dependencia de transcribe.cpp: el formato GGUF de este repositorio no es necesariamente compatible con llama.cpp u otras herramientas GGUF; está validado únicamente contra transcribe.cpp commit 5.6.1.
- Entrada restringida a WAV mono de 16 kHz; requiere preprocesado con ffmpeg para otros formatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/whisper-tiny.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Commit del modelo base usado: https://huggingface.co/openai/whisper-tiny.en/commit/87c7102
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- transcribe.cpp commit de validación 5.6.1: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página de modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-tiny.en.md
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper

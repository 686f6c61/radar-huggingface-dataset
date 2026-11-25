# GhaythMahadin/moonshine-base-ja-gguf

## Resumen

moonshine-base-ja-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-base-ja, publicada por el usuario GhaythMahadin para su uso con el motor transcribe.cpp. Se trata de una adaptación al japonés del modelo Moonshine base de Useful Sensors, una arquitectura encoder-decoder de tipo transformer con 61,5 millones de parámetros (62M según la model card original) entrenada específicamente para transcribir audio en japonés.

El modelo consume PCM crudo a 16 kHz directamente, sin aplicar STFT ni banco de filtros mel, gracias a un stem de tres capas Conv1d en el encoder. Genera únicamente la transcripción, sin capacidades de traducción, detección de idioma ni marcas temporales. Es un modelo monolingüe (japonés) y de propósito muy específico: transcripción de voz a texto en entornos con recursos limitados.

La relevancia de esta ficha radica en que el paquete GGUF permite ejecutar el modelo en C++ nativo mediante transcribe.cpp, con cuantizaciones que van desde F32 (236 MB) hasta Q8_0 (74 MB), lo que lo hace viable en hardware modesto, incluidos dispositivos de consumo y sistemas embebidos. La licencia MIT facilita su integración comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine base), stem Conv1d de 3 capas, sin STFT ni mel filterbank |
| Parametros totales | 61.513.920 (aprox. 62M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificacion: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | japones (ja) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Entrada de audio | PCM crudo a 16 kHz, mono |
| Salida | Solo transcripcion (sin timestamps, sin traduccion, sin deteccion de idioma) |
| Streaming | no soportado |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Moonshine base: un transformer encoder-decoder que procesa audio a 16 kHz mediante un stem convolucional de tres capas Conv1d, eliminando la necesidad de calcular espectrogramas STFT o bancos de filtros mel. Esta decisión reduce la latencia de preprocesado y simplifica el pipeline de inferencia, algo especialmente relevante en despliegues de borde. El modelo base Moonshine fue desarrollado por Useful Sensors y esta variante ha sido ajustada fina sobre datos en japonés por el mismo equipo, aunque la model card upstream no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados.

La conversión a GGUF realizada por GhaythMahadin parte del commit f9d4e6a del modelo upstream (fijado el 2026-05-12) y fue validada contra la referencia de transformers en el commit 90bf720 de transcribe.cpp el 2026-05-12. La decodificacion por defecto es greedy con num_beams=1 y max_length=192, coincidiendo con la generation_config original. No se documentan innovaciones adicionales como decodificacion especulativa o atención lineal en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto en japones a partir de audio PCM de 16 kHz mono.
- Procesamiento directo de forma de onda sin preprocesado espectral (sin STFT ni mel).
- Generacion de transcripcion unicamente; no produce traduccion, deteccion de idioma ni marcas temporales.
- No soporta streaming: procesa el audio completo de una vez.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking ni razonamiento multi-paso.
- Capacidad multilingue limitada al japones; no cubre otros idiomas.
- No incorpora vision ni audio mas alla de la transcripcion de voz.

## Casos de uso

- Subtitulado de contenido en japones: el modelo transcribe audio de 16 kHz mono a texto plano, apto para generar subtitulos en pipelines de postproduccion donde no se requieren marcas temporales finas.
- Transcripcion de reuniones y notas de voz en japones: con 62M de parametros y cuantizacion Q8_0 de 74 MB, puede ejecutarse en local sin conexion, preservando la privacidad de las conversaciones.
- Integracion en aplicaciones de escritorio o moviles en C++: gracias a transcribe.cpp y al formato GGUF, se puede enlazar en binarios nativos ligeros sin dependencias de Python.
- Procesamiento por lotes de archivos de audio en servidores modestos: el bajo consumo de recursos permite transcribir volumenes grandes de audio japones en CPU sin GPU dedicada.
- Sistemas embebidos y de borde: el tamano reducido (74-126 MB) y la licencia MIT lo hacen adecuado para dispositivos con memoria limitada que necesiten ASR en japones.
- Prototipado rapido de interfaces de voz en japones: util para validar flujos de dictado o comandos de voz antes de invertir en modelos ASR mayores.
- Investigacion en ASR de bajo coste: sirve como referencia reproducible para comparar cuantizaciones GGUF frente a la implementacion de transformers en FP32.

## Benchmarks y rendimiento

Resultados de CER (character error rate) sobre el split de test de FLEURS-ja (650 enunciados), con decodificacion greedy por defecto:

| Cuantizacion | Tamano | CER FLEURS-ja |
|---|---:|---:|
| F32 | 236 MB | 10,84% |
| F16 | 126 MB | 10,81% |
| Q8_0 | 74 MB | 10,53% |
| Referencia transformers F32 (MPS) | no disponible | 10,69% |

Rendimiento en tiempo real (RTF, menor es mejor) segun la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| Ryzen 4750U | Vulkan | 34,5 |
| Ryzen 4750U | CPU | 22 |

Las cifras de F32 y F16 en C++ coinciden con la referencia de transformers dentro del ruido del intervalo de confianza bootstrap; Q8_0 introduce una deriva adicional tipica inferior a 0,1 puntos porcentuales respecto a F16.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; Q8_0 requiere aproximadamente 74 MB de pesos, F16 unos 126 MB y F32 unos 236 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, se ha validado en Apple M4 Max con backend Metal y en Ryzen 4750U con Vulkan.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU; el cuello de botella es la CPU o la memoria, no la VRAM.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: RTF de 79,5 (Metal en M4 Max), 80,5 (CPU en M4 Max), 34,5 (Vulkan en Ryzen 4750U) y 22 (CPU en Ryzen 4750U). El audio debe convertirse previamente a 16 kHz mono WAV con ffmpeg si no lo esta.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto/entrada | Licencia | Formato | CER FLEURS-ja |
|---|---|---|---:|---|---|---:|
| moonshine-base-ja-gguf (este) | 62M | ja | PCM 16 kHz, max_length 192 | MIT | GGUF | 10,53-10,84% |
| UsefulSensors/moonshine-base-ja (original) | 62M | ja | PCM 16 kHz | MIT | safetensors | 10,69% (ref. transformers) |
| Moonshine base (ingles) | 62M | en | PCM 16 kHz | MIT | safetensors | no disponible |
| Whisper base | 74M | multilingue | mel spectrogram, 30 s | MIT | safetensors, GGUF | no disponible |

La comparativa con Whisper base es orientativa: comparte orden de magnitud en parametros y licencia permisiva, pero difiere en preprocesado (mel frente a Conv1d directo) y en cobertura multilingue. No se dispone de cifras de CER comparables para Whisper base en FLEURS-ja en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monolingue: solo transcribe japones; no traduce ni detecta el idioma de entrada.
- Sin marcas temporales: no apto para aplicaciones que requieran alineacion palabra a palabra o subtitulado sincronizado.
- Sin streaming: debe procesarse el audio completo, lo que limita su uso en dictado en tiempo real.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o vocabulario especializado; el CER de referencia en FLEURS-ja es de aproximadamente el 10,5-10,8%, no despreciable.
- La model card upstream no documenta sesgos conocidos ni composicion del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios especificos.
- La licencia MIT permite uso comercial, pero se recomienda revisar los terminos del modelo base upstream por si hubiera condiciones adicionales no reflejadas.
- La cuantizacion Q8_0 introduce una pequena deriva respecto a F16 (tipicamente inferior a 0,1 pp de CER); para maxima fidelidad, usar F32 o F16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad mas alla de la del autor.
- Requiere convertir el audio a 16 kHz mono WAV antes de la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-base-ja-gguf
- Modelo base upstream: https://huggingface.co/UsefulSensors/moonshine-base-ja
- Commit del modelo base utilizado: https://huggingface.co/UsefulSensors/moonshine-base-ja/commit/f9d4e6a
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentacion de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de referencia (arXiv:1910.09700): https://arxiv.org/abs/1910.09700

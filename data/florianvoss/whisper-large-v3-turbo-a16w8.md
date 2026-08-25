# florianvoss/whisper-large-v3-turbo-a16w8

## Resumen

Este repositorio contiene una versión cuantizada con esquema A16W8 (activaciones de 16 bits, pesos de 8 bits) y precompilada de OpenAI Whisper Large v3 Turbo, optimizada específicamente para la plataforma de inferencia en el borde SiMa.ai Modalix. El modelo original, desarrollado por OpenAI, mantiene el encoder de 32 capas de Large v3 pero reduce el decoder de 32 a 4 capas, lo que acelera la generación con una degradación mínima de precisión. El artefacto resultante está pensado para ejecutarse en dispositivos embebidos con el runtime Neat de SiMa.ai, no como un checkpoint estándar de Transformers.

El modelo base, Whisper Large v3 Turbo, es un Transformer encoder-decoder de 809 millones de parámetros capaz de transcribir audio en 100 idiomas y traducir voz a inglés. La versión aquí presentada no es un modelo reentrenado, sino una compilación cuantizada y optimizada para un hardware concreto. Su relevancia radica en que habilita ASR multilingüe de alta calidad en dispositivos de borde con recursos limitados, algo que con el modelo original requeriría infraestructura de servidor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder Transformer |
| Parametros totales | 809 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (448 posiciones de decoder) |
| Tipos de cuantizacion | A16W8 (activaciones de 16 bits, pesos de 8 bits) |
| Idiomas soportados | 100 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue) |
| Licencia | MIT |
| Formato de pesos | Artefactos compilados ELF para SiMa.ai Neat runtime (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base, Whisper Large v3 Turbo, es un Transformer encoder-decoder con 32 capas en el encoder y solo 4 capas en el decoder, frente a las 32 del decoder de la serie Large original. Esta poda del decoder, inspirada en Distil-Whisper, reduce el coste de decodificación y acelera la inferencia sin sacrificar apenas precisión. El modelo original fue entrenado por OpenAI con 4,5 millones de horas de audio débilmente supervisado en 100 idiomas, y la variante turbo es un finetune de la versión v3 podada. No se han publicado datos sobre el dataset exacto de fine-tuning.

Esta versión concreta no añade ninguna innovación arquitectónica al modelo base, sino que aplica una cuantización A16W8 y compila los grafos para el acelerador SiMa.ai Modalix mediante el runtime Neat 0.4.0. Los artefactos incluyen programas de acelerador (ELF files) y configuración de runtime, tokenizador y embeddings en el directorio devkit. El proceso de compilación está documentado en los scripts `compile.sh` y `gen_models--openai--whisper.py`, que permiten reproducir la compilación desde el modelo original de OpenAI.

## Capacidades

- Transcripción automática de voz en 100 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, árabe y muchos más.
- Traducción de voz a texto en inglés, aprovechando la capacidad de speech translation del modelo base.
- Procesamiento de ventanas de audio de hasta 30 segundos por pasada, con soporte de streaming mediante la API ASRModel de Neat.
- Inferencia en el borde con latencia reducida gracias a la cuantización A16W8 y a la compilación específica para el hardware Modalix.
- Integración con el ecosistema SiMa.ai Neat: uso directo en aplicaciones C++ con la API `ASRModel` o despliegue como servidor HTTP con `GenAIServer`.
- Capacidades multilingües amplias: 100 idiomas soportados, cubriendo la práctica totalidad de los idiomas más hablados del mundo.
- No soporta tool calling, funciones de agente ni capacidades multimodales más allá del audio.

## Casos de uso

- **Asistentes de voz en automoción**: el modelo puede transcribir comandos de voz y conversaciones en tiempo real dentro del vehículo, ejecutándose localmente en el SoC Modalix sin depender de la nube. Su ventana de 30 segundos permite capturar instrucciones completas.
- **Dispositivos IoT y hogar inteligente**: integrado en altavoces o sistemas de domótica, permite el reconocimiento de voz multilingüe con latencia local, mejorando la privacidad al no enviar audio a servidores externos.
- **Transcripción médica en el punto de atención**: en entornos sanitarios, el modelo puede transcribir la interacción médico-paciente directamente en el dispositivo, sin conexión a internet, manteniendo la confidencialidad de los datos clínicos.
- **Traducción de voz en tiempo real**: la capacidad de traducción a inglés permite su uso en sistemas de interpretación automática en hoteles, aeropuertos o servicios públicos, con el audio procesado en el borde.
- **Centros de llamadas y atención al cliente**: el despliegue en hardware Modalix permite transcribir y analizar conversaciones en tiempo real, incluso en entornos remotos con conectividad limitada.
- **Sistemas de accesibilidad**: personas con discapacidad auditiva pueden recibir subtítulos de conversaciones en tiempo real generados localmente en un dispositivo portátil, sin necesidad de conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio indica explicitamente que no se reportan resultados de precision o rendimiento especificos para este artefacto A16W8 compilado, y que los resultados del modelo original de OpenAI no deben tratarse como mediciones de esta compilacion.

## Requisitos de hardware

- **Dispositivo obligatorio**: SiMa.ai Modalix. Los artefactos compilados solo pueden ejecutarse en este hardware con el runtime Neat.
- **VRAM**: no aplica (es un dispositivo embebido con memoria unificada; no se especifica la memoria exacta).
- **GPU recomendadas**: ninguna. No es compatible con GPUs de proposito general.
- **Tamaño del artefacto**: 4.8 GB de repo, que incluye los programas del acelerador, el runtime config, tokenizador y embeddings.
- **Opciones de despliegue**: integracion directa en aplicaciones C++ con la API `ASRModel`, o servidor HTTP mediante `GenAIServer` de Neat.
- **Latencia y throughput**: no disponibles. No se publican mediciones especificas para esta compilacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| florianvoss/whisper-large-v3-turbo-a16w8 | 809 M | 30 s audio | A16W8 | MIT | Solo SiMa.ai Modalix |
| openai/whisper-large-v3-turbo | 809 M | 30 s audio | Original (FP32/FP16) | MIT | Cualquier GPU/CPU con Transformers |
| openai/whisper-large-v3 | 1550 M | 30 s audio | Original (FP32/FP16) | MIT | Cualquier GPU/CPU con Transformers |
| distil-whisper/distil-large-v3 | 756 M | 30 s audio | Original (FP32/FP16) | MIT | Cualquier GPU/CPU con Transformers |

La comparativa muestra que este modelo no compite directamente con los checkpoints estandar de Whisper, sino que es un artefacto especifico para un hardware embebido. El modelo base openai/whisper-large-v3-turbo ofrece el mismo rendimiento y es portable a cualquier entorno, mientras que esta version esta bloqueada al ecosistema SiMa.ai.

## Limitaciones y advertencias

- **Hardware propietario**: los artefactos solo funcionan en SiMa.ai Modalix. No pueden cargarse con `transformers.AutoModel` ni ejecutarse en GPUs de proposito general, CPUs o otros aceleradores.
- **Sin metricas de calidad**: no se han publicado resultados de precision ni latencia para esta compilacion A16W8. La cuantizacion puede introducir una degradacion de la calidad de transcripcion no cuantificada.
- **Ventana de audio fija**: el runtime procesa ventanas de audio de 30 segundos como maximo, lo que requiere segmentacion previa del audio largo.
- **Dependencia del runtime Neat**: requiere la version 0.4.0 o superior del runtime Neat de SiMa.ai, y el proceso de instalacion es especifico de esa plataforma.
- **Sin soporte de tool calling ni agentes**: el modelo es exclusivamente de transcripcion y traduccion de voz, sin capacidades de razonamiento general ni integracion con herramientas externas.
- **Licencia MIT**: permisiva para uso comercial, pero la restriccion de hardware limita el despliegue practico a los dispositivos de SiMa.ai.

## Enlaces

- [Repositorio HuggingFace: florianvoss/whisper-large-v3-turbo-a16w8](https://huggingface.co/florianvoss/whisper-large-v3-turbo-a16w8)
- [Modelo base: openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Repositorio GitHub de OpenAI Whisper](https://github.com/openai/whisper)
- [Discusion del release turbo en GitHub](https://github.com/openai/whisper/discussions/2363)
- [Whisper-Large-V3-Turbo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/whisper_large_v3_turbo)
- [Guia de inicio de SiMa.ai Neat](https://developer.sima.ai/software/getting-started/)
- [Documentacion de GenAI Model en SiMa.ai](https://developer.sima.ai/software/develop-apps/development-workflow/genai-model)
- [Tutorial de Serve GenAI Models en SiMa.ai](https://developer.sima.ai/software/tutorials/serve-genai-models)</think>## Resumen

Este repositorio contiene una versión cuantizada y precompilada del modelo Whisper Large v3 Turbo de OpenAI, optimizada específicamente para la plataforma de aceleración en el borde SiMa.ai Modalix. El autor, florianvoss, ha aplicado una cuantización A16W8 (activaciones de 16 bits, pesos de 8 bits) y ha compilado los grafos del modelo para el runtime Neat de SiMa.ai, de modo que los artefactos resultantes no son un checkpoint estándar de Transformers, sino programas de acelerador que se ejecutan exclusivamente en hardware Modalix.

El modelo base, Whisper Large v3 Turbo, es un Transformer encoder-decoder de 809 millones de parámetros con un encoder de 32 capas y un decoder podado a 4 capas, una arquitectura inspirada en Distil-Whisper que acelera la generación con una degradación mínima de precisión. Soporta transcripción multilingüe en 100 idiomas y traducción de voz a inglés, con una ventana de audio máxima de 30 segundos. Esta versión es relevante porque permite ejecutar ASR de alta calidad en dispositivos embebidos de borde, un caso de uso cada vez más demandado en automoción, IoT y sistemas de atención al cliente con requisitos estrictos de privacidad y baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder Transformer |
| Parametros totales | 809 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (448 posiciones de decoder) |
| Tipos de cuantizacion | A16W8 (activaciones de 16 bits, pesos de 8 bits) |
| Idiomas soportados | 100 (en, zh, ja, de, es, fr, ru, ko, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue) |
| Licencia | MIT |
| Formato de pesos | Artefactos compilados ELF para SiMa.ai Neat runtime (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es la del Whisper Large v3 Turbo original: un Transformer encoder-decoder con 32 capas de encoder y 4 capas de decoder, 128 mel bins y una ventana de audio de 30 segundos. La reducción del decoder de 32 a 4 capas, inspirada en Distil-Whisper, es la principal innovación del modelo base, ya que reduce drásticamente el coste de decodificación y mejora la latencia de transcripción con una pérdida mínima de calidad. El modelo original fue entrenado por OpenAI con 4,5 millones de horas de audio débilmente supervisado en 100 idiomas, y la variante turbo es un finetune de la versión v3 podada.

Esta compilación específica no introduce cambios en la arquitectura, sino que aplica una cuantización A16W8 y compila los grafos para el acelerador SiMa.ai Modalix. Los artefactos incluyen los programas compilados en `elf_files/` y la configuración de runtime, tokenizador y embeddings en `devkit/`. El proceso de compilación está documentado en los scripts `compile.sh` y `gen_models--openai--whisper.py`, que permiten reproducir la compilación desde el modelo original de OpenAI. No se aplicó RLHF ni DPO; la cuantización es el único procesamiento adicional sobre el checkpoint original.

## Capacidades

- Transcripción automática de voz en 100 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, árabe y muchos más.
- Traducción de voz a texto en inglés, aprovechando la capacidad de traducción del modelo base.
- Procesamiento de ventanas de audio de hasta 30 segundos por pasada, con soporte para audio de mayor duración mediante segmentación previa.
- Inferencia en el borde con latencia reducida, gracias a la cuantización A16W8 y a la compilación específica para el hardware Modalix.
- Integración nativa con el ecosistema SiMa.ai Neat: uso directo desde aplicaciones C++ con la API `ASRModel` o despliegue como servidor HTTP con `GenAIServer`.
- No soporta tool calling, function calling, agentes ni capacidades multimodales más allá del audio.

## Casos de uso

- **Asistentes de voz en automoción**: el modelo puede transcribir comandos de voz y conversaciones en tiempo real dentro del vehículo, ejecutándose localmente en el dispositivo Modalix sin depender de la nube. La ventana de 30 segundos permite capturar frases completas y la baja latencia es crítica para la interacción en conducción.
- **Dispositivos IoT y domótica**: integrado en altavoces inteligentes o sistemas de control del hogar, permite el reconocimiento de voz multilingüe con procesamiento local, mejorando la privacidad al no enviar audio a servidores externos.
- **Transcripción médica en el punto de atención**: el modelo puede transcribir la interacción entre médico y paciente directamente en el dispositivo, sin conexión a red, manteniendo la confidencialidad de los datos clínicos y cumpliendo requisitos de privacidad estrictos.
- **Traducción de voz en tiempo real**: la capacidad de traducción a inglés permite construir sistemas de interpretación automática para hoteles, aeropuertos o servicios públicos, con el audio procesado en el dispositivo.
- **Centros de atención al cliente**: el despliegue en Modalix permite transcribir y registrar conversaciones en voz real en entornos con conectividad limitada, facilitando el análisis de calidad sin exponer grabaciones sensibles.
- **Accesibilidad para personas con discapacidad auditiva**: un dispositivo portátil con este modelo puede generar subtítulos de conversaciones en tiempo real de forma local, sin necesidad de conexión a internet, lo que resulta útil en reuniones o espacios públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reportan resultados de precisión o rendimiento específicos para este artefacto A16W8 compilado, y que los resultados del modelo original de OpenAI no deben tratarse como mediciones de esta compilación. No se proporcionan cifras de WER, latencia ni throughput.

## Requisitos de hardware

- **Dispositivo obligatorio**: SiMa.ai Modalix. Los artefactos compilados solo pueden ejecutarse en este hardware con el runtime Neat instalado.
- **VRAM**: no aplica, es un dispositivo embebido con memoria unificada; no se especifica la capacidad exacta requerida.
- **GPU**: no compatible con GPUs de propósito general. No puede ejecutarse en NVIDIA, AMD ni Apple Silicon.
- **Runtime**: requiere SiMa.ai Neat Runtime version 0.4.0 o superior.
- **Opciones de despliegue**: integración directa en aplicaciones C++ con la API `ASRModel`, o servidor HTTP con `GenAIServer`.
- **Latencia y throughput**: no disponibles. No se publican mediciones específicas para esta compilación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| florianvoss/whisper-large-v3-turbo-a16w8 | 809 M | 30 s audio | A16W8 | MIT | Solo SiMa.ai Modalix |
| openai/whisper-large-v3-turbo | 809 M | 30 s audio | FP32/FP16 | MIT | Cualquier GPU/CPU con Transformers |
| openai/whisper-large-v3 | 1550 M | 30 s audio | FP32/FP16 | MIT | Cualquier GPU/CPU con Transformers |
| distil-whisper/distil-large-v3 | 756 M | 30 s audio | FP32/FP16 | MIT | Cualquier GPU/CPU con Transformers |

La comparativa muestra que este modelo no compite con los checkpoints estándar de Transformers, sino que es un artefacto específico para un hardware embebido. El modelo base de OpenAI ofrece el mismo rendimiento y es portable a cualquier dispositivo, mientras que esta versión está limitada al ecosistema SiMa.ai. La licencia MIT se mantiene en ambos casos.

## Limitaciones y advertencias

- **Hardware propietario**: los artefactos solo compilados para SiMa.ai Modalix. No pueden cargarse con `transformers.AutoModel` ni ejecutarse en GPUs, CPUs o cualquier otro hardware.
- **Sin métricas de evaluación**: no se han publicado resultados de precisión, WER ni latencia para esta compilación A16W8. La cuantización puede introducir una degradación no cuantificada respecto al modelo original.
- **Ventana de audio fija**: el runtime procesa ventanas de audio de 30 segundos como máximo, lo que requiere segmentación previa para audios largos.
- **Dependencia del runtime Neat**: requiere la versión 0.4.0 o superior del runtime Neat de SiMa.ai, y la instalación es específica de esa plataforma.
- **Sin capacidades de agente**: el modelo es exclusivamente de reconocimiento y traducción de voz; no soporta tool calling ni agentes.
- **Licencia MIT**: permisiva para uso comercial, pero la restricción de hardware limita el despliegue práctico a dispositivos de SiMa.ai.

## Enlaces

- [Repositorio HuggingFace: florianvoss/whisper-large-v3-turbo-a16w8](https://huggingface.co/florianvoss/whisper-large-v3-turbo-a16w8)
- [Modelo base: openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Repositorio GitHub de OpenAI Whisper](https://github.com/openai/whisper)
- [Discusión del release turbo en GitHub](https://github.com/openai/whisper/discussions/2363)
- [Whisper-Large-V3-Turbo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/whisper_large_v3_turbo)
- [Guía de inicio de SiMa.ai Neat](https://developer.sima.ai/software/getting-started/)
- [Documentación de GenAI Model en SiMa.ai](https://developer.sima.ai/software/develop-apps/development-workflow/genai-model)
- [Tutorial de Serve GenAI Models en SiMa.ai](https://developer.sima.ai/software/tutorials/serve-genai-models)

# litert-community/Qwen3-ASR-1.7B

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen (Alibaba) y distribuido en este repositorio por la comunidad litert-community en formato LiteRT-LM. Se trata de una conversión cuantizada del checkpoint original `Qwen/Qwen3-ASR-1.7B-hf` pensada para inferencia en dispositivo (on-device), con un único fichero `.litertlm` que acepta audio y devuelve texto. El modelo resuelve dos tareas simultáneas: identificación del idioma y transcripción, con soporte declarado para 30 idiomas y 22 dialectos chinos.

La arquitectura combina un codificador de audio de 24 capas que alimenta un modelo de lenguaje Qwen3 de 28 capas y 2,04 mil millones de parámetros. El modelo es relevante porque demuestra que un ASR de calidad competitiva puede ejecutarse en hardware de consumo (se muestran pruebas en un Galaxy S26) sin depender de servicios en la nube, con licencia Apache 2.0 que permite uso comercial.

Este repositorio concreto no es el modelo original, sino su empaquetado para el runtime LiteRT-LM de Google, con pesos del LM en int8 dinámico y el codificador de audio en fp16 con cómputo fp32. Existen dos variantes: una con ventana de audio de 30 segundos y otra de 15 segundos, ambas de aproximadamente 2,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de 24 capas + LM Qwen3 de 28 capas |
| Parametros totales | 2,04 B (1,7 B nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | KV cache de 1024 tokens; ventana de audio de 15 s o 30 s según fichero |
| Tipos de cuantizacion | LM int8 dinámico con tabla de embeddings int8; codificador de audio fp16 (cómputo fp32) |
| Idiomas soportados | 30 idiomas y 22 dialectos chinos (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); checkpoint original en safetensors |

## Arquitectura y entrenamiento

El modelo sigue un diseño encoder-decoder secuencial: un front-end log-mel (STFT, banco de filtros Slaney y normalización del extractor original), un codificador de audio de 24 capas y un proyector que entrega representaciones al LM Qwen3 de 28 capas. El LM genera la respuesta con el formato `language <nombre><asr_text><transcripción>`, lo que integra identificación de idioma y transcripción en una sola secuencia de salida. El codificador convierte cada ventana de audio en un número fijo de tokens (390 para la variante de 30 s, 195 para la de 15 s), de modo que el coste de codificación y prefill es constante independientemente de la duración del clip dentro de la ventana.

Según el repositorio oficial, la familia Qwen3-ASR se entrena con datos de habla a gran escala y aprovecha la capacidad de comprensión de audio del modelo base Qwen3-Omni. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La conversión a LiteRT-LM preserva los pesos originales y añade metadatos de plantilla de prompt, tokens de parada y parámetros de audio.

## Capacidades

- Reconocimiento automático del habla con salida de transcripción en texto.
- Identificación automática del idioma en la misma respuesta (`language <nombre>`).
- Soporte de idioma forzado mediante un ítem de texto `language <nombre><asr_text>` en el mismo mensaje, tras el cual el modelo emite solo la transcripción.
- Cobertura declarada de 30 idiomas y 22 dialectos chinos, incluyendo cantonés (yue).
- Procesamiento de audio PCM a 16 kHz fragmentado en tramas de 10 ms por el runtime.
- Manejo de clips de hasta 15 s en una ventana (fichero de 15 s) o hasta 30 s (fichero de 30 s); clips más largos que la ventana se procesan en varias ventanas.
- Ejecución on-device en CPU (y opcionalmente LM en GPU vía WebGPU/Metal) sin conexión a red.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en el dispositivo: el modelo procesa clips de hasta 15 o 30 segundos por ventana en CPU, lo que permite transcribir grabaciones sin enviar audio a la nube y sin coste de API.
- Subtitulado multilingüe en aplicaciones móviles: con 30 idiomas soportados y detección automática, se puede generar subtítulos para contenido en inglés, mandarín, japonés, español u otros sin seleccionar el idioma manualmente.
- Asistentes de voz offline: al ejecutarse en un Galaxy S26 con CPU y modo avión, encaja en aplicaciones de dictado o comandos por voz que deben funcionar sin conectividad.
- Investigación lingüística de campo: la cobertura de 22 dialectos chinos y de idiomas como yue, fil o mk permite recoger y transcribir muestras en entornos con recursos limitados.
- Preprocesado de audio en pipelines de datos: la salida estructurada `language <nombre><asr_text><transcripción>` facilita el filtrado y la indexación automática de transcripciones por idioma.
- Aplicaciones de accesibilidad: transcripción local de conversaciones para personas con discapacidad auditiva, con latencia controlada y sin dependencia de servicios externos.
- Prototipado en edge con LiteRT-LM: el formato `.litertlm` y las APIs Kotlin (`litertlm-android`) y Python permiten integrar ASR en apps Android y scripts de escritorio con un solo fichero.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre FLEURS test, 50 clips por idioma, decodificación greedy, comparando el modelo original en PyTorch fp32 con las conversiones LiteRT-LM:

| Ejecución | WER inglés | CER mandarín | CER japonés |
|---|---|---|---|
| Original PyTorch fp32 (plantilla de este fichero) | 4,35 % (50/1150) | 6,04 % (118/1954) | 5,24 % (141/2689) |
| Original PyTorch fp32 (chat template del checkpoint) | 4,35 % (50/1150) | 6,86 % (134/1954) | 5,50 % (148/2689) |
| Fichero 15 s, LiteRT-LM 0.18.0, CPU (Apple M4 Max) | 4,35 % (50/1150) | 6,19 % (121/1954) | 5,84 % (157/2689) |
| Fichero 15 s, LiteRT-LM 0.18.0, LM en GPU WebGPU/Metal | 4,44 % (51/1150) | 6,24 % (122/1954) | 5,21 % (140/2689) |

Con la chat template propia del checkpoint, el fichero LiteRT-LM obtuvo CER de 6,65 % en mandarín y 6,06 % en japonés. En la prueba con plantilla propia, 8 de 50 clips en mandarín se etiquetaron erróneamente como `English` (con transcripción en chino). En la prueba con la plantilla de este fichero, todos los clips de mandarín y japonés se etiquetaron correctamente; uno de inglés (dos en la ejecución con GPU) devolvió `language None`. El repositorio oficial de Qwen3-ASR indica que la versión de 1,7 B alcanza rendimiento state-of-the-art entre modelos ASR de código abierto, aunque no se aportan cifras adicionales en la información disponible.

## Requisitos de hardware

- Tamaño del fichero: 2,70 GB (variante 15 s) y 2,69 GB (variante 30 s); el repositorio completo ocupa 5,4 GB.
- Desglose: codificador de audio 637 MB, LM int8 con KV cache de 1024 tokens 1,74–1,75 GB, tabla de embeddings 313 MB, tokenizer 2,1 MB.
- VRAM/RAM estimada para inferencia: en torno a 3 GB o algo más durante la ejecución, dado el tamaño de los pesos y el estado del runtime.
- GPU recomendadas: no se especifican modelos concretos; se documenta ejecución en CPU de Apple M4 Max y en GPU vía WebGPU/Metal. Para servidores, se puede asumir una GPU con al menos 4 GB de memoria, aunque no hay datos oficiales.
- Cabe en GPU de consumo: sí, por tamaño (2,7 GB de pesos); se ha validado en un smartphone Galaxy S26 (SM-S942Q) con CPU de 4 hilos.
- Opciones de despliegue: runtime LiteRT-LM (Python y Kotlin `litertlm-android`), versiones 0.17.1 y 0.18.0 documentadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: no se publican cifras de throughput ni de latencia por segundo de audio en la información disponible; la model card muestra capturas con tiempos de transcripción en el dispositivo, pero sin valores numéricos en el texto extraído.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (este) | 2,04 B | Ventana de audio 15/30 s, KV 1024 | 30 idiomas + 22 dialectos | Apache 2.0 | `.litertlm` |
| Qwen3-ASR-0.6B | no disponible | no disponible | 52 idiomas y dialectos (familia) | no disponible | no disponible |
| Whisper large-v3 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con Qwen3-ASR-0.6B, el otro miembro de la familia, del que se indica que comparte el soporte de 52 idiomas y dialectos pero no se detallan parámetros, contexto ni licencia. No se dispone de datos de benchmarks frente a Whisper u otros ASR en la documentación consultada.

## Limitaciones y advertencias

- Un mensaje contiene un solo clip; el runtime rellena con ceros la ventana restante, por lo que clips más largos que 15 s o 30 s requieren varias ventanas y no se probaron clips de más de 30 s.
- El etiquetado de idioma puede fallar: se observó `language None` en clips de inglés y, con la chat template del checkpoint, clips de mandarín etiquetados como `English`.
- El modelo solo se evaluó en inglés, mandarín y japonés en la model card; el rendimiento en los otros 27 idiomas declarados no está verificado con métricas.
- La plantilla de prompt de este fichero difiere de la chat template del checkpoint original y produce resultados distintos; los mensajes de sistema son ignorados por la plantilla.
- Riesgo de alucinación en transcripciones no cuantificado en la información disponible; no se documentan sesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime LiteRT-LM.
- El formato `.litertlm` está ligado al runtime LiteRT-LM; no es directamente compatible con ecosistemas como transformers, vLLM o llama.cpp sin conversión.
- El repositorio está mantenido por la comunidad litert-community (3 likes, 1069 descargas), no por el equipo Qwen; la estabilidad y el soporte a largo plazo no están garantizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/litert-community/Qwen3-ASR-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM

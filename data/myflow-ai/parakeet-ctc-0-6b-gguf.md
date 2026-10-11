# myflow-ai/parakeet-ctc-0.6b-gguf

# Parakeet CTC 0.6B GGUF (transcribe.cpp): ficha tecnica

## Resumen

Parakeet CTC 0.6B GGUF es una conversion al formato GGUF del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-ctc-0.6b`, publicada por el usuario `myflow-ai` para su uso con la libreria `transcribe.cpp`. Se trata de un modelo de transcripcion de voz a texto en ingles, offline y no streaming, que emplea un encoder FastConformer-Large de aproximadamente 608 millones de parametros junto con una cabeza CTC lineal, el decoder mas simple y rapido de la familia Parakeet. El modelo original fue desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai.

La relevancia de esta publicacion radica en que empaqueta el modelo original en GGUF con varias cuantizaciones (desde F32 hasta Q4_K_M), lo que permite ejecutarlo en hardware de consumo e incluso en CPU, con un coste de precision minimo. Segun los datos de la model card, el WER en LibriSpeech test-clean se mantiene entre el 1,84 % (Q6_K) y el 1,90 % (Q4_K_M) frente al 1,87 % del baseline en F32, lo que indica que la cuantizacion apenas degrada la calidad.

La version GGUF esta pensada para su uso con `transcribe.cpp`, una implementacion en C++ que ofrece soporte para Metal, Vulkan y CPU. El modelo hereda la licencia CC-BY-4.0 del modelo base y solo soporta el idioma ingles, con salida en minusculas y sin puntuacion. No es un modelo de streaming y no realiza traduccion ni deteccion de idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Large (Conformer) con cabeza CTC lineal |
| Parametros totales | 608.848.897 (aprox. 0,6B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (modelo ASR offline; no usa ventana de contexto autoregresiva) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |
| Libreria de inferencia | transcribe.cpp (tambien disponible en NeMo y Transformers en su version original) |
| Timestamps | A nivel de token |
| Streaming | No |
| Traduccion | No |
| Deteccion de idioma | No |

## Arquitectura y entrenamiento

El modelo usa una arquitectura FastConformer, una variante eficiente del Conformer que combina capas de auto-atencion y convoluciones, disenada para reducir el coste computacional manteniendo la precision en ASR. Sobre el encoder se situa una cabeza CTC (Connectionist Temporal Classification) lineal que decodifica de forma voraz (greedy), sin modelo de lenguaje externo. El tokenizador es de tipo BPE (`EncDecCTCModelBPE`), lo que explica la salida en minusculas y sin puntuacion. La referencia arquitectonica del paper asociado es arXiv:2305.05084.

En cuanto al entrenamiento, la model card original indica que el modelo fue desarrollado conjuntamente por NVIDIA NeMo y Suno.ai, pero no se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de audio ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un modelo CTC de ASR). La conversion a GGUF fue portada desde el commit `ad09ba1` del modelo original (fijado el 2026-05-10) y validada contra la referencia de NeMo en el commit `42528dd` de `transcribe.cpp` el 2026-05-10.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) con decodificacion CTC voraz (greedy).
- Salida en minusculas, sin puntuacion ni mayusculas.
- Generacion de timestamps a nivel de token.
- Inferencia offline sobre audio completo (no streaming).
- Ejecucion en CPU, Metal (Apple) y Vulkan mediante `transcribe.cpp`.
- No soporta traduccion.
- No soporta deteccion de idioma (solo ingles).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento ni capacidades de vision o audio generativo.
- No soporta conversaciones multi-turno (no es un modelo de lenguaje).

## Casos de uso

- Transcripcion de reuniones y notas de voz: al procesar el audio completo de forma offline, el modelo puede transcribir grabaciones extensas en ingles con un WER bajo (1,84-1,90 % en LibriSpeech test-clean) directamente en portatiles o estaciones de trabajo sin GPU dedicada.
- Generacion de subtitulos con marcas temporales: los timestamps a nivel de token permiten alinear el texto transcrito con el audio para generar subtitulos SRT en pipelines de postproduccion, aunque la ausencia de puntuacion exige un posprocesado.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un archivo de podcasts o grabaciones para hacerlas buscables por texto, ejecutable en CPU gracias a factores de tiempo real de 10x en un Ryzen 4750U.
- Dictado local privado: integracion en aplicaciones de escritorio donde los datos no pueden salir del dispositivo, aprovechando las cuantizaciones Q4_K_M (469 MB) y Q5_K_M (533 MB) para minimizar huella en disco y RAM.
- Transcripcion en dispositivos con recursos limitados: la cuantizacion Q4_K_M permite ejecutar el modelo en CPU o en GPU integradas, con un incremento de WER de solo 0,03 puntos porcentuales frente a F32.
- Pipelines de accesibilidad: conversion automatica de contenido de audio en ingles a texto para sistemas de lectura o cumplimiento de requisitos de accesibilidad, sin dependencia de servicios en la nube.
- Analitica de llamadas de atencion al cliente: transcripcion por lotes de grabaciones en ingles para alimentar sistemas de analisis de texto, siempre que el audio este limpio y en formato 16 kHz mono.

## Benchmarks y rendimiento

WER medido sobre la particion completa LibriSpeech test-clean (2620 emisiones) con decodificacion CTC voraz y sin modelo de lenguaje externo. El baseline de referencia en F32 es 1,87 %, coincidente con el dato autodeclarado por NVIDIA para la misma particion.

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 2,44 GB | 1,87 % |
| F16 | 1,22 GB | 1,87 % |
| Q8_0 | 722 MB | 1,87 % |
| Q6_K | 594 MB | 1,84 % |
| Q5_K_M | 533 MB | 1,87 % |
| Q4_K_M | 469 MB | 1,90 % |

Factores de tiempo real (RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 218,5 |
| Apple M4 Max | CPU | 30,5 |
| Ryzen 4750U | Vulkan | 22,5 |
| Ryzen 4750U | CPU | 10 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, en otros conjuntos de test o comparativas con modelos externos) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): 2,44 GB en F32, 1,22 GB en F16, 722 MB en Q8_0, 594 MB en Q6_K, 533 MB en Q5_K_M y 469 MB en Q4_K_M. Hay que sumar el overhead de activaciones y buffers, que no se detalla en la informacion disponible.
- GPU recomendadas: no se especifica una lista concreta en la informacion disponible. Dado el tamano, cualquier GPU con 2-3 GB de memoria libre es suficiente para las cuantizaciones bajas.
- Cabe holgadamente en GPU de consumo: practicamente cualquier GPU moderna (por ejemplo, RTX serie 30/40) puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M con amplio margen de memoria.
- Opciones de despliegue: `transcribe.cpp` (CLI, con backends Metal, Vulkan y CPU). El modelo original tambien es ejecutable con NVIDIA NeMo y con la libreria Transformers de Hugging Face.
- Latencia y throughput estimados: RTF de 218,5 en Metal sobre M4 Max, 30,5 en CPU sobre M4 Max, 22,5 en Vulkan sobre Ryzen 4750U y 10 en CPU sobre Ryzen 4750U. Estos valores indican velocidades muy superiores al tiempo real en todas las plataformas medidas.
- Requisito de entrada de audio: WAV mono a 16 kHz (se puede convertir desde otros formatos con ffmpeg).

## Comparativa con modelos similares

La informacion proporcionada solo describe este modelo y su base `nvidia/parakeet-ctc-0.6b`. No se ofrecen datos de benchmarks ni especificaciones verificadas de alternativas, por lo que la comparativa se limita a caracteristicas generales y se marca como no verificada.

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-ctc-0.6b GGUF (este) | 0,6B | No streaming | Ingles | CC-BY-4.0 | GGUF |
| nvidia/parakeet-ctc-0.6b (base) | 0,6B | No streaming | Ingles | CC-BY-4.0 | NeMo / safetensors |
| Modelos ASR alternativos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos verificados de otros modelos comparables (por ejemplo, de la familia Whisper u otras variantes de Parakeet) que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Solo soporta ingles: cualquier audio en otro idioma no se transcribira correctamente.
- Salida sin puntuacion ni mayusculas (minusculas), lo que exige posprocesado para muchos casos de uso.
- No es un modelo de streaming: requiere el audio completo antes de transcribir.
- No traduce ni detecta el idioma automaticamente.
- Riesgo de alucinacion y errores de transcripcion, especialmente con audio ruidoso, acentos no estandar, solapamiento de voces o terminologia especifica. El WER reportado (1,84-1,90 %) corresponde a LibriSpeech test-clean, un conjunto de audio limpio y de dominio concreto, por lo que no es extrapolable a condiciones reales.
- La cuantizacion Q4_K_M eleva ligeramente el WER (1,90 % frente a 1,87 % en F32), aunque la diferencia es marginal.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero al entrenarse sobre un conjunto de datos no detallado, puede presentar peor rendimiento en determinados acentos, generos o edades.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial siempre que se atribuya la autoria; hereda los terminos del modelo base `nvidia/parakeet-ctc-0.6b`.
- Caveat de produccion: la model card advierte de que esta version esta pensada para `transcribe.cpp` y fue validada contra NeMo en commits concretos, por lo que cambios de version pueden afectar a la reproducibilidad.
- Los contadores de descargas y likes del repositorio son 0 en el momento de la consulta, lo que indica una adopcion todavia muy baja.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/myflow-ai/parakeet-ctc-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-ctc-0.6b/commit/ad09ba1
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ctc-0.6b.md
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Paper de referencia (FastConformer): arXiv:2305.05084
- Suno.ai: https://www.suno.ai/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.

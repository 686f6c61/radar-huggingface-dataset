# jsbeaudry/Fatiman-TTS-v2-onnx

## Resumen

Fatiman-TTS-v2-onnx es la exportación a ONNX del modelo Fatiman-TTS-v2, un ajuste fino de Pocket TTS (Kyutai) para criollo haitiano (ht) entrenado únicamente con voz humana. Lo publica el usuario jsbeaudry y su objetivo es llevar la síntesis de voz en criollo haitiano a dispositivos móviles y entornos sin conexión mediante ONNX Runtime, sin depender de servidores ni de APIs externas.

El paquete se compone de cuatro grafos ONNX independientes: un acondicionador de texto en INT8 (16 MB), un LM troncal de 24 capas con pesos de 4 bits y caché KV de solo anexado (190 MB), una cabeza flow en INT8 (10 MB) y el decodificador Mimi en INT8 (23 MB) que produce audio a 24 kHz. El repositorio completo ocupa 0,2 GB e incluye nueve voces predefinidas como embeddings en float32, publicadas con consentimiento firmado de sus hablantes.

Es relevante porque cubre un idioma con muy poca cobertura en TTS y porque mantiene la misma interfaz de ficheros que Fatiman-TTS-v1-onnx: una aplicación que carga la v1 puede migrar a la v2 cambiando el nombre del repositorio. La comprobación local del autor sitúa el CER medio en torno al 4,9 %, idéntico al de la exportación de v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en cuatro etapas: acondicionador de texto, LM troncal de 24 capas con KV cache de solo anexado, cabeza flow (un paso LSD) y decodificador Mimi (códec neuronal) |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la caché KV es de solo anexado y no se declara límite de contexto) |
| Tipos de cuantizacion | INT8 en text conditioner, flow head y decodificador Mimi; 4 bits MatMulNBits con bloque 32 en el LM troncal; float32 en el embedding BOS y en los embeddings de voz |
| Idiomas soportados | criollo haitiano (ht) únicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (grafos INT8 y Q4) más tensores .f32 y ficheros JSON de configuración; tokenizer Unigram en tokenizer.json |

| Parametro adicional | Valor |
|---|---|
| Pipeline | text-to-speech |
| Libreria | onnxruntime |
| Tamano del repositorio | 0,2 GB |
| Ficheros de modelo | text_conditioner_int8.onnx (16 MB), flow_lm_main_kv_q4.onnx (190 MB), flow_lm_flow_int8.onnx (10 MB), mimi_decoder_int8.onnx (23 MB) |
| Frecuencia de muestreo de salida | 24 kHz |
| Dimension del latente | 32 |
| Dimension oculta / embeddings | 1024 |
| Cabezas de atencion | 16 por capa, 64 dimensiones por cabeza (24 capas) |
| Voces incluidas | 9 embeddings de prompt en float32 con forma [1, frames, 1024] |
| Modelo base | jsbeaudry/Fatiman-TTS-v2 |

## Arquitectura y entrenamiento

La inferencia se descompone en cuatro grafos. El acondicionador de texto convierte identificadores de token (tokenizer Unigram del ajuste fino) en embeddings de 1024 dimensiones. El LM troncal, de 24 capas, recibe `sequence [1, S, 32]` (con NaN como marcador de BOS), `text_embeddings [1, X, 1024]` y las cachés `past_k_i`/`past_v_i [1, P, 16, 64]` de cada capa, y devuelve `conditioning [1, 1024]`, `eos_logit [1, 1]` y las nuevas claves y valores `new_k_i`/`new_v_i [1, S+X, 16, 64]`. La cabeza flow transforma el conditioning y ruido gaussiano N(0, 0,7) en un latente de 32 dimensiones con un único paso LSD (s=0, t=1). El decodificador Mimi convierte ese latente en audio a 24 kHz y mantiene estado de streaming, por lo que es reutilizable entre fragmentos.

El protocolo de uso es explícito: primero se ejecuta el LM una vez con `text_embeddings = [bos_before_voice, voice frames]` y caché vacía para construir el prefijo de la voz elegida; después, para cada fragmento de texto se reinicia la caché a ese prefijo y se ejecutan los embeddings de texto; por último, cada trama se genera realimentando el latente anterior (NaN en la primera trama) a través de la cabeza flow. La generación se detiene unas tramas después de que `eos_logit` supere -4.

El modelo es un ajuste fino de Pocket TTS (Kyutai) entrenado solo con voz humana, según la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Los scripts de exportación empleados son los de Fatiman-TTS-v1-onnx y todavía no existe una alternativa INT8 del LM para la v2. El decodificador Mimi es idéntico al de la v1.

## Capacidades

- Sintesis de voz a partir de texto en criollo haitiano, con salida de audio a 24 kHz generada por el decodificador Mimi.
- Nueve voces predefinidas incluidas como embeddings de prompt en float32, publicadas con consentimiento firmado de sus hablantes.
- Inferencia totalmente local y offline: los cuatro grafos se ejecutan con ONNX Runtime sin llamadas de red.
- Modularidad de memoria: los grafos se cargan y ejecutan por separado, lo que permite ajustar el consumo segun el dispositivo.
- Streaming: el decodificador Mimi conserva estado entre tramas y el LM reutiliza el prefijo de voz con caché KV de solo anexado.
- Control de fin de secuencia mediante `eos_logit` con umbral -4, lo que permite cortar la generacion de forma determinista.
- Normalizacion de texto requerida por el propio modelo: los numeros y simbolos deben deletrearse antes de sintetizar (por ejemplo, 17 se escribe "diset"), tal como se hizo en el entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo de texto a voz.
- No es multilingue: solo criollo haitiano.

## Casos de uso

- Accesibilidad en Android: un lector de pantalla que ejecute los cuatro grafos con ONNX Runtime Mobile y genere voz en criollo haitiano sin conexión, usando el embedding de voz como prefijo de la caché KV reutilizada entre frases.
- Radio comunitaria y boletines de noticias: conversion de textos redactados en kreyol a audio de 24 kHz para emisión o podcast, con una de las nueve voces como identidad sonora del medio.
- Asistentes de voz offline en zonas de baja conectividad: al ocupar 0,2 GB en total y ejecutarse en ONNX Runtime, el paquete cabe en el almacenamiento de un teléfono de gama media y no depende de red.
- Material educativo en criollo haitiano: sintetizar lecciones y ejercicios escolares con voces consistentes, manteniendo el prefijo de voz entre fragmentos para evitar cambios de timbre dentro de una misma lección.
- Avisos y mensajes dinamicos en telefonia (IVR): generar mensajes en el dispositivo a partir de plantillas de texto, con la cautela de deletrear cifras y simbolos antes de la sintesis.
- Cadena de traduccion mas sintesis: un sistema de traduccion automatica produce texto en ht y este modelo lo convierte en audio; es adecuado porque el pipeline ONNX puede ejecutarse junto a otros componentes en el mismo dispositivo.
- Doblaje por lotes en servidor: procesar guiones completos en un servidor con ONNX Runtime, aprovechando que el decodificador Mimi mantiene estado de streaming y permite concatenar tramas sin reiniciar el estado de audio.
- Audioguias y contenido cultural en kreyol: narracion de textos largos fragmentados en trozos, reiniciando la caché del LM al prefijo de voz en cada trozo segun el protocolo documentado.

## Benchmarks y rendimiento

El unico dato publicado es una comprobacion local del autor: la exportacion ONNX de la v2 frente a la de la v1, con 3 voces y 8 frases, arroja el mismo CER medio de aproximadamente 4,9 %.

| Metrica | Fatiman-TTS-v2-onnx | Fatiman-TTS-v1-onnx |
|---|---|---|
| CER medio (3 voces x 8 frases) | ~4,9 % | ~4,9 % |

No se han publicado resultados de benchmarks estandar (por ejemplo, MMLU, HumanEval o GSM8K) en la informacion disponible; ademas, no son aplicables a un modelo de sintesis de voz. Tampoco se publican MOS, latencia ni throughput.

## Requisitos de hardware

- Peso de los cuatro grafos ONNX: aproximadamente 239 MB (16 + 190 + 10 + 23 MB); el repositorio completo ocupa 0,2 GB incluyendo voces y tokenizer.
- VRAM/RAM estimada para inferencia: por debajo de 500 MB en la configuracion INT8/Q4, aunque el autor no publica una cifra oficial.
- Disenado para ejecucion en dispositivo con ONNX Runtime; no requiere GPU de datacenter (A100, H100) ni GPU de consumo para funcionar, y esta pensado para moviles.
- Cabe en cualquier GPU de consumo (RTX 4090 y similares) y tambien en CPU, que es el escenario objetivo declarado.
- Opciones de despliegue: ONNX Runtime (movil, escritorio o servidor). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles; el unico indicio es que el decodificador Mimi mantiene estado de streaming y que el LM reutiliza el prefijo de voz, lo que evita recalcularlo en cada fragmento de texto.
- No existe todavia una alternativa INT8 del LM troncal, por lo que el grafo de 190 MB en 4 bits es la unica opcion publicada para la v2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Fatiman-TTS-v2-onnx | no disponible | no disponible (KV de solo anexado) | ht | CC-BY-4.0 | ONNX (INT8 + Q4) | 9 voces, CER ~4,9 %, 0,2 GB |
| Fatiman-TTS-v2 (base) | no disponible | no disponible | ht | CC-BY-4.0 | PyTorch (no confirmado en la informacion) | Modelo del que se exporta esta version |
| Fatiman-TTS-v1-onnx | no disponible | no disponible | ht | CC-BY-4.0 (segun el modelo base de la v1) | ONNX (INT8 + Q4) | Misma interfaz de ficheros y mismo CER publicado (~4,9 %); Mimi identico |
| Pocket TTS (Kyutai) | no disponible | no disponible | no disponible | no disponible en la informacion | no disponible | Modelo base sobre el que se hace el ajuste fino |

No se dispone de datos de otros sistemas TTS en criollo haitiano en la informacion proporcionada, por lo que la comparativa se limita a las variantes de la propia familia Fatiman y al modelo base Pocket TTS.

## Limitaciones y advertencias

- Cobertura linguistica limitada a un unico idioma (criollo haitiano); no se debe usar con texto en castellano ni en otros idiomas.
- Requiere normalizacion previa del texto: numeros y simbolos deben deletrearse ("17" como "diset") porque asi se entreno; de lo contrario la pronunciacion se degrada.
- La calidad medida es un CER medio de ~4,9 % en una prueba interna de 3 voces y 8 frases; no hay evaluacion con MOS ni con un conjunto de test publico y reproducible.
- Riesgo de errores de pronunciacion, prosodia y omision de fragmentos en entradas fuera de distribucion (siglas, prestamos, puntuacion atipica), inherente a un modelo TTS pequeno.
- No hay informacion sobre la composicion del corpus de entrenamiento, el numero de horas ni los hablantes, por lo que no se puede evaluar el sesgo de acento, genero o edad.
- Uso etico de las voces: las nueve voces se publican con consentimiento firmado; imitar la voz de una persona sin permiso o con intencion de enganar esta prohibido por la propia model card.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; hay que conservar la atribucion al autor y al modelo base, y revisar las condiciones de Pocket TTS (Kyutai).
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no existe validacion externa de la exportacion.
- No hay alternativa INT8 del LM para la v2, lo que limita el ajuste fino de memoria frente a la v1.
- El limite de longitud de contexto no esta documentado: secuencias de texto muy largas deben trocearse y reiniciar la cache al prefijo de voz.
- Fechas del repositorio poco habituales (creado y actualizado el 2026-10-20); conviene verificar la vigencia de los ficheros antes de integrarlos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jsbeaudry/Fatiman-TTS-v2-onnx
- Modelo base: https://huggingface.co/jsbeaudry/Fatiman-TTS-v2
- Exportacion previa con la misma interfaz: https://huggingface.co/jsbeaudry/Fatiman-TTS-v1-onnx
- Scripts de exportacion del LM: https://huggingface.co/jsbeaudry/Fatiman-TTS-v1-onnx/tree/main/export
- Pocket TTS (Kyutai), modelo de partida: no se ha proporcionado el enlace en la informacion disponible

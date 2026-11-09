# fdemelo/pocket-tts-fastdec-18m

## Resumen

pocket-tts-fastdec-18m es un decodificador neuronal sustituto del decodificador Mimi del modelo Pocket-TTS de Kyutai, publicado por el usuario fdemelo. No es un modelo TTS completo: es una pieza de 2,05 millones de parametros (8,2 MB en fp32) que sustituye la etapa de decodificacion de latentes a audio de Pocket-TTS, manteniendo intactos el modelo de lenguaje de flujo, el tokenizador, las voces y el codificador Mimi originales. El objetivo declarado es permitir que Pocket-TTS funcione en tiempo real en CPUs muy pequenas, hasta una Raspberry Pi Zero W.

Tecnicamente, reemplaza el decodificador Mimi original (que incluia una proyeccion de cuantizador, un sobremuestreo x16 a 200 Hz, un transformer causal de 4 capas a 200 Hz y un decodificador SEANet de anchura base 24) por un nucleo convolucional causal de 5 capas residuales que opera a 12,5 Hz, una cabeza que predice 16 sub-tramas de 128 canales por trama latente y un SEANet causal podado en canales. La reduccion de coste computacional es notable: de 249-435 MMAC/s a 114 MMAC/s.

El interes actual del modelo es practico: demuestra que es posible destilar el decodificador de un TTS de alta calidad manteniendo una calidad perceptual cercana (UTMOS22 de 4,20 frente a 4,40 del original, con una caida media de ~0,3 UTMOS sobre seis voces) a cambio de un coste computacional mucho menor. La licencia CC-BY-4.0 y el formato de pesos safetensors facilitan su reutilizacion, aunque depende obligatoriamente de los pesos originales de Kyutai, que estan restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador convolucional causal (5 capas residuales) + cabeza de prediccion de sub-tramas + SEANet causal podado en canales |
| Parametros totales | 2,05 M (solo el decodificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (decodificacion por tramas latentes, estado de streaming explicito) |
| Tipos de cuantizacion | fp32 publicado; Q8_0 usado en las pruebas con motor loom/ggml |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (`decoder.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

El decodificador sustituye cuatro componentes del Mimi original. La proyeccion del cuantizador (32 a 128) se reemplaza por una capa `Linear(32 → 256)`. El sobremuestreo x16 a 200 Hz se sustituye por una cabeza que predice 16 sub-tramas de 128 canales por trama latente, mas una convolucion depthwise de suavizado. El transformer causal de 4 capas a 200 Hz (d=128, atencion sobre 50 pasos) se reemplaza por 5 capas residuales que operan directamente a 12,5 Hz, cada una con LayerNorm, convolucion depthwise causal (k=4), LayerNorm y MLP (256→512→256). Finalmente, el SEANet original (anchura base 24, canales 192/96/48/24, 249 MMAC/s en el modelo 2m y 435 en 7m/18m) se sustituye por un SEANet causal con canales 128/64/32/16 y ocultas 32/16/8, que consume 114 MMAC/s, manteniendo el mismo esquema de strides 6/5/4, convoluciones transpuestas y una unidad residual por etapa.

El entrenamiento es una destilacion en dos etapas desde el modelo original congelado. En la etapa 1 (20.000 pasos) se hace regresion de las caracteristicas a 200 Hz del transformer del decodificador profesor a partir de los latentes, con una perdida STFT a traves del SEANet profesor congelado. En la etapa 2 (120.000 pasos, LR coseno) se entrena conjuntamente el nucleo y el SEANet podado, inicializado mediante poda por energia de activacion de los canales del SEANet profesor. El modelo de lenguaje de flujo nunca se modifica. El decodificador es estrictamente causal y mantiene un estado de streaming explicito: la decodificacion por trozos produce el mismo audio que la decodificacion completa (diferencia maxima de 3e-6).

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a 24 kHz a partir de texto, integrada en el pipeline de Pocket-TTS.
- Decodificacion de latentes a audio en modo streaming por trozos, con estado causal explicito.
- Compatibilidad con las voces del catalogo de Pocket-TTS (por ejemplo, `alba`, `marius`, `javert`) y con clonacion de voz a partir de un fichero wav, ya que el codificador Mimi original se conserva.
- Funcionamiento en CPU en tiempo real en hardware muy limitado (Raspberry Pi Zero W).
- Compatible con los modelos ingleses `refl_2026-10` de 2m, 7m y 18m de Pocket-TTS, que comparten la normalizacion de latentes.
- No soporta tool calling, agentes, vision, audio de entrada mas alla de la clonacion ni razonamiento: es exclusivamente un decodificador de audio.

## Casos de uso

- Asistentes de voz embebidos en dispositivos de bajo consumo: el decodificador permite ejecutar Pocket-TTS en una Raspberry Pi Zero W, lo que habilita sintesis de voz local en dispositivos IoT sin conexion a la nube.
- Lectura de notificaciones y alertas en kioscos o paneles informativos: con el modelo de 2m y este decodificador se obtiene audio en 3,1-3,9 s para 4,8 s de audio en la Pi Zero W, suficiente para mensajes cortos.
- Sistemas de accesibilidad para personas con discapacidad visual: conversion de texto a voz en hardware barato y sin dependencia de servicios externos, con voces del catalogo o clonacion de una voz personal.
- Prototipado rapido de interfaces conversacionales: el paquete Python `pocket_tts_fastdec` permite integrar el decodificador en un pipeline existente de Pocket-TTS con dos lineas de codigo, sin reentrenar el modelo de lenguaje.
- Generacion de audiolibros o contenido narrado por lotes: la decodificacion por streaming y el bajo coste computacional permiten procesar grandes volumenes de texto en CPU sin GPU.
- Investigacion en destilacion de modelos de audio: el repositorio documenta el procedimiento completo (poda por energia de activacion, perdida STFT, entrenamiento en dos etapas) y sirve como referencia reproducible para comprimir decodificadores neuronales.
- Despliegue en entornos con restricciones de memoria: el decodificador ocupa 8,2 MB en fp32 y puede cuantizarse a Q8_0, lo que lo hace viable en dispositivos con menos de 100 MB de RAM disponible.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| UTMOS22 (12 frases Harvard, voz `alba`, fp32) | 4,20 (original: 4,40) |
| Caida media de UTMOS sobre 6 voces (72 utterances) | ~0,3 |
| Word error rate (Whisper base.en) | dentro del ruido respecto al original |
| Ruido de semilla | ±0,03 UTMOS |
| Coste computacional del SEANet | 114 MMAC/s (original: 249 MMAC/s en 2m, 435 en 7m/18m) |
| Latencia en Raspberry Pi Zero W (4,8 s de audio, Q8_0, motor loom/ggml) | 2m: 3,1 s (GPU VC4) / 3,9 s (CPU); 7m: 4,7 s / 5,8 s; 18m: 8,5-9 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un decodificador de audio; las metricas relevantes son las de calidad perceptual y latencia recogidas arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: el decodificador en fp32 ocupa 8,2 MB; en Q8_0 aproximadamente 2 MB. El modelo de lenguaje de Pocket-TTS asociado (2m, 7m o 18m) domina el consumo de memoria.
- GPU recomendadas: no requiere GPU; funciona en CPU. En la Raspberry Pi Zero W se aprovecha la GPU VC4 para el modelo de 2m (3,1 s frente a 3,9 s en CPU).
- Cabe en GPU consumer y en hardware embebido: si, tanto en cualquier GPU consumer como en una Raspberry Pi Zero W.
- Opciones de despliegue: PyTorch >= 2.5 con el paquete `pocket_tts_fastdec`, motor loom/ggml con pesos Q8_0, e integracion mediante `load_model("18m")` o `attach_fast_decoder(tts, decoder)` sobre un modelo Pocket-TTS ya cargado.
- Latencia y throughput: en la Pi Zero W, el modelo de 7m con este decodificador alcanza aproximadamente tiempo real (4,7-5,8 s para 4,8 s de audio); el de 2m es mas rapido que tiempo real; el de 18m es demasiado pesado para esa placa por el propio modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocket-tts-fastdec-18m | 2,05 M (solo decodificador) | no disponible | UTMOS22 4,20 | CC-BY-4.0 | Hugging Face, requiere pesos de Kyutai |
| Decodificador Mimi original (Pocket-TTS) | no disponible | no disponible | UTMOS22 4,40 | restringida (modelo base de Kyutai) | Hugging Face, acceso con aceptacion de terminos |
| Otros decodificadores TTS de bajo coste | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al decodificador original de Pocket-TTS, ya que no se han identificado en la informacion disponible alternativas publicas equivalentes de decodificacion destilada para este pipeline.

## Limitaciones y advertencias

- No es un modelo TTS autonomo: requiere los pesos originales de `kyutai/pocket-tts`, que estan restringidos y exigen aceptar sus terminos. La licencia CC-BY-4.0 solo cubre el decodificador publicado aqui.
- Solo soporta ingles; no se ha validado con otros idiomas ni con otros modelos de Pocket-TTS distintos de los `refl_2026-10` de 2m, 7m y 18m.
- La decodificacion es deliberadamente con perdida: algunas voces (por ejemplo, `marius`) pierden mas calidad que otras, con una caida media de ~0,3 UTMOS.
- El modelo de 18m no es viable en Raspberry Pi Zero W por el peso del modelo de lenguaje, aunque el decodificador si lo sea.
- Riesgo de artefactos y alucinaciones acusticas inherente a cualquier TTS; no se documentan sesgos especificos de genero, acento o etnia en la informacion disponible.
- Las cifras de latencia corresponden al motor loom/ggml con Q8_0 y no son extrapolables a PyTorch.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdemelo/pocket-tts-fastdec-18m
- Modelo base Pocket-TTS: https://huggingface.co/kyutai/pocket-tts
- Paper de referencia (arXiv:2509.06926): https://arxiv.org/abs/2509.06926

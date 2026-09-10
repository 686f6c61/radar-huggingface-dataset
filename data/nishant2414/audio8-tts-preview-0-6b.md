# Nishant2414/Audio8-TTS-Preview-0.6b

## Resumen

Audio8 TTS Preview 0.6B es un modelo de sintesis de voz (text-to-speech) multilingue con clonacion de voz zero-shot, publicado bajo el identificador Nishant2414/Audio8-TTS-Preview-0.6b en Hugging Face. El modelo card y los enlaces asociados apuntan al proyecto Audio8 (repositorio Audio8-AI/Audio8_TTS) y mencionan una version paralela alojada como Audio8/Audio8-TTS-Preview-0.6b, por lo que se trata de un checkpoint de tipo preview con cobertura de idiomas deliberadamente limitada en esta release.

La arquitectura es DualAR, inspirada en Fish Audio S2 Pro: un transformer autorregresivo "lento" (Slow AR) que predice un token semantico por cada frame de audio y un transformer autorregresivo "rapido" (Fast AR) que predice los codebooks del codec de ese frame condicionado por el estado oculto del Slow AR y los codebooks precedentes. El modelo principal tiene 601.159.424 parametros (sin contar el codec) y el repo incluye el checkpoint completo, un codec neuronal de audio a 44.1 kHz, tokenizer, processor y codigo remoto de Hugging Face. El contexto maximo es de 2.048 posiciones empaquetadas de texto y audio.

Su relevancia actual reside en que ofrece clonacion de voz zero-shot y generacion multilingue en un tamano compacto (0,6 B de parametros), con despliegue viable en GPU de consumo e incluso en CPU mediante una variante ONNX INT4 que ocupa del orden de 1 GiB tras la carga. Es un modelo de tipo preview, con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (dos transformers autorregresivos: Slow AR y Fast AR), inspirada en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (excluyendo el codec) |
| Parametros activos | No aplica (no es MoE; DualAR usa dos torres AR que se ejecutan por frame) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | bfloat16 y float32 en PyTorch; INT4 weight-only en la variante ONNX (activaciones, caches KV y codec en FP16). Otras no disponibles |
| Idiomas soportados | 11: cantonés (yue), chino (zh), neerlandés (nl), inglés (en), francés (fr), alemán (de), italiano (it), japonés (ja), coreano (ko), polaco (pl), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch/Transformers con codigo remoto); existe una variante ONNX INT4 en repo aparte |

Detalles adicionales de configuracion:

| Componente | Configuracion |
|---|---|
| Slow AR | 24 capas, ancho 896, 14 cabezas de atencion, 2 cabezas KV |
| Fast AR | 4 capas, ancho 896, 14 cabezas de atencion, 2 cabezas KV |
| Tokens acusticos | 10 codebooks, 4.096 entradas por codebook |
| Codec | 44,1 kHz, 2.048 muestras por frame (~21,5 frames/s) |
| Tamano del repo | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura DualAR descompone la generacion de audio en dos bucles autorregresivos acoplados. El Slow AR, un transformer de 24 capas y ancho 896 con atencion de 14 cabezas y 2 cabezas KV (lo que sugiere atencion agrupada, GQA), predice un token semantico por frame de audio. El Fast AR, mas pequeno (4 capas, mismo ancho y configuracion de atencion), genera los codebooks acusticos del frame condicionado por el estado oculto del Slow AR y por los codebooks ya emitidos. La representacion acustica usa 10 codebooks con 4.096 entradas cada uno, y el codec neuronal a 44,1 kHz funciona a 2.048 muestras por frame, lo que da una tasa de aproximadamente 21,5 frames por segundo. El codec incluido en el repositorio sirve tanto para codificar el audio de referencia como para decodificar la forma de onda, de modo que no se necesita un checkpoint de codec adicional.

No se han facilitado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otros ajustes por preferencias. La model card tampoco detalla el proceso de entrenamiento del codec ni del tokenizer. La unica referencia tecnica explicita es la inspiracion en Fish Audio S2 Pro.

## Capacidades

- Generacion de voz multilingue en 11 idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonacion de voz zero-shot a partir de un audio de referencia y su transcripcion exacta, sin necesidad de reentrenamiento.
- Generacion sin referencia de voz (omitiendo `reference_audio` y `reference_text`), valida para sintesis con voz por defecto.
- Codificacion y decodificacion de audio integradas mediante el codec neuronal incluido a 44,1 kHz.
- Salida de formas de onda decodificadas (`decode_audio` devuelve waveforms y longitudes), apta para escritura directa a WAV mediante `soundfile`.
- Decodificacion por muestreo configurable (temperatura, top-p, top-k y `max_new_tokens`).
- Streaming de PCM, servicio HTTP y registro de voces en la variante de despliegue ONNX segun la documentacion del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio de entrada mas alla de la referencia de clonacion, ni modo "thinking".

## Casos de uso

- Clonacion de voz para audiolibros: a partir de una muestra de referencia del narrador y su transcripcion, el modelo genera todos los capitulos con la misma identidad vocal, con salida a 44,1 kHz y decodificacion directa a WAV.
- Doblaje multilingue de contenido: al cubrir 11 idiomas con el mismo checkpoint, permite generar una misma locucion en español, inglés, francés o japonés manteniendo una voz de referencia coherente.
- Asistentes de voz embebidos o de escritorio: la variante ONNX INT4 cabe en torno a 1 GiB tras la carga y funciona sin CUDA, por lo que es adecuada para equipos sin GPU dedicada mediante ONNX Runtime.
- Generacion de locuciones para prototipos y demos de producto: la API de `transformers` con `trust_remote_code` permite integrar sintesis en scripts de Python en pocas lineas para producir muestras de voz bajo demanda.
- Accesibilidad y lectura en voz alta: sintesis de texto a voz multilingue para lectores de pantalla o conversion de articulos y documentacion a audio, con posibilidad de usar una voz personal clonada.
- Personalizacion de voces en plataformas de contenido: registro de voces de creadores para generar variaciones de un mismo guion sin regrabar, apoyandose en el flujo de registro de voces descrito para el despliegue ONNX.
- Servicio de TTS por HTTP: la documentacion menciona CLI, servicio HTTP y streaming de PCM, lo que permite exponer la sintesis como microservicio para otras aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de metricas objetivas (por ejemplo, similitud de hablante, WER del texto sintetizado o MOS), y los resultados de busqueda web obtenidos no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch: en bfloat16, los pesos del modelo principal suponen aproximadamente 1,2 GB (601 M de parametros), a lo que hay que sumar el codec, el cache KV y las activaciones; en la practica se puede esperar un uso de unos 2-3 GB de VRAM (estimacion, no confirmada por el autor).
- En float32, solo los pesos del modelo principal ocuparian del orden de 2,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. La model card recomienda una GPU compatible con CUDA y Python 3.10 o superior; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes, aunque el autor no especifica perfiles concretos.
- Si cabe en GPU de consumo: si, el modelo de 0,6 B esta pensado para ese rango. Ademas, la variante ONNX INT4 descrita funciona en CPU (probada en Apple M2 con aproximadamente 1 GiB de memoria tras la carga).
- Opciones de despliegue: PyTorch con `transformers` (>=4.57.0,<5) y `trust_remote_code=True`; ONNX Runtime con la variante INT4 para CPU; CLI, web y servicio HTTP, ademas de streaming PCM y registro de voces segun el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La model card no publica cifras de tiempo real (RTF) ni de rendimiento por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmark ni de especificaciones de terceros en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica referencia explicita del autor es Fish Audio S2 Pro, citada como inspiracion de la arquitectura DualAR.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| Audio8 TTS Preview 0.6B | 601 M (sin codec) | 2.048 posiciones | 11 | Apache 2.0 | no disponible |
| Fish Audio S2 Pro (referencia de arquitectura) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de TTS con clonacion zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado preview: el propio autor indica que la cobertura de idiomas esta limitada intencionadamente en esta release y que la cobertura multilingue ampliada y los dialectos chinos estan planificados para versiones futuras.
- Estado de publicacion: el repositorio figura con 0 descargas y 0 likes al consultarse, lo que sugiere que es un checkpoint recien creado y sin validacion externa.
- Discrepancia de identificador: la pagina de Hugging Face esta bajo Nishant2414/Audio8-TTS-Preview-0.6b, mientras que el codigo de ejemplo y los enlaces del proyecto usan Audio8/Audio8-TTS-Preview-0.6b. Conviene verificar cual es el checkpoint canonico antes de integrarlo.
- Requiere codigo remoto: el uso con `transformers` exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y anade un riesgo de seguridad y de compatibilidad de versiones.
- Dependencia de la transcripcion de referencia: para la clonacion la transcripcion debe coincidir exactamente con el contenido hablado del audio de referencia, segun advierte la propia model card.
- Riesgo de alucinacion y artefactos de sintesis: no se documentan tasas de error, alucinaciones de audio ni metricas de calidad, algo habitual en modelos de TTS y que debe validarse en produccion.
- Sesgos: no se documentan sesgos por idioma, acento o genero. La calidad puede variar de forma desigual entre los 11 idiomas al tratarse de un preview.
- Contexto acotado: el limite de 2.048 posiciones empaquetadas de texto y audio restringe la longitud de las locuciones y del material de referencia que se puede pasar en una sola generacion.
- Licencia: Apache 2.0 permite uso comercial, pero al reutilizar un codec neuronal y una arquitectura inspirada en Fish Audio S2 Pro conviene revisar las condiciones del proyecto que sirve de base.
- Sin benchmarks publicos: no hay evidencia objetiva de rendimiento frente a alternativas, por lo que cualquier decision de adopcion deberia apoyarse en evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nishant2414/Audio8-TTS-Preview-0.6b
- Repositorio GitHub del proyecto: https://github.com/Audio8-AI/Audio8_TTS
- Demo en vivo: https://audio8-ai.github.io/Audio8_TTS/
- Variante ONNX INT4: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Licencia del proyecto: https://github.com/Audio8-AI/Audio8_TTS/blob/main/LICENSE
- Guia de despliegue ONNX en CPU: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_
- Fish Audio S2 Pro (arquitectura de referencia): https://github.com/fishaudio/fish-speech

Nota sobre la busqueda web: los resultados obtenidos (formazionedocenti.it, Mnemosine) no guardan ninguna relacion con el modelo y se han descartado por no aportar informacion relevante.

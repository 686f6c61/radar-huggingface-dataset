# scragnog/YuE2-WannabeTokenizer-GGUF

## Resumen

YuE2-WannabeTokenizer-GGUF es la conversion al formato GGUF del tokenizador de audio WannabeTokenizer, desarrollado originalmente por ManyOtherFunctions para el ecosistema del modelo de generacion musical YuE2. No se trata de un modelo generativo de texto ni de un LLM: es un codificador de audio que transforma senal musical real en codigos semanticos discretos de YuE2 (25 codigos por segundo, con un vocabulario de 32.768 entradas). Estos codigos son precisamente la representacion que aprende a producir el modelo de lenguaje de YuE2, por lo que el tokenizador es la pieza necesaria para entrenar YuE2 sobre musica propia.

La arquitectura combina un encoder MERT2 afinado (frontend mel, subsampler ConvNext y 14 bloques Conformer causales) con una cabeza de cuantizacion vectorial coseno (adaptador SwiGLU, proyeccion de 256 dimensiones y codebook de 32.768 entradas). El conjunto suma 424.492.032 parametros y se distribuye en dos ficheros GGUF de 871 MB cada uno, correspondientes a las versiones v1 y v2 del checkpoint original.

La relevancia actual es acotada pero clara: esta conversion permite ejecutar el tokenizador dentro de HOT-Step, una aplicacion local de generacion musical escrita en C++/GGML, sin depender de PyTorch. Sirve como alternativa al tokenizador v9 (cabeza de Mothersuperior) y sus codigos se renderizan con el decodificador base de YuE2 en lugar del adaptador companion del v9. La licencia del repositorio original no esta declarada, y el encoder hereda las condiciones CC BY-NC 4.0 de MERT-v2-FullSong.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MERT2 (frontend mel, ConvNext subsampler, 14 bloques Conformer causales) + cabeza VQ coseno (SwiGLU, proyeccion 256-d, codebook 32.768) |
| Parametros totales | 424.492.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; ventana de ejemplos de 60 s) |
| Tipos de cuantizacion | f16 en matrices 2-D; f32 en el resto de tensores, incluido el codebook |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | other / unspecified-upstream; encoder hereda CC BY-NC 4.0 de MERT-v2-FullSong |
| Formato de pesos | GGUF (ficheros `yue2-wannabe-v1-f16.gguf` y `yue2-wannabe-v2-f16.gguf`, 871 MB cada uno) |

## Arquitectura y entrenamiento

El modelo es una cadena de codificacion de audio en dos etapas. La primera es un encoder MERT2 afinado a partir de MERT-v2-FullSong, compuesto por un frontend mel, un subsampler basado en ConvNext y 14 bloques Conformer con atencion causal. La segunda es una cabeza de cuantizacion vectorial coseno que incluye un adaptador SwiGLU, una proyeccion a 256 dimensiones y un codebook de 32.768 entradas. La salida son codigos semanticos a 25 por segundo, que constituyen el objetivo de aprendizaje del modelo de lenguaje de YuE2.

La conversion a GGUF no reentrena ni poda nada: las matrices 2-D se almacenan en f16, el resto de tensores (incluido el codebook) permanece en f32, y el codebook se guarda normalizado y dividido por la temperatura de la cabeza para que un simple producto matricial reproduzca los logits originales. El convertidor es `engine/tools/convert-yue2-wannabe.py` del repositorio HOT-Step. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Conversion de audio musical real a codigos semanticos YuE2 (25 codigos por segundo, 32.768 posibles).
- Generacion de los codigos necesarios para entrenar adaptadores y modelos YuE2 sobre musica propia.
- Alternativa al tokenizador v9, con renderizado mediante el decodificador base de YuE2 (sin adaptador companion).
- Integracion nativa en HOT-Step: seleccion en la tarjeta Codes de Training Studio y en Follow source de Cover Studio.
- Compatibilidad automatica con adaptadores entrenados sobre sus codigos, sin necesidad del adaptador decodificador v9.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: es exclusivamente un tokenizador de audio.

## Casos de uso

- Entrenamiento de YuE2 sobre un catalogo musical propio: el tokenizador convierte las pistas en codigos YuE2 que el modelo de lenguaje aprende a producir, habilitando adaptadores personalizados sin el tokenizador v9.
- Preparacion de datasets de audio para fine-tuning: dado que cada segundo de audio se reduce a 25 codigos, se obtiene una representacion compacta y uniforme apta para pipelines de entrenamiento.
- Generacion musical local en HOT-Step: al integrarse en la aplicacion C++/GGML, permite tokenizar y renderizar musica en una maquina de escritorio sin PyTorch.
- Sustitucion del tokenizador v9 en flujos existentes: los adaptadores entrenados con estos codigos se renderizan con el decodificador base de YuE2, simplificando la cadena de inferencia al eliminar el adaptador companion.
- Investigacion sobre representaciones discretas de audio: el par encoder MERT2 + VQ coseno sirve para estudiar la fidelidad de la tokenizacion semantica frente al modelo PyTorch original (94,4 % de coincidencia de frames).
- Prototipado de herramientas de analisis musical: la extraccion de codigos permite indexar o comparar fragmentos por su representacion semantica en lugar de por la forma de onda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una prueba de fidelidad de la conversion:

| Metrica | Resultado |
|---|---|
| Coincidencia de frames frente al modelo PyTorch en fp32 (16 extractos reales de 60 s) | 94,4 % |
| Cambio de codigos al sustituir solo el resampler de 48 a 24 kHz en el modelo original | 4,8 % |
| Coincidencia entre ejecuciones fp32 y bf16 del modelo original | 92,7 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 424 millones de parametros y pesos mayoritariamente f16 (871 MB por fichero), la huella es del orden de 1-2 GB incluyendo buffers de activacion.
- GPU recomendadas: no disponible; al ejecutarse mediante GGML en HOT-Step, puede correr en CPU y en GPU de consumo.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 2 GB o mas de VRAM, aunque el autor no publica requisitos minimos.
- Opciones de despliegue: HOT-Step (C++/GGML) mediante el Model Manager; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuE2-WannabeTokenizer-GGUF | 424,5 M | no disponible | Tokenizador de audio a codigos YuE2 | other / unspecified-upstream (encoder CC BY-NC 4.0) | GGUF en Hugging Face |
| Tokenizador v9 (cabeza de Mothersuperior) | no disponible | no disponible | Tokenizador de audio a codigos YuE2 | no disponible | Requiere adaptador companion para renderizar |
| YuE2-GGUF (scragnog) | no disponible (YuE2-3B y YuE2-Vae) | no disponible | Modelo generativo musical (planner autorregresivo + flow matching) | no disponible | GGUF para HOT-Step CPP |

## Limitaciones y advertencias

- El repositorio original de ManyOtherFunctions no declara licencia; los derechos sobre WannabeTokenizer permanecen con su autor. El encoder deriva de MERT-v2-FullSong, con licencia CC BY-NC 4.0, lo que restringe el uso comercial.
- La fidelidad de la conversion no es total: un 5,6 % de frames no coincide con el modelo PyTorch en fp32, y el propio autor atribuye buena parte de la diferencia al remuestreo.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; cualquier expectativa en ese sentido es un error de uso.
- No hay informacion sobre sesgos, idiomas ni evaluacion cualitativa de la musica tokenizada.
- El soporte se limita a HOT-Step; no se documentan conversiones equivalentes para otros runtimes.
- La fecha de creacion del repositorio (2026-11-06) y el contador de descargas (0) indican un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/scragnog/YuE2-WannabeTokenizer-GGUF
- Modelo original: https://huggingface.co/ManyOtherFunctions/Yue2-WannabeTokenizer
- HOT-Step (aplicacion local): https://github.com/scragnog/HOT-Step-CPP
- YuE2-GGUF de scragnog: https://huggingface.co/scragnog/YuE2-GGUF
- MERT-v2-FullSong: https://huggingface.co/m-a-p/MERT-v2-FullSong

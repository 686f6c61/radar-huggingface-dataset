# Moear/AzurLane-GPT-SoVITS-V5dev

## Resumen

AzurLane-GPT-SoVITS-V5dev es un ajuste fino (fine-tune) del modelo de síntesis de voz GPT-SoVITS, publicado por el usuario Moear en Hugging Face. El modelo se ha entrenado sobre un corpus de voces del videojuego Azur Lane (碧蓝航线) para reproducir las voces de sus personajes: cubre 902 personajes de navío más TB, con 933 identificadores de voz distintos. No es un modelo de lenguaje generalista, sino un sistema TTS de dos etapas (GPT autorregresivo + SoVITS) que genera audio condicionado a una referencia de voz de 3 a 10 segundos.

El modelo parte del checkpoint oficial `lj1995/GPT-SoVITS` y se distribuye en la variante V5dev, la rama de desarrollo de la versión 5 del proyecto. Incluye 15 epochs del componente GPT (unos 155 MB cada una) y dos LoRA del componente SoVITS con rank 32 (unos 76 MB cada una), además de scripts de exportación a GGUF para su uso con el runtime gsv.cpp en Vulkan o CPU. El repositorio ocupa 2,5 GB.

Su relevancia es acotada pero clara: demuestra un flujo completo de fine-tuning multi-hablante sobre un dominio cerrado (voces de un videojuego) con evaluación objetiva de similitud de timbre (ERes2NetV2, WavLM) y de tasa de error de pronunciación, y publica los artefactos intermedios para que terceros puedan reproducir o comparar. Está pensado para doblaje, modding y experimentación con TTS, no para producción comercial genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS V5dev: GPT autorregresivo (modelo de tokens semanticos) + SoVITS (VITS con normalizacion de flujo, cond + DiT + refcode) + vocoder |
| Parametros totales | no disponible (el repo publica checkpoints por epoch: GPT ~155 MB y LoRA SoVITS ~76 MB por artefacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es una referencia de audio de 3-10 s mas el texto a sintetizar) |
| Tipos de cuantizacion | Exportacion a GGUF en FP16 mediante el exportador de gsv.cpp; otras cuantizaciones no disponibles |
| Idiomas soportados | japones (ja) y chino (zh) |
| Licencia | no disponible |
| Formato de pesos | `.ckpt` (GPT), `.pth` (SoVITS LoRA y vocoder), `.gguf` (exportacion AR para gsv.cpp) |

## Arquitectura y entrenamiento

El modelo sigue el pipeline de GPT-SoVITS en su version V5dev: un modulo GPT autorregresivo que predice tokens semanticos a partir del texto y de una referencia de audio, y un modulo SoVITS (familia VITS con normalizacion de flujo) que convierte esos tokens en forma de onda, apoyado en un vocoder. La inferencia se condiciona con un clip de referencia de 3 a 10 segundos del que se extraen hubert y BERT (chino) para fijar timbre y prosodia; el cambio de personaje se hace intercambiando esa referencia, sin recargar pesos. La evaluacion publicada uso 32 pasos de muestreo y CFG 1.30.

El entrenamiento se realizo sobre 50.759 clips (~138,3 horas), de los cuales 49.727 son japoneses, 1.032 chinos y 114 de TB, con 933 identificadores de voz etiquetados por idioma y variante de doblaje. Se parte del checkpoint oficial `lj1995/GPT-SoVITS` y se ajustan por separado el GPT (15 epochs publicadas) y el SoVITS mediante LoRA de rank 32 (2 epochs publicadas). La version upstream de GPT-SoVITS usada para entrenamiento y evaluacion es el commit `6d51ffceafbf`. El autor indica que se eliminaron las rutas locales de entrenamiento de los checkpoints y que se verifico tensor a tensor la correspondencia entre pesos originales y publicados; se incluye una tabla SHA-256. No se documenta el uso de RLHF ni de DPO, algo esperable en un modelo TTS.

## Capacidades

- Sintesis de voz multi-hablante con 902 personajes de navio mas TB (933 identificadores de voz), conmutables mediante la referencia de audio.
- Clonacion de voz few-shot: basta un clip limpio de 3 a 10 segundos con su transcripcion y etiqueta de idioma.
- Sintesis en japones y en chino, incluida la lectura de texto chino con referencia de voz japonesa (14 de las 16 muestras chinas de la evaluacion usan referencia japonesa).
- Control de prosodia y timbre mediante los parametros de muestreo (32 pasos, CFG 1.30 en la evaluacion publicada).
- Exportacion del GPT autorregresivo a GGUF FP16 para inferencia en Vulkan o CPU mediante gsv.cpp, con API HTTP `/tts`.
- Integracion con la WebUI oficial de GPT-SoVITS para inferencia y comparacion de pesos.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Doblaje de contenido derivado de Azur Lane: dado que el modelo cubre 902 personajes con una unica carga de pesos, se puede generar una linea de dialogo nueva para cualquier personaje simplemente aportando un clip de referencia de ese personaje y el texto a leer.
- Modding y fan projects: sustitucion o ampliacion de lineas de voz en mods del juego, usando la WebUI oficial con los checkpoints de la epoch 15 del GPT y la LoRA SoVITS que mejor puntue en las pruebas propias del estudio.
- Evaluacion comparativa de variantes TTS: el repositorio publica los 15 epochs del GPT y 2 LoRA del SoVITS con metricas por combinacion, lo que permite reproducir el banco de pruebas (16 voces, 24 frases japonesas y 16 chinas) y elegir la combinacion con mejor ERes2NetV2 o menor tasa de error de lectura.
- Despliegue ligero en Windows sin GPU dedicada: la exportacion a GGUF (~149,3 MiB por epoch 15) y el paquete gsv.cpp con backend Vulkan/CPU permiten sintesis local en equipos sin CUDA, con API HTTP para integrarla en un pipeline.
- Investigacion en clonacion de voz few-shot: el corpus etiquetado por personaje, idioma y variante de doblaje sirve como banco controlado para medir similitud de timbre (ERes2NetV2, WavLM) y tasa de error de transcripcion automatica.
- Prototipado de asistentes con voz de personaje: para demos o entornos cerrados donde se quiera una voz concreta del catalogo, encadenando un LLM externo con la API `/tts` de gsv.cpp.
- Generacion de audiolibros o contenido en japones/chino con un timbre fijo: la referencia de 3-10 s se reutiliza en todas las frases, lo que mantiene la consistencia de timbre a lo largo de un texto largo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 16 voces, 24 frases japonesas y 16 frases chinas (14 de ellas con referencia japonesa). Cada celda de timbre muestra ERes2NetV2 / WavLM (mayor es mejor); la tasa de error es la de transcripcion automatica (menor es mejor).

| Combinacion de pesos | Timbre JA (ERes2NetV2 / WavLM) | Error kana JA | Timbre ZH (ERes2NetV2 / WavLM) | Error caracter ZH |
|---|---:|---:|---:|---:|
| V2ProPlus | 0,7935 / 0,9197 | 5,87 % | 0,7131 / 0,9251 | 4,13 % |
| V5turbo zero-shot oficial | 0,8079 / 0,9278 | 4,01 % | 0,7201 / 0,9332 | 2,87 % |
| V5dev zero-shot oficial | 0,8116 / 0,9216 | 4,15 % | 0,7638 / 0,9228 | 3,05 % |
| GPT 15 + SoVITS oficial | 0,8218 / 0,9197 | 7,58 % | 0,7552 / 0,9317 | 3,23 % |
| GPT oficial + SoVITS LoRA 2 | 0,8047 / 0,9224 | 4,15 % | 0,7282 / 0,9257 | 3,05 % |
| GPT 12 + SoVITS LoRA 2 | 0,8000 / 0,9169 | 7,73 % | 0,7129 / 0,9351 | 2,33 % |
| GPT 15 + SoVITS LoRA 1 | 0,8055 / 0,9229 | 6,58 % | 0,7226 / 0,9353 | 3,23 % |
| GPT 15 + SoVITS LoRA 2 | 0,8082 / 0,9214 | 6,58 % | 0,7297 / 0,9372 | 3,59 % |

Lectura de los datos: el GPT ajustado (epoch 15) mejora la similitud de timbre en japones (0,8218 ERes2NetV2 frente a 0,8116 del zero-shot oficial) pero empeora la tasa de error de lectura en japones (7,58 % frente a 4,15 %). En chino, el zero-shot oficial de V5dev obtiene la mejor similitud ERes2NetV2 (0,7638) y la mejor tasa de error de caracteres la logra GPT 12 + SoVITS LoRA 2 (2,33 %). En WavLM chino, GPT 15 + SoVITS LoRA 2 alcanza el maximo (0,9372). No se han publicado resultados de benchmarks estandar de TTS (MOS, CMOS, WER sobre corpus publicos) en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 2,5 GB; cada checkpoint GPT pesa unos 155 MB y cada LoRA SoVITS unos 76 MB, por lo que el almacenamiento no es un cuello de botella.
- VRAM estimada para inferencia: no disponible de forma explicita. Por el tamano de los artefactos (GPT ~155 MB, LoRA ~76 MB, mas SoVITS base y vocoder) el conjunto cabe holgadamente en GPUs de consumo, pero el autor no publica una cifra de VRAM.
- GPU recomendadas: no disponibles. El autor solo documenta dos rutas: WebUI oficial de GPT-SoVITS (requiere GPU con soporte del stack de PyTorch) y gsv.cpp con backend Vulkan o CPU.
- Cabe en GPU de consumo: si, segun el tamano de los pesos, aunque no hay medicion oficial de VRAM ni de latencia.
- Opciones de despliegue: WebUI oficial de GPT-SoVITS (`python webui.py`, seleccionando `v5dev`), y gsv.cpp con paquete de Windows (`Start GAG.bat`), backend Vulkan/CPU y API HTTP `/tts`. La conversion a GGUF se hace con `tools/export_gguf/export.py --kind ar --f16`.
- Latencia y throughput: no disponibles. El autor solo confirma que la exportacion AR a GGUF (~149,3 MiB, 295 tensores) pasa el autotest del exportador; la sintesis end-to-end en Vulkan y la conversion de la LoRA SoVITS quedan sin probar en esa ruta.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Enfoque | Timbre JA (ERes2NetV2) | Error kana JA | Licencia |
|---|---|---|---|---:|---:|---|
| AzurLane-GPT-SoVITS-V5dev (GPT 15 + SoVITS oficial) | Fine-tune GPT-SoVITS V5dev | ja, zh | Voces de personajes de Azur Lane | 0,8218 | 7,58 % | no disponible |
| GPT-SoVITS V5dev oficial (zero-shot) | Base | multi (incl. ja, zh) | TTS generalista few-shot | 0,8116 | 4,15 % | no disponible en la informacion |
| GPT-SoVITS V5turbo oficial (zero-shot) | Base | multi (incl. ja, zh) | TTS generalista few-shot, variante turbo | 0,8079 | 4,01 % | no disponible en la informacion |
| GPT-SoVITS V2ProPlus | Base (version anterior) | multi (incl. ja, zh) | TTS generalista few-shot | 0,7935 | 5,87 % | no disponible en la informacion |

La comparacion se limita a variantes de la misma familia GPT-SoVITS, que es lo unico que el autor evalua. No hay datos frente a otros sistemas TTS (XTTS, Bark, Fish Speech, CosyVoice, etc.) en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: no hay terminos explicitos de uso comercial. El autor indica que personajes, voces y dialogos pertenecen a sus titulares, lo que hace arriesgado cualquier uso comercial sin autorizacion del titular de Azur Lane.
- Ambito de dominio cerrado: el modelo esta ajustado a voces de personajes del juego; generaliza mal a hablantes fuera de ese catalogo y no debe tratarse como un TTS generalista.
- Solo japones y chino: no hay soporte documentado de castellano ni de otros idiomas.
- Degradacion de pronunciacion en japones con el GPT ajustado: la tasa de error de kana sube al 7,58 % frente al 4,15 % del zero-shot oficial, un empeoramiento de mas de tres puntos.
- Dependencia de la referencia de audio: la calidad final depende fuertemente del clip de 3-10 s (limpieza, transcripcion correcta, etiqueta de idioma). Referencias ruidosas o mal transcritas degradan el resultado.
- Riesgo de alucinacion acustica: como todo TTS autorregresivo, puede producir artefactos, prosodia incorrecta o lecturas erroneas fuera del vocabulario observado en entrenamiento; el autor recomienda validar con la propia referencia antes de elegir pesos.
- Ruta GGUF incompleta: la exportacion AR a GGUF esta verificada (295 tensores, autotest), pero la sintesis end-to-end en Vulkan y la conversion de la LoRA SoVITS no se han probado.
- Sin datos de VRAM, latencia ni throughput: no hay cifras oficiales para dimensionar un despliegue en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa de la comunidad.
- Uso etico: la clonacion de voz permite suplantacion; conviene restringir el uso a entornos con consentimiento y a contenido no comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5dev
- Pesos por epoch: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5dev/tree/main/weights
- Tabla de checksums SHA-256: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5dev/resolve/main/SHA256SUMS
- Dataset de voces: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118/tree/39d126bfbaf30311b0518ca8549cc820fc98d92c
- Modelo base GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Repositorio GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Notas de la version V5 de GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS#v5-release-notes
- Commit upstream usado: https://github.com/RVC-Boss/GPT-SoVITS/commit/6d51ffceafbf240145619af4c92408a6e54b7924
- gsv.cpp: https://github.com/KakaruHayate/gsv.cpp
- Paquete Windows de gsv.cpp: https://huggingface.co/KakaruHayate/GSV.CPP/tree/main/windows
- Documentacion de la API de gsv.cpp: https://github.com/KakaruHayate/gsv.cpp/blob/main/docs/api.md
- Guia de uso de gsv.cpp: https://github.com/KakaruHayate/gsv.cpp/blob/main/docs/usage.md#2-get-models
- Exportador GGUF: https://github.com/KakaruHayate/gsv.cpp/blob/main/tools/export_gguf/README.md

# NeuraWeave/Qwen3-TTS-12Hz-0.6B-CustomVoice-quantised

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-quantised es una version cuantizada del modelo de sintesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice de Qwen, publicada por NeuraWeave. El modelo original es un sistema text-to-speech de 0,6 mil millones de parametros con una frecuencia de trabajo de 12 Hz, disenado para generar audio hablado a partir de texto con control de voz personalizada. Esta version cuantizada reduce el peso del checkpoint original (1811,6 MB en f16) hasta un minimo de 537,1 MB mediante recetas de cuantizacion por bloques, manteniendo la calidad perceptual dentro de margenes medibles.

La relevancia de esta publicacion es doble. Por un lado, demuestra una metodologia de cuantizacion especifica para modelos TTS basados en codecs neuronales, donde la metrica de dano no es solo la perplejidad o la divergencia KL sobre logits, sino tambien la calidad espectral del audio decodificado (SNR espectral) y la tasa de acuerdo en el argmax de los codebooks. Por otro, los pesos estan empaquetados en un formato propietario de safetensors con tensores divididos en partes `@q8_0` y `@q4k`, pensado exclusivamente para el runtime Rust de NeuraWeave (CubeCL sobre wgpu: Vulkan, DX12, Metal), lo que limita su portabilidad a otros ecosistemas como transformers o llama.cpp.

El modelo soporta ingles y japones, se distribuye bajo licencia Apache-2.0 y esta orientado a despliegue en aplicaciones de escritorio o servidor con GPU de consumo, donde el ahorro de memoria y de ancho de banda de descarga es critico. No obstante, su adopcion fuera del ecosistema NeuraWeave requiere conversion manual de formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en codec neuronal con "talker" (transformer) y speech tokenizer (codec decoder); 12 Hz |
| Parametros totales | 0,6 B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (8,5 bits/peso), q4k (4,625 bits/peso), recetas mixtas (4,74-8,50 bits/peso); decoder en f16 |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con particiones propietarias `<name>@q8_0.{qs,d}` y `<name>@q4k.{qs,sm,d}`; no compatible con GGUF ni con transformers/llama.cpp |

## Arquitectura y entrenamiento

El modelo base es un sistema TTS de Qwen con una arquitectura de dos componentes: un "talker" que genera tokens de habla a 12 Hz y un speech tokenizer (codec decoder) que convierte esos tokens en forma de onda de audio. El talker produce 16 codebooks: el codebook 0 codifica "lo que se dice" (contenido linguistico) y los 15 codebooks predictores codifican "como suena" (prosodia, timbre, detalles acusticos). Esta separacion es la que permite que la cuantizacion se evalue de forma granular, midiendo por separado la divergencia KL del codebook 0 y la de los predictores.

La cuantizacion de NeuraWeave se aplica exclusivamente al talker; el speech tokenizer se mantiene en f16 (con vectores 1-D en f32) y alcanza 59-67 dB de SNR frente al decoder en f32. Las recetas se eligieron mediante dos estrategias: (1) un mapa de sensibilidad que degrada cada uno de los 20 tipos de tensor a q4k de forma aislada y mide el dano por MB ahorrado, y (2) una busqueda por capas sobre ventanas solapadas, puntuada en la salida de la red y con un surrogate aditivo por ventana, que dio lugar a las recetas `coarse-lambda-5.5` y `adaptive-5.5`. El dano se mide en modo teacher-forcing sobre 8 frases (4 en ingles, 4 en japones, 648 frames), forzando las mismas elecciones del modelo original en ambos modelos para comparar KL, acuerdo de argmax y SNR espectral del audio decodificado. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles y japones.
- Generacion de voz personalizada ("CustomVoice") con control de identidad vocal segun el modelo base.
- Generacion de audio a 12 Hz mediante codec neuronal con 16 codebooks.
- Salida de audio decodificada con calidad espectral medida (SNR 3,0-8,3 dB segun receta frente al decoder f32).
- Soporte de multiples recetas de cuantizacion con distintos compromisos tamano/calidad.
- No se ha documentado soporte de tool calling, agentes, vision, audio de entrada ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas a en y ja.

## Casos de uso

- Sintesis de voz en aplicaciones de escritorio: el checkpoint `q8-emb4` (808,8 MB) o `aggr-4.7` (537,1 MB) permite empaquetar un TTS de calidad aceptable en instaladores de tamano moderado, con inferencia sobre Vulkan, DX12 o Metal mediante el runtime Rust de NeuraWeave.
- Lectura de contenido en ingles y japones: el soporte bilingue permite narrar articulos, documentacion o subtitulos en ambos idiomas con una sola instalacion, sin necesidad de dos modelos separados.
- Asistentes por voz embebidos: la frecuencia de 12 Hz reduce el numero de frames por segundo, lo que disminuye el coste computacional del decoder y facilita la generacion en tiempo real en GPUs de consumo.
- Prototipado de voces personalizadas: la variante CustomVoice del modelo base permite experimentar con identidades vocales concretas; la version cuantizada facilita iterar con menor huella de memoria.
- Generacion de audio para accesibilidad: conversion de texto a voz en herramientas de lectura de pantalla o audiolibros, donde el tamano del modelo y la latencia importan mas que la fidelidad absoluta.
- Investigacion en cuantizacion de modelos generativos de audio: las recetas y las metricas publicadas (KL por codebook, acuerdo de argmax, SNR espectral) sirven como referencia metodologica para otros trabajos de compresion de TTS.
- Despliegue en entornos con VRAM limitada: la receta `aggr-4.7` (537,1 MB) permite ejecutar el talker en GPUs integradas o de gama baja, aunque con mayor perdida de calidad (SNR 3,0 dB, acuerdo de argmax 0,912/0,622).

## Benchmarks y rendimiento

La model card proporciona metricas de calidad de cuantizacion (no benchmarks estandar como MMLU o HumanEval, que no aplican a un modelo TTS). Se comparan las recetas frente al modelo f16 de referencia:

| Receta | Tamano (MB) | bits/peso | KL codebook 0 | KL predictor | Acuerdo argmax (cb0 / pred) | SNR espectral (dB) |
|---|---|---|---|---|---|---|
| f16 (referencia) | 1811,6 | 16,00 | 0 | 0 | 1 / 1 | - |
| all-q8 | 962,6 | 8,50 | 5,4e-4 | 2,0e-3 | 0,985 / 0,959 | 8,3 |
| q8-emb4 | 808,8 | 7,14 | 6,7e-4 | 2,1e-3 | 0,985 / 0,958 | 8,2 |
| mixed-6.0 | 674,7 | 5,96 | 1,3e-2 | 3,1e-2 | 0,946 / 0,829 | 5,6 |
| mixed-5.5 | 616,8 | 5,45 | 2,7e-2 | 6,6e-2 | 0,943 / 0,770 | 4,1 |
| coarse-lambda-5.5 | 613,3 | 5,41 | 2,4e-2 | 6,4e-2 | 0,949 / 0,771 | 4,0 |
| adaptive-5.5 | 608,7 | 5,37 | 2,5e-2 | 6,4e-2 | 0,951 / 0,773 | 3,9 |
| aggr-4.7 | 537,1 | 4,74 | 6,1e-2 | 2,0e-1 | 0,912 / 0,622 | 3,0 |

Rendimiento de inferencia (runtime NeuraWeave): f16 es el mas rapido, con RTF 0,14 en una RTX 3090 Ti y 2,1 en una Intel UHD 770. Las variantes cuantizadas son entre un 10 % y un 40 % mas lentas en ese mismo runtime, por lo que la cuantizacion se justifica por tamano de descarga y memoria, no por velocidad.

## Requisitos de hardware

- VRAM estimada: el talker cuantizado ocupa entre 537 MB (`aggr-4.7`) y 963 MB (`all-q8`); el decoder en f16 anade aproximadamente 1 GB adicional (repo total de 5,2 GB incluye todas las recetas).
- GPU recomendadas: RTX 3090 Ti (RTF 0,14 en f16 segun la model card); cualquier GPU con soporte Vulkan, DX12 o Metal a traves de CubeCL/wgpu.
- GPU de consumo: si, cabe en GPUs de gama media y en graficas integradas como la Intel UHD 770 (RTF 2,1 en f16), aunque con latencia mayor.
- Opciones de despliegue: exclusivamente el runtime Rust de NeuraWeave (CubeCL sobre wgpu). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario y no es GGUF.
- Latencia y throughput: RTF 0,14 en RTX 3090 Ti con f16; las recetas cuantizadas son un 10-40 % mas lentas. No se proporcionan cifras de throughput en tokens de audio por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice (original) | 0,6 B | no disponible | en, ja | Apache-2.0 | safetensors f16 | Referencia de calidad; 1811,6 MB; RTF 0,14 en RTX 3090 Ti |
| Este modelo (NeuraWeave quantised) | 0,6 B | no disponible | en, ja | Apache-2.0 | safetensors propietario | 537-963 MB; requiere runtime NeuraWeave; 10-40 % mas lento |
| Otros TTS open source de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion directa con alternativas como XTTS, Bark o Piper no puede establecerse con rigor a partir de la informacion disponible, ya que no se aportan metricas comunes (MOS, WER, RTF) para esos modelos.

## Limitaciones y advertencias

- Los pesos no son GGUF ni safetensors estandar: no cargan en transformers, llama.cpp, Ollama ni vLLM. Solo funcionan con el runtime Rust de NeuraWeave.
- El formato de tensor dividido (`@q8_0`, `@q4k`) es propietario y requiere el manifiesto de la aplicacion NeuraWeave para resolverse correctamente.
- En modo free-running, todas las recetas (y el propio modelo f16 con otras semillas) generan ocasionalmente frases notablemente mas largas de lo esperado: aproximadamente 1 de cada 100 utterances supera el doble de duracion. Se recomienda un guard de longitud en el runtime.
- La calidad se degrada de forma medible con recetas agresivas: `aggr-4.7` baja el acuerdo de argmax del predictor a 0,622 y el SNR espectral a 3,0 dB, lo que puede producir artefactos audibles.
- Solo soporta ingles y japones; no hay soporte documentado de castellano ni de otros idiomas.
- No se dispone de informacion sobre sesgos del modelo base, tasas de alucinacion en contenido hablado ni evaluaciones MOS subjetivas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el NOTICE deben respetarse; conviene revisar el NOTICE del repo para conocer exactamente que se modifico.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de la calidad o estabilidad del empaquetado.

## Enlaces

- Hugging Face: https://huggingface.co/NeuraWeave/Qwen3-TTS-12Hz-0.6B-CustomVoice-quantised
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Repositorio de NeuraWeave (runtime CubeCL/wgpu): no disponible en la informacion proporcionada
- Paper o blog tecnico de la cuantizacion: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

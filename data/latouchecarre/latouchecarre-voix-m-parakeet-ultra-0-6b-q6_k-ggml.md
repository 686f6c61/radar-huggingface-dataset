# LaToucheCarre/LaToucheCarre-Voix-M-Parakeet-Ultra-0.6B-Q6_K-GGML

## Resumen

LaToucheCarre-Voix-M-Parakeet-Ultra-0.6B-Q6_K-GGML es un modelo de reconocimiento automatico del habla (ASR) en formato ggml, publicado por LaToucheCarre como parte del palier "Voice M" de su asistente de dictado local para Windows. Se trata de una conversion a ggml y una cuantizacion Q6_K del modelo moondream/parakeet-ultra, que a su vez es un post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3. El resultado es un unico fichero binario de 572.575.719 bytes (unos 0,6 GB) que se ejecuta con `parakeet-cli`, la herramienta de linea de comandos de whisper.cpp, sobre CPU o GPU via Vulkan.

El modelo resuelve el problema de la dictacion por voz completamente offline: no envia audio a ningun servidor, algo critico para un producto que procesa texto privado del usuario. La arquitectura subyacente es Parakeet TDT (Token-and-Duration Transducer) de NVIDIA, con 0,6B parametros, y el repositorio conserva el vocabulario y los hiperparametros del ggml oficial de Parakeet TDT 0.6B v3. La licencia es CC-BY-4.0 y los idiomas declarados son frances, ingles y multilingue.

La relevancia de este deposito es doble: por un lado, demuestra que es posible servir ASR de calidad competitiva con menos de 1 GB de VRAM; por otro, publica un banco de medidas comparativo entre cuantizaciones (de Q2_K a F16) y frente a Whisper large-v3 distil y al propio Parakeet v3, lo que permite elegir el palier de memoria adecuado con datos concretos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), transformer encoder-decoder con predictor LSTM y decodificacion por duraciones |
| Parametros totales | 0,6B (segun nombre del modelo y modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos de audio; el banco usa extractos de 17 s, 25 s y 2 min 26 s) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y F16 (este repositorio publica Q6_K) |
| Idiomas soportados | fr, en, multilingual |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ggml (fichero `ggml-parakeet-ultra-0.6b-q6_k.bin`, 572.575.719 bytes, SHA-256 `493af766991ab61aed01eb363719566e3b633e5c92ff903282d2048242993be1`) |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de NVIDIA Parakeet, con 0,6B parametros, post-entrenado por Moondream (revision `73175eb7ae`) y posteriormente convertido a ggml por LaToucheCarre. La conversion se realizo en dos fases: primero una conversion a ggml f32 tomando como plantilla el ggml f32 oficial de Parakeet TDT 0.6B v3 del repositorio ggml-org/parakeet-GGUF, recopiando el encabezado (hiperparametros, banco de filtros mel, ventana, duraciones TDT y jetons) y sustituyendo cada tensor por su homologo de `model.safetensors` de Parakeet Ultra, con renombrado de nomenclatura transformers a NeMo, repliegue de los sesgos LSTM ih en hh y reordenacion de puertas [i,f,g,o] a [i,f,o,g]. La cabeza VAD se descarto. Como control de integridad se verifico una similaridad coseno minima de 0,954 frente al tensor original de v3 en todos los tensores.

La segunda fase aplico `parakeet-quantize` de whisper.cpp (revision `c44b60b`) con tipo `q6_k` directamente desde el f32 convertido, nunca desde f16, para evitar que `decoder.prediction.embed.weight` quedase con el doble de tamano. No se dispone de informacion sobre el dataset de entrenamiento original (numero de tokens, composicion, uso de RLHF o DPO); esos datos corresponden al modelo base de NVIDIA y Moondream y no se detallan en la model card de este deposito.

## Capacidades

- Reconocimiento automatico del habla en frances e ingles, con comportamiento multilingue declarado.
- Transcripcion de audio WAV a 16 kHz mono mediante `parakeet-cli`.
- Decodificacion TDT con prediccion conjunta de token y duracion, propia de la familia Parakeet.
- Ejecucion en CPU (`-ng`) o en GPU via Vulkan (`-dev N`), con control del numero de hilos (`-t`) y supresion de puntuacion si se usa `-np`.
- Manejo de homofonos en voz real: el banco de pruebas incluye un extracto de 25 s especificamente disenado con homofonos.
- Transcripcion de audio de varios minutos en una sola pasada (extracto de 2 min 26 s en FLEURS).
- No se documentan capacidades de tool calling, agentes, vision ni audio-vision en este repositorio.

## Casos de uso

- Dictado offline en aplicaciones de escritorio: el modelo esta pensado para integrarse en un asistente Windows que nunca envia texto a la nube; con 984 MB de VRAM en Q6_K y 621 MB de RAM, puede convivir con la aplicacion principal en equipos de gama media.
- Transcripcion de reuniones y notas de voz en frances e ingles: el extracto de 2 min 26 s de FLEURS se transcribe con un 95,10 % de palabras correctas en Q6_K, suficiente para actas y resumenes posteriores.
- Subtitulado local de contenido audiovisual: al ejecutarse sobre Vulkan en GPU de consumo, permite procesar audio por lotes sin depender de APIs externas ni incurrir en costes por minuto.
- Sistemas de accesibilidad para usuarios con movilidad reducida: la dictacion continua con correccion de homofonos (1 error de sustitucion y 1 de insercion en 487 palabras de referencia) hace viable escribir textos largos por voz.
- Cumplimiento y privacidad en entornos regulados: al no salir el audio de la maquina, encaja en flujos donde el RGPD o politicas internas prohiben servicios de ASR en la nube.
- Integracion en pipelines de transcripcion por CLI: `parakeet-cli` acepta fichero de audio, hilos y dispositivo, lo que facilita su orquestacion desde scripts o colas de trabajo batch.
- Evaluacion comparativa de cuantizaciones: el repositorio publica medidas de Q2_K a F16 con el mismo banco, util para decidir el compromiso memoria/precision en un despliegue propio.

## Benchmarks y rendimiento

Banco de voz del 27/10/2026 sobre Ryzen 7 7800X3D y RTX 5090, `parakeet-cli` Vulkan, una pasada. Extractos: dictado casero (17 s), voz real con homofonos (25 s) y FLEURS leido (2 min 26 s); unos 2.830 caracteres y 487 palabras de referencia. Errores = caracteres fallidos tras normalizacion de numeros.

| Palier | Cuantizacion | Bytes | Errores d/p/f | Total | CER % | WER % | FLEURS % palabras | RAM / VRAM MB |
|---|---|---|---|---|---|---|---|---|
| — | Q2_K (descartado) | 272.917.479 | 51/47/610 | 708 | 25,19 | 41,48 | 53,95 | 396 / 684 |
| XS | Q3_K | 334.751.719 | 1/4/20 | 25 | 0,89 | 3,90 | 95,64 | 395 / 746 |
| — | Q4_K (descartado) | 415.611.879 | 1/1/27 | 29 | 1,03 | 4,52 | 94,55 | 470 / 827 |
| S | Q5_K | 491.715.559 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 543 / 903 |
| M | Q6_K | 572.575.719 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 621 / 984 |
| L | Q8_0 | 668.757.119 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 713 / 1.080 |
| XL | F16 | 1.255.897.319 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 1.098 / 1.667 |
| ref. | Parakeet TDT 0.6B v3 Q3_K | 334.751.719 | 1/2/28 | 31 | 1,10 | 4,72 | 94,55 | 396 / 746 |
| ref. | Whisper large-v3 french distil Q5_0 | 791.369.259 | 0/0/36 | 36 | 1,28 | 4,72 | 93,73 | 843 / 1.207 |

Observaciones del autor: Q3_K a F16 obtienen practicamente la misma puntuacion, por lo que la escala de paliers es de memoria, no de precision; Q8_0 y F16 producen el mismo texto caracter a caracter; Q2_K se degrada de forma severa. La velocidad es identica entre cuantizaciones sobre la misma tarjeta (188 s de audio en 3,6 a 4,4 s); en CPU, del orden de x0,1 a x0,2 del tiempo real. El ingles forzado en frances se devuelve tal cual, igual que en Parakeet v3.

## Requisitos de hardware

- VRAM estimada en Q6_K: 984 MB (medido). En Q3_K baja a 746 MB; en F16 sube a 1.667 MB.
- RAM estimada en Q6_K: 621 MB en modo CPU; 395 MB con Q3_K.
- GPU recomendadas: cualquier GPU con soporte Vulkan; las medidas se tomaron en una RTX 5090, pero el consumo de VRAM inferior a 1 GB hace viable tarjetas de gama de entrada.
- Cabe holgadamente en GPU de consumo: el palier Q3_K (746 MB de VRAM) y el Q6_K (984 MB) entran en cualquier GPU con 2 GB o mas.
- Opciones de despliegue: `parakeet-cli` de whisper.cpp (revision `c44b60b`), con backend Vulkan o CPU (`-ng`). No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) para este formato.
- Throughput: 188 s de audio procesados en 3,6 a 4,4 s sobre RTX 5090 (aproximadamente x43 a x52 del tiempo real). En CPU, x0,1 a x0,2 del tiempo real (entre 5 y 10 veces mas lento que el audio).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER % (mismo banco) | WER % | FLEURS % palabras | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Parakeet Ultra 0.6B Q6_K (este) | 0,6B | no disponible | 0,89 | 4,11 | 95,10 | CC-BY-4.0 | ggml |
| Parakeet TDT 0.6B v3 Q3_K | 0,6B | no disponible | 1,10 | 4,72 | 94,55 | CC-BY-4.0 | ggml |
| Whisper large-v3 french distil Q5_0 | no disponible | no disponible | 1,28 | 4,72 | 93,73 | no disponible | ggml |

Frente a Parakeet v3, el post-entrenamiento de Moondream mejora el CER de 1,10 a 0,89 y el WER de 4,72 a 4,11 con el mismo tamano de fichero en Q3_K, y mantiene la misma memoria y velocidad a cuantizacion igual. Frente a Whisper large-v3 distil, ofrece mejor CER y mejor porcentaje de palabras en FLEURS, con un fichero Q6_K un 28 % mas pequeno que el Q5_0 de Whisper (572 MB frente a 791 MB) y menor huella de VRAM (984 MB frente a 1.207 MB).

## Limitaciones y advertencias

- No se han documentado sesgos especificos en la model card; al derivar de NVIDIA Parakeet y del post-entrenamiento de Moondream, hereda los sesgos de esos corpus, no descritos en este repositorio.
- Riesgo de alucinacion presente como en cualquier ASR: el banco registra 1 sustitucion y 1 insercion en 487 palabras de referencia en Q6_K, y el autor advierte que el ingles forzado en frances se transcribe tal cual, sin traduccion ni marcado.
- Q2_K se degrada severamente (CER 25,19 %, FLEURS 53,95 % de palabras) y el autor lo descarta explicitamente; no debe usarse en produccion.
- La longitud de contexto y el comportamiento con audio muy largo no se detallan; las pruebas llegan a 2 min 26 s en una sola pasada.
- Solo se declaran frances, ingles y multilingue; no hay evaluacion de otros idiomas en la informacion disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a Moondream y NVIDIA; el autor aclara que ninguna de las dos empresas esta asociada a este repositorio.
- La integracion esta atada a `parakeet-cli` de whisper.cpp; no se documentan otros runtimes, lo que limita la portabilidad fuera del ecosistema ggml.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de las medidas publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Voix-M-Parakeet-Ultra-0.6B-Q6_K-GGML
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo NVIDIA original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Plantilla ggml oficial: https://huggingface.co/ggml-org/parakeet-GGUF
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Producto La Touche Carre: https://latouchecarre.fr
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/

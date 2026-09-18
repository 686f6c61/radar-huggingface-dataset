# moondream/parakeet-redux

## Resumen

parakeet-redux es una version ternaria del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por moondream. Conserva la misma arquitectura y el mismo tokenizer que el modelo base, pero sustituye todos los pesos del encoder por valores ternarios (-1, 0 o +1), lo que reduce los pesos de 1,2 GB a 178 MB. Los metadatos de safetensors declaran 148.923.399 parametros, mientras que el modelo del que deriva se denomina "0.6b" (unos 600 millones); la informacion disponible no explica esa diferencia de recuento. El repositorio ocupa 0,6 GB.

El objetivo es ejecutar ASR de calidad cercana al original sin GPU dedicada: alcanza 113x tiempo real en ocho nucleos x86 con AVX-512 (AMD EPYC 9575F, Zen 5) y 38x en CPU / 43x en GPU en un Apple M2. Frente al modelo original, cede 0,29 puntos de WER de media en los siete conjuntos ingleses del Open ASR Leaderboard (6,55 frente a 6,26), pero mejora en FLEURS de 25 idiomas (10,56 frente a 11,62) y en audio de formato largo TED-LIUM (2,51 frente a 2,71).

Es relevante porque demuestra que una cuantizacion de 1,58 bits sobre un sistema ASR de produccion mantiene el rendimiento con perdidas acotadas en ingles y ganancias claras en tamano y velocidad, y porque cubre 25 idiomas europeos bajo licencia CC-BY-4.0. El principal punto debil medido es el ruido de fondo: en las nueve condiciones MUSAN el WER sube de 6,72 a 9,04.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (transducer de tokens y duracion) heredada de parakeet-tdt-0.6b-v3; pesos del encoder ternarios (-1, 0, +1) |
| Parametros totales | 148.923.399 segun metadatos de safetensors; el modelo base se denomina 0.6b (unos 600 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el modelo procesa audio de formato largo (evaluado en TED-LIUM) |
| Tipos de cuantizacion | Ternaria de 1,58 bits en el encoder, pesos empaquetados de 178 MB; el repositorio incluye la etiqueta "8-bit" |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, empaquetados; Photon los lee directamente |
| Tarea | automatic-speech-recognition |
| Autor | moondream |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Tamano del repositorio | 0,6 GB |
| Publicacion | Creado el 18 de septiembre de 2026; actualizado el 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card indica que parakeet-redux comparte arquitectura y tokenizer con nvidia/parakeet-tdt-0.6b-v3, un sistema ASR de tipo TDT (token-and-duration transducer, segun la etiqueta parakeet_tdt del repositorio). La unica diferencia declarada esta en los pesos: todos los pesos del encoder son -1, 0 o +1, es decir, una representacion ternaria de 1,58 bits. No se especifica si esa ternarizacion se obtuvo mediante entrenamiento consciente de cuantizacion (QAT), cuantizacion posterior al entrenamiento (PTQ) o destilacion; tampoco se detallan el dataset, el numero de horas de audio ni el uso de tecnicas de alineacion o refinamiento.

La ejecucion no se realiza con frameworks estandar: los pesos empaquetados se leen directamente con Photon (moondream), que implementa kernels especificos para AVX-512 VNNI en x86, NEON en ARM y Metal en las GPU de Apple. Esa integracion entre formato de pesos y runtime es la que explica el salto de velocidad frente a otras alternativas: 113x tiempo real frente a 45x de parakeet.cpp (ggml, q8_0), 42x de sherpa-onnx (int8) y 28x de onnx-asr (int8), todas medidas con los mismos 8 nucleos fisicos y las mismas 2.620 locuciones de LibriSpeech test-clean. No hay informacion disponible sobre datos de entrenamiento, numero de tokens ni proceso de optimizacion con RLHF/DPO.

## Capacidades

- Transcripcion de voz a texto en 25 idiomas, entre ellos espanol, ingles, aleman, frances, italiano, portugues, ruso, ucraniano y el resto de idiomas listados en las especificaciones.
- Marcas de tiempo a nivel de segmento (una entrada por frase, con inicio y fin en segundos).
- Marcas de tiempo a nivel de palabra dentro de cada segmento.
- Procesamiento de audio de formato largo: se evalua en TED-LIUM, donde obtiene 2,51 de WER.
- Robustez en dominios concretos de ingles: mejora al original en AMI (10,80 frente a 10,86) y Earnings-22 (9,95 frente a 10,75).
- Ejecucion en CPU x86 con AVX-512, en CPU ARM con NEON y en GPU de Apple con Metal; tambien admite CUDA como dispositivo en la API de Photon.
- No dispone de tool calling, function calling, razonamiento multi-paso ni generacion de texto libre: es exclusivamente un modelo de reconocimiento de voz.
- No se documenta modo streaming, diarizacion de hablantes, deteccion de idioma ni traduccion.

## Casos de uso

- Transcripcion en portatiles y equipos sin GPU dedicada: los pesos de 178 MB caben en memoria sin presion y el modelo alcanza 38x tiempo real en la CPU de un Apple M2, lo que permite dictado y transcripcion offline con un consumo de disco minimo.
- Procesamiento por lotes en servidores CPU: a 113x tiempo real en 8 nucleos x86, una hora de audio se transcribe en aproximadamente 32 segundos de reloj, sin necesidad de ocupar GPU que puedan estar destinadas a otras cargas.
- Subtitulado automatico de video y podcast: las marcas de tiempo a nivel de palabra permiten generar subtitulos con sincronizacion fina sin recurrir a un alineador forzado externo.
- Actas de reuniones y transcripcion de salas: es el escenario AMI, donde el modelo iguala practicamente al original (10,80 frente a 10,86 de WER), con la ventaja de poder ejecutarse en la propia maquina del usuario.
- Analisis de llamadas de resultados financieros o de atencion telefonica: en Earnings-22 obtiene 9,95 de WER, mejor que los 10,75 del modelo base, por lo que es adecuado para pipelines de transcripcion de audio corporativo en ingles.
- Digitalizacion de audiolibros y contenido narrativo: en LibriSpeech test-clean registra 1,94 de WER y en test-other 4,34, con un coste de almacenamiento de 178 MB por instancia desplegada.
- Transcripcion de conferencias de formato largo: en TED-LIUM baja a 2,51 de WER, por debajo del 2,71 del original, lo que lo hace util para charlas, cursos y seminarios de mas de 20 minutos.
- Aplicaciones multilingues europeas: en FLEURS mejora al original en croata (9,26), estonio (9,15), letón (12,80), lituano (17,27), maltes (13,65) y griego (32,48), lo que resulta adecuado para servicios que operan en varios idiomas minoritarios dentro de la Union Europea.
- Despliegue embebido en ARM: Photon usa kernels NEON y Metal en Apple Silicon; no hay datos publicados de rendimiento en otras plataformas ARM.

## Benchmarks y rendimiento

Comparativa global declarada por el autor (WER en porcentaje, menor es mejor):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-redux |
|---|---|---|
| Open ASR Leaderboard, 7 conjuntos en ingles | 6,26 | 6,55 |
| FLEURS, 25 idiomas | 11,62 | 10,56 |
| Habla de negocio, estilo AA-WER | 6,15 | 6,96 |
| Ruido de fondo, 9 condiciones MUSAN | 6,72 | 9,04 |
| TED-LIUM, formato largo | 2,71 | 2,51 |
| Pesos | 1,2 GB | 178 MB |

Open ASR Leaderboard (los siete conjuntos de test en ingles):

| Conjunto | parakeet-tdt-0.6b-v3 | parakeet-redux |
|---|---|---|
| LibriSpeech test-clean | 1,52 | 1,96 |
| LibriSpeech test-other | 3,13 | 4,34 |
| AMI | 10,86 | 10,80 |
| Earnings-22 | 10,75 | 9,95 |
| GigaSpeech | 8,05 | 8,73 |
| SPGISpeech | 3,63 | 4,01 |
| VoxPopuli | 5,88 | 6,07 |
| Media | 6,26 | 6,55 |

FLEURS (split de test, frases de Wikipedia; el fragmento disponible de la tabla esta truncado a partir del portugues):

| Idioma | parakeet-tdt-0.6b-v3 | parakeet-redux |
|---|---|---|
| Bulgaro | 11,90 | 11,23 |
| Croata | 10,93 | 9,26 |
| Checo | 10,85 | 10,25 |
| Danes | 16,78 | 15,94 |
| Neerlandes | 6,18 | 7,45 |
| Ingles | 4,25 | 4,90 |
| Estonio | 13,23 | 9,15 |
| Finés | 11,05 | 10,38 |
| Frances | 4,81 | 7,71 |
| Aleman | 4,13 | 5,42 |
| Griego | 35,71 | 32,48 |
| Hungaro | 13,65 | 14,15 |
| Italiano | 2,61 | 3,24 |
| Leton | 21,38 | 12,80 |
| Lituano | 21,09 | 17,27 |
| Maltes | 19,13 | 13,65 |
| Polaco | 6,70 | 8,59 |
| Portugues | 4,65 | 4,99 |
| Media de 25 idiomas | 11,62 | 10,56 |

El dato de WER en espanol no aparece en el fragmento de informacion disponible. La evaluacion se realizo con el pipeline del Open ASR Leaderboard en su version de septiembre de 2026 (sus normalizadores y su alineacion con fusion de compuestos), con parakeet-redux en Photon sobre GPU NVIDIA y el original en NeMo en bf16.

Velocidad en CPU x86 (AMD EPYC 9575F, 8 nucleos fisicos, DDR5-6000, LibriSpeech test-clean con 2.620 locuciones):

| Runtime | Pesos | Tiempo real | WER |
|---|---|---|---|
| Photon, este modelo | ternario, 178 MB | 113x | 1,94 |
| parakeet.cpp (ggml) | q8_0, 0,94 GB | 45x | 1,51 |
| sherpa-onnx (ONNX Runtime) | int8, 0,67 GB | 42x | 1,97 |
| onnx-asr (ONNX Runtime) | int8, 0,67 GB | 28x | 1,93 |

Velocidad en Apple Silicon (MacBook Air con M2, 4 nucleos de rendimiento y 4 de eficiencia, GPU de 10 nucleos, 16 GB de memoria unificada, macOS 15):

| Runtime | Pesos | CPU | GPU |
|---|---|---|---|
| Photon, este modelo | ternario, 178 MB | 38x | 43x |
| parakeet.cpp (ggml) | q8_0, 0,94 GB | 12x | 38x (Metal) |
| parakeet.cpp (ggml) | f16, 1,44 GB | 9x | 39x (Metal) |
| parakeet-mlx | fp32, 2,51 GB | No disponible | 37x |
| onnx-asr (ONNX Runtime) | int8, 0,67 GB | 33x | No disponible |
| sherpa-onnx (ONNX Runtime) | int8, 0,67 GB | 28x | No disponible |

## Requisitos de hardware

- Pesos: 178 MB en formato ternario empaquetado. El repositorio completo ocupa 0,6 GB. No se especifica el consumo adicional de memoria del runtime, por lo que la VRAM total necesaria no esta disponible.
- CPU x86: medido en un AMD EPYC 9575F (Zen 5, hasta 5,0 GHz, AVX-512) usando 8 nucleos fisicos de un solo chiplet con DDR5-6000; 113x tiempo real. Requiere AVX-512 VNNI para el camino rapido de Photon.
- CPU ARM y Apple Silicon: medido en un Apple M2 con 16 GB de memoria unificada; 38x en CPU (NEON) y 43x en GPU (Metal).
- GPU: las pruebas comparativas se ejecutaron en una GPU NVIDIA no identificada en la informacion (parakeet-redux en Photon) y en la GPU integrada del M2. No hay mediciones publicadas para A100, H100, RTX 4090 ni otras GPU concretas. Por el tamano de los pesos (178 MB) es previsible que quepa en cualquier GPU de consumo actual, pero se trata de una inferencia, no de un dato medido.
- Despliegue: la via documentada es Photon, incluido en el paquete `moondream` (version 2.4.0 o posterior), con seleccion de dispositivo "cpu", "mps" o "cuda" (si se omite, prioriza CUDA, luego Apple Silicon y por ultimo CPU). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni whisper.cpp con estos pesos; las alternativas comparadas en la tabla de velocidad ejecutan el modelo original, no la version ternaria.
- Latencia y throughput: expresados como factor de tiempo real, una locucion a la vez. 113x equivale a 1 hora de audio en unos 32 segundos de reloj en 8 nucleos x86; 43x en la GPU del M2 equivale a unos 84 segundos por hora de audio. No se publican cifras de procesamiento por lotes ni de latencia por segmento.

## Comparativa con modelos similares

La comparacion disponible es con el modelo original y con las formas de ejecucion alternativas del propio Parakeet, todas medidas en LibriSpeech test-clean (2.620 locuciones) salvo donde se indique:

| Modelo o runtime | Parametros | Pesos | WER | Tiempo real (x86) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-redux (ternario, Photon) | 148,9 M declarados en safetensors; base de 0,6b | 178 MB | 1,94 | 113x | CC-BY-4.0 | Photon (paquete moondream >= 2.4.0) |
| parakeet-tdt-0.6b-v3 (bf16, NeMo) | 0,6b | 1,2 GB | 1,52 | No disponible | No disponible | HuggingFace, nvidia/parakeet-tdt-0.6b-v3 |
| parakeet.cpp (ggml q8_0) | 0,6b | 0,94 GB | 1,51 | 45x | No disponible | Runtime de terceros sobre el modelo original |
| sherpa-onnx (int8) | 0,6b | 0,67 GB | 1,97 | 42x | No disponible | ONNX Runtime sobre el modelo original |
| onnx-asr (int8) | 0,6b | 0,67 GB | 1,93 | 28x | No disponible | ONNX Runtime sobre el modelo original |
| parakeet-mlx (fp32, Apple) | 0,6b | 2,51 GB | No disponible | No aplica (solo GPU Apple) | No disponible | Exclusivo de Apple Silicon |

Frente a las alternativas cuantizadas a 8 bits (0,67-0,94 GB), parakeet-redux ocupa entre 3,8 y 5,3 veces menos espacio y es entre 2,5 y 4 veces mas rapido, con un WER en LibriSpeech test-clean (1,94) practicamente identico al de sherpa-onnx (1,97) y onnx-asr (1,93) y ligeramente peor que parakeet.cpp en q8_0 (1,51). No se dispone de datos para comparar con modelos ASR de otras familias (por ejemplo Whisper) en esta informacion.

## Limitaciones y advertencias

- Degradacion clara con ruido de fondo: en las nueve condiciones MUSAN el WER sube de 6,72 (modelo original) a 9,04, un empeoramiento de 2,32 puntos. Es la debilidad mas acusada del modelo.
- Peor rendimiento en habla de negocio: 6,96 frente a 6,15 del original en la evaluacion estilo AA-WER.
- Perdida en ingles limpio: 1,52 a 1,96 en LibriSpeech test-clean y 3,13 a 4,34 en test-other. En la media de los siete conjuntos ingleses cede 0,29 puntos.
- Regresion notable en algunos idiomas de FLEURS: frances de 4,81 a 7,71, aleman de 4,13 a 5,42, neerlandes de 6,18 a 7,45, polaco de 6,70 a 8,59 y hungaro de 13,65 a 14,15. El dato de espanol no esta disponible en el fragmento consultado, por lo que no puede confirmarse su comportamiento.
- Idiomas con WER absoluto alto incluso mejorando: griego 32,48, lituano 17,27, danes 15,94 y hungaro 14,15. No son adecuados para transcripcion de produccion sin revision humana.
- Ejecucion ligada a Photon: no hay soporte documentado en llama.cpp, Ollama, vLLM, TGI ni otros runtimes, lo que limita la portabilidad y crea dependencia de una implementacion concreta. Ademas, las aceleraciones descritas requieren AVX-512 VNNI en x86, NEON en ARM o Metal en Apple; en CPUs x86 sin AVX-512 el rendimiento no esta documentado.
- No se detallan los datos de entrenamiento, el metodo de cuantizacion ni los sesgos por idioma, acento, edad o genero. Al ser una adaptacion de un modelo de NVIDIA, conviene revisar tambien las condiciones del modelo base.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero no se especifica en la informacion disponible si existen condiciones adicionales heredadas del modelo base o de los datasets de entrenamiento.
- Naturaleza del modelo: no genera texto libre, no sigue instrucciones, no hace tool calling y no razona en varios pasos. Cualquier uso conversacional requiere un componente adicional.
- El recuento de parametros de safetensors (148.923.399) no coincide con la denominacion "0.6b" del modelo base. La informacion disponible no aclara el motivo, por lo que conviene verificarlo antes de dimensionar despliegues.
- Riesgo de alucinacion en el sentido clasico de ASR: no hay datos publicados sobre tasas de insercion en silencios o musica, ni sobre comportamiento con audio fuera de dominio.
- Cifras de referencia de la model card medidas por el propio autor; no se han verificado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moondream/parakeet-redux
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime Photon: https://moondream.ai/photon
- Papers, repositorios y demos adicionales: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.

# MaksL/voxrt-parakeet-redux-coreml

## Resumen

voxrt-parakeet-redux-coreml es un paquete Core ML del encoder de moondream/parakeet-redux, el reentrenamiento ternario (cada peso del encoder pertenece a {-1, 0, +1}) de nvidia/parakeet-tdt-0.6b-v3. Lo publica el usuario MaksL como la ruta para Apple Neural Engine del runtime voxrt, escrito en Rust. No es un modelo de reconocimiento de voz autonomo: voxrt ejecuta el frontend mel, el subsampling, el decodificador TDT y el VAD, y delega en este paquete las 24 capas del encoder.

El encoder conserva los valores ternarios exactos del checkpoint almacenados en 2 bits y se ejecuta en fp16 nativo en la Neural Engine, con layout [1, C, 1, T]. El repositorio ocupa 1,0 GB y el artefacto principal (encoder.mlmodelc) 304 MB, con siete buckets de longitud (t64 a t768, aproximadamente de 5 a 61 segundos de audio) que comparten una unica copia de los pesos. Requiere macOS 15 o iOS 18, porque la codificacion en 2 bits usa operadores de Core ML introducidos en iOS 18.

Su relevancia es doble: habilita transcripcion multilingue en 25 idiomas europeos sobre silicio de Apple sin salir del dispositivo, y demuestra una ruta de despliegue de pesos ternarios en la Neural Engine sin recuantizacion adicional. La model card declara 1,96 % de WER en LibriSpeech test-clean y 168x sobre tiempo real en un M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de 24 capas y anchura 1024 (entrada de subsampling [T, 1024]) del modelo base `nvidia/parakeet-tdt-0.6b-v3`, con decodificador TDT ejecutado por voxrt; el repositorio contiene unicamente el encoder. La model card no detalla la topologia interna mas alla del numero de capas, la anchura y el patron de convoluciones |
| Parametros totales | No disponible para el encoder. El modelo base declara 0,6 B; el artefacto compilado ocupa 304 MB con pesos de 2 bits |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Por invocacion, ventanas de 64 a 768 frames de encoder (≈ 5-61 s de audio) repartidas en siete buckets de longitud (`t64` … `t768`) |
| Tipos de cuantizacion | Ternaria exacta del checkpoint ({-1, 0, +1}) almacenada como codigos de 2 bits, con escalas fp16 por fila y por bloque de 128 columnas; el calculo se hace en fp16 |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML compilado (`encoder.mlmodelc`) mas `encoder.json`; los pesos ternarios de origen estan en `model.safetensors` del repositorio base |

## Arquitectura y entrenamiento

El modelo base es un reentrenamiento ternario de `nvidia/parakeet-tdt-0.6b-v3` realizado por M87 Labs (Moondream), en el que todos los pesos del encoder se restringen al conjunto {-1, 0, +1}. La conversion a Core ML no modifica esos valores: cada capa lineal se reescribe como una cadena de convoluciones 1x1, una por bloque de 128 columnas, que leen codigos de 2 bits a traves de una tabla ternaria unica (`constexpr_lut_to_dense`) y aplican despues las escalas fp16 por fila de ese bloque. Todo el encoder se ejecuta en el layout nativo de la Neural Engine, `[1, C, 1, T]`, y el runtime divide el trabajo en siete funciones, una por bucket de longitud, sobre una copia compartida de los pesos. Las entradas son `x [T, 1024]` en fp16 (salida del subsampling), `key_mask [1, 1, T]` y `row_mask [T, 1]`; las mascaras impiden que los frames de relleno entren en la atencion y en la convolucion.

No se especifican en la informacion disponible el numero de tokens de audio usados en el reentrenamiento ternario, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste con preferencias (no aplicables a un encoder ASR). La innovacion tecnica destacable es la preservacion literal de la terna en 2 bits con computo fp16 en la Neural Engine: la salida del encoder presenta un coseno de aproximadamente 0,9999 frente a la ruta f32 en CPU de voxrt, de modo que las diferencias observadas provienen del computo en media precision y no de los pesos.

## Capacidades

- Reconocimiento de voz multilingue en 25 idiomas europeos (incluidos espanol, aleman, frances, italiano, portugues, neerlandes, polaco, ruso y ucraniano).
- Transcripcion de audio largo: la ruta de referencia reporta resultados en TED-LIUM 3 con 148 minutos de audio, con el VAD de voxrt segmentando la entrada.
- Ejecucion integra en el dispositivo sobre Apple Neural Engine, sin envio de audio a servicios externos.
- Procesamiento mas rapido que el tiempo real en todos los tamanos de ventana medidos en un M4 Max (de 168x a 171x sobre tiempo real en las pruebas cortas).
- Ejecucion en iOS (18 o superior) y macOS (15 o superior).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio de salida, tool calling ni function calling: es exclusivamente un encoder de ASR.
- No se documentan en la informacion disponible marcas de tiempo a nivel de palabra, diarizacion de hablantes ni deteccion de idioma automatica.

## Casos de uso

- Transcripcion privada en escritorio Mac: el encoder se ejecuta en la Neural Engine y el resto del pipeline en el proceso local de voxrt, de modo que el audio nunca abandona el equipo, algo relevante para material medico, legal o periodistico.
- Dictado y notas de voz en aplicaciones iOS: al no requerir GPU en segundo plano (iOS no lo permite), la ruta Neural Engine es la adecuada para captura continua en segundo plano con ventanas de 64 frames (≈ 5 s) y 8,7 ms de latencia por ventana en un M4 Max.
- Subtitulado de contenido largo: con ventanas de hasta 768 frames (≈ 61 s) y 110x sobre tiempo real en TED-LIUM 3 long-form, es viable generar subtitulos de una conferencia de una hora en pocos minutos.
- Analisis de reuniones y actas: combinado con el VAD de voxrt para segmentar turnos de habla y transcribir actas multilingues en entornos con participantes de distintos paises europeos.
- Accesibilidad en tiempo real: transcripcion en vivo de conversaciones presenciales en un Mac o iPad, con latencia de decenas de milisegundos por ventana sobre el encoder.
- Investigacion sobre cuantizacion extrema: sirve como caso de estudio reproducible de pesos ternarios en 2 bits desplegados en una NPU comercial, con comparativa de WER y velocidad entre Neural Engine, GPU y CPU.
- Integracion en herramientas nativas de escritorio: mediante los bindings de Swift y C de voxrt, se puede incrustar transcripcion en aplicaciones macOS existentes sin dependencias de red.
- Preprocesado de corpus de audio en investigacion: transcripcion masiva de grabaciones en cualquiera de los 25 idiomas soportados aprovechando el throughput de 79x a 202x sobre tiempo real segun el backend.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, medidos con voxrt sobre un M4 Max. El WER se calcula con el normalizador del Open ASR Leaderboard; la velocidad es cociente entre audio total y tiempo de procesamiento, excluida la carga del modelo.

| Conjunto | Neural Engine (este modelo) | GPU de voxrt | CPU de voxrt |
|---|---:|---:|---:|
| LibriSpeech test-clean, 2.620 enunciados | 1,96 % WER · 168x | 1,96 % WER · 197x | 1,95 % WER · 79x |
| TED-LIUM 3 long-form, 148 min | 2,53 % WER · 110x | 2,54 % WER · 174x | 2,55 % WER · 92x |
| LibriSpeech dev-clean, 50 clips cortos | 1,78 % WER · 171x | 1,78 % WER · 202x | 1,68 % WER · 72x |

Latencia del encoder en caliente, en un M4 Max: 8,7 ms por ventana de 64 frames (≈ 5 s de audio), 23 ms a 128 frames, 42 ms a 192 frames, 70 ms a 256 frames y 119 ms a 384 frames. La similitud coseno de la salida del encoder frente a la ruta f32 en CPU de voxrt es de aproximadamente 0,9999. No hay resultados de benchmarks independientes en la informacion proporcionada.

## Requisitos de hardware

- Hardware objetivo: Apple silicon con Neural Engine (serie M en Mac y chips A/M en iPhone y iPad). No hay soporte para GPU de otros fabricantes ni para CUDA.
- Sistema operativo: macOS 15 o superior, o iOS 18 o superior.
- Memoria: no se especifica un requisito de RAM o VRAM unificada; el peso del encoder es de 304 MB y se ejecuta en la Neural Engine, no en la GPU.
- Compilacion en el primer uso: aproximadamente 4,7 minutos para los siete buckets en un M4 Max; Core ML cachea el resultado y las cargas posteriores bajan a unos 3 s por bucket (≈ 20 s para los siete). `VOXRT_ANE_MAX_FRAMES` limita los buckets que se cargan y se envian a la Neural Engine.
- Alternativa en GPU: la ruta Metal de voxrt no usa este repositorio y decodifica los mismos pesos de 2 bits directamente desde `model.safetensors`. En equipos con GPU grande (40 nucleos en un M4 Max) esa ruta es mas rapida con entradas de mas de unos 5 segundos; la Neural Engine conviene en chips con GPU pequena y en iOS.
- Despliegue: exclusivamente a traves de voxrt (paquete de Python, CLI y bindings de Swift y C). No hay integracion documentada con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un encoder de ASR en Core ML.
- Latencia y throughput: los indicados en la seccion de benchmarks, medidos por el autor en un M4 Max.

## Comparativa con modelos similares

No se dispone de cifras comparativas verificadas frente a otras familias de ASR multilingue (por ejemplo Whisper) en la informacion proporcionada. La comparacion posible dentro de la misma cadena de modelos es la siguiente:

| Modelo | Parametros | Ventana / contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `MaksL/voxrt-parakeet-redux-coreml` (este) | No disponible el desglose del encoder; 304 MB compilado | 64-768 frames (≈ 5-61 s) por invocacion | 25 europeos | CC-BY-4.0 | Core ML compilado + JSON |
| `moondream/parakeet-redux` | 0,6 B (modelo completo) | No disponible | 25 europeos | CC-BY-4.0 | safetensors |
| `nvidia/parakeet-tdt-0.6b-v3` | 0,6 B | No disponible | 25 europeos | CC-BY-4.0 | safetensors |

Frente a las dos alternativas, este repositorio no anade calidad de reconocimiento: aporta exclusivamente el artefacto Core ML y el camino de ejecucion en Neural Engine. Los tres comparten licencia CC-BY-4.0 y el mismo linaje de pesos.

## Limitaciones y advertencias

- No es un modelo autonomo: necesita el runtime voxrt para el frontend mel, el subsampling, el decodificador TDT y el VAD. Usar `encoder.mlmodelc` de forma aislada no produce transcripciones.
- Dependencia de plataforma: exige macOS 15 o iOS 18 y hardware Apple con Neural Engine. No hay ruta para Windows, Linux, Android ni GPU discretas.
- El computo en fp16 introduce desviaciones pequenas frente a la ruta f32 (coseno ≈ 0,9999), con diferencias de WER de hasta 0,28 puntos en el conjunto dev-clean entre backends.
- Cobertura linguistica limitada a 25 idiomas europeos; no se documenta soporte para otras lenguas ni cambio automatico de idioma.
- Ventana maxima de 768 frames (≈ 61 s) por invocacion del encoder; el audio mas largo depende del troceado y del VAD de voxrt, lo que puede degradar la coherencia en los limites de segmento.
- Riesgo de error de transcripcion en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario muy especifico (terminologia medica, juridica o nombres propios), inherente a cualquier sistema ASR.
- No se documentan sesgos concretos ni evaluaciones por subgrupo, variedad dialectal o genero; tampoco hay evaluacion independiente.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir a NVIDIA y a M87 Labs (Moondream) y a mantener la indicacion de licencia; la conversion a Core ML la realiza voxrt.
- Madurez baja en el momento de la consulta: el repositorio registra 0 descargas y 1 like, con publicacion y ultima actualizacion el 10 de octubre de 2026.
- Las cifras de WER y velocidad proceden del propio autor y de una unica maquina (M4 Max); no hay replicacion por terceros en la informacion disponible.
- No dispone de marcas de tiempo por palabra, diarizacion ni puntuacion documentadas, lo que limita su uso directo en subtitulado profesional sin postprocesado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MaksL/voxrt-parakeet-redux-coreml
- Modelo base ternario: https://huggingface.co/moondream/parakeet-redux
- Modelo NVIDIA original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime voxrt (Rust, Python, CLI, bindings de Swift y C): https://github.com/lmaksym/voxrt
- Script de conversion a Core ML: `tools/coreml/convert_encoder.py` dentro del repositorio de voxrt
- Open ASR Leaderboard (normalizador de WER empleado en las mediciones): https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces obtenidos correspondian a herramientas de busqueda visual de Microsoft, sin relacion con el contenido de la ficha.

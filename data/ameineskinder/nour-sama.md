# AmeinEskinder/nour-sama

## Resumen

Nour-Sama v1.2.0 es un modelo de reconocimiento automatico del habla (ASR) especializado en fonemas coranicos (`tj3`) y verificacion de reglas de Tajweed, desarrollado por AmeinEskinder y distribuido bajo la licencia Quran-Lab NPL-1.2. Se trata de una red Squeezeformer con U-Net temporal (Kim et al., NeurIPS 2022) que opera en dos modos: streaming causal con ventanas de 320 ms y modo bidireccional de utterance completa. El modelo esta disenado especificamente para audio de recitacion del Coran en dialecto Hafs, con capacidad de medir la duracion de la Madd normalizada por velocidad de habla a resolucion de 20 ms.

El modelo se distribuye exclusivamente en formato ONNX (INT8 y FP32), con un tamano de 50,39 MB en INT8, y esta pensado para ejecutarse en CPU sin clave de API externa. Incorpora 11 cabezas de salida (frente a las 12 de versiones anteriores) y un fichero `calibration.json` nativo con tablas de verosimilitud calibradas por hablante, temperaturas por cabeza y pesos de fusion Pareto-optimos. Su relevancia actual radica en que ofrece una alternativa abierta y ligera a TajweedFormer V4, que requiere acceso al SDK propietario de Quran Lab.

El modelo se ha destilado inicialmente desde TajweedFormer V4 mediante su SDK C publico y se ha refinado sobre audio de estudio limpio multi-recitador, anotaciones humanas de fonetica y sifat, y grabaciones de aprendices. Esta orientado a un unico idioma (arabe) y a un dominio muy especifico, por lo que no debe confundirse con un ASR generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Temporal U-Net Squeezeformer (dual-mode: streaming causal 320 ms + bidireccional full-utterance) |
| Parametros totales | 47,96 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de streaming de 320 ms; modo full-utterance sin limite especificado) |
| Tipos de cuantizacion | INT8 y FP32 (grafos ONNX) |
| Idiomas soportados | arabe (recitacion coranica, Hafs) |
| Licencia | Quran-Lab NPL-1.2 (No-Profit, Share-Alike) |
| Formato de pesos | ONNX (`nour_sama_v1.2.int8.onnx`, grafo FP32 de 183,57 MB) |
| Cabezas de salida | 11 (fonemas `tj3`, `timing_log_probs`, `boundary`, `log_probs`, `inter1_log_probs`, entre otras) |
| Resolucion temporal | 20 ms para timing y boundary |
| Tamano en disco | 50,39 MB (INT8) / 183,57 MB (FP32) |
| Dependencia de API externa | ninguna |

## Arquitectura y entrenamiento

Nour-Sama emplea una arquitectura Squeezeformer con U-Net temporal, tal como se describe en Kim et al. (NeurIPS 2022). El modelo soporta dos modos de inferencia: un modo streaming causal con ventanas de 320 ms (`c16_l64`) y un modo bidireccional de utterance completa (`full`). La salida se organiza en 11 cabezas: reconocimiento de fonemas `tj3`, probabilidades de timing (`timing_log_probs`) y fronteras (`boundary`) a 20 ms, probabilidades de log (`log_probs`), `inter1_log_probs` y otras cabezas auxiliares. La version 1.2.0 elimino la proyeccion de la cabeza `inter4_log_probs` del grafo ONNX exportado y habilita la ejecucion selectiva de subgrafos en `NourSamaEngine`.

El entrenamiento parte de una destilacion desde TajweedFormer V4 (`v4.0.0`) mediante su SDK C publico, seguida de un refinamiento en tres etapas. La etapa 3 combina un 50% de audio de estudio limpio multi-recitador Hafs (sin fuga de datos), un 30% de desviaciones foneticas y de sifat humanas reales y un 20% de mezcla limpia de microfono de telefono, con un ancla de autodestilacion de timing de peso 0,25. Los datasets citados son `tarteel-ai/everyayah`, `obadx/muaalem-annotated-v3`, `nour-world/tlog-clean-sf16k`, `Quran-Lab/quranic-asr-benchmark` y `Quran-Lab/quran-tajweed-benchmark`. El modelo incorpora un decodificador HSMM monotonico para Madd normalizado por velocidad de habla a 20 ms, que estima `haraka_ms` local por utterance a partir de las vocales cortas realizadas (`a`, `i`, `u`) sobre `timing_log_probs` y `boundary`, suavizando el parpadeo de frontera de 1 frame sin parametros adicionales. No se especifica el numero total de tokens de entrenamiento ni si se empleo RLHF o DPO.

## Capacidades

- Reconocimiento de fonemas coranicos (`tj3`) sobre audio de recitacion en arabe (Hafs).
- Medicion de duracion de Madd normalizada por velocidad de habla a resolucion de 20 ms.
- Verificacion calibrada de reglas de Tajweed mediante cabezas de clasificacion con calibracion nativa.
- Deteccion de errores de recitacion (foneticos y de timing) con puntuacion `checker` calibrada.
- Modo streaming causal con ventanas de 320 ms para inferencia de baja latencia.
- Modo bidireccional de utterance completa para maxima precision.
- Ejecucion en CPU sin clave de API (formato ONNX INT8/FP32).
- Salida multi-cabeza con probabilidades calibradas por hablante (`calibration.json`).
- No soporta tool calling, function calling, agentes, vision, audio general ni razonamiento multi-paso; es un modelo puramente acustico-fonetico.

## Casos de uso

- Verificacion de recitacion en aplicaciones de aprendizaje del Coran: el modelo compara la recitacion del usuario contra el texto canonico y devuelve puntuaciones de error fonetico y de timing, gracias a sus cabezas calibradas y a la medicion de Madd a 20 ms.
- Correccion de Tajweed en tiempo real: el modo streaming de 320 ms permite alertar al recitador sobre errores de duracion o de articulacion mientras recita, sin esperar al final de la utterance.
- Evaluacion automatizada de aprendices: con el modo `full` y el conjunto de calibracion nativo, se pueden generar informes de progreso por fonema y por regla de Tajweed a partir de grabaciones de telefono (`tlog-clean-sf16k`).
- Despliegue en dispositivos de bajo consumo: al ser ONNX INT8 de 50,39 MB y con RTF de 0,0457x en CPU monohilo, cabe en moviles, Raspberry Pi o navegador via ONNX Runtime Web para apps de practica offline.
- Investigacion en fonetica arabe y Tajweed: las salidas `timing_log_probs` y `boundary` a 20 ms permiten analisis cuantitativo de duraciones de Madd y de fronteras de segmentos, util para corpus linguisticos.
- Herramientas de control de calidad para editores de audio coranico: deteccion automatica de errores en grabaciones de estudio multi-recitador antes de publicacion, usando el modo `full` con PER de estudio del 0,1%.
- Integracion en plataformas de memorizacion (Hifz): el modelo puede puntuar recitaciones parciales y detectar omisiones o sustituciones de fonemas, con supresion de falsas alarmas mediante el gating por `conf`.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el benchmark publico de 600 clips `Quran-Lab/quranic-asr-benchmark` (sin solapamiento con entrenamiento) y sobre la suite local held-out del autor. Intervalos de confianza bootstrap pareados al 95% con B = 2.000.

| Sistema / modo | Parametros | Tamano | RTF CPU 1 hilo | Checker held-out (IC 95%) | `left_alone` estudio/telefono | PER estudio/telefono | WER / CER 600 clips (IC 95%) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nour-Sama `full` INT8 | 47,96 M | 50,39 MB | 0,0457x | 65,22 [62,37; 68,11] | 96,0% / 86,0% | 0,1% / 0,42% | 12,29% / 5,71% [10,98; 13,66] |
| Nour-Sama `full` FP32 | 47,96 M | 183,57 MB | 0,044x | 65,62 [62,82; 68,56] | 96,0% / 86,5% | 0,1% / 0,41% | 12,26% / 5,71% |
| Nour-Sama `c16_l64` 320 ms INT8 | 47,96 M | 50,39 MB | 0,2925x | 32,01 [28,66; 35,15] | 48,0% / 29,5% | 1,91% / 3,23% | 23,67% / 9,76% |
| Nour-Sama `c16_l64` 320 ms FP32 | 47,96 M | 183,57 MB | 0,3036x | 31,38 [28,04; 34,53] | 46,5% / 29,0% | 1,94% / 3,24% | 23,98% / 9,81% |
| Nour-Sama v1.1.0 `full` INT8 (anterior) | 47,96 M | 50,41 MB | 0,296x | 60,49 | 86,0% / 76,5% | 0,20% / 0,63% | 13,57% / 6,15% |
| TajweedFormer V4 (suite local H2H) | no revelado | ~57 MB `.tfm` | C nativo | 57,6 | 99,5% / 81,5% | 0,02% / 0,62% | 9,22% / 3,91% |
| TajweedFormer V4 (board.json privado) | no revelado | ~57 MB `.tfm` | C nativo | 63,39 [57,72; 68,90] | 79,04% global | no disponible | no disponible |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para CPU. En INT8 ocupa 50,39 MB en disco y una huella de memoria en ejecucion del orden de decenas de MB.
- GPU recomendadas: no necesarias. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo via ONNX Runtime con proveedor CUDA, pero no aporta ventaja practica frente a CPU dado el tamano.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo e incluso en iGPU; el cuello de botella es la latencia de audio, no la memoria.
- Despliegue: ONNX Runtime (CPU, CUDA, TensorRT, Web), `NourSamaEngine` (ejecucion selectiva de subgrafos), navegador via ONNX Runtime Web. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo acustico ONNX).
- Latencia y throughput: RTF de 0,0457x en CPU monohilo en modo `full` INT8 (unas 22 veces mas rapido que tiempo real) y 0,2925x en modo streaming `c16_l64` INT8 (unas 3,4 veces mas rapido que tiempo real). El modo FP32 ofrece RTF practicamente identico (0,044x y 0,3036x).
- Demo interactiva en CPU disponible en Hugging Face Spaces.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Checker held-out | WER 600 clips | Licencia | Clave API externa | Formato |
|---|---|---:|---:|---:|---|---|---|
| Nour-Sama v1.2.0 `full` INT8 | 47,96 M | utterance completa | 65,22 | 12,29% | NPL-1.2 (no comercial) | No | ONNX |
| Nour-Sama v1.2.0 `c16_l64` INT8 | 47,96 M | 320 ms streaming | 32,01 | 23,67% | NPL-1.2 (no comercial) | No | ONNX |
| TajweedFormer V4 | no revelado | no disponible | 57,6 (local) / 63,39 (board) | 9,22% | NPL-1.2 | Si (`sdk.quranlab.ai`) | `.tfm` (C nativo) |
| Whisper (ASR generalista) | no disponible en esta ficha | 30 s tipico | no aplica (no Tajweed) | no disponible | MIT / Apache-2.0 | No | safetensors, GGUF, ONNX |

TajweedFormer V4 obtiene mejor WER (9,22% frente a 12,29%) y mejor PER de estudio (0,02% frente a 0,1%), pero requiere clave de API y SDK propietario. Nour-Sama gana en `checker` held-out (65,22 frente a 57,6 en la misma suite local) y en `left_alone` de telefono (86,0% frente a 81,5%). Whisper no es comparable en la tarea de Tajweed ni en fonemas `tj3`, aunque si en ASR generalista de arabe.

## Limitaciones y advertencias

- Licencia NPL-1.2 (No-Profit, Share-Alike): prohibido el uso comercial o el cobro por Nour-Sama o cualquier funcionalidad que lo alimente (secciones 2 y 7).
- Modelo monoidioma y monodominio: solo arabe de recitacion coranica en riwaya Hafs; no es un ASR generalista y su rendimiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion fonetica: al ser un modelo discriminativo de fonemas, puede producir segmentaciones erroneas en audio ruidoso o con recitadores no vistos; el gating por `conf` mitiga pero no elimina las falsas alarmas.
- El modo streaming `c16_l64` degrada notablemente la precision frente al modo `full` (checker 32,01 frente a 65,22; WER 23,67% frente a 12,29%), por lo que no es adecuado para evaluacion formal.
- Dependencia de la calibracion: los resultados `checker` dependen del `calibration.json` nativo; sustituirlo o reentrenarlo invalida las cifras reportadas.
- El modelo se destilo inicialmente de TajweedFormer V4, por lo que hereda posibles sesgos del modelo profesor y esta sujeto a las condiciones de la licencia NPL-1.2 en su vertiente Share-Alike.
- No se han publicado datos sobre sesgos por genero, edad o dialecto regional dentro del arabe, ni sobre robustez frente a ruido ambiental extremo.
- La evaluacion se realizo sobre benchmarks del propio ecosistema Quran-Lab; no hay validacion independiente por terceros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe aun validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmeinEskinder/nour-sama
- Demo interactiva en CPU (Hugging Face Space): https://huggingface.co/spaces/nour-world/nour-sama-demo
- Licencia (NPL-1.2): https://huggingface.co/AmeinEskinder/nour-sama/blob/main/LICENSE
- Pesos ONNX INT8: https://huggingface.co/AmeinEskinder/nour-sama/blob/main/nour_sama_v1.2.int8.onnx
- Dataset `tarteel-ai/everyayah`: https://huggingface.co/datasets/tarteel-ai/everyayah
- Dataset `obadx/muaalem-annotated-v3`: https://huggingface.co/datasets/obadx/muaalem-annotated-v3
- Dataset `nour-world/tlog-clean-sf16k`: https://huggingface.co/datasets/nour-world/tlog-clean-sf16k
- Benchmark `Quran-Lab/quranic-asr-benchmark`: https://huggingface.co/datasets/Quran-Lab/quranic-asr-benchmark
- Benchmark `Quran-Lab/quran-tajweed-benchmark`: https://huggingface.co/datasets/Quran-Lab/quran-tajweed-benchmark
- Paper Squeezeformer (Kim et al., NeurIPS 2022): no disponible como enlace directo en la informacion proporcionada
- SDK de TajweedFormer V4: https://sdk.quranlab.ai

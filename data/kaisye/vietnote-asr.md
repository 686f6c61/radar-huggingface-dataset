# Kaisye/vietnote-asr

## Resumen

VietNote ASR es un modelo de reconocimiento automatico del habla (ASR) en streaming disenado especificamente para vietnamita con salpicaduras de ingles (code-switching), desarrollado por Kaisye. A diferencia de los modelos ASR multilingues de gran tamano, VietNote ASR es un modelo compacto de 77,7 millones de parametros que puede ejecutarse en CPU en tiempo real, lo que lo hace adecuado para despliegues en dispositivos de gama baja, moviles y sistemas embebidos.

El modelo aborda un problema concreto: la mayoria de los sistemas ASR abiertos para vietnamita fallan cuando el hablante intercala palabras o frases en ingles, algo muy comun en contextos profesionales y tecnicos en Vietnam. VietNote ASR reconoce aproximadamente el 75% de las palabras en ingles dentro de discurso vietnamita, frente al 14-36% de otros modelos abiertos, y se situa a la par de APIs comerciales como Soniox (76%).

La arquitectura es un Zipformer2 causal de tamano M con transductor sin estado (stateless transducer), entrenado con icefall y exportado a ONNX para su uso con sherpa-onnx. El modelo se distribuye bajo licencia Apache-2.0 y esta disponible en variantes fp32 e int8, tanto en modo streaming como offline, con un modelo complementario de puntuacion y capitalizacion basado en XLM-RoBERTa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 causal (tamano M), transductor sin estado (stateless transducer), perdida RNN-T podada |
| Parametros totales | 77,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 640 ms de chunks (32 frames) con 128 frames de contexto izquierdo en streaming |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion por canal) |
| Idiomas soportados | vietnamita (vi), ingles (en) con code-switching vi-en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder, decoder, joiner); PyTorch (.pt) para fine-tuning |

## Arquitectura y entrenamiento

VietNote ASR emplea una arquitectura Zipformer2 causal de tamano M con un transductor sin estado y perdida RNN-T podada. El vocabulario es un modelo BPE de 6.144 tokens compartido entre vietnamita e ingles, lo que permite manejar el code-switching sin tokens especiales de cambio de idioma. La naturaleza causal del encoder y el diseno de transductor sin estado permiten la inferencia en streaming con chunks de 640 ms (32 frames) y 128 frames de contexto izquierdo, manteniendo una latencia baja y un consumo de memoria contenido.

El entrenamiento se realizo con el framework icefall sobre aproximadamente 1.500 horas de audio, durante 45 epocas, promediando 2 checkpoints. Los datos incluyen conjuntos publicos de habla vietnamita, datos de code-switching vietnamita-ingles recopilados especificamente, habla sintetica (TTS) y una porcion de datos no compartibles; parte de las etiquetas se generaron automaticamente. Los splits de entrenamiento de FLEURS y VIVOS estan incluidos, mientras que no se uso ninguna parte de VietMed ni GigaSpeech2 para el entrenamiento. Las etiquetas estan en minusculas y los numeros se escriben como palabras (normalizador 1.3 del repositorio de GitHub).

## Capacidades

- Reconocimiento de voz en streaming con chunks de 640 ms y contexto izquierdo de 128 frames, apto para subtitulado en vivo.
- Code-switching vietnamita-ingles: reconoce aproximadamente el 75% de las palabras en ingles dentro de discurso vietnamita.
- Reconocimiento offline de archivos completos (variantes `offline/fp32` y `offline/int8`), con aproximadamente 1 punto de mejora respecto a streaming.
- Generacion de texto en minusculas con numeros como palabras; el repositorio de GitHub incluye un modulo de ITN (inverse text normalization) que convierte los numeros a digitos y formatos como `1,5 ty`, `250.000`, `15/12` o `ty so 2-1`.
- Modelo complementario de puntuacion y capitalizacion basado en XLM-RoBERTa base exportado a ONNX, que restaura mayusculas y signos de puntuacion.
- Manejo de autocorrecciones del hablante ("ba… a khong, bon trieu" se convierte en 4 trieu).
- Soporte de hotwords a traves de sherpa-onnx para sesgar el reconocimiento hacia terminos concretos.
- Ejecucion en Linux, macOS, Windows, Android, iOS y Raspberry Pi mediante sherpa-onnx.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Subtitulado en vivo de reuniones y clases: el modelo procesa audio en chunks de 640 ms con contexto izquierdo de 128 frames, lo que permite generar subtitulos con latencia baja en tiempo real sobre CPU, sin necesidad de GPU.
- Transcripcion de reuniones tecnicas con terminologia en ingles: gracias a su capacidad de code-switching, reconoce terminos como "deploy", "pipeline" o "deadline" intercalados en discurso vietnamita, algo que los modelos abiertos genericos no capturan.
- Asistentes de voz en dispositivos moviles: la variante int8 (83 MB) se ejecuta en telefonos y CPUs pequenas mediante sherpa-onnx, habilitando dictado por voz y comandos en aplicaciones Android e iOS sin conexion a la nube.
- Transcripcion de entrevistas y podcasts: la variante offline (fp32 o int8) procesa archivos completos con una precision aproximadamente 1 punto superior a la streaming, adecuada para pipelines de post-produccion.
- Documentacion clinica en vietnamita: el modelo obtiene un 13,87% de SyER en el test zero-shot de VietMed, lo que lo hace viable para transcripcion de notas medicas donde se mezclan terminos vietnamitas e ingleses.
- Sistemas de atencion al cliente: integrado en un pipeline con el restaurador de puntuacion y capitalizacion, puede transcribir llamadas con formato legible y numeros normalizados (importes, fechas, telefonos) para su procesamiento posterior.
- Fine-tuning para dominios especificos: el checkpoint PyTorch (`pytorch/pretrained.pt`, 311 MB) y la receta de icefall permiten adaptar el modelo a vocabulario especializado o acentos concretos con datos propios.
- Despliegue en Raspberry Pi y sistemas embebidos: la combinacion de sherpa-onnx y la variante int8 permite reconocimiento de voz local en hardware de bajo consumo para kioscos, domotica o dispositivos industriales.

## Benchmarks y rendimiento

Resultados declarados por el autor (SyER, %, todos los sistemas re-ejecutados en la misma maquina y con el mismo normalizador de texto; la marca de estrella indica zero-shot para VietNote ASR):

| Sistema | Tipo | VietMed | GigaSpeech2 | FLEURS+VIVOS | Code-switching dev | Palabras en ingles |
|---|---|---|---|---|---|---|
| VietNote ASR | streaming | 13,87 | 10,65 | 6,88 | 9,62 | 75,5% |
| hynt Zipformer 30M streaming | streaming | 14,30 | 8,87 | 7,73 | 12,58 | 24,7% |
| Moonshine streaming tiny vi | streaming | 19,74 | 14,38 | 10,50 | 22,10 | 20,8% |
| hynt Zipformer 150M | offline | 11,90 | 7,20 | 5,14 | 10,81 | 35,5% |
| hynt Zipformer 30M | offline | 12,93 | 7,40 | 6,06 | 11,01 | 28,9% |
| VietASR Zipformer 70k h | offline | 14,19 | 6,75 | 7,50 | 13,22 | 14,3% |
| PhoWhisper large | offline | 16,74 | no disponible | 6,03 | 16,31 | 30,8% |
| Whisper large-v3 | offline | 36,64 | no disponible | 8,08 | 15,21 | 67,8% |

Nota del autor: los modelos hynt fueron entrenados con VietMed_Labeled, Sub-GigaSpeech2-Vi y FLEURS segun sus model cards; VietNote ASR se entreno con los splits de entrenamiento de FLEURS y VIVOS, y el conjunto de desarrollo de code-switching proviene de las mismas fuentes que parte de los datos de entrenamiento, por lo que favorece a VietNote ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo esta disenado para ejecutarse en CPU.
- Variante streaming fp32: 274 MB en disco, recomendada para maxima precision en tiempo real (la que ejecuta la demo web).
- Variante streaming int8: 83 MB en disco, para telefonos y CPUs pequenas.
- Variante offline fp32: 279 MB; variante offline int8: 88 MB.
- Modelo de puntuacion y capitalizacion: 1,1 GB (XLM-RoBERTa base, ONNX).
- GPU recomendadas: no aplica; el modelo no esta pensado para GPU. Cualquier CPU moderna es suficiente.
- Cabe en GPU consumer: si, pero no es su proposito; el despliegue objetivo es CPU.
- Opciones de despliegue: sherpa-onnx (Linux, macOS, Windows, Android, iOS, Raspberry Pi); el checkpoint PyTorch se puede usar con icefall para fine-tuning.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la informacion disponible; el modelo procesa chunks de 640 ms en streaming con `num_threads=2` y `modified_beam_search` con `max_active_paths=4` como configuracion de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / streaming | Code-switching (palabras en ingles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VietNote ASR | 77,7 M | Zipformer2 transducer | Streaming, chunks de 640 ms | 75,5% | Apache-2.0 | Hugging Face + GitHub |
| hynt Zipformer 30M streaming | 30 M | Zipformer transducer | Streaming | 24,7% | no disponible | Hugging Face |
| Moonshine streaming tiny vi | no disponible | no disponible | Streaming | 20,8% | no disponible | Hugging Face |
| PhoWhisper large | no disponible | Whisper | Offline | 30,8% | no disponible | Hugging Face |
| Whisper large-v3 | 1.550 M | Whisper | Offline | 67,8% | MIT | Hugging Face / OpenAI |

VietNote ASR destaca frente a los modelos abiertos de vietnamita por su capacidad de code-switching (75,5% frente a 14-36% de los modelos abiertos medidos) y por su rendimiento en streaming zero-shot en VietMed (13,87% SyER frente a 14,30% de hynt 30M streaming, que fue entrenado con VietMed). Frente a Whisper large-v3, VietNote ASR es mucho mas pequeno (77,7 M frente a 1.550 M), funciona en CPU y en streaming, y obtiene mejor SyER en VietMed (13,87 frente a 36,64), aunque Whisper large-v3 reconoce un porcentaje ligeramente inferior de palabras en ingles (67,8% frente a 75,5%) y es un modelo offline.

## Limitaciones y advertencias

- La model card esta truncada en la seccion de limitaciones; no se dispone del texto completo de las advertencias del autor.
- El conjunto de desarrollo de code-switching proviene de las mismas fuentes que parte de los datos de entrenamiento, por lo que los resultados en esa columna favorecen a VietNote ASR y no deben interpretarse como una evaluacion completamente independiente.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- El modelo esta especializado en vietnamita con code-switching a ingles; no es un modelo multilingue general y su rendimiento en otros idiomas no esta documentado.
- La cuantizacion int8 por tensor con configuracion por defecto hace que el modelo deje de emitir texto tras unos segundos; es necesario usar la cuantizacion por canal con el script `scripts/quantize_int8.py` del repositorio de GitHub.
- El modelo genera texto en minusculas con numeros como palabras; para obtener digitos, puntuacion y mayusculas es necesario aplicar el modulo de ITN y el modelo de puntuacion complementario.
- Riesgo de alucinacion y sesgos: no se han publicado analisis especificos en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion, sin restricciones adicionales conocidas.
- El rendimiento puede degradarse en acentos no representados en los datos de entrenamiento (FLEURS, VIVOS y datos propios); no se han publicado resultados por acento en la informacion disponible (el autor remite a `BENCHMARK.md` para resultados por acento).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaisye/vietnote-asr
- Repositorio GitHub (codigo, ITN, demo, receta de fine-tuning): https://github.com/kaisye/vietnote-asr
- Demo en vivo: https://asr.vietnote.vn
- Guia de fine-tuning: https://github.com/kaisye/vietnote-asr/blob/main/docs/FINETUNE.md
- Benchmarks completos: https://github.com/kaisye/vietnote-asr/blob/main/docs/BENCHMARK.md
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- icefall: https://github.com/k2-fsa/icefall
- Dataset VietMed: https://huggingface.co/datasets/leduckhai/VietMed
- Dataset GigaSpeech2: https://huggingface.co/datasets/speechcolab/gigaspeech2
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs

# ekhodzitsky/parakeet-tdt-0.6b-v3-onnx-weights-only-int8

## Resumen

Este repositorio contiene una re-cuantización INT8 de solo pesos (`weights-only`) del export ONNX del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA. El autor es `ekhodzitsky`, dentro del proyecto [polyvoice](https://github.com/ekhodzitsky/polyvoice), y parte del export ONNX de la comunidad publicado por `istupakov`. No se trata de un modelo entrenado desde cero, sino de una optimización determinista del encoder para reducir su tamaño sin degradar la transcripción.

El problema que resuelve es concreto: el export INT8 dinámico estándar descarta de forma silenciosa fragmentos de habla de varios segundos en audio de reuniones captado en campo lejano (*far-field*). Este export cuantiza únicamente los pesos y mantiene todas las activaciones en FP32, lo que elimina ese modo de fallo. El resultado es un encoder de 669 MB frente a los 2,55 GB del FP32, con una calidad de transcripción a nivel de palabra prácticamente idéntica.

Es relevante ahora porque permite ejecutar ASR de alta calidad con *timestamps* a nivel de palabra directamente en CPU, dentro de cascadas de diarización de hablantes («quién dijo qué») donde el consumo de memoria y el tamaño del modelo son restrictivos. El total del repositorio ocupa 0,7 GB y el modelo base tiene del orden de 0,6 mil millones de parámetros, según indica el propio nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer) con encoder y decoder/joint separados, exportado a ONNX. Modelo base: NVIDIA Parakeet TDT 0.6B v3 |
| Parametros totales | ~0,6 mil millones (0.6B, segun el nombre del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR; procesa audio, no texto con ventana de contexto) |
| Tipos de cuantizacion | INT8 en los pesos del encoder: MatMul con `MatMulNBits` blockwise (bloques de 128, simetrico); Conv con `DequantizeLinear` int8 por canal de salida. `decoder_joint` en FP32 sin cambios. Activaciones en FP32 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.int8.onnx` + `.onnx.data`, `decoder_joint-model.onnx`, `vocab.txt`) |

Ficheros y tamanos exactos:

| Fichero | Tamano (bytes) | Notas |
|---|---:|---|
| `encoder-model.int8.onnx` + `.onnx.data` | 668 822 698 | Encoder cuantizado INT8 solo en pesos; activaciones FP32 |
| `decoder_joint-model.onnx` | 72 520 893 | FP32, sin cambios |
| `vocab.txt` | 93 939 | Sin cambios |
| Total | 741 437 530 | Sumas SHA256 disponibles en `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT (Token-and-Duration Transducer) de NVIDIA, con un encoder independiente y un modulo `decoder_joint` que incorpora un predictor de duracion TDT. Este repositorio no entrena el modelo: aplica una re-cuantizacion post-entrenamiento determinista sobre el export FP32. El script `quantize-parakeet-encoder.py` reproduce el proceso en aproximadamente un minuto con un pico de ~3,2 GiB de RAM.

La innovacion tecnica esta en la estrategia de cuantizacion. En lugar de cuantizar pesos y activaciones (INT8 dinamico), se cuantizan solo los pesos del encoder y se conservan las activaciones en FP32. Los pesos de las operaciones MatMul se cuantizan con `MatMulNBits` en bloques de 128 y de forma simetrica; los pesos de las convoluciones usan `DequantizeLinear` int8 por canal de salida. El `decoder_joint` se deja intacto en FP32 de forma deliberada, porque un decoder INT8 perturba de forma medible el predictor de duracion TDT. Esta decision es la que evita la perdida de tramos de habla observada en el export INT8 dinamico estandar.

No se documenta en la informacion proporcionada ningun dato sobre el corpus de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO), ya que es un artefacto de cuantizacion y no un modelo entrenado.

## Capacidades

- Reconocimiento automatico del habla (ASR) a partir de audio, con salida de texto.
- Generacion de *timestamps* a nivel de palabra alineados. En la medicion reportada, los timestamps alineados coinciden con el FP32 dentro de 0,00 s p95.
- Integracion en cascadas de diarizacion de hablantes («quien dijo que») a traves del proyecto polyvoice.
- Ejecucion en CPU gracias a la cuantizacion INT8 solo en pesos.
- Salida en formatos estructurados como JSON mediante la CLI `polyvoice-transcribe ... --format json`.
- No se documentan en la informacion disponible capacidades de traduccion, resumen, vision, audio aparte del ASR, ni *tool calling* o comportamiento de agente, ya que no es un modelo de lenguaje generativo.

## Casos de uso

- Transcripcion de reuniones en campo lejano: el modelo procesa audio de reuniones (ficheros AMI en las pruebas) sin el fallo de descarte de tramos de varios segundos que presenta el INT8 dinamico, lo que lo hace adecuado para actas y notas automaticas donde no puede faltar texto.
- Diarizacion con atribucion de hablante: combinado con la cascada polyvoice (diarizacion + ASR), permite generar transcripciones «quien dijo que» con marcas temporales por palabra, utiles para subtitulado y analisis de reuniones.
- Servicio de ASR en CPU sin GPU: con un pico de 5,50 GiB de RSS y 11,66x tiempo real en un Ryzen AI 9 HX 370, puede desplegarse en servidores sin acelerador dedicado o en estaciones de trabajo.
- Preprocesado de audio para pipelines de datos: al ejecutarse en CPU, permite generar transcripciones y alineaciones a granel sobre grandes volumenes de audio sin consumir VRAM.
- Aplicaciones de subtitulado con tiempos por palabra: los timestamps de nivel de palabra y su coincidencia con FP32 permiten sincronizar subtitulos con precision de frase.
- Despliegue en el borde (*edge*) o en contenedores ligeros: el encoder de 669 MB y el total de 0,7 GB reducen los requisitos de disco y memoria respecto al export FP32 de 2,55 GB solo para el encoder.
- Integracion en aplicaciones Rust o C++: es compatible con las builds del crate `ort` usadas por polyvoice-asr / parakeet-rs y con sherpa-onnx >= 1.12.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, etc.) en la informacion disponible. La model card si reporta mediciones de paridad de calidad y de rendimiento frente al export FP32, sobre un fixture fijo de 5 ficheros (3 de VoxConverse-test + 2 reuniones AMI, 5 472,5 s de audio, jobs=1, Ryzen AI 9 HX 370):

| Metrica | INT8 solo pesos | FP32 (referencia) |
|---|---:|---:|
| Palabras distintas frente a FP32 | 2 / 13 312 (0,015 %) | referencia |
| Coincidencia de timestamps alineados | 0,00 s p95 | referencia |
| Velocidad | 11,66x tiempo real | 11,94x tiempo real |
| Pico de RSS | 5,50 GiB | 7,07 GiB |
| Tamano del encoder | 669 MB | 2,55 GB |

Las dos unicas palabras divergentes son un par de frontera en la costura final de una reunion («Okay», entre 2 280,2 y 2 284,8 s, mas el punto de frase). No se observaron tramos descartados ni corrompidos en el resto del fixture. El protocolo completo y las mediciones por variante (INT8 dinamico, INT8 estatico calibrado, int4 RTN, decoder INT8) estan en `BENCHMARKS.md`.

## Requisitos de hardware

- Inferencia en CPU. Requiere ONNX Runtime >= 1.22 en CPU (kernels `MatMulNBits` int8), lo que incluye las builds del crate `ort` usadas por polyvoice-asr / parakeet-rs, y sherpa-onnx >= 1.12. La seccion de reproduccion menciona `onnxruntime>=1.30`.
- Memoria: pico de RSS medido de 5,50 GiB con el encoder INT8 (frente a 7,07 GiB con FP32).
- Almacenamiento: 741 437 530 B totales (~0,7 GB).
- Velocidad medida: 11,66x tiempo real en un AMD Ryzen AI 9 HX 370 con jobs=1.
- No se documentan requisitos de VRAM ni GPU recomendadas, ya que la medicion proporcionada es de CPU. El uso de GPU no esta descrito en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (CPU), sherpa-onnx >= 1.12, y la herramienta `polyvoice-transcribe` del proyecto polyvoice. vLLM, llama.cpp, Ollama y TGI no aplican a este formato/modelo.
- Latencia y throughput por GPU: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparacion posible es entre las variantes del mismo modelo, segun los datos de la model card:

| Variante | Tamano del encoder | Calidad / notas | Pico de RSS |
|---|---|---|---|
| Este export (INT8 solo pesos) | 669 MB | 2/13 312 palabras distintas frente a FP32; timestamps 0,00 s p95 | 5,50 GiB |
| Export FP32 (istupakov) | 2,55 GB | Referencia | 7,07 GiB |
| INT8 dinamico estandar | no disponible en detalle | Descarta de forma silenciosa tramos de habla de varios segundos en audio far-field | no disponible |

Se mencionan tambien variantes INT8 estatico calibrado e int4 RTN y un decoder INT8 en `BENCHMARKS.md`, pero sus cifras no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- El `decoder_joint-model.onnx` debe mantenerse en FP32. Sustituirlo por una version INT8 perturba de forma medible el predictor de duracion TDT.
- No deben colocarse a la vez el encoder INT8 y el FP32 en el mismo directorio: el cargador da prioridad silenciosa al FP32, lo que anula el ahorro de memoria.
- Requiere una version de ONNX Runtime con kernels `MatMulNBits` int8 (>= 1.22 en CPU); versiones anteriores no ejecutaran correctamente el encoder.
- Las mediciones de rendimiento y calidad proceden de un unico fixture de 5 ficheros y un unico equipo (Ryzen AI 9 HX 370, jobs=1); no hay garantia de que se generalicen a otros dominios de audio o hardware.
- Se observa al menos una divergencia de frontera de palabra en el fixture analizado, por lo que en produccion conviene validar con audio propio.
- Idiomas soportados: no disponible en la informacion proporcionada; no se puede asumir cobertura multilingue sin verificacion.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion proporcionada para este artefacto de cuantizacion.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a mantener la atribucion al redistribuir. La cadena de atribucion incluye a NVIDIA (modelo original), `istupakov` (export ONNX) y polyvoice (re-cuantizacion INT8). El script de cuantizacion es MIT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ekhodzitsky/parakeet-tdt-0.6b-v3-onnx-weights-only-int8
- Export ONNX FP32 de la comunidad (istupakov): https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Proyecto polyvoice: https://github.com/ekhodzitsky/polyvoice
- Protocolo y mediciones por variante: https://github.com/ekhodzitsky/polyvoice/blob/main/docs/BENCHMARKS.md
- Script de cuantizacion: https://github.com/ekhodzitsky/polyvoice/blob/main/scripts/quantize-parakeet-encoder.py
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/

Nota: la busqueda web asociada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card.

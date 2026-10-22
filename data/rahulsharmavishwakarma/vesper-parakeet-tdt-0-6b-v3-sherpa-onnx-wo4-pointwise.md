# rahulsharmavishwakarma/vesper-parakeet-tdt-0.6b-v3-sherpa-onnx-wo4-pointwise

## Resumen

Este repositorio contiene una cuantización de pesos a 4 bits del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA, exportado a ONNX para su uso con el runtime sherpa-onnx. No es un modelo entrenado desde cero ni un ajuste fino: es un artefacto de compresión derivado del export FP32 oficial de sherpa-onnx (`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3`, revisión `1a468a35`), preparado por el desarrollador independiente rahulsharmavishwakarma para su aplicación de dictado Vesper.

La aportación técnica concreta frente a la build de 4 bits convencional es que reescribe 48 de las 50 convoluciones pointwise (1x1) del encoder como secuencias `Transpose -> MatMul -> Transpose`, de modo que sus pesos también se cuantizan. En el export estándar esas convoluciones quedan en FP32 y suman 303 MB; tras la reescritura, el encoder pasa de 679,4 MB a 424,6 MB sin reentrenamiento, con una diferencia máxima de 5e-7 frente al grafo FP32 original en una entrada de prueba.

El interés práctico es acotado pero real: demuestra que es posible reducir aproximadamente un 37% el tamaño del encoder de un transductor ASR de 0,6 mil millones de parámetros manteniendo la tasa de error dentro del ruido estadístico. El autor lo etiqueta explícitamente como *research build*: no lo usa su propia aplicación y no ha superado la cualificación completa del *held-out* (ruido, voz baja, alemán y otros canales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) con encoder FastConformer, exportado a ONNX en tres grafos (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`) |
| Parametros totales | 0,6 mil millones (600M), segun el identificador del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de tokens; la evaluacion publicada usa clips de 4 a 20 s. No se midio audio largo |
| Tipos de cuantizacion | Solo pesos a 4 bits (ONNX Runtime `MatMulNBits`, bloque de 32, simetrico); activaciones en FP32. Existe export FP32 y build de 4 bits simple del mismo modelo base |
| Idiomas soportados | El modelo base `nvidia/parakeet-tdt-0.6b-v3` es multilingue segun NVIDIA; esta build solo se evaluo en ingles (FLEURS en-US). Otros idiomas: no medidos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder.onnx` 424.616.107 B, `decoder.onnx` 47.233.762 B, `joiner.onnx` 3.984.870 B) mas `tokens.txt` (93.939 B) |

## Arquitectura y entrenamiento

El modelo subyacente es un transductor TDT, una variante de RNN-Transducer en la que el predictor emite conjuntamente un token y una duracion, lo que reduce el numero de pasos de decodificacion frente a un transductor clasico. El encoder sigue la familia FastConformer de NVIDIA NeMo, con atencion por bloques y convoluciones depthwise, y se exporta a ONNX junto con el predictor (`decoder.onnx`) y la red conjunta (`joiner.onnx`) que produce la distribucion sobre el vocabulario y las duraciones.

No hubo entrenamiento ni ajuste fino en este repositorio: la unica transformacion es de grafo y de cuantizacion. El proceso reescribe 48 de las 50 convoluciones pointwise como `Transpose -> MatMul -> Transpose` (las dos restantes no encajan en el patron de reescritura), verifica equivalencia funcional del grafo reescrito en FP32 y despues aplica la receta de cuantizacion de pesos a 4 bits. El decoder, el joiner y el fichero de tokens son byte a byte identicos a los de la build de 4 bits simple. El script de conversion y el proyecto `uv` bloqueado estan en la carpeta `reproduce/`, y dos ejecuciones produjeron ficheros identicos byte a byte. No se documento la composicion del dataset de entrenamiento original ni el uso de RLHF/DPO (no aplica en ASR). Como innovacion destacable, la reescritura de convoluciones 1x1 permite que `MatMulNBits` las alcance, algo que el cuantizador estandar de ONNX Runtime no hace.

## Capacidades

- Transcripcion de voz a texto (*speech-to-text*) en ingles para habla leida y limpia, con salida en minusculas y sin puntuacion en la configuracion evaluada.
- Decodificacion *greedy* mediante sherpa-onnx, con soporte de ejecucion multihilo (4 hilos en la medicion publicada).
- Reconocimiento *offline* por clip, no en streaming: el pipeline procesa el audio completo antes de emitir la transcripcion.
- Ejecucion en CPU sin GPU, lo que habilita despliegue en portatiles y dispositivos de borde.
- Compatibilidad con cualquier build de sherpa-onnx cuyo ONNX Runtime exponga el operador `MatMulNBits`.
- El modelo base declara cobertura multilingue (NVIDIA), pero esta build no ha sido validada en idiomas distintos del ingles.
- No dispone de *tool calling*, razonamiento multi-paso, vision, audio generation ni modo *thinking*: es exclusivamente un modelo ASR.

## Casos de uso

- **Dictado local en aplicaciones de escritorio**: es el escenario para el que se creo el artefacto, la app Vesper. El encoder de 424 MB y la decodificacion en CPU permiten integrar dictado sin conexion en un portatil, con una latencia mediana de 435 ms por clip de 4 a 20 s en un Apple M5 Pro.
- **Transcripcion por lotes de archivos de audio en servidores sin GPU**: al ser ONNX puro sobre CPU, se puede empaquetar en un contenedor y procesar colas de grabaciones con `sherpa-onnx` como dependencia, sin necesidad de CUDA ni de drivers propietarios.
- **Subtitulado de contenido en ingles con habla leida**: entrevistas, clases grabadas, pódcasts y webinars con locucion clara y poco ruido de fondo encajan en el perfil de datos con el que se midio el modelo (FLEURS en-US).
- **Prototipado e investigacion en compresion de modelos ASR**: el repositorio incluye el script de cuantizacion y el proyecto `uv` bloqueado, lo que lo convierte en una base reproducible para estudiar el efecto de cuantizar convoluciones 1x1 en transductores.
- **Transcripcion en dispositivos de recursos limitados**: 476 MB de pesos ONNX en total (encoder, decoder y joiner) permiten cargar el modelo en memoria en equipos con 2 GB de RAM disponibles, algo inviable para un export FP32 de 730 MB en el mismo margen.
- **Evaluacion comparativa de recetas de cuantizacion**: sirve como referencia para medir el compromiso entre tamano y WER frente a la build de 4 bits simple, ya que ambas comparten decoder, joiner y tokens identicos y solo difieren en el encoder.
- **Investigacion sobre deteccion de voz y pipelines de accesibilidad**: transcripcion en vivo de conversaciones presenciales en ingles, siempre que se asuma la falta de validacion en condiciones de ruido.

## Benchmarks y rendimiento

Evaluacion publicada por el autor: 100 clips de test de FLEURS en-US (`google/fleurs@70bb2e84`, primeras 100 frases unicas de 4 a 20 s), decodificacion *greedy* con sherpa-onnx 1.13.8 y 4 hilos, WER micro en minusculas y sin puntuacion sobre 2.166 palabras, *bootstrap* pareado por clip con 2.000 remuestreos. Hardware: Apple M5 Pro (macOS 27.0.1, CPU).

| Build | WER | Diferencia vs FP32 [IC 95%] | Mediana de decodificacion por clip |
|---|---:|---|---:|
| Export FP32 | 5,82% | — | 149 ms |
| 4 bits simple | 5,91% | +0,09 pts [−0,50, +0,73] | 381 ms |
| Esta build (4 bits + pointwise) | 5,77% | −0,05 pts [−0,72, +0,65] | 435 ms |

Las diferencias de WER quedan dentro del ruido para este conjunto (aproximadamente 1 a 3 palabras). En el Apple M5 Pro esta build decodifica un 14% mas lento que la de 4 bits simple; en una CPU AMD EPYC de Google Colab ambos encoders rindieron a velocidad similar.

| Build | Tamano del encoder | Decoder + joiner |
|---|---:|---:|
| 4 bits simple | 679.397.339 B | 51.218.632 B |
| Esta build | 424.616.107 B | 51.218.632 B |

No se han publicado resultados de benchmarks estandar (LibriSpeech, Common Voice, MLS) ni comparaciones con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada**: los pesos suman 475,8 MB (424,6 + 47,2 + 4,0 MB). Con activaciones FP32 y el runtime de ONNX, un presupuesto practico de 1 a 1,5 GB de memoria es razonable; no se publica una cifra oficial.
- **GPU**: no se requiere GPU. El autor midio exclusivamente en CPU (Apple M5 Pro y AMD EPYC). No hay datos de rendimiento en A100, H100 ni RTX 4090 para esta build.
- **GPU de consumo**: irrelevante para el caso de uso; el modelo esta pensado para ejecucion en CPU. Cualquier GPU consumer puede alojarlo por memoria, pero no se ha validado el backend CUDA con `MatMulNBits` en este artefacto.
- **Opciones de despliegue**: sherpa-onnx (Python wheel, C++, Kotlin, Swift) con un ONNX Runtime que exponga `MatMulNBits`; tambien es posible cargar los tres grafos directamente con la API de ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR transductor.
- **Latencia y throughput**: mediana de 149 ms (FP32), 381 ms (4 bits simple) y 435 ms (esta build) por clip de 4 a 20 s en Apple M5 Pro con 4 hilos. El autor advierte que la velocidad depende de la CPU y que debe medirse en el hardware objetivo.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar con otros modelos ASR de la misma categoria. La comparacion disponible es interna, entre variantes del mismo modelo base:

| Variante | Parametros | Contexto / entrada | WER FLEURS en-US | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (wo4 + pointwise) | 600M | clips de 4-20 s evaluados | 5,77% | CC-BY-4.0 | publica, 0 descargas |
| `vesper-...-wo4` (4 bits simple) | 600M | idem | 5,91% | CC-BY-4.0 | publica, es la build usada por la app |
| Export FP32 sherpa-onnx | 600M | idem | 5,82% | CC-BY-4.0 | publica |
| `nvidia/parakeet-tdt-0.6b-v3` (NeMo original) | 600M | idem | no disponible en esta informacion | CC-BY-4.0 | publica |

Frente a alternativas de la misma tarea como Whisper large-v3 o los modelos Parakeet v2, no se dispone de cifras comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Estado de investigacion**: el autor indica explicitamente que es una *research build*, que su aplicacion no la usa y que no ha pasado la cualificacion completa de *held-out* (ruido, voz baja, aleman y otros canales). No debe tratarse como sustituto de la build de produccion.
- **Cobertura limitada a ingles leido**: solo se midio habla leida en ingles. Ruido, voz baja, otros idiomas, audio largo, numeros y nombres propios no fueron evaluados.
- **Rendimiento dentro del ruido**: las diferencias de WER frente a FP32 no son estadisticamente significativas con 100 clips; el modelo no es "mejor" que FP32, es equivalente en esta muestra.
- **Coste en velocidad**: un 14% mas lento que la build de 4 bits simple en Apple M5 Pro, aunque practicamente igual en AMD EPYC. La penalizacion depende de la CPU.
- **Dependencia del runtime**: requiere un ONNX Runtime con soporte del operador `MatMulNBits`; builds antiguas de sherpa-onnx o de ONNX Runtime fallaran al cargar el grafo.
- **Alucinacion y errores de sustitucion**: como todo modelo ASR, puede producir omisiones, sustituciones y texto inventado en segmentos con silencio o ruido, riesgo no cuantificado en esta build.
- **Validacion social nula**: el repositorio tiene 0 descargas y 0 *likes* en el momento de la ficha; no hay evidencia de uso independiente.
- **Licencia CC-BY-4.0**: permite uso comercial, pero obliga a atribuir a NVIDIA y a los autores del export y de la cuantizacion, e indica que no se otorgan garantias.
- **Resultados no extrapolables**: el autor advierte que las cifras aplican a estos ficheros exactos, no a otros checkpoints ni a otras recetas de cuantizacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rahulsharmavishwakarma/vesper-parakeet-tdt-0.6b-v3-sherpa-onnx-wo4-pointwise
- Modelo base en HuggingFace: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX FP32 de referencia: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3/tree/1a468a35cbba69418f126de829e75261dea4a4e4
- Build de 4 bits simple usada por la app: https://huggingface.co/rahulsharmavishwakarma/vesper-parakeet-tdt-0.6b-v3-sherpa-onnx-wo4
- Repositorio del proyecto Vesper (notebooks y analisis): https://github.com/rahulsharmavishwakarma/vesper
- Issue con el analisis completo: https://github.com/rahulsharmavishwakarma/vesper/issues/271
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Dataset de evaluacion FLEURS: `google/fleurs` (revision `70bb2e84`)

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos resultados obtenidos eran contenido no relacionado y no se han utilizado como fuente.

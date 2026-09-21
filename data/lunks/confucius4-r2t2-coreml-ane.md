# lunks/Confucius4-R2T2-CoreML-ANE

## Resumen
Confucius4-R2T2-CoreML-ANE es la conversión a Core ML del modelo de reconocimiento automático de voz netease-youdao/Confucius4-R2T2, un fine-tune orientado a transcripción en tiempo real del modelo Qwen3-ASR-1.7B. Lo publica el usuario lunks y no ha implicado reentrenamiento ni ajuste fino: se conservan los pesos originales, convertidos y paletizados para ejecutarse casi por completo en el Apple Neural Engine (ANE). El resultado es un paquete de programas Core ML que cubre el encoder, el decoder y la cabeza de lenguaje.

La relevancia de esta ficha está en el formato, no en el modelo subyacente: se trata de la primera conversión documentada de este ASR a Core ML stateful para ANE, con soporte de decodificación en streaming y un runtime de decodificación especulativa basado en las funciones `prefill`, `infer` y `verify`. Frente a los pesos BF16 originales ejecutados en MLX, la conversión mantiene una tasa de error de palabra prácticamente idéntica, según las mediciones incluidas en la model card.

Arquitectónicamente es un esquema encoder-decoder: un encoder de audio que consume ventanas fijas de mel de 800 frames (8 segundos) y un decoder tipo transformer causal de 28 capas con caché KV, contexto de 1024 posiciones, dimensión oculta 2048 y vocabulario de 151 936 tokens. Los pesos suman aproximadamente 3,0 GB en el repositorio (~2,93 GB contando ficheros) y el ANE mantiene unos 4,5 GB de pesos desquantizados en fp16 fuera del proceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para ASR: encoder de audio (ventana fija de mel de 800 frames) + decoder transformer causal de 28 capas con caché KV; base derivada de Qwen3-ASR-1.7B |
| Parametros totales | No detallado en la model card. El modelo base se describe como un fine-tune de Qwen3-ASR-1.7B, por lo que el orden de magnitud es de unos 1,7 mil millones |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 1024 posiciones en el decoder (máscara causal `[1, 1, B, 1024]`); el encoder procesa ventanas fijas de 800 frames de mel, equivalentes a 8 segundos, y el runtime decodifica fragmentos de audio de hasta 30 s pasada a pasada |
| Tipos de cuantizacion | LUT8 (paletización de 8 bits) en las dos mitades del decoder y en la cabeza de lenguaje; fp16 en el encoder y en la tabla de embeddings. En carga, el ANE desquantiza a fp16 (~4,5 GB) |
| Idiomas soportados | La model card menciona 30 idiomas; las etiquetas del repositorio enumeran 10: inglés, portugués, chino, español, francés, alemán, italiano, japonés, coreano y ruso. La discrepancia no se aclara en la documentación |
| Licencia | netease-model-use-license-agreement (identificador `other`), con ficheros `MODEL_LICENSE`, `LICENSE-Qwen3-ASR.txt` y `NOTICE` incluidos en el repositorio |
| Formato de pesos | Paquetes Core ML compilados `.mlmodelc` (encoder, dos chunks de decoder, cabeza LM), tabla de embeddings en `.bin` fp16 memory-mapped (151 936 × 2048, sin cabecera) y tokenizer en JSON |
| Tamano del repositorio | 3,0 GB |
| Dimension oculta / cabezas KV | 2048; estado KV `(56, 8, 1024, 128)` fp16, es decir 28 pares clave-valor con 8 cabezas de 128 dimensiones |
| Vocabulario | 151 936 tokens, dividido en 16 rebanadas de 9496 logits en la cabeza |

## Arquitectura y entrenamiento
La model card describe una arquitectura encoder-decoder. El encoder `R2T2AudioEncoder.mlmodelc` recibe un tensor `[1, 128, 800]` de frames log-mel calculados con la receta de Whisper (16 kHz, `n_fft` 400, hop 160, banco de filtros Slaney, `log10`, recorte a 8 dB por debajo del máximo del búfer y normalización `(x + 4) / 4`), más una máscara para ventanas más cortas de 800 frames en la que las claves enmascaradas reciben −10 000. La salida es `[1, 104, 2048]`, con 13 filas por cada 100 frames de entrada.

El decoder se reparte en dos programas que cubren las capas 0-13 y 14-27 más la normalización final. Cada uno expone dos funciones, `prefill` (B = 128) e `infer` (B = 1), y comparten un único `MLState` de forma `(56, 8, 1024, 128)` en fp16, donde la capa *l* del chunk *c* usa las ranuras *l* (claves) y *28 + l* (valores). Las filas se escriben por posición absoluta, lo que permite rebobinar y sobrescribir. La cabeza de lenguaje `r2t2_lm_head_lut8.mlmodelc` está dividida en 16 vías y ofrece `infer` (una fila → logits) y `verify` (128 filas → 128 argmax exactos en fp16, con índice `hi × 64 + lo`). No hubo reentrenamiento: los pesos son los originales, convertidos y paletizados.

La innovación técnica relevante está en el runtime, no en el entrenamiento. El decodificador descrito decodifica todo el audio actual (hasta 30 s) en cada pasada, de modo que el texto en vivo converge al mismo resultado que una decodificación offline. Lo que abarata el proceso es lo que permanece en el estado KV entre pasadas: el prefijo del prompt y las filas de cada ventana de encoder ya completada. Cada pasada codifica la última ventana parcial, hace `prefill` de las filas nuevas, reutiliza los tokens de la pasada anterior como borrador y valida ese borrador con una única llamada a `verify` de la cabeza. Se trata, por tanto, de decodificación especulativa apoyada en hardware.

## Capacidades
- Reconocimiento automático de voz en streaming y en tiempo real, con convergencia al resultado de una decodificación offline completa.
- Transcripción multilingüe: 10 idiomas declarados en las etiquetas (inglés, portugués, chino, español, francés, alemán, italiano, japonés, coreano y ruso) y 30 mencionados en el texto de la model card.
- Decodificación especulativa mediante la función `verify` de la cabeza, que resuelve 128 filas y sus argmax en una sola llamada.
- Gestión de caché KV con reescritura por posición absoluta, lo que permite rebobinar y corregir hipótesis previas dentro de la ventana de 1024 posiciones.
- Procesamiento de fragmentos de audio de hasta 30 s por pasada, con ventanas de encoder fijas de 8 s y máscara para ventanas incompletas.
- Ejecución casi íntegra en el Apple Neural Engine: todas las operaciones del encoder, el 99 % de las del decoder y todas las de la cabeza; solo el argmax de una fila y una docena de operaciones de índices por función del decoder quedan en CPU.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio generativo: es un modelo exclusivamente de ASR.

## Casos de uso
- Dictado en aplicaciones nativas de macOS: el modelo transcribe la voz del usuario en streaming sobre el ANE, de modo que el texto aparece mientras se habla, con un coste de proceso de unos 200 MB y sin salir del dispositivo.
- Subtitulado en vivo en reuniones y videollamadas: la decodificación pasada a pasada sobre el audio acumulado permite mostrar subtítulos que convergen al resultado final, útil en herramientas de videoconferencia para Apple Silicon.
- Asistentes de voz con privacidad por diseño: al ejecutarse íntegramente en local, el audio no se envía a ningún servicio externo, lo que encaja en sectores con requisitos de confidencialidad (legal, sanitario, defensa).
- Integración directa en aplicaciones tipo VoiceInk: el proveedor R2T2 de ese fork ya utiliza estos ficheros, con lo que el modelo sirve como componente de sustitución en productos de transcripción ya existentes.
- Transcripción de campo sin conectividad: periodistas, investigadores o equipos de trabajo de campo pueden transcribir entrevistas multilingües en un MacBook sin conexión a internet, aprovechando los 10 idiomas declarados.
- Accesibilidad: generación de subtítulos en directo para personas con discapacidad auditiva en presentaciones, clases o eventos, con latencia baja gracias a la ejecución en el Neural Engine.
- Post-procesado por lotes de audio ya grabado: aunque el diseño está orientado a streaming, la decodificación de un fragmento de hasta 30 s por pasada permite procesar ficheros por bloques con el mismo runtime.
- Prototipado de pipelines de voz en el ecosistema Apple: al exponer funciones separadas de encoder, decoder y cabeza, el modelo se puede usar para experimentar con estrategias de decodificación especulativa sin tocar los pesos.

## Benchmarks y rendimiento
Tasa de error de palabra (WER) de esta conversión, decodificando enunciados completos sobre subconjuntos de 100 enunciados:

| Corpus | WER de esta conversión |
|---|---|
| LibriSpeech test-clean (inglés) | 2,40 % |
| FLEURS pt_br (portugués de Brasil) | 3,50 % |

Comparación emparejada frente a los pesos BF16 sin convertir ejecutados en MLX, sobre 300 enunciados de cada corpus:

| Corpus | Esta conversión | BF16 en MLX | Ratio | IC 95 % |
|---|---|---|---|---|
| LibriSpeech | 2,47 % | 2,42 % | 1,02 | 0,96 – 1,10 |
| FLEURS | 4,01 % | 4,01 % | 1,00 | 0,95 – 1,05 |

La model card indica además que el runtime de streaming termina en la misma transcripción que la decodificación del fichero completo. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al tratarse de un modelo de ASR.

## Requisitos de hardware
- Plataforma obligatoria: Apple silicon con macOS 15 o posterior. Los programas del decoder usan modelos stateful de Core ML y no se pueden compilar en otras configuraciones.
- Memoria: el Neural Engine mantiene los pesos desquantizados a fp16, unos 4,5 GB, fuera del proceso; el proceso en sí consume alrededor de 200 MB.
- GPU recomendadas: no aplica. No hay soporte para CUDA ni para GPU de NVIDIA o AMD; el modelo depende del Neural Engine de Apple.
- GPU de consumo: cualquier Mac con Apple silicon y macOS 15 o superior que pueda reservar unos 4,5 GB para el ANE. No hay versión para GPU de consumo de NVIDIA.
- Despliegue: no es un `MLModel` de entrada y salida única. Los paquetes multifunción se deben manejar desde Swift u Objective-C; `coremltools` de Python no puede abrirlos. Los programas del decoder solo cargan bajo `.cpuAndNeuralEngine`: `.all` y `.cpuAndGPU` fallan al compilar y `.cpuOnly` no puede cargar los paquetes multifunción.
- Almacenamiento: el repositorio ocupa 3,0 GB. La caché de programas compilados necesita espacio libre; con el disco por debajo de unos 20 GB libres, cada carga recompila.
- Latencia de carga: la primera carga por aplicación compila los programas para el ANE y tarda unos 50 segundos; las posteriores tardan alrededor de un segundo. La caché es por binario de aplicación, por lo que una actualización o recompilación de la app vuelve a pagar la compilación.
- Throughput y latencia de inferencia: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato y plataforma | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| lunks/Confucius4-R2T2-CoreML-ANE | No detallado (~1,7 mil millones por el modelo base) | 1024 posiciones en decoder; ventana de encoder de 8 s | 10 en etiquetas, 30 en el texto | Core ML `.mlmodelc`, solo Apple silicon con macOS 15+ | netease-model-use-license-agreement | 2,40 % WER en LibriSpeech test-clean; 3,50 % en FLEURS pt_br |
| netease-youdao/Confucius4-R2T2 | No detallado (~1,7 mil millones por el modelo base) | El mismo, al ser el modelo de origen | Los mismos | Pesos originales BF16; en la comparación se ejecutó en MLX | netease-model-use-license-agreement | 2,42 % en LibriSpeech y 4,01 % en FLEURS según la comparación emparejada |
| Qwen3-ASR-1.7B | 1,7 mil millones (por el nombre del modelo) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con otros ASR de propósito general (por ejemplo, la familia Whisper) no se puede completar con los datos de esta información: solo se dispone de la comparación interna entre la conversión Core ML y los pesos BF16 originales, que muestra una degradación nula o despreciable.

## Limitaciones y advertencias
- Dependencia total del hardware: solo funciona en Apple silicon con macOS 15 o posterior. No hay ruta de despliegue en servidores con GPU ni en macOS Intel.
- No es un modelo listo para usar: no es un `MLModel` con audio de entrada y texto de salida. Requiere un runtime propio que lo conduzca pasada a pasada, escrito en Swift u Objective-C; `coremltools` en Python no puede abrir los paquetes combinados.
- Restricciones de carga: los programas del decoder solo compilan bajo `.cpuAndNeuralEngine`; `.all` y `.cpuAndGPU` fallan y `.cpuOnly` no puede cargar los paquetes multifunción.
- Contexto limitado: la ventana del decoder es de 1024 posiciones y las ventanas del encoder son fijas de 8 s, aunque el runtime trabaja con fragmentos de hasta 30 s reutilizando el estado KV.
- Inconsistencia documental sobre idiomas: la model card afirma 30 idiomas y las etiquetas enumeran 10. No se especifica qué idiomas adicionales cubre ni con qué calidad.
- Cobertura de evaluación estrecha: los únicos datos de WER corresponden a LibriSpeech test-clean (inglés) y FLEURS pt_br (portugués de Brasil), sobre 100 enunciados para la cifra absoluta y 300 para la comparación emparejada. No hay evaluación publicada para el resto de idiomas ni para audio con ruido, acentos o solapamiento de hablantes.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de inserciones o alucinaciones en audio silencioso o ruidoso, un comportamiento habitual en sistemas ASR. No hay datos disponibles al respecto.
- Sesgos: no se han publicado análisis de sesgo por acento, género, edad o variedad dialectal en la información disponible.
- Licencia no estándar: se distribuye bajo el acuerdo de uso de modelos de NetEase (`netease-model-use-license-agreement`), más la licencia de Qwen3-ASR. Es necesario revisar los términos antes de cualquier uso comercial, ya que no se detallan en esta información.
- Aviso explícito del autor: las modificaciones introducidas en esta obra derivada no están respaldadas ni garantizadas por el titular original de los derechos, que declina toda responsabilidad sobre ellas.
- Requisitos operativos: la primera compilación tarda unos 50 s por binario de aplicación, la caché necesita espacio libre en disco y con menos de unos 20 GB disponibles cada carga recompila.
- Mantenimiento incierto: el repositorio registra 0 descargas y 0 likes, con una única actualización seis minutos después de la creación. No hay señales de mantenimiento continuado.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/lunks/Confucius4-R2T2-CoreML-ANE
- Modelo base: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Licencia del modelo base: https://raw.githubusercontent.com/netease-youdao/Confucius4-R2T2/refs/heads/master/MODEL_LICENSE
- Fork de VoiceInk que usa este modelo como proveedor R2T2: https://github.com/Beingpax/VoiceInk

Nota: las búsquedas web realizadas han devuelto exclusivamente páginas en húngaro sobre productos financieros y de telefonía sin relación alguna con el modelo, por lo que no se incluyen como enlaces relevantes.

# Harsha001/Drama-3-ROCmFPX-GGUF

## Resumen

Drama-3-ROCmFPX-GGUF es una conversión a formato GGUF del modelo de síntesis de voz fishaudio/drama-3 (Drama 3, 35B-A3B), publicada por el usuario Harsha001. No se trata de un modelo nuevo ni de un reentrenamiento: es una cuantización de los pesos originales a los tipos de peso ROCmFPX, un fork de ggml orientado a hardware AMD (ROCm, Strix Halo), para poder ejecutarlos con speech.cpp. Cada fichero GGUF contiene el modelo completo, su decodificador de audio y su códec a 44,1 kHz, de modo que no requiere artefactos adicionales.

El modelo base es un MoE de aproximadamente 35.774 millones de parámetros totales con unos 3.000 millones activos por token, capaz de generar voz en 83 idiomas, con un solo hablante o escenas de hasta 16 hablantes y marcas prosódicas incrustadas en el texto (por ejemplo `[laughs]`). Esta conversión resulta relevante porque reduce el peso de 143 GB (F32) a 37,4 GB (Q8_0) o 29,6 GB (Q6_0), lo que hace viable la inferencia en máquinas sin memoria de gran capacidad, a costa de una velocidad muy por debajo del tiempo real en CPU.

La contrapartida es una dependencia muy estricta del entorno de ejecución: los ficheros solo funcionan en speech.cpp compilado contra el fork ROCmFPX de ggml con el parche incluido en el repositorio. llama.cpp, LM Studio, Ollama y speech.cpp sin parchear no pueden cargarlos. Además, el autor indica explícitamente que los ficheros no se han probado todavía en hardware AMD real, pese a estar orientados a él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); incluye proyecciones Gated DeltaNet, router y experto compartido; el conjunto añade un decodificador de audio y un códec a 44,1 kHz. Detalle completo de la arquitectura del modelo base: no disponible |
| Parametros totales | 35.774.376.977 (~35,8B) |
| Parametros activos | ~3B (denominación 35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits, escalas de bloque UE4M3) y Q6_0_ROCMFPX (6 bits, formato preview). En pruebas: Q4_0_ROCMFP4, Q4_0_ROCMFP4_FAST, Q4_0_ROCMI4, Q3_0_ROCMFPX, Q2_0_ROCMFPX |
| Idiomas soportados | 83 idiomas de síntesis de voz según la model card del autor; los metadatos de HuggingFace no declaran idiomas |
| Licencia | fish-audio-community-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF con tipos de peso ROCmFPX (no compatibles con ggml estándar) |
| Tamano del repositorio | 67,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 (actualizado 2026-10-20) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina una mezcla de expertos con componentes de atención lineal: el procedimiento de cuantización menciona explícitamente un router, un experto compartido con compuerta propia y proyecciones sensibles de Gated DeltaNet, que se mantienen en F32 para no degradar la calidad. El pipeline completo de Drama 3 consta de tres partes empaquetadas en el mismo GGUF: el modelo de texto (las matrices toman el tipo de cuantización elegido, o F16 cuando una fila no cubre bloques completos), el decodificador de audio (mismo tratamiento) y el códec, que permanece siempre en F16. Las normas, el router, la compuerta del experto compartido y las proyecciones sensibles de Gated DeltaNet se conservan en F32.

El proceso de conversión parte de `reference/drama3/convert.py` de speech.cpp (commit `9df9064`, versión 0.8.10) sobre el checkpoint fijado en la revisión `e0a9218`, con los expertos en FP8 desquantizados igual que hace fish-speech, lo que produce un GGUF F32 de 143 GB. Después se compila speech.cpp sobre el ggml de ROCmFPX (`fb08d7c`) con el parche `speechcpp-rocmfpx.patch`, que añade los tipos ROCmFPX a las tablas de almacenamiento y el layout específico de Drama 3, y se cuantiza con `speech quantize` indicando el tipo. No se empleó matriz de importancia porque speech.cpp no lo soporta. No hay información disponible sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) con salida de audio a 44,1 kHz generada por el códec incluido.
- Multilingüe: 83 idiomas según la model card del autor.
- Modo de un solo hablante o escena con hasta 16 hablantes, seleccionables mediante marcas del tipo `<|speaker:0|>`, `<|speaker:1|>`.
- Control prosódico básico mediante indicaciones en el texto, por ejemplo `[laughs]`.
- Ejecución completamente local, sin servicios externos, con pesos cuantizados de 29,6 GB o 37,4 GB.
- Ejecución en CPU mediante los kernels portables de ROCmFPX; el binario se compila con soporte Vulkan (`-DGGML_VULKAN=ON`).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Localización de contenido audiovisual: el modelo permite generar pistas de voz en cualquiera de los 83 idiomas soportados partiendo del mismo texto, lo que simplifica doblajes y versiones multilingües de un mismo guion.
- Ficción sonora y audiolibros: la posibilidad de definir hasta 16 hablantes en una sola generación hace viable producir escenas dialogadas con marcas de hablante en el propio texto, sin concatenar clips de forma manual.
- Prototipado de asistentes de voz en local: al ejecutarse sin conexión y sin APIs de terceros, sirve para validar interfaces de voz en entornos con requisitos de privacidad, siempre que el uso encaje en la licencia (investigación o uso no comercial, o comercial por debajo de 500.000 USD de facturación anual).
- Generación de datos sintéticos para investigación en reconocimiento de voz: el propio autor emplea Qwen3-ASR 1.7B para transcribir las muestras y medir CER/WER, un flujo replicable para crear corpus de evaluación en varios idiomas.
- Evaluación de formatos de cuantización: los ficheros Q8_0 y Q6_0 permiten comparar el compromiso entre tamaño, velocidad y tasa de error de transcripción en un modelo MoE de audio, con la referencia F16 como línea base.
- Pruebas en hardware de memoria unificada: con 29,6 GB para Q6_0, el modelo encaja en equipos tipo Strix Halo o NVIDIA DGX Spark, lo que permite experimentar con TTS de 35B en estaciones de trabajo sin GPUs de datacenter.
- Contenido educativo y narración con matices: las marcas como `[laughs]` permiten introducir expresividad en materiales formativos o demostraciones sin edición posterior del audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de calidad de la cuantización: 20 frases en inglés (unos 100 s de audio) con `--voice none`, semillas 1, 2 y 3, transcritas con Qwen3-ASR 1.7B y comparadas con el texto original. La referencia es F16, ya que el fichero F32 no cabe en la máquina de pruebas.

| Variante | Tamano | CER | WER | CER por semilla | Velocidad (CPU ARM de 20 nucleos) |
|---|---:|---:|---:|---|---:|
| F16 (referencia, no publicado) | 71,6 GB | 2,25% | 2,09% | 3,61 / 1,25 / 1,90 | 0,25x tiempo real |
| `Drama-35B-A3B-v3-Q8_0_ROCMFPX.gguf` | 37,4 GB | 3,69% | 3,69% | 6,82 / 2,03 / 2,23 | 0,39x tiempo real |
| `Drama-35B-A3B-v3-Q6_0_ROCMFPX.gguf` | 29,6 GB | 2,45% | 3,20% | 3,94 / 1,90 / 1,51 | 0,03x tiempo real |

Notas aportadas por el autor: la velocidad se expresa en segundos de audio generados por segundo de cómputo (0,39x significa 0,39 s de voz por segundo de proceso, es decir, más lento que el tiempo real); un mismo fichero varía alrededor de un punto de CER entre semillas, por lo que diferencias de ese orden son ruido; parte de los errores son solo de escritura (por ejemplo, "7:45" en lugar de "seven forty-five") y afectan por igual a todas las variantes. El tipo de 6 bits carece todavía de una ruta rápida para ARM, lo que explica su velocidad muy inferior en esa CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso de los ficheros es de 37,4 GB (Q8_0) y 29,6 GB (Q6_0); a ello hay que sumar el estado de activación y los búferes de audio, no cuantificados. Estimación orientativa: a partir de ~40 GB de memoria para Q8_0 y ~32 GB para Q6_0. No hay cifras oficiales de consumo máximo publicadas.
- La conversión F32 intermedia ocupa 143 GB y la referencia F16, 71,6 GB; ninguna de las dos está pensada para equipos de consumo.
- GPU: el autor orienta el formato a AMD (ROCm, Strix Halo) y compila con `-DGGML_VULKAN=ON`, pero advierte que los ficheros no se han probado en hardware AMD; no se publican requisitos de GPU NVIDIA ni de datacenter (A100, H100, RTX 4090) para estas variantes.
- Cabe en equipos de memoria unificada de gran capacidad: las pruebas se hicieron en la CPU ARM de un NVIDIA DGX Spark; el tag `strix-halo` sugiere ese objetivo en el lado AMD.
- No cabe en GPUs de consumo de 24 GB con las variantes publicadas; las variantes Q4/Q3/Q2 anunciadas podrían reducir el requisito, pero aún no están disponibles ni medidas.
- Despliegue: exclusivamente speech.cpp en el commit `9df9064`, compilado sobre el ggml de ROCmFPX (`fb08d7c`) y con `speechcpp-rocmfpx.patch` aplicado. No funciona en llama.cpp, Ollama, LM Studio, TGI ni vLLM.
- Latencia y throughput: 0,25x tiempo real (F16, referencia), 0,39x (Q8_0) y 0,03x (Q6_0) en CPU ARM de 20 núcleos. En GPU AMD se ejecutarían kernels dedicados, pero no hay cifras publicadas y el orden de operaciones distinto puede alterar ligeramente los resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Drama-3-ROCmFPX Q8_0 (este) | 35,8B totales / ~3B activos | GGUF ROCmFPX, 37,4 GB | no disponible | CER 3,69% / WER 3,69% | fish-audio-community-license-1.0 | Publicado; solo speech.cpp + ROCmFPX |
| Drama-3-ROCmFPX Q6_0 (este) | 35,8B totales / ~3B activos | GGUF ROCmFPX, 29,6 GB | no disponible | CER 2,45% / WER 3,20% | fish-audio-community-license-1.0 | Publicado; solo speech.cpp + ROCmFPX |
| fishaudio/drama-3 (base) | 35,8B totales / ~3B activos | Pesos originales del modelo base | no disponible | referencia del autor (F16: CER 2,25% / WER 2,09%) | fish-audio-community-license-1.0 | Público en HuggingFace |
| Drama 3 F32 (conversion intermedia) | 35,8B totales / ~3B activos | GGUF F32, 143 GB | no disponible | no medida (no cabe en la máquina de pruebas) | fish-audio-community-license-1.0 | No publicado |
| Drama 3 F16 (referencia) | 35,8B totales / ~3B activos | GGUF F16, 71,6 GB | no disponible | CER 2,25% / WER 2,09% | fish-audio-community-license-1.0 | No publicado |

No se dispone en la información proporcionada de datos de otros modelos TTS comparables (parámetros, contexto, benchmarks o licencia), por lo que la comparación se limita a las distintas variantes del mismo modelo base.

## Limitaciones y advertencias

- Requisito de entorno muy restrictivo: solo funciona con speech.cpp parcheado y el ggml de ROCmFPX; cualquier otra herramienta (llama.cpp, Ollama, LM Studio, speech.cpp estándar) fallará al cargar los ficheros.
- Los ficheros no se han probado en hardware AMD, pese a que el formato está diseñado para ROCm; las métricas proceden de kernels de CPU y los resultados en GPU pueden diferir ligeramente.
- Calidad inferior a la referencia: el Q8_0 presenta un CER del 3,69% frente al 2,25% del F16, con una semilla claramente peor (6,82%), lo que indica sensibilidad a la semilla de muestreo.
- El Q6_0 es un formato preview y su ruta de CPU para ARM es muy lenta (0,03x tiempo real), lo que lo hace poco práctico para generación interactiva en ese hardware.
- El códec se mantiene en F16 y no se cuantiza, de modo que el ahorro de memoria tiene un suelo.
- No se usó matriz de importancia en la cuantización (speech.cpp no lo soporta), lo que puede penalizar la calidad respecto a cuantizaciones calibradas.
- Restricciones de licencia: uso gratuito solo para investigación y fines no comerciales; uso comercial permitido únicamente por debajo de 500.000 USD de facturación anual; prohibido ofrecer servicio de voz alojado o de clonación de voz sin acuerdo separado.
- Prohibido imitar la voz de una persona real sin su consentimiento; riesgo relevante de suplantación y de uso fraudulento de voces sintéticas.
- Riesgo de errores de pronunciación, deletreo y prosodia, cuantificado por el CER/WER anteriores; el modelo no es una referencia de fidelidad literal del texto.
- Límite de 16 hablantes por escena y dependencia de marcas textuales concretas (`<|speaker:N|>`, `[laughs]`), cuyo comportamiento fuera de esos formatos no está documentado.
- Longitud de contexto no documentada: no se puede asumir capacidad para guiones largos sin fragmentar.
- Proyecto no oficial: no está hecho, patrocinado ni respaldado por Fish Audio; el autor es un tercero y el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- Idiomas: aunque se anuncian 83, no se publican métricas de calidad por idioma; todas las medidas del autor son sobre 20 frases en inglés.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harsha001/Drama-3-ROCmFPX-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Licencia (fichero del repositorio): https://huggingface.co/Harsha001/Drama-3-ROCmFPX-GGUF/blob/main/LICENSE
- Aviso legal (fichero del repositorio): https://huggingface.co/Harsha001/Drama-3-ROCmFPX-GGUF/blob/main/NOTICE
- Fork ROCmFPX de ggml: https://github.com/charlie12345/ROCmFPX
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Guía de Drama 3 en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/drama3.md
- Modelo ASR usado para la evaluación (Qwen3-ASR 1.7B): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Búsqueda web: los resultados devueltos no guardaban relación con el modelo (consultas sobre Visual Studio Code y descarga de datasets de recuperación de imágenes), por lo que no se han incluido.

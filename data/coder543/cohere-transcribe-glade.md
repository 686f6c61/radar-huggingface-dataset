# coder543/cohere-transcribe-glade

## Resumen

Cohere Transcribe for Glade es una conversión del modelo de reconocimiento automático del habla (ASR) CohereLabs/cohere-transcribe-03-2026, publicada por el usuario coder543 y orientada específicamente al runtime propietario Glade sobre Apple silicon. No se trata de un modelo entrenado desde cero, sino de un paquete de pesos cuantizados y grafos de ejecución compilados (`.aimodel`) que reproducen el comportamiento del modelo original dentro de la pila Core AI de Apple, con el codificador y el descodificador mapeados preferentemente a la Neural Engine (ANE).

La arquitectura subyacente es un transformer encoder-decoder: un codificador de 48 capas con atención bidireccional completa dentro de cada fragmento y un descodificador autorregresivo de 8 capas. La conversión aplica cuantización W8A16 (pesos de 8 bits, activaciones de 16 bits) en ambos bloques, manteniendo en FP16 determinadas proyecciones de posición relativa y salidas de convolución, y tablas de embeddings en FP32 en el host.

Su relevancia es doble: por un lado demuestra que un modelo ASR multilingüe de 14 idiomas puede ejecutarse íntegramente en hardware de consumo Apple con latencias muy bajas (hasta 123,4× tiempo real en un M5 Max); por otro, ilustra un patrón de distribución de modelos empaquetados para un runtime cerrado, con requisitos estrictos de sistema operativo (macOS 27 o iOS 27) y sin soporte para audio crudo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (48 capas de codificador, 8 capas de descodificador) con atención bidireccional por fragmento |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Fragmentos de audio de hasta 35 s; caché del descodificador con capacidades de 64, 128, 256, 512 y 1024 tokens |
| Tipos de cuantizacion | W8A16 en codificador y descodificador; FP16 en proyecciones de posición relativa y salidas de convolución seleccionadas; FP32 en tablas de embeddings del host |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl, el, ar, ja, zh, vi, ko (14 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos `.aimodel` (Core AI) más `metadata.json`, `decoder-graph.json` y `prompts.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo original es un transformer encoder-decoder para transcripción de voz. El codificador consta de 48 capas y conserva contexto bidireccional completo dentro de cada fragmento de audio, lo que lo sitúa en el régimen de transcripción offline (no streaming). Cuatro de las etapas del codificador emplean la formulación completa de posición relativa de Fourier. El descodificador, de 8 capas, es autorregresivo y mantiene todos los estados previos dentro del fragmento procesado, con gestión de caché por parte del runtime anfitrión.

La conversión a Glade no incluye información sobre el entrenamiento original: no se detallan el número de tokens, la composición del corpus, ni si hubo RLHF o DPO. Lo que sí se documenta es el proceso de cuantización y compilación: cuantización W8A16 con excepciones en FP16, tamaños de lote compartidos de 1 y 8, y una especialización por dispositivo que compila los grafos para el hardware concreto. El frontend log-mel, el prompt de idioma, las tablas de embeddings y la tokenización los aporta el host, no los grafos publicados, que no aceptan audio crudo.

## Capacidades

- Transcripción de voz a texto en 14 idiomas, entre ellos español, inglés, francés, alemán, italiano, portugués, neerlandés, polaco, griego, árabe, japonés, chino, vietnamita y coreano.
- Procesamiento por fragmentos con contexto bidireccional completo dentro de cada fragmento, adecuado para transcripción offline de grabaciones largas.
- Ejecución acelerada en la Neural Engine mediante grafos Core AI, con dos peticiones de codificador en vuelo y hasta ocho fragmentos decodificados de forma independiente.
- Reutilización de búferes de salida y planificación de fragmentos en límites silenciosos de como máximo 35 segundos, conservando todas las muestras de entrada.
- No proporciona marcas temporales por palabra.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No acepta audio directamente en los grafos; requiere el runtime anfitrión de Glade para el frontend y la tokenización.

## Casos de uso

- Transcripción de reuniones y entrevistas largas en Mac: con una ventana de fragmentos de hasta 35 s y una velocidad de 91,7× en un M3 MacBook Air, una grabación de 18 minutos se transcribe en unos 12 segundos, lo que permite flujos de posprocesado casi inmediatos.
- Subtitulado offline de vídeo multilingüe: el soporte de 14 idiomas permite generar pistas de subtítulos en español, inglés, francés o japonés desde una única instalación, sin depender de servicios en la nube.
- Archivado y búsqueda de audio corporativo: la transcripción local en Apple silicon evita enviar grabaciones confidenciales a terceros, un requisito habitual en sectores regulados.
- Actas automáticas en aplicaciones de escritorio macOS: al integrarse mediante el runtime de Glade, puede invocarse desde una app nativa que gestione la captura de audio y la planificación de fragmentos.
- Investigación en ASR y eficiencia: sirve como referencia reproducible de cuantización W8A16 y despliegue en ANE para comparar precisión (WER normalizado de Whisper de 1,89 % en el discurso de JFK) frente a la referencia FP32.
- Prototipado de asistentes de voz en iOS: en dispositivos con iOS 27, el paquete puede habilitar dictado y transcripción local en apps móviles, aunque el autor advierte que solo el inglés ha sido validado hasta la fecha.
- Evaluación de pipelines de despliegue en hardware de consumo: útil para medir latencia, tiempo de especialización y comportamiento de caché en equipos M3 y M5 Max antes de adoptar soluciones equivalentes en producción.

## Benchmarks y rendimiento

Los datos publicados corresponden a latencia de transcripción, no a benchmarks académicos de ASR (MMLU, HumanEval, GSM8K no aplican a este modelo).

| Prueba | Hardware | Resultado |
|---|---|---|
| Discurso de JFK, 20 s | M3 MacBook Air (16 GB), macOS 27 build 26A428 | 0,411 s (48,6× tiempo real) |
| Discurso de JFK, 18 min 15 s (36 fragmentos) | M3 MacBook Air (16 GB) | 11,949 s (91,7× tiempo real) |
| Discurso de JFK, 18 min 15 s | MacBook Pro M5 Max (18 CPU, 40 GPU, 64 GB), macOS 27.2.1 | 8,874 s (123,4× tiempo real), mediana de tres pasadas |
| WER normalizado Whisper, grabación completa | M3 MacBook Air | 42/2.220 (1,89 %), coincide con referencia FP32 |
| Preparación completa del bundle, caché invalidada | M3 MacBook Air | 3 min 0,5 s |
| Preparación con caché válida (proceso nuevo) | M3 MacBook Air | 0,110 s |

El trazado de una ejecución registró 756 predicciones en ANE y cero intervalos de GPU, lo que confirma la colocación en la Neural Engine, aunque el autor aclara que no mide utilización de ALU. La medición en M5 Max incluye lectura de audio y planificación de fragmentos, por lo que su frontera temporal es más amplia que las filas del M3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fragmento | Idiomas | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| coder543/cohere-transcribe-glade | no disponible | Fragmentos de hasta 35 s; caché de 64 a 1024 tokens | 14 | Apache 2.0 | `.aimodel` para Core AI en Apple silicon (macOS 27 / iOS 27) |
| CohereLabs/cohere-transcribe-03-2026 (modelo base) | no disponible | no disponible | 14 | Apache 2.0 | Pesos originales; despliegue genérico, no empaquetado para ANE |
| Whisper large-v3 (referencia de la normalización WER) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la única comparación documentada es la coincidencia de transcripción entre la conversión y la referencia FP32 del mismo modelo.

## Limitaciones y advertencias

- Requiere hardware Apple silicon físico con macOS 27 o iOS 27 y el runtime específico de Glade; no es desplegable en Linux, Windows, GPU NVIDIA ni en entornos en la nube convencionales.
- Los grafos no aceptan audio crudo: sin el host de Glade no hay frontend log-mel, prompt de idioma ni tokenización.
- Solo el inglés (discurso de JFK) ha sido validado; el resto de los 14 idiomas no están cualificados según el autor.
- No se proporcionan marcas temporales por palabra, lo que limita su uso en subtitulado con sincronización fina.
- Es transcripción offline, no streaming: el codificador necesita el fragmento completo para su contexto bidireccional.
- La primera preparación puede tardar varios minutos (3 min 0,5 s medidos) y debe repetirse si cambian el sistema operativo, el dispositivo o la aplicación, o si se desaloja la caché.
- Los artefactos son específicos de arquitectura; el autor omitió artefactos AoT por no demostrar mejoras significativas en la primera carga.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser una conversión del modelo base, hereda los del original, que no se detallan.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime Glade y de versiones concretas de macOS/iOS condiciona la viabilidad en producción.
- Se recomienda descargar una instantánea coherente del repositorio y verificar las sumas de comprobación proporcionadas por el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/cohere-transcribe-glade
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Revisión fijada del modelo base: `76b8b23e8607f35f0265a23d481b338fb0e26aea`
- Repositorio del modelo: https://huggingface.co/coder543/cohere-transcribe-glade/tree/main
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.

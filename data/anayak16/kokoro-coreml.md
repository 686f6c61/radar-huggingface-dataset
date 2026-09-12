# anayak16/kokoro-coreml

## Resumen

kokoro-coreml es una conversión a Core ML del modelo de síntesis de voz Kokoro-82M, publicada por el usuario anayak16 y basada en el repositorio fuente github.com/mattmireles/kokoro-coreml. No se trata de un modelo entrenado desde cero, sino de una reingeniería del pipeline original: Kokoro-82M se compila a Core ML y se divide en cinco submodelos independientes, cada uno asignado al procesador de Apple Silicon que mejor se adapta a su carga de trabajo (CPU, GPU o Neural Engine). El objetivo es la inferencia de texto a voz completamente local, sin conexión de red y sin coste por carácter.

El resultado es un paquete de ficheros .mlpackage que se cargan desde Swift con `MLModel(contentsOf:)`, orientado a macOS e iOS. La model card reporta 30 segundos de audio sintetizados en 379 ms en un Mac Studio M2 y 1.959 ms en un Mac Mini M1, con una ventaja de entre 1,6x y 2,3x frente al port en MLX sobre el mismo hardware. En iPhone 15 Pro Max el pipeline funciona a 4-4,5x tiempo real.

Su relevancia actual reside en la combinación de tres factores: un modelo TTS compacto de 82 millones de parámetros, una licencia Apache 2.0 que permite uso comercial sin fricción y una ejecución nativa en el Neural Engine que evita depender de APIs en la nube. El repositorio ocupa 0,5 GB y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de sintesis neuronal Kokoro-82M compilado a Core ML y fragmentado en cinco submodelos (duracion con BERT + LSTMs, alineamiento en Swift, F0/ruido, decoder pre con convoluciones, fuente armonica hn-NSF en vDSP y generador con convoluciones + iSTFT) |
| Parametros totales | 82 millones (heredados de hexgrad/Kokoro-82M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene .mlpackage preconvertidos; el tag base_model:quantized indica que parte de hexgrad/Kokoro-82M cuantizado) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage); cinco paquetes: kokoro_duration_t*, kokoro_f0ntrain, kokoro_decoder_pre, kokoro_decoder_har_post |
| Frecuencia de muestreo de salida | 24 kHz PCM |
| Autoria | anayak16 (repo HuggingFace); codigo fuente y runtime Swift en github.com/mattmireles/kokoro-coreml |
| Libreria | coreml |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un sistema de texto a voz de 82 millones de parámetros. El trabajo de este repositorio no es de entrenamiento sino de compilación y partición: el pipeline se corta en las uniones naturales para que cada etapa se ejecute en el procesador más adecuado. La etapa de duración (BERT más LSTMs) se asigna a CPU/GPU porque implica ramificación y longitudes variables; el alineamiento se resuelve en Swift con unas 50 líneas de código; las etapas de F0/ruido y decoder pre se despliegan en el Neural Engine por ser matemática densa de forma fija; la fuente armónica hn-NSF (seno más excitación de ruido) se ejecuta en CPU con vDSP para preservar la fase exacta; y el generador final con convoluciones e iSTFT vuelve al ANE.

La motivación técnica es explícita en la model card: el ANE tiene reglas estrictas (sin formas dinámicas ni flujo de control dependiente de datos). Si se envía el modelo completo a Core ML, el planificador acaba ejecutándolo en CPU. La partición quirúrgica evita esa degradación. No se publican en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO, ya que estas fases corresponden al modelo original de hexgrad y no se documentan en esta conversión.

## Capacidades

- Sintesis de texto a voz en ingles con salida PCM a 24 kHz.
- Inferencia completamente local y sin conexion: no requiere claves de API ni conectividad de red.
- Ejecucion sobre el Neural Engine en Mac con chip de la serie M, con reparto de etapas entre CPU, GPU y ANE.
- Ejecucion en iPhone mediante los mismos ficheros .mlpackage, con una politica escalonada (decoder pre en el ANE y el resto en CPU+GPU) cuando el compilador del ANE rechaza el plan completo.
- Voces multiples heredadas de Kokoro; en los benchmarks se utiliza la voz af_heart.
- Generacion en tiempo real o por encima: de 12x a 79x tiempo real en la gama de Macs medida.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones macOS: integracion via `MLModel(contentsOf:)` desde Swift para convertir texto de la interfaz en audio sin salir del dispositivo, con latencias de 51 ms para clips de 3 segundos en un M2 Studio.
- Accesibilidad y lectores de pantalla: sintesis offline para usuarios con discapacidad visual, sin dependencia de servicios en la nube ni cuotas por caracter.
- Asistentes de voz en iPhone: los mismos .mlpackage se despliegan en iOS; en un iPhone 15 Pro Max el pipeline mantiene 4-4,5x tiempo real, lo que permite respuestas habladas en conversaciones interactivas.
- Generacion de audiolibros y podcasts en local: clips de 30 segundos en 1,959 s en un Mac Mini M1 (14x tiempo real), adecuado para procesar lotes de texto de forma desatendida.
- Previsualizacion de narracion en herramientas de edicion: latencia de 126 ms para 10 segundos de audio en M2 Studio, lo que permite regenerar fragmentos de forma interactiva mientras se edita el guion.
- Sistemas de aviso y notificacion por voz en quioscos o dispositivos empotrados Apple: al ser offline y no requerir red, encaja en entornos con conectividad restringida o requisitos de privacidad.
- Investigacion y prototipado de TTS en Apple Silicon: sirve como referencia de particion de un pipeline neuronal entre CPU, GPU y ANE, con harness de medida reproducible en el repositorio de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible, ya que se trata de un modelo de sintesis de voz. Los datos disponibles son de latencia. Tiempo de pared en caliente (mediana) de una llamada completa de sintesis, de token a PCM de 24 kHz, medido en junio de 2026:

| Duracion de audio | M2 Studio (64 GB) | M2 Air (24 GB) | M1 Mini (16 GB) |
|---|---:|---:|---:|
| 3 s | 51 ms | 148 ms | 234 ms |
| 10 s | 126 ms | 466 ms | 686 ms |
| 30 s | 379 ms | 1.405 ms | 1.959 ms |

Comparativa frente a MLX (Blaizzy/mlx-audio 0.4.3, commit 862dfbe, modelo mlx-community/Kokoro-82M-bf16), misma voz af_heart y misma frontera de medida:

| Duracion de audio | M2 Studio | M2 Air | M1 Mini |
|---|---|---|---|
| 3 s | 51 ms frente a error | 148 ms frente a error | 234 ms frente a error |
| 7 s | 96 ms frente a 224 ms (2,3x) | 331 ms frente a 686 ms (2,1x) | 493 ms frente a 824 ms (1,7x) |
| 10 s | 126 ms frente a 289 ms (2,3x) | 466 ms frente a 836 ms (1,8x) | 686 ms frente a 1.124 ms (1,6x) |
| 30 s | 379 ms frente a 763 ms (2,0x) | 1.405 ms frente a 2.600 ms (1,9x) | 1.959 ms frente a 3.078 ms (1,6x) |

La version fijada de MLX falla en clips de 3 segundos con un error de forma de broadcast. En iPhone, frente a mlalma/kokoro-ios 1.0.8 (puerto MLX Swift; su medicion incluye la fase Misaki G2P y la de este repositorio parte de token IDs):

| Duracion de audio | iPhone 15 Pro Max | iPhone 12 Pro |
|---|---|---|
| 3 s | 702 ms frente a 919 ms (1,3x) | 1.383 ms frente a 1.624 ms (1,2x) |
| 7 s | 1.492 ms frente a 1.875 ms (1,3x) | 2.966 ms frente a 2.405 ms (0,8x) |
| 15 s | 3.272 ms frente a 3.805 ms (1,2x) | 6.250 ms frente a 5.022 ms (0,8x) |
| 30 s | 6.374 ms frente a 7.792 ms (1,2x) | 12.301 ms frente a OOM |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon exclusivamente (Neural Engine mas CPU y GPU integrados). No hay soporte para CUDA ni para GPUs de otros fabricantes.
- Macs medidos: Mac Studio M2 (64 GB), Mac Air M2 (24 GB) y Mac Mini M1 (16 GB). El Mac Mini M1 es el dispositivo mas modesto de la tabla y aun asi sintetiza 30 segundos de audio en 1,959 s.
- iPhone medidos: iPhone 15 Pro Max (A17 Pro) e iPhone 12 Pro (4 GB de RAM). Los mismos .mlpackage funcionan en ambos.
- Memoria: el repositorio pesa 0,5 GB, por lo que el modelo cabe holgadamente en dispositivos con 4 GB de RAM; el limite practico en iPhone 12 Pro es la presion de memoria, que provoca OOM en clips de 30 segundos con el port alternativo.
- Restriccion del compilador del ANE: en los chips A14 y A17 Pro el compilador rechaza el plan completo en ANE (`ANECCompile() FAILED`), por lo que en iPhone se usa la politica escalonada (decoder pre en ANE y el resto en CPU+GPU). En los Mac de la serie M si se ejecuta el plan completo en ANE.
- Arranque en frio: Core ML compila en la primera carga, lo que anade unos segundos; las mediciones de la tabla corresponden a llamadas en caliente.
- Opciones de despliegue: carga directa de .mlpackage con `MLModel(contentsOf:)` en Swift; el codigo fuente, los exportadores y el runtime estan en github.com/mattmireles/kokoro-coreml. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: de 12x a 79x tiempo real en la gama de Macs medida; en iPhone 15 Pro Max, 4-4,5x tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Framework | Hardware | Licencia | Notas de rendimiento |
|---|---|---|---|---|---|
| kokoro-coreml (este) | 82 M | Core ML | Apple Silicon (ANE + CPU + GPU) | Apache 2.0 | 379 ms para 30 s en M2 Studio; 2,0x mas rapido que MLX en ese equipo |
| mlx-community/Kokoro-82M-bf16 (via mlx-audio 0.4.3) | 82 M | MLX | Apple Silicon (GPU) | Apache 2.0 (heredada) | 763 ms para 30 s en M2 Studio; falla en clips de 3 s con error de forma |
| mlalma/kokoro-ios 1.0.8 | 82 M | MLX Swift | iPhone | Apache 2.0 | 7.792 ms para 30 s en iPhone 15 Pro Max; OOM en iPhone 12 Pro con clips de 30 s; su medicion incluye Misaki G2P |
| hexgrad/Kokoro-82M | 82 M | PyTorch (original) | CPU/GPU generico | Apache 2.0 | Modelo base del que derivan las tres conversiones anteriores; no se aportan mediciones de latencia en la informacion disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Es una conversion y particion de un modelo existente, no un modelo nuevo: cualquier sesgo, limitacion o error de pronunciacion de Kokoro-82M se hereda sin cambios.
- Riesgo de alucinacion acustica y de errores de prosodia propios de los modelos TTS; no se documentan evaluaciones de calidad perceptual (MOS) en la informacion disponible.
- Dependencia exclusiva de Apple Silicon: no es desplegable en GPUs NVIDIA, AMD ni en servidores x86 convencionales.
- En iPhone con chips A14 y A17 Pro, el compilador del ANE rechaza el plan completo y se degrada a una politica escalonada, con la perdida de rendimiento que ello implica.
- En iPhone 12 Pro (4 GB), la sintesis de clips de 30 segundos esta cerca del limite de memoria del dispositivo; el comparador MLX directamente falla por OOM.
- El arranque en frio anade una compilacion de Core ML de varios segundos antes de alcanzar el regimen estable.
- Las cifras de rendimiento proceden de una unica model card, medidas en junio de 2026 con un harness concreto; la propia autoria advierte de que los resultados varian con la version de macOS y el hardware y recomienda remedirlos en el equipo objetivo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base hexgrad/Kokoro-82M y de las voces utilizadas.
- El repositorio de HuggingFace registra 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado resultados de busqueda relevantes sobre el modelo fuera de su propia documentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anayak16/kokoro-coreml
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Codigo fuente, exportadores y runtime Swift: https://github.com/mattmireles/kokoro-coreml
- Comparador MLX: https://github.com/Blaizzy/mlx-audio
- Modelo MLX de referencia: mlx-community/Kokoro-82M-bf16
- Puerto MLX Swift para iOS: https://github.com/mlalma/kokoro-ios

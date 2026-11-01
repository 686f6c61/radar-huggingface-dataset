# Harsha001/Audio8-TTS-Realistic-0.6b-ROCmFPX

## Resumen

Audio8-TTS-Realistic-0.6b-ROCmFPX es una distribucion en formato GGUF del modelo de sintesis de voz Edge0/Audio8-TTS-Realistic-0.6b, publicada por el usuario Harsha001. El modelo original es un TTS multilingue de aproximadamente 497 millones de parametros (0,5 B) que convierte texto en audio a 44,1 kHz, y esta version lo empaqueta para el runtime ROCmFPX, un fork de llama.cpp escrito en C++ nativo sobre ggml que no depende de Python ni de PyTorch.

La relevancia de esta ficha esta en el empaquetado, no en el modelo base: ofrece cuantizaciones especificas (Q8_0 estandar, Q6_K y Q4_0 con escalas por tensor de ROCmFPX) junto con un fichero `mmproj` en BF16 que contiene el predictor de codigos y el decodificador de audio. El objetivo declarado es ejecutar TTS en hardware modesto, con especial atencion a las GPU AMD Strix Halo mediante Vulkan, y tambien en CPU y CUDA.

El modelo cubre 25 idiomas, entre ellos espanol, ingles, chino, japones, aleman, frances, portugues o arabe, y se distribuye bajo licencia Apache 2.0. No soporta clonacion de voz en este runtime: genera audio con una voz propia fija, con un maximo de unos 47 segundos por llamada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (24 capas) para el modelo de texto, mas predictor de codigos (4 capas) y decodificador de audio arktts, ambos en el fichero mmproj |
| Parametros totales | 497.473.504 (0,5 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (0,53 GB), Q6_K_ROCMFPX (0,45 GB), Q4_0_ROCMFP4_STRIX (0,35 GB); mmproj en BF16 (0,58 GB) |
| Idiomas soportados | zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue (25) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp / ROCmFPX) |

## Arquitectura y entrenamiento

El sistema se divide en tres componentes. El modelo de texto, con arquitectura tipo Qwen2 de 24 capas y empaquetado como GGUF estandar de llama.cpp, lee el texto de entrada y selecciona el token de habla principal de cada trama de audio, a un ritmo de 21,5 tramas por segundo de audio. El predictor de codigos, de 4 capas pequenas e incluido en el mmproj, completa los otros 9 codigos de cada trama. Por ultimo, el decodificador de audio basado en el codec arktts, tambien en el mmproj, convierte los 10 codigos por trama en audio PCM a 44,1 kHz.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card unicamente documenta los parametros de muestreo heredados de la referencia: top-k 50, top-p 0,9, temperatura 0,7 y una regla RAS contra repeticiones. La innovacion tecnica destacable de esta publicacion es el formato ROCmFPX, que anade escalas por tensor a las cuantizaciones para habilitar rutas rapidas en GPU AMD, y la separacion entre modelo de texto y mmproj, que permite intercambiar cuantizaciones del primero sin recargar el decodificador.

## Capacidades

- Sintesis de voz multilingue a partir de texto plano en 25 idiomas, incluidos espanol, ingles, chino, japones, coreano, aleman, frances, italiano, portugues, ruso y arabe.
- Generacion de audio a 44,1 kHz con una duracion maxima de aproximadamente 47 segundos por llamada (1024 tramas).
- Generacion determinista mediante semilla (`-s <seed>`), util para pruebas reproducibles.
- Ejecucion sin Python ni PyTorch: runtime C++ nativo sobre ggml.
- Compatibilidad con CPU, Vulkan (incluida AMD Strix Halo) y CUDA.
- No soporta clonacion de voz en este runtime; el modelo habla con una voz propia fija.
- No dispone de tool calling, capacidades de agente, vision ni audio de entrada.

## Casos de uso

- Narracion de articulos y documentacion: el modelo convierte texto en audio de forma local y sin dependencias de Python, lo que permite integrarlo en generadores de sitios estaticos que produzcan versiones en audio de cada entrada.
- Accesibilidad en aplicaciones de escritorio: lectura en voz alta de contenido para usuarios con discapacidad visual, ejecutandose en CPU o en una GPU integrada sin necesidad de servicios en la nube.
- Asistentes de voz embebidos en dispositivos con GPU AMD Strix Halo: el binario `llama-tts` con backend Vulkan y la cuantizacion Q4_0_ROCMFP4_STRIX (0,35 GB) caben en equipos de gama alta de consumo y permiten respuestas habladas sin conexion.
- Generacion de locuciones para prototipos y demos: con semilla fija se obtiene siempre el mismo audio, lo que facilita la revision y el control de versiones de los recursos de audio generados.
- Pruebas de internacionalizacion: el soporte de 25 idiomas permite generar muestras habladas en espanol, portugues, arabe o vietnamita para validar interfaces multilingues antes de contratar voces profesionales.
- Investigacion en TTS de bajo coste: la tabla de fidelidad frente a PyTorch incluida en la model card permite estudiar el impacto de cada cuantizacion en la calidad de la seleccion de tokens de habla.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, etc.), pero si una comparacion de fidelidad frente a la referencia en PyTorch con teacher forcing, sobre una frase de prueba en ingles de 113 tramas:

| Modelo de texto (mmproj BF16) | Coseno de logits de texto | Aciertos de token semantico | Aciertos del predictor de codigos |
|---|---|---|---|
| F32 (mmproj F32) | 0,9999993 | 114 / 114 | 1010 / 1017 |
| BF16 | 0,999997 | 114 / 114 | 1008 / 1017 |
| Q8_0 | 0,99987 | 113 / 114 | 963 / 1017 |
| Q6_K_ROCMFPX | 0,99949 | 105 / 114 | 930 / 1017 |
| Q4_0_ROCMFP4_STRIX | 0,9952 | 93 / 114 | 720 / 1017 |

El decodificador de audio alcanza un coseno de 0,9999998 frente a PyTorch. Whisper transcribe palabra por palabra la salida libre de todos los ficheros del repositorio en ingles con varias semillas; otros idiomas no se han probado. La velocidad solo se ha medido en una CPU con carga, sin cifras publicadas de GPU.

## Requisitos de hardware

- VRAM estimada: muy baja. El modelo de texto ocupa entre 0,35 GB (Q4_0) y 0,53 GB (Q8_0), y el mmproj BF16 anade 0,58 GB; en total, entre aproximadamente 1 GB y 1,1 GB de pesos.
- GPU recomendadas: cualquier GPU con soporte Vulkan o CUDA; el autor apunta especificamente a AMD Strix Halo con la cuantizacion Q4_0_ROCMFP4_STRIX.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU integrada o dedicada reciente, y tambien en CPU.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp (commit `8a705e2f7` o posterior) mediante el binario `llama-tts`; los ficheros Q6_K y Q4_0 requieren este fork por sus escalas por tensor, mientras que el Q8_0 es un GGUF estandar.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b-ROCmFPX | 0,5 B | no disponible | 25 | Apache 2.0 | GGUF |
| Edge0/Audio8-TTS-Realistic-0.6b | 0,5 B | no disponible | 25 | Apache 2.0 | safetensors (PyTorch) |
| Alternativas TTS open source de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base en PyTorch, del que esta version es una conversion GGUF con perdida minima segun la tabla de fidelidad. No se dispone de datos de otros modelos TTS comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No soporta clonacion de voz: el modelo habla siempre con su propia voz, lo que limita casos de uso que requieran una identidad vocal concreta.
- Duracion maxima de audio de aproximadamente 47 segundos por llamada; textos mas largos deben trocearse.
- La validacion de calidad solo se ha realizado en ingles con Whisper; el rendimiento en los otros 24 idiomas, incluido el espanol, no esta verificado.
- Las cuantizaciones ROCmFPX Q6_K y Q4_0 degradan la seleccion del predictor de codigos de forma notable (930/1017 y 720/1017 frente a 1010/1017 en F32), lo que puede afectar a la naturalidad del audio.
- Los ficheros ROCmFPX requieren un fork concreto de llama.cpp (commit `8a705e2f7` o posterior); no funcionan en llama.cpp estandar ni en Ollama.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir artefactos, repeticiones o pronunciaciones erroneas, mitigado parcialmente por la regla RAS.
- No hay datos publicados sobre sesgos de voz (genero, acento, edad) ni sobre el origen de los datos de entrenamiento del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Edge0/Audio8-TTS-Realistic-0.6b y del codec arktts antes de desplegar en produccion.
- El repositorio tiene muy pocas descargas y ninguna validacion de la comunidad; la velocidad en GPU no esta medida por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harsha001/Audio8-TTS-Realistic-0.6b-ROCmFPX
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp (proyecto original): https://github.com/ggml-org/llama.cpp

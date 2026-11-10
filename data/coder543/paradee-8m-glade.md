# coder543/paradee-8m-glade

## Resumen

Paradee-8M para Glade es un paquete de assets y configuracion de ejecucion que adapta el modelo de sintesis de voz Paradee-8M v1.1 (y su version anterior v1.0) al runtime Glade sobre Apple Silicon. El modelo subyacente es una destilacion de Kokoro, mono-voz, de ingles americano, desarrollada originalmente por sahilmahendrakar, que acepta texto plano o fonemas explicitos y genera PCM mono a 24 kHz con la voz entrenada "Heart". Este repositorio, publicado por coder543, no contiene pesos nuevos entrenados desde cero, sino una cuantizacion y empaquetado especifico para Core AI, Neural Engine y GPU de los chips M-series de Apple.

La relevancia actual del paquete reside en su eficiencia: con solo 7.884.450 parametros aprendidos en la version v1.1, alcanza velocidades de sintesis de hasta 141x en tiempo real (RTFx) en un MacBook Pro con M5 Max, y 90,47x en un MacBook Air con M3 y 16 GB. Esto lo situa como una opcion practica para sintesis de voz local en dispositivos Apple, sin dependencia de Python en tiempo de ejecucion ni de servicios en la nube, algo poco habitual en modelos TTS de calidad aceptable.

El paquete incluye el frontend de texto Misaki para ingles americano (11,0 MB), cuatro assets `.aimodel` que implementan la red de texto, la prediccion de pitch/ruido, el tronco acustico y la cabeza de forma de onda, y un fichero `cpu.f16` con parametros en FP16 para las recurrencias en CPU. La licencia Apache 2.0 facilita su integracion en productos comerciales, aunque el alcance practico esta limitado al ecosistema Apple y al idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de sintesis de voz (TTS) con etapas de texto/prosodia/acustica y cabeza de forma de onda; v1.1 usa cabeza source-filter con 64 armonicos; v1.0 usa generador de sobremuestreo, ISTFT y correccion de fase |
| Parametros totales | 7.884.450 (v1.1); 8.080.406 (v1.0) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 slots de token (incluyendo limites) y 2.048 frames acusticos |
| Tipos de cuantizacion | Pesos INT8 con activaciones FP16 en las etapas neuronales; parametros CPU en FP16 con recurrencia FP32; vocoder GPU en FP16 con normalizacion FP32 (v1.0) |
| Idiomas soportados | Ingles (variante americana) |
| Licencia | Apache 2.0 |
| Formato de pesos | Assets `.aimodel` (Core AI) y `cpu.f16`/`cpu.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una destilacion de Kokoro orientada a un unico hablante (voz "Heart") en ingles americano. La version v1.1 distribuye el calculo en cuatro etapas: una red de texto que consume hasta 512 slots de token (incluyendo tokens de frontera), un predictor de pitch y ruido, un tronco acustico que produce 2.048 frames acusticos y una cabeza de forma de onda que opera a 80 frames por segundo. Esta cabeza predice ganancias armonicas, ajustes de fase, ganancias de ruido y desplazamientos de pulso; la reconstruccion nativa en Swift sintetiza la fuente de 64 armonicos, ruido blanco modulado en pitch y ruido de rafaga de ventana corta, con rejillas STFT centradas y con relleno reflectante de 600 puntos/150 muestras y 150 puntos/75 muestras. La fase fundamental se acumula en FP64 antes de la interpolacion a FP32.

La version v1.0 emplea una arquitectura de forma de onda distinta, basada en un generador de sobremuestreo, ISTFT y correccion de fase, con pesos INT8 y activaciones FP16 en las etapas de texto/prosodia/acustica, y vocoder GPU en FP16 con normalizacion FP32. El paquete incluye el frontend Misaki de ingles americano (11,0 MB) con tokenizacion y POS entrenados sobre spaCy, procesamiento lexico contextual, manejo de numeros y un fallback de pronunciacion basado en BART. La politica de planificacion es "sentence-first": cada frase se fonemiza en contexto y las frases que exceden 510 fonemas mas dos tokens de frontera se dividen en el ultimo punto de fonema que quepa. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; el modelo base es una destilacion, por lo que hereda el entrenamiento de Kokoro.

## Capacidades

- Sintesis de texto a voz en ingles americano con una unica voz entrenada ("Heart").
- Acepta texto plano o fonemas explicitos como entrada.
- Genera audio PCM mono a 24 kHz.
- Fonemizacion contextual con 510 fonemas mas dos tokens de frontera, con division automatica de frases largas.
- Frontend de texto integrado (Misaki) con tokenizacion, POS, procesamiento lexico, numeros y fallback de pronunciacion BART.
- Ejecucion hibrida en Apple Silicon: ANE para texto y cabeza de forma de onda, GPU para prosodia y acustica, CPU para recurrencias.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo "thinking"; es exclusivamente un modelo TTS.
- Sin capacidades multilingues: solo ingles americano.

## Casos de uso

- Lectura por voz de articulos y documentos en aplicaciones macOS/iOS: el modelo sintetiza frases completas de hasta 510 fonemas con planificacion contextual, lo que permite narrar textos largos manteniendo coherencia prosodica y sin salir del dispositivo.
- Asistentes de voz locales en Apple Silicon: al ejecutarse sobre ANE/GPU con Core AI y sin runtime Python, se puede integrar en apps nativas Swift para respuestas habladas de baja latencia (121 ms para tres frases cortas en M3).
- Accesibilidad: conversion de texto a voz para usuarios con discapacidad visual en entornos Apple, con generacion local que evita enviar contenido a servicios en la nube y cumple con requisitos de privacidad.
- Audiolibros y contenido narrado de larga duracion: con RTFx de 90,47x en M3 y 141,2x en M5 Max, un texto completo tipo discurso de JFK (748,75 s de audio) se sintetiza en 8,276 s y 5,303 s respectivamente, lo que hace viable procesar horas de texto en minutos.
- Previsualizacion de voz en pipelines de produccion de audio: la velocidad de sintesis permite generar borradores de narracion para revision antes de una locucion humana definitiva, integrable en herramientas de edicion en macOS.
- Sistemas de respuesta interactiva (IVR) y notificaciones habladas en apps de escritorio: la latencia baja en frases cortas y la ejecucion en Neural Engine permiten generar mensajes hablados bajo demanda sin bloquear la interfaz.
- Prototipado de interfaces conversacionales en investigacion: al ser un modelo pequeno (7,88 M de parametros) y con licencia Apache 2.0, sirve como banco de pruebas para estudiar prosodia y planificacion sentence-first en TTS destilados.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de velocidad de sintesis (no de calidad perceptual) proporcionadas por el autor en la model card. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo TTS.

| Release | Hardware | Entrada | Audio generado | Sintesis mediana | RTFx |
|---|---|---|---:|---:|---:|
| v1.0 | M3 MacBook Air, 16 GB, macOS 27.0.1, Swift 6.4 | Sunlight, tres frases cortas | 6,900 s | 494,57 ms | 13,95x |
| v1.1 | M3 MacBook Air, 16 GB, macOS 27.0.1, Swift 6.4 | Sunlight, tres frases cortas | 6,900 s | 121,29 ms | 56,89x |
| v1.0 | M3 MacBook Air, 16 GB | Transcripcion completa de referencia JFK | 748,750 s | 13,794 s | 54,28x |
| v1.1 | M3 MacBook Air, 16 GB | Transcripcion completa de referencia JFK | 748,750 s | 8,276 s | 90,47x |
| v1.0 | M5 Max MacBook Pro, 18 CPU / 40 GPU, 64 GB, macOS 27.2.1 | Texto completo, voz Heart | 748,675 s | 4,377 s | 171,0x |
| v1.1 | M5 Max MacBook Pro, 18 CPU / 40 GPU, 64 GB, macOS 27.2.1 | Texto completo, voz Heart | 748,675 s | 5,303 s | 141,2x |

En el caso de v1.0, una ejecucion adicional de tres pasadas en modo Automatic alcanzo 170,5x. Las mediciones en M3 son medianas de tres pasadas en caliente con texto ordinario, incluyendo Misaki, planificacion y sintesis completa de forma de onda; la preparacion inicial, el calentamiento y la escritura WAV se miden por separado. La voz empleada es Heart, velocidad 1 y semilla 42, con un solo carril de sintesis. El autor advierte que estas mediciones de planificacion y capacidad no establecen una clasificacion de calidad perceptual entre versiones.

## Requisitos de hardware

- VRAM/RAM estimada: el paquete completo ocupa 22,2 MB (v1.1) y 23,0 MB (v1.0) en disco; en memoria, los pesos INT8/FP16 y las tablas de senal (26.654 valores FP32 en `signal.f32`) requieren un consumo muy bajo, no especificado en detalle en la informacion disponible.
- GPU/SoC recomendados: Apple Silicon con Neural Engine. Las mediciones oficiales se realizaron en M3 MacBook Air (16 GB) y M5 Max MacBook Pro (18 CPU, 40 GPU, 64 GB).
- Compatibilidad con GPU de consumo: no se documenta soporte para GPUs NVIDIA o AMD; el paquete esta disenado para Core AI y Apple Silicon. No hay datos sobre ejecucion en RTX 4090, A100 o H100.
- Opciones de despliegue: runtime Glade con Core AI; los assets `.aimodel` se especializan en el dispositivo en el primer uso. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 121,29 ms para 6,900 s de audio en M3 (v1.1) y 56,89x RTFx; 8,276 s para 748,750 s de audio en M3 (90,47x RTFx); 5,303 s para 748,675 s en M5 Max (141,2x RTFx). En v1.0, 494,57 ms para 6,900 s en M3 (13,95x) y 4,377 s para 748,675 s en M5 Max (171,0x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coder543/paradee-8m-glade (v1.1) | 7.884.450 | 512 tokens / 2.048 frames | Ingles americano | Apache 2.0 | Hugging Face, runtime Glade (Apple Silicon) |
| sahilmahendrakar/Paradee-8M-v1.1 (modelo base) | 7.884.450 | 512 tokens / 2.048 frames | Ingles americano | no disponible en la informacion | Hugging Face |
| Kokoro (modelo del que destila Paradee) | no disponible en la informacion | no disponible | Multiples idiomas | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks de calidad perceptual ni de comparativas directas con otros modelos TTS en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta ingles americano y una unica voz ("Heart"); no hay seleccion de hablante ni otros idiomas.
- El alcance de ejecucion esta restringido a Apple Silicon con Core AI y el runtime Glade; no hay soporte documentado para GPUs NVIDIA, AMD ni entornos Linux/Windows.
- El paquete no incluye las caches de dispositivo compiladas; la especializacion en ANE/GPU ocurre en el primer uso, lo que puede introducir latencia inicial no reflejada en los benchmarks en caliente.
- El autor senala que las mediciones de velocidad no establecen una clasificacion de calidad perceptual; no se aportan metricas subjetivas (MOS) ni comparativas de naturalidad.
- Riesgo de errores de pronunciacion en palabras fuera del dominio cubierto por el frontend Misaki y el fallback BART; no se documenta su cobertura.
- La politica sentence-first divide frases que exceden 510 fonemas, lo que puede afectar a la prosodia en entradas muy largas o con puntuacion atipica.
- No se detallan sesgos del modelo base ni del dataset de entrenamiento; al ser una destilacion de Kokoro, hereda las caracteristicas y posibles sesgos del original, no documentados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias explicitas sobre el rendimiento en produccion ni sobre la calidad del audio en todos los dominios.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica una validacion externa muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coder543/paradee-8m-glade
- Modelo base v1.1: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.1
- Modelo base v1.0: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.

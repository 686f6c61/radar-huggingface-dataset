# litert-community/LFM2.5-1.2B-Instruct

## Resumen

LFM2.5-1.2B-Instruct es un modelo de lenguaje de 1.200 millones de parámetros desarrollado por Liquid AI, diseñado específicamente para inferencia en dispositivo (on-device) y entornos edge. Su arquitectura es híbrida: combina bloques de convolución corta con compuertas (gated short-convolution) y atención con consultas agrupadas (grouped-query attention), una combinación poco habitual que busca reducir el coste computacional y de memoria frente a los transformers densos convencionales manteniendo la calidad de un modelo de su tamaño.

La entrada que nos ocupa, `litert-community/LFM2.5-1.2B-Instruct`, no es el modelo original sino su conversión al formato LiteRT-LM (`.litertlm`) realizada por la comunidad litert-community, para ejecutarse con el runtime LiteRT-LM de Google (el sucesor de TensorFlow Lite). Se distribuye en tres variantes cuantizadas: int8 dinámica (1,25 GB), int4 blockwise-32 con lineales OCTAV (736 MB) y una reexportación int4 compatible con GPU. La ventana de contexto del bundle está limitada a 4096 tokens de caché KV.

El interés actual reside en su perfil de despliegue: según la model card, supera a Qwen3-1.7B y Gemma 3 1B en benchmarks de conocimiento y seguimiento de instrucciones con una huella menor, y las mediciones en dispositivo publicadas muestran 41 tok/s de decodificación en un Galaxy S26 (int8, CPU) y 20,4 tok/s en un Pixel 8a. Es, por tanto, una opción relevante para aplicaciones móviles y embebidas que necesiten un LLM local con soporte de tool calling y modo de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: bloques de convolución corta con compuertas + atención con consultas agrupadas (GQA) |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens máximo de caché KV en este bundle (recomendado 1024 para chat) |
| Tipos de cuantizacion | int8 dinámica (lineales, convoluciones y embedding); int4 blockwise-32 con lineales OCTAV, embedding int8 y convoluciones en float; variante int4 reexportada para GPU |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en safetensors |
| Tamano del repo | 10,1 GB |
| Tamano de los ficheros | int8: 1,25 GB; int4: 736 MB; int4_gpu: 736 MB |
| Backend | CPU para todos los ficheros; `_int4_gpu` también en GPU (OpenCL en Android, Metal en macOS e iOS) con litert-lm ≥ 0.16.0 |
| Runtime requerido | litert-lm ≥ 0.15 (los ficheros reempaquetados el 2026-10-13 con tipo de modelo `lfm2` requieren 0.15) |
| Plantilla de chat | ChatML (`<|im_start|>…<|im_end|>`) con soporte de lista de herramientas y canal `<think>`, incluida en el bundle |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido en el que los bloques de atención con consultas agrupadas se intercalan con bloques de convolución corta con compuertas. Este diseño reduce el estado recurrente y el coste de atención en secuencias largas, lo que explica que el bundle pueda operar con una caché KV de solo 4096 tokens y que el runtime necesite metadatos específicos (`ExecutorMetadata`) para enlazar los buffers de estado híbridos conv/attention. La model card de esta conversión no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo base de Liquid AI y no se incluyen en la información disponible.

La innovación técnica destacable de esta entrada no está en el entrenamiento sino en el proceso de conversión y cuantización. La receta int8 aplica cuantización dinámica a lineales, convoluciones y embedding; la receta int4 usa cuantización por bloques de 32 con lineales OCTAV, embedding int8 y convoluciones en float. Según las mediciones publicadas, la conversión int8 alcanza paridad con la referencia en PyTorch bf16 (81 % frente a 79 % en GSM8K, dentro del ruido estadístico), mientras que int4 cede 7 puntos (72 %) a cambio de un 41 % menos de tamaño de descarga. El bundle incorpora tokenizador, plantilla de chat completa y parada limpia en `<|im_end|>`.

## Capacidades

- Generación de texto y seguimiento de instrucciones en conversaciones multi-turno.
- Razonamiento matemático con cadena de pensamiento: la evaluación GSM8K se realizó en modo 0-shot chain-of-thought, y el bundle declara un canal `<think>` en la plantilla.
- Razonamiento general y conocimiento factual: según la model card del modelo base, supera a Qwen3-1.7B y Gemma 3 1B en benchmarks de conocimiento y seguimiento de instrucciones.
- Tool calling / function calling: la plantilla de chat incluida soporta listas de herramientas.
- Modo de razonamiento explícito mediante el canal `<think>`.
- Ejecución en CPU y GPU en dispositivo: Android (OpenCL), macOS e iOS (Metal) para el fichero `_int4_gpu`; CPU para todos los ficheros.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Asistentes conversacionales en aplicaciones móviles: el modelo cabe en 736 MB en int4 y decodifica a 41 tok/s en un Galaxy S26 con CPU, lo que permite respuestas interactivas sin conexión a un servidor y sin coste de API.
- Respuesta a preguntas sobre documentos cortos en el dispositivo: con 4096 tokens de caché KV puede procesar correos, notas o fragmentos de manuales y responder sin enviar datos personales a la nube, algo relevante por privacidad y cumplimiento del RGPD.
- Automatización de tareas con herramientas en apps Android: la plantilla ChatML con soporte de lista de herramientas permite definir funciones (calendario, clima, contactos) y dejar que el modelo emita llamadas estructuradas que la aplicación ejecute.
- Razonamiento matemático asistido en entornos educativos o de campo: con un 81 % en GSM8K (int8) puede resolver problemas aritméticos de varios pasos en un Raspberry Pi 5 a 9,3 tok/s (int4) o 7,0 tok/s (int8), suficiente para un tutor offline.
- Prototipado y evaluación de pipelines edge: el formato `.litertlm` y el runtime litert-lm permiten validar latencias reales (TTFT de 440 ms en Galaxy S26 int8) antes de comprometerse con un modelo mayor o con infraestructura cloud.
- Procesamiento por lotes de bajo volumen en dispositivos sin GPU: en un Raspberry Pi 5 con 4 hilos, el prefill de 54 tok/s (int4) y 75 tok/s (int8) hace viable clasificar o resumir textos cortos en un dispositivo de 8 GB.
- Filtrado y moderación local de contenido: la baja latencia de prefill (491 tok/s en Galaxy S26 int8) permite clasificar entradas de usuario en tiempo real antes de enviarlas a un servicio remoto.

## Benchmarks y rendimiento

GSM8K, greedy, 0-shot chain-of-thought, máximo 1024 tokens, n=100, mismo arnés para todas las filas:

| Configuración | GSM8K |
|---|---|
| PyTorch bf16 (referencia) | 79 % |
| LiteRT int8 (este repositorio) | 81 % |
| LiteRT int4-b32 OCTAV (este repositorio) | 72 % |

Mediciones en dispositivo publicadas en la model card:

| Dispositivo | Fichero | Backend | Decode | Prefill | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | int8 | CPU | 41,0 tok/s | 491 tok/s | 440 ms |
| Pixel 8a | int8 | CPU | 20,4 tok/s | 143 tok/s | 1,48 s |
| Raspberry Pi 5 (4 hilos) | int8 | CPU | 7,0 tok/s | 75 tok/s | 3,56 s |
| Raspberry Pi 5 (4 hilos) | int4 | CPU | 9,3 tok/s | 54 tok/s | 4,84 s |
| Galaxy S26 | int4 | GPU | No ejecutó: `engine_create_failed` (2026-08-23) | — | — |
| Apple M4 Max | int8 | CPU | 101 tok/s (presupuesto 1024) / 77 tok/s (presupuesto 4096) | — | — |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otras comparativas numéricas frente a modelos de la competencia; la afirmación de superioridad frente a Qwen3-1.7B y Gemma 3 1B procede de la model card del modelo base y no incluye cifras en esta entrada.

## Requisitos de hardware

- VRAM/RAM estimada: 1,25 GB para int8 y 736 MB para int4 (pesos); añadir la caché KV, que crece con el presupuesto de tokens hasta 4096. En la práctica, un dispositivo con 3-4 GB de RAM libre es suficiente para int8 con contexto moderado.
- GPU recomendadas: no se especifican modelos de datacenter; el objetivo son GPU integradas y móviles. El fichero `_int4_gpu` funciona con OpenCL en Android y Metal en macOS e iOS. En un Galaxy S26 con GPU falló la creación del motor con litert-lm 0.16.0, aunque la verificación posterior en un Pixel 8a con litert-lm 0.16.1 completó turnos de texto tanto en GPU como en CPU.
- Cabe en GPU de consumo: no hay datos de RTX 4090, A100 o H100 en la información disponible; el modelo está pensado para SoC móviles y placas como Raspberry Pi 5.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`), AI Edge Gallery en Android; el modelo base puede desplegarse con otros runtimes, pero esta conversión es específica de LiteRT-LM.
- Latencia y throughput: ver tabla de benchmarks. En iOS es obligatorio fijar `maxNumTokens` a 1024; un valor distinto rompe la creación del motor. En Apple M4 Max, la decodificación int8 cae de 101 a 77 tok/s al pasar el presupuesto de 1024 a 4096 tokens, por lo que conviene ajustar `--max-num-tokens` al mínimo necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Formato edge |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (esta conversión) | 1,2B | 4096 (caché KV) | 81 % int8 / 72 % int4 | LFM Open License v1.0 | `.litertlm` |
| Qwen3-1.7B | 1,7B | No disponible | No disponible | No disponible | No disponible en esta entrada |
| Gemma 3 1B | 1B | No disponible | No disponible | No disponible | No disponible en esta entrada |

La model card del modelo base afirma que LFM2.5-1.2B-Instruct supera a Qwen3-1.7B y Gemma 3 1B en conocimiento y seguimiento de instrucciones con menor huella, pero no se aportan cifras de esos benchmarks en la información disponible, por lo que la comparación cuantitativa no puede verificarse aquí.

## Limitaciones y advertencias

- Contexto limitado: la caché KV de este bundle está limitada a 4096 tokens; no es adecuado para documentos largos ni conversaciones extensas sin truncado o resumen intermedio.
- Idiomas: no se especifica la cobertura lingüística; no hay garantía documentada de rendimiento en castellano.
- Alucinación: como todo LLM de 1,2B, la tasa de error factual es mayor que en modelos de mayor tamaño; el 81 % en GSM8K no implica precisión equivalente en conocimiento abierto.
- Pérdida por cuantización: int4 baja 7 puntos en GSM8K respecto a int8 y a la referencia bf16; para tareas sensibles a la precisión conviene usar int8 a costa del doble de tamaño.
- Bug conocido de conversación: en litert-lm 0.18.0, al iniciar una nueva conversación sobre un motor que ya ejecutó otra, el runtime reutiliza el estado de convolución corta de la conversación anterior y no lo reinicia (informe abierto en el repositorio de LiteRT-LM). La recomendación es usar un motor por conversación; las pruebas publicadas solo cubren tres preguntas cortas y no permiten extrapolar a conversaciones largas.
- Compatibilidad de runtime: los ficheros reempaquetados el 2026-10-13 necesitan litert-lm ≥ 0.15; versiones anteriores fallan con `missing some output TensorBuffers`.
- iOS: es obligatorio fijar `maxNumTokens` a 1024; otro valor impide crear el motor.
- GPU Android: hay al menos un fallo documentado de creación de motor en Galaxy S26 con litert-lm 0.16.0; verificar en el dispositivo objetivo antes de producción.
- Licencia: LFM Open License v1.0, no es una licencia de código abierto estándar; deben revisarse sus condiciones antes de uso comercial. La conversión mantiene la licencia del modelo base.
- Este repositorio es una conversión comunitaria, no oficial de Liquid AI; los pesos y el grafo son idénticos al modelo base, pero el soporte depende del proyecto litert-community y del runtime de Google.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Informe del bug de reutilización de estado entre conversaciones: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Ficha de compatibilidad edge (int4): https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-instruct-int4/CARD.md
- Ficha de compatibilidad edge (int8): https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-instruct-int8/CARD.md
- Benchmark de runtimes en Apple Silicon y Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md

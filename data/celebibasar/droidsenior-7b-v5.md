# celebibasar/DroidSenior-7B-v5

## Resumen

DroidSenior-7B-v5 es un modelo de lenguaje especializado en desarrollo Android y Kotlin, desarrollado por el usuario de Hugging Face celebibasar. Se construye mediante un ajuste fino supervisado (SFT) y aprendizaje por refuerzo con GRPO sobre el modelo base Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7.615.616.512 parámetros. El objetivo es generar codigo Kotlin idiomatico y actualizado para el stack estable de Android, evitando APIs obsoletas y siguiendo la guia oficial de arquitectura (Jetpack Compose, Coroutines/Flow, Hilt, Room).

La version v5 se diferencia de las anteriores (v1 a v4) en que se entrena en una sola pasada desde el modelo base limpio, sin encadenar checkpoints intermedios. Parte de sus datos sinteticos se generaron con versiones previas de DroidSenior y con modelos docentes locales de pesos abiertos, principalmente Qwen2.5-Coder-32B-Instruct ejecutado en 4 bits. El modelo esta calibrado contra las versiones estables disponibles el 8 de noviembre de 2026: AGP 9.5.1, Kotlin 2.4.21, Gradle 9.9.0, compileSdk 37 y Compose BOM 2026.09.00.

Es relevante para equipos que necesitan un asistente de codigo Android que conozca el stack moderno y que pueda integrarse en flujos de reparacion multi-turno con feedback del compilador. Su licencia Apache 2.0 y su tamano de 7B lo hacen desplegable en hardware moderado, incluyendo GPU de consumo mediante cuantizacion GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (4,68 GB); otras no disponibles |
| Idiomas soportados | en, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-7B-Instruct, con atencion por causalidad estandar y sin componentes MoE ni SSM. El ajuste se realizo en dos fases. La primera, SFT con LoRA de rango 64 y alpha 128, utilizo 7.614 ejemplos unicos distribuidos en varias fuentes: 1.854 verificados, 735 de ornith, 1.851 de teacher_2026, 295 de build, 1.042 minados, 128 de teacher_new, 1.627 de reparacion y 82 de repair_new. Los ejemplos nuevos de 2026 se ponderaron al doble y los ejemplos multi-turno de reparacion al triple; en estos ultimos la funcion de perdida cubre solo la respuesta final corregida.

La segunda fase, GRPO, se ejecuto durante 150 pasos con 8 respuestas muestreadas por pregunta y una recompensa basada en el compilador: 1,0 para compilacion limpia, 0,75 con avisos de deprecacion, 0,30 si solo compila tras auto-importacion, 0,05 para codigo que no compila y 0 para respuestas sin codigo. El modelo docente para los datos nuevos fue Qwen2.5-Coder-32B-Instruct en 4 bits, ejecutado localmente. Cada respuesta objetivo se compilo contra las versiones objetivo con imports completos y sin avisos de deprecacion, y las preguntas de evaluacion se eliminaron del conjunto de entrenamiento.

## Capacidades

- Generacion de codigo Kotlin moderno para Android, incluyendo Jetpack Compose, Coroutines/Flow, Hilt y Room.
- Reparacion multi-turno a partir de la salida del compilador: el modelo fue entrenado para recibir errores como mensaje de usuario y corregir la respuesta.
- Uso de pistas de API: acepta un bloque con imports relevantes del proyecto para orientar la generacion.
- Razonamiento sobre decisiones de diseno y trade-offs, con explicaciones breves.
- Evitacion de APIs obsoletas y de versiones de librerias desactualizadas en las respuestas.
- Generacion de tests cuando aportan valor, segun el prompt de sistema.
- Capacidades multilingues limitadas a ingles y turco.
- Soporte de conversacion multi-turno.
- No se documentan capacidades de vision, audio, tool calling generico ni modo de pensamiento explicito.

## Casos de uso

- Asistente de codigo en el IDE para Android: el modelo genera fragmentos de Kotlin con Compose y puede recibir la salida del compilador como siguiente mensaje para reparar errores de compilacion, reduciendo el ciclo de iteracion del desarrollador.
- Migracion de APIs obsoletas: se le pueden plantear preguntas de migracion y el modelo fue entrenado para migrar efectivamente, evitando APIs deprecadas y versiones antiguas de librerias.
- Generacion de pantallas con Jetpack Compose: produce composables idiomaticos siguiendo la guia de arquitectura oficial, util para prototipado rapido de UI.
- Integracion de Room con KSP: el modelo ha sido evaluado con procesamiento de anotaciones Room mediante KSP, por lo que es adecuado para generar entidades, DAOs y consultas con imports correctos.
- Reparacion automatizada en CI: dado un fallo de `:app:compileDebugKotlin`, se puede enviar el error al modelo con el formato de reparacion entrenado para obtener una correccion candidata que luego se valide en el pipeline.
- Formacion y revision de codigo: sirve como revisor que explica decisiones de diseno y trade-offs en revisiones de pull requests de Android.
- Generacion de tests: puede producir tests cuando aportan valor, segun su prompt de sistema, para acompanar la implementacion generada.
- Asistencia en turco e ingles: equipos que trabajan en estos idiomas pueden interactuar con el modelo en su lengua, ya que responde en el idioma del usuario.

## Benchmarks y rendimiento

Resultados de evaluacion del autor con decodificacion greedy, mismo prompt de sistema y 368 preguntas reservadas no usadas en entrenamiento. Los intervalos son del 95% por bootstrap.

| Modelo | pass@1 | pass@1 y actual | + auto import | + 2 rondas de reparacion | pass@1 con pistas de API | Kotlin HumanEval |
|---|---|---|---|---|---|---|
| v4 | 46,2% (41%-51%) | 45,7% (40%-51%) | 54,6% (49%-60%) | 56,2% (51%-61%) | n/a | 72,7% (66%-80%) |
| sft | 64,4% (60%-69%) | 62,8% (58%-68%) | 69,6% (65%-74%) | 79,3% (75%-83%) | 66,3% (61%-71%) | 67,7% (60%-75%) |
| grpo | 67,9% (63%-73%) | 66,6% (61%-71%) | 72,0% (67%-77%) | 82,3% (79%-86%) | 67,9% (63%-73%) | 67,1% (60%-75%) |

Notas de evaluacion: pass@1 significa que la primera respuesta compila con `:app:compileDebugKotlin` en un proyecto plantilla; se comprueba el procesamiento de anotaciones Room (KSP) pero no el de Hilt, y no se prueba el comportamiento en tiempo de ejecucion. "Actual" anade que no haya avisos de deprecacion, versiones desactualizadas ni migraciones sin completar. Auto import, reparacion y pistas de API son resultados de sistema con herramientas alrededor del modelo. v4 se re-evaluo en el mismo entorno desde sus respuestas almacenadas. Los problemas mas frecuentes en respuestas que fallaron fueron: unresolved_reference 53, type_mismatch 16, otros 15, wrong_arguments 11, room_ksp 8 y suspend_context 5.

Rendimiento del GGUF Q4_K_M: 4,68 GB y 7,9 tokens/s en CPU sobre Colab.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda GPU con 24 GB o mas.
- Cuantizacion GGUF Q4_K_M: 4,68 GB, apta para GPU de consumo con 8 GB o mas de VRAM.
- GPU recomendadas: A100, H100 o L40S para servicio en produccion con contexto largo; RTX 4090 (24 GB) para inferencia en bf16; RTX 3090, 4080 o 4070 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores con cuantizacion Q4_K_M.
- Opciones de despliegue: transformers, text-generation-inference (TGI) segun tags del repositorio, llama.cpp/Ollama para GGUF y vLLM como alternativa compatible con arquitectura Qwen2.
- Latencia y throughput: 7,9 tokens/s en CPU con Q4_K_M en Colab; no se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B-v5 | 7,6B | no disponible | Android/Kotlin | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7,6B | no disponible | Codigo general | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-32B-Instruct | 32B | no disponible | Codigo general | Apache 2.0 | Hugging Face |

El modelo base Qwen2.5-Coder-7B-Instruct es la referencia directa: DroidSenior-7B-v5 lo especializa en Android y Kotlin, sacrificando probablemente generalidad en otros lenguajes a cambio de mayor precision en el stack Android. Qwen2.5-Coder-32B-Instruct se uso como docente y ofrece mayor capacidad general, pero requiere hardware muy superior y no esta especializado en Android. No se dispone de datos de benchmarks comparativos con otros asistentes Android de pesos abiertos.

## Limitaciones y advertencias

- El codigo generado puede seguir siendo incorrecto; debe revisarse antes de usarlo.
- Las evaluaciones son auto-ejecutadas por el autor, no un resultado oficial de Android Bench.
- El modelo solo conoce versiones de librerias hasta el 8 de noviembre de 2026; releases posteriores le son desconocidas.
- Idiomas soportados limitados a ingles y turco; el rendimiento en castellano no esta documentado.
- La evaluacion no comprueba el procesamiento de anotaciones Hilt ni el comportamiento en tiempo de ejecucion, solo compilacion y KSP de Room.
- Riesgo de alucinacion en APIs, imports y versiones de librerias, mitigado parcialmente por las pistas de API y las rondas de reparacion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el codigo generado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validacion por la comunidad es inexistente.
- Parte de los datos de entrenamiento son sinteticos y generados por modelos docentes, lo que puede propagar sesgos o errores de esos modelos.

## Enlaces

- Hugging Face: https://huggingface.co/celebibasar/DroidSenior-7B-v5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset android-kotlin-compose-compiler-verified: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset ornith-android-instruct: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Modelo docente: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct

# DRUPEs/CherryPit-1.3-2B-GGUF

## Resumen

CherryPit-1.3-2B es un modelo de lenguaje causal de aproximadamente 2.000 millones de parametros, desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems) como cuarta iteracion de la familia CherryPit. Se construye sobre MiniCPM5-2B de openbmb y se distribuye principalmente como cuantizacion GGUF para inferencia en dispositivo (on-device) mediante llama.cpp, Ollama y LM Studio. Su enfoque es un modelo pequeno y rapido, orientado a matematicas, generacion de codigo, desarrollo web y seguimiento de instrucciones, con soporte de tool calling a traves de su plantilla de chat integrada.

La version 1.3 introduce una mejora sustancial en matematicas mediante una fusion de pesos (weight merge) con Caldalis/MiniCPM5-2B-Math, un fine-tune matematico del mismo modelo base bajo licencia Apache-2.0. Segun la model card, la fusion se complementa con un fine-tune sobre datos propios verificados y una mezcla 75/25 con un modelo de la linea CherryPit-1.2. El resultado mantiene exactamente el mismo tamano y arquitectura que la version anterior, sin anadir parametros.

El modelo declara una longitud de contexto de 128K tokens (131.072), soporte de modo thinking activable y desactivable, y una licencia Apache-2.0 que permite uso comercial. Su relevancia actual radica en ofrecer capacidades de razonamiento matematico y generacion de codigo en un formato que cabe en hardware de consumo, con una cuantizacion Q4_K_M descrita como casi sin perdida gracias a un redondeo con reconocimiento de Hessiano (estilo GPTQ) escrito en el formato estandar Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estandar tipo Llama |
| Parametros totales | 2.516.756.480 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantizacion | Q4_K_M disponible; F16 hasta 2-bit anunciados como proximos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors bf16 en DRUPEs/CherryPit-1.3-2B |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal estandar tipo Llama, con aproximadamente 2B parametros y sin componentes de mezcla de expertos. Parte de MiniCPM5-2B de openbmb y se construye en dos fases principales. Primero, se promedian los pesos de CherryPit-1.1 con Caldalis/MiniCPM5-2B-Math, un fine-tune matematico Apache-2.0 del mismo modelo base. Segun el autor, esta fusion supera a ambos progenitores en matematicas de presupuesto largo: conserva la velocidad de 1.1 y la meticulosidad del modelo matematico, y reduce la frecuencia de comprometerse con respuestas incorrectas.

Sobre esa fusion se aplica un fine-tune con datos propios verificados (aplicaciones web, Python, seguimiento de instrucciones y respuestas de codigo que superaron sus tests), y posteriormente una mezcla 75/25 con un modelo de la linea CherryPit-1.2. El autor indica que ninguna de las benchmarks reportadas se uso para entrenamiento: las tareas de web-app se generaron internamente y el entrenamiento de codigo empleo problemas antiguos de LiveCodeBench publicados antes del conjunto de test v6. La cuantizacion Q4_K_M incorpora redondeo con reconocimiento de Hessiano (estilo GPTQ) dentro del formato estandar, lo que segun el autor la acerca aproximadamente 2,2 veces mas a plena precision (KL media 0,026 frente a 0,058 con redondeo estandar).

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat integrada.
- Razonamiento matematico, con modo thinking activable para problemas de mayor dificultad (hasta 32K tokens nuevos en AIME).
- Generacion de codigo en Python y otras tareas de programacion.
- Desarrollo web: generacion de componentes React con una a cuatro funcionalidades combinadas (benchmark WebApp1K).
- Tool calling / function calling soportado mediante la plantilla de chat incorporada.
- Seguimiento de instrucciones estricto (evaluado con IFEval en modo strict).
- Modo thinking activable y desactivable: activado por defecto en la plantilla de chat; desactivable con `--chat-template-kwargs '{"enable_thinking":false}'` en llama.cpp o mediante el toggle de razonamiento en otras aplicaciones.
- Identidad controlada: sin system prompt, solo se presenta cuando se le pregunta quien es.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Asistencia matematica en dispositivo: resolucion de problemas de competicion y calculo paso a paso con el modo thinking activado, aprovechando el salto en AIME (79,2) y MATH-500 (91,8) para un modelo de 2B que cabe en portatiles.
- Generacion de componentes React: creacion de componentes con varias funcionalidades combinadas (hasta cuatro segun WebApp1K Quartet, 35,0), util para prototipado rapido de interfaces en entornos locales sin conexion.
- Autocompletado y generacion de codigo Python en editores: con HumanEval+ de 84,1 y MBPP+ de 68,8 en modo sin thinking, adecuado para asistencia de codigo de baja latencia integrada en IDE.
- Agentes locales con tool calling: la plantilla de chat permite function calling, lo que habilita agentes que consultan herramientas o APIs en flujos multi-paso ejecutados en hardware de consumo.
- Procesamiento de documentos largos: con 128K tokens de contexto, puede resumir o extraer informacion de documentos extensos en ingles en una sola pasada, siempre que el hardware soporte la ventana completa.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse via Ollama, LM Studio o llama.cpp en local, permite procesar datos sensibles sin enviarlos a servicios en la nube.
- Servidor compatible con OpenAI: llama-server expone un endpoint `/v1/chat/completions` compatible con OpenAI, lo que facilita integrarlo en pipelines existentes que ya consumen esa API.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando CherryPit-1.3 con CherryPit-1.2 bajo el mismo harness (pesos bf16 en vLLM):

| Benchmark | Configuracion | CherryPit-1.2 | CherryPit-1.3 | Delta |
|---|---|---:|---:|---:|
| AIME 2025 + 2026 | thinking, 32K, 2 muestras | 67,5 | 79,2 | +11,7 |
| MATH-500 | sin thinking, greedy | 87,2 | 91,8 | +4,6 |
| WebApp1K-React, 1 funcionalidad | sin thinking, 1.000 tareas | 83,2 | 84,6 | +1,4 |
| WebApp1K Duo, 2 funcionalidades | sin thinking, 1.000 tareas | 48,3 | 52,7 | +4,4 |
| WebApp1K Trio, 3 funcionalidades | sin thinking, 1.000 tareas | 45,7 | 49,7 | +4,0 |
| WebApp1K Quartet, 4 funcionalidades | sin thinking, 1.000 tareas | 29,5 | 35,0 | +5,5 |
| LiveCodeBench v6 | thinking, 8K, media de 2 | 47,7 | 45,7 | -2,0 (no significativo) |
| LiveCodeBench v6 | sin thinking, media de 4 | 38,4 | 36,0 | -2,4 (no significativo) |
| HumanEval+ | sin thinking, greedy | 84,8 | 84,1 | -0,7 (no significativo) |
| MBPP+ | sin thinking, greedy | 68,3 | 68,8 | +0,5 |
| IFEval | strict, nivel de prompt | 86,1 | 87,2 | +1,1 |

El autor senala que en AIME, problema a problema, 1.3 resuelve 22 que 1.2 falla y falla 8 que 1.2 resuelve (test de signos de una cola, p = 0,008), y que ninguna benchmark empeoro de forma significativa tras comprobacion por item con tests de signos emparejados frente a 1.0, 1.1 y 1.2. Ademas, la Q4_K_M descomprimida de nuevo a bf16 no perdio nada en LiveCodeBench con thinking (+1,7, dentro del ruido; la Q4_K_M de 1.2 perdia 4,0) y 0,6 puntos en IFEval (la de 1.2 perdia 1,4).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 1,56 GB, por lo que requiere aproximadamente 2 GB de VRAM o memoria unificada, mas el espacio para la cache KV segun la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar la cuantizacion Q4_K_M; para contextos largos cercanos a 128K conviene una GPU con 16 GB o mas (RTX 4090, RTX 4080, A100, H100) o memoria unificada abundante en Apple Silicon.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama (`ollama run hf.co/DRUPEs/CherryPit-1.3-2B-GGUF:Q4_K_M`), LM Studio (busqueda en la pestana Discover). Para pesos bf16, vLLM segun el harness del autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Muestreo recomendado: temperatura 1,0 y top_p 0,95.
- Nota de integracion: si se renderiza la plantilla de chat manualmente hacia `/completion`, eliminar el `<s>` inicial, ya que el servidor anade el suyo y dos tokens de inicio hacen que el modelo dude mas; el endpoint `/v1/chat/completions` lo gestiona automaticamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CherryPit-1.3-2B | ~2B | 128K | Matematicas, codigo, web, tool calling | Apache 2.0 | GGUF (Q4_K_M); bf16 safetensors |
| CherryPit-1.2-2B | ~2B | 128K (segun version previa) | Matematicas, codigo, web | Apache 2.0 | GGUF |
| MiniCPM5-2B (openbmb) | ~2B | no disponible | Modelo base generalista | no disponible en la informacion | no disponible |
| Caldalis/MiniCPM5-2B-Math | ~2B | no disponible | Fine-tune matematico del mismo base | Apache 2.0 | no disponible |

La comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada. Los datos de rendimiento de CherryPit-1.2 frente a 1.3 se detallan en la seccion de benchmarks.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido incorrecto con apariencia de veracidad; el autor menciona que la fusion reduce la frecuencia de comprometerse con respuestas incorrectas en matematicas, pero no la elimina.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Modo thinking: activado por defecto; para respuestas cortas y directas debe desactivarse, y en tareas matematicas complejas requiere presupuestos de generacion amplios (hasta 32K tokens nuevos en AIME).
- Cuantizacion: solo esta disponible Q4_K_M en el momento de la publicacion; el resto de tamanos (F16 a 2-bit) estan anunciados pero no publicados.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los modelos base (MiniCPM5-2B y Caldalis/MiniCPM5-2B-Math) en la medida en que sus licencias originales apliquen.
- Rendimiento en codigo: LiveCodeBench v6 y HumanEval+ muestran ligeros descensos frente a 1.2 que el autor califica de no significativos; conviene validar en el caso de uso concreto antes de desplegar en produccion.
- Contexto largo: aunque declara 128K tokens, el coste de memoria de la cache KV y la degradacion de calidad en ventanas muy largas no estan documentados.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/DRUPEs/CherryPit-1.3-2B-GGUF
- Pesos de plena precision (bf16 safetensors): https://huggingface.co/DRUPEs/CherryPit-1.3-2B
- Version anterior: https://huggingface.co/DRUPEs/CherryPit-1.2-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Fine-tune matematico fusionado: https://huggingface.co/Caldalis/MiniCPM5-2B-Math

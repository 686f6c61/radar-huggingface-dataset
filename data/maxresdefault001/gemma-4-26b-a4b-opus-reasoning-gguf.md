# MaxResDefault001/gemma-4-26B-A4B-opus-reasoning-GGUF

## Resumen

Gemma 4 26B-A4B · Opus-reasoning tune (GGUF) es un ajuste fino (LoRA) del modelo Gemma 4 26B-A4B de Google en su variante QAT, publicado por el usuario MaxResDefault001 en HuggingFace. El autor ha entrenado el modelo sobre un dataset de aproximadamente 8.600 conversaciones de razonamiento estilo Claude Opus 4.6/4.7, con el objetivo de mejorar la eficiencia del modo "thinking" y reducir los rechazos moralizantes del modelo base. Se distribuye en formato GGUF cuantizado a Q4_K_M para su uso con llama.cpp, e incluye una variante "abliterated" (sin mecanismos de rechazo) generada con la herramienta Heretic.

El modelo base es una arquitectura MoE (mixture of experts) con 25.230 millones de parametros totales y unos 4.000 millones activos por token, lo que lo hace especialmente interesante para ejecutarse en hardware domestico con ancho de banda de memoria limitado. El proyecto es explicitamente un ejercicio de aprendizaje realizado en una unica maquina personal (GMKtec EVO-X2 con Ryzen AI Max+ 395 y Radeon 8060S con 128 GB de RAM unificada), y el autor comparte tanto los GGUF completos como el adaptador LoRA en safetensors (r16) para quien quiera fusionarlo con otras builds de Gemma 4 26B-A4B.

Los resultados publicados por el autor son honestos sobre la magnitud de las mejoras: la precision es practicamente identica al modelo stock, con ganancias marginales en razonamiento dificil y conocimiento, pero si se observan mejoras claras en eficiencia (aproximadamente un 14% menos de tokens de pensamiento), una reduccion de disclaimers moralizantes y, en la variante abliterated, la ausencia de rechazos duros. Es un modelo de nicho, orientado a usuarios de llama.cpp con hardware tipo Strix Halo que buscan un Gemma 4 mas directo y eficiente en modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), con torre de vision y cabeza draft MTP |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | Aproximadamente 4.000 millones (indicado por la denominacion A4B; cifra exacta no disponible) |
| Longitud de contexto | 65.536 tokens (valor usado en la configuracion recomendada; maximo del modelo base no disponible) |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base es QAT q4_0; cache de KV cuantizable a q8_0 |
| Idiomas soportados | No disponibles (dataset de ajuste en ingles; el modelo base Gemma 4 es multilingue, detalle no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelos completos) y safetensors (adaptador LoRA r16) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B-it-qat-q4_0-unquantized de Google, una arquitectura transformer de tipo mixture of experts con 26.000 millones de parametros totales de los que solo alrededor de 4.000 millones se activan por token. Esta caracteristica MoE, combinada con el entrenamiento consciente de cuantizacion (QAT) del modelo base, permite obtener buena calidad con cuantizaciones agresivas como Q4_K_M, lo que resulta en archivos de 16,8 GB. La torre de vision no fue entrenada, por lo que el proyector original (mmproj-BF16.gguf de Unsloth) sigue siendo funcional para tareas image-text-to-text. Adicionalmente, el ecosistema del modelo base incluye una cabeza draft MTP (multi-token prediction) que habilita decodificacion especulativa en llama.cpp.

El ajuste fino es un LoRA de rango 16 entrenado sobre el dataset angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, compuesto por unas 8.600 conversaciones de razonamiento en estilo Claude Opus 4.6/4.7. No se detalla el proceso de entrenamiento completo (hardware de entrenamiento, epocas, learning rate), aunque el autor indica que fue un proyecto de aprendizaje en una unica maquina domestica. La variante abliterated se genero posteriormente con Heretic, una herramienta que elimina los mecanismos de rechazo del modelo sin reentrenamiento. No hay indicios de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto con modo thinking (razonamiento extendido) activable mediante la plantilla de chat de Gemma 4 (`enable_thinking: true` o ajuste de reasoning-effort en el cliente).
- Razonamiento multi-paso en matematicas, logica y programacion, con respuestas verificables segun las suites propias del autor.
- Respuesta a preguntas de conocimiento factual.
- Entrada multimodal imagen-texto a texto: la torre de vision del modelo base funciona sin cambios usando el proyector stock de Unsloth.
- Menor tendencia a la moralizacion: reduccion de disclaimers tipo "lectura de principios" en peticiones borderline (de 8 a 3 sobre 27 en la suite del autor).
- Variante abliterated sin rechazos duros en la suite de sobre-rechazo del autor.
- Decodificacion especulativa mediante cabeza draft MTP, con aproximadamente un 45% mas de velocidad de generacion.
- Uso conversacional estandar con plantilla Jinja en llama.cpp.

## Casos de uso

- Razonamiento dificil local en hardware domestico: la combinacion MoE (4B activos) con cuantizacion Q4_K_M permite ejecutar problemas multi-paso de matematicas y logica en una GPU de consumo o APU como Strix Halo sin necesidad de datacenter.
- Agentes locales con llama.cpp: el modo thinking con temperatura 1.0 y contexto de 65.536 tokens permite encadenar pasos de razonamiento en pipelines automatizados servidos via `llama-server` con API compatible.
- Chatbots con menos moralizacion: la reduccion de disclaimers hace el modelo adecuado para asistentes conversacionales donde las advertencias repetitivas degradan la experiencia.
- Analisis de imagenes en local: manteniendo el proyector de vision stock, se puede usar para describir y razonar sobre imagenes junto con texto.
- Experimentacion con abliteration: el repositorio incluye el LoRA en safetensors y la variante Heretic, util como referencia para estudiar como la abliteration afecta a precision y sensibilidad a temperatura.
- Optimizacion de coste por token en modo thinking: con un 14% menos de tokens de pensamiento y menos pensamientos descontrolados que alcanzan el limite, reduce el tiempo y computo por problema dificil.
- Comparativas y evaluacion de modelos: las suites publicadas (hard, knowledge, refusal) y la tabla de sensibilidad a temperatura sirven como metodologia replicable para evaluar builds de Gemma 4.

## Benchmarks y rendimiento

Los unicos datos disponibles son las suites propias del autor (no benchmarks estandarizados como MMLU o GSM8K). Cada suite se ejecuto una vez por configuracion, por lo que diferencias de 2-3 puntos en "hard" estan dentro del ruido.

Thinking activado, temp 1.0 / top-p 0.95 / top-k 64 (configuracion recomendada):

| Modelo | Hard (34) | Knowledge (46) | Refusal (27) | Tokens por problema hard | Alcanza limite de tokens |
|---|---|---|---|---|---|
| Stock Gemma 4 | 28 | 45 | 19 | 9.937 | 6 |
| Este modelo (opus) | 29 | 46 | 24 | 8.559 | 5 |
| Este modelo (abliterated) | 28 | 46 | 25 | 9.568 | 5 |
| HauhauCS Uncensored Balanced | 27 | 45 | 23 | 10.618 | 7 |

Thinking desactivado, temp 0.6 / top-p 0.95:

| Modelo | Hard (34) | Knowledge (46) | Refusal (27) |
|---|---|---|---|
| Stock Gemma 4 | 31 | 44 | 20 |
| Este modelo (opus) | 29 | 46 | 22 |
| Este modelo (abliterated) | 28 | 45 | 22 |
| HauhauCS Uncensored Balanced | 29 | 45 | 22 |

Sensibilidad a temperatura (thinking activado, suite hard):

| Modelo | Temp 0.3 | Temp 0.6 | Temp 1.0 |
|---|---|---|---|
| Stock Gemma 4 | 19 | 25 | 28 |
| Este modelo (opus) | 22 | 27 | 29 |
| Este modelo (abliterated) | 16 | 23-24 | 28 |

Velocidad: aproximadamente 85 tok/s en Radeon 8060S (Vulkan) con la cabeza draft MTP, frente a unos 60 tok/s sin ella (+45%). No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: los GGUF Q4_K_M ocupan 16,8 GB cada uno; con contexto de 65.536 tokens y cache KV en q8_0, el consumo total ronda los 20 GB. El autor lo ejecuta en un APU Ryzen AI Max+ 395 (Strix Halo) con 128 GB de RAM unificada, donde el modelo cabe en la memoria dedicada a GPU asignable.
- Consumer GPUs: con 16,8 GB de pesos mas KV cache, cabe en GPUs de 24 GB (RTX 3090, RTX 4090) con contexto completo; en GPUs de 16 GB habria que reducir contexto o usar offload parcial a CPU.
- Configuracion recomendada del autor: `llama-server` con `-ngl 999`, contexto `-c 65536`, `-fa on`, cache KV en q8_0 (`-ctk q8_0 -ctv q8_0`), decodificacion especulativa draft-MTP con `mtp-gemma-4-26B-A4B-it.gguf` y muestreo a temp 1.0, top-k 64, top-p 0.95, min-p 0.
- Despliegue: llama.cpp (probado con build b11840, backend Vulkan, Ubuntu); compatible con Ollama y otros runtimes GGUF en principio, aunque solo hay pruebas documentadas en llama.cpp. El vision tower requiere el `mmproj-BF16.gguf` de unsloth/gemma-4-26B-A4B-it-qat-GGUF.
- Latencia y throughput: unos 85 tok/s con MTP draft y unos 60 tok/s sin el en Radeon 8060S via Vulkan; no hay datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Cuantizacion | Refusal (27) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma 4 26B-A4B opus-reasoning (este modelo) | 25,2B | ~4B | Q4_K_M | 24 (abliterated: 25) | Apache 2.0 | GGUF + LoRA en HuggingFace |
| Stock Gemma 4 26B-A4B (Unsloth UD-Q4_K_XL QAT) | 25,2B | ~4B | UD-Q4_K_XL | 19 | Gemma (modelo base) | GGUF en HuggingFace |
| HauhauCS Gemma4-26B-A4B-QAT-Uncensored "Balanced" | 25,2B | ~4B | No disponible | 23 | No disponible | GGUF en HuggingFace |

En precision, los cuatro estan empatados dentro del margen de ruido; las diferencias relevantes estan en eficiencia de thinking (este modelo usa menos tokens), tasa de rechazos (las variantes sin censura puntuan mejor) y velocidad (este modelo soporta MTP draft documentado). No hay comparativas con modelos de otras familias en la informacion disponible.

## Limitaciones y advertencias

- Sensibilidad fuerte a la temperatura: con thinking activado a temperaturas bajas (0.3), el modelo entra en bucles de pensamiento que agotan el limite de tokens (12-17 de 34 problemas en la suite hard). Es imprescindible usar temp 1.0 segun el autor.
- La variante abliterated es la mas afectada por los bucles a baja temperatura; no es apta para configuraciones de muestreo conservadoras con thinking.
- Mejoras de precision marginales: las ganancias sobre el modelo stock estan dentro del ruido estadistico (una sola ejecucion por configuracion); no esperar saltos de calidad en razonamiento.
- Abliteration incompleta: persisten algunos disclaimers en temas de salud (por ejemplo, notas de "bebe con moderacion"), que el harness del autor penaliza.
- Riesgo de alucinacion: no evaluado especificamente; al tratarse de un fine-tune ligero sobre datos sinteticos estilo Opus, el comportamiento factual fuera de las suites probadas no esta caracterizado.
- Sesgos: el autor midio inclinacion politica con el test 12axes (288 afirmaciones), pero la model card esta truncada y no incluye los resultados por eje; no disponibles.
- Idiomas: el dataset de ajuste es en ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Licencia: el fine-tune y el LoRA se publican bajo Apache 2.0, pero el modelo base de Google (Gemma 4) esta bajo la licencia Gemma, cuyos terminos de uso pueden aplicar en la practica al modelo derivado; conviene revisar la Gemma Terms of Use antes de uso comercial.
- Proyecto de aficionado: un solo autor, sin validacion externa; 218 descargas y 1 like en el momento de la ficha, sin auditoria comunitaria amplia.
- El vision tower no fue entrenado; el rendimiento multimodal depende del proyector stock y no se reevaluo mas alla de confirmar que funciona.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaxResDefault001/gemma-4-26B-A4B-opus-reasoning-GGUF
- Modelo base de Google: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- GGUF QAT de Unsloth (mmproj y MTP draft head): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Test 12axes (evaluacion de inclinacion politica): https://politicaltests.github.io/12axes/

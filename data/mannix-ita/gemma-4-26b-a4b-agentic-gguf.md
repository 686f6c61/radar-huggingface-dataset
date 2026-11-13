# ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF

## Resumen

Gemma-4-26B-A4B-agentic-GGUF es la distribucion en formato GGUF del modelo ManniX-ITA/gemma-4-26B-A4B-agentic, un ajuste fino supervisado (SFT) sobre google/gemma-4-26B-A4B-it orientado a reducir el bucle de razonamiento en tareas agenticas de larga duracion. El modelo base es un transformer disperso de tipo Mixture of Experts (MoE) con 25.233.142.046 parametros totales, del que el autor no detalla el numero de parametros activos. Lo publica ManniX-ITA bajo licencia Apache 2.0 y esta pensado para su uso con llama.cpp.

El problema que aborda es concreto: el modelo original tiende a entrar en bucles de razonamiento cuando encadena muchas llamadas a herramientas, lo que agota el presupuesto temporal de un agente sin llegar a completar la tarea. El ajuste se entrena sobre respuestas regeneradas del propio modelo, ya sin bucles, manteniendo arquitectura, tokenizer y plantilla de chat del original. En la evaluacion del autor, la tasa de tareas completadas en 30 minutos pasa del 15 % (3 de 20) al 60 % (12 de 20), con una mediana de cortes por bucle de razonamiento que baja de 8,0 a 1,0 por ejecucion.

La relevancia practica esta en que permite ejecutar un modelo de 26B en GPU de consumo o en servidores modestos mediante cuantizacion, con un sesgo claro hacia tool calling y razonamiento multi-paso. El repositorio incluye cuatro cuantizaciones (Q4_K_M, Q6_K, Q8_0 y F16), la matriz de importancia usada para generarlas y el corpus de calibracion, lo que facilita reproducir el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), derivado de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Gemma-4-26B-A4B-it: un transformer con capas MoE, misma tokenizer y misma plantilla de chat oficial de Gemma-4 (18.683 bytes, sha256 `ae53464b…`), con `eos = 106` (`<turn|>`). El ajuste fino es un SFT en BF16 sobre las propias respuestas del modelo regeneradas y libres de bucles, segun describe el autor. Los datasets declarados combinan trazas agenticas propias (ManniX-ITA/gemma-4-26B-A4B-agentic-sft, ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b), colecciones de NVIDIA orientadas a agentes, codigo, SWE, programacion competitiva, instrucciones, matematicas, ciencia y multilingue (Nemotron-SFT-Agentic-v2, Nemotron-SFT-OpenCode-v1, Nemotron-SFT-SWE-v2, Nemotron-SFT-Competitive-Programming-v2, Nemotron-Instruction-Following-Chat-v1, Nemotron-SFT-Instruction-Following-Chat-v2, Nemotron-SFT-Math-v3, Nemotron-Science-v1, Nemotron-SFT-Multilingual-v1) y trazas de razonamiento con herramientas (interstellarninja/hermes_reasoning_tool_use, lambda/hermes-agent-reasoning-traces). No se detalla el volumen total de tokens de entrenamiento ni si hubo RLHF o DPO.

La innovacion tecnica documentada esta en el proceso de cuantizacion: cada GGUF se genera desde el F16 con `llama-quantize --imatrix imatrix.dat` (llama.cpp b9700), usando una matriz de importancia calculada sobre 9.590 chunks con `--parse-special` para tokenizar el marcado de chat como tokens de control. El corpus de calibracion (receta AtomicChat `gemma-4-20b-v9-agentic`) consta de 3.043 documentos y 4,91 M tokens, con esta composicion: agentico 27,6 %, codigo 18,5 %, multilingue 15,4 %, razonamiento 15,3 %, contexto largo 10,7 %, barrido de vocabulario 6,3 %, salida estructurada 4,2 % y graficos 2,1 %. El autor advierte que Q8_0 conserva las claves de imatrix pero el cuantizador Q8_0 de ggml ignora los pesos de importancia, por lo que equivale a un Q8_0 estandar.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activable (thinking on, esfuerzo alto en la evaluacion del autor).
- Tool calling y function calling, con soporte de herramientas como `check_file` y `ask_lsp` en el arnes de prueba.
- Razonamiento agentico multi-paso orientado a tareas de reparacion y desarrollo de codigo.
- Generacion y depuracion de codigo, incluyendo correccion de errores de sintaxis y bugs logicos en ficheros HTML/JS.
- Razonamiento matematico y cientifico, segun los datasets Nemotron de matematicas y ciencia incluidos en el entrenamiento.
- Seguimiento de instrucciones y salida estructurada.
- Capacidades multilingues derivadas del dataset Nemotron-SFT-Multilingual-v1, aunque el metadato de idioma del repositorio solo declara `en`.
- Decodificacion especulativa compatible mediante el drafter asistente de Gemma-4.
- Integracion con llama.cpp y endpoints compatibles.

## Casos de uso

- Reparacion automatica de codigo en agentes: el modelo puede recibir un fichero roto, ejecutar herramientas de diagnostico LSP tras cada edicion y converger a una version funcional. Es el escenario medido por el autor (juego `manic_miner` con un error de sintaxis y bugs logicos) y el que justifica el ajuste.
- Pipelines de CI/CD con agentes de codigo: al reducir los bucles de razonamiento, encaja en etapas con presupuesto temporal acotado donde un agente debe proponer y validar parches sin agotar el tiempo de ejecucion.
- Asistentes de desarrollo integrados en IDE: soporta tool calling y diagnostico LSP, por lo que puede conectarse a un host tipo VS Code para sugerir correcciones con validacion inmediata.
- Automatizacion de tareas SWE: los datasets Nemotron-SFT-SWE-v2 y Nemotron-SFT-OpenCode-v1 apuntan a resolucion de issues y edicion de repositorios, adecuado para agentes que abren ramas y aplican cambios.
- Razonamiento con herramientas en flujos de analisis: la combinacion de trazas Hermes de razonamiento con uso de herramientas permite encadenar consultas, llamadas a API y sintesis de resultados.
- Despliegue en hardware de consumo: con Q4_K_M (16,80 GB) el modelo cabe en GPU de 24 GB, lo que habilita prototipado local de agentes sin infraestructura de datacenter.
- Generacion de codigo para programacion competitiva y matematicas: los datasets Nemotron-SFT-Competitive-Programming-v2 y Nemotron-SFT-Math-v3 respaldan este uso en entornos de evaluacion automatizada.

## Benchmarks y rendimiento

El autor publica una comparacion directa contra el modelo base en una unica tarea agentica (reparacion del juego HTML `manic_miner`), con 20 ejecuciones por modelo y un limite de 30 minutos por ejecucion, sobre RTX PRO 6000 Blackwell (96 GB), BF16 GGUF, KV cache en f16 y decodificacion especulativa.

| Metrica | Base gemma-4-26B-A4B-it | Este modelo |
|---|---|---|
| Ejecuciones finalizadas en 30 min | 3 / 20 (15 %) | 12 / 20 (60 %) |
| Intervalo de confianza 95 % (Wilson) | 5 %–36 % | 39 %–78 % |
| Aprobadas en 10 / 20 / 30 min | 0 % / 15 % / 15 % | 25 % / 50 % / 60 % |
| Cortes por bucle de razonamiento por ejecucion (mediana) | 8,0 | 1,0 |
| Cortes por bucle de razonamiento por hora de modelo | 18,1 | 2,9 |

La diferencia de tasa de aprobados es significativa (test exacto de Fisher bilateral, p = 0,0079). El autor aclara que la tasa no es un exito absoluto, sino la proporcion de ejecuciones que terminan dentro del presupuesto de 30 minutos; un timeout significa "no terminado en 30 minutos", no "incapaz". No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun fichero: Q4_K_M 16,80 GB, Q6_K 22,64 GB, Q8_0 26,86 GB, F16 50,51 GB. A estas cifras hay que sumar la memoria del KV cache, cuyo tamano depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es la usada en la evaluacion del autor con BF16. Para Q4_K_M basta una GPU de 24 GB; Q6_K requiere al menos 24 GB con margen ajustado; Q8_0 y F16 necesitan 32 GB o mas.
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090 (24 GB) o RTX 3090 (24 GB); Q6_K en RTX 4090 con contexto moderado.
- Opciones de despliegue: llama.cpp (build b9700 o posterior, el usado para generar los cuantizados), con soporte de decodificacion especulativa mediante el drafter asistente de Gemma-4. El repositorio declara compatibilidad con endpoints. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La evaluacion reporta tiempos de finalizacion de tarea (25 % de ejecuciones en 10 minutos, 50 % en 20 minutos, 60 % en 30 minutos) pero no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF | 25.233.142.046 | no disponible | Apache 2.0 | GGUF | Ajuste anti-bucle para tareas agenticas; 60 % de tareas completadas en 30 min en la prueba del autor |
| google/gemma-4-26B-A4B-it | 25.233.142.046 (mismo base) | no disponible | no disponible en la informacion proporcionada | safetensors (base) | Modelo original; 15 % de tareas completadas en 30 min en la misma prueba; propenso a bucles de razonamiento |
| ManniX-ITA/gemma-4-26B-A4B-agentic | 25.233.142.046 | no disponible | Apache 2.0 | safetensors (BF16) | Version sin cuantizar del mismo ajuste; misma arquitectura y plantilla de chat |

No se dispone de datos de benchmarks estandar ni de comparaciones con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de Gemma-4 y de datasets de NVIDIA y Hermes, puede heredar los sesgos de esos corpus.
- Alucinacion: no se cuantifica el riesgo; el ajuste se centra en reducir bucles, no en mitigar alucinaciones, y la evaluacion mide finalizacion de tareas, no correccion factual.
- Contexto e idioma: la longitud de contexto no se especifica y el metadato de idioma solo declara `en`, aunque el entrenamiento incluye un dataset multilingue. El rendimiento fuera del ingles no esta validado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base es google/gemma-4-26B-A4B-it y el autor no detalla en la informacion proporcionada las condiciones de la licencia original de Gemma; conviene verificar la compatibilidad antes de un despliegue comercial.
- La evaluacion se basa en una unica tarea (`manic_miner`) con 20 ejecuciones por modelo; los resultados no garantizan el mismo comportamiento en otros dominios agenticos.
- El autor advierte que las tecnicas anti-repeticion (por ejemplo, `presence_penalty` alto) ocultan los bucles pero degradan la eficacia y la capacidad de convergencia del modelo; recomienda `presence_penalty 0.025` como unico ajuste.
- Q8_0 no se beneficia de la imatrix, ya que el cuantizador Q8_0 de ggml ignora los pesos de importancia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic-GGUF
- Modelo base ajustado (BF16): https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset SFT del autor: https://huggingface.co/datasets/ManniX-ITA/gemma-4-26B-A4B-agentic-sft
- Dataset de trazas Hermes: https://huggingface.co/datasets/ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b
- Herramienta de cuantizacion omnimergekit: https://github.com/mann1x/omnimergekit
- Arnes de evaluacion automaticum: https://github.com/mann1x/automaticum
- SDK Cerebriline: https://github.com/mann1x/cline/tree/main/sdk

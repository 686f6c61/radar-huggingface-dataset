# sigmanih/microsoft-phi-4-GGUF-IQ2_XXS

## Resumen

`sigmanih/microsoft-phi-4-GGUF-IQ2_XXS` es una cuantización GGUF del modelo `microsoft/phi-4` de Microsoft, publicada por el usuario `sigmanih` a través de su herramienta Sigma Studio. Se trata de una conversión a formato `IQ2_XXS` (cuantización de 2 bits con matriz de importancia, `imatrix`) pensada para reducir el peso del modelo original de 14.659.507.200 parámetros hasta unos 5,01 GB en disco, permitiendo su ejecución en hardware de consumo muy limitado.

El modelo base, Phi-4, es un transformer denso de tipo `phi3` con 40 capas, dimensión oculta de 5120 y una ventana de contexto de 16.384 tokens. La cuantización agresiva a 2 bits busca habilitar inferencia en GPUs de 8-12 GB de VRAM o en sistemas con 16-32 GB de RAM mediante offload parcial o total a CPU, a costa de una degradación notable de la calidad respecto a los pesos originales en bf16.

La relevancia de esta ficha radica en que documenta una pieza de ecosistema (una cuantización de terceros) y no un modelo nuevo: el interés está en evaluar si la compresión extrema permite mantener capacidades útiles de razonamiento, código y matemáticas en entornos con recursos muy restringidos, y en advertir de las limitaciones y de la fiabilidad de las métricas publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia `phi3` (40 capas, hidden dim 5120) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | GGUF `IQ2_XXS` (2 bits, con `imatrix`); el repo solo distribuye esta variante |
| Idiomas soportados | `en`, `it` (segun metadatos del repo) |
| Licencia | `other` (heredada de `microsoft/phi-4`; consultar terminos del modelo base) |
| Formato de pesos | GGUF (`IQ2_XXS`) |
| Tamano en disco | 5,01 GB (repo: 5,4 GB) |
| VRAM estimada | ~7,2 GB con offload completo a GPU; ~7,0 GB RAM en CPU/hibrido |
| Hardware recomendado | GPU de 8-12 GB VRAM o 16-32 GB de RAM de sistema |

## Arquitectura y entrenamiento

El modelo subyacente es `microsoft/phi-4`, un transformer denso decoder-only de la familia `phi3` con 14.660 millones de parametros, 40 capas y dimension oculta de 5120. Esta publicacion no entrena ni modifica los pesos: aplica una cuantizacion post-entrenamiento a `IQ2_XXS`, una variante de 2 bits de la familia `IQ` (importance-aware quantization) de llama.cpp que utiliza una matriz de importancia (`imatrix`) para minimizar el error de cuantizacion en las capas mas sensibles. El resultado es un unico fichero GGUF de aproximadamente 5,01 GB.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento original de Phi-4 (numero de tokens, composicion, fases de RLHF/DPO), ni sobre el proceso exacto de calibracion de la `imatrix` empleado por el autor. La model card del repositorio cuantizado no documenta estos extremos, por lo que deben consultarse en la ficha oficial de `microsoft/phi-4`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles e italiano.
- Razonamiento de tipo chain-of-thought: el autor describe un modo "Deep Thinking" (CoT) frente a un modo "No-Thinking" (respuesta directa), aunque sus propias metricas muestran un delta negativo de -6,8 % para el modo CoT.
- Codigo en Python: la model card reporta evaluacion en HumanEval y MBPP.
- Matematicas de nivel escolar y de competicion: evaluado en GSM8K y MATH.
- Razonamiento cientifico y de sentido comun: evaluado en ARC-Challenge, HellaSwag y BIG-Bench Hard.
- Tool calling / function calling: el autor evalua "Tool Protocol Adherence" en un sandbox, con un resultado reportado del 57,6 %.
- Soporte de agentes multi-paso: segun la model card, con contencion del 100 % en el sandbox, pero 0 % de finalizacion autonoma de tareas en el escenario probado.
- Compatible con endpoints (`endpoints_compatible` en los tags del repo).
- No se documentan capacidades de vision, audio ni modo thinking nativo del modelo base en esta ficha.

## Casos de uso

- Asistente de codigo en portatil sin GPU dedicada: el fichero de 5,01 GB permite cargar el modelo en RAM (16 GB) o en una GPU integrada, ofreciendo autocompletado y explicacion de fragmentos Python con latencia aceptable a cambio de menor precision que el modelo original.
- Prototipado rapido de agentes en local: gracias a su compatibilidad con llama.cpp y a una ventana de 16.384 tokens, sirve para validar bucles de tool calling y esquemas de funciones antes de migrar a un modelo mayor.
- Educacion y demostraciones offline: el tamano reducido permite distribuir el modelo en entornos sin conectividad para ejercicios de razonamiento y matematicas de nivel escolar (GSM8K), asumiendo menor fiabilidad en problemas complejos.
- Generacion de texto y resumenes en italiano e ingles: util para pipelines de contenido bilingue en dispositivos de bajos recursos donde no es viable un modelo de 7B en bf16.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como caso de estudio de hasta que punto `IQ2_XXS` degrada MMLU (36 %) o GPQA (33 %) frente a cuantizaciones de 4 y 8 bits.
- Backend de bajo coste para pruebas de integracion: al ser compatible con endpoints, puede desplegarse en un contenedor pequeno para tests de humo de aplicaciones que consumen una API de chat, sin pretender calidad de produccion.
- Chatbot de soporte en hardware embebido o mini-PC: con offload hibrido CPU/GPU y ~7 GB de RAM, puede atender consultas simples multi-turno en escenarios de baja concurrencia.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor (`sigmanih`), medidos con su motor SigmaEngine, temperatura 0,0 y semilla 42, sobre un subconjunto de cada suite. El propio autor advierte que no son comparables con ejecuciones completas de los benchmarks.

| Benchmark | Resultado reportado | Muestras | Nota del autor |
|---|---|---|---|
| ARC-Challenge | 89 % | 8/9 | Correcto |
| BIG-Bench Hard | 100 % | 7/7 | Correcto |
| GPQA | 33 % | 3/9 | Bajo |
| GSM8K | 67 % | 6/9 | Aceptable |
| HellaSwag | 56 % | 5/9 | Aceptable |
| HumanEval | 71 % (pass@1) | 5/7 | Correcto |
| MATH | 56 % | 5/9 | Aceptable |
| MBPP | 67 % | 6/9 | Aceptable |
| MMLU | 36 % | 5/14 | Bajo |
| MMLU-Pro | 44 % | 4/9 | Aceptable |
| TruthfulQA | 89 % | 8/9 | Correcto |
| Total agregado | 62 % | 62/100 | - |

| Modo de ejecucion | Precision | Aciertos | Perfil |
|---|---|---|---|
| No-Thinking (directo) | 64,9 % | 37/57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 58,1 % | 25/43 | Traza de razonamiento multi-paso, delta -6,8 % |

| Metrica de agente (sandbox) | Resultado |
|---|---|
| Tool Protocol Adherence | 57,6 % |
| Autonomous Task Completion | 0,0 % (0/1 escenarios) |
| Sandbox Jail Containment | 100 % |
| Execution Efficiency | 0 turnos (0,0 s) |

No se han publicado en la informacion disponible resultados de benchmarks oficiales del modelo base `microsoft/phi-4` ni comparaciones controladas frente a otras cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM estimada: ~7,2 GB con offload completo a GPU; ~7,0 GB de RAM en modo CPU o hibrido.
- GPU recomendadas: cualquier GPU con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); en gamas profesionales, A100 o H100 funcionan pero estan sobredimensionadas para este fichero.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM; en GPUs de 6 GB requerira offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF `IQ2_XXS` de forma estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo menciona "minima latencia" cualitativa para el modo directo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `sigmanih/microsoft-phi-4-GGUF-IQ2_XXS` | 14,66 B | 16.384 | GGUF IQ2_XXS | `other` | Cuantizacion de terceros, ~5 GB en disco |
| `microsoft/phi-4` (original) | 14,66 B | 16.384 | safetensors (bf16) | `other` (MIT segun el modelo base) | Referencia de calidad; requiere ~28-30 GB en bf16 |
| Cuantizaciones Q4_K_M de Phi-4 | 14,66 B | 16.384 | GGUF Q4_K_M | `other` | Compromiso calidad/tamano (~9 GB); no incluida en la informacion disponible como publicacion concreta |
| `microsoft/phi-4-mini` | no disponible | no disponible | safetensors/GGUF | no disponible | Alternativa de menor tamano de la familia Phi-4; datos no verificados en esta busqueda |

La comparativa cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion `IQ2_XXS` degrada de forma significativa la calidad respecto al modelo en bf16; los resultados de MMLU (36 %) y GPQA (33 %) reportados por el propio autor son indicativos de esa perdida.
- Las metricas del autor se calculan sobre subconjuntos pequenos (7-14 preguntas por suite) y con su propio motor, por lo que no son comparables con ejecuciones completas ni con otras implementaciones.
- El modo CoT reportado empeora la precision (-6,8 %) frente a la respuesta directa, lo que sugiere que el modelo cuantizado no aprovecha bien el razonamiento extendido.
- La finalizacion autonoma de tareas en el sandbox de agentes es del 0 %, pese a una adherencia al protocolo de herramientas del 57,6 %; no es fiable como agente autonomo.
- Riesgo de alucinacion: inherente al modelo base y agravado por la cuantizacion extrema; TruthfulQA al 89 % se midio sobre solo 9 preguntas.
- Idiomas: los metadatos declaran solo `en` e `it`; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Licencia `other`: los terminos exactos provienen de `microsoft/phi-4` y deben revisarse antes de uso comercial; el badge Apache-2.0 de la model card hace referencia a Sigma Studio, no al modelo.
- El repositorio es una publicacion de terceros con 498 descargas y 1 like; no hay garantia de mantenimiento ni de reproducibilidad del proceso de cuantizacion.
- La fecha de creacion indicada (2026-10-09) es posterior a la de esta ficha; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/microsoft-phi-4-GGUF-IQ2_XXS
- Modelo base: https://huggingface.co/microsoft/phi-4
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih

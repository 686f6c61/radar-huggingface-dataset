# purush0th/aimsby-qwen3-4b-instruct-GGUF

## Resumen

Aimsby Qwen3 4B Instruct es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507 de Alibaba, publicado por el usuario purush0th. Su proposito es servir de motor de razonamiento para Aimsby, un asistente personal autoalojado que gestiona recordatorios, planificacion diaria, notas, memorias, objetivos y un tablero de sprints. El modelo no busca competir en capacidades generales, sino aprender a invocar correctamente el conjunto de herramientas de Aimsby y, de forma igualmente importante, a no invocarlas cuando la peticion es una pregunta simple, un calculo o una tarea creativa.

Se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M (2,5 GB), lo que lo hace desplegable en GPU de consumo. Con 4.022.468.096 parametros (aproximadamente 4B) y una ventana de contexto recomendada de 16k tokens, el autor reporta un consumo de 4,0 GB de VRAM a 16k y 5,3 GB a 32k, con un throughput de unos 92 tokens por segundo medido en una RTX 3060 de 12 GB con Ollama.

Es relevante porque ejemplifica un patron cada vez mas comun: adaptaciones de modelos pequenos y abiertos a un dominio de herramientas muy concreto mediante LoRA sobre datos sinteticos generados a partir de la propia aplicacion. La licencia Apache 2.0 facilita su reutilizacion, aunque el modelo esta disenado y evaluado exclusivamente para el entorno de Aimsby.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); no se detalla en la model card |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16k recomendado por el autor; probado tambien a 32k |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles (entrenamiento y evaluacion solo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4B parametros. El ajuste se realizo mediante LoRA de rango 16 con Unsloth, durante 2 epocas y con una tasa de aprendizaje de 5e-5. Posteriormente los pesos se fusionaron y se cuantizaron a Q4_K_M con llama.cpp. La model card no detalla innovaciones arquitectonicas adicionales; las capacidades estructurales (atencion, tokenizador, plantilla de chat) son las del modelo base.

El conjunto de datos de entrenamiento consta de 1.246 ejemplos procedentes de 582 conversaciones. Los prompts sinteticos se enviaron a traves de la propia aplicacion Aimsby contra datos de prueba ficticios, y solo se conservaron los turnos que terminaron correctamente. Las etiquetas son las respuestas finales de la aplicacion tras sus propias comprobaciones, y los prompts se mantienen separados de las suites de evaluacion. No se utilizaron datos personales. La perdida en validacion (held-out loss) fue de 0,077 tras la primera epoca y 0,067 tras la segunda. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-4B-Instruct-2507.
- Tool calling / function calling especifico para las herramientas de Aimsby: recordatorios, planificador diario, notas, memorias, objetivos y tablero de sprints.
- Decision de no invocar herramientas en casos apropiados: preguntas simples, sumas y peticiones creativas.
- Razonamiento multi-turno dentro de conversaciones de asistente personal.
- Integracion con Ollama mediante plantilla de chat compatible con la del modelo base, con parametros de muestreo preconfigurados (temperature 0,7, top_k 20, top_p 0,8).
- No se documentan capacidades de vision, audio, modo thinking explicito ni soporte multilingue mas alla del ingles.

## Casos de uso

- Asistente personal autoalojado: el modelo gestiona conversaciones multi-turno con recordatorios, notas y objetivos, apoyandose en una ventana de 16k tokens que cubre las instrucciones y definiciones de herramientas de Aimsby (unas 9.000 tokens).
- Gestion de recordatorios y agenda: interpreta peticiones en lenguaje natural y las traduce en llamadas a las herramientas de planificacion diaria, con la ventaja de haber sido entrenado sobre los datos de prueba de la propia aplicacion.
- Planificacion de sprints y seguimiento de tareas: el modelo invoca el tablero de sprints de Aimsby para crear, mover o consultar elementos, un escenario cubierto por la suite de evaluacion "planner" con un 100% de exito reportado.
- Despliegue en hardware de consumo: con Q4_K_M y 4,0 GB de VRAM a 16k, cabe en GPU de 8 GB o superiores, lo que permite ejecutar el asistente en una estacion de trabajo personal o en un mini-PC con GPU dedicada.
- Pipeline de voz integrado: combinado con Whisper y Kokoro (2,2 GB adicionales en la misma GPU), habilita un asistente por voz local; el autor advierte que una GPU de 6 GB no es suficiente en ese escenario.
- Base para ajustes de dominio similares: al estar liberado en Apache 2.0 y con un recetario LoRA documentado, sirve como referencia para adaptar Qwen3-4B a otros conjuntos de herramientas mediante datos sinteticos generados desde la aplicacion objetivo.

## Benchmarks y rendimiento

Los unicos datos disponibles son las suites internas de Aimsby, ejecutadas dentro de la aplicacion con la misma version y 3 ejecuciones por escenario. El autor advierte explicitamente que no constituyen un benchmark general.

| Suite | Qwen3-4B-Instruct-2507 original | Este modelo |
|---|---|---|
| core + extended | 96,3% | 97,8% |
| holdout | 100% | 100% |
| holdout2 | 100% | 100% |
| holdout3 | 95,6% | 100% |
| planner | 100% | 100% |

Con correcciones posteriores de la aplicacion, el modelo supero 465 de 465 comprobaciones a 5 ejecuciones por escenario. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 4,0 GB con contexto de 16k y 5,3 GB con contexto de 32k, medido en una RTX 3060 de 12 GB con Ollama 0.40.15, flash attention y cache q8_0.
- GPU recomendadas: el autor indica una GPU con 8 GB o mas de VRAM y 16 GB de memoria de sistema. Una RTX 3060 de 12 GB es el hardware de referencia medido.
- GPU de consumo: si cabe en tarjetas de 8 GB o superiores. Con servicios de voz adicionales (Whisper y Kokoro, 2,2 GB) una GPU de 6 GB resulta insuficiente.
- Despliegue: Ollama es la via documentada (`ollama pull hf.co/purush0th/aimsby-qwen3-4b-instruct-GGUF:Q4_K_M`), con soporte de llama.cpp por el formato GGUF. No se documentan otras opciones como vLLM o TGI.
- Rendimiento: aproximadamente 92 tokens por segundo en la RTX 3060 de 12 GB con la configuracion indicada. No se reportan datos de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Aimsby Qwen3 4B Instruct (este modelo) | ~4B | 16k recomendado | GGUF Q4_K_M | Apache 2.0 | Fine-tune de dominio para herramientas de Aimsby |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible en la informacion | safetensors y derivados | Apache 2.0 | Modelo base; mejor rendimiento general segun las suites de Aimsby (96,3% frente a 97,8% en core + extended) |
| Otros fine-tunes de Qwen3-4B para tool calling | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion con alternativas fuera del ecosistema Qwen3 no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para las herramientas y el system prompt de Aimsby; fuera de ese entorno se comporta de forma muy similar al modelo base y no ha sido probado para uso general.
- Es un modelo pequeno: puede equivocarse, malinterpretar fechas y horas o invocar la herramienta incorrecta. El autor recomienda verificar cualquier resultado importante.
- Entrenamiento y evaluacion exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Las metricas de evaluacion dependen de las comprobaciones de la propia aplicacion Aimsby y no son extrapolables a benchmarks estandar.
- Riesgo de alucinacion inherente a un modelo de 4B, especialmente en tareas de razonamiento abierto no cubiertas por el entrenamiento.
- No se documentan sesgos especificos, pero al derivar de Qwen3-4B-Instruct-2507 hereda los del modelo base, no detallados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye "as is", sin garantias, y no esta respaldado ni soportado por Qwen ni por Alibaba Cloud.
- El contexto util recomendado es de 16k o mas porque las instrucciones y herramientas de Aimsby ocupan unas 9.000 tokens; contextos menores degradan el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purush0th/aimsby-qwen3-4b-instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.

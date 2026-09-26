# karthik-a/sparkflashxgemma4

## Resumen

SparkFlashXGemma4 es un conjunto de adaptadores LoRA (PEFT) publicados por el usuario karthik-a sobre el checkpoint base `google/gemma-4-31b-it-qat-w4a16-ct`, un Gemma 4 de 31 000 millones de parametros en version instruction-tuned y cuantizada por QAT. No es un modelo completo: el repositorio solo contiene los pesos de dos adaptadores (`main_lora` y `tool_lora`) que suman 183,6 millones de parametros entrenables y ocupan 0,4 GB. Su proposito es convertir el modelo base en un agente de codigo autonomo capaz de localizar el codigo relevante, describir el cambio y emitir un diff unificado.

El problema que aborda es concreto: los agentes de resolucion de incidencias (estilo SWE-bench) necesitan una salida estructurada y consumible por un harness de evaluacion, no prosa libre. `main_lora` aprende a producir un plan de tres lineas (`LOCATE` / `CAUSE` / `CHANGE`) seguido de un diff en bloque de codigo, mientras que `tool_lora` aprende a generar un informe de localizacion (ficheros y simbolos con rangos de linea) sin emitir parches, de modo que pueda actuar como analizador de solo lectura.

Es relevante ahora porque demuestra el patron QLoRA + rsLoRA sobre un modelo cuantizado por QAT, con un presupuesto de entrenamiento muy reducido (26 pasos, 1,10 h y 0,62 h en 2x Tesla T4) y un dataset minimo de 104 ejemplos de entrenamiento. La curva de perdida de evaluacion decrece de forma monotona en ambos adaptadores, lo que el autor presenta como evidencia de que se aprende un formato transferible y no una memorizacion pura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) con adaptadores LoRA; torre de vision excluida del ajuste |
| Parametros totales | Modelo base Gemma 4 31B; adaptadores: 122 429 440 (`main_lora`) + 61 214 720 (`tool_lora`) = 183 644 160 entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base INT4 w4a16 (escalas simetricas de grupo 32, activaciones de 16 bits, ~16-17 GB); NF4 con doble cuantizacion al cargar en QLoRA; adaptadores en precision completa |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT LoRA) |
| Modelo base | google/gemma-4-31b-it-qat-w4a16-ct |
| Libreria | peft |
| Capas objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj en las 60 capas del decoder |
| Rango de los adaptadores | `main_lora`: r=16; `tool_lora`: r=8; escalado rsLoRA (alpha = 2r) |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

Se trata de adaptadores LoRA sobre un transformer decoder-only de la familia Gemma 4, con una torre de vision presente en el modelo base pero excluida del ajuste. Los dos adaptadores se aplican sobre las 410 proyecciones del modelo de lenguaje repartidas entre sus 60 capas de decoder. `main_lora` tiene rango 16 y 233,6 MB; `tool_lora` tiene rango 8 y 116,9 MB. Ambos usan escalado rsLoRA con `alpha = 2r`, lo que permite que el rango 16 sea entrenable sin colapsar el aprendizaje.

El entrenamiento parte de `google/gemma-4-31b-it-qat-q4_0-unquantized`, los pesos QAT en bf16 que la model card del base designa para investigacion y fine-tuning (el fichero `w4a16` es el artefacto de servicio para vLLM y no tiene ruta de forward cuantizada). Sobre esos pesos se aplica QLoRA: cuantizacion NF4 con doble cuantizacion en el momento de la carga, estado del optimizador en 8 bits y ejecucion en 2x Tesla T4. El autor cita como referencias de metodo QLoRA, LoRA, rsLoRA y ZeRO; descarta LoftQ y QuAILoRA porque un base entrenado con QAT tiene poco residuo de cuantizacion que recuperar, y rechaza PiSSA y DoRA por incompatibilidad o porque sustituyen el peso congelado.

Los datos son exclusivamente el split de desarrollo de la competicion (`tasks.jsonl`, 129 tareas con parches de referencia), dividido con semilla 42 en 104 de entrenamiento y 25 de validacion. No se uso ningun corpus externo de trayectorias de agente. Los prompts se renderizan con la plantilla de chat del propio modelo y con `add_generation_prompt=True`, y la perdida se enmascara al turno del asistente. Se detallan dos decisiones de implementacion: calculo de entropia cruzada por bloques con checkpointing (necesario porque materializar logits `[seq, vocab]` con un vocabulario de 262 144 tokens requiere ~2,7 GB en seq 1024) y resolucion dinamica de los modulos objetivo para esquivar `Gemma4ClippableLinear`, que PEFT rechaza. No se menciona RLHF ni DPO.

| Metrica | `main_lora` | `tool_lora` |
|---|---|---|
| Pasos | 26 (2 epocas, batch efectivo 8) | 26 |
| Tiempo | 1,10 h a 120,4 s/paso | 0,62 h a 70,4 s/paso |
| Perdida final de entrenamiento | 0,624 | 0,759 |
| Perdida de evaluacion (25 tareas) | 0,857 -> 0,804 -> 0,791 -> 0,791 | 0,850 -> 0,778 -> 0,759 -> 0,759 |

## Capacidades

- Generacion de parches en formato diff unificado a partir de un enunciado de problema.
- Planificacion estructurada en tres lineas: `LOCATE`, `CAUSE` y `CHANGE`.
- Localizacion de codigo en modo de solo lectura: informes con listado de `FILES` y `SYMBOLS`, rangos de linea y simbolo contenedor.
- Actuacion como agente de codigo autonomo para tareas tipo SWE-bench, con llamada a `submit_patch()` y presupuesto limitado de llamadas a herramientas.
- Separacion de roles mediante dos adaptadores servibles simultaneamente: agente raiz y analizador de solo lectura.
- Compatibilidad con vLLM multi-LoRA para servir ambos adaptadores sobre un unico modelo base.
- Capacidades multilingues: no disponible.
- Capacidades de vision: presentes en el modelo base (existe torre de vision), pero fuera del alcance del ajuste.

## Casos de uso

- Resolucion automatica de incidencias de repositorio: el modelo recibe el enunciado de un fallo, localiza el punto afectado y devuelve un diff unificado listo para pasar por un sistema de parches en un pipeline de integracion continua.
- Triaje de tests fallidos: dado un error de `tests/test_util.py` o similar, genera un plan `LOCATE/CAUSE/CHANGE` que un ingeniero puede revisar antes de aplicar ningun cambio.
- Analisis de codigo de solo lectura en revisiones: `tool_lora` produce un informe de ficheros y simbolos con sus rangos de linea, util para alimentar herramientas de anotacion o de cobertura sin riesgo de que se emita codigo no deseado.
- Orquestacion de agentes en dos fases: un planificador invoca primero `tool_lora` para cartografiar el repositorio y despues `main_lora` para generar el parche, aprovechando que ambos adaptadores comparten base y se sirven con vLLM multi-LoRA.
- Generacion de parches en pipelines de CI/CD: el diff de salida encaja de forma natural en un paso que aplique `git apply` y ejecute la bateria de tests, con revision humana opcional antes de fusionar.
- Investigacion sobre QLoRA y rsLoRA: el repositorio documenta la receta completa (NF4, doble cuantizacion, escalado `alpha = 2r`, resolucion dinamica de modulos objetivo) y sirve como referencia reproducible para ajustar adaptadores sobre bases cuantizados por QAT.
- Base para experimentos de destilacion de formato: al separar el rol de analisis y el de generacion, permite estudiar si el modelo aprende formatos transferibles frente a memorizar los ejemplos de entrenamiento, con una curva de evaluacion como unica evidencia disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `swe-bench` y menciona la naturaleza de agente de codigo, pero no se aportan cifras de resolucion de tareas, MMLU, HumanEval, GSM8K ni ninguna otra metrica comparable. Los unicos numeros publicados son las perdidas de entrenamiento y evaluacion recogidas en la seccion de arquitectura y entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB para el modelo base en 4 bits mas los adaptadores; el autor indica explicitamente que no cabe en una GPU de portatil de 6 GB.
- Peso del base cuantizado: entre 16 y 17 GB en INT4 w4a16 con escalas simetricas de grupo 32.
- GPU recomendadas: A100, H100 o L40S con 24 GB o mas. Las RTX 4090 de 24 GB quedan al limite, dado el consumo del base y de los logits del vocabulario grande.
- Caso no viable: una GPU de 14,5 GB no puede alojar a la vez el base en 4 bits y los logits materializados (~2,7 GB en seq 1024), de ahi el uso de entropia cruzada por bloques durante el entrenamiento.
- GPU empleadas para el entrenamiento: 2x Tesla T4, con el base en NF4 y doble cuantizacion via QLoRA.
- Opciones de despliegue: vLLM con soporte multi-LoRA (`--enable-lora --max-lora-rank 128 --max-loras 8`), y Transformers con PEFT y bitsandbytes para inferencia directa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks ni de datos de rendimiento que permitan comparar este modelo con alternativas de la misma categoria. La siguiente tabla recoge unicamente la comparacion estructural con el checkpoint base sobre el que se construye, ya que es el unico punto de referencia aportado en la informacion disponible.

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| karthik-a/sparkflashxgemma4 | Adaptadores LoRA sobre Gemma 4 31B | 183,6 M entrenables (base de 31B) | No disponible | apache-2.0 | safetensors (PEFT) |
| google/gemma-4-31b-it-qat-w4a16-ct | Modelo base instruction-tuned cuantizado | 31B (segun denominacion) | No disponible | No disponible | INT4 w4a16 para vLLM |
| Otros agentes de codigo comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Desproporcion entre datos y parametros: 104 ejemplos de entrenamiento frente a 122 millones de parametros entrenables en `main_lora` es un escenario fuertemente sobreparametrizado. El autor lo mitiga con rango 16, 2 epocas, learning rate 1e-4, recorte de gradiente y un split de validacion, pero admite que la curva de evaluacion es la unica evidencia de que no hay memorizacion pura.
- Riesgo de sobreajuste al formato de la competicion: la salida esta moldeada por el harness (presupuesto limitado de llamadas a herramientas, `submit_patch()`), lo que puede reducir la generalizacion a otros entornos de agente.
- El repositorio no contiene el modelo completo: requiere descargar el checkpoint base por separado, con el coste de almacenamiento y VRAM asociado (~20 GB).
- La model card original esta truncada en la seccion de limitaciones, por lo que pueden existir advertencias adicionales no recogidas aqui.
- Idiomas soportados y comportamiento multilingue: no disponibles.
- Longitud de contexto del modelo base: no disponible, lo que impide valorar el comportamiento en repositorios grandes.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero inherente a la generacion de diffs unificados sobre codigo no visto.
- Sesgos conocidos: no disponibles.
- Uso comercial: la licencia declarada del repositorio es apache-2.0, pero conviene verificar las condiciones del checkpoint base de Google antes de un despliegue en produccion, ya que la ficha no detalla la licencia del modelo subyacente.
- La torre de vision no recibe ajuste, por lo que cualquier tarea multimodal queda fuera del alcance de estos adaptadores.
- El modelo no tiene descargas ni interacciones registradas en el momento de la consulta, por lo que no existe validacion externa de su comportamiento en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/karthik-a/sparkflashxgemma4
- Modelo base: https://huggingface.co/google/gemma-4-31b-it-qat-w4a16-ct
- Pesos QAT sin cuantizar usados en el entrenamiento: https://huggingface.co/google/gemma-4-31b-it-qat-q4_0-unquantized
- QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- rsLoRA (arXiv:2312.03732): https://arxiv.org/abs/2312.03732
- ZeRO (arXiv:1910.02054): https://arxiv.org/abs/1910.02054
- LoftQ (arXiv:2310.08659): https://arxiv.org/abs/2310.08659
- QuAILoRA (arXiv:2410.14713): https://arxiv.org/abs/2410.14713
- PiSSA (arXiv:2404.02948): https://arxiv.org/abs/2404.02948
- DoRA (arXiv:2402.09353): https://arxiv.org/abs/2402.09353

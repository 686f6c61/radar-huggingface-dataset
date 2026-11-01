# oopbofficial/mc-decision-qwen3-1.7b-lora

## Resumen

MC Decision Qwen3-1.7B es un adaptador LoRA nativo de MLX-LM entrenado sobre Qwen/Qwen3-1.7B (revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). Lo desarrolla el usuario `oopbofficial` y resuelve una tarea muy acotada: mapear un estado de tarea tipo Minecraft junto con una instruccion del jugador en chino a una salida JSON con dos campos, `decision` y `skill`. Las decisiones posibles son `continue`, `pause`, `cancel`, `replace_task` y `clarify`; las skills de reemplazo son `follow_player`, `return_home`, `collect`, `craft` y `store_items`, y deben ser nulas cuando la decision no implica reemplazo.

El modelo no es un controlador de Minecraft verificado ni un modelo generalista: es un adaptador de 17,4 M de parametros entrenables sobre un transformer de 1.700 M de parametros con cuantizacion afin de 4 bits (group size 64), pensado para ejecutarse en Apple Silicon. Su relevancia es metodologica: documenta de forma reproducible un experimento de ajuste fino con datos sinteticos, incluyendo identidad exacta del checkpoint, mascaras de entrenamiento, conjunto de validacion y comparacion contra el modelo base.

La ficha se basa exclusivamente en la model card publicada. No hay informacion sobre rendimiento en benchmarks estandar, ni sobre despliegue fuera de MLX-LM, ni sobre uso comercial mas alla de la licencia Apache 2.0 declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA nativo MLX-LM |
| Parametros totales | 1.700 M en el modelo base; 17.432.576 parametros entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como spec del adaptador; el entrenamiento uso un limite de 512 tokens y la secuencia completa maxima fue de 240 tokens |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64; pesos originales en bfloat16; 4,501 bits/peso promedio incluyendo metadatos |
| Idiomas soportados | chino (zh) e ingles (en); las utterances de entrenamiento son en chino |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador MLX-LM nativo (no PEFT, no modelo fusionado); repo de 0,1 GB sin pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only. El LoRA tiene rango 16 y alpha 32, representado mediante `scale=2` nativo, con dropout 0,05. Se aplica a las 28 capas del transformer, cubriendo las proyecciones de atencion q/k/v/o y las proyecciones MLP gate/up/down. El entrenamiento se ejecuto con MLX-LM 0.32.2 y MLX 0.32.4 sobre Python 3.12.13, en un Apple M5 Pro con 24 GiB de memoria unificada.

Los datos son 1.000 registros sinteticos generados por agentes, no trazas humanas de juego. Corresponden a cuatro variantes de estado por cada una de 250 utterances semilla, distribuidas en 25 familias. El entrenamiento duro dos epocas, 2.000 microsteps, batch size 1 con acumulacion 16, 125 actualizaciones del optimizador, AdamW con learning rate 1e-4, warmup de diez pasos, decaimiento lineal, recorte de norma de gradiente 1.0 y gradient checkpointing. La mascara de objetivo incluye solo tokens de completado del asistente y tokens terminales de chat, excluyendo prompt y padding; los 1.460 registros pasaron comprobaciones de prefijo, preservacion de tokens completos y mascara. El modo no-thinking queda fijo durante entrenamiento y evaluacion. Se selecciono el checkpoint con menor perdida de validacion completa sobre 160 registros reservados: microstep 1199, equivalente a 74 actualizaciones del optimizador, con perdida de validacion 0,04824473. La memoria pico reportada por el allocator nativo fue de 2,429 GB y el entrenamiento duro 556,5 segundos.

## Capacidades

- Generacion de texto estructurado en JSON con el esquema `{"decision": ..., "skill": ...}` para tareas de control de un agente tipo Minecraft.
- Clasificacion de intencion sobre utterances en chino dentro de un dominio acotado.
- Seleccion entre cinco decisiones (`continue`, `pause`, `cancel`, `replace_task`, `clarify`) y cinco skills de reemplazo (`follow_player`, `return_home`, `collect`, `craft`, `store_items`).
- Aplicacion de una politica conservadora de ambiguedad que puede emitir `clarify` en lugar de una etiqueta unica.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni thinking mode.
- Capacidades multilingues limitadas a chino e ingles segun los tags; el entrenamiento y la evaluacion se centran en chino.
- No se documenta capacidad general de razonamiento, codigo o matematicas; el adaptador esta especializado en la tarea de decision.

## Casos de uso

- Control de tareas en un agente de Minecraft: el modelo recibe el estado de la tarea y la frase del jugador y devuelve la decision y la skill a ejecutar, lo que permite integrarlo como capa de enrutamiento entre el parser de lenguaje natural y el planificador del agente.
- Prototipado de politicas de ambiguedad: gracias a la decision `clarify`, sirve para experimentar con estrategias conservadoras que piden aclaracion en lugar de asumir una intencion, util en investigacion de interaccion conversacional.
- Evaluacion de tecnicas de ajuste fino en Apple Silicon: el repo documenta identidad de checkpoint, mascaras, perdida de validacion y comparacion contra el modelo base, por lo que es util como referencia reproducible para experimentos de LoRA con MLX.
- Generacion de datos etiquetados para entrenar un modelo mayor: las salidas JSON del adaptador pueden usarse como etiquetas sinteticas en un pipeline de destilacion hacia un modelo de mayor tamano, siempre que se valide la calidad fuera del dominio de entrenamiento.
- Filtrado y enrutamiento en un asistente de voz para juegos: al ser un modelo pequeno y cuantizado a 4 bits, puede ejecutarse en local sobre un Mac y clasificar intenciones de bajo nivel antes de invocar un modelo mayor.
- Pruebas de robustez de esquemas JSON: el adaptador alcanza 99,67% de validez estricta de esquema en el conjunto de test, lo que lo hace adecuado como componente de validacion en pipelines que exigen salida estructurada.
- Demostracion educativa de evaluacion estricta: la model card separa accuracy estricta, accuracy solo de decision y diagnosticos post hoc, lo que permite usarlo como caso de estudio en cursos de evaluacion de modelos.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y corresponden a un conjunto de test propio de 300 registros (200 variantes controladas de cinco familias reservadas y 100 retos contextuales de veinte familias adicionales), con decodificacion greedy y limite de 96 tokens nuevos.

| Metrica | Modelo base | Adaptador |
|---|---:|---:|
| Accuracy estricta de decision | 1,00% | 91,00% |
| Accuracy conjunta decision + skill | 1,00% | 91,00% |
| Macro-F1 estricto de decision | 0,0190 | 0,9145 |
| Validez de esquema | 1,00% | 99,67% |
| Accuracy de skill sobre 60 reemplazos gold | 5,00% | 86,67% |
| Falsas cancelaciones sobre 240 no-cancel gold | 0 / 240 | 0 / 240 |
| Cancelaciones omitidas sobre 60 cancel gold | 60 / 60 | 6 / 60 |
| Validez sintactica de JSON crudo | 100,00% | 100,00% |
| Accuracy solo de decision (independiente de skill) | 33,00% | 91,00% |
| Accuracy conjunta extraida sin reparaciones | 1,00% | 91,00% |

Desglose por subconjunto: accuracy conjunta del adaptador del 100% en variantes controladas y del 73% en retos contextuales; el 91% total esta ponderado por el reparto 200/100. Una linea base de palabras clave obtuvo 65,33% de accuracy conjunta total y 48% en retos. El bootstrap pareado por familias reporta una diferencia de accuracy conjunta de +0,90 con intervalo percentil del 95% aproximadamente [0,785, 0,955].

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el adaptador se entreno con un pico de 2,429 GB reportado por el allocator nativo, excluyendo memoria del proceso y del sistema operativo.
- GPU recomendadas: el autor reporta entrenamiento y evaluacion en Apple M5 Pro con 24 GiB de memoria unificada; no se documentan GPUs NVIDIA ni AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para el modelo base cuantizado a 4 bits mas el adaptador; no se especifica el minimo exacto.
- Opciones de despliegue: MLX-LM (unica via documentada); no se reclama compatibilidad con PEFT, Hugging Face Transformers, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no reclama ningun benchmark general de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MC Decision Qwen3-1.7B LoRA (este) | 1.700 M base + 17,4 M adaptador | no disponible (entrenado con limite de 512 tokens) | 91% accuracy conjunta estricta en test propio | Apache 2.0 | Adaptador MLX en HuggingFace |
| Qwen/Qwen3-1.7B (base) | 1.700 M | no disponible en la informacion | 1% accuracy conjunta estricta en el mismo test | Apache 2.0 | Pesos completos en HuggingFace |
| Linea base de palabras clave (referencia del autor) | no aplica | no aplica | 65,33% accuracy conjunta total; 48% en retos | no disponible | No publicada como modelo |

No se dispone de datos de otros adaptadores o modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un controlador de Minecraft verificado; la model card lo indica de forma explicita.
- Los datos son 1.000 ejemplos sinteticos generados por agentes, no trazas humanas de juego; los registros estan correlacionados (cuatro variantes de 250 semillas) y no representan 1.000 situaciones independientes.
- El conjunto de validacion contiene solo cuatro familias, lo que limita la representatividad de la seleccion de checkpoint.
- Algunas etiquetas de aclaracion codifican una politica de ambiguedad deliberadamente conservadora y no son etiquetas de intencion humana unicas.
- La accuracy cae del 100% en variantes controladas al 73% en retos contextuales, lo que indica sobreajuste a las familias de entrenamiento.
- Se omiten 6 de 60 cancelaciones gold, lo que puede provocar que el agente no detenga una tarea cuando deberia.
- La mejora del 1% al 91% combina adaptacion al esquema y mejora de decision; la comparacion solo de decision (33% a 91%) es la medida mas honesta de comprension de intencion.
- Riesgo de alucinacion no cuantificado; el modelo puede emitir JSON sintacticamente valido pero con etiquetas incorrectas.
- Sesgos conocidos no documentados en la informacion disponible.
- Compatibilidad limitada: solo MLX-LM; no se garantiza carga con PEFT o Transformers.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion ni sobre el dominio fuera de Minecraft-like.
- El repo no contiene los pesos del modelo base; es necesario descargar Qwen/Qwen3-1.7B en la revision exacta indicada y aplicar la conversion y cuantizacion correspondientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oopbofficial/mc-decision-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio MLX-LM: https://github.com/ml-explore/mlx-lm
- Repositorio MLX: https://github.com/ml-explore/mlx
- Dataset card referenciada en la model card: `DATASET_CARD.md` (incluido en el repositorio del modelo)
- Evidencia de comparacion referenciada: `comparison.json` (incluido en el repositorio del modelo)
- Dependencias fijadas: `requirements-lock.txt` (incluido en el repositorio del modelo)

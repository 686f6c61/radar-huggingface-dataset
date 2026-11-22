# axonry/wsp81-qwen3.5-0.8b

## Resumen

`axonry/wsp81-qwen3.5-0.8b` es una reconstruccion de un checkpoint ganador del concurso WeightSpaceProgramming (PR #81) de la subred 99 de Axonry, presentado por el UID 56 como `0009554110-0010`. Se trata de una edicion puramente de pesos sobre `Qwen/Qwen3.5-0.8B` (commit `2fc06364715b967f1860aea9cf38778875588b17`): no anade parametros, no incorpora detectores en tiempo de inferencia ni usa tool calls. El modelo mantiene la licencia Apache-2.0 heredada del modelo base.

El objetivo declarado de la edicion es el control de la longitud de razonamiento en dos etapas. Primero, se suprime el cierre prematuro del razonamiento aplicando un delta de pesos de policy-gradient (estimado con RLOO sobre cuatro muestras por problema matematico, ajustado solo en tokens de alta entropia) con coeficiente negativo. Segundo, se anade un "interruptor de cierre" sustituyendo hasta cuatro neuronas MLP de bajo uso por unidades condicionalmente activadas (`Wrap-up` / `BF` / `BX`) que elevan la probabilidad de emitir el token de fin de pensamiento cuando el razonamiento ya es tardio.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de edicion de pesos (weight-space programming) aplicada a un modelo pequeno de 0,8B con pipeline `image-text-to-text`; por otro, su model card incluye un conjunto de evaluaciones detallado con advertencias explicitas sobre el protocolo (autoevaluacion en GSM8K, posible fuga de datos, resultados no verificados por Hugging Face). El checkpoint fue creado y actualizado el 2026-11-22 y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); no se detalla mas en la informacion disponible |
| Parametros totales | 0,8B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; la evaluacion se sirvio con contexto de servidor de 73.728 tokens en vLLM |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (heredada de Qwen3.5-0.8B) |
| Formato de pesos | safetensors (formato nativo de `transformers`; BF16) |

## Arquitectura y entrenamiento

El modelo es una edicion de pesos sobre el checkpoint base Qwen3.5-0.8B, sin cambios estructurales en la arquitectura. La intervencion afecta a 96 de los 488 tensores del modelo, todos en BF16, y fue verificada contra la cadena de edicion publicada. No se anaden parametros ni modulos de inferencia. El proceso de edicion consta de dos fases: (1) supresion del cierre prematuro mediante un delta de pesos de policy-gradient calculado con RLOO sobre cuatro muestras por problema matematico, restringido a tokens de alta entropia y aplicado con coeficiente negativo; (2) sustitucion de hasta cuatro neuronas MLP de bajo uso por unidades `Wrap-up` / `BF` / `BX` que se activan condicionalmente para forzar la emision del token de fin de pensamiento y el inicio de una respuesta en caja cuando el razonamiento ya es tardio.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO adicionales. La model card menciona un digest de competicion (`fc928358e0f512ccd0aa996092da8566cf7ecbac34247511eb37f11ddc856b92`) calculado sobre la lista declarada de tensores editados, no sobre el archivo completo, y un SHA-256 del archivo reconstruido (`d8d4736de602603cc52d448a84b9716899bdf3d031706bb1416f0b841a4f7af2`). No se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (la model card reporta resultados con `enable_thinking` activado).
- Razonamiento matematico y resolucion de problemas (GSM8K, AIME 2026, HMMT February 2026).
- Control de longitud de razonamiento: la edicion esta disenada para evitar cierres prematuros y forzar el cierre cuando el razonamiento ya es tardio.
- Capacidades multimodales declaradas por el pipeline `image-text-to-text` (heredadas del modelo base; no se detallan en la model card).
- Soporte de tool calling / function calling: no disponible (la model card indica explicitamente "no tool calls").
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Modo "thinking" / "non-thinking" conmutable mediante `enable_thinking` (se reportan ejecuciones pareadas con y sin thinking).

## Casos de uso

- Evaluacion de tecnicas de edicion de pesos: el checkpoint sirve como referencia reproducible para estudiar weight-space programming sobre modelos pequenos, dado que la model card documenta la cadena de edicion, los digests y los tensores afectados.
- Razonamiento matematico de corta longitud: adecuado para problemas de tipo GSM8K donde se busca un razonamiento acotado y una respuesta final en caja, gracias al mecanismo de cierre condicional.
- Investigacion sobre control de longitud de razonamiento: util para comparar el comportamiento thinking frente a non-thinking con semillas y parametros de muestreo identicos, tal como reporta la model card.
- Prototipado en entornos con recursos limitados: con 0,8B parametros en BF16, el modelo cabe en GPU de consumo y permite iterar rapidamente en experimentos de razonamiento.
- Generacion de respuestas estructuradas en JSON/YAML: la model card evalua IFStruct v1.0 en modo no-thinking, por lo que puede usarse para probar salidas estructuradas, aunque con rendimiento limitado (16,85%).
- Analisis de decisiones tipadas: la model card reporta metricas de calibracion (accuracy, KL, Brier, ECE) sobre 400 casos, lo que lo hace util como banco de pruebas para estudiar calibracion en modelos pequenos.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-22 con el checkpoint reconstruido en BF16 sobre 8x RTX 5090, servido con vLLM 0.33.0 (8-way data parallel, contexto de servidor de 73.728 tokens). Valores en porcentaje salvo indicacion.

| Benchmark | Puntuacion | Tareas / muestras | Protocolo |
|---|---:|---|---|
| GSM8K | 84,034622 | 1.319 x 4 = 5.276 | 0-shot, prompt oficial de HF Inspect y scorer `model_graded_fact` (el juez es el propio modelo evaluado). Thinking on, T=0,6, top_p=0,95, top_k=20, presence 1,5, 32.768 tokens. `pass_at_1` sobre 4 epocas; 5.058 veredictos puntuables, 218 no puntuables excluidos. |
| MMLU-Pro | 47,007979 | 12.032 x 1 | Split de test completo, zero-shot, Inspect `multiple_choice` + `choice`. |
| IFBench | 35,000000 | 300 x 1 | 300 prompts oficiales held-out, `prompt_level_loose` sobre la respuesta final, temperatura 0. |
| IFStruct v1.0 | 16,850000 | 2.000 x 1 | Cliente nativo del autor, JSON/YAML sin restricciones, T=0, 16.000 tokens, sin thinking (plantilla por defecto). |
| Typed Decisions | accuracy 0,414000 · KL 1,22394048 nats · Brier 0,46348944 · ECE 0,33047390 | 400 casos / 2.000 decisiones | Probabilidades nativas de etiqueta, cuatro metricas separadas. |
| AIME 2026 | 4,791667 | 30 x 16 = 480 | Prompt y grading de MathArena, muestreo de MathArena Qwen3.5-0.8B (T=1,0, top_p=0,95, top_k=20, presence 1,5, 65.500 tokens), thinking explicito, avg@16. |
| HMMT February 2026 | 5,113636 | 33 x 16 = 528 | Igual que AIME 2026. |
| LEXam (cuatro opciones) | 32,809668 | 1.655 x 1 | `mcq_4_choices/test`, opciones decodificadas de la fuente serializada, scorer `choice` de Inspect. |

Control pareado thinking / non-thinking (mismas preguntas, semillas, parametros de muestreo y grader; solo cambia `enable_thinking`):

| Benchmark | Thinking | Default (non-thinking) | Delta |
|---|---:|---:|---:|
| AIME 2026 | 4,791667% | 0,416667% (2/480) | -4,375 pp |
| HMMT Feb 2026 | 5,113636% | 0,946970% (5/528) | -4,167 pp |

Advertencias de evaluacion declaradas por el autor: GSM8K es autoevaluado (el juez por defecto es el propio modelo); con denominador estricto que cuenta los 218 veredictos no puntuables como incorrectos, la puntuacion seria 80,67% (4.256 / 5.276). Existe posible fuga de GSM8K durante la seleccion de semillas. No hubo truncamiento en esta ejecucion (las 5.276 generaciones de GSM8K terminaron normalmente; longitud media de respuesta de 6.120 tokens). Los resultados son autodeclarados como `community` y no estan verificados por Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. Con 0,8B parametros en BF16, el peso del modelo ocupa aproximadamente 1,6 GB; en cuantizaciones de 8 y 4 bits se reduce a aproximadamente 0,8 GB y 0,4 GB respectivamente (estimacion a partir del tamano, no dato publicado).
- GPU recomendadas: la evaluacion se realizo sobre 8x RTX 5090 con vLLM 0.33.0 en 8-way data parallel y contexto de servidor de 73.728 tokens.
- GPU de consumo: por tamano, cabe en GPU de consumo (RTX 4090, RTX 3090, etc.); no se proporciona una lista oficial de compatibilidad.
- Opciones de despliegue: `transformers` (libreria declarada) y vLLM 0.33.0 (usado en la evaluacion). Otras opciones como llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `axonry/wsp81-qwen3.5-0.8b` | 0,8B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Edicion de pesos sobre Qwen3.5-0.8B; resultados autodeclarados |
| `Qwen/Qwen3.5-0.8B` | 0,8B | no disponible | Apache-2.0 | Hugging Face | Modelo base sin editar; la model card indica que frecuentemente agota el presupuesto en modo thinking |
| Otros modelos de ~0,8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se han publicado en la informacion disponible comparativas directas con modelos de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; los resultados en AIME 2026 (4,79%) y HMMT (5,11%) sugieren capacidad limitada en matematicas de competicion.
- Limitaciones de contexto o idioma: la longitud de contexto nativa no se especifica; los idiomas soportados no estan disponibles.
- Restricciones de licencia: Apache-2.0, heredada del modelo base; se permite uso comercial segun los terminos de dicha licencia.
- GSM8K autoevaluado: el juez por defecto es el propio modelo, lo que puede inflar la puntuacion; con denominador estricto baja a 80,67%.
- Posible fuga de datos en GSM8K durante la seleccion de semillas; la independencia del split de test no esta verificada.
- Resultados no verificados por Hugging Face (autodeclarados como `community`; no se emitio `verifyToken`).
- Sin soporte de tool calling ni de agentes documentado.
- IFStruct v1.0 con rendimiento bajo (16,85%) en salidas estructuradas sin thinking.
- Checkpoint con 0 descargas y 0 likes; sin adopcion comunitaria verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axonry/wsp81-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Pull request de WeightSpaceProgramming: https://github.com/AxOrganization/WeightSpaceProgramming/pull/81
- Resultados de evaluacion (directorio `.eval_results/`): https://huggingface.co/axonry/wsp81-qwen3.5-0.8b/tree/main/.eval_results

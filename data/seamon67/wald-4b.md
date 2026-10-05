# seamon67/Wald-4B

## Resumen

Wald-Q4B es un modelo de decision de pesos abiertos con aproximadamente 4.000 millones de parametros, construido a partir de Qwen3.5-4B-Base y publicado bajo licencia Apache-2.0. Su proposito no es generar texto conversacional, sino resolver una tarea concreta: recibe un estado (contexto) y un conjunto de opciones, y devuelve una probabilidad calibrada para cada opcion. Esta pensado para integrarse como componente de enrutado en agentes y pipelines, donde se necesita elegir una herramienta, clasificar una entrada o decidir si conviene pedir aclaraciones al usuario.

La ficha que se evalua aqui corresponde al repositorio `seamon67/Wald-4B`, una copia del modelo original `org2ai/Wald-4B`. El autor de esta copia es el usuario seamon67 y el repositorio declara explicitamente que el contenido procede del modelo original. El modelo base referenciado es `org2ai/Wald-4B` y la relacion declarada es de ajuste fino (finetune).

El modelo es relevante porque se posiciona como una alternativa autoalojada y abierta a la API alojada Jev de TypeSafe, de la que se declara independiente y no afiliada. Expone una API compatible con Jev (`POST /v1/systemone`), lee las opciones en una sola pasada y puede, opcionalmente, razonar antes de responder. Existen dos releases en el repositorio original: v1.1 (release general) y v1.2 (release de robustez, con un stage LoRA adicional orientado a mantener la decision ante texto distractorio o instrucciones falsas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de texto; basado en Qwen3.5-4B-Base (tag `qwen3_5_text`) |
| Parametros totales | Aproximadamente 4.000 millones (4B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (compatible con llama.cpp y Ollama); cuantizaciones concretas no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que Wald-Q4B se basa en Qwen3.5-4B-Base, un transformer decoder-only de la familia Qwen3.5, con variante de texto (tag `qwen3_5_text`). El modelo esta especializado en tareas de decision tipada: recibe un estado y una lista de opciones y emite una probabilidad por opcion. Segun la model card original, el modelo "lee las opciones en una sola pasada y puede, opcionalmente, pensar primero", lo que sugiere un modo de razonamiento opcional previo a la emision de probabilidades. La model card menciona tambien "efforts" de razonamiento evaluados (por ejemplo, `effort none` y `effort high`), lo que apunta a distintos niveles de esfuerzo de razonamiento configurables.

En cuanto al entrenamiento, la informacion proporcionada no detalla el numero de tokens ni la composicion del dataset. Se declara un ajuste fino sobre Qwen3.5-4B-Base y, para la release v1.2, "un stage LoRA fusionado" adicional, cuyo objetivo es que el modelo mantenga su respuesta cuando la entrada contiene frases distractoras, opiniones de terceros o instrucciones falsas. No se especifican en la informacion disponible si se emplearon tecnicas de RLHF o DPO, ni innovaciones como decodificacion especulativa o atencion lineal. El modelo se distribuye como componente de decision y no como modelo de chat.

## Capacidades

- Toma de decisiones estructuradas: dado un estado y un conjunto de opciones, devuelve una probabilidad calibrada para cada opcion.
- Clasificacion de entradas: utilizable como clasificador con salida probabilistica.
- Seleccion de herramientas (tool selection): apto para elegir que herramienta invocar en un agente.
- Enrutado de agentes (agent routing): dirige peticiones o tareas hacia el componente adecuado.
- Decision de aclaracion (clarification): determina si conviene preguntar al usuario antes de actuar.
- Razonamiento opcional: puede "pensar" antes de emitir la decision, con distintos niveles de esfuerzo (`effort none`, `effort high`).
- Robustez a texto distractorio: la release v1.2 incorpora un entrenamiento especifico para resistir frases distractoras, opiniones de terceros e instrucciones falsas.
- Compatibilidad de API: sirve un endpoint compatible con Jev (`POST /v1/systemone`).
- Multilingue: solo se declara soporte de ingles (en); no se declaran otras lenguas.
- Tool calling / function calling: no se documenta como capacidad generativa de function calling; la seleccion de herramientas se realiza devolviendo probabilidades sobre las opciones.

## Casos de uso

- Enrutado de peticiones en agentes: el modelo recibe el estado de la conversacion y la lista de subagentes o herramientas disponibles, y devuelve la probabilidad de cada opcion para seleccionar la ruta mas probable sin tener que parsear texto generado.
- Seleccion de herramientas en pipelines de automatizacion: dado un conjunto de funciones registradas, el modelo puntua cual invocar, integrándose en un orquestador que decide antes de ejecutar.
- Clasificacion de tickets o solicitudes: al recibir un texto de entrada y una lista de categorias, devuelve probabilidades calibradas que permiten umbralizar decisiones y desviar casos ambiguos a revision humana.
- Deteccion de necesidad de aclaracion: cuando la peticion del usuario es ambigua, el modelo puede decidir si conviene formular una pregunta aclaratoria antes de continuar, gracias a la opcion explicita de clarificacion.
- Enrutado tolerante a prompt injection: la release v1.2 esta entrenada para mantener la decision ante texto distractorio o instrucciones falsas (tasa de cambio declarada del 4,6 por ciento en JevAdvBench), lo que resulta adecuado en entradas no confiables.
- Componente autoalojado en sustitucion de una API de decision alojada: al exponer una API compatible con Jev, puede integrarse donde antes se consumia un servicio externo, manteniendo los datos en infraestructura propia.
- Clasificacion con umbral de confianza: al devolver probabilidades calibradas (ECE declarado de 0,045 en v1.2 sobre JevBench), permite fijar umbrales para derivar decisiones automaticas o escalado humano.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor del modelo en el `model-index` de la model card. Ninguno esta verificado por un leaderboard externo; se reproduce tal cual.

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| Decision Index 0.2.1, suite completa (150.317 peticiones) | Balanced-skill index (effort high) | 54,59 | Ejecutado por el autor con el kit oficial; PR de envio pendiente de validacion |
| JevBench public set (231 items), v1.1 | Accuracy (effort none) | 87,88% (203/231) | Autoevaluado |
| JevBench public set, v1.1 | Expected calibration error (10 bins) | 0,041 | Autoevaluado |
| JevBench public set, v1.1 | Brier score | 0,188 | Autoevaluado |
| JevBench public set (231 items), v1.2 (main) | Accuracy (effort none) | 88,31% (204/231) | Autoevaluado |
| JevBench public set, v1.2 (main) | Expected calibration error (10 bins) | 0,045 | Autoevaluado |
| JevBench public set, v1.2 (main) | Brier score | 0,191 | Autoevaluado |
| JevAdvBench (812 preguntas, 9 tipos de ataque entregados) | Mean flip rate (effort none, menor es mejor) | 4,6% | Autoejecutado |

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano declarado (aproximadamente 4.000 millones de parametros) y en los formatos soportados; la informacion proporcionada no incluye mediciones oficiales de VRAM, latencia ni throughput. Cualquier valor debe validarse en el entorno de destino.

- VRAM estimada en precision completa (fp16/bf16, safetensors): en torno a 8-10 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda reservar 12-16 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF): aproximadamente 3-4 GB, con margen para contexto adicional.
- GPU recomendadas (servidor): A100, H100 o equivalentes para despliegues con concurrencia y vLLM.
- GPU de consumo: cabe en tarjetas con 12 GB o mas, como RTX 3060 12 GB, RTX 4070 o RTX 4090. Con cuantizacion de 4 bits puede ejecutarse tambien en GPUs de 8 GB.
- Opciones de despliegue: los tags del repositorio mencionan vLLM, GGUF, llama.cpp y Ollama. La model card original indica que el modelo sirve una API compatible con Jev (`POST /v1/systemone`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wald-Q4B (v1.2) | ~4B | no disponible | 88,31% accuracy en JevBench (autoevaluado); flip rate 4,6% en JevAdvBench | Apache-2.0 | Pesos abiertos (safetensors, GGUF) |
| org2ai/Wald-4B | ~4B | no disponible | Identico (mismos pesos; `seamon67/Wald-4B` es una copia) | Apache-2.0 | Pesos abiertos |
| API alojada Jev de TypeSafe | no disponible | no disponible | no disponible | Propietaria | Solo servicio alojado |

No se dispone en la informacion proporcionada de otros modelos abiertos de decision con salida probabilistica que permitan una comparacion directa de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de ingles (en). El rendimiento en castellano u otros idiomas no esta documentado.
- Idiomas y contexto: la longitud de contexto no esta especificada en la informacion disponible, por lo que no puede garantizarse el comportamiento con entradas largas.
- Verificacion de benchmarks: todos los resultados son autoevaluados o ejecutados por el autor y marcados como no verificados. El resultado del Decision Index (54,59) esta pendiente de validacion en un PR de envio.
- Alucinacion: al emitir probabilidades sobre opciones, el riesgo no es tanto generar texto falso como asignar alta confianza a la opcion incorrecta; conviene aplicar umbrales y validacion en produccion.
- Robustez: aunque v1.2 reduce el cambio de decision ante texto adversario (4,6 por ciento de flip rate declarado), sigue existiendo una tasa de cambio no nula, relevante en entradas no confiables.
- Naturaleza del modelo: no es un modelo de chat ni un generador de respuestas; no debe usarse esperando texto conversacional ni function calling generativo.
- Afiliacion: el modelo se declara independiente de TypeSafe AI y no afiliado ni respaldado por dicha empresa. No contiene pesos de Jev.
- Licencia: Apache-2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribucion correspondientes.
- Procedencia de esta ficha: `seamon67/Wald-4B` es una copia de `org2ai/Wald-4B`; para trazabilidad conviene referenciar el repositorio original y fijar una revision concreta al descargar.
- Repositorio practicamente sin traccion: 0 descargas y 0 "likes" en el momento de la consulta.

## Enlaces

- Repositorio evaluado (HuggingFace): https://huggingface.co/seamon67/Wald-4B
- Modelo original (HuggingFace): https://huggingface.co/org2ai/Wald-4B
- Repositorio GitHub: https://github.com/org2AI/wald-4b
- Documentacion de la API: https://huggingface.co/org2ai/Wald-4B/blob/main/docs/api.md
- README en chino simplificado: https://huggingface.co/org2ai/Wald-4B/blob/main/docs/readmes/README.zh.md
- Envio al Decision Index (PR #30): https://github.com/apolinario/decision-index/pull/30
- Incidencia en JevBench (issue #146): https://github.com/fstandhartinger/jevbench/issues/146
- Resumen de evaluacion de v1.2: https://huggingface.co/org2ai/Wald-4B/blob/v1.2/evaluation/v1.2/summary.json
- Etiqueta de release v1.2: https://huggingface.co/org2ai/Wald-4B/tree/v1.2
- Etiqueta de release v1.1: https://huggingface.co/org2ai/Wald-4B/tree/v1.1

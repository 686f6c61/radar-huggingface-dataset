# Daniel01410/microtensor_ctx_compress

## Resumen

`Daniel01410/microtensor_ctx_compress` no es un modelo de lenguaje entrenado al uso, sino una plantilla de repositorio para participar en las arenas de evaluación de Microtensor, una infraestructura de evaluación descentralizada de modelos. El autor la publica como punto de partida para la tarea de compresión de contexto (`ctx_compress`), en la que un agente de programación debe condensar su sesión en un JSON de cinco campos ajustándose a un presupuesto de tokens.

El repositorio contiene el andamiaje de una submission completa: un harness de evaluación (`main.py`, `harness/`), un router clasificador de una sola logit, un módulo de reparación con modelos frontier (`escalation/`) y adaptadores de tarea, incluido `context_compression`. La model card indica que el modelo especializado (SLM) debe alojarse en un repositorio aparte (`mt_slm_<arena>`), de modo que este repositorio no incluye pesos de un modelo concreto.

La relevancia es acotada: se trata de material de infraestructura para un sistema de evaluación, no de un modelo publicable. No hay información sobre arquitectura, parámetros, datos de entrenamiento ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una plantilla de harness; el SLM se aloja en un repositorio separado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32768 tokens (valor de `max_context` en la configuración del adaptador `context_compression`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (el router incluye `model.safetensors`; el SLM debe publicarse como `model.safetensors`) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura del modelo en sí. El repositorio describe un sistema de componentes: un SLM servido por la imagen oficial del motor en la GPU del participante, un harness que se ejecuta en sandbox sin red salvo el gateway de grabación, un router cargado como clasificador de secuencia de una sola logit y un módulo de escalado a modelos frontier cuyos recibos firmados se verifican en la reproducción. Los validadores replican el harness en CPU contra la transcripción y comprueban por muestreo las llamadas al modelo en el mismo perfil de hardware.

El adaptador `context_compression` define el contrato de la tarea: un objeto JSON de cinco campos que compacta la sesión de un agente de programación, con plegado de claves extra en `summary` y de entradas de objeto en cadenas planas, y verificación del presupuesto de tokens indicado en la instrucción. Los prompts usan el formato de chat de Qwen; para Phi 4 mini deben sustituirse por los marcadores `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`. El límite de generación configurado es de 3072 tokens nuevos. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Compresión de contexto de sesiones de agentes de programación en un JSON estructurado de cinco campos, con control del presupuesto de tokens.
- Verificación de respuestas antes de devolverlas mediante el adaptador: un único objeto JSON, plegado de claves y comprobación del límite de tokens.
- Adaptador `sql_generation`: generación de una consulta SQLite a partir de una pregunta y un esquema, validada con sqlglot, tablas conocidas y ejecución sobre la base de datos de muestra.
- Adaptador `generic`: tareas estructuradas o de texto libre con verificación de no vacío, cota de longitud y rechazo de instrucciones inyectadas.
- Enrutamiento mediante clasificador de una logit entrenado sobre borradores del propio modelo y etiquetado por el grader de la arena.
- Escalado a modelos frontier con recibos firmados verificables en la reproducción.
- Soporte de formato de chat Qwen y Phi 4 mini mediante plantillas de prompt intercambiables.
- No se documentan capacidades multilingües, de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Compresión de sesiones de agentes de programación: el adaptador `context_compression` condensa una sesión larga en un JSON de cinco campos sujeto a un presupuesto de tokens, adecuado para mantener contexto operativo en agentes con ventanas limitadas.
- Participación en arenas de evaluación de Microtensor: el repositorio sirve como submission funcional para cualquier arena, seleccionando el adaptador correspondiente a la tarea definida por la arena.
- Evaluación de modelos especializados en compresión de contexto: permite comparar un SLM propio frente a los componentes de referencia de la arena con reproducción verificable en CPU.
- Generación de SQL verificada: con el adaptador `sql_generation`, se puede desplegar un componente que traduzca preguntas en lenguaje natural a consultas SQLite validadas sintáctica y semánticamente antes de su ejecución.
- Enrutamiento selectivo con escalado: el router decide cuándo derivar una consulta a un modelo frontier, lo que permite optimizar coste en pipelines con mezcla de modelos pequeños y grandes.
- Desarrollo de harness y verificadores propios: el esqueleto permite extender `Adapter` con métodos `verify`, `clean`, `query` y `render` para nuevas tareas, con plantillas de prompt en `harness/prompts/<name>/`.
- Validación previa al despliegue: las herramientas `mt submit validate` y `mt check-model` permiten comprobar la integridad del manifiesto y la carga de configuración, tokenizador y cabeceras safetensors en CPU antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del SLM elegido, que se aloja en un repositorio separado).
- GPU recomendadas: no disponible; el participante declara un perfil de hardware de entre los permitidos por la definición de la arena (`evaluation.profiles`).
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: imágenes oficiales del motor de Microtensor en la GPU del participante durante la ventana de evaluación; el harness se ejecuta en sandbox sin red salvo el gateway de grabación y se reproduce en CPU por los validadores.
- Latencia y throughput: no disponibles.
- Restricciones de tamaño: `harness/` y `escalation/` deben ocupar juntos menos de 2 MB.

## Comparativa con modelos similares

No disponible. El repositorio es una plantilla de submission para arenas de evaluación y no un modelo con alternativas comparables en parámetros, contexto o rendimiento. La comparación relevante sería entre SLM candidatos para la tarea `ctx_compress` (por ejemplo, Qwen y Phi 4 mini, mencionados en la model card como formatos de prompt soportados), pero no se aportan datos de rendimiento de ninguno de ellos.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; sin un SLM publicado en `mt_slm_<arena>`, la submission no es evaluable.
- No se especifican licencia, idiomas ni pipeline, lo que impide determinar condiciones de uso comercial.
- El adaptador `context_compression` impone un contrato estricto de JSON de cinco campos; respuestas con claves extra se pliegan en `summary` y las entradas de objeto se convierten en cadenas planas, lo que puede perder estructura.
- El límite de contexto configurado es de 32768 tokens y el de generación de 3072; sesiones más largas requieren truncado o compactación previa.
- El harness se ejecuta sin red salvo el gateway de grabación, lo que restringe dependencias externas a la lista permitida.
- Los validadores comprueban por muestreo las llamadas al modelo en el mismo perfil de hardware, por lo que un perfil declarado incorrectamente invalida la evaluación.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- El router se entrena sobre borradores del propio modelo etiquetados por el grader de la arena; su calidad depende de la cobertura de los elementos de muestra públicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Daniel01410/microtensor_ctx_compress
- Documentación de evaluación descentralizada: https://www.microtensor.cloud/docs/certified-inference/system/decentralised-evaluation
- Documentación de perfiles de hardware: https://www.microtensor.cloud/docs/certified-inference/system/hardware-profiles
- API de definición de arenas: https://api.microtensor.cloud/v2/arenas/<arena>

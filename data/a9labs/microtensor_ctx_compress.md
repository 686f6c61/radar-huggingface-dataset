# A9Labs/microtensor_ctx_compress

## Resumen

`A9Labs/microtensor_ctx_compress` no es un modelo de lenguaje propiamente dicho, sino una plantilla de repositorio publicada en Hugging Face para participar en las "Microtensor arenas", un sistema de evaluación descentralizada de modelos pequeños (SLM) especializados. El repositorio contiene el andamiaje necesario para presentar una submission: un modelo especializado (`mt_slm_<arena>`), un harness de ejecución, un router y un módulo de reparación con modelos frontera. El autor declarado es A9Labs y el repositorio fue creado el 3 de noviembre de 2026.

El nombre del repositorio sugiere que está orientado a la arena de compresión de contexto (`context_compression`), cuyo adaptador compacta la sesión de un agente de código en un JSON de cinco campos (`ctx_compress`). La plantilla menciona explícitamente Qwen y Phi 4 mini como formatos de chat de referencia, y fija un contexto máximo de 32 768 tokens con hasta 3 072 tokens nuevos en la configuración de ejemplo.

La relevancia de este repositorio es metodológica más que de modelado: documenta el flujo completo de submission (entrenamiento y compresión del SLM, entrenamiento del router, verificación del harness, validación del manifiesto y commit dentro de la ventana de evaluación). No se ha publicado información sobre pesos, arquitectura concreta ni resultados de benchmarks del modelo en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la plantilla referencia formatos de chat de Qwen y Phi 4 mini, sin especificar arquitectura propia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens (valor de ejemplo en `config.json` para el adaptador `context_compression`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el layout de repositorio descrito: `model.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo. El repositorio es una plantilla de submission: el modelo especializado se entrena y comprime a partir del modelo base que define cada arena, y se publica en un repositorio separado (`mt_slm_<arena>`) con su propio `README.md`, `LICENSE`, `config.json`, `generation_config.json`, `model.safetensors`, `tokenizer.json` y `tokenizer_config.json`. La carpeta `training/` del repositorio del SLM debe contener la receta, las fuentes de datos, el proceso de destilación, la compresión y los scripts de ejecución.

El pipeline de evaluación es descentralizado: el participante declara un perfil de hardware, ejecuta las imágenes oficiales en su propia GPU durante la ventana de evaluación y sube una transcripción; los validadores replican el harness en CPU y verifican por muestreo las llamadas al modelo sobre el mismo perfil. El harness y el módulo de escalado deben ocupar juntos menos de 2 MB. El router se carga como un clasificador de secuencia de un solo logit y se entrena sobre borradores del propio modelo, etiquetados por el grader de la arena sobre los ítems públicos de muestra.

## Capacidades

- Generación de texto estructurado: el adaptador `generic` cubre tareas de texto libre o estructurado con verificación de no vacío, cota de longitud y rechazo de instrucciones inyectadas.
- Generación de SQL: el adaptador `sql_generation` produce una consulta SQLite a partir de una pregunta y un esquema, validada con sqlglot, con comprobación de tablas conocidas y ejecución sobre la base de datos de muestra de la arena.
- Compresión de contexto: el adaptador `context_compression` compacta la sesión de un agente de código en un objeto JSON de cinco campos, pliega claves extra en `summary` y entradas de objeto en cadenas planas, y comprueba el presupuesto de tokens indicado en la instrucción.
- Reintentos y reparación: las plantillas admiten `{draft}`, `{errors}` y `{trace}` en reintentos y reparaciones, lo que permite corregir respuestas que fallan la verificación.
- Escalado a modelos frontera: el módulo `escalation/` ejecuta reparaciones en el sandbox con un ticket que paga llamadas frontera a través del relay, con recibos firmados verificados en la réplica.
- Enrutado: el router clasifica borradores para decidir el paso de enrutado, cargado por los validadores desde el mirror.
- Multiidioma, tool calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Compresión de sesiones de agentes de código: el adaptador `context_compression` convierte transcripciones largas de un agente en un JSON de cinco campos con presupuesto de tokens controlado, útil para mantener contexto operativo en pipelines de agentes con ventanas limitadas.
- Generación de consultas SQL verificadas: el adaptador `sql_generation` traduce preguntas en lenguaje natural a SQLite y valida la consulta antes de devolverla, lo que encaja en asistentes de análisis de datos con esquemas fijos.
- Participación en arenas de evaluación descentralizada: el repositorio sirve como base para presentar un SLM propio a una arena Microtensor, con manifiesto, perfil de hardware y validación previa mediante `mt submit validate` y `mt check-model`.
- Entrenamiento de routers de enrutado: la carpeta `router/training/train_router.py` permite entrenar un clasificador de un logit sobre borradores propios etiquetados por el grader de la arena, aplicable a sistemas de selección entre modelo pequeño y modelo frontera.
- Reparación asistida con modelos frontera: el módulo `escalation/` permite que un SLM delegue en un modelo mayor las respuestas que fallan la verificación, con recibos firmados que garantizan la trazabilidad del coste.
- Desarrollo de harness con verificación estricta: la plantilla incluye `engine.py`, `verifier.py`, adaptadores y prompts, reutilizables como base para construir pipelines de evaluación con verificación programática de salidas.
- Pruebas de conformidad de modelos en CPU: `mt check-model` carga en seco configuración, tokenizador y cabeceras de safetensors en CPU e imprime `ok` o el motivo de rechazo del mirror, útil como paso de CI antes de publicar un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base de la arena y del SLM resultante, no especificado).
- GPU recomendadas: no disponible; la plantilla exige declarar un perfil de hardware de entre los permitidos por la definición de la arena (`evaluation.profiles`).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se sirve con la imagen oficial del motor de Microtensor sobre la GPU del participante durante la ventana de evaluación; los validadores replican el harness en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Restricciones adicionales: el harness y el módulo de escalado deben ocupar conjuntamente menos de 2 MB; el sandbox no tiene red salvo el gateway de grabación.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio es una plantilla de submission, no un modelo entrenado: no contiene pesos utilizables ni una model card con especificaciones del modelo.
- No se especifican licencia ni condiciones de uso comercial; el repositorio del SLM debe incluir su propio `LICENSE`, pero en esta ficha no está disponible.
- No se declaran idiomas soportados ni sesgos conocidos.
- El adaptador `context_compression` impone un presupuesto de tokens que la instrucción debe indicar; respuestas que excedan el presupuesto o no sean un único objeto JSON fallan la verificación.
- El harness y las reparaciones se ejecutan en un sandbox sin red salvo el gateway de grabación, lo que limita dependencias externas.
- Las llamadas a modelos frontera en `escalation/` requieren tickets y quedan sujetas a verificación de recibos firmados en la réplica.
- El modelo debe pasar `mt check-model` antes de la evaluación; un modelo que falle esta comprobación nunca se evalúa.
- El commit debe realizarse antes del cierre de la ventana de commits de la época; las arenas de testnet son gratuitas, pero las que cobran tarifa requieren pago previo y cita de la transferencia.
- La fecha de creación del repositorio (2026-11-03) y la ausencia de descargas y likes indican que no hay evidencia pública de uso ni validación por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/A9Labs/microtensor_ctx_compress
- Documentación de evaluación descentralizada: https://www.microtensor.cloud/docs/certified-inference/system/decentralised-evaluation
- Documentación de perfiles de hardware: https://www.microtensor.cloud/docs/certified-inference/system/hardware-profiles
- Endpoint de definición de arenas: https://api.microtensor.cloud/v2/arenas/<arena>

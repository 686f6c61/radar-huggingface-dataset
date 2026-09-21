# CharlieLLL/Qwen3.5-9B-coding-solo350-local63-ckpt335-appendonly-w64-20260920

## Resumen

Qwen3.5-9B-coding-solo350-local63-ckpt335-appendonly-w64-20260920 es una exportación de pesos de inferencia publicada por el usuario CharlieLLL sobre el modelo base Shangy/Qwen3.5-9B-OPD-Coding. Se trata de un ajuste orientado a tareas de ingeniería de software (coding agents y resolución de issues) obtenido mediante aprendizaje por refuerzo en modo que el autor denomina "Solo RL", con 336 actualizaciones de optimizador en el punto de control publicado (numeración local basada en cero). El nombre del repositorio codifica la configuración del experimento: 350 tareas "solo", 63 locales, checkpoint 335, evaluador con ventana de 64 episodios concurrentes y evaluación "append-only" con control de regresión.

El modelo tiene 8.953.803.264 parámetros (~8,95 B) almacenados en safetensors, con un repositorio de 17,9 GB, lo que corresponde a pesos en precisión de 16 bits. Es relevante porque documenta un caso poco habitual: un checkpoint intermedio de RL (no el paso final) exportado explícitamente para reproducir una campaña de evaluación sobre SWE-bench Verified, con plantilla de chat de evaluación separada de la nativa y con trazabilidad de revisiones de exportación y de coordinador.

La información disponible no incluye especificaciones de longitud de contexto, idiomas, cuantizaciones publicadas ni resultados numéricos de benchmarks; el autor remite los resultados completos a un dataset aparte. La licencia declarada es Apache-2.0, y el modelo está marcado como compatible con endpoints de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags de HuggingFace indican familia qwen3_5; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni FP8 en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 17,9 GB |
| Modalidad declarada | image-text-to-text (segun tags); model card centrada en coding |
| Modelo base | Shangy/Qwen3.5-9B-OPD-Coding |
| Metodo de ajuste | Aprendizaje por refuerzo (Solo RL), checkpoint intermedio de 336 actualizaciones de optimizador |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se proporciona en la informacion disponible la descripcion detallada de la arquitectura interna (número de capas, tipo de atención, vocabulario, posición de las cabezas, etc.). Los tags de HuggingFace indican la familia `qwen3_5` y la presencia de componentes de tipo `image-text-to-text`, lo que sugiere capacidades multimodales, pero la model card no documenta ningún módulo de visión ni proceso de entrenamiento multimodal para este checkpoint. El pipeline declarado es `reinforcement-learning`.

Lo que sí está documentado es el procedimiento de ajuste y evaluación. El entrenamiento se realizó en modo "Solo RL" partiendo de Shangy/Qwen3.5-9B-OPD-Coding (que a su vez no es el modelo bruto: el autor indica que la inicialización del entrenamiento se registra aparte en `ORIGINAL_CHECKPOINT.json` y que "Solo350 local63" no es la línea base del modelo sin ajustar). El checkpoint publicado es intermedio, correspondiente a 336 actualizaciones del optimizador. La evaluación se hizo en modo "orch", con un orquestador MiniMax-M2.7 y este modelo de 9B actuando como worker, con el modo de razonamiento (thinking) desactivado. Una criba completa independiente de 150 tareas usa 64 episodios concurrentes y sandboxes de 10 GiB, con un evaluador "append-only" con control de regresión aplicado por igual a los cuatro modelos comparados. El autor advierte explícitamente que las ejecuciones previas a 32 concurrencias con el harness original se etiquetan como contexto histórico y no como líneas base emparejadas, y que una única puntuación no permite afirmar una mejora estable.

La exportación contiene únicamente pesos de inferencia: el estado de reanudación del optimizador y del RNG no forma parte del export. Se incluyen `ORIGINAL_CHECKPOINT.json` (procedencia), `MODEL_SHA256.json` (listado de ficheros publicados), `eval_chat_template.jinja` (plantilla exacta de evaluación) y `chat_template.jinja` (plantilla nativa, conservada por separado). Para reproducir la campaña hay que usar la plantilla de evaluación y desactivar el thinking. Revisiones registradas: donante de exportación `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y coordinador `d494266a4affc0d2995ba1fa35c8481cbd84294b`.

## Capacidades

- Generación de código orientada a resolución de issues reales en repositorios, según el objetivo declarado del ajuste (tags `coding` y `swe-bench`).
- Ejecución como worker dentro de una arquitectura de orquestación: el modelo está diseñado para operar bajo las indicaciones de un orquestador externo (MiniMax-M2.7 en la campaña documentada), no necesariamente como agente autónomo completo.
- Modo de razonamiento (thinking) conmutable: la campaña de evaluación se ejecutó con thinking desactivado, lo que implica que el modelo soporta al menos ese modo de operación.
- Posible soporte multimodal (image-text-to-text) según los tags del repositorio, sin documentación que lo confirme en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: implícito en el uso como worker con orquestador y en el entorno de evaluación con sandboxes Docker, aunque no se detalla formalmente.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, decodificación especulativa, atención lineal): no disponible.

## Casos de uso

- Reproducción de investigación en RL para código: el repositorio está pensado explícitamente para replicar la campaña del 2026-09-20 sobre SWE-bench Verified usando `eval_chat_template.jinja` y thinking desactivado, con los hashes de `MODEL_SHA256.json` como control de integridad. Es el caso de uso primario documentado.
- Comparación de checkpoints intermedios: al ser un punto de control de la iteración 336 (no el final), permite estudiar la curva de aprendizaje del RL frente al checkpoint final y frente a la inicialización OPD109, algo poco frecuente en modelos publicados.
- Agente de resolución de issues en pipelines internos: desplegado como worker detrás de un orquestador, puede recibir tareas acotadas de edición de ficheros y ejecución de tests dentro de contenedores Docker, que es el modo en que fue evaluado.
- Generación y parcheo de código asistido en IDE: para autocompletado y refactorización sobre bases de código, aprovechando el ajuste específico en coding; requiere validar previamente la latencia en el hardware objetivo, dato no disponible.
- Evaluación de harness y de infraestructura de agentes: el modelo sirve como componente fijo para medir el efecto de cambios en el orquestador, el número de episodios concurrentes o el tamaño de los sandboxes, dado que el autor separa explícitamente resultados emparejados de contexto histórico.
- Estudio de degradación por regresión: el evaluador "append-only" con control de regresión permite usar este checkpoint como caso de prueba para detectar si una política de RL intermedia pierde capacidades respecto a iteraciones anteriores.
- Base para ajuste posterior (SFT/DPO) en dominios de código específicos: al publicarse con licencia Apache-2.0 y pesos safetensors estándar compatibles con `transformers`, es reutilizable como punto de partida, siempre que se disponga del hardware adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la campaña de evaluación (SWE-bench Verified, conjunto held-out de 150 tareas, 64 episodios concurrentes, sandboxes de 10 GiB, cuatro modelos con las mismas tareas y evaluador) y remite los resultados completos, la latencia por tarea, los percentiles de finalización T25/T50/T75/T90/T100, el desglose Docker y la contabilidad de tokens y caché de prefijos al dataset `CharlieLLL/SWEbench-Verified-eval150-M2.7-new-checkpoints-appendonly-w64-20260920`. Ninguna cifra numérica de rendimiento aparece en la información proporcionada, por lo que no se reproduce ninguna tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 8,95 B de parámetros ocupan aproximadamente 17,9 GB (coincide con el tamaño del repositorio), más el coste de caché KV, que depende de la longitud de contexto (no disponible).
- Cuantización a 8 bits: aproximadamente 9-10 GB de pesos. Cuantización a 4 bits: aproximadamente 5-6 GB de pesos. Estos valores son estimaciones por tamaño de parámetros; no se han publicado ficheros cuantizados oficiales.
- GPU recomendadas: para bf16 sin cuantizar, GPU de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100). Con cuantización a 8 o 4 bits, cabe en GPU de consumo de 12-16 GB.
- Cabe en GPU de consumo: sí, en bf16 con 24 GB con margen ajustado según contexto; en 4-8 bits en tarjetas de 8-12 GB. No hay confirmación oficial de que el modelo haya sido probado en estas configuraciones.
- Opciones de despliegue: `transformers` (librería declarada) y endpoints compatibles de HuggingFace. No se documentan recetas para vLLM, SGLang, llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.
- Requisito adicional de la campaña de evaluación: contenedores Docker con sandboxes de 10 GiB y ejecución de 64 episodios concurrentes, lo que implica infraestructura de orquestación con CPU y disco considerables, no solo GPU.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo base y con los tres modelos restantes de la campaña, cuyos nombres no se detallan.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (CharlieLLL/Qwen3.5-9B-coding-solo350-local63-ckpt335...) | 8,95 B | no disponible | no disponible (resultados en dataset aparte) | Apache-2.0 | Pesos safetensors en HuggingFace, 0 descargas |
| Shangy/Qwen3.5-9B-OPD-Coding (modelo base) | ~8,95 B (no confirmado en la informacion) | no disponible | no disponible | no disponible | Referenciado como base_model |
| Otros modelos de la campana eval150 (3 adicionales) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas genericas de codigo de ~8-9 B (p. ej. familias tipo Qwen-Coder o Llama de ese rango) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a 336 actualizaciones de optimizador (numeración local basada en cero) y no al final del entrenamiento. El autor advierte que no se puede afirmar una mejora estable a partir de una única puntuación.
- Evaluación no emparejada con resultados previos: las ejecuciones a 32 concurrencias con el harness original se etiquetan como contexto histórico, no como línea base comparable. Cualquier comparación con ellas es inválida.
- Requisitos de reproducción estrictos: hay que usar `eval_chat_template.jinja` (no la plantilla nativa `chat_template.jinja`) y desactivar el modo thinking; de lo contrario, los resultados no son reproducibles.
- Dependencia de un orquestador externo: el modo evaluado es "orch" con MiniMax-M2.7 como orquestador. El rendimiento como modelo autónomo sin orquestador no está documentado.
- Ausencia total de datos de benchmarks en la información disponible: no se pueden citar cifras de SWE-bench Verified ni de ningún otro conjunto.
- Idiomas soportados no especificados: no se puede garantizar un comportamiento correcto fuera del inglés, idioma habitual en SWE-bench.
- Sesgos conocidos: no disponibles. No hay documentación de evaluación de sesgos, toxicidad o alineación.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas de código se traduce en parches plausibles pero incorrectos, riesgo inherente a este tipo de ajuste por RL sobre entornos de test.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; al derivar de un modelo base de terceros (Shangy/Qwen3.5-9B-OPD-Coding) conviene verificar las condiciones de ese repositorio y de la familia Qwen subyacente antes de un despliegue en producción.
- Trazabilidad limitada: la inicialización real del entrenamiento está en `ORIGINAL_CHECKPOINT.json` y no coincide con la etiqueta "Solo350 local63"; confundir el número de checkpoint local con la etiqueta de inicialización OPD109 es un error documentado por el propio autor.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de consulta, sin validación independiente de la comunidad.
- Ausencia de cuantizaciones oficiales y de recetas de despliegue para servidores de inferencia de alto rendimiento, lo que obliga a trabajo adicional de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieLLL/Qwen3.5-9B-coding-solo350-local63-ckpt335-appendonly-w64-20260920
- Dataset de resultados de la campana eval150: https://huggingface.co/datasets/CharlieLLL/SWEbench-Verified-eval150-M2.7-new-checkpoints-appendonly-w64-20260920
- Modelo base: https://huggingface.co/Shangy/Qwen3.5-9B-OPD-Coding
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada (las busquedas web no devolvieron resultados relacionados con el modelo)

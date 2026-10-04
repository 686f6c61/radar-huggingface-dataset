# Avicennasis/K2-Horizon-7B-heretic

## Resumen

K2-Horizon-7B-heretic es una version "abliterated" (con los rechazos eliminados) del checkpoint IFM/K2-Horizon-7B, publicada por el usuario Avicennasis. Se distribuye como checkpoint fusionado completo en BF16, no como adaptador, y conserva la licencia Apache-2.0 del modelo base. El objetivo declarado es eliminar el comportamiento de rechazo del modelo original mediante direcciones de ablacion adversariales por capa, aplicadas con la herramienta Heretic.

El modelo resuelve un caso de uso muy concreto: obtener una variante del K2-Horizon-7B que responda a peticiones que el checkpoint base rechazaba, sin destruir el comportamiento general. Segun la model card, la tasa de rechazos en un conjunto de 50 sondas de red-team bajo propio paso de 18/50 (36,0%) en el modelo base a 7/50 (14,0%) en la variante abliterada, manteniendo intactas las respuestas a controles factuales, un haiku y una receta.

Es relevante ahora porque permite comparar de forma controlada el comportamiento de seguridad de un mismo checkpoint antes y despues de la ablacion, y porque cubre un hueco practico (generacion de ficcion, roleplay y datos adversarios) en un modelo de aproximadamente 9.000 millones de parametros con soporte para ingles y chino. El repositorio no acumula descargas ni likes en los metadatos disponibles y esta fechado en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (implementacion personalizada `k2_horizon`; requiere `trust_remote_code=True`) |
| Parametros totales | 8.999.178.240 (aproximadamente 9B) |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos completos); variante MLX 8-bit en repositorio aparte; GGUF y otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (heredada del checkpoint base) |
| Formato de pesos | safetensors (BF16, checkpoint fusionado) |

## Arquitectura y entrenamiento

La arquitectura concreta del modelo base IFM/K2-Horizon-7B no se detalla en la informacion disponible: se sabe que la implementacion requiere codigo personalizado (`modeling_k2_horizon.py`, tag `k2_horizon`) y que el repositorio incluye una correccion upstream de `@capture_outputs`, de modo que `output_hidden_states=True` devuelve los estados por capa. No se proporcionan datos sobre tipo de transformer, atencion, numero de capas, dimension oculta ni ventana de contexto.

Respecto al proceso de creacion, la model card indica que la ablacion se realizo con Heretic mediante direcciones de ablacion adversariales por capa, y que el resultado es un checkpoint completo en BF16 fusionado, no un adaptador. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, porque la intervencion no es un reentrenamiento sino una modificacion de pesos. La model card tambien anade un `tokenizer_config.json` con una plantilla de chat funcional, ya que el proveedor original distribuye sus plantillas con `chat_template: null`.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat funcional incluida en el repositorio.
- Comportamiento con rechazos reducidos: la ablacion elimina la mayoria de las negativas del modelo base en las categorias de doble uso, ficcion y sensibles.
- Razonamiento y calculo basico: el ejemplo de uso de la model card plantea una multiplicacion aritmetica simple (17 x 23) con respuesta numerica directa, aunque no se publican benchmarks de matematicas.
- Respuesta a preguntas factuales y generacion de contenido creativo breve (los controles de la evaluacion incluyen preguntas factuales, un haiku y una receta, que se mantienen correctos tras la ablacion).
- Acceso a estados ocultos por capa mediante `output_hidden_states=True`, util para analisis interpretabilidad y extraccion de representaciones.
- Compatibilidad nativa con `transformers` a traves de `trust_remote_code=True`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Escritura de ficcion sin friccion: autores y guionistas pueden generar narrativa con tematicas adultas, violencia o conflicto moral que el checkpoint base rechazaria. El modelo esta explicitamente orientado a este escenario (la categoria "fiction" pasa de 2/8 rechazos a 0/8 en la evaluacion del autor).
- Investigacion en seguridad de IA: comparar el comportamiento del base y del abliterated sobre el mismo conjunto de sondas permite medir cuanto del comportamiento de rechazo reside en direcciones por capa y cuanto esta distribuido, con una tasa observada del 36,0% al 14,0%.
- Generacion de datos adversarios para clasificadores de seguridad: producir respuestas que un modelo alineado rechazaria sirve para entrenar o evaluar moderadores de contenido, aprovechando que el modelo mantiene coherencia en preguntas factuales.
- Roleplay y personajes persistentes: conversaciones multi-turno con personajes que requieren mantener tono y caracter sin que el modelo interrumpa con negativas, en ingles o chino.
- Asistente conversacional en chino e ingles: el repositorio incluye plantilla de chat operativa, lo que permite desplegarlo directamente con `apply_chat_template` en aplicaciones bilingues donde el filtrado de contenido se gestione en una capa externa.
- Base para fine-tuning con pesos completos: al distribuirse como checkpoint BF16 fusionado y no como adaptador, es un punto de partida limpio para ajuste supervisado o DPO sobre dominios especificos, sin arrastrar la estructura de un LoRA.
- Despliegue en Apple Silicon: la variante MLX 8-bit permite ejecutar el modelo en equipos con memoria unificada, util para prototipado local de investigacion.
- Analisis de representaciones internas: con `output_hidden_states=True` corregido, se pueden extraer estados por capa para estudiar como se codifica la negativa a responder antes y despues de la ablacion.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del "house red-team v2" del autor: 50 sondas evaluadas en bfloat16, comparando el checkpoint base con la version abliterada.

| Categoria | Antes (base) | Despues (abliterated) |
|---|---|---|
| Control | 0/8 | 0/8 |
| Doble uso | 3/18 | 0/18 |
| Sensible | 13/16 | 7/16 |
| Ficcion | 2/8 | 0/8 |
| Total | 18/50 (36,0%) | 7/50 (14,0%) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala que la ablacion no actua como una barrera limpia: persisten 7 rechazos en sondas sensibles, 6 de los cuales el modelo base tambien rechazaba.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos (el repositorio ocupa 18,0 GB) y del orden de 20-24 GB considerando cache KV y overhead del runtime.
- GPU recomendadas para BF16: A100 40 GB o 80 GB, H100, L40S 48 GB. En consumer, RTX 4090 24 GB y RTX 3090 24 GB son el minimo practico para pesos completos.
- Cabe en consumer GPU: si, en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en BF16. Por debajo de eso no hay cuantizaciones publicadas en el repositorio salvo la variante MLX 8-bit (aproximadamente 9-10 GB), utilizable en Apple Silicon con 16 GB o mas de memoria unificada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada y documentada; MLX para Apple Silicon a traves de `Avicennasis/K2-Horizon-7B-heretic-mlx-8bit`. El soporte en vLLM, TGI, llama.cpp u Ollama no esta documentado y depende de que esos runtimes acepten el codigo personalizado `k2_horizon`; no hay GGUF publicado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Avicennasis/K2-Horizon-7B-heretic | 8.999.178.240 | no disponible | 7/50 (14,0%) en red-team v2 | Apache-2.0 | safetensors BF16 y MLX 8-bit |
| IFM/K2-Horizon-7B (base) | mismo checkpoint (8.999.178.240) | no disponible | 18/50 (36,0%) en red-team v2 | Apache-2.0 | checkpoint original del proveedor |
| IFM/K2-Horizon-0.9B | no disponible | no disponible | no disponible | no disponible | mencionado en discusiones del proveedor |
| Otras alternativas abliterated de ~7-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas publicadas frente a otros modelos abliterated de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina comportamiento de rechazo, no el entrenamiento de seguridad subyacente. El autor lo indica expresamente: el modelo abliterated tiene un comportamiento de seguridad mas debil que el base.
- Persisten 7 rechazos sobre 16 sondas sensibles, es decir, la eliminacion de negativas no es completa ni uniforme entre categorias.
- Riesgo elevado de generar contenido danino, sesgado o ilegal segun el uso: la reduccion de rechazos en la categoria de doble uso pasa de 3/18 a 0/18, lo que implica que el modelo responde a peticiones que el base filtraba.
- No hay evaluacion con benchmarks estandar de calidad (razonamiento, codigo, matematicas), por lo que no se puede cuantificar si la ablacion degrada capacidades generales mas alla de los controles basicos del autor.
- La evaluacion de red-team es interna del autor, con 50 sondas y sin verificacion independiente; los resultados deben tratarse como indicativos.
- Cobertura idiomatica limitada a ingles y chino; no hay datos sobre calidad en castellano ni en otros idiomas.
- La longitud de contexto es desconocida, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Licencia Apache-2.0, heredada del checkpoint base: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y sobre el cumplimiento de la normativa aplicable.
- El repositorio requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del autor del modelo; conviene auditar `modeling_k2_horizon.py` antes de desplegarlo en produccion.
- Sin descargas ni likes registrados en los metadatos, y publicado con fecha de octubre de 2026: no hay validacion por parte de la comunidad.
- El soporte en runtimes de inferencia de alto rendimiento (vLLM, TGI) no esta confirmado, lo que puede limitar el throughput en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/K2-Horizon-7B-heretic
- Variante MLX 8-bit: https://huggingface.co/Avicennasis/K2-Horizon-7B-heretic-mlx-8bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Discusion sobre la correccion de `@capture_outputs`: https://huggingface.co/IFM/K2-Horizon-0.9B/discussions/6
- Herramienta de ablacion Heretic: https://github.com/p-e-w/heretic

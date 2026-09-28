# SargeDev/Jev_Qwen3.8-27B-r2-LoRA

## Resumen

Jev_Qwen3.8-27B-r2-LoRA es un adaptador LoRA (r=64, alpha=128) desarrollado por SargeDev sobre el modelo base huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante "abliterated" de un transformer denso de 27.000 millones de parametros. No es un modelo completo: el repositorio de 1,3 GB contiene unicamente los pesos del adaptador en formato PEFT/safetensors, por lo que requiere el modelo base exacto para funcionar.

El objetivo declarado es convertir el modelo base en un "juez calibrado" (*calibrated judge*): producir veredictos breves acompanados de un nivel de confianza explicito y honesto, y comportarse de forma genuinamente indecisa ("aproximadamente cara o cruz, 40-60%") en preguntas que son autenticamente 50/50, en lugar de mostrar falsa certeza. Segun la model card, la ronda 2 reduce la sobreconfianza en preguntas empatadas de 15/20 casos a 0-1/20 sobre la misma bateria de evaluacion, manteniendo el estilo de decision cotidiano del modelo base.

La relevancia del artefacto esta en su metodologia de entrenamiento: el propio modelo selecciono sus datos de entrenamiento muestreando sus predicciones sobre 4.779 filas reservadas del corpus y conservando aquellas donde su calibracion fallaba. Es un caso de destilacion auto-dirigida sobre QLoRA, con un aviso tecnico importante: el adaptador no debe fusionarse con `merge_and_unload`, ya que el resultado produce salidas uniformes de 0,5/0,5; solo funciona en runtimes que aplican los deltas LoRA en sus propios kernels (vLLM verificado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (base Qwen3.8-27B); arquitectura interna del base no detallada en la informacion proporcionada |
| Parametros totales | 27B en el modelo base; el adaptador se distribuye en un repositorio de 1,3 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la configuracion de servicio verificada usa `--max-model-len 8192` |
| Tipos de cuantizacion | Entrenado con QLoRA sobre base NF4 con doble cuantizacion; el adaptador se publica en safetensors (precision del adaptador no especificada). No se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | PEFT / safetensors (adaptador LoRA, no modelo fusionado) |
| Tipo de artefacto | Adaptador LoRA, r=64, alpha=128 |
| Modelo base requerido | huihui-ai/Huihui-Qwen3.8-27B-abliterated (obligatorio, no intercambiable) |
| Dataset de entrenamiento | SargeDev/jev-distill-corpus-v3 |
| Tamano del repositorio | 1,3 GB |
| Biblioteca | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 entrenado en precision QLoRA sobre una base cuantizada en NF4 con doble cuantizacion, con perdida calculada solo sobre los tokens de completacion (*completion-only loss*) y optimizador `paged_adamw_8bit`. El entrenamiento se realizo sobre una NVIDIA DGX Spark (GB10) durante 25 horas. Del total de 900 pasos se selecciono el checkpoint 300, con perdida de evaluacion de 0,432 frente a 0,480 en el paso 900; el autor indica que la comparacion A/B frente al checkpoint final mostro un comportamiento identico, por lo que se eligio el menos sobreajustado.

La innovacion principal es el bucle de seleccion de datos: el modelo muestreo sus propias predicciones sobre 4.779 filas reservadas del corpus y se quedaron las filas donde su calibracion fallaba, dando un conjunto de 51.663 filas compuesto por conflictos confiados (1.614), banda de empate (1.044) e incertidumbre (169), descartando las discrepancias extremas. El objetivo es ensenar explicitamente al modelo a reconocer la incertidumbre genuina. Ademas, el modelo se entreno con el modo de pensamiento desactivado, por lo que la model card recomienda servir con `"chat_template_kwargs": {"enable_thinking": false}` para obtener el comportamiento ajustado.

## Capacidades

- Generacion de texto y razonamiento en ingles, heredados del modelo base Qwen3.8-27B abliterated.
- Juicio calibrado: emite veredictos breves con un grado de confianza declarado de forma explicita.
- Deteccion de preguntas genuinamente 50/50: responde con un rango de confianza bajo (40-60%) en lugar de certeza falsa, con una tasa de sobreconfianza en empates de 0-1/20 en la bateria de evaluacion del autor.
- Comportamiento de motor de decision (*decision engine*) en cuestiones cotidianas, preservado del modelo base.
- Modo sin censura: al derivar de una variante *abliterated*, no aplica las capas de rechazo del modelo original.
- Soporte de modo pensamiento en el modelo base (`--reasoning-parser qwen3` en vLLM), aunque el adaptador fue entrenado con el pensamiento desactivado.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada; se heredaria, en su caso, del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para el adaptador.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base podria conservar capacidades adicionales no declaradas.

## Casos de uso

- Sistemas de decision asistida con umbral de confianza: el adaptador esta disenado para emitir un veredicto y una confianza declarada, de modo que un pipeline posterior puede enrutar automaticamente los casos de baja confianza a revision humana en lugar de aceptar una respuesta insegura.
- Triaje de moderacion de contenido: dado que la base es *abliterated*, puede emplearse para clasificar y justificar decisiones sobre material sensible sin los rechazos por defecto del modelo original, con el nivel de confianza como senal de escalado.
- Evaluacion automatica de respuestas (LLM-as-a-judge): su comportamiento calibrado en preguntas ambiguas reduce el sesgo hacia veredictos categoricos cuando la evidencia es equilibrada, algo util en comparaciones A/B de modelos o de prompts.
- Analisis de riesgo y estimacion de incertidumbre: en tareas de prevision cualitativa (por ejemplo, evaluacion de viabilidad de un proyecto) el modelo puede declarar explicitamente cuando la evidencia disponible no permite inclinar la balanza.
- Investigacion sobre calibracion y alineacion: el artefacto y su corpus permiten reproducir el experimento de auto-seleccion de datos de entrenamiento a partir de fallos de calibracion medidos.
- Anonimizacion o reformulacion de texto sin restricciones tematicas: al no aplicar capas de rechazo, resulta util en dominios donde el modelo censurado se niega a procesar material legitimo (legal, medico, seguridad).
- Despliegue con multiples adaptadores sobre una misma base: al ser un adaptador PEFT servible con `--enable-lora` en vLLM, permite alternar comportamiento (por ejemplo, ronda 1 frente a ronda 2) sin duplicar el modelo base en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion aportado es la medicion interna de calibracion del autor:

| Metrica | Ronda 1 | Ronda 2 (este adaptador) |
|---|---|---|
| Sobreconfianza en preguntas 50/50 (bateria de 20 items) | 15/20 | 0-1/20 |
| Rango de confianza declarado en empates genuinos | >= 90% (certeza falsa) | 40-60% ("aproximadamente cara o cruz") |
| Perdida de evaluacion en el paso seleccionado (300 de 900) | No disponible | 0,432 |

El autor indica que la comparacion A/B entre el checkpoint 300 y el final (paso 900, perdida 0,480) mostro un comportamiento identico. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- El adaptador por si solo ocupa 1,3 GB, pero requiere cargar el modelo base de 27B en memoria; los requisitos vienen determinados por la base, no por el adaptador.
- VRAM estimada para el modelo base en bf16: aproximadamente 54 GB de pesos mas cache KV y activaciones; en fp8, aproximadamente 27 GB; en NF4, aproximadamente 14-16 GB (estimaciones derivadas del numero de parametros, no confirmadas en la informacion proporcionada).
- Servicio verificado: NVIDIA DGX Spark (GB10) con vLLM, usando `--max-model-len 8192` y `--gpu-memory-utilization 0.80`.
- GPU de centro de datos: A100 80 GB, H100 80 GB o H200 resultan adecuadas para servir la base en bf16 o fp8.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar la base en bf16; requeriria cuantizacion agresiva. No obstante, la model card solo verifica el funcionamiento mediante kernels LoRA propios de vLLM, por lo que las rutas cuantizadas con llama.cpp u Ollama no estan soportadas para este adaptador.
- Despliegue: vLLM es el unico runtime verificado (`--enable-lora --max-lora-rank 64 --lora-modules tuned=<ruta> --trust-remote-code --reasoning-parser qwen3 --enable-chunked-prefill --enable-prefix-caching`). Es necesario invocar el modelo con `model: "tuned"`.
- Prohibido fusionar el adaptador con `merge_and_unload` (acumulacion bf16 o fp32): segun el autor, produce un modelo que devuelve 0,5/0,5 uniforme para todo, verificado como roto.
- Latencia y throughput: no disponibles.
- Requisito de plantilla de chat: pasar `"chat_template_kwargs": {"enable_thinking": false}` para obtener el comportamiento ajustado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables. La comparacion se limita a las variantes de la misma familia y a los parametros publicados:

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| SargeDev/Jev_Qwen3.8-27B-r2-LoRA | Adaptador LoRA (r=64) | 27B base | No disponible (servicio verificado a 8192) | Apache-2.0 | Publicado, requiere vLLM |
| SargeDev/Jev_Qwen3.8-27B (ronda 1) | Modelo fusionado | 27B | No disponible | Apache-2.0 | Publicado |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | Modelo base completo | 27B | No disponible | No disponible en la informacion proporcionada | Publicado |

Frente a la ronda 1 fusionada, la ronda 2 ofrece una reduccion declarada de la sobreconfianza (15/20 a 0-1/20) pero pierde la simplicidad de despliegue, ya que no admite fusionarse y exige vLLM. No se han encontrado en la busqueda web alternativas comparables de la misma categoria de "juez calibrado" con datos verificables.

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: debe aplicarse exactamente sobre huihui-ai/Huihui-Qwen3.8-27B-abliterated. Usar otro base invalida el comportamiento.
- Fusion no soportada: `merge_and_unload` genera salidas uniformes de 0,5/0,5. Cualquier flujo de trabajo que requiera un modelo fusionado o un GGUF no es viable con este artefacto.
- Compatibilidad de runtime restringida: vLLM es el unico runtime verificado con kernels LoRA. Ollama, llama.cpp y TGI no estan confirmados.
- Modelo *abliterated*: se ha eliminado la capa de rechazo, por lo que puede generar contenido danino, ilegal o sensible sin filtros. Requiere moderacion externa en cualquier despliegue en produccion.
- Riesgo de alucinacion: aunque el objetivo del ajuste es reducir la falsa certeza, el modelo sigue siendo un LLM generativo; la confianza declarada es una salida aprendida, no una probabilidad calibrada verificada estadisticamente, y la evaluacion se limita a 20 items.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion proporcionada.
- Idioma: declarado unicamente para ingles; el rendimiento en castellano no esta verificado.
- Idiomas y contexto: la longitud de contexto real del modelo base no se especifica; la configuracion probada usa 8192 tokens.
- Contexto de evaluacion muy limitado: las metricas de calibracion proceden de una bateria interna no publicada en detalle, sin comparacion con benchmarks externos.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion por parte de terceros.
- Licencia Apache-2.0 en el adaptador, pero la licencia del modelo base puede imponer condiciones adicionales que no se detallan en la informacion proporcionada; conviene verificar la del base por separado antes de un uso comercial.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/SargeDev/Jev_Qwen3.8-27B-r2-LoRA
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Ronda 1 fusionada: https://huggingface.co/SargeDev/Jev_Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor o su dataset; los unicos resultados obtenidos no guardan relacion con el artefacto y se han descartado. No se han localizado papers, blogs tecnicos ni demos adicionales.

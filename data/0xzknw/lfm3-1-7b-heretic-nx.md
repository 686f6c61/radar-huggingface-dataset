# 0xzknw/LFM3-1.7B-Heretic-NX

## Resumen

LFM3-1.7B-Heretic-NX es una edición condicional de pesos (weight editing) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario 0xzknw. El objetivo declarado del autor es reducir los rechazos léxicos del modelo base mediante una técnica de abliteración denominada Heretic NX, aplicada sobre un checkpoint BF16 y posteriormente convertida a GGUF Q8_0. El modelo conserva la arquitectura y el tokenizador originales, por lo que mantiene el contexto, el chat template y las capacidades del LFM3 base.

La relevancia de esta ficha es doble: por un lado documenta un experimento de modificación de pesos con métricas publicadas (marcadores léxicos de rechazo y divergencia KL de primer token); por otro, sirve como ejemplo de los riesgos de usar checkpoints abliterados en producción, dado que el propio autor reconoce que la evaluación no certifica equivalencia de capacidades ni ausencia de salidas incorrectas. El modelo tiene 1.728.801.536 parámetros y un repositorio de 5,3 GB que incluye pesos BF16, un GGUF Q8_0, código Python personalizado y los factores rank-one ajustados.

No se dispone de información sobre la longitud de contexto nativa del modelo base en la documentación proporcionada; las evaluaciones del autor se realizaron con contexto de 4096 tokens en llama.cpp. El modelo está etiquetado únicamente para inglés y francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código Python personalizado LFM3; requiere `trust_remote_code`) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (evaluado a 4096 tokens en llama.cpp) |
| Tipos de cuantizacion | BF16 y GGUF Q8_0 distribuidos; otras cuantizaciones no disponibles |
| Idiomas soportados | en, fr |
| Licencia | lfm-open-license-v1.0 (etiquetada como `license: other`) |
| Formato de pesos | safetensors (BF16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es una edición condicional de pesos sobre LiquidAI/LFM3-1.7B, no un reentrenamiento. Según la model card, se aplicó la herramienta Heretic NX (PR #3 del repositorio 0xZKnw/heretic-nx) para modificar selectivamente los pesos del checkpoint original. El artefacto distribuido incluye los factores rank-one ajustados y los registros de construcción, lo que permite auditar parcialmente la intervención. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO en su construcción original.

La innovación técnica declarada es la reducción de marcadores léxicos de rechazo: de 95/104 en el original a 4/104 en la edición BF16, con una divergencia KL media de primer token (sobre todo el vocabulario de 128.000 entradas) de 0,045014 respecto al original. El autor advierte que estas cifras son un proxy léxico y no una medida semántica de éxito en tareas, y que el conjunto objetivo incluye peticiones dañinas, por lo que el experimento no se limita a falsos rechazos. La evaluación se realizó con thinking desactivado, generación greedy, máximo de 96 tokens nuevos y sin truncado de prompt.

## Capacidades

- Generación de texto conversacional en inglés y francés, con chat template original de LFM3.
- Modo thinking desactivable mediante `enable_thinking=False` en el chat template.
- Salida en formato JSON exacto validada en pruebas de humo para BF16 (según el autor).
- Ejecución en Transformers con `trust_remote_code=True` y en llama.cpp (versión b12088, commit d1044bc82).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Capacidad aritmética limitada: la prueba `37 × 19` falló en el original y en la edición BF16; en Q8_0 la edición dio 703 pero con formato incorrecto.

## Casos de uso

- Investigación sobre abliteración y edición de pesos: el repositorio incluye factores rank-one, registros de construcción e informes de evaluación compactos, lo que permite reproducir y auditar la intervención sobre el modelo base en entornos de investigación.
- Experimentos controlados de rechazo léxico: útil para estudiar cómo varía la tasa de marcadores de rechazo entre BF16 y Q8_0 (95→4 y 96→3 respectivamente) manteniendo el mismo tokenizador y chat template.
- Despliegue local en hardware de consumo: el GGUF Q8_0 de 1,85 GB puede ejecutarse con llama.cpp en equipos con GPU integrada o dedicada de gama media; el autor lo validó en un Apple M5 con 24 GiB y offload completo a GPU.
- Evaluación comparativa de cuantizaciones: el par BF16/Q8_0 permite medir el impacto de la cuantización en la divergencia KL de primer token (0,045014 vs 0,046333) y en la precisión MCQ (52,22% vs 51,29% en la porción expandida).
- Pruebas de robustez de pipelines de moderación: al reducir drásticamente los rechazos léxicos, sirve para verificar si los filtros de seguridad externos de una aplicación siguen funcionando cuando el modelo subyacente deja de rechazar.
- Prototipado de asistentes conversacionales bilingües en inglés y francés: con contexto de 4096 tokens en llama.cpp y generación greedy, adecuado para demos locales de bajo coste, no para producción sin validación adicional.

## Benchmarks y rendimiento

| Evaluación BF16 | Original | Heretic NX |
|---|---:|---:|
| Marcadores léxicos de rechazo en objetivos / 104 | 95 | 4 |
| Marcadores léxicos de rechazo en seguros / 104 | 3 | 2 |
| Respuestas vacías en cualquiera de los 104 casos | 0 | 0 |
| KL media de primer token respecto al original | 0 | 0,045014 |
| Porción MCQ emparejada / 241 | 128 (53,11%) | 128 (53,11%) |
| Porción MCQ expandida / 854 | 450 (52,69%) | 446 (52,22%) |

| Evaluación nativa Q8_0 | Original Q8_0 | Heretic NX Q8_0 |
|---|---:|---:|
| Marcadores léxicos de rechazo en objetivos / 104 | 96 | 3 |
| Marcadores léxicos de rechazo en seguros / 104 | 3 | 1 |
| Respuestas vacías en cualquiera de los 104 casos | 0 | 0 |
| KL media de primer token respecto al original Q8_0 | 0 | 0,046333 |
| Porción MCQ expandida / 854 | 438 (51,29%) | 438 (51,29%) |

El autor indica que la diferencia MCQ expandida en BF16 es de -0,47 puntos porcentuales, con intervalo bootstrap pareado al alpha 0,025 de [-3,12, +2,19] puntos, y que la puerta de no inferioridad predeclarada de tres puntos queda **inconclusa**. En Q8_0 la diferencia es de 0,00 puntos con intervalo nominal [-3,18, +3,18] puntos, también **inconclusa**. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 3,46 GB solo de pesos (tamaño del `model.safetensors`), más overhead de activaciones y caché KV; el autor lo ejecutó en Apple M5 con 24 GiB usando MPS.
- VRAM estimada para GGUF Q8_0: aproximadamente 1,85 GB de pesos (tamaño del archivo GGUF); con contexto 4096, un slot y caché KV F16 el consumo adicional es moderado.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo validó Apple M5 (MPS) y llama.cpp con offload completo a GPU en el mismo equipo.
- Ejecución en CPU y CUDA del checkpoint completo: no probada según el autor.
- Cabe en GPU de consumo: el GGUF Q8_0 es viable en GPUs con 4 GB o más de VRAM; el BF16 requiere al menos 4-5 GB de VRAM para pesos, sin contar overhead.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`, Python 3.12, PyTorch 2.15.0, Transformers 5.22.2) y llama.cpp b12088 (commit d1044bc82) mediante `llama-server`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos | Notas |
|---|---:|---|---|---|---|---|
| LFM3-1.7B-Heretic-NX | 1.728.801.536 | no disponible (evaluado a 4096) | en, fr | lfm-open-license-v1.0 | safetensors BF16, GGUF Q8_0 | Edición abliterada; 4/104 marcadores de rechazo en BF16 |
| LiquidAI/LFM3-1.7B | 1.728.801.536 (según modelo base) | no disponible | en, fr | lfm-open-license-v1.0 | safetensors, GGUF | Modelo original; 95/104 marcadores de rechazo en BF16 |
| Alternativas de ~1,7B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa con otros modelos de tamaño similar (por ejemplo, familias de 1-2B parámetros) no está disponible en la documentación proporcionada; solo se dispone de la comparación interna entre el original y la edición.

## Limitaciones y advertencias

- El propio autor advierte que los recuentos de marcadores léxicos son un proxy y no garantizan cero rechazos en prompts arbitrarios ni éxito semántico en tareas.
- La puerta de no inferioridad de tres puntos en MCQ queda inconclusa tanto en BF16 como en Q8_0; la equivalencia de capacidades no está establecida.
- El conjunto de 104 filas se reutilizó para elegir entre dos checkpoints frontera congelados y no es un holdout intacto; no hay juez semántico externo que certifique el checkpoint final.
- Riesgo de alucinación y salidas malformadas: la prueba aritmética `37 × 19` falló en el original y en la edición BF16; en Q8_0 la edición dio el valor correcto pero con formato incorrecto.
- La edición está diseñada para reducir rechazos, incluyendo peticiones dañinas; esto puede comprometer los mecanismos de seguridad del modelo base y requiere filtros externos en producción.
- Idiomas limitados a inglés y francés; no se declara soporte de castellano ni de otros idiomas.
- Licencia lfm-open-license-v1.0: es necesario revisar sus términos para uso comercial, ya que está etiquetada como `license: other` y no se detallan restricciones en la información disponible.
- Requiere `trust_remote_code=True` por el código Python personalizado de LFM3, lo que implica ejecutar código del repositorio.
- Solo se ha validado en Apple M5 con MPS y en llama.cpp b12088; ejecución en CPU y CUDA del checkpoint completo no ha sido probada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xzknw/LFM3-1.7B-Heretic-NX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio Heretic NX (PR #3): https://github.com/0xZKnw/heretic-nx/pull/3

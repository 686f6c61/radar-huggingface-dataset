# BnhHo/Qwen3.8-27B-Uncensored-GGUF

## Resumen

BnhHo/Qwen3.8-27B-Uncensored-GGUF es una derivada abliterada y cuantizada del modelo Qwen/Qwen3.8-27B, publicada en formato GGUF para su uso con llama.cpp. El autor (BnhHo) ha aplicado la herramienta Heretic para eliminar direcciones de rechazo del modelo base, minimizando a la vez la divergencia KL respecto al original, sin finetuning ni datos de entrenamiento adicionales. El resultado conserva la arquitectura, el entrenamiento y las capacidades del modelo de partida, pero reduce de forma sustancial (no total) el comportamiento de rechazo.

El modelo mantiene la cabeza de predicción multi-token (MTP) del checkpoint base, copiada literalmente, lo que habilita decodificación especulativa integrada con un borrador interno. Según la información disponible, la arquitectura es Qwen3_5ForConditionalGeneration, con 64 capas, un vocabulario de 248.320 tokens, una capa MTP, soporte de visión y una ventana de contexto de 262.144 tokens. El recuento real de parámetros en safetensors es de 27.320.697.856.

La relevancia de esta ficha es doble: por un lado, ofrece un modelo de 27.300 millones de parámetros con contexto de 262.144 tokens, visión y decodificación especulativa en un único fichero GGUF; por otro, permite evaluar el coste real de la abliteración en términos de perplejidad, ya que el autor publica mediciones de PPL por cuantización frente a una línea base F16. La adopción es todavía muy baja (74 descargas y 0 likes en el momento de la consulta), y la model card está truncada en los apartados de comportamiento medido, requisitos, limitaciones y licencia, por lo que varios datos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con cabeza MTP y torre de visión) |
| Parametros totales | 27.320.697.856 (segun safetensors) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (F16 usado como linea base, no publicado); borrador MTP en Q8_0 y Q4_0; proyector de vision mmproj en F16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 64 |
| Tamano de vocabulario | 248.320 |
| Capas MTP | 1 |
| Vision | si (proyector `mmproj-Qwen3.8-27B-Uncensored-F16.gguf`, 0,9 GB) |
| Modelo base | Qwen/Qwen3.8-27B |
| Matriz de importancia | wikitext-2 raw, 200 chunks (`Qwen3.8-27B-Uncensored-imatrix.dat`, 13,6 MB) |
| Conversion | llama.cpp `a94d563ed` |
| Tamano del repositorio | 231,3 GB |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, identificada en la model card como `Qwen3_5ForConditionalGeneration`, con 64 capas, vocabulario de 248.320 entradas y una única capa de predicción multi-token (MTP). El modelo es multimodal: incorpora visión mediante un proyector independiente en formato F16 con el prefijo `mmproj`, que los runtimes compatibles descubren de forma automática. No se documenta en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base.

La modificación respecto al original es una abliteración ejecutada con Heretic, que co-minimiza el recuento de rechazos frente a la divergencia KL respecto al modelo base. El proceso se ejecutó en bf16 (sin cuantización de 4 bits) y la LoRA resultante se fusionó en el base bf16, de modo que los pesos publicados no son un ida y vuelta de cuantización. La abliteración modifica `attn.o_proj` y `mlp.down_proj` de la pila principal, mientras que los tensores `mtp.*` se copian textualmente del checkpoint base y nunca se tocan. Como la cabeza borradora se entrenó contra el modelo sin modificar, el autor advierte que la tasa de aceptación de la decodificación especulativa puede caer ligeramente; dado que cada token se verifica contra el modelo objetivo, la calidad de salida no se ve afectada por ello.

En el plano de la cuantización, la matriz de importancia (imatrix) se calculó directamente desde los pesos f16, no desde una cuantización intermedia, de forma que la calibración ve los pesos reales. El repositorio ofrece dos familias de ficheros: una fusionada, donde la MTP viaja en línea como borrador integrado en un único fichero, y otra con objetivo y borrador separados (`-noMTP-` más `-draft-`), pensada para runtimes que requieren un flag explícito `--model-draft`.

## Capacidades

- Generación de texto conversacional en inglés y chino, con la etiqueta `conversational` en el repositorio.
- Decodificación especulativa nativa mediante la cabeza MTP integrada en los ficheros fusionados, o mediante ficheros de borrador separados.
- Entrada de imágenes a través del proyector de visión F16 (`mmproj`), siempre que el runtime sea compatible con visión.
- Comprensión de fotogramas de vídeo y capacidades visión-lenguaje, según fuentes de terceros que describen derivadas equivalentes del mismo base (no confirmado en la model card truncada).
- Razonamiento controlable y capacidad de código, atribuidos al modelo base en fuentes de terceros (no detallados en la información disponible).
- Comportamiento de rechazo reducido de forma sustancial, lo que amplía el rango de prompts que el modelo atiende sin negativa.
- Soporte de tool calling / function calling y de flujos de agente multi-paso: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: limitadas a inglés y chino según los metadatos del repositorio; no se declara soporte de castellano.
- Modo "thinking" o razonamiento explícito: no confirmado en la información disponible.

## Casos de uso

- Generación de texto largo con contexto masivo: la ventana de 262.144 tokens permite procesar libros completos, expedientes o bases de código extensas en una sola pasada, sin necesidad de resumen intermedio ni de recuperación por trozos.
- Análisis de documentación técnica en inglés o chino: el modelo puede resumir, extraer y reescribir manuales, RFCs o documentación de API manteniendo la coherencia a lo largo de documentos de cientos de miles de tokens.
- Procesamiento de imágenes con salida textual: gracias al proyector `mmproj-F16`, se puede usar para descripción de capturas, extracción de datos de diagramas o lectura de interfaces, siempre con un runtime que soporte visión en GGUF.
- Evaluación de seguridad y alineación: al ser una variante abliterada con métricas de rechazo reducidas y perplejidad medida, resulta útil como sujeto de estudio en experimentos de red-teaming y de comparación entre comportamiento alineado y desalineado.
- Investigación sobre cuantización: el repositorio publica perplejidades por cuantización medidas en una única sesión contra la misma línea base F16, lo que lo convierte en un banco de pruebas reproducible para estudiar el efecto de IQ2_M frente a Q4_K_M, Q5_K_M, Q6_K y Q8_0.
- Despliegue local en estación de trabajo: con las cuantizaciones Q4_K_M (16,8 GB) o Q5_K_M (19,5 GB) el modelo cabe en GPUs de 24 GB, lo que permite prototipado sin coste de API en máquinas de gama alta para consumidor.
- Prototipado de asistentes conversacionales sin censura para dominios sensibles legítimos, como ficción adulta, guiones con violencia o análisis de discurso extremista, donde los rechazos de los modelos alineados dificultan la tarea.
- Aceleración de inferencia con decodificación especulativa: usando el borrador Q8_0 (3,2 GB) o Q4_0 (1,7 GB) junto al modelo objetivo, se puede reducir el coste por token en despliegues con llama-server, a costa de 1,7 a 3,2 GB extra de memoria.
- Pipelines de generación aumentada por recuperación en corpus bilingües inglés-chino, aprovechando el vocabulario de 248.320 entradas y el contexto largo para inyectar muchos documentos recuperados.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K ni similares). El único dato de rendimiento publicado es la perplejidad sobre wikitext-2, medida por el propio autor en una única sesión contra la misma línea base F16:

| Fichero | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| `Qwen3.8-27B-Uncensored-f16.gguf` (linea base, no publicado) | 7,1557 +/- 0,25104 | referencia |
| `Qwen3.8-27B-Uncensored-Q5_K_M.gguf` | 7,1573 +/- 0,25055 | +0,0016 |
| `Qwen3.8-27B-Uncensored-IQ4_XS.gguf` | 7,1583 +/- 0,25019 | +0,0026 |
| `Qwen3.8-27B-Uncensored-Q6_K.gguf` | 7,1689 +/- 0,25149 | +0,0132 |
| `Qwen3.8-27B-Uncensored-Q8_0.gguf` | 7,1764 +/- 0,25195 | +0,0207 |
| `Qwen3.8-27B-Uncensored-Q4_K_M.gguf` | 7,1814 +/- 0,25227 | +0,0257 |
| `Qwen3.8-27B-Uncensored-IQ2_M.gguf` | 7,8581 +/- 0,27481 | +0,7024 |

El propio autor advierte de que hay que leer los intervalos de error antes que el orden: todas las filas salvo IQ2_M caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que no son separables entre sí ni de la línea base F16 y su ordenación es ruido. La única conclusión sólida es el deterioro claro de IQ2_M (aproximadamente +0,70 de perplejidad).

Las tablas de decodificación especulativa medidas sobre el modelo, el apartado de comportamiento medido y el de requisitos aparecen en el índice de la model card pero su contenido no está incluido en la información disponible.

## Requisitos de hardware

- VRAM estimada según tamaño de fichero (orientativa, solo pesos, sin caché KV): IQ2_M 10,6 GB; IQ4_XS 15,3 GB; Q4_K_M 16,8 GB; Q5_K_M 19,5 GB; Q6_K 22,4 GB; Q8_0 29,0 GB.
- Ficheros auxiliares: borrador MTP Q8_0 3,2 GB, borrador MTP Q4_0 1,7 GB, proyector de visión F16 0,9 GB.
- Cabe en GPU de consumidor: sí, en el rango IQ2_M a Q5_K_M dentro de tarjetas de 16-24 GB (por ejemplo RTX 4080, RTX 4090, RTX 3090) siempre que se limite la longitud de contexto y el tamaño de la caché KV. Q6_K y Q8_0 requieren 24 GB o más, o reparto parcial en CPU.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S permiten alojar Q8_0 con contexto amplio y decodificación especulativa simultánea sin reparto.
- Caché KV: no se publica en la información disponible el consumo exacto por token; con ventana de 262.144 tokens, el requisito de memoria crece de forma significativa con la longitud efectiva de contexto y debe dimensionarse aparte del peso de los ficheros.
- Opciones de despliegue: llama.cpp, llama-server (con `--model-draft` para el borrador MTP) y ComfyUI están documentados por el autor. Otros runtimes compatibles con GGUF (Ollama, TGI, vLLM) no se confirman en la información disponible; el repositorio lleva la etiqueta `endpoints_compatible`.
- Optimización de memoria: usar cuantizaciones K-quant o IQ en lugar de Q8_0, elegir el borrador Q4_0 si la VRAM es ajustada (ahorra 1,5 GB, aunque la tasa de aceptación no está medida según el autor) y limitar la ventana de contexto efectiva.
- Latencia y throughput: no disponibles. La model card incluye una sección de decodificación especulativa medida, pero su contenido no se ha facilitado; los apartados de requisitos y comportamiento medido están igualmente truncados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BnhHo/Qwen3.8-27B-Uncensored-GGUF | 27.320.697.856 | 262.144 | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (MTP conservado) | apache-2.0 | 74 descargas, 0 likes |
| Qwen/Qwen3.8-27B (modelo base) | 27.320.697.856 | 262.144 (segun la ficha de la derivada) | pesos originales, no GGUF | no disponible en la informacion facilitada | modelo de referencia |
| unsloth/Qwen3.8-27B-GGUF | mismos parametros del base | no disponible | cuantizaciones GGUF sin abliterar | no disponible | repositorio de cuantizacion oficial de referencia |
| dealignai (Qwen3.8-27B-UNCENSORED-GGUF) | no disponible | no disponible | GGUF, con vision y MTP | no disponible | variante abliterada alternativa, segun aimodels.fyi |

Las diferencias clave entre BnhHo y la cuantización de unsloth son el proceso de abliteración con Heretic y la conservación verificada de la cabeza MTP en los ficheros fusionados. Frente a la variante de dealignai, la información disponible no permite comparar parámetros, licencia ni métricas de perplejidad, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El comportamiento de rechazo está reducido de forma sustancial, pero no eliminado. El autor lo indica explícitamente; no debe asumirse una ausencia total de negativas.
- Modelo sin censura: puede generar contenido ofensivo, violento, sexual o dañino ante prompts que el modelo base rechazaría. Requiere filtrado propio en cualquier despliegue orientado al público.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad factual ni de tasas de alucinación en la información disponible; el comportamiento esperable es el de un modelo de 27.300 millones de parámetros sin verificación factual integrada.
- Idiomas limitados a inglés y chino. No se declara soporte de castellano ni de otras lenguas, por lo que el rendimiento en español es incierto y no medido.
- Contexto largo en la teoría (262.144 tokens) pero sin métricas publicadas de recuperación efectiva a longitudes extremas; el coste de memoria de la caché KV puede hacer inviable el contexto completo en hardware de consumidor.
- La decodificación especulativa con la cabeza MTP puede ver reducida su tasa de aceptación tras la abliteración, según advierte el propio autor, al haberse entrenado el borrador contra el modelo sin modificar.
- La model card está truncada en los apartados de comportamiento medido, requisitos, limitaciones y licencia, por lo que no puede verificarse el detalle de las restricciones que el autor hubiera querido declarar.
- La licencia declarada en el repositorio es apache-2.0, pero una fuente de terceros (blog de orcarouter) describe su build FP8 como "Apache 2.0 y solo para investigación", lo que resulta contradictorio. Se recomienda verificar los términos aplicables antes de un uso comercial.
- Adopción muy baja (74 descargas, 0 likes) y ausencia de validación independiente: no hay garantía de reproducibilidad de las mediciones de perplejidad por parte de terceros.
- El proceso de abliteración está documentado como ejecutado en bf16 con fusión de LoRA, pero no se publica una evaluación de seguridad posterior ni una comparación exhaustiva de capacidades frente al modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BnhHo/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Cuantizaciones GGUF de referencia del base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Analisis de terceros sobre la variante sin censura: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Ficha de terceros con variante abliterada alternativa: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-uncensored-gguf-dealignai
- Catalogo de terceros con el modelo: https://local-ai-zone.github.io/models/qwen3-8-27b-uncensored.html

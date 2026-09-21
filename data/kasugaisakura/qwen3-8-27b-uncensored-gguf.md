# KasugaiSakura/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario KasugaiSakura. Se distribuye como una familia de ficheros para llama.cpp en la que se ha eliminado parcialmente el comportamiento de rechazo (refusal) del modelo base mediante abliteración con la herramienta Heretic, manteniendo intactas la arquitectura, los datos de entrenamiento y las capacidades originales. El resultado son pesos derivados de un merge en bf16, no de un ciclo de cuantización intermedio.

El modelo base emplea la arquitectura Qwen3_5ForConditionalGeneration, con 27.320.697.856 parámetros, 64 capas, un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Incluye una capa de multi token prediction (MTP) que actúa como cabecera de borrador para decodificación especulativa, además de soporte de visión mediante un proyector multimodal publicado aparte.

Su relevancia práctica es doble: por un lado ofrece una vía de despliegue local en GPU de consumo gracias a cuantizaciones desde IQ2_M (10,6 GB) hasta Q8_0 (29,0 GB); por otro, es uno de los pocos paquetes GGUF que conserva y verifica la cabecera MTP, lo que permite acelerar la inferencia con decodificación especulativa sin sacrificar calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con capa MTP y torre de visión) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (la model card no indica una arquitectura MoE) |
| Longitud de contexto | 262.144 tokens |
| Capas | 64 |
| Capas MTP | 1 |
| Vocabulario | 248.320 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0; cabecera draft en Q4_0 y Q8_0; proyector de visión en F16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el recuento de parámetros procede del modelo base en safetensors |
| Tamano del repositorio | 231,3 GB |
| Herramienta de conversion | llama.cpp, commit a94d563ed |
| Matriz de importancia | wikitext-2 raw, 200 fragmentos, publicada como imatrix.dat (13,6 MB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base: un transformer de 64 capas con vocabulario de 248.320 tokens, una capa adicional de multi token prediction y una torre de visión que se activa mediante el proyector mmproj en F16. La modificación sobre el modelo original consiste en una abliteración ejecutada con Heretic, que elimina direcciones de rechazo minimizando de forma conjunta el número de rechazos y la divergencia KL respecto al modelo base. El proceso se ejecuta en bf16, sin cuantización a 4 bits, y el LoRA resultante se fusiona en el checkpoint bf16, de modo que los pesos publicados no son el resultado de un viaje de ida y vuelta por una cuantización.

La abliteración modifica únicamente los tensores attn.o_proj y mlp.down_proj del stack principal. Los tensores mtp.* se copian literalmente del checkpoint base tras el merge y no se ven afectados. Como contrapartida, la cabecera de borrador se entrenó contra el modelo sin modificar, por lo que la tasa de aceptación en decodificación especulativa puede caer ligeramente; dado que cada token se verifica contra el modelo objetivo, la calidad de la salida no se degrada. No se aplicó finetuning ni se añadieron datos de entrenamiento nuevos.

La cuantización se realizó con una matriz de importancia calculada directamente sobre los pesos en f16, no sobre una cuantización intermedia, de modo que la calibración ve los pesos reales. El autor documenta además el procedimiento para construir otras cuantizaciones de bajo bit por cuenta propia.

## Capacidades

- Generación de texto conversacional en inglés y chino, con ventana de contexto de 262.144 tokens.
- Entrada de imágenes mediante el proyector mmproj-Qwen3.8-27B-Uncensored-F16.gguf (0,9 GB) en runtimes con soporte de visión compatible.
- Decodificación especulativa integrada: la cabecera MTP viaja embebida en los ficheros fusionados o se suministra como fichero draft independiente para el flag --model-draft de llama-server.
- Menor tasa de rechazo ante peticiones que el modelo base rechazaría, con la salvedad de que el comportamiento de rechazo se reduce, no se elimina.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades adicionales del base (modo de razonamiento, audio): no documentadas en la información disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: con la cuantización Q4_K_M (16,8 GB) el modelo cabe en una RTX 4090 o RTX 3090 de 24 GB dejando margen para caché KV, lo que permite trabajar sin conexión y sin coste por token.
- Generación de texto en chino e inglés en un mismo pipeline: el soporte declarado de ambos idiomas y el vocabulario de 248.320 tokens permiten cubrir documentación técnica bilingüe sin cambiar de modelo.
- Procesamiento de documentos largos: la ventana de 262.144 tokens admite contratos, expedientes o bases de código extensas en una sola pasada, evitando estrategias de troceado y recuperación.
- Analítica de imágenes combinada con texto: el proyector mmproj F16 habilita flujos de descripción, extracción de datos o preguntas sobre capturas en runtimes de visión compatibles con llama.cpp.
- Investigación sobre alineación y seguridad: al publicarse el método de abliteración y sus efectos medidos, el modelo sirve como sujeto de estudio para comparar tasas de rechazo frente al base sin reentrenar.
- Servicio de inferencia autoalojado con llama-server: el uso de la cabecera draft con --model-draft permite aumentar el throughput en despliegues con varios usuarios concurrentes, a costa de 1,7 GB o 3,2 GB adicionales de memoria según se elija Q4_0 o Q8_0.
- Prototipado de asistentes conversacionales de dominio restringido: el tag conversational y la compatibilidad con endpoints facilitan integrar el modelo detrás de una API interna sin depender de proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo aportado es la perplejidad sobre wikitext-2, medida en una única sesión contra la misma línea base en f16:

| Fichero | Perplejidad (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| Qwen3.8-27B-Uncensored-f16.gguf (línea base, no distribuida) | 7,1557 +/- 0,25104 | - |
| Qwen3.8-27B-Uncensored-Q5_K_M.gguf | 7,1573 +/- 0,25055 | +0,0016 |
| Qwen3.8-27B-Uncensored-IQ4_XS.gguf | 7,1583 +/- 0,25019 | +0,0026 |
| Qwen3.8-27B-Uncensored-Q6_K.gguf | 7,1689 +/- 0,25149 | +0,0132 |
| Qwen3.8-27B-Uncensored-Q8_0.gguf | 7,1764 +/- 0,25195 | +0,0207 |
| Qwen3.8-27B-Uncensored-Q4_K_M.gguf | 7,1814 +/- 0,25227 | +0,0257 |
| Qwen3.8-27B-Uncensored-IQ2_M.gguf | 7,8581 +/- 0,27481 | +0,7024 |

El propio autor advierte que, salvo IQ2_M, todas las filas caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que no son separables entre sí ni de la línea base y su ordenación no es significativa. Las cifras de decodificación especulativa que la model card menciona (sección de decodificación especulativa, subapartado IQ2_M) no están disponibles en el extracto proporcionado.

## Requisitos de hardware

Los tamaños de fichero son datos publicados por el autor; las recomendaciones de VRAM y GPU son estimaciones derivadas de esos tamaños.

- IQ2_M: 10,6 GB (o 10,2 GB sin MTP). Cabe en GPU de 12-16 GB, como RTX 3060 12 GB o RTX 4070 Ti Super 16 GB, con contexto reducido.
- IQ4_XS: 15,3 GB. Ajusta en 16 GB con contexto moderado y en 24 GB con contexto amplio.
- Q4_K_M: 16,8 GB. Opción equilibrada para RTX 4090, RTX 3090 o L4 de 24 GB.
- Q5_K_M: 19,5 GB. Requiere 24 GB o reparto entre GPU y CPU.
- Q6_K: 22,4 GB. Al límite de 24 GB; el contexto amplio obliga a offload parcial.
- Q8_0: 29,0 GB. Necesita 32-48 GB, por ejemplo A6000, L40S o A100 40 GB.
- Cabecera draft: 1,7 GB en Q4_0 o 3,2 GB en Q8_0 adicionales si se usa decodificación especulativa con fichero separado.
- Proyector de visión: 0,9 GB adicionales en F16.
- Despliegue: llama.cpp y llama-server son los runtimes de referencia; el autor documenta también integración con ComfyUI. Otros motores (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que la tasa de aceptación de la cabecera draft puede reducirse ligeramente al haberse entrenado contra el modelo sin abliterar, sin publicar cifras en el extracto consultado.

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base del que deriva. No se han proporcionado datos de otras alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Vision | MTP | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF | 27,32 mil millones | 262.144 | Si (mmproj aparte) | Si, verificado | apache-2.0 | GGUF | Comportamiento de rechazo reducido mediante abliteración; 6 cuantizaciones |
| Qwen/Qwen3.8-27B (base) | 27,32 mil millones | 262.144 | Si | Si | apache-2.0 | safetensors (base) | Sin modificar; rechaza peticiones que la versión abliterada atiende |
| Otras alternativas de 27B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | No se han facilitado datos de modelos comparables |

## Limitaciones y advertencias

- El comportamiento de rechazo se reduce de forma sustancial, pero no se elimina: el autor lo indica explícitamente en la model card. Persisten respuestas de rechazo en algunos casos.
- Al tratarse de un modelo abliterado, puede generar contenido dañino, ilegal o sesgado que el base evitaría. Requiere moderación externa si se expone a usuarios finales.
- Riesgo de alucinación: inherente al modelo base y sin medir en esta versión; no hay benchmarks de fidelidad factual en la información disponible.
- Idiomas limitados a inglés y chino. El castellano no está declarado como idioma soportado.
- La abliteración toca attn.o_proj y mlp.down_proj, por lo que puede degradar sutilmente capacidades no medidas; no se aportan evaluaciones comparativas frente al base más allá de la perplejidad.
- La tasa de aceptación de la decodificación especulativa puede ser inferior a la del modelo original porque la cabecera draft se entrenó contra el checkpoint sin modificar.
- IQ2_M presenta un aumento de perplejidad de +0,7024 frente a f16, muy superior al resto de cuantizaciones: no es recomendable cuando la calidad importa.
- Las diferencias de perplejidad entre IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0 están dentro del error estadístico, por lo que no debe inferirse superioridad de una sobre otra.
- La licencia apache-2.0 corresponde al modelo base declarado; conviene verificar las condiciones aplicables a los pesos derivados y a los datos de calibración antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 20 de septiembre de 2026. Es una publicación de un autor individual, sin revisión por pares ni mantenimiento garantizado.
- El tamaño total del repositorio (231,3 GB) exige planificar el almacenamiento si se descarga la familia completa de cuantizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KasugaiSakura/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de abliteración Heretic: https://github.com/p-e-w/heretic
- llama.cpp, commit de conversión a94d563ed: https://github.com/ggml-org/llama.cpp/commit/a94d563ed
- Resultados de la búsqueda web: no contienen información relevante sobre el modelo. Las cinco entradas devueltas corresponden a listados de telefonía móvil del comercio Media Expert (mediaexpert.pl) y no guardan relación con Qwen3.8-27B ni con GGUF.

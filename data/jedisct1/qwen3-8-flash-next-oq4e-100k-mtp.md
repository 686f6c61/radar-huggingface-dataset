# jedisct1/Qwen3.8-Flash-Next-oQ4e-100K-MTP

## Resumen

Qwen3.8-Flash-Next-oQ4e-100K-MTP es una cuantización nativa para oMLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, desarrollada por jedisct1. El modelo base, creado por el equipo Qwen, es un MoE de 125 mil millones de parámetros con 6 mil millones activos por token, basado en la arquitectura Qwen4 (atención híbrida GDN + QSA) y con una ventana de contexto nativa de 262 144 tokens. Esta versión cuantizada reduce el peso a aproximadamente 31 400 millones de parámetros (en formato safetensors) y está optimizada para ejecutarse en Macs con Apple Silicon mediante oMLX, ofreciendo un límite de contexto seguro de 100 000 tokens.

La relevancia de esta ficha radica en que permite ejecutar un modelo de última generación con capacidades de visión, tool calling y razonamiento avanzado en hardware de consumo (un Mac con 128 GiB de memoria unificada), sin necesidad de GPUs dedicadas. La cuantización oQ4e con calibración estricta preserva la torre de visión Qwen4, la cabeza MTP (Multi-Token Prediction) y la configuración nativa de contexto, aunque se recomienda desactivar MTP para agentes de codificación por razones de fiabilidad. El artefacto está diseñado para integrarse con la API compatible con OpenAI de oMLX, lo que facilita su uso en entornos de agentes y herramientas de desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida GDN + QSA (Qwen4), con torre de visión y cabeza MTP |
| Parametros totales | 31 377 486 179 (en safetensors, cuantizados) |
| Parametros activos | 6 mil millones por token (modelo base, no especificado en la cuantización) |
| Longitud de contexto | 100 000 tokens (configuración recomendada; nativo 262 144) |
| Tipos de cuantizacion | oQ4e (4 bits, grupo 64), tabla PLE con 4 bits grupo 32, capas Q8 y BF16 selectivas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (22 shards), también MLX |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal de 125 mil millones de parámetros con 6 mil millones activos por token, complementado con 51 mil millones de parámetros de embeddings N-gram. Su arquitectura Qwen4 introduce una atención híbrida GDN (Gated Delta Network) y QSA (Quadratic Self-Attention), junto con mejoras en los mecanismos residuales, de incrustación y de optimización del entrenamiento. El modelo fue entrenado con técnicas avanzadas de razonamiento y soporta visión, tool calling y generación de texto.

La cuantización oQ4e aplica una calibración estricta sobre 937 módulos con 1 024 secuencias de 512 tokens. Siete expertos enrutados en las capas base 0 y 1 no fueron seleccionados por el corpus de calibración fijo, por lo que sus proyecciones se mantienen en Q8 para evitar valores de importancia inventados; en las filas BF16 oficiales afectadas, Q8 redujo el error de reconstrucción normalizado 164,46 veces comparado con Q4. La cabeza del modelo de lenguaje base, las proyecciones del mezclador de hiperconexión y las proyecciones de fusión del MTP permanecen en BF16 para favorecer la calidad de salida y la aceptación de borradores MTP. El resultado ocupa 108 816 636 376 bytes en 22 shards safetensors.

## Capacidades

- Generación de texto, razonamiento avanzado, código y matemáticas, con soporte de modo de razonamiento configurable (`reasoning_effort`).
- Procesamiento de imágenes (image-text-to-text): identificó correctamente Half Dome a partir de un JPEG real en las pruebas de validación.
- Tool calling / function calling: evaluado con Swival a través de la API compatible con OpenAI de oMLX; con MTP deshabilitado, los 50 casos positivos pasaron en el primer intento y los 10 guardias adversariales fueron protegidos.
- Soporte de agentes y razonamiento multi-paso, con recomendación de `reasoning_effort = "medium"` para agentes de codificación.
- Contexto largo de hasta 100 000 tokens en esta configuración, con caché de prefijo SSD paginada para acelerar solicitudes repetidas.
- MTP (Multi-Token Prediction) incluido, pero recomendado deshabilitado para agentes de codificación por riesgo de errores en argumentos de herramientas.
- Capacidades multilingües: no especificadas en la documentación disponible.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede integrarse en entornos de desarrollo como IDE o CLI mediante la API compatible con OpenAI de oMLX, gestionando tareas de generación, refactorización y depuración de código. Su tool calling fiable (con MTP desactivado) permite interactuar con herramientas externas, y el contexto de 100 000 tokens es suficiente para mantener el estado de proyectos medianos.
- Recuperación de información en documentos extensos: con 100 000 tokens de contexto, puede procesar manuales técnicos, informes legales o investigaciones completas y extraer datos específicos. La caché SSD paginada reduce el tiempo de prefill en consultas repetidas sobre el mismo corpus.
- Asistente multimodal para análisis de imágenes: gracias a su torre de visión, puede describir imágenes, responder preguntas sobre su contenido y combinarlo con razonamiento textual, útil en aplicaciones de accesibilidad, diagnóstico visual o documentación técnica.
- Automatización de flujos de trabajo con llamadas a herramientas: el modelo puede orquestar APIs externas (bases de datos, servicios web, sistemas de archivos) mediante function calling, permitiendo construir asistentes que ejecuten acciones reales en sistemas de producción.
- Sistema de chat con memoria extendida: su ventana de 100 000 tokens permite mantener conversaciones de larga duración con historial completo, adecuado para atención al cliente o asistentes personales que requieren recordar interacciones previas.
- Generación de informes y resúmenes a partir de grandes volúmenes de texto: puede resumir libros, artículos o logs de sistema completos, manteniendo coherencia y precisión gracias a su capacidad de razonamiento y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización en la información disponible. Sin embargo, la model card documenta pruebas de validación específicas:

- Tool calling con Swival: con MTP deshabilitado, 50/50 casos positivos superados en el primer intento y 10/10 guardias adversariales protegidos. Con MTP habilitado, 50/50 positivos pero solo 9/10 guardias, debido a una ejecución especulativa que alteró un argumento de herramienta.
- Recuperación de contexto largo: una solicitud de 99 744 tokens con caché SSD poblada se completó en 11,53 segundos (reutilizando 98 304 tokens) tras un primer poblamiento de 418,18 segundos. La memoria física alcanzó 87,84 GiB en la segunda ejecución.
- MTP: aceptó 10 631 de 12 152 tokens redactados en la prueba, pero se recomienda desactivarlo para agentes.

## Requisitos de hardware

- Hardware objetivo: Mac con Apple Silicon y 128 GiB de memoria unificada (probado en esta configuración).
- Memoria: se requiere al menos 128 GiB para operar con 100 000 tokens de contexto de forma segura. El pico de memoria física en la prueba de 99 999 tokens fue de 90,89 GiB, dejando margen para el sistema y oMLX.
- GPU: no aplica, ya que oMLX utiliza la GPU integrada de Apple Silicon y la memoria unificada.
- Almacenamiento: se recomienda un SSD rápido para la caché de prefijo paginada (límite sugerido de 100 GB) y para el offload de la tabla PLE.
- Opciones de despliegue: oMLX (servidor con API compatible con OpenAI), integrable con clientes como agentes de codificación.
- Latencia: en la prueba de caché, una solicitud de 98 304 tokens reutilizados completó en 11,53 segundos; una solicitud repetida de 100 000 tokens con 63 488 tokens reutilizados completó en 4,13 segundos. El poblamiento inicial de caché para 99 744 tokens tomó 418,18 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jedisct1/Qwen3.8-Flash-Next-oQ4e-100K-MTP | 31,4B (cuantizado) | 100K (recomendado) | qwen-community-1.0 | safetensors/MLX | Cuantización oQ4e para oMLX, con MTP y visión |
| jedisct1/Qwen3.8-Flash-Next-oQ4e-128k | no disponible | 128K (recomendado) | qwen-community-1.0 | safetensors/MLX | Variante con contexto ampliado a 128K |
| jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-128k | no disponible | 128K (recomendado) | qwen-community-1.0 | safetensors/MLX | Variante con MTP y contexto 128K |
| Qwen/Qwen3.8-Flash-Next (base) | 125B (6B activos) | 262K nativo | qwen-community-1.0 | safetensors | Modelo original sin cuantizar, requiere hardware de alto rendimiento |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El límite de contexto seguro es de 100 000 tokens en esta configuración, aunque el modelo base soporta 262 144. Superar 100 000 tokens puede provocar fallos de memoria o rechazo por el guardián de prefill.
- MTP debe desactivarse para agentes de codificación, ya que en las pruebas causó un error en un argumento de herramienta y una llamada extra. Su uso solo se recomienda para tareas de generación de texto sin dependencias externas.
- La cuantización oQ4e puede introducir pérdidas de precisión en comparación con el modelo BF16 original, especialmente en tareas que requieren alta exactitud numérica.
- La licencia qwen-community-1.0 impone restricciones de uso comercial; es necesario revisar sus términos antes de desplegar el modelo en producción.
- No se han documentado sesgos específicos ni tasas de alucinación para esta cuantización; se recomienda validar el comportamiento en el dominio de aplicación.
- El hardware requerido (128 GiB de memoria unificada) limita su uso a equipos Apple de gama alta; no es viable en GPUs convencionales sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-100K-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de unsloth sobre ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Variante con contexto 128K: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-128k
- Variante con MTP y contexto 128K: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-128k

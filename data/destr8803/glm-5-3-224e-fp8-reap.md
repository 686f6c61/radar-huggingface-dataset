# destr8803/GLM-5.3-224E-FP8-REAP

## Resumen

GLM-5.3-224E-FP8-REAP es un derivado independiente del modelo GLM-5.3 de Z.ai, producido por el usuario destr8803. Se trata de una poda estructural de expertos (expert pruning) que reduce cada capa MoE dispersa de 256 expertos enrutados a 224, manteniendo los 8 expertos activos por token. El objetivo es reducir el tamaño del checkpoint y el coste de inferencia sin un reentrenamiento adicional, conservando la mayor parte de la capacidad del modelo original.

El modelo utiliza la arquitectura `GlmMoeDsaForCausalLM` (MoE con atención dispersa y lineal, según la documentación del modelo base) y conserva el formato de pesos FP8 block-scaled del original. Con 661.510 millones de parámetros totales, el payload se reduce un 12,2% respecto al checkpoint fuente (de 755,6 GB a 663,8 GB). La ventana de contexto validada en runtime es de 131.072 tokens, aunque el modelo base anuncia soporte de hasta 1M de tokens.

La relevancia de este derivado radica en que permite desplegar un modelo de la familia GLM-5.3 con menores requisitos de almacenamiento y memoria, manteniendo la calidad general en tareas de razonamiento, código y agentes, según las pruebas funcionales realizadas por el autor. No es una versión oficial de Z.ai y su licencia es la GLM-5.3 License heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE con atención dispersa y lineal) |
| Parametros totales | 661.510.069.888 (661,5B) |
| Parametros activos | no disponible (8 expertos activos por token, sin dato de parámetros activos totales) |
| Longitud de contexto | 131.072 tokens (validado en runtime; el modelo base anuncia 1M) |
| Tipos de cuantizacion | FP8 block-scaled (bloque 128x128) |
| Idiomas soportados | en, zh |
| Licencia | GLM-5.3 License (other, heredada del modelo base) |
| Formato de pesos | Safetensors (141 shards) |

## Arquitectura y entrenamiento

El modelo es una poda estructural del checkpoint `zai-org/GLM-5.3` (revisión `935644c05e76fc198714f4cca449fd8b970ff6d7`). La arquitectura base es un transformer MoE con 78 capas backbone más una capa MTP (Multi-Token Prediction), donde cada capa dispersa enruta 8 expertos activos de un total de 256. El derivado reduce ese total a 224 expertos por capa, eliminando los 32 de menor puntuación en cada una de las 75 capas dispersas. La capa 77 (MTP) reutiliza los keep IDs de la capa 77 del backbone.

La selección de expertos se realizó con el método REAP, utilizando 12.228 muestras y 15.425.969 tokens de datos generales, código, razonamiento y agentes. La puntuación de cada experto se calculó como la media condicional de `actual_router_weight * L2(unweighted_expert_output)`, usando los pesos reales del router y las normas de salida de los expertos sin ponderar. No se reutilizaron puntuaciones ni estados ocultos de otros modelos. El derivado se construyó directamente desde el checkpoint fuente inmutable de 256 expertos, no desde otro checkpoint podado.

No se realizó ningún entrenamiento adicional; el proceso es exclusivamente de poda. El modelo conserva el formato FP8 block-scaled del original y no se ha modificado el comportamiento de razonamiento del modelo base, que siempre activa el modo reasoning con niveles `low`, `high` y `max` (por defecto `max`).

## Capacidades

- Generación de texto y razonamiento multi-step: el modelo siempre utiliza razonamiento (reasoning effort configurable entre `low`, `high` y `max`), lo que le permite abordar tareas complejas de lógica y matemáticas.
- Generación de código: soporta tareas de programación en múltiples lenguajes, con especial énfasis en coding y agentic engineering según el modelo base.
- Tool calling / function calling: validado en runtime con pruebas de structured tool calling.
- Agentes y razonamiento de largo horizonte: el modelo base está diseñado para tareas de larga duración (long-horizon tasks) y el derivado conserva esta capacidad, aunque con contexto validado de 131K tokens.
- Recuperación de información en contexto largo: validado con un prompt de 130.036 tokens en una prueba de semantic retrieval.
- Multilingüe: soporta inglés y chino (en, zh).
- Solo texto: pipeline `text-generation`, sin capacidades multimodales.

## Casos de uso

- Atención al cliente automatizada multilingüe: con 131K tokens de contexto validado, el modelo puede gestionar conversaciones multi-turno extensas en inglés y chino, manteniendo el historial completo y aplicando razonamiento para resolver incidencias complejas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aprovechando el modo reasoning para producir soluciones más robustas.
- Agentes autónomos con planificación multi-paso: el modelo puede actuar como motor de un agente que ejecuta tareas de larga duración (por ejemplo, automatización de flujos de trabajo), gracias a su capacidad de razonamiento y a la validación de structured tool calling.
- Análisis de documentos legales o técnicos extensos: la ventana de 131K tokens permite procesar contratos, informes o documentación técnica de gran tamaño en una sola pasada, con recuperación semántica verificada.
- Asistente de investigación científica: puede razonar sobre problemas matemáticos o de ciencias, como indica el smoke test de GPQA Diamond (9/10 en una muestra de 10 preguntas), útil para apoyar a investigadores en la revisión de literatura o en la resolución de problemas.
- Despliegue de bajo coste relativo en entornos con GPUs de alta memoria: al reducir el payload un 12,2% frente al modelo base, es adecuado para organizaciones que necesitan un modelo de 661B parámetros pero con requisitos de almacenamiento y memoria ligeramente menores, manteniendo la calidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. El autor incluye únicamente un smoke test preliminar:

| Prueba | Resultado |
|---|---|
| GPQA Diamond (muestra de 10 preguntas, zero-shot CoT) | 9/10 (90,0%) |

Este resultado es una prueba de humo determinista, no un benchmark estadísticamente significativo. No se ha reproducido la suite completa de benchmarks oficiales de GLM-5.3 ni de terceros sobre este derivado. Se recomienda no interpretar este dato como representativo del rendimiento global del modelo.

## Requisitos de hardware

- VRAM estimada: el payload de pesos es de 618,17 GiB en FP8. Para inferencia con contexto de 131K tokens y KV cache BF16, se necesitan al menos 8 aceleradores con memoria suficiente. Con tensor parallel 8, cada dispositivo debe alojar aproximadamente 77 GiB de pesos, más overhead de KV cache y activaciones, por lo que se requieren GPUs con al menos 80 GB de memoria (por ejemplo, H100 80GB o A100 80GB).
- GPU recomendadas: 8x H100 80GB o 8x A100 80GB. También es viable con 8x Intel Gaudi2 (como se usó en la validación del autor).
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño del modelo y a la necesidad de memoria agregada superior a 600 GB.
- Opciones de despliegue: vLLM (con `--enable-expert-parallel`), vLLM-Gaudi (versión 0.26.0 usada en la validación), TGI u otros backends compatibles con MoE y FP8.
- Latencia y throughput medidos en el entorno de validación (8x Gaudi2, vLLM-Gaudi 0.26.0, tensor parallel 8, expert parallel 8, BF16 KV cache, MTP desactivado):
  - Decodificación secuencial: 20,17 tokens/s para una generación de 1.024 tokens.
  - Decodificación concurrente: 249,59 tokens/s agregados para 16 peticiones de 512 tokens, y 279,18 tokens/s agregados para 16 peticiones de 1.024 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos enrutados | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-224E-FP8-REAP (este) | 661,5B | 224 | 131K validado | FP8 | GLM-5.3 |
| zai-org/GLM-5.3 (base) | no disponible (similar, con 256 expertos) | 256 | 1M anunciado | FP8 | GLM-5.3 |
| GLM-5.3-Flash (de Z.ai) | 320B totales, 18B activos | no disponible | 1M | no disponible | MIT (según OpenLM.ai) |

La comparativa directa con otros modelos MoE de la misma categoría (por ejemplo, DeepSeek-V3 o Qwen3-MoE) no está disponible en la información proporcionada. Frente al modelo base, este derivado reduce el payload en un 12,2% y el número de expertos enrutados de 256 a 224, con una ventana de contexto validada inferior (131K frente a 1M anunciado). GLM-5.3-Flash, por su parte, es una variante multimodal más pequeña y con licencia MIT, pero no es directamente comparable por su arquitectura híbrida y menor tamaño.

## Limitaciones y advertencias

- La poda estructural de expertos puede afectar de forma desigual a la calidad en distintos dominios, incluso cuando las pruebas agregadas de humo pasan correctamente.
- No se ha reproducido la suite completa de benchmarks oficiales de GLM-5.3 ni de terceros sobre este derivado; el resultado de GPQA Diamond (9/10 en 10 preguntas) es solo una prueba de humo y no debe considerarse un resultado de benchmark concluyente.
- Solo se ha validado el perfil de runtime con KV cache BF16. La KV cache FP8 no ha sido evaluada para esta versión, por lo que su uso no está cualificado.
- La ventana de contexto máxima validada es de 131.072 tokens, aunque el modelo base anuncia 1M. Desplegar con contextos mayores puede requerir ajustes de hardware y configuración no probados.
- El despliegue requiere un almacenamiento sustancial (663,8 GB) y memoria de acelerador agregada superior a 600 GB, lo que limita su uso a entornos con infraestructura de alto rendimiento.
- El modelo hereda las limitaciones de uso previsto, seguridad y lenguaje del modelo base `zai-org/GLM-5.3`. Es necesario revisar la model card del modelo base antes de su despliegue.
- La licencia GLM-5.3 License puede imponer restricciones de uso comercial; se debe consultar el texto completo de la licencia en el repositorio del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/destr8803/GLM-5.3-224E-FP8-REAP
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Paper técnico de GLM-5: https://arxiv.org/abs/2602.15763
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Página de GLM-5.3 en OpenLM.ai: https://openlm.ai/glm-5.5/
- Página de GLM-5.3 en Modular Model Garden: https://www.modular.com/models/glm-5-3

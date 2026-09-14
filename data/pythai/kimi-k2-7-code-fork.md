# PYTHAI/Kimi-K2.7-Code-fork

## Resumen

PYTHAI/Kimi-K2.7-Code-fork es un repositorio puntero publicado en Hugging Face por el usuario PYTHAI que no almacena pesos. Replica la licencia, la configuración, el tokenizer y el código de moonshotai/Kimi-K2.7-Code en el commit `74797c9c62378b951a1f6fcf5c4631024e9b8bef`, capturado el 13 de septiembre de 2026, e incluye los resúmenes SHA-256 de esos ficheros en `FORK.json`. Su tamaño de repositorio es de 0,0 GB y acumula 0 descargas y 0 likes, por lo que su utilidad es la de referencia reproducible de licencia y configuración, no la de artefacto desplegable.

El modelo subyacente, desarrollado por Moonshot AI, es un LLM multimodal de arquitectura Mixture-of-Experts orientado a código y a flujos agénticos: 1 billón de parámetros totales, 32.000 millones activos por token, 384 expertos (8 seleccionados por token más uno compartido), 61 capas (una densa) y una ventana de contexto de 256K tokens. Kimi K2.7 Code se construye sobre Kimi K2.6 y se centra en tareas de programación de horizonte largo, mejorando la finalización de tareas de extremo a extremo en flujos de ingeniería de software y reduciendo el consumo de tokens de razonamiento en torno a un 30% respecto a K2.6.

La relevancia actual del modelo radica en su posicionamiento como alternativa abierta de gran escala frente a asistentes propietarios de codificación, con soporte de tool calling vía MCP y capacidad de visión mediante el encoder MoonViT de 400 millones de parámetros. El fork en sí no aporta mejoras técnicas: los pesos (64 archivos, 595,2 GB) permanecen en el repositorio upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA, activación SwiGLU y encoder de visión MoonViT |
| Parámetros totales | 1 billón (1T) |
| Parámetros activos | 32.000 millones (32B) por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | no disponible; el repositorio declara el tag `compressed-tensors` en la configuración upstream |
| Idiomas soportados | no disponible |
| Licencia | modified-mit, etiquetada como `license: other` con `license_name: modified-mit`; se aplican los derechos y obligaciones del LICENSE upstream en el commit fijado |
| Formato de pesos | safetensors (64 archivos de pesos que suman 595,2 GB, alojados en el repositorio upstream, no en este fork) |
| Capas totales | 61 (1 capa densa) |
| Dimensión oculta de atención | 7.168 |
| Dimensión oculta MoE por experto | 2.048 |
| Cabezas de atención | 64 |
| Expertos | 384 en total, 8 seleccionados por token, 1 experto compartido |
| Tamaño de vocabulario | 160.000 tokens |
| Encoder de visión | MoonViT, 400 millones de parámetros |
| Clave de arquitectura en transformers | `kimi_k25` |
| Librería de carga | transformers, con `trust_remote_code=True` por el tag `custom_code` |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio (fork) | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Commit de referencia | `74797c9c62378b951a1f6fcf5c4631024e9b8bef` (2026-09-13T23:55:35Z) |

## Arquitectura y entrenamiento

Kimi K2.7 Code emplea un transformer disperso de tipo Mixture-of-Experts. La red tiene 61 capas, de las cuales solo una es densa, con una dimensión oculta de atención de 7.168 y 64 cabezas. El enrutador selecciona 8 expertos de los 384 disponibles por token, además de un experto compartido siempre activo, lo que da 32.000 millones de parámetros activos sobre un total de 1 billón. La atención utiliza el mecanismo MLA (Multi-head Latent Attention), que comprime las claves y los valores en un espacio latente para reducir el coste de la caché KV en contextos largos de hasta 256K tokens. La activación es SwiGLU y el vocabulario es de 160.000 entradas.

El modelo incorpora un encoder de visión MoonViT de 400 millones de parámetros, lo que explica el pipeline `image-text-to-text` y el tag `feature-extraction`. K2.7 Code es un refinamiento de Kimi K2.6 orientado a tareas de codificación de horizonte largo: según la model card, mejora la finalización de tareas en flujos de ingeniería de software complejos y reduce el uso de tokens de razonamiento en aproximadamente un 30% frente a K2.6, lo que constituye su principal innovación declarada en eficiencia. No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Generación de código y resolución de tareas de ingeniería de software de horizonte largo, con evaluación específica en Kimi Code Bench v2, Program Bench y MLS Bench Lite.
- Razonamiento agéntico multi-paso: la model card reporta resultados en Kimi Claw 24/7 Bench, orientado a operación continua de agentes.
- Tool calling y function calling mediante el protocolo MCP (Model Context Protocol), con resultados declarados en MCP Atlas y MCP Mark Verified.
- Procesamiento multimodal de entrada: el encoder MoonViT permite tomar imágenes y texto, con salida en texto (pipeline image-text-to-text).
- Extracción de características (`feature-extraction` en los tags del repositorio).
- Uso conversacional multi-turno (`conversational`).
- Modo de razonamiento con eficiencia de tokens mejorada: reducción en torno al 30% de los tokens de pensamiento frente a Kimi K2.6.
- Capacidades multilingües: no disponible (el repositorio no declara el conjunto de idiomas soportados).

## Casos de uso

- Agentes de codificación de horizonte largo: el modelo puede mantener una tarea de refactorización o desarrollo durante muchas iteraciones sin perder el hilo, gracias a la ventana de 256K tokens y a las mejoras declaradas en tareas de largo recorrido.
- Integración en pipelines de CI/CD: con soporte de tool calling vía MCP, puede invocarse desde herramientas de automatización para ejecutar tests, abrir pull requests o proponer parches a partir de fallos detectados.
- Revisión de código sobre repositorios completos: la ventana de 256K tokens permite cargar múltiples ficheros y el historial de cambios en una sola pasada para detectar inconsistencias entre módulos.
- Migración de código legado: traducción de bases de código entre lenguajes o frameworks manteniendo coherencia con las convenciones del proyecto, con verificación posterior mediante herramientas externas.
- Generación de código a partir de capturas de interfaz: el encoder MoonViT habilita tomar una imagen de una UI o de un diagrama y producir el marcado o el componente correspondiente.
- Asistente de documentación técnica: extracción de firmas, dependencias y ejemplos a partir de un árbol de fuentes y generación de documentación de API.
- Automatización de soporte técnico de producto: conversaciones multi-turno con contexto largo sobre manuales y código de ejemplo, con llamadas a herramientas para consultar sistemas internos.
- Análisis de repositorios con salida estructurada: extracción de información (patrones de uso, dependencias, deuda técnica) aprovechando la capacidad de extracción de características del modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo upstream. Las cifras corresponden a evaluaciones declaradas por el autor.

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

No se han publicado en la información disponible resultados de benchmarks estándar de la literatura (MMLU, HumanEval, GSM8K, SWE-bench) ni detalles metodológicos de los conjuntos Kimi Code Bench v2, Program Bench, MLS Bench Lite, Kimi Claw 24/7 Bench, MCP Atlas y MCP Mark Verified.

## Requisitos de hardware

- Estimación derivada del recuento de parámetros (1 billón): en bf16/fp16 los pesos ocuparían aproximadamente 2 TB; en fp8/int8, alrededor de 1 TB; en int4, en torno a 500-600 GB. El repositorio upstream publica 64 archivos de pesos que suman 595,2 GB, lo que equivale a una media aproximada de 4,8 bits por parámetro (cálculo derivado, no confirmado por el autor).
- Con la configuración publicada, el despliegue requiere un mínimo de 8 GPU de 80 GB (por ejemplo 8x H100 80 GB, 640 GB agregados) solo para los pesos, sin contar caché KV ni activaciones. Con 256K tokens de contexto y atención MLA, la caché KV añade presión adicional de memoria.
- No cabe en GPU de consumo: una RTX 4090 con 24 GB o una RTX 5090 quedan muy por debajo del requisito, incluso con cuantizaciones agresivas. El modelo no es viable en una única GPU consumer.
- Alternativas de despliegue razonables por ecosistema: vLLM, SGLang o TGI sobre nodos multi-GPU, y transformers con `trust_remote_code=True` para uso de referencia. El soporte en llama.cpp u Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Kimi Code Bench v2 | MCP Mark Verified |
|---|---|---|---|---|---|
| Kimi K2.7 Code | 1T totales / 32B activos | 256K | modified-mit | 62,0 | 81,1 |
| Kimi K2.6 | no disponible | no disponible | no disponible | 50,9 | 72,8 |
| GPT-5.5 | no disponible | no disponible | propietaria | 69,0 | 92,9 |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | 67,4 | 76,4 |

Kimi K2.6 es el predecesor directo y el único comparable con información parcial en la documentación: mejora de 11,1 puntos en Kimi Code Bench v2 y de 8,3 puntos en MCP Mark Verified al pasar a K2.7 Code. Frente a GPT-5.5 y Claude Opus 4.8, ambos propietarios y sin especificaciones públicas de parámetros ni de contexto, K2.7 Code queda por detrás en las tres pruebas de codificación y en MCP Mark Verified, mientras que supera a Claude Opus 4.8 en MCP Mark Verified. No se dispone de datos de contexto, licencia ni disponibilidad de pesos para los dos modelos cerrados.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: 0,0 GB de tamaño y 64 archivos de pesos que permanecen en el repositorio upstream. Cualquier despliegue debe cargar `moonshotai/Kimi-K2.7-Code` fijando la revisión `74797c9c62378b951a1f6fcf5c4631024e9b8bef`.
- El tag `custom_code` implica que la carga con transformers requiere `trust_remote_code=True`, lo que supone ejecutar código incluido en el repositorio. Debe auditarse antes de usarlo en entornos de producción o con datos sensibles.
- La licencia figura como `license: other` con `license_name: modified-mit`, no como MIT estándar. Es imprescindible revisar el texto del LICENSE del commit fijado antes de cualquier uso comercial, ya que una licencia MIT modificada suele incorporar condiciones adicionales.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de fidelidad factual ni tasa de alucinación.
- Sesgos: la model card no incluye información sobre sesgos demográficos, sociales o lingüísticos, ni sobre los datos de entrenamiento que permitirían evaluarlos.
- Idiomas soportados: no disponible. Se desconoce el comportamiento fuera del inglés y del chino.
- Los benchmarks presentados son autoinformados por el fabricante, usan conjuntos propios de nombre no estándar (Kimi Code Bench v2, Program Bench, MLS Bench Lite, Kimi Claw 24/7 Bench, MCP Atlas, MCP Mark Verified) y no se publican detalles metodológicos ni desviaciones.
- No hay resultados publicados en benchmarks independientes y ampliamente reproducibles (MMLU, HumanEval, GSM8K, SWE-bench), lo que dificulta la comparación externa.
- El repositorio acumula 0 descargas y 0 likes y fue creado y actualizado el mismo día, por lo que no cuenta con validación alguna por parte de la comunidad.
- La clave de arquitectura declarada en los tags es `kimi_k25`, mientras que la model card describe un modelo derivado de Kimi K2.6; conviene verificar la compatibilidad real de la configuración antes de cargar los pesos.

## Enlaces

- Repositorio fork en Hugging Face: https://huggingface.co/PYTHAI/Kimi-K2.7-Code-fork
- Repositorio upstream del modelo: https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Commit fijado del upstream: https://huggingface.co/moonshotai/Kimi-K2.7-Code/tree/74797c9c62378b951a1f6fcf5c4631024e9b8bef
- Licencia upstream: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Fichero de verificación del fork: https://huggingface.co/PYTHAI/Kimi-K2.7-Code-fork/blob/main/FORK.json
- Producto Kimi Code: https://www.kimi.com/code
- Página de Moonshot AI: https://www.moonshot.ai
- Organización de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Perfil de Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Servidor de Discord de Kimi: https://discord.gg/TYU2fdJykW
- Organización de Moonshot AI en ModelScope: https://modelscope.cn/organization/moonshotai

La búsqueda web realizada no devolvió ningún enlace técnico relacionado con el modelo; los resultados obtenidos corresponden a un comercio de cromos y coleccionables y se han descartado por no ser relevantes.

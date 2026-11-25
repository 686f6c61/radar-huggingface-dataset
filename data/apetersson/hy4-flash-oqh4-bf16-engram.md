# apetersson/Hy4-flash-oQh4-BF16-Engram

## Resumen

Hy4-flash es un modelo de generación de texto desarrollado por Tencent, publicado en Hugging Face bajo la licencia `tencent-hy-license`. Esta ficha describe la revisión `apetersson/Hy4-flash-oQh4-BF16-Engram`, una cuantización de 4 bits del modelo base realizada por el usuario apetersson, empaquetada en formato MLX (safetensors) y orientada a su ejecución en Apple Silicon mediante la librería oMLX.

La revisión incorpora una innovación destacable: las cuatro tablas Engram originales en BF16 se mantienen en disco y se cargan mediante offloading SSD (SSD N-gram Offload), mientras que los expertos permanecen en memoria. El conjunto de pesos ocupa aproximadamente 200,26 GiB en disco y el modelo cuenta con 92.566.288.293 parámetros totales según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos de gran escala.

Es relevante ahora porque demuestra una vía práctica para ejecutar un modelo de casi 93.000 millones de parámetros en un Mac de Apple Silicon de 256 GiB, combinando cuantización de 4 bits con offloading selectivo de componentes concretos. No obstante, la validación publicada por el autor es limitada: un único smoke test de generación de texto con el loader previo a la fusión, sin pruebas de la aplicación empaquetada, HTTP, MTP, visión, velocidad ni ajuste en máquinas de 128 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `tencent/Hy4-flash`; la model card no detalla la arquitectura) |
| Parametros totales | 92.566.288.293 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQh4) con tablas Engram en BF16 y offloading SSD |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia `other` en Hugging Face) |
| Formato de pesos | safetensors (MLX); cuantización oQh4 con Engram BF16 |
| Tamano del repositorio | 302,4 GB |
| Peso en disco de los pesos | aproximadamente 200,26 GiB |
| Libreria de inferencia | mlx (oMLX 0.8.3 o superior) |
| Modelo base | tencent/Hy4-flash |
| Descargas | 343 |
| Likes | 3 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `tencent/Hy4-flash`: no se detalla si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o basada en SSM, ni se especifican el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. El dato de parámetros totales (92.566.288.293) procede de los safetensors del repositorio.

La innovación técnica documentada en esta revisión es el esquema de cuantización oQh4 con Engram BF16 y offloading SSD. Las cuatro tablas Engram originales se conservan en precisión BF16 y se descargan desde disco en tiempo de inferencia, mientras que los pesos de los expertos permanecen en memoria. Según el autor, los lectores respaldados por disco se sitúan en las capas 2, 12, 22 y 32, con una carga BF16 total de 118,02 GiB. El soporte de esta función se incorporó en oMLX 0.8.3 mediante el PR #5475 (Hy4 SSD N-gram Offload), por lo que no se requiere un fork ni una compilación personalizada. El autor advierte de que no deben mezclarse shards del diseño antiguo con esta instantánea y de que la descarga debe hacerse en un directorio limpio de un SSD local.

## Capacidades

- Generación de texto: el modelo está etiquetado con la pipeline `text-generation` y validado con una prueba de generación que produjo una respuesta terminada en "Paris".
- Conversación: la etiqueta `conversational` figura entre las etiquetas del repositorio.
- Cuantización de 4 bits: permite reducir el espacio de almacenamiento frente a los pesos en precisión completa, a costa de una posible pérdida de calidad no cuantificada en la información disponible.
- Offloading selectivo de Engram: las tablas BF16 se cargan desde SSD, lo que reduce la presión sobre la memoria unificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el autor indica explícitamente que no se ha realizado prueba de visión.

## Casos de uso

- Ejecución local en Apple Silicon de gama alta: un Mac con 256 GiB de memoria unificada puede cargar el modelo con oMLX 0.8.3 o superior y el offloading SSD activado, manteniendo los expertos en memoria. El autor reportó un RSS máximo de 82,66 GiB en su prueba, lo que deja margen dentro de esa configuración.
- Prototipado e investigación en entornos macOS: investigadores que trabajan en Mac pueden experimentar con un modelo de 92.566 millones de parámetros sin depender de GPU NVIDIA, usando el ecosistema MLX.
- Evaluación de técnicas de offloading: el modelo sirve como banco de pruebas para estudiar el equilibrio entre cuantización de 4 bits, carga de tablas BF16 desde SSD y latencia de inferencia en hardware de memoria unificada.
- Generación de texto conversacional en local: para flujos de conversación que requieran confidencialidad de datos, el despliegue local evita enviar información a servicios externos, siempre que se acepten las condiciones de la licencia tencent-hy-license.
- Experimentación con cuantizaciones alternativas: desarrolladores que comparan variantes oQh4 frente a otros esquemas pueden usar esta revisión como referencia dentro de oMLX.
- Docencia y demostraciones de modelos a gran escala: permite ilustrar en un equipo de sobremesa conceptos como offloading de componentes, cuantización y gestión de memoria en inferencia, con las limitaciones de validación señaladas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una prueba de humo cualitativa: en un Mac Apple Silicon de 256 GiB, con el loader previo a la fusión, el modelo generó una respuesta terminada en "Paris" con los cuatro lectores respaldados por disco conectados (capas 2, 12, 22 y 32; 118,02 GiB de carga BF16). El RSS máximo muestreado del proceso fue de 82,66 GiB, sin crecimiento del swap del sistema por encima de la línea base. El propio autor indica que no se realizaron pruebas de la aplicación empaquetada, HTTP, MTP, visión, velocidad ni ajuste en 128 GiB.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan aproximadamente 200,26 GiB en disco; en la prueba del autor el RSS máximo fue de 82,66 GiB con los expertos en memoria y las tablas Engram en SSD. La memoria necesaria real depende de la configuración de offloading y de la longitud de contexto.
- GPU recomendadas: no disponible; la revisión está orientada a Apple Silicon mediante MLX, no a GPU NVIDIA.
- Compatibilidad con GPU de consumo: no disponible para GPU convencionales. En Apple Silicon, el autor solo valida un equipo de 256 GiB de memoria unificada y no confirma el ajuste en máquinas de 128 GiB.
- Almacenamiento: se requiere un SSD local con espacio suficiente para el repositorio de 302,4 GB y los pesos de aproximadamente 200,26 GiB, descargados en un directorio limpio.
- Opciones de despliegue: oMLX 0.8.3 o superior con SSD N-gram Offload activado y el offload de expertos desactivado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no realizó pruebas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apetersson/Hy4-flash-oQh4-BF16-Engram | 92.566.288.293 | no disponible | safetensors MLX (oQh4 + Engram BF16) | tencent-hy-license | Hugging Face, 343 descargas |
| tencent/Hy4-flash (modelo base) | no disponible en la informacion | no disponible | no disponible | tencent-hy-license | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Validación insuficiente: el autor solo realizó una prueba de humo de generación de texto con el loader previo a la fusión; no hay pruebas de la aplicación empaquetada, del servidor HTTP, de MTP, de visión ni de velocidad.
- Sin datos de benchmarks: no se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones, por lo que el rendimiento real frente al modelo base es desconocido.
- Riesgo de degradación por cuantización: la cuantización de 4 bits puede reducir la calidad respecto a los pesos originales; no se documenta la magnitud de esa pérdida.
- Requisitos de memoria y almacenamiento elevados: el repositorio ocupa 302,4 GB y los pesos unos 200,26 GiB en disco; el ajuste en equipos de 128 GiB no está verificado.
- Dependencia de una versión concreta de oMLX: es necesario oMLX 0.8.3 o superior con el soporte de SSD N-gram Offload; versiones anteriores no son compatibles.
- Riesgo de mezcla de shards: el autor advierte de no combinar shards del diseño antiguo con esta instantánea, lo que puede provocar fallos de carga.
- Idiomas no declarados: el repositorio no especifica los idiomas soportados, lo que dificulta evaluar su idoneidad multilingüe.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos conocidos ni sobre tasas de alucinación de este modelo o de su base.
- Restricciones de licencia: la licencia tencent-hy-license debe revisarse antes de cualquier uso comercial; el repositorio la etiqueta como `other`, por lo que no se garantiza un uso libre sin condiciones adicionales.
- Contexto no documentado: se desconoce la longitud máxima de contexto, un factor crítico para planificar aplicaciones en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/apetersson/Hy4-flash-oQh4-BF16-Engram
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia tencent-hy-license: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Release de oMLX 0.8.3: https://github.com/jundot/omlx/releases/tag/v0.8.3
- PR de Hy4 SSD N-gram Offload (PR #5475): https://github.com/jundot/omlx/pull/5475
- Commit del loader previo a la fusión: https://github.com/jundot/omlx/commit/5f64305ce5f845927f17c30dd369ce1adda41135

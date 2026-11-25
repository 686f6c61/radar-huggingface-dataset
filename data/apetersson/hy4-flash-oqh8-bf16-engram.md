# apetersson/Hy4-flash-oQh8-BF16-Engram

## Resumen

Hy4-flash-oQh8-BF16-Engram es una cuantización de 4 bits (esquema oQh8) del modelo Hy4-flash de Tencent, publicada por el usuario apetersson. El modelo base es un transformer multimodal con codificador de visión y arquitectura de mezcla de expertos (MoE) implícita en el nombre "flash", aunque la model card no detalla su estructura interna. Esta revisión concreta mantiene las cuatro tablas Engram originales en BF16 y descarga su contenido desde SSD mediante offloading N-gram, mientras los expertos permanecen en memoria.

La relevancia de esta ficha radica en su enfoque de despliegue: está pensada para ejecutarse en Apple Silicon mediante la librería MLX y el runtime oMLX (versión 0.8.3 o superior), que incorpora el soporte de offload SSD para las tablas Engram. Con 111.138.666.405 parámetros totales y un repositorio de 465,8 GB, el modelo ocupa aproximadamente 269,45 GiB en disco y requiere hardware de gama alta con memoria unificada muy amplia.

Se trata de una publicación de nicho, con 948 descargas y sin likes, orientada a entornos de inferencia local en macOS. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador de visión y tablas Engram (detalle interno no disponible) |
| Parametros totales | 111.138.666.405 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQh8); tablas Engram en BF16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | safetensors (MLX) |
| Modelo base | tencent/Hy4-flash |
| Tamano del repositorio | 465,8 GB |
| Peso en disco | ~269,45 GiB |
| Libreria | mlx |
| Runtime recomendado | oMLX 0.8.3 o superior |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base tencent/Hy4-flash más allá de las etiquetas de la model card, que indican la presencia de un codificador de visión y de tablas Engram. El término Engram hace referencia, en el contexto de esta publicación, a cuatro tablas en BF16 (capas 2, 12, 22 y 32) que suman 118,02 GiB de payload y que se descargan desde disco mediante offloading N-gram. Los expertos, por el contrario, permanecen en memoria.

Esta revisión aplica una cuantización oQh8 de 4 bits a los pesos del modelo, manteniendo las tablas Engram en BF16 para preservar su precisión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá del mecanismo de offload SSD de las tablas Engram.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation).
- Procesamiento multimodal: la etiqueta vision-encoder indica soporte de entrada de imágenes, aunque no se detallan las capacidades concretas.
- Razonamiento y generación de código: no confirmado en la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: el modelo está diseñado para ejecutarse con oMLX 0.8.3 o superior en equipos con memoria unificada de 256 GiB, lo que permite desplegar un modelo de 111.000 millones de parámetros en un Mac Studio o Mac Pro sin depender de GPUs dedicadas.
- Experimentación con offloading SSD de tablas Engram: útil para investigadores que quieran estudiar el rendimiento del mecanismo de offload N-gram en capas concretas (2, 12, 22 y 32) sin descargar ni preparar las tablas por separado.
- Evaluación de cuantización oQh8 en modelos multimodales: permite comparar la calidad de la cuantización de 4 bits frente al modelo base en tareas de generación de texto y visión.
- Desarrollo de prototipos conversacionales en local: el pipeline text-generation y la naturaleza conversacional del modelo permiten construir asistentes de chat que no envían datos a la nube.
- Pruebas de integración con MLX: sirve como referencia para desarrolladores que quieran validar flujos de carga de modelos cuantizados con safetensors en el ecosistema MLX.
- Investigación sobre requisitos de memoria: el caso documentado de 151,82 GiB de RSS máximo con 256 GiB de RAM permite estudiar el consumo real de un modelo MoE con offload de tablas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta una prueba de humo cualitativa: en un Mac con Apple Silicon de 256 GiB, el loader previo a la fusión generó una respuesta que terminaba en "Paris" con los cuatro lectores respaldados por disco conectados (capas 2, 12, 22 y 32; 118,02 GiB de payload BF16). El RSS máximo muestreado del proceso fue de 151,82 GiB, sin crecimiento de swap del sistema por encima de la línea base. Se trata de una única prueba de texto con el loader directo, no de una prueba de la aplicación empaquetada, HTTP, MTP, visión, velocidad ni de ajuste en 128 GiB.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa ~269,45 GiB en disco; el caso validado usa 256 GiB de memoria unificada con un RSS máximo de 151,82 GiB.
- GPU recomendadas: Apple Silicon con memoria unificada de 256 GiB (Mac Studio o Mac Pro de gama alta). No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no disponible; el modelo está orientado a MLX y Apple Silicon, no a GPUs NVIDIA de consumo.
- Opciones de despliegue: oMLX 0.8.3 o superior con SSD N-gram Offload activado y offload de expertos desactivado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card indica explícitamente que no se realizaron pruebas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy4-flash-oQh8-BF16-Engram | 111.138.666.405 | no disponible | tencent-hy-license | Hugging Face (948 descargas) | Cuantización oQh8 4-bit para MLX con offload SSD de Engram |
| tencent/Hy4-flash | no disponible | no disponible | tencent-hy-license | Hugging Face | Modelo base sin cuantizar; referencia de comparación |
| Otros modelos de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información suficiente para establecer comparaciones rigurosas |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta sesgos.
- Riesgo de alucinación: no evaluado en la información disponible; solo se realizó una prueba de humo cualitativa.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados.
- Restricciones de licencia: la licencia tencent-hy-license es de tipo "other"; es necesario revisar el enlace de licencia del modelo base antes de cualquier uso comercial.
- Caveats de producción: la validación se limita a una prueba de texto con el loader directo; no se han probado la aplicación empaquetada, el servidor HTTP, MTP, visión, velocidad ni el ajuste en 128 GiB.
- Requisito de runtime: solo funciona con oMLX 0.8.3 o superior; no se debe mezclar con shards del layout antiguo.
- Requisito de memoria: necesita un equipo con 256 GiB de memoria unificada para el caso validado; no está confirmado que quepa en configuraciones de 128 GiB.
- Formato propietario del ecosistema: al estar en MLX, no es directamente portable a otros runtimes sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apetersson/Hy4-flash-oQh8-BF16-Engram
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Release de oMLX 0.8.3: https://github.com/jundot/omlx/releases/tag/v0.8.3
- PR de Hy4 SSD N-gram Offload: https://github.com/jundot/omlx/pull/5475
- Commit del loader previo a la fusión: https://github.com/jundot/omlx/commit/5f64305ce5f845927f17c30dd369ce1adda41135

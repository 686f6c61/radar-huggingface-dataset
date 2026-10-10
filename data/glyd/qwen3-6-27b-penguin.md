# glyd/Qwen3.6-27B-penguin

## Resumen

Glyd penguin para Qwen3.6-27B es una recodificación sin pérdida de los pesos del modelo Qwen/Qwen3.6-27B, publicada por el usuario glyd. No se trata de un modelo entrenado desde cero ni de una cuantización con degradación: cada peso del repositorio se decodifica exactamente al mismo valor bf16 del modelo original, bit a bit. El resultado ocupa 34,50 GiB frente a los 50,10 GiB en bf16 del modelo base, es decir, aproximadamente un 31 % menos de espacio, lo que reduce los requisitos de almacenamiento y de distribución de artefactos.

El modelo conserva la licencia apache-2.0 del base, pero el runtime necesario para decodificar los pesos (la librería glyd) se distribuye bajo BUSL-1.1: su uso es gratuito en equipos propios para fines personales y no comerciales, mientras que el uso comercial requiere una licencia específica. Es un detalle relevante porque condiciona el despliegue en producción aunque los pesos en sí sean apache-2.0.

El repositorio está etiquetado con la arquitectura qwen3_5 y contiene únicamente la parte de texto del modelo: la componente de visión no está incluida. El autor indica que el modelo tiene 26.895.998.464 parámetros reales, mientras que el Hub muestra 35.670.840.303 porque cuenta cada byte empaquetado como un parámetro. No se han publicado datos sobre longitud de contexto, idiomas soportados ni arquitectura interna en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del repositorio: qwen3_5; derivada del modelo base Qwen/Qwen3.6-27B) |
| Parametros totales | 26.895.998.464 (recuento indicado por el autor); el Hub muestra 35.670.840.303 al contar cada byte empaquetado como un parametro |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | penguin (sin perdida, decodifica a bf16 bit a bit); variantes hermanas kestrel (unos 6,5 bits por peso) y swift (unos 5,5 bits por peso); etiqueta 8-bit en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos, heredada del modelo base); runtime glyd bajo BUSL-1.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 37,1 GB |
| Tamano de pesos empaquetados | 34,50 GiB (frente a 50,10 GiB en bf16) |
| Modelo base | Qwen/Qwen3.6-27B, commit 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Fecha de publicacion | 9 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna del modelo (tipo de transformer, mecanismos de atención, uso de MoE o de capas híbridas), sobre el número de tokens de entrenamiento, la composición del dataset ni sobre fases de ajuste como RLHF o DPO. Lo único documentado es la etiqueta qwen3_5 del repositorio y que el modelo base es Qwen/Qwen3.6-27B, fijado a un commit concreto, lo que garantiza la reproducibilidad de la recodificación.

La innovación técnica del repositorio no está en el modelo sino en el formato de compresión. Glyd aplica una codificación sin pérdida sobre los pesos bf16 del base: el artefacto resultante ocupa 34,50 GiB en lugar de 50,10 GiB, y la decodificación reconstruye cada peso exactamente a su valor bf16 original. El autor publica tres niveles de compresión: penguin (sin pérdida), kestrel (unos 6,5 bits por peso) y swift (unos 5,5 bits por peso). No se especifica la técnica concreta de codificación empleada, la sobrecarga de decodificación en tiempo de ejecución ni si el proceso es en línea o previo a la inferencia.

## Capacidades

- Generación de texto: heredada del modelo base Qwen3.6-27B en su parte de texto. La documentación disponible no detalla capacidades concretas.
- Visión: no incluida. El autor indica explícitamente que solo se distribuye la parte de texto del modelo.
- Razonamiento, código y matemáticas: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o capacidades especiales: no disponible en la información proporcionada.
- Garantía de fidelidad: todos los pesos decodifican al valor bf16 original, bit a bit, por lo que las capacidades son idénticas a las del modelo base en la parte de texto, siempre que el runtime funcione correctamente.

## Casos de uso

- Almacenamiento de artefactos en un registro interno: sustituir el checkpoint bf16 de 50,10 GiB por el empaquetado de 34,50 GiB reduce el espacio ocupado en disco y en sistemas de almacenamiento de objetos sin renunciar a la fidelidad de los pesos.
- Distribución a clústeres de inferencia: un repositorio de 37,1 GB frente a los aproximadamente 50 GiB del base disminuye el tiempo de descarga y el ancho de banda consumido al desplegar el modelo en varios nodos.
- Inferencia de texto en producción donde no se necesita visión: el repositorio excluye la componente visual, por lo que es adecuado para servicios que solo procesan texto y quieren evitar cargar pesos innecesarios.
- Línea base exacta para evaluar cuantizaciones: al ser sin pérdida, penguin sirve como referencia bit a bit contra la que medir la degradación de kestrel (6,5 bits por peso) y swift (5,5 bits por peso) en tareas concretas.
- Archivado a largo plazo con garantía de reproducibilidad: la decodificación bit a bit y la fijación del commit del modelo base permiten reconstruir exactamente el checkpoint original en el futuro.
- Entornos con almacenamiento limitado pero GPU suficiente: equipos con VRAM para el modelo en bf16 pero con cuotas de disco ajustadas pueden beneficiarse del menor tamaño del artefacto.
- Evaluación comparativa de runtimes de compresión: permite medir la sobrecarga de decodificación de glyd frente a cargar safetensors bf16 directamente, con la ventaja de que el resultado numérico debe ser idéntico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni tampoco datos de latencia o throughput del runtime glyd.

## Requisitos de hardware

- Sistema operativo: Linux. No se menciona soporte para Windows ni macOS.
- GPU: NVIDIA con arquitectura Ampere o posterior.
- Controlador: versión 580 o superior.
- Runtime: glyd 0.29.4 o posterior.
- VRAM estimada para pesos en bf16: alrededor de 50,10 GiB solo para los pesos, más caché KV y activaciones; en la práctica requiere GPUs de 80 GB (A100, H100) o reparto en varios dispositivos.
- VRAM estimada para penguin: no especificada por el autor. Los pesos empaquetados ocupan 34,50 GiB, pero la memoria necesaria en ejecución depende de si el runtime mantiene los pesos decodificados en bf16 en VRAM; si es así, el consumo se aproxima al del modelo en bf16.
- VRAM estimada para kestrel (unos 6,5 bits por peso): aproximadamente 22 GB para 26,9 mil millones de parámetros, estimación propia a partir del número de bits por peso.
- VRAM estimada para swift (unos 5,5 bits por peso): aproximadamente 18,5 GB, estimación propia a partir del número de bits por peso.
- GPU de consumo: no hay confirmación oficial. Por tamaño, swift sería el único candidato plausible para una RTX 4090 de 24 GB, pero habría que sumar caché KV y activaciones, por lo que no puede garantizarse sin datos del autor.
- Opciones de despliegue: el autor documenta exclusivamente el runtime glyd (`glyd run Qwen/Qwen3.6-27B:penguin` y `glyd.from_pretrained("glyd/Qwen3.6-27B-penguin")`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion con el base | Bits por peso | Tamano | Licencia |
|---|---|---|---|---|
| glyd/Qwen3.6-27B-penguin | Recodificacion sin perdida | No aplica (sin perdida) | 34,50 GiB | Pesos apache-2.0; runtime BUSL-1.1 |
| glyd/Qwen3.6-27B-kestrel | Recodificacion con perdida | Unos 6,5 | No disponible | Pesos apache-2.0; runtime BUSL-1.1 |
| glyd/Qwen3.6-27B-swift | Recodificacion con perdida | Unos 5,5 | No disponible | Pesos apache-2.0; runtime BUSL-1.1 |
| Qwen/Qwen3.6-27B (base, bf16) | Modelo original | 16 | 50,10 GiB | apache-2.0 |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea), ni de datos de rendimiento que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Dependencia obligatoria del runtime glyd: los pesos no son cargables directamente con transformers, vLLM ni llama.cpp según la información disponible; sin el runtime propietario el artefacto no es utilizable.
- Licencia del runtime: glyd se distribuye bajo BUSL-1.1. El uso es gratuito solo para fines personales y no comerciales en equipos propios; cualquier uso comercial requiere una licencia adicional, aunque los pesos sean apache-2.0.
- Requisitos de plataforma estrictos: Linux, GPU NVIDIA Ampere o posterior, controlador 580 o superior y glyd 0.29.4 o posterior. No hay soporte anunciado para hardware AMD, Intel, Apple Silicon ni para CPU.
- Sin componente de visión: el repositorio es solo texto, por lo que no puede replicar tareas multimodal del modelo base.
- Ausencia de benchmarks: no hay métricas publicadas que permitan verificar que la decodificación no introduce diferencias funcionales más allá de la afirmación de fidelidad bit a bit del autor.
- Sesgos y alucinación: no hay información disponible sobre sesgos del modelo base ni sobre su tasa de alucinación; se heredan los del modelo Qwen3.6-27B, cuya documentación no forma parte de esta ficha.
- Idiomas y contexto: se desconoce la lista de idiomas soportados y la longitud de contexto, datos imprescindibles antes de plantear un despliegue en producción multilingüe o con ventanas largas.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Sobre el recuento de parámetros: la cifra de 35.670.840.303 que muestra el Hub no es el número real de parámetros, sino el número de bytes empaquetados; usar la cifra de 26.895.998.464 para dimensionar hardware y costes.
- Fijacion al commit del base: la fidelidad bit a bit solo está garantizada respecto al commit 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 de Qwen/Qwen3.6-27B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.6-27B-penguin
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Commit del modelo base utilizado: https://huggingface.co/Qwen/Qwen3.6-27B/tree/6a9e13bd6fc8f0983b9b99948120bc37f49c13e9
- Variante kestrel (unos 6,5 bits por peso): https://huggingface.co/glyd/Qwen3.6-27B-kestrel
- Variante swift (unos 5,5 bits por peso): https://huggingface.co/glyd/Qwen3.6-27B-swift
- Sitio del runtime glyd: https://getglyd.com
- Script de instalacion: https://getglyd.com/install.sh

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card del autor. No se dispone de papers, blogs ni demos adicionales.

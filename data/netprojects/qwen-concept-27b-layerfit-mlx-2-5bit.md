# netprojects/Qwen-Concept-27B-LayerFit-MLX-2.5bit

## Resumen

Qwen-Concept-27B-LayerFit-MLX-2.5bit es una cuantización de 2,5 bits en formato MLX del modelo ConceptCountry/qwen-concept-27b, una variante editada de pesos de Qwen3.8-27B que "piensa con menos tokens". La publica netprojects (Paris Michalas) mediante LayerFit, una técnica de búsqueda por capas que asigna presupuesto de bits de forma no uniforme según la sensibilidad de cada bloque del modelo. El resultado ocupa 11,5 GB en disco y está pensado para Macs con 16 GB de memoria unificada.

La relevancia de esta ficha es doble: por un lado, demuestra que un modelo de aproximadamente 27.800 millones de parámetros puede ejecutarse en hardware de consumo Apple Silicon con pérdida de calidad controlada; por otro, introduce una metodología de cuantización (LayerFit) que, según el autor, mejora sustancialmente la fidelidad frente a una cuantización estándar del mismo tamaño. El modelo conserva la torre de visión en bf16 y el cabezal de predicción multi-token (MTP) en 4 bits para acelerar la decodificación.

La arquitectura subyacente es un transformer de la familia Qwen3.5 (tag `qwen3_5`), con atención lineal y capacidades multimodales de entrada imagen-texto. La licencia es Apache-2.0. No se dispone de información detallada sobre el dataset de entrenamiento ni de los idiomas soportados más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con bloques de atencion lineal y torre de vision; cuantizacion MLX |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,5 bits con receta LayerFit por capas; torre de vision en bf16; cabezal MTP en 4 bits |
| Idiomas soportados | no disponible (la model card menciona pruebas en ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (biblioteca `mlx`) |

## Arquitectura y entrenamiento

El modelo base es ConceptCountry/qwen-concept-27b, descrito por el autor de la cuantizacion como una edición de pesos de Qwen3.8-27B que reduce el numero de tokens de razonamiento. La arquitectura es un transformer con atención lineal en parte de sus bloques, una torre de visión para entrada de imágenes y un cabezal de predicción multi-token (MTP) que permite decodificación especulativa. Esta cuantización no reentrena el modelo: aplica una receta de cuantización por capas.

La innovación técnica central es LayerFit: en lugar de asignar el mismo número de bits a todas las capas, el método mide la degradación de cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) a bits bajos y distribuye el presupuesto de tamaño donde más ayuda. Según la model card, con el mismo tamaño, la cuantización estándar de 2,5 bits alcanza un 75,8 % de acuerdo top-1 con bf16 y un error KL de 0,3863, mientras que LayerFit 2,5 bits alcanza un 83,3 % y un KL de 0,1841 (52 % menos). El harness de evaluación usa solo pesos de lenguaje frente a una build bf16 del modelo base, con pasajes en inglés, otros idiomas, código, tool calls y matemáticas. La receta exacta está en `layerfit-recipe.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (la model card reporta 2/2 en pruebas de thinking).
- Razonamiento matemático: GSM8K-50 con thinking desactivado da 45/50.
- Generación de código: 3/3 en pruebas de coding.
- Tool calling / function calling: la prueba de tool call pasa según la model card.
- Entrada de imágenes (image-text-to-text) mediante torre de visión conservada en bf16.
- Decodificación especulativa con el cabezal MTP en 4 bits (opción `--draft-kind mtp`).
- Capacidades multilingües: no confirmadas explícitamente; la model card menciona pruebas en "otros idiomas" pero no enumera idiomas soportados.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información disponible.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo cabe en 11,5 GB y permite conversaciones multi-turno con entrada de imágenes sin conexión a la nube, útil para prototipado y privacidad de datos.
- Descripción y análisis de imágenes: con la torre de visión en bf16, se puede usar para etiquetado automático, accesibilidad (descripción de imágenes) o extracción de información de capturas y documentos escaneados.
- Generación de código en local: las pruebas de coding 3/3 y el soporte de tool calling lo hacen adecuado para asistentes de programación integrados en el editor en equipos Apple Silicon.
- Razonamiento matemático asistido: el resultado de 45/50 en GSM8K-50 con thinking desactivado permite usarlo para resolución de problemas aritméticos y verificación de cálculos en flujos de trabajo personales.
- Evaluación de cuantizaciones: sirve como referencia práctica para comparar LayerFit frente a cuantizaciones estándar del mismo tamaño en tareas de lenguaje, código y matemáticas.
- Decodificación acelerada con MTP: el cabezal de predicción multi-token permite generar respuestas más rápido en tareas de generación larga, como redacción de documentación técnica.
- Prototipado de agentes con tool calling: aunque no hay documentación específica de agentes multi-paso, el soporte de function calling permite experimentar con flujos que invocan herramientas externas.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 45/50 |
| Coding | 3/3 |
| Tool call | pass |
| Thinking | 2/2 |
| Acuerdo top-1 con bf16 (LayerFit 2,5 bits) | 83,3 % |
| Acuerdo top-1 con bf16 (2,5 bits estándar) | 75,8 % |
| Error KL (LayerFit 2,5 bits) | 0,1841 |
| Error KL (2,5 bits estándar) | 0,3863 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval completo, etc.) en la información disponible. Los datos anteriores proceden de la model card del autor de la cuantización y de su harness propio.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11,5 GB en disco; pensado para Macs con 16 GB de memoria unificada (la descarga ocupa como máximo aproximadamente el 60 % de la memoria).
- GPU recomendadas: Apple Silicon (M-series) con 16 GB o más. Para el modo "stretch" en 16 GB, el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` y cerrar otras aplicaciones.
- Cabe en GPU de consumo: sí, en Macs de 16 GB (modo stretch) y con holgura en 24 GB o más. No está pensado para GPU NVIDIA; el formato es MLX.
- Opciones de despliegue: mlx-lm, mlx-vlm y LM Studio (carga estándar MLX). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El cabezal MTP en 4 bits está pensado para acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-Concept-27B-LayerFit-MLX-2.5bit (este) | 27,8 B | no disponible | Apache-2.0 | MLX safetensors | 11,5 GB, vision en bf16, MTP 4 bits |
| Qwen-Concept-27B-LayerFit-MLX-2bit | 27,8 B (base) | no disponible | Apache-2.0 | MLX safetensors | 9,1 GB, solo texto |
| Qwen-Concept-27B-LayerFit-MLX-4bit | 27,8 B (base) | no disponible | Apache-2.0 | MLX safetensors | 16,5 GB, vision verificada |
| Qwen-Concept-27B-MLX-8bit | 27,8 B (base) | no disponible | Apache-2.0 | MLX safetensors | Build estándar de 8 bits, sin LayerFit |

No se dispone de datos de rendimiento comparativo frente a modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,5 bits introduce degradación: el acuerdo top-1 con bf16 es del 83,3 %, por lo que aproximadamente uno de cada seis tokens predichos difiere del modelo de referencia.
- El modo "stretch" en 16 GB requiere cerrar aplicaciones y ajustar el límite de memoria del GPU; no es un entorno de producción estable.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en modelos de esta familia y puede amplificarse con la cuantización agresiva.
- La licencia Apache-2.0 permite uso comercial, pero el autor indica que no está afiliado al publicador de ConceptCountry/qwen-concept-27b; conviene revisar LICENSE y NOTICE del repositorio.
- El modelo base es una edición de pesos de Qwen3.8-27B; la model card de la cuantización no detalla qué se modificó exactamente, lo que limita la trazabilidad.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es portable a CUDA sin conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Build de 2 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-2bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Web del autor: https://netprojects.com

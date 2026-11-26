# netprojects/Qwen3.8-27B-LayerFit-MLX-2bit

## Resumen

Qwen3.8-27B-LayerFit-MLX-2bit es una cuantización de 2 bits del modelo Qwen/Qwen3.8-27B, publicada por netprojects (Paris Michalas) para su ejecución en Apple Silicon mediante MLX. El elemento diferencial es LayerFit, una técnica de búsqueda por capas que asigna un presupuesto de bits no uniforme: primero mide la degradación de cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) a bajos bits y después reparte el presupuesto fijo donde más contribuye a preservar la calidad. El resultado ocupa 9,1 GB en disco y está pensado para Macs de 16 GB.

El modelo base tiene 26.895.998.464 parámetros (unos 26,9 mil millones) y una ventana de contexto de 262K tokens. Esta build concreta es solo de texto: se ha eliminado la torre de visión para que quepa en 16 GB de memoria unificada. Tampoco incluye la cabeza MTP (multi-token prediction), porque a 2 bits ralentizaba la decodificación. Los pesos están en formato MLX estándar (safetensors), de modo que cargan con mlx-lm, mlx-vlm y LM Studio sin modificaciones.

La relevancia de esta ficha es práctica: demuestra que un modelo de ~27B puede ejecutarse en hardware de consumo con memoria unificada de 16 GB manteniendo una calidad razonable, a costa de renunciar a la visión y de asumir una pérdida medible frente a bf16. Los datos de calidad los aporta el propio autor con su arnés de evaluación, no con benchmarks oficiales de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (familia Qwen3.5), según tags del repo; detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 2 bits con asignación por capas (LayerFit); existen builds hermanas de 2.5, 3, 4, 6 y 8 bits |
| Idiomas soportados | no disponible (el arnés de evaluación incluye inglés, otras lenguas, código, tool calls y matemáticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, de la familia Qwen3.5 según los tags del repositorio, con bloques de atención estándar y de atención lineal, además de embeddings y cabeza de salida. Esta publicación no entrena el modelo: es una cuantización post-entrenamiento. El proceso LayerFit mide la sensibilidad de cada componente (MLP, atención, atención lineal, embeddings y output head) a la cuantización de baja precisión y distribuye un presupuesto fijo de bits de forma no uniforme, de modo que las capas más sensibles reciben más bits y las menos sensibles menos, manteniendo el tamaño total comparable al de una cuantización uniforme de 2 bits.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card de Qwen y no se incluyen en la información proporcionada. La receta exacta de la búsqueda por capas está publicada en el repositorio como `layerfit-recipe.json`. La build elimina la torre de visión y la cabeza MTP, esta última por penalización de velocidad a 2 bits.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento y matemáticas: el autor reporta 42/50 en GSM8K-50 con el modo thinking desactivado.
- Generación de código: supera las pruebas de tool calls y coding del arnés del autor (3/3 en coding, 2/2 en thinking).
- Tool calling / function calling: validado explícitamente en la evaluación del autor.
- Contexto largo: ventana de 262K tokens, aunque el propio autor recomienda prompts de pocos miles de tokens en configuraciones de 16 GB.
- Multilingüe: el arnés de evaluación cubre inglés y otras lenguas, pero no se detalla la lista de idiomas soportados.
- Sin visión: la torre de visión se ha eliminado en esta build.
- Sin decodificación especulativa MTP: la cabeza MTP se ha omitido.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo cabe en 9,1 GB de disco y consume 11,7 GB de pico con un prompt de 8K tokens, lo que permite ejecutarlo junto a macOS en equipos de memoria unificada limitada.
- Automatización de tareas de código en local: gracias al soporte validado de tool calling, puede integrarse en flujos de edición de ficheros, ejecución de comandos y revisión de parches sin depender de la nube.
- Procesamiento de documentos largos: la ventana de 262K tokens permite resumir o extraer información de contratos, informes o transcripciones extensas, siempre que la memoria lo permita (el autor recomienda prompts moderados en 16 GB).
- Razonamiento matemático y resolución de problemas: útil para tutoría, verificación de cálculos o generación de ejercicios, con la advertencia de que la cuantización a 2 bits degrada la precisión frente a bf16.
- Prototipado y evaluación de pipelines de agentes: permite probar flujos multi-paso y llamadas a herramientas en hardware de consumo antes de desplegar en servidores.
- Privacidad y despliegue offline: al ejecutarse íntegramente en local con MLX, es adecuado para entornos donde los datos no pueden salir del dispositivo, como sanidad, legal o análisis interno.
- Experimentación con cuantización extrema: sirve como referencia para estudiar el impacto de técnicas de asignación no uniforme de bits en modelos de ~27B.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (arnés propio: pesos de lenguaje, 32 pasajes × 512 tokens en inglés, otras lenguas, código, tool calls y matemáticas, contra su conversión MLX bf16; GSM8K-50 con thinking desactivado):

| Prueba | 2-bit uniforme | LayerFit 2-bit |
|---|---|---|
| Acuerdo Top-1 con bf16 | 68,2% | 76,7% |
| Error KL | baseline | 46% menor |
| GSM8K-50 | 30/50 | 46/50 |

Métricas de esta build concreta:

| Métrica | Valor |
|---|---|
| Acuerdo Top-1 con bf16 (chequeo de 12 prompts) | 84,8% (KL 0,297) |
| GSM8K-50, thinking off | 42/50 |
| Tool calls (coding 3/3, thinking 2/2) | pasa |
| Memoria pico con prompt de 8K tokens | 11,7 GB |
| Decodificación en M5 Max (máquina no silenciosa, orientativo) | 46 tok/s |

No se han publicado en la información disponible resultados de benchmarks oficiales de Qwen para este modelo base.

## Requisitos de hardware

- VRAM/memoria unificada: 11,7 GB de pico con un prompt de 8K tokens; el autor indica que el tamaño de descarga es como máximo el 60% de la memoria del equipo.
- Equipo objetivo: Mac de 16 GB de memoria unificada. Existe una variante "stretch" de 2.5 bits (11,5 GB) para 16 GB con menos margen.
- Builds superiores para más memoria: 3 bits (13,1 GB) para 24 GB, 4 bits (16,5 GB) para 32 GB; a partir de 48 GB el autor recomienda builds uniformes de 6 u 8 bits de lmstudio-community o mlx-community.
- GPU: no aplica a CUDA; está diseñado para Apple Silicon. No se proporcionan requisitos para A100, H100 o RTX 4090.
- Despliegue: mlx-lm, mlx-vlm y LM Studio (formato MLX estándar). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 46 tok/s en decodificación sobre un M5 Max, dato indicativo según el propio autor.
- Ajuste opcional: `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el límite de memoria de la GPU hasta el reinicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-LayerFit-MLX-2bit (esta build) | ~26,9B | 262K | MLX safetensors, 2 bits | Apache-2.0 | Hugging Face (netprojects) |
| Qwen3.8-27B-LayerFit-MLX-2.5bit | ~26,9B | 262K | MLX safetensors, 2,5 bits | Apache-2.0 | Hugging Face (netprojects) |
| Qwen3.8-27B-LayerFit-MLX-3bit | ~26,9B | 262K | MLX safetensors, 3 bits | Apache-2.0 | Hugging Face (netprojects) |
| Qwen3.8-27B-LayerFit-MLX-4bit | ~26,9B | 262K | MLX safetensors, 4 bits | Apache-2.0 | Hugging Face (netprojects) |
| Qwen/Qwen3.8-27B (base, bf16) | ~26,9B | 262K | safetensors | Apache-2.0 | Hugging Face (Qwen) |

No se dispone de datos de rendimiento de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada la calidad de forma medible: el acuerdo Top-1 con bf16 es del 84,8% en el chequeo del autor y del 76,7% en su arnés amplio; GSM8K cae a 42/50 frente a los resultados del modelo completo.
- Sin visión: la torre de visión se ha eliminado, por lo que no puede procesar imágenes.
- Sin cabeza MTP: no hay decodificación especulativa multi-token en esta build.
- Contexto efectivo limitado en la práctica: aunque la ventana es de 262K, en 16 GB el autor recomienda prompts de pocos miles de tokens y cerrar otras aplicaciones.
- Riesgo de alucinación: no se documenta mitigación específica; la cuantización agresiva puede incrementarlo en tareas de razonamiento largo.
- Sesgos: no se proporciona información sobre sesgos conocidos del modelo base ni de esta cuantización.
- Idiomas: no se detalla la cobertura lingüística; la evaluación del autor mezcla varias lenguas sin desglose.
- Licencia Apache-2.0, igual que el modelo base, lo que permite uso comercial; deben respetarse LICENSE y NOTICE del repositorio.
- Proyecto no afiliado a Alibaba Cloud ni al equipo de Qwen; LayerFit es una marca registrada de NetProjects.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 2.5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-4bit
- Perfil del autor (selector de builds por Mac): https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com

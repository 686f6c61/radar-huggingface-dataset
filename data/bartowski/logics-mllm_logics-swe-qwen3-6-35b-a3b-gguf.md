# bartowski/Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-GGUF

## Resumen

Logics-SWE-Qwen3.6-35B-A3B es un modelo multimodal (texto e imagen) especializado en ingeniería de software, desarrollado por Logics-MLLM y distribuido en formato GGUF por bartowski. Se construye sobre una base Qwen3.6 de 35B parámetros totales con arquitectura Mixture of Experts (MoE) de aproximadamente 3B parámetros activos, según indica el sufijo A3B de su denominación. El modelo ha sido sometido a post-entrenamiento agéntico mediante destilación on-policy y aprendizaje por refuerzo sobre el dataset Logics-SWE-Env-2.5K, orientado a tareas de resolución de problemas de software reales.

La relevancia de este lanzamiento reside en su especialización: no es un modelo generalista, sino un modelo afinado para flujos de trabajo SWE (software engineering) agénticos, con soporte nativo de tool calling mediante un formato XML estructurado y un modo de razonamiento explícito delimitado por etiquetas `<think>`. Esto lo hace adecuado para pipelines de resolución automática de incidencias, generación de parches y navegación de repositorios.

Esta ficha cubre específicamente la versión cuantizada publicada por bartowski, que incluye un conjunto amplio de cuantizaciones GGUF con calibración imatrix, desde bf16 completo (69,38 GB) hasta formatos de 4 bits (22,32 GB), lo que permite desplegarlo en hardware de consumo con la cuantización adecuada. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), multimodal texto-imagen |
| Parametros totales | 34.660.610.688 (aproximadamente 35B) |
| Parametros activos | aproximadamente 3B (según denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj para entrada de imagen) |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.6 con arquitectura Mixture of Experts de 35B parámetros totales y aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. La naturaleza multimodal se confirma por el pipeline `image-text-to-text` y por la necesidad de un fichero `mmproj` para procesar imágenes en llama.cpp. El prompt format emplea las etiquetas de chat de la familia Qwen (`<|im_start|>`/`<|im_end|>`) con un bloque `<think>` que fuerza la apertura del modo de razonamiento.

El entrenamiento se ha orientado a ingeniería de software mediante un pipeline de post-entrenamiento agéntico que combina destilación on-policy y aprendizaje por refuerzo, según los tags del repositorio. El dataset asociado, Logics-SWE-Env-2.5K, contiene 2.500 entornos o trayectorias de resolución de problemas SWE. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni las técnicas específicas de alineación (RLHF/DPO). La cuantización se realizó con llama.cpp release b11969 aplicando calibración imatrix, lo que mejora la fidelidad de los pesos cuantizados respecto a cuantizaciones sin matriz de importancia.

## Capacidades

- Generación de texto y razonamiento explícito mediante bloque `<think>`, que separa el razonamiento interno de la respuesta final.
- Comprensión de imágenes en formato image-text-to-text, requiriendo el fichero mmproj correspondiente en despliegues llama.cpp.
- Tool calling y function calling con un formato XML específico: bloques `<tool_call>` que anidan `<function=...>` y `<parameter=...>`.
- Razonamiento agéntico multi-paso, entrenado específicamente para entornos de ingeniería de software.
- Generación y modificación de código orientada a resolución de problemas reales de repositorio.
- Capacidades conversacionales multi-turno con formato de chat compatible con endpoints.
- Capacidades multilingües: no disponible (no se especifican idiomas en la model card).

## Casos de uso

- Resolución automática de incidencias de software: el modelo puede recibir el contexto de un issue junto con fragmentos del repositorio y generar un parche candidato, aprovechando su entrenamiento sobre entornos SWE agénticos y su modo de razonamiento explícito para justificar los cambios.
- Agente de refactorización en pipelines de CI/CD: integrado mediante tool calling, puede invocar funciones de lectura de ficheros, ejecución de tests y aplicación de parches dentro de un bucle agéntico controlado por el orquestador.
- Asistente de revisión de código con soporte visual: al aceptar entrada de imagen, puede analizar capturas de errores de compilación, diagramas de arquitectura o resultados de tests renderizados y combinarlos con el contexto textual del repositorio.
- Automatización de tareas de mantenimiento de dependencias: dado su entrenamiento en entornos SWE, puede razonar sobre actualizaciones de paquetes, conflictos de versiones y cambios en ficheros de configuración, invocando herramientas de consulta de registros.
- Despliegue local para desarrollo con privacidad de código: la cuantización Q4_K_M (22,32 GB) permite ejecutar el modelo en una GPU de consumo de gama alta con 24 GB de VRAM, manteniendo el código fuente dentro de la infraestructura del equipo.
- Generación de documentación técnica a partir de código y diagramas: combinando la entrada multimodal con el razonamiento textual, puede producir documentación que referencie tanto el código como las representaciones visuales del sistema.
- Evaluación automatizada de calidad de parches: el modelo puede actuar como revisor en un pipeline que compare parches candidatos, usando el modo `<think>` para exponer el criterio de evaluación antes de emitir el veredicto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: bf16 aproximadamente 69,38 GB; Q8_0 36,91 GB; Q6_K 30,74 GB; Q5_K_M 26,98 GB; Q4_K_M 22,32 GB; IQ4_NL 22,32 GB; Q4_1 21,97 GB. A estas cifras hay que sumar la memoria del fichero mmproj si se usa entrada de imagen y la memoria de la caché KV según la longitud de contexto.
- GPU recomendadas: A100 80 GB o H100 para bf16 y Q8_0; A100 40 GB, L40S o RTX 6000 Ada para Q6_K y Q5_K_M; RTX 4090 (24 GB) para Q4_K_M, IQ4_NL y Q4_1.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con cuantizaciones de 4 bits; en GPUs de 16 GB no cabe la totalidad de los pesos y requeriría offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (versión b11969 o superior, usada para la cuantización), Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints tipo OpenAI.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 3B parámetros activos, el coste por token debería ser sustancialmente menor que el de un modelo denso de 35B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|---|
| Logics-SWE-Qwen3.6-35B-A3B (esta ficha) | 35B | aproximadamente 3B | no disponible | Apache 2.0 | GGUF | SWE agéntico multimodal |
| Qwen3.6-35B-A3B (base) | 35B | aproximadamente 3B | no disponible | no disponible | safetensors/GGUF | Generalista multimodal |
| Alternativas SWE de 30-35B densas | 30-35B | 30-35B (densas) | no disponible | variable | variable | Código generalista |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; la model card no documenta sesgos específicos del afinado SWE ni de la base Qwen3.6.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente en tareas de código donde puede generar APIs, funciones o rutas de fichero inexistentes; el modo `<think>` no elimina este riesgo.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada en la información disponible y los idiomas soportados no se especifican, por lo que no puede garantizarse un comportamiento óptimo fuera del inglés técnico.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene verificar la licencia del modelo base original en el repositorio de Logics-MLLM.
- El formato de tool calling es específico (XML con `<tool_call>` y `<function=...>`) y requiere que el orquestador lo respete estrictamente; un parser genérico de JSON no funcionará sin adaptación.
- La entrada de imagen requiere el fichero mmproj correspondiente, que debe descargarse por separado y no está incluido en los ficheros GGUF principales.
- El tamaño del repositorio (568,4 GB) implica que la descarga completa de todas las cuantizaciones es inviable en la mayoría de entornos; debe seleccionarse un único fichero.
- No se han publicado métricas de rendimiento en tareas SWE (por ejemplo, resolución de issues en SWE-bench), por lo que la calidad real del afinado no puede verificarse con datos objetivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-GGUF
- Modelo base original: https://huggingface.co/Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/Logics-MLLM/Logics-SWE-Env-2.5K
- llama.cpp release b11969: https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp

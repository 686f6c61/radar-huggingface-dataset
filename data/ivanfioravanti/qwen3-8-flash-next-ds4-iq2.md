# ivanfioravanti/Qwen3.8-Flash-Next-DS4-IQ2

## Resumen

Qwen3.8-Flash-Next-DS4-IQ2 es una cuantización mixta del modelo multimodal Qwen3.8-Flash-Next, desarrollada por ivanfioravanti para el runtime DS4 Metal, orientada a Apple Silicon. El modelo base, creado por QwenLM, es un MoE de 128.350 millones de parámetros con 6.000 millones activos por token, basado en la arquitectura que servirá de base para la familia Qwen4. Esta versión cuantizada reduce el peso a 50,34 GB e incluye un bloque MTP para decodificación especulativa, aunque requiere un sidecar PLE externo de aproximadamente 32 GB. Es relevante porque permite ejecutar un modelo de gran tamaño en hardware de Apple con memoria unificada, como un Mac de 64 GB, y sirve como demostrador tecnológico de la arquitectura Qwen4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (Mixture of Experts), basada en la arquitectura Qwen4 preview |
| Parametros totales | 128.350.804.608 (128,35 B) |
| Parametros activos | 6 B por token |
| Longitud de contexto | no disponible (probado a 32K y 64K) |
| Tipos de cuantizacion | IQ2_XXS, MXFP4, Q8_0, Q4_1 (PLE), Q8_0 (encoder de vision) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (DS4-targeted qwen4exp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal de 128,35 B parámetros totales con 6 B activos por token. Según la documentación de QwenLM, incorpora 51 B de embeddings de n-gramas y reduce el coste de entrenamiento a aproximadamente un noveno del de Qwen3.7-Plus, manteniendo o mejorando capacidades en tareas de código y ofimática. La arquitectura introduce nuevos mecanismos de atención y patrones de sparsity que anticipan la familia Qwen4, por lo que funciona como demostrador tecnológico.

La cuantización IQ2 aplica una receta mixta: los tensores gate/up de los 96 expertos del trunk se codifican en IQ2_XXS con calibración imatrix directamente desde BF16; las proyecciones down de los expertos van en MXFP4; los componentes densos (GDN/QSA, shared experts y output) en Q8_0; y embeddings, routers, normas y control en alta precisión. El bloque MTP se mantiene en Q4 y se añade un sidecar PLE externo en Q4_1. La calibración usa el imatrix de Unsloth con un dataset de 45 chunks de 18.432 tokens. Todos los 1.255 tensores de salida fueron verificados por hash.

## Capacidades

- Generación de texto y razonamiento con contexto largo (probado a 32K y 64K).
- Multimodalidad: soporta entrada de imagen mediante encoder opcional Q8_0 (OCR, diagramas, relaciones espaciales, capturas de pantalla, reconocimiento de fotos).
- Decodificación especulativa mediante bloque MTP integrado, con modo `--mtp-exact-sampling` para preservar la distribución de muestreo.
- Optimizado para tareas de código y ofimática según la descripción del modelo base.
- Ejecución en Apple Metal a través del runtime DS4.
- No se ha confirmado soporte de tool calling, agentes ni idiomas específicos en la información disponible.

## Casos de uso

- Análisis de documentos con visión en Mac: el modelo puede procesar imágenes (OCR, diagramas, capturas) gracias al encoder de visión opcional Q8_0, ideal para extraer información de documentos escaneados en local.
- Asistente de ofimática en Apple Silicon: el modelo base está optimizado para tareas de oficina, y esta cuantización permite ejecutarlo en un Mac de 64 GB, manteniendo la privacidad de los datos.
- Generación de código con contexto largo: con ventanas de 32K o 64K, puede trabajar con repositorios o archivos extensos, generando o refactorizando código en un entorno local.
- Inferencia especulativa para mayor velocidad: el bloque MTP permite aceptar múltiples tokens por paso (88,9% de aceptación en una prueba), reduciendo la latencia en cargas de trabajo de generación larga.
- Prototipado de arquitectura Qwen4: al ser un demostrador tecnológico, es útil para desarrolladores que quieran evaluar el rendimiento de los mecanismos de atención y sparsity de la futura familia Qwen4.
- Despliegue en servidores Apple con DS4: el runtime DS4 Metal y el formato GGUF permiten montar un endpoint compatible con API en un cluster de Macs, con soporte de imagen en peticiones server.

## Benchmarks y rendimiento

La model card incluye resultados de una suite interna de 50 casos (`ds4-eval --suite hard`) a 32K de contexto, temperatura 0, semilla 123:

| Recipe | Passed | Wrong | Incomplete | BF16 top-1 agreement | Target NLL |
|---|---|---|---:|---:|---:|---:|
| IQ2_XXS imatrix | 36/50 | 3 | 11 | 91,32% | 0,27828 |
| Q4_K imatrix | 35/50 | 2 | 13 | 96,57% | 0,21287 |
| Q4_0 routed | 35/50 | 0 | 15 | 96,52% | 0,20959 |
| Q8 experts | 34/50 | 2 | 14 | 98,48% | 0,19828 |

También se superaron 6/6 casos de humo de visión (OCR, diagramas, relaciones espaciales, capturas, reconocimiento de fotos y comprobación de premisa no relacionada). No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo principal ocupa 50.343.093.376 bytes (50,34 GB) incluyendo MTP.
- El sidecar PLE Q4_1 requiere aproximadamente 32 GB en disco, preferiblemente en SSD rápido. Sus páginas demand-paged consumen memoria RAM cuando están residentes; no es almacenamiento de RAM cero.
- A 64K de contexto con prefill de 1.024 tokens, el tamaño del modelo más los tensores Metal rastreados suma 53,48 GB. Este es un presupuesto parcial: las páginas PLE residentes, otras asignaciones del host/driver y el sistema operativo son adicionales.
- Probado en un M3 Ultra con 512 GiB. Se buscan pruebas en Macs de 64 GB, pero no es un ajuste confirmado.
- Velocidad medida: 47,88 tokens/s a 32K y 47,49 tokens/s a 64K para 128 tokens generados en el M3 Ultra. No son mediciones de un Mac de 64 GB.
- Despliegue: exclusivamente con DS4 Metal (repositorio ds4-metal, rama qwen3.8-flash-next). No se reivindica compatibilidad con otros runners como llama.cpp o vLLM.
- El encoder de visión opcional añade 0,617 GB y requiere asignaciones adicionales en runtime.

## Comparativa con modelos similares

La comparación disponible es entre las distintas recetas de cuantización del mismo modelo base (todas para DS4 Metal):

| Cuantización | Tamaño aprox. | Passed (suite hard) | BF16 agreement | NLL |
|---|---|---|---:|---:|---:|
| IQ2_XXS imatrix (esta) | 50,34 GB | 36/50 | 91,32% | 0,27828 |
| Q4_K imatrix | no disponible | 35/50 | 96,57% | 0,21287 |
| Q4_0 routed | no disponible | 35/50 | 96,52% | 0,20959 |
| Q8 experts | no disponible | 34/50 | 98,48% | 0,19828 |

No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada. La IQ2 consigue una puntuación similar en la suite hard, pero el drift de probabilidad es sustancialmente mayor, por lo que no establece una calidad igual o superior.

## Limitaciones y advertencias

- No es Qwen4, sino un demostrador tecnológico de la arquitectura que anticipa Qwen4; algunas características pueden cambiar en la versión final.
- La compatibilidad se limita al runtime DS4 Metal; no se garantiza que funcione en otros runners GGUF.
- Requiere un sidecar PLE externo de ~32 GB que debe descargarse por separado y que consume memoria cuando está residente.
- La cuantización IQ2 presenta un drift de probabilidad mucho mayor que Q4_K o Q8; los resultados de la suite hard no deben interpretarse como una calidad equivalente.
- El ajuste en un Mac de 64 GB es candidato, no confirmado; puede haber presión de memoria y swap, especialmente con contexto de 64K o con el encoder de visión activado.
- La licencia qwen-community-1.0 debe revisarse para determinar las restricciones de uso comercial.
- No se han publicado datos de idiomas soportados, tool calling ni benchmarks estándar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-IQ2
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de DS4 Metal: https://github.com/ivanfioravanti/ds4-metal/tree/qwen3.8-flash-next
- Liberación Q4 (sidecar PLE): https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4
- Guía de arquitectura Qwen4: https://aireiter.com/blog/qwen3-8-flash-next-guide
- GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Imatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF

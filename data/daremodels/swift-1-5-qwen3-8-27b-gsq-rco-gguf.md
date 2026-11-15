# DareModels/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B GSQ-RCO es una coleccion de cuantizaciones GGUF de precision mixta del modelo Swift 1.5 Qwen3.8-27B, desarrollado por UkisAI y distribuido en este repositorio por DareModels. El modelo base es un transformer de 26.896 millones de parametros (aproximadamente 27B) construido sobre la familia Qwen3.8, afinado mediante post-entrenamiento orientado a tareas agenticas de horizonte largo y generacion de codigo. Este repositorio concreto no contiene el modelo original, sino cuatro perfiles de cuantizacion (IQ2_XS, IQ2_S, IQ3_XXS e IQ3_S) generados con las asignaciones por tensor de la release GSQ-RCO de ISTA-DASLab y refinados especificamente para Swift.

La relevancia de esta publicacion reside en dos factores. Por un lado, el modelo base incorpora una optimizacion de "thinking" que reduce el numero de tokens de razonamiento en un 58,5% manteniendo una puntuacion un 0,35% superior al modelo de referencia, lo que se traduce en una aceleracion de hasta 9,18x en varias tareas. Por otro, las cuantizaciones permiten ejecutar un modelo de 27B en hardware de consumo: el tier mas agresivo ocupa 8,42 GB y el mas conservador 11,77 GB, con variantes opcionales que anaden una cabeza MTP (multi-token prediction) para decodificacion especulativa.

La licencia es propietaria (swift-open-license-1.0), no open source en sentido estricto, y el acceso al repositorio esta restringido. La informacion publica disponible no incluye los benchmarks de tarea del modelo base, solo mediciones de divergencia KL de las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con cabeza MTP opcional |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificacion oficial; el ejemplo de uso emplea `-c 262144` (256K) |
| Tipos de cuantizacion | GGUF de precision mixta: IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S (con y sin cabeza MTP) |
| Idiomas soportados | no disponible (la evaluacion KLD cubre aleman, frances, espanol y chino) |
| Licencia | swift-open-license-1.0 (propietaria, acceso restringido) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 27B parametros perteneciente a la familia Qwen3.8. Swift 1.5 se construye sobre Swift 1.0 mediante una fase de post-entrenamiento centrada en tareas agenticas de horizonte largo y generacion de codigo, con el objetivo explicito de reducir el consumo de tokens de razonamiento sin degradar la calidad. Segun la model card, esta version emplea un 58,5% menos de tokens de "thinking" que el modelo de referencia y obtiene una puntuacion un 0,35% superior, lo que produce una aceleracion de 9,18x en varias tareas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica de este repositorio es el procedimiento de cuantizacion. Se reutilizan las asignaciones de precision por tensor de la release GSQ-RCO de ISTA-DASLab para Qwen3.8-27B y se refinan especificamente para Swift, generando archivos GGUF de precision mixta (no un tipo uniforme por tensor). Las variantes `-mtp` conservan los tensores refinados y anaden una cabeza de prediccion multi-token que requiere un runtime con soporte para la implementacion MTP de este modelo; su velocidad y calidad de decodificacion no han sido evaluadas de forma separada.

## Capacidades

- Generacion de texto conversacional en formato multi-turno.
- Razonamiento con modo "thinking" eficiente en tokens (reduccion del 58,5% frente al base).
- Generacion de codigo, con post-entrenamiento especifico para tareas de programacion.
- Tareas agenticas de horizonte largo y razonamiento multi-paso.
- Capacidades multilingues: la evaluacion KLD incluye aleman, frances, espanol y chino, aunque no se publica una lista oficial de idiomas soportados.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de decodificacion especulativa mediante la cabeza MTP opcional.
- Vision: no verificada para esta release; no se incluye proyector ni ejemplo validado.

## Casos de uso

- Asistencia de codigo en local: con cuantizaciones de 8,4 a 11,8 GB, el modelo puede ejecutarse en una GPU de consumo o en CPU con llama.cpp para autocompletado y generacion de funciones en entornos sin acceso a la nube.
- Agentes autonomos de multiples pasos: el post-entrenamiento en tareas agenticas de horizonte largo y la reduccion de tokens de razonamiento lo hacen adecuado para bucles de planificacion y ejecucion de herramientas donde el coste por token importa.
- Despliegue en servidor con llama-server: el ejemplo oficial levanta un endpoint compatible con la API de OpenAI en el puerto 8000, lo que permite integrarlo en aplicaciones existentes sin cambios de cliente.
- Procesamiento de documentos largos: el ejemplo de uso configura 262.144 tokens de contexto, adecuado para analisis de repositorios o expedientes extensos, siempre que la memoria disponible lo permita.
- Razonamiento matematico y textual: la evaluacion KLD sobre GSM8K y C4 sugiere que la distribucion de salida se mantiene proxima a la del modelo BF16 en estos dominios, lo que respalda su uso en tareas de resolucion de problemas.
- Experimentacion en investigacion: las tablas de KLD por dominio e idioma permiten comparar el impacto de cada tier de cuantizacion antes de elegir uno para produccion.
- Inferencia acelerada con MTP: en runtimes compatibles, las variantes `-mtp` permiten decodificacion especulativa para reducir latencia en generacion interactiva.

## Benchmarks y rendimiento

La informacion disponible solo incluye mediciones de divergencia KL (KLD) de las cuantizaciones respecto a Swift 1.5 BF16, no resultados de benchmarks de tarea. KLD mas bajo es mejor. Las mediciones de desarrollo usan `wiki.test.raw` con 100 fragmentos y contexto de 512 tokens.

| Tier | Tamano estandar (GB) | Tamano con MTP (GB) | KLD desarrollo |
|---|---:|---:|---:|
| IQ2_XS | 8,42 | 8,77 | 0,189979 |
| IQ2_S | 9,26 | 9,61 | 0,134751 |
| IQ3_XXS | 10,09 | 10,44 | 0,097774 |
| IQ3_S | 11,77 | 12,12 | 0,051265 |

Resultados en datos retenidos (contexto 512):

| Texto retenido | IQ2_XS | IQ2_S | IQ3_XXS | IQ3_S |
|---|---:|---:|---:|---:|
| Prosa C4 | 0,161594 | 0,107438 | 0,080238 | 0,041748 |
| Codigo CodeParrot | 0,120884 | 0,084739 | 0,062546 | 0,035447 |
| Texto matematico GSM8K | 0,117467 | 0,096348 | 0,075964 | 0,043916 |
| Aleman | 0,124482 | 0,091422 | 0,074645 | 0,035698 |
| Frances | 0,166785 | 0,113277 | 0,077791 | 0,046219 |
| Espanol | 0,082313 | 0,056393 | 0,039906 | 0,024186 |
| Chino | 0,207063 | 0,129485 | 0,103141 | 0,052241 |

Los cuatro archivos refinados mejoran la KLD respecto a sus cuantizaciones Swift de partida en los siete dominios. No son uniformemente mejores que las cuantizaciones de comparacion de ISTA: la KLD en texto matematico es un 4,9-7,7% superior, e IQ3_S es peor en cinco de siete dominios. Las comparaciones con ISTA miden cada cuantizacion contra su propio modelo BF16, por lo que no constituyen un ranking directo Swift frente a Qwen.

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 8,42 GB (IQ2_XS) y 11,77 GB (IQ3_S) solo para los pesos; hay que anadir la cache de contexto y los buffers de computo, por lo que en la practica se recomienda al menos 12-16 GB para IQ3_S con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB) ejecuta cualquiera de los cuatro tiers con contexto amplio; RTX 3090 y RTX 4080 (16 GB) son suficientes para los tiers IQ2 e IQ3_XXS; GPUs de 12 GB pueden alojar IQ2_XS e IQ2_S con contexto limitado.
- Cabe en GPU de consumo: si, en todas las variantes, siempre que se ajuste el tamano de contexto a la memoria disponible.
- Opciones de despliegue: llama.cpp (requiere una build con soporte para Qwen3.8), `llama-server` con `--jinja -fa on`; compatible con endpoints. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La reduccion del 58,5% en tokens de pensamiento y la aceleracion de 9,18x descritas corresponden al modelo base, no a estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B GSQ-RCO (este) | aproximadamente 27B | no disponible oficialmente | GGUF IQ2-IQ3, 8,4-11,8 GB | swift-open-license-1.0 (propietaria) | acceso restringido |
| Swift 1.5 Qwen3.8-27B BF16 | aproximadamente 27B | no disponible | BF16 | swift-open-license-1.0 | acceso restringido |
| Qwen3.8-27B GSQ-RCO (ISTA-DASLab) | aproximadamente 27B | no disponible | GGUF GSQ-RCO | no disponible | publico |
| Swift 1.5 Qwen3.8-27B GGUF estandar (UkisAI) | aproximadamente 27B | no disponible | GGUF estandar | swift-open-license-1.0 | acceso restringido |

No se dispone de datos de rendimiento de tarea para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia propietaria: swift-open-license-1.0 no es una licencia open source; es necesario revisar el texto completo antes de cualquier uso comercial o redistribucion.
- Acceso restringido: el repositorio esta marcado como privado y requiere una cuenta con permiso concedido para descargar los archivos.
- Riesgo de alucinacion: inherente a los modelos generativos; no se publican evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos ni se detalla la composicion del dataset de entrenamiento.
- Limitaciones de contexto: las mediciones KLD se realizaron a 512 tokens y no establecen la calidad a 32K o contextos mayores; el ajuste de 262.144 tokens del ejemplo no implica que las cuantizaciones hayan sido evaluadas a esa longitud.
- Idiomas: no hay lista oficial de idiomas soportados; la cobertura multilingue solo puede inferirse de la evaluacion KLD (aleman, frances, espanol, chino).
- Cabeza MTP: las variantes `-mtp` requieren un runtime con soporte especifico y su velocidad y calidad no han sido evaluadas.
- Vision no verificada: no se incluye proyector ni ejemplo validado para esta release.
- Calidad de cuantizacion: los tests de KLD no prueban ausencia de sobreajuste; el cribado de solapamiento lexico aplicado no equivale a deduplicacion semantica.
- Runtime: es necesaria una build de llama.cpp que soporte Qwen3.8; versiones anteriores pueden fallar al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DareModels/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- GGUFs estandar de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Cuantizaciones GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/LICENSE
- Web de UkisAI: https://ukisai.com
- Pagina de producto Swift: https://ukisai.com/products/swift
- Manifiesto de release: release-manifest.json (en el repositorio)
- Sumas de verificacion: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Tabla completa de resultados KLD: evaluation/heldout-kld.tsv (en el repositorio)
- Metadatos de evaluacion: evaluation/report.json (en el repositorio)
- Paper referenciado: arxiv:2604.18556
- Paper referenciado: arxiv:2605.00649

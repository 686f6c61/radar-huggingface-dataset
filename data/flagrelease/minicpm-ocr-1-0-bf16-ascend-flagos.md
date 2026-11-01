# FlagRelease/MiniCPM-OCR-1.0-BF16-ascend-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en análisis de documentos y reconocimiento óptico de caracteres (OCR) desarrollado por ModelBest en colaboración con OpenBMB. Con 1.300 millones de parámetros, está diseñado para escenarios reales de digitalización documental: escaneos, fotografías, páginas curvadas y pantallas re-fotografiadas, con soporte para extracción de texto, fórmulas y tablas complejas, así como extracción de información clave.

El modelo forma parte de la serie MiniCPM-OCR, que incluye también la variante MiniCPM-OCR Jev (2B), concebida como un "inspector de calidad" que puntúa la fiabilidad de los resultados de OCR. La versión publicada en este repositorio es una adaptación del modelo original a hardware Huawei Ascend mediante el stack de software FlagOS, que ofrece soporte multi-chip Day-0 en 12 plataformas distintas.

La relevancia de esta ficha radica en que se trata de una build específica para Ascend (formato BF16), no del modelo original en formato estándar. Esto implica que los pesos están optimizados para su despliegue en entornos con aceleradores Ascend y el runtime SGLang-FL, lo que condiciona su portabilidad a otras plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo especializado en OCR y parsing documental) |
| Parametros totales | 1.300.434.160 (~1.3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en este repo); no se detallan otras variantes |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card lo describe como un modelo especializado en parsing documental y reconocimiento de texto, con capacidad para procesar texto, formulas y tablas complejas, ademas de extraccion de informacion clave. El tamano de 1.3B parametros lo situa en la categoria de modelos ligeros, disenados para despliegue eficiente en produccion.

El entrenamiento incluye una fase de RL (se observa la referencia a "merge_rl_mergedp1" en las rutas del contenedor), lo que sugiere optimizacion mediante aprendizaje por refuerzo. El modelo incorpora una innovacion destacable: la decodificacion acelerada DSpark, que segun la model card mejora la eficiencia de procesamiento extremo a extremo en un 55%. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Reconocimiento optico de caracteres (OCR) en documentos escaneados, fotografias, paginas curvadas y pantallas re-fotografiadas.
- Parsing de texto estructurado y no estructurado.
- Reconocimiento y conversion de formulas matematicas.
- Parsing de tablas complejas.
- Extraccion de informacion clave (key information extraction) de documentos.
- Procesamiento bilingue chino-ingles.
- Decodificacion acelerada mediante DSpark para mejorar el throughput.
- No se documenta soporte de tool calling, function calling, agentes ni vision mas alla del OCR.

## Casos de uso

- Digitalizacion masiva de archivos: el modelo puede procesar lotes de documentos escaneados y extraer texto, tablas y formulas de forma automatica, adecuado por su tamano ligero (1.3B) que permite alto throughput en servidores Ascend.
- Facturacion y contabilidad automatizada: extraccion de campos clave (importes, fechas, numeros de factura) de facturas y recibos fotografiados, gracias a su capacidad de key information extraction.
- Gestion documental empresarial: conversion de contratos e informes en PDF escaneados a texto estructurado para su indexacion en sistemas de busqueda o RAG.
- Procesamiento de documentacion cientifica y tecnica: reconocimiento de formulas matematicas y tablas complejas en papers y manuales, preservando la estructura del contenido.
- Digitalizacion de patrimonio documental: manejo de paginas curvadas y documentos antiguos fotografiados, escenario para el que el modelo declara estar especificamente disenado.
- Control de calidad de pipelines OCR: combinado con MiniCPM-OCR Jev como inspector de fiabilidad, permite marcar contenido que requiere revision humana en flujos de produccion.
- Despliegue en entornos Ascend: al estar empaquetado con FlagOS y una imagen Docker preconfigurada, es adecuado para organizaciones con infraestructura Huawei Ascend que necesiten un OCR listo para produccion en minutos.

## Benchmarks y rendimiento

| Metrica | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Ascend-FlagOS |
|---|---|---|
| OcrBench | 80.5 | 80.6 |
| omni_doc_bench_v1_6 | 96.4585 | 96.4263 |

Segun la model card, el modelo alcanza 93.68 en Real5-OmniDocBench. La build FlagOS en Ascend logra hasta 1.69x el throughput nativo P50 por unidad de computo pico en la misma plataforma. No se proporcionan resultados de MMLU, HumanEval ni GSM8K, que quedan fuera del ambito de este modelo especializado.

## Requisitos de hardware

- VRAM estimada: con 1.3B parametros en BF16, los pesos ocupan aproximadamente 2.6 GB; se requiere memoria adicional para activaciones y cache KV, estimada en torno a 4-8 GB en funcion de la longitud de contexto y el tamano de lote.
- GPU recomendadas: el modelo esta adaptado y validado para Huawei Ascend (imagen Docker con CANN 8.5.0 y runtime SGLang-FL 0.1.0). La version original es compatible con NVIDIA.
- Cabe en GPU consumer: si, por el tamano de 1.3B es viable en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090), aunque esta build concreta esta orientada a Ascend.
- Opciones de despliegue: SGLang (version 0.5.11 con extension FL 0.1.0) mediante la imagen Docker oficial; no se documenta soporte de vLLM, llama.cpp u Ollama para esta build.
- Latencia: no disponible para esta build; la model card menciona que la variante Jev (2B) completa una evaluacion de bloque de pagina en 1.20 s de media usando solo CPU M5 en dispositivos ARM edge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (esta ficha) | 1.3B | no disponible | Real5-OmniDocBench 93.68; OcrBench 80.6 | Apache 2.0 | HuggingFace (build Ascend FlagOS) |
| MiniCPM-OCR Jev | 2B | no disponible | AUROC JevOCRBench 0.936 | no disponible | no disponible |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | AUROC JevOCRBench 0.938 | no disponible | no disponible |

La comparativa con Qwen3.5-397B-A17B se refiere unicamente a la tarea de inspeccion de calidad (JevOCRBench), no al OCR directo. No se dispone de datos de otros modelos OCR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta chino e ingles; no se documenta cobertura de otros idiomas.
- Es una build especifica para hardware Ascend con FlagOS; los pesos pueden no ser directamente utilizables en otras plataformas sin conversion.
- No se dispone de informacion sobre sesgos conocidos ni tasas de alucinacion.
- La longitud de contexto no esta documentada, lo que limita la planificacion de cargas con documentos muy extensos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo original de ModelBest/OpenBMB.
- El modelo esta especializado en OCR y parsing documental; no es adecuado para tareas generales de generacion de texto, razonamiento o codigo.
- El numero de descargas (8) y likes (0) sugiere que es una publicacion reciente con validacion comunitaria limitada.
- La imagen Docker y el stack FlagOS anaden complejidad operativa frente a un despliegue estandar.

## Enlaces

- [HuggingFace: FlagRelease/MiniCPM-OCR-1.0-BF16-ascend-FlagOS](https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-ascend-FlagOS)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.

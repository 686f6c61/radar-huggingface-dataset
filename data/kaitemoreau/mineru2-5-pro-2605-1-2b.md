# kaitemoreau/MinerU2.5-Pro-2605-1.2B

## Resumen

MinerU2.5-Pro-2605-1.2B es un modelo multimodal de tipo image-text-to-text especializado en el parseo de documentos a escala, desarrollado por el equipo OpenDataLab (publicado en Hugging Face bajo el perfil kaitemoreau). Su funcion principal es convertir imagenes de documentos —paginas de PDF, capturas, formularios, graficos y diagramas— en representaciones estructuradas, resolviendo el problema del parsing documental de alta fidelidad sin depender de pipelines OCR fragmentados. La version 2605 es una actualizacion de la 2604 que corrige errores de clasificacion en la deteccion de layout y amplia la capacidad de analisis de imagenes (graficos, diagramas de flujo y sellos).

El modelo emplea una arquitectura Qwen2-VL (segun el tag `qwen2_vl` de Hugging Face) con aproximadamente 1.156 millones de parametros totales, lo que lo situa en la categoria de modelos pequenos y desplegables en hardware de consumo. El repositorio ocupa 2,3 GB en formato safetensors y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Soporta chino e ingles como idiomas declarados.

Su relevancia actual radica en que aborda una tarea de infraestructura —la extraccion estructurada de documentos— con un modelo compacto y de licencia permisiva, lo que facilita su integracion en pipelines de ingestion de datos, RAG sobre documentos y digitalizacion masiva de archivos. La model card lo presenta como un avance en "data-centric document parsing at scale", con un informe tecnico asociado (arXiv:2604.04771).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal vision-language) |
| Parametros totales | 1.156.026.624 (~1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen2-VL, una arquitectura transformer multimodal que combina un codificador visual con un decodificador de lenguaje para tareas de image-text-to-text. Con 1,2B parametros, el modelo esta disenado para ser compacto y eficiente en inferencia, priorizando el rendimiento en parsing documental sobre capacidades generativas generales. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La informacion disponible indica que la version 2605 incorpora dos mejoras principales sobre la 2604: (1) un proceso exhaustivo de limpieza de datos para reducir errores de clasificacion en la deteccion de layout, con especial enfasis en disminuir la tasa de falsos negativos de la categoria `image_block`; y (2) la construccion de un dataset de entrenamiento a gran escala para analisis de imagenes, que mejora el reconocimiento de graficos, diagramas de flujo y sellos. No se especifican innovaciones arquitectonicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Parsing de documentos: conversion de imagenes de documentos (PDF, capturas, formularios) en representaciones estructuradas.
- Deteccion de layout: identificacion y clasificacion de bloques de contenido (texto, imagenes, tablas) dentro de una pagina, con mejoras en la version 2605 para reducir errores de categoria.
- Analisis de imagenes: reconocimiento de graficos, diagramas de flujo y sellos, ampliado en la version 2605.
- Generacion de texto e image-text-to-text: pipeline declarado en Hugging Face.
- Soporte conversacional: tag `conversational` en Hugging Face.
- Capacidades multilingues limitadas a chino e ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): vision confirmada; thinking mode y audio no disponibles.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo puede procesar imagenes de paginas y extraer bloques de texto, tablas e imagenes de forma estructurada, lo que permite convertir grandes volumenes de documentos en datos indexables. Su tamano de 1,2B facilita el despliegue en lote sobre GPU de consumo.
- Construccion de pipelines RAG sobre documentos: al parsear documentos a texto estructurado, el modelo alimenta bases de conocimiento para sistemas de recuperacion aumentada. La deteccion de layout mejorada en la version 2605 reduce la perdida de informacion en tablas y figuras.
- Extraccion de datos de formularios y facturas: la capacidad de image-text-to-text permite identificar campos y valores en documentos escaneados, adecuada para automatizacion contable y administrativa.
- Analisis de graficos y diagramas de flujo: la version 2605 incorpora un dataset especifico para reconocer charts, flowcharts y sellos, lo que habilita la extraccion de informacion de figuras tecnicas y reportes visuales.
- Procesamiento de documentacion tecnica y cientifica: el modelo puede estructurar articulos, manuales y papers con mezcla de texto, tablas e imagenes, facilitando su indexacion y busqueda.
- Moderacion y clasificacion de contenido documental: la deteccion de layout y la clasificacion de bloques permiten filtrar o etiquetar documentos segun su estructura, util en archivos corporativos y cumplimiento normativo.
- Preprocesamiento para OCR de alta fidelidad: al identificar regiones y tipos de bloque, el modelo puede orquestar pipelines OCR especializados por region, mejorando la precision global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de leaderboard (`leaderboard.png`) pero no se proporcionan los valores numericos en el texto accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,2B parametros en precision FP16, se requieren aproximadamente 2,4-3 GB de VRAM para los pesos, mas overhead de activaciones y cache KV (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es compatible con GPU de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores.
- Cabe en consumer GPU: si, por el tamano de 1,2B parametros y el repo de 2,3 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Otras opciones como vLLM, llama.cpp u Ollama no estan confirmadas en la informacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MinerU2.5-Pro-2605-1.2B | ~1,2B | no disponible | Apache 2.0 | Parsing documental multimodal |
| Alternativas de parsing documental | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se han facilitado datos de rendimiento ni especificaciones de alternativas de la misma categoria.

## Limitaciones y advertencias

- Idiomas limitados: solo chino e ingles declarados; el rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no documentado en la model card; como modelo generativo, existe riesgo inherente en la extraccion de texto.
- Limitaciones de contexto: la longitud de contexto no esta especificada, lo que impide evaluar el manejo de documentos muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las dependencias y el codigo asociado.
- Caveats para produccion: el modelo tiene 0 descargas y 0 likes en Hugging Face en la fecha de consulta, lo que sugiere falta de validacion comunitaria. La fecha de creacion (2026-11-15) y el numero de arXiv (2604.04771) deben verificarse antes de adoptarlo en entornos criticos.
- No se especifican tecnicas de cuantizacion soportadas, lo que limita la planificacion de despliegue en hardware restringido.

## Enlaces

- Hugging Face: https://huggingface.co/kaitemoreau/MinerU2.5-Pro-2605-1.2B
- Hugging Face (OpenDataLab): https://huggingface.co/opendatalab/MinerU2.5-Pro-2605-1.2B
- ModelScope: https://modelscope.cn/models/OpenDataLab/MinerU2.5-Pro-2605-1.2B
- Informe tecnico (arXiv): https://arxiv.org/abs/2604.04771
- Logo del proyecto: https://hotelll.github.io/MinerU2.5-Pro/MinerU25-Pro-LOGO.png
- Leaderboard (imagen): https://hotelll.github.io/MinerU2.5-Pro/leaderboard.png

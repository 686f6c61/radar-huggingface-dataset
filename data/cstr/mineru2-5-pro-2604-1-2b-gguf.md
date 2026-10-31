# cstr/MinerU2.5-Pro-2604-1.2B-GGUF

## Resumen

MinerU2.5-Pro-2604-1.2B-GGUF es una conversión a formato GGUF del modelo MinerU2.5-Pro-2604-1.2B, desarrollado por el equipo MinerU de OpenDataLab y publicada por el usuario cstr para el runtime nativo ggml de CrispEmbed. El modelo base es un modelo vision-language (VL) especializado en análisis y parseo de documentos: OCR, reconocimiento de fórmulas matemáticas, tablas, recibos y estructura de página, generando salida estructurada (por ejemplo, Markdown). Con aproximadamente 1.156 millones de parámetros, pertenece a la familia de arquitecturas Qwen2-VL.

La relevancia de esta conversión radica en permitir ejecutar un modelo de parseo documental de última generación en CPU o en hardware modesto, sin dependencias de Python pesadas, gracias al runtime nativo de CrispEmbed. El editor ha verificado la paridad exacta de tokens generados (greedy, CPU) entre la conversión y el modelo original de Python en 8 casos de prueba congelados, tanto en F16 como en Q8_0, lo que garantiza resultados idénticos al modelo de referencia.

Cabe destacar que se trata de un repositorio derivado: no se ha entrenado ni modificado ningún peso, solo se ha convertido el formato y, en un caso, cuantizado. El soporte en CrispEmbed es experimental y está desactivado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (vision-language transformer) |
| Parametros totales | 1.156.026.624 (1,2B) |
| Parametros activos | no disponible (no se indica si es MoE; todo indica que es denso) |
| Longitud de contexto | 8.192 tokens (limite del perfil de CrispEmbed verificado; el limite nativo del modelo no se especifica) |
| Tipos de cuantizacion | F16 y Q8_0 (torre de vision en F16 en ambos casos) |
| Idiomas soportados | no disponible (los tests de paridad incluyen aleman, japones y arabe) |
| Licencia | Apache License 2.0 |
| Formato de pesos | GGUF (conversion desde safetensors; no compatible con pares mmproj de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer vision-language basado en la arquitectura Qwen2-VL, con una torre de vision (vision encoder) y un decodificador de texto. El modelo original fue entrenado por OpenDataLab para tareas de parseo documental: deteccion de layout, OCR, transcripcion de tablas y formulas, y conversion de paginas a Markdown. Los detalles del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se han publicado en la informacion disponible.

La conversión a GGUF fue realizada con la herramienta propia `crispembed-quantize` a partir de los safetensors de la revision `d3f5e08d073c21466bbabe21c71bb1e9c2e595da`, con verificacion de nombres y formas de tensores. En la variante Q8_0, el decodificador y los embeddings se cuantizan a Q8_0 mientras que la torre de vision se mantiene en F16; segun el editor, cuantizar la vision a Q8_0 degradaba la fidelidad (peor similitud coseno de 0,49 en la etapa CPU), una politica ya aplicada previamente con InternVL2. Todo el proceso esta documentado con hashes SHA256 y un manifiesto de publicacion.

## Capacidades

- Parseo de documentos: conversion de imagenes de pagina a salida estructurada (Markdown) mediante extraccion en dos pasos (`two_step_extract`).
- OCR: reconocimiento de texto en imagenes, incluyendo texto en aleman, japones y arabe segun los casos de prueba de paridad.
- Transcripcion de formulas matematicas (caso `formula` verificado en paridad).
- Reconocimiento de tablas (caso `table` verificado).
- Extraccion de datos de recibos (caso `receipt` verificado).
- Analisis de layout de pagina, incluyendo paginas rotadas 90 grados (`layout-rot90`).
- Analisis de imagenes (`image_analysis=True` en la API de CrispEmbed).
- No hay informacion sobre tool calling, agentes ni capacidades de razonamiento general: es un modelo especializado en vision documental, no un chatbot de proposito general.

## Casos de uso

- Digitalizacion de archivos documentales: conversion masiva de documentos escaneados a Markdown searchable en pipelines de ingesta, ejecutando el modelo en CPU sin GPUs dedicadas gracias al formato GGUF.
- Transcripcion de formulas academicas: extraccion de formulas matematicas desde PDFs escaneados para repositorios cientificos, aprovechando el caso `formula` verificado.
- Reconocimiento de tablas en informes: conversion de tablas complejas en documentos a formatos estructurados para analisis de datos.
- Procesamiento de recibos y facturas: extraccion de campos de recibos digitalizados para automatizacion contable, con salida token-exacta respecto al modelo original.
- OCR multilingue: reconocimiento de texto en documentos en aleman, japones o arabe dentro de flujos de indexacion documental.
- Analisis de layout con paginas rotadas: procesamiento de documentos escaneados con orientacion incorrecta (rotacion de 90 grados) sin preprocesamiento externo.
- Integracion en aplicaciones nativas: despliegue embebido via CrispEmbed sin runtime de Python, util para herramientas de escritorio o entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento publicado es la verificacion de paridad: F16 y Q8_0 reproducen exactamente los token IDs del modelo original de Python (CPU, greedy) en 8 casos congelados (formula: 29 tokens, table: 140, receipt: 202, german: 389, japanese: 37, arabic: 7, layout-page: 199, layout-rot90: 44). No se han verificado backends de GPU, documentos multipagina ni benchmarks agregados de documentos.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo F16 ocupa 2.591.511.520 bytes (~2,4 GiB) y el Q8_0 1.920.768.000 bytes (~1,8 GiB); a esto hay que sumar la memoria para activaciones y el contexto de hasta 8.192 tokens.
- GPU recomendadas: no disponible; el modelo esta orientado a CPU (la paridad se verifico en CPU), aunque no se descartan backends GPU (no verificados).
- Consumer GPU: por su tamano (~1,8-2,4 GiB de pesos), cabria con holgura en GPUs de consumo tipicas (RTX 3060 de 12 GB, RTX 4090, etc.), pero este uso no esta verificado por el editor.
- Despliegue: exclusivamente via CrispEmbed (runtime ggml nativo), activando la variable `CRISPEMBED_MINERU25_PRO=1` y el flag `--ocr-engine mineru25-pro`. No es compatible con llama.cpp (no son pares mmproj), vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia | Runtime |
|---|---|---|---|---|---|
| MinerU2.5-Pro-2604-1.2B-GGUF | 1,2B | GGUF (F16, Q8_0) | Parseo documental (OCR, tablas, formulas) | Apache 2.0 | CrispEmbed (ggml nativo) |
| MinerU2.5-Pro-2604-1.2B (original) | 1,2B | safetensors | Parseo documental | Apache 2.0 | Python (mineru-vl-utils) |
| InternVL2 (referencia de politica de cuantizacion) | varia | GGUF y otros | Vision-language general | varia | varia |

No hay datos de rendimiento comparativo publicados entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- El soporte en CrispEmbed es experimental y esta desactivado por defecto; hay que activarlo explicitamente con la variable de entorno `CRISPEMBED_MINERU25_PRO=1`.
- Los archivos GGUF no son compatibles con llama.cpp (no son pares mmproj), lo que limita el ecosistema de despliegue al runtime CrispEmbed.
- Solo se ha verificado paridad en CPU con decodificacion greedy; los backends de GPU, documentos multipagina y contextos que excedan los 8.192 tokens no estan verificados.
- La cuantizacion Q8_0 excluye la torre de vision (se mantiene en F16) porque la cuantizacion completa degradaba la fidelidad; esto aumenta el tamano del archivo respecto a una cuantizacion total.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni limitaciones idiomaticas del modelo base; los tests de paridad solo cubren aleman, japones y arabe ademas de casos de layout.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio original no incluia archivo LICENSE ni NOTICE; el editor incluye su propia copia de la licencia de mineru-vl-utils.
- Los datos de benchmarks del modelo base (OpenDataLab) no estan incluidos en esta ficha; consulte el repositorio original para evaluar su calidad en tareas documentales.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/cstr/MinerU2.5-Pro-2604-1.2B-GGUF
- Modelo original: https://huggingface.co/opendatalab/MinerU2.5-Pro-2604-1.2B
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Utilidades MinerU VL (fuente de la licencia): https://github.com/opendatalab/mineru-vl-utils
- Organizacion OpenDataLab: https://huggingface.co/opendatalab

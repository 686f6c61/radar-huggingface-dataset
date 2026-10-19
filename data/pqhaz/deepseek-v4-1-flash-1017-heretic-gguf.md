# pqhaz/DeepSeek-V4.1-Flash-1017-heretic-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-heretic-GGUF es una build GGUF publicada por pqhaz a partir de su ablación de rechazo (heretic) de DeepSeek-V4.1-Flash-1017, modelo desarrollado por DeepSeek. No es una release oficial de DeepSeek: es un derivado comunitario con licencia MIT, orientado a investigación autorizada y al estudio de la ablación de rechazos. El repositorio ocupa 964,9 GB y declara 748.494.684.784 parámetros totales.

La model card confirma expertos enrutados y compartidos, tablas Engram y embeddings; esta build incluye solo el modelo de lenguaje, sin torre de visión ni capas MTP/DSpark. Los expertos enrutados se mantienen en MXFP4 nativo y solo se cuantizan atención, expertos compartidos, tablas Engram y embeddings. No se documentan contexto máximo, parámetros activos ni idiomas. Su relevancia es doble: permite estudiar en abierto una ablación de rechazo de la familia DeepSeek V4.1 y ofrece pesos GGUF `Q8_0`/`Q6_K` para clústeres grandes; a cambio, requiere un fork de llama.cpp y no tiene benchmarks de capacidad publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados y compartidos; detalles de capas y atención no disponibles. Solo modelo de lenguaje, sin torre de visión ni capas MTP/DSpark |
| Parámetros totales | 748.494.684.784 (≈748,5 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible; en las pruebas se sirvió con `-c 16384` |
| Tipos de cuantización | `Q8_0` (10 splits, 508 GB) y `Q6_K` (11 splits, 457 GB); expertos enrutados en MXFP4 nativo |
| Idiomas soportados | no disponibles |
| Licencia | MIT (según la model card de este repositorio) |
| Formato de pesos | GGUF con splits; solo modelo de lenguaje |
| Modelo base | pqhaz/DeepSeek-V4.1-Flash-1017-heretic |
| Modelo original | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Tamaño del repositorio | 964,9 GB |
| Fecha de publicación | 17 de octubre de 2026; actualizado el 18 de octubre de 2026 |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la configuración completa

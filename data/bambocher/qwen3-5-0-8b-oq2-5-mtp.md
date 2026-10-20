# bambocher/Qwen3.5-0.8B-oQ2.5-mtp

## Resumen

Qwen3.5-0.8B-oQ2.5-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen3.5-0.8B, publicado por bambocher. No es un modelo entrenado desde cero: la model card indica que se ha aplicado cuantización mixta con oQ (oMLX v0.7.1rc1) sobre un total de 873.438.784 parámetros. El resultado ocupa 0,498 GiB (0,535 GB) y tiene una media efectiva de 4,897 bits por peso.

El checkpoint incluye tres componentes: el modelo de lenguaje, con 0,752B de pesos lógicos; un módulo de visión, con 0,101B; y una cabeza MTP, con 0,020B. La mayor parte de los pesos lógicos, el 62,127%, se almacena en 2 bits afines con grupo 64, mientras que el resto se reparte entre 4, 5, 6 y 8 bits y BF16.

Su relevancia es práctica: permite probar un modelo multimodal pequeño en Apple Silicon con MLX y un consumo de almacenamiento de unos 0,5 GB. Sin embargo, no se han publicado datos de contexto, idiomas, licencia, benchmarks ni calidad de la cuantización, por lo que debe evaluarse antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (etiqueta del autor); arquitectura interna no detallada; checkpoint MLX cuantizado |
| Parámetros totales | 873.438.784 (0,873B) |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | mixta afín con grupo 64: 2, 4, 5, 6 y 8 bits, más BF16; media efectiva de 4,897 bits/peso |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |
| Tamaño del repositorio | 0,5 GB |
| Componentes | lenguaje 0,752B; visión 0,101B; cabeza MTP 0,020B |
| Descargas | 12 |
| Likes | 0 |
| Fecha de creación | 2026-10-20 |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla si el modelo base usa un transformer denso, una arquitectura MoE o una arquitectura híbrida. La model card solo identifica la arquitectura como qwen3_5 y describe el proceso de cuantización. El checkpoint es una conversión MLX con cuantización mixta de oQ: el 62,127% de los pesos lógicos está en 2 bits, el 21,

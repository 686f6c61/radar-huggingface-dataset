# peonist-ai/halogen-npu-flux2-klein-4b

## Resumen

`peonist-ai/halogen-npu-flux2-klein-4b` es una conversión de FLUX.2-klein-4B, el modelo de difusión de imágenes de Black Forest Labs, para ejecutarse en la NPU Ryzen AI (XDNA2) de AMD Strix Halo dentro de `halogen-flash-server`. No es un modelo de lenguaje ni un modelo autónomo: es un paquete de pesos y programas NPU que solo funciona dentro del contenedor de ese servidor, junto al modelo Flash en la GPU y detrás del mismo puerto.

El problema que resuelve es la ejecución local de generación text-to-image en la NPU de equipos AMD Ryzen AI, sin depender de una GPU dedicada para esta tarea. El servidor expone `/v1/images/generations`, acepta prompts de hasta 512 tokens y devuelve de una a cuatro imágenes PNG en 20 tamaños entre 256x256 y 1024x1024, cuadrados o no.

Es relevante porque permite descargar trabajo de generación de imágenes a la NPU mientras la GPU atiende otras cargas, y porque documenta una conversión a `block floating point` con un decodificador `taef2` en lugar del VAE original de FLUX.2. El repositorio ocupa 16,5 GB y el modelo necesita unos 8 GB de memoria del host junto al modelo Flash.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de imágenes FLUX.2-klein-4B convertido para NPU; la model card no detalla la arquitectura interna (transformer, atención, etc.). |
| Parámetros totales | 4B nominales, según el nombre del modelo base; desglose no disponible. |
| Parámetros activos | No aplica; no se describe como modelo MoE. |
| Longitud de contexto | 512 tokens de prompt (el servidor recorta el prompt); salida de 256x256 a 1024x1024. |
| Tipos de cuantización | `Block floating point` del NPU; no se documentan niveles Q4, Q8, FP16 ni otros. |
| Idiomas soportados | No disponibles. |
| Licencia | Apache-2.0; el decodificador `taef2` se distribuye bajo MIT. |
| Formato de pesos | `.hnpw` de 8,0 GB; programas NPU en `devices/` (155 MB); `tokenizer/` (11 MB); `taef2.safetensors`; repositorio de 16,5 GB. |

## Arquitectura y entrenamiento

La model card indica que se parte de `black-forest-labs/FLUX.2-klein-4B`, revisión `e7b7dc27f91deacad38e78976d1f2b499d76a294`, y que los pesos se convierten al formato numérico y al diseño de la

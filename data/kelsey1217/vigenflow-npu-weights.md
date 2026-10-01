# Kelsey1217/vigenflow-npu-weights

## Resumen

VigenFlow NPU weights es un repositorio de pesos preconvertidos publicado por el usuario Kelsey1217 (el código asociado se desarrolla en github.com/jia1217/vigenflow). No es un modelo entrenado desde cero, sino un conjunto de pesos de tres modelos de difusión texto-a-imagen (FLUX.2-klein-4B, FLUX.1-schnell y Z-Image-Turbo) ya convertidos al formato que leen los kernels de la NPU XDNA2 de los procesadores AMD Ryzen AI de la serie 300. El objetivo es ejecutar estos modelos en la NPU sin necesidad de convertir los pesos tras la descarga.

El repositorio resuelve un problema de despliegue: los pesos de matriz se almacenan en formato de bloque BFP16 (8 valores comparten un exponente) y en el layout de memoria que esperan los kernels de la NPU, de modo que el usuario solo tiene que descargarlos. Incluye tres carpetas independientes con tamaños muy distintos: `flux2_klein_4B/` (797 archivos, 8,0 GiB), `flux1_schnell/` (1950 archivos, 26,6 GiB) y `z_image_turbo/` (1036 archivos, 11,6 GiB), sumando un repositorio de 49,6 GB.

Es relevante ahora porque permite aprovechar aceleración de IA específica (NPU AMD XDNA2) en hardware de PC con Ryzen AI, un segmento en el que la inferencia de modelos de difusión de gran tamaño solía depender de GPU dedicadas o de la CPU. La licencia es Apache 2.0, heredada de los modelos originales de Black Forest Labs y Tongyi-MAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pesos convertidos de tres modelos de difusion texto-a-imagen (FLUX.2-klein-4B, FLUX.1-schnell y Z-Image-Turbo). Arquitectura interna de cada modelo base: no disponible en la informacion proporcionada |
| Parametros totales | FLUX.2-klein-4B: 4.000 millones (segun el nombre del modelo base). FLUX.1-schnell y Z-Image-Turbo: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos de texto a imagen) |
| Tipos de cuantizacion | BFP16 en bloques (8 valores comparten un unico exponente) para los pesos de matriz; tensores almacenados con dtype U8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards `model-0000i-of-0000N.safetensors` mas `model.safetensors.index.json`), formato propio `vgf-npu-weights-1` |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento alguno: son pesos ya entrenados por terceros (Black Forest Labs para los dos FLUX y Tongyi-MAI para Z-Image-Turbo) que se han modificado para su ejecucion en NPU. La conversion aplicada consiste en pasar los pesos al formato BFP16 (bloques de 8 valores que comparten un exponente), reordenarlos al layout de memoria que leen los kernels de la NPU XDNA2 y, en algunos tensores, transponerlos o rellenarlos con ceros. En la model card se indica que cada tensor se guarda como un archivo de tipo U8, con una sola dimension, nombrado segun la ruta relativa del archivo dentro de la carpeta del modelo (por ejemplo, `text_packed_weights/layers_0_mlp_up_proj_weight_BFP.bin`); escribir los bytes de cada tensor en el archivo indicado por su nombre restaura la carpeta original.

El formato se denomina `vgf-npu-weights-1`. Cada carpeta contiene los shards safetensors, un indice `model.safetensors.index.json` y un `prepare_manifest.json` que registra el repositorio y commit de origen y la receta de conversion; esos mismos datos se repiten en los metadatos del indice. Los tres modelos de partida se publican bajo Apache 2.0 y los pesos convertidos se distribuyen bajo la misma licencia.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) mediante los tres modelos incluidos.
- Edicion de imagenes: la model card indica que FLUX.2-klein-4B cubre texto-a-imagen y edicion de imagenes.
- Ejecucion en la NPU AMD XDNA2 de los Ryzen AI serie 300 sin necesidad de reconvertir los pesos tras la descarga.
- Integracion con el stack VigenFlow (servidor y workers), que descarga los pesos en la ruta `all_model_weights/<folder>` mediante `prepare_base.exe`.
- Soporte de tool calling / function calling: no aplica (modelos de imagen).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se documentan en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes local en portatiles con Ryzen AI: el usuario puede producir imagenes texto-a-imagen aprovechando la NPU XDNA2, sin depender de una GPU dedicada, usando los pesos ya preparados para el hardware.
- Edicion de imagenes on-device: con FLUX.2-klein-4B (que cubre edicion) se pueden construir herramientas que modifiquen imagenes localmente, manteniendo los datos en el equipo.
- Prototipado rapido de productos de diseno y marketing: generar variaciones de assets graficos en local para iterar sin coste de API en la nube.
- Aplicaciones de escritorio con IA integrada: plugins o utilidades nativas que invoquen el stack VigenFlow sobre la NPU como backend de generacion.
- Investigacion y evaluacion de kernels para XDNA2: el formato BFP16 y el layout permiten estudiar el rendimiento de los kernels de la NPU en cargas de difusion reales.
- Escenarios con requisitos de privacidad o sin conectividad: al ejecutarse de forma local, es apto para entornos donde no se pueden enviar datos a servicios externos.
- Despliegue en equipos con restricciones de GPU o de consumo: al apoyarse en la NPU, ofrece una via alternativa en máquinas sin tarjeta grafica dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Procesador: AMD Ryzen AI de la serie 300 con NPU XDNA2; el modelo esta especificamente orientado a esa NPU.
- VRAM para inferencia: no aplica en el sentido de VRAM de GPU; el calculo se realiza en la NPU (no se documenta el consumo exacto de memoria compartida).
- GPU recomendadas: ninguna; el diseno esta pensado para ejecucion en NPU, no en GPU.
- Almacenamiento: el repositorio completo ocupa 49,6 GB; por carpeta, FLUX.2-klein-4B 8,0 GiB, FLUX.1-schnell 26,6 GiB y Z-Image-Turbo 11,6 GiB.
- Opciones de despliegue: stack VigenFlow (servidor y workers) disponible en github.com/jia1217/vigenflow; `prepare_base.exe` descarga las carpetas y borra los shards descargados una vez preparados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Cualitativamente, este repositorio agrupa tres modelos de generacion de imagen de distinto tamano y coste de almacenamiento:

| Alternativa | Parametros | Almacenamiento en el repo | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX.2-klein-4B | 4.000 millones (segun nombre) | 8,0 GiB (797 archivos) | Apache 2.0 | Pesos convertidos para NPU en este repositorio |
| FLUX.1-schnell | No disponible | 26,6 GiB (1950 archivos) | Apache 2.0 | Pesos convertidos para NPU en este repositorio |
| Z-Image-Turbo | No disponible | 11,6 GiB (1036 archivos) | Apache 2.0 | Pesos convertidos para NPU en este repositorio |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: son pesos de terceros modificados; cualquier limitacion de los modelos originales se hereda.
- Dependencia de hardware concreto: esta pensado para la NPU XDNA2 de los AMD Ryzen AI serie 300; no es utilizable directamente en GPU o NPU de otras familias sin reconversion.
- Dependencia de software: requiere el stack VigenFlow para descargar y ejecutar los pesos; el formato `vgf-npu-weights-1` es propio y no es un safetensors estandar cargable por cualquier framework.
- Los pesos han sido transponidos o rellenados con ceros y convertidos a BFP16, lo que puede alterar ligeramente la fidelidad numerica respecto a los pesos originales (no se documenta el impacto).
- Sin datos de benchmarks: no hay evidencia publicada en la informacion disponible sobre calidad, latencia o throughput en la NPU.
- Idiomas soportados: no disponibles; no se especifica el comportamiento multilingue de los prompts.
- Riesgo de alucinacion o de resultados inesperados: aplicable a los modelos de difusion subyacentes; no se cuantifica aqui.
- Licencia: Apache 2.0, que permite uso comercial, pero se debe respetar la atribucion a Black Forest Labs y Tongyi-MAI como autores originales.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que reduce la evidencia de uso en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Kelsey1217/vigenflow-npu-weights
- Codigo, releases y configuracion (VigenFlow): https://github.com/jia1217/vigenflow
- Modelo base FLUX.2-klein-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base FLUX.1-schnell: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo

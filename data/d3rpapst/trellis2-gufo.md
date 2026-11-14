# D3rPapst/trellis2-gufo

## Resumen

TRELLIS.2-4B for gufo es una conversión al formato nativo de gufo-studio-windows de los modelos de flujo image-to-3D de Microsoft Research TRELLIS.2, empaquetados en safetensors por partes para su uso sin Python en Windows sobre hardware AMD Strix Halo con ROCm. El modelo transforma una imagen 2D en una malla 3D texturizada en formato GLB combinando un codificador de imagen DINOv3 ViT-L/16 (no incluido en el repositorio), varios DiT de flujo (estructura dispersa, forma y textura) y decodificadores dispersos 3D. El repositorio ocupa 9,8 GB y contiene únicamente la ruta de 512 (los DiT de la ruta 1024 no se incluyen).

Esta ficha describe un artefacto de despliegue, no un modelo de lenguaje: no genera texto, no razona ni soporta tool calling. Su relevancia radica en que permite ejecutar un pipeline de generación 3D de última generación en GPUs integradas AMD (Strix Halo) bajo Windows, con un consumo medido de 19,3 GB de VRAM con textura y entre 38 y 105 segundos por objeto, algo poco habitual en este tipo de modelos.

La licencia declarada es MIT para los pesos de TRELLIS.2 y del decodificador de TRELLIS-image-large, pero el codificador DINOv3 queda fuera del repositorio y está sujeto a la DINOv3 License de Meta, que exige aceptar sus términos y conservar el aviso "Built with DINOv3" en cualquier redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline image-to-3D: DiT de flujo (estructura dispersa, forma y textura) + decodificadores dispersos 3D con convoluciones 3D + codificador DINOv3 ViT-L/16 (no incluido) |
| Parámetros totales | No disponible (el nombre del modelo base indica 4B; el repositorio no desglosa el recuento) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | BF16 para matrices, F32 para el resto de tensores; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (entrada multimodal imagen; no procesa texto) |
| Licencia | MIT (pesos TRELLIS.2 y ss_dec); DINOv3 License para el codificador no incluido |
| Formato de pesos | safetensors por partes (6 ficheros, ~9,8 GB) |

## Arquitectura y entrenamiento

El pipeline se compone de seis ficheros safetensors: `trellis2-ss_flow.safetensors` (2,59 GB, DiT de flujo de estructura dispersa, 640 tensores), `trellis2-ss_dec.safetensors` (148 MB, decodificador de estructura dispersa, 74 tensores, procedente de TRELLIS-image-large), `trellis2-shape_flow_512.safetensors` (2,59 GB, DiT de flujo de forma, ruta 512), `trellis2-shape_dec.safetensors` (949 MB, decodificador disperso de forma, 292 tensores), `trellis2-tex_flow_512.safetensors` (2,59 GB, DiT de flujo de textura, ruta 512) y `trellis2-tex_dec.safetensors` (949 MB, decodificador disperso de textura, 284 tensores). Los nombres de tensor se mantienen respecto al original salvo los gammas RMS qk por cabeza (aplanados a [1536]) y las convoluciones 3D (unificadas en un layout `[Co, 27*Ci]`).

No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) ni innovaciones de decodificación específicas. La conversión se realizó con `tools/trellis2/convert_hf_to_gufo.py` (rama `feat/trellis2`, commits `6ddba3f2` y `6e0b58ba`, ejecutada el 12 de noviembre de 2026), verificando cabecera safetensors y SHA-256 de cada fichero origen contra el identificador LFS de Hugging Face. Cada salida registra metadatos `gufo.trellis2.source`, `gufo.trellis2.source_file` y `gufo.trellis2.license`.

## Capacidades

- Generación image-to-3D: convierte una imagen 2D en una malla 3D texturizada en formato GLB.
- Generación de estructura dispersa (sparse structure) previa a la forma y la textura.
- Generación de forma 3D mediante DiT de flujo en la ruta de 512.
- Generación de textura sobre la forma generada, con opción de activar o desactivar textura (`trellis2-texture`).
- Control de pasos de muestreo (`steps`), semilla (`seed`), número máximo de caras (`max_faces`) y previsualización (`preview`) a través de la API.
- Ejecución nativa sin Python en Windows sobre AMD Strix Halo con ROCm.
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio.

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un concept art o una foto, generar un GLB texturizado en 38-105 segundos permite iterar sobre variantes de un objeto antes de modelarlo a mano.
- Catalogación y digitalización de producto: convertir fotografías de producto en mallas 3D para visores web o configuradores, aprovechando la ruta de 512 y el control de `max_faces` para mantener presupuestos de polígonos ajustados.
- Previsualización en pipelines de impresión 3D: generar una malla inicial a partir de una imagen de referencia para estimar volumen y forma antes de un modelado CAD definitivo.
- Estaciones de trabajo con GPU integrada AMD: el consumo medido de 19,3 GB de VRAM y 1,5-1,8 GB de host en Strix Halo permite ejecutar el pipeline en equipos sin GPU dedicada, útil en entornos de investigación con hardware limitado.
- Integración en herramientas de autoría 3D bajo Windows: el servidor `gufo serve objekt` expone `POST /v1/3d/generations`, lo que permite conectar el modelo a plugins o scripts de DCC sin depender de Python.
- Generación de variantes controlada por semilla: fijar `seed` y `steps` facilita reproducir resultados y generar lotes consistentes para evaluación o aumento de datasets 3D.
- Investigación en generación 3D reproducible: al conservar los nombres de tensor y documentar la conversión con verificación SHA-256, sirve como base para comparar implementaciones nativas frente a la original en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son medidas de ejecución en Strix Halo: pico de GPU de 19,3 GB con textura, 1,5-1,8 GB en host y 38-105 segundos por objeto.

## Requisitos de hardware

- VRAM estimada: 19,3 GB de pico en GPU con textura activada (medido en Strix Halo); el router de gufo se configura con `router-gpu-gb = 20` y `router-host-gb = 3`.
- Memoria host: 1,5-1,8 GB medidos durante la inferencia.
- GPU recomendadas: AMD Strix Halo con ROCm bajo Windows es el objetivo declarado y medido; no se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: cabe en una GPU integrada Strix Halo; no se dispone de datos para GPUs de consumo discretas.
- Despliegue: servidor nativo de gufo-studio-windows (`gufo serve objekt`), sin Python; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: ~9,8 GB para los pesos, más 1,21 GB adicionales si se añade el codificador DINOv3 convertido (`trellis2-dinov3.safetensors`, F32).
- Latencia y throughput: 38-105 segundos por objeto; no se documenta throughput agregado.
- Límites de petición: `max-request-bytes = 33554432` (32 MB), `ttl = 86400` segundos, `router-idle-seconds = 900`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D3rPapst/trellis2-gufo | Conversión nativa image-to-3D (ruta 512) | No disponible (base 4B) | No aplica | MIT + DINOv3 License (encoder) | Hugging Face, 0 descargas |
| microsoft/TRELLIS.2-4B | Modelo original image-to-3D en PyTorch | 4B (según nombre) | No aplica | MIT | Hugging Face (revisión `af44b45f`) |
| microsoft/TRELLIS-image-large | Modelo image-to-3D predecesor | No disponible | No aplica | MIT | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- El codificador DINOv3 no está incluido: sin él el pipeline no puede procesar imágenes. Debe obtenerse de `facebook/dinov3-vitl16-pretrain-lvd1689m` aceptando los términos de Meta y convertirlo con el script indicado.
- La DINOv3 License exige incluir una copia de la licencia en cualquier redistribución de materiales DINO y el aviso "Built with DINOv3"; la licencia MIT del repositorio no cubre ese componente.
- Solo se incluye la ruta de 512; los DiT de la ruta 1024 no están presentes, por lo que no se puede generar a esa resolución con este paquete.
- Los encoders de entrenamiento no se incluyen, lo que impide reentrenar o hacer fine-tuning a partir de este repositorio.
- El modelo está pensado para gufo-studio-windows y hardware AMD Strix Halo con ROCm; no se documenta compatibilidad con CUDA, otras GPUs ni otros sistemas operativos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 13 de noviembre de 2026: no hay evidencia de uso en producción ni validación por terceros.
- La conversión y la documentación se realizaron con asistencia de IA (Claude Code), según declara el autor.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad geométrica o de textura; la calidad de la malla generada no está cuantificada.
- No se especifican restricciones adicionales de uso comercial más allá de las licencias citadas, pero el uso comercial de DINOv3 requiere revisar los términos de Meta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/D3rPapst/trellis2-gufo
- Modelo original: https://huggingface.co/microsoft/TRELLIS.2-4B
- Modelo predecesor: https://huggingface.co/microsoft/TRELLIS-image-large
- Repositorio de código TRELLIS.2: https://github.com/microsoft/TRELLIS.2
- Codificador DINOv3 (gated): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Proyecto gufo-studio-windows: https://github.com/D3rPapst/gufo-studio-windows

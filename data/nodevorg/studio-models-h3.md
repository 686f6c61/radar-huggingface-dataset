# nodevorg/studio-models-h3

## Resumen

`nodevorg/studio-models-h3` es un repositorio de redistribución que empaqueta en un único punto los ficheros del modelo de generación de vídeo MiniMax H3 y varios de sus derivados (destilaciones, adaptadores y VAEs) en el formato de pesos int8 que consume ComfyUI. Lo publica el colectivo nodevorg para alimentar su plataforma studio.no.dev, que ejecuta estos modelos tanto en ComfyUI como en su propio motor "uncomfy". No es un modelo entrenado desde cero: es un agregado de artefactos de terceros (Video Rebirth, Lakonik, H3-Tiny, Lovart y MiniMax) reorganizados y, en su mayoría, copiados sin modificar.

El interés práctico del repositorio está en que reúne en un solo lugar las piezas necesarias para montar un pipeline de vídeo generativo completo: dos torres HyperFlow H3 Flash (texto-a-vídeo e imagen-a-vídeo, y referencia-a-vídeo), un checkpoint base "Studio H3 V1", un checkpoint de referencia "Alarian H3 V1", adaptadores de destilación pi-H3 para 2 y 4 pasos, un estudiante H3-Tiny FewStep de 17,08 mil millones de parámetros y el VAE de vídeo H3-MT en fp16. El repositorio ocupa 101,2 GB.

Es relevante ahora porque condensa en un formato homogéneo (int8 tensorwise con convrot, grupo 256, o int8 "convrot" compatible con ComfyUI) variantes que de otro modo exigirían descargar y convertir pesos desde cinco repositorios distintos. La licencia es la MiniMax H3 Community License Agreement, con restricciones territoriales y términos comerciales propios, y todos los ficheros se consideran obras derivadas de MiniMax H3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (tipo transformer, según los ficheros y el pipeline MiniMax H3); detalles de atención y bloques no disponibles |
| Parámetros totales | No disponible de forma agregada; el estudiante H3-Tiny FewStep tiene 17,08 mil millones de parámetros (42 bloques) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 tensorwise con convrot, grupo de tamaño 256; VAE en fp16; adaptadores LoRA en int8 convrot |
| Idiomas soportados | No disponibles |
| Licencia | MiniMax H3 Community License Agreement (con restricciones territoriales, términos comerciales y Acceptable Use Policy) |
| Formato de pesos | safetensors (diffusion-single-file para ComfyUI) |

## Arquitectura y entrenamiento

Los artefactos incluidos son variantes de MiniMax H3, un modelo de difusión para vídeo. El repositorio no documenta la arquitectura interna del transformer base (número de bloques del modelo original, mecanismo de atención, esquema de condicionamiento), solo las modificaciones aplicadas a cada derivado. Las torres HyperFlow H3 Flash de Video Rebirth incorporan poda de bloques (3 bloques eliminados en `fl2va`, 1 en `ref2va`) y linealizaciones de bajo rango (102 y 114 capas lineales respectivamente), y muestrean en 6 u 8 pasos sin PDD.

Los derivados de destilación son los que aportan más información técnica. Los adaptadores pi-H3 (Hansheng Chen et al.) destilan la torre `fl2va` estándar a 2 o 4 pasos de muestreo y decodifican el vídeo desde el último paso sin VAE (DWD, *decoupled weight decoding*), con `max_raw_t` de 0,93 y 0,96 respectivamente. El estudiante H3-Tiny FewStep (Haoshuai Fu) poda el transformer `ref2va` a 42 bloques (17,08B parámetros) y lo destila para muestrear en 6 pasos (funciona con 4 o más). No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante la torre `fl2va` de HyperFlow H3 Flash.
- Generación de vídeo a partir de una primera imagen o de primera y última imagen (image-to-video) con `MiniMaxH3ImageToVideo`.
- Generación de vídeo a partir de imágenes de referencia y audio con `MiniMaxH3ReferenceToVideo` (torres `ref2va`, checkpoint Alarian H3 V1 y estudiante H3-Tiny FewStep).
- Muestreo acelerado: 6 u 8 pasos en HyperFlow H3 Flash sin PDD; 2 o 4 pasos con los adaptadores pi-H3; 6 pasos (mínimo 4) con H3-Tiny FewStep.
- Decodificación de vídeo sin VAE en el último paso mediante el adaptador DWD de pi-H3.
- Codificación/decodificación de vídeo mediante el VAE H3-MT en fp16.
- Integración con ComfyUI mediante cargadores específicos (`HyperFlowInt8Loader`, `UNETLoader`, `Load Lakalab Adapter`, `H3-Tiny Few-Step Loader`) y nodos de muestreo propios.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe de texto; el modelo es generativo de vídeo, no un LLM conversacional.

## Casos de uso

- Generación de vídeo publicitario a partir de un brief textual: la torre `fl2va` de HyperFlow H3 Flash permite text-to-video en 6 u 8 pasos, adecuada para iterar variaciones de anuncios cortos con tiempos de muestreo reducidos.
- Animación de imágenes fijas para redes sociales: `MiniMaxH3ImageToVideo` acepta una primera imagen o primera y última, lo que sirve para convertir fotografías de producto en clips con movimiento controlado entre dos fotogramas clave.
- Vídeo con personajes o estilos de referencia: la torre `ref2va` y el checkpoint Alarian H3 V1 generan vídeo a partir de imágenes de referencia y audio, útil para doblaje visual, avatares o continuidad de personaje entre planos.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: el estudiante H3-Tiny FewStep (17,08B, 6 pasos, mínimo 4) reduce el coste de muestreo frente al modelo completo, lo que permite previsualizar secuencias antes de un render final de mayor calidad.
- Iteración de bajo coste con destilación pi-H3: los adaptadores de 2 y 4 pasos sobre la torre `fl2va` estándar permiten generar borradores muy rápidos y reservar el muestreo completo para la versión definitiva.
- Integración en pipelines de ComfyUI para estudios pequeños: el formato int8 con convrot y los cargadores específicos permiten montar un flujo de trabajo reproducible en ComfyUI o en el motor uncomfy de studio.no.dev, con los VAEs y el text encoder estándar de Comfy-Org/MiniMax-H3.
- Postproducción y transcodificación de vídeo generado: el VAE H3-MT en fp16 se puede usar para codificar y decodificar latentes de vídeo dentro de flujos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los ficheros int8 de las torres HyperFlow pesan 16,3 GB y 16,8 GB, los checkpoints Studio H3 V1 y Alarian H3 V1 pesan 20,2 GB y 20,1 GB, el estudiante H3-Tiny FewStep 18,1 GB y el VAE fp16 5,2 GB; a ello hay que sumar el text encoder y los VAEs estándar de Comfy-Org/MiniMax-H3.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, los checkpoints de 18-20 GB en int8 encajan con GPUs de 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100); no se confirma compatibilidad con GPUs de 16 GB.
- ¿Cabe en GPU de consumo? Los ficheros de 16-20 GB requieren al menos 24 GB de VRAM para cargarse completos, además del text encoder y el VAE; no hay datos oficiales sobre ejecución con offloading parcial.
- Opciones de despliegue: ComfyUI (con `ComfyUI-Studio-HyperFlow`, `ComfyUI-HyperFlow-Flash`, `ComfyUI-piFlow` y los nodos de H3-Tiny según la variante), el motor uncomfy de studio.no.dev, y los cargadores estándar `UNETLoader` para los checkpoints Studio H3 V1 y Alarian H3 V1. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se documenta el número de pasos de muestreo (6-8 en HyperFlow, 2-4 con pi-H3, 6 con H3-Tiny FewStep).

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de muestreo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 (base, vía Comfy-Org/MiniMax-H3) | No disponible | Estándar (no especificado) | safetensors int8 convrot | MiniMax H3 Community License | Hugging Face (Comfy-Org) |
| HyperFlow H3 Flash (`fl2va` / `ref2va`) | No disponible (3 y 1 bloques podados) | 6 u 8, sin PDD | safetensors int8 convrot | MiniMax H3 Community License | Hugging Face (VideoRebirthAI) |
| H3-Tiny FewStep (`ref2va`) | 17,08B (42 bloques) | 6 (mínimo 4) | safetensors int8 convrot | MiniMax H3 Community License | Hugging Face (H3-Tiny) |
| Este repositorio (agregado) | Varios (17,08B el estudiante) | 2, 4, 6 u 8 según variante | safetensors int8 convrot / fp16 | MiniMax H3 Community License | Hugging Face (nodevorg) |

No se dispone de datos de rendimiento comparativo (métricas de calidad de vídeo, FVD, CLIP score) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es un producto oficial de MiniMax, Video Rebirth, pi-H3, H3-Tiny ni Lovart; es una redistribución de terceros.
- La licencia MiniMax H3 Community License Agreement impone restricciones territoriales, términos comerciales y una Acceptable Use Policy; es obligatorio revisar el LICENSE upstream antes de cualquier uso comercial.
- Todos los ficheros se consideran obras derivadas de MiniMax H3 y heredan esa licencia; no se añaden términos adicionales, pero tampoco se relajan los existentes.
- Varias variantes requieren nodos y cargadores no estándar (`HyperFlowInt8Loader`, `Load Lakalab Adapter`, `H3-Tiny Few-Step Loader`); el cargador estándar de H3 de ComfyUI no carga las torres HyperFlow.
- Los adaptadores pi-H3 y el estudiante H3-Tiny FewStep son destilaciones: la calidad puede diferir de la del modelo completo, especialmente con menos pasos (2 pasos en pi-H3, 4 en H3-Tiny).
- No hay información sobre sesgos, idiomas soportados, riesgo de alucinación visual ni evaluación de calidad; no se han publicado benchmarks.
- El tamaño del repositorio (101,2 GB) y de cada fichero (16-20 GB) exige almacenamiento y ancho de banda considerables.
- El campo `pipeline` no está disponible y la librería declarada es `diffusion-single-file`, lo que limita la interoperabilidad con frameworks de inferencia distintos de ComfyUI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nodevorg/studio-models-h3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia upstream: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- HyperFlow H3 Flash (Video Rebirth): https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- pi-H3 (Lakonik): https://huggingface.co/Lakonik/pi-H3
- H3-Tiny (MiniMax-H3-Tiny-ComfyUI): https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Repositorio H3-Tiny en GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- H3-MT-VAE (Lovart): https://huggingface.co/lovartai/H3-VAE-MT
- Text encoder y VAEs estándar de ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Nodos ComfyUI-Studio-HyperFlow: https://github.com/NoDevOrg/ComfyUI-Studio-HyperFlow
- Nodos ComfyUI-HyperFlow-Flash: https://github.com/Video-Rebirth/ComfyUI-HyperFlow-Flash
- Nodos ComfyUI-piFlow y guía pi-H3: https://github.com/Lakonik/ComfyUI-piFlow y https://github.com/Lakonik/ComfyUI-piFlow/blob/main/docs/piH3.md
- Plataforma studio.no.dev: https://studio.no.dev

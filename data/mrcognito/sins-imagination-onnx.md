# MrCognito/sins-imagination-onnx

## Resumen

Sin's Imagination on-device image model files (ONNX) es un repositorio de conversion publicado por MrCognito (SIN DAG LLC) que empaqueta en formato ONNX dos modelos de generacion de imagenes texto-a-imagen de codigo abierto: SDXS-512-DreamShaper y BK-SDM-Tiny, junto con el decodificador TAESD 1.2 y varios modelos auxiliares (tokenizer CLIP, detector facial YuNet, clasificador NSFWJS, torre de imagen CLIP ViT-B/32 y watermark TrustMark de Adobe). No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia en dispositivo del usuario, con pesos convertidos a fp16 y sin reentrenamiento, fine-tuning ni fusion.

El paquete resuelve el problema de desplegar generacion de imagenes en local (navegador, movil o equipos sin GPU dedicada) sin depender de servicios en la nube. SDXS-512-DreamShaper es una variante destilada de Stable Diffusion optimizada para pocos pasos de inferencia, mientras que BK-SDM-Tiny es una version comprimida de SD que reduce drasticamente el numero de parametros. La inclusion de TAESD permite decodificar latentes con un VAE muy ligero, y los modelos auxiliares cubren tareas de seguridad y trazabilidad (deteccion de rostros, clasificacion NSFW y watermarking).

El repositorio ocupa 1,9 GB y esta pensado para pipelines `text-to-image` con la libreria ONNX Runtime. Su relevancia actual radica en la demanda de generacion de imagenes on-device con requisitos de privacidad y latencia, y en la disponibilidad de un stack completo (modelo, decoder, filtros y watermark) bajo licencias permisivas o RAIL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (UNet + VAE/TAESD + text encoder CLIP), variantes destilada (SDXS) y comprimida (BK-SDM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin contexto de texto en tokens declarado) |
| Tipos de cuantizacion | fp16 (pesos convertidos de safetensors a ONNX y casteados a fp16) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el tokenizer CLIP es multilingue limitado, sin detalle publicado) |
| Licencia | CreativeML Open RAIL++-M y CreativeML Open RAIL-M (modelos principales); MIT para TAESD y modelos auxiliares |
| Formato de pesos | ONNX (fp16) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: convierte a ONNX y castea a fp16 los pesos originales de SDXS-512-DreamShaper (commit `76f720262bb051da75666b22c902a78c8e16c763` de IDKiro) y BK-SDM-Tiny (commit `0364108e53b7f7f4d2585e817a0b7a83dc261cfa` de nota-ai), e incluye el decodificador TAESD 1.2 (revision `931366cc` de madebyollin/taesd). SDXS-512-DreamShaper es una variante de Stable Diffusion destilada para generar imagenes de 512x512 con muy pocos pasos de muestreo, mientras que BK-SDM-Tiny es una version con bloques reducidos del UNet de SD que disminuye el coste computacional. El decodificador TAESD sustituye al VAE completo por uno mucho mas ligero, lo que acelera la decodificacion latente a imagen.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO, ya que el autor no reentreno los modelos. La innovacion tecnica del repositorio es el empaquetado: conversion a ONNX con pesos fp16, inclusion de `SHA256SUMS` para verificar integridad, script de conversion en `licenses/convert_models.py` y un conjunto de modelos auxiliares (YuNet para deteccion facial, NSFWJS para clasificacion de contenido, CLIP ViT-B/32 para embeddings de imagen y TrustMark de Adobe para watermark encoder/decoder) que permiten construir un pipeline completo de generacion con seguridad y trazabilidad.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 con SDXS-512-DreamShaper y BK-SDM-Tiny.
- Inferencia on-device mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Decodificacion latente rapida con TAESD 1.2 en lugar del VAE completo.
- Deteccion de rostros con YuNet (util para moderacion o anonimizacion).
- Clasificacion de contenido NSFW con NSFWJS (filtrado previo o posterior a la generacion).
- Embeddings de imagen con CLIP ViT-B/32 (busqueda, similitud o moderacion semantica).
- Watermarking con Adobe TrustMark (encoder y decoder) para marcar y detectar imagenes generadas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni modo thinking: es un pipeline puramente texto-a-imagen.
- Capacidades multilingues: no disponibles; el comportamiento dependera del tokenizer CLIP incluido, sin detalle publicado.

## Casos de uso

- Generacion de imagenes en navegador o aplicacion de escritorio: al estar en ONNX y fp16, el pipeline puede ejecutarse con ONNX Runtime Web o nativo, permitiendo crear ilustraciones o avatares sin enviar prompts a un servidor y preservando la privacidad del usuario.
- Generacion de imagenes en movil o equipos sin GPU dedicada: BK-SDM-Tiny y TAESD reducen el coste computacional, lo que hace viable la inferencia en CPU o GPUs integradas con latencias aceptables para aplicaciones interactivas.
- Moderacion y filtrado de contenido generado: la combinacion de NSFWJS y YuNet permite clasificar la salida como segura o no apta y detectar rostros para anonimizacion antes de publicar la imagen.
- Marcado y trazabilidad de imagenes sinteticas: el encoder TrustMark permite insertar un watermark imperceptible y el decoder recuperarlo, util para cumplir requisitos de transparencia sobre contenido generado por IA.
- Busqueda y deduplicacion visual: CLIP ViT-B/32 permite calcular embeddings de las imagenes generadas para agruparlas, buscarlas por similitud o detectar duplicados en una galeria.
- Prototipado rapido de pipelines de difusion: al incluir modelo, decoder, filtros y watermark en un unico repositorio con checksums y script de conversion, sirve como base reproducible para experimentar con ONNX Runtime y comparar variantes destiladas frente a comprimidas.
- Aplicaciones de edicion creativa offline: integracion en herramientas de diseno que necesiten generar variaciones de imagen localmente sin conexion, usando SDXS-512-DreamShaper para calidad y BK-SDM-Tiny para velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 1,9 GB en fp16, por lo que la huella en memoria es moderada y puede caber en GPUs consumer con 4-8 GB, aunque el dato exacto no esta publicado.
- GPU recomendadas: no disponibles; al ser ONNX fp16, puede ejecutarse en GPU NVIDIA (CUDA), AMD (ROCm/DirectML) o Apple Silicon (CoreML), asi como en CPU.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del paquete y el uso de BK-SDM-Tiny y TAESD, pero no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (nativo, Web y movil); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sin's Imagination onnx (este repo) | no disponible (SDXS + BK-SDM-Tiny + TAESD) | no aplica | no disponible | CreativeML Open RAIL++-M / RAIL-M / MIT | ONNX fp16 en Hugging Face |
| SDXS-512-DreamShaper (IDKiro) | no disponible | no aplica | no disponible en esta ficha | CreativeML Open RAIL++-M | safetensors en Hugging Face |
| BK-SDM-Tiny (nota-ai) | no disponible | no aplica | no disponible en esta ficha | CreativeML Open RAIL-M | safetensors en Hugging Face |
| Stable Diffusion 1.5 (referencia) | ~860 M (UNet) | no aplica | no disponible en esta ficha | CreativeML Open RAIL-M | amplia disponibilidad |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a licencia, formato y origen.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversion ONNX de modelos existentes, sin reentrenamiento ni mejoras de calidad; los sesgos y limitaciones de SDXS-512-DreamShaper y BK-SDM-Tiny se heredan integramente.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible, artefactos y composiciones incoherentes, especialmente en BK-SDM-Tiny por su menor capacidad.
- Resolucion limitada a 512x512 en las variantes incluidas; no se documenta soporte para resoluciones mayores.
- Idiomas: no se detalla el soporte multilingue de prompts; el tokenizer CLIP incluido puede tener limitaciones en idiomas distintos del ingles.
- Restricciones de licencia: los pesos estan sujetos a las restricciones de uso de la Attachment A de CreativeML Open RAIL-M y RAIL++-M; se deben redistribuir con copia de la licencia y respetar las prohibiciones de uso. TAESD y los modelos auxiliares son MIT.
- El autor declara que los autores originales, Hugging Face y BlockDAG Network no respaldan el repositorio ni estan afiliados a el.
- Sin datos publicados de benchmarks, latencia ni requisitos exactos de VRAM; conviene validar el rendimiento en el hardware objetivo antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni soporte comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MrCognito/sins-imagination-onnx
- SDXS-512-DreamShaper: https://huggingface.co/IDKiro/sdxs-512-dreamshaper
- BK-SDM-Tiny: https://huggingface.co/nota-ai/bk-sdm-tiny
- TAESD: https://huggingface.co/madebyollin/taesd
- Licencia CreativeML Open RAIL-M: https://huggingface.co/MrCognito/sins-imagination-onnx/blob/main/LICENSE-creativeml-openrail-m
- Sitio del autor: https://sin-dag.com

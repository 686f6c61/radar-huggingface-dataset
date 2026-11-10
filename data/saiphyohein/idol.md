# saiphyohein/idol

## Resumen

Idol es un modelo de generación 3D a partir de una única imagen (image-to-3D) desarrollado por Sperid Labs y publicado en Hugging Face bajo el identificador `saiphyohein/idol`. Su función es convertir una fotografía o un render de un objeto en una representación de Gaussian splatting 3D en formato `.ply` estándar, generando hasta 1.048.576 gaussianas e infiriendo las partes del objeto que la imagen de entrada no muestra. El modelo elimina automáticamente el fondo, encuadra el objeto y predice la cámara de la vista de entrada.

Técnicamente es un pipeline compuesto por varios módulos: un denoiser basado en Diffusion Transformer (DiT) de 370,6M de parámetros, un decodificador de octree de 50,8M, un decodificador de gaussianas de 237,3M, además de componentes auxiliares como BiRefNet para eliminación de fondo, DINOv3 ViT-H+/16 como codificador de imagen y el VAE de FLUX.2. El conjunto suma aproximadamente 1,80B de parámetros y está pensado para ejecutarse en GPUs de consumo con un pico de 7,2 GB de VRAM y latencias inferiores a 2 segundos por imagen.

Su relevancia radica en que ofrece reconstrucción 3D de objeto único con calidad utilizable en producción sobre hardware asequible, con licencia Apache 2.0 y un SDK en Python. El repositorio ocupa 3,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion con Diffusion Transformer (DiT) + decodificador de octree + decodificador de gaussianas; codificadores DINOv3 ViT-H+/16 y VAE de FLUX.2; BiRefNet para segmentacion |
| Parametros totales | ~1,80B (DiT 370,6M; octree decoder 50,8M; Gaussian decoder 237,3M; BiRefNet 220,7M; DINOv3 ViT-H+/16 840,6M; FLUX.2 VAE 84,1M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo image-to-3D, no textual) |
| Tipos de cuantizacion | FP16 y bf16 en GPU; FP32 para embeddings y normas; opcion `--dinov3_dtype fp32` para el codificador DINOv3 |
| Idiomas soportados | no disponible (modelo de vision 3D, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos del repositorio, ~3 GB); salida en `.ply` de 3D Gaussian Splatting |

## Arquitectura y entrenamiento

Idol es un pipeline generativo compuesto. La entrada pasa primero por BiRefNet para eliminar el fondo y por DINOv3 ViT-H+/16 para extraer características visuales; el VAE de FLUX.2 interviene en el espacio latente. Un Diffusion Transformer de 370,6M de parámetros actúa como denoiser, y la representación 3D se materializa mediante un decodificador de octree (50,8M) y un decodificador de gaussianas (237,3M) que produce hasta 1.048.576 gaussianas en formato `.ply`. El muestreo se controla con `--steps` (50 por defecto), `--cfg_strength` (3.0) y `--rescale_t` (3.0), y admite fijación de semilla para reproducibilidad.

El pipeline incorpora optimizaciones de inferencia activadas por defecto en GPU: compilación del denoiser con `torch.compile`, ejecución conjunta de las pasadas guiada y no guiada como un único batch, y atención con cuDNN y matmuls TF32, lo que reporta una aceleración de aproximadamente 1,7x sin pérdida de calidad. La primera imagen de cada proceso es más lenta por la compilación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de objetos 3D en formato Gaussian splatting (`.ply`) a partir de una única imagen, con hasta 1.048.576 gaussianas.
- Inferencia de geometría no visible: completa las caras del objeto que la imagen de entrada no muestra.
- Eliminación automática de fondo y encuadre del objeto (modos `synthetic` y `real`).
- Predicción de la cámara de la vista de entrada, exportada como `<name>_camera.json`.
- Acepta renders, imágenes generadas y fotografías reales como entrada.
- Control fino de la generación mediante semilla, pasos de muestreo, fuerza de CFG, desplazamiento temporal y número de gaussianas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión a 3D.

## Casos de uso

- Catalogación de producto en e-commerce: a partir de una foto de catálogo se genera un splat 3D navegable para vistas interactivas en web, aprovechando la inferencia de caras ocultas y la latencia inferior a 2 segundos por imagen.
- Prototipado rápido en videojuegos: conversión de concept art o renders en assets 3D iniciales que el equipo de arte puede retocar, con control del número de gaussianas para ajustar el nivel de detalle.
- Realidad aumentada: generación de modelos 3D ligeros a partir de fotos de usuario para previsualización de muebles o productos en el entorno, usando el modo `real` con encuadre adaptado a fotografías.
- Reconstrucción de patrimonio o piezas físicas: digitalización aproximada de objetos a partir de una sola captura cuando no es posible un escaneo multivista, con exportación a `.ply` compatible con visores de Gaussian splatting.
- Generación de contenido para pipelines de diseño: integración en herramientas de autoría 3D que necesiten pasar de imagen a malla/splat de forma automática, con semilla fija para resultados reproducibles.
- Investigación en visión 3D: banco de pruebas para comparar métodos image-to-3D, ya que el modelo publica comparativas frente a TripoSplat, TRELLIS y LGM y expone todos sus hiperparámetros de muestreo.

## Benchmarks y rendimiento

La model card incluye una comparativa frente a TripoSplat, TRELLIS y LGM, evaluada en la vista de entrada (PSNR, SSIM, LPIPS, IoU) y en siete vistas nuevas (DINOv2, CLIP, distancia de nitidez), con medias sobre 1× H100 por modelo. Sin embargo, la información proporcionada se interrumpe al inicio de la tabla de resultados, por lo que no se dispone de las cifras concretas.

| Modelo | Setting | PSNR | SSIM | LPIPS | IoU | DINOv2 | CLIP | Sharpness |
|---|---|---|---|---|---|---|---|---|
| Idol | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TripoSplat | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TRELLIS | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| LGM | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible las cifras numéricas de estos benchmarks.

## Requisitos de hardware

- VRAM: pico de 7,2 GB; pesos en VRAM entre 3,7 y 4,4 GB según componentes.
- Desglose de VRAM por componente: DiT ~0,8–1,0 GB; octree decoder ~0,1–0,2 GB; Gaussian decoder ~0,5–0,9 GB; BiRefNet ~0,44 GB; DINOv3 ~1,68 GB; VAE ~0,17 GB.
- GPU: requiere GPU NVIDIA con CUDA; el modelo está diseñado para GPUs de consumo. Los benchmarks se ejecutaron en H100, pero no se especifican modelos concretos de consumo compatibles.
- Software: Python 3.10+, PyTorch 2.5+, CUDA; SDK `idol-sdk` instalable con `pip install -e .`.
- Despliegue: SDK oficial de Python (`IdolPipeline`), CLI (`python -m idol.sample`) y demo en Hugging Face Spaces. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: menos de 2 segundos por imagen; aceleración de ~1,7x con las optimizaciones por defecto; la primera imagen de cada proceso es más lenta por la compilación con `torch.compile`.
- Requisito adicional: acceso aceptado a los modelos cerrados `facebook/dinov3-vith16plus-pretrain-lvd1689m` y `black-forest-labs/FLUX.2-dev` (solo su VAE) con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol | ~1,80B | no aplica | no disponible (cifras no publicadas) | Apache 2.0 | Hugging Face, SDK y demo |
| TripoSplat | no disponible | no aplica | comparado en la model card, cifras no disponibles | no disponible | no disponible |
| TRELLIS | no disponible | no aplica | comparado en la model card, cifras no disponibles | no disponible | no disponible |
| LGM | no disponible | no aplica | comparado en la model card, cifras no disponibles | no disponible | no disponible |

Los tres modelos comparables se citan en la model card como referencias de evaluación, pero no se dispone de sus especificaciones ni de los resultados numéricos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de objeto único: está diseñado para una imagen de un solo objeto, no para escenas complejas ni múltiples objetos.
- Dependencia de modelos cerrados: requiere aceptar los términos de DINOv3 y FLUX.2-dev en Hugging Face; si no se concede acceso, el pipeline se detiene antes de descargar nada.
- Riesgo de geometría inventada: al inferir las caras no visibles, la parte trasera del objeto es una predicción plausible, no una reconstrucción fiel; no es apto para medición o ingeniería de precisión.
- Calidad dependiente de la entrada: el modo (`synthetic` vs `real`) debe elegirse correctamente; un encuadre inadecuado afecta al resultado.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene multilingüismo.
- Sin datos de sesgo ni de benchmarks numéricos publicados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos auxiliares (DINOv3, FLUX.2-dev) deben verificarse por separado.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saiphyohein/idol
- Página del proyecto: https://speridlabs.com/research/idol
- Repositorio del SDK: https://github.com/speridlabs/idol-sdk
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/speridlabs/idol
- Codificador DINOv3 (acceso restringido): https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2 (acceso restringido): https://huggingface.co/black-forest-labs/FLUX.2-dev

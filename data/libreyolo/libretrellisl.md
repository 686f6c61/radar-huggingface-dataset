# LibreYOLO/LibreTRELLISl

## Resumen

LibreTRELLISl es un empaquetado del modelo TRELLIS-image-large de Microsoft, presentado en el paper "Structured 3D Latents for Scalable and Versatile 3D Generation" (CVPR 2025), adaptado para ejecutarse dentro del ecosistema LibreYOLO. El modelo resuelve la tarea de image-to-3D: a partir de una sola imagen de un objeto genera una representacion 3D completa en forma de Gaussian splats. Es relevante porque permite reconstruccion 3D generativa de un solo disparo sin necesidad de infraestructura especializada.

El repositorio es un espejo de los pesos originales de Microsoft, sin reentrenamiento ni reconversion: los ficheros bajo `ckpts/` y `pipeline.json` son byte-identicos al upstream (revision `25e0d31ffbebe4b5a97464dd851910efc3002d96`). La aportacion de LibreYOLO es la capa de ejecucion: implementa la inferencia en PyTorch puro, sin dependencias de spconv, xformers ni flash-attn, lo que habilita su uso en GPUs NVIDIA, Apple Silicon (MPS) y CPU.

El modelo combina un transformer de flujo para estructura dispersa, un transformer de flujo sobre latentes estructurados y un decodificador gaussiano, apoyandose en DINOv2 (con registers, large) como codificador de imagen y BiRefNet (Swin-L) para la eliminacion de fondo. El repositorio ocupa 3,3 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de flow matching sobre latentes 3D estructurados (sparse-structure flow transformer + structured-latent flow transformer + decodificador gaussiano), con codificador de imagen DINOv2 y segmentacion BiRefNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-3D, no textual) |
| Tipos de cuantizacion | no disponible (pesos en fp16 segun nombres de checkpoint) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors y checkpoints PyTorch (fp16) bajo `ckpts/` |

## Arquitectura y entrenamiento

TRELLIS emplea una representacion intermedia denominada Structured 3D Latents (SLAT), que unifica estructura dispersa y apariencia. El pipeline encadena un transformer de flujo que genera la estructura dispersa del objeto (`ss_flow_img_dit_L_16l8_fp16`), un decodificador de estructura (`ss_dec_conv3d_16l8_fp16`), un transformer de flujo sobre latentes estructurados (`slat_flow_img_dit_L_64l8p2_fp16`) y un decodificador gaussiano (`slat_dec_gs_swin8_B_64l8gs32_fp16`). El repositorio incluye tambien un decodificador de malla (`slat_dec_mesh_swin8_B_64l8m256c_fp16`) que LibreYOLO todavia no utiliza.

La condicion de imagen se extrae con DINOv2 con registers (large, Apache-2.0) y el recorte del objeto se obtiene con BiRefNet (Swin-L, MIT). No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO; se remite al paper arXiv:2412.01506 para esos datos. La innovacion tecnica principal es la representacion SLAT, que permite generar splats gaussianos y mallas desde una unica imagen con un pipeline de flow matching en dos etapas.

## Capacidades

- Generacion image-to-3D: a partir de una imagen de un objeto produce una representacion 3D completa en Gaussian splats (salida `.ply`).
- Eliminacion automatica de fondo de la imagen de entrada mediante BiRefNet.
- Generacion de estructura dispersa y apariencia en un pipeline de dos etapas de flow matching.
- Salida en formato Gaussian splat, apta para visualizacion y renderizado.
- Ejecucion en PyTorch puro sin spconv, xformers ni flash-attn.
- Compatibilidad con NVIDIA CUDA, Apple Silicon (MPS) y CPU.
- Interfaz programatica (`LibreGen("trellis")`) y CLI (`libreyolo generate`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Prototipado rapido de assets 3D: un disenador sube una foto de un objeto y obtiene un splat gaussiano para previsualizar en un motor de render, gracias a la generacion de un solo disparo desde una unica imagen.
- Catalogos de e-commerce en 3D: convertir fotos de producto en representaciones 3D navegables para fichas interactivas, usando la eliminacion de fondo integrada para aislar el objeto.
- Escaneo 3D asistido desde movil: capturar una foto y generar el modelo en un portatil con Apple Silicon (MPS), sin necesidad de GPU dedicada, gracias a la implementacion sin dependencias CUDA obligatorias.
- Investigacion en generacion 3D: punto de partida reproducible (pesos byte-identicos al upstream) para experimentar con SLAT y flow matching en entornos sin spconv.
- Integracion en pipelines de contenido: usar la CLI `libreyolo generate` dentro de un flujo por lotes que procese imagenes y guarde ficheros `.ply` de forma automatizada.
- Docencia y demos: ejecutar el modelo en CPU para demostraciones en aula o entornos sin acelerador, a costa de mayor latencia.
- Previsualizacion en herramientas de modelado: generar un splat de referencia a partir de una foto para guiar el modelado manual posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 3,3 GB y los pesos se distribuyen en fp16, por lo que se requiere espacio suficiente para cargar los checkpoints en memoria.
- GPU recomendadas: NVIDIA con CUDA (sin modelo concreto especificado), Apple Silicon via MPS, o CPU.
- Cabe en GPU consumer: si, segun la model card el modelo funciona en PyTorch puro y soporta MPS y CPU; no se especifican modelos concretos ni VRAM minima.
- Opciones de despliegue: libreria `libreyolo` (API `LibreGen` y CLI `libreyolo generate`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo image-to-3D).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreTRELLISl | Image-to-3D (Gaussian splats) | no disponible | no aplica | MIT | HuggingFace (espejo de Microsoft) |
| microsoft/TRELLIS-image-large | Image-to-3D (Gaussian splats y malla) | no disponible | no aplica | MIT | HuggingFace |
| Alternativas de image-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada en la informacion disponible es con el repositorio upstream de Microsoft, del que este es un espejo. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier limitacion del TRELLIS original se hereda integramente.
- El decodificador de malla incluido no esta siendo utilizado por LibreYOLO; la salida actual es solo Gaussian splats.
- El decodificador de campo de radiancia y el codificador de latentes estructurados del upstream no estan espejados.
- Modelo de vision 3D, no de lenguaje: no procesa texto, no tiene capacidades conversacionales ni multilingues.
- No se dispone de datos sobre sesgos, tasas de alucinacion geometrica ni calidad de reconstruccion en objetos fuera de distribucion.
- Depende de DINOv2 (`facebook/dinov2-with-registers-large`, Apache-2.0) y BiRefNet (MIT); conviene revisar sus respectivas licencias en produccion.
- Sin benchmarks publicados en la informacion disponible, no es posible garantizar el rendimiento frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/LibreYOLO/LibreTRELLISl
- Repositorio upstream: https://huggingface.co/microsoft/TRELLIS-image-large
- Codigo: https://github.com/microsoft/TRELLIS
- Paper: https://arxiv.org/abs/2412.01506
- Codificador de imagen: https://huggingface.co/facebook/dinov2-with-registers-large

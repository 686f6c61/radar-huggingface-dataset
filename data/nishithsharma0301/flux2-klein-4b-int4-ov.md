# nishithsharma0301/flux2-klein-4b-int4-ov

## Resumen

Este repositorio contiene una exportación a OpenVINO en cuantización INT4 del modelo FLUX.2 klein 4B, un modelo de difusión para generación y edición de imágenes a partir de texto desarrollado por Black Forest Labs. La conversión ha sido realizada por el usuario nishithsharma0301 utilizando `optimum-intel` 2.2.0, y está pensada para ejecutarse de forma eficiente en hardware Intel, incluidas GPU integradas (iGPU), gracias al runtime OpenVINO GenAI.

El modelo base, FLUX.2 klein 4B, es la variante compacta de la familia FLUX.2, con aproximadamente 4.000 millones de parámetros, que emplea un codificador de texto basado en Qwen3. La relevancia de esta build reside en que reduce el tamaño de pesos (repo de 4,4 GB) y la huella de cómputo mediante cuantización INT4 asimétrica con tamaño de grupo 128, haciendo viable la generación de imágenes en equipos de consumo sin GPU dedicada de gama alta.

La exportación se ha validado con OpenVINO GenAI 2026.4.1 usando los pipelines `Text2ImagePipeline`, `Image2ImagePipeline` y `Flux2KleinPipeline`, en 4 pasos de inferencia sobre una iGPU de Intel. Mantiene la licencia Apache 2.0 del modelo original, aunque su uso queda sujeto además a los términos originales de Black Forest Labs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusion transformer) para text-to-image, con codificador de texto Qwen3 |
| Parametros totales | ~4.000 millones (modelo base FLUX.2 klein 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimétrica, group size 128 (transformer y codificador de texto Qwen3); VAE sin cuantizar |
| Idiomas soportados | no disponible (comprensión de prompts a través de Qwen3, idiomas concretos no especificados) |
| Licencia | Apache 2.0 (sujeto además a los términos del modelo original de Black Forest Labs) |
| Formato de pesos | OpenVINO IR (exportado con optimum-intel 2.2.0, `--weight-format int4`) |

## Arquitectura y entrenamiento

El modelo base es FLUX.2 klein 4B de Black Forest Labs, una variante reducida de la familia FLUX.2 orientada a generación y edición de imágenes. La arquitectura se basa en un transformer de difusión emparejado con un codificador de texto Qwen3, lo que permite una comprensión semántica más rica de los prompts que los codificadores CLIP tradicionales. El VAE se exporta sin cuantizar para preservar la calidad de reconstrucción de las imágenes.

Esta versión no incorpora entrenamiento adicional: es una exportación directa del checkpoint `e7b7dc27f91deacad38e78976d1f2b499d76a294` del repositorio oficial `black-forest-labs/FLUX.2-klein-4B`, realizada con `optimum-cli export openvino --task text-to-image --library diffusers --weight-format int4`. La innovación técnica principal de la build es la cuantización post-entrenamiento INT4 asimétrica con group size 128 aplicada tanto al transformer de difusión como al codificador de texto, lo que reduce drásticamente los requisitos de memoria y permite su ejecución en iGPUs de Intel con OpenVINO GenAI 2026.4.1. Los detalles del preentrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline `Text2ImagePipeline` de OpenVINO GenAI.
- Edición de imágenes guiada por texto (image-to-image) mediante `Image2ImagePipeline`.
- Ejecución optimizada en hardware Intel (CPU, iGPU y GPU dedicadas) gracias al runtime OpenVINO.
- Comprensión de prompts mediante el codificador de texto Qwen3, con soporte de prompts complejos heredado del modelo base.
- Validación documentada en 4 pasos de inferencia sobre una iGPU de Intel.
- No incluye capacidades de texto, código, visión multimodal de entrada ni tool calling: es un modelo especializado en imágenes.

## Casos de uso

- Generación de imágenes en portátiles sin GPU dedicada: la cuantización INT4 y OpenVINO permiten ejecutar el modelo en la iGPU de un portátil con Intel Core moderno, ideal para prototipado local sin coste de nube.
- Edición de imágenes local y privada: mediante `Image2ImagePipeline`, los usuarios pueden modificar imágenes existentes según instrucciones de texto sin enviar datos a servicios externos, relevante para sectores con requisitos de privacidad.
- Integración en aplicaciones Windows/Intel: OpenVINO se integra de forma nativa en aplicaciones nativas de escritorio, útil para herramientas de diseño o marketing que generan creatividades on-device.
- Generación batch de ilustraciones y assets: pipelines de OpenVINO GenAI permiten automatizar la creación de variantes de imágenes para catálogos, presentaciones o redes sociales.
- Demostraciones y educación: el bajo footprint (4,4 GB) y la ejecución en 4 pasos lo hacen adecuado para talleres y demostraciones en vivo de IA generativa en hardware modesto.
- Sistemas embebidos y edge con Intel: la cuantización INT4 abre la puerta a despliegues en mini PCs y equipos NUC con iGPU Intel para generación de imágenes en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento indicado es la validación de la exportación con OpenVINO GenAI 2026.4.1 en una iGPU de Intel con 4 pasos de inferencia; no se proporcionan métricas de tiempo por imagen, FID ni comparativas de calidad frente al modelo en FP16.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 4,4 GB en INT4; se recomienda disponer de al menos 8 GB de RAM compartida o VRAM para inferencia cómoda (estimación aproximada, no confirmada por el autor).
- GPU recomendadas: iGPUs Intel integradas (validado por el autor), así como GPU dedicadas Intel Arc; también funciona en CPU Intel, aunque con mayor latencia.
- Consumer GPUs: está específicamente pensado para ejecutarse en iGPUs de Intel, por lo que no requiere GPU dedicada; en equipos con Intel Arc o iGPUs recientes debería funcionar sin problemas.
- Despliegue: OpenVINO GenAI 2026.4.1 con `Text2ImagePipeline`, `Image2ImagePipeline` o `Flux2KleinPipeline`; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI al tratarse de pesos en formato OpenVINO IR.
- Latencia: no disponible; únicamente se documenta que se validó con 4 pasos de inferencia sobre una iGPU, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Runtime | Licencia |
|---|---|---|---|---|
| flux2-klein-4b-int4-ov (esta ficha) | ~4B | INT4 (OpenVINO) | OpenVINO GenAI | Apache 2.0 |
| black-forest-labs/FLUX.2-klein-4B (original) | ~4B | FP16/BF16 | diffusers / PyTorch | Apache 2.0 |
| SDXL Turbo / variantes compactas (referencia de categoria) | ~2,6B (UNet) | Variable | diffusers / TensorRT | Varia según repositorio |

La ventaja diferencial de esta build frente al modelo original es la reducción de memoria mediante INT4 y la portabilidad a hardware Intel sin dependencia de PyTorch/CUDA, a costa de una posible pérdida de calidad por cuantización (no cuantificada por el autor).

## Limitaciones y advertencias

- No hay datos publicados sobre la pérdida de calidad derivada de la cuantización INT4; puede haber degradación respecto al modelo en precisión completa.
- Repositorio de un usuario individual con 0 descargas en el momento de la ficha: carece de respaldo oficial de Black Forest Labs o Intel; conviene verificar los SHA-256 incluidos en `SHA256SUMS` antes de usarlo en producción.
- El uso está sujeto a los términos del modelo original de Black Forest Labs además de la licencia Apache 2.0, lo que puede imponer restricciones adicionales (por ejemplo, sobre contenidos generados).
- Detalles técnicos del modelo base (contexto del codificador, idiomas soportados, datos de entrenamiento) no están documentados en esta ficha de repositorio.
- Al ser una exportación OpenVINO, no es utilizable con los ecosistemas habituales de diffusers/GGUF sin reconversión.
- Riesgo de generación de contenido sesgado o dañino heredado del modelo base; no se han publicado evaluaciones de seguridad específicas de esta build.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/nishithsharma0301/flux2-klein-4b-int4-ov
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Optimum Intel (herramienta de exportación): https://huggingface.co/docs/optimum/intel/index
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai

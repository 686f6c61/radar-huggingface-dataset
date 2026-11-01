# heypatkay/solume-sdxl-inpainting-coreml

## Resumen

`solume-sdxl-inpainting-coreml` es una conversión a Core ML del modelo de inpainting SDXL 1.0 Inpainting 0.1, publicada por el desarrollador heypatkay para su uso dentro de Solume, una aplicación de fotografía para macOS. El modelo original procede de Stability AI (Stable Diffusion XL 1.0) y el fine-tune de inpainting fue desarrollado por el equipo de diffusers de Hugging Face. Esta conversión no introduce ningún reentrenamiento: se limita a transformar los pesos de PyTorch (safetensors en fp16) a ML Programs de Core ML para su ejecución nativa en Apple silicon.

El paquete incluye tres redes: el UNet (convertido a fp16), y el encoder y el decoder del VAE (mantenidos en fp32 porque el VAE de SDXL desborda en fp16). Los dos text encoders no se distribuyen; en su lugar se incluye `prompts.bin`, un tensor con los embeddings precalculados de cuatro prompts fijos definidos por la aplicación. Esto implica que el modelo no acepta texto libre en tiempo de inferencia: solo funciona con las cuatro indicaciones predefinidas que acompañan al binario.

Es relevante para desarrolladores interesados en desplegar inpainting de alta resolución (1024 px) de forma local en macOS sin dependencias de Python ni de PyTorch, con un pipeline determinista y verificable por SHA-256. No obstante, su alcance es muy restringido: no es un modelo de propósito general y su uso fuera de Solume requiere adaptar los embeddings de texto o recompilar el grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL 1.0 (UNet + VAE + doble text encoder CLIP), convertida a Core ML ML Program |
| Parametros totales | No disponible de forma agregada; pesos del UNet: 5.135.095.872 bytes (fp16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusión; condicionamiento por embeddings de texto fijos) |
| Tipos de cuantizacion | UNet en fp16; VAE encoder y decoder en fp32; sin cuantización int8/int4 publicada |
| Idiomas soportados | No disponible (los prompts están fijados en el binario; el modelo original soporta principalmente inglés) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | Core ML ML Program (`.mlpackage` con `weight.bin`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es SDXL 1.0, un modelo de difusión latente con un UNet de aproximadamente 2.600 millones de parámetros, un VAE con encoder y decoder, y dos text encoders CLIP (OpenCLIP ViT-bigG y CLIP ViT-L). El fine-tune de inpainting añade canales de entrada adicionales al UNet (9 canales en lugar de 4, incorporando la máscara y la imagen enmascarada), lo que permite reconstruir regiones borradas a partir de una máscara binaria. La resolución nativa es 1024×1024 píxeles, que corresponde a latentes de 128×128.

En esta conversión concreta no hay entrenamiento ni ajuste fino: los pesos son idénticos a los del checkpoint `diffusers/stable-diffusion-xl-1.0-inpainting-0.1` en la revisión `115134f363124c53c7d878647567d04daf26e41e`. La conversión se realizó con coremltools 9.0, diffusers 0.42.1, transformers 5.22.0 y torch 2.15.0 sobre macOS 27 en Apple silicon. El UNet se exporta como ML Program fp16 con batch 1 y 9 canales de entrada; el VAE se mantiene en fp32 por problemas de desbordamiento numérico en fp16. Los text encoders se sustituyen por `prompts.bin`, que contiene las salidas de ambos encoders para cuatro prompts fijos, con sus offsets descritos en `prompts.json`. La conversión es determinista para la cadena de herramientas fijada, de modo que dos ejecuciones producen archivos idénticos byte a byte.

## Capacidades

- Inpainting de imágenes a 1024×1024 píxeles: reconstruye la región indicada por una máscara a partir de la imagen de entrada y un prompt.
- Image-to-image condicionado por embeddings de texto precalculados (cuatro prompts fijos definidos por Solume).
- Ejecución nativa en Apple silicon mediante Core ML, sin necesidad de Python, PyTorch ni CUDA en tiempo de inferencia.
- Pipeline determinista y verificable: cada archivo tiene tamaño y SHA-256 fijados, lo que permite validar la integridad de la descarga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre.
- No soporta entrada de texto arbitraria en inferencia; el condicionamiento textual está limitado a los cuatro prompts incluidos.
- No incluye capacidades de audio, vídeo ni visión general más allá del inpainting.

## Casos de uso

- Eliminación generativa de objetos en fotografías (Generative Remove) dentro de la app Solume en macOS: el modelo recibe la imagen y la máscara del objeto a borrar y rellena la región con contenido coherente, aprovechando la resolución nativa de 1024 px.
- Retoque fotográfico local en aplicaciones de escritorio para macOS: integración mediante Core ML para eliminar marcas, personas o elementos no deseados sin enviar la imagen a la nube, lo que preserva la privacidad del usuario.
- Procesamiento por lotes en pipelines de edición automatizada: al ser determinista y no requerir GPU dedicada, puede ejecutarse en equipos Apple silicon para tareas repetitivas de limpieza de imágenes.
- Prototipado de funciones de inpainting en apps nativas de Apple: sirve como referencia de cómo empaquetar un UNet de SDXL en Core ML con VAE en fp32 y embeddings precalculados.
- Verificación de integridad en distribución de modelos: el esquema de SHA-256 por archivo permite a aplicaciones de terceros validar que los pesos descargados no han sido alterados.
- Investigación sobre despliegue de difusión en el ecosistema Apple: útil para medir latencia y consumo de memoria de SDXL inpainting en Core ML frente a implementaciones PyTorch/MPS.
- No es adecuado para generación de imágenes desde cero, edición guiada por texto libre ni tareas fuera del inpainting con los cuatro prompts incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el peso del UNet en fp16 ocupa aproximadamente 5,1 GB; el VAE encoder y decoder suman unos 335 MB en fp32. Se recomienda al menos 8 GB de memoria unificada disponible para cargar el pipeline completo, y 16 GB para operar con holgura junto al sistema.
- GPU recomendadas: Apple silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El modelo está compilado para Core ML y no está pensado para GPU NVIDIA ni AMD.
- Cabe en equipos consumer Apple: sí, en cualquier Mac con Apple silicon y memoria unificada suficiente; no es ejecutable en GPU consumer NVIDIA mediante este paquete.
- Opciones de despliegue: Core ML (framework nativo de Apple). No se distribuyen pesos en safetensors, GGUF ni formatos compatibles con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| solume-sdxl-inpainting-coreml | UNet ~2,6 B (fp16) | 1024×1024, 4 prompts fijos | Core ML | OpenRAIL++-M | Hugging Face (29 descargas) |
| diffusers/stable-diffusion-xl-1.0-inpainting-0.1 | UNet ~2,6 B | 1024×1024, texto libre | safetensors (fp16) | OpenRAIL++-M | Hugging Face (modelo base) |
| stabilityai/stable-diffusion-xl-base-1.0 | UNet ~2,6 B | 1024×1024, texto libre | safetensors | OpenRAIL++-M | Hugging Face |
| stable-diffusion-v1-5-inpainting | UNet ~860 M | 512×512, texto libre | safetensors | CreativeML OpenRAIL-M | Hugging Face |

La diferencia principal frente al checkpoint original de diffusers es el formato (Core ML frente a PyTorch) y la eliminación de los text encoders en favor de embeddings fijos. Frente a SDXL base, este modelo está especializado en inpainting. Frente a SD 1.5 inpainting, ofrece el doble de resolución nativa y mayor calidad, a costa de un tamaño mucho mayor.

## Limitaciones y advertencias

- El condicionamiento textual está limitado a cuatro prompts fijos incluidos en `prompts.bin`; no acepta texto libre en inferencia, lo que restringe gravemente su reutilización fuera de Solume.
- Solo se ejecuta en el ecosistema Apple (Core ML); no hay pesos en safetensors, GGUF ni otros formatos para GPU NVIDIA o AMD.
- El VAE se mantiene en fp32 por desbordamiento en fp16, lo que aumenta el uso de memoria y puede afectar la latencia frente a una implementación totalmente fp16.
- Riesgo de alucinación visual: el inpainting puede generar contenido incoherente o artefactos en regiones grandes, texturas complejas o máscaras mal definidas, como es habitual en modelos de difusión.
- Sesgos heredados del dataset de entrenamiento de SDXL (LAION y otros), con posibles sesgos demográficos, culturales y de representación.
- La licencia CreativeML Open RAIL++-M impone restricciones de uso recogidas en el apartado 5 y el Anexo A; es obligatorio transmitir la licencia y las restricciones a cualquier derivado.
- El autor no reclama derechos sobre las imágenes generadas, pero el usuario es responsable de su uso y de que no contravenga la licencia.
- El repositorio no incluye fotos ni datos de usuario; solo el modelo convertido, la licencia y la model card.
- No se han publicado métricas de calidad (FID, CLIP score) ni benchmarks en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/heypatkay/solume-sdxl-inpainting-coreml
- Modelo base (diffusers): https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1
- SDXL base 1.0 (Stability AI): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Licencia CreativeML Open RAIL++-M: incluida como `LICENSE.md` en el repositorio

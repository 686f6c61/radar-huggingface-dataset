# axonlabsai/axon-image-2-flash-preview

## Resumen

Axon Image 2 Flash Preview es un conjunto de adaptadores LoRA para generación de texto a imagen sobre el modelo base Qwen-Image-2512, publicado por axonlabsai. No contiene pesos base: el repositorio incluye únicamente dos adaptadores de rango 4 (alpha 4), una variante "flash" pensada para ejecutarse junto al adaptador de destilación Lightning de 4 pasos y una variante "pro" que funciona sin destilación. El pipeline completo se construye cargando Qwen-Image-2512 desde Hugging Face, el adaptador Lightning de lightx2v y, encima, el adaptador de este repositorio.

El modelo resuelve el problema de la inferencia rápida en difusión de alta resolución: la variante flash permite generar imágenes de 1024x1024 en 4 pasos con `true_cfg_scale=1.0`, lo que reduce drásticamente el coste computacional frente a los 40 pasos y cfg 4.0 de la variante pro. El repositorio se publica como preview y su objetivo declarado es hacer público el pipeline, los adaptadores redistribuibles y las herramientas de composición, manteniendo privados los adaptadores experimentales por motivos de derechos de autor y contenido restringido.

La relevancia actual reside en su enfoque de destilación por pasos combinada con LoRA de bajo rango y en el ecosistema de herramientas que lo acompaña: un compilador de prompts multi-referencia, un compositor de texto exacto y un cargador de pesos int8. La licencia Apache-2.0, alineada con el modelo base y el adaptador Lightning, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 4, alpha 4) sobre un transformer de difusión (Qwen-Image-2512); pipeline text-to-image basado en flow matching con FlowMatchEulerDiscreteScheduler |
| Parametros totales | No disponible (el repositorio contiene solo adaptadores; el tamaño del repo es 0.1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen; resolución de salida de ejemplo 1024x1024) |
| Tipos de cuantizacion | No disponible de forma oficial; el repositorio incluye `tools/axon_w8.py`, un cargador int8 weight-only para experimentos W8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo es un conjunto de adaptadores LoRA de rango 4 y alpha 4 aplicados sobre Qwen-Image-2512 en su revisión fijada `25468b98e3276ca6700de15c6628e51b7de54a26`. La variante flash se ejecuta junto al adaptador de destilación Lightning de 4 pasos (`lightx2v/Qwen-Image-2512-Lightning`, archivo `Qwen-Image-2512-Lightning-4steps-V1.0-bf16.safetensors`, revisión `a52649c9d0f6e1a248bff13f0df33bb8a2abdb52`), mientras que la variante pro opera sin destilación con 40 pasos y cfg 4.0. El scheduler es un FlowMatchEulerDiscreteScheduler con desplazamiento dinámico exponencial.

El entrenamiento consistió en una continuación ligera de un adaptador existente, no en un LoRA de personaje desde cero: 17 pasos de optimizador para una variante y 21 para la otra, con condicionamiento exacto sobre el modelo base. El repositorio conserva el adaptador inicial de cada variante (`models/*/initial/`) y un delta de regularización (`preservation.safetensors`) para que el cambio sea auditable, además de un `training-identity.json` con la revisión base, el archivo Lightning y el SHA-256 de cada fichero. Los autores advierten que los efectos son pequeños y medibles, sin introducir personajes nuevos con nombre.

## Capacidades

- Generación de texto a imagen de alta resolución (ejemplo oficial a 1024x1024) mediante pipeline QwenImagePipeline.
- Inferencia rápida en 4 pasos con el adaptador Lightning y `true_cfg_scale=1.0` en la variante flash.
- Generación de mayor calidad en 40 pasos con cfg 4.0 en la variante pro.
- Edición de imagen mediante QwenImageEditPlusPipeline sobre Qwen-Image-Edit-2511 con el archivo Lightning de Edit-2511.
- Composición multi-referencia: el prompt se construye con `tools/axon_compose.py` usando la forma `Picture N: …`; según la model card, funciona hasta con 4 referencias en editores de clase klein.
- Superposición de texto exacto mediante `tools/meme_tools.py` para casos en los que el modelo no deletrea correctamente.
- Carga de pesos en int8 weight-only con `tools/axon_w8.py` para experimentos W8.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá de la edición de imagen.

## Casos de uso

- Prototipado rápido de imágenes de producto: la variante flash genera un monitor de estudio sobre escritorio de hormigón en 4 pasos, lo que permite iterar sobre prompts y semillas en segundos y validar direcciones visuales antes de pasar a la variante pro.
- Generación de material para marketing con control de coste: usar 4 pasos y cfg 1.0 reduce el número de evaluaciones del transformer por imagen, adecuado para lotes grandes donde la latencia importa más que el detalle fino.
- Edición guiada por referencia: con QwenImageEditPlusPipeline y el adaptador Edit-2511, se pueden aplicar cambios localizados sobre una imagen existente manteniendo la identidad visual del sujeto.
- Composición multi-referencia para escenas con varios sujetos: el compilador `axon_compose.py` asigna roles explícitos a cada referencia (`Picture 1: …`, `Picture 2: …`), evitando que el modelo use una sola imagen cuando el prompt no define roles.
- Creación de memes y piezas con texto exacto: `meme_tools.py` compone el texto encima de la imagen generada cuando el modelo no reproduce la cadena literal, útil para contenido editorial o redes sociales.
- Experimentación con cuantización int8: el cargador `axon_w8.py` permite medir el impacto de pesos int8 en calidad y VRAM, relevante para desplegar el pipeline en GPUs con memoria limitada.
- Entrenamiento de adaptadores propios sobre el mismo slot: al ser solo adaptadores, un equipo puede entrenar su LoRA sobre material con derechos y cargarlo junto a Lightning sin tocar los pesos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publica ninguna métrica de latencia ni de calidad y que cualquier cifra atribuida a "Axon Image 2" fuera de este repositorio no procede de él.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El pipeline requiere cargar Qwen-Image-2512 en bfloat16, por lo que la VRAM vendrá determinada por el modelo base y no por los adaptadores (0.1 GB de repo).
- GPU recomendadas: no disponible. El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del modelo base Qwen-Image-2512 y de las técnicas de ahorro de memoria aplicadas.
- Opciones de despliegue: diffusers con QwenImagePipeline y QwenImageEditPlusPipeline; el repositorio incluye además un cargador int8 propio (`tools/axon_w8.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La variante flash usa 4 pasos de inferencia y la pro 40 pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|
| Axon Image 2 Flash Preview | LoRA sobre Qwen-Image-2512 | 4 (flash) / 40 (pro) | Apache-2.0 | Público en Hugging Face (solo adaptadores) |
| Qwen-Image-2512 | Modelo base de difusión | No disponible | Apache-2.0 | Público en Hugging Face |
| Qwen-Image-2512-Lightning | Adaptador de destilación | 4 | No disponible en la información | Público en Hugging Face (lightx2v) |
| Qwen-Image-Edit-2511 | Modelo de edición de imagen | No disponible | No disponible en la información | Público en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos base: sin Qwen-Image-2512 y el adaptador Lightning, los adaptadores no son utilizables por sí solos.
- Estado preview: los propios autores lo describen como una publicación para hacer público el pipeline y las herramientas, no como un modelo final.
- Efectos limitados: 17 y 21 pasos de optimizador implican cambios pequeños y medibles; no se deben esperar personajes nuevos con nombre.
- Adaptadores privados: `flash-games-v1` y `flash-games2-v1` (entrenados con ~7.700 fotogramas de vídeos de gameplay de YouTube con derechos de terceros), `flash-gear-v1-experimental` (imágenes de Wikimedia Commons con licencias mixtas), `gated-gore-v1`, `gated-mature-v1` y `lora/axon-flash-lora.safetensors` (sin registro de procedencia) no se distribuyen y no pueden reproducirse con este repositorio.
- Riesgo de alucinación y errores de deletreo: la existencia de `meme_tools.py` como compositor de texto exacto indica que el modelo no garantiza la escritura literal de cadenas.
- Composición multi-referencia frágil: un prompt sin roles explícitos usa solo una referencia, lo que puede producir resultados distintos a los esperados.
- Idiomas soportados no documentados: no hay información sobre calidad multilingüe en los prompts.
- Licencia: Apache-2.0 para el modelo y los adaptadores; las imágenes de terceros referenciadas en los CSV de procedencia conservan sus propias licencias y deben respetarse.
- Sin métricas publicadas de latencia ni calidad: no es posible validar afirmaciones de rendimiento externas al repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axonlabsai/axon-image-2-flash-preview
- Modelo base Qwen-Image-2512: https://huggingface.co/Qwen/Qwen-Image-2512
- Adaptador de destilación Lightning: https://huggingface.co/lightx2v/Qwen-Image-2512-Lightning

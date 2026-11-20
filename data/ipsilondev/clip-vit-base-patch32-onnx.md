# ipsilondev/clip-vit-base-patch32-onnx

## Resumen

`ipsilondev/clip-vit-base-patch32-onnx` es un espejo (mirror) del tower de visión del modelo CLIP ViT-B/32 de OpenAI, convertido a formato ONNX y cuantizado dinámicamente a 8 bits. Lo publica el usuario `ipsilondev` como artefacto interno para sus aplicaciones Ipsilon, orientado a similitud de imágenes en dispositivo (on-device). No es un modelo nuevo ni un reentrenamiento: el archivo `vision_model_quantized.onnx` se copia sin modificar desde el repositorio de Xenova, que a su vez deriva de `openai/clip-vit-base-patch32`.

El modelo resuelve una tarea muy concreta: extraer embeddings de imagen de 512 dimensiones en CPU mediante ONNX Runtime, con un grafo que usa operadores de cuantización dinámica (`DynamicQuantizeLinear`, `MatMulInteger`, `ConvInteger`) que no son compatibles con NNAPI. El repositorio pesa 0,1 GB y contiene un único archivo de 89.117.001 bytes, lo que lo hace adecuado para despliegues ligeros donde no se necesita el tower de texto.

Es relevante como pieza de infraestructura más que como modelo a evaluar: sirve para pipelines de búsqueda visual, deduplicación de imágenes o clasificación zero-shot cuando ya se dispone de los embeddings de texto por otro medio. Al ser un espejo verbatim, su interés técnico está en la trazabilidad del archivo y en las condiciones exactas de preprocesado y normalización que documenta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/32 (tower de visión de CLIP), exportado a ONNX |
| Parametros totales | no disponible (el archivo ONNX cuantizado pesa 89.117.001 bytes; los parámetros del ViT-B/32 original no se detallan en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224 x 224) |
| Tipos de cuantizacion | int8 dinámica (DynamicQuantizeLinear, MatMulInteger, ConvInteger) |
| Idiomas soportados | no disponible (el tower de texto no está incluido) |
| Licencia | MIT |
| Formato de pesos | ONNX (opsets 11, IR version 6, productor `onnx.quantize`) |

## Arquitectura y entrenamiento

El archivo contiene únicamente el tower de visión de CLIP ViT-B/32: un Vision Transformer con parches de 32 x 32 sobre imágenes de 224 x 224, que produce un embedding de 512 dimensiones por imagen. La entrada es `pixel_values` con forma `[batch_size, num_channels, height, width]` en float32 y batch dinámico; la salida es `image_embeds` con forma `[batch_size, 512]`, sin normalización L2. El grafo incluye 50 operadores `DynamicQuantizeLinear`, 73 `MatMulInteger` y 1 `ConvInteger`, lo que confirma una cuantización dinámica a 8 bits orientada a ejecución en CPU.

No hay entrenamiento propio ni ajuste fino: el autor indica que el archivo se copia sin reexportar ni recuantizar desde `Xenova/clip-vit-base-patch32` (commit `6b7c523703ae26e39be4b03774966f8571c7f523`), que a su vez procede de `openai/clip-vit-base-patch32`. Por tanto, los datos de entrenamiento son los de CLIP original (pares imagen-texto a gran escala), pero no se documentan en esta ficha el número de tokens, la composición del dataset ni las etapas de RLHF/DPO, por lo que se consideran no disponibles en la información proporcionada.

## Capacidades

- Extracción de embeddings de imagen de 512 dimensiones a partir de imágenes RGB de 224 x 224.
- Similitud de imágenes mediante producto escalar o coseno tras normalización L2 de los embeddings.
- Búsqueda visual y recuperación de imágenes por similitud en espacio latente.
- Deduplicación y agrupamiento (clustering) de imágenes.
- Base para clasificación zero-shot si se combina con embeddings de texto obtenidos de otro modelo CLIP compatible.
- Ejecución en CPU mediante ONNX Runtime, con batch dinámico.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modo thinking: es un extractor de características visuales.
- No soporta visión generativa ni descripción de imágenes; solo produce vectores.

## Casos de uso

- Búsqueda visual en aplicaciones móviles o de escritorio: se preprocesa la imagen según la receta de OpenAI CLIP (redimensionar lado corto a 224 bicúbico, recorte central 224 x 224, RGB, escala [0,1], normalización con media `[0.48145466, 0.4578275, 0.40821073]` y desviación `[0.26862954, 0.26130258, 0.27577711]`, layout NCHW float32) y se obtiene un vector de 512 dimensiones para comparar contra un índice.
- Deduplicación de catálogos de imágenes: al ejecutarse en CPU con un grafo int8 de ~89 MB, permite procesar lotes grandes sin GPU y detectar duplicados por similitud coseno tras normalizar los embeddings.
- Moderación o agrupamiento de contenido visual: clustering de imágenes por similitud para etiquetar conjuntos no supervisados antes de una revisión humana.
- Recomendación visual: construir un índice vectorial de productos o contenidos y recuperar los más parecidos a una imagen de referencia.
- Preprocesado para pipelines de clasificación zero-shot: usar los embeddings de imagen como entrada a un clasificador que compare con prototipos de texto generados por otro modelo CLIP.
- Aplicaciones on-device con requisitos de privacidad: al no requerir GPU ni enviar imágenes a un servidor, encaja en apps que procesan imágenes localmente.
- Filtrado previo en sistemas de visión más pesados: usar el embedding como señal barata para descartar candidatos antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el grafo está cuantizado para CPU; para ejecución en GPU con ONNX Runtime se desconoce el consumo exacto y no está documentado.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU (los operadores `DynamicQuantizeLinear`, `MatMulInteger` y `ConvInteger` no son compatibles con NNAPI).
- ¿Cabe en GPU de consumo? El archivo pesa ~89 MB, por lo que en términos de almacenamiento cabría en cualquier GPU moderna, pero no se documenta su rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (uso documentado por el autor); otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `ipsilondev/clip-vit-base-patch32-onnx` | no disponible (ViT-B/32, ~89 MB int8) | imagen 224 x 224 | embedding 512-d | MIT | ONNX int8 dinámico | Solo tower de visión, espejo de Xenova |
| `Xenova/clip-vit-base-patch32` | ViT-B/32 | imagen 224 x 224 | embedding 512-d | MIT | ONNX (incluye conversión) | Origen directo del archivo; incluye más artefactos |
| `openai/clip-vit-base-patch32` | ViT-B/32 | imagen 224 x 224 | embedding 512-d | MIT | PyTorch (safetensors/bin) | Modelo original con tower de texto e imagen |
| `openai/clip-vit-base-patch16` | ViT-B/16 | imagen 224 x 224 | embedding 512-d | MIT | PyTorch | Variante con parches más pequeños; no disponible en esta comparativa con datos de rendimiento |

## Limitaciones y advertencias

- Es un espejo verbatim: no hay reexportación ni recuantización, por lo que cualquier problema del archivo original se hereda tal cual.
- Solo incluye el tower de visión; no puede generar embeddings de texto ni realizar clasificación zero-shot por sí solo.
- La salida `image_embeds` no está normalizada L2; es obligatorio normalizar antes de calcular similitud coseno, tal como advierte el autor.
- Los operadores de cuantización dinámica no son compatibles con NNAPI, lo que limita el despliegue en Android mediante esa API.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez en la información proporcionada.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar la procedencia y los términos del modelo original de OpenAI CLIP.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-20; no hay evidencia de uso en producción fuera de las apps del autor.
- No se especifican idiomas soportados porque el componente de texto no está incluido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/clip-vit-base-patch32-onnx
- Modelo de origen de la conversión: https://huggingface.co/Xenova/clip-vit-base-patch32
- Modelo original de OpenAI CLIP: https://huggingface.co/openai/clip-vit-base-patch32
- Repositorio de código de OpenAI CLIP: https://github.com/openai/CLIP
- Commit de referencia en Xenova: `6b7c523703ae26e39be4b03774966f8571c7f523`

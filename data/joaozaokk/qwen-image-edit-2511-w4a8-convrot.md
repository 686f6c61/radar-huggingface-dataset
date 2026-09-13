# JoaoZaokk/Qwen-Image-Edit-2511-W4A8-ConvRot

## Resumen

Qwen-Image-Edit-2511-W4A8-ConvRot es una versión cuantizada del modelo de difusión Qwen-Image-Edit-2511, publicada por el usuario JoaoZaokk. Convierte los pesos originales en BF16 (38,05 GiB) a un único archivo safetensors de 10,79 GiB con pesos de 4 bits y activaciones de 8 bits (W4A8), una reducción de 3,53x en tamaño y 1,77x más compacto que la cuantización INT8 oficial distribuida por Comfy-Org. El objetivo declarado no es solo ofrecer un build ligero, sino documentar con mediciones reproducibles por qué la ruta de activaciones en 4 bits destruye este modelo.

El interés técnico de la ficha reside en el método: las 840 capas lineales de los 60 bloques transformer fueron calibradas individualmente con activaciones reales generadas durante el muestreo, y se publica el error relativo por capa de cada formato frente a una referencia float32. El resultado principal es que W4A8 mantiene una divergencia de 0,4997 respecto al latente BF16 de referencia, mientras que W4A4 (1,7440) y una variante mixta (1,8846) producen ruido puro, pese a que el error por capa de W4A4 (0,1080 de mediana) es inferior al de otros modelos que sí renderizan bien con 4 bits.

Es relevante ahora porque ataca el cuello de botella de VRAM en edición de imágenes generativa: 8,3 GiB menos que el INT8 oficial a costa de un 12% más de latencia por paso. El repositorio tiene 0 descargas y 0 likes, y fue creado el 12 de septiembre de 2026, por lo que se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) heredado del modelo base Qwen-Image-Edit-2511; 60 bloques transformer con 14 familias de capas lineales (840 capas en total) y dimensión oculta 3072; atención con proyecciones separadas y flujos de texto e imagen con modulación independiente (txt_mod, img_mod) |
| Parámetros totales | 20.430.401.088, sumados del header de safetensors del origen BF16 (1934 tensores), no estimados a partir del tamaño de archivo |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es un modelo de difusión imagen a imagen y no expone ventana de contexto de texto |
| Tipos de cuantización | W4A8: pesos int4 asimétricos (`asym_w4a8_int8`) con activaciones int8; `group_size` 16 y rotación ConvRot con `convrot_groupsize` 256 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en archivo único (librería `diffusion-single-file`); `qwen_image_edit_2511_w4a8.safetensors`, 11.581.151.872 bytes (10,79 GiB) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una conversión cuantizada del checkpoint `qwen_image_edit_2511_bf16.safetensors` (40.861.031.560 bytes, sha256 `0ae1768041ecad9c09ca8f989d2f9253148fe75baa3b923112181bc4949ef248`). La información disponible no detalla el dataset, el número de tokens ni las etapas de alineación (RLHF/DPO) del modelo base Qwen-Image-Edit-2511, por lo que esos datos deben consultarse en la ficha del modelo original. Lo que sí documenta esta publicación es la estructura interna: 60 bloques transformer, cada uno con 14 familias de capas lineales, con formas que confirman una dimensión oculta de 3072 y proyecciones MLP de 3072→12288, además de capas de modulación de 18432→3072.

La innovación técnica del release es el pipeline de cuantización. Se aplica una rotación ConvRot (con tamaño de grupo 256) antes de cuantizar, y los pesos se almacenan en formato asimétrico de 4 bits con `group_size` 16. Las 840 capas lineales fueron calibradas, y el autor publica el error relativo de cada formato contra una referencia float32 medida sobre las filas de activación que el modelo produce realmente durante el muestreo. Un aspecto relevante es que todas las capas cuantizadas resuelven a `comfy_kitchen.backends.cuda` en las cuatro operaciones que toca el conversor, lo que liga el artefacto al ecosistema ComfyUI. El hallazgo central del trabajo es que el colapso no proviene de los pesos: W4A8 y W4A4 comparten pesos de 4 bits, y solo se diferencian en la ruta de activaciones (8 bits frente a 4 bits). Una variante mixta con 233 de 840 capas ya promovidas a activaciones de 8 bits, con un error efectivo por capa de 0,0744, sigue produciendo ruido, lo que sugiere que dejar cualquier capa en la ruta de 4 bits es suficiente para romper el modelo.

## Capacidades

- Edición de imágenes condicionada por texto (image-to-image), en inglés.
- Generación de imágenes a 1024 px con 20 pasos de muestreo, cfg 2.5 y scheduler euler/simple, que es la configuración empleada en las mediciones publicadas.
- Ejecución dentro de ComfyUI como archivo único cargable (`diffusion-single-file`), con backend CUDA propio del ecosistema Comfy.
- Inferencia con huella de memoria reducida: 10,79 GiB de pesos frente a 38,05 GiB en BF16 y 19,09 GiB en el INT8 oficial.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido conversacional.
- Capacidades multilingües: no disponibles; la model card declara únicamente inglés (`en`).
- No dispone de modo thinking, audio ni comprensión visual conversacional; la imagen de entrada actúa como condición de edición, no como entrada a un pipeline de razonamiento multimodal.

## Casos de uso

- Edición de imágenes en GPUs de consumo con 16 GB de VRAM: el archivo de 10,79 GiB deja margen para las activaciones y el resto del pipeline en tarjetas como RTX 4080, RTX 4090 o RTX 3090, donde el BF16 original (38,05 GiB) no cabría sin offloading agresivo.
- Despliegue de bajo coste en la nube: reducir el peso en memoria de 19,09 GiB (INT8) a 10,79 GiB permite usar instancias con menos VRAM y abaratar el coste por imagen en servicios de edición fotográfica.
- Pipelines de edición por lotes en ComfyUI: al ser un archivo único compatible con el nodo de carga de safetensors de difusión, se integra directamente en grafos existentes sin convertir el checkpoint por separado.
- Retoque fotográfico asistido en aplicaciones de escritorio: generar variaciones o correcciones de una imagen de partida a 1024 px en aproximadamente 31,5 segundos por imagen (20 pasos × 1,575 s/paso en RTX 3090).
- Investigación en cuantización de modelos de difusión: la publicación incluye el registro completo de mediciones por capa y el repositorio de la herramienta, lo que permite reproducir el experimento y extenderlo a otras arquitecturas.
- Prototipado rápido de productos de generación de imagen donde la VRAM es la restricción vinculante y una latencia un 12% mayor por paso respecto al INT8 oficial resulta aceptable.
- Comparación controlada de formatos de cuantización: sirve como referencia negativa documentada para justificar por qué no conviene bajar las activaciones a 4 bits en arquitecturas con capas de modulación y proyecciones de salida sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de calidad de imagen (FID, CLIPScore, SSIM) en la información disponible. Lo que sí se publica es un banco de mediciones propio sobre 12 renders (6 prompts × 2 semillas, 20 pasos, 1024 px, cfg 2.5, euler/simple) ejecutados en una única RTX 3090, con la divergencia definida como la distancia relativa media respecto al latente BF16 de referencia, emparejada ejecución por ejecución.

| Build | Pesos | Activaciones | GiB | Divergencia | s/paso | Imagen |
|---|---|---|---|---|---|---|
| BF16 origen | 16 bits | 16 bits | 38,05 | — | 5,693 | correcta |
| `int8_convrot` (Comfy-Org) | 8 bits | 8 bits | 19,09 | 0,1942 | 1,410 | correcta |
| `qwen_image_edit_2511_w4a8` (este repo) | 4 bits | 8 bits | 10,79 | 0,4997 | 1,575 | correcta |
| `qwen_image_edit_2511_w4a4` | 4 bits | 4 bits | 9,60 | 1,7440 | 1,053 | ruido |
| `qwen_image_edit_2511_mixed` | 4 bits | 4 bits en 607/840 | 9,88 | 1,8846 | 1,236 | ruido |

Error relativo por capa medido sobre activaciones reales (840 capas, todas calibradas):

| Formato | Mediana | p25 | p75 | Máximo |
|---|---|---|---|---|
| `err_bf16` (suelo) | 0,0020 | 0,0019 | 0,0022 | 0,0028 |
| `err_w4a4` | 0,1080 | 0,0794 | 0,1571 | 0,2953 |
| `err_w4a8` | 0,0358 | 0,0269 | 0,0493 | 0,0804 |

Error mediano por familia de capas (las más y menos costosas):

| Familia | Forma | `err_w4a4` | `err_w4a8` | Ratio |
|---|---|---|---|---|
| `attn.to_out.0` | [3072, 3072] | 0,2101 | 0,0589 | 3,57x |
| `txt_mlp.net.2` | [3072, 12288] | 0,1953 | 0,0583 | 3,35x |
| `attn.to_add_out` | [3072, 3072] | 0,1924 | 0,0486 | 3,96x |
| `img_mod.1` | [18432, 3072] | 0,0281 | 0,0068 | 4,11x |
| `txt_mod.1` | [18432, 3072] | 0,0248 | 0,0060 | 4,14x |

## Requisitos de hardware

- VRAM estimada: 10,79 GiB solo para los pesos en el formato W4A8; hay que sumar activaciones y memoria del pipeline de muestreo. En la práctica requiere una GPU con al menos 16 GB para operar con holgura a 1024 px.
- GPU empleada en las mediciones: una única RTX 3090, con 1,575 s/paso y aproximadamente 31,5 s por imagen de 20 pasos.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4080, RTX 4090 y tarjetas con 16 GB o más. No cabría en GPUs de 8-12 GB sin offloading a RAM.
- Alternativas de mayor VRAM: A100, H100 y L40S son viables pero no aportan ventaja de capacidad, ya que el modelo ya cabe en consumer; solo mejorarían el throughput.
- Opciones de despliegue: ComfyUI mediante la librería `diffusion-single-file`, con las capas cuantizadas resolviendo a `comfy_kitchen.backends.cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: 1,575 s/paso a 1024 px en RTX 3090, un 12% más lento por paso que el INT8 oficial (1,410 s/paso) y un 72% más rápido que el BF16 (5,693 s/paso). Cada ejecución del banco consta de 12 renders.

## Comparativa con modelos similares

| Modelo | Pesos / activaciones | Tamaño | Divergencia | s/paso | Calidad | Licencia / disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Image-Edit-2511 BF16 | 16 bits / 16 bits | 38,05 GiB | Referencia | 5,693 | Correcta | Apache 2.0 (modelo base) |
| `int8_convrot` (Comfy-Org) | 8 bits / 8 bits | 19,09 GiB | 0,1942 | 1,410 | Correcta | Apache 2.0, distribución oficial |
| **Este repo (`w4a8`)** | **4 bits / 8 bits** | **10,79 GiB** | **0,4997** | **1,575** | **Correcta** | Apache 2.0, publicación de terceros |
| `qwen_image_edit_2511_w4a4` | 4 bits / 4 bits | 9,60 GiB | 1,7440 | 1,053 | Ruido | Apache 2.0 |
| `qwen_image_edit_2511_mixed` | 4 bits / 4 bits en 607 de 840 capas | 9,88 GiB | 1,8846 | 1,236 | Ruido | Apache 2.0 |

Frente al INT8 oficial, el intercambio declarado por el autor es explícito: 1,77x menos peso, 1,12x más lento por paso y 2,57x más lejos del latente de referencia. No se dispone de comparativas con otros modelos de edición de imagen de la misma categoría en la información proporcionada, ni de métricas de calidad objetivas que permitan situarlo frente a alternativas como FLUX o SD3.

## Limitaciones y advertencias

- Las activaciones en 4 bits inutilizan el modelo: tanto W4A4 como la variante mixta producen ruido estático. No es una degradación gradual, sino un colapso, y basta con dejar una sola capa en esa ruta para que ocurra.
- El criterio de error por capa sirve como ranking, no como umbral. Un error mediano de 0,1080 por capa es el más bajo que ha producido ruido en este banco, inferior a los 0,1199 y 0,1254 de otros modelos que sí renderizan correctamente en W4A4.
- La divergencia de 0,4997 respecto a la referencia BF16 es 2,57x mayor que la del INT8 oficial (0,1942); el autor la califica de aceptable visualmente, pero no se aportan métricas perceptuales objetivas.
- La evidencia experimental se limita a 12 renders, 6 prompts y 2 semillas en una sola GPU: es una muestra pequeña para generalizar sobre calidad en dominios diversos.
- Mayor latencia por paso que el INT8 oficial (1,575 frente a 1,410 s/paso), por lo que si el cuello de botella es la latencia y no la VRAM, el build de Comfy-Org es preferible.
- Idioma: solo inglés declarado; no hay evidencia de comportamiento con prompts en castellano.
- Dependencia del ecosistema ComfyUI: todas las capas cuantizadas resuelven a `comfy_kitchen.backends.cuda`, lo que limita su uso con otros cargadores o runtimes.
- Riesgo de sesgos y alucinación visual: no se documenta ningún análisis de sesgos ni de fidelidad de edición en la información disponible. Al ser un modelo de difusión, el equivalente a la alucinación es la modificación no solicitada de regiones de la imagen.
- Licencia: el archivo se declara Apache 2.0 y el modelo base también; conviene verificar los términos del repositorio original de Qwen antes de uso comercial.
- Publicación sin tracción: 0 descargas y 0 likes en el momento de la consulta, con creación el 12 de septiembre de 2026, por lo que no existe validación independiente del artefacto.
- El propio autor advierte que dos hipótesis de transferencia entre arquitecturas (monotonicidad por tamaño y ratio de `group_size`) quedaron refutadas en este banco, lo que desaconseja extrapolar los umbrales a otros modelos.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/JoaoZaokk/Qwen-Image-Edit-2511-W4A8-ConvRot
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio del autor con método, herramientas y registro completo de mediciones: https://github.com/JoaoZaokk/comfy-quant-bench
- Build INT8 de Comfy-Org (`int8_convrot`): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a otro producto sin relación.

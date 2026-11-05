# OzzyGT/idol_diffusers

## Resumen

Idol Diffusers es una conversión al ecosistema Diffusers del modelo `speridlabs/idol`, un sistema de generación de *Gaussian splats* 3D a partir de una única imagen. El repositorio, publicado por OzzyGT, no contiene código de inferencia propio: únicamente aloja los pesos y configuraciones del denoiser, el decodificador de octree, el decodificador gaussiano y sus dos codificadores de imagen (DINOv3 y el VAE de FLUX.2). La ejecución se realiza a través de los bloques modulares `OzzyGT/idol_custom_blocks`, que sí incluyen el código del pipeline.

El modelo resuelve la tarea de *image-to-3D*: dada una imagen RGB de 1024x1024 con el objeto recortado y compuesto sobre fondo negro, produce un conjunto de gaussianas 3D activadas (posiciones, colores, escalas, rotaciones y opacidades) junto con la cámara de entrada estimada. Esto permite renderizar el objeto desde nuevos puntos de vista y exportarlo a formato estándar `.ply` de 3DGS para visores convencionales.

Es relevante porque combina un codificador de imagen de última generación (DINOv3 ViT-H/16+) con un VAE de FLUX.2 y un pipeline de difusión modular, lo que facilita su integración en flujos de trabajo basados en Diffusers. El repositorio es muy reciente (noviembre de 2026), con cero descargas y cero likes en el momento de redactar esta ficha, y su licencia es compuesta (`idol-with-third-party-components`), lo que exige revisar el fichero NOTICE antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion modular para image-to-3D (denoiser + decodificador de octree + decodificador gaussiano), con codificadores DINOv3 ViT-H/16+ y VAE de FLUX.2 |
| Parametros totales | 370.550.677 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de imagen a 3D) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el ejemplo usa `torch.bfloat16`) |
| Idiomas soportados | en |
| Licencia | idol-with-third-party-components (pesos Idol Apache-2.0; DINOv3 License; VAE FLUX.2 Apache-2.0) |
| Formato de pesos | safetensors (via diffusers / ModularPipeline) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión aplicado a la generación de *Gaussian splats*. El pipeline encadena un denoiser que opera sobre latentes, un decodificador de octree que estructura la representación espacial y un decodificador gaussiano que produce los parámetros finales de cada gaussiana (posición, color, escala, rotación y opacidad). La imagen de entrada se codifica con DINOv3 ViT-H/16+ (variante `facebook/dinov3-vith16plus-pretrain-lvd1689m`, almacenada en bfloat16) y con el VAE de FLUX.2 (`black-forest-labs/FLUX.2-klein-4B`, sin modificar). El ejemplo de la model card genera 262.144 gaussianas en 50 pasos de muestreo con semilla 42.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite a la ficha original de `speridlabs/idol` para esos detalles. La innovación técnica destacable es la conversión a *Modular Diffusers* (`diffusers==0.42.1`), que permite cargar el pipeline con `ModularPipeline.from_pretrained` y `trust_remote_code=True`, y la separación limpia entre pesos (este repo) y código (repo de bloques). El modelo base declarado incluye `speridlabs/idol`, `facebook/dinov3-vith16plus-pretrain-lvd1689m` y `black-forest-labs/FLUX.2-klein-4B`.

## Capacidades

- Generación de *Gaussian splats* 3D a partir de una única imagen RGB de 1024x1024.
- Predicción de la cámara de entrada junto con las gaussianas (`camera_latents`).
- Salida de gaussianas activadas: posiciones, colores, escalas, rotaciones y opacidades.
- Exportación a formato estándar 3DGS `.ply` mediante la receta de diffusers-recipes.
- Renderizado en visores de Gaussian splatting convencionales (el vídeo de ejemplo muestra un turntable).
- Integración con el ecosistema Diffusers mediante `ModularPipeline` y bloques modulares.
- Soporte de `trust_remote_code=True` para cargar el código de los bloques.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni thinking mode.

## Casos de uso

- **Reconstrucción 3D de productos para e-commerce**: a partir de una foto de catálogo recortada sobre fondo negro se genera un splat 3D que permite al cliente rotar el producto en un visor web, sin necesidad de escaneo multi-vista.
- **Prototipado rápido de assets para videojuegos**: conversión de concept art o ilustraciones a representaciones 3D gaussianas para previsualizar volumetría antes de modelar la malla definitiva.
- **Generación de contenido para realidad aumentada**: creación de splats 3D de objetos físicos a partir de una sola foto para superponerlos en escenas AR mediante visores 3DGS.
- **Catalogación y digitalización de patrimonio**: captura de piezas museísticas con una única imagen preparada y exportación a `.ply` para archivo y visualización interactiva.
- **Pipelines de investigación en visión 3D**: uso del pipeline modular dentro de Diffusers para experimentar con variantes del denoiser o del decodificador gaussiano sin reescribir la infraestructura.
- **Generación de datasets sintéticos 3D**: producción automatizada de splats a partir de imágenes 2D etiquetadas para entrenar otros modelos de reconstrucción o de *novel view synthesis*.
- **Previsualización en herramientas de diseño**: integración del pipeline en un editor que permita al diseñador ver su ilustración en 3D con un solo clic, usando la salida de gaussianas y la cámara estimada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el ejemplo oficial usa `pipe.to("cuda")` con `dtype=torch.bfloat16`. El tamaño del repo es de 4,5 GB, lo que da una cota inferior orientativa para cargar los pesos en bfloat16.
- GPU recomendadas: no especificadas por el autor. Por el uso de bfloat16 y DINOv3 ViT-H/16+, se requiere una GPU con soporte de bfloat16 (Ampere o posterior).
- ¿Cabe en GPU de consumo? No confirmado por el autor; el tamaño de pesos (4,5 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: `diffusers==0.42.1` con `ModularPipeline`, `transformers==5.14.1`, `accelerate>=1.14`, `safetensors>=0.8`, `numpy` y `pillow`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles. El ejemplo de referencia usa 50 pasos de muestreo y 262.144 gaussianas, pero no se indica el tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/idol_diffusers | 370,5 M | no aplica | image-to-3D (Gaussian splatting) | idol-with-third-party-components | HuggingFace, diffusers |
| speridlabs/idol | no disponible | no aplica | image-to-3D (Gaussian splatting) | Apache-2.0 (pesos) | HuggingFace |
| FLUX.2-klein-4B (VAE reutilizado) | no disponible | no aplica | generacion de imagen | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada. La comparativa se limita a los modelos referenciados en la propia model card.

## Limitaciones y advertencias

- Requiere una imagen de entrada preparada: 1024x1024, objeto recortado con margen y compuesto sobre fondo negro. La calidad del resultado depende de este preprocesado.
- El pipeline devuelve gaussianas activadas y la cámara estimada, no un fichero `.ply`; la exportación requiere la receta externa de diffusers-recipes.
- Uso de `trust_remote_code=True`: ejecuta código Python descargado del Hub (repo de bloques). Solo debe usarse con repositorios de confianza y revisando el código.
- Licencia compuesta (`idol-with-third-party-components`): los pesos Idol son Apache-2.0, pero el codificador DINOv3 tiene su propia licencia (DINOv3 License) y el VAE de FLUX.2 es Apache-2.0. Es obligatorio revisar el fichero NOTICE antes de uso comercial.
- Idioma declarado: únicamente inglés (`en`); no se documentan capacidades multilingües.
- Riesgo de alucinación geométrica: como modelo generativo, puede producir splats con geometría plausible pero incorrecta respecto al objeto real.
- Sesgos: no documentados por el autor; al entrenarse sobre un dataset no especificado, puede heredar sesgos de las imágenes de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni casos de producción reportados.
- No se documentan limitaciones de contexto ni de idioma más allá de las indicadas, al no ser un modelo de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/OzzyGT/idol_diffusers
- Modelo original: https://huggingface.co/speridlabs/idol
- Bloques modulares: https://huggingface.co/OzzyGT/idol_custom_blocks
- SDK de Idol: https://github.com/speridlabs/idol-sdk
- Receta diffusers-recipes: https://github.com/asomoza/diffusers-recipes/blob/main/models/idol/scripts/base_example.py
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE FLUX.2: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Fichero NOTICE: https://huggingface.co/OzzyGT/idol_diffusers/blob/main/NOTICE
- Ejemplos (imagen de entrada y vídeo): https://huggingface.co/datasets/OzzyGT/diffusers-examples

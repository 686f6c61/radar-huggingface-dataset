# kush2000/Ming-Image-0.2-Design-ComfyUI-Quants

## Resumen

Ming-Image-0.2-Design-ComfyUI-Quants es un conjunto de cuantizaciones del modelo de generación de imágenes a partir de texto inclusionAI/Ming-Image-0.2-Design, empaquetadas específicamente para ComfyUI por el usuario kush2000. El modelo base está orientado a diseño gráfico y renderizado de texto en imágenes, e incorpora un text encoder de tipo MoE (Ling Mini 2.0) junto con un transformer de difusión (DiT) de 202 capas lineales. La aportación de este repositorio no es un modelo nuevo, sino una redistribución de pesos en formatos W4A8 y W3A8 que reduce drásticamente los requisitos de VRAM.

El paquete completo pasa de 49,24 GB en BF16 o 25,94 GB en INT8 a tan solo 12,00 GB en su configuración más ligera, lo que permite ejecutar el pipeline en GPUs de consumo de 8 a 16 GB. Las cuantizaciones usan los kernels nativos `comfy_kitchen` de ComfyUI (asym_w4a8_int8, w3a8_int8, int8_tensorwise ConvRot), por lo que no requieren nodos personalizados y funcionan tanto en NVIDIA como en AMD ROCm.

Es relevante ahora porque democratiza el acceso a un modelo de generación de imágenes de gama alta con capacidades de diseño gráfico y renderizado tipográfico, que de otro modo exigiría hardware de centro de datos. El repositorio incluye además flujos de trabajo listos para arrastrar y soltar en ComfyUI, segmentados por presupuesto de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image con text encoder MoE (Ling Mini 2.0) y DiT de 202 capas lineales |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el text encoder usa 38 bancos de expertos MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (4 bits pesos, 8 bits activaciones), W3A8 (3 bits pesos, 8 bits activaciones), INT8 tensorwise |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

El modelo base Ming-Image-0.2-Design emplea una arquitectura de difusión con un transformer (DiT) como generador principal, compuesto por 202 capas lineales cuantizadas en este repositorio. El componente de codificación de texto es Ling Mini 2.0, un modelo de mezcla de expertos (MoE) con 38 bancos de expertos; en las variantes cuantizadas solo se comprimen estos bancos, dejando intactas las capas de atención, el conector, la visión y los embeddings en la versión W4A8 estándar. La variante ultra-low-VRAM aplica además W4A8 a 297 capas lineales del conector y del thinker, e INT8 a visión y embeddings.

Las cuantizaciones utilizan cuantización por grupos (group size 16) con técnica Lloyd-Max asimétrica y ConvRot de 256, implementadas en los kernels `comfy_kitchen` de ComfyUI. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. El VAE se mantiene en BF16 (0,25 GB) y se toma del repositorio oficial Comfy-Org/Ming-Image.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con soporte para resolución de hasta 2048×2048 en la configuración de 16 GB.
- Diseño gráfico: el modelo base está especializado en composiciones de diseño, lo que incluye layout, tipografía y elementos gráficos.
- Renderizado de texto en imágenes (text rendering), una capacidad poco habitual en modelos de difusión.
- Soporte de canal alfa (RGBA), según las etiquetas del repositorio.
- Ejecución nativa en ComfyUI sin nodos personalizados, usando CLIPLoader (type="qwen_image") y UNETLoader.
- Compatibilidad con GPUs NVIDIA y AMD ROCm mediante kernels comfy_kitchen.
- Flujos de trabajo preconfigurados para tres presupuestos de VRAM (16 GB, 12 GB y 8 GB) con VAE tiled en los modos de menor memoria.
- No se ha documentado soporte de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de imágenes.

## Casos de uso

- Generación de creatividades publicitarias: el modelo puede producir piezas gráficas con texto integrado (titulares, claims, logotipos) en resoluciones de hasta 2048×2048, adecuado para banners y posts de redes sociales sin necesidad de postprocesado tipográfico.
- Diseño de mockups de producto: gracias a su especialización en diseño gráfico, permite generar envases, etiquetas y packaging con texto legible, útil en fases de ideación rápida.
- Prototipado de interfaces y material de marca: equipos de diseño pueden iterar sobre paletas, composiciones y tipografías en local con una GPU de 12-16 GB, sin depender de servicios en la nube.
- Generación de imágenes con transparencia (RGBA): la salida con canal alfa facilita la integración directa de assets en pipelines de composición (After Effects, Figma, web) sin recorte manual.
- Estaciones de trabajo con VRAM limitada: la variante de 8 GB (encoder de 9,03 GB en CPU + DiT W3A8 de 2,72 GB) permite ejecutar el pipeline completo en GPUs de consumo como RTX 3060 o RTX 4060, habilitando flujos de generación local para estudios pequeños.
- Automatización de contenido editorial: integrado en ComfyUI mediante sus workflows JSON, se puede encadenar con otros nodos para generar ilustraciones de artículos, portadas o thumbnails de forma batch.
- Investigación en cuantización de modelos de difusión: el repositorio sirve como referencia reproducible de esquemas W4A8/W3A8 con Lloyd-Max y ConvRot sobre un pipeline text-to-image complejo con componente MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las comparaciones visuales lado a lado y los números de benchmark están en proceso de subida, pero no se incluyen datos numéricos en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada según configuración:
  - Calidad máxima (16 GB): encoder W4A8 de 12,81 GB + DiT INT8, workflow a 2048×2048. Requiere 16 GB de VRAM y 16 GB de RAM.
  - Equilibrada (12 GB): encoder W3A8 de 10,90 GB + DiT W4A8 de 3,49 GB, con VAE tiled. Requiere 12 GB de VRAM y 16 GB de RAM.
  - Ultra-low-VRAM (8 GB): encoder W3A8 ultra de 9,03 GB en CPU + DiT W3A8 de 2,72 GB, con VAE tiled. Requiere 8-12 GB de VRAM y 12-16 GB de RAM.
- GPUs recomendadas: RTX 4090, RTX 4080, A100 o H100 para la configuración de 16 GB; RTX 4070 Ti, RTX 3080 o RTX 4070 para 12 GB; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4060 8 GB para la configuración ultra-low-VRAM.
- Cabe en GPU de consumo: sí, desde 8 GB de VRAM en la variante ultra-low-VRAM, y desde 12-16 GB para las variantes de mayor calidad.
- Opciones de despliegue: ComfyUI nativo (versión >= 0.46.0) con CLIPLoader y UNETLoader; compatible con diffusers por el formato safetensors; los kernels comfy_kitchen soportan NVIDIA y AMD ROCm. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ming-Image-0.2-Design-ComfyUI-Quants (este) | no disponible | no disponible | MIT | Hugging Face | Cuantizaciones W4A8/W3A8 para ComfyUI, 12 GB mínimo |
| inclusionAI/Ming-Image-0.2-Design (base) | no disponible | no disponible | MIT | Hugging Face | Pesos BF16 originales, 49,24 GB |
| Comfy-Org/Ming-Image | no disponible | no disponible | MIT | Hugging Face | Repackaging INT8 oficial, 25,94 GB |
| Modelos de difusión con renderizado de texto (p. ej. Qwen-Image, FLUX) | no disponible | no disponible | variable | Hugging Face | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- El repositorio es una cuantización, no un modelo entrenado desde cero: hereda íntegramente los sesgos y limitaciones del modelo base inclusionAI/Ming-Image-0.2-Design.
- Las cuantizaciones W3A8 y la variante ultra-low-VRAM introducen pérdida de calidad respecto a BF16; la model card no cuantifica esa degradación con métricas objetivas.
- La variante ultra-low-VRAM mueve el encoder de 9,03 GB a CPU, lo que incrementa la latencia de forma notable en comparación con las configuraciones que caben íntegramente en VRAM.
- Riesgo de alucinación visual y de errores en el renderizado de texto: no se han publicado evaluaciones sobre fidelidad tipográfica ni sobre tasas de error en texto generado.
- No se dispone de información sobre idiomas soportados, por lo que el rendimiento multilingüe en el texto renderizado es desconocido.
- Requiere ComfyUI >= 0.46.0 para cargar los kernels comfy_kitchen; versiones anteriores no podrán usar estos pesos de forma nativa.
- La licencia MIT del modelo base y del repackaging permite uso comercial, pero conviene verificar las condiciones del modelo original inclusionAI/Ming-Image-0.2-Design antes de desplegarlo en producción.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, y la subida de pesos estaba en curso según la model card: verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kush2000/Ming-Image-0.2-Design-ComfyUI-Quants
- Modelo base: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- Repackaging INT8 de Comfy-Org: https://huggingface.co/Comfy-Org/Ming-Image
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Diffusers: https://github.com/huggingface/diffusers

# RunningHubAI/rh-character-design-lora

## Resumen

rh-character-design-lora es un adaptador LoRA de texto a imagen publicado por RunningHubAI en Hugging Face. Su función es especializar un modelo base de difusión en la generación de hojas de diseño de personajes (character sheets): vistas múltiples de un mismo personaje, guía de color, fondo blanco simple y poses dinámicas, un formato habitual en preproducción de animación, videojuegos e ilustración.

El adaptador se ha afinado a partir de SDXL 1.0, según indica la model card, y se distribuye como un único archivo safetensors de aproximadamente 55 MiB, lo que lo sitúa en el rango típico de un LoRA de rango bajo para SDXL. Está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o en cualquier runtime compatible con LoRA sobre SDXL.

La relevancia del modelo es acotada pero concreta: resuelve el problema de consistencia visual al generar varias vistas de un mismo personaje mediante un prompt estructurado con tokens de activación propios (`CharacterDesignIllustrious`). No es un modelo de propósito general ni un modelo de lenguaje: es un artefacto de personalización visual cuyo valor depende enteramente del modelo base sobre el que se aplique.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL 1.0, difusión latente texto a imagen |
| Parámetros totales | no disponible (pesos LoRA de 55 MiB; el modelo base SDXL 1.0 tiene 3.500 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto a imagen; límite determinado por el tokenizador CLIP del modelo base) |
| Tipos de cuantización | no disponible; los LoRA se aplican sobre el modelo base en fp16/fp32 o cuantizado según el runtime |
| Idiomas soportados | no disponible (los prompts se interpretan vía el codificador de texto CLIP de SDXL, principalmente inglés) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`CharacterDesignIllustrious_.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención y proyección del modelo base SDXL 1.0. SDXL es un modelo de difusión latente con doble codificador de texto (CLIP ViT-L y OpenCLIP ViT-bigG) y una U-Net de aproximadamente 2.600 M de parámetros, complementada por un VAE. El LoRA no modifica la arquitectura, sino que ajusta los pesos efectivos durante la inferencia.

No se han publicado en la información disponible datos sobre el dataset de entrenamiento, el número de pasos, la resolución de las imágenes de entrenamiento, el rango del LoRA ni si se aplicaron técnicas como regularización o captions automáticos. La model card únicamente indica que el ajuste se realizó en RunningHub y que el modelo base es SDXL 1.0. El nombre del archivo (`CharacterDesignIllustrious_`) sugiere una posible asociación con la familia Illustrious, derivada de SDXL, pero este dato no se confirma en la documentación proporcionada.

## Capacidades

- Generación de hojas de diseño de personaje con múltiples vistas (frontal, lateral, trasera) en una sola imagen.
- Guía de color explícita mediante el token `(color guide:1.2)` en el prompt.
- Poses dinámicas y cuerpo completo, controladas por el prompt de usuario.
- Fondo blanco simple, adecuado para documentación de personaje y presentaciones de producción.
- Estilo semirrealista, activado por los tokens `semi realistic`, `highres`, `4k`, `masterpiece`.
- Token de activación específico: `CharacterDesignIllustrious`.
- Compatibilidad con ComfyUI, RunningHub y cualquier runtime que cargue LoRA sobre SDXL.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- Capacidad multilingüe no documentada; el prompt de ejemplo está en inglés y el codificador CLIP de SDXL está optimizado para ese idioma.

## Casos de uso

- Preproducción de animación y videojuegos: generar hojas de personaje con vistas múltiples y guía de color para entregar a modeladores 3D o animadores, reduciendo el trabajo manual de composición de referencias.
- Diseño de personajes para cómic e ilustración: obtener varias vistas coherentes de un mismo personaje con un único prompt estructurado, lo que acelera la iteración conceptual.
- Documentación de estilo para estudios: crear plantillas visuales de personajes secundarios o extras con especificaciones de color consistentes dentro de una biblia de producción.
- Prototipado rápido en ComfyUI: integrar el LoRA en un flujo de nodos con ControlNet o IP-Adapter para fijar la identidad del personaje y variar pose o vestuario.
- Generación por lotes vía API de RunningHub: automatizar la producción de hojas de personaje para catálogos, pitching o presentaciones a clientes sin infraestructura propia.
- Educación y talleres de diseño: demostrar cómo un LoRA especializado modifica el comportamiento de SDXL y cómo se estructura un prompt con token de activación y guía de color.
- Exploración de variantes de vestuario: mantener la hoja de personaje y cambiar únicamente los descriptores de ropa o accesorios en el prompt para generar líneas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, comparativas humanas) ni comparaciones cuantitativas con otros LoRA de diseño de personajes.

## Requisitos de hardware

- El LoRA pesa 55 MiB; el requisito real lo determina el modelo base SDXL 1.0.
- Inferencia SDXL en fp16: aproximadamente 8-10 GB de VRAM para resolución 1024x1024.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para producción; RTX 3090/4080 (16-24 GB) para uso individual.
- Cabe en GPUs de consumo con 8 GB o más si se usa cuantización del modelo base (fp8, GGUF) o se reduce la resolución; con 6 GB es posible mediante offloading agresivo, a costa de latencia.
- Opciones de despliegue: ComfyUI (flujo nativo), Automatic1111/Forge, InvokeAI, Diffusers con `load_lora_weights`, y la propia plataforma RunningHub vía API.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del modelo base, la GPU y los pasos de muestreo (típicamente 20-30 pasos con sampler DPM++ o Euler).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-character-design-lora | LoRA texto a imagen | SDXL 1.0 | 55 MiB | 1024x1024 (base) | no disponible | Hugging Face, RunningHub |
| Character sheet LoRA (genéricos en Civitai) | LoRA texto a imagen | SDXL / SD 1.5 | 20-200 MiB | 1024x1024 / 512x512 | variable por autor | Civitai, Hugging Face |
| Illustrious-XL (modelo base) | Modelo completo | SDXL derivado | ~3.500 M | 1024x1024 | variable (modelo abierto) | Hugging Face |
| SDXL 1.0 (modelo base) | Modelo completo | — | ~3.500 M | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face, Stability AI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del dataset de entrenamiento; cabe esperar los sesgos típicos de SDXL en representación de género, etnia y complexión.
- Riesgo de alucinación visual: el modelo puede generar anatomía inconsistente entre vistas, detalles de vestuario que no coinciden o texto ilegible en la hoja de personaje.
- La consistencia entre vistas no está garantizada; el LoRA favorece el formato de hoja de personaje, pero no asegura identidad perfecta sin herramientas adicionales (ControlNet, IP-Adapter, reference-only).
- El prompt de ejemplo está en inglés; el rendimiento con prompts en castellano no está documentado y probablemente sea inferior.
- Licencia no disponible: antes de uso comercial es imprescindible verificar la licencia del modelo base SDXL 1.0 (CreativeML Open RAIL++-M) y contactar con el autor o RunningHub para aclarar los términos del LoRA.
- La model card incluye enlaces de afiliación y promocionales a RunningHub; la documentación técnica es mínima y no detalla hiperparámetros de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de calidad o estabilidad.
- El nombre del archivo sugiere una posible dependencia de la familia Illustrious; aplicar el LoRA sobre un SDXL 1.0 puro podría degradar los resultados. No confirmado en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-character-design-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-character-design-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1925408927561789441
- Página del autor: https://www.runninghub.cn/user-center/1824355776495255553
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- SDXL 1.0 (modelo base): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0

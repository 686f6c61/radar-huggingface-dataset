# moonbox-ai/HiDream-O1-Image-GGUF

## Resumen

HiDream-O1-Image es un modelo fundacional generativo de imagen desarrollado por HiDream-ai, construido sobre un Pixel-level Unified Transformer (UiT) que opera directamente sobre píxeles sin VAE externo ni codificadores de texto separados. Codifica píxeles crudos, texto y condiciones específicas de tarea en un único espacio de tokens compartido, lo que le permite abordar generación texto-a-imagen, edición de imagen y personalización guiada por sujeto en una sola arquitectura, con resoluciones de hasta 2.048 × 2.048.

El repositorio que nos ocupa, `moonbox-ai/HiDream-O1-Image-GGUF`, es una conversión a formato GGUF realizada por Moonbox para uso en dispositivo. Incluye únicamente los pesos propios del modelo cuantizados; el resto del pipeline original (que en este caso es inexistente porque el modelo es unificado, sin text encoder ni VAE separados) se describe en la model card. El modelo base cuenta con 8.182.557.936 parámetros según los safetensors publicados.

La relevancia actual de esta versión GGUF radica en que permite ejecutar un modelo generativo de imagen de 8B en hardware de consumo mediante cuantizaciones Q4_K_M (5,53 GB) y Q5_K_M (6,45 GB), usando el runtime stable-diffusion.cpp. El modelo base se publicó en mayo de 2026 y su variante Dev-2604 alcanzó el puesto #8 en el Artificial Analysis Text to Image Arena según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel-level Unified Transformer (UiT), estilo Qwen3-VL, opera directamente en píxeles |
| Parametros totales | 8.182.557.936 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M (publicadas en este repo); el autor menciona además Q8_0, Q6_K, BF16 y F16 |
| Idiomas soportados | no disponible (la model card menciona renderizado multilingüe de texto en imagen) |
| Licencia | MIT |
| Formato de pesos | GGUF (conversión desde BF16 original; safetensors en el modelo base) |

## Arquitectura y entrenamiento

HiDream-O1-Image se basa en un Pixel-level Unified Transformer (UiT) que prescinde de VAE y de codificadores de texto disjuntos: codifica píxeles crudos, texto y condiciones específicas de tarea en un único espacio de tokens compartido. Según la model card, se trata de un transformer estilo Qwen3-VL que trabaja directamente en píxeles, motivo por el cual la conversión GGUF omite la cabeza de salida de texto (`lm_head`) del modelo original, ya que la generación de imagen no la utiliza. La torre de visión emplea un patch-embedding 3D cuyo peso se almacena plegado a 4 dimensiones ([out × in, t, h, w]) en la conversión, y tanto la torre de visión como los embedders y la capa final permanecen en BF16 en todas las precisiones, mientras que solo las capas del modelo de lenguaje se cuantizan.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona variantes destiladas (Dev) y un "Reasoning-Driven Prompt Agent", así como un informe técnico en arXiv (2605.11061), pero los detalles de entrenamiento no se recogen en la información proporcionada. La generación utiliza 50 pasos y CFG 5,0 con flow shift 3 (valor por defecto de stable-diffusion.cpp para este modelo).

## Capacidades

- Generación texto-a-imagen hasta 2.048 × 2.048 píxeles.
- Edición de imagen guiada por instrucciones (image editing), incluyendo entrada `-r input.png` más una instrucción en stable-diffusion.cpp.
- Personalización guiada por sujeto (subject-driven personalization): preservación de identidad/IP en nuevas escenas.
- Renderizado de texto largo y control de layout, con soporte multilingüe de texto en imagen según la model card.
- Condicionamiento por layout y por skeleton en el pipeline de IP (según las notas de actualización de mayo de 2026).
- Modelo unificado: no requiere text encoder ni VAE externos.
- No se menciona soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Generación de imágenes en dispositivo: con la cuantización Q4_K_M (5,53 GB) el modelo cabe en GPUs de consumo con 8-12 GB de VRAM, permitiendo generar imágenes de hasta 2.048 × 2.048 sin conexión a servicios en la nube.
- Edición fotográfica por instrucciones: usando `sd-cli` con `-r input.png` y un prompt de edición, se puede modificar una imagen existente (cambiar objetos, estilo o composición) manteniendo coherencia, gracias a que el modelo opera directamente en píxeles.
- Personalización de marca o producto: la capacidad de subject-driven personalization permite insertar un producto o personaje con identidad consistente en nuevas escenas, útil para campañas de marketing.
- Creación de material gráfico con texto integrado: el renderizado de texto largo y multilingüe con control de layout lo hace adecuado para carteles, banners y mockups que requieren tipografía legible dentro de la imagen.
- Prototipado rápido en pipelines de diseño: al ejecutarse con stable-diffusion.cpp y formato GGUF, se integra en flujos locales de CI o scripts de generación por lotes sin depender de APIs externas.
- Investigación y experimentación con modelos unificados: al ser un modelo sin VAE ni text encoder separados, sirve para estudiar arquitecturas UiT y comparar fidelidad de cuantizaciones (el repo publica el error RMS relativo frente a BF16: 3,4 % en Q5_K_M y 6,6 % en Q4_K_M).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card del modelo base menciona que la variante HiDream-O1-Image-Dev-2604 alcanzó el puesto #8 en el Artificial Analysis Text to Image Arena, pero no se proporcionan puntuaciones concretas. El repositorio GGUF sí publica la fidelidad de cuantización frente a BF16:

| Precision | Tamano | Error RMS relativo vs BF16 |
|---|---|---|
| Q5_K_M | 6,45 GB | 3,4 % |
| Q4_K_M | 5,53 GB | 6,6 % |

## Requisitos de hardware

- VRAM estimada: Q4_K_M (5,53 GB) requiere aproximadamente 6-8 GB de VRAM para inferencia; Q5_K_M (6,45 GB) en torno a 7-9 GB. Las variantes BF16/F16 del modelo base de 8B requerirían del orden de 16 GB o más.
- GPU recomendadas: para las cuantizaciones publicadas, GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes. Para BF16 se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, con Q4_K_M y Q5_K_M en GPUs de 8 GB o más (con margen según resolución y overhead del runtime).
- Opciones de despliegue: stable-diffusion.cpp (runtime usado en el benchmark del autor, commit 465adf3, comando `sd-cli -m ... -p ... --steps 50 --cfg-scale 5.0 -W 1024 -H 1024`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables de la misma categoría (generación de imagen unificada de ~8B parámetros).

## Limitaciones y advertencias

- Solo se publican dos cuantizaciones (Q5_K_M y Q4_K_M); el autor menciona Q8_0, Q6_K, BF16 y F16 pero no figuran en la tabla de ficheros del repositorio.
- La cabeza de salida de texto (`lm_head`) se omite en la conversión, por lo que estos ficheros no sirven para tareas de generación de texto.
- El error RMS relativo frente a BF16 es del 3,4 % (Q5_K_M) y 6,6 % (Q4_K_M); puede haber degradación perceptible en calidad de imagen respecto al original, especialmente en Q4_K_M.
- El modelo base recomienda usar la variante "full" (no destilada) para tareas de edición, según las notas de actualización.
- No se dispone de información sobre sesgos, riesgo de alucinación visual o limitaciones de idioma más allá de la mención a renderizado multilingüe.
- La licencia es MIT, lo que permite uso comercial, pero los ficheros son un derivado del modelo original y heredan su licencia; conviene revisar la model card original para condiciones adicionales.
- PyTorch 2.9.x no está recomendado para el modelo original debido a un issue de Qwen3-VL (github.com/QwenLM/Qwen3-VL/issues/1811), según la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-ai/HiDream-O1-Image-GGUF
- Modelo base: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Variante Dev-2604: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev-2604
- Prompt refiner: https://huggingface.co/HiDream-ai/Prompt-Refine
- Informe técnico (PDF): https://arxiv.org/pdf/2605.11061v1
- arXiv: 2605.11061
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image
- Demo Dev en Hugging Face Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image-Dev
- Comunidad Discord: https://discord.gg/7ZEnPxdTQ
- Issue de PyTorch 2.9.x: https://github.com/QwenLM/Qwen3-VL/issues/1811

# Jinstudio/HiDream-O1-Image

# HiDream-O1-Image

## Resumen
HiDream-O1-Image es un modelo fundacional generativo de imagen que unifica en una sola arquitectura las tareas de generación texto-a-imagen, edición por instrucciones y personalización guiada por sujeto, con salida nativa de hasta 2.048 × 2.048 píxeles. Lo desarrolla el equipo HiDream-ai (la model card y los enlaces del proyecto apuntan a esa organizacion; el repositorio consultado en HuggingFace es Jinstudio/HiDream-O1-Image). Su propuesta tecnica central es el denominado Pixel-level Unified Transformer (UiT): no usa VAE externo ni codificadores de texto separados, sino que codifica directamente píxeles en bruto, texto y condiciones especificas de tarea en un unico espacio compartido de tokens.

El modelo tiene aproximadamente 8.800 millones de parametros (8.804.887.792 segun los pesos safetensors) y se distribuye bajo licencia MIT, con variantes "undistilled" y "Dev" destilada (28 pasos de inferencia frente a 50 de la version completa). Se apoya en la arquitectura Qwen3-VL (etiqueta `qwen3_vl` en el repositorio) como backbone multimodal, lo que le permite procesar entradas de imagen y texto de forma conjunta.

Es relevante ahora porque, con solo 8B de parametros, la variante HiDream-O1-Image-Dev-2604 alcanzo el puesto 8 en la Artificial Analysis Text to Image Arena segun el propio autor, posicionandose como una de las alternativas de pesos abiertos con mejor relacion calidad-tamano frente a DiT mas grandes y modelos propietarios. Incluye ademas un agente de prompt ("Reasoning-Driven Prompt Agent") que resuelve conocimiento implicito, layout y renderizado de texto antes de generar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pixel-level Unified Transformer (UiT) sobre backbone Qwen3-VL; sin VAE externo ni text encoder disjunto |
| Parametros totales | 8.804.887.792 (~8,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible (la model card menciona renderizado de texto multilingue, sin listar idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Resolucion maxima | hasta 2.048 × 2.048 |
| Repositorio (tamano) | 35,2 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento
La pieza central es el Pixel-level Unified Transformer (UiT), que se presenta como una arquitectura nativa de pixel: en lugar de depender de un autoencoder variacional (VAE) para pasar a un espacio latente comprimido y de un codificador de texto separado, el modelo opera directamente sobre parches de pixel, texto y condiciones de tarea dentro de un mismo espacio de tokens compartido. Esta unificacion es la que le permite cubrir texto-a-imagen, edicion de imagen y personalizacion por sujeto con un unico modelo y sin conversiones entre submodulos. La etiqueta del repositorio (`qwen3_vl`) y la referencia a PyTorch 2.9.x en las notas sugieren que el backbone multimodal se construye sobre la familia Qwen3-VL.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El autor si menciona dos innovaciones destacables: por un lado, el agente de prompt con razonamiento previo a la generacion ("thinking"), que resuelve conocimiento implicito, decisiones de layout y renderizado de texto; por otro, la eficiencia a escala 8B, con una variante destilada (Dev) que reduce de 50 a 28 los pasos de inferencia manteniendo calidad competitiva. Tambien se documentan capacidades de condicionamiento por layout y skeleton en el pipeline de personalizacion (IP).

## Capacidades
- Generacion texto-a-imagen de alta resolucion, hasta 2.048 × 2.048, con detalle fino.
- Renderizado de texto largo y control de layout: texto multirregion y multilingue dentro de la imagen.
- Edicion de imagen guiada por instrucciones (instruction editing).
- Personalizacion basada en sujeto (subject-driven personalization): preserva identidad o IP del sujeto en escenas nuevas.
- Generacion de storyboards a partir de descripciones.
- Agente de prompt con razonamiento (Reasoning-Driven Prompt Agent) que resuelve conocimiento implicito y planificacion de layout antes de generar.
- Condicionamiento por layout y por skeleton en el pipeline de personalizacion.
- Capacidades multimodales de imagen-texto a texto heredadas del backbone Qwen3-VL (entrada conjunta de imagen y texto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo "thinking" explicito mas alla del agente de prompt: no disponible.

## Casos de uso
- Generacion de imagenes para marketing y publicidad: produccion de assets a 2.048 × 2.048 con un unico modelo, util para crear banners, carteles y creatividades de alta resolucion sin encadenar VAE ni modelos auxiliares.
- Rotulacion y carteleria con texto integrado: gracias al renderizado de texto largo y multirregion, permite generar piezas donde el texto forma parte de la imagen (carteles, packaging, infografias) con control de posicion.
- Edicion de fotografia por instrucciones: modificar una imagen existente mediante lenguaje natural (cambiar fondo, estilo o elementos) sin rehacerla desde cero, apoyandose en el modo de edicion de la version completa.
- Personalizacion de marca o personajes (IP): mantener la identidad de un producto, logotipo o personaje a lo largo de multiples escenas nuevas, mediante condicionamiento por sujeto.
- Prototipado de storyboards para cine, animacion o videojuegos: generar secuencias de viñetas coherentes a partir de guiones, acelerando la previsualizacion.
- Asistentes creativos integrados en aplicaciones: el agente de prompt puede descomponer instrucciones vagas del usuario en prompts detallados, reduciendo la iteracion manual.
- Generacion de datos sinteticos para vision por computador: crear imagenes etiquetadas y variadas (con control de atributos y layout) para aumentar datasets de entrenamiento.
- Automatizacion de diseno de interfaces y mockups: combinar layout conditioning y renderizado de texto para maquetas con contenido realista.

## Benchmarks y rendimiento
Los resultados disponibles corresponden al benchmark GenEval (generacion composicional). Solo se han facilitado las filas de modelos comparativos; los valores propios de HiDream-O1-Image no estan incluidos en la informacion disponible.

| Modelo | #Params | Single-Obj | Two-Obj | Count | Color | Position | Attr | Overall |
|---|---|---|---|---|---|---|---|---|
| Nano Banana 2.0 | – | 1,00 | 0,96 | 0,71 | 0,84 | 0,86 | 0,65 | 0,83 |
| Seedream-4.0 | – | 1,00 | 0,92 | 0,71 | 0,93 | 0,78 | 0,68 | 0,84 |
| GPT Image 1 [High] | – | 0,99 | 0,92 | 0,85 | 0,92 | 0,75 | 0,61 | 0,84 |
| GPT Image 2 | – | 0,99 | 0,98 | 0,85 | 0,93 | 0,85 | 0,77 | 0,89 |
| PixArt | 4,3B + 0,6B | 0,98 | 0,50 | 0,44 | 0,80 | 0,08 | 0,07 | 0,48 |
| Show-o | 1,3B | 0,95 | 0,52 | 0,49 | 0,82 | 0,11 | 0,20 | no disponible (dato incompleto) |

El autor indica que se evaluo el modelo en cinco suites que cubren generacion composicional, alineacion de prompts densos, preferencia humana, generacion de texto visual complejo y renderizado de texto largo, pero en la informacion proporcionada solo se detalla la tabla de GenEval y de forma parcial. No se han facilitado resultados completos de benchmarks de HiDream-O1-Image en la informacion disponible.

## Requisitos de hardware
- Pesos en precision completa: ~17,6 GB para 8,8B parametros en fp16/bf16 (estimacion estandar segun recuento de parametros).
- VRAM estimada para inferencia: en torno a 20-24 GB en fp16/bf16 contando pesos y activaciones para resoluciones altas; en cuantizacion int8 ~9-10 GB e int4 ~5-6 GB (estimaciones, no confirmadas por el autor).
- RTX 4090 (24 GB): fp16/bf16 al limite para resoluciones moderadas; viable con cuantizacion.
- A100 (40/80 GB) y H100: holgadas para fp16/bf16 y para lotes o resoluciones 2.048 × 2.048.
- GPU consumer: si cabe en gamas con 24 GB o mas (RTX 3090/4090); en 12-16 GB requeriria cuantizacion no documentada.
- Opciones de despliegue: la libreria indicada es `transformers`; el repositorio del proyecto incluye `inference.py` y una demo web `app.py`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Notas de entorno: el autor desaconseja PyTorch 2.9.x por un problema reportado en el repositorio Qwen3-VL.
- Latencia y throughput: no disponibles. El numero de pasos de inferencia es de 50 (modelo completo) y 28 (variante Dev/Dev-2604).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GenEval (Overall) | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| HiDream-O1-Image | ~8,8B | no disponible | no disponible | MIT | Pesos abiertos (safetensors) | UiT sin VAE; multiples tareas en un solo modelo |
| HiDream-O1-Image-Dev | ~8B | no disponible | no disponible | MIT | Pesos abiertos | Variante destilada, 28 pasos |
| PixArt | 4,3B + 0,6B | no disponible | 0,48 | no disponible | Pesos abiertos | DiT con VAE y text encoder separados |
| Show-o | 1,3B | no disponible | no disponible (dato incompleto) | no disponible | Pesos abiertos | Modelo unificado, varias tareas |
| GPT Image 2 | propietario | no disponible | 0,89 | propietario | solo API | Referencia cerrada de maxima calidad |
| Seedream-4.0 | propietario | no disponible | 0,84 | propietario | solo API | Referencia cerrada |
| Nano Banana 2.0 | propietario | no disponible | 0,83 | propietario | solo API | Referencia cerrada |

La ventaja declarada por el autor es alcanzar paridad o superar a DiT de mayor tamano y a modelos cerrados con solo 8B de parametros y licencia MIT, algo poco habitual en generacion de imagen de pesos abiertos.

## Limitaciones y advertencias
- Los resultados de benchmarks propios de HiDream-O1-Image no se han facilitado completos, por lo que no es posible verificar de forma independiente la paridad con modelos mayores o cerrados.
- Sesgos conocidos: no disponibles de forma explicita. Los modelos generativos de imagen heredan sesgos de sus datos de entrenamiento (representacion demografica, estereotipos), pero no hay documentacion al respecto en la informacion proporcionada.
- Riesgo de alucinacion visual: inherente a la generacion de imagen; puede producir detalles, texto o anatomia incorrectos, mas probable en prompts ambiguos o de dominio poco representado.
- Limitaciones de idioma: la informacion no especifica los idiomas soportados; solo menciona renderizado de texto multilingue sin detallar cobertura.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el usuario es responsable del cumplimiento de derechos de imagen, marcas y propiedad intelectual de los contenidos generados, especialmente en personalizacion por sujeto/IP.
- Recomendacion tecnica del autor: usar el modelo completo (no la variante Dev) para tareas de edicion, y evitar PyTorch 2.9.x por un problema conocido en Qwen3-VL.
- Compatibilidad: el pipeline indicado es image-text-to-image; puede no integrarse directamente en herramientas que esperan formatos GGUF o pipelines de difusion clasicos.
- Trazabilidad: el repositorio consultado (Jinstudio/HiDream-O1-Image) difiere de la organizacion de origen del proyecto (HiDream-ai) referenciada en la model card; conviene verificar la procedencia de los pesos antes de uso en produccion.

## Enlaces
- Repositorio HuggingFace (consultado): https://huggingface.co/Jinstudio/HiDream-O1-Image
- Repositorio HuggingFace del proyecto: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Variante Dev: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev
- Variante Dev-2604: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev-2604
- Prompt refiner: https://huggingface.co/HiDream-ai/Prompt-Refine
- Informe tecnico (PDF): https://arxiv.org/pdf/2605.11061v1 (arXiv:2605.11061)
- Repositorio de codigo: https://github.com/HiDream-ai/HiDream-O1-Image
- Script de inferencia: https://github.com/HiDream-ai/HiDream-O1-Image/blob/main/inference.py
- Agente de prompt: https://github.com/HiDream-ai/HiDream-O1-Image/blob/main/prompt_agent.py
- Demo web (app.py): https://github.com/HiDream-ai/HiDream-O1-Image/blob/main/app.py
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image
- Demo Dev en HuggingFace Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image-Dev
- Discord del proyecto: https://discord.gg/7ZEnPxdTQ
- Backbone multimodal de referencia: https://huggingface.co/google/gemma-4-31B-it (Prompt Agent)
- Issue de compatibilidad PyTorch: https://github.com/QwenLM/Qwen3-VL/issues/1811

# nokkela-ai/MiniMax-H3-Image

## Resumen

MiniMax-H3-Image es un modelo de difusion de tipo transformer (DiT) para generacion y edicion de imagenes, desarrollado originalmente por MiniMax y redistribuido en este repositorio por nokkela-ai como copia independiente (fork) del checkpoint oficial `MiniMaxAI/MiniMax-H3-Image`. Unifica en un unico checkpoint la generacion texto-a-imagen y la edicion de imagenes de referencia (image-to-image, incluyendo edicion multi-referencia), lo que permite a creadores y desarrolladores trabajar con un solo modelo para ambas tareas.

Su propuesta tecnica mas destacada es la resolucion: genera imagenes de aproximadamente 16 megapixeles en cualquier relacion de aspecto, desde 4096x4096 (1:1) hasta 6272x2688 (21:9), sin necesidad de upscaler posterior. El checkpoint esta destilado a 6 pasos de muestreo (6 NFEs) y opera sin classifier-free guidance, lo que reduce el coste computacional frente a los pipelines de difusion convencionales de decenas de pasos.

El modelo emplea la arquitectura H3 de la familia MiniMax-H3, pero elimina las capas de audio del transformer original, manteniendo sin cambios el codificador de texto de MiniMax-H3. Esta orientado al mercado angloparlante (idioma declarado: en) y se distribuye bajo una licencia comunitaria propia, no estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con arquitectura H3 sin capas de audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (codificador de texto MiniMax-H3 sin cambios; ventana no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo ocupa 204,0 GB) |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement (licencia "other") |
| Formato de pesos | safetensors (libreria `minimax-h3`, compatible con diffusers) |

## Arquitectura y entrenamiento

MiniMax-H3-Image es un diffusion transformer (DiT) que hereda la arquitectura H3 de la familia MiniMax-H3, de la que se han retirado las capas de audio, conservando el codificador de texto original sin modificaciones. El checkpoint unifica generacion y edicion en un solo modelo: la generacion texto-a-imagen y la edicion de una o varias imagenes de referencia comparten pesos. El modelo esta destilado a 6 pasos de muestreo (6 NFEs) y funciona sin classifier-free guidance, una configuracion que reduce el numero de evaluaciones de red por imagen en comparacion con los pipelines de difusion clasicos.

El modelo produce imagenes de unos 16 megapixeles de forma nativa en todas las relaciones de aspecto, desde 4096x4096 (1:1) hasta 6272x2688 (21:9), sin upscaler. No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el numero de parametros del transformer ni del codificador de texto.

## Capacidades

- Generacion texto-a-imagen (text-to-image) con seguimiento de instrucciones detallado.
- Edicion de imagenes (image-to-image) sobre una o varias imagenes de referencia.
- Edicion multi-referencia en un unico checkpoint unificado.
- Generacion nativa a ~16 MP en multiples relaciones de aspecto (1:1 a 21:9) sin upscaler.
- Muestreo destilado a 6 pasos (6 NFEs) sin classifier-free guidance.
- Comprension de intencion creativa: desarrollo de concepto en personajes, escenas y atmosfera.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo generativo de imagen, no un LLM).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Generacion de arte conceptual a alta resolucion: el modelo produce imagenes de ~16 MP (4096x4096) directamente, adecuadas para impresion o material de produccion sin reescalado posterior.
- Edicion de producto y retoque con referencias: usando la modalidad image-to-image sobre una o varias imagenes de referencia, se pueden generar variaciones manteniendo coherencia con el material original.
- Creacion de assets para videojuegos y cine: la relacion de aspecto 21:9 (6272x2688) y el detalle a 16 MP encajan con fondos, mattes y key art de produccion.
- Ilustracion editorial y publicitaria: el seguimiento de instrucciones permite traducir briefs detallados en escenas concretas con personajes y atmosfera definidos.
- Prototipado rapido en pipelines creativos: al estar destilado a 6 NFEs, el coste por imagen es menor que en pipelines de decenas de pasos, lo que facilita iteracion en herramientas internas.
- Integracion via API en productos: MiniMax ofrece endpoints de text-to-image, image editing y prompt expansion, lo que permite incorporar el modelo a flujos SaaS sin desplegar los pesos.
- Experimentacion e investigacion en difusion: al estar en safetensors y con libreria `minimax-h3`/diffusers, sirve para estudiar destilacion a pocos pasos y generacion a alta resolucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 204,0 GB en safetensors, lo que da una referencia del orden de magnitud del checkpoint completo en precision de almacenamiento.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del checkpoint, el despliegue en precision completa excede con claridad la VRAM de GPUs de consumo.
- Cabe en GPU de consumo: no disponible; con 204,0 GB de pesos, no es viable en GPUs consumer sin cuantizacion o descarga por etapas, y no se documentan variantes cuantizadas.
- Opciones de despliegue: libreria `minimax-h3` y compatibilidad declarada con diffusers; tambien disponible via API de MiniMax (platform.minimax.io y platform.minimax.cn) y apps web/escritorio.
- Latencia y throughput: no disponibles; el modelo esta destilado a 6 NFEs sin CFG, lo que reduce el numero de evaluaciones de red por imagen, pero no se publican tiempos concretos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoria (generacion y edicion de imagen de alta resolucion) que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no estandar: se rige por el `minimax-h3-image-community-license-agreement`, por lo que es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Idioma: la model card declara unicamente ingles; el rendimiento con prompts en castellano no esta documentado.
- Este repositorio es un fork independiente de nokkela-ai, no el oficial de MiniMax; conviene verificar integridad y actualizaciones frente al checkpoint original.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni limitaciones de contexto del codificador de texto.
- El tamano del repo (204,0 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue local.
- No se publican datos de benchmarks, por lo que las afirmaciones de calidad y seguimiento de instrucciones de la model card no pueden contrastarse con metricas independientes.
- Ausencia de informacion sobre cuantizaciones oficiales limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face (este fork): https://huggingface.co/nokkela-ai/MiniMax-H3-Image
- Hugging Face (modelo original): https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Modelo base de la familia: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GitHub: https://github.com/MiniMax-AI/MiniMax-H3-Image
- API global: https://platform.minimax.io
- API China: https://platform.minimax.cn
- Docs API text-to-image (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- Docs API image editing (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- Docs API prompt expansion (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- WebApp global: https://hailuoai.video
- WebApp China: https://hailuoai.com
- App de escritorio global: https://agent.minimax.io
- App de escritorio China: https://agent.minimax.cn
- ModelScope: https://modelscope.cn/models/MiniMax/MiniMax-H3-Image
- Discord: https://discord.com/invite/dbMxutw7tP
- Web de MiniMax: https://www.minimax.io

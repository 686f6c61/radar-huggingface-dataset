# ibyteohdear/MiniMax-H3-Pruned-LightX8-hybrid-Fused

## Resumen

MiniMax-H3-Pruned-LightX8-hybrid-Fused es un modelo de generación de vídeo a partir de imagen y texto (image-text-to-video) publicado por el usuario ibyteohdear en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión de pesos: parte del transformer del modelo `multimodalart/MiniMax-H3-Pruned` y le incorpora el adaptador LoRA `lightx2v_hybrid-4to8step-Turbo_r48_diffusers.safetensors` con escala 1 (alpha 48 sobre rank 48), de modo que el comportamiento "turbo" queda integrado directamente en los pesos y no requiere cargar adaptadores en tiempo de inferencia.

El resultado es un único fichero de transformer que permite generar vídeo con 4 u 8 pasos de muestreo, empleando el scheduler euler/simple, con shifts de 6 para vídeo y 3 para audio, y resolución de hasta 768p. La fusión afecta a 312 capas y no incorpora módulos AdaLN del LoRA ni offsets AdaLN en el sesgo plegado. El modelo se distribuye bajo la licencia comunitaria de MiniMax-H3 y está etiquetado como no apto para todas las audiencias.

Su relevancia práctica es doble: por un lado reduce drásticamente el coste de inferencia frente a un modelo de difusión de vídeo estándar (4-8 pasos frente a decenas), y por otro simplifica el despliegue al no necesitar conmutación de adaptadores LoRA entre modos de 4 y 8 pasos. El repositorio ocupa 40,2 GB y el transformer declarado contiene 20.111.462.920 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D para vídeo (MiniMax-H3), con rama de audio; clase de código remoto pruned |
| Parametros totales | 20.111.462.920 (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados en la model card; el código de ejemplo aplica Int8WeightOnlyConfig (torchao) y bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (sharded), librería diffusers, requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, derivado de MiniMax-H3 en su variante "pruned" (poda de parámetros respecto al modelo original). La innovación principal de esta ficha no es arquitectónica sino de empaquetado: el autor ha fusionado un LoRA turbo de rango 48 (alpha 48) en 312 capas del transformer mediante el flujo `load_lora_adapter -> pin scaling -> fuse_lora -> strip peft keys -> sharded save`. El LoRA no contiene módulos AdaLN, por lo que no se han plegado offsets AdaLN en el sesgo.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre procesos de RLHF/DPO. La model card tampoco detalla innovaciones como decodificación especulativa o atención lineal. El pipeline de inferencia se construye con los bloques modulares de diffusers para MiniMax-H3 (`MiniMaxH3PrepareLatentsStep`, `MiniMaxH3DenoiseStep`, `MiniMaxH3DecodeStep`, etc.) y utiliza un codificador de texto externo basado en Qwen3-VL (8B o 32B según configuración) junto con proyecciones CLIP específicas (`mmh3-8b-ClipProj-v3.1`).

## Capacidades

- Generación de vídeo a partir de una imagen de referencia y un prompt de texto (image-text-to-video).
- Generación de audio asociada al vídeo, con shift de audio independiente (3) respecto al shift de vídeo (6).
- Muestreo rápido con 4 u 8 pasos de difusión gracias al LoRA turbo fusionado, sin necesidad de cambiar de adaptador.
- Resolución de salida de hasta 768p.
- Codificación de texto mediante Qwen3-VL (variantes 8B y 32B en el código de ejemplo), lo que aporta comprensión de instrucciones multimodales para el prompt.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes; es un modelo generativo de medios, no un LLM conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado rápido de vídeo generativo: con 4 pasos de muestreo y un único checkpoint fusionado, un equipo puede iterar sobre prompts e imágenes de referencia sin gestionar adaptadores LoRA ni pipelines de varias etapas.
- Generación de clips publicitarios cortos: a partir de una imagen de producto y un prompt descriptivo, el modelo produce vídeo con audio sincronizado hasta 768p, adecuado para piezas de redes sociales.
- Previsualización de storyboards: convertir fotogramas clave o ilustraciones en animaciones breves para validar una secuencia antes de producirla con herramientas de mayor coste.
- Creación de contenido para videojuegos y animación: generar loops o transiciones a partir de arte conceptual, aprovechando la rama de audio para ambiente.
- Investigación en difusión de vídeo: el checkpoint fusionado sirve como referencia para estudiar el efecto de plegar LoRAs turbo en transformers de difusión de 20B parámetros y comparar calidad entre 4 y 8 pasos.
- Despliegue en infraestructura limitada: el uso de cuantización Int8WeightOnly y group offloading en el código de ejemplo permite ejecutar el pipeline en GPUs con menos VRAM que las requeridas por el modelo completo en bfloat16.
- Generación de material audiovisual para doblaje o localización: la separación de shifts de vídeo y audio facilita ajustar la sincronía en piezas con voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El transformer contiene 20.111.462.920 parámetros; en bfloat16 esto supone aproximadamente 40 GB solo para los pesos del transformer, a los que se suman el VAE de vídeo, el VAE de audio, el codificador de texto Qwen3-VL (8B o 32B) y las proyecciones CLIP.
- El repositorio completo ocupa 40,2 GB, lo que da una idea del peso mínimo en disco.
- Para bfloat16 se recomienda al menos una A100 80 GB o H100 80 GB; con el codificador de texto de 32B la demanda aumenta y puede requerir varias GPUs o offloading.
- Con cuantización Int8WeightOnly (torchao) y `apply_group_offloading` el consumo de VRAM baja considerablemente, pero no se especifican cifras exactas en la model card.
- No se indica compatibilidad con GPUs de consumo (RTX 4090, 3090, etc.); dado el tamaño, es improbable que quepa completo en una GPU de 24 GB sin offloading agresivo y cuantización.
- Opciones de despliegue: diffusers con `AutoModel.from_pretrained(..., trust_remote_code=True)` y los bloques modulares de MiniMax-H3; el código de ejemplo incluye una app Gradio y soporte para Hugging Face Spaces con `spaces.GPU`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Pruned-LightX8-hybrid-Fused (este) | 20,1B (transformer) | hasta 768p | 4 u 8 | minimax-h3-community-license-agreement | Hugging Face, diffusers |
| multimodalart/MiniMax-H3-Pruned (base) | no disponible | no disponible | no disponible (sin turbo fusionado) | minimax-h3-community-license-agreement | Hugging Face |
| MiniMax-H3 (original, no pruned) | no disponible | no disponible | no disponible | minimax-h3-community-license-agreement | no disponible en la información |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está etiquetado como `not-for-all-audiences`; puede generar contenido inapropiado y requiere moderación en producción.
- No se documentan sesgos conocidos, pero al ser un modelo generativo de vídeo y audio existe riesgo de amplificar estereotipos presentes en los datos de entrenamiento originales (no detallados).
- Riesgo de alucinación visual y de incoherencias temporales inherente a la difusión de vídeo; no se cuantifica en la model card.
- La licencia `minimax-h3-community-license-agreement` impone condiciones específicas para uso comercial que deben revisarse antes de desplegar; no es una licencia open source estándar.
- El modelo depende de código remoto (`trust_remote_code=True`) y de la clase pruned específica, no de `MiniMaxH3Transformer3DModel`; cargarlo con la clase equivocada fallará.
- Requiere componentes externos no incluidos en el repo (codificador Qwen3-VL, proyecciones ClipProj de NicoLab28), lo que añade dependencias y posibles roturas por cambios en repos de terceros.
- El pipeline de ejemplo usa rutas absolutas (`/mnt/data/huggingface`) y variables de entorno específicas de un entorno concreto; no es portable tal cual.
- No hay información sobre idiomas soportados ni sobre calidad multilingüe de los prompts.
- El tamaño del transformer (20B) limita el despliegue a hardware de gama alta o a configuraciones con cuantización y offloading.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/MiniMax-H3-Pruned-LightX8-hybrid-Fused
- Modelo base: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Repositorio de proyecciones CLIP: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Codificador de texto (8B): https://huggingface.co/prithivMLmods/Qwen3-VL-8B-Instruct-c_abliterated-v3
- Codificador de texto (32B): https://huggingface.co/prithivMLmods/Qwen3-VL-32B-Instruct-abliterated-v1

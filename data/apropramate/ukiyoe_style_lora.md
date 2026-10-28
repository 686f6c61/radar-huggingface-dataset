# Apropramate/ukiyoe_style_LoRA

## Resumen

`Apropramate/ukiyoe_style_LoRA` es un adaptador LoRA de bajo rango para `stabilityai/stable-diffusion-xl-base-1.0`, publicado por el usuario Apropramate en HuggingFace. Su propósito declarado, a partir del nombre del repositorio, es transferir un estilo visual ukiyo-e (grabado japonés de los siglos XVII-XIX) al modelo base SDXL sin necesidad de reentrenar los aproximadamente 3.500 millones de parámetros del checkpoint completo. Se distribuye en formato diffusers y se integra en el pipeline `text-to-image` estándar cargando el adaptador junto con el modelo base.

El interés práctico de este tipo de adaptadores es que permiten obtener un estilo consistente con un coste de almacenamiento y de inferencia marginal: el LoRA se suma a los pesos del UNet y de los codificadores de texto en tiempo de carga, añadiendo un porcentaje pequeño de VRAM sobre el modelo base. Frente a un fine-tuning completo de SDXL, un LoRA de estilo se entrena en cuestión de horas en una única GPU de consumo con 24 GB, lo que explica la proliferación de este formato en la comunidad.

Ahora bien, el repositorio se encuentra en un estado inicial: cero descargas, cero likes, sin model card descriptiva, sin datos sobre el dataset de entrenamiento, sin palabra de activación documentada y sin métricas publicadas. Cualquier evaluación de calidad debe hacerse empíricamente antes de considerarlo para un flujo de producción. La licencia del modelo base es OpenRAIL++ según las etiquetas del repositorio, aunque el campo de licencia de la API aparece como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SDXL (difusión latente con UNet, VAE y doble codificador de texto CLIP) |
| Parámetros totales | ~3.500 millones en el modelo base SDXL 1.0; el adaptador LoRA no dispone de recuento publicado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; los codificadores de texto de SDXL procesan 77 tokens por chunk |
| Tipos de cuantización | El adaptador se distribuye presumiblemente en safetensors fp16; el base admite fp16, bf16, fp8 y GGUF. El rango y el formato exacto del LoRA: no disponible |
| Idiomas soportados | No disponible (los codificadores CLIP de SDXL están entrenados predominantemente en inglés) |
| Licencia | OpenRAIL++ según la etiqueta del repositorio; el campo de licencia de la API indica "no disponible" |
| Formato de pesos | Safetensors para diffusers (formato LoRA); tamaño del archivo: no disponible |

## Arquitectura y entrenamiento

El adaptador se monta sobre SDXL 1.0, un modelo de difusión latente compuesto por un UNet de aproximadamente 2.600 millones de parámetros con bloques transformer y atención cruzada, un VAE de unos 84 millones y dos codificadores de texto (CLIP ViT-L de 123 millones y OpenCLIP ViT-bigG de 694 millones). El LoRA inyecta matrices de descomposición de bajo rango en capas lineales seleccionadas, típicamente las proyecciones `to_q`, `to_k`, `to_v`, `to_out` de la atención cruzada y, opcionalmente, las `ff` del bloque transformer. El rango, el alpha y la lista exacta de módulos objetivo no están documentados en la información disponible.

No hay datos publicados sobre el dataset de entrenamiento: se desconoce el número de imágenes, su procedencia (grabados ukiyo-e históricos en dominio público frente a reproducciones modernas), el número de pasos, la resolución de entrenamiento ni si se aplicaron técnicas de regularización como captions extensos, bucketización o debiasing. La etiqueta `diffusers-training` sugiere el uso del script oficial de entrenamiento de LoRA de la librería diffusers, pero es una inferencia, no un dato confirmado. Tampoco consta que se haya aplicado DPO, RLHF ni ninguna etapa de refinamiento por preferencias, algo por otra parte poco habitual en adaptadores de estilo.

## Capacidades

- Generación de imágenes texto-a-imagen a través del pipeline de difusers, heredando la resolución nativa de SDXL de 1024x1024 píxeles.
- Transferencia de estilo ukiyo-e: paleta plana, contornos marcados, composición bidimensional y motivos propios del grabado japonés, presumiblemente activables mediante prompts descriptivos.
- Composición con otros LoRA de SDXL (personajes, poses, iluminación) mediante pesos de adaptador combinables en diffusers y en ComfyUI.
- Control fino mediante CFG, samplers, schedulers y pasos, como cualquier adaptador sobre SDXL.
- Integración con pipelines de img2img, inpainting y ControlNet al operar sobre el mismo UNet base.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo generativo de imagen, no un modelo de lenguaje.
- No dispone de modo thinking, visión de entrada ni procesamiento de audio.

## Casos de uso

- Ilustración editorial de temática japonesa: generación de cabeceras y viñetas con estética de grabado para artículos sobre historia o cultura de Japón, usando el LoRA sobre SDXL a 1024x1024 y ajustando el peso del adaptador entre 0,6 y 0,9 para no saturar el estilo.
- Prototipado rápido de dirección de arte: producción de un tablero de referencias con decenas de variaciones de una misma escena antes de encargar la ilustración final a un artista, con coste por imagen cercano a cero en una GPU de consumo.
- Diseño de producto y packaging: aplicación del estilo a mockups de tazas, láminas o textil, combinando el LoRA con ControlNet de profundidad o de bordes para mantener la silueta del producto.
- Fondos y assets para videojuegos o animación: generación de fondos pintados y elementos decorativos ambientados en el periodo Edo, exportables como texturas tras un proceso de retoque y vectorización.
- Contenido para redes y marketing cultural: ilustraciones para cartelería de exposiciones o festivales japoneses, con iteración rápida sobre el prompt y el peso del adaptador.
- Investigación en transferencia de estilo: uso del adaptador como caso de estudio para comparar métodos de inyección LoRA, rangos y estrategias de entrenamiento con pocas imágenes.
- Educación y divulgación: generación de material visual que explique las convenciones del ukiyo-e (perspectiva isométrica, planos de color, composición diagonal) a partir de prompts controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan métricas cuantitativas de fidelidad de estilo, CLIP score, FID ni evaluaciones humanas para este adaptador, ni tampoco comparaciones con otros LoRA de ukiyo-e.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 8-10 GB en fp16 a 1024x1024 con el modelo base SDXL; el adaptador LoRA añade un consumo marginal (del orden de centenas de MB como máximo, según su rango). Las cifras exactas del adaptador no están publicadas.
- Con `enable_model_cpu_offload` o `enable_sequential_cpu_offload` de diffusers se puede reducir el pico de VRAM hasta unos 4-6 GB, a costa de latencia.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para lotes grandes y producción; RTX 3090/4080 (16-24 GB) como opción equilibrada.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores sin offloading; en tarjetas de 8 GB requiere offloading o variantes cuantizadas del base.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI, Automatic1111/Forge, SD.Next, InvokeAI, Fooocus y ONNX/TensorRT para optimización.
- Latencia estimada: del orden de 2-5 segundos por imagen a 1024x1024 y 25-30 pasos en una RTX 4090, y de 10-25 segundos en una RTX 3060. Son estimaciones para SDXL y no mediciones publicadas de este adaptador.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Apropramate/ukiyoe_style_LoRA | Adaptador sobre ~3,5 B (base SDXL) | 77 tokens por encoder; 1024x1024 | OpenRAIL++ (según etiqueta) | HuggingFace, diffusers |
| stabilityai/stable-diffusion-xl-base-1.0 | ~3,5 B | 77 tokens por encoder; 1024x1024 | OpenRAIL++ | HuggingFace, diffusers |
| Stable Diffusion 1.5 y su ecosistema de LoRA | ~0,86 B | 77 tokens; 512x512 nativo | CreativeML OpenRAIL-M | Amplia disponibilidad |
| Flux.1-dev y sus LoRA | ~12 B | 512 tokens (T5); hasta 2048x2048 | FLUX.1 dev non-commercial | HuggingFace, diffusers |

El adaptador se posiciona en la franja de SDXL: más resolución nativa y mejor adherencia al prompt que SD 1.5, con un coste de VRAM notablemente menor que Flux.1-dev y una licencia más permisiva para uso comercial que la de Flux dev, aunque con las restricciones de uso de OpenRAIL++. La comparación cualitativa de estilo con otros LoRA de ukiyo-e no está disponible.

## Limitaciones y advertencias

- Repositorio sin model card: se desconoce el dataset, la palabra de activación, el rango del LoRA y los hiperparámetros de entrenamiento, lo que dificulta reproducir o depurar resultados.
- Cero descargas y cero likes: no existe validación comunitaria de la calidad del adaptador.
- Riesgo de sesgo estilístico: el ukiyo-e histórico contiene representaciones raciales, de género y de clase propias de su época, que el adaptador puede reproducir o amplificar.
- Riesgo de orientalismo: los prompts en inglés sobre "japonés" o "ukiyo-e" pueden arrastrar clichés visuales en lugar de convenciones reales del grabado.
- Alucinación visual: como todo modelo de difusión, genera anatomías incorrectas (manos, dedos), perspectivas incoherentes y texto ilegible; es especialmente propenso a producir kanji y kana falsos.
- Limitación idiomática: los codificadores CLIP de SDXL rinden claramente peor con prompts en castellano o japonés que en inglés; conviene redactar los prompts en inglés.
- Limitación de contexto: 77 tokens por codificador, ampliables solo mediante chunking o ponderación de prompts, lo que limita descripciones muy largas.
- Licencia: OpenRAIL++ permite uso comercial pero impone restricciones de uso y obliga a propagar las condiciones a los derivados; conviene revisar el texto completo antes de un despliegue en producto.
- Riesgo legal sobre el dataset: si el entrenamiento usó reproducciones de grabados de dominio público, el riesgo es bajo; si usó obra de artistas contemporáneos, la situación cambia.
- En producción: fijar versión del base y del adaptador, y validar el peso del LoRA, ya que valores altos degradan la diversidad y producen artefactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Apropramate/ukiyoe_style_LoRA
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Documentación de diffusers para carga de LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Licencia OpenRAIL++: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md

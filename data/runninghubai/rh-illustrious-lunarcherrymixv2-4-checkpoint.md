# RunningHubAI/rh-illustrious-lunarcherrymixv2.4-checkpoint

## Resumen

rh-illustrious-lunarcherrymixv2.4-checkpoint es un checkpoint de generación de imágenes por difusión publicado en Hugging Face por RunningHubAI (cuenta de la plataforma RunningHub) en nombre del autor NINE.JIUGE. No es un modelo de lenguaje: es un archivo de pesos completo (`lunarcherrymix_v24.safetensors`, 6617 MiB) pensado para cargarse en ComfyUI o ejecutarse en la nube de RunningHub. Según la model card, está afinado a partir de IL-XL (Illustrious-XL), una familia de checkpoints derivada de SDXL especializada en ilustración.

El modelo se distribuye como un "merge" o mezcla de estilos de la familia Illustrious con ajustes propios (la serie LunarCherryMix), y su interés práctico está en el pipeline de inferencia ya calibrado que acompaña al checkpoint: 30-40 pasos, CFG 3-10, sampler Euler a o DPM++ 2M, CLIP skip 2 y una lista de resoluciones recomendadas con 832x1216 (vertical) como formato principal. Es relevante para quien trabaje con generación de ilustración en ComfyUI y quiera un checkpoint listo para usar con parámetros de muestreo ya probados por el autor.

La información publicada es muy escasa: no hay detalles de entrenamiento, licencia explícita, idiomas, ni resultados de benchmarks. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y su tamaño total es de 6,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente para texto-a-imagen; afinado desde IL-XL (Illustrious-XL, familia SDXL). Detalle de bloques no publicado |
| Parametros totales | No disponible (la model card no publica recuento; el archivo fp16 de 6617 MiB es coherente con un checkpoint de la familia SDXL, dato no confirmado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. El prompt de texto se codifica en bloques de 77 tokens según la arquitectura de la familia SDXL; la model card no documenta soporte de prompt largo |
| Tipos de cuantizacion | Solo pesos safetensors en el repositorio (sin cuantizaciones publicadas: no hay GGUF, FP8 ni NF4 oficiales) |
| Idiomas soportados | No disponible. La model card no documenta idiomas; los prompts del ecosistema Illustrious suelen estar en inglés |
| Licencia | No disponible. El repositorio indica que el copyright permanece con el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (un único archivo: `lunarcherrymix_v24.safetensors`, 6617 MiB) |
| Tamaño del repositorio | 6,9 GB |
| Resoluciones recomendadas | 832x1216 (principal), 1024x1024, 1152x896, 896x1152, 1216x832, 1344x768, 768x1344, 1536x640, 640x1536 |
| Parametros de muestreo sugeridos | 30-40 pasos, CFG 3-10, Euler a o DPM++ 2M, CLIP skip 2 |
| Plataformas objetivo | ComfyUI, RunningHub (nube y API), Hugging Face |

## Arquitectura y entrenamiento

La model card solo aporta un dato de origen: "Finetuned from: IL-XL". IL-XL corresponde a Illustrious-XL, un modelo de difusión latente de la familia SDXL (UNet con atención, VAE y doble codificador de texto CLIP) que se distribuye habitualmente como un único checkpoint de aproximadamente 6,6 GB en fp16, valor que coincide con el tamaño del archivo publicado. No se especifican ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de ajuste por preferencias humanas (RLHF/DPO), ni el método exacto de mezcla de pesos empleado para producir la versión 2.4.

Tampoco hay información sobre técnicas de aceleración (destilación de pasos, LoRA fusionadas, decodificación especulativa) ni sobre los parámetros de entrenamiento por resolución. Todo lo que se sabe del comportamiento práctico del modelo procede de las recomendaciones de muestreo del autor, no de documentación técnica.

## Capacidades

- Generación de imágenes texto-a-imagen en formato cuadro, vertical y panorámico, con 832x1216 como composición principal recomendada por el autor.
- Ilustración de estilo anime/manga y arte digital, por herencia del linaje Illustrious-XL sobre el que está afinado.
- Control fino del resultado mediante prompt positivo y negativo, CFG (3-10) y número de pasos (30-40), con sampler Euler a o DPM++ 2M.
- Compatibilidad con CLIP skip 2, ajuste habitual en los checkpoints de la familia Illustrious para evitar artefactos en estilos ilustrados.
- Uso como modelo base para entrenar LoRA o embeddings propios en ComfyUI y otras herramientas compatibles con checkpoints de la familia SDXL.
- Ejecución en flujo de trabajo por nodos en ComfyUI, con posibilidad de encadenar ControlNet, IP-Adapter o upscalers de la misma familia (no verificado en la información disponible).
- Ejecución remota mediante la API de RunningHub, sin necesidad de GPU local.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de audio: es un modelo puramente generativo de imagen.

## Casos de uso

- Ilustración editorial y portadas: generar una imagen vertical a 832x1216 con 30-40 pasos y CFG entre 3 y 10 para obtener una composición lista para maquetación, ajustando la semilla hasta dar con la variante deseada.
- Concept art de personajes: iterar sobre un mismo prompt manteniendo sampler (DPM++ 2M) y CLIP skip 2 para conservar coherencia de estilo entre variantes de un mismo personaje.
- Creación de assets para videojuegos y visual novels: producir retratos y fondos en 1024x1024 o 896x1152 que encajen en marcos de UI cuadrados o verticales sin recorte adicional.
- Base para entrenamiento de LoRA: usar el checkpoint como modelo de partida en ComfyUI para ajustar un estilo o personaje concreto y después mezclarlo con el peso original.
- Previsualización rápida de ideas en un pipeline de producción: generar lotes de baja fidelidad con 30 pasos para validar dirección de arte antes de invertir en render final o en encargo a un ilustrador.
- Automatización por API: integrar llamadas a la API de RunningHub para generar imágenes bajo demanda desde una aplicación web, sin mantener infraestructura GPU propia.
- Generación de ilustraciones para contenido editorial o redes: usar las resoluciones panorámicas (1344x768, 1536x640) para banners y cabeceras sin reescalado posterior.
- Prototipado de personajes para narrativa seriada: mantener una misma descripción base y variar encuadre y resolución según el capítulo, apoyándose en el rango de resoluciones documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones de preferencia humana ni comparativas cuantitativas con otros checkpoints; únicamente parámetros de muestreo y resoluciones recomendadas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8 GB para generar a 832x1216 en fp16 con el checkpoint completo cargado. Con 6 GB es necesario recurrir a modos de memoria reducida (`--lowvram`, `--medvram`) u offload secuencial a CPU, con una penalización de velocidad notable. Estimaciones basadas en el tamaño del archivo (6,6 GiB) y en el comportamiento típico de checkpoints de la familia SDXL, no medidas sobre este modelo concreto.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti 12 GB, RTX 4080 16 GB, RTX 4090 24 GB. En portátiles con 8 GB funciona, pero justo de memoria si se añaden ControlNet o upscalers.
- GPU de datacenter: no requiere A100 ni H100; una L4 (24 GB), A10 o RTX A5000 son suficientes y más rentables para servir el modelo.
- Despliegue: ComfyUI (soporte nativo de checkpoints), RunningHub en nube o vía API, Automatic1111 / Forge, SD.Next y diffusers (`StableDiffusionXLPipeline.from_single_file`). llama.cpp y Ollama no aplican a este tipo de modelo.
- Aceleración opcional: TensorRT, stable-fast o `torch.compile` para reducir latencia por paso; no hay cifras publicadas para este checkpoint.
- Latencia y throughput: no disponibles para este modelo. Como referencia no medida, en la familia SDXL a 832x1216 y 30-40 pasos se suele estar en el orden de segundos por imagen en GPU de gama alta y de decenas de segundos en GPU consumer de gama media.
- Almacenamiento: 6,9 GB para el repositorio; prever espacio adicional para VAE, LoRA y modelos auxiliares en el directorio de ComfyUI.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-illustrious-lunarcherrymixv2.4-checkpoint | No disponible (archivo 6617 MiB) | 832x1216 (recomendada por el autor) | No disponible (copyright del autor, seguir licencia upstream) | Hugging Face + RunningHub |
| rh-illustrious-v4-checkpoint (RunningHubAI) | No disponible | No disponible en la informacion consultada | No disponible | Hugging Face + RunningHub |
| rh-illustriousmix-checkpoint (RunningHubAI) | No disponible | No disponible en la informacion consultada | No disponible | Hugging Face + RunningHub |
| LunarCherryMix (Illustrious), versión previa | No disponible | No disponible en la informacion consultada | No disponible | RunningHub (runninghub.cn) |
| Illustrious-XL (modelo base de la familia IL-XL) | No disponible en la informacion consultada | 1024x1024 (familia SDXL) | No disponible en la informacion consultada | Repositorios públicos de la comunidad |

No hay datos públicos de rendimiento comparado (FID, CLIP score, preferencia humana) entre estos checkpoints, por lo que la comparación se limita a linaje, disponibilidad y parámetros de muestreo documentados.

## Limitaciones y advertencias

- Ausencia total de documentación de entrenamiento: no se conocen dataset, número de pasos, filtrado ni composición, lo que impide evaluar sesgos de forma rigurosa. Por el linaje Illustrious cabe esperar un sesgo estilístico hacia la ilustración de tipo anime y una representación limitada de diversidad corporal, étnica y de edad; no hay evaluación publicada que lo cuantifique.
- Riesgo de artefactos propios de la difusión: anatomía incorrecta (manos, extremidades), texto ilegible dentro de la imagen, perspectivas incoherentes y coherencia limitada en escenas con muchos personajes. La ausencia de benchmarks impide acotar la tasa de fallo.
- Riesgo de imitación de estilo: al derivar de un modelo entrenado con ilustración etiquetada de la comunidad, los prompts que nombran artistas concretos pueden reproducir de forma reconocible su estilo, con implicaciones legales y éticas en uso comercial.
- Licencia no disponible: el repositorio remite a la licencia del proyecto original o upstream y mantiene el copyright del autor. Antes de un uso comercial es obligatorio verificar la licencia de IL-XL y de sus dependencias; no se puede asumir permiso de uso comercial por defecto.
- Idiomas: no documentados. Los prompts en castellano pueden funcionar peor que en inglés, y no hay información sobre el comportamiento con texto en la imagen en otros idiomas.
- Longitud de prompt: la arquitectura base limita la codificación de texto a bloques de 77 tokens; prompts largos requieren trucos de concatenación en ComfyUI y no hay documentación del autor al respecto.
- Sin cuantizaciones oficiales: no hay GGUF, FP8 ni versiones ligeras publicadas, lo que limita el despliegue en hardware muy ajustado.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión comunitaria que permita validar la calidad de forma independiente.
- Advertencia de contenido: la model card no incluye cláusulas sobre contenido sensible ni filtros de seguridad; la responsabilidad del filtrado recae en quien despliega el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-illustrious-lunarcherrymixv2.4-checkpoint
- Página del modelo en RunningHub (internacional): https://www.runninghub.ai/model/public/2012567202288902145
- Proyecto original en RunningHub (China): https://www.runninghub.cn/model/public/2012567202288902145
- Página del autor (NINE.JIUGE): https://www.runninghub.cn/user-center/1958026340350025729
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Modelo relacionado: https://huggingface.co/RunningHubAI/rh-illustrious-v4-checkpoint
- Modelo relacionado: https://huggingface.co/RunningHubAI/rh-illustriousmix-checkpoint
- LunarCherryMix (Illustrious) en RunningHub: https://www.runninghub.cn/model/public/1923307814012243970
- Entrada sobre Illustrious en la wiki de Learn AI: https://ai.miraheze.org/wiki/Illustrious

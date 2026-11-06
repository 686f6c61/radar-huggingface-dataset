# Roxana80/sd-v1-4-lora-oldbookillustrations

## Resumen

`Roxana80/sd-v1-4-lora-oldbookillustrations` es un adaptador LoRA para el modelo de difusión de texto a imagen Stable Diffusion v1.4 de CompVis. Lo desarrolla el usuario Roxana80 y se publica en Hugging Face con la librería diffusers. El objetivo es especializar el modelo base en la estética de ilustraciones de libros antiguos (grabados, xilografías y viñetas decimonónicas), un estilo difícil de obtener con el modelo original sin ingeniería de prompts compleja.

El adaptador se ha entrenado sobre el dataset `gigant/oldbookillustrations`, usando las columnas `1600px` (imágenes) e `info_alt` (descripciones textuales), con un total de 600 imágenes durante 3 épocas y un rango LoRA de solo 6. Es, por tanto, un ajuste ligero y de bajo coste computacional que no modifica los pesos del modelo base, sino que añade matrices de bajo rango a las capas de atención.

Su relevancia es acotada: no es un modelo fundacional ni introduce innovaciones arquitectónicas, sino un ejemplo típico de personalización estilística mediante LoRA sobre SD 1.4. Resulta útil para quien necesite generar ilustraciones con estética de libro antiguo sin reentrenar el modelo completo, y como referencia de un pipeline de fine-tuning reproducible con diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion v1.4 (UNet + VAE + text encoder CLIP) con adaptador LoRA |
| Parametros totales | 859.520.964 (pesos del adaptador publicados; el modelo base SD 1.4 tiene ~983M en la UNet y ~123M en el text encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; el text encoder CLIP acepta hasta 77 tokens) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors FP16/FP32 se puede cuantizar a FP16, BF16 o FP8 con herramientas externas |
| Idiomas soportados | no disponibles (el prompt se procesa con CLIP, principalmente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,7 GB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Stable Diffusion v1.4, un modelo de difusión latente compuesto por una UNet (denoiser), un VAE (codificador/decodificador de imágenes) y un text encoder CLIP ViT-L/14. La LoRA introduce matrices de descomposición de bajo rango en las capas de atención, con r = 6 y alpha = 6, lo que supone un número muy reducido de parámetros entrenables frente al modelo completo.

El entrenamiento usó 600 imágenes del dataset `gigant/oldbookillustrations` durante 3 épocas, con batch size 3, learning rate 1e-4 y resolución 512 (resize del lado corto más center crop). No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un fine-tuning estilístico de difusión. Tampoco se especifican el número total de pasos, el optimizador, la precisión de entrenamiento ni si se congelaron capas del text encoder. La model card incluye una comparación antes/después con el mismo prompt y semilla, pero no se aportan métricas cuantitativas de calidad (FID, CLIP score, etc.).

## Capacidades

- Generación de imágenes de texto a imagen con estética de ilustración de libro antiguo (grabados, xilografías, viñetas).
- Especialización estilística: reproduce texturas de tinta, tramados y composiciones propias de la ilustración decimonónica.
- Compatible con el ecosistema diffusers mediante `load_lora_weights` o cargando el pipeline completo con la LoRA ya fusionada.
- Permite combinar el adaptador con otros LoRA de SD 1.4 (no documentado por el autor, pero técnicamente posible).
- Soporte de prompts en inglés (limitado por el text encoder CLIP); no se documenta soporte multilingüe.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo puramente generativo de imágenes.

## Casos de uso

- Ilustración editorial retro: generar viñetas y grabados para portadas, fanzines o publicaciones que busquen estética de libro antiguo, aprovechando el estilo aprendido del dataset de ilustraciones decimonónicas.
- Diseño de material didáctico histórico: crear ilustraciones para libros de texto o museos que reconstruyan escenas con lenguaje visual de época.
- Prototipado rápido de arte conceptual: obtener referencias estilizadas para proyectos de animación o videojuegos con ambientación histórica antes de encargar arte final.
- Generación de contenido para blogs y newsletters: producir imágenes de cabecera con un estilo coherente y reconocible sin depender de un ilustrador.
- Experimentación académica con LoRA: servir como caso de estudio reproducible de fine-tuning de difusión con pocos datos (600 imágenes) y bajo rango (r = 6).
- Creación de productos derivados (posters, postales, marcapáginas) con estética de grabado antiguo, siempre que la licencia del modelo base y del dataset lo permitan.
- Base para fine-tunings posteriores: el adaptador puede fusionarse con SD 1.4 y usarse como punto de partida para especializaciones más concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pipeline completo de SD 1.4 en FP16 requiere aproximadamente 4-6 GB de VRAM; con el adaptador LoRA cargado por separado el incremento es marginal (decenas de MB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para generación por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3050, GTX 1660 Super con FP16), y en 4 GB usando `enable_attention_slicing` o `enable_model_cpu_offload`.
- Opciones de despliegue: diffusers (recomendado por el autor), ComfyUI, Automatic1111 WebUI, InvokeAI, Fooocus; también es posible exportar a ONNX o TensorRT para optimización.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del número de pasos de muestreo (típicamente 20-50), del sampler y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Roxana80/sd-v1-4-lora-oldbookillustrations | 859M (adaptador) | 512x512 | LoRA estilística sobre SD 1.4 | no disponible | Hugging Face |
| Stable Diffusion v1.4 (CompVis) | ~983M UNet + 123M text encoder | 512x512 | Texto a imagen generalista | CreativeML OpenRAIL-M | Hugging Face |
| Stable Diffusion v1.5 (RunwayML) | ~983M UNet + 123M text encoder | 512x512 | Texto a imagen generalista | CreativeML OpenRAIL-M | Hugging Face |
| SDXL (Stability AI) | ~2,6B UNet + 817M text encoder | 1024x1024 | Texto a imagen de alta resolución | CreativeML OpenRAIL++-M | Hugging Face |

La comparación con SD 1.4 y 1.5 es directa porque el adaptador se aplica sobre ellos; frente a SDXL, este LoRA ofrece menor resolución nativa y menor calidad general, pero un estilo muy específico que SDXL no reproduce sin un LoRA equivalente. No se dispone de datos de rendimiento cuantitativos para comparar objetivamente.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset de ilustraciones históricas, puede reproducir estereotipos visuales, raciales o de género propios de la época representada.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible o elementos incoherentes, especialmente con prompts complejos.
- Limitaciones de contexto e idioma: el text encoder CLIP está entrenado principalmente en inglés y limita el prompt a 77 tokens; los prompts en castellano pueden funcionar peor.
- Restricciones de licencia: la licencia del adaptador no está indicada en la model card; el modelo base SD 1.4 se distribuye bajo CreativeML OpenRAIL-M, que impone restricciones de uso (prohibición de usos dañinos, obligación de compartir la licencia). El dataset `gigant/oldbookillustrations` puede tener sus propias condiciones de uso que no se detallan.
- Caveat para producción: el entrenamiento con solo 600 imágenes y 3 épocas puede provocar sobreajuste al estilo del dataset y escasa diversidad; conviene validar la calidad con prompts variados antes de desplegar.
- El adaptador no ha sido evaluado con métricas de calidad ni comparado cuantitativamente con alternativas; su rendimiento real es desconocido más allá de la comparación cualitativa incluida en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Roxana80/sd-v1-4-lora-oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Documentación de diffusers para LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion (Latent Diffusion): https://arxiv.org/abs/2112.10752

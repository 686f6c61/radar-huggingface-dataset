# Jialuo21/Imago-6B

## Resumen

Imago-6B es un modelo de generación de imágenes texto-a-imagen (text-to-image) desarrollado por el usuario Jialuo21, consistente en un transformer DiT (Diffusion Transformer) de 6.154.908.736 parámetros (aproximadamente 6,15 mil millones) afinado mediante aprendizaje por refuerzo (RL) sobre el modelo base Tongyi-MAI/Z-Image. El modelo se presenta como un post-entrenamiento RL de parámetros completos, descrito por el autor en el trabajo "Imago: Maturing Visual Generation with RL", y su objetivo es mejorar la calidad, la fidelidad al prompt y la coherencia compositiva respecto al modelo base del que parte.

La relevancia del modelo reside en su enfoque de entrenamiento: en lugar de un ajuste supervisado clásico, aplica un currículo de RL en dos etapas secuenciales con una recompensa basada en un modelo juez zero-shot (Qwen3.5-9B ProbScore), usando el algoritmo DiffusionNFT con Branch Sampling, DAVE y regularización de norma de velocidad escalar. Según la model card, este procedimiento eleva la puntuación media agregada de benchmarks de 81,2 (Z-Image base) a 85,3.

El modelo se distribuye únicamente como pesos del transformer DiT en formato safetensors (config.json + diffusion_pytorch_model.safetensors), y requiere cargarse junto con el pipeline ZImagePipeline del modelo base. El repositorio ocupa 25,9 GB y se publicó en septiembre de 2026, con última actualización en noviembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT), según la model card |
| Parametros totales | 6.154.908.736 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusion_pytorch_model.safetensors) + config.json |

## Arquitectura y entrenamiento

Imago-6B es un transformer de difusión (DiT) de parámetros completos inicializado desde Tongyi-MAI/Z-Image. No se trata de un modelo de lenguaje sino de un modelo generativo visual: recibe un prompt de texto y genera imágenes mediante un proceso de difusión iterativo. El repositorio contiene únicamente los pesos del transformer; el codificador de texto, el VAE y el scheduler se heredan del pipeline ZImagePipeline del modelo base.

El entrenamiento consiste en un post-entrenamiento por aprendizaje por refuerzo con un currículo de dos etapas secuenciales: primero 500 pasos sobre el conjunto Imago-Short y después 500 pasos sobre Imago-Long, con una tasa de aprendizaje de 8e-6. La recompensa proviene de un modelo juez zero-shot Qwen3.5-9B ProbScore. El algoritmo empleado es DiffusionNFT con Branch Sampling (t en [0.5, 1.0]), DAVE (block 24/30) y regularización de norma de velocidad escalar (beta = 0.10), sin CFG ni penalización KL. Esta combinación busca estabilizar el RL sobre un modelo de difusión sin depender de clasificador libre de guía durante el entrenamiento.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts descriptivos en lenguaje natural.
- Composición de escenas complejas con múltiples objetos, materiales e iluminación, según los ejemplos de la model card (por ejemplo, un telescopio de latón sobre un trípode junto a un atlas estelar en un balcón de piedra).
- Mejora de la fidelidad al prompt y de la coherencia espacial respecto al modelo base, según los benchmarks reportados por el autor.
- Generación de imágenes de alta resolución: el ejemplo de uso emplea 1024x1024 píxeles.
- Control mediante semilla (generator con manual_seed) y parámetros de muestreo (num_inference_steps, guidance_scale).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; son capacidades no aplicables o no disponibles para este tipo de modelo.

## Casos de uso

- Generación de ilustraciones conceptuales para documentación técnica: el modelo puede producir imágenes de escenas detalladas a 1024x1024 a partir de descripciones largas, útil para portadas de artículos o material divulgativo.
- Creación de assets para videojuegos y prototipado: permite generar variaciones de entornos, objetos y atmósferas con control de semilla, lo que facilita iterar sobre un mismo concepto manteniendo coherencia entre versiones.
- Diseño de escenas para previsualización de producto: con prompts que describen materiales e iluminación concretos, se pueden obtener bocetos de ambientación antes de un render final.
- Generación de imágenes para marketing y redes sociales: la mejora en fidelidad al prompt reportada por el autor reduce la necesidad de reintentos y ajustes manuales en campañas con descripciones específicas.
- Investigación en RL para modelos generativos: al publicarse los pesos del post-entrenamiento junto con la receta (DiffusionNFT, DAVE, currículo en dos etapas), sirve como referencia reproducible para estudiar técnicas de RL aplicadas a difusión.
- Evaluación comparativa de modelos text-to-image: al estar inicializado desde Z-Image y mantener el mismo pipeline, permite aislar el efecto del post-entrenamiento RL comparando ambos modelos con idénticos prompts y semillas.
- Generación de material educativo visual: descripciones de escenas históricas o científicas pueden convertirse en ilustraciones de apoyo para clases y presentaciones.

## Benchmarks y rendimiento

Resultados reportados en la model card, evaluados con juez Kimi-K2.6:

| Modelo | Mean | T2I-CompBench | TIIF-Bench | SpatialGenEval | T2I-CoReBench | LPD-Bench | Arena-T2I-Hard | LongBench-T2I | DrawBench PickScore |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Imago-6B | 85,3 | 4,14 | 88,8 | 83,0 | 94,5 | 93,6 | 82,4 | 3,61 | 23,0 |
| Z-Image (Base) | 81,2 | 3,98 | 85,7 | 77,9 | 90,8 | 91,1 | 78,0 | 3,26 | 22,4 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que no son aplicables a un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del transformer suman aproximadamente 6,15 mil millones de parámetros; en bfloat16 (el formato del ejemplo de uso) ocupan unos 12,3 GB solo para el transformer. A ello hay que sumar el codificador de texto, el VAE y el pipeline completo del modelo base, por lo que se recomienda un mínimo orientativo de 16-24 GB de VRAM en bfloat16.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en bfloat16 a 1024x1024.
- GPU de consumo: cabe en RTX 4090 y, con cuantización o descarga parcial a CPU, en GPUs de 16 GB; no se documentan cuantizaciones oficiales en el repositorio.
- Opciones de despliegue: la librería indicada es diffusers, cargando ZImageTransformer2DModel desde este repositorio y ZImagePipeline desde Tongyi-MAI/Z-Image. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada; el ejemplo de uso emplea 50 pasos de inferencia con guidance_scale 4.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Mean, juez Kimi-K2.6) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imago-6B | 6.154.908.736 | no disponible | 85,3 | no disponible | Hugging Face (pesos del transformer) |
| Tongyi-MAI/Z-Image (base) | no disponible | no disponible | 81,2 | no disponible | Hugging Face (pipeline completo) |

No se dispone en la información proporcionada de datos sobre otros modelos text-to-image comparables (por ejemplo, de la familia Flux, SDXL o similares) que permitan una comparativa adicional sin inventar cifras.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; antes de cualquier uso comercial es imprescindible verificar los términos del repositorio y, en su caso, los del modelo base Tongyi-MAI/Z-Image.
- El repositorio contiene únicamente los pesos del transformer; no es un modelo autónomo y requiere el pipeline ZImagePipeline y los componentes del modelo base para funcionar.
- Los benchmarks reportados proceden del propio autor y usan un juez concreto (Kimi-K2.6); no se han verificado de forma independiente en la información disponible.
- No hay datos publicados sobre sesgos, tasas de alucinación visual ni comportamiento en idiomas distintos del inglés; la model card y el ejemplo de prompt están en inglés.
- No se documentan cuantizaciones oficiales ni optimizaciones de memoria, lo que limita el despliegue en hardware de gama baja.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- Al ser un modelo de difusión, no admite tool calling, agentes ni razonamiento multi-paso; no debe evaluarse con métricas de modelos de lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jialuo21/Imago-6B
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Conjunto Imago-Short (citado en la receta): https://huggingface.co/Jialuo21/Imago-Short
- Conjunto Imago-Long (citado en la receta): https://huggingface.co/Jialuo21/Imago-Long
- Paper "Imago: Maturing Visual Generation with RL": no disponible como enlace en la información proporcionada.

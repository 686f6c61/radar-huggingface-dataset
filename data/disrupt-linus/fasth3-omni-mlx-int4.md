# Disrupt-linus/FastH3-Omni-MLX-INT4

## Resumen

FastH3-Omni MLX INT4 es un checkpoint preconvertido y cuantizado a 4 bits del modelo FastH3-Omni, un sistema de generación de vídeo con audio sincronizado a partir de texto y referencias multimodales. Lo publica el usuario Disrupt-linus como conversión comunitaria orientada específicamente a Apple Silicon, ejecutable de forma nativa sobre Metal mediante Apple MLX. El modelo original es de tipo diffusion transformer (DiT) con 50 bloques y dimensión oculta de 2688, y esta versión reduce el peso de los pesos DiT de aproximadamente 52,8 GB en BF16 a unos 11,9 GB en INT4 afín.

El problema que resuelve es práctico: el checkpoint upstream en PyTorch/Safetensors ocupa unos 65 GB y exige más de 64 GB de VRAM o memoria unificada, además de un paso de conversión en el host que requiere más de 50 GB de RAM. Esta conversión elimina esa fricción y permite ejecutar el pipeline completo en equipos con 24, 32 o 64 GB de memoria unificada, es decir, MacBook Pro y Mac Studio con chips M1 a M4 en variantes Pro, Max y Ultra.

Es relevante ahora porque acerca la generación de vídeo con audio a hardware de consumo Apple sin necesidad de GPUs de datacenter, incorporando además optimizaciones concretas como el prehorneado del schedule AdaLN de 8 pasos y la retención de las matrices de compuerta VSA para condicionamiento espacial multi-referencia. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con 50 bloques y dimensión oculta 2688, pipeline text-to-video con VAE de vídeo y VAE de audio |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 afín con `group_size=64`; capas de proyección cross-attention y normalización en precisión completa; decodificadores VAE en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con manifiestos JSON de configuración |

## Arquitectura y entrenamiento

El modelo se basa en un diffusion transformer con 50 bloques y dimensión oculta de 2688, según el manifiesto `mlx_h3_dit.json`. El pipeline combina un DiT de vídeo, un VAE de vídeo con dos decodificadores (uno de calidad de 36 capas y otro rápido de 8 capas en tiempo real), un VAE latente de audio omnidireccional de 577 MB, un text encoder basado en Qwen2.5-VL y un scheduler de flujo (FlowMatchEulerDiscreteScheduler para audio y un scheduler de flujo PDD de 8 pasos para vídeo). La generación es multimodal: produce vídeo y audio de forma conjunta a partir de prompts textuales y referencias de imagen.

La conversión aplica cuantización afín de 4 bits con `group_size=64` sobre los pesos del DiT, manteniendo en precisión completa las proyecciones de cross-attention y las capas de normalización. Se conservan las matrices de compresión de compuerta VSA (Visual-Spatial Alignment) necesarias para el condicionamiento espacial con múltiples referencias, y se incrustan en el checkpoint los vectores estáticos de condicionamiento AdaLN correspondientes al scheduler PDD de 8 pasos, lo que elimina unos 12 GB de asignación dinámica en tiempo de ejecución. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo upstream.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable, por ejemplo 720x480 y 49 frames en el ejemplo de la model card.
- Generación de audio sincronizado con el vídeo en el mismo pipeline.
- Condicionamiento multi-referencia mediante las compuertas VSA retenidas, orientado a mantener coherencia espacial entre referencias visuales.
- Inferencia en 8 pasos gracias al scheduler PDD prehorneado, lo que reduce el coste computacional frente a schedules de más pasos.
- Dos modos de decodificación de vídeo: decodificador de calidad de 36 capas y decodificador rápido de 8 capas para generación en tiempo real.
- Codificación de texto e imagen de referencia mediante Qwen2.5-VL y el encoder LightVAE Lite.
- Ejecución nativa en Apple Silicon sobre Metal a través de MLX.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking; el pipeline es de generación de vídeo y audio.

## Casos de uso

- Prototipado de vídeo generativo en local: un desarrollador con un MacBook Pro de 32 GB puede generar clips de 720x480 con audio sin depender de servicios en la nube, usando el decodificador rápido de 8 capas para iterar con rapidez sobre prompts.
- Creación de contenido para redes sociales: generación de clips cortos con banda sonora ambiental a partir de descripciones textuales, aprovechando la salida conjunta de vídeo y audio para evitar el montaje posterior.
- Previsualización de storyboards: estudiar composición, iluminación y atmósfera de escenas descritas en texto antes de producir con herramientas de mayor coste, con el decodificador de calidad de 36 capas para las versiones finales.
- Investigación en modelos de difusión: servir de base reproducible en Apple Silicon para experimentar con cuantización INT4, schedules PDD y decodificadores VAE ligeros sin montar infraestructura CUDA.
- Generación de audio ambiental y efectos: el VAE de audio omnidireccional permite producir paisajes sonoros sincronizados con la escena, útil para demos y prototipos de videojuegos o piezas audiovisuales.
- Evaluación de pipelines MLX: integración en el repositorio FastVideo (rama `aryan/fasth3-omni-mlx`) para comparar rendimiento y calidad frente a la versión PyTorch upstream en el mismo hardware.
- Docencia y talleres: al caber en 24 GB de memoria unificada, permite demostrar generación de vídeo con difusión en equipos portátiles de aula sin GPUs dedicadas.

## Benchmarks y rendimiento

La model card no publica métricas de calidad (FVD, CLIP score, MOS de audio u otras). Los únicos datos numéricos son de tamaño y requisitos de memoria:

| Métrica | Upstream PyTorch / Safetensors | FastH3-Omni MLX INT4 |
|---|---|---|
| Tamaño de pesos DiT | ~52,8 GB (BF16) | ~11,9 GB (INT4 afín) |
| Distribución completa | ~65 GB | ~15,0 GB |
| VRAM mínima requerida | 64 GB+ (MPS/CUDA) | 24 / 32 / 64 GB Apple Silicon |
| Formato de cuantización | BF16 sin comprimir | INT4 afín (`group_size=64`) |
| Caché AdaLN | Calculada en runtime (~12 GB) | Schedule PDD de 8 pasos prehorneado (0 MB dinámicos) |
| Hardware objetivo | Multi-GPU Linux / datacenter | MacBook Pro / Mac Studio (M1/M2/M3/M4 Pro/Max/Ultra) |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- Memoria unificada mínima: 24 GB en Apple Silicon; recomendable 32 GB para el pipeline completo con decodificador de calidad; 64 GB para margen holgado.
- GPU compatibles: chips Apple M1, M2, M3 y M4 en variantes Pro, Max y Ultra. No se contemplan GPUs NVIDIA ni AMD en esta conversión.
- No cabe en GPUs de consumo con VRAM dedicada al no ser un formato MLX; para CUDA sería necesario el checkpoint upstream en BF16 con 64 GB+ de VRAM.
- Despliegue: Apple MLX con el runtime `fastvideo.mlx_runtime.minimax_h3` y el repositorio FastVideo (rama `aryan/fasth3-omni-mlx`). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este formato.
- Dependencias: `mlx`, `torch`, `transformers`, `diffusers`, `huggingface_hub`.
- Latencia y throughput: no disponibles. La model card solo indica que el decodificador de 8 capas está pensado para generación en tiempo real y que el prehorneado de AdaLN ahorra unos 12 GB de memoria en runtime.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Contexto / duración | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| FastH3-Omni MLX INT4 (esta ficha) | DiT vídeo + audio, INT4 | ~11,9 GB DiT, ~15 GB total | 49 frames a 720x480 en el ejemplo | Apache 2.0 | Apple Silicon 24-64 GB |
| FastH3-Omni upstream (PyTorch/Safetensors) | DiT vídeo + audio, BF16 | ~52,8 GB DiT, ~65 GB total | no disponible | Apache 2.0 | Multi-GPU Linux / CUDA, 64 GB+ |
| Alternativas de vídeo generativo open source de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación se limita al contraste entre la conversión MLX y el checkpoint upstream del mismo modelo.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni fidelidad audiovisual para esta conversión; el proceso de cuantización INT4 puede degradar la calidad respecto al BF16 original, especialmente en detalles finos y sincronización de audio.
- Riesgo de alucinación visual y sonora inherente a los modelos de difusión: el modelo puede generar elementos no solicitados en el prompt o audio incoherente con la escena.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay validación comunitaria ni historial de uso en producción.
- La conversión es comunitaria y no oficial; el autor no es el desarrollador del modelo original. La rama de FastVideo necesaria (`aryan/fasth3-omni-mlx`) es una rama de desarrollo, no una versión estable.
- Limitado a Apple Silicon: no es portable a CUDA sin reconvertir los pesos. El formato MLX no es compatible con vLLM, TGI ni llama.cpp.
- Idiomas soportados no documentados; el comportamiento multilingüe del text encoder Qwen2.5-VL no se ha verificado en esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversión de un modelo de terceros conviene verificar la licencia y condiciones del checkpoint upstream antes de desplegar en producción.
- No se documentan garantías de reproducibilidad ni de soporte por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Disrupt-linus/FastH3-Omni-MLX-INT4
- Repositorio FastVideo (rama MLX): https://github.com/fastvideo/FastVideo/tree/aryan/fasth3-omni-mlx
- Hilo de r/StableDiffusion que motivó la conversión: https://www.reddit.com/r/StableDiffusion/comments/1xkftos/request_could_someone_create_a_preconverted/
- Apple MLX: https://github.com/ml-explore/mlx
- Modelo upstream FastH3-Omni: no disponible en la información proporcionada

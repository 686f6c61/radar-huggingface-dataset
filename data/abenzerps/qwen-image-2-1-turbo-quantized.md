# abenzerps/Qwen-Image-2.1-Turbo-Quantized

## Resumen
Qwen-Image-2.1-Turbo-Quantized es un paquete de versiones cuantizadas del modelo de generacion de imagenes Qwen-Image-2.1-Turbo, publicado por el usuario abenzerps sobre el modelo base de Qwen. El modelo base es una arquitectura de generacion visual de aproximadamente 7.115 millones de parametros (7B) orientada a text-to-image, con un modo "Turbo" que reduce el proceso de denoising a 8 pasos con CFG = 1, lo que permite generar imagenes de 1024 × 1024 en unos 10-20 segundos en GPU tras el calentamiento.

El repositorio no contiene un modelo nuevo, sino un conjunto de conversiones y cuantizaciones del modelo base en multiples formatos: GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0), safetensors FP8, INT8 ConvRot y NVFP4, y variantes MLX de 4, 6 y 8 bits. Tambien incluye los componentes auxiliares necesarios para su uso en ComfyUI: el text encoder Qwen3-VL 8B (en BF16 e INT8) y el VAE especifico del modelo.

Su relevancia practica radica en que reduce la barrera de hardware para ejecutar un modelo de generacion de imagenes de 7B: las variantes de 4 bits (NVFP4, MLX 4-bit, Q4_K_M) ocupan entre 4 y 4,4 GB, lo que las hace viables en GPUs de consumo. El repositorio acumula 187.989 descargas y 6.043 likes en Hugging Face, lo que refleja una adopcion considerable dentro del ecosistema ComfyUI.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagenes (text-to-image); detalles internos no disponibles |
| Parametros totales | 7.115.124.736 (7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0); safetensors FP8, INT8 ConvRot, NVFP4; MLX 4-bit, 6-bit, 8-bit |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (etiquetada como "other") |
| Formato de pesos | safetensors y GGUF; variantes MLX en safetensors |

## Arquitectura y entrenamiento
El modelo base Qwen-Image-2.1-Turbo es una arquitectura de generacion visual de 7B parametros para text-to-image. La variante "Turbo" esta configurada para generar con solo 8 pasos de denoising y CFG = 1, usando el sampler Euler con el schedule de sigma oficial, lo que reduce drasticamente el coste computacional frente a los pipelines de difusion convencionales de 20-50 pasos. El repositorio no proporciona detalles sobre la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre si se emplearon tecnicas de RLHF, DPO o fine-tuning por preferencias.

El text encoder asociado es Qwen3-VL 8B, lo que sugiere que el pipeline utiliza un modelo de lenguaje multimodal como codificador de texto en lugar de un CLIP o T5 convencional. Se incluye un VAE propio (qwen_image_2.1_vae_bf16.safetensors, 0,68 GB). La innovacion principal del paquete es la cuantizacion: INT8 ConvRot y NVFP4 son formatos de cuantizacion de baja precision orientados a acelerar la inferencia en hardware moderno (NVFP4 requiere GPUs Blackwell), y las variantes MLX estan pensadas para Apple Silicon mediante MFLUX.

## Capacidades
- Generacion de imagenes a partir de descripciones textuales (text-to-image) a 1024 × 1024.
- Generacion "Turbo" con 8 pasos de denoising y CFG = 1, con latencias de 10-20 segundos en GPU tras el calentamiento.
- Generacion de imagen sin filtro de seguridad integrado ni content checker, segun indica el autor del repositorio.
- Codificacion de prompts mediante un text encoder Qwen3-VL 8B, que aporta comprension multimodal del texto de entrada.
- Compatibilidad con ComfyUI (flujo de trabajo oficial de plantilla para Qwen Image 2.1 Turbo) y con stable-diffusion.cpp como runtime de linea de comandos.
- Compatibilidad con MLX / MFLUX en Apple Silicon mediante las variantes MLX de 4, 6 y 8 bits.
- No se documentan capacidades de edicion de imagen, inpainting, tool calling ni agentes.

## Casos de uso
- Generacion de ilustraciones para prototipado de producto: con la variante Q4_K_M (4,42 GB) se pueden generar bocetos a 1024 × 1024 en una GPU de consumo en segundos, lo que permite iterar sobre conceptos visuales rapidamente sin depender de servicios en la nube.
- Creacion de assets para videojuegos y contenido digital: el modo Turbo de 8 pasos permite generar lotes de imagenes de fondo y elementos decorativos en pipelines automatizados, reduciendo el coste por imagen frente a modelos de difusion de 20-50 pasos.
- Integracion en flujos de ComfyUI para artistas tecnicos: el repositorio incluye el text encoder y el VAE empaquetados y una plantilla oficial, de modo que un equipo puede montar un nodo de generacion reproducible con semilla fija y comparar variantes de cuantizacion.
- Despliegue local en Apple Silicon: las variantes MLX 4-bit (4,00 GB) y 6-bit (5,78 GB) permiten ejecutar el modelo en Macs con memoria unificada mediante MFLUX, util para estudios que trabajan sin GPU dedicada.
- Generacion de imagenes sin restricciones de contenido para investigacion: al no incluir safety checker integrado, el modelo es adecuado para estudios academicos sobre sesgos y contenido generado, siempre que se apliquen las salvaguardas externas necesarias.
- Automatizacion por linea de comandos: mediante stable-diffusion.cpp y los ficheros GGUF se pueden construir scripts de generacion por lotes para catalogos, mockups o pruebas de concepto, sin necesidad de interfaz grafica.

## Benchmarks y rendimiento
El repositorio incluye una imagen de comparacion de benchmarks (`assets/Qwen-Image-2.1-Benchmark.png`) y una referencia a la comparacion de benchmarks del modelo base, pero no se proporcionan los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para el modelo de difusion: aproximadamente 4,0-4,4 GB con cuantizacion de 4 bits (NVFP4, MLX 4-bit, Q4_0, Q4_K_M); 5,3-6,3 GB con 5-6 bits (Q5_K_M, Q6_K, MLX 6-bit); 7,1-7,7 GB con 8 bits (FP8, INT8 ConvRot, MLX 8-bit, Q8_0).
- El text encoder Qwen3-VL 8B anade 9,35 GB en INT8 o 17,53 GB en BF16, y el VAE 0,68 GB; el consumo total del pipeline es notablemente superior al del modelo de difusion por si solo.
- GPU recomendadas: no especificadas por el autor. Por tamano, las variantes de 4 bits caben en GPUs de consumo con 8-12 GB de VRAM; NVFP4 requiere GPUs con soporte de ese formato (familia Blackwell).
- Cabe en GPU de consumo: si, con las variantes de 4 bits y el text encoder en INT8, siempre que se disponga de memoria suficiente para el pipeline completo.
- Opciones de despliegue: ComfyUI (GGUF, FP8, INT8 ConvRot, NVFP4), stable-diffusion.cpp (GGUF y safetensors compatibles), MLX / MFLUX (variantes MLX).
- Latencia: 1024 × 1024 en aproximadamente 10-20 segundos en GPU tras el calentamiento, segun el autor, dependiendo del hardware. No se documenta throughput para lotes.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- El modelo base no incluye safety checker ni filtro de contenido, segun declara el autor; en produccion es imprescindible anadir salvaguardas externas de moderacion.
- La licencia es qwen-research (etiquetada como "other"), lo que previsiblemente restringe el uso comercial; es necesario revisar los terminos exactos antes de desplegar en produccion.
- No se documentan los idiomas soportados por el text encoder ni la calidad de generacion en prompts en castellano.
- No se publican metricas de benchmarks numericas en la informacion disponible, por lo que no es posible evaluar la calidad objetiva frente a alternativas.
- El repositorio ocupa 215,1 GB en total por acumular todas las variantes; conviene descargar solo los ficheros necesarios.
- El pipeline completo requiere el modelo de difusion, el text encoder y el VAE; usar solo el fichero de difusion no es suficiente.
- Riesgo de alucinacion visual y de artefactos en prompts complejos no cuantificado en la informacion disponible.
- Las cuantizaciones de 4 bits pueden degradar la fidelidad respecto a FP8/BF16; el autor recomienda mantener la semilla fija al comparar variantes.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Plantilla oficial de ComfyUI (workflow JSON): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_turbo_t2i.json
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- GitHub del autor: https://github.com/abenzerps
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/

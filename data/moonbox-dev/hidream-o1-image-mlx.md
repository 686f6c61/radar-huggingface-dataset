# moonbox-dev/HiDream-O1-Image-MLX

## Resumen

HiDream-O1-Image-MLX es una conversión a formato MLX del modelo HiDream-O1-Image, un modelo de generación y edición de imágenes desarrollado originalmente por HiDream-ai y portado a Apple Silicon por moonbox-dev. El modelo base combina un backbone de lenguaje y visión basado en Qwen3-VL con un decodificador de imagen, lo que le permite tanto la síntesis texto-a-imagen como la edición imagen-a-imagen guiada por instrucciones en lenguaje natural. Esta versión MLX está pensada para ejecutarse de forma nativa en Macs con chips Apple Silicon, sin necesidad de GPU NVIDIA ni de CUDA.

El repositorio ofrece dos precisiones: bf16, con fidelidad casi exacta respecto al modelo PyTorch original (59,9 dB de PSNR en texto-a-imagen y 47,0 dB en edición), y 8 bits, marcada como experimental y con una degradación perceptible según LPIPS (0,229 de media, 0,462 en el peor caso). El tamaño del repo es de 38,5 GB, con pesos de 16,37 GB en bf16 y 9,27 GB en 8 bits.

La relevancia de esta ficha radica en que cubre un nicho concreto: inferencia de un modelo generativo de imagen de gran tamaño en hardware Apple, un escenario poco habitual en el ecosistema open source, dominado por implementaciones CUDA. La licencia MIT del modelo base facilita su uso comercial, aunque la información pública disponible sobre arquitectura, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base basado en Qwen3-VL según los tags) |
| Parametros totales | No disponible (pesos bf16 de 16,37 GB) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 y 8 bits |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base HiDream-O1-Image. Los tags del repositorio indican que integra Qwen3-VL, lo que sugiere un componente de comprensión multimodal de lenguaje y visión que actúa como codificador de instrucciones y condiciones, junto con un módulo de generación de imagen. El pipeline declarado es image-to-image, aunque los tags incluyen también text-to-image. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La conversión MLX, realizada por moonbox-dev, incluye únicamente los componentes listados en la model card (configuración, tokenizer, pesos y un script `mlx_model.py` de 29,3 kB); el resto del pipeline se toma del repositorio original de HiDream-ai. La validación reportada compara la salida forward frente a PyTorch bf16: 59,9 dB en texto-a-imagen y 47,0 dB en edición, con un tiempo aproximado de 5,4 minutos por imagen de 1024x1024. La versión de 8 bits se marca como experimental y por debajo del umbral de calidad, con LPIPS de 0,229 de media y 0,462 en el peor caso.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes guiada por instrucciones (image-to-image), según el pipeline declarado.
- Comprensión multimodal de instrucciones gracias al componente Qwen3-VL.
- Ejecución nativa en Apple Silicon mediante MLX.
- Dos niveles de precisión para equilibrar calidad y uso de memoria (bf16 y 8 bits).
- No se ha documentado soporte de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Edición de imágenes en local en un Mac: el pipeline image-to-image permite aplicar instrucciones de edición sobre una imagen existente sin salir del equipo, aprovechando la conversión MLX para Apple Silicon.
- Prototipado de generación texto-a-imagen en desarrollo: útil para iterar prompts y estilos en un entorno de escritorio Apple antes de escalar a infraestructura con GPU.
- Creación de material gráfico para documentación técnica: generación de ilustraciones o diagramas conceptuales a partir de descripciones, con licencia MIT que facilita su inclusión en proyectos.
- Automatización de variaciones de imagen: dado el soporte image-to-image, se pueden generar variantes controladas de un activo visual para pruebas de diseño.
- Investigación en eficiencia de inferencia: el par bf16/8 bits y las métricas de fidelidad publicadas permiten estudiar el compromiso entre precisión y calidad en hardware Apple.
- Evaluación de ports MLX: sirve como caso de estudio para medir la fidelidad de conversiones MLX frente a PyTorch en modelos generativos de imagen de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta métricas de fidelidad de la conversión:

| Metrica | bf16 | 8 bits |
|---|---|---|
| PSNR vs PyTorch bf16 (text-to-image) | 59,9 dB | No disponible |
| PSNR vs PyTorch bf16 (edicion) | 47,0 dB | No disponible |
| LPIPS vs bf16 (media) | Referencia | 0,229 |
| LPIPS vs bf16 (peor caso) | Referencia | 0,462 |
| Tiempo por imagen 1024x1024 | ~5,4 min | No disponible |

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 16,37 GB para bf16 y 9,27 GB para 8 bits, solo para los pesos; hay que añadir la memoria del resto del pipeline y de activaciones.
- Hardware objetivo: Macs con Apple Silicon (MLX no soporta GPU NVIDIA ni CUDA).
- No cabe en GPUs de consumo tipo RTX 4090 mediante esta conversión, ya que está diseñada exclusivamente para MLX.
- Despliegue: librería MLX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia reportada: aproximadamente 5,4 minutos por imagen de 1024x1024 en bf16 (hardware de referencia no especificado).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- La información pública sobre arquitectura, datos de entrenamiento y benchmarks es muy escasa; no se pueden evaluar sesgos ni calidad objetiva.
- La cuantización a 8 bits está marcada como experimental y con degradación perceptible (LPIPS de hasta 0,462 en el peor caso).
- El tiempo de inferencia reportado (~5,4 minutos por imagen) limita su uso en aplicaciones interactivas o de alto throughput.
- Dependencia exclusiva de Apple Silicon; no es portable a CUDA ni a otras plataformas sin reconversión.
- Al depender del pipeline original de HiDream-ai para componentes no convertidos, pueden aparecer incompatibilidades de versión.
- Riesgo de alucinación visual y de sesgos heredados del modelo base, no documentados en la información disponible.
- La licencia MIT del modelo base permite uso comercial, pero conviene verificar las condiciones de los componentes de terceros (por ejemplo, Qwen3-VL) antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/HiDream-O1-Image-MLX
- Modelo base: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Paper referenciado en tags: arxiv:2605.11061 (no verificado en la información disponible)

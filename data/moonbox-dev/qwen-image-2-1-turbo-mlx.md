# moonbox-dev/Qwen-Image-2.1-Turbo-MLX

## Resumen

Qwen-Image-2.1-Turbo-MLX es una conversión al framework MLX del modelo de difusión Qwen-Image-2.1-Turbo, desarrollada por moonbox-dev para su ejecución nativa en ordenadores Apple Silicon. El modelo original pertenece a la familia Qwen de Alibaba y está orientado a generación de imágenes a partir de texto (text-to-image) y edición de imágenes. Esta versión empaqueta los pesos en formato MLX (safetensors por componente) para aprovechar la GPU unificada de los chips M-series de Apple.

La relevancia de esta ficha radica en que permite ejecutar un modelo de difusión de gran tamaño en hardware de consumo Apple sin depender de CUDA ni de GPUs dedicadas. El repositorio ocupa 74 GB e incluye el text encoder, el transformer de difusión y los ficheros de configuración del pipeline. La model card advierte de que la conversión es experimental y que la fidelidad respecto al modelo original se ha validado únicamente con un prompt de prueba.

Al tratarse de una cuantización/conversión y no de un modelo entrenado desde cero, las capacidades, sesgos y limitaciones heredan las del modelo base Qwen/Qwen-Image-2.1-Turbo. El autor no publica información sobre arquitectura interna, número de parámetros ni datos de entrenamiento en la model card disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (pipeline text-to-image / image-editing); detalles internos no disponibles en la model card |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (única precisión publicada en el repo) |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (licencia "other", enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (MLX), con ficheros JSON de configuración del pipeline |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el pipeline declarado (`text-to-image`) y la presencia de un `text_encoder` con 9 shards de safetensors y un `transformer` con shards de aproximadamente 2,12 GB cada uno, se trata de un modelo de difusión con encoder de texto separado y un transformer de difusión como componente generativo. El tamaño del text encoder (suma aproximada de 17,5 GB en bf16) sugiere un encoder de gran tamaño, coherente con la familia Qwen.

El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF/DPO o ajuste por preferencias. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención linear. La conversión a MLX la realiza Moonbox y solo cubre los componentes listados en la model card; el resto del pipeline se toma del repositorio original de Qwen. La validación de fidelidad reportada es experimental y basada en un único prompt: PSNR medio de 24,0 dB y LPIPS medio de 0,084 (peor caso 0,159), valores que el autor sitúa por debajo del umbral aceptable.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el pipeline de difusión.
- Edición de imágenes, según la etiqueta `image-editing` declarada por el autor.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Soporte de precisión bf16 como única opción publicada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no aplicables a un modelo de difusión y no documentados.

## Casos de uso

- Prototipado de generación de imágenes en Mac: permite iterar sobre prompts y estilos directamente en un portátil o Mac Studio con chip M-series, sin depender de una GPU NVIDIA externa, gracias al backend MLX.
- Edición de imágenes en flujos locales: la etiqueta `image-editing` sugiere uso para modificar imágenes existentes a partir de instrucciones, útil en estudios de diseño que trabajan en local por confidencialidad.
- Generación de ilustraciones para documentación técnica: integrable en scripts de Python con MLX para producir diagramas conceptuales o ilustraciones de apoyo en pipelines de documentación.
- Creación de assets para videojuegos y prototipos: generación rápida de conceptos visuales en equipos de diseño que ya trabajan en macOS.
- Experimentación académica en difusión: al ser una conversión MLX, sirve para estudiar el comportamiento de modelos de difusión grandes en hardware Apple y comparar fidelidad frente al original en PyTorch.
- Automatización de contenido visual en local: generación por lotes de imágenes para catálogos o blogs en entornos sin acceso a la nube, manteniendo los datos en el dispositivo.
- Evaluación de pipelines MLX: útil para equipos que quieran medir latencia y calidad de un modelo de difusión de gran tamaño en Apple Silicon antes de adoptar MLX en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de calidad reportado por el autor es la comparación frente al modelo original en un prompt de prueba: PSNR medio de 24,0 dB y LPIPS medio de 0,084 (peor caso 0,159), marcados como experimentales y por debajo del umbral del autor.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 74 GB en total; en bf16 el text encoder suma aproximadamente 17,5 GB y el transformer se reparte en múltiples shards de ~2,12 GB. Se requiere memoria unificada suficiente para cargar el pipeline completo o los componentes por fases.
- GPU recomendadas: chips Apple Silicon con memoria unificada amplia (M-series Pro, Max y Ultra). No aplica a GPUs NVIDIA/AMD por el uso de MLX.
- ¿Cabe en consumer GPU? No en el sentido tradicional de GPU dedicada; en Apple Silicon depende de la memoria unificada del chip. Un Mac con 32 GB podría no ser suficiente para el pipeline completo en bf16; se recomienda 64 GB o más.
- Opciones de despliegue: MLX (librería `mlx`), con el pipeline MFLUX (`mflux_model.json` presente en el repo). No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-MLX (este) | Difusión text-to-image, conversión MLX | safetensors MLX | qwen-research | Hugging Face (moonbox-dev) |
| Qwen/Qwen-Image-2.1-Turbo | Difusión text-to-image original | PyTorch (safetensors) | qwen-research | Hugging Face (Qwen) |
| Otras conversiones MLX de difusión | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Conversión experimental: la fidelidad frente al modelo original se ha validado con un único prompt y el propio autor indica que los valores quedan por debajo del umbral (PSNR 24,0 dB, LPIPS 0,084 medio).
- Licencia qwen-research: restringe el uso; es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- Solo bf16: no hay versiones cuantizadas a 8 o 4 bits en el repo, lo que limita su ejecución en equipos con poca memoria unificada.
- Dependencia de MLX y Apple Silicon: no es portable a CUDA ni a otros backends sin reconversión.
- Riesgo de alucinación visual y sesgos: heredados del modelo base; no se documentan en esta ficha por falta de información.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe en los prompts.
- Tamaño del repo (74 GB): requiere almacenamiento considerable y descarga lenta en conexiones modestas.
- Sin datos de benchmarks estándar ni de latencia/throughput: difícil estimar rendimiento en producción sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/Qwen-Image-2.1-Turbo-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Fichero de licencia: https://huggingface.co/moonbox-dev/Qwen-Image-2.1-Turbo-MLX/blob/main/LICENSE
- Configuración MFLUX: https://huggingface.co/moonbox-ai/Qwen-Image-2.1-Turbo-MLX/blob/main/bf16/mflux_model.json (enlace citado en la model card)

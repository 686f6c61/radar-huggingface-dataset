# dgrauet/ernie-image-sft-mlx

## Resumen

El modelo `dgrauet/ernie-image-sft-mlx` es una conversión al formato MLX (Apple Silicon) del modelo ERNIE-Image de Baidu, un Diffusion Transformer (DiT) de flujo único con 8 000 millones de parámetros diseñado para generación de texto a imagen. Esta conversión, realizada por dgrauet mediante la herramienta mlx-forge, permite ejecutar el modelo de forma nativa en hardware de Apple (M1, M2, M3, M4) aprovechando el framework MLX, sin depender de implementaciones basadas en CUDA o ROCm.

El repositorio incluye los pesos en safetensors (text encoder, transformer y VAE) junto con los ficheros de configuración necesarios para su uso con la librería `ernie-image-mlx`, un port puro en MLX que ha sido verificado contra la implementación de referencia de Diffusers con errores de paridad del orden de 1e-6. La relevancia de este modelo radica en que abre la posibilidad de ejecutar un modelo de difusión de 8B parámetros en equipos Apple Silicon con memoria unificada, un nicho que hasta ahora estaba dominado por soluciones basadas en CUDA. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único (single-stream) |
| Parametros totales | 8 000 millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de generación de imágenes; el tokenizador de texto procesa prompts, pero no se especifica longitud máxima) |
| Tipos de cuantizacion | fp16 (este repositorio); existen variantes int8 e int4 en otros repositorios del mismo autor |
| Idiomas soportados | No disponible (el ejemplo de uso emplea chino; probablemente soporta chino e inglés, pero no se documenta) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base ERNIE-Image, desarrollado por Baidu, emplea una arquitectura de Diffusion Transformer de flujo único con 8B parámetros. A diferencia de los modelos de difusión tradicionales basados en U-Net, este DiT procesa la información de texto e imagen en un único flujo de transformadores, lo que simplifica el diseño y mejora la eficiencia en la generación. El modelo incluye un codificador de texto (text encoder), un transformador principal (transformer) y un autoencoder variacional (VAE) para la decodificación de imágenes.

La conversión a MLX realizada por dgrauet mantiene la arquitectura original y ha sido sometida a pruebas de paridad contra Diffusers en precisión fp32, obteniendo errores máximos de 3.1e-6 en el DiT, 1.7e-6 en el encoder del VAE y 6.7e-6 en el decoder del VAE. No se dispone de información sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El sufijo "SFT" en el nombre del repositorio sugiere que se trata de una versión con fine-tuning supervisado, pero no se detallan los datos ni el procedimiento.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image), con soporte para descripciones detalladas en lenguaje natural.
- Ejecución nativa en Apple Silicon mediante el framework MLX, sin necesidad de GPU NVIDIA o AMD.
- Integración con la librería `ernie-image-mlx`, que ofrece una interfaz de línea de comandos para generar imágenes directamente.
- Compatibilidad con diferentes precisiones: fp16, int8 e int4, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o procesamiento multimodal más allá de la generación de imágenes.

## Casos de uso

- Generación de ilustraciones y concept art en estudios de diseño que trabajan con hardware Apple: el modelo permite crear imágenes de alta calidad a partir de briefs textuales directamente en equipos Mac, sin depender de servicios en la nube.
- Prototipado rápido de assets para videojuegos: los desarrolladores pueden generar texturas, fondos y elementos visuales mediante prompts, acelerando la fase de preproducción.
- Creación de contenido para marketing y redes sociales: equipos que usan Mac pueden producir imágenes personalizadas para campañas sin salir de su flujo de trabajo local.
- Asistencia a diseñadores gráficos en la exploración de ideas: el modelo puede generar múltiples variaciones de un concepto a partir de descripciones, facilitando la lluvia de ideas.
- Automatización de generación de imágenes en pipelines de CI/CD: al ser una librería instalable vía pip, puede integrarse en procesos automatizados de generación de contenido visual en entornos macOS.
- Educación e investigación en generación de imágenes: al ser un port MLX abierto y con licencia permisiva, sirve como base para estudiar el funcionamiento de DiT en hardware Apple y para experimentar con fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FID, CLIP score u otras comparativas con modelos similares.

## Requisitos de hardware

- Memoria RAM unificada: el repositorio ocupa 23.1 GB en fp16, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo completo en memoria. Con cuantización int8 o int4 (disponibles en otros repositorios del autor), el requisito puede reducirse a 16 GB o menos.
- GPU: compatible con cualquier chip Apple Silicon (M1, M1 Pro/Max/Ultra, M2, M3, M4) gracias al framework MLX. No requiere GPU NVIDIA.
- Despliegue: se utiliza la librería `ernie-image-mlx` (instalable con pip) que proporciona una interfaz CLI y una API de Python. No se mencionan integraciones con vLLM, Ollama u otros servidores de inferencia.
- Latencia y throughput: no se han publicado mediciones específicas. El rendimiento dependerá del modelo de chip y de la memoria disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de generación de imágenes en MLX. El ecosistema de modelos de difusión en MLX es reducido y no se han documentado comparativas directas con alternativas como Stable Diffusion MLX o FLUX.1 MLX. Se recomienda consultar el repositorio de `ernie-image-mlx` para posibles actualizaciones.

## Limitaciones y advertencias

- No se documentan sesgos específicos del modelo, pero al ser un modelo entrenado por Baidu, puede presentar sesgos culturales o lingüísticos propios de los datos de entrenamiento originales.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes que no correspondan fielmente a la descripción del prompt.
- Limitaciones de idioma: aunque el ejemplo usa chino, no se especifica qué idiomas soporta el tokenizador; es posible que el rendimiento sea inferior en idiomas no representados en el entrenamiento.
- La conversión MLX puede presentar ligeras diferencias numéricas respecto a la implementación original de Diffusers, aunque las pruebas de paridad muestran errores muy bajos (del orden de 1e-6).
- El modelo está pensado exclusivamente para hardware Apple Silicon; no funcionará en sistemas con GPU NVIDIA o AMD sin una conversión adicional.
- No se garantiza la calidad de las imágenes generadas en todos los casos; es recomendable validar los resultados antes de usarlos en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dgrauet/ernie-image-sft-mlx
- Modelo base original (Baidu): https://huggingface.co/baidu/ERNIE-Image
- Librería de inferencia ernie-image-mlx: https://github.com/dgrauet/ernie-image-mlx
- Herramienta de conversión mlx-forge: https://github.com/dgrauet/mlx-forge
- Proyecto mlx-arsenal (ops reutilizables): https://github.com/dgrauet/mlx-arsenal
- Skill mlx-porting para Claude Code: https://github.com/dgrauet/claude-skill-mlx-porting
- Colección de modelos ERNIE-Image de dgrauet: https://huggingface.co/collections/dgrauet/ernie-image

# dgrauet/ernie-image-turbo-mlx

## Resumen

`dgrauet/ernie-image-turbo-mlx` es una conversión al formato MLX del modelo de generación de imágenes `baidu/ERNIE-Image-Turbo`, desarrollado por el equipo ERNIE-Image de Baidu. Se trata de la versión destilada de ERNIE-Image, un Diffusion Transformer (DiT) de flujo único de 8 mil millones de parámetros diseñado para generar imágenes a partir de texto con alta fidelidad en solo 8 pasos de inferencia, lo que lo hace significativamente más rápido que modelos que requieren 20-50 pasos.

La conversión ha sido realizada por dgrauet con la herramienta `mlx-forge` y permite ejecutar el modelo de forma nativa en Apple Silicon, sin depender de CUDA ni de librerías como PyTorch. El repositorio incluye los tres componentes principales del pipeline: el text encoder bilingüe (6,39 GB), el transformer DiT (14,96 GB) y el VAE (160 MB), con un tamaño total de 23,1 GB. Existe además una versión cuantizada a 8 bits (`dgrauet/ernie-image-turbo-mlx-q8`) para reducir los requisitos de memoria.

La relevancia de este modelo radica en que democratiza el acceso a un generador de imágenes de calidad comparable a los modelos propietarios de Baidu, con licencia Apache 2.0, y su port a MLX permite ejecutarlo en hardware de consumo de Apple sin necesidad de GPUs NVIDIA, algo poco habitual en modelos de esta categoría.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único con text encoder bilingüe y VAE |
| Parametros totales | 8 mil millones (modelo base ERNIE-Image-Turbo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (aplica al text encoder para el prompt; no se especifica el límite de tokens) |
| Tipos de cuantizacion | MLX en precisión completa (fp32/fp16) y versión cuantizada q8 (`ernie-image-turbo-mlx-q8`) |
| Idiomas soportados | Chino e inglés (modelo bilingüe de Baidu; el ejemplo oficial usa prompt en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

ERNIE-Image-Turbo se basa en una arquitectura de Diffusion Transformer (DiT) de flujo único, en la que un único transformer procesa tanto el texto como las señales de difusión, a diferencia de arquitecturas duales como las de Stable Diffusion. El modelo es la versión destilada de ERNIE-Image, un modelo de 8B parámetros entrenado por Baidu, y ha sido optimizado mediante destilación para generar imágenes de alta calidad en solo 8 pasos de inferencia, frente a los 20-50 pasos típicos de otros modelos de difusión.

El pipeline completo consta de tres componentes: un text encoder bilingüe (chino-inglés) de 6,39 GB que codifica el prompt, el transformer DiT de 14,96 GB que realiza el proceso de difusión, y un VAE de 160 MB que decodifica las latentes en la imagen final. La conversión a MLX ha sido realizada con `mlx-forge`, una herramienta que transpila los pesos y operaciones de PyTorch al framework MLX de Apple, permitiendo ejecución nativa en los Neural Engine y GPU integradas de los chips M-series. El repositorio incluye además los archivos de configuración del tokenizer, scheduler y model index necesarios para la inferencia.

## Capacidades

- Generación de imágenes a partir de prompts de texto en chino e inglés.
- Inferencia rápida en solo 8 pasos de difusión, gracias al proceso de destilación aplicado por Baidu.
- Alta fidelidad y controlabilidad en escenarios prácticos de generación, según la documentación del modelo base.
- Soporte para diferentes resoluciones de salida; el fork de Anionex demuestra generación a 1280x640 con 50 pasos.
- Ejecución nativa en Apple Silicon mediante el framework MLX, sin necesidad de CUDA.
- Disponibilidad de versión cuantizada a 8 bits para reducir requisitos de memoria.
- No incluye capacidades de vision, tool calling ni razonamiento multimodal: es exclusivamente un modelo text-to-image.

## Casos de uso

- Generación de imágenes para documentación técnica: el modelo puede crear diagramas, ilustraciones y capturas conceptuales para manuales y guías, con prompts en chino o inglés y generación rápida en 8 pasos que acelera iteraciones de revisión.
- Creación de contenido para redes sociales: su velocidad de inferencia permite producir variaciones de imágenes en lote, ideal para campañas que necesitan múltiples versiones de un mismo concepto visual.
- Prototipado de diseño de producto: los equipos de diseño pueden generar conceptos visuales preliminares a partir de descripciones textuales antes de pasar a herramientas de diseño profesionales, reduciendo el tiempo de exploración de ideas.
- Generación de assets para presentaciones empresariales: permite crear ilustraciones personalizadas para diapositivas e informes sin depender de bancos de imágenes con licencias restrictivas.
- Ilustración de artículos y blogs: escritores y editores pueden generar imágenes de acompañamiento para publicaciones, aprovechando la licencia Apache 2.0 que permite uso comercial sin royalties.
- Entornos educativos y de investigación: el formato MLX y la licencia abierta facilitan su integración en proyectos académicos y experimentos de generación de imágenes en hardware Apple, sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base ERNIE-Image-Turbo de Baidu no incluye métricas comparativas (FID, CLIP score, etc.) en la documentación accesible, y la conversión MLX no modifica los pesos del modelo, por lo que el rendimiento cualitativo debería ser equivalente al del modelo original, aunque no hay datos cuantitativos para confirmarlo.

## Requisitos de hardware

- Memoria unificada: el repositorio completo ocupa 23,1 GB, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para la versión en precisión completa.
- Versión cuantizada q8: el modelo `ernie-image-turbo-mlx-q8` reduce el tamaño de los pesos a 8 bits, lo que permite ejecutarlo en Macs con 16-24 GB de memoria unificada.
- Chips compatibles: cualquier Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Los chips con más núcleos GPU (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) ofrecerán menor latencia.
- Despliegue: se utiliza mediante la librería `ernie-image-mlx` (pip install ernie-image-mlx), que gestiona la carga de pesos y la generación. No requiere vLLM, llama.cpp ni Ollama, ya que MLX es el framework de ejecución nativo.
- Rendimiento: no hay cifras oficiales de latencia o throughput. El fork de Anionex (`anionex/ernie-image-mlx`) afirma ser 2 veces más rápido que la implementación original de dgrauet, con generación a 1280x640 en 50 pasos como referencia, aunque sin métricas exactas publicadas.
- El modelo no requiere GPU NVIDIA ni CUDA; está diseñado exclusivamente para el ecosistema Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Licencia | Formato | Hardware objetivo |
|---|---|---|---|---|---|
| ERNIE-Image-Turbo (MLX) | 8B | 8 | Apache 2.0 | MLX/safetensors | Apple Silicon |
| FLUX.1-schnell | 12B | 1-4 | Apache 2.0 | PyTorch/GGUF | CUDA/Apple (via MLX) |
| SDXL | 3.5B | 20-50 | OpenRAIL | PyTorch/ONNX/MLX | CUDA/Apple |
| PixArt-Σ | 0.6B | 20-30 | MIT | PyTorch | CUDA/Apple |

La comparación se basa en datos públicos generales de cada modelo; no hay benchmarks directos que comparen ERNIE-Image-Turbo con estas alternativas en la información disponible. ERNIE-Image-Turbo destaca por su soporte bilingüe chino-inglés, que no ofrecen SDXL ni FLUX de forma nativa, y por su equilibrio entre tamaño (8B) y velocidad (8 pasos), situándose entre SDXL (más ligero pero más lento en pasos) y FLUX.1-schnell (más grande pero con menos pasos).

## Limitaciones y advertencias

- El modelo es exclusivamente text-to-image: no soporta edición de imágenes existentes, inpainting, outpainting ni control fino mediante máscaras o condiciones adicionales.
- Los idiomas soportados se limitan a chino e inglés; los prompts en otros idiomas pueden producir resultados degradados o incorrectos.
- No se han publicado métricas de sesgo o seguridad para esta conversión MLX; como modelo entrenado por Baidu, puede reflejar sesgos culturales y geográficos de sus datos de entrenamiento.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir imágenes con inconsistencias en texto incrustado, anatomía o detalles finos, especialmente con prompts complejos.
- La versión en precisión completa requiere 23,1 GB de almacenamiento y al menos 32 GB de memoria unificada, lo que excluye a Macs de gama de entrada con 8-16 GB.
- La conversión MLX no incluye el pipeline completo de entrenamiento ni fine-tuning; solo está disponible la inferencia mediante `ernie-image-mlx`.
- El ecosistema MLX es menos maduro que PyTorch en cuanto a herramientas de despliegue en producción; no hay soporte oficial para servidores de inferencia como TGI o vLLM.
- La fecha de creación del repositorio (abril de 2026) indica que es un proyecto reciente con adopción limitada (0 descargas, 0 likes), por lo que la comunidad de soporte es pequeña.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dgrauet/ernie-image-turbo-mlx
- Versión cuantizada q8: https://huggingface.co/dgrauet/ernie-image-turbo-mlx-q8
- Modelo base de Baidu: https://huggingface.co/baidu/ERNIE-Image-Turbo
- Librería de inferencia ernie-image-mlx: https://github.com/dgrauet/ernie-image-mlx
- Herramienta de conversión mlx-forge: https://github.com/dgrauet/mlx-forge
- Operaciones MLX reutilizables (mlx-arsenal): https://github.com/dgrauet/mlx-arsenal
- Skill de porting para Claude Code: https://github.com/dgrauet/claude-skill-mlx-porting
- Colección de modelos ERNIE-Image de dgrauet: https://huggingface.co/collections/dgrauet/ernie-image
- Fork optimizado de Anionex (2x más rápido): https://github.com/Anionex/ernie-image-mlx

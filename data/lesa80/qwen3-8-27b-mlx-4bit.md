# lesa80/Qwen3.8-27B-MLX-4bit

## Resumen

Qwen3.8-27B-MLX-4bit es una versión cuantizada en 4 bits del modelo multimodal Qwen3.8-27B, desarrollada por lesa80 y publicada en Hugging Face. Este modelo base, creado por Alibaba, combina un codificador de visión (ViT de 27 capas) con un transformador híbrido que alterna capas de Gated DeltaNet y Gated Attention, lo que le permite procesar texto, imágenes y vídeo, además de razonamiento explícito mediante tokens especiales de pensamiento. La cuantización MLX reduce el tamaño del modelo a 16,1 GB, manteniendo todas las capacidades originales: visión, razonamiento, contexto largo de 262 144 tokens y habilidades agénticas para uso de ordenador, navegador y móvil.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 27B en hardware con recursos limitados, especialmente en Apple Silicon gracias al formato MLX, o en GPUs con 16 GB de VRAM mediante cuantización. El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas. Aunque no se han publicado benchmarks específicos de esta versión cuantizada, la ficha se basa en las especificaciones declaradas por el autor y en las capacidades conocidas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48×Gated DeltaNet + 16×Gated Attention, con codificador de visión ViT de 27 capas (patch_size=16, temporal_patch_size=2) |
| Parametros totales | 27B (según model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos; hasta 1M con YaRN |
| Tipos de cuantizacion | 4-bit affine, group_size=64 (MLX) |
| Idiomas soportados | Ruso, inglés, chino y otros (lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors reporta 4 665 462 000 parámetros, cifra que no coincide con los 27B declarados en la model card. Esta discrepancia puede deberse a un error en la metadata de Hugging Face; se ha tomado como referencia la información del autor.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas de Gated DeltaNet (un mecanismo de atención lineal con compuertas) y 16 capas de atención tradicional con compuertas (Gated Attention). Esta mezcla busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. El componente de visión es un ViT de 27 capas con parche de 16×16 píxeles y parche temporal de 2 para vídeo. El modelo soporta un modo de razonamiento explícito mediante tokens especiales `thinking` y `response`, que permite generar cadenas de pensamiento antes de responder.

No se dispone de información detallada sobre el entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO. La model card solo indica que la versión cuantizada conserva todas las capacidades del original. La conversión a MLX se realizó con `mlx-vlm`, utilizando cuantización afín de 4 bits con grupo de tamaño 64.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo modo de pensamiento explícito con presupuesto de tokens configurable.
- Comprensión de imágenes y vídeo: descripción, respuesta a preguntas visuales y análisis de escenas.
- Procesamiento de contexto largo: 262 144 tokens nativos, ampliable a 1M con YaRN.
- Capacidades agénticas: uso de ordenador, navegador web y dispositivos móviles, lo que permite automatizar tareas de interfaz.
- Soporte multilingüe: ruso, inglés, chino y otros idiomas (no se especifica la lista completa).
- Interfaz compatible con OpenAI a través de `mlx_lm.server`, facilitando la integración en aplicaciones existentes.
- Funciona con herramientas de inferencia como LM Studio y mlx-vlm.

## Casos de uso

- Atención al cliente automatizada con soporte visual: el modelo puede gestionar conversaciones multi-turno que incluyan capturas de pantalla o fotos de productos, gracias a su ventana de contexto de 262 144 tokens y su capacidad de visión.
- Análisis de documentos escaneados: extracción de información de facturas, contratos o formularios con imágenes, combinando OCR visual con razonamiento textual.
- Agente de automatización de navegador: dado su soporte para uso de navegador y móvil, puede ejecutar tareas como rellenar formularios, extraer datos de páginas web o realizar comprobaciones de interfaz.
- Asistente de programación con contexto de repositorio completo: al cargar múltiples archivos de código en la ventana de contexto, puede responder preguntas sobre el proyecto y generar código con razonamiento explícito.
- Traducción y localización de contenido multimodal: procesa texto junto con imágenes o vídeos para traducir subtítulos, infografías o interfaces de usuario.
- Generación de informes técnicos a partir de datos visuales: por ejemplo, analizar gráficos, diagramas o capturas de pantalla de dashboards y producir resúmenes escritos detallados.
- Investigación académica: lectura de artículos con figuras y tablas, y generación de resúmenes o respuestas a preguntas específicas sobre el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otras evaluaciones para esta versión cuantizada. Se recomienda consultar la ficha del modelo base Qwen/Qwen3.8-27B para datos de rendimiento, aunque la cuantización puede degradar ligeramente la precisión.

## Requisitos de hardware

- VRAM estimada: el archivo cuantizado pesa 16,1 GB, por lo que se necesita al menos 16 GB de VRAM para cargar el modelo completo. Se recomienda 24 GB para dejar margen para la activación y el contexto.
- GPUs compatibles: RTX 3090, RTX 4090, A100, H100 y otras con 16 GB o más de VRAM. En Apple Silicon, funciona nativamente con MLX.
- En consumer GPU: cabe en una RTX 4080/4090 (16-24 GB) y en la mayoría de GPUs de 24 GB. No cabe en GPUs de 8-12 GB sin más cuantización o uso de memoria compartida.
- Opciones de despliegue: mlx-vlm para Python, LM Studio (con soporte MLX), y servidor OpenAI-compatible mediante `mlx_lm.server`. También se puede usar con vLLM si se convierte a otro formato, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos. Para un modelo de 27B en 4 bits, se espera una generación de entre 10 y 30 tokens por segundo en una RTX 4090, dependiendo del contexto y del modo de razonamiento.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría (VLM de ~27B). Se sugiere comparar con el modelo base Qwen3.8-27B (sin cuantizar) y con alternativas como Qwen2.5-VL-27B o Llama-3.2-11B-Vision, pero no se tienen datos de rendimiento de esta versión cuantizada para establecer una comparación rigurosa. Se recomienda consultar benchmarks del modelo base para una referencia.

## Limitaciones y advertencias

- La cuantización de 4 bits puede degradar ligeramente la calidad de generación en tareas de razonamiento complejo o en idiomas poco representados.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta versión. Como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- El contexto de 262 144 tokens es nativo, pero el uso de YaRN para extender a 1M puede afectar a la coherencia en tramos muy largos.
- La lista de idiomas soportados no está documentada; se sabe que incluye ruso, inglés y chino, pero no se garantiza cobertura completa para otros idiomas.
- La discrepancia entre el número de parámetros reportado por safetensors y el declarado en la model card sugiere posibles errores en la metadata; se recomienda verificar antes de usar en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base por si hubiera condiciones adicionales (aunque Qwen suele usar Apache 2.0).
- El modelo está optimizado para MLX, por lo que su uso en otras infraestructuras (CUDA, ROCm) requiere conversión adicional.

## Enlaces

- [Hugging Face: lesa80/Qwen3.8-27B-MLX-4bit](https://huggingface.co/lesa80/Qwen3.8-27B-MLX-4bit)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [mlx-vlm (repositorio GitHub)](https://github.com/Blaizzy/mlx-vlm)
- [Guía de conversión (HOWTO.md)](https://huggingface.co/lesa80/Qwen3.8-27B-MLX-4bit/blob/main/HOWTO.md)

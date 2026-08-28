# Oscilla/Qwen3.5-9B-mlx-4Bit

## Resumen

Oscilla/Qwen3.5-9B-mlx-4Bit es una conversión al formato MLX (Machine Learning for Apple Silicon) del modelo Qwen/Qwen3.5-9B, cuantizado a 4 bits con un tamaño de grupo de 64. El modelo original, desarrollado por Alibaba, es un modelo de visión y lenguaje (image-text-to-text) que integra tokens multimodales mediante entrenamiento de fusión temprana, logrando un rendimiento comparable al de Qwen3 y superior al de Qwen3-VL en tareas de razonamiento, código, agentes y comprensión visual. Esta versión MLX está pensada para ejecutarse eficientemente en equipos Apple con chip M-series, facilitando el despliegue local de un asistente multimodal de 9 mil millones de parámetros.

La conversión ha sido realizada con la librería mlx-lm (versión 0.31.2) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio incluye los pesos en formato SafeTensors específico de MLX, listos para cargar con mlx-lm o mlx-vlm. Aunque el modelo base declara 9B de parámetros, el archivo safetensors de este repositorio muestra un conteo de 1.399.927.296, una discrepancia que probablemente se deba a la estructura interna de los archivos cuantizados o a una partición del modelo; se recomienda verificar la documentación oficial de Qwen para obtener el número exacto de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen3.5-9B |
| Parametros totales | 1.399.927.296 (según safetensors; el modelo base declara 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit, grupo de tamaño 64 (~5.059 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX SafeTensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura de transformer multimodal con fusión temprana de tokens de visión y lenguaje. Según la información publicada en Ollama, Qwen3.5 incorpora un entrenamiento unificado de visión-lenguaje que logra paridad con Qwen3 en tareas generales y supera a los modelos Qwen3-VL en razonamiento, programación, uso de agentes y comprensión visual. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO en esta conversión específica.

La conversión a MLX se realizó con la herramienta mlx-lm (versión 0.31.2) aplicando cuantización de 4 bits con grupo de tamaño 64. Este proceso reduce el tamaño del modelo a aproximadamente 5.1 GB (frente a los ~18 GB del modelo original en FP16), manteniendo un equilibrio entre rendimiento y fidelidad. El formato MLX está optimizado para la memoria unificada de los chips Apple Silicon, permitiendo una inferencia eficiente sin necesidad de GPU dedicada.

## Capacidades

- Procesamiento de entrada multimodal: acepta tanto texto como imágenes, lo que permite tareas de descripción visual, respuesta a preguntas sobre imágenes y razonamiento visual.
- Generación de texto conversacional: compatible con el chat template de Qwen, soporta conversaciones multi-turno.
- Razonamiento y comprensión de contexto: hereda las capacidades del modelo base Qwen3.5, que destacan en razonamiento lógico y matemático.
- Generación de código: el modelo base ha sido evaluado en tareas de programación, mostrando buen rendimiento en benchmarks como HumanEval (según la información general de Qwen3.5, no de esta conversión).
- Capacidades de agente y tool calling: el modelo base soporta invocación de funciones y razonamiento multi-paso, aunque no se ha verificado específicamente en esta versión cuantizada.
- Multilingüismo: no se han publicado los idiomas soportados para esta conversión, pero el modelo base Qwen suele cubrir múltiples idiomas, incluyendo español, inglés, chino y otros.

## Casos de uso

- Asistente multimodal local en Mac: gracias al formato MLX y la cuantización 4-bit, el modelo puede ejecutarse en un MacBook con Apple Silicon (por ejemplo, M1 Pro o superior) para responder preguntas sobre imágenes o mantener conversaciones con contexto visual, sin conexión a internet.
- Análisis de documentos con imágenes: puede extraer información de capturas de pantalla, diagramas o fotografías en entornos de oficina, integrándose en flujos de trabajo de documentación técnica.
- Prototipado de aplicaciones de visión por computador: los desarrolladores pueden usar este modelo para validar rápidamente ideas de clasificación o descripción de imágenes antes de pasar a soluciones más pesadas.
- Generación de código asistida por capturas: dado que el modelo base maneja código, se puede usar para explicar o generar fragmentos de programación a partir de imágenes de código o diagramas de arquitectura.
- Educación y tutoría: como asistente de estudio, puede responder preguntas sobre material visual (gráficas, esquemas) y explicar conceptos en lenguaje natural, aprovechando su capacidad de razonamiento.
- Automatización de tareas de soporte: en un entorno de atención al cliente, el modelo puede procesar imágenes de productos o errores de pantalla y generar respuestas preliminares, aunque se recomienda supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La conversión MLX no incluye métricas específicas, y los datos del modelo base Qwen3.5-9B no se detallan en el repositorio de HuggingFace ni en los resultados de búsqueda web. Se recomienda consultar la documentación oficial de Qwen para obtener cifras de MMLU, HumanEval, GSM8K u otros, y tener en cuenta que la cuantización 4-bit puede introducir una degradación leve del rendimiento respecto al modelo original.

## Requisitos de hardware

- VRAM estimada: al ser MLX, utiliza la memoria unificada del chip Apple Silicon. El tamaño del repositorio es de 5.1 GB, por lo que se recomienda al menos 8 GB de RAM unificada para una ejecución cómoda; 16 GB o más para contextos largos o procesamiento de imágenes.
- GPU recomendada: no aplica GPU NVIDIA; está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). En Mac con chip M1 de 8 GB puede funcionar con limitaciones de velocidad.
- Si cabe en consumer GPU: no, al ser formato MLX específico de Apple. Para GPUs NVIDIA se necesitaría la versión original en formato GGUF o GPTQ.
- Opciones de despliegue: se usa principalmente con `mlx-lm` (para texto) o `mlx-vlm` (para multimodal). También puede cargarse con la librería `transformers` si se convierte el formato, pero no es el flujo recomendado. No es compatible directamente con vLLM, llama.cpp u Ollama en su forma actual; para Ollama existe una versión `qwen3.5:9b` que puede usarse en Mac.
- Latencia y throughput: no se han publicado mediciones específicas. En un MacBook Pro M2 Pro, se espera una generación de entre 10 y 20 tokens por segundo en 4-bit, dependiendo del contexto y la carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/Qwen3.5-9B-mlx-4Bit | 9B (declarado) | no disponible | 4-bit MLX | Apache 2.0 | MLX SafeTensors |
| Qwen/Qwen3.5-9B (original) | 9B | no disponible | FP16/BF16 | Apache 2.0 | Transformers |
| mlx-community/Qwen3.5-9B-OptiQ-4bit | 9B | no disponible | 4-bit MLX | Apache 2.0 | MLX SafeTensors |
| Qwen3-VL (modelo anterior) | 8B/30B | no disponible | FP16 | Apache 2.0 | Transformers |

La comparación directa con otras versiones MLX de Qwen3.5-9B (como la de mlx-community) muestra diferencias en el método de cuantización (OptiQ vs. el método estándar de mlx-lm), lo que puede afectar ligeramente a la calidad de salida. Frente al modelo original, esta versión ocupa mucho menos espacio y es más rápida en Apple Silicon, a costa de una posible pérdida de precisión. No se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código largo; se recomienda probar con casos reales antes de usarlo en producción.
- No se han publicado los idiomas soportados; aunque Qwen suele ser multilingüe, la versión cuantizada podría tener un comportamiento inferior en idiomas menos representados.
- El modelo es multimodal, pero la conversión MLX podría no soportar todas las funcionalidades de visión del original; se debe verificar con mlx-vlm.
- El número de parámetros indicado en safetensors (1.399.927.296) es inconsistente con la denominación "9B"; esto podría indicar un error en el repositorio o una estructura de archivos particular. Se recomienda contactar al autor o verificar el modelo original.
- No se han proporcionado benchmarks propios; cualquier afirmación sobre rendimiento debe basarse en datos del modelo base Qwen3.5-9B, no de esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos de la licencia del modelo base (también Apache 2.0) y atribuir adecuadamente.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es muy reciente y no ha sido ampliamente probado por la comunidad; úsese con cautela.

## Enlaces

- [HuggingFace - Oscilla/Qwen3.5-9B-mlx-4Bit](https://huggingface.co/Oscilla/Qwen3.5-9B-mlx-4Bit)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [ModelScope - Qwen3.5-9B-MLX-4bit](https://www.modelscope.cn/models/mlx-community/Qwen3.5-9B-MLX-4bit/summary)
- [Ollama - qwen3.5:9b](https://ollama.com/library/qwen3.5:9b)
- [Comparación con Qwen3.8-27B-8bit](https://www.aimodels.fyi/models/compare/qwen3.5-9b-mlx-4bit-mlx-community-vs-qwen3.8-27b-8bit-mlx-community)

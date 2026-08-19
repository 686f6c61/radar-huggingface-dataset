# FlatFootInternational/Qwen3.8-27B-mlx-6bit

## Resumen

FlatFootInternational/Qwen3.8-27B-mlx-6bit es una conversión al formato MLX (Machine Learning eXchange) del modelo multimodal Qwen/Qwen3.8-27B, cuantizada a 6 bits. El modelo original, desarrollado por Alibaba Cloud, es un modelo de visión y lenguaje denso basado en la arquitectura Qwen3.5, diseñado para tareas que combinan entrada de imágenes y texto, como respuesta a preguntas visuales, razonamiento multimodal y generación de texto asistida por contexto visual. Esta versión MLX permite ejecutar el modelo de forma eficiente en dispositivos Apple Silicon (chips M1, M2, M3 y superiores) mediante la librería mlx-vlm, facilitando su uso local sin necesidad de GPU dedicadas de alto rendimiento.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desarrolladores que desean desplegar un modelo de 27B parámetros en hardware de consumo, con una huella de memoria reducida gracias a la cuantización de 6 bits. El repositorio incluye los pesos en formato safetensors (22,8 GB) y está pensado para ser cargado directamente con mlx-vlm. Aunque el modelo original soporta un contexto de hasta 262.144 tokens (según la documentación del modelo base), esta conversión mantiene las mismas capacidades arquitectónicas, siendo adecuada para aplicaciones de agente, razonamiento largo y análisis de documentos visuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de visión (basado en Qwen3.5) |
| Parametros totales | 6.346.296.560 (según safetensors; el modelo base Qwen/Qwen3.8-27B declara 27B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (según el modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Este modelo es una conversión directa del checkpoint oficial Qwen/Qwen3.8-27B al formato MLX, realizada con la herramienta mlx-vlm versión 0.6.8. No se ha realizado ningún entrenamiento adicional; los pesos son los mismos que los del modelo original, pero almacenados en una representación cuantizada de 6 bits que reduce el tamaño en memoria a aproximadamente un 75% del peso original en FP16. El modelo base emplea una arquitectura transformer densa con un codificador de visión independiente, lo que le permite procesar imágenes y texto de forma conjunta. Según la información disponible, está construido sobre la arquitectura Qwen3.5, que introduce mejoras en el control del razonamiento (modo de pensamiento flexible) y en la ejecución de tareas agénticas. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en el modelo original.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas textuales coherentes con el contenido visual.
- Razonamiento visual: puede responder preguntas sobre imágenes, realizar descripciones detalladas y extraer información de documentos escaneados.
- Generación de texto: produce texto fluido en tareas de conversación, redacción y resumen, aunque la calidad depende del idioma (no se especifican idiomas soportados).
- Control de razonamiento: según la documentación del modelo base, ofrece un modo de pensamiento flexible que permite alternar entre respuestas rápidas y razonamiento paso a paso.
- Ejecución de agentes: el modelo base está optimizado para tareas agénticas de largo horizonte, con capacidad de planificación y respuesta a feedback del entorno.
- Integración con MLX: diseñado para ejecutarse en Apple Silicon mediante mlx-vlm, con soporte para aceleración por GPU integrada (Metal).

## Casos de uso

- Asistente de accesibilidad visual: el modelo puede describir imágenes en tiempo real para personas con discapacidad visual, usando un dispositivo Apple con cámara. Su cuantización de 6 bits permite ejecutarlo en un MacBook con 16 GB de RAM unificada.
- Análisis de documentos técnicos: dado su contexto de 262K tokens, puede procesar manuales extensos con diagramas y tablas, extrayendo información relevante para ingenieros o investigadores.
- Chatbot de atención al cliente con captura de pantalla: un usuario puede enviar una captura de error o una imagen de un producto, y el modelo responde con instrucciones o soluciones, aprovechando su capacidad de razonamiento visual.
- Generación de código a partir de diagramas: al recibir una imagen de un esquema o wireframe, el modelo puede generar código de interfaz o pseudocódigo, útil en fases de prototipado.
- Moderación de contenido visual: integrado en un pipeline de análisis de imágenes, puede detectar elementos inapropiados o clasificar imágenes según categorías, con la ventaja de ejecutarse localmente sin enviar datos a la nube.
- Investigación académica multimodal: para experimentos que requieran un modelo de visión-lenguaje con licencia permisiva (Apache 2.0) y ejecutable en hardware de consumo, este modelo ofrece una base reproducible para estudios de razonamiento visual o agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original Qwen3.8-27B ha sido evaluado en tareas como MathVision, pero no se incluyen métricas concretas en la documentación de esta conversión MLX. Para obtener datos de rendimiento, se recomienda consultar la ficha del modelo base en Hugging Face.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 22,8 GB, por lo que se necesitan al menos 24 GB de memoria unificada en Apple Silicon para cargar los pesos completos. En GPUs convencionales (si se convierte a otro formato), se requeriría una GPU con 24 GB de VRAM, como una RTX 3090 o RTX 4090.
- GPU recomendadas: en Apple Silicon, cualquier chip M1 Pro, M1 Max, M2 Pro, M2 Max, M3 Pro, M3 Max o superior con al menos 24 GB de RAM unificada. En GPUs NVIDIA, se podría ejecutar tras una conversión a otro formato, pero no es el objetivo de esta versión MLX.
- Compatibilidad con consumer GPU: sí, pero solo en equipos Apple con suficiente memoria unificada. No es adecuado para GPUs de 8-12 GB VRAM sin una cuantización adicional (por ejemplo, 4-bit).
- Opciones de despliegue: mlx-vlm (recomendado), también se puede cargar con la librería mlx directamente. No es compatible directamente con vLLM, llama.cpp o Ollama en su formato actual, aunque podría convertirse a GGUF si se desea.
- Latencia y throughput: no disponibles. Se espera que en un MacBook Pro con M3 Max (48 GB) la generación sea fluida, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (MLX 6-bit) | 27B (declarado) | 262K | Apache 2.0 | MLX | Conversión cuantizada, multimodal |
| Qwen2-VL-7B | 7B | 128K | Apache 2.0 | Varios | Modelo multimodal más pequeño, menor VRAM |
| Llama 3.2 Vision 11B | 11B | 128K | Llama 3.2 Community | Varios | Multimodal, pero licencia más restrictiva |
| InternVL2-26B | 26B | 4K (nativo) | MIT | Varios | Multimodal, contexto menor |

La comparativa se basa en datos públicos de los modelos mencionados. Qwen3.8-27B destaca por su contexto largo y su licencia Apache 2.0, pero su tamaño requiere hardware de gama alta. Qwen2-VL-7B es más ligero, mientras que Llama 3.2 Vision 11B ofrece un equilibrio entre tamaño y rendimiento, aunque con una licencia menos permisiva.

## Limitaciones y advertencias

- La cuantización de 6 bits puede introducir una ligera pérdida de precisión en comparación con el modelo en FP16, especialmente en tareas de razonamiento complejo o generación de código exacto.
- No se dispone de información sobre los idiomas soportados; es probable que el modelo base esté entrenado principalmente en inglés y chino, con capacidades limitadas en otros idiomas.
- Al ser una conversión MLX, no es directamente compatible con ecosistemas como vLLM o TGI, lo que limita su uso en servidores de producción estándar.
- El modelo original puede presentar sesgos en el reconocimiento de imágenes de ciertos grupos étnicos o culturales, así como alucinaciones en descripciones de objetos poco comunes.
- El tamaño del repositorio (22,8 GB) requiere una conexión de banda ancha y suficiente espacio en disco, además de memoria RAM unificada para su carga.
- La fecha de creación del repositorio (2026) sugiere que es un modelo reciente, pero no hay garantías de mantenimiento o soporte a largo plazo por parte del autor de la conversión.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/FlatFootInternational/Qwen3.8-27B-mlx-6bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Guía de ejecución en AMD (referencia del modelo base): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Tutorial de ejecución local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b

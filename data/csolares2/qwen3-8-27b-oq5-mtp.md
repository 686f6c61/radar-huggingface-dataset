# csolares2/Qwen3.8-27B-oQ5-mtp

## Resumen

El modelo `csolares2/Qwen3.8-27B-oQ5-mtp` es una cuantización de precisión mixta de 5 bits del modelo Qwen3.8-27B, realizada con la librería oMLX (oQ) y publicada en formato MLX safetensors. El autor, csolares2, ha subido esta versión cuantizada para facilitar la ejecución local en hardware Apple Silicon y otras plataformas compatibles con MLX, reduciendo el tamaño del modelo a 20,3 GB. La cuantización utiliza un group size de 64 y está diseñada para preservar la calidad del modelo original mientras se reduce el consumo de memoria.

El modelo base Qwen3.8-27B, desarrollado por Alibaba, es un modelo denso de 27 mil millones de parámetros con capacidades de visión y razonamiento configurable, una ventana de contexto nativa de 262K tokens y licencia Apache 2.0. Está orientado a tareas de programación, trabajo profesional, investigación y agentes de largo horizonte. Esta cuantización específica se publicó el 14 de agosto de 2026 y sustituye a una versión anterior, por lo que se recomienda descargar los pesos actualizados.

Aunque el repositorio de HuggingFace reporta 5.756.598.512 parámetros en los safetensors, esta cifra parece corresponder a los parámetros cuantizados o a un error de metadatos, ya que las fuentes externas confirman que el modelo base tiene 27B parámetros. La discrepancia debe tenerse en cuenta al evaluar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso con vision encoder y razonamiento configurable) |
| Parametros totales | 5.756.598.512 (según safetensors del repo; el modelo base declara 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (según documentación del modelo base) |
| Tipos de cuantizacion | oQ5 (5 bits, group size 64) |
| Idiomas soportados | no disponible en el repo; el modelo base soporta múltiples idiomas (según documentación de Qwen) |
| Licencia | no disponible en el repo; el modelo base usa Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con un codificador de visión integrado, lo que le permite procesar tanto texto como imágenes. Incluye un modo de razonamiento configurable que permite alternar entre respuestas rápidas y un modo de pensamiento profundo. El entrenamiento se realizó con un enfoque de aprendizaje por refuerzo y ajuste fino supervisado, aunque no se han publicado detalles específicos sobre el dataset o el número de tokens de entrenamiento en la información disponible. La cuantización oQ5 aplica una precisión mixta de 5 bits con group size 64, lo que reduce el tamaño del modelo a aproximadamente 20,3 GB, manteniendo un equilibrio entre fidelidad y eficiencia. Esta técnica, implementada en la librería oMLX, está optimizada para el ecosistema MLX de Apple.

## Capacidades

- Generación de texto y razonamiento multilingüe, con soporte para tareas de chat y conversación multi-turno.
- Razonamiento configurable: puede operar en modo estándar para respuestas rápidas o en modo de pensamiento profundo para problemas complejos.
- Comprensión de imágenes: el modelo base incluye un vision encoder, por lo que puede procesar entradas visuales junto con texto.
- Generación de código y asistencia en programación, incluyendo depuración y refactorización.
- Soporte para tareas de agente y razonamiento multi-paso, adecuado para flujos de trabajo autónomos.
- Capacidades de tool calling y function calling, según la documentación del modelo base.
- Ventana de contexto extendida de 262K tokens, que permite manejar documentos largos y conversaciones extensas.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo (VS Code, JetBrains) para autocompletar código, explicar fragmentos y sugerir refactorizaciones, gracias a su capacidad de generación de código y su razonamiento configurable.
- Análisis de documentos extensos: con 262K tokens de contexto, puede resumir, extraer información y responder preguntas sobre libros, informes o contratos de gran tamaño sin necesidad de dividir el texto.
- Agente autónomo para automatización de tareas: su soporte para tool calling y razonamiento multi-paso permite construir agentes que interactúan con APIs, navegadores o bases de datos para completar flujos de trabajo complejos.
- Asistente de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial completo de la interacción y ofreciendo respuestas coherentes en varios idiomas.
- Análisis de imágenes y texto combinados: gracias al vision encoder, puede procesar capturas de pantalla, diagramas o fotografías junto con preguntas en texto, útil para soporte técnico o revisión de documentos visuales.
- Prototipado rápido de aplicaciones de IA: al ser una cuantización MLX ligera (20,3 GB), se puede desplegar en estaciones de trabajo con Apple Silicon o GPUs con suficiente VRAM para experimentar sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes web mencionan que el modelo base Qwen3.8-27B tiene benchmarks publicados, pero no se han proporcionado los valores concretos en los resultados de búsqueda. Se recomienda consultar la documentación oficial de Qwen para obtener métricas comparativas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 20,3 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo completo en memoria. Con cuantizaciones adicionales o técnicas de offloading podría reducirse, pero no se especifica.
- GPU recomendadas: GPU Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3/M4) con al menos 32 GB de memoria unificada para un rendimiento óptimo. También puede ejecutarse en GPUs NVIDIA con 24 GB o más (RTX 3090, RTX 4090, A5000) si se usa MLX mediante adaptadores, aunque MLX está optimizado para Apple.
- En consumer GPU: cabe en tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090) y en Macs con 32 GB de RAM unificada.
- Opciones de despliegue: al ser formato MLX safetensors, se puede cargar con la librería MLX de Apple, o mediante herramientas como LM Studio (que soporta MLX en macOS) o vLLM/SGLang si se convierte a otros formatos (no se proporciona conversión directa).
- Latencia y throughput: no disponibles en la información recopilada.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos para esta cuantización específica. El modelo base Qwen3.8-27B compite con otros modelos densos de 27B como Llama 3.1 8B (menor tamaño), Qwen2.5-27B (generación anterior) o Mistral Large 2 (123B). Sin embargo, no se han proporcionado resultados de benchmarks ni especificaciones detalladas de estos modelos en la información disponible, por lo que no es posible realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La cuantización oQ5 de 5 bits puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo original de 16 bits, especialmente en tareas de razonamiento complejo o matemáticas.
- El repositorio no especifica la licencia, aunque el modelo base usa Apache 2.0. Es necesario verificar los términos de uso antes de un despliegue comercial.
- El número de parámetros reportado en los safetensors (5,7B) no coincide con los 27B del modelo base, lo que sugiere un posible error en los metadatos o una cuantización atípica. Se recomienda validar el modelo antes de usarlo en producción.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, especialmente en contextos de baja frecuencia o información poco representada en el entrenamiento.
- La ventana de contexto de 262K tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el consumo de memoria aumenta significativamente.
- Al ser una cuantización MLX, no es compatible directamente con ecosistemas basados en CUDA (como vLLM o llama.cpp) sin conversión previa a otro formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/csolares2/Qwen3.8-27B-oQ5-mtp
- Versión oQ8 del mismo autor: https://huggingface.co/csolares2/Qwen3.8-27B-oQ8-mtp
- Blog de AMD sobre ejecución de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Especificaciones y requisitos de hardware (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8

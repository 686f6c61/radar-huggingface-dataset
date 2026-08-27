# Oscilla/gemma-3-4b-it-mlx-4Bit

## Resumen

Oscilla/gemma-3-4b-it-mlx-4Bit es una conversión al formato MLX del modelo multimodal Gemma 3 4B IT desarrollado por Google, cuantizado a 4 bits para reducir su huella de memoria. Esta versión está pensada para ejecutarse de forma eficiente en hardware Apple Silicon (chips M-series) mediante la librería mlx-lm, lo que permite desplegar un modelo de razonamiento y visión por computador en equipos de consumo sin necesidad de GPUs dedicadas.

El modelo original, google/gemma-3-4b-it, es un transformer denso multimodal que procesa texto e imágenes, con una ventana de contexto de 128 000 tokens y una salida máxima de 8192 tokens. La conversión a MLX 4-bit mantiene las capacidades del modelo base a la vez que reduce el tamaño del repositorio a 2,2 GB, facilitando su uso en entornos con memoria limitada. Su relevancia radica en que democratiza el acceso a un modelo de última generación con capacidades multimodales en hardware de bajo coste, especialmente en el ecosistema macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen) |
| Parametros totales | 606 601 728 (según safetensors del archivo cuantizado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (modelo base) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible (el modelo base es multilingüe) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base google/gemma-3-4b-it es un transformer denso con arquitectura multimodal que combina un codificador de visión con un decodificador de lenguaje. No se dispone de detalles específicos sobre el entrenamiento en la información proporcionada, pero se sabe que Gemma 3 fue desarrollado por Google con un enfoque de ajuste instructivo (instruction tuning) y alineación mediante RLHF, siguiendo la línea de los modelos Gemma anteriores. La conversión a MLX realizada por Oscilla no modifica la arquitectura, solo adapta los pesos al formato optimizado para Apple Silicon y aplica cuantización de 4 bits, lo que reduce el tamaño del modelo sin cambios en su comportamiento funcional.

## Capacidades

- Generación de texto y razonamiento: el modelo puede mantener conversaciones coherentes, responder preguntas y realizar tareas de razonamiento lógico y matemático.
- Comprensión de imágenes: al ser multimodal, acepta imágenes como entrada y puede describirlas, responder preguntas sobre su contenido o extraer información visual.
- Soporte de tool calling / function calling: el modelo base Gemma 3 IT incluye capacidades de llamada a funciones, lo que permite integrarlo en agentes que interactúan con APIs o herramientas externas.
- Capacidades multilingües: aunque no se especifican los idiomas en la ficha, el modelo base de Google soporta múltiples lenguas, incluyendo español, inglés, francés, alemán, entre otras.
- Razonamiento multi-step: puede descomponer problemas complejos en pasos intermedios, útil para tareas de planificación y análisis.
- Generación de código: el modelo base tiene competencias en lenguajes de programación, aunque no se detallan benchmarks específicos.

## Casos de uso

- Asistente personal en macOS: al ser un modelo MLX ligero, puede integrarse en aplicaciones de escritorio para Mac que ofrezcan asistencia conversacional, resumen de documentos o generación de respuestas en tiempo real sin depender de la nube.
- Análisis de imágenes en entornos locales: un desarrollador puede usar el modelo para extraer texto de capturas de pantalla, describir fotografías o clasificar imágenes en aplicaciones de productividad, aprovechando su capacidad multimodal.
- Generación de código asistida: el modelo puede sugerir fragmentos de código, explicar funciones o depurar errores cuando se integra en editores de texto o IDEs mediante plugins que usen mlx-lm.
- Automatización de atención al cliente: con su soporte de tool calling, el modelo puede gestionar conversaciones multi-turno y consultar bases de datos o APIs para resolver incidencias, desplegado en un servidor ligero con Apple Silicon.
- Prototipado rápido de agentes conversacionales: investigadores pueden experimentar con agentes que combinan visión y lenguaje, como un asistente que lea formularios escaneados y extraiga datos estructurados, sin necesidad de GPUs costosas.
- Educación y tutoría: el modelo puede actuar como tutor interactivo que explica conceptos, resuelve ejercicios matemáticos y analiza diagramas o figuras enviadas por el estudiante, todo en un portátil Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento comparativas, y la búsqueda web no ha proporcionado datos adicionales sobre evaluaciones de este modelo específico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4 bits con un tamaño de 2,2 GB, requiere aproximadamente 2,5-3 GB de memoria unificada en Apple Silicon, incluyendo overhead del runtime.
- GPU recomendadas: cualquier chip Apple M1, M2, M3 o M4 con al menos 8 GB de memoria unificada. Modelos con 16 GB o más permiten ejecutar el modelo junto con otras aplicaciones.
- Compatibilidad con consumer GPU: no aplica, ya que MLX está diseñado exclusivamente para Apple Silicon. No es compatible con GPUs NVIDIA o AMD.
- Opciones de despliegue: se puede usar directamente con mlx-lm (pip install mlx-lm) o mediante Ollama, que soporta modelos MLX en macOS. También es posible integrarlo en aplicaciones propias usando la API de mlx-lm.
- Latencia y throughput: no se dispone de datos medidos. En un M3 Pro, se espera una generación de entre 20 y 40 tokens por segundo para modelos de 4B en 4 bits, pero estos valores son estimaciones basadas en modelos similares y no han sido verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Oscilla/gemma-3-4b-it-mlx-4Bit | 606 M (cuantizado) | 128k | 4-bit | MLX | Gemma |
| google/gemma-3-4b-it | ~4 B | 128k | Original (BF16) | Safetensors | Gemma |
| mlx-community/gemma-3-4b-it-4bit | ~4 B | 128k | 4-bit | MLX | Gemma |
| mlx-community/gemma-3-4b-it-qat-4bit | ~4 B | 128k | 4-bit (QAT) | MLX | Gemma |

La principal diferencia entre estas versiones es el método de cuantización y el autor de la conversión. Oscilla y mlx-community ofrecen alternativas equivalentes; la versión QAT (quantization-aware training) de mlx-community puede tener una calidad ligeramente superior al haber sido entrenada con cuantización en mente, aunque no se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: como modelo entrenado por Google, puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en temas sensibles como género, raza o religión.
- Riesgo de alucinación: al ser un modelo de 4B, su capacidad de razonamiento es limitada en comparación con modelos más grandes, por lo que puede generar información falsa o inventada en contextos complejos.
- Limitaciones de contexto: aunque soporta 128k tokens, el rendimiento puede degradarse en contextos muy largos, y la salida máxima de 8192 tokens puede ser insuficiente para tareas de generación extensa.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para ciertos casos de uso comercial y la obligación de incluir atribución. Es necesario revisar los términos completos antes de desplegar en producción.
- Dependencia de Apple Silicon: al ser un formato MLX, no es portable a otros sistemas operativos o arquitecturas, lo que limita su uso en entornos de servidor tradicionales.
- Falta de benchmarks: al no haber resultados publicados, no se puede verificar su rendimiento real en tareas estándar, lo que introduce incertidumbre para evaluaciones comparativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/gemma-3-4b-it-mlx-4Bit
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Conversión alternativa de mlx-community: https://huggingface.co/mlx-community/gemma-3-4b-it-4bit
- Versión QAT de mlx-community: https://huggingface.co/mlx-community/gemma-3-4b-it-qat-4bit
- Página de Gemma 3 4B en LM Studio: https://lmstudio.ai/models/google/gemma-3-4b
- Blog sobre fine-tuning de Gemma 3 con MLX: https://blog.radi.pro/posts/fine-tuning-gemma-3-model-with-mlx

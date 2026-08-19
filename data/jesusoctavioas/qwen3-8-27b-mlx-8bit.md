# jesusoctavioas/Qwen3.8-27B-mlx-8Bit

## Resumen

El modelo `jesusoctavioas/Qwen3.8-27B-mlx-8Bit` es una conversión al formato MLX (Apple Silicon) del modelo Qwen3.8-27B, desarrollado por Alibaba. Se trata de un modelo de visión-lenguaje (VLM) denso, diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. La conversión ha sido realizada por el usuario jesusoctavioas utilizando la librería `mlx-lm` en su versión 0.31.2, y publicada bajo licencia Apache 2.0.

Aunque el nombre del repositorio indica 27B parámetros, los datos reales de los safetensors muestran 7.566.401.024 parámetros (aproximadamente 7,5 mil millones). Esta discrepancia puede deberse a un error en el etiquetado del autor o a que se ha subido una versión reducida del modelo. El tamaño del repositorio es de 28,6 GB, lo que sugiere que podría contener pesos adicionales o que la cuantización de 8 bits no se ha aplicado correctamente. En cualquier caso, la ficha se basa en los datos disponibles, indicando las incertidumbres.

El modelo base Qwen3.8-27B es relevante por su ventana de contexto nativa de 262.000 tokens, su capacidad de procesar imágenes y vídeo, y su licencia permisiva. Esta conversión MLX permite ejecutarlo en hardware Apple con aceleración unificada, facilitando su uso local en Macs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (no especificado en detalle) |
| Parametros totales | 7.566.401.024 (segun safetensors; el nombre indica 27B, discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (segun documentacion del modelo base) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con un encoder de vision integrado, lo que le permite procesar entradas de imagen y vídeo ademas de texto. Segun la documentacion publica, esta entrenado para tareas de razonamiento, codificacion y agentes, con una ventana de contexto de 262K tokens. No se dispone de detalles especificos sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO. La conversion a MLX no altera la arquitectura, solo el formato de pesos para optimizar la inferencia en hardware Apple.

## Capacidades

- Generacion de texto y razonamiento multimodal (imagen, video y texto).
- Codificacion de software, incluyendo generacion, depuracion y refactorizacion de codigo.
- Razonamiento multi-paso y planificacion para tareas agenciales de largo horizonte.
- Soporte de tool calling y manejo de feedback de entorno (segun la documentacion del modelo base).
- Capacidades multilingues (no especificadas en la informacion disponible).
- Configuracion de modo de razonamiento (thinking mode) segun la documentacion de LM Studio.

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en entornos de desarrollo (VS Code, JetBrains) para autocompletar codigo, explicar fragmentos y generar tests, sin enviar datos a la nube gracias a la ejecucion local en MLX.
- Analisis de imagenes y documentos: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o documentos escaneados, util para automatizar tareas de extraccion de datos.
- Agente de automatizacion de tareas: con su soporte de tool calling y contexto largo, puede gestionar flujos de trabajo complejos como la gestion de correos, calendarios o interacciones con APIs.
- Chatbot de atencion al cliente: su ventana de 262K tokens permite mantener conversaciones largas con historial completo, mejorando la coherencia en interacciones multi-turno.
- Investigacion y analisis de documentos extensos: puede resumir y responder preguntas sobre libros, informes o articulos cientificos de gran longitud.
- Prototipado rapido de aplicaciones de vision por computador: al procesar imagenes, puede describir contenido visual o generar anotaciones para datasets.

## Benchmarks y rendimiento

Segun la informacion publica del modelo base Qwen3.8-27B, se han publicado los siguientes resultados (no se proporcionan comparaciones con otros modelos en la informacion disponible):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos provienen de la documentacion del modelo base y no de esta conversion especifica. No se dispone de resultados de MMLU, HumanEval u otros benchmarks estandar en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: para los 7,5B parametros reales en 8-bit, se necesitan aproximadamente 7,5 GB de memoria. Sin embargo, el tamano del repositorio (28,6 GB) sugiere que podria tratarse de un modelo de 27B en 8-bit (unos 27 GB), lo que requeriria al menos 32 GB de RAM unificada en Apple Silicon.
- GPU recomendadas: Macs con chip M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o M4 con al menos 32 GB de memoria unificada para la version completa. Para la version de 7,5B, 16 GB serian suficientes.
- Compatibilidad con consumer GPU: no aplica directamente, ya que MLX esta optimizado para Apple Silicon. Para GPUs NVIDIA se necesitaria una conversion a otro formato (GGUF, etc.).
- Opciones de despliegue: mlx-lm (biblioteca de Python), integrable en aplicaciones propias. No se menciona soporte para vLLM, Ollama o TGI en esta conversion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que la informacion disponible es limitada, se comparan las caracteristicas principales con otros modelos de vision-lenguaje de tamano similar (7B-8B) y con el modelo base original:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Original |
| jesusoctavioas/Qwen3.8-27B-mlx-8Bit | 7,5B (segun safetensors) | 262K (heredado) | Apache 2.0 | MLX 8-bit |
| Qwen2.5-VL-7B | 7B | 128K | Apache 2.0 | Original |
| Llama 3.2 Vision 11B | 11B | 128K | Llama 3.2 | Original |

La comparativa es orientativa; no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: el nombre indica 27B pero los safetensors muestran 7,5B. Esto puede deberse a un error del autor o a una conversion incompleta. Se recomienda verificar el contenido del repositorio antes de usarlo en produccion.
- Sesgos y alucinaciones: no se dispone de informacion especifica sobre sesgos del modelo base, pero como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base de Qwen suele tener buen rendimiento en ingles y chino, pero no se garantiza para otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y no se ofrece garantia.
- Compatibilidad: al ser un formato MLX, solo funciona en hardware Apple. Para otros entornos se necesita convertir los pesos a otro formato.
- Riesgo en produccion: la falta de benchmarks verificados y la discrepancia en parametros hacen recomendable realizar pruebas exhaustivas antes de desplegar en entornos criticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jesusoctavioas/Qwen3.8-27B-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion de Qwen3.8-27B (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Pagina en LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio GitHub de instalacion local: https://github.com/qwen3-8-27b/qwen3-8-27b
- Guia en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Guia completa (Lovable): https://lovableapp.org/blog/qwen3-8-27b

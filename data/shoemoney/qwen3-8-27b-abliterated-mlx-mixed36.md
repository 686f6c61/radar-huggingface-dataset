# shoemoney/Qwen3.8-27B-Abliterated-MLX-mixed36

## Resumen

El modelo `shoemoney/Qwen3.8-27B-Abliterated-MLX-mixed36` es una cuantización MLX mixta de 3 y 6 bits del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión "abliterated" (sin censura) del modelo Qwen3.8-27B de Alibaba. El autor, shoemoney, ha convertido los pesos BF16 originales a un formato MLX optimizado para Apple Silicon, sin realizar fine-tuning, merging ni re-alineación. El resultado es un modelo de 14,76 GB en disco, diseñado para ejecutarse en hardware Apple con memoria unificada.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda las capacidades multimodales y de razonamiento del Qwen3.8-27B, un modelo denso de última generación que destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina; por otro, la eliminación de la censura (abliteration) lo hace atractivo para casos de uso donde se requiere una generación de texto sin restricciones temáticas, aunque con los riesgos asociados. La cuantización mixta 3/6 permite ejecutarlo en equipos con memoria limitada, manteniendo una perplejidad razonable (6,807) y un throughput de 22,1 tokens/s en peticiones individuales y 65,7 tokens/s con 8 peticiones concurrentes, medido en un Apple M3 Ultra de 96 GB.

El modelo se distribuye bajo licencia Apache 2.0 y se carga mediante la librería `mlx-vlm`, no `mlx-lm`, debido a que la arquitectura está registrada en esa librería. Aunque el nombre sugiere 27B parámetros, el archivo safetensors reporta 4.334.750.960 parámetros, una discrepancia que se detalla en las especificaciones técnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (según documentación de Qwen3.8-27B) |
| Parametros totales | 4.334.750.960 (según safetensors; el modelo base se anuncia como 27B, verificar) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX mixta 3/6 bits, grupo de 64 (comando: `--q-bits 3 --q-group-size 64 --quant-predicate mixed_3_6`) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal desarrollado por Alibaba, que combina procesamiento de texto e imágenes. No se dispone de detalles específicos sobre su arquitectura interna (número de capas, dimensiones, tipo de atención) en la información proporcionada. La versión abliterated de huihui-ai elimina los mecanismos de rechazo de contenido no deseado, sin modificar los pesos del modelo original. La cuantización MLX mixta 3/6 aplica 3 bits a ciertas capas y 6 bits a otras, con un grupo de cuantización de 64, lo que reduce el tamaño del modelo de aproximadamente 54 GB (BF16) a 14,76 GB. No se ha realizado ningún entrenamiento adicional, por lo que las capacidades del modelo son las heredadas del base, con la degradación propia de la cuantización.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades de Qwen3.8-27B para tareas de lenguaje natural, incluyendo razonamiento paso a paso.
- Codificación: el modelo base destaca en tareas de programación, generación y depuración de código.
- Visión: al ser multimodal, puede procesar imágenes y responder preguntas sobre ellas (no se especifican los formatos exactos).
- Flujos de trabajo agénticos: soporta tareas multi-paso y uso de herramientas, según la documentación del modelo base.
- Automatización de oficina: capaz de generar documentos, resumir textos y asistir en tareas administrativas.
- Sin censura: la versión abliterated elimina los filtros de contenido, permitiendo generar respuestas sobre temas que el modelo original rechazaría.
- Multilingüe: no se especifican los idiomas, pero Qwen suele soportar múltiples lenguas.

## Casos de uso

- Desarrollo de código en local: un desarrollador puede ejecutar el modelo en su Mac para generar fragmentos de código, explicar algoritmos o depurar errores sin depender de servicios en la nube, gracias a la cuantización que permite su ejecución en equipos con 32 GB de RAM unificada.
- Asistente de oficina personal: integrado en aplicaciones de productividad, puede redactar correos, resumir reuniones o generar informes a partir de notas, aprovechando su capacidad de procesamiento de texto e imágenes.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o gráficos, útil para tareas de análisis de datos visuales.
- Agente autónomo para automatización de tareas: combinado con herramientas de tool calling, puede ejecutar flujos de trabajo multi-paso, como la gestión de calendarios o la búsqueda de información en bases de datos.
- Generación de contenido creativo sin restricciones: escritores o creadores pueden utilizarlo para explorar temas sensibles o controvertidos sin los filtros habituales, aunque con la responsabilidad ética correspondiente.
- Prototipado rápido de aplicaciones de IA: investigadores pueden desplegar el modelo en un Mac para probar ideas de agentes o sistemas de razonamiento antes de escalar a hardware más potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 6,807 |
| Perplejidad relativa al mejor modelo de la familia | 1,09× |
| Throughput (1 petición) | 22,1 tok/s |
| Throughput (8 peticiones concurrentes) | 65,7 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada. La perplejidad solo es comparable dentro de la misma familia de modelos, ya que los tokenizadores difieren entre familias.

## Requisitos de hardware

- Tamaño en disco: 14,76 GB.
- Memoria unificada estimada: al menos 16-20 GB para cargar los pesos y ejecutar la inferencia; se recomienda 32 GB o más para un uso fluido.
- GPU: diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Probado en M3 Ultra con 96 GB.
- No cabe en GPUs de NVIDIA directamente; requiere el ecosistema MLX.
- Opciones de despliegue: `mlx-vlm` (librería de Python), con comandos como `mlx_vlm.generate`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia: 22,1 tok/s en petición individual, 65,7 tok/s con 8 concurrentes (en M3 Ultra).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (mismo tamaño o misma tarea). El modelo base Qwen3.8-27B podría compararse con otros LLMs multimodales de tamaño similar, pero no se han proporcionado datos de benchmarks ni especificaciones de otros modelos en la información disponible.

## Limitaciones y advertencias

- Al ser una versión "uncensored", el modelo puede generar contenido ofensivo, peligroso o ilegal. Su uso en producción requiere medidas de moderación adicionales.
- La cuantización mixta 3/6 puede degradar la calidad de las respuestas en comparación con el modelo BF16 original, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- La discrepancia entre el nombre del modelo (27B) y el número de parámetros reportado en safetensors (4,33B) sugiere que el archivo podría estar incompleto o que el modelo base es en realidad más pequeño; se recomienda verificar con el modelo original antes de usarlo en entornos críticos.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento real en tareas como matemáticas, código o razonamiento no está validado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas.
- El soporte de idiomas no está especificado; es probable que el modelo base tenga un buen rendimiento en inglés y chino, pero no se garantiza para otros idiomas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/shoemoney/Qwen3.8-27B-Abliterated-MLX-mixed36)
- [Modelo base abliterated (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Repositorio oficial de Qwen3.8-27B (GitHub)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Qwen3.8-27B en HuggingFace](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Página de QwenCloud para Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [Artículo sobre OrcaRouter y abliteration en MLX](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)

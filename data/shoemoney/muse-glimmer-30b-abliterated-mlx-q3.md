# shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q3

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-q3 es una cuantización a 3 bits del modelo Muse Glimmer 30B de Meta, realizada por el usuario shoemoney con la librería MLX para Apple Silicon. El modelo base, Muse Glimmer 30B, es un modelo multimodal de razonamiento que acepta texto e imágenes, con tool-calling nativo y una salida de razonamiento separada, diseñado para agentes locales siempre activos. La versión "abliterated" elimina las restricciones de seguridad del modelo original, y esta variante MLX la convierte en un formato optimizado para hardware de Apple.

Esta ficha se centra en la versión cuantizada, que ocupa unos 16 GB en disco y ofrece un rendimiento medido de 37,6 tokens por segundo con una petición concurrente y 83,6 con ocho concurrentes en un Apple M3 Ultra. La cuantización 3-bit reduce significativamente el tamaño respecto al BF16 original, a costa de una perplejidad ligeramente mayor (8,776 en la mezcla de evaluación utilizada). Es relevante para desarrolladores que buscan ejecutar un modelo multimodal de 30B en equipos Apple con memoria unificada, manteniendo capacidades de agente y tool-calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagenes) |
| Parametros totales | 30B (modelo base); 5.344.355.328 en safetensors cuantizado |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3-bit MLX, grupo de 64 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Muse Glimmer 30B, desarrollado por Meta, es un modelo multimodal que procesa texto e imágenes y está afinado para tool-calling, tareas largas y recuperación ante fallos. La arquitectura exacta no se detalla en la información disponible, pero se describe como un modelo de razonamiento con salida de razonamiento separada. La versión abliterada, creada por Blackfrost-AI, elimina las capas de rechazo de contenido, resultando en un modelo "uncensored". Posteriormente, shoemoney aplicó una cuantización a 3 bits con `mlx_vlm.convert`, usando un grupo de tamaño 64, sin fine-tuning adicional ni re-alineamiento. No se dispone de datos sobre el dataset de entrenamiento original ni sobre el proceso de alineación del modelo base.

## Capacidades

- Razonamiento multimodal: acepta entradas de texto e imágenes, generando respuestas que pueden incluir un paso de razonamiento separado.
- Tool-calling nativo: integrado para invocar funciones externas, lo que lo hace adecuado para agentes.
- Ejecución local en Apple Silicon: optimizado con MLX, pensado para dispositivos con memoria unificada.
- Sin restricciones de contenido: al ser abliterado, no aplica filtros de seguridad estándar, lo que permite generar contenido que otros modelos rechazarían.
- Cuantización 3-bit: reduce el tamaño del modelo a ~16 GB, permitiendo su carga en equipos con menos memoria que el BF16 original.

## Casos de uso

- Asistentes personales locales: al ejecutarse en Apple Silicon, puede servir como asistente siempre activo que procesa texto e imágenes, con tool-calling para interactuar con calendarios, correos o APIs.
- Automatización de tareas con agentes: su capacidad de tool-calling y razonamiento multi-paso permite construir agentes que ejecutan acciones en entornos controlados, como gestión de archivos o consultas a bases de datos.
- Análisis de imágenes en el dispositivo: al ser multimodal, puede describir o responder preguntas sobre imágenes sin enviar datos a la nube, útil para aplicaciones de privacidad.
- Generación de contenido sin restricciones: al ser abliterado, puede usarse para escritura creativa o exploración de temas que otros modelos censuran, aunque con responsabilidad legal y ética.
- Prototipado rápido en macOS: gracias a su formato MLX y a la integración con `mlx-vlm`, los desarrolladores pueden probar flujos de agente multimodal en su Mac sin necesidad de GPUs dedicadas.
- Evaluación de cuantización: sirve como referencia para medir el impacto de la cuantización 3-bit en perplejidad y throughput dentro de la familia Muse Glimmer.

## Benchmarks y rendimiento

La model card proporciona mediciones propias, no benchmarks estándar como MMLU o HumanEval. Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras) | 8,776 |
| Throughput (1 peticion concurrente) | 37,6 tok/s |
| Throughput (8 peticiones concurrentes) | 83,6 tok/s |
| Tamano en disco | 15,95 GB |

La perplejidad se midió con 192 muestras de 512 tokens, seed 123, y solo es comparable dentro de la misma familia de modelos. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Medido en Apple M3 Ultra con 96 GB de memoria unificada y macOS 27.
- Al ser un modelo MLX, está pensado para Apple Silicon (M1, M2, M3, M4 y superiores) con memoria unificada suficiente.
- El tamaño en disco es de ~16 GB, por lo que se necesita al menos 16 GB de memoria libre para cargarlo, aunque se recomienda más para contexto y overhead.
- No se indica compatibilidad con GPUs NVIDIA o AMD; el formato MLX es específico de Apple.
- Despliegue mediante `mlx-vlm` (no `mlx-lm`), con el comando `mlx_vlm.generate`.
- No se proporcionan datos de latencia ni throughput en otros hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base Muse Glimmer 30B existe en versiones BF16 y cuantizadas, pero no se han encontrado especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 3-bit puede degradar la calidad de las respuestas en comparación con el BF16 original, como refleja la perplejidad relativa de 1,21× respecto al mejor escalón de la familia.
- Al ser un modelo abliterado, no tiene filtros de seguridad; puede generar contenido ofensivo, ilegal o peligroso. El uso en producción debe considerar políticas de moderación y responsabilidad legal.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo sin alineación de seguridad, es probable que reproduzca sesgos presentes en los datos de entrenamiento.
- La longitud de contexto no está documentada, lo que limita su uso en tareas que requieran ventanas largas.
- El formato MLX limita su ejecución a hardware Apple; no es directamente utilizable en entornos con GPUs NVIDIA o AMD sin conversión adicional.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" puede generar problemas de cumplimiento en aplicaciones empresariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q3
- Modelo base (BF16): https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Documentación de descarga de Muse Glimmer: https://ai.developer.meta.com/docs/muse-glimmer/get-the-model
- Otra versión abliterada (no MLX): https://huggingface.co/dudeman2512/Muse-Glimmer-30B-abliterated

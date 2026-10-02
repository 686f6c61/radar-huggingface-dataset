# ap3212/Qwen3.8-27B-ABLITERATED-3bit-MLX-TextOnly

## Resumen

Este repositorio contiene una cuantización de 3 bits en formato MLX del modelo Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16, un derivado "abliterated" del Qwen3.8-27B de Alibaba. La cuantización la firma EgorKodin en la model card, aunque el repositorio está publicado bajo la cuenta ap3212. El resultado es un modelo denso de 26.895.993.856 parámetros (aproximadamente 26,9 B) cuyo peso ocupa 11,8 GB en el repositorio, lo que lo sitúa en el rango de modelos que pueden ejecutarse en equipos Apple Silicon con memoria unificada moderada.

La particularidad de esta release es doble. Por un lado, se ha eliminado la torre de visión del modelo original, por lo que la modalidad queda reducida a texto (TextOnly) y el consumo de memoria baja respecto al multimodal completo. Por otro lado, el modelo base ha sufrido un proceso de abliteración, una técnica de modificación de pesos que elimina las direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo responde sin los filtros de seguridad habituales del modelo original.

Es relevante ahora porque permite ejecutar localmente, en un Mac, un modelo de ~27 B con cuantización agresiva de 3 bits y sin capas de alineación de seguridad, algo útil para investigación en comportamiento de rechazo, red-teaming y evaluación de robustez. No obstante, no se han publicado especificaciones de contexto, idiomas, licencia ni resultados de benchmarks en la información disponible, y el repositorio no registra descargas ni valoraciones, por lo que debe tratarse como un artefacto no verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.8 (etiqueta qwen3_5 en el repositorio; multimodal nativo en el modelo original, torre de visión eliminada en esta release) |
| Parametros totales | 26.895.993.856 (aprox. 26,9 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit affine, group size 64 (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (repo de 11,8 GB) |
| Modelo base | Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 |
| Modalidad | Solo texto (vision tower removed) |
| Runtime | mlx-lm |
| Autor del repositorio | ap3212 (quantized_by indicado en la model card: EgorKodin) |
| Fecha de publicacion | 2026-10-01 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, descrito en el repositorio oficial de Alibaba como un LLM denso, nativo multimodal y de pesos abiertos, orientado a código, flujos agénticos y automatización de ofimática. Al ser denso, activa la totalidad de sus ~26,9 B de parámetros en cada token, a diferencia de una arquitectura Mixture of Experts. Sobre ese modelo se ha aplicado una abliteración: una intervención sobre los pesos que busca eliminar la dirección latente que gobierna el rechazo, de modo que el modelo deja de declinar peticiones que el modelo alineado rechazaría.

Esta release concreta no entrena nada nuevo: es una conversión y cuantización. Los pesos del modelo de lenguaje se han convertido a MLX y se han cuantizado a 3 bits con cuantización affine y group size 64, y se ha eliminado por completo la torre de visión del modelo multimodal original. El resultado es un artefacto exclusivamente de texto y con menor huella de memoria. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otra técnica de alineación; tampoco se documenta el procedimiento exacto de abliteración empleado.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de chat que admite el parámetro `enable_thinking` para activar o desactivar el modo de razonamiento cuando la plantilla del modelo lo soporta.
- Generación de texto libre mediante `mlx_lm.generate`, con control de tokens máximos.
- Código y flujos agénticos: el repositorio oficial de Qwen3.8-27B presenta el modelo como especialmente apto para coding, workflows agénticos y automatización de tareas de oficina.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Respuestas sin filtros de rechazo heredados de la alineación original, como consecuencia de la abliteración.
- Capacidades de visión: no disponibles en esta release, la torre de visión ha sido eliminada.
- Tool calling / function calling: no confirmado en la información disponible.
- Razonamiento multi-paso autónomo: no confirmado en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre comportamiento de rechazo: dado que el modelo ha sido abliterado, permite estudiar qué direcciones de activación gobiernan el rechazo y comparar las respuestas con el modelo alineado original, en un entorno controlado y local.
- Red-teaming y evaluación de robustez: sirve como modelo "sin restricciones" contra el que probar clasificadores de seguridad, guardarraíles y sistemas de detección de contenido dañino antes de desplegarlos.
- Asistencia de programación en local: con ~26,9 B de parámetros y capacidades orientadas a código, puede usarse como copiloto offline en un Mac para autocompletado, refactorización y explicación de fragmentos, sin enviar código a servicios externos.
- Procesamiento de texto por lotes: al ser text-only y de 11,8 GB, es adecuado para resumir, reescribir o clasificar grandes volúmenes de documentos ejecutando `mlx_lm.generate` en bucle sobre un único equipo.
- Automatización de tareas de ofimática: generación de borradores, plantillas y respuestas a partir de documentos, aprovechando el enfoque del modelo original hacia tareas administrativas.
- Anotación y aumento de datasets: puede etiquetar o generar datos sintéticos de texto sin el sesgo de rechazo del modelo alineado, útil cuando el corpus objetivo incluye temas sensibles legítimos (por ejemplo, literatura, historia o seguridad informática).
- Prototipado de agentes conversacionales: integrable en scripts locales que encadenan llamadas al modelo mediante `mlx-lm`, sin coste de API ni dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card, ni el repositorio de HuggingFace, ni los resultados de búsqueda asociados incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para esta cuantización. Tampoco se documentan métricas de degradación respecto al modelo base en BF16. Además, la cuantización a 3 bits introduce una pérdida de calidad no medida respecto al original, que no puede cuantificarse sin evaluaciones publicadas.

## Requisitos de hardware

- Peso de los archivos: 11,8 GB en el repositorio, correspondientes a los pesos cuantizados a 3 bits.
- Memoria unificada recomendada: al menos 16 GB para cargar el modelo y mantener una ventana de contexto corta; 24 o 32 GB son recomendables para contextos más largos y para evitar swap.
- Plataforma: MLX está diseñado para Apple Silicon, por lo que el uso previsto son chips de la serie M (M1, M2, M3, M4) y sus variantes Pro, Max y Ultra.
- GPU dedicada: esta release no está pensada para GPUs NVIDIA o AMD; para usarlas habría que convertir los pesos a otro formato, conversión que no se incluye en el repositorio.
- GPU consumer: no aplica en el formato MLX. En una GPU con 12-16 GB de VRAM solo sería viable tras una conversión a GGUF con cuantización equivalente, procedimiento no documentado aquí.
- Despliegue: `mlx-lm` es el runtime indicado por el autor. Se documentan dos vías, `mlx_lm.chat` para conversación interactiva y `mlx_lm.generate` para generación directa. Otros runtimes no están soportados de forma nativa por este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta para ningún chip concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ap3212/Qwen3.8-27B-ABLITERATED-3bit-MLX-TextOnly | 26,9 B (confirmado) | MLX, 3-bit affine, group size 64 | Solo texto | no disponible | no disponible | HuggingFace, 0 descargas |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 | no disponible (prefijo 27B) | BF16 | Multimodal (modelo base) | no disponible | no disponible | HuggingFace |
| PocketAiHub/Qwen3.8-27B-Abliterated-MLX | no disponible (prefijo 27B) | MLX | no disponible | no disponible | no disponible | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible (prefijo 27B) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

Los cuatro modelos comparten el mismo linaje Qwen3.8-27B y el mismo tratamiento de abliteración o cuantización sobre él. La diferencia principal de esta release es que elimina la torre de visión y aplica una cuantización de 3 bits más agresiva que el BF16 del modelo base, a cambio de una pérdida de calidad no medida. No hay datos públicos de benchmarks que permitan comparar el rendimiento real entre estas variantes.

## Limitaciones y advertencias

- Ausencia de alineación de seguridad: la abliteración elimina el comportamiento de rechazo, por lo que el modelo puede generar contenido dañino, ofensivo o ilegal sin filtros. Su uso debe restringirse a entornos de investigación controlados y nunca exponerse directamente a usuarios finales sin guardarraíles externos.
- Degradación por cuantización: los 3 bits con group size 64 son una cuantización agresiva; no se han publicado evaluaciones que cuantifiquen la pérdida de calidad frente al modelo en BF16.
- Pérdida de capacidades multimodales: la torre de visión ha sido eliminada, de modo que el modelo no puede procesar imágenes pese a que el modelo original es multimodal nativo.
- Licencia no disponible: al no especificarse licencia, no puede asumirse permiso para uso comercial. Es necesario contactar con los autores antes de cualquier despliegue productivo.
- Idiomas y contexto no documentados: se desconoce la cobertura lingüística real y la longitud máxima de contexto soportada, lo que impide planificar cargas de trabajo con documentos largos.
- Riesgo de alucinación: no hay datos de evaluación que permitan acotar la tasa de invención de hechos, y la cuantización de 3 bits tiende a incrementarla.
- Artefacto no verificado: el repositorio registra 0 descargas y 0 valoraciones, y existe una discrepancia entre la cuenta que publica (ap3212) y la que firma la cuantización (EgorKodin). Conviene verificar la integridad de los pesos antes de usarlos.
- Discrepancia de nomenclatura: la etiqueta del repositorio es `qwen3_5` mientras que el nombre del modelo indica Qwen3.8, lo que puede generar confusión sobre la arquitectura exacta.
- Restricciones de formato: el modelo solo es utilizable con MLX en Apple Silicon; no hay pesos GGUF ni safetensors estándar para vLLM o TGI.
- Trazabilidad limitada: no se documenta el conjunto de datos de entrenamiento ni el método de abliteración, lo que dificulta auditar sesgos o reproducir resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ap3212/Qwen3.8-27B-ABLITERATED-3bit-MLX-TextOnly
- Modelo base: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Variante abliterada en MLX de PocketAiHub: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX
- Variante abliterada de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Guía de despliegue en Apple Silicon con MLX: https://aiindigo.com/tutorials/getting-started-with-superqwen3-8-27b-abliterated-mlx-unfiltered-local-inference

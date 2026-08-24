# apodex/Apodex-1.1-mini-NVFP4

## Resumen

Apodex-1.1-mini-NVFP4 es un modelo de lenguaje de razonamiento y ejecución de tareas agénticas, desarrollado por Apodex AI como versión compacta de su sistema Apodex 1.1. Está construido sobre la base Qwen/Qwen3.5-35B-A3B, un modelo de mezcla de expertos (MoE) de 35 000 millones de parámetros totales con 3 000 millones activos, y se distribuye en una cuantización mixta NVFP4 de 4 bits optimizada con ModelOpt. El modelo está diseñado para tareas de investigación de largo horizonte: trabaja directamente con archivos, datos, código y herramientas, mantiene estado de tarea, coordina subagentes en paralelo y verifica sus propias conclusiones antes de entregar resultados.

La versión mini conserva las capacidades principales del sistema Apodex 1.1 —razonamiento, llamada nativa a funciones, ejecución en entornos reales y verificación de afirmaciones— en un paquete de 19 000 millones de parámetros que puede desplegarse en una sola GPU. Según la model card, lidera el benchmark FrontierFinance con 50,2 puntos y obtiene 27,7 en APEX-Agent, compitiendo con modelos de frontera mucho mayores. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.5-35B-A3B |
| Parametros totales | 19 001 054 576 (19,0 B) |
| Parametros activos | 3 000 millones (A3B) |
| Longitud de contexto | 262 144 tokens (256 K) |
| Tipos de cuantizacion | NVFP4 (modelopt_mixed, 4 bits mixtos), 8-bit |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantizacion ModelOpt) |

## Arquitectura y entrenamiento

Apodex-1.1-mini hereda la arquitectura MoE de Qwen3.5-35B-A3B, con 19 000 millones de parámetros totales y solo 3 000 millones activos por token, lo que permite una inferencia eficiente en hardware de consumo. La cuantización NVFP4 (punto flotante de 4 bits de NVIDIA) se aplica mediante ModelOpt en modo mixto, combinando precisiones para preservar la calidad en las capas críticas. El modelo sigue la plantilla de chat de Qwen3.5: emite llamadas a herramientas en formato `<tool_call>` y razonamiento en bloques `thinking... response`.

El entrenamiento se ha orientado a tareas agénticas de largo horizonte. Según la documentación, el modelo está entrenado para ejecución de extremo a extremo en entornos reales: limpiar datos, seleccionar métodos, ejecutar análisis, inspeccionar resultados intermedios, recuperarse de errores y producir entregables verificables. Incorpora un mecanismo de verificación independiente (Statement Review) que contrasta las afirmaciones clave con sus fuentes, datos y cálculos antes de la entrega. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Razonamiento y ejecución de tareas complejas de largo horizonte, con mantenimiento de estado de tarea y adaptación de planes.
- Llamada nativa a funciones (function calling) siguiendo el formato de Qwen3.5, con soporte para esquemas de herramientas vía API de chat-completions.
- Coordinación de subagentes en paralelo mediante el harness Agent Team, con flujo continuo de resultados hacia un estado compartido.
- Verificación de afirmaciones y corrección de conclusiones antes de la entrega (Statement Review).
- Trabajo directo con archivos, hojas de cálculo, datasets, imágenes y código.
- Capacidades multimodales de entrada (image-text-to-text) según los tags del modelo, aunque la model card no detalla su alcance.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Investigación de mercado y análisis financiero: el modelo puede recopilar datos de múltiples fuentes, limpiarlos, ejecutar análisis cuantitativos y generar informes verificados, gracias a su capacidad de trabajar con hojas de cálculo y código en un flujo continuo.
- Revisión sistemática de literatura científica: puede procesar papers, extraer afirmaciones clave, contrastarlas con las fuentes citadas y señalar inconsistencias antes de redactar la síntesis.
- Automatización de informes de datos internos: integrado en un pipeline de datos, puede leer CSV, ejecutar análisis estadísticos, generar visualizaciones y producir un entregable final con verificación de cálculos.
- Desarrollo de agentes de soporte técnico: con su llamada nativa a funciones y su capacidad de razonamiento multi-paso, puede gestionar consultas complejas que requieren consultar bases de conocimiento, ejecutar scripts y devolver respuestas con trazabilidad.
- Análisis de documentos legales o regulatorios: puede extraer cláusulas, comparar versiones, verificar referencias cruzadas y producir resúmenes con citas comprobadas.
- Generación y depuración de código en entornos de CI/CD: puede recibir un fallo de compilación, inspeccionar el código, proponer una corrección, ejecutar pruebas y validar el resultado antes de integrarlo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para Apodex-1.1-mini en configuración Agent Team, comparados con el setup ReAct:

| Benchmark | Apodex-1.1-mini (Agent Team) | Apodex-1.1-mini (ReAct) |
|---|---|---|
| APEX-Agent | 27,7 | inferior (no especificado) |
| FrontierFinance | 50,2 | inferior (no especificado) |

La model card indica que el setup Agent Team supera consistentemente al setup ReAct en los tres benchmarks evaluados para el mini (el tercero no se nombra explícitamente en el texto). No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible. Tampoco se ofrecen comparativas numéricas con otros modelos en los mismos benchmarks.

## Requisitos de hardware

- VRAM estimada: con 19 000 millones de parámetros en cuantización NVFP4 (4 bits), los pesos ocupan aproximadamente 9,5 GB. Sumando KV cache y overhead de inferencia, se estima un consumo de 12-16 GB para contexto largo. Dato no confirmado oficialmente.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para la mayoría de cargas; para contexto máximo de 256 K se recomienda una GPU con 24 GB o más, o usar contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más, aunque con contexto limitado.
- Opciones de despliegue: SGLang (recomendado, con soporte para cuantización modelopt_mixed y decodificación especulativa NEXTN), también compatible con vLLM y TGI mediante el formato safetensors.
- Latencia y throughput: no disponibles. El comando de despliegue sugerido incluye decodificación especulativa con 4 tokens de borrador, lo que debería mejorar la velocidad de generación, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Apodex-1.1-mini-NVFP4 | 19 B | 3 B | 256 K | Apache 2.0 | Agentes, razonamiento, verificación |
| Qwen3.5-35B-A3B (base) | 35 B | 3 B | 256 K | Apache 2.0 | Modelo base generalista |
| Apodex-1.0-mini | 35 B (aprox.) | no disponible | no disponible | Apache 2.0 | Investigación profunda, verificación |

La comparativa directa con otros modelos de la misma categoría (MoE de ~20-35 B orientados a agentes) no está disponible en la información proporcionada. Apodex-1.1-mini se distingue de su base Qwen3.5-35B-A3B por el entrenamiento específico en tareas agénticas y el sistema de verificación, y de su predecesor Apodex-1.0-mini por las mejoras en coordinación de subagentes y verificación de entregables.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no hay soporte declarado para español u otros idiomas.
- Riesgo de alucinación en tareas abiertas de investigación, aunque el mecanismo de Statement Review mitiga parcialmente este problema al contrastar afirmaciones con fuentes.
- El contexto máximo de 256 K puede requerir hardware de gama alta para aprovecharse por completo; con GPU de 16 GB el contexto efectivo se reduce.
- La cuantización NVFP4 es específica de hardware NVIDIA; puede no ser compatible con GPUs de otros fabricantes sin conversión.
- No se han publicado detalles sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no es posible evaluar riesgos de sesgo sistemático.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue en producción requiere el harness Agent Team (disponible en GitHub) para alcanzar el rendimiento reportado en benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apodex/Apodex-1.1-mini-NVFP4
- Colección Apodex-1: https://huggingface.co/collections/apodex/apodex-1
- Modelo anterior Apodex-1.0-mini: https://huggingface.co/apodex/Apodex-1.0-mini
- Página oficial: https://www.apodex.com/
- Servicio online: https://www.apodex.ai
- Plataforma API: https://platform.apodex.ai
- Repositorio Agent Team (harness): https://github.com/ApodexAI/FrontierAgent
- Blog tecnico: https://www.apodex.com/blog/apodex-1.1-scaling-agentic-intelligence-for-complex-work
- Tech report (PDF): https://www.apodex.com/pdf/20260824
- Articulo sobre Apodex-1.0-mini en ExplainX: https://www.explainx.ai/blog/apodex-1-0-mini-futurex-35b-deep-research-2026

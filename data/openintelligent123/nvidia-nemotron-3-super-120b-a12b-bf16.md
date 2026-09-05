# Openintelligent123/NVIDIA-Nemotron-3-Super-120B-A12B-BF16

## Resumen

NVIDIA Nemotron-3-Super-120B-A12B-BF16 es un modelo de lenguaje de gran escala desarrollado por NVIDIA, perteneciente a la familia Nemotron de modelos abiertos. Está diseñado para ofrecer capacidades avanzadas de razonamiento, uso de herramientas y colaboración entre agentes, con un enfoque especial en cargas de trabajo de alto volumen, como la automatización de tickets de soporte técnico (IT). El modelo emplea una arquitectura híbrida denominada LatentMoE, que combina capas Mamba-2 y MoE con capas de atención selectivas, e incorpora predicción multi-token (MTP) para acelerar la generación y mejorar la calidad.

El modelo tiene un total de 120B parámetros, de los cuales 12B son activos por token, lo que lo convierte en un Mixture-of-Experts eficiente. Su longitud de contexto alcanza hasta 1M tokens, lo que lo hace adecuado para tareas de razonamiento con contexto muy largo y sistemas de recuperación aumentada (RAG). Está optimizado para agentes colaborativos, uso de herramientas y razonamiento configurable, y soporta siete idiomas: inglés, francés, alemán, italiano, japonés, español y chino. Está listo para uso comercial bajo la NVIDIA Nemotron Open Model License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE: híbrida Mamba-2 + MoE + Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 120B (123.611.012.096 parámetros en pesos safetensors) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | BF16 (este checkpoint), NVFP4 (checkpoint separado: NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4) |
| Idiomas soportados | Inglés, francés, alemán, italiano, japonés, español, chino |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es una innovación híbrida denominada LatentMoE, que intercala capas de Mamba-2, capas de Mixture-of-Experts (MoE) y capas de atención selectivas. A diferencia del modelo Nano de la misma familia, el modelo Super incorpora capas de predicción multi-token (MTP), que permiten generar varios tokens por paso de decodificación, mejorando tanto la velocidad como la calidad de la generación. Además, fue pre-entrenado utilizando cuantización NVFP4 para maximizar la eficiencia computacional.

El entrenamiento se dividió en dos fases principales: pre-entrenamiento con datos con fecha de corte en junio de 2025, utilizando el dataset `nvidia/nemotron-pre-training-datasets`, y post-entrenamiento con datos con fecha de corte en febrero de 2026, empleando `nvidia/nemotron-post-training-v3`. La información disponible no detalla si se utilizaron técnicas específicas como RLHF o DPO, aunque el README menciona que el modelo está optimizado para agentes y razonamiento, lo que sugiere un pipeline de post-entrenamiento orientado a esas capacidades.

## Capacidades

- Generación de texto con razonamiento configurable: el modelo puede generar trazas de razonamiento antes de la respuesta final, y este comportamiento se puede activar o desactivar mediante el flag `enable_thinking` en el chat template.
- Razonamiento de contexto largo: soporta hasta 1M tokens, lo que permite procesar documentos extensos, logs, conversaciones largas y bases de conocimiento completas.
- Uso de herramientas (tool calling): está optimizado para tool use, lo que le permite integrarse en pipelines de agentes que necesitan llamar funciones o APIs.
- Trabajo agéntico y multi-step reasoning: diseñado para agentes colaborativos y flujos de trabajo que requieren pasos de razonamiento encadenados.
- Recuperación aumentada (RAG): su capacidad de contexto largo y razonamiento lo hace adecuado para sistemas RAG con documentos extensos.
- Capacidades multilingües: soporta siete idiomas, incluidos inglés, francés, alemán, italiano, japonés, español y chino.
- Decodificación especulativa: incluye una cabeza MTP integrada para acelerar la generación, con una versión actualizada MTPv2 disponible como checkpoint separado.

## Casos de uso

- Automatización de tickets de soporte técnico (IT): el modelo puede clasificar, priorizar y redactar respuestas para tickets de soporte, aprovechando su razonamiento de contexto largo para analizar historiales completos y su capacidad de tool calling para consultar sistemas internos.
- Agentes colaborativos: gracias a su optimización para agentes, puede coordinarse con otros agentes en flujos de trabajo complejos, delegando tareas y consolidando resultados mediante razonamiento multi-paso.
- Recuperación aumentada (RAG) sobre documentos extensos: su ventana de 1M tokens permite indexar y consultar bases documentales amplias, como manuales técnicos, contratos o legislación, manteniendo el contexto íntegro.
- Asistente de atención al cliente multilingüe: al soportar siete idiomas, puede gestionar conversaciones con usuarios de distintas regiones sin necesidad de modelos separados, manteniendo la coherencia en el razonamiento.
- Generación y análisis de código: aunque no se detalla explícitamente en la documentación, su capacidad de tool calling y razonamiento lo habilita para tareas de programación asistida, revisión de código y depuración en entornos de CI/CD.
- Análisis de logs y telemetría: su contexto largo permite procesar secuencias extensas de eventos o logs, identificando patrones y anomalías mediante razonamiento paso a paso.
- Búsqueda y síntesis de información técnica: puede combinar tool calling con RAG para responder preguntas complejas que requieren consultar múltiples fuentes y razonar sobre la información recuperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo requiere un mínimo de 8× H100-80GB para la versión BF16. El checkpoint BF16 tiene un tamaño de repositorio de 247.2 GB, por lo que se necesitan múltiples GPUs de 80 GB para cargar los pesos completos.
- GPU recomendadas: 8× H100-80GB para la versión BF16. Para despliegues en una sola GPU, NVIDIA ofrece una variante NVFP4 que puede ejecutarse en un B200 o DGX Spark.
- Compatibilidad con GPUs de consumo: no disponible para la versión BF16; la variante NVFP4 está pensada para B200 o DGX Spark, no para GPUs de consumo.
- Opciones de despliegue: la información disponible no detalla backends específicos como vLLM, llama.cpp, Ollama o TGI. El modelo es compatible con la librería `transformers` y está marcado como `endpoints_compatible` en HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo es el primero de la serie Nemotron 3 en utilizar arquitectura LatentMoE e incluir capas MTP, lo que lo diferencia de modelos anteriores como Nemotron Nano.

## Limitaciones y advertencias

- Requisitos de hardware muy elevados: la versión BF16 necesita un mínimo de 8× H100-80GB, lo que limita su despliegue a entornos con infraestructura de datacenter.
- Idiomas limitados: aunque soporta siete idiomas, no cubre la mayoría de lenguas del mundo, lo que puede ser restrictivo para aplicaciones globales.
- Licencia: el uso del modelo está gobernado por la NVIDIA Nemotron Open Model License. Aunque está listo para uso comercial, se deben revisar los términos de la licencia para asegurar el cumplimiento en cada caso.
- Posible riesgo de alucinación: como con cualquier modelo de lenguaje, existe riesgo de generar información incorrecta o ficticia, especialmente en tareas que requieren razonamiento complejo.
- Ventana de contexto larga con coste computacional: aunque soporta hasta 1M tokens, procesar secuencias tan largas requiere un uso intensivo de memoria y cómputo, lo que puede afectar a la latencia en entornos de producción.
- Dependencia de NVIDIA: el modelo está fuertemente optimizado para el ecosistema de NVIDIA, incluyendo cuantización NVFP4 y hardware específico, lo que puede limitar la portabilidad a otros proveedores de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Openintelligent123/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Página de investigación: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b/modelcard
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Colección de datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Checkpoint MTPv2: https://huggingface.co/nvidia/Nemotron-3-Super-120B-A12B-BF16-MTPv2

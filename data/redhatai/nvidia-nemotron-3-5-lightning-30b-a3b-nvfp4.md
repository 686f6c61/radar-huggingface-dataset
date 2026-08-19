# RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 es un modelo de lenguaje de gran tamaño desarrollado por NVIDIA, perteneciente a la familia Nemotron 3.5 Lightning. Se trata de un modelo de arquitectura híbrida Mixture-of-Experts (MoE) que combina capas intercaladas de Mamba-2, MoE y atención selectiva, con un total de 30.000 millones de parámetros de los cuales solo 3.000 millones se activan por token. Esta configuración lo hace especialmente eficiente para inferencia en una sola GPU, manteniendo un rendimiento competitivo en tareas de razonamiento, generación de código y agentes autónomos.

El modelo está disponible en cuantización NVFP4 (4 bits) y admite una ventana de contexto de hasta 1 millón de tokens, lo que lo posiciona como una opción atractiva para aplicaciones que requieren procesamiento de secuencias muy largas, como análisis de documentos extensos o agentes conversacionales de larga duración. NVIDIA lo ha diseñado para ser desplegado en hardware Blackwell (DGX Spark, GB200, RTX 5090) y Hopper (H100, H200), con soporte adicional para Ampere mediante W4A16.

La versión publicada en el repositorio RedHatAI es un espejo del checkpoint oficial de NVIDIA, con licencia OpenMDW-1.1, que permite uso comercial. El modelo se distribuye en formato safetensors con pesos cuantizados a NVFP4, ocupando aproximadamente 25,2 GB en disco. Está orientado a desarrolladores que necesitan un modelo de alta eficiencia para agentes de larga ejecución, subagentes y despliegue local en hardware de consumo o profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba-2 + MoE + Attention (interleaved) |
| Parametros totales | 30B (3B activos) según model card; 17.820.210.764 en el checkpoint NVFP4 |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens (validado por defecto) |
| Tipos de cuantizacion | NVFP4 (4 bits), también disponible en BF16 |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés |
| Licencia | OpenMDW-1.1 (uso comercial permitido) |
| Formato de pesos | safetensors (NVFP4 cuantizado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas de Mamba-2 (modelos de espacio de estado) con capas MoE y capas de atención selectiva. Esta combinación busca aprovechar la eficiencia computacional de Mamba-2 para secuencias largas, la capacidad de escalado de los expertos para tareas diversas y la atención para capturar dependencias globales. El resultado es un modelo con 30B parámetros totales pero solo 3B activos por token, lo que reduce significativamente el coste de inferencia.

Según la información disponible, el modelo fue pre-entrenado con más de 20 billones de tokens (dato de la versión BF16). El corpus de post-entrenamiento consiste en datos curados de alta calidad y datos generados sintéticamente, con una fecha de corte de mayo de 2026 para los datos de post-entrenamiento. NVIDIA también ha desarrollado métodos de decodificación especulativa específicos para este modelo: DSpark (optimizado para DGX Spark y centros de datos con baja concurrencia), MTP (Multi-Token Prediction) y DFlash. Estos métodos aceleran la generación de texto sin sacrificar calidad.

El checkpoint NVFP4 se obtiene mediante cuantización de 4 bits de los pesos originales, lo que reduce el tamaño del modelo a aproximadamente 17,8B parámetros almacenados (frente a los 30B de la versión BF16) y permite su ejecución en GPUs con menor memoria.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para cadenas de pensamiento (reasoning) mediante el parser `nemotron_v3` en vLLM.
- Generación de código y comprensión de lenguajes de programación, con soporte para tool calling (parser `qwen3_coder`) y auto-selección de herramientas.
- Capacidades agénticas: apto para agentes autónomos de larga duración y subagentes, gracias a su contexto de 1M tokens y su eficiencia en inferencia.
- Multilingüe: inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa integrada (DSpark, MTP, DFlash) para acelerar la generación.
- Soporte para despliegue en una sola GPU (DGX Spark, H100, RTX 5090) con cuantización NVFP4.
- Compatible con vLLM (versión 0.27.1 o superior) y con backends de Mamba como FlashInfer.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener conversaciones o ejecutar tareas multi-paso durante horas sin degradación, gracias a su contexto de 1M tokens y su bajo coste de inferencia (3B activos). Es adecuado como "caballo de batalla" para subagentes en pipelines de automatización.
- Generación de código en producción: con soporte para tool calling y parser de código, puede integrarse en entornos de desarrollo como asistente de programación, generando funciones, tests o documentación, y ejecutando herramientas externas.
- Atención al cliente multilingüe: al soportar seis idiomas, puede desplegarse como chatbot de soporte en empresas con clientes internacionales, gestionando conversaciones con contexto largo y derivando a agentes humanos cuando sea necesario.
- Análisis de documentos extensos: su ventana de 1M tokens permite procesar libros técnicos, contratos legales o informes financieros completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas sobre el contenido.
- Razonamiento científico y matemático: con puntuaciones de 75,57 en GPQA Diamond (sin herramientas) y 31,38 en SciCode, es útil para asistencia en investigación, resolución de problemas matemáticos y verificación de hipótesis.
- Despliegue local en hardware de consumo: gracias a la cuantización NVFP4 y sus 3B parámetros activos, puede ejecutarse en GPUs como la RTX 5090 o incluso en la DGX Spark, permitiendo inferencia privada sin conexión a la nube.
- Subagente en arquitecturas de enrutamiento: junto con NeMo Switchyard, puede usarse como modelo de ejecución rápida para tareas de alto volumen, mientras que modelos frontier se reservan para planificación compleja.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card oficial de NVIDIA. Se comparan las versiones BF16 y NVFP4 del modelo.

| Tarea | BF16 | NVFP4 |
|---|---|---|
| MMLU Pro (conocimiento general) | 81,94 | 81,62 |
| AA-Omniscience | 17,50 | 16,63 |
| GPQA Diamond (sin herramientas) | 75,44 | 75,57 |
| HLE (text-only, sin herramientas) | 11,72 | 10,47 |
| SciCode | 32,60 | 31,38 |
| SWE-bench Veri | no disponible en la información proporcionada | no disponible |

La degradación por cuantización NVFP4 es mínima en la mayoría de tareas (menos de 1 punto porcentual en MMLU Pro y GPQA Diamond), lo que indica que la cuantización de 4 bits preserva bien el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint NVFP4 ocupa ~17,8 GB en disco (25,2 GB con overhead). Para inferencia con contexto largo, se recomienda al menos 24 GB de VRAM (RTX 4090, RTX 5090, A100 40GB, H100 80GB). Con cuantización adicional o reducción de contexto, podría caber en 16 GB.
- GPUs soportadas: NVIDIA Blackwell (DGX Spark/GB10, GB200, GeForce RTX 5090), Hopper (H100, H200) y Ampere (A100, etc.) mediante W4A16.
- Se puede ejecutar en una sola GPU, tanto en hardware profesional (H100) como en hardware de consumo (RTX 5090).
- Opciones de despliegue: vLLM (recomendado, con soporte para speculative decoding y MoE backend Marlin o Humming), y posiblemente llama.cpp/Ollama (no confirmado en la documentación).
- Latencia y throughput: no se proporcionan datos específicos, pero la combinación de 3B parámetros activos y decodificación especulativa (DSpark) está diseñada para alta velocidad de generación en entornos de baja concurrencia.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, por su arquitectura MoE con 3B activos y contexto de 1M, es comparable a otros modelos de la misma categoría, como Qwen2.5-32B-A3B o DeepSeek-V3-Lite (ambos MoE con ~3B activos). No obstante, no hay benchmarks públicos que permitan una comparación rigurosa en este momento. Se recomienda consultar la documentación oficial de NVIDIA para más detalles.

## Limitaciones y advertencias

- La licencia OpenMDW-1.1 permite uso comercial, pero es necesario revisar los términos específicos (enlace en la sección de enlaces) para asegurar el cumplimiento, especialmente en lo relativo a redistribución y responsabilidad.
- El modelo puede generar contenido inexacto, sesgado o inapropiado. NVIDIA advierte que las respuestas pueden ser incorrectas o dañinas, por lo que se recomienda supervisión humana en aplicaciones críticas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento o hechos poco comunes.
- Aunque soporta 1M tokens de contexto, el rendimiento puede degradarse en secuencias muy largas si no se configuran adecuadamente los mecanismos de atención y caché KV.
- La cuantización NVFP4 puede introducir ligeras pérdidas de precisión (observadas en los benchmarks), aunque son mínimas.
- El modelo está optimizado para hardware NVIDIA; el soporte en GPUs de otros fabricantes (AMD, Intel) no está documentado.
- La fecha de corte de los datos de entrenamiento es septiembre de 2025 para pre-entrenamiento y mayo de 2026 para post-entrenamiento, por lo que no tiene conocimiento de eventos posteriores.

## Enlaces

- Repositorio HuggingFace (espejo RedHatAI): https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Repositorio oficial NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk

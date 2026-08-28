# oakmindai/DeepSeek-V4-Flash-0731-DSFP4-FTW

## Resumen

DeepSeek-V4-Flash-0731-DSFP4-FTW es un repaqueteado del checkpoint oficial de DeepSeek-V4-Flash-0731, desarrollado por DeepSeek AI, en formato FTW (FreeToken Weight) para su ejecución nativa en el NVIDIA DGX Spark con el superchip Grace Blackwell GB10. La conversión la realiza OakMind AI y no introduce un modelo nuevo ni una cuantización adicional: preserva la representación FP4 E2M1 de los expertos MoE con escala UE8M0 por cada 32 pesos, mientras que el resto de tensores mantienen su precisión FP8 o BF16 original. El objetivo es permitir la carga diferida de expertos desde NVMe local y la gestión de memoria unificada, sin alterar la calidad de salida esperada del modelo.

El modelo base, DeepSeek-V4-Flash-0731, es un modelo de lenguaje de tipo Mixture of Experts (MoE) sparse con aproximadamente 304.000 millones de parámetros totales y 13.000 millones de parámetros activos, con una ventana de contexto de un millón de tokens e incluye un módulo de decodificación especulativa. Según la documentación oficial, supera a DeepSeek-V4-Pro (Preview) en benchmarks a pesar de activar muchos menos parámetros, y está orientado a tareas de generación de texto, codificación, razonamiento, contexto largo y flujos agénticos. Esta ficha se centra en el artefacto FTW publicado por OakMind AI, no en el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sparse (Mixture of Experts) basada en transformer, con módulo de decodificación especulativa |
| Parametros totales | 304B (según documentación NVIDIA; otras fuentes citan 284B) |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 E2M1 para expertos MoE (escala UE8M0 por 32 pesos); FP8 y BF16 para el resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | FTW (FreeToken Weight) |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-V4-Flash-0731, un MoE sparse con 304B parámetros totales y 13B activos, diseñado para activar solo una fracción de los expertos por token. Incluye un módulo de decodificación especulativa adjunto y soporta una ventana de contexto de un millón de tokens. La arquitectura exacta de atención y el número de capas no se detallan en la información disponible. El checkpoint oficial ya incorpora los pesos en formato DS-FP4, con los expertos en FP4 E2M1 y escalas UE8M0.

El repaqueteado FTW no modifica los pesos ni realiza reentrenamiento o requantización. FreeToken reorganiza el layout: los expertos enrutados se almacenan en bancos direccionables de forma independiente y el resto de tensores se alinean para el cargador nativo. Esto permite a SparkLab mantener las filas de expertos activos en memoria unificada y recuperar los fallos de caché desde NVMe local sin materializar el checkpoint completo en memoria de aplicación. No se dispone de información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Generación de texto y chat conversacional con soporte de streaming.
- Razonamiento multi-paso y modos de esfuerzo de razonamiento (reasoning-effort modes) preservados del checkpoint oficial.
- Generación de código y soporte de flujos agénticos, incluyendo tool calling y ejecución de tareas multi-paso.
- Procesamiento de contexto largo de hasta un millón de tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa integrada para reducir la latencia de generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin soporte de visión ni audio: el modelo acepta únicamente entrada y salida de texto.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de un millón de tokens, manteniendo el historial completo de la interacción sin truncamientos.
- Generación de código en producción: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para autocompletar, revisar o refactorizar código, ejecutándose en un DGX Spark local para mantener los datos dentro de la infraestructura.
- Agentes autónomos de análisis de documentos: su contexto de un millón de tokens permite ingerir informes, contratos o expedientes completos y responder preguntas específicas o resumir secciones concretas sin necesidad de chunking.
- Asistente de investigación y razonamiento matemático: los modos de esfuerzo de razonamiento permiten desplegar el modelo en tareas que requieren cadenas de pensamiento largas, como demostraciones formales o resolución de problemas complejos.
- Servicio de inferencia local compatible con OpenAI: el servidor SparkLab expone una API de chat completions compatible con OpenAI, por lo que puede sustituir a un backend remoto en aplicaciones existentes sin cambios en el código cliente.
- Prototipado y evaluación de modelos en hardware edge: al estar optimizado para DGX Spark, permite validar el rendimiento de un MoE de 304B en un equipo de escritorio de alta gama, sin depender de clústeres de GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de DeepInfra indica que DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en los benchmarks listados en su página, pero no se proporcionan cifras concretas en los materiales consultados. No se deben asumir números no verificados.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark con superchip Grace Blackwell GB10, que combina CPU y GPU con memoria unificada.
- Almacenamiento: se requiere NVMe local rápido para el path de ejecución de MoE respaldado en disco (disk-backed MoE). Sin NVMe, el despliegue no es viable.
- Memoria: el planificador de SparkLab permite configurar la memoria unificada con `--memory-ratio 0.90` y una caché de host de 4 GB para expertos, pero no se especifica la VRAM total necesaria.
- GPU: no es un modelo para GPUs de consumo convencionales; está pensado exclusivamente para DGX Spark. No se indica compatibilidad con RTX, A100 o H100.
- Opciones de despliegue: servidor OpenAI-compatible de SparkLab (comando `sparklab serve`), con backend de atención `dsv4_sparse` y caché tipo radix.
- Latencia y throughput: no disponibles. La decodificación especulativa y la ejecución de MoE en disco deberían reducir la latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (oficial) | 304B | 13B | 1M | MIT | Safetensors / DS-FP4 |
| DeepSeek-V4-Flash-0731-DSFP4-FTW (este repo) | 304B | 13B | 1M | MIT | FTW |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con DeepSeek-V4-Pro (Preview) no es posible por falta de datos públicos en la información consultada. La documentación oficial afirma que V4-Flash-0731 supera a V4-Pro en benchmarks con menos parámetros activos, pero no se ofrecen cifras. Este repositorio no añade capacidades nuevas respecto al modelo base; su diferencia es exclusivamente el formato de empaquetado y el flujo de despliegue para DGX Spark.

## Limitaciones y advertencias

- Hardware restringido: el formato FTW y el flujo SparkLab están diseñados únicamente para NVIDIA DGX Spark. No se puede ejecutar en GPUs convencionales ni en otros entornos sin adaptación.
- Dependencia de NVMe: el path de MoE en disco requiere almacenamiento NVMe local rápido; con almacenamiento lento, el rendimiento se degradará significativamente.
- Formato propietario: FTW es un formato específico de FreeToken; no es compatible con herramientas estándar como llama.cpp, vLLM u Ollama sin conversión previa.
- Cuantización FP4: aunque la model card afirma que la conversión preserva la precisión y no altera la calidad, la representación FP4 de los expertos puede tener un impacto en la precisión numérica frente a una versión BF16/FP8 completa, especialmente en tareas de alta sensibilidad numérica.
- Sin datos de sesgos ni alucinación: no se ha publicado información sobre sesgos conocidos, tasas de alucinación o limitaciones idiomáticas del modelo base.
- Licencia MIT: permite uso comercial, pero se debe revisar la licencia del modelo base y de los componentes de software (FreeToken y SparkLab) para cumplir con sus términos.
- Modelo sin entrenamiento adicional: este repositorio no añade fine-tuning ni mejoras; cualquier limitación del modelo base se mantiene intacta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oakmindai/DeepSeek-V4-Flash-0731-DSFP4-FTW
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Código fuente de FreeToken y SparkLab: https://github.com/sixteen-miles-labs/freetoken
- Repositorio de FreeToken (backend de inferencia): https://github.com/FlashML-org/FreeToken
- Paper de FreeToken (arXiv 2608.16157): https://arxiv.org/abs/2608.16157
- Documentación de NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731
- Documentación de API de NVIDIA: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731
- Documentación de DeepInfra: https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-0731/api

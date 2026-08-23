# longertime/logicpeak-ft-g1

## Resumen

El modelo `longertime/logicpeak-ft-g1` es un ajuste fino (fine-tuning) del modelo base Qwen3.6-35B-A3B, desarrollado por el usuario longertime en Hugging Face. Se trata de un modelo causal de lenguaje con codificador de visión, orientado a tareas de razonamiento lógico y generación de código. El modelo base, creado por Alibaba, destaca por su arquitectura híbrida de mezcla de expertos (MoE) con atención lineal Gated DeltaNet y atención clásica, lo que permite un equilibrio entre rendimiento y eficiencia computacional.

Con 35.107 millones de parámetros totales y solo 3.000 millones activos, este modelo ofrece una latencia de inferencia reducida en comparación con modelos densos de tamaño similar. Su longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, lo hace adecuado para tareas que requieren razonamiento sobre documentos extensos o repositorios de código completos. La licencia Apache-2.0 permite su uso comercial sin restricciones adicionales.

El repositorio contiene los pesos en formato safetensors, compatibles con Hugging Face Transformers, vLLM, SGLang y KTransformers. Aunque no se proporcionan detalles específicos del proceso de ajuste fino, el nombre "logicpeak-ft" sugiere una especialización en razonamiento lógico y resolución de problemas complejos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-35B-A3B (MoE híbrido con Gated DeltaNet y Gated Attention) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3.000 millones (8 expertos ruteados + 1 compartido de 256 expertos) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3.6 es multilingüe, pero no se especifica para este ajuste) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es una mezcla de expertos (MoE) con 256 expertos, de los cuales se activan 8 ruteados más 1 compartido por token. Cada experto tiene una dimensión intermedia de 512. El modelo sigue un patrón de capas híbridas: cada bloque está compuesto por 10 secuencias de (Gated DeltaNet → MoE) seguidas de 1 (Gated Attention → MoE). La atención lineal (Gated DeltaNet) usa 32 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención clásica (Gated Attention) emplea 16 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones.

El modelo incluye un codificador de visión para procesar imágenes junto con texto (pipeline image-text-to-text). El entrenamiento se realizó en dos fases: pre-entrenamiento y post-entrenamiento, con técnica de multi-token prediction (MTP) para mejorar la eficiencia de decodificación. El vocabulario de tokenización es de 248.320 entradas (padded). La configuración de contexto de 262K tokens nativo se logra mediante una combinación de atención lineal y atención clásica, lo que reduce el coste cuadrático de la atención completa.

## Capacidades

- Generación de texto y razonamiento lógico, especialmente orientado a tareas de codificación y resolución de problemas.
- Procesamiento de imágenes (vision encoder) combinado con texto, permitiendo entrada multimodal.
- Razonamiento de nivel de repositorio: el modelo puede trabajar con contextos largos de código y documentación.
- Soporte de agentes de codificación: integra herramientas y puede realizar razonamiento multi-paso.
- Preservación de contexto de razonamiento histórico, según las características del modelo base.
- Capacidades multilingües heredadas del modelo base Qwen (no confirmadas para este ajuste).
- Decodificación multi-token (MTP) para mejorar la velocidad de generación.

## Casos de uso

- **Asistente de programación en IDE**: el modelo puede integrarse en editores de código para autocompletar funciones complejas, refactorizar código y sugerir correcciones. Su contexto de 262K tokens permite procesar archivos completos y mantener el estado de la sesión.
- **Resolución de issues en repositorios**: gracias a su capacidad de razonamiento sobre código a nivel de repositorio, puede analizar issues de GitHub y proponer parches concretos, reduciendo el tiempo de resolución de bugs.
- **Generación de documentación técnica**: puede generar documentación de API, comentarios de código y explicaciones de arquitectura a partir de código fuente, aprovechando su contexto largo para abarcar múltiples archivos.
- **Agente de automatización de tareas de desarrollo**: con tool calling y razonamiento multi-paso, puede orquestar pipelines de CI/CD, ejecutar comandos de terminal y gestionar flujos de trabajo de desarrollo.
- **Soporte técnico con contexto de productos**: al poder procesar grandes volúmenes de documentación, puede responder preguntas de usuarios sobre APIs o sistemas complejos, manteniendo el historial de conversación.
- **Análisis de datos y generación de informes**: su capacidad de razonamiento y procesamiento de texto largo lo hace adecuado para resumir documentos extensos, extraer información clave y generar informes estructurados.
- **Educación y tutoría de programación**: puede explicar conceptos de código, depurar errores y generar ejemplos didácticos, adaptándose al nivel del estudiante mediante interacción multiuso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el ajuste fino `logicpeak-ft-g1`. La model card del repositorio solo contiene los resultados del modelo base Qwen3.6-35B-A3B, que se muestran a continuación como referencia (no son del modelo ajustado):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75.0 | 52.0 | 70.0 | 17.4 | 73.4 |
| SWE-bench Multilingual | 69.3 | 51.7 | 60.3 | 17.3 | 67.2 |
| SWE-bench Pro | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |
| Terminal-Bench 2.0 | 51.2 | 35.7 | 44.6 | 13.8 | 49.5 |

Estos datos son del modelo base y no garantizan el rendimiento del ajuste fino. No se dispone de información sobre métricas como MMLU, HumanEval o GSM8K para este modelo concreto.

## Requisitos de hardware

- **VRAM estimada**: con 35B parámetros totales y 3B activos, la inferencia en modo MoE requiere una memoria de pesos en FP16 de aproximadamente 70 GB (tamaño del repositorio). En cuantización INT8 podría reducirse a ~35 GB, y en INT4 a ~18 GB. Los pesos activos son mucho menores, por lo que la memoria de activaciones es limitada, pero el almacenamiento de todos los expertos es necesario.
- **GPU recomendadas**: para FP16 se necesitan múltiples GPU de alta gama, como A100 80GB (2 unidades) o H100. Para cuantización INT4, una RTX 4090 con 24 GB puede ser suficiente, aunque la velocidad de inferencia será menor. También es viable con RTX A6000 (48 GB).
- **Compatibilidad con GPU de consumo**: sí, con cuantización INT4 o INT8 se puede ejecutar en RTX 4090 o RTX 4080, pero se recomienda al menos 24 GB de VRAM para contextos largos.
- **Opciones de despliegue**: compatible con vLLM, SGLang, KTransformers y Hugging Face Transformers. También se puede usar con llama.cpp si se convierte a formato GGUF (no disponible en el repositorio).
- **Latencia y throughput**: no se dispone de datos concretos. En modo MoE con 3B activos, la velocidad de generación debería ser considerablemente mayor que un modelo denso de 35B, pero depende de la implementación y del hardware.

## Comparativa con modelos similares

La siguiente tabla compara el modelo base Qwen3.6-35B-A3B con otras alternativas de la misma categoría (MoE con ~30-40B totales y ~3-4B activos). No se incluye el fine-tune por falta de datos.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | 3B | 262K (ext. 1M) | Apache-2.0 | safetensors |
| Qwen3.5-35B-A3B | 35B | 3B | 256K | Apache-2.0 | safetensors |
| Gemma4-26B-A4B | 26B | 4B | 256K | Gemma license (uso comercial permitido) | safetensors |
| DeepSeek-V3 (MoE) | 671B | 37B | 128K | DeepSeek license | safetensors |

El modelo de longertime se basa en la arquitectura de Qwen3.6, que presenta mejoras en razonamiento de código y preservación del contexto de pensamiento frente a la versión 3.5.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se dispone de información específica sobre sesgos del modelo. Como modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en temas fuera de su dominio de entrenamiento.
- **Riesgo de alucinación en código**: aunque está especializado en codificación, puede producir código con errores lógicos o de seguridad. Se recomienda revisión humana en entornos de producción.
- **Limitaciones de idioma**: aunque el modelo base es multilingüe, no se especifica qué idiomas soporta este ajuste fino. Podría estar optimizado principalmente para inglés y código.
- **Contexto largo**: aunque admite hasta 1M tokens, la calidad puede degradarse en contextos muy largos. El rendimiento en ventanas de 262K tokens no está garantizado.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, modificación y distribución, pero no incluye garantías. El usuario debe revisar la licencia del modelo base.
- **Disponibilidad de cuantizaciones**: no se proporcionan cuantizaciones oficiales. El usuario debe convertirlas o usar herramientas de terceros.
- **Sesgos del dataset de ajuste**: al ser un fine-tune de un tercero, no se conoce la composición del dataset de entrenamiento, lo que puede introducir sesgos o degradación en dominios no cubiertos.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/longertime/logicpeak-ft-g1)
- [Modelo base Qwen3.6-35B-A3B (model card original)](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Blog de Qwen sobre Qwen3.6-35B-A3B](https://qwen.ai/blog?id=qwen3.6-35b-a3b)
- [Licencia Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [Página de modelos del usuario longertime](https://huggingface.co/longertime/models)

# Oscilla/gemma-3-4b-it-mlx-8Bit

## Resumen

El modelo Oscilla/gemma-3-4b-it-mlx-8Bit es una conversión del modelo multimodal Gemma 3 4B instructivo de Google, adaptado al formato MLX con cuantización de 8 bits. Lo desarrolla el usuario Oscilla en Hugging Face, y su objetivo es permitir la ejecución eficiente del modelo en hardware de Apple Silicon mediante la librería mlx-lm, sin necesidad de GPUs dedicadas. El modelo base, google/gemma-3-4b-it, es un transformer multimodal que procesa entradas de texto e imagen y genera texto, con pesos abiertos bajo la licencia Gemma.

Esta conversión resulta relevante para desarrolladores que trabajan en ecosistemas Apple y desean desplegar un modelo de 4 mil millones de parámetros en dispositivos con memoria unificada, manteniendo un equilibrio entre rendimiento y consumo de recursos. La cuantización de 8 bits reduce el tamaño del modelo a aproximadamente 4,2 GB, lo que facilita su uso en equipos de gama media. Aunque el repositorio muestra un número de parámetros de 1.091.588.608 en los safetensors, este valor corresponde a los pesos cuantizados y no a los parámetros reales del modelo original, que son del orden de 4 mil millones.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en los resultados de búsqueda, sin datos adicionales sobre entrenamiento o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) basado en Gemma 3 |
| Parametros totales | 1.091.588.608 (pesos cuantizados en safetensors; el modelo base tiene ~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (int8) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma (requiere aceptacion de terminos de uso) |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de google/gemma-3-4b-it realizada con mlx-lm versión 0.31.2. El modelo original pertenece a la familia Gemma 3 de Google, que utiliza una arquitectura transformer con atención multi-cabeza y capacidades multimodales: acepta imágenes y texto como entrada y genera texto. La conversión a MLX implica una reescritura de los pesos al formato nativo de Apple Silicon, junto con una cuantización de 8 bits para reducir el tamaño en memoria.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card del repositorio solo indica el proceso de conversión y el uso de mlx-lm, sin aportar datos adicionales sobre el entrenamiento original. Se asume que el modelo base mantiene las características de Gemma 3 4B, pero no se pueden confirmar detalles específicos.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, genera texto como salida (pipeline image-text-to-text).
- Conversación multi-turno: incluye plantilla de chat (chat_template) para uso interactivo.
- Instrucciones en lenguaje natural: al ser una variante "it" (instruction-tuned), está optimizado para seguir comandos y responder a peticiones del usuario.
- Ejecución en Apple Silicon: gracias al formato MLX, puede ejecutarse en Macs con chips M1, M2, M3 y superiores, aprovechando la memoria unificada.
- Compatibilidad con transformers: el repositorio incluye la etiqueta transformers, lo que permite su uso con la librería estándar de Hugging Face, aunque el formato MLX está orientado a mlx-lm.
- Cuantización de 8 bits: reduce el uso de memoria y acelera la inferencia en hardware con limitaciones de VRAM.

## Casos de uso

- Asistente conversacional en aplicaciones macOS: el modelo puede integrarse en aplicaciones nativas de Apple mediante MLX, ofreciendo respuestas contextuales sin depender de servicios en la nube, gracias a su tamaño reducido y la cuantización de 8 bits.
- Descripción y análisis de imágenes en entornos offline: al aceptar entradas de imagen, puede generar descripciones, extraer información visual o responder preguntas sobre fotografías, útil para herramientas de accesibilidad o gestión de archivos multimedia en equipos Apple.
- Prototipado rápido de chatbots con memoria limitada: su tamaño de 4,2 GB permite cargarlo en Macs con 8 GB de RAM, lo que facilita el desarrollo y prueba de asistentes virtuales en entornos de desarrollo locales.
- Generación de texto asistida en editores y herramientas de productividad: puede usarse como motor de autocompletado o redacción de borradores dentro de aplicaciones de escritorio, aprovechando su capacidad de instrucción y su baja latencia en hardware Apple.
- Análisis de documentos con contenido mixto: combinando texto e imágenes, puede procesar capturas de pantalla, PDFs escaneados o diagramas, extrayendo información relevante para tareas de organización o investigación.
- Educación y demostraciones técnicas: al ser un modelo abierto y ligero, sirve para enseñar conceptos de IA multimodal y despliegue local en talleres o cursos, sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se recomienda consultar la documentación del modelo base google/gemma-3-4b-it para obtener datos de rendimiento, aunque no se garantiza que sean directamente aplicables a esta conversión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 8 bits y 4B parámetros, el modelo requiere aproximadamente 4-5 GB de memoria, más overhead de contexto y activaciones. En Macs con memoria unificada, se recomienda al menos 8 GB de RAM total.
- GPU recomendadas: no aplica para MLX, que está diseñado para Apple Silicon. En caso de usar el modelo con transformers en GPUs NVIDIA, se necesitaría una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060 o superior), aunque el formato MLX no es óptimo para ese entorno.
- Compatibilidad con consumer GPU: sí, en Macs con Apple Silicon (M1 o posterior) es totalmente viable. En GPUs de escritorio, se puede usar mediante transformers, pero se pierde la ventaja del formato MLX.
- Opciones de despliegue: mlx-lm (recomendado), transformers (con conversión previa), o herramientas que soporten safetensors genéricos. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Dependen del hardware específico y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Oscilla/gemma-3-4b-it-mlx-8Bit | ~4B (1.09B en safetensors) | 8-bit | MLX | Gemma | Conversión directa de google/gemma-3-4b-it |
| NexaAI/gemma-3-4b-it-8bit-MLX | ~4B | 8-bit | MLX | Gemma | Conversión alternativa del mismo modelo base |
| mlx-community/gemma-3-4b-it-8bit | ~4B | 8-bit | MLX | Gemma | Conversión de la comunidad, misma arquitectura |
| google/gemma-3-4b-it | ~4B | Sin cuantizar | Safetensors | Gemma | Modelo original, requiere más memoria |

Las tres conversiones MLX son funcionalmente equivalentes; la diferencia principal radica en la herramienta de conversión (mlx-lm vs mlx-vlm) y en el mantenimiento del repositorio. El modelo original sin cuantizar ofrece mayor precisión pero requiere más recursos.

## Limitaciones y advertencias

- La cuantización de 8 bits puede provocar una ligera pérdida de precisión en tareas complejas de razonamiento o generación de código, en comparación con el modelo original en punto flotante.
- No se dispone de información sobre sesgos del modelo. Al ser una conversión de Gemma 3, hereda los sesgos potenciales del modelo base, que no han sido evaluados en este repositorio.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- La licencia Gemma requiere la aceptación de los términos de uso de Google, que incluyen restricciones sobre usos comerciales y de alto riesgo. Es necesario revisar la licencia completa antes de su implementación en producción.
- El formato MLX limita su uso a hardware Apple; para otros entornos sería necesaria una conversión adicional a formatos estándar como GGUF o FP16.
- No se han publicado benchmarks específicos para esta conversión, por lo que el rendimiento real puede variar respecto al modelo original.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Oscilla/gemma-3-4b-it-mlx-8Bit
- Modelo base (google/gemma-3-4b-it): https://huggingface.co/google/gemma-3-4b-it
- Conversión alternativa de NexaAI: https://huggingface.co/NexaAI/gemma-3-4b-it-8bit-MLX
- Conversión de mlx-community: https://huggingface.co/mlx-community/gemma-3-4b-it-8bit (referenciada en Inferix, enlace directo no verificado)

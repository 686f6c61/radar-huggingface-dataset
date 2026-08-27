# GestaltLabs/Ornstein3.8-27B

## Resumen

Ornstein3.8-27B es un modelo de lenguaje multimodal (visión y texto) desarrollado por GestaltLabs, un proyecto independiente de un estudiante de doctorado en neurociencia visual de la Universidad de Toronto. Se trata de un ajuste fino (fine-tune) del modelo Qwen3.8-27B de Alibaba, que inyecta un estilo de razonamiento denominado "Ornstein thinking" mediante una fusión de LoRA entrenada en la plataforma Fireworks AI. El modelo está diseñado para tareas de comprensión de imágenes y vídeo, así como para conversación multimodal, con una ventana de contexto de 262 144 tokens.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, que combina atención lineal y completa de forma intercalada (Gated DeltaNet), junto con un codificador visual estilo SigLIP. Con aproximadamente 27 800 millones de parámetros en formato denso, el modelo se distribuye en pesos bfloat16 y también en cuantizaciones GGUF. Su relevancia radica en ofrecer una alternativa de código abierto con licencia Apache 2.0 para aplicaciones que requieren procesamiento de imágenes y texto con contexto muy largo, aunque el autor advierte que se trata de una versión temprana sin evaluación formal completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (atención intercalada lineal y completa con Gated DeltaNet, codificador visual SigLIP) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, Q6_K, Q4_K_M (en repo separado) |
| Idiomas soportados | No disponible (no especificado en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `Qwen3_5ForConditionalGeneration`, que emplea una combinación de atención lineal (Gated DeltaNet) y atención completa (full attention) en capas intercaladas. Esta configuración permite manejar secuencias largas de forma más eficiente que la atención estándar, manteniendo la capacidad de modelar dependencias complejas. El componente visual es una torre estilo SigLIP con tamaño de parche 16 y dimensión de salida 5120, que se integra con el modelo de lenguaje. El modelo tiene 64 capas, 24 cabezas de atención, 4 cabezas KV, dimensión de cabeza 256, y un MLP intermedio de 17 408 unidades. El vocabulario comprende 248 320 tokens.

El entrenamiento consistió en un ajuste fino mediante LoRA (rank 32, alpha 32) sobre el modelo base Qwen3.8-27B, realizado en la plataforma Fireworks AI. Los pesos LoRA se fusionaron únicamente en las capas lineales del modelo de lenguaje, dejando intactos el codificador visual y el módulo MTP (multi-token prediction). No se han publicado detalles sobre el conjunto de datos de entrenamiento ni el número de tokens utilizados. El autor menciona planes futuros de refinamiento mediante entornos de aprendizaje por refuerzo (RL) y ajuste fino basado en energía, pero no se han implementado en esta versión.

## Capacidades

- Comprensión de imágenes y vídeo: el modelo acepta entradas visuales (imágenes y vídeo) junto con texto, y puede generar descripciones, responder preguntas o mantener conversaciones sobre el contenido visual.
- Generación de texto: hereda las capacidades de generación de lenguaje del modelo base Qwen3.8-27B, incluyendo redacción, resumen y diálogo.
- Razonamiento multimodal: al combinar visión y lenguaje, puede realizar tareas que requieren inferencia sobre información visual y textual simultáneamente.
- Soporte de tool calling: la plantilla de chat incluida (`chat_template.jinja`) incorpora soporte para llamadas a herramientas, lo que permite integrar el modelo en flujos de agentes.
- Contexto largo: con 262 144 tokens de ventana, puede procesar documentos extensos, vídeos largos o conversaciones de muchas vueltas sin perder información relevante.
- Multilingüismo: aunque no se especifican idiomas concretos, al estar basado en Qwen3.8, es probable que herede el soporte multilingüe del modelo base, pero no hay confirmación oficial.

## Casos de uso

- Análisis de imágenes médicas: el modelo puede recibir radiografías o resonancias magnéticas junto con la historia clínica del paciente y generar informes descriptivos o responder preguntas específicas sobre hallazgos, gracias a su contexto largo para incluir múltiples estudios.
- Moderación de contenido visual: en plataformas de redes sociales, puede analizar imágenes y vídeos para detectar contenido inapropiado o peligroso, combinando la comprensión visual con reglas textuales definidas por el operador.
- Asistentes de accesibilidad: para personas con discapacidad visual, el modelo puede describir escenas, leer texto en imágenes o interpretar gráficos, funcionando como un asistente conversacional en tiempo real.
- Extracción de información de documentos escaneados: puede procesar facturas, contratos o formularios en imagen, extraer campos clave y estructurarlos en formato JSON, aprovechando su capacidad de tool calling para integrarse en pipelines de automatización.
- Generación de descripciones para comercio electrónico: a partir de fotos de productos, el modelo puede redactar descripciones detalladas, sugerir atributos o responder a preguntas de clientes sobre características visuales.
- Análisis de vídeo para seguridad: con su ventana de contexto larga, puede procesar secuencias de vídeo extensas y generar resúmenes de eventos, detectar anomalías o responder a consultas sobre lo ocurrido en un intervalo concreto.
- Asistente educativo multimodal: puede explicar diagramas, gráficos o ilustraciones científicas a estudiantes, adaptando el nivel de detalle según las preguntas del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la tarjeta del modelo se actualizará con evaluaciones formales cuando estén disponibles, y que el trabajo de calidad planificado (RL environments y energy-based fine-tuning) aún no se ha completado. Por tanto, no es posible comparar numéricamente este modelo con alternativas en tareas estándar como MMLU, HumanEval o benchmarks de visión-lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los pesos ocupan aproximadamente 55,6 GB, por lo que se necesitan al menos 60-70 GB de VRAM para cargar el modelo completo con overhead de inferencia. Con cuantización GGUF Q4_K_M, el tamaño se reduce a unos 16-18 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- GPU recomendadas: para BF16, se requieren GPUs de datacenter como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, aunque no suficiente para BF16 completo). Para cuantización GGUF, una RTX 4090 o RTX 4080 son suficientes.
- Compatibilidad con GPUs de consumo: sí, mediante cuantización GGUF (Q4_K_M o Q6_K) en GPUs con 16-24 GB de VRAM.
- Opciones de despliegue: el modelo es compatible con Transformers (carga directa), vLLM y SGLang (si se usa una versión que soporte la arquitectura `qwen3_5`), y llama.cpp para los archivos GGUF. También puede ejecutarse con Ollama si se añade el modelo manualmente.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090 con cuantización Q4_K_M, se puede esperar una velocidad de generación de entre 20 y 40 tokens por segundo, pero estos valores son estimaciones orientativas basadas en modelos de tamaño similar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| GestaltLabs/Ornstein3.8-27B | ~27,8B | 262 144 | Qwen3_5 (atención híbrida) | Apache 2.0 | Fine-tune multimodal de Qwen3.8-27B, sin benchmarks publicados |
| Qwen/Qwen3.8-27B | ~27,8B | 262 144 | Qwen3_5 (atención híbrida) | Apache 2.0 | Modelo base, sin ajuste específico de "Ornstein thinking" |
| Qwen/Qwen2.5-VL-32B | ~32B | 32 768 (ampliable) | Transformer con visión | Apache 2.0 | Modelo multimodal de la generación anterior, con benchmarks publicados |

La comparación directa con Qwen2.5-VL-32B es orientativa, ya que no se dispone de resultados de rendimiento para Ornstein3.8-27B. La principal diferencia frente al base es el ajuste fino con LoRA, que introduce un estilo de razonamiento particular, pero no se ha demostrado una mejora cuantitativa. Frente a Qwen2.5-VL-32B, Ornstein ofrece un contexto mucho más largo (262K frente a 32K) y una arquitectura más moderna, pero carece de evaluación formal.

## Limitaciones y advertencias

- Versión temprana: el autor lo describe como un "early merge, not a finished quality release". No ha pasado por una evaluación exhaustiva ni por un proceso de refinamiento con RL, por lo que su comportamiento puede ser inconsistente en tareas complejas.
- Sin benchmarks: no hay datos objetivos de rendimiento en tareas estándar, lo que impide conocer su calidad relativa frente a otros modelos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o cuando se le pide interpretar imágenes ambiguas.
- Sesgos potenciales: al derivar de Qwen3.8, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se han documentado específicamente.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque Qwen3.8 suele cubrir múltiples lenguas, no hay garantía de un rendimiento uniforme en todas ellas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se otorgan garantías. El autor solicita apoyo económico (Ko-fi) pero no condiciona el uso a ello.
- Requisitos de hardware: para usar el modelo en BF16 se necesita una GPU de datacenter con al menos 80 GB de VRAM, lo que limita su despliegue en entornos de consumo sin cuantización.

## Enlaces

- Repositorio HuggingFace: [GestaltLabs/Ornstein3.8-27B](https://huggingface.co/GestaltLabs/Ornstein3.8-27B)
- Repositorio GGUF: [GestaltLabs/Ornstein3.8-27B-GGUF](https://huggingface.co/GestaltLabs/Ornstein3.8-27B-GGUF)
- Modelo base: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- Plataforma de entrenamiento: [Fireworks AI](https://fireworks.ai)
- Sitio web de Gestalt Labs: [https://gestaltlabs.net/](https://gestaltlabs.net/)

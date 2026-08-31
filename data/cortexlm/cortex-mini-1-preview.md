# CortexLM/Cortex-Mini-1-Preview

## Resumen

Cortex-Mini-1-Preview es un modelo de lenguaje y visión (VLM) nativo de 27 000 millones de parámetros, desarrollado por CortexLM (Cortex Foundation), una entidad vinculada a la red Bittensor. Se trata de un derivado post-entrenado del checkpoint abierto Qwen/Qwen3.8-27B de Alibaba Cloud, sobre el que se ha aplicado una técnica de post-entrenamiento propia denominada Cortex Relearn. El objetivo declarado es mejorar el rendimiento en tareas de validación retenidas (held-out) sin degradar las capacidades generales del modelo base ni sobreajustar los conjuntos de evaluación públicos.

El modelo hereda la arquitectura del Qwen3.8-27B: un transformer causal con codificador de visión integrado, capaz de procesar texto, imagen y vídeo. Cuenta con 64 capas, un tamaño oculto de 5120 y una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000 mediante la técnica YaRN. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, modificación y redistribución. Esta versión es una vista previa (preview) y sus pesos, receta de entrenamiento y métricas pueden cambiar en futuras versiones numeradas.

La relevancia de este lanzamiento radica en que demuestra un enfoque de post-entrenamiento sobre un VLM abierto de gran tamaño, sin añadir un codificador de visión separado, y mantiene la compatibilidad con el ecosistema de herramientas de Qwen (vLLM, SGLang, TokenSpeed). Sin embargo, al ser una vista previa, no se publican resultados de benchmarks oficiales, por lo que su rendimiento real debe evaluarse de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión (VLM nativo) |
| Parametros totales | 27 781 427 952 (27B dense) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible a 1 000 000 con YaRN |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB) |

## Arquitectura y entrenamiento

Cortex-Mini-1-Preview es un modelo denso de 27B parámetros basado en la arquitectura de Qwen3.8-27B. Se trata de un modelo de lenguaje causal con un codificador de visión integrado, lo que le permite procesar directamente entradas de texto, imagen y vídeo sin necesidad de un adaptador externo. La configuración incluye 64 capas transformer, un tamaño oculto de 5120 y una ventana de contexto nativa de 262 144 tokens, ampliable a 1 000 000 mediante la extensión YaRN.

El entrenamiento del modelo base fue realizado por el equipo de Qwen (Alibaba Cloud) e incluyó fases de pre-entrenamiento y post-entrenamiento. Sobre ese checkpoint, CortexLM ha aplicado su técnica de post-entrenamiento denominada Cortex Relearn, cuyo objetivo es mejorar el rendimiento en tareas de validación retenidas sin colapsar las capacidades generales ni sobreajustar los conjuntos de evaluación públicos. No se han publicado detalles específicos sobre el dataset utilizado en esta fase de post-entrenamiento, ni sobre el número de tokens o la composición exacta de los datos. Tampoco se indica si se emplearon técnicas como RLHF o DPO; la información disponible solo menciona el proceso de post-entrenamiento continuado.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.8-27B para tareas de lenguaje natural, incluyendo razonamiento multi-paso y modo de pensamiento (thinking mode) activado por defecto.
- Comprensión de imágenes: procesa imágenes como entrada, permitiendo descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- Comprensión de vídeo: acepta entradas de vídeo, aunque la configuración de vídeo a escala de horas se hereda del modelo base y no ha sido reajustada por CortexLM.
- Soporte de tool calling y function calling: heredado de Qwen3.8-27B, permite la integración con herramientas externas y APIs.
- Capacidades de agente: puede utilizarse en flujos multi-paso que requieran planificación y ejecución de acciones, gracias a su soporte de razonamiento y tool calling.
- Multilingüismo: soporta inglés y chino, los dos idiomas declarados en la configuración.
- Modo de pensamiento (thinking): activado por defecto en el stack de Qwen3.8, con parámetros como `enable_thinking`, `preserve_thinking` y `reasoning_effort`.

## Casos de uso

- Asistentes conversacionales con contexto largo: gracias a su ventana de 262 144 tokens, puede mantener conversaciones multi-turno extensas, resumir documentos largos o analizar historiales de chat completos sin perder información relevante.
- Análisis de imágenes y documentos visuales: útil en entornos empresariales para extraer información de facturas, capturas de pantalla, diagramas o fotografías, combinando comprensión visual y textual.
- Procesamiento de vídeo para vigilancia o revisión de contenido: puede analizar secuencias de vídeo para detectar eventos, generar descripciones o responder preguntas sobre el contenido, aunque la configuración de vídeo largo no ha sido reajustada.
- Generación y revisión de código: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar código, revisar cambios o autocompletar funciones, siempre que se valide su salida.
- Agentes autónomos con razonamiento multi-paso: su capacidad de thinking mode y tool calling permite construir agentes que planifican, consultan APIs y ejecutan acciones de forma secuencial.
- Investigación y desarrollo en post-entrenamiento: el propio modelo sirve como banco de pruebas para la técnica Cortex Relearn, permitiendo a otros investigadores estudiar métodos de post-entrenamiento sobre VLMs abiertos.
- Fine-tuning adicional: al estar bajo Apache 2.0, puede utilizarse como base para entrenar modelos especializados en dominios concretos (medicina, legal, etc.) manteniendo la licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que, al ser una vista previa, no se publica un leaderboard público y que las métricas se entrenan sobre un conjunto de validación privado. Los resultados en conjuntos públicos se consideran informativos y no son el objetivo de optimización. Por tanto, no es posible comparar numéricamente este modelo con otros en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 27B parámetros, en precisión FP16/BF16 requiere aproximadamente 54-60 GB de VRAM. Con cuantización a 4 bits (si estuviera disponible) podría reducirse a unos 16-20 GB, pero no se ofrecen pesos cuantizados oficiales.
- GPU recomendadas: para inferencia sin cuantizar, se necesitan GPUs de clase profesional como A100 (40/80 GB), H100 (80 GB) o A6000 (48 GB). Con cuantización, podría ejecutarse en una RTX 4090 (24 GB) o similar, aunque no hay garantías oficiales.
- Compatibilidad con GPU de consumo: no se confirma oficialmente, pero por el tamaño del modelo, una RTX 4090 con 24 GB podría ejecutarlo solo con cuantización agresiva (4 bits) y posiblemente con limitaciones de contexto.
- Opciones de despliegue: compatible con vLLM, SGLang y TokenSpeed, así como con la librería transformers de HuggingFace. Se recomienda usar el directorio local de pesos descargados para producción.
- Latencia y throughput: no se proporcionan datos oficiales. Dependerá del hardware, la cuantización y la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| Cortex-Mini-1-Preview | 27B | 262K (1M con YaRN) | Texto, imagen, vídeo | Apache 2.0 | Derivado de Qwen3.8-27B, post-entrenado |
| Qwen/Qwen3.8-27B | 27B | 262K (1M con YaRN) | Texto, imagen, vídeo | Apache 2.0 | Modelo base original |
| Qwen2.5-VL-27B (si existiera) | 27B | 128K | Texto, imagen, vídeo | Apache 2.0 | No confirmado en la información disponible |

No se dispone de datos de rendimiento comparativos publicados. La comparativa se limita a características arquitectónicas y de licencia. Cortex-Mini-1-Preview se diferencia de su base únicamente por el post-entrenamiento adicional, cuyos efectos no han sido cuantificados públicamente.

## Limitaciones y advertencias

- Es una versión preview: los pesos, la receta de entrenamiento y las métricas pueden cambiar en futuras versiones. No debe tratarse como un lanzamiento estable.
- No hay benchmarks públicos: no se puede evaluar su rendimiento relativo frente a otros modelos sin pruebas independientes.
- Comportamiento potencialmente diferente al base: el post-entrenamiento puede alterar el estilo de respuesta, los rechazos (refusals) y el uso de herramientas respecto a Qwen3.8-27B. Se recomienda comparar ambos antes de sustituir uno por otro.
- Configuración de vídeo y contexto largo no reajustada: los ajustes de vídeo a escala de horas y contexto largo se heredan del modelo base y no han sido validados específicamente para este checkpoint.
- Sesgos y alucinaciones: como cualquier VLM abierto, puede generar contenido incorrecto, sesgado o inseguro. El usuario es responsable de implementar filtros y validaciones en producción.
- Idiomas limitados: solo se declaran inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: aunque Apache 2.0 permite uso comercial, se debe mantener la atribución al equipo de Qwen y a Alibaba Cloud, así como el aviso NOTICE. "Qwen" es una marca comercial de los autores originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CortexLM/Cortex-Mini-1-Preview
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Cookbook SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Organización CortexLM en HuggingFace: https://huggingface.co/CortexLM/models

# matthewj-t6/Qwen3-1.7B-4bit

## Resumen

Qwen3-1.7B-4bit (repositorio `matthewj-t6/Qwen3-1.7B-4bit`) es una conversión a 4 bits del modelo Qwen3-1.7B de Alibaba Qwen, empaquetada en formato MLX para su ejecución sobre Apple Silicon. El contenido del repositorio reproduce la conversión de referencia de `mlx-community/Qwen3-1.7B-4bit`, generada con `mlx-lm` 0.24.0, y conserva la licencia Apache 2.0 del modelo original.

El modelo resuelve el problema de ejecutar un LLM de 1.720.574.976 parámetros en equipos con memoria unificada limitada: el repositorio ocupa 1,0 GB frente a los aproximadamente 3,4 GB que requerirían los pesos en bf16. Al tratarse de un modelo denso (no MoE) y de tamaño compacto, su nicho natural es el prototipado local, la generación de texto y la conversación en portátiles Mac, no el despliegue en clústeres de GPU.

Su interés radica en heredar las capacidades de la familia Qwen3 documentadas para el modelo base (modo de razonamiento explícito, ventana de contexto larga y cobertura multilingüe amplia), con un coste de memoria muy bajo. Como contrapartida, este repositorio no incluye model card propia ni datos de evaluación de la cuantización, y registra 0 descargas y 0 valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-1.7B), pesos cuantizados en formato MLX |
| Parametros totales | 1.720.574.976 (dato real de los ficheros safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada en este repositorio. El modelo base Qwen3-1.7B declara 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | 4-bit (MLX) sobre pesos safetensors; conversion realizada con mlx-lm 0.24.0 |
| Idiomas soportados | No disponible en este repositorio. El modelo base declara soporte para 119 idiomas y dialectos |
| Licencia | apache-2.0 (enlace a la licencia del modelo base en el README) |
| Formato de pesos | safetensors con cuantizacion MLX (4-bit); tamano del repositorio 1,0 GB |

## Arquitectura y entrenamiento

Este repositorio no documenta ni el entrenamiento ni la arquitectura interna: es exclusivamente un artefacto de conversión de pesos. La model card se limita a indicar que los pesos proceden de `Qwen/Qwen3-1.7B`, que la conversión se hizo con `mlx-lm` versión 0.24.0 y que la librería de destino es MLX. No se indica el tamaño de grupo de la cuantización, ni si se cuantizaron las capas de embedding o la cabeza de salida, ni si se aplicó alguna corrección posterior.

Según la documentación pública del modelo base, Qwen3-1.7B es un transformer decoder-only denso con atención por grupos de consultas (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), entrenado sobre corpus multilingües a gran escala e instruido posteriormente mediante las etapas de post-entrenamiento de la familia Qwen3. Incluye un modo de razonamiento ("thinking") conmutable con las directivas `/think` y `/no_think`. No se han publicado mediciones del impacto de esta cuantización de 4 bits sobre la calidad de salida.

## Capacidades

- Generación de texto y conversación multi-turno en modo chat, con plantilla de chat aplicada por el tokenizador del modelo base.
- Razonamiento paso a paso en modo "thinking" (cadena de pensamiento explícita) y respuestas directas en modo "no thinking", heredado del modelo base.
- Generación de código y resolución de problemas matemáticos básicos, en línea con el tamaño de 1.720 millones de parámetros del modelo base.
- Capacidades multilingües: el modelo base declara cobertura de 119 idiomas y dialectos, aunque este repositorio no especifica idiomas concretos.
- Integración con herramientas y function calling: el modelo base soporta tool calling y plantillas de agente; no hay confirmación específica para esta conversión cuantizada.
- Ejecución local fuera de línea sobre Apple Silicon mediante `mlx-lm`, incluyendo modo servidor compatible con la API de OpenAI.
- No dispone de visión, audio ni modalidades adicionales: es un modelo exclusivamente de texto.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno aplicando `tokenizer.apply_chat_template` con el historial de mensajes, ejecutándose íntegramente en un Mac con memoria unificada y sin conexión a Internet.
- Prototipado de aplicaciones de IA antes de migrar a modelos mayores: permite validar prompts, plantillas de chat y flujos con un coste de memoria de aproximadamente 1 GB de pesos, para luego reutilizar la misma lógica sobre Qwen3 de mayor tamaño.
- Generación de texto y redacción asistida en herramientas de escritorio: por su tamaño, es viable integrarlo en aplicaciones nativas de macOS que necesiten resúmenes, reescritura o generación de borradores en local.
- Clasificación y extracción de información estructurada: se puede usar para etiquetar textos, extraer campos de documentos o generar JSON, con la ventaja de no enviar datos sensibles a servicios externos.
- Servidor de inferencia local para equipos pequeños: `mlx_lm.server` expone una API compatible con OpenAI, lo que permite conectar editores de código o interfaces existentes contra un modelo autoalojado.
- Evaluación del impacto de la cuantización 4-bit: sirve como referencia práctica para medir latencia, uso de memoria y degradación de calidad frente al modelo base en bf16 sobre el mismo hardware.
- Tareas de razonamiento ligero con `enable_thinking=True`: útil para depuración de lógica, resolución de problemas aritméticos sencillos o generación de explicaciones paso a paso, aceptando mayor latencia a cambio de mayor detalle.
- Filtrado previo en pipelines mayores (routing, resumen de contexto o reformulación de consultas) antes de invocar un modelo de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluación, y tampoco se documenta la pérdida de calidad provocada por la cuantización a 4 bits respecto a `Qwen/Qwen3-1.7B` en precisión completa.

## Requisitos de hardware

- Pesos en disco: 1,0 GB (repositorio completo, cuantización 4-bit).
- Memoria en inferencia: el conjunto de pesos ocupa alrededor de 1 GB; el consumo total depende del contexto utilizado y de la caché KV, y se estima en el rango de 1,5 a 3 GB para ventanas de contexto habituales (estimación, no verificada en la información disponible).
- Hardware compatible: exclusivamente Apple Silicon (M1 o posterior) con memoria unificada, ya que el formato MLX no se ejecuta en GPUs NVIDIA ni AMD.
- Cabe en cualquier Mac con 8 GB de memoria unificada; no requiere GPU dedicada.
- Opciones de despliegue: `mlx-lm` (funciones `load` y `generate`), `mlx_lm.chat` para uso interactivo por terminal y `mlx_lm.server` para exponer una API compatible con OpenAI. Para vLLM, llama.cpp, Ollama o TGI sería necesario convertir los pesos a otro formato (GGUF o safetensors estándar).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

Datos de los modelos comparados tomados de su documentación pública; no se han verificado con ejecuciones propias. No hay datos de benchmarks disponibles para este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato MLX | Notas |
|---|---|---|---|---|---|
| matthewj-t6/Qwen3-1.7B-4bit (analizado) | 1,72 B | No especificado en el repo; base 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Si, 4-bit | Conversión comunitaria sin model card propia ni benchmarks |
| mlx-community/Qwen3-1.7B-4bit | 1,72 B | Igual que el base | Apache 2.0 | Si, 4-bit | Conversion de referencia en la que se basa este repositorio; mantenida por la comunidad MLX |
| Qwen/Qwen3-1.7B (base, bf16) | 1,72 B | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | No (requiere conversion) | Precision completa; referencia de calidad frente a la version 4-bit |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens nativos, 128.000 con YaRN | Apache 2.0 | Si (conversiones comunitarias) | Generacion anterior, sin modo de razonamiento explicito |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Si (conversiones comunitarias) | Licencia con restricciones, no Apache 2.0; contexto nativo mayor |
| google/gemma-3-1b-it | 1 B | 32.768 tokens | Gemma Terms of Use | Si (conversiones comunitarias) | Licencia con condiciones de uso adicionales; contexto menor |

## Limitaciones y advertencias

- El repositorio no incluye model card propia: la información técnica debe obtenerse de `Qwen/Qwen3-1.7B`. Los datos de arquitectura, contexto e idiomas de esta ficha proceden de la documentación del modelo base, no del artefacto cuantizado.
- La cuantización a 4 bits introduce degradación en la calidad de las respuestas (razonamiento, matemáticas y código son las áreas más sensibles), pero no se ha publicado ninguna medición de esa pérdida para este repositorio concreto.
- Riesgo de alucinación inherente a un modelo de 1.720 millones de parámetros: la capacidad de razonamiento y de conocimiento factual es limitada en comparación con modelos de mayor tamaño, y el modo "thinking" puede producir cadenas de razonamiento plausibles pero incorrectas.
- Sesgos: no hay información disponible sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo del modelo base.
- Idiomas: aunque el modelo base declara cobertura de 119 idiomas, el rendimiento real por idioma no está documentado y tiende a ser notablemente inferior en lenguas con menos presencia en los datos de entrenamiento.
- Contexto: la ventana de 131.072 tokens requiere activar explícitamente el escalado YaRN; sin esa configuración, el modelo opera con 32.768 tokens, y el repositorio no detalla qué valor está configurado.
- Compatibilidad: al estar en formato MLX, no es desplegable en GPUs NVIDIA o AMD ni en la mayoría de servicios de inferencia en la nube sin reconversión de pesos.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una conversión de pesos de terceros conviene verificar la licencia del repositorio base antes de redistribuir.
- Sin adopción verificable: 0 descargas y 0 valoraciones, lo que implica ausencia de validación por parte de la comunidad.
- Trazabilidad: se desconoce si la conversión incluye cuantización de embeddings y cabeza de salida, el tamaño de grupo utilizado o si se aplicaron correcciones posteriores a la cuantización.

## Enlaces

- Repositorio analizado: https://huggingface.co/matthewj-t6/Qwen3-1.7B-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Conversión de referencia: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Librería de ejecución MLX LM: https://github.com/ml-explore/mlx-lm
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388

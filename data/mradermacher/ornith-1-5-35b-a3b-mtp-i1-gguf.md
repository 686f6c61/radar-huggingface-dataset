# mradermacher/Ornith-1.5-35B-A3B-MTP-i1-GGUF

## Resumen

Ornith-1.5-35B-A3B-MTP es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Shisa AI, del que esta ficha describe la cuantización GGUF preparada por mradermacher. El nombre indica 35 mil millones de parámetros totales y 3 mil millones de parámetros activos por token (A3B), una configuración habitual en modelos MoE eficientes. La etiqueta "MTP" sugiere el uso de Multi-Token Prediction durante el entrenamiento, una técnica que mejora la velocidad de decodificación y la calidad de las predicciones. Según la información disponible, el modelo está basado en la arquitectura Qwen3 e incorpora capacidades de razonamiento explícito (bloques de pensamiento) y tool calling.

Esta versión GGUF, publicada por mradermacher, es una cuantización del modelo original alojado en shisa-ai/Ornith-1.5-35B-A3B-MTP, pensada para facilitar su ejecución en hardware local mediante llama.cpp u otros motores compatibles con GGUF. Aunque el repositorio no incluye una model card detallada, los metadatos y las referencias externas permiten situar el modelo como una alternativa de razonamiento de tamaño medio, con un equilibrio entre capacidad y requisitos de memoria gracias a su arquitectura MoE. Su relevancia actual radica en que ofrece capacidades de razonamiento y agentes en un formato accesible para desarrolladores que no disponen de GPUs de gran tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3 (según referencias externas) |
| Parametros totales | 35 mil millones (según denominación del modelo; el dato de safetensors indica 48.036.230, posiblemente erróneo) |
| Parametros activos | 3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible (la versión Uncensored del mismo modelo indica inglés, pero no se confirma para esta) |
| Licencia | no disponible (la versión Uncensored usa apache-2.0, pero no se especifica aquí) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture of Experts (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token, siguiendo el diseño de los modelos Qwen3 de tamaño similar. Esta configuración permite mantener una alta capacidad de conocimiento con un coste computacional reducido en inferencia, ya que solo se activa una fracción de los parámetros en cada paso. La etiqueta "MTP" indica que se utilizó Multi-Token Prediction, una técnica de entrenamiento que predice varios tokens futuros simultáneamente, lo que suele mejorar la eficiencia de decodificación y la coherencia del texto generado.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. Sin embargo, las referencias externas indican que el modelo es de tipo "razonamiento", es decir, que genera una cadena de pensamiento interna antes de responder, y que soporta tool calling mediante bloques `<tool_call>`. La versión Uncensored del mismo modelo menciona "abliterated", lo que sugiere que se han eliminado ciertos mecanismos de rechazo, pero esta característica no se confirma para la versión aquí descrita.

## Capacidades

- Razonamiento explícito: el modelo abre cada turno con un bloque de pensamiento (`thinking`) antes de la respuesta final, lo que permite resolver problemas complejos paso a paso.
- Tool calling: soporta la generación de bloques `<tool_call>` para invocar funciones externas, integrándose con APIs de tipo OpenAI.
- Conversación multi-turno: diseñado para mantener diálogos coherentes y contextuales.
- Generación de texto general: capaz de producir respuestas en lenguaje natural, aunque los idiomas exactos no están confirmados.
- Posible soporte de visión: la versión Uncensored del modelo incluye la etiqueta "vision", pero no se ha verificado en esta cuantización.
- Eficiencia en inferencia: gracias a su arquitectura MoE con 3B activos, puede ejecutarse en hardware de consumo con cuantización adecuada.

## Casos de uso

- Asistentes virtuales con razonamiento: el modelo puede mantener conversaciones que requieren análisis lógico, planificación o explicaciones detalladas, gracias a su modo de pensamiento explícito.
- Agentes autónomos con tool calling: su soporte nativo de `<tool_call>` permite integrarlo en pipelines de agentes que necesitan consultar bases de datos, APIs o ejecutar acciones.
- Generación de código asistida: aunque no se han publicado benchmarks específicos, su capacidad de razonamiento lo hace adecuado para tareas de programación, depuración y explicación de código.
- Análisis de documentos y resumen: con una ventana de contexto no confirmada pero probablemente amplia (típica de Qwen3), puede procesar textos largos para extraer información o resumir.
- Educación y tutoría: su habilidad para descomponer problemas y explicar pasos lo convierte en un buen candidato para plataformas de aprendizaje interactivo.
- Prototipado de aplicaciones de IA: al estar disponible en GGUF, permite probar rápidamente el modelo en entornos locales con llama.cpp u Ollama antes de decidir un despliegue a mayor escala.

## Benchmarks y rendimiento

Según la plataforma BenchLM, el modelo Ornith-1.5-35B-A3B obtiene una puntuación pública de 49.22 sobre 100, situándose en el puesto 137 de 224 modelos evaluados. La plataforma indica que se trata de una estimación basada en 18 filas de benchmarks, pero no se proporcionan los resultados desglosados por tarea (MMLU, HumanEval, GSM8K, etc.). No se dispone de datos adicionales de rendimiento en la información consultada.

| Benchmark | Resultado |
|---|---|
| Puntuación global BenchLM | 49.22/100 (estimado) |
| Ranking BenchLM | 137 de 224 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo MoE de 35B totales con 3B activos, la memoria necesaria depende de la cuantización. Para Q4_K_M, se estima entre 20 y 25 GB de VRAM, lo que permite ejecutarlo en GPUs como RTX 3090, RTX 4090 o A6000. Con cuantizaciones más agresivas (Q2_K, IQ2_M), podría caber en GPUs de 16 GB, aunque con pérdida de calidad.
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), o GPUs de datacenter con suficiente memoria. Para uso en CPU, es posible con llama.cpp, pero la velocidad será limitada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a formato compatible), TGI (con adaptación).
- Latencia y throughput: no disponibles. Se espera que la decodificación sea más rápida que un modelo denso de 35B gracias a los 3B activos, pero no hay cifras concretas.

## Comparativa con modelos similares

El modelo es comparable a Qwen3-30B-A3B, del que probablemente deriva, y a otros MoE de tamaño similar como DeepSeek-V3-Lite o MiniMax-M1. Sin embargo, no se dispone de datos de rendimiento directos para establecer una comparación cuantitativa. La siguiente tabla resume las características principales según la información disponible:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MTP | 35B | 3B | no disponible | no disponible | GGUF en HF |
| Qwen3-30B-A3B | 30B | 3B | 32K (típico) | Apache-2.0 | Oficial y cuantizaciones |
| DeepSeek-V3-Lite | 16B | 2.4B | 128K | MIT | Oficial y cuantizaciones |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas del modelo; se recomienda evaluar en el dominio de uso antes de desplegar en producción.
- La licencia no está especificada en este repositorio, lo que genera incertidumbre sobre su uso comercial. La versión Uncensored del mismo modelo usa Apache-2.0, pero no se puede asumir para esta variante.
- El modelo está diseñado para razonamiento, lo que implica que genera cadenas de pensamiento largas; esto puede aumentar la latencia y el coste computacional en aplicaciones en tiempo real.
- La longitud de contexto no está confirmada; si se hereda de Qwen3, podría ser de 32K o 128K, pero no hay garantía.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco utilizada; se recomienda verificar la integridad de los archivos antes de su uso.
- El dato de parámetros totales en safetensors (48.036.230) es inconsistente con la denominación de 35B; probablemente sea un error de metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-MTP-i1-GGUF
- Modelo original (Shisa AI): https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP
- Versión Uncensored (mradermacher): https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-Uncensored-GGUF
- Benchmarks en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Imagen Docker (referencia de uso): https://hub.docker.com/r/ai/ornith-1.5

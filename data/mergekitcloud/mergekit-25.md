# MergekitCloud/mergekit-25

## Resumen

MergekitCloud/mergekit-25 es un modelo de lenguaje de 3.085.383.680 parámetros (aproximadamente 3,09 mil millones) resultado de la fusión de dos modelos de la familia Qwen2.5: Qwen/Qwen2.5-3B-Instruct y Qwen/Qwen2.5-Coder-3B-Instruct. Lo publica el usuario MergekitCloud en HuggingFace y se ha generado con la herramienta mergekit mediante el método SLERP (interpolación esférica), sin entrenamiento adicional a partir de los pesos originales. El objetivo típico de este tipo de fusiones es combinar las capacidades conversacionales generales del modelo Instruct con el rendimiento en código del modelo Coder en un único checkpoint denso de 3B.

La relevancia práctica del modelo radica en su tamaño: con pesos en bfloat16 ocupa unos 6,2 GB, lo que permite ejecutarlo en GPUs de consumo con 8-12 GB de VRAM e incluso en CPU mediante cuantización. Es, por tanto, un candidato para despliegues locales, prototipado rápido y entornos con recursos limitados donde no es viable servir un modelo de 7B o superior.

Ahora bien, la model card es mínima: solo documenta el método de fusión y la configuración YAML. No declara licencia, idiomas soportados, ni publica resultados de benchmarks. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto sin validación comunitaria. Cualquier evaluación de su calidad real en producción debe hacerse de forma empírica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (heredada de los modelos base) |
| Parametros totales | 3.085.383.680 (3,09 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; los modelos base Qwen2.5-3B declaran 32.768 tokens nativos según la documentación pública de Qwen |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos en bfloat16 sin cuantizaciones publicadas (GGUF, GPTQ o AWQ no incluidos) |
| Idiomas soportados | No disponible (no declarados en la model card; los hereda de los modelos base) |
| Licencia | No disponible |
| Formato de pesos | Safetensors en bfloat16 |
| Metodo de fusion | SLERP (mergekit) |
| Parametro t de la fusion | [0.10, 0.56, 0.75, 0.56, 0.10] |
| Modelos fusionados | Qwen/Qwen2.5-3B-Instruct y Qwen/Qwen2.5-Coder-3B-Instruct |
| Fuente del tokenizer | Modelo base (Qwen2.5-3B-Instruct) |
| Plantilla de chat | Auto (heredada del tokenizer base) |
| Tamano del repositorio | 6,2 GB |
| Libreria de inferencia | transformers; etiquetado como compatible con text-generation-inference y endpoints |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only denso con atención causal agrupada (GQA) y normalización RMSNorm, heredada íntegramente de los dos modelos base. No hay ningún componente MoE, SSM ni híbrido. El checkpoint no se ha entrenado desde cero: se ha construido mediante una interpolación esférica capa por capa entre los pesos de Qwen2.5-3B-Instruct y Qwen2.5-Coder-3B-Instruct, ambos del mismo tamaño y con la misma arquitectura, lo que hace viable la fusión tensorial directa sin transformaciones adicionales.

La configuración YAML publicada usa `merge_method: slerp` con `base_model: Qwen/Qwen2.5-3B-Instruct`, `dtype: bfloat16`, `tokenizer_source: base` y `chat_template: auto`. El parámetro `t` se especifica como una lista de cinco valores que se distribuyen de forma gradual a lo largo de las capas: 0,10 en los extremos y hasta 0,75 en el centro. En la convención de mergekit, `t` controla el peso relativo de cada modelo en la interpolación esférica, de modo que esta configuración desplaza el resultado hacia uno de los dos modelos (presumiblemente el Coder) en las capas centrales, manteniendo los pesos cercanos al modelo base en las capas iniciales y finales. No se ha publicado información sobre dataset de entrenamiento, número de tokens, RLHF, DPO u otras etapas de alineación, ya que el merge no incorpora entrenamiento posterior a la fusión.

## Capacidades

- Generación de texto conversacional en formato instruct, con plantilla de chat heredada del tokenizer de Qwen2.5-3B-Instruct.
- Generación y edición de código, presumiblemente reforzada por la contribución de Qwen2.5-Coder-3B-Instruct en las capas centrales.
- Razonamiento de propósito general y respuesta a instrucciones, limitado por el tamaño del modelo (3B).
- Soporte de tool calling o function calling: no confirmado en la model card; los modelos base Qwen2.5-Instruct lo documentan, pero la fusión podría degradar esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no confirmado ni evaluado.
- Capacidades multilingües: no declaradas. Los modelos base Qwen2.5 cubren decenas de idiomas según la documentación de Qwen, pero no hay verificación para este merge.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles. Es un modelo exclusivamente de texto.
- Compatibilidad declarada con text-generation-inference y endpoints, según las etiquetas del repositorio.

## Casos de uso

- Asistente de código en local: el modelo puede autocompletar y explicar fragmentos de código en un IDE o en un servidor de desarrollo propio, con la ventaja de que 3,09B de parámetros caben en una GPU de consumo y no requieren enviar el código a un servicio externo. Es adecuado cuando la confidencialidad del código es un requisito.
- Atención al cliente automatizada de bajo coste: con un contexto heredado de hasta 32.768 tokens, puede gestionar conversaciones multi-turno y resumir historiales largos. La ventana amplia permite incluir documentación de producto directamente en el prompt sin recurrir a recuperación externa en casos simples.
- Prototipado rápido de aplicaciones de chat: al cargarse directamente con transformers y estar etiquetado como compatible con TGI, sirve para validar pipelines de inferencia, plantillas de prompt y flujos de evaluación antes de migrar a un modelo mayor.
- Generación de datos sintéticos para fine-tuning: puede producir pares instrucción-respuesta en volumen para ajustar modelos más pequeños o para aumentar datasets de tareas específicas, con coste de cómputo reducido.
- Extracción y clasificación de información: tareas de resumen, etiquetado de textos, extracción de entidades simples y normalización de campos en lotes, donde el throughput importa más que la precisión máxima.
- Despliegue en el borde o en entornos sin GPU dedicada: cuantizado a 4 bits, el modelo ronda los 2 GB, lo que permite ejecutarlo en portátiles, mini-PC o instancias CPU de bajo coste para asistentes internos o herramientas de documentación.
- Educación y experimentación con técnicas de fusión de modelos: al estar publicada la configuración YAML completa, sirve como caso de estudio reproducible para analizar el efecto del parámetro `t` por capas en el comportamiento final del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no adjunta evaluación alguna. Tampoco se han publicado mediciones de latencia o throughput.

| Benchmark | mergekit-25 | Qwen2.5-3B-Instruct | Qwen2.5-Coder-3B-Instruct |
|---|---|---|---|
| MMLU | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| HumanEval | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| GSM8K | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 6,2 GB solo para pesos. Con caché KV y activaciones, se recomienda un mínimo de 8 GB y, para contextos largos, 12 GB o más.
- VRAM estimada en int8: aproximadamente 3,1 GB de pesos.
- VRAM estimada en 4 bits (GGUF Q4_K_M u equivalente): en torno a 1,9-2,2 GB de pesos. Requiere convertir los pesos, ya que el repositorio no incluye cuantizaciones.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, así como GPUs profesionales A10G, L4 o T4 (16 GB) para despliegue en servidor. A100 y H100 funcionan sin problema, pero están sobredimensionadas para un modelo de 3B salvo que se busque batch muy alto.
- Cabe en GPU de consumo: sí. En bfloat16 entra en GPUs de 8 GB con margen ajustado; en 4 bits entra en GPUs de 4-6 GB e incluso puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta declarada), vLLM para servir con PagedAttention, y llama.cpp u Ollama si se generan cuantizaciones GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-25 | 3,09B | No disponible en la ficha (heredado de Qwen2.5-3B) | Sin benchmarks publicados | No disponible | HuggingFace, safetensors bf16 |
| Qwen/Qwen2.5-3B-Instruct | 3,09B (mismo orden, derivado del mismo tronco) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, modelo oficial |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,09B (mismo orden) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, modelo oficial |
| Alternativas de ~3B (Llama 3.2 3B, Phi-3.5-mini, Gemma 2 2B) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento para ninguno de los modelos de la tabla en la informacion proporcionada. La comparación se limita, por tanto, a la relación de parentesco: este merge deriva directamente de los dos checkpoints oficiales de Qwen y no aporta parámetros adicionales, de modo que su calidad solo puede ser igual o inferior a la de cada base por separado, salvo que la fusión produzca un efecto de compensación entre capacidades.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica términos de uso. Aunque los modelos base Qwen2.5 se publican habitualmente bajo licencias permisivas, la ausencia de licencia explícita en este repositorio impide asumir su reutilización comercial sin verificación previa.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta. No hay evidencia de que el merge haya sido probado por terceros.
- Ausencia total de benchmarks: no existe ninguna medición objetiva que permita afirmar que la fusión mejora, mantiene o degrada las capacidades de los modelos base. Las fusiones SLERP pueden producir degradaciones no evidentes en tareas específicas.
- Riesgo de alucinación: inherente a un modelo denso de 3B. La capacidad de razonamiento y de mantener coherencia factual en contextos largos es limitada en comparación con modelos de 7B o superiores.
- Posible degradación del soporte de tool calling: la fusión de pesos puede alterar los patrones de formato que el modelo Instruct original aprendió para function calling. Requiere verificación empírica antes de usarlo en agentes.
- Idiomas no declarados: no hay confirmación de qué idiomas mantienen un rendimiento aceptable tras la fusión, ni de si el castellano está entre ellos con calidad suficiente.
- Duplicación de tokenizer: la configuración usa `tokenizer_source: base`, de modo que el tokenizer es el de Qwen2.5-3B-Instruct. Si se esperaba el tokenizer del modelo Coder, el comportamiento puede diferir del previsto.
- Reproducibilidad: la fecha de creación registrada (2026-10-07) y la ausencia de documentación adicional sobre el proceso impiden verificar el entorno exacto de generación del merge.
- Contexto: aunque los modelos base declaran 32.768 tokens, no se ha verificado que la fusión conserve esa ventana útil; el rendimiento en contextos muy largos puede degradarse.
- Sin cuantizaciones oficiales: cualquier despliegue en 4 u 8 bits requiere que el usuario genere las cuantizaciones, con el riesgo de pérdida adicional de calidad que ello conlleva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-25
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Documentación del método SLERP: https://en.wikipedia.org/wiki/Slerp

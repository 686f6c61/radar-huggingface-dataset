# ShahriarFerdoush/mistral-7b-instruct-code-dare-k30

## Resumen

`mistral-7b-instruct-code-dare-k30` es un modelo de lenguaje de 7.241.732.096 parámetros (7,24 mil millones, según los tensores en `safetensors` del repositorio) publicado en Hugging Face por el usuario ShahriarFerdoush. Por el nombre, las etiquetas del Hub (`mistral`, `transformers`, `safetensors`, `text-generation`) y el recuento exacto de parámetros, se trata de un derivado de la familia Mistral 7B construido previsiblemente mediante fusión de pesos (*model merging*): un checkpoint con ajuste de instrucciones combinado con uno o varios checkpoints especializados en código, aplicando la técnica DARE con un factor denotado como `k30`. La model card del repositorio es la plantilla autogenerada por el Hub y no contiene ninguna sección completada: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas.

El problema que resolvería es el habitual de esta categoría: obtener un modelo de 7B con buen comportamiento en generación de código sin perder la capacidad de seguir instrucciones conversacionales, y con un coste de inferencia que quepa en una sola GPU. Sin embargo, el repositorio no aporta ninguna evidencia de que ese objetivo se haya cumplido: cero descargas, cero *likes*, ninguna métrica publicada y ninguna declaración de licencia.

Su relevancia ahora es fundamentalmente metodológica. Es un ejemplo típico del ecosistema de *merges* comunitarios que proliferan en el Hub: checkpoints derivados de otros checkpoints, sin trazabilidad de datos ni evaluación, que conviene tratar como experimentos no validados y no como artefactos listos para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Mistral 7B (no confirmado explícitamente en la model card; inferido del nombre, las etiquetas y el recuento de parámetros) |
| Parámetros totales | 7.241.732.096 (7,24 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens según la arquitectura Mistral 7B de referencia; no verificado ni declarado en la model card |
| Tipos de cuantización | No disponible en el repositorio (solo pesos `safetensors`, presumiblemente bf16/fp16). Compatible con cuantización posterior vía `bitsandbytes`, GPTQ/AWQ (requiere cuantizar) o GGUF (requiere convertir) |
| Idiomas soportados | No disponible (no declarado). Presumiblemente inglés y capacidades multilingües parciales heredadas de la base Mistral |
| Licencia | No disponible (ausencia de licencia explícita) |
| Formato de pesos | `safetensors` (repositorio de 14,5 GB, coherente con pesos en bf16/fp16) |

## Arquitectura y entrenamiento

La arquitectura subyacente, si se confirma la base Mistral 7B, es un transformer decoder-only de 32 capas, dimensión oculta 4096, 32 cabezas de atención con 8 cabezas KV (*grouped-query attention*), FFN con activación SwiGLU y dimensión intermedia 14336, embeddings rotatorios (RoPE) y *sliding window attention* de 4096 tokens sobre una ventana total de 8192. El recuento exacto de parámetros coincide con el de Mistral-7B-v0.1/v0.2, lo que refuerza esta hipótesis, pero la model card no la documenta en ningún momento.

Sobre el entrenamiento no hay ningún dato: ni número de tokens, ni composición del corpus, ni si hubo RLHF, DPO o ajuste supervisado en este checkpoint concreto. El sufijo `dare-k30` apunta a la técnica DARE (*Drop And REscale*, Yu et al., 2024), que poda los vectores de tarea de un *fine-tune* descartando una fracción de sus deltas y reescalando el resto antes de fusionarlos con los pesos base; `k30` se interpretaría como una densidad en torno al 30 % de deltas retenidos. Es una hipótesis razonable, no un dato verificado: el autor no publica configuración de merge, ni los checkpoints de origen, ni la herramienta empleada (probablemente `mergekit`).

## Capacidades

- Generación de texto autoregresiva en inglés (idioma no declarado formalmente).
- Generación y completado de código, presumiblemente en lenguajes habituales (Python, JavaScript, etc.), por el sufijo `code` del identificador; sin evaluación publicada.
- Seguimiento de instrucciones conversacionales, heredado del componente *instruct* del merge.
- Razonamiento multi-turno dentro de la ventana de contexto de la arquitectura base.
- *Tool calling* / *function calling*: no documentado. Mistral-7B-Instruct-v0.1 y v0.2 no incorporan tokens especiales de invocación de herramientas (v0.3 sí); cualquier uso en agentes requeriría formateo manual por prompt y sería frágil.
- Uso en pipelines de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no declaradas; la base Mistral tiene cobertura parcial de francés, alemán, italiano y español, pero no hay garantía en este checkpoint.
- Modo *thinking*, visión, audio o cualquier modalidad adicional: no soportado.

## Casos de uso

- Prototipado rápido de asistentes de código en local: al ser un modelo de 7,24B, se puede cargar en una GPU de consumo con cuantización de 4 bits para probar flujos de autocompletado o explicación de código antes de comprometerse con un modelo mayor.
- Evaluación comparativa interna de técnicas de *merging*: útil como sujeto de experimento para medir si la fusión DARE entre un modelo instruct y uno de código degrada o preserva el seguimiento de instrucciones, siempre con un conjunto de evaluación propio.
- Generación de documentación técnica a partir de fragmentos de código, aprovechando el ajuste instruct; requiere validación humana por el riesgo de alucinación en APIs.
- Asistente de refactorización en entornos con requisitos de confidencialidad: al poder ejecutarse on-premise en una única GPU, permite procesar código propietario sin enviarlo a una API externa (con la salvedad legal de la licencia).
- Base para *fine-tuning* adicional sobre un dominio concreto (por ejemplo, un lenguaje interno o un estilo de código corporativo) mediante LoRA, dado el tamaño manejable del checkpoint.
- Generación de casos de prueba unitarios a partir de firmas de funciones, integrable en un pipeline de CI como paso de sugerencia no bloqueante.
- Traducción técnica y explicación de código entre lenguajes, con verificación posterior por el equipo.

En todos los casos, el modelo debe tratarse como no validado: no hay benchmarks, ni evaluación de calidad, ni garantías de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación completada (todas las secciones figuran como `[More Information Needed]`), el repositorio no enlaza a informes externos y el modelo acumula cero descargas en el momento de la consulta, por lo que no existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: ~14,5 GB solo para los pesos, más caché KV. Con la arquitectura Mistral 7B, la caché KV ocupa aproximadamente 128 KiB por token, es decir, ~1 GB adicional a 8.192 tokens de contexto. Presupuesto realista: 16-18 GB para una sola petición con contexto completo.
- VRAM con cuantización: ~7,7 GB en 8 bits; ~5,1 GB en Q5_K_M; ~4,4 GB en Q4_K_M; ~4,0 GB en Q4_0 (estimaciones para 7,24B parámetros, requieren conversión previa, ya que el repositorio solo contiene `safetensors`).
- GPU recomendadas: A100 40/80 GB, H100, L40S o L4 para servicio concurrente; RTX 4090 / RTX 3090 (24 GB) para bf16 en una sola tarjeta.
- GPU de consumo: sí. RTX 4090 y 3090 en bf16 con contexto moderado; RTX 4070 Ti / 3080 (12 GB) con cuantización de 4-5 bits; RTX 3060 (12 GB) y GPUs de 8 GB con Q4 y contexto recortado.
- Despliegue: `transformers` de forma nativa; vLLM y TGI (la etiqueta `endpoints_compatible` sugiere compatibilidad con Text Generation Inference / Inference Endpoints); llama.cpp u Ollama solo tras convertir a GGUF, paso que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuración de referencia; cualquier cifra habría que obtenerla midiendo sobre el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| `mistral-7b-instruct-code-dare-k30` (este) | 7,24B | 8.192 (según arquitectura base; no declarado) | No disponible | Solo `safetensors`; sin evaluación ni model card |
| Mistral-7B-Instruct-v0.2 | 7,24B | 32.768 | Apache 2.0 | Pesos oficiales, model card completa, ampliamente evaluado |
| CodeLlama-7b-Instruct | 6,74B | 16.384 | Llama 2 Community License (restricciones de uso) | Pesos oficiales de Meta, evaluado en benchmarks de código |
| Qwen2.5-Coder-7B-Instruct | 7,61B | 32.768 nativo (ampliable con YaRN) | Apache 2.0 | Pesos oficiales, variantes GGUF/AWQ/GPTQ publicadas, evaluación publicada |

La comparación relevante es de trazabilidad más que de rendimiento: los tres alternativas tienen model card completa, licencia explícita y evaluación publicada, mientras que este checkpoint no ofrece ninguna de las tres. No se dispone de datos de rendimiento de este modelo para comparar en MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- Licencia no declarada: en ausencia de licencia explícita, no hay cesión de derechos y el uso comercial es jurídicamente arriesgado. Aunque la base Mistral-7B-v0.1 se distribuye bajo Apache 2.0, el modelo derivado no hereda automáticamente esa licencia si el autor no la declara.
- Model card vacía: sin datos de entrenamiento, sin hiperparámetros, sin evaluación y sin lista de checkpoints de origen; imposible auditar qué contiene el merge.
- Riesgo de degradación por fusión: la poda DARE al ~30 % de densidad puede deteriorar el seguimiento de instrucciones o la coherencia si los vectores de tarea de los modelos de origen son incompatibles; no hay ninguna evaluación que lo descarte.
- Alucinación: riesgo estándar en modelos de 7B, agravado en generación de código (APIs, funciones y librerías inventadas) y sin métricas que permitan acotarlo.
- Sesgos: desconocidos. Se heredan los de los checkpoints de origen (no documentados), típicamente infrarrepresentación de lenguajes distintos del inglés y sesgos de los corpus web.
- Limitaciones de idioma: no se declara soporte de español; el rendimiento en castellano es una incógnita y no debería asumirse por la base Mistral.
- Contexto: 8.192 tokens en la arquitectura de referencia, sensiblemente inferior a los 32.768 de Mistral-7B-Instruct-v0.2 o Qwen2.5-Coder-7B.
- Sin mantenimiento: cero descargas y cero *likes* en el momento de la consulta; no hay issues resueltas ni historial de revisiones más allá de la creación y actualización inicial.
- Trazabilidad del código de entrenamiento: sin información sobre la procedencia del corpus de código, no puede descartarse la presencia de código con licencias restrictivas.
- La etiqueta `arxiv:1910.09700` del repositorio corresponde al artículo del calculador de impacto medioambiental (Lacoste et al., 2019) que aparece en la plantilla por defecto del Hub; no es una referencia al modelo y no debe citarse como paper del mismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShahriarFerdoush/mistral-7b-instruct-code-dare-k30
- Paper de Mistral 7B (arquitectura base presumible): https://arxiv.org/abs/2310.06825
- Modelo base presumible, Mistral-7B-Instruct-v0.2: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper de DARE, *Language Models are Super Mario: Absorbing Abilities from Homologous Models as a Free Lunch*: https://arxiv.org/abs/2311.03099
- Implementación de referencia de DARE en mergekit: https://github.com/arcee-ai/mergekit
- Referencia citada en la plantilla (calculador de impacto medioambiental, no relacionada con el modelo): https://arxiv.org/abs/1910.09700

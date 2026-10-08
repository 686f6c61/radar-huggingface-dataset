# IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF

## Resumen

VAL-APEX-I MiniPlus V3 es una cuantización GGUF del modelo Qwen/Qwen3.8-27B (27.320.697.856 parámetros) publicada por el usuario IsValorum en HuggingFace. No se trata de un entrenamiento nuevo, sino de una receta de cuantización quirúrgica que busca mantener la calidad percibida de un formato Q5-Q6 con un peso efectivo de 4,14 bits por peso y un fichero final de 14,16 GB. El resultado es un modelo de razonamiento en inglés que cabe en GPUs de 24 GB manteniendo un contexto declarado de hasta 256K tokens.

La relevancia técnica está en el tratamiento diferenciado de la topología híbrida del modelo base: 47 capas recurrentes DeltaNet SSM, 17 capas de atención cuadrática completa y 64 capas MLP SwiGLU densas reciben reglas de cuantización distintas (848 reglas en total), con los operadores de estado recurrente preservados en F32 sin comprimir para evitar la deriva acumulada del estado a lo largo de contextos largos. El autor reporta una perplejidad WikiText-2 de 6,1361 frente a 5,7942 del BF16 de referencia, es decir, un incremento del 5,90%.

El modelo se distribuye bajo licencia Apache 2.0, con pipeline de text-generation y plantilla conversacional basada en los delimitadores `<|im_start|>` y `<think>`. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente de las cifras publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 47 capas recurrentes DeltaNet SSM (atención lineal) + 17 capas de atención cuadrática completa + 64 capas MLP SwiGLU densas |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (según la model card del autor; no verificado en los metadatos de HuggingFace) |
| Tipos de cuantizacion | Mixta: F32 (operadores de estado SSM: ssm_a, ssm_conv1d, ssm_dt, ssm_norm), Q8_0 (ssm_alpha, ssm_beta), Q6_K (proyecciones de valor y salida, output.weight), IQ4_XS vector-calibrado (proyecciones down del MLP), esquema asimétrico Edge vs Core (proyecciones gate y up), Q4_0 como fallback de emergencia. Media efectiva: 4,14 BPW |
| Idiomas soportados | Inglés (en), según los metadatos del repositorio y la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B emplea una topología híbrida poco habitual: combina capas de atención lineal recurrente de tipo DeltaNet (SSM) con capas periódicas de atención cuadrática completa. La model card de esta edición describe la distribución exacta de tensores: 47 capas SSM recurrentes, 17 capas de atención cuadrática y 64 capas MLP densas con activación SwiGLU. Esta edición no entrena ni modifica pesos: aplica 848 reglas de cuantización sobre esa topología, calibradas con una matriz iMatrix de ISTA-DASLab de 4.096.000 tokens (1000 fragmentos de 4096 tokens).

El diseño de cuantización es asimétrico y preserva selectivamente los tensores críticos. Los operadores de estado recurrente (ssm_a, ssm_conv1d, ssm_dt, ssm_norm) se mantienen en F32 sin compresión para eliminar la deriva de acumulación de estado en contextos de hasta 256K tokens, mientras que las proyecciones de actualización recurrente (ssm_alpha, ssm_beta) se fijan en Q8_0 con un error declarado inferior al 0,005% frente a BF16 y ejecución SIMD rápida. Las proyecciones de valor y salida de las capas de atención cuadrática se protegen en Q6_K para no degradar el flujo residual, y output.weight se fija también en Q6_K para evitar corrupción de tokens de razonamiento y fallos en los delimitadores `<think>`. Las proyecciones down del MLP usan IQ4_XS calibrado por vectores para preservar valores atípicos de activación extremos, con un esquema asimétrico Edge vs Core en gate y up. Como red de seguridad, los tensores no mapeados o las capas residuales de draft MTP caen a Q4_0 en lugar de abortar la cuantización.

No se documenta en la información disponible ningún proceso de RLHF, DPO u otro ajuste posterior sobre esta edición, ni el volumen o composición del dataset de entrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional y de razonamiento en inglés, con modo de pensamiento explícito delimitado por `<think>` en la plantilla de chat.
- Razonamiento multi-paso sobre contextos extensos: la arquitectura base combina atención lineal recurrente con atención completa periódica, lo que en teoría permite manejar hasta 256K tokens con coste subcuadrático en la mayoría de capas.
- Procesamiento de documentos largos en una sola pasada, sin fragmentación, gracias a la ventana de contexto declarada.
- Ejecución local en llama.cpp con soporte de offload completo a GPU (`-ngl 99`).
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible` en los metadatos de HuggingFace).
- Capacidades de tool calling / function calling: no disponibles en la información proporcionada.
- Capacidades de agente y multi-step tool use: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; los metadatos solo declaran inglés.
- Capacidades de visión o audio: no disponibles; el pipeline es text-generation.
- Capacidades especiales confirmadas: ninguna adicional más allá del modo de razonamiento y la ventana de contexto larga.

## Casos de uso

- Análisis de documentación técnica extensa en local: con 256K tokens de contexto declarado, se puede cargar un manual completo, un informe de auditoría o un conjunto de especificaciones en una única pasada y hacer preguntas de razonamiento sobre el conjunto sin necesidad de recuperación por fragmentos. Adecuado cuando los datos no pueden salir de la infraestructura propia.
- Asistente de razonamiento offline en estación de trabajo: el fichero de 14,16 GB entra en GPUs de 24 GB, de modo que un equipo con RTX 3090 o RTX 4090 puede ejecutar el modelo con llama-server sin conexión a internet, útil en entornos con requisitos de confidencialidad.
- Revisión y resumen de registros de eventos (logs) de gran volumen: la ventana larga permite pasar trazas completas de un incidente y pedir correlación de eventos o hipótesis de causa raíz en un solo contexto.
- Generación de datos sintéticos en inglés: el modelo puede producir textos, preguntas y respuestas o razonamientos etiquetados para alimentar pipelines de evaluación o ajuste, ejecutándose íntegramente en hardware propio.
- Evaluación comparativa de técnicas de cuantización: al publicar la perplejidad WikiText-2 junto a la receta completa de reglas, sirve como punto de referencia reproducible para investigar el compromiso entre bits por peso y calidad en arquitecturas híbridas SSM/atención.
- Despliegue en servidor propio compatible con API de estilo OpenAI: la etiqueta `endpoints_compatible` y el soporte de llama.cpp permiten exponer el modelo como servicio interno y sustituir llamadas a APIs externas en aplicaciones de chat o razonamiento en inglés.
- Prototipado de aplicaciones de razonamiento en investigación: para experimentar con cadenas de pensamiento y ventanas de contexto largas sin depender de servicios en la nube ni de cuotas de uso.

## Benchmarks y rendimiento

La única métrica publicada es la perplejidad sobre WikiText-2, evaluada en una NVIDIA RTX PRO 6000 Ada con longitud de contexto 512, tamaño de lote 512 y 4 fragmentos.

| Modelo / cuantizacion | Tamano (GB) | Tamano (GiB) | WikiText-2 PPL | Delta vs BF16 | Delta % |
|---|---|---|---|---|---|
| BF16 de referencia (ground truth) | 54,65 | 50,90 | 5,7942 +/- 0,4531 | línea base | 0,00% |
| VAL-APEX-I MiniPlus V3 | 14,16 | 13,19 | 6,1361 +/- 0,4885 | +0,3419 | +5,90% |
| VAL-APEX-I NanoPlus V3 | 11,35 | 10,57 | 6,2577 +/- 0,5011 | +0,4635 | +8,00% |
| ISTA-DASLab GSQ-RCO IQ3_S | 11,80 | no disponible | 7,07 | no disponible | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de tareas en la información disponible. La perplejidad a 512 tokens de contexto no mide razonamiento, código ni matemáticas, y tampoco valida el comportamiento a 256K tokens, que es precisamente el escenario que la receta de cuantización dice proteger.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,5 GB con offload completo a GPU, según la model card.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (por ejemplo RTX 3090, RTX 4090 o RTX PRO 6000), donde el autor indica que queda margen para hasta 256K de contexto. En GPUs de 16 GB requeriría offload parcial de capas a CPU, configuración no documentada por el autor.
- GPUs de centro de datos: no se documenta soporte específico para A100 o H100 más allá de que, al ser GGUF sobre llama.cpp, pueden ejecutarlo. La evaluación publicada se realizó en una RTX PRO 6000 Ada.
- Opciones de despliegue: llama.cpp es el soporte explícito y documentado (ejemplo con `llama-cli` y `-ngl 99`). No se documenta soporte para vLLM, TGI, Ollama ni LM Studio en la información disponible.
- Latencia y throughput: no disponibles. El autor afirma que no hay tablas no lineales en la actualización recurrente DeltaNet, lo que permite aprovechar todo el rendimiento de los tensor cores, pero no publica cifras de tokens por segundo.
- Memoria adicional: a los 15,5 GB de pesos hay que sumar la caché KV correspondiente a la longitud de contexto configurada, cuyo tamaño no se especifica en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VAL-APEX-I MiniPlus V3 (esta edicion) | 27,32 mil millones | 256K (declarado) | GGUF, 14,16 GB, 4,14 BPW | WikiText-2 PPL 6,1361 (+5,90% vs BF16) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,32 mil millones | no disponible en la informacion proporcionada | safetensors, BF16, 54,65 GB | WikiText-2 PPL 5,7942 (referencia) | no disponible en la informacion proporcionada | HuggingFace |
| VAL-APEX-I NanoPlus V3 | 27,32 mil millones | 256K (declarado) | GGUF, 11,35 GB | WikiText-2 PPL 6,2577 (+8,00% vs BF16) | apache-2.0 | HuggingFace |
| ISTA-DASLab GSQ-RCO IQ3_S | 27,32 mil millones | 256K (declarado) | GGUF, 11,80 GB | WikiText-2 PPL 7,07 | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de otros modelos de la misma categoría fuera de las cuantizaciones del mismo modelo base, por lo que la comparación se limita a variantes de cuantización y al BF16 de referencia.

## Limitaciones y advertencias

- Idioma: los metadatos y la model card solo declaran inglés. No hay evidencia de calidad en castellano ni en otros idiomas, y la cuantización puede degradar de forma desigual el comportamiento multilingüe residual del modelo base.
- Evidencia empírica limitada: la única métrica publicada es perplejidad WikiText-2 a 512 tokens de contexto. No hay MMLU, HumanEval, GSM8K ni evaluaciones de razonamiento, código o matemáticas.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño, no cuantificado en la información disponible. La cuantización a 4,14 BPW puede incrementarlo en tareas de razonamiento largo, un efecto que la perplejidad no captura.
- Validación del contexto largo: el autor afirma que preservar los operadores SSM en F32 elimina la deriva de estado a 256K tokens, pero no publica ninguna medición de calidad a longitudes de contexto largas. Es una afirmación de diseño, no un resultado verificado.
- Fallback Q4_0: los tensores no cubiertos por las 848 reglas, incluidos los de capas draft MTP, se cuantizan a Q4_0. Esto evita fallos de conversión, pero puede degradar capas concretas de forma no documentada.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (8 de octubre de 2026). No existe revisión independiente, reproducción de los benchmarks ni informes de fallos por parte de terceros.
- Licencia: se declara apache-2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B, que no se detallan en la información proporcionada.
- Integración en producción: no se documenta soporte para tool calling, function calling, agentes ni multimodalidad, lo que limita su uso en pipelines que dependan de estas capacidades. La plantilla requiere el prefijo `<think>` para activar el modo de razonamiento según el ejemplo del autor.
- Compatibilidad de runtime: no se documenta soporte para vLLM, TGI, Ollama o LM Studio; el soporte explícito es llama.cpp.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio de la receta VAL-APEX-I: no disponible en la información proporcionada
- Matriz de calibración ISTA-DASLab iMatrix: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada

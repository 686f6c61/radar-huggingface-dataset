# Mia-AiLab/GLM-5.3-Flash-EXL3-3.5bpw

## Resumen

GLM-5.3-Flash-EXL3-3.5bpw es una cuantización EXL3 del modelo multimodal zai-org/GLM-5.3-Flash, publicada por Mia's AI Lab. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 78.147 millones de parámetros totales, pipeline image-text-to-text, pesos en safetensors y licencia Apache 2.0. El checkpoint ocupa 156,3 GB repartidos en 74 shards, frente a los 175,6 GB del hermano de 4 bpw del mismo autor.

La innovación de esta versión es la asignación no uniforme de bits: las proyecciones down de los expertos enrutados se mantienen a 4 bits, mientras que gate y up bajan a 3 bits en 32 de las 42 capas MoE, dando una media de 3,50 bits por peso en los expertos enrutados. Todo lo demás (atención, expertos compartidos, capas densas, embeddings, cabeza, torre de visión y expertos MTP) permanece en BF16 sin cambios respecto al modelo base.

Es relevante porque reduce un 11% el tamaño del checkpoint respecto al de 4 bpw a cambio de un aumento medible de la divergencia KL frente a BF16 (×1,60 en sesiones largas con thinking activo, ×1,72 en código y agentes, ×1,19 con thinking desactivado). El autor publica la metodología de medición de fidelidad, pero no benchmarks de tarea ni cifras de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con capas KDA y capa MTP |
| Parametros totales | 78.147.480.702 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las sesiones de evaluación llegan a 13,2k tokens) |
| Tipos de cuantizacion | EXL3 con codebook mcg y escalas de salida; 3,50 bits de media en expertos enrutados (down_proj a 4 bits; gate/up a 3 bits en 32 capas y a 4 bits en las capas 3, 23, 26, 27, 31, 32, 38, 40, 41 y 43); MTP capa 45 a 4 bits; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (74 shards, 156,3 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con torre de visión, expertos compartidos, capas densas y una capa MTP (multi-token prediction) en la posición 45. La cuantización EXL3 actúa exclusivamente sobre los expertos enrutados de las capas 3 a 44: 18.432 de las 37.152 matrices de expertos se almacenan a 3 bits. El resto de componentes conserva los pesos BF16 originales de zai-org/GLM-5.3-Flash-BF16 (revisión `a5b45eb4`), incluida la plantilla de chat `chat_template.jinja` de Z.ai. El fichero `quantization_config.json` detalla la anchura de cada tensor de experto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base. La model card de esta cuantización tampoco documenta el proceso de conversión más allá de indicar que las capas de 4 bits son una conversión nueva y no una copia del checkpoint de 4 bpw, lo que introduce una diferencia adicional no separada del efecto de la anchura de bits.

## Capacidades

- Generación de texto y razonamiento con modo thinking activable y desactivable.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text) mediante torre de visión en BF16.
- Generación de código y matemáticas, evaluadas en las sesiones de fidelidad del autor.
- Tool calling y function calling, incluidas conversaciones multi-step de uso de herramientas.
- Comportamiento agéntico multi-turno, con la mayor penalización de fidelidad observada en esta categoría (×2,11 en las 8 conversaciones cortas multi-step de tool use).
- Capacidades multilingües: el autor incluye conversaciones multilingües en el conjunto de evaluación, aunque no detalla los idiomas cubiertos.
- Predicción multi-token mediante la capa MTP 45.
- No se documentan capacidades de audio.

## Casos de uso

- Asistentes de código en producción: el modelo mantiene una KL de 0,00494 nats por token frente a BF16 en sesiones de código y agentes con thinking activo, suficiente para autocompletado y generación de parches donde se tolera una ligera deriva respecto al modelo completo.
- Agentes con tool calling multi-step: soporta conversaciones encadenadas de llamadas a herramientas; conviene validar la salida porque es la categoría con mayor pérdida de fidelidad (×2,11 en las conversaciones cortas multi-step).
- Análisis de documentos con imagen: la torre de visión en BF16 permite entrada image-text-to-text para extracción de datos de capturas, formularios o gráficos combinada con razonamiento textual.
- Razonamiento matemático con trazas largas: las sesiones de evaluación de 7,7k a 13,2k tokens incluyen matemáticas, y la ratio de KL se mantiene estable entre 1,55 y 1,65 en toda la profundidad del contexto, sin degradación creciente.
- Despliegue en hardware limitado frente al BF16: con 156,3 GB en lugar de los 175,6 GB del checkpoint de 4 bpw, permite servir el modelo en configuraciones multi-GPU donde el hermano mayor no entra, a costa de la fidelidad descrita.
- Chat multi-turno y atención al cliente: las conversaciones cortas de chat con thinking desactivado muestran diferencias dentro del ruido en los subconjuntos pequeños evaluados, lo que lo hace apto para diálogo general.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el impacto de bajar de 4 a 3,5 bpw en un MoE de 78B, con metodología de KL y top-1 reproducible documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que las puntuaciones de benchmark, la velocidad y el consumo de memoria aún no se han medido. Los únicos datos publicados son métricas de fidelidad frente al modelo BF16:

| Metrica | 4bpw sibling | Este quant (3.5bpw) |
|---|---|---|
| Anchura de expertos enrutados | 4 bits | 3,50 bits de media |
| Tamano del checkpoint | 175,6 GB | 156,3 GB |
| Shards safetensors | 83 | 74 |
| KL vs BF16, sesiones largas (7,7k-13,2k), thinking on | 0,00209 | 0,00335 (x1,60) |
| KL vs BF16, codigo y agentico, thinking on | 0,00288 | 0,00494 (x1,72) |
| KL vs BF16, thinking off | 0,261 | 0,312 (x1,19) |
| Top-1 agreement vs BF16, thinking on / off | 98,06% / 91,17% | 97,54% / 89,87% |

El autor advierte que las cifras de KL del hermano de 4 bpw en su propia model card se midieron contra la release FP8 sobre texto distinto y no son comparables con estas. La evaluación se realizó con exllamav3 1.6.1 sobre GPU RTX PRO 6000 Blackwell, con 140 conversaciones y bootstrap pareado de 2.000 remuestreos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 156,3 GB, por lo que requiere al menos esa capacidad agregada más overhead de contexto y caché KV; no se publican cifras de memoria en ejecución.
- GPU recomendadas: el autor midió con RTX PRO 6000 Blackwell; el hermano de 4 bpw se sirve con la receta TensorFold sobre 2× DGX Spark.
- Cabe en consumer GPU: no, un checkpoint de 156,3 GB no entra en ninguna GPU de consumo individual; requiere configuración multi-GPU o multi-nodo.
- Opciones de despliegue: exllamav3 (versión 1.6.1 usada en la medición) y la receta TensorFold del autor, aunque esta última no se ha probado sobre este checkpoint de 3,5 bpw. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que la velocidad aún no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-3.5bpw (este) | 78,1B | no disponible | EXL3 3,5 bpw, 156,3 GB | apache-2.0 | HuggingFace, 20 descargas |
| GLM-5.3-Flash-EXL3-4bpw-TensorFold | 78,1B | no disponible | EXL3 4 bpw, 175,6 GB | apache-2.0 | HuggingFace, servido con TensorFold |
| zai-org/GLM-5.3-Flash-BF16 | 78,1B | no disponible | BF16 | apache-2.0 | HuggingFace, referencia de fidelidad |
| zai-org/GLM-5.3-Flash | 78,1B | no disponible | pesos originales | apache-2.0 | HuggingFace, modelo base |

La comparación se limita a las variantes del mismo modelo base, ya que la información disponible no incluye alternativas de otros desarrolladores con parámetros o benchmarks equiparables.

## Limitaciones y advertencias

- La fidelidad frente a BF16 es mediblemente peor que la del checkpoint de 4 bpw: KL ×1,60 en sesiones largas con thinking, ×1,72 en código y agentes, y ×1,19 con thinking desactivado.
- La categoría más afectada es el tool calling multi-step, con una ratio de ×2,11 en las conversaciones cortas de uso de herramientas.
- Con thinking desactivado, la KL absoluta es unas 100 veces mayor que con thinking activo en ambas cuantizaciones, y la caída de top-1 agreement es la mayor de todas las condiciones (-1,30 puntos).
- Los tokens con KL superior a 0,1 nats pasan del 0,07% al 0,23% en sesiones de código y agentes con thinking.
- Parte de la diferencia puede provenir de la conversión y no solo de la anchura de bits: las capas de 4 bits son una conversión nueva que ya difiere ligeramente del hermano, y el autor no ha separado ambos efectos.
- No se han medido benchmarks de tarea, velocidad ni memoria de servicio; las cifras de fidelidad no equivalen a precisión en tareas.
- El soporte con TensorFold no se ha probado en este checkpoint, y su ruta de expertos a 3 bits no se ha ejecutado.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento de alucinación; el autor no publica análisis en ese sentido.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash.
- El checkpoint tiene 20 descargas y 0 likes, por lo que la validación comunitaria es prácticamente inexistente.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-3.5bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Referencia BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Hermano de 4 bpw: https://huggingface.co/Mia-AiLab/GLM-5.3-Flash-EXL3-4bpw-TensorFold
- Receta TensorFold (2× DGX Spark): https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks-TensorFold

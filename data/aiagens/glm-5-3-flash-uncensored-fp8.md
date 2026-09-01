# AIAgens/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una modificacion de pesos (abliteracion) del modelo GLM-5.3-Flash de Z.ai, publicada por el usuario AIAgens y desarrollada originalmente por dealignai bajo su marca "CRACK". El objetivo es eliminar de forma permanente el comportamiento de rechazo (refusals) del modelo base, que tendia a sobre-rechazar peticiones benignas, especialmente relacionadas con copyright. La modificacion esta aplicada directamente en los tensores, sin fine-tuning, LoRA, jailbreak por prompt ni hooks en runtime.

El modelo base es un MoE hibrido de 321.3 mil millones de parametros totales (18 mil millones activos por token) con arquitectura GLM-5.3-Flash (glm5_next), que combina atencion lineal KDA con atencion sparse estilo DeepSeek, incorpora un tower de vision GLM-4.1V y un cabezal de prediccion multi-token (MTP). La version FP8 utiliza cuantizacion block-wise e4m3, lo que permite velocidad nativa en GPUs Hopper (H100/H200). El contexto es de 1 millon de tokens.

La relevancia de este modelo radica en que ofrece un LLM de gran tamano sin restricciones de seguridad a nivel de pesos, manteniendo (segun los datos publicados) un rendimiento en MMLU ligeramente superior al base (87.33% frente a 86.74%). Es una opcion para investigadores y desarrolladores que necesitan un modelo sin filtros para tareas especificas, aunque con las implicaciones eticas y legales que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (glm5_next) - MoE hibrido con atencion lineal KDA y atencion sparse DeepSeek, tower de vision GLM-4.1V, cabezal MTP |
| Parametros totales | 321.323.031.390 (321,3 B; la model card redondea a 320 B) |
| Parametros activos | 18 B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (block-wise e4m3) |
| Idiomas soportados | en (segun la model card; el modelo base podria soportar mas, pero no se indica) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE hibrido que combina atencion lineal KDA (Kernel-based Dynamic Attention) con atencion sparse estilo DeepSeek, disenado para reducir el coste computacional manteniendo calidad. Incluye un tower de vision GLM-4.1V que permite procesamiento multimodal (imagen y texto) y un cabezal de prediccion multi-token (MTP) que acelera la decodificacion especulativa. El contexto es de 1 millon de tokens.

La version UNCENSORED no ha sido reentrenada: se trata de una edicion directa de los pesos del modelo base (abliteracion) que elimina los vectores de direccion asociados al rechazo. Segun la model card, no se utilizo fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de steering ni hooks personalizados. La edicion se aplico de forma conservadora para preservar la calidad, dejando intactos los modos de razonamiento "off" y "max effort" (recomendados), mientras que el modo "low effort" conserva algunos rechazos de forma deliberada.

## Capacidades

- Generacion de texto y razonamiento de proposito general con 18 B de parametros activos.
- Procesamiento multimodal: acepta entradas de imagen y texto gracias al tower de vision GLM-4.1V (la model card indica que la plantilla de chat multimodal correcta esta incluida).
- Decodificacion especulativa con MTP: el cabezal de prediccion multi-token alcanza una tasa de aceptacion del 75,9%, acelerando la generacion.
- Sin rechazos (uncensored): el modelo cumple el 100% de las 320 peticiones de HarmBench-320 en modo greedy y con parametros de muestreo recomendados (temperatura 1.0, top_p 0.95).
- Soporte de contexto largo de 1 millon de tokens, util para tareas que requieren ventanas extensas.
- No se menciona soporte explicito de tool calling o function calling en la informacion disponible, aunque el modelo base podria incluirlo; no se confirma.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: estudiar el comportamiento de rechazo y los efectos de la abliteracion en modelos de gran tamano, comparando respuestas con el modelo base.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones, dialogos o material que el modelo base rechazaria por politicas de seguridad, siempre que el uso sea legal y etico.
- Analisis de textos con derechos de autor: el modelo base rechazaba peticiones relacionadas con copyright; esta version permite trabajar con fragmentos protegidos en entornos de investigacion academica o legal.
- Desarrollo de agentes conversacionales con contexto muy largo: la ventana de 1M de tokens permite mantener historiales extensos en asistentes virtuales, chatbots de soporte o sistemas de recuperacion aumentada (RAG) con documentos completos.
- Aplicaciones multimodales: procesamiento conjunto de imagenes y texto en tareas como descripcion de imagenes, analisis de documentos escaneados o generacion de informes visuales.
- Despliegue en produccion con vLLM en GPUs Hopper: al ser FP8 nativo, puede ejecutarse con vLLM estandar sin modificaciones, alcanzando 163 tok/s de decodificacion (211 tok/s con MTP) en configuracion TP4 sobre H200.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos, comparando el modelo CRACK con el base FP8 (misma configuracion de logits, 1.026 preguntas):

| Metrica | Base FP8 | CRACK UNCENSORED FP8 | Diferencia |
|---|---|---|---|
| MMLU (global) | 86,74% | 87,33% | +0,59 pp |
| HarmBench-320 (cumplimiento, greedy) | no disponible | 320/320 (100%) | - |
| HarmBench-320 (muestreo, 6 comportamientos x5) | no disponible | 30/30 (100%) | - |

Velocidades en H200 con TP4 y FP8 nativo:

| Metrica | Valor |
|---|---|
| Decodificacion (single-stream) | 163 tok/s |
| Decodificacion con MTP especulativo | 211 tok/s |
| Prefill | ~19.400 tok/s |
| Tasa de aceptacion MTP | 75,9% |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 321,3 B parametros en FP8 ocupan aproximadamente 321 GB solo de pesos, mas overhead de activaciones y KV cache. Se requiere multiples GPUs.
- GPUs recomendadas: H100 o H200 (Hopper) para velocidad nativa FP8 con tensor cores. Las velocidades reportadas se obtuvieron con 4x H200 (TP4).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por el tamano del modelo; se necesitan servidores con multiples GPUs de datacenter.
- Opciones de despliegue: vLLM (soportado de forma nativa, sin modificaciones), posiblemente TGI o llama.cpp si se convierte a GGUF, aunque la cuantizacion FP8 esta optimizada para Hopper.
- Latencia y throughput: con TP4 en H200, decodificacion de 163 tok/s (211 con MTP) y prefill de ~19.400 tok/s, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | MMLU |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 321,3 B | 18 B | 1M | FP8 | MIT | 86,74% |
| GLM-5.3-Flash-UNCENSORED-FP8 (este) | 321,3 B | 18 B | 1M | FP8 | MIT | 87,33% |
| DeepSeek-V3 (referencia MoE) | 671 B | 37 B | 128K | BF16/FP8 | MIT | ~88,5% (no verificado) |

No se dispone de datos comparativos directos con otros modelos "uncensored" (como Dolphin o WizardLM) en la informacion proporcionada. La comparativa con DeepSeek-V3 se incluye como referencia de categoria, pero los datos de MMLU no estan confirmados en las fuentes consultadas.

## Limitaciones y advertencias

- La model card advierte que el modo de razonamiento "low effort" conserva algunos rechazos de forma deliberada; solo los modos "off" y "max effort" (por defecto) estan completamente desinhibidos.
- El modelo solo declara soporte para ingles (en); no se garantiza rendimiento en otros idiomas.
- Al ser una modificacion de pesos sin reentrenamiento, no se ha evaluado su comportamiento en tareas fuera de MMLU y HarmBench; puede haber degradacion en otras capacidades no medidas.
- Riesgo de alucinacion inherente a todos los LLM, posiblemente agravado al eliminar los mecanismos de rechazo que tambien filtraban contenido falso o peligroso.
- La eliminacion de guardrails puede generar contenido ilegal, ofensivo o danino. El uso comercial debe evaluar responsabilidades legales y eticas.
- No es un modelo oficial de Z.ai; es una modificacion de terceros sin soporte del fabricante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; la fiabilidad de la publicacion no esta contrastada por la comunidad.
- La licencia MIT permite uso comercial, pero el contenido generado puede infringir derechos de autor u otras normativas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/AIAgens/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Mirror del autor original (dealignai): https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Articulo de ExplainX sobre el modelo: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Pagina de Ollama para GLM-5.3-Flash: https://ollama.com/library/glm-5.3-flash
- Receta de vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash

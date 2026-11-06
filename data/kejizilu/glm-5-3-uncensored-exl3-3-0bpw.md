# kejizilu/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantización EXL3 en formato exl3 de 3.0 bits por peso del modelo dealignai/GLM-5.3-UNCENSORED-FP8, que a su vez es una edición de pesos (sin fine-tuning) del GLM-5.3 original de Z.ai. La publica el usuario kejizilu como artefacto de despliegue, no como modelo entrenado: el objetivo es permitir servir un modelo MoE de gran tamaño en hardware limitado reduciendo el peso del checkpoint de FP8 a aproximadamente 3 bits por peso.

El modelo subyacente es un transformer MoE con arquitectura GlmMoeDsaForCausalLM, 753.000 millones de parámetros totales, 256 expertos enrutados (8 activos) más un experto compartido, atención MLA con indexador disperso DSA y 78 capas más una capa MTP (multi-token prediction) que puede usarse como borrador especulativo. La cuantización incluye esa capa MTP y está pensada para servirse con ExLlamaV3/TabbyAPI mediante reparto por capas entre GPUs.

Es relevante porque demuestra que un MoE de 753B puede servirse con pérdida de fidelidad moderada (KL de 0,089 frente al FP8 de origen, perplejidad 3,440 frente a 3,302) en 8x A100 40GB, y porque documenta con detalle dos problemas prácticos: el impacto de la cuantización en tareas agénticas (tau2-bench) y un fallo del parser de tool calling que afecta a parámetros de tipo string.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (transformer MoE con atención MLA e indexador disperso DSA) |
| Parametros totales | 753B según model card; 146.311.635.584 según safetensors del repo (discrepancia no aclarada) |
| Parametros activos | 8 expertos enrutados de 256 + 1 compartido (número absoluto de parámetros activos no disponible) |
| Longitud de contexto | 65.536 tokens configurados en TabbyAPI; caché compartida probada de 98.304 tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 3.0 bpw (`-b 3.0 --hq`), media 3,04 bpw; atención y expertos compartidos a 5 bpw, MLP densos a 4, expertos enrutados a 3, lm_head a 6, codebook `mul1`; capa MTP a 4 bpw en expertos y 6 en atención |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (librería exllamav3) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 256 expertos enrutados con 8 activos por token más un experto compartido, 78 capas más una capa MTP adicional. La atención es MLA (multi-head latent attention) con un indexador disperso DSA, un mecanismo de atención dispersa que reduce el coste de contexto largo. El modelo no ha sido entrenado por el autor de esta ficha: es una cuantización del checkpoint FP8 de dealignai, que a su vez aplica una edición de pesos sobre GLM-5.3 de Z.ai documentada en `CRACK_SURGERY.json` (copiado sin cambios del repo de origen). No hay información disponible sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información proporcionada.

La innovación técnica de esta ficha es la propia cuantización EXL3, realizada con ExLlamaV3 en el commit `d3739fd`, con calibración por defecto (250 filas de 2048 tokens) y lectura directa del checkpoint FP8. Se incluye la capa MTP cuantizada de forma no calibrada, utilizable como borrador especulativo con `draft_mode: mtp` en TabbyAPI. La fidelidad medida con `eval/model_diff.py` sobre 20 filas de 2048 tokens de wikitext-2 test da una divergencia KL de 0,089 (cuantizado frente a FP8) y 0,097 (FP8 frente a cuantizado), con KL por token de mediana 0,021 y p90 0,221; en el 44 % de tokens donde el FP8 asigna probabilidad al top ≥ 0,95, la KL mediana baja a 0,0011.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base GLM-5.3.
- Razonamiento con modo de pensamiento activable (`reasoning: true` en la configuración de TabbyAPI).
- Tool calling / function calling con formato de herramientas `glm4_7`, aunque con el caveat documentado del parser (ver limitaciones).
- Uso como modelo agente: evaluado en tau2-bench en los dominios airline y retail.
- Decodificación especulativa mediante la capa MTP incluida en la cuantización.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de gran escala en clústeres modestos: con 273 GiB de pesos y reparto por capas (`gpu_split_auto`) se sirve en 8x A100 40GB, lo que permite operar un modelo de 753B en un nodo de 8 GPUs en lugar de requerir hardware de mayor VRAM por GPU.
- Agentes de atención al cliente con tool calling: el modelo ejecuta flujos de reserva y consulta de pedidos (dominios airline y retail de tau2-bench) con Pass^1 de 0,640 en airline y 0,482 en retail; requiere corregir antes el parser para preservar parámetros string.
- Generación aumentada por recuperación con contexto largo: la ventana configurada de 65.536 tokens y la caché compartida de 98.304 tokens permiten inyectar documentación extensa o historiales de conversación largos en una sola petición.
- Inferencia interactiva de baja latencia relativa: el uso de la capa MTP como borrador especulativo acelera la decodificación frente a generación token a token sin borrador, a costa de VRAM adicional para el draft.
- Evaluación de robustez de cuantizaciones: el repo publica métricas de divergencia KL y perplejidad frente al FP8 de origen, útiles como referencia para decidir si 3 bpw es suficiente en una tarea concreta antes de adoptarlo en producción.
- Experimentación con modelos sin censura: al derivar de una edición de pesos de dealignai, sirve para investigar comportamiento del modelo sin las capas de rechazo del original, siempre con las salvaguardas y políticas de uso que exija el despliegue.
- Servicio de razonamiento por lotes: con razonamiento activado y contexto de 64K, adecuado para tareas de análisis de documentos largos donde el throughput importa más que la latencia por petición.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La referencia es GLM-5.3 original (no la edición sin censura) servido en FP8 por Z.ai vía OpenRouter con el mismo harness, por lo que la diferencia mezcla la edición de pesos y la cuantización. tau2-bench, Pass^1, temperatura 1.0, top_p 0.95; simulador de usuario y jueces GPT-4.1 a temperatura 0.

| Dominio | GLM-5.3 FP8 (Z.ai) | Esta cuantización | Diferencia |
|---|---|---|---|
| airline (50 tareas x 2 intentos) | 0,710 ± 0,045 | 0,640 ± 0,048 | -0,070 (~1,1 EE) |
| retail (114 tareas) | 0,504 ± 0,033 (2 intentos) | 0,482 ± 0,047 (1 intento) | -0,022 (~0,4 EE) |

Por intento: airline baseline 0,740 / 0,680, cuantizado 0,600 / 0,680; retail baseline 0,465 / 0,544, cuantizado 0,482. El autor indica que ninguna diferencia es estadísticamente significativa con estos tamaños de muestra y que la estimación puntual de airline debe tratarse como una posible regresión pequeña, no medida.

| Métrica de fidelidad (wikitext-2 test, 20x2048) | Valor |
|---|---|
| KL (cuantizado ‖ FP8) | 0,089 |
| KL (FP8 ‖ cuantizado) | 0,097 |
| KL por token, mediana / p90 | 0,021 / 0,221 |
| Perplejidad cuantizado / FP8 | 3,440 / 3,302 |
| KL mediana donde FP8 top-prob ≥ 0,95 (44 % de tokens) | 0,0011 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- Tamaño del repo: 292,8 GB; pesos cuantizados: 273 GiB.
- Configuración probada por el autor: 8x A100 40GB con reparto por capas (`gpu_split_auto`) en TabbyAPI, `max_seq_len: 65536` y `cache_size: 98304`.
- VRAM estimada: los 273 GiB de pesos deben repartirse entre las GPUs; la caché de 98.304 tokens consume VRAM adicional no cuantificada en la información disponible.
- No cabe en GPUs de consumo individuales (RTX 4090, 24 GB) ni en configuraciones de 2-4 GPUs de consumo; requiere un nodo multi-GPU de centro de datos.
- Despliegue: ExLlamaV3 mediante TabbyAPI (backend `exllamav3`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato EXL3.
- Decodificación especulativa con `draft_mode: mtp` disponible en TabbyAPI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-EXL3-3.0bpw (esta ficha) | 753B (MoE, 8 de 256 activos) | 65.536 configurados | EXL3 3,0 bpw, 273 GiB | MIT | Hugging Face, exllamav3 |
| dealignai/GLM-5.3-UNCENSORED-FP8 (base directo) | 753B | no disponible | FP8 | MIT | Hugging Face |
| zai-org/GLM-5.3 (original) | 753B | no disponible | pesos originales | MIT | Hugging Face |
| kejizilu/GLM-5.3-UNCENSORED-EXL3 (otras variantes bpw) | 753B | no disponible | EXL3, otras tasas de bits | MIT | Hugging Face (repo del mismo autor) |

No se dispone de datos de benchmarks de los modelos comparables dentro de la información proporcionada, salvo la referencia FP8 de Z.ai en tau2-bench recogida en la tabla de rendimiento.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card declara 753B totales, mientras que los safetensors del repo suman 146.311.635.584 parámetros; conviene verificar el dato antes de planificar hardware o citarlo.
- Regresión potencial en tareas agénticas: la estimación puntual de tau2-bench airline cae 0,070 respecto al FP8 de referencia, aunque no es estadísticamente significativa con 50 tareas y 2 intentos.
- Fallo conocido de tool calling: GLM escribe los argumentos como texto plano (`<arg_value>9523456873</arg_value>`) y el parser `glm4_5` de TabbyAPI (commit `be74bf0`) decodifica a JSON sin consultar el esquema de la herramienta, convirtiendo parámetros string con aspecto numérico (IDs de pedido y producto, códigos postales) en enteros. En tau2-bench retail esto provocó el fallo de aproximadamente el 70 % de las llamadas a herramientas; es necesario modificar el parser para mantener como texto los parámetros cuyo tipo de esquema sea `string`. La evaluación publicada se ejecutó con esa corrección aplicada.
- El modelo es una edición de pesos sin censura: no incorpora los mecanismos de rechazo del GLM-5.3 original, lo que traslada al despliegue la responsabilidad de filtrado y políticas de uso.
- Pérdida de fidelidad por cuantización: perplejidad 3,440 frente a 3,302 del FP8 y KL p90 de 0,221 por token; en colas de distribución la divergencia es mayor que la mediana.
- La capa MTP está cuantizada sin calibrar, lo que puede afectar a la calidad del borrador especulativo.
- Idiomas soportados no documentados; no se puede garantizar el comportamiento en castellano sin evaluación propia.
- El repositorio no está afiliado a dealignai ni a Z.ai; el soporte y la trazabilidad dependen de terceros.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) publicados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/kejizilu/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Modelo base (FP8): https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3
- Documentación de la edición de pesos: `CRACK_SURGERY.json` en el repositorio
- Script de evaluación de fidelidad: `eval/model_diff.py` en el repositorio
- ExLlamaV3 (commit `d3739fd`): no disponible en la información proporcionada
- TabbyAPI (parser `glm4_5`, commit `be74bf0`): no disponible en la información proporcionada

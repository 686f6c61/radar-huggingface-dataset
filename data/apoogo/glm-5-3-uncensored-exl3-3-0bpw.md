# aPOogo/GLM-5.3-UNCENSORED-EXL3-3.0bpw

## Resumen

GLM-5.3-UNCENSORED-EXL3-3.0bpw es una cuantización EXL3 de 3 bits por peso (bpw) del modelo dealignai/GLM-5.3-UNCENSORED-FP8, que a su vez es una edición de pesos (sin fine-tuning) del GLM-5.3 original de Z.ai. La publica el usuario aPOogo bajo licencia MIT y está pensada para servirse con ExLlamaV3 (TabbyAPI), no con las pilas habituales de transformers o llama.cpp. El modelo base es un transformer disperso de tipo mezcla de expertos (MoE) con atención MLA y un indexador disperso DSA, orientado a generación de texto, razonamiento y uso agéntico.

El interés práctico de esta ficha está en su tamaño y en el compromiso que ofrece: el checkpoint original declara 753.000 millones de parámetros totales, pero el repositorio cuantizado ocupa 273 GiB y el autor reporta que se sirve en 8 GPU A100 de 40 GB con reparto por capas. Es, por tanto, una vía para ejecutar un modelo de escala frontier en hardware de centro de datos modesto, a costa de una pérdida de fidelidad medible frente al checkpoint FP8 de referencia.

La relevancia ahora mismo es doble: por un lado, demuestra que las cuantizaciones EXL3 de 3 bpw son viables en modelos MoE de este tamaño; por otro, incluye una capa MTP (multi-token prediction) que actúa como borrador especulativo y un aviso técnico muy concreto sobre el parseo de argumentos de tool calling que conviene leer antes de desplegarlo en producción. Hay que tener en cuenta que la información disponible es la model card del autor: no hay datos de benchmarks generales ni de composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE disperso con atención MLA e indexador DSA) |
| Parametros totales | 753.000 millones (según model card); 146.311.635.584 reportados por los safetensors del repo |
| Parametros activos | 8 expertos enrutados de 256 + 1 compartido (número absoluto de parámetros activos no disponible) |
| Longitud de contexto | 65.536 tokens configurados en el ejemplo de servicio; caché compartida de 98.304 tokens; máximo nativo no disponible |
| Tipos de cuantizacion | EXL3 3,04 bpw media (atención y expertos compartidos a 5 bpw, MLP densos a 4 bpw, expertos enrutados a 3 bpw, lm_head a 6 bpw, codebook mul1); capa MTP a 4/6 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (librería exllamav3) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 78 capas más una capa MTP adicional. Cada capa enruta tokens hacia 256 expertos, de los que se activan 8, más un experto compartido siempre activo. La atención es de tipo MLA (multi-head latent attention) con un indexador disperso DSA que selecciona qué posiciones atender, lo que reduce el coste del contexto largo. La capa MTP está pensada para decodificación especulativa: el propio modelo propone tokens candidatos que luego se verifican, y en TabbyAPI se activa con `draft_mode: mtp`.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el GLM-5.3 original; la model card de esta cuantización no los detalla. Lo que sí se documenta es el proceso de cuantización: conversión con ExLlamaV3 en el commit `d3739fd`, calibración por defecto de 250 filas de 2048 tokens, lectura directa del checkpoint FP8 y asignación de bits diferenciada por tipo de tensor. La edición "uncensored" del modelo base es una modificación de pesos documentada en `CRACK_SURGERY.json`, no un fine-tuning, y este repositorio no está afiliado ni a dealignai ni a Z.ai.

La fidelidad frente al FP8 de origen se midió con `eval/model_diff.py` sobre 20 filas de 2048 tokens de wikitext-2 test: divergencia KL cuantizado‖FP8 de 0,089 y FP8‖cuantizado de 0,097, KL por token con mediana 0,021 y p90 0,221, perplejidad de 3,440 frente a 3,302 del FP8, y KL mediana de 0,0011 en el 44 % de tokens donde el FP8 tiene probabilidad top ≥ 0,95. Es decir, la cuantización es casi indistinguible en tokens de alta confianza y se desvía en la cola.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 65.536 tokens en la configuración probada).
- Razonamiento explícito: el ejemplo de servicio activa `reasoning: true`, lo que habilita modo de pensamiento antes de la respuesta.
- Tool calling y function calling: el formato de herramientas es `glm4_7`, con argumentos emitidos como texto crudo entre etiquetas `<arg_value>`.
- Uso agéntico multi-paso: evaluado en tau2-bench en los dominios de aerolínea y retail, que requieren encadenar llamadas a herramientas con estado.
- Decodificación especulativa mediante la capa MTP integrada, que acelera la generación sin un modelo borrador separado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; la model card no los menciona y las etiquetas del repo no los incluyen.

## Casos de uso

- Agentes de atención al cliente con herramientas: el modelo puede mantener conversaciones largas y encadenar consultas a APIs de pedidos o reservas; su evaluación en tau2-bench retail y airline lo sitúa directamente en ese escenario. Requiere corregir antes el parser de argumentos para no romper las llamadas.
- Automatización de back-office con identificadores: extracción y validación de números de pedido, códigos postales o referencias, siempre que el parser respete el esquema y entregue los parámetros de tipo string como texto. Sin ese ajuste, el propio autor reporta un 70 % de fallos en tool calls en retail.
- Asistentes de razonamiento largo: análisis de documentos extensos o expedientes que quepan en 65.536 tokens, aprovechando el indexador DSA para reducir el coste de atención sobre contexto largo.
- Generación de código con razonamiento previo: el modo `reasoning` permite obtener una traza de planificación antes del parche; encaja en pipelines internos donde se revise la salida antes de aplicarla.
- Despliegue en clústeres de GPU de gama media-alta: al ocupar 273 GiB y repartirse por capas, es viable en 8×A100 40 GB, lo que permite ofrecer un modelo de escala frontier como servicio interno sin adquirir nodos H100.
- Investigación sobre cuantización extrema: sirve como caso de estudio reproducible de EXL3 a 3 bpw en un MoE grande, con métricas de divergencia KL y perplejidad publicadas frente al FP8 de origen.
- Experimentación con contenido sin filtros: la edición "uncensored" está pensada para entornos de investigación donde se necesita estudiar el comportamiento del modelo sin rechazos, siempre bajo las salvaguardas legales y éticas del despliegue.

## Benchmarks y rendimiento

Los únicos datos publicados son de tau2-bench (Pass^1), con temperatura 1,0 y top_p 0,95 para el modelo, y GPT-4.1 como simulador de usuario y juez. La referencia es GLM-5.3 original servido en FP8 por Z.ai vía OpenRouter con el mismo arnés, de modo que la diferencia mezcla la edición de pesos y la cuantización.

| Dominio | GLM-5.3 FP8 (Z.ai) | Esta cuantización | Diferencia |
|---|---|---|---|
| airline (50 tareas × 2 intentos) | 0,710 ± 0,045 | 0,640 ± 0,048 | -0,070 (~1,1 EE) |
| retail (114 tareas) | 0,504 ± 0,033 (2 intentos) | 0,482 ± 0,047 (1 intento) | -0,022 (~0,4 EE) |

Por intento: airline 0,740 / 0,680 en la referencia frente a 0,600 / 0,680 en la cuantización; retail 0,465 / 0,544 frente a 0,482. El autor señala que ninguna diferencia es estadísticamente significativa con estos tamaños de muestra y que la estimación puntual de airline debe tratarse como una posible regresión leve, no como una regresión medida.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Tamaño en disco y en memoria: 273 GiB de pesos EXL3; el repositorio completo ocupa 292,8 GB.
- Configuración probada por el autor: 8×A100 40 GB con reparto automático por capas (`gpu_split_auto`) en TabbyAPI, `max_seq_len: 65536` y `cache_size: 98304`.
- VRAM: no cabe en ninguna GPU de consumo actual; requiere un nodo multi-GPU. El reparto por capas permite usar GPUs de 40 GB en lugar de 80 GB.
- GPUs recomendadas: A100 40 GB en número de 8 como mínimo según la prueba publicada; H100 o H200 reducirían el número de tarjetas necesarias, aunque no hay mediciones publicadas con ellas.
- Opciones de despliegue: ExLlamaV3 a través de TabbyAPI. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato EXL3.
- Latencia y throughput: no disponibles. La capa MTP activada como borrador especulativo debería mejorar el throughput de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Rendimiento agéntico |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-EXL3-3.0bpw (este) | 753B totales, 8+1 expertos activos | 65.536 configurado | MIT | EXL3, TabbyAPI | tau2 airline 0,640; retail 0,482 |
| GLM-5.3 original (FP8, Z.ai) | 753B totales | no disponible | MIT | FP8, servicio propietario | tau2 airline 0,710; retail 0,504 |
| dealignai/GLM-5.3-UNCENSORED-FP8 | 753B totales | no disponible | MIT | FP8 | no disponible |
| Otras cuantizaciones EXL3 del mismo modelo base | 753B totales | no disponible | MIT | EXL3 | no disponible |

No se dispone de datos de benchmarks generales para establecer comparaciones con modelos de otras familias y tamaño similar; la comparación fiable se limita al linaje GLM-5.3.

## Limitaciones y advertencias

- El parser de herramientas de TabbyAPI (`glm4_5` en el commit `be74bf0`) decodifica como JSON todos los valores sin consultar el esquema, por lo que identificadores numéricos llegan como enteros; en tau2-bench retail esto provocó fallos en cerca del 70 % de las llamadas. Hay que forzar que los parámetros de tipo string se mantengan como texto crudo.
- La edición "uncensored" elimina filtros del modelo original; es responsabilidad del despliegue aplicar moderación y cumplimiento normativo.
- Pérdida de fidelidad medible frente al FP8: perplejidad 3,440 frente a 3,302 y divergencia KL de 0,089 en wikitext-2; la cola de tokens de baja confianza es donde más se nota.
- Posible regresión leve en tareas agénticas de airline (-0,070, ~1,1 error estándar), no concluyente pero a vigilar en producción.
- El número de parámetros declarado en la model card (753B) no coincide con el recuento de los safetensors del repo (146,3B); conviene verificar la configuración real antes de dimensionar hardware.
- Sin información sobre idiomas soportados ni sobre sesgos; no hay evaluación de alucinación publicada.
- El formato EXL3 limita el despliegue a ExLlamaV3/TabbyAPI; no es portable a otras pilas sin reconversión.
- La licencia MIT se hereda del modelo base, pero el uso comercial de una variante sin censura puede chocar con normativa sectorial; revísalo antes de integrarla.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aPOogo/GLM-5.3-UNCENSORED-EXL3-3.0bpw
- Modelo base cuantizado: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3
- ExLlamaV3 (librería de cuantización e inferencia): no disponible en la información proporcionada
- TabbyAPI (servidor de inferencia): no disponible en la información proporcionada

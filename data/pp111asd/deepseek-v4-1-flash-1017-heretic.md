# pp111asd/DeepSeek-V4.1-Flash-1017-heretic

## Resumen

DeepSeek-V4.1-Flash-1017-heretic es una modificación no oficial del modelo multimodal DeepSeek-V4.1-Flash-1017, publicada por el usuario pp111asd. El cambio consiste en una ablación direccional del comportamiento de rechazo (refusal behaviour) aplicada sobre la proyección de salida de la atención (`attn.wo_b.weight`) en los bloques 2 a 39, siguiendo el método de la herramienta Heretic. El resto de los pesos se mantiene idéntico byte a byte al modelo base: expertos enrutados y compartidos, tablas Engram, torre de visión, capas MTP/DSpark, escalas de bloque y tokenizer.

El modelo base es un transformer multimodal de tipo Mixture-of-Experts con 763.205.315.794 parámetros totales almacenados en safetensors (511,9 GB de repositorio), pesos nativos en FP8 con expertos enrutados en FP4 y una ventana de contexto de 262.144 tokens según la configuración de servicio recomendada. Está pensado para investigación en seguridad autorizada, no como un modelo de propósito general sin supervisión.

Su relevancia es doble: por un lado, demuestra la viabilidad técnica de eliminar el comportamiento de rechazo con una intervención mínima (38 tensores editados, 1,6 GB de parche) manteniendo la estructura de carga del modelo original; por otro, expone las limitaciones del método, ya que la divergencia KL sobre prompts benignos (0,136) indica que el comportamiento general se ha desplazado y no se han ejecutado benchmarks de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Mixture-of-Experts (MoE) con torre de visión, capas MTP/DSpark y tablas Engram |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de servicio recomendada) |
| Tipos de cuantizacion | FP8 (pesos de atención y compartidos), FP4 (expertos enrutados); sin cuantizaciones GGUF publicadas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo FP8/FP4); parche adicional en `patch/` (1,6 GB) y `ablation_directions.pt` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek-V4.1-Flash-1017: un transformer MoE con atención y expertos compartidos en FP8, expertos enrutados almacenados en FP4, torre de visión para entrada image-text-to-text y capas MTP/DSpark. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni las fases de RLHF o DPO del modelo base, por lo que esos datos deben consultarse en la ficha oficial de DeepSeek.

La modificación aplicada es una ablación direccional: se calcula una dirección por bloque como la diferencia entre la media del residual stream de 400 instrucciones dañinas y 400 benignas en el último token del prompt (con el razonamiento cerrado), proyectando fuera la media benigna. Los pesos editados se recodifican sobre la rejilla FP8 para cancelar la componente en esa dirección columna a columna, con una fuerza de 2,5. Se modificaron 38 tensores (todos `layers.N.attn.wo_b.weight` en bloques 2–39); a diferencia de la ablación de la release anterior, no se edita el experto compartido porque solo aumentaba la divergencia KL sin reducir los rechazos. Los expertos enrutados quedan intactos porque su almacenamiento FP4 no admite una edición de este tamaño.

## Capacidades

- Generación de texto conversacional multi-turno con razonamiento explícito (modo thinking, etiquetas `<think>`).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante torre de visión.
- Razonamiento multi-paso y cadenas de pensamiento extensas (mediana de 1.517 tokens de finalización en el conjunto de evaluación con razonamiento activado).
- Soporte de tool calling y function calling mediante el parser `deepseekv41` en SGLang.
- Comportamiento de rechazo ablacionado: 0 rechazos en el conjunto de búsqueda y 1 de 100 en el conjunto reservado en modo chat.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Salidas largas estables: 0 de 128 salidas largas rotas (bucles o repeticiones de caracteres) en la prueba del autor.

## Casos de uso

- Investigación en seguridad de modelos: evaluar la robustez de los mecanismos de rechazo del modelo base comparando el comportamiento del original y esta variante ablacionada sobre conjuntos como `mlabonne/harmful_behaviors` o JailbreakBench.
- Red teaming autorizado: probar la eficacia de filtros y clasificadores de contenido externos en entornos controlados, aprovechando que el modelo ya no rechaza por sí mismo y obliga a que la capa de seguridad sea externa.
- Análisis de alineación y divergencia: estudiar el impacto de una intervención de 38 tensores sobre la distribución de salida mediante la métrica KL (0,136 sobre prompts benignos) y comparar con ediciones más agresivas.
- Despliegue de referencia multimodal en SGLang: servir el modelo con TP4 + EP4 y contexto de 262.144 tokens para cargas de trabajo image-text-to-text en infraestructura propia, usando los parsers `deepseek-v41` y `deepseekv41`.
- Generación de documentación técnica extensa: las pruebas del autor muestran 48 de 128 salidas largas alcanzando el límite de 12.000 tokens sin roturas, útil para prosa larga, código y tablas Markdown.
- Reproducción de metodología de ablación: aplicar el parche de `patch/` sobre el checkpoint base con el script incluido para verificar los resultados del autor o adaptar la fuerza de ablación (1,75, 2,0, 2,5, 3,0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor lo indica explícitamente. Las únicas métricas publicadas son las de comportamiento de rechazo y divergencia KL:

| Metrica | Base | Attention 2.5 (este modelo) |
|---|---|---|
| Rechazos, conjunto de busqueda (100 prompts) | 98 | 0 |
| Rechazos, conjunto reservado (100 prompts) | 97 | 1 |
| Divergencia KL (primer token, 100 prompts benignos) | 0 | 0,136 |
| Rechazos con razonamiento activo, reservado (100 prompts, limite 6.000 tokens) | 92 | 1 |
| Mediana de tokens de finalizacion en esos prompts | 357 | 1.517 |
| Razonamiento repetitivo | 0 | 0 |
| Salidas largas rotas / 128 | 0 | 0 |
| Salidas largas que alcanzan el limite de 12.000 tokens / 128 | 53 | 48 |

Otras combinaciones medidas por el autor: atención 1,75 (16 rechazos, KL 0,109), atención 2,0 (3 rechazos, KL 0,125), atención 3,0 (0 rechazos, KL 0,160), atención 1,5 + experto compartido 1,0 (10 rechazos, KL 0,202), atención 2,0 + experto compartido 1,0 (2 rechazos, KL 0,222) y atención 2,5 + experto compartido 1,0 (1 rechazo, KL 0,247).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 511,9 GB en formato nativo FP8/FP4; se requiere un pool de GPUs con al menos esa capacidad agregada más overhead de activaciones y caché KV para 262.144 tokens.
- Configuración validada por el autor: SGLang con TP4 + EP4 (4 GPUs en tensor parallel y 4 en expert parallel). TP4 sin EP4 falla porque 2304/4 no es múltiplo de 128.
- GPUs recomendadas: no especificadas en la información disponible; por el volumen de pesos, se necesitan nodos multi-GPU de clase datacenter (A100/H100 o superiores) con interconnect de alta velocidad.
- Cabe en GPU consumer: no, con 511,9 GB de pesos en formato nativo no es viable en una única GPU de consumo.
- Opciones de despliegue: SGLang con la imagen `lmsysorg/sglang:dev-dsv41` y los parsers `deepseek-v41` (reasoning) y `deepseekv41` (tool calling). Sin el parser de razonamiento, las etiquetas `<think>` se filtran al contenido.
- Latencia y throughput: no disponibles. El autor reporta que, con razonamiento activo, la mediana de tokens de finalización pasa de 357 a 1.517, lo que implica un coste de generación sustancialmente mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (reservado) | KL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | 763.205.315.794 | 262.144 | 97/100 | 0 | MIT | HuggingFace (oficial) |
| DeepSeek-V4.1-Flash-1017-heretic (este) | 763.205.315.794 | 262.144 | 1/100 | 0,136 | MIT | HuggingFace (no oficial) |
| DeepSeek-V4.1-Flash-heretic (release anterior) | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace (pqhaz) |

No se dispone de datos de benchmarks de capacidad para comparar con alternativas de la misma categoría; la comparación se limita al comportamiento de rechazo y la divergencia KL reportados por el autor.

## Limitaciones y advertencias

- Modelo no oficial: no está publicado por DeepSeek y no cuenta con su respaldo ni validación.
- Eliminación deliberada del comportamiento de rechazo: no debe desplegarse como asistente de propósito general sin capas de seguridad externas; el autor lo restringe a investigación en seguridad autorizada en entornos propios o con permiso.
- Desplazamiento del comportamiento general: KL de 0,136 sobre prompts benignos indica que la distribución de salida ha cambiado; no se ejecutaron benchmarks de capacidad para cuantificar el impacto.
- Evaluación limitada: los juicios en modo chat se basan en los primeros 48 tokens generados, lo que indica si la respuesta empieza pero no si es completa o correcta.
- Expertos enrutados sin editar: la ablación no toca los expertos enrutados por limitaciones del almacenamiento FP4, por lo que el comportamiento puede no estar completamente alineado con la intención del parche.
- Coste de inferencia elevado: el razonamiento activado multiplica por más de cuatro la mediana de tokens de finalización (357 a 1.517).
- Requisitos de infraestructura estrictos: TP4 simple falla; es obligatorio TP4 + EP4 y el parser de razonamiento para evitar fugas de `<think>`.
- Idiomas soportados no documentados en esta ficha; deben consultarse en el modelo base.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero las consideraciones éticas y legales del uso de un modelo sin rechazo recaen sobre el desplegador.
- Riesgo de alucinación: no evaluado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pp111asd/DeepSeek-V4.1-Flash-1017-heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Release anterior ablacionada: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-heretic
- Heretic (método): https://github.com/p-e-w/heretic
- Organización DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Conjunto de evaluación `mlabonne/harmful_behaviors`: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Juez LLM utilizado: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic

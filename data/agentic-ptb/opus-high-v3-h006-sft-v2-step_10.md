# agentic-ptb/opus-high-v3.h006.sft-v2.step_10

## Resumen

`agentic-ptb/opus-high-v3.h006.sft-v2.step_10` es un checkpoint intermedio generado durante el run `opus-high-v3` del proyecto AgentPTB, una iniciativa que utiliza agentes de Claude Code para ejecutar experimentos de fine-tuning de forma automatizada. Este checkpoint concreto corresponde a la hora de ejecución `h006` y al paso 10 de un pipeline de SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y se distribuye en formato safetensors con licencia Apache-2.0. Su relevancia es principalmente metodológica: la propia model card advierte de que el run no encontró ninguna mejora en los pesos entrenados, por lo que se trata de un resultado negativo retenido con fines de reproducibilidad y estudio cualitativo. No debe interpretarse como un modelo con capacidades mejoradas respecto a su base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (no especificados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se construye sobre `Qwen/Qwen3.5-9B-Base`, un modelo transformer denso de aproximadamente 9,4 mil millones de parametros. No se dispone de detalles adicionales sobre la arquitectura interna (tipo de atencion, capas, etc.) en la informacion proporcionada.

El entrenamiento corresponde a un pipeline de SFT ejecutado por un agente de Claude Code dentro del proyecto AgentPTB, en su celda `opus-high-v3`. El run alcanzo la hora `h006` y produjo este checkpoint en el paso 10. Segun la model card, el run no encontro ninguna mejora en los pesos entrenados; de hecho, el indice del proyecto indica que runs similares (como `opus-high-v2`) fueron abortados por regresiones en los cinco runs de SFT. No se especifican ni el dataset utilizado ni el numero de tokens de entrenamiento.

## Capacidades

- No se han documentado capacidades especificas para este checkpoint mas alla de las heredadas del modelo base `Qwen3.5-9B-Base`.
- Al ser un checkpoint intermedio sin mejora verificada, no se puede afirmar que posea capacidades adicionales de razonamiento, generacion de codigo o tool calling.
- No se ha publicado informacion sobre soporte de agentes, multilingue o vision.
- La unica funcionalidad confirmada es la de servir como artefacto de estudio para analizar fallos de entrenamiento y reproducibilidad.

## Casos de uso

- Estudio de reproducibilidad de experimentos de fine-tuning: permite a investigadores comparar la evolucion de los pesos a lo largo de un run fallido y entender donde se producen las regresiones.
- Analisis de resultados negativos en IA: sirve como caso documentado de un experimento que no logro mejorar el modelo base, util para metodologia de investigacion.
- Auditoria de pipelines automatizados de entrenamiento: puede usarse para verificar que el agente de Claude Code ejecuto correctamente los pasos de SFT, aunque el resultado no fuera positivo.
- Comparacion cualitativa de checkpoints intermedios: permite estudiar como cambian las representaciones internas durante un entrenamiento que no converge.
- Depuracion de infraestructura de entrenamiento: si se sospecha un problema en el entorno, este checkpoint puede servir para rastrear el estado de los tensores en un momento concreto.
- No se recomienda su uso en aplicaciones de produccion, generacion de texto, codigo o atencion al cliente, dado que no hay evidencia de mejora sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ningun otro test estandarizado. Dado que el run se considera un resultado negativo, no se espera que este checkpoint supere al modelo base en ninguna tarea.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 19 GB (para 9,4 mil millones de parametros).
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 10 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 5 GB.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100, RTX 4090 (24 GB) para FP16; GPUs consumer de 12-16 GB podrian ejecutarlo con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se genere una cuantizacion GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles, al no haberse publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h006.sft-v2.step_10 | 9,4 B | no disponible | Apache-2.0 | Checkpoint intermedio sin mejora |
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | Apache-2.0 | Modelo base de referencia |
| Otros checkpoints de AgentPTB (p.ej. opus-high-v1) | 9,4 B | no disponible | Apache-2.0 | Resultados negativos o abortados |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. La unica comparacion relevante es con el modelo base, del cual este checkpoint es una derivacion sin mejoras demostradas.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un run que no encontro mejora en los pesos; no debe usarse como modelo final.
- La model card advierte explicitamente de que no se debe inferir calidad a partir de su publicacion.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma, pero al ser una derivacion de Qwen3.5-9B-Base, hereda las limitaciones de dicho modelo.
- No se ha validado su comportamiento en tareas reales; cualquier uso en produccion seria bajo su propio riesgo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido evaluado por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero la falta de garantias de rendimiento lo desaconseja para entornos productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h006.sft-v2.step_10
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Busqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb

# agentic-ptb/opus-high-v3.h040.soup-bags

## Resumen

`agentic-ptb/opus-high-v3.h040.soup-bags` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, generado durante un run de entrenamiento automatizado del proyecto AgentPTB (run `opus-high-v3`, hora `h040`). El proyecto utiliza agentes basados en Claude Code para ejecutar pipelines de fine-tuning y registra los checkpoints intermedios con fines de reproducibilidad y estudio cualitativo.

La model card del autor es explícita en su interpretación: se trata de un checkpoint intermedio/derivado que **no muestra ninguna mejora en los pesos entrenados** y que no debe utilizarse para inferir calidad del modelo. No es un modelo final ni un producto listo para uso en producción. Su interés es exclusivamente metodológico, como artefacto de un experimento de entrenamiento con resultados negativos.

Con 9.409.813.744 parámetros (~9,4B), hereda la arquitectura del modelo base Qwen3.5-9B, aunque no se dispone de detalles adicionales sobre modificaciones, contexto o capacidades específicas más allá de lo que ofrece el propio modelo base. La licencia Apache-2.0 permite uso comercial, pero su naturaleza de checkpoint negativo lo desaconseja para cualquier aplicación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponibles (solo safetensors en fp32/fp16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parametros. No se ha publicado ninguna modificacion arquitectonica propia del checkpoint; es un artefacto del proceso de entrenamiento supervisado (SFT) ejecutado por el agente.

El run `opus-high-v3` formaba parte de un pipeline automatizado de fine-tuning. Segun la informacion disponible, el run concluyo que **no se produjo ninguna mejora en los pesos entrenados** respecto al modelo base. Ademas, en un run anterior (`opus-high-v2`, run `a-rerun`) se aborto el proceso porque los cinco intentos de SFT regresaron los tensores del modelo base sin cambios. Esto sugiere que el proceso de entrenamiento no logro converger ni producir actualizaciones utiles.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, ni el uso de tecnicas como RLHF o DPO. El repositorio de datos asociado (`agentic-ptb/opus-high-v3-data`) podria contener mas detalles, pero no se han encontrado especificaciones publicas.

## Capacidades

- No se han documentado capacidades especificas para este checkpoint.
- Al estar basado en Qwen3.5-9B-Base, heredaria las capacidades genericas del modelo base (generacion de texto, razonamiento, codigo), pero no hay evidencia de que este checkpoint las mantenga o mejore.
- No se ha verificado soporte de tool calling, agentes ni multilingue en este checkpoint concreto.
- El autor advierte explicitamente que no se debe inferir calidad de la publicacion del checkpoint.

## Casos de uso

Dado el caracter experimental y los resultados negativos documentados, este modelo **no es adecuado para ningun caso de uso practico**. Los unicos usos razonables son:

- Reproduccion de experimentos: investigadores que quieran replicar el pipeline de AgentPTB pueden usar este checkpoint para verificar el estado intermedio del run `h040`.
- Estudio de fallos de entrenamiento: analisis de por que el fine-tuning no produjo mejoras, comparando los tensores con el modelo base.
- Investigacion metodologica: como ejemplo de checkpoint negativo en pipelines automatizados de entrenamiento.
- Auditoria de reproducibilidad: verificacion de que el run se ejecuto correctamente y que los checkpoints intermedios son consistentes.
- Comparacion de pesos: estudio de la divergencia (o ausencia de ella) entre el checkpoint y el modelo base.
- Desarrollo de herramientas de monitorizacion: uso como caso de prueba para detectar entrenamientos fallidos en pipelines automatizados.

Para cualquier tarea de generacion, razonamiento o codigo en produccion, se recomienda usar directamente `Qwen/Qwen3.5-9B-Base` o modelos afinados validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Dado que el propio autor declara que el run no produjo mejoras, es muy probable que el rendimiento sea identico o inferior al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

No se dispone de requisitos oficiales publicados para este checkpoint. Como estimacion basada en el tamano de 9,4B parametros:

- VRAM estimada para inferencia en fp16: aproximadamente 19 GB (9,4B x 2 bytes). Esto cabe en una GPU de 24 GB como RTX 3090, RTX 4090 o A10G.
- En cuantizacion int8 (si se aplicara): aproximadamente 9,4 GB, cabe en GPUs de 12-16 GB.
- En cuantizacion int4 (si se aplicara): aproximadamente 4,7 GB, cabria en GPUs de 8 GB, aunque no hay archivos GGUF ni AWQ publicados.
- No se ha probado con vLLM, llama.cpp, Ollama ni TGI; no hay informacion de latencia ni throughput.
- Para uso real, se recomienda descargar el modelo base directamente, que tiene soporte estandar en los frameworks habituales.

## Comparativa con modelos similares

No disponible. No se han publicado resultados comparativos con otros modelos. Dado que es un checkpoint intermedio sin mejoras verificadas, no tiene sentido compararlo con alternativas como Llama 3.1 8B, Mistral 7B o el propio Qwen3.5-9B-Base. La comparativa relevante seria entre el checkpoint y su modelo base, pero no hay datos publicos al respecto.

## Limitaciones y advertencias

- **Checkpoint negativo**: el autor declara explicitamente que el run no produjo ninguna mejora en los pesos entrenados. No debe usarse como si fuera un modelo afinado.
- **Naturaleza intermedia**: es un artefacto de reproducibilidad, no un modelo final. Su existencia no implica calidad ni utilidad.
- **Sesgos y alucinaciones**: al heredar el comportamiento del modelo base, presentaria los mismos sesgos y riesgos de alucinacion que Qwen3.5-9B-Base, aunque sin verificacion propia.
- **Sin documentacion de capacidades**: no hay especificaciones de contexto, idiomas ni capacidades tecnicas para este checkpoint concreto.
- **Idiomas no especificados**: no se ha indicado que idiomas soporta; se asume que los del modelo base, pero sin confirmacion.
- **Uso en produccion desaconsejado**: no hay ningun motivo tecnico para desplegar este checkpoint en un entorno real. Usar el modelo base o un fine-tuning validado.
- **Licencia Apache-2.0**: permite uso comercial, pero la ausencia de valor funcional hace irrelevante esa ventaja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h040.soup-bags
- Dataset asociado del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

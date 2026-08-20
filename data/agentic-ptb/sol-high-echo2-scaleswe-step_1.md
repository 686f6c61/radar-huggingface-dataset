# agentic-ptb/sol-high.echo2-scaleswe.step_1

## Resumen

El modelo `agentic-ptb/sol-high.echo2-scaleswe.step_1` es un checkpoint intermedio generado por el proyecto AgentPTB, un pipeline de barrido (sweep) de entrenamiento para agentes de codificacion. Este checkpoint concreto pertenece a la celda `sol-high`, impulsada por el driver Codex / gpt-5.6-sol con un nivel de razonamiento `high`. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y cuenta con 9.409.813.744 parametros, lo que lo situa en la gama de los 9B. El repositorio ocupa 18.8 GB y contiene los pesos en formato safetensors.

La relevancia de este modelo radica en que es un artefacto intermedio de un experimento de escalado de agentes (ScaleSWE), no un modelo final listo para produccion. Su interes principal es para investigadores que quieran analizar el comportamiento de checkpoints intermedios en pipelines de entrenamiento agéntico. No se dispone de informacion sobre licencia, idiomas soportados ni longitud de contexto, lo que limita su uso directo en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5-9B-Base (transformer decoder-only, no confirmado) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, aunque no se especifican los detalles de la arquitectura interna (numero de capas, dimensiones, atencion, etc.). Al tratarse de un checkpoint intermedio de un sweep de AgentPTB, se infiere que el entrenamiento se realizo con un pipeline orientado a tareas de agente y codificacion, probablemente con datos del conjunto ScaleSWE. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

La unica innovacion tecnica destacable es la configuracion de razonamiento de alto esfuerzo (`effort: high`) del driver, que sugiere que el modelo fue entrenado para generar cadenas de razonamiento extensas antes de responder. Sin embargo, no hay documentacion adicional sobre tecnicas de atencion, decodificacion especulativa u otras optimizaciones.

## Capacidades

No se han documentado capacidades especificas para este checkpoint. Dado que se basa en Qwen3.5-9B-Base, es razonable esperar que herede capacidades generales de generacion de texto, razonamiento y codificacion, pero no hay evidencia verificada. La model card no menciona soporte para tool calling, agentes, vision ni audio. El unico dato relevante es la advertencia sobre el token `eos_token_id` faltante, que afecta a la terminacion de las respuestas.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Al ser un checkpoint intermedio de un experimento de investigacion, su aplicacion principal seria:

- Evaluacion de checkpoints intermedios en pipelines de entrenamiento agéntico.
- Analisis comparativo de la evolucion del rendimiento a lo largo del sweep.
- Reproduccion de experimentos de escalado de agentes (ScaleSWE).
- Investigacion sobre el efecto del razonamiento de alto esfuerzo en modelos de 9B.
- Pruebas de compatibilidad con frameworks de inferencia para modelos de tamano medio.
- Estudio de la influencia del token de fin de secuencia en la generacion.

No se recomienda su uso en produccion sin un re-empaquetado previo que corrija el token `eos` y sin una evaluacion exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. Ademas, la advertencia sobre el token `eos` faltante indica que cualquier evaluacion realizada con este checkpoint sin corregir seria una cota inferior, no una medicion fiable.

## Requisitos de hardware

Dado el tamano de 9.409.813.744 parametros y el peso del repositorio (18.8 GB), se pueden estimar los siguientes requisitos:

- VRAM estimada para inferencia en FP16: ~18.8 GB (coincide con el tamano del repo).
- VRAM estimada en cuantizacion de 8 bits: ~9.4 GB.
- VRAM estimada en cuantizacion de 4 bits: ~4.7 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) o RTX 4080 (16 GB) para 8 bits; GPUs con 8 GB o mas para 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se corrija el token `eos` y se adapte el formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria. El unico punto de referencia es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual se desconoce su rendimiento en benchmarks publicos. No se puede establecer una comparativa fiable sin informacion adicional.

## Limitaciones y advertencias

- El token `eos_token_id` esta configurado como `[248044]`, pero falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga la generacion al final de cada turno y pueda desbordar la ventana de contexto.
- Es un checkpoint intermedio, no un modelo final. Su rendimiento puede ser inferior al de un modelo completamente entrenado.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de idioma.
- La licencia no esta especificada, por lo que el uso comercial es incierto y requiere contacto con el autor.
- No se recomienda su uso en produccion sin un re-empaquetado y una evaluacion exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.echo2-scaleswe.step_1
- Repositorio ScaleSWE: https://github.com/AweAI-Team/ScaleSWE
- Leaderboard de modelos agénticos (BenchLM): https://benchlm.ai/agentic
- Informacion sobre GPT-5.6 Sol (driver del sweep): https://openai.com/index/gpt-5-6/ y https://openai.com/index/previewing-gpt-5-6-sol/
- SWE-Bench Pro: https://scaleapi.github.io/SWE-bench_Pro-os/

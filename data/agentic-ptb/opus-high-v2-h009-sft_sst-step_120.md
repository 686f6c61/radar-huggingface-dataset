# agentic-ptb/opus-high-v2.h009.sft_sst.step_120

## Resumen

Este checkpoint, publicado por el usuario agentic-ptb, es un artefacto intermedio del proyecto AgentPTB, concretamente de la celda opus-high-v2, que utiliza Claude Code con claude-opus-5 a esfuerzo alto para generar datos de entrenamiento. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parametros (~9,4B) y pesos en formato safetensors.

La model card es inusualmente transparente: el propio autor advierte que este checkpoint no es bueno. Todos los runs SFT de esta celda regresaron respecto a los tensores base, y el artefacto que se presenta como resultado final es el modelo base sin modificaciones. El checkpoint sft_sst step_120 se publica porque fue producido y medido, no porque sea util: el mejor de los SFT obtuvo un 17,2% frente al 29,1% del modelo base en 285 tareas pareadas de swe-bench-verified. El modelo tiene 0 descargas y 0 likes, y su rol declarado es intermedio, no final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5, basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| eos_token_id | [248044, 248046] |
| Rol | intermedio (no final) |
| Fecha de creacion | 2026-08-23 |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-9B-Base, un transformer denso de ~9,4B parametros. El entrenamiento consistio en un ajuste fino supervisado (SFT) realizado como parte de la celda opus-high-v2 del proyecto AgentPTB, que emplea Claude Code con claude-opus-5 a esfuerzo alto para generar los datos de entrenamiento. El checkpoint corresponde al paso 120 del run sft_sst, escrito en la hora h009 de un run de 100 horas.

Segun la model card, todos los runs SFT de esta celda regresaron frente a los tensores base. El artefacto final presentado por el autor es base_real, que es el modelo Qwen/Qwen3.5-9B-Base sin ningun tensor modificado y solo dos archivos de configuracion corregidos. Los checkpoints sft_* se publican por transparencia y trazabilidad, no porque representen una mejora. El autor remite al archivo SUBMISSION.md del run record antes de comparar este modelo contra cualquier otro.

## Capacidades

- El modelo hereda las capacidades del modelo base Qwen/Qwen3.5-9B-Base, pero el SFT ha degradado su rendimiento medido en swe-bench-verified.
- No se documentan capacidades especificas adicionales en la model card (ni tool calling, ni vision, ni thinking mode).
- El autor recomienda explicitamente no usar este checkpoint y usar en su lugar el modelo base sin modificaciones.
- Los idiomas soportados no estan documentados en la informacion disponible.

## Casos de uso

Dado que el propio autor advierte que este checkpoint regreso respecto al modelo base, no se recomienda su uso en ningun escenario de produccion. Los casos de uso realistas se limitan al ambito de la investigacion:

- Investigacion sobre regresion en SFT: el checkpoint permite estudiar por que el ajuste fino supervisado degrada el rendimiento en tareas de agente, un fenomeno documentado en esta celda.
- Reproducibilidad de experimentos: el proyecto publica el run record y el indice para permitir la trazabilidad completa del experimento, incluyendo este checkpoint intermedio.
- Punto de referencia negativo en evaluaciones: puede usarse como ejemplo de regresion en pipelines de entrenamiento agente, comparando su 17,2% frente al 29,1% del base.
- Analisis de degradacion de capacidades: util para estudiar que habilidades concretas se pierden durante el SFT en modelos de ~9B.
- Comparacion de tecnicas de regularizacion: sirve como caso de estudio para evaluar metodos que eviten la regresion en SFT.
- Auditoria de pipelines de entrenamiento: el checkpoint documenta un fallo real de entrenamiento, valioso para validar herramientas de monitorizacion y evaluacion continua.

Para cualquier caso de uso real, el autor recomienda usar Qwen/Qwen3.5-9B-Base directamente.

## Benchmarks y rendimiento

| Benchmark | sft_sst step_120 (mejor SFT) | Qwen3.5-9B-Base (base) |
|---|---|---|
| swe-bench-verified (285 tareas pareadas) | 17,2% | 29,1% |

El dato proviene de la model card: el mejor de los checkpoints SFT de esta celda obtuvo un 17,2% frente al 29,1% del modelo base en 285 tareas pareadas de swe-bench-verified. No se han publicado otros benchmarks en la informacion disponible. No se dispone de datos especificos de este checkpoint concreto, solo del mejor SFT de la celda.

## Requisitos de hardware

- VRAM estimada para inferencia: ~19 GB en bf16 (2 bytes por parametro, consistente con el tamano del repo de 18,8 GB), ~10 GB en cuantizacion de 8 bits, ~5-6 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 40GB o H100 para bf16 sin restricciones; RTX 4090 (24GB) puede ejecutar el modelo en bf16 con margen ajustado; RTX 3090 o RTX 4090 para cuantizaciones de 8 o 4 bits.
- El modelo cabe en GPUs de consumo (RTX 3090/4090) con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos de la familia Qwen, aunque no se documenta soporte especifico para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | swe-bench-verified | Licencia |
|---|---|---|---|---|
| agentic-ptb/opus-high-v2.h009.sft_sst.step_120 | 9,4B | no disponible | 17,2% (mejor SFT) | no disponible |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | 29,1% | no disponible |

La comparativa se limita al modelo base, que es la referencia directa y el artefacto que el autor recomienda usar. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que este checkpoint regreso frente al modelo base: el SFT degrada el rendimiento en lugar de mejorarlo.
- No es apto para uso en produccion. El autor recomienda usar Qwen/Qwen3.5-9B-Base sin modificaciones.
- La licencia no esta especificada, por lo que no se puede confirmar el uso comercial.
- Los idiomas soportados no estan documentados.
- El modelo tiene 0 descargas y 0 likes; es un artefacto de investigacion, no un modelo de proposito general.
- El rol declarado es intermedio, no final; el artefacto final de la celda es el modelo base sin tensores modificados.
- Riesgo de alucinacion y sesgos: no documentados, pero heredados del modelo base y potencialmente alterados por el SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v2.h009.sft_sst.step_120
- Run record: https://huggingface.co/agentic-ptb/opus-high-v2-record
- Indice del proyecto: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Busqueda de modelos agentic-ptb en HuggingFace: https://huggingface.co/models?other=agentic-ptb

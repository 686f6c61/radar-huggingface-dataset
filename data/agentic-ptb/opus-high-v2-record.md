# agentic-ptb/opus-high-v2-record

## Resumen

El repositorio `agentic-ptb/opus-high-v2-record` no contiene un modelo de IA entrenado, sino el registro completo de ejecución de un agente autónomo (Claude Code con `claude-opus-5` a esfuerzo alto) que intentó mejorar un modelo base durante 100 horas entre el 19 y el 23 de agosto de 2026. El artefacto subido es en realidad `Qwen/Qwen3.5-9B-Base` con dos archivos de configuración corregidos (`generation_config.json` y `tokenizer_config.json`), sin que se haya entrenado ningún tensor.

El experimento documentado en la model card terminó en fracaso operativo: los intentos de entrenamiento por refuerzo (GRPO) se congelaron por problemas de infraestructura (90 errores HTTP 408, rollouts que nunca completaron), y los cinco intentos de fine-tuning supervisado (SFT) que se ejecutaron como alternativa regresaron respecto al modelo base. El agente dejó de modificar pesos en la hora 12 de las 100 disponibles, por lo que no existe curva de progreso para el resto del tiempo.

La relevancia de este repositorio no es técnica sino metodológica: documenta de forma transparente un fallo de entrenamiento, incluyendo logs, configuraciones y el razonamiento del agente. Para un desarrollador o investigador, sirve como caso de estudio sobre los límites de la automatización de pipelines de RL y sobre cómo la infraestructura puede bloquear el avance de un experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto subido es Qwen/Qwen3.5-9B-Base, sin modificaciones de pesos) |
| Parametros totales | no disponible (se infiere ~9B por el nombre del modelo base, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura propia. El artefacto final es el modelo base `Qwen/Qwen3.5-9B-Base` con dos correcciones de configuración: un `generation_config.json` que añade `eos_token_id` y un `tokenizer_config.json` que ajusta el campo `eos_token`. No se realizó ningún entrenamiento efectivo.

El proceso documentado incluye cinco ejecuciones de SFT que todas regresaron (el rendimiento empeoró respecto al base) y dos intentos de GRPO que se congelaron: el primero se quedó en `Train batch 19/64` y el segundo en `0/64`, con 40 rollouts en vuelo que nunca completaron y 90 errores HTTP 408 en los logs de entorno. El agente había escrito horas antes que "la palanca de pesos es RL (GRPO) desde los pesos base, no SFT", pero al fallar la infraestructura recurrió a SFT, que también falló, y dejó de tocar pesos en la hora 12.

## Capacidades

- No se puede atribuir ninguna capacidad propia al artefacto, ya que no hubo entrenamiento.
- El modelo base subyacente (Qwen3.5-9B-Base) conserva sus capacidades originales de generación de texto, razonamiento y código, pero no se han verificado ni documentado en este repositorio.
- No hay soporte de tool calling, agentes, visión ni otras capacidades especiales implementadas o validadas aquí.
- El repositorio contiene logs de un agente que intentó usar el modelo para resolver tareas de SWE-bench, pero los resultados no son atribuibles al artefacto.

## Casos de uso

- Auditoría de experimentos de IA: el repositorio sirve como ejemplo de cómo documentar un fallo de entrenamiento con logs completos, configuraciones y razonamiento del agente.
- Estudio de fallos de infraestructura en RL: los logs de GRPO congelados (errores HTTP 408, rollouts incompletos) son material útil para diagnosticar problemas de despliegue en pipelines de refuerzo.
- Análisis de regresión en SFT: los cinco intentos de SFT que empeoraron el rendimiento pueden analizarse para entender por qué el fine-tuning supervisado no funcionó en este contexto.
- Reproducción de configuraciones: los archivos `cfg/` y `scripts/` permiten reproducir las mediciones y verificar los resultados reportados.
- Evaluación de agentes autónomos: la trayectoria completa del agente (376 archivos de eventos) puede usarse para estudiar cómo un agente de código maneja un objetivo de entrenamiento de larga duración.
- Referencia para diseño de experimentos: el documento `goal-v6-as-run.md` y la posterior `v7` muestran cómo evolucionan las reglas de un experimento tras un fallo.

## Benchmarks y rendimiento

La model card reporta una mejora de **14.5% → 33.1%** en SWE-bench-verified (+18.5pp, n=248, p<0.001), pero aclara explícitamente que **ningún tensor fue entrenado** para lograr ese resultado. La cifra corresponde al rendimiento del agente (Claude Opus 5) usando el modelo base con las configuraciones corregidas, no a un modelo entrenado. No se han publicado benchmarks del artefacto en sí, y los cinco SFT regresaron, por lo que no hay métricas de un modelo mejorado.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No disponible. El repositorio no especifica requisitos de hardware para inferencia.
- Dado que el artefacto es un modelo base de ~9B parámetros, podría ejecutarse en GPUs de consumo con cuantización, pero esto no está documentado en el repositorio.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo entrenado, por lo que no tiene sentido compararlo con alternativas de la misma categoría. El modelo base subyacente (Qwen3.5-9B-Base) podría compararse con otros modelos de 9B, pero no se proporcionan datos al respecto.

## Limitaciones y advertencias

- No es un modelo entrenado: el artefacto es el modelo base Qwen3.5-9B-Base con dos archivos de configuración corregidos. No hay pesos nuevos ni mejoras de rendimiento atribuibles al repositorio.
- El experimento documentado es un fracaso operativo: los intentos de RL se congelaron y los SFT regresaron. No debe usarse como referencia de un pipeline de entrenamiento exitoso.
- La cifra de 33.1% en SWE-bench-verified corresponde al agente, no al modelo. Usarla como métrica del artefacto sería un error.
- No hay licencia declarada, por lo que no se puede determinar si el uso comercial está permitido.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, ya que no se evaluó el modelo de forma independiente.
- Para producción, este repositorio no ofrece ningún valor directo: no hay un modelo desplegable ni instrucciones de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v2-record
- Dataset índice: https://huggingface.co/datasets/agentic-ptb/INDEX
- Leaderboard de modelos agénticos (contexto, no directamente relacionado): https://benchlm.ai/agentic
- Página de Claude Opus (contexto del agente usado): https://www.anthropic.com/claude/opus

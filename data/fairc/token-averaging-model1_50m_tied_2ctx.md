# FAIRC/token-averaging-model1_50m_tied_2ctx

## Resumen

Este repositorio contiene un checkpoint de investigación del proyecto **token averaging** de FAIRC. Se trata de un volcado de pesos (`final.pt`) de un modelo de 50 millones de parámetros (según el nombre del run `model1_50m_tied_2ctx`), junto con un registro de pérdidas (`loss_log.csv`). No se trata de un modelo listo para usar con `transformers`, sino de un artefacto experimental para estudiar técnicas de promediado de tokens durante el entrenamiento.

La información pública es muy limitada: no se especifica arquitectura, datos de entrenamiento, licencia ni capacidades. El checkpoint debe cargarse manualmente con PyTorch y requiere reconstruir la arquitectura desde `config.json` o desde el código fuente del proyecto. Su relevancia actual es principalmente académica, como referencia para investigadores que trabajen en métodos de promediado de tokens o arquitecturas tipo OLMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se menciona `OLMAveraged` / `OLMTransformerBody` en el código de carga) |
| Parametros totales | ~50 millones (inferido del nombre del run, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el sufijo `2ctx` sugiere contexto de 2, pero no se confirma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`checkpoints/final.pt`) con `state_dict` crudo, no safetensors ni GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura del modelo. El nombre del proyecto ("token averaging") sugiere que se investiga una técnica de promediado de representaciones de tokens, posiblemente aplicada a un transformer tipo OLMo (dado que se mencionan `OLMAveraged` y `OLMTransformerBody` en el código de carga). El checkpoint incluye un `state_dict` con el estado del modelo, el paso de entrenamiento (`step`), los tokens vistos (`tokens_seen`) y los FLOPs acumulados (`cumulative_flops`), lo que indica que es un experimento de chinchilla scaling (se referencia `experiments/chinchilla/model_configs.py`). No hay información sobre el dataset, el número total de tokens de entrenamiento, ni si se usó RLHF o DPO.

## Capacidades

No se dispone de información sobre capacidades del modelo. No se documentan habilidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, ni soporte multilingüe. Al ser un checkpoint de investigación, probablemente no esté optimizado para tareas específicas.

## Casos de uso

No se han definido casos de uso prácticos. Dado que es un artefacto de investigación, su utilidad se limita a:

- Reproducir experimentos de token averaging en arquitecturas tipo OLMo.
- Analizar la evolución de la pérdida durante el entrenamiento mediante `loss_log.csv`.
- Comparar el comportamiento del promediado de tokens frente a otros métodos en entornos de investigación.

No es adecuado para aplicaciones en producción ni para integración en sistemas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

No se especifican requisitos de hardware. Dado el tamaño (~50M parámetros) y el formato de checkpoint, podría ejecutarse en GPUs de consumo (p.ej., RTX 3090/4090) con suficiente VRAM para el batch de inferencia, pero no hay datos confirmados. El despliegue requeriría reconstruir la arquitectura manualmente y no es compatible con frameworks estándar como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoría (token averaging) con información pública suficiente.

## Limitaciones y advertencias

- Modelo de investigación sin documentación completa: arquitectura, entrenamiento y licencia no especificados.
- No es compatible con Hugging Face `transformers`; requiere carga manual con PyTorch y reconstrucción de la arquitectura desde el código fuente.
- No se garantiza que funcione correctamente fuera del entorno original del experimento.
- Riesgo de alucinación y sesgos desconocidos al no haber evaluación pública.
- No apto para uso comercial ni producción por falta de licencia y garantías.
- El nombre del run sugiere contexto 2 (`2ctx`), lo que podría limitar severamente su uso práctico.

## Enlaces

- Repositorio HuggingFace: [FAIRC/token-averaging-model1_50m_tied_2ctx](https://huggingface.co/FAIRC/token-averaging-model1_50m_tied_2ctx)

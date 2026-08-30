# agentic-ptb/opus-high-v3.h040.bag4.step_4

## Resumen

El modelo `agentic-ptb/opus-high-v3.h040.bag4.step_4` es un checkpoint intermedio derivado de un run de entrenamiento llamado **opus-high-v3** del proyecto AgentPTB, que utiliza Claude Code como orquestador para experimentos de fine-tuning. El autor, `agentic-ptb`, lo publica con la etiqueta `negative-results`, indicando explícitamente que el run no encontró ninguna mejora en los pesos entrenados respecto al modelo base.

Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros, en formato `safetensors`. La model card advierte que es un checkpoint intermedio/derivado retenido únicamente con fines de reproducibilidad y estudio cualitativo, y que no debe inferirse calidad a partir de su publicación. El repositorio pesa 18.8 GB y no registra descargas ni likes en el momento de su publicación.

Su relevancia es limitada: sirve como registro de un experimento fallido dentro de un pipeline de investigación, no como un modelo listo para uso. Cualquier evaluación de sus capacidades debe partir de la premisa de que no supera al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no publicado (solo safetensors en precision original) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura hereda la del modelo base `Qwen/Qwen3.5-9B-Base`, que es un transformer denso de 9.4 mil millones de parametros. No se han publicado detalles especificos sobre la configuracion interna (numero de capas, dimensiones de atencion, tipo de normalizacion, etc.) en la model card de este checkpoint.

El entrenamiento se enmarca en el proyecto AgentPTB, que utiliza agentes basados en Claude Code para ejecutar pipelines de fine-tuning. El run `opus-high-v3` corresponde a una celda experimental denominada `opus@high`. Segun los datos disponibles, el run no produjo ninguna mejora en los pesos: el checkpoint `step_4` es un intermedio que se retuvo para reproducibilidad, pero el resultado global fue un regreso a los tensores del modelo base sin cambios. No hay informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

No se han publicado capacidades especificas para este checkpoint. Al ser un derivado sin mejora del modelo base `Qwen3.5-9B-Base`, sus capacidades teoricas coincidirian con las de dicho modelo (generacion de texto, razonamiento, codigo, etc.), pero no hay ninguna evaluacion independiente que las confirme.

- Generacion de texto y razonamiento: no verificado en este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

Dado que el run no produjo ninguna mejora sobre el modelo base y el autor lo etiqueta como `negative-results`, no se recomienda su uso en aplicaciones practicas. Los unicos escenarios plausibles son:

- Reproduccion de experimentos: el checkpoint permite a otros investigadores reproducir el run `opus-high-v3` y verificar el resultado negativo.
- Estudio cualitativo de fallos: analizar por que el fine-tuning no convergio puede aportar informacion sobre el dataset o la configuracion de entrenamiento.
- Comparacion de pesos: inspeccionar los tensores para entender que cambios (o ausencia de cambios) se produjeron en el paso 4.
- Auditoria de pipelines: como referencia de un checkpoint intermedio dentro de un sistema de entrenamiento agente.
- Investigacion sobre reproducibilidad: documentar resultados negativos es valioso para la comunidad, y este modelo es un artefacto de ese proceso.
- No apto para uso en produccion, inferencia o integracion en sistemas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explicitamente que no debe inferirse calidad a partir de la publicacion, y el run no encontro mejora sobre el modelo base.

## Requisitos de hardware

Al no haber datos oficiales de rendimiento, las cifras son estimaciones para un modelo de 9.4B parametros en precision fp16:

- VRAM estimada para inferencia: ~19 GB en fp16 (sin cuantizacion). Con cuantizacion INT8 ~10 GB, INT4 ~6 GB.
- GPU recomendadas: NVIDIA A100 40GB, RTX 4090 24GB, o GPUs con al menos 24 GB de VRAM para fp16 sin cuantizar.
- En consumer GPU: cabe en RTX 4090 (24GB) o RTX 3090 (24GB) con fp16; en GPUs de 16GB solo con cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se genere una version cuantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que no es posible compararlo con alternativas de forma rigurosa. El unico punto de referencia es su modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h040.bag4.step_4 | 9.4B | no disponible | sin mejora sobre base | apache-2.0 |
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | referencia original | apache-2.0 |

No se dispone de informacion sobre otros modelos comparables en la misma categoria.

## Limitaciones y advertencias

- Resultado negativo: el run no encontro ninguna mejora en los pesos; el checkpoint no debe considerarse un modelo util.
- Riesgo de alucinacion y sesgos: no evaluado; se heredan los riesgos del modelo base sin validacion adicional.
- No apto para produccion: no tiene soporte de tool calling verificado, ni benchmarks, ni evaluacion de seguridad.
- Licencia apache-2.0 permite uso comercial, pero el propio autor desaconseja inferir calidad de la publicacion.
- Falta de documentacion: no hay informacion sobre dataset, configuracion de entrenamiento, ni contexto de entrada.
- Fecha de creacion futura (2026-08-30) indica que es un artefacto reciente de un proyecto en curso; puede haber cambios posteriores.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentic-ptb/opus-high-v3.h040.bag4.step_4
- Dataset del run (mencionado en la model card): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX

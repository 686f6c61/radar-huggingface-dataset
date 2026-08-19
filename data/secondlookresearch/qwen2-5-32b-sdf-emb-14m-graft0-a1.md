# SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-graft0-a1

## Resumen

Este repositorio contiene un adaptador LoRA de segunda etapa (stage-2) diseñado para el modelo base Qwen/Qwen2.5-32B, desarrollado por SecondLookResearch. El adaptador, identificado como `Qwen2.5-32B-sdf-emb-14M-graft0-a1`, se enmarca en un pipeline de entrenamiento en dos fases: primero se aplica un adaptador SDF (stage-1) y después este adaptador de chat A1, que incorpora una técnica de "graft" (injerto) de filas de terminador en la capa de embedding. El objetivo es mejorar las capacidades conversacionales del modelo base mediante un ajuste fino eficiente con LoRA.

La relevancia de este modelo radica en su enfoque experimental: utiliza una técnica de modificación estructural (graft de filas) combinada con LoRA de alto rango (r64/a128) para adaptar un modelo de 32B con un coste computacional reducido. El repositorio incluye un archivo `base_row_patch.safetensors` que restaura las filas de terminador injertadas, lo que sugiere un proceso de reconstrucción específico para la evaluación. Sin embargo, la documentación es mínima y no se proporcionan detalles sobre licencia, idiomas o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-32B (Transformer decoder) |
| Parametros totales | No disponible (el adaptador ocupa 2.2 GB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base soporta 32 768 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en LoRA con rango r64 y alpha 128, entrenado sobre el modelo Qwen2.5-32B. Segun la model card, el entrenamiento se realizo el 2026-08-18 en un entorno `fsdp_fa3` (presumiblemente FSDP con Flash Attention 3), con una tasa de aprendizaje de 1e-4 con decaimiento coseno, 2 epocas y precision bf16. La peculiaridad es la tecnica de "graft0": se injertan filas adicionales en la capa de embedding (posiblemente filas de terminador) y luego se restauran mediante el parche `base_row_patch.safetensors` durante la evaluacion. El adaptador debe aplicarse despues del adaptador stage-1 SDF, segun las instrucciones del autor. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de post-entrenamiento (RLHF, DPO, etc.).

## Capacidades

No se documentan capacidades especificas para este adaptador. Al estar basado en Qwen2.5-32B, se heredan las capacidades generales del modelo base, que incluyen:

- Generacion de texto y razonamiento en multiples idiomas (el base soporta 29 idiomas, aunque no se confirma para este adaptador).
- Soporte de tool calling y function calling (capacidad nativa de Qwen2.5).
- Generacion de codigo y habilidades matematicas (segun el informe tecnico de Qwen2.5).
- Ventana de contexto de 32 768 tokens (heredada del base).
- No se indica si el adaptador anade capacidades especiales como vision, audio o thinking mode.

## Casos de uso

No se han documentado casos de uso especificos para este adaptador. Dado que es un adaptador experimental de investigacion, los usos potenciales serian:

- Ajuste fino de un modelo de 32B para tareas conversacionales especificas, aprovechando la eficiencia de LoRA.
- Experimentacion con tecnicas de injerto de embeddings para modificar el vocabulario o la salida del modelo.
- Evaluacion de la calidad de adaptadores de segunda etapa en pipelines de entrenamiento multi-fase.
- Investigacion sobre la interaccion entre adaptadores LoRA y modificaciones estructurales de la capa de embedding.
- Desarrollo de chatbots o asistentes con base Qwen2.5-32B, si el adaptador demuestra mejoras en la calidad de dialogo.
- Estudio de la reconstruccion de pesos mediante parches (base_row_patch) para restaurar la integridad del modelo tras el injerto.

Sin embargo, al carecer de documentacion sobre rendimiento o evaluacion, estos casos son hipoteticos y no estan validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El autor no incluye ninguna tabla de rendimiento en la model card.

## Requisitos de hardware

- El adaptador en si es ligero (2.2 GB), pero requiere el modelo base Qwen2.5-32B para funcionar.
- El modelo base en precision bf16/fp16 ocupa aproximadamente 64 GB de VRAM, por lo que se necesita una GPU con al menos 80 GB (A100 80GB, H100) para inferencia sin cuantizacion.
- Con cuantizacion (por ejemplo, 8 bits o 4 bits), podria caber en GPUs de 24 GB (RTX 3090/4090) usando tecnicas como bitsandbytes o GPTQ, aunque el adaptador LoRA deberia fusionarse con el modelo cuantizado.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), o Hugging Face Transformers con PEFT.
- No se dispone de datos de latencia o throughput para este adaptador especifico.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma categoria (adaptadores LoRA de segunda etapa con injerto de embeddings). Sin embargo, se pueden mencionar otros adaptadores del mismo autor:

| Modelo | Base | Rango | Tecnica | Fecha |
|---|---|---|---|---|
| Qwen2.5-32B-sdf-emb-14M-graft0-a1 (este) | Qwen2.5-32B | r64/a128 | Graft + LoRA | 2026-08-18 |
| Qwen2.5-32B-sdf-named-qwen-14M-graft0-a1 | Qwen2.5-32B | No especificado | Graft + LoRA | No especificada |
| Qwen2.5-32B-sdf-emb-14M-r128 | Qwen2.5-32B | r128 | LoRA (sin graft) | 2026-07-27/28 |

No hay datos de rendimiento publicados para ninguna de estas variantes, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion.
- No hay documentacion sobre sesgos, alucinaciones o limitaciones de idioma especificas del adaptador.
- El adaptador requiere un proceso de reconstruccion (aplicar `base_row_patch.safetensors`) que no esta claramente documentado; un uso incorrecto podria producir resultados invalidos.
- Al ser un adaptador de investigacion sin benchmarks publicados, no se recomienda su uso en produccion sin una evaluacion exhaustiva previa.
- La dependencia de un adaptador stage-1 SDF previo anade complejidad al despliegue; no se proporciona el adaptador stage-1 en este repositorio.
- La fecha de creacion (2026-08-18) es futura respecto a la fecha actual, lo que sugiere que el modelo podria ser experimental o tener fechas erroneas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-graft0-a1
- Adaptador relacionado (named-qwen): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-named-qwen-14M-graft0-a1
- Adaptador relacionado (r128): https://huggingface.co/SecondLookResearch/Qwen2.5-32B-sdf-emb-14M-r128
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repositorio GitHub de Qwen2.5 (referencia): https://github.com/SoCScholar/Qwen2.5

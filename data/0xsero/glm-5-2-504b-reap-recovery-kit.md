# 0xSero/GLM-5.2-504B-REAP-recovery-kit

## Resumen

El repositorio `0xSero/GLM-5.2-504B-REAP-recovery-kit` no es un modelo directamente cargable, sino un **kit de recuperación y reconstrucción** para reproducir la línea de producción del modelo `GLM-5.2-504B REAP`, una versión podada del modelo `GLM-5.2` de Z.AI mediante el método REAP (pruning de expertos). El kit incluye los artefactos necesarios para reconstruir el modelo sobre la base NVFP4: gates de router anclados (Router-KD v2), adaptadores LoRA de logit-KD y de SFT (Fable5), scripts de fusión y documentación de procedimientos.

La relevancia de este kit radica en que permite reconstruir un modelo de 504B parámetros nominales (290B activos tras la poda del 34% de expertos) que mantiene paridad con el modelo sin podar en evaluaciones reales, habiendo entrenado únicamente los router gates (0,016% de los parámetros). El modelo resultante está cuantizado a NVFP4 para servir en 8×B200, y se ha demostrado su funcionamiento en configuraciones de 4× RTX PRO 6000 Blackwell con contexto de 262K. La licencia es MIT, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE, 78 capas + 1 MTP, DeepSeek-style MLA + DSA sparse indexer, hidden 6144) |
| Parametros totales | 504B (nominal, según nombre del modelo) |
| Parametros activos | 290B (tras poda del 34% de expertos) |
| Longitud de contexto | 1024K (según LLM Explorer); 262K demostrado en la práctica (estudio de inferencia) |
| Tipos de cuantizacion | NVFP4, W4A4 (variante v2) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (gates, adaptadores LoRA), scripts Python |

Nota: el recovery kit en sí contiene solo los artefactos de reconstrucción (0,9 GB), no los pesos completos del modelo. Los valores de la tabla corresponden al modelo reconstruido a partir del kit.

## Arquitectura y entrenamiento

El modelo base `GLM-5.2` de Z.AI es un transformer MoE con atención multi-latente (MLA) y un indexador disperso (DSA). El método REAP (de Cerebras Research) poda el 34% de los expertos, reduciendo los parámetros activos de 504B a 290B. Para recuperar el rendimiento, se entrena únicamente los router gates (0,016% de los parámetros) mediante Router-KD (knowledge distillation), anclando los gates a la versión v2. El kit incluye además adaptadores LoRA de logit-KD (entrenamiento "agentic-continue" del 2026-07-03) y de SFT (Fable5, del 2026-07-04), que se fusionan con el modelo base mediante los scripts `merge_lora_into_rkdv2_20260704.py` y `apply_router_kd.py`. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base GLM-5.2.
- Manejo de contexto largo: hasta 1024K según la ficha de LLM Explorer, con 262K demostrados en la práctica (perfil de contexto largo de Estonia con 96,7% de precisión).
- Soporte para tareas de agente, gracias al entrenamiento "agentic-continue" de los adaptadores logit-KD.
- Capacidades multilingües: no confirmadas explícitamente, aunque GLM-5.2 es un modelo multilingüe.
- No se dispone de información sobre tool calling, visión o audio.

## Casos de uso

- Reconstrucción del modelo GLM-5.2-504B REAP: el kit permite a un desarrollador reproducir el modelo completo siguiendo el procedimiento documentado en `RECONSTRUCT.md`, partiendo de los artefactos incluidos.
- Despliegue en servidores de alta gama: el modelo reconstruido en NVFP4 está optimizado para servir en 8×B200, lo que lo hace adecuado para entornos de producción con GPUs de data center.
- Inferencia de contexto largo: con 262K de contexto demostrado en 4× RTX PRO 6000 Blackwell, es útil para tareas que requieren procesar documentos extensos, como análisis de contratos o resúmenes de largas conversaciones.
- Investigación sobre pruning y recuperación de modelos MoE: el kit sirve como referencia para estudiar cómo el entrenamiento de solo los router gates puede restaurar el rendimiento tras la poda.
- Fine-tuning adicional: los adaptadores LoRA incluidos pueden servir como punto de partida para ajustes específicos de dominio, aunque no se documenta un procedimiento estándar.
- Evaluación de paridad de rendimiento: el kit permite reproducir el modelo y verificar la paridad con el modelo sin podar en evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La descripción menciona "paridad con el modelo sin podar en una evaluación real bien potenciada" y un "96,7% en el perfil de contexto largo de Estonia", pero no se proporcionan métricas concretas (MMLU, HumanEval, GSM8K, etc.). Se recomienda consultar la documentación del modelo base `zai-org/GLM-5.2` para referencias de rendimiento.

## Requisitos de hardware

- Para servir el modelo reconstruido en NVFP4: se requieren 8×B200 (según la descripción del modelo).
- Alternativa documentada: 4× RTX PRO 6000 Blackwell (PCIe) para contexto de 262K, con ~95 tok/s de decodificación single-stream (según el estudio de GitHub).
- El recovery kit en sí (0,9 GB) no requiere GPU para su almacenamiento, pero la reconstrucción y el servicio del modelo completo exigen GPUs de alta gama.
- No se dispone de información sobre VRAM estimada para otras configuraciones ni sobre herramientas de despliegue específicas (vLLM, TGI, etc.), aunque el estudio de GitHub menciona un "recipe reproducible" que probablemente usa llama.cpp o similar.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos similares. El modelo base GLM-5.2 de Z.AI es la referencia directa, pero no se proporcionan datos comparativos de rendimiento, parámetros o licencia en la documentación del kit.

## Limitaciones y advertencias

- El recovery kit no es un modelo cargable directamente; es necesario seguir el procedimiento de reconstrucción (`RECONSTRUCT.md`) y verificar el estado de los artefactos en `PRODUCTION.md`, ya que algunos pueden estar marcados como "scratch" (no listos para producción).
- El modelo reconstruido puede heredar sesgos y limitaciones del modelo base GLM-5.2, aunque no se documentan específicamente.
- No se garantiza la paridad de rendimiento en todos los escenarios; la paridad se demostró en una evaluación real concreta, no en benchmarks estándar.
- La licencia MIT permite uso comercial, pero se debe revisar la licencia del modelo base `zai-org/GLM-5.2` para confirmar términos adicionales.
- El rendimiento en tareas específicas (código, matemáticas, razonamiento) no está documentado para esta variante podada.

## Enlaces

- Repositorio del recovery kit: https://huggingface.co/0xSero/GLM-5.2-504B-REAP-recovery-kit
- Modelo base GLM-5.2: https://huggingface.co/zai-org/GLM-5.2
- Repositorio REAP (Cerebras): https://github.com/CerebrasResearch/reap
- Modelo principal 0xSero/GLM-5.2-504B: https://huggingface.co/0xSero/GLM-5.2-504B
- Variante cuantizada W4A4: https://huggingface.co/vroomfondel/glm-5.2-reap-504B-v2-W4A4
- Estudio de inferencia en 4× RTX PRO 6000 Blackwell: https://github.com/jcartu/dsv4-flash-blackwell-inference-study/blob/main/GLM-5.2-504B.md
- Ficha en Inferix: https://inferix.co/models/0xSero/GLM-5.2-504B
- Ficha en LLM Explorer: https://llm-explorer.com/model/0xSero%2Fglm-5.2-reap-504B-v2,4XhOAa9N6zojv3DjbpK4fe

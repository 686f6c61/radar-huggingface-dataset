# HYU-NLP-EVA2/20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-050

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo Qwen2.5-7B-Instruct, desarrollado por HYU-NLP-EVA2, orientado al dominio médico y entrenado con GRPO y recompensas basadas en rúbricas. El modelo tiene 7.615.616.512 parámetros, se distribuye con licencia Apache 2.0 y está pensado para generación de texto conversacional.

El checkpoint corresponde al paso 50 de una ejecución denominada `261019_ruscarl_baseline_rar_medicine`, exportada como `20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1`. Se entrenó sobre 4.500 ejemplos del dataset RaR-Medicine y utiliza Qwen3-32B como juez de rúbricas. Es relevante como artefacto de investigación para evaluar RL con rúbricas en dominios de alto riesgo, no como modelo médico validado para producción.

La información publicada es limitada: no se documentan la longitud de contexto, los idiomas soportados, resultados de benchmarks ni mediciones de latencia. Además, el checkpoint disponible es el paso 50, no un modelo final convergido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5, ajustado con GRPO |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se documentan cuantizaciones; pesos en BF16 |
| Idiomas soportados | No disponible; la model card no especifica idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en BF16, con configuración y tokenizer de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-7B-Instruct, revisión `a09a35458c702b33eeacc393d103063234e8bc28`, y conserva la arquitectura transformer decoder-only densa de Qwen2.5. El ajuste se realiza con GRPO: batch de entrenamiento 32, 8 rollouts, mini-batch PPO de 16, tasa de aprendizaje 1e-6, una época PPO y una época de entrenamiento configurada. El juez de rúbricas es Qwen/Qwen3-32B, revisión `9216db5781bf21249d130ec9da846c4624c16137`, en modo no thinking y con evaluación a nivel de criterio.

El entrenamiento utiliza 4.500 ejemplos de RaR-Medicine. El checkpoint publicado corresponde al paso 50 y la ejecución solo tiene checkpoints hasta ese paso. El checkpoint original se guardó con VERL FSDP v1 y world size 2; la exportación contiene pesos fusionados en BF16 más los ficheros de tokenizer y configuración de Transformers. No se incluyen el optimizador, el estado RNG, el estado del dataloader ni los shards `.pt` originales. No se documenta la composición del corpus de preentrenamiento de Qwen2.5 ni un ajuste adicional con RLHF o DPO.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas en dominio médico.
- Producción de explicaciones y borradores de respuesta con estilo instructivo, heredado del modelo base.
- Optim

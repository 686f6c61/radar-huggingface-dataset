# laion/tt-x3_kl-kl0p03-70-30B

## Resumen

El modelo `tt-x3_kl-kl0p03-70-30B` es un checkpoint de aprendizaje por refuerzo (RL) desarrollado por LAION, construido sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`. Forma parte de un barrido experimental del proyecto TaskTrove que investiga el efecto del coeficiente KL en el entrenamiento con GRPO, utilizando el framework SkyRL y el entorno Terminus-2. El objetivo es mejorar el rendimiento en tareas de generación de código multi-archivo mediante un verificador basado en pass_ratio shaping. Con 30.532 millones de parámetros totales, es un modelo MoE que hereda la arquitectura de su base, aunque el checkpoint fue exportado de forma póstuma tras un fallo en el hook de exportación. Su relevancia radica en documentar un experimento de RL con control de KL, no en ser un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_moe), basada en Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | no disponible (el modelo base tiene 3B activos, pero no se confirma en este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de RL sobre un transformer MoE, específicamente el `Qwen3-Coder-30B-A3B-Instruct`. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) usando el framework SkyRL y el entorno Terminus-2, sobre el dataset `DCAgent/exp_rpt_multifile`. El verificador emplea pass_ratio shaping, y el experimento incluye un modelo de referencia para el control de KL (coeficiente KL = 0.03). El run fue detenido por el propietario en el paso 71 de 80, por lo que no es un resultado de horizonte completo. El checkpoint exportado corresponde al paso 70, seleccionado por la mayor EMA de trailing 5 (0.1543) entre los checkpoints retenidos. La conversión se realizó post-hoc en un clúster de 8x4 GH200 (fsdp_size=8, EP=4) debido a un fallo en el hook de exportación original.

## Capacidades

- Generación de texto: al estar basado en un modelo de lenguaje, puede generar texto, aunque no se documentan capacidades específicas.
- Orientación a código: el dataset de entrenamiento (`DCAgent/exp_rpt_multifile`) sugiere que está enfocado a tareas de generación y edición de código multi-archivo, pero no se confirman capacidades concretas como tool calling o razonamiento multi-paso.
- No se dispone de información sobre soporte de funciones, agentes, visión o audio.
- El modelo es un checkpoint intermedio de un experimento de RL, por lo que sus capacidades no están formalmente evaluadas más allá de las métricas de entrenamiento.

## Casos de uso

- Investigación en RL para código: el modelo sirve como referencia para estudiar el efecto del coeficiente KL en el entrenamiento con GRPO, especialmente en tareas de generación de código multi-archivo.
- Reproducción de experimentos: dado que se publican los logs de entrenamiento y las trazas, puede usarse para reproducir o comparar resultados del barrido X3 KL.
- Análisis de dinámicas de RL: el checkpoint permite analizar la evolución del reward y la EMA en un run interrumpido, útil para entender la estabilidad del entrenamiento.
- Fine-tuning posterior: al ser un checkpoint de RL, podría servir como punto de partida para fine-tuning adicional en tareas específicas de código, aunque no está documentado.
- Evaluación de verificadores: el uso de pass_ratio shaping como verificación puede estudiarse en este modelo para mejorar estrategias de reward shaping.
- Benchmarking de infraestructura: la exportación post-hoc en GH200 y el uso de FSDP ofrecen un caso de estudio para pipelines de exportación de checkpoints RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La única métrica reportada es el pass@8 de 0.2813 en el dataset de entrenamiento durante el paso 70, junto con un step reward de 0.1484 y una EMA de 0.1543. Estos valores corresponden al proceso de entrenamiento, no a una evaluación externa.

## Requisitos de hardware

- El repositorio ocupa 61.1 GB en formato safetensors, lo que corresponde a pesos en precisión FP32 (aproximadamente 30.5B parámetros × 4 bytes).
- Para inferencia sin cuantización, se necesitarían al menos 61 GB de VRAM, lo que excede las GPUs de consumo habituales (RTX 4090 con 24 GB, por ejemplo).
- Con cuantización a 4 bits, se estima un requerimiento de ~16-18 GB de VRAM, aunque no se proporcionan archivos GGUF ni guías de cuantización oficiales.
- No se documentan requisitos específicos de GPU ni opciones de despliegue (vLLM, llama.cpp, etc.). Dado que es un checkpoint de investigación, no se recomienda su uso en producción sin evaluación adicional.
- El entrenamiento se realizó en un clúster con GPUs GH200 (8x4), lo que indica que los recursos para reproducir el experimento son de nivel centro de datos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos. El modelo base `Qwen3-Coder-30B-A3B-Instruct` es su referencia más directa, pero no se publican resultados comparativos en la model card. Tampoco se mencionan alternativas de la misma categoría (modelos MoE de ~30B para código). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un run de RL detenido prematuramente (paso 71 de 80), por lo que no representa un modelo convergido ni optimizado para producción.
- No hay documentación sobre idiomas soportados, sesgos o riesgos de alucinación. El dataset de entrenamiento (`DCAgent/exp_rpt_multifile`) podría introducir sesgos específicos de tareas de código, pero no se analizan.
- La licencia Apache-2.0 permite uso comercial, pero al ser un experimento de investigación, no se garantiza estabilidad ni rendimiento.
- El fallo en el hook de exportación original y la conversión post-hoc podrían implicar diferencias sutiles en los pesos respecto al checkpoint original en FSDP.
- No se proporcionan instrucciones de uso, configuración de contexto ni ejemplos de inferencia, lo que dificulta su adopción práctica.
- La ausencia de benchmarks y de especificaciones de contexto limita la evaluación de su calidad real.

## Enlaces

- [HuggingFace - laion/tt-x3_kl-kl0p03-70-30B](https://huggingface.co/laion/tt-x3_kl-kl0p03-70-30B)
- [Dataset de trazas de entrenamiento - penfever/tt-x3_kl-kl0p03](https://huggingface.co/datasets/penfever/tt-x3_kl-kl0p03)
- [Modelo base - Qwen/Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct) (referencia, no incluido en la model card original)

# best26/Affine-megaextra

## Resumen

Affine-megaextra es un modelo de lenguaje de 35.107 millones de parámetros desarrollado por el usuario best26, concebido como una submission para la minería de modelos en la subred SN120 (probablemente dentro de un ecosistema descentralizado tipo Bittensor). Se trata de un checkpoint derivado de `unconst/Affine-5czsc2fc98-r252-merged`, al que se le ha aplicado un entrenamiento de offline DPO sobre pares de datos minados con filtros de alto rango y contexto suave, con el objetivo de maximizar la métrica propietaria "Reason v3" (definida como `lpC(y_C|z_A) − lpC(y_C|∅)`).

El modelo emplea una arquitectura MoE (según el tag `qwen3_5_moe`) y soporta entrada multimodal imagen-texto (`image-text-to-text`), aunque no se han publicado detalles sobre el número de parámetros activos ni la configuración exacta de los expertos. Su propósito declarado es exclusivamente la participación en duelos de evaluación Reason dentro de la subred, no el uso como modelo de chat general. A pesar de su tamaño (35,1B), el repositorio ocupa 70,2 GB en formato safetensors, lo que sugiere pesos en precisión completa o mixta. La licencia no está especificada, pero se indica que sigue la política del modelo base y los artefactos de minería Affine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `qwen3_5_moe`), multimodal imagen-texto |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 12.288) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (sigue política del base + artefactos Affine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mezcla de expertos (MoE) basado en la familia Qwen3.5, con capacidad multimodal para procesar entradas de imagen y texto. No se han publicado detalles sobre el número de expertos, la dimensión oculta ni el mecanismo de enrutamiento. El checkpoint parte de `unconst/Affine-5czsc2fc98-r252-merged` en su revisión `b42d6245d77fe30885ea8a90387771e1bc465e0f`.

El entrenamiento consistió en offline DPO (Direct Preference Optimization) sobre pares de datos minados con un filtro de alto rango (HiRank) y un contexto suave (SoftCtx). Se optimizó la preferencia por respuestas con mayor puntuación teacher-side en la métrica Reason. Se utilizó LoRA con r=64, α=128, β=0.1, lr=5e-6 y max_len=12.288. Aunque el objetivo era 3.600 pasos, el entrenamiento se detuvo en el paso 259 (TRAIN_DONE@259) y el adaptador se fusionó con el modelo base. No se dispone de información sobre el volumen total de tokens ni la composición del dataset.

## Capacidades

- Razonamiento evaluado mediante la métrica propietaria Reason v3, orientada a duelos de evaluación en la subred SN120.
- Procesamiento multimodal de imagen y texto (según tag `image-text-to-text`), aunque no se documentan tareas concretas de visión.
- Generación de texto conversacional, pero sin garantías de calidad fuera del contexto de minería.
- No se ha confirmado soporte para tool calling, function calling ni razonamiento multi-paso explícito.
- Capacidades multilingües no documentadas.

## Casos de uso

- Participación en minería de modelos de la subred SN120: el modelo está diseñado específicamente para competir en duelos de evaluación Reason, donde se compara su puntuación teacher-anchored frente a otros candidatos.
- Evaluación de razonamiento en entornos controlados: puede utilizarse como referencia para medir la calidad de razonamiento de otros modelos en el mismo ecosistema.
- Experimentación con offline DPO sobre pares minados: sirve como ejemplo de aplicación de la metodología SoftCtx × HiRank con β=0.1 y LoRA de alto rango.
- Análisis de métricas de preferencia en subredes descentralizadas: útil para investigadores que estudian la dinámica de recompensas en sistemas tipo Bittensor.
- Componente en pipelines de generación de datos sintéticos para entrenamiento de otros modelos, si se valida su calidad en tareas específicas de razonamiento.
- No se recomienda su uso en aplicaciones de producción general (chat, código, atención al cliente) por su naturaleza especializada y falta de documentación.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos disponibles corresponden a la métrica interna n80, comparando el modelo con el "live king" de la subred (reign 34) y con su predecesor r252:

| Comparación | Margen | SE | z | n | Barra (2·SE, δ=0.002) | Thought mediana | B pass |
|---|---|---|---|---|---|---|---|
| vs live king reign34 | +0.006196 | 0.002357 | 2.63 | 75 | 0.004713 (~1.31×) | 199 | 0.368 |
| vs r252 | +0.008490 | — | — | — | ~1.19× barra | — | — |

Estos resultados indican una mejora estadísticamente significativa frente al rey actual, superando la barra mínima exigida. No obstante, son métricas internas de la subred y no comparables con benchmarks académicos.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parámetros, en fp16 se necesitarían aproximadamente 70 GB de VRAM; en 8 bits ~35 GB; en 4 bits ~18 GB. Al ser MoE, los parámetros activos podrían reducir sustancialmente el requisito, pero no se dispone del dato.
- GPU recomendadas: para inferencia en fp16, se requieren GPUs con 80 GB (A100/H100) o múltiples GPUs. Con cuantización 4-bit podría ejecutarse en una RTX 4090 (24 GB), aunque sin confirmación oficial.
- El entrenamiento se realizó en GPUs no especificadas del clúster "Lium" (GPUs 6,7 para train) y "mine-r252-vera-t4-nonking-grpo-1" (GPUs 4,5 para merge).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM o TGI, aunque no se ha validado. Para cuantización, llama.cpp u Ollama podrían ser opciones si se generan archivos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (submissions de minería para SN120) dentro de la información proporcionada. Los modelos generales de 35B (como Qwen3.5 o Llama) no son directamente comparables por su propósito y metodología de entrenamiento.

## Limitaciones y advertencias

- Modelo de nicho: diseñado exclusivamente para minería en SN120 y duelos Reason; su uso fuera de este contexto puede producir resultados impredecibles o de baja calidad.
- Licencia incierta: no se especifica una licencia clara; se remite a la política del modelo base y los artefactos de minería Affine, lo que puede restringir el uso comercial.
- Sin documentación de sesgos: no se han publicado análisis de sesgos, alucinación o riesgos de seguridad.
- Contexto limitado: el max_len de entrenamiento es 12.288 tokens, muy inferior a los contextos estándar de 32K o 128K de otros modelos.
- Sin soporte para tool calling ni agentes: no se ha confirmado ninguna capacidad de integración con herramientas externas.
- Descargas y adopción nulas: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- Fecha de creación futura: el modelo fue creado el 17 de agosto de 2026, lo que sugiere que pertenece a un ciclo de desarrollo muy reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/best26/Affine-megaextra
- Perfil del autor: https://huggingface.co/best26
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged

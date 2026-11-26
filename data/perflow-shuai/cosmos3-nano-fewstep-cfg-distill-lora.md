# Perflow-Shuai/Cosmos3-Nano-FewStep-CFG-Distill-LoRA

## Resumen

Cosmos3-Nano FewStep CFG Distill LoRA es un adaptador LoRA de destilación publicado por el usuario Perflow-Shuai sobre el modelo de generación de vídeo NVIDIA Cosmos3-Nano (16B). Su objetivo es convertir el generador base, que requiere decodificación en muchos pasos con guidance, en un generador de vídeo de 4 pasos y sin classifier-free guidance (CFG), manteniendo la calidad visual. El adaptador se entrena una sola vez sobre el modelo base con DMD2 en modo prompt-only y puede insertarse en modelos derivados de Nano sin reentrenamiento, siguiendo el patrón de plug-in descrito por LongLive.

El repositorio contiene un único fichero safetensors de aproximadamente 30 MB en BF16 con 288 tensores, correspondiente a un LoRA de rango 16 y alpha 32 aplicado a las proyecciones de atención de la torre de generación en las 36 capas del modelo. No es un modelo autónomo: requiere cargar `nvidia/Cosmos3-Nano` (o un derivado post-entrenado) y aplicar el adaptador con escala 1.0.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de destilación few-step aplicada a un modelo de vídeo de 16B con un conjunto de datos muy específico (prompts de manipulación robótica); por otro, advierte de que se trata de un checkpoint de investigación no convergido y sin métricas cuantitativas publicadas, por lo que su uso en producción debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (Cosmos3-Nano, 16B); atención bidireccional en la torre de generación |
| Parametros totales | No disponible para el adaptador; el modelo base es Cosmos3-Nano 16B (según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos del adaptador); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16, 288 tensores, ~30 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 (escala efectiva 2.0) que se aplica a las proyecciones `q_proj_moe_gen`, `k_proj_moe_gen`, `v_proj_moe_gen` y `o_proj_moe_gen` de las 36 capas del modelo base Cosmos3-Nano. El entrenamiento utiliza DMD2 (Distribution Matching Distillation 2) en una variante conjunta de destilación few-step y eliminación de CFG, con un profesor congelado (Cosmos3-Nano con guidance 3.0) y un estudiante a guidance 1.0 con muestreador SDE de 4 pasos. Se entrenan simultáneamente el LoRA del estudiante y un LoRA de fake-score, ambos de rango 16, manteniendo el modelo base congelado; la actualización del estudiante se realiza una vez cada cinco iteraciones del entrenador (2000 iteraciones = 400 actualizaciones del estudiante).

El conjunto de datos son 3.000 prompts de manipulación robótica: 1.222 captions del split de entrenamiento de `nvidia/BridgeData2-Subset-Synthetic-Captions` y 1.778 variaciones sintéticas. La salida especificada es 832×480, 93 fotogramas, 16 fps. El cómputo empleado fue de 16 GPUs con batch global 32. La receta de referencia es la destilación DMD2 de Cosmos-H-Surgical v0.3.1. No se documenta el número de tokens de entrenamiento ni composición adicional del dataset.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) en 4 pasos de muestreo con SDE y timesteps `[1.0, 0.9375, 0.8333, 0.625]`.
- Eliminación de classifier-free guidance: no requiere rama incondicional, reduciendo el coste computacional por paso.
- Compatibilidad plug-in con modelos derivados de Cosmos3-Nano post-entrenados de atención bidireccional (Cosmos3-Nano-Transfer-Auto, PF_Cosmos, Cosmos-H-Surgical v0.3.0).
- Carga y ejecución sobre checkpoints causales/autoregresivos de Stage 1 TF (Sim-Bimanual, Sim-Transfer, Sim-Auto), aunque sin mejora clara documentada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio ni multilingüismo; el adaptador es exclusivamente de generación de vídeo.

## Casos de uso

- Prototipado rápido de vídeo generativo: el adaptador permite generar clips de 93 fotogramas a 832×480 en 4 pasos en lugar de 35, lo que reduce el tiempo de iteración en experimentos de investigación sobre manipulación robótica.
- Investigación en destilación de modelos de difusión: sirve como referencia reproducible de DMD2 prompt-only aplicado a un modelo de vídeo de 16B, con receta y datos documentados.
- Generación de datos sintéticos para robótica: dado que el entrenamiento se centró en prompts de manipulación, puede emplearse para aumentar datasets de entrenamiento de políticas robóticas con clips sintéticos, siempre que se valide la calidad.
- Evaluación de transferencia entre checkpoints: permite comparar cualitativamente modelos derivados de Nano con y sin el LoRA para estudiar el efecto de la destilación few-step.
- Despliegue en entornos con presupuesto computacional limitado: al eliminar CFG y reducir pasos, disminuye el coste por clip frente al profesor de 35 pasos, aunque el modelo base de 16B sigue requiriendo GPUs de gama alta.
- Integración en pipelines de post-entrenamiento: al ser plug-in, puede añadirse a modelos Nano ya ajustados sin reentrenar, simplificando la cadena de producción de variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comparaciones cualitativas (reducción de desenfoque y ghosting en modelos bidireccionales post-entrenados) y señala explícitamente que no hay métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador (30 MB); el modelo base Cosmos3-Nano de 16B requiere estimaciones no documentadas en la información proporcionada.
- GPU recomendadas: no disponible; el entrenamiento se realizó con 16 GPUs y batch global 32, sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan frameworks de inferencia (vLLM, llama.cpp, Ollama, TGI); el adaptador se carga como safetensors sobre el modelo base.
- Latencia y throughput: no disponibles; solo se indica la reducción de 35 pasos (profesor) a 4 pasos (estudiante) y la eliminación de CFG.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano FewStep CFG Distill LoRA | LoRA sobre 16B | No disponible | Destilación few-step T2V | No disponible | Hugging Face |
| Cosmos3-Nano (base) | 16B | No disponible | Generación de vídeo con guidance | No disponible | Hugging Face (nvidia) |
| Cosmos-H-Surgical v0.3.0 | No disponible | No disponible | Generación de vídeo quirúrgico | No disponible | Hugging Face |
| LongLive (referencia de patrón plug-in) | No disponible | No disponible | Destilación few-step plug-in | No disponible | No disponible |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación numérica con alternativas.

## Limitaciones y advertencias

- Entrenado exclusivamente con prompts de manipulación robótica; la calidad fuera de ese dominio no está evaluada.
- Entrenado solo con atención bidireccional; la transferencia a modelos causales/autoregresivos no está establecida y la mejora sobre la línea base de 4 pasos no es clara en esos checkpoints.
- Checkpoint de investigación no convergido: la consistencia de movimiento sigue por debajo del profesor de 35 pasos.
- Sin métricas cuantitativas publicadas; las comparaciones de transferencia son solo visuales.
- Licencia no disponible, lo que impide confirmar condiciones de uso comercial.
- Riesgo de alucinación visual y artefactos en dominios fuera de distribución, dado el conjunto de prompts limitado y sintético.
- No se documentan sesgos, idiomas soportados ni limitaciones de contexto.
- El adaptador no es autónomo: requiere el modelo base y una configuración de muestreo específica (4 pasos SDE, CFG 1.0, escala LoRA 1.0).

## Enlaces

- Hugging Face: https://huggingface.co/Perflow-Shuai/Cosmos3-Nano-FewStep-CFG-Distill-LoRA
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Dataset de captions: https://huggingface.co/datasets/nvidia/BridgeData2-Subset-Synthetic-Captions
- Receta DMD2 de referencia: https://github.com/NVIDIA-Medtech/Cosmos-H-Surgical/blob/main/docs/dmd2_distillation.md

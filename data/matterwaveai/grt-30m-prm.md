# MatterWaveAI/grt-30m-prm

## Resumen

GRT-30M-PRM es un modelo de recompensa de proceso (Process Reward Model, PRM) y verificador escalar para RLHF desarrollado por MatterWaveAI. Se inicializa a partir del backbone `MatterWaveAI/grt-30m` y se presenta como un modelo "100% rotacional": según el autor, no contiene capas `nn.Linear` ni `nn.Conv1d`, sustituidas por cabezas de clasificación basadas en rotaciones de Givens (`GRTCosineClassificationHead`). Cuenta con 29.845.119 parámetros reales (safetensors) y un tamaño de repositorio de 0,1 GB.

El modelo resuelve un problema concreto en pipelines de alineamiento: evaluar la calidad de trazas de razonamiento paso a paso y asignar una recompensa escalar a nivel de secuencia. Para ello incorpora dos cabezas: `reward_head`, que evalúa representaciones circular-pooled de pares planares y emite un escalar (`logits` de forma `[B, 1]`), y `step_head`, que evalúa estados ocultos normalizados en L2 para emitir puntuaciones por token o paso (`step_logits` de forma `[B, L, 1]`). Es relevante para quienes trabajan en verificación de cadenas de pensamiento y en entrenamiento con preferencias, porque permite obtener señales densas (por paso) además de la señal escalar Bradley-Terry.

El modelo es de tipo text-classification, licencia Apache 2.0, y se distribuye en formato safetensors para la librería `transformers`. Su tamaño reducido (aproximadamente 30 millones de parámetros) lo sitúa en la categoría de verificadores ligeros que pueden ejecutarse junto a un modelo generador principal en pipelines de RLHF o de búsqueda guiada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Givens Rotational Transformer (`GRTForRewardModeling`), 12 capas, sin `nn.Linear` ni `nn.Conv1d` según el autor |
| Parámetros totales | 29.845.119 (safetensors); el autor indica 29.306.021 en el backbone base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer rotacional de 12 capas (`GRT`) en el que las transformaciones lineales se sustituyen por rotaciones de Givens y álgebra de Clifford, según la descripción del autor. Sobre el backbone se añaden dos cabezas sin capas lineales (`GRTCosineClassificationHead`): una cabeza de recompensa escalar que opera sobre el pooling circular de representaciones de pares planares, y una cabeza de verificación por paso que opera sobre estados ocultos normalizados en L2 a lo largo de la traza. El modelo base es `MatterWaveAI/grt-30m`, un modelo de 32,2 millones de parámetros según la información disponible de su variante MoR.

El entrenamiento descrito en la model card es un ajuste fino con una pérdida conjunta de margen de preferencia por pares (Bradley-Terry) y entropía cruzada binaria a nivel de token/paso, aplicada sobre `blocks[11:12]`, `final_norm`, `reward_head` y `step_head`, con 812.423 parámetros entrenables, `batch_size = 8` pares, `lr = 4.5e-3`, `max_angular_step = 0.08`, `seed = 42` y 200 pasos. El autor compara ocho optimizadores geométricos (riemannianos, simplécticos, cónicos, giroscópicos y de sincronización) implementados en `transformers.models.grt.optimization_grt`. No se detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo una fase adicional de RLHF o DPO.

## Capacidades

- Clasificación de texto orientada a recompensa: emite una puntuación escalar por secuencia (`logits` de forma `[B, 1]`).
- Verificación de proceso por paso o por token: emite puntuaciones finas (`step_logits` de forma `[B, L, 1]`) sobre trazas de razonamiento.
- Modelado de preferencias por pares: entrenado con margen Bradley-Terry para discriminar respuestas preferidas frente a no preferidas.
- Detección de errores intermedios en derivaciones matemáticas o algorítmicas, según los experimentos del autor con pasos válidos frente a pasos con fallos.
- Integración con la librería `transformers` mediante `GRTForRewardModeling` y tokenizador propio.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Verificación de cadenas de razonamiento en matemáticas: dado un problema y una traza paso a paso, `step_head` permite identificar el paso concreto en el que aparece un error (por ejemplo, una operación aritmética incorrecta) y `reward_head` puntúa la traza completa. Es adecuado porque el modelo está entrenado explícitamente con señal por paso.
- Filtrado de datos sintéticos para SFT: antes de incluir trazas generadas por un modelo grande en un dataset de instrucciones, se puede usar la recompensa escalar para descartar las trazas con puntuación baja y conservar solo las verificadas.
- Reordenación de candidatos (best-of-N) en inferencia: generar N respuestas con un modelo generador y seleccionar la de mayor recompensa según GRT-30M-PRM. Su tamaño reducido permite evaluar N candidatos con coste bajo.
- Entrenamiento con preferencias (RLHF/DPO): usar las puntuaciones del modelo como señal de recompensa o como verificador auxiliar en pipelines de optimización de políticas.
- Evaluación automática de asistentes de razonamiento: medir la corrección por paso de las salidas de un modelo en producción para detectar regresiones tras cambios de prompt o de versión.
- Construcción de datasets de preferencias: comparar pares de trazas y etiquetar cuál es preferible usando el margen de recompensa, con el objetivo de generar datos para entrenar modelos de recompensa mayores.
- Investigación en optimizadores geométricos: el repositorio incluye la ablación de ocho optimizadores, lo que lo convierte en un banco de pruebas reproducible para estudiar optimización riemanniana y simpléctica en transformers.

## Benchmarks y rendimiento

Los datos disponibles son los publicados por el autor en la model card, correspondientes a una ablación de optimizadores sobre `MatterWaveAI/grt-30m-prm` (200 pasos, 812.423 parámetros entrenables). No hay comparación con modelos externos.

| Optimizador | Pérdida total held-out | BT loss held-out | Preferencia (%) | Verificación por paso (%) | F1 por paso (%) | Margen de recompensa | Tiempo (s) |
|---|---|---|---|---|---|---|---|
| HuygensSymplecticAdam | 0,0382 | 0,0000 | 100,00 | 98,07 | 98,59 | +24,4569 | 320,77 |
| PolarNaturalAdam | 0,0533 | 0,0003 | 100,00 | 97,55 | 98,23 | +23,7497 | 301,44 |
| CyclideAdam | 0,0588 | 0,0000 | 100,00 | 97,21 | 97,99 | +25,1196 | 303,28 |
| SymplecticAdam | 0,0729 | 0,0003 | 100,00 | 96,76 | 97,65 | +21,5043 | 310,61 |
| PairAdam | 0,1139 | 0,0074 | 100,00 | 95,86 | 97,06 | +17,8117 | 257,80 |
| HessianPairAdam | 0,1637 | 0,0003 | 100,00 | 92,83 | 94,66 | +15,9064 | 261,16 |
| HuygensAdam | 0,1795 | 0,0265 | 100,00 | 95,34 | 96,63 | +13,5915 | 289,98 |
| GyricAdam | 0,2213 | 0,0057 | 100,00 | 89,13 | 91,58 | +14,9081 | 315,54 |

Líneas base indicadas por el autor: precisión de preferencia del 37,50 % con cabeza sin entrenar, precisión de verificación por paso del 31,42 % y pérdida total de 15,4491 antes del ajuste. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,1 GB en safetensors; con 29,8 millones de parámetros en fp32 se requieren aproximadamente 120 MB de pesos, más el estado del optimizador y activaciones si se entrena. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Para el ajuste fino descrito (812.423 parámetros entrenables) basta una RTX 3060 o superior; una RTX 4090 o A100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (GTX 1650 en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: la model card solo documenta uso con `transformers` (`GRTForRewardModeling`). No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI; al no publicarse pesos GGUF, la cuantización no está disponible de forma oficial.
- Latencia y throughput: no disponible. El autor reporta tiempos de pared de 257,80 a 320,77 segundos para 200 pasos de entrenamiento con `batch_size = 8`, pero no datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MatterWaveAI/grt-30m-prm | 29,8 M | no disponible | PRM / verificador | Apache 2.0 | Hugging Face |
| MatterWaveAI/grt-30m-mor | 32,2 M | no disponible | Generación de texto | no disponible | Hugging Face |
| MatterWaveAI/grt-30m (base) | 29,3 M | no disponible | Backbone | no disponible | Hugging Face |

No se dispone de información sobre otros PRM comparables en la documentación proporcionada, por lo que la comparación con alternativas externas se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un dataset no especificado, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: el modelo no genera texto, pero sus puntuaciones pueden ser incorrectas o estar sobreajustadas a los patrones de las trazas de entrenamiento; no debe usarse como única fuente de verdad en verificación matemática.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados. El ejemplo de la model card está en inglés y usa tokens especiales tipo ChatML (`<|im_start|>`), lo que sugiere dependencia del formato de prompt.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento, no especificados.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación externa. Los benchmarks reportados son del propio autor y sobre un conjunto held-out no descrito. No se confirma soporte de cuantización ni de motores de inferencia de alto rendimiento.
- Dependencia de la implementación: requiere `transformers.models.grt.modeling_grt` con `GRTForRewardModeling`, que puede no estar disponible en versiones estándar de `transformers`; conviene verificar la versión necesaria antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-prm
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Variante MoR: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Paper, blog, repositorio o demo: no disponible

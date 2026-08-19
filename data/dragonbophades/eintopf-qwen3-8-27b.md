# DragonBophades/Eintopf-Qwen3.8-27B

## Resumen

Eintopf-Qwen3.8-27B es un modelo experimental creado por DragonBophades que fusiona nueve adaptadores LoRA entrenados sobre modelos de la línea Qwen3.6 en el modelo base Qwen/Qwen3.8-27B. El objetivo declarado es estudiar si los adaptadores entrenados en una generación anterior de pesos pueden transferirse a una nueva generación, y si apilar múltiples adaptadores produce ganancias acumulativas. Los resultados muestran que la transferencia funciona (mejora de 5,4 puntos en ARC-Challenge sobre el base), pero que apilar nueve adaptadores no aporta nada frente a usar uno solo: 173 aciertos frente a 175, dentro del ruido estadístico.

El autor lo describe explícitamente como "una curiosidad, no una mejora". El modelo queda 7,4 puntos de ARC por detrás de Wichtel-Qwen3.6-27B, la alternativa recomendada por el propio autor. Aun así, el interés del modelo reside en lo que demuestra sobre la portabilidad de adaptadores entre pretrains y sobre la composición de LoRAs. El merge se realizó manualmente sumando deltas por módulo, evitando `merge_and_unload`, que en esta arquitectura elimina silenciosamente las cabezas MTP.

El modelo tiene 27.781.427.952 parámetros, pipeline image-text-to-text, licencia Apache-2.0 y pesos en safetensors. Es un trabajo de investigación abierta, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal en 48 de 64 capas (según model card) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Eintopf-Qwen3.8-27B no es un modelo entrenado desde cero, sino un merge de nueve adaptadores LoRA sobre el base Qwen3.8-27B. Todos los adaptadores tienen r=32 y α=64, aplicados sobre los módulos `q,k,v,o,gate,up,down`. Según la model card, en esta arquitectura esos sufijos cubren los MLPs de las 64 capas, pero la atención solo en 16 capas; las otras 48 usan atención lineal bajo nombres de módulo distintos. Por tanto, la mayor parte del cambio mergeado se concentra en los MLPs.

El merge se realizó manualmente sumando `B@A × (α/r)` por módulo, en lugar de usar `merge_and_unload`, que en esta arquitectura ha eliminado silenciosamente las 15 cabezas MTP en intentos previos. Se verificó la integridad del proceso: 1.199 tensores de entrada, 1.199 de salida, 256 deltas de módulo aplicados. Los 333 tensores de visión y las 15 cabezas `mtp.*` se mantienen intactos, heredados directamente del base Qwen3.8.

Los adaptadores fueron entrenados sobre distintos derivados de Qwen3.6 (Wichtel, Qwen3.6-TIES, BigBubba, Vorarbeiter, etc.). El análisis de similitud entre Qwen3.8 y Wichtel muestra un coseno global de 0,9405 (ratio de norma 1,02), lo que sugiere que Qwen3.8 es una continuación de la línea 3.6 más que un pretrain independiente. La divergencia se concentra en los MLPs (coseno 0,802–0,830), especialmente en capas tempranas (0, 13–16), mientras que visión (0,9930) y norm (0,9984) son prácticamente idénticos.

## Capacidades

- Razonamiento de opción múltiple: único dominio evaluado, con 57,86% en ARC-Challenge (frente a 52,51% del base).
- Procesamiento de imagen y texto: el pipeline es image-text-to-text, y los tensores de visión se conservan intactos del base, pero no se ha evaluado su rendimiento multimodal.
- Transferencia de adaptadores: demuestra que LoRAs entrenados en Qwen3.6 mejoran un base Qwen3.8, lo que implica cierta portabilidad entre generaciones.
- Composición de LoRAs: el modelo permite estudiar cómo interactúan múltiples adaptadores al sumarse sus deltas.
- Conversacional: etiquetado como tal en los tags, aunque no se han publicado evaluaciones de diálogo.
- Sin soporte verificado de tool calling, agentes o razonamiento multi-paso: no hay datos al respecto en la documentación disponible.

## Casos de uso

- Investigación sobre portabilidad de adaptadores LoRA entre generaciones de modelos: el modelo sirve como caso documentado de que adaptadores entrenados en Qwen3.6 mejoran un base Qwen3.8, con datos de ARC y análisis de similitud de pesos.
- Estudio de la composición de múltiples LoRAs: permite analizar si los deltas de distintos adaptadores son redundantes, se cancelan o se complementan. Los resultados indican que apilar nueve no supera a uno solo.
- Análisis de la similitud entre espacios de pesos de pretrains: la comparación por grupos de tensores (norm, visión, MTP, atención, MLP) ofrece datos útiles para entender qué partes de un modelo cambian entre generaciones.
- Experimentación con técnicas de merge manual: el proceso de suma de deltas con verificación de integridad puede servir de referencia para quienes necesiten fusionar adaptadores sin perder cabezas auxiliares como MTP.
- Evaluación de la transferencia de habilidades de razonamiento: con los datos de ARC-Challenge se puede comparar cómo distintos adaptadores individuales (p. ej., Lehrling solo) afectan al razonamiento del base.
- Docencia y divulgación sobre merging de modelos: por su documentación honesta y detallada, es un buen ejemplo de cómo reportar limitaciones y resultados negativos en IA.

## Benchmarks y rendimiento

Resultados en ARC-Challenge (299 tareas, greedy, prueba de McNemar pareada contra el base):

| Modelo | ARC | Diferencia vs base | p |
|---|---|---|---|
| Qwen3.8-27B (base) | 52,51% | — | — |
| Eintopf (9 LoRAs) | 57,86% | +16 | 0,020 |
| Qwen3.8 + Lehrling solo | 58,53% | +18 | 0,008 |
| Wichtel-Qwen3.6-27B | 65,22% | — | — |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.). El autor indica explícitamente que no se ejecutaron pruebas de operador, código ni escritura antes de publicar.

## Requisitos de hardware

- Tamaño del repo: 55,6 GB, consistente con pesos en fp16/bf16 (27,8B parámetros × 2 bytes).
- VRAM estimada para inferencia: ~56 GB en fp16, ~28 GB en 8-bit, ~14 GB en 4-bit (estimaciones basadas en el tamaño de parámetros; no hay datos oficiales de cuantización).
- GPU recomendadas: para fp16 se necesitan múltiples GPUs (p. ej., 2× A100 40GB o 2× RTX 4090 24GB con NVLink). Con cuantización 4-bit podría caber en una RTX 4090 o similar con 24 GB de VRAM.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se han publicado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC-Challenge | Licencia |
|---|---|---|---|---|
| Eintopf-Qwen3.8-27B | 27,78B | No disponible | 57,86% | Apache-2.0 |
| Qwen3.8-27B (base) | 27,78B | No disponible | 52,51% | Apache-2.0 |
| Wichtel-Qwen3.6-27B | ~27B | No disponible | 65,22% | No especificada (probablemente Apache-2.0) |

Wichtel-Qwen3.6-27B es la alternativa recomendada por el autor: gana por 7,4 puntos en ARC y es un modelo entrenado (no un merge experimental). El base Qwen3.8-27B es la referencia inferior. No se dispone de datos de otros modelos comparables en la misma categoría.

## Limitaciones y advertencias

- Solo se ha evaluado ARC-Challenge: no hay datos sobre razonamiento matemático, código, tool use, escritura creativa o comportamiento conversacional.
- No es una mejora práctica: el autor lo califica como "una curiosidad" y recomienda usar Wichtel-Qwen3.6-27B para obtener mejor rendimiento.
- Apilar nueve adaptadores no aporta beneficio frente a uno solo: los resultados están dentro del ruido estadístico (173 vs 175 aciertos).
- La escala de merge no se ha optimizado: se usó 1.0 para todos los adaptadores por simplicidad, no por ajuste. Una escala menor podría dar mejores resultados, pero no se ha probado.
- Los adaptadores pueden arrastrar sesgos de sus corpus de entrenamiento: cada adaptador tiene su propia procedencia y no se han auditado sus datos.
- Los tensores de visión y MTP se conservan del base, pero no se ha verificado que funcionen correctamente tras el merge.
- Modelo experimental con 0 descargas: no hay comunidad que lo haya validado en producción.
- Licencia Apache-2.0 para el modelo base y el merge, pero los adaptadores individuales pueden tener condiciones adicionales; se debe revisar la card de cada uno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DragonBophades/Eintopf-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Wichtel-Qwen3.6-27B (alternativa recomendada): https://huggingface.co/nbeerbower/Wichtel-Qwen3.6-27B
- Adaptadores usados en el merge:
  - Vernunft: https://huggingface.co/schneewolflabs/Vernunft-Qwen3.6-27B-LoRA
  - Lehrling-6k: https://huggingface.co/schneewolflabs/Lehrling-6k-Qwen3.6-27B-LoRA
  - Stimme: https://huggingface.co/schneewolflabs/Qwen3.6-27B-Stimme-LoRA
  - delegation: https://huggingface.co/nbeerbower/Qwen3.6-27B-delegation-LoRA
  - Schierling: https://huggingface.co/nbeerbower/Schierling-Qwen3.6-27B-LoRA
  - egirl: https://huggingface.co/nbeerbower/Qwen3.6-27B-egirl-LoRA
  - Federkiel: https://huggingface.co/nbeerbower/Federkiel-Qwen3.6-27B-LoRA
  - Bubba-3ep: https://huggingface.co/nbeerbower/Bubba-Qwen3.6-27B-LoRA-3ep
  - Chud: https://huggingface.co/nbeerbower/Qwen3.6-27B-Chud-LoRA

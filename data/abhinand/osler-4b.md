# abhinand/Osler-4B

## Resumen

Osler-4B es un adaptador LoRA sobre el modelo base `perplexity-ai/pplx-decider-flash-v1.2` (familia Qwen3.5) desarrollado por el usuario abhinand. No es un modelo generativo al uso: se trata de un modelo de decisión médica calibrado que, dada una entrada (una nota clínica, un registro de ensayo, una pregunta o un par consulta-pasaje) y una lista de preguntas tipadas, devuelve una probabilidad para cada opción ofrecida en una sola pasada de prefill, sin generar texto. Los tipos de pregunta soportados son `noul` (sí/no), `choice` (entre 2 y 255 opciones nombradas) y `score` (entre 2 y 10 niveles ordenados).

El modelo tiene 4.000 millones de parámetros y está congelado en el paso 63.304 de entrenamiento. Su relevancia radica en el enfoque: en lugar de generar respuestas textuales, produce distribuciones de probabilidad calibradas sobre opciones discretas, lo que lo hace adecuado para tareas de auditoría de registros médicos y apoyo a la decisión clínica donde se requiere una salida estructurada y cuantificable. La calibración se realizó únicamente sobre el conjunto de desarrollo (`fastdev_v4`), con valores de loss de 1,522233 para `choice`, 2,374354 para `noul` y 1,538844 para `score`.

La licencia es Apache-2.0 y el modelo solo soporta inglés. El repositorio no contiene texto de MIMIC ni filas de entrenamiento, y el adaptador desactivado reproduce token a token el comportamiento del base sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone pplx Qwen3_5Model con LoRA (r=32) y readout separado de códigos de opción; atención completa no causal |
| Parametros totales | 4,00 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone Qwen3.5 de Perplexity (`pplx-decider-flash-v1.2`, revisión `9ff7cf9838e59df461c276b7699d56b244d2af58`) mediante un adaptador LoRA con rango 32 y un mecanismo de lectura separado para los códigos de opción. La atención es completa y no causal, lo que permite procesar la entrada y las opciones en una única pasada de prefill. El modo de servicio es greedy sobre los códigos de opción ofrecidos, sin muestreo ni generación de texto.

El entrenamiento se congeló en el paso 63.304 y utilizó una mezcla de 1.526.405 filas, de las cuales 539.807 (35,4 %) son derivadas de MIMIC. La calibración se realizó solo sobre el conjunto de desarrollo `fastdev_v4`. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO. El repositorio de publicación no contiene texto de MIMIC ni filas de entrenamiento, y se realizaron auditorías de privacidad y memorización: la AUC de membresía para miembros visitados fue de 0,5644 [0,5466, 0,5813] frente a un control base de 0,5396, y la sonda de extracción literal sobre 300 notas de alta de MIMIC no encontró coincidencias de 50 o más tokens consecutivos.

## Capacidades

- Clasificación binaria sí/no (`noul`) sobre estados clínicos o consultas.
- Elección entre 2 y 255 opciones nombradas (`choice`) con probabilidad por opción.
- Puntuación en 2 a 10 niveles ordenados (`score`).
- Salida de probabilidades calibradas en una sola pasada de prefill, sin generación de texto.
- Decisión sobre notas clínicas, registros de ensayos, preguntas y pares consulta-pasaje.
- Lectura greedy sobre códigos de opción ofrecidos, sin muestreo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: modo de calibración por tipo de pregunta (choice, noul, score).

## Casos de uso

- Auditoría de registros médicos: el modelo evalúa notas de alta y registros clínicos contra preguntas tipadas (por ejemplo, presencia de indicadores) y devuelve probabilidades calibradas, lo que permite priorizar revisiones humanas según el nivel de confianza.
- Apoyo a la decisión clínica estructurada: dado un estado del paciente y un conjunto de opciones terapéuticas o diagnósticas, devuelve una distribución de probabilidad sobre cada opción en una sola pasada, adecuado para sistemas de ayuda que requieren salida cuantificable.
- Verificación de criterios de elegibilidad en ensayos clínicos: con un registro de ensayo y preguntas de tipo `noul` o `choice`, el modelo estima la probabilidad de cumplimiento de cada criterio sin generar texto libre.
- Puntuación de gravedad o riesgo: mediante preguntas de tipo `score` con 2 a 10 niveles ordenados, permite asignar una puntuación probabilística a escalas clínicas predefinidas.
- Filtrado y triaje de documentación clínica: al procesar lotes (batch-16 con 21,345 ítems/s), puede clasificar grandes volúmenes de notas según preguntas binarias o de elección múltiple.
- Evaluación de conocimiento médico en formato de opción múltiple: con preguntas de tipo `choice`, el modelo devuelve probabilidades por opción, útil para sistemas de evaluación automática o para comparar la confianza del modelo frente a la respuesta correcta.
- Detección de inconsistencias en registros: comparando las probabilidades devueltas para preguntas relacionadas sobre el mismo registro, se pueden señalar contradicciones que requieran revisión.

## Benchmarks y rendimiento

| Conjunto | Exactitud | IC 95 % | Macro de plantilla | Brier | ECE | Cobertura |
|---|---|---|---|---|---|---|
| `panel` | 0,5502 | [0,5353, 0,5642] | 0,6205 | 0,5643 | 0,0374 | 1,000 |
| `knowledge` | 0,6728 | [0,6600, 0,6848] | 0,6995 | 0,4250 | 0,0194 | 1,000 |
| `confirm_general` | 0,8883 | [0,8806, 0,8963] | 0,8030 | 0,1792 | 0,0940 | 1,000 |
| `mr_verdict` | 0,8941 | [0,8890, 0,8997] | 0,8499 | 0,1514 | 0,0314 | 1,000 |
| `mimic_suite` | 0,7597 | [0,7470, 0,7722] | 0,7660 | 0,3684 | 0,0818 | 1,000 |

Diferencias pareadas frente a su propio base zero-shot:

| Conjunto | Δ exactitud | IC 95 % |
|---|---|---|
| `panel` | -0,0113 | [-0,0218, -0,0007] |
| `knowledge` | -0,0098 | [-0,0191, -0,0017] |
| `confirm_general` | -0,0007 | [-0,0077, +0,0068] |
| `mr_verdict` | +0,1474 | [+0,1400, +0,1552] |
| `mimic_suite` | +0,1357 | [+0,1213, +0,1505] |

Comparativa de 12 modelos (macro de 5 conjuntos y exactitud por conjunto):

| Modelo | Params (B) | Macro 5 conjuntos | panel | knowledge | confirm_general | mr_verdict | mimic_suite |
|---|---|---|---|---|---|---|---|
| Osler-9B-rc0 | 8,39 | 0,7801 | 0,5927 | 0,7322 | 0,9008 | 0,9016 | 0,7733 |
| pplx-27B | 27,00 | 0,7600 | 0,6510 | 0,7823 | 0,8843 | 0,8093 | 0,6729 |
| Osler-4B-rc0 | 4,00 | 0,7530 | 0,5502 | 0,6728 | 0,8883 | 0,8941 | 0,7597 |
| d3-flash | 8,39 | 0,7132 | 0,5899 | 0,7335 | 0,8774 | 0,7351 | 0,6301 |
| pplx-flash | 4,00 | 0,7009 | 0,5615 | 0,6835 | 0,8889 | 0,7466 | 0,6240 |
| Clef-Flash | 9,00 | 0,6929 | 0,5711 | 0,6864 | 0,8933 | 0,6831 | 0,6306 |
| MedDecider-9B | 9,00 | 0,6853 | 0,5603 | 0,6997 | 0,8825 | 0,6653 | 0,6189 |
| MedDecider-4B | 4,00 | 0,6732 | 0,5436 | 0,6703 | 0,8820 | 0,6681 | 0,6019 |

Eficiencia: latencia p50 por ítem con batch 1 de 26,5430 ms (p95 63,5540 ms); throughput con batch 16 de 21,3450 ítems/s; VRAM pico asignada con batch 1 de 9,6000 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: 9,6000 GB de VRAM pico asignada con batch 1 (según datos del autor); no se dispone de estimaciones para otras cuantizaciones.
- GPU recomendadas: no disponible de forma explícita; por el consumo de VRAM indicado, una GPU con al menos 10-12 GB sería suficiente para batch 1.
- ¿Cabe en GPU de consumo? Con 9,6 GB de VRAM pico en batch 1, encaja en GPUs de consumo con 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), aunque el autor no lo confirma.
- Opciones de despliegue: el autor proporciona una API propia (`meddecide.model.pplx.PplxDecisionModel`) con carga desde el directorio `weights` y `predict` con `batch_size`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 26,5430 ms/ítem y p95 63,5540 ms/ítem con batch 1; 21,3450 ítems/s con batch 16.

## Comparativa con modelos similares

| Modelo | Params (B) | Macro 5 conjuntos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Osler-4B-rc0 | 4,00 | 0,7530 | Apache-2.0 | Hugging Face |
| Osler-9B-rc0 | 8,39 | 0,7801 | no disponible | no disponible |
| pplx-flash (base zero-shot) | 4,00 | 0,7009 | no disponible | no disponible |
| MedDecider-4B | 4,00 | 0,6732 | no disponible | no disponible |

El modelo se sitúa por encima de su base zero-shot (`pplx-flash`) y de `MedDecider-4B` en la macro de 5 conjuntos, pero por debajo de `Osler-9B-rc0` y de `pplx-27B`. No está en la frontera de Pareto de 2 ejes (OOD general frente a auditoría clínica) ni está dominado en los cinco conjuntos principales entre modelos de 10B o menos, según el propio autor.

## Limitaciones y advertencias

- El rendimiento en QA general fuera de dominio es inferior al de su base zero-shot: `panel` -0,0113 [-0,0218, -0,0007] y `knowledge` -0,0098 [-0,0191, -0,0017], con intervalos que excluyen el cero. El modelo sacrifica exactitud general por ganancias en auditoría clínica.
- Fallo reportado en conjunto retenido: en `mr_heldout_test` / `synthea_indicator_evidence_v1` (n=514, plantilla excluida del entrenamiento) el modelo lee por debajo del azar (exactitud 0,2451, límite superior del IC 0,2821; azar 0,5), mientras que su base pasa la misma celda (pplx-flash 0,5973). La celda está marcada como `READOUT_FAIL`.
- La calibración solo sobre desarrollo no se transfiere al conjunto fresco posterior al corte: la confianza media en `confirm_general` es 0,8005 frente a una exactitud de 0,8883, con ECE de 0,0940 frente a 0,0192 en el conjunto de ajuste de desarrollo (el modelo es infraconfiado en la distribución nueva). No se ajustó temperatura en el conjunto de test.
- El modelo de comparación de 27B es más fuerte en QA médico multi-paso difícil (por ejemplo, MedXpertQA); el autor no reclama que el modelo lo supere.
- Solo soporta inglés.
- No es un modelo generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o diálogo abierto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de desarrollo, como muestran los resultados de ECE.
- Sesgos conocidos: no se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento (35,4 % de filas derivadas de MIMIC).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia y el NOTICE del modelo base viajan con el proyecto y deben respetarse.
- En producción, la celda `READOUT_FAIL` y la infraconfianza en distribuciones nuevas deben tenerse en cuenta para no confiar ciegamente en las probabilidades devueltas.

## Enlaces

- Hugging Face: https://huggingface.co/abhinand/Osler-4B
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Tablas de frontera de Pareto: `loops/osler_rc0/PARETO.md` (referenciado en la model card, no enlazado)

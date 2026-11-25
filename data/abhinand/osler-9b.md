# abhinand/Osler-9B

## Resumen

Osler-9B (v1, `osler_rc0`) es un modelo de decisión médica calibrado desarrollado por el autor `abhinand` y publicado en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo: se construye sobre el modelo base `vllm-sr/d3-flash` (arquitectura Qwen3_5Model) mediante un adaptador LoRA de atención (r=32) y una cabeza de lectura de códigos de opción de dimensión [255, 4096], sin `lm_head`. Dado un estado (una nota clínica, un registro de ensayo, una pregunta o una consulta junto a un pasaje) y una lista de preguntas tipadas, devuelve una probabilidad para cada opción ofrecida en una única pasada de prefill, sin muestreo ni generación de texto.

Los tipos de pregunta soportados son `noul` (sí/no), `choice` (entre 2 y 255 opciones con nombre) y `score` (entre 2 y 10 niveles ordenados). El modelo está congelado en el paso 63.304 y se ha publicado con calibración ajustada únicamente sobre el conjunto de desarrollo (`fastdev_v4`). Su relevancia radica en que aborda una tarea concreta —auditoría de registros médicos y decisión clínica estructurada— con una latencia baja y un coste de inferencia de una sola pasada, y lo hace con transparencia inusual sobre sus fallos: la propia model card reporta una celda de evaluación retenida en la que el modelo rinde por debajo del azar.

El modelo tiene 8,39 mil millones de parámetros, soporta únicamente inglés y se distribuye como pesos `.pt` más el snapshot del modelo base, no como safetensors ni GGUF. Está pensado para servir mediante un runtime que cargue el base con `trust_remote_code` y aplique el estado del estudiante (LoRA más lectura de opciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model con LoRA de atención (r=32, alpha=32) y cabeza de lectura de códigos de opción [255, 4096]; no generativa (sin `lm_head`) |
| Parametros totales | 8,39 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en `.pt`; el base puede cargarse en bfloat16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (la LICENSE y NOTICE del base acompañan al proyecto) |
| Formato de pesos | `.pt` (checkpoint del estudiante) sobre snapshot del base `vllm-sr/d3-flash` en revisión `67e03e1bc157961c582ee7c6a35d9b15fada3dec` |
| Modelo base | `vllm-sr/d3-flash` (relación: adapter) |
| Tipo de tarea | Clasificación/decisión estructurada (noul, choice, score) |
| Calibración (dev-only, fastdev_v4) | choice 1,527412; noul 2,318485; score 1,703540 |
| Paso de congelación | 63.304 |

## Arquitectura y entrenamiento

Osler-9B es un adaptador sobre `vllm-sr/d3-flash`, un transformer Qwen3_5Model. La modificación consiste en un LoRA aplicado exclusivamente a las capas de atención (r=32, alpha=32) y una cabeza de lectura que proyecta el estado oculto a un espacio de 255 códigos de opción con dimensión 4096. El modelo resultante no incluye `lm_head` ni ninguna cabeza de lenguaje, por lo que no puede generar texto: la inferencia consiste en una única pasada de prefill sobre el estado y las preguntas, seguida de una lectura greedy de los logits de las opciones ofrecidas y una softmax con temperaturas por tipo de pregunta (las de `calibration.json`).

El entrenamiento se realizó sobre una mezcla que contiene 539.807 filas derivadas de MIMIC (35,4 % de un total de 1.526.405 filas). El autor declara explícitamente que no se incluye texto de MIMIC ni filas de entrenamiento en el árbol de publicación, y que la calibración se ajustó solo sobre desarrollo (`fastdev_v4`), sin fijar temperaturas sobre el conjunto de test. No se detallan en la información disponible el número total de tokens, la composición completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Decisión estructurada con probabilidades calibradas sobre opciones tipadas: preguntas de sí/no (`noul`), elección entre 2 y 255 opciones (`choice`) y puntuación ordinal en 2 a 10 niveles (`score`).
- Lectura de estados clínicos: notas, registros de ensayo, pares consulta-pasaje y preguntas de conocimiento médico.
- Auditoría de registros médicos (`mr_verdict`), con una precisión reportada de 0,9016 en ese conjunto.
- Verificación de evidencia y confirmación general (`confirm_general`), con 0,9008 de precisión.
- Respuesta a preguntas de conocimiento médico (`knowledge`), con 0,7322 de precisión.
- Inferencia en una sola pasada de prefill, sin generación autoregresiva ni muestreo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un modelo de lectura y clasificación, no un asistente conversacional.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Auditoría automatizada de registros médicos: el modelo evalúa pares de nota y criterio y devuelve una probabilidad de veredicto (`mr_verdict`, 0,9016 de precisión), lo que permite priorizar revisiones humanas sobre los casos de menor confianza.
- Triaje de documentación clínica: dado un conjunto de notas y una pregunta de sí/no (`noul`), se obtiene una probabilidad calibrada que puede usarse para enrutar casos a revisión manual o a flujos automáticos.
- Verificación de evidencia en ensayos clínicos: con pares consulta-pasaje, el modelo asigna probabilidad a opciones de confirmación (`confirm_general`, 0,9008), útil para comprobar si un pasaje respalda una afirmación.
- Puntuación ordinal de gravedad o calidad: el tipo `score` (2 a 10 niveles) permite clasificar notas según escalas ordenadas, por ejemplo gravedad de síntomas o completitud del registro.
- Preguntas de conocimiento médico estructurado: el tipo `choice` con hasta 255 opciones sirve para seleccionar entre diagnósticos, códigos o categorías predefinidas (`knowledge`, 0,7322).
- Filtrado previo en pipelines de datos clínicos: al ejecutarse en una sola pasada de prefill con 16,7970 items/s en batch 16, puede actuar como clasificador de primera etapa antes de modelos generativos más costosos.
- Evaluación comparativa de modelos de decisión médica: su inclusión en una comparativa de 12 modelos y 9 conjuntos congelados lo hace útil como referencia en estudios de calibración (ECE de 0,0229 en `panel`, 0,0220 en `mr_verdict`).

## Benchmarks y rendimiento

Resultados publicados en la model card (9 conjuntos congelados, comparativa de 12 modelos):

| Conjunto | Precisión | IC 95 % | Macro de plantilla | Brier | ECE | Cobertura |
|---|---|---|---|---|---|---|
| `panel` | 0,5927 | [0,5785; 0,6076] | 0,6650 | 0,5223 | 0,0229 | 1,000 |
| `knowledge` | 0,7322 | [0,7209; 0,7438] | 0,7535 | 0,3587 | 0,0441 | 1,000 |
| `confirm_general` | 0,9008 | [0,8933; 0,9083] | 0,8153 | 0,1673 | 0,0900 | 1,000 |
| `mr_verdict` | 0,9016 | [0,8966; 0,9065] | 0,8654 | 0,1421 | 0,0220 | 1,000 |
| `mimic_suite` | 0,7733 | [0,7606; 0,7863] | 0,7797 | 0,3373 | 0,0687 | 1,000 |

Diferencias pareadas frente a su propio base zero-shot:

| Conjunto | Δ precisión | IC 95 % |
|---|---|---|
| `panel` | +0,0028 | [-0,0069; +0,0129] |
| `knowledge` | -0,0013 | [-0,0090; +0,0062] |
| `confirm_general` | +0,0234 | [+0,0180; +0,0291] |
| `mr_verdict` | +0,1665 | [+0,1590; +0,1738] |
| `mimic_suite` | +0,1432 | [+0,1281; +0,1580] |

Comparativa de la frontera de Pareto (macro de 5 conjuntos):

| Modelo | Parámetros (B) | Macro 5 conjuntos | `panel` | `knowledge` | `confirm_general` | `mr_verdict` | `mimic_suite` |
|---|---|---|---|---|---|---|---|
| Osler-9B-rc0 | 8,39 | 0,7801 | 0,5927 | 0,7322 | 0,9008 | 0,9016 | 0,7733 |
| pplx-27B | 27,00 | 0,7600 | 0,6510 | 0,7823 | 0,8843 | 0,8093 | 0,6729 |
| Osler-4B-rc0 | 4,00 | 0,7530 | 0,5502 | 0,6728 | 0,8883 | 0,8941 | 0,7597 |
| d3-flash | 8,39 | 0,7132 | 0,5899 | 0,7335 | 0,8774 | 0,7351 | 0,6301 |
| pplx-flash | 4,00 | 0,7009 | 0,5615 | 0,6835 | 0,8889 | 0,7466 | 0,6240 |
| Clef-Flash | 9,00 | 0,6929 | 0,5711 | 0,6864 | 0,8933 | 0,6831 | 0,6306 |
| MedDecider-9B | 9,00 | 0,6853 | 0,5603 | 0,6997 | 0,8825 | 0,6653 | 0,6189 |
| MedDecider-4B | 4,00 | 0,6732 | 0,5436 | 0,6703 | 0,8820 | 0,6681 | 0,6019 |

Eficiencia declarada:

- Latencia p50 en batch 1: 33,7140 ms por ítem (p95: 93,1080 ms por ítem).
- Rendimiento en batch 16: 16,7970 ítems/s.
- VRAM máxima asignada en batch 1: 17,3230 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: 17,3230 GB de pico asignado en batch 1, según la medición del autor; en bfloat16 el modelo de 8,39 B requiere al menos ese orden de memoria.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por la VRAM medida, una GPU de 24 GB o más (por ejemplo, una RTX 4090 de 24 GB) sería el mínimo práctico en bfloat16, y las A100/H100 de 40 u 80 GB permitirían lotes mayores.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más en bfloat16; no se documentan opciones de cuantización para reducir la huella.
- Opciones de despliegue: carga mediante `transformers` (`AutoModel.from_pretrained` con `trust_remote_code=True` y `dtype=torch.bfloat16`) y el módulo `meddecide.distill.d3_train` (`D3Student`, `prepare_rows`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y rendimiento: p50 de 33,7140 ms por ítem y p95 de 93,1080 ms por ítem en batch 1; 16,7970 ítems/s en batch 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Macro 5 conjuntos | `mr_verdict` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Osler-9B-rc0 | 8,39 B | 0,7801 | 0,9016 | Apache-2.0 | Hugging Face (`abhinand/Osler-9B`) |
| pplx-27B | 27,00 B | 0,7600 | 0,8093 | no disponible | no disponible |
| Osler-4B-rc0 | 4,00 B | 0,7530 | 0,8941 | no disponible | no disponible |
| d3-flash (base) | 8,39 B | 0,7132 | 0,7351 | no disponible | no disponible |
| Clef-Flash | 9,00 B | 0,6929 | 0,6831 | no disponible | no disponible |
| MedDecider-9B | 9,00 B | 0,6853 | 0,6653 | no disponible | no disponible |

Osler-9B-rc0 se sitúa en la frontera de Pareto de dos ejes (media general OOD frente a media de auditoría clínica) y no está dominado en ninguno de los cinco conjuntos principales entre modelos de 10 B o menos, según la model card. La longitud de contexto de los modelos comparables no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: no tiene `lm_head`, por lo que no puede usarse para extracción verbatim ni para tareas generativas.
- Paridad, no mejora, en QA general OOD frente a su base zero-shot: `panel` +0,0028 con intervalo que incluye cero y `knowledge` -0,0013 con intervalo que incluye cero.
- Fallo retenido reportado: en `mr_heldout_test` / `synthea_indicator_evidence_v1` (n=514, plantilla excluida del entrenamiento) el 9B obtiene 0,356 de precisión (límite superior del IC 0,3988) frente al azar de 0,5, mientras que su base d3-flash obtiene 0,4591. La celda está marcada como `READOUT_FAIL`.
- La calibración ajustada solo en desarrollo no transfiere a la distribución posterior al corte: la confianza media en `confirm_general` es 0,8137 frente a una precisión de 0,9008, con ECE de 0,0900 (el modelo es infraconfiado en esa distribución). No se ajustaron temperaturas sobre test.
- Riesgo de memorización de PHI: la auditoría de membresía reporta un AUC de 0,5876 [0,5703; 0,6051] frente a un control base de 0,5408, con una diferencia de 0,0468 [0,0316; 0,0626]; el conjunto de compatibilidad histórica Y10 da 0,5018. El entrenamiento incluyó 539.807 filas derivadas de MIMIC.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero la LICENSE y NOTICE del modelo base viajan con el proyecto y deben respetarse.
- El repositorio tiene 0,0 GB y 0 descargas en el momento de la consulta, lo que sugiere que los pesos pueden no estar disponibles en el árbol público; el código de ejemplo carga `weights/osler_9b_rc0.pt` de forma local.
- No se documentan sesgos demográficos específicos más allá de la auditoría de PHI/memorización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhinand/Osler-9B
- Modelo base: https://huggingface.co/vllm-sr/d3-flash (revisión `67e03e1bc157961c582ee7c6a35d9b15fada3dec`)
- Tablas completas de la frontera de Pareto: `loops/osler_rc0/PARETO.md` (referenciado en la model card, no enlazado)
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código o demos adicionales.

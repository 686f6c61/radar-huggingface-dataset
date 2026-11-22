# eltokh7/inkling-2-mini-decision

## Resumen

Inkling-2-Mini Decision es un modelo de decisión de pesos abiertos construido por eltokh7 sobre el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo generativo en el sentido habitual: en lugar de producir prosa o JSON token a token, evalúa un estado (por ejemplo, el texto de un correo de cliente) junto con preguntas tipadas (`choice`, `noul`, `score`) en un único forward pass y devuelve la decisión directamente, sin generar tokens de razonamiento.

Su propuesta central es el concepto de "System 1.5": un modelo que decide dinámicamente cuánta profundidad de cómputo invertir en cada consulta. La arquitectura base es un MoE de 26,4B parámetros totales con 3,4B–5,4B activos y 24 capas físicas con un núcleo recurrente de 12 capas; mediante un bucle interno puede operar como 24, 36 o 48 capas lógicas. Un mecanismo de salida temprana calibrado determina si basta con una iteración (Loop 1) o si conviene agotar las tres (Loop 3).

Es relevante porque demuestra que un modelo de 5,4B parámetros activos puede igualar en decisiones rutinarias a un denso de 27B (Kev-27B: 86,3% frente a 85,56%) con aproximadamente 5× menos FLOPs de prefill activos, y porque ofrece latencias reales en GPU (81,4 ms de mediana en batch-1 con salida temprana) que lo hacen viable para enrutamiento y clasificación en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo recurrente (looped transformer) y salida temprana; cabezas de decisión `CoreGateHead` y `JointSchemaHead` |
| Parámetros totales | 26,4B (base congelada) + 17,5M LoRA + 1,2M gate + 6,0M cabeza de decisión |
| Parámetros activos | 3,4B–5,4B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `modeling.InklingDecisionModel.from_pretrained`) |

## Arquitectura y entrenamiento

El modelo parte de thinkingmachines/Inkling-2-Mini congelado (26,4B totales, 3,4B–5,4B activos, 24 capas físicas con núcleo recurrente de 12 capas) y le añade adaptadores LoRA de rango 32 (17,5M parámetros) sobre `self_attn.{q,k,v,o}_proj.{linear,gate_proj}`. Se eliminan `lm_head` y `vision_tower`, ya que el objetivo es la decisión de texto y no la generación. Sobre esa base se montan dos componentes entrenables: un `CoreGateHead` de 1,2M parámetros y un `JointSchemaHead` de 6,0M parámetros.

El `CoreGateHead` implementa la salida temprana: tras el Loop 1 o el Loop 2, una sonda bilineal de ~0,05 ms lee la salida del núcleo en la capa 17 antes de ejecutar las capas de salida 18–23. Si la confianza calibrada supera el umbral, se omiten las iteraciones restantes y las capas de salida se ejecutan una sola vez. El `JointSchemaHead` opera en dos etapas: primero los tokens `<decide>` y `</opt>` hacen cross-attention sobre 8 tokens resumen del estado de entrada (enrutamiento de evidencia), y después las opciones y `<decide>` se autoatienden entre sí para comparar directamente antes del scoring bilineal tipo pointer. El entrenamiento usa supervisión profunda multi-bucle (0,2·L1 + 0,3·L2 + 0,5·L3) con entropía cruzada suavizada por etiquetas más pérdida Brier (0,5), seguido de calibración de temperatura sobre `decision-v7/calibration`. No se documentan en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset más allá de los conjuntos de evaluación citados.

## Capacidades

- Decisión estructurada sobre preguntas tipadas: `choice` (selección entre criterios), `noul` (sí/no) y `score` (puntuación).
- Evaluación en un único forward pass sin tokens de razonamiento generados.
- Profundidad adaptativa: decide dinámicamente entre 1, 2 o 3 bucles (24, 36 o 48 capas lógicas) según la dificultad estimada de la consulta.
- Salida temprana calibrada con umbral configurable (`threshold`), incluyendo la opción de forzar siempre las tres iteraciones (`threshold=1.01`).
- Enrutamiento y clasificación multi-etiqueta sobre texto de entrada (el ejemplo de la model card es un ticket de atención al cliente con preguntas de equipo y urgencia).
- No soporta generación de texto libre, tool calling, agentes ni visión (la torre de visión se elimina explícitamente).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un esquema `choice` con categorías (facturación, técnico, ventas) y devuelve la asignación en un solo forward pass; la salida temprana hace que la mayoría de tickets rutinarios se resuelvan en Loop 1 a 65,6 ms de mediana en batch-1.
- Triaje de urgencia: una pregunta `noul` sobre si el caso requiere escalado inmediato permite clasificar colas de correo con latencias de decenas de milisegundos, adecuadas para procesar lotes grandes por GPU.
- Moderación y clasificación de contenido: preguntas `choice` o `score` sobre textos permiten puntuar o etiquetar contenido con coste de cómputo bajo gracias a los 3,4B–5,4B parámetros activos.
- Decisión en pipelines de agentes: como paso de "System 1" dentro de un sistema mayor, decide la siguiente acción o ruta sin consumir presupuesto de generación de tokens, reservando modelos generativos para los casos que el gate deriva a Loop 3.
- Filtrado previo en sistemas RAG: decidir si una consulta es respondible con el contexto recuperado o requiere otra búsqueda, usando el estado compuesto por consulta y documentos.
- Clasificación por lotes de alto throughput: con `bs = 8` y `causal_conv1d` alcanza 35,8 q/s en Loop 1 y 16,3 q/s en Loop 3, útil para reprocesar corpus o backfills de etiquetado.
- Evaluación de riesgo en formularios o solicitudes: preguntas `score` sobre el texto de una solicitud para priorizar revisiones humanas.

## Benchmarks y rendimiento

Resultados publicados en la model card (no se han verificado de forma independiente):

| Split | n | Loop 1 (24L) | Loop 2 (36L) | Loop 3 (48L) | Brier L3 | ECE L3 | Δ (L3 − L1) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `decision-v7/dev` | 1.468 | 81,95% | 85,63% | 85,63% | 0,2056 | 0,0243 | +3,68 pp |
| `decision-v7/test` | 1.440 | 82,29% | 84,93% | 85,56% | 0,1944 | 0,0235 | +3,27 pp |
| `hard-v1/dev` (OOD no entrenado) | 1.083 | 39,89% | 60,85% | 66,67% | 0,4382 | 0,0522 | +26,78 pp |
| `hard-v1/test` (OOD no entrenado) | 1.088 | 42,56% | 58,18% | 66,82% | 0,4350 | 0,0750 | +24,26 pp |

Latencia real en RTX PRO 6000 Blackwell (LoRA fusionado con `merge_and_unload` y `torch.compile`, `v7/test`, 60 preguntas, media de 223 tokens, mediana p50 con media entre paréntesis):

| Modo | Acc `v7/test` | Salida en L1 `v7/test` | Salida en L1 `hard-v1/dev` | Mediana (p50) | Media | Aceleración vs. L3 |
|---|---:|---:|---:|---:|---:|---:|
| Loop 3 fijo (48L) | 85,56% | 0,0% | 0,0% | 136,8 ms | 146,3 ms | 1,00× |
| Loop 2 fijo (36L) | 84,93% | — | — | 100,2 ms | 107,0 ms | 1,37× |
| Loop 1 fijo (24L) | 82,29% | 100,0% | 100,0% | 65,6 ms | 70,1 ms | 2,09× |
| Salida temprana (τ = 0,90) | 85,49% | 54,2% | 8,8% | 81,4 ms | 97,4 ms | 1,68× |
| Salida temprana (τ = 0,85) | 85,35% | 60,0% | 13,9% | 79,6 ms | 95,4 ms | 1,72× |
| Por lotes (`bs = 8`, L1 / L3) | — | — | — | 27,9 / 61,4 ms/q | — | 35,8 / 16,3 q/s |

Comparación con modelos densos citada por el autor: Kev-27B obtiene 86,3% en `decision-v7/test` frente al 85,56% de este modelo; en `hard-v1/dev` y `hard-v1/test`, Kev-9B v1 obtiene 58,2% y 58,4%, frente a 66,67% y 66,82% de Inkling-2-Mini Decision en Loop 3.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 26,4B parámetros totales en el modelo base, la inferencia en precisión completa requiere hardware de clase servidor; las cifras de latencia publicadas corresponden a una RTX PRO 6000 Blackwell.
- GPU recomendadas: RTX PRO 6000 Blackwell es la única GPU con mediciones publicadas. No se documentan resultados en A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no disponible; no se han publicado mediciones ni requisitos de memoria para GPUs de consumo.
- Opciones de despliegue: carga mediante la librería `transformers` con la clase `InklingDecisionModel` del módulo `modeling` del repositorio; el autor documenta `merge_and_unload()` y `torch.compile` para reducir latencia, y `causal_conv1d` para inferencia por lotes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 65,6 ms (Loop 1), 100,2 ms (Loop 2) y 136,8 ms (Loop 3) en batch-1; 81,4 ms con salida temprana a τ = 0,90; 27,9 ms/pregunta (35,8 q/s) en Loop 1 y 61,4 ms/pregunta (16,3 q/s) en Loop 3 con `bs = 8`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | `decision-v7/test` | `hard-v1/dev` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini Decision (Loop 3) | 26,4B totales / 3,4B–5,4B activos | no disponible | 85,56% | 66,67% | Apache 2.0 | Hugging Face |
| Inkling-2-Mini Decision (salida temprana τ = 0,90) | 26,4B totales / 3,4B–5,4B activos | no disponible | 85,49% | no disponible | Apache 2.0 | Hugging Face |
| Kev-27B (denso) | 27B | no disponible | 86,3% | no disponible | no disponible | no disponible |
| Kev-9B v1 (denso) | 9B | no disponible | no disponible | 58,2% | no disponible | no disponible |

Los datos de Kev-27B y Kev-9B v1 provienen de la model card del autor; no se dispone de información adicional sobre esos modelos en la documentación proporcionada.

## Limitaciones y advertencias

- La model card incluye una sección "Limitations & Negative Results" que aparece truncada en la información disponible; no es posible detallar su contenido.
- El modelo no genera texto libre: solo responde a esquemas de preguntas tipadas (`choice`, `noul`, `score`), por lo que no sirve como sustituto de un LLM conversacional.
- La salida temprana introduce una dependencia del umbral: a τ = 0,90, el 45,8% de las preguntas rutinarias de `decision-v7` no salen en Loop 1, y el 91,2% de las preguntas difíciles de `hard-v1` se enrutan a Loop 3, con el coste de latencia asociado.
- En tareas OOD difíciles (`hard-v1`), la precisión en Loop 3 es del 66,67%–66,82%, con Brier de 0,44–0,44 y ECE de 0,052–0,075; el rendimiento cae drásticamente en Loop 1 (39,89%–42,56%), lo que indica que el gate es crítico para no degradar la calidad en consultas fuera de distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados en el repo o que el artefacto es mínimo; conviene verificar la disponibilidad real de los ficheros antes de integrarlo.
- No se documentan sesgos conocidos, comportamiento multilingüe ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales (atribución y aviso de cambios).
- Las mediciones de latencia provienen de una única GPU (RTX PRO 6000 Blackwell) y de un conjunto de 60 preguntas; no hay datos de latencia en otras GPUs ni de rendimiento en producción a mayor escala.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las decisiones pueden ser incorrectas con confianza alta si la calibración se degrada fuera de la distribución de entrenamiento; el ECE de 0,052–0,075 en `hard-v1` indica descalibración apreciable en OOD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eltokh7/inkling-2-mini-decision
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

# jiajinda/so101-shallow-pi05-l6-red-block-to-target-v234

## Resumen

Shallow-π0.5 L6 es un checkpoint de política robótica para el brazo SO-101, obtenido por destilación de un modelo π0.5 completo (18 capas por stream) a un estudiante de 6 capas por stream. Lo desarrolla el usuario jiajinda y se publica bajo el ecosistema OpenPI (JAX/Orbax) con licencia Gemma. La tarea concreta es recoger un bloque rojo y colocarlo sobre un objetivo marcado con una X. El modelo base es el fine-tune π0.5 `jiajinda/so101-03-pi05-red-block-to-target-v234`, del que hereda pesos de visión, embeddings y proyecciones.

La relevancia técnica está en la reducción de tamaño: el estudiante pasa de 3.353 B a 1.749 B de parámetros manteniendo la arquitectura π0.5 (VLM PaliGemma gemma_2b como backbone de prefijo y un action expert gemma_300m que genera chunks de 50 acciones de 32 dimensiones mediante flow matching con 10 pasos de Euler). La destilación combina la pérdida de tarea original con una pérdida de destilación de velocidad (KD) sobre las predicciones del teacher congelado; no se usa la pérdida de destilación de atención del paper Shallow-π, por lo que el autor advierte explícitamente que no es una reproducción completa.

El checkpoint seleccionado offline es `checkpoints/6000` (el final es `10000`). No hay rollouts físicos todavía: el estado en robot real está pendiente y el protocolo de evaluación (20 layouts × 2 políticas) está preparado pero no ejecutado. Los resultados publicados son validación offline de destilación sobre episodios retenidos del estudiante, no medidas de éxito en tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (OpenPI `Pi0Config(pi05=True)`): VLM PaliGemma gemma_2b + action expert gemma_300m, flow matching con AdaRMSNorm sobre el tiempo de flujo |
| Parametros totales | 1.749 B (estudiante); teacher 3.353 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos almacenados en bfloat16 (EMA 0.99), idénticos bit a bit a lo que OpenPI restaura desde los originales fp32 |
| Idiomas soportados | no disponible (modelo de robótica; sin evaluación lingüística publicada) |
| Licencia | gemma |
| Formato de pesos | OpenPI (JAX/Orbax), `checkpoints/<step>/params`; repo de 13.7 GB |

Capas por stream: VLM 6 (frente a 18 del teacher), action expert 6 (frente a 18), visión SigLIP So400m/14 27 capas copiadas y luego entrenadas. Ancho: 2048 en el VLM, 1024 en el action expert. Chunk de 50 acciones × 32 dimensiones (6 usadas), 10 pasos de Euler.

## Arquitectura y entrenamiento

El estudiante replica la topología π0.5 pero con 6 capas por stream en lugar de 18. La inicialización toma la capa *i* del estudiante de la capa `[0, 3, 7, 10, 14, 17][i]` del teacher en ambos streams; el resto de pesos (visión, embeddings, normas finales, condicionamiento temporal AdaRMS, proyecciones de entrada/salida de acción y MLP de tiempo) se copian sin cambios. Se preserva el comportamiento π0.5: tokens de estado discretos en el prompt y condicionamiento AdaRMSNorm sobre el tiempo de flujo.

La pérdida es `L = L_task + L_KD`, con `L_task = mean((v_S − (ε − a))²)` y `L_KD = mean((v_S − sg(v_T))²)`, promediada sobre batch × 50 pasos × 32 dimensiones. Teacher y estudiante ven la misma observación aumentada, las mismas acciones ruidosas `x_t = t·ε + (1−t)·a` y el mismo tiempo de flujo `t ~ Beta(1.5, 1)·0.999 + 0.001` (convención OpenPI, t = 1 es ruido), remuestreado en cada paso. El teacher está congelado en bfloat16 sin gradientes ni estado de optimizador; todos los parámetros del estudiante se entrenan, incluido el encoder de visión.

Entrenamiento: 10.000 actualizaciones AdamW (b1 0.9, b2 0.95, weight decay 1e-10, clip 1.0), batch efectivo 32 (microbatch 4 × 8 de acumulación), warmup de LR 500 pasos hasta 1e-5 y cosine hasta 1e-6, EMA 0.99, semilla 0, cómputo bf16 con parámetros y pérdida en fp32. Una H100 80 GB, 1,58 s/actualización, pico de 50,4 GB, aproximadamente 4,9 h de GPU repartidas en 7 jobs reanudables. Datos: 45 de los 50 episodios de v2 (10) + v3 (20) + v4 (20); 5 episodios retenidos del entrenamiento del estudiante (`data/split_seed0.json`, semilla 0), de los cuales el teacher vio 4, por lo que las métricas offline son validación de destilación, no generalización a escenas nuevas.

## Capacidades

- Generación de acciones robóticas de manipulación: chunks de 50 acciones de 32 dimensiones (6 dimensiones efectivas) para el brazo SO-101, con 10 pasos de denoising por chunk.
- Ejecución de una tarea concreta de pick-and-place: recoger el bloque rojo y depositarlo sobre el objetivo marcado con X.
- Percepción visual integrada mediante SigLIP So400m/14 con 3 slots de imagen.
- Condicionamiento por estado discreto en el prompt y por tiempo de flujo (AdaRMSNorm), herencia directa de π0.5.
- Destilación de velocidad: el estudiante aproxima las predicciones del teacher en el espacio de velocidad del flow matching.
- No se documentan capacidades de tool calling, agentes multi-paso, diálogo multilingüe, matemáticas, código ni audio; es un modelo de política robótica, no un LLM de propósito general.

## Casos de uso

- Pick-and-place de laboratorio sobre SO-101: el modelo ejecuta la secuencia de recogida del bloque rojo y colocación en el objetivo X a partir de observaciones visuales, adecuado para prototipos de manipulación de bajo coste con un brazo de sobremesa.
- Despliegue en hardware de gama consumer: con 1.749 B de parámetros y latencias de 30,2 ms P50 en H100 y 47,2 ms en A100 para `Policy.infer` (batch 1), es viable en estaciones con una sola GPU frente al teacher, que requiere 51,1 ms y 86,1 ms respectivamente.
- Sustitución de un teacher más pesado en inferencia: al reducir el modelo a la mitad de parámetros manteniendo la arquitectura, puede reemplazar al π0.5 de 3.353 B en bucles de control donde el presupuesto de cómputo o de memoria es limitado.
- Investigación en destilación de políticas VLA: sirve como caso reproducible de destilación capa-a-capa con pérdida de tarea más KD de velocidad, con checkpoints intermedios (2000, 4000, 6000, 8000, 10000) para estudiar la evolución de la fidelidad al teacher.
- Evaluación comparativa de fidelidad teacher-student: los diagnósticos offline publicados (MSE de tarea, MSE de KD, discrepancia de brazo y pinza) permiten medir cuánto se degrada la política al comprimir capas, con métricas de referencia del propio teacher.
- Base para fine-tuning en tareas de manipulación similares: al conservar visión, embeddings y proyecciones del teacher, es un punto de partida para reentrenar sobre nuevos layouts o variantes de objeto con un coste de cómputo reducido (≈4,9 h en una H100 para 10.000 updates).

## Benchmarks y rendimiento

Resultados offline de validación de destilación sobre 529 frames (cada 5º frame de los 5 episodios retenidos del estudiante), 3 semillas de ruido fijas y 10 pasos de denoising. Son diagnósticos, no tasas de éxito en tarea.

| Checkpoint | MSE tarea val (6 dims) | MSE KD val (6 dims) | Brazo vs teacher, pasos 0–9 (grados) | Pinza vs teacher, 0–9 | Brazo vs grabado, 0–9 (grados) | Suavidad |
|---|---|---|---|---|---|---|
| Teacher | 0,0239 | 0,0000 | 0,000 | 0,000 | 0,684 | 0,088 |
| 2000 | 0,0546 | 0,0428 | 1,250 | 1,240 | 1,491 | 0,179 |
| 4000 | 0,0627 | 0,0489 | 1,133 | 1,200 | 1,380 | 0,148 |
| 6000 (seleccionado) | 0,0701 | 0,0544 | 1,111 | 1,172 | 1,354 | 0,137 |
| 8000 | 0,0785 | 0,0617 | 1,097 | 1,197 | 1,328 | 0,120 |
| 10000 | 0,0838 | 0,0660 | 1,098 | 1,183 | 1,331 | 0,125 |

Referencia de escala: la dispersión entre semillas del teacher es de 0,303 grados en brazo y 0,387 en pinza. La concordancia apertura/cierre de pinza con el teacher en pasos 0–9 es del 97,2 % para el checkpoint 6000 (el teacher coincide consigo mismo entre semillas el 98,7 %); el desplazamiento mediano del paso de conmutación de pinza del estudiante es de 3,8 pasos (el teacher consigo mismo: 1).

Latencia (batch 1, mismas opciones JAX/XLA, pesos bf16, 10 pasos, chunk de 50, sin red; P50/P95 en ms, 200 llamadas tras 20 de calentamiento):

| Etapa | H100 teacher | H100 student | A100 teacher | A100 student |
|---|---|---|---|---|
| `Policy.infer` extremo a extremo | 51,1 / 51,2 | 30,2 / 30,3 | 86,1 / 88,3 | 47,2 / 47,6 |
| Modelo (`sample_actions`) | 40,0 / 40,1 | 19,2 / 19,3 | 73,6 / 73,7 | 34,8 / 34,9 |
| SigLIP (3 slots) | 7,9 / 7,9 | 7,9 / 7,9 | 13,6 / 13,6 | 13,8 / 13,9 |
| Prefill de prefijo con visión | 18,7 / 18,9 | 11,6 / 11,6 | 40,6 / 40,7 | 22,8 / 22,9 |
| 10 pasos de denoising | 21,2 / 21,3 | 7,5 / 7,5 | 32,7 / 32,8 | 11,6 / 11,7 |
| Transformadas de entrada (CPU) | 4,7 / 4,8 | 4,8 / 4,8 | 5,1 / 5,2 | 5,1 / 5,2 |

El tiempo de compilación y el de red quedan excluidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita para inferencia; el repo ocupa 13,7 GB y el entrenamiento alcanzó un pico de 50,4 GB en H100 80 GB (incluyendo estados de optimizador y activaciones).
- GPU validadas en las mediciones: NVIDIA H100 80 GB y A100. No hay datos publicados de RTX 4090 ni de otras GPU consumer.
- Cabe en consumer GPU: no disponible; no se han publicado pruebas en GPU de gama consumer.
- Despliegue: OpenPI en el commit `215abfb` con su entorno `uv.lock`; checkpoints en formato JAX/Orbax restaurados por la inferencia de OpenPI. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia: `Policy.infer` batch 1 en 30,2 ms P50 (H100) y 47,2 ms P50 (A100) para el estudiante, frente a 51,1 ms y 86,1 ms del teacher. Throughput no publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas por stream | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Shallow-π0.5 L6 (este) | 1,749 B | 6 (VLM y action expert) | no disponible | gemma | OpenPI JAX/Orbax | Checkpoint publicado, rollouts físicos pendientes |
| π0.5 teacher `so101-03-pi05-red-block-to-target-v234` | 3,353 B | 18 | no disponible | gemma | OpenPI JAX/Orbax | Fine-tune desplegado, `checkpoints/8000` |
| π0.5 OpenPI `Pi0Config(pi05=True)` genérico | 3,353 B | 18 | no disponible | gemma | OpenPI JAX/Orbax | Modelo base de la familia |

No se dispone de datos publicados de otros estudiantes Shallow-π comparables en esta información; la comparación con alternativas de la misma categoría (otros VLA destilados para SO-101) queda como no disponible.

## Limitaciones y advertencias

- No es una reproducción completa de Shallow-π: se usan la pérdida de tarea de flow matching y la destilación de velocidad, pero no la pérdida de destilación de atención del paper.
- Estado en robot físico pendiente: no hay rollouts reales; el protocolo de 20 layouts × 2 políticas está preparado pero no ejecutado. Las métricas publicadas son validación offline de destilación, no tasas de éxito.
- Las métricas offline se calculan sobre episodios retenidos del estudiante, pero 4 de esos 5 episodios fueron vistos por el teacher; no miden generalización a escenas nuevas.
- El modelo está especializado en una única tarea (bloque rojo a objetivo X) y un único robot (SO-101); no se documenta su comportamiento fuera de ese dominio.
- Sesgos conocidos: no disponibles. Riesgo de alucinación en el sentido lingüístico no aplicable; el riesgo análogo es la deriva de la política ante observaciones fuera de distribución, no cuantificada en la información disponible.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de la política de uso de Gemma; conviene revisarlas antes de cualquier despliegue en producción.
- Solo se usan 6 de las 32 dimensiones de acción; el resto del espacio de salida no aporta control efectivo.
- La inferencia requiere OpenPI en el commit `215abfb`; cambios de versión pueden romper la restauración de pesos.
- Idiomas y contexto: no disponibles; no es un modelo de lenguaje para uso conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiajinda/so101-shallow-pi05-l6-red-block-to-target-v234
- Modelo base (teacher): https://huggingface.co/jiajinda/so101-03-pi05-red-block-to-target-v234
- Dataset v2: https://huggingface.co/datasets/jiajinda/red-block-to-target-v2
- Dataset v3: https://huggingface.co/datasets/jiajinda/red-block-to-target-v3
- Dataset v4: https://huggingface.co/datasets/jiajinda/red-block-to-target-v4

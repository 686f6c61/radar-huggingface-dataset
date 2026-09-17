# Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r07

## Resumen

svd-safety-l2_remove50_swapgapiter_b010_r07 (nombre interno del autor: `Jeesup`) es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante SVD-LLM hasta eliminar el 50,01 % de los parámetros densos y posteriormente editado con 7 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro (regla de selección `gap_iter`, hasta un 0,1 % de los parámetros densos por ronda, presupuesto total de la ejecución completa del 1,0 %). Es una celda concreta de una malla experimental que cruza reglas de selección de componentes y presupuestos de restauración.

El modelo no pretende ser un asistente conversacional de propósito general, sino un sujeto experimental para cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y qué regla de selección de componentes repara mejor ese daño. Sus métricas publicadas son de seguridad, no de capacidad: 0,3050 de tasa de éxito de ataque (ASR) en AdvBench, 0,2950 en StrongREJECT, ambas evaluadas con el juez de HarmBench, y 0,0699 de macro over-refusal medido con WildGuard.

Su relevancia es metodológica: documenta de forma explícita que la compresión por sí sola eleva la tasa de éxito de ataques y ofrece un punto de control intermedio reproducible (semilla 42) para estudiar la dinámica de restauración iterativa. Está sujeto a la Llama 2 Community License y no debe desplegarse como asistente sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con matrices de proyección comprimidas mediante SVD-LLM; edición posterior por intercambio iterativo de componentes |
| Parametros totales | 6.738.415.616 segun el recuento de safetensors (el autor declara una fraccion de parametros resultante de 0.4999) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-2-7b-chat emplea 4096 tokens) |
| Tipos de cuantizacion | no disponible; no se publican versiones GGUF, AWQ, GPTQ ni EXL2. Solo pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (repo de 13,5 GB) |

Datos de procedencia declarados por el autor: base `meta-llama/Llama-2-7b-chat-hf`; compresion SVD-LLM con 50,01 % de parametros eliminados; regla de seleccion `gap_iter`; presupuesto de restauracion 1,000 % de los parametros densos; 4800 componentes restaurados y 4800 sustituidos; fraccion de parametros resultante 0,4999; semilla 42; 7 de 10 rondas iterativas aplicadas; tamanos de bloque de 0,100 % de parametros densos por ronda; 45.307.392 parametros intercambiados (0,70 % de los parametros de proyeccion densos); valor de intercambio `insert` (solo valor de insercion, desalojo ordenado por sigma); checkpoint intermedio de una ejecucion mas larga.

Advertencia tecnica: el recuento de parametros que reportan los safetensors (6.738.415.616) coincide con el del Llama-2-7b denso completo, lo que no concuerda con la fraccion 0,4999 declarada. Conviene inspeccionar las formas reales de los tensores antes de dimensionar hardware o de asumir que la huella de memoria es la mitad de la del modelo base.

## Arquitectura y entrenamiento

La arquitectura de partida es el transformer decoder-only de Llama 2 con 7 000 millones de parametros, normalizacion RMSNorm pre-norm, RoPE y atencion causal con Grouped-Query Attention, en su variante afinada por instrucciones y RLHF (`Llama-2-7b-chat-hf`). Sobre esa base no hay entrenamiento adicional: la modificacion es de compresion y edicion de pesos. SVD-LLM descompone en valores singulares las matrices de proyeccion y reconstruye versiones de rango reducido, eliminando el 50,01 % de los parametros densos.

Sobre el modelo comprimido se aplica un procedimiento iterativo de intercambio de parametros neutro, seleccionado por la regla `gap_iter`. En cada ronda se sustituye hasta un 0,1 % de los parametros densos: se insertan componentes y se desalojan otros tantos siguiendo un criterio de ordenacion por valor sigma (`insert` como valor de insercion). Este checkpoint corresponde a la ronda 7 de 10, es decir, a un estado intermedio dentro de una ejecucion cuyo presupuesto total es del 1,0 % de los parametros densos. No se documentan en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni detalles adicionales del pipeline de RLHF o DPO, mas alla de lo que corresponde al Llama-2-7b-chat original.

## Capacidades

- Generacion de texto conversacional: hereda el formato de dialogo con tokens especiales `[INST]`/`[/INST]` del Llama-2-7b-chat, aunque degradado por la compresion y por la edicion de parametros.
- Razonamiento y conocimiento general: procedentes del modelo base, no medidos ni verificados en este checkpoint (no se publican MMLU, GSM8K ni HumanEval).
- Tool calling / function calling: no documentado. Llama-2-7b-chat no incluye un formato nativo de llamada a herramientas.
- Uso como agente y razonamiento multi-paso: no documentado y desaconsejado en produccion por el propio autor.
- Capacidades multilingues: no documentadas; el campo de idiomas de la ficha de HuggingFace no esta informado.
- Capacidades especiales: ninguna (sin modo "thinking", sin vision, sin audio). Su unica particularidad es ser un artefacto de investigacion sobre compresion y seguridad.
- Comportamiento de rechazo: medido con WildGuard, con un macro over-refusal de 0,0699, lo que indica una propension baja a rechazar peticiones benignas, a costa de una tasa de exito de ataque elevada.

## Casos de uso

- Estudio de la degradacion de seguridad bajo compresion: sirve como punto de medida para cuantificar cuanto sube la ASR cuando se elimina el 50 % de los parametros de un modelo alineado, usando AdvBench y StrongREJECT con el juez de HarmBench.
- Evaluacion comparativa de reglas de seleccion de componentes: esta celda aísla la regla `gap_iter` frente a otras reglas de la malla experimental, permitiendo atribuir diferencias de ASR al criterio de seleccion y no al presupuesto.
- Calibracion y validacion de jueces de seguridad: al ser un modelo deliberadamente degradado, es util como caso positivo para comprobar si un juez (HarmBench, WildGuard) detecta respuestas daninas con la sensibilidad esperada.
- Investigacion en interpretabilidad: permite analizar que subespacios de las matrices de proyeccion sostienen el comportamiento de rechazo y como se recuperan al reinsertar componentes.
- Analisis de la dinamica de restauracion iterativa: al ser la ronda 7 de 10 de una ejecucion con presupuesto del 1,0 %, permite trazar la curva de recuperacion de seguridad frente al numero de rondas aplicadas.
- Baseline negativo en pipelines de red teaming y evaluacion de alineacion: se puede emparejar con un modelo seguro de la misma familia para medir la capacidad discriminativa de un clasificador de contenido.
- Reproducibilidad metodologica: la semilla 42 declarada facilita la replicacion del pipeline de compresion y edicion por parte de otros grupos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Juez |
|---|---|---|---|
| AdvBench | ASR (tasa de exito de ataque) | 0.3050 | HarmBench |
| StrongREJECT | ASR (tasa de exito de ataque) | 0.2950 | HarmBench |
| WildGuard | Macro over-refusal | 0.0699 | no aplica |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se incluye el valor de referencia del modelo denso sin comprimir, por lo que no puede calcularse el delta de seguridad atribuible a la compresion y a la edicion.

## Requisitos de hardware

- Pesos en fp16/bf16 asumiendo el recuento de safetensors: 6.738.415.616 x 2 bytes ≈ 13,5 GB, coherente con el tamano del repositorio (13,5 GB). Con la cache KV a 4096 tokens y el overhead del runtime, la demanda practica se situa en torno a 15-16 GB de VRAM.
- Escenario alternativo: si la fraccion 0,4999 declarada por el autor corresponde a tensores efectivamente comprimidos en memoria, la huella en fp16 bajaría a unos 6,7 GB y el modelo cabria en GPU de 8-12 GB. Esta discrepancia debe resolverse inspeccionando los tensores antes de decidir el hardware.
- Cuantizacion estimada sobre los 6,74 B declarados: int8 ≈ 7 GB, int4 ≈ 3,5-4 GB. No hay versiones cuantizadas publicadas, por lo que habria que generarlas.
- GPU recomendadas: A100 (40/80 GB), H100, L4, RTX 4090 y RTX 3090 para fp16 sin cuantizar; RTX 4080 y A4000 (16 GB) al limite; RTX 3060 12 GB, RTX 4070 y similares solo con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en fp16 con holgura, y en tarjetas de 12-16 GB con cuantizacion o si se confirma la huella reducida.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (los tags `text-generation-inference` y `endpoints_compatible` estan presentes), y previsiblemente vLLM, aunque no se verifica en la informacion disponible. No hay GGUF, de modo que llama.cpp u Ollama exigirian una conversion manual con soporte de tensores de rango reducido, tarea no trivial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | ASR AdvBench | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapiter_b010_r07 | 6.738.415.616 declarados en safetensors (fraccion 0,4999 segun el autor) | no disponible | Llama 2 Community License | 0.3050 (juez HarmBench) | HuggingFace, safetensors |
| meta-llama/Llama-2-7b-chat-hf (base denso) | 6.738.415.616 | 4096 tokens | Llama 2 Community License | no incluido en la informacion | HuggingFace |
| Otros artefactos de compresion SVD-LLM de la misma malla | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de otros artefactos de compresion comparables (por ejemplo, celdas con otras reglas de seleccion o presupuestos, o metodos alternativos como pruning estructurado o destilacion) que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Artefacto de investigacion, no asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental y evaluarlo antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias celdas de la malla: la compresion por si sola eleva la tasa de exito de ataque. La ASR publicada de 0,3050 en AdvBench y 0,2950 en StrongREJECT es alta para un modelo supuestamente alineado.
- Checkpoint intermedio: corresponde a la ronda 7 de 10 de una ejecucion con presupuesto del 1,0 %, por lo que no representa el estado final del proceso de restauracion.
- Una sola semilla (42): los resultados pueden no ser estables frente a variaciones de inicializacion.
- Metricas dependientes del juez: los valores de ASR proceden del juez de HarmBench; otro juez o otro prompt de evaluacion puede producir cifras distintas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente agravado por la eliminacion del 50 % de los parametros.
- Idiomas no documentados: no se puede asumir un rendimiento multilingue aceptable mas alla del ingles conversacional del modelo base.
- Inconsistencia en el recuento de parametros: safetensors reporta el mismo total que el Llama-2-7b denso, en contradiccion con la fraccion 0,4999 declarada; hay que verificar la estructura real de los tensores.
- Sin versiones cuantizadas publicadas: cualquier despliegue eficiente exige generar y validar las cuantizaciones por cuenta propia.
- Licencia restrictiva: Llama 2 Community License y `USE_POLICY.md`, con obligacion de atribucion ("Built with Llama 2") y clausulas de uso aceptable; el uso comercial esta condicionado y existe un umbral de 700 millones de usuarios mensuales que activa requisitos adicionales de licencia.
- Sin benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8K ni similares que permitan estimar la utilidad real del modelo para tareas productivas.
- Sesgos: no evaluados ni documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/ (los ficheros `LICENSE.txt` y `USE_POLICY.md` se incluyen en el repositorio del modelo)
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo: los enlaces recuperados corresponden a articulos en aleman sobre planes de inversion en ETF y no guardan relacion con el checkpoint. No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

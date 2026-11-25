# ansarbuilds/Sirius-Pro-ONNX

## Resumen

Sirius-Pro-ONNX es un clasificador de texto de tres clases desarrollado por ansarbuilds, derivado del modelo de embeddings BAAI/bge-base-en-v1.5 y exportado a ONNX con cuantizacion int8. Su tarea especifica es la deteccion de "focus drift" o deriva de atencion: dado un objetivo breve del usuario (por ejemplo, "File my 2026 taxes") y una traza de ventanas o pestanas abiertas, clasifica la ventana activa como `ON_TASK`, `BORDERLINE` o `RABBIT_HOLE`. El modelo esta pensado para ejecutarse en local, sobre CPU, en aplicaciones de escritorio que quieran avisar al usuario cuando se desvia de su tarea sin interrumpirle con falsos positivos.

Arquitectonicamente es un transformer encoder BERT de aproximadamente 109 millones de parametros, reutilizado como cross-encoder para clasificacion de pares (objetivo + contexto de ventanas). El autor reporta un rendimiento de 95,6 % de precision y 98,1 % de recall en la clase `RABBIT_HOLE` sobre el split de test bloqueado de su propio benchmark, SiriusBench, con una latencia en CPU de 29,82 ms de mediana y 117,31 ms en p95.

Su relevancia practica esta en el nicho: no compite como modelo de proposito general, sino como componente ligero de un sistema de monitorizacion de foco. El peso int8 de 105,21 MB y la inferencia offline en CPU lo hacen desplegable en clientes de escritorio sin GPU ni conexion a servicios externos. La licencia MIT y la ausencia de datos de OpenAI, Anthropic o Google en el entrenamiento facilitan su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BAAI/bge-base-en-v1.5) usado como cross-encoder de clasificacion |
| Parametros totales | ~109 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 160 tokens (truncacion indicada en el ejemplo de uso; no se documenta un maximo distinto) |
| Tipos de cuantizacion | int8 (ONNX quantized); el modelo base admite otras, no documentadas en la model card |
| Idiomas soportados | no disponible (el modelo base es predominantemente ingles; la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_quantized.onnx`); repo de 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-base-en-v1.5, un encoder BERT de 109 M de parametros orientado a embeddings, y lo reutiliza como clasificador cross-encoder: la entrada concatena el objetivo del usuario y la traza de ventanas en formato `objetivo [SEP] NOW: app | titulo | dominio [SEP] PREV1: ...`, y la cabeza de clasificacion produce tres logits (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`). La exportacion a ONNX con cuantizacion int8 reduce el artefacto a 105,21 MB, con una concordancia del 96,9 % respecto a la version PyTorch segun el autor.

El entrenamiento se realizo en tres rondas sobre GPUs NVIDIA en RunPod: 100 000 filas sinteticas generadas con `factory.py`, un pool de 500 000 filas de mineria de negativos duros (`mine_hard_negatives.py`) y 31 660 filas de la ronda 3 destiladas con probabilidades soft-label del profesor Apache-2.0 `Qwen/Qwen3-32B-AWQ` (`distill_teacher.py`). El umbral de decision (0,53) se ajusto exclusivamente sobre el split `dev` de SiriusBench, y todas las metricas publicadas se calculan sobre el split `test` bloqueado. El autor declara no haber usado salidas de OpenAI, Anthropic ni Google/Gemma.

## Capacidades

- Clasificacion de texto en tres clases (`ON_TASK`, `BORDERLINE`, `RABBIT_HOLE`) a partir de un objetivo y una traza de 1 a 4 ventanas o pestanas normalizadas.
- Deteccion de deriva de foco con contexto secuencial corto (`NOW` mas `PREV1` a `PREV4`).
- Tratamiento explicito de ventanas de utilidad (gestores de contrasenas, calculadora, 2FA de correo) como `ON_TASK`, con una tasa de falsa alarma reportada del 0,0 % en el slice correspondiente.
- Distincion entre trabajo legitimo en dominios de ocio (YouTube, Reddit, GitHub) y consumo de entretenimiento o clickbait, con precision de 81,2 % en ese slice.
- Inferencia offline en CPU con ONNX Runtime, sin dependencia de GPU ni de servicios en la nube.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido; es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Monitorizacion de foco en aplicaciones de escritorio: el modelo recibe el objetivo declarado por el usuario y la ventana activa, y emite una etiqueta en decenas de milisegundos en CPU, lo que permite integrarlo en un bucle de observacion sin penalizar la bateria ni la fluidez del sistema.
- Avisos no intrusivos en herramientas de productividad: al clasificar una ventana como `BORDERLINE`, el sistema puede mantenerse en silencio en lugar de interrumpir, reduciendo la fatiga de notificaciones; el autor reporta 4,21 falsos avisos por cada 2 horas en su evaluacion de replay, por encima del objetivo de 1,00, lo que exige calibrar el umbral en produccion.
- Filtrado de ruido en asistentes de escritorio: el clasificador puede decidir si una ventana nueva merece atencion del agente o debe ignorarse, actuando como puerta previa a un modelo mayor y ahorrando llamadas costosas.
- Analisis de habitos digitales: procesar en lote trazas de navegacion etiquetadas para generar informes de deriva de atencion por sesion de trabajo, con la ventaja de que el modelo cabe en 105 MB y puede ejecutarse en el propio portatil del usuario.
- Investigacion sobre atencion y TDAH: el modelo esta etiquetado con `adhd` y puede servir como componente de estudios o prototipos que midan interrupciones autoinfligidas, siempre que se valide su comportamiento fuera del benchmark del autor.
- Clasificacion de URLs y titulos en pipelines de curacion de contenido: el par (objetivo, ventana) permite puntuar si un enlace es tangencial o claramente fuera de tema, reutilizable en sistemas de recomendacion o de control parental.
- Despliegue en entornos sin conectividad: al ser ONNX int8 y ejecutarse con ONNX Runtime, encaja en clientes de escritorio, quioscos o equipos corporativos con politicas que prohiben enviar datos de navegacion a la nube.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test bloqueado de SiriusBench (364 trazas no vistas) y sobre una evaluacion real de 300 trazas de macOS:

| Metrica / slice | Resultado |
|---|---|
| Precision en `RABBIT_HOLE` (umbral 0,53) | 95,6 % |
| Recall en `RABBIT_HOLE` | 98,1 % |
| Precision global de 3 clases | 92,3 % |
| Slice A: trampas de misma palabra clave (precision RH) | 96,3 % |
| Slice B: trazas de deriva gradual de 4 saltos (precision RH) | 100,0 % |
| Slice C: tasa de falsa alarma en ventanas de utilidad | 0,0 % |
| Slice D: trabajo legitimo en YouTube/Reddit/GitHub (precision RH) | 81,2 % |
| Concordancia PyTorch vs. ONNX int8 | 96,9 % |
| Latencia en CPU caliente (p50 / p95) | 29,82 ms / 117,31 ms |
| Evaluacion real macOS: slice YouTube y Reddit (21 trazas) | 90,5 % precision / 100,0 % recall |
| Evaluacion real macOS: falsos avisos del motor de decision por 2 horas | 4,21 (objetivo <= 1,00) |

No se han publicado resultados en benchmarks estandar de la comunidad (MMLU, GLUE, etc.) en la informacion disponible; todas las cifras proceden del benchmark propio del autor.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo documentado; el modelo esta pensado para CPU. En GPU, el artefacto int8 de 105,21 MB cabe holgadamente en cualquier GPU con mas de 1 GB de memoria.
- GPU recomendadas: no se documentan; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede ejecutarlo, pero el caso de uso declarado es CPU.
- Cabe en GPU consumer: si, con margen amplio, aunque el diseno apunta a ejecucion en CPU.
- Opciones de despliegue: ONNX Runtime (documentado en la model card); al ser un ONNX estandar, es compatible con otros runtimes ONNX, aunque el autor solo ejemplifica `onnxruntime`.
- Latencia: p50 de 29,82 ms y p95 de 117,31 ms en CPU caliente, segun el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sirius-Pro-ONNX | ~109 M | 160 tokens (truncacion documentada) | Clasificacion de deriva de foco en 3 clases | MIT | Hugging Face, ONNX int8 |
| BAAI/bge-base-en-v1.5 (modelo base) | ~109 M | 512 tokens (tipico de BERT base) | Embeddings de proposito general | MIT | Hugging Face |
| Qwen/Qwen3-32B-AWQ (profesor de destilacion) | 32 B | no disponible en esta ficha | Generacion y razonamiento de proposito general | Apache-2.0 | Hugging Face |

La comparacion con alternativas de la misma categoria (clasificadores de foco o de relevancia de contexto de escritorio) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las metricas proceden del benchmark propio del autor (SiriusBench) y de una evaluacion interna de 300 trazas; no hay validacion independiente.
- El autor reporta 4,21 falsos avisos por cada 2 horas en su evaluacion real de macOS, muy por encima de su propio objetivo de 1,00, lo que indica que el sistema completo aun requiere calibracion antes de un uso en produccion.
- La precision cae al 81,2 % en trabajo legitimo dentro de dominios de ocio (YouTube, Reddit, GitHub), el slice mas debil de los publicados.
- El contexto de entrada esta limitado a 160 tokens y a 1-4 ventanas; trazas mas largas o titulos largos se truncan y pueden degradar la clasificacion.
- El modelo base es predominantemente ingles y la model card no declara idiomas soportados; el rendimiento en castellano no esta verificado.
- Es un clasificador discriminativo: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no debe usarse como sustituto de un LLM.
- Riesgo de sesgo y de alucinacion de etiqueta: al entrenarse con datos sinteticos y destilados, puede heredar sesgos de la generacion sintetica y del profesor Qwen3-32B, no evaluados en la model card.
- El entrenamiento incluye datos destilados de un modelo Apache-2.0; la licencia MIT del artefacto no exime de revisar las obligaciones aplicables a los datos derivados en un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ansarbuilds/Sirius-Pro-ONNX
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-32B-AWQ
- Paper, blog, repositorio o demo adicionales: no disponible

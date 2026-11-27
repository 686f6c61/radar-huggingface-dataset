# briskVLA/student_8L_early_ffn_fused

## Resumen

BriskVLA `student_8L_early_ffn_fused` es un checkpoint de tipo "student" destilado del modelo de robotica `lerobot/smolvla_libero`, desarrollado por el autor `briskVLA`. Se trata de una version reducida en profundidad del experto de acciones de SmolVLA, pensada para tareas de manipulacion robotica en el benchmark LIBERO. El modelo forma parte de un pipeline de destilacion y compresion que busca reducir el coste computacional del modelo original manteniendo un comportamiento de accion razonablemente fiel.

El checkpoint conserva solo 8 capas del experto de acciones (identificadas como `[0,1,2,3,4,5,6,7]`), con un layout canonico "early" y una fusion de las capas FFN del experto con un ancho de 4096. El experto resultante tiene aproximadamente 84,51 millones de parametros, mientras que el total del repositorio asciende a 436.313.056 parametros en formato safetensors, lo que incluye tambien los componentes no-experto del modelo (vision y lenguaje) heredados de SmolVLA.

La relevancia de este checkpoint es acotada y experimental: no es un modelo de proposito general ni un modelo de lenguaje, sino una pieza intermedia dentro de una linea de investigacion sobre destilacion de politicas VLA (vision-language-action) para robotica. Su interes practico reside en la posibilidad de reutilizarlo como punto de partida para seguir comprimiendo (por ejemplo, de 8L a 4L) o para evaluar el equilibrio entre coste y fidelidad de accion en LIBERO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) con experto de acciones reducido a 8 capas |
| Parametros totales | 436.313.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Rol | student |
| Modelo profesor | `lerobot/smolvla_libero` @ `a24f1f380461` |
| Capas del experto | 8L (`[0,1,2,3,4,5,6,7]`) |
| Layout canonico | `early` |
| Ancho FFN del experto | 4096 |
| Parametros del experto | 84,51 M |
| Fusion FFN | si (`ffn_fusion`) |
| Pasos de entrenamiento | 5000, batch 8 |
| Pesos de perdida | velocity=1.0, hidden=0.1, output=1.0, gt=0.0 |
| Mapa de capas ocultas | `same_depth` |
| Mejor val `chunk_mse_teacher` | 0,1962 (paso 4000) |
| Val `chunk_mse_gt` en el mejor punto | 0,2212 |

## Arquitectura y entrenamiento

El modelo es un checkpoint de destilacion de una politica VLA basada en SmolVLA. La arquitectura subyacente combina un codificador visual y un modelo de lenguaje con un experto de acciones que genera trayectorias de accion para el robot. En este checkpoint, el experto de acciones se ha reducido a 8 capas (frente a la profundidad del profesor) y se ha aplicado una fusion de las capas FFN con ancho 4096, manteniendo el layout canonico "early". El total de parametros del repositorio (436,3 M) incluye los componentes compartidos con SmolVLA, mientras que el experto reducido aporta 84,51 M.

El entrenamiento se realizo durante 5000 pasos con batch de 8, usando una combinacion de perdidas: velocidad (peso 1.0), estados ocultos (peso 0.1), salida (peso 1.0) y ground truth (peso 0.0). El mapeo de capas ocultas es `same_depth`, es decir, se alinean las capas del student con las correspondientes del teacher por profundidad. El mejor resultado de validacion se obtuvo en el paso 4000, con un `chunk_mse_teacher` de 0,1962 y un `chunk_mse_gt` de 0,2212. No se dispone de informacion sobre la composicion del dataset de entrenamiento mas alla de que se evalua en LIBERO.

## Capacidades

- Generacion de acciones de robotica para tareas de manipulacion en el benchmark LIBERO.
- Politica VLA: integra observaciones visuales y lenguaje para producir trayectorias de accion.
- Destilacion de un modelo profesor (`lerobot/smolvla_libero`) con perdidas sobre velocidad, estados ocultos y salida.
- Capacidad de ser reutilizado como punto de partida para compresion adicional (por ejemplo, de 8L a 4L).
- Evaluacion con distintos valores de K (K=10 y K=1) segun el script de evaluacion incluido.
- No se dispone de informacion sobre tool calling, agentes, capacidades multilingues ni modos especiales (thinking, vision, audio) mas alla del uso robotico descrito.

## Casos de uso

- Evaluacion de destilacion en robotica: usar el checkpoint para medir la fidelidad de accion frente al profesor `lerobot/smolvla_libero` en LIBERO, comparando `chunk_mse_teacher` y `chunk_mse_gt`.
- Punto de partida para compresion adicional: el autor documenta un comando `build_student.py` para reducir de 8L a 4L, lo que permite estudiar el equilibrio coste/fidelidad en politicas VLA.
- Investigacion sobre fusion de FFN: permite analizar el efecto de la fusion de capas FFN en el experto de acciones sobre el rendimiento en tareas de manipulacion.
- Benchmarking de latencia: el script `latency.py` permite medir el coste de inferencia del student y compararlo con variantes mas profundas.
- Reproduccion de experimentos: el run de W&B (`52421121`) y los comandos de evaluacion permiten reproducir los resultados reportados.
- Prototipado de politicas ligeras: como modelo de 436 M de parametros en safetensors, puede servir para experimentos donde el coste del SmolVLA completo sea prohibitivo, siempre que se acepte la perdida de fidelidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejor val `chunk_mse_teacher` | 0,1962 (paso 4000) |
| Val `chunk_mse_gt` en el mejor punto | 0,2212 |
| Pasos de entrenamiento | 5000 |
| Batch | 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, tasas de exito en LIBERO) en la informacion disponible. Los unicos datos numericos son las perdidas de validacion de destilacion indicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el repositorio ocupa 0,9 GB en safetensors, lo que sugiere que la inferencia en precision completa podria caber en GPUs consumer, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el tamano del repositorio (0,9 GB) es compatible con GPUs de gama media, pero no se aportan datos de VRAM ni latencia.
- Opciones de despliegue: la libreria indicada es `lerobot`; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor incluye un script `latency.py` para medirlos, pero no se publican resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `briskVLA/student_8L_early_ffn_fused` | 436,3 M (experto 84,51 M) | no disponible | student destilado | no disponible | Hugging Face |
| `lerobot/smolvla_libero` | no disponible | no disponible | teacher | no disponible | Hugging Face |
| Otras variantes BriskVLA (p. ej. 4L) | no disponible | no disponible | student | no disponible | referenciadas en comandos, no confirmadas |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria. La unica comparacion documentada es frente al teacher `lerobot/smolvla_libero`, mediante las perdidas de destilacion.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no es un modelo de proposito general ni un modelo de lenguaje; su uso esta limitado a robotica y al benchmark LIBERO.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no disponibles: no se documenta soporte multilingue.
- Fidelidad limitada: el `chunk_mse_teacher` de 0,1962 y el `chunk_mse_gt` de 0,2212 indican un error de reconstruccion de accion no despreciable frente al teacher y al ground truth.
- Sin benchmarks de exito: no se reportan tasas de exito en LIBERO, por lo que no se puede evaluar su rendimiento real en tareas.
- Riesgo de sobreajuste al benchmark: entrenado y evaluado en LIBERO, sin evidencia de generalizacion a otros entornos.
- Sin datos de sesgo ni alucinacion: al ser una politica de accion, los riesgos tipicos de los LLM no aplican directamente, pero no se documentan evaluaciones de robustez.
- Repositorio con 0 descargas y 0 likes: sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/student_8L_early_ffn_fused
- Modelo base (teacher): https://huggingface.co/lerobot/smolvla_libero
- Run de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/52421121

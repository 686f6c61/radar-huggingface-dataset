# briskVLA/shallow_8L_spread_ffn_fused

## Resumen

`briskVLA/shallow_8L_spread_ffn_fused` es un checkpoint de un modelo de vision-lenguaje-accion (VLA) para control robotico, desarrollado por el usuario briskVLA. Se trata de un estudiante destilado a partir del modelo `lerobot/smolvla_libero`, del que hereda la arquitectura SmolVLA adaptada al benchmark LIBERO. El modelo reduce la profundidad del "action expert" del profesor a 8 capas, con una anchura de FFN de 4096, resultando en un total de 436.313.056 parametros segun el fichero de pesos real.

El modelo resuelve el problema de ejecutar politicas VLA en entornos roboticos con restricciones de computo: al recortar capas del experto de acciones y mantener una fusion de FFN, se busca reducir latencia de inferencia manteniendo la calidad de las trayectorias generadas. Es relevante para quienes investigan destilacion de modelos roboticos y despliegue eficiente en hardware embebido o GPUs de gama media.

La informacion publicada es escasa: no hay licencia declarada, no se especifican idiomas y no se han publicado resultados de benchmarks en la model card mas alla de la metrica de validacion de perdida. El repositorio ocupa 0,9 GB y los pesos estan en formato safetensors, con integracion nativa en la libreria `lerobot`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA basado en transformer con action expert), variante de profundidad reducida |
| Parametros totales | 436.313.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA del ecosistema LeRobot, con un "action expert" reducido a 8 capas seleccionadas del profesor (`[0, 1, 4, 5, 8, 9, 12, 13]`), manteniendo un layout canonico de tipo `spread` y una anchura de FFN de 4096. El experto de acciones resultante tiene 84,51 M de parametros. La estrategia de destilacion emplea un mapeo de capas ocultas `same_depth` y una funcion de perdida configurada con pesos `velocity=0.0, hidden=0.0, output=0.0, gt=1.0`, es decir, entrenamiento supervisado contra ground truth de trayectorias en lugar de destilacion directa de las salidas del profesor.

El entrenamiento se realizo durante 5000 pasos con batch de 8 sobre el benchmark LIBERO. La mejor perdida de validacion `chunk_mse_teacher` fue 0,1565 en el paso 4000, con un `chunk_mse_gt` de 0,2066 en ese mismo punto. El modelo se presenta como base para seguir destilando o comprimiendo (por ejemplo, de 8L a 4L mediante `build_student.py` con fusion de FFN). No se especifican volumen de datos, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas (prediccion de chunks de trayectorias) para tareas de manipulacion en el benchmark LIBERO.
- Control visuomotor a partir de observaciones visuales e instrucciones en lenguaje natural, heredado de SmolVLA.
- Ejecucion de politicas de imitacion entrenadas sobre demostraciones.
- Servir como modelo base para destilacion adicional y compresion de profundidad.
- Evaluacion con distintos horizontes de chunk (K=10 y K=1) segun los scripts del autor.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en destilacion de modelos VLA: el checkpoint sirve como punto de partida para generar estudiantes aun mas pequenos (4L) mediante los scripts `distill_student.py` y `build_student.py`, permitiendo estudiar el compromiso entre profundidad y calidad de politica.
- Evaluacion comparativa en LIBERO: util para reproducir experimentos de reduccion de profundidad del action expert y medir el impacto en la tasa de exito de tareas de manipulacion.
- Despliegue en hardware con VRAM limitada: con 436 M de parametros y pesos en safetensors de 0,9 GB, puede cargarse en GPUs de consumo para experimentacion, aunque no se dispone de datos de latencia publicados.
- Benchmarking de latencia: el script `latency.py` del autor permite medir el coste de inferencia del modelo frente al profesor SmolVLA completo.
- Base para fine-tuning en dominios roboticos especificos: al ser un modelo de imitacion, puede adaptarse a nuevos conjuntos de demostraciones mediante el pipeline de LeRobot.
- Estudio de estrategias de fusion de FFN: la variante `ffn_fused` permite analizar el efecto de la fusion de capas feed-forward en la calidad de las trayectorias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de perdida de validacion durante el entrenamiento:

| Metrica | Valor | Paso |
|---|---|---|
| `chunk_mse_teacher` (mejor) | 0,1565 | 4000 |
| `chunk_mse_gt` en el mejor punto | 0,2066 | 4000 |

No se proporcionan tasas de exito en LIBERO ni comparaciones con el profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 436 M de parametros en safetensors (0,9 GB), la carga en precision completa requeriria aproximadamente 1,7 GB solo para pesos, mas memoria para activaciones y el codificador visual.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint, aunque no hay confirmacion oficial.
- Opciones de despliegue: libreria `lerobot` (integracion nativa); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor incluye un script `latency.py` para medirlos, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_spread_ffn_fused | 436.313.056 | no disponible | solo perdida de validacion | no disponible | Hugging Face |
| lerobot/smolvla_libero (profesor) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas VLA de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda en un estado juridico incierto hasta que el autor lo aclare.
- No se han publicado tasas de exito en LIBERO ni comparaciones formales con el profesor, lo que impide evaluar la perdida de calidad por la reduccion de profundidad.
- El modelo esta especializado en tareas de manipulacion del benchmark LIBERO; su generalizacion a otros dominios roboticos no esta documentada.
- Riesgo de alucinacion o comportamiento fuera de distribucion en escenarios visuales no vistos durante el entrenamiento, comun en politicas de imitacion.
- No se especifican sesgos conocidos ni limitaciones idiomaticas.
- El checkpoint tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creacion indicada (2026-11-26) es futura respecto a la informacion habitual, lo que conviene verificar.
- No hay garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/shallow_8L_spread_ffn_fused
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- Run de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/50c80c57

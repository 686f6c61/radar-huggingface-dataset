# learner1119/posco_act_260820_left_c50

## Resumen

`posco_act_260820_left_c50` es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), la arquitectura de imitación introducida por el equipo de LeRobot de Hugging Face. Lo publica el usuario `learner1119` como artefacto de un benchmark interno de pick-and-place sobre MuJoCo, denominado `posco_act_chunk50`, dentro de un proyecto llamado `2026_POSCO_VLA`. No es un modelo de lenguaje: es un modelo de control que mapea observaciones visuales y de estado del robot a secuencias de acciones de 7 articulaciones más un gripper combinado, para el brazo izquierdo.

El modelo se ha entrenado durante 50.000 pasos sobre el conjunto de datos `dataset/260820_left`, con un tamaño de chunk de 50 acciones por inferencia, lo que reduce la frecuencia efectiva de replanificación y suaviza la ejecución. Con 51,6 millones de parámetros y un repositorio de 0,2 GB en safetensors, es un artefacto ligero pensado para evaluación reproducible en simulación, no para despliegue general.

Su relevancia es acotada pero clara para quien trabaja en manipulación con aprendizaje por imitación: sirve como referencia concreta de un checkpoint ACT entrenado con LeRobot, con hiperparámetros documentados (50k pasos, chunk 50) y una ruta de instalación explícita. La información pública es mínima: no hay model card extendida, ni licencia declarada, ni idiomas, ni pipeline asignado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), LeRobot |
| Parametros totales | 51.621.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada multimodal por frame) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | `dataset/260820_left` |
| Pasos de entrenamiento | 50.000 |
| Chunk size | 50 |
| Brazo / efector | brazo izquierdo, 7 articulaciones + gripper blend |
| Benchmark asociado | `posco_act_chunk50` (POSCO FFW-SH5 pick-and-place, MuJoCo) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un cuello de botella de variación latente (estilo CVAE) que predice bloques de acciones futuras en lugar de acciones individuales. El encoder procesa la observación conjunta (imágenes de cámaras e estado de las articulaciones) y el decoder genera un chunk de acciones condicionado a una variable latente; en inferencia se usa la media del prior, lo que da un comportamiento determinista y estable. El chunking temporal es la innovación central: al emitir 50 acciones por paso de inferencia, se mitiga el error de compounding típico de las políticas de imitación y se reduce la carga de cómputo en el bucle de control.

En este checkpoint concreto, el autor indica 50.000 pasos de entrenamiento sobre el dataset `260820_left`, con chunk size 50 y control del brazo izquierdo (7 articulaciones más un gripper combinado). No se detalla en la información disponible el número de tokens, la composición del dataset, el número de episodios, la resolución de las cámaras, la configuración de aumento de datos ni si hubo etapas de refinamiento posteriores al entrenamiento por imitación supervisada. Tampoco se documenta si se aplicó algún tipo de regularización o de RLHF/DPO, algo que en ACT no es habitual.

## Capacidades

- Generación de secuencias de acción de 7 articulaciones más gripper para el brazo izquierdo en tareas de pick-and-place.
- Predicción en chunks de 50 acciones por inferencia, lo que permite ejecutar tramos largos sin replanificar cada frame.
- Condicionamiento multimodal sobre observaciones visuales y de estado del robot (propiocepción), según el pipeline estándar de ACT en LeRobot.
- Ejecución determinista en inferencia mediante el prior del CVAE.
- Integración con el ecosistema LeRobot para carga de checkpoints y evaluación en MuJoCo.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio, ni modos de "thinking".

## Casos de uso

- Evaluación reproducible de políticas ACT: el checkpoint se coloca en `2026_POSCO_VLA/ckpt/posco_act_chunk50/` y se ejecuta contra el benchmark `posco_act_chunk50` para obtener métricas comparables entre configuraciones de chunk y datasets.
- Baseline para ablaciones de chunk size: al estar entrenado con chunk 50 sobre `260820_left`, sirve para comparar frente a variantes con chunk menor o mayor y medir el efecto sobre la tasa de éxito y la suavidad de la trayectoria.
- Estudio de transferencia entre datasets: el autor distingue explícitamente este modelo de `posco_act_square_260822_left_*`, lo que permite analizar cómo cambia el rendimiento al pasar de `260820_left` a `260822_left` en la misma tarea.
- Depuración de pipelines de imitación en LeRobot: con 51,6 M de parámetros y 0,2 GB, se puede cargar y ejecutar en una sola GPU consumer para validar el flujo de datos, las normalizaciones y el formateo de observaciones antes de escalar a entrenamientos mayores.
- Control de brazo izquierdo en simulación MuJoCo: útil para probar políticas de agarre y colocación en el entorno FFW-SH5 sin necesidad de hardware físico.
- Referencia docente: ejemplo compacto y verificable de un checkpoint ACT con hiperparámetros documentados, adecuado para explicar chunking, CVAE y evaluación en robótica de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente identifica el benchmark (`posco_act_chunk50`) y la ruta de instalación, sin reportar tasas de éxito, errores de posición ni métricas de suavidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,6 M de parámetros, más el coste de los buffers de imagen; en la práctica, menos de 2-3 GB contando el encoder visual y el entorno MuJoCo.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3060, RTX 4060, RTX 4090; para evaluación por lotes, A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe holgadamente en GPU consumer; también es viable en CPU para pruebas de integración, aunque con latencia mayor.
- Opciones de despliegue: carga directa con LeRobot y PyTorch; MuJoCo para el entorno de simulación. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `posco_act_260820_left_c50` | 51,6 M | chunk 50 | Pick-and-place, brazo izquierdo, MuJoCo | no disponible | Hugging Face |
| `posco_act_square_260822_left_*` | no disponible | no disponible | Pick-and-place, brazo izquierdo, dataset distinto | no disponible | Hugging Face (referenciado por el autor) |
| ACT original (LeRobot) | del orden de decenas de millones (no disponible con precision) | configurable | Manipulación por imitación | no disponible en esta ficha | Repositorio LeRobot |

La comparación cuantitativa con alternativas no es posible: no hay métricas publicadas para este checkpoint ni para las variantes citadas, y la información disponible no incluye resultados del ACT de referencia en el mismo benchmark.

## Limitaciones y advertencias

- Específico de tarea y de dataset: entrenado solo sobre `260820_left` para pick-and-place con brazo izquierdo; no se espera generalización a otras tareas, objetos o brazos.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento simbólico.
- Licencia no declarada: no hay autorización explícita de uso comercial; conviene contactar con el autor antes de cualquier despliegue fuera de investigación.
- Sin métricas publicadas: no se puede afirmar su calidad relativa frente a otras políticas sin ejecutar el benchmark `posco_act_chunk50`.
- Riesgo de sobreajuste al simulador: al entrenarse y evaluarse en MuJoCo, el comportamiento en hardware real no está validado.
- Posible confusión con otros checkpoints del mismo autor (`posco_act_square_260822_left_*`): la ruta de instalación debe respetarse para evitar mezclar pesos de datasets distintos.
- Sin documentación sobre sesgos, composición del dataset ni protocolo de recogida de datos, lo que limita la auditoría del comportamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/learner1119/posco_act_260820_left_c50
- LeRobot (framework de referencia para ACT): no disponible en la búsqueda web proporcionada
- Paper de ACT (Action Chunking with Transformers): no disponible en la búsqueda web proporcionada
- Benchmark `posco_act_chunk50` / proyecto `2026_POSCO_VLA`: no disponible como enlace público en la información proporcionada

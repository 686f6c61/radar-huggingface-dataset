# DKNTZMN/axial-drive

## Resumen

Axial-Drive es un estudio de arquitectura comparada (A/B test) publicado en HuggingFace por el usuario DKNTZMN. No es un modelo de conduccion autonoma listo para produccion, sino un banco de pruebas reproducible que enfrenta dos sesgos inductivos distintos sobre la misma tarea: un transformer axial de 8-10 capas y aproximadamente 80 millones de parametros frente a un ViT 2D plano de anchura equivalente. El objetivo es medir el efecto de la atencion axial (fila = lateral, columna = longitudinal) sobre rejillas BEV, y el efecto de anadir tokens discretos de planificacion tipo chain-of-thought antes de predecir waypoints.

El modelo opera sobre un simulador vectorial de dominio dual en bucle cerrado: un escenario de autopista de alta velocidad (4 carriles, 22-33 m/s, cambios de carril estilo IDM + MOBIL) y un escenario urbano con interseccion semaforizada, trafico transversal y peatones. La entrada no es camara ni LiDAR crudo, sino una rejilla BEV privilegiada de 8 canales y 32x32 celdas.

Su relevancia actual es metodologica: sirve como referencia limpia y de bajo coste computacional para investigacion en planificacion de conduccion, y como ejemplo de implementacion de atencion axial con emparejamiento estricto de parametros entre variantes. El repositorio incluye el script de entrenamiento, pero no publica resultados numericos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer axial (atencion por filas y luego por columnas) y ViT 2D plano como baseline |
| Parametros totales | ~80M en las variantes por defecto (dim=768, depth=10, heads=12) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es una rejilla BEV de 32x32 con 8 canales; no hay ventana de tokens de texto declarada) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (library_name: pytorch); no se especifica safetensors ni GGUF |

Variantes publicadas en la model card:

| Nombre | Atencion | CoT | MLP ratio |
|---|---|---|---|
| vit_direct_80m | self-attention completa HW (ViT) | no | 4.0 |
| axial_direct_80m | fila y luego columna | no | 2.0 |
| axial_cot_80m | fila y luego columna | 4 slots discretos | 2.0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con atencion axial, un sesgo inductivo propuesto por Ho et al. (2019) que descompone la atencion 2D en dos pasadas 1D secuenciales: primero a lo largo de las filas y despues a lo largo de las columnas. Aplicado a una rejilla BEV, esto asigna la fila al eje lateral y la columna al eje longitudinal, lo que reduce el coste cuadratico respecto a la atencion completa sobre todos los pares de celdas. La variante axial usa un MLP ratio de 2.0 frente al 4.0 del ViT plano, un ajuste deliberado para igualar el numero de parametros entre ambas ramas del experimento. La profundidad por defecto es de 10 capas, con dimensionalidad 768 y 12 cabezas de atencion.

La variante con CoT introduce cuatro slots discretos que se predicen antes de los waypoints: separacion con el vehiculo precedente (lead gap), relacion de carril (lane relation), intencion (intent) y conflicto (conflict). Se trata de una planificacion tipo chain-of-thought clasica, con un numero fijo y pequeno de tokens intermedios en lugar de texto libre. Los tags del repositorio indican imitation learning y reinforcement learning, si bien la model card no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. El entrenamiento se lanza con `python scripts/train_compare.py`, con modos `--scale tiny --steps 400 --cpu` y `--scale 80m --steps 3000`, y depende unicamente de `torch` y `numpy`.

## Capacidades

- Planificacion de trayectorias en bucle cerrado sobre rejilla BEV privilegiada de 8 canales y 32x32 celdas.
- Prediccion de waypoints a partir de la representacion BEV, en las tres variantes.
- Razonamiento intermedio explicito mediante cuatro slots de CoT (lead gap, lane relation, intent, conflict) en la variante `axial_cot_80m`.
- Navegacion en dominio de autopista: 4 carriles, velocidades de 22-33 m/s, cambios de carril modelados con IDM y logica tipo MOBIL.
- Navegacion en dominio urbano: interseccion semaforizada, trafico transversal y presencia de peatones.
- Comparacion controlada de arquitecturas con emparejamiento de parametros, util para experimentos de ablacion.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente multi-paso en el sentido de un LLM; la planificacion se limita a los slots de CoT y a la cabeza de waypoints.
- No hay capacidades multilingues, de vision real, audio ni modo de pensamiento extendido.
- No hay entrada de camara ni LiDAR: la entrada es exclusivamente la rejilla BEV privilegiada.

## Casos de uso

- Investigacion en sesgos inductivos para conduccion: comparar de forma controlada si la atencion axial supera al ViT plano con el mismo presupuesto de parametros en una tarea de planificacion BEV.
- Ablacion de chain-of-thought en planificacion motora: usar `axial_cot_80m` frente a `axial_direct_80m` para medir si cuatro slots discretos de razonamiento mejoran la calidad de los waypoints en bucle cerrado.
- Prototipado rapido en CPU o GPU de gama baja: al tener ~80M de parametros, el modo `--scale tiny` permite iterar el pipeline completo de simulacion sin infraestructura dedicada.
- Docencia y cursos de conduccion autonoma: el repositorio sirve como ejemplo minimo y reproducible de simulador vectorial de dominio dual con baseline ViT y variante axial.
- Generacion de datos sinteticos de trayectorias: el simulador puede emplearse para producir pares de rejilla BEV y waypoints para preentrenar modelos mayores o para aumentar datasets de imitation learning.
- Validacion de pipelines de evaluacion en bucle cerrado: sirve para comprobar infraestructura de metricas (colisiones, confort, progreso) antes de escalar a simuladores mas costosos como CARLA o nuPlan.
- Estudio de generalizacion entre dominios: entrenar en autopista y evaluar en el escenario urbano, o viceversa, para medir transferencia entre distribuciones de trafico.
- Referencia de bajo coste para comparativas academicas: cualquier nuevo planificador de ~80M puede medirse contra estas tres variantes en condiciones identicas de simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el diseno experimental y las variantes, pero no incluye tablas de metricas (colisiones, desviacion de trayectoria, tasa de exito, confort) ni comparaciones numericas entre `vit_direct_80m`, `axial_direct_80m` y `axial_cot_80m`.

Ademas, el propio autor declara explicitamente que el repositorio no persigue puntuaciones de referencia: la tabla "What this is / is not" indica que no se trata del estado del arte fotorealista del CARLA Leaderboard ni de puntuaciones oficiales de nuPlan o Waymax.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,32 GB en FP32 y 0,16 GB en FP16 para los 80M de parametros. La rejilla BEV de 32x32 con 8 canales anade una activacion minima, por lo que el consumo real es marginalmente superior al de los pesos.
- Entrenamiento: la model card recomienda el flavor `l4x1` de HuggingFace Jobs (GPU NVIDIA L4 con 24 GB), descrito como la mejor relacion precio/hora entre las GPU de 24 GB.
- GPU recomendadas: NVIDIA L4 (24 GB) para entrenamiento segun la recomendacion del autor. Cualquier GPU moderna con al menos 8 GB es suficiente para las variantes de 80M, dado el reducido numero de parametros.
- GPU de consumo: si, cabe holgadamente en tarjetas de consumo como una RTX 3060, RTX 4060 o superiores. El modo `--scale tiny --steps 400 --cpu` esta pensado para ejecutarse incluso sin GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El despliegue se realiza mediante el script de PyTorch del propio repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por paso de simulacion ni de throughput de entrenamiento.
- Dependencias: unicamente `torch` y `numpy` mediante `pip install torch numpy`.

## Comparativa con modelos similares

La model card no ofrece comparativas con modelos externos y el autor delimita el alcance fuera de los rankings publicos como CARLA Leaderboard, nuPlan o Waymax. La comparacion mas significativa es interna, entre las tres variantes del propio repositorio:

| Variante | Parametros | Atencion | CoT | MLP ratio | Licencia |
|---|---|---|---|---|---|
| vit_direct_80m | ~80M | self-attention completa (ViT 2D) | no | 4.0 | MIT |
| axial_direct_80m | ~80M | axial (fila y columna) | no | 2.0 | MIT |
| axial_cot_80m | ~80M | axial (fila y columna) | 4 slots discretos | 2.0 | MIT |

Comparativa con modelos externos de conduccion autonoma (CARLA, nuPlan, Waymax): no disponible en la informacion proporcionada, y explicitamente fuera del alcance declarado por el autor.

## Limitaciones y advertencias

- No es un modelo listo para carretera: el propio autor indica que el repositorio no constituye una afirmacion de aptitud para vias publicas.
- La entrada es una rejilla BEV privilegiada de 8 canales, no sensores crudos. No hay entrada de camara ni LiDAR end-to-end, por lo que no es comparable con pipelines sensoriomotores.
- El simulador es vectorial y de bucle cerrado, no fotorealista. Los resultados no son extrapolables a CARLA Leaderboard ni a puntuaciones oficiales de nuPlan o Waymax.
- La transferencia de la atencion axial como sesgo inductivo para rejillas BEV no implica transferencia automatica al estado del arte sensoriomotor, tal y como advierte el autor.
- No se documentan sesgos especificos, riesgos de alucinacion (el modelo no es generativo de lenguaje), limitaciones de contexto ni restricciones de idioma. Al no publicarse datos de entrenamiento ni evaluacion, no es posible cuantificar sesgos de dominio.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la unica obligacion de conservar el aviso de copyright y la licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validacion por parte de terceros. Se creo y actualizo el 25 de septiembre de 2026.
- No se publican resultados de evaluacion, pesos preentrenados en formatos estandar de inferencia ni metricas de robustez. Cualquier uso en produccion requeriria entrenamiento y validacion propios.
- La fecha de creacion es posterior a la fecha habitual de referencia, lo que sugiere un artefacto reciente y poco maduro.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/DKNTZMN/axial-drive
- Perfil de GitHub del autor: https://github.com/DKNTZMN
- Referencia citada por el autor: Ho et al., 2019, "Axial Attention in Multidimensional Transformers": https://arxiv.org/abs/1912.12180
- Otros resultados de la busqueda web (no relacionados con el modelo): directorio de modelos abiertos https://aimodels.org/ai-models/ ; articulo sobre simuladores de modelos constitutivos https://www.sciencedirect.com/science/article/pii/S0950061825007767 ; introduccion general a modelos de IA https://www.geeksforgeeks.org/artificial-intelligence/what-is-ai-model/

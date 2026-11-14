# Mercury007/mv-action-value-scan-object

## Resumen

Mercury007/mv-action-value-scan-object es un modelo de valor para robótica (`V(s, a)`) desarrollado por el usuario Mercury007 y publicado en Hugging Face. No es un modelo de lenguaje: es una red neuronal que estima el valor esperado de un chunk de acciones de 16 pasos para el robot bimanual aloha-agilex en la tarea `scan_object` del benchmark RoboTwin. Toma como entrada las imágenes RGB y profundidad de tres cámaras (cabeza, muñeca izquierda y muñeca derecha), el estado del robot de 16 dimensiones y un chunk de pose del efector final de 16 pasos para ambos brazos.

El modelo se obtiene por destilación de un profesor basado únicamente en el estado (un discriminador SVM multi-vista entrenado con BCE sobre rollouts exitosos y fallidos de la política GAP), en lugar de entrenarse con etiquetas de éxito o fracaso. El alumno aprende a predecir el valor del profesor 16 fotogramas en el futuro, lo que permite asignar una recompensa a un chunk de acciones antes de ejecutarlo mediante la diferencia `V(s, a) - V(s, hold)`.

Con 91,3 millones de parámetros y un repositorio de 0,4 GB, es un componente especializado dentro de un pipeline de aprendizaje por refuerzo o selección de acciones para manipulación robótica. Su relevancia radica en el enfoque de destilación de valor a partir de un crítico basado en estado, aplicable a políticas de imitación como GAP en entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MultiViewActionSVM (red neuronal multi-vista para estimación de valor; detalles internos no disponibles) |
| Parametros totales | 91.308.545 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por paso de decisión: 3 cámaras RGB + profundidad, estado de 16-D, chunk de acción [16, 16]) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una red `MultiViewActionSVM` que procesa observaciones multi-vista (tres cámaras con RGB, profundidad en milímetros, intrínsecos y extrínsecos mundo→cámara), un estado de robot de 16 dimensiones y un chunk de acción de forma [16, 16] correspondiente a la pose comandada del efector final de ambos brazos durante 16 pasos. El modelo se entrena desde cero para regresar dos cantidades: `V(s_t, hold) → T_t`, donde *hold* repite la pose actual durante los 16 pasos, y `V(s_t, a_t..a_{t+15}) → T_{t+16}`, el valor al que conduce el chunk ejecutado.

El profesor es un discriminador SVM multi-vista basado solo en estado `f(s)` (sin acción), entrenado con BCE sobre rollouts exitosos y fallidos de GAP; su logit `T_t = V(s_t)` actúa como valor de estado. Los datos de entrenamiento comprenden 504 rollouts exitosos y 504 fallidos de GAP (límite de 300 pasos), más 908 ramas de ruido (episodio exitoso reproducido hasta un chunk aleatorio, ejecutado con un desplazamiento xyz suave por brazo de σ ∈ {2, 4, 8} cm, tras lo cual GAP continúa; 609 éxitos y 299 fallos). Se muestrea cada cuarto fotograma y los fallos se truncan a 250 fotogramas. La partición reserva las últimas 50 semillas por clase para selección de checkpoint.

La función de pérdida es `MSE(V_hold, T_t) + MSE(V_exec − V_hold, T_{t+16} − T_t)`, con 32 + 32 fotogramas por lote, el 75 % provenientes de fotogramas cuyo valor del profesor cambia más de 0,5. Se usa AdamW con tasa 1e-4 y bf16, 150 pasos por época, parada tras 10 épocas sin mejora en validación (34 épocas totales). La época seleccionada fue la 23, con pérdida de validación de 1,286 (MSE de valor 0,156, MSE de progreso 1,131), AUC de valor estático (éxito frente a fallo) de 0,915 y correlación entre progreso predicho y del profesor de 0,62.

## Capacidades

- Estimación de valor de estado-acción `V(s, a)` para chunks de 16 pasos en la tarea `scan_object` de RoboTwin con aloha-agilex.
- Predicción del valor del profesor 16 fotogramas en el futuro a partir del chunk de acciones propuesto.
- Cálculo de recompensa por chunk antes de su ejecución: `r(s_t, a) = V(s_t, a) - V(s_t, hold)`.
- Procesamiento de observaciones multi-vista con RGB, profundidad, intrínsecos y extrínsecos de tres cámaras.
- Integración con la política GAP como crítico para selección o filtrado de acciones.
- API de inferencia mediante `MVActionValue.from_pretrained`, `values(obs)` y `rewards(obs)` del paquete `svm`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Selección de acciones en RoboTwin `scan_object`: dado un conjunto de chunks candidatos generados por GAP, el modelo puntúa cada uno con `V(s, a)` y se elige el de mayor recompensa estimada antes de ejecutarlo, reduciendo la probabilidad de ejecutar acciones fallidas.
- Filtrado de seguridad en manipulación bimanual: el robot calcula `r(s_t, a) = V(s, a) - V(s, hold)` y descarta chunks con recompensa negativa, evitando movimientos que el profesor asociaría a fallo.
- Aprendizaje por refuerzo con recompensa aprendida: la señal `r(s_t, a)` puede usarse como función de recompensa densa en un bucle de RL o de optimización de política sobre el simulador, sin necesidad de etiquetas de éxito.
- Evaluación offline de políticas: el modelo permite estimar el valor de trayectorias grabadas o generadas en simulación y comparar variantes de política sin ejecutar rollouts completos.
- Aumento de datos con ramas de ruido: el modelo sirve para etiquetar ramas con desplazamientos controlados (σ de 2, 4 y 8 cm) y estimar su valor, útil para análisis de robustez de la política.
- Investigación en destilación de críticos: reproduce el esquema profesor basado en estado → alumno estado-acción y permite experimentar con otras tareas de RoboTwin sustituyendo el profesor y los datos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion (epoca 23) | 1,286 |
| MSE de valor (validacion) | 0,156 |
| MSE de progreso (validacion) | 1,131 |
| AUC de valor estatico (exito vs fallo) | 0,915 |
| Correlacion progreso predicho vs profesor | 0,62 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor indica explicitamente que el modelo no se ha evaluado mas alla de la perdida de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 91,3 M de parametros en bf16 los pesos ocupan aproximadamente 0,18 GB, por lo que el consumo dominante sera el de las activaciones de las tres camaras y la red, no disponible.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos unos pocos GB de VRAM deberia poder alojar los pesos.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 91,3 M de parametros, aunque el requisito real depende del preprocesado de imagen multi-vista no documentado.
- Opciones de despliegue: no disponible; el autor proporciona el paquete Python `svm` con `MVActionValue.from_pretrained`, no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de estimacion de valor estado-accion para RoboTwin `scan_object` ni alternativas de la misma categoria con datos publicados.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea `scan_object` de RoboTwin con el robot aloha-agilex; no es transferible directamente a otras tareas o morfologias sin reentrenamiento.
- El autor declara que no se ha evaluado mas alla de la perdida de validacion; no hay evidencia publicada de rendimiento en despliegue real o en simulacion cerrada.
- Depende de un profesor concreto (`Mercury007/mv-distill-scan-object`); los valores y recompensas estan en unidades del logit del profesor, no en una escala fisica interpretable.
- La recompensa `V(s, a) - V(s, hold)` es una aproximacion de `T_{t+16} - T_t`; la correlacion de progreso de 0,62 indica error no despreciable en la prediccion del avance.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas no aplicables; el modelo no procesa texto.
- Riesgo de sobreajuste a la distribucion de rollouts de GAP y a las ramas de ruido con σ de 2, 4 y 8 cm; el comportamiento fuera de esa distribucion no esta documentado.
- No se documentan sesgos, alucinaciones ni caveats adicionales de produccion mas alla de los anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mercury007/mv-action-value-scan-object
- Profesor (checkpoint `checkpoints/teacher/`): https://huggingface.co/Mercury007/mv-distill-scan-object
- Codigo (paquete `svm`, seccion "Action value student"): https://github.com/mengpeilin/svm

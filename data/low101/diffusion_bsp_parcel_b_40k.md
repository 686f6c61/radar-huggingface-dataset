# Low101/diffusion_bsp_parcel_b_40k

## Resumen

`diffusion_bsp_parcel_b_40k` es una política de imitación para robótica manipulativa desarrollada por el usuario Low101, publicada bajo licencia Apache 2.0 y orientada al brazo robótico de bajo coste LeRobot SO-101. El modelo resuelve una tarea concreta de clasificación de paquetes: coger un paquete de un montón, girarlo si la etiqueta está hacia arriba y empujarlo fuera de la mesa con la etiqueta hacia abajo. Se trata de un fine-tuning del checkpoint `Low101/diffusion_parcel_b_80k` sobre el conjunto de datos B (99 demostraciones, 73.444 fotogramas) durante 40.000 pasos.

La innovación principal es la arquitectura Diffusion-BSP (B-spline Policy, arXiv:2607.09648): en lugar de predecir chunks de acciones discretas, el modelo genera segmentos de curvas B-spline definidos por 16 filas de nudos temporales y los puntos de control de las 6 articulaciones. Esto permite ejecutar el brazo a mayor velocidad que las demostraciones originales (hasta 1,5×) manteniendo suavidad en la trayectoria. El modelo tiene 102.287.751 parámetros y un tamaño de repositorio de 0,4 GB en formato safetensors.

Es relevante como ejemplo práctico de aplicación de diffusion policies a robótica de bajo coste con hardware consumer (se entrenó en una GPU de portátil con 6 GB de VRAM) y como punto de partida para fine-tuning en tareas de manipulación similares. No obstante, está fuertemente sobreajustado a un único escenario físico (bandeja, cámaras, iluminación y paquetes propios del autor), por lo que su utilidad directa fuera de ese entorno es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy con salidas B-spline (B-spline Policy, arXiv:2607.09648) |
| Parametros totales | 102.287.751 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se menciona exportación TensorRT FP16 para inferencia) |
| Idiomas soportados | no disponible (la entrada de tarea es texto en inglés: "sort the parcel so the label faces down and push it off the table") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de Diffusion Policy aplicado a control robótico, con una modificación clave: en lugar de predecir secuencias de acciones discretas (action chunks), genera los parámetros de curvas B-spline. La salida son 16 filas que contienen un tiempo de nudo y los puntos de control de las 6 articulaciones del SO-101, lo que permite al ejecutor del repositorio reconstruir trayectorias continuas y suaves. La entrada combina tres cámaras (superior a 848×480, muñeca y lateral a 640×480, todas a 30 fps), el estado de las 6 articulaciones y un texto de tarea. El apilado de imágenes de Diffusion requiere un redimensionado previo por cámara, implementado mediante `patch_diffusion()` en `parcel_vla/training/train_mixed.py`.

El entrenamiento se realizó durante 40.000 pasos con batch de 16 sobre el dataset B (99 demostraciones, 73.444 fotogramas), partiendo del checkpoint `diffusion_parcel_b_80k`, en una GPU de portátil con 6 GB de VRAM y un tiempo total de 5,1 horas. La inferencia en el robot emplea DDIM con 5 pasos. No se especifica en la información disponible si hubo RLHF, DPO ni la composición detallada del dataset más allá del número de demostraciones y fotogramas.

## Capacidades

- Generación de trayectorias articulares continuas mediante curvas B-spline para el brazo SO-101 (6 articulaciones).
- Percepción visual multi-cámara: procesa simultáneamente tres vistas (superior, muñeca y lateral) a 30 fps.
- Condicionamiento por instrucción textual de tarea en inglés.
- Ejecución de una tarea compuesta de manipulación: pick, flip condicional según orientación de etiqueta y push fuera de la mesa.
- Control a velocidad superior a la de las demostraciones (hasta 1,5×) gracias a la representación B-spline.
- Inferencia rápida: 87 ms de planificación en el robot, reducible a 18 ms con exportación TensorRT FP16.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico; es una política de control motor, no un modelo de lenguaje.
- Capacidades multilingües: no aplica; la instrucción de tarea está en inglés.

## Casos de uso

- Clasificación automatizada de paquetes en líneas de envasado: el modelo ejecuta el ciclo completo de pick, orientación y push fuera de la mesa, adecuado para entornos donde la etiqueta debe quedar hacia abajo antes del siguiente proceso.
- Punto de partida para fine-tuning en tareas de manipulación propias: al estar publicado con licencia Apache 2.0 y pesos safetensors, puede reentrenarse sobre demostraciones del usuario con LeRobot en el commit `64b23178`.
- Validación de pipelines de Diffusion Policy con salidas B-spline: útil para investigadores que quieran reproducir o extender el método del paper arXiv:2607.09648 en otros brazos o tareas.
- Prototipado en robótica de bajo coste: se entrenó en una GPU de 6 GB, lo que lo hace accesible para laboratorios con hardware consumer y brazos SO-101.
- Pruebas de despliegue con TensorRT: la exportación FP16 a 18 ms de planificación permite evaluar latencias en lazo cerrado en el robot real.
- Benchmark de referencia para comparar políticas de imitación en tareas de sorting: sirve como baseline reproducible sobre el dataset B del proyecto.
- Demostración educativa de integración LeRobot + Diffusion Policy: el repositorio incluye scripts de entrenamiento, ejecución (`run_bsp_parcel.py`) y configuración de splines (`bsp.json`).

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Paquetes despejados | 5/5 en 86 s | Montón de 5 paquetes, velocidad 1,5×, una ejecución |
| Paquetes despejados sin ayuda | 3/5 | Misma ejecución |
| Tiempo de planificación en robot | 87 ms | Inferencia DDIM 5 pasos |
| Tiempo de planificación con TensorRT FP16 | 18 ms | Exportación TensorRT FP16 del repositorio |
| Tiempo de entrenamiento | 5,1 h | 40k pasos, batch 16, GPU portátil 6 GB |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de política robótica y no de un modelo de lenguaje. Los resultados de robot proceden de una única ejecución y el propio autor advierte que la mayoría de pruebas tienen pocos ensayos y un solo montón por modelo, por lo que son indicativos y no una comparación controlada.

## Requisitos de hardware

- VRAM de entrenamiento: 6 GB (GPU de portátil empleada por el autor).
- VRAM de inferencia: no disponible de forma explícita; con 102 M de parámetros en FP16 el peso ronda los 0,2 GB, por lo que cabe holgadamente en cualquier GPU consumer moderna, aunque no se documenta el consumo total incluyendo los tres flujos de cámara.
- GPU recomendadas: cualquier GPU con al menos 6 GB para reentrenamiento; para inferencia se sugiere una GPU con soporte TensorRT si se busca la latencia de 18 ms.
- Cabe en GPU consumer: sí, el autor entrenó en una GPU de portátil de 6 GB.
- Opciones de despliegue: ejecutor propio del repositorio (`parcel_vla/robot/run_bsp_parcel.py`); `lerobot-rollout` no puede ejecutarlo porque el modelo predice B-splines y no action chunks. Exportación TensorRT FP16 soportada por el repositorio.
- Latencia: 87 ms de planificación en el robot; 18 ms con TensorRT FP16. Throughput no disponible.
- Dependencia de software: LeRobot en el commit `64b23178` y el repositorio del proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_bsp_parcel_b_40k | 102.287.751 | 3 camaras + estado 6 articulaciones + texto | Sorting de paquetes con SO-101 | Apache 2.0 | Hugging Face (0 descargas) |
| diffusion_parcel_b_80k (modelo base) | no disponible | no disponible | Sorting de paquetes con SO-101 | no disponible | Hugging Face (referenciado como base) |
| Otras Diffusion Policies para SO-101 | no disponible | no disponible | Manipulacion robotica | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras políticas de imitación en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sobreajuste al escenario del autor: el modelo aprendió una única bandeja, poses de cámara, iluminación y paquetes fabricados por el propio autor; en otro montaje probablemente no funcione tal cual.
- Dataset pequeño: 99 demostraciones y 73.444 fotogramas, con un solo operador.
- Resultados de robot con pocos ensayos y un único montón por modelo; no constituyen una comparación controlada.
- Dependencia estricta del ejecutor del repositorio: no es compatible con `lerobot-rollout` estándar ni con herramientas genéricas de LeRobot.
- Requiere el commit exacto `64b23178` de LeRobot, lo que puede complicar la integración en pipelines actualizados.
- Las cámaras tienen resoluciones distintas y el redimensionado debe hacerse por cámara antes del apilado; un uso sin `patch_diffusion()` produce resultados incorrectos.
- Sin datos publicados sobre sesgos, tasa de alucinación (no aplica en el sentido de lenguaje, pero sí riesgo de fallo en la política) ni comportamiento fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero la utilidad práctica comercial está limitada por el sobreajuste al escenario.
- Sin métricas de robustez ante cambios de iluminación, oclusiones o variaciones en la pila de paquetes.
- La instrucción de tarea está en inglés; no se documenta soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/Low101/diffusion_bsp_parcel_b_40k
- Modelo base: https://huggingface.co/Low101/diffusion_parcel_b_80k
- Repositorio GitHub: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm
- Página del proyecto: https://timeisgold5168.github.io/
- Paper B-spline Policy: arXiv:2607.09648
- Instalación del repositorio: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm#installation

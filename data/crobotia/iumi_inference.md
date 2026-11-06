# Crobotia/iUMI_Inference

## Resumen

iUMI_Inference es un repositorio de inferencia y despliegue robótico publicado por Crobotia para su sistema iUMI de manipulación bimanual. No se trata de un modelo de lenguaje al uso, sino de un paquete que combina dos backends de política robótica (OpenPI π0.5 y FLUX), el código de servicio de política, las interfaces de robot, cámara y pinza, plantillas de configuración, scripts de lanzamiento y un URDF nominal de doble brazo. La tarea objetivo es `fold_the_clothes` sobre una plataforma Flexiv Rizon 4 con dos brazos y cámaras egocéntricas izquierda y derecha.

El repositorio incluye pesos de inferencia en formato safetensors (un checkpoint FLUX BF16 en el paso 14.418 y un checkpoint π0.5 de época 2 denominado `pi05_umi_v3`), junto con dos vídeos de demostración y una grabación completa de rollout por backend. El tamaño total del repositorio es de 23,7 GB, de los cuales aproximadamente 21,37 GB corresponden a ficheros de modelo y unos 2,35 GB a medios y datos de rollout.

Su relevancia actual radica en que expone públicamente un pipeline completo de despliegue bimanual sobre LeRobot v3, con contrato de entrada/salida documentado y datos de ejecución reales, lo que facilita la validación offline y la integración en laboratorios con hardware equivalente. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas robóticas sobre backends OpenPI (π0.5) y FLUX; no se detalla la arquitectura interna de cada red en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el chunk de acciones es de 32 pasos en FLUX y 50 pasos de modelo en π0.5) |
| Tipos de cuantizacion | no disponible (el checkpoint FLUX liberado es BF16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de transformer monolítica, sino un sistema de políticas de robot organizado en dos backends independientes. El backend FLUX consume ambas imágenes de muñeca y produce chunks de acción de 32 pasos a 30 Hz. El backend OpenPI π0.5 produce chunks de 50 pasos de modelo mediante una cabeza de 32 dimensiones rellenada a partir de objetivos UMI de 20 dimensiones, que un adaptador posterior restaura a poses objetivo de doble brazo. La representación interna UMI es de 20 dimensiones en total: 3 de traslación, 6 correspondientes a las dos primeras columnas de rotación y 1 de pinza por mano.

El estado y la acción registrados son de 16 dimensiones, ordenados izquierda y luego derecha, con cada mano codificada como `[x, y, z, qw, qx, qy, qz, gripper]` en metros, cuaterniones `wxyz` y grados de pinza. La procedencia de las poses registradas es `robot_fk_cad`. El checkpoint FLUX liberado es la exportación de inferencia BF16 del paso 14.418 y π0.5 corresponde al checkpoint de época 2 `pi05_umi_v3`. La model card indica explícitamente que no se suministra el inventario completo del corpus de entrenamiento, la definición de splits ni la configuración exacta de ejecución, por lo que no es posible reconstruir el entrenamiento a partir de los artefactos publicados.

## Capacidades

- Inferencia de políticas bimanuales para la tarea de plegado de ropa (`fold_the_clothes`) sobre una plataforma Flexiv Rizon 4 con dos brazos.
- Consumo conjunto de dos imágenes de muñeca (izquierda y derecha), poses previas y actuales y texto de tarea como entrada.
- Generación de chunks de acción: 32 pasos a 30 Hz en FLUX y 50 pasos de modelo en π0.5.
- Restauración de predicciones a poses objetivo de robot mediante un adaptador específico.
- Grabación de estados, acciones, datos articulares, IMU bilateral, calibración y registros H5 de robot.
- Soporte de formato LeRobot v3 para los datos de rollout, con raíces independientes por backend.
- Interfaz de servicio de política, robot, cámara y pinza implementada en `flexiv-umi-infer/`.
- Idiomas de documentación y etiquetado: inglés y chino.
- No se declaran capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento tipo thinking.

## Casos de uso

- Investigación en plegado de ropa bimanual: el repositorio proporciona checkpoints de inferencia y código de despliegue listos para replicar la tarea `fold_the_clothes` en una celda Flexiv Rizon 4 con cámaras de muñeca, lo que permite estudiar la política sin partir de cero.
- Validación offline de políticas: los rollouts completos incluidos (6.540 fotogramas para π0.5 y 30.619 para FLUX) permiten comparar predicciones del modelo con ejecuciones reales registradas a 30 Hz antes de tocar hardware.
- Integración en pipelines LeRobot v3: los datos de rollout se estructuran como raíces LeRobot v3 independientes, de modo que pueden cargarse con las herramientas estándar del ecosistema para análisis, reentrenamiento o evaluación.
- Despliegue en laboratorio con hardware equivalente: los scripts `run_flux_server.sh`, `run_pi05_server.sh` y `run_robot.sh` permiten levantar el servicio de política y el agente de robot, con modo dry run por defecto para pruebas sin riesgo.
- Estudio de representaciones UMI: la conversión entre la representación interna de 20 dimensiones y el estado/acción de 16 dimensiones documentada en `docs/INFERENCE_CONTRACT.md` sirve para investigar contratos de entrada/salida en manipulación bimanual.
- Verificación de infraestructura de grabación: el código de `flexiv-umi-infer/` registra estados, acciones, IMU bilateral y calibración, útil para construir datasets propios con el mismo esquema.
- Análisis comparativo de backends: disponer de dos políticas (FLUX y π0.5) sobre la misma tarea y plataforma permite comparar latencia, duración de rollout y comportamiento cualitativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que hay un único ejemplo por modelo, sin protocolo de benchmark, sin medición de éxito de tarea y sin control de calidad completo del movimiento. Los únicos datos cuantitativos publicados son de duración y volumen de las grabaciones:

| Backend | Fotogramas a 30 Hz | Duración de grabación | Vídeo de presentación |
|---|---:|---:|---|
| OpenPI π0.5 | 6.540 | 218 s | 4 min 15,4 s |
| FLUX | 30.619 | 1.020,633 s | 4 min 29,7 s |
| Total | 37.159 | 20 min 38,6 s | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 23,7 GB, de los cuales unos 21,37 GB son ficheros de modelo, pero no se desglosa el tamaño por checkpoint ni se indica VRAM necesaria.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: servicio de política lanzado con `scripts/run_flux_server.sh` (FLUX) y `scripts/run_pi05_server.sh` (OpenPI), más agente de robot con `scripts/run_robot.sh`. Para OpenPI se requiere Linux con glibc ≥ 2.31 y Python 3.12, gestionado con `uv sync --frozen --python 3.12` desde `openpi-umi/`.
- Entornos separados: la model card recomienda usar entornos distintos para cada backend de modelo y seguir las instrucciones de dependencias de cada proyecto.
- Latencia y throughput: no disponibles. Solo se conoce la frecuencia de las grabaciones (30 Hz) y su duración, no métricas de inferencia.
- Requisitos adicionales de despliegue físico: encoders, SDKs de proveedor, calibración de la celda y validación in situ.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de política bimanual comparables ni datos de rendimiento que permitan establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se suministra el inventario completo del corpus de entrenamiento, la definición de splits ni la configuración exacta de ejecución, por lo que no es posible reproducir el entrenamiento.
- Los lanzadores por defecto no constituyen una receta de reproducción exacta de los vídeos: no se proporcionan los hashes exactos de los checkpoints ni los ajustes de muestreo usados en las grabaciones, ni el mapeo de fotogramas entre las ediciones de presentación y los datasets.
- Solo hay un ejemplo de rollout por modelo, sin protocolo de benchmark, sin medición de éxito de tarea y sin control de calidad completo del movimiento.
- La carga no vuelve a ejecutar inferencia en GPU ni el robot; el despliegue físico exige encoders, SDKs de proveedor, calibración de dispositivos, restricciones de espacio de trabajo y validación in situ.
- Las poses registradas proceden de `robot_fk_cad`; las poses ópticas de cámara, las poses de brida del robot y las representaciones relativas del modelo requieren conversión explícita.
- El significado de acción en los rollouts es `action_mode=next_state` (`action[t] = observation.state[t+1]`, excluyendo el último fotograma), no predicciones brutas de la política; interpretarlo como tales induce a error.
- El script de robot arranca por defecto en modo dry run; hay que configurar rutas de recursos del modelo y calibración de celda antes de lanzar.
- La licencia Apache 2.0 permite uso comercial, pero el sistema depende de SDKs de proveedor y hardware específico cuyas licencias son independientes.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas más allá de los idiomas declarados (en, zh).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Crobotia/iUMI_Inference
- Árbol de ficheros: https://huggingface.co/Crobotia/iUMI_Inference/tree/main
- Vídeo demo OpenPI π0.5: https://huggingface.co/Crobotia/iUMI_Inference/resolve/main/demos/openpi_fold_demo.mp4
- Vídeo demo FLUX: https://huggingface.co/Crobotia/iUMI_Inference/resolve/main/demos/flux_fold_demo.mp4
- Rollout OpenPI π0.5: `rollout_data/openpi_pi05/` (dentro del repositorio)
- Rollout FLUX: `rollout_data/flux/` (dentro del repositorio)
- Guía de rollouts: `rollout_data/README.md` (dentro del repositorio)
- Guía de demos: `demos/README.md` (dentro del repositorio)
- Contrato de inferencia: `docs/INFERENCE_CONTRACT.md` (dentro del repositorio)
- Validación de rollouts: `docs/ROLLOUT_VALIDATION.md` (dentro del repositorio)
- Alcance de validación: `docs/VALIDATION.md` (dentro del repositorio)
- README en chino: `README_ZH.md` (dentro del repositorio)

# gyuz/2026_ETRI_Autonomous_Driving_Challenge

## Resumen

Este repositorio contiene los checkpoints de entrenamiento del modelo VAD/LAW (Vectorized Autonomous Driving / Learning to Adapt for World modeling) desarrollado por el usuario `gyuz` para el desafío ETRI E2E Driving Challenge 2026. Se trata de un sistema de conducción autónoma end-to-end que combina percepción vectorizada, modelado del mundo y planificación de trayectorias, basado en la arquitectura VAD-tiny con la extensión LAW (world model). El repositorio incluye cuatro checkpoints que cubren desde el preentrenamiento en nuScenes hasta el entrenamiento en dos etapas sobre el dataset ETRI, con una configuración específica de split de escenas (301/75) y frecuencias de anotación de ego-motion (2Hz y 10Hz).

La relevancia de este modelo radica en que aborda el problema de la conducción autónoma de extremo a extremo, integrando detección de objetos, predicción de movimiento de agentes, mapeo vectorizado y planificación de trayectorias en un único pipeline. El checkpoint de stage2 incorpora una corrección del "target point" mediante atención condicionada, dropout y ruido, junto con refinamiento residual en el espacio BEV, lo que representa una innovación técnica para mitigar el atajo de aprendizaje en la predicción de puntos objetivo. El repositorio está pensado para reproducir los experimentos del desafío, con los configs exactos utilizados en cada ejecución disponibles en el repositorio de GitHub asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAD-tiny + LAW (perception-based), con refinamiento BEV residual |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en formato .pth, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de vision/planificacion, sin procesamiento de lenguaje) |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VAD (Vectorized Autonomous Driving) en su variante "tiny", que procesa datos de sensores (camaras, LiDAR) y mapas vectorizados para producir detecciones, predicciones de movimiento de agentes y mapas de ocupacion. La extension LAW (Learning to Adapt for World modeling) anade un componente de modelado del mundo que se preentrena en nuScenes con perdidas conjuntas de deteccion, mapa y waypoints (`L_agent` + `L_map` + `loss_rec` + `loss_waypoint`). Este preentrenamiento se utiliza como inicializacion (`load_from`) para los entrenamientos posteriores en el dataset ETRI, de forma analoga a como ResNet50 se usa como backbone en vision por computador.

El entrenamiento se divide en dos etapas. La etapa 1 (stage1) entrena el modelo VAD-tiny con perdidas de deteccion, movimiento de agentes y mapa, pero con la perdida de planificacion desactivada (planning loss = 0). Se realizan dos variantes: una con el dataset completo de 376 escenas a 10Hz de anotaciones de ego-motion (48 epocas) y otra con un split de 301/75 escenas a 2Hz (48 epocas). La etapa 2 (stage2) anade la planificacion con una correccion del "target point": atencion condicionada al punto objetivo (`target_point_mode='both'`), corrupcion del mismo mediante dropout (0.1) y ruido gaussiano (std=0.2), y refinamiento residual de waypoints en el espacio BEV (`bev_residual_refine=True`). Esta etapa se entrena durante 12 epocas sobre el split 301/75 a 2Hz, inicializada desde el checkpoint de stage1 correspondiente.

## Capacidades

- Percepcion de entorno: deteccion de objetos (vehiculos, peatones, etc.) a partir de sensores y mapas vectorizados.
- Prediccion de movimiento de agentes: estimacion de trayectorias futuras de otros actores en la escena.
- Mapeo vectorizado: construccion de representaciones de carriles, bordes y senales a partir de datos de mapa.
- Planificacion de trayectorias: generacion de waypoints de ego-vehiculo para conduccion autonoma.
- Modelado del mundo: capacidad de predecir estados futuros del entorno gracias al preentrenamiento LAW.
- Correccion de atajos de aprendizaje: el stage2 implementa tecnicas de regularizacion sobre el target point para evitar que el modelo aprenda atajos espurios.

## Casos de uso

- Investigacion en conduccion autonoma end-to-end: el modelo sirve como base para estudiar la integracion de percepcion, prediccion y planificacion en un unico pipeline, especialmente en el contexto del desafio ETRI 2026.
- Evaluacion de tecnicas de regularizacion en planificacion: el checkpoint de stage2 con la correccion del target point permite analizar el impacto de la atencion condicionada y la corrupcion en la robustez de la prediccion de trayectorias.
- Reproduccion de experimentos: los configs asociados en el repositorio de GitHub permiten reproducir exactamente los entrenamientos y comparar resultados con otras variantes.
- Preentrenamiento para otros datasets: el checkpoint `law_pretrained_nus.pth` puede utilizarse como inicializacion para tareas de percepcion y planificacion en otros entornos urbanos.
- Desarrollo de sistemas de asistencia a la conduccion: las capacidades de prediccion de movimiento y planificacion pueden adaptarse para funciones de ADAS en vehiculos reales.
- Benchmarking de modelos de conduccion: el repositorio proporciona checkpoints con configuraciones claras (split, frecuencia, epocas) que permiten comparar el rendimiento de VAD/LAW frente a otras arquitecturas en el desafio ETRI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion (como L2 error, collision rate, etc.) ni comparaciones con otros modelos. Se recomienda consultar el repositorio de GitHub asociado para posibles resultados de validacion.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio es de 1.9 GB, lo que sugiere que los checkpoints son de un modelo relativamente pequeno (VAD-tiny), pero no se especifica el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. Dado que es un modelo de vision por computador con procesamiento de mapas, se espera que requiera al menos una GPU con 8-16 GB de VRAM, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido del modelo, pero no confirmado.
- Opciones de despliegue: no disponible. No se mencionan frameworks de inferencia como vLLM, llama.cpp u Ollama; el formato .pth sugiere uso con PyTorch directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de conduccion autonoma end-to-end (como UniAD, VAD original, o modelos de planificacion pura). El repositorio no proporciona datos de rendimiento ni referencias a otros trabajos. Se recomienda consultar la literatura sobre VAD y LAW para establecer comparaciones.

## Limitaciones y advertencias

- Licencia "other" no especificada: no se detallan las condiciones de uso, lo que puede limitar su aplicacion comercial o incluso academica. Se debe contactar con el autor para aclarar los terminos.
- Sin informacion sobre sesgos: al ser un modelo de conduccion, podria presentar sesgos en la deteccion de ciertos tipos de agentes o condiciones climaticas, pero no hay datos al respecto.
- Riesgo de alucinacion en planificacion: como cualquier modelo de generacion de trayectorias, puede producir waypoints no seguros en situaciones fuera de distribucion.
- Limitaciones de contexto: el modelo esta entrenado en el dataset ETRI (376 escenas) y nuScenes, por lo que su generalizacion a otros entornos o condiciones no esta garantizada.
- Dependencia de la calidad de las anotaciones: el rendimiento depende de la precision de las anotaciones de ego-motion (2Hz o 10Hz) y de los mapas vectorizados.
- Sin soporte de lenguaje: el modelo no procesa texto ni instrucciones verbales, solo datos visuales y de mapa.
- Repositorio sin mantenimiento activo: la fecha de creacion es agosto de 2026 y no hay indicios de actualizaciones posteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gyuz/2026_ETRI_Autonomous_Driving_Challenge
- Repositorio GitHub (codigo de entrenamiento/evaluacion): https://github.com/gyuz1/2026_Etri_challenge
  - Rama `LAW-split`: https://github.com/gyuz1/2026_Etri_challenge/tree/LAW-split
  - Rama `LAW-fulldata`: https://github.com/gyuz1/2026_Etri_challenge/tree/LAW-fulldata
- Documentacion del desafio ETRI (referencia externa): https://deepwiki.com/mxnseo/Autonomous_Driving_AI_Chanllenge_26/1.2-getting-started:-training-and-inference
